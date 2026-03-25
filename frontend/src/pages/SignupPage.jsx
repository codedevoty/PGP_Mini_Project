import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

export default function SignupPage() {
  const [form, setForm] = useState({ userName: '', email: '', password: '', confirmPassword: '', role: 'OWNER' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userName || !form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authAPI.signup({ userName: form.userName, email: form.email, password: form.password, role: form.role });
      toast.success('Signup successful! Check your email for verification and credentials.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 left-1/4 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl"></div>

      <div className="glass-card p-8 md:p-10 w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold font-display mb-2">Create Account</h1>
          <p className="text-gray-400 text-sm">Sign up to digitize your restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Username</label>
            <input type="text" className="input-field" placeholder="Choose a username" value={form.userName} onChange={(e) => setForm({...form, userName: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email</label>
            <input type="email" className="input-field" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} className="input-field pr-12" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Confirm Password</label>
            <input type="password" className="input-field" placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {['OWNER', 'CUSTOMER'].map(role => (
                <button type="button" key={role} onClick={() => setForm({...form, role})}
                  className={`py-2.5 rounded-xl font-medium text-sm border transition-all ${form.role === role ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                  {role === 'OWNER' ? '🍽️ Restaurant Owner' : '👤 Customer'}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 !mt-6">
            {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> : <><UserPlus className="w-5 h-5" /> Create Account</>}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}
