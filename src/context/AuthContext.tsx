import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User, TransactionRecord } from "../types";
import { auth, googleProvider } from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { firestoreService } from "../services/firestoreService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
  loginAsDemo: (role?: "admin" | "customer") => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: "customer" | "student";
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: {
    name?: string;
    phone?: string;
    role?: "customer" | "student" | "admin";
    avatar?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  fundWallet: (amount: number, paymentMethod: "card" | "bank_transfer" | "pos", description?: string) => Promise<TransactionRecord>;
  deductWallet: (amount: number, description: string) => Promise<boolean>;
}

export function formatAuthError(error: unknown): string {
  const err = error as { code?: string; message?: string };
  switch (err?.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "The Google sign-in window was closed before completing.";
    case "auth/popup-blocked":
      return "The sign-in popup was blocked by your browser. Please allow popups or use email sign-in.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please verify your credentials or create an account.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/network-request-failed":
      return "Network error. Please verify your internet connection and try again.";
    default:
      return err?.message?.replace(/^Firebase:\s*/, "") || "Authentication failed. Please try again.";
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const unsubscribeSnapshotRef = useRef<(() => void) | null>(null);

  const syncUserFromAuth = useCallback(
    async (
      firebaseUser: typeof auth.currentUser,
      extra?: {
        name?: string;
        phone?: string;
        role?: "customer" | "student" | "admin";
      }
    ) => {
      if (!firebaseUser) {
        if (unsubscribeSnapshotRef.current) {
          unsubscribeSnapshotRef.current();
          unsubscribeSnapshotRef.current = null;
        }
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        const userProfile = await firestoreService.getOrCreateUserProfile(
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
          },
          extra
        );
        setUser(userProfile);

        // Realtime Firestore synchronization for profile & wallet balance
        if (unsubscribeSnapshotRef.current) {
          unsubscribeSnapshotRef.current();
        }
        unsubscribeSnapshotRef.current = firestoreService.subscribeUserProfile(
          firebaseUser.uid,
          (freshProfile) => {
            setUser((prev) => (prev ? { ...prev, ...freshProfile } : freshProfile));
          }
        );
      } catch (err) {
        console.error("Error loading user profile from Firestore:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      syncUserFromAuth(firebaseUser);
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
        unsubscribeSnapshotRef.current = null;
      }
    };
  }, [syncUserFromAuth]);

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
      await syncUserFromAuth(auth.currentUser);
    }
  }, [syncUserFromAuth]);

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserFromAuth(result.user);
      return true;
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        // User voluntarily dismissed or cancelled the popup window
        return false;
      }
      const formatted = formatAuthError(error);
      throw new Error(formatted);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: "admin" | "customer" = "admin"): Promise<void> => {
    setIsLoading(true);
    const email = role === "admin" ? "fatimohmusbau34@gmail.com" : "demo.client@hambaktech.ng";
    const password = "HambakPassword2026!";
    const displayName = role === "admin" ? "Fatimoh Musbau" : "Demo Customer";
    try {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await syncUserFromAuth(result.user);
      } catch (signInErr: unknown) {
        const err = signInErr as { code?: string };
        if (
          err?.code === "auth/user-not-found" ||
          err?.code === "auth/invalid-credential"
        ) {
          const createResult = await createUserWithEmailAndPassword(auth, email, password);
          if (createResult.user) {
            await updateProfile(createResult.user, { displayName });
          }
          await syncUserFromAuth(createResult.user);
        } else {
          throw signInErr;
        }
      }
    } catch (error) {
      const formatted = formatAuthError(error);
      throw new Error(formatted);
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
      const formatted = formatAuthError(error);
      throw new Error(formatted);
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
      await syncUserFromAuth(result.user, {
        name: data.name,
        phone: data.phone,
        role: data.role || "customer",
      });
    } catch (error) {
      const formatted = formatAuthError(error);
      throw new Error(formatted);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      const formatted = formatAuthError(error);
      throw new Error(formatted);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates: {
    name?: string;
    phone?: string;
    role?: "customer" | "student" | "admin";
    avatar?: string;
  }): Promise<void> => {
    if (!user) throw new Error("Must be logged in to update profile");
    setIsLoading(true);
    try {
      await firestoreService.updateUserProfile(user._id, updates);
      if (auth.currentUser && updates.name) {
        await updateProfile(auth.currentUser, { displayName: updates.name });
      }
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      const formatted = formatAuthError(error);
      throw new Error(formatted);
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
        loginAsDemo,
        register,
        resetPassword,
        updateUserProfile,
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
