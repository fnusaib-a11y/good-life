import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Info, 
  FileText, 
  HeartHandshake, 
  CheckCircle2, 
  AlertTriangle, 
  Headphones, 
  ExternalLink, 
  Users, 
  Sparkles,
  Award,
  Wallet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PolicyAndAboutModalProps {
  initialTab?: 'about' | 'privacy' | 'terms';
  onClose: () => void;
}

export const PolicyAndAboutModal: React.FC<PolicyAndAboutModalProps> = ({ 
  initialTab = 'about', 
  onClose 
}) => {
  const { isBn, systemSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'about' | 'privacy' | 'terms'>(initialTab);

  const supportBotUrl = systemSettings?.supportTelegramBot || 'https://t.me/goodlifeadmin_bot';
  const officialChannelUrl = systemSettings?.officialTelegramChannel || 'https://t.me/goodlifeofficialbd';
  const adminUrl = systemSettings?.adminTelegram || 'https://t.me/goodlifeadmin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 px-5 py-4 flex items-center justify-between text-white shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-xs">
              {activeTab === 'about' && <HeartHandshake className="w-5 h-5 text-white" />}
              {activeTab === 'privacy' && <ShieldCheck className="w-5 h-5 text-white" />}
              {activeTab === 'terms' && <FileText className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white leading-tight">
                {activeTab === 'about' && (isBn ? 'আমাদের সম্পর্কে ও ব্যবহারকারী সম্পর্ক' : 'About Us & Relationship')}
                {activeTab === 'privacy' && (isBn ? 'নিরাপত্তা ও প্রাইভেসি পলিসি' : 'Privacy & Security Policy')}
                {activeTab === 'terms' && (isBn ? 'শর্তাবলী ও নীতিমালা' : 'Terms & Conditions')}
              </h3>
              <p className="text-[11px] text-sky-100 font-medium">
                {isBn ? 'Good Life প্ল্যাটফর্মের অফিশিয়াল নীতি ও অঙ্গীকার' : 'Official Good Life policies & guidelines'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>{isBn ? 'আমাদের সম্পর্কে' : 'About Us'}</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isBn ? 'প্রাইভেসি ও নিরাপত্তা' : 'Privacy & Security'}</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isBn ? 'শর্তাবলী' : 'Terms'}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-gray-700 leading-relaxed">
          
          {/* TAB 1: ABOUT US & RELATIONSHIP */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-fade-in">
              {/* Introduction Card */}
              <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-sky-900 font-extrabold text-sm">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>{isBn ? 'গুড লাইফ (Good Life) পরিচিতি' : 'About Good Life'}</span>
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">
                  {isBn
                    ? 'গুড লাইফ (Good Life) বাংলাদেশের অন্যতম উদ্ভাবনী ও দ্রুত বর্ধনশীল ডিজিটাল প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য তরুণ-তরুণী, শিক্ষার্থী ও উদ্যোক্তাদের স্মার্টফোনের মাধ্যমে সহজ, নিরাপদ ও বৈধ উপায়ে আয়ের সুযোগ তৈরি করে দেওয়া। এখানে মাইক্রো জব, রিসেলিং, ই-কমার্স এবং রেফারেল নেটওয়ার্কিং-এর মাধ্যমে একটি সমৃদ্ধ কমিউনিটি গড়ে তোলা হয়েছে।'
                    : 'Good Life is one of Bangladesh’s leading digital earning and reselling ecosystems, empowering youth, students, and freelancers with legitimate micro-tasks, reselling, and transparent income models.'}
                </p>
              </div>

              {/* Core Mission & Relationship */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>{isBn ? 'ব্যবহারকারীদের সাথে আমাদের সম্পর্ক ও অঙ্গীকার' : 'Our Relationship with Users'}</span>
                </h4>
                
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-gray-900 font-extrabold mb-0.5">
                        {isBn ? '১. সততা ও স্বচ্ছতা (Transparency)' : '1. Absolute Transparency'}
                      </strong>
                      <span className="text-gray-600 font-medium">
                        {isBn
                          ? 'প্রতিটি টাস্কের আয়, রেফারেল কমিশন ও উইথড্রয়াল সম্পূর্ণ স্বচ্ছতার সাথে ইউজারের ব্যালেন্সে জমা হয়। কোনো লুকায়িত ফি নেই।'
                          : 'Every micro-task, referral bonus, and withdrawal fee is transparently reflected in real-time.'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-gray-900 font-extrabold mb-0.5">
                        {isBn ? '২. দ্রুত ও নির্ভরযোগ্য পেমেন্ট (Guaranteed Payouts)' : '2. Reliable Payouts'}
                      </strong>
                      <span className="text-gray-600 font-medium">
                        {isBn
                          ? 'বিকাশ, নগদ ও রকেটের মাধ্যমে ব্যবহারকারীদের কষ্টার্জিত অর্থ নিয়ম অনুযায়ী দ্রুততম সময়ের মধ্যে পরিশোধ করা হয়।'
                          : 'Withdrawals via bKash, Nagad, and Rocket are processed accurately according to our verified policies.'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-gray-900 font-extrabold mb-0.5">
                        {isBn ? '৩. সার্বক্ষণিক সহায়তা ও সম্পর্ক (24/7 Support)' : '3. Responsive Support Relationship'}
                      </strong>
                      <span className="text-gray-600 font-medium">
                        {isBn
                          ? 'ব্যবহারকারী কেবল একজন ক্লায়েন্ট নন, তিনি আমাদের পরিবারের সদস্য। টেলিগ্রাম সাপোর্ট ও লাইভ এডমিনের মাধ্যমে আমরা প্রতিটি সমস্যার আন্তরিক সমাধান নিশ্চিত করি।'
                          : 'Users are family members in our community. We are always ready to assist via our 24/7 support and official channels.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What We Offer */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1.5">
                <div className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>{isBn ? 'আমাদের বিশেষ সুবিধাসমূহ' : 'Key Platform Features'}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-emerald-950 font-medium pl-1">
                  <li>{isBn ? 'সহজ মাইক্রো জব ও সোশ্যাল মিডিয়া টাস্ক' : 'Accessible micro jobs & social tasks'}</li>
                  <li>{isBn ? 'বিনা পুঁজিতে প্রোডাক্ট রিসেলিং ও কাস্টমার সার্ভিস' : 'Zero-capital reselling and shop products'}</li>
                  <li>{isBn ? 'আকর্ষণীয় ৪-ডিজিটের ইনস্ট্যান্ট রেফারেল বোনাস' : 'Instant 4-digit referral bonuses'}</li>
                  <li>{isBn ? 'দৈনিক স্পিন, কুইজ, স্ক্র্যাচ কার্ড ও ভিডিও রিলস বোনাস' : 'Daily lucky spins, quizzes, and reels rewards'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY & SECURITY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-sky-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-sky-950 text-xs">
                    {isBn ? '১০০% সুরক্ষিত ও এনক্রিপ্টেড প্ল্যাটফর্ম' : '100% Encrypted & Safe'}
                  </div>
                  <div className="text-[11px] text-sky-900 font-medium">
                    {isBn ? 'আপনার ব্যক্তিগত তথ্যের নিরাপত্তা আমাদের সর্বোচ্চ অগ্রাধিকার।' : 'Your personal and financial privacy is our top responsibility.'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                  <h5 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-sky-600" />
                    <span>{isBn ? '১. ব্যক্তিগত তথ্যের গোপনীয়তা (Data Privacy)' : '1. Personal Data Privacy'}</span>
                  </h5>
                  <p className="text-gray-600 font-medium leading-relaxed text-[11px]">
                    {isBn
                      ? 'ব্যবহারকারীর নাম, মোবাইল নম্বর, ইমেইল এবং পেমেন্ট ওয়ালেট ইনফরমেশন কঠোর নিরাপত্তার সাথে ডেটাবেজে সংরক্ষিত থাকে। আমরা কোনো অবস্থাতেই কোনো বাণিজ্যিক কোম্পানি বা তৃতীয় পক্ষের নিকট আপনার ব্যক্তিগত তথ্য বিক্রয় বা প্রকাশ করি না।'
                      : 'We encrypt all user credentials and phone numbers. Your data is strictly confidential and never sold to third parties.'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                  <h5 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isBn ? '২. আর্থিক লেনদেন ও ওয়ালেট সুরক্ষা (Financial Security)' : '2. Financial Security & TrxID'}</span>
                  </h5>
                  <p className="text-gray-600 font-medium leading-relaxed text-[11px]">
                    {isBn
                      ? 'ডিপোজিট ও ভেরিফিকেশনের ক্ষেত্রে ট্রানজেকশন আইডি (TrxID) ছাড়া কোনো লেনদেন বৈধ বলে গণ্য হবে না। উইথড্র করার সময় শুধুমাত্র আপনার নিজের ওয়ালেট নম্বর ব্যবহার করুন। কোনো লেনদেনে গরমিল দেখা দিলে অ্যাডমিন স্বয়ংক্রিয়ভাবে অডিট করবে।'
                      : 'All transactions require genuine TrxID proof. Only legitimate personal wallet numbers are supported for payouts.'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                  <h5 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isBn ? '৩. ব্যবহারকারীর নিজস্ব দায়িত্ব (User Responsibility)' : '3. User Account Security'}</span>
                  </h5>
                  <p className="text-gray-600 font-medium leading-relaxed text-[11px]">
                    {isBn
                      ? 'আপনার অ্যাকাউন্টের পাসওয়ার্ড কখনোই অন্য কারো সাথে শেয়ার করবেন না। কোনো কর্মকর্তা বা অ্যাডমিন কখনোই আপনার কাছে পাসওয়ার্ড চাইবে না। কোনো সন্দেহজনক কার্যকলাপ চোখে পড়লে অবিলম্বে আমাদের ২৪/৭ সাপোর্টে জানান।'
                      : 'Never share your password or OTP. Good Life administrators will never ask for your private password. Report any suspicious activity to our 24/7 support immediately.'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                  <h5 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isBn ? '৪. অ্যান্টি-ফ্রড ও ফেয়ার প্লে (Anti-Fraud Policy)' : '4. Anti-Fraud & Fair Play'}</span>
                  </h5>
                  <p className="text-gray-600 font-medium leading-relaxed text-[11px]">
                    {isBn
                      ? 'অটো-ক্লিকার, ফেক জব স্ক্রিনশট বা মিথ্যা রেফারেল তৈরি সম্পূর্ণ নিষিদ্ধ। কোনো অ্যাকাউন্ট অসদুপায় অবলম্বন করলে সাথে সাথে ব্যালেন্স বাজেয়াপ্ত ও অ্যাকাউন্ট স্থায়ীভাবে ব্যান করা হবে।'
                      : 'Auto-clickers, fake proofs, or manipulated referrals result in immediate permanent account termination.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                <div className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>{isBn ? 'ব্যবহারের প্রধান নিয়ম ও শর্তাবলী' : 'Primary Terms of Service'}</span>
                </div>
                <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                  {isBn
                    ? 'Good Life প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত নিয়ম ও শর্তাবলী মেনে নিতে সম্মত হচ্ছেন:'
                    : 'By using the Good Life platform, you agree to comply with our community rules and terms:'}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] space-y-1">
                  <strong className="block text-gray-900 font-extrabold">
                    {isBn ? '১. একক ডিভাইস ও অ্যাকাউন্ট নীতি:' : '1. Single Account Policy:'}
                  </strong>
                  <p className="text-gray-600 font-medium">
                    {isBn
                      ? 'একজন ব্যবহারকারী একটি ডিভাইসে একটিমাত্র অ্যাকাউন্ট চালাতে পারবেন। একাধিক ভুয়া আইডি খুলে রেফারেল বোনাস নেওয়ার চেষ্টা করলে উভয় আইডি নিষিদ্ধ হবে।'
                      : 'Only one account is permitted per person and per device. Multiple fake accounts will be permanently suspended.'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] space-y-1">
                  <strong className="block text-gray-900 font-extrabold">
                    {isBn ? '২. কাজের সঠিক প্রমাণ সাবমিট:' : '2. Valid Proof Submission:'}
                  </strong>
                  <p className="text-gray-600 font-medium">
                    {isBn
                      ? 'মাইক্রো জবের নির্দেশাবলী পুঙ্খানুপুঙ্খভাবে মেনে চলতে হবে এবং শুধুমাত্র আসল স্ক্রিনশট বা প্রুফ জমা দিতে হবে। মিথ্যা প্রুফে কাজের পেমেন্ট বাতিল হবে।'
                      : 'Users must follow exact instructions and submit authentic screenshots. Submitting fake proof causes task rejection.'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] space-y-1">
                  <strong className="block text-gray-900 font-extrabold">
                    {isBn ? '৩. উইথড্রয়াল ও প্রসেসিং সময়:' : '3. Payout Processing Time:'}
                  </strong>
                  <p className="text-gray-600 font-medium">
                    {isBn
                      ? 'ন্যূনতম উইথড্র সীমা অতিক্রমের পর রিকোয়েস্ট পাঠালে নির্ধারিত সময়ের মধ্যে অ্যাডমিন যাচাই করে টাকা পাঠিয়ে দিবে। শুক্র বা সরকারি ছুটির দিনে সাময়িক বিলম্ব হতে পারে।'
                      : 'Payouts are audited and dispatched once the minimum threshold is met. Please allow standard processing time.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Direct Support & Official Telegram Links */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <h5 className="font-extrabold text-gray-900 text-xs flex items-center justify-between">
              <span>{isBn ? 'সাহায্য বা নীতি সংক্রান্ত প্রশ্নে যোগাযোগ:' : 'Official Contact Channels:'}</span>
              <span className="text-[10px] text-sky-600 font-bold">Official</span>
            </h5>
            
            <div className="grid grid-cols-2 gap-2">
              <a
                href={supportBotUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-sky-50 hover:bg-sky-100/80 border border-sky-200 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Headphones className="w-4 h-4 text-sky-600 shrink-0" />
                <div className="min-w-0">
                  <span className="block font-extrabold text-[11px] text-gray-900 truncate">
                    {isBn ? '২৪/৭ সাপোর্ট' : '24/7 Support'}
                  </span>
                  <span className="block text-[10px] text-gray-500 truncate">Live Help</span>
                </div>
                <ExternalLink className="w-3 h-3 text-sky-500 ml-auto shrink-0" />
              </a>

              <a
                href={officialChannelUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <span className="block font-extrabold text-[11px] text-gray-900 truncate">
                    {isBn ? 'টেলিগ্রাম চ্যানেল' : 'Official Telegram'}
                  </span>
                  <span className="block text-[10px] text-gray-500 truncate">Updates</span>
                </div>
                <ExternalLink className="w-3 h-3 text-blue-500 ml-auto shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'গুড লাইফ অফিশিয়াল পলিসি ২০২৬' : 'Good Life Official 2026'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
