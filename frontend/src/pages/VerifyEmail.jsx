import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ChefHat } from 'lucide-react';
import { authAPI } from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    authAPI.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Link may have expired.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center animate-slide-up">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
        </Link>

        {status === 'loading' && (
          <div>
            <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-2">Email Verified!</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-2">Verification Failed</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <Link to="/signup" className="btn-primary inline-block">Try Again</Link>
          </div>
        )}
      </div>
    </div>
  );
}
