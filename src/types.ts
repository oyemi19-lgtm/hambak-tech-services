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

export interface TransactionRecord {
  id: string;
  reference: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  type: "deposit" | "wallet_funding" | "service_payment" | "vtu" | "pos" | "registration";
  amount: number;
  paymentMethod: "card" | "bank_transfer" | "wallet" | "pos" | "cash";
  status: "pending" | "successful" | "failed";
  description: string;
  receiptNumber?: string;
  createdAt: string;
}

export interface RegistrationRecord {
  id: string;
  trackingId: string;
  applicantName: string;
  email: string;
  phone: string;
  regType: "waec" | "jamb" | "neco" | "nysc" | "nin" | "other";
  institution?: string;
  matricNumber?: string;
  examYear?: string;
  preferredCourse?: string;
  details?: string;
  fee: number;
  paymentStatus: "pending" | "paid" | "waived";
  status: "pending" | "processing" | "approved" | "completed";
  userId?: string;
  createdAt: string;
}

export interface VtuOrderRecord {
  id: string;
  reference: string;
  userId?: string;
  serviceType: "airtime" | "data" | "electricity" | "cable";
  network?: string;
  phoneNumber?: string;
  plan?: string;
  meterOrCardNumber?: string;
  amount: number;
  status: "successful" | "pending" | "failed";
  createdAt: string;
}

export interface ReceiptItem {
  description: string;
  qty: number;
  price: number;
}

export interface ReceiptRecord {
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: string;
  items: ReceiptItem[];
  total: number;
  paymentMethod: string;
  status: "Successful" | "Pending" | "Verified";
  date: string;
  qrData: string;
  notes?: string;
}

