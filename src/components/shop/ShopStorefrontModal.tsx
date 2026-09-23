import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  X, 
  Store, 
  ShieldCheck, 
  Search, 
  CreditCard, 
  Copy, 
  Check, 
  Users, 
  ShoppingBag, 
  Heart, 
  Package, 
  Flame,
  Phone,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Shop } from '../../types';

interface ShopStorefrontModalProps {
  shopId: string;
  onClose: () => void;
}

export const ShopStorefrontModal: React.FC<ShopStorefrontModalProps> = ({ shopId, onClose }) => {
  const { 
    shops, 
    products, 
    vendors, 
    setSelectedProduct, 
    wishlist, 
    toggleWishlist,
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Find the target shop or fallback to main shop
  const shop: Shop | undefined = useMemo(() => {
    return shops.find(s => s.id === shopId) || shops.find(s => s.id === 'shop_main') || shops[0];
  }, [shops, shopId]);

  // Find vendors for this shop
  const shopVendors = useMemo(() => {
    if (!shop) return [];
    return vendors.filter(v => v.shopId === shop.id && v.status === 'active');
  }, [vendors, shop]);

  // All products uploaded to this shop
  const shopProducts = useMemo(() => {
    if (!shop) return [];
    return products.filter(p => (p.shopId || 'shop_main') === shop.id);
  }, [products, shop]);

  // Available categories within this shop
  const shopCategories = useMemo(() => {
    const cats = new Set<string>();
    shopProducts.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [shopProducts]);

  // Filtered products based on search & category
  const filteredProducts = useMemo(() => {
    return shopProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [shopProducts, searchQuery, selectedCategory]);

  const handleCopy = (text: string, label: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      }
    } catch {}
    setCopiedNumber(text);
    showToast(`${label} নম্বর কপি হয়েছে: ${text}`);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  if (!shop) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#051329]/75 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[100dvh] sm:h-[92vh] max-h-[950px] bg-[#F0F9FF] text-[#0A2540] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-sky-200/80">
        
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-gradient-to-r from-[#0A2540] via-[#075985] to-[#0284C7] px-4 py-3 flex items-center justify-between text-white shadow-md shrink-0 border-b border-sky-400/20">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all active:scale-95 border border-white/20 backdrop-blur-sm cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 max-w-[65%] truncate">
            <Store className="w-4 h-4 text-sky-300 shrink-0" />
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {shop.name}
            </h1>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all active:scale-95 border border-white/20 backdrop-blur-sm cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Storefront Body */}
        <main className="flex-1 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-sky-200 scrollbar-track-transparent">
          
          {/* Shop Hero Profile Banner (Navy Blue & Sky Blue) */}
          <div className="relative bg-gradient-to-b from-[#0A2540] via-[#075985] to-[#0284C7] pt-4 pb-6 px-4 text-white shadow-md">
            
            {/* Background Watermark */}
            <div className="absolute top-1 left-0 right-0 flex justify-center pointer-events-none select-none overflow-hidden">
              <span className="text-5xl sm:text-6xl font-black tracking-widest text-sky-200/10 uppercase">
                STORE
              </span>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                {/* Shop Logo */}
                <div className="relative shrink-0">
                  {shop.logo ? (
                    <img 
                      src={shop.logo} 
                      alt={shop.name} 
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover bg-white p-0.5 border-2 border-sky-300 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#0A2540] text-white flex items-center justify-center font-black text-2xl border-2 border-sky-300 shadow-lg">
                      {shop.name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow-xs" title="Official Verified Shop">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>

                {/* Shop Title & Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      {shop.name}
                    </h2>
                    <span className="text-[10px] bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> ভেরিফাইড শপ
                    </span>
                  </div>

                  {shop.description && (
                    <p className="text-xs text-sky-100/90 mt-1 line-clamp-2 max-w-lg leading-relaxed">
                      {shop.description}
                    </p>
                  )}

                  {/* Quick Metadata */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-sky-200 font-semibold">
                    <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/15 inline-flex items-center gap-1">
                      <Package className="w-3 h-3 text-sky-300" />
                      মোট {shopProducts.length}টি প্রোডাক্ট
                    </span>
                    {shopVendors.length > 0 && shop.showVendorInfo !== false && (
                      <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/15 inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-sky-300" />
                        {shopVendors.length} জন ভেন্ডর
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Payment Numbers */}
            {shop.paymentMethods && (
              <div className="mt-4 pt-3 border-t border-sky-400/25 bg-[#0A2540]/60 backdrop-blur-xs rounded-xl p-3 border border-sky-400/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-sky-200 font-bold">
                  <CreditCard className="w-3.5 h-3.5 text-sky-300" />
                  <span>শপের অফিসিয়াল পেমেন্ট নম্বর:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {shop.paymentMethods.bkash?.enabled !== false && shop.paymentMethods.bkash?.number && (
                    <div className="flex items-center gap-1.5 bg-pink-950/70 border border-pink-400/30 text-pink-200 px-2.5 py-1 rounded-lg text-xs">
                      <span className="font-extrabold text-[11px]">
                        বিকাশ ({shop.paymentMethods.bkash.type === 'merchant' ? 'মার্চেন্ট' : 'পার্সোনাল'}):
                      </span>
                      <span className="font-mono font-bold">{shop.paymentMethods.bkash.number}</span>
                      <button
                        onClick={() => handleCopy(shop.paymentMethods.bkash.number, 'বিকাশ')}
                        className="p-0.5 hover:text-white transition-colors cursor-pointer"
                        title="কপি করুন"
                      >
                        {copiedNumber === shop.paymentMethods.bkash.number ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-pink-300" />
                        )}
                      </button>
                    </div>
                  )}

                  {shop.paymentMethods.nagad?.enabled !== false && shop.paymentMethods.nagad?.number && (
                    <div className="flex items-center gap-1.5 bg-orange-950/70 border border-orange-400/30 text-orange-200 px-2.5 py-1 rounded-lg text-xs">
                      <span className="font-extrabold text-[11px]">
                        নগদ ({shop.paymentMethods.nagad.type === 'merchant' ? 'মার্চেন্ট' : 'পার্সোনাল'}):
                      </span>
                      <span className="font-mono font-bold">{shop.paymentMethods.nagad.number}</span>
                      <button
                        onClick={() => handleCopy(shop.paymentMethods.nagad.number, 'নগদ')}
                        className="p-0.5 hover:text-white transition-colors cursor-pointer"
                        title="কপি করুন"
                      >
                        {copiedNumber === shop.paymentMethods.nagad.number ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-orange-300" />
                        )}
                      </button>
                    </div>
                  )}

                  {shop.paymentMethods.rocket?.enabled && shop.paymentMethods.rocket?.number && (
                    <div className="flex items-center gap-1.5 bg-purple-950/70 border border-purple-400/30 text-purple-200 px-2.5 py-1 rounded-lg text-xs">
                      <span className="font-extrabold text-[11px]">রকেট:</span>
                      <span className="font-mono font-bold">{shop.paymentMethods.rocket.number}</span>
                      <button
                        onClick={() => handleCopy(shop.paymentMethods.rocket.number, 'রকেট')}
                        className="p-0.5 hover:text-white transition-colors cursor-pointer"
                        title="কপি করুন"
                      >
                        {copiedNumber === shop.paymentMethods.rocket.number ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-purple-300" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Products Search & Category Filter Section */}
          <div className="p-4 space-y-3">
            {/* Search Bar within this shop */}
            <div className="bg-white p-2.5 rounded-2xl shadow-xs border border-sky-100">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`"${shop.name}"-এর প্রোডাক্ট সার্চ করুন...`}
                  className="w-full bg-[#F0F9FF] text-[#0A2540] placeholder-gray-400 text-xs sm:text-sm font-semibold pl-9 pr-9 py-2.5 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white transition-all"
                />
                <Search className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-700 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Chips */}
            {shopCategories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#0284C7] text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-sky-50 border border-sky-100'
                  }`}
                >
                  সব ({shopProducts.length})
                </button>
                {shopCategories.map(cat => {
                  const count = shopProducts.filter(p => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedCategory === cat
                          ? 'bg-[#0284C7] text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-sky-50 border border-sky-100'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Products Grid Title */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#0284C7]" />
                <h3 className="text-xs sm:text-sm font-black text-[#0A2540]">
                  এই শপের প্রোডাক্টসমূহ
                </h3>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {filteredProducts.length} টি পণ্য
              </span>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                  const adminPrice = product.supplierPrice || product.adminPrice || 0;
                  const profit = product.resellerProfit || Math.max(0, product.sellingPrice - adminPrice);
                  const isWishlisted = wishlist.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                      }}
                      className="bg-white rounded-2xl p-2.5 border border-sky-100 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
                    >
                      <div>
                        {/* Image */}
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />

                          {/* Discount */}
                          {Boolean(product.discountPercentage && product.discountPercentage > 0) && (
                            <span className="absolute top-1.5 left-1.5 bg-[#0284C7] text-white font-black text-[9.5px] px-2 py-0.5 rounded-md shadow-xs">
                              -{product.discountPercentage}%
                            </span>
                          )}

                          {/* Wishlist Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-all active:scale-75 z-10 ${
                              isWishlisted
                                ? 'bg-white text-rose-500 ring-2 ring-rose-300'
                                : 'bg-white/90 backdrop-blur-xs text-gray-600 hover:text-rose-500'
                            }`}
                          >
                            <Heart 
                              className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} 
                            />
                          </button>

                          {/* Profit Pill */}
                          <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-[#0A2540]/90 backdrop-blur-xs text-[#38BDF8] text-[9.5px] font-black py-0.5 px-2 rounded-lg text-center truncate border border-sky-400/30">
                            লাভের টাকা: +৳{profit}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug mb-1">
                          {product.name}
                        </h4>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-1 text-[10px]">
                          <span className="text-[#0284C7] font-bold">★ {product.rating}</span>
                          <span className="text-gray-400">({product.reviewCount})</span>
                        </div>
                      </div>

                      {/* Prices & Action Button */}
                      <div>
                        <div className="pt-1.5 border-t border-gray-100 space-y-1">
                          <div className="grid grid-cols-2 gap-1 text-[9px]">
                            <div className="bg-slate-50 p-1 rounded-md border border-slate-200">
                              <span className="text-slate-500 block">এডমিন</span>
                              <span className="font-extrabold text-slate-800 font-mono text-[11px]">৳{adminPrice}</span>
                            </div>
                            <div className="bg-sky-50 p-1 rounded-md border border-sky-200">
                              <span className="text-sky-700 block">রিসেলিং</span>
                              <span className="font-black text-sky-800 font-mono text-[11px]">৳{product.sellingPrice}</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                          className="mt-2 w-full py-1.5 bg-[#0284C7] hover:bg-[#0369A1] active:scale-95 text-white text-[11px] font-black rounded-xl transition-all cursor-pointer text-center shadow-xs"
                        >
                          রিসেল করুন / দেখুন
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-sky-100 space-y-2">
                <Package className="w-10 h-10 text-sky-300 mx-auto" />
                <h4 className="text-sm font-bold text-gray-800">কোনো প্রোডাক্ট পাওয়া যায়নি</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  {searchQuery 
                    ? `"${searchQuery}" এর সাথে মিলে এমন কোনো প্রোডাক্ট এই শপে পাওয়া যায়নি।` 
                    : 'এই শপে বর্তমানে কোনো প্রোডাক্ট সংযুক্ত নেই।'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 px-3 py-1.5 bg-sky-50 text-[#0284C7] hover:bg-sky-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    সার্চ ক্লিয়ার করুন
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom spacing */}
          <div className="h-6" />
        </main>
      </div>
    </div>
  );
};

export default ShopStorefrontModal;
