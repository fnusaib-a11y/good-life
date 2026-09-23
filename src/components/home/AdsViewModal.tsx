import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  ArrowRight, 
  ArrowLeft,
  Trophy, 
  ShieldCheck, 
  RotateCcw,
  Gift,
  Plus,
  Upload,
  Video,
  PlaySquare,
  Flame,
  ChevronRight,
  Layers,
  Settings,
  HelpCircle,
  AlertCircle,
  Globe,
  Code
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { AutoAdItem, RealPlayerConfig } from '../../types';
import { compressImage } from '../../lib/imageUtils';
import { RealAdVideoPlayer } from './RealAdVideoPlayer';
import { PersistentAdBanner } from '../common/PersistentAdBanner';

interface AdsViewModalProps {
  onClose: () => void;
}

const STORAGE_COOLDOWN_KEY = 'lg_ads_cooldown_until';

export const AdsViewModal: React.FC<AdsViewModalProps> = ({ onClose }) => {
  const { 
    systemSettings, 
    updateSystemSettings,
    wallet, 
    claimAutoAdsReward, 
    isAuthorizedAdmin,
    setIsAdminDashboardOpen,
    showToast,
    isBn 
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSponsor, setNewSponsor] = useState('');
  const [newMediaType, setNewMediaType] = useState<'banner' | 'video'>('banner');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const autoAdsConfig = systemSettings.autoAdsConfig || {
    totalAdsPerSession: 3,
    durationPerAd: 10,
    rewardPerSession: 1.50,
    cooldownMinutes: 30,
    ads: []
  };

  const totalAds = Math.max(1, Math.min(autoAdsConfig.totalAdsPerSession || 3, (autoAdsConfig.ads?.length || 3)));
  const durationPerAd = autoAdsConfig.durationPerAd || 10;
  const rewardAmount = autoAdsConfig.rewardPerSession || 1.50;
  const cooldownMinutes = autoAdsConfig.cooldownMinutes || 30;

  // Active ads sequence
  const adsList: AutoAdItem[] = (autoAdsConfig.ads && autoAdsConfig.ads.length > 0)
    ? autoAdsConfig.ads.slice(0, totalAds)
    : [
        {
          id: 'def_1',
          title: 'রয়েল শপ সুপার মেম্বারশিপ অফার',
          sponsorName: 'Good Life Official',
          mediaType: 'banner',
          mediaUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
          targetUrl: 'https://goodlife.com.bd',
          description: 'বিনা পুঁজিতে পাইকারি দামে রিসেলিং করে প্রতিদিন নিশ্চিত আয় করুন।'
        },
        {
          id: 'def_2',
          title: 'টেলিগ্রাম চ্যানেলে জয়েন করুন ও বোনাস নিন',
          sponsorName: 'Official Community',
          mediaType: 'banner',
          mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          targetUrl: 'https://t.me/goodlifeofficialbd',
          description: 'দৈনিক পেমেন্ট প্রুফ ও নতুন কাজের নোটিফিকেশন সবার আগে পেতে যুক্ত হোন।'
        },
        {
          id: 'def_3',
          title: 'মাইক্রো জবস করে সহজে ইনস্ট্যান্ট টাকা আয়',
          sponsorName: 'Freelance & Job Hub',
          mediaType: 'banner',
          mediaUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80',
          targetUrl: 'https://goodlife.com.bd',
          description: 'ফেসবুক লাইক, ইউটিউব সাবস্ক্রাইব ও সহজ কাজ করে প্রতিদিন নিশ্চিত আয় করুন।'
        }
      ];

  // Cooldown State
  const [cooldownRemainingSec, setCooldownRemainingSec] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_COOLDOWN_KEY);
      if (stored) {
        const target = Number(stored);
        const diff = Math.ceil((target - Date.now()) / 1000);
        return diff > 0 ? diff : 0;
      }
    } catch {}
    return 0;
  });

  // Real In-Place Player State
  const [isPlayingInPlace, setIsPlayingInPlace] = useState(false);
  const [isAdminPlayerEditOpen, setIsAdminPlayerEditOpen] = useState(false);

  const realPlayerConfig: RealPlayerConfig = useMemo(() => {
    return autoAdsConfig.realPlayerConfig || {
      enabled: true,
      contentType: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      adUrl: 'https://goodlife.com.bd',
      title: 'স্পন্সরড ভিডিও বিজ্ঞাপন ও প্রমোশনাল অফার',
      sponsorName: 'Good Life Partner',
      durationSeconds: 10
    };
  }, [autoAdsConfig.realPlayerConfig]);

  const [editRpEnabled, setEditRpEnabled] = useState(realPlayerConfig.enabled ?? true);
  const [editRpContentType, setEditRpContentType] = useState<'video' | 'ad'>(realPlayerConfig.contentType || 'video');
  const [editRpVideoUrl, setEditRpVideoUrl] = useState(realPlayerConfig.videoUrl || '');
  const [editRpAdUrl, setEditRpAdUrl] = useState(realPlayerConfig.adUrl || '');
  const [editRpTitle, setEditRpTitle] = useState(realPlayerConfig.title || '');
  const [editRpSponsor, setEditRpSponsor] = useState(realPlayerConfig.sponsorName || '');
  const [editRpDuration, setEditRpDuration] = useState(realPlayerConfig.durationSeconds || 10);

  useEffect(() => {
    if (autoAdsConfig.realPlayerConfig) {
      setEditRpEnabled(autoAdsConfig.realPlayerConfig.enabled ?? true);
      setEditRpContentType(autoAdsConfig.realPlayerConfig.contentType || 'video');
      setEditRpVideoUrl(autoAdsConfig.realPlayerConfig.videoUrl || '');
      setEditRpAdUrl(autoAdsConfig.realPlayerConfig.adUrl || '');
      setEditRpTitle(autoAdsConfig.realPlayerConfig.title || '');
      setEditRpSponsor(autoAdsConfig.realPlayerConfig.sponsorName || '');
      setEditRpDuration(autoAdsConfig.realPlayerConfig.durationSeconds || 10);
    }
  }, [autoAdsConfig.realPlayerConfig]);

  // Flow states: 'page' (new dedicated view) | 'watching' (active ad player) | 'completed'
  const [viewState, setViewState] = useState<'page' | 'watching' | 'completed'>('page');

  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(durationPerAd);
  const [isAdFinished, setIsAdFinished] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cooldown ticking
  useEffect(() => {
    if (cooldownRemainingSec > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldownRemainingSec(prev => {
          if (prev <= 1) {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            localStorage.removeItem(STORAGE_COOLDOWN_KEY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [cooldownRemainingSec]);

  // Ad Timer Ticking when watching
  useEffect(() => {
    if (viewState !== 'watching') return;

    setTimeRemaining(durationPerAd);
    setIsAdFinished(false);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsAdFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentAdIndex, viewState, durationPerAd]);

  const handleStartEarning = () => {
    if (cooldownRemainingSec > 0) {
      showToast(isBn ? `অনুগ্রহ করে ${formatTime(cooldownRemainingSec)} অপেক্ষা করুন!` : `Please wait ${formatTime(cooldownRemainingSec)}!`);
      return;
    }
    if (realPlayerConfig.enabled === false) {
      showToast(isBn ? 'বিজ্ঞাপন বর্তমানে এডমিন দ্বারা সাময়িক বন্ধ রাখা হয়েছে।' : 'Ads are temporarily disabled by admin.');
      return;
    }
    // Launch In-Place Real Ad/Video Player directly in this section!
    setIsPlayingInPlace(true);
  };

  const handleRealPlayerRewardClaimed = useCallback(() => {
    // 1. Credit wallet
    claimAutoAdsReward(rewardAmount, 1);

    // 2. Set cooldown
    const cooldownEnd = Date.now() + (cooldownMinutes * 60 * 1000);
    try {
      localStorage.setItem(STORAGE_COOLDOWN_KEY, cooldownEnd.toString());
    } catch {}

    setCooldownRemainingSec(cooldownMinutes * 60);
    showToast(isBn ? `অভিনন্দন! ৳${rewardAmount.toFixed(2)} রিওয়ার্ড যোগ হয়েছে!` : `Reward +৳${rewardAmount.toFixed(2)} added!`);
  }, [claimAutoAdsReward, rewardAmount, cooldownMinutes, isBn, showToast]);

  const handleSaveRealPlayerConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRp: RealPlayerConfig = {
      enabled: editRpEnabled,
      contentType: editRpContentType,
      videoUrl: editRpVideoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      adUrl: editRpAdUrl.trim() || 'https://goodlife.com.bd',
      title: editRpTitle.trim() || 'স্পন্সর বিজ্ঞাপন',
      sponsorName: editRpSponsor.trim() || 'Good Life Partner',
      durationSeconds: Number(editRpDuration) || 10
    };

    updateSystemSettings({
      autoAdsConfig: {
        ...autoAdsConfig,
        realPlayerConfig: updatedRp
      }
    });

    showToast(isBn ? 'প্লেয়ার সেটিংস সফলভাবে আপডেট হয়েছে!' : 'Player settings updated successfully!');
    setIsAdminPlayerEditOpen(false);
  };

  // Handle Next Ad or Complete Session
  const handleNextAd = () => {
    if (!isAdFinished) return;

    if (currentAdIndex + 1 < totalAds) {
      setCurrentAdIndex(prev => prev + 1);
    } else {
      // Completed all ads!
      completeAllAdsSession();
    }
  };

  const completeAllAdsSession = () => {
    if (rewardClaimed) return;
    setRewardClaimed(true);

    // 1. Credit wallet
    claimAutoAdsReward(rewardAmount, totalAds);

    // 2. Set cooldown
    const cooldownEnd = Date.now() + (cooldownMinutes * 60 * 1000);
    try {
      localStorage.setItem(STORAGE_COOLDOWN_KEY, cooldownEnd.toString());
    } catch {}

    setCooldownRemainingSec(cooldownMinutes * 60);
    setViewState('completed');
  };

  // Reset Cooldown (Admin Testing Shortcut)
  const handleAdminResetCooldown = () => {
    localStorage.removeItem(STORAGE_COOLDOWN_KEY);
    setCooldownRemainingSec(0);
    showToast(isBn ? 'কুলডাউন টাইমার সফলভাবে রিসেট করা হয়েছে!' : 'Cooldown timer reset successfully!');
  };

  // Video Ad SDK Invocation (Zone: 9796489)
  const triggerSdkVideoAd = () => {
    const sdkFn = (window as any).show_9796489;
    if (typeof sdkFn === 'function') {
      try {
        const res = sdkFn();
        if (res && typeof res.then === 'function') {
          res.then(() => {
            showToast(isBn ? 'ভিডিও বিজ্ঞাপন সফলভাবে সম্পন্ন হয়েছে!' : 'Video ad finished!');
          }).catch((err: any) => {
            console.log('Video ad closed/error:', err);
          });
        }
      } catch (e) {
        console.warn('SDK invoke error:', e);
      }
    } else {
      showToast(isBn ? 'ভিডিও এড SDK লোড হচ্ছে (Zone: 9796489), কিছুক্ষণ পর চেষ্টা করুন।' : 'Video Ad SDK is loading, please wait a moment.');
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast(isBn ? 'ছবির সাইজ সর্বোচ্চ ৮MB হতে পারবে!' : 'Image size must be under 8MB');
      return;
    }

    try {
      const compressed = await compressImage(file, 720, 360, 0.7);
      setNewMediaUrl(compressed);
      setNewMediaType('banner');
      showToast(isBn ? 'ছবি সফলভাবে কম্প্রেস ও লোড হয়েছে!' : 'Image compressed and loaded!');
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setNewMediaUrl(result);
          setNewMediaType('banner');
          showToast(isBn ? 'ছবি সফলভাবে লোড হয়েছে!' : 'Image loaded successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNewAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMediaUrl.trim()) return;

    const newAd: AutoAdItem = {
      id: `ad_auto_${Date.now()}`,
      title: newTitle.trim(),
      sponsorName: newSponsor.trim() || 'Good Life Partner',
      mediaType: newMediaType,
      mediaUrl: newMediaUrl.trim(),
      targetUrl: newTargetUrl.trim() || undefined,
      description: newDesc.trim() || undefined
    };

    const currentExisting = autoAdsConfig.ads && autoAdsConfig.ads.length > 0 ? autoAdsConfig.ads : adsList;
    const updatedAds = [...currentExisting, newAd];
    
    updateSystemSettings({
      autoAdsConfig: {
        ...autoAdsConfig,
        totalAdsPerSession: Math.max(autoAdsConfig.totalAdsPerSession || 3, updatedAds.length),
        ads: updatedAds
      }
    });

    showToast(isBn ? 'নতুন বিজ্ঞাপন এডমিন প্যানেল থেকে সফলভাবে যুক্ত হয়েছে!' : 'New ad added successfully!');
    setNewTitle('');
    setNewSponsor('');
    setNewMediaUrl('');
    setNewTargetUrl('');
    setNewDesc('');
    setIsQuickAddOpen(false);
  };

  const currentAd = adsList[currentAdIndex] || adsList[0];
  const progressPercent = ((durationPerAd - timeRemaining) / durationPerAd) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100/95 backdrop-blur-md overflow-y-auto animate-fade-in">
      
      {/* Top Application Bar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 sm:px-6 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
              <span>{isBn ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-black text-sm sm:text-base text-gray-900 leading-tight">
                  {isBn ? 'এডস ভিউ ইনকাম' : 'Ads View Earning'}
                </h1>
                <p className="text-[10px] text-gray-500 font-medium">
                  {isBn ? 'বিজ্ঞাপন দেখে সরাসরি ওয়ালেটে নগদ আয়' : 'Watch ads to earn instant cash'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Wallet Chip */}
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-1.5 text-xs font-black text-emerald-800">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              <span>৳{(wallet?.balance || 0).toFixed(2)}</span>
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEW: DEDICATED ADS VIEW PAGE */}
      {viewState === 'page' && (
        <main className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-4 pb-16">
          {/* Top Persistent Banner Ad */}
          <PersistentAdBanner position="top" page="ads_view" />
          
          {/* Hero Earning Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-600 to-sky-700 text-white p-5 sm:p-6 shadow-xl space-y-4">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black text-sky-100 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isBn ? 'অটো স্পন্সর বিজ্ঞাপন রিওয়ার্ড' : 'Auto Sponsored Ads'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {isBn ? 'বিজ্ঞাপন দেখুন এবং নগদ টাকা আয় করুন!' : 'Watch Ads and Earn Instant Cash!'}
                </h2>
                <p className="text-xs sm:text-sm text-sky-100 max-w-md font-medium">
                  {isBn 
                    ? `প্রতিটি সেশনে মোট ${totalAds}টি বিজ্ঞাপন দেখুন এবং সম্পূর্ণ হতেই সরাসরি আপনার মূল ওয়ালেটে টাকা যোগ হবে।`
                    : `Complete ${totalAds} ads to instantly receive your reward into your main wallet.`}
                </p>
              </div>

              {/* Reward Callout Box */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shrink-0 min-w-[140px]">
                <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider block">
                  {isBn ? 'সেশন রিওয়ার্ড' : 'Session Reward'}
                </span>
                <span className="text-3xl font-black text-amber-300 tracking-tight font-mono">
                  ৳{rewardAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-sky-100 block mt-0.5">
                  {isBn ? 'সরাসরি ব্যালেন্সে' : 'Direct to wallet'}
                </span>
              </div>
            </div>

            {/* Session Stats Mini Grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/15 text-xs">
              <div className="bg-black/15 backdrop-blur-xs rounded-xl p-2.5">
                <span className="text-[10px] text-sky-200 font-medium block">{isBn ? 'মোট বিজ্ঞাপন' : 'Total Ads'}</span>
                <span className="font-black text-white text-sm">{totalAds} টি</span>
              </div>
              <div className="bg-black/15 backdrop-blur-xs rounded-xl p-2.5">
                <span className="text-[10px] text-sky-200 font-medium block">{isBn ? 'প্রতি বিজ্ঞাপনের সময়' : 'Time Per Ad'}</span>
                <span className="font-black text-white text-sm">{durationPerAd} সেকেন্ড</span>
              </div>
              <div className="bg-black/15 backdrop-blur-xs rounded-xl p-2.5">
                <span className="text-[10px] text-sky-200 font-medium block">{isBn ? 'সেশন বোনাস' : 'Reward'}</span>
                <span className="font-black text-amber-300 text-sm">৳{rewardAmount.toFixed(2)}</span>
              </div>
              <div className="bg-black/15 backdrop-blur-xs rounded-xl p-2.5">
                <span className="text-[10px] text-sky-200 font-medium block">{isBn ? 'বিরতির সময়কাল' : 'Cooldown'}</span>
                <span className="font-black text-white text-sm">{cooldownMinutes} মিনিট</span>
              </div>
            </div>
          </div>

          {/* Cooldown Warning Notice if Active */}
          {cooldownRemainingSec > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm">
                    {isBn ? 'সেশন সাময়িক বিরতিতে আছে (Cooldown Active)' : 'Session is on Cooldown'}
                  </h4>
                  <p className="text-[11px] text-amber-700">
                    {isBn ? 'পরবর্তী সেশনের বিজ্ঞাপন আনলক হতে আর মাত্র বাকি:' : 'Next session unlocks in:'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xl font-black font-mono bg-amber-500 text-white px-3 py-1.5 rounded-xl shadow-xs">
                  {formatTime(cooldownRemainingSec)}
                </span>
                {isAuthorizedAdmin && (
                  <button
                    onClick={handleAdminResetCooldown}
                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1"
                    title="এডমিন টেস্ট রিসেট"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>রিসেট</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PRIMARY CALL-TO-ACTION: "ইনকাম করুন" BUTTON & IN-PLACE REAL AD/VIDEO PLAYER */}
          {isPlayingInPlace ? (
            <div className="animate-fade-in my-1">
              <RealAdVideoPlayer
                config={realPlayerConfig}
                rewardAmount={rewardAmount}
                onClose={() => setIsPlayingInPlace(false)}
                onRewardClaimed={handleRealPlayerRewardClaimed}
                isBn={isBn}
              />
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-2">
                      <span>{isBn ? 'বিজ্ঞাপন শুরু করুন' : 'Start Watching Ads'}</span>
                      {realPlayerConfig.contentType === 'video' ? (
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Video className="w-3 h-3 text-sky-600" />
                          <span>{isBn ? 'ভিডিও বিজ্ঞাপন' : 'Video Ad'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Globe className="w-3 h-3 text-emerald-600" />
                          <span>{isBn ? 'স্পন্সর বিজ্ঞাপন' : 'Sponsor Ad'}</span>
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      {isBn ? 'নিচের বাটনে চাপ দিলে এই সেকশনের ভেতরেই রিয়েল বিজ্ঞাপন প্লে হবে' : 'Tap below to play sponsored ad/video in-place'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isAuthorizedAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsAdminPlayerEditOpen(!isAdminPlayerEditOpen)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        title="প্লেয়ার URL পরিবর্তন করুন"
                      >
                        <Settings className="w-3 h-3 text-purple-600" />
                        <span>{isAdminPlayerEditOpen ? 'বন্ধ' : 'প্লেয়ার সেটআপ'}</span>
                      </button>
                    )}
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                      +{rewardAmount.toFixed(2)}৳
                    </span>
                  </div>
                </div>

                {/* Quick Admin Player URL Setup Drawer */}
                {isAdminPlayerEditOpen && isAuthorizedAdmin && (
                  <form onSubmit={handleSaveRealPlayerConfig} className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2.5 text-xs animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-purple-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>এডমিন প্লেয়ার URL ও কনফিগারেশন</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAdminPlayerEditOpen(false)}
                        className="p-1 text-gray-500 hover:text-gray-800 rounded-full"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">কন্টেন্ট টাইপ</label>
                        <select
                          value={editRpContentType}
                          onChange={(e) => setEditRpContentType(e.target.value as 'video' | 'ad')}
                          className="w-full p-2 bg-white border border-purple-200 rounded-lg font-bold text-xs"
                        >
                          <option value="video">ভিডিও প্লেয়ার (YouTube/Direct)</option>
                          <option value="ad">বিজ্ঞাপন URL (Ad URL / Sponsor)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">স্ট্যাটাস</label>
                        <select
                          value={editRpEnabled ? 'enabled' : 'disabled'}
                          onChange={(e) => setEditRpEnabled(e.target.value === 'enabled')}
                          className="w-full p-2 bg-white border border-purple-200 rounded-lg font-bold text-xs"
                        >
                          <option value="enabled">সক্রিয় (Enabled)</option>
                          <option value="disabled">নিষ্ক্রিয় (Disabled)</option>
                        </select>
                      </div>
                    </div>

                    {editRpContentType === 'video' ? (
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">ভিডিও লিংক (YouTube বা সরাসরি MP4) *</label>
                        <input
                          type="url"
                          required
                          value={editRpVideoUrl}
                          onChange={(e) => setEditRpVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">বিজ্ঞাপন URL (Ad Network Direct Link বা ল্যান্ডিং পেজ) *</label>
                        <input
                          type="url"
                          required
                          value={editRpAdUrl}
                          onChange={(e) => setEditRpAdUrl(e.target.value)}
                          placeholder="https://goodlife.com.bd বা Ad URL..."
                          className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">বিজ্ঞাপনের শিরোনাম</label>
                        <input
                          type="text"
                          value={editRpTitle}
                          onChange={(e) => setEditRpTitle(e.target.value)}
                          placeholder="বিজ্ঞাপনের নাম"
                          className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">স্পন্সর ব্র্যান্ড</label>
                        <input
                          type="text"
                          value={editRpSponsor}
                          onChange={(e) => setEditRpSponsor(e.target.value)}
                          placeholder="Good Life Partner"
                          className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl cursor-pointer shadow-xs text-xs"
                      >
                        সেটিংস সেভ করুন
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAdminPlayerEditOpen(false)}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl cursor-pointer text-xs"
                      >
                        বাতিল
                      </button>
                    </div>
                  </form>
                )}

                {cooldownRemainingSec === 0 ? (
                  <button
                    type="button"
                    onClick={handleStartEarning}
                    className="w-full py-4 sm:py-4.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.99] group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PlaySquare className="w-5 h-5 text-white" />
                    </div>
                    <span>{isBn ? 'ইনকাম করুন (বিজ্ঞাপন দেখুন)' : 'Start Earning (Watch Ads)'}</span>
                    <span className="bg-white/20 text-xs px-2.5 py-1 rounded-lg font-bold">
                      {realPlayerConfig.contentType === 'video' ? 'ভিডিও প্লেয়ার ➔' : 'স্পন্সর অ্যাড ➔'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 bg-gray-100 border border-gray-200 text-gray-400 font-black text-sm sm:text-base rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>{isBn ? `বিরতি চলছে (${formatTime(cooldownRemainingSec)} বাকি)` : `Cooldown Active (${formatTime(cooldownRemainingSec)})`}</span>
                  </button>
                )}
            </div>
          )}

          {/* Admin Ads Showcase Section */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-gray-900">
                    {isBn ? 'স্পন্সর বিজ্ঞাপনসমূহ' : 'Sponsor Ads in Sequence'}
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    {isBn ? `${adsList.length}টি বিজ্ঞাপন` : `${adsList.length} ads available`}
                  </p>
                </div>
              </div>

              {isAuthorizedAdmin && (
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-600" />
                  <span>{isBn ? '+ নতুন বিজ্ঞাপন বসান' : '+ Add Ad'}</span>
                </button>
              )}
            </div>

            {/* Quick Add Form for Admin */}
            {isQuickAddOpen && isAuthorizedAdmin && (
              <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sky-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>{isBn ? 'সরাসরি নতুন বিজ্ঞাপন যোগ করুন (Admin Panel)' : 'Directly Add New Ad'}</span>
                  </h4>
                  <button
                    onClick={() => setIsQuickAddOpen(false)}
                    className="p-1 hover:bg-sky-200 rounded-full text-gray-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveNewAd} className="space-y-2.5 bg-white p-3.5 rounded-2xl border border-sky-100 shadow-2xs">
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">বিজ্ঞাপনের নাম / শিরোনাম *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="যেমন: স্পেশাল ডিসকাউন্ট অফার"
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-gray-800 block mb-1">স্পন্সর ব্র্যান্ডের নাম</label>
                      <input
                        type="text"
                        value={newSponsor}
                        onChange={(e) => setNewSponsor(e.target.value)}
                        placeholder="Good Life Sponsor"
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-800 block mb-1">বিজ্ঞাপনের ধরণ</label>
                      <select
                        value={newMediaType}
                        onChange={(e) => setNewMediaType(e.target.value as 'banner' | 'video')}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold"
                      >
                        <option value="banner">ছবি / ব্যানার বিজ্ঞাপন</option>
                        <option value="video">ভিডিও বিজ্ঞাপন (YouTube)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 block mb-1">
                      {newMediaType === 'banner' ? 'বিজ্ঞাপনের ছবি আপলোড বা লিংক *' : 'ভিডিও লিংক (YouTube URL) *'}
                    </label>
                    
                    {newMediaType === 'banner' ? (
                      <div className="space-y-1.5">
                        <div className="flex gap-1.5">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg flex items-center gap-1.5 shrink-0 transition-all cursor-pointer text-xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>ছবি আপলোড</span>
                          </button>
                          <input
                            type="text"
                            required
                            value={newMediaUrl}
                            onChange={(e) => setNewMediaUrl(e.target.value)}
                            placeholder="বা ছবির সরাসরি লিংক পেস্ট করুন..."
                            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                          />
                        </div>

                        {newMediaUrl && (
                          <div className="relative rounded-lg overflow-hidden border border-gray-200 max-h-24 bg-gray-100 flex items-center justify-center">
                            <img src={newMediaUrl} alt="Preview" className="max-h-20 object-contain" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => setNewMediaUrl('')}
                              className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="url"
                        required
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      />
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 block mb-1">টার্গেট লিংক (ক্লিক করলে যেখানে যাবে)</label>
                    <input
                      type="url"
                      value={newTargetUrl}
                      onChange={(e) => setNewTargetUrl(e.target.value)}
                      placeholder="https://t.me/goodlifeofficialbd"
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                    >
                      বিজ্ঞাপন সেভ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsQuickAddOpen(false)}
                      className="px-3 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Ads List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {adsList.map((ad, idx) => (
                <div 
                  key={ad.id || idx}
                  className="rounded-2xl border border-gray-200/80 overflow-hidden bg-gray-50 hover:bg-white transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    {/* Media Thumbnail */}
                    <div className="relative aspect-video bg-gray-200 overflow-hidden flex items-center justify-center">
                      {ad.mediaType === 'video' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white gap-1">
                          <Video className="w-6 h-6 text-sky-400" />
                          <span className="text-[10px] font-bold">ভিডিও বিজ্ঞাপন</span>
                        </div>
                      ) : ad.mediaType === 'adnetwork_direct' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-amber-600 to-amber-700 text-white gap-1">
                          <Globe className="w-6 h-6 text-amber-200 animate-pulse" />
                          <span className="text-[10px] font-black">{ad.adNetworkProvider || 'Adsterra'} Direct</span>
                        </div>
                      ) : ad.mediaType === 'adnetwork_script' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-purple-700 to-indigo-800 text-white gap-1">
                          <Code className="w-6 h-6 text-purple-200" />
                          <span className="text-[10px] font-black">স্ক্রিপ্ট ব্যানার</span>
                        </div>
                      ) : (
                        <img 
                          src={ad.mediaUrl} 
                          alt={ad.title} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                      <span className="absolute top-2 left-2 bg-black/70 text-white font-black text-[10px] px-2 py-0.5 rounded-full font-mono">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="p-3 space-y-1">
                      <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                        {ad.sponsorName || 'Good Life Partner'}
                      </span>
                      <h4 className="font-bold text-xs text-gray-900 line-clamp-1">
                        {ad.title}
                      </h4>
                      {ad.description && (
                        <p className="text-[10px] text-gray-500 line-clamp-2">
                          {ad.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {ad.targetUrl && (
                    <div className="p-3 pt-0">
                      <a
                        href={ad.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                      >
                        <span>স্পন্সরের লিংক</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Admin Full Settings Button */}
            {isAuthorizedAdmin && (
              <div className="pt-2 border-t border-dashed border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>এডমিন প্যানেল থেকে বিজ্ঞাপন বসানো ও সেটিংস:</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsAdminDashboardOpen(true);
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>এডমিন ড্যাশবোর্ড খুলুন</span>
                </button>
              </div>
            )}
          </div>

          {/* How to Earn (Instructions) */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-sm space-y-3">
            <h3 className="font-black text-xs sm:text-sm text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>{isBn ? 'কীভাবে কাজ করবেন (সহজ ৩টি ধাপ)' : 'How it Works'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-1">
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center">
                  ১
                </div>
                <h4 className="font-black text-gray-900">ইনকাম বাটনে চাপ দিন</h4>
                <p className="text-[11px] text-gray-600">
                  উপরে থাকা &quot;ইনকাম করুন&quot; বাটনে চাপ দিলেই প্রথম স্পন্সর বিজ্ঞাপনটি চালু হবে।
                </p>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  ২
                </div>
                <h4 className="font-black text-gray-900">টাইমার শেষ হওয়া পর্যন্ত দেখুন</h4>
                <p className="text-[11px] text-gray-600">
                  প্রতিটি বিজ্ঞাপনে ১০ সেকেন্ডের টাইমার থাকবে। টাইমার শেষ হলে &quot;পরবর্তী বিজ্ঞাপন&quot; চাপুন।
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  ৩
                </div>
                <h4 className="font-black text-gray-900">নগদ টাকা গ্রহণ করুন</h4>
                <p className="text-[11px] text-gray-600">
                  সবগুলো বিজ্ঞাপন দেখা সম্পূর্ণ হলেই সরাসরি আপনার মূল ওয়ালেটে ৳{rewardAmount.toFixed(2)} যুক্ত হয়ে যাবে।
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Persistent Banner Ad */}
          <PersistentAdBanner position="bottom" page="ads_view" />
        </main>
      )}

      {/* ACTIVE ADS PLAYER: WHEN USER CLICKS "ইনকাম করুন" */}
      {viewState === 'watching' && (
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
            
            {/* Ad Header with Steps Progress */}
            <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 px-4 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-black">
                  {currentAdIndex + 1}
                </span>
                <div>
                  <h3 className="font-black text-xs sm:text-sm">
                    {isBn ? `বিজ্ঞাপন ${currentAdIndex + 1} / ${totalAds}` : `Ad ${currentAdIndex + 1} of ${totalAds}`}
                  </h3>
                  <p className="text-[10px] text-sky-100 font-medium">
                    {isBn ? 'কাউন্টডাউন টাইমার শেষ হলে পরবর্তী ধাপে যান' : 'Wait for timer to claim reward'}
                  </p>
                </div>
              </div>

              {/* Countdown Timer Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                <span>{timeRemaining}s</span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-gray-200 h-1.5">
              <div 
                className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Ad Content Area */}
            <div className="p-4 sm:p-5 space-y-4">
              
              {/* Sponsor & Title Banner */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-md">
                  {currentAd?.sponsorName || 'Official Sponsor'}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">
                  রিওয়ার্ড: <strong className="text-emerald-600">৳{rewardAmount.toFixed(2)}</strong>
                </span>
              </div>

              {/* Media Player / Banner Display */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-gray-200 aspect-video flex items-center justify-center shadow-inner">
                {currentAd?.mediaType === 'video' ? (
                  currentAd.mediaUrl?.startsWith('sdk') || !currentAd.mediaUrl?.startsWith('http') ? (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-4 flex flex-col items-center justify-center text-white text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                        <Video className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
                          Zone: 9796489 Sponsored Video Ad
                        </span>
                        <h4 className="font-black text-xs sm:text-sm text-white line-clamp-1">
                          {currentAd.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={triggerSdkVideoAd}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                      >
                        <PlaySquare className="w-4 h-4" />
                        <span>ভিডিও বিজ্ঞাপন চালু করুন (Play Video Ad)</span>
                      </button>
                    </div>
                  ) : currentAd.mediaUrl?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ? (
                    <video
                      src={currentAd.mediaUrl}
                      autoPlay
                      muted
                      playsInline
                      controls
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <iframe 
                      src={(() => {
                        const ytMatch = currentAd.mediaUrl?.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
                        if (ytMatch && ytMatch[1]) {
                          return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&playsinline=1&controls=1&rel=0`;
                        }
                        return currentAd.mediaUrl;
                      })()}
                      title={currentAd.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : currentAd?.mediaType === 'adnetwork_direct' ? (
                  <div className="w-full h-full bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 p-4 flex flex-col items-center justify-center text-white text-center space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
                      <Globe className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-full inline-block mb-1">
                        {currentAd.adNetworkProvider || 'Adsterra'} Sponsored Link
                      </span>
                      <h4 className="font-black text-xs sm:text-sm text-white line-clamp-1">
                        {currentAd.title}
                      </h4>
                    </div>
                    <a
                      href={currentAd.adNetworkDirectUrl || currentAd.targetUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-white hover:bg-amber-50 text-amber-900 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>স্পন্সর অফারটি দেখুন (Open Link)</span>
                    </a>
                  </div>
                ) : currentAd?.mediaType === 'adnetwork_script' ? (
                  <iframe 
                    srcDoc={`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fff;font-family:sans-serif;}</style></head><body>${currentAd.adNetworkScriptCode || ''}</body></html>`}
                    title={currentAd.title}
                    className="w-full h-full border-0 bg-slate-900"
                    sandbox="allow-scripts allow-popups allow-same-origin allow-forms"
                  />
                ) : (
                  <img 
                    src={currentAd?.mediaUrl} 
                    alt={currentAd?.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
              </div>

              {/* Ad Description */}
              <div className="space-y-1">
                <h3 className="font-black text-sm sm:text-base text-gray-900 leading-snug">
                  {currentAd?.title}
                </h3>
                {currentAd?.description && (
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {currentAd.description}
                  </p>
                )}
              </div>

              {/* Sponsor Website Visit Button */}
              {currentAd?.targetUrl && (
                <a
                  href={currentAd.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>স্পন্সরের অফার বা ওয়েবসাইট ভিজিট করুন</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
                </a>
              )}

              {/* Bottom Action Button (Next Ad or Complete) */}
              <div className="pt-2">
                {isAdFinished ? (
                  <button
                    type="button"
                    onClick={handleNextAd}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer animate-bounce"
                  >
                    <span>
                      {currentAdIndex + 1 < totalAds 
                        ? (isBn ? 'পরবর্তী বিজ্ঞাপন দেখুন ➔' : 'Next Ad ➔')
                        : (isBn ? `🎉 পুরস্কার গ্রহণ করুন (৳${rewardAmount.toFixed(2)})` : `Claim Reward (৳${rewardAmount.toFixed(2)})`)}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 bg-gray-100 border border-gray-200 text-gray-400 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4 text-gray-400 animate-spin" />
                    <span>{isBn ? `অপেক্ষা করুন (${timeRemaining}s)...` : `Please wait (${timeRemaining}s)...`}</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* COMPLETED SUCCESS SCREEN */}
      {viewState === 'completed' && (
        <div className="flex-1 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-emerald-100 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-gray-900">
                {isBn ? 'অভিনন্দন! রিওয়ার্ড গ্রহণ সম্পন্ন!' : 'Congratulations! Reward Claimed!'}
              </h3>
              <p className="text-xs text-gray-600">
                {isBn ? `আপনি সফলভাবে ${totalAds}টি বিজ্ঞাপন সম্পূর্ণ দেখেছেন।` : `You have successfully completed ${totalAds} ads.`}
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-emerald-800">ওয়ালেটে জমা হয়েছে</span>
              <div className="text-3xl font-black text-emerald-600 font-mono">
                +৳{rewardAmount.toFixed(2)}
              </div>
              <p className="text-[10px] text-emerald-700">
                বর্তমান ব্যালেন্স: <strong>৳{(wallet?.balance || 0).toFixed(2)}</strong>
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setViewState('page')}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                {isBn ? 'এডস ভিউ পেজে ফিরে যান' : 'Back to Ads View'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                {isBn ? 'হোমে ফিরে যান' : 'Back to Home'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
