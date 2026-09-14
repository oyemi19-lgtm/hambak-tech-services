import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, TransactionRecord } from "../types";
import { auth, googleProvider } from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { firestoreService } from "../services/firestoreService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: "customer" | "student";
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  fundWallet: (amount: number, paymentMethod: "card" | "bank_transfer" | "pos", description?: string) => Promise<TransactionRecord>;
  deductWallet: (amount: number, description: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const syncUserFromAuth = useCallback(async (firebaseUser: typeof auth.currentUser) => {
    if (!firebaseUser) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const idToken = await firebaseUser.getIdToken();
      setToken(idToken);
      const userProfile = await firestoreService.getOrCreateUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
      });
      setUser(userProfile);
    } catch (err) {
      console.error("Error loading user profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      syncUserFromAuth(firebaseUser);
    });
    return () => unsubscribe();
  }, [syncUserFromAuth]);

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
      await syncUserFromAuth(auth.currentUser);
    }
  }, [syncUserFromAuth]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserFromAuth(result.user);
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, credentials.email.trim(), credentials.password);
      await syncUserFromAuth(result.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: "customer" | "student";
  }) => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      if (result.user) {
        await updateProfile(result.user, {
          displayName: data.name,
        });
      }
      await syncUserFromAuth(result.user);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
  };

  const fundWallet = async (
    amount: number,
    paymentMethod: "card" | "bank_transfer" | "pos",
    description = "Wallet Deposit"
  ): Promise<TransactionRecord> => {
    if (!user) {
      throw new Error("Must be logged in to fund wallet");
    }

    const ref = `HTS-WAL-${Date.now().toString().slice(-8)}`;
    const tx = await firestoreService.createTransaction({
      reference: ref,
      userId: user._id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      type: "wallet_funding",
      amount,
      paymentMethod,
      status: "successful",
      description: `${description} via ${paymentMethod.replace("_", " ").toUpperCase()}`,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    });

    const newBalance = await firestoreService.updateUserWallet(user._id, amount);
    setUser((prev) => (prev ? { ...prev, wallet: newBalance } : null));

    return tx;
  };

  const deductWallet = async (amount: number, description: string): Promise<boolean> => {
    if (!user) return false;
    if (user.wallet < amount) {
      throw new Error("Insufficient wallet balance. Please fund your wallet or pay directly.");
    }

    const ref = `HTS-DEB-${Date.now().toString().slice(-8)}`;
    await firestoreService.createTransaction({
      reference: ref,
      userId: user._id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      type: "service_payment",
      amount,
      paymentMethod: "wallet",
      status: "successful",
      description,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    });

    const newBalance = await firestoreService.updateUserWallet(user._id, -amount);
    setUser((prev) => (prev ? { ...prev, wallet: newBalance } : null));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshProfile,
        fundWallet,
        deductWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
