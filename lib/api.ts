export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PROVIDER' | 'CLIENT';
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DRAFT';
  blockReason?: string | null;
  blockedAt?: string | null;
  createdAt?: string;
  profile?: {
    id: string;
    bio?: string | null;
    skills?: string[];
    phone?: string | null;
    address?: string | null;
    experience?: string | null;
    portfolioUrl?: string | null;
    hourlyRate?: number | null;
    isSubscribed?: boolean;
  } | null;
}

export interface ILoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: IUser;
  };
}

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'PROVIDER' | 'CLIENT';
  bio?: string;
  skills?: string[];
  phone?: string;
  address?: string;
  experience?: string;
  portfolioUrl?: string;
  hourlyRate?: number;
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('consulsphere_token');
};

export const setAuthSession = (token: string, user: IUser) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('consulsphere_token', token);
  localStorage.setItem('consulsphere_user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('consulsphere_token');
  localStorage.removeItem('consulsphere_user');
};

export const getStoredUser = (): IUser | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('consulsphere_user');
  if (!data) return null;
  try {
    return JSON.parse(data) as IUser;
  } catch {
    return null;
  }
};

export async function loginUser(email: string, password: string): Promise<ILoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Login failed. Please check your credentials.');
  }

  setAuthSession(data.data.accessToken, data.data.user);
  return data;
}

export async function loginUserWithGoogle(idToken: string): Promise<ILoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Google Login failed.');
  }

  setAuthSession(data.data.accessToken, data.data.user);
  return data;
}

export async function registerUser(payload: IRegisterPayload) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Registration failed.');
  }

  return data;
}

export async function verifyEmailOtp(email: string, otp: string): Promise<ILoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'OTP verification failed.');
  }

  setAuthSession(data.data.accessToken, data.data.user);
  return data;
}

export async function resendOtp(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to resend OTP.');
  }

  return data;
}

export interface IGigCategory {
  name: string;
  count?: number;
}

export async function getGigCategories(): Promise<IGigCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/gigs/categories`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data)) {
      return data.data.map((item: any) =>
        typeof item === 'string'
          ? { name: item, count: 0 }
          : { name: item.name || String(item), count: item.count ?? 0 }
      );
    }
    return [];
  } catch (err) {
    console.error('Failed to fetch gig categories:', err);
    return [];
  }
}

export interface ISearchSuggestionItem {
  text: string;
  category: string;
  type?: 'popular' | 'category' | 'service' | 'tag';
  id?: string;
}

export interface ISearchSuggestionsData {
  popularSearches?: string[];
  popularCategories?: string[];
  featuredGigs?: ISearchSuggestionItem[];
}

export interface IHeroDataResponse {
  popularTags: Array<{ label: string; query: string }>;
  categories: IGigCategory[];
  stats: {
    totalTalent: number;
    totalGigs: number;
    completedOrders: number;
  };
}

export async function getSearchSuggestions(query?: string): Promise<any> {
  try {
    const qParam = query && query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
    const res = await fetch(`${API_BASE_URL}/gigs/suggestions${qParam}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return data.data;
    }
    return query && query.trim() ? [] : { popularSearches: [], popularCategories: [], featuredGigs: [] };
  } catch (err) {
    console.error('Failed to fetch search suggestions:', err);
    return query && query.trim() ? [] : { popularSearches: [], popularCategories: [], featuredGigs: [] };
  }
}

