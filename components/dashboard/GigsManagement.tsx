'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ImageIcon,
  Info,
  ShieldCheck,
  Crown,
  Zap,
  ArrowRight,
  Copy
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
  getGigCategories,
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

  // Load Categories (EXCLUSIVELY from active categories created by Super Admin)
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

  // Load Gigs
  const loadGigs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (isSuperAdmin) {
        // Super Admin gets all gigs
        const res = await getGigs({
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          searchTerm: searchTerm.trim() || undefined,
          limit: 100,
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
        // Provider gets their own gigs with quota info
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

  // Stats calculation
  const totalGigsCount = gigs.length;
  const activeGigsCount = useMemo(() => gigs.filter((g) => g.status === 'ACTIVE').length, [gigs]);
  const pausedGigsCount = useMemo(() => gigs.filter((g) => g.status === 'PAUSED').length, [gigs]);
  const webDevGigsCount = useMemo(
    () =>
      gigs.filter((g) =>
        g.category.toLowerCase().includes('web')
      ).length,
    [gigs]
  );

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

  // Add / Remove feature bullet in package
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

  // Submit Create Gig
  const handleCreateGigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
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
      setErrorMessage('Please select a valid category (e.g. Webdevelopment).');
      setCreateStep(1);
      return;
    }

    // Ensure images has at least one valid image
    const finalImages =
      formData.images && formData.images.length > 0
        ? formData.images
        : [DEFAULT_WEB_DEV_IMAGE];

    // Ensure 3 packages are present and properly formatted
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
      await createGig({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        tags: formData.tags || [],
        images: finalImages,
        packages: finalPackages,
      });

      setSuccessMessage(`Gig "${formData.title}" published successfully with Basic, Standard & Premium packages!`);
      setIsCreateModalOpen(false);
      setCreateStep(1);
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: categories[0] || '',
        tags: ['webdevelopment', 'nextjs', 'react'],
        images: [DEFAULT_WEB_DEV_IMAGE],
        packages: EMPTY_PACKAGES,
      });
      loadGigs();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create gig. Please check your inputs.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Toggle Gig Status
  const handleToggleStatus = async (gig: IGig) => {
    setTogglingId(gig.id);
    setErrorMessage(null);
    try {
      const nextStatus = gig.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      await toggleGigStatus(gig.id, nextStatus);
      setSuccessMessage(`Gig "${gig.title}" is now ${nextStatus === 'ACTIVE' ? 'Live & Active' : 'Paused'}.`);
      setGigs((prev) =>
        prev.map((g) => (g.id === gig.id ? { ...g, status: nextStatus } : g))
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to toggle status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (gig: IGig) => {
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
      await updateGig(editingGig.id, {
        title: editFormData.title,
        description: editFormData.description,
        category: editFormData.category,
        tags: editFormData.tags,
        images: editFormData.images,
        status: editFormData.status,
        packages: editFormData.packages,
      });

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
      setGigs((prev) => prev.filter((g) => g.id !== deletingGig.id));
      setDeletingGig(null);
      loadGigs();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete gig.');
    } finally {
      setIsSubmittingDelete(false);
    }
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
              {isSuperAdmin ? 'Gigs & Marketplace Offerings' : 'My Gigs & Pricing Tiers'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isSuperAdmin
                ? 'Super Admin oversight for all marketplace consulting services. Create new gigs under active categories like Webdevelopment, manage tiers, and moderate live status.'
                : 'Create and showcase high-converting consulting packages with Basic, Standard, and Premium tiers. Select categories like Webdevelopment to capture client inquiries.'}
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
            <div className="text-[11px] font-medium text-slate-400">Web Development</div>
            <div className="text-xl font-black text-indigo-300 mt-0.5">{webDevGigsCount}</div>
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
            placeholder="Search by gig title, description, or tags..."
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

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown (with Webdevelopment) */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} {cat.toLowerCase() === 'webdevelopment' ? '★ (Admin Added)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
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

          {/* Refresh */}
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

      {/* 3. Gigs Content List / Table */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-3 shadow-xs">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Loading your service gigs...
          </p>
        </div>
      ) : gigs.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center space-y-5 shadow-xs max-w-2xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Briefcase className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-800">
              No Gigs Found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                ? 'No gigs matched your current filter criteria. Try clearing your search or category filter.'
                : 'You have not created any service gigs yet. Create your first gig under "Webdevelopment" with Basic, Standard, and Premium packages!'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                handleApplyWebDevTemplate();
                setIsCreateModalOpen(true);
              }}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Create Web Development Gig</span>
            </button>

            {(searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                }}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Gigs Grid / Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gigs.map((gig) => {
            const basicPkg = gig.packages?.find((p) => p.tier === 'BASIC');
            const standardPkg = gig.packages?.find((p) => p.tier === 'STANDARD');
            const premiumPkg = gig.packages?.find((p) => p.tier === 'PREMIUM');

            const isGigActive = gig.status === 'ACTIVE';
            const thumbnail = gig.images?.[0] || DEFAULT_WEB_DEV_IMAGE;

            return (
              <div
                key={gig.id}
                className="bg-white rounded-3xl border border-slate-100 hover:border-slate-200 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Top Image & Header */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={thumbnail}
                      alt={gig.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Category & Status Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-900 shadow-sm flex items-center gap-1">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        <span>{gig.category}</span>
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                          isGigActive
                            ? 'bg-emerald-500 text-white'
                            : gig.status === 'PAUSED'
                            ? 'bg-amber-400 text-slate-900'
                            : 'bg-slate-600 text-white'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isGigActive ? 'bg-white animate-pulse' : 'bg-slate-900'
                          }`}
                        />
                        <span>{gig.status}</span>
                      </span>
                    </div>

                    {/* Orders / Rating on Image Bottom */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{gig.averageRating > 0 ? gig.averageRating.toFixed(1) : 'New'}</span>
                          <span className="text-slate-300 font-normal">({gig.totalReviews})</span>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="flex items-center gap-1 text-slate-200">
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{gig.totalSold || 0} orders</span>
                        </span>
                      </div>

                      {/* Starting Price */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-300 block uppercase font-medium">
                          From
                        </span>
                        <span className="text-base font-black text-emerald-400">
                          ${basicPkg?.price ?? '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    {/* Provider Info (Important for Super Admin) */}
                    {isSuperAdmin && gig.provider && (
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                            {gig.provider.name?.[0] || 'P'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">{gig.provider.name}</span>
                            <span className="text-slate-400 text-[11px] block">{gig.provider.email}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                          Provider Gig
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2">
                        {gig.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {gig.description}
                      </p>
                    </div>

                    {/* 3 Package Tiers Comparison Bar */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Configured Package Tiers</span>
                        <span className="text-emerald-600 font-extrabold">3 Tiers Active</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        {/* Basic */}
                        <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                          <span className="text-[9px] font-bold uppercase text-slate-400 block">
                            Basic
                          </span>
                          <span className="text-xs font-black text-slate-900 block mt-0.5">
                            ${basicPkg?.price ?? 'N/A'}
                          </span>
                          <span className="text-[9px] text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {basicPkg?.deliveryTimeInDays ?? 1}d
                          </span>
                        </div>

                        {/* Standard */}
                        <div className="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/60 shadow-2xs">
                          <span className="text-[9px] font-bold uppercase text-emerald-600 block">
                            Standard
                          </span>
                          <span className="text-xs font-black text-emerald-700 block mt-0.5">
                            ${standardPkg?.price ?? 'N/A'}
                          </span>
                          <span className="text-[9px] text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {standardPkg?.deliveryTimeInDays ?? 3}d
                          </span>
                        </div>

                        {/* Premium */}
                        <div className="p-2 rounded-xl bg-purple-50/50 border border-purple-100/60 shadow-2xs">
                          <span className="text-[9px] font-bold uppercase text-purple-600 block">
                            Premium
                          </span>
                          <span className="text-xs font-black text-purple-700 block mt-0.5">
                            ${premiumPkg?.price ?? 'N/A'}
                          </span>
                          <span className="text-[9px] text-purple-600 flex items-center justify-center gap-0.5 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {premiumPkg?.deliveryTimeInDays ?? 7}d
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {gig.tags && gig.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {gig.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                        {gig.tags.length > 4 && (
                          <span className="text-[10px] font-semibold text-slate-400 self-center">
                            +{gig.tags.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    disabled={togglingId === gig.id}
                    onClick={() => handleToggleStatus(gig)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isGigActive
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                    }`}
                  >
                    {togglingId === gig.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : isGigActive ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>{isGigActive ? 'Pause Gig' : 'Activate'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* View Live */}
                    <Link
                      href={`/gigs/${gig.id}`}
                      target="_blank"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                      title="View Live in Marketplace"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(gig)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                      title="Edit Gig & Packages"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeletingGig(gig)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                      title="Delete Gig"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. CREATE GIG MODAL WIZARD                                 */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>New Gig Wizard</span>
                </div>
                <h3 className="text-lg font-black text-white">Create Consulting Gig</h3>
                <p className="text-xs text-slate-300">
                  Select your category (e.g. Webdevelopment), add images, and define Basic, Standard & Premium tiers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyWebDevTemplate}
                  className="hidden sm:flex px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors items-center gap-1.5 cursor-pointer border border-white/10"
                  title="Auto-fill with professional Web Development template"
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

              <button
                type="button"
                onClick={handleApplyWebDevTemplate}
                className="sm:hidden text-xs font-extrabold text-emerald-600 hover:underline"
              >
                Auto-fill
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* STEP 1: Overview */}
              {createStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>Marketplace Category <span className="text-rose-500">*</span></span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Admin-created categories are available
                      </span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat} {cat.toLowerCase() === 'webdevelopment' ? '★ (Selected Category)' : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-emerald-600 font-medium">
                      ✓ &quot;{formData.category}&quot; selected. Providers can publish their consulting gigs directly under this category.
                    </p>
                  </div>

                  {/* Gig Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>Gig Title <span className="text-rose-500">*</span></span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Min 5 characters (Start with &quot;I will...&quot;)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. I will develop a modern fullstack web application in React and Next.js"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>Gig Description <span className="text-rose-500">*</span></span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Min 20 characters (explain your expertise & deliverable)
                      </span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detail your consulting services, technologies used, what clients can expect, and why they should choose your gig..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 leading-relaxed"
                    />
                    <div className="text-right text-[11px] text-slate-400">
                      {formData.description.length} characters (20 required)
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Search Tags (Help clients find your gig)
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
                        placeholder="Add a tag and press Enter (e.g. webdevelopment, nextjs, react)..."
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

              {/* STEP 2: Media & Images */}
              {createStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-slate-900">Gig Showcase Gallery</h4>
                    <p className="text-xs text-slate-500">
                      Upload high quality project previews or paste image URLs (up to 6 images). Recommended size: 1200x800px.
                    </p>
                  </div>

                  {/* Add via URL */}
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
                        Add Image URL
                      </button>
                    </div>
                  </div>

                  {/* Or upload file */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Or Upload Image Files (Cloudinary storage)
                    </label>
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-slate-400 transition-colors cursor-pointer bg-slate-50/50">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-bold text-slate-700">
                        {isUploadingImage ? 'Uploading image...' : 'Click to select images (PNG, JPG, WebP)'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">Up to 6 images</span>
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

                  {/* Image Previews */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      Current Images ({formData.images?.length || 0})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formData.images?.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group"
                        >
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-bold">
                              Cover Image
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: 3 Package Tiers (BASIC, STANDARD, PREMIUM) */}
              {createStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Package Pricing & Tier Breakdown
                      </h4>
                      <p className="text-xs text-slate-500">
                        Every gig must include all 3 tiers: Basic, Standard, and Premium packages.
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

                  {/* 3 Tier Columns */}
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
                            {/* Tier Badge */}
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

                            {/* Name */}
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
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-slate-800"
                              />
                            </div>

                            {/* Description */}
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
                                placeholder="What is included in this package..."
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-slate-800"
                              />
                            </div>

                            {/* Price & Delivery */}
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

                            {/* Revisions */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                Revisions Included
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

                            {/* Features Checklist */}
                            <div className="space-y-1.5 pt-1">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                Package Features
                              </label>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
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

                              {/* Add Feature input */}
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

            {/* Modal Footer Controls */}
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
      {/* 5. EDIT GIG MODAL                                         */}
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
              {/* Category */}
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

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">Description</label>
                <textarea
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>

              {/* Status */}
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

              {/* Pricing Tiers */}
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
      {/* 6. DELETE CONFIRMATION MODAL                              */}
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
                <strong className="text-slate-800">&quot;{deletingGig.title}&quot;</strong>? This action will remove the gig and its 3 package tiers from the marketplace.
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
