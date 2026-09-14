import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  Loader2,
  Shield,
  Sparkles,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register" | "forgot-password";
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = "login",
  onClose,
}) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot-password">(initialMode);
  const { login, register, loginWithGoogle, loginAsDemo, resetPassword } = useAuth();

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"customer" | "student">("customer");

  // Forgot password form
  const [resetEmail, setResetEmail] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Synchronize initialMode whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccess(null);
      const savedEmail = localStorage.getItem("hts_remembered_email");
      if (savedEmail) {
        setLoginEmail(savedEmail);
        setResetEmail(savedEmail);
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailToUse = loginEmail.trim();
    if (!emailToUse) {
      setError("Please enter your email address.");
      return;
    }
    if (!loginPassword) {
      setError("Please enter your password.");
      return;
    }

    if (rememberEmail) {
      localStorage.setItem("hts_remembered_email", emailToUse);
    } else {
      localStorage.removeItem("hts_remembered_email");
    }

    setLoading(true);
    try {
      await login({ email: emailToUse, password: loginPassword });
      setSuccess("Authenticated successfully! Connecting to your cloud profile...");
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailToUse = regEmail.trim();
    if (!regName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!emailToUse) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!regPhone.trim()) {
      setError("Please enter your primary phone number.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (rememberEmail) {
      localStorage.setItem("hts_remembered_email", emailToUse);
    }

    setLoading(true);
    try {
      await register({
        name: regName.trim(),
        email: emailToUse,
        phone: regPhone.trim(),
        password: regPassword,
        role: regRole,
      });
      setSuccess("Account created successfully! Profile stored in Firestore database.");
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const targetEmail = resetEmail.trim() || loginEmail.trim();
    if (!targetEmail) {
      setError("Please enter the email address linked to your account.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(targetEmail);
      setSuccess(
        `A password reset link has been dispatched to ${targetEmail}. Please check your inbox and spam folder.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send password reset email";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const succeeded = await loginWithGoogle();
      if (succeeded) {
        setSuccess("Signed in with Google successfully! Synchronizing with database...");
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setError("Google sign-in popup was dismissed. You can try again or use email sign-in below.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role: "admin" | "customer") => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await loginAsDemo(role);
      setSuccess(
        role === "admin"
          ? "Authenticated as Official Administrator (Fatimoh Musbau)!"
          : "Authenticated as Verified Client!"
      );
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo sign in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="auth-modal-card"
        className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-semibold mb-2">
            <Shield className="w-3 h-3" />
            <span>Secure Cloud Authentication</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === "login" && "Sign In to Hambak Portal"}
            {mode === "register" && "Create Your Client Account"}
            {mode === "forgot-password" && "Reset Your Password"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === "login" && "Access your wallet balance, receipts, and order tracking"}
            {mode === "register" && "Register to manage examination bookings, VTU recharge & receipts"}
            {mode === "forgot-password" && "Enter your email to receive a secure recovery link"}
          </p>
        </div>

        {/* OAuth & Demo Access (Only on login or register) */}
        {mode !== "forgot-password" && (
          <div className="mb-5">
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            {/* Quick Demo Access */}
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                id="quick-admin-login-btn"
                type="button"
                disabled={loading}
                onClick={() => handleDemoSignIn("admin")}
                className="py-1.5 px-2 bg-slate-800/90 hover:bg-slate-750 text-amber-400 border border-slate-700/80 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Admin Quick Sign-In</span>
              </button>
              <button
                id="quick-client-login-btn"
                type="button"
                disabled={loading}
                onClick={() => handleDemoSignIn("customer")}
                className="py-1.5 px-2 bg-slate-800/90 hover:bg-slate-750 text-slate-300 border border-slate-700/80 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <UserIcon className="w-3 h-3 text-slate-400" />
                <span>Client Quick Sign-In</span>
              </button>
            </div>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                or use email &amp; password
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
          </div>
        )}

        {/* Tab Switcher (Login vs Register) */}
        {mode !== "forgot-password" ? (
          <div className="flex border-b border-slate-800 mb-5">
            <button
              id="tab-btn-login"
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                mode === "login"
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Portal Sign In
            </button>
            <button
              id="tab-btn-register"
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                mode === "register"
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 mb-4 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal Sign In</span>
          </button>
        )}

        {/* Feedback Banners */}
        {error && (
          <div
            id="auth-error-banner"
            className="mb-4 flex items-start gap-2.5 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 animate-in fade-in"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {success && (
          <div
            id="auth-success-banner"
            className="mb-4 flex items-start gap-2.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 animate-in fade-in"
          >
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="flex-1">{success}</div>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === "login" && (
          <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="login-input-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  id="forgot-password-link-btn"
                  type="button"
                  onClick={() => {
                    setMode("forgot-password");
                    setError(null);
                    setSuccess(null);
                    if (loginEmail) setResetEmail(loginEmail);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="login-input-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-400 focus:ring-amber-400"
                />
                <span>Remember my email</span>
              </label>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-bold text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Portal</span>
              )}
            </button>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {mode === "register" && (
          <form id="register-form" onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="register-input-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Babatunde Lawal"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    id="register-input-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@mail.com"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    id="register-input-phone"
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="080... or 090..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Account Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole("customer")}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    regRole === "customer"
                      ? "border-amber-400 bg-amber-400/10 text-amber-300"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Customer / Business
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole("student")}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    regRole === "student"
                      ? "border-amber-400 bg-amber-400/10 text-amber-300"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Student / Academy
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
                  id="register-input-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <span>Create Account &amp; Sign In</span>
              )}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {mode === "forgot-password" && (
          <form id="forgot-password-form" onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="reset-input-email"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                We will trigger a Firebase secure password reset email with a direct link to choose a new password.
              </p>
            </div>

            <button
              id="reset-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-bold text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Reset Link...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send Recovery Email</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security badge at bottom */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>End-to-End SSL / Firebase Auth</span>
          <span>Hambak Tech &amp; Services</span>
        </div>
      </div>
    </div>
  );
};
