import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">

      {/* ── Left Panel – Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 bg-gradient-to-br from-slate-900 via-blue-950 to-teal-950">
        {/* Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/20 blur-[120px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}
          className="relative z-10 text-center">
          <motion.img
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 80 }}
            src="/emblem.png" alt="NCP Education Emblem"
            className="w-36 h-36 object-contain mx-auto mb-8 drop-shadow-2xl"
          />
          <p className="text-white font-extrabold text-2xl mb-3 leading-tight drop-shadow">
            පළාත් අධ්‍යාපන දෙපාර්තමේන්තුව උතුරු මැද පළාත වාණිජ අංශය
          </p>
          <p className="text-blue-100 font-bold text-xl mb-3 leading-tight drop-shadow">
            வடமத்திய மாகாண கல்வித் திணைக்களம் - வர்த்தகப் பிரிவு
          </p>
          <p className="text-blue-200/80 font-bold text-lg mb-10 leading-relaxed drop-shadow">
            Provincial Department of Education North Central Province Commerce Branch
          </p>

          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              'Province-wide A/L Results Analytics',
              'Student & Teacher Data Management',
              'Term & Unit Test Performance Tracking',
              'Resource Repository for Past Papers',
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center space-x-3 text-white/70 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel – Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 relative">
        {/* Back to home */}
        <Link to="/" className="absolute top-6 left-6 flex items-center space-x-2 text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors group">
          <motion.span whileHover={{ x: -4 }} className="flex items-center space-x-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </motion.span>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-md px-8 py-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center space-x-3 mb-10">
            <img src="/emblem.png" alt="NCP Logo" className="w-12 h-12 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-[15px] text-slate-800 leading-tight">පළාත් අධ්‍යාපන දෙපාර්තමේන්තුව උතුරු මැද පළාත වාණිජ අංශය</span>
              <span className="font-bold text-[12px] text-slate-600 leading-tight mt-[2px]">வடமத்திய மாகாண கல்வித் திணைக்களம் - வர்த்தகப் பிரிவு</span>
              <span className="font-bold text-[12px] text-slate-500 leading-tight mt-[2px]">Provincial Dept of Education North Central Province Commerce Branch</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to access your dashboard</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6"
            >
              <span className="text-red-500">⚠</span>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-500 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Official Department Notice */}
          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-xs text-center">
            <span className="font-semibold text-slate-800">Authorized Personnel Only:</span> Log in with your department-issued officer credentials. Unauthorized access attempts are monitored and logged.
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            &copy; {new Date().getFullYear()} NCP Education Department. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
