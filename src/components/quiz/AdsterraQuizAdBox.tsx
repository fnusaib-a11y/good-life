import React, { useState, useEffect, useRef, useId } from 'react';
import { 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Gift,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdsterraQuizAdBoxProps {
  step: 1 | 2;
  stepTitle: string;
  stepDescription: string;
  durationSeconds?: number;
  rewardPoints: number;
  adsterraKey?: string;
  adsterraDirectUrl?: string;
  onAdCompleted: () => void;
  onProceed: () => void;
  isCompleted: boolean;
}

export const AdsterraQuizAdBox: React.FC<AdsterraQuizAdBoxProps> = ({
  step,
  stepTitle,
  stepDescription,
  durationSeconds = 15,
  rewardPoints,
  adsterraKey,
  adsterraDirectUrl,
  onAdCompleted,
  onProceed,
  isCompleted
}) => {
  const { isBn, systemSettings } = useApp();
  const uniqueInstanceId = useId().replace(/:/g, '_');
  
  // Resolution of Adsterra Key and Script URL
  const bannerConfig = systemSettings?.pageBannerAds;
  const activeKey = (adsterraKey && adsterraKey.trim()) 
    ? adsterraKey.trim() 
    : (bannerConfig?.adKey && bannerConfig.adKey.trim())
    ? bannerConfig.adKey.trim()
    : 'b87ae65b2057f8d1935a8a65f245a61e';

  const scriptUrl = activeKey === 'b87ae65b2057f8d1935a8a65f245a61e'
    ? 'https://www.highrevenueformat.com/b87ae65b2057f8d1935a8a65f245a61e/invoke.js'
    : (activeKey === 'a5ea718688da962e97053af64e1de8f0')
    ? 'https://pl29897349.profitableratecpmnetwork.com/a5ea718688da962e97053af64e1de8f0/invoke.js'
    : `https://www.highrevenueformat.com/${activeKey}/invoke.js`;

  // State Management
  const [adState, setAdState] = useState<'initializing' | 'loading' | 'active' | 'completed' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(durationSeconds);
  const [containerWidth, setContainerWidth] = useState<number>(360);
  const [dynamicHeight, setDynamicHeight] = useState<number | null>(null);
  const [retryNonce, setRetryNonce] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<any>(null);
  const hasCompletedRef = useRef<boolean>(isCompleted);

  // Responsive dimensions: On mobile (320px-480px) use full-width 300x250 format, on desktop 468x60 / 728x90
  const isMobile = containerWidth < 600;
  const adWidth = isMobile 
    ? (containerWidth < 310 ? Math.max(250, Math.floor(containerWidth - 10)) : 300) 
    : (containerWidth < 768 ? 468 : 728);
  const baseAdHeight = isMobile ? 250 : 90;
  const adHeight = dynamicHeight ? Math.max(baseAdHeight, dynamicHeight) : baseAdHeight;

  // Responsive container width tracking
  useEffect(() => {
    const updateWidth = () => {
      if (!containerRef.current) return;
      const clientW = containerRef.current.clientWidth;
      if (clientW > 0) {
        setContainerWidth(clientW);
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // PostMessage event listener to communicate with sandboxed iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      
      const { type, adId, error, height } = event.data;
      if (adId !== uniqueInstanceId) return;

      if (type === 'ADSTERRA_RESIZE' && typeof height === 'number' && height >= 200) {
        setDynamicHeight(height);
      }

      if (type === 'ADSTERRA_LOADED' || type === 'ADSTERRA_CONTENT_VERIFIED') {
        console.log(`[Adsterra] Ad instance ${uniqueInstanceId} successfully loaded and rendered.`);
        setAdState(prev => (prev === 'completed' ? 'completed' : 'active'));
        setErrorMessage(null);
      } else if (type === 'ADSTERRA_FAILED') {
        const errorDetail = error || 'Network or AdBlocker blocked Adsterra script';
        console.error(`[Adsterra] Failed to load ad for instance ${uniqueInstanceId}:`, errorDetail);
        setErrorMessage(
          isBn 
            ? 'Adsterra বিজ্ঞাপনটি লোড হতে পারেনি। আপনার ব্রাউজারের AdBlocker বন্ধ করে পুনরায় চেষ্টা করুন।' 
            : 'Adsterra Ad failed to load. Please disable AdBlocker and retry.'
        );
        setAdState('error');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [uniqueInstanceId, isBn]);

  // Inject Isolated Adsterra Document into iframe on mount or retry
  useEffect(() => {
    setAdState('loading');
    setErrorMessage(null);
    setTimeRemaining(durationSeconds);
    hasCompletedRef.current = isCompleted;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      min-height: 100%;
      background: transparent;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: visible;
    }
    #ad-wrapper {
      width: 100%;
      max-width: 100%;
      min-height: ${baseAdHeight}px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: visible;
      margin: 0 auto;
    }
    #ad-wrapper > * {
      max-width: 100% !important;
    }
    #ad-wrapper iframe, #ad-wrapper img {
      max-width: 100% !important;
      height: auto !important;
      display: block !important;
      margin: 0 auto !important;
    }
  </style>
</head>
<body>
  <div id="ad-wrapper">
    <div id="container-${activeKey}"></div>
    <script type="text/javascript">
      atOptions = {
        'key' : '${activeKey}',
        'format' : 'iframe',
        'height' : ${baseAdHeight},
        'width' : ${adWidth},
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="${scriptUrl}" 
      onload="try { window.parent.postMessage({ type: 'ADSTERRA_LOADED', adId: '${uniqueInstanceId}' }, '*'); } catch(e){}"
      onerror="try { window.parent.postMessage({ type: 'ADSTERRA_FAILED', adId: '${uniqueInstanceId}', error: 'Script load blocked or failed' }, '*'); } catch(e){}">
    </script>
  </div>
  <script type="text/javascript">
    // Auto-detect rendered height for responsive auto-expansion
    function reportSize() {
      try {
        var h = document.body.scrollHeight || document.documentElement.scrollHeight;
        if (h && h > 150) {
          window.parent.postMessage({ type: 'ADSTERRA_RESIZE', adId: '${uniqueInstanceId}', height: h }, '*');
        }
      } catch(e) {}
    }
    window.addEventListener('load', reportSize);
    setTimeout(reportSize, 1000);
    setTimeout(reportSize, 2500);

    // Secondary check to confirm DOM element presence
    setTimeout(function() {
      try {
        var el = document.getElementById('ad-wrapper');
        if (el && (el.children.length > 2 || el.querySelector('iframe, a, img'))) {
          window.parent.postMessage({ type: 'ADSTERRA_CONTENT_VERIFIED', adId: '${uniqueInstanceId}' }, '*');
        } else {
          window.parent.postMessage({ type: 'ADSTERRA_LOADED', adId: '${uniqueInstanceId}' }, '*');
        }
      } catch(e) {}
    }, 2500);
  </script>
</body>
</html>`;

    try {
      iframe.srcdoc = htmlDocument;
    } catch (err: any) {
      console.error('[Adsterra] Failed to assign srcdoc to iframe:', err);
      try {
        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(htmlDocument);
          doc.close();
        }
      } catch (innerErr) {
        console.error('[Adsterra] Fatal error injecting into iframe:', innerErr);
        setErrorMessage(isBn ? 'বিজ্ঞাপন ফ্রেম তৈরিতে ত্রুটি।' : 'Failed to create ad frame.');
        setAdState('error');
      }
    }

    // Safety fallback: if ad doesn't report within 4s, activate timer so user isn't stuck
    const fallbackTimer = setTimeout(() => {
      setAdState(curr => (curr === 'loading' ? 'active' : curr));
    }, 4000);

    return () => {
      clearTimeout(fallbackTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeKey, scriptUrl, adWidth, adHeight, durationSeconds, retryNonce, uniqueInstanceId, isCompleted, isBn]);

  // Verified Countdown Timer (Active while Ad is showing)
  useEffect(() => {
    if (isCompleted) {
      setAdState('completed');
      return;
    }

    if (adState !== 'active') return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            setAdState('completed');
            onAdCompleted();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [adState, isCompleted, onAdCompleted]);

  const handleRetry = () => {
    setErrorMessage(null);
    setAdState('loading');
    setRetryNonce(prev => prev + 1);
  };

  const progressPercent = Math.max(0, Math.min(100, ((durationSeconds - timeRemaining) / durationSeconds) * 100));

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Header Info Card */}
      <div className={`rounded-2xl p-4 border transition-all ${
        step === 1 
          ? 'bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-purple-200' 
          : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center font-black text-sm shrink-0 mt-0.5 shadow-sm ${
            step === 1 ? 'bg-purple-600' : 'bg-emerald-600'
          }`}>
            {step}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h5 className={`font-bold text-xs sm:text-sm truncate ${
                step === 1 ? 'text-purple-950' : 'text-emerald-950'
              }`}>
                {stepTitle}
              </h5>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                step === 1 
                  ? 'bg-purple-200/80 text-purple-800' 
                  : 'bg-emerald-200/80 text-emerald-800'
              }`}>
                Adsterra Verified
              </span>
            </div>
            <p className={`text-[11px] leading-snug ${
              step === 1 ? 'text-purple-800' : 'text-emerald-800'
            }`}>
              {stepDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Official Adsterra Interactive Ad Display Box */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-800 space-y-4">
        
        {/* Top Ad Status Bar & Live Countdown */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs font-black shrink-0">
              A
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">Adsterra Ad Network</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                Zone: {activeKey.substring(0, 10)}...
              </span>
            </div>
          </div>

          {/* Countdown / Verification Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
            hasCompletedRef.current || isCompleted || adState === 'completed'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : adState === 'error'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            {hasCompletedRef.current || isCompleted || adState === 'completed' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? 'বিজ্ঞাপন দেখা সম্পন্ন' : 'Ad Completed'}</span>
              </>
            ) : adState === 'error' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{isBn ? 'ত্রুটি' : 'Error'}</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span>{timeRemaining}s {isBn ? 'বাকি' : 'left'}</span>
              </>
            )}
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 transition-all duration-300 ease-linear rounded-full"
            style={{ width: `${hasCompletedRef.current || isCompleted ? 100 : progressPercent}%` }}
          />
        </div>

        {/* Dedicated Reserved Adsterra Ad Container */}
        <div 
          ref={containerRef}
          className="w-full max-w-full bg-slate-950/70 rounded-xl border border-slate-800 p-1 sm:p-3 relative flex flex-col items-center justify-center min-h-[250px] sm:min-h-[260px] h-auto overflow-visible"
        >
          {/* Loading Skeleton */}
          {adState === 'loading' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 text-center p-4 space-y-2.5 rounded-xl">
              <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200">
                  {isBn ? 'Adsterra বিজ্ঞাপন লোড হচ্ছে...' : 'Loading Adsterra Ad...'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isBn ? 'অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন' : 'Please wait a moment...'}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {adState === 'error' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/95 p-4 text-center space-y-3 rounded-xl">
              <AlertCircle className="w-7 h-7 text-rose-400" />
              <div className="space-y-1 max-w-xs">
                <p className="text-xs font-bold text-rose-200">
                  {errorMessage || (isBn ? 'বিজ্ঞাপন লোড হতে পারেনি।' : 'Ad could not be loaded.')}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isBn ? 'বিজ্ঞাপন সফলভাবে লোড না হলে কুইজ বা রিওয়ার্ড গ্রহণ করা যাবে না।' : 'Ad viewing is required to proceed.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isBn ? 'পুনরায় চেষ্টা করুন' : 'Retry Now'}</span>
              </button>
            </div>
          )}

          {/* Sandboxed Adsterra iframe container */}
          <div 
            className="w-full max-w-full flex items-center justify-center relative my-auto overflow-visible"
            style={{ minHeight: `${adHeight}px` }}
          >
            <iframe
              ref={iframeRef}
              id={`adsterra-frame-${uniqueInstanceId}`}
              title="Adsterra Ad Frame"
              className="w-full max-w-full border-0 bg-transparent block"
              style={{
                width: '100%',
                maxWidth: '100%',
                minHeight: `${adHeight}px`,
                height: `${adHeight}px`
              }}
              scrolling="no"
            />
          </div>

          {/* Direct Offer Smartlink if configured */}
          {adsterraDirectUrl && (
            <div className="pt-2">
              <a
                href={adsterraDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-purple-300 hover:text-white underline font-semibold flex items-center gap-1 transition-colors"
              >
                <span>{isBn ? 'স্পন্সর অফার দেখুন ↗' : 'View Sponsor Offer ↗'}</span>
              </a>
            </div>
          )}
        </div>

        {/* Action Button: Strictly locked until ad is fully completed */}
        <div className="pt-1">
          {hasCompletedRef.current || isCompleted || adState === 'completed' ? (
            <button
              type="button"
              onClick={onProceed}
              className={`w-full py-3.5 px-5 rounded-xl text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
                step === 1
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {step === 1 
                  ? (isBn ? 'বিজ্ঞাপন দেখা সম্পন্ন — কুইজ শুরু করুন ➔' : 'Ad Completed — Start Quiz ➔')
                  : (isBn ? `বিজ্ঞাপন সম্পন্ন — +${rewardPoints} পয়েন্ট সংগ্রহ করুন ➔` : `Ad Completed — Claim +${rewardPoints} Pts ➔`)
                }
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3.5 px-5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs sm:text-sm border border-slate-700/60 flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
            >
              <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span>
                {step === 1
                  ? (isBn ? `বিজ্ঞাপন চলছে... (${timeRemaining}s বাকি থাকলে কুইজ আনলক হবে)` : `Watching Ad... (${timeRemaining}s left to unlock quiz)`)
                  : (isBn ? `বিজ্ঞাপন চলছে... (${timeRemaining}s বাকি থাকলে রিওয়ার্ড আনলক হবে)` : `Watching Ad... (${timeRemaining}s left to unlock reward)`)
                }
              </span>
            </button>
          )}
        </div>

      </div>

      {/* Footer Info Badge */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1 font-semibold text-slate-700">
          <Gift className="w-3.5 h-3.5 text-amber-500" />
          {isBn ? `নিশ্চিত পুরস্কার: +${rewardPoints} Points` : `Guaranteed Reward: +${rewardPoints} Pts`}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          {isBn ? 'ভেরিফাইড স্পন্সর পার্টনার' : 'Verified Sponsor Partner'}
        </span>
      </div>

    </div>
  );
};
