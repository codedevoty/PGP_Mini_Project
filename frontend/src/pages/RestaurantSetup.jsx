import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, ChefHat, Building2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CUISINE_OPTIONS = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Continental', 'South Indian', 'North Indian', 'Mughlai', 'Street Food', 'Fast Food', 'Desserts', 'Beverages'];

export default function RestaurantSetup() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', address: '', phone: '', cuisineTypes: [], openingTime: '09:00', closingTime: '23:00', gstInfo: ''
  });

  const toggleCuisine = (cuisine) => {
    setForm(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine) ? prev.cuisineTypes.filter(c => c !== cuisine) : [...prev.cuisineTypes, cuisine]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.phone) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await restaurantAPI.create(form);
      const restaurant = res.data.data;
      updateUser({ restaurantId: restaurant.id });
      toast.success('Restaurant registered successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-2">Register Your Restaurant</h1>
          <p className="text-gray-400">Tell us about your restaurant to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6 animate-slide-up">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Restaurant Name *</label>
            <div className="relative">
              <ChefHat className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" className="input-field !pl-11" placeholder="Your Restaurant Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Address *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <textarea className="input-field !pl-11 min-h-[80px] resize-none" placeholder="Full address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="tel" className="input-field !pl-11" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Cuisine Types</label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map(c => (
                <button type="button" key={c} onClick={() => toggleCuisine(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${form.cuisineTypes.includes(c) ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1"><Clock className="w-4 h-4" /> Opening Time</label>
              <input type="time" className="input-field" value={form.openingTime} onChange={(e) => setForm({...form, openingTime: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1"><Clock className="w-4 h-4" /> Closing Time</label>
              <input type="time" className="input-field" value={form.closingTime} onChange={(e) => setForm({...form, closingTime: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">GST / Tax Info (Optional)</label>
            <input type="text" className="input-field" placeholder="GST Number" value={form.gstInfo} onChange={(e) => setForm({...form, gstInfo: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5">
            {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> : <>Register & Continue <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
