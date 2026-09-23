import React, { useState } from 'react';
import { X, Headphones, Send, ShieldCheck, UserCheck, MessageSquare, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { isBn, systemSettings, submitReport, showToast } = useApp();
  const [reportType, setReportType] = useState('পেমেন্ট বা ব্যালেন্স সমস্যা');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const supportBotUrl = systemSettings?.supportTelegramBot || 'https://t.me/goodlifeadmin_bot';
  const officialChannelUrl = systemSettings?.officialTelegramChannel || 'https://t.me/goodlifeofficialbd';
  const adminUrl = systemSettings?.adminTelegram || 'https://t.me/goodlifeadmin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast(isBn ? 'আপনার সমস্যার বিস্তারিত লিখুন' : 'Please describe your issue');
      return;
    }
    submitReport(reportType, message.trim());
    setSubmitted(true);
    showToast(isBn ? 'রিপোর্ট সফলভাবে জমা হয়েছে!' : 'Report submitted successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up border border-gray-100 max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-4 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white leading-tight">
                {isBn ? 'লাইভ সাপোর্ট ও হেল্পডেস্ক' : 'Live Support & Helpdesk'}
              </h3>
              <p className="text-[11px] text-sky-100 font-medium">
                {isBn ? 'যে কোনো সমস্যায় দ্রুত সমাধানের জন্য যোগাযোগ করুন' : 'Instant resolution for any issues'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Official Telegram Action Cards */}
          <div className="space-y-2">
            <h4 className="font-black text-gray-900 text-xs flex items-center gap-1.5">
              <span>{isBn ? 'সরাসরি টেলিগ্রাম সাপোর্ট চ্যানেল' : 'Direct Telegram Channels'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h4>

            {/* 1. 24/7 Support */}
            <a
              href={supportBotUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-sky-50 hover:bg-sky-100/80 border border-sky-200 rounded-2xl flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-xs flex items-center gap-1.5">
                    <span>{isBn ? '২৪/৭ সাপোর্ট' : '24/7 Support'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-sky-200 text-sky-800 rounded-full font-bold">Fast</span>
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium line-clamp-1">
                    {isBn ? 'তাৎক্ষণিক হেল্প ও অভিযোগ সমাধান' : 'Instant help & resolution'}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-sky-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* 2. Official Channel */}
            <a
              href={officialChannelUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-2xl flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-xs flex items-center gap-1.5">
                    <span>{isBn ? 'অফিসিয়াল চ্যানেল' : 'Official Channel'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-200 text-blue-800 rounded-full font-bold">Official</span>
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium line-clamp-1">
                    {isBn ? 'সকল পেমেন্ট প্রুফ ও নিয়মিত নোটিশ' : 'Updates and official announcements'}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* 3. Direct Admin */}
            <a
              href={adminUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-xs flex items-center gap-1.5">
                    <span>{isBn ? 'সরাসরি অ্যাডমিন' : 'Direct Admin Contact'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded-full font-bold">VIP</span>
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium line-clamp-1">
                    {isBn ? 'জরুরি লেনদেন ও একাউন্ট যাচাই' : 'Personal assistance from Admin'}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* In-app Support Ticket Form */}
          <div className="pt-2 border-t border-gray-100">
            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h5 className="font-black text-emerald-900 text-sm">
                  {isBn ? 'আপনার বার্তা সফলভাবে গৃহীত হয়েছে' : 'Ticket Received'}
                </h5>
                <p className="text-[11px] text-emerald-800 font-medium">
                  {isBn 
                    ? 'এডমিন টিম শীঘ্রই আপনার সমস্যাটি যাচাই করবে। জরুরি হলে উপরের টেলিগ্রাম লিংকে মেসেজ দিন।'
                    : 'Admin team will review shortly. For urgent help, please use the Telegram bot.'}
                </p>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setMessage(''); }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  {isBn ? 'নতুন বার্তা পাঠান' : 'Submit Another'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center gap-1.5 text-gray-700 font-black text-xs">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  <span>{isBn ? 'অথবা অ্যাপের মাধ্যমে টিকেট সাবমিট করুন' : 'Or Submit In-App Ticket'}</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {isBn ? 'সমস্যার ধরন' : 'Issue Category'}
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="পেমেন্ট বা ব্যালেন্স সমস্যা">{isBn ? 'পেমেন্ট বা উইথড্র ব্যালেন্স সমস্যা' : 'Payment / Withdrawal Issue'}</option>
                    <option value="জব বা টাস্ক সমস্যা">{isBn ? 'জব বা টাস্ক প্রুফ সমস্যা' : 'Job Submission Issue'}</option>
                    <option value="একাউন্ট ভেরিফিকেশন">{isBn ? 'একাউন্ট ভেরিফিকেশন সংক্রান্ত' : 'Account Verification'}</option>
                    <option value="অন্যান্য অভিযোগ">{isBn ? 'অন্যান্য অভিযোগ ও মতামত' : 'Other Inquiries'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {isBn ? 'বিস্তারিত বর্ণনা' : 'Description'}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder={isBn ? 'আপনার সমস্যা, TrxID বা বিস্তারিত তথ্য লিখুন...' : 'Describe your issue, TrxID, etc...'}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isBn ? 'টিকেট জমা দিন' : 'Submit Ticket'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
