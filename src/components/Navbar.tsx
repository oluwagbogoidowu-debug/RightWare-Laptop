import React, { useState } from 'react';
import { 
  Menu, X, MapPin, Clock, Laptop, Home, ShoppingBag, 
  Briefcase, DollarSign, Cpu, ChevronDown, ChevronRight, 
  Sparkles, ShieldCheck, PackageCheck, Star, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onScrollToLaptops: () => void;
  availableCount: number;
  onTabChange?: (tab: 'home' | 'shop') => void;
  onNavigateToShopBy?: (page: number) => void;
  onSelectCategoryFilter?: (type: 'budget' | 'brand' | 'use', value: any) => void;
}

export default function Navbar({ 
  onScrollToLaptops, 
  availableCount, 
  onTabChange,
  onNavigateToShopBy,
  onSelectCategoryFilter 
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Collapsible sub-section state inside drawer
  const [openShopSubsections, setOpenShopSubsections] = useState(true);
  const [openHomeSubsections, setOpenHomeSubsections] = useState(true);

  const handleHomeClick = () => {
    setMenuOpen(false);
    if (onTabChange) onTabChange('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCatalogClick = () => {
    setMenuOpen(false);
    if (onTabChange) onTabChange('shop');
    setTimeout(() => {
      onScrollToLaptops();
    }, 150);
  };

  const handleShopBySubsectionClick = (page: number) => {
    setMenuOpen(false);
    if (onNavigateToShopBy) {
      onNavigateToShopBy(page);
    } else {
      if (onTabChange) onTabChange('shop');
      setTimeout(() => {
        const el = document.getElementById('shop-by-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const handleFilterClick = (type: 'budget' | 'brand' | 'use', value: any) => {
    setMenuOpen(false);
    if (onSelectCategoryFilter) {
      onSelectCategoryFilter(type, value);
    } else {
      if (onTabChange) onTabChange('shop');
      setTimeout(() => {
        onScrollToLaptops();
      }, 150);
    }
  };

  const handleAnchorClick = (tab: 'home' | 'shop', id: string) => {
    setMenuOpen(false);
    if (onTabChange) onTabChange(tab);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 150);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F7F7]/95 backdrop-blur-md border-b border-[#E5E5E5] transition-all duration-200 py-4 sm:py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
        {/* Left spacer to ensure the Logo is perfectly centered */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 opacity-0 pointer-events-none" />

        {/* Centered Brand Logo */}
        <div 
          onClick={handleHomeClick}
          className="flex items-center justify-center flex-grow gap-2 sm:gap-2.5 cursor-pointer group"
        >
          <Laptop className="h-6 w-6 sm:h-7 sm:w-7 text-[#FF3B30] flex-shrink-0 group-hover:scale-105 transition-transform" />
          <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]">
            Rightware Laptop
          </span>
        </div>

        {/* Interactive Menu Icon on the Right Hand Side */}
        <button 
          id="menu-toggle-btn"
          onClick={() => setMenuOpen(true)}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#111111] hover:text-[#FF3B30] hover:bg-neutral-100/50 active:bg-neutral-100 transition-all cursor-pointer rounded-sm border border-transparent hover:border-[#E5E5E5]"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      </div>

      {/* Slide-out Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              id="menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-[#111111]/40 backdrop-blur-xs"
            />

            {/* Sidebar Panel */}
            <motion.div
              id="menu-sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col border-l border-[#E5E5E5] h-full"
            >
              {/* Header inside drawer */}
              <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-2">
                  <Laptop className="h-5 w-5 text-[#FF3B30] flex-shrink-0" />
                  <span className="font-display text-lg font-bold tracking-tight text-[#111111]">
                    Navigation
                  </span>
                </div>
                <button 
                  id="menu-close-btn"
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center text-[#6B6B6B] hover:text-[#111111] hover:bg-neutral-200/60 transition-all cursor-pointer rounded-sm border border-transparent hover:border-[#E5E5E5]"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links List */}
              <div className="flex-grow overflow-y-auto p-5 space-y-6">

                {/* Primary Views */}
                <div className="space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#888888] tracking-wider px-2">
                    Main Pages
                  </span>

                  <button 
                    id="menu-link-home"
                    onClick={handleHomeClick}
                    className="w-full text-left py-2.5 px-3 flex items-center justify-between text-sm font-sans font-bold text-[#111111] hover:text-[#FF3B30] hover:bg-[#F9F9F9] transition-all rounded-sm cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Home className="h-4 w-4 text-[#FF3B30]" />
                      <span>Home Page</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </button>

                  <button 
                    id="menu-link-browse"
                    onClick={handleCatalogClick}
                    className="w-full text-left py-2.5 px-3 flex items-center justify-between text-sm font-sans font-bold text-[#111111] hover:text-[#FF3B30] hover:bg-[#F9F9F9] transition-all rounded-sm cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <ShoppingBag className="h-4 w-4 text-[#FF3B30]" />
                      <span>All Available Laptops</span>
                    </div>
                    <span className="bg-red-50 text-[#FF3B30] border border-red-100 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                      {availableCount} Live
                    </span>
                  </button>
                </div>

                {/* SHOP SUBSECTIONS */}
                <div className="border-t border-[#F0F0F0] pt-4 space-y-2">
                  <div 
                    onClick={() => setOpenShopSubsections(!openShopSubsections)}
                    className="flex items-center justify-between cursor-pointer px-2 py-1 group"
                  >
                    <span className="font-mono text-[10px] uppercase font-bold text-[#888888] tracking-wider flex items-center gap-1.5 group-hover:text-[#FF3B30]">
                      <Layers className="h-3 w-3 text-[#FF3B30]" />
                      <span>Shop Subsections</span>
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${openShopSubsections ? 'rotate-180' : ''}`} />
                  </div>

                  {openShopSubsections && (
                    <div className="space-y-3 pl-2 pt-1 border-l-2 border-[#FF3B30]/20 ml-2">
                      
                      {/* Workload / Use Case */}
                      <div>
                        <button
                          onClick={() => handleShopBySubsectionClick(0)}
                          className="w-full text-left py-1.5 px-2 flex items-center space-x-2 text-xs font-sans font-bold text-[#111111] hover:text-[#FF3B30] cursor-pointer"
                        >
                          <Briefcase className="h-3.5 w-3.5 text-[#FF3B30]" />
                          <span>Shop by Workload & Use Case</span>
                        </button>
                        <div className="pl-6 space-y-1 mt-1 font-sans text-xs text-[#6B6B6B]">
                          <button 
                            onClick={() => handleFilterClick('use', 'Coding')} 
                            className="block w-full text-left py-1 hover:text-[#FF3B30] cursor-pointer"
                          >
                            • Coding & Software Dev
                          </button>
                          <button 
                            onClick={() => handleFilterClick('use', 'Business')} 
                            className="block w-full text-left py-1 hover:text-[#FF3B30] cursor-pointer"
                          >
                            • Business & Office Work
                          </button>
                          <button 
                            onClick={() => handleFilterClick('use', 'Design')} 
                            className="block w-full text-left py-1 hover:text-[#FF3B30] cursor-pointer"
                          >
                            • Heavy Creative & Design
                          </button>
                        </div>
                      </div>

                      {/* Budget / Price Tiers */}
                      <div>
                        <button
                          onClick={() => handleShopBySubsectionClick(1)}
                          className="w-full text-left py-1.5 px-2 flex items-center space-x-2 text-xs font-sans font-bold text-[#111111] hover:text-[#FF3B30] cursor-pointer"
                        >
                          <DollarSign className="h-3.5 w-3.5 text-[#FF3B30]" />
                          <span>Browse Price Tiers (Budget)</span>
                        </button>
                        <div className="pl-6 space-y-1 mt-1 font-sans text-xs text-[#6B6B6B]">
                          <button 
                            onClick={() => handleFilterClick('budget', 'under-400')} 
                            className="block w-full text-left py-1 hover:text-[#FF3B30] cursor-pointer"
                          >
                            • Under ₦400,000 (Entry/Student)
                          </button>
                          <button 
                            onClick={() => handleFilterClick('budget', '400-700')} 
                            className="block w-full text-left py-1 hover:text-[#FF3B30] cursor-pointer"
                          >
                            • ₦400,000 - ₦700,000 (Mid-tier)
                          </button>
                          <button 
                            onClick={() => handleFilterClick('budget', '700-plus')} 
                            className="block w-full text-left py-1 hover:text-[#FF3B30] cursor-pointer"
                          >
                            • ₦700,000+ (High Performance)
                          </button>
                        </div>
                      </div>

                      {/* Brand Selection */}
                      <div>
                        <button
                          onClick={() => handleShopBySubsectionClick(2)}
                          className="w-full text-left py-1.5 px-2 flex items-center space-x-2 text-xs font-sans font-bold text-[#111111] hover:text-[#FF3B30] cursor-pointer"
                        >
                          <Cpu className="h-3.5 w-3.5 text-[#FF3B30]" />
                          <span>Filter by Laptop Brand</span>
                        </button>
                        <div className="pl-6 space-y-1 mt-1 font-sans text-xs text-[#6B6B6B]">
                          <button 
                            onClick={() => handleFilterClick('brand', 'Apple')} 
                            className="block w-full text-left py-1 hover:text-[#FF3B30] cursor-pointer"
                          >
                            • Apple MacBooks
                          </button>
                          <button 
                            onClick={() => handleFilterClick('brand', 'Lenovo')} 
                            className="block w-full text-left py-1 hover:text-[#FF3B30] cursor-pointer"
                          >
                            • Lenovo ThinkPads
                          </button>
                          <button 
                            onClick={() => handleFilterClick('brand', 'HP')} 
                            className="block w-full text-left py-1 hover:text-[#FF3B30] cursor-pointer"
                          >
                            • HP EliteBooks
                          </button>
                          <button 
                            onClick={() => handleFilterClick('brand', 'Dell')} 
                            className="block w-full text-left py-1 hover:text-[#FF3B30] cursor-pointer"
                          >
                            • Dell Latitudes / XPS
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* HOMEPAGE SUBSECTIONS */}
                <div className="border-t border-[#F0F0F0] pt-4 space-y-2">
                  <div 
                    onClick={() => setOpenHomeSubsections(!openHomeSubsections)}
                    className="flex items-center justify-between cursor-pointer px-2 py-1 group"
                  >
                    <span className="font-mono text-[10px] uppercase font-bold text-[#888888] tracking-wider flex items-center gap-1.5 group-hover:text-[#FF3B30]">
                      <Sparkles className="h-3 w-3 text-[#FF3B30]" />
                      <span>Homepage Sections</span>
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${openHomeSubsections ? 'rotate-180' : ''}`} />
                  </div>

                  {openHomeSubsections && (
                    <div className="space-y-1 pl-2 pt-1 border-l-2 border-neutral-200 ml-2 font-sans text-xs text-[#333333]">
                      <button 
                        onClick={() => handleAnchorClick('home', 'top-3-laptops')}
                        className="w-full text-left py-1.5 px-2 flex items-center justify-between hover:text-[#FF3B30] hover:bg-[#F9F9F9] transition-all rounded-xs cursor-pointer font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-[#FF3B30]" />
                          <span>Top 3 Latest Laptops</span>
                        </span>
                        <ChevronRight className="h-3 w-3 text-neutral-400" />
                      </button>

                      <button 
                        onClick={() => handleAnchorClick('home', 'curated-workstations')}
                        className="w-full text-left py-1.5 px-2 flex items-center justify-between hover:text-[#FF3B30] hover:bg-[#F9F9F9] transition-all rounded-xs cursor-pointer font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <Laptop className="h-3.5 w-3.5 text-neutral-600" />
                          <span>Curated Workstations</span>
                        </span>
                        <ChevronRight className="h-3 w-3 text-neutral-400" />
                      </button>

                      <button 
                        onClick={() => handleAnchorClick('home', 'how-it-works')}
                        className="w-full text-left py-1.5 px-2 flex items-center justify-between hover:text-[#FF3B30] hover:bg-[#F9F9F9] transition-all rounded-xs cursor-pointer font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-neutral-600" />
                          <span>120-Point Testing Standard</span>
                        </span>
                        <ChevronRight className="h-3 w-3 text-neutral-400" />
                      </button>

                      <button 
                        onClick={() => handleAnchorClick('home', 'recently-delivered')}
                        className="w-full text-left py-1.5 px-2 flex items-center justify-between hover:text-[#FF3B30] hover:bg-[#F9F9F9] transition-all rounded-xs cursor-pointer font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <PackageCheck className="h-3.5 w-3.5 text-neutral-600" />
                          <span>Recently Delivered Units</span>
                        </span>
                        <ChevronRight className="h-3 w-3 text-neutral-400" />
                      </button>

                      <button 
                        onClick={() => handleAnchorClick('home', 'testimonials')}
                        className="w-full text-left py-1.5 px-2 flex items-center justify-between hover:text-[#FF3B30] hover:bg-[#F9F9F9] transition-all rounded-xs cursor-pointer font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span>Customer Reviews</span>
                        </span>
                        <ChevronRight className="h-3 w-3 text-neutral-400" />
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer inside Drawer (Lagos Store & Shipping Details) */}
              <div className="p-5 bg-neutral-50 border-t border-[#E5E5E5] space-y-3">
                <div className="flex items-start space-x-2.5">
                  <div className="p-1 bg-white border border-[#E5E5E5] rounded-xs mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-[#FF3B30]" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-[11px] text-[#111111] uppercase tracking-wider">
                      Lagos Store & Delivery
                    </h4>
                    <p className="font-sans text-[11px] text-[#6B6B6B] mt-0.5 leading-relaxed">
                      Lagos Mainland & Island express delivery.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <div className="p-1 bg-white border border-[#E5E5E5] rounded-xs mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-[#6B6B6B]" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-[11px] text-[#111111] uppercase tracking-wider">
                      Opening Hours
                    </h4>
                    <p className="font-mono text-[11px] text-[#6B6B6B] mt-0.5">
                      Mon - Sat: 9 AM - 6 PM
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
