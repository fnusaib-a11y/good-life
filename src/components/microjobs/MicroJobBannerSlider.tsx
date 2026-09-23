import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Sparkles, Briefcase, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppBanner } from '../../types';

interface MicroJobBannerSliderProps {
  onPostJobClick?: () => void;
}

export const MicroJobBannerSlider: React.FC<MicroJobBannerSliderProps> = ({ onPostJobClick }) => {
  const { banners, jobs, setSelectedJob, setIsJobHistoryOpen } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter banners meant for jobs or all
  const jobBanners = banners.filter(
    b => b.isActive && (b.position === 'jobs' || b.position === 'all' || b.actionTab === 'jobs')
  );

  // Fallback defaults if none configured
  const effectiveBanners: AppBanner[] = jobBanners.length > 0 ? jobBanners : [
    {
      id: 'default_job_1',
      title: 'প্রতিদিন সহজ মাইক্রো জব করে নিশ্চিত আয় করুন',
      subtitle: 'ইউটিউব, ফেসবুক ও মোবাইল টাস্ক শেষ করে ইনস্ট্যান্ট পেমেন্ট',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
      actionTab: 'jobs',
      badge: 'হট মাইক্রো জবস',
      isActive: true,
      position: 'jobs'
    },
    {
      id: 'default_job_2',
      title: 'মাত্র ২ মিনিটে আপনার নিজের কাজ পোস্ট করুন',
      subtitle: 'হাজার হাজার এক্টিভ ফ্রিল্যান্সারের মাধ্যমে পেজ লাইক, সাবস্ক্রাইব ও ট্রাফিক পান',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      actionTab: 'jobs',
      badge: 'কাজ পোস্ট করুন',
      isActive: true,
      position: 'jobs'
    },
    {
      id: 'default_job_3',
      title: '১০০% নিশ্চিত ও দ্রুত বিকাশ-নগদ উইথড্রয়াল',
      subtitle: 'টাস্ক প্রুফ এপ্রুভ হওয়ার সাথে সাথে ব্যালেন্স উত্তোলন সুবিধা',
      imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      actionTab: 'jobs',
      badge: 'ইনস্ট্যান্ট ক্যাশআউট',
      isActive: true,
      position: 'jobs'
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
      const job = jobs.find(j => j.id === banner.targetId);
      if (job) {
        setSelectedJob(job);
        return;
      }
    }
    if (banner.badge?.includes('পোস্ট') && onPostJobClick) {
      onPostJobClick();
      return;
    }
    if (banner.badge?.includes('ক্যাশআউট')) {
      setIsJobHistoryOpen(true);
      return;
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-gradient-to-r from-emerald-500 to-sky-600 text-white shadow-xs">
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
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                    <Briefcase className="w-3 h-3" />
                    <span>কাজ শুরু করুন</span>
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
                  currentIndex === idx ? 'w-5 sm:w-6 bg-emerald-400 shadow-sm' : 'w-1.5 sm:w-2 bg-white/60 hover:bg-white'
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

export default MicroJobBannerSlider;
