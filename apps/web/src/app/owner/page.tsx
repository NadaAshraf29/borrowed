'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/auth-store';
import { fetchApi } from '@/lib/api';
import { DressStatus, PayoutStatus } from '@borrowed/types';
import { format } from 'date-fns';
import {
  Tag,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Eye,
  Edit,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  User,
  ShoppingBag,
} from 'lucide-react';

export default function OwnerPortalPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'dresses' | 'rentals' | 'earnings' | 'payouts'>('overview');
  const [dresses, setDresses] = useState<any[]>([]);
  const [finance, setFinance] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchApi('/dresses/owner/mine').catch(() => []),
      fetchApi('/finance/owner/overview').catch(() => null),
    ])
      .then(([dressesData, financeData]) => {
        setDresses(dressesData || []);
        setFinance(financeData);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalDresses = dresses.length;
  const activeDresses = dresses.filter((d) => d.status === DressStatus.APPROVED).length;
  const pendingDresses = dresses.filter((d) => d.status === DressStatus.PENDING_REVIEW).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-taupe/20 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-mauve-dark">
              Dress Owner Management Console
            </span>
            <span className="w-2 h-2 rounded-full bg-sage" />
          </div>
          <h1 className="text-3xl font-extrabold text-onyx font-editorial">
            Welcome, {user ? user.firstName : 'Owner'}
          </h1>
          <p className="text-xs text-onyx/60 mt-0.5">
            Manage your free dress listings, track rentals, and monitor direct net earnings.
          </p>
        </div>

        <Link
          href="/list-dress"
          className="flex items-center gap-2 px-6 py-3 bg-onyx text-ivory text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-darkbrown transition-all shadow-md self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-sage" />
          <span>List Another Dress (Free)</span>
        </Link>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-taupe/30 space-x-8 text-xs font-bold uppercase tracking-wider overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview & KPIs' },
          { key: 'dresses', label: `My Dresses (${totalDresses})` },
          { key: 'earnings', label: 'Earnings & Commissions' },
          { key: 'payouts', label: 'Payout History' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-3 relative whitespace-nowrap transition-colors ${
              activeTab === tab.key ? 'text-onyx font-extrabold' : 'text-onyx/50 hover:text-onyx'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-onyx" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-6 rounded-luxury border border-taupe/30 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-onyx/50 block">
                Total Wardrobe
              </span>
              <p className="text-3xl font-extrabold text-onyx font-editorial">{totalDresses}</p>
              <p className="text-[11px] text-sage font-medium">{activeDresses} Active • {pendingDresses} In Review</p>
            </div>

            <div className="bg-white p-6 rounded-luxury border border-taupe/30 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-onyx/50 block">
                Total Net Earned
              </span>
              <p className="text-3xl font-extrabold text-onyx font-editorial">
                EGP {(finance?.totalNetEarnings || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-onyx/60 font-medium">80% owner share retained</p>
            </div>

            <div className="bg-white p-6 rounded-luxury border border-taupe/30 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-onyx/50 block">
                Completed Payouts
              </span>
              <p className="text-3xl font-extrabold text-sage-dark font-editorial">
                EGP {(finance?.paidAmount || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-onyx/60 font-medium">Transferred via Instapay</p>
            </div>

            <div className="bg-white p-6 rounded-luxury border border-taupe/30 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-onyx/50 block">
                Pending Payouts
              </span>
              <p className="text-3xl font-extrabold text-mauve-dark font-editorial">
                EGP {(finance?.pendingAmount || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-onyx/60 font-medium">In active rental lifecycles</p>
            </div>
          </div>

          {/* Quick Dresses List */}
          <div className="bg-white p-6 rounded-luxury-lg border border-taupe/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-taupe/20">
              <h3 className="text-base font-bold text-onyx font-editorial">Active Listings</h3>
              <button onClick={() => setActiveTab('dresses')} className="text-xs text-mauve-dark font-bold hover:underline">
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dresses.slice(0, 4).map((d) => (
                <div key={d.id} className="p-3 rounded-luxury bg-ivory border border-taupe/20 flex gap-3">
                  <div className="relative w-16 aspect-[3/4] rounded overflow-hidden bg-ivory-dark flex-shrink-0">
                    <Image src={d.coverImage} alt="" fill className="object-cover object-top" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-[10px] uppercase font-bold text-mauve-dark">{d.brand}</p>
                    <p className="font-bold text-onyx line-clamp-1">{d.title}</p>
                    <p className="font-semibold text-onyx">EGP {d.rentalPrice.toLocaleString()}</p>
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-white text-onyx border border-taupe/30">
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY DRESSES */}
      {activeTab === 'dresses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dresses.map((dress) => (
              <div
                key={dress.id}
                className="bg-white rounded-luxury border border-taupe/30 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-fashion w-full bg-ivory-dark">
                    <Image src={dress.coverImage} alt="" fill className="object-cover object-top" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-onyx/85 backdrop-blur-md text-ivory text-[10px] uppercase font-bold rounded-full">
                      {dress.status.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="p-4 space-y-1 text-xs">
                    <p className="text-[10px] uppercase font-bold text-mauve-dark">{dress.brand}</p>
                    <h3 className="text-sm font-bold text-onyx line-clamp-1">{dress.title}</h3>
                    <p className="text-onyx/70">
                      Size: {dress.size} • Color: {dress.color} • City: {dress.city}
                    </p>
                    <p className="font-bold text-sm text-onyx pt-1">
                      EGP {dress.rentalPrice.toLocaleString()} / rental
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-taupe/15 flex items-center justify-between">
                  <Link
                    href={`/dresses/${dress.id}`}
                    className="text-xs font-semibold text-onyx hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Public View
                  </Link>

                  <span className="text-[11px] text-onyx/60 font-medium">
                    {dress.totalRentals || 0} Rentals Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EARNINGS & COMMISSIONS */}
      {activeTab === 'earnings' && (
        <div className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold font-editorial text-onyx">Owner Earnings Ledger</h3>
            <p className="text-xs text-onyx/60">
              Itemized financial breakdown of dress rentals with transparent platform commission deductions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-onyx/70 uppercase text-[10px] font-bold tracking-wider border-b border-taupe/20">
                <tr>
                  <th className="p-3">Dress</th>
                  <th className="p-3">Booking Ref</th>
                  <th className="p-3">Gross Rental</th>
                  <th className="p-3">Platform Fee (20%)</th>
                  <th className="p-3">Your Net Share (80%)</th>
                  <th className="p-3">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taupe/15">
                {finance?.earnings?.map((e: any) => (
                  <tr key={e.id} className="hover:bg-ivory/50">
                    <td className="p-3 font-bold text-onyx">{e.rentalBooking?.dress?.title}</td>
                    <td className="p-3 font-mono text-onyx/60">{e.rentalBooking?.bookingReference || 'BRW-REF'}</td>
                    <td className="p-3 font-semibold text-onyx">EGP {e.grossAmount?.toLocaleString()}</td>
                    <td className="p-3 text-taupe font-semibold">- EGP {e.commissionFee?.toLocaleString()}</td>
                    <td className="p-3 font-bold text-sage-dark text-sm">EGP {e.netEarnings?.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        e.payoutStatus === PayoutStatus.COMPLETED
                          ? 'bg-sage/30 text-sage-dark'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {e.payoutStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold font-editorial text-onyx">Disbursed Payouts</h3>
            <p className="text-xs text-onyx/60">
              Verified payouts sent directly to your payment destination.
            </p>
          </div>

          <div className="space-y-3">
            {finance?.payouts?.map((p: any) => (
              <div key={p.id} className="p-4 rounded-luxury bg-ivory border border-taupe/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-onyx">{p.payoutRef}</span>
                    <span className="px-2 py-0.5 bg-sage/30 text-sage-dark text-[10px] font-bold rounded-full">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-onyx/60 mt-1">
                    Method: <span className="font-semibold text-onyx">{p.method}</span> • Account: <span className="font-semibold text-onyx">{p.accountInfo}</span>
                  </p>
                  {p.notes && <p className="text-[11px] text-onyx/50 italic mt-0.5">{p.notes}</p>}
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold font-sans text-onyx block">
                    EGP {p.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-onyx/50">
                    Transferred on {format(new Date(p.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

