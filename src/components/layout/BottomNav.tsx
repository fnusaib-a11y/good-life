import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Home, ShoppingBag, Briefcase, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { AppTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cart, t } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.min(window.innerWidth - 24, 430);
    }
    return 380;
  });

  // Track the exact pixel width of the floating navigation bar
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    window.addEventListener('resize', updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = useMemo(() => [
    {
      id: 'home' as AppTab,
      label: t.navHome,
      icon: (isActive: boolean) => (
        <Home className={`transition-transform duration-200 ${isActive ? 'w-6 h-6 stroke-[2.2]' : 'w-5 h-5 stroke-[1.9]'}`} />
      )
    },
    {
      id: 'shop' as AppTab,
      label: t.navShop,
      icon: (isActive: boolean) => (
        <div className="relative flex items-center justify-center">
          <ShoppingBag className={`transition-transform duration-200 ${isActive ? 'w-6 h-6 stroke-[2.2]' : 'w-5 h-5 stroke-[1.9]'}`} />
          {cartCount > 0 && (
            <span className={`absolute -top-1.5 -right-2 text-[9px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs ${
              isActive 
                ? 'bg-gray-950 text-[var(--brand-secondary)] ring-1.5 ring-white' 
                : 'bg-[var(--brand-secondary)] text-gray-950 ring-1 ring-zinc-900'
            }`}>
              {cartCount}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'jobs' as AppTab,
      label: t.navJobs,
      icon: (isActive: boolean) => (
        <div className="relative flex items-center justify-center">
          <Briefcase className={`transition-transform duration-200 ${isActive ? 'w-6 h-6 stroke-[2.2]' : 'w-5 h-5 stroke-[1.9]'}`} />
          <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${
            isActive ? 'bg-sky-300 ring-1.5 ring-white' : 'bg-sky-500 ring-1.5 ring-zinc-900'
          }`} />
        </div>
      )
    },
    {
      id: 'profile' as AppTab,
      label: t.navProfile,
      icon: (isActive: boolean) => (
        <User className={`transition-transform duration-200 ${isActive ? 'w-6 h-6 stroke-[2.2]' : 'w-5 h-5 stroke-[1.9]'}`} />
      )
    }
  ], [t, cartCount]);

  const activeIndex = Math.max(0, navItems.findIndex((item) => item.id === activeTab));

  // Geometry calculations: comfortable padding so the notch never touches the capsule edges
  const padX = Math.max(18, Math.min(26, containerWidth * 0.065));
  const usableWidth = containerWidth - padX * 2;
  const tabWidth = usableWidth / navItems.length;
  const activeCx = padX + (activeIndex + 0.5) * tabWidth;

  // Generate SVG path for the dark capsule bar with a wide, deep scoop (generous visible gap around the circle)
  const getNotchPath = (w: number, cx: number) => {
    const r = 24; // corner radius of capsule
    const yTop = 22; // top flat edge of capsule
    const yBottom = 78; // bottom flat edge of capsule
    const nw = Math.min(42, Math.max(36, tabWidth * 0.46)); // half-width of notch
    const nd = 60; // deep curve bottom (leaves a clear 16px visible gap below the 48px circle)

    return (
      `M 0,${yTop + r} ` +
      `A ${r},${r} 0 0,1 ${r},${yTop} ` +
      `H ${cx - nw} ` +
      `C ${cx - nw * 0.62},${yTop} ${cx - nw * 0.52},${nd} ${cx},${nd} ` +
      `C ${cx + nw * 0.52},${nd} ${cx + nw * 0.62},${yTop} ${cx + nw},${yTop} ` +
      `H ${w - r} ` +
      `A ${r},${r} 0 0,1 ${w},${yTop + r} ` +
      `V ${yBottom - r} ` +
      `A ${r},${r} 0 0,1 ${w - r},${yBottom} ` +
      `H ${r} ` +
      `A ${r},${r} 0 0,1 0,${yBottom - r} ` +
      `Z`
    );
  };

  const pathD = getNotchPath(containerWidth, activeCx);

  return (
    <nav className="fixed bottom-2 left-3 right-3 sm:bottom-4 max-w-md mx-auto z-50 select-none overflow-visible">
      <div 
        ref={containerRef}
        className="relative w-full h-[82px] flex items-end justify-center overflow-visible"
      >
        {/* 1. Animated SVG Notch Capsule Background with visible cutout gap */}
        <svg
          className="absolute inset-0 w-full h-[82px] overflow-visible pointer-events-none drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.22)]"
          viewBox={`0 0 ${containerWidth} 82`}
        >
          <motion.path
            d={pathD}
            fill="#0A2540"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="1"
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 26,
              mass: 0.8,
            }}
          />
        </svg>

        {/* 2. Elevated Floating Active Circle in Sky Blue */}
        <motion.div
          animate={{
            x: activeCx - 24, // 24 is half of 48px circle width
            y: -5,            // Floating prominently above the bar, leaving a clear 17px gap to notch bottom
          }}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 26,
            mass: 0.8,
          }}
          className="absolute top-0 left-0 w-12 h-12 rounded-full bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center text-white shadow-[0_10px_22px_-2px_rgba(14,165,233,0.55),0_4px_10px_rgba(0,0,0,0.35)] z-20 pointer-events-none ring-2 ring-white/60"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative flex items-center justify-center text-white"
            >
              {navItems[activeIndex]?.icon(true)}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 3. Interactive Tab Buttons Row */}
        <div 
          className="absolute inset-x-0 bottom-[4px] h-[54px] flex items-center z-10"
          style={{
            paddingLeft: `${padX}px`,
            paddingRight: `${padX}px`,
          }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`bottom-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className="relative flex-1 h-full flex flex-col items-center justify-center cursor-pointer select-none group focus:outline-hidden py-1 active:scale-90 transition-transform duration-150"
              >
                {/* Inactive Icon (Smoothly hidden when active, since floating circle takes over) */}
                <div 
                  className={`transition-all duration-300 flex items-center justify-center ${
                    isActive 
                      ? 'opacity-0 scale-50 pointer-events-none -translate-y-2' 
                      : 'opacity-80 group-hover:opacity-100 group-hover:scale-110 text-zinc-400 group-hover:text-white translate-y-0'
                  }`}
                >
                  {item.icon(false)}
                </div>

                {/* Bengali Label on the baseline in brand colors */}
                <span 
                  className={`text-[10px] sm:text-[10.5px] font-bold tracking-tight transition-all duration-300 ${
                    isActive 
                      ? 'text-[var(--brand-secondary)] font-black scale-105 translate-y-0.5' 
                      : 'text-zinc-400 group-hover:text-zinc-200 font-medium translate-y-0 mt-0.5'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active Micro Pulse Dot in brand yellow underneath the label */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-secondary)] mt-0.5 shadow-xs shadow-[var(--brand-secondary)] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
