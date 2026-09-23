import React, { useState, useRef } from 'react';
import { 
  Store, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  Eye, 
  EyeOff, 
  Image as ImageIcon, 
  Upload, 
  Smartphone, 
  ArrowUpDown, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  X,
  Check,
  Building2,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Shop, ShopPaymentMethods } from '../../types';

export const AdminShopManagementTab: React.FC = () => {
  const { 
    shops, 
    vendors, 
    products,
    refreshShops, 
    adminCreateShop, 
    adminUpdateShop, 
    adminDeleteShop, 
    adminToggleShopStatus,
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [deleteConfirmShopId, setDeleteConfirmShopId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    logo: string;
    banner?: string;
    status: 'active' | 'inactive';
    displayOrder: number;
    showVendorInfo: boolean;
    paymentMethods: ShopPaymentMethods;
  }>({
    name: '',
    description: '',
    logo: '',
    banner: '',
    status: 'active',
    displayOrder: 1,
    showVendorInfo: true,
    paymentMethods: {
      bkash: {
        number: '',
        enabled: true,
        type: 'personal',
        instructions: 'বিকাশ অ্যাপ বা *২৪৭# ডায়াল করে Send Money করুন।'
      },
      nagad: {
        number: '',
        enabled: true,
        type: 'personal',
        instructions: 'নগদ অ্যাপ বা *১৬৭# ডায়াল করে Send Money করুন।'
      },
      rocket: {
        number: '',
        enabled: false,
        type: 'personal',
        instructions: 'রকেট অ্যাপ বা *৩২২# ডায়াল করে Send Money করুন।'
      }
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logo: '',
      banner: '',
      status: 'active',
      displayOrder: shops.length + 1,
      showVendorInfo: true,
      paymentMethods: {
        bkash: {
          number: '',
          enabled: true,
          type: 'personal',
          instructions: 'বিকাশ অ্যাপ বা *২৪৭# ডায়াল করে Send Money করুন।'
        },
        nagad: {
          number: '',
          enabled: true,
          type: 'personal',
          instructions: 'নগদ অ্যাপ বা *১৬৭# ডায়াল করে Send Money করুন।'
        },
        rocket: {
          number: '',
          enabled: false,
          type: 'personal',
          instructions: 'রকেট অ্যাপ বা *৩২২# ডায়াল করে Send Money করুন।'
        }
      }
    });
    setEditingShop(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (shop: Shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name || '',
      description: shop.description || '',
      logo: shop.logo || '',
      banner: shop.banner || '',
      status: shop.status || 'active',
      displayOrder: typeof shop.displayOrder === 'number' ? shop.displayOrder : 1,
      showVendorInfo: shop.showVendorInfo !== false,
      paymentMethods: {
        bkash: {
          number: shop.paymentMethods?.bkash?.number || '',
          enabled: shop.paymentMethods?.bkash?.enabled !== false,
          type: shop.paymentMethods?.bkash?.type || 'personal',
          instructions: shop.paymentMethods?.bkash?.instructions || 'বিকাশ Send Money করুন।'
        },
        nagad: {
          number: shop.paymentMethods?.nagad?.number || '',
          enabled: shop.paymentMethods?.nagad?.enabled !== false,
          type: shop.paymentMethods?.nagad?.type || 'personal',
          instructions: shop.paymentMethods?.nagad?.instructions || 'নগদ Send Money করুন।'
        },
        rocket: {
          number: shop.paymentMethods?.rocket?.number || '',
          enabled: Boolean(shop.paymentMethods?.rocket?.enabled),
          type: shop.paymentMethods?.rocket?.type || 'personal',
          instructions: shop.paymentMethods?.rocket?.instructions || 'রকেট Send Money করুন।'
        },
        custom: shop.paymentMethods?.custom
      }
    });
    setIsCreateModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
        showToast('লোগো সফলভাবে লোড হয়েছে!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('অনুগ্রহ করে শপ-এর নাম প্রদান করুন!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingShop) {
        await adminUpdateShop(editingShop.id, formData);
      } else {
        await adminCreateShop(formData);
      }
      setIsCreateModalOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (shopId: string) => {
    await adminDeleteShop(shopId);
    setDeleteConfirmShopId(null);
  };

  const sortedShops = [...shops].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>{isBn ? 'শপ ও পেমেন্ট ম্যানেজমেন্ট' : 'Shop & Payment Management'}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                  Admin Controlled
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isBn 
                  ? 'একাধিক শপ তৈরি করুন, বিকাশ/নগদ/রকেট পেমেন্ট নম্বর ও প্রদর্শন স্ট্যাটাস নিয়ন্ত্রণ করুন।' 
                  : 'Create multiple shops, control payment numbers and live user visibility.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshShops()}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-colors cursor-pointer"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="admin-create-shop-btn"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isBn ? 'নতুন শপ তৈরি করুন' : 'Create New Shop'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="text-[11px] font-bold text-gray-500">মোট শপ</div>
            <div className="text-xl font-black text-gray-900 mt-1">{shops.length}</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <div className="text-[11px] font-bold text-emerald-700">সক্রিয় শপ (Active)</div>
            <div className="text-xl font-black text-emerald-800 mt-1">
              {shops.filter(s => s.status === 'active').length}
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <div className="text-[11px] font-bold text-amber-700">নিষ্ক্রিয় শপ (Inactive)</div>
            <div className="text-xl font-black text-amber-800 mt-1">
              {shops.filter(s => s.status === 'inactive').length}
            </div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <div className="text-[11px] font-bold text-indigo-700">অনুমোদিত ভেন্ডর</div>
            <div className="text-xl font-black text-indigo-800 mt-1">{vendors.length}</div>
          </div>
        </div>
      </div>

        {/* Informational Guidance Note */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-sky-900">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-black text-sky-950">অ্যাডমিন কন্ট্রোল্ড সিস্টেম নীতি:</span>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              ইউজাররা শুধুমাত্র যেসকল শপ সক্রিয় (Active) অবস্থায় রাখবেন সেগুলো দেখতে পাবেন। প্রতিটি শপের বিকাশ, নগদ বা রকেট নম্বরে ইউজার চেকআউটের সময় ক্যাশআউট বা সেন্ড মানি করবেন। কোনো ইউজার নিজে নিজে ভেন্ডর হতে পারবেন না।
            </p>
          </div>
        </div>

      {/* Shop Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <span>{isBn ? 'শপ তালিকা ও পেমেন্ট নম্বর' : 'Shops List & Payment Numbers'}</span>
            <span className="text-xs text-gray-400 font-bold">({sortedShops.length}টি)</span>
          </h3>
        </div>

        {sortedShops.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">কোনো শপ তৈরি করা হয়নি!</p>
            <p className="text-xs text-gray-400 mt-1">
              উপরের &quot;নতুন শপ তৈরি করুন&quot; বাটনে ক্লিক করে নতুন শপ যুক্ত করুন।
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              প্রথম শপ তৈরি করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedShops.map((shop) => {
              const shopVendors = vendors.filter(v => v.shopId === shop.id);
              const shopProducts = products.filter(p => p.shopId === shop.id || (!p.shopId && shop.id === 'shop_main'));
              const isActive = shop.status === 'active';

              return (
                <div 
                  key={shop.id}
                  className={`bg-white rounded-2xl p-4.5 border transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                    isActive ? 'border-gray-200' : 'border-amber-200/80 bg-amber-50/20 opacity-90'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center">
                          {shop.logo ? (
                            <img 
                              src={shop.logo} 
                              alt={shop.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Store className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-gray-900">{shop.name}</h4>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono font-bold">
                              ক্রম: {shop.displayOrder || 1}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {shop.description || 'অফিসিয়াল অনুমোদিত শপ'}
                          </p>
                        </div>
                      </div>

                      {/* Status toggle pill */}
                      <button
                        onClick={() => adminToggleShopStatus(shop.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>সক্রিয় (Active)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-amber-600" />
                            <span>নিষ্ক্রিয় (Inactive)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Stats pills */}
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-md">
                        পণ্য: {shopProducts.length}টি
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                        ভেন্ডর: {shopVendors.length}জন
                      </span>
                      {shop.showVendorInfo && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                          ভেন্ডর তথ্য প্রকাশ
                        </span>
                      )}
                    </div>

                    {/* Payment Numbers Section */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-150">
                      <div className="text-[11px] font-black text-gray-800 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-gray-600" />
                        <span>সেট করা পেমেন্ট নম্বরসমূহ:</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        {/* bKash */}
                        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#D12053] text-[11px]">বিকাশ</span>
                            <span className="font-mono text-xs font-bold text-gray-900">
                              {shop.paymentMethods?.bkash?.number || 'নম্বর সেট নেই'}
                            </span>
                            <span className="text-[9px] bg-gray-100 text-gray-600 px-1 rounded">
                              {shop.paymentMethods?.bkash?.type === 'merchant' ? 'মার্চেন্ট' : 'পার্সোনাল'}
                            </span>
                          </div>
                          <div>
                            {shop.paymentMethods?.bkash?.enabled ? (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                <Eye className="w-3 h-3" /> চালু
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5">
                                <EyeOff className="w-3 h-3" /> বন্ধ
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Nagad */}
                        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#ED1C24] text-[11px]">নগদ</span>
                            <span className="font-mono text-xs font-bold text-gray-900">
                              {shop.paymentMethods?.nagad?.number || 'নম্বর সেট নেই'}
                            </span>
                            <span className="text-[9px] bg-gray-100 text-gray-600 px-1 rounded">
                              {shop.paymentMethods?.nagad?.type === 'merchant' ? 'মার্চেন্ট' : 'পার্সোনাল'}
                            </span>
                          </div>
                          <div>
                            {shop.paymentMethods?.nagad?.enabled ? (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                <Eye className="w-3 h-3" /> চালু
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5">
                                <EyeOff className="w-3 h-3" /> বন্ধ
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rocket */}
                        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#8C3494] text-[11px]">রকেট</span>
                            <span className="font-mono text-xs font-bold text-gray-900">
                              {shop.paymentMethods?.rocket?.number || 'নম্বর সেট নেই'}
                            </span>
                            <span className="text-[9px] bg-gray-100 text-gray-600 px-1 rounded">
                              {shop.paymentMethods?.rocket?.type === 'merchant' ? 'মার্চেন্ট' : 'পার্সোনাল'}
                            </span>
                          </div>
                          <div>
                            {shop.paymentMethods?.rocket?.enabled ? (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                <Eye className="w-3 h-3" /> চালু
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5">
                                <EyeOff className="w-3 h-3" /> বন্ধ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEdit(shop)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-black rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                      <span>এডিট ও পেমেন্ট নম্বর</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {deleteConfirmShopId === shop.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                          <span className="text-[10px] text-rose-700 font-bold px-1">মুছে ফেলবেন?</span>
                          <button
                            onClick={() => handleDelete(shop.id)}
                            className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded cursor-pointer"
                          >
                            হ্যাঁ
                          </button>
                          <button
                            onClick={() => setDeleteConfirmShopId(null)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-[10px] font-bold rounded cursor-pointer"
                          >
                            না
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmShopId(shop.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="শপ মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Shop Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
            {/* Modal Header */}
            <div className="bg-emerald-600 px-5 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                <h3 className="font-black text-base">
                  {editingShop ? 'শপ সেটিংস ও পেমেন্ট নম্বর এডিট' : 'নতুন শপ ও পেমেন্ট তৈরি'}
                </h3>
              </div>
              <button
                onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Section 1: Basic Info */}
              <div className="space-y-3">
                <div className="text-xs font-black text-gray-900 flex items-center gap-1.5 border-b pb-2 border-gray-100">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>১. শপ সাধারণ তথ্য (Shop Information)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      শপ-এর নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="যেমন: অফিসিয়াল গ্যাজেট মার্ট"
                      className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      ডিসপ্লে ক্রম (Display Order)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                      placeholder="1, 2, 3..."
                      className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    শপ বিবরণী (Description)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="শপ সম্পর্কে সংক্ষিপ্ত বিবরণ..."
                    className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none resize-none"
                  />
                </div>

                {/* Logo input and upload */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    শপ লোগো / ছবি URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                      placeholder="https://... অথবা ডিভাইস থেকে আপলোড করুন"
                      className="flex-1 text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>আপলোড</span>
                    </button>
                  </div>
                  {formData.logo && (
                    <div className="mt-2 flex items-center gap-2">
                      <img 
                        src={formData.logo} 
                        alt="Logo Preview" 
                        className="w-10 h-10 rounded-xl object-cover border border-gray-200" 
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] text-gray-500">প্রিভিউ</span>
                    </div>
                  )}
                </div>

                {/* Status Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-gray-900">শপ স্ট্যাটাস</div>
                      <div className="text-[10px] text-gray-500">ইউজার সাইডে শপটি দৃশ্যমান থাকবে কি না</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.status === 'active'}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-gray-900">ভেন্ডর তথ্য প্রদর্শন</div>
                      <div className="text-[10px] text-gray-500">ইউজারদের কাছে স্টোর/ভেন্ডর তথ্য দেখাবে</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showVendorInfo}
                        onChange={(e) => setFormData(prev => ({ ...prev, showVendorInfo: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Number Management */}
              <div className="space-y-4 pt-3">
                <div className="text-xs font-black text-gray-900 flex items-center justify-between border-b pb-2 border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>২. পেমেন্ট নম্বর ও মেথড কন্ট্রোল (Payment Methods Setup)</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold">Admin Controlled</span>
                </div>

                {/* bKash Configuration */}
                <div className="p-3.5 bg-pink-50/50 rounded-2xl border border-pink-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#D12053] text-xs">বিকাশ (bKash) পেমেন্ট সেটিংস</span>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.paymentMethods.bkash.enabled}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            bkash: { ...prev.paymentMethods.bkash, enabled: e.target.checked }
                          }
                        }))}
                        className="w-4 h-4 text-[#D12053] rounded focus:ring-0"
                      />
                      <span>চালু রাখুন</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">বিকাশ নম্বর</label>
                      <input
                        type="tel"
                        value={formData.paymentMethods.bkash.number}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            bkash: { ...prev.paymentMethods.bkash, number: e.target.value }
                          }
                        }))}
                        placeholder="017XXXXXXXX"
                        className="w-full text-xs font-mono font-bold p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#D12053] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">হিসাব ধরন</label>
                      <select
                        value={formData.paymentMethods.bkash.type}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            bkash: { ...prev.paymentMethods.bkash, type: e.target.value as any }
                          }
                        }))}
                        className="w-full text-xs font-semibold p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#D12053] focus:outline-none"
                      >
                        <option value="personal">পার্সোনাল (Personal Send Money)</option>
                        <option value="merchant">মার্চেন্ট (Merchant Payment)</option>
                        <option value="agent">এজেন্ট (Agent Cash Out)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">ইউজার নির্দেশনা</label>
                    <input
                      type="text"
                      value={formData.paymentMethods.bkash.instructions}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        paymentMethods: {
                          ...prev.paymentMethods,
                          bkash: { ...prev.paymentMethods.bkash, instructions: e.target.value }
                        }
                      }))}
                      placeholder="বিকাশ অ্যাপ থেকে Send Money করে TrxID প্রদান করুন।"
                      className="w-full text-[11px] p-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                {/* Nagad Configuration */}
                <div className="p-3.5 bg-orange-50/50 rounded-2xl border border-orange-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#ED1C24] text-xs">নগদ (Nagad) পেমেন্ট সেটিংস</span>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.paymentMethods.nagad.enabled}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            nagad: { ...prev.paymentMethods.nagad, enabled: e.target.checked }
                          }
                        }))}
                        className="w-4 h-4 text-[#ED1C24] rounded focus:ring-0"
                      />
                      <span>চালু রাখুন</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">নগদ নম্বর</label>
                      <input
                        type="tel"
                        value={formData.paymentMethods.nagad.number}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            nagad: { ...prev.paymentMethods.nagad, number: e.target.value }
                          }
                        }))}
                        placeholder="018XXXXXXXX"
                        className="w-full text-xs font-mono font-bold p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#ED1C24] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">হিসাব ধরন</label>
                      <select
                        value={formData.paymentMethods.nagad.type}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            nagad: { ...prev.paymentMethods.nagad, type: e.target.value as any }
                          }
                        }))}
                        className="w-full text-xs font-semibold p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#ED1C24] focus:outline-none"
                      >
                        <option value="personal">পার্সোনাল (Personal Send Money)</option>
                        <option value="merchant">মার্চেন্ট (Merchant Payment)</option>
                        <option value="agent">এজেন্ট (Agent Cash Out)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">ইউজার নির্দেশনা</label>
                    <input
                      type="text"
                      value={formData.paymentMethods.nagad.instructions}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        paymentMethods: {
                          ...prev.paymentMethods,
                          nagad: { ...prev.paymentMethods.nagad, instructions: e.target.value }
                        }
                      }))}
                      placeholder="নগদ অ্যাপ থেকে Send Money করে TrxID দিন।"
                      className="w-full text-[11px] p-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                {/* Rocket Configuration */}
                <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#8C3494] text-xs">রকেট (Rocket) পেমেন্ট সেটিংস</span>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.paymentMethods.rocket.enabled}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            rocket: { ...prev.paymentMethods.rocket, enabled: e.target.checked }
                          }
                        }))}
                        className="w-4 h-4 text-[#8C3494] rounded focus:ring-0"
                      />
                      <span>চালু রাখুন</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">রকেট নম্বর</label>
                      <input
                        type="tel"
                        value={formData.paymentMethods.rocket.number}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            rocket: { ...prev.paymentMethods.rocket, number: e.target.value }
                          }
                        }))}
                        placeholder="019XXXXXXXXX (12 ডিজিট)"
                        className="w-full text-xs font-mono font-bold p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#8C3494] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">হিসাব ধরন</label>
                      <select
                        value={formData.paymentMethods.rocket.type}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            rocket: { ...prev.paymentMethods.rocket, type: e.target.value as any }
                          }
                        }))}
                        className="w-full text-xs font-semibold p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#8C3494] focus:outline-none"
                      >
                        <option value="personal">পার্সোনাল (Personal Send Money)</option>
                        <option value="merchant">মার্চেন্ট (Merchant Payment)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">ইউজার নির্দেশনা</label>
                    <input
                      type="text"
                      value={formData.paymentMethods.rocket.instructions}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        paymentMethods: {
                          ...prev.paymentMethods,
                          rocket: { ...prev.paymentMethods.rocket, instructions: e.target.value }
                        }
                      }))}
                      placeholder="রকেট একাউন্ট থেকে Send Money করুন।"
                      className="w-full text-[11px] p-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>সংরক্ষণ হচ্ছে...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingShop ? 'আপডেট করুন' : 'শপ সংরক্ষণ করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
