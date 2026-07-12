import React, { useState, useMemo } from 'react';
import { Laptop, FilterState, FilterBudget, FilterBrand, FilterUse } from './types';
import { ACTIVE_LAPTOPS } from './data';
import { ChevronRight, ArrowUpRight, Battery, Shield, CheckCircle2, MessageSquare, PhoneCall } from 'lucide-react';
import { motion } from 'motion/react';

// Import our modular custom components
import Navbar from './components/Navbar';
import TrustStrip from './components/TrustStrip';
import ShopBySection from './components/ShopBySection';
import ProductSection from './components/ProductSection';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import RecentlyDelivered from './components/RecentlyDelivered';
import Footer from './components/Footer';
import LaptopDetailsModal from './components/LaptopDetailsModal';

export default function App() {
  // Active selected laptop for modal detail inspection
  const [selectedLaptop, setSelectedLaptop] = useState<Laptop | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    budget: 'all',
    brand: 'all',
    use: 'all',
    searchQuery: ''
  });

  // Smooth scroll helper
  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper when clicking quick filters in the categories block
  const handleSelectCategoryFilter = (type: 'budget' | 'brand' | 'use', value: any) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
      // If we select a brand, reset others, or keep it additive
    }));
    // Scroll smoothly to active laptop listing
    setTimeout(() => {
      scrollToId('available-laptops');
    }, 100);
  };

  // Update specific filters
  const handleUpdateFilters = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates
    }));
  };

  // Reset all search and dropdown filters
  const handleResetFilters = () => {
    setFilters({
      budget: 'all',
      brand: 'all',
      use: 'all',
      searchQuery: ''
    });
  };

  // Calculate matching laptops dynamically
  const filteredLaptops = useMemo(() => {
    return ACTIVE_LAPTOPS.filter((laptop) => {
      // 1. Brand match
      if (filters.brand !== 'all' && laptop.brand !== filters.brand) {
        return false;
      }

      // 2. Use case match
      if (filters.use !== 'all' && laptop.useCategory !== filters.use) {
        return false;
      }

      // 3. Budget match
      if (filters.budget !== 'all') {
        const price = laptop.price;
        if (filters.budget === 'under-400' && price >= 400) return false;
        if (filters.budget === '400-700' && (price < 400 || price > 700)) return false;
        if (filters.budget === '700-1000' && (price < 700 || price > 1000)) return false;
        if (filters.budget === 'above-1000' && price <= 1000) return false;
      }

      // 4. Search query (matches model name, CPU, RAM, or description)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = laptop.name.toLowerCase().includes(query);
        const matchesCpu = laptop.specs.cpu.toLowerCase().includes(query);
        const matchesRam = laptop.specs.ram.toLowerCase().includes(query);
        const matchesDesc = laptop.description.toLowerCase().includes(query);
        if (!matchesName && !matchesCpu && !matchesRam && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111111] font-sans selection:bg-[#FF3B30] selection:text-white flex flex-col justify-between">
      
      {/* Top sticky brand header */}
      <Navbar 
        onScrollToLaptops={() => scrollToId('available-laptops')} 
        availableCount={ACTIVE_LAPTOPS.length}
      />

      {/* Main Container */}
      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24 bg-[#F7F7F7] border-b border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Typography & CTAs */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8 max-w-2xl">
                <div className="inline-flex items-center space-x-2 bg-white border border-[#E5E5E5] px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#111111] font-bold">
                    PREMIUM USED LAPTOPS ONLY
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#111111] leading-[1.1] tracking-tight">
                    Clean, reliable <br className="hidden sm:inline" />
                    fairly used laptops
                  </h1>
                  <p className="font-sans text-sm sm:text-base text-[#6B6B6B] leading-relaxed max-w-lg">
                    Tested. Verified. Ready to use. Every single workstation is backed by our strict 45-point engineer audit and a documented battery report.
                  </p>
                </div>

                {/* Combined CTA triggers */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => scrollToId('available-laptops')}
                    className="bg-[#FF3B30] hover:bg-[#FF3B30]/90 active:bg-[#FF3B30] text-white font-sans text-xs sm:text-sm font-semibold px-6 py-3.5 transition-colors cursor-pointer text-center flex items-center justify-center space-x-2.5"
                  >
                    <span>View Available Laptops</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, budget: 'under-400' }));
                      scrollToId('available-laptops');
                    }}
                    className="bg-white hover:bg-neutral-50 active:bg-white text-[#111111] border border-[#E5E5E5] font-sans text-xs sm:text-sm font-semibold px-6 py-3.5 transition-colors cursor-pointer text-center flex items-center justify-center space-x-2"
                  >
                    <span>Browse by Budget</span>
                    <ArrowUpRight className="h-4 w-4 text-[#6B6B6B]" />
                  </button>
                </div>

                {/* Fast assurance list */}
                <div className="grid grid-cols-2 gap-4 pt-4 sm:pt-6 border-t border-[#E5E5E5] text-xs font-mono text-[#6B6B6B]">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-[#FF3B30] flex-shrink-0" />
                    <span>Real Photos of Exact Units</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-[#FF3B30] flex-shrink-0" />
                    <span>80%+ Guaranteed Battery</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Premium Hero Image with Badges */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-square w-full overflow-hidden bg-white border border-[#E5E5E5] p-2.5 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80"
                    alt="Premium Used Laptop Workspace"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter grayscale-[0.05]"
                  />
                  
                  {/* Floating Diagnostics Seal */}
                  <div className="absolute top-6 right-6 bg-white border border-[#E5E5E5] p-3 shadow-md flex items-center space-x-3 max-w-[220px]">
                    <div className="bg-red-50 p-2 rounded-none flex items-center justify-center">
                      <Battery className="h-4 w-4 text-[#FF3B30]" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-[11px] text-[#111111] leading-tight">Battery Checked</h4>
                      <p className="font-sans text-[9px] text-[#6B6B6B] mt-0.5 leading-none">Diagnostic Log: 92%</p>
                    </div>
                  </div>

                  {/* Floating Certified Seal */}
                  <div className="absolute bottom-6 left-6 bg-[#111111] text-white p-3.5 shadow-md flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-[#FF3B30]" />
                    <div className="text-left">
                      <span className="font-mono text-[9px] tracking-widest uppercase block text-[#FF3B30] font-black leading-none">RELIABLE STANDARD</span>
                      <span className="font-display font-semibold text-xs mt-1 block text-white">45-Point Pass Certificate</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Minimal guarantees strip */}
        <TrustStrip />

        {/* Category breakdown selection */}
        <ShopBySection
          onSelectFilter={handleSelectCategoryFilter}
          activeBudget={filters.budget}
          activeBrand={filters.brand}
          activeUse={filters.use}
        />

        {/* Product Hub Grid */}
        <ProductSection
          laptops={filteredLaptops}
          filters={filters}
          onUpdateFilters={handleUpdateFilters}
          onResetFilters={handleResetFilters}
          onSelectLaptop={setSelectedLaptop}
        />

        {/* Testing Standards breakdown block */}
        <HowItWorks />

        {/* Recently Sold Units (with Sold overlay and feedback) */}
        <RecentlyDelivered />

        {/* Short trustworthy reviews block */}
        <Testimonials />

        {/* FINAL CTA SECTION (With bold contrast #0F0F0F Slate background) */}
        <section className="bg-[#0F0F0F] text-white py-16 sm:py-24 border-t border-[#FF3B30]/30 relative overflow-hidden">
          {/* Subtle accent light blur in background to maintain minimal but elevated feel */}
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#FF3B30]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B30] font-bold">
              Updated Daily • Nationwide Delivery
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white mt-4 tracking-tight">
              See what’s available now
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#999999] mt-3 max-w-xl mx-auto leading-relaxed">
              We update our inventory catalog in real time as each device finishes its final engineer inspection. Check specs, reviews, and secure your serial code instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={() => {
                  handleResetFilters();
                  scrollToId('available-laptops');
                }}
                className="bg-[#FF3B30] hover:bg-[#FF3B30]/90 active:bg-[#FF3B30] text-white font-sans text-xs sm:text-sm font-semibold px-8 py-3.5 transition-colors cursor-pointer flex items-center space-x-2 rounded-none border border-[#FF3B30] w-full sm:w-auto justify-center"
              >
                <span>View All Laptops</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <a
                href="https://wa.me/2348123456789"
                target="_blank"
                rel="noreferrer"
                className="bg-transparent hover:bg-white/5 active:bg-transparent text-white border border-[#333333] hover:border-[#FF3B30] font-sans text-xs sm:text-sm font-semibold px-8 py-3.5 transition-colors cursor-pointer flex items-center space-x-2.5 w-full sm:w-auto justify-center"
              >
                <PhoneCall className="h-4 w-4 text-[#FF3B30]" />
                <span>Speak to Store Support</span>
              </a>
            </div>

            <div className="mt-8 flex justify-center items-center space-x-6 text-[10px] font-mono text-[#666666]">
              <span>✓ Secure Bank Transfer</span>
              <span className="text-[#333333]">•</span>
              <span>✓ 100% Cash-on-Delivery in Lagos</span>
              <span className="text-[#333333]">•</span>
              <span>✓ 48-Hour Transit Insurance</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Block */}
      <Footer />

      {/* Pop-up details inspection drawer */}
      <LaptopDetailsModal
        laptop={selectedLaptop}
        onClose={() => setSelectedLaptop(null)}
      />

    </div>
  );
}
