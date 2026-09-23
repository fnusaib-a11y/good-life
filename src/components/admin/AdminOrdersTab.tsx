import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  ChevronDown, 
  ChevronUp,
  CreditCard,
  Check,
  AlertCircle,
  ShieldCheck,
  Coins,
  XCircle,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';

export const AdminOrdersTab: React.FC = () => {
  const { 
    orders, 
    adminUpdateOrderStatus, 
    adminVerifyOrderPayment,
    adminReleaseOrderEarnings,
    adminRejectOrder,
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [rejectOrderModal, setRejectOrderModal] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('পেমেন্ট বা ঠিকানা অসম্পূর্ণ');

  const statuses: { label: string; value: OrderStatus | 'all'; color: string }[] = [
    { label: isBn ? 'সকল অর্ডার' : 'All', value: 'all', color: 'bg-gray-900 text-white' },
    { label: isBn ? 'পেন্ডিং' : 'Pending', value: 'pending', color: 'bg-sky-100 text-sky-900' },
    { label: isBn ? 'কনফার্মড' : 'Confirmed', value: 'confirmed', color: 'bg-blue-100 text-blue-900' },
    { label: isBn ? 'প্রসেসিং' : 'Processing', value: 'processing', color: 'bg-indigo-100 text-indigo-900' },
    { label: isBn ? 'শিপড' : 'Shipped', value: 'shipped', color: 'bg-purple-100 text-purple-900' },
    { label: isBn ? 'ডেলিভার্ড' : 'Delivered', value: 'delivered', color: 'bg-sky-100 text-sky-900' },
    { label: isBn ? 'বাতিল' : 'Cancelled', value: 'cancelled', color: 'bg-red-100 text-red-900' }
  ];

  const getStatusCount = (val: OrderStatus | 'all') => {
    if (val === 'all') return orders.length;
    return orders.filter(o => o.status === val).length;
  };

  const filtered = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' ? true : order.status === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    adminUpdateOrderStatus(orderId, newStatus);
  };

  const handleConfirmOrderReject = () => {
    if (!rejectOrderModal) return;
    adminRejectOrder(rejectOrderModal.id, rejectReason);
    setRejectOrderModal(null);
  };

  return (
    <div className="space-y-3.5">
      {/* Top Orders Search & Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'অর্ডার আইডি, গ্রাহক বা ফোন...' : 'Search by order ID, name, phone...'}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {statuses.map(st => (
              <button
                key={st.value}
                onClick={() => setFilterStatus(st.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  filterStatus === st.value
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st.label} ({getStatusCount(st.value)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 space-y-2">
          <Package className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-sm font-bold text-gray-700">
            {isBn ? 'কোনো শপ অর্ডার পাওয়া যায়নি' : 'No orders found'}
          </h4>
          <p className="text-xs text-gray-400">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div 
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden transition-all"
              >
                {/* Order Summary Header */}
                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center font-black text-xs shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs sm:text-sm text-gray-900">অর্ডার #{order.id}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          order.status === 'delivered' ? 'bg-sky-100 text-sky-800' :
                          order.status === 'pending' ? 'bg-sky-100 text-sky-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{order.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-left sm:text-right">
                      <span className="text-xs sm:text-sm font-black text-gray-900 block">৳{order.total}</span>
                      <span className="text-[10px] text-gray-500 font-semibold uppercase">{order.paymentMethod}</span>
                    </div>

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-2 bg-white hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'লুকান' : 'বিস্তারিত'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-100 space-y-3.5 animate-fade-in text-xs">
                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">গ্রাহকের তথ্য</span>
                        <div className="font-extrabold text-gray-900 mt-0.5">{order.customerName}</div>
                        <div className="text-gray-600 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <a href={`tel:${order.phone}`} className="text-sky-600 hover:underline">{order.phone}</a>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">ডেলিভারি ঠিকানা</span>
                        <div className="text-gray-800 font-medium flex items-start gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{order.address?.area}, {order.address?.upazila}, {order.address?.district}</span>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1.5">অর্ডারকৃত পণ্যসমূহ:</span>
                      <div className="space-y-1.5">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2">
                              {item.product?.images?.[0] && (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.product.name}
                                  className="w-9 h-9 object-cover rounded-md border border-gray-200"
                                />
                              )}
                              <div>
                                <h5 className="font-bold text-gray-900 text-xs">{item.product?.name}</h5>
                                <span className="text-[10px] text-gray-400">পরিমাণ: {item.quantity} টি</span>
                              </div>
                            </div>
                            <span className="font-extrabold text-gray-900">৳{(item.product?.sellingPrice || 0) * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Two-Step Verification & Reseller Payout Control */}
                    <div className="p-3 bg-gradient-to-r from-sky-50 to-indigo-50/60 rounded-xl border border-sky-200/80 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-sky-600" />
                          <span className="font-black text-xs text-sky-950">
                            {isBn ? 'দুই ধাপের অর্ডার ভ্যালিডেশন ও ওয়ালেট আর্নিং রিলিজ:' : 'Two-Step Validation & Wallet Payout:'}
                          </span>
                        </div>
                        
                        {(order.resellerProfit || order.profit) && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-sky-200 text-xs font-black text-sky-900 shadow-2xs">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span>রিসেলার মুনাফা: ৳{order.resellerProfit || order.profit}</span>
                          </div>
                        )}
                      </div>

                      {/* Step Status Badges & Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Step 1: Payment Verification */}
                        <div className="p-2.5 bg-white rounded-lg border border-sky-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">
                              ধাপ ১: পেমেন্ট / ট্রানজেকশন যাচাই
                            </span>
                            {order.paymentVerified ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ভেরিফাইড
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                যাচাই বাকি
                              </span>
                            )}
                          </div>

                          {!order.paymentVerified && order.status !== 'cancelled' ? (
                            <div className="flex items-center gap-1.5 pt-1">
                              <button
                                onClick={() => adminVerifyOrderPayment(order.id)}
                                className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>পেমেন্ট ভেরিফাই করুন</span>
                              </button>
                              <button
                                onClick={() => setRejectOrderModal(order)}
                                className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-600">
                              {order.paymentVerified 
                                ? 'অ্যাডমিন পেমেন্ট/ট্রানজেকশন নিশ্চিত করেছেন।' 
                                : 'অর্ডারটি বাতিল করা হয়েছে।'}
                            </p>
                          )}
                        </div>

                        {/* Step 2: Release Earnings to Wallet */}
                        <div className="p-2.5 bg-white rounded-lg border border-sky-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">
                              ধাপ ২: ওয়ালেটে মুনাফা রিলিজ
                            </span>
                            {order.earningsReleased ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                রিলিজ সম্পন্ন
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded-full">
                                রিলিজ অপেক্ষমাণ
                              </span>
                            )}
                          </div>

                          {!order.earningsReleased && order.status !== 'cancelled' ? (
                            <button
                              onClick={() => adminReleaseOrderEarnings(order.id)}
                              disabled={!order.paymentVerified}
                              className={`w-full py-1.5 px-2.5 font-black text-xs rounded-lg flex items-center justify-center gap-1 transition-colors ${
                                order.paymentVerified 
                                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-2xs cursor-pointer' 
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                              title={!order.paymentVerified ? 'আগে ধাপ ১ এ পেমেন্ট ভেরিফাই করুন' : ''}
                            >
                              <Coins className="w-3.5 h-3.5 text-amber-300" />
                              <span>
                                {order.paymentVerified 
                                  ? `ইউজারের ওয়ালেটে ৳${order.resellerProfit || order.profit || 0} রিলিজ করুন` 
                                  : 'আগে পেমেন্ট ভেরিফাই করুন'}
                              </span>
                            </button>
                          ) : (
                            <p className="text-[11px] text-gray-600">
                              {order.earningsReleased 
                                ? 'মুনাফা সফলভাবে ইউজারের ওয়ালেটে জমা হয়েছে।' 
                                : 'পেমেন্ট ভেরিফিকেশন সম্পন্ন হলে রিলিজ করা যাবে।'}
                            </p>
                          )}
                        </div>
                      </div>

                      {order.rejectionReason && (
                        <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span><strong>বাতিলের কারণ:</strong> {order.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Update Quick Stepper */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-gray-700">ডেলিভারি স্ট্যাটাস দ্রুত পরিবর্তন করুন:</span>
                        <button
                          onClick={() => setRejectOrderModal(order)}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>অর্ডার বাতিল ও কারণ লিখুন</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          onClick={() => handleStatusChange(order.id, 'confirmed')}
                          className={`py-1.5 px-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                            order.status === 'confirmed' ? 'bg-sky-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          ✓ কনফার্ম
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'processing')}
                          className={`py-1.5 px-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                            order.status === 'processing' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          ⚙ প্রসেসিং
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'shipped')}
                          className={`py-1.5 px-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                            order.status === 'shipped' ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          🚚 শিপড (কুরিয়ার)
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          className={`py-1.5 px-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                            order.status === 'delivered' ? 'bg-sky-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          🎉 ডেলিভার্ড
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Order Modal with Transparency Reason */}
      {rejectOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-black text-sm text-gray-900">
                {isBn ? 'অর্ডার বাতিল ও অডিট লগ সংরক্ষণ' : 'Cancel Order & Log Audit'}
              </h4>
            </div>

            <p className="text-xs text-gray-600">
              {isBn 
                ? `অর্ডার #${rejectOrderModal.id} (${rejectOrderModal.customerName}) বাতিল করার নির্দিষ্ট কারণ নির্বাচন করুন:`
                : `Select reason to cancel order #${rejectOrderModal.id}:`}
            </p>

            <div className="space-y-1.5">
              {[
                'পেমেন্ট বা TrxID পাওয়া যায়নি বা ভুয়া ট্রানজেকশন',
                'গ্রাহকের দেওয়া ঠিকানা বা ফোন নম্বর সঠিক নয়',
                'পণ্য স্টকে নেই বা কুরিয়ার এলাকা বহির্ভূত',
                'গ্রাহক বা রিসেলার নিজে অর্ডার বাতিল করতে অনুরোধ করেছেন'
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    rejectReason === reason 
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold ring-1 ring-rose-300' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectOrderModal(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {isBn ? 'ফিরে যান' : 'Back'}
              </button>
              <button
                type="button"
                onClick={handleConfirmOrderReject}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isBn ? 'বাতিল নিশ্চিত করুন' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
