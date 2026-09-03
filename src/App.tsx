import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ServicesSection } from "./components/ServicesSection";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { Service } from "./types";
import { MessageSquare } from "lucide-react";

export function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
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

  const handleScrollToServices = () => {
    const el = document.getElementById("services");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
        <Navbar onOpenAuth={handleOpenAuth} />

        <main className="flex-1">
          <Hero
            onExploreServices={handleScrollToServices}
            onContactClick={handleScrollToContact}
          />

          <ServicesSection onSelectForInquiry={handleSelectServiceForInquiry} />

          <AboutSection />

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

        {/* Authentication Modal */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
