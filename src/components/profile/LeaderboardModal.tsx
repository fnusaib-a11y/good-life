import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  Award, 
  Medal, 
  Crown, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Search, 
  Clock, 
  Gift, 
  ArrowUpRight, 
  Target,
  ChevronRight,
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LeaderboardUser } from '../../types';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const { 
    user, 
    isLoggedIn,
    wallet, 
    leaderboard: baseLeaderboard, 
    isBn, 
    language, 
    showToast,
    setActiveTab,
    registeredUsers
  } = useApp();

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('daily');
  const [category, setCategory] = useState<'earnings' | 'team' | 'tasks'>('earnings');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrizeRules, setShowPrizeRules] = useState(false);

  // Countdown timer calculation for tournament reset (resets at 12:00 AM)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 20 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute user's dynamic metrics
  const myIncome = wallet?.totalEarned || wallet?.balance || 0;
  const myTeamCount = registeredUsers.filter(u => {
    if (!u.referredBy || !user?.referralCode) return false;
    const cleanRef = u.referredBy.trim().toUpperCase();
    const myCode = (user.referralCode || '').trim().toUpperCase();
    return cleanRef === myCode;
  }).length;
  const myCompletedTasks = 0;

  // Enrich & Sort Leaderboard based on real users only
  const sortedLeaderboard = useMemo(() => {
    const userMap = new Map<string, LeaderboardUser>();

    // Current logged-in user if real
    if (isLoggedIn && user && user.phone && user.id !== 'usr_default_01') {
      userMap.set(user.id, {
        id: user.id,
        rank: 1,
        name: user.name || 'আমার প্রোফাইল',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        income: myIncome,
        dailyIncome: 0,
        weeklyIncome: 0,
        tasksCompleted: myCompletedTasks,
        teamSize: myTeamCount,
        isVerified: Boolean(user.isVerified),
        badge: user.isVerified ? 'ভেরিফাইড মেম্বার' : 'সদস্য',
        district: user.address?.district || 'বাংলাদেশ'
      });
    }

    // Real registered users
    registeredUsers.forEach(ru => {
      if (ru.id !== 'usr_default_01' && ru.phone && ru.phone !== '01700000000' && ru.name !== 'Nusaib') {
        const teamCount = registeredUsers.filter(u => {
          if (!u.referredBy || !ru.referralCode) return false;
          return (u.referredBy || '').trim().toUpperCase() === (ru.referralCode || '').trim().toUpperCase();
        }).length;
        const income = Number((ru as any).balance ?? (ru as any).wallet?.balance ?? 0);

        userMap.set(ru.id, {
          id: ru.id,
          rank: 1,
          name: ru.name || 'সদস্য',
          avatar: ru.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          income: income,
          dailyIncome: 0,
          weeklyIncome: 0,
          tasksCompleted: 0,
          teamSize: teamCount,
          isVerified: Boolean(ru.isVerified),
          badge: ru.isVerified ? 'ভেরিফাইড মেম্বার' : 'সদস্য',
          district: ru.address?.district || 'বাংলাদেশ'
        });
      }
    });

    const list: LeaderboardUser[] = Array.from(userMap.values());

    // Sort according to category & timeframe
    list.sort((a, b) => {
      if (category === 'team') {
        return (b.teamSize || 0) - (a.teamSize || 0);
      }
      if (category === 'tasks') {
        return (b.tasksCompleted || 0) - (a.tasksCompleted || 0);
      }
      return (b.income || 0) - (a.income || 0);
    });

    // Reassign ranks 1 to N
    return list.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [isLoggedIn, user, registeredUsers, myIncome, myCompletedTasks, myTeamCount, category]);

  // Current logged in user rank
  const myRankInfo = useMemo(() => {
    const found = sortedLeaderboard.find(u => u.id === user?.id || u.name === user?.name);
    if (found) return found;
    return { rank: sortedLeaderboard.length > 0 ? sortedLeaderboard.length + 1 : 1, income: myIncome };
  }, [sortedLeaderboard, user, myIncome]);

  // Top 3 Podium
  const top1 = sortedLeaderboard[0];
  const top2 = sortedLeaderboard[1];
  const top3 = sortedLeaderboard[2];

  // Rest of the leaderboard (from Rank 4)
  const filteredRemaining = useMemo(() => {
    const remaining = sortedLeaderboard.slice(3);
    if (!searchQuery.trim()) return remaining;
    const q = searchQuery.toLowerCase();
    return remaining.filter(u => 
      u.name.toLowerCase().includes(q) || 
      (u.district && u.district.toLowerCase().includes(q))
    );
  }, [sortedLeaderboard, searchQuery]);

  // Helper to format currency
  const getDisplayValue = (u: LeaderboardUser) => {
    if (category === 'team') {
      return `${u.teamSize || 0} জন`;
    }
    if (category === 'tasks') {
      return `${u.tasksCompleted || 0} টাস্ক`;
    }
    if (timeframe === 'daily') {
      return `৳${u.dailyIncome || Math.round(u.income * 0.1)}`;
    }
    if (timeframe === 'weekly') {
      return `৳${u.weeklyIncome || Math.round(u.income * 0.35)}`;
    }
    return `৳${u.income}`;
  };

  const handleGoToJobs = () => {
    onClose();
    setActiveTab('jobs');
    showToast(isBn ? 'মাইক্রো জব সম্পন্ন করে আপনার লিডারবোর্ড র‍্যাংক বৃদ্ধি করুন!' : 'Complete microjobs to boost your leaderboard rank!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up border border-gray-100">
        
        {/* 1. Header with Trophy & Golden Atmosphere */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-5 py-4 flex items-center justify-between text-white shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs ring-2 ring-white/30 shadow-inner">
              <Trophy className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">
                  {isBn ? 'টপ আর্নার লিডারবোর্ড' : 'Top Earners Leaderboard'}
                </h3>
                <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full border border-white/30 text-white flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-100 fill-red-100" />
                  {isBn ? 'লাইভ' : 'LIVE'}
                </span>
              </div>
              <p className="text-[11px] text-amber-100 font-medium">
                {isBn ? 'সেরা ইনকামকারী ও টিম চ্যাম্পিয়নদের তালিকা' : 'Rankings of top community achievers'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Tournament Prize Pool Banner */}
          <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border border-yellow-200/90 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  {isBn ? 'দৈনিক প্রাইজ পুল' : 'Daily Prize Pool'}
                </span>
                <span className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                  <span>৳১০,০০০ নগদ পুরস্কার</span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 font-extrabold px-1.5 py-0.2 rounded-md">
                    টপ ১০ জন
                  </span>
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 justify-end">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>{isBn ? 'শেষ হতে বাকি:' : 'Resets in:'}</span>
              </div>
              <span className="text-xs font-black text-amber-900 font-mono">
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* Timeframe Selector (Daily / Weekly / Monthly / All-Time) */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setTimeframe('daily')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                timeframe === 'daily'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isBn ? 'আজকের' : 'Daily'}
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                timeframe === 'weekly'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isBn ? 'সাপ্তাহিক' : 'Weekly'}
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                timeframe === 'monthly'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isBn ? 'মাসিক' : 'Monthly'}
            </button>
            <button
              onClick={() => setTimeframe('allTime')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                timeframe === 'allTime'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isBn ? 'সর্বকালীন' : 'All-Time'}
            </button>
          </div>

          {/* Category Filter Pills (Earnings / Team / Tasks) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCategory('earnings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                category === 'earnings'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isBn ? 'টপ আর্নার' : 'Top Earners'}</span>
            </button>

            <button
              onClick={() => setCategory('team')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                category === 'team'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isBn ? 'টিম লিডার' : 'Team Leaders'}</span>
            </button>

            <button
              onClick={() => setCategory('tasks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                category === 'tasks'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{isBn ? 'টপ ওয়ার্কার' : 'Top Workers'}</span>
            </button>
          </div>

          {/* 3. PODIUM (Top 3 Champions) or Empty State */}
          {sortedLeaderboard.length === 0 ? (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 text-center space-y-2.5 my-2">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                <Trophy className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-black text-sm text-gray-900">
                {isBn ? 'বর্তমানে কোনো প্রতিযোগী নেই' : 'No active contestants'}
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                {isBn 
                  ? 'নতুন রিয়েল ইউজাররা রেজিস্টার ও কাজ শুরু করলেই তাদের লাইভ র‍্যাংকিং ও পয়েন্ট এখানে স্বয়ংক্রিয়ভাবে দেখাবে।' 
                  : 'Real active users will automatically appear on the live leaderboard as they register and earn.'}
              </p>
            </div>
          ) : (
            <div className="pt-2 pb-1">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end">
                
                {/* Rank 2 (Silver) */}
                {top2 && (
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-2">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden ring-3 ring-slate-300 shadow-md bg-gray-100 relative">
                        <img src={top2.avatar} alt={top2.name} className="w-full h-full object-cover" />
                        <div className="absolute -bottom-1 -right-1 bg-slate-400 text-white rounded-full p-0.5 ring-2 ring-white">
                          <Medal className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-500 text-white font-black text-[10px] px-2 py-0.2 rounded-full shadow-xs">
                        #2
                      </span>
                    </div>

                    <span className="font-extrabold text-xs text-gray-900 line-clamp-1 w-full">{top2.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium">{top2.district}</span>
                    
                    <div className="mt-1 bg-slate-100 border border-slate-200 rounded-xl px-2 py-1 w-full">
                      <span className="text-xs font-black text-slate-800 block">
                        {getDisplayValue(top2)}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 block">
                        {isBn ? 'পুরস্কার ৳৫০০' : 'Prize ৳500'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Rank 1 (Gold Champion) */}
                {top1 && (
                  <div className="flex flex-col items-center text-center -translate-y-2">
                    <div className="relative mb-2">
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                        <Crown className="w-6 h-6 fill-amber-400 stroke-amber-600" />
                      </div>
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl overflow-hidden ring-4 ring-amber-400 shadow-xl bg-gray-100 relative">
                        <img src={top1.avatar} alt={top1.name} className="w-full h-full object-cover" />
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 ring-2 ring-white">
                          <Trophy className="w-4 h-4 fill-amber-200" />
                        </div>
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md">
                        #1 চ্যাম্পিয়ন
                      </span>
                    </div>

                    <span className="font-black text-sm text-gray-900 line-clamp-1 w-full pt-1.5">{top1.name}</span>
                    <span className="text-[10px] text-amber-700 font-bold">{top1.district}</span>

                    <div className="mt-1 bg-gradient-to-b from-amber-100 to-yellow-100 border border-amber-300 rounded-2xl px-2.5 py-1.5 w-full shadow-xs">
                      <span className="text-sm font-black text-amber-950 block">
                        {getDisplayValue(top1)}
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-800 block">
                        {isBn ? 'পুরস্কার ৳১,০০০ + ট্রফি' : 'Prize ৳1,000'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Rank 3 (Bronze) */}
                {top3 && (
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-2">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden ring-3 ring-amber-700/60 shadow-md bg-gray-100 relative">
                        <img src={top3.avatar} alt={top3.name} className="w-full h-full object-cover" />
                        <div className="absolute -bottom-1 -right-1 bg-amber-700 text-white rounded-full p-0.5 ring-2 ring-white">
                          <Award className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-800 text-white font-black text-[10px] px-2 py-0.2 rounded-full shadow-xs">
                        #3
                      </span>
                    </div>

                    <span className="font-extrabold text-xs text-gray-900 line-clamp-1 w-full">{top3.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium">{top3.district}</span>

                    <div className="mt-1 bg-amber-50 border border-amber-200/90 rounded-xl px-2 py-1 w-full">
                      <span className="text-xs font-black text-amber-900 block">
                        {getDisplayValue(top3)}
                      </span>
                      <span className="text-[9px] font-bold text-amber-800 block">
                        {isBn ? 'পুরস্কার ৳২৫০' : 'Prize ৳250'}
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 4. Logged-in User's Live Ranking Banner */}
          <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-purple-900 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 p-0.5 shrink-0 overflow-hidden ring-2 ring-white/30">
                <img 
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'} 
                  alt={user?.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white truncate">{user?.name || 'আপনি'}</span>
                  <span className="text-[10px] bg-yellow-400 text-yellow-950 font-black px-1.5 py-0.2 rounded-md">
                    র‍্যাংক #{myRankInfo.rank}
                  </span>
                </div>
                <span className="text-[11px] text-sky-200 font-medium block">
                  {isBn ? `বর্তমান স্কোর: ৳${myIncome}` : `Score: ৳${myIncome}`} • {isBn ? 'টপ ১০-এ প্রবেশ করতে আরও কাজ করুন' : 'Complete jobs to rank up'}
                </span>
              </div>
            </div>

            <button
              onClick={handleGoToJobs}
              className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-amber-950 font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>{isBn ? 'র‍্যাংক বাড়ান' : 'Boost Rank'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* 5. Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'নাম বা জেলা দিয়ে খুঁজুন...' : 'Search by name or district...'}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 6. Remaining Ranks List (Rank #4 to #10+) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1 text-[11px] font-bold text-gray-500">
              <span>{isBn ? 'অন্যান্য শীর্ষ প্রতিযোগীরা' : 'Other Top Achievers'}</span>
              <span>{isBn ? 'স্কোর / অর্জন' : 'Score / Achievement'}</span>
            </div>

            {filteredRemaining.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-6 text-center text-xs text-gray-500 font-medium">
                {isBn ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No results found'}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredRemaining.map((item) => {
                  const isMe = item.id === user?.id || item.name === user?.name;
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isMe
                          ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-200'
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 text-center font-black text-xs ${
                          item.rank <= 5 ? 'text-amber-600 font-black' : 'text-gray-400'
                        }`}>
                          #{item.rank}
                        </span>

                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                          <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                          {item.isVerified && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 ring-1 ring-white">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-gray-900 truncate">
                              {item.name} {isMe ? (isBn ? '(আপনি)' : '(You)') : ''}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0 hidden sm:inline-block">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium block truncate">
                            {item.district} • {item.teamSize ? `${item.teamSize} টিম মেম্বার` : `${item.tasksCompleted || 0} টাস্ক`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-gray-900 block">
                          {getDisplayValue(item)}
                        </span>
                        {item.rank <= 10 && (
                          <span className="text-[9px] font-bold text-emerald-600 block">
                            {isBn ? 'বোনাস ৳৫০' : '+৳50 Bonus'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Prize Pool Rules Toggle */}
          <div className="pt-1">
            <button
              onClick={() => setShowPrizeRules(!showPrizeRules)}
              className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{isBn ? 'টুর্নামেন্ট পুরস্কার ও নিয়মাবলী' : 'Tournament Prize Rules'}</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showPrizeRules ? 'rotate-90' : ''}`} />
            </button>

            {showPrizeRules && (
              <div className="mt-2 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-2 text-xs animate-fade-in text-gray-700">
                <h5 className="font-black text-amber-950 text-xs">
                  {isBn ? 'টুর্নামেন্ট প্রাইজ ডিস্ট্রিবিউশন:' : 'Prize Distribution:'}
                </h5>
                <ul className="space-y-1 text-[11px] font-medium text-gray-700 pl-4 list-disc">
                  <li><strong>১ম স্থান:</strong> ৳১,০০০ নগদ ওয়ালেট ক্রেডিট + চ্যাম্পিয়ন মেডেল।</li>
                  <li><strong>২য় স্থান:</strong> ৳৫০০ নগদ ওয়ালেট ক্রেডিট।</li>
                  <li><strong>৩য় স্থান:</strong> ৳২৫০ নগদ ওয়ালেট ক্রেডিট।</li>
                  <li><strong>৪র্থ থেকে ১০ম স্থান:</strong> প্রত্যেককে ৳৫০ স্পেশাল বোনাস।</li>
                </ul>
                <p className="text-[10px] text-gray-500 font-medium pt-1">
                  * প্রতিদিন রাত ১২টায় লিডারবোর্ড স্বয়ংক্রিয়ভাবে রিসেট হয় এবং বিজয়ীদের অ্যাকাউন্টে সরাসরি বোনাস ব্যালেন্স যুক্ত হয়ে যায়।
                </p>
              </div>
            )}
          </div>

        </div>

        {/* 7. Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500 font-medium">
            {isBn ? 'প্রতিদিন টাস্ক সম্পন্ন করে পয়েন্ট বাড়ান' : 'Complete tasks daily to rank up'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-black active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {isBn ? 'ঠিক আছে' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
