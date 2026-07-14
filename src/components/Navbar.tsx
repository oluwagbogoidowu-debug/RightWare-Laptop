import React, { useState } from 'react';
import { Menu, X, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../../assets/logo1.png';

interface NavbarProps {
  onScrollToLaptops: () => void;
  availableCount: number;
}

export default function Navbar({ onScrollToLaptops, availableCount }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScrollClick = () => {
    setMenuOpen(false);
    // Allow animation to complete or start before scrolling
    setTimeout(() => {
      onScrollToLaptops();
    }, 150);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F7F7]/95 backdrop-blur-md border-b border-[#E5E5E5] transition-all duration-200 py-4 sm:py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
        {/* Left spacer to ensure the Logo is perfectly centered */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 opacity-0 pointer-events-none" />

        {/* Centered Brand Logo */}
        <div className="flex items-center justify-center flex-grow">
          <img 
            src={logo} 
            alt="Store Logo" 
            className="h-14 sm:h-18 w-auto object-contain"
          />
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
              <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
                <img 
                  src={logo} 
                  alt="Store Logo" 
                  className="h-10 w-auto object-contain"
                />
                <button 
                  id="menu-close-btn"
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-[#111111] hover:bg-neutral-100 transition-all cursor-pointer rounded-sm border border-transparent hover:border-[#E5E5E5]"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-grow overflow-y-auto p-6 space-y-2">
                <button 
                  id="menu-link-browse"
                  onClick={handleScrollClick}
                  className="w-full text-left py-4 px-3 border-b border-[#F2F2F2] flex items-center justify-between text-lg font-sans font-semibold text-[#111111] hover:text-[#FF3B30] hover:bg-[#F9F9F9] transition-all rounded-sm cursor-pointer"
                >
                  <span>Browse Catalog</span>
                  <span className="bg-red-50 text-[#FF3B30] text-xs font-mono px-2 py-0.5 rounded-full font-bold">
                    {availableCount} Live
                  </span>
                </button>

                <a 
                  id="menu-link-standard"
                  href="#how-it-works" 
                  onClick={() => setMenuOpen(false)}
                  className="block py-4 px-3 border-b border-[#F2F2F2] text-lg font-sans font-semibold text-[#111111] hover:text-[#FF3B30] hover:bg-[#F9F9F9] transition-all rounded-sm"
                >
                  Our Standard
                </a>

                <a 
                  id="menu-link-recently"
                  href="#recently-delivered" 
                  onClick={() => setMenuOpen(false)}
                  className="block py-4 px-3 border-b border-[#F2F2F2] text-lg font-sans font-semibold text-[#111111] hover:text-[#FF3B30] hover:bg-[#F9F9F9] transition-all rounded-sm"
                >
                  Recently Delivered
                </a>

                <a 
                  id="menu-link-testimonials"
                  href="#testimonials" 
                  onClick={() => setMenuOpen(false)}
                  className="block py-4 px-3 border-b border-[#F2F2F2] text-lg font-sans font-semibold text-[#111111] hover:text-[#FF3B30] hover:bg-[#F9F9F9] transition-all rounded-sm"
                >
                  Reviews
                </a>
              </div>

              {/* Footer inside Drawer (Lagos Store & Shipping Details) */}
              <div className="p-6 bg-white border-t border-[#E5E5E5] space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-white border border-[#E5E5E5] rounded-xs mt-0.5">
                    <MapPin className="h-4 w-4 text-[#FF3B30]" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-xs text-[#111111] uppercase tracking-wider">
                      Lagos Store & Shipping
                    </h4>
                    <p className="font-sans text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                      Lagos Mainland & Island premium delivery services.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-white border border-[#E5E5E5] rounded-xs mt-0.5">
                    <Clock className="h-4 w-4 text-[#6B6B6B]" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-xs text-[#111111] uppercase tracking-wider">
                      Opening Hours
                    </h4>
                    <p className="font-mono text-xs text-[#6B6B6B] mt-1">
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
