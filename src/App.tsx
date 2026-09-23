import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import MobileFrame from './components/layout/MobileFrame';

import BottomNav from './components/layout/BottomNav';
import SideDrawer from './components/layout/SideDrawer';
import NotificationsModal from './components/layout/NotificationsModal';
import SettingsModal from './components/layout/SettingsModal';
import { AuthView } from './components/auth/AuthView';

import HomeView from './components/home/HomeView';
import ShopView from './components/shop/ShopView';
import MicroJobsView from './components/microjobs/MicroJobsView';
import ProfileView from './components/profile/ProfileView';
import WalletView from './components/wallet/WalletView';

import ProductDetailModal from './components/shop/ProductDetailModal';
import ShopStorefrontModal from './components/shop/ShopStorefrontModal';
import CartModal from './components/shop/CartModal';
import CheckoutModal from './components/shop/CheckoutModal';
import JobDetailModal from './components/microjobs/JobDetailModal';
import WalletModal from './components/wallet/WalletModal';
import RevenueAnalyticsModal from './components/wallet/RevenueAnalyticsModal';
import IncomeActionModals from './components/home/IncomeActionModals';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import DepositSuccessOverlay from './components/wallet/DepositSuccessOverlay';
import VerificationModal from './components/profile/VerificationModal';
import { NetworkModal } from './components/profile/NetworkModal';
import { LeaderboardModal } from './components/profile/LeaderboardModal';
import { PolicyAndAboutModal } from './components/modals/PolicyAndAboutModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const AppContent: React.FC = () => {
  const { 
    isLoggedIn,
    activeTab, 
    toastMessage, 
    isSettingsOpen, 
    setIsSettingsOpen,
    isVerificationModalOpen,
    setIsVerificationModalOpen,
    isNetworkModalOpen,
    setIsNetworkModalOpen,
    isLeaderboardOpen,
    setIsLeaderboardOpen,
    isPolicyModalOpen,
    setIsPolicyModalOpen,
    policyModalTab,
    viewingShopId,
    setViewingShopId
  } = useApp();

  // Save referral code from URL if present
  React.useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        localStorage.setItem('lg_pending_ref', ref.trim().toUpperCase());
      }
    } catch {}
  }, []);

  // If user is not logged in, enforce login/registration gate
  if (!isLoggedIn) {
    return (
      <MobileFrame>
        <div className="relative min-h-full">
          <AuthView />
          {/* Toast Notification Alert */}
          {toastMessage && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600/95 text-white px-4 py-2 rounded-full shadow-2xl backdrop-blur-md text-xs font-black flex items-center gap-2 animate-fade-in border border-yellow-400">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="relative min-h-full flex flex-col justify-between">
        {/* Main Tab Content */}
        <main className="flex-1 overflow-x-hidden">
          <div key={activeTab} className="animate-fade-in">
            {activeTab === 'home' && <HomeView />}
            {activeTab === 'shop' && <ShopView />}
            {activeTab === 'jobs' && <MicroJobsView />}
            {activeTab === 'profile' && <ProfileView />}
            {activeTab === 'wallet' && <WalletView />}
          </div>
        </main>

        {/* 4-Tab Bottom Navigation Bar */}
        <BottomNav />

        {/* Global Modals & Drawers */}
        <SideDrawer />
        <NotificationsModal />
        <ProductDetailModal />
        {viewingShopId && (
          <ShopStorefrontModal 
            shopId={viewingShopId} 
            onClose={() => setViewingShopId(null)} 
          />
        )}
        <CartModal />
        <CheckoutModal />
        <JobDetailModal />
        <RevenueAnalyticsModal />
        <WalletModal />
        <IncomeActionModals />
        <AdminDashboardModal />
        <DepositSuccessOverlay />
        {isVerificationModalOpen && <VerificationModal onClose={() => setIsVerificationModalOpen(false)} />}
        {isNetworkModalOpen && <NetworkModal onClose={() => setIsNetworkModalOpen(false)} />}
        {isLeaderboardOpen && <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />}
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        {isPolicyModalOpen && (
          <PolicyAndAboutModal
            initialTab={policyModalTab}
            onClose={() => setIsPolicyModalOpen(false)}
          />
        )}

        {/* Toast Notification Alert - highest z-index */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] bg-emerald-600/95 text-white px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md text-xs font-black flex items-center gap-2 animate-fade-in border border-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </MobileFrame>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
