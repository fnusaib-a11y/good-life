import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Share2, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Minus, 
  Plus, 
  Check, 
  Send, 
  Facebook, 
  MessageCircle,
  Copy,
  Calculator,
  Download,
  FileText,
  AlertTriangle,
  Store
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    addToCart, 
    wishlist, 
    toggleWishlist,
    setIsCheckoutOpen,
    showToast,
    shops,
    setActiveShopId,
    setViewingShopId
  } = useApp();

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImgIndex, setSelectedImgIndex] = useState<number>(0);
  const [isResellingExpanded, setIsResellingExpanded] = useState<boolean>(false);
  const [customSellingPrice, setCustomSellingPrice] = useState<number>(
    selectedProduct ? selectedProduct.sellingPrice : 0
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  React.useEffect(() => {
    if (selectedProduct) {
      setCustomSellingPrice(selectedProduct.sellingPrice);
      setSelectedImgIndex(0);
      setQuantity(1);
    }
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const isWishlisted = wishlist.includes(selectedProduct.id);
  const adminPrice = selectedProduct.supplierPrice || selectedProduct.adminPrice || 0;
  const currentSellingPrice = customSellingPrice || selectedProduct.sellingPrice;
  const calculatedResellerProfit = Math.max(0, currentSellingPrice - adminPrice);

  const handleDownloadImage = async () => {
    const imageUrl = selectedProduct.images[selectedImgIndex] || selectedProduct.images[0];
    setIsDownloading(true);
    try {
      // Use fetch and blob download
      const res = await fetch(imageUrl, { mode: 'cors' });
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${selectedProduct.name.replace(/[^a-zA-Z0-9_\u0980-\u09FF]/g, '_')}_photo_${selectedImgIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast('ছবি ডাউনলোড সফল হয়েছে!');
    } catch {
      // Fallback
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.download = `${selectedProduct.name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('ছবির ফাইল ওপেন/ডাউনলোড হয়েছে!');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyDescription = () => {
    const specsText = selectedProduct.specifications 
      ? Object.entries(selectedProduct.specifications).map(([k, v]) => `• ${k}: ${v}`).join('\n')
      : '';
    const fullText = `📦 পণ্য: ${selectedProduct.name}\n💰 মূল্য: ৳${customSellingPrice || selectedProduct.sellingPrice}\n\n📝 বিবরণ:\n${selectedProduct.description}\n\n${specsText ? `📋 স্পেসিফিকেশন:\n${specsText}\n\n` : ''}🚚 সারাদেশে হোম ডেলিভারি সুবিধা (ডেলিভারি চার্জ ৳${selectedProduct.deliveryCharge || 60} আগে পরিশোধ করতে হবে)।\n📞 অর্ডার করতে ইনবক্স অথবা যোগাযোগ করুন।`;
    
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(fullText).catch(() => {});
      }
    } catch {}
    setCopiedDesc(true);
    showToast('পণ্যের বিবরণ ও তথ্য কপি হয়েছে!');
    setTimeout(() => setCopiedDesc(false), 2500);
  };

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'telegram' | 'copy') => {
    const text = `🔥 স্পেশাল অফার! ${selectedProduct.name}\nদাম: মাত্র ৳${customSellingPrice}\nহোম ডেলিভারি চার্জ অগ্রিম প্রযোজ্য!\nঅর্ডার করতে ইনবক্স করুন।`;
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (platform === 'whatsapp') {
      try {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
      } catch {
        // safe fallback
      }
    } else if (platform === 'facebook') {
      try {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
      } catch {
        // safe fallback
      }
    } else if (platform === 'telegram') {
      try {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
      } catch {
        // safe fallback
      }
    } else {
      try {
        if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(text + '\n' + url).catch(() => {});
        }
      } catch {
        // safe fallback
      }
      setCopiedLink(true);
      showToast('রিসেলিং পোস্ট ও লিংক কপি হয়েছে!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity, undefined, undefined, currentSellingPrice, calculatedResellerProfit);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up">
        {/* Header */}
        <div className="bg-sky-500 px-4 py-3 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="font-extrabold text-base truncate max-w-[240px]">
              {selectedProduct.nameEn || selectedProduct.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(selectedProduct.id)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-600 text-red-600' : ''}`} />
            </button>
            <button
              onClick={() => setSelectedProduct(null)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Main Image & Gallery */}
          <div>
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-xs">
              <img
                src={selectedProduct.images[selectedImgIndex] || selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-sky-500 text-white text-xs font-black px-2 py-0.5 rounded-md shadow-xs">
                -{selectedProduct.discountPercentage}% ছাড়
              </span>
              <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                স্টক: {selectedProduct.stock} টি
              </span>
            </div>

            {/* Thumbnails */}
            {selectedProduct.images.length > 1 && (
              <div className="flex gap-2 mt-2">
                {selectedProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImgIndex === idx ? 'border-sky-500 scale-95 shadow-xs' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Reviews */}
          <div>
            <h2 className="text-base font-extrabold text-gray-900 leading-snug">
              {selectedProduct.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1.5">
              <span className="text-sky-500 font-bold">★ {selectedProduct.rating}</span>
              <span>•</span>
              <span>{selectedProduct.reviewCount} টি রিভিউ</span>
              <span>•</span>
              <span className="text-sky-700 font-bold">ভেন্ডর: {selectedProduct.vendorName}</span>
              {selectedProduct.cashback > 0 && (
                <>
                  <span>•</span>
                  <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                    ক্যাশব্যাক ৳{selectedProduct.cashback}
                  </span>
                </>
              )}
            </div>

            {/* Associated Shop Banner - Shows which shop uploaded this product */}
            {(() => {
              const assignedShop = shops.find(s => s.id === (selectedProduct.shopId || 'shop_main'));
              if (!assignedShop) return null;
              return (
                <div className="mt-3 p-3 bg-gradient-to-r from-sky-50 via-blue-50/50 to-sky-50/70 border border-sky-200/90 rounded-2xl shadow-xs">
                  <div className="text-[10.5px] font-bold text-sky-800 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                    <Store className="w-3.5 h-3.5 text-sky-600" />
                    <span>প্রোডাক্টটি যে শপ থেকে আপলোড করা হয়েছে:</span>
                  </div>
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {assignedShop.logo ? (
                        <img 
                          src={assignedShop.logo} 
                          alt={assignedShop.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-sky-300 shadow-xs shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0A2540] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                          {assignedShop.name?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs sm:text-sm font-black text-gray-900 truncate">
                            {assignedShop.name}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </div>
                        <span className="text-[11px] text-gray-500 line-clamp-1">
                          {assignedShop.description || 'এডমিন অনুমোদিত অফিসিয়াল ভেরিফাইড শপ'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setViewingShopId(assignedShop.id);
                      }}
                      className="shrink-0 px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>শপে প্রবেশ করুন</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Reselling Pricing Showcase: Admin Price, Reselling Price & Profit */}
          <div className="bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-50/60 rounded-2xl p-3.5 sm:p-4 border border-sky-200/90 shadow-2xs space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. Admin Price */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block">
                  এডমিন প্রাইজ (পাইকারি)
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-800 block mt-0.5 font-mono">
                  ৳{adminPrice}
                </span>
                <span className="text-[10px] text-slate-400">সাপ্লায়ার মূল খরচ</span>
              </div>

              {/* 2. Reselling Price */}
              <div className="bg-white p-3 rounded-xl border border-sky-200 shadow-2xs">
                <span className="text-[11px] font-bold text-sky-700 block">
                  রিসেলিং প্রাইজ (বিক্রয়)
                </span>
                <span className="text-lg sm:text-xl font-black text-sky-700 block mt-0.5 font-mono">
                  ৳{currentSellingPrice}
                </span>
                {selectedProduct.oldPrice > currentSellingPrice ? (
                  <span className="text-[10px] text-slate-400 line-through">
                    গায়ের দাম ৳{selectedProduct.oldPrice}
                  </span>
                ) : (
                  <span className="text-[10px] text-sky-600">কাস্টমারকে এই দামে বিক্রি</span>
                )}
              </div>
            </div>

            {/* 3. Profit Card (লাভের টাকা) */}
            <div className="bg-emerald-500/10 border border-emerald-300/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-emerald-950 block">
                  আপনার নিশ্চিত লাভের টাকা
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  এডমিন প্রাইজ বাদে অতিরিক্ত টাকা
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-black text-emerald-700 font-mono">
                  +৳{calculatedResellerProfit * quantity}
                </span>
                {quantity > 1 && (
                  <span className="block text-[10px] text-emerald-600">
                    (৳{calculatedResellerProfit} × {quantity} পিস)
                  </span>
                )}
              </div>
            </div>

            {/* Note confirming earnings on order confirmation */}
            <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-sky-100 text-[11px] text-slate-600">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <span>
                অর্ডার কনফার্ম হবার সাথে সাথে অতিরিক্ত <strong>৳{calculatedResellerProfit * quantity}</strong> আপনার একাউন্টে স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।
              </span>
            </div>
          </div>

          {/* Reselling Profit Margin Box & Calculator */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-black text-gray-900">রিসেলিং ক্যালকুলেটর ও কাস্টম প্রাইজ</span>
              </div>
              <button
                onClick={() => setIsResellingExpanded(!isResellingExpanded)}
                className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
              >
                {isResellingExpanded ? 'সংক্ষেপ করুন' : 'কাস্টম মূল্য নির্ধারণ করুন'}
              </button>
            </div>

            {isResellingExpanded && (
              <div className="mt-3 space-y-2.5 pt-2.5 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    কাস্টমারের কাছে কত টাকায় বিক্রি করতে চান?
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">৳</span>
                    <input
                      type="number"
                      value={customSellingPrice}
                      onChange={(e) => setCustomSellingPrice(Math.max(adminPrice, Number(e.target.value)))}
                      className="w-full bg-slate-50 pl-7 pr-3 py-1.5 rounded-xl border border-sky-300 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Quick profit margin buttons */}
                <div className="flex items-center gap-1.5 text-[10.5px]">
                  <span className="text-slate-500 font-semibold">কুইক মার্জিন:</span>
                  {[50, 100, 150, 200, 300].map(add => (
                    <button
                      key={add}
                      type="button"
                      onClick={() => setCustomSellingPrice(adminPrice + add)}
                      className="px-2 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold border border-sky-200 cursor-pointer"
                    >
                      +৳{add}
                    </button>
                  ))}
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl flex items-center justify-between border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-900">হিসাবকৃত মোট প্রফিট:</span>
                  <span className="text-sm font-black text-emerald-700 font-mono">
                    ৳{calculatedResellerProfit * quantity}
                  </span>
                </div>

                {/* Social Share Buttons */}
                <div className="pt-1">
                  <span className="block text-[11px] font-bold text-gray-700 mb-1.5">
                    রিসেলিং পোস্ট শেয়ার করুন:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="py-1.5 px-2 bg-[#25D366] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="py-1.5 px-2 bg-[#1877F2] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('telegram')}
                      className="py-1.5 px-2 bg-[#0088CC] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="py-1.5 px-2 bg-gray-800 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>কপি লিংক</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features / Benefits */}
          <div className="grid grid-cols-2 gap-2 text-center text-gray-700">
            <button
              onClick={handleDownloadImage}
              className="bg-gray-50 rounded-xl p-2 border border-gray-100 flex flex-col items-center hover:bg-sky-50 cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-600 mb-1" />
              <span className="text-[10px] font-bold">ছবি ডাউনলোড</span>
            </button>
            <button
              onClick={handleCopyDescription}
              className="bg-gray-50 rounded-xl p-2 border border-gray-100 flex flex-col items-center hover:bg-sky-50 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-sky-600 mb-1" />
              <span className="text-[10px] font-bold">ডেসক্রিপশন কপি</span>
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center text-gray-700">
            <div className="bg-gray-50 rounded-xl p-2 border border-gray-100 flex flex-col items-center">
              <Truck className="w-4 h-4 text-sky-600 mb-1" />
              <span className="text-[10px] font-bold">সারাদেশে ডেলিভারি</span>
              <span className="text-[9px] text-gray-500">৳{selectedProduct.deliveryCharge}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-2 border border-gray-100 flex flex-col items-center">
              <RotateCcw className="w-4 h-4 text-sky-600 mb-1" />
              <span className="text-[10px] font-bold">সহজ রিটার্ন</span>
              <span className="text-[9px] text-gray-500">৭ দিন</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-2 border border-gray-100 flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-blue-600 mb-1" />
              <span className="text-[10px] font-bold">১০০% অথেনটিক</span>
              <span className="text-[9px] text-gray-500">অরিজিনাল পণ্য</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 mb-1">পণ্যের বিবরণ</h4>
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              {selectedProduct.description}
            </p>
          </div>

          {/* Specifications */}
          {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-1.5">স্পেসিফিকেশন</h4>
              <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 divide-y divide-gray-100">
                {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                  <div key={key} className="py-1.5 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">{key}</span>
                    <span className="font-bold text-gray-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-800">পরিমাণ:</span>
            <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 rounded-full hover:bg-gray-200 active:scale-90"
              >
                <Minus className="w-3.5 h-3.5 text-gray-700" />
              </button>
              <span className="font-extrabold text-sm text-gray-900 min-w-[20px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                className="p-1 rounded-full hover:bg-gray-200 active:scale-90"
              >
                <Plus className="w-3.5 h-3.5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-white border-t border-gray-100 grid grid-cols-2 gap-2.5 shrink-0">
          <button
            id="product-add-cart-btn"
            onClick={() => {
              addToCart(selectedProduct, quantity, undefined, undefined, currentSellingPrice, calculatedResellerProfit);
            }}
            className="py-3 px-4 bg-sky-50 hover:bg-sky-100 text-sky-800 font-black text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>কার্টে যোগ করুন</span>
          </button>

          <button
            id="product-buy-now-btn"
            onClick={handleBuyNow}
            className="py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>এখনই কিনুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
