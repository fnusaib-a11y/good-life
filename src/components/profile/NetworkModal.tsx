import React, { useState, useMemo } from 'react';
import { 
  X, 
  Users, 
  Share2, 
  Copy, 
  Check, 
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
  Layers, 
  DollarSign, 
  Search, 
  Filter,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  BarChart3,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, NetworkUser } from '../../types';
import { formatStrict4DigitReferral } from '../../lib/referral';

interface NetworkModalProps {
  onClose: () => void;
}

interface MemberDisplayItem {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  level: 1 | 2 | 3;
  joinDate: string;
  status: 'active' | 'inactive';
  totalSales: number;
  commissionEarned: number;
  isVerified: boolean;
  district: string;
}

export const NetworkModal: React.FC<NetworkModalProps> = ({ onClose }) => {
  const { 
    user, 
    wallet, 
    registeredUsers, 
    systemSettings, 
    showToast, 
    isBn, 
    language, 
    syncReferralEarnings,
    setActiveTab
  } = useApp();

  const [activeTab, setActiveTabState] = useState<'tier1' | 'tier2' | 'tier3' | 'rules'>('tier1');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberDisplayItem | null>(null);

  // Strictly guaranteed 4-digit referral code
  const myReferralCode = formatStrict4DigitReferral(user?.referralCode);

  // 1. Direct Referrals (Level 1) from real registered users
  const directRegisteredUsers = useMemo(() => {
    return registeredUsers.filter(u => {
      if (!u.referredBy || u.id === user?.id) return false;
      const cleanRef = u.referredBy.trim().toUpperCase();
      const strictRef = formatStrict4DigitReferral(cleanRef);
      return cleanRef === myReferralCode || cleanRef === user?.referralCode || strictRef === myReferralCode;
    });
  }, [registeredUsers, user, myReferralCode]);

  // Real Level 1 Members
  const level1Members: MemberDisplayItem[] = useMemo(() => {
    return directRegisteredUsers.map(u => ({
      id: u.id,
      name: u.name || 'সদস্য',
      phone: u.phone,
      avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      level: 1 as const,
      joinDate: u.joinedDate || 'আজকে',
      status: 'active' as const,
      totalSales: 0,
      commissionEarned: u.isVerified ? (systemSettings?.referralBonus || 25) : 0,
      isVerified: Boolean(u.isVerified),
      district: u.address?.district || 'বাংলাদেশ'
    }));
  }, [directRegisteredUsers, systemSettings]);

  // Real Level 2 Members (Sub-team: recruited by Level 1 members)
  const level2Members: MemberDisplayItem[] = useMemo(() => {
    const l1Codes = new Set(
      directRegisteredUsers.flatMap(u => [
        (u.referralCode || '').trim().toUpperCase(),
        formatStrict4DigitReferral(u.referralCode)
      ]).filter(Boolean)
    );
    return registeredUsers.filter(u => {
      if (!u.referredBy || directRegisteredUsers.some(d => d.id === u.id) || u.id === user?.id) return false;
      const ref = (u.referredBy || '').trim().toUpperCase();
      const strictRef = formatStrict4DigitReferral(ref);
      return l1Codes.has(ref) || l1Codes.has(strictRef);
    }).map(u => ({
      id: u.id,
      name: u.name || 'সাব-টিম সদস্য',
      phone: u.phone,
      avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      level: 2 as const,
      joinDate: u.joinedDate || 'আজকে',
      status: 'active' as const,
      totalSales: 0,
      commissionEarned: 0,
      isVerified: Boolean(u.isVerified),
      district: u.address?.district || 'বাংলাদেশ'
    }));
  }, [directRegisteredUsers, registeredUsers, user]);

  // Real Level 3 Members (Deep network: recruited by Level 2 members)
  const level3Members: MemberDisplayItem[] = useMemo(() => {
    const l2Codes = new Set(
      level2Members.flatMap(m => {
        const found = registeredUsers.find(ru => ru.id === m.id);
        if (!found) return [];
        return [
          (found.referralCode || '').trim().toUpperCase(),
          formatStrict4DigitReferral(found.referralCode)
        ];
      }).filter(Boolean)
    );
    return registeredUsers.filter(u => {
      if (!u.referredBy || level2Members.some(d => d.id === u.id) || directRegisteredUsers.some(d => d.id === u.id) || u.id === user?.id) return false;
      const ref = (u.referredBy || '').trim().toUpperCase();
      const strictRef = formatStrict4DigitReferral(ref);
      return l2Codes.has(ref) || l2Codes.has(strictRef);
    }).map(u => ({
      id: u.id,
      name: u.name || '৩য় প্রজন্ম সদস্য',
      phone: u.phone,
      avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      level: 3 as const,
      joinDate: u.joinedDate || 'আজকে',
      status: 'active' as const,
      totalSales: 0,
      commissionEarned: 0,
      isVerified: Boolean(u.isVerified),
      district: u.address?.district || 'বাংলাদেশ'
    }));
  }, [level2Members, directRegisteredUsers, registeredUsers, user]);

  // Total Team Metrics
  const totalTeamCount = level1Members.length + level2Members.length + level3Members.length;
  const verifiedCount = [...level1Members, ...level2Members, ...level3Members].filter(m => m.isVerified).length;
  
  const perReferralReward = systemSettings?.referralBonus || 25;
  const l1Commissions = level1Members.filter(m => m.isVerified).length * perReferralReward;
  const l2Commissions = level2Members.reduce((sum, m) => sum + m.commissionEarned, 0);
  const l3Commissions = level3Members.reduce((sum, m) => sum + m.commissionEarned, 0);
  const totalCommissionsEarned = l1Commissions + l2Commissions + l3Commissions;

  // Determine Leader Rank based on team size
  const leaderRank = useMemo(() => {
    if (totalTeamCount >= 30) return { title: 'ডায়মন্ড ডিরেক্টর', color: 'from-purple-600 to-indigo-600', badge: '💎 Diamond', target: 50 };
    if (totalTeamCount >= 15) return { title: 'গোল্ড ক্যাপ্টেন', color: 'from-amber-500 to-yellow-600', badge: '🏆 Gold', target: 30 };
    if (totalTeamCount >= 5) return { title: 'সিলভার লিডার', color: 'from-sky-500 to-blue-600', badge: '⭐ Silver', target: 15 };
    return { title: 'ব্রোঞ্জ পার্টনার', color: 'from-emerald-500 to-teal-600', badge: '🌱 Bronze', target: 5 };
  }, [totalTeamCount]);

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
    showToast(isBn ? 'টিম ইনভাইট লিংক কপি হয়েছে!' : 'Team invite link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = isBn
      ? `Good Life-এ যুক্ত হয়ে ঘরে বসে প্রতিদিন মাইক্রো জব ও শপিং করে ইনকাম করুন! আমার ৪-ডিজিটের রেফার কোড: *${myReferralCode}* ব্যবহার করে এখনই ফ্রি একাউন্ট খুলুন এবং জয়েনিং বোনাস নিন।\n\nলিংক: ${window.location.origin}/?ref=${myReferralCode}`
      : `Join Good Life and start earning daily! Use my 4-digit code: *${myReferralCode}* to claim your welcome bonus.\n\nLink: ${window.location.origin}/?ref=${myReferralCode}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    const res = syncReferralEarnings ? syncReferralEarnings() : { credited: 0 };
    setTimeout(() => {
      setIsSyncing(false);
      if (res.credited > 0) {
        showToast(isBn ? `৳${res.credited} রেফার বোনাস সফলভাবে ওয়ালেটে যুক্ত হয়েছে!` : `৳${res.credited} credited to wallet!`);
      } else {
        showToast(isBn ? 'আপনার সকল টিম বোনাস ইতিমধ্যেই ওয়ালেটে জমা আছে।' : 'All team bonuses are already credited to your wallet.');
      }
    }, 500);
  };

  // Filter current tab members
  const currentMembers = useMemo(() => {
    let list: MemberDisplayItem[] = [];
    if (activeTab === 'tier1') list = level1Members;
    else if (activeTab === 'tier2') list = level2Members;
    else if (activeTab === 'tier3') list = level3Members;

    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.phone.includes(query) ||
      (m.district && m.district.toLowerCase().includes(query))
    );
  }, [activeTab, level1Members, level2Members, level3Members, searchQuery]);

  // Mask phone for privacy: 01877***819
  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 8) return phone;
    return phone.slice(0, 5) + '***' + phone.slice(-3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up border border-gray-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 px-5 py-4 flex items-center justify-between text-white shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">
                  {isBn ? 'মাই নেটওয়ার্ক ও টিম' : 'My Network & Team'}
                </h3>
                <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full border border-white/30 text-white">
                  ৩-টায়ার সিস্টেম
                </span>
              </div>
              <p className="text-[11px] text-purple-100 font-medium">
                {isBn ? 'আপনার টিম সদস্য ও প্যাসিভ কমিশন ট্র্যাকার' : 'Team Members & Passive Commission'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* 1. Team Leader Card & Rank */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
            {/* Background glowing circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 p-0.5 ring-2 ring-purple-400/50 overflow-hidden shadow-inner shrink-0">
                    <img 
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'} 
                      alt={user?.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-white">{user?.name || 'টিম লিডার'}</h4>
                      {user?.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                      )}
                    </div>
                    <span className="inline-block text-[11px] font-bold text-purple-200">
                      {leaderRank.badge} • {leaderRank.title}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-purple-200 block font-semibold">
                    {isBn ? 'মোট টিম আর্নিং' : 'Total Team Earnings'}
                  </span>
                  <span className="text-xl font-black text-yellow-400 tracking-tight">
                    ৳{totalCommissionsEarned}
                  </span>
                </div>
              </div>

              {/* Progress bar to next leader rank */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-bold text-purple-200">
                  <span>{isBn ? `টিম মেম্বার: ${totalTeamCount} জন` : `Team: ${totalTeamCount}`}</span>
                  <span>{isBn ? `পরবর্তী টার্গেট: ${leaderRank.target} জন` : `Next Target: ${leaderRank.target}`}</span>
                </div>
                <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalTeamCount / leaderRank.target) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Team Stats Grid (4 Metrics) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-2.5">
              <span className="text-[10px] font-bold text-gray-500 block">
                {isBn ? 'মোট টিম সদস্য' : 'Total Team'}
              </span>
              <span className="text-lg font-black text-purple-950">
                {totalTeamCount} <span className="text-xs font-semibold text-gray-600">{isBn ? 'জন' : ''}</span>
              </span>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-2.5">
              <span className="text-[10px] font-bold text-gray-500 block">
                {isBn ? 'ভেরিফাইড মেম্বার' : 'Verified'}
              </span>
              <span className="text-lg font-black text-emerald-950">
                {verifiedCount} <span className="text-xs font-semibold text-gray-600">{isBn ? 'জন' : ''}</span>
              </span>
            </div>

            <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-2.5">
              <span className="text-[10px] font-bold text-gray-500 block">
                {isBn ? 'লেভেল ১ (সরাসরি)' : 'Level 1'}
              </span>
              <span className="text-lg font-black text-sky-950">
                {level1Members.length} <span className="text-xs font-semibold text-gray-600">{isBn ? 'জন' : ''}</span>
              </span>
            </div>

            <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-2.5">
              <span className="text-[10px] font-bold text-gray-500 block">
                {isBn ? 'সাব-টিম (L2+L3)' : 'Sub-Team'}
              </span>
              <span className="text-lg font-black text-amber-950">
                {level2Members.length + level3Members.length} <span className="text-xs font-semibold text-gray-600">{isBn ? 'জন' : ''}</span>
              </span>
            </div>
          </div>

          {/* 3. Referral Invite & 4-Digit Code Box */}
          <div className="bg-gray-50 border border-gray-200/90 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-purple-600" />
                <span>{isBn ? 'আপনার ৪-ডিজিট রেফারেল কোড:' : 'Your 4-Digit Referral Code:'}</span>
              </span>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                প্রতি রেফারে ৳{perReferralReward}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border-2 border-purple-400 rounded-xl px-3 py-2 text-center shadow-xs">
                <span className="text-xl font-black text-purple-900 tracking-widest font-mono">
                  {myReferralCode}
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কোড কপি' : 'Copy')}</span>
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleShareWhatsApp}
                className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isBn ? 'হোয়াটসঅ্যাপে শেয়ার' : 'WhatsApp'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full py-2 px-3 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? (isBn ? 'লিংক কপি হয়েছে' : 'Copied') : (isBn ? 'ইনভাইট লিংক' : 'Copy Link')}</span>
              </button>
            </div>
          </div>

          {/* 4. Instant Earnings Claim / Wallet Sync Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-500 block leading-tight">
                  {isBn ? 'ওয়ালেটে যুক্ত টিম বোনাস:' : 'Credited in Wallet:'}
                </span>
                <span className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                  <span>৳{wallet?.incomeBreakdown?.referralIncome ?? totalCommissionsEarned}</span>
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                    {isBn ? 'সরাসরি ব্যালেন্সে যুক্ত' : 'Active Balance'}
                  </span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isBn ? 'রিফ্রেশ/ক্লেইম' : 'Claim'}</span>
            </button>
          </div>

          {/* 5. TABS: Tier 1, Tier 2, Tier 3, Rules */}
          <div className="space-y-3">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => { setActiveTabState('tier1'); setSelectedMember(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'tier1'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isBn ? `লেভেল ১ (${level1Members.length})` : `Tier 1 (${level1Members.length})`}
              </button>

              <button
                onClick={() => { setActiveTabState('tier2'); setSelectedMember(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'tier2'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isBn ? `লেভেল ২ (${level2Members.length})` : `Tier 2 (${level2Members.length})`}
              </button>

              <button
                onClick={() => { setActiveTabState('tier3'); setSelectedMember(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'tier3'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isBn ? `লেভেল ৩ (${level3Members.length})` : `Tier 3 (${level3Members.length})`}
              </button>

              <button
                onClick={() => { setActiveTabState('rules'); setSelectedMember(null); }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'rules'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isBn ? 'কমিশন চার্ট' : 'Rules'}
              </button>
            </div>

            {/* TAB CONTENT: RULES */}
            {activeTab === 'rules' ? (
              <div className="bg-gray-50 border border-gray-200/90 rounded-2xl p-4 space-y-3 text-xs animate-fade-in">
                <h4 className="font-black text-gray-900 flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>{isBn ? '৩-টায়ার টিম কমিশন মেকানিজম' : '3-Tier Commission Structure'}</span>
                </h4>

                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-purple-900 block">
                        {isBn ? 'লেভেল ১ (সরাসরি রেফারেল)' : 'Level 1 (Direct)'}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {isBn ? 'আপনার ৪-ডিজিট কোড দিয়ে সরাসরি জয়েন' : 'Direct invites using your code'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 text-sm">৳{perReferralReward}</span>
                      <span className="text-[10px] text-gray-500 block font-bold">+ ৫% টাস্ক কমিশন</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-sky-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-sky-900 block">
                        {isBn ? 'লেভেল ২ (সাব-টিম)' : 'Level 2 (Sub-team)'}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {isBn ? 'আপনার লেভেল ১ সদস্যদের আমন্ত্রিত সদস্য' : 'Recruited by your Level 1 team'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 text-sm">৳১০</span>
                      <span className="text-[10px] text-gray-500 block font-bold">+ ২% টাস্ক কমিশন</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-amber-900 block">
                        {isBn ? 'লেভেল ৩ (ডিপ নেটওয়ার্ক)' : 'Level 3 (Deep Network)'}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {isBn ? 'লেভেল ২ সদস্যদের আমন্ত্রিত সদস্য' : 'Recruited by your Level 2 team'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 text-sm">৳৫</span>
                      <span className="text-[10px] text-gray-500 block font-bold">+ ১% টাস্ক কমিশন</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-xl border border-purple-200/80 text-[11px] text-purple-950 space-y-1">
                  <span className="font-black block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    {isBn ? 'আজীবন প্যাসিভ আয়ের নিয়ম:' : 'Lifetime Passive Rules:'}
                  </span>
                  <p className="font-medium text-gray-700 leading-relaxed">
                    {isBn
                      ? 'আপনার টিমের যেকোনো সদস্য যখনই মাইক্রো জব বা রিসেলিং থেকে আয় করবে, স্বয়ংক্রিয়ভাবে তার নির্ধারিত শতাংশ সরাসরি আপনার ওয়ালেটে জমা হবে।'
                      : 'Whenever your team members complete microjobs or reselling, your designated percentage is instantly credited to your wallet.'}
                  </p>
                </div>
              </div>
            ) : (
              /* TAB CONTENT: MEMBERS LIST (TIER 1, 2, 3) */
              <div className="space-y-2.5 animate-fade-in">
                {/* Search input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isBn ? 'সদস্যের নাম বা ফোন নম্বর খুঁজুন...' : 'Search member by name or phone...'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Member Items */}
                {currentMembers.length === 0 ? (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                      <Users className="w-5 h-5" />
                    </div>
                    <h5 className="font-extrabold text-xs text-gray-800">
                      {isBn ? 'এই লেভেলে কোনো সদস্য পাওয়া যায়নি' : 'No members found in this tier'}
                    </h5>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {isBn 
                        ? 'আপনার রেফারেল কোড বন্ধুদের সাথে শেয়ার করে দ্রুত টিম বড় করুন।'
                        : 'Share your referral code to grow this tier quickly.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {currentMembers.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedMember?.id === member.id
                            ? 'bg-purple-50 border-purple-400 shadow-xs'
                            : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/70'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                            {member.isVerified && (
                              <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 ring-1 ring-white">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-gray-900 truncate">{member.name}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 shrink-0">
                                L{member.level}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-500 font-medium font-mono block truncate">
                              {maskPhone(member.phone)} • {member.district}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {member.isVerified ? (
                            <span className="text-xs font-black text-emerald-600 block">
                              +৳{member.commissionEarned}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md block">
                              {isBn ? 'ভেরিফাই হলে ৳' + (systemSettings?.referralBonus || 25) : 'Pending'}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 font-medium">
                            {member.joinDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Member Detail Box */}
                {selectedMember && (
                  <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3.5 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-purple-700" />
                        <span className="font-black text-xs text-purple-950">
                          {selectedMember.name} ({isBn ? `লেভেল ${selectedMember.level}` : `Level ${selectedMember.level}`})
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {isBn ? 'সক্রিয় সদস্য' : 'Active Member'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-white/90 p-2 rounded-xl border border-purple-100">
                        <span className="text-gray-500 block font-medium">{isBn ? 'অর্জিত কমিশন' : 'Commission'}</span>
                        <span className="font-black text-emerald-600 text-xs">৳{selectedMember.commissionEarned}.০০</span>
                      </div>
                      <div className="bg-white/90 p-2 rounded-xl border border-purple-100">
                        <span className="text-gray-500 block font-medium">{isBn ? 'টিম বিক্রয়/ভলিউম' : 'Team Volume'}</span>
                        <span className="font-black text-gray-900 text-xs">৳{selectedMember.totalSales}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex gap-2">
                      <a
                        href={`https://api.whatsapp.com/send?phone=88${selectedMember.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(
                          isBn ? `আসসালামু আলাইকুম ${selectedMember.name}, আমি Good Life থেকে আপনার টিম লিডার বলছি।` : `Hello ${selectedMember.name}, I am your Good Life team leader.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isBn ? 'হোয়াটসঅ্যাপে বার্তা' : 'WhatsApp'}</span>
                      </a>
                      <a
                        href={`tel:${selectedMember.phone}`}
                        className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{isBn ? 'কল করুন' : 'Call'}</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500 font-medium">
            {isBn ? 'টিম সদস্য সংখ্যা বাড়লে কমিশন বৃদ্ধি পায়' : 'More team members earn higher passive income'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-black active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
