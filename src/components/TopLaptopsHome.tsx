import React from 'react';
import { Laptop } from '../types';
import { formatNaira } from '../lib/utils';
import { ShieldCheck, Tag, Battery, ChevronRight, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import LaptopCardImageSlider from './LaptopCardImageSlider';

interface TopLaptopsHomeProps {
  topLaptops: Laptop[];
  onSelectLaptop: (laptop: Laptop) => void;
  onViewAll: () => void;
}

export default function TopLaptopsHome({
  topLaptops,
  onSelectLaptop,
  onViewAll
}: TopLaptopsHomeProps) {
  if (!topLaptops || topLaptops.length === 0) return null;

  const displayLaptops = topLaptops.slice(0, 3);

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Very Clean': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Clean': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Good': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <section id="top-3-laptops" className="py-12 sm:py-16 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-red-50 text-[#FF3B30] border border-red-100 px-3 py-1 text-xs font-mono font-bold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>LATEST INVENTORY ARRIVALS</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#111111] tracking-tight">
              Top 3 Available Laptops
            </h2>
          </div>

          <button
            onClick={onViewAll}
            className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-[#FF3B30] hover:text-[#FF3B30]/80 transition-colors cursor-pointer self-start md:self-auto group"
          >
            <span>See All Live Inventory</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Top 3 Laptop Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayLaptops.map((laptop, idx) => (
            <div
              key={laptop.id}
              onClick={() => onSelectLaptop(laptop)}
              className="group bg-[#FAF9F9] border border-[#E5E5E5] p-4 flex flex-col justify-between hover:border-[#111111] hover:bg-white hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 cursor-pointer relative"
            >
              {/* Top Badge Overlay */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold text-white bg-[#111111] px-2 py-0.5 tracking-wider uppercase">
                  #{idx + 1} TOP ARRIVAL
                </span>
                
                {/* Battery Guarantee Badge */}
                <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5">
                  <Battery className="h-3 w-3 text-emerald-600" />
                  <span>{laptop.batteryHealth}% Battery Health</span>
                </span>
              </div>

              {/* Image Container with Interactive Image Slider */}
              <LaptopCardImageSlider
                laptop={laptop}
                className="aspect-[4/5]"
                onCardClick={() => onSelectLaptop(laptop)}
              >
                {!laptop.isSold && laptop.stockCount <= 2 && (
                  <div className="absolute top-2 left-2 z-10 bg-[#FF3B30] text-white text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 flex items-center space-x-1 shadow-sm">
                    <Tag className="h-2.5 w-2.5 fill-white" />
                    <span>{laptop.stockCount === 1 ? 'ONLY 1 LEFT' : '2 UNITS LEFT'}</span>
                  </div>
                )}

                {laptop.inspectionPassed && (
                  <div className="absolute bottom-2 right-2 z-10 bg-[#111111]/85 text-white text-[8px] font-mono tracking-widest px-1.5 py-0.5 flex items-center space-x-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>45-PT PASSED</span>
                  </div>
                )}
              </LaptopCardImageSlider>

              {/* Information */}
              <div className="mt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-extrabold text-base text-[#111111] group-hover:text-[#FF3B30] transition-colors line-clamp-1">
                    {laptop.name}
                  </h3>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border flex-shrink-0 ${getConditionColor(laptop.condition)}`}>
                    {laptop.condition}
                  </span>
                </div>

                {/* Specs list */}
                <div className="bg-white p-2.5 text-xs space-y-1 border border-[#E5E5E5] font-sans">
                  <p className="text-[#111111] truncate">
                    <span className="font-mono text-neutral-400 text-[10px] font-medium mr-1">CPU:</span>
                    <strong className="font-semibold">{laptop.specs.cpu.split('(')[0]}</strong>
                  </p>
                  <p className="text-[#111111] truncate">
                    <span className="font-mono text-neutral-400 text-[10px] font-medium mr-1">SPECS:</span>
                    <span>{laptop.specs.ram} • {laptop.specs.storage}</span>
                  </p>
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="mt-5 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-[#6B6B6B] uppercase block">Price</span>
                  <span className="font-mono text-lg font-black text-[#FF3B30]">
                    {formatNaira(laptop.price)}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLaptop(laptop);
                  }}
                  className="bg-[#111111] group-hover:bg-[#FF3B30] text-white font-sans text-xs font-bold px-3.5 py-2 transition-colors flex items-center space-x-1"
                >
                  <span>Inspect Unit</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Fast assurance list below #3 Top Arrival card */}
        <div className="mt-8 pt-6 border-t border-[#E5E5E5] grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl text-xs font-mono text-[#6B6B6B]">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-[#FF3B30] flex-shrink-0" />
            <span>Real Photos of Exact Units</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-[#FF3B30] flex-shrink-0" />
            <span>Fully tested with no surprises</span>
          </div>
        </div>

      </div>
    </section>
  );
}
