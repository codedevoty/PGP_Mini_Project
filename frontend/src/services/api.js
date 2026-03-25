import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

// ============ RESTAURANT ============
export const restaurantAPI = {
  create: (data) => api.post('/owner/restaurant', data),
  getMine: () => api.get('/owner/restaurant'),
  update: (id, data) => api.put(`/owner/restaurant/${id}`, data),
  getPublic: (id) => api.get(`/public/restaurant/${id}`),
};

// ============ MENU ============
export const menuAPI = {
  createCategory: (data) => api.post('/owner/menu/category', data),
  getCategories: (restaurantId) => api.get(`/owner/menu/categories/${restaurantId}`),
  updateCategory: (id, data) => api.put(`/owner/menu/category/${id}`, data),
  deleteCategory: (id) => api.delete(`/owner/menu/category/${id}`),
  createDish: (data) => api.post('/owner/menu/dish', data),
  getDishesByCategory: (categoryId) => api.get(`/owner/menu/dishes/category/${categoryId}`),
  getDishesByRestaurant: (restaurantId) => api.get(`/owner/menu/dishes/restaurant/${restaurantId}`),
  updateDish: (id, data) => api.put(`/owner/menu/dish/${id}`, data),
  deleteDish: (id) => api.delete(`/owner/menu/dish/${id}`),
  getPublicMenu: (restaurantId) => api.get(`/public/menu/${restaurantId}`),
  searchDishes: (restaurantId, query) => api.get(`/public/menu/${restaurantId}/search?query=${query}`),
  filterByTag: (restaurantId, tag) => api.get(`/public/menu/${restaurantId}/filter?tag=${tag}`),
};

// ============ TABLES ============
export const tableAPI = {
  create: (restaurantId, numberOfTables) => api.post(`/owner/tables/${restaurantId}`, { numberOfTables }),
  getAll: (restaurantId) => api.get(`/owner/tables/${restaurantId}`),
  getQrBase64: (restaurantId, tableNumber) => api.get(`/owner/tables/${restaurantId}/qr-base64/${tableNumber}`),
  delete: (tableId) => api.delete(`/owner/tables/${tableId}`),
};

// ============ ORDERS ============
export const orderAPI = {
  place: (data) => api.post('/order/place', data),
  getLive: (restaurantId) => api.get(`/owner/orders/live/${restaurantId}`),
  getByStatus: (restaurantId, status) => api.get(`/owner/orders/${restaurantId}/status/${status}`),
  updateStatus: (orderId, status) => api.put(`/owner/orders/${orderId}/status`, { status }),
  getBySession: (sessionId) => api.get(`/order/session/${sessionId}/orders`),
};

// ============ SESSIONS ============
export const sessionAPI = {
  start: (data) => api.post('/order/session/start', data),
  getBill: (sessionId) => api.get(`/order/session/${sessionId}/bill`),
  pay: (sessionId, paymentMethod) => api.put(`/order/session/${sessionId}/pay`, { paymentMethod }),
  getActive: (restaurantId) => api.get(`/owner/sessions/${restaurantId}`),
  getAll: (restaurantId) => api.get(`/owner/sessions/${restaurantId}/all`),
};

export default api;
