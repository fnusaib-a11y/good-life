import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft,
  Mail, 
  Instagram, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  Gift,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';

interface SocialTaskActionModalProps {
  taskId: 'gmail_task' | 'instagram_task' | 'whatsapp_task' | 'telegram_task';
  onClose: () => void;
}

interface TaskDetail {
  title: string;
  category: string;
  reward: number;
  icon: React.ReactNode;
  headerGradient: string;
  targetLink?: string;
  linkLabel?: string;
  instructions: string[];
  inputLabel: string;
  inputPlaceholder: string;
}

export const SocialTaskActionModal: React.FC<SocialTaskActionModalProps> = ({ taskId, onClose }) => {
  const { 
    creditUserReward, 
    showToast, 
    isBn 
  } = useApp();

  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getTaskDetail = (): TaskDetail => {
    switch (taskId) {
      case 'gmail_task':
        return {
          title: isBn ? 'জিমেইল একাউন্ট তৈরি কাজ' : 'Gmail Account Creation Task',
          category: isBn ? 'স্পেশাল সোশ্যাল জব' : 'Special Social Job',
          reward: 8.00,
          icon: <Mail className="w-6 h-6 text-red-600" />,
          headerGradient: 'from-red-600 to-rose-600',
          instructions: [
            'একটি সতেজ ও নতুন Gmail একাউন্ট তৈরি করুন।',
            'রিকভারি ইমেইল যোগ করার প্রয়োজন নেই।',
            'নিচের বক্সে তৈরি করা ইমেইল এড্রেস ও পাসওয়ার্ড সাবমিট করুন।'
          ],
          inputLabel: isBn ? 'তৈরি করা জিমেইল ও পাসওয়ার্ড লিখুন' : 'Enter Created Gmail & Password',
          inputPlaceholder: 'যেমন: newuser2026@gmail.com | Pass: 12345678'
        };
      case 'instagram_task':
        return {
          title: isBn ? 'ইনস্টাগ্রাম ফলো ও লাইক জব' : 'Instagram Follow & Like Task',
          category: isBn ? 'সোশ্যাল মিডিয়া জব' : 'Social Media Job',
          reward: 2.50,
          icon: <Instagram className="w-6 h-6 text-pink-600" />,
          headerGradient: 'from-pink-600 to-purple-600',
          targetLink: 'https://instagram.com/goodlifeofficial',
          linkLabel: isBn ? 'ইনস্টাগ্রাম পেজ ওপেন করুন' : 'Open Instagram Page',
          instructions: [
            'উপরের লিংকে ক্লিক করে পেজটি ফলো করুন।',
            'সর্বশেষ পোস্টে একটি লাইক দিন।',
            'নিচের বক্সে আপনার ইনস্টাগ্রাম ইউজারনেম লিখে জমা দিন।'
          ],
          inputLabel: isBn ? 'আপনার ইনস্টাগ্রাম ইউজারনেম (@username)' : 'Your Instagram Username',
          inputPlaceholder: '@your_username'
        };
      case 'whatsapp_task':
        return {
          title: isBn ? 'হোয়াটসঅ্যাপ গ্রুপে শেয়ার জব' : 'WhatsApp Share Task',
          category: isBn ? 'শেয়ারিং জব' : 'Sharing Job',
          reward: 3.50,
          icon: <MessageCircle className="w-6 h-6 text-emerald-600" />,
          headerGradient: 'from-emerald-600 to-teal-700',
          targetLink: 'https://api.whatsapp.com/send?text=GoodLife%20Online%20Earning%20Platform',
          linkLabel: isBn ? 'হোয়াটসঅ্যাপে মেসেজ পাঠান' : 'Share on WhatsApp',
          instructions: [
            'কমপক্ষে ২টি অ্যাক্টিভ হোয়াটসঅ্যাপ গ্রুপ বা বন্ধুদের ইনবক্সে শেয়ার করুন।',
            'নিচের বক্সে আপনি যে নম্বরে হোয়াটসঅ্যাপ ব্যবহার করেন তা লিখুন।'
          ],
          inputLabel: isBn ? 'আপনার হোয়াটসঅ্যাপ নম্বর লিখুন' : 'Your WhatsApp Number',
          inputPlaceholder: '017XXXXXXXX'
        };
      case 'telegram_task':
      default:
        return {
          title: isBn ? 'অফিসিয়াল টেলিগ্রামে জয়েন জব' : 'Telegram Channel Join Task',
          category: isBn ? 'টেলিগ্রাম জব' : 'Telegram Job',
          reward: 2.50,
          icon: <Send className="w-6 h-6 text-blue-600" />,
          headerGradient: 'from-blue-600 to-sky-600',
          targetLink: 'https://t.me/goodlifeofficialbd',
          linkLabel: isBn ? 'টেলিগ্রাম চ্যানেলে যুক্ত হোন' : 'Join Telegram Channel',
          instructions: [
            'আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন করুন।',
            'নোটিফিকেশন অন রাখুন।',
            'নিচের বক্সে আপনার টেলিগ্রাম ইউজারনেম জমা দিন।'
          ],
          inputLabel: isBn ? 'আপনার টেলিগ্রাম ইউজারনেম (@username)' : 'Your Telegram Username',
          inputPlaceholder: '@your_telegram_handle'
        };
    }
  };

  const detail = getTaskDetail();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsSubmitted(true);

    // Credit user balance
    creditUserReward(detail.reward, `${detail.title} সম্পন্ন`, 'job');
    showToast(`অভিনন্দন! কাজ সম্পন্ন করে ৳${detail.reward.toFixed(2)} জিতেছেন!`);
  };

  return (
    <div 
      id="social-task-full-page"
      className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-y-auto animate-in fade-in duration-200"
    >
      {/* DIRECT PAGE TOP APP BAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={onClose} 
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${detail.headerGradient} text-white flex items-center justify-center shadow-md shrink-0`}>
                {detail.icon}
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                  {detail.title}
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">
                  {isBn ? `পুরস্কার: ৳${detail.reward.toFixed(2)}` : `Reward: ৳${detail.reward.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Full Page Body */}
      <main className="flex-1 w-full max-w-lg mx-auto p-4 sm:p-6 flex flex-col justify-start">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {/* Target Action link if available */}
            {detail.targetLink && (
              <a
                href={detail.targetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-bold text-xs text-sky-700 flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <span>{detail.linkLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Step-by-Step Instructions */}
            <div className="bg-gray-50 border border-gray-200/90 rounded-2xl p-3.5 space-y-2 text-xs">
              <h5 className="font-black text-gray-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>কাজের সঠিক নিয়মাবলী:</span>
              </h5>
              <ul className="space-y-1.5 text-gray-600 pl-1 font-medium">
                {detail.instructions.map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Input Submission */}
            <div className="space-y-1.5">
              <label className="font-bold text-xs text-gray-800 block">
                {detail.inputLabel} *
              </label>
              <input
                type="text"
                required
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={detail.inputPlaceholder}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-400 focus:bg-white"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>কাজ জমা দিন ও রিওয়ার্ড ৳{detail.reward.toFixed(2)} নিন</span>
            </button>

          </form>
        ) : (
          <div className="p-6 text-center space-y-4 flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center shadow-lg text-emerald-600 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-lg text-gray-900">
                কাজ সফলভাবে জমা হয়েছে!
              </h4>
              <p className="text-xs text-gray-600 font-semibold">
                আপনার তথ্য ভেরিফাই করে ওয়ালেটে টাকা যোগ করা হয়েছে।
              </p>
            </div>

            <div className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-4 shadow-md space-y-1">
              <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider block">
                ইনস্ট্যান্ট রিওয়ার্ড জমা
              </span>
              <div className="text-3xl font-black">
                +৳{detail.reward.toFixed(2)}
              </div>
              <p className="text-[10px] text-emerald-100">টাকা সরাসরি মেইন ওয়ালেটে যোগ হয়েছে</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl text-xs cursor-pointer shadow-md"
            >
              ঠিক আছে / বন্ধ করুন
            </button>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};
