import React, { useState, useRef } from 'react';
import { Laptop } from '../types';
import SmartImage from './SmartImage';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LaptopCardImageSliderProps {
  laptop: Laptop;
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
  onCardClick?: () => void;
}

export default function LaptopCardImageSlider({
  laptop,
  className = '',
  imageClassName = '',
  children,
  onCardClick
}: LaptopCardImageSliderProps) {
  // Collect all unique non-empty image URLs
  const images = Array.from(
    new Set([laptop.image, ...(laptop.additionalImages || [])])
  ).filter(Boolean);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');

  // Touch & Drag Handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const totalImages = images.length;
  const currentImage = images[currentIndex] || laptop.image;

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (totalImages <= 1) return;
    setDirection('left');
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (totalImages <= 1) return;
    setDirection('right');
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging.current) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current || touchStartX.current === null || touchEndX.current === null) {
      isDragging.current = false;
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35; // px

    if (Math.abs(distance) > minSwipeDistance) {
      // Prevent parent click if it was a swipe
      e.stopPropagation();
      if (distance > 0) {
        // Swiped Left -> reveal next image
        nextSlide();
      } else {
        // Swiped Right -> reveal previous image
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
    isDragging.current = false;
  };

  return (
    <div
      className={`relative aspect-[4/5] w-full overflow-hidden bg-[#F7F7F7] border border-[#E5E5E5] group/slider select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (!isDragging.current && onCardClick) {
          onCardClick();
        }
      }}
    >
      {/* Animated Image Slider container */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0.8, x: direction === 'left' ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0.8, x: direction === 'left' ? -40 : 40 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full h-full"
        >
          <SmartImage
            src={currentImage}
            alt={`${laptop.name} view ${currentIndex + 1}`}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out filter grayscale-[0.05] ${imageClassName}`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Chevron Buttons (Visible on hover when multiple images exist) */}
      {totalImages > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous photo"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 bg-[#111111]/70 hover:bg-[#FF3B30] text-white p-1 rounded-full opacity-0 group-hover/slider:opacity-100 transition-all cursor-pointer shadow-md transform hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next photo"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 bg-[#111111]/70 hover:bg-[#FF3B30] text-white p-1 rounded-full opacity-0 group-hover/slider:opacity-100 transition-all cursor-pointer shadow-md transform hover:scale-110 active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Image Counter Badge at top-right */}
          <div className="absolute top-2 right-2 z-20 bg-[#111111]/80 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs pointer-events-none">
            <Images className="h-2.5 w-2.5 text-amber-400" />
            <span>{currentIndex + 1}/{totalImages}</span>
          </div>

          {/* Dots Indicator at bottom center */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1 bg-[#111111]/60 px-2 py-1 rounded-full backdrop-blur-[2px]">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDirection(idx > currentIndex ? 'left' : 'right');
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-4 bg-[#FF3B30]' : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Render overlay children (e.g., Sold badge, low stock tag, verified watermark) */}
      {children}
    </div>
  );
}
