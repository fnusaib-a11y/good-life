import React, { useState, useRef } from 'react';
import { 
  ShoppingBag, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit3, 
  Star, 
  Check, 
  Image as ImageIcon, 
  Tag, 
  Boxes,
  Flame,
  Upload,
  X,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

export const AdminProductsTab: React.FC = () => {
  const { 
    products, 
    categories, 
    adminAddProduct, 
    adminUpdateProduct, 
    adminToggleOfferProduct,
    adminDeleteProduct, 
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [offerOnlyFilter, setOfferOnlyFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // New product form state
  const [newProd, setNewProd] = useState({
    name: '',
    nameEn: '',
    category: categories[0]?.name || 'ইলেকট্রনিক্স',
    supplierPrice: 450,
    resellerProfit: 150,
    sellingPrice: 600,
    oldPrice: 850,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
    description: 'প্রিমিয়াম কোয়ালিটির হট সেলিং প্রোডাক্ট।',
    isOfferProduct: true,
    offerTag: 'ধামাকা অফার'
  });

  const offerProductsCount = products.filter(p => p.isOfferProduct).length;

  const filteredProducts = products.filter(p => {
    if (offerOnlyFilter && !p.isOfferProduct) return false;
    const matchesCat = selectedCategory === 'all' ? true : p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleAddImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewProd(prev => ({ ...prev, images: [reader.result as string] }));
        showToast(isBn ? 'ছবি যুক্ত করা হয়েছে!' : 'Image uploaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingProduct(prev => prev ? { ...prev, images: [reader.result as string] } : null);
        showToast(isBn ? 'ছবি পরিবর্তন করা হয়েছে!' : 'Image updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim()) {
      showToast(isBn ? 'পণ্যের নাম লিখুন!' : 'Please enter product name!');
      return;
    }

    const sellingPrice = Number(newProd.sellingPrice) || 100;
    const oldPrice = Number(newProd.oldPrice) || sellingPrice;
    const discountPct = oldPrice > sellingPrice ? Math.round(((oldPrice - sellingPrice) / oldPrice) * 100) : 0;

    adminAddProduct({
      name: newProd.name.trim(),
      nameEn: newProd.nameEn?.trim() || newProd.name.trim(),
      category: newProd.category,
      supplierPrice: Number(newProd.supplierPrice) || 0,
      resellerProfit: Number(newProd.resellerProfit) || 0,
      sellingPrice,
      oldPrice,
      discountPercentage: discountPct,
      images: newProd.images.length > 0 ? newProd.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
      rating: 4.8,
      reviewCount: 15,
      stock: Number(newProd.stock) || 10,
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      vendorName: 'Super Reseller Hub',
      vendorId: 'vendor_official',
      isFeatured: true,
      isPopular: true,
      isOfferProduct: newProd.isOfferProduct,
      offerTag: newProd.isOfferProduct ? (newProd.offerTag?.trim() || 'ধামাকা অফার') : undefined,
      description: newProd.description.trim(),
      specifications: { 'কোয়ালিটি': 'অরিজিনাল এ গ্রেড', 'ওয়ারেন্টি': '৭ দিনের রিপ্লেসমেন্ট' },
      deliveryCharge: 60,
      cashback: 20,
      returnPolicy: '৭ দিন রিটার্ন সুবিধা'
    });

    setShowAddModal(false);
    setNewProd({
      name: '',
      nameEn: '',
      category: categories[0]?.name || 'ইলেকট্রনিক্স',
      supplierPrice: 450,
      resellerProfit: 150,
      sellingPrice: 600,
      oldPrice: 850,
      stock: 50,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
      description: 'প্রিমিয়াম কোয়ালিটির হট সেলিং প্রোডাক্ট।',
      isOfferProduct: true,
      offerTag: 'ধামাকা অফার'
    });
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const sellingPrice = Number(editingProduct.sellingPrice) || 100;
    const oldPrice = Number(editingProduct.oldPrice) || sellingPrice;
    const discountPct = oldPrice > sellingPrice ? Math.round(((oldPrice - sellingPrice) / oldPrice) * 100) : 0;

    adminUpdateProduct(editingProduct.id, {
      name: editingProduct.name,
      nameEn: editingProduct.nameEn || editingProduct.name,
      category: editingProduct.category,
      sellingPrice,
      oldPrice,
      discountPercentage: discountPct,
      resellerProfit: Number(editingProduct.resellerProfit) || 0,
      supplierPrice: Number(editingProduct.supplierPrice) || 0,
      stock: Number(editingProduct.stock) || 0,
      images: editingProduct.images,
      description: editingProduct.description,
      isOfferProduct: editingProduct.isOfferProduct,
      offerTag: editingProduct.offerTag || 'ধামাকা অফার'
    });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-3.5">
      {/* Top Banner: Offer Products Status & Summary */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400 p-3.5 sm:p-4 rounded-2xl shadow-xs text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-xs shrink-0">
            <Flame className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black flex items-center gap-1.5">
              <span>{isBn ? 'হোমপেজের টপ অফার প্রোডাক্টস কন্ট্রোল' : 'Top Line Offer Products Control'}</span>
              <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {offerProductsCount} {isBn ? 'টি সক্রিয়' : 'Active'}
              </span>
            </h3>
            <p className="text-[11px] text-sky-50 font-medium mt-0.5">
              {isBn 
                ? 'যে প্রোডাক্টগুলো হোমপেজের উপরের লাইনে দেখাবেন তা এখান থেকে সরাসরি সিলেক্ট ও এডিট করুন।'
                : 'Select and configure which products appear in the top auto-sliding offer line on the Home screen.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOfferOnlyFilter(!offerOnlyFilter)}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
              offerOnlyFilter 
                ? 'bg-white text-sky-700 border border-white' 
                : 'bg-white/90 hover:bg-white text-sky-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{offerOnlyFilter ? (isBn ? 'সব পণ্য দেখুন' : 'Show All') : (isBn ? 'শুধু অফার পণ্য দেখুন' : 'Filter Offers')}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-sky-50 text-sky-700 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-sky-600" />
            <span>{isBn ? 'নতুন পণ্য' : 'Add Product'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'পণ্য খুঁজুন...' : 'Search products...'}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex gap-2 w-full sm:w-auto items-center overflow-x-auto no-scrollbar">
            <button
              onClick={() => { setOfferOnlyFilter(false); setSelectedCategory('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                !offerOnlyFilter && selectedCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isBn ? `সকল পণ্য (${products.length})` : `All (${products.length})`}
            </button>

            <button
              onClick={() => setOfferOnlyFilter(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${
                offerOnlyFilter
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{isBn ? `টপ অফার (${offerProductsCount})` : `Top Offers (${offerProductsCount})`}</span>
            </button>

            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setOfferOnlyFilter(false); }}
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-400"
            >
              <option value="all">{isBn ? 'সব ক্যাটাগরি' : 'All Categories'}</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredProducts.map(prod => {
          const isOffer = !!prod.isOfferProduct;

          return (
            <div 
              key={prod.id}
              className={`bg-white p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 shadow-2xs ${
                isOffer ? 'border-sky-300 ring-1 ring-sky-400/30' : 'border-gray-100'
              }`}
            >
              <div className="flex gap-3 items-start">
                <div className="relative shrink-0">
                  <img 
                    src={prod.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} 
                    alt={prod.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-200"
                  />
                  {isOffer && (
                    <span className="absolute -top-1.5 -left-1.5 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      <span>{prod.offerTag || (isBn ? 'অফার' : 'OFFER')}</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-sky-800 bg-sky-50 border border-sky-200/60 px-1.5 py-0.2 rounded font-bold">
                      {prod.category}
                    </span>
                    {prod.discountPercentage > 0 && (
                      <span className="text-[10px] text-red-700 bg-red-50 border border-red-200/60 px-1.5 py-0.2 rounded font-black">
                        {prod.discountPercentage}% {isBn ? 'ছাড়' : 'OFF'}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 line-clamp-1">
                    {prod.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                    <span className="font-black text-gray-900">
                      বিক্রয়: <span className="text-sky-700">৳{prod.sellingPrice}</span>
                      {prod.oldPrice > prod.sellingPrice && (
                        <span className="line-through text-gray-400 text-[10px] ml-1">৳{prod.oldPrice}</span>
                      )}
                    </span>
                    <span className="text-[11px] text-sky-600 font-black">লাভ: +৳{prod.resellerProfit}</span>
                    <span className="text-[10px] text-gray-500 font-semibold">স্টক: {prod.stock}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Controls: 1-Click Offer Toggle & Edit/Delete */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                {/* Dedicated Offer Toggle Button */}
                <button
                  type="button"
                  onClick={() => adminToggleOfferProduct(prod.id, !isOffer)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    isOffer 
                      ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs' 
                      : 'bg-gray-100 hover:bg-sky-100 text-gray-700 hover:text-sky-900 border border-gray-200'
                  }`}
                  title={isOffer ? 'হোম অফার লাইন থেকে সরান' : 'হোম অফার লাইনে যোগ করুন'}
                >
                  <Flame className={`w-3.5 h-3.5 ${isOffer ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                  <span>{isOffer ? (isBn ? '🔥 টপ অফারে সক্রিয়' : 'Active in Top Offers') : (isBn ? '＋ অফার প্রোডাক্ট করুন' : 'Set as Top Offer')}</span>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditingProduct({ ...prod })}
                    className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="এডিট করুন"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isBn ? 'এডিট' : 'Edit'}</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(prod.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 p-6 space-y-2">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-xs font-black text-gray-700">কোনো পণ্য পাওয়া যায়নি</h4>
          <p className="text-[11px] text-gray-500">সার্চ বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <form 
            onSubmit={handleCreateProduct}
            className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-1.5">
                <ShoppingBag className="w-5 h-5 text-sky-500" />
                <span>{isBn ? 'নতুন পণ্য যুক্ত করুন' : 'Add New Product'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Special Highlight: Offer Product Toggle inside Form */}
            <div className="bg-sky-50/90 border border-sky-200 p-3 rounded-2xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProd.isOfferProduct}
                  onChange={(e) => setNewProd({ ...newProd, isOfferProduct: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-400 cursor-pointer"
                />
                <span className="text-xs font-black text-gray-900 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-red-600 fill-current" />
                  <span>{isBn ? 'হোমপেজের উপরের লাইনে "অফার প্রোডাক্ট" হিসেবে দেখান' : 'Show as Offer Product in Top Line'}</span>
                </span>
              </label>
              {newProd.isOfferProduct && (
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    {isBn ? 'অফার ট্যাগ বা ডিসকাউন্ট ব্যাজ' : 'Offer Badge / Tag Text'}
                  </label>
                  <input
                    type="text"
                    value={newProd.offerTag}
                    onChange={(e) => setNewProd({ ...newProd, offerTag: e.target.value })}
                    placeholder="যেমন: ধামাকা অফার / ৫০% ছাড় / স্পেশাল ডিল"
                    className="w-full p-2 bg-white border border-sky-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="যেমন: স্মার্ট ওয়াচ আল্ট্রা ৮ প্রো"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">ক্যাটাগরি</label>
                <select
                  value={newProd.category}
                  onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 font-semibold"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">স্টক পরিমাণ</label>
                <input
                  type="number"
                  required
                  value={newProd.stock}
                  onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">অফার বিক্রয় মূল্য (৳) *</label>
                <input
                  type="number"
                  required
                  value={newProd.sellingPrice}
                  onChange={(e) => setNewProd({ ...newProd, sellingPrice: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sky-700"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">পূর্বের মূল্য / গায়ের দাম (৳)</label>
                <input
                  type="number"
                  value={newProd.oldPrice}
                  onChange={(e) => setNewProd({ ...newProd, oldPrice: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">রিসেলার কমিশন লাভ (৳)</label>
                <input
                  type="number"
                  value={newProd.resellerProfit}
                  onChange={(e) => setNewProd({ ...newProd, resellerProfit: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sky-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">হোলসেল ক্রয় মূল্য (৳)</label>
                <input
                  type="number"
                  value={newProd.supplierPrice}
                  onChange={(e) => setNewProd({ ...newProd, supplierPrice: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Picture Upload / URL */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-gray-700 block">পণ্যের ছবি</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newProd.images[0] || ''}
                    onChange={(e) => setNewProd({ ...newProd, images: [e.target.value] })}
                    placeholder="https://... ছবির লিংক দিন"
                    className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                  <input
                    ref={addFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAddImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    className="px-3 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ফাইল আপলোড' : 'Upload'}</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">পণ্যের বিবরণ</label>
                <textarea
                  rows={2}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                পণ্য সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveEditProduct}
            className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-1.5">
                <Edit3 className="w-5 h-5 text-sky-600" />
                <span>{isBn ? 'পণ্য তথ্য ও অফার এডিট করুন' : 'Edit Product & Offer Settings'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Offer Product Setting inside Edit Modal */}
            <div className="bg-sky-50/90 border border-sky-200 p-3 rounded-2xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editingProduct.isOfferProduct}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isOfferProduct: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-400 cursor-pointer"
                />
                <span className="text-xs font-black text-gray-900 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-red-600 fill-current" />
                  <span>{isBn ? 'হোমপেজের উপরের লাইনে "অফার প্রোডাক্ট" হিসেবে দেখান' : 'Show as Offer Product in Top Line'}</span>
                </span>
              </label>
              {editingProduct.isOfferProduct && (
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    {isBn ? 'অফার ট্যাগ বা ডিসকাউন্ট ব্যাজ' : 'Offer Badge / Tag Text'}
                  </label>
                  <input
                    type="text"
                    value={editingProduct.offerTag || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, offerTag: e.target.value })}
                    placeholder="যেমন: ধামাকা অফার / ৫০% ছাড় / স্পেশাল ডিল"
                    className="w-full p-2 bg-white border border-sky-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">ক্যাটাগরি</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">স্টক সংখ্যা</label>
                <input
                  type="number"
                  required
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">বিক্রয় মূল্য (৳) *</label>
                <input
                  type="number"
                  required
                  value={editingProduct.sellingPrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sky-700"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">পূর্বের মূল্য / ডিসকাউন্ট রেফারেন্স (৳)</label>
                <input
                  type="number"
                  value={editingProduct.oldPrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">রিসেলার লাভ (৳)</label>
                <input
                  type="number"
                  required
                  value={editingProduct.resellerProfit}
                  onChange={(e) => setEditingProduct({ ...editingProduct, resellerProfit: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sky-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">সাপ্লায়ার মূল্য (৳)</label>
                <input
                  type="number"
                  value={editingProduct.supplierPrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, supplierPrice: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-gray-700 block">ছবি লিংক বা ফাইল আপলোড</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={editingProduct.images[0] || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                    className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-3 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ছবি পরিবর্তন' : 'Upload'}</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">পণ্যের বিবরণ</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                পরিবর্তন সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <h4 className="font-black text-base text-gray-900">আপনি কি নিশ্চিত?</h4>
            <p className="text-xs text-gray-500">এই পণ্যটি শপ ও রিসেলিং তালিকা থেকে স্থায়ীভাবে মুছে ফেলা হবে।</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  adminDeleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2.5 bg-red-600 text-white font-black text-xs rounded-xl shadow-xs"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
