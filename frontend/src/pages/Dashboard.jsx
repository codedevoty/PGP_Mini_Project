import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Utensils, Eye, QrCode, Bell, Clock, LogOut, ChefHat, TrendingUp, Users, DollarSign, ShoppingBag, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderAPI, sessionAPI, restaurantAPI } from '../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Utensils, label: 'Menu Manager', path: '/menu' },
  { icon: Eye, label: 'Preview Menu', path: '/preview' },
  { icon: QrCode, label: 'Tables & QR', path: '/tables' },
  { icon: Bell, label: 'Live Orders', path: '/orders' },
  { icon: Clock, label: 'Order History', path: '/history' },
];

export function Sidebar({ active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold font-display">SmartQR</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
            className={`sidebar-link ${active === item.path ? 'active' : ''}`}>
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-9 h-9 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold text-sm">
            {user?.userName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.userName}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-50 glass-card p-2">
        <Menu className="w-6 h-6" />
      </button>
      {/* Mobile overlay */}
      {mobileOpen && <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />}
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-dark-900 border-r border-white/10 flex flex-col transition-transform md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setMobileOpen(false)} className="md:hidden absolute top-4 right-4 text-gray-400">
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, activeTables: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (user?.restaurantId) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [ordersRes, sessionsRes] = await Promise.all([
        orderAPI.getLive(user.restaurantId),
        sessionAPI.getActive(user.restaurantId),
      ]);

      const orders = ordersRes.data.data || [];
      const sessions = sessionsRes.data.data || [];
      const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pending = orders.filter(o => o.status === 'PENDING').length;

      setStats({ totalOrders: orders.length, revenue, activeTables: sessions.length, pendingOrders: pending });
      setRecentOrders(orders.slice(0, 6));
    } catch (err) {
      // Dashboard data will be empty if no restaurant or no orders yet
    }
  };

  const statCards = [
    { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/10' },
    { icon: DollarSign, label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/10' },
    { icon: Users, label: 'Active Tables', value: stats.activeTables, color: 'text-accent-400', bg: 'from-accent-500/20 to-accent-600/10' },
    { icon: TrendingUp, label: 'Pending Orders', value: stats.pendingOrders, color: 'text-primary-400', bg: 'from-primary-500/20 to-primary-600/10' },
  ];

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar active="/dashboard" />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold font-display">Welcome back, {user?.userName} 👋</h1>
          <p className="text-gray-400 mt-1">Here's what's happening at your restaurant today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-12 h-12 bg-gradient-to-br ${s.bg} rounded-xl flex items-center justify-center ${s.color} mb-3`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link to="/menu" className="glass-card p-5 flex items-center gap-4 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold">Edit Menu</div>
              <div className="text-sm text-gray-400">Add or update dishes</div>
            </div>
          </Link>
          <Link to="/orders" className="glass-card p-5 flex items-center gap-4 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center text-accent-400 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold">View Orders</div>
              <div className="text-sm text-gray-400">Live order feed</div>
            </div>
          </Link>
          <Link to="/tables" className="glass-card p-5 flex items-center gap-4 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold">Generate QR</div>
              <div className="text-sm text-gray-400">Table QR codes</div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-display">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-primary-400 hover:text-primary-300">View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet. Share your QR codes to start receiving orders!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                  <div>
                    <div className="font-medium text-sm">Table {order.tableNumber}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{order.items?.map(it => `${it.dishName} ×${it.quantity}`).join(', ')}</div>
                    {order.specialInstructions && <div className="text-xs text-accent-400 mt-0.5">📝 {order.specialInstructions}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">₹{order.totalAmount}</div>
                    <span className={`badge ${order.status === 'PENDING' ? 'badge-yellow' : order.status === 'PREPARING' ? 'badge-blue' : 'badge-green'} mt-1`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
