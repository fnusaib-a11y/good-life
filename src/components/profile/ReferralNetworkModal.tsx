import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Gift, 
  UserCheck, 
  ShieldCheck, 
  Sparkles,
  Phone,
  Calendar,
  ChevronRight,
  TrendingUp,
  Award,
  RefreshCw,
  CheckCircle2,
  Eye,
  Mail,
  PhoneCall,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { formatStrict4DigitReferral } from '../../lib/referral';

interface ReferralNetworkModalProps {
  onClose: () => void;
}

export const ReferralNetworkModal: React.FC<ReferralNetworkModalProps> = ({ onClose }) => {
  const { user, wallet, registeredUsers, systemSettings, showToast, isBn, language, syncReferralEarnings } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'referrals' | 'referrer' | 'rules'>('referrals');
  const [selectedReferredUser, setSelectedReferredUser] = useState<UserProfile | null>(null);

  // Ensure strict 4-digit format
  const myReferralCode = formatStrict4DigitReferral(user.referralCode);

  // Users who joined using my 4-digit code (flexible match)
  const myReferredUsers = registeredUsers.filter(u => {
    if (!u.referredBy || u.id === user.id) return false;
    const cleanRef = u.referredBy.trim().toUpperCase();
    const strictRef = formatStrict4DigitReferral(cleanRef);
    return cleanRef === myReferralCode || cleanRef === user.referralCode || strictRef === myReferralCode;
  });

  // Auto-sync earnings on open to ensure no referral bonus is missed
  useEffect(() => {
    if (syncReferralEarnings) {
      syncReferralEarnings();
    }
  }, [syncReferralEarnings]);

  const handleManualSync = () => {
    setIsSyncing(true);
    const res = syncReferralEarnings();
    setTimeout(() => {
      setIsSyncing(false);
      if (res.credited > 0) {
        showToast(isBn ? `৳${res.credited} রেফার বোনাস সফলভাবে ওয়ালেটে যুক্ত হয়েছে!` : `৳${res.credited} credited to wallet!`);
      } else {
        showToast(isBn ? 'আপনার সকল রেফারেল বোনাস ইতিমধ্যে আপনার ওয়ালেটে যুক্ত আছে।' : 'All referral bonuses are already credited to your wallet.');
      }
    }, 400);
  };

  // Find who referred me
  const myReferrerCode = (user.referredBy || '').trim().toUpperCase();
  const myReferrerUser: UserProfile | undefined = myReferrerCode
    ? registeredUsers.find(u => (u.referralCode || '').trim().toUpperCase() === myReferrerCode)
    : undefined;

  const referrerName = user.referredByName || myReferrerUser?.name || (myReferrerCode ? `কোড #${myReferrerCode}` : '');

  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');

  const verifiedReferredUsers = myReferredUsers.filter(u => u.isVerified);
  const pendingReferredUsers = myReferredUsers.filter(u => !u.isVerified);

  const perReferralReward = systemSettings.referralBonus || 25;
  // Strictly calculate earned bonus from Verified referrals only!
  const totalEarnedFromReferrals = verifiedReferredUsers.length * perReferralReward;
  const pendingPotentialBonus = pendingReferredUsers.length * perReferralReward;

  const displayedReferredUsers = filterStatus === 'verified'
    ? verifiedReferredUsers
    : filterStatus === 'pending'
    ? pendingReferredUsers
    : myReferredUsers;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myReferralCode).catch(() => {});
    setCopiedCode(true);
    showToast(isBn ? `রেফারেল কোড (${myReferralCode}) কপি হয়েছে!` : `Referral code (${myReferralCode}) copied!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/?ref=${myReferralCode}`;
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopiedLink(true);
    showToast(isBn ? 'রেফারেল লিংক কপি হয়েছে!' : 'Referral link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = isBn
      ? `Good Life প্ল্যাটফর্মে যুক্ত হয়ে প্রতিদিন মাইক্রো জব ও শপিং করে ইনকাম করুন! আমার ৪-ডিজিটের রেফার কোড: *${myReferralCode}* ব্যবহার করে জয়েন করুন এবং ওয়েলকাম বোনাস পান। লিংক: ${window.location.origin}/?ref=${myReferralCode}`
      : `Join Good Life to earn daily! Use my 4-digit referral code: *${myReferralCode}* to get bonus: ${window.location.origin}/?ref=${myReferralCode}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return '01*********';
    const clean = phone.trim();
    if (clean.length === 11) {
      return `${clean.slice(0, 3)}****${clean.slice(7)}`;
    }
    return clean;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up border border-gray-100">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-2xs">
              <Users className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {isBn ? 'রেফারেল ও নেটওয়ার্ক' : 'Referrals & Network'}
              </h3>
              <p className="text-[10px] font-semibold text-sky-100">
                {isBn ? 'আমার কোড ও রেফার্ড সদস্য তালিকা' : 'My code & referred member list'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          
          {/* 1. MY 4-DIGIT REFERRAL CODE CARD */}
          <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 rounded-3xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/15 rounded-full blur-xs pointer-events-none" />
            <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/15 rounded-full blur-xs pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/20 backdrop-blur-xs rounded-full text-[11px] font-extrabold text-white">
                  <Gift className="w-3.5 h-3.5 text-white" />
                  <span>{isBn ? 'আপনার ৪-ডিজিট রেফার কোড' : 'Your 4-Digit Referral Code'}</span>
                </span>
                <span className="text-[11px] font-black bg-white px-2 py-0.5 rounded-lg text-sky-950 shadow-2xs">
                  {isBn ? `প্রতি রেফারে ৳${perReferralReward}` : `৳${perReferralReward}/Referral`}
                </span>
              </div>

              {/* 4 Digit Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 py-1">
                {myReferralCode.padEnd(4, '0').split('').map((char, index) => (
                  <div 
                    key={index}
                    className="w-12 h-14 sm:w-14 sm:h-16 bg-white rounded-2xl shadow-md border-2 border-sky-200/90 flex items-center justify-center font-black text-2xl sm:text-3xl text-gray-950 tracking-wider transition-transform hover:scale-105"
                  >
                    {char}
                  </div>
                ))}
              </div>

              {/* Action Buttons: Copy Code & Copy Link */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleCopyCode}
                  className="py-2.5 px-3 bg-gray-950 hover:bg-gray-900 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                      <span className="text-emerald-400 font-black">{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-sky-300" />
                      <span>{isBn ? 'কোড কপি করুন' : 'Copy Code'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isBn ? 'হোয়াটসঅ্যাপ শেয়ার' : 'Share WhatsApp'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. WHO REFERRED ME CARD (কার কোড নিয়েছি) */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-sky-100 flex items-center justify-center text-sky-800">
                  <UserCheck className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold text-gray-700">
                  {isBn ? 'আমি যার রেফার কোড নিয়েছি (Referred By):' : 'Who Referred Me:'}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {user.referredBy ? (isBn ? 'রেফার্ড অ্যাকাউন্ট' : 'Referred') : (isBn ? 'ডাইরেক্ট জয়েন' : 'Direct Join')}
              </span>
            </div>

            {user.referredBy ? (
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={myReferrerUser?.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230284C7'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M4 20c0-4 4-6 8-6s8 2 8 6'/%3E%3C/svg%3E"}
                    alt={referrerName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-300"
                  />
                  <div>
                    <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                      <span>{referrerName}</span>
                      {myReferrerUser?.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                      )}
                    </h4>
                    <p className="text-[11px] font-medium text-gray-600">
                      {isBn ? 'রেফার কোড:' : 'Referral Code:'} <strong className="font-extrabold text-sky-900">{myReferrerCode}</strong>
                      {myReferrerUser?.phone && (
                        <span className="ml-2 text-gray-500">({maskPhone(myReferrerUser.phone)})</span>
                      )}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg">
                  {isBn ? 'যুক্ত আছেন' : 'Connected'}
                </span>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-3 text-center text-xs text-gray-500 font-medium">
                {isBn 
                  ? 'আপনি সরাসরি নিবন্ধিত হয়েছেন (কোনো রেফার কোড ছাড়াই অ্যাকাউন্ট খোলা হয়েছে)।'
                  : 'You joined directly without a referral code.'}
              </div>
            )}
          </div>

          {/* 3. TABS / STATS BANNER */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-2.5">
                <span className="text-[10px] font-bold text-gray-600 block leading-tight">
                  {isBn ? 'মোট রেফার' : 'Total Referrals'}
                </span>
                <span className="text-lg font-black text-sky-950 mt-0.5 block">
                  {myReferredUsers.length} <span className="text-[10px] font-semibold text-gray-700">{isBn ? 'জন' : ''}</span>
                </span>
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-2.5">
                <span className="text-[10px] font-bold text-emerald-700 block leading-tight">
                  {isBn ? 'ভেরিফাইড (জমা)' : 'Verified (Paid)'}
                </span>
                <span className="text-lg font-black text-emerald-900 mt-0.5 block">
                  ৳{totalEarnedFromReferrals}
                </span>
                <span className="text-[9.5px] font-semibold text-emerald-700">
                  {verifiedReferredUsers.length} {isBn ? 'জন' : 'users'}
                </span>
              </div>

              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-2.5">
                <span className="text-[10px] font-bold text-amber-700 block leading-tight">
                  {isBn ? 'অপেক্ষমাণ' : 'Pending'}
                </span>
                <span className="text-lg font-black text-amber-900 mt-0.5 block">
                  ৳{pendingPotentialBonus}
                </span>
                <span className="text-[9.5px] font-semibold text-amber-700">
                  {pendingReferredUsers.length} {isBn ? 'জন' : 'users'}
                </span>
              </div>
            </div>

            {/* Wallet Credit Status & Instant Sync Card */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-gray-600 block leading-tight">
                    {isBn ? 'ওয়ালেটে যুক্ত ব্যালেন্স:' : 'Credited to Wallet:'}
                  </span>
                  <span className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                    <span>৳{wallet.incomeBreakdown?.referralIncome ?? totalEarnedFromReferrals}</span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-md">
                      {isBn ? 'ভেরিফাইড বোনাস' : 'Verified Bonus'}
                    </span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isBn ? 'রিফ্রেশ/ক্লেইম' : 'Refresh/Claim'}</span>
              </button>
            </div>
          </div>

          {/* 4. REFERRED USERS LIST (আমার কোড দিয়ে রেফার করেছে যারা) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1 flex-wrap gap-2">
              <h4 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                <span>
                  {isBn ? 'আমার কোড দিয়ে রেফার করেছে যারা' : 'Users Who Joined With My Code'}
                </span>
                <span className="bg-sky-100 text-sky-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {myReferredUsers.length}
                </span>
              </h4>

              {/* Status Filter Pills */}
              {myReferredUsers.length > 0 && (
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl text-[10px] font-extrabold">
                  <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      filterStatus === 'all'
                        ? 'bg-white text-gray-900 shadow-2xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {isBn ? 'সকল' : 'All'} ({myReferredUsers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('verified')}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      filterStatus === 'verified'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-emerald-700 hover:text-emerald-900'
                    }`}
                  >
                    {isBn ? 'ভেরিফাইড' : 'Verified'} ({verifiedReferredUsers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('pending')}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      filterStatus === 'pending'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-amber-700 hover:text-amber-900'
                    }`}
                  >
                    {isBn ? 'পেন্ডিং' : 'Pending'} ({pendingReferredUsers.length})
                  </button>
                </div>
              )}
            </div>

            {myReferredUsers.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 text-center space-y-2.5">
                <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 stroke-[2]" />
                </div>
                <h5 className="font-extrabold text-xs sm:text-sm text-gray-900">
                  {isBn ? 'এখনো কোনো সদস্য আপনার কোড ব্যবহার করেনি' : 'No referrals yet'}
                </h5>
                <p className="text-[11px] text-gray-500 font-medium max-w-xs mx-auto">
                  {isBn
                    ? `আপনার ৪-ডিজিট রেফার কোড (${myReferralCode}) বন্ধুদের সাথে শেয়ার করুন এবং সদস্য ভেরিফাইড হলে প্রতি রেফারে ৳${perReferralReward} সরাসরি ইনকাম করুন!`
                    : `Share your 4-digit code (${myReferralCode}) and earn ৳${perReferralReward} per verified referral!`}
                </p>
                <button
                  onClick={handleShareWhatsApp}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {isBn ? 'বন্ধুদের ইনভাইট করুন' : 'Invite Friends'}
                </button>
              </div>
            ) : displayedReferredUsers.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center text-xs text-gray-500 font-medium">
                {filterStatus === 'verified'
                  ? (isBn ? 'এখনো কোনো রেফার করা সদস্য ভেরিফাইড হয়নি।' : 'No referred members are verified yet.')
                  : (isBn ? 'কোনো অপেক্ষমাণ রেফারেল সদস্য নেই।' : 'No pending referrals found.')}
              </div>
            ) : (
              <div className="space-y-2">
                {displayedReferredUsers.map((refUser, idx) => (
                  <div
                    key={refUser.id || idx}
                    onClick={() => setSelectedReferredUser(refUser)}
                    className="bg-white rounded-2xl p-3 border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Profile Picture with Index & Verified Ring */}
                        <div className="relative shrink-0 mt-0.5">
                          <img
                            src={refUser.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230284C7'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M4 20c0-4 4-6 8-6s8 2 8 6'/%3E%3C/svg%3E"}
                            alt={refUser.name}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-sky-400 transition-all shadow-2xs"
                          />
                          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-sky-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                            {idx + 1}
                          </span>
                          {refUser.isVerified ? (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs" title={isBn ? 'ভেরিফাইড প্রোফাইল' : 'Verified Profile'}>
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs" title={isBn ? 'ভেরিফিকেশন অপেক্ষমাণ' : 'Pending Verification'}>
                              <Clock className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* User Profile Information beside Name */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs sm:text-sm text-gray-950 group-hover:text-sky-600 transition-colors leading-tight">
                              {refUser.name}
                            </span>
                            {refUser.isVerified ? (
                              <span className="inline-flex items-center gap-0.5 text-[9.5px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>{isBn ? 'ভেরিফাইড' : 'Verified'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>{isBn ? 'ভেরিফিকেশন অপেক্ষমাণ' : 'Pending Verification'}</span>
                              </span>
                            )}
                          </div>

                          {/* Profile Data: Phone, Code, Joining */}
                          <div className="space-y-0.5 text-[11px] text-gray-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="text-gray-800 font-bold font-mono">{refUser.phone || '01*********'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap text-[10.5px]">
                              <span className="font-bold text-sky-800 bg-sky-50 border border-sky-200/80 px-1.5 py-0.2 rounded-md">
                                #{refUser.referralCode || '----'}
                              </span>
                              <span>•</span>
                              <span className="text-gray-400">{refUser.joinedDate || (isBn ? 'সাম্প্রতিক যোগদান' : 'Recently joined')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Reward & Profile Button */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        {refUser.isVerified ? (
                          <span className="inline-block text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/80 shadow-2xs">
                            +৳{perReferralReward} {isBn ? 'জমা হয়েছে' : 'Credited'}
                          </span>
                        ) : (
                          <span className="inline-block text-[10.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80 shadow-2xs" title={isBn ? 'ইউজার ভেরিফাইড হলে বোনাস জমা হবে' : 'Bonus will credit upon verification'}>
                            ৳{perReferralReward} ({isBn ? 'ভেরিফাই হলে পাবেন' : 'Pending'})
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReferredUser(refUser);
                          }}
                          className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-sky-700 bg-sky-50 hover:bg-sky-100 active:scale-95 px-2.5 py-1 rounded-xl border border-sky-200 transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3 h-3 stroke-[2.2]" />
                          <span>{isBn ? 'প্রোফাইল' : 'Profile'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Policy / Rules Note */}
          <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3 text-[11px] text-sky-950 font-medium space-y-1.5">
            <div className="font-extrabold flex items-center gap-1 text-sky-900">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>{isBn ? 'রেফারেল নিয়ম ও রিওয়ার্ড শর্তাবলী:' : 'Referral Terms & Rules:'}</span>
            </div>
            <ul className="space-y-1 text-gray-700 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-gray-900 font-bold">
                  {isBn ? 'ভেরিফিকেশন বাধ্যতামূলক:' : 'Verification Required:'}
                </strong>{' '}
                {isBn
                  ? 'ইউজার Verified না হওয়া পর্যন্ত কোনো Referral Reward তার Referrer-এর Account-এ জমা হবে না।'
                  : 'No referral reward is credited to the referrer until the referred user is Verified.'}
              </li>
              <li>
                <strong className="text-gray-900 font-bold">
                  {isBn ? 'তাৎক্ষণিক স্বয়ংক্রিয় ক্রেডিট:' : 'Instant Automatic Credit:'}
                </strong>{' '}
                {isBn
                  ? `ইউজার অ্যাকাউন্ট সফলভাবে ভেরিফাইড হলেই নিয়ম অনুযায়ী সাথে সাথে ৳${perReferralReward} রেফার বোনাস ওয়ালেটে জমা হবে।`
                  : `Once the user is successfully Verified, ৳${perReferralReward} referral bonus is instantly credited to the wallet.`}
              </li>
              <li>
                {isBn 
                  ? `রেফার কোড ঠিক ৪ টি ডিজিটের হবে (যেমন: ${myReferralCode})।`
                  : `Referral code is strictly 4 digits (e.g. ${myReferralCode}).`}
              </li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 active:scale-98 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>

      {/* REFERRED USER FULL PROFILE POPUP MODAL */}
      {selectedReferredUser && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-gray-100 flex flex-col">
            {/* Header / Banner */}
            <div className="relative bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 pt-5 pb-12 px-4 text-white text-center">
              <button
                type="button"
                onClick={() => setSelectedReferredUser(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md text-white">
                <User className="w-3.5 h-3.5 text-white" />
                <span>{isBn ? 'রেফারেল সদস্যের প্রোফাইল' : 'Referred User Profile'}</span>
              </span>
            </div>

            {/* Profile Avatar & Header */}
            <div className="relative px-5 pb-5 -mt-10 flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={selectedReferredUser.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230284C7'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M4 20c0-4 4-6 8-6s8 2 8 6'/%3E%3C/svg%3E"}
                  alt={selectedReferredUser.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                />
                {selectedReferredUser.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs" title="Verified Member">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-black text-gray-950 mt-2.5">
                {selectedReferredUser.name}
              </h3>

              <div className="flex items-center gap-1.5 mt-1 flex-wrap justify-center">
                {selectedReferredUser.isVerified ? (
                  <span className="text-[10.5px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isBn ? 'ভেরিফাইড ইউজার' : 'Verified Member'}</span>
                  </span>
                ) : (
                  <span className="text-[10.5px] font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-lg">
                    {isBn ? 'রেজিস্টার্ড সদস্য' : 'Registered Member'}
                  </span>
                )}

                <span className="text-[10px] font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                  {selectedReferredUser.role || 'user'}
                </span>
              </div>

              {/* Profile Details List */}
              <div className="w-full mt-4 space-y-2 text-left">
                {/* Phone */}
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 block">{isBn ? 'মোবাইল নম্বর' : 'Phone'}</span>
                      <span className="text-xs font-black text-gray-950 font-mono truncate block">{selectedReferredUser.phone || '০১৭********'}</span>
                    </div>
                  </div>
                  {selectedReferredUser.phone && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${selectedReferredUser.phone}`}
                        className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 shadow-2xs transition-all"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{isBn ? 'কল' : 'Call'}</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Email */}
                {selectedReferredUser.email && (
                  <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-2.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 block">{isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</span>
                      <span className="text-xs font-bold text-gray-900 truncate block">{selectedReferredUser.email}</span>
                    </div>
                  </div>
                )}

                {/* Referral Code & Reward Box */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-2.5">
                    <span className="text-[10px] font-bold text-sky-800/80 block">{isBn ? 'ইউজারের রেফার কোড' : 'Their Ref Code'}</span>
                    <span className="text-xs font-black text-sky-950 font-mono">#{selectedReferredUser.referralCode || '----'}</span>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-2.5">
                    <span className="text-[10px] font-bold text-emerald-800/80 block">{isBn ? 'অর্জিত বোনাস' : 'Earned Reward'}</span>
                    <span className="text-xs font-black text-emerald-700">+৳{perReferralReward} ({isBn ? 'জমা' : 'Credited'})</span>
                  </div>
                </div>

                {/* Joining Date */}
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block">{isBn ? 'যোগদানের তারিখ' : 'Joined Date'}</span>
                    <span className="text-xs font-bold text-gray-800">{selectedReferredUser.joinedDate || (isBn ? 'সাম্প্রতিক' : 'Recent')}</span>
                  </div>
                </div>

                {/* Verification & Connection Note */}
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-2.5 text-center text-xs font-bold text-emerald-950 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{isBn ? `আপনার রেফার কোড (${myReferralCode}) দিয়ে যুক্ত হয়েছেন` : `Joined using your referral code (${myReferralCode})`}</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedReferredUser(null)}
                className="w-full mt-4 py-2.5 bg-gray-950 hover:bg-gray-800 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {isBn ? 'প্রোফাইল বন্ধ করুন' : 'Close Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralNetworkModal;
