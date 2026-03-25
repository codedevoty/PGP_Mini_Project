import { useState, useEffect } from 'react';
import { Clock, DollarSign, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sessionAPI } from '../services/api';
import { Sidebar } from './Dashboard';

export default function OrderHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.restaurantId) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      const res = await sessionAPI.getAll(user.restaurantId);
      setSessions((res.data.data || []).sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
    } catch (err) { /* silent */ }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const totalRevenue = sessions.filter(s => s.paid).reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar active="/history" />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-2"><Clock className="w-7 h-7" /> Order History</h1>
          <p className="text-gray-400 mt-1">View past sessions and revenue</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <DollarSign className="w-6 h-6 text-emerald-400 mb-2" />
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Revenue</div>
          </div>
          <div className="stat-card">
            <CalendarDays className="w-6 h-6 text-blue-400 mb-2" />
            <div className="text-2xl font-bold">{completedSessions}</div>
            <div className="text-sm text-gray-400">Completed Sessions</div>
          </div>
          <div className="stat-card">
            <Clock className="w-6 h-6 text-accent-400 mb-2" />
            <div className="text-2xl font-bold">{sessions.length}</div>
            <div className="text-sm text-gray-400">Total Sessions</div>
          </div>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div></div>
        ) : sessions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-500 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No History Yet</h3>
            <p className="text-gray-400">Completed sessions will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, i) => {
              const sessionId = session.id || session._id;
              return (
                <div key={sessionId} className="glass-card p-5 flex items-center justify-between hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${session.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {session.tableNumber}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Table {session.tableNumber}</div>
                      <div className="text-xs text-gray-400">{formatDate(session.startTime)}</div>
                      {session.endTime && <div className="text-xs text-gray-500">Ended: {formatDate(session.endTime)}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{session.totalAmount?.toLocaleString() || 0}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge ${session.status === 'COMPLETED' ? 'badge-green' : 'badge-yellow'}`}>{session.status}</span>
                      {session.paid && <span className="badge badge-green">Paid</span>}
                      {session.paymentMethod && <span className="text-xs text-gray-500">{session.paymentMethod}</span>}
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
