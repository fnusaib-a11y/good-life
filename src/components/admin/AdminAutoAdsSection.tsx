import React, { useState, useRef } from 'react';
import { 
  PlaySquare, 
  Play,
  Clock, 
  Gift, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Video, 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  X, 
  Edit2, 
  Save, 
  Check,
  Globe,
  Code,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AutoAdItem, RealPlayerConfig } from '../../types';
import { compressImage } from '../../lib/imageUtils';
import { RealAdVideoPlayer } from '../home/RealAdVideoPlayer';
import { playAdsterraRewardedAd } from '../../services/adNetworkService';
import { AdminBannerAdsCard } from './AdminBannerAdsCard';

export const AdminAutoAdsSection: React.FC = () => {
  const { 
    systemSettings, 
    updateSystemSettings, 
    resetAdsCooldown, 
    showToast, 
    isBn 
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const autoAdsConfig = systemSettings.autoAdsConfig || {
    totalAdsPerSession: 3,
    durationPerAd: 10,
    rewardPerSession: 1.50,
    cooldownMinutes: 30,
    ads: []
  };

  const [totalAds, setTotalAds] = useState(autoAdsConfig.totalAdsPerSession || 3);
  const [duration, setDuration] = useState(autoAdsConfig.durationPerAd || 10);
  const [reward, setReward] = useState(autoAdsConfig.rewardPerSession || 1.50);
  const [cooldown, setCooldown] = useState(autoAdsConfig.cooldownMinutes || 30);
  
  const [adsList, setAdsList] = useState<AutoAdItem[]>(autoAdsConfig.ads || []);

  // Real Ad / Video Player Config State
  const initialRp: RealPlayerConfig = autoAdsConfig.realPlayerConfig || {
    enabled: true,
    contentType: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    adUrl: 'https://goodlife.com.bd',
    title: 'স্পন্সরড ভিডিও বিজ্ঞাপন ও প্রমোশনাল অফার',
    sponsorName: 'Good Life Partner',
    durationSeconds: 10
  };

  const [rpEnabled, setRpEnabled] = useState<boolean>(initialRp.enabled ?? true);
  const [rpContentType, setRpContentType] = useState<'video' | 'ad'>(initialRp.contentType || 'video');
  const [rpVideoUrl, setRpVideoUrl] = useState<string>(initialRp.videoUrl || '');
  const [rpAdUrl, setRpAdUrl] = useState<string>(initialRp.adUrl || '');
  const [rpTitle, setRpTitle] = useState<string>(initialRp.title || '');
  const [rpSponsorName, setRpSponsorName] = useState<string>(initialRp.sponsorName || '');
  const [rpDuration, setRpDuration] = useState<number>(initialRp.durationSeconds || 10);
  const [isRpPreviewOpen, setIsRpPreviewOpen] = useState<boolean>(false);

  // Tutorial Accordion State
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  // Form State
  const [isAddingAd, setIsAddingAd] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSponsor, setFormSponsor] = useState('');
  const [formMediaType, setFormMediaType] = useState<'banner' | 'video' | 'adnetwork_direct' | 'adnetwork_script'>('banner');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formTargetUrl, setFormTargetUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');

  // Ad Network Specific Fields
  const [formAdNetworkProvider, setFormAdNetworkProvider] = useState<'adsterra' | 'monetag' | 'propeller' | 'adsense' | 'custom'>('adsterra');
  const [formAdNetworkDirectUrl, setFormAdNetworkDirectUrl] = useState('');
  const [formAdNetworkScriptCode, setFormAdNetworkScriptCode] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast(isBn ? 'ছবির সাইজ সর্বোচ্চ ৮MB হতে পারবে!' : 'Image size must be under 8MB');
      return;
    }

    try {
      const compressed = await compressImage(file, 720, 360, 0.7);
      setFormMediaUrl(compressed);
      setFormMediaType('banner');
      showToast(isBn ? 'ছবি সফলভাবে কম্প্রেস ও লোড হয়েছে!' : 'Image compressed and loaded!');
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormMediaUrl(result);
          setFormMediaType('banner');
          showToast(isBn ? 'ছবি সফলভাবে লোড হয়েছে!' : 'Image loaded successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveRealPlayerOnly = () => {
    const updatedRp: RealPlayerConfig = {
      enabled: rpEnabled,
      contentType: rpContentType,
      videoUrl: rpVideoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      adUrl: rpAdUrl.trim() || 'https://goodlife.com.bd',
      title: rpTitle.trim() || 'স্পন্সর বিজ্ঞাপন',
      sponsorName: rpSponsorName.trim() || 'Good Life Partner',
      durationSeconds: Number(rpDuration) || 10
    };

    updateSystemSettings({
      autoAdsConfig: {
        ...autoAdsConfig,
        totalAdsPerSession: Number(totalAds),
        durationPerAd: Number(duration),
        rewardPerSession: Number(reward),
        cooldownMinutes: Number(cooldown),
        ads: adsList,
        realPlayerConfig: updatedRp
      }
    });

    showToast(isBn ? 'ইনকাম বাটনের Real Player সেটিংস সফলভাবে সেভ করা হয়েছে!' : 'Real Player settings saved successfully!');
  };

  const handleSaveConfig = () => {
    const updatedRp: RealPlayerConfig = {
      enabled: rpEnabled,
      contentType: rpContentType,
      videoUrl: rpVideoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      adUrl: rpAdUrl.trim() || 'https://goodlife.com.bd',
      title: rpTitle.trim() || 'স্পন্সর বিজ্ঞাপন',
      sponsorName: rpSponsorName.trim() || 'Good Life Partner',
      durationSeconds: Number(rpDuration) || 10
    };

    updateSystemSettings({
      autoAdsConfig: {
        totalAdsPerSession: Number(totalAds),
        durationPerAd: Number(duration),
        rewardPerSession: Number(reward),
        cooldownMinutes: Number(cooldown),
        ads: adsList,
        realPlayerConfig: updatedRp
      },
      featureRewards: {
        ...systemSettings.featureRewards,
        ads_view: Number(reward)
      }
    });

    showToast(isBn ? 'বিজ্ঞাপন ও প্লেয়ার সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Ads & Player configuration saved successfully!');
  };

  const handleStartEdit = (ad: AutoAdItem) => {
    setEditingAdId(ad.id);
    setFormTitle(ad.title);
    setFormSponsor(ad.sponsorName || '');
    setFormMediaType(ad.mediaType === 'web' ? 'banner' : ad.mediaType);
    setFormMediaUrl(ad.mediaUrl || '');
    setFormTargetUrl(ad.targetUrl || '');
    setFormDesc(ad.description || '');

    setFormAdNetworkProvider(ad.adNetworkProvider || 'adsterra');
    setFormAdNetworkDirectUrl(ad.adNetworkDirectUrl || ad.targetUrl || '');
    setFormAdNetworkScriptCode(ad.adNetworkScriptCode || '');

    setIsAddingAd(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast(isBn ? 'অনুগ্রহ করে বিজ্ঞাপনের শিরোনাম দিন' : 'Please provide ad title');
      return;
    }

    // Validation per media type
    if (formMediaType === 'banner' && !formMediaUrl.trim()) {
      showToast(isBn ? 'অনুগ্রহ করে ব্যানার ছবির লিংক বা ছবি আপলোড করুন' : 'Please provide banner image');
      return;
    }

    if (formMediaType === 'video' && !formMediaUrl.trim()) {
      showToast(isBn ? 'অনুগ্রহ করে ভিডিও লিংক দিন' : 'Please provide video link');
      return;
    }

    if (formMediaType === 'adnetwork_direct' && !formAdNetworkDirectUrl.trim() && !formTargetUrl.trim()) {
      showToast(isBn ? 'অনুগ্রহ করে এড নেটওয়ার্ক ডিরেক্ট লিংক দিন' : 'Please provide Ad Network Direct Link');
      return;
    }

    if (formMediaType === 'adnetwork_script' && !formAdNetworkScriptCode.trim()) {
      showToast(isBn ? 'অনুগ্রহ করে এড নেটওয়ার্ক স্ক্রিপ্ট/ব্যানার কোড দিন' : 'Please provide Ad Network Script Code');
      return;
    }

    const effectiveMediaUrl = formMediaUrl.trim() || (
      formMediaType === 'adnetwork_direct' 
        ? 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'
    );

    const effectiveTargetUrl = formMediaType === 'adnetwork_direct'
      ? (formAdNetworkDirectUrl.trim() || formTargetUrl.trim())
      : (formTargetUrl.trim() || undefined);

    let updatedAds: AutoAdItem[];

    if (editingAdId) {
      // Update existing ad
      updatedAds = adsList.map(item => {
        if (item.id === editingAdId) {
          return {
            ...item,
            title: formTitle.trim(),
            sponsorName: formSponsor.trim() || (formMediaType.startsWith('adnetwork') ? `${formAdNetworkProvider} Network` : 'Good Life Partner'),
            mediaType: formMediaType,
            mediaUrl: effectiveMediaUrl,
            targetUrl: effectiveTargetUrl,
            description: formDesc.trim() || undefined,
            adNetworkProvider: formMediaType.startsWith('adnetwork') ? formAdNetworkProvider : undefined,
            adNetworkDirectUrl: formMediaType === 'adnetwork_direct' ? effectiveTargetUrl : undefined,
            adNetworkScriptCode: formMediaType === 'adnetwork_script' ? formAdNetworkScriptCode.trim() : undefined
          };
        }
        return item;
      });
      showToast(isBn ? 'বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে!' : 'Ad updated successfully!');
    } else {
      // Add new ad
      const newAd: AutoAdItem = {
        id: `ad_auto_${Date.now()}`,
        title: formTitle.trim(),
        sponsorName: formSponsor.trim() || (formMediaType.startsWith('adnetwork') ? `${formAdNetworkProvider} Network` : 'Good Life Partner'),
        mediaType: formMediaType,
        mediaUrl: effectiveMediaUrl,
        targetUrl: effectiveTargetUrl,
        description: formDesc.trim() || undefined,
        adNetworkProvider: formMediaType.startsWith('adnetwork') ? formAdNetworkProvider : undefined,
        adNetworkDirectUrl: formMediaType === 'adnetwork_direct' ? effectiveTargetUrl : undefined,
        adNetworkScriptCode: formMediaType === 'adnetwork_script' ? formAdNetworkScriptCode.trim() : undefined
      };
      updatedAds = [...adsList, newAd];
      showToast(isBn ? 'নতুন বিজ্ঞাপন সফলভাবে যোগ করা হয়েছে!' : 'New ad added successfully!');
    }

    setAdsList(updatedAds);

    updateSystemSettings({
      autoAdsConfig: {
        totalAdsPerSession: Number(totalAds),
        durationPerAd: Number(duration),
        rewardPerSession: Number(reward),
        cooldownMinutes: Number(cooldown),
        ads: updatedAds,
        realPlayerConfig: autoAdsConfig.realPlayerConfig
      }
    });

    // Reset Form
    resetForm();
  };

  const resetForm = () => {
    setFormTitle('');
    setFormSponsor('');
    setFormMediaType('banner');
    setFormMediaUrl('');
    setFormTargetUrl('');
    setFormDesc('');
    setFormAdNetworkProvider('adsterra');
    setFormAdNetworkDirectUrl('');
    setFormAdNetworkScriptCode('');
    setEditingAdId(null);
    setIsAddingAd(false);
  };

  const handleDeleteAd = (id: string) => {
    const updatedAds = adsList.filter(a => a.id !== id);
    setAdsList(updatedAds);
    updateSystemSettings({
      autoAdsConfig: {
        totalAdsPerSession: Number(totalAds),
        durationPerAd: Number(duration),
        rewardPerSession: Number(reward),
        cooldownMinutes: Number(cooldown),
        ads: updatedAds,
        realPlayerConfig: autoAdsConfig.realPlayerConfig
      }
    });
    showToast(isBn ? 'বিজ্ঞাপন মুছে ফেলা হয়েছে।' : 'Ad removed.');
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <PlaySquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-2">
              {isBn ? 'বিজ্ঞাপন ও এড নেটওয়ার্ক ম্যানেজমেন্ট' : 'Ads & Ad Network Manager'}
              <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                {adsList.length}টি সক্রিয়
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              {isBn 
                ? 'এডস ভিউ তে Adsterra, Monetag বা নিজস্ব বিজ্ঞাপন বসিয়ে আয় করুন ও ইউজারদের রিওয়ার্ড দিন' 
                : 'Configure sequence length, timers, rewards, and Adsterra / Monetag ad networks'}
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={async () => {
              showToast(isBn ? 'Adsterra বিজ্ঞাপন টেস্ট করা হচ্ছে...' : 'Testing Adsterra Ad Network...');
              try {
                const res = await playAdsterraRewardedAd({ durationSeconds: 10 });
                if (res.success) {
                  showToast(isBn ? 'Adsterra বিজ্ঞাপন সফলভাবে সম্পন্ন হয়েছে!' : 'Adsterra ad finished!');
                }
              } catch (e) {
                console.warn('Adsterra error:', e);
              }
            }}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Adsterra বিজ্ঞাপন টেস্ট করুন"
          >
            <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span>{isBn ? 'Adsterra টেস্ট' : 'Test Adsterra'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const sdkFn = (window as any).show_9796489;
              if (typeof sdkFn === 'function') {
                showToast(isBn ? 'ভিডিও অ্যাড SDK কল করা হচ্ছে...' : 'Triggering Video Ad SDK (Zone: 9796489)...');
                try {
                  const res = sdkFn();
                  if (res && typeof res.then === 'function') {
                    res.then(() => {
                      showToast(isBn ? 'ভিডিও বিজ্ঞাপন সফলভাবে সম্পন্ন হয়েছে!' : 'Video ad finished!');
                    }).catch((err: any) => {
                      console.log('Video ad error/closed:', err);
                    });
                  }
                } catch (e) {
                  console.warn('SDK call error:', e);
                }
              } else {
                showToast(isBn ? 'ভিডিও অ্যাড SDK লোড হচ্ছে (Zone: 9796489), অনুগ্রহ করে অপেক্ষা করুন...' : 'Video ad SDK is loading, please wait...');
              }
            }}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="ভিডিও বিজ্ঞাপন SDK টেস্ট করুন"
          >
            <Video className="w-3.5 h-3.5 text-purple-600" />
            <span>{isBn ? 'ভিডিও SDK টেস্ট (9796489)' : 'Test Video SDK'}</span>
          </button>

          <button
            type="button"
            onClick={resetAdsCooldown}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="টেস্ট করার জন্য বিরতি শেষ করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isBn ? 'কুলডাউন টেস্ট রিসেট' : 'Reset Cooldown'}</span>
          </button>
        </div>
      </div>

      {/* AD NETWORK INTEGRATION GUIDE ACCORDION */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl overflow-hidden text-xs">
        <div 
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <h4 className="font-black text-blue-950 text-xs sm:text-sm">
              {isBn ? '💡 এড নেটওয়ার্ক (Adsterra, Monetag) যুক্ত করবেন কিভাবে?' : 'How to Integrate Ad Networks?'}
            </h4>
            <span className="text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded-full font-bold">
              গাইড
            </span>
          </div>
          <button type="button" className="p-1 text-blue-700 hover:bg-blue-100 rounded-lg transition-all">
            {isGuideOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isGuideOpen && (
          <div className="px-3.5 pb-3.5 space-y-2.5 text-blue-900 border-t border-blue-100 pt-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-white/80 p-3 rounded-xl border border-blue-200/70 space-y-1">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">১</span>
                  <span>Adsterra Direct Link (স্মার্টলিঙ্ক):</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  ১. <strong>adsterra.com</strong> এ প্রবেশ করে Publisher একাউন্টে লগইন করুন।<br />
                  ২. <strong>"Direct Links"</strong> ট্যাবে গিয়ে <strong>"Create Direct Link"</strong> বাটনে চাপ দিন।<br />
                  ৩. প্রাপ্ত লিংকটি কপি করে নিচে <strong>"+ নতুন বিজ্ঞাপন বসান"</strong> বাটনে ক্লিক করে <strong>"এড নেটওয়ার্ক ডিরেক্ট লিংক"</strong> অপশনে পেস্ট করে দিন।
                </p>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-blue-200/70 space-y-1">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">২</span>
                  <span>Monetag SmartLink বা Banner Code:</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  ১. <strong>monetag.com</strong> এ Publisher ড্যাশবোর্ডে গিয়ে <strong>"Direct Link"</strong> তৈরি করুন।<br />
                  ২. অথবা <strong>"Banner / Social Bar"</strong> কোড জেনারেট করে নিচে <strong>"স্ক্রিপ্ট / ব্যানার কোড"</strong> সিলেক্ট করে কোডটি সরাসরি পেস্ট করুন।<br />
                  ৩. ইউজার যখন বিজ্ঞাপনটি দেখবে, আপনার নেটওয়ার্ক একাউন্টে ডলার আয় হবে।
                </p>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-purple-200/70 space-y-1 sm:col-span-2">
                <div className="font-bold text-purple-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">৩</span>
                  <span>ইনস্টল্ড ভিডিও এড SDK (Zone 9796489):</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  আপনার ভিডিও বিজ্ঞাপন SDK ট্যাগ <code>&lt;script src='//libtl.com/sdk.js' data-zone='9796489' data-sdk='show_9796489'&gt;&lt;/script&gt;</code> সফলভাবে সিস্টেমে যুক্ত করা হয়েছে। এটি ভিডিও বিজ্ঞাপনের জন্য সক্রিয় এবং ওপরের <strong>"ভিডিও SDK টেস্ট (9796489)"</strong> বাটনে চাপ দিয়ে যেকোনো সময় পরীক্ষা করতে পারেন।
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-emerald-900 text-[11px]">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>দ্বিমুখী মেকানিজম:</strong> ইউজাররা সাইটে এসে 'ইনকাম করুন' বাটনে চাপ দিলে আপনার দেওয়া Adsterra/Monetag লিঙ্ক বা কোডের বিজ্ঞাপন শো হবে। এতে এড নেটওয়ার্ক আপনাকে ডলারে পেমেন্ট করবে, এবং সিস্টেম থেকে ইউজার তার মূল অ্যাকাউন্টে নির্ধারিত রিওয়ার্ড পয়েন্ট/টাকা পাবে।
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PERSISTENT BANNER ADS CONTROLS (ADSTERRA 728x90) */}
      <AdminBannerAdsCard />

      {/* REAL AD / VIDEO PLAYER SETTINGS (IN-PLACE BUTTON PLAYER) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 sm:p-5 rounded-3xl border border-indigo-500/30 text-white space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xs">
              <PlaySquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm sm:text-base text-white">
                  {isBn ? 'ইনকাম বাটনের Real Ad / Video Player কন্ট্রোল' : 'Button Real Ad & Video Player Settings'}
                </h4>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  rpEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  {rpEnabled ? (isBn ? 'সক্রিয় (Active)' : 'Active') : (isBn ? 'নিষ্ক্রিয় (Disabled)' : 'Disabled')}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isBn 
                  ? 'ইউজার “ইনকাম করুন (বিজ্ঞাপন দেখুন)” বাটনে চাপ দিলে নিচের সেট করা Video বা Ad এই সেকশনের ভেতরেই প্লে হবে।'
                  : 'Configure the Video URL or Ad URL that plays in-place when user clicks Start Earning.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRpEnabled(!rpEnabled)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                rpEnabled 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{rpEnabled ? (isBn ? 'চালু আছে' : 'Enabled') : (isBn ? 'বন্ধ আছে' : 'Disabled')}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveRealPlayerOnly}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs flex items-center gap-1 transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isBn ? 'সেভ করুন' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Content Type Selector: Video Player vs Ad URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">
            {isBn ? 'বিজ্ঞাপনের ফরম্যাট নির্বাচন করুন:' : 'Select Player Format:'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRpContentType('video')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                rpContentType === 'video'
                  ? 'bg-sky-500/20 border-sky-400 text-white font-black shadow-inner'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                rpContentType === 'video' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                <Video className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black block">
                  {isBn ? 'ভিডিও প্লেয়ার (Video URL)' : 'Video Player'}
                </span>
                <span className="text-[10px] opacity-80 block">
                  YouTube, MP4 বা সরাসরি ভিডিও
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRpContentType('ad')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                rpContentType === 'ad'
                  ? 'bg-emerald-500/20 border-emerald-400 text-white font-black shadow-inner'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                rpContentType === 'ad' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black block">
                  {isBn ? 'বিজ্ঞাপন URL (Ad / Web URL)' : 'Ad / Web URL'}
                </span>
                <span className="text-[10px] opacity-80 block">
                  স্পন্সর লিংক, ওয়েব ল্যান্ডিং পেজ
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Video URL or Ad URL Input with Preset Buttons */}
        {rpContentType === 'video' ? (
          <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-sky-400" />
                <span>{isBn ? 'ভিডিও URL (YouTube লিংক বা সরাসরি MP4 ভিডিও লিংক) *' : 'Video URL (YouTube or direct MP4) *'}</span>
              </label>
              <span className="text-[10px] text-slate-400">অটোমেটিক এমবেড প্লেয়ার</span>
            </div>

            <input
              type="url"
              required
              value={rpVideoUrl}
              onChange={(e) => setRpVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:border-sky-400 outline-hidden"
            />

            {/* Ready Video URL Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
              <span className="text-slate-400 font-bold text-[10px]">এক ক্লিকে ডেমো বসান:</span>
              <button
                type="button"
                onClick={() => setRpVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-sky-300 rounded-lg font-semibold text-[10px] cursor-pointer"
              >
                YouTube ডেমো ভিডিও
              </button>
              <button
                type="button"
                onClick={() => setRpVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-sky-300 rounded-lg font-semibold text-[10px] cursor-pointer"
              >
                সরাসরি MP4 ভিডিও
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? 'বিজ্ঞাপন URL (Ad Network Direct Link বা Sponsor Web URL) *' : 'Ad URL (Ad Network Direct Link / Sponsor Web URL) *'}</span>
              </label>
              <span className="text-[10px] text-slate-400">নিরাপদ স্যান্ডবক্স প্লেয়ার</span>
            </div>

            <input
              type="url"
              required
              value={rpAdUrl}
              onChange={(e) => setRpAdUrl(e.target.value)}
              placeholder="https://goodlife.com.bd বা Adsterra Direct Link..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-400 outline-hidden"
            />

            {/* Ready Ad URL Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
              <span className="text-slate-400 font-bold text-[10px]">এক ক্লিকে ডেমো বসান:</span>
              <button
                type="button"
                onClick={() => setRpAdUrl('https://goodlife.com.bd')}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-emerald-300 rounded-lg font-semibold text-[10px] cursor-pointer"
              >
                রয়েল শপ স্পন্সর লিংক
              </button>
              <button
                type="button"
                onClick={() => setRpAdUrl('https://t.me/goodlifeofficialbd')}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-emerald-300 rounded-lg font-semibold text-[10px] cursor-pointer"
              >
                টেলিগ্রাম অফার লিংক
              </button>
            </div>
          </div>
        )}

        {/* Title, Sponsor Name & Duration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
            <label className="text-slate-300 font-bold block mb-1">বিজ্ঞাপনের শিরোনাম / নাম</label>
            <input
              type="text"
              value={rpTitle}
              onChange={(e) => setRpTitle(e.target.value)}
              placeholder="যেমন: স্পেশাল মেম্বারশিপ অফার"
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium text-xs"
            />
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
            <label className="text-slate-300 font-bold block mb-1">স্পন্সর ব্র্যান্ডের নাম</label>
            <input
              type="text"
              value={rpSponsorName}
              onChange={(e) => setRpSponsorName(e.target.value)}
              placeholder="Good Life Official"
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium text-xs"
            />
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
            <label className="text-slate-300 font-bold block mb-1">টাইমার (কত সেকেন্ড দেখবে)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={rpDuration}
              onChange={(e) => setRpDuration(Number(e.target.value))}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs"
            />
          </div>
        </div>

        {/* Action Buttons: Live Preview & Save */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setIsRpPreviewOpen(!isRpPreviewOpen)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold text-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <PlaySquare className="w-3.5 h-3.5 text-sky-400" />
            <span>{isRpPreviewOpen ? (isBn ? 'প্রিভিউ বন্ধ করুন' : 'Close Preview') : (isBn ? 'প্লেয়ার লাইভ প্রিভিউ দেখুন' : 'Live Player Preview')}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveRealPlayerOnly}
            className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isBn ? 'এই Real Player সেটিংস সেভ করুন' : 'Save Real Player Settings'}</span>
          </button>
        </div>

        {/* Live Preview Container if open */}
        {isRpPreviewOpen && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-700 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">লাইভ প্লেয়ার প্রিভিউ (ইউজাররা যেভাবে দেখবে):</span>
              <button
                type="button"
                onClick={() => setIsRpPreviewOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                বন্ধ
              </button>
            </div>
            <RealAdVideoPlayer
              config={{
                enabled: rpEnabled,
                contentType: rpContentType,
                videoUrl: rpVideoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                adUrl: rpAdUrl.trim() || 'https://goodlife.com.bd',
                title: rpTitle.trim() || 'লাইভ টেস্ট ভিডিও/বিজ্ঞাপন',
                sponsorName: rpSponsorName.trim() || 'Good Life Partner',
                durationSeconds: Number(rpDuration) || 10
              }}
              rewardAmount={Number(reward) || 0.20}
              onClose={() => setIsRpPreviewOpen(false)}
              onRewardClaimed={() => showToast('প্রিভিউ টেস্ট: রিওয়ার্ড সম্পূর্ণ হয়েছে!')}
              isBn={isBn}
            />
          </div>
        )}
      </div>

      {/* Numerical Settings Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        
        {/* Total Ads per session */}
        <div className="bg-sky-50/60 p-3 rounded-2xl border border-sky-100">
          <label className="font-bold text-sky-950 flex items-center gap-1 mb-1">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            <span>{isBn ? 'সেশনে কয়টি বিজ্ঞাপন' : 'Total Ads'}</span>
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={totalAds}
            onChange={(e) => setTotalAds(Number(e.target.value))}
            className="w-full p-2 bg-white border border-sky-200 rounded-xl font-black text-sky-700 text-sm"
          />
          <span className="text-[10px] text-gray-500 block mt-1">ডিফল্ট: ৩টি বিজ্ঞাপন</span>
        </div>

        {/* Duration per Ad */}
        <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100">
          <label className="font-bold text-indigo-950 flex items-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isBn ? 'প্রতি বিজ্ঞাপনের সময়' : 'Time per Ad'}</span>
          </label>
          <input
            type="number"
            min="5"
            max="60"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-black text-indigo-700 text-sm"
          />
          <span className="text-[10px] text-gray-500 block mt-1">সেকেন্ডে (যেমন: ১০s)</span>
        </div>

        {/* Reward per session */}
        <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
          <label className="font-bold text-emerald-950 flex items-center gap-1 mb-1">
            <Gift className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isBn ? 'সেশন রিওয়ার্ড (৳)' : 'Session Reward (৳)'}</span>
          </label>
          <input
            type="number"
            step="0.10"
            min="0.1"
            value={reward}
            onChange={(e) => setReward(Number(e.target.value))}
            className="w-full p-2 bg-white border border-emerald-200 rounded-xl font-black text-emerald-700 text-sm"
          />
          <span className="text-[10px] text-gray-500 block mt-1">সবগুলো দেখলে আয়</span>
        </div>

        {/* Cooldown duration */}
        <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
          <label className="font-bold text-amber-950 flex items-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{isBn ? 'বিরতির সময়কাল' : 'Cooldown Time'}</span>
          </label>
          <input
            type="number"
            min="1"
            max="720"
            value={cooldown}
            onChange={(e) => setCooldown(Number(e.target.value))}
            className="w-full p-2 bg-white border border-amber-200 rounded-xl font-black text-amber-700 text-sm"
          />
          <span className="text-[10px] text-gray-500 block mt-1">মিনিটে (যেমন: ৩০ মিনিট)</span>
        </div>

      </div>

      <button
        type="button"
        onClick={handleSaveConfig}
        className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        <Save className="w-4 h-4" />
        <span>{isBn ? 'বিজ্ঞাপন সেটিংস সংরক্ষণ করুন' : 'Save Ads Configuration'}</span>
      </button>

      {/* Ads List Management */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-xs sm:text-sm text-gray-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isBn ? 'সক্রিয় বিজ্ঞাপনের সিকোয়েন্স তালিকা' : 'Active Ads List'}</span>
          </h4>

          <button
            type="button"
            onClick={() => {
              if (isAddingAd) {
                resetForm();
              } else {
                setIsAddingAd(true);
              }
            }}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingAd ? 'ফর্ম বন্ধ করুন' : '+ নতুন বিজ্ঞাপন বসান'}</span>
          </button>
        </div>

        {/* Add / Edit Ad Form Modal/Card */}
        {isAddingAd && (
          <form onSubmit={handleFormSubmit} className="bg-slate-50 border-2 border-sky-200 rounded-3xl p-4 space-y-3 text-xs animate-fade-in shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h5 className="font-black text-gray-900 flex items-center gap-1.5 text-xs sm:text-sm">
                {editingAdId ? <Edit2 className="w-4 h-4 text-amber-600" /> : <Plus className="w-4 h-4 text-sky-600" />}
                <span>{editingAdId ? (isBn ? 'বিজ্ঞাপন সম্পাদনা করুন' : 'Edit Advertisement') : (isBn ? 'নতুন বিজ্ঞাপন বসান' : 'Add New Advertisement')}</span>
              </h5>
              <button
                type="button"
                onClick={resetForm}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ready Preset Templates */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-gray-500 font-bold">এক ক্লিকে ডেমো টেমপ্লেট:</span>
              
              <button
                type="button"
                onClick={() => {
                  setFormTitle('Adsterra প্রিমিয়াম স্পন্সর লিংক');
                  setFormSponsor('Adsterra Network');
                  setFormMediaType('adnetwork_direct');
                  setFormAdNetworkProvider('adsterra');
                  setFormAdNetworkDirectUrl('https://www.google.com'); // sample fallback
                  setFormMediaUrl('https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80');
                  setFormDesc('Adsterra গ্লোবাল স্পনসর বিজ্ঞাপন। কাউন্টডাউন শেষ পর্যন্ত অপেক্ষা করুন।');
                }}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Globe className="w-3 h-3 text-amber-600" />
                <span>Adsterra Direct Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormTitle('Monetag স্মার্টলিঙ্ক অফার');
                  setFormSponsor('Monetag Network');
                  setFormMediaType('adnetwork_direct');
                  setFormAdNetworkProvider('monetag');
                  setFormAdNetworkDirectUrl('https://www.google.com');
                  setFormMediaUrl('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80');
                  setFormDesc('Monetag পার্টনার স্পনসর অফার।');
                }}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Globe className="w-3 h-3 text-indigo-600" />
                <span>Monetag SmartLink</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormTitle('রিসেলিং মেগা ডিসকাউন্ট অফার');
                  setFormSponsor('রয়েল শপ বিডি');
                  setFormMediaType('banner');
                  setFormMediaUrl('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80');
                  setFormTargetUrl('https://goodlife.com.bd');
                  setFormDesc('প্রতিটি কেনাকাটায় আকর্ষণীয় ক্যাশব্যাক ও ফ্রি হোম ডেলিভারি!');
                }}
                className="px-2 py-1 bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold rounded-lg cursor-pointer"
              >
                ব্যানার অফার
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormTitle('অনলাইন ফ্রিল্যান্সিং টিউটোরিয়াল');
                  setFormSponsor('Good Life Academy');
                  setFormMediaType('video');
                  setFormMediaUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                  setFormTargetUrl('https://youtube.com');
                  setFormDesc('ঘরে বসে মোবাইল দিয়ে ফ্রিল্যান্সিং ও কাজের সহজ উপায় শিখুন।');
                }}
                className="px-2 py-1 bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold rounded-lg cursor-pointer"
              >
                ইউটিউব ভিডিও
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormTitle('Adsterra স্পন্সরড রিওয়ার্ডেড বিজ্ঞাপন');
                  setFormSponsor('Adsterra Ad Network');
                  setFormMediaType('video');
                  setFormMediaUrl('sdk:adsterra:a5ea718688da962e97053af64e1de8f0');
                  setFormTargetUrl('');
                  setFormDesc('Adsterra বিজ্ঞাপনটি সম্পূর্ণ দেখুন এবং আকর্ষণীয় বোনাস রিওয়ার্ড উপভোগ করুন!');
                }}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Video className="w-3 h-3 text-blue-600" />
                <span>Adsterra (a5ea718688da962e97053af64e1de8f0)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormTitle('স্পন্সরড রিওয়ার্ডেড ভিডিও বিজ্ঞাপন');
                  setFormSponsor('Monetag Video Ads');
                  setFormMediaType('video');
                  setFormMediaUrl('sdk:show_9796489');
                  setFormTargetUrl('');
                  setFormDesc('ভিডিও বিজ্ঞাপনটি দেখুন এবং আকর্ষণীয় বোনাস রিওয়ার্ড উপভোগ করুন!');
                }}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Video className="w-3 h-3 text-purple-600" />
                <span>ভিডিও SDK (Zone 9796489)</span>
              </button>
            </div>

            {/* Media Type Selector */}
            <div className="bg-white p-3 rounded-2xl border border-gray-200 space-y-2">
              <label className="font-bold text-gray-900 block">
                বিজ্ঞাপনের ধরণ বা ফরম্যাট বেছে নিন *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setFormMediaType('banner')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    formMediaType === 'banner'
                      ? 'bg-sky-50 border-sky-500 text-sky-800 font-black shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 font-semibold'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                  <span className="text-[11px] block">ছবি ব্যানার</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormMediaType('video')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    formMediaType === 'video'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-800 font-black shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 font-semibold'
                  }`}
                >
                  <Video className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                  <span className="text-[11px] block">ভিডিও বিজ্ঞাপন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormMediaType('adnetwork_direct')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    formMediaType === 'adnetwork_direct'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-black shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 font-semibold'
                  }`}
                >
                  <Globe className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                  <span className="text-[11px] block">এড নেটওয়ার্ক ডিরেক্ট লিংক</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormMediaType('adnetwork_script')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    formMediaType === 'adnetwork_script'
                      ? 'bg-purple-50 border-purple-500 text-purple-900 font-black shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 font-semibold'
                  }`}
                >
                  <Code className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                  <span className="text-[11px] block">স্ক্রিপ্ট / ব্যানার কোড</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-800 block mb-1">বিজ্ঞাপনের নাম / শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="যেমন: Adsterra স্পন্সর ক্যাম্পেইন"
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">স্পন্সর বা নেটওয়ার্কের নাম</label>
                <input
                  type="text"
                  value={formSponsor}
                  onChange={(e) => setFormSponsor(e.target.value)}
                  placeholder="যেমন: Adsterra Network / Monetag"
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            {/* AD NETWORK DIRECT LINK SPECIFIC INPUTS */}
            {formMediaType === 'adnetwork_direct' && (
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-2.5 animate-fade-in">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <span>এড নেটওয়ার্ক ডিরেক্ট লিংক কনফিগারেশন:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">নেটওয়ার্ক নির্বাচন করুন:</label>
                    <select
                      value={formAdNetworkProvider}
                      onChange={(e) => setFormAdNetworkProvider(e.target.value as any)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-xl font-bold text-xs"
                    >
                      <option value="adsterra">Adsterra (Direct Link)</option>
                      <option value="monetag">Monetag (SmartLink)</option>
                      <option value="propeller">PropellerAds</option>
                      <option value="adsense">Google AdSense</option>
                      <option value="custom">অন্যান্য (Custom Network)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ডিরেক্ট লিংক (Direct Link URL) *</label>
                    <input
                      type="url"
                      required
                      value={formAdNetworkDirectUrl}
                      onChange={(e) => {
                        setFormAdNetworkDirectUrl(e.target.value);
                        setFormTargetUrl(e.target.value);
                      }}
                      placeholder="https://omg10.com/... বা ডিরেক্ট লিংক"
                      className="w-full p-2 bg-white border border-amber-300 rounded-xl font-mono text-xs text-slate-900"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-amber-800">
                  💡 ব্যবহারকারী যখন এই বিজ্ঞাপনের সময় 'ইনকাম করুন' দেখবে, তখন এই লিংকে প্রবেশ করতে পারবে এবং টাইমার শেষ হতেই রিওয়ার্ড পাবে।
                </p>
              </div>
            )}

            {/* AD NETWORK SCRIPT / HTML CODE INPUTS */}
            {formMediaType === 'adnetwork_script' && (
              <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 space-y-2.5 animate-fade-in">
                <div className="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                  <Code className="w-4 h-4 text-purple-600" />
                  <span>এড নেটওয়ার্ক স্ক্রিপ্ট / এইচটিএমএল কোড:</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">এইচটিএমএল / স্ক্রিপ্ট অ্যাড ট্যাগ পেস্ট করুন *</label>
                  <textarea
                    rows={4}
                    required
                    value={formAdNetworkScriptCode}
                    onChange={(e) => setFormAdNetworkScriptCode(e.target.value)}
                    placeholder={'<script type="text/javascript" src="//..."></script> বা iframe কোড...'}
                    className="w-full p-2.5 bg-white border border-purple-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-purple-700 block mt-1">
                    Adsterra, Monetag বা AdSense থেকে প্রাপ্ত 300x250 ব্যানার কোড বা ইন-পেজ পুশ স্ক্রিপ্ট এখানে পেস্ট করুন।
                  </span>
                </div>
              </div>
            )}

            {/* Standard Banner Upload or Media URL */}
            {formMediaType === 'banner' && (
              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  বিজ্ঞাপনের ছবি নির্বাচন বা লিংক *
                </label>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
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
                      className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-all cursor-pointer text-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>ডিভাইস থেকে আপলোড</span>
                    </button>
                    <input
                      type="text"
                      required
                      value={formMediaUrl}
                      onChange={(e) => setFormMediaUrl(e.target.value)}
                      placeholder="বা ছবির সরাসরি লিংক পেস্ট করুন..."
                      className="flex-1 p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  {formMediaUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 max-h-32 bg-gray-100 flex items-center justify-center">
                      <img src={formMediaUrl} alt="Preview" className="max-h-28 object-contain" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setFormMediaUrl('')}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white rounded-full cursor-pointer hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {formMediaType === 'video' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="font-bold text-gray-800 block">ইউটিউব / ভিডিও লিংক বা SDK ট্যাগ *</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setFormMediaUrl('sdk:adsterra:a5ea718688da962e97053af64e1de8f0')}
                      className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Video className="w-3 h-3" />
                      <span>Adsterra (a5ea718688da962e97053af64e1de8f0)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormMediaUrl('sdk:show_9796489')}
                      className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Video className="w-3 h-3" />
                      <span>Monetag (9796489)</span>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  placeholder="https://... বা 'sdk:adsterra:a5ea718688da962e97053af64e1de8f0' বা 'sdk:show_9796489'"
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs"
                />
                <p className="text-[10px] text-gray-500">
                  💡 ভিডিও বিজ্ঞাপনের জন্য ইউটিউব/এমপি৪ ভিডিও দিতে পারেন, অথবা <code>sdk:adsterra:a5ea718688da962e97053af64e1de8f0</code> বা <code>sdk:show_9796489</code> দিলে ইনস্টল্ড অ্যাড নেটওয়ার্ক SDK চালু হবে।
                </p>
              </div>
            )}

            {/* Target URL if applicable */}
            {formMediaType !== 'adnetwork_direct' && (
              <div>
                <label className="font-bold text-gray-800 block mb-1">টার্গেট ওয়েবসাইট বা টেলিগ্রাম লিংক (ঐচ্ছিক)</label>
                <input
                  type="url"
                  value={formTargetUrl}
                  onChange={(e) => setFormTargetUrl(e.target.value)}
                  placeholder="https://t.me/goodlifeofficialbd"
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
                />
              </div>
            )}

            <div>
              <label className="font-bold text-gray-800 block mb-1">বিজ্ঞাপনের ছোট বিবরণ (ঐচ্ছিক)</label>
              <input
                type="text"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="বিজ্ঞাপন সম্পর্কিত এক লাইনের বার্তা..."
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md transition-all cursor-pointer text-center text-xs sm:text-sm"
              >
                {editingAdId ? (isBn ? 'বিজ্ঞাপন আপডেট করুন' : 'Update Ad') : (isBn ? 'বিজ্ঞাপন সংরক্ষণ করুন' : 'Save Ad')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all cursor-pointer text-xs sm:text-sm"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </form>
        )}

        {/* Existing Ads List */}
        <div className="space-y-2">
          {adsList.map((ad, idx) => (
            <div 
              key={ad.id}
              className="bg-gray-50 hover:bg-white border border-gray-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-xl bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>

                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-300 flex items-center justify-center">
                  {ad.mediaType === 'video' ? (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                      <Video className="w-5 h-5 text-sky-400" />
                    </div>
                  ) : ad.mediaType === 'adnetwork_direct' ? (
                    <div className="w-full h-full bg-amber-500 flex items-center justify-center text-white">
                      <Globe className="w-5 h-5" />
                    </div>
                  ) : ad.mediaType === 'adnetwork_script' ? (
                    <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white">
                      <Code className="w-5 h-5" />
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
                </div>

                <div className="min-w-0 space-y-0.5">
                  <h5 className="font-black text-gray-900 truncate text-xs sm:text-sm">{ad.title}</h5>
                  <p className="text-[11px] text-gray-500 truncate flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">{ad.sponsorName}</span>
                    
                    {ad.mediaType === 'video' && (
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                        ভিডিও
                      </span>
                    )}
                    {ad.mediaType === 'adnetwork_direct' && (
                      <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                        <Globe className="w-2.5 h-2.5" />
                        <span>{ad.adNetworkProvider || 'Adsterra'} Direct</span>
                      </span>
                    )}
                    {ad.mediaType === 'adnetwork_script' && (
                      <span className="text-[10px] text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                        <Code className="w-2.5 h-2.5" />
                        <span>স্ক্রিপ্ট ব্যানার</span>
                      </span>
                    )}
                    {ad.mediaType === 'banner' && (
                      <span className="text-[10px] text-gray-500 font-medium">
                        ছবি ব্যানার
                      </span>
                    )}
                  </p>
                  {(ad.targetUrl || ad.adNetworkDirectUrl) && (
                    <span className="text-[10px] text-sky-600 truncate flex items-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5" />
                      {ad.adNetworkDirectUrl || ad.targetUrl}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartEdit(ad)}
                  className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                  title="বিজ্ঞাপন এডিট করুন"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAd(ad.id)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="বিজ্ঞাপন মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {adsList.length === 0 && (
            <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 text-xs space-y-2">
              <p>কোনো সক্রিয় বিজ্ঞাপন নেই।</p>
              <button
                type="button"
                onClick={() => setIsAddingAd(true)}
                className="px-3 py-1.5 bg-sky-600 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                + প্রথম বিজ্ঞাপন বসান
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
