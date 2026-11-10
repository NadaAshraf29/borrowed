'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { DressDto } from '@borrowed/types';
import { fetchApi } from '@/lib/api';
import { useBagStore } from '@/lib/bag-store';
import { useFavoritesStore } from '@/lib/favorites-store';
import {
  Calendar,
  Truck,
  RotateCcw,
  ShieldCheck,
  Heart,
  ShoppingBag,
  MapPin,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  User,
  Star,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

export default function DressDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useBagStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const [dress, setDress] = useState<DressDto | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Form State
  // Default occasion date: 7 days from now
  const defaultOccasion = addDays(new Date(), 7).toISOString().split('T')[0];
  const [occasionDate, setOccasionDate] = useState(defaultOccasion);
  const [deliveryCity, setDeliveryCity] = useState('Cairo');
  const [supportedCities, setSupportedCities] = useState<{ name: string; deliveryFee: number }[]>([]);

  // Calculation calculation state
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcResult, setCalcResult] = useState<{
    occasionDate: string;
    scheduledDeliveryDate: string;
    scheduledReturnDate: string;
    rentalPrice: number;
    deliveryFee: number;
    depositFee: number;
    totalAmount: number;
    isAvailable: boolean;
    conflictReason?: string;
  } | null>(null);

  const [addedToBag, setAddedToBag] = useState(false);

  // 1. Fetch Dress and Cities
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchApi<DressDto>(`/dresses/${id}`),
      fetchApi<{ name: string; deliveryFee: number }[]>('/settings/cities'),
    ])
      .then(([dressData, citiesData]) => {
        setDress(dressData);
        setSupportedCities(citiesData || []);
        if (citiesData && citiesData.length > 0) {
          setDeliveryCity(citiesData[0].name);
        }
      })
      .catch((err) => setError(err.message || 'Failed to load dress details'))
      .finally(() => setLoading(false));
  }, [id]);

  // 2. Re-calculate rental whenever occasionDate or deliveryCity changes
  useEffect(() => {
    if (!id || !occasionDate) return;
    setCalcLoading(true);
    fetchApi('/rentals/calculate', {
      method: 'POST',
      body: JSON.stringify({
        dressId: id,
        occasionDate,
        deliveryCityName: deliveryCity,
      }),
    })
      .then((res) => setCalcResult(res))
      .catch((err) => console.error('Calculation error:', err))
      .finally(() => setCalcLoading(false));
  }, [id, occasionDate, deliveryCity]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-onyx border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-widest text-onyx/60 font-semibold">
          Curating dress details...
        </p>
      </div>
    );
  }

  if (error || !dress) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold font-editorial text-onyx">Dress Not Found</h2>
        <p className="text-xs text-onyx/70">{error || 'This listing may have been reserved or archived.'}</p>
        <Link
          href="/dresses"
          className="inline-block px-6 py-2.5 bg-onyx text-ivory text-xs font-semibold uppercase tracking-wider rounded-lg"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const images = dress.images?.length ? dress.images : [{ url: dress.coverImage, isCover: true, displayOrder: 0 }];
  const currentImage = images[selectedImageIndex]?.url || dress.coverImage;
  const favorited = isFavorite(dress.id);

  const handleAddToBag = async () => {
    if (!calcResult || !calcResult.isAvailable) return;
    await addItem(dress, occasionDate, deliveryCity);
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 3000);
  };

  const handleRentNow = async () => {
    if (!calcResult || !calcResult.isAvailable) return;
    await addItem(dress, occasionDate, deliveryCity);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-onyx/50 font-semibold">
        <Link href="/" className="hover:text-onyx">Home</Link>
        <ChevronRight className="w-3 h-3 text-taupe" />
        <Link href="/dresses" className="hover:text-onyx">Closet</Link>
        <ChevronRight className="w-3 h-3 text-taupe" />
        <span className="text-onyx font-bold truncate max-w-xs">{dress.brand}</span>
      </nav>

      {/* Main Product Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN: FASHION PHOTOGRAPHY GALLERY */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[3/4] w-full rounded-luxury-lg overflow-hidden bg-ivory-dark border border-taupe/30 shadow-luxury">
            <Image
              src={currentImage}
              alt={dress.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-top transition-all duration-300"
            />

            {/* Favorite Button Overlay */}
            <button
              onClick={() => toggleFavorite(dress.id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-md ${
                favorited
                  ? 'bg-mauve text-white'
                  : 'bg-white/80 hover:bg-white text-onyx hover:text-rose-600'
              }`}
              aria-label="Save to Favorites"
            >
              <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
            </button>

            {/* Condition Badge */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-onyx/85 backdrop-blur-md text-ivory text-[10px] uppercase tracking-widest font-semibold rounded-full border border-white/10">
              {dress.condition.replace('_', ' ')}
            </div>
          </div>

          {/* Thumbnail Gallery Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImageIndex === idx ? 'border-onyx shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover object-top" />
                </button>
              ))}
            </div>
          )}

          {/* Garment Details & Editorial Notes */}
          <div className="bg-white p-6 rounded-luxury border border-taupe/30 space-y-4 mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-onyx">
              Garment Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase text-onyx/50 block font-semibold">Designer</span>
                <span className="font-bold text-onyx">{dress.brand}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-onyx/50 block font-semibold">Size</span>
                <span className="font-bold text-onyx">{dress.size}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-onyx/50 block font-semibold">Color</span>
                <span className="font-bold text-onyx">{dress.color}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-onyx/50 block font-semibold">Material</span>
                <span className="font-bold text-onyx">{dress.material || 'Luxury Silk/Lace'}</span>
              </div>
            </div>

            {dress.replacementValue && (
              <p className="text-[11px] text-onyx/60 pt-2 border-t border-taupe/20">
                Estimated Retail Replacement Value: <span className="font-semibold text-onyx">EGP {dress.replacementValue.toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: BOOKING ENGINE & DETAILS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div className="space-y-2 pb-6 border-b border-taupe/20">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-onyx/60">
              <span className="text-mauve-dark">{dress.brand}</span>
              <div className="flex items-center gap-1 text-onyx">
                <MapPin className="w-3.5 h-3.5 text-darkbrown" />
                <span>{dress.city} ({dress.pickupArea})</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-onyx font-editorial">
              {dress.title}
            </h1>

            <p className="text-xs text-onyx/75 leading-relaxed pt-1">
              {dress.description}
            </p>

            {/* Owner Tag */}
            <div className="pt-3 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-onyx text-ivory flex items-center justify-center text-xs font-bold">
                {dress.ownerName ? dress.ownerName[0] : 'O'}
              </div>
              <div className="text-xs">
                <span className="text-onyx/50">Listed by dress owner </span>
                <span className="font-bold text-onyx">{dress.ownerName}</span>
              </div>
            </div>
          </div>

          {/* RENTAL ENGINE CARD */}
          <div className="bg-white p-6 rounded-luxury-lg border border-taupe/40 shadow-luxury space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-onyx/50 block">
                Rental Price (4-Day Window)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-onyx font-sans">
                  EGP {dress.rentalPrice.toLocaleString()}
                </span>
                <span className="text-xs text-onyx/60 font-medium">inclusive of 3-day fitting buffer</span>
              </div>
            </div>

            {/* Date and City Selector Controls */}
            <div className="space-y-4 pt-4 border-t border-taupe/20">
              {/* Occasion Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-onyx flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-darkbrown" />
                  Select Your Occasion Date
                </label>
                <input
                  type="date"
                  value={occasionDate}
                  min={addDays(new Date(), 3).toISOString().split('T')[0]}
                  onChange={(e) => setOccasionDate(e.target.value)}
                  className="w-full p-3 text-xs bg-ivory border border-taupe/40 rounded-lg text-onyx font-medium focus:outline-none focus:border-onyx transition-all"
                />
                <p className="text-[10px] text-onyx/60">
                  Minimum 3 days notice required for courier preparation and quality checks.
                </p>
              </div>

              {/* Delivery City Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-onyx flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-sage" />
                  Your Delivery City / Area
                </label>
                <select
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="w-full p-3 text-xs bg-ivory border border-taupe/40 rounded-lg text-onyx font-medium focus:outline-none focus:border-onyx transition-all cursor-pointer"
                >
                  {supportedCities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} (EGP {c.deliveryFee} Doorstep Fleet Fee)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DYNAMIC TIMELINE & AVAILABILITY DISPLAY */}
            {calcResult && (
              <div className="p-4 rounded-luxury bg-ivory border border-taupe/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-taupe/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-onyx">
                    Rental Timeline Breakdown
                  </span>
                  {calcResult.isAvailable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sage">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Unavailable
                    </span>
                  )}
                </div>

                {calcResult.isAvailable ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-onyx block">1. Scheduled Delivery</span>
                        <span className="text-[10px] text-onyx/60">3 Days Before Occasion for Fitting</span>
                      </div>
                      <span className="font-semibold text-onyx">
                        {format(new Date(calcResult.scheduledDeliveryDate), 'EEE, MMM d, yyyy')}
                      </span>
                    </div>

                    <div className="flex items-start justify-between pt-1 border-t border-taupe/15">
                      <div>
                        <span className="font-bold text-mauve-dark block">2. Occasion Date (Event Day)</span>
                        <span className="text-[10px] text-onyx/60">Enjoy your celebration</span>
                      </div>
                      <span className="font-bold text-mauve-dark">
                        {format(new Date(calcResult.occasionDate), 'EEE, MMM d, yyyy')}
                      </span>
                    </div>

                    <div className="flex items-start justify-between pt-1 border-t border-taupe/15">
                      <div>
                        <span className="font-bold text-onyx block">3. Scheduled Return Pickup</span>
                        <span className="text-[10px] text-onyx/60">Courier collects from your doorstep</span>
                      </div>
                      <span className="font-semibold text-onyx">
                        {format(new Date(calcResult.scheduledReturnDate), 'EEE, MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-rose-600 leading-relaxed font-medium">
                    {calcResult.conflictReason || 'This dress is reserved during the requested period. Please try another occasion date.'}
                  </p>
                )}

                {/* Price Itemization */}
                <div className="pt-3 border-t border-taupe/20 space-y-1 text-xs">
                  <div className="flex justify-between text-onyx/70">
                    <span>Dress Rental Fee</span>
                    <span>EGP {calcResult.rentalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-onyx/70">
                    <span>Doorstep Delivery & Return Service</span>
                    <span>EGP {calcResult.deliveryFee.toLocaleString()}</span>
                  </div>
                  {calcResult.depositFee > 0 && (
                    <div className="flex justify-between text-onyx/70">
                      <span>Refundable Security Deposit</span>
                      <span>EGP {calcResult.depositFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-taupe/20 flex justify-between font-bold text-sm text-onyx">
                    <span>Estimated Total</span>
                    <span>EGP {calcResult.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                disabled={!calcResult?.isAvailable || calcLoading}
                onClick={handleRentNow}
                className={`w-full py-3.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all shadow-md flex items-center justify-center gap-2 ${
                  calcResult?.isAvailable
                    ? 'bg-onyx text-ivory hover:bg-darkbrown'
                    : 'bg-taupe/50 text-onyx/40 cursor-not-allowed'
                }`}
              >
                <span>Rent Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                disabled={!calcResult?.isAvailable || calcLoading}
                onClick={handleAddToBag}
                className={`w-full py-3 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all flex items-center justify-center gap-2 ${
                  calcResult?.isAvailable
                    ? 'bg-white border-taupe text-onyx hover:bg-ivory'
                    : 'bg-white/40 border-taupe/30 text-onyx/30 cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addedToBag ? 'Added To Rental Bag ✓' : 'Add To Rental Bag'}</span>
              </button>
            </div>
          </div>

          {/* Protection & Policies Summary */}
          <div className="p-4 rounded-luxury bg-white border border-taupe/20 space-y-2.5 text-xs text-onyx/70">
            <div className="flex items-center gap-2 font-semibold text-onyx">
              <ShieldCheck className="w-4 h-4 text-sage" />
              <span>BORROWED. Quality & Fit Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every dress is inspected for authenticity, dry-cleaned, and steamed before courier delivery.
              Free cancellation up to 48 hours before scheduled delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

