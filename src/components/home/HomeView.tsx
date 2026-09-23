import React from 'react';
import Header from '../layout/Header';
import ProfileVerificationBanner from './ProfileVerificationBanner';
import PromoBannersSlider from './PromoBannersSlider';
import CompactProductsCarousel from './CompactProductsCarousel';
import JoinGroupsSection from './JoinGroupsSection';
import EasyIncomeGrid from './EasyIncomeGrid';
import FeaturedProductsSlider from './FeaturedProductsSlider';
import SpecialIncomeSection from './SpecialIncomeSection';
import TargetBonusSection from './TargetBonusSection';
import RechargeResellingSection from './RechargeResellingSection';
import OtherServicesSection from './OtherServicesSection';
import { useApp } from '../../context/AppContext';

export const HomeView: React.FC = () => {
  const { systemSettings } = useApp();
  const toggles = (systemSettings?.featureToggles || {}) as Record<string, boolean>;

  return (
    <div className="min-h-full bg-[#F5F6F8] pb-32 sm:pb-36">
      {/* 1. Golden Yellow Responsive Header */}
      <Header />

      {/* Main Content Container with max width and responsive padding */}
      <div className="w-full max-w-5xl lg:max-w-6xl mx-auto px-2.5 sm:px-6 py-3 sm:py-5 space-y-3 sm:space-y-5">
        {/* 1. Dynamic Admin-Managed Promotional Banners & Posters (সর্বপ্রথম ব্যানার) */}
        <PromoBannersSlider />

        {/* 2. Compact Auto-Sliding Products (হালকা ছোট, দাম ছাড়া, ছবি ও অর্ধেক টাইটেল) */}
        <CompactProductsCarousel />

        {/* 3. Verification Alert Banner */}
        {toggles.kyc_required !== false && (
          <ProfileVerificationBanner />
        )}

        {/* 4. Join Official Groups Section */}
        {toggles.community_groups !== false && (
          <JoinGroupsSection />
        )}

        {/* 5. Easy Income Grid (Admin controlled options & buttons) */}
        <EasyIncomeGrid />

        {/* 6. Featured Products Reselling Slider */}
        {toggles.reselling !== false && (
          <FeaturedProductsSlider />
        )}

        {/* 6. Special Income Section (Social Tasks) */}
        {toggles.special_income !== false && (
          <SpecialIncomeSection />
        )}

        {/* 7. Target Bonus Section */}
        {toggles.target_bonus !== false && (
          <TargetBonusSection />
        )}

        {/* 8. Recharge & Reselling Section */}
        {(toggles.recharge !== false || toggles.reselling !== false) && (
          <RechargeResellingSection />
        )}

        {/* 9. Other Services Section */}
        <OtherServicesSection />
      </div>
    </div>
  );
};

export default HomeView;
