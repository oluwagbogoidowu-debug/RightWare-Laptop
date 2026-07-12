import React from 'react';
import { FilterBudget, FilterBrand, FilterUse } from '../types';
import { DollarSign, Cpu, Laptop, GraduationCap, Briefcase, Palette } from 'lucide-react';

interface ShopBySectionProps {
  onSelectFilter: (type: 'budget' | 'brand' | 'use', value: any) => void;
  activeBudget: FilterBudget;
  activeBrand: FilterBrand;
  activeUse: FilterUse;
}

export default function ShopBySection({ onSelectFilter, activeBudget, activeBrand, activeUse }: ShopBySectionProps) {
  const budgets: { label: string; value: FilterBudget; desc: string }[] = [
    { label: 'Under $400', value: 'under-400', desc: 'Highly affordable student laptops' },
    { label: '$400 - $700', value: '400-700', desc: 'Standard business & coding workhorses' },
    { label: '$700 - $1000', value: '700-1000', desc: 'High performance & modern designs' },
    { label: '$1000+', value: 'above-1000', desc: 'Premium workstation & flagship units' }
  ];

  const brands: { name: FilterBrand; count: number; image: string }[] = [
    { name: 'Apple', count: 2, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80' },
    { name: 'Lenovo', count: 2, image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=300&q=80' },
    { name: 'Dell', count: 2, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=300&q=80' },
    { name: 'HP', count: 2, image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=300&q=80' }
  ];

  const uses: { label: FilterUse; icon: React.ReactNode; desc: string }[] = [
    { label: 'School', icon: <GraduationCap className="h-5 w-5 text-[#FF3B30]" />, desc: 'Lightweight, long battery, perfect for writing & slides' },
    { label: 'Work', icon: <Briefcase className="h-5 w-5 text-[#FF3B30]" />, desc: 'Elite processors, extreme reliability, coding & spreadsheets' },
    { label: 'Design', icon: <Palette className="h-5 w-5 text-[#FF3B30]" />, desc: 'Vibrant color-accurate displays, powerful graphic rendering' }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B30] font-bold">
            Tailored Matching
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#111111] mt-2 tracking-tight">
            Shop by Category
          </h2>
          <p className="font-sans text-sm text-[#6B6B6B] mt-2">
            Narrow down your search instantly by choosing your specific target budget, brand preference, or main application.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12 sm:mt-16">
          
          {/* Shop By Use Section */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-[#111111] flex items-center space-x-2 pb-2 border-b border-[#E5E5E5]">
              <span className="text-[#FF3B30] font-mono text-sm">[A]</span>
              <span>Browse by Use Case</span>
            </h3>
            <div className="space-y-3">
              {uses.map((use) => (
                <button
                  key={use.label}
                  onClick={() => onSelectFilter('use', use.label)}
                  className={`w-full text-left p-4 border transition-all flex items-start space-x-3.5 cursor-pointer ${
                    activeUse === use.label 
                      ? 'border-[#FF3B30] bg-[#FF3B30]/5 shadow-xs' 
                      : 'border-[#E5E5E5] hover:border-[#111111] hover:bg-neutral-50'
                  }`}
                >
                  <div className="bg-white p-2 border border-[#E5E5E5] flex-shrink-0">
                    {use.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-display font-bold text-sm text-[#111111] flex items-center justify-between">
                      <span>{use.label} Purpose</span>
                      {activeUse === use.label && (
                        <span className="text-[10px] font-mono text-[#FF3B30] font-bold uppercase tracking-wider">Active</span>
                      )}
                    </span>
                    <p className="font-sans text-[11px] text-[#6B6B6B] mt-1 leading-relaxed">
                      {use.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Shop By Budget Section */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-[#111111] flex items-center space-x-2 pb-2 border-b border-[#E5E5E5]">
              <span className="text-[#FF3B30] font-mono text-sm">[B]</span>
              <span>Browse by Budget</span>
            </h3>
            <div className="space-y-3">
              {budgets.map((b) => (
                <button
                  key={b.value}
                  onClick={() => onSelectFilter('budget', b.value)}
                  className={`w-full text-left p-4 border transition-all flex items-start space-x-3.5 cursor-pointer ${
                    activeBudget === b.value 
                      ? 'border-[#FF3B30] bg-[#FF3B30]/5 shadow-xs' 
                      : 'border-[#E5E5E5] hover:border-[#111111] hover:bg-neutral-50'
                  }`}
                >
                  <div className="bg-white p-2 border border-[#E5E5E5] flex-shrink-0 font-mono text-xs font-black text-[#FF3B30]">
                    $$
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-display font-bold text-sm text-[#111111] flex items-center justify-between">
                      <span>{b.label}</span>
                      {activeBudget === b.value && (
                        <span className="text-[10px] font-mono text-[#FF3B30] font-bold uppercase tracking-wider">Active</span>
                      )}
                    </span>
                    <p className="font-sans text-[11px] text-[#6B6B6B] mt-1 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Shop By Brand Section */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-[#111111] flex items-center space-x-2 pb-2 border-b border-[#E5E5E5]">
              <span className="text-[#FF3B30] font-mono text-sm">[C]</span>
              <span>Browse by Manufacturer</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {brands.map((br) => (
                <button
                  key={br.name}
                  onClick={() => onSelectFilter('brand', br.name)}
                  className={`relative aspect-square border overflow-hidden p-3 flex flex-col justify-between text-left transition-all group cursor-pointer ${
                    activeBrand === br.name 
                      ? 'border-[#FF3B30] ring-1 ring-[#FF3B30]' 
                      : 'border-[#E5E5E5] hover:border-[#111111]'
                  }`}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={br.image} 
                      alt={br.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-[0.8] grayscale group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  </div>

                  <div className="z-10 flex justify-between items-start w-full">
                    <span className="font-display font-black text-white text-base sm:text-lg tracking-tight">
                      {br.name}
                    </span>
                    {activeBrand === br.name && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B30]" />
                    )}
                  </div>

                  <div className="z-10 w-full flex items-baseline justify-between">
                    <span className="font-sans text-[10px] text-[#E5E5E5]">
                      Premium Stock
                    </span>
                    <span className="font-mono text-xs font-bold text-white bg-[#FF3B30] px-1.5 py-0.5 rounded-none">
                      {br.count} units
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
