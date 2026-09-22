'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { registerUser, resendOtp } from '@/lib/api';
import {
  User,
  Mail,
  Lock,
  Briefcase,
  DollarSign,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  RefreshCw
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { verifyOtp, user } = useAuth();

  // Registration step: 1 = Fill info, 2 = Verify OTP
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [role, setRole] = useState<'CLIENT' | 'PROVIDER'>('CLIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [skillsInput, setSkillsInput] = useState('');

  // OTP Verification
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  // Status
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    router.push('/');
    return null;
  }

  // Handle Step 1: Submit Registration Info
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const skillsArray = skillsInput
        ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        bio: bio.trim() || undefined,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
      });

      // Advance to OTP verification step
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await verifyOtp(email.trim(), otp.trim());
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Invalid or expired verification code.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    setErrorMsg('');
    setResendSuccess('');
    setResending(true);

    try {
      await resendOtp(email.trim());
      setResendSuccess('A fresh 6-digit OTP has been sent to your email.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to resend code.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-lg space-y-6">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
              ConsulSphere<span className="text-[#1dbf73]">.</span>
            </Link>
            <h1 className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {step === 1 ? 'Create your free account' : 'Verify your email'}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {step === 1
                ? 'Join thousands of businesses and consultants working together.'
                : `We sent a 6-digit verification code to ${email}`}
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Resend success notice */}
          {resendSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{resendSuccess}</span>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">

              {/* Account Type Selector (Fiverr Style) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  I want to:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('CLIENT')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${role === 'CLIENT'
                      ? 'border-[#1dbf73] bg-emerald-50/50 text-slate-900 ring-1 ring-[#1dbf73]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    <span className="text-base block mb-0.5">👤</span>
                    <span className="text-xs font-bold block">Hire Talent</span>
                    <span className="text-[11px] text-slate-500">I am looking for services</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('PROVIDER')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${role === 'PROVIDER'
                      ? 'border-[#1dbf73] bg-emerald-50/50 text-slate-900 ring-1 ring-[#1dbf73]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    <span className="text-base block mb-0.5">💼</span>
                    <span className="text-xs font-bold block">Work as Consultant</span>
                    <span className="text-[11px] text-slate-500">I want to offer my services</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73]"
                  />
                </div>
              </div>

              {/* Additional Provider Fields */}
              {role === 'PROVIDER' && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#1dbf73]" />
                    <span>Provider Profile Details</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Professional Headline / Bio
                    </label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Senior Cloud Architect with 5+ years experience"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1dbf73]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Hourly Rate ($/hr)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                          <DollarSign className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="number"
                          min="5"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="50"
                          className="w-full pl-7 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1dbf73]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Key Skills (comma separated)
                      </label>
                      <input
                        type="text"
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        placeholder="React, Next.js, Cloud"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1dbf73]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 rounded-lg bg-[#1dbf73] hover:bg-[#19a463] text-white text-sm font-bold tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue to Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-5">

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-11 pr-3 py-3 text-center tracking-[0.5em] text-xl font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#1dbf73] focus:ring-2 focus:ring-[#1dbf73]/20"
                  />
                </div>
                <p className="mt-2 text-[11px] text-center text-slate-500">
                  Please check your inbox or spam folder. The code expires in 5 minutes.
                </p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 px-4 rounded-lg bg-[#1dbf73] hover:bg-[#19a463] text-white text-sm font-bold tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify &amp; Activate Account</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend & Back actions */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  ← Edit Information
                </button>

                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResend}
                  className="text-[#1dbf73] hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>Resend Code</span>
                </button>
              </div>

            </form>
          )}

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#1dbf73] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#1dbf73]" />
          <span>Milestone escrow protection on all consulting contracts</span>
        </div>

      </div>
    </div>
  );
}
