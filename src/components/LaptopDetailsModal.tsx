import React, { useState } from 'react';
import { Laptop, LaptopCondition } from '../types';
import { X, ShieldCheck, Battery, Cpu, CpuIcon, HardDrive, Monitor, Check, Calendar, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LaptopDetailsModalProps {
  laptop: Laptop | null;
  onClose: () => void;
}

export default function LaptopDetailsModal({ laptop, onClose }: LaptopDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'diagnostics'>('specs');
  const [activeImage, setActiveImage] = useState<string>('');
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', location: 'Lagos' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize active image when laptop changes
  React.useEffect(() => {
    if (laptop) {
      setActiveImage(laptop.image);
      setBookingSuccess(false);
      setBookingForm({ name: '', phone: '', location: 'Lagos' });
    }
  }, [laptop]);

  if (!laptop) return null;

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingSuccess(true);
    }, 800);
  };

  const diagnosticsList = [
    { name: 'Motherboard & Capacitors', status: 'Passed' },
    { name: 'Battery Integrity & Wear Ratio', status: 'Passed (80%+ Guaranteed)' },
    { name: 'Screen Backlight & Bad Pixels', status: 'Passed (No spots/bruises)' },
    { name: 'Keyboard Response (All keys)', status: 'Passed' },
    { name: 'USB, USB-C & Charging Ports', status: 'Passed' },
    { name: 'Wi-Fi, Bluetooth & Web Camera', status: 'Passed' },
    { name: 'Fan, Thermals & CPU Stress Test', status: 'Passed' },
    { name: 'SSD Health & Read/Write Speeds', status: 'Passed' },
  ];

  const getConditionColor = (cond: LaptopCondition) => {
    switch (cond) {
      case 'Very Clean': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Clean': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Good': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        />

        {/* Modal container */}
        <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative transform overflow-hidden bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-4xl border border-[#E5E5E5] flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-[#111111] text-white hover:bg-[#FF3B30] p-1.5 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left Column: Images & Key Features */}
            <div className="w-full md:w-1/2 bg-[#F7F7F7] p-6 flex flex-col justify-between border-r border-[#E5E5E5]">
              <div>
                {/* Main Image Display */}
                <div className="aspect-[4/3] w-full bg-white border border-[#E5E5E5] relative overflow-hidden">
                  <img
                    src={activeImage}
                    alt={laptop.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Active Serial Code Stamp */}
                  <div className="absolute bottom-2 left-2 bg-[#111111] text-white px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase">
                    UNIT S/N: {laptop.serialNumber}
                  </div>
                </div>

                {/* Thumbnails */}
                {laptop.additionalImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {laptop.additionalImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(img)}
                        className={`aspect-[4/3] border overflow-hidden cursor-pointer bg-white transition-all ${
                          activeImage === img ? 'border-[#FF3B30] ring-1 ring-[#FF3B30]' : 'border-[#E5E5E5] hover:border-neutral-500'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Verified Badge Details */}
              <div className="bg-white border border-[#E5E5E5] p-4 mt-6">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <span className="font-display font-bold text-xs text-[#111111] tracking-wide uppercase">
                    100% Verified Quality Checked
                  </span>
                </div>
                <p className="font-sans text-[11px] text-[#6B6B6B] mt-1.5 leading-relaxed">
                  Every electronic track, memory cell, and key mechanism on serial code <strong className="text-[#111111]">{laptop.serialNumber}</strong> has been logged as fully responsive.
                </p>
              </div>
            </div>

            {/* Right Column: Spec description and reservation */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-white">
              <div>
                {/* Brand & Title */}
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] text-[#6B6B6B] uppercase font-bold tracking-wider">
                    {laptop.brand} • {laptop.year} Model
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 border ${getConditionColor(laptop.condition)}`}>
                    {laptop.condition}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#111111] mt-1 tracking-tight">
                  {laptop.name}
                </h3>

                {/* Sub-Price details */}
                <div className="flex items-baseline space-x-3 mt-3">
                  <span className="font-mono text-2xl font-black text-[#FF3B30]">
                    ${laptop.price}
                  </span>
                  {laptop.originalPrice && (
                    <span className="font-mono text-xs text-[#6B6B6B] line-through">
                      Est. New: ${laptop.originalPrice}
                    </span>
                  )}
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 font-sans font-medium">
                    Save ${(laptop.originalPrice || laptop.price + 300) - laptop.price}
                  </span>
                </div>

                {/* Long description */}
                <p className="font-sans text-xs text-[#6B6B6B] mt-4 leading-relaxed">
                  {laptop.description}
                </p>

                {/* Tab Switcher */}
                <div className="flex border-b border-[#E5E5E5] mt-6">
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2.5 font-sans font-semibold text-xs uppercase tracking-wider cursor-pointer ${
                      activeTab === 'specs' 
                        ? 'border-b-2 border-[#111111] text-[#111111]' 
                        : 'text-[#6B6B6B] hover:text-[#111111]'
                    } mr-6`}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab('diagnostics')}
                    className={`pb-2.5 font-sans font-semibold text-xs uppercase tracking-wider cursor-pointer ${
                      activeTab === 'diagnostics' 
                        ? 'border-b-2 border-[#111111] text-[#111111]' 
                        : 'text-[#6B6B6B] hover:text-[#111111]'
                    }`}
                  >
                    Diagnostics Report
                  </button>
                </div>

                {/* Tab Content: Specs */}
                {activeTab === 'specs' ? (
                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#F0F0F0]">
                      <span className="text-[#6B6B6B] flex items-center space-x-2">
                        <Cpu className="h-3.5 w-3.5" />
                        <span>Processor</span>
                      </span>
                      <span className="font-sans font-semibold text-[#111111] text-right">{laptop.specs.cpu}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#F0F0F0]">
                      <span className="text-[#6B6B6B] flex items-center space-x-2">
                        <Battery className="h-3.5 w-3.5" />
                        <span>Memory (RAM)</span>
                      </span>
                      <span className="font-sans font-semibold text-[#111111] text-right">{laptop.specs.ram}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#F0F0F0]">
                      <span className="text-[#6B6B6B] flex items-center space-x-2">
                        <HardDrive className="h-3.5 w-3.5" />
                        <span>Storage (SSD)</span>
                      </span>
                      <span className="font-sans font-semibold text-[#111111] text-right">{laptop.specs.storage}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#F0F0F0]">
                      <span className="text-[#6B6B6B] flex items-center space-x-2">
                        <Monitor className="h-3.5 w-3.5" />
                        <span>Display Screen</span>
                      </span>
                      <span className="font-sans font-semibold text-[#111111] text-right">{laptop.specs.screen}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#F0F0F0]">
                      <span className="text-[#6B6B6B] flex items-center space-x-2">
                        <Battery className="h-3.5 w-3.5" />
                        <span>Battery Health</span>
                      </span>
                      <span className="font-mono font-bold text-[#FF3B30] text-right">{laptop.batteryNote}</span>
                    </div>
                  </div>
                ) : (
                  /* Tab Content: Diagnostics */
                  <div className="mt-4 space-y-2 text-xs">
                    {diagnosticsList.map((test, i) => (
                      <div key={i} className="flex justify-between items-center py-1 bg-[#F7F7F7] px-2.5">
                        <span className="font-sans text-[#111111]">{test.name}</span>
                        <span className="font-mono text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                          <Check className="h-3 w-3" />
                          <span>Passed</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Booking and Reservation Area */}
              <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
                {bookingSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-200 p-4 text-center"
                  >
                    <ShieldCheck className="h-7 w-7 text-emerald-600 mx-auto" />
                    <h4 className="font-display font-bold text-sm text-emerald-800 mt-2">
                      Device Reserved Successfully!
                    </h4>
                    <p className="font-sans text-xs text-emerald-700 mt-1 leading-relaxed">
                      We have locked <strong className="text-emerald-950 font-bold">{laptop.name} (S/N: {laptop.serialNumber})</strong> under your name for the next <strong className="font-bold">24 Hours</strong>.
                    </p>
                    <p className="font-mono text-[10px] text-emerald-600 mt-3 font-semibold">
                      Our sales rep will reach you at {bookingForm.phone} shortly.
                    </p>
                  </motion.div>
                ) : (
                  <div>
                    <div className="flex justify-between items-baseline mb-3">
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#111111]">
                        Reserve for 24h Physical Inspection
                      </h4>
                      {laptop.stockCount <= 2 && (
                        <span className="font-mono text-[10px] text-[#FF3B30] font-bold animate-pulse">
                          ⚠️ Only {laptop.stockCount} left in stock
                        </span>
                      )}
                    </div>
                    
                    <form onSubmit={handleBook} className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <span className="absolute left-2.5 top-2.5 text-neutral-400 font-sans text-[11px] leading-none pointer-events-none">Name</span>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Samuel"
                            value={bookingForm.name}
                            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                            className="w-full bg-[#F7F7F7] border border-[#E5E5E5] pl-11 pr-2.5 py-2 font-sans text-xs focus:outline-hidden focus:border-[#111111]"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2.5 text-neutral-400 font-sans text-[11px] leading-none pointer-events-none">Phone</span>
                          <input
                            type="tel"
                            required
                            placeholder="081..."
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                            className="w-full bg-[#F7F7F7] border border-[#E5E5E5] pl-11 pr-2.5 py-2 font-mono text-xs focus:outline-hidden focus:border-[#111111]"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <select
                          value={bookingForm.location}
                          onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })}
                          className="bg-[#F7F7F7] border border-[#E5E5E5] px-2.5 py-2.5 font-sans text-xs focus:outline-hidden focus:border-[#111111] w-1/3"
                        >
                          <option value="Lagos">Lagos (Store/Delivery)</option>
                          <option value="Abuja">Abuja (Shipping)</option>
                          <option value="Port Harcourt">Port Harcourt (Shipping)</option>
                          <option value="Other">Other City (Shipping)</option>
                        </select>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-sans text-xs font-semibold px-4 py-2.5 transition-colors cursor-pointer w-2/3 flex items-center justify-center space-x-2"
                        >
                          {isSubmitting ? (
                            <span>Reserving Unit...</span>
                          ) : (
                            <>
                              <Calendar className="h-4 w-4" />
                              <span>Hold Device & Book Inspection</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                    <p className="font-mono text-[9px] text-[#6B6B6B] mt-2 text-center">
                      No commitment required. Inspect thoroughly in-store or upon home delivery before payment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
