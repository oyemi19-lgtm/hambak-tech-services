import { AuthResponse, ContactInquiry, Service, User } from "../types";
import { fallbackServices } from "../data/servicesData";
import { firestoreService } from "./firestoreService";

const API_BASE_URL: string =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "https://hambak-tech-services.onrender.com/api";

const TOKEN_STORAGE_KEY = "hts_auth_token";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setStoredToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const removeStoredToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const getAuthHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/* ==========================================================================
   AUTHENTICATION API
   ========================================================================== */
export const authAPI = {
  async register(data: {
    name: string;
    username?: string;
    email: string;
    phone: string;
    password: string;
    role?: "customer" | "student";
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Registration failed. Please check your details.");
      }
      if (result.token) {
        setStoredToken(result.token);
      }
      return result;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Network error during registration";
      throw new Error(msg);
    }
  },

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Invalid email or password");
      }
      if (result.token) {
        setStoredToken(result.token);
      }
      return result;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Network error during login";
      throw new Error(msg);
    }
  },

  async getMe(): Promise<User> {
    const token = getStoredToken();
    if (!token) {
      throw new Error("Missing authentication token");
    }
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        removeStoredToken();
      }
      throw new Error(result.message || "Failed to fetch user profile");
    }
    return result.user || result;
  },

  logout(): void {
    removeStoredToken();
  }
};

/* ==========================================================================
   SERVICES API
   ========================================================================== */
export const servicesAPI = {
  async getServices(): Promise<Service[]> {
    try {
      // 1. Prioritize live Firestore database entries (managed directly by Admin Panel)
      const firestoreList = await firestoreService.getServices();
      if (firestoreList && firestoreList.length > 0) {
        return firestoreList;
      }
    } catch {
      // Continue to external endpoint or fallback
    }

    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        return fallbackServices;
      }
      const data = await response.json();
      const rawList: Service[] = Array.isArray(data) ? data : (data && Array.isArray(data.services) ? data.services : []);
      if (rawList.length > 0) {
        return rawList;
      }
      return fallbackServices;
    } catch {
      return fallbackServices;
    }
  },

  async getServiceById(id: string): Promise<Service | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        const found = fallbackServices.find((s) => s._id === id || s.slug === id);
        return found || null;
      }
      const data = await response.json();
      return data.service || data;
    } catch {
      const found = fallbackServices.find((s) => s._id === id || s.slug === id);
      return found || null;
    }
  }
};

/* ==========================================================================
   CUSTOMER INQUIRY / CONTACT API
   ========================================================================== */
export const contactAPI = {
  async submitInquiry(inquiry: ContactInquiry): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          whatsapp: inquiry.whatsapp || inquiry.phone,
          requestType: inquiry.requestType,
          message: inquiry.message,
          requirements: inquiry.requirements || inquiry.message
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit inquiry to server");
      }
      return {
        success: true,
        message: data.message || "Your inquiry has been successfully dispatched to our team!"
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Inquiry submission error";
      throw new Error(msg);
    }
  }
};
