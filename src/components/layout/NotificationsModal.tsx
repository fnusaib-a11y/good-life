import React from 'react';
import { X, Bell, CheckCheck, ShoppingBag, Briefcase, Gift, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsModal: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { isNotificationsOpen, setIsNotificationsOpen, notifications, markNotificationRead } = useApp();

  // If not open in global state and no onClose passed to override
  if (!isNotificationsOpen && !onClose) return null;

  const handleClose = () => {
    setIsNotificationsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'job': return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'bonus': return <Gift className="w-4 h-4 text-sky-500" />;
      default: return <AlertCircle className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white text-lg">নোটিফিকেশনসমূহ</h3>
          </div>
          <button 
            id="notifications-close-btn"
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors active:scale-95 cursor-pointer"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-3 overflow-y-auto flex-1 divide-y divide-gray-100 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm font-medium">
              কোনো নতুন নোটিফিকেশন নেই
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`py-3 px-2 flex gap-3 rounded-xl transition-all cursor-pointer ${
                  notif.read ? 'bg-white opacity-85' : 'bg-sky-50/70 border border-sky-200/60'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className={`text-sm ${notif.read ? 'font-semibold text-gray-800' : 'font-bold text-gray-950'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-gray-400 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            id="notifications-ok-btn"
            onClick={handleClose}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl text-xs transition-colors active:scale-95 shadow-xs cursor-pointer"
          >
            ঠিক আছে
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