export async function getHeroData(): Promise<IHeroDataResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/gigs/hero-data`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return data.data;
    }
    throw new Error('Hero data failed');
  } catch (err) {
    console.error('Failed to fetch hero data:', err);
    return {
      popularTags: [
        { label: 'Next.js & React', query: 'Next.js' },
        { label: 'Website Design', query: 'Website Design' },
        { label: 'Logo & Branding', query: 'Logo Design' },
        { label: 'AI Services', query: 'AI' },
        { label: 'SEO & Marketing', query: 'Digital Marketing' },
        { label: 'Business Strategy', query: 'Business Strategy' },
      ],
      categories: [
        { name: 'Web Development', count: 0 },
        { name: 'Graphics & Design', count: 0 },
        { name: 'Digital Marketing', count: 0 },
        { name: 'Video & Animation', count: 0 },
        { name: 'Writing & Translation', count: 0 },
        { name: 'Business & Consulting', count: 0 },
        { name: 'AI Services', count: 0 },
      ],
      stats: {
        totalTalent: 0,
        totalGigs: 0,
        completedOrders: 0,
      },
    };
  }
}


export interface IGigPackage {
  id: string;
  gigId: string;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  name: string;
  description: string;
  price: number;
  deliveryTimeInDays: number;
  revisions: number;
  features: string[];
}

export interface IGigProvider {
  id: string;
  name: string;
  email: string;
  profile?: {
    id?: string;
    bio?: string | null;
    skills?: string[];
    hourlyRate?: number | null;
    experience?: string | null;
    phone?: string | null;
    address?: string | null;
    portfolioUrl?: string | null;
    isSubscribed?: boolean;
  } | null;
}

export interface IGig {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: string[];
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
  packages: IGigPackage[];
  provider: IGigProvider;
  totalSold: number;
  totalReviews: number;
  averageRating: number;
}

export interface IGetGigsParams {
  searchTerm?: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IGigsApiResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
    data: IGig[];
  };
}

const clientGigsCache = new Map<string, { data: IGigsApiResponse['data']; timestamp: number }>();
const CLIENT_CACHE_TTL = 60 * 1000; // 60 seconds

export async function getGigs(
  params?: IGetGigsParams & { noCache?: boolean }
): Promise<IGigsApiResponse['data']> {
  const query = new URLSearchParams();
  if (params?.searchTerm) query.append('searchTerm', params.searchTerm);
  if (params?.category && params.category !== 'All' && params.category !== 'ALL')
    query.append('category', params.category);
  if (params?.minPrice) query.append('minPrice', String(params.minPrice));
  if (params?.maxPrice) query.append('maxPrice', String(params.maxPrice));
  if (params?.sortBy) query.append('sortBy', params.sortBy);
  if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));

  if (params?.noCache) {
    query.append('_t', String(Date.now()));
  }

  const url = `${API_BASE_URL}/gigs${query.toString() ? `?${query.toString()}` : ''}`;

  // Instant 0ms memory cache hit (only when noCache is not specified)
  if (!params?.noCache) {
    const cached = clientGigsCache.get(url);
    if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
      return cached.data;
    }
  }

  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (!params?.noCache) {
      const cached = clientGigsCache.get(url);
      if (cached) return cached.data;
    }
    throw new Error(data.message || 'Failed to load gigs');
  }

  if (!params?.noCache) {
    clientGigsCache.set(url, { data: data.data, timestamp: Date.now() });
  }
  return data.data;
}

export async function getGigById(id: string): Promise<IGig> {
  const res = await fetch(`${API_BASE_URL}/gigs/${id}`, {
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Gig not found');
  }

  return data.data;
}

export interface IGigReviewsResponse {
  gigId: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    client: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export async function getGigReviews(gigId: string): Promise<IGigReviewsResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/gig/${gigId}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return data.data;
    }
    return {
      gigId,
      totalReviews: 0,
      averageRating: 5,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      reviews: [],
    };
  } catch (err) {
    console.error('Failed to load reviews:', err);
    return {
      gigId,
      totalReviews: 0,
      averageRating: 5,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      reviews: [],
    };
  }
}

export async function createOrder(gigId: string, packageId: string, requirements?: string) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in to place an order.');
  }

  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      gigId,
      packageId,
      requirements: requirements || 'Standard consultation requirements',
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to place order.');
  }

  return data.data;
}

export interface ICancellationReason {
  code: string;
  label: string;
  description: string;
}

export interface IOrderGig {
  id: string;
  title: string;
  category: string;
  images: string[];
  provider?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface IOrderPackage {
  id: string;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  name: string;
  description: string;
  price: number;
  deliveryTimeInDays: number;
  revisions: number;
  features: string[];
}

export interface IOrderPayment {
  id: string;
  amount: number;
  currency: string;
  status: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
  paymentGateway: string;
  transactionId?: string | null;
}

export interface IOrderReview {
  id: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface IOrder {
  id: string;
  clientId: string;
  gigId: string;
  packageId: string;
  price: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
  requirements?: string | null;
  cancellationReason?: string | null;
  cancellationNote?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  gig: IOrderGig;
  package: IOrderPackage;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  payment?: IOrderPayment | null;
  review?: IOrderReview | null;
}

export async function getMyOrders(): Promise<IOrder[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in to view your orders.');
  }

  const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch orders.');
  }

  return data.data || [];
}

export async function getSingleOrder(orderId: string): Promise<IOrder> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in to view order details.');
  }

  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch order details.');
  }

  return data.data;
}

export async function getCancellationReasons(): Promise<ICancellationReason[]> {
  const res = await fetch(`${API_BASE_URL}/orders/cancellation-reasons`, {
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch cancellation reasons.');
  }

  return data.data || [];
}

export async function cancelOrder(
  orderId: string,
  payload: {
    cancellationReason: string;
    cancellationNote?: string;
  }
): Promise<IOrder> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in to cancel this order.');
  }

  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to cancel order.');
  }

  return data.data;
}

export async function submitOrderReview(
  orderId: string,
  rating: number,
  comment: string
): Promise<any> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in to submit a review.');
  }

  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to submit review.');
  }

  return data.data;
}


export interface IGetUsersParams {
  searchTerm?: string;
  role?: 'SUPER_ADMIN' | 'PROVIDER' | 'CLIENT' | string;
  status?: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DRAFT' | string;
  page?: number;
  limit?: number;
}

export interface IUsersApiResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
    data: IUser[];
  };
}

export async function getAllUsers(params?: IGetUsersParams): Promise<IUsersApiResponse['data']> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in as Super Admin.');
  }

  const query = new URLSearchParams();
  if (params?.searchTerm) query.append('searchTerm', params.searchTerm);
  if (params?.role && params.role !== 'ALL') query.append('role', params.role);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE_URL}/users${query.toString() ? `?${query.toString()}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch users');
  }

  return data.data;
}

