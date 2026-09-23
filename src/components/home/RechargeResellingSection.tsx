import React from 'react';
import { Smartphone, Zap, ShoppingBag, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

export const RechargeResellingSection: React.FC = () => {
  const { setActiveTab, setActiveIncomeModal, language } = useApp();
  const isBn = language === 'bn';

  const items = [
    {
      id: 'recharge',
      title: isBn ? 'রিচার্জ' : 'Recharge',
      subtitle: isBn ? 'ইনস্ট্যান্ট মোবাইল ব্যালেন্স' : 'Instant Top-up',
      icon: <Smartphone className="w-5 h-5 text-sky-700 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-sky-50 hover:bg-sky-100 border-sky-200/80',
      iconBg: 'bg-sky-100',
      action: () => setActiveIncomeModal('mobile_recharge')
    },
    {
      id: 'drive_offer',
      title: isBn ? 'ড্রাইভ অফার' : 'Drive Offer',
      subtitle: isBn ? '৫০% পর্যন্ত ক্যাশব্যাক প্যাক' : 'Up to 50% Cashback',
      icon: <Zap className="w-5 h-5 text-amber-700 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200/80',
      iconBg: 'bg-amber-100',
      action: () => setActiveIncomeModal('drive_offer')
    },
    {
      id: 'reselling',
      title: isBn ? 'রিসেলিং' : 'Reselling',
      subtitle: isBn ? 'জিরো ইনভেস্টমেন্ট ব্যবসা' : 'Zero Investment Shop',
      icon: <ShoppingBag className="w-5 h-5 text-purple-700 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200/80',
      iconBg: 'bg-purple-100',
      action: () => setActiveTab('shop')
    },
    {
      id: 'vendor_apply',
      title: isBn ? 'ভেন্ডর হন' : 'Become Vendor',
      subtitle: isBn ? 'আপনার পণ্য বিক্রি করুন' : 'Sell Your Products',
      icon: <Store className="w-5 h-5 text-blue-700 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200/80',
      iconBg: 'bg-blue-100',
      action: () => setActiveIncomeModal('vendor_apply')
    }
  ];

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
          {isBn ? 'রিচার্জ ও রিসেলিং হাব' : 'Top-up & Reselling Hub'}
        </h3>
        <span className="text-[10.5px] font-bold text-gray-500">
          {isBn ? 'ব্যবসা ও অফার' : 'Business & Packs'}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2 sm:gap-3">
        {items.map((item) => (
          <motion.button
            key={item.id}
            id={`recharge-resell-${item.id}`}
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

export default RechargeResellingSection;
