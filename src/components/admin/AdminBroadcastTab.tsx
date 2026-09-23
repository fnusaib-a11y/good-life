import React, { useState } from 'react';
import { 
  Send, 
  Bell, 
  Gift, 
  Briefcase, 
  ShoppingBag, 
  Sparkles, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNotification } from '../../types';

export const AdminBroadcastTab: React.FC = () => {
  const { 
    adminBroadcastNotification, 
    notifications, 
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AppNotification['type']>('announcement');

  const templates = [
    {
      title: '🎉 আজকের বিশেষ টার্গেট বোনাস ক্লেইম করুন!',
      msg: 'আজকের সব কয়টি কাজ শেষ করে ইনস্ট্যান্ট ৳৫০ বোনাস ওয়ালেটে যোগ করুন।',
      type: 'bonus' as const
    },
    {
      title: '💼 নতুন ৫টি হাই-পেয়িং মাইক্রো জব লাইভ!',
      msg: 'ইউটিউব এবং ফেসবুক টাস্ক সম্পন্ন করে আনলিমিটেড আয় করুন। সীমিত স্লট!',
      type: 'job' as const
    },
    {
      title: '🔥 মেগা রিসেলিং ক্যাশব্যাক ধামাকা!',
      msg: 'আজকের প্রতিটি সফল ডেলিভারিতে পাচ্ছেন অতিরিক্ত ১০% বোনাস কমিশন।',
      type: 'order' as const
    },
    {
      title: '📢 সিস্টেম নোটিশ ও পেমেন্ট আপডেট',
      msg: 'সকল পেন্ডিং উইথড্রয়াল সফলভাবে প্রসেস করা হয়েছে। ধন্যবাদ আমাদের সাথে থাকার জন্য।',
      type: 'announcement' as const
    }
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      showToast('শিরোনাম ও বার্তা উভয়ই আবশ্যক!');
      return;
    }

    adminBroadcastNotification({
      title,
      message,
      type
    });

    setTitle('');
    setMessage('');
  };

  const applyTemplate = (tmpl: typeof templates[0]) => {
    setTitle(tmpl.title);
    setMessage(tmpl.msg);
    setType(tmpl.type);
    showToast('টেমপ্লেট সিলেক্ট করা হয়েছে!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Broadcast Form */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-100 text-sky-900 rounded-2xl">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
              {isBn ? 'ইনস্ট্যান্ট পুশ ব্রডকাস্ট' : 'Instant Push Broadcast'}
            </h3>
            <p className="text-xs text-gray-500">
              {isBn ? 'সকল ইউজারের অ্যাপ নোটিফিকেশনে সরাসরি পৌঁছাবে' : 'Broadcast to all app active users'}
            </p>
          </div>
        </div>

        {/* Preset Templates */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-700 block">কুইক টেমপ্লেট নির্বাচন করুন:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {templates.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="p-2 text-left bg-gray-50 hover:bg-sky-50/60 border border-gray-200/80 rounded-xl text-xs transition-all flex flex-col justify-between group cursor-pointer"
              >
                <span className="font-extrabold text-gray-900 line-clamp-1 group-hover:text-sky-900">
                  {tmpl.title}
                </span>
                <span className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{tmpl.msg}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-3 pt-2 border-t border-gray-100">
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">নোটিফিকেশন ক্যাটাগরি</label>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
              {[
                { label: 'সাধারণ', value: 'announcement', icon: <Bell className="w-3.5 h-3.5" /> },
                { label: 'বোনাস', value: 'bonus', icon: <Gift className="w-3.5 h-3.5 text-sky-600" /> },
                { label: 'জবস', value: 'job', icon: <Briefcase className="w-3.5 h-3.5 text-sky-600" /> },
                { label: 'শপ', value: 'order', icon: <ShoppingBag className="w-3.5 h-3.5 text-sky-600" /> }
              ].map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setType(cat.value as any)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    type === cat.value
                      ? 'bg-sky-500 border-sky-500 text-white shadow-xs font-black'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {cat.icon}
                  <span className="text-[10px]">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">নোটিশের শিরোনাম *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: বিশেষ অফার চলছে..."
              className="w-full text-xs font-bold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">বার্তা বা বিস্তারিত বিবরণ *</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="সম্পূর্ণ বার্তাটি এখানে লিখুন..."
              className="w-full text-xs font-medium p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isBn ? 'সকল ইউজারের কাছে পাঠান' : 'Broadcast to All Users'}</span>
          </button>
        </form>
      </div>

      {/* Live Preview & Recent History */}
      <div className="space-y-4">
        {/* Live Preview Card */}
        <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-2.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            {isBn ? 'লাইভ প্রিভিউ (ইউজারের ডিভাইসে যেমন দেখাবে):' : 'Live Notification Preview:'}
          </span>
          <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-200/60 flex items-start gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-sky-200 text-sky-900 flex items-center justify-center font-bold text-xs shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <h5 className="font-black text-xs text-gray-900">
                  {title || (isBn ? 'নোটিফিকেশন শিরোনাম' : 'Notification Title')}
                </h5>
                <span className="text-[10px] text-gray-400 font-semibold">এইমাত্র</span>
              </div>
              <p className="text-xs text-gray-600">
                {message || (isBn ? 'বার্তাটি এখানে দৃশ্যমান হবে...' : 'Your broadcast message will appear here...')}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Broadcasts */}
        <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-3">
          <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{isBn ? 'সাম্প্রতিক ব্রডকাস্ট হিস্ট্রি' : 'Recent Sent Broadcasts'}</span>
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs flex justify-between items-start gap-2">
                <div>
                  <h6 className="font-bold text-gray-900">{n.title}</h6>
                  <p className="text-[11px] text-gray-600 line-clamp-1">{n.message}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 font-medium">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
