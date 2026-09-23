import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  CheckCircle2, 
  RotateCcw, 
  Eye, 
  ExternalLink, 
  ShieldCheck, 
  Sliders, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Copy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageBannerAdsConfig } from '../../types';
import { PersistentAdBanner } from '../common/PersistentAdBanner';

const DEFAULT_BANNER_CONFIG: PageBannerAdsConfig = {
  enabled: true,
  adKey: 'b87ae65b2057f8d1935a8a65f245a61e',
  scriptUrl: 'https://www.highrevenueformat.com/b87ae65b2057f8d1935a8a65f245a61e/invoke.js',
  width: 728,
  height: 90,
  showTopBanner: true,
  showBottomBanner: true,
  pages: {
    ads_view: true,
    quiz_job: true,
    typing_job: true,
    ad_marketing: true
  }
};

export const AdminBannerAdsCard: React.FC = () => {
  const { systemSettings, updateSystemSettings, showToast, isBn } = useApp();

  const currentConfig: PageBannerAdsConfig = systemSettings.pageBannerAds || DEFAULT_BANNER_CONFIG;

  const [enabled, setEnabled] = useState<boolean>(currentConfig.enabled ?? true);
  const [adKey, setAdKey] = useState<string>(currentConfig.adKey || 'b87ae65b2057f8d1935a8a65f245a61e');
  const [scriptUrl, setScriptUrl] = useState<string>(
    currentConfig.scriptUrl || 'https://www.highrevenueformat.com/b87ae65b2057f8d1935a8a65f245a61e/invoke.js'
  );
  const [width, setWidth] = useState<number>(currentConfig.width || 728);
  const [height, setHeight] = useState<number>(currentConfig.height || 90);
  const [showTopBanner, setShowTopBanner] = useState<boolean>(currentConfig.showTopBanner ?? true);
  const [showBottomBanner, setShowBottomBanner] = useState<boolean>(currentConfig.showBottomBanner ?? true);

  const [pageAdsView, setPageAdsView] = useState<boolean>(currentConfig.pages?.ads_view ?? true);
  const [pageQuizJob, setPageQuizJob] = useState<boolean>(currentConfig.pages?.quiz_job ?? true);
  const [pageTypingJob, setPageTypingJob] = useState<boolean>(currentConfig.pages?.typing_job ?? true);
  const [pageAdMarketing, setPageAdMarketing] = useState<boolean>(currentConfig.pages?.ad_marketing ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Sync state if systemSettings updates
  useEffect(() => {
    if (systemSettings.pageBannerAds) {
      const cfg = systemSettings.pageBannerAds;
      setEnabled(cfg.enabled ?? true);
      setAdKey(cfg.adKey || 'b87ae65b2057f8d1935a8a65f245a61e');
      setScriptUrl(cfg.scriptUrl || `https://www.highrevenueformat.com/${cfg.adKey || 'b87ae65b2057f8d1935a8a65f245a61e'}/invoke.js`);
      setWidth(cfg.width || 728);
      setHeight(cfg.height || 90);
      setShowTopBanner(cfg.showTopBanner ?? true);
      setShowBottomBanner(cfg.showBottomBanner ?? true);
      setPageAdsView(cfg.pages?.ads_view ?? true);
      setPageQuizJob(cfg.pages?.quiz_job ?? true);
      setPageTypingJob(cfg.pages?.typing_job ?? true);
      setPageAdMarketing(cfg.pages?.ad_marketing ?? true);
    }
  }, [systemSettings.pageBannerAds]);

  // When adKey changes, auto-update scriptUrl if it follows standard Adsterra format
  const handleAdKeyChange = (val: string) => {
    const trimmed = val.trim();
    setAdKey(trimmed);
    if (trimmed && (scriptUrl.includes('highrevenueformat.com') || !scriptUrl)) {
      setScriptUrl(`https://www.highrevenueformat.com/${trimmed}/invoke.js`);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newConfig: PageBannerAdsConfig = {
      enabled,
      adKey: adKey.trim() || 'b87ae65b2057f8d1935a8a65f245a61e',
      scriptUrl: scriptUrl.trim() || `https://www.highrevenueformat.com/${adKey.trim() || 'b87ae65b2057f8d1935a8a65f245a61e'}/invoke.js`,
      width: Number(width) || 728,
      height: Number(height) || 90,
      showTopBanner,
      showBottomBanner,
      pages: {
        ads_view: pageAdsView,
        quiz_job: pageQuizJob,
        typing_job: pageTypingJob,
        ad_marketing: pageAdMarketing
      }
    };

    try {
      updateSystemSettings({
        pageBannerAds: newConfig
      });

      // Also persist to server
      await fetch('/api/banner-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      }).catch(err => console.warn('Banner ads backend save note:', err));

      showToast(isBn ? 'ইনকাম পেজ ব্যানার এডস সেটিংস সংরক্ষিত হয়েছে!' : 'Banner ads settings saved successfully!');
    } catch (e) {
      showToast(isBn ? 'সংরক্ষণ করতে সমস্যা হয়েছে!' : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setEnabled(true);
    setAdKey('b87ae65b2057f8d1935a8a65f245a61e');
    setScriptUrl('https://www.highrevenueformat.com/b87ae65b2057f8d1935a8a65f245a61e/invoke.js');
    setWidth(728);
    setHeight(90);
    setShowTopBanner(true);
    setShowBottomBanner(true);
    setPageAdsView(true);
    setPageQuizJob(true);
    setPageTypingJob(true);
    setPageAdMarketing(true);
    showToast(isBn ? 'ইউজারের মূল Adsterra কোডে রিসেট করা হয়েছে।' : 'Reset to original user Adsterra key.');
  };

  return (
    <div id="admin-banner-ads-card" className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                {isBn ? 'ইনকাম পেজ ব্যানার এডস কন্ট্রোল (Adsterra / ৭২৮x৯০)' : 'Income Pages Persistent Banner Ads (Adsterra)'}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {enabled ? (isBn ? 'চালু আছে' : 'Active') : (isBn ? 'বন্ধ' : 'Disabled')}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {isBn 
                ? 'এডস ভিউ, কুইজ খেলে আয়, টাইপিং জব ও এড মার্কেটিং পেজে সার্বক্ষণিক উপরে ও নিচে ব্যানার বিজ্ঞাপন প্রদর্শন ও নিয়ন্ত্রণ' 
                : 'Manage persistent 728x90 top/bottom banners across all 4 income pages'}
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              enabled 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            {enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span>{enabled ? (isBn ? 'সকল ব্যানার চালু' : 'Banners Enabled') : (isBn ? 'সকল ব্যানার বন্ধ' : 'Banners Disabled')}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left Column: Script & Key Configuration */}
        <div className="space-y-4">
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-3">
            <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isBn ? 'Adsterra স্ক্রিপ্ট ও কি (Key) কনফিগারেশন' : 'Adsterra Script & Key Config'}</span>
            </h4>

            {/* Adsterra Key */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isBn ? 'Adsterra Ad Key (কি) *' : 'Adsterra Ad Key *'}
              </label>
              <input
                type="text"
                value={adKey}
                onChange={(e) => handleAdKeyChange(e.target.value)}
                placeholder="e.g. b87ae65b2057f8d1935a8a65f245a61e"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                {isBn ? 'বর্তমান ডিফল্ট কি: b87ae65b2057f8d1935a8a65f245a61e' : 'Default Key: b87ae65b2057f8d1935a8a65f245a61e'}
              </span>
            </div>

            {/* Invoke Script URL */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isBn ? 'Adsterra স্ক্রিপ্ট URL (Invoke.js) *' : 'Invoke.js Script URL *'}
              </label>
              <input
                type="text"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://www.highrevenueformat.com/.../invoke.js"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'প্রস্থ (Width px)' : 'Width (px)'}
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'উচ্চতা (Height px)' : 'Height (px)'}
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Position Controls: Top / Bottom */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-2.5">
            <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">
              {isBn ? 'বিজ্ঞাপন প্রদর্শনের অবস্থান (Position)' : 'Ad Placements'}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showTopBanner}
                  onChange={(e) => setShowTopBanner(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-bold text-slate-800">
                  {isBn ? 'শীর্ষ ব্যানার (Top)' : 'Top Banner'}
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showBottomBanner}
                  onChange={(e) => setShowBottomBanner(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-bold text-slate-800">
                  {isBn ? 'নিচের ব্যানার (Bottom)' : 'Bottom Banner'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Per-Page Activation */}
        <div className="space-y-4">
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-3">
            <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBn ? 'পেজ ভিত্তিক ব্যানার চালু / বন্ধ' : 'Page-Level Toggles'}</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              {isBn 
                ? 'যেসব পেজে এই ব্যানারটি চালু রাখতে চান সেগুলো টিক চিহ্ন দিন:' 
                : 'Select the income pages where banners should appear:'}
            </p>

            <div className="space-y-2">
              {/* 1. Ads View */}
              <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/80 cursor-pointer hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {isBn ? 'এডস ভিউ পেজ' : 'Ads View Page'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isBn ? 'বিজ্ঞাপন দেখার মূল পেজ' : 'Watch Ads & Earn section'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pageAdsView}
                  onChange={(e) => setPageAdsView(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              {/* 2. Quiz & Earn */}
              <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/80 cursor-pointer hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {isBn ? 'কুইজ খেলে আয় পেজ' : 'Quiz & Earn Page'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isBn ? 'কুইজ খেলা ও রিওয়ার্ড স্ক্রিন' : 'Interactive quiz player'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pageQuizJob}
                  onChange={(e) => setPageQuizJob(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              {/* 3. Typing Job */}
              <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/80 cursor-pointer hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {isBn ? 'টাইপিং জব পেজ' : 'Typing Job Page'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isBn ? 'ক্যাপচা টাইপিং ইনকাম স্ক্রিন' : 'Captcha typing jobs'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pageTypingJob}
                  onChange={(e) => setPageTypingJob(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              {/* 4. Ad Marketing */}
              <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/80 cursor-pointer hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {isBn ? 'এড মার্কেটিং পেজ' : 'Ad Marketing Page'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isBn ? 'মার্কেটিং শেয়ার ও প্রুফ সাবমিট স্ক্রিন' : 'Campaign marketing and proof submission'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pageAdMarketing}
                  onChange={(e) => setPageAdMarketing(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="w-full sm:flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save Banner Settings')}</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              title={isBn ? 'ইউজারের দেওয়া মূল Adsterra কোডে ফিরিয়ে আনুন' : 'Reset to original user code'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isBn ? 'ডিফল্ট রিসেট' : 'Reset'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Live Preview Section */}
      <div className="border-t border-slate-100 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-600" />
            <h4 className="font-black text-xs text-slate-800">
              {isBn ? 'লাইভ প্রিভিউ (বিজ্ঞাপনটি যেভাবে প্রদর্শিত হবে):' : 'Live Preview:'}
            </h4>
          </div>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            {showPreview ? (isBn ? 'প্রিভিউ লুকান' : 'Hide Preview') : (isBn ? 'প্রিভিউ দেখুন' : 'Show Preview')}
          </button>
        </div>

        {showPreview && (
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center overflow-x-auto">
            <PersistentAdBanner position="top" page="ads_view" />
          </div>
        )}
      </div>

    </div>
  );
};