export async function blockUser(userId: string, reason?: string): Promise<IUser> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in as Super Admin.');
  }

  const res = await fetch(`${API_BASE_URL}/users/${userId}/block`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: 'BLOCKED',
      reason: reason || 'Violation of terms and guidelines',
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to block user');
  }

  return data.data;
}

export async function unblockUser(userId: string): Promise<IUser> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in as Super Admin.');
  }

  const res = await fetch(`${API_BASE_URL}/users/${userId}/unblock`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to unblock user');
  }

  return data.data;
}

export async function updateUserStatus(
  userId: string,
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DRAFT',
  reason?: string
): Promise<IUser> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in as Super Admin.');
  }

  const res = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
      reason,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update user status');
  }

  return data.data;
}

export async function getMyProviderProfile(): Promise<IUser> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in.');
  }

  const res = await fetch(`${API_BASE_URL}/providers/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch provider profile');
  }

  return data.data;
}

export async function updateMyProviderProfile(payload: {
  name?: string;
  bio?: string;
  skills?: string[];
  phone?: string;
  address?: string;
  experience?: string;
  portfolioUrl?: string;
  hourlyRate?: number;
}): Promise<IUser> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in.');
  }

  const res = await fetch(`${API_BASE_URL}/providers/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update provider profile');
  }

  // Update locally stored user profile if available
  const stored = getStoredUser();
  if (stored) {
    const updated = {
      ...stored,
      name: payload.name ?? stored.name,
      profile: {
        ...stored.profile,
        ...(data.data.profile || data.data),
      },
    };
    setAuthSession(token, updated as any);
  }

  return data.data;
}

export interface IGigFilter {
  id: string;
  name: string;
  label?: string | null;
  type: 'CATEGORY' | 'TAG' | 'FEATURED';
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  gigCount?: number;
  createdAt: string;
  updatedAt: string;
}

export async function getGigFilters(params?: {
  type?: string;
  isActive?: boolean;
  searchTerm?: string;
}): Promise<IGigFilter[]> {
  try {
    const q = new URLSearchParams();
    if (params?.type) q.append('type', params.type);
    if (params?.isActive !== undefined) q.append('isActive', String(params.isActive));
    if (params?.searchTerm) q.append('searchTerm', params.searchTerm);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/gig-filters${queryStr}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (err) {
    console.error('Failed to fetch gig filters:', err);
    return [];
  }
}

export async function createGigFilter(payload: {
  name: string;
  label?: string;
  type?: 'CATEGORY' | 'TAG' | 'FEATURED';
  description?: string;
  icon?: string;
  isActive?: boolean;
}): Promise<IGigFilter> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in as Super Admin.');
  }

  const res = await fetch(`${API_BASE_URL}/gig-filters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to create gig filter');
  }

  return data.data;
}

export async function updateGigFilter(
  id: string,
  payload: Partial<IGigFilter>
): Promise<IGigFilter> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in as Super Admin.');
  }

  const res = await fetch(`${API_BASE_URL}/gig-filters/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update gig filter');
  }

  return data.data;
}

