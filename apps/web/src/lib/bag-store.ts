import { create } from 'zustand';
import { DressDto } from '@borrowed/types';
import { fetchApi } from './api';

export interface BagItem {
  dress: DressDto;
  occasionDate: string; // ISO string
  scheduledDeliveryDate: string; // ISO string
  scheduledReturnDate: string; // ISO string
  deliveryCity: string;
  deliveryFee: number;
  depositFee: number;
  rentalPrice: number;
  totalAmount: number;
  isAvailable: boolean;
  conflictReason?: string;
}

interface BagState {
  items: BagItem[];
  addItem: (dress: DressDto, occasionDateStr: string, deliveryCityName?: string) => Promise<BagItem>;
  removeItem: (dressId: string) => void;
  updateDate: (dressId: string, occasionDateStr: string) => Promise<void>;
  updateCity: (dressId: string, cityName: string) => Promise<void>;
  clearBag: () => void;
  getTotal: () => number;
  initBag: () => void;
}

export const useBagStore = create<BagState>((set, get) => ({
  items: [],

  initBag: () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('borrowed_bag');
      if (stored) {
        set({ items: JSON.parse(stored) });
      }
    } catch {}
  },

  addItem: async (dress: DressDto, occasionDateStr: string, deliveryCityName = 'Cairo') => {
    const calc = await fetchApi('/rentals/calculate', {
      method: 'POST',
      body: JSON.stringify({
        dressId: dress.id,
        occasionDate: occasionDateStr,
        deliveryCityName,
      }),
    });

    const newItem: BagItem = {
      dress,
      occasionDate: calc.occasionDate,
      scheduledDeliveryDate: calc.scheduledDeliveryDate,
      scheduledReturnDate: calc.scheduledReturnDate,
      deliveryCity: deliveryCityName,
      deliveryFee: calc.deliveryFee,
      depositFee: calc.depositFee,
      rentalPrice: calc.rentalPrice,
      totalAmount: calc.totalAmount,
      isAvailable: calc.isAvailable,
      conflictReason: calc.conflictReason,
    };

    // Filter out existing if re-adding same dress
    const current = get().items.filter((i) => i.dress.id !== dress.id);
    const updated = [...current, newItem];
    set({ items: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('borrowed_bag', JSON.stringify(updated));
    }
    return newItem;
  },

  removeItem: (dressId: string) => {
    const updated = get().items.filter((i) => i.dress.id !== dressId);
    set({ items: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('borrowed_bag', JSON.stringify(updated));
    }
  },

  updateDate: async (dressId: string, occasionDateStr: string) => {
    const item = get().items.find((i) => i.dress.id === dressId);
    if (!item) return;

    const calc = await fetchApi('/rentals/calculate', {
      method: 'POST',
      body: JSON.stringify({
        dressId,
        occasionDate: occasionDateStr,
        deliveryCityName: item.deliveryCity,
      }),
    });

    const updated = get().items.map((i) =>
      i.dress.id === dressId
        ? {
            ...i,
            occasionDate: calc.occasionDate,
            scheduledDeliveryDate: calc.scheduledDeliveryDate,
            scheduledReturnDate: calc.scheduledReturnDate,
            deliveryFee: calc.deliveryFee,
            totalAmount: calc.totalAmount,
            isAvailable: calc.isAvailable,
            conflictReason: calc.conflictReason,
          }
        : i,
    );
    set({ items: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('borrowed_bag', JSON.stringify(updated));
    }
  },

  updateCity: async (dressId: string, cityName: string) => {
    const item = get().items.find((i) => i.dress.id === dressId);
    if (!item) return;

    const calc = await fetchApi('/rentals/calculate', {
      method: 'POST',
      body: JSON.stringify({
        dressId,
        occasionDate: item.occasionDate,
        deliveryCityName: cityName,
      }),
    });

    const updated = get().items.map((i) =>
      i.dress.id === dressId
        ? {
            ...i,
            deliveryCity: cityName,
            deliveryFee: calc.deliveryFee,
            totalAmount: calc.totalAmount,
          }
        : i,
    );
    set({ items: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('borrowed_bag', JSON.stringify(updated));
    }
  },

  clearBag: () => {
    set({ items: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('borrowed_bag');
    }
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.totalAmount, 0);
  },
}));

