'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/auth-store';
import { fetchApi } from '@/lib/api';
import { RentalStatus } from '@borrowed/types';
import { format } from 'date-fns';
import {
  ShoppingBag,
  Calendar,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  X,
} from 'lucide-react';

export default function MyRentalsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed' | 'cancelled'>('active');
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<any | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  const fetchRentals = () => {
    setLoading(true);
    fetchApi(`/rentals/my?tab=${activeTab}`)
      .then((data) => setRentals(data || []))
      .catch(() => setRentals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRentals();
  }, [activeTab]);

  const handleRequestReturn = async (bookingId: string) => {
    setReturnSubmitting(true);
    try {
      await fetchApi(`/rentals/${bookingId}/return-request`, {
        method: 'POST',
        body: JSON.stringify({ notes: returnNotes || 'Ready for courier doorstep pickup' }),
      });
      setSelectedRental(null);
      fetchRentals();
    } catch (err: any) {
      alert(err.message || 'Failed to submit return request');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const getStatusBadge = (status: RentalStatus) => {
    switch (status) {
      case RentalStatus.CONFIRMED:
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">Confirmed (Preparing)</span>;
      case RentalStatus.OUT_FOR_DELIVERY:
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full animate-pulse">Out for Delivery 🚚</span>;
      case RentalStatus.DELIVERED:
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">Delivered to You ✨</span>;
      case RentalStatus.RETURN_SCHEDULED:
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-full">Return Scheduled</span>;
      case RentalStatus.COLLECTED_FROM_RENTER:
      case RentalStatus.RETURNING_TO_OWNER:
        return <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full">Courier Returning</span>;
      case RentalStatus.COMPLETED:
        return <span className="px-2.5 py-1 bg-sage/30 text-sage-dark text-[10px] font-bold rounded-full">Completed ✓</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full">{status}</span>;
    }
  };

  const timelineStages: { key: RentalStatus; label: string }[] = [
    { key: RentalStatus.CONFIRMED, label: 'Confirmed' },
    { key: RentalStatus.COLLECTED_FROM_OWNER, label: 'Owner Picked' },
    { key: RentalStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery' },
    { key: RentalStatus.DELIVERED, label: 'Delivered (3d Early)' },
    { key: RentalStatus.RETURN_SCHEDULED, label: 'Return Scheduled' },
    { key: RentalStatus.COLLECTED_FROM_RENTER, label: 'Collected' },
    { key: RentalStatus.COMPLETED, label: 'Completed' },
  ];

  const getStageIndex = (status: RentalStatus) => {
    const order = [
      RentalStatus.PENDING_PAYMENT,
      RentalStatus.CONFIRMED,
      RentalStatus.PICKUP_SCHEDULED,
      RentalStatus.COLLECTED_FROM_OWNER,
      RentalStatus.PREPARING,
      RentalStatus.OUT_FOR_DELIVERY,
      RentalStatus.DELIVERED,
      RentalStatus.RETURN_SCHEDULED,
      RentalStatus.OUT_FOR_COLLECTION,
      RentalStatus.COLLECTED_FROM_RENTER,
      RentalStatus.RETURNING_TO_OWNER,
      RentalStatus.RETURNED_TO_OWNER,
      RentalStatus.COMPLETED,
    ];
    return order.indexOf(status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-taupe/20 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-onyx font-editorial">My Rentals</h1>
          <p className="text-xs text-onyx/60 mt-1">
            Track your live deliveries, fitting periods, and scheduled doorstep collections.
          </p>
        </div>

        <Link
          href="/dresses"
          className="px-4 py-2 bg-onyx text-ivory text-xs font-semibold rounded-lg hover:bg-darkbrown transition-colors self-start sm:self-auto"
        >
          Rent Another Dress
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-taupe/30 space-x-8 text-xs font-bold uppercase tracking-wider">
        {[
          { key: 'active', label: 'Active Rentals' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Past / Completed' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-3 relative transition-colors ${
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

      {/* Rentals List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-44 bg-white/70 rounded-luxury animate-pulse border border-taupe/20" />
          ))}
        </div>
      ) : rentals.length === 0 ? (
        <div className="bg-white p-12 rounded-luxury text-center border border-taupe/30 space-y-4">
          <div className="w-14 h-14 rounded-full bg-ivory mx-auto flex items-center justify-center text-onyx">
            <ShoppingBag className="w-6 h-6 text-taupe-dark" />
          </div>
          <h3 className="text-lg font-bold text-onyx font-editorial">No {activeTab} rentals found</h3>
          <p className="text-xs text-onyx/60 max-w-sm mx-auto">
            Explore our curated closet to reserve your next runway dress.
          </p>
          <Link
            href="/dresses"
            className="inline-block px-6 py-2.5 bg-onyx text-ivory text-xs font-semibold uppercase tracking-wider rounded-lg"
          >
            Browse Closet
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {rentals.map((rental) => {
            const dress = rental.dress;
            const cover = rental.coverImage || dress.images?.[0]?.url || '';
            const currentIndex = getStageIndex(rental.status);

            return (
              <div
                key={rental.id}
                className="bg-white p-6 rounded-luxury-lg border border-taupe/30 shadow-sm space-y-6 hover:border-taupe transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-taupe/20 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-onyx">
                      {rental.bookingReference}
                    </span>
                    {getStatusBadge(rental.status)}
                  </div>

                  <div className="text-xs text-onyx/60">
                    Booked on {format(new Date(rental.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>

                {/* Main Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Thumbnail & Titles */}
                  <div className="md:col-span-5 flex gap-4">
                    <div className="relative w-24 aspect-[3/4] rounded-lg overflow-hidden bg-ivory-dark flex-shrink-0">
                      <Image src={cover} alt="" fill className="object-cover object-top" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-mauve-dark block">
                        {dress.brand}
                      </span>
                      <h3 className="text-base font-bold text-onyx">{dress.title}</h3>
                      <p className="text-onyx/70">
                        Size: <span className="font-semibold text-onyx">{dress.size}</span>
                      </p>
                      <p className="text-xs font-bold text-onyx pt-1">
                        Total Paid: EGP {rental.totalAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Date Schedule Boxes */}
                  <div className="md:col-span-4 p-3.5 rounded-lg bg-ivory border border-taupe/20 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-onyx/60">Scheduled Delivery:</span>
                      <span className="font-bold text-onyx">
                        {format(new Date(rental.scheduledDeliveryDate), 'EEE, MMM d')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-onyx/60 font-semibold text-mauve-dark">Occasion Date:</span>
                      <span className="font-bold text-mauve-dark">
                        {format(new Date(rental.occasionDate), 'EEE, MMM d')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-onyx/60">Return Collection:</span>
                      <span className="font-bold text-onyx">
                        {format(new Date(rental.scheduledReturnDate), 'EEE, MMM d')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-3 flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedRental(rental)}
                      className="w-full py-2 bg-onyx text-ivory text-xs font-semibold rounded-lg hover:bg-darkbrown transition-colors text-center"
                    >
                      Track & View Details
                    </button>

                    {rental.status === RentalStatus.DELIVERED && (
                      <button
                        onClick={() => setSelectedRental(rental)}
                        className="w-full py-2 bg-mauve text-white text-xs font-semibold rounded-lg hover:bg-mauve-dark transition-colors"
                      >
                        Request Return Pickup
                      </button>
                    )}
                  </div>
                </div>

                {/* Real-Time Visual Timeline Bar */}
                <div className="pt-2 border-t border-taupe/15">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-onyx/70 overflow-x-auto pb-1 gap-4">
                    {timelineStages.map((stage, idx) => {
                      const passed = currentIndex >= getStageIndex(stage.key);
                      return (
                        <div key={idx} className="flex flex-col items-center min-w-[70px] text-center">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition-all ${
                              passed ? 'bg-onyx text-ivory' : 'bg-taupe/30 text-onyx/40'
                            }`}
                          >
                            {passed ? '✓' : idx + 1}
                          </div>
                          <span className={passed ? 'text-onyx font-bold' : 'text-onyx/40'}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Tracking Drawer Modal */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 bg-onyx/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-luxury-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-taupe/40 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-taupe/20">
              <div>
                <span className="text-[10px] uppercase font-bold text-mauve-dark block">
                  Rental Booking Details
                </span>
                <h3 className="text-xl font-bold font-editorial text-onyx">
                  {selectedRental.bookingReference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRental(null)}
                className="p-1.5 text-onyx/50 hover:text-onyx rounded-full hover:bg-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Courier Info if assigned */}
            {selectedRental.deliveryTasks?.[0]?.driver && (
              <div className="p-4 rounded-luxury bg-sage/15 border border-sage/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-onyx text-ivory flex items-center justify-center font-bold text-xs">
                  {selectedRental.deliveryTasks[0].driver.firstName[0]}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-onyx">
                    Assigned Courier: {selectedRental.deliveryTasks[0].driver.firstName} {selectedRental.deliveryTasks[0].driver.lastName}
                  </p>
                  <p className="text-onyx/70">Phone: {selectedRental.deliveryTasks[0].driver.phoneNumber}</p>
                </div>
              </div>
            )}

            {/* Status History Audit Trail */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-onyx">
                Live Status Updates
              </h4>
              <div className="space-y-2 border-l-2 border-onyx/20 pl-4 text-xs">
                {selectedRental.statusHistory?.map((h: any, i: number) => (
                  <div key={i} className="relative space-y-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-onyx absolute -left-[21px] top-1" />
                    <p className="font-bold text-onyx">{h.status.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] text-onyx/70">{h.note}</p>
                    <span className="text-[10px] text-onyx/40 block">
                      {format(new Date(h.createdAt), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Return Request Action */}
            {selectedRental.status === RentalStatus.DELIVERED && (
              <div className="p-4 rounded-luxury bg-ivory border border-taupe/30 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-onyx">
                  Ready for Return Collection?
                </h4>
                <p className="text-xs text-onyx/70">
                  Submit a collection request to dispatch our courier to your address.
                </p>
                <input
                  type="text"
                  placeholder="Gate notes or convenient pickup hour..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-taupe/40 rounded text-onyx"
                />
                <button
                  disabled={returnSubmitting}
                  onClick={() => handleRequestReturn(selectedRental.id)}
                  className="px-6 py-2.5 bg-mauve text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-mauve-dark transition-colors"
                >
                  {returnSubmitting ? 'Requesting...' : 'Confirm Return Pickup'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

