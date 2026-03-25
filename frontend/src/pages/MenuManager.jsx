import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, Image, Tag, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { menuAPI } from '../services/api';
import { Sidebar } from './Dashboard';

const TAG_OPTIONS = ['TODAY_SPECIAL', 'MOST_POPULAR', 'CHEF_CHOICE', 'MOST_ORDERED', 'SPICY', 'VEG', 'NON_VEG', 'JAIN', 'OUR_SPECIALITY'];
const TAG_COLORS = { VEG: 'badge-green', NON_VEG: 'badge-red', SPICY: 'badge-red', TODAY_SPECIAL: 'badge-yellow', MOST_POPULAR: 'badge-purple', CHEF_CHOICE: 'badge-blue', MOST_ORDERED: 'badge-blue', JAIN: 'badge-green', OUR_SPECIALITY: 'badge-yellow' };

export default function MenuManager() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState({});
  const [expandedCat, setExpandedCat] = useState(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', sortOrder: 0 });
  const [editingCat, setEditingCat] = useState(null);
  const [showDishForm, setShowDishForm] = useState(null);
  const [dishForm, setDishForm] = useState({ name: '', description: '', price: '', imageUrl: '', tags: [], available: true, customizationOptions: [] });
  const [editingDish, setEditingDish] = useState(null);
  const [loading, setLoading] = useState(true);

  const restaurantId = user?.restaurantId;

  useEffect(() => { if (restaurantId) loadCategories(); }, [restaurantId]);

  const loadCategories = async () => {
    try {
      const res = await menuAPI.getCategories(restaurantId);
      setCategories(res.data.data || []);
    } catch (err) { toast.error('Failed to load categories'); }
    setLoading(false);
  };

  const loadDishes = async (catId) => {
    try {
      const res = await menuAPI.getDishesByCategory(catId);
      setDishes(prev => ({ ...prev, [catId]: res.data.data || [] }));
    } catch (err) { toast.error('Failed to load dishes'); }
  };

  const toggleCategory = (catId) => {
    if (expandedCat === catId) { setExpandedCat(null); return; }
    setExpandedCat(catId);
    if (!dishes[catId]) loadDishes(catId);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name) return toast.error('Category name required');
    try {
      await menuAPI.createCategory({ ...catForm, restaurantId });
      toast.success('Category created!');
      setCatForm({ name: '', sortOrder: 0 });
      setShowCatForm(false);
      loadCategories();
    } catch (err) { toast.error('Failed to create category'); }
  };

  const handleUpdateCategory = async (id) => {
    try {
      await menuAPI.updateCategory(id, catForm);
      toast.success('Category updated!');
      setEditingCat(null);
      loadCategories();
    } catch (err) { toast.error('Failed to update category'); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category and all its dishes?')) return;
    try {
      await menuAPI.deleteCategory(id);
      toast.success('Category deleted!');
      loadCategories();
    } catch (err) { toast.error('Failed to delete category'); }
  };

  const resetDishForm = () => {
    setDishForm({ name: '', description: '', price: '', imageUrl: '', tags: [], available: true, customizationOptions: [] });
    setEditingDish(null);
  };

  const handleCreateDish = async (e, catId) => {
    e.preventDefault();
    if (!dishForm.name || !dishForm.price) return toast.error('Name and price required');
    try {
      await menuAPI.createDish({ ...dishForm, price: parseFloat(dishForm.price), categoryId: catId, restaurantId });
      toast.success('Dish added!');
      resetDishForm();
      setShowDishForm(null);
      loadDishes(catId);
    } catch (err) { toast.error('Failed to add dish'); }
  };

  const handleUpdateDish = async (id, catId) => {
    try {
      await menuAPI.updateDish(id, { ...dishForm, price: parseFloat(dishForm.price) });
      toast.success('Dish updated!');
      resetDishForm();
      setShowDishForm(null);
      loadDishes(catId);
    } catch (err) { toast.error('Failed to update dish'); }
  };

  const handleDeleteDish = async (id, catId) => {
    if (!confirm('Delete this dish?')) return;
    try {
      await menuAPI.deleteDish(id);
      toast.success('Dish deleted!');
      loadDishes(catId);
    } catch (err) { toast.error('Failed to delete dish'); }
  };

  const toggleTag = (tag) => {
    setDishForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const addCustomization = () => {
    setDishForm(prev => ({
      ...prev,
      customizationOptions: [...prev.customizationOptions, { name: '', type: 'ADD_ON', extraPrice: 0 }]
    }));
  };

  const updateCustomization = (index, field, value) => {
    setDishForm(prev => {
      const options = [...prev.customizationOptions];
      options[index] = { ...options[index], [field]: value };
      return { ...prev, customizationOptions: options };
    });
  };

  const removeCustomization = (index) => {
    setDishForm(prev => ({
      ...prev,
      customizationOptions: prev.customizationOptions.filter((_, i) => i !== index)
    }));
  };

  const getCategoryId = (cat) => cat.id || cat._id;

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar active="/menu" />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display">Menu Manager</h1>
            <p className="text-gray-400 mt-1">Add categories and dishes to your menu</p>
          </div>
          <button onClick={() => { setShowCatForm(true); setCatForm({ name: '', sortOrder: categories.length }); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {/* New Category Form */}
        {showCatForm && (
          <div className="glass-card p-5 mb-6 animate-slide-up">
            <form onSubmit={handleCreateCategory} className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-300 mb-1 block">Category Name</label>
                <input className="input-field" placeholder="e.g., Starters, Main Course" value={catForm.name} onChange={(e) => setCatForm({...catForm, name: e.target.value})} />
              </div>
              <div className="w-32">
                <label className="text-sm font-medium text-gray-300 mb-1 block">Sort Order</label>
                <input type="number" className="input-field" value={catForm.sortOrder} onChange={(e) => setCatForm({...catForm, sortOrder: parseInt(e.target.value)})} />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-1 text-sm"><Save className="w-4 h-4" /> Save</button>
              <button type="button" onClick={() => setShowCatForm(false)} className="btn-secondary text-sm"><X className="w-4 h-4" /></button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div></div>
        ) : categories.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <GripVertical className="w-12 h-12 mx-auto mb-4 text-gray-500 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Categories Yet</h3>
            <p className="text-gray-400 mb-4">Start by adding categories like Starters, Main Course, Desserts</p>
            <button onClick={() => setShowCatForm(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4 inline mr-1" /> Create First Category
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map(cat => {
              const catId = getCategoryId(cat);
              return (
                <div key={catId} className="glass-card overflow-hidden">
                  {/* Category Header */}
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5" onClick={() => toggleCategory(catId)}>
                    <div className="flex items-center gap-3">
                      {expandedCat === catId ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                      {editingCat === catId ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <input className="input-field !py-1.5 w-48" value={catForm.name} onChange={(e) => setCatForm({...catForm, name: e.target.value})} />
                          <button onClick={() => handleUpdateCategory(catId)} className="text-emerald-400 hover:text-emerald-300"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingCat(null)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <span className="font-semibold text-lg">{cat.name}</span>
                      )}
                      <span className="text-xs text-gray-500">{dishes[catId]?.length || 0} dishes</span>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setEditingCat(catId); setCatForm({ name: cat.name, sortOrder: cat.sortOrder }); }} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteCategory(catId)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      <button onClick={() => { setShowDishForm(catId); resetDishForm(); }} className="btn-primary text-xs !py-1.5 !px-3 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Dish</button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedCat === catId && (
                    <div className="border-t border-white/10 p-4">
                      {/* Add Dish Form */}
                      {showDishForm === catId && (
                        <div className="bg-white/5 rounded-xl p-5 mb-4 animate-slide-up">
                          <h4 className="font-semibold mb-4">{editingDish ? 'Edit Dish' : 'Add New Dish'}</h4>
                          <form onSubmit={(e) => editingDish ? (e.preventDefault(), handleUpdateDish(editingDish, catId)) : handleCreateDish(e, catId)} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-300 mb-1 block">Dish Name *</label>
                                <input className="input-field" placeholder="Paneer Tikka" value={dishForm.name} onChange={(e) => setDishForm({...dishForm, name: e.target.value})} />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-300 mb-1 block">Price (₹) *</label>
                                <input type="number" step="0.01" className="input-field" placeholder="299" value={dishForm.price} onChange={(e) => setDishForm({...dishForm, price: e.target.value})} />
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-300 mb-1 block">Description</label>
                              <textarea className="input-field min-h-[60px] resize-none" placeholder="About the dish..." value={dishForm.description} onChange={(e) => setDishForm({...dishForm, description: e.target.value})} />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-1"><Image className="w-4 h-4" /> Image URL</label>
                              <input className="input-field" placeholder="https://..." value={dishForm.imageUrl} onChange={(e) => setDishForm({...dishForm, imageUrl: e.target.value})} />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1"><Tag className="w-4 h-4" /> Tags</label>
                              <div className="flex flex-wrap gap-2">
                                {TAG_OPTIONS.map(tag => (
                                  <button type="button" key={tag} onClick={() => toggleTag(tag)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${dishForm.tags.includes(tag) ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                                    {tag.replace(/_/g, ' ')}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Customization Options */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-300">Customizations (Add-ons / Remove)</label>
                                <button type="button" onClick={addCustomization} className="text-xs text-primary-400 hover:text-primary-300">+ Add Option</button>
                              </div>
                              {dishForm.customizationOptions.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2 mb-2">
                                  <input className="input-field !py-1.5 flex-1 text-sm" placeholder="Extra Cheese" value={opt.name} onChange={(e) => updateCustomization(i, 'name', e.target.value)} />
                                  <select className="input-field !py-1.5 w-28 text-sm" value={opt.type} onChange={(e) => updateCustomization(i, 'type', e.target.value)}>
                                    <option value="ADD_ON">Add-on</option>
                                    <option value="REMOVAL">Remove</option>
                                  </select>
                                  <input type="number" className="input-field !py-1.5 w-20 text-sm" placeholder="₹0" value={opt.extraPrice} onChange={(e) => updateCustomization(i, 'extraPrice', parseFloat(e.target.value) || 0)} />
                                  <button type="button" onClick={() => removeCustomization(i)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={dishForm.available} onChange={(e) => setDishForm({...dishForm, available: e.target.checked})} className="w-4 h-4 rounded" />
                                Available
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" className="btn-primary text-sm flex items-center gap-1"><Save className="w-4 h-4" /> {editingDish ? 'Update' : 'Add'} Dish</button>
                              <button type="button" onClick={() => { setShowDishForm(null); resetDishForm(); }} className="btn-secondary text-sm">Cancel</button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Dishes List */}
                      {dishes[catId]?.length === 0 && showDishForm !== catId ? (
                        <p className="text-gray-500 text-center py-6">No dishes in this category yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {dishes[catId]?.map(dish => {
                            const dishId = dish.id || dish._id;
                            return (
                              <div key={dishId} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                                {dish.imageUrl && (
                                  <img src={dish.imageUrl} alt={dish.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold">{dish.name}</span>
                                    {!dish.available && <span className="badge badge-red">Unavailable</span>}
                                    {dish.tags?.map(tag => (
                                      <span key={tag} className={`badge ${TAG_COLORS[tag] || 'badge-blue'} text-[10px]`}>{tag.replace(/_/g, ' ')}</span>
                                    ))}
                                  </div>
                                  {dish.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{dish.description}</p>}
                                  {dish.customizationOptions?.length > 0 && (
                                    <p className="text-[10px] text-gray-500 mt-0.5">Customizations: {dish.customizationOptions.map(c => c.name).join(', ')}</p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="font-bold text-primary-400">₹{dish.price}</div>
                                  <div className="flex gap-1 mt-1">
                                    <button onClick={() => { setEditingDish(dishId); setShowDishForm(catId); setDishForm({ name: dish.name, description: dish.description || '', price: dish.price, imageUrl: dish.imageUrl || '', tags: dish.tags || [], available: dish.available, customizationOptions: dish.customizationOptions || [] }); }} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDeleteDish(dishId, catId)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
