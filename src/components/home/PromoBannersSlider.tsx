import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTab } from '../../types';

export const PromoBannersSlider: React.FC = () => {
  const { banners, setActiveTab, setSelectedJob, setSelectedProduct, jobs, products } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeBanners = banners.filter(b => b.isActive);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handleBannerClick = (banner: typeof currentBanner) => {
    if (banner.targetId) {
      if (banner.actionTab === 'jobs') {
        const job = jobs.find(j => j.id === banner.targetId);
        if (job) setSelectedJob(job);
      } else if (banner.actionTab === 'shop') {
        const prod = products.find(p => p.id === banner.targetId);
        if (prod) setSelectedProduct(prod);
      }
    }
    if (banner.actionTab) {
      setActiveTab(banner.actionTab as AppTab);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xs group">
      <div 
        onClick={() => handleBannerClick(currentBanner)}
        className="relative aspect-[21/9] sm:aspect-[24/8] md:aspect-[28/8] w-full cursor-pointer bg-slate-900 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id || currentIndex}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3.5 sm:p-5 text-white">
              <div className="space-y-1 max-w-lg">
                {currentBanner.badge && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-sky-500 text-white shadow-xs mb-1 animate-gentle-pulse">
                    <Sparkles className="w-3 h-3 fill-white animate-spin-slow" />
                    {currentBanner.badge}
                  </span>
                )}
                <h3 className="text-sm sm:text-lg md:text-xl font-black text-white drop-shadow-sm leading-snug line-clamp-1">
                  {currentBanner.title}
                </h3>
                {currentBanner.subtitle && (
                  <p className="text-xs sm:text-sm text-gray-200 line-clamp-1 font-medium">
                    {currentBanner.subtitle}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all btn-anim cursor-pointer shadow-md"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5 icon-bounce" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all btn-anim cursor-pointer shadow-md"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5 icon-bounce" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-2.5 right-3.5 flex items-center gap-1.5 z-10">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-sky-400 shadow-sm' : 'w-2 bg-white/70 hover:bg-white active:scale-75'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PromoBannersSlider;
