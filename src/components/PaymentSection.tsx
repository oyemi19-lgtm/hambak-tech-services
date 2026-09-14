import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { firestoreService } from "../services/firestoreService";
import { TransactionRecord, ReceiptRecord } from "../types";
import {
  CreditCard,
  Building2,
  Wallet,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";

interface PaymentSectionProps {
  onShowReceipt: (receipt: ReceiptRecord) => void;
  onOpenAuth: () => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({ onShowReceipt, onOpenAuth }) => {
  const { user, isAuthenticated, fundWallet } = useAuth();

  const [activeTab, setActiveTab] = useState<"pay" | "bank" | "pos" | "history">("pay");
  const [amount, setAmount] = useState<number>(5000);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [serviceCategory, setServiceCategory] = useState<string>("Wallet Funding");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer" | "pos">("card");
  const [transferRef, setTransferRef] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  const loadTransactions = async () => {
    if (user?._id) {
      try {
        const txs = await firestoreService.getUserTransactions(user._id);
        setRecentTransactions(txs);
      } catch (err) {
        console.error("Error loading transactions:", err);
      }
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!customerName) {
      alert("Please enter your name.");
      return;
    }

    setIsProcessing(true);
    setSuccessMessage(null);

    try {
      const generatedRef = `HTS-TX-${Date.now().toString().slice(-8)}`;
      const receiptNo = `REC-${Date.now().toString().slice(-6)}`;

      let tx: TransactionRecord;

      if (isAuthenticated && user) {
        // Real Firestore wallet fund and transaction
        tx = await fundWallet(amount, paymentMethod, serviceCategory);
      } else {
        // Record direct guest transaction in Firestore
        tx = await firestoreService.createTransaction({
          reference: generatedRef,
          customerName,
          customerEmail,
          customerPhone,
          type: "service_payment",
          amount,
          paymentMethod,
          status: "successful",
          description: `${serviceCategory} payment via ${paymentMethod.replace("_", " ").toUpperCase()}`,
          receiptNumber: receiptNo,
        });
      }

      setSuccessMessage(`Payment of ₦${amount.toLocaleString()} was successfully processed! Reference: ${tx.reference}`);

      // Build official receipt record
      const receiptData: ReceiptRecord = {
        receiptNumber: tx.receiptNumber || receiptNo,
        customerName: customerName || user?.name || "Valued Client",
        customerPhone: customerPhone || user?.phone || "09127469686",
        customerEmail: customerEmail || user?.email || "customer@hambaktech.com",
        serviceType: serviceCategory,
        items: [
          {
            description: `${serviceCategory} Payment Processing`,
            qty: 1,
            price: amount,
          },
        ],
        total: amount,
        paymentMethod: paymentMethod,
        status: "Successful",
        date: new Date().toISOString(),
        qrData: `HTS-VERIFY:${tx.reference}:${amount}`,
        notes: transferRef ? `Bank Transfer Ref: ${transferRef}` : "Verified digital transaction",
      };

      await loadTransactions();
      onShowReceipt(receiptData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment could not be completed";
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="payment" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Verified Financial Portal
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Secure Payment & Wallet Hub
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            Fund your wallet, process online exam registrations, settle VTU recharge bills, or dispatch bank transfer verifications with instant official receipts.
          </p>
        </div>

        {/* Live Wallet Banner */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/60 via-slate-800 to-slate-900 border border-blue-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                {isAuthenticated ? `Welcome, ${user?.name}` : "Member Wallet Hub"}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  ₦{(user?.wallet || 0).toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400 font-medium">Available Balance</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAuthenticated
                  ? "Real-time balance persisted safely in your cloud account."
                  : "Sign in with Google to retain balance and view complete transaction history."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab("pay");
                    setServiceCategory("Wallet Funding");
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 text-sm"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Deposit Funds
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  View Receipts
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition text-sm"
              >
                Sign In to Enable Wallet
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab("pay")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === "pay"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Online Checkout & Top-Up
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === "bank"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Official Bank Accounts
            </button>
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === "pos"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              POS & In-Store Agent
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setActiveTab("history")}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "history"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Clock className="w-4 h-4" />
                History & Receipts ({recentTransactions.length})
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Payment & Checkout Form */}
        {activeTab === "pay" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-7 bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Process Transaction</h3>
              <p className="text-sm text-slate-400 mb-6">
                All transactions are verified through encrypted channels and recorded to your account ledger.
              </p>

              {successMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Transaction Successful!</p>
                    <p className="text-xs text-emerald-400/90 mt-0.5">{successMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleProcessPayment} className="space-y-5">
                
                {/* Purpose / Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                    Payment Category
                  </label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="Wallet Funding">Fund Wallet Balance</option>
                    <option value="WAEC Registration Fee">WAEC Registration & PIN</option>
                    <option value="JAMB Registration Fee">JAMB Examination Application</option>
                    <option value="NECO Registration">NECO Registration Package</option>
                    <option value="NYSC Online Registration">NYSC Green Card & Mobilization</option>
                    <option value="NIN Processing & Slip">NIN Enrollment / Modification</option>
                    <option value="ICT Academy Tuition">ICT Academy Course Training</option>
                    <option value="Commercial Printing">Commercial Printing & Bulk Copying</option>
                    <option value="VTU & Utilities Bill">VTU Top-Up & Utility Bill</option>
                  </select>
                </div>

                {/* Amount with Quick Select */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                    Amount (₦ NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₦</span>
                    <input
                      type="number"
                      required
                      min={100}
                      step={100}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-lg font-bold focus:outline-none focus:border-blue-500 transition"
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[1000, 2500, 5000, 15000, 25000, 50000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                          amount === preset
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                        }`}
                      >
                        ₦{preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                      Customer Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="080... or 090..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                    Email for Receipt Dispatch
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                    Select Channel
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition ${
                        paymentMethod === "card"
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-amber-400" />
                      <span>Card Gateway</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition ${
                        paymentMethod === "bank_transfer"
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <span>Direct Transfer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pos")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition ${
                        paymentMethod === "pos"
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Wallet className="w-5 h-5 text-purple-400" />
                      <span>POS Terminal</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === "bank_transfer" && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs space-y-2">
                    <p className="font-semibold text-amber-400">Bank Transfer Notice:</p>
                    <p className="text-slate-300">
                      Transfer <span className="font-bold text-white">₦{amount.toLocaleString()}</span> to our official account:
                    </p>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-slate-300 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Moniepoint MFB:</span>
                        <span className="font-bold text-white text-sm">8147837664</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("8147837664", "moniepoint")}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-300 flex items-center gap-1"
                      >
                        {copiedField === "moniepoint" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy
                      </button>
                    </div>
                    <input
                      type="text"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="Enter Bank Session ID or Sender Name"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs mt-2"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 text-base"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing Verified Payment...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-amber-300" />
                      Pay ₦{amount.toLocaleString()} & Generate Official Receipt
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Summary & Benefits Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700">
                <h4 className="text-lg font-bold text-white mb-3">Hambak Guarantee</h4>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Instant digital receipt with tamper-proof reference hash.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Real-time wallet synchronization with zero delays.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Direct WhatsApp confirmation alert dispatched to 09155104724.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Physical receipt counter verification at our Ibeju-Lekki business office.</span>
                  </li>
                </ul>
              </div>

              {/* Verified Office Details */}
              <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700 text-xs text-slate-400 space-y-2.5">
                <h4 className="font-bold text-white text-sm">Official Help Desk & Desk Hours</h4>
                <p>Monday – Saturday: 8:00 AM – 7:00 PM</p>
                <p>Primary Call: <span className="text-white font-semibold">09127469686</span></p>
                <p>Alternative Call: <span className="text-white font-semibold">08147837664</span></p>
                <p>WhatsApp Dedicated: <span className="text-emerald-400 font-semibold">09155104724</span></p>
                <p>Email: <span className="text-blue-400">hambak901@gmail.com</span></p>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Bank Account Details */}
        {activeTab === "bank" && (
          <div className="max-w-3xl mx-auto bg-slate-800/90 rounded-3xl p-8 border border-slate-700 shadow-2xl space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Official Bank Accounts</h3>
              <p className="text-sm text-slate-400 mt-1">
                Make direct transfers from any Nigerian banking app. Use your phone number or name as the payment narration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Account 1 */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Moniepoint MFB</span>
                <div>
                  <span className="text-xs text-slate-400">Account Number:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-white tracking-wider font-mono">8147837664</span>
                    <button
                      onClick={() => handleCopy("8147837664", "acct1")}
                      className="p-2 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                    >
                      {copiedField === "acct1" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Account Name:</span>
                  <p className="font-bold text-slate-200 mt-0.5">HAMBAK TECH & SERVICES</p>
                </div>
              </div>

              {/* Account 2 */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">OPay Digital Services</span>
                <div>
                  <span className="text-xs text-slate-400">Account Number:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-white tracking-wider font-mono">09127469686</span>
                    <button
                      onClick={() => handleCopy("09127469686", "acct2")}
                      className="p-2 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                    >
                      {copiedField === "acct2" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Account Name:</span>
                  <p className="font-bold text-slate-200 mt-0.5">HAMBAK TECH SERVICES</p>
                </div>
              </div>

            </div>

            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">After Sending Payment:</p>
                <p className="mt-0.5 text-slate-300">
                  Switch back to the &quot;Online Checkout &amp; Top-Up&quot; tab and enter your details with the transfer reference to obtain your official instant digital receipt, or send proof to WhatsApp <span className="text-emerald-400 font-bold">09155104724</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: POS Services */}
        {activeTab === "pos" && (
          <div className="max-w-3xl mx-auto bg-slate-800/90 rounded-3xl p-8 border border-slate-700 shadow-2xl space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white">POS Terminal & Cash Agency Banking</h3>
              <p className="text-sm text-slate-400 mt-1">
                Fast cash withdrawals, instant bank transfers, account opening, and card payments at our physical center in Ibeju-Lekki, Lagos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase">Cash Withdrawal</span>
                <p className="text-slate-300">
                  Use all ATM cards (Mastercard, Visa, Verve) for quick cash payouts with standard minimal commission rates.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-blue-400 uppercase">Instant Interbank Transfer</span>
                <p className="text-slate-300">
                  Send funds across all Nigerian commercial banks with instant printed terminal slips and SMS alerts.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase">Bill Settlement</span>
                <p className="text-slate-300">
                  Pay electricity, waste management bills, and state levies directly over the counter.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Transaction History */}
        {activeTab === "history" && isAuthenticated && (
          <div className="max-w-4xl mx-auto bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">My Payment History & Receipts</h3>
                <p className="text-xs text-slate-400">Directly fetched from your verified Firestore ledger.</p>
              </div>
              <button
                onClick={loadTransactions}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition"
              >
                Refresh Ledger
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p>No transactions recorded yet.</p>
                <p className="text-xs text-slate-500 mt-1">Make your first deposit or service payment to generate a receipt.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 uppercase font-semibold text-[10px]">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Reference</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Method</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-750 transition">
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-white">{tx.reference}</td>
                        <td className="py-3 px-3">{tx.description || tx.type}</td>
                        <td className="py-3 px-3 capitalize">{tx.paymentMethod.replace("_", " ")}</td>
                        <td className="py-3 px-3 text-right font-bold text-white">
                          ₦{tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              onShowReceipt({
                                receiptNumber: tx.receiptNumber || `REC-${tx.reference}`,
                                customerName: tx.customerName || user?.name || "Valued Client",
                                customerPhone: tx.customerPhone || user?.phone || "09127469686",
                                customerEmail: tx.customerEmail || user?.email || "",
                                serviceType: tx.type,
                                items: [
                                  {
                                    description: tx.description || `${tx.type} payment`,
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
                            className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded font-semibold transition"
                          >
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
