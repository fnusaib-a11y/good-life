import React, { useState } from 'react';
import { 
  Menu, 
  ChevronRight, 
  User, 
  Building2, 
  Users, 
  Award, 
  Bookmark, 
  Flag, 
  LogOut, 
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Gift,
  Heart,
  ShoppingBag,
  ShoppingCart,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EditProfileModal } from './EditProfileModal';
import { VerificationModal } from './VerificationModal';
import { AgencyModal } from './AgencyModal';
import { ReferralNetworkModal } from './ReferralNetworkModal';
import { SavedPostsModal } from './SavedPostsModal';
import { ReportModal } from './ReportModal';
import { RewardCenterModal } from './RewardCenterModal';
import { formatStrict4DigitReferral } from '../../lib/referral';

const ProfileView: React.FC = () => {
  const { 
    user, 
    isLoggedIn,
    registeredUsers,
    systemSettings,
    logout, 
    showToast, 
    isBn,
    setActiveTab,
    setIsSideDrawerOpen,
    isVerificationModalOpen,
    setIsVerificationModalOpen,
    isNetworkModalOpen,
    setIsNetworkModalOpen,
    isLeaderboardOpen,
    setIsLeaderboardOpen,
    products,
    wishlist,
    toggleWishlist,
    setSelectedProduct,
    addToCart
  } = useApp();

  // Active view tab in ProfileView: 'menu' | 'wishlist'
  const [activeProfileTab, setActiveProfileTab] = useState<'menu' | 'wishlist'>('menu');

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isRewardCenterOpen, setIsRewardCenterOpen] = useState(false);
  const [isAgenciesOpen, setIsAgenciesOpen] = useState(false);
  const [isReferralNetworkOpen, setIsReferralNetworkOpen] = useState(false);
  const [isSavedPostsOpen, setIsSavedPostsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const myReferralCode = formatStrict4DigitReferral(user.referralCode);
  const myReferredUsers = registeredUsers.filter(u => {
    if (!u.referredBy) return false;
    const cleanRef = u.referredBy.trim().toUpperCase();
    const matchesCode = cleanRef === myReferralCode || cleanRef === (user.referralCode || '').trim().toUpperCase();
    return matchesCode && u.isVerified;
  });

  const savedProducts = products.filter(p => wishlist?.includes(p.id));

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    showToast(isBn ? 'আপনার অ্যাকাউন্ট ডিলিট করা হয়েছে।' : 'Your account has been deleted.');
    logout();
  };

  return (
    <div className="min-h-full bg-gradient-to-r from-sky-500 to-sky-600 text-gray-900 select-none">
      {/* 1. TOP HEADER - Sky Blue Brand Background with Hamburger, Title & Wishlist Pill */}
      <div className="pt-6 pb-5 px-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3.5">
          <button
            id="profile-menu-button"
            onClick={() => setIsSideDrawerOpen(true)}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center transition-all cursor-pointer shadow-xs"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5 text-white stroke-[2.5]" />
          </button>

          <h1 className="text-xl sm:text-2xl font-bold tracking-normal text-white">
            {activeProfileTab === 'wishlist' ? (isBn ? 'উইশলিস্ট' : 'Wishlist') : (isBn ? 'প্রোফাইল' : 'Profile')}
          </h1>
        </div>

        {/* Quick Wishlist Switcher in Header */}
        <button
          id="profile-header-wishlist-toggle"
          onClick={() => setActiveProfileTab(prev => prev === 'wishlist' ? 'menu' : 'wishlist')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeProfileTab === 'wishlist'
              ? 'bg-white text-sky-600 shadow-sm'
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
          title={isBn ? 'উইশলিস্ট দেখুন' : 'View Wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-rose-400 text-rose-300' : ''}`} />
          <span>{wishlist.length}</span>
        </button>
      </div>

      {/* 2. MAIN SHEET CONTAINER - Curved Top Surface */}
      <div className="bg-[#F5F6F8] rounded-t-[32px] sm:rounded-t-[36px] px-4 pt-4 pb-36 space-y-4 min-h-[calc(100vh-100px)]">
        
        {/* Navigation Tabs: Profile Menu vs Wishlist */}
        <div className="grid grid-cols-2 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xs border border-gray-100/90">
          <button
            id="profile-tab-menu"
            onClick={() => setActiveProfileTab('menu')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeProfileTab === 'menu'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <User className={`w-4 h-4 ${activeProfileTab === 'menu' ? 'text-white' : 'text-sky-600'}`} />
            <span>{isBn ? 'প্রোফাইল মেনু' : 'Profile Menu'}</span>
          </button>

          <button
            id="profile-tab-wishlist"
            onClick={() => setActiveProfileTab('wishlist')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              activeProfileTab === 'wishlist'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeProfileTab === 'wishlist' ? 'fill-white text-white' : 'text-rose-500 fill-rose-500/20'}`} />
            <span>{isBn ? 'উইশলিস্ট' : 'Wishlist'}</span>
            {wishlist.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeProfileTab === 'wishlist'
                  ? 'bg-white text-rose-600'
                  : 'bg-rose-500 text-white'
              }`}>
                {wishlist.length}
              </span>
            )}
          </button>
        </div>

        {/* --- TAB CONTENT: PROFILE MENU --- */}
        {activeProfileTab === 'menu' && (
          <div className="space-y-4 animate-fade-in">
            {/* TOP PROFILE CARD: Name & Profile Picture on Left Side */}
            <div
              id="profile-user-card"
              onClick={() => setIsVerificationModalOpen(true)}
              className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-2xs border border-gray-100/90 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 active:scale-[0.99] transition-all group"
            >
              {/* Profile Photo and Name on Left Side */}
              <div className="flex items-center gap-3 sm:gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80'}
                    alt={user.name || 'User'}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-sky-200 shadow-xs group-hover:ring-sky-400 transition-all"
                  />
                  {user.isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                    {user.name || (isLoggedIn ? (isBn ? 'ব্যবহারকারী' : 'User') : (isBn ? 'লগইন করুন' : 'Sign In'))}
                  </h2>
                  <p className={`text-xs font-semibold ${user.isVerified ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {user.isVerified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* PROFILE MENU LIST CARD */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xs border border-gray-100/90 divide-y divide-gray-100 overflow-hidden">
              
              <button onClick={() => setIsEditProfileOpen(true)} className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-3.5"><div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600"><User className="w-5 h-5" /></div><span className="text-[15px] font-medium text-gray-800">{isBn ? 'প্রোফাইল এডিট' : 'Edit Profile'}</span></div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <button 
                id="menu-wishlist-btn"
                onClick={() => setActiveProfileTab('wishlist')} 
                className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <Heart className="w-5 h-5 fill-rose-500/20" />
                  </div>
                  <span className="text-[15px] font-medium text-gray-800">{isBn ? 'উইশলিস্ট (সেভ করা পণ্য)' : 'Wishlist (Saved Items)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {wishlist.length > 0 && (
                    <span className="bg-rose-50 text-rose-600 font-bold text-xs px-2 py-0.5 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </button>

              <button 
                id="profile-menu-reward-center"
                onClick={() => setIsRewardCenterOpen(true)} 
                className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-[15px] font-medium text-gray-800 block">
                      {isBn ? 'পুরস্কার সেন্টার' : 'Reward Center'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {isBn ? 'নতুন' : 'New'}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </button>

              <button onClick={() => setIsReferralNetworkOpen(true)} className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-3.5"><div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600"><Gift className="w-5 h-5" /></div><span className="text-[15px] font-medium text-gray-800">{isBn ? 'রেফারেল ও নেটওয়ার্ক' : 'Referrals & Network'}</span></div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <button onClick={() => setIsNetworkModalOpen(true)} className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-3.5"><div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600"><Users className="w-5 h-5" /></div><span className="text-[15px] font-medium text-gray-800">{isBn ? 'মাল্টি-টায়ার টিম' : 'Multi-tier Team'}</span></div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <button onClick={() => setIsLeaderboardOpen(true)} className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-3.5"><div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600"><Award className="w-5 h-5" /></div><span className="text-[15px] font-medium text-gray-800">{isBn ? 'লিডারবোর্ড' : 'Leaderboard'}</span></div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <button onClick={() => setIsReportOpen(true)} className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-3.5"><div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600"><Flag className="w-5 h-5" /></div><span className="text-[15px] font-medium text-gray-800">{isBn ? 'আমার রিপোর্ট' : 'My Reports'}</span></div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-3.5"><div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600"><LogOut className="w-5 h-5" /></div><span className="text-[15px] font-medium text-gray-800">{isBn ? 'লগআউট' : 'Logout'}</span></div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-3.5"><div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500"><Trash2 className="w-5 h-5" /></div><span className="text-[15px] font-medium text-gray-800">{isBn ? 'অ্যাকাউন্ট ডিলিট' : 'Delete Account'}</span></div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: WISHLIST (SAVED PRODUCTS) --- */}
        {activeProfileTab === 'wishlist' && (
          <div className="space-y-4 animate-fade-in">
            {/* Header info bar */}
            <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {isBn ? 'উইশলিস্টের পণ্যসমূহ' : 'Wishlist Items'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {savedProducts.length} {isBn ? 'টি পণ্য সেভ করা আছে' : 'product(s) saved'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('shop')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                <span>{isBn ? 'শপে যান' : 'Go to Shop'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Empty State */}
            {savedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-2xs space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto ring-8 ring-rose-50/60">
                  <Heart className="w-8 h-8 stroke-[1.8]" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    {isBn ? 'আপনার উইশলিস্ট খালি' : 'Your Wishlist is Empty'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {isBn 
                      ? 'শপ থেকে যেকোনো পছন্দের পণ্যে হার্ট (❤️) আইকন প্রেস করে এখানে সেভ করে রাখুন এবং পরবর্তীতে সহজে অর্ডার করুন।' 
                      : 'Explore our shop, tap the heart icon on your favorite items, and save them here for quick access.'}
                  </p>
                </div>
                <button
                  id="empty-wishlist-browse-shop-btn"
                  onClick={() => setActiveTab('shop')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isBn ? 'পণ্য ব্রাউজ করুন' : 'Browse Products'}</span>
                </button>
              </div>
            ) : (
              /* Wishlist Products Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {savedProducts.map((product) => (
                  <div
                    key={product.id}
                    id={`wishlist-card-${product.id}`}
                    className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="flex gap-3">
                      {/* Product Thumbnail */}
                      <div 
                        onClick={() => setSelectedProduct(product)}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 cursor-pointer border border-gray-100"
                      >
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.discountPercentage > 0 && (
                          <span className="absolute top-1 left-1 bg-sky-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                            -{product.discountPercentage}%
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                              {product.category}
                            </span>
                            <button
                              id={`remove-wishlist-${product.id}`}
                              onClick={() => toggleWishlist(product.id)}
                              title={isBn ? 'উইশলিস্ট থেকে মুছুন' : 'Remove from Wishlist'}
                              className="p-1 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <h4 
                            onClick={() => setSelectedProduct(product)}
                            className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 mt-1 hover:text-sky-600 cursor-pointer"
                          >
                            {product.name}
                          </h4>
                        </div>

                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-xs sm:text-sm font-black text-sky-700">৳{product.sellingPrice}</span>
                          {product.oldPrice && (
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through">৳{product.oldPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reseller Profit & Action Buttons */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100/90 flex items-center justify-between gap-2">
                      <div className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg truncate">
                        রিসেলিং লাভ: ৳{product.resellerProfit}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          id={`wishlist-add-cart-${product.id}`}
                          onClick={() => {
                            addToCart(product, 1);
                            showToast(isBn ? 'কার্টে যোগ করা হয়েছে! 🛒' : 'Added to cart! 🛒');
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-500 hover:text-white text-sky-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          title={isBn ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">{isBn ? 'কার্ট' : 'Cart'}</span>
                        </button>

                        <button
                          id={`wishlist-view-order-${product.id}`}
                          onClick={() => setSelectedProduct(product)}
                          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          {isBn ? 'অর্ডার করুন' : 'Order'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isEditProfileOpen && <EditProfileModal onClose={() => setIsEditProfileOpen(false)} />}
      {isRewardCenterOpen && <RewardCenterModal onClose={() => setIsRewardCenterOpen(false)} />}
      {isVerificationModalOpen && <VerificationModal onClose={() => setIsVerificationModalOpen(false)} />}
      {isReferralNetworkOpen && <ReferralNetworkModal onClose={() => setIsReferralNetworkOpen(false)} />}
      {isSavedPostsOpen && <SavedPostsModal onClose={() => setIsSavedPostsOpen(false)} />}
      {isReportOpen && <ReportModal onClose={() => setIsReportOpen(false)} />}
      
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 text-center space-y-4">
            <h3 className="font-extrabold">Confirm Logout?</h3>
            <div className="flex gap-2.5">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200">Cancel</button>
              <button onClick={() => { setShowLogoutConfirm(false); logout(); }} className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white">Logout</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 text-center space-y-4">
            <h3 className="font-extrabold text-red-600">Delete Account?</h3>
            <div className="flex gap-2.5">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200">Cancel</button>
              <button onClick={handleDeleteAccount} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
