import React from 'react';
import { 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  FileCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Coins, 
  HelpCircle,
  Layers
} from 'lucide-react';
import { TypingJobItem, TypingJobType } from '../../types';

interface TypingJobCardProps {
  job: TypingJobItem;
  onStart: (job: TypingJobItem) => void;
  isAlreadySubmitted?: boolean;
}

export const getJobTypeBadge = (type: TypingJobType) => {
  switch (type) {
    case 'image_to_text':
      return { label: 'Image → Text', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: ImageIcon };
    case 'pdf_to_text':
      return { label: 'PDF → Text', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: FileText };
    case 'question_to_text':
      return { label: 'প্রশ্নপত্র → Text', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: HelpCircle };
    case 'topic_to_text':
      return { label: 'নির্দিষ্ট Topic', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: FileCheck };
    case 'screenshot_to_text':
      return { label: 'Screenshot → Text', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Layers };
    case 'document_to_text':
      return { label: 'Document → Text', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: FileText };
    default:
      return { label: 'Typing Task', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: FileText };
  }
};

export const TypingJobCard: React.FC<TypingJobCardProps> = ({
  job,
  onStart,
  isAlreadySubmitted = false
}) => {
  const badge = getJobTypeBadge(job.jobType);
  const IconComponent = badge.icon;
  const isAvailable = job.status === 'active' && (!job.maxCompletions || job.currentCompletions < job.maxCompletions);

  return (
    <div 
      id={`typing-job-card-${job.id}`}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Banner accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      <div>
        {/* Header row: Badge + Reward */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
            <IconComponent className="w-3.5 h-3.5" />
            {badge.label}
          </span>
          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200/70 text-emerald-700 px-3 py-1 rounded-full font-bold text-sm shadow-xs">
            <Coins className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>৳{job.rewardAmount}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 mb-1.5">
          {job.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {job.description}
        </p>

        {/* Meta Info: Time, Max limit, Accuracy */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 mb-4 border border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>আনুমানিক: <strong className="text-slate-700">{job.estimatedMinutes} মি.</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>নির্ভুলতা: <strong className="text-slate-700">{job.minMatchPercentage || 85}%</strong></span>
          </div>
          {job.maxCompletions ? (
            <div className="flex items-center gap-1.5 col-span-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>পূরণ হয়েছে: {job.currentCompletions} / {job.maxCompletions} জন</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 col-span-2 text-[11px] text-emerald-600 pt-1 border-t border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>আনলিমিটেড অংশগ্রহণকারী</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div>
        {isAlreadySubmitted && !job.allowMultipleSubmissionsPerUser ? (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>আপনি এটি ইতিমধ্যে সম্পন্ন করেছেন</span>
          </button>
        ) : !isAvailable ? (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 font-medium text-xs flex items-center justify-center cursor-not-allowed"
          >
            এই কাজের লিমিট শেষ
          </button>
        ) : (
          <button
            id={`btn-start-job-${job.id}`}
            onClick={() => onStart(job)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all"
          >
            <span>কাজ শুরু করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
