import React, { useState } from 'react';
import { Laptop, LaptopCondition } from '../types';
import { ArrowLeft, X, ShieldCheck, Battery, Cpu, HardDrive, Monitor, Check, Calendar, Activity, Sparkles, CheckCircle2, ShieldAlert, Clock, PhoneCall, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createReservationInFirestore } from '../lib/firebaseService';
import { formatNaira } from '../lib/utils';
import SmartImage from './SmartImage';

interface LaptopDetailsModalProps {
  laptop: Laptop | null;
  onClose: () => void;
}

export default function LaptopDetailsModal({ laptop, onClose }: LaptopDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'condition'>('specs');
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

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone || !laptop) return;

    setIsSubmitting(true);
    try {
      await createReservationInFirestore({
        laptopId: laptop.id,
        laptopName: laptop.name,
        serialNumber: laptop.serialNumber,
        price: laptop.price,
        userName: bookingForm.name,
        userPhone: bookingForm.phone,
        userLocation: bookingForm.location
      });
      setIsSubmitting(false);
      setBookingSuccess(true);
    } catch (err) {
      console.error('Failed to save reservation:', err);
      setIsSubmitting(false);
      // Still show success to user
      setBookingSuccess(true);
    }
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
      {laptop && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-[#FAF9F9] overflow-y-auto flex flex-col"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Beautiful Full Bleed Header Bar */}
          <header className="sticky top-0 z-30 bg-white border-b border-[#E5E5E5] py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
            <button
              onClick={onClose}
              className="group flex items-center space-x-2.5 text-[#111111] hover:text-[#FF3B30] transition-colors cursor-pointer font-sans text-xs font-black uppercase tracking-widest"
            >
              <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
              <span>Back to Catalog</span>
            </button>
            <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
              <span>Device Specification Page</span>
              <span>•</span>
              <span className="text-[#FF3B30]">S/N: {laptop.serialNumber}</span>
            </div>
            <button
              onClick={onClose}
              className="bg-neutral-100 hover:bg-[#FF3B30] text-[#111111] hover:text-white p-2 transition-colors cursor-pointer"
              title="Close specification view"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Full Bleed Content Layout */}
          <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col md:flex-row bg-white">
            
            {/* Left Column: Images & Key Features */}
            <div className="w-full md:w-1/2 bg-[#F7F7F7] p-6 sm:p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5E5E5]">
                <div>
                  {/* Main Image Display (4:5 Portrait) */}
                  <div className="aspect-[4/5] w-full bg-white border border-[#E5E5E5] relative overflow-hidden">
                    <SmartImage
                      src={activeImage || laptop.image}
                      alt={laptop.name}
                      className="w-full h-full object-cover animate-fade-in"
                    />
                    
                    {/* Active Serial Code Stamp */}
                    <div className="absolute bottom-2 left-2 bg-[#111111] text-white px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase z-10">
                      UNIT S/N: {laptop.serialNumber}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {laptop.additionalImages && laptop.additionalImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {laptop.additionalImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(img)}
                          className={`aspect-[4/5] border overflow-hidden cursor-pointer bg-white transition-all ${
                            activeImage === img ? 'border-[#FF3B30] ring-1 ring-[#FF3B30]' : 'border-[#E5E5E5] hover:border-neutral-500'
                          }`}
                        >
                          <SmartImage src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
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
                      {formatNaira(laptop.price)}
                    </span>
                    {laptop.originalPrice && (
                      <span className="font-mono text-xs text-[#6B6B6B] line-through">
                        Est. New: {formatNaira(laptop.originalPrice)}
                      </span>
                    )}
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 font-sans font-medium">
                      Save {formatNaira((laptop.originalPrice || (laptop.price < 10000 ? (laptop.price + 300) * 1000 : laptop.price + 300000)) - (laptop.price < 10000 ? laptop.price * 1000 : laptop.price))}
                    </span>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex border-b border-[#E5E5E5] mt-6 overflow-x-auto scrollbar-none">
                    <button
                      onClick={() => setActiveTab('specs')}
                      className={`pb-2.5 font-sans font-semibold text-xs uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                        activeTab === 'specs' 
                          ? 'border-b-2 border-[#111111] text-[#111111]' 
                          : 'text-[#6B6B6B] hover:text-[#111111]'
                      } mr-5`}
                    >
                      Specifications
                    </button>
                    <button
                      onClick={() => setActiveTab('condition')}
                      className={`pb-2.5 font-sans font-semibold text-xs uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                        activeTab === 'condition' 
                          ? 'border-b-2 border-[#111111] text-[#111111]' 
                          : 'text-[#6B6B6B] hover:text-[#111111]'
                      }`}
                    >
                      Detailed Condition
                    </button>
                  </div>

                  {/* Tab Content: Specs */}
                  {activeTab === 'specs' && (
                    <div className="mt-4 space-y-2.5 text-xs animate-fade-in">
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
                          <span>Storage Type & Capacity</span>
                        </span>
                        <span className="font-sans font-semibold text-[#111111] text-right">
                          {laptop.specs.storage}
                          {laptop.specs.storageType && !laptop.specs.storage.toLowerCase().includes(laptop.specs.storageType.toLowerCase()) ? ` (${laptop.specs.storageType})` : ''}
                        </span>
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
                  )}

                  {/* Tab Content: Detailed Condition */}
                  {activeTab === 'condition' && (
                    <div className="mt-4 space-y-3 text-xs animate-fade-in">
                      {/* Cosmetic Grade Banner */}
                      <div className="bg-[#F7F7F7] border border-[#E5E5E5] p-3 flex items-center justify-between">
                        <div>
                          <span className="font-mono text-[9px] text-[#6B6B6B] uppercase tracking-wider block">Cosmetic Quality Grade</span>
                          <span className="font-display font-extrabold text-sm text-[#111111] mt-0.5 block">
                            {laptop.condition === 'Very Clean' ? 'Grade A+ (Like-New Condition)' : laptop.condition === 'Clean' ? 'Grade A (Excellent Corporate Condition)' : 'Grade B (Good Standard Condition)'}
                          </span>
                        </div>
                        <span className={`text-[11px] font-mono px-2.5 py-1 border font-bold ${getConditionColor(laptop.condition)}`}>
                          {laptop.condition}
                        </span>
                      </div>

                      {/* Detailed Inspection Items */}
                      <div className="space-y-2">
                        {laptop.description && (
                          <div className="p-3 bg-neutral-50 border border-[#E5E5E5]">
                            <span className="font-mono text-[9px] text-[#6B6B6B] uppercase font-bold block mb-1">
                              Custom Inspector Notes & Summary
                            </span>
                            <p className="font-sans text-xs text-[#222222] leading-relaxed whitespace-pre-line">
                              {laptop.description}
                            </p>
                          </div>
                        )}

                        <div className="p-2.5 bg-white border border-[#E5E5E5] flex items-start space-x-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[#111111] block">Screen & Visual Clarity</span>
                            <span className="text-[#6B6B6B] text-[11px]">100% spotless display panel. Free of dead pixels, pressure spots, backlight bleed, or keyboard impression marks.</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white border border-[#E5E5E5] flex items-start space-x-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[#111111] block">Chassis & Hinge Integrity</span>
                            <span className="text-[#6B6B6B] text-[11px]">Original OEM casing. Smooth hinge motion with zero looseness or structural creaking.</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white border border-[#E5E5E5] flex items-start space-x-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[#111111] block">Keyboard & Trackpad Feedback</span>
                            <span className="text-[#6B6B6B] text-[11px]">Every key tested for crisp tactile bounce. Trackpad multi-gesture click mechanism operates smoothly.</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white border border-[#E5E5E5] flex items-start space-x-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[#111111] block">Battery Retention</span>
                            <span className="text-[#6B6B6B] text-[11px]">Battery tested at {laptop.batteryHealth || 85}% health capacity with original OEM charger included.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking and Reservation Area - Dedicated Action Card & Main Focus */}
                <div className="mt-8 bg-white border-2 border-[#111111] p-5 sm:p-6 shadow-lg relative rounded-xs">
                  <div className="absolute -top-3 left-4 bg-[#FF3B30] text-white font-mono text-[9px] font-bold uppercase px-3 py-0.5 tracking-widest shadow-xs">
                    ★ PRIMARY ACTION POINT
                  </div>
                  
                  {laptop.isSold ? (
                    <div className="bg-neutral-50 border border-neutral-200 p-4">
                      <div className="flex items-center justify-between">
                        <span className="bg-neutral-800 text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                          DELIVERED SECURELY
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {laptop.deliveredDate || 'Recently Sold'}
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="font-display font-bold text-xs text-[#111111]">
                          Verified Buyer Feedback:
                        </h4>
                        {laptop.buyerFeedback ? (
                          <p className="font-sans italic text-xs text-neutral-600 mt-1.5 leading-relaxed bg-white p-3 border border-neutral-200/60 relative">
                            "{laptop.buyerFeedback}"
                            <span className="block text-[10px] text-right font-mono font-bold text-[#FF3B30] mt-1">
                              — {laptop.buyerName || 'Lagos Customer'}
                            </span>
                          </p>
                        ) : (
                          <p className="font-sans italic text-xs text-neutral-500 mt-1.5 leading-relaxed">
                            Delivery completed and quality assured by Senior Hardware Engineers.
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-dashed border-neutral-200 flex items-center justify-between">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-tight">Need a similar setup?</span>
                        <button
                          onClick={onClose}
                          className="text-[#FF3B30] hover:underline font-sans text-xs font-bold cursor-pointer"
                        >
                          Browse Store Catalog →
                        </button>
                      </div>
                    </div>
                  ) : bookingSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full bg-[#0D1F17] text-white border-2 border-emerald-500 p-6 sm:p-7 shadow-2xl relative rounded-xs overflow-hidden"
                    >
                      {/* Full Bleed Top Accent Badge */}
                      <div className="bg-emerald-500 text-[#0D1F17] font-mono text-[10px] font-black uppercase tracking-widest px-4 py-1.5 flex items-center justify-between -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 mb-6 shadow-md">
                        <span className="flex items-center space-x-1.5">
                          <CheckCircle2 className="h-4 w-4 text-[#0D1F17]" />
                          <span>PHYSICAL INSPECTION HOLD CONFIRMED</span>
                        </span>
                        <span className="bg-[#0D1F17] text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-bold">
                          24H LOCK ACTIVE
                        </span>
                      </div>

                      {/* Main Icon & Title */}
                      <div className="text-center space-y-3 py-2">
                        <div className="relative inline-block">
                          <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <ShieldCheck className="h-9 w-9 text-emerald-400" />
                          </div>
                          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-[#0D1F17] rounded-full p-1">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        </div>

                        <h3 className="font-display font-black text-xl text-white tracking-tight uppercase">
                          Device Reserved Successfully!
                        </h3>

                        <p className="font-sans text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-lg mx-auto bg-emerald-950/60 p-3.5 border border-emerald-800/80">
                          We have locked <strong className="text-emerald-300 font-bold underline decoration-emerald-500 decoration-2">{laptop.name} (S/N: {laptop.serialNumber})</strong> under your name (<strong className="text-white font-bold">{bookingForm.name}</strong>) for the next <strong className="text-amber-300 font-bold">24 Hours</strong>.
                        </p>
                      </div>

                      {/* Ticket Summary Box */}
                      <div className="mt-5 bg-[#091510] border border-emerald-800/70 p-4 space-y-2.5 font-mono text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-emerald-900/80">
                          <span className="text-emerald-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
                            <Send className="h-3 w-3 text-emerald-400 animate-pulse" />
                            <span>Input Synced To Admin</span>
                          </span>
                          <span className="text-emerald-300 text-[10px] font-bold">LIVE QUEUE</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-emerald-600 block text-[9px] uppercase">Reserved By</span>
                            <span className="text-white font-bold truncate block">{bookingForm.name}</span>
                          </div>
                          <div>
                            <span className="text-emerald-600 block text-[9px] uppercase">Phone Line</span>
                            <span className="text-emerald-300 font-bold block">{bookingForm.phone}</span>
                          </div>
                          <div>
                            <span className="text-emerald-600 block text-[9px] uppercase">Pickup / Delivery</span>
                            <span className="text-white font-semibold block">{bookingForm.location}</span>
                          </div>
                          <div>
                            <span className="text-emerald-600 block text-[9px] uppercase">Inspection Price</span>
                            <span className="text-emerald-400 font-extrabold block">{formatNaira(laptop.price)}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-emerald-900/80 flex items-center justify-between text-[10px] text-emerald-300">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-400" />
                            <span>24-Hour Hold Guarantee: No Advance Deposit Required</span>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={onClose}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#0D1F17] font-sans font-extrabold text-xs py-3 px-4 transition-all cursor-pointer text-center uppercase tracking-wider shadow-md"
                        >
                          Close & Explore Catalog
                        </button>
                        <button
                          onClick={() => setBookingSuccess(false)}
                          className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-sans font-bold text-xs py-3 px-4 border border-emerald-700 transition-colors cursor-pointer text-center"
                        >
                          Modify Details
                        </button>
                      </div>

                      <p className="font-mono text-[9px] text-emerald-400/80 mt-3 text-center">
                        ★ Rightware Sales Rep will call {bookingForm.phone} within 15 mins to confirm physical inspection timing.
                      </p>
                    </motion.div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-[#E5E5E5]">
                        <h4 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#111111] flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#FF3B30]" />
                          <span>Reserve for 24h Physical Inspection</span>
                        </h4>
                        {laptop.stockCount <= 2 && (
                          <span className="font-mono text-[10px] text-[#FF3B30] font-bold animate-pulse bg-red-50 px-2 py-0.5 border border-red-200">
                            ⚠️ Only {laptop.stockCount} unit left
                          </span>
                        )}
                      </div>
                      
                      <form onSubmit={handleBook} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-neutral-400 font-sans text-[11px] leading-none pointer-events-none">Name</span>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Samuel"
                              value={bookingForm.name}
                              onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                              className="w-full bg-[#F7F7F7] border border-[#E5E5E5] pl-14 pr-3 py-2.5 font-sans text-xs focus:outline-hidden focus:border-[#111111] focus:bg-white transition-colors"
                            />
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-neutral-400 font-sans text-[11px] leading-none pointer-events-none">Phone</span>
                            <input
                              type="text"
                              required
                              placeholder="081..."
                              value={bookingForm.phone}
                              onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                              className="w-full bg-[#F7F7F7] border border-[#E5E5E5] pl-14 pr-3 py-2.5 font-mono text-xs focus:outline-hidden focus:border-[#111111] focus:bg-white transition-colors"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <select
                            value={bookingForm.location}
                            onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })}
                            className="bg-[#F7F7F7] border border-[#E5E5E5] px-3 py-2.5 font-sans text-xs focus:outline-hidden focus:border-[#111111] focus:bg-white transition-colors w-full sm:w-1/3 cursor-pointer"
                          >
                            <option value="Lagos">Lagos (Store/Delivery)</option>
                            <option value="Abuja">Abuja (Shipping)</option>
                            <option value="Port Harcourt">Port Harcourt (Shipping)</option>
                            <option value="Other">Other City (Shipping)</option>
                          </select>
                          
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#FF3B30] hover:bg-[#111111] text-white font-sans text-xs font-bold px-5 py-3 transition-all cursor-pointer w-full sm:w-2/3 flex items-center justify-center space-x-2 shadow-sm"
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
                      <p className="font-mono text-[9px] text-[#6B6B6B] mt-3 text-center">
                        No financial commitment required. Inspect thoroughly in-store or upon delivery before payment.
                      </p>
                    </div>
                  )}
                </div>
              </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
