import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Search, Filter, X, Send, ChefHat, Star, Flame, Leaf, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuAPI, sessionAPI, orderAPI, tableAPI } from '../services/api';

const TAG_ICONS = { VEG: '🟢', NON_VEG: '🔴', SPICY: '🌶️', TODAY_SPECIAL: '⭐', MOST_POPULAR: '🔥', CHEF_CHOICE: '👨‍🍳', MOST_ORDERED: '📊', JAIN: '🟢', OUR_SPECIALITY: '💎' };

export default function CustomerMenu() {
  const { restaurantId, tableNumber } = useParams();
  const navigate = useNavigate();
  const [menuData, setMenuData] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [session, setSession] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => { loadMenu(); startSession(); }, [restaurantId, tableNumber]);

  const loadMenu = async () => {
    try {
      const res = await menuAPI.getPublicMenu(restaurantId);
      const data = res.data.data;
      setRestaurant(data.restaurant);
      setMenuData(data.menu || []);
    } catch (err) { toast.error('Failed to load menu'); }
    setLoading(false);
  };

  const startSession = async () => {
    try {
      // Create session using table number instead of requiring an owner API call to get the DB Table ID
      const res = await sessionAPI.start({ tableId: tableNumber.toString(), tableNumber: parseInt(tableNumber), restaurantId });
      setSession(res.data.data);
    } catch (err) { /* Session will be created on first order */ }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) { setSearchResults(null); return; }
    try {
      const res = await menuAPI.searchDishes(restaurantId, query);
      setSearchResults(res.data.data || []);
    } catch (err) { }
  };

  const handleFilter = async (tag) => {
    if (activeFilter === tag) { setActiveFilter(null); setSearchResults(null); return; }
    setActiveFilter(tag);
    try {
      const res = await menuAPI.filterByTag(restaurantId, tag);
      setSearchResults(res.data.data || []);
    } catch (err) { }
  };

  const addToCart = (dish) => {
    const dishId = dish.id || dish._id;
    setCart(prev => {
      const existing = prev.find(item => item.dishId === dishId);
      if (existing) {
        return prev.map(item => item.dishId === dishId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { dishId, dishName: dish.name, price: dish.price, quantity: 1, notes: '', selectedCustomizations: [] }];
    });
    toast.success(`${dish.name} added to cart`);
  };

  const updateQuantity = (dishId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.dishId === dishId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const updateItemNotes = (dishId, notes) => {
    setCart(prev => prev.map(item => item.dishId === dishId ? { ...item, notes } : item));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    setPlacing(true);
    try {
      const tableId = tableNumber.toString();
      const sessionId = session ? (session.id || session._id) : '';

      await orderAPI.place({
        tableId,
        tableNumber: parseInt(tableNumber),
        restaurantId,
        sessionId,
        items: cart,
        specialInstructions,
      });
      toast.success('Order placed successfully! 🎉');
      setCart([]);
      setShowCart(false);
      setSpecialInstructions('');
    } catch (err) {
      toast.error('Failed to place order');
    }
    setPlacing(false);
  };

  const theme = restaurant?.menuTheme || 'DARK';
  const isDark = theme === 'DARK' || theme === 'PREMIUM';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardClass = isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200';
  const accentClass = theme === 'PREMIUM' ? 'text-amber-400' : 'text-primary-500';

  const displayDishes = searchResults || [];
  const showSearchResults = searchQuery || activeFilter;

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-xl border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold font-display">{restaurant?.name || 'Restaurant'}</h1>
              <p className={`text-xs ${subTextClass}`}>Table {tableNumber} • {restaurant?.cuisineTypes?.join(', ')}</p>
            </div>
            <button onClick={() => setShowCart(true)} className="relative p-2 rounded-xl bg-primary-500/20 text-primary-400">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subTextClass}`} />
            <input className={`w-full rounded-xl py-2.5 pl-10 pr-4 text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'} border focus:outline-none focus:ring-2 focus:ring-primary-500/30`}
              placeholder="Search dishes..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
          </div>

          {/* Filter Tags */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {['VEG', 'NON_VEG', 'SPICY', 'TODAY_SPECIAL', 'MOST_POPULAR'].map(tag => (
              <button key={tag} onClick={() => handleFilter(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${activeFilter === tag ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' : `${isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}`}>
                {TAG_ICONS[tag]} {tag.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div></div>
        ) : showSearchResults ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold ${subTextClass}`}>{displayDishes.length} result(s)</h3>
              <button onClick={() => { setSearchQuery(''); setSearchResults(null); setActiveFilter(null); }} className="text-xs text-primary-400">Clear</button>
            </div>
            <div className="space-y-3">
              {displayDishes.map((dish, i) => (
                <DishCard key={i} dish={dish} cart={cart} addToCart={addToCart} isDark={isDark} cardClass={cardClass} accentClass={accentClass} subTextClass={subTextClass} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {menuData.map((cat, i) => (
              <div key={i}>
                <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${accentClass}`}>{cat.category?.name}</h2>
                <div className="space-y-3">
                  {cat.dishes?.map((dish, j) => (
                    <DishCard key={j} dish={dish} cart={cart} addToCart={addToCart} isDark={isDark} cardClass={cardClass} accentClass={accentClass} subTextClass={subTextClass} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
          <button onClick={() => setShowCart(true)}
            className="max-w-lg mx-auto w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl flex items-center justify-between px-6 shadow-2xl shadow-primary-500/30">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">{cart.reduce((s, i) => s + i.quantity, 0)} item(s)</span>
            </div>
            <span className="font-bold text-lg">₹{cartTotal.toFixed(0)} →</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCart(false)}></div>
          <div className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl ${isDark ? 'bg-gray-900' : 'bg-white'} animate-slide-up`}>
            <div className="sticky top-0 z-10 p-4 border-b border-gray-700/50 flex items-center justify-between backdrop-blur-xl">
              <h3 className="text-lg font-bold font-display">Your Order</h3>
              <button onClick={() => setShowCart(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              {cart.map(item => (
                <div key={item.dishId} className={`rounded-xl p-4 border ${cardClass}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="font-medium text-sm">{item.dishName}</span>
                      <span className={`text-sm ml-2 ${accentClass} font-bold`}>₹{item.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.dishId, -1)} className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.dishId, 1)} className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <input className={`w-full mt-2 text-xs rounded-lg py-1.5 px-3 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'} border`}
                    placeholder="Special request: no onion, extra spicy..." value={item.notes} onChange={(e) => updateItemNotes(item.dishId, e.target.value)} />
                </div>
              ))}

              {/* Overall Instructions */}
              <div className={`rounded-xl p-4 border ${cardClass}`}>
                <label className="text-sm font-medium flex items-center gap-1 mb-2"><MessageSquare className="w-4 h-4" /> Special Instructions</label>
                <textarea className={`w-full text-sm rounded-lg py-2 px-3 min-h-[60px] resize-none ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'} border`}
                  placeholder="Any overall instructions for the kitchen..." value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} />
              </div>

              {/* Total & Place Order */}
              <div className={`rounded-xl p-4 border ${cardClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Total</span>
                  <span className={`text-xl font-bold ${accentClass}`}>₹{cartTotal.toFixed(0)}</span>
                </div>
                <button onClick={placeOrder} disabled={placing}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                  {placing ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> : <><Send className="w-5 h-5" /> Place Order</>}
                </button>
              </div>

              {/* View Bill Button */}
              {session && (
                <button onClick={() => navigate(`/billing/${session.id || session._id}`)}
                  className={`w-full py-3 rounded-xl font-medium text-sm border ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} transition-all`}>
                  View Bill & Pay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DishCard({ dish, cart, addToCart, isDark, cardClass, accentClass, subTextClass }) {
  const dishId = dish.id || dish._id;
  const inCart = cart.find(item => item.dishId === dishId);

  return (
    <div className={`rounded-xl border p-3 ${cardClass} flex gap-3 transition-all hover:shadow-md`}>
      {dish.imageUrl && <img src={dish.imageUrl} alt={dish.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-sm">{dish.name}</h4>
              {dish.tags?.includes('VEG') && <span title="Veg" className="text-xs">🟢</span>}
              {dish.tags?.includes('NON_VEG') && <span title="Non-Veg" className="text-xs">🔴</span>}
            </div>
            <div className="flex gap-1 mt-0.5 flex-wrap">
              {dish.tags?.filter(t => t !== 'VEG' && t !== 'NON_VEG').map(tag => (
                <span key={tag} className="text-[9px] bg-primary-500/10 text-primary-400 px-1.5 py-0.5 rounded-full">{TAG_ICONS[tag]} {tag.replace(/_/g, ' ')}</span>
              ))}
            </div>
          </div>
          <span className={`text-sm font-bold ${accentClass} flex-shrink-0`}>₹{dish.price}</span>
        </div>
        {dish.description && <p className={`text-[11px] mt-1 ${subTextClass} line-clamp-2`}>{dish.description}</p>}
        <div className="flex items-center justify-between mt-2">
          {dish.customizationOptions?.length > 0 && (
            <span className={`text-[10px] ${subTextClass}`}>Customizable</span>
          )}
          <button onClick={() => addToCart(dish)}
            className={`ml-auto px-3 py-1 rounded-lg text-xs font-medium ${inCart ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-primary-500/20 text-primary-400 border border-primary-500/30'} transition-all hover:scale-105`}>
            {inCart ? `✓ Added (${inCart.quantity})` : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
