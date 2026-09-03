import React from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, PhoneCall } from "lucide-react";

interface HeroProps {
  onExploreServices: () => void;
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreServices, onContactClick }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-300">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Accredited Digital Center &bull; Lagos, Nigeria
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Comprehensive Digital, Educational & Financial Services
          </h1>

          {/* Description - no banned buzzwords */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            From official exam portal registrations and NIN identity verification to hands-on ICT computer training, high-resolution printing, and automated VTU recharges.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 w-full sm:w-auto">
            <button
              onClick={onExploreServices}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Explore Services Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onContactClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            >
              <PhoneCall className="h-4 w-4 text-amber-400" />
              <span>Contact Dispatch Center</span>
            </button>
          </div>

          {/* Key Metrics / Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-slate-800/80 w-full text-left">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Portals</span>
              </div>
              <div className="text-lg font-bold text-white">JAMB & WAEC</div>
              <div className="text-xs text-slate-400">Accredited Submissions</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Identity</span>
              </div>
              <div className="text-lg font-bold text-white">NIN / NIMC</div>
              <div className="text-xs text-slate-400">Capture & Modification</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">ICT Hub</span>
              </div>
              <div className="text-lg font-bold text-white">Academy</div>
              <div className="text-xs text-slate-400">Certified Course Modules</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Banking</span>
              </div>
              <div className="text-lg font-bold text-white">POS & VTU</div>
              <div className="text-xs text-slate-400">Instant Cash & Utility</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
