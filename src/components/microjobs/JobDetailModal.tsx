import React, { useState, useMemo, useRef } from 'react';
import { 
  ArrowLeft,
  ExternalLink, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  Image as ImageIcon,
  Check,
  RotateCcw,
  X,
  Link2,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { compressImage } from '../../lib/imageUtils';

export const JobDetailModal: React.FC = () => {
  const { selectedJob, setSelectedJob, jobSubmissions, submitJobProof, user, showToast } = useApp();

  const [showProofForm, setShowProofForm] = useState(false);
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofLink, setProofLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Find user's existing submission for this job (if any)
  const userSubmission = useMemo(() => {
    if (!selectedJob) return null;
    const uid = user?.id;
    const uPhone = user?.phone;
    return (jobSubmissions || []).find(s => 
      s.jobId === selectedJob.id && 
      ((uid && s.userId === uid) || (uPhone && s.userPhone === uPhone))
    );
  }, [selectedJob, jobSubmissions, user?.id, user?.phone]);

  if (!selectedJob) return null;

  // Status checks
  const isLimitReached = (selectedJob.completedSlots || 0) >= (selectedJob.availableSlots || 100) || selectedJob.status === 'completed';
  const isPaused = selectedJob.status === 'paused';
  const hasSubmitted = Boolean(userSubmission);
  const isApproved = userSubmission?.status === 'approved';
  const isPending = userSubmission?.status === 'pending';
  const isRejected = userSubmission?.status === 'rejected';

  // Allowed proof type
  const proofType = selectedJob.proofType || 'screenshot_text';
  const requiresScreenshot = proofType === 'screenshot' || proofType === 'screenshot_text' || proofType === 'all';
  const requiresText = proofType === 'text' || proofType === 'screenshot_text' || proofType === 'all';
  const requiresLink = proofType === 'link' || proofType === 'all';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 600, 0.65);
        setProofImage(compressed);
        showToast('স্ক্রিনশট সফলভাবে সংযুক্ত হয়েছে!');
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          setProofImage(reader.result as string);
          showToast('স্ক্রিনশট সফলভাবে সংযুক্ত হয়েছে!');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleOpenProofForm = () => {
    if (isLimitReached && !hasSubmitted) {
      showToast('এই জবের মোট লিমিট পূর্ণ হয়ে গেছে!');
      return;
    }
    if (isPaused) {
      showToast('এই জবটি বর্তমানে সাময়িক বন্ধ রয়েছে।');
      return;
    }
    if (hasSubmitted && !isRejected) {
      showToast('আপনি ইতিমধ্যেই এই জবের জন্য প্রুফ জমা দিয়েছেন!');
      return;
    }
    setShowProofForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (requiresText && !proofText.trim()) {
      showToast('অনুগ্রহ করে কাজের প্রমাণ টেক্সট বা ইউজারনেম লিখুন!');
      return;
    }

    if (requiresScreenshot && !proofImage) {
      showToast('অনুগ্রহ করে কাজের স্ক্রিনশট আপলোড করুন!');
      return;
    }

    if (requiresLink && !proofLink.trim()) {
      showToast('অনুগ্রহ করে কাজের লিংক / URL প্রদান করুন!');
      return;
    }

    setIsSubmitting(true);
    try {
      submitJobProof(selectedJob, proofText.trim(), proofImage || undefined, proofLink.trim() || undefined);
      setShowProofForm(false);
      setProofText('');
      setProofImage(null);
      setProofLink('');
    } catch (err) {
      console.error('Submission failed:', err);
      showToast('প্রুফ জমা দিতে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F4F5F7] animate-fade-in overflow-y-auto">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#EAB308] px-4 py-3 sm:py-3.5 shadow-sm flex items-center justify-between text-white">
        <button
          onClick={() => setSelectedJob(null)}
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <h1 className="text-white font-extrabold text-base sm:text-lg flex-1 text-center pr-9 truncate">
          মাইক্রো জব বিস্তারিত
        </h1>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md mx-auto p-3.5 sm:p-4 space-y-4 pb-20 flex-1">
        {/* The Big Rounded White Card (Matches Reference Screenshot) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-100 space-y-4">
          
          {/* Summary Row at Top of Card: Reward | Job ID | Slots */}
          <div className="flex items-center justify-between px-1 pt-0.5 text-gray-900 border-b border-gray-100 pb-3">
            {/* Reward */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">রিওয়ার্ড</span>
              <span className="text-base sm:text-lg font-black tracking-tight text-gray-900">
                Tk {Number(selectedJob.reward ?? 0.5).toFixed(1).replace(/\.0$/, '')}
              </span>
            </div>

            {/* Job Code */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">জব আইডি</span>
              <span className="text-sm sm:text-base font-black text-gray-800">
                {selectedJob.jobCode || '10165'}
              </span>
            </div>

            {/* Slots Completed / Available */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">কমপ্লিট / লিমিট</span>
              <span className="text-sm sm:text-base font-black text-gray-900">
                {selectedJob.completedSlots || 0}/{selectedJob.availableSlots || 200}
              </span>
            </div>
          </div>

          {/* Large Media Section */}
          <div className="w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 relative shadow-inner">
            {selectedJob.videoUrl ? (
              selectedJob.videoUrl.includes('youtube.com') || selectedJob.videoUrl.includes('youtu.be') ? (
                <div className="relative w-full pb-[56.25%] bg-black">
                  <iframe
                    src={selectedJob.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title={selectedJob.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={selectedJob.videoUrl}
                  poster={selectedJob.image}
                  controls
                  className="w-full max-h-[360px] object-cover bg-black"
                />
              )
            ) : selectedJob.image ? (
              <img
                src={selectedJob.image}
                alt={selectedJob.title}
                className="w-full max-h-[360px] object-cover sm:object-contain bg-black/5"
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 bg-gray-50">
                <ImageIcon className="w-10 h-10 text-gray-300" />
              </div>
            )}
          </div>

          {/* Job Title & Task Duration */}
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              {selectedJob.taskDuration || '১min এর কাজ'}
            </h2>
            {selectedJob.title && (
              <p className="text-xs sm:text-sm font-bold text-gray-600 leading-snug">
                {selectedJob.title}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* “লিংকে যান” Button (only if targetUrl exists) */}
            {selectedJob.targetUrl && (
              <a
                href={selectedJob.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 sm:py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-gray-950 font-black text-sm sm:text-base rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>লিংকে যান</span>
                <ExternalLink className="w-4 h-4 text-gray-900" />
              </a>
            )}

            {/* “প্রুফ সাবমিট করুন” Button */}
            <button
              onClick={handleOpenProofForm}
              disabled={isLimitReached || isPaused || (hasSubmitted && !isRejected)}
              className="w-full py-3 sm:py-3.5 bg-[#EAB308] hover:bg-[#CA8A04] text-white font-black text-sm sm:text-base rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {hasSubmitted 
                  ? (isApproved ? 'প্রুফ অনুমোদিত হয়েছে' : isRejected ? 'পুনরায় প্রুফ সাবমিট করুন' : 'প্রুফ সাবমিট করা হয়েছে')
                  : isLimitReached 
                    ? 'লিমিট শেষ হয়ে গেছে' 
                    : isPaused 
                      ? 'জব সাময়িক বন্ধ' 
                      : 'প্রুফ সাবমিট করুন'}
              </span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>

          {/* Instruction Note (as shown in reference screenshot) */}
          <div className="text-xs sm:text-sm font-bold text-gray-800 leading-relaxed whitespace-pre-line pt-1">
            {selectedJob.notes || 'Go বাটনে ক্লিক করুন কি করে কাজ করবে ওয়েবসাইটে বলা হয়েছে সততার সাথে কাজ করবেন 🥰🥰'}
          </div>

          {/* Numbered Step-by-Step Instructions */}
          {Array.isArray(selectedJob.instructions) && selectedJob.instructions.length > 0 && (
            <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 space-y-2 mt-3">
              <div className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>কাজের বিস্তারিত নির্দেশনা</span>
              </div>
              <div className="space-y-1.5">
                {selectedJob.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proof Requirement Box */}
          {selectedJob.proofRequirement && (
            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1">
              <div className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>প্রমাণ হিসেবে যা দিতে হবে:</span>
              </div>
              <p className="text-xs text-amber-950/80 leading-relaxed font-semibold">
                {selectedJob.proofRequirement}
              </p>
            </div>
          )}
        </div>

        {/* Existing Submission Status Notification */}
        {hasSubmitted && (
          <div className={`p-4 rounded-3xl border shadow-xs space-y-3 ${
            isApproved 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
              : isRejected 
                ? 'bg-rose-50 border-rose-200 text-rose-950' 
                : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  isApproved ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : 'bg-amber-500'
                }`} />
                <h3 className="text-xs sm:text-sm font-black">
                  {isApproved 
                    ? 'আপনার কাজটি অনুমোদিত হয়েছে!' 
                    : isRejected 
                      ? 'আপনার প্রুফটি বাতিল হয়েছে' 
                      : 'পর্যালোচনাধীন (Under Review)'}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                {userSubmission?.status}
              </span>
            </div>

            <p className="text-xs font-medium leading-relaxed">
              {isApproved 
                ? `অভিনন্দন! আপনার কাজটি এডমিন অনুমোদন করেছেন। রিওয়ার্ড ৳${(selectedJob.reward ?? 0.5).toFixed(2)} আপনার ওয়ালেটে যুক্ত হয়েছে।`
                : isRejected 
                  ? (userSubmission?.rejectionReason || 'প্রমাণ সঠিক না হওয়ায় প্রুফটি বাতিল করা হয়েছে। নিচে সঠিক প্রুফ পুনরায় জমা দিন।')
                  : 'আপনার প্রুফ সফলভাবে জমা হয়েছে। এডমিন যাচাই করে দ্রুত আপনার ওয়ালেটে রিওয়ার্ড যুক্ত করবেন।'}
            </p>

            {/* Submitted Proof Summary */}
            <div className="p-3 bg-white/90 rounded-2xl border border-black/5 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-500 text-[10.5px]">
                <span>জমা দেওয়ার সময়:</span>
                <span className="font-semibold text-gray-700">{userSubmission?.submittedAt}</span>
              </div>
              {userSubmission?.proofText && (
                <div className="pt-1">
                  <span className="text-[10px] text-gray-500 font-bold block">আপনার প্রদত্ত প্রমাণ টেক্সট:</span>
                  <p className="font-semibold text-gray-900 bg-gray-50 p-2 rounded-xl mt-0.5">
                    {userSubmission.proofText}
                  </p>
                </div>
              )}
              {userSubmission?.proofImage && (
                <div className="pt-1">
                  <span className="text-[10px] text-gray-500 font-bold block mb-1">সংযুক্ত স্ক্রিনশট:</span>
                  <img
                    src={userSubmission.proofImage}
                    alt="Proof Screenshot"
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Limit Reached Warning */}
        {isLimitReached && !hasSubmitted && (
          <div className="p-4 rounded-3xl bg-gray-100 border border-gray-200 text-center space-y-1 text-gray-700">
            <div className="flex items-center justify-center gap-1.5 font-black text-xs text-gray-900">
              <Lock className="w-4 h-4 text-gray-500" />
              <span>এই জবের নির্ধারিত লিমিট পূর্ণ হয়ে গেছে</span>
            </div>
            <p className="text-[11px] text-gray-500">
              মোট {selectedJob.completedSlots}/{selectedJob.availableSlots} টি স্লট পূর্ণ হয়ে গেছে। অন্য কোনো জব সম্পন্ন করুন।
            </p>
          </div>
        )}

        {/* Proof Submission Form (Card) */}
        {showProofForm && (!hasSubmitted || isRejected) && !isLimitReached && (
          <div ref={formRef} className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-amber-200 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#EAB308]" />
                <h3 className="font-black text-sm sm:text-base text-gray-900">
                  প্রমাণ জমা দিন (Proof Submission)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProofForm(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-3.5 text-xs">
              {/* Proof Text Input */}
              {requiresText && (
                <div className="space-y-1">
                  <label className="font-bold text-gray-800 block">
                    প্রমাণ টেক্সট / ইউজারনেম / কোড: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required={requiresText}
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    placeholder="আপনার প্রোফাইল নাম, চ্যানেল সাবস্ক্রাইব করা আইডি বা কোড লিখুন..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-medium text-xs leading-relaxed"
                  />
                </div>
              )}

              {/* Proof Link Input */}
              {requiresLink && (
                <div className="space-y-1">
                  <label className="font-bold text-gray-800 block">
                    কাজের লিংক / প্রোফাইল লিংক (URL): <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      required={requiresLink}
                      value={proofLink}
                      onChange={(e) => setProofLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-medium text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Screenshot Upload */}
              {requiresScreenshot && (
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-800 block">
                    স্ক্রিনশট আপলোড করুন: <span className="text-red-500">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-2xl p-4 text-center bg-gray-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {proofImage ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <img
                          src={proofImage}
                          alt="Screenshot Preview"
                          className="w-24 h-24 object-cover rounded-xl border border-amber-300 shadow-xs"
                        />
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                          <Check className="w-4 h-4" />
                          <span>স্ক্রিনশট সফলভাবে সিলেক্ট হয়েছে</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProofImage(null);
                          }}
                          className="text-[10.5px] font-bold text-rose-500 hover:underline"
                        >
                          মুছে ফেলুন ও নতুন দিন
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1 text-gray-500">
                        <Upload className="w-7 h-7 text-amber-500 mb-0.5" />
                        <span className="text-xs font-bold text-gray-800">
                          স্ক্রিনশট সিলেক্ট করতে এখানে ক্লিক করুন
                        </span>
                        <span className="text-[10px] text-gray-400">PNG, JPG সর্বোচ্চ 5MB</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submission Notice */}
              <div className="text-[10.5px] text-gray-500 bg-gray-50 p-2.5 rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>ভুয়ো বা ভুল প্রমাণ দিলে অ্যাকাউন্ট সাময়িক স্থগিত হতে পারে।</span>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProofForm(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-3 bg-[#EAB308] hover:bg-[#CA8A04] text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'জমা হচ্ছে...' : 'প্রুফ সাবমিট নিশ্চিত করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobDetailModal;
