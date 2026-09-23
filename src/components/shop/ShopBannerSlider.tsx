import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppBanner } from '../../types';

interface ShopBannerSliderProps {
  onCategorySelect?: (category: string) => void;
}

export const ShopBannerSlider: React.FC<ShopBannerSliderProps> = ({ onCategorySelect }) => {
  const { banners, products, setSelectedProduct } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter banners meant for shop or all
  const shopBanners = banners.filter(
    b => b.isActive && (b.position === 'shop' || b.position === 'all' || b.actionTab === 'shop')
  );

  // Fallback defaults if none configured
  const effectiveBanners: AppBanner[] = shopBanners.length > 0 ? shopBanners : [
    {
      id: 'default_shop_1',
      title: 'হোলসেল প্রাইসে রিসেলিং ও আকর্ষণীয় ক্যাশব্যাক',
      subtitle: 'বিনা পুঁজিতে লাখ টাকার ই-কমার্স ব্যবসার নিশ্চিত সুযোগ',
      imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80',
      actionTab: 'shop',
      badge: 'রিসেলিং মেগা ডিল',
      isActive: true,
      position: 'shop'
    },
    {
      id: 'default_shop_2',
      title: 'সারা দেশে ক্যাশ অন ডেলিভারিতে দ্রুত পার্সেল হ্যান্ডলিং',
      subtitle: 'কাস্টমার ঘরে বসে প্রোডাক্ট রিসিভ করে মূল্য পরিশোধ করবে',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      actionTab: 'shop',
      badge: 'ক্যাশ অন ডেলিভারি',
      isActive: true,
      position: 'shop'
    },
    {
      id: 'default_shop_3',
      title: 'টপ ট্রেন্ডিং গ্যাজেট ও লাইফস্টাইল কালেকশন',
      subtitle: 'স্মার্টওয়াচ, ট্রিমার ও হেডফোনে প্রতিটি অর্ডারে ২০০-৫০০ টাকা পর্যন্ত লাভ',
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
      actionTab: 'shop',
      badge: 'সর্বোচ্চ লাভ',
      isActive: true,
      position: 'shop'
    }
  ];

  useEffect(() => {
    if (effectiveBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % effectiveBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [effectiveBanners.length]);

  const currentBanner = effectiveBanners[currentIndex] || effectiveBanners[0];

  const handleBannerClick = (banner: AppBanner) => {
    if (banner.targetId) {
      const prod = products.find(p => p.id === banner.targetId);
      if (prod) {
        setSelectedProduct(prod);
        return;
      }
    }
    // Default action: if has target category or scroll
    if (onCategorySelect && banner.badge?.includes('গ্যাজেট')) {
      onCategorySelect('Electronics');
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm group">
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

            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent sm:bg-gradient-to-r sm:from-black/85 sm:via-black/50 sm:to-transparent flex flex-col justify-end sm:justify-center p-4 sm:p-6 md:p-8 text-white">
              <div className="space-y-1.5 max-w-xl">
                {currentBanner.badge && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-xs">
                    <Sparkles className="w-3 h-3 fill-white" />
                    {currentBanner.badge}
                  </span>
                )}
                <h3 className="text-sm sm:text-lg md:text-2xl font-black text-white drop-shadow-sm leading-tight line-clamp-2">
                  {currentBanner.title}
                </h3>
                {currentBanner.subtitle && (
                  <p className="text-[11px] sm:text-xs md:text-sm text-gray-200 line-clamp-1 font-medium">
                    {currentBanner.subtitle}
                  </p>
                )}
                <div className="pt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-sky-400 group-hover:text-sky-300">
                    <span>পণ্য দেখুন ও বিক্রি করুন</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {effectiveBanners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + effectiveBanners.length) % effectiveBanners.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer shadow-md opacity-80 hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % effectiveBanners.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer shadow-md opacity-80 hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 right-3.5 flex items-center gap-1.5 z-10">
            {effectiveBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? 'w-5 sm:w-6 bg-sky-400 shadow-sm' : 'w-1.5 sm:w-2 bg-white/60 hover:bg-white'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ShopBannerSlider;
