import React from 'react';
import { X, Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SavedPostsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { isBn, products, wishlist, toggleWishlist, setSelectedProduct, addToCart, showToast } = useApp();
  
  // Use wishlist state which is the source of truth
  const savedProducts = products.filter(p => wishlist?.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up border border-gray-100 max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-white fill-white" />
            <h3 className="font-extrabold text-base text-white">
              {isBn ? 'উইশলিস্ট (সেভ করা পণ্য)' : 'Wishlist (Saved Items)'}
            </h3>
            {savedProducts.length > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {savedProducts.length}
              </span>
            )}
          </div>
          <button 
            id="close-saved-posts-modal"
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="p-4 overflow-y-auto space-y-3 divide-y divide-gray-100">
          {savedProducts.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 stroke-[1.8]" />
              </div>
              <p className="text-sm font-bold text-gray-800">
                {isBn ? 'উইশলিস্ট খালি' : 'Wishlist is empty'}
              </p>
              <p className="text-xs text-gray-500">
                {isBn ? 'পণ্য সেভ করতে হার্ট আইকনে ক্লিক করুন।' : 'Tap the heart icon on items to save them.'}
              </p>
            </div>
          ) : (
            savedProducts.map(product => (
              <div key={product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  onClick={() => {
                    setSelectedProduct(product);
                    onClose();
                  }}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0 cursor-pointer hover:opacity-90" 
                />
                <div className="flex-1 min-w-0">
                  <h4 
                    onClick={() => {
                      setSelectedProduct(product);
                      onClose();
                    }}
                    className="font-bold text-xs sm:text-sm truncate text-gray-900 cursor-pointer hover:text-sky-600"
                  >
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs font-black text-sky-600">৳{product.sellingPrice}</p>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                      লাভ ৳{product.resellerProfit}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    id={`modal-wishlist-cart-${product.id}`}
                    onClick={() => {
                      addToCart(product, 1);
                      showToast(isBn ? 'কার্টে যোগ করা হয়েছে!' : 'Added to cart!');
                    }}
                    title={isBn ? 'কার্টে যোগ করুন' : 'Add to cart'}
                    className="p-2 text-sky-600 hover:bg-sky-50 rounded-full cursor-pointer transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                  <button 
                    id={`modal-remove-wishlist-${product.id}`}
                    onClick={() => toggleWishlist(product.id)}
                    title={isBn ? 'মুছুন' : 'Remove'}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-full cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
