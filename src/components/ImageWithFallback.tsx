import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  isGenerating?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, className = "", isGenerating = false }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback image URL (Placeholder for Barwaz logo)
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80&auto=format&fit=crop";

  if (isGenerating) {
    return (
      <div className={`aspect-video bg-[#1a1a18] rounded-xl border border-dashed border-[#27272a] flex flex-col items-center justify-center gap-4 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#ef4444]" />
        <span className="text-xs font-bold text-[#71717a] font-arabic animate-pulse">[DEVELOPING] // استخراج الصورة المودعة...</span>
      </div>
    );
  }

  if (!src || error) {
    return (
      <div className={`relative overflow-hidden group bg-[#121214]  shadow-sm border border-[#27272a] rounded-xl flex flex-col items-center justify-center p-6 gap-4 ${className}`}>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="relative">
          {error ? (
            <AlertCircle className="w-10 h-10 text-red-900/50" />
          ) : (
            <Camera className="w-10 h-10 text-text-primary" />
          )}
        </div>
        <div className="text-center relative">
          <p className="text-micro font-bold text-[#a1a1aa]  ">
            {error ? 'فشل التحميض - صورة تالفة' : 'لا توجد صورة في الملف'}
          </p>
          <p className="text-[8px] text-[#e5e3e0] mt-1  font-arabic">
            {error ? 'Error: Broken Negative' : 'Pending Development'}
          </p>
        </div>
        
        {/* Subtle Barwaz Logo Placeholder in background */}
        <div className="absolute bottom-2 right-3 opacity-5 select-none">
          <span className="text-xl font-bold italic">BARWAZ</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-[#1a1a18] flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin text-red-900/40" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        className={`w-full h-full object-cover transition-transform duration-700 group-src/components/ErrorBoundary.tsxscale-105 ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
      {/* Darkroom Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 to-transparent opacity-40 src/components/ErrorBoundary.tsxopacity-20 transition-opacity" />
    </div>
  );
};
