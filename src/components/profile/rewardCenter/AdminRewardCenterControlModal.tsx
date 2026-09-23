import React, { useState, useEffect } from 'react';
import { 
  RewardCenterSystemSettings, 
  ClaimRewardItem, 
  PromoCodeItem, 
  RescueFundCampaign,
  DailySignInDayConfig,
  RewardBadgeColor 
} from '../../../types/rewardCenter';
import { 
  getRewardCenterSettings, 
  saveRewardCenterSettings, 
  DEFAULT_REWARD_CENTER_SETTINGS 
} from '../../../services/rewardCenterService';
import { useApp } from '../../../context/AppContext';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Gift, 
  Calendar, 
  Coins, 
  Users, 
  Ticket, 
  ShieldCheck, 
  Check, 
  Power 
} from 'lucide-react';

interface AdminRewardCenterControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminRewardSubTab = 'toggles' | 'claims' | 'signin' | 'rescue' | 'promo';

export const AdminRewardCenterControlModal: React.FC<AdminRewardCenterControlModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useApp();
  const [settings, setSettings] = useState<RewardCenterSystemSettings>(DEFAULT_REWARD_CENTER_SETTINGS);
  const [activeTab, setActiveTab] = useState<AdminRewardSubTab>('toggles');
  const [isSaving, setIsSaving] = useState(false);

  // New claim modal / state
  const [newClaim, setNewClaim] = useState<Partial<ClaimRewardItem>>({
    title: '',
    code: '',
    amount: 10,
    description: '',
    couponBadgeType: 'blue',
    couponBadgeTitle: 'বোনাস',
    couponBadgeSubtitle: '2026.12.31',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31 23:59:59',
    requiredCondition: 'সক্রিয় অ্যাকাউন্ট',
    conditionType: 'free',
    status: 'active'
  });
  const [isAddingClaim, setIsAddingClaim] = useState(false);

  // New promo code state
  const [newPromo, setNewPromo] = useState<Partial<PromoCodeItem>>({
    code: '',
    title: '',
    description: '',
    rewardAmount: 20,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '2026-12-31',
    totalUsageLimit: 100,
    usedCount: 0,
    perUserLimit: 1,
    status: 'active'
  });
  const [isAddingPromo, setIsAddingPromo] = useState(false);

  // New rescue campaign state
  const [newRescue, setNewRescue] = useState<Partial<RescueFundCampaign>>({
    name: '',
    description: '',
    targetAmount: 50000,
    distributedAmount: 0,
    rewardAmount: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    requiredCondition: 'ভেরিফাইড মেম্বারশিপ',
    conditionType: 'all_members',
    status: 'active'
  });
  const [isAddingRescue, setIsAddingRescue] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getRewardCenterSettings().then(setSettings);
    }
  }, [isOpen]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await saveRewardCenterSettings(settings);
      showToast('পুরস্কার সেন্টারের সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (err) {
      showToast('সংরক্ষণে সমস্যা হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFeature = (key: keyof RewardCenterSystemSettings['featureToggles']) => {
    setSettings(prev => ({
      ...prev,
      featureToggles: {
        ...prev.featureToggles,
        [key]: !prev.featureToggles[key]
      }
    }));
  };

  // Claim Rewards handlers
  const handleAddClaimReward = () => {
    if (!newClaim.title || !newClaim.code || !newClaim.amount) {
      showToast('অনুগ্রহ করে শিরোনাম, কোড এবং পরিমাণ পূরণ করুন।');
      return;
    }
    const item: ClaimRewardItem = {
      id: `claim_${Date.now()}`,
      title: newClaim.title,
      code: newClaim.code.toUpperCase(),
      amount: Number(newClaim.amount),
      description: newClaim.description || '',
      couponBadgeType: (newClaim.couponBadgeType as RewardBadgeColor) || 'blue',
      couponBadgeTitle: newClaim.couponBadgeTitle || 'বোনাস',
      couponBadgeSubtitle: newClaim.couponBadgeSubtitle || '',
      startDate: newClaim.startDate || new Date().toISOString().split('T')[0],
      endDate: newClaim.endDate || '2026-12-31 23:59:59',
      requiredCondition: newClaim.requiredCondition || '',
      conditionType: newClaim.conditionType || 'free',
      minDepositAmount: Number(newClaim.minDepositAmount) || 0,
      status: 'active'
    };
    setSettings(prev => ({
      ...prev,
      claimRewards: [item, ...prev.claimRewards]
    }));
    setIsAddingClaim(false);
    setNewClaim({
      title: '',
      code: '',
      amount: 10,
      description: '',
      couponBadgeType: 'blue',
      couponBadgeTitle: 'বোনাস'
    });
    showToast('নতুন উপহার কার্ড যুক্ত করা হয়েছে!');
  };

  const handleDeleteClaim = (id: string) => {
    setSettings(prev => ({
      ...prev,
      claimRewards: prev.claimRewards.filter(c => c.id !== id)
    }));
    showToast('উপহার কার্ড মুছে ফেলা হয়েছে।');
  };

  // Promo Code handlers
  const handleAddPromoCode = () => {
    if (!newPromo.code || !newPromo.rewardAmount) {
      showToast('কোড এবং রিওয়ার্ড পরিমাণ পূরণ করুন।');
      return;
    }
    const item: PromoCodeItem = {
      id: `promo_${Date.now()}`,
      code: newPromo.code.toUpperCase(),
      title: newPromo.title || newPromo.code.toUpperCase(),
      description: newPromo.description || '',
      rewardAmount: Number(newPromo.rewardAmount),
      startDate: newPromo.startDate || new Date().toISOString().split('T')[0],
      expiryDate: newPromo.expiryDate || '2026-12-31',
      totalUsageLimit: Number(newPromo.totalUsageLimit) || 500,
      usedCount: 0,
      perUserLimit: 1,
      status: 'active'
    };
    setSettings(prev => ({
      ...prev,
      promoCodes: [item, ...prev.promoCodes]
    }));
    setIsAddingPromo(false);
    setNewPromo({ code: '', title: '', rewardAmount: 20 });
    showToast('নতুন প্রচার কোড যুক্ত করা হয়েছে!');
  };

  const handleDeletePromo = (id: string) => {
    setSettings(prev => ({
      ...prev,
      promoCodes: prev.promoCodes.filter(p => p.id !== id)
    }));
    showToast('প্রচার কোড ডিলিট হয়েছে।');
  };

  // Daily Sign-In day update
  const handleUpdateSignInDay = (day: number, amount: number) => {
    setSettings(prev => ({
      ...prev,
      dailySignInConfig: {
        ...prev.dailySignInConfig,
        days: prev.dailySignInConfig.days.map(d => d.day === day ? { ...d, rewardAmount: amount } : d)
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-100">
        {/* Top Header */}
        <div className="bg-white text-slate-900 border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">পুরস্কার সেন্টার এডমিন কন্ট্রোল</h2>
              <p className="text-[11px] text-slate-500">৬টি ফিচার, রিওয়ার্ড এমাউন্ট ও নিয়মাবলী পরিচালনা</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('toggles')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'toggles' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ফিচার সুইচ (ON/OFF)
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'claims' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🎁 দাবি করা উপহার
          </button>
          <button
            onClick={() => setActiveTab('signin')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'signin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📅 সাইন ইন রিওয়ার্ড
          </button>
          <button
            onClick={() => setActiveTab('promo')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'promo' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🎟️ প্রচার কোড
          </button>
          <button
            onClick={() => setActiveTab('rescue')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'rescue' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🪙 উদ্ধার তহবিল
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: Feature Toggles */}
          {activeTab === 'toggles' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-semibold">
                পুরস্কার সেন্টারের ভিতরের যে কোনো ফিচার চালু বা বন্ধ করুন:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'claim', label: '🎁 দাবি করা (Claim Rewards)', desc: 'কুপন ও উপহার দাবি করার ব্যবস্থা' },
                  { key: 'signin', label: '📅 সাইন ইন (Daily Sign-In)', desc: 'দৈনিক চেক-ইন ও স্ট্রিক বোনাস' },
                  { key: 'rescue_fund', label: '🪙 উদ্ধার তহবিল (Rescue Fund)', desc: 'মেম্বারদের জরুরি আর্থিক সুরক্ষা ফান্ড' },
                  { key: 'invite', label: '👥 বন্ধুদের আমন্ত্রণ (Invite Friends)', desc: 'রেফারেল ও ইনভাইটেশন হাব' },
                  { key: 'promo_code', label: '🎟️ প্রচার কোড (Promo Code)', desc: 'ভাউচার ও প্রমো কোড রিডিম' },
                  { key: 'temu_ticket', label: '🎫 টেমু টিকিট (Temu Ticket)', desc: 'টিম ও লাকি ড্র টিকিট ইতিহাস' }
                ].map((item) => {
                  const isEnabled = settings.featureToggles[item.key as keyof typeof settings.featureToggles];
                  return (
                    <div
                      key={item.key}
                      className="p-3 rounded-2xl border border-gray-200 bg-white flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-gray-900">{item.label}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                      </div>

                      <button
                        onClick={() => toggleFeature(item.key as any)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                          isEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Claim Rewards */}
          {activeTab === 'claims' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-800">
                  সক্রিয় দাবি উপহার তালিকা ({settings.claimRewards.length})
                </h3>
                <button
                  onClick={() => setIsAddingClaim(!isAddingClaim)}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন যোগ করুন</span>
                </button>
              </div>

              {isAddingClaim && (
                <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100 space-y-2.5 text-xs">
                  <h4 className="font-bold text-sky-900">নতুন উপহার তৈরি করুন:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="উপহারের শিরোনাম (যেমন: সদস্য দিবস বোনাস)"
                      value={newClaim.title}
                      onChange={e => setNewClaim({ ...newClaim, title: e.target.value })}
                      className="bg-white rounded-lg p-2 border border-gray-200"
                    />
                    <input
                      type="text"
                      placeholder="কোড (যেমন: K008, EGG500)"
                      value={newClaim.code}
                      onChange={e => setNewClaim({ ...newClaim, code: e.target.value })}
                      className="bg-white rounded-lg p-2 border border-gray-200"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="পরিমাণ (৳)"
                      value={newClaim.amount}
                      onChange={e => setNewClaim({ ...newClaim, amount: Number(e.target.value) })}
                      className="bg-white rounded-lg p-2 border border-gray-200"
                    />
                    <select
                      value={newClaim.couponBadgeType}
                      onChange={e => setNewClaim({ ...newClaim, couponBadgeType: e.target.value as any })}
                      className="bg-white rounded-lg p-2 border border-gray-200"
                    >
                      <option value="blue">নীল (Blue)</option>
                      <option value="red">লাল (Red)</option>
                      <option value="magenta">ম্যাজেন্টা (Magenta)</option>
                      <option value="green">সবুজ (Green)</option>
                      <option value="orange">কমলা (Orange)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="ব্যাজ টেক্সট (যেমন: বোনাস)"
                      value={newClaim.couponBadgeTitle}
                      onChange={e => setNewClaim({ ...newClaim, couponBadgeTitle: e.target.value })}
                      className="bg-white rounded-lg p-2 border border-gray-200"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="শর্ত (যেমন: ডিপোজিট ৳৫০০ বা সক্রিয় অ্যাকাউন্ট)"
                    value={newClaim.requiredCondition}
                    onChange={e => setNewClaim({ ...newClaim, requiredCondition: e.target.value })}
                    className="w-full bg-white rounded-lg p-2 border border-gray-200"
                  />
                  <textarea
                    placeholder="বিস্তারিত বিবরণ..."
                    value={newClaim.description}
                    onChange={e => setNewClaim({ ...newClaim, description: e.target.value })}
                    className="w-full bg-white rounded-lg p-2 border border-gray-200 h-16"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsAddingClaim(false)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={handleAddClaimReward}
                      className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-bold"
                    >
                      যোগ করুন
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {settings.claimRewards.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-2xl border border-gray-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{item.title}</span>
                        <span className="text-[10px] font-black bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                          {item.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        পুরস্কার: <strong>৳{item.amount.toFixed(2)}</strong> | শর্ত: {item.requiredCondition}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteClaim(item.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Daily Sign-in */}
          {activeTab === 'signin' && (
            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-bold text-gray-900">সাইন-ইন প্ল্যান কনফিগারেশন:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500">প্ল্যান শিরোনাম</label>
                    <input
                      type="text"
                      value={settings.dailySignInConfig.planTitle}
                      onChange={e => setSettings({
                        ...settings,
                        dailySignInConfig: { ...settings.dailySignInConfig, planTitle: e.target.value }
                      })}
                      className="w-full bg-white rounded-lg p-2 border border-gray-200 mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500">শর্ত বিবরণ</label>
                    <input
                      type="text"
                      value={settings.dailySignInConfig.requiredCondition}
                      onChange={e => setSettings({
                        ...settings,
                        dailySignInConfig: { ...settings.dailySignInConfig, requiredCondition: e.target.value }
                      })}
                      className="w-full bg-white rounded-lg p-2 border border-gray-200 mt-0.5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">প্রতিদিনের সাইন-ইন রিওয়ার্ড এমাউন্ট:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {settings.dailySignInConfig.days.map(d => (
                    <div key={d.day} className="bg-white rounded-xl p-2.5 border border-gray-200 text-center">
                      <span className="font-bold text-gray-800 block">দিন {d.day}</span>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="font-semibold text-gray-400">৳</span>
                        <input
                          type="number"
                          step="0.5"
                          value={d.rewardAmount}
                          onChange={e => handleUpdateSignInDay(d.day, Number(e.target.value))}
                          className="w-16 bg-gray-50 rounded p-1 text-center font-bold text-sm text-gray-900 border border-gray-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Promo Codes */}
          {activeTab === 'promo' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-800">
                  প্রমো ভাউচার কোড ({settings.promoCodes.length})
                </h3>
                <button
                  onClick={() => setIsAddingPromo(!isAddingPromo)}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন প্রমো কোড</span>
                </button>
              </div>

              {isAddingPromo && (
                <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100 space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="কোড (যেমন: PROMO50)"
                      value={newPromo.code}
                      onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                      className="bg-white rounded-lg p-2 border border-gray-200 uppercase font-mono"
                    />
                    <input
                      type="number"
                      placeholder="রিওয়ার্ড পরিমাণ (৳)"
                      value={newPromo.rewardAmount}
                      onChange={e => setNewPromo({ ...newPromo, rewardAmount: Number(e.target.value) })}
                      className="bg-white rounded-lg p-2 border border-gray-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="শিরোনাম"
                      value={newPromo.title}
                      onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                      className="bg-white rounded-lg p-2 border border-gray-200"
                    />
                    <input
                      type="number"
                      placeholder="সর্বোচ্চ ব্যবহার সীমা (যেমন: ৫০০)"
                      value={newPromo.totalUsageLimit}
                      onChange={e => setNewPromo({ ...newPromo, totalUsageLimit: Number(e.target.value) })}
                      className="bg-white rounded-lg p-2 border border-gray-200"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsAddingPromo(false)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={handleAddPromoCode}
                      className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-bold"
                    >
                      তৈরি করুন
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {settings.promoCodes.map(p => (
                  <div
                    key={p.id}
                    className="p-3 bg-white rounded-2xl border border-gray-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-gray-900 tracking-wider">{p.code}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          ৳{p.rewardAmount}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        ব্যবহার: {p.usedCount} / {p.totalUsageLimit} | মেয়াদ: {p.expiryDate}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeletePromo(p.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Rescue Fund */}
          {activeTab === 'rescue' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-800">উদ্ধার তহবিল ক্যাম্পেইন পরিচালনা:</h4>
                {settings.rescueFundCampaigns.map(camp => (
                  <div
                    key={camp.id}
                    className="p-3 bg-white rounded-2xl border border-gray-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{camp.name}</span>
                      <span className="text-emerald-600 font-bold">৳{camp.rewardAmount} প্রতি মেম্বার</span>
                    </div>
                    <p className="text-gray-500 text-[11px]">{camp.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-1.5">
                      <span>টার্গেট ফান্ড: ৳{camp.targetAmount?.toLocaleString()}</span>
                      <span>মেয়াদ: {camp.startDate} হতে {camp.endDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Save Button */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold"
          >
            বন্ধ করুন
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
