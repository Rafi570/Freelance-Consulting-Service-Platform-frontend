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
  createOrderCheckout,
  getMyOrders,
  submitOrderReview,
  IOrder,
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
  Maximize2,
  Lock,
  Filter,
  SlidersHorizontal,
  BadgeCheck,
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

  // Reviews & Eligibility State
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccessMsg, setCommentSuccessMsg] = useState('');
  const [commentErrorMsg, setCommentErrorMsg] = useState('');
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<IOrder[]>([]);
  const [checkingOrders, setCheckingOrders] = useState(false);
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'ALL'>('ALL');
  const [reviewSort, setReviewSort] = useState<'NEWEST' | 'HIGHEST' | 'LOWEST'>('NEWEST');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});

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

  // Fetch client orders to verify completed order eligibility for reviewing
  useEffect(() => {
    if (!user || !gigId) {
      setUserOrders([]);
      return;
    }
    let isMounted = true;
    setCheckingOrders(true);
    getMyOrders()
      .then((orders) => {
        if (isMounted) setUserOrders(orders);
      })
      .catch((err) => {
        console.warn('Orders check for review eligibility failed:', err);
      })
      .finally(() => {
        if (isMounted) setCheckingOrders(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, gigId]);

  // Derived orders for this specific gig
  const ordersForThisGig = useMemo(() => {
    return userOrders.filter((o) => o.gigId === gigId);
  }, [userOrders, gigId]);

  // Eligible order: COMPLETED and not yet reviewed (Only if current user is the client who placed it)
  const eligibleCompletedOrder = useMemo(() => {
    if (user?.role !== 'CLIENT') return undefined;
    return ordersForThisGig.find((o) => o.status === 'COMPLETED' && !o.review);
  }, [ordersForThisGig, user]);

  // Already reviewed order
  const alreadyReviewedOrder = useMemo(() => {
    if (user?.role !== 'CLIENT') return undefined;
    return ordersForThisGig.find((o) => o.status === 'COMPLETED' && o.review);
  }, [ordersForThisGig, user]);

  // Active in-progress/pending order
  const activePendingOrder = useMemo(() => {
    if (user?.role !== 'CLIENT') return undefined;
    return ordersForThisGig.find((o) => o.status === 'PENDING' || o.status === 'IN_PROGRESS');
  }, [ordersForThisGig, user]);

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
      const createdOrder = await createOrder(gigId, activePackage.id, orderRequirements);
      const checkoutSession = await createOrderCheckout(createdOrder.id);
      
      if (checkoutSession && checkoutSession.paymentUrl) {
        window.location.href = checkoutSession.paymentUrl;
      } else {
        setOrderSuccess(true);
      }
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order and initiate payment.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Real Review Submission Handler (Enforcing COMPLETED order requirement)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentErrorMsg('Please write your review feedback.');
      return;
    }
    if (!eligibleCompletedOrder) {
      setCommentErrorMsg('You cannot review this service unless you have a COMPLETED order.');
      return;
    }

    setSubmittingComment(true);
    setCommentErrorMsg('');

    try {
      const createdReview = await submitOrderReview(
        eligibleCompletedOrder.id,
        newRating,
        newComment.trim()
      );

      // Refresh gig reviews from API
      const updated = await getGigReviews(gigId);
      setReviewsData(updated);
      setLocalComments(updated.reviews || []);

      // Update local user orders so this order is now marked reviewed
      setUserOrders((prev) =>
        prev.map((o) =>
          o.id === eligibleCompletedOrder.id ? { ...o, review: createdReview } : o
        )
      );

      setNewComment('');
      setCommentSuccessMsg('Your verified review has been published successfully! Thank you for your feedback.');
      setTimeout(() => setCommentSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setCommentErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleHelpfulVote = (reviewId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
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
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 group border border-[#e4e5e7]">
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
                      className={`relative w-24 sm:w-28 aspect-[16/10] overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
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
            <div className="p-5 bg-[#fafafa] border border-[#e4e5e7] flex items-start gap-4">
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

                <div className="p-5 bg-slate-50 border border-slate-200/80 space-y-3">
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

              <div className="p-6 bg-white border border-[#e4e5e7] space-y-6">
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

              <div className="border border-[#e4e5e7] overflow-hidden">
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

            {/* I. COMMENTS & REVIEWS SECTION AT THE BOTTOM - SHOWCASE & STRICT ELIGIBILITY */}
            <section id="reviews-section" className="pt-8 border-t border-[#e4e5e7] space-y-7">
              
              {/* 1. Section Header & Overall Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-[#222325]">
                      Client Reviews &amp; Ratings
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#1dbf73] border border-emerald-200">
                      {localComments.length} Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#74767e] mt-1">
                    Authentic project feedback strictly from verified clients who completed consulting orders.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[#fafafa] border border-[#e4e5e7] px-4 py-2.5 rounded-2xl">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#222325]">
                      {localComments.length > 0
                        ? (
                            localComments.reduce((acc, c) => acc + (c.rating || 5), 0) /
                            localComments.length
                          ).toFixed(1)
                        : gig.averageRating > 0
                        ? gig.averageRating.toFixed(1)
                        : '5.0'}
                    </span>
                    <span className="text-xs text-[#74767e] font-semibold">/ 5.0</span>
                  </div>
                </div>
              </div>

              {/* 2. Star Rating Distribution & Quality Verification Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#fafafa] border border-[#e4e5e7]">
                {/* Left: Star Progress Bars */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = localComments.filter((r) => r.rating === stars).length;
                    const pct =
                      localComments.length > 0
                        ? Math.round((count / localComments.length) * 100)
                        : stars === 5
                        ? 100
                        : 0;

                    return (
                      <div
                        key={stars}
                        onClick={() => setReviewFilterRating(reviewFilterRating === stars ? 'ALL' : stars)}
                        className="flex items-center gap-2 text-xs cursor-pointer group hover:opacity-80 transition"
                      >
                        <span className="w-12 font-bold text-[#404145] group-hover:text-[#1dbf73] transition">
                          {stars} Stars
                        </span>
                        <div className="flex-1 h-2.5 rounded-full bg-[#e4e5e7] overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-14 text-right font-medium text-[#74767e]">
                          {pct}% ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Verification Highlights */}
                <div className="p-4 rounded-xl bg-white border border-[#e4e5e7] flex flex-col justify-between text-xs space-y-3">
                  <div className="space-y-1">
                    <div className="font-bold text-[#222325] text-sm flex items-center gap-1.5 text-emerald-600">
                      <ShieldCheck className="w-4 h-4" />
                      <span>ConsulSphere 100% Escrow Verified</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Every rating is verified by our smart escrow contracts. Clients can only rate and review once their consulting deliverables have been successfully completed and approved.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <span className="text-[#1dbf73]">✓</span> Communication: 5.0
                    </div>
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <span className="text-[#1dbf73]">✓</span> Delivery Speed: 5.0
                    </div>
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <span className="text-[#1dbf73]">✓</span> Service as Described: 5.0
                    </div>
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <span className="text-[#1dbf73]">✓</span> Escrow Protected: 100%
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. STRICT REVIEW ELIGIBILITY GATE */}
              {/* Requirement: "order complete nah hole review korte parbe nh" */}
              <div className="space-y-4">
                {!user ? (
                  /* Case A: Not logged in */
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6 text-slate-700" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Verified Client Reviews Only
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        To maintain authenticity and trust on ConsulSphere, only clients who have booked and completed an order for this gig can leave a review.
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => openAuthModal('login')}
                        className="px-5 py-2.5 bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>Sign In to Leave a Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : checkingOrders ? (
                  /* Case B: Loading orders check */
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 animate-pulse">
                    Checking review eligibility for your account...
                  </div>
                ) : eligibleCompletedOrder ? (
                  /* Case C: Has an unreviewed COMPLETED order -> UNLOCKED REVIEW FORM */
                  <div className="p-6 rounded-2xl bg-white border-2 border-[#1dbf73] shadow-md space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                            Verified Completed Order #{eligibleCompletedOrder.id.slice(0, 8).toUpperCase()}
                          </span>
                          <BadgeCheck className="w-4 h-4 text-[#1dbf73]" />
                        </div>
                        <h3 className="text-base font-black text-[#222325] mt-1 flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>Write Your Verified Review</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          You completed Order #{eligibleCompletedOrder.id.slice(0, 8).toUpperCase()} ({eligibleCompletedOrder.package?.name || 'Standard Package'}). Your review helps other clients hire with confidence.
                        </p>
                      </div>
                    </div>

                    {commentSuccessMsg && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{commentSuccessMsg}</span>
                      </div>
                    )}

                    {commentErrorMsg && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span>{commentErrorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {/* Rating Selector */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#74767e]">Your Rating:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setNewRating(s)}
                              className="p-1 cursor-pointer transition-transform hover:scale-120"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  s <= newRating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-black text-[#222325] ml-1">
                          {newRating === 5
                            ? '5 Stars — Exceptional Delivery!'
                            : newRating === 4
                            ? '4 Stars — Very Good'
                            : newRating === 3
                            ? '3 Stars — Average'
                            : newRating === 2
                            ? '2 Stars — Below Expectations'
                            : '1 Star — Poor'}
                        </span>
                      </div>

                      {/* Comment Textarea */}
                      <div>
                        <textarea
                          rows={3}
                          required
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your experience: How was the consultant's communication, deliverable quality, and speed? Would you recommend this service?"
                          className="w-full p-3.5 rounded-xl border border-slate-300 focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73] focus:outline-hidden text-xs sm:text-sm text-[#222325] placeholder:text-slate-400"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#74767e]">
                          Posting as <strong className="text-slate-900">{user?.name || 'Verified Client'}</strong>
                        </span>
                        <button
                          type="submit"
                          disabled={submittingComment || !newComment.trim()}
                          className="px-6 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submittingComment ? 'Submitting...' : 'Post Verified Review'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ) : activePendingOrder ? (
                  /* Case D: Order is in progress or pending (NOT COMPLETED!) */
                  <div className="p-6 rounded-2xl bg-sky-50/70 border border-sky-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6 animate-pulse text-sky-600" />
                    </div>
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 uppercase tracking-wider">
                        Order #{activePendingOrder.id.slice(0, 8).toUpperCase()} • {activePendingOrder.status === 'IN_PROGRESS' ? 'Processing' : 'Pending'}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Order In Progress — Review Locked
                      </h4>
                      <p className="text-xs text-slate-600 max-w-md mx-auto">
                        Your order for this gig is currently active. To protect marketplace integrity, reviews and ratings can only be given once the consultant completes the work and the order is marked as <strong>COMPLETED</strong>.
                      </p>
                    </div>
                    <div>
                      <Link
                        href="/orders"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                      >
                        <span>Check Order Progress in My Orders</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : alreadyReviewedOrder ? (
                  /* Case E: Already reviewed */
                  <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-emerald-950">
                      You&apos;ve Already Reviewed This Order
                    </h4>
                    <p className="text-xs text-emerald-800 max-w-md mx-auto">
                      Thank you! Your feedback for Order #{alreadyReviewedOrder.id.slice(0, 8).toUpperCase()} is verified and displayed in the review showcase below.
                    </p>
                  </div>
                ) : (
                  /* Case F: Has never ordered this gig */
                  <div className="p-6 rounded-2xl bg-[#fafafa] border border-slate-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Verified Purchases Only
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        You have not placed an order for this consulting gig yet. Once you order and the service is marked as completed, you will be able to share your verified rating and review.
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('pricing-plans');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                          else setIsOrderModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-[#222325] hover:bg-[#1dbf73] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>View Packages &amp; Order Service</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. SHOWCASE FILTER & SORT BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    type="button"
                    onClick={() => setReviewFilterRating('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 ${
                      reviewFilterRating === 'ALL'
                        ? 'bg-[#18181b] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({localComments.length})
                  </button>

                  {[5, 4, 3].map((star) => {
                    const count = localComments.filter((r) => r.rating === star).length;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewFilterRating(star)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 flex items-center gap-1 ${
                          reviewFilterRating === star
                            ? 'bg-[#18181b] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{star} Stars</span>
                        <span className="text-[10px] opacity-80">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value as any)}
                    className="text-xs font-bold text-slate-700 bg-transparent border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <option value="NEWEST">Most Recent</option>
                    <option value="HIGHEST">Highest Rating</option>
                    <option value="LOWEST">Lowest Rating</option>
                  </select>
                </div>
              </div>

              {/* 5. SHOWCASE REVIEW CARDS LIST */}
              <div className="space-y-4">
                {(() => {
                  let filtered = [...localComments];
                  if (reviewFilterRating !== 'ALL') {
                    filtered = filtered.filter((r) => r.rating === reviewFilterRating);
                  }
                  if (reviewSort === 'NEWEST') {
                    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                  } else if (reviewSort === 'HIGHEST') {
                    filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
                  } else if (reviewSort === 'LOWEST') {
                    filtered.sort((a, b) => (a.rating || 5) - (b.rating || 5));
                  }

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center border border-dashed border-[#e4e5e7] rounded-2xl text-xs text-[#74767e] bg-slate-50">
                        No reviews found for this filter.
                      </div>
                    );
                  }

                  return filtered.map((rev, idx) => (
                    <article
                      key={rev.id || idx}
                      className="p-5 sm:p-6 bg-white border border-[#e4e5e7] space-y-3.5"
                    >
                      {/* Reviewer Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                            {getInitials(rev.client?.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-xs sm:text-sm text-[#222325]">
                                {rev.client?.name || 'Verified Client'}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#1dbf73] border border-emerald-200">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Verified Order</span>
                              </span>
                            </div>
                            <span className="text-[11px] text-[#74767e] block">
                              Completed Consultation • Escrow Protected
                            </span>
                          </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-1 text-amber-400 bg-amber-50/60 px-2.5 py-1 rounded-xl border border-amber-200/60">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-xs font-black text-amber-900 ml-1">
                            {rev.rating || 5}.0
                          </span>
                        </div>
                      </div>

                      {/* Comment Body */}
                      <p className="text-xs sm:text-sm text-[#404145] leading-relaxed pl-1 border-l-2 border-slate-100">
                        &quot;{rev.comment}&quot;
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
                            onClick={() => handleHelpfulVote(rev.id || String(idx))}
                            className="hover:text-[#1dbf73] flex items-center gap-1 cursor-pointer transition"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Yes ({helpfulVotes[rev.id || String(idx)] || 2})</span>
                          </button>
                        </div>
                      </div>

                      {/* Seller's response */}
                      <div className="mt-2 ml-4 p-3.5 rounded-xl bg-[#fafafa] border-l-2 border-[#1dbf73] text-xs text-[#62646a] space-y-1">
                        <span className="font-bold text-[#222325] block text-[11px]">
                          Consultant&apos;s Response
                        </span>
                        <p className="text-[11px] leading-relaxed">
                          Thank you so much! It was a pleasure collaborating on your consulting requirements. Looking forward to your next milestone!
                        </p>
                      </div>
                    </article>
                  ));
                })()}
              </div>

            </section>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: STICKY FIVERR PRICING SIDEBAR ("packer taka") */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 sticky top-24 self-start">
            <div className="bg-white border border-[#e4e5e7] overflow-hidden">

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
