import React, { useState } from 'react';
import { 
  X, 
  Image, 
  Video, 
  Send, 
  Upload, 
  Sparkles, 
  ShoppingBag, 
  Tag, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { compressImage } from '../../lib/imageUtils';

const SUGGESTED_HASHTAGS = [
  '#লাইফগুড',
  '#মাইক্রোজব',
  '#দৈনিকইনকাম',
  '#রিসেলিংবিডি',
  '#স্মার্টআর্নিং',
  '#ঘরেবসেকাজ',
  '#পেমেন্টপ্রুফ'
];

export const CreatePostModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, products, createUserPost, showToast, language } = useApp();
  const isBn = language === 'bn';
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  if (!isAdmin) {
    return null;
  }

  const [caption, setCaption] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(['#লাইফগুড', '#দৈনিকইনকাম']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast(isBn ? 'মিডিয়া ফাইলের সাইজ সর্বোচ্চ 8MB হতে হবে!' : 'Media file must be max 8MB!');
        return;
      }
      try {
        const compressed = await compressImage(file, 640, 640, 0.7);
        setMediaUrl(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setMediaUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleToggleTag = (tag: string) => {
    if (hashtags.includes(tag)) {
      setHashtags(hashtags.filter(t => t !== tag));
    } else {
      setHashtags([...hashtags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (!customTagInput.trim()) return;
    e.preventDefault();
    const clean = customTagInput.trim().startsWith('#') 
      ? customTagInput.trim() 
      : `#${customTagInput.trim()}`;
    if (!hashtags.includes(clean)) {
      setHashtags([...hashtags, clean]);
    }
    setCustomTagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      showToast(isBn ? 'অনুগ্রহ করে কিছু লিখুন!' : 'Please enter post caption!');
      return;
    }

    setIsSubmitting(true);

    const selectedProduct = products.find(p => p.id === selectedProductId);

    createUserPost({
      caption: caption.trim(),
      thumbnailUrl: mediaUrl || (selectedProduct ? selectedProduct.images[0] : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'),
      videoUrl: mediaType === 'video' ? mediaUrl : undefined,
      hashtags,
      productId: selectedProduct?.id,
      productName: selectedProduct?.name,
      productPrice: selectedProduct?.sellingPrice,
      productImage: selectedProduct?.images[0],
      postType: mediaType === 'video' ? 'reel' : 'post'
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up border border-sky-200/60">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 px-4 py-3.5 flex items-center justify-between text-white border-b border-sky-500/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-500 text-white rounded-lg">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-sky-300">
                {isBn ? 'নতুন পোস্ট তৈরি করুন' : 'Create New Post'}
              </h3>
              <p className="text-[10px] text-gray-400">
                {isBn ? 'কমিউনিটি ও প্রোফাইল ফিড' : 'Community & Profile Feed'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge Info & Approval Notice */}
        <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover border-2 border-sky-400 shadow-xs" 
            />
            <div>
              <div className="font-black text-xs sm:text-sm text-gray-900 flex items-center gap-1">
                <span>{user.name}</span>
                {user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="bg-gray-200 px-1.5 py-0.2 rounded font-bold text-gray-700 uppercase">
                  {user.role}
                </span>
                <span>· Public</span>
              </div>
            </div>
          </div>

          {/* Verification / Approval Badge */}
          <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black border flex items-center gap-1 ${
            isAdmin 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}>
            {isAdmin ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>তাৎক্ষণিক লাইভ</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                <span>এডমিন রিভিউ প্রযোজ্য</span>
              </>
            )}
          </div>
        </div>

        {/* Post Creation Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Admin Approval Notice Callout */}
          {!isAdmin && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-snug text-[11px]">
                <strong className="font-bold">গুরুত্বপূর্ণ নিয়ম:</strong> আপনার পোস্টটি সাবমিট করার পর এডমিন যাচাই করে অনুমোদন করবেন। অনুমোদন না হওয়া পর্যন্ত পোস্টটি <span className="underline font-bold">শুধুমাত্র আপনার প্রোফাইলে</span> দেখতে পাবেন।
              </p>
            </div>
          )}

          {/* Caption Input */}
          <div className="space-y-1">
            <textarea
              rows={4}
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={isBn ? `আপনার মনের কথা, ইনকাম আপডেট বা কাজের অভিজ্ঞতা শেয়ার করুন, ${user.name}...` : `What's on your mind, ${user.name}?`}
              className="w-full text-xs sm:text-sm font-medium p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Media Attachment Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span className="flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-sky-600" />
                {isBn ? 'ছবি বা ভিডিও সংযুক্ত করুন' : 'Attach Photo or Video'}
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${mediaType === 'image' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  ছবি (Photo)
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${mediaType === 'video' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  ভিডিও (Video/Reel)
                </button>
              </div>
            </div>

            {/* Media Upload or Link Input */}
            <div className="space-y-2">
              <label className="border border-dashed border-gray-300 hover:border-sky-500 bg-gray-50 hover:bg-sky-50/40 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-gray-700">
                  {mediaUrl ? (isBn ? 'ছবি পরিবর্তন করুন' : 'Change Image') : (isBn ? 'গ্যালারি থেকে ছবি আপলোড করুন' : 'Upload Image from Gallery')}
                </span>
                <input 
                  type="file" 
                  accept={mediaType === 'video' ? 'video/*' : 'image/*'} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={mediaType === 'video' ? 'অথবা সরাসরি ভিডিও লিঙ্ক পেস্ট করুন (e.g. mp4 / video URL)' : 'অথবা ছবির অনলাইন লিঙ্ক (URL) পেস্ট করুন'}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none"
              />

              {/* Media Preview */}
              {mediaUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 max-h-48 bg-gray-950 flex items-center justify-center group">
                  {mediaType === 'video' && mediaUrl.endsWith('.mp4') ? (
                    <video src={mediaUrl} controls className="max-h-48 w-full object-contain" />
                  ) : (
                    <img src={mediaUrl} alt="Preview" className="max-h-48 w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Tagging (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>{isBn ? 'পণ্য ট্যাগ করুন (ঐচ্ছিক)' : 'Tag a Product (Optional)'}</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none"
            >
              <option value="">{isBn ? '-- কোনো পণ্য ট্যাগ করতে চান না --' : '-- None --'}</option>
              {products.slice(0, 15).map(prod => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} (৳{prod.sellingPrice})
                </option>
              ))}
            </select>
          </div>

          {/* Hashtags Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-sky-600" />
              <span>{isBn ? 'হ্যাশট্যাগ যোগ করুন' : 'Add Hashtags'}</span>
            </label>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_HASHTAGS.map(tag => {
                const isSelected = hashtags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-xs border border-sky-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder={isBn ? 'অন্য কোনো ট্যাগ লিখুন (Enter চাপুন)' : 'Add custom tag'}
                className="flex-1 text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-2 bg-gray-900 hover:bg-gray-800 text-sky-300 text-xs font-bold rounded-xl active:scale-95 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </form>

        {/* Footer Submit Button */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !caption.trim()}
            className="flex-1 py-2.5 px-4 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer border border-sky-400 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isAdmin 
                ? (isBn ? 'পাবলিশ করুন' : 'Publish Now') 
                : (isBn ? 'পোস্ট সাবমিট করুন' : 'Submit Post')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
