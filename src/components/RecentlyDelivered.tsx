import React from 'react';
import { Laptop } from '../types';
import { SOLD_LAPTOPS } from '../data';
import { ShieldCheck, Truck, MessageSquare } from 'lucide-react';

interface RecentlyDeliveredProps {
  soldLaptops?: Laptop[];
}

export default function RecentlyDelivered({ soldLaptops = SOLD_LAPTOPS }: RecentlyDeliveredProps) {
  return (
    <section id="recently-delivered" className="py-16 sm:py-24 bg-white border-t border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B30] font-bold">
            Transparent Track Record
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#111111] mt-2 tracking-tight">
            Recently Delivered Units
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#6B6B6B] mt-3">
            What you see is literally what you get. These premium units were recently hand-delivered to their new owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {soldLaptops.map((laptop) => (
            <div 
              key={laptop.id} 
              className="group flex flex-col justify-between bg-[#F7F7F7] border border-[#E5E5E5] p-4 relative"
            >
              {/* Product Visual Container with SOLD Overlay */}
              <div>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-white border border-[#E5E5E5]">
                  <img
                    src={laptop.image}
                    alt={laptop.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter grayscale group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* SOLD banner */}
                  <div className="absolute inset-0 bg-[#111111]/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-4">
                    <span className="font-display font-black text-2xl tracking-widest text-white border-2 border-white px-4 py-1 rotate-[-3deg]">
                      SOLD OUT
                    </span>
                    <span className="font-mono text-[10px] text-[#FF3B30] uppercase tracking-wider mt-3 font-semibold">
                      {laptop.deliveredDate}
                    </span>
                  </div>
                </div>

                {/* Laptop details */}
                <div className="mt-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#111111]">
                      {laptop.name}
                    </h3>
                    <p className="font-mono text-[11px] text-[#6B6B6B] mt-0.5">
                      Model Year: {laptop.year} • S/N: {laptop.serialNumber}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#6B6B6B] line-through">
                    ${laptop.price}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center space-x-2">
                  <span className="text-[10px] font-mono bg-white border border-[#E5E5E5] text-[#111111] px-2 py-0.5">
                    {laptop.condition} Condition
                  </span>
                  <span className="text-[10px] font-mono bg-white border border-[#E5E5E5] text-[#6B6B6B] px-2 py-0.5 truncate max-w-[180px]">
                    {laptop.specs.graphics || 'Integrated GPU'}
                  </span>
                </div>
              </div>

              {/* Delivery feedback block */}
              <div className="mt-6 pt-4 border-t border-[#E5E5E5] bg-white p-3.5 border border-dashed border-[#D4D4D4]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-xs text-[#111111] flex items-center space-x-1">
                    <span>Client: {laptop.buyerName}</span>
                  </span>
                  <span className="text-[10px] font-sans text-emerald-600 bg-emerald-50 px-2 py-0.5 font-medium flex items-center space-x-1">
                    <Truck className="h-3 w-3" />
                    <span>Delivered</span>
                  </span>
                </div>
                <p className="font-sans text-[11px] italic text-[#6B6B6B] leading-relaxed">
                  "{laptop.buyerFeedback}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
