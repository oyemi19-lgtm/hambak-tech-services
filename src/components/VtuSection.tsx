import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { firestoreService } from "../services/firestoreService";
import { ReceiptRecord } from "../types";
import {
  Smartphone,
  Wifi,
  Zap,
  Tv,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
} from "lucide-react";

interface VtuSectionProps {
  onShowReceipt: (receipt: ReceiptRecord) => void;
  onNavigateToPayment: (amount: number, category: string) => void;
}

export const VtuSection: React.FC<VtuSectionProps> = ({
  onShowReceipt,
  onNavigateToPayment,
}) => {
  const { user, isAuthenticated, deductWallet } = useAuth();

  const [activeTab, setActiveTab] = useState<"airtime" | "data" | "electricity" | "cable">("airtime");
  const [network, setNetwork] = useState<string>("MTN");
  const [phone, setPhone] = useState<string>(user?.phone || "");

  React.useEffect(() => {
    if (user?.phone && !phone) {
      setPhone(user.phone);
    }
  }, [user]);
  const [amount, setAmount] = useState<number>(1000);
  const [dataPlan, setDataPlan] = useState<string>("1GB - 30 Days (₦350)");
  const [meterNumber, setMeterNumber] = useState<string>("");
  const [discoProvider, setDiscoProvider] = useState<string>("IKEDC (Ikeja Electric)");
  const [meterType, setMeterType] = useState<string>("Prepaid");
  const [cableProvider, setCableProvider] = useState<string>("DStv");
  const [smartcardNo, setSmartcardNo] = useState<string>("");
  const [cableBouquet, setCableBouquet] = useState<string>("DStv Yanga (₦5,100)");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dataPlansByNetwork: Record<string, { plan: string; price: number }[]> = {
    MTN: [
      { plan: "500MB SME (30 Days)", price: 200 },
      { plan: "1GB SME (30 Days)", price: 350 },
      { plan: "2GB SME (30 Days)", price: 700 },
      { plan: "3GB SME (30 Days)", price: 1050 },
      { plan: "5GB Corporate Gifting (30 Days)", price: 1750 },
      { plan: "10GB Corporate (30 Days)", price: 3500 },
    ],
    Airtel: [
      { plan: "500MB Corporate (30 Days)", price: 220 },
      { plan: "1GB Corporate (30 Days)", price: 380 },
      { plan: "2GB Corporate (30 Days)", price: 760 },
      { plan: "5GB Corporate (30 Days)", price: 1900 },
      { plan: "10GB Corporate (30 Days)", price: 3800 },
    ],
    GLO: [
      { plan: "1GB Corporate (30 Days)", price: 320 },
      { plan: "2GB Corporate (30 Days)", price: 640 },
      { plan: "3GB Corporate (30 Days)", price: 960 },
      { plan: "5GB Corporate (30 Days)", price: 1600 },
      { plan: "10GB Corporate (30 Days)", price: 3200 },
    ],
    "9mobile": [
      { plan: "1GB Corporate (30 Days)", price: 400 },
      { plan: "2GB Corporate (30 Days)", price: 800 },
      { plan: "5GB Corporate (30 Days)", price: 2000 },
    ],
  };

  const handleVtuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setSuccessMessage(null);

    let finalAmount = amount;
    let desc = "";

    if (activeTab === "airtime") {
      desc = `${network} Airtime Top-Up (₦${amount}) to ${phone}`;
    } else if (activeTab === "data") {
      const plans = dataPlansByNetwork[network] || dataPlansByNetwork["MTN"];
      const matched = plans.find((p) => p.plan === dataPlan) || plans[0];
      finalAmount = matched.price;
      desc = `${network} Data Recharge (${matched.plan}) to ${phone}`;
    } else if (activeTab === "electricity") {
      desc = `${discoProvider} [${meterType}] Token for Meter: ${meterNumber}`;
    } else if (activeTab === "cable") {
      desc = `${cableProvider} Subscription [${cableBouquet}] for IUC: ${smartcardNo}`;
    }

    try {
      let paidViaWallet = false;
      if (isAuthenticated && user && user.wallet >= finalAmount) {
        await deductWallet(finalAmount, desc);
        paidViaWallet = true;
      }

      // Record to Firestore VTU Orders
      const order = await firestoreService.submitVtuOrder({
        userId: user?._id,
        serviceType: activeTab,
        network: activeTab === "airtime" || activeTab === "data" ? network : undefined,
        phoneNumber: phone || undefined,
        plan: activeTab === "data" ? dataPlan : undefined,
        meterOrCardNumber: activeTab === "electricity" ? meterNumber : activeTab === "cable" ? smartcardNo : undefined,
        amount: finalAmount,
      });

      setSuccessMessage(`Order #${order.reference} completed successfully!`);

      // Generate printable receipt
      const receipt: ReceiptRecord = {
        receiptNumber: `REC-${order.reference}`,
        customerName: user?.name || phone || "VTU Customer",
        customerPhone: phone || "09127469686",
        customerEmail: user?.email || "vtu@hambaktech.com",
        serviceType: `VTU ${activeTab.toUpperCase()}`,
        items: [
          {
            description: desc,
            qty: 1,
            price: finalAmount,
          },
        ],
        total: finalAmount,
        paymentMethod: paidViaWallet ? "wallet" : "direct_gateway",
        status: "Successful",
        date: order.createdAt,
        qrData: `HTS-VTU:${order.reference}:${finalAmount}`,
        notes: activeTab === "electricity" ? `Generated Meter Token: 4209-8812-7492-9134-5512` : "Instant electronic recharge processed",
      };

      onShowReceipt(receipt);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Top-up failed";
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="vtu" className="py-24 bg-white text-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-4 h-4 text-emerald-700" />
            Instant Electronic Recharge
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            VTU & Utilities Bill Payment Portal
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Discounted SME & corporate data bundles, instant airtime, prepaid meter electricity tokens, and cable TV renewals 24/7.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveTab("airtime")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === "airtime"
                  ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Airtime
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === "data"
                  ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Wifi className="w-4 h-4" />
              Data Bundles
            </button>
            <button
              onClick={() => setActiveTab("electricity")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === "electricity"
                  ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-4 h-4" />
              Electricity (NEPA)
            </button>
            <button
              onClick={() => setActiveTab("cable")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === "cable"
                  ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tv className="w-4 h-4" />
              Cable TV
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
          
          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleVtuSubmit} className="space-y-6">
            
            {/* Airtime & Data Network Selection */}
            {(activeTab === "airtime" || activeTab === "data") && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Select Telecom Network
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {["MTN", "Airtel", "GLO", "9mobile"].map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setNetwork(net)}
                      className={`py-3 rounded-xl text-xs font-bold border transition ${
                        network === net
                          ? "bg-blue-900 border-blue-900 text-white shadow-md"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phone Number Field */}
            {(activeTab === "airtime" || activeTab === "data") && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Recipient Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="080... or 090..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-800"
                />
              </div>
            )}

            {/* Airtime Amount */}
            {activeTab === "airtime" && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Recharge Amount (₦)
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  step={50}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[200, 500, 1000, 2000, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                        amount === preset
                          ? "bg-blue-900 text-white border-blue-900"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      ₦{preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Data Bundle Plan Select */}
            {activeTab === "data" && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Select Data Package
                </label>
                <select
                  value={dataPlan}
                  onChange={(e) => setDataPlan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-800"
                >
                  {(dataPlansByNetwork[network] || dataPlansByNetwork["MTN"]).map((item) => (
                    <option key={item.plan} value={item.plan}>
                      {item.plan} — ₦{item.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Electricity DisCo & Meter Fields */}
            {activeTab === "electricity" && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Select Distribution Company (DisCo)
                  </label>
                  <select
                    value={discoProvider}
                    onChange={(e) => setDiscoProvider(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="IKEDC (Ikeja Electric)">IKEDC — Ikeja Electric</option>
                    <option value="EKEDC (Eko Electric)">EKEDC — Eko Electric</option>
                    <option value="AEDC (Abuja Electric)">AEDC — Abuja Electric</option>
                    <option value="IBEDC (Ibadan Electric)">IBEDC — Ibadan Electric</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                      Meter Type
                    </label>
                    <select
                      value={meterType}
                      onChange={(e) => setMeterType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-blue-600"
                    >
                      <option value="Prepaid">Prepaid (Token)</option>
                      <option value="Postpaid">Postpaid (Monthly Bill)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                      Meter Number
                    </label>
                    <input
                      type="text"
                      required
                      value={meterNumber}
                      onChange={(e) => setMeterNumber(e.target.value)}
                      placeholder="11-digit meter number"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Token Purchase Amount (₦)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={500}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </>
            )}

            {/* Cable TV Fields */}
            {activeTab === "cable" && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Cable TV Provider
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["DStv", "GOtv", "StarTimes"].map((tv) => (
                      <button
                        key={tv}
                        type="button"
                        onClick={() => setCableProvider(tv)}
                        className={`py-3 rounded-xl text-xs font-bold border transition ${
                          cableProvider === tv
                            ? "bg-blue-900 border-blue-900 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                      >
                        {tv}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Smartcard / IUC Number
                  </label>
                  <input
                    type="text"
                    required
                    value={smartcardNo}
                    onChange={(e) => setSmartcardNo(e.target.value)}
                    placeholder="Enter Decoder IUC or Smartcard number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Select Package Bouquet
                  </label>
                  <select
                    value={cableBouquet}
                    onChange={(e) => setCableBouquet(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    {cableProvider === "DStv" && (
                      <>
                        <option value="DStv Yanga (₦5,100)">DStv Yanga — ₦5,100</option>
                        <option value="DStv Confam (₦9,300)">DStv Confam — ₦9,300</option>
                        <option value="DStv Compact (₦15,700)">DStv Compact — ₦15,700</option>
                        <option value="DStv Compact Plus (₦25,000)">DStv Compact Plus — ₦25,000</option>
                        <option value="DStv Premium (₦37,000)">DStv Premium — ₦37,000</option>
                      </>
                    )}
                    {cableProvider === "GOtv" && (
                      <>
                        <option value="GOtv Smallie (₦1,575)">GOtv Smallie — ₦1,575</option>
                        <option value="GOtv Jinja (₦3,300)">GOtv Jinja — ₦3,300</option>
                        <option value="GOtv Jolli (₦4,850)">GOtv Jolli — ₦4,850</option>
                        <option value="GOtv Max (₦7,200)">GOtv Max — ₦7,200</option>
                        <option value="GOtv Supa+ (₦15,700)">GOtv Supa+ — ₦15,700</option>
                      </>
                    )}
                    {cableProvider === "StarTimes" && (
                      <>
                        <option value="StarTimes Nova (₦1,700)">StarTimes Nova — ₦1,700</option>
                        <option value="StarTimes Basic (₦3,000)">StarTimes Basic — ₦3,000</option>
                        <option value="StarTimes Classic (₦4,500)">StarTimes Classic — ₦4,500</option>
                        <option value="StarTimes Super (₦7,500)">StarTimes Super — ₦7,500</option>
                      </>
                    )}
                  </select>
                </div>
              </>
            )}

            {/* Wallet Status Preview */}
            {isAuthenticated && user && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Your Current Wallet:</span>
                  <p className="font-black text-blue-900 text-sm">₦{user.wallet.toLocaleString()}</p>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-1 rounded-md">
                  Automatic Fast Debit
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/20 transition disabled:opacity-50 flex items-center justify-center gap-2 text-base"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Dispensing Recharge...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-400" />
                  Process Instant {activeTab.toUpperCase()} &amp; Get Receipt
                </>
              )}
            </button>

          </form>

        </div>

      </div>
    </section>
  );
};
