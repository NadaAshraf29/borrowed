'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useBagStore } from '@/lib/bag-store';
import { useFavoritesStore } from '@/lib/favorites-store';
import { DemoAccountSwitcher } from '../common/DemoAccountSwitcher';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  Shield,
  Truck,
  PlusCircle,
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { items } = useBagStore();
  const { favoriteIds } = useFavoritesStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Rent Dresses', href: '/dresses' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'List Your Dress', href: '/list-dress', badge: 'Free' },
    { label: 'My Rentals', href: '/rentals' },
  ];

  const totalBagItems = items.length;
  const totalFavorites = favoriteIds.length;

  const isAdmin = user?.roles.includes('ADMIN' as any);
  const isOwner = user?.roles.includes('OWNER' as any) || isAdmin;
  const isDelivery = user?.roles.includes('DELIVERY' as any) || isAdmin;

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-taupe/20 transition-all">
      {/* Top Luxury Announcement Bar */}
      <div className="bg-onyx text-ivory text-[11px] py-1.5 px-4 text-center tracking-widest uppercase font-medium flex items-center justify-between">
        <div className="hidden md:block text-taupe text-[10px]">
          FASHION RENTAL CLUB • CAIRO & GIZA
        </div>
        <div className="mx-auto flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-taupe inline" />
          <span>Complimentary 3-Day Early Delivery for Fitting & Accessories</span>
          <span className="hidden sm:inline text-taupe">• List Your Dresses For Free</span>
        </div>
        <div className="hidden md:block">
          <DemoAccountSwitcher />
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-onyx hover:text-darkbrown"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo & Editorial Typography */}
          <div className="flex-1 md:flex-none flex items-center justify-center md:justify-start">
            <Link href="/" className="group text-center md:text-left flex flex-col">
              <span className="font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight text-onyx group-hover:text-darkbrown transition-colors">
                BORROWED<span className="text-mauve font-serif">.</span>
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase font-semibold text-onyx/60 -mt-1 group-hover:text-onyx transition-colors">
                Fashion Rental Club
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs uppercase tracking-widest font-medium transition-all relative py-1 ${
                    isActive
                      ? 'text-onyx font-bold'
                      : 'text-onyx/75 hover:text-onyx'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-mauve/20 text-mauve-dark font-semibold rounded-full border border-mauve/30">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-onyx animate-in fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <Link
              href="/dresses"
              className="p-2 text-onyx hover:text-darkbrown transition-colors"
              title="Search Collection"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/favorites"
              className="p-2 text-onyx hover:text-darkbrown transition-colors relative"
              title="Saved Dresses"
            >
              <Heart className="w-5 h-5" />
              {totalFavorites > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-mauve text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalFavorites}
                </span>
              )}
            </Link>

            {/* Rental Bag */}
            <Link
              href="/bag"
              className="p-2 text-onyx hover:text-darkbrown transition-colors relative group"
              title="Rental Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-105" />
                {totalBagItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-onyx text-ivory text-[10px] font-bold rounded-full flex items-center justify-center border border-ivory">
                    {totalBagItems}
                  </span>
                )}
              </div>
            </Link>

            {/* User Account / Role Portals */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-1.5 text-xs font-medium text-onyx rounded-full hover:bg-taupe/20 transition-all border border-taupe/30"
                  >
                    <div className="w-6 h-6 rounded-full bg-onyx text-ivory flex items-center justify-center text-[10px] font-bold">
                      {user.firstName[0]}
                    </div>
                    <span className="hidden lg:inline pr-1 text-xs">
                      {user.firstName}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-ivory-light border border-taupe/40 rounded-luxury shadow-luxury py-2 z-50">
                      <div className="px-4 py-2 border-b border-taupe/20">
                        <p className="text-xs font-bold text-onyx">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[10px] text-onyx/60 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/rentals"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-onyx hover:bg-taupe/15"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          My Rentals
                        </Link>
                        <Link
                          href="/favorites"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-onyx hover:bg-taupe/15"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          Saved Wishlist
                        </Link>

                        {isOwner && (
                          <Link
                            href="/owner"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-onyx font-semibold hover:bg-taupe/15"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-darkbrown" />
                            Owner Portal
                          </Link>
                        )}

                        {isDelivery && (
                          <Link
                            href="/delivery"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-onyx font-semibold hover:bg-taupe/15"
                          >
                            <Truck className="w-3.5 h-3.5 text-sage" />
                            Courier Dispatch
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-onyx font-semibold hover:bg-taupe/15 border-t border-taupe/15"
                          >
                            <Shield className="w-3.5 h-3.5 text-rose-700" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-taupe/20">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-onyx text-ivory rounded-full hover:bg-darkbrown transition-all shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile demo account toggle */}
            <div className="md:hidden">
              <DemoAccountSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-taupe/20 bg-ivory px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm uppercase tracking-wider font-medium text-onyx hover:text-darkbrown"
            >
              {link.label}
              {link.badge && (
                <span className="ml-2 px-2 py-0.5 text-[10px] bg-mauve/20 text-mauve-dark font-semibold rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="pt-2 border-t border-taupe/20 flex flex-col gap-2">
            <Link
              href="/list-dress"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 bg-onyx text-ivory rounded-lg text-xs uppercase tracking-wider font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              List Your Dress (Free)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

