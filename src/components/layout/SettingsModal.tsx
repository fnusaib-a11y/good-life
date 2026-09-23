import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Globe, 
  Bell, 
  Smartphone, 
  Lock, 
  LogOut, 
  KeyRound,
  Briefcase,
  Network,
  Award,
  Bookmark,
  AlertTriangle,
  ShieldCheck,
  Wallet,
  ChevronRight,
  User,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isAuthorizedAdminPhone } from '../../lib/firebase';

export const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { 
    showToast, 
    user, 
    setUser, 
    logout,
    setIsAdminDashboardOpen, 
    setIsAgencyModalOpen,
    setIsNetworkModalOpen,
    setIsLeaderboardOpen,
    setIsSavedPostsOpen,
    setIsReportModalOpen,
    setIsVerificationModalOpen,
    setIsWalletOpen,
    openPolicyModal,
    language, 
    setLanguage, 
    t 
  } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isBn = language === 'bn';
  
  // Discreet admin unlock mechanism (Hidden from plain sight)
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [showAdminPinInput, setShowAdminPinInput] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  const isAuthorized = isAuthorizedAdminPhone(user?.phone);
  const isAdmin = isAuthorized && (user.role === 'admin' || user.role === 'super_admin');

  const handleSecretTap = () => {
    if (!isAuthorized) return;
    const newCount = secretTapCount + 1;
    setSecretTapCount(newCount);
    if (newCount >= 5) {
      setShowAdminPinInput(true);
      setSecretTapCount(0);
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setAdminError(language === 'bn' ? 'অ্যাডমিন প্যানেল শুধুমাত্র 01877722819 নম্বরের জন্য অনুমোদিত!' : 'Admin access restricted to 01877722819 only!');
      return;
    }
    if (adminPin === '7788' || adminPin === '1234') {
      setUser(prev => ({
        ...prev,
        role: 'super_admin',
        name: prev.name.includes('Admin') ? prev.name : `${prev.name} (Admin)`,
        isVerified: true
      }));
      setAdminPin('');
      setShowAdminPinInput(false);
      showToast(language === 'bn' ? 'এডমিন মোড সক্রিয় হয়েছে!' : 'Admin mode activated!');
      onClose();
      setIsAdminDashboardOpen(true);
    } else {
      setAdminError(language === 'bn' ? 'ভুল এডমিন পিন কোড!' : 'Invalid admin PIN!');
    }
  };

  const handleExitAdmin = () => {
    setUser(prev => ({
      ...prev,
      role: 'user'
    }));
    showToast(language === 'bn' ? 'এডমিন মোড বন্ধ করা হয়েছে।' : 'Exited admin mode.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-white" />
            <h3 className="font-extrabold text-base text-white">{t.settingsTitle}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 divide-y divide-gray-100 text-xs">
          {/* User Summary Card */}
          <div className="pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-sky-400" />
              <div>
                <h4 className="font-black text-sm text-gray-950">{user.name}</h4>
                <p className="text-[11px] text-gray-500 font-mono">{user.phone}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-sky-100 text-sky-900 font-black text-[10px] rounded-full capitalize">
              {user.role}
            </span>
          </div>

          {/* Quick Tools & Management Section */}
          <div className="pt-3 space-y-2">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
              {isBn ? 'ম্যানেজমেন্ট ও কুইক টুলস' : 'Management & Tools'}
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onClose(); setIsAgencyModalOpen(true); }}
                className="p-2.5 bg-gray-50 hover:bg-purple-50 border border-gray-200/80 rounded-xl flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-[11px]">{isBn ? 'এজেন্সি হাব' : 'Agency Hub'}</div>
                  <div className="text-[9px] text-gray-500">{isBn ? 'ম্যানেজমেন্ট' : 'Management'}</div>
                </div>
              </button>

              <button
                onClick={() => { onClose(); setIsNetworkModalOpen(true); }}
                className="p-2.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200/80 rounded-xl flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-[11px]">{isBn ? 'মাই টিম' : 'My Team'}</div>
                  <div className="text-[9px] text-gray-500">{isBn ? 'নেটওয়ার্ক' : 'Network'}</div>
                </div>
              </button>

              <button
                onClick={() => { onClose(); setIsLeaderboardOpen(true); }}
                className="p-2.5 bg-gray-50 hover:bg-sky-50 border border-gray-200/80 rounded-xl flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-[11px]">{isBn ? 'লিডারবোর্ড' : 'Leaderboard'}</div>
                  <div className="text-[9px] text-gray-500">{isBn ? 'সেরা আর্নার' : 'Top Earners'}</div>
                </div>
              </button>

              <button
                onClick={() => { onClose(); setIsSavedPostsOpen(true); }}
                className="p-2.5 bg-gray-50 hover:bg-pink-50 border border-gray-200/80 rounded-xl flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <div className="p-1.5 bg-pink-100 text-pink-700 rounded-lg shrink-0">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-[11px]">{isBn ? 'সেভড পোস্ট' : 'Saved Posts'}</div>
                  <div className="text-[9px] text-gray-500">{isBn ? 'আইটেমস' : 'Items'}</div>
                </div>
              </button>

              <button
                onClick={() => { onClose(); setIsVerificationModalOpen(true); }}
                className="p-2.5 bg-gray-50 hover:bg-emerald-50 border border-gray-200/80 rounded-xl flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-[11px]">{isBn ? 'ভেরিফিকেশন' : 'Verification'}</div>
                  <div className="text-[9px] text-gray-500">{user.isVerified ? 'Verified' : 'Unverified'}</div>
                </div>
              </button>

              <button
                onClick={() => { onClose(); setIsReportModalOpen(true); }}
                className="p-2.5 bg-gray-50 hover:bg-orange-50 border border-gray-200/80 rounded-xl flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-[11px]">{isBn ? 'হেল্প ও সাপোর্ট' : 'Support'}</div>
                  <div className="text-[9px] text-gray-500">{isBn ? 'অভিযোগ' : 'Help Desk'}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-sky-600" />
              <div>
                <div className="font-bold text-gray-900">{t.languageSelection}</div>
                <div className="text-[10px] text-gray-400">{t.languageSubtitle}</div>
              </div>
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  setLanguage('bn');
                  showToast('ভাষা বাংলা নির্ধারণ করা হয়েছে');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  language === 'bn' ? 'bg-sky-500 text-white font-black shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  showToast('Language set to English');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  language === 'en' ? 'bg-sky-500 text-white font-black shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-bold text-gray-900">{t.pushNotifications}</div>
                <div className="text-[10px] text-gray-400">{t.pushNotificationsSub}</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
            />
          </div>

          {/* Sound Effect */}
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-bold text-gray-900">{t.soundVibration}</div>
                <div className="text-[10px] text-gray-400">{t.soundVibrationSub}</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
            />
          </div>

          {/* Platform Policies & About */}
          <div className="pt-2 border-t border-gray-100 space-y-1.5">
            <button
              onClick={() => {
                onClose();
                openPolicyModal('about');
              }}
              className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>{isBn ? 'আমাদের সম্পর্কে ও সম্পর্ক' : 'About Platform'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                openPolicyModal('privacy');
              }}
              className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? 'নিরাপত্তা ও প্রাইভেসি পলিসি' : 'Privacy & Security Policy'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Active Admin Indicator */}
          {isAdmin && (
            <div className="pt-3 flex items-center justify-between bg-sky-50/70 p-2.5 rounded-2xl border border-sky-200">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-800" />
                <span className="text-[11px] font-bold text-sky-900">{t.adminModeActive}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    setIsAdminDashboardOpen(true);
                  }}
                  className="px-2.5 py-1 bg-sky-500 text-white font-black rounded-lg text-[11px] cursor-pointer"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleExitAdmin}
                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                  title="Exit admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Hidden Admin PIN Form (Revealed ONLY after 5 secret taps) */}
          {showAdminPinInput && !isAdmin && (
            <form onSubmit={handleAdminAuth} className="pt-3 p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-700">{t.adminLoginPrompt}:</label>
                <button 
                  type="button" 
                  onClick={() => setShowAdminPinInput(false)}
                  className="text-[10px] text-gray-400 hover:text-gray-600"
                >
                  {t.cancel}
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="password"
                    maxLength={6}
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      setAdminError('');
                    }}
                    placeholder={t.adminPinPlaceholder}
                    className="w-full py-1.5 px-3 bg-white border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-sky-400 focus:outline-hidden"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2" />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {t.adminUnlock}
                </button>
              </div>
              {adminError && <p className="text-[10px] font-bold text-red-600">{adminError}</p>}
            </form>
          )}

          {/* Account Logout and Delete */}
          <div className="pt-3 space-y-2">
            <button 
              onClick={() => { onClose(); logout(); }}
              className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-red-600" />
                <span>{t.logout}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>{isBn ? 'অ্যাকাউন্ট ডিলিট করুন' : 'Delete Account'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>
          </div>

          {/* App Info & Secret Tap Area */}
          <div className="pt-4 text-center space-y-1">
            <div className="font-black text-sm text-gray-900">{t.appName}</div>
            <div 
              onClick={handleSecretTap}
              className="text-[11px] text-gray-400 cursor-pointer select-none active:text-gray-600 transition-colors"
              title="Version"
            >
              {t.version}
            </div>
            <div className="text-[10px] text-gray-400">{t.copyright}</div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {isBn ? 'অ্যাকাউন্ট ডিলিট করতে চান?' : 'Delete Account?'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isBn 
                  ? 'অ্যাকাউন্ট মুছে ফেললে আপনার ওয়ালেটের সকল ব্যালেন্স ও হিস্টোরি চিরতরে মুছে যাবে।'
                  : 'Deleting your account will permanently remove your wallet balance and history.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onClose();
                  logout();
                  showToast(isBn ? 'অ্যাকাউন্ট রিসেট করা হয়েছে।' : 'Account has been reset.');
                }}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;

