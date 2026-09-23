import React from 'react';
import { Mail, Instagram, MessageCircle, Send, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

export const SpecialIncomeSection: React.FC = () => {
  const { setActiveIncomeModal, language, user, systemSettings } = useApp();
  const isBn = language === 'bn';

  const cfg = systemSettings?.specialSocialConfig;
  const isDepositRequired = cfg?.depositRequired ?? true;
  const hasAccess = Boolean(user.role === 'admin' || user.specialSocialAccess || !isDepositRequired);

  const handleItemClick = (targetModal: string) => {
    if (!hasAccess) {
      setActiveIncomeModal('special_social_deposit_required');
    } else {
      setActiveIncomeModal(targetModal);
    }
  };

  const specialItems = [
    {
      id: 'gmail_task',
      title: isBn ? 'জিমেইল' : 'Gmail Task',
      subtitle: isBn ? '৳৫-১০ / একাউন্ট' : '৳5-10 / account',
      icon: <Mail className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-red-50 hover:bg-red-100 border-red-200/80',
      iconBg: 'bg-red-100',
      action: () => handleItemClick('gmail_task')
    },
    {
      id: 'instagram_task',
      title: isBn ? 'ইনস্টাগ্রাম' : 'Instagram',
      subtitle: isBn ? '৳১-৩ / ফলো' : '৳1-3 / follow',
      icon: <Instagram className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-pink-50 hover:bg-pink-100 border-pink-200/80',
      iconBg: 'bg-pink-100',
      action: () => handleItemClick('instagram_task')
    },
    {
      id: 'whatsapp_task',
      title: isBn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp',
      subtitle: isBn ? '৳২-৫ / শেয়ার' : '৳2-5 / share',
      icon: <MessageCircle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200/80',
      iconBg: 'bg-emerald-100',
      action: () => handleItemClick('whatsapp_task')
    },
    {
      id: 'telegram_task',
      title: isBn ? 'টেলিগ্রাম' : 'Telegram',
      subtitle: isBn ? '৳১-৪ / জয়েন' : '৳1-4 / join',
      icon: <Send className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-200" />,
      bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200/80',
      iconBg: 'bg-blue-100',
      action: () => handleItemClick('telegram_task')
    }
  ];

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-sky-500 fill-sky-400 animate-bounce-subtle" />
          <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
            {isBn ? 'বিশেষ সোশ্যাল ইনকাম' : 'Special Social Income'}
          </h3>
        </div>
        <span className="text-[10.5px] font-bold text-gray-500">
          {isBn ? 'মাইক্রো টাস্ক' : 'Micro Tasks'}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2 sm:gap-3">
        {specialItems.map((item) => (
          <motion.button
            key={item.id}
            id={`special-income-${item.id}`}
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
              <span className="text-[9.5px] sm:text-[10px] font-bold text-gray-600 block truncate mt-0.5">
                {item.subtitle}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SpecialIncomeSection;
