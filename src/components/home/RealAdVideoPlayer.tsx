import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock, 
  Video, 
  Globe, 
  Sparkles, 
  ExternalLink, 
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  PlaySquare,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RealPlayerConfig } from '../../types';
import { playAdNetworkRewardedAd } from '../../services/adNetworkService';

interface RealAdVideoPlayerProps {
  config: RealPlayerConfig;
  rewardAmount: number;
  onClose: () => void;
  onRewardClaimed: () => void;
  isBn: boolean;
}

export const RealAdVideoPlayer: React.FC<RealAdVideoPlayerProps> = ({
  config,
  rewardAmount,
  onClose,
  onRewardClaimed,
  isBn
}) => {
  const duration = Math.max(5, config.durationSeconds || 10);
  const [currentWatchedTime, setCurrentWatchedTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(duration);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [hasClaimed, setHasClaimed] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isTabActive, setIsTabActive] = useState<boolean>(true);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);

  const ytContainerId = useRef<string>(`yt-player-${Math.random().toString(36).substring(2, 9)}`).current;
  const ytPlayerRef = useRef<any>(null);
  const ytSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  
  const hasClaimedRef = useRef<boolean>(false);
  const onRewardClaimedRef = useRef(onRewardClaimed);
  const durationRef = useRef(duration);
  durationRef.current = duration;

  // Keep reward callback reference updated
  useEffect(() => {
    onRewardClaimedRef.current = onRewardClaimed;
  }, [onRewardClaimed]);

  // Video URL Parser
  const getVideoEmbedDetails = useCallback((rawUrl: string): { 
    type: 'youtube' | 'direct' | 'sdk' | 'iframe'; 
    embedUrl: string; 
    videoId?: string 
  } => {
    if (!rawUrl) return { type: 'iframe', embedUrl: '' };
    const trimmed = rawUrl.trim();

    // Check for Ad SDK trigger
    if (trimmed.startsWith('sdk:') || trimmed.includes('9796489') || trimmed.toLowerCase().includes('adsterra') || trimmed.includes('a5ea718688da962e97053af64e1de8f0')) {
      return {
        type: 'sdk',
        embedUrl: trimmed
      };
    }

    // YouTube pattern matcher
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const ytId = ytMatch[1];
      return {
        type: 'youtube',
        videoId: ytId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&playsinline=1&controls=1&rel=0&enablejsapi=1&modestbranding=1`
      };
    }

    // Direct video formats (mp4, webm, ogg, mov)
    if (trimmed.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
      return {
        type: 'direct',
        embedUrl: trimmed
      };
    }

    // Default iframe embed
    return {
      type: 'iframe',
      embedUrl: trimmed
    };
  }, []);

  const isVideoMode = config.contentType === 'video';
  const targetMediaUrl = isVideoMode ? (config.videoUrl || '') : (config.adUrl || '');
  const videoDetails = isVideoMode ? getVideoEmbedDetails(targetMediaUrl) : null;

  // Finish and reward handler
  const handleFinishAndReward = useCallback(() => {
    if (hasClaimedRef.current) return;
    hasClaimedRef.current = true;
    
    setTimeRemaining(0);
    setCurrentWatchedTime(durationRef.current);
    setIsFinished(true);
    setHasClaimed(true);

    if (onRewardClaimedRef.current) {
      onRewardClaimedRef.current();
    }

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    } catch {}
  }, []);

  // Monitor Window Tab Visibility (Pause timer & video when user switches tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabActive(isVisible);
      if (!isVisible) {
        setIsPlaying(false);
        if (videoRef.current) {
          videoRef.current.pause();
        } else if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
          try { ytPlayerRef.current.pauseVideo(); } catch {}
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 1. YOUTUBE PLAYER SYNC INTEGRATION
  useEffect(() => {
    if (videoDetails?.type !== 'youtube' || !videoDetails.videoId) return;

    let isMounted = true;
    const currentVideoId = videoDetails.videoId;

    const setupYouTubePlayer = () => {
      if (!isMounted) return;
      if (!(window as any).YT || !(window as any).YT.Player) return;

      const containerElem = document.getElementById(ytContainerId);
      if (!containerElem) return;

      try {
        if (ytPlayerRef.current) {
          try { ytPlayerRef.current.destroy(); } catch {}
        }

        ytPlayerRef.current = new (window as any).YT.Player(ytContainerId, {
          videoId: currentVideoId,
          playerVars: {
            autoplay: 1,
            mute: isMuted ? 1 : 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              setIsVideoReady(true);
              try {
                event.target.playVideo();
              } catch {}
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
                setIsBuffering(false);
              } else if (event.data === 2) {
                setIsPlaying(false);
                setIsBuffering(false);
              } else if (event.data === 3) {
                setIsBuffering(true);
              } else if (event.data === 0) {
                // Video Ended: Check if watched enough
                const cur = ytPlayerRef.current?.getCurrentTime() || 0;
                if (cur >= durationRef.current) {
                  handleFinishAndReward();
                }
              }
            },
            onError: () => {
              if (!isMounted) return;
              setIframeError(true);
              setIsVideoReady(true);
            }
          }
        });
      } catch (e) {
        console.warn('YouTube Player API initialization warning:', e);
        setIsVideoReady(true);
      }
    };

    // Load YouTube API script if not loaded
    if ((window as any).YT && (window as any).YT.Player) {
      setupYouTubePlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      const prevOnReady = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (typeof prevOnReady === 'function') prevOnReady();
        setupYouTubePlayer();
      };

      const pollInterval = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          clearInterval(pollInterval);
          setupYouTubePlayer();
        }
      }, 250);

      setTimeout(() => clearInterval(pollInterval), 8000);
    }

    // High precision YouTube video playback sync loop (runs every 250ms)
    // Directly reads player.getCurrentTime() to eliminate any possible time discrepancy!
    ytSyncIntervalRef.current = setInterval(() => {
      if (!isMounted || hasClaimedRef.current) return;
      const player = ytPlayerRef.current;
      if (player && typeof player.getCurrentTime === 'function' && typeof player.getPlayerState === 'function') {
        const state = player.getPlayerState();
        if (state === 1) { // STRICTLY ONLY WHEN PLAYING
          const cur = player.getCurrentTime();
          if (typeof cur === 'number' && !isNaN(cur) && cur >= 0) {
            setCurrentWatchedTime(cur);
            const remaining = Math.max(0, Math.ceil(durationRef.current - cur));
            setTimeRemaining(remaining);
            if (cur >= durationRef.current) {
              handleFinishAndReward();
            }
          }
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      if (ytSyncIntervalRef.current) {
        clearInterval(ytSyncIntervalRef.current);
        ytSyncIntervalRef.current = null;
      }
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, [videoDetails?.type, videoDetails?.videoId, handleFinishAndReward, ytContainerId]);

  // 2. FALLBACK TIMER (For Sponsored URL Ads, SDKs, or Generic Non-YouTube iFrames)
  useEffect(() => {
    // If it's a direct HTML5 video or YouTube with working API, fallback timer is not needed
    if (videoDetails?.type === 'direct' || videoDetails?.type === 'youtube') {
      return;
    }

    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }

    if (!isVideoReady || !isPlaying || !isTabActive || isBuffering || isFinished) {
      return;
    }

    fallbackIntervalRef.current = setInterval(() => {
      if (hasClaimedRef.current) return;
      setCurrentWatchedTime(prev => {
        const next = prev + 1;
        const rem = Math.max(0, durationRef.current - next);
        setTimeRemaining(rem);
        if (next >= durationRef.current) {
          handleFinishAndReward();
        }
        return next;
      });
    }, 1000);

    return () => {
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    };
  }, [videoDetails?.type, isVideoReady, isPlaying, isTabActive, isBuffering, isFinished, handleFinishAndReward]);

  // Initial ready check for fallback
  useEffect(() => {
    if (videoDetails?.type !== 'youtube' && videoDetails?.type !== 'direct') {
      const t = setTimeout(() => setIsVideoReady(true), 1200);
      return () => clearTimeout(t);
    }
  }, [videoDetails?.type]);

  // Toggle Play / Pause
  const togglePlayPause = () => {
    if (isFinished) return;
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);

    if (videoRef.current) {
      if (nextPlay) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    } else if (ytPlayerRef.current) {
      try {
        if (nextPlay) {
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.pauseVideo();
        }
      } catch {}
    } else if (iframeRef.current) {
      const command = nextPlay ? 'playVideo' : 'pauseVideo';
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command }),
        '*'
      );
    }
  };

  // Toggle Mute / Unmute
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (videoRef.current) {
      videoRef.current.muted = nextMute;
      if (!nextMute) {
        videoRef.current.play().catch(() => {});
      }
    } else if (ytPlayerRef.current) {
      try {
        if (nextMute) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
        }
      } catch {}
    } else if (iframeRef.current) {
      const command = nextMute ? 'mute' : 'unMute';
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command }),
        '*'
      );
    }
  };

  // Manual Replay
  const handleManualReplay = () => {
    setCurrentWatchedTime(0);
    setTimeRemaining(duration);
    setIsFinished(false);
    hasClaimedRef.current = false;
    setHasClaimed(false);
    setIsPlaying(true);
    setIsBuffering(false);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(0, true);
        ytPlayerRef.current.playVideo();
      } catch {}
    } else if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }),
        '*'
      );
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo' }),
        '*'
      );
    }
  };

  // Accurate progress percentage based on actual seconds watched
  const watchedFloor = Math.floor(currentWatchedTime);
  const progressPercent = Math.min(100, Math.max(0, (currentWatchedTime / duration) * 100));

  return (
    <div className="w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col animate-fade-in text-white">
      
      {/* Top Player Control & Status Header */}
      <div className="bg-slate-950/95 backdrop-blur-md px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isFinished ? 'bg-emerald-400' : isBuffering ? 'bg-amber-400' : isPlaying ? 'bg-rose-500' : 'bg-slate-500'
            }`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isFinished ? 'bg-emerald-500' : isBuffering ? 'bg-amber-400' : isPlaying ? 'bg-rose-500' : 'bg-slate-500'
            }`} />
          </span>
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-black text-white tracking-wide">
              {isBn ? 'লাইভ বিজ্ঞাপন সেশন' : 'Live Ad Session'}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 border-l border-slate-800 pl-2 truncate hidden sm:inline">
              {config.sponsorName || (isVideoMode ? 'স্পন্সর ভিডিও' : 'স্পন্সর বিজ্ঞাপন')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Precise Single Countdown Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
            isFinished 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
              : isBuffering
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : !isPlaying
              ? 'bg-slate-800 text-slate-400 border border-slate-700'
              : 'bg-slate-800/90 text-amber-300 border border-slate-700/80'
          }`}>
            {isFinished ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? 'রিওয়ার্ড প্রস্তুত' : 'Ready'}</span>
              </>
            ) : isBuffering ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>{isBn ? 'বাফারিং...' : 'Buffering...'}</span>
              </>
            ) : !isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-400" />
                <span>{timeRemaining}s {isBn ? 'পজ' : 'Paused'}</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono font-semibold">{timeRemaining}s {isBn ? 'বাকি' : 'left'}</span>
              </>
            )}
          </div>

          {/* Reward Amount Badge */}
          <span className="text-xs font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full font-mono">
            +{rewardAmount.toFixed(2)}৳
          </span>

          {/* Close/Back Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
            title={isBn ? 'প্লেয়ার বন্ধ করুন' : 'Close Player'}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Synchronized Live Progress Bar */}
      <div className="w-full bg-slate-800/80 h-1 relative overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 h-full transition-all duration-300 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Media Playback Viewport */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group select-none">
        
        {/* Buffering or Inactive Tab Notification */}
        {isBuffering && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 text-white">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="text-xs font-bold text-amber-200">
              {isBn ? 'ভিডিও বাফারিং হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন' : 'Video buffering... Please wait'}
            </span>
          </div>
        )}

        {!isTabActive && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 text-white text-center p-4">
            <Pause className="w-8 h-8 text-amber-400" />
            <span className="text-sm font-black text-amber-200">
              {isBn ? 'অন্য ট্যাবে যাওয়ার কারণে ভিডিও ও টাইমার পজ করা হয়েছে' : 'Video & timer paused because tab was switched'}
            </span>
            <span className="text-xs text-slate-300">
              {isBn ? 'বিজ্ঞাপন দেখতে এই ট্যাবে থাকুন' : 'Return to this tab to resume'}
            </span>
          </div>
        )}

        {isVideoMode ? (
          // VIDEO MODES
          videoDetails?.type === 'sdk' ? (
            // Zone 9796489 Ad SDK Panel
            <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-4 flex flex-col items-center justify-center text-white text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
                <Video className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-sm">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 px-2.5 py-0.5 rounded-full inline-block">
                  {videoDetails.embedUrl.includes('adsterra') || videoDetails.embedUrl.includes('a5ea718688da962e97053af64e1de8f0')
                    ? 'Adsterra Ad Network (Zone: a5ea718688da962e97053af64e1de8f0)'
                    : 'Ad Network SDK'}
                </span>
                <h4 className="font-black text-sm text-white line-clamp-1">
                  {config.title || (isBn ? 'স্পন্সরড ভিডিও বিজ্ঞাপন' : 'Sponsored Video Ad')}
                </h4>
                <p className="text-[11px] text-slate-300">
                  {isBn ? 'বিজ্ঞাপনটি সম্পূর্ণ দেখুন, টাইমার শেষ হলে ওয়ালেটে টাকা যোগ হবে।' : 'Watch the video ad. Reward is credited when finished.'}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setIsVideoReady(true);
                  try {
                    const provider = (videoDetails.embedUrl.includes('adsterra') || videoDetails.embedUrl.includes('a5ea718688da962e97053af64e1de8f0'))
                      ? 'adsterra'
                      : 'auto';
                    await playAdNetworkRewardedAd({ provider, timeoutSeconds: duration });
                  } catch (e) {
                    console.warn('SDK ad trigger error:', e);
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <PlaySquare className="w-4 h-4" />
                <span>{isBn ? 'বিজ্ঞাপন চালু করুন' : 'Play Ad'}</span>
              </button>
            </div>
          ) : videoDetails?.type === 'direct' ? (
            // DIRECT MP4/WebM VIDEO (Direct browser timeupdate synchronization)
            <video
              ref={videoRef}
              src={videoDetails.embedUrl}
              autoPlay
              muted={isMuted}
              playsInline
              preload="auto"
              onLoadedMetadata={() => setIsVideoReady(true)}
              onCanPlay={() => setIsVideoReady(true)}
              onTimeUpdate={() => {
                if (!videoRef.current || hasClaimedRef.current) return;
                const cur = videoRef.current.currentTime;
                setCurrentWatchedTime(cur);
                const rem = Math.max(0, Math.ceil(duration - cur));
                setTimeRemaining(rem);
                if (cur >= duration) {
                  handleFinishAndReward();
                }
              }}
              onPlay={() => {
                setIsPlaying(true);
                setIsBuffering(false);
              }}
              onPause={() => {
                setIsPlaying(false);
              }}
              onWaiting={() => {
                setIsBuffering(true);
              }}
              onPlaying={() => {
                setIsPlaying(true);
                setIsBuffering(false);
              }}
              onEnded={() => {
                if (videoRef.current && videoRef.current.currentTime >= duration) {
                  handleFinishAndReward();
                }
              }}
              className="w-full h-full object-contain bg-black"
            />
          ) : videoDetails?.type === 'youtube' ? (
            // SYNCHRONIZED YOUTUBE IFRAME PLAYER
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              {/* Target div replaced by YouTube IFrame API */}
              <div id={ytContainerId} className="w-full h-full" />

              {/* Fallback iframe in case API took time to mount */}
              {!isVideoReady && (
                <iframe
                  ref={iframeRef}
                  src={videoDetails.embedUrl}
                  title={config.title || 'Video Player'}
                  className="w-full h-full border-0 absolute inset-0 z-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => setIsVideoReady(true)}
                />
              )}
            </div>
          ) : (
            // GENERIC VIDEO EMBED
            <iframe
              ref={iframeRef}
              src={targetMediaUrl}
              title={config.title || 'Video Player'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => {
                setIframeLoaded(true);
                setIsVideoReady(true);
              }}
              onError={() => {
                setIframeError(true);
                setIsVideoReady(true);
              }}
            />
          )
        ) : (
          // SPONSORED AD URL MODE
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950">
            {targetMediaUrl ? (
              <iframe
                ref={iframeRef}
                src={targetMediaUrl}
                title={config.title || 'Sponsored Ad'}
                className={`w-full h-full border-0 transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-80'}`}
                sandbox="allow-scripts allow-same-origin allow-forms"
                onLoad={() => {
                  setIframeLoaded(true);
                  setIsVideoReady(true);
                }}
                onError={() => {
                  setIframeError(true);
                  setIsVideoReady(true);
                }}
              />
            ) : null}

            {/* Fallback Overlay */}
            {(!targetMediaUrl || iframeError) && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 flex flex-col items-center justify-center text-center space-y-3 text-white">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Globe className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full inline-block">
                    {config.sponsorName || 'Good Life Partner'}
                  </span>
                  <h4 className="font-black text-sm text-white line-clamp-2">
                    {config.title || 'স্পন্সরড পার্টনার বিজ্ঞাপন'}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {isBn 
                      ? 'বিজ্ঞাপনটি চালু হয়েছে। টাইমার শেষ হলে সরাসরি রিওয়ার্ড আপনার ওয়ালেটে যুক্ত হবে।' 
                      : 'Ad is streaming. Watch countdown to receive your reward.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sleek Frosted Glass Playback & Audio Controls at bottom of video */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
          {/* Sound Mute / Unmute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 text-xs font-medium flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            title={isMuted ? (isBn ? 'সাউন্ড চালু করুন' : 'Unmute') : (isBn ? 'মিউট করুন' : 'Mute')}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-300" />
                <span>{isBn ? 'সাউন্ড অন করুন' : 'Unmute'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? 'সাউন্ড চলছে' : 'Sound On'}</span>
              </>
            )}
          </button>

          {/* Pause / Resume Button */}
          {!isFinished && (
            <button
              type="button"
              onClick={togglePlayPause}
              className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/15 cursor-pointer shadow-md transition-all active:scale-95"
              title={isPlaying ? (isBn ? 'পজ করুন' : 'Pause') : (isBn ? 'চালু করুন' : 'Play')}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          )}

          {/* Replay Button */}
          <button
            type="button"
            onClick={handleManualReplay}
            className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/15 cursor-pointer shadow-md transition-all active:scale-95"
            title={isBn ? 'পুনরায় দেখুন' : 'Replay'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Player Footer & Reward Status */}
      <div className="p-3.5 sm:p-4 bg-slate-950/90 border-t border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              {config.sponsorName || 'Good Life Official Partner'}
            </span>
            <h4 className="font-bold text-xs sm:text-sm text-white truncate">
              {config.title || (isVideoMode ? 'স্পন্সরড ভিডিও বিজ্ঞাপন' : 'স্পন্সরড বিজ্ঞাপন')}
            </h4>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors underline shrink-0 cursor-pointer"
          >
            {isBn ? 'বাদ দিন' : 'Skip'}
          </button>
        </div>

        {/* Completion Banner or Status Bar */}
        {isFinished ? (
          <div className="p-3 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-emerald-300 animate-fade-in shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="font-black text-white text-xs">
                  {isBn ? 'অভিনন্দন! বিজ্ঞাপন সম্পূর্ণ হয়েছে!' : 'Great job! Ad completed!'}
                </p>
                <p className="text-[11px] text-emerald-300 font-medium">
                  {isBn ? `+৳${rewardAmount.toFixed(2)} ওয়ালেটে যোগ হয়েছে` : `+৳${rewardAmount.toFixed(2)} added to your wallet`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
            >
              {isBn ? 'সম্পন্ন (ফিরে যান)' : 'Done (Close)'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">
                {isBuffering ? (
                  <span className="text-amber-300">
                    {isBn ? 'ভিডিও বাফারিং হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন' : 'Video buffering... Please wait'}
                  </span>
                ) : !isPlaying ? (
                  <span className="text-slate-300">
                    {isBn ? 'ভিডিও পজ করা আছে — পুনরায় চালু করুন' : 'Video is paused — Click play to resume'}
                  </span>
                ) : (
                  <span>
                    {isBn 
                      ? `সম্পূর্ণ ভিডিওটি দেখুন, শেষ হলে সরাসরি +৳${rewardAmount.toFixed(2)} ওয়ালেটে জমা হবে` 
                      : `Watch video completely to claim +৳${rewardAmount.toFixed(2)} reward`}
                  </span>
                )}
              </span>
            </div>
            <span className="font-mono text-slate-300 font-semibold shrink-0 ml-2">
              {timeRemaining}s {isBn ? 'বাকি' : 'left'}
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
