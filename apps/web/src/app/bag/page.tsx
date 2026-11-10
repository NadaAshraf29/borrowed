'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useBagStore } from '@/lib/bag-store';
import { format } from 'date-fns';
import {
  ShoppingBag,
  Trash2,
  Calendar,
  Truck,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function RentalBagPage() {
  const router = useRouter();
  const { items, removeItem, updateDate, clearBag, getTotal } = useBagStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const subtotal = getTotal();

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-white mx-auto flex items-center justify-center text-onyx border border-taupe/30 shadow-sm">
          <ShoppingBag className="w-8 h-8 text-taupe-dark" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-onyx font-editorial">Your Rental Bag is Empty</h1>
          <p className="text-xs text-onyx/70 max-w-sm mx-auto">
            Find the perfect gown for your next wedding, gala, or special night from our curated closet.
          </p>
        </div>
        <Link
          href="/dresses"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-luxury"
        >
          <span>Explore Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-taupe/20">
        <div>
          <h1 className="text-3xl font-extrabold text-onyx font-editorial">Your Rental Bag</h1>
          <p className="text-xs text-onyx/60 mt-0.5">
            Review your rental dates and delivery schedule before confirming your reservation.
          </p>
        </div>
        <button
          onClick={clearBag}
          className="text-xs text-rose-600 hover:underline font-semibold"
        >
          Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const dress = item.dress;
            const cover = dress.coverImage || dress.images?.[0]?.url || '';

            return (
              <div
                key={dress.id}
                className="bg-white p-6 rounded-luxury border border-taupe/30 shadow-sm flex flex-col sm:flex-row gap-6 relative"
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-32 aspect-[3/4] rounded-lg overflow-hidden bg-ivory-dark flex-shrink-0">
                  <Image src={cover} alt={dress.title} fill className="object-cover object-top" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-mauve-dark block">
                        {dress.brand}
                      </span>
                      <Link href={`/dresses/${dress.id}`}>
                        <h3 className="text-base font-bold text-onyx hover:text-darkbrown transition-colors">
                          {dress.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-onyx/60 font-medium mt-0.5">
                        Size: <span className="text-onyx font-semibold">{dress.size}</span> • Color: <span className="text-onyx font-semibold">{dress.color}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(dress.id)}
                      className="p-1.5 text-onyx/40 hover:text-rose-600 transition-colors"
                      title="Remove dress from bag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scheduled Window Breakdown */}
                  <div className="p-3.5 rounded-lg bg-ivory border border-taupe/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-onyx/60 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-darkbrown" />
                        Occasion Date:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-onyx">
                          {format(new Date(item.occasionDate), 'EEE, MMM d, yyyy')}
                        </span>
                        <button
                          onClick={() => setEditingId(editingId === dress.id ? null : dress.id)}
                          className="text-[10px] text-mauve-dark hover:underline font-semibold"
                        >
                          {editingId === dress.id ? 'Cancel' : 'Change Date'}
                        </button>
                      </div>
                    </div>

                    {/* Change Date Inline Input */}
                    {editingId === dress.id && (
                      <div className="pt-2 border-t border-taupe/20 flex items-center gap-2">
                        <input
                          type="date"
                          defaultValue={item.occasionDate.split('T')[0]}
                          onChange={(e) => {
                            if (e.target.value) {
                              updateDate(dress.id, e.target.value);
                              setEditingId(null);
                            }
                          }}
                          className="p-1.5 text-xs bg-white border border-taupe rounded text-onyx"
                        />
                      </div>
                    )}

                    <div className="flex justify-between text-[11px] pt-1 border-t border-taupe/15">
                      <span className="text-onyx/60">3-Day Prior Early Delivery:</span>
                      <span className="font-semibold text-onyx">
                        {format(new Date(item.scheduledDeliveryDate), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-onyx/60">Doorstep Return Pickup:</span>
                      <span className="font-semibold text-onyx">
                        {format(new Date(item.scheduledReturnDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Fee Itemization for this item */}
                  <div className="flex items-center justify-between pt-2 border-t border-taupe/15 text-xs">
                    <span className="text-onyx/60">
                      Rental (EGP {item.rentalPrice.toLocaleString()}) + Fleet Delivery (EGP {item.deliveryFee.toLocaleString()})
                    </span>
                    <span className="font-bold text-sm text-onyx">
                      EGP {item.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-luxury-lg border border-taupe/40 shadow-luxury space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-onyx pb-3 border-b border-taupe/20">
              Rental Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-onyx/75">
                <span>Dresses Subtotal</span>
                <span>EGP {items.reduce((s, i) => s + i.rentalPrice, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-onyx/75">
                <span>Total Delivery & Return Fleet Fee</span>
                <span>EGP {items.reduce((s, i) => s + i.deliveryFee, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-onyx/75">
                <span>Fitting & Preparation Period</span>
                <span className="font-bold text-sage">Complimentary (3 Days)</span>
              </div>

              <div className="pt-3 border-t border-taupe/20 flex justify-between font-bold text-base text-onyx">
                <span>Total Payable</span>
                <span>EGP {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-4 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="p-4 rounded-luxury bg-white border border-taupe/20 space-y-2 text-xs text-onyx/70">
            <div className="flex items-center gap-2 font-semibold text-onyx">
              <ShieldCheck className="w-4 h-4 text-sage" />
              <span>Rental Protection Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Dresses are delivered via our dedicated private delivery fleet. You are protected with our 100% fit assurance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

