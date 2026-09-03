import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "../types";
import { authAPI, getStoredToken, removeStoredToken } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    username?: string;
    email: string;
    phone: string;
    password: string;
    role?: "customer" | "student";
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const userData = await authAPI.getMe();
      setUser(userData);
      setToken(currentToken);
    } catch {
      removeStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(credentials);
      if (response.token) {
        setToken(response.token);
      }
      if (response.user) {
        setUser(response.user);
      } else {
        await refreshProfile();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    username?: string;
    email: string;
    phone: string;
    password: string;
    role?: "customer" | "student";
  }) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(data);
      if (response.token) {
        setToken(response.token);
      }
      if (response.user) {
        setUser(response.user);
      } else {
        await refreshProfile();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile
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
