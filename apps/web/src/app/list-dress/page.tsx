'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { fetchApi } from '@/lib/api';
import { DressCondition } from '@borrowed/types';
import confetti from 'canvas-confetti';
import {
  PlusCircle,
  Upload,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Info,
  ArrowRight,
  ShieldCheck,
  Tag,
  DollarSign,
} from 'lucide-react';

export default function ListDressPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Zimmermann');
  const [description, setDescription] = useState('');
  const [categorySlug, setCategorySlug] = useState('evening-gowns');
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(['Weddings', 'Parties']);
  const [size, setSize] = useState('FR 38 (S)');
  const [color, setColor] = useState('Champagne Gold');
  const [material, setMaterial] = useState('Silk Charmeuse');
  const [condition, setCondition] = useState<DressCondition>(DressCondition.LIKE_NEW);
  const [rentalPrice, setRentalPrice] = useState('1800');
  const [replacementValue, setReplacementValue] = useState('24000');
  const [city, setCity] = useState('Cairo');
  const [pickupArea, setPickupArea] = useState('Zamalek');

  // Images state
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<
    { url: string; isCover: boolean; displayOrder: number }[]
  >([
    {
      url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85',
      isCover: true,
      displayOrder: 0,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const occasionsList = [
    'Weddings',
    'Parties',
    'Galas',
    'Graduations',
    'Evening Events',
    'Designer Picks',
  ];

  const toggleOccasion = (occ: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ],
    );
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    const isFirst = images.length === 0;
    setImages((prev) => [
      ...prev,
      {
        url: imageUrlInput.trim(),
        isCover: isFirst,
        displayOrder: prev.length,
      },
    ]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const setCoverImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isCover: i === index,
      })),
    );
  };

  // Commission simulation
  const numRental = parseFloat(rentalPrice) || 0;
  const platformFee = Math.round(numRental * 0.2);
  const ownerPayout = numRental - platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in or select a demo account before listing a dress.');
      return;
    }

    if (!title.trim() || !brand.trim()) {
      setError('Please provide a dress title and designer brand.');
      return;
    }

    if (images.length === 0) {
      setError('Please add at least one high-resolution photo for the listing.');
      return;
    }

    setLoading(true);
    try {
      await fetchApi('/dresses', {
        method: 'POST',
        body: JSON.stringify({
          title,
          brand,
          description,
          categorySlug,
          occasions: selectedOccasions,
          size,
          color,
          material,
          condition,
          rentalPrice: numRental,
          replacementValue: parseFloat(replacementValue) || null,
          city,
          pickupArea,
          images,
        }),
      });

      setSubmitted(true);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      setError(err.message || 'Failed to submit dress for review.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-sage/20 mx-auto flex items-center justify-center text-sage">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-sage block">
            Submitted for Moderation
          </span>
          <h1 className="text-3xl font-extrabold text-onyx font-editorial">
            Your Listing Has Been Received!
          </h1>
          <p className="text-xs text-onyx/70 max-w-md mx-auto leading-relaxed">
            Our luxury curation team will verify the garment condition and photo resolution within 24 hours. Once approved, it will go live for renters across Cairo & Giza.
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-4">
          <Link
            href="/owner"
            className="px-8 py-3.5 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-md"
          >
            Go to Owner Dashboard
          </Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setTitle('');
              setDescription('');
            }}
            className="px-6 py-3.5 bg-white border border-taupe text-onyx text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-ivory transition-all"
          >
            List Another Dress
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-mauve/20 border border-mauve/40 rounded-full text-xs font-semibold tracking-widest uppercase text-mauve-dark">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Listing is Completely Free</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-onyx font-editorial">
          Your Dress Deserves Another Moment.
        </h1>
        <p className="text-xs sm:text-sm text-onyx/70 leading-relaxed">
          Turn the luxury gowns and party dresses you no longer wear into extra income. You set the rental price, and we coordinate all pickup, delivery, and return logistics.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-luxury bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
          {error}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-12 rounded-luxury-lg border border-taupe/30 shadow-luxury space-y-8">
        {/* Section 1: Dress Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-editorial text-onyx pb-2 border-b border-taupe/20">
            1. Garment Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-onyx block">Dress Title</label>
              <input
                type="text"
                placeholder="e.g. Midnight Emerald Sculptural Silk Gown"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none focus:border-onyx"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Designer Brand</label>
              <input
                type="text"
                placeholder="e.g. Zuhair Murad, Elie Saab, Zimmermann"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none focus:border-onyx"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Category</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none focus:border-onyx cursor-pointer"
              >
                <option value="evening-gowns">Evening Gowns</option>
                <option value="cocktail-party">Cocktail & Party</option>
                <option value="bridal-engagement">Bridal & Engagement</option>
                <option value="galas-black-tie">Galas & Black Tie</option>
                <option value="prom-graduation">Prom & Graduation</option>
                <option value="resort-destination">Resort & Destination</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Size</label>
              <input
                type="text"
                placeholder="e.g. FR 36, FR 38, S, M, US 4"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none focus:border-onyx"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Color</label>
              <input
                type="text"
                placeholder="e.g. Emerald Green, Blush Rose, Onyx"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none focus:border-onyx"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Material / Fabric</label>
              <input
                type="text"
                placeholder="e.g. Duchess Silk, French Lace, Pleated Tulle"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none focus:border-onyx"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as DressCondition)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none focus:border-onyx cursor-pointer"
              >
                <option value={DressCondition.BRAND_NEW}>Brand New (With Tags / Never Worn)</option>
                <option value={DressCondition.LIKE_NEW}>Like New (Worn once for a few hours)</option>
                <option value={DressCondition.EXCELLENT}>Excellent (Pristine condition)</option>
                <option value={DressCondition.GOOD}>Good (Light signs of gentle wear)</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-onyx block">Description & Styling Notes</label>
              <textarea
                rows={3}
                placeholder="Describe the fit, silhouette, back detailing, and styling tips..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none focus:border-onyx"
              />
            </div>
          </div>

          {/* Occasion tags */}
          <div className="space-y-2 pt-2">
            <label className="font-semibold text-xs text-onyx block">Suitable Occasions</label>
            <div className="flex flex-wrap gap-2">
              {occasionsList.map((occ) => {
                const active = selectedOccasions.includes(occ);
                return (
                  <button
                    type="button"
                    key={occ}
                    onClick={() => toggleOccasion(occ)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                      active
                        ? 'bg-onyx text-ivory border-onyx'
                        : 'bg-ivory border-taupe/40 text-onyx hover:border-taupe'
                    }`}
                  >
                    {occ} {active ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Photos Gallery */}
        <div className="space-y-4 pt-4 border-t border-taupe/20">
          <h2 className="text-lg font-bold font-editorial text-onyx pb-2 border-b border-taupe/20">
            2. High-Resolution Photography
          </h2>

          <div className="space-y-2">
            <p className="text-xs text-onyx/70">
              Add image URLs representing the front, back, and details of the dress. First image is the cover.
            </p>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste high-res image URL (e.g. Unsplash or hosted photo)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 p-2.5 text-xs bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2.5 bg-onyx text-ivory text-xs font-semibold rounded-lg hover:bg-darkbrown transition-colors"
              >
                Add Image
              </button>
            </div>

            {/* Thumbnail previews */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative aspect-[3/4] rounded-luxury overflow-hidden border-2 bg-ivory-dark ${
                    img.isCover ? 'border-onyx shadow-md' : 'border-taupe/30'
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover object-top" />

                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 bg-onyx/80 hover:bg-rose-600 text-white rounded-full transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {img.isCover ? (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-onyx text-ivory text-[9px] uppercase font-bold rounded">
                      Cover Photo
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCoverImage(idx)}
                      className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 text-onyx text-[9px] uppercase font-bold rounded hover:bg-white"
                    >
                      Set as Cover
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Pickup Location */}
        <div className="space-y-4 pt-4 border-t border-taupe/20">
          <h2 className="text-lg font-bold font-editorial text-onyx pb-2 border-b border-taupe/20">
            3. Rental Pricing & Pickup Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Your Desired Rental Price (EGP)</label>
              <input
                type="number"
                placeholder="e.g. 1800"
                value={rentalPrice}
                onChange={(e) => setRentalPrice(e.target.value)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx font-bold text-sm focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Estimated Retail Price (EGP)</label>
              <input
                type="number"
                placeholder="e.g. 24000"
                value={replacementValue}
                onChange={(e) => setReplacementValue(e.target.value)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Pickup City</label>
              <input
                type="text"
                placeholder="e.g. Cairo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-onyx block">Pickup Area / Neighborhood</label>
              <input
                type="text"
                placeholder="e.g. Zamalek, Maadi, 5th Settlement"
                value={pickupArea}
                onChange={(e) => setPickupArea(e.target.value)}
                className="w-full p-3 bg-ivory border border-taupe/40 rounded-lg text-onyx focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Transparent Commission Breakdown Box */}
          <div className="p-4 rounded-luxury bg-ivory border border-taupe/30 space-y-2 text-xs">
            <span className="font-bold text-onyx uppercase tracking-wider block">
              Transparent Payout Estimation
            </span>
            <div className="flex justify-between text-onyx/70">
              <span>Renter Rental Price:</span>
              <span className="font-bold text-onyx">EGP {numRental.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-onyx/70">
              <span>Platform Service Commission (20%):</span>
              <span className="text-taupe">- EGP {platformFee.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-taupe/20 flex justify-between font-bold text-sm text-sage">
              <span>Your Estimated Payout Per Rental:</span>
              <span>EGP {ownerPayout.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-luxury flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Submitting for Review...' : 'Publish Dress for Free (Submit for Review)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

