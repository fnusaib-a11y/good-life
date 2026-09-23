import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppBanner, AppTab } from '../../types';

export const AdminBannersTab: React.FC = () => {
  const { 
    banners, 
    adminAddBanner, 
    adminUpdateBanner, 
    adminDeleteBanner, 
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AppBanner | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    actionTab: 'jobs' as AppTab,
    position: 'all' as 'all' | 'home' | 'shop' | 'jobs',
    badge: 'স্পেশাল অফার',
    isActive: true
  });

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.title || !newBanner.imageUrl) {
      showToast('ব্যানারের শিরোনাম ও ছবির লিংক দিন!');
      return;
    }

    adminAddBanner({
      title: newBanner.title,
      subtitle: newBanner.subtitle,
      imageUrl: newBanner.imageUrl,
      actionTab: newBanner.actionTab,
      position: newBanner.position,
      badge: newBanner.badge,
      isActive: newBanner.isActive
    });

    setShowAddModal(false);
    setNewBanner({
      title: '',
      subtitle: '',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
      actionTab: 'jobs',
      position: 'all',
      badge: 'স্পেশাল অফার',
      isActive: true
    });
  };

  const handleSaveEditBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    adminUpdateBanner(editingBanner.id, {
      title: editingBanner.title,
      subtitle: editingBanner.subtitle,
      imageUrl: editingBanner.imageUrl,
      actionTab: editingBanner.actionTab,
      position: editingBanner.position || 'all',
      badge: editingBanner.badge,
      isActive: editingBanner.isActive
    });
    setEditingBanner(null);
  };

  return (
    <div className="space-y-3.5">
      {/* Top Banner Add Button */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-gray-900">
            {isBn ? 'হোম পেজ ব্যানার ও পোস্টার কন্ট্রোল' : 'Home Promo Banners & Sliders'}
          </h3>
          <p className="text-[11px] text-gray-500 font-medium">
            {isBn ? 'হোম পেজের আকর্ষণীয় ব্যানার ও অফার পোস্টার পরিচালনা করুন' : 'Manage promotional posters and redirect links'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isBn ? 'নতুন ব্যানার পোস্টার' : 'Add Banner'}</span>
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {banners.map(banner => (
          <div 
            key={banner.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden"
          >
            <div className="relative h-32 w-full bg-gray-900">
              <img 
                src={banner.imageUrl} 
                alt={banner.title} 
                className={`w-full h-full object-cover ${!banner.isActive ? 'opacity-40 grayscale' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  {banner.badge && (
                    <span className="px-2 py-0.5 bg-sky-500 text-white text-[10px] font-black rounded-lg">
                      {banner.badge}
                    </span>
                  )}

                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    banner.isActive ? 'bg-sky-500 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {banner.isActive ? 'সক্রিয়' : 'বন্ধ'}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-xs sm:text-sm text-white line-clamp-1">
                    {banner.title}
                  </h4>
                  {banner.subtitle && (
                    <p className="text-[10px] text-gray-200 line-clamp-1">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 flex items-center justify-between bg-white text-xs">
              <div className="flex items-center gap-2 text-gray-600 text-[11px] font-bold flex-wrap">
                <div className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-sky-500" />
                  <span>টার্গেট: {banner.actionTab || 'home'}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 text-[10px] font-extrabold border border-sky-200">
                  {banner.position === 'shop' ? 'শপ পেজ' : banner.position === 'jobs' ? 'জবস পেজ' : banner.position === 'home' ? 'হোম পেজ' : 'সকল পেজ'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingBanner({ ...banner })}
                  className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  title="এডিট"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>এডিট</span>
                </button>

                <button
                  onClick={() => adminUpdateBanner(banner.id, { isActive: !banner.isActive })}
                  className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                    banner.isActive ? 'bg-sky-50 text-sky-800' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {banner.isActive ? <ToggleRight className="w-3.5 h-3.5 text-sky-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-gray-400" />}
                  <span>{banner.isActive ? 'অন' : 'অফ'}</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmId(banner.id)}
                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <form 
            onSubmit={handleCreateBanner}
            className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-1.5">
                <ImageIcon className="w-5 h-5 text-sky-500" />
                <span>{isBn ? 'নতুন ব্যানার পোস্টার যোগ করুন' : 'Add New Promo Banner'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">ব্যানার টাইটেল *</label>
                <input
                  type="text"
                  required
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  placeholder="যেমন: প্রতিদিন সহজ মাইক্রো জব করে আয় করুন"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">সাবটাইটেল / বিবরণ</label>
                <input
                  type="text"
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  placeholder="যেমন: ইউটিউব, ফেসবুক ও অ্যাপ রিভিউ দিয়ে ইনস্ট্যান্ট পেমেন্ট"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">ছবির URL (Banner Image URL) *</label>
                <input
                  type="url"
                  required
                  value={newBanner.imageUrl}
                  onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">কোন পেজে দেখাবে? (Page Placement)</label>
                  <select
                    value={newBanner.position}
                    onChange={(e) => setNewBanner({ ...newBanner, position: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  >
                    <option value="all">সকল পেজে (হোম, শপ ও জবস)</option>
                    <option value="shop">রিসেলিং শপ পেজে</option>
                    <option value="jobs">মাইক্রো জব পেজে</option>
                    <option value="home">শুধু হোম পেজে</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">ক্লিক অ্যাকশন ট্যাব</label>
                  <select
                    value={newBanner.actionTab}
                    onChange={(e) => setNewBanner({ ...newBanner, actionTab: e.target.value as AppTab })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  >
                    <option value="jobs">মাইক্রো জবস (Jobs)</option>
                    <option value="shop">রিসেল শপ (Shop)</option>
                    <option value="reels">ভিডিও রিলস (Reels)</option>
                    <option value="profile">প্রোফাইল / ওয়ালেট</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">ব্যাজ টেক্সট</label>
                <input
                  type="text"
                  value={newBanner.badge}
                  onChange={(e) => setNewBanner({ ...newBanner, badge: e.target.value })}
                  placeholder="হট অফার / ক্যাশব্যাক"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
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
                ব্যানার সেভ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Banner Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveEditBanner}
            className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-1.5">
                <Edit3 className="w-5 h-5 text-sky-500" />
                <span>{isBn ? 'ব্যানার তথ্য এডিট করুন' : 'Edit Banner'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingBanner(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">ব্যানার শিরোনাম (Title) *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">সাবটাইটেল / বিবরণ</label>
                <input
                  type="text"
                  value={editingBanner.subtitle || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">ছবির URL (Banner Image URL) *</label>
                <input
                  type="url"
                  required
                  value={editingBanner.imageUrl}
                  onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">কোন পেজে দেখাবে? (Placement)</label>
                  <select
                    value={editingBanner.position || 'all'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, position: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  >
                    <option value="all">সকল পেজে (হোম, শপ ও জবস)</option>
                    <option value="shop">রিসেলিং শপ পেজে</option>
                    <option value="jobs">মাইক্রো জব পেজে</option>
                    <option value="home">শুধু হোম পেজে</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">ক্লিক করলে যাবে (Tab)</label>
                  <select
                    value={editingBanner.actionTab || 'jobs'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, actionTab: e.target.value as AppTab })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  >
                    <option value="jobs">মাইক্রো জব (Jobs)</option>
                    <option value="shop">রিসেলিং শপ (Shop)</option>
                    <option value="reels">রিলস ও ভিডিও (Reels)</option>
                    <option value="wallet">ওয়ালেট (Wallet)</option>
                    <option value="profile">প্রোফাইল (Profile)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">ব্যাজ টেক্সট</label>
                <input
                  type="text"
                  value={editingBanner.badge || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <h4 className="font-black text-base text-gray-900">ব্যানারটি মুছে ফেলতে চান?</h4>
            <p className="text-xs text-gray-500">হোম পেজের স্লাইডার থেকে এই ব্যানারটি মুছে যাবে।</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  adminDeleteBanner(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2.5 bg-red-600 text-white font-black text-xs rounded-xl shadow-xs"
              >
                ডিলিট নিশ্চিত
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
