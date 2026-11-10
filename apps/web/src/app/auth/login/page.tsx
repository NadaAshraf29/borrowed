'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Lock, Mail, ArrowRight, Sparkles, Crown, Tag, Truck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLoginAs, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.push('/rentals');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  const demoAccounts = [
    { role: '👑 Camilla (Admin)', email: 'admin@borrowed.club' },
    { role: '👗 Sophia (Dress Owner)', email: 'sophia@borrowed.club' },
    { role: '✨ Yasmin (Renter)', email: 'yasmin@borrowed.club' },
    { role: '🚚 Tarek (Courier)', email: 'tarek@borrowed.club' },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-mauve-dark block">
          Welcome Back
        </span>
        <h1 className="text-3xl font-extrabold text-onyx font-editorial">
          Sign In to BORROWED.
        </h1>
        <p className="text-xs text-onyx/60">
          Access your rental reservations, favorites, and owner dashboard.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {/* 1-Click Demo Login Box */}
      <div className="p-4 rounded-luxury bg-white border border-taupe/30 shadow-sm space-y-2.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-onyx/60 block text-center">
          ⚡ 1-Click Quick Demo Login:
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {demoAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={async () => {
                await quickLoginAs(acc.email);
                router.push('/');
              }}
              className="p-2 rounded bg-ivory border border-taupe/30 hover:border-onyx text-onyx text-[11px] font-semibold text-left transition-all"
            >
              {acc.role}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-luxury space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-onyx block">Email Address</label>
          <div className="relative">
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 pl-9 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              required
            />
            <Mail className="w-4 h-4 text-onyx/40 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-onyx block">Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-9 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              required
            />
            <Lock className="w-4 h-4 text-onyx/40 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-md flex items-center justify-center gap-2 mt-2"
        >
          <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-onyx/60">
        Don’t have an account yet?{' '}
        <Link href="/auth/register" className="font-bold text-onyx hover:underline">
          Create Free Account
        </Link>
      </div>
    </div>
  );
}

