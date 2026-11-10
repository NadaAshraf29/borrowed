'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useBagStore } from '@/lib/bag-store';
import { useAuthStore } from '@/lib/auth-store';
import { fetchApi } from '@/lib/api';
import { PaymentMethod } from '@borrowed/types';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Truck,
  CreditCard,
  Wallet,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  MapPin,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearBag, getTotal } = useBagStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delivery Form State
  const [recipientName, setRecipientName] = useState(
    user ? `${user.firstName} ${user.lastName}` : 'Yasmin Soliman',
  );
  const [recipientPhone, setRecipientPhone] = useState(
    user?.phoneNumber || '+201007778888',
  );
  const [city, setCity] = useState(items[0]?.deliveryCity || 'Cairo');
  const [area, setArea] = useState('5th Settlement');
  const [street, setStreet] = useState('South Academy, Street 14');
  const [building, setBuilding] = useState('Building 42');
  const [floor, setFloor] = useState('3rd Floor');
  const [apartment, setApartment] = useState('Apt 302');
  const [notes, setNotes] = useState('Please call 15 minutes before arrival');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 8841');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('884');
  const [cardholderName, setCardholderName] = useState(recipientName);

  // Confirmed Booking Result
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  useEffect(() => {
    if (items.length === 0 && step !== 5) {
      router.push('/bag');
    }
  }, [items, step, router]);

  const targetItem = items[0]; // Primary rental item

  const handleConfirmAndPay = async () => {
    if (!targetItem) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Create the booking
      const bookingData = await fetchApi('/rentals', {
        method: 'POST',
        body: JSON.stringify({
          dressId: targetItem.dress.id,
          occasionDate: targetItem.occasionDate,
          deliveryAddress: {
            city,
            area,
            street,
            building,
            floor,
            apartment,
            notes,
            recipientName,
            recipientPhone,
          },
          paymentMethod,
        }),
      });

      // 2. Process payment
      const confirmed = await fetchApi(`/rentals/${bookingData.id}/pay`, {
        method: 'POST',
        body: JSON.stringify({
          paymentMethod,
          cardDetails:
            paymentMethod === PaymentMethod.CREDIT_CARD
              ? {
                  cardNumber: cardNumber.replace(/\s+/g, ''),
                  expDate: cardExp,
                  cvv: cardCvv,
                  cardholderName,
                }
              : undefined,
          notes,
        }),
      });

      setConfirmedBooking(confirmed);
      clearBag();
      setStep(5);

      // Trigger celebratory luxury confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0B0B0B', '#C9B9A6', '#C7A3B0', '#8EA48F'],
        });
      } catch {}
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please verify dates.');
    } finally {
      setLoading(false);
    }
  };

  if (!targetItem && step !== 5) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Checkout Progress Stepper */}
      {step < 5 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-onyx">
            <span className={step >= 1 ? 'text-onyx' : 'text-onyx/40'}>1. Review</span>
            <span className="text-taupe">───</span>
            <span className={step >= 2 ? 'text-onyx' : 'text-onyx/40'}>2. Delivery</span>
            <span className="text-taupe">───</span>
            <span className={step >= 3 ? 'text-onyx' : 'text-onyx/40'}>3. Logistics</span>
            <span className="text-taupe">───</span>
            <span className={step >= 4 ? 'text-onyx' : 'text-onyx/40'}>4. Payment</span>
          </div>

          <div className="w-full bg-taupe/30 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-onyx h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-luxury bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* STEP 1: REVIEW */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-luxury space-y-6">
          <div className="border-b border-taupe/20 pb-4">
            <h2 className="text-2xl font-bold font-editorial text-onyx">Step 1: Rental Review</h2>
            <p className="text-xs text-onyx/60">
              Confirm your selected garment and automated delivery window.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-luxury bg-ivory border border-taupe/20">
            <div className="relative w-28 aspect-[3/4] rounded-lg overflow-hidden bg-ivory-dark flex-shrink-0">
              <Image
                src={targetItem.dress.coverImage || targetItem.dress.images?.[0]?.url || ''}
                alt=""
                fill
                className="object-cover object-top"
              />
            </div>
            <div className="space-y-2 flex-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-mauve-dark block">
                {targetItem.dress.brand}
              </span>
              <h3 className="text-base font-bold text-onyx">{targetItem.dress.title}</h3>
              <p className="text-onyx/70">
                Size: <span className="font-semibold text-onyx">{targetItem.dress.size}</span> • Color: <span className="font-semibold text-onyx">{targetItem.dress.color}</span>
              </p>

              <div className="pt-2 border-t border-taupe/20 space-y-1">
                <div className="flex justify-between">
                  <span className="text-onyx/60">Occasion Date:</span>
                  <span className="font-bold text-onyx">
                    {format(new Date(targetItem.occasionDate), 'EEE, MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-onyx/60">3-Day Prior Early Delivery:</span>
                  <span className="font-semibold text-onyx">
                    {format(new Date(targetItem.scheduledDeliveryDate), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-onyx/60">Doorstep Return Pickup:</span>
                  <span className="font-semibold text-onyx">
                    {format(new Date(targetItem.scheduledReturnDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <Link href="/bag" className="text-xs font-semibold text-onyx/60 hover:text-onyx flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Bag
            </Link>
            <button
              onClick={() => setStep(2)}
              className="px-8 py-3.5 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-md flex items-center gap-2"
            >
              <span>Delivery Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DELIVERY ADDRESS */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-luxury space-y-6">
          <div className="border-b border-taupe/20 pb-4">
            <h2 className="text-2xl font-bold font-editorial text-onyx">Step 2: Delivery Destination</h2>
            <p className="text-xs text-onyx/60">
              Where should our private delivery fleet courier deliver your dress 3 days before your event?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Phone Number (Required for Courier)</label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">City / Governorate</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Area / District</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-onyx block">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Building & Floor</label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Apartment Number</label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-onyx block">Delivery Instructions / Gate Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button onClick={() => setStep(1)} className="text-xs font-semibold text-onyx/60 hover:text-onyx flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-8 py-3.5 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-md flex items-center gap-2"
            >
              <span>Verify Logistics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LOGISTICS CALCULATION */}
      {step === 3 && (
        <div className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-luxury space-y-6">
          <div className="border-b border-taupe/20 pb-4">
            <h2 className="text-2xl font-bold font-editorial text-onyx">Step 3: Logistics Breakdown</h2>
            <p className="text-xs text-onyx/60">
              Review delivery fee and platform courier handling.
            </p>
          </div>

          <div className="p-5 rounded-luxury bg-ivory border border-taupe/30 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-onyx/70">Selected Destination City:</span>
              <span className="font-bold text-onyx">{city} ({area})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onyx/70">Two-Way Courier Fleet Service:</span>
              <span className="font-bold text-onyx">EGP {targetItem.deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onyx/70">Garment Steaming & Hanger Service:</span>
              <span className="font-bold text-sage">Complimentary Included</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onyx/70">Doorstep Return Pickup Service:</span>
              <span className="font-bold text-sage">Complimentary Included</span>
            </div>
            <div className="pt-2 border-t border-taupe/20 flex justify-between font-bold text-sm text-onyx">
              <span>Final Total to Pay</span>
              <span>EGP {targetItem.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button onClick={() => setStep(2)} className="text-xs font-semibold text-onyx/60 hover:text-onyx flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-8 py-3.5 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-md flex items-center gap-2"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PAYMENT */}
      {step === 4 && (
        <div className="bg-white p-8 rounded-luxury-lg border border-taupe/30 shadow-luxury space-y-6">
          <div className="border-b border-taupe/20 pb-4">
            <h2 className="text-2xl font-bold font-editorial text-onyx">Step 4: Payment Confirmation</h2>
            <p className="text-xs text-onyx/60">
              Select your payment method. Payments are held in platform escrow until delivery is verified.
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod(PaymentMethod.CREDIT_CARD)}
              className={`p-4 rounded-luxury border text-left flex flex-col justify-between space-y-2 transition-all ${
                paymentMethod === PaymentMethod.CREDIT_CARD
                  ? 'border-onyx bg-onyx text-ivory'
                  : 'border-taupe/30 bg-ivory text-onyx hover:border-taupe'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <div>
                <p className="text-xs font-bold">Credit / Debit Card</p>
                <p className="text-[10px] opacity-70">Instant confirmation</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod(PaymentMethod.DIGITAL_WALLET)}
              className={`p-4 rounded-luxury border text-left flex flex-col justify-between space-y-2 transition-all ${
                paymentMethod === PaymentMethod.DIGITAL_WALLET
                  ? 'border-onyx bg-onyx text-ivory'
                  : 'border-taupe/30 bg-ivory text-onyx hover:border-taupe'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <div>
                <p className="text-xs font-bold">Digital Wallet / Instapay</p>
                <p className="text-[10px] opacity-70">Vodafone Cash / Instapay</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY)}
              className={`p-4 rounded-luxury border text-left flex flex-col justify-between space-y-2 transition-all ${
                paymentMethod === PaymentMethod.CASH_ON_DELIVERY
                  ? 'border-onyx bg-onyx text-ivory'
                  : 'border-taupe/30 bg-ivory text-onyx hover:border-taupe'
              }`}
            >
              <Banknote className="w-5 h-5" />
              <div>
                <p className="text-xs font-bold">Cash on Delivery</p>
                <p className="text-[10px] opacity-70">Pay courier on 3-day dropoff</p>
              </div>
            </button>
          </div>

          {/* Card Mock Fields */}
          {paymentMethod === PaymentMethod.CREDIT_CARD && (
            <div className="p-5 rounded-luxury bg-ivory border border-taupe/30 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-taupe/20">
                <span className="font-bold text-onyx flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sage" />
                  Encrypted Card Checkout (Demo Mode)
                </span>
                <span className="text-[10px] text-onyx/50 font-mono">256-bit TLS</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-onyx/60">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full p-2.5 bg-white border border-taupe/40 rounded text-onyx font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-onyx/60">Expiration</label>
                  <input
                    type="text"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full p-2.5 bg-white border border-taupe/40 rounded text-onyx font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-onyx/60">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full p-2.5 bg-white border border-taupe/40 rounded text-onyx font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-between items-center">
            <button onClick={() => setStep(3)} className="text-xs font-semibold text-onyx/60 hover:text-onyx flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              disabled={loading}
              onClick={handleConfirmAndPay}
              className="px-8 py-4 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-luxury flex items-center gap-2"
            >
              <span>{loading ? 'Confirming Booking...' : `Pay & Reserve EGP ${targetItem.totalAmount.toLocaleString()}`}</span>
              <ShieldCheck className="w-4 h-4 text-sage" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRMATION */}
      {step === 5 && confirmedBooking && (
        <div className="bg-white p-8 sm:p-12 rounded-luxury-lg border border-taupe/30 shadow-luxury text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-sage/20 mx-auto flex items-center justify-center text-sage">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-sage block">
              Reservation Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-onyx font-editorial">
              Your Runway Moment Awaits.
            </h1>
            <p className="text-xs text-onyx/70 max-w-md mx-auto">
              Booking Reference: <span className="font-mono font-bold text-onyx">{confirmedBooking.bookingReference}</span>
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="max-w-md mx-auto p-5 rounded-luxury bg-ivory border border-taupe/30 text-left space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-onyx/60">Dress:</span>
              <span className="font-bold text-onyx">{confirmedBooking.dress?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onyx/60">Scheduled 3-Day Delivery:</span>
              <span className="font-bold text-onyx">
                {format(new Date(confirmedBooking.scheduledDeliveryDate), 'EEE, MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-onyx/60">Occasion Date:</span>
              <span className="font-bold text-mauve-dark">
                {format(new Date(confirmedBooking.occasionDate), 'EEE, MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-onyx/60">Return Collection Date:</span>
              <span className="font-bold text-onyx">
                {format(new Date(confirmedBooking.scheduledReturnDate), 'EEE, MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-onyx/60">Total Paid:</span>
              <span className="font-bold text-onyx">EGP {confirmedBooking.totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/rentals"
              className="px-8 py-3.5 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-md"
            >
              Track in My Rentals
            </Link>
            <Link
              href="/dresses"
              className="px-8 py-3.5 bg-white border border-taupe text-onyx text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-ivory transition-all"
            >
              Explore More Dresses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

