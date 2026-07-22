import React, { useState, useMemo, useEffect } from 'react';
import { Laptop, FilterState, FilterBudget, FilterBrand, FilterUse } from './types';
import { ACTIVE_LAPTOPS, SOLD_LAPTOPS } from './data';
import { seedInitialDataIfNeeded, subscribeLaptops } from './lib/firebaseService';
import { ChevronRight, ArrowUpRight, Battery, Shield, CheckCircle2, MessageSquare, PhoneCall, Home, ShoppingBag } from 'lucide-react';
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
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [laptops, setLaptops] = useState<Laptop[]>(ACTIVE_LAPTOPS);
  const [soldLaptops, setSoldLaptops] = useState<Laptop[]>(SOLD_LAPTOPS);

  // Initialize and subscribe to Firestore
  useEffect(() => {
    // Seed initial data if empty
    seedInitialDataIfNeeded();

    // Subscribe to real-time changes
    const unsubscribe = subscribeLaptops((allLaptops) => {
      if (allLaptops.length > 0) {
        const active = allLaptops.filter((item) => !item.isSold);
        const sold = allLaptops.filter((item) => item.isSold);
        setLaptops(active);
        setSoldLaptops(sold);
      }
    });

    return () => unsubscribe();
  }, []);

  // Check if we are in admin view (either /admin pathname or #admin hash)
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin';
  });

  // Monitor location changes for routing
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminView(window.location.pathname === '/admin' || window.location.hash === '#admin');
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleUpdateLaptops = (updatedLaptops: Laptop[]) => {
    setLaptops(updatedLaptops);
    localStorage.setItem('rightware_active_laptops', JSON.stringify(updatedLaptops));
  };

  const handleUpdateSoldLaptops = (updatedSold: Laptop[]) => {
    setSoldLaptops(updatedSold);
    localStorage.setItem('rightware_sold_laptops', JSON.stringify(updatedSold));
  };

  const handleCloseAdmin = () => {
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    } else if (window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
      setIsAdminView(false);
    } else {
      setIsAdminView(false);
    }
  };

  // Active selected laptop for modal detail inspection
  const [selectedLaptop, setSelectedLaptop] = useState<Laptop | null>(null);

  // Active view tab: 'home' | 'shop'
  const [currentTab, setCurrentTab] = useState<'home' | 'shop'>('home');

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
    const filterFn = (laptop: Laptop) => {
      // Hide listings that are explicitly unlisted by the admin
      if (laptop.isForSale === false) {
        return false;
      }

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
    };

    const activeFiltered = laptops.filter(filterFn);
    const soldFiltered = soldLaptops.filter(filterFn);

    // Prioritize available listings first, then sold-out ones in between
    const availableActive = activeFiltered.filter((l) => l.stockCount > 0 && !l.isSold);
    const soldOutActive = activeFiltered.filter((l) => l.stockCount === 0 || l.isSold);

    return [...availableActive, ...soldOutActive, ...soldFiltered];
  }, [laptops, soldLaptops, filters]);

  if (isAdminView) {
    return (
      <AdminPanel
        laptops={laptops}
        soldLaptops={soldLaptops}
        onUpdateLaptops={handleUpdateLaptops}
        onUpdateSoldLaptops={handleUpdateSoldLaptops}
        onClose={handleCloseAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111111] font-sans selection:bg-[#FF3B30] selection:text-white flex flex-col justify-between">
      
      {/* Top sticky brand header */}
      <Navbar 
        onScrollToLaptops={() => {
          setCurrentTab('shop');
          setTimeout(() => scrollToId('available-laptops'), 100);
        }} 
        availableCount={laptops.filter(l => l.isForSale !== false).length}
        onTabChange={(tab) => setCurrentTab(tab)}
      />

      {/* Main Container */}
      <main className="flex-grow">
        
        {/* HOMEPAGE VIEW vs SHOP VIEW */}
        {currentTab === 'home' ? (
          <>
            {/* HERO SECTION */}
            <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24 bg-[#F7F7F7] border-b border-[#E5E5E5]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                  
                  {/* Left Column: Typography & CTAs */}
                  <div className="lg:col-span-7 space-y-6 sm:space-y-8 max-w-2xl">
                    <div className="space-y-4">
                      <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#111111] leading-[1.1] tracking-tight">
                        Get a clean, reliable <br className="hidden sm:inline" />
                        fairly used laptops <br className="hidden sm:inline" />
                        for your <span className="text-neutral-400">everyday need.</span>
                      </h1>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="inline-flex items-center bg-white border border-[#E5E5E5] px-2.5 py-1 text-[10px] sm:text-xs font-mono font-bold text-[#111111] shadow-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B30] mr-1.5" />
                          Tested
                        </span>
                        <span className="inline-flex items-center bg-white border border-[#E5E5E5] px-2.5 py-1 text-[10px] sm:text-xs font-mono font-bold text-[#111111] shadow-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B30] mr-1.5" />
                          Verified
                        </span>
                        <span className="inline-flex items-center bg-white border border-[#E5E5E5] px-2.5 py-1 text-[10px] sm:text-xs font-mono font-bold text-[#111111] shadow-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B30] mr-1.5" />
                          Ready to use
                        </span>
                      </div>

                      <p className="font-sans text-sm sm:text-base text-[#6B6B6B] leading-relaxed max-w-lg pt-1">
                        Every single workstation is backed by our strict 45-point engineer audit and a documented battery report.
                      </p>
                    </div>

                    {/* Combined CTA triggers */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        onClick={() => {
                          setCurrentTab('shop');
                          setTimeout(() => scrollToId('available-laptops'), 100);
                        }}
                        className="bg-[#FF3B30] hover:bg-[#FF3B30]/90 active:bg-[#FF3B30] text-white font-sans text-xs sm:text-sm font-semibold px-6 py-3.5 transition-colors cursor-pointer text-center flex items-center justify-center space-x-2.5"
                      >
                        <span>View Available Laptops</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, budget: 'under-400' }));
                          setCurrentTab('shop');
                          setTimeout(() => scrollToId('available-laptops'), 100);
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

            {/* Explore the best laptop for you CTA Button Section */}
            <section className="bg-white py-12 sm:py-16 border-b border-[#E5E5E5] flex flex-col items-center justify-center text-center px-4">
              <div className="max-w-xl">
                <button
                  onClick={() => {
                    setCurrentTab('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-[#111111] hover:bg-[#FF3B30] hover:text-white text-white font-display text-sm sm:text-base font-black px-10 py-5 transition-all duration-250 transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 cursor-pointer flex items-center space-x-3.5 mx-auto border border-transparent hover:border-transparent"
                >
                  <span>Explore the best laptop for you</span>
                  <ChevronRight className="h-5 w-5 text-[#FF3B30] group-hover:text-white" />
                </button>
              </div>
            </section>

            {/* Explore the best laptops Section */}
            <section className="py-16 sm:py-24 bg-[#FAF9F9] border-b border-[#E5E5E5]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B30] font-bold block mb-3">
                    Curated Workstations
                  </span>
                  <h2 className="font-display font-black text-3xl sm:text-5xl text-[#111111] tracking-tight">
                    Explore the best laptops
                  </h2>
                  <p className="font-sans text-sm sm:text-base text-[#6B6B6B] mt-4 leading-relaxed">
                    Filter by brand, budget, or your workload needs. Discover pristine, certified pre-owned units verified by Senior Hardware Engineers.
                  </p>
                </div>

                {/* Highly aesthetic featured category/brand grid cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Apple MacBooks */}
                  <div 
                    onClick={() => {
                      handleSelectCategoryFilter('brand', 'Apple');
                      setCurrentTab('shop');
                    }}
                    className="group bg-white border border-[#E5E5E5] p-6 hover:border-[#FF3B30] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF3B30]/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <span className="font-mono text-[9px] uppercase font-bold text-neutral-400">01 / BRAND</span>
                      <h3 className="font-display font-extrabold text-lg text-[#111111] mt-2 group-hover:text-[#FF3B30] transition-colors">
                        Apple MacBooks
                      </h3>
                      <p className="font-sans text-xs text-[#6B6B6B] mt-1.5 leading-normal">
                        M1, M2 & Intel models in flawless physical states.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#111111] flex items-center gap-1 mt-4 group-hover:translate-x-1.5 transition-transform">
                      <span>Browse MacBooks</span>
                      <ChevronRight className="h-4 w-4 text-[#FF3B30]" />
                    </span>
                  </div>

                  {/* Card 2: ThinkPads & Business */}
                  <div 
                    onClick={() => {
                      handleSelectCategoryFilter('brand', 'Lenovo');
                      setCurrentTab('shop');
                    }}
                    className="group bg-white border border-[#E5E5E5] p-6 hover:border-[#FF3B30] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF3B30]/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <span className="font-mono text-[9px] uppercase font-bold text-neutral-400">02 / WORKHORSES</span>
                      <h3 className="font-display font-extrabold text-lg text-[#111111] mt-2 group-hover:text-[#FF3B30] transition-colors">
                        Lenovo ThinkPads
                      </h3>
                      <p className="font-sans text-xs text-[#6B6B6B] mt-1.5 leading-normal">
                        Legendary keyboard quality and durability for coding.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#111111] flex items-center gap-1 mt-4 group-hover:translate-x-1.5 transition-transform">
                      <span>Browse ThinkPads</span>
                      <ChevronRight className="h-4 w-4 text-[#FF3B30]" />
                    </span>
                  </div>

                  {/* Card 3: Creative & Design */}
                  <div 
                    onClick={() => {
                      handleSelectCategoryFilter('use', 'Design');
                      setCurrentTab('shop');
                    }}
                    className="group bg-white border border-[#E5E5E5] p-6 hover:border-[#FF3B30] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF3B30]/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <span className="font-mono text-[9px] uppercase font-bold text-neutral-400">03 / CREATIVE</span>
                      <h3 className="font-display font-extrabold text-lg text-[#111111] mt-2 group-hover:text-[#FF3B30] transition-colors">
                        Heavy Creative
                      </h3>
                      <p className="font-sans text-xs text-[#6B6B6B] mt-1.5 leading-normal">
                        Dedicated GPUs, high RAM & beautiful displays for design.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#111111] flex items-center gap-1 mt-4 group-hover:translate-x-1.5 transition-transform">
                      <span>Browse Design Units</span>
                      <ChevronRight className="h-4 w-4 text-[#FF3B30]" />
                    </span>
                  </div>

                  {/* Card 4: Under $400 Budget */}
                  <div 
                    onClick={() => {
                      handleSelectCategoryFilter('budget', 'under-400');
                      setCurrentTab('shop');
                    }}
                    className="group bg-white border border-[#E5E5E5] p-6 hover:border-[#FF3B30] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF3B30]/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <span className="font-mono text-[9px] uppercase font-bold text-neutral-400">04 / VALUE</span>
                      <h3 className="font-display font-extrabold text-lg text-[#111111] mt-2 group-hover:text-[#FF3B30] transition-colors">
                        Budget Friendly
                      </h3>
                      <p className="font-sans text-xs text-[#6B6B6B] mt-1.5 leading-normal">
                        Incredible performance per dollar, mostly under $400.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#111111] flex items-center gap-1 mt-4 group-hover:translate-x-1.5 transition-transform">
                      <span>Browse Budget</span>
                      <ChevronRight className="h-4 w-4 text-[#FF3B30]" />
                    </span>
                  </div>
                </div>

                {/* Big central CTA Button to view all shop */}
                <div className="mt-12 text-center">
                  <button
                    onClick={() => {
                      handleResetFilters();
                      setCurrentTab('shop');
                      setTimeout(() => scrollToId('available-laptops'), 100);
                    }}
                    className="inline-flex items-center space-x-3 bg-[#111111] hover:bg-black text-white px-8 py-4 font-sans text-xs sm:text-sm font-bold tracking-wide shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Browse Full Shop Catalog</span>
                    <ChevronRight className="h-4 w-4 text-[#FF3B30]" />
                  </button>
                </div>
              </div>
            </section>

            {/* Testing Standards breakdown block */}
            <HowItWorks />

            {/* Recently Sold Units (with Sold overlay and feedback) */}
            <RecentlyDelivered soldLaptops={soldLaptops} />

            {/* Short trustworthy reviews block */}
            <Testimonials />
          </>
        ) : (
          <>
            {/* SHOP VIEW */}
            {/* Shop Header Banner */}
            <section className="bg-white border-b border-[#E5E5E5] py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-[#FF3B30]">
                    Lagos Certified Pre-Owned
                  </span>
                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111111] mt-1.5 tracking-tight">
                    Inventory Catalog
                  </h1>
                  <p className="font-sans text-xs sm:text-sm text-[#6B6B6B] mt-2 max-w-xl leading-relaxed">
                    Check specific specs, real physical photos, diagnostic status, and battery logs for every individual device. Ready for immediate pickup or delivery.
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center justify-center sm:justify-start gap-3">
                  <span className="font-mono text-xs text-neutral-400">Total Live Listings:</span>
                  <span className="bg-[#111111] text-white font-mono text-sm font-bold px-3 py-1.5 rounded-none border border-transparent">
                    {laptops.filter(l => l.isForSale !== false).length}
                  </span>
                </div>
              </div>
            </section>

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
          </>
        )}

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
                  setCurrentTab('shop');
                  setTimeout(() => scrollToId('available-laptops'), 100);
                }}
                className="bg-[#FF3B30] hover:bg-[#FF3B30]/90 active:bg-[#FF3B30] text-white font-sans text-xs sm:text-sm font-semibold px-8 py-3.5 transition-colors cursor-pointer flex items-center space-x-2 rounded-none border border-[#FF3B30] w-full sm:w-auto justify-center"
              >
                <span>View All Laptops</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <a
                href="https://wa.me/2348076551802"
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

      {/* Floating Bottom Navigation Bar (Centered pill in viewport) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111111]/95 backdrop-blur-md border border-[#333] px-6 py-2.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.3)] flex items-center space-x-8">
        <button
          onClick={() => {
            setCurrentTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center space-y-0.5 cursor-pointer transition-all duration-200 ${
            currentTab === 'home' 
              ? 'text-[#FF3B30] scale-105' 
              : 'text-[#999999] hover:text-white'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest animate-fade-in">Home</span>
        </button>
        <button
          onClick={() => {
            setCurrentTab('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center space-y-0.5 cursor-pointer transition-all duration-200 ${
            currentTab === 'shop' 
              ? 'text-[#FF3B30] scale-105' 
              : 'text-[#999999] hover:text-white'
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest animate-fade-in">Shop</span>
        </button>
      </div>

    </div>
  );
}
