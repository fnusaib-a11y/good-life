import React, { useState, useEffect, useRef, useId } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  RefreshCw,
  Gift,
  ArrowLeft,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TypingJobItem } from '../../types';
import { TypingAccuracyResult } from '../../services/typingJobService';

interface TypingRewardVerificationViewProps {
  job: TypingJobItem;
  validation: TypingAccuracyResult;
  onClaimReward: () => void;
  onCancel: () => void;
  isClaiming: boolean;
  isClaimedSuccess: boolean;
  onGoToJobs: () => void;
  onGoToHistory: () => void;
}

export const TypingRewardVerificationView: React.FC<TypingRewardVerificationViewProps> = ({
  job,
  validation,
  onClaimReward,
  onCancel,
  isClaiming,
  isClaimedSuccess,
  onGoToJobs,
  onGoToHistory
}) => {
  const { systemSettings } = useApp();
  const componentId = useId().replace(/:/g, '_');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const durationSeconds = job.largeAdConfig?.durationSeconds || 15;
  const [timeRemaining, setTimeRemaining] = useState<number>(durationSeconds);
  const [adFinished, setAdFinished] = useState<boolean>(false);
  const [reloadCount, setReloadCount] = useState<number>(0);

  const bannerConfig = systemSettings?.pageBannerAds;
  const activeKey = (job.largeAdConfig?.adKey && job.largeAdConfig.adKey.trim())
    ? job.largeAdConfig.adKey.trim()
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
    if (isClaimedSuccess) return;
    setTimeRemaining(durationSeconds);
    setAdFinished(false);

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [durationSeconds, reloadCount, isClaimedSuccess]);

  // Load Sandboxed Adsterra Ad inside iframe
  useEffect(() => {
    if (isClaimedSuccess) return;
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
      console.warn('[TypingRewardVerificationView] Iframe write error:', e);
    }
  }, [activeKey, scriptUrl, reloadCount, isClaimedSuccess]);

  // If already successfully claimed, show direct full page success screen
  if (isClaimedSuccess) {
    return (
      <div className="w-full max-w-xl mx-auto py-8 px-4 flex flex-col items-center text-center animate-in fade-in">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-600/20 mb-4 animate-bounce">
          <Award className="w-10 h-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-1 rounded-full mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          কাজ সফলভাবে সম্পন্ন হয়েছে!
        </span>

        <h2 className="text-2xl font-black text-slate-800 mb-2">
          অভিনন্দন! রিওয়ার্ড যোগ হয়েছে
        </h2>
        <p className="text-sm text-slate-600 max-w-sm mb-6 leading-relaxed">
          আপনার কাজ যাচাই করে <strong>৳{job.rewardAmount}</strong> সরাসরি আপনার মূল ব্যালেন্সে যুক্ত করা হয়েছে।
        </p>

        {/* Reward card */}
        <div className="w-full bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm mb-6 flex flex-col items-center">
          <div className="text-xs text-slate-400 font-semibold mb-1">অর্জিত রিওয়ার্ড</div>
          <div className="text-3xl font-black text-emerald-600 font-mono mb-2">
            +৳{job.rewardAmount}
          </div>
          <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>টাইপিং নির্ভুলতা:</span>
            <strong className="text-emerald-700 font-bold">{validation.matchPercentage}% মিল</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onGoToJobs}
            className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>আরও কাজ করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onGoToHistory}
            className="flex-1 py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <span>আমার হিস্ট্রি দেখুন</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col pb-8 animate-in fade-in">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>এডিটরে ফিরে যান</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-5 rounded-3xl text-white text-center shadow-lg relative overflow-hidden mb-4">
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>টাইপিং যাচাইকরণ সফল (মিল: {validation.matchPercentage}%)</span>
        </div>
        <h2 className="text-xl font-bold mb-1">বিজ্ঞাপন ভেরিফিকেশন ও রিওয়ার্ড</h2>
        <p className="text-xs text-emerald-100 max-w-sm mx-auto leading-relaxed">
          নিচের বিজ্ঞাপনটি সম্পূর্ণ দেখুন। টাইমার শেষ হলে আপনার পুরস্কার অ্যাকাউন্টে যুক্ত হবে।
        </p>

        {/* Reward amount */}
        <div className="mt-3 inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-full text-sm shadow-md">
          <Coins className="w-4 h-4" />
          <span>পুরস্কার: +৳{job.rewardAmount}</span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="bg-slate-900 px-4 py-3 rounded-2xl flex items-center justify-between text-white text-xs border border-slate-800 shadow-xs mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>
            {adFinished ? (
              <span className="text-emerald-400 font-bold text-sm">বিজ্ঞাপন দেখা সম্পূর্ণ হয়েছে!</span>
            ) : (
              <span>বিজ্ঞাপন দেখতে বাকি: <strong className="text-amber-400 font-mono text-sm">{timeRemaining}</strong> সেকেন্ড</span>
            )}
          </span>
        </div>
        <button
          onClick={() => setReloadCount(c => c + 1)}
          title="বিজ্ঞাপন রিলোড করুন"
          className="text-slate-400 hover:text-white p-1 rounded transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="text-[10px]">রিলোড</span>
        </button>
      </div>

      {/* Large 300x250 Ad Card */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center mb-4">
        <div className="w-[300px] h-[250px] bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-slate-800">
          <iframe
            ref={iframeRef}
            key={`inpage-ad-${componentId}-${reloadCount}`}
            title="Typing Job Completion Ad"
            className="w-[300px] h-[250px] border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ভেরিফাইড স্পনসরড অ্যাডভার্টাইজিং পার্টনার</span>
        </div>
      </div>

      {/* Action Footer Card */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col gap-2.5">
        {adFinished ? (
          <button
            id="btn-claim-inpage-typing-reward"
            onClick={onClaimReward}
            disabled={isClaiming}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Gift className="w-5 h-5 text-amber-300 animate-bounce" />
            <span>{isClaiming ? 'ব্যালেন্সে যোগ হচ্ছে...' : `৳${job.rewardAmount} সরাসরি ওয়ালেটে যোগ করুন`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 text-slate-500 font-semibold text-xs flex items-center justify-center gap-2 cursor-wait border border-slate-200">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>বিজ্ঞাপন শেষ হওয়া পর্যন্ত অপেক্ষা করুন ({timeRemaining} সে.)</span>
          </div>
        )}
        <p className="text-[11px] text-center text-slate-400">
          টাকা সরাসরি আপনার Good Life মূল অ্যাকাউন্টের ব্যালেন্সে যোগ হবে।
        </p>
      </div>
    </div>
  );
};
