/**
 * Ad Network Service for Good Life
 * Official Integration for Adsterra Ad Network (Zone: a5ea718688da962e97053af64e1de8f0) & Monetag (Zone: 9796489)
 */

declare global {
  interface Window {
    show_9796489?: () => Promise<any> | any;
    ADSTERRA_KEY?: string;
    adsterra?: any;
  }
}

export type AdNetworkProvider = 'adsterra' | 'monetag' | 'auto';

export interface AdsterraConfig {
  key: string;
  containerId: string;
  scriptUrl: string;
  directUrl?: string;
  enabled: boolean;
}

export interface AdNetworkExecutionResult {
  success: boolean;
  provider?: AdNetworkProvider;
  message?: string;
  error?: string;
  completedAt?: string;
}

const STORAGE_KEY_ADSTERRA_KEY = 'gl_adsterra_key';
const STORAGE_KEY_ADSTERRA_DIRECT_URL = 'gl_adsterra_direct_url';
const STORAGE_KEY_AD_PROVIDER = 'gl_ad_network_provider';

export const DEFAULT_ADSTERRA_KEY = 'a5ea718688da962e97053af64e1de8f0';
export const DEFAULT_ADSTERRA_CONTAINER_ID = 'container-a5ea718688da962e97053af64e1de8f0';
export const DEFAULT_ADSTERRA_SCRIPT_URL = 'https://pl29897349.profitableratecpmnetwork.com/a5ea718688da962e97053af64e1de8f0/invoke.js';

/**
 * Get configured Adsterra Zone / Key
 */
export const getAdsterraKey = (): string => {
  if (typeof window === 'undefined') return DEFAULT_ADSTERRA_KEY;
  return localStorage.getItem(STORAGE_KEY_ADSTERRA_KEY) || window.ADSTERRA_KEY || DEFAULT_ADSTERRA_KEY;
};

/**
 * Set and persist Adsterra Zone / Key
 */
export const setAdsterraKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    const cleanKey = key.trim();
    localStorage.setItem(STORAGE_KEY_ADSTERRA_KEY, cleanKey);
    window.ADSTERRA_KEY = cleanKey;
  }
};

/**
 * Get configured Adsterra Direct / Smartlink URL
 */
export const getAdsterraDirectUrl = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_ADSTERRA_DIRECT_URL) || '';
};

/**
 * Set and persist Adsterra Direct / Smartlink URL
 */
export const setAdsterraDirectUrl = (url: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ADSTERRA_DIRECT_URL, url.trim());
  }
};

/**
 * Get active Ad Provider ('adsterra' | 'monetag' | 'auto')
 */
export const getActiveAdProvider = (): AdNetworkProvider => {
  if (typeof window === 'undefined') return 'adsterra';
  const saved = localStorage.getItem(STORAGE_KEY_AD_PROVIDER);
  if (saved === 'monetag' || saved === 'auto' || saved === 'adsterra') {
    return saved as AdNetworkProvider;
  }
  return 'adsterra'; // Adsterra is default
};

/**
 * Set active Ad Provider
 */
export const setActiveAdProvider = (provider: AdNetworkProvider): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_AD_PROVIDER, provider);
  }
};

/**
 * Checks if Adsterra Ad Network is available
 */
export const isAdsterraAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(getAdsterraKey());
};

/**
 * Checks if Monetag SDK is loaded
 */
export const isMonetagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.show_9796489 === 'function';
};

/**
 * Backwards compatible check
 */
export const isAdNetworkSdkAvailable = (): boolean => {
  return isAdsterraAvailable() || isMonetagAvailable();
};

/**
 * Plays Adsterra Rewarded Ad
 * Embeds official Adsterra invoke code into the modal with strict timer completion verification
 */
