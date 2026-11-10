'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { fetchApi } from '@/lib/api';
import { DressStatus, RentalStatus, PayoutStatus, RoleType } from '@borrowed/types';
import { format } from 'date-fns';
import {
  Shield,
  Tag,
  ShoppingBag,
  Users,
  DollarSign,
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Eye,
  Save,
  Plus,
  AlertTriangle,
} from 'lucide-react';

export default function AdminConsolePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'rentals' | 'finance' | 'settings'>('overview');

  // Admin Data states
  const [overview, setOverview] = useState<any | null>(null);
  const [dresses, setDresses] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [settings, setSettings] = useState<any | null>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [eligibleEarnings, setEligibleEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Moderation state
  const [rejectingDressId, setRejectingDressId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Settings form state
  const [commissionRate, setCommissionRate] = useState('20');
  const [deliveryDaysOffset, setDeliveryDaysOffset] = useState('3');
  const [returnDaysOffset, setReturnDaysOffset] = useState('1');
  const [prepBufferDays, setPrepBufferDays] = useState('2');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const fetchAllAdminData = () => {
    setLoading(true);
    Promise.all([
      fetchApi('/finance/admin/overview').catch(() => null),
      fetchApi('/dresses/admin/all').catch(() => []),
      fetchApi('/rentals/admin/all').catch(() => []),
      fetchApi('/settings').catch(() => null),
      fetchApi('/settings/admin/cities').catch(() => []),
      fetchApi('/finance/eligible-earnings').catch(() => []),
    ])
      .then(([fin, drs, rnts, stt, cts, elg]) => {
        setOverview(fin);
        setDresses(drs || []);
        setRentals(rnts || []);
        setSettings(stt);
        setCities(cts || []);
        setEligibleEarnings(elg || []);

        if (stt) {
          setCommissionRate(stt.commissionPercentage.toString());
          setDeliveryDaysOffset(stt.deliveryDaysBeforeOccasion.toString());
          setReturnDaysOffset(stt.returnDaysAfterOccasion.toString());
          setPrepBufferDays(stt.preparationBufferDays.toString());
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const handleApproveDress = async (dressId: string) => {
    try {
      await fetchApi(`/dresses/${dressId}/moderate`, {
        method: 'POST',
        body: JSON.stringify({ status: DressStatus.APPROVED }),
      });
      fetchAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectDress = async (dressId: string) => {
    try {
      await fetchApi(`/dresses/${dressId}/moderate`, {
        method: 'POST',
        body: JSON.stringify({
          status: DressStatus.REJECTED,
          reason: rejectionReason || 'Does not meet photo quality requirements',
        }),
      });
      setRejectingDressId(null);
      setRejectionReason('');
      fetchAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          commission_percentage: commissionRate,
          delivery_days_before_occasion: deliveryDaysOffset,
          return_days_after_occasion: returnDaysOffset,
          preparation_buffer_days: prepBufferDays,
        }),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      fetchAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const handleProcessPayout = async (ownerId: string, earningId: string) => {
    try {
      await fetchApi('/finance/payouts', {
        method: 'POST',
        body: JSON.stringify({
          ownerId,
          earningIds: [earningId],
          method: 'Instapay',
          notes: 'Batch bank payout verified by Camilla',
        }),
      });
      alert('Payout recorded successfully!');
      fetchAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Payout failed');
    }
  };

  const pendingDresses = dresses.filter((d) => d.status === DressStatus.PENDING_REVIEW);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-taupe/20 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-rose-800 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Super Administrator Console
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-onyx font-editorial">
            Platform Administration
          </h1>
          <p className="text-xs text-onyx/60 mt-0.5">
            Full control over dress moderation, courier dispatch, revenue commissions, and dynamic policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllAdminData}
            className="px-4 py-2 bg-white border border-taupe text-xs font-semibold rounded-lg hover:bg-ivory transition-colors"
          >
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-taupe/30 space-x-8 text-xs font-bold uppercase tracking-wider overflow-x-auto">
        {[
          { key: 'overview', label: 'Executive KPIs' },
          { key: 'moderation', label: `Dress Moderation (${pendingDresses.length} Pending)` },
          { key: 'rentals', label: `All Rentals (${rentals.length})` },
          { key: 'finance', label: 'Finance & Payouts' },
          { key: 'settings', label: 'Policy Settings' },
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

      {/* TAB 1: EXECUTIVE KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-luxury border border-taupe/30 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-onyx/50">Gross Rental Volume (GMV)</span>
              <p className="text-3xl font-extrabold text-onyx font-editorial">
                EGP {(overview?.grossRentalValue || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-onyx/60 font-medium">All platform bookings</p>
            </div>

            <div className="bg-white p-6 rounded-luxury border border-taupe/30 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-onyx/50">Platform Commission Net</span>
              <p className="text-3xl font-extrabold text-sage-dark font-editorial">
                EGP {(overview?.totalCommissionRevenue || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-onyx/60 font-medium">{settings?.commissionPercentage || 20}% platform cut</p>
            </div>

            <div className="bg-white p-6 rounded-luxury border border-taupe/30 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-onyx/50">Fleet Delivery Revenue</span>
              <p className="text-3xl font-extrabold text-onyx font-editorial">
                EGP {(overview?.totalDeliveryRevenue || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-onyx/60 font-medium">Two-way courier charges</p>
            </div>

            <div className="bg-white p-6 rounded-luxury border border-taupe/30 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-onyx/50">Pending Owner Payouts</span>
              <p className="text-3xl font-extrabold text-mauve-dark font-editorial">
                EGP {(overview?.pendingOwnerPayouts || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-onyx/60 font-medium">Eligible for disbursement</p>
            </div>
          </div>

          {/* Quick Pending Moderation Alert */}
          {pendingDresses.length > 0 && (
            <div className="p-4 rounded-luxury bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
                <div className="text-xs">
                  <p className="font-bold text-amber-900">
                    {pendingDresses.length} Dress Listings Awaiting Review
                  </p>
                  <p className="text-amber-800">Review photography and descriptions before publishing.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('moderation')}
                className="px-4 py-2 bg-amber-900 text-white text-xs font-semibold rounded-lg hover:bg-amber-800 transition-colors"
              >
                Review Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DRESS MODERATION */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold font-editorial text-onyx">Dress Review & Moderation Queue</h2>
              <p className="text-xs text-onyx/60">
                Owners submit dresses for free. Inspect condition, photography, and pricing before publishing.
              </p>
            </div>

            <div className="space-y-4">
              {dresses.map((dress) => {
                const cover = dress.coverImage || dress.images?.[0]?.url || '';
                const isPending = dress.status === DressStatus.PENDING_REVIEW;

                return (
                  <div
                    key={dress.id}
                    className={`p-4 rounded-luxury border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                      isPending ? 'bg-amber-50/50 border-amber-200' : 'bg-ivory border-taupe/20'
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="relative w-16 aspect-[3/4] rounded overflow-hidden bg-ivory-dark flex-shrink-0">
                        <Image src={cover} alt="" fill className="object-cover object-top" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-onyx">{dress.brand}</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-white border text-onyx">
                            {dress.status}
                          </span>
                        </div>
                        <h4 className="font-semibold text-onyx">{dress.title}</h4>
                        <p className="text-onyx/60">
                          Listed by: {dress.owner?.firstName} {dress.owner?.lastName} • Size: {dress.size} • Rental: EGP {dress.rentalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Link
                        href={`/dresses/${dress.id}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-white border border-taupe/40 text-onyx text-xs font-semibold rounded hover:bg-ivory flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </Link>

                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApproveDress(dress.id)}
                            className="px-3 py-1.5 bg-sage text-onyx text-xs font-bold rounded hover:bg-sage-light flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>

                          <button
                            onClick={() => setRejectingDressId(dress.id)}
                            className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded hover:bg-rose-700 flex items-center gap-1 shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rejection Reason Modal */}
          {rejectingDressId && (
            <div className="fixed inset-0 z-50 bg-onyx/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-luxury-lg max-w-md w-full p-6 space-y-4 shadow-2xl border border-taupe/40">
                <h3 className="text-base font-bold text-onyx">Provide Rejection Reason to Owner</h3>
                <textarea
                  rows={3}
                  placeholder="e.g. Please provide photos in natural lighting without filters matching our editorial standards."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 text-xs bg-ivory border border-taupe/40 rounded text-onyx"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setRejectingDressId(null)}
                    className="px-4 py-2 text-xs font-semibold text-onyx/60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRejectDress(rejectingDressId)}
                    className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded"
                  >
                    Send Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL RENTALS */}
      {activeTab === 'rentals' && (
        <div className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold font-editorial text-onyx">All Platform Bookings</h2>
            <p className="text-xs text-onyx/60">
              Live monitor of bookings, delivery status, and rental returns.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-onyx/70 uppercase text-[10px] font-bold tracking-wider border-b border-taupe/20">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Dress</th>
                  <th className="p-3">Renter</th>
                  <th className="p-3">Occasion</th>
                  <th className="p-3">3d Delivery</th>
                  <th className="p-3">Total Paid</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taupe/15">
                {rentals.map((r) => (
                  <tr key={r.id} className="hover:bg-ivory/50">
                    <td className="p-3 font-mono font-bold text-onyx">{r.bookingReference}</td>
                    <td className="p-3 font-semibold text-onyx">{r.dress?.title}</td>
                    <td className="p-3 text-onyx/70">{r.renter?.firstName} {r.renter?.lastName}</td>
                    <td className="p-3 text-onyx">{format(new Date(r.occasionDate), 'MMM d, yyyy')}</td>
                    <td className="p-3 text-onyx font-semibold">{format(new Date(r.scheduledDeliveryDate), 'MMM d')}</td>
                    <td className="p-3 font-bold text-onyx">EGP {r.totalAmount?.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-onyx/10 text-onyx">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FINANCE & PAYOUTS */}
      {activeTab === 'finance' && (
        <div className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold font-editorial text-onyx">Owner Payouts Disbursement</h2>
            <p className="text-xs text-onyx/60">
              Eligible earnings ready for transfer to dress owners upon verified rental completion.
            </p>
          </div>

          <div className="space-y-3">
            {eligibleEarnings.length === 0 ? (
              <p className="text-xs text-onyx/60 p-6 bg-ivory rounded-luxury text-center">
                All eligible owner earnings have been disbursed.
              </p>
            ) : (
              eligibleEarnings.map((e) => (
                <div
                  key={e.id}
                  className="p-4 rounded-luxury bg-ivory border border-taupe/30 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-onyx">
                      {e.owner?.firstName} {e.owner?.lastName} • {e.rentalBooking?.dress?.title}
                    </p>
                    <p className="text-onyx/60">
                      Destination: {e.owner?.payoutMethod || 'Instapay'} ({e.owner?.payoutDetails || 'Direct'})
                    </p>
                    <p className="text-[10px] text-onyx/50 font-mono">Ref: {e.rentalBooking?.bookingReference}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold font-sans text-onyx">
                      EGP {e.netEarnings.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleProcessPayout(e.ownerId, e.id)}
                      className="px-4 py-2 bg-onyx text-ivory text-xs font-bold rounded-lg hover:bg-darkbrown transition-colors shadow-sm"
                    >
                      Disburse Payout
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: POLICY SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h2 className="text-xl font-bold font-editorial text-onyx">Platform Policy Configuration</h2>
            <p className="text-xs text-onyx/60">
              Adjust business parameters, offsets, and commission splits in real-time.
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3 rounded bg-sage/20 border border-sage text-sage-dark text-xs font-bold">
              Settings updated successfully!
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-onyx block">Platform Commission Rate (%)</label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded text-onyx font-bold"
              />
              <p className="text-[10px] text-onyx/50">Deducted from dress owner rental price upon booking.</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-onyx block">Delivery Days Before Occasion (Default: 3)</label>
              <input
                type="number"
                value={deliveryDaysOffset}
                onChange={(e) => setDeliveryDaysOffset(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded text-onyx font-bold"
              />
              <p className="text-[10px] text-onyx/50">Early delivery window for dress fitting & accessories.</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-onyx block">Return Days After Occasion (Default: 1)</label>
              <input
                type="number"
                value={returnDaysOffset}
                onChange={(e) => setReturnDaysOffset(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded text-onyx font-bold"
              />
              <p className="text-[10px] text-onyx/50">Days after event date when courier collects the dress.</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-onyx block">Preparation & Cleaning Buffer Days (Default: 2)</label>
              <input
                type="number"
                value={prepBufferDays}
                onChange={(e) => setPrepBufferDays(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded text-onyx font-bold"
              />
              <p className="text-[10px] text-onyx/50">Buffer days required between consecutive bookings for dry cleaning.</p>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-onyx text-ivory text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-darkbrown transition-colors shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Platform Settings</span>
          </button>
        </form>
      )}
    </div>
  );
}

