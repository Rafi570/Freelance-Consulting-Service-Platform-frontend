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

export async function getGigs(params?: IGetGigsParams): Promise<IGigsApiResponse['data']> {
  const query = new URLSearchParams();
  if (params?.searchTerm) query.append('searchTerm', params.searchTerm);
  if (params?.category && params.category !== 'All') query.append('category', params.category);
  if (params?.minPrice) query.append('minPrice', String(params.minPrice));
  if (params?.maxPrice) query.append('maxPrice', String(params.maxPrice));
  if (params?.sortBy) query.append('sortBy', params.sortBy);
  if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));

  const url = `${API_BASE_URL}/gigs${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, {
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load gigs');
  }

  return data.data;
}


