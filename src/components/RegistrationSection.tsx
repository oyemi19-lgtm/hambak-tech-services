import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { firestoreService } from "../services/firestoreService";
import { RegistrationRecord, ReceiptRecord } from "../types";
import {
  GraduationCap,
  BookOpen,
  IdCard,
  Award,
  Search,
  CheckCircle,
  Clock,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  Fingerprint,
} from "lucide-react";

interface RegistrationSectionProps {
  onShowReceipt: (receipt: ReceiptRecord) => void;
  onNavigateToPayment: (amount: number, category: string) => void;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({
  onShowReceipt,
  onNavigateToPayment,
}) => {
  const { user, isAuthenticated, deductWallet } = useAuth();

  const [regType, setRegType] = useState<"waec" | "jamb" | "neco" | "nysc" | "nin">("waec");
  const [applicantName, setApplicantName] = useState<string>(user?.name || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [phone, setPhone] = useState<string>(user?.phone || "");
  const [examYear, setExamYear] = useState<string>("2026");
  const [institution, setInstitution] = useState<string>("");
  const [preferredCourse, setPreferredCourse] = useState<string>("");
  const [matricNumber, setMatricNumber] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [payWithWallet, setPayWithWallet] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<RegistrationRecord | null>(null);

  // Status check lookup
  const [searchTrackingId, setSearchTrackingId] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<RegistrationRecord | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const pricingMap: Record<"waec" | "jamb" | "neco" | "nysc" | "nin", { fee: number; title: string; desc: string }> = {
    waec: {
      fee: 25000,
      title: "WAEC May/June & GCE Registration",
      desc: "Complete online profile creation, biometric pre-data submission, passport verification, and examination PIN.",
    },
    jamb: {
      fee: 8000,
      title: "JAMB UTME / Direct Entry & CAPS",
      desc: "Official JAMB profile creation, e-PIN vending, center scheduling, and direct CAPS admission monitoring.",
    },
    neco: {
      fee: 22000,
      title: "NECO SSCE & External Exams",
      desc: "Comprehensive NECO data uploading, token generation, and verified candidate slip printing.",
    },
    nysc: {
      fee: 6500,
      title: "NYSC Mobilization & Green Card",
      desc: "Call-up letter processing, online portal registration, passport alignment, and biometric synchronization.",
    },
    nin: {
      fee: 3500,
      title: "NIN Enrollment, Modification & Slip Reprint",
      desc: "National Identity Management Commission (NIMC) validated data update, date of birth correction, and slip reprint.",
    },
  };

  const currentInfo = pricingMap[regType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !email || !phone) {
      alert("Please fill all required personal contact details.");
      return;
    }

    setIsSubmitting(true);
    try {
      let isPaid = false;
      if (payWithWallet && isAuthenticated && user) {
        if (user.wallet >= currentInfo.fee) {
          await deductWallet(currentInfo.fee, `${currentInfo.title} application fee`);
          isPaid = true;
        } else {
          alert(`Insufficient wallet balance (₦${user.wallet.toLocaleString()}). Proceeding with pending payment invoice.`);
        }
      }

      const record = await firestoreService.submitRegistration({
        applicantName,
        email,
        phone,
        regType,
        examYear,
        institution,
        preferredCourse,
        matricNumber,
        details,
        fee: currentInfo.fee,
        paymentStatus: isPaid ? "paid" : "pending",
        userId: user?._id,
      });

      setSubmittedRecord(record);

      // Trigger receipt
      const receiptData: ReceiptRecord = {
        receiptNumber: `REC-${record.trackingId}`,
        customerName: record.applicantName,
        customerPhone: record.phone,
        customerEmail: record.email,
        serviceType: currentInfo.title,
        items: [
          {
            description: `${currentInfo.title} Processing & Filing`,
            qty: 1,
            price: currentInfo.fee,
          },
        ],
        total: currentInfo.fee,
        paymentMethod: isPaid ? "wallet" : "bank_transfer",
        status: isPaid ? "Successful" : "Pending",
        date: record.createdAt,
        qrData: `HTS-REG:${record.trackingId}:${record.applicantName}`,
        notes: `Application Tracking ID: ${record.trackingId}`,
      };

      onShowReceipt(receiptData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration submission failed";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTrackingId.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const result = await firestoreService.getRegistrationByTracking(searchTrackingId.trim());
      if (result) {
        setSearchResult(result);
      } else {
        setSearchError(`No active record found with Tracking ID "${searchTrackingId.trim()}". Please double check your code.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error verifying tracking ID";
      setSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section id="registration" className="py-24 bg-slate-50 text-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Award className="w-4 h-4 text-blue-700" />
            Accredited Cyber Café & Registration Center
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Online Registration & Examination Portal
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Authorized registration for WAEC, JAMB, NECO, NYSC mobilization, and NIMC NIN data services in Lagos, Nigeria.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {[
            { id: "waec", label: "WAEC SSCE / GCE", icon: GraduationCap },
            { id: "jamb", label: "JAMB UTME / DE", icon: BookOpen },
            { id: "neco", label: "NECO Registration", icon: Award },
            { id: "nysc", label: "NYSC Mobilization", icon: IdCard },
            { id: "nin", label: "NIN Enrollment & Slip", icon: Fingerprint },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = regType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setRegType(item.id as "waec" | "jamb" | "neco" | "nysc" | "nin");
                  setSubmittedRecord(null);
                }}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition shadow-sm ${
                  isSelected
                    ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Two-Column Form & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          
          {/* Main Application Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Official Portal Application</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{currentInfo.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{currentInfo.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 uppercase font-semibold">Standard Fee</span>
                <p className="text-2xl font-black text-blue-900">₦{currentInfo.fee.toLocaleString()}</p>
              </div>
            </div>

            {submittedRecord && (
              <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <CheckCircle className="w-5 h-5" />
                  Application Recorded in Database!
                </div>
                <p className="text-xs">
                  Your official Tracking ID is:{" "}
                  <span className="font-mono font-bold text-sm bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">
                    {submittedRecord.trackingId}
                  </span>
                </p>
                <p className="text-xs text-slate-600">
                  Save your Tracking ID to monitor progress below. Our technical desk will inspect your submission.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Applicant Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Surname First, Middle, Other"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="applicant@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    WhatsApp Phone Number *
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
              </div>

              {/* Dynamic Exam / Program Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {regType === "jamb" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                        Target Institution
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. UNILAG, LASU, YABATECH"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                        Preferred Course of Study
                      </label>
                      <input
                        type="text"
                        value={preferredCourse}
                        onChange={(e) => setPreferredCourse(e.target.value)}
                        placeholder="e.g. Computer Science, Accounting"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-800"
                      />
                    </div>
                  </>
                )}

                {regType === "nysc" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                        Graduating Institution
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="University / Polytechnic Name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                        Matriculation Number
                      </label>
                      <input
                        type="text"
                        value={matricNumber}
                        onChange={(e) => setMatricNumber(e.target.value)}
                        placeholder="e.g. 19/0425/088"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-800"
                      />
                    </div>
                  </>
                )}

                {(regType === "waec" || regType === "neco") && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                      Examination Target Year
                    </label>
                    <select
                      value={examYear}
                      onChange={(e) => setExamYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-800"
                    >
                      <option value="2026">2026 Series</option>
                      <option value="2027">2027 Series</option>
                    </select>
                  </div>
                )}

                {regType === "nin" && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                      NIN Operation Type
                    </label>
                    <select
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-800"
                    >
                      <option value="New National NIN Enrollment">Fresh NIN Enrollment</option>
                      <option value="NIN Slip Verification & Color Reprint">NIN Slip Color Reprint</option>
                      <option value="Date of Birth / Name Correction">Data / Name / DOB Modification</option>
                      <option value="Phone Number Update on NIN">Phone Number Re-linking</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Subject Combinations, Center Preferences or Specific Notes
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Specify examination subjects, preferred center location in Lagos, or any special documentation notes..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-slate-800"
                />
              </div>

              {/* Wallet Payment Checkbox (if logged in) */}
              {isAuthenticated && user && (
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payWithWallet}
                      onChange={(e) => setPayWithWallet(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Pay registration fee instantly from Wallet Balance (₦{user.wallet.toLocaleString()})</span>
                  </label>
                  {user.wallet < currentInfo.fee && payWithWallet && (
                    <span className="text-[11px] text-amber-600 font-semibold">
                      Short by ₦{(currentInfo.fee - user.wallet).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 py-4 px-6 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/20 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registering Application...
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4 text-amber-400" />
                      Submit {currentInfo.title.split(" ")[0]} Registration
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToPayment(currentInfo.fee, `${currentInfo.title} Fee`)}
                  className="w-full sm:w-auto py-4 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-2xl shadow-md transition text-sm flex items-center justify-center gap-2"
                >
                  Pay Fee Directly (₦{currentInfo.fee.toLocaleString()})
                </button>
              </div>

            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                Required Documents
              </h4>
              <p className="text-xs text-slate-500">
                To complete physical or biometric submission at our center, ensure you have:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-1.5 shrink-0" />
                  <span>Valid National Identification Number (NIN)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-1.5 shrink-0" />
                  <span>Two recent passport photographs (white background)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-1.5 shrink-0" />
                  <span>O&apos;Level result printouts (WAEC / NECO / NABTEB)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-1.5 shrink-0" />
                  <span>Birth certificate or statutory declaration of age</span>
                </li>
              </ul>
            </div>

            {/* Office Center Alert */}
            <div className="bg-blue-900 text-white rounded-3xl p-6 shadow-md space-y-3">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Physical Enrollment Desk</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Biometric fingerprint capture for JAMB and WAEC is conducted at our fully air-conditioned computer center in Ibeju-Lekki.
              </p>
              <div className="pt-2 border-t border-blue-800 text-xs text-slate-300 space-y-1">
                <p>📍 Ibeju-Lekki, Lagos, Nigeria</p>
                <p>📞 09127469686 / 08147837664</p>
                <p>💬 WhatsApp: 09155104724</p>
              </div>
            </div>

          </div>

        </div>

        {/* Section: Live Tracking Status Checker */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Track Registration Status</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Enter your registration code (e.g. <span className="font-mono font-semibold text-blue-900">HTS-REG-123456</span>) to verify exam slot, e-PIN, or bio-capture schedule.
          </p>

          <form onSubmit={handleTrackStatus} className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <input
              type="text"
              required
              value={searchTrackingId}
              onChange={(e) => setSearchTrackingId(e.target.value)}
              placeholder="Enter Tracking ID (e.g. HTS-REG-123456)"
              className="w-full sm:w-80 px-4 py-3.5 rounded-xl border border-slate-300 text-sm font-mono uppercase text-slate-800 focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2"
            >
              {isSearching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
              Verify Status
            </button>
          </form>

          {searchError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {searchResult && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Tracking Code</span>
                  <p className="font-mono font-bold text-blue-900">{searchResult.trackingId}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                  {searchResult.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Applicant:</span>
                  <p className="font-bold text-slate-800">{searchResult.applicantName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Application Type:</span>
                  <p className="font-bold text-slate-800 uppercase">{searchResult.regType}</p>
                </div>
                <div>
                  <span className="text-slate-400">Payment Status:</span>
                  <p className="font-bold capitalize text-slate-800">{searchResult.paymentStatus}</p>
                </div>
                <div>
                  <span className="text-slate-400">Submitted On:</span>
                  <p className="font-medium text-slate-600">{new Date(searchResult.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
