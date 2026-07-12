import React from 'react';
import { TESTIMONIALS } from '../data';
import { Star, ShieldCheck } from 'lucide-react';

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-[#F7F7F7] border-t border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B30] font-bold">
            Customer Stories
          </span>
          <h2 className="font-display font-bold text-3xl text-[#111111] mt-2 tracking-tight">
            Loved by Developers, Students & Creatives
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#6B6B6B] mt-2">
            Real feedback from buyers who purchased their reliable daily workstations from us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
          {TESTIMONIALS.map((t) => (
            <div 
              key={t.id} 
              className="bg-white border border-[#E5E5E5] p-6 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#FF3B30] text-[#FF3B30]" />
                  ))}
                </div>
                
                <p className="font-sans text-sm italic text-[#111111] mt-5 leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center space-x-3.5 pt-6 mt-6 border-t border-[#F0F0F0]">
                <img
                  src={t.avatar}
                  alt={t.name}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover filter grayscale"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-sm text-[#111111] truncate flex items-center space-x-1">
                    <span>{t.name}</span>
                    {t.verifiedPurchase && (
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 fill-emerald-50 flex-shrink-0" />
                    )}
                  </h4>
                  <p className="font-sans text-[11px] text-[#6B6B6B] truncate">
                    {t.role}
                  </p>
                  <p className="font-mono text-[9px] text-[#FF3B30] mt-0.5 uppercase tracking-wider">
                    Bought: {t.laptopBought}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
