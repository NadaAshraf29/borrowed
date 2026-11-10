import { PaymentMethod, RentalStatus } from '@prisma/client';

export interface CalculateRentalDto {
  dressId: string;
  occasionDate: string;
  deliveryCityName: string;
}

export interface CreateBookingDto {
  dressId: string;
  occasionDate: string;
  deliveryAddress: {
    city: string;
    area: string;
    street: string;
    building: string;
    floor?: string;
    apartment?: string;
    notes?: string;
    recipientName: string;
    recipientPhone: string;
  };
  paymentMethod: PaymentMethod;
}

export interface ProcessPaymentDto {
  paymentMethod: PaymentMethod;
  cardDetails?: {
    cardNumber: string;
    expDate: string;
    cvv: string;
    cardholderName: string;
  };
  notes?: string;
}

