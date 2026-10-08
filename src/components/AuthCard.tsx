import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService, errorMessage as apiErrorMessage } from '../services/api';

export const AuthCard: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const response = isRegister
        ? await authService.register({ name, email, phone, password })
        : await authService.login(email, password);
      localStorage.setItem('bmm_token', response.token);
      localStorage.setItem('bmm_user', JSON.stringify(response.user));
      setSuccessMessage(`Welcome${response.user.name ? `, ${response.user.name}` : ''}!`);
      navigate('/');
    } catch (error) { setErrorMessage(apiErrorMessage(error)); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSignIn = () => {
    setErrorMessage('Google sign-in is not configured for this project. Use email and password.');
  };

  return (
    <div className="w-full max-w-[420px] bg-[#11141c]/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-7 sm:p-9 text-left">
      {/* Card Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1.5">
          {isRegister ? 'Register to book movie tickets.' : 'Sign in to catch your next show.'}
        </p>
      </div>

      {/* Success / Error Alerts */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Social authentication is hidden until a provider is configured. */}
      {false && <>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-60"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[11px] text-neutral-400 uppercase tracking-widest">
          or
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      </>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && <>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full bg-white/5 border border-white/15 focus:border-[#f5a623] rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="w-full bg-white/5 border border-white/15 focus:border-[#f5a623] rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none" />
        </>}
        {/* Email Address */}
        <div>
          <label className="sr-only" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            disabled={isLoading}
            className="w-full bg-white/5 border border-white/15 focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 outline-none transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/15 focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] rounded-xl px-4 py-2.5 pr-24 text-xs sm:text-sm text-white placeholder-neutral-500 outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              {!isRegister && <Link
                to="/forgot-password"
                className="text-[11px] text-neutral-400 hover:text-[#f5a623] transition-colors"
              >
                Forgot Password?
              </Link>}
            </div>
          </div>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-xl bg-[#f5a623] hover:bg-[#e09612] active:bg-[#c9830c] text-black font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-[#f5a623]/25 flex items-center justify-center gap-2 disabled:opacity-60 select-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="text-center mt-6 text-xs text-neutral-400">
        {isRegister ? 'Already have an account? ' : "Don't have an account? "}
        <Link
          to={isRegister ? '/login' : '/register'}
          className="text-white hover:text-[#f5a623] font-semibold underline underline-offset-2 transition-colors"
        >
          {isRegister ? 'Sign in' : 'Sign up'}
        </Link>
      </div>
    </div>
  );
};
