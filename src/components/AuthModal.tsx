import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle, CheckCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = "login",
  onClose
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const { login, register, loginWithGoogle } = useAuth();

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"customer" | "student">("customer");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      setSuccess("Authenticated successfully!");
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: regRole
      });
      setSuccess("Account created and authenticated successfully!");
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccess("Authenticated with Google successfully!");
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Quick Google Sign In */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] uppercase font-semibold text-slate-500">or use email credentials</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              mode === "login"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Portal Sign In
          </button>
          <button
            onClick={() => {
              setMode("register");
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              mode === "register"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>{success}</div>
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-bold text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Verifying..." : "Sign In to Portal"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Samuel Ade"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="080..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Portal Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole("customer")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    regRole === "customer"
                      ? "border-amber-400 bg-amber-400/10 text-amber-300"
                      : "border-slate-800 bg-slate-950 text-slate-400"
                  }`}
                >
                  Customer / Business
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole("student")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    regRole === "student"
                      ? "border-amber-400 bg-amber-400/10 text-amber-300"
                      : "border-slate-800 bg-slate-950 text-slate-400"
                  }`}
                >
                  ICT Student / Academy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-bold text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Registering..." : "Create Account & Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
