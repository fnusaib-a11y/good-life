import React, { useState, useEffect, useRef, useId } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  AlertCircle,
  RefreshCw,
  Gift
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TypingLargeAdModalProps {
  isOpen: boolean;
  rewardAmount: number;
  durationSeconds?: number;
  adsterraKey?: string;
  onAdCompleted: () => void;
  onClaimReward: () => void;
  isClaiming: boolean;
}

export const TypingLargeAdModal: React.FC<TypingLargeAdModalProps> = ({
  isOpen,
  rewardAmount,
  durationSeconds = 15,
  adsterraKey,
  onAdCompleted,
  onClaimReward,
  isClaiming
}) => {
  const { systemSettings, isBn } = useApp();
  const componentId = useId().replace(/:/g, '_');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [timeRemaining, setTimeRemaining] = useState<number>(durationSeconds);
  const [adFinished, setAdFinished] = useState<boolean>(false);
  const [reloadCount, setReloadCount] = useState<number>(0);

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

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    setTimeRemaining(durationSeconds);
    setAdFinished(false);

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdFinished(true);
          onAdCompleted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, durationSeconds, reloadCount]);

  // Load Sandboxed Adsterra Ad inside iframe
  useEffect(() => {
    if (!isOpen) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body {
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: #0f172a;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: system-ui, -apple-system, sans-serif;
            }
            #ad-wrap {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          <div id="ad-wrap">
            <script type="text/javascript">
              atOptions = {
                'key' : '${activeKey}',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="${scriptUrl}"></script>
          </div>
        </body>
      </html>
    `;

    try {
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    } catch (e) {
      console.warn('[TypingLargeAdModal] Iframe write error:', e);
    }
  }, [isOpen, activeKey, scriptUrl, reloadCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div 
        id="typing-large-ad-dialog"
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-5 text-white text-center relative">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>টাইপিং কাজ সম্পন্ন হয়েছে</span>
          </div>
          <h2 className="text-xl font-bold mb-1">রিওয়ার্ড ক্লেইম ভেরিফিকেশন</h2>
          <p className="text-xs text-emerald-100">
            বিজ্ঞাপনটি সম্পূর্ণ দেখুন। টাইমার শেষ হলে ৳{rewardAmount} সরাসরি আপনার ওয়ালেটে যোগ হবে।
          </p>

          {/* Reward Floating Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-400 text-slate-900 font-extrabold px-3.5 py-1.5 rounded-full text-sm shadow-md">
            <Coins className="w-4 h-4 text-slate-900" />
            <span>পুরস্কার: +৳{rewardAmount}</span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white text-xs border-y border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>
              {adFinished ? (
                <span className="text-emerald-400 font-bold">বিজ্ঞাপন দেখা সম্পূর্ণ হয়েছে!</span>
              ) : (
                <span>বিজ্ঞাপন দেখতে বাকি: <strong className="text-amber-400 font-mono text-sm">{timeRemaining}</strong> সেকেন্ড</span>
              )}
            </span>
          </div>
          <button
            onClick={() => setReloadCount(c => c + 1)}
            title="বিজ্ঞাপন রিলোড"
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ad Container Box (Large 300x250 format) */}
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center min-h-[270px]">
          <div className="w-[300px] h-[250px] bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-slate-800">
            <iframe
              ref={iframeRef}
              key={`large-ad-${componentId}-${reloadCount}`}
              title="Typing Job Completion Ad"
              className="w-[300px] h-[250px] border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>অফিশিয়াল ভেরিফাইড এড নেটওয়ার্ক পার্টনার</span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
          {adFinished ? (
            <button
              id="btn-claim-typing-reward"
              onClick={onClaimReward}
              disabled={isClaiming}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Gift className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>{isClaiming ? 'ব্যালেন্সে যোগ হচ্ছে...' : `৳${rewardAmount} ওয়ালেটে যোগ করুন`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-full py-3 px-4 rounded-2xl bg-slate-200 text-slate-500 font-semibold text-xs flex items-center justify-center gap-2 cursor-wait">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>বিজ্ঞাপন শেষ হওয়া পর্যন্ত অপেক্ষা করুন ({timeRemaining} সে.)</span>
            </div>
          )}
          <p className="text-[11px] text-center text-slate-400">
            টাকা সরাসরি আপনার Good Life মূল অ্যাকাউন্টের ব্যালেন্সে যোগ হবে।
          </p>
        </div>
      </div>
    </div>
  );
};
