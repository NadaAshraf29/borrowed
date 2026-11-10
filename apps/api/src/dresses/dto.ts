import { DressCondition, DressStatus } from '@prisma/client';

export interface CreateDressDto {
  title: string;
  description: string;
  brand: string;
  categorySlug: string;
  occasions: string[];
  size: string;
  color: string;
  material?: string;
  condition: DressCondition;
  rentalPrice: number;
  replacementValue?: number;
  city: string;
  pickupArea: string;
  images: { url: string; isCover: boolean; displayOrder: number }[];
}

export interface UpdateDressDto extends Partial<CreateDressDto> {
  status?: DressStatus;
}

export interface ModerateDressDto {
  status: DressStatus; // APPROVED or REJECTED
  reason?: string;
  notes?: string;
}

export interface FilterDressesQuery {
  category?: string;
  occasion?: string;
  city?: string;
  size?: string;
  color?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}

