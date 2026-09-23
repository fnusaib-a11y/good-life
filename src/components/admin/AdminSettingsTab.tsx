import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Sliders, 
  Share2, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Check,
  CreditCard,
  FileText,
  PhoneCall,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Percent,
  Wallet,
  Coins,
  Eye,
  Info,
  CheckCircle2,
  RefreshCw,
  Tag,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  getSystemVouchers, 
  addSystemVoucher, 
  deleteSystemVoucher, 
  toggleSystemVoucher 
} from '../../lib/voucherUtils';
import { VoucherCode } from '../../types';

export const AdminSettingsTab: React.FC = () => {
  const { 
    groupLinks, 
    updateGroupLink, 
    systemSettings,
    updateSystemSettings,
    showToast,
    language,
    setIsVerificationModalOpen,
    setIsWalletOpen,
    setWalletActiveTab,
    syncReferralEarnings,
    registeredUsers
  } = useApp();

  const isBn = language === 'bn';
  const [isAuditingReferrals, setIsAuditingReferrals] = useState(false);

  const handleAuditAndFixReferrals = () => {
    setIsAuditingReferrals(true);
    const res = syncReferralEarnings ? syncReferralEarnings() : { credited: 0, totalReferrals: 0 };
    setTimeout(() => {
      setIsAuditingReferrals(false);
      if (res.credited > 0) {
        showToast(isBn ? `রেফারেল অডিট সম্পন্ন! ৳${res.credited} মিসিং বোনাস সফলভাবে ওয়ালেটে যোগ হয়েছে!` : `Audit complete! ৳${res.credited} missing bonus credited!`);
      } else {
        showToast(isBn ? `রেফারেল সিস্টেম নিখুঁত! মোট ${registeredUsers.length} জন ইউজারের মধ্যে কোনো মিসিং বোনাস নেই।` : `Referral audit complete. All bonuses are up-to-date.`);
      }
    }, 500);
  };

  // Verification Settings State
  const [verificationFee, setVerificationFee] = useState(systemSettings.verificationFee?.toString() || '100');
  const [bkashNumber, setBkashNumber] = useState(systemSettings.verificationPaymentNumbers?.bkash || '01877722819');
  const [nagadNumber, setNagadNumber] = useState(systemSettings.verificationPaymentNumbers?.nagad || '01877722819');
  const [upayNumber, setUpayNumber] = useState(systemSettings.verificationPaymentNumbers?.upay || '01877722819');
  const [verificationInstructions, setVerificationInstructions] = useState(
    systemSettings.verificationInstructions || 
    '১. উপরে প্রদত্ত বিকাশ অথবা নগদ পার্সোনাল নম্বরে ভেরিফিকেশন ফি (Send Money) করুন।\n২. টাকা পাঠানোর পর আপনি যে নম্বর থেকে টাকা পাঠিয়েছেন সেই নম্বর এবং ট্রানজেকশন আইডি (TrxID) নিচে প্রদান করুন।\n৩. তথ্য সাবমিট করার পর এডমিন টিম যাচাই করে আপনার একাউন্ট ১-৩ ঘণ্টার মধ্যে ১০০% ভেরিফাইড করে দেবে।'
  );

  // Deposit Settings State
  const [depBkash, setDepBkash] = useState(systemSettings.depositPaymentNumbers?.bkash || '01877722819');
  const [depNagad, setDepNagad] = useState(systemSettings.depositPaymentNumbers?.nagad || '01877722819');
  const [depRocket, setDepRocket] = useState(systemSettings.depositPaymentNumbers?.rocket || '01877722819');
  const [depUpay, setDepUpay] = useState(systemSettings.depositPaymentNumbers?.upay || '01877722819');
  const [minDeposit, setMinDeposit] = useState(systemSettings.minDepositAmount?.toString() || '10');
  const [maxDeposit, setMaxDeposit] = useState(systemSettings.maxDepositAmount?.toString() || '25000');
  const [depInstructions, setDepInstructions] = useState(
    systemSettings.depositInstructions || 
    '১. অফিশিয়াল বিকাশ/নগদ/রকেট পার্সোনাল নম্বরে Send Money করুন।\n২. আপনি যে নম্বর থেকে টাকা পাঠিয়েছেন সেই নম্বর এবং ট্রানজেকশন আইডি (TrxID) সঠিক ঘরে লিখে সাবমিট করুন।\n৩. এডমিন কর্তৃক TrxID যাচাইয়ের পর ব্যালেন্স ৫-১৫ মিনিটে অটোমেটিক যুক্ত হবে।'
  );
  const [depPolicy, setDepPolicy] = useState(
    systemSettings.depositPolicyRules || 
    '• সর্বনিম্ন ডিপোজিট ৳১০ এবং সর্বোচ্চ এককালীন ৳২৫,০০০।\n• ভুল TrxID বা ফেক তথ্য দিলে একাউন্ট সাময়িকভাবে স্থগিত হতে পারে।\n• কোনো সমস্যায় হেল্পলাইন অথবা এডমিন হোয়াটসঅ্যাপে সরাসরি যোগাযোগ করুন।'
  );

  // Withdrawal Settings State
  const [minWithdraw, setMinWithdraw] = useState(systemSettings.minWithdrawalAmount?.toString() || '50');
  const [maxDailyWithdraw, setMaxDailyWithdraw] = useState(systemSettings.maxDailyWithdrawalAmount?.toString() || '10000');
  const [withdrawFee, setWithdrawFee] = useState(systemSettings.withdrawalFeePercent?.toString() || '0');
  const [withdrawTime, setWithdrawTime] = useState(systemSettings.withdrawalProcessingTime || '৩০ মিনিট থেকে ২ ঘণ্টা');
  const [withdrawInstructions, setWithdrawInstructions] = useState(
    systemSettings.withdrawalInstructions || 
    '১. আপনার সঠিক ও সচল বিকাশ অথবা নগদ পার্সোনাল নম্বর দিন।\n২. সর্বনিম্ন উত্তোলন ৫০ টাকা। পর্যাপ্ত ব্যালেন্স থাকতে হবে।\n৩. উইথড্র রিকোয়েস্ট সফলভাবে জমা হওয়ার পর এডমিন টিম যাচাই করে পেমেন্ট পাঠিয়ে দেবে।'
  );
  const [withdrawPolicy, setWithdrawPolicy] = useState(
    systemSettings.withdrawalPolicyRules || 
    '• প্রতিদিন সর্বোচ্চ ১০,০০০ টাকা উত্তোলন করা যাবে।\n• পেমেন্ট সাধারণত ৩০ মিনিট থেকে ২ ঘণ্টার মধ্যে সম্পূর্ণ হয় (সর্বোচ্চ ২৪ ঘণ্টা)।\n• এজেন্ট নম্বর বা ভুল নম্বরে পেমেন্ট ফেল হলে কোম্পানি দায়ী থাকবে না।'
  );

  // Rewards & Notice States
  const [referralReward, setReferralReward] = useState(systemSettings.referralBonus?.toString() || '25');
  const [signupBonus, setSignupBonus] = useState(systemSettings.signupBonus?.toString() || '10');
  const [dailyTaskTarget, setDailyTaskTarget] = useState(systemSettings.dailyTaskTarget?.toString() || '10');
  const [noticeText, setNoticeText] = useState(systemSettings.noticeText || 'স্বাগতম! প্রতিদিনের টাস্ক শেষ করে বোনাস ক্লেইম করুন।');
  const [supportPhone, setSupportPhone] = useState(systemSettings.supportPhone || '+8801877722819');
  const [supportWhatsApp, setSupportWhatsApp] = useState(systemSettings.supportWhatsApp || '+8801877722819');
  const [supportTelegramBot, setSupportTelegramBot] = useState(systemSettings.supportTelegramBot || 'https://t.me/goodlifeadmin_bot');
  const [officialTelegramChannel, setOfficialTelegramChannel] = useState(systemSettings.officialTelegramChannel || 'https://t.me/goodlifeofficialbd');
  const [adminTelegram, setAdminTelegram] = useState(systemSettings.adminTelegram || 'https://t.me/goodlifeadmin');

  // Keep state synced with systemSettings if external updates happen
  useEffect(() => {
    if (systemSettings.verificationFee !== undefined) {
      setVerificationFee(systemSettings.verificationFee.toString());
    }
    if (systemSettings.minDepositAmount !== undefined) {
      setMinDeposit(systemSettings.minDepositAmount.toString());
    }
  }, [systemSettings.verificationFee, systemSettings.minDepositAmount]);

  // Group link URLs
  const [links, setLinks] = useState(() => {
    const map: { [id: string]: string } = {};
    groupLinks.forEach(g => {
      map[g.id] = g.url;
    });
    return map;
  });

  // Voucher Codes Management State
  const [vouchers, setVouchers] = useState<VoucherCode[]>(() => getSystemVouchers());
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherAmount, setNewVoucherAmount] = useState('');
  const [newVoucherMaxUses, setNewVoucherMaxUses] = useState('');

  const handleAddVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherCode.trim()) {
      showToast('ভাউচার কোড লিখুন!');
      return;
    }
    const amt = Number(newVoucherAmount);
    if (!amt || amt <= 0) {
      showToast('সঠিক টাকার অংক লিখুন!');
      return;
    }
    addSystemVoucher({
      code: newVoucherCode.trim().toUpperCase(),
      amount: amt,
      maxUses: newVoucherMaxUses ? Number(newVoucherMaxUses) : undefined,
      isActive: true
    });
    setVouchers(getSystemVouchers());
    setNewVoucherCode('');
    setNewVoucherAmount('');
    setNewVoucherMaxUses('');
    showToast(isBn ? 'নতুন ভাউচার কোড সফলভাবে যুক্ত হয়েছে!' : 'New voucher code added successfully!');
  };

  const handleDeleteVoucher = (id: string) => {
    deleteSystemVoucher(id);
    setVouchers(getSystemVouchers());
    showToast(isBn ? 'ভাউচার কোড মুছে ফেলা হয়েছে!' : 'Voucher deleted!');
  };

  const handleToggleVoucher = (id: string) => {
    toggleSystemVoucher(id);
    setVouchers(getSystemVouchers());
    showToast(isBn ? 'ভাউচার স্ট্যাটাস আপডেট হয়েছে!' : 'Voucher status updated!');
  };

  // Dedicated Save Handlers with instant persistence & clear feedback
  const handleSaveDepositSettings = () => {
    const minVal = Number(minDeposit) || 10;
    const maxVal = Number(maxDeposit) || 25000;
    updateSystemSettings({
      minDepositAmount: minVal,
      maxDepositAmount: maxVal,
      depositPaymentNumbers: {
        bkash: depBkash.trim(),
        nagad: depNagad.trim(),
        rocket: depRocket.trim(),
        upay: depUpay.trim()
      },
      depositInstructions: depInstructions.trim(),
      depositPolicyRules: depPolicy.trim()
    });
    showToast(isBn ? `ডিপোজিট সেটিংস সফলভাবে সেভ হয়েছে! (সর্বনিম্ন: ৳${minVal})` : `Deposit settings saved! (Min: ৳${minVal})`);
  };

  const handleSaveVerificationSettings = () => {
    const feeVal = Number(verificationFee) || 100;
    updateSystemSettings({
      verificationFee: feeVal,
      verificationPaymentNumbers: {
        bkash: bkashNumber.trim(),
        nagad: nagadNumber.trim(),
        upay: upayNumber.trim()
      },
      verificationInstructions: verificationInstructions.trim()
    });
    showToast(isBn ? `প্রোফাইল ভেরিফিকেশন ফি সফলভাবে ৳${feeVal} সেভ হয়েছে!` : `Verification fee saved as ৳${feeVal}!`);
  };

  const handleSaveWithdrawalSettings = () => {
    const minW = Number(minWithdraw) || 50;
    updateSystemSettings({
      minWithdrawalAmount: minW,
      maxDailyWithdrawalAmount: Number(maxDailyWithdraw) || 10000,
      withdrawalFeePercent: Number(withdrawFee) || 0,
      withdrawalProcessingTime: withdrawTime.trim(),
      withdrawalInstructions: withdrawInstructions.trim(),
      withdrawalPolicyRules: withdrawPolicy.trim()
    });
    showToast(isBn ? `উইথড্র সেটিংস সফলভাবে সেভ হয়েছে! (সর্বনিম্ন: ৳${minW})` : `Withdrawal settings saved! (Min: ৳${minW})`);
  };

  const handleSaveBonusNoticeSettings = () => {
    updateSystemSettings({
      referralBonus: Number(referralReward) || 25,
      signupBonus: Number(signupBonus) || 10,
      dailyTaskTarget: Number(dailyTaskTarget) || 10,
      noticeText: noticeText.trim(),
      supportPhone: supportPhone.trim(),
      supportWhatsApp: supportWhatsApp.trim()
    });
    showToast(isBn ? 'বোনাস ও প্ল্যাটফর্ম নোটিশ সফলভাবে সেভ হয়েছে!' : 'Platform rewards and notice saved!');
  };

  const handleSavePlatformConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      minWithdrawalAmount: Number(minWithdraw) || 50,
      maxDailyWithdrawalAmount: Number(maxDailyWithdraw) || 10000,
      withdrawalFeePercent: Number(withdrawFee) || 0,
      withdrawalProcessingTime: withdrawTime.trim(),
      withdrawalInstructions: withdrawInstructions.trim(),
      withdrawalPolicyRules: withdrawPolicy.trim(),

      minDepositAmount: Number(minDeposit) || 10,
      maxDepositAmount: Number(maxDeposit) || 25000,
      depositPaymentNumbers: {
        bkash: depBkash.trim(),
        nagad: depNagad.trim(),
        rocket: depRocket.trim(),
        upay: depUpay.trim()
      },
      depositInstructions: depInstructions.trim(),
      depositPolicyRules: depPolicy.trim(),

      referralBonus: Number(referralReward) || 25,
      signupBonus: Number(signupBonus) || 10,
      dailyTaskTarget: Number(dailyTaskTarget) || 10,
      noticeText: noticeText.trim(),
      supportPhone: supportPhone.trim(),
      supportWhatsApp: supportWhatsApp.trim(),
      supportTelegramBot: supportTelegramBot.trim(),
      officialTelegramChannel: officialTelegramChannel.trim(),
      adminTelegram: adminTelegram.trim(),
      verificationFee: Number(verificationFee) || 100,
      verificationPaymentNumbers: {
        bkash: bkashNumber.trim(),
        nagad: nagadNumber.trim(),
        upay: upayNumber.trim()
      },
      verificationInstructions: verificationInstructions.trim()
    });
    showToast(isBn ? 'সকল সেটিংস (ডিপোজিট, ভেরিফিকেশন ও উইথড্র) সফলভাবে সংরক্ষিত হয়েছে!' : 'All settings saved successfully!');
  };

  const handleSaveTelegramLinks = () => {
    updateSystemSettings({
      supportTelegramBot: supportTelegramBot.trim(),
      officialTelegramChannel: officialTelegramChannel.trim(),
      adminTelegram: adminTelegram.trim()
    });
    showToast(isBn ? 'টেলিগ্রাম ও সাপোর্ট লিংক সফলভাবে আপডেট হয়েছে!' : 'Telegram links updated successfully!');
  };

  const handleUpdateLink = (id: string, url: string) => {
    updateGroupLink(id, url);
    setLinks(prev => ({ ...prev, [id]: url }));
    showToast(isBn ? 'লিংক সফলভাবে আপডেট হয়েছে!' : 'Link updated!');
  };

  return (
    <div className="space-y-5">
      {/* 💡 Quick Clarity & Guide Banner */}
      <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg border border-sky-700/50 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-sky-500/30 rounded-2xl text-sky-300 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-sm sm:text-base text-sky-100 flex items-center gap-2">
              <span>{isBn ? 'ডিপোজিট বনাম ভেরিফিকেশন ফি গাইড' : 'Deposit vs Verification Fee Guide'}</span>
              <span className="px-2 py-0.5 bg-sky-400/20 text-sky-200 text-[10px] font-bold rounded-full uppercase">
                Important
              </span>
            </h3>
            <p className="text-xs text-sky-200/90 leading-relaxed font-medium">
              {isBn 
                ? 'দুটি আলাদা বিষয় আলাদা সেকশন থেকে সেট করা যায়। আপনার প্রয়োজন অনুযায়ী নিচে যে কোনো একটি বা উভয়টি সেট করে সেভ বাটনে চাপ দিন:' 
                : 'Configure deposit limits or verification fees with individual save buttons below:'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="bg-white/10 hover:bg-white/15 p-3 rounded-xl border border-white/10 space-y-1 transition-colors">
            <div className="font-black text-emerald-300 flex items-center gap-1.5">
              <ArrowDownCircle className="w-4 h-4" />
              <span>১. ওয়ালেট ডিপোজিট (টাকা রিচার্জ)</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              ইউজারদের ব্যালেন্সে টাকা যোগ করার সর্বনিম্ন সীমা ও ডিপোজিট নম্বর। বর্তমানে সর্বনিম্ন: <strong className="text-white font-bold">৳{systemSettings.minDepositAmount || 10}</strong>
            </p>
            <div className="pt-1">
              <a href="#deposit-section" className="text-[11px] font-bold text-sky-300 hover:text-white underline">
                নিচে ডিপোজিট সেকশনে যান ↓
              </a>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 p-3 rounded-xl border border-white/10 space-y-1 transition-colors">
            <div className="font-black text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>২. প্রোফাইল ভেরিফিকেশন ফি (স্ক্রিনশটের ফি)</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              হোম পেজের ভেরিফিকেশন মডালে এককালীন ফি। বর্তমানে ফি: <strong className="text-white font-bold">৳{systemSettings.verificationFee || 100}</strong>
            </p>
            <div className="pt-1">
              <a href="#verification-section" className="text-[11px] font-bold text-sky-300 hover:text-white underline">
                নিচে ভেরিফিকেশন সেকশনে যান ↓
              </a>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSavePlatformConfig} className="space-y-5">
        {/* 1. Deposit Configuration & Policy */}
        <div id="deposit-section" className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-sky-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-100 text-sky-800 rounded-2xl">
                <ArrowDownCircle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-gray-950">
                    {isBn ? '১. ডিপোজিট নম্বর, লিমিট ও নীতিমালা কনফিগারেশন' : '1. Deposit Numbers & Limits'}
                  </h3>
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[11px] font-black rounded-md">
                    ৳{minDeposit} Min
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {isBn ? 'ইউজারদের ওয়ালেটে টাকা রিচার্জ করার অফিসিয়াল পার্সোনাল নম্বর ও সর্বনিম্ন লিমিট' : 'Configure deposit numbers and min deposit limits'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setWalletActiveTab('deposit');
                  setIsWalletOpen(true);
                }}
                className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-sky-200"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isBn ? 'ডিপোজিট প্রিভিউ' : 'Preview'}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveDepositSettings}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isBn ? 'ডিপোজিট সেভ করুন' : 'Save Deposit'}</span>
              </button>
            </div>
          </div>

          {/* Deposit Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
            <div>
              <label className="font-bold text-[#D12053] block mb-1.5 flex items-center justify-between">
                <span>বিকাশ ডিপোজিট নম্বর (bKash Personal)</span>
                <span className="text-[11px] text-gray-400 font-normal">Send Money</span>
              </label>
              <input
                type="tel"
                value={depBkash}
                onChange={(e) => setDepBkash(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold text-sm text-gray-950 focus:bg-white focus:ring-2 focus:ring-pink-400 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#F7921E] block mb-1.5 flex items-center justify-between">
                <span>নগদ ডিপোজিট নম্বর (Nagad Personal)</span>
                <span className="text-[11px] text-gray-400 font-normal">Send Money</span>
              </label>
              <input
                type="tel"
                value={depNagad}
                onChange={(e) => setDepNagad(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold text-sm text-gray-950 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#8C3494] block mb-1.5 flex items-center justify-between">
                <span>রকেট ডিপোজিট নম্বর (Rocket Personal)</span>
                <span className="text-[11px] text-gray-400 font-normal">Send Money</span>
              </label>
              <input
                type="tel"
                value={depRocket}
                onChange={(e) => setDepRocket(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold text-sm text-gray-950 focus:bg-white focus:ring-2 focus:ring-purple-400 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#0066FF] block mb-1.5 flex items-center justify-between">
                <span>উপায় ডিপোজিট নম্বর (Upay Personal)</span>
                <span className="text-[11px] text-gray-400 font-normal">Send Money</span>
              </label>
              <input
                type="tel"
                value={depUpay}
                onChange={(e) => setDepUpay(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold text-sm text-gray-950 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200">
              <label className="font-black text-gray-900 block mb-1 flex items-center justify-between">
                <span>সর্বনিম্ন ডিপোজিট সীমা (৳)</span>
                <span className="text-[11px] text-sky-700 font-bold">মিনিমাম রিচার্জ</span>
              </label>
              <input
                type="number"
                value={minDeposit}
                onChange={(e) => setMinDeposit(e.target.value)}
                placeholder="300"
                className="w-full p-3 bg-white border border-gray-300 rounded-xl font-black text-base text-gray-950 focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1 font-medium">
                যেমন: ৩০০ সেট করলে ইউজাররা ওয়ালেটে ৩০০ টাকার নিচে ডিপোজিট করতে পারবে না।
              </p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
              <label className="font-black text-gray-900 block mb-1 flex items-center justify-between">
                <span>এককালীন সর্বোচ্চ ডিপোজিট সীমা (৳)</span>
                <span className="text-[11px] text-gray-500 font-bold">ম্যাক্সিমাম রিচার্জ</span>
              </label>
              <input
                type="number"
                value={maxDeposit}
                onChange={(e) => setMaxDeposit(e.target.value)}
                placeholder="25000"
                className="w-full p-3 bg-white border border-gray-300 rounded-xl font-black text-base text-gray-950 focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1 font-medium">
                একবারে সর্বোচ্চ কত টাকা রিচার্জ করা যাবে (যেমন: ২৫,০০০)।
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-900 block mb-1 flex items-center justify-between">
                <span>ডিপোজিট করার নিয়ম ও নির্দেশনা (Deposit Instructions)</span>
                <span className="text-xs text-sky-700 font-bold">ইউজারের ডিপোজিট পেজে শো করবে</span>
              </label>
              <textarea
                rows={3}
                value={depInstructions}
                onChange={(e) => setDepInstructions(e.target.value)}
                placeholder="ডিপোজিট করার নিয়ম ও পদক্ষেপ লিখুন..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none leading-relaxed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-900 block mb-1 flex items-center justify-between">
                <span>ডিপোজিট শর্তাবলী ও পলিসি রুলস (Deposit Policy & Warning Rules)</span>
                <span className="text-xs text-sky-700 font-bold">নীতিমালা ও সতর্কবার্তা</span>
              </label>
              <textarea
                rows={3}
                value={depPolicy}
                onChange={(e) => setDepPolicy(e.target.value)}
                placeholder="ডিপোজিট পলিসি ও নিয়মাবলী লিখুন..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveDepositSettings}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{isBn ? 'ডিপোজিট সেটিংস সেভ করুন' : 'Save Deposit Settings'}</span>
            </button>
          </div>
        </div>

        {/* 2. Profile Verification Gateways Configuration (The one shown in user screenshot!) */}
        <div id="verification-section" className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-emerald-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-gray-950">
                    {isBn ? '২. প্রোফাইল ভেরিফিকেশন ফি ও পেমেন্ট নম্বর' : '2. Profile Verification Fee & Gateways'}
                  </h3>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-black rounded-md">
                    ৳{verificationFee} Fee
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {isBn ? 'ইউজাররা হোমপেজের ভেরিফিকেশন ব্যানারে ও ভেরিফিকেশন মডালে এই ফি দেখতে পায়' : 'Displayed on profile verification modal and banner'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(true)}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-200"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isBn ? 'ভেরিফিকেশন প্রিভিউ' : 'Preview'}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveVerificationSettings}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isBn ? 'ভেরিফিকেশন সেভ করুন' : 'Save Fee'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
            <div className="sm:col-span-2 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
              <label className="font-black text-emerald-950 block text-sm flex items-center justify-between">
                <span>ভেরিফিকেশন ফি পরিমাণ (৳) — [স্ক্রিনশটে যা দেখাচ্ছিল]</span>
                <span className="text-xs bg-emerald-200/90 text-emerald-900 font-extrabold px-2 py-0.5 rounded-md">
                  বর্তমান: ৳{systemSettings.verificationFee || 100}
                </span>
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none font-black text-emerald-700 text-lg">
                    ৳
                  </div>
                  <input
                    type="number"
                    value={verificationFee}
                    onChange={(e) => setVerificationFee(e.target.value)}
                    placeholder="300"
                    className="w-full pl-9 pr-4 py-3 bg-white border border-emerald-300 rounded-xl font-black text-lg text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setVerificationFee('300')}
                  className="px-3 py-3 bg-white hover:bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl border border-emerald-300 cursor-pointer shadow-2xs shrink-0"
                >
                  ৳৩০০ সেট করুন
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationFee('100')}
                  className="px-3 py-3 bg-white hover:bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl border border-emerald-300 cursor-pointer shadow-2xs shrink-0"
                >
                  ৳১০০ সেট করুন
                </button>
              </div>
              <p className="text-xs text-emerald-800 font-semibold mt-1">
                👉 এখানে ৩০০ লিখে নিচে <strong className="text-emerald-900 underline">"ভেরিফিকেশন ফি ও নম্বর সেভ করুন"</strong> বাটনে চাপ দিন, এরপর উপরে <strong className="text-emerald-900">"ভেরিফিকেশন প্রিভিউ"</strong> বাটনে ক্লিক করে সাথে সাথে স্ক্রিনে ৩০০ দেখে নিশ্চিত হোন!
              </p>
            </div>

            <div>
              <label className="font-bold text-[#D12053] block mb-1.5 flex items-center justify-between">
                <span>বিকাশ পার্সোনাল নম্বর (bKash)</span>
                <span className="text-[11px] text-gray-400 font-normal">Send Money</span>
              </label>
              <input
                type="tel"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold text-sm text-gray-950 focus:bg-white focus:ring-2 focus:ring-pink-400 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#F7921E] block mb-1.5 flex items-center justify-between">
                <span>নগদ পার্সোনাল নম্বর (Nagad)</span>
                <span className="text-[11px] text-gray-400 font-normal">Send Money</span>
              </label>
              <input
                type="tel"
                value={nagadNumber}
                onChange={(e) => setNagadNumber(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold text-sm text-gray-950 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-900 block mb-1 flex items-center justify-between">
                <span>ভেরিফিকেশন নির্দেশাবলী (Verification Guidelines)</span>
                <span className="text-xs text-emerald-700 font-bold">ইউজারের ভেরিফিকেশন পেজে শো করবে</span>
              </label>
              <textarea
                rows={3}
                value={verificationInstructions}
                onChange={(e) => setVerificationInstructions(e.target.value)}
                placeholder="ভেরিফিকেশনের নিয়ম ও নির্দেশনা লিখুন..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveVerificationSettings}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{isBn ? 'ভেরিফিকেশন ফি ও নম্বর সেভ করুন' : 'Save Verification Settings'}</span>
            </button>
          </div>
        </div>

        {/* 3. Withdrawal Configuration & Policy */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-rose-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-800 rounded-2xl">
                <ArrowUpCircle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-gray-950">
                  {isBn ? '৩. উত্তোলন (উইথড্র) নম্বর, নিয়মাবলী ও নীতি' : '3. Withdrawal Limits & Rules'}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {isBn ? 'টাকা তোলার সর্বনিম্ন ও সর্বোচ্চ সীমা, উইথড্র ফি শতকরা, প্রসেসিং সময় ও নীতিমালা' : 'Configure min/max withdrawal amounts, fees, and rules'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setWalletActiveTab('withdraw');
                  setIsWalletOpen(true);
                }}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-rose-200"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isBn ? 'উইথড্র প্রিভিউ' : 'Preview'}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveWithdrawalSettings}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isBn ? 'উইথড্র সেভ করুন' : 'Save Withdrawal'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
            <div>
              <label className="font-bold text-gray-900 block mb-1">সর্বনিম্ন উত্তোলন সীমা (৳)</label>
              <input
                type="number"
                value={minWithdraw}
                onChange={(e) => setMinWithdraw(e.target.value)}
                placeholder="50"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-black text-base text-gray-950 focus:bg-white focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-900 block mb-1">দৈনিক সর্বোচ্চ উত্তোলন সীমা (৳)</label>
              <input
                type="number"
                value={maxDailyWithdraw}
                onChange={(e) => setMaxDailyWithdraw(e.target.value)}
                placeholder="10000"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-black text-base text-gray-950 focus:bg-white focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-900 block mb-1 flex items-center justify-between">
                <span>উইথড্রয়াল প্রসেসিং সময়</span>
                <span className="text-[11px] text-gray-400">Processing Time</span>
              </label>
              <input
                type="text"
                value={withdrawTime}
                onChange={(e) => setWithdrawTime(e.target.value)}
                placeholder="৩০ মিনিট থেকে ২ ঘণ্টা"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-900 block mb-1 flex items-center justify-between">
                <span>উইথড্রয়াল ফি শতকরা (%)</span>
                <span className="text-[11px] text-gray-400">Fee % (0 = Free)</span>
              </label>
              <input
                type="number"
                value={withdrawFee}
                onChange={(e) => setWithdrawFee(e.target.value)}
                placeholder="0"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-black text-base text-gray-950 focus:bg-white focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-900 block mb-1 flex items-center justify-between">
                <span>টাকা তোলার নিয়ম ও নির্দেশনা (Withdrawal Instructions)</span>
                <span className="text-xs text-rose-700 font-bold">ইউজারের উইথড্র পেজে শো করবে</span>
              </label>
              <textarea
                rows={3}
                value={withdrawInstructions}
                onChange={(e) => setWithdrawInstructions(e.target.value)}
                placeholder="টাকা তোলার নিয়ম ও নির্দেশনা লিখুন..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-rose-400 outline-none leading-relaxed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-900 block mb-1 flex items-center justify-between">
                <span>উত্তোলন শর্তাবলী ও নীতি (Withdrawal Policy & Rules)</span>
                <span className="text-xs text-rose-700 font-bold">নীতিমালা ও অ্যাকাউন্টিং শর্ত</span>
              </label>
              <textarea
                rows={3}
                value={withdrawPolicy}
                onChange={(e) => setWithdrawPolicy(e.target.value)}
                placeholder="উইথড্র নীতিমালা ও শর্তাবলী লিখুন..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-rose-400 outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveWithdrawalSettings}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{isBn ? 'উইথড্র সেটিংস সেভ করুন' : 'Save Withdrawal Settings'}</span>
            </button>
          </div>
        </div>

        {/* 4. Voucher Codes & Balance Redeem Management */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-purple-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 text-purple-800 rounded-2xl">
                <Tag className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-gray-950">
                  {isBn ? '৪. ভাউচার কোড ও রিডিম ব্যালেন্স ব্যবস্থাপনা' : '4. Voucher Codes & Balance Redeem'}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {isBn 
                    ? 'ইউজারদের দেওয়ার জন্য নতুন ভাউচার কোড সেট করুন। ইউজার কোড রিডিম করলে এই টাকা ওয়ালেটে জমা হবে।' 
                    : 'Create and manage custom promo voucher codes for instant wallet redemption'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold font-mono">
                {vouchers.length} {isBn ? 'টি ভাউচার সক্রিয়' : 'Codes'}
              </span>
            </div>
          </div>

          {/* Add New Voucher Form */}
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-purple-950 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-700" />
              <span>{isBn ? 'নতুন ভাউচার কোড তৈরি করুন' : 'Create New Voucher Code'}</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  {isBn ? 'ভাউচার কোড (Code)' : 'Voucher Code'}
                </label>
                <input
                  type="text"
                  value={newVoucherCode}
                  onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
                  placeholder="যেমন: OFFER50, SPECIAL100"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-mono font-bold text-sm text-gray-900 focus:ring-2 focus:ring-purple-400 outline-none uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  {isBn ? 'টাকার পরিমাণ (৳)' : 'Reward Amount (৳)'}
                </label>
                <input
                  type="number"
                  value={newVoucherAmount}
                  onChange={(e) => setNewVoucherAmount(e.target.value)}
                  placeholder="যেমন: 50"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-bold text-sm text-gray-900 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  {isBn ? 'সর্বোচ্চ ব্যবহার (ঐচ্ছিক)' : 'Max Redemptions (Optional)'}
                </label>
                <input
                  type="number"
                  value={newVoucherMaxUses}
                  onChange={(e) => setNewVoucherMaxUses(e.target.value)}
                  placeholder={isBn ? 'আনলিমিটেড হলে ফাঁকা রাখুন' : 'Leave empty for unlimited'}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-medium text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddVoucher}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'ভাউচার কোড যুক্ত করুন' : 'Add Voucher'}</span>
              </button>
            </div>
          </div>

          {/* List of Configured Vouchers */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-gray-700">
              {isBn ? 'বর্তমান সক্রিয় ও সংরক্ষিত ভাউচার তালিকা:' : 'Active Voucher Codes:'}
            </h4>

            {vouchers.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500 font-medium border border-dashed border-gray-200">
                {isBn ? 'এখনো কোনো ভাউচার কোড যুক্ত করা হয়নি। উপরে ফরম পূরণ করে নতুন কোড যুক্ত করুন।' : 'No voucher codes added yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vouchers.map((v) => (
                  <div 
                    key={v.id} 
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm tracking-wider px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">
                          {v.code}
                        </span>
                        <span className="font-black text-emerald-700 text-sm">
                          ৳{v.amount}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-2">
                        <span>{isBn ? `ব্যবহৃত: ${v.usedCount} বার` : `Used: ${v.usedCount}`}</span>
                        {v.maxUses && <span>• {isBn ? `সীমা: ${v.maxUses}` : `Limit: ${v.maxUses}`}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleVoucher(v.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          v.isActive 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title={v.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      >
                        {v.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Off')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVoucher(v.id)}
                        className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5. Platform Earnings, Bonuses & Notice */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-100 text-sky-900 rounded-2xl">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-gray-950">
                  {isBn ? '৫. বোনাস, রিওয়ার্ড ও নোটিশ রুলস' : '5. Platform Rewards & Notice'}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {isBn ? 'রেফারেল বোনাস, সাইন-আপ রিওয়ার্ড ও নোটিশ ব্যানার পরিবর্তন করুন' : 'Change referral rewards and global banner'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveBonusNoticeSettings}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isBn ? 'বোনাস সেটিংস সেভ করুন' : 'Save Rewards'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
            <div>
              <label className="font-bold text-gray-900 block mb-1">প্রতি সফল রেফারে বোনাস (৳)</label>
              <input
                type="number"
                value={referralReward}
                onChange={(e) => setReferralReward(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm text-gray-950 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-900 block mb-1">নতুন ইউজার সাইন-আপ বোনাস (৳)</label>
              <input
                type="number"
                value={signupBonus}
                onChange={(e) => setSignupBonus(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm text-gray-950 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-900 block mb-1">দৈনিক টার্গেট টাস্ক কোটা</label>
              <input
                type="number"
                value={dailyTaskTarget}
                onChange={(e) => setDailyTaskTarget(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm text-gray-950 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>

            {/* 1-Click Referral Audit & Reconciliation Tool */}
            <div className="sm:col-span-2 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-black text-sky-950 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{isBn ? 'রেফারেল বোনাস অডিট ও ইনস্ট্যান্ট রিকনসিলিয়েশন' : 'Referral Bonus Audit & Auto-Credit'}</span>
                </span>
                <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                  {isBn 
                    ? 'কোনো ইউজার রেফার বোনাস না পাওয়ার অভিযোগ করলে এক ক্লিকে অডিট চালান। মিসিং থাকা যেকোনো রেফার বোনাস স্বয়ংক্রিয়ভাবে ব্যবহারকারীর ওয়ালেটে যুক্ত হবে।'
                    : 'Audit all referrals and credit any missing rewards directly into user balances.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAuditAndFixReferrals}
                disabled={isAuditingReferrals}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditingReferrals ? 'animate-spin' : ''}`} />
                <span>{isBn ? 'অডিট ও বোনাস রিকনসাইল' : 'Audit & Reconcile'}</span>
              </button>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-gray-900 block mb-1">হোম নোটিশ ব্যানার টেক্সট</label>
              <input
                type="text"
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveBonusNoticeSettings}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{isBn ? 'বোনাস সেটিংস সেভ করুন' : 'Save Bonus Settings'}</span>
            </button>
          </div>
        </div>

        {/* Master Save Button */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div>
            <h4 className="font-black text-sm sm:text-base text-sky-950">
              {isBn ? 'সকল সেটিংস একসাথে সেভ করতে চান?' : 'Save all settings at once?'}
            </h4>
            <p className="text-xs text-sky-700 font-medium">
              {isBn ? 'উপরের সকল পরিবর্তন এক ক্লিকে স্থায়ীভাবে সংরক্ষণ করুন' : 'Commit all form fields to persistent storage'}
            </p>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{isBn ? 'সকল ডিপোজিট ও প্ল্যাটফর্ম সেটিংস সেভ করুন' : 'Save All Settings'}</span>
          </button>
        </div>

        {/* Official Community & Support Links Manager */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-900 rounded-2xl">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                  {isBn ? 'টেলিগ্রাম ও সাপোর্ট চ্যানেল সেটিংস' : 'Official Telegram & Support Channels'}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {isBn ? '২৪/৭ সাপোর্ট, অফিসিয়াল চ্যানেল ও অ্যাডমিন আইডি লিংক পরিবর্তন করুন' : 'Configure official telegram and helpline endpoints'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveTelegramLinks}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isBn ? 'টেলিগ্রাম লিংক সেভ করুন' : 'Save Telegram Links'}</span>
            </button>
          </div>

          {/* Primary 3 Telegram Links */}
          <div className="grid grid-cols-1 gap-3 p-3.5 bg-sky-50/60 border border-sky-200/80 rounded-2xl">
            <div className="space-y-1">
              <label className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>{isBn ? '১. ২৪/৭ সাপোর্ট হেল্পলাইন (24/7 Support)' : '1. 24/7 Support Link'}</span>
              </label>
              <input
                type="url"
                value={supportTelegramBot}
                onChange={(e) => setSupportTelegramBot(e.target.value)}
                placeholder="https://t.me/goodlifeadmin_bot"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{isBn ? '২. অফিসিয়াল টেলিগ্রাম চ্যানেল (Official Channel)' : '2. Official Channel Link'}</span>
              </label>
              <input
                type="url"
                value={officialTelegramChannel}
                onChange={(e) => setOfficialTelegramChannel(e.target.value)}
                placeholder="https://t.me/goodlifeofficialbd"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isBn ? '৩. অ্যাডমিন টেলিগ্রাম আইডি (Admin Direct)' : '3. Admin Telegram Link'}</span>
              </label>
              <input
                type="url"
                value={adminTelegram}
                onChange={(e) => setAdminTelegram(e.target.value)}
                placeholder="https://t.me/goodlifeadmin"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <h4 className="font-extrabold text-xs text-gray-700 mb-2">
              {isBn ? 'হোম পেইজের অফিসিয়াল সোশ্যাল বাটন লিংকসমূহ:' : 'Home Page Social & Group Buttons:'}
            </h4>
            <div className="space-y-2.5">
              {groupLinks.map(g => (
                <div key={g.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-gray-900">{g.title}</span>
                    <span className="text-[11px] text-gray-500 font-bold uppercase">{g.type}</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={links[g.id] || g.url}
                      onChange={(e) => setLinks({ ...links, [g.id]: e.target.value })}
                      className="flex-1 p-2.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-400 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateLink(g.id, links[g.id] || g.url)}
                      className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-lg shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      আপডেট
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsTab;
