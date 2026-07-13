import React from 'react';
import { Laptop, Phone, Mail, MapPin, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-[#E5E5E5] pt-16 pb-12 border-t border-[#FF3B30]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Store Logo" 
                className="h-10 sm:h-12 w-auto object-contain filter invert opacity-90"
              />
            </div>
            <p className="font-sans text-xs text-[#999999] leading-relaxed">
              Premium tested fairly used laptops. We believe tech should be transparent, durable, and affordable.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-mono text-[10px] text-[#999999] uppercase tracking-wider">
                Catalog updated today
              </span>
            </div>
          </div>

          {/* Quick Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider mb-4 border-l-2 border-[#FF3B30] pl-2.5">
              Contact Store
            </h4>
            <ul className="space-y-3 font-sans text-xs text-[#999999]">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-[#FF3B30] flex-shrink-0 mt-0.5" />
                <span>Suite 12B, Ground Floor, Computer Village, Ikeja, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-[#FF3B30] flex-shrink-0" />
                <span>+234 812 345 6789</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-[#FF3B30] flex-shrink-0" />
                <span>sales@reliablelaptops.com</span>
              </li>
            </ul>
          </div>

          {/* Store Guarantees */}
          <div>
            <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider mb-4 border-l-2 border-[#FF3B30] pl-2.5">
              Testing Guarantee
            </h4>
            <ul className="space-y-3 font-sans text-xs text-[#999999]">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-[#FF3B30] flex-shrink-0 mt-0.5" />
                <span>45-Point motherboard & battery testing standard.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-[#FF3B30] flex-shrink-0 mt-0.5" />
                <span>Honest battery reports (always 80%+ peak).</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-[#FF3B30] flex-shrink-0 mt-0.5" />
                <span>3-day swap policy if any testing issue is discovered.</span>
              </li>
            </ul>
          </div>

          {/* Legal and Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider mb-4 border-l-2 border-[#FF3B30] pl-2.5">
              Quick Support
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#999999]">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Our Testing Standards Checklist</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Client Delivery Verifications</a></li>
              <li><a href="#recently-delivered" className="hover:text-white transition-colors">Recently Handed Over Units</a></li>
              <li className="pt-2">
                <div className="bg-[#1A1A1A] p-2.5 border border-[#333333] flex items-center space-x-2">
                  <ShieldAlert className="h-4 w-4 text-[#FF3B30] flex-shrink-0" />
                  <span className="font-mono text-[10px] text-white">No generic stock photos used.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#333333] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between font-sans text-xs text-[#666666]">
          <p>© 2026 Reliable Laptops. All rights reserved. Premium Verified Stock.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0 font-mono text-[10px]">
            <span className="hover:text-white transition-colors">Sourced Responsibly</span>
            <span className="text-[#FF3B30]">•</span>
            <span className="hover:text-white transition-colors">Price Match Verified</span>
            <span className="text-[#FF3B30]">•</span>
            <span className="hover:text-white transition-colors">Testing Standard v4.5</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
