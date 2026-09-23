import React, { useState, useMemo } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Wallet, 
  Truck, 
  CheckCircle2,
  ShieldCheck,
  Building,
  AlertTriangle,
  Copy,
  Check,
  Store
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    user, 
    wallet, 
    shops,
    activeShopId,
    activeShop,
    createOrder,
    showToast 
  } = useApp();

  // Determine shop for this checkout order
  const checkoutShop = useMemo(() => {
    // Check if any cart item has a shopId
    const cartShopId = cart.find(i => i.product.shopId)?.product.shopId;
    if (cartShopId) {
      const found = shops.find(s => s.id === cartShopId);
      if (found) return found;
    }
    return activeShop || shops.find(s => s.status === 'active') || shops[0] || {
      id: 'shop_main',
      name: 'প্রধান অফিসিয়াল শপ',
      status: 'active',
      displayOrder: 1,
      paymentMethods: {
        bkash: { number: '01799-887766', enabled: true, type: 'personal', instructions: 'বিকাশ Send Money করুন।' },
        nagad: { number: '01799-887766', enabled: true, type: 'personal', instructions: 'নগদ Send Money করুন।' },
        rocket: { number: '01799-887766', enabled: false, type: 'personal', instructions: 'রকেট Send Money করুন।' }
      }
    };
  }, [cart, shops, activeShop]);

  const [customerName, setCustomerName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [division, setDivision] = useState(user.address?.division || 'ঢাকা');
  const [district, setDistrict] = useState(user.address?.district || 'ঢাকা');
  const [upazila, setUpazila] = useState(user.address?.upazila || 'মিরপুর');
  const [area, setArea] = useState(user.address?.area || 'হাউস-১২, রোড-৪, ব্লক-সি');
  
  // Dynamic default payment method based on shop config
  const initialMethod = useMemo<'wallet' | 'bkash' | 'nagad' | 'rocket' | 'cod'>(() => {
    if (checkoutShop.paymentMethods?.bkash?.enabled) return 'bkash';
    if (checkoutShop.paymentMethods?.nagad?.enabled) return 'nagad';
    if (checkoutShop.paymentMethods?.rocket?.enabled) return 'rocket';
    return 'wallet';
  }, [checkoutShop]);

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bkash' | 'nagad' | 'rocket' | 'cod'>(initialMethod);
  
  // Advance delivery charge state for COD or Direct MFS
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState<'wallet' | 'bkash' | 'nagad' | 'rocket'>(
    (wallet?.balance ?? 0) >= 60 ? 'wallet' : (checkoutShop.paymentMethods?.bkash?.enabled ? 'bkash' : 'nagad')
  );
  const [advanceSenderPhone, setAdvanceSenderPhone] = useState('');
  const [advanceTrxId, setAdvanceTrxId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // Dynamic payment number based on selected method and shop configuration
  const currentPaymentInfo = useMemo(() => {
    const activeMethod = paymentMethod === 'cod' ? advancePaymentMethod : paymentMethod;
    if (activeMethod === 'bkash') {
      return {
        name: 'বিকাশ',
        number: checkoutShop.paymentMethods?.bkash?.number || '01799-887766',
        type: checkoutShop.paymentMethods?.bkash?.type === 'merchant' ? 'মার্চেন্ট' : 'পার্সোনাল',
        instructions: checkoutShop.paymentMethods?.bkash?.instructions || 'বিকাশ Send Money করে TrxID দিন।'
      };
    }
    if (activeMethod === 'nagad') {
      return {
        name: 'নগদ',
        number: checkoutShop.paymentMethods?.nagad?.number || '01799-887766',
        type: checkoutShop.paymentMethods?.nagad?.type === 'merchant' ? 'মার্চেন্ট' : 'পার্সোনাল',
        instructions: checkoutShop.paymentMethods?.nagad?.instructions || 'নগদ Send Money করে TrxID দিন।'
      };
    }
    if (activeMethod === 'rocket') {
      return {
        name: 'রকেট',
        number: checkoutShop.paymentMethods?.rocket?.number || '01799-887766',
        type: checkoutShop.paymentMethods?.rocket?.type === 'merchant' ? 'মার্চেন্ট' : 'পার্সোনাল',
        instructions: checkoutShop.paymentMethods?.rocket?.instructions || 'রকেট Send Money করে TrxID দিন।'
      };
    }
    return {
      name: 'অফিসিয়াল পেমেন্ট',
      number: checkoutShop.paymentMethods?.bkash?.number || '01799-887766',
      type: 'পার্সোনাল',
      instructions: 'Send Money করুন'
    };
  }, [paymentMethod, advancePaymentMethod, checkoutShop]);

  if (!isCheckoutOpen) return null;

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.customSellingPrice ?? item.product.sellingPrice;
    return sum + (itemPrice * item.quantity);
  }, 0);
  const deliveryCharge = 60;
  const total = subtotal + deliveryCharge;
  const totalCashback = cart.reduce((sum, item) => sum + (item.product.cashback * item.quantity), 0);
  const totalResellerProfit = cart.reduce((sum, item) => {
    const adminPrice = item.product.supplierPrice || item.product.adminPrice || 0;
    const itemPrice = item.customSellingPrice ?? item.product.sellingPrice;
    const itemProfit = item.customResellerProfit !== undefined
      ? item.customResellerProfit
      : (item.product.resellerProfit || Math.max(0, itemPrice - adminPrice));
    return sum + (itemProfit * item.quantity);
  }, 0);

  const handleCopyNumber = () => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(currentPaymentInfo.number);
      }
    } catch {}
    setIsCopied(true);
    showToast(`${currentPaymentInfo.name} নম্বর কপি হয়েছে: ${currentPaymentInfo.number}`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !phone || !area) {
      showToast('অনুগ্রহ করে নাম, ফোন নম্বর ও বিস্তারিত ঠিকানা পূরণ করুন!');
      return;
    }

    // Check delivery charge enforcement
    if (paymentMethod === 'wallet') {
      if ((wallet?.balance ?? 0) < total) {
        showToast('ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! বিকাশ, নগদ বা রকেট নির্বাচন করুন।');
        return;
      }
    } else if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') {
      if (!advanceSenderPhone || !advanceTrxId) {
        showToast(`সম্পূর্ণ মূল্য ও ডেলিভারি চার্জের (৳${total}) সেন্ডার নম্বর ও TrxID প্রদান করুন!`);
        return;
      }
    }

    const order = createOrder({
      customerName,
      phone,
      address: { division, district, upazila, area },
      paymentMethod,
      shopId: checkoutShop.id,
      shopName: checkoutShop.name,
      deliveryAdvancePaid: true,
      deliveryAdvanceMethod: paymentMethod === 'cod' ? advancePaymentMethod : paymentMethod,
      deliveryAdvanceTrxId: advanceTrxId || (paymentMethod === 'wallet' ? 'WALLET-AUTO' : undefined)
    });

    if (order) {
      setPlacedOrderId(order.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up">
        {/* Header */}
        <div className="bg-sky-500 px-4 py-3.5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-extrabold text-base">চেকআউট ও পেমেন্ট</h3>
          </div>
          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setPlacedOrderId(null);
            }}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {placedOrderId ? (
          /* Order Confirmation Screen */
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">অর্ডার সাবমিট হয়েছে!</h3>
              <p className="text-xs text-gray-600 mt-1">
                আপনার অর্ডারটি পেন্ডিং অবস্থায় আছে। এডমিন পেমেন্ট যাচাই করার পর কনফার্ম করবেন।
              </p>
              <p className="text-xs text-gray-600 mt-1">অর্ডার নম্বর: <strong className="text-sky-800">#{placedOrderId}</strong></p>
            </div>
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 text-xs text-left space-y-2 text-gray-700">
              <div className="flex justify-between"><span>ডেলিভারি ঠিকানা:</span> <strong className="text-gray-900 truncate">{area}, {district}</strong></div>
              <div className="flex justify-between"><span>পেমেন্ট মেথড:</span> <strong className="text-gray-900 uppercase">{paymentMethod}</strong></div>
              <div className="flex justify-between text-sky-700 font-bold"><span>অগ্রিম ডেলিভারি চার্জ (৳৬০):</span> <span>✅ পরিশোধিত</span></div>
              <div className="flex justify-between"><span>ডেলিভারির সময় বকেয়া:</span> <strong className="text-sky-900 font-black text-sm">{paymentMethod === 'cod' ? `৳${subtotal}` : '৳০ (সম্পূর্ণ পরিশোধিত)'}</strong></div>
              <div className="flex justify-between text-sky-700 font-bold"><span>অর্জিত ক্যাশব্যাক:</span> <span>+৳{totalCashback}</span></div>
            </div>
            <button
              onClick={() => {
                setIsCheckoutOpen(false);
                setPlacedOrderId(null);
              }}
              className="w-full py-3 bg-sky-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer hover:bg-sky-600"
            >
              শপিংয়ে ফিরে যান
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* Mandatory Upfront Delivery Notice */}
            <div className="p-3 bg-sky-50 border border-sky-300 rounded-2xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div className="text-xs text-sky-950">
                <strong className="font-extrabold block">বাধ্যতামূলক ডেলিভারি চার্জ নীতি:</strong>
                <p className="text-[11px] leading-snug mt-0.5 text-sky-900">
                  সকল অর্ডারের ক্ষেত্রে <strong>হোম ডেলিভারি চার্জ (৳৬০) সব সময় আগে/অগ্রিম পরিশোধ করতে হবে</strong>। পণ্য হাতে পাওয়ার পর ডেলিভারি ম্যানের কাছে শুধুমাত্র পণ্যমূল্য (৳{subtotal}) পরিশোধ করবেন।
                </p>
              </div>
            </div>

            {/* Active Shop Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block">অর্ডারকৃত শপ:</span>
                  <span className="font-black text-gray-900">{checkoutShop.name}</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                অফিসিয়াল ভেন্ডর শপ
              </span>
            </div>

            {/* Delivery Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-gray-900">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>গ্রাহকের ঠিকানা ও তথ্য</span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">গ্রাহকের পূর্ণ নাম</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                    placeholder="আপনার নাম লিখুন"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">মোবাইল নম্বর (অর্ডার আপডেটের জন্য)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                    placeholder="017XXXXXXXX"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">বিভাগ</label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                    >
                      <option value="ঢাকা">ঢাকা</option>
                      <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                      <option value="রাজশাহী">রাজশাহী</option>
                      <option value="খুলনা">খুলনা</option>
                      <option value="বরিশাল">বরিশাল</option>
                      <option value="সিলেট">সিলেট</option>
                      <option value="রংপুর">রংপুর</option>
                      <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">জেলা / শহর</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">বিস্তারিত ঠিকানা (বাড়ি/রোড/এরিয়া)</label>
                  <textarea
                    rows={2}
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="যেমন: বাড়ি নং ১২, রোড নং ৪, মিরপুর ১০"
                    className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-gray-900">
                  <CreditCard className="w-4 h-4 text-sky-600" />
                  <span>পেমেন্ট মেথড নির্বাচন করুন</span>
                </div>
                <span className="text-[10px] text-gray-500 font-bold">শপ নির্ধারিত পেমেন্ট অপশন</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Wallet Balance */}
                <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'wallet' ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300' : 'bg-gray-50 border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                    className="text-sky-500 mt-0.5"
                  />
                  <div className="text-left">
                    <div className="text-[11px] font-black text-gray-900">ওয়ালেট ব্যালেন্স</div>
                    <div className="text-[9px] text-sky-700 font-bold">ব্যালেন্স: ৳{(wallet?.balance ?? 0).toFixed(1)}</div>
                  </div>
                </label>

                {/* bKash */}
                {checkoutShop.paymentMethods?.bkash?.enabled !== false && (
                  <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'bkash' ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-300' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="text-pink-600 mt-0.5"
                    />
                    <div className="text-left">
                      <div className="text-[11px] font-black text-[#D12053]">বিকাশ (bKash)</div>
                      <div className="text-[9px] text-gray-500 font-mono">{checkoutShop.paymentMethods?.bkash?.number}</div>
                    </div>
                  </label>
                )}

                {/* Nagad */}
                {checkoutShop.paymentMethods?.nagad?.enabled !== false && (
                  <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'nagad' ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-300' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="nagad"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="text-orange-600 mt-0.5"
                    />
                    <div className="text-left">
                      <div className="text-[11px] font-black text-[#ED1C24]">নগদ (Nagad)</div>
                      <div className="text-[9px] text-gray-500 font-mono">{checkoutShop.paymentMethods?.nagad?.number}</div>
                    </div>
                  </label>
                )}

                {/* Rocket */}
                {checkoutShop.paymentMethods?.rocket?.enabled && (
                  <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'rocket' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="rocket"
                      checked={paymentMethod === 'rocket'}
                      onChange={() => setPaymentMethod('rocket')}
                      className="text-purple-600 mt-0.5"
                    />
                    <div className="text-left">
                      <div className="text-[11px] font-black text-[#8C3494]">রকেট (Rocket)</div>
                      <div className="text-[9px] text-gray-500 font-mono">{checkoutShop.paymentMethods?.rocket?.number}</div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Advance Delivery Payment Form for COD or MFS */}
            {(paymentMethod === 'cod' || paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
              <div className="bg-gray-900 text-white rounded-2xl p-3.5 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                    <Truck className="w-4 h-4 text-sky-400" />
                    <span>
                      {paymentMethod === 'cod' ? 'অগ্রিম ডেলিভারি চার্জ (৳৬০) পরিশোধ' : `সম্পূর্ণ পেমেন্ট (৳${total}) পরিশোধ`}
                    </span>
                  </div>
                  <span className="text-[10px] bg-sky-400 text-white font-black px-2 py-0.5 rounded-md">
                    {paymentMethod === 'cod' ? '৳৬০' : `৳${total}`}
                  </span>
                </div>

                {/* If COD, allow choosing advance payment source */}
                {paymentMethod === 'cod' && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-300 block mb-1">ডেলিভারি চার্জ পরিশোধের মাধ্যম:</label>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAdvancePaymentMethod('wallet')}
                        className={`py-1.5 rounded-lg font-bold border transition-all ${
                          advancePaymentMethod === 'wallet' ? 'bg-sky-500 text-white border-sky-300' : 'bg-gray-800 text-gray-300 border-gray-700'
                        }`}
                      >
                        ওয়ালেট (৳{(wallet?.balance ?? 0).toFixed(0)})
                      </button>
                      {checkoutShop.paymentMethods?.bkash?.enabled !== false && (
                        <button
                          type="button"
                          onClick={() => setAdvancePaymentMethod('bkash')}
                          className={`py-1.5 rounded-lg font-bold border transition-all ${
                            advancePaymentMethod === 'bkash' ? 'bg-[#D12053] text-white border-pink-400' : 'bg-gray-800 text-gray-300 border-gray-700'
                          }`}
                        >
                          বিকাশ
                        </button>
                      )}
                      {checkoutShop.paymentMethods?.nagad?.enabled !== false && (
                        <button
                          type="button"
                          onClick={() => setAdvancePaymentMethod('nagad')}
                          className={`py-1.5 rounded-lg font-bold border transition-all ${
                            advancePaymentMethod === 'nagad' ? 'bg-[#F7921E] text-white border-orange-400' : 'bg-gray-800 text-gray-300 border-gray-700'
                          }`}
                        >
                          নগদ
                        </button>
                      )}
                      {checkoutShop.paymentMethods?.rocket?.enabled && (
                        <button
                          type="button"
                          onClick={() => setAdvancePaymentMethod('rocket')}
                          className={`py-1.5 rounded-lg font-bold border transition-all ${
                            advancePaymentMethod === 'rocket' ? 'bg-[#8C3494] text-white border-purple-400' : 'bg-gray-800 text-gray-300 border-gray-700'
                          }`}
                        >
                          রকেট
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Show send money instruction if paying via bKash/Nagad/Rocket */}
                {(paymentMethod !== 'cod' || advancePaymentMethod !== 'wallet') && (
                  <>
                    <div className="bg-black/50 p-2.5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <span>{currentPaymentInfo.name} ({currentPaymentInfo.type}) নম্বর (Send Money):</span>
                        </div>
                        <div className="font-mono text-base font-black text-sky-300 tracking-wider">
                          {currentPaymentInfo.number}
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          {currentPaymentInfo.instructions}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className="px-2.5 py-1.5 bg-sky-500 text-white text-[11px] font-black rounded-lg flex items-center gap-1 hover:bg-sky-400 active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'কপি হয়েছে' : 'কপি নম্বর'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-gray-300 block mb-1">প্রেরকের নম্বর</label>
                        <input
                          type="tel"
                          required
                          value={advanceSenderPhone}
                          onChange={(e) => setAdvanceSenderPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full text-xs p-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-1 focus:ring-sky-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-300 block mb-1">ট্রানজেকশন ID (TrxID)</label>
                        <input
                          type="text"
                          required
                          value={advanceTrxId}
                          onChange={(e) => setAdvanceTrxId(e.target.value)}
                          placeholder="9JH88XX"
                          className="w-full text-xs p-2 bg-gray-800 border border-gray-700 rounded-xl text-white uppercase focus:ring-1 focus:ring-sky-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'cod' && advancePaymentMethod === 'wallet' && (
                  <div className="text-[11px] text-sky-400 font-bold bg-sky-950/40 p-2 rounded-xl border border-sky-500/30">
                    ✅ অর্ডার সাবমিট করলে আপনার ওয়ালেট থেকে অগ্রিম ৳৬০ ডেলিভারি চার্জ স্বয়ংক্রিয়ভাবে কাটা হবে।
                  </div>
                )}
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-600"><span>পণ্য মূল্য:</span> <strong className="font-mono">৳{subtotal}</strong></div>
              <div className="flex justify-between text-sky-900 font-bold">
                <span>হোম ডেলিভারি চার্জ (অগ্রিম প্রদেয়):</span> 
                <strong className="font-mono">৳{deliveryCharge}</strong>
              </div>
              <div className="flex justify-between text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 font-black">
                <span>আপনার রিসেলিং লাভ:</span> 
                <span className="font-mono text-sm">+৳{totalResellerProfit}</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium px-1">
                * এডমিন প্রাইজ বাদে অতিরিক্ত ৳{totalResellerProfit} টাকা অর্ডারটি কনফার্ম হলে সরাসরি আপনার একাউন্টে জমা হবে।
              </div>
              <div className="flex justify-between text-sm font-black text-gray-950 pt-1.5 border-t border-gray-200">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-sky-800 text-base font-mono">৳{total}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="checkout-confirm-btn"
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-sky-300"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {`অর্ডার কনফার্ম করুন (৳${total})`}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
