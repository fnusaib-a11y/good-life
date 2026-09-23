import React, { useState } from 'react';
import { 
  Zap, 
  Save, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  DollarSign, 
  FileText, 
  Phone, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SpecialSocialSettings } from '../../types';

interface AdminSpecialSocialSettingsTabProps {
  onNavigateTab?: (tab: any) => void;
}

export const AdminSpecialSocialSettingsTab: React.FC<AdminSpecialSocialSettingsTabProps> = ({ onNavigateTab }) => {
  const { systemSettings, updateSystemSettings, depositRequests, registeredUsers, showToast, language } = useApp();
  const isBn = language === 'bn';

  const initialConfig: SpecialSocialSettings = systemSettings.specialSocialConfig || {
    isEnabled: true,
    depositRequired: true,
    depositAmount: 150,
    notificationTitle: 'বিশেষ সোশ্যাল ইনকামের জন্য ডিপোজিট নির্দেশিকা',
    description: 'বিশেষ সোশ্যাল ইনকাম ফিচারে আনলিমিটেড উচ্চ-আয়ের জিমেইল ক্রিয়েশন, ইনস্টাগ্রাম প্রমোশন, হোয়াটসঅ্যাপ ও টেলিগ্রাম প্রিমিয়াম মাইক্রো টাস্ক রয়েছে। এই প্রিমিয়াম টাস্কগুলোতে প্রবেশের জন্য এবং জেনুইন ওয়ার্কার নিশ্চিত করতে এককালীন সিকিউরিটি ডিপোজিট আবশ্যক। ডিপোজিট সফলভাবে সম্পন্ন হলে আপনার একাউন্টে এই ফিচারটি আজীবনের জন্য আনলক হয়ে যাবে।',
    paymentMethod: 'bKash / Nagad',
    paymentNumber: '01877722819',
    terms: '১. নির্ধারিত বিকাশ অথবা নগদ নম্বরে সেন্ড মানি (Send Money) সম্পন্ন করুন।\n২. টাকা পাঠানোর পর যে নম্বর থেকে পাঠিয়েছেন সেই নম্বর ও TrxID লিখে সাবমিট করুন।\n৩. এডমিন প্যানেলে যাচাইকরণের পর শুধুমাত্র আপনার একাউন্টের জন্য এই ফিচারটি চালু হয়ে যাবে।\n৪. কোনো ভুল বা অসত্য তথ্য দিলে রিকোয়েস্ট বাতিল হতে পারে।'
  };

  const [formData, setFormData] = useState<SpecialSocialSettings>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);

  // Statistics for Admin
  const specialSocialDeposits = depositRequests.filter(d => 
    d.depositType === 'special_social' || 
    d.purpose === 'বিশেষ সোশ্যাল ইনকাম এক্সেস' || 
    (d.purpose && d.purpose.includes('বিশেষ সোশ্যাল'))
  );
  const pendingCount = specialSocialDeposits.filter(d => (d.status || '').toLowerCase() === 'pending').length;
  const approvedCount = specialSocialDeposits.filter(d => (d.status || '').toLowerCase() === 'approved').length;
  const unlockedUsersCount = registeredUsers.filter(u => u.specialSocialAccess === true).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateSystemSettings({
        specialSocialConfig: formData
      });
      showToast(isBn ? 'বিশেষ সোশ্যাল ইনকাম সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Special Social Income settings saved successfully!');
    } catch {
      showToast(isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 shadow-inner">
            <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
              {isBn ? 'বিশেষ সোশ্যাল ইনকাম Settings' : 'Special Social Income Settings'}
            </h2>
            <p className="text-xs text-sky-100 mt-0.5">
              {isBn 
                ? 'ডিপোজিট রিকোয়ার্ড অন/অফ, টাকার পরিমাণ ও ইউজার নোটিফিকেশন তথ্য নিয়ন্ত্রণ' 
                : 'Control Deposit Required toggle, amount, and user notification info'}
            </p>
          </div>
        </div>

        {/* Quick View Button to Deposits */}
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('deposits')}
            className="px-4 py-2 bg-white text-indigo-900 hover:bg-sky-50 active:scale-95 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>{isBn ? 'ডিপোজিট রিকোয়েস্ট দেখুন' : 'View Deposit Requests'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold">{isBn ? 'পেন্ডিং রিকোয়েস্ট' : 'Pending Deposits'}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg sm:text-xl font-black text-amber-600 font-mono">{pendingCount}</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold">{isBn ? 'অনুমোদিত ডিপোজিট' : 'Approved Deposits'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-600 font-mono">{approvedCount}</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold">{isBn ? 'আনলকড ইউজার' : 'Unlocked Users'}</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-lg sm:text-xl font-black text-indigo-600 font-mono">{unlockedUsersCount}</p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 sm:p-6 space-y-5">
        
        {/* Toggle 1: Deposit Required ON/OFF */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200/70">
          <div className="space-y-0.5 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-gray-900">
                {isBn ? 'Deposit Required (ডিপোজিট বাধ্যতামূলক)' : 'Deposit Required'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                formData.depositRequired 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {formData.depositRequired ? (isBn ? 'সক্রিয় (ON)' : 'ON') : (isBn ? 'নিষ্ক্রিয় (OFF)' : 'OFF')}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {isBn 
                ? 'অন থাকলে ইউজারকে টাস্কে প্রবেশের আগে ডিপোজিট পেজ প্রদর্শন করবে এবং এডমিন অনুমোদন ছাড়া লক থাকবে। অফ থাকলে কোনো ডিপোজিট ছাড়াই সরাসরি কাজ করতে পারবে।'
                : 'When ON, users must deposit and wait for approval before accessing tasks. When OFF, tasks open directly.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, depositRequired: !prev.depositRequired }))}
            className="cursor-pointer text-indigo-600 hover:text-indigo-700 transition-transform active:scale-95 shrink-0"
          >
            {formData.depositRequired ? (
              <ToggleRight className="w-10 h-10 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-gray-400" />
            )}
          </button>
        </div>

        {/* Input: Notification Title */}
        <div>
          <label className="block text-xs font-black text-gray-800 mb-1.5">
            {isBn ? 'Notification Title (নোটিফিকেশন শিরোনাম):' : 'Notification Title:'}
          </label>
          <input
            type="text"
            value={formData.notificationTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, notificationTitle: e.target.value }))}
            placeholder="যেমন: বিশেষ সোশ্যাল ইনকামের জন্য ডিপোজিট নির্দেশিকা"
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
            required
          />
        </div>

        {/* Textarea: Detailed Description */}
        <div>
          <label className="block text-xs font-black text-gray-800 mb-1.5">
            {isBn ? 'বিস্তারিত Description (কেন Deposit করতে হবে):' : 'Detailed Description (Why Deposit):'}
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={isBn ? 'ইউজারদের বিস্তারিত বুঝিয়ে লিখুন কেন এই ডিপোজিট নেওয়া হচ্ছে ও কী কী সুবিধা পাবে...' : 'Explain in detail why deposit is required...'}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium leading-relaxed"
            required
          />
        </div>

        {/* Deposit Amount & Payment Method Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-800 mb-1.5">
              {isBn ? 'Deposit Amount (টাকার পরিমাণ):' : 'Deposit Amount (৳):'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">৳</span>
              <input
                type="number"
                min="10"
                step="5"
                value={formData.depositAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: Number(e.target.value) || 0 }))}
                className="w-full pl-8 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-black font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-800 mb-1.5">
              {isBn ? 'Payment Method (পেমেন্ট মাধ্যম):' : 'Payment Method:'}
            </label>
            <input
              type="text"
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              placeholder="যেমন: bKash / Nagad"
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-800 mb-1.5">
              {isBn ? 'Payment Number (অফিশিয়াল নম্বর):' : 'Payment Number:'}
            </label>
            <input
              type="text"
              value={formData.paymentNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentNumber: e.target.value }))}
              placeholder="01877722819"
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-bold font-mono tracking-wider"
              required
            />
          </div>
        </div>

        {/* Textarea: Terms / Instructions */}
        <div>
          <label className="block text-xs font-black text-gray-800 mb-1.5">
            {isBn ? 'Terms / Instructions (প্রয়োজনীয় নির্দেশনা ও শর্তাবলী):' : 'Terms & Instructions:'}
          </label>
          <textarea
            rows={4}
            value={formData.terms}
            onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
            placeholder={isBn ? '১. নির্ধারিত নম্বরে Send Money করুন...\n২. TrxID সঠিকভাবে লিখুন...' : 'Enter terms and payment instructions...'}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="py-3 px-6 bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save Settings')}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminSpecialSocialSettingsTab;
