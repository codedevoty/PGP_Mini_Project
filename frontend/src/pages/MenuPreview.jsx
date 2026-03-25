import { useState, useEffect } from 'react';
import { Eye, Palette, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { menuAPI, restaurantAPI } from '../services/api';
import { Sidebar } from './Dashboard';

const THEMES = [
  { id: 'LIGHT', name: 'Light Elegant', bg: 'bg-white', text: 'text-gray-900', card: 'bg-gray-50 border-gray-200', accent: 'text-orange-600' },
  { id: 'DARK', name: 'Dark Premium', bg: 'bg-gray-900', text: 'text-white', card: 'bg-gray-800 border-gray-700', accent: 'text-orange-400' },
  { id: 'MINIMAL', name: 'Minimal Clean', bg: 'bg-neutral-50', text: 'text-neutral-800', card: 'bg-white border-neutral-200', accent: 'text-neutral-600' },
  { id: 'PREMIUM', name: 'Premium Gold', bg: 'bg-stone-900', text: 'text-amber-50', card: 'bg-stone-800 border-amber-900/30', accent: 'text-amber-400' },
];

export default function MenuPreview() {
  const { user } = useAuth();
  const [menuData, setMenuData] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('DARK');
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user?.restaurantId) loadMenu(); }, [user]);

  const loadMenu = async () => {
    try {
      const res = await menuAPI.getPublicMenu(user.restaurantId);
      const data = res.data.data;
      setRestaurant(data.restaurant);
      setMenuData(data.menu || []);
      setSelectedTheme(data.restaurant?.menuTheme || 'DARK');
    } catch (err) { toast.error('Failed to load menu'); }
    setLoading(false);
  };

  const handleThemeChange = async (themeId) => {
    setSelectedTheme(themeId);
    try {
      await restaurantAPI.update(user.restaurantId, { menuTheme: themeId });
      toast.success('Theme saved!');
    } catch (err) { }
  };

  const theme = THEMES.find(t => t.id === selectedTheme) || THEMES[1];

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar active="/preview" />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-2"><Eye className="w-7 h-7" /> Menu Preview</h1>
            <p className="text-gray-400 mt-1">Preview your menu as customers will see it</p>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="glass-card p-5 mb-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Palette className="w-5 h-5 text-primary-400" /> Select Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => handleThemeChange(t.id)}
                className={`p-3 rounded-xl border-2 transition-all ${selectedTheme === t.id ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-white/10 hover:border-white/20'}`}>
                <div className={`h-16 rounded-lg ${t.bg} mb-2 flex items-center justify-center`}>
                  <span className={`text-xs font-bold ${t.text}`}>Aa</span>
                </div>
                <span className="text-xs font-medium">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Preview */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3 justify-center text-gray-400">
              <Smartphone className="w-4 h-4" />
              <span className="text-sm">Mobile Preview</span>
            </div>
            <div className={`rounded-3xl border-4 border-gray-700 overflow-hidden shadow-2xl ${theme.bg} min-h-[600px]`}>
              {/* Restaurant Header */}
              <div className="p-5 border-b border-gray-200/10 text-center">
                <h2 className={`text-xl font-bold font-display ${theme.text}`}>{restaurant?.name || 'Your Restaurant'}</h2>
                <p className={`text-xs mt-1 opacity-60 ${theme.text}`}>{restaurant?.cuisineTypes?.join(' • ')}</p>
                <p className={`text-xs mt-0.5 opacity-40 ${theme.text}`}>{restaurant?.openingTime} - {restaurant?.closingTime}</p>
              </div>

              {/* Menu Content */}
              <div className="p-4 space-y-6">
                {loading ? (
                  <div className="text-center py-10"><div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full mx-auto"></div></div>
                ) : menuData.length === 0 ? (
                  <p className={`text-center text-sm opacity-50 py-10 ${theme.text}`}>No menu items yet. Add categories and dishes first.</p>
                ) : menuData.map((cat, i) => (
                  <div key={i}>
                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${theme.accent}`}>{cat.category?.name}</h3>
                    <div className="space-y-2">
                      {cat.dishes?.map((dish, j) => (
                        <div key={j} className={`rounded-xl p-3 border ${theme.card} flex gap-3`}>
                          {dish.imageUrl && <img src={dish.imageUrl} alt={dish.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className={`text-sm font-semibold ${theme.text}`}>{dish.name}</span>
                                <div className="flex gap-1 mt-0.5 flex-wrap">
                                  {dish.tags?.map(tag => (
                                    <span key={tag} className="text-[8px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">{tag.replace(/_/g, ' ')}</span>
                                  ))}
                                </div>
                              </div>
                              <span className={`text-sm font-bold ${theme.accent} flex-shrink-0`}>₹{dish.price}</span>
                            </div>
                            {dish.description && <p className={`text-[10px] mt-1 opacity-50 ${theme.text}`}>{dish.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
