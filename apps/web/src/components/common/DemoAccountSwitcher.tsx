'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Crown, Sparkles, Truck, Tag, LogOut, Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function DemoAccountSwitcher() {
  const { user, quickLoginAs, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const demoAccounts = [
    {
      role: 'Super Admin',
      name: 'Camilla Montague',
      email: 'admin@borrowed.club',
      icon: Crown,
      badge: 'Admin Console',
      portalUrl: '/admin',
      desc: 'Listing moderation, dispatching, financials & settings',
    },
    {
      role: 'Dress Owner',
      name: 'Sophia El-Khatib',
      email: 'sophia@borrowed.club',
      icon: Tag,
      badge: 'Owner Portal',
      portalUrl: '/owner',
      desc: 'Free dress listings, rental requests & earnings ledger',
    },
    {
      role: 'Renter',
      name: 'Yasmin Soliman',
      email: 'yasmin@borrowed.club',
      icon: Sparkles,
      badge: 'Renter Dashboard',
      portalUrl: '/rentals',
      desc: 'Browse, book, 3-day delivery window & tracking',
    },
    {
      role: 'Delivery Courier',
      name: 'Tarek Ghoneim',
      email: 'tarek@borrowed.club',
      icon: Truck,
      badge: 'Courier App',
      portalUrl: '/delivery',
      desc: '4-stage pickups, deliveries, returns & proofs',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide bg-onyx text-ivory rounded-full border border-taupe/30 hover:border-taupe transition-all shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
        <span>Demo Roles:</span>
        <span className="font-semibold text-taupe-light">
          {user ? user.firstName : 'Guest'}
        </span>
        <ChevronDown className="w-3 h-3 text-taupe" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-ivory-light border border-taupe/40 rounded-luxury-lg shadow-luxury p-3 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-taupe/20 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-onyx">
              Switch Demo Persona
            </span>
            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              const isCurrent = user?.email === acc.email;

              return (
                <div
                  key={acc.email}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-onyx text-ivory border-onyx'
                      : 'bg-white/60 hover:bg-white border-taupe/20 text-onyx'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <button
                      onClick={async () => {
                        await quickLoginAs(acc.email);
                        setIsOpen(false);
                      }}
                      className="flex items-start gap-2.5 text-left flex-1"
                    >
                      <div
                        className={`p-1.5 rounded-md ${
                          isCurrent ? 'bg-white/10 text-ivory' : 'bg-onyx/5 text-onyx'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold leading-none">{acc.name}</p>
                          {isCurrent && <Check className="w-3 h-3 text-sage" />}
                        </div>
                        <p
                          className={`text-[10px] mt-0.5 ${
                            isCurrent ? 'text-taupe' : 'text-onyx/60'
                          }`}
                        >
                          {acc.role} • {acc.email}
                        </p>
                        <p
                          className={`text-[10px] mt-1 line-clamp-1 ${
                            isCurrent ? 'text-ivory/70' : 'text-onyx/50'
                          }`}
                        >
                          {acc.desc}
                        </p>
                      </div>
                    </button>

                    {isCurrent && (
                      <Link
                        href={acc.portalUrl}
                        onClick={() => setIsOpen(false)}
                        className="ml-2 px-2 py-1 bg-sage text-onyx text-[10px] font-semibold rounded hover:bg-sage-light transition-colors whitespace-nowrap self-center"
                      >
                        Open
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-taupe/20 text-[10px] text-onyx/60 text-center">
            Password: <span className="font-mono text-onyx font-medium">Password123!</span>
          </div>
        </div>
      )}
    </div>
  );
}

