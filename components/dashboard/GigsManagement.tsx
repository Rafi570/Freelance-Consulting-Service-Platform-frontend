'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Layers,
  Tag,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Clock,
  RotateCcw,
  DollarSign,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Star,
  Upload,
  Crown,
  Calendar,
  User,
  ShieldCheck,
  ArrowRight,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  IGig,
  IGigPackage,
  IPackageInput,
  ICreateGigPayload,
  IMyGigsResponse,
  getMyGigs,
  getGigs,
  createGig,
  updateGig,
  toggleGigStatus,
  deleteGig,
  getGigFilters,
  uploadGigImages,
  IGigFilter
} from '@/lib/api';

interface GigsManagementProps {
  role?: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
}

const DEFAULT_WEB_DEV_IMAGE =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80';

const WEB_DEV_TEMPLATE: ICreateGigPayload = {
  title: 'I will develop a modern fullstack web application in React and Next.js',
  description:
    'Are you looking for a clean, ultra-responsive, and high-performance web application? I will build your custom website or web app from scratch using Next.js, React, TailwindCSS, and Node.js. Includes pixel-perfect design, mobile responsiveness, fast SEO, and robust backend integrations.',
  category: 'Webdevelopment',
  tags: ['webdevelopment', 'nextjs', 'react', 'fullstack', 'frontend'],
  images: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  ],
  packages: [
    {
      tier: 'BASIC',
      name: 'Starter Web Page',
      description:
        'Single responsive landing page with modern layout, mobile compatibility, and contact form integration.',
      price: 49,
      deliveryTimeInDays: 2,
      revisions: 1,
      features: ['1 Landing Page', 'Mobile Responsive', 'Clean Codebase', 'Contact Form Integration'],
    },
    {
      tier: 'STANDARD',
      name: 'Standard Business Website',
      description:
        'Complete 5-page responsive business website with custom UI/UX, SEO optimization, and API integration.',
      price: 149,
      deliveryTimeInDays: 5,
      revisions: 3,
      features: [
        'Up to 5 Pages',
        'Mobile Responsive',
        'SEO Meta & Schema',
        'API Integration',
        'Speed Optimization',
      ],
    },
    {
      tier: 'PREMIUM',
      name: 'Fullstack Web Application',
      description:
        'Complete fullstack web app with user authentication, custom database, payment processing, and priority support.',
      price: 349,
      deliveryTimeInDays: 10,
      revisions: 5,
      features: [
        'Full Stack Architecture',
        'Auth & Role Management',
        'Custom Database Schema',
        'Stripe Payment Gateway',
        '30-Day Free Support',
      ],
    },
  ],
};

const EMPTY_PACKAGES: IPackageInput[] = [
  {
    tier: 'BASIC',
    name: 'Basic Package',
    description: 'Essential core features to get your project started.',
    price: 30,
    deliveryTimeInDays: 2,
    revisions: 1,
    features: ['Core Deliverable', 'Source Files', 'Basic Support'],
  },
  {
    tier: 'STANDARD',
    name: 'Standard Package',
    description: 'Comprehensive solution for businesses ready to scale.',
    price: 90,
    deliveryTimeInDays: 4,
    revisions: 3,
    features: ['Everything in Basic', 'Commercial Use', 'High Resolution', 'Priority Revisions'],
  },
  {
    tier: 'PREMIUM',
    name: 'Premium Package',
    description: 'Ultimate end-to-end consulting package with VIP support.',
    price: 200,
    deliveryTimeInDays: 7,
    revisions: 5,
    features: [
      'Everything in Standard',
      'Full Commercial Rights',
      'Custom Integrations',
      'VIP 24/7 Dedicated Support',
    ],
  },
];

