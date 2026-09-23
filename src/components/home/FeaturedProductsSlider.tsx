import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../../types';

export const FeaturedProductsSlider: React.FC = () => {
  const { products, setSelectedProduct, language, setActiveTab } = useApp();
  const isBn = language === 'bn';

  const navigateToReselling = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedProduct(product);
  };

  const featured = products.filter(p => p.isFeatured || p.isPopular).slice(0, 8);

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-sky-500 fill-sky-400 animate-pulse" />
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
            {isBn ? 'জনপ্রিয় রিসেলিং প্রোডাক্টস' : 'Popular Reselling Products'}
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-sky-700">
          {isBn ? 'সোয়াইপ করুন →' : 'Swipe →'}
        </span>
      </div>

      <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5">
        {featured.map((product) => (
          <motion.div
            key={product.id}
            onClick={() => navigateToReselling(product)}
            whileHover={{ y: -5, scale: 1.05 }}
            whileTap={{ scale: 0.90 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="w-36 sm:w-40 shrink-0 bg-white rounded-xl p-2 sm:p-2.5 shadow-xs border border-gray-200/90 cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col justify-between group btn-anim"
          >
            {/* 1. Only Picture (No discount badges or overlays) */}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* 2. Only Title & Reseller Profit Amount */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-gray-900 line-clamp-1 leading-tight group-hover:text-sky-800 transition-colors">
                {isBn ? product.name : (product.nameEn || product.name)}
              </h4>

              {/* Only Reseller Profit (লাভের টাকা) */}
              <div className="flex items-center justify-between bg-sky-50/90 border border-sky-200/70 px-2 py-1 rounded-lg group-hover:bg-sky-100 transition-colors">
                <span className="text-[10px] font-semibold text-sky-800 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-sky-600 shrink-0 animate-bounce-subtle" />
                  <span>{isBn ? 'লাভ' : 'Profit'}</span>
                </span>
                <span className="text-xs font-black text-sky-700 font-mono">
                  +৳{product.resellerProfit}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProductsSlider;
