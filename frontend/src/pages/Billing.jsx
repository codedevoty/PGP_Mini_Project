import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Smartphone, CheckCircle, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { sessionAPI, orderAPI, paymentAPI } from '../services/api';

export default function Billing() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => { loadBill(); }, [sessionId]);

  const loadBill = async () => {
    try {
      const [billRes, ordersRes] = await Promise.all([
        sessionAPI.getBill(sessionId),
        orderAPI.getBySession(sessionId),
      ]);
      const sessionData = billRes.data.data;
      setSession(sessionData);
      setOrders(ordersRes.data.data || []);
      if (sessionData.paid) setPaid(true);
    } catch (err) { toast.error('Failed to load bill'); }
    setLoading(false);
  };

  const handlePay = async () => {
    if (paymentMethod === 'CASH') {
      setPaying(true);
      try {
        await sessionAPI.pay(sessionId, 'CASH');
        setPaid(true);
        toast.success('Confirmed! Please pay at the counter.');
      } catch (err) { toast.error('Failed to confirm'); }
      setPaying(false);
      return;
    }

    // Online Payment via Razorpay
    setPaying(true);
    try {
      // 1. Create order on backend
      const res = await paymentAPI.createOrder({ amount: Math.round(total) });
      const { orderId, amount: rzpAmount, currency, keyId } = res.data.data;

      // 2. Configure Razorpay options
      const options = {
        key: keyId,
        amount: rzpAmount,
        currency: currency,
        name: 'Smart QR Restaurant',
        description: `Order Bill - Table ${session?.tableNumber}`,
        order_id: orderId,
        handler: async function (response) {
            try {
               await sessionAPI.pay(sessionId, 'ONLINE');
               setPaid(true);
               toast.success('Payment successful! 🎉');
            } catch (e) {
               toast.error('Payment verification failed on server');
            }
        },
        prefill: {
            name: "Customer",
        },
        theme: {
            color: "#f59e0b" // Match premium amber branding
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
         toast.error(response.error.description || 'Payment Failed');
      });
      rzp.open();

    } catch (err) {
      toast.error('Failed to initialize Razorpay Gateway');
    }
    setPaying(false);
  };

  const allItems = orders.flatMap(o => o.items || []);
  const subtotal = allItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + tax;

  const paymentMethods = [
    { id: 'ONLINE', icon: CreditCard, label: 'Pay Online', desc: 'Cards, UPI, Netbanking (Razorpay)' },
    { id: 'CASH', icon: Banknote, label: 'Pay Cash', desc: 'Pay at the counter' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="glass-card p-10 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold font-display mb-2">Payment Successful!</h1>
          <p className="text-gray-400 mb-4">Thank you for dining with us.</p>
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Total Paid</span><span className="font-bold text-emerald-400">₹{total.toFixed(0)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Method</span><span>{paymentMethod || session?.paymentMethod}</span></div>
          </div>
          <p className="text-gray-500 text-sm">Your session has been completed. We hope you enjoyed your meal! 🍽️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Receipt className="w-10 h-10 text-primary-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold font-display">Your Bill</h1>
          <p className="text-gray-400 text-sm">Table {session?.tableNumber}</p>
        </div>

        {/* Order Items */}
        <div className="glass-card p-5 mb-4">
          <h3 className="font-semibold text-sm mb-3 text-gray-300">Order Details</h3>
          <div className="space-y-2">
            {allItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                <div>
                  <span>{item.dishName}</span>
                  <span className="text-gray-500 ml-1">×{item.quantity}</span>
                  {item.notes && <div className="text-[10px] text-accent-400">📝 {item.notes}</div>}
                </div>
                <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">GST (5%)</span><span>₹{tax.toFixed(0)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
              <span>Total</span>
              <span className="text-primary-400">₹{total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="glass-card p-5 mb-4">
          <h3 className="font-semibold text-sm mb-3 text-gray-300">Payment Method</h3>
          <div className="space-y-2">
            {paymentMethods.map(pm => (
              <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${paymentMethod === pm.id ? 'bg-primary-500/10 border-primary-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === pm.id ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-gray-400'}`}>
                  <pm.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{pm.label}</div>
                  <div className="text-xs text-gray-500">{pm.desc}</div>
                </div>
                {paymentMethod === pm.id && <CheckCircle className="w-5 h-5 text-primary-400 ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <button onClick={handlePay} disabled={paying}
          className="btn-primary w-full flex items-center justify-center gap-2 !py-4 text-lg">
          {paying ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> : <><CreditCard className="w-5 h-5" /> Pay ₹{total.toFixed(0)}</>}
        </button>
      </div>
    </div>
  );
}
