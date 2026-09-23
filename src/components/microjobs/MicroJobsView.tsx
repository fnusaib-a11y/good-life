import React, { useState, useMemo } from 'react';
import { 
  Menu, 
  Youtube, 
  Search, 
  Briefcase, 
  PlusCircle,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../layout/Header';
import JobHistoryModal from './JobHistoryModal';
import MicroJobBannerSlider from './MicroJobBannerSlider';

export const MicroJobsView: React.FC = () => {
  const { 
    jobs, 
    setSelectedJob, 
    isJobHistoryOpen, 
    setIsJobHistoryOpen,
    jobSubmissions,
    setActiveIncomeModal
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'সব কাজ' },
    { id: 'Social Media', name: 'ফেসবুক/সোশ্যাল' },
    { id: 'Image Task', name: 'ইমেজ/গণনা' },
    { id: 'Website Visit', name: 'ওয়েবসাইট ভিজিট' },
    { id: 'Typing', name: 'টাইপিং/কুইজ' },
    { id: 'Subscribe', name: 'ইউটিউব/টিকটক' }
  ];

  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    const query = (searchQuery || '').trim().toLowerCase();

    return jobs.filter(j => {
      if (!j) return false;
      const titleStr = String(j.title || '').toLowerCase();
      const codeStr = String(j.jobCode || '');
      const matchSearch = !query || titleStr.includes(query) || codeStr.includes(query);
      
      const matchCat = selectedCategory === 'all' || 
                       j.category === selectedCategory ||
                       (selectedCategory === 'Social Media' && (j.category === 'সোশ্যাল মিডিয়া' || j.category === 'Social Media')) ||
                       (selectedCategory === 'Subscribe' && (j.category === 'ইউটিউব ওয়াচ' || j.category === 'Subscribe')) ||
                       (selectedCategory === 'Website Visit' && (j.category === 'ওয়েবসাইট ভিজিট' || j.category === 'Website Visit')) ||
                       (selectedCategory === 'Typing' && (j.category === 'কুইজ/টাইপিং' || j.category === 'Typing'));

      return matchSearch && matchCat;
    });
  }, [jobs, searchQuery, selectedCategory]);

  const pendingSubmissionsCount = jobSubmissions.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-full bg-[#F5F6F8] pb-32 sm:pb-36">
      {/* Responsive Header */}
      <Header 
        title="মাইক্রো জব" 
        rightAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href="https://youtube.com/@kilagbe_official"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-full hover:bg-black/10 text-red-700 transition-colors"
              title="Watch Job Tutorial"
            >
              <Youtube className="w-5 h-5" />
            </a>

            <button
              id="micro-jobs-history-btn"
              onClick={() => setIsJobHistoryOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-black/10 text-gray-900 transition-colors"
              title="Job Submission History"
            >
              <FileText className="w-5 h-5" />
              {jobSubmissions.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-gray-950 text-sky-300 text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {jobSubmissions.length}
                </span>
              )}
            </button>
          </div>
        }
      />

      {/* Main Container */}
      <div className="w-full max-w-5xl lg:max-w-6xl mx-auto px-2.5 sm:px-6 py-3 sm:py-5 space-y-3 sm:space-y-4">
        {/* Search Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-xs border border-gray-100/90">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="জব কোড বা কাজের নাম দিয়ে খুঁজুন (যেমন: 9762, ফেসবুক)..."
              className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 text-xs sm:text-sm font-semibold pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-xs text-gray-400 hover:text-gray-700 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Promotional Micro Job Banner Slider */}
        <MicroJobBannerSlider onPostJobClick={() => setActiveIncomeModal('job_post')} />

        {/* Quick Job Post & Status Action Bar */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900">নিজের কাজের বিজ্ঞাপন দিন</h4>
              <p className="text-[10px] text-gray-500">পেজ ফলোয়ার, লাইক বা ভিজিটর বাড়িয়ে নিন</p>
            </div>
          </div>
          <button
            onClick={() => setActiveIncomeModal('job_post')}
            className="px-3 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>জব পোস্ট করুন</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Job Grid */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-gray-900">
              মোট কাজ উপলব্ধ: <strong className="text-sky-800">{filteredJobs.length} টি</strong>
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-gray-500">
              পেন্ডিং ভেরিফিকেশন: {pendingSubmissionsCount}
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-xs my-4">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-gray-800">বর্তমানে কোনো কাজ উপলব্ধ নেই</h4>
              <p className="text-xs text-gray-500 mt-1">এডমিন নতুন কাজ যুক্ত করলে এখানে প্রদর্শিত হবে।</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
              {filteredJobs.map((job) => {
                const jobReward = Number(job?.reward) || 0;
                const jobCode = String(job?.jobCode || '0000');
                const jobImg = job?.image || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&auto=format&fit=crop&q=80';
                const jobTitle = job?.title || 'মাইক্রো জব';

                return (
                  <div
                    key={job?.id || `job_${jobCode}_${Math.random()}`}
                    id={`microjob-card-${jobCode}`}
                    onClick={() => setSelectedJob(job)}
                    className="bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-100/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between active:scale-95 group"
                  >
                    <div>
                      {/* Image Container with Job ID Green Pill */}
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2">
                        <img
                          src={jobImg}
                          alt={jobTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Job ID Badge */}
                        <span className="absolute top-1.5 left-1.5 bg-sky-600 text-white font-black text-[9.5px] sm:text-xs px-2 py-0.5 rounded shadow-xs">
                          #{jobCode}
                        </span>
                      </div>

                      {/* Job Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-1">
                        {jobTitle}
                      </h4>
                    </div>

                    {/* Reward Pill */}
                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                        {jobReward.toFixed(2)} ৳
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        কাজ শুরু
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submission History Modal */}
      {isJobHistoryOpen && (
        <JobHistoryModal onClose={() => setIsJobHistoryOpen(false)} />
      )}
    </div>
  );
};

export default MicroJobsView;
