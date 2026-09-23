import React from 'react';
import { 
  Eye, 
  HelpCircle, 
  Keyboard, 
  Megaphone, 
  Briefcase, 
  PlusCircle, 
  GraduationCap, 
  Laptop
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

export const EasyIncomeGrid: React.FC = () => {
  const { setActiveTab, setActiveIncomeModal, systemSettings, language } = useApp();
  const isBn = language === 'bn';

  const allItems = [
    {
      id: 'ads_view',
      title: isBn ? 'অ্যাডস ভিউ' : 'Watch Ads',
      reward: `৳${systemSettings.featureRewards?.ads_view || 0.5}`,
      icon: <Eye className="w-5 h-5 text-sky-700" />,
      bgColor: 'bg-sky-50 hover:bg-sky-100 border-sky-200/80',
      iconBg: 'bg-sky-100',
      action: () => setActiveIncomeModal('ads_view')
    },
    {
      id: 'quiz_job',
      title: isBn ? 'কুইজ খেলে আয়' : 'Quiz & Earn',
      reward: `৳${systemSettings.featureRewards?.quiz_job || 1.0}`,
      icon: <HelpCircle className="w-5 h-5 text-purple-700" />,
      bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200/80',
      iconBg: 'bg-purple-100',
      action: () => setActiveIncomeModal('quiz_job')
    },
    {
      id: 'typing_job',
      title: isBn ? 'টাইপিং জব' : 'Typing Job',
      reward: `৳${systemSettings.featureRewards?.typing_job || 1.5}`,
      icon: <Keyboard className="w-5 h-5 text-blue-700" />,
      bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200/80',
      iconBg: 'bg-blue-100',
      action: () => setActiveIncomeModal('typing_job')
    },
    {
      id: 'ad_marketing',
      title: isBn ? 'অ্যাড মার্কেটিং' : 'Ad Marketing',
      reward: `৳${systemSettings.featureRewards?.ad_marketing || 2.0}`,
      icon: <Megaphone className="w-5 h-5 text-amber-700" />,
      bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200/80',
      iconBg: 'bg-amber-100',
      action: () => setActiveIncomeModal('ad_marketing')
    },
    {
      id: 'micro_job',
      title: isBn ? 'মাইক্রো জব' : 'Micro Jobs',
      reward: 'ইনস্ট্যান্ট',
      icon: <Briefcase className="w-5 h-5 text-rose-700" />,
      bgColor: 'bg-rose-50 hover:bg-rose-100 border-rose-200/80',
      iconBg: 'bg-rose-100',
      action: () => setActiveTab('jobs')
    },
    {
      id: 'job_post',
      title: isBn ? 'জব পোস্ট' : 'Post a Job',
      reward: 'কাজ দিন',
      icon: <PlusCircle className="w-5 h-5 text-indigo-700" />,
      bgColor: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200/80',
      iconBg: 'bg-indigo-100',
      action: () => setActiveIncomeModal('job_post')
    },
    {
      id: 'skill_course',
      title: isBn ? 'স্কিল কোর্স' : 'Skill Courses',
      reward: 'সার্টিফিকেট',
      icon: <GraduationCap className="w-5 h-5 text-teal-700" />,
      bgColor: 'bg-teal-50 hover:bg-teal-100 border-teal-200/80',
      iconBg: 'bg-teal-100',
      action: () => setActiveIncomeModal('skill_course')
    },
    {
      id: 'freelancing',
      title: isBn ? 'ফ্রিল্যান্সিং' : 'Freelancing',
      reward: 'সার্ভিস',
      icon: <Laptop className="w-5 h-5 text-cyan-700" />,
      bgColor: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200/80',
      iconBg: 'bg-cyan-100',
      action: () => setActiveIncomeModal('freelancing')
    }
  ];

  // Dynamic Admin Controlled filter
  const items = allItems.filter(item => {
    const key = item.id as keyof typeof systemSettings.featureToggles;
    if (systemSettings.featureToggles && systemSettings.featureToggles[key] !== undefined) {
      return systemSettings.featureToggles[key];
    }
    return true;
  });

  if (items.length === 0) return null;

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
          {isBn ? 'সহজ ইনকাম' : 'Easy Income'}
        </h3>
        <span className="text-[10.5px] font-bold text-gray-500">
          {isBn ? `${items.length}টি দ্রুত আয়ের মাধ্যম সক্রিয়` : `${items.length} Instant Earning Options`}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
        {items.map((item) => (
          <motion.button
            key={item.id}
            id={`easy-income-${item.id}`}
            onClick={item.action}
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.90 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-lg text-center relative cursor-pointer group btn-anim ${item.bgColor}`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-2xs mb-1 shrink-0 transition-transform duration-250 group-hover:scale-115 group-hover:-rotate-3 icon-bounce`}>
              {item.icon}
            </div>
            <span className="text-[11px] sm:text-xs font-black text-gray-900 leading-tight">
              {item.title}
            </span>
            {item.reward && (
              <span className="text-[9px] font-black text-sky-800 bg-sky-100/90 px-1.5 py-0.5 rounded-md mt-0.5 animate-gentle-pulse group-hover:scale-105 transition-transform">
                {item.reward}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default EasyIncomeGrid;
