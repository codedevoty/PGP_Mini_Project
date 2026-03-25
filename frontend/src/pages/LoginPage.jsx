import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ userName: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userName || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const data = res.data;
      login({
        userName: data.userName,
        email: data.email,
        userId: data.userId,
        roles: data.roles,
        restaurantId: data.restaurantId,
      }, data.token);
      toast.success('Login successful!');
      if (data.restaurantId) {
        navigate('/dashboard');
      } else {
        navigate('/setup');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl"></div>

      <div className="glass-card p-8 md:p-10 w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold font-display mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Login to manage your restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Username</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your username"
              value={form.userName}
              onChange={(e) => setForm({...form, userName: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded bg-white/10 border-white/20" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300">Forgot Password?</Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5">
            {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> : <><LogIn className="w-5 h-5" /> Login</>}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don't have an account? <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
