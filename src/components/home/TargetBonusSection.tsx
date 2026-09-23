import React, { useState } from 'react';
import { 
  Trophy, 
  Calendar, 
  CalendarDays, 
  CalendarRange, 
  Infinity as InfinityIcon, 
  Award, 
  Medal, 
  CheckCircle2, 
  X, 
  Gift 
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { TargetBonus } from '../../types';

export const TargetBonusSection: React.FC = () => {
  const { bonuses, claimBonus, language } = useApp();
  const [selectedBonus, setSelectedBonus] = useState<TargetBonus | null>(null);
  const isBn = language === 'bn';

  const getBonusIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="w-5 h-5 text-cyan-600" />;
      case 'weekly': return <CalendarDays className="w-5 h-5 text-purple-600" />;
      case 'monthly': return <CalendarRange className="w-5 h-5 text-amber-600" />;
      case 'yearly': return <Trophy className="w-5 h-5 text-red-600" />;
      case 'lifetime': return <InfinityIcon className="w-5 h-5 text-blue-600" />;
      case 'welcome': return <Gift className="w-5 h-5 text-sky-600" />;
      case 'leadership': return <Award className="w-5 h-5 text-orange-600" />;
      case 'rank': return <Medal className="w-5 h-5 text-pink-600" />;
      default: return <Gift className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBonusBg = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-cyan-50 border-cyan-200/80';
      case 'weekly': return 'bg-purple-50 border-purple-200/80';
      case 'monthly': return 'bg-amber-50 border-amber-200/80';
      case 'yearly': return 'bg-red-50 border-red-200/80';
      case 'lifetime': return 'bg-blue-50 border-blue-200/80';
      case 'welcome': return 'bg-sky-50 border-sky-200/80';
      case 'leadership': return 'bg-orange-50 border-orange-200/80';
      case 'rank': return 'bg-pink-50 border-pink-200/80';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTranslatedTitle = (bonus: TargetBonus) => {
    if (isBn) return bonus.title;
    switch (bonus.type) {
      case 'daily': return 'Daily Bonus';
      case 'weekly': return 'Weekly Bonus';
      case 'monthly': return 'Monthly Bonus';
      case 'yearly': return 'Yearly Bonus';
      case 'lifetime': return 'Lifetime Bonus';
      case 'welcome': return 'Welcome Bonus';
      case 'leadership': return 'Leader Bonus';
      case 'rank': return 'Rank Bonus';
      default: return bonus.title;
    }
  };

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-sky-500 fill-sky-400" />
          <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
            {isBn ? 'টার্গেট বোনাস' : 'Target Bonuses'}
          </h3>
        </div>
        <span className="text-[10.5px] font-bold text-sky-700">
          {isBn ? 'ক্লেইম রিওয়ার্ডস' : 'Claim Rewards'}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
        {bonuses.map((bonus) => {
          return (
            <motion.button
              key={bonus.id}
              id={`target-bonus-${bonus.type}`}
              onClick={() => setSelectedBonus(bonus)}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.90 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-lg text-center relative cursor-pointer group btn-anim ${getBonusBg(bonus.type)}`}
            >
              {bonus.isClaimed && (
                <div className="absolute top-1 right-1 bg-sky-500 text-white rounded-full p-0.5 shadow-xs">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              )}

              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white flex items-center justify-center shadow-2xs mb-1 shrink-0 transition-transform duration-250 group-hover:scale-115 group-hover:rotate-6 icon-bounce">
                {getBonusIcon(bonus.type)}
              </div>

              <div className="w-full">
                <span className="text-[10.5px] sm:text-xs font-black text-gray-900 block truncate group-hover:text-sky-800 transition-colors">
                  {getTranslatedTitle(bonus)}
                </span>
                <span className="text-[9.5px] sm:text-[10px] font-extrabold text-sky-800 block truncate mt-0.5 animate-gentle-pulse">
                  ৳{bonus.rewardAmount}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Bonus Details / Coming Soon Modal */}
      {selectedBonus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 relative text-center">
            <button 
              onClick={() => setSelectedBonus(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-3xl bg-sky-100 flex items-center justify-center shadow-xs">
              {getBonusIcon(selectedBonus.type)}
            </div>

            <div>
              <span className="px-3 py-1 bg-sky-100 text-sky-900 font-extrabold text-xs rounded-full uppercase tracking-wider">
                Coming soon ...
              </span>
              <h3 className="font-black text-lg text-gray-900 mt-2">
                {getTranslatedTitle(selectedBonus)}
              </h3>
              <p className="text-xs font-semibold text-gray-500 mt-1">
                {selectedBonus.description}
              </p>
            </div>

            <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-3.5 text-left">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-1">
                <span>পুরস্কার রিওয়ার্ড:</span>
                <span className="text-sky-700 font-black">৳{selectedBonus.rewardAmount}</span>
              </div>
              <p className="text-[11px] text-sky-900 font-medium">
                এই বোনাস সিস্টেমটি দ্রুত চালু হতে যাচ্ছে। খুব শীঘ্রই আপনি আপনার টার্গেট পূরণ করে নগদ রিওয়ার্ড ক্লেইম করতে পারবেন।
              </p>
            </div>

            <button
              onClick={() => setSelectedBonus(null)}
              className="w-full py-3 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-black rounded-2xl text-xs shadow-md active:scale-95 transition-all"
            >
              ঠিক আছে / ফিরে যান
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetBonusSection;
