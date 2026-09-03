import React, { useState, useEffect } from "react";
import { Service, ContactInquiry } from "../types";
import { contactAPI } from "../services/api";
import { Send, Phone, Mail, MapPin, MessageSquare, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface ContactSectionProps {
  inquiryService?: Service | null;
  onClearService?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ inquiryService, onClearService }) => {
  const [formData, setFormData] = useState<ContactInquiry>({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    requestType: "General Service Inquiry",
    message: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (inquiryService) {
      setFormData((prev) => ({
        ...prev,
        requestType: inquiryService.category || "General Service Inquiry",
        message: `I would like to place an order / request detailed processing for: ${
          inquiryService.title || inquiryService.name
        }.`
      }));
    }
  }, [inquiryService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMessage("Please fill out all required fields (Name, Email, Phone number, and Message).");
      return;
    }

    setSubmitting(true);
    try {
      const response = await contactAPI.submitInquiry(formData);
      setSuccessMessage(response.message || "Your inquiry has been successfully dispatched to our administration.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        requestType: "General Service Inquiry",
        message: ""
      });
      if (onClearService) onClearService();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Inquiry submission failed";
      setErrorMessage(`${msg}. You can dispatch directly to our verified WhatsApp support desk below.`);
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappDirectUrl = `https://wa.me/2349155104724?text=${encodeURIComponent(
    `Hello HAMBAK TECH & SERVICES, my name is ${formData.name || "Customer"}. I am inquiring regarding: ${
      formData.requestType
    }. ${formData.message || "Please provide further details."}`
  )}`;

  return (
    <section id="contact" className="py-16 md:py-24 bg-slate-900/50 border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Meta */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                <Send className="h-3.5 w-3.5" />
                <span>Dispatch & Support</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Connect With Our Center
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
                Have a specific order, urgent document screening, or institutional ICT training request? Our technical desk in Lagos processes customer requests promptly.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Direct Voice Lines</div>
                  <div className="text-sm font-bold text-white mt-0.5">09127469686 / 08147837664</div>
                  <div className="text-[11px] text-slate-500">Available Mon - Sat: 8:00 AM - 7:00 PM</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Official WhatsApp Portal</div>
                  <div className="text-sm font-bold text-white mt-0.5">09155104724</div>
                  <div className="text-[11px] text-slate-500">Instant direct order and inquiry routing</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-sky-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Corporate Email</div>
                  <div className="text-sm font-bold text-white mt-0.5">hambak901@gmail.com</div>
                  <div className="text-[11px] text-slate-500">Official inquiries & document uploads</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Physical Center</div>
                  <div className="text-sm font-bold text-white mt-0.5">Lagos, Nigeria</div>
                  <div className="text-[11px] text-slate-500">In-person biometrics, CBT training & printing facility</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Pane */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-xl">
              {inquiryService && (
                <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Inquiring for: <strong>{inquiryService.title || inquiryService.name}</strong></span>
                  </div>
                  {onClearService && (
                    <button
                      onClick={onClearService}
                      className="font-bold underline hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <div className="font-bold">Inquiry Dispatched!</div>
                    <div>{successMessage}</div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold">Dispatch Notification</div>
                    <div>{errorMessage}</div>
                    <a
                      href={whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 font-bold text-emerald-400 hover:underline"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Dispatch via WhatsApp Directly
                    </a>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Full Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Adebayo"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number / WhatsApp <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })
                      }
                      placeholder="e.g. 09155104724"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Request Category <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formData.requestType}
                      onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-amber-400 transition-colors"
                    >
                      <option value="General Service Inquiry">General Service Inquiry</option>
                      <option value="Registration Services">Online Exam / Portal Registration</option>
                      <option value="NIN & Identity">NIN Enrollment & Modification</option>
                      <option value="ICT Training Services">ICT Training & Computer Course</option>
                      <option value="Printing & Design">Printing & Graphic Design</option>
                      <option value="VTU & Utilities">VTU / Bill Payment Service</option>
                      <option value="Financial Services">Agency Banking / POS Terminal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Detailed Specifications / Requirements <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Specify your exact requirements, documents, or questions..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-bold text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? "Dispatching..." : "Dispatch Inquiry Profile"}</span>
                  </button>

                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp Order</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
