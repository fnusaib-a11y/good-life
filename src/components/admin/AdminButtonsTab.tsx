import React, { useState } from 'react';
import { 
  Sliders, 
  ToggleLeft, 
  ToggleRight, 
  Coins, 
  Bell, 
  ShieldAlert, 
  Save, 
  CheckCircle2, 
  Sparkles,
  Smartphone,
  Briefcase,
  PlaySquare,
  HelpCircle,
  Keyboard,
  Share2,
  GraduationCap,
  Store,
  Layers,
  Users,
  Award,
  DollarSign,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminAutoAdsSection } from './AdminAutoAdsSection';

export const AdminButtonsTab: React.FC = () => {
  const { 
    systemSettings, 
    updateSystemSettings, 
    toggleFeature, 
    updateFeatureReward,
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [noticeText, setNoticeText] = useState(systemSettings.noticeText);
  const [minWithdraw, setMinWithdraw] = useState(systemSettings.minWithdrawalAmount);
  const [referralBonus, setReferralBonus] = useState(systemSettings.referralBonus);
  const [signupBonus, setSignupBonus] = useState(systemSettings.signupBonus);
  const [supportPhone, setSupportPhone] = useState(systemSettings.supportPhone);
  const [supportWhatsApp, setSupportWhatsApp] = useState(systemSettings.supportWhatsApp);
  const [supportTelegramBot, setSupportTelegramBot] = useState(systemSettings.supportTelegramBot || 'https://t.me/goodlifeadmin_bot');
  const [officialTelegramChannel, setOfficialTelegramChannel] = useState(systemSettings.officialTelegramChannel || 'https://t.me/goodlifeofficialbd');
  const [adminTelegram, setAdminTelegram] = useState(systemSettings.adminTelegram || 'https://t.me/goodlifeadmin');

  // Rewards
  const [rewards, setRewards] = useState({
    ads_view: systemSettings.featureRewards.ads_view,
    quiz_job: systemSettings.featureRewards.quiz_job,
    typing_job: systemSettings.featureRewards.typing_job,
    ad_marketing: systemSettings.featureRewards.ad_marketing,
    daily_bonus: systemSettings.featureRewards.daily_bonus
  });

  const handleSaveFinancials = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      minWithdrawalAmount: Number(minWithdraw),
      referralBonus: Number(referralBonus),
      signupBonus: Number(signupBonus),
      supportPhone,
      supportWhatsApp,
      supportTelegramBot,
      officialTelegramChannel,
      adminTelegram,
      noticeText,
      featureRewards: rewards
    });
  };

  const buttonOptionsList: {
    key: keyof typeof systemSettings.featureToggles;
    nameBn: string;
    nameEn: string;
    descBn: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      key: 'offer_products',
      nameBn: 'টপ অফার প্রোডাক্টস লাইন (Top Offers Carousel)',
      nameEn: 'Top Offer Products Line',
      descBn: 'হোম পেজের ব্যানারের নিচে বিশেষ অফার প্রোডাক্টের অটো-স্লাইডার সেকশন',
      icon: Flame,
      color: 'text-sky-600 bg-sky-50'
    },
    {
      key: 'ads_view',
      nameBn: 'বিজ্ঞাপন দেখে আয় (Ads View)',
      nameEn: 'Ads View Income',
      descBn: 'হোম পেজের অ্যাড ভিউ বাটন ও রিওয়ার্ড আর্নিং মডিউল',
      icon: PlaySquare,
      color: 'text-sky-600 bg-sky-50'
    },
    {
      key: 'quiz_job',
      nameBn: 'কুইজ খেলে আয় (Quiz Job)',
      nameEn: 'Quiz Job Income',
      descBn: 'সাধারণ জ্ঞান কুইজ খেলে ইনস্ট্যান্ট ক্যাশব্যাক',
      icon: HelpCircle,
      color: 'text-sky-600 bg-sky-50'
    },
    {
      key: 'typing_job',
      nameBn: 'টাইপিং জব (Typing Job)',
      nameEn: 'Typing Job Income',
      descBn: 'ক্যাপচা ও টেক্সট টাইপিং রিওয়ার্ড টাস্ক',
      icon: Keyboard,
      color: 'text-sky-600 bg-sky-50'
    },
    {
      key: 'ad_marketing',
      nameBn: 'বিজ্ঞাপন শেয়ারিং (Ad Marketing)',
      nameEn: 'Ad Marketing Sharing',
      descBn: 'সোশ্যাল মিডিয়ায় অ্যাড শেয়ার করে আর্নিং',
      icon: Share2,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      key: 'micro_job',
      nameBn: 'মাইক্রো জব অপশন (Micro Jobs)',
      nameEn: 'Micro Jobs',
      descBn: 'ফেসবুক/ইউটিউব ইত্যাদি সব ধরনের মাইক্রো জব পোস্ট',
      icon: Briefcase,
      color: 'text-rose-600 bg-rose-50'
    },
    {
      key: 'job_post',
      nameBn: 'ইউজার জব পোস্ট (Post a Job)',
      nameEn: 'User Job Posting',
      descBn: 'সাধারণ ব্যবহারকারীদের কাজ দেওয়ার বোতাম ও ফর্ম',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      key: 'skill_course',
      nameBn: 'স্কিল কোর্স (Skill Courses)',
      nameEn: 'Skill Courses',
      descBn: 'ডিজিটাল মার্কেটিং, ফ্রিল্যান্সিং ইত্যাদি ট্রেনিং কোর্স',
      icon: GraduationCap,
      color: 'text-cyan-600 bg-cyan-50'
    },
    {
      key: 'freelancing',
      nameBn: 'ফ্রিল্যান্সিং সার্ভিস (Freelancing)',
      nameEn: 'Freelancing Services',
      descBn: 'গ্রাফিক্স, ওয়েব ও ভিডিও এডিটিং সার্ভিস মার্কেটপ্লেস',
      icon: Sparkles,
      color: 'text-teal-600 bg-teal-50'
    },
    {
      key: 'special_income',
      nameBn: 'স্পেশাল ইনকাম সেকশন',
      nameEn: 'Special Income Section',
      descBn: 'হোম পেজের মাইক্রো জব, বিজ্ঞাপন ও কোর্স ব্যানার',
      icon: Coins,
      color: 'text-sky-600 bg-sky-50'
    },
    {
      key: 'recharge',
      nameBn: 'মোবাইল রিচার্জ ও ড্রাইভ',
      nameEn: 'Mobile Recharge & Drive',
      descBn: 'রিচার্জ ও ড্রাইভ প্যাক ডিসকাউন্ট সেকশন',
      icon: Smartphone,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      key: 'reselling',
      nameBn: 'প্রোডাক্ট রিসেলিং শপ',
      nameEn: 'Product Reselling Shop',
      descBn: 'হোলসেল প্রাইসে শপিং ও রিসেলিং ব্যবসা অপশন',
      icon: Store,
      color: 'text-sky-600 bg-sky-50'
    },
    {
      key: 'target_bonus',
      nameBn: 'টার্গেট বোনাস সেকশন',
      nameEn: 'Target Bonus Section',
      descBn: 'ডেইলি কাজের টার্গেট পূরণ বোনাস আনলকার',
      icon: Award,
      color: 'text-sky-600 bg-sky-50'
    },
    {
      key: 'community_groups',
      nameBn: 'অফিশিয়াল কমিউনিটি গ্রুপস',
      nameEn: 'Official Community Groups',
      descBn: 'টেলিগ্রাম, ফেসবুক ও হোয়াটসঅ্যাপ সাপোর্ট গ্রুপ সেকশন',
      icon: Users,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      key: 'kyc_required',
      nameBn: 'প্রোফাইল ভেরিফিকেশন ব্যানার',
      nameEn: 'KYC Verification Banner',
      descBn: 'হোম পেজের এনআইডি ভেরিফিকেশন অ্যালার্ট ব্যানার',
      icon: ShieldAlert,
      color: 'text-red-600 bg-red-50'
    },
    {
      key: 'reels',
      nameBn: 'ভিডিও পোস্ট ও রিলস ট্যাব',
      nameEn: 'Video Reels Tab',
      descBn: 'শর্ট ভিডিও আর্নিং ও বিনোদন ফিড',
      icon: PlaySquare,
      color: 'text-pink-600 bg-pink-50'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner Notice Control */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                {isBn ? 'স্ক্রলিং নোটিশ বার কন্ট্রোল' : 'Live Scrolling Notice Bar'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                {isBn ? 'হোম পেজের উপরের এলার্ট টেক্সট ও চালু/বন্ধ' : 'Headline banner shown on top of home'}
              </p>
            </div>
          </div>

          <button
            onClick={() => updateSystemSettings({ isNoticeActive: !systemSettings.isNoticeActive })}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              systemSettings.isNoticeActive 
                ? 'bg-sky-100 text-sky-800' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {systemSettings.isNoticeActive ? <ToggleRight className="w-4 h-4 text-sky-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
            <span>{systemSettings.isNoticeActive ? 'সক্রিয় আছে' : 'বন্ধ আছে'}</span>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
            placeholder="নোটিশ বার্তা লিখুন..."
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-400"
          />
          <button
            onClick={() => updateSystemSettings({ noticeText })}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>সংরক্ষণ</span>
          </button>
        </div>
      </div>

      {/* Button & Feature Toggles Matrix */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                {isBn ? 'সকল বাটন ও অপশন অন/অফ সুইচবোর্ড' : 'Master Buttons & Features Switchboard'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                {isBn ? 'এডমিন যে অপশন বন্ধ করবেন, ইউজাররা তা দেখতে পাবেন না' : 'Toggle visibility of any button or module'}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-bold">
            {buttonOptionsList.filter(b => systemSettings.featureToggles[b.key]).length} / {buttonOptionsList.length} সক্রিয়
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {buttonOptionsList.map((item) => {
            const Icon = item.icon;
            const isEnabled = systemSettings.featureToggles[item.key];

            return (
              <div 
                key={item.key}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isEnabled 
                    ? 'bg-white border-gray-200 shadow-2xs' 
                    : 'bg-gray-50/80 border-dashed border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-gray-900 truncate">
                      {isBn ? item.nameBn : item.nameEn}
                    </h4>
                    <p className="text-[10px] text-gray-500 truncate">
                      {item.descBn}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFeature(item.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                    isEnabled 
                      ? 'bg-sky-500 text-white shadow-xs' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dedicated Master Auto Ads (Ads View) Control */}
      <AdminAutoAdsSection />

      {/* Dynamic Task Rewards Setter */}
      <form onSubmit={handleSaveFinancials} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">
              {isBn ? 'ইনকাম কাজের রিওয়ার্ড রেট (৳)' : 'Dynamic Task Reward Rates'}
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              {isBn ? 'প্রতিটি ক্লিকে/কাজে ইউজার কত টাকা পাবে তা নির্ধারণ করুন' : 'Set custom reward amounts for tasks'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <label className="font-bold text-gray-700 block mb-1">বিজ্ঞাপন ভিউ রিওয়ার্ড (৳)</label>
            <input
              type="number"
              step="0.05"
              value={rewards.ads_view}
              onChange={(e) => setRewards({ ...rewards, ads_view: Number(e.target.value) })}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg font-black text-sky-600"
            />
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <label className="font-bold text-gray-700 block mb-1">কুইজ সমাধান রিওয়ার্ড (৳)</label>
            <input
              type="number"
              step="0.10"
              value={rewards.quiz_job}
              onChange={(e) => setRewards({ ...rewards, quiz_job: Number(e.target.value) })}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg font-black text-blue-600"
            />
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <label className="font-bold text-gray-700 block mb-1">টাইপিং জব রিওয়ার্ড (৳)</label>
            <input
              type="number"
              step="0.10"
              value={rewards.typing_job}
              onChange={(e) => setRewards({ ...rewards, typing_job: Number(e.target.value) })}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg font-black text-sky-600"
            />
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <label className="font-bold text-gray-700 block mb-1">অ্যাড শেয়ারিং রিওয়ার্ড (৳)</label>
            <input
              type="number"
              step="0.10"
              value={rewards.ad_marketing}
              onChange={(e) => setRewards({ ...rewards, ad_marketing: Number(e.target.value) })}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg font-black text-purple-600"
            />
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <label className="font-bold text-gray-700 block mb-1">সাইনআপ বোনাস (৳)</label>
            <input
              type="number"
              step="1"
              value={signupBonus}
              onChange={(e) => setSignupBonus(Number(e.target.value))}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg font-black text-indigo-600"
            />
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <label className="font-bold text-gray-700 block mb-1">রেফারেল বোনাস (৳)</label>
            <input
              type="number"
              step="1"
              value={referralBonus}
              onChange={(e) => setReferralBonus(Number(e.target.value))}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg font-black text-teal-600"
            />
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
            <label className="font-bold text-gray-700 block mb-1">সর্বনিম্ন উত্তোলন (৳)</label>
            <input
              type="number"
              step="5"
              value={minWithdraw}
              onChange={(e) => setMinWithdraw(Number(e.target.value))}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg font-black text-rose-600"
            />
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 col-span-2">
            <label className="font-bold text-gray-700 block mb-1">সাপোর্ট হোয়াটসঅ্যাপ ও ফোন নম্বর</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={supportWhatsApp}
                onChange={(e) => setSupportWhatsApp(e.target.value)}
                placeholder="WhatsApp নম্বর"
                className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
              />
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="ফোন নম্বর"
                className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="bg-sky-50/70 p-2.5 rounded-xl border border-sky-100 col-span-2 space-y-2">
            <label className="font-bold text-sky-950 block text-xs">অফিসিয়াল টেলিগ্রাম ও সাপোর্ট লিংকস</label>
            <div className="space-y-1.5">
              <div>
                <span className="text-[10px] text-gray-500 font-bold block mb-0.5">১. ২৪/৭ সাপোর্ট লিংক</span>
                <input
                  type="text"
                  value={supportTelegramBot}
                  onChange={(e) => setSupportTelegramBot(e.target.value)}
                  placeholder="যেমন: https://t.me/goodlifeadmin_bot"
                  className="w-full p-2 bg-white border border-sky-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block mb-0.5">২. অফিসিয়াল টেলিগ্রাম চ্যানেল লিংক</span>
                <input
                  type="text"
                  value={officialTelegramChannel}
                  onChange={(e) => setOfficialTelegramChannel(e.target.value)}
                  placeholder="যেমন: https://t.me/goodlifeofficialbd"
                  className="w-full p-2 bg-white border border-sky-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block mb-0.5">৩. অ্যাডমিন টেলিগ্রাম আইডি লিংক</span>
                <input
                  type="text"
                  value={adminTelegram}
                  onChange={(e) => setAdminTelegram(e.target.value)}
                  placeholder="যেমন: https://t.me/goodlifeadmin"
                  className="w-full p-2 bg-white border border-sky-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>সকল আর্থিক নিয়ম ও রিওয়ার্ড আপডেট করুন</span>
        </button>
      </form>
    </div>
  );
};
