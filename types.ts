
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  BUSINESS = 'BUSINESS',
  CUSTOMER = 'CUSTOMER'
}

export type BusinessStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  isBanned: boolean;
  walletBalance: number;
  permissions?: string[];
  isVerified?: boolean;
}

export interface Event {
  id: string;
  businessId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  date: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  images: string[];
  status: 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'CANCELLED';
  rating: number;
  totalSeats: number;
  soldSeats: number;
  allowNegotiation?: boolean;
}

export interface Negotiation {
  id: string;
  eventId: string;
  customerId: string;
  offeredPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  timestamp: number;
}

export interface Booking {
  id: string;
  eventId: string;
  customerId: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  amount: number;
  timestamp: number;
  paymentMethod: 'STRIPE' | 'RAZORPAY' | 'WALLET';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  timestamp: Date;
  isBroadcast?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}
