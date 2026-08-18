import React from 'react';
import { TESTIMONIALS } from '../data';
import { Testimonial } from '../types';
import { Star, ShieldCheck, MessageSquarePlus, Sparkles } from 'lucide-react';
import SmartImage from './SmartImage';

interface TestimonialsProps {
  testimonials?: Testimonial[];
  onOpenReviewModal?: () => void;
}

export default function Testimonials({ testimonials, onOpenReviewModal }: TestimonialsProps) {
  // Only display testimonials that are approved/live on homepage
  const liveTestimonials = (testimonials || []).filter(
    (t) => t.isLive !== false && t.status !== 'pending' && t.status !== 'hidden'
  );

  const displayList = liveTestimonials.length > 0 ? liveTestimonials : TESTIMONIALS;

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-[#F7F7F7] border-t border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B30] font-bold">
              Customer Stories & Reviews
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#111111] mt-2 tracking-tight">
              Loved by Developers, Students & Creatives
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#6B6B6B] mt-2">
              Real feedback from verified buyers who purchased their daily workstations and laptops from Rightware.
            </p>
          </div>

          {onOpenReviewModal && (
            <button
              type="button"
              onClick={onOpenReviewModal}
              className="inline-flex items-center space-x-2 bg-[#111111] hover:bg-[#FF3B30] text-white font-sans text-xs font-bold px-5 py-3 transition-colors shadow-xs cursor-pointer shrink-0 self-start md:self-auto"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>Leave a Review / Share Your Experience</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
          {displayList.map((t) => (
            <div 
              key={t.id} 
              className="bg-white border border-[#E5E5E5] p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#FF3B30] text-[#FF3B30]" />
                    ))}
                  </div>

                  {t.verifiedPurchase && (
                    <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 flex items-center space-x-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>
                
                <p className="font-sans text-sm italic text-[#111111] mt-5 leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center space-x-3.5 pt-6 mt-6 border-t border-[#F0F0F0]">
                <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 border border-[#E5E5E5] bg-neutral-100">
                  <SmartImage
                    src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={t.name}
                    className="w-full h-full object-cover filter grayscale"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-sm text-[#111111] truncate flex items-center space-x-1">
                    <span>{t.name}</span>
                  </h4>
                  <p className="font-sans text-[11px] text-[#6B6B6B] truncate">
                    {t.role}
                  </p>
                  {t.laptopBought && (
                    <p className="font-mono text-[9px] text-[#FF3B30] mt-0.5 uppercase tracking-wider truncate">
                      Bought: {t.laptopBought}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
