import React from 'react';
import { Laptop, Phone, ShieldCheck, MapPin } from 'lucide-react';

interface NavbarProps {
  onScrollToLaptops: () => void;
  availableCount: number;
}

export default function Navbar({ onScrollToLaptops, availableCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#F7F7F7]/90 backdrop-blur-md border-b border-[#E5E5E5] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-[#111111] p-1.5 rounded-sm flex items-center justify-center">
            <Laptop className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-[#111111]">
              RELIABLE<span className="text-[#FF3B30]">.</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#6B6B6B] uppercase leading-none">
              Premium Used Laptops
            </span>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-sans font-medium text-[#6B6B6B]">
          <button 
            onClick={onScrollToLaptops}
            className="hover:text-[#111111] transition-colors cursor-pointer flex items-center space-x-2"
          >
            <span>Browse Catalog</span>
            <span className="bg-red-50 text-[#FF3B30] text-[11px] font-mono px-1.5 py-0.5 rounded-full font-bold">
              {availableCount} Live
            </span>
          </button>
          <a href="#how-it-works" className="hover:text-[#111111] transition-colors">Our Standard</a>
          <a href="#recently-delivered" className="hover:text-[#111111] transition-colors">Recently Delivered</a>
          <a href="#testimonials" className="hover:text-[#111111] transition-colors">Reviews</a>
        </nav>

        {/* Quick Contact & Action Badge */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex flex-col items-end text-xs text-[#6B6B6B] mr-1">
            <span className="flex items-center space-x-1 font-sans font-medium text-[#111111]">
              <MapPin className="h-3 w-3 text-[#FF3B30]" />
              <span>Lagos Store & Shipping</span>
            </span>
            <span className="font-mono text-[10px] mt-0.5 text-[#6B6B6B]">Mon - Sat: 9 AM - 6 PM</span>
          </div>
          
          <button
            onClick={onScrollToLaptops}
            className="bg-[#111111] hover:bg-[#111111]/90 active:bg-[#111111] text-white text-xs sm:text-sm font-sans font-medium px-4 py-2 sm:px-5 sm:py-2.5 transition-all cursor-pointer flex items-center space-x-2 rounded-none border border-[#111111]"
          >
            <ShieldCheck className="h-4 w-4 text-[#FF3B30]" />
            <span>Verified Stock</span>
          </button>
        </div>
      </div>
    </header>
  );
}
