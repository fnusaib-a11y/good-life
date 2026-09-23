import React from 'react';
import { X, Store, Star, ShieldCheck, Mail, Phone, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VendorListModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { products, language, vendors: adminVendors, shops, setActiveShopId, setViewingShopId } = useApp();
  const isBn = language === 'bn';

  // Only show active vendors approved by Admin
  const activeVendors = adminVendors.filter(v => v.status === 'active');

  // Fallback to product-derived vendors if no admin vendors are created yet
  const displayVendors = activeVendors.length > 0 ? activeVendors.map(v => {
    const shop = shops.find(s => s.id === v.shopId);
    const prodCount = products.filter(p => p.vendorId === v.id || p.vendorName?.toLowerCase() === v.name.toLowerCase()).length;
    return {
      id: v.id,
      name: v.name,
      shopId: v.shopId,
      shopName: shop?.name || 'অফিসিয়াল শপ',
      email: v.email,
      phone: v.phone,
      rating: 4.9,
      productsCount: prodCount,
      avatar: v.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      canAddProduct: v.permissions?.canAddProduct ?? false
    };
  }) : products.reduce((acc: any[], prod) => {
    const vName = prod.vendorName?.trim();
    if (!vName) return acc;
    const vId = prod.vendorId || `vnd_${vName.toLowerCase().replace(/\s+/g, '_')}`;
    const existing = acc.find(item => item.id === vId);
    if (existing) {
      existing.productsCount += 1;
    } else {
      acc.push({
        id: vId,
        name: vName,
        shopId: prod.shopId || 'shop_main',
        shopName: 'অফিসিয়াল শপ',
        email: 'vendor@platform.com',
        phone: '01700-000000',
        rating: prod.rating || 5.0,
        productsCount: 1,
        avatar: prod.images[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        canAddProduct: true
      });
    }
    return acc;
  }, []);

  const handleSelectVendorShop = (shopId: string) => {
    if (shopId) {
      setActiveShopId(shopId);
      setViewingShopId(shopId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        {/* Header */}
        <div className="bg-sky-500 px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            <h3 className="font-extrabold text-base">
              {isBn ? 'এডমিন অনুমোদিত ভেন্ডর তালিকা' : 'Admin Approved Vendors List'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vendors List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {displayVendors.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-600">
                {isBn ? 'বর্তমানে কোনো সক্রিয় ভেন্ডর নেই' : 'No active vendors currently'}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                {isBn ? 'শুধুমাত্র এডমিন প্যানেল থেকে অনুমোদিত ভেন্ডররা এখানে প্রদর্শিত হয়।' : 'Only admin-approved vendors appear here.'}
              </p>
            </div>
          ) : (
            displayVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={vendor.avatar}
                    alt={vendor.name}
                    className="w-12 h-12 rounded-xl object-cover border border-sky-300"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-gray-900">{vendor.name}</h4>
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-gray-500 font-semibold mt-0.5">
                      <Store className="w-3 h-3 text-emerald-600" />
                      <span>{vendor.shopName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                      <span className="flex items-center gap-0.5 text-sky-600 font-bold">
                        <Star className="w-3 h-3 fill-sky-500 text-sky-500" /> {vendor.rating}
                      </span>
                      <span>•</span>
                      <span>{vendor.productsCount} {isBn ? 'টি পণ্য' : 'products'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectVendorShop(vendor.shopId)}
                  className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-[10.5px] rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  {isBn ? 'শপ দেখুন' : 'View Shop'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorListModal;
