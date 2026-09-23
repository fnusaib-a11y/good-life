import React, { useState } from 'react';
import { 
  Users, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Store, 
  Phone, 
  UserCheck, 
  RefreshCw,
  X,
  Check,
  PackagePlus,
  ShoppingBag,
  Sliders,
  Search,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShopVendor, VendorPermissions } from '../../types';

export const AdminVendorManagementTab: React.FC = () => {
  const { 
    vendors, 
    shops, 
    registeredUsers,
    refreshVendors, 
    adminCreateVendor, 
    adminUpdateVendor, 
    adminDeleteVendor, 
    adminToggleVendorStatus,
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<ShopVendor | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShopFilter, setSelectedShopFilter] = useState('all');

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    userId: string;
    phone: string;
    shopId: string;
    status: 'active' | 'inactive';
    permissions: VendorPermissions;
  }>({
    name: '',
    userId: '',
    phone: '',
    shopId: shops[0]?.id || 'shop_main',
    status: 'active',
    permissions: {
      canAddProducts: true,
      canManageOrders: true,
      canEditStock: true,
      canViewAnalytics: true
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      userId: '',
      phone: '',
      shopId: shops[0]?.id || 'shop_main',
      status: 'active',
      permissions: {
        canAddProducts: true,
        canManageOrders: true,
        canEditStock: true,
        canViewAnalytics: true
      }
    });
    setEditingVendor(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor: ShopVendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name || '',
      userId: vendor.userId || '',
      phone: vendor.phone || '',
      shopId: vendor.shopId || shops[0]?.id || 'shop_main',
      status: vendor.status || 'active',
      permissions: {
        canAddProducts: vendor.permissions?.canAddProducts !== false,
        canManageOrders: vendor.permissions?.canManageOrders !== false,
        canEditStock: vendor.permissions?.canEditStock !== false,
        canViewAnalytics: vendor.permissions?.canViewAnalytics !== false
      }
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('অনুগ্রহ করে ভেন্ডরের নাম ও ফোন নম্বর প্রদান করুন!');
      return;
    }

    setIsSubmitting(true);
    try {
      const assignedShop = shops.find(s => s.id === formData.shopId);
      const payload: Partial<ShopVendor> = {
        name: formData.name.trim(),
        userId: formData.userId.trim() || `usr_${Date.now()}`,
        phone: formData.phone.trim(),
        shopId: formData.shopId,
        shopName: assignedShop?.name || 'অফিসিয়াল শপ',
        status: formData.status,
        permissions: formData.permissions
      };

      if (editingVendor) {
        await adminUpdateVendor(editingVendor.id, payload);
      } else {
        await adminCreateVendor(payload);
      }
      setIsModalOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (vendorId: string) => {
    await adminDeleteVendor(vendorId);
    setDeleteConfirmId(null);
  };

  const filteredVendors = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        v.phone.includes(searchQuery) ||
                        (v.shopName && v.shopName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchShop = selectedShopFilter === 'all' || v.shopId === selectedShopFilter;
    return matchSearch && matchShop;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>{isBn ? 'ভেন্ডর অনুমোদন ও পারমিশন কন্ট্রোল' : 'Vendor Approvals & Permissions'}</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-0.5 rounded-full">
                  Admin Only
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isBn 
                  ? 'শুধুমাত্র অ্যাডমিন অনুমোদিত ভেন্ডররা নির্দিষ্ট শপে প্রোডাক্ট যুক্ত বা পরিচালনা করতে পারেন।' 
                  : 'Only admin-approved vendors can manage products or orders for assigned shops.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshVendors()}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-colors cursor-pointer"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="admin-create-vendor-btn"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isBn ? 'নতুন ভেন্ডর অনুমোদন করুন' : 'Approve New Vendor'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="text-[11px] font-bold text-gray-500">মোট অনুমোদিত ভেন্ডর</div>
            <div className="text-xl font-black text-gray-900 mt-1">{vendors.length}</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <div className="text-[11px] font-bold text-emerald-700">সক্রিয় ভেন্ডর (Active)</div>
            <div className="text-xl font-black text-emerald-800 mt-1">
              {vendors.filter(v => v.status === 'active').length}
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <div className="text-[11px] font-bold text-amber-700">নিষ্ক্রিয় ভেন্ডর</div>
            <div className="text-xl font-black text-amber-800 mt-1">
              {vendors.filter(v => v.status === 'inactive').length}
            </div>
          </div>
          <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
            <div className="text-[11px] font-bold text-sky-700">অ্যাসাইন শপসমূহ</div>
            <div className="text-xl font-black text-sky-800 mt-1">{shops.length}টি শপ</div>
          </div>
        </div>
      </div>

      {/* Security Rule Badge */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-black">ভেন্ডর নিরাপত্তা পলিসি:</span> কোনো সাধারণ ইউজার নিজে নিজে ভেন্ডর হতে পারেন না। অ্যাডমিন প্যানেল থেকে শুধুমাত্র অনুমোদিত ব্যক্তি নির্দিষ্ট শপের ইনভেন্টরি ও প্রোডাক্ট পরিচালনা করতে পারেন।
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-gray-150 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ভেন্ডর বা ফোন নম্বর খুঁজুন..."
            className="w-full text-xs font-semibold pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-gray-500 shrink-0">শপ ফিল্টার:</span>
          <select
            value={selectedShopFilter}
            onChange={(e) => setSelectedShopFilter(e.target.value)}
            className="w-full sm:w-auto text-xs font-semibold p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
          >
            <option value="all">সকল শপ ({vendors.length})</option>
            {shops.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendors Table / Grid */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <span>ভেন্ডর তালিকা ({filteredVendors.length})</span>
          </h3>
        </div>

        {filteredVendors.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">কোনো ভেন্ডর পাওয়া যায়নি</p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery ? 'সার্চ ফিল্টারে কোনো ফলাফল নেই।' : 'নতুন ভেন্ডর যুক্ত করতে উপরের বাটনে ক্লিক করুন।'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredVendors.map((vendor) => {
              const assignedShop = shops.find(s => s.id === vendor.shopId);
              const isActive = vendor.status === 'active';

              return (
                <div 
                  key={vendor.id}
                  className="p-4 hover:bg-gray-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Avatar & Basic Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-base border border-indigo-100 shrink-0">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-gray-900">{vendor.name}</h4>
                        <button
                          onClick={() => adminToggleVendorStatus(vendor.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>সক্রিয়</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-amber-600" />
                              <span>নিষ্ক্রিয়</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1 font-mono font-bold text-gray-700">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {vendor.phone}
                        </span>
                        <span>UID: {vendor.userId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Assigned Shop & Permissions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Assigned Shop */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-xl text-xs">
                      <Store className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-[11px] font-bold text-gray-600">শপ:</span>
                      <span className="font-black text-gray-900">{assignedShop?.name || vendor.shopName || 'মেইন শপ'}</span>
                    </div>

                    {/* Permissions Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        vendor.permissions?.canAddProducts !== false 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-gray-100 text-gray-400 line-through'
                      }`}>
                        প্রোডাক্ট অ্যাড
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        vendor.permissions?.canManageOrders !== false 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-400 line-through'
                      }`}>
                        অর্ডার প্রসেস
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        vendor.permissions?.canEditStock !== false 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                          : 'bg-gray-100 text-gray-400 line-through'
                      }`}>
                        স্টক এডিট
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleOpenEdit(vendor)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>

                    {deleteConfirmId === vendor.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                        <span className="text-[10px] text-rose-700 font-bold px-1">বাদ দেবেন?</span>
                        <button
                          onClick={() => handleDelete(vendor.id)}
                          className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded cursor-pointer"
                        >
                          হ্যাঁ
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 text-[10px] font-bold rounded cursor-pointer"
                        >
                          না
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(vendor.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="ভেন্ডর মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-black text-base">
                  {editingVendor ? 'ভেন্ডর তথ্য ও পারমিশন এডিট' : 'নতুন ভেন্ডর অনুমোদন ও শপ অ্যাসাইন'}
                </h3>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  ভেন্ডর-এর পূর্ণ নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="যেমন: তানভীর আহমেদ / গ্যাজেট সাপ্লায়ার"
                  className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    ইউজার আইডি / UID
                  </label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="যেমন: usr_12345"
                    className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  কোন শপ-এর ভেন্ডর হবে? <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.shopId}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopId: e.target.value }))}
                  className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Toggle */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-gray-900">ভেন্ডর স্ট্যাটাস</div>
                  <div className="text-[10px] text-gray-500">ভেন্ডর অ্যাকাউন্ট সক্রিয় বা স্থগিত রাখুন</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Permissions Checklist */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="block text-xs font-black text-gray-900">
                  ভেন্ডর পারমিশন ও অনুমতি (Vendor Permissions):
                </label>
                
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-2.5 bg-gray-50 hover:bg-gray-100/70 rounded-xl border border-gray-200 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canAddProducts}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canAddProducts: e.target.checked }
                      }))}
                      className="w-4 h-4 text-indigo-600 rounded mt-0.5 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-black text-gray-900">পণ্য যুক্ত করার অনুমতি (canAddProducts)</div>
                      <div className="text-[10px] text-gray-500">ভেন্ডর এই শপে নতুন পণ্য ও মূল্য অ্যাড করতে পারবে</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-gray-50 hover:bg-gray-100/70 rounded-xl border border-gray-200 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canManageOrders}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canManageOrders: e.target.checked }
                      }))}
                      className="w-4 h-4 text-indigo-600 rounded mt-0.5 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-black text-gray-900">অর্ডার পরিচালনা অনুমতি (canManageOrders)</div>
                      <div className="text-[10px] text-gray-500">ভেন্ডর নিজের শপের অর্ডার দেখতে ও প্রসেসিং করতে পারবে</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-gray-50 hover:bg-gray-100/70 rounded-xl border border-gray-200 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canEditStock}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canEditStock: e.target.checked }
                      }))}
                      className="w-4 h-4 text-indigo-600 rounded mt-0.5 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-black text-gray-900">স্টক ও ইনভেন্টরি এডিট অনুমতি (canEditStock)</div>
                      <div className="text-[10px] text-gray-500">পণ্যের স্টক সংখ্যা ও বিক্রয়মূল্য পরিবর্তন করার ক্ষমতা</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>সংরক্ষণ হচ্ছে...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingVendor ? 'আপডেট করুন' : 'ভেন্ডর অনুমোদন করুন'}</span>
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
