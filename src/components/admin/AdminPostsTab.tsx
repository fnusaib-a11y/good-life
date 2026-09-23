import React, { useState } from 'react';
import { 
  PlaySquare, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit3, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Video, 
  Sparkles,
  Link,
  ShoppingBag,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  X,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReelItem } from '../../types';

export const AdminPostsTab: React.FC = () => {
  const { 
    reels, 
    products,
    adminAddReel, 
    adminUpdateReel, 
    adminDeleteReel, 
    adminApprovePost,
    adminRejectPost,
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReel, setEditingReel] = useState<ReelItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Form state for creating new official reel/post
  const [newReel, setNewReel] = useState({
    caption: '',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-42999-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
    creatorName: 'এডমিন অফিশিয়াল',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    hashtags: '#লাইফগুড #ইনকাম #রিসেলিংবিডি',
    productId: '',
    productName: '',
    productPrice: 0
  });

  const pendingCount = reels.filter(r => r.status === 'pending').length;
  const approvedCount = reels.filter(r => r.status !== 'pending' && r.status !== 'rejected').length;

  const filteredReels = reels.filter(r => {
    // Status Filter
    if (activeTab === 'pending' && r.status !== 'pending') return false;
    if (activeTab === 'approved' && (r.status === 'pending' || r.status === 'rejected')) return false;

    // Search Filter
    const matchesSearch = 
      r.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.hashtags && r.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesSearch;
  });

  const handleCreateReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReel.caption) {
      showToast('পোস্টের ক্যাপশন লিখুন!');
      return;
    }

    const tagsArray = newReel.hashtags
      .split(' ')
      .map(t => t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`)
      .filter(t => t.length > 1);

    const selectedProd = products.find(p => p.id === newReel.productId);

    adminAddReel({
      caption: newReel.caption,
      videoUrl: newReel.videoUrl,
      thumbnailUrl: newReel.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500',
      creatorName: newReel.creatorName || 'Official Admin',
      creatorAvatar: newReel.creatorAvatar,
      creatorId: 'admin_official',
      hashtags: tagsArray.length > 0 ? tagsArray : ['#লাইফগুড', '#অনলাইনইনকাম'],
      productId: selectedProd ? selectedProd.id : undefined,
      productName: selectedProd ? selectedProd.name : undefined,
      productPrice: selectedProd ? selectedProd.sellingPrice : undefined,
      productImage: selectedProd ? selectedProd.images[0] : undefined,
      status: 'approved'
    });

    setShowAddModal(false);
    setNewReel({
      caption: '',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-42999-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
      creatorName: 'এডমিন অফিশিয়াল',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      hashtags: '#লাইফগুড #ইনকাম #রিসেলিংবিডি',
      productId: '',
      productName: '',
      productPrice: 0
    });
  };

  const handleSaveEditReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReel) return;
    adminUpdateReel(editingReel.id, {
      caption: editingReel.caption,
      videoUrl: editingReel.videoUrl,
      thumbnailUrl: editingReel.thumbnailUrl,
      creatorName: editingReel.creatorName
    });
    setEditingReel(null);
  };

  const handleConfirmReject = (postId: string) => {
    adminRejectPost(postId, rejectReason.trim() || 'পলিসি লঙ্ঘনের কারণে বাতিল করা হয়েছে');
    setRejectModalId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-3.5">
      {/* Top Search & Add Post Button */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'পোস্ট, ক্রিয়েটর বা হ্যাশট্যাগ খুঁজুন...' : 'Search posts & reels...'}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all border border-sky-400 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isBn ? 'নতুন এডমিন পোস্ট / রিল তৈরি' : 'Create Admin Post'}</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1 text-xs font-black">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-950'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>অপেক্ষমাণ রিভিউ ({pendingCount})</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-950'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>অনুমোদিত ({approvedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-950'
            }`}
          >
            <span>সব পোস্ট ({reels.length})</span>
          </button>
        </div>
      </div>

      {/* Posts & Reels Grid */}
      {filteredReels.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
            <Video className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-sm text-gray-900">
            {activeTab === 'pending' ? 'কোনো অপেক্ষমাণ পোস্ট নেই' : 'কোনো পোস্ট পাওয়া যায়নি'}
          </h4>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {activeTab === 'pending'
              ? 'ইউজাররা নতুন পোস্ট সাবমিট করলে এখানে পর্যালোচনার জন্য জমা হবে।'
              : 'নতুন পোস্ট তৈরি করতে উপরের বাটনটিতে চাপুন।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredReels.map(reel => {
            const isPending = reel.status === 'pending';
            const isApproved = reel.status === 'approved' || (!reel.status && reel.creatorId === 'admin_official');
            const isRejected = reel.status === 'rejected';

            return (
              <div 
                key={reel.id}
                className={`bg-white p-4 rounded-2xl border shadow-xs space-y-3 transition-all ${
                  isPending 
                    ? 'border-sky-400/80 bg-sky-50/20 ring-1 ring-sky-300/40' 
                    : 'border-gray-200'
                }`}
              >
                {/* Header with Creator & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src={reel.creatorAvatar} 
                      alt={reel.creatorName} 
                      className="w-8 h-8 rounded-full object-cover border-2 border-sky-300"
                    />
                    <div>
                      <div className="text-xs font-black text-gray-900 flex items-center gap-1">
                        <span>{reel.creatorName}</span>
                        {reel.creatorId === 'admin_official' && (
                          <span className="text-[9px] bg-sky-500 text-white font-black px-1.5 py-0.2 rounded">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {reel.createdAt ? new Date(reel.createdAt).toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                      </div>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-sky-100 text-sky-900 px-2 py-0.5 rounded-full font-black border border-sky-300">
                        <Clock className="w-3 h-3" />
                        <span>অপেক্ষমাণ</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-black border border-sky-300">
                        <CheckCircle2 className="w-3 h-3 text-sky-600" />
                        <span>লাইভ / পাবলিশড</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-black border border-red-300">
                        <XCircle className="w-3 h-3 text-red-600" />
                        <span>বাতিল</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Media & Content */}
                <div className="flex gap-3">
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-gray-200">
                    <img 
                      src={reel.thumbnailUrl} 
                      alt={reel.caption} 
                      className="w-full h-full object-cover opacity-90"
                    />
                    {reel.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <PlaySquare className="w-6 h-6 text-sky-400 drop-shadow" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-gray-900 leading-snug line-clamp-2">
                      {reel.caption}
                    </h4>

                    {reel.hashtags && reel.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {reel.hashtags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] text-sky-700 font-bold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {reel.productName && (
                      <div className="flex items-center gap-1 text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-bold w-fit">
                        <ShoppingBag className="w-3 h-3" />
                        <span className="truncate max-w-[140px]">{reel.productName} (৳{reel.productPrice})</span>
                      </div>
                    )}

                    {reel.rejectionReason && (
                      <p className="text-[10px] text-red-600 font-bold">
                        বাতিলের কারণ: {reel.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Approval & Management Action Bar */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  {isPending ? (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        onClick={() => adminApprovePost(reel.id)}
                        className="py-1.5 px-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>অনুমোদন করুন</span>
                      </button>

                      <button
                        onClick={() => setRejectModalId(reel.id)}
                        className="py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-700 font-black text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                        <span>বাতিল করুন</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500 fill-red-500" /> {reel.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-sky-500" /> {reel.commentsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-sky-600" /> {reel.viewsCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingReel(reel)}
                          className="p-1.5 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit post"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(reel.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-3">
            <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>পোস্ট বাতিলের কারণ</span>
            </h4>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="বাতিলের কারণ লিখুন (e.g. ভুল তথ্য বা পলিসি লঙ্ঘন)..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-400 outline-none resize-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setRejectModalId(null)}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => handleConfirmReject(rejectModalId)}
                className="px-4 py-1.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer"
              >
                প্রত্যাখ্যান কনফার্ম
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-gray-900">পোস্টটি মুছে ফেলতে চান?</h4>
            <p className="text-xs text-gray-500">এটি স্থায়ীভাবে মুছে ফেলা হবে।</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                না, রাখুন
              </button>
              <button
                onClick={() => {
                  adminDeleteReel(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer"
              >
                হ্যাঁ, মুছুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Reel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-sky-500 px-4 py-3 flex items-center justify-between text-white font-black text-sm">
              <span>নতুন এডমিন পোস্ট / রিল তৈরি</span>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-black/10 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReel} className="p-4 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">পোস্ট ক্যাপশন / বিবরণ *</label>
                <textarea
                  rows={3}
                  required
                  value={newReel.caption}
                  onChange={(e) => setNewReel({ ...newReel, caption: e.target.value })}
                  placeholder="পোস্টের আকর্ষণীয় ক্যাপশন লিখুন..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-sky-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">থাম্বনেইল ছবির লিঙ্ক (Image URL)</label>
                <input
                  type="url"
                  value={newReel.thumbnailUrl}
                  onChange={(e) => setNewReel({ ...newReel, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ভিডিওর লিঙ্ক (Video URL / MP4 / Reel)</label>
                <input
                  type="url"
                  value={newReel.videoUrl}
                  onChange={(e) => setNewReel({ ...newReel, videoUrl: e.target.value })}
                  placeholder="https://assets.mixkit.co/videos/preview/..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">হ্যাশট্যাগ (স্পেস দিয়ে লিখুন)</label>
                <input
                  type="text"
                  value={newReel.hashtags}
                  onChange={(e) => setNewReel({ ...newReel, hashtags: e.target.value })}
                  placeholder="#লাইফগুড #আর্নিং #মাইক্রোজব"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">শপ প্রোডাক্ট ট্যাগ করুন (ঐচ্ছিক)</label>
                <select
                  value={newReel.productId}
                  onChange={(e) => setNewReel({ ...newReel, productId: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-sky-400 outline-none"
                >
                  <option value="">-- কোনো পণ্য ট্যাগ করতে চান না --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (৳{p.sellingPrice})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>তাত্ক্ষণিকভাবে পাবলিশ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Reel Modal */}
      {editingReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between text-sky-400 font-black text-sm">
              <span>পোস্ট এডিট করুন</span>
              <button onClick={() => setEditingReel(null)} className="p-1 hover:bg-white/10 rounded-full cursor-pointer">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveEditReel} className="p-4 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">ক্যাপশন</label>
                <textarea
                  rows={3}
                  required
                  value={editingReel.caption}
                  onChange={(e) => setEditingReel({ ...editingReel, caption: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-sky-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">থাম্বনেইল URL</label>
                <input
                  type="url"
                  value={editingReel.thumbnailUrl}
                  onChange={(e) => setEditingReel({ ...editingReel, thumbnailUrl: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ভিডিও URL</label>
                <input
                  type="url"
                  value={editingReel.videoUrl || ''}
                  onChange={(e) => setEditingReel({ ...editingReel, videoUrl: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>পরিবর্তন সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
