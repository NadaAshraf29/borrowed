'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Truck,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Tag,
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';

export default function HowItWorksPage() {
  const renterSteps = [
    {
      num: '01',
      title: 'Explore & Select Your Event Date',
      desc: 'Browse hundreds of designer gowns and cocktail dresses. Choose the date of your wedding, gala, or celebration on our real-time availability calendar.',
    },
    {
      num: '02',
      title: 'Complimentary 3-Day Early Delivery',
      desc: 'Unlike traditional rental services that ship at the last minute, BORROWED. hand-delivers your dress 3 full days prior to your event so you can match shoes, jewelry, and makeup calmly.',
    },
    {
      num: '03',
      title: 'Wear and Savor Your Occasion',
      desc: 'Step out in runway-worthy couture with total confidence. Enjoy endless compliments knowing you made the stylish, sustainable choice.',
    },
    {
      num: '04',
      title: 'Doorstep Return Collection',
      desc: 'The day after your event, simply place the garment back in the BORROWED. luxury garment bag. Our platform courier picks it up directly from your doorstep. No dry cleaning needed!',
    },
  ];

  const ownerSteps = [
    {
      num: '01',
      title: 'List Your Dress 100% Free',
      desc: 'Upload clear photos, set your own rental price, and specify your size and city. There are zero listing fees or hidden charges.',
    },
    {
      num: '02',
      title: 'Admin Curation & Approval',
      desc: 'Our moderation team verifies the dress condition and photos to maintain platform editorial standards before publishing it to the closet.',
    },
    {
      num: '03',
      title: 'We Handle All Doorstep Logistics',
      desc: 'When rented, our dedicated platform driver collects the dress from your doorstep, delivers it to the renter, and returns it safely to your home after the event.',
    },
    {
      num: '04',
      title: 'Collect Direct Payouts',
      desc: 'Receive your net earnings (80% of rental price) directly to your bank account or Instapay without having to chase anyone.',
    },
  ];

  const faqs = [
    {
      q: 'Why does BORROWED. deliver 3 days before the occasion?',
      a: 'We understand that attending a major wedding or gala requires planning. Delivering 3 days early ensures you can try on the gown, coordinate your heels and accessories, and have complete peace of mind before the event day.',
    },
    {
      q: 'Do I need to dry clean the dress before returning it?',
      a: 'Never! Standard garment cleaning and steaming are included in the platform fee. Our courier will collect the dress in its original dustbag.',
    },
    {
      q: 'How does the platform commission work for dress owners?',
      a: 'Listing is completely free. When a dress is successfully rented, BORROWED. retains a 20% platform commission to cover our dedicated courier fleet, quality assurance, customer care, and logistics. You receive the remaining 80%.',
    },
    {
      q: 'What if a dress does not fit upon delivery?',
      a: 'Because your dress arrives 3 days early, our concierge team can assist you with an exchange or immediate credit if notified within 24 hours of delivery.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-taupe/20 border border-taupe/40 rounded-full text-xs font-semibold tracking-widest uppercase text-onyx">
          <Sparkles className="w-3.5 h-3.5 text-mauve" />
          <span>The Modern Way to Wear Designer Couture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-onyx font-editorial">
          How BORROWED. Works
        </h1>
        <p className="text-sm sm:text-base text-onyx/75 leading-relaxed">
          Connecting women who own extraordinary dresses with women who have extraordinary nights to attend.
        </p>
      </div>

      {/* RENTER JOURNEY */}
      <section className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-4 border-b border-taupe/20">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-mauve-dark block">
              For Renters
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-onyx">
              Your 4-Step Rental Experience
            </h2>
          </div>
          <Link
            href="/dresses"
            className="text-xs font-semibold uppercase tracking-wider text-onyx hover:text-darkbrown flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>Browse Available Dresses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {renterSteps.map((step) => (
            <div key={step.num} className="bg-white p-6 rounded-luxury border border-taupe/30 shadow-sm space-y-3">
              <span className="text-3xl font-extrabold font-editorial text-taupe block">
                {step.num}
              </span>
              <h3 className="text-base font-bold text-onyx">{step.title}</h3>
              <p className="text-xs text-onyx/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OWNER JOURNEY */}
      <section id="owners" className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-4 border-b border-taupe/20">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-sage block">
              For Dress Owners
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-onyx">
              Monetize Your Closet for Free
            </h2>
          </div>
          <Link
            href="/list-dress"
            className="text-xs font-semibold uppercase tracking-wider text-onyx hover:text-darkbrown flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>List A Dress Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {ownerSteps.map((step) => (
            <div key={step.num} className="bg-white p-6 rounded-luxury border border-taupe/30 shadow-sm space-y-3">
              <span className="text-3xl font-extrabold font-editorial text-sage block">
                {step.num}
              </span>
              <h3 className="text-base font-bold text-onyx">{step.title}</h3>
              <p className="text-xs text-onyx/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="bg-white p-8 sm:p-14 rounded-luxury-lg border border-taupe/30 shadow-luxury space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-mauve-dark block">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-onyx">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {faqs.map((f, i) => (
            <div key={i} className="space-y-2">
              <h3 className="text-sm font-bold text-onyx flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-taupe-dark flex-shrink-0 mt-0.5" />
                <span>{f.q}</span>
              </h3>
              <p className="text-xs text-onyx/75 leading-relaxed pl-6">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