export const playAdsterraRewardedAd = async (options?: {
  key?: string;
  directUrl?: string;
  durationSeconds?: number;
}): Promise<AdNetworkExecutionResult> => {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window not available', provider: 'adsterra' };
  }

  const zoneKey = options?.key || getAdsterraKey();
  const containerId = `container-${zoneKey}`;
  const scriptSrc = `https://pl29897349.profitableratecpmnetwork.com/${zoneKey}/invoke.js`;
  const directUrl = options?.directUrl || getAdsterraDirectUrl();
  const duration = options?.durationSeconds || 15;

  return new Promise((resolve) => {
    // Remove any existing ad modal
    const existingModal = document.getElementById('gl-adsterra-rewarded-modal');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'gl-adsterra-rewarded-modal';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '999999';
    overlay.style.backgroundColor = 'rgba(10, 15, 30, 0.96)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '16px';
    overlay.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    overlay.style.backdropFilter = 'blur(10px)';

    let remainingTime = duration;
    let timerInterval: any = null;
    let isCompleted = false;

    overlay.innerHTML = `
      <div style="
        background: linear-gradient(145deg, #111827 0%, #0f172a 100%);
        border: 1px solid rgba(59, 130, 246, 0.35);
        border-radius: 24px;
        width: 100%;
        max-width: 500px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
        color: #ffffff;
        position: relative;
      ">
        <!-- Adsterra Header -->
        <div style="
          background: rgba(15, 23, 42, 0.9);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        ">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: #ffffff;
              width: 28px;
              height: 28px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: 14px;
            ">A</div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-weight: 800; font-size: 14px; color: #60a5fa;">Adsterra</span>
                <span style="background: rgba(37, 99, 235, 0.2); color: #93c5fd; border: 1px solid rgba(37, 99, 235, 0.4); font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 9999px;">Rewarded Ad</span>
              </div>
              <div style="font-size: 10px; color: #94a3b8;">Zone: ${zoneKey.substring(0, 8)}...</div>
            </div>
          </div>

          <!-- Countdown / Status Badge -->
          <div id="adsterra-timer-badge" style="
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.4);
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 5px;
          ">
            ⏳ ${remainingTime}s বাকি
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="width: 100%; height: 4px; background: rgba(255, 255, 255, 0.1);">
          <div id="adsterra-progress-bar" style="
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #2563eb, #38bdf8, #10b981);
            transition: width 1s linear;
          "></div>
        </div>

        <!-- Ad Container Body -->
        <div style="padding: 20px; text-align: center;">
          <!-- Official Adsterra Container -->
          <div id="adsterra-slot-wrapper" style="
            background: rgba(15, 23, 42, 0.6);
            border: 1px dashed rgba(59, 130, 246, 0.3);
            border-radius: 16px;
            padding: 12px;
            margin-bottom: 16px;
            min-height: 180px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
          ">
            <div id="${containerId}" style="width: 100%; display: flex; justify-content: center; align-items: center; min-height: 100px;"></div>
            
            ${directUrl ? `
              <div style="margin-top: 8px; width: 100%;">
                <a href="${directUrl}" target="_blank" rel="noopener noreferrer" style="
                  display: inline-block;
                  background: rgba(37, 99, 235, 0.2);
                  border: 1px solid rgba(37, 99, 235, 0.4);
                  color: #93c5fd;
                  padding: 6px 14px;
                  border-radius: 8px;
                  font-size: 11px;
                  font-weight: 700;
                  text-decoration: none;
                ">
                  স্পন্সর অফার দেখুন ↗
                </a>
              </div>
            ` : ''}

            <div style="margin-top: 10px; font-size: 10px; color: #64748b;">
              Adsterra Official Verified Ad Network
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <p id="adsterra-status-text" style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">
              ⚠️ দয়া করে অপেক্ষা করুন। বিজ্ঞাপনটি চলাকালীন এই স্ক্রিনটি বন্ধ করবেন না। টাইমার শেষ হলে স্বয়ংক্রিয়ভাবে পরবর্তী ধাপে নিয়ে যাওয়া হবে।
            </p>
          </div>

          <!-- Action Buttons -->
          <div id="adsterra-actions-container" style="display: flex; gap: 10px; justify-content: center;">
            <button id="adsterra-close-btn" style="
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.15);
              color: #94a3b8;
              padding: 10px 18px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s;
            ">
              বন্ধ করুন (রিওয়ার্ড বাতিল)
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Inject the official Adsterra script into the container slot via isolated iframe
    try {
      const adContainer = document.getElementById(containerId);
      if (adContainer) {
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.minHeight = '140px';
        iframe.style.border = 'none';
        iframe.style.background = 'transparent';
        iframe.scrolling = 'no';
        
        const iframeDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
  </style>
</head>
<body>
  <div id="container-${zoneKey}"></div>
  <script type="text/javascript">
    atOptions = {
      'key' : '${zoneKey}',
      'format' : 'iframe',
      'height' : 90,
      'width' : 728,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="${scriptSrc}"></script>
</body>
</html>`;
        iframe.srcdoc = iframeDoc;
        adContainer.innerHTML = '';
        adContainer.appendChild(iframe);
      }
    } catch (err) {
      console.error('[Adsterra] Script injection notice:', err);
    }

    // Attach close button logic
    const closeBtn = document.getElementById('adsterra-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        if (confirm('আপনি কি নিশ্চিত যে বিজ্ঞাপনটি বন্ধ করতে চান? বিজ্ঞাপন সম্পূর্ণ না দেখলে কোনো রিওয়ার্ড বা কুইজে প্রবেশাধিকার পাবেন না।')) {
          clearInterval(timerInterval);
          overlay.remove();
          resolve({
            success: false,
            provider: 'adsterra',
            error: 'Adsterra বিজ্ঞাপন সম্পূর্ণ না দেখে বন্ধ করা হয়েছে।'
          });
        }
      };
    }

    // Start unskippable countdown timer
    timerInterval = setInterval(() => {
      remainingTime -= 1;
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        isCompleted = true;

        // Update timer badge
        const timerBadge = document.getElementById('adsterra-timer-badge');
        const progressBar = document.getElementById('adsterra-progress-bar');
        const statusText = document.getElementById('adsterra-status-text');
        const actionsContainer = document.getElementById('adsterra-actions-container');

        if (timerBadge) {
          timerBadge.style.background = 'rgba(16, 185, 129, 0.2)';
          timerBadge.style.color = '#34d399';
          timerBadge.style.border = '1px solid rgba(16, 185, 129, 0.4)';
          timerBadge.innerHTML = '✓ সম্পন্ন হয়েছে';
        }
        if (progressBar) {
          progressBar.style.width = '100%';
        }
        if (statusText) {
          statusText.style.color = '#34d399';
          statusText.innerHTML = '🎉 আপনার Adsterra বিজ্ঞাপন দেখা সম্পন্ন হয়েছে! পরবর্তী ধাপে যেতে নিচের বাটনে চাপ দিন।';
        }
        if (actionsContainer) {
          actionsContainer.innerHTML = `
            <button id="adsterra-claim-btn" style="
              background: linear-gradient(135deg, #10b981, #059669);
              color: #ffffff;
              border: none;
              padding: 12px 28px;
              border-radius: 14px;
              font-size: 13px;
              font-weight: 800;
              cursor: pointer;
              box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.5);
              width: 100%;
              transition: all 0.2s;
            ">
              ✓ সম্পন্ন করুন ও এগিয়ে যান
            </button>
          `;

          const claimBtn = document.getElementById('adsterra-claim-btn');
          if (claimBtn) {
            claimBtn.onclick = () => {
              overlay.remove();
              resolve({
                success: true,
                provider: 'adsterra',
                message: 'Adsterra বিজ্ঞাপন সফলভাবে সম্পন্ন হয়েছে!',
                completedAt: new Date().toISOString()
              });
            };
          }
        }
      } else {
        const timerBadge = document.getElementById('adsterra-timer-badge');
        const progressBar = document.getElementById('adsterra-progress-bar');
        if (timerBadge) {
          timerBadge.innerHTML = `⏳ ${remainingTime}s বাকি`;
        }
        if (progressBar) {
          progressBar.style.width = `${((duration - remainingTime) / duration) * 100}%`;
        }
      }
    }, 1000);
  });
};

