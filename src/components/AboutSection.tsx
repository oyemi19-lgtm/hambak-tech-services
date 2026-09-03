import React from "react";
import { Award, BookOpen, Clock, Users } from "lucide-react";

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-slate-950 border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Award className="h-3.5 w-3.5" />
            <span>Center Profile</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            About HAMBAK TECH & SERVICES
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            A trusted digital infrastructure provider in Lagos, Nigeria, bridging technical education, government identity enrollment, commercial printing, and secure financial agency services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">ICT Academy & Training</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We provide systematic, hands-on computer education tailored for beginners, secondary school graduates, and corporate staff. From core desktop productivity to professional digital competencies.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Identity & Portal Accuracy</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Serving thousands of students, job applicants, and citizens with verified national exam registrations (JAMB, WAEC, NECO, NYSC) and official NIMC NIN enrollment and modifications.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Reliable Fast Dispatch</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Equipped with high-capacity digital laser printers, backup generators, dedicated optical fiber internet, and instant POS cash channels for uninterrupted daily operations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
