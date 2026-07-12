import React from 'react';
import { ShieldCheck, BatteryCharging, RefreshCw } from 'lucide-react';

export default function TrustStrip() {
  const trustPoints = [
    {
      id: 1,
      icon: <ShieldCheck className="h-4 w-4 text-[#FF3B30] flex-shrink-0" />,
      text: 'Tested and working properly',
      description: '45-point comprehensive diagnostics passed'
    },
    {
      id: 2,
      icon: <BatteryCharging className="h-4 w-4 text-[#FF3B30] flex-shrink-0" />,
      text: 'Battery health checked',
      description: 'Guaranteed 80%+ peak runtime health'
    },
    {
      id: 3,
      icon: <RefreshCw className="h-4 w-4 text-[#FF3B30] flex-shrink-0" />,
      text: '48-hour to 3-day check guarantee',
      description: 'Full swap or refund on testing defects'
    }
  ];

  return (
    <section className="bg-white border-y border-[#E5E5E5] py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5]">
          {trustPoints.map((point, index) => (
            <div 
              key={point.id} 
              className={`flex items-center space-x-3.5 ${index > 0 ? 'pt-4 md:pt-0 md:pl-8' : ''}`}
            >
              <div className="bg-red-50 p-2 rounded-none flex items-center justify-center">
                {point.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-semibold text-sm text-[#111111]">
                  {point.text}
                </span>
                <span className="font-sans text-[11px] text-[#6B6B6B] mt-0.5">
                  {point.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
