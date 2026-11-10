'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DressDto } from '@borrowed/types';
import { fetchApi } from '@/lib/api';
import { DressCard } from '@/components/dresses/DressCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Truck,
  RotateCcw,
  CheckCircle2,
  Star,
  PlusCircle,
  Tag,
} from 'lucide-react';

export default function HomePage() {
  const [featuredDresses, setFeaturedDresses] = useState<DressDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<DressDto[]>('/dresses/featured')
      .then((data) => setFeaturedDresses(data || []))
      .catch(() => setFeaturedDresses([]))
      .finally(() => setLoading(false));
  }, []);

  const occasions = [
    {
      title: 'Weddings',
      tag: 'Weddings',
      subtitle: 'Black-tie guest & bridal looks',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Galas & Black Tie',
      tag: 'Galas',
      subtitle: 'Floor-sweeping couture',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Cocktail & Parties',
      tag: 'Parties',
      subtitle: 'Chic silhouettes & sequins',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Graduations',
      tag: 'Graduations',
      subtitle: 'Memorable milestone dresses',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Evening Events',
      tag: 'Evening Events',
      subtitle: 'Draped silk & dramatic velvet',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Designer Picks',
      tag: 'Designer Picks',
      subtitle: 'Curated luxury fashion houses',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center bg-ivory overflow-hidden border-b border-taupe/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-taupe/20 border border-taupe/40 rounded-full text-xs font-semibold tracking-widest uppercase text-onyx">
                <Sparkles className="w-3.5 h-3.5 text-mauve" />
                <span>Exclusive Peer-to-Peer Fashion Club</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-onyx leading-[1.12]">
                Designer Dresses for Every Occasion,{' '}
                <span className="italic font-editorial font-normal text-darkbrown block sm:inline">
                  Without the Ownership.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-onyx/75 max-w-xl font-normal leading-relaxed">
                Rent runway-worthy dresses for a fraction of the price. Delivered 3 days before your
                event so you never worry about fitting.
              </p>

              <p className="text-sm tracking-widest uppercase font-semibold text-darkbrown font-editorial">
                Wear it. Love it. Return it.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/dresses"
                  className="px-8 py-4 bg-onyx text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-darkbrown transition-all shadow-luxury flex items-center gap-2 group"
                >
                  <span>Browse Dresses</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/how-it-works"
                  className="px-8 py-4 bg-white/80 border border-taupe text-onyx text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-white transition-all shadow-sm"
                >
                  How It Works
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-taupe/30 max-w-lg">
                <div>
                  <p className="text-2xl font-bold font-editorial text-onyx">3 Days</p>
                  <p className="text-[11px] text-onyx/60 font-medium">Early Delivery Window</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-editorial text-onyx">100%</p>
                  <p className="text-[11px] text-onyx/60 font-medium">Free To List Dresses</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-editorial text-onyx">Cairo & Giza</p>
                  <p className="text-[11px] text-onyx/60 font-medium">Doorstep Fleet Service</p>
                </div>
              </div>
            </div>

            {/* Right Editorial Imagery */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md aspect-[3/4] rounded-luxury-lg overflow-hidden shadow-2xl border-4 border-white/60">
                <Image
                  src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85"
                  alt="Solace London High-Fashion Rental Dress"
                  fill
                  priority
                  className="object-cover object-top"
                />

                {/* Floating Fashion Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-md rounded-luxury border border-taupe/30 shadow-luxury flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-mauve-dark font-bold block">
                      Trending Occasion Pick
                    </span>
                    <p className="text-sm font-semibold text-onyx">Solace London Silk Gown</p>
                    <p className="text-xs text-onyx/60 font-medium">Rent for EGP 2,200 (Retail EGP 28,000)</p>
                  </div>
                  <Link
                    href="/dresses"
                    className="p-2.5 bg-onyx text-ivory rounded-full hover:bg-darkbrown transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-mauve-dark block">
            Why Rent With BORROWED.
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-onyx font-editorial">
            The New Way to Dress Up
          </h2>
          <p className="text-sm text-onyx/70">
            A seamless, stress-free wardrobe solution designed for weddings, galas, and life’s finest nights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-luxury border border-taupe/30 hover:border-taupe transition-all space-y-3">
            <div className="w-12 h-12 rounded-full bg-ivory flex items-center justify-center text-onyx">
              <Sparkles className="w-6 h-6 text-mauve" />
            </div>
            <h3 className="text-base font-bold text-onyx font-sans">Rent Designer Dresses</h3>
            <p className="text-xs text-onyx/70 leading-relaxed">
              Access curated high-fashion runways from Zuhair Murad, Elie Saab, and Zimmermann at 10% of their purchase price.
            </p>
          </div>

          <div className="bg-white p-6 rounded-luxury border border-taupe/30 hover:border-taupe transition-all space-y-3">
            <div className="w-12 h-12 rounded-full bg-ivory flex items-center justify-center text-onyx">
              <Calendar className="w-6 h-6 text-sage" />
            </div>
            <h3 className="text-base font-bold text-onyx font-sans">3-Day Prior Delivery</h3>
            <p className="text-xs text-onyx/70 leading-relaxed">
              We deliver three full days before your event date so you can try on the garment, plan jewelry, and style your shoes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-luxury border border-taupe/30 hover:border-taupe transition-all space-y-3">
            <div className="w-12 h-12 rounded-full bg-ivory flex items-center justify-center text-onyx">
              <RotateCcw className="w-6 h-6 text-darkbrown" />
            </div>
            <h3 className="text-base font-bold text-onyx font-sans">Doorstep Return Pickup</h3>
            <p className="text-xs text-onyx/70 leading-relaxed">
              No trips to the post office. Our dedicated platform courier comes directly to your home the day after your occasion.
            </p>
          </div>

          <div className="bg-white p-6 rounded-luxury border border-taupe/30 hover:border-taupe transition-all space-y-3">
            <div className="w-12 h-12 rounded-full bg-ivory flex items-center justify-center text-onyx">
              <Tag className="w-6 h-6 text-mauve-dark" />
            </div>
            <h3 className="text-base font-bold text-onyx font-sans">Free Owner Listings</h3>
            <p className="text-xs text-onyx/70 leading-relaxed">
              Turn the luxury dresses sitting in your closet into recurring income. It costs zero to list, and we coordinate all logistics.
            </p>
          </div>
        </div>
      </section>

      {/* 3. BROWSE BY OCCASION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10 pb-4 border-b border-taupe/20">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-mauve-dark block">
              Curated For Life’s Moments
            </span>
            <h2 className="text-3xl font-extrabold text-onyx font-editorial">Browse by Occasion</h2>
          </div>
          <Link
            href="/dresses"
            className="text-xs font-semibold uppercase tracking-wider text-onyx hover:text-darkbrown flex items-center gap-1 group mt-2 sm:mt-0"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {occasions.map((occ) => (
            <Link
              key={occ.title}
              href={`/dresses?occasion=${encodeURIComponent(occ.tag)}`}
              className="group relative aspect-[3/4] rounded-luxury overflow-hidden bg-onyx shadow-sm border border-taupe/20 block"
            >
              <Image
                src={occ.image}
                alt={occ.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/90 via-onyx/20 to-transparent" />
              <div className="absolute bottom-4 left-3 right-3 text-white">
                <p className="text-xs font-bold leading-tight uppercase tracking-wider">{occ.title}</p>
                <p className="text-[10px] text-taupe-light mt-0.5 line-clamp-1">{occ.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. TRENDING RENTALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10 pb-4 border-b border-taupe/20">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-mauve-dark block">
              Editor’s Selection
            </span>
            <h2 className="text-3xl font-extrabold text-onyx font-editorial">Trending Rentals</h2>
          </div>
          <Link
            href="/dresses"
            className="text-xs font-semibold uppercase tracking-wider text-onyx hover:text-darkbrown flex items-center gap-1 group mt-2 sm:mt-0"
          >
            <span>See Entire Closet</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-fashion bg-taupe/20 animate-pulse rounded-luxury" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDresses.slice(0, 8).map((dress, index) => (
              <DressCard key={dress.id} dress={dress} priority={index < 4} />
            ))}
          </div>
        )}
      </section>

      {/* 5. HOW IT WORKS (VISUAL TIMELINE) */}
      <section className="bg-white py-20 border-y border-taupe/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-mauve-dark block">
              The BORROWED. Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-onyx font-editorial">
              How Renting Works
            </h2>
            <p className="text-sm text-onyx/70">
              Designed around your event timeline for zero stress and maximum glamour.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="p-6 rounded-luxury bg-ivory border border-taupe/30 space-y-4">
              <span className="text-3xl font-extrabold font-editorial text-taupe-dark block">01</span>
              <h3 className="text-base font-bold text-onyx">Pick Your Dress & Date</h3>
              <p className="text-xs text-onyx/75 leading-relaxed">
                Select your occasion date on the calendar. Our intelligent system automatically calculates your 3-day delivery window.
              </p>
            </div>

            <div className="p-6 rounded-luxury bg-ivory border border-taupe/30 space-y-4">
              <span className="text-3xl font-extrabold font-editorial text-taupe-dark block">02</span>
              <h3 className="text-base font-bold text-onyx">Arrives 3 Days Early</h3>
              <p className="text-xs text-onyx/75 leading-relaxed">
                Our in-house delivery staff hand-delivers your dress in a premium garment bag 3 calendar days before your event.
              </p>
            </div>

            <div className="p-6 rounded-luxury bg-ivory border border-taupe/30 space-y-4">
              <span className="text-3xl font-extrabold font-editorial text-taupe-dark block">03</span>
              <h3 className="text-base font-bold text-onyx">Shine at Your Occasion</h3>
              <p className="text-xs text-onyx/75 leading-relaxed">
                Enjoy your special night feeling like royalty in authentic designer couture. No dry cleaning necessary.
              </p>
            </div>

            <div className="p-6 rounded-luxury bg-ivory border border-taupe/30 space-y-4">
              <span className="text-3xl font-extrabold font-editorial text-taupe-dark block">04</span>
              <h3 className="text-base font-bold text-onyx">Doorstep Collection</h3>
              <p className="text-xs text-onyx/75 leading-relaxed">
                The day after your occasion, our courier returns to your address to collect the garment and return it to its owner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LIST YOUR DRESS PROMO CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-luxury-lg overflow-hidden bg-onyx text-ivory p-8 sm:p-14 border border-darkbrown shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-taupe-light">
                <PlusCircle className="w-3.5 h-3.5 text-sage" />
                <span>Zero Listing Fees • Earn Every Month</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-editorial">
                Your Dress Deserves Another Moment.
              </h2>

              <p className="text-sm text-taupe-light max-w-xl leading-relaxed">
                Turn the luxury gowns and party dresses you no longer wear into extra income. Listing is
                completely free. You set the price, we handle all doorstep pickups, deliveries, and returns.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/list-dress"
                  className="px-8 py-3.5 bg-mauve text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-mauve-dark transition-all shadow-md"
                >
                  List Your Dress for Free
                </Link>
                <Link
                  href="/how-it-works#owners"
                  className="px-6 py-3.5 bg-white/10 text-ivory text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  Learn About Earnings
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 hidden lg:flex justify-end">
              <div className="p-6 rounded-luxury bg-white/5 border border-white/10 space-y-3 w-full max-w-xs">
                <span className="text-xs uppercase tracking-wider text-taupe font-semibold block">
                  Example Owner Payout
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-taupe-light">
                    <span>Rental Price</span>
                    <span className="text-ivory font-bold">EGP 2,000</span>
                  </div>
                  <div className="flex justify-between text-taupe-light">
                    <span>Platform Commission (20%)</span>
                    <span className="text-taupe">- EGP 400</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-sage-light">
                    <span>Your Net Payout</span>
                    <span>EGP 1,600</span>
                  </div>
                </div>
                <p className="text-[10px] text-taupe mt-2">
                  Transferred via Instapay or Bank Transfer right after your completed rental.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-mauve-dark block">
            Love Letters
          </span>
          <h2 className="text-3xl font-extrabold text-onyx font-editorial">
            What Our Members Are Saying
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-luxury bg-white border border-taupe/30 space-y-3 shadow-sm">
            <div className="flex text-sage">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-onyx/80 leading-relaxed italic">
              “The 3-day early delivery was a total lifesaver! I tried on the Zuhair Murad gown on Wednesday for a Saturday wedding, matched my earrings and shoes without rushing. I will never buy a formal dress again.”
            </p>
            <div className="pt-2 border-t border-taupe/20">
              <p className="text-xs font-bold text-onyx">Yasmin Soliman</p>
              <p className="text-[10px] text-onyx/50">Rented for a Wedding in New Cairo</p>
            </div>
          </div>

          <div className="p-6 rounded-luxury bg-white border border-taupe/30 space-y-3 shadow-sm">
            <div className="flex text-sage">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-onyx/80 leading-relaxed italic">
              “Listing my engagement dress was completely free and took literally 3 minutes. In two months it rented three times and earned me over EGP 7,500. BORROWED.’s couriers handled the pickup and return so I didn’t lift a finger.”
            </p>
            <div className="pt-2 border-t border-taupe/20">
              <p className="text-xs font-bold text-onyx">Sophia El-Khatib</p>
              <p className="text-[10px] text-onyx/50">Dress Owner in Zamalek</p>
            </div>
          </div>

          <div className="p-6 rounded-luxury bg-white border border-taupe/30 space-y-3 shadow-sm">
            <div className="flex text-sage">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-onyx/80 leading-relaxed italic">
              “The dress arrived in immaculate condition inside a branded luxury garment bag. The courier was so polite and on time. Such an elevated, sustainable experience.”
            </p>
            <div className="pt-2 border-t border-taupe/20">
              <p className="text-xs font-bold text-onyx">Mariam Farouk</p>
              <p className="text-[10px] text-onyx/50">Rented for Gouna Film Festival Gala</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

