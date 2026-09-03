export interface User {
  _id: string;
  id?: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role: "customer" | "student" | "admin";
  wallet: number;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServicePricing {
  _id?: string;
  item: string;
  priceDisplay: string;
}

export interface Service {
  _id: string;
  id?: string;
  title?: string;
  name?: string;
  slug?: string;
  category: string;
  description?: string;
  status?: string;
  pricing?: ServicePricing[];
  price?: number;
  discountPrice?: number;
  currency?: string;
  image?: string;
  available?: boolean;
  featured?: boolean;
  duration?: string;
  requirements?: string[];
  benefits?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInquiry {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  requestType: string;
  message: string;
  requirements?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  [key: string]: unknown;
}
