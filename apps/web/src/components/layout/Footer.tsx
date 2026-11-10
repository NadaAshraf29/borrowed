import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, RefreshCw, Leaf, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-onyx text-ivory pt-16 pb-12 border-t border-darkbrown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Promise Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-14 border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-full bg-white/5 text-taupe-light">
              <Sparkles className="w-5 h-5 text-taupe" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-ivory">
                Runway Couture
              </h4>
              <p className="text-xs text-taupe mt-1 leading-relaxed">
                Authentic luxury dresses from Zuhair Murad, Elie Saab, and Zimmermann for a fraction of retail.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-full bg-white/5 text-taupe-light">
              <ShieldCheck className="w-5 h-5 text-sage" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-ivory">
                3-Day Pre-Event Delivery
              </h4>
              <p className="text-xs text-taupe mt-1 leading-relaxed">
                Arrives 3 calendar days before your occasion so you can style shoes and accessories stress-free.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-full bg-white/5 text-taupe-light">
              <RefreshCw className="w-5 h-5 text-mauve" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-ivory">
                Doorstep Return Pickup
              </h4>
              <p className="text-xs text-taupe mt-1 leading-relaxed">
                Our platform couriers collect the dress directly from your doorstep the day after your event.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-full bg-white/5 text-taupe-light">
              <Leaf className="w-5 h-5 text-sage-light" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-ivory">
                Circular & Sustainable
              </h4>
              <p className="text-xs text-taupe mt-1 leading-relaxed">
                Reduce fashion waste and earn income by sharing the extraordinary dresses in your wardrobe.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-14">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col">
              <span className="font-editorial text-3xl font-extrabold tracking-tight text-ivory">
                BORROWED<span className="text-mauve font-serif">.</span>
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-taupe">
                Fashion Rental Club
              </span>
            </div>
            <p className="text-xs text-taupe leading-relaxed max-w-sm">
              An exclusive peer-to-peer dress rental club where women list their finest dresses for free,
              and others rent runway-worthy pieces for life’s most cherished celebrations.
            </p>
            <p className="text-xs italic text-mauve-light font-editorial">
              Wear it. Love it. Return it.
            </p>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-ivory">
              Browse Collections
            </h5>
            <ul className="space-y-2 text-xs text-taupe">
              <li>
                <Link href="/dresses?category=evening-gowns" className="hover:text-ivory transition-colors">
                  Evening Gowns
                </Link>
              </li>
              <li>
                <Link href="/dresses?category=cocktail-party" className="hover:text-ivory transition-colors">
                  Cocktail & Party
                </Link>
              </li>
              <li>
                <Link href="/dresses?category=bridal-engagement" className="hover:text-ivory transition-colors">
                  Bridal & Engagement
                </Link>
              </li>
              <li>
                <Link href="/dresses?category=galas-black-tie" className="hover:text-ivory transition-colors">
                  Galas & Black Tie
                </Link>
              </li>
              <li>
                <Link href="/dresses?category=prom-graduation" className="hover:text-ivory transition-colors">
                  Prom & Graduation
                </Link>
              </li>
            </ul>
          </div>

          {/* Dress Owners */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-ivory">
              Dress Owners
            </h5>
            <ul className="space-y-2 text-xs text-taupe">
              <li>
                <Link href="/list-dress" className="hover:text-ivory transition-colors font-medium text-mauve-light">
                  List Your Dress for Free
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#owners" className="hover:text-ivory transition-colors">
                  Owner Earnings & Commission
                </Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-ivory transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#care" className="hover:text-ivory transition-colors">
                  Garment Care & Protection
                </Link>
              </li>
            </ul>
          </div>

          {/* Supported Locations */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-ivory">
              Service Areas
            </h5>
            <ul className="space-y-1.5 text-xs text-taupe">
              <li>Cairo & Zamalek</li>
              <li>New Cairo & 5th Settlement</li>
              <li>Sheikh Zayed & 6th October</li>
              <li>Alexandria (Smouha & Kafr Abdo)</li>
              <li>Mansoura</li>
              <li>El Gouna & Red Sea</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-taupe/80 gap-4">
          <p>© {new Date().getFullYear()} BORROWED. Fashion Rental Club. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/how-it-works" className="hover:text-ivory">
              How Renting Works
            </Link>
            <Link href="/dresses" className="hover:text-ivory">
              Explore Collection
            </Link>
            <Link href="/admin" className="hover:text-ivory">
              Administration
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

