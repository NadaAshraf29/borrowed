'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { DressDto } from '@borrowed/types';
import { fetchApi } from '@/lib/api';
import { DressCard } from '@/components/dresses/DressCard';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  ChevronDown,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

function DressesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [dresses, setDresses] = useState<DressDto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const categoryParam = searchParams.get('category') || '';
  const occasionParam = searchParams.get('occasion') || '';
  const cityParam = searchParams.get('city') || '';
  const sizeParam = searchParams.get('size') || '';
  const brandParam = searchParams.get('brand') || '';
  const colorParam = searchParams.get('color') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const searchInput = searchParams.get('search') || '';

  const [localSearch, setLocalSearch] = useState(searchInput);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const categories = [
    { label: 'All Categories', slug: '' },
    { label: 'Evening Gowns', slug: 'evening-gowns' },
    { label: 'Cocktail & Party', slug: 'cocktail-party' },
    { label: 'Bridal & Engagement', slug: 'bridal-engagement' },
    { label: 'Galas & Black Tie', slug: 'galas-black-tie' },
    { label: 'Prom & Graduation', slug: 'prom-graduation' },
    { label: 'Resort & Destination', slug: 'resort-destination' },
  ];

  const occasions = [
    'Weddings',
    'Parties',
    'Galas',
    'Graduations',
    'Evening Events',
    'Designer Picks',
  ];

  const cities = [
    'Cairo',
    'Giza',
    'New Cairo & Tagamoa',
    'Sheikh Zayed & 6th October',
    'Alexandria',
    'Mansoura',
    'El Gouna & Hurghada',
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'FR 36', 'FR 38', 'US 4', 'US 6', 'UK 8', 'UK 10'];

  const brands = [
    'Elie Saab',
    'Zuhair Murad',
    'Zimmermann',
    'Solace London',
    'Safiyaa',
    'House of CB',
    'Jacquemus',
    'Cult Gaia',
    'Self-Portrait',
    'Marchesa Notte',
    'Mac Duggal',
    'Needle & Thread',
    'Retrofête',
    'Badgley Mischka',
  ];

  const colors = [
    'Emerald Green',
    'Blush Rose',
    'Onyx Black',
    'Champagne Gold',
    'Ivory White',
    'Lavender Mauve',
    'Terracotta Coral',
    'Bordeaux Wine',
    'Sapphire Blue',
    'Silver Dove',
  ];

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    // Reset page to 1 on filter changes unless changing page directly
    if (!newParams.page) {
      params.set('page', '1');
    }
    startTransition(() => {
      router.push(`/dresses?${params.toString()}`);
    });
  };

  useEffect(() => {
    setLoading(true);
    const query = searchParams.toString();
    fetchApi<{ items: DressDto[]; total: number; totalPages: number }>(`/dresses?${query}`)
      .then((data) => {
        setDresses(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {
        setDresses([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const activeFilterCount = [
    categoryParam,
    occasionParam,
    cityParam,
    sizeParam,
    brandParam,
    colorParam,
    searchParams.get('minPrice'),
    searchParams.get('maxPrice'),
    searchInput,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setLocalSearch('');
    setMinPrice('');
    setMaxPrice('');
    startTransition(() => {
      router.push('/dresses');
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-2 mb-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-onyx/50 font-semibold">
          <span>Home</span>
          <span>/</span>
          <span className="text-onyx">The Rental Closet</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-onyx font-editorial">
              Designer Rental Collection
            </h1>
            <p className="text-xs text-onyx/70 mt-1">
              Showing {total} authenticated dresses available for your special occasion.
            </p>
          </div>

          {/* Search and Sort Toolbar */}
          <div className="flex items-center gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateFilters({ search: localSearch.trim() });
              }}
              className="relative w-48 sm:w-64"
            >
              <input
                type="text"
                placeholder="Search designer, color..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-taupe/40 rounded-lg text-onyx placeholder:text-onyx/40 focus:outline-none focus:border-onyx transition-all"
              />
              <Search className="w-3.5 h-3.5 text-onyx/50 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="relative">
              <select
                value={sortParam}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="appearance-none pl-3 pr-8 py-2 text-xs bg-white border border-taupe/40 rounded-lg text-onyx font-medium focus:outline-none focus:border-onyx cursor-pointer"
              >
                <option value="newest">Newest Additions</option>
                <option value="price_asc">Rental: Low to High</option>
                <option value="price_desc">Rental: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-onyx/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-onyx text-ivory text-xs font-semibold rounded-lg"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-mauve text-white rounded-full text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white/70 rounded-lg border border-taupe/20">
          <span className="text-xs font-semibold uppercase tracking-wider text-onyx/60 mr-1">
            Active Filters ({activeFilterCount}):
          </span>

          {categoryParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-ivory border border-taupe text-xs rounded-full">
              Category: {categoryParam}
              <button onClick={() => updateFilters({ category: null })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {occasionParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-ivory border border-taupe text-xs rounded-full">
              Occasion: {occasionParam}
              <button onClick={() => updateFilters({ occasion: null })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {cityParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-ivory border border-taupe text-xs rounded-full">
              City: {cityParam}
              <button onClick={() => updateFilters({ city: null })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {brandParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-ivory border border-taupe text-xs rounded-full">
              Brand: {brandParam}
              <button onClick={() => updateFilters({ brand: null })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {sizeParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-ivory border border-taupe text-xs rounded-full">
              Size: {sizeParam}
              <button onClick={() => updateFilters({ size: null })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {colorParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-ivory border border-taupe text-xs rounded-full">
              Color: {colorParam}
              <button onClick={() => updateFilters({ color: null })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-rose-600 hover:underline font-semibold ml-auto"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-luxury border border-taupe/30 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-taupe/20">
            <h3 className="text-xs font-bold uppercase tracking-widest text-onyx flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-mauve-dark" />
              Refine Search
            </h3>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="text-[11px] text-rose-600 hover:underline">
                Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-onyx/70 block">
              Category
            </span>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => updateFilters({ category: cat.slug || null })}
                  className={`block w-full text-left text-xs py-1 transition-colors ${
                    categoryParam === cat.slug
                      ? 'font-bold text-onyx'
                      : 'text-onyx/70 hover:text-onyx'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion */}
          <div className="space-y-2 pt-4 border-t border-taupe/20">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-onyx/70 block">
              Occasion
            </span>
            <div className="flex flex-wrap gap-1.5">
              {occasions.map((occ) => {
                const active = occasionParam === occ;
                return (
                  <button
                    key={occ}
                    onClick={() => updateFilters({ occasion: active ? null : occ })}
                    className={`px-2.5 py-1 text-[11px] rounded-full border transition-all ${
                      active
                        ? 'bg-onyx text-ivory border-onyx'
                        : 'bg-ivory border-taupe/40 text-onyx hover:border-taupe'
                    }`}
                  >
                    {occ}
                  </button>
                );
              })}
            </div>
          </div>

          {/* City / Location */}
          <div className="space-y-2 pt-4 border-t border-taupe/20">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-onyx/70 block">
              Pickup & Delivery City
            </span>
            <div className="space-y-1">
              {cities.map((city) => {
                const active = cityParam === city;
                return (
                  <button
                    key={city}
                    onClick={() => updateFilters({ city: active ? null : city })}
                    className={`block w-full text-left text-xs py-1 transition-colors ${
                      active ? 'font-bold text-onyx' : 'text-onyx/70 hover:text-onyx'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2 pt-4 border-t border-taupe/20">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-onyx/70 block">
              Size
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((s) => {
                const active = sizeParam === s;
                return (
                  <button
                    key={s}
                    onClick={() => updateFilters({ size: active ? null : s })}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all ${
                      active
                        ? 'bg-onyx text-ivory border-onyx'
                        : 'bg-ivory border-taupe/40 text-onyx hover:border-taupe'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-2 pt-4 border-t border-taupe/20">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-onyx/70 block">
              Designer Brand
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {brands.map((b) => {
                const active = brandParam === b;
                return (
                  <button
                    key={b}
                    onClick={() => updateFilters({ brand: active ? null : b })}
                    className={`block w-full text-left text-xs py-0.5 truncate transition-colors ${
                      active ? 'font-bold text-onyx' : 'text-onyx/70 hover:text-onyx'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-4 border-t border-taupe/20">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-onyx/70 block">
              Rental Price Range (EGP)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 p-2 text-xs bg-ivory border border-taupe/40 rounded text-onyx focus:outline-none"
              />
              <span className="text-onyx/40">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 p-2 text-xs bg-ivory border border-taupe/40 rounded text-onyx focus:outline-none"
              />
            </div>
            <button
              onClick={() => updateFilters({ minPrice: minPrice || null, maxPrice: maxPrice || null })}
              className="w-full mt-2 py-1.5 bg-onyx text-ivory text-xs font-semibold rounded hover:bg-darkbrown transition-colors"
            >
              Apply Price
            </button>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-fashion bg-white/70 animate-pulse rounded-luxury" />
              ))}
            </div>
          ) : dresses.length === 0 ? (
            <div className="bg-white rounded-luxury p-12 text-center border border-taupe/30 space-y-4">
              <div className="w-14 h-14 rounded-full bg-ivory mx-auto flex items-center justify-center text-onyx">
                <Search className="w-6 h-6 text-taupe-dark" />
              </div>
              <h3 className="text-lg font-bold text-onyx font-editorial">No Dresses Match Your Filters</h3>
              <p className="text-xs text-onyx/60 max-w-sm mx-auto">
                Try widening your price range, clearing specific filters, or searching for other designer keywords.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-onyx text-ivory text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-darkbrown transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dresses.map((dress) => (
                  <DressCard key={dress.id} dress={dress} />
                ))}
              </div>

              {/* Server-Side Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t border-taupe/20">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === pageParam;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateFilters({ page: pageNum.toString() })}
                        className={`w-9 h-9 text-xs font-semibold rounded-lg transition-all ${
                          isActive
                            ? 'bg-onyx text-ivory font-bold'
                            : 'bg-white border border-taupe/30 text-onyx hover:border-taupe'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DressesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-onyx/60">
          Loading closet collection...
        </div>
      }
    >
      <DressesContent />
    </Suspense>
  );
}
