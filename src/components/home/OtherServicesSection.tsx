import React from 'react';
import { FileText, TrendingUp, Award, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

export const OtherServicesSection: React.FC = () => {
  const { 
    setActiveIncomeModal, 
    setIsLeaderboardOpen, 
    setIsRevenueOpen,
    language 
  } = useApp();
  const isBn = language === 'bn';

  const items = [
    {
      id: 'caption_tool',
      title: isBn ? 'ক্যাপশন রাইটার' : 'Post Caption',
      subtitle: isBn ? 'মার্কেটিং কনটেন্ট ও পোস্ট' : 'Marketing Copy',
      icon: <FileText className="w-5 h-5 text-indigo-700 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200/80',
      iconBg: 'bg-indigo-100',
      action: () => setActiveIncomeModal('ai_tools')
    },
    {
      id: 'umrah_offer',
      title: isBn ? 'ফ্রি ওমরাহ হজ' : 'Free Umrah Gift',
      subtitle: isBn ? 'টপ পারফর্মার অ্যাওয়ার্ড' : 'Top Performer Gift',
      icon: <Moon className="w-5 h-5 text-sky-700 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-sky-50 hover:bg-sky-100 border-sky-200/80',
      iconBg: 'bg-sky-100',
      action: () => setActiveIncomeModal('umrah_gift')
    },
    {
      id: 'weekly_performance',
      title: isBn ? 'সাপ্তাহিক রিপোর্ট' : 'Weekly Report',
      subtitle: isBn ? 'আয় ও টিম এনালিটিক্স' : 'Income & Analytics',
      icon: <TrendingUp className="w-5 h-5 text-blue-700 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200/80',
      iconBg: 'bg-blue-100',
      action: () => setIsRevenueOpen(true)
    },
    {
      id: 'leaderboard',
      title: isBn ? 'লিডারবোর্ড' : 'Leaderboard',
      subtitle: isBn ? 'সেরা আর্নারদের তালিকা' : 'Top Earners List',
      icon: <Award className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200/80',
      iconBg: 'bg-amber-100',
      action: () => setIsLeaderboardOpen(true)
    }
  ];

  return (
    <div className="py-1 pb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
          {isBn ? 'অন্যান্য সুবিধাসমূহ' : 'Other Features'}
        </h3>
        <span className="text-[10.5px] font-bold text-gray-500">
          {isBn ? 'রিওয়ার্ডস ও টুলস' : 'Rewards & Tools'}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2 sm:gap-3">
        {items.map((item) => (
          <motion.button
            key={item.id}
            id={`other-service-${item.id}`}
            onClick={item.action}
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.90 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-lg text-center group cursor-pointer btn-anim ${item.bgColor}`}
          >
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-2xs mb-1 shrink-0 transition-transform duration-250 group-hover:scale-115 group-hover:rotate-6 icon-bounce`}>
              {item.icon}
            </div>
            <div className="w-full">
              <span className="text-[11.5px] sm:text-xs font-black text-gray-900 block truncate group-hover:text-sky-800 transition-colors">
                {item.title}
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-600 font-semibold block truncate mt-0.5">
                {item.subtitle}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default OtherServicesSection;
