import { useState, useEffect } from 'react';
import { QrCode, Plus, Printer, Download, Trash2, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { tableAPI } from '../services/api';
import { Sidebar } from './Dashboard';

export default function TableManager() {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [numberOfTables, setNumberOfTables] = useState(1);
  const [loading, setLoading] = useState(true);
  const [qrImages, setQrImages] = useState({});
  const [generatingQr, setGeneratingQr] = useState(null);

  const restaurantId = user?.restaurantId;

  useEffect(() => { if (restaurantId) loadTables(); }, [restaurantId]);

  const loadTables = async () => {
    try {
      const res = await tableAPI.getAll(restaurantId);
      setTables(res.data.data || []);
    } catch (err) { toast.error('Failed to load tables'); }
    setLoading(false);
  };

  const handleCreateTables = async () => {
    if (numberOfTables < 1) return toast.error('Enter valid number');
    try {
      await tableAPI.create(restaurantId, numberOfTables);
      toast.success(`${numberOfTables} table(s) created!`);
      setNumberOfTables(1);
      loadTables();
    } catch (err) { toast.error('Failed to create tables'); }
  };

  const generateQr = async (tableNumber) => {
    setGeneratingQr(tableNumber);
    try {
      const res = await tableAPI.getQrBase64(restaurantId, tableNumber);
      setQrImages(prev => ({ ...prev, [tableNumber]: res.data.data }));
    } catch (err) { toast.error('Failed to generate QR'); }
    setGeneratingQr(null);
  };

  const handlePrintQr = (tableNumber) => {
    const base64 = qrImages[tableNumber];
    if (!base64) return toast.error('Generate QR first');
    const w = window.open();
    w.document.write(`
      <html><head><title>Table ${tableNumber} QR Code</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Arial,sans-serif;}
      img{width:300px;height:300px;} h1{margin-bottom:10px;} p{color:#666;}</style></head>
      <body><h1>Table ${tableNumber}</h1><img src="data:image/png;base64,${base64}" /><p>Scan to view menu & order</p>
      <script>setTimeout(()=>window.print(),500)</script></body></html>`);
  };

  const handleDeleteTable = async (tableId) => {
    if (!confirm('Delete this table?')) return;
    try {
      await tableAPI.delete(tableId);
      toast.success('Table deleted');
      loadTables();
    } catch (err) { toast.error('Failed to delete table'); }
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar active="/tables" />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-2"><QrCode className="w-7 h-7" /> Tables & QR Codes</h1>
          <p className="text-gray-400 mt-1">Manage your tables and generate QR codes for each</p>
        </div>

        {/* Add Tables */}
        <div className="glass-card p-5 mb-6">
          <h3 className="font-semibold mb-3">Add Tables</h3>
          <div className="flex items-end gap-4">
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Number of tables to add</label>
              <input type="number" min="1" className="input-field w-40" value={numberOfTables} onChange={(e) => setNumberOfTables(parseInt(e.target.value) || 1)} />
            </div>
            <button onClick={handleCreateTables} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Create Tables
            </button>
          </div>
        </div>

        {/* Tables Grid */}
        {loading ? (
          <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div></div>
        ) : tables.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-500 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Tables Yet</h3>
            <p className="text-gray-400">Add tables above to generate QR codes</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map(table => {
              const tableId = table.id || table._id;
              return (
                <div key={tableId} className="glass-card p-5 text-center hover:bg-white/10 transition-all">
                  <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-xl font-bold mb-3 ${table.occupied ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {table.tableNumber}
                  </div>
                  <div className="text-sm font-semibold mb-1">Table {table.tableNumber}</div>
                  <span className={`badge ${table.occupied ? 'badge-red' : 'badge-green'} mb-3`}>
                    {table.occupied ? 'Occupied' : 'Available'}
                  </span>

                  {qrImages[table.tableNumber] ? (
                    <div className="mb-3">
                      <img src={`data:image/png;base64,${qrImages[table.tableNumber]}`} alt={`Table ${table.tableNumber} QR`} className="w-32 h-32 mx-auto rounded-lg" />
                    </div>
                  ) : (
                    <button onClick={() => generateQr(table.tableNumber)} disabled={generatingQr === table.tableNumber}
                      className="btn-secondary text-xs w-full mb-2 flex items-center justify-center gap-1">
                      {generatingQr === table.tableNumber ? <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div> : <><QrCode className="w-3.5 h-3.5" /> Generate QR</>}
                    </button>
                  )}

                  <div className="flex gap-2">
                    {qrImages[table.tableNumber] && (
                      <button onClick={() => handlePrintQr(table.tableNumber)} className="flex-1 btn-primary text-xs !py-2 flex items-center justify-center gap-1">
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                    )}
                    <button onClick={() => handleDeleteTable(tableId)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
