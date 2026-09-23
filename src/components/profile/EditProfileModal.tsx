import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Camera, Check, Sparkles, Image } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  normalizePhoneNumber, 
  isValidBangladeshiPhone, 
  normalizeEmail, 
  isValidEmail, 
  checkAccountUniqueness 
} from '../../lib/userValidation';
import { compressImage } from '../../lib/imageUtils';

export const EditProfileModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, updateUserProfile, showToast, language } = useApp();
  const isBn = language === 'bn';

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [coverPhoto, setCoverPhoto] = useState(user.coverPhoto || '');
  const [division, setDivision] = useState(user.address?.division || 'ঢাকা');
  const [district, setDistrict] = useState(user.address?.district || 'ঢাকা');
  const [area, setArea] = useState(user.address?.area || 'মিরপুর ১০');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 256, 256, 0.75);
        setAvatar(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 720, 240, 0.7);
        setCoverPhoto(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          setCoverPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = normalizePhoneNumber(phone);
    const cleanEmail = normalizeEmail(email);

    if (!cleanPhone || !isValidBangladeshiPhone(cleanPhone)) {
      showToast(isBn ? 'সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।' : 'Enter a valid 11-digit mobile number.');
      return;
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      showToast(isBn ? 'সঠিক জিমেইল বা ইমেইল ঠিকানা দিন।' : 'Enter a valid Gmail or email address.');
      return;
    }

    const uniqueness = checkAccountUniqueness(cleanPhone, cleanEmail, user.id);
    if (!uniqueness.isUnique) {
      showToast(isBn ? uniqueness.messageBn : uniqueness.messageEn);
      return;
    }

    updateUserProfile({
      name,
      email: cleanEmail,
      phone: cleanPhone,
      bio,
      avatar,
      coverPhoto,
      address: { division, district, upazila: (user?.address?.upazila || ''), area }
    });
    showToast(isBn ? 'প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up border border-sky-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 px-4 py-3.5 flex items-center justify-between text-white border-b border-sky-500/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-500 text-white rounded-lg">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-sm text-sky-300">
                {isBn ? 'প্রোফাইল তথ্য এডিট করুন' : 'Edit Profile Details'}
              </h3>
              <p className="text-[10px] text-gray-400">
                {isBn ? 'আপনার প্রোফাইল ও যোগাযোগের তথ্য' : 'Update profile & contact'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1 pb-24">
          {/* Cover & Avatar Header Section */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-gray-800">
              {isBn ? 'প্রোফাইল ও কভার ফটো' : 'Profile & Cover Photos'}
            </label>

            {/* Cover Preview & Upload */}
            <div className="relative w-full h-24 rounded-2xl bg-gray-900 overflow-hidden border border-gray-200 group">
              <img 
                src={coverPhoto || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'} 
                alt="Cover" 
                className="w-full h-full object-cover" 
              />
              <label className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/80 hover:bg-black text-sky-300 text-[10px] font-black rounded-lg cursor-pointer flex items-center gap-1 border border-sky-400/50 shadow-md">
                <Camera className="w-3 h-3" />
                <span>{isBn ? 'কভার ছবি' : 'Change Cover'}</span>
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </label>
            </div>

            {/* Avatar Upload */}
            <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-sky-400 shadow-sm"
                />
                <label className="absolute bottom-0 right-0 p-1 bg-sky-500 hover:bg-sky-600 text-white rounded-full cursor-pointer shadow-md border border-white">
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div>
                <span className="text-xs font-black text-gray-900 block">
                  {isBn ? 'প্রোফাইল ছবি' : 'Profile Picture'}
                </span>
                <span className="text-[10px] text-gray-500">
                  {isBn ? 'ছবি পরিবর্তন করতে ক্যামেরা আইকনে চাপুন' : 'Click camera icon to change'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isBn ? 'পূর্ণ নাম' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isBn ? 'বায়ো / বিবরণ (Bio)' : 'Bio / Description'}
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={isBn ? 'আপনার সম্পর্কে সংক্ষেপে লিখুন...' : 'Write a short bio...'}
                className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isBn ? 'ইমেইল এড্রেস' : 'Email'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isBn ? 'মোবাইল নম্বর' : 'Phone'}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isBn ? 'বিভাগ' : 'Division'}
                </label>
                <input
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isBn ? 'জেলা' : 'District'}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isBn ? 'বিস্তারিত ঠিকানা' : 'Detailed Address'}
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border border-sky-400 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
