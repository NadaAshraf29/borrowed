export enum UserRole {
  GUEST = 'GUEST',
  RENTER = 'RENTER',
  OWNER = 'OWNER',
  DELIVERY = 'DELIVERY',
  ADMIN = 'ADMIN',
}

export type RoleType = UserRole;
export const RoleType = UserRole;

export enum DressCondition {
  BRAND_NEW = 'BRAND_NEW',
  LIKE_NEW = 'LIKE_NEW',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
}

export enum DressStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  UNAVAILABLE = 'UNAVAILABLE',
  ARCHIVED = 'ARCHIVED',
}

export enum RentalStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  COLLECTED_FROM_OWNER = 'COLLECTED_FROM_OWNER',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  RETURN_SCHEDULED = 'RETURN_SCHEDULED',
  OUT_FOR_COLLECTION = 'OUT_FOR_COLLECTION',
  COLLECTED_FROM_RENTER = 'COLLECTED_FROM_RENTER',
  RETURNING_TO_OWNER = 'RETURNING_TO_OWNER',
  RETURNED_TO_OWNER = 'RETURNED_TO_OWNER',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum DeliveryTaskStage {
  PICKUP_FROM_OWNER = 'PICKUP_FROM_OWNER',
  DELIVER_TO_RENTER = 'DELIVER_TO_RENTER',
  COLLECT_FROM_RENTER = 'COLLECT_FROM_RENTER',
  RETURN_TO_OWNER = 'RETURN_TO_OWNER',
}

export enum DeliveryTaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  ELIGIBLE = 'ELIGIBLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roles: UserRole[];
  createdAt: string;
}

export interface DressImageDto {
  id: string;
  url: string;
  isCover: boolean;
  displayOrder: number;
}

export interface DressDto {
  id: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  occasion: string[];
  size: string;
  color: string;
  material?: string;
  condition: DressCondition;
  rentalPrice: number;
  replacementValue?: number;
  city: string;
  pickupArea: string;
  status: DressStatus;
  rejectionReason?: string;
  ownerId: string;
  ownerName: string;
  images: DressImageDto[];
  coverImage: string;
  viewCount: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface RentalCalculationDto {
  occasionDate: string;
  scheduledDeliveryDate: string;
  scheduledReturnDate: string;
  rentalPrice: number;
  deliveryFee: number;
  depositFee: number;
  totalAmount: number;
  commissionRate: number;
  platformCommission: number;
  ownerEarnings: number;
  isAvailable: boolean;
  conflictReason?: string;
}

export interface RentalBookingDto {
  id: string;
  bookingReference: string;
  dressId: string;
  dress: DressDto;
  renterId: string;
  renterName: string;
  renterPhone: string;
  occasionDate: string;
  deliveryDate: string;
  returnDate: string;
  rentalPrice: number;
  deliveryFee: number;
  depositFee: number;
  totalAmount: number;
  commissionRate: number;
  platformCommission: number;
  ownerEarnings: number;
  status: RentalStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: {
    city: string;
    area: string;
    street: string;
    building: string;
    floor?: string;
    apartment?: string;
    notes?: string;
  };
  pickupAddress: {
    city: string;
    area: string;
    street: string;
  };
  timeline: {
    status: RentalStatus;
    timestamp: string;
    note?: string;
    authorName?: string;
  }[];
  deliveryTasks?: DeliveryTaskDto[];
  createdAt: string;
}

export interface DeliveryTaskDto {
  id: string;
  rentalBookingId: string;
  stage: DeliveryTaskStage;
  status: DeliveryTaskStatus;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  targetAddress: string;
  contactName: string;
  contactPhone: string;
  scheduledDate: string;
  completedAt?: string;
  proofNotes?: string;
  proofImageUrl?: string;
  failedReason?: string;
}

export interface PlatformSettingsDto {
  commissionPercentage: number;
  deliveryDaysBeforeOccasion: number;
  returnDaysAfterOccasion: number;
  preparationBufferDays: number;
  minimumBookingNoticeDays: number;
  requireDeposit: boolean;
  defaultDepositAmount: number;
  allowCashCollection: boolean;
  cancellationHoursBeforeDelivery: number;
}

export interface CityDeliveryRateDto {
  id: string;
  cityName: string;
  governorate: string;
  deliveryFee: number;
  isActive: boolean;
}
