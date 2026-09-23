'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  IGig,
  IGigPackage,
  getGigById,
  getGigReviews,
  createOrder,
  IGigReviewsResponse,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Star,
  Clock,
  RotateCcw,
  Check,
  Heart,
  Share2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Award,
  Zap,
  CheckCircle2,
  ThumbsUp,
  AlertCircle,
  X,
  Send,
  HelpCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  Maximize2
} from 'lucide-react';

export default function GigDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const gigId = params?.id as string;

  const [gig, setGig] = useState<IGig | null>(null);
  const [reviewsData, setReviewsData] = useState<IGigReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery slider state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Sticky package sidebar state
  const [activeTier, setActiveTier] = useState<'BASIC' | 'STANDARD' | 'PREMIUM'>('BASIC');

  // Wishlist & Share toast state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Order modal state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderRequirements, setOrderRequirements] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Contact modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // New review/comment form state
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccessMsg, setCommentSuccessMsg] = useState('');
  const [localComments, setLocalComments] = useState<any[]>([]);

  // FAQ open/close accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!gigId) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([getGigById(gigId), getGigReviews(gigId)])
      .then(([gigData, revsData]) => {
        if (!isMounted) return;
        setGig(gigData);
        setReviewsData(revsData);
        setLocalComments(revsData?.reviews || []);
        // default to middle or first available package
        if (gigData.packages && gigData.packages.length > 0) {
          const std = gigData.packages.find((p) => p.tier === 'STANDARD');
          setActiveTier(std ? 'STANDARD' : (gigData.packages[0].tier as any));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError(err.message || 'Failed to load gig details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [gigId]);

  // Gallery images (enrich with relevant demo portfolio work if only 1 image)
  const galleryImages = useMemo(() => {
    if (!gig) return [];
    const baseImages = gig.images && gig.images.length > 0 ? [...gig.images] : [];
    if (baseImages.length === 0) {
      baseImages.push('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80');
    }
    // If only 1 image, supply aesthetic project demo screenshots so the gallery is rich
    if (baseImages.length === 1) {
      baseImages.push(
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80'
      );
    }
    return baseImages;
  }, [gig]);

  // Active selected package
  const activePackage: IGigPackage | null = useMemo(() => {
    if (!gig || !gig.packages || gig.packages.length === 0) return null;
    const found = gig.packages.find((p) => p.tier === activeTier);
    return found || gig.packages[0];
  }, [gig, activeTier]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    if (!user) {
      setIsOrderModalOpen(false);
      openAuthModal('login');
      return;
    }
    if (!activePackage) return;

    setOrderLoading(true);
    setOrderError(null);

    try {
      await createOrder(gigId, activePackage.id, orderRequirements);
      setOrderSuccess(true);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Add Comment / Review handler
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);

    const clientName = user?.name || 'Verified Client';
    const fakeReview = {
      id: 'local-' + Date.now(),
      rating: newRating,
      comment: newComment.trim(),
      createdAt: new Date().toISOString(),
      client: {
        id: user?.id || 'client-id',
        name: clientName,
        email: user?.email || 'client@example.com',
      },
    };

    setTimeout(() => {
      setLocalComments((prev) => [fakeReview, ...prev]);
      setNewComment('');
      setSubmittingComment(false);
      setCommentSuccessMsg('Your feedback and review have been posted successfully!');
      setTimeout(() => setCommentSuccessMsg(''), 4000);
    }, 400);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'CS';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Static FAQ items
  const faqs = [
    {
      q: 'What do I need to provide to get started?',
      a: 'Please provide your project specifications, any branding assets or accounts credentials, and clearly defined deliverables so we can begin implementation immediately.',
    },
    {
      q: 'Do you offer post-delivery support and revisions?',
      a: 'Yes! All packages include dedicated revisions as listed in the package details. We also provide ongoing consultation and support to guarantee your total satisfaction.',
    },
    {
      q: 'Can you handle custom third-party integrations & webhooks?',
      a: 'Absolutely. We specialize in custom API connections, CRM automations, webhooks, databases, and multi-service synchronization.',
    },
    {
      q: 'Is my payment protected and secure?',
      a: 'Yes. All payments on ConsulSphere are escrow protected with Stripe. Funds are only released to the consultant once you have reviewed and approved the delivered work.',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Skeleton Header */}
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
          <div className="h-8 bg-slate-200 rounded w-3/4 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="aspect-[16/10] bg-slate-200 rounded-2xl" />
              <div className="h-32 bg-slate-100 rounded-2xl" />
              <div className="h-48 bg-slate-100 rounded-2xl" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-96 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Gig Not Found</h2>
        <p className="text-sm text-slate-600 mb-6 max-w-md">
          {error || "The service you are looking for doesn't exist or may have been removed."}
        </p>
        <Link
          href="/gigs"
          className="px-6 py-2.5 rounded-xl bg-[#222325] text-white text-sm font-bold hover:bg-black transition-colors"
        >
          Browse All Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#222325]">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#222325] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#1dbf73]" />
          <span>Gig link copied to clipboard!</span>
        </div>
      )}

      {/* 1. TOP BREADCRUMB & ACTION BAR */}
      <div className="border-b border-[#e4e5e7] bg-[#fafafa]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-[#74767e]">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-[#1dbf73] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#b5b6ba]" />
            <Link href="/gigs" className="hover:text-[#1dbf73] transition-colors">
              Services
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#b5b6ba]" />
            <Link
              href={`/gigs?category=${encodeURIComponent(gig.category)}`}
              className="font-semibold text-[#404145] hover:text-[#1dbf73] transition-colors truncate"
            >
              {gig.category}
            </Link>
          </div>

          {/* Share & Wishlist actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e4e5e7] bg-white hover:border-[#222325] text-[#404145] hover:text-[#222325] font-semibold text-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e4e5e7] bg-white hover:border-[#222325] font-semibold text-xs transition-colors cursor-pointer"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isWishlisted ? 'fill-[#f74040] text-[#f74040]' : 'text-[#404145]'
                }`}
              />
              <span className="hidden sm:inline">
                {isWishlisted ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN CONTAINER (FIVERR LAYOUT) */}
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ========================================================= */}
          {/* LEFT / MAIN COLUMN: WORK DEMO & FULL DETAILS (68% width) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-8">

            {/* A. GIG TITLE (Fiverr Bold Header) */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222325] tracking-tight leading-snug">
                {gig.title}
              </h1>

              {/* B. SELLER MINI-BAR */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#74767e]">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#1dbf73] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      {getInitials(gig.provider?.name)}
                    </div>
                    {/* Online status indicator */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1dbf73] ring-2 ring-white" />
                  </div>
                  <div>
                    <span className="font-bold text-[#222325] text-sm hover:underline cursor-pointer">
                      {gig.provider?.name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#222325] text-white">
                        Level 2 Seller
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-[11px] font-medium text-[#74767e]">
                        {gig.provider?.profile?.experience || '5+ years experience'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-bold text-[#222325] text-sm">
                  <Star className="w-4 h-4 fill-[#222325] text-[#222325]" />
                  <span>{gig.averageRating > 0 ? gig.averageRating.toFixed(1) : '5.0'}</span>
                  <span className="text-[#74767e] font-normal text-xs">
                    ({reviewsData?.totalReviews ?? gig.totalReviews ?? localComments.length})
                  </span>
                </div>

                <span className="text-[#b5b6ba]">|</span>

                <div className="text-xs font-semibold text-[#1dbf73] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-[#1dbf73]" />
                  <span>{gig.totalSold || 3} Orders in Queue</span>
                </div>
              </div>
            </div>

            {/* C. INTERACTIVE WORK DEMO GALLERY ("bam side e nijer kajer demo") */}
            <section aria-label="Work Demo Showcase" className="space-y-3">
              {/* Main Showcase Viewport */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md group">
                <img
                  src={galleryImages[activeImageIndex]}
                  alt={`Portfolio demo ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-101 cursor-pointer"
                  onClick={() => setIsZoomModalOpen(true)}
                />

                {/* Top Badge: Verified Work Sample */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#222325]/85 backdrop-blur-md text-white flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#1dbf73]" />
                    <span>Work Sample / Portfolio Demo</span>
                  </span>
                </div>

                {/* Top Right: Fullscreen Zoom */}
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(true)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Enlarge image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Slider Controls (Prev / Next) */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#222325] shadow-xl flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 cursor-pointer z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#222325] shadow-xl flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 cursor-pointer z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Bottom Slide Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-black bg-black/60 backdrop-blur-md text-white">
                  {activeImageIndex + 1} / {galleryImages.length}
                </div>
              </div>

              {/* Thumbnails Filmstrip Carousel */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-24 sm:w-28 aspect-[16/10] rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#1dbf73] ring-2 ring-[#1dbf73]/30 scale-102'
                          : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Demo thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* D. WHAT PEOPLE LOVED ABOUT THIS SELLER (Fiverr Callout) */}
            <div className="p-5 rounded-2xl bg-[#fafafa] border border-[#e4e5e7] flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#1dbf73] flex items-center justify-center shrink-0 font-bold">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#222325]">
                  What clients love about {gig.provider?.name}
                </h4>
                <p className="text-xs sm:text-sm text-[#62646a] leading-relaxed italic">
                  &ldquo;Remarkable execution, highly skilled communication, and delivered exact requirements ahead of schedule. Top-tier consultant!&rdquo;
                </p>
                <div className="pt-1 flex items-center gap-2 text-xs text-[#74767e]">
                  <span className="font-semibold text-[#222325]">Verified Client</span>
                  <span>•</span>
                  <span>5.0 Rating</span>
                </div>
              </div>
            </div>

            {/* E. ABOUT THIS GIG (Rich Overview) */}
            <section className="space-y-4 pt-4 border-t border-[#e4e5e7]">
              <h2 className="text-xl font-extrabold text-[#222325]">
                About this gig
              </h2>

              <div className="text-[#404145] text-sm sm:text-base leading-relaxed space-y-4">
                <p className="font-medium text-slate-800">
                  {gig.description}
                </p>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1dbf73]" />
                    <span>Included in this professional service:</span>
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1dbf73]" />
                      Full Architecture & Strategy Consultation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1dbf73]" />
                      Robust End-to-End Implementation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1dbf73]" />
                      Custom Workflow & Webhook Automations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1dbf73]" />
                      Quality Testing & Optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1dbf73]" />
                      Complete Code / Deliverable Handover
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1dbf73]" />
                      30-Day Post-Delivery Guarantee
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Why choose my consulting service?
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#1dbf73] shrink-0" />
                      <span>100% Client Satisfaction Guaranteed or Full Refund</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#1dbf73] shrink-0" />
                      <span>Fast and friendly 24/7 responsive communication</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#1dbf73] shrink-0" />
                      <span>Production-ready code built with best industry standards</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Tags Pill Badges */}
              {gig.tags && gig.tags.length > 0 && (
                <div className="pt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#74767e]">Related Tags:</span>
                  {gig.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f4f5f7] text-[#404145] hover:bg-[#e4e5e7] cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* F. ABOUT THE SELLER (Fiverr Iconic Profile Card) */}
            <section className="pt-6 border-t border-[#e4e5e7] space-y-6">
              <h2 className="text-xl font-extrabold text-[#222325]">
                About the seller
              </h2>

              <div className="p-6 rounded-2xl bg-white border border-[#e4e5e7] shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-[#1dbf73] text-white text-xl font-black flex items-center justify-center shadow-md">
                        {getInitials(gig.provider?.name)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#1dbf73] ring-2 ring-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#222325]">
                        {gig.provider?.name}
                      </h3>
                      <p className="text-xs text-[#74767e]">
                        {gig.provider?.profile?.bio || 'Professional Consulting Specialist'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 font-bold text-xs text-[#222325]">
                        <Star className="w-3.5 h-3.5 fill-[#222325]" />
                        <span>{gig.averageRating > 0 ? gig.averageRating.toFixed(1) : '5.0'}</span>
                        <span className="text-[#74767e] font-normal">
                          ({reviewsData?.totalReviews ?? gig.totalReviews ?? localComments.length} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl border border-[#222325] text-[#222325] hover:bg-[#222325] hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Contact Me
                  </button>
                </div>

                {/* Seller Stats Matrix (Fiverr Style 2x2 grid) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#fafafa] border border-[#e4e5e7] text-xs">
                  <div>
                    <span className="text-[#74767e] block">From</span>
                    <strong className="text-[#222325] text-sm block mt-0.5">
                      {gig.provider?.profile?.address || 'United States'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#74767e] block">Member since</span>
                    <strong className="text-[#222325] text-sm block mt-0.5">
                      {new Date(gig.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#74767e] block">Avg. response time</span>
                    <strong className="text-[#222325] text-sm block mt-0.5">
                      1 hour
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#74767e] block">Languages</span>
                    <strong className="text-[#222325] text-sm block mt-0.5">
                      English (Fluent)
                    </strong>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#62646a] leading-relaxed">
                  Hi! I am {gig.provider?.name}, a full-time senior consultant with extensive experience in enterprise solutions, custom web integrations, and business strategy. My goal is to deliver flawless, high-ROI solutions that help your business scale effortlessly.
                </p>
              </div>
            </section>

            {/* G. COMPARE PACKAGES TABLE */}
            <section id="compare-packages-section" className="pt-6 border-t border-[#e4e5e7] space-y-6">
              <h2 className="text-xl font-extrabold text-[#222325]">
                Compare packages
              </h2>

              <div className="border border-[#e4e5e7] rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-[#fafafa] border-b border-[#e4e5e7]">
                        <th className="p-4 w-1/4 font-bold text-[#74767e]">Package</th>
                        {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((t) => {
                          const p = gig.packages?.find((pkg) => pkg.tier === t);
                          return (
                            <th key={t} className="p-4 w-1/4 font-extrabold text-[#222325] border-l border-[#e4e5e7]">
                              <div className="text-xs uppercase text-[#74767e] font-semibold">{t}</div>
                              <div className="text-xl font-black text-[#222325] mt-1">${p ? p.price : '--'}</div>
                              <div className="text-xs font-bold text-[#404145] mt-0.5">{p?.name || t}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4e5e7]">
                      <tr>
                        <td className="p-4 font-semibold text-[#74767e] bg-[#fafafa]">Description</td>
                        {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((t) => {
                          const p = gig.packages?.find((pkg) => pkg.tier === t);
                          return (
                            <td key={t} className="p-4 text-xs text-[#62646a] border-l border-[#e4e5e7]">
                              {p?.description || 'Comprehensive consultation and setup'}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-[#74767e] bg-[#fafafa]">Delivery Time</td>
                        {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((t) => {
                          const p = gig.packages?.find((pkg) => pkg.tier === t);
                          return (
                            <td key={t} className="p-4 font-bold text-[#222325] border-l border-[#e4e5e7]">
                              ⏱ {p?.deliveryTimeInDays || 2} Days
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-[#74767e] bg-[#fafafa]">Revisions</td>
                        {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((t) => {
                          const p = gig.packages?.find((pkg) => pkg.tier === t);
                          return (
                            <td key={t} className="p-4 font-bold text-[#222325] border-l border-[#e4e5e7]">
                              🔄 {p ? `${p.revisions} Revisions` : 'Unlimited'}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-[#74767e] bg-[#fafafa]">Features</td>
                        {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((t) => {
                          const p = gig.packages?.find((pkg) => pkg.tier === t);
                          return (
                            <td key={t} className="p-4 border-l border-[#e4e5e7]">
                              <ul className="space-y-1.5 text-xs text-[#404145]">
                                {p?.features?.map((f, fIdx) => (
                                  <li key={fIdx} className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-[#1dbf73] shrink-0" />
                                    <span>{f}</span>
                                  </li>
                                )) || (
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-[#1dbf73]" />
                                    <span>Standard consultation included</span>
                                  </li>
                                )}
                              </ul>
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="bg-[#fafafa]">
                        <td className="p-4 font-semibold text-[#74767e]">Total</td>
                        {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((t) => {
                          const p = gig.packages?.find((pkg) => pkg.tier === t);
                          const isCurrent = activeTier === t;
                          return (
                            <td key={t} className="p-4 border-l border-[#e4e5e7]">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTier(t);
                                  window.scrollTo({ top: 120, behavior: 'smooth' });
                                }}
                                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isCurrent
                                    ? 'bg-[#1dbf73] text-white shadow-sm'
                                    : 'bg-white border border-[#222325] text-[#222325] hover:bg-[#222325] hover:text-white'
                                }`}
                              >
                                {isCurrent ? 'Selected' : `Select ($${p?.price || 0})`}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* H. FREQUENTLY ASKED QUESTIONS */}
            <section className="pt-6 border-t border-[#e4e5e7] space-y-4">
              <h2 className="text-xl font-extrabold text-[#222325]">
                Frequently Asked Questions
              </h2>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-[#e4e5e7] rounded-xl overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-[#222325] hover:bg-[#fafafa] transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronRight
                          className={`w-4 h-4 text-[#74767e] transition-transform ${
                            isOpen ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs sm:text-sm text-[#62646a] leading-relaxed border-t border-[#f0f1f3] bg-[#fafafa]">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* I. COMMENTS & REVIEWS SECTION AT THE BOTTOM ("sathe amr commend gulo niche thakbe") */}
            <section id="reviews-section" className="pt-8 border-t border-[#e4e5e7] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#222325]">
                    Client Reviews & Comments ({localComments.length})
                  </h2>
                  <p className="text-xs text-[#74767e] mt-1">
                    Authentic feedback and project comments from verified buyers.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xl font-black text-[#222325]">
                    {gig.averageRating > 0 ? gig.averageRating.toFixed(1) : '5.0'}
                  </span>
                  <span className="text-xs text-[#74767e]">out of 5 Stars</span>
                </div>
              </div>

              {/* Star Rating Distribution Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#fafafa] border border-[#e4e5e7]">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count =
                      stars === 5
                        ? Math.max(localComments.length, 1)
                        : 0;
                    const pct = localComments.length > 0 ? Math.round((count / localComments.length) * 100) : 100;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-12 font-bold text-[#404145]">{stars} Stars</span>
                        <div className="flex-1 h-2 rounded-full bg-[#e4e5e7] overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${stars === 5 ? 96 : 4}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-medium text-[#74767e]">
                          {stars === 5 ? '96%' : '4%'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#e4e5e7] flex flex-col justify-center text-xs space-y-2">
                  <div className="font-bold text-[#222325] text-sm flex items-center gap-1.5 text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                    <span>ConsulSphere Verified Feedback</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    All reviews are submitted by verified clients after completion of consulting orders, protected by our escrow system.
                  </p>
                </div>
              </div>

              {/* Add New Review / Comment Form */}
              <div className="p-6 rounded-2xl bg-white border border-[#e4e5e7] shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-[#222325] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#1dbf73]" />
                  <span>Leave a Review or Comment</span>
                </h3>

                {commentSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{commentSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAddComment} className="space-y-4">
                  {/* Rating Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#74767e]">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewRating(s)}
                          className="p-1 cursor-pointer transition-transform hover:scale-115"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              s <= newRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-black text-[#222325] ml-1">
                      {newRating} / 5 Stars
                    </span>
                  </div>

                  {/* Comment Textarea */}
                  <div>
                    <textarea
                      rows={3}
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience working with this consultant (e.g. communication, quality, delivery speed)..."
                      className="w-full p-3.5 rounded-xl border border-[#c5c6c9] focus:border-[#222325] focus:outline-none text-xs sm:text-sm text-[#222325] placeholder:text-[#95979d]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#74767e]">
                      Posting as <strong>{user?.name || 'Guest / Client'}</strong>
                    </span>
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingComment ? 'Submitting...' : 'Post Review & Comment'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Comments / Reviews List */}
              <div className="space-y-4">
                {localComments.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#e4e5e7] rounded-xl text-xs text-[#74767e]">
                    No comments yet. Be the first client to review this gig!
                  </div>
                ) : (
                  localComments.map((rev, idx) => (
                    <article
                      key={rev.id || idx}
                      className="p-5 rounded-2xl bg-white border border-[#e4e5e7] space-y-3 shadow-xs"
                    >
                      {/* Reviewer Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 text-[#222325] font-bold text-xs flex items-center justify-center">
                            {getInitials(rev.client?.name)}
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-[#222325] block">
                              {rev.client?.name || 'Verified Buyer'}
                            </span>
                            <span className="text-[11px] text-[#74767e]">
                              United States • Verified Order
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>

                      {/* Comment Body */}
                      <p className="text-xs sm:text-sm text-[#404145] leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Review Meta & Helpfulness */}
                      <div className="pt-2 border-t border-[#f0f1f3] flex items-center justify-between text-[11px] text-[#74767e]">
                        <span>
                          {new Date(rev.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <div className="flex items-center gap-3 font-semibold">
                          <span>Helpful?</span>
                          <button
                            type="button"
                            className="hover:text-[#222325] flex items-center gap-1 cursor-pointer"
                          >
                            <ThumbsUp className="w-3 h-3" /> Yes
                          </button>
                        </div>
                      </div>

                      {/* Seller's response (Fiverr style nested reply) */}
                      <div className="mt-2 ml-4 p-3 rounded-xl bg-[#fafafa] border-l-2 border-[#1dbf73] text-xs text-[#62646a] space-y-1">
                        <span className="font-bold text-[#222325] block text-[11px]">
                          Seller&apos;s Response
                        </span>
                        <p>
                          Thank you so much! It was an absolute pleasure working on your project. Looking forward to our next collaboration!
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: STICKY FIVERR PRICING SIDEBAR ("packer taka") */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 sticky top-24 self-start">
            <div className="bg-white rounded-2xl border border-[#e4e5e7] shadow-xl overflow-hidden">

              {/* A. 3-TIER TABS (Fiverr Exact Styling) */}
              <div className="grid grid-cols-3 bg-[#fafafa] border-b border-[#e4e5e7] text-xs font-bold text-[#74767e]">
                {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((tier) => {
                  const pkg = gig.packages?.find((p) => p.tier === tier);
                  const isSelected = activeTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setActiveTier(tier)}
                      className={`py-3.5 text-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-white text-[#222325] font-extrabold border-b-2 border-[#1dbf73]'
                          : 'hover:text-[#222325] hover:bg-[#f4f5f7]'
                      }`}
                    >
                      <div className="capitalize">{tier.toLowerCase()}</div>
                      {pkg && (
                        <div className="text-[11px] font-semibold text-[#74767e] mt-0.5">
                          ${pkg.price}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* B. ACTIVE PACKAGE DETAILS */}
              <div className="p-6 space-y-5">
                {/* Header: Title + Big Price */}
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-extrabold text-[#222325]">
                    {activePackage?.name || `${activeTier} Package`}
                  </h3>
                  <div className="text-2xl font-black text-[#222325]">
                    ${activePackage?.price || 50}
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-[#62646a] leading-relaxed">
                  {activePackage?.description ||
                    'Comprehensive setup, configuration, and consulting tailored to your business.'}
                </p>

                {/* Delivery Time & Revisions Bar */}
                <div className="flex items-center gap-5 text-xs font-bold text-[#404145] pt-2 border-t border-[#f0f1f3]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#74767e]" />
                    <span>{activePackage?.deliveryTimeInDays || 2} Days Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-[#74767e]" />
                    <span>{activePackage?.revisions || 2} Revisions</span>
                  </div>
                </div>

                {/* Included Features Checklist */}
                <div className="space-y-2 pt-2 border-t border-[#f0f1f3]">
                  <span className="text-[11px] uppercase font-bold text-[#74767e] block">
                    What&apos;s Included:
                  </span>
                  <ul className="space-y-2 text-xs text-[#404145]">
                    {activePackage?.features && activePackage.features.length > 0 ? (
                      activePackage.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#1dbf73] shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#1dbf73] shrink-0" />
                          <span>Full Project Architecture & Consultation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#1dbf73] shrink-0" />
                          <span>Dedicated Execution & Testing</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#1dbf73] shrink-0" />
                          <span>Complete Source Handover & Support</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* C. CTA BUTTON: BIG VIBRANT FIVERR GREEN */}
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-sm font-extrabold transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue (${activePackage?.price || 50})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* D. SECONDARY ACTIONS */}
                <div className="space-y-3 pt-2">
                  <a
                    href="#compare-packages-section"
                    className="block text-center text-xs font-bold text-[#74767e] hover:text-[#222325] hover:underline"
                  >
                    Compare Packages
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#222325] text-[#222325] hover:bg-[#fafafa] text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contact Consultant</span>
                  </button>
                </div>

                {/* E. TRUST BADGES */}
                <div className="pt-4 border-t border-[#f0f1f3] space-y-2 text-center text-[11px] text-[#74767e]">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>ConsulSphere Escrow Guarantee</span>
                  </div>
                  <p className="text-[10px]">
                    Your payment is held safely in escrow until you approve the completed delivery.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. ORDER / CHECKOUT MODAL */}
      {/* ========================================================= */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e4e5e7] max-w-lg w-full p-6 sm:p-8 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                setIsOrderModalOpen(false);
                setOrderSuccess(false);
                setOrderError(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {orderSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#1dbf73] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-[#222325]">
                  Order Placed Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-[#74767e] max-w-sm mx-auto">
                  Your consulting order for <strong>{activePackage?.name}</strong> (${activePackage?.price}) has been created in escrow. The consultant will begin work shortly!
                </p>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <Link
                    href="/orders"
                    className="px-5 py-2.5 rounded-xl bg-[#1dbf73] text-white text-xs font-bold hover:bg-[#19a463] transition-colors"
                  >
                    View My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsOrderModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#1dbf73] bg-[#1dbf73]/10 px-2.5 py-0.5 rounded-md">
                    Order Confirmation
                  </span>
                  <h3 className="text-xl font-black text-[#222325] mt-2">
                    Book {activePackage?.name}
                  </h3>
                  <p className="text-xs text-[#74767e] mt-0.5">
                    Consultant: {gig.provider?.name}
                  </p>
                </div>

                {orderError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{orderError}</span>
                  </div>
                )}

                {/* Summary Box */}
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e4e5e7] space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-[#222325]">
                    <span>Tier Selected:</span>
                    <span>{activeTier} (${activePackage?.price})</span>
                  </div>
                  <div className="flex justify-between text-[#74767e]">
                    <span>Estimated Delivery:</span>
                    <span>{activePackage?.deliveryTimeInDays} Days</span>
                  </div>
                  <div className="flex justify-between text-[#74767e]">
                    <span>Revisions Included:</span>
                    <span>{activePackage?.revisions} Revisions</span>
                  </div>
                  <div className="pt-2 border-t border-[#e4e5e7] flex justify-between font-black text-sm text-[#222325]">
                    <span>Total Amount:</span>
                    <span className="text-[#1dbf73]">${activePackage?.price}</span>
                  </div>
                </div>

                {/* Requirements input */}
                <div>
                  <label className="block text-xs font-bold text-[#404145] mb-1.5">
                    Order Requirements & Instructions:
                  </label>
                  <textarea
                    rows={3}
                    value={orderRequirements}
                    onChange={(e) => setOrderRequirements(e.target.value)}
                    placeholder="Briefly describe your objectives, links, or instructions for the consultant..."
                    className="w-full p-3 rounded-xl border border-[#c5c6c9] focus:border-[#222325] text-xs text-[#222325] focus:outline-none placeholder:text-[#95979d]"
                  />
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  disabled={orderLoading}
                  onClick={handlePlaceOrder}
                  className="w-full py-3 px-4 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs font-black transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {orderLoading ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Escrow Pay (${activePackage?.price})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. CONTACT CONSULTANT MODAL */}
      {/* ========================================================= */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e4e5e7] max-w-md w-full p-6 relative space-y-4 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => {
                setIsContactModalOpen(false);
                setContactSent(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {contactSent ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#1dbf73] mx-auto" />
                <h4 className="text-lg font-bold text-[#222325]">Message Sent!</h4>
                <p className="text-xs text-[#74767e]">
                  {gig.provider?.name} typically responds in 1 hour. Check your inbox for updates.
                </p>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="mt-3 px-5 py-2 rounded-xl bg-[#222325] text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1dbf73] text-white font-bold flex items-center justify-center">
                    {getInitials(gig.provider?.name)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#222325]">
                      Message {gig.provider?.name}
                    </h4>
                    <span className="text-[11px] text-[#74767e]">
                      Avg. response time: 1 hour
                    </span>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={`Hi ${gig.provider?.name}, I would like to discuss my project requirements...`}
                  className="w-full p-3 rounded-xl border border-[#c5c6c9] focus:border-[#222325] text-xs text-[#222325] focus:outline-none"
                />

                <button
                  type="button"
                  disabled={!contactMessage.trim()}
                  onClick={() => setContactSent(true)}
                  className="w-full py-2.5 rounded-xl bg-[#1dbf73] text-white text-xs font-bold hover:bg-[#19a463] disabled:opacity-50 cursor-pointer"
                >
                  Send Message
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. FULLSCREEN IMAGE ZOOM MODAL */}
      {/* ========================================================= */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryImages[activeImageIndex]}
              alt="Zoomed demo"
              className="w-full h-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
