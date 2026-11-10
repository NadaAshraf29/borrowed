'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFavoritesStore } from '@/lib/favorites-store';
import { fetchApi } from '@/lib/api';
import { DressDto } from '@borrowed/types';
import { DressCard } from '@/components/dresses/DressCard';
import { Heart, ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
  const { favoriteIds } = useFavoritesStore();
  const [dresses, setDresses] = useState<DressDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favoriteIds.length === 0) {
      setDresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchApi<{ items: DressDto[] }>('/dresses?limit=50')
      .then((data) => {
        const matching = (data.items || []).filter((d) => favoriteIds.includes(d.id));
        setDresses(matching);
      })
      .catch(() => setDresses([]))
      .finally(() => setLoading(false));
  }, [favoriteIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-taupe/20 pb-4">
        <h1 className="text-3xl font-extrabold text-onyx font-editorial">Saved Dresses</h1>
        <p className="text-xs text-onyx/60 mt-1">
          Your personal wishlist of designer pieces saved for upcoming celebrations.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-fashion bg-white/70 animate-pulse rounded-luxury" />
          ))}
        </div>
      ) : dresses.length === 0 ? (
        <div className="bg-white p-16 rounded-luxury text-center border border-taupe/30 space-y-4">
          <div className="w-16 h-16 rounded-full bg-ivory mx-auto flex items-center justify-center text-onyx">
            <Heart className="w-8 h-8 text-taupe" />
          </div>
          <h2 className="text-xl font-bold font-editorial text-onyx">Your Wishlist is Empty</h2>
          <p className="text-xs text-onyx/60 max-w-sm mx-auto">
            Click the heart icon on any dress in the collection to save it here for later.
          </p>
          <Link
            href="/dresses"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-md"
          >
            <span>Explore Dresses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dresses.map((dress) => (
            <DressCard key={dress.id} dress={dress} />
          ))}
        </div>
      )}
    </div>
  );
}

