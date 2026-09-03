import React, { useState, useEffect, useMemo } from "react";
import { Service } from "../types";
import { servicesAPI } from "../services/api";
import { Search, Tag, Check, ArrowUpRight, X, Clock, FileText, Sparkles, RefreshCw } from "lucide-react";

interface ServicesSectionProps {
  onSelectForInquiry: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectForInquiry }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const fetchServicesData = async () => {
    setLoading(true);
    try {
      const data = await servicesAPI.getServices();
      setServices(data);
    } catch {
      // Fallback handled inside api.ts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["All", ...Array.from(set)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === "All" || service.category.toLowerCase() === selectedCategory.toLowerCase();
      const titleStr = (service.title || service.name || "").toLowerCase();
      const descStr = (service.description || "").toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || titleStr.includes(q) || descStr.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <section id="services" className="py-16 md:py-24 bg-slate-950 border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              <Tag className="h-3.5 w-3.5" />
              <span>Official Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Services & Standard Tariffs
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Transparent pricing, verified processing, and dedicated support for education, business, and daily digital operations.
            </p>
          </div>

          <button
            onClick={fetchServicesData}
            className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            <span>Sync Live Tariffs</span>
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g., NIN, JAMB, Printing, Excel)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20"
                    : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Services */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800/80 animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                  <div className="h-6 w-4/5 bg-slate-800 rounded" />
                  <div className="h-12 w-full bg-slate-800/60 rounded" />
                </div>
                <div className="h-10 w-full bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
            <p className="text-slate-400 text-sm">No services found matching your criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-3 text-xs text-amber-400 font-semibold hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 hover:border-amber-400/40 transition-all shadow-sm hover:shadow-md hover:shadow-amber-500/5"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                      {service.category}
                    </span>
                    {service.duration && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {service.duration}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {service.title || service.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Pricing Overview */}
                  {service.pricing && service.pricing.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Tariff Breakdown:
                      </div>
                      <div className="space-y-1">
                        {service.pricing.slice(0, 3).map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 truncate max-w-[180px]">{p.item}</span>
                            <span className="font-bold text-amber-400 ml-2">
                              {p.priceDisplay.startsWith("₦") ? p.priceDisplay : `₦${p.priceDisplay}`}
                            </span>
                          </div>
                        ))}
                        {service.pricing.length > 3 && (
                          <div className="text-[10px] text-slate-500 pt-0.5">
                            +{service.pricing.length - 3} more items in full tariff
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    View Tariffs & Details
                  </button>
                  <button
                    onClick={() => onSelectForInquiry(service)}
                    title="Dispatch inquiry for this service"
                    className="p-2.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{selectedService.category}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {selectedService.title || selectedService.name}
            </h3>

            {selectedService.duration && (
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>Processing Window: {selectedService.duration}</span>
              </div>
            )}

            <p className="text-sm text-slate-300 mt-4 leading-relaxed">
              {selectedService.description}
            </p>

            {/* Complete Pricing Breakdown */}
            {selectedService.pricing && selectedService.pricing.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Comprehensive Tariffs & Costs
                </h4>
                <div className="rounded-xl border border-slate-800 bg-slate-950 divide-y divide-slate-800/80">
                  {selectedService.pricing.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 text-xs sm:text-sm">
                      <span className="text-slate-300">{p.item}</span>
                      <span className="font-bold text-amber-400 ml-3">
                        {p.priceDisplay.startsWith("₦") ? p.priceDisplay : `₦${p.priceDisplay}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {selectedService.requirements && selectedService.requirements.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                  <span>Required Documents & Prerequisites</span>
                </h4>
                <ul className="space-y-1.5">
                  {selectedService.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  const s = selectedService;
                  setSelectedService(null);
                  onSelectForInquiry(s);
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-center text-xs sm:text-sm font-bold text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Inquire or Order This Service
              </button>
              <button
                onClick={() => setSelectedService(null)}
                className="px-5 py-3 rounded-xl border border-slate-800 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
