import { create } from 'zustand';
import { UserRole } from '@borrowed/types';
import { fetchApi } from './api';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  avatarUrl?: string;
  phoneNumber?: string;
}

interface AuthState {
  user: UserSession | null;
  token: string | null;
  isLoading: boolean;
  initialized: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phoneNumber?: string; role?: 'RENTER' | 'OWNER' }) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
  quickLoginAs: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  initialized: false,

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('borrowed_token');
    if (!token) {
      set({ initialized: true, user: null, token: null });
      return;
    }

    try {
      set({ isLoading: true });
      const user = await fetchApi<UserSession>('/auth/me');
      set({ user, token, initialized: true, isLoading: false });
    } catch {
      localStorage.removeItem('borrowed_token');
      set({ user: null, token: null, initialized: true, isLoading: false });
    }
  },

  login: async (email: string, pass: string) => {
    set({ isLoading: true });
    try {
      const data = await fetchApi<{ accessToken: string; user: UserSession }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });

      localStorage.setItem('borrowed_token', data.accessToken);
      set({ token: data.accessToken, user: data.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (registerData) => {
    set({ isLoading: true });
    try {
      const data = await fetchApi<{ accessToken: string; user: UserSession }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });

      localStorage.setItem('borrowed_token', data.accessToken);
      set({ token: data.accessToken, user: data.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('borrowed_token');
    }
    set({ user: null, token: null });
  },

  quickLoginAs: async (email: string) => {
    await get().login(email, 'Password123!');
  },
}));