/**
 * Plays Monetag Rewarded Ad (Zone: 9796489)
 */
export const playMonetagRewardedAd = async (): Promise<AdNetworkExecutionResult> => {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window environment not available', provider: 'monetag' };
  }

  let sdkFn = window.show_9796489;
  if (typeof sdkFn !== 'function') {
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (typeof window.show_9796489 === 'function') {
        sdkFn = window.show_9796489;
        break;
      }
    }
  }

  if (typeof sdkFn !== 'function') {
    return {
      success: false,
      provider: 'monetag',
      error: 'Monetag Ad SDK লোড হয়নি। দয়া করে AdBlocker বন্ধ করে পুনরায় চেষ্টা করুন।'
    };
  }

  try {
    const result = sdkFn();
    if (result && typeof result.then === 'function') {
      try {
        await result;
        return {
          success: true,
          provider: 'monetag',
          message: 'Monetag বিজ্ঞাপন সফলভাবে সম্পন্ন হয়েছে!',
          completedAt: new Date().toISOString()
        };
      } catch (err: any) {
        return {
          success: false,
          provider: 'monetag',
          error: err?.message || 'বিজ্ঞাপনটি সম্পূর্ণ না দেখে বন্ধ করা হয়েছে।'
        };
      }
    }

    return {
      success: true,
      provider: 'monetag',
      message: 'Monetag বিজ্ঞাপন সম্পন্ন হয়েছে!',
      completedAt: new Date().toISOString()
    };
  } catch (err: any) {
    return {
      success: false,
      provider: 'monetag',
      error: err?.message || 'বিজ্ঞাপন প্রদর্শনে ত্রুটি ঘটেছে।'
    };
  }
};

/**
 * Universal Multi-Network Rewarded Ad Player
 * Automatically routes to Adsterra or Monetag based on preference / config
 */
export const playAdNetworkRewardedAd = async (options?: {
  provider?: AdNetworkProvider;
  timeoutSeconds?: number;
  adsterraKey?: string;
  adsterraDirectUrl?: string;
}): Promise<AdNetworkExecutionResult> => {
  const chosenProvider = options?.provider || getActiveAdProvider();

  // 1. Direct Adsterra
  if (chosenProvider === 'adsterra') {
    return playAdsterraRewardedAd({
      key: options?.adsterraKey,
      directUrl: options?.adsterraDirectUrl,
      durationSeconds: options?.timeoutSeconds || 15
    });
  }

  // 2. Direct Monetag
  if (chosenProvider === 'monetag') {
    return playMonetagRewardedAd();
  }

  // 3. Auto / Waterfall: Try Adsterra first, fallback to Monetag
  try {
    const adsterraRes = await playAdsterraRewardedAd({
      key: options?.adsterraKey,
      directUrl: options?.adsterraDirectUrl,
      durationSeconds: options?.timeoutSeconds || 15
    });
    if (adsterraRes.success) return adsterraRes;
  } catch (e) {
    console.warn('[AdNetwork] Adsterra fallback trigger:', e);
  }

  // Fallback to Monetag
  return playMonetagRewardedAd();
};
