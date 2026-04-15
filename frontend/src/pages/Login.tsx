import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User, Hexagon, Loader2 } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const role = 'Member';
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerMessage(null);

    try {
      if (isLogin) {
        // Handle Login
        const { data } = await axios.post('/api/auth/login', { email, password });
        login(data);
        navigate('/dashboard');
      } else {
        // Handle Registration
        await axios.post('/api/auth/register', { name, email, password, role });
        setServerMessage({ type: 'success', text: 'Account created successfully! Please sign in.' });
        setIsLogin(true);
        setPassword(''); // Clear password for security
      }
    } catch (error: any) {
      setServerMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Authentication failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-indigo-100">
      <div className="w-full max-w-[420px]">
        {/* Logo/Brand */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Hexagon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">NexusFlow</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          {/* Top Edge Gradient Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-sm text-slate-500">
              {isLogin ? 'Enter your credentials to access your workspace.' : 'Sign up to start organizing your life and projects.'}
            </p>
          </div>

          {serverMessage && (
            <div className={`p-4 mb-6 rounded-xl text-sm font-medium ${
              serverMessage.type === 'error' 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}>
              {serverMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Registration specific fields */}
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-medium text-slate-700 ml-1 flex justify-between">
                 <span>Password</span>
                 {isLogin && <a href="#" className="text-indigo-600 hover:text-indigo-700">Forgot password?</a>}
               </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 mt-2 flex items-center justify-center gap-2 text-white bg-slate-900 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all focus:ring-4 focus:ring-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Block */}
          <div className="mt-8 text-center text-sm text-slate-500 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setServerMessage(null);
                setPassword('');
              }} 
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            >
              {isLogin ? 'Sign up for free' : 'Sign in instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
