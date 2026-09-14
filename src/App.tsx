import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ServicesSection } from "./components/ServicesSection";
import { RegistrationSection } from "./components/RegistrationSection";
import { VtuSection } from "./components/VtuSection";
import { PricingSection } from "./components/PricingSection";
import { PaymentSection } from "./components/PaymentSection";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { DashboardModal } from "./components/DashboardModal";
import { ReceiptModal } from "./components/ReceiptModal";
import { Service, ReceiptRecord } from "./types";
import { MessageSquare } from "lucide-react";

export function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptRecord | null>(null);
  const [inquiryService, setInquiryService] = useState<Service | null>(null);

  const handleOpenAuth = (mode: "login" | "register" = "login") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectServiceForInquiry = (service: Service) => {
    setInquiryService(service);
    const contactEl = document.getElementById("contact");
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavigateToPayment = (amount: number, category: string) => {
    const el = document.getElementById("payment");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AuthProvider>
      <div id="home" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
        
        {/* Navigation Bar */}
        <Navbar
          onOpenAuth={handleOpenAuth}
          onOpenDashboard={() => setDashboardOpen(true)}
        />

        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            onExploreServices={() => handleScrollToSection("services")}
            onContactClick={() => handleScrollToSection("contact")}
          />

          {/* Full Services Catalog */}
          <ServicesSection onSelectForInquiry={handleSelectServiceForInquiry} />

          {/* Online Examination & NIN Registration Portal */}
          <RegistrationSection
            onShowReceipt={(receipt) => setActiveReceipt(receipt)}
            onNavigateToPayment={handleNavigateToPayment}
          />

          {/* VTU, Airtime, Data & Utilities Recharge */}
          <VtuSection
            onShowReceipt={(receipt) => setActiveReceipt(receipt)}
            onNavigateToPayment={handleNavigateToPayment}
          />

          {/* Transparent Rates & Pricing Plans */}
          <PricingSection
            onSelectPlan={(amount, planName) => handleNavigateToPayment(amount, planName)}
          />

          {/* Verified Payment & Wallet Hub */}
          <PaymentSection
            onShowReceipt={(receipt) => setActiveReceipt(receipt)}
            onOpenAuth={() => handleOpenAuth("login")}
          />

          {/* About Center */}
          <AboutSection />

          {/* Contact & Custom Order Dispatch */}
          <ContactSection
            inquiryService={inquiryService}
            onClearService={() => setInquiryService(null)}
          />
        </main>

        <Footer />

        {/* Floating WhatsApp Action */}
        <a
          href="https://wa.me/2349155104724"
          target="_blank"
          rel="noopener noreferrer"
          title="Direct WhatsApp Desk"
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/30 hover:scale-105 hover:bg-emerald-400 transition-all"
        >
          <MessageSquare className="h-7 w-7" />
        </a>

        {/* User Authentication Modal */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
        />

        {/* User Profile & Wallet Dashboard Modal */}
        <DashboardModal
          isOpen={dashboardOpen}
          onClose={() => setDashboardOpen(false)}
          onShowReceipt={(receipt) => setActiveReceipt(receipt)}
          onNavigateToPayment={handleNavigateToPayment}
        />

        {/* Official Verified Receipt Modal */}
        <ReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
