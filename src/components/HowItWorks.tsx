import React from 'react';
import { Sparkles, CheckSquare, Eye } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'We source good devices',
      icon: <Sparkles className="h-5 w-5 text-[#FF3B30]" />,
      description: 'We selectively acquire high-end, clean corporate off-lease and certified single-owner laptops with zero structural damage.'
    },
    {
      number: '02',
      title: 'We test them',
      icon: <CheckSquare className="h-5 w-5 text-[#FF3B30]" />,
      description: 'Our engineers run a rigorous 45-point hardware inspection. Screens, keyboards, ports, thermals, and battery health are exhaustively verified.'
    },
    {
      number: '03',
      title: 'You buy what you see',
      icon: <Eye className="h-5 w-5 text-[#FF3B30]" />,
      description: 'We list the exact photographs, hardware diagnostics, and serial numbers. The unit you select is precisely the unit delivered.'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B30] font-bold">
            Uncompromising Standard
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#111111] mt-2 tracking-tight">
            Our Quality Check Flow
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#6B6B6B] mt-3 leading-relaxed">
            Every device in our catalog goes through an exhaustive verification sequence before it is authorized for purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mt-12 sm:mt-16">
          {steps.map((step) => (
            <div 
              key={step.number} 
              className="bg-white border border-[#E5E5E5] p-6 sm:p-8 relative flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#111111]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="bg-[#F7F7F7] p-2.5 rounded-none flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="font-mono text-3xl font-bold text-[#E5E5E5] select-none">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="font-display font-bold text-lg sm:text-xl text-[#111111] mt-6">
                  {step.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#6B6B6B] mt-3 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="h-1 bg-[#F7F7F7] w-full mt-8 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 bg-[#FF3B30] w-12 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
