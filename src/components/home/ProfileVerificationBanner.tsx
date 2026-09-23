import React from 'react';
import { ShieldAlert, Sparkles, ChevronRight, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

export const ProfileVerificationBanner: React.FC = () => {
  const { user, setIsVerificationModalOpen, language } = useApp();
  const isBn = language === 'bn';

  // ভেরিফাইড ইউজারদের সামনে এই ব্যানারটি সম্পূর্ণ গোপন থাকবে (Hidden for Verified Users)
  if (user.isVerified || user.verificationStatus === 'verified') {
    return null;
  }

  return (
    <div className="py-1">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsVerificationModalOpen(true)}
        className="relative overflow-hidden bg-gradient-to-r from-sky-500/15 via-sky-400/20 to-sky-500/15 border-2 border-sky-400/80 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      >
        {/* Animated Background Shimmer */}
        <motion.div
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'linear',
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none -skew-x-12"
        />

        <div className="flex items-center gap-3 sm:gap-4 relative z-10">
          {/* Animated Shield Icon with Pulse Ring */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, -4, 4, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: 'easeInOut',
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center shrink-0 shadow-md text-white border border-sky-300"
            >
              <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
            </motion.div>
            
            {/* Live Indicator Dot */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-gray-950 flex items-center gap-1.5">
                <span>{isBn ? 'প্রোফাইল ভেরিফিকেশন' : 'Profile Verification'}</span>
                <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin" style={{ animationDuration: '6s' }} />
              </h4>
              <span className="px-2 py-0.5 bg-sky-100 border border-sky-300 text-sky-950 text-[10px] font-extrabold rounded-md shadow-2xs">
                {isBn ? 'আন-ভেরিফাইড' : 'Unverified'}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-gray-800 font-semibold mt-0.5 leading-snug flex items-center gap-1">
              <Gift className="w-3 h-3 text-red-500 shrink-0" />
              <span>
                {isBn 
                  ? 'এখনই ভেরিফাই করে ফ্রি ৳২০ ইনস্ট্যান্ট বোনাস গ্রহণ করুন!' 
                  : 'Verify now & claim instant ৳20 bonus!'}
              </span>
            </p>
          </div>
        </div>

        {/* Animated Call-to-action Button */}
        <motion.button 
          id="home-verify-now-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsVerificationModalOpen(true);
          }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="relative z-10 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shrink-0 flex items-center gap-1 cursor-pointer border border-sky-300 animate-pulse-glow animate-btn-shimmer btn-anim"
        >
          <span>{isBn ? 'ভেরিফাই করুন' : 'Verify Now'}</span>
          <ChevronRight className="w-4 h-4 text-white stroke-[3] group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ProfileVerificationBanner;
