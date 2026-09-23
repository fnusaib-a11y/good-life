import React, { useState } from 'react';
import { 
  X, 
  Briefcase, 
  ArrowLeft,
  Coins, 
  Users, 
  Link as LinkIcon, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JobThumbnailUploader } from './JobThumbnailUploader';
import { JOB_PRESET_THUMBNAILS } from '../../lib/imageUtils';

interface PostJobModalProps {
  onClose: () => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ onClose }) => {
  const { userPostJob, showToast, isBn } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('সোশ্যাল মিডিয়া');
  const [thumbnailImage, setThumbnailImage] = useState(JOB_PRESET_THUMBNAILS[0].url);
  const [reward, setReward] = useState(1.50);
  const [availableSlots, setAvailableSlots] = useState(100);
  const [targetUrl, setTargetUrl] = useState('');
  const [proofRequirement, setProofRequirement] = useState(
    'কাজটি সম্পন্ন করে স্ক্রিনশট এবং আপনার ইউজারনেম বা আইডি প্রুফ হিসেবে জমা দিন।'
  );
  const [instructions, setInstructions] = useState<string[]>([
    'প্রদত্ত লিংকে প্রবেশ করুন।',
    'চ্যানেল বা পেজটি সাবস্ক্রাইব / ফলো করুন এবং লাইক দিন।',
    'স্ক্রিনশট তুলে এখানে প্রুফ হিসেবে জমা দিন।'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddInstruction = () => {
    setInstructions(prev => [...prev, '']);
  };

  const handleUpdateInstruction = (index: number, val: string) => {
    setInstructions(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveInstruction = (index: number) => {
    if (instructions.length <= 1) return;
    setInstructions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast(isBn ? 'জবের শিরোনাম লিখুন!' : 'Please enter job title!');
      return;
    }
    if (!thumbnailImage) {
      showToast(isBn ? 'জবের জন্য একটি থাম্বনেইল ছবি আপলোড বা নির্বাচন করুন!' : 'Please upload a thumbnail picture!');
      return;
    }
    if (!targetUrl.trim()) {
      showToast(isBn ? 'কাজের টার্গেট লিংক দিন!' : 'Please enter target URL!');
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
      const validInstructions = instructions
        .filter(ins => ins && ins.trim() !== '')
        .map(ins => ins.trim());

      const success = userPostJob({
        jobCode: generatedCode,
        title: title.trim(),
        category: category || 'সোশ্যাল মিডিয়া',
        reward: Math.max(0.1, Number(reward) || 0.5),
        image: thumbnailImage,
        availableSlots: Math.max(1, Number(availableSlots) || 10),
        completedSlots: 0,
        deadline: '৩ দিন বাকি',
        instructions: validInstructions.length > 0 ? validInstructions : ['কাজের নির্দেশনা দেখে কাজ সম্পন্ন করুন'],
        targetUrl: targetUrl.trim(),
        proofRequirement: (proofRequirement || 'কাজের সঠিক প্রমাণ জমা দিন').trim(),
        status: 'active',
        featured: true
      });

      if (success) {
        onClose();
      }
    } catch (err) {
      console.error('Error submitting job post:', err);
      showToast(isBn ? 'জব পোস্ট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।' : 'Failed to post job, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCost = (reward * availableSlots).toFixed(2);

  return (
    <div 
      id="post-job-full-page"
      className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-y-auto animate-in fade-in duration-200"
    >
      {/* DIRECT PAGE TOP APP BAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-200 shrink-0">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                  {isBn ? 'নতুন মাইক্রো জব পোস্ট করুন' : 'Post a New Micro Job'}
                </h1>
                <p className="text-[10px] sm:text-[11px] text-sky-700 font-semibold">
                  {isBn ? 'সরাসরি ছবি আপলোড করে কাজ পাবলিশ করুন' : 'Upload custom thumbnail and publish job'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Full Page Body */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Title */}
          <div>
            <label className="font-bold text-gray-800 text-xs block mb-1">
              {isBn ? 'কাজের নাম / শিরোনাম *' : 'Job Title *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isBn ? 'যেমন: ইউটিউব চ্যানেল সাবস্ক্রাইব ও ভিডিও লাইক' : 'e.g. Subscribe YouTube Channel & Like Video'}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-bold text-gray-800 text-xs block mb-1">
              {isBn ? 'কাজের ধরন / ক্যাটাগরি' : 'Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
            >
              <option value="সোশ্যাল মিডিয়া">সোশ্যাল মিডিয়া (Social Media)</option>
              <option value="ইউটিউব ওয়াচ">ইউটিউব ওয়াচ (YouTube Watch/Sub)</option>
              <option value="অ্যাপ ইনস্টল">অ্যাপ ইনস্টল (App Download)</option>
              <option value="ফেসবুক ফলো">ফেসবুক ফলো (Facebook Follow)</option>
              <option value="টেলিগ্রাম জয়েন">টেলিগ্রাম জয়েন (Telegram Join)</option>
              <option value="ওয়েবসাইট ভিজিট">ওয়েবসাইট ভিজিট (Website Visit)</option>
              <option value="কুইজ/টাইপিং">কুইজ/টাইপিং (Quiz/Typing)</option>
            </select>
          </div>

          {/* Job Thumbnail with direct picture upload */}
          <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-100">
            <JobThumbnailUploader
              value={thumbnailImage}
              onChange={setThumbnailImage}
              isBn={isBn}
            />
          </div>

          {/* Reward & Slot Count Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-800 text-xs block mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-sky-600" />
                <span>{isBn ? 'প্রতি কাজে পারিশ্রমিক (৳) *' : 'Reward per Task (৳) *'}</span>
              </label>
              <input
                type="number"
                step="0.10"
                min="0.20"
                required
                value={reward}
                onChange={(e) => setReward(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-black text-sky-700 focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 text-xs block mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>{isBn ? 'মোট মেম্বার সংখ্যা (Slots) *' : 'Total Slots *'}</span>
              </label>
              <input
                type="number"
                min="5"
                required
                value={availableSlots}
                onChange={(e) => setAvailableSlots(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-black focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Budget Calculation Summary Card */}
          <div className="p-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl border border-sky-200 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700">
              {isBn ? 'মোট প্রজেক্ট বাজেট:' : 'Total Project Budget:'}
            </span>
            <span className="font-black text-sm sm:text-base text-sky-700">
              ৳{totalCost}
            </span>
          </div>

          {/* Target Link */}
          <div>
            <label className="font-bold text-gray-800 text-xs block mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-sky-600" />
              <span>{isBn ? 'কাজের টার্গেট লিংক (URL) *' : 'Target Task URL *'}</span>
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://youtube.com/... অথবা https://facebook.com/..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800 text-xs flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>{isBn ? 'কাজের নিয়মাবলী (Instructions)' : 'Step-by-Step Instructions'}</span>
              </label>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isBn ? 'ধাপ যোগ করুন' : 'Add Step'}</span>
              </button>
            </div>

            {instructions.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleUpdateInstruction(idx, e.target.value)}
                  placeholder={`ধাপ ${idx + 1}`}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
                />
                {instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(idx)}
                    className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Proof Requirement */}
          <div>
            <label className="font-bold text-gray-800 text-xs block mb-1">
              {isBn ? 'প্রমাণ হিসেবে কী জমা দিতে হবে? *' : 'Proof Requirement *'}
            </label>
            <textarea
              rows={2}
              required
              value={proofRequirement}
              onChange={(e) => setProofRequirement(e.target.value)}
              placeholder="স্ক্রিনশট এবং ইউজার আইডি জমা দিন..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs rounded-2xl cursor-pointer transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isBn ? 'মাইক্রো জব পাবলিশ করুন' : 'Publish Micro Job'}</span>
            </button>
          </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PostJobModal;
