import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Coins, 
  Clock, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Type, 
  Info
} from 'lucide-react';
import { TypingJobItem } from '../../types';
import { getJobTypeBadge } from './TypingJobCard';
import { TypingInlineAdCard } from './TypingInlineAdCard';
import { validateTypingAccuracy, TypingAccuracyResult } from '../../services/typingJobService';

interface TypingJobDetailsProps {
  job: TypingJobItem;
  onBack: () => void;
  onSubmitWork: (typedText: string, validation: TypingAccuracyResult) => void;
  isSubmitting?: boolean;
}

export const TypingJobDetails: React.FC<TypingJobDetailsProps> = ({
  job,
  onBack,
  onSubmitWork,
  isSubmitting = false
}) => {
  const [typedText, setTypedText] = useState<string>('');
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [isExpandedView, setIsExpandedView] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [validationResult, setValidationResult] = useState<TypingAccuracyResult | null>(null);

  const badge = getJobTypeBadge(job.jobType);
  const IconComponent = badge.icon;

  const charCount = typedText.length;
  const wordCount = typedText.trim() ? typedText.trim().split(/\s+/).length : 0;

  const handleZoomIn = () => setImageZoom(z => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setImageZoom(z => Math.max(0.75, z - 0.25));
  const handleResetZoom = () => setImageZoom(1);

  const handleValidateAndSubmit = () => {
    if (!typedText.trim()) {
      setValidationResult({
        matchPercentage: 0,
        isPassed: false,
        expectedWordCount: job.expectedText.split(' ').filter(Boolean).length,
        submittedWordCount: 0,
        missingWords: [],
        extraWords: [],
        feedbackMessage: 'অনুগ্রহ করে উপরের রেফারেন্স দেখে টেক্সট বক্সে টাইপ করুন।'
      });
      return;
    }

    const validation = validateTypingAccuracy(
      typedText,
      job.expectedText,
      job.validationMode,
      job.minMatchPercentage || 85
    );

    setValidationResult(validation);

    if (validation.isPassed) {
      onSubmitWork(typedText, validation);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large': return 'text-base sm:text-lg leading-relaxed';
      case 'xlarge': return 'text-lg sm:text-xl leading-loose';
      default: return 'text-sm leading-relaxed';
    }
  };

  return (
    <div className="w-full flex flex-col pb-8 animate-in fade-in">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>কাজের তালিকায় ফিরে যান</span>
        </button>

        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs">
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          <span>পুরস্কার: ৳{job.rewardAmount}</span>
        </div>
      </div>

      {/* Job Title Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs mb-4">
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
            <IconComponent className="w-3.5 h-3.5" />
            {badge.label}
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {job.estimatedMinutes} মিনিট
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              ন্যূনতম মিল: {job.minMatchPercentage || 85}%
            </span>
          </div>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-snug mb-2">
          {job.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Reference Material / Document Viewer with Inline Zoom & Expand */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs mb-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">রেফারেন্স ডকুমেন্ট / ছবি</h3>
          </div>

          {/* Zoom & Expand Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={imageZoom <= 0.75}
              title="জুম আউট"
              className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 font-bold text-slate-700 min-w-[38px] text-center">
              {Math.round(imageZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={imageZoom >= 2.5}
              title="জুম ইন"
              className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="রিসেট জুম"
              className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 text-[10px] font-bold px-1.5 cursor-pointer"
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => setIsExpandedView(!isExpandedView)}
              title={isExpandedView ? 'স্বাভাবিক ভিউ' : 'বড় ভিউ'}
              className="p-1 rounded-lg text-emerald-600 hover:bg-white transition-all ml-0.5 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              {isExpandedView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isExpandedView ? 'ছোট করুন' : 'বড় করুন'}</span>
            </button>
          </div>
        </div>

        {/* Preview Container with Zoom/Pan */}
        <div 
          className={`w-full bg-slate-950 rounded-2xl overflow-hidden transition-all duration-300 flex items-center justify-center relative border border-slate-800 shadow-inner ${
            isExpandedView ? 'min-h-[420px] max-h-[650px]' : 'min-h-[220px] max-h-[340px]'
          }`}
        >
          {job.referenceUrl ? (
            <div className="w-full h-full overflow-auto p-4 flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
              <img
                src={job.referenceUrl}
                alt="Job Reference Preview"
                className="max-w-full max-h-none rounded-lg shadow-lg object-contain transition-transform duration-150 ease-out"
                style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center center' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-500" />
              <p className="text-xs">কোনো সরাসরি ছবি দেওয়া নেই। নিচের নির্দেশনা অনুযায়ী টাইপ করুন।</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mb-1">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>এডমিনের কাজের নির্দেশনা:</span>
          </div>
          <p className="text-xs text-emerald-950 whitespace-pre-line leading-relaxed">
            {job.instructions}
          </p>
        </div>
      </div>

      {/* In-Page Large Ad Placement (Ad #3) */}
      <div className="mb-4">
        <TypingInlineAdCard adKey={job.largeAdConfig?.adKey} />
      </div>

      {/* Text Editor Box */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs mb-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">আপনার টাইপিং টেক্সট বক্স</h3>
          </div>

          {/* Font Size Selector & Clear */}
          <div className="flex items-center gap-1 text-xs">
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${fontSize === 'normal' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1 rounded-lg text-[12px] font-bold cursor-pointer ${fontSize === 'large' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`px-2.5 py-1 rounded-lg text-[13px] font-bold cursor-pointer ${fontSize === 'xlarge' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}
              >
                A++
              </button>
            </div>
            {typedText && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('আপনি কি সম্পূর্ণ লেখা মুছে ফেলতে চান?')) {
                    setTypedText('');
                    setValidationResult(null);
                  }
                }}
                className="text-slate-400 hover:text-rose-500 p-1.5 ml-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="মুছে ফেলুন"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div>
          <textarea
            id="typing-input-area"
            value={typedText}
            onChange={(e) => {
              setTypedText(e.target.value);
              if (validationResult) setValidationResult(null);
            }}
            rows={8}
            placeholder="উপরের ছবি/ডকুমেন্ট দেখে এখানে নির্ভুলভাবে টাইপ করুন..."
            className={`w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden font-sans text-slate-800 bg-slate-50/50 resize-y min-h-[180px] ${getFontSizeClass()}`}
          />
        </div>

        {/* Word & Character Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 px-1">
          <div className="flex items-center gap-3 font-medium">
            <span>শব্দ: <strong className="text-slate-800 font-mono">{wordCount}</strong></span>
            <span>অক্ষর: <strong className="text-slate-800 font-mono">{charCount}</strong></span>
          </div>
          <span className="text-[11px] text-slate-400">
            {job.validationMode === 'strict' ? 'কঠোর যাচাইকরণ (৯৫%+ মিল প্রয়োজন)' : 'ফ্লেক্সিবল যাচাইকরণ (৮৫%+ মিল প্রয়োজন)'}
          </span>
        </div>
      </div>

      {/* Validation Feedback Banner (if failed) */}
      {validationResult && !validationResult.isPassed && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 mb-4 text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>যাচাইকরণ ব্যর্থ হয়েছে (মিল: {validationResult.matchPercentage}%)</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed mb-3">
            {validationResult.feedbackMessage}
          </p>

          {validationResult.missingWords.length > 0 && (
            <div className="mb-2 bg-white/80 p-3 rounded-2xl border border-rose-100 text-xs">
              <strong className="text-rose-700 block mb-1.5">সম্ভাব্য বাদ পড়া শব্দ:</strong>
              <div className="flex flex-wrap gap-1">
                {validationResult.missingWords.map((w, idx) => (
                  <span key={idx} className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-md text-[11px] font-semibold">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {validationResult.extraWords.length > 0 && (
            <div className="bg-white/80 p-3 rounded-2xl border border-rose-100 text-xs">
              <strong className="text-rose-700 block mb-1.5">অতিরিক্ত বা ভুল শব্দ:</strong>
              <div className="flex flex-wrap gap-1">
                {validationResult.extraWords.map((w, idx) => (
                  <span key={idx} className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-md text-[11px] font-semibold">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        id="btn-submit-typing-work"
        onClick={handleValidateAndSubmit}
        disabled={isSubmitting || !typedText.trim()}
        className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>{isSubmitting ? 'যাচাই করা হচ্ছে...' : 'কাজ যাচাই ও জমা দিন'}</span>
      </button>
    </div>
  );
};
