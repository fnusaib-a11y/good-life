import React from 'react';
import { Menu, Bell, ShoppingCart, ShieldCheck, Wallet as WalletIcon, Home, ShoppingBag, Briefcase, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppTab } from '../../types';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack, onBack, rightAction }) => {
  const { 
    activeTab,
    setActiveTab,
    setIsSideDrawerOpen, 
    unreadNotificationCount, 
    cart, 
    setIsCartOpen,
    setIsWalletOpen,
    setIsNotificationsOpen,
    wallet,
    language,
    t
  } = useApp();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const desktopNavItems: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.navHome, icon: <Home className="w-4 h-4" /> },
    { id: 'shop', label: t.navShop, icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'jobs', label: t.navJobs, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'profile', label: t.navProfile, icon: <User className="w-4 h-4" /> },
  ];

  return (
      <header className="sticky top-0 z-30 w-full bg-[var(--primary)] text-white shadow-[0_4px_20px_rgba(2,132,199,0.25)] rounded-b-[24px] sm:rounded-b-[30px] transition-colors duration-200">
      <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5">
        {/* Left: Hamburger or Back + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showBack ? (
            <button 
              id="header-back-btn"
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-white/20 btn-anim text-white cursor-pointer"
              aria-label="Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <button 
              id="header-menu-btn"
              onClick={() => setIsSideDrawerOpen(true)}
              className="p-1.5 rounded-full hover:bg-white/20 btn-anim text-white cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6 stroke-[2.4] icon-bounce text-white" />
            </button>
          )}

          {/* Logo / Title */}
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 text-left btn-anim cursor-pointer"
          >
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white flex items-center gap-1 font-['Hind_Siliguri',sans-serif]">
              {title || t.headerTitle}
            </span>
          </button>
        </div>


        {/* Right: Quick actions (Wallet chip, Notifications, Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {rightAction ? (
            rightAction
          ) : (
            <>
              {/* Notification Bell with Badge */}
              <button
                id="header-notifications-btn"
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-1.5 sm:p-2 rounded-full hover:bg-white/20 btn-anim text-white cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 stroke-[2.2] icon-bounce text-white" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
