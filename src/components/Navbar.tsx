import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  Shield,
  Wallet,
  User as UserIcon,
  LogOut,
  Phone,
  MessageSquare,
  CreditCard,
  GraduationCap,
  Zap,
} from "lucide-react";

interface NavbarProps {
  onOpenAuth: (initialMode?: "login" | "register") => void;
  onOpenDashboard?: () => void;
  onOpenAdminDashboard?: () => void;
  onSelectService?: (category?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenDashboard,
  onOpenAdminDashboard,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin =
    user?.role === "admin" || user?.email === "fatimohmusbau34@gmail.com";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 font-extrabold text-slate-950 shadow-md shadow-amber-500/20 text-xl tracking-wider">
            HTS
          </div>
          <div>
            <div className="font-extrabold tracking-tight text-white text-lg group-hover:text-amber-400 transition-colors">
              HAMBAK TECH
            </div>
            <div className="text-[10px] font-medium tracking-widest text-amber-400/90 uppercase">
              &amp; SERVICES &bull; IBEJU-LEKKI
            </div>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#services" className="hover:text-amber-400 transition-colors">
            Services
          </a>
          <a href="#registration" className="hover:text-amber-400 transition-colors flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            Registration
          </a>
          <a href="#vtu" className="hover:text-amber-400 transition-colors flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            VTU Top-Up
          </a>
          <a href="#pricing" className="hover:text-amber-400 transition-colors">
            Pricing
          </a>
          <a href="#payment" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-blue-400 font-bold">
            <CreditCard className="w-3.5 h-3.5" />
            Payment Hub
          </a>
          <a href="#about" className="hover:text-amber-400 transition-colors">
            About
          </a>
          <a href="#contact" className="hover:text-amber-400 transition-colors">
            Contact
          </a>
          <a
            href="https://wa.me/2349155104724"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>
        </nav>

        {/* Right CTA / Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {isAdmin && onOpenAdminDashboard && (
            <button
              onClick={onOpenAdminDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-slate-950 border border-amber-400/40 shadow-sm transition-all"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Panel</span>
            </button>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDashboard}
                className="flex items-center gap-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer text-left"
              >
                <div className="h-7 w-7 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                    <span>{user.name.split(" ")[0]}</span>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-0.5 px-1 py-0.5 text-[9px] rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        <Shield className="h-2 w-2" /> Admin
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Wallet className="h-3 w-3 text-amber-400" />
                    <span>₦{(user.wallet || 0).toLocaleString()}</span>
                  </div>
                </div>
              </button>

              <button
                onClick={logout}
                title="Log out"
                className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth("login")}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110 shadow-sm shadow-amber-500/20 transition-all"
              >
                Register Portal
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex lg:hidden items-center gap-2">
          {isAuthenticated && user && (
            <button
              onClick={onOpenDashboard}
              className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 flex items-center gap-1"
            >
              <Wallet className="w-3 h-3" />
              ₦{(user.wallet || 0).toLocaleString()}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-900/95 px-4 pt-3 pb-6 space-y-3">
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Services Catalog
          </a>
          <a
            href="#registration"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Exam &amp; NIN Registration
          </a>
          <a
            href="#vtu"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            VTU &amp; Utilities Recharge
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Pricing &amp; Rates
          </a>
          <a
            href="#payment"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-blue-400 hover:text-blue-300"
          >
            Payment &amp; Wallet Hub
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            About Center
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Contact &amp; Orders
          </a>
          <a
            href="https://wa.me/2349155104724"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-2 text-sm font-medium text-emerald-400"
          >
            <Phone className="h-4 w-4" /> WhatsApp Desk (09155104724)
          </a>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAdmin && onOpenAdminDashboard && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminDashboard();
                }}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/40 flex items-center justify-center gap-2"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Operations Control Center</span>
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenDashboard) onOpenDashboard();
                  }}
                  className="flex items-center gap-2 text-left"
                >
                  <UserIcon className="h-4 w-4 text-amber-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-slate-400">Wallet: ₦{(user.wallet || 0).toLocaleString()}</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-400 font-semibold px-2.5 py-1.5 rounded bg-rose-500/10 border border-rose-500/20"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenAuth("login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-center rounded-xl bg-slate-800 text-white border border-slate-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth("register");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-bold text-center rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
