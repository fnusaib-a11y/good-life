import React from 'react';
import { 
  X, 
  Eye, 
  HelpCircle, 
  Keyboard, 
  Megaphone, 
  PlusCircle, 
  GraduationCap, 
  Laptop, 
  Smartphone, 
  Zap, 
  Store, 
  FileText, 
  Moon, 
  Clock,
  Sparkles,
  Mail,
  Instagram,
  MessageCircle,
  Send,
  Users,
  Briefcase,
  Trophy,
  Gift,
  ArrowRight,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostJobModal } from '../microjobs/PostJobModal';
import { AdsViewModal } from './AdsViewModal';
import { QuizJobModal } from './QuizJobModal';
import { TypingJobModal } from './TypingJobModal';
import { AdMarketingModal } from './AdMarketingModal';
import { SocialTaskActionModal } from './SocialTaskActionModal';
import { SkillCoursesModal } from './SkillCoursesModal';
import { SpecialSocialDepositRequiredPage } from '../specialSocial/SpecialSocialDepositRequiredPage';

interface ModalMeta {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category: string;
}

export const IncomeActionModals: React.FC = () => {
  const { 
    activeIncomeModal, 
    setActiveIncomeModal, 
    setActiveTab, 
    isAuthorizedAdmin,
    setIsAdminDashboardOpen,
    isBn 
  } = useApp();

  if (!activeIncomeModal) return null;

  const handleClose = () => setActiveIncomeModal(null);

  // If user tapped Ads View, open full auto AdsViewModal with sequence & timer
  if (activeIncomeModal === 'ads_view') {
    return <AdsViewModal onClose={handleClose} />;
  }

  // If user tapped Quiz Job, open full interactive Quiz Modal
  if (activeIncomeModal === 'quiz_job') {
    return <QuizJobModal onClose={handleClose} />;
  }

  // If user tapped Typing Job, open full interactive Captcha/Typing Modal
  if (activeIncomeModal === 'typing_job') {
    return <TypingJobModal onClose={handleClose} />;
  }

  // If user tapped Ad Marketing, open full Social Promo & Share Modal
  if (activeIncomeModal === 'ad_marketing') {
    return <AdMarketingModal onClose={handleClose} />;
  }

  // If user tapped Job Post, open full PostJobModal with picture upload
  if (activeIncomeModal === 'job_post') {
    return <PostJobModal onClose={handleClose} />;
  }

  // Social tasks (Gmail, Instagram, WhatsApp, Telegram)
  if (
    activeIncomeModal === 'gmail_task' || 
    activeIncomeModal === 'instagram_task' || 
    activeIncomeModal === 'whatsapp_task' || 
    activeIncomeModal === 'telegram_task'
  ) {
    return <SocialTaskActionModal taskId={activeIncomeModal} onClose={handleClose} />;
  }

  // Special Social Income Deposit Requirement Modal
  if (activeIncomeModal === 'special_social_deposit_required') {
    return <SpecialSocialDepositRequiredPage onClose={handleClose} />;
  }

  // Skill courses and freelancing
  if (activeIncomeModal === 'skill_course' || activeIncomeModal === 'freelancing') {
    return <SkillCoursesModal type={activeIncomeModal} onClose={handleClose} />;
  }

  const getModalMeta = (type: string): ModalMeta => {
    switch (type) {
      case 'ads_view':
        return {
          title: isBn ? 'ভিডিও অ্যাডস ভিউ' : 'Video Ads View',
          subtitle: isBn ? 'বিজ্ঞাপন দেখে ইনস্ট্যান্ট আয় করার সুবিধা' : 'Watch sponsored ads and earn instant rewards',
          icon: <Eye className="w-8 h-8 text-sky-600" />,
          category: isBn ? 'সহজ ইনকাম' : 'Easy Income'
        };
      case 'quiz_job':
        return {
          title: isBn ? 'কুইজ খেলে আয়' : 'Quiz & Earn',
          subtitle: isBn ? 'সাধারণ জ্ঞান ও ইসলামিক প্রশ্নের সঠিক উত্তর দিয়ে আয়' : 'Earn rewards by answering trivia & Islamic questions',
          icon: <HelpCircle className="w-8 h-8 text-purple-600" />,
          category: isBn ? 'সহজ ইনকাম' : 'Easy Income'
        };
      case 'typing_job':
        return {
          title: isBn ? 'টাইপিং জব' : 'Typing Job',
          subtitle: isBn ? 'বাংলা ও ইংরেজি ক্যাপচা টাইপিং করে প্রতিদিনের আয়' : 'Captcha and data entry typing earning tasks',
          icon: <Keyboard className="w-8 h-8 text-emerald-600" />,
          category: isBn ? 'সহজ ইনকাম' : 'Easy Income'
        };
      case 'ad_marketing':
        return {
          title: isBn ? 'বিজ্ঞাপন মার্কেটিং' : 'Ad Marketing',
          subtitle: isBn ? 'বিজ্ঞাপন শেয়ার ও প্রোডাক্ট প্রোমোশন করে কমিশন' : 'Promote banners & campaigns for high commissions',
          icon: <Megaphone className="w-8 h-8 text-purple-600" />,
          category: isBn ? 'সহজ ইনকাম' : 'Easy Income'
        };
      case 'micro_job':
        return {
          title: isBn ? 'মাইক্রো জব' : 'Micro Jobs',
          subtitle: isBn ? 'ছোট ছোট অনলাইন টাস্ক সম্পন্ন করে নিশ্চিত উপার্জন' : 'Complete simple tasks and surveys to earn money',
          icon: <Sparkles className="w-8 h-8 text-pink-600" />,
          category: isBn ? 'সহজ ইনকাম' : 'Easy Income'
        };
      case 'job_post':
        return {
          title: isBn ? 'কাজ পোস্ট করুন' : 'Post a Job',
          subtitle: isBn ? 'আপনার নিজস্ব সোশ্যাল বা মার্কেটিং কাজ ফ্রিল্যান্সারদের দিয়ে করান' : 'Post tasks and hire members from the community',
          icon: <PlusCircle className="w-8 h-8 text-indigo-600" />,
          category: isBn ? 'সহজ ইনকাম' : 'Easy Income'
        };
      case 'courses':
      case 'skill_course':
        return {
          title: isBn ? 'স্কিল কোর্স' : 'Skill Courses',
          subtitle: isBn ? 'দক্ষতা উন্নয়ন এবং ফ্রিল্যান্সিং ক্যারিয়ার গড়ার প্রিমিয়াম কোর্স' : 'Learn in-demand skills and start freelancing',
          icon: <GraduationCap className="w-8 h-8 text-sky-600" />,
          category: isBn ? 'লার্নিং হাব' : 'Learning Hub'
        };
      case 'freelancing':
      case 'digital_services':
        return {
          title: isBn ? 'ফ্রিল্যান্সিং ও ডিজিটাল সার্ভিস' : 'Freelancing & Services',
          subtitle: isBn ? 'গ্রাফিক্স, ওয়েব ও কনটেন্ট সার্ভিস অর্ডার ও ডেলিভারি হাব' : 'Offer freelance services and receive client projects',
          icon: <Laptop className="w-8 h-8 text-cyan-600" />,
          category: isBn ? 'ফ্রিল্যান্সিং' : 'Freelance Hub'
        };
      case 'mobile_recharge':
        return {
          title: isBn ? 'মোবাইল রিচার্জ' : 'Mobile Recharge',
          subtitle: isBn ? 'যেকোনো বাংলাদেশি নম্বরে ইনস্ট্যান্ট অটো মোবাইল রিচার্জ ও ক্যাশব্যাক' : 'Instant mobile airtime top-up with cashbacks',
          icon: <Smartphone className="w-8 h-8 text-green-600" />,
          category: isBn ? 'টপ-আপ হাব' : 'Top-up Hub'
        };
      case 'drive_offer':
        return {
          title: isBn ? 'স্পেশাল ড্রাইভ অফার' : 'Special Drive Packs',
          subtitle: isBn ? 'গ্রামীনফোন, রবি, বাংলালিংক ও এয়ারটেল আকর্ষণীয় এমবি ও মিনিট প্যাক' : 'Exclusive discount telecom bundle packs',
          icon: <Zap className="w-8 h-8 text-blue-600" />,
          category: isBn ? 'টপ-আপ হাব' : 'Top-up Hub'
        };
      case 'reselling':
        return {
          title: isBn ? 'প্রোডাক্ট রিসেলিং' : 'Product Reselling',
          subtitle: isBn ? 'বিনা পুঁজিতে পাইকারি পণ্য অনলাইনে বিক্রি করে প্রফিট মার্জিন আয়' : 'Zero-capital reselling store with instant profit payout',
          icon: <Store className="w-8 h-8 text-orange-600" />,
          category: isBn ? 'ব্যবসা ও রিসেলিং' : 'Reselling Hub'
        };
      case 'vendor_apply':
        return {
          title: isBn ? 'ভেন্ডর / সেলার আবেদন' : 'Vendor Application',
          subtitle: isBn ? 'Good Life প্ল্যাটফর্মে আপনার শপ বা প্রোডাক্ট পাইকারি লিস্ট করুন' : 'List your inventory to thousands of active resellers',
          icon: <Store className="w-8 h-8 text-purple-600" />,
          category: isBn ? 'বিজনেস পার্টনার' : 'Business Partner'
        };
      case 'ai_tools':
        return {
          title: isBn ? 'স্মার্ট ক্যাপশন রাইটার' : 'Smart Caption Writer',
          subtitle: isBn ? 'ফেসবুক ও সোশ্যাল মিডিয়া পোস্টের আকর্ষণীয় ভাইরাল ক্যাপশন জেনারেটর' : 'AI viral caption generator for social media posts',
          icon: <FileText className="w-8 h-8 text-indigo-600" />,
          category: isBn ? 'টুলস ও ফিচার' : 'AI Tools'
        };
      case 'umrah_gift':
        return {
          title: isBn ? 'ফ্রি ওমরাহ গিফট স্কিম' : 'Free Umrah Gift Scheme',
          subtitle: isBn ? 'সেরা অ্যাক্টিভ মেম্বারদের জন্য পবিত্র ওমরাহ পালনের সম্পূর্ণ ফ্রি সুযোগ' : 'All-expenses-paid Umrah reward package for top performers',
          icon: <Moon className="w-8 h-8 text-emerald-600" />,
          category: isBn ? 'স্পেশাল রিওয়ার্ড' : 'Special Reward'
        };
      case 'weekly_report':
        return {
          title: isBn ? 'সাপ্তাহিক ইনকাম রিপোর্ট' : 'Weekly Income Report',
          subtitle: isBn ? 'আপনার সপ্তাহব্যাপী ইনকাম, রেফারেল বোনাস ও পারফরম্যান্স এনালাইসিস' : 'Detailed analytics of your earnings and team growth',
          icon: <FileText className="w-8 h-8 text-sky-600" />,
          category: isBn ? 'রিপোর্ট' : 'Reports'
        };
      case 'leaderboard':
        return {
          title: isBn ? 'টপ আর্নার লিডারবোর্ড' : 'Top Earners Leaderboard',
          subtitle: isBn ? 'Good Life প্ল্যাটফর্মের শীর্ষ আয়কারীদের তালিকা ও র‍্যাংকিং' : 'Rankings of top performers and monthly championship prizes',
          icon: <Trophy className="w-8 h-8 text-sky-500" />,
          category: isBn ? 'লিডারবোর্ড' : 'Leaderboard'
        };
      case 'gmail_task':
        return {
          title: isBn ? 'জিমেইল অ্যাকাউন্ট ভেরিফিকেশন' : 'Gmail Account Verification',
          subtitle: isBn ? 'ভেরিফাইড গুগল জিমেইল ক্রিয়েশন মাইক্রো টাস্ক' : 'Gmail account farming & verification reward tasks',
          icon: <Mail className="w-8 h-8 text-rose-500" />,
          category: isBn ? 'সোশ্যাল ইনকাম' : 'Social Income'
        };
      case 'instagram_task':
        return {
          title: isBn ? 'ইনস্টাগ্রাম সোশ্যাল টাস্ক' : 'Instagram Social Tasks',
          subtitle: isBn ? 'ইনস্টাগ্রাম প্রোফাইল ফলো, লাইক ও এনগেজমেন্ট টাস্ক' : 'Follow & like tasks on Instagram for instant earnings',
          icon: <Instagram className="w-8 h-8 text-pink-600" />,
          category: isBn ? 'সোশ্যাল ইনকাম' : 'Social Income'
        };
      case 'whatsapp_task':
        return {
          title: isBn ? 'হোয়াটসঅ্যাপ গ্রুপ টাস্ক' : 'WhatsApp Group Tasks',
          subtitle: isBn ? 'অফিসিয়াল হোয়াটসঅ্যাপ কমিউনিটি প্রচার ও মেম্বার জয়েনিং' : 'Join and invite members to official promotional channels',
          icon: <MessageCircle className="w-8 h-8 text-emerald-600" />,
          category: isBn ? 'সোশ্যাল ইনকাম' : 'Social Income'
        };
      case 'telegram_task':
        return {
          title: isBn ? 'টেলিগ্রাম চ্যানেল জয়েন' : 'Telegram Channel Tasks',
          subtitle: isBn ? 'স্পন্সরড টেলিগ্রাম চ্যানেল ও গ্রুপে জয়েন করে পুরস্কৃত হোন' : 'Join sponsored telegram groups and channels',
          icon: <Send className="w-8 h-8 text-sky-500" />,
          category: isBn ? 'সোশ্যাল ইনকাম' : 'Social Income'
        };
      default:
        return {
          title: isBn ? 'সার্ভিস অপশন' : 'Service Option',
          subtitle: isBn ? 'এই সার্ভিসটি দ্রুত লাইভ হতে যাচ্ছে' : 'This service is coming very soon',
          icon: <Sparkles className="w-8 h-8 text-sky-500" />,
          category: isBn ? 'ইনকাম হাব' : 'Income Hub'
        };
    }
  };

  const meta = getModalMeta(activeIncomeModal);

  return (
    <div 
      id="income-action-full-page"
      className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-y-auto animate-in fade-in duration-200"
    >
      {/* DIRECT PAGE TOP APP BAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={handleClose} 
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-1 rounded-lg">
                {meta.category}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Full Page Body */}
      <main className="flex-1 w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 text-center space-y-4 flex flex-col items-center">
          <div className="w-18 h-18 rounded-3xl bg-sky-50 border border-sky-200/80 flex items-center justify-center shadow-xs">
            {meta.icon}
          </div>

          <div className="space-y-1.5">
            <span className="inline-block px-3.5 py-1 bg-sky-500 text-white font-black text-xs rounded-full uppercase tracking-wider shadow-xs">
              Coming soon ...
            </span>
            <h3 className="font-black text-lg text-gray-900 pt-1">
              {meta.title}
            </h3>
            <p className="text-xs text-gray-600 font-semibold max-w-xs mx-auto leading-relaxed">
              {meta.subtitle}
            </p>
          </div>

          {/* Status info box */}
          <div className="w-full bg-sky-50/70 border border-sky-200/70 rounded-2xl p-3.5 text-left text-xs space-y-1">
            <div className="flex items-center gap-2 font-black text-gray-900">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>{isBn ? 'স্ট্যাটাস: ফিচার প্রস্তুতি চলমান' : 'Status: Feature in preparation'}</span>
            </div>
            <p className="text-[11px] text-sky-950/80 font-medium pl-6 leading-normal">
              {isBn 
                ? 'এই অপশনটির কাজ খুব শীঘ্রই লাইভ করা হবে। সিস্টেম আপগ্রেড শেষ হওয়া পর্যন্ত অপেক্ষা করুন।'
                : 'This service will be made live shortly. Thank you for your patience while we complete setup.'}
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="w-full space-y-2 pt-1">
            <button
              onClick={handleClose}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white font-black rounded-2xl text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isBn ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
            </button>

            {isAuthorizedAdmin && (
              <button
                onClick={() => {
                  handleClose();
                  setIsAdminDashboardOpen(true);
                }}
                className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-black rounded-2xl text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>{isBn ? 'অ্যাডমিন: কাজ পোস্ট বা কন্ট্রোল করুন' : 'Admin: Post or Control Jobs'}</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncomeActionModals;
