import React, { useState, useEffect, useRef, useId } from 'react';
import { Sparkles, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TypingInlineAdCardProps {
  adKey?: string;
  className?: string;
}

export const TypingInlineAdCard: React.FC<TypingInlineAdCardProps> = ({
  adKey,
  className = ''
}) => {
  const { systemSettings } = useApp();
  const componentId = useId().replace(/:/g, '_');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const bannerConfig = systemSettings?.pageBannerAds;
  const activeKey = (adKey && adKey.trim())
    ? adKey.trim()
    : (bannerConfig?.adKey && bannerConfig.adKey.trim())
    ? bannerConfig.adKey.trim()
    : 'b87ae65b2057f8d1935a8a65f245a61e';

  const scriptUrl = activeKey === 'b87ae65b2057f8d1935a8a65f245a61e'
    ? 'https://www.highrevenueformat.com/b87ae65b2057f8d1935a8a65f245a61e/invoke.js'
    : (activeKey === 'a5ea718688da962e97053af64e1de8f0')
    ? 'https://pl29897349.profitableratecpmnetwork.com/a5ea718688da962e97053af64e1de8f0/invoke.js'
    : `https://www.highrevenueformat.com/${activeKey}/invoke.js`;

  useEffect(() => {
    setAdLoaded(false);
    const iframe = iframeRef.current;
    if (!iframe) return;

    const htmlDoc = `
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
              background-color: #f8fafc;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: system-ui, -apple-system, sans-serif;
            }
            #ad-container {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              min-height: 100px;
            }
          </style>
        </head>
        <body>
          <div id="ad-container">
            <script type="text/javascript">
              atOptions = {
                'key' : '${activeKey}',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
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
        doc.write(htmlDoc);
        doc.close();
        setAdLoaded(true);
      }
    } catch (e) {
      console.warn('[TypingInlineAd] Iframe write notice:', e);
    }
  }, [activeKey, scriptUrl, reloadKey]);

  return (
    <div className={`w-full bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-md relative overflow-hidden ${className}`}>
      {/* Header pill */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-200">স্পন্সরড বিজ্ঞাপন</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">Ad Network</span>
        </div>
        <button
          onClick={() => setReloadKey(k => k + 1)}
          title="বিজ্ঞাপন রিফ্রেশ করুন"
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sandboxed Ad Frame */}
      <div className="w-full bg-slate-950 rounded-xl overflow-hidden min-h-[95px] flex items-center justify-center border border-slate-800/80">
        <iframe
          ref={iframeRef}
          key={`inline-ad-${componentId}-${reloadKey}`}
          title="Typing Inline Sponsored Ad"
          className="w-full h-[95px] border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          সুরক্ষিত ও ভেরিফাইড এড নেটওয়ার্ক
        </span>
        <span className="text-[10px] text-slate-400">অংশীদার বিজ্ঞাপন</span>
      </div>
    </div>
  );
};
