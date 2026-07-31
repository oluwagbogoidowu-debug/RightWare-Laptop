import React, { useState, useEffect } from 'react';
import { Laptop } from 'lucide-react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export default function SmartImage({
  src,
  alt,
  className = '',
  ...props
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-100">
      {/* Loading Skeleton Shimmer */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse flex items-center justify-center">
          <Laptop className="h-8 w-8 text-neutral-300 animate-bounce opacity-40" />
        </div>
      )}

      {/* Actual Image - only loads exact src link */}
      <img
        {...props}
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`${className} transition-opacity duration-300 ${
          isLoaded && !hasError ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Placeholder frame on load error - no replacement image link fetched */}
      {hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-100 p-4 text-center">
          <Laptop className="h-8 w-8 text-neutral-400 mb-1.5" />
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
            Image Unavailable
          </span>
        </div>
      )}
    </div>
  );
}
