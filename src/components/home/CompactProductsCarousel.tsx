import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { Product } from '../../types';
import { Flame, Sparkles } from 'lucide-react';

export const CompactProductsCarousel: React.FC = () => {
  const { products, setSelectedProduct, language, systemSettings } = useApp();
  const isBn = language === 'bn';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check admin feature toggle for offer products
  if (systemSettings?.featureToggles?.offer_products === false) {
    return null;
  }

  // Filter only products marked as Offer Products by admin; fallback gracefully to featured/discounted if empty
  const adminOfferProducts = products.filter(p => p.isOfferProduct);
  const displayProducts = adminOfferProducts.length > 0 
    ? adminOfferProducts 
    : products.filter(p => p.discountPercentage > 20 || p.isFeatured).slice(0, 8);

  // Auto-slide effect smoothly
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || displayProducts.length <= 2) return;

    const interval = setInterval(() => {
      if (!container) return;
      // Scroll by one card width (approx 100px + 8px gap)
      const scrollStep = 108;
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [displayProducts.length]);

  // Click handler: Open Product Detail modal directly (NEVER navigate to profile)
  const handleProductClick = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedProduct(product);
  };

  if (displayProducts.length === 0) return null;

  return (
    <div className="w-full pt-1 pb-1">
      {/* Header for Offer Products */}
      <div className="flex items-center justify-between px-1 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-sky-500/15 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-sky-600 fill-sky-500 animate-pulse" />
          </div>
          <h3 className="text-xs font-black text-gray-900 tracking-tight flex items-center gap-1">
            <span>{isBn ? 'স্পেশাল অফার প্রোডাক্টস' : 'Special Offer Products'}</span>
            <span className="text-[9px] font-black bg-gradient-to-r from-red-600 to-sky-600 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider">
              {isBn ? 'হট অফার' : 'HOT'}
            </span>
          </h3>
        </div>
        <span className="text-[10px] font-bold text-sky-700 flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5" />
          <span>{isBn ? 'এডমিন স্পেশাল' : 'Special Deals'}</span>
        </span>
      </div>

      {/* Small Compact Auto-sliding Offer Product Carousel */}
      <div 
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayProducts.map((product) => {
          const title = isBn ? product.name : (product.nameEn || product.name);
          const shortTitle = title.length > 14 ? title.substring(0, 14) + '...' : title;
          const offerBadge = product.offerTag || `${product.discountPercentage || 30}% ${isBn ? 'ছাড়' : 'OFF'}`;

          return (
            <motion.div
              key={product.id}
              id={`offer-product-${product.id}`}
              onClick={(e) => handleProductClick(product, e)}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-24 sm:w-28 shrink-0 bg-white rounded-2xl p-1.5 shadow-2xs hover:shadow-lg border border-sky-200/70 hover:border-sky-400 cursor-pointer transition-all duration-200 flex flex-col items-center text-center group btn-anim relative"
            >
              {/* Offer Badge Overlay */}
              <div className="absolute -top-1.5 -right-1 z-10">
                <span className="bg-gradient-to-r from-red-600 to-sky-500 text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                  {offerBadge}
                </span>
              </div>

              {/* Product Picture */}
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-1.5 relative border border-gray-100">
                <img
                  src={product.images[0]}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Half/Short Title Only - No Direct Price clutter */}
              <p className="text-[11px] font-extrabold text-gray-800 leading-tight line-clamp-1 w-full px-0.5 group-hover:text-sky-700 transition-colors">
                {shortTitle}
              </p>

              {/* Offer Price / Reseller profit indicator */}
              <div className="flex items-center gap-1 mt-0.5 text-[9.5px]">
                <span className="font-black text-sky-700">৳{product.sellingPrice}</span>
                {product.oldPrice > product.sellingPrice && (
                  <span className="line-through text-gray-400 text-[8.5px]">৳{product.oldPrice}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CompactProductsCarousel;