export async function deleteGigFilter(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in as Super Admin.');
  }

  const res = await fetch(`${API_BASE_URL}/gig-filters/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete gig filter');
  }
}

export interface IPackageInput {
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  name: string;
  description: string;
  price: number;
  deliveryTimeInDays: number;
  revisions?: number;
  features?: string[];
}

export interface ICreateGigPayload {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  images?: string[];
  packages: IPackageInput[];
}

export interface IMyGigsResponse {
  isSubscribed: boolean;
  gigLimit: number | string;
  totalCreated: number;
  remainingFreeGigs: number | string;
  gigs: IGig[];
}

export async function getMyGigs(): Promise<IMyGigsResponse> {
  const token = getAuthToken();
  if (!token) throw new Error('Please sign in to access your gigs.');

  const res = await fetch(`${API_BASE_URL}/gigs/my-gigs?_t=${Date.now()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load your gigs');
  }

  return data.data;
}

export async function createGig(payload: ICreateGigPayload): Promise<IGig> {
  const token = getAuthToken();
  if (!token) throw new Error('Please sign in to create a gig.');

  const res = await fetch(`${API_BASE_URL}/gigs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to create gig');
  }

  clientGigsCache.clear();
  return data.data;
}

export async function updateGig(
  id: string,
  payload: Partial<ICreateGigPayload> & { status?: 'ACTIVE' | 'PAUSED' | 'DRAFT' }
): Promise<IGig> {
  const token = getAuthToken();
  if (!token) throw new Error('Please sign in to update gig.');

  const res = await fetch(`${API_BASE_URL}/gigs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update gig');
  }

  clientGigsCache.clear();
  return data.data;
}

export async function toggleGigStatus(
  id: string,
  status?: 'ACTIVE' | 'PAUSED' | 'DRAFT'
): Promise<IGig> {
  const token = getAuthToken();
  if (!token) throw new Error('Please sign in to toggle gig status.');

  const res = await fetch(`${API_BASE_URL}/gigs/${id}/toggle-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to toggle gig status');
  }

  clientGigsCache.clear();
  return data.data;
}

export async function deleteGig(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Please sign in to delete gig.');

  const res = await fetch(`${API_BASE_URL}/gigs/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete gig');
  }

  clientGigsCache.clear();
}

export async function uploadGigImages(files: File[]): Promise<string[]> {
  const token = getAuthToken();
  if (!token) throw new Error('Please sign in to upload images.');

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const res = await fetch(`${API_BASE_URL}/gigs/upload-images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to upload images');
  }

  return data.data?.images || [];
}

export const submitAppeal = async (email: string, message: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/support/appeal`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, message, subject: 'Appeal for Account Unblocking' }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to submit appeal');
  }

  return data;
};

export const checkBlockStatus = async (email: string) => {
  const res = await fetch(`${API_BASE_URL}/support/check-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to check block status');
  }

  return data;
};

export const getMyTickets = async () => {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/support/my-tickets`, {
    method: 'GET',
    headers,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch tickets');
  }

  return data;
};

export const sendMessage = async (ticketId: string, message: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    let errorMsg = data.message || 'Failed to send message';
    if (data.errorSources && data.errorSources.length > 0) {
      errorMsg = data.errorSources.map((e: any) => e.message).join(', ');
    }
    throw new Error(errorMsg);
  }

  return data;
};

export const createTicket = async (subject: string, category: string, message: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/support/tickets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ subject, category, message }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    let errorMsg = data.message || 'Failed to create ticket';
    if (data.errorSources && data.errorSources.length > 0) {
      errorMsg = data.errorSources.map((e: any) => e.message).join(', ');
    }
    throw new Error(errorMsg);
  }

  return data;
};

export const getAllTicketsAdmin = async () => {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/support/admin/tickets`, {
    method: 'GET',
    headers,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch tickets');
  }

  return data;
};

export const reviewTicketAdmin = async (ticketId: string, action: 'APPROVE' | 'REJECT' | 'IN_REVIEW', adminNotes?: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/support/admin/tickets/${ticketId}/review`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ action, adminNotes }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to review ticket');
  }

  return data;
};
