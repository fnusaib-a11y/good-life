import React, { useEffect, useRef, useState, useId } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface PersistentAdBannerProps {
  position: 'top' | 'bottom';
  page: 'ads_view' | 'quiz_job' | 'typing_job' | 'ad_marketing';
  className?: string;
  id?: string;
}

export const PersistentAdBanner: React.FC<PersistentAdBannerProps> = ({
  position,
  page,
  className = '',
  id
}) => {
  const { systemSettings, isBn } = useApp();
  const componentUniqueId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [containerWidth, setContainerWidth] = useState<number>(728);

  const bannerConfig = systemSettings.pageBannerAds || {
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

  const adKey = bannerConfig.adKey || 'b87ae65b2057f8d1935a8a65f245a61e';
  const scriptUrl = bannerConfig.scriptUrl || `https://www.highrevenueformat.com/${adKey}/invoke.js`;
  const baseWidth = Number(bannerConfig.width) || 728;
  const baseHeight = Number(bannerConfig.height) || 90;

  // Responsive scale calculations
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const clientW = containerRef.current.clientWidth;
      if (clientW > 0) {
        setContainerWidth(clientW);
        const targetW = Math.min(clientW, baseWidth);
        const computedScale = targetW / baseWidth;
        setScale(Math.max(0.38, Math.min(1, computedScale)));
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [baseWidth]);

  // Inject Adsterra script into isolated iframe document
  useEffect(() => {
    if (!bannerConfig.enabled) return;
    if (position === 'top' && bannerConfig.showTopBanner === false) return;
    if (position === 'bottom' && bannerConfig.showBottomBanner === false) return;
    if (bannerConfig.pages && bannerConfig.pages[page] === false) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #ad-container {
      width: ${baseWidth}px;
      height: ${baseHeight}px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  <div id="ad-container">
    <script type="text/javascript">
      atOptions = {
        'key' : '${adKey}',
        'format' : 'iframe',
        'height' : ${baseHeight},
        'width' : ${baseWidth},
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="${scriptUrl}"></script>
  </div>
</body>
</html>`;

    try {
      iframe.srcdoc = htmlContent;
    } catch (e) {
      try {
        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(htmlContent);
          doc.close();
        }
      } catch (err) {
        console.warn('[PersistentAdBanner] Unable to inject script into iframe:', err);
      }
    }
  }, [adKey, scriptUrl, baseWidth, baseHeight, bannerConfig.enabled, bannerConfig.showTopBanner, bannerConfig.showBottomBanner, bannerConfig.pages, page, position]);

  // Visibility Guards based on Admin Configuration
  if (!bannerConfig.enabled) return null;
  if (position === 'top' && bannerConfig.showTopBanner === false) return null;
  if (position === 'bottom' && bannerConfig.showBottomBanner === false) return null;
  if (bannerConfig.pages && bannerConfig.pages[page] === false) return null;

  const scaledWidth = Math.round(baseWidth * scale);
  const scaledHeight = Math.round(baseHeight * scale);

  const bannerElementId = id || `ad-banner-${position}-${page}-${componentUniqueId.replace(/:/g, '')}`;

  return (
    <div 
      ref={containerRef} 
      id={bannerElementId}
      className={`w-full flex flex-col items-center justify-center my-2.5 transition-all select-none ${className}`}
      data-ad-position={position}
      data-ad-page={page}
    >
      {/* Banner Container with scaled dimensions */}
      <div 
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          maxWidth: '100%'
        }}
        className="relative overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-2xs flex items-center justify-center"
      >
        {/* Absolute Scaled Wrapper for 728x90 Adsterra Iframe */}
        <div
          style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          className="shrink-0"
        >
          <iframe
            ref={iframeRef}
            title={`Adsterra Sponsored Banner ${position} - ${page}`}
            width={baseWidth}
            height={baseHeight}
            className="w-full h-full border-0 block overflow-hidden"
            scrolling="no"
          />
        </div>
      </div>
    </div>
  );
};
