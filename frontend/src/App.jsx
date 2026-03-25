import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmail from './pages/VerifyEmail';
import RestaurantSetup from './pages/RestaurantSetup';
import Dashboard from './pages/Dashboard';
import MenuManager from './pages/MenuManager';
import MenuPreview from './pages/MenuPreview';
import TableManager from './pages/TableManager';
import LiveOrders from './pages/LiveOrders';
import OrderHistory from './pages/OrderHistory';
import CustomerMenu from './pages/CustomerMenu';
import Billing from './pages/Billing';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-dark-900"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/setup" element={<ProtectedRoute><RestaurantSetup /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/menu" element={<ProtectedRoute><MenuManager /></ProtectedRoute>} />
      <Route path="/preview" element={<ProtectedRoute><MenuPreview /></ProtectedRoute>} />
      <Route path="/tables" element={<ProtectedRoute><TableManager /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><LiveOrders /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      <Route path="/m/:restaurantId/:tableNumber" element={<CustomerMenu />} />
      <Route path="/billing/:sessionId" element={<Billing />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
