import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Megaphone, 
  ArrowLeft,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Link2,
  CheckCircle2,
  Send,
  Sparkles,
  FileText 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { MarketingTaskItem, MarketingSubmissionItem } from '../../types/contentTypes';
import { 
  getMarketingTasks, 
  getMarketingSubmissions, 
  submitMarketingProof 
} from '../../services/realContentService';
import { PersistentAdBanner } from '../common/PersistentAdBanner';

interface AdMarketingModalProps {
  onClose: () => void;
}

export const AdMarketingModal: React.FC<AdMarketingModalProps> = ({ onClose }) => {
  const { 
    user, 
    showToast, 
    isBn 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'my_submissions'>('tasks');
  const [tasks, setTasks] = useState<MarketingTaskItem[]>([]);
  const [submissions, setSubmissions] = useState<MarketingSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected task to submit proof
  const [selectedTask, setSelectedTask] = useState<MarketingTaskItem | null>(null);

  // Submission form state
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofText, setProofText] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tList, sList] = await Promise.all([
        getMarketingTasks(true), // active tasks only
        getMarketingSubmissions(user?.id) // user's submissions
      ]);
      setTasks(tList);
      setSubmissions(sList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(isBn ? 'ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।' : 'Max image size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenSubmit = (task: MarketingTaskItem) => {
    setSelectedTask(task);
    setProofImage(null);
    setProofText('');
    setProofLink('');
    setNote('');
    setSubmitSuccess(false);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !user) return;

    // Validation based on proofType
    if (selectedTask.proofType === 'screenshot' && !proofImage) {
      showToast(isBn ? 'অনুগ্রহ করে স্ক্রিনশট ছবি আপলোড করুন।' : 'Please upload a screenshot image.');
      return;
    }

    if (selectedTask.proofType === 'link' && !proofLink.trim()) {
      showToast(isBn ? 'অনুগ্রহ করে শেয়ার করা পোস্ট বা প্রুফ লিংক দিন।' : 'Please provide the proof link.');
      return;
    }

    if (selectedTask.proofType === 'text' && !proofText.trim()) {
      showToast(isBn ? 'অনুগ্রহ করে আপনার ইউজারনেম বা আইডি টেক্সট দিন।' : 'Please provide your username/proof text.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      await submitMarketingProof({
        id: `mktg_sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        taskId: selectedTask.id,
        taskTitle: selectedTask.title,
        userId: user.id,
        userName: user.name || 'User',
        userPhone: user.phone || 'Unknown',
        proofType: selectedTask.proofType,
        proof: proofText.trim() || proofLink.trim() || (proofImage ? 'ছবি আপলোড করা হয়েছে' : 'প্রুফ জমা'),
        proofImage: proofImage || undefined,
        proofText: proofText.trim() || undefined,
        proofLink: proofLink.trim() || undefined,
        rewardAmount: selectedTask.rewardAmount || 2.00,
        note: note.trim() || undefined,
        timestamp: Date.now(),
        submittedAt: nowIso,
        status: 'pending'
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSubmitSuccess(true);
      showToast(isBn ? 'প্রুফ সফলভাবে জমা হয়েছে! এডমিন অনুমোদনের পর ব্যালেন্স যুক্ত হবে।' : 'Proof submitted successfully!');
      await loadData();
    } catch (err) {
      console.error(err);
      showToast(isBn ? 'প্রুফ জমা করতে ব্যর্থ হয়েছে। পরে চেষ্টা করুন।' : 'Failed to submit proof.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in fade-in duration-200 overflow-y-auto text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-600 text-white">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900">
                  বিজ্ঞাপন ও মার্কেটিং টাস্ক
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  বিজ্ঞাপন কাজ সম্পন্ন করে প্রুফ দিন • এডমিন অনুমোদনে ইনস্ট্যান্ট ব্যালেন্স
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="max-w-3xl mx-auto flex items-center px-4 pt-1 text-xs font-bold border-t border-slate-100">
          <button
            onClick={() => { setActiveTab('tasks'); setSelectedTask(null); }}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tasks' 
                ? 'border-purple-600 text-purple-700 font-black' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            সক্রিয় মার্কেটিং টাস্ক ({tasks.length})
          </button>
          <button
            onClick={() => { setActiveTab('my_submissions'); setSelectedTask(null); }}
            className={`pb-2 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'my_submissions' 
                ? 'border-purple-600 text-purple-700 font-black' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>আমার জমাকৃত প্রুফ</span>
            {submissions.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-600 text-white font-bold">
                {submissions.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Top Persistent Banner Ad */}
      <div className="w-full bg-slate-100 border-b border-slate-200 flex justify-center py-0.5">
        <PersistentAdBanner position="top" page="ad_marketing" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-5 space-y-4">
        
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium text-xs">তথ্য লোড হচ্ছে...</p>
          </div>
        )}

        {/* TASK SUBMIT FORM */}
        {selectedTask && (
          <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in">
            {submitSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-900">
                  প্রুফ সফলভাবে সাবমিট হয়েছে!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  এডমিন প্যানেলে আপনার প্রুফ পৌঁছেছে। এডমিন যাচাই করে অনুমোদন দেওয়ার সাথে সাথে আপনার ওয়ালেটে ৳{selectedTask.rewardAmount.toFixed(2)} স্বয়ংক্রিয়ভাবে জমা হবে।
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      setActiveTab('my_submissions');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
                  >
                    সাবমিশন স্ট্যাটাস দেখুন
                  </button>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    অন্য টাস্ক দেখুন
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      টাস্ক রিওয়ার্ড: ৳{selectedTask.rewardAmount.toFixed(2)}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">
                      {selectedTask.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Instructions */}
                <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100 text-xs space-y-2">
                  <div className="font-bold text-purple-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>কাজের বিস্তারিত নির্দেশনা:</span>
                  </div>
                  <p className="text-purple-900 whitespace-pre-line text-[11px] leading-relaxed">
                    {selectedTask.instructions}
                  </p>
                  {selectedTask.proofRequirement && (
                    <p className="text-[11px] font-bold text-amber-800 pt-1">
                      প্রুফ শর্ত: {selectedTask.proofRequirement}
                    </p>
                  )}
                </div>

                {/* Visit / Marketing Link Button */}
                {selectedTask.marketingLink && (
                  <a
                    href={selectedTask.marketingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>বিজ্ঞাপন / মার্কেটিং লিংকে যান (Click Here to Visit)</span>
                  </a>
                )}

                {/* Proof inputs based on proofType */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-800">
                    প্রমাণ জমা দিন (Proof Type: {selectedTask.proofType}):
                  </h4>

                  {/* Screenshot / Image input */}
                  {(selectedTask.proofType === 'screenshot' || selectedTask.proofType === 'image' || selectedTask.proofType === 'screenshot_link') && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                        <span>কাজের স্ক্রিনশট / ছবি আপলোড করুন:</span>
                      </label>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="hidden" 
                        id="mktg-proof-file"
                      />

                      {proofImage ? (
                        <div className="relative rounded-xl overflow-hidden border border-purple-200 bg-slate-50 p-2 flex items-center justify-between">
                          <img 
                            src={proofImage} 
                            alt="Proof Preview" 
                            className="max-h-24 rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => setProofImage(null)}
                            className="text-xs text-rose-600 font-bold px-3 py-1 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 cursor-pointer"
                          >
                            মুছে ফেলুন
                          </button>
                        </div>
                      ) : (
                        <label 
                          htmlFor="mktg-proof-file"
                          className="w-full py-4 border-2 border-dashed border-purple-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-purple-50 transition"
                        >
                          <Upload className="w-6 h-6 text-purple-600" />
                          <span className="text-xs font-semibold text-slate-600">
                            ছবি বা স্ক্রিনশট সিলেক্ট করুন (সর্বোচ্চ ৫MB)
                          </span>
                        </label>
                      )}
                    </div>
                  )}

                  {/* Link input */}
                  {(selectedTask.proofType === 'link' || selectedTask.proofType === 'screenshot_link') && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Link2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>শেয়ার করা পোস্ট বা প্রুফ লিংক:</span>
                      </label>
                      <input
                        type="url"
                        value={proofLink}
                        onChange={e => setProofLink(e.target.value)}
                        placeholder="https://facebook.com/... অথবা টেলিগ্রাম পোস্ট লিংক"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  )}

                  {/* Text input */}
                  {selectedTask.proofType === 'text' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-purple-600" />
                        <span>ইউজারনেম / আইডি / প্রুফ টেক্সট:</span>
                      </label>
                      <input
                        type="text"
                        value={proofText}
                        onChange={e => setProofText(e.target.value)}
                        placeholder="আপনার ইউজারনেম বা আইডি লিখুন"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  )}

                  {/* Optional Note */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      অতিরিক্ত নোট (ঐচ্ছিক):
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="কোনো বার্তা থাকলে লিখুন..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'জমা হচ্ছে...' : 'প্রুফ সাবমিট করুন'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ACTIVE TASKS LIST */}
        {!selectedTask && activeTab === 'tasks' && !loading && (
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-2">
                <Megaphone className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">
                  বর্তমানে কোনো বিজ্ঞাপন মার্কেটিং টাস্ক সক্রিয় নেই
                </h4>
                <p className="text-slate-500 text-xs">
                  এডমিন নতুন মার্কেটিং পোস্ট পাবলিশ করার সাথে সাথে এখানে দৃশ্যমান হবে।
                </p>
              </div>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={task.thumbnail || 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=600&auto=format&fit=crop&q=80'}
                      alt={task.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          রিওয়ার্ড: ৳{task.rewardAmount?.toFixed(2)}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                          প্রমাণ: {task.proofType}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {task.instructions}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="text-slate-400">
                      শুরু: {task.startDate || 'চলমান'}
                    </span>

                    <button
                      onClick={() => handleOpenSubmit(task)}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>কাজ শুরু ও প্রুফ দিন</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MY SUBMISSIONS LIST */}
        {!selectedTask && activeTab === 'my_submissions' && !loading && (
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700 text-xs">
                  আপনি এখনও কোনো বিজ্ঞাপন প্রুফ জমা দেননি।
                </p>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
                >
                  মার্কেটিং টাস্ক দেখুন
                </button>
              </div>
            ) : (
              submissions.map(sub => (
                <div key={sub.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 inline-block mb-1">
                        আইডি: #{sub.id.slice(-6)}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{sub.taskTitle}</h4>
                      <p className="text-[10px] text-slate-400 pt-0.5">জমাদানের সময়: {sub.submittedAt}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-purple-700 block">
                        ৳{Number(sub.rewardAmount || 2).toFixed(2)}
                      </span>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : sub.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sub.status === 'pending' && '⏳ অপেক্ষমাণ'}
                        {sub.status === 'approved' && '✅ অনুমোদিত (ব্যালেন্স যোগ হয়েছে)'}
                        {sub.status === 'rejected' && '❌ বাতিল'}
                      </span>
                    </div>
                  </div>

                  {sub.rejectionReason && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 font-medium">
                      বাতিলের কারণ: {sub.rejectionReason}
                    </div>
                  )}

                  {sub.proofImage && (
                    <img 
                      src={sub.proofImage} 
                      alt="Proof" 
                      className="max-h-24 rounded-lg border border-slate-200"
                    />
                  )}

                  {sub.proofLink && (
                    <a 
                      href={sub.proofLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 break-all font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {sub.proofLink}
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdMarketingModal;
