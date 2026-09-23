import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  Link as LinkIcon, 
  Sparkles,
  RefreshCw,
  Eye,
  Camera,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { compressImage, JOB_PRESET_THUMBNAILS } from '../../lib/imageUtils';

interface JobThumbnailUploaderProps {
  value: string;
  onChange: (imageUrl: string) => void;
  isBn?: boolean;
}

export const JobThumbnailUploader: React.FC<JobThumbnailUploaderProps> = ({
  value,
  onChange,
  isBn = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    await processFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(isBn ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WEBP) আপলোড করুন।' : 'Please upload an image file (JPG, PNG, WEBP).');
      return;
    }

    try {
      setIsUploading(true);
      const compressedDataUrl = await compressImage(file, 720, 720, 0.85);
      onChange(compressedDataUrl);
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      await processFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setFileName('অনলাইন লিংক');
      setUrlInputValue('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-extrabold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-sky-600" />
          <span>{isBn ? 'জব থাম্বনেইল ছবি (পিকচার আপলোড) *' : 'Job Thumbnail Picture *'}</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? (isBn ? 'লিংক লুকান' : 'Hide URL') : (isBn ? 'ইন্টারনেট লিংক' : 'Image URL')}</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input for Direct Picture Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Current Preview or Upload Box */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-sky-300 bg-sky-50/60 p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3.5 shadow-xs">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border-2 border-white shadow-sm group">
            <img
              src={value}
              alt="Job Thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = JOB_PRESET_THUMBNAILS[0].url;
              }}
            />
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left w-full">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-700 text-xs font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isBn ? 'পিকচার সফলভাবে যুক্ত হয়েছে' : 'Picture Added Successfully'}</span>
            </div>
            
            <p className="text-[11px] text-gray-600 truncate font-semibold">
              {fileName || (value.startsWith('data:') ? (isBn ? 'ডিভাইস থেকে সরাসরি আপলোড করা ছবি' : 'Uploaded directly from device') : value)}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isBn ? 'প্রসেসিং হচ্ছে...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ছবি পরিবর্তন করুন' : 'Change Picture'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setFileName('');
                }}
                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all border border-red-200/60"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isBn ? 'মুছে ফেলুন' : 'Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area when no image is selected */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-5 sm:p-6 text-center cursor-pointer transition-all shadow-xs ${
            isDragOver 
              ? 'border-sky-500 bg-sky-50 scale-[1.01]' 
              : 'border-sky-300 hover:border-sky-500 bg-gradient-to-b from-sky-50/70 to-white hover:bg-sky-50/90'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
              {isUploading ? (
                <RefreshCw className="w-7 h-7 animate-spin text-sky-600" />
              ) : (
                <UploadCloud className="w-7 h-7 text-sky-600" />
              )}
            </div>
            
            <div className="space-y-1 max-w-sm">
              <span className="inline-block px-3 py-0.5 bg-sky-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                {isBn ? 'ক্লিক করে সরাসরি আপলোড' : 'Direct Upload'}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-gray-900">
                {isUploading 
                  ? (isBn ? 'ছবি প্রসেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...' : 'Processing picture, please wait...')
                  : (isBn ? 'এখানে ক্লিক করে ছবি নির্বাচন করুন' : 'Click here to select picture')}
              </h4>
              <p className="text-[11px] text-gray-500 font-medium">
                {isBn 
                  ? 'গ্যালারি বা ফাইল থেকে সরাসরি পিকচার আপলোড করুন (JPG, PNG, WEBP)' 
                  : 'Directly upload image from gallery or files (JPG, PNG, WEBP)'}
              </p>
            </div>

            <div className="pt-1">
              <span className="px-4 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-black text-xs rounded-xl border border-sky-200 inline-flex items-center gap-1.5 shadow-2xs">
                <Camera className="w-3.5 h-3.5" />
                <span>{isBn ? 'গ্যালারি / পিকচার বাছাই করুন' : 'Browse Gallery / File'}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Optional URL Input */}
      {showUrlInput && (
        <div className="flex gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder={isBn ? 'ছবির অনলাইন লিঙ্ক পেস্ট করুন (https://...)' : 'Paste image URL (https://...)'}
            className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            {isBn ? 'যোগ করুন' : 'Apply'}
          </button>
        </div>
      )}

      {/* Quick Preset Thumbnails */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-gray-600 font-semibold">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>{isBn ? 'অথবা রেডিমেড থাম্বনেইল নির্বাচন করুন:' : 'Or pick a preset category thumbnail:'}</span>
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {JOB_PRESET_THUMBNAILS.map((preset, idx) => {
            const isSelected = value === preset.url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(preset.url);
                  setFileName(preset.name);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500 text-white shadow-xs'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-4 h-4 rounded-full object-cover border border-white/50"
                />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JobThumbnailUploader;
