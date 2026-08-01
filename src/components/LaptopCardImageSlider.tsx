import React, { useState, useRef, useEffect } from 'react';
import { Laptop } from '../types';
import SmartImage from './SmartImage';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';

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
  // Collect all unique non-empty image URLs for the laptop
  const images = Array.from(
    new Set([laptop.image, ...(laptop.additionalImages || [])])
  ).filter(Boolean);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Eagerly preload all images in the collection locally on component mount
  useEffect(() => {
    if (images.length > 1) {
      images.forEach((src) => {
        if (src) {
          const img = new Image();
          img.src = src;
        }
      });
    }
  }, [images.join(',')]);

  // Touch & Drag Handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const totalImages = images.length;

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (totalImages <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (totalImages <= 1) return;
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
    const minSwipeDistance = 30; // px

    if (Math.abs(distance) > minSwipeDistance) {
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
      {/* Stacked Image Slider Container - Pre-renders all collection images so sliding is instant with zero network reload delay */}
      <div className="relative w-full h-full overflow-hidden">
        {images.map((imgSrc, idx) => {
          const offset = idx - currentIndex;
          return (
            <div
              key={imgSrc + idx}
              aria-hidden={idx !== currentIndex}
              className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out will-change-transform"
              style={{
                transform: `translateX(${offset * 100}%)`,
              }}
            >
              <SmartImage
                src={imgSrc}
                alt={`${laptop.name} photo ${idx + 1}`}
                loading="eager"
                decoding="async"
                className={`w-full h-full object-cover filter grayscale-[0.05] ${imageClassName}`}
              />
            </div>
          );
        })}
      </div>

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
