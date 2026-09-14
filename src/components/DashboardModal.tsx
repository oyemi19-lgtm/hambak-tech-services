import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { firestoreService } from "../services/firestoreService";
import { TransactionRecord, RegistrationRecord, ReceiptRecord } from "../types";
import {
  X,
  Wallet,
  ArrowDownToLine,
  FileCheck2,
  Clock,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  Phone,
  Mail,
  Shield,
  Loader2,
} from "lucide-react";

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowReceipt: (receipt: ReceiptRecord) => void;
  onNavigateToPayment: (amount: number, category: string) => void;
  onOpenAdminDashboard?: () => void;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  onShowReceipt,
  onNavigateToPayment,
  onOpenAdminDashboard,
}) => {
  const { user, logout, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "transactions">("overview");
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editRole, setEditRole] = useState<"customer" | "student" | "admin">("customer");
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
      setEditRole(user.role || "customer");
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user?._id) {
      setLoading(true);
      Promise.all([
        firestoreService.getUserTransactions(user._id),
      ])
        .then(([txList]) => {
          setTransactions(txList);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setProfileMessage({ type: "error", text: "Full name cannot be empty." });
      return;
    }
    setSaveLoading(true);
    setProfileMessage(null);

    try {
      await updateUserProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        role: editRole,
      });
      setProfileMessage({ type: "success", text: "Profile details updated and synced to Firestore!" });
      setIsEditingProfile(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setProfileMessage({ type: "error", text: msg });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div
      id="dashboard-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="dashboard-modal-card"
        className="relative w-full max-w-2xl my-8 bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 text-white overflow-hidden animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{user.name}</h3>
                {user.role === "admin" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                    <Shield className="w-2.5 h-2.5" /> Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {user.email} •{" "}
                <span className="text-amber-400 font-semibold uppercase">{user.role}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(user.role === "admin" || user.email === "fatimohmusbau34@gmail.com") && onOpenAdminDashboard && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminDashboard();
                }}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1 transition-colors"
              >
                <Shield className="w-3 h-3" />
                <span>Admin Panel</span>
              </button>
            )}
            <button
              id="dashboard-modal-close-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              aria-label="Close dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 pt-4 border-b border-slate-800 gap-4 text-xs font-semibold">
          <button
            id="tab-btn-overview"
            onClick={() => setActiveTab("overview")}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === "overview"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Wallet &amp; Profile
          </button>
          <button
            id="tab-btn-transactions"
            onClick={() => setActiveTab("transactions")}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === "transactions"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Transactions ({transactions.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {profileMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                profileMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {profileMessage.type === "success" ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{profileMessage.text}</span>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Wallet Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-850 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Firestore Cloud Wallet Balance
                  </span>
                  <div className="text-3xl font-black text-white mt-1">
                    ₦{(user.wallet || 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Real-Time Database Sync Active
                  </span>
                </div>
                <button
                  id="dashboard-deposit-funds-btn"
                  onClick={() => {
                    onClose();
                    onNavigateToPayment(5000, "Wallet Deposit");
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Deposit Funds
                </button>
              </div>

              {/* Account Metadata / Profile Form */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-amber-400" />
                    <span>Account Profile Details</span>
                  </h4>
                  {!isEditingProfile ? (
                    <button
                      id="edit-profile-btn"
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-amber-400" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      id="cancel-edit-profile-btn"
                      onClick={() => setIsEditingProfile(false)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {!isEditingProfile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Full Name</span>
                      <p className="font-bold text-white text-sm">{user.name}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Email Address</span>
                      <p className="font-bold text-white text-sm">{user.email}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Primary Phone</span>
                      <p className="font-bold text-white text-sm">{user.phone || "Not set"}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Account Role</span>
                      <p className="font-bold text-amber-400 capitalize text-sm">{user.role}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="080... or 090..."
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Account Role
                        </label>
                        <select
                          value={editRole}
                          onChange={(e) =>
                            setEditRole(e.target.value as "customer" | "student" | "admin")
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="customer">Customer / Business</option>
                          <option value="student">Student / Academy</option>
                          {user.role === "admin" && <option value="admin">Administrator</option>}
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="mt-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving to Firestore...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-3">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Loading verified transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No payment transactions found in your cloud history.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{tx.description || tx.type}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {tx.reference} • {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-white">₦{tx.amount.toLocaleString()}</p>
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                          {tx.status}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onShowReceipt({
                            receiptNumber: tx.receiptNumber || `REC-${tx.reference}`,
                            customerName: tx.customerName || user.name,
                            customerPhone: tx.customerPhone || user.phone || "09127469686",
                            customerEmail: tx.customerEmail || user.email,
                            serviceType: tx.type,
                            items: [
                              {
                                description: tx.description || tx.type,
                                qty: 1,
                                price: tx.amount,
                              },
                            ],
                            total: tx.amount,
                            paymentMethod: tx.paymentMethod,
                            status: "Successful",
                            date: tx.createdAt,
                            qrData: `HTS-VERIFY:${tx.reference}:${tx.amount}`,
                          });
                        }}
                        className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded font-semibold text-[11px] cursor-pointer transition"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            HAMBAK Tech Member ID: {user._id ? user._id.slice(0, 10) : "HTS-USER"}...
          </span>
          <button
            id="dashboard-logout-btn"
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer rounded-lg hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
