import React, { useState } from 'react';
import { X, Camera, Image, Upload, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { compressImage } from '../../lib/imageUtils';

const PRESET_COVERS = [
  {
    id: 'c1',
    name: 'গোল্ডেন লাক্সারি (Golden Luxe)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'c2',
    name: 'বিজনেস ও আর্নিং (Business Hub)',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'c3',
    name: 'ডিজিটাল টেকনোলজি (Digital Tech)',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'c4',
    name: 'ডার্ক অ্যাম্পায়ার (Dark Amber)',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80'
  }
];

export const CoverPhotoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, updateUserCover, showToast, language } = useApp();
  const isBn = language === 'bn';

  const [selectedCover, setSelectedCover] = useState<string>(
    user.coverPhoto || PRESET_COVERS[0].url
  );
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast(isBn ? 'ছবির সাইজ সর্বোচ্চ 10MB হতে হবে!' : 'Image size must be max 10MB!');
        return;
      }
      try {
        const compressed = await compressImage(file, 720, 240, 0.7);
        setSelectedCover(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setSelectedCover(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSave = () => {
    let finalUrl = selectedCover;
    if (activeTab === 'url' && customUrl.trim()) {
      finalUrl = customUrl.trim();
    }
    updateUserCover(finalUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up border border-sky-200/60">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 px-4 py-3.5 flex items-center justify-between text-white border-b border-sky-500/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-500 text-white rounded-lg">
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-sky-300">
                {isBn ? 'কভার পিকচার পরিবর্তন' : 'Change Cover Photo'}
              </h3>
              <p className="text-[10px] text-gray-400">
                {isBn ? 'আপনার প্রোফাইলের কভার ব্যানার সেট করুন' : 'Set your profile cover banner'}
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

        {/* Live Preview */}
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center justify-between">
            <span>{isBn ? 'কভার প্রিভিউ:' : 'Cover Preview:'}</span>
            <span className="text-sky-600 font-extrabold">{isBn ? 'লাইভ প্রিভিউ' : 'Live Preview'}</span>
          </div>
          <div className="relative w-full h-32 rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-gray-900 group">
            <img 
              src={selectedCover} 
              alt="Cover Preview" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[10px] font-bold text-sky-300 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                {isBn ? 'আপনার প্রোফাইল কভার' : 'Your Profile Cover'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-gray-950 shadow-xs border border-gray-200'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isBn ? 'গ্যালারি / আপলোড' : 'Upload File'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'preset'
                ? 'bg-white text-gray-950 shadow-xs border border-gray-200'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>{isBn ? 'রেডিমেড ব্যানার' : 'Presets'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white text-gray-950 shadow-xs border border-gray-200'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>{isBn ? 'লিঙ্ক (URL)' : 'URL'}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50/80 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-black text-gray-900 block">
                    {isBn ? 'ডিভাইস থেকে ছবি বেছে নিন' : 'Choose photo from device'}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {isBn ? 'PNG, JPG বা WEBP (সর্বোচ্চ 5MB)' : 'PNG, JPG or WEBP (Max 5MB)'}
                  </span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          )}

          {activeTab === 'preset' && (
            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_COVERS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setSelectedCover(preset.url)}
                  className={`relative h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${
                    selectedCover === preset.url
                      ? 'border-sky-500 ring-2 ring-sky-500/30 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={preset.url} 
                    alt={preset.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                    <span className="text-[10px] font-black text-white truncate">
                      {preset.name}
                    </span>
                  </div>
                  {selectedCover === preset.url && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                {isBn ? 'অনলাইন ছবির লিঙ্ক পেস্ট করুন' : 'Paste Image URL'}
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  if (e.target.value.trim().startsWith('http')) {
                    setSelectedCover(e.target.value.trim());
                  }
                }}
                placeholder="https://example.com/cover.jpg"
                className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer border border-sky-400 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isBn ? 'কভার সেভ করুন' : 'Save Cover'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
