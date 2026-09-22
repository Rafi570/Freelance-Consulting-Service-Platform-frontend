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
