import React from 'react';
import { Send, Users, Facebook, Youtube } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

export const JoinGroupsSection: React.FC = () => {
  const { groupLinks, language } = useApp();
  const isBn = language === 'bn';

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'telegram':
        return <Send className="w-5 h-5 text-[#0088cc] group-hover:scale-110 transition-transform duration-200" />;
      case 'community':
        return <Users className="w-5 h-5 text-[#7c3aed] group-hover:scale-110 transition-transform duration-200" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-[#1877f2] group-hover:scale-110 transition-transform duration-200" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-[#ff0000] group-hover:scale-110 transition-transform duration-200" />;
      default:
        return <Users className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform duration-200" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'telegram':
        return 'bg-[#e0f2fe] border-[#bae6fd] hover:bg-[#bae6fd]';
      case 'community':
        return 'bg-[#f3e8ff] border-[#e9d5ff] hover:bg-[#e9d5ff]';
      case 'facebook':
        return 'bg-[#e0e7ff] border-[#c7d2fe] hover:bg-[#c7d2fe]';
      case 'youtube':
        return 'bg-[#ffe4e6] border-[#fecdd3] hover:bg-[#fecdd3]';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getBtnStyle = (type: string) => {
    switch (type) {
      case 'telegram':
        return 'bg-[#0088cc] text-white shadow-[#0088cc]/30';
      case 'community':
        return 'bg-[#7c3aed] text-white shadow-[#7c3aed]/30';
      case 'facebook':
        return 'bg-[#1877f2] text-white shadow-[#1877f2]/30';
      case 'youtube':
        return 'bg-[#ff0000] text-white shadow-[#ff0000]/30';
      default:
        return 'bg-gray-800 text-white';
    }
  };

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight flex items-center gap-1.5">
          <span>{isBn ? 'সকল গ্রুপে জয়েন করুন' : 'Join Official Groups'}</span>
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
        </h3>
        <span className="text-[10.5px] font-bold text-gray-500">
          {isBn ? 'অফিসিয়াল কমিউনিটি' : 'Official Channels'}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2 sm:gap-3">
        {groupLinks.map((group) => {
          const groupTitle = !isBn 
            ? (group.type === 'telegram' ? 'Telegram' : group.type === 'community' ? 'WhatsApp' : group.type === 'facebook' ? 'Facebook' : 'YouTube')
            : group.name;

          return (
            <motion.a
              key={group.id}
              id={`group-link-${group.type}`}
              href={group.url}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -4, scale: 1.04 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-lg text-center group cursor-pointer btn-anim ${getBgColor(group.type)}`}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white flex items-center justify-center shadow-xs shrink-0 mb-1.5 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6">
                {getGroupIcon(group.type)}
              </div>

              <div className="flex flex-col items-center w-full mb-2">
                <span className="text-[11.5px] sm:text-xs font-black text-gray-900 leading-tight truncate w-full">
                  {groupTitle}
                </span>
              </div>

              <span className={`w-full py-1.5 px-2 rounded-xl text-[10px] sm:text-[11px] font-black shadow-xs flex items-center justify-center animate-gentle-pulse animate-btn-shimmer group-hover:scale-105 transition-transform ${getBtnStyle(group.type)}`}>
                {isBn ? 'জয়েন' : 'Join'}
              </span>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

export default JoinGroupsSection;
