import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CartModal: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    setIsCheckoutOpen 
  } = useApp();

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.customSellingPrice ?? item.product.sellingPrice;
    return sum + (itemPrice * item.quantity);
  }, 0);
  const deliveryCharge = cart.length > 0 ? 60 : 0;
  const totalCashback = cart.reduce((sum, item) => sum + (item.product.cashback * item.quantity), 0);
  const totalProfit = cart.reduce((sum, item) => {
    const adminPrice = item.product.supplierPrice || item.product.adminPrice || 0;
    const itemPrice = item.customSellingPrice ?? item.product.sellingPrice;
    const itemProfit = item.customResellerProfit !== undefined
      ? item.customResellerProfit
      : (item.product.resellerProfit || Math.max(0, itemPrice - adminPrice));
    return sum + (itemProfit * item.quantity);
  }, 0);
  const total = subtotal + deliveryCharge;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="bg-sky-500 px-4 py-3 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="font-extrabold text-base">আপনার শপিং কার্ট ({cart.length})</h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {cart.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold text-gray-600">আপনার কার্ট খালি!</p>
              <p className="text-xs text-gray-400 mt-1">শপ থেকে পছন্দসই পণ্য যোগ করুন।</p>
            </div>
          ) : (
            cart.map((item) => {
              const itemSellingPrice = item.customSellingPrice ?? item.product.sellingPrice;
              const adminPrice = item.product.supplierPrice || item.product.adminPrice || 0;
              const itemProfit = item.customResellerProfit !== undefined
                ? item.customResellerProfit
                : (item.product.resellerProfit || Math.max(0, itemSellingPrice - adminPrice));

              return (
                <div 
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${item.customSellingPrice}`}
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-2xs space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.product.name}</h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-800 mt-0.5">
                        <span>রিসেলিং: ৳{itemSellingPrice}</span>
                        <span className="text-[10px] text-gray-400">(এডমিন: ৳{adminPrice})</span>
                      </div>
                      <div className="text-[11px] font-black text-emerald-700">
                        লাভ: +৳{itemProfit * item.quantity}
                      </div>
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-0.5 rounded-lg shadow-2xs">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-0.5 text-gray-600 hover:text-gray-900 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-gray-900 min-w-[14px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-0.5 text-gray-600 hover:text-gray-900 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Order Summary Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>সাবটোটাল (বিক্রয় মূল্য):</span>
                <span className="font-bold text-gray-900 font-mono">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-bold text-gray-900 font-mono">৳{deliveryCharge}</span>
              </div>
              
              {/* Reseller Profit Notification in Cart */}
              <div className="flex justify-between text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg font-black">
                <span>রিসেলিং সম্ভাব্য লাভ:</span>
                <span className="font-mono text-sm">+৳{totalProfit}</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium px-1">
                * এডমিন প্রাইজ বাদে এই ৳{totalProfit} টাকা অর্ডার কনফার্ম হলে একাউন্টে জমা হবে।
              </div>

              <div className="flex justify-between text-sm font-black text-gray-950 pt-1.5 border-t border-gray-200">
                <span>সর্বমোট:</span>
                <span className="text-sky-800 text-base font-mono">৳{total}</span>
              </div>
            </div>

            <button
              id="cart-proceed-checkout-btn"
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>অর্ডার সম্পন্ন করুন (চেকআউট)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
