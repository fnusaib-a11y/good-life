import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  Youtube, 
  ShoppingBag, 
  Store, 
  Grid, 
  PackagePlus, 
  Flame, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import VendorListModal from './VendorListModal';
import Header from '../layout/Header';
import ShopBannerSlider from './ShopBannerSlider';

export const ShopView: React.FC = () => {
  const { 
    products, 
    categories, 
    setSelectedProduct, 
    cart, 
    setIsCartOpen, 
    wishlist, 
    toggleWishlist,
    setIsSideDrawerOpen,
    setIsSavedPostsOpen,
    systemSettings,
    shops,
    activeShopId,
    setActiveShopId,
    setViewingShopId,
    activeShop,
    vendors,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const popularProducts = filteredProducts.filter(p => p.isPopular);
  const newProducts = filteredProducts.filter(p => p.isNew || !p.isPopular);

  return (
    <div className="min-h-full bg-[#F5F6F8] pb-32 sm:pb-36">
      {/* Header */}
      <Header 
        title="শপ ও রিসেলিং" 
        rightAction={
          <div className="flex items-center gap-1">
            <button
              id="header-wishlist-btn"
              onClick={() => setIsSavedPostsOpen(true)}
              className="relative p-2 rounded-full hover:bg-black/10 btn-anim text-gray-900 cursor-pointer"
              aria-label="Wishlist"
              title="উইশলিস্ট"
            >
              <Heart className={`w-5 h-5 stroke-[2.2] icon-bounce ${wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>
            <a
              href={(systemSettings as any)?.youtubeUrl || 'https://youtube.com'}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full hover:bg-black/10 btn-anim text-gray-900 cursor-pointer"
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5 stroke-[2.2] icon-bounce" />
            </a>
            <button
              id="header-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-black/10 btn-anim text-gray-900 cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.2] icon-bounce" />
              {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gray-900 text-sky-300 text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        }
      />

      {/* Main Content Container */}
      <div className="w-full max-w-5xl lg:max-w-6xl mx-auto px-2.5 sm:px-6 py-3 sm:py-5 space-y-4">
        {/* Search and Filter Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-xs border border-gray-100/90">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="প্রোডাক্ট সার্চ করুন (যেমন: টি-শার্ট, ঘড়ি, ক্রিম)..."
              className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 text-xs sm:text-sm font-semibold pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-xs text-gray-400 hover:text-gray-700 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Promotional Banner Slider */}
        <ShopBannerSlider onCategorySelect={(cat) => setSelectedCategory(cat)} />

        {/* Quick Action Navigation Cards */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <button
            onClick={() => {
              const el = document.getElementById('popular-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all text-center"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-extrabold text-gray-800">অর্ডার</span>
          </button>

          <button
            onClick={() => setIsVendorModalOpen(true)}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all text-center"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-extrabold text-gray-800">ভেন্ডর লিস্ট</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('category-scroll');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all text-center"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
              <Grid className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-extrabold text-gray-800">ক্যাটাগরি</span>
          </button>

          <button
            id="quick-nav-wishlist-btn"
            onClick={() => setIsSavedPostsOpen(true)}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all text-center relative"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-1.5 relative">
              <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${wishlist.length > 0 ? 'fill-pink-500/20 text-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="text-[11px] sm:text-xs font-extrabold text-gray-800">উইশলিস্ট</span>
          </button>
        </div>

        {/* Category Chips Bar */}
        <div id="category-scroll" className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">ক্যাটাগরিসমূহ</h3>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="text-[11px] sm:text-xs font-bold text-sky-700 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>সব দেখুন</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              সব ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.nameBn || cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State or Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-xs my-6">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-800">কোনো পণ্য পাওয়া যায়নি</h4>
            <p className="text-xs text-gray-500 mt-1">ভিন্ন ক্যাটাগরি অথবা অন্য কি-ওয়ার্ড দিয়ে সার্চ করে দেখুন।</p>
          </div>
        ) : (
          <>
            {/* Popular Products Grid */}
            <div id="popular-section" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-sky-600 fill-sky-500" />
                  <h3 className="text-xs sm:text-base font-black text-gray-900 tracking-tight">জনপ্রিয় প্রোডাক্টস</h3>
                </div>
                <span className="text-xs font-semibold text-gray-500">{popularProducts.length} টি পণ্য পাওয়া গেছে</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
                {popularProducts.map((product) => (
                  <ProductGridCard 
                    key={product.id} 
                    product={product} 
                    onSelect={() => setSelectedProduct(product)} 
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                    shopName={shops.find(s => s.id === (product.shopId || 'shop_main'))?.name}
                    onOpenShop={(id) => setViewingShopId(id)}
                  />
                ))}
              </div>
            </div>

            {/* New Products Grid */}
            {newProducts.length > 0 && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <PackagePlus className="w-5 h-5 text-sky-600" />
                    <h3 className="text-xs sm:text-base font-black text-gray-900 tracking-tight">নতুন প্রোডাক্টস</h3>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{newProducts.length} টি পণ্য পাওয়া গেছে</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
                  {newProducts.map((product) => (
                    <ProductGridCard 
                      key={product.id} 
                      product={product} 
                      onSelect={() => setSelectedProduct(product)} 
                      isWishlisted={wishlist.includes(product.id)}
                      onToggleWishlist={() => toggleWishlist(product.id)}
                      shopName={shops.find(s => s.id === (product.shopId || 'shop_main'))?.name}
                      onOpenShop={(id) => setViewingShopId(id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Vendor List Modal */}
      {isVendorModalOpen && (
        <VendorListModal onClose={() => setIsVendorModalOpen(false)} />
      )}
    </div>
  );
};

// Responsive Product Card Component
interface ProductCardProps {
  product: Product;
  onSelect: () => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  shopName?: string;
  onOpenShop?: (shopId: string) => void;
}

const ProductGridCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelect, 
  isWishlisted, 
  onToggleWishlist,
  shopName,
  onOpenShop
}) => {
  const adminPrice = product.supplierPrice || product.adminPrice || 0;
  const profit = product.resellerProfit || Math.max(0, product.sellingPrice - adminPrice);

  return (
    <div 
      onClick={onSelect}
      className="bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-100/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
    >
      <div>
        {/* Image Container */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Discount Badge */}
          {Boolean(product.discountPercentage && product.discountPercentage > 0) && (
            <span className="absolute top-1.5 left-1.5 bg-sky-500 text-white font-black text-[9.5px] sm:text-xs px-2 py-0.5 rounded-md shadow-xs">
              -{product.discountPercentage}%
            </span>
          )}

          {/* Wishlist Heart Button */}
          <button
            id={`product-wishlist-btn-${product.id}`}
            type="button"
            title={isWishlisted ? 'উইশলিস্ট থেকে মুছুন' : 'উইশলিস্টে সেভ করুন'}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            className={`absolute top-1.5 right-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs transition-all active:scale-75 z-10 ${
              isWishlisted
                ? 'bg-white text-rose-500 ring-2 ring-rose-300 shadow-sm'
                : 'bg-white/90 backdrop-blur-xs text-gray-600 hover:text-rose-500 hover:bg-white hover:scale-105'
            }`}
          >
            <Heart 
              className={`w-4 h-4 transition-transform duration-200 ${
                isWishlisted 
                  ? 'fill-rose-500 text-rose-500 scale-110' 
                  : 'stroke-[2.2]'
              }`} 
            />
          </button>

          {/* Reseller Profit Pill */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-emerald-950/85 backdrop-blur-xs text-emerald-300 text-[10px] sm:text-[11px] font-black py-1 px-2 rounded-lg text-center truncate border border-emerald-400/20">
            লাভের টাকা: +৳{profit}
          </div>
        </div>

        {/* Uploaded Shop Badge */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenShop?.(product.shopId || 'shop_main');
          }}
          className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-sky-900 bg-sky-50 hover:bg-sky-100 active:scale-95 border border-sky-200/90 px-2 py-1 rounded-lg mb-1.5 max-w-full truncate transition-all cursor-pointer group/shop shadow-2xs w-full text-left"
          title={`এই পণ্যটি "${shopName || 'মেইন শপ'}" আপলোড করেছে। শপের ভেতর প্রবেশ করতে ক্লিক করুন`}
        >
          <Store className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span className="truncate flex-1 font-semibold">{shopName || product.vendorName || 'মেইন শপ'}</span>
          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
        </button>

        {/* Product Title */}
        <h4 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-1">
          {product.name}
        </h4>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[11px] text-sky-500 font-extrabold">★ {product.rating}</span>
          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
        </div>
      </div>

      {/* Two Prices: Admin Price & Reselling Price + Profit */}
      <div>
        <div className="pt-2 border-t border-gray-100 space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/80">
              <span className="text-slate-500 font-bold block text-[9.5px]">এডমিন প্রাইজ</span>
              <span className="font-extrabold text-slate-800 text-xs sm:text-sm font-mono">৳{adminPrice}</span>
            </div>
            <div className="bg-sky-50/70 p-1.5 rounded-lg border border-sky-200/80">
              <span className="text-sky-700 font-bold block text-[9.5px]">রিসেলিং প্রাইজ</span>
              <span className="font-black text-sky-800 text-xs sm:text-sm font-mono">৳{product.sellingPrice}</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-emerald-50 text-emerald-900 px-2 py-1 rounded-lg border border-emerald-200/70">
            <span className="text-[10px] font-extrabold">লাভের টাকা:</span>
            <span className="text-xs font-black text-emerald-700 font-mono">+৳{profit}</span>
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="mt-2 w-full py-1.5 sm:py-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-[11px] sm:text-xs font-black rounded-xl transition-all cursor-pointer text-center shadow-xs"
        >
          রিসেল করুন
        </button>
      </div>
    </div>
  );
};

export default ShopView;
