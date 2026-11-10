'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DressDto } from '@borrowed/types';
import { useFavoritesStore } from '@/lib/favorites-store';
import { Heart, MapPin, Sparkles } from 'lucide-react';

interface DressCardProps {
  dress: DressDto;
  priority?: boolean;
}

export function DressCard({ dress, priority = false }: DressCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorited = isFavorite(dress.id);

  const coverUrl =
    dress.coverImage ||
    dress.images?.find((i) => i.isCover)?.url ||
    dress.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group relative flex flex-col bg-white rounded-luxury overflow-hidden border border-taupe/30 hover:border-taupe hover:shadow-luxury-hover transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-fashion w-full overflow-hidden bg-ivory-dark">
        <Link href={`/dresses/${dress.id}`} className="block w-full h-full">
          <Image
            src={coverUrl}
            alt={dress.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(dress.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            favorited
              ? 'bg-mauve text-white'
              : 'bg-white/80 hover:bg-white text-onyx/80 hover:text-rose-600'
          }`}
          aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Size Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-onyx/85 backdrop-blur-sm text-ivory text-[10px] uppercase tracking-wider font-semibold rounded-full border border-white/10">
          {dress.size}
        </div>

        {/* City Indicator */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-onyx text-[10px] font-medium rounded-full flex items-center gap-1 shadow-xs">
          <MapPin className="w-3 h-3 text-darkbrown" />
          <span>{dress.city}</span>
        </div>
      </div>

      {/* Dress Information */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-onyx/60 font-semibold mb-1">
            <span>{dress.brand}</span>
            {dress.averageRating > 0 && (
              <span className="flex items-center gap-1 text-onyx">
                <Sparkles className="w-3 h-3 text-sage fill-sage" />
                {dress.averageRating.toFixed(1)}
              </span>
            )}
          </div>

          <Link href={`/dresses/${dress.id}`} className="block">
            <h3 className="text-sm font-medium text-onyx line-clamp-1 group-hover:text-darkbrown transition-colors">
              {dress.title}
            </h3>
          </Link>
        </div>

        <div className="mt-3 pt-3 border-t border-taupe/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-onyx/50 block">Rental Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-onyx font-sans">
                EGP {dress.rentalPrice.toLocaleString()}
              </span>
              <span className="text-[10px] text-onyx/60 font-medium">/ 4 days</span>
            </div>
          </div>

          <Link
            href={`/dresses/${dress.id}`}
            className="px-3 py-1.5 bg-onyx text-ivory text-xs font-semibold rounded-lg hover:bg-darkbrown transition-colors"
          >
            Rent Dress
          </Link>
        </div>
      </div>
    </div>
  );
}

