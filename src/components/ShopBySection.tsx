import React, { useState, useEffect } from 'react';
import { FilterBudget, FilterBrand, FilterUse, Laptop } from '../types';
import { 
  Briefcase, 
  GraduationCap, 
  Code, 
  Layout, 
  Palette, 
  Video, 
  Box, 
  Gamepad2, 
  Radio, 
  BarChart3, 
  Cpu, 
  ShieldCheck, 
  Music, 
  Laptop as LaptopIcon,
  ChevronLeft, 
  ChevronRight, 
  Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { USE_CASE_OPTIONS } from './AdminPanel';

export function isUseCaseMatching(laptopCategory: string | undefined, targetUseCase: string): boolean {
  if (!laptopCategory || !targetUseCase) return false;
  if (targetUseCase === 'all') return true;
  const cat = laptopCategory.toLowerCase().trim();
  const target = targetUseCase.toLowerCase().trim();

  if (cat === target) return true;
  if (cat.includes(target) || target.includes(cat)) return true;

  if ((target.includes('school') || target.includes('student')) && (cat.includes('school') || cat.includes('student'))) return true;
  if ((target.includes('business') || target.includes('office') || target.includes('work')) && (cat.includes('work') || cat.includes('business') || cat.includes('office'))) return true;
  if ((target.includes('design') || target.includes('graphic') || target.includes('ui/ux')) && (cat.includes('design') || cat.includes('creative'))) return true;

  return false;
}

interface ShopBySectionProps {
  onSelectFilter: (type: 'budget' | 'brand' | 'use', value: any) => void;
  activeBudget: FilterBudget;
  activeBrand: FilterBrand;
  activeUse: FilterUse;
  activePage?: number;
  onPageChange?: (page: number) => void;
  laptops?: Laptop[];
}

export default function ShopBySection({
  onSelectFilter,
  activeBudget,
  activeBrand,
  activeUse,
  activePage = 0,
  onPageChange,
  laptops = []
}: ShopBySectionProps) {
  const [currentPage, setCurrentPage] = useState<number>(activePage);
  const [direction, setDirection] = useState<number>(0);
  const [useCaseSubPage, setUseCaseSubPage] = useState<number>(0);

  useEffect(() => {
    if (activePage !== undefined && activePage !== currentPage) {
      setDirection(activePage > currentPage ? 1 : -1);
      setCurrentPage(activePage);
    }
  }, [activePage]);

  const budgets: { label: string; value: FilterBudget; desc: string }[] = [
    { label: 'Under ₦400k', value: 'under-400', desc: 'Highly affordable student laptops' },
    { label: '₦400k - ₦700k', value: '400-700', desc: 'Standard business & coding workhorses' },
    { label: '₦700k - ₦1m', value: '700-1000', desc: 'High performance & modern designs' },
    { label: '₦1m+', value: 'above-1000', desc: 'Premium workstation & flagship units' }
  ];

  const brands: { name: FilterBrand; count: number; image: string }[] = [
    { name: 'Apple', count: 2, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80' },
    { name: 'Lenovo', count: 2, image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=300&q=80' },
    { name: 'Dell', count: 2, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=300&q=80' },
    { name: 'HP', count: 2, image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=300&q=80' }
  ];

  const useCaseIcons: Record<string, { icon: React.ReactNode; desc: string }> = {
    'Business / Office Work': {
      icon: <Briefcase className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'Spreadsheets, emails, video meetings & office suites'
    },
    'Student / School Use': {
      icon: <GraduationCap className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'Lightweight, long battery life for lectures & research'
    },
    'Programming / Development': {
      icon: <Code className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'High RAM & fast multi-core CPUs for compilation & Docker'
    },
    'UI/UX Design': {
      icon: <Layout className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'Figma, Adobe XD, crisp high-res color displays'
    },
    'Graphic Design': {
      icon: <Palette className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'Photoshop, Illustrator & color-accurate screen gamut'
    },
    'Video Editing': {
      icon: <Video className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'Premiere Pro, DaVinci Resolve & GPU rendering'
    },
    '3D Modeling / Animation': {
      icon: <Box className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'Blender, Maya, AutoCAD & heavy VRAM raytracing'
    },
    'Gaming': {
      icon: <Gamepad2 className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'Dedicated GPUs, high refresh rate displays & cooling'
    },
    'Streaming / Content Creation': {
      icon: <Radio className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'OBS recording, multi-tasking & webcam encoding'
    },
    'Data Analysis': {
      icon: <BarChart3 className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'Python, R, Excel power queries & big dataset RAM'
    },
    'Machine Learning / AI': {
      icon: <Cpu className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'CUDA cores, Neural Engines & heavy local LLM inference'
    },
    'Cybersecurity / Networking': {
      icon: <ShieldCheck className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'Virtual machines, Wireshark & security lab tools'
    },
    'Music Production': {
      icon: <Music className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'FL Studio, Logic Pro, low-latency audio processing'
    },
    'General Everyday Use': {
      icon: <LaptopIcon className="h-4 w-4 text-[#FF3B30]" />,
      desc: 'Web browsing, media streaming & daily home tasks'
    }
  };

  const handlePageChange = (newPage: number) => {
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
    if (onPageChange) onPageChange(newPage);
  };

  const handleNext = () => {
    setDirection(1);
    const nextPage = (currentPage + 1) % 3;
    setCurrentPage(nextPage);
    if (onPageChange) onPageChange(nextPage);
  };

  const handlePrev = () => {
    setDirection(-1);
    const prevPage = (currentPage - 1 + 3) % 3;
    setCurrentPage(prevPage);
    if (onPageChange) onPageChange(prevPage);
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 40;
    if (info.offset.x < -threshold) {
      handleNext();
    } else if (info.offset.x > threshold) {
      handlePrev();
    }
  };

  const getHeaderDetails = () => {
    switch (currentPage) {
      case 0:
        return {
          tag: '[A] Workflows',
          title: 'Browse by Use Case',
          desc: 'Select a primary use case configured from laptop setup.'
        };
      case 1:
        return {
          tag: '[B] Price Tiers',
          title: 'Browse by Budget',
          desc: 'Choose your budget tier with guaranteed value.'
        };
      case 2:
      default:
        return {
          tag: '[C] Manufacturers',
          title: 'Browse by Brand',
          desc: 'Certified high-performance devices from top builders.'
        };
    }
  };

  const activeHeader = getHeaderDetails();

  // Calculate 4 by 4 pagination items for Use Cases
  const totalUseCaseSubPages = Math.ceil(USE_CASE_OPTIONS.length / 4);
  const currentUseCases = USE_CASE_OPTIONS.slice(useCaseSubPage * 4, (useCaseSubPage + 1) * 4);

  return (
    <section id="shop-by-section" className="py-16 sm:py-24 bg-white border-t border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Main Section Header */}
        <div className="text-center max-w-2xl mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#111111] tracking-tight">
            Shop by Category
          </h2>
        </div>

        {/* Swipe Card Container */}
        <div className="w-full max-w-2xl relative">
          
          {/* Card Body */}
          <div className="bg-white border border-[#E5E5E5] p-6 sm:p-8 shadow-xs relative overflow-hidden min-h-[460px] flex flex-col justify-between select-none">
            
            {/* Pagination Dots in Top Right */}
            <div className="absolute top-6 right-6 flex items-center space-x-1.5 z-20">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => handlePageChange(idx)}
                  className={`h-2 w-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentPage === idx 
                      ? 'bg-[#FF3B30] w-4' 
                      : 'bg-neutral-300 hover:bg-neutral-500'
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>

            {/* Slider Content */}
            <div className="flex-1 flex flex-col justify-between">
              
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 40 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="cursor-grab active:cursor-grabbing touch-pan-y flex-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Active Tab Header */}
                    <div className="mb-6 pr-16">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF3B30] font-black block">
                        {activeHeader.tag}
                      </span>
                      <h3 className="font-display font-bold text-xl text-[#111111] mt-1 tracking-tight">
                        {activeHeader.title}
                      </h3>
                      <p className="font-sans text-xs text-[#6B6B6B] mt-1.5">
                        {activeHeader.desc}
                      </p>
                    </div>

                    {/* Active Tab Elements */}
                    <div className="space-y-3">
                      
                      {/* PAGE 0: Browse by Use Case (Listed 4 by 4 with Real-time count & See More button) */}
                      {currentPage === 0 && (
                        <div className="space-y-3">
                          <div className="space-y-2.5">
                            {currentUseCases.map((useCaseName) => {
                              const meta = useCaseIcons[useCaseName] || {
                                icon: <LaptopIcon className="h-4 w-4 text-[#FF3B30]" />,
                                desc: 'High-performance laptop workstation'
                              };

                              const isSelected = activeUse === useCaseName;

                              // Real-time connected laptops count
                              const connectedCount = laptops.filter(
                                (l) => l.isForSale !== false && !l.isSold && isUseCaseMatching(l.useCategory, useCaseName)
                              ).length;

                              return (
                                <div
                                  key={useCaseName}
                                  onClick={() => onSelectFilter('use', useCaseName)}
                                  className={`w-full text-left p-3.5 border transition-all flex items-center justify-between cursor-pointer group ${
                                    isSelected 
                                      ? 'border-[#FF3B30] bg-[#FF3B30]/5 shadow-xs' 
                                      : 'border-[#E5E5E5] hover:border-[#111111] hover:bg-neutral-50'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-3">
                                    <div className="bg-white p-2 border border-[#E5E5E5] flex-shrink-0 group-hover:border-[#FF3B30] transition-colors">
                                      {meta.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                        <span className="font-display font-bold text-xs sm:text-sm text-[#111111] truncate">
                                          {useCaseName}
                                        </span>
                                        {connectedCount > 0 && (
                                          <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-mono text-[9px] font-bold">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>{connectedCount} connected</span>
                                          </span>
                                        )}
                                      </div>
                                      <p className="font-sans text-[11px] text-[#6B6B6B] mt-0.5 truncate">
                                        {meta.desc}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Active check mark or arrow indicator */}
                                  {isSelected && (
                                    <span className="flex-shrink-0 text-[10px] font-mono font-bold px-2.5 py-1 bg-[#FF3B30] text-white flex items-center space-x-1 shadow-2xs">
                                      <Check className="h-3 w-3" />
                                      <span>Selected</span>
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* 4 BY 4 NEXT AND PREVIOUS PAGINATION */}
                          <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5] text-xs font-mono">
                            <button
                              type="button"
                              disabled={useCaseSubPage === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setUseCaseSubPage((prev) => Math.max(0, prev - 1));
                              }}
                              className={`flex items-center space-x-1 px-3 py-1.5 border transition-colors cursor-pointer ${
                                useCaseSubPage === 0
                                  ? 'opacity-30 cursor-not-allowed border-[#E5E5E5] text-neutral-400'
                                  : 'border-[#111111] text-[#111111] hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30]'
                              }`}
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                              <span>Previous</span>
                            </button>

                            <span className="font-bold text-[11px] text-[#111111]">
                              {useCaseSubPage + 1} of {totalUseCaseSubPages}
                            </span>

                            <button
                              type="button"
                              disabled={useCaseSubPage >= totalUseCaseSubPages - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                setUseCaseSubPage((prev) => Math.min(totalUseCaseSubPages - 1, prev + 1));
                              }}
                              className={`flex items-center space-x-1 px-3 py-1.5 border transition-colors cursor-pointer ${
                                useCaseSubPage >= totalUseCaseSubPages - 1
                                  ? 'opacity-30 cursor-not-allowed border-[#E5E5E5] text-neutral-400'
                                  : 'border-[#111111] text-[#111111] hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30]'
                              }`}
                            >
                              <span>Next</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* PAGE 1: Browse by Budget */}
                      {currentPage === 1 && (
                        <div className="space-y-2.5">
                          {budgets.map((b) => {
                            const isSelected = activeBudget === b.value;
                            return (
                              <button
                                key={b.value}
                                onClick={() => onSelectFilter('budget', b.value)}
                                className={`w-full text-left p-3.5 border transition-all flex items-start space-x-3.5 cursor-pointer ${
                                  isSelected 
                                    ? 'border-[#FF3B30] bg-[#FF3B30]/5 shadow-xs' 
                                    : 'border-[#E5E5E5] hover:border-[#111111] hover:bg-neutral-50'
                                }`}
                              >
                                <div className="bg-white p-2 border border-[#E5E5E5] flex-shrink-0 font-mono text-[11px] font-black text-[#FF3B30] h-9 w-9 flex items-center justify-center">
                                  ₦
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-display font-bold text-xs sm:text-sm text-[#111111] flex items-center justify-between">
                                    <span>{b.label}</span>
                                    {isSelected && (
                                      <span className="text-[10px] font-mono text-[#FF3B30] font-bold uppercase tracking-wider flex items-center space-x-1">
                                        <Check className="h-3 w-3 inline" />
                                        <span>Active</span>
                                      </span>
                                    )}
                                  </span>
                                  <p className="font-sans text-[11px] text-[#6B6B6B] mt-1 leading-relaxed">
                                    {b.desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* PAGE 2: Browse by Manufacturer */}
                      {currentPage === 2 && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          {brands.map((br) => {
                            const isSelected = activeBrand === br.name;
                            return (
                              <button
                                key={br.name}
                                onClick={() => onSelectFilter('brand', br.name)}
                                className={`relative aspect-[1.3/1] border overflow-hidden p-3.5 flex flex-col justify-between text-left transition-all group cursor-pointer ${
                                  isSelected 
                                    ? 'border-[#FF3B30] ring-1 ring-[#FF3B30]' 
                                    : 'border-[#E5E5E5] hover:border-[#111111]'
                                }`}
                              >
                                {/* Background Image with overlays */}
                                <div className="absolute inset-0 z-0">
                                  <img 
                                    src={br.image} 
                                    alt={br.name} 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover filter brightness-[0.7] grayscale group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/45 group-hover:bg-black/55 transition-colors" />
                                </div>

                                <div className="z-10 flex justify-between items-start w-full">
                                  <span className="font-display font-black text-white text-base tracking-tight">
                                    {br.name}
                                  </span>
                                  {isSelected && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B30]" />
                                  )}
                                </div>

                                <div className="z-10 w-full flex items-baseline justify-between">
                                  <span className="font-sans text-[9px] text-[#D4D4D4]">
                                    Premium Stock
                                  </span>
                                  <span className="font-mono text-[10px] font-bold text-white bg-[#FF3B30] px-1.5 py-0.5">
                                    {br.count} units
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Swipe/Navigate Bottom Controls */}
              <div className="mt-8 pt-4 border-t border-[#F0F0F0] flex items-center justify-between">
                <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">
                  ← Swipe or Drag Left/Right to Switch →
                </span>

                <div className="flex space-x-2">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 border border-[#E5E5E5] hover:border-[#111111] hover:bg-neutral-50 text-[#111111] transition-colors cursor-pointer"
                    aria-label="Previous Category"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1.5 border border-[#E5E5E5] hover:border-[#111111] hover:bg-neutral-50 text-[#111111] transition-colors cursor-pointer"
                    aria-label="Next Category"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
