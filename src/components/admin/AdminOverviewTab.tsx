import React, { useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Briefcase, 
  Wallet, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Zap,
  Send,
  PlusCircle,
  ShieldCheck,
  Award,
  Flame,
  ArrowDownLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminOverviewTabProps {
  onNavigateTab: (tab: any) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ onNavigateTab }) => {
  const { 
    jobSubmissions, 
    orders, 
    withdrawalRequests, 
    depositRequests,
    fetchFreshDeposits,
    fetchFreshUsers,
    products, 
    jobs, 
    reports, 
    registeredUsers,
    user,
    isLoggedIn,
    language 
  } = useApp();

  const isBn = language === 'bn';

  useEffect(() => {
    if (fetchFreshDeposits) {
      fetchFreshDeposits();
    }
    if (fetchFreshUsers) {
      fetchFreshUsers();
    }
    const handleUpdate = () => {
      if (fetchFreshDeposits) {
        fetchFreshDeposits();
      }
      if (fetchFreshUsers) {
        fetchFreshUsers();
      }
    };
    window.addEventListener('goodlife:deposit_updated', handleUpdate);
    window.addEventListener('goodlife:user_updated', handleUpdate);
    window.addEventListener('goodlife:users_updated', handleUpdate);
    return () => {
      window.removeEventListener('goodlife:deposit_updated', handleUpdate);
      window.removeEventListener('goodlife:user_updated', handleUpdate);
      window.removeEventListener('goodlife:users_updated', handleUpdate);
    };
  }, [fetchFreshDeposits, fetchFreshUsers]);

  const pendingSubmissions = jobSubmissions.filter(s => s.status === 'pending');
  const pendingDeposits = depositRequests.filter(d => (d.status || 'pending').toLowerCase() === 'pending');
  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === 'pending');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');
  const offerProducts = products.filter(p => p.isOfferProduct);

  const totalSalesAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalPendingPayoutAmount = pendingWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
  const userIds = new Set(
    [
      isLoggedIn && user?.id && !(user.id === 'usr_default_01' && user.name === 'নতুন সদস্য') ? user.id : null,
      ...(registeredUsers || []).map(u => {
        if (!u || !u.id) return null;
        if (u.id === 'usr_default_01' && u.name === 'নতুন সদস্য') return null;
        if (u.phone === '01700000000' && u.name === 'নতুন সদস্য') return null;
        return u.id;
      })
    ].filter(Boolean)
  );
  const totalUsersCount = Math.max(userIds.size, (registeredUsers || []).length);

  const totalDepositPendingAmount = pendingDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);

  const kpis = [
    {
      id: 'pending_deposits',
      title: isBn ? 'পেন্ডিং ডিপোজিট' : 'Pending Deposits',
      value: `৳${totalDepositPendingAmount.toLocaleString()}`,
      change: `${pendingDeposits.length} টি রিকোয়েস্ট`,
      isPositive: pendingDeposits.length === 0,
      icon: <ArrowDownLeft className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200/80',
      action: () => onNavigateTab('deposits')
    },
    {
      id: 'pending_withdraw',
      title: isBn ? 'পেন্ডিং উইথড্রয়াল' : 'Pending Withdrawals',
      value: `৳${totalPendingPayoutAmount.toLocaleString()}`,
      change: `${pendingWithdrawals.length} টি রিকোয়েস্ট`,
      isPositive: pendingWithdrawals.length === 0,
      icon: <Wallet className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-200/80',
      action: () => onNavigateTab('withdrawals')
    },
    {
      id: 'pending_submissions',
      title: isBn ? 'পেন্ডিং জব রিভিউ' : 'Pending Job Reviews',
      value: `${pendingSubmissions.length} টি`,
      change: `${jobSubmissions.length} টির মধ্যে পেন্ডিং`,
      isPositive: pendingSubmissions.length === 0,
      icon: <Briefcase className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50 border-sky-200/80',
      action: () => onNavigateTab('submissions')
    },
    {
      id: 'gross_sales',
      title: isBn ? 'মোট শপ সেলস' : 'Total Shop Sales',
      value: `৳${totalSalesAmount.toLocaleString()}`,
      change: `${orders.length} টি মোট অর্ডার`,
      isPositive: true,
      icon: <ShoppingBag className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200/80',
      action: () => onNavigateTab('orders')
    },
    {
      id: 'active_users',
      title: isBn ? 'নিবন্ধিত ইউজার' : 'Registered Users',
      value: `${totalUsersCount} জন`,
      change: `${(registeredUsers || []).filter(u => u.isVerified).length} জন ভেরিফাইড`,
      isPositive: true,
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200/80',
      action: () => onNavigateTab('users')
    },
    {
      id: 'offer_products',
      title: isBn ? 'টপ অফার প্রোডাক্ট' : 'Top Offer Products',
      value: `${offerProducts.length} টি`,
      change: `${products.length} টি মোট প্রোডাক্ট`,
      isPositive: true,
      icon: <Flame className="w-5 h-5 text-amber-600 fill-current" />,
      bg: 'bg-amber-50 border-amber-200/80',
      action: () => onNavigateTab('products')
    }
  ];

  const quickActions = [
    {
      label: isBn ? 'ডিপোজিট অ্যাপ্রুভ' : 'Approve Deposits',
      badge: pendingDeposits.length,
      icon: <ArrowDownLeft className="w-4 h-4 text-emerald-700" />,
      color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900',
      action: () => onNavigateTab('deposits')
    },
    {
      label: isBn ? 'উইথড্র প্রসেস' : 'Process Withdrawals',
      badge: pendingWithdrawals.length,
      icon: <Wallet className="w-4 h-4 text-rose-700" />,
      color: 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900',
      action: () => onNavigateTab('withdrawals')
    },
    {
      label: isBn ? 'জব রিভিউ' : 'Review Proofs',
      badge: pendingSubmissions.length,
      icon: <Briefcase className="w-4 h-4 text-sky-700" />,
      color: 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-900',
      action: () => onNavigateTab('submissions')
    },
    {
      label: isBn ? 'নতুন পণ্য যুক্ত' : 'Add Product',
      icon: <PlusCircle className="w-4 h-4 text-blue-700" />,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900',
      action: () => onNavigateTab('products')
    },
    {
      label: isBn ? 'মাইক্রো জব পোস্ট' : 'Post Job',
      icon: <PlusCircle className="w-4 h-4 text-purple-700" />,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900',
      action: () => onNavigateTab('jobs')
    },
    {
      label: isBn ? 'বাটন কন্ট্রোল' : 'Feature Toggles',
      icon: <Zap className="w-4 h-4 text-amber-700" />,
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900',
      action: () => onNavigateTab('buttons')
    }
  ];

  return (
    <div className="space-y-4">
      {/* Live System Health Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <h3 className="font-black text-sm sm:text-base text-white">
                {isBn ? 'সুপার এডমিন কন্ট্রোল সেন্টার' : 'Super Admin Control Center'}
              </h3>
              <span className="bg-sky-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                LIVE
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              {isBn 
                ? 'রিয়েল-টাইম সিস্টেমের সকল অর্ডার, ইউজার, অফার ও উইথড্র তথ্য নিচে প্রদর্শিত হচ্ছে।'
                : 'Real-time database sync for all orders, users, offer products, and withdrawals.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl text-center flex-1 sm:flex-initial">
            <span className="text-[10px] text-gray-400 block font-bold">নিবন্ধিত ইউজার</span>
            <span className="text-xs font-black text-sky-400">{totalUsersCount} জন</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl text-center flex-1 sm:flex-initial">
            <span className="text-[10px] text-gray-400 block font-bold">পেন্ডিং টাস্ক</span>
            <span className="text-xs font-black text-sky-400">
              {pendingDeposits.length + pendingSubmissions.length + pendingWithdrawals.length + pendingOrders.length} টি
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            onClick={kpi.action}
            className={`p-3.5 sm:p-4 rounded-2xl border ${kpi.bg} shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-gray-700">{kpi.title}</span>
              <div className="p-2 bg-white rounded-xl shadow-2xs">
                {kpi.icon}
              </div>
            </div>
            <div className="mt-2">
              <span className="text-base sm:text-xl font-black text-gray-950 block">{kpi.value}</span>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-[10px] sm:text-[11px] font-bold ${kpi.isPositive ? 'text-sky-700' : 'text-rose-700'}`}>
                  {kpi.change}
                </span>
                <ArrowUpRight className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Station */}
      <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-3">
        <h4 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-sky-500" />
          <span>{isBn ? 'কুইক অ্যাকশন স্টেশন' : 'Quick Action Station'}</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {quickActions.map((qa, idx) => (
            <button
              key={idx}
              onClick={qa.action}
              className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xs cursor-pointer relative ${qa.color}`}
            >
              {qa.icon}
              <span className="truncate">{qa.label}</span>
              {qa.badge !== undefined && qa.badge > 0 && (
                <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[9px] font-black shadow-xs">
                  {qa.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Realtime Live Pipeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Urgent Action Items */}
        <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>{isBn ? 'জরুরি পেন্ডিং অ্যাকশন' : 'Urgent Pending Tasks'}</span>
            </h4>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
              লাইভ ডাটা
            </span>
          </div>

          <div className="space-y-2">
            <div 
              onClick={() => onNavigateTab('submissions')}
              className="p-3 bg-sky-50/60 hover:bg-sky-100/80 rounded-xl border border-sky-200/80 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-200 text-sky-900 flex items-center justify-center font-bold text-xs">
                  {pendingSubmissions.length}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900">{isBn ? 'পেন্ডিং জব সাবমিশন' : 'Pending Job Submissions'}</h5>
                  <p className="text-[10px] text-gray-500">{isBn ? 'ইউজাররা প্রুফ জমা দিয়ে অনুমোদনের অপেক্ষায়' : 'Users waiting for reward approval'}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-800">রিভিউ →</span>
            </div>

            <div 
              onClick={() => onNavigateTab('deposits')}
              className="p-3 bg-sky-50/60 hover:bg-sky-100/80 rounded-xl border border-sky-200/80 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-200 text-sky-900 flex items-center justify-center font-bold text-xs">
                  {pendingDeposits.length}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900">{isBn ? 'ডিপোজিট অ্যাপ্রুভাল কিউ' : 'Deposit Approval Queue'}</h5>
                  <p className="text-[10px] text-gray-500">{isBn ? 'ইউজারদের ডিপোজিট TrxID যাচাই করে ব্যালেন্সে যোগ করুন' : 'Verify TrxID and approve wallet balance'}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-800">অ্যাপ্রুভ করুন →</span>
            </div>

            <div 
              onClick={() => onNavigateTab('withdrawals')}
              className="p-3 bg-rose-50/60 hover:bg-rose-100/80 rounded-xl border border-rose-200/80 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-200 text-rose-900 flex items-center justify-center font-bold text-xs">
                  {pendingWithdrawals.length}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900">{isBn ? 'উইথড্রয়াল পে-আউট রিকোয়েস্ট' : 'Withdrawal Requests'}</h5>
                  <p className="text-[10px] text-gray-500">{isBn ? 'bKash / Nagad টাকা ট্রান্সফার নিশ্চিত করুন' : 'Confirm bKash / Nagad disbursements'}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-800">প্রসেস →</span>
            </div>

            <div 
              onClick={() => onNavigateTab('orders')}
              className="p-3 bg-blue-50/60 hover:bg-blue-100/80 rounded-xl border border-blue-200/80 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-200 text-blue-900 flex items-center justify-center font-bold text-xs">
                  {pendingOrders.length}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900">{isBn ? 'নতুন শপ অর্ডার' : 'New Shop Orders'}</h5>
                  <p className="text-[10px] text-gray-500">{isBn ? 'ডেলিভারি পার্টনারের কাছে পাঠানোর জন্য রেডি' : 'Ready for dispatch'}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-800">অর্ডার দেখুন →</span>
            </div>
          </div>
        </div>

        {/* System & Real Data Breakdown */}
        <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-3">
          <h4 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <span>{isBn ? 'সিস্টেম ডাটা ও অফার ওভারভিউ' : 'System & Offer Overview'}</span>
          </h4>

          <div className="space-y-2 text-xs">
            <div 
              onClick={() => onNavigateTab('products')}
              className="flex items-center justify-between p-2.5 bg-sky-50/60 hover:bg-sky-100/60 rounded-xl border border-sky-200/60 cursor-pointer transition-colors"
            >
              <span className="text-sky-900 font-bold flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-sky-600 text-sky-600" />
                <span>{isBn ? 'হোমপেজ টপ অফার প্রোডাক্টস' : 'Top Offer Products'}</span>
              </span>
              <span className="font-black text-sky-900">{offerProducts.length} টি সক্রিয়</span>
            </div>

            <div 
              onClick={() => onNavigateTab('products')}
              className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
            >
              <span className="text-gray-600 font-semibold">{isBn ? 'মোট রিসেলিং পণ্য সংখ্যা' : 'Total Reselling Products'}</span>
              <span className="font-extrabold text-gray-900">{products.length} টি</span>
            </div>

            <div 
              onClick={() => onNavigateTab('jobs')}
              className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
            >
              <span className="text-gray-600 font-semibold">{isBn ? 'সক্রিয় মাইক্রো জবস' : 'Active Micro Jobs'}</span>
              <span className="font-extrabold text-gray-900">{jobs.length} টি</span>
            </div>

            <div 
              onClick={() => onNavigateTab('reports')}
              className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
            >
              <span className="text-gray-600 font-semibold">{isBn ? 'অনলাইন সাপোর্ট রিপোর্টস' : 'Open Support Tickets'}</span>
              <span className="font-extrabold text-rose-600">{pendingReports.length} টি ওপেন</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
