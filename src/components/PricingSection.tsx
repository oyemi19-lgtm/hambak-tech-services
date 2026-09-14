import React, { useState } from "react";
import { Check, ShieldCheck, Zap, Star, ArrowRight } from "lucide-react";

interface PricingSectionProps {
  onSelectPlan: (amount: number, planName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Student & Candidate",
      description: "Ideal for secondary school leavers, JAMB candidates, and university undergraduates.",
      monthlyPrice: 3500,
      annualPrice: 35000,
      popular: false,
      features: [
        "High-Speed Center WiFi Access (Daily)",
        "10% Discount on WAEC, JAMB & NECO Registrations",
        "Free Result Checking & Token Printing (2x Monthly)",
        "Access to Past Questions & Study Materials",
        "WhatsApp Priority Exam Alerts",
      ],
    },
    {
      name: "Professional & Business",
      description: "Designed for civil servants, entrepreneurs, remote workers, and job applicants.",
      monthlyPrice: 12500,
      annualPrice: 125000,
      popular: true,
      features: [
        "Unlimited Air-Conditioned Co-Working Desk Space",
        "High-Speed Dedicated Fiber Internet",
        "Priority Document Scanning & Color Printing (50 Pages)",
        "NIN Modification & Slip Reprint Support",
        "VIP Fast-Track Queue at Physical Center",
        "Dedicated POS Cashier Support",
      ],
    },
    {
      name: "Corporate Enterprise",
      description: "For corporate offices, schools, and organizations requiring ongoing ICT and printing.",
      monthlyPrice: 45000,
      annualPrice: 450000,
      popular: false,
      features: [
        "Bulk Employee/Student Online Registrations",
        "Custom Computer & ICT Training Modules (Up to 5 staff)",
        "Commercial High-Volume Graphic Design & Print Run",
        "Dedicated Account Officer & Instant Support",
        "Monthly Consolidated Invoice & Official Receipts",
      ],
    },
  ];

  const serviceCatalog = [
    { service: "WAEC May/June / GCE Registration", cost: "₦25,000", time: "Instant Profile Creation" },
    { service: "JAMB UTME / Direct Entry & CAPS", cost: "₦8,000", time: "e-PIN + Biometric Capture" },
    { service: "NECO SSCE / External Registration", cost: "₦22,000", time: "Complete Token & Slip" },
    { service: "NYSC Mobilization & Green Card", cost: "₦6,500", time: "Call-up Letter Processing" },
    { service: "NIN Fresh Enrollment", cost: "Free / NIMC Reg", time: "Biometric Queue" },
    { service: "NIN Modification (DOB, Name, Phone)", cost: "₦3,500", time: "24 - 48 Hours Approval" },
    { service: "Color Printing & Project Binding", cost: "From ₦150 / page", time: "Instant Print" },
    { service: "Black & White Bulk Photocopy", cost: "From ₦30 / page", time: "Instant" },
    { service: "ICT Computer Training (3 Months)", cost: "₦45,000", time: "Certificate Included" },
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50 text-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-4 h-4 text-blue-700" />
            Transparent Center Rates
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Affordable Memberships &amp; Services
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Transparent pricing with zero hidden fees. Choose a membership plan for discounts or pay directly per service.
          </p>

          {/* Billing Switch */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${billingCycle === "monthly" ? "text-blue-900" : "text-slate-500"}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="relative w-14 h-8 bg-blue-900 rounded-full p-1 transition duration-300"
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition duration-300 ${
                  billingCycle === "annual" ? "translate-x-6 bg-amber-400" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${billingCycle === "annual" ? "text-blue-900" : "text-slate-500"}`}>
              Annual Billing <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Save 15%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-stretch">
          {plans.map((plan, idx) => {
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
            return (
              <div
                key={idx}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "bg-blue-900 text-white shadow-2xl shadow-blue-900/30 ring-2 ring-blue-700 md:-translate-y-2"
                    : "bg-white text-slate-800 border border-slate-200 shadow-md hover:shadow-xl"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-slate-950" />
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className={`text-xl font-black ${plan.popular ? "text-white" : "text-slate-900"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mt-2 leading-relaxed ${plan.popular ? "text-slate-300" : "text-slate-500"}`}>
                    {plan.description}
                  </p>

                  <div className="mt-6 mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black tracking-tight">₦{price.toLocaleString()}</span>
                      <span className={`text-xs font-medium ${plan.popular ? "text-slate-300" : "text-slate-500"}`}>
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3.5 text-xs">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            plan.popular ? "bg-blue-800 text-amber-400" : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                        <span className={plan.popular ? "text-slate-200" : "text-slate-700"}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/20">
                  <button
                    onClick={() => onSelectPlan(price, `${plan.name} Membership`)}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                      plan.popular
                        ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20"
                        : "bg-blue-900 hover:bg-blue-800 text-white"
                    }`}
                  >
                    Select {plan.name}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Itemized Service Price Sheet */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-2">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Standard Over-The-Counter Price Sheet</h3>
              <p className="text-xs text-slate-500">Official schedule of service fees at Hambak Tech & Services</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4" />
              Verified Rates
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs mt-4">
            {serviceCatalog.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{item.service}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{item.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-blue-900 text-sm whitespace-nowrap">{item.cost}</span>
                  <button
                    onClick={() => {
                      const numeric = parseInt(item.cost.replace(/[^0-9]/g, "")) || 3500;
                      onSelectPlan(numeric, item.service);
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-lg transition whitespace-nowrap text-xs"
                  >
                    Pay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
