import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Clock, CheckCircle, ChefHat, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { Sidebar } from './Dashboard';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';

const STATUS_CONFIG = {
  PENDING: { color: 'badge-yellow', icon: Clock, label: 'Pending' },
  PREPARING: { color: 'badge-blue', icon: ChefHat, label: 'Preparing' },
  SERVED: { color: 'badge-green', icon: CheckCircle, label: 'Served' },
  CANCELLED: { color: 'badge-red', icon: AlertCircle, label: 'Cancelled' },
};

export default function LiveOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const stompClientRef = useRef(null);

  const restaurantId = user?.restaurantId;

  const loadOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await orderAPI.getLive(restaurantId);
      setOrders(res.data.data || []);
    } catch (err) { /* silent */ }
    setLoading(false);
    setRefreshing(false);
  }, [restaurantId]);

  // WebSocket connection for real-time order push
  useEffect(() => {
    if (!restaurantId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setWsConnected(true);
        // Subscribe to order updates for this restaurant
        client.subscribe(`/topic/orders/${restaurantId}`, (message) => {
          try {
            const newOrder = JSON.parse(message.body);
            setOrders(prev => {
              const existingIdx = prev.findIndex(o => (o.id || o._id) === (newOrder.id || newOrder._id));
              if (existingIdx >= 0) {
                // Update existing order (status change)
                const updated = [...prev];
                updated[existingIdx] = newOrder;
                return updated;
              } else {
                // New order — add to top
                toast.success(`🔔 New order from Table ${newOrder.tableNumber}!`, { duration: 5000 });
                return [newOrder, ...prev];
              }
            });
          } catch (e) { /* parsing error, ignore */ }
        });
      },
      onDisconnect: () => setWsConnected(false),
      onStompError: () => setWsConnected(false),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client.active) client.deactivate();
    };
  }, [restaurantId]);

  // Initial load + fallback polling (every 30s if WebSocket is connected, 10s otherwise)
  useEffect(() => {
    if (restaurantId) {
      loadOrders();
      const interval = setInterval(() => loadOrders(), wsConnected ? 30000 : 10000);
      return () => clearInterval(interval);
    }
  }, [restaurantId, loadOrders, wsConnected]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      // WebSocket will push the update; fallback reload
      if (!wsConnected) loadOrders();
    } catch (err) { toast.error('Failed to update status'); }
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar active="/orders" />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-2"><Bell className="w-7 h-7" /> Live Orders</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              Real-time order feed from your customers
              {wsConnected ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><Wifi className="w-3 h-3" /> Live</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500"><WifiOff className="w-3 h-3" /> Polling</span>
              )}
            </p>
          </div>
          <button onClick={() => loadOrders(true)} className={`btn-secondary text-sm flex items-center gap-2 ${refreshing ? 'opacity-50' : ''}`}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['ALL', 'PENDING', 'PREPARING', 'SERVED', 'CANCELLED'].map(status => (
            <button key={status} onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === status ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
              {status === 'ALL' ? `All (${orders.length})` : `${status} (${orders.filter(o => o.status === status).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div></div>
        ) : filteredOrders.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-500 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Orders</h3>
            <p className="text-gray-400">{filter === 'ALL' ? 'Orders will appear here when customers place them' : `No ${filter.toLowerCase()} orders`}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => {
              const orderId = order.id || order._id;
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              return (
                <div key={orderId} className={`glass-card p-5 animate-slide-up ${order.status === 'PENDING' ? 'border-yellow-500/30 animate-glow' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold">
                        {order.tableNumber}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Table {order.tableNumber}</div>
                        <div className="text-xs text-gray-500">{formatTime(order.orderTime)}</div>
                      </div>
                    </div>
                    <span className={`badge ${statusCfg.color}`}>{statusCfg.label}</span>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-3">
                    {order.items?.map((item, j) => (
                      <div key={j} className="flex items-center justify-between bg-white/5 rounded-lg p-2.5 text-sm">
                        <div>
                          <span className="font-medium">{item.dishName}</span>
                          <span className="text-gray-400 ml-1">×{item.quantity}</span>
                          {item.notes && <div className="text-xs text-accent-400 mt-0.5">📝 {item.notes}</div>}
                          {item.selectedCustomizations?.length > 0 && (
                            <div className="text-[10px] text-gray-500 mt-0.5">{item.selectedCustomizations.join(', ')}</div>
                          )}
                        </div>
                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-2.5 text-xs text-accent-400 mb-3">
                      💬 {order.specialInstructions}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="font-bold">₹{order.totalAmount}</span>
                    <div className="flex gap-2">
                      {order.status === 'PENDING' && (
                        <button onClick={() => handleStatusUpdate(orderId, 'PREPARING')} className="btn-primary text-xs !py-1.5 !px-3">
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button onClick={() => handleStatusUpdate(orderId, 'SERVED')} className="btn-accent text-xs !py-1.5 !px-3">
                          Mark Served
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
