import React from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  ShoppingBag, 
  Receipt, 
  TrendingUp, 
  HelpCircle, 
  Send, 
  Facebook, 
  Youtube, 
  Globe, 
  Lock, 
  Info, 
  FileText, 
  LogOut, 
  LogIn, 
  LayoutDashboard, 
  Settings, 
  Share2, 
  Users,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isAuthorizedAdminPhone } from '../../lib/firebase';
import { formatStrict4DigitReferral } from '../../lib/referral';

export const SideDrawer: React.FC = () => {
  const { 
    isSideDrawerOpen, 
    setIsSideDrawerOpen, 
    user, 
    isLoggedIn, 
    logout, 
    setShowAuthModal,
    setIsVerificationModalOpen,
    setIsRevenueOpen,
    setIsWalletOpen,
    setIsSettingsOpen,
    setIsLeaderboardOpen,
    setIsNetworkModalOpen,
    setIsAdminDashboardOpen,
    setActiveTab,
    showToast,
    openPolicyModal,
    systemSettings,
    language,
    t
  } = useApp();

  const [copiedCode, setCopiedCode] = React.useState(false);

  if (!isSideDrawerOpen) return null;

  // Strictly guaranteed 4-digit referral code (e.g. 7788)
  const referral4Digit = formatStrict4DigitReferral(user?.referralCode);

  const handleCopyAffiliateCode = () => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(referral4Digit).catch(() => {});
      }
    } catch {
      // safe fallback
    }
    setCopiedCode(true);
    showToast(language === 'bn' ? `রেফারেল কোড (${referral4Digit}) কপি হয়েছে!` : `Referral code (${referral4Digit}) copied!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareApp = () => {
    try {
      if (navigator?.share) {
        navigator.share({
          title: language === 'bn' ? 'Good Life' : 'Good Life - Earning & Shopping',
          text: language === 'bn' 
            ? `Good Life অ্যাপে কেনাকাটা ও কাজ করে প্রতিদিন ইনকাম করুন! আমার ৪-ডিজিট রেফারেল কোড: ${referral4Digit}`
            : `Earn daily with Good Life app! My 4-digit referral code: ${referral4Digit}`,
          url: typeof window !== 'undefined' ? window.location.href : ''
        }).catch(() => {
          handleCopyAffiliateCode();
        });
      } else {
        handleCopyAffiliateCode();
      }
    } catch {
      handleCopyAffiliateCode();
    }
  };

  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setIsSideDrawerOpen(false)}
      />

      {/* Drawer Body */}
      <div className="relative w-[82%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-right overflow-y-auto">
        {/* Top Header */}
        <div className="bg-[var(--primary)] p-4 text-white shrink-0 relative">
          <button 
            onClick={() => setIsSideDrawerOpen(false)}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* User Profile Avatar & Name */}
          <div className="flex items-center gap-3 mt-1">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
              />
              {user.isVerified ? (
                <div className="absolute -bottom-1 -right-1 bg-sky-400 text-white rounded-full p-0.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="absolute -bottom-1 -right-1 bg-sky-700 text-white rounded-full p-0.5 shadow-sm">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-base text-white truncate flex items-center gap-1">
                {user.name}
              </h3>
              <p className="text-xs text-sky-100 font-medium truncate">{user.phone}</p>
              
              {/* Role badge */}
              <span className="inline-block mt-0.5 px-2 py-0.5 bg-white/20 text-[10px] font-bold text-white rounded-md uppercase">
                {user.role === 'super_admin' 
                  ? (isBn ? 'এডমিন (Super Admin)' : 'Super Admin')
                  : user.role === 'vendor' 
                    ? (isBn ? 'ভেন্ডর' : 'Vendor')
                    : user.role === 'reseller' 
                      ? (isBn ? 'রিসেলার' : 'Reseller')
                      : (isBn ? 'ইউজার' : 'User')}
              </span>
            </div>
          </div>

          {/* Verification Status Banner */}
          <div className="mt-3 flex items-center justify-between bg-white/95 backdrop-blur-xs rounded-xl p-2 shadow-xs border border-sky-200">
            <div className="flex items-center gap-1.5">
              {user.isVerified ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="text-xs font-bold text-sky-700">
                    {isBn ? 'ভেরিফাইড প্রোফাইল' : 'Verified Profile'}
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-sky-700 shrink-0" />
                  <span className="text-xs font-bold text-sky-800">
                    {isBn ? 'আনভেরিফাইড প্রোফাইল' : 'Unverified Profile'}
                  </span>
                </>
              )}
            </div>
            {!user.isVerified && (
              <button
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  setIsVerificationModalOpen(true);
                }}
                className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition-transform active:scale-95"
              >
                {isBn ? 'ভেরিফাই করুন' : 'Verify'}
              </button>
            )}
          </div>

          {/* Referral Code Pill - Strictly Guaranteed 4 Digits */}
          <div className="mt-2.5 flex items-center justify-between bg-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white font-medium">
            <span className="text-[11px] font-semibold text-sky-100 flex items-center gap-1.5">
              <span>{isBn ? 'রেফারেল কোড (৪-ডিজিট):' : 'Referral Code (4-digit):'}</span>
              <strong className="font-black text-gray-950 font-mono tracking-widest text-xs bg-white px-2 py-0.5 rounded-md shadow-2xs border border-sky-300/80">
                {referral4Digit}
              </strong>
            </span>
            <button 
              onClick={handleCopyAffiliateCode}
              className="p-1 hover:bg-white/20 rounded-lg active:scale-90 transition-all text-white cursor-pointer"
              title="Copy Code"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-sky-200 font-bold stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 p-3 divide-y divide-gray-100 space-y-4">
          {/* Account Section */}
          <div className="pt-2">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
              {isBn ? 'অ্যাকাউন্ট ও হিস্টোরি' : 'Account & History'}
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  setActiveTab('shop');
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-sky-600" />
                <span>{isBn ? 'অর্ডার হিস্টোরি (Order History)' : 'Order History'}</span>
              </button>
              <button
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  setIsWalletOpen(true);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition-colors"
              >
                <Receipt className="w-4 h-4 text-sky-600" />
                <span>{isBn ? 'ট্রানস্যাকশন হিস্টোরি' : 'Transaction History'}</span>
              </button>
              <button
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  setIsRevenueOpen(true);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>{isBn ? 'রেভিনিউ এনালাইটিক্স' : 'Revenue Analytics'}</span>
              </button>
              <button
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  setIsNetworkModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition-colors"
              >
                <Users className="w-4 h-4 text-purple-600" />
                <span>{isBn ? 'মাই নেটওয়ার্ক ও টিম' : 'My Network & Team'}</span>
              </button>
              <button
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  setIsLeaderboardOpen(true);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition-colors"
              >
                <Award className="w-4 h-4 text-sky-500" />
                <span>{isBn ? 'টপ লিডারবোর্ড' : 'Top Leaderboard'}</span>
              </button>
            </div>
          </div>

          {/* Admin Control Panel (Secured - Strictly reserved for 01877722819) */}
          {isAuthorizedAdminPhone(user?.phone) && (
            <div className="pt-3">
              <h4 className="text-[11px] font-bold text-sky-700 uppercase tracking-wider px-2 mb-1 flex items-center justify-between">
                <span>{isBn ? 'অ্যাডমিন কন্ট্রোল পোর্টাল' : 'Admin Control Portal'}</span>
                <span className="text-[9px] bg-sky-100 text-sky-900 px-1.5 py-0.5 rounded-md font-bold">{isBn ? 'সুরক্ষিত' : 'Secured'}</span>
              </h4>
              <button
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  setIsAdminDashboardOpen(true);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs font-black text-sky-950 bg-sky-400/20 hover:bg-sky-400/30 border border-sky-300 transition-all shadow-2xs"
              >
                <LayoutDashboard className="w-4 h-4 text-sky-900" />
                <span>{isBn ? 'সুপার অ্যাডমিন ড্যাশবোর্ড' : 'Super Admin Dashboard'}</span>
              </button>
            </div>
          )}

          {/* Support & Community Section */}
          <div className="pt-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
              {isBn ? 'সাপোর্ট ও সোশ্যাল' : 'Support & Community'}
            </h4>
            <div className="space-y-0.5">
              <a
                href={systemSettings?.officialTelegramChannel || 'https://t.me/goodlifeofficialbd'}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <Send className="w-4 h-4 text-[#0088cc]" />
                <span>{isBn ? 'অফিসিয়াল চ্যানেল' : 'Official Telegram'}</span>
              </a>
              <a
                href={systemSettings?.supportTelegramBot || 'https://t.me/goodlifeadmin_bot'}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? '২৪/৭ সাপোর্ট' : '24/7 Support'}</span>
              </a>
              <a
                href={systemSettings?.adminTelegram || 'https://t.me/goodlifeadmin'}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{isBn ? 'অ্যাডমিন যোগাযোগ' : 'Admin Contact'}</span>
              </a>
              <button
                onClick={handleShareApp}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-sky-600" />
                <span>{isBn ? 'অ্যাপ রেফার ও শেয়ার করুন' : 'Share & Invite Friends'}</span>
              </button>
            </div>
          </div>

          {/* Settings Section */}
          <div className="pt-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
              {isBn ? 'সেটিংস ও নিরাপত্তা' : 'Settings & Security'}
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span>{isBn ? 'অ্যাপ সেটিংস ও ভাষা' : 'App Settings & Language'}</span>
              </button>
              <button
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  openPolicyModal('about');
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Info className="w-4 h-4 text-gray-500" />
                <span>{isBn ? 'আমাদের সম্পর্কে' : 'About Platform'}</span>
              </button>
              <button
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  openPolicyModal('privacy');
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4 text-gray-500" />
                <span>{isBn ? 'নিরাপত্তা ও প্রাইভেসি পলিসি' : 'Privacy & Security'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer: Auth Action */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 shrink-0">
          {isLoggedIn ? (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsSideDrawerOpen(false);
                setShowAuthModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl text-xs shadow-sm transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>{isBn ? 'লগইন / রেজিস্ট্রেশন' : 'Login / Register'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideDrawer;
