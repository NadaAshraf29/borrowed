'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();

  const [role, setRole] = useState<'RENTER' | 'OWNER'>('RENTER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await registerUser({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        role,
      });
      router.push(role === 'OWNER' ? '/list-dress' : '/dresses');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-mauve-dark block">
          Join BORROWED.
        </span>
        <h1 className="text-3xl font-extrabold text-onyx font-editorial">
          Create Your Club Account
        </h1>
        <p className="text-xs text-onyx/60">
          Rent runway designer pieces or list your dresses for free.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {/* Role Picker */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <button
          type="button"
          onClick={() => setRole('RENTER')}
          className={`p-4 rounded-luxury border text-left flex flex-col justify-between space-y-1 transition-all ${
            role === 'RENTER'
              ? 'border-onyx bg-onyx text-ivory'
              : 'border-taupe/30 bg-white text-onyx hover:border-taupe'
          }`}
        >
          <Sparkles className="w-4 h-4 text-mauve" />
          <div>
            <p className="font-bold">I Want to Rent Dresses</p>
            <p className="text-[10px] opacity-70">For weddings, galas & parties</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('OWNER')}
          className={`p-4 rounded-luxury border text-left flex flex-col justify-between space-y-1 transition-all ${
            role === 'OWNER'
              ? 'border-onyx bg-onyx text-ivory'
              : 'border-taupe/30 bg-white text-onyx hover:border-taupe'
          }`}
        >
          <Tag className="w-4 h-4 text-sage" />
          <div>
            <p className="font-bold">I Want to List My Dresses</p>
            <p className="text-[10px] opacity-70">List free & earn income</p>
          </div>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-luxury space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-semibold text-onyx block">First Name</label>
            <input
              type="text"
              placeholder="e.g. Yasmin"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2.5 bg-ivory border border-taupe/40 rounded text-onyx focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-onyx block">Last Name</label>
            <input
              type="text"
              placeholder="e.g. Soliman"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2.5 bg-ivory border border-taupe/40 rounded text-onyx focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-onyx block">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 bg-ivory border border-taupe/40 rounded text-onyx focus:outline-none"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-onyx block">Phone Number (For Delivery Coordination)</label>
          <input
            type="tel"
            placeholder="+20 100 000 0000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2.5 bg-ivory border border-taupe/40 rounded text-onyx focus:outline-none"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-onyx block">Password</label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 bg-ivory border border-taupe/40 rounded text-onyx focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-md flex items-center justify-center gap-2 mt-2"
        >
          <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-onyx/60">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-bold text-onyx hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

