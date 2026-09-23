import React, { useState, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  ShoppingBag, 
  Briefcase, 
  Play, 
  Pause, 
  Send, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReelItem } from '../../types';

export const ReelsViewer: React.FC = () => {
  const { 
    reels, 
    user,
    toggleLikeReel, 
    toggleSaveReel, 
    toggleFollowCreator,
    products,
    jobs,
    setSelectedProduct,
    setSelectedJob,
    showToast
  } = useApp();

  const publicReels = reels.filter(r => 
    r.status === 'approved' || 
    (!r.status && r.creatorId === 'admin_official') ||
    r.creatorId === user.id ||
    user.role === 'admin' ||
    user.role === 'super_admin'
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState<Record<string, { user: string; text: string; time: string }[]>>({
    reel_01: [
      { user: 'মাহমুদ হাসান', text: 'প্রোডাক্ট কোয়ালিটি অনেক ভালো, গত সপ্তাহে ডেলিভারি পেয়েছি!', time: '১০ মিনিট আগে' },
      { user: 'শান্তা ইসলাম', text: 'এসিড ওয়াশের কালারটা দারুণ লাগছে!', time: '১ ঘণ্টা আগে' }
    ],
    reel_02: [
      { user: 'জাহিদ রানা', text: 'স্মার্ট ওয়াচটির ব্যাটারি ব্যাকআপ কেমন থাকে ভাই?', time: '২৫ মিনিট আগে' }
    ],
    reel_03: [
      { user: 'সুমাইয়া', text: 'প্রতিদিন কি আনলিমিটেড কাজ করা যায়?', time: '৫ মিনিট আগে' }
    ]
  });

  const currentReel = publicReels[currentIndex] || publicReels[0] || reels[0];

  const handleNext = () => {
    if (currentIndex < publicReels.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newEntry = {
      user: user?.name ? `${user.name} (আপনি)` : 'আপনি',
      text: newComment,
      time: 'এইমাত্র'
    };

    setCommentsList(prev => ({
      ...prev,
      [currentReel.id]: [...(prev[currentReel.id] || []), newEntry]
    }));

    setNewComment('');
    showToast('কমেন্ট যুক্ত হয়েছে!');
  };

  const handleOpenLinkedItem = () => {
    if (currentReel.productId) {
      const prod = products.find(p => p.id === currentReel.productId);
      if (prod) setSelectedProduct(prod);
    } else if (currentReel.jobId) {
      const job = jobs.find(j => j.id === currentReel.jobId);
      if (job) setSelectedJob(job);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-120px)] sm:h-[720px] bg-black overflow-hidden select-none flex flex-col justify-between">
      {/* Video Simulation Container */}
      <div 
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute inset-0 z-0 cursor-pointer flex items-center justify-center"
      >
        <img
          src={currentReel.thumbnailUrl}
          alt={currentReel.caption}
          className="w-full h-full object-cover filter brightness-[0.85]"
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-2xs">
            <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-xl animate-scale-up">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Top Header Controls */}
      <div className="relative z-10 p-3.5 flex items-center justify-between text-white bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-tight text-sky-400">Good Life রিলস</span>
          <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded font-black uppercase">LIVE</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute/Unmute */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
              showToast(isMuted ? 'সাউন্ড অন করা হয়েছে' : 'সাউন্ড মিউট করা হয়েছে');
            }}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Right Interaction Bar */}
      <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-4 text-white">
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLikeReel(currentReel.id);
          }}
          className="flex flex-col items-center group active:scale-75 transition-all"
        >
          <div className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
            currentReel.isLiked ? 'bg-red-500/80 text-white' : 'bg-black/40 text-white'
          }`}>
            <Heart className={`w-6 h-6 ${currentReel.isLiked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[11px] font-bold mt-1 drop-shadow-md">
            {currentReel.likesCount}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(true);
          }}
          className="flex flex-col items-center active:scale-75 transition-all"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold mt-1 drop-shadow-md">
            {(commentsList[currentReel.id] || []).length + currentReel.commentsCount}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            try {
              if (navigator?.share) {
                navigator.share({
                  title: currentReel.caption,
                  url: typeof window !== 'undefined' ? window.location.href : ''
                }).catch(() => {
                  showToast('রিল লিংক কপি করা হয়েছে!');
                });
              } else if (navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '').catch(() => {});
                showToast('রিল লিংক কপি করা হয়েছে!');
              } else {
                showToast('রিল লিংক কপি করা হয়েছে!');
              }
            } catch {
              showToast('রিল লিংক কপি করা হয়েছে!');
            }
          }}
          className="flex flex-col items-center active:scale-75 transition-all"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold mt-1 drop-shadow-md">
            {currentReel.sharesCount}
          </span>
        </button>

        {/* Save Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveReel(currentReel.id);
          }}
          className="flex flex-col items-center active:scale-75 transition-all"
        >
          <div className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
            currentReel.isSaved ? 'bg-sky-500 text-white' : 'bg-black/40 text-white'
          }`}>
            <Bookmark className={`w-6 h-6 ${currentReel.isSaved ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[11px] font-bold mt-1 drop-shadow-md">
            সেভ
          </span>
        </button>
      </div>

      {/* Bottom Creator Info & Linked Product / Job */}
      <div className="relative z-10 p-4 pb-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white space-y-2">
        {/* Linked Product/Job CTA Chip */}
        {(currentReel.productName || currentReel.jobTitle) && (
          <button
            onClick={handleOpenLinkedItem}
            className="w-auto inline-flex items-center gap-2 bg-sky-500 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-lg hover:bg-sky-400 transition-all active:scale-95 animate-gentle-pulse cursor-pointer"
          >
            {currentReel.productId ? (
              <>
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>পণ্য কিনুন: {currentReel.productName} (৳{currentReel.productPrice})</span>
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>কাজ শুরু করুন: {currentReel.jobTitle} (রিওয়ার্ড ৳{currentReel.jobReward})</span>
              </>
            )}
          </button>
        )}

        {/* Creator Identity */}
        <div className="flex items-center gap-2.5">
          <img
            src={currentReel.creatorAvatar}
            alt={currentReel.creatorName}
            className="w-10 h-10 rounded-full object-cover border-2 border-sky-400"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">{currentReel.creatorName}</span>
              <button
                onClick={() => toggleFollowCreator(currentReel.id)}
                className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black transition-colors cursor-pointer ${
                  currentReel.isFollowing 
                    ? 'bg-white/20 text-white' 
                    : 'bg-sky-500 text-white hover:bg-sky-600'
                }`}
              >
                {currentReel.isFollowing ? 'ফলোইং' : '+ ফলো'}
              </button>
            </div>
          </div>
        </div>

        {/* Caption & Hashtags */}
        <p className="text-xs text-gray-100 leading-snug line-clamp-2 drop-shadow-md">
          {currentReel.caption}
        </p>

        {/* Prev / Next Swipe Assist Buttons */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 hover:text-white disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4" />
            <span>পূর্ববর্তী</span>
          </button>

          <span className="font-bold text-sky-400">
            {currentIndex + 1} / {publicReels.length || 1}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex >= publicReels.length - 1}
            className="flex items-center gap-1 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <span>পরবর্তী</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comments Drawer / Modal */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl overflow-hidden flex flex-col h-[65vh] animate-slide-up">
            {/* Comments Header */}
            <div className="p-3.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-gray-900">
              <h3 className="font-bold text-sm">
                মন্তব্যসমূহ ({(commentsList[currentReel.id] || []).length})
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 rounded-full hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {(commentsList[currentReel.id] || []).length === 0 ? (
                 <div className="py-12 text-center text-gray-400 text-xs">
                  প্রথম মন্তব্যটি আপনিই করুন!
                </div>
              ) : (
                (commentsList[currentReel.id] || []).map((c, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-sky-100 font-bold text-sky-800 text-[10px] flex items-center justify-center shrink-0">
                      {c.user[0]}
                    </div>
                    <div className="flex-1 bg-gray-50 p-2.5 rounded-2xl border border-gray-100 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-gray-900">{c.user}</span>
                        <span className="text-[10px] text-gray-400">{c.time}</span>
                      </div>
                      <p className="text-gray-700">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="একটি সুন্দর কমেন্ট লিখুন..."
                className="flex-1 bg-gray-100 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button
                type="submit"
                className="p-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelsViewer;
