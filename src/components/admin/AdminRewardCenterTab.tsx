import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  CalendarCheck, 
  LifeBuoy, 
  Users, 
  Ticket, 
  QrCode, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Layers, 
  Check, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  ClaimRewardItem, 
  DailySignInConfig, 
  RescueFundCampaign, 
  PromoCodeItem, 
  TemuTicketCampaign,
  RewardCenterSystemSettings 
} from '../../types/rewardCenter';
import { 
  getRewardCenterSettings, 
  saveRewardCenterSettings,
  addClaimReward,
  updateClaimReward,
  deleteClaimReward,
  addRescueCampaign,
  updateRescueCampaign,
  deleteRescueCampaign,
  addPromoCode,
  updatePromoCode,
  deletePromoCode,
  addTemuCampaign,
  updateTemuCampaign,
  deleteTemuCampaign
} from '../../services/rewardCenterService';

export const AdminRewardCenterTab: React.FC = () => {
  const { showToast } = useApp();

  const [settings, setSettings] = useState<RewardCenterSystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'claim' | 'signin' | 'rescue' | 'invite' | 'promo' | 'temu'>('claim');

  // Claim Reward Form
  const [claimFormOpen, setClaimFormOpen] = useState(false);
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [claimTitle, setClaimTitle] = useState('');
  const [claimAmount, setClaimAmount] = useState(5.00);
  const [claimDesc, setClaimDesc] = useState('');
  const [claimImage, setClaimImage] = useState('');
  const [claimCondition, setClaimCondition] = useState('সকলের জন্য উন্মুক্ত');
  const [claimConditionType, setClaimConditionType] = useState<'free' | 'deposit' | 'verified' | 'referrals'>('free');
  const [claimMinDeposit, setClaimMinDeposit] = useState(0);
  const [claimMinReferrals, setClaimMinReferrals] = useState(0);
  const [claimStartDate, setClaimStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [claimEndDate, setClaimEndDate] = useState('');
  const [claimLimit, setClaimLimit] = useState(100);
  const [claimStatus, setClaimStatus] = useState<'active' | 'inactive'>('active');

  // Daily Sign-In State
  const [signInConfig, setSignInConfig] = useState<DailySignInConfig | null>(null);

  // Rescue Fund Form
  const [rescueFormOpen, setRescueFormOpen] = useState(false);
  const [editingRescueId, setEditingRescueId] = useState<string | null>(null);
  const [rescueName, setRescueName] = useState('');
  const [rescueDesc, setRescueDesc] = useState('');
  const [rescueImage, setRescueImage] = useState('');
  const [rescueTarget, setRescueTarget] = useState(10000);
  const [rescueReward, setRescueReward] = useState(10.00);
  const [rescueCondition, setRescueCondition] = useState('সকল মেম্বার');
  const [rescueConditionType, setRescueConditionType] = useState<'all_members' | 'verified' | 'deposit'>('all_members');
  const [rescueMinDeposit, setRescueMinDeposit] = useState(0);
  const [rescueStartDate, setRescueStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [rescueEndDate, setRescueEndDate] = useState('');
  const [rescueStatus, setRescueStatus] = useState<'active' | 'inactive'>('active');

  // Promo Code Form
  const [promoFormOpen, setPromoFormOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoReward, setPromoReward] = useState(10.00);
  const [promoStartDate, setPromoStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [promoExpiry, setPromoExpiry] = useState('');
  const [promoTotalLimit, setPromoTotalLimit] = useState(100);
  const [promoPerUserLimit, setPromoPerUserLimit] = useState(1);
  const [promoStatus, setPromoStatus] = useState<'active' | 'inactive'>('active');

  // Temu Ticket Form
  const [temuFormOpen, setTemuFormOpen] = useState(false);
  const [editingTemuId, setEditingTemuId] = useState<string | null>(null);
  const [temuTitle, setTemuTitle] = useState('');
  const [temuDesc, setTemuDesc] = useState('');
  const [temuCondition, setTemuCondition] = useState('');
  const [temuReward, setTemuReward] = useState(55.68);
  const [temuStartDate, setTemuStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [temuEndDate, setTemuEndDate] = useState('');
  const [temuStatus, setTemuStatus] = useState<'active' | 'inactive'>('active');

  // Invite bonus state
  const [inviteBonus, setInviteBonus] = useState(10);
  const [inviteTerms, setInviteTerms] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getRewardCenterSettings();
      setSettings(data);
      if (data.dailySignInConfig) {
        setSignInConfig(data.dailySignInConfig);
      }
      if (data.inviteBonusAmount !== undefined) {
        setInviteBonus(data.inviteBonusAmount);
      }
      if (data.inviteTerms !== undefined) {
        setInviteTerms(data.inviteTerms);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  /* ------------------- TOGGLES ------------------- */
  const handleToggleFeature = async (featureKey: keyof RewardCenterSystemSettings['featureToggles']) => {
    if (!settings) return;
    const updated = {
      ...settings,
      featureToggles: {
        ...settings.featureToggles,
        [featureKey]: !settings.featureToggles[featureKey]
      }
    };
    await saveRewardCenterSettings(updated);
    setSettings(updated);
    showToast(`ফিচার ${updated.featureToggles[featureKey] ? 'চালু' : 'বন্ধ'} করা হয়েছে!`);
  };

  /* ------------------- CLAIM REWARDS ACTIONS ------------------- */
  const handleSaveClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimTitle.trim()) {
      showToast('টাইটেল পূরণ করুন');
      return;
    }

    const payload: ClaimRewardItem = {
      id: editingClaimId || `claim_${Date.now()}`,
      title: claimTitle.trim(),
      code: claimTitle.trim().replace(/\s+/g, '_').toUpperCase(),
      amount: Number(claimAmount) || 0,
      description: claimDesc.trim(),
      imageUrl: claimImage.trim() || undefined,
      couponBadgeType: 'blue',
      couponBadgeTitle: 'বোনাস',
      requiredCondition: claimCondition.trim() || 'সকলের জন্য উন্মুক্ত',
      conditionType: claimConditionType,
      minDepositAmount: claimConditionType === 'deposit' ? Number(claimMinDeposit) : undefined,
      minReferrals: claimConditionType === 'referrals' ? Number(claimMinReferrals) : undefined,
      startDate: claimStartDate,
      endDate: claimEndDate || '2026-12-31',
      totalClaimLimit: Number(claimLimit) || 100,
      claimedCount: 0,
      status: claimStatus
    };

    if (editingClaimId) {
      await updateClaimReward(payload.id, payload);
      showToast('রিওয়ার্ড আপডেট করা হয়েছে!');
    } else {
      await addClaimReward(payload);
      showToast('নতুন রিওয়ার্ড তৈরি হয়েছে!');
    }

    setClaimFormOpen(false);
    setEditingClaimId(null);
    await loadSettings();
  };

  const handleEditClaim = (item: ClaimRewardItem) => {
    setEditingClaimId(item.id);
    setClaimTitle(item.title);
    setClaimAmount(item.amount);
    setClaimDesc(item.description || '');
    setClaimImage(item.imageUrl || '');
    setClaimCondition(item.requiredCondition || '');
    setClaimConditionType(item.conditionType || 'free');
    setClaimMinDeposit(item.minDepositAmount || 0);
    setClaimMinReferrals(item.minReferrals || 0);
    setClaimStartDate(item.startDate || new Date().toISOString().split('T')[0]);
    setClaimEndDate(item.endDate || '');
    setClaimLimit(item.totalClaimLimit || 100);
    setClaimStatus(item.status);
    setClaimFormOpen(true);
  };

  const handleDeleteClaim = async (id: string) => {
    if (!window.confirm('মুছে ফেলতে চান?')) return;
    await deleteClaimReward(id);
    showToast('রিওয়ার্ড মুছে ফেলা হয়েছে');
    await loadSettings();
  };

  /* ------------------- RESCUE FUND ACTIONS ------------------- */
  const handleSaveRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescueName.trim()) {
      showToast('নাম পূরণ করুন');
      return;
    }

    const payload: RescueFundCampaign = {
      id: editingRescueId || `rescue_${Date.now()}`,
      name: rescueName.trim(),
      description: rescueDesc.trim(),
      targetAmount: Number(rescueTarget) || 10000,
      distributedAmount: 0,
      rewardAmount: Number(rescueReward) || 10,
      requiredCondition: rescueCondition.trim() || 'সকল মেম্বার',
      conditionType: rescueConditionType,
      minDeposit: rescueConditionType === 'deposit' ? Number(rescueMinDeposit) : undefined,
      startDate: rescueStartDate,
      endDate: rescueEndDate || '2026-12-31',
      status: rescueStatus
    };

    if (editingRescueId) {
      await updateRescueCampaign(payload.id, payload);
      showToast('উদ্ধার তহবিল আপডেট হয়েছে!');
    } else {
      await addRescueCampaign(payload);
      showToast('নতুন উদ্ধার তহবিল তৈরি হয়েছে!');
    }

    setRescueFormOpen(false);
    setEditingRescueId(null);
    await loadSettings();
  };

  const handleEditRescue = (item: RescueFundCampaign) => {
    setEditingRescueId(item.id);
    setRescueName(item.name || '');
    setRescueDesc(item.description || '');
    setRescueTarget(item.targetAmount || 10000);
    setRescueReward(item.rewardAmount || 10);
    setRescueCondition(item.requiredCondition || 'সকল মেম্বার');
    setRescueConditionType(item.conditionType || 'all_members');
    setRescueMinDeposit(item.minDeposit || 0);
    setRescueStartDate(item.startDate || new Date().toISOString().split('T')[0]);
    setRescueEndDate(item.endDate || '');
    setRescueStatus(item.status === 'completed' ? 'inactive' : item.status);
    setRescueFormOpen(true);
  };

  const handleDeleteRescue = async (id: string) => {
    if (!window.confirm('মুছে ফেলতে চান?')) return;
    await deleteRescueCampaign(id);
    showToast('ক্যাম্পেইন মুছে ফেলা হয়েছে');
    await loadSettings();
  };

  /* ------------------- PROMO CODE ACTIONS ------------------- */
  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      showToast('প্রচার কোড লিখুন');
      return;
    }

    const payload: PromoCodeItem = {
      id: editingPromoId || `promo_${Date.now()}`,
      code: promoCode.trim().toUpperCase(),
      title: promoTitle.trim() || promoCode.trim().toUpperCase(),
      rewardAmount: Number(promoReward) || 0,
      description: promoDesc.trim(),
      startDate: promoStartDate,
      expiryDate: promoExpiry || '',
      totalUsageLimit: Number(promoTotalLimit) || 100,
      usedCount: 0,
      perUserLimit: Number(promoPerUserLimit) || 1,
      status: promoStatus
    };

    if (editingPromoId) {
      await updatePromoCode(payload.id, payload);
      showToast('প্রচার কোড আপডেট হয়েছে!');
    } else {
      await addPromoCode(payload);
      showToast('নতুন প্রচার কোড তৈরি হয়েছে!');
    }

    setPromoFormOpen(false);
    setEditingPromoId(null);
    await loadSettings();
  };

  const handleEditPromo = (item: PromoCodeItem) => {
    setEditingPromoId(item.id);
    setPromoCode(item.code);
    setPromoTitle(item.title || '');
    setPromoDesc(item.description || '');
    setPromoReward(item.rewardAmount);
    setPromoStartDate(item.startDate || new Date().toISOString().split('T')[0]);
    setPromoExpiry(item.expiryDate || '');
    setPromoTotalLimit(item.totalUsageLimit || 100);
    setPromoPerUserLimit(item.perUserLimit || 1);
    setPromoStatus(item.status);
    setPromoFormOpen(true);
  };

  const handleDeletePromo = async (id: string) => {
    if (!window.confirm('মুছে ফেলতে চান?')) return;
    await deletePromoCode(id);
    showToast('প্রচার কোড মুছে ফেলা হয়েছে');
    await loadSettings();
  };

  /* ------------------- TEMU TICKET ACTIONS ------------------- */
  const handleSaveTemu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temuTitle.trim()) {
      showToast('টিকিট নাম লিখুন');
      return;
    }

    const payload: TemuTicketCampaign = {
      id: editingTemuId || `temu_${Date.now()}`,
      ticketName: temuTitle.trim(),
      title: temuTitle.trim(),
      description: temuDesc.trim(),
      condition: temuCondition.trim() || 'সকল মেম্বার',
      rewardAmount: Number(temuReward) || 55.68,
      amount: Number(temuReward) || 55.68,
      category: 'টেমু স্পেশাল',
      startDate: temuStartDate,
      endDate: temuEndDate || '',
      status: temuStatus
    };

    if (editingTemuId) {
      await updateTemuCampaign(payload.id, payload);
      showToast('টেমু টিকিট আপডেট হয়েছে!');
    } else {
      await addTemuCampaign(payload);
      showToast('নতুন টেমু টিকিট ক্যাম্পেইন তৈরি হয়েছে!');
    }

    setTemuFormOpen(false);
    setEditingTemuId(null);
    await loadSettings();
  };

  const handleEditTemu = (item: TemuTicketCampaign) => {
    setEditingTemuId(item.id);
    setTemuTitle(item.ticketName || item.title || '');
    setTemuDesc(item.description || '');
    setTemuCondition(item.condition || '');
    setTemuReward(item.rewardAmount || item.amount || 55.68);
    setTemuStartDate(item.startDate || new Date().toISOString().split('T')[0]);
    setTemuEndDate(item.endDate || '');
    setTemuStatus(item.status);
    setTemuFormOpen(true);
  };

  const handleDeleteTemu = async (id: string) => {
    if (!window.confirm('মুছে ফেলতে চান?')) return;
    await deleteTemuCampaign(id);
    showToast('টেমু টিকিট মুছে ফেলা হয়েছে');
    await loadSettings();
  };

  /* ------------------- INVITE BONUS SETTINGS ------------------- */
  const handleSaveInvite = async () => {
    if (!settings) return;
    const updated = {
      ...settings,
      inviteBonusAmount: Number(inviteBonus) || 10,
      inviteTerms: inviteTerms.trim()
    };
    await saveRewardCenterSettings(updated);
    showToast('আমন্ত্রণ রিওয়ার্ড সেটিংস সেভ হয়েছে!');
    await loadSettings();
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">পুরস্কার সেন্টার ম্যানেজমেন্ট (রিয়েল সিস্টেম)</h2>
            <p className="text-xs sm:text-sm text-amber-100 font-medium mt-0.5">
              পুরস্কার সেন্টারের ৬টি অপশন সম্পূর্ণ রিয়েল ডেটাবেসে নিয়ন্ত্রণ করুন: দাবি করা, সাইন ইন, উদ্ধার তহবিল, বন্ধুদের আমন্ত্রণ, প্রচার কোড ও টেমু টিকিট।
            </p>
          </div>
        </div>
      </div>

      {/* Feature Enable/Disable Toggles Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>ফিচার অন/অফ সুইচ (ইউজার সাইড ভিজিবিলিটি)</span>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {settings?.featureToggles && Object.entries(settings.featureToggles).map(([key, enabled]) => {
            const labels: Record<string, string> = {
              claim: '১. দাবি করা',
              signin: '২. সাইন ইন',
              rescue_fund: '৩. উদ্ধার তহবিল',
              invite: '৪. আমন্ত্রণ',
              promo_code: '৫. প্রচার কোড',
              temu_ticket: '৬. টেমু টিকিট'
            };
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleToggleFeature(key as any)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                  enabled 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{labels[key] || key}</div>
                  <div className={`text-[10px] font-semibold ${enabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {enabled ? 'সক্রিয় (Active)' : 'বন্ধ (Off)'}
                  </div>
                </div>
                {enabled ? (
                  <ToggleRight className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6 Sub-Tab Navigation - CRISP LIGHT MODE CONTRAST */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('claim')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'claim'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Gift className="w-4 h-4" /> ১. দাবি করা
        </button>

        <button
          onClick={() => setActiveTab('signin')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'signin'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" /> ২. সাইন ইন
        </button>

        <button
          onClick={() => setActiveTab('rescue')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'rescue'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <LifeBuoy className="w-4 h-4" /> ৩. উদ্ধার তহবিল
        </button>

        <button
          onClick={() => setActiveTab('invite')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'invite'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> ৪. বন্ধুদের আমন্ত্রণ
        </button>

        <button
          onClick={() => setActiveTab('promo')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'promo'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" /> ৫. প্রচার কোড
        </button>

        <button
          onClick={() => setActiveTab('temu')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'temu'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Ticket className="w-4 h-4" /> ৬. টেমু টিকিট
        </button>
      </div>

      {/* ---------------- 1. দাবি করা (CLAIM REWARDS) ---------------- */}
      {activeTab === 'claim' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              দাবি করার রিওয়ার্ড তালিকা ({(settings?.claimRewards || []).length})
            </h3>
            <button
              onClick={() => {
                setEditingClaimId(null);
                setClaimTitle('');
                setClaimAmount(5);
                setClaimDesc('');
                setClaimImage('');
                setClaimCondition('সবার জন্য উন্মুক্ত');
                setClaimConditionType('free');
                setClaimFormOpen(true);
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> নতুন রিওয়ার্ড যোগ
            </button>
          </div>

          {claimFormOpen && (
            <form onSubmit={handleSaveClaim} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span>{editingClaimId ? 'রিওয়ার্ড সম্পাদন' : 'নতুন দাবি রিওয়ার্ড'}</span>
                </h4>
                <button type="button" onClick={() => setClaimFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">রিওয়ার্ড টাইটেল *</label>
                  <input
                    type="text"
                    required
                    value={claimTitle}
                    onChange={e => setClaimTitle(e.target.value)}
                    placeholder="যেমন: নতুন জয়েনিং স্পেশাল উপহার"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">টাকার পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={claimAmount}
                    onChange={e => setClaimAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">ইমেজ / আইকন লিংক</label>
                  <input
                    type="url"
                    value={claimImage}
                    onChange={e => setClaimImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">শর্তের ধরণ</label>
                  <select
                    value={claimConditionType}
                    onChange={e => setClaimConditionType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  >
                    <option value="free">ফ্রি / কোনো শর্ত নেই</option>
                    <option value="verified">শুধুমাত্র ভেরিফাইড ইউজার</option>
                    <option value="deposit">ডিপোজিট শর্ত</option>
                    <option value="referrals">রেফারেল শর্ত</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">শর্তের বর্ণনা</label>
                  <input
                    type="text"
                    value={claimCondition}
                    onChange={e => setClaimCondition(e.target.value)}
                    placeholder="যেমন: অ্যাক্টিভ অ্যাকাউন্ট থাকা আবশ্যক"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">স্ট্যাটাস</label>
                  <select
                    value={claimStatus}
                    onChange={e => setClaimStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  >
                    <option value="active">Active (সক্রিয়)</option>
                    <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">বিবরণ</label>
                  <textarea
                    rows={2}
                    value={claimDesc}
                    onChange={e => setClaimDesc(e.target.value)}
                    placeholder="রিওয়ার্ডের বিস্তারিত..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(settings?.claimRewards || []).length === 0 ? (
              <div className="col-span-2 py-8 text-center text-slate-500 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
                কোনো দাবি করার রিওয়ার্ড পোস্ট নেই। উপরে বাটন দিয়ে নতুন যোগ করুন।
              </div>
            ) : (
              (settings?.claimRewards || []).map(r => (
                <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{r.title}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        ৳{r.amount}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${r.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{r.requiredCondition || r.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleEditClaim(r)} className="p-1.5 text-slate-500 hover:text-amber-600 cursor-pointer">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteClaim(r.id)} className="p-1.5 text-rose-400 hover:text-rose-600 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------- 2. সাইন ইন সেটিংস (DAILY SIGN-IN) ---------------- */}
      {activeTab === 'signin' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                দৈনিক সাইন ইন ৭-দিনের রিওয়ার্ড কনফিগারেশন
              </h3>
              <p className="text-xs text-slate-500">ইউজার প্রতিদিন লগইন করে যে রিওয়ার্ড পাবে তা নির্ধারণ করুন।</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map(day => {
              const currentVal = signInConfig?.days?.find(d => d.day === day)?.rewardAmount ?? (day === 7 ? 10 : day * 0.5);
              return (
                <div key={day} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-700 block">দিন {day}</span>
                  <div className="text-xs font-black text-slate-900">৳ {currentVal}</div>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={currentVal}
                    onChange={async (e) => {
                      const v = parseFloat(e.target.value) || 0;
                      if (!settings) return;
                      const existingDays = settings.dailySignInConfig?.days || [];
                      const dayFound = existingDays.some(d => d.day === day);
                      const updatedDays = dayFound
                        ? existingDays.map(d => d.day === day ? { ...d, rewardAmount: v } : d)
                        : [...existingDays, { day, rewardAmount: v, bonusTitle: `দিন ${day} সাইন-ইন বোনাস` }];
                      const updated = {
                        ...settings,
                        dailySignInConfig: {
                          ...settings.dailySignInConfig,
                          days: updatedDays
                        }
                      };
                      await saveRewardCenterSettings(updated);
                      setSettings(updated);
                    }}
                    className="w-full px-2 py-1 text-center bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- 3. উদ্ধার তহবিল (RESCUE FUND) ---------------- */}
      {activeTab === 'rescue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              উদ্ধার তহবিল ক্যাম্পেইন তালিকা ({(settings?.rescueFundCampaigns || []).length})
            </h3>
            <button
              onClick={() => {
                setEditingRescueId(null);
                setRescueName('');
                setRescueDesc('');
                setRescueTarget(10000);
                setRescueReward(10);
                setRescueCondition('সকল মেম্বার');
                setRescueConditionType('all_members');
                setRescueFormOpen(true);
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> নতুন তহবিল ক্যাম্পেইন
            </button>
          </div>

          {rescueFormOpen && (
            <form onSubmit={handleSaveRescue} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <LifeBuoy className="w-4 h-4 text-amber-500" />
                  <span>{editingRescueId ? 'তহবিল সম্পাদনা' : 'নতুন উদ্ধার তহবিল'}</span>
                </h4>
                <button type="button" onClick={() => setRescueFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">ক্যাম্পেইনের নাম *</label>
                  <input
                    type="text"
                    required
                    value={rescueName}
                    onChange={e => setRescueName(e.target.value)}
                    placeholder="যেমন: ইমারজেন্সি মেম্বার সাপোর্ট"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">ইউজার রিওয়ার্ড টাকা (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={rescueReward}
                    onChange={e => setRescueReward(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">টার্গেট বাজেট (৳)</label>
                  <input
                    type="number"
                    value={rescueTarget}
                    onChange={e => setRescueTarget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">শর্ত</label>
                  <input
                    type="text"
                    value={rescueCondition}
                    onChange={e => setRescueCondition(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">বিবরণ</label>
                  <textarea
                    rows={2}
                    value={rescueDesc}
                    onChange={e => setRescueDesc(e.target.value)}
                    placeholder="তহবিলের উদ্দেশ্য ও শর্ত..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setRescueFormOpen(false)} className="px-4 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">
                  বাতিল
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow cursor-pointer">
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(settings?.rescueFundCampaigns || []).length === 0 ? (
              <div className="col-span-2 py-8 text-center text-slate-500 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
                কোনো উদ্ধার তহবিল ক্যাম্পেইন নেই।
              </div>
            ) : (
              (settings?.rescueFundCampaigns || []).map(r => (
                <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{r.name}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                        ৳{r.rewardAmount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{r.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">টার্গেট: ৳{r.targetAmount}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleEditRescue(r)} className="p-1.5 text-slate-500 hover:text-amber-600 cursor-pointer">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteRescue(r.id)} className="p-1.5 text-rose-400 hover:text-rose-600 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------- 4. বন্ধুদের আমন্ত্রণ (INVITE SETTINGS) ---------------- */}
      {activeTab === 'invite' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              বন্ধুদের আমন্ত্রণ বোনাস ও টার্মস সেটিংস
            </h3>
            <button
              onClick={handleSaveInvite}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-4 h-4" /> সংরক্ষণ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">রেফারেল বোনাস টাকা (৳)</label>
              <input
                type="number"
                value={inviteBonus}
                onChange={e => setInviteBonus(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:border-amber-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                আমন্ত্রিত বন্ধু ভেরিফিকেশন সম্পন্ন করলে স্বয়ংক্রিয়ভাবে রেফারার এই বোনাস পাবেন।
              </span>
            </div>
            <div className="md:col-span-2">
              <label className="font-bold text-slate-800 block mb-1">আমন্ত্রণ নিয়ম ও শর্তাবলী (Terms)</label>
              <textarea
                rows={3}
                value={inviteTerms}
                onChange={e => setInviteTerms(e.target.value)}
                placeholder="আমন্ত্রণ নিয়ম ও শর্তাবলী লিখুন..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-amber-500 outline-none font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 5. প্রচার কোড (PROMO CODE) - FIX VISIBILITY ---------------- */}
      {activeTab === 'promo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              প্রচার কোড (প্রোমো কোড) তালিকা ({(settings?.promoCodes || []).length})
            </h3>
            <button
              onClick={() => {
                setEditingPromoId(null);
                setPromoCode('');
                setPromoTitle('');
                setPromoDesc('');
                setPromoReward(10);
                setPromoTotalLimit(100);
                setPromoPerUserLimit(1);
                setPromoFormOpen(true);
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> নতুন প্রচার কোড
            </button>
          </div>

          {promoFormOpen && (
            <form onSubmit={handleSavePromo} className="bg-white p-6 rounded-2xl border border-slate-300 shadow-xl space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-500" />
                  <span>{editingPromoId ? 'কোড সম্পাদনা' : 'নতুন প্রচার কোড তৈরি'}</span>
                </h4>
                <button type="button" onClick={() => setPromoFormOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">প্রচার কোড (Promo Code) *</label>
                  <input
                    type="text"
                    required
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="যেমন: BONUS50"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 font-mono font-bold focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">রিওয়ার্ড টাকার পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={promoReward}
                    onChange={e => setPromoReward(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 font-bold focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">কোডের নাম / শিরোনাম</label>
                  <input
                    type="text"
                    value={promoTitle}
                    onChange={e => setPromoTitle(e.target.value)}
                    placeholder="স্পেশাল অফার বোনাস"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">সর্বোচ্চ কতবার ব্যবহার করা যাবে</label>
                  <input
                    type="number"
                    value={promoTotalLimit}
                    onChange={e => setPromoTotalLimit(parseInt(e.target.value) || 100)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 font-bold focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">মেয়াদ শেষ তারিখ</label>
                  <input
                    type="date"
                    value={promoExpiry}
                    onChange={e => setPromoExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">স্ট্যাটাস</label>
                  <select
                    value={promoStatus}
                    onChange={e => setPromoStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  >
                    <option value="active">Active (সক্রিয়)</option>
                    <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1.5">বিবরণ</label>
                  <textarea
                    rows={2}
                    value={promoDesc}
                    onChange={e => setPromoDesc(e.target.value)}
                    placeholder="কোডটি কোথায় এবং কিভাবে ব্যবহার করতে হবে..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPromoFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(settings?.promoCodes || []).length === 0 ? (
              <div className="col-span-2 py-8 text-center text-slate-500 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
                কোনো সক্রিয় প্রচার কোড নেই।
              </div>
            ) : (
              (settings?.promoCodes || []).map(p => (
                <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        ৳{p.rewardAmount}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{p.title || p.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      ব্যবহার: {p.usedCount || 0}/{p.totalUsageLimit || 'আনলিমিটেড'} | মেয়াদ: {p.expiryDate || 'অনির্দিষ্ট'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleEditPromo(p)} className="p-1.5 text-slate-500 hover:text-amber-600 cursor-pointer">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeletePromo(p.id)} className="p-1.5 text-rose-400 hover:text-rose-600 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------- 6. টেমু টিকিট (TEMU TICKET) ---------------- */}
      {activeTab === 'temu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              টেমু টিকিট ক্যাম্পেইন তালিকা ({(settings?.temuCampaigns || []).length})
            </h3>
            <button
              onClick={() => {
                setEditingTemuId(null);
                setTemuTitle('');
                setTemuDesc('');
                setTemuCondition('সবার জন্য উন্মুক্ত');
                setTemuReward(55.68);
                setTemuFormOpen(true);
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> নতুন টেমু টিকিট ক্যাম্পেইন
            </button>
          </div>

          {temuFormOpen && (
            <form onSubmit={handleSaveTemu} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-amber-500" />
                  <span>{editingTemuId ? 'টিকিট সম্পাদনা' : 'নতুন টেমু টিকিট ক্যাম্পেইন'}</span>
                </h4>
                <button type="button" onClick={() => setTemuFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">টিকিটের নাম *</label>
                  <input
                    type="text"
                    required
                    value={temuTitle}
                    onChange={e => setTemuTitle(e.target.value)}
                    placeholder="যেমন: নতুন সদস্যদের জন্য স্বাগত উপহার"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">টিকিট বোনাস টাকা (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={temuReward}
                    onChange={e => setTemuReward(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">শর্তের বিবরণ</label>
                  <input
                    type="text"
                    value={temuCondition}
                    onChange={e => setTemuCondition(e.target.value)}
                    placeholder="যেমন: প্রাথমিক পয়েন্ট দাবি সম্পন্ন"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">স্ট্যাটাস</label>
                  <select
                    value={temuStatus}
                    onChange={e => setTemuStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  >
                    <option value="active">Active (সক্রিয়)</option>
                    <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">বিবরণ</label>
                  <textarea
                    rows={2}
                    value={temuDesc}
                    onChange={e => setTemuDesc(e.target.value)}
                    placeholder="টেমু টিকিটের অতিরিক্ত তথ্য..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setTemuFormOpen(false)} className="px-4 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">
                  বাতিল
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow cursor-pointer">
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(settings?.temuCampaigns || []).length === 0 ? (
              <div className="col-span-2 py-8 text-center text-slate-500 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
                কোনো সক্রিয় টেমু টিকিট ক্যাম্পেইন নেই।
              </div>
            ) : (
              (settings?.temuCampaigns || []).map(t => (
                <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{t.ticketName}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                        ৳{t.rewardAmount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{t.condition}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleEditTemu(t)} className="p-1.5 text-slate-500 hover:text-amber-600 cursor-pointer">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteTemu(t.id)} className="p-1.5 text-rose-400 hover:text-rose-600 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRewardCenterTab;
