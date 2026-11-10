import { create } from 'zustand';

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (dressId: string) => void;
  isFavorite: (dressId: string) => boolean;
  initFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: [],

  initFavorites: () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('borrowed_favorites');
      if (stored) {
        set({ favoriteIds: JSON.parse(stored) });
      }
    } catch {}
  },

  toggleFavorite: (dressId: string) => {
    const current = get().favoriteIds;
    const exists = current.includes(dressId);
    const updated = exists ? current.filter((id) => id !== dressId) : [...current, dressId];
    set({ favoriteIds: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('borrowed_favorites', JSON.stringify(updated));
    }
  },

  isFavorite: (dressId: string) => {
    return get().favoriteIds.includes(dressId);
  },
}));