export default function GigsManagement({ role = 'PROVIDER' }: GigsManagementProps) {
  const { user } = useAuth();
  const isSuperAdmin = role === 'SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';

  // Data state
  const [gigs, setGigs] = useState<IGig[]>([]);
  const [quotaInfo, setQuotaInfo] = useState<{
    isSubscribed: boolean;
    gigLimit: string | number;
    totalCreated: number;
    remainingFreeGigs: string | number;
  }>({
    isSubscribed: false,
    gigLimit: 4,
    totalCreated: 0,
    remainingFreeGigs: 4,
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // VIEW DETAILS MODAL STATE (User requested)
  const [viewingGig, setViewingGig] = useState<IGig | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<ICreateGigPayload>({
    title: '',
    description: '',
    category: '',
    tags: ['webdevelopment', 'nextjs', 'react'],
    images: [DEFAULT_WEB_DEV_IMAGE],
    packages: EMPTY_PACKAGES,
  });
  const [tagInput, setTagInput] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Edit Modal State
  const [editingGig, setEditingGig] = useState<IGig | null>(null);
  const [editFormData, setEditFormData] = useState<ICreateGigPayload & { status: 'ACTIVE' | 'PAUSED' | 'DRAFT' }>({
    title: '',
    description: '',
    category: '',
    tags: [],
    images: [],
    status: 'ACTIVE',
    packages: EMPTY_PACKAGES,
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // Delete State
  const [deletingGig, setDeletingGig] = useState<IGig | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState<boolean>(false);

  // Status Toggling State
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Load Categories (Strictly from active categories created by Super Admin)
  const loadCategories = useCallback(async () => {
    try {
      const filtersData = await getGigFilters({ type: 'CATEGORY', isActive: true });
      const dynamicCategories = filtersData
        .map((f) => f.name?.trim())
        .filter((name): name is string => Boolean(name));

      setCategories(dynamicCategories);

      if (dynamicCategories.length > 0) {
        setFormData((prev) => ({
          ...prev,
          category: prev.category && dynamicCategories.includes(prev.category)
            ? prev.category
            : dynamicCategories[0],
        }));
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  }, []);

  // Load Gigs (No cache, instantaneous fetching)
  const loadGigs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (isSuperAdmin) {
        // Super Admin gets all platform gigs with fresh cache-busted fetch
        const res = await getGigs({
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          searchTerm: searchTerm.trim() || undefined,
          limit: 100,
          noCache: true,
        });
        const gigsList = Array.isArray(res?.data) ? res.data : [];
        setGigs(gigsList);
        setQuotaInfo({
          isSubscribed: true,
          gigLimit: 'Unlimited',
          totalCreated: gigsList.length,
          remainingFreeGigs: 'Unlimited',
        });
      } else {
        // Provider gets their own gigs directly from DB
        const data = await getMyGigs();
        setQuotaInfo({
          isSubscribed: data.isSubscribed,
          gigLimit: data.gigLimit,
          totalCreated: data.totalCreated,
          remainingFreeGigs: data.remainingFreeGigs,
        });

        let list = data.gigs || [];
        if (selectedCategory !== 'ALL') {
          list = list.filter(
            (g) => g.category?.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          list = list.filter(
            (g) =>
              g.title.toLowerCase().includes(s) ||
              g.description.toLowerCase().includes(s) ||
              g.tags.some((t) => t.toLowerCase().includes(s))
          );
        }
        if (selectedStatus !== 'ALL') {
          list = list.filter((g) => g.status === selectedStatus);
        }
        setGigs(list);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch gigs');
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin, selectedCategory, searchTerm, selectedStatus]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadGigs();
  }, [loadGigs]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filtered view list for the table
  const displayedGigs = useMemo(() => {
    let result = [...gigs];
    if (selectedCategory !== 'ALL') {
      result = result.filter(
        (g) => g.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (selectedStatus !== 'ALL') {
      result = result.filter((g) => g.status === selectedStatus);
    }
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(s) ||
          g.description.toLowerCase().includes(s) ||
          g.tags?.some((t) => t.toLowerCase().includes(s)) ||
          g.provider?.name?.toLowerCase().includes(s) ||
          g.provider?.email?.toLowerCase().includes(s)
      );
    }
    return result;
  }, [gigs, selectedCategory, selectedStatus, searchTerm]);

  // Stats calculation
  const totalGigsCount = gigs.length;
  const activeGigsCount = useMemo(() => gigs.filter((g) => g.status === 'ACTIVE').length, [gigs]);

  // Template auto-fill helper
  const handleApplyWebDevTemplate = () => {
    setFormData({
      ...WEB_DEV_TEMPLATE,
      category: categories.length > 0 ? categories[0] : 'Webdevelopment',
    });
    setSuccessMessage('Web Development template applied! Customize tiers or submit directly.');
  };

  // Tag helper
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!formData.tags?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), trimmed],
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tagToRemove) || [],
    }));
  };

  // Image helper
  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    try {
      new URL(url);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), url],
      }));
      setImageUrlInput('');
    } catch {
      setErrorMessage('Please enter a valid HTTP or HTTPS image URL.');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, idx) => idx !== indexToRemove) || [],
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setErrorMessage(null);
    try {
      const fileArray = Array.from(files).slice(0, 4);
      const uploadedUrls = await uploadGigImages(fileArray);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls].slice(0, 6),
      }));
      setSuccessMessage(`${uploadedUrls.length} image(s) uploaded successfully!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed. You can paste an image URL instead.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // Package Tier updates
  const handlePackageFieldChange = (
    tier: 'BASIC' | 'STANDARD' | 'PREMIUM',
    field: keyof IPackageInput,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => {
        if (pkg.tier === tier) {
          return { ...pkg, [field]: value };
        }
        return pkg;
      }),
    }));
  };

  const handleAddFeatureToPackage = (tier: 'BASIC' | 'STANDARD' | 'PREMIUM', featureText: string) => {
    if (!featureText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => {
        if (pkg.tier === tier) {
          return {
            ...pkg,
            features: [...(pkg.features || []), featureText.trim()],
          };
        }
        return pkg;
      }),
    }));
  };

  const handleRemoveFeatureFromPackage = (
    tier: 'BASIC' | 'STANDARD' | 'PREMIUM',
    featureIndex: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => {
        if (pkg.tier === tier) {
          return {
            ...pkg,
            features: (pkg.features || []).filter((_, idx) => idx !== featureIndex),
          };
        }
        return pkg;
      }),
    }));
  };

  // SUBMIT CREATE GIG: 0ms INSTANT LOCAL STATE UPDATE (FIXES "REFRESH NA DILE DEKHAI NEH")
  const handleCreateGigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.title || formData.title.length < 5) {
      setErrorMessage('Gig title must be at least 5 characters.');
      setCreateStep(1);
      return;
    }
    if (!formData.description || formData.description.length < 20) {
      setErrorMessage('Gig description must be at least 20 characters.');
      setCreateStep(1);
      return;
    }
    if (!formData.category) {
      setErrorMessage('Please select a valid category created by Super Admin.');
      setCreateStep(1);
      return;
    }

    const finalImages =
      formData.images && formData.images.length > 0
        ? formData.images
        : [DEFAULT_WEB_DEV_IMAGE];

    const requiredTiers = ['BASIC', 'STANDARD', 'PREMIUM'] as const;
    const finalPackages = requiredTiers.map((t) => {
      const existing = formData.packages.find((p) => p.tier === t);
      if (existing) {
        return {
          ...existing,
          price: Number(existing.price) || 20,
          deliveryTimeInDays: Math.max(1, Number(existing.deliveryTimeInDays) || 1),
          revisions: Math.max(0, Number(existing.revisions) || 1),
          features: existing.features && existing.features.length > 0 ? existing.features : ['Quality Delivery'],
        };
      }
      return EMPTY_PACKAGES.find((p) => p.tier === t)!;
    });

    setIsSubmittingCreate(true);
    try {
      const newGig = await createGig({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        tags: formData.tags || [],
        images: finalImages,
        packages: finalPackages,
      });

      // 1. INSTANT STATE INJECTION: Place new gig at top of state list immediately!
      setGigs((prev) => [newGig, ...prev.filter((g) => g.id !== newGig.id)]);

      // 2. Update quota stats immediately
      setQuotaInfo((prev) => ({
        ...prev,
        totalCreated: prev.totalCreated + 1,
        remainingFreeGigs:
          typeof prev.remainingFreeGigs === 'number'
            ? Math.max(0, prev.remainingFreeGigs - 1)
            : prev.remainingFreeGigs,
      }));

      // 3. Reset form and close modal
      setSuccessMessage(`Gig "${formData.title}" published successfully!`);
      setIsCreateModalOpen(false);
      setCreateStep(1);
      setFormData({
        title: '',
        description: '',
        category: categories[0] || '',
        tags: ['webdevelopment', 'nextjs', 'react'],
        images: [DEFAULT_WEB_DEV_IMAGE],
        packages: EMPTY_PACKAGES,
      });

      // 4. Background re-sync to ensure perfect database alignment
      await loadGigs();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create gig. Please check your inputs.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Toggle Gig Status
  const handleToggleStatus = async (gig: IGig, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTogglingId(gig.id);
    setErrorMessage(null);
    try {
      const nextStatus = gig.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      await toggleGigStatus(gig.id, nextStatus);

      // Instant state update
      setGigs((prev) =>
        prev.map((g) => (g.id === gig.id ? { ...g, status: nextStatus } : g))
      );
      if (viewingGig && viewingGig.id === gig.id) {
        setViewingGig({ ...viewingGig, status: nextStatus });
      }

      setSuccessMessage(`Gig status updated to ${nextStatus === 'ACTIVE' ? 'Active' : 'Paused'}.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to toggle status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (gig: IGig, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingGig(gig);
    const existingPackages = gig.packages || [];
    const formattedPackages: IPackageInput[] = (['BASIC', 'STANDARD', 'PREMIUM'] as const).map(
      (tier) => {
        const p = existingPackages.find((pkg) => pkg.tier === tier);
        if (p) {
          return {
            tier,
            name: p.name,
            description: p.description,
            price: p.price,
            deliveryTimeInDays: p.deliveryTimeInDays,
            revisions: p.revisions,
            features: p.features || [],
          };
        }
        return EMPTY_PACKAGES.find((pkg) => pkg.tier === tier)!;
      }
    );

    setEditFormData({
      title: gig.title,
      description: gig.description,
      category: gig.category,
      tags: gig.tags || [],
      images: gig.images || [],
      status: gig.status,
      packages: formattedPackages,
    });
  };

  // Submit Edit Gig
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGig) return;

    setIsSubmittingEdit(true);
    setErrorMessage(null);
    try {
      const updated = await updateGig(editingGig.id, {
        title: editFormData.title,
        description: editFormData.description,
        category: editFormData.category,
        tags: editFormData.tags,
        images: editFormData.images,
        status: editFormData.status,
        packages: editFormData.packages,
      });

      // Instant state update
      setGigs((prev) =>
        prev.map((g) => (g.id === editingGig.id ? { ...g, ...updated } : g))
      );
      if (viewingGig && viewingGig.id === editingGig.id) {
        setViewingGig({ ...viewingGig, ...updated });
      }

      setSuccessMessage('Gig details updated successfully!');
      setEditingGig(null);
      loadGigs();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update gig.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete Gig
  const handleDeleteGig = async () => {
    if (!deletingGig) return;
    setIsSubmittingDelete(true);
    setErrorMessage(null);
    try {
      await deleteGig(deletingGig.id);
      setSuccessMessage(`Gig "${deletingGig.title}" deleted successfully.`);

      // Instant state update
      setGigs((prev) => prev.filter((g) => g.id !== deletingGig.id));
      if (viewingGig && viewingGig.id === deletingGig.id) {
        setViewingGig(null);
      }
      setDeletingGig(null);
      loadGigs();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete gig.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Open Details Modal
  const handleOpenDetails = (gig: IGig) => {
    setViewingGig(gig);
    setActiveGalleryIndex(0);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-48 h-48 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-bold tracking-wide uppercase">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isSuperAdmin ? 'Platform Gig Control' : 'Provider Service Center'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isSuperAdmin ? 'Gigs Management & Services' : 'My Gigs & Pricing Tiers'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isSuperAdmin
                ? 'Super Admin oversight for all marketplace consulting services. Review gig packages, moderate listings, and click any row to view full details.'
                : 'Create and manage consulting services with Basic, Standard, and Premium packages. Click any row to review full tier details.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  category: categories.length > 0 ? categories[0] : '',
                }));
                setIsCreateModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Gig</span>
            </button>

            <Link
              href="/gigs"
              target="_blank"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-md border border-white/10 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>

        {/* Quota & Quick Info Pills */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400">Total Gigs</div>
            <div className="text-xl font-black text-white mt-0.5">{totalGigsCount}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400">Live / Active</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{activeGigsCount}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400">Active Categories</div>
            <div className="text-xl font-black text-indigo-300 mt-0.5">{categories.length}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400">Account Tier</div>
            <div className="text-sm font-extrabold text-amber-300 mt-1 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>{isSuperAdmin ? 'Admin Unlimited' : quotaInfo.isSubscribed ? 'Pro Subscriber' : `${quotaInfo.totalCreated} / 4 Free Gigs`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Controls & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gigs by title, tags, or provider..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns (Strictly Dynamic from Super Admin) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active (Live)</option>
              <option value="PAUSED">Paused</option>
              <option value="DRAFT">Draft</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={loadGigs}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            title="Reload Gigs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-slate-800' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. SOFT UI GIGS TABLE (Replaces card grid as requested) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Loading Gigs Table...
            </p>
          </div>
        ) : displayedGigs.length === 0 ? (
          <div className="p-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No Gigs Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                  ? 'No gigs match your search filters. Try clearing filters.'
                  : 'Start by publishing your first gig using the button below.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleApplyWebDevTemplate();
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Gig</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Gig Service & Title</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Tiers & Pricing</th>
                  {isSuperAdmin && <th className="py-4 px-4">Provider</th>}
                  <th className="py-4 px-4 text-center">Performance</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayedGigs.map((gig) => {
                  const basicPkg = gig.packages?.find((p) => p.tier === 'BASIC');
                  const standardPkg = gig.packages?.find((p) => p.tier === 'STANDARD');
                  const premiumPkg = gig.packages?.find((p) => p.tier === 'PREMIUM');
                  const isGigActive = gig.status === 'ACTIVE';
                  const thumbnail = gig.images?.[0] || DEFAULT_WEB_DEV_IMAGE;

                  return (
                    <tr
                      key={gig.id}
                      onClick={() => handleOpenDetails(gig)}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    >
                      {/* 1. Title & Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5 max-w-md">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 group-hover:border-emerald-500 transition-colors">
                            <img
                              src={thumbnail}
                              alt={gig.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                              {gig.title}
                            </p>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {gig.description}
                            </p>
                            {gig.tags && gig.tags.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1">
                                {gig.tags.slice(0, 2).map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md"
                                  >
                                    #{t}
                                  </span>
                                ))}
                                {gig.tags.length > 2 && (
                                  <span className="text-[9px] text-slate-400">
                                    +{gig.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-2xs">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          <span>{gig.category}</span>
                        </span>
                      </td>

                      {/* 3. Tiers & Pricing Breakdown */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200"
                            title={`Basic: $${basicPkg?.price ?? 'N/A'}`}
                          >
                            B: ${basicPkg?.price ?? '—'}
                          </span>
                          <span
                            className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200"
                            title={`Standard: $${standardPkg?.price ?? 'N/A'}`}
                          >
                            S: ${standardPkg?.price ?? '—'}
                          </span>
                          <span
                            className="px-2 py-1 rounded-lg bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200"
                            title={`Premium: $${premiumPkg?.price ?? 'N/A'}`}
                          >
                            P: ${premiumPkg?.price ?? '—'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Provider (Super Admin View) */}
                      {isSuperAdmin && (
                        <td className="py-4 px-4 whitespace-nowrap">
                          {gig.provider ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                                {gig.provider.name?.[0] || 'P'}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block text-xs">
                                  {gig.provider.name}
                                </span>
                                <span className="text-slate-400 text-[10px] block">
                                  {gig.provider.email}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                      )}

                      {/* 5. Performance */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{gig.averageRating > 0 ? gig.averageRating.toFixed(1) : 'New'}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <ShoppingBag className="w-2.5 h-2.5 text-slate-400" />
                            <span>{gig.totalSold || 0} sold</span>
                          </span>
                        </div>
                      </td>

                      {/* 6. Status & Quick Toggle */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          disabled={togglingId === gig.id}
                          onClick={(e) => handleToggleStatus(gig, e)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                            isGigActive
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                          }`}
                          title={`Click to ${isGigActive ? 'Pause' : 'Activate'}`}
                        >
                          {togglingId === gig.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isGigActive ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                              }`}
                            />
                          )}
                          <span>{gig.status}</span>
                        </button>
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* View Details Modal Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetails(gig);
                            }}
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Full Package Details"
                          >
                            <Eye className="w-4 h-4 text-slate-700" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(gig, e)}
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Gig"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* External Link */}
                          <Link
                            href={`/gigs/${gig.id}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="View Live in Marketplace"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingGig(gig);
                            }}
                            className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Gig"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. GIG DETAILS MODAL (Interactive Tier Inspection)        */}
      {/* ========================================================= */}
      {viewingGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header Banner */}
            <div className="relative p-6 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-xs flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>{viewingGig.category}</span>
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
                      viewingGig.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        viewingGig.status === 'ACTIVE' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                      }`}
                    />
                    <span>{viewingGig.status}</span>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {viewingGig.title}
                </h3>

                {viewingGig.provider && (
                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>By {viewingGig.provider.name} ({viewingGig.provider.email})</span>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewingGig(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image Preview */}
              {viewingGig.images && viewingGig.images.length > 0 && (
                <div className="space-y-3">
                  <div className="relative aspect-video sm:aspect-21/9 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={viewingGig.images[activeGalleryIndex] || viewingGig.images[0]}
                      alt={viewingGig.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {viewingGig.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {viewingGig.images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveGalleryIndex(idx)}
                          className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            activeGalleryIndex === idx
                              ? 'border-emerald-500 scale-105 shadow-md'
                              : 'border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>About This Consulting Service</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {viewingGig.description}
                </div>
              </div>

              {/* Tags */}
              {viewingGig.tags && viewingGig.tags.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                    Service Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingGig.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3 PACKAGE TIERS SIDE-BY-SIDE (BASIC, STANDARD, PREMIUM) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                    3 Configured Package Tiers
                  </h4>
                  <span className="text-xs font-bold text-emerald-600">All Tiers Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((tier) => {
                    const pkg = viewingGig.packages?.find((p) => p.tier === tier);
                    const tierStyle =
                      tier === 'BASIC'
                        ? 'border-slate-200 bg-white'
                        : tier === 'STANDARD'
                        ? 'border-emerald-300 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-purple-300 bg-purple-50/20 shadow-sm';

                    const tierBadge =
                      tier === 'BASIC'
                        ? 'bg-slate-100 text-slate-800'
                        : tier === 'STANDARD'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-purple-600 text-white';

                    return (
                      <div
                        key={tier}
                        className={`rounded-2xl border p-5 space-y-4 flex flex-col justify-between ${tierStyle}`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${tierBadge}`}
                            >
                              {tier}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              {tier === 'BASIC' ? 'Tier 1' : tier === 'STANDARD' ? 'Tier 2' : 'Tier 3'}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-extrabold text-sm text-slate-900">
                              {pkg?.name || `${tier} Package`}
                            </h5>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {pkg?.description || 'Package details'}
                            </p>
                          </div>

                          <div className="pt-1">
                            <span className="text-2xl font-black text-slate-900">
                              ${pkg?.price ?? 0}
                            </span>
                            <span className="text-xs text-slate-400 font-medium ml-1">USD</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs text-slate-600">
                            <div className="flex items-center gap-1 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{pkg?.deliveryTimeInDays ?? 1} Days</span>
                            </div>
                            <div className="flex items-center gap-1 font-semibold">
                              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                              <span>{pkg?.revisions ?? 1} Revisions</span>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              Included Deliverables
                            </span>
                            <div className="space-y-1.5">
                              {pkg?.features && pkg.features.length > 0 ? (
                                pkg.features.map((feat, fIdx) => (
                                  <div
                                    key={fIdx}
                                    className="flex items-start gap-2 text-xs text-slate-700 font-medium"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400 italic">Core service included</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewingGig(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-white transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(viewingGig)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewingGig.status === 'ACTIVE'
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {viewingGig.status === 'ACTIVE' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{viewingGig.status === 'ACTIVE' ? 'Pause Gig' : 'Activate Gig'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = viewingGig;
                    setViewingGig(null);
                    handleOpenEdit(target);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Gig</span>
                </button>

                <Link
                  href={`/gigs/${viewingGig.id}`}
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View in Marketplace</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. CREATE GIG WIZARD MODAL                                */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>New Gig Wizard</span>
                </div>
                <h3 className="text-lg font-black text-white">Create Consulting Gig</h3>
                <p className="text-xs text-slate-300">
                  Select an admin-approved category and configure Basic, Standard & Premium tiers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyWebDevTemplate}
                  className="hidden sm:flex px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors items-center gap-1.5 cursor-pointer border border-white/10"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Use Web Dev Preset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Wizard Tabs */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCreateStep(1)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    createStep === 1
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1. Overview & Category
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <button
                  type="button"
                  onClick={() => setCreateStep(2)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    createStep === 2
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2. Media & Gallery
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <button
                  type="button"
                  onClick={() => setCreateStep(3)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    createStep === 3
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  3. Package Tiers (Basic/Std/Prem)
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* STEP 1 */}
              {createStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Marketplace Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                    >
                      {categories.length === 0 ? (
                        <option value="">No categories created by Super Admin yet</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>Gig Title <span className="text-rose-500">*</span></span>
                      <span className="text-[11px] text-slate-400 font-normal">Min 5 characters</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. I will develop a modern fullstack web application in React and Next.js"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>Gig Description <span className="text-rose-500">*</span></span>
                      <span className="text-[11px] text-slate-400 font-normal">Min 20 characters</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detail your consulting services, technologies used, what clients can expect..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 leading-relaxed"
                    />
                    <div className="text-right text-[11px] text-slate-400">
                      {formData.description.length} characters (20 required)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Search Tags
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add tag (e.g. webdevelopment, nextjs) and press Enter..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                      >
                        Add Tag
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {createStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-slate-900">Gig Showcase Gallery</h4>
                    <p className="text-xs text-slate-500">
                      Upload project previews or paste image URLs.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Add Image via URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                      >
                        Add Image
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Or Upload Image Files
                    </label>
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-slate-400 transition-colors cursor-pointer bg-slate-50/50">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-bold text-slate-700">
                        {isUploadingImage ? 'Uploading image...' : 'Click to select images (PNG, JPG, WebP)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploadingImage}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.images?.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group"
                      >
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center cursor-pointer shadow-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {createStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        3 Package Tiers (Basic, Standard & Premium)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Every gig must include all 3 tiers.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyWebDevTemplate}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Reset Web Dev Tiers</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((tier) => {
                      const pkg = formData.packages.find((p) => p.tier === tier)!;
                      const tierColor =
                        tier === 'BASIC'
                          ? 'border-slate-200 bg-slate-50/50'
                          : tier === 'STANDARD'
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-purple-200 bg-purple-50/20';

                      const badgeColor =
                        tier === 'BASIC'
                          ? 'bg-slate-200 text-slate-800'
                          : tier === 'STANDARD'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-purple-600 text-white';

                      return (
                        <div
                          key={tier}
                          className={`rounded-2xl border p-4 space-y-4 shadow-2xs flex flex-col justify-between ${tierColor}`}
                        >
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${badgeColor}`}
                              >
                                {tier}
                              </span>
                              <span className="text-[11px] font-bold text-slate-400">
                                Tier {tier === 'BASIC' ? '1' : tier === 'STANDARD' ? '2' : '3'}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                Package Name
                              </label>
                              <input
                                type="text"
                                value={pkg.name}
                                onChange={(e) =>
                                  handlePackageFieldChange(tier, 'name', e.target.value)
                                }
                                placeholder={`${tier} name...`}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                Description
                              </label>
                              <textarea
                                rows={2}
                                value={pkg.description}
                                onChange={(e) =>
                                  handlePackageFieldChange(tier, 'description', e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 block">
                                  Price ($ USD)
                                </label>
                                <div className="relative">
                                  <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="number"
                                    min="5"
                                    value={pkg.price}
                                    onChange={(e) =>
                                      handlePackageFieldChange(
                                        tier,
                                        'price',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-full pl-7 pr-2 py-2 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-900"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 block">
                                  Delivery (Days)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={pkg.deliveryTimeInDays}
                                  onChange={(e) =>
                                    handlePackageFieldChange(
                                      tier,
                                      'deliveryTimeInDays',
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                Revisions
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={pkg.revisions ?? 1}
                                onChange={(e) =>
                                  handlePackageFieldChange(
                                    tier,
                                    'revisions',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900"
                              />
                            </div>

                            <div className="space-y-1.5 pt-1">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                Features
                              </label>
                              <div className="space-y-1 max-h-28 overflow-y-auto">
                                {pkg.features?.map((f, fIdx) => (
                                  <div
                                    key={fIdx}
                                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-slate-100 text-[11px] font-medium text-slate-700"
                                  >
                                    <span className="flex items-center gap-1.5 truncate">
                                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span className="truncate">{f}</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFeatureFromPackage(tier, fIdx)}
                                      className="text-slate-400 hover:text-rose-600 ml-1"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="flex gap-1 pt-1">
                                <input
                                  type="text"
                                  placeholder="Add feature item..."
                                  id={`new-feature-${tier}`}
                                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const input = e.currentTarget;
                                      handleAddFeatureToPackage(tier, input.value);
                                      input.value = '';
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(
                                      `new-feature-${tier}`
                                    ) as HTMLInputElement;
                                    if (input) {
                                      handleAddFeatureToPackage(tier, input.value);
                                      input.value = '';
                                    }
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {createStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCreateStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-white transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-white transition-colors"
                >
                  Cancel
                </button>
              )}

              <div className="flex items-center gap-3">
                {createStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCreateStep((prev) => (prev + 1) as any)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: {createStep === 1 ? 'Media & Gallery' : 'Package Tiers'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmittingCreate}
                    onClick={handleCreateGigSubmit}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingCreate ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Publishing Gig...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Publish Gig Live</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. EDIT GIG MODAL                                         */}
      {/* ========================================================= */}
      {editingGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="text-base font-black">Edit Gig & Pricing Tiers</h3>
                <p className="text-xs text-slate-400">Update title, category, description, and tier packages.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingGig(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">Category (Admin Approved)</label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  {editFormData.category && !categories.includes(editFormData.category) && (
                    <option value={editFormData.category}>
                      {editFormData.category}
                    </option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">Description</label>
                <textarea
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">Listing Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value as 'ACTIVE' | 'PAUSED' | 'DRAFT',
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <option value="ACTIVE">ACTIVE (Published)</option>
                  <option value="PAUSED">PAUSED (Hidden from search)</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Update Package Tiers
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {editFormData.packages.map((pkg, idx) => (
                    <div key={pkg.tier} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-500 block">
                        {pkg.tier}
                      </span>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => {
                          const updated = [...editFormData.packages];
                          updated[idx].name = e.target.value;
                          setEditFormData({ ...editFormData, packages: updated });
                        }}
                        placeholder="Package Name"
                        className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[9px] text-slate-400 font-bold block">Price ($)</label>
                          <input
                            type="number"
                            value={pkg.price}
                            onChange={(e) => {
                              const updated = [...editFormData.packages];
                              updated[idx].price = parseFloat(e.target.value) || 0;
                              setEditFormData({ ...editFormData, packages: updated });
                            }}
                            className="w-full px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] text-slate-400 font-bold block">Days</label>
                          <input
                            type="number"
                            value={pkg.deliveryTimeInDays}
                            onChange={(e) => {
                              const updated = [...editFormData.packages];
                              updated[idx].deliveryTimeInDays = parseInt(e.target.value) || 1;
                              setEditFormData({ ...editFormData, packages: updated });
                            }}
                            className="w-full px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGig(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. DELETE CONFIRMATION MODAL                              */}
      {/* ========================================================= */}
      {deletingGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">Delete Gig Offering?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-800">&quot;{deletingGig.title}&quot;</strong>? This action will remove the gig and its 3 package tiers.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingGig(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingDelete}
                onClick={handleDeleteGig}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingDelete ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Gig</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
