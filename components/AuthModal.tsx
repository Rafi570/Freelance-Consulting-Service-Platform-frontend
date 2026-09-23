'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { registerUser } from '@/lib/api';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  redirectUrl?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = 'login',
  redirectUrl,
}: AuthModalProps) {
  const router = useRouter();
  const { login, verifyOtp, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regRole, setRegRole] = useState<'CLIENT' | 'PROVIDER'>('CLIENT');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [regOtp, setRegOtp] = useState('');

  // Status state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(loginEmail.trim(), loginPassword);
      onClose();
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Invalid login credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Demo Fill
  const handleDemoFill = (email: string, pass: string) => {
    setActiveTab('login');
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMsg('');
  };

  // Handle Register Step 1
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
      });
      setRegStep(2);
      setSuccessMsg(`We sent a 6-digit verification code to ${regEmail}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verify Step 2
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await verifyOtp(regEmail.trim(), regOtp.trim());
      onClose();
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('OTP verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-[460px] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pt-8 pb-4 px-6 sm:px-8 text-center border-b border-slate-100">
          <div className="flex justify-center mb-3">
            <Logo size="md" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {activeTab === 'login' ? 'Sign in to your account' : 'Join ConsulSphere'}
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-[#1dbf73] hover:underline cursor-pointer"
                >
                  Join here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-[#1dbf73] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-5">

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* 1-Click Quick Demo Accounts (Fiverr style test bar) */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#1dbf73]" />
                    <span>Quick 1-Click Demo Login</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleDemoFill('hasanrafi570@gmail.com', 'Rafi570@')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#1dbf73] hover:text-[#1dbf73] font-bold text-[11px] transition-colors shadow-2xs cursor-pointer truncate"
                  >
                    👑 Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('hasan.provider@gmail.com', 'password123')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#1dbf73] hover:text-[#1dbf73] font-bold text-[11px] transition-colors shadow-2xs cursor-pointer truncate"
                  >
                    💼 Provider
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('hasan.rafi0123@gmail.com', 'password123')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#1dbf73] hover:text-[#1dbf73] font-bold text-[11px] transition-colors shadow-2xs cursor-pointer truncate"
                  >
                    👤 Client
                  </button>
                </div>
              </div>

              {/* Social Login Options (Fiverr Style) */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('hasan.rafi0123@gmail.com', 'password123')}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-800 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs bg-white"
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
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest absolute">
                  OR
                </span>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1dbf73] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] font-semibold text-[#1dbf73] hover:underline cursor-pointer">
                    Forgot?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1dbf73] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="modal-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1dbf73] focus:ring-[#1dbf73] border-slate-300 cursor-pointer"
                />
                <label
                  htmlFor="modal-remember-me"
                  className="ml-2 text-xs text-slate-600 font-medium cursor-pointer"
                >
                  Remember me on this browser
                </label>
              </div>

              {/* Submit Button (Fiverr Green) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs font-black tracking-wide uppercase shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER / JOIN FORM */}
          {activeTab === 'register' && (
            <div>
              {regStep === 1 ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Account Type Selector (Client vs Consultant) */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setRegRole('CLIENT')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        regRole === 'CLIENT'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-[#1dbf73]" />
                      <span>Order Services</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('PROVIDER')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        regRole === 'PROVIDER'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[#1dbf73]" />
                      <span>Offer Consulting</span>
                    </button>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1dbf73] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1dbf73] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1dbf73] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Register Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs font-black tracking-wide uppercase shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {loading ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <span>Join ConsulSphere</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: OTP Verification */
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-slate-600">
                      Enter the 6-digit code sent to <strong>{regEmail}</strong>
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full py-3 px-4 text-center tracking-widest text-lg font-black bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1dbf73]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || regOtp.length < 6}
                    className="w-full py-3 px-4 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs font-black tracking-wide uppercase transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Legal Footer Note */}
          <div className="pt-2 text-center text-[10px] text-slate-400 leading-relaxed border-t border-slate-100">
            By continuing, you agree to ConsulSphere&apos;s{' '}
            <span className="underline hover:text-slate-600 cursor-pointer">Terms of Service</span> and{' '}
            <span className="underline hover:text-slate-600 cursor-pointer">Privacy Policy</span>.
          </div>

        </div>
      </div>
    </div>
  );
}
