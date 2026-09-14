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
} from "lucide-react";

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowReceipt: (receipt: ReceiptRecord) => void;
  onNavigateToPayment: (amount: number, category: string) => void;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  onShowReceipt,
  onNavigateToPayment,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "transactions">("overview");
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 text-white overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.email} • <span className="text-amber-400 font-semibold uppercase">{user.role}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 pt-4 border-b border-slate-800 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 border-b-2 transition ${
              activeTab === "overview"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Wallet &amp; Profile
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`pb-3 border-b-2 transition ${
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
          
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Wallet Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/80 to-slate-800 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Firestore Wallet Balance</span>
                  <div className="text-3xl font-black text-white mt-1">
                    ₦{(user.wallet || 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Cloud Synced &amp; Active
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToPayment(5000, "Wallet Deposit");
                  }}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Deposit Funds
                </button>
              </div>

              {/* Account Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-slate-400">Account Type</span>
                  <p className="font-bold text-white capitalize mt-0.5">{user.role}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-slate-400">Primary Phone</span>
                  <p className="font-bold text-white mt-0.5">{user.phone || "Not set"}</p>
                </div>
              </div>

            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-3">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading verified transactions...</div>
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
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase">{tx.status}</span>
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
                            items: [{ description: tx.description || tx.type, qty: 1, price: tx.amount }],
                            total: tx.amount,
                            paymentMethod: tx.paymentMethod,
                            status: "Successful",
                            date: tx.createdAt,
                            qrData: `HTS-VERIFY:${tx.reference}:${tx.amount}`,
                          });
                        }}
                        className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded font-semibold text-[11px]"
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

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center text-xs">
          <span className="text-slate-500">HAMBAK Member ID: {user._id.slice(0, 10)}...</span>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-rose-400 hover:text-rose-300 font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};
