import React from "react";
import { Phone, Mail, MapPin, MessageSquare, Shield } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs sm:text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 font-extrabold text-slate-950 text-base">
                HTS
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                HAMBAK TECH & SERVICES
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Professional Digital Solutions, Online Registration, NIN Services, Printing, POS, Training, Recharge & VTU Services in Lagos, Nigeria.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <Shield className="h-4 w-4" />
              <span>Accredited Operations & Secure Processing</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Center Services</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#services" className="hover:text-amber-400 transition-colors">JAMB / WAEC / NECO Reg</a></li>
              <li><a href="#services" className="hover:text-amber-400 transition-colors">NIN Biometrics & Modification</a></li>
              <li><a href="#services" className="hover:text-amber-400 transition-colors">ICT Computer Academy</a></li>
              <li><a href="#services" className="hover:text-amber-400 transition-colors">Commercial Digital Printing</a></li>
              <li><a href="#services" className="hover:text-amber-400 transition-colors">POS Cash & VTU Top-Up</a></li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Operating Hours</h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p><strong className="text-slate-300">Monday – Friday:</strong> 8:00 AM – 7:00 PM</p>
              <p><strong className="text-slate-300">Saturday:</strong> 9:00 AM – 6:00 PM</p>
              <p><strong className="text-slate-300">Sunday:</strong> Closed (WhatsApp Desk open)</p>
              <p className="pt-2 text-emerald-400">Online portal inquiries processed 24/7</p>
            </div>
          </div>

          {/* Direct Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Contact & Support</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>09127469686 / 08147837664</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>WhatsApp: 09155104724</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span>hambak901@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Lagos State, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 HAMBAK TECH & SERVICES. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span>Official Identity & Portal Documentation Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
