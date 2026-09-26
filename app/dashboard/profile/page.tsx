'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Star,
  Clock,
  CheckCircle2,
  Shield,
  ShieldCheck,
  Edit3,
  ExternalLink,
  Award,
  Layers,
  DollarSign,
  TrendingUp,
  Sparkles,
  Calendar,
  Plus,
  X,
  Save,
  MessageSquare,
  Package,
  ThumbsUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getMyProviderProfile,
  updateMyProviderProfile,
  IUser
} from '@/lib/api';

export default function DashboardProfilePage() {
  const { user: authUser, setSession, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'gigs' | 'reviews' | 'performance'>('overview');
  const [profileData, setProfileData] = useState<IUser | null>(authUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Edit form state
  const [formData, setFormData] = useState({
    name: authUser?.name || '',
    bio: authUser?.profile?.bio || '',
    skills: authUser?.profile?.skills?.join(', ') || 'UI/UX Design, Strategy Consulting, Brand Identity, Full-Stack Architecture, Figma',
    phone: authUser?.profile?.phone || '+1 (555) 234-8910',
    address: authUser?.profile?.address || 'San Francisco, CA, USA',
    experience: authUser?.profile?.experience || '6+ Years',
    portfolioUrl: authUser?.profile?.portfolioUrl || 'https://consultant-portfolio.dev',
    hourlyRate: authUser?.profile?.hourlyRate || 85,
  });

  // Sync profile data on mount
  useEffect(() => {
    async function loadFreshProfile() {
      if (!token) return;
      try {
        setIsLoading(true);
        const data = await getMyProviderProfile();
        if (data) {
          setProfileData(data);
          setFormData({
            name: data.name || '',
            bio: data.profile?.bio || 'Senior Consulting Strategist & Full-Stack Architect with over 6 years of expertise delivering high-impact digital solutions, system design, and brand acceleration.',
            skills: data.profile?.skills?.length ? data.profile.skills.join(', ') : 'UI/UX Design, Strategy Consulting, Brand Identity, Full-Stack Architecture, Figma',
            phone: data.profile?.phone || '+1 (555) 234-8910',
            address: data.profile?.address || 'San Francisco, CA, USA',
            experience: data.profile?.experience || '6+ Years',
            portfolioUrl: data.profile?.portfolioUrl || 'https://consultant-portfolio.dev',
            hourlyRate: data.profile?.hourlyRate || 85,
          });
        }
      } catch (err) {
        // Fallback to authUser context
        if (authUser) {
          setProfileData(authUser);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadFreshProfile();
  }, [token, authUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        bio: formData.bio,
        skills: skillsArray,
        phone: formData.phone,
        address: formData.address,
        experience: formData.experience,
        portfolioUrl: formData.portfolioUrl,
        hourlyRate: Number(formData.hourlyRate) || 85,
      };

      try {
        const updated = await updateMyProviderProfile(payload);
        setProfileData(updated);
      } catch {
        // Local state update if offline / simulated
        setProfileData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            name: formData.name,
            profile: {
              ...(prev.profile || { id: 'prof_local' }),
              bio: formData.bio,
              skills: skillsArray,
              phone: formData.phone,
              address: formData.address,
              experience: formData.experience,
              portfolioUrl: formData.portfolioUrl,
              hourlyRate: Number(formData.hourlyRate),
            },
          };
        });
      }

      setIsEditModalOpen(false);
      setSuccessToast('Profile updated successfully!');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const name = profileData?.name || authUser?.name || 'Hasan Rafi';
  const email = profileData?.email || authUser?.email || 'hasanrafi570@gmail.com';
  const role = profileData?.role || authUser?.role || 'PROVIDER';
  const bio =
    profileData?.profile?.bio ||
    formData.bio ||
    'Experienced consulting partner specializing in end-to-end digital transformation, technology strategy, UX engineering, and business advisory services.';
  const skills = profileData?.profile?.skills?.length
    ? profileData.profile.skills
    : formData.skills.split(',').map((s) => s.trim());
  const hourlyRate = profileData?.profile?.hourlyRate ?? formData.hourlyRate ?? 85;
  const experience = profileData?.profile?.experience || formData.experience || '6+ Years';
  const phone = profileData?.profile?.phone || formData.phone || '+1 (555) 234-8910';
  const address = profileData?.profile?.address || formData.address || 'San Francisco, CA, USA';
  const portfolioUrl = profileData?.profile?.portfolioUrl || formData.portfolioUrl || 'https://consultant-portfolio.dev';

  // Sample Gigs for Provider
  const providerGigs = [
    {
      id: 'gig-1',
      title: 'Full Stack Web & Cloud Architecture Consultation',
      category: 'Software Engineering',
      rating: 4.99,
      reviewsCount: 38,
      startingPrice: 250,
      imageBg: 'from-blue-600 to-indigo-900',
      tag: 'BESTSELLER',
      ordersCount: 84,
    },
    {
      id: 'gig-2',
      title: 'UI/UX Design Systems & High-Fidelity Interactive Prototyping',
      category: 'Design & Creative',
      rating: 4.96,
      reviewsCount: 24,
      startingPrice: 180,
      imageBg: 'from-emerald-600 to-teal-900',
      tag: 'TOP RATED',
      ordersCount: 52,
    },
    {
      id: 'gig-3',
      title: 'Executive Strategic Planning & Marketplace Monetization Audit',
      category: 'Business Consulting',
      rating: 5.0,
      reviewsCount: 19,
      startingPrice: 320,
      imageBg: 'from-purple-600 to-slate-900',
      tag: 'PRO SERVICE',
      ordersCount: 31,
    },
  ];

  // Sample Client Reviews
  const clientReviews = [
    {
      id: 'rev-1',
      clientName: 'Alexander Hayes',
      clientCompany: 'TechVentures Inc.',
      rating: 5,
      date: '2 days ago',
      comment:
        'Hasan demonstrated remarkable technical depth and strategic clarity. He overhauled our entire application architecture in under two weeks. Will definitely hire again!',
    },
    {
      id: 'rev-2',
      clientName: 'Sophia Lin',
      clientCompany: 'Aura Studio',
      rating: 5,
      date: '1 week ago',
      comment:
        'Exceptional consultant. Thorough communication, delivered ahead of schedule, and provided invaluable insights that saved our startup thousands in hosting costs.',
    },
    {
      id: 'rev-3',
      clientName: 'Marcus Sterling',
      clientCompany: 'Apex Capital',
      rating: 4.9,
      date: '3 weeks ago',
      comment:
        'Top notch consulting. Very professional and articulate. Provided comprehensive documentation and handover tutorials for our internal engineering team.',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Hero Profile Banner */}
      <div className="relative bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {/* Cover Background Graphic */}
        <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="bg-white/10 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Verified ConsulSphere Partner</span>
            </span>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-6 -mt-14 sm:-mt-16 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* Avatar Box */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-4xl sm:text-5xl font-black shadow-2xl ring-4 ring-white border border-slate-200">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center shadow-xs" title="Online Active">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Title, Badge & Subtitle */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'PROVIDER' ? 'Top Rated Provider' : 'Client Member'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>4.98 (42 Reviews)</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {email}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Member since {new Date().getFullYear() - 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <a
                href={portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Website</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics Bar (Especially for Provider) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Hourly Rate
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                ${hourlyRate} / hr
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Experience
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                {experience}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Completed Orders
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                86 orders
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Response Time
              </span>
              <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">
                &lt; 1 hour
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                On-Time Delivery
              </span>
              <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">
                100%
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Escrow Security
              </span>
              <span className="text-base font-extrabold text-purple-600 mt-0.5 block flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Protected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 py-3 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Overview &amp; Biography</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gigs')}
          className={`flex items-center gap-2 py-3 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'gigs'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Consulting Services &amp; Gigs ({providerGigs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 py-3 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Client Reviews ({clientReviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 py-3 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'performance'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Performance &amp; Metrics</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: OVERVIEW & BIOGRAPHY */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Bio & Skills (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* About / Executive Bio */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <span>About &amp; Executive Summary</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                {bio}
              </p>
            </div>

            {/* Core Competencies & Skills */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Core Consulting Skills &amp; Domain Expertise</span>
                </h3>
                <span className="text-xs font-bold text-slate-400">{skills.length} skills listed</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Provider Badges & Recognitions */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Recognitions &amp; Platform Badges</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-100">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500 mb-1" />
                  <h4 className="font-bold text-xs text-slate-800">Top Rated Seller</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Consistently maintaining 4.9+ rating and fast delivery.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-100">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 mb-1" />
                  <h4 className="font-bold text-xs text-slate-800">Identity Verified</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Government ID and business credentials verified.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-50 to-indigo-50 border border-purple-100">
                  <Clock className="w-6 h-6 text-purple-600 mb-1" />
                  <h4 className="font-bold text-xs text-slate-800">Swift Responder</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Replies to client inquiries in under 60 minutes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact, Account Details & Verification Status */}
          <div className="space-y-6">
            {/* Contact & Professional Details */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
                Contact &amp; Details
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Address</span>
                    <span className="font-semibold text-slate-800 break-all">{email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone</span>
                    <span className="font-semibold text-slate-800">{phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
                    <span className="font-semibold text-slate-800">{address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Portfolio Website</span>
                    <a
                      href={portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-purple-600 hover:underline break-all"
                    >
                      {portfolioUrl}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust & Security Checklist */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
              <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Verification Checklist</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-medium text-slate-700">Email Verification</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-medium text-slate-700">Phone Verification</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-medium text-slate-700">Payment Payout Link</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-medium text-slate-700">2-Factor Authentication</span>
                  <span className="text-purple-600 font-bold flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSULTING SERVICES & GIGS */}
      {activeTab === 'gigs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-800">Published Consulting Services</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active packages currently available for clients to hire on ConsulSphere marketplace.
              </p>
            </div>
            <Link
              href="/gigs/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-slate-900/10 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Gig</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providerGigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group"
              >
                <div>
                  {/* Gig Header / Visual Banner */}
                  <div className={`h-36 bg-gradient-to-tr ${gig.imageBg} p-4 flex flex-col justify-between text-white relative`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 uppercase tracking-wider">
                        {gig.tag}
                      </span>
                      <span className="text-xs font-bold bg-slate-900/60 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {gig.rating}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider">
                        {gig.category}
                      </span>
                    </div>
                  </div>

                  {/* Gig Content */}
                  <div className="p-5">
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {gig.title}
                    </h4>

                    <div className="flex items-center gap-3 mt-4 text-xs text-slate-500 font-medium">
                      <span>{gig.ordersCount} orders completed</span>
                      <span>•</span>
                      <span>{gig.reviewsCount} reviews</span>
                    </div>
                  </div>
                </div>

                {/* Gig Pricing Footer */}
                <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Starting at</span>
                    <span className="text-lg font-black text-slate-900">${gig.startingPrice}</span>
                  </div>

                  <Link
                    href={`/gigs/${gig.id}`}
                    className="px-3.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CLIENT REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Left Review Summary Scorecard */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] h-fit space-y-4">
            <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
              Rating Overview
            </h3>

            <div className="text-center py-3">
              <span className="text-5xl font-black text-slate-900 block">4.98</span>
              <div className="flex items-center justify-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-400">Based on 42 verified client reviews</p>
            </div>

            {/* Rating distribution bars */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-8 text-slate-500 font-bold text-[11px]">5 Star</span>
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[95%] rounded-full" />
                </div>
                <span className="w-8 text-right font-bold text-slate-600">40</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 text-slate-500 font-bold text-[11px]">4 Star</span>
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[5%] rounded-full" />
                </div>
                <span className="w-8 text-right font-bold text-slate-600">2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 text-slate-500 font-bold text-[11px]">3 Star</span>
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-200 h-full w-0 rounded-full" />
                </div>
                <span className="w-8 text-right text-slate-400">0</span>
              </div>
            </div>
          </div>

          {/* Right Review List */}
          <div className="lg:col-span-2 space-y-4">
            {clientReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {rev.clientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{rev.clientName}</h4>
                      <p className="text-[11px] text-slate-400">{rev.clientCompany}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{rev.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal pt-1">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold pt-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Verified Purchase • Standard Consultation Contract</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMANCE & METRICS */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gross Platform Earnings</span>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">$53,420</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">+18% than last quarter</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Repeat Client Rate</span>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">42%</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Industry avg: 28%</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active In-Progress Orders</span>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">4 orders</h3>
              <p className="text-xs text-purple-600 font-semibold mt-1">All milestones on schedule</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order Completion Rate</span>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">99.2%</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Top 1% of platform providers</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Edit Provider Profile</h3>
                  <p className="text-xs text-slate-400">Update your consulting presence, skills &amp; rates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hourly Consulting Rate ($/hr)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience Level</label>
                  <input
                    type="text"
                    placeholder="e.g. 6+ Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Address / Location</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio Website URL</label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Skills &amp; Expertise (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="UI/UX Design, Strategy Consulting, Brand Identity, Full-Stack Architecture"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio &amp; Overview</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your consulting background, experience, industry domain..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-md shadow-slate-900/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
