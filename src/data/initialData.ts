import { 
  UserProfile, 
  Product, 
  MicroJob, 
  TargetBonus, 
  ReelItem, 
  GroupLink, 
  NetworkUser, 
  LeaderboardUser, 
  AppNotification, 
  Transaction,
  Order,
  WithdrawalRequest
} from '../types';
import { DEFAULT_REWARD_CENTER_OPTIONS } from './rewardCenterData';

export const INITIAL_USER: UserProfile = {
  id: 'usr_default_01',
  name: 'নতুন সদস্য',
  phone: '',
  email: '',
  avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23D97706'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M4 20c0-4 4-6 8-6s8 2 8 6'/%3E%3C/svg%3E",
  role: 'user',
  isVerified: false,
  verificationStatus: 'unverified',
  referralCode: '1001',
  referredBy: '',
  activationCode: '',
  joinedDate: new Date().toISOString().split('T')[0],
  bio: 'Good Life প্ল্যাটফর্ম সদস্য',
  resellerSalesCount: 0,
  ownSalesCount: 0,
  postedProductsCount: 0,
  address: {
    division: 'ঢাকা',
    district: 'ঢাকা',
    upazila: '',
    area: ''
  }
};

export const INITIAL_FEATURED_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    name: 'ACID WASH Premium T-Shirt',
    nameEn: 'ACID WASH T-Shirt',
    category: "Men's Fashion",
    supplierPrice: 280,
    sellingPrice: 415,
    oldPrice: 650,
    discountPercentage: 36,
    resellerProfit: 135,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewCount: 142,
    stock: 45,
    sku: 'TSHIRT-ACID-GRN',
    vendorName: 'Fashion Hub BD',
    vendorId: 'vnd_01',
    isFeatured: true,
    isPopular: true,
    isOfferProduct: true,
    offerTag: 'ধামাকা অফার',
    description: '১০০% পিওর কটন এসিড ওয়াশ প্রিমিয়াম কোয়ালিটি টি-শার্ট। নরম ও আরামদায়ক ফেব্রিক, টেকসই প্রিন্ট এবং আধুনিক স্টাইলিশ ফিটিং।',
    specifications: {
      'ফেব্রিক': '100% Combed Cotton (180+ GSM)',
      'ফিটিং': 'Regular Drop Shoulder Fit',
      'কালার': 'Acid Green Wash',
      'সাইজ': 'M, L, XL, XXL'
    },
    deliveryCharge: 60,
    cashback: 25,
    returnPolicy: '৭ দিনের সহজ রিটার্ন পলিসি'
  },
  {
    id: 'prod_002',
    name: 'SADOER Organic Skin Care Cream',
    nameEn: 'SADOER Cream',
    category: 'Beauty',
    supplierPrice: 230,
    sellingPrice: 360,
    oldPrice: 550,
    discountPercentage: 35,
    resellerProfit: 130,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608248597359-54379db9be50?w=500&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewCount: 98,
    stock: 60,
    sku: 'BEAUTY-SAD-01',
    vendorName: 'Cosmetics Valley',
    vendorId: 'vnd_02',
    isFeatured: true,
    isPopular: true,
    isOfferProduct: true,
    offerTag: '৩৫% ছাড়',
    description: 'ন্যাচারাল হারবাল উপাদানে তৈরি স্কিন ব্রাইটনিং ও ময়েশ্চারাইজিং ক্রিম। ত্বকের শুষ্কতা দূর করে ত্বক করে তোলে উজ্জ্বল ও আকর্ষণীয়।',
    specifications: {
      'ভলিউম': '80g',
      'উপাদান': 'Organic Herbal Essence & Vitamin E',
      'ব্যবহার': 'প্রতিদিন রাতে ঘুমানোর পূর্বে'
    },
    deliveryCharge: 60,
    cashback: 20,
    returnPolicy: 'সিল খোলা ছাড়া ৭ দিনে রিটার্ন'
  },
  {
    id: 'prod_003',
    name: 'OLEVS Luxury Golden Quartz Watch',
    nameEn: 'Olevs Silver Watch',
    category: 'Watch',
    supplierPrice: 650,
    sellingPrice: 980,
    oldPrice: 1650,
    discountPercentage: 41,
    resellerProfit: 330,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewCount: 310,
    stock: 25,
    sku: 'WATCH-OLEVS-GLD',
    vendorName: 'Royal Watch BD',
    vendorId: 'vnd_03',
    isFeatured: true,
    isPopular: true,
    isOfferProduct: true,
    offerTag: 'স্পেশাল ডিল',
    description: 'অরিজিনাল ওলেভস গোল্ডেন কোয়ার্টজ ওয়াচ। প্রিমিয়াম স্টেইনলেস স্টিল স্ট্র্যাপ, ওয়াটারপ্রুফ এবং গ্যারান্টিযুক্ত চকচকে গোল্ড ফিনিশ। সাথে ফ্রি ব্যাটারি ও পিন কাটার।',
    specifications: {
      'মুভমেন্ট': 'Original Quartz Movement',
      'ডায়াল গ্লাস': 'Scratch-Resistant Hardlex',
      'ওয়াটার রেজিস্ট্যান্স': '30M (Daily Waterproof)',
      'উপহার': '০২ টি এক্সট্রা ব্যাটারি + ০১ টি পিন কাটার'
    },
    deliveryCharge: 60,
    cashback: 50,
    returnPolicy: '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি'
  },
  {
    id: 'prod_004',
    name: 'MK-5 Waterproof Smart Watch',
    nameEn: 'MK-5 Smart Watch',
    category: 'Smart Watch',
    supplierPrice: 1100,
    sellingPrice: 1600,
    oldPrice: 2000,
    discountPercentage: 20,
    resellerProfit: 500,
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviewCount: 88,
    stock: 30,
    sku: 'SMART-MK5-BLK',
    vendorName: 'Gadget Express',
    vendorId: 'vnd_04',
    isPopular: true,
    isNew: true,
    isOfferProduct: true,
    offerTag: '২০% ছাড়',
    description: 'হাই-ডেফিনিশন অ্যামোলেড ডিসপ্লে সমৃদ্ধ এমকে-৫ স্মার্ট ওয়াচ। হার্টরেট মনিটর, স্লিপ ট্র্যাকিং, ব্লুটুথ কলিং ও দীর্ঘস্থায়ী ব্যাটারি ব্যাকআপ।',
    specifications: {
      'ডিসপ্লে': '1.85 inch HD AMOLED',
      'ব্যাটারি': '280mAh (5-7 Days Backup)',
      'ফিচার': 'Bluetooth Calling, Heart Rate, SpO2'
    },
    deliveryCharge: 60,
    cashback: 80,
    returnPolicy: '৬ মাসের ব্র্যান্ড ওয়ারেন্টি'
  },
  {
    id: 'prod_005',
    name: 'S12 MAX Ultra Smart Watch 3-Strap',
    nameEn: 'S12 MAX Smart Watch',
    category: 'Smart Watch',
    supplierPrice: 850,
    sellingPrice: 1250,
    oldPrice: 1600,
    discountPercentage: 22,
    resellerProfit: 400,
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewCount: 204,
    stock: 40,
    sku: 'SMART-S12-MAX',
    vendorName: 'Gadget Express',
    vendorId: 'vnd_04',
    isPopular: true,
    isNew: true,
    description: '৩ টি ভিন্ন ডিজাইনের স্ট্র্যাপ সহ এস১২ ম্যাক্স আল্ট্রা স্মার্ট ওয়াচ। ওয়্যারলেস চার্জিং, মাল্টি-স্পোর্টস মোড এবং ফুল স্ক্রিন টাচ।',
    specifications: {
      'স্ট্র্যাপ': '৩ টি প্রিমিয়াম স্ট্র্যাপ অন্তর্ভুক্ত',
      'চার্জার': 'ম্যাগনেটিক ওয়্যারলেস চার্জার',
      'কানেক্টিভিটি': 'Android & iOS Supported'
    },
    deliveryCharge: 60,
    cashback: 60,
    returnPolicy: '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি'
  },
  {
    id: 'prod_006',
    name: 'Kemei Professional Hair Dryer KM-2376',
    nameEn: 'Kemei Hair Dryer KM-2376',
    category: 'Electronics',
    supplierPrice: 650,
    sellingPrice: 1000,
    oldPrice: 1700,
    discountPercentage: 41,
    resellerProfit: 350,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewCount: 156,
    stock: 20,
    sku: 'ELEC-KEMEI-2376',
    vendorName: 'Gadget Express',
    vendorId: 'vnd_04',
    isNew: true,
    description: '৩০০০ ওয়াট শক্তিশালী উইন্ড পাওয়ার যুক্ত কেমেই হেয়ার ড্রায়ার। চুল দ্রুত শুকাতে সাহায্য করে এবং ড্যামেজ রোধ করে। হট ও কোল্ড বাতাস উভয় মোড উপলব্ধ।',
    specifications: {
      'পাওয়ার': '3000W High Speed Motor',
      'মোড': '2 Speed, 3 Heat Settings',
      'নোজল': '1 Concentrator Nozzle Included'
    },
    deliveryCharge: 60,
    cashback: 40,
    returnPolicy: '১ বছরের সার্ভিস ওয়ারেন্টি'
  },
  {
    id: 'prod_007',
    name: 'Kemei KM-6831 1600W Foldable Hair Dryer',
    nameEn: 'Kemei KM-6831 1600W',
    category: 'Electronics',
    supplierPrice: 520,
    sellingPrice: 800,
    oldPrice: 1370,
    discountPercentage: 42,
    resellerProfit: 280,
    images: [
      'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=500&auto=format&fit=crop&q=80'
    ],
    rating: 4.5,
    reviewCount: 73,
    stock: 35,
    sku: 'ELEC-KEMEI-6831',
    vendorName: 'Gadget Express',
    vendorId: 'vnd_04',
    isNew: true,
    description: 'ট্রাভেল ফ্রেন্ডলি ফোল্ডেবল হ্যান্ডেল সমৃদ্ধ কমপ্যাক্ট হেয়ার ড্রায়ার। কম বিদ্যুৎ খরচ এবং প্রিমিয়াম লুক।',
    specifications: {
      'পাওয়ার': '1600W Compact Motor',
      'হ্যান্ডেল': 'Foldable for easy travel',
      'কালার': 'Metallic Pink / Purple'
    },
    deliveryCharge: 60,
    cashback: 30,
    returnPolicy: '৬ মাসের রিপ্লেসমেন্ট পলিসি'
  },
  {
    id: 'prod_008',
    name: 'Super High-Speed USB Rechargeable Desk Fan',
    nameEn: 'Super Desk Fan',
    category: 'Home & Kitchen',
    supplierPrice: 420,
    sellingPrice: 650,
    oldPrice: 950,
    discountPercentage: 31,
    resellerProfit: 230,
    images: [
      'https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=500&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewCount: 112,
    stock: 50,
    sku: 'HOME-FAN-USB01',
    vendorName: 'Gadget Express',
    vendorId: 'vnd_04',
    isNew: true,
    description: 'রিচার্জেবল হাই-স্পিড ৩ ব্লেড ফ্যান। লোডশেডিংয়ের সময় ও টেবিলে ব্যবহারের জন্য অত্যন্ত উপযোগী।',
    specifications: {
      'ব্যাটারি': '2000mAh Li-ion Battery (3-5 Hours)',
      'চার্জিং': 'Type-C Fast Charging',
      'স্পিড': '3 Speed Control'
    },
    deliveryCharge: 60,
    cashback: 25,
    returnPolicy: '৭ দিনের সহজ রিটার্ন'
  }
];

export const INITIAL_CATEGORIES = [
  { 
    id: 'cat_01', 
    name: "Men's Fashion", 
    nameBn: 'পুরুষদের ফ্যাশন', 
    icon: 'Shirt', 
    count: 124,
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400&auto=format&fit=crop&q=80',
    subtitle: 'টি-শার্ট, শার্ট ও পাঞ্জাবি'
  },
  { 
    id: 'cat_02', 
    name: "Women's Fashion", 
    nameBn: 'নারীদের ফ্যাশন', 
    icon: 'Heart', 
    count: 189,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&auto=format&fit=crop&q=80',
    subtitle: 'থ্রি-পিস, কুর্তি ও শাড়ি'
  },
  { 
    id: 'cat_03', 
    name: 'Watch', 
    nameBn: 'ঘড়ি কালেকশন', 
    icon: 'Clock', 
    count: 64,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&auto=format&fit=crop&q=80',
    subtitle: 'ক্লাসিক ও ক্যাজুয়াল ঘড়ি'
  },
  { 
    id: 'cat_04', 
    name: 'Smart Watch', 
    nameBn: 'স্মার্ট ওয়াচ', 
    icon: 'Watch', 
    count: 48,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&auto=format&fit=crop&q=80',
    subtitle: 'হালকা ও ট্র্যাকিং ফিটনেস ওয়াচ'
  },
  { 
    id: 'cat_05', 
    name: 'Electronics', 
    nameBn: 'ইলেকট্রনিক্স', 
    icon: 'Cpu', 
    count: 92,
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&auto=format&fit=crop&q=80',
    subtitle: 'হেয়ার ড্রায়ার, চার্জার ও এক্সেসরিজ'
  },
  { 
    id: 'cat_06', 
    name: 'Beauty', 
    nameBn: 'বিউটি ও রূপচর্চা', 
    icon: 'HeartHandshake', 
    count: 110,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80',
    subtitle: 'অর্গানিক স্কিনকেয়ার ও কসমেটিক্স'
  },
  { 
    id: 'cat_07', 
    name: 'Home & Kitchen', 
    nameBn: 'হোম ও কিচেন', 
    icon: 'Home', 
    count: 76,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
    subtitle: 'পোর্টেবল ফ্যান ও হোম গ্যাজেট'
  },
  { 
    id: 'cat_08', 
    name: 'Gadgets', 
    nameBn: 'স্মার্ট গ্যাজেটস', 
    icon: 'Headphones', 
    count: 85,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80',
    subtitle: 'টিডব্লিউএস ও ব্লুটুথ হেডফোন'
  },
  { 
    id: 'cat_09', 
    name: 'Mobile Accessories', 
    nameBn: 'মোবাইল এক্সেসরিজ', 
    icon: 'Smartphone', 
    count: 130,
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&auto=format&fit=crop&q=80',
    subtitle: 'ক্যাবল, পাওয়ারব্যাংক ও কভার'
  },
  { 
    id: 'cat_10', 
    name: 'Kids', 
    nameBn: 'শিশুদের পোশাক ও খেলনা', 
    icon: 'Baby', 
    count: 42,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&auto=format&fit=crop&q=80',
    subtitle: 'বেবি ড্রেস ও আকর্ষণীয় খেলনা'
  },
  { 
    id: 'cat_11', 
    name: 'Others', 
    nameBn: 'অন্যান্য পণ্য', 
    icon: 'Grid', 
    count: 55,
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&auto=format&fit=crop&q=80',
    subtitle: 'দৈনন্দিন নিত্যপ্রয়োজনীয় আইটেম'
  }
];

export const INITIAL_GROUP_LINKS: GroupLink[] = [
  {
    id: 'grp_01',
    name: 'টেলিগ্রাম',
    type: 'telegram',
    title: 'অফিসিয়াল টেলিগ্রাম চ্যানেল',
    url: 'https://t.me/goodlifeofficialbd',
    memberCount: '52.4K',
    isOnline: true,
    badgeColor: '#0088cc'
  },
  {
    id: 'grp_02',
    name: '২৪/৭ সাপোর্ট',
    type: 'community',
    title: '২৪/৭ হেল্প ও সাপোর্ট',
    url: 'https://t.me/goodlifeadmin_bot',
    memberCount: 'Active',
    isOnline: true,
    badgeColor: '#0284c7'
  },
  {
    id: 'grp_03',
    name: 'অ্যাডমিন',
    type: 'facebook',
    title: 'সরাসরি অ্যাডমিন আইডি',
    url: 'https://t.me/goodlifeadmin',
    memberCount: 'Online',
    isOnline: true,
    badgeColor: '#0ea5e9'
  },
  {
    id: 'grp_04',
    name: 'ইউটিউব',
    type: 'youtube',
    title: 'অফিসিয়াল ইউটিউব চ্যানেল',
    url: 'https://youtube.com',
    memberCount: '62.1K',
    isOnline: false,
    badgeColor: '#ff0000'
  }
];

export const INITIAL_MICRO_JOBS: MicroJob[] = [
  {
    id: 'job_10165',
    jobCode: '10165',
    title: 'বিজ্ঞাপন দেখে ইনকাম করুন! প্রতিদিন আনলিমিটেড',
    category: 'Social Media',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=80',
    availableSlots: 200,
    completedSlots: 127,
    deadline: 'আজ রাত ১২টা পর্যন্ত',
    taskDuration: '১min এর কাজ',
    instructions: [
      'Go বাটনে ক্লিক করে ওয়েবসাইট বা ভিডিওতে যান।',
      'মনোযোগ দিয়ে পুরো ১ মিনিট কাজ সম্পন্ন করুন।',
      'সততার সাথে কাজ সম্পন্ন করে প্রমাণ জমা দিন।'
    ],
    notes: 'Go বাটনে ক্লিক করুন কি করে কাজ করবে ওয়েবসাইটে বলা হয়েছে সততার সাথে কাজ করবেন 🥰🥰',
    targetUrl: 'https://youtube.com',
    proofRequirement: 'স্ক্রিনশট আপলোড করুন এবং আপনার ইউজারনেম লিখুন।',
    proofType: 'screenshot_text',
    status: 'active',
    featured: true
  },
  {
    id: 'job_9762',
    jobCode: '9762',
    title: 'ফেসবুক আইডিতে লাইক ও ফলো',
    category: 'Social Media',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&auto=format&fit=crop&q=80',
    availableSlots: 500,
    completedSlots: 0,
    deadline: 'আজ রাত ১২টা পর্যন্ত',
    instructions: [
      'নিচের "কাজ শুরু করুন" বাটনে ক্লিক করে ফেসবুক পেইজে যান।',
      'পেইজে লাইক ও ফলো দিন।',
      'সর্বশেষ পোস্টে একটি সুন্দর পজিটিভ কমেন্ট করুন।',
      'আপনার লাইক ও ফলো করা প্রোফাইলের পরিষ্কার স্ক্রিনশট নিন এবং সাবমিট করুন।'
    ],
    targetUrl: 'https://facebook.com/kilagbe.campaign',
    proofRequirement: 'ফেসবুক ফলো ও লাইক দেয়া স্ক্রিনশট আপলোড করুন এবং আপনার প্রোফাইল নাম লিখুন।',
    status: 'active',
    featured: true
  },
  {
    id: 'job_9760',
    jobCode: '9760',
    title: 'ডেইজি (Daisy) ফুল পিকচার আর্ট কমেন্ট',
    category: 'Image Task',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1460036521480-ff49c08c2781?w=300&auto=format&fit=crop&q=80',
    availableSlots: 300,
    completedSlots: 0,
    deadline: '২৪ ঘণ্টার মধ্যে',
    instructions: [
      'নির্দিষ্ট আর্ট পোস্টে প্রবেশ করুন।',
      'পোস্টটিতে লাভ রিয়েক্ট দিন এবং একটি ইউনিক প্রশংসা কমেন্ট লিখুন।',
      'কমেন্টের স্ক্রিনশট আপলোড করুন।'
    ],
    targetUrl: 'https://instagram.com/art_daisy_bd',
    proofRequirement: 'কমেন্টের স্ক্রিনশট ও ইনস্টাগ্রাম হ্যান্ডেল।',
    status: 'active'
  },
  {
    id: 'job_9751',
    jobCode: '9751',
    title: 'Blogger Website এ ২ মিনিট ভিজিট ও পোস্ট রিড',
    category: 'Website Visit',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&auto=format&fit=crop&q=80',
    availableSlots: 600,
    completedSlots: 0,
    deadline: 'আজ বিকাল ৫টা',
    instructions: [
      'ব্লগ ওয়েবসাইট ভিজিট করুন।',
      'যেকোনো ২টি আর্টিকেলে যান এবং মোট ২ মিনিট স্ক্রোল করে পড়ুন।',
      'ওয়েবসাইটের নিচে থাকা শেষ লাইনের কোডটি কপি করে প্রমাণে দিন।'
    ],
    targetUrl: 'https://techblogbd.com/lifestyle-tips',
    proofRequirement: 'আর্টিকেলের শেষ লাইনে থাকা সিক্রেট কোড এবং শেষ পেজের স্ক্রিনশট।',
    status: 'active'
  },
  {
    id: 'job_9746',
    jobCode: '9746',
    title: 'ফেসবুক পেইজ Follow ও শেয়ার',
    category: 'Social Media',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    availableSlots: 400,
    completedSlots: 0,
    deadline: 'আগামীকাল সকাল ১০টা',
    instructions: [
      'প্রোফাইল পেইজে যান এবং ফলো বাটনে চাপ দিন।',
      'পিন করা পোস্টটি আপনার টাইমলাইনে পাবলিক শেয়ার করুন।',
      'শেয়ারের লিংক ও স্ক্রিনশট দিন।'
    ],
    targetUrl: 'https://facebook.com/shakil.creator',
    proofRequirement: 'ফলো ও শেয়ারের স্ক্রিনশট।',
    status: 'active'
  },
  {
    id: 'job_9742',
    jobCode: '9742',
    title: 'ফেসবুক পেজের কাজ - রিভিউ প্রদান',
    category: 'Social Media',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&auto=format&fit=crop&q=80',
    availableSlots: 250,
    completedSlots: 0,
    deadline: 'আজকের মধ্যে',
    instructions: [
      'বিজনেস পেজে যান।',
      '৫ স্টার রিভিউ দিন ও সংক্ষেপে ভালো মতামত লিখুন।',
      'রিভিউ সাবমিট করার পর স্ক্রিনশট দিন।'
    ],
    targetUrl: 'https://facebook.com/green.nest.interior',
    proofRequirement: '৫ স্টার রিভিউ এবং টেক্সটের স্ক্রিনশট।',
    status: 'active'
  },
  {
    id: 'job_9741',
    jobCode: '9741',
    title: 'ইমোজি গণনার কাজ ও কুইজ সমাধান',
    category: 'Typing',
    reward: 0.60,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
    availableSlots: 800,
    completedSlots: 0,
    deadline: 'চলমান',
    instructions: [
      'নিচের লিংকে ক্লিক করে ছবিতে মোট কতটি ফায়ার ইমোজি আছে তা সঠিকভাবে গণনা করুন।',
      'সঠিক সংখ্যাটি নিচের বক্সে লিখুন।'
    ],
    targetUrl: 'https://quiz.kilagbe.com/emoji-fire',
    proofRequirement: 'গণনাকৃত সঠিক সংখ্যা এবং সাবমিশন কোড।',
    status: 'active'
  },
  {
    id: 'job_9734',
    jobCode: '9734',
    title: 'গোলাপ ফুল পিকচারে লাইক ও লাভ রিয়েক্ট',
    category: 'Like',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    availableSlots: 350,
    completedSlots: 0,
    deadline: 'আজ রাত ৯টা',
    instructions: [
      'ছবিতে প্রবেশ করে লাভ রিয়েক্ট দিন।',
      'প্রোফাইল ফলো করুন ও স্ক্রিনশট আপলোড করুন।'
    ],
    targetUrl: 'https://facebook.com/photo.rose.bd',
    proofRequirement: 'লাভ রিয়েক্ট দেয়ার পরিষ্কার ছবি।',
    status: 'active'
  },
  {
    id: 'job_9732',
    jobCode: '9732',
    title: 'সহজ কাজ - ব্যানার বিজ্ঞাপনে ক্লিক',
    category: 'Website Visit',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300&auto=format&fit=crop&q=80',
    availableSlots: 500,
    completedSlots: 0,
    deadline: 'আজকের মধ্যে',
    instructions: [
      'ওয়েবসাইটে যান এবং ক্লিক হেয়ার ব্যানারে ক্লিক করুন।',
      '৩০ সেকেন্ড অপেক্ষা করে ব্যাক করুন।'
    ],
    targetUrl: 'https://kilagbepromo.net',
    proofRequirement: 'ভিজিটের স্ক্রিনশট।',
    status: 'active'
  },
  {
    id: 'job_9729',
    jobCode: '9729',
    title: 'Love গণনার কাজ - টেক্সট ম্যাচিং',
    category: 'Data Entry',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80',
    availableSlots: 400,
    completedSlots: 0,
    deadline: 'আজ সন্ধ্যা',
    instructions: [
      'আর্টিকেল থেকে "Love" শব্দটি কতবার এসেছে তা গুনে ইনপুটে লিখুন।'
    ],
    targetUrl: 'https://lovetextmatch.com',
    proofRequirement: 'সঠিক গণনা সংখ্যা।',
    status: 'active'
  },
  {
    id: 'job_9728',
    jobCode: '9728',
    title: 'টিকটক ফলো এবং ভিডিও লাইক',
    category: 'Social Media',
    reward: 1.00,
    image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=300&auto=format&fit=crop&q=80',
    availableSlots: 200,
    completedSlots: 0,
    deadline: 'দ্রুত শেষ হবে',
    instructions: [
      'টিকটক একাউন্টে যান এবং ফলো বাটনে চাপ দিন।',
      'প্রথম ৩টি ভিডিওতে লাইক দিন ও ১টি শেয়ার করুন।',
      'আপনার টিকটক ইউজারনেম সহ স্ক্রিনশট জমা দিন।'
    ],
    targetUrl: 'https://tiktok.com/@kilagbe_official',
    proofRequirement: 'টিকটক ফলো এবং লাইক করা স্ক্রিনশট।',
    status: 'active',
    featured: true
  },
  {
    id: 'job_9725',
    jobCode: '9725',
    title: 'ফেসবুকে লাইক ও কমেন্ট শেয়ার',
    category: 'Social Media',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=300&auto=format&fit=crop&q=80',
    availableSlots: 450,
    completedSlots: 0,
    deadline: 'আজ রাত ১০টা',
    instructions: ['ফেসবুক পোস্টে লাইক দিন এবং ৩ জন বন্ধুকে ট্যাগ করে কমেন্ট করুন।'],
    targetUrl: 'https://facebook.com/campaign2026',
    proofRequirement: 'কমেন্টের স্ক্রিনশট।',
    status: 'active'
  },
  {
    id: 'job_9722',
    jobCode: '9722',
    title: 'পেজে ফলো এবং পজিটিভ রিভিউ প্রদান',
    category: 'Social Media',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=80',
    availableSlots: 300,
    completedSlots: 0,
    deadline: 'আজকের মধ্যে',
    instructions: ['বিজনেস পেইজে ফলো ও রেকমেন্ডেশন দিন।'],
    targetUrl: 'https://facebook.com/it.solutions.bd',
    proofRequirement: 'রিভিউ এর স্ক্রিনশট।',
    status: 'active'
  },
  {
    id: 'job_9716',
    jobCode: '9716',
    title: 'আকাশের মেঘ গণনার কাজ',
    category: 'Image Task',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300&auto=format&fit=crop&q=80',
    availableSlots: 500,
    completedSlots: 0,
    deadline: 'আজকের মধ্যে',
    instructions: ['ছবিতে মোট কয়টি বড় মেঘ রয়েছে তা পর্যবেক্ষণ করে লিখুন।'],
    targetUrl: 'https://quiz.kilagbe.com/cloud-task',
    proofRequirement: 'মেঘের সংখ্যা ও রেফারেন্স।',
    status: 'active'
  },
  {
    id: 'job_9711',
    jobCode: '9711',
    title: 'ওয়েবসাইট ভিজিট করা ও আর্টিকেল পড়া',
    category: 'Website Visit',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=300&auto=format&fit=crop&q=80',
    availableSlots: 600,
    completedSlots: 0,
    deadline: 'আগামীকাল',
    instructions: ['ওয়েবসাইটে গিয়ে প্রযুক্তির নতুন খবর পড়ুন এবং সাবমিট কোড দিন।'],
    targetUrl: 'https://priyotips.com',
    proofRequirement: 'ওয়েবসাইটের শেষ কোড।',
    status: 'active'
  },
  {
    id: 'job_9702',
    jobCode: '9702',
    title: 'ইউটিউব চ্যানেল সাবস্ক্রাইব ও বেল আইকন ক্লিক',
    category: 'Subscribe',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300&auto=format&fit=crop&q=80',
    availableSlots: 700,
    completedSlots: 0,
    deadline: 'আজ রাত ১২টা',
    instructions: ['ইউটিউব চ্যানেলে যান, সাবস্ক্রাইব করুন ও অল নোটিফিকেশন অন করুন।'],
    targetUrl: 'https://youtube.com/@banglatechhub',
    proofRequirement: 'সাবস্ক্রাইব করা স্ক্রিনশট।',
    status: 'active'
  },
  {
    id: 'job_9701',
    jobCode: '9701',
    title: 'Tiktok ভিডিও শেয়ার ও কমেন্ট',
    category: 'Social Media',
    reward: 0.60,
    image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=300&auto=format&fit=crop&q=80',
    availableSlots: 350,
    completedSlots: 0,
    deadline: 'আজকের মধ্যে',
    instructions: ['টিকটক ভিডিওটি হোয়াটসঅ্যাপে ৫ জন বন্ধুকে শেয়ার করুন।'],
    targetUrl: 'https://tiktok.com/@kilagbe_official/video/1',
    proofRequirement: 'শেয়ার ও কমেন্টের ছবি।',
    status: 'active'
  },
  {
    id: 'job_9697',
    jobCode: '9697',
    title: 'ফায়ার ইমোজি গণনার বিশেষ কাজ',
    category: 'Image Task',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=300&auto=format&fit=crop&q=80',
    availableSlots: 400,
    completedSlots: 0,
    deadline: 'আজ রাত ৮টা',
    instructions: ['ফটো থেকে আগুনের প্রতীক গণনা করে লিখুন।'],
    targetUrl: 'https://quiz.kilagbe.com/fire-task',
    proofRequirement: 'গণনাকৃত সংখ্যা।',
    status: 'active'
  },
  {
    id: 'job_9696',
    jobCode: '9696',
    title: 'পেঁচা গণনার কাজ ও ফটো ম্যাচিং',
    category: 'Image Task',
    reward: 0.50,
    image: 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=300&auto=format&fit=crop&q=80',
    availableSlots: 300,
    completedSlots: 0,
    deadline: 'আজ রাত ১১টা',
    instructions: ['ছবিতে লুকানো পেঁচার সঠিক সংখ্যা চিহ্নিত করুন।'],
    targetUrl: 'https://quiz.kilagbe.com/owl-task',
    proofRequirement: 'সঠিক সংখ্যা এবং আইডি।',
    status: 'active'
  }
];

export const INITIAL_TARGET_BONUSES: TargetBonus[] = [
  {
    id: 'tb_01',
    title: 'দৈনিক বোনাস',
    type: 'daily',
    targetAmount: 50,
    currentAmount: 0,
    rewardAmount: 10,
    isClaimed: false,
    iconName: 'Calendar',
    color: '#06b6d4',
    description: 'প্রতিদিন ৫০ টাকার কাজ বা কেনাকাটা সম্পন্ন করে ১০ টাকা ইনস্ট্যান্ট বোনাস জিতে নিন!'
  },
  {
    id: 'tb_02',
    title: 'সাপ্তাহিক বোনাস',
    type: 'weekly',
    targetAmount: 300,
    currentAmount: 0,
    rewardAmount: 60,
    isClaimed: false,
    iconName: 'CalendarDays',
    color: '#8b5cf6',
    description: 'এক সপ্তাহে ৩০০ টাকার টার্গেট পূরণ করে ৬০ টাকা বিশেষ ক্যাশ রিওয়ার্ড নিন।'
  },
  {
    id: 'tb_03',
    title: 'মাসিক বোনাস',
    type: 'monthly',
    targetAmount: 1200,
    currentAmount: 0,
    rewardAmount: 250,
    isClaimed: false,
    iconName: 'CalendarRange',
    color: '#f59e0b',
    description: 'মাসের টার্গেট ১২০০ টাকা পূরণ করলে ২৫০ টাকা প্রফিট শেয়ার বোনাস।'
  },
  {
    id: 'tb_04',
    title: 'বার্ষিক বোনাস',
    type: 'yearly',
    targetAmount: 15000,
    currentAmount: 0,
    rewardAmount: 3500,
    isClaimed: false,
    iconName: 'Trophy',
    color: '#ef4444',
    description: 'বছরে ১৫,০০০ টাকার রিটেইল ভলিউমে মেগা লয়ালটি গিফট ও ৩৫০০ টাকা ক্যাশ।'
  },
  {
    id: 'tb_05',
    title: 'আজীবন রয়্যালটি',
    type: 'lifetime',
    targetAmount: 50000,
    currentAmount: 0,
    rewardAmount: 10000,
    isClaimed: false,
    iconName: 'Infinity',
    color: '#3b82f6',
    description: 'লাইফটাইম ক্লাবে পদার্পণ করে প্রতি মাসে নির্দিষ্ট প্রফিট শেয়ারিং সুবিধা।'
  },
  {
    id: 'tb_06',
    title: 'ওয়েলকাম অফার',
    type: 'welcome',
    targetAmount: 100,
    currentAmount: 0,
    rewardAmount: 25,
    isClaimed: false,
    iconName: 'Gift',
    color: '#10b981',
    description: 'নতুন রেজিস্ট্রেশন করে প্রথম কাজ শেষ করলেই ২৫ টাকা ফ্রি ওয়েলকাম উপহার!'
  },
  {
    id: 'tb_07',
    title: 'লিডারশিপ বোনাস',
    type: 'leadership',
    targetAmount: 20,
    currentAmount: 0,
    rewardAmount: 500,
    isClaimed: false,
    iconName: 'Award',
    color: '#f97316',
    description: '২০ জন এক্টিভ টিম মেম্বার তৈরি করে ৫০০ টাকা এক্সক্লুসিভ লিডারশিপ ভাতা।'
  },
  {
    id: 'tb_08',
    title: 'র‍্যাঙ্ক আপগ্রেড বোনাস',
    type: 'rank',
    targetAmount: 5,
    currentAmount: 0,
    rewardAmount: 1500,
    isClaimed: false,
    iconName: 'Medal',
    color: '#ec4899',
    description: 'পরবর্তী "গোল্ড স্টার" র‍্যাঙ্কে উন্নীত হয়ে ১৫০০ টাকা পদক সম্মাননা।'
  }
];

export const VENDOR_PROFILES: Record<string, UserProfile> = {
  'vnd_01': {
    id: 'vnd_01',
    name: 'Fashion Hub BD',
    phone: '01711223344',
    email: 'fashionhub.bd@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    role: 'vendor',
    isVerified: true,
    verificationStatus: 'verified',
    referralCode: 'FASHION77',
    activationCode: 'KL-FASHION',
    joinedDate: '2024-01-10',
    bio: 'Fashion Hub BD - প্রিমিয়াম ড্রপ শোল্ডার ও ট্রেন্ডি মেনস ওয়্যার হোলসেলার। সারাদেশে হোম ডেলিভারি ও রিসেলিং সুবিধা।',
    resellerSalesCount: 0,
    ownSalesCount: 0,
    postedProductsCount: 18,
    address: {
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Mirpur',
      area: 'Block-D, Mirpur 10'
    }
  },
  'vnd_02': {
    id: 'vnd_02',
    name: 'Cosmetics Valley',
    phone: '01822334455',
    email: 'cosmeticsvalley@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80',
    role: 'vendor',
    isVerified: true,
    verificationStatus: 'verified',
    referralCode: 'BEAUTY88',
    activationCode: 'KL-BEAUTY',
    joinedDate: '2024-02-01',
    bio: 'Cosmetics Valley - ১০০% অথেনটিক হারবাল ও স্কিনকেয়ার প্রোডাক্ট ইম্পোর্টার। সেরা রিসেলিং প্রফিট মার্জিন।',
    resellerSalesCount: 0,
    ownSalesCount: 0,
    postedProductsCount: 24,
    address: {
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Gulshan',
      area: 'Pink City, Gulshan-2'
    }
  },
  'vnd_03': {
    id: 'vnd_03',
    name: 'Royal Watch BD',
    phone: '01933445566',
    email: 'royalwatch.bd@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&auto=format&fit=crop&q=80',
    role: 'vendor',
    isVerified: true,
    verificationStatus: 'verified',
    referralCode: 'WATCH99',
    activationCode: 'KL-WATCH',
    joinedDate: '2024-01-20',
    bio: 'Royal Watch BD - ওলেভস ও ব্র্যান্ডেড কোয়ার্টজ ঘড়ির অফিশিয়াল হোলসেলার। ১ বছরের ওয়ারেন্টিসহ।',
    resellerSalesCount: 0,
    ownSalesCount: 0,
    postedProductsCount: 15,
    address: {
      division: 'Chattogram',
      district: 'Chattogram',
      upazila: 'GEC Circle',
      area: 'Central Plaza'
    }
  },
  'vnd_04': {
    id: 'vnd_04',
    name: 'Gadget Express',
    phone: '01644556677',
    email: 'gadgetexpress.bd@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80',
    role: 'vendor',
    isVerified: true,
    verificationStatus: 'verified',
    referralCode: 'GADGET22',
    activationCode: 'KL-GADGET',
    joinedDate: '2023-11-15',
    bio: 'Gadget Express - লেটেস্ট স্মার্ট গ্যাজেট, ব্লুটুথ ডিভাইস ও লাইফস্টাইল ইলেকট্রনিক্স সরবরাহকারী।',
    resellerSalesCount: 0,
    ownSalesCount: 0,
    postedProductsCount: 35,
    address: {
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Motijheel',
      area: 'Stadium Market'
    }
  }
};

export const INITIAL_REELS: ReelItem[] = [
  {
    id: 'reel_01',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-shopping-online-on-smartphone-41275-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
    creatorName: 'Fashion Hub BD',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    creatorId: 'vnd_01',
    caption: 'ACID WASH টি-শার্টের আনবক্সিং ও প্রিমিয়াম কোয়ালিটি রিভিউ! অর্ডার করলেই ক্যাশব্যাক 🔥 #KiLagbe #Fashion #Shopping',
    hashtags: ['#KiLagbe', '#Fashion', '#MensWear', '#AcidWash'],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    productId: 'prod_001',
    productName: 'ACID WASH Premium T-Shirt',
    productPrice: 415,
    status: 'approved'
  },
  {
    id: 'reel_02',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartwatch-with-black-strap-41988-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80',
    creatorName: 'Gadget Express',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    creatorId: 'vnd_04',
    caption: 'MK-5 স্মার্ট ওয়াচে পানির নিচে টেস্ট! ওয়াটারপ্রুফ গ্যারান্টি ⌚💧 #SmartWatch #Gadget #TechBD',
    hashtags: ['#SmartWatch', '#Gadget', '#TechBD', '#MK5'],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    productId: 'prod_004',
    productName: 'MK-5 Waterproof Smart Watch',
    productPrice: 1600,
    status: 'approved'
  },
  {
    id: 'reel_03',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-computer-keyboard-41712-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&auto=format&fit=crop&q=80',
    creatorName: 'Good Life অফিশিয়াল',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    creatorId: 'adm_01',
    caption: 'প্রতিদিন মোবাইল দিয়ে সহজ মাইক্রো জব করে ২০০-৫০০ টাকা আয় করার নিয়ম! 📱💸 #MicroJob #OnlineIncome #EasyMoney',
    hashtags: ['#MicroJob', '#OnlineIncome', '#KiLagbeBD', '#EasyMoney'],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    jobId: 'job_9762',
    jobTitle: 'ফেসবুক আইডিতে লাইক ও ফলো',
    jobReward: 0.50,
    status: 'approved'
  },
  {
    id: 'reel_04',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-applying-lotion-on-her-arm-42036-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
    creatorName: 'Cosmetics Valley',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    creatorId: 'vnd_02',
    caption: 'SADOER অর্গানিক স্কিন কেয়ার ক্রিমের আসল টেস্ট! ত্বকের উজ্জ্বলতা ও গ্লো বৃদ্ধিতে ১০০% কার্যকরী ✨ #SkinCare #Beauty #Cosmetics',
    hashtags: ['#SkinCare', '#Beauty', '#Sadoer', '#CosmeticsValley'],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    productId: 'prod_002',
    productName: 'SADOER Organic Skin Care Cream',
    productPrice: 360,
    status: 'approved'
  },
  {
    id: 'reel_05',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-wrist-watch-in-a-luxury-box-41984-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80',
    creatorName: 'Royal Watch BD',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    creatorId: 'vnd_03',
    caption: 'OLEVS লাক্সারি গোল্ডেন কোয়ার্টজ ওয়াচ আনবক্সিং! ফ্রি ২টা ব্যাটারি ও পিন কাটার সহ 👑 #LuxuryWatch #Olevs #RoyalWatch',
    hashtags: ['#LuxuryWatch', '#Olevs', '#GoldWatch', '#RoyalWatchBD'],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    productId: 'prod_003',
    productName: 'OLEVS Luxury Golden Quartz Watch',
    productPrice: 980,
    status: 'approved'
  },
  {
    id: 'reel_06',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartwatch-with-black-strap-41988-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80',
    creatorName: 'Gadget Express',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    creatorId: 'vnd_04',
    caption: 'S12 MAX Ultra ৩ স্ট্র্যাপ সহ ফুল রিভিউ! ওয়্যারলেস চার্জিং ও ব্লুটুথ কলিং ফিচার ⌚⚡ #S12Max #SmartWatch #GadgetExpress',
    hashtags: ['#S12Max', '#SmartWatch', '#GadgetExpress', '#UltraWatch'],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    productId: 'prod_005',
    productName: 'S12 MAX Ultra Smart Watch 3-Strap',
    productPrice: 1250,
    status: 'approved'
  },
  {
    id: 'reel_07',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-drying-hair-with-a-blow-dryer-42777-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    creatorName: 'Gadget Express',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    creatorId: 'vnd_04',
    caption: 'Kemei Professional হেয়ার ড্রায়ার KM-2376 টেস্ট! ৩০০০ ওয়াট শক্তিশালী মোটর ও দ্রুত ড্রাইং 💨 #Kemei #HairDryer #BeautyGadget',
    hashtags: ['#Kemei', '#HairDryer', '#GadgetExpress', '#SalonEquipment'],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    productId: 'prod_006',
    productName: 'Kemei Professional Hair Dryer KM-2376',
    productPrice: 1000,
    status: 'approved'
  },
  {
    id: 'reel_08',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-drying-hair-with-a-blow-dryer-42777-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=500&auto=format&fit=crop&q=80',
    creatorName: 'Gadget Express',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    creatorId: 'vnd_04',
    caption: 'Kemei KM-6831 ফোল্ডেবল হেয়ার ড্রায়ার! সহজে ব্যাগে বহনযোগ্য ও ১৬০০ ওয়াট পাওয়ার 🎒 #KemeiFoldable #TravelGadget #GadgetExpress',
    hashtags: ['#Kemei', '#FoldableDryer', '#TravelEssential', '#GadgetExpress'],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    productId: 'prod_007',
    productName: 'Kemei KM-6831 1600W Foldable Hair Dryer',
    productPrice: 800,
    status: 'approved'
  },
  {
    id: 'reel_09',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-small-desk-fan-turning-on-43112-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=500&auto=format&fit=crop&q=80',
    creatorName: 'Gadget Express',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    creatorId: 'vnd_04',
    caption: 'সুপার হাই-স্পিড USB রিচার্জেবল ডেস্ক ফ্যান! লোডশেডিংয়ের সেরা সমাধান ⚡💨 #DeskFan #USBfan #SummerGadget #GadgetExpress',
    hashtags: ['#DeskFan', '#RechargeableFan', '#USBFan', '#GadgetExpress'],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    productId: 'prod_008',
    productName: 'Super High-Speed USB Rechargeable Desk Fan',
    productPrice: 650,
    status: 'approved'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [];

export const INITIAL_NETWORK_USERS: NetworkUser[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_BANNERS: import('../types').AppBanner[] = [
  {
    id: 'ban_01',
    title: 'প্রতিদিন সহজ মাইক্রো জব করে আয় করুন',
    subtitle: 'ইউটিউব, ফেসবুক ও অ্যাপ রিভিউ দিয়ে ইনস্ট্যান্ট পেমেন্ট',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    actionTab: 'jobs',
    badge: 'হট জবস',
    isActive: true,
    position: 'all'
  },
  {
    id: 'ban_02',
    title: 'হোলসেল প্রাইসে রিসেলিং করুন ও লাভ রাখুন',
    subtitle: 'বিনা পুঁজিতে লাখ টাকার ই-কমার্স ব্যবসার সুযোগ',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80',
    actionTab: 'shop',
    badge: 'রিসেলিং মেগা অফার',
    isActive: true,
    position: 'all'
  },
  {
    id: 'ban_03',
    title: 'বন্ধুদের রেফার করে প্রতি রেফারে ২৫ টাকা বোনাস',
    subtitle: 'আপনার রেফার কোড শেয়ার করে আজীবন কমিশন আয় করুন',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557b683?w=800&auto=format&fit=crop&q=80',
    actionTab: 'profile',
    badge: 'রেফারেল বোনাস',
    isActive: true,
    position: 'home'
  },
  {
    id: 'ban_shop_01',
    title: 'সারা দেশে ক্যাশ অন ডেলিভারিতে দ্রুত পণ্য ডেলিভারি',
    subtitle: 'কাস্টমার ঘরে বসে পার্সেল রিসিভ করে মূল্য পরিশোধ করবে',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    actionTab: 'shop',
    badge: 'ক্যাশ অন ডেলিভারি',
    isActive: true,
    position: 'shop'
  },
  {
    id: 'ban_shop_02',
    title: 'টপ ট্রেন্ডিং গ্যাজেট ও লাইফস্টাইল রিসেলিং অফার',
    subtitle: 'স্মার্টওয়াচ, ট্রিমার ও হেডফোনে প্রতিটি অর্ডারে ২০০-৫০০ টাকা লাভ',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    actionTab: 'shop',
    badge: 'হট মার্জিন পণ্য',
    isActive: true,
    position: 'shop'
  },
  {
    id: 'ban_job_01',
    title: 'মাত্র ২ মিনিটে আপনার নিজের কাজ পোস্ট করুন',
    subtitle: 'পেজ লাইক, সাবস্ক্রাইব ও ট্রাফিক বাড়িয়ে নিন হাজার হাজার ইউজারের মাধ্যমে',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    actionTab: 'jobs',
    badge: 'কাজ পোস্ট করুন',
    isActive: true,
    position: 'jobs'
  },
  {
    id: 'ban_job_02',
    title: '১০০% নিশ্চিত ও দ্রুত বিকাশ-নগদ উইথড্রয়াল',
    subtitle: 'কাজ শেষ করে প্রুফ সাবমিট করুন এবং নিমেষেই টাকা ক্যাশআউট করুন',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    actionTab: 'jobs',
    badge: 'ইনস্ট্যান্ট ক্যাশআউট',
    isActive: true,
    position: 'jobs'
  }
];

export const INITIAL_SYSTEM_SETTINGS: import('../types').SystemSettings = {
  rewardCenterOptions: DEFAULT_REWARD_CENTER_OPTIONS,
  minWithdrawalAmount: 50,
  referralBonus: 25,
  signupBonus: 10,
  dailyTaskTarget: 10,
  noticeText: 'স্বাগতম Good Life প্ল্যাটফর্মে! নিয়মিত মাইক্রো জব, রিসেলিং ও টাস্ক সম্পন্ন করে প্রতিদিন ক্যাশব্যাক ও রিওয়ার্ড অর্জন করুন।',
  isNoticeActive: false,
  isMaintenanceMode: false,
  supportPhone: '+8801877722819',
  supportWhatsApp: '+8801877722819',
  supportTelegramBot: 'https://t.me/goodlifeadmin_bot',
  officialTelegramChannel: 'https://t.me/goodlifeofficialbd',
  adminTelegram: 'https://t.me/goodlifeadmin',
  verificationFee: 100,
  verificationPaymentNumbers: {
    bkash: '01877722819',
    nagad: '01877722819',
    upay: '01877722819'
  },
  verificationInstructions: '১. উপরে প্রদত্ত বিকাশ অথবা নগদ পার্সোনাল নম্বরে ভেরিফিকেশন ফি (Send Money) করুন।\n২. টাকা পাঠানোর পর আপনি যে নম্বর থেকে টাকা পাঠিয়েছেন সেই নম্বর এবং ট্রানজেকশন আইডি (TrxID) নিচে প্রদান করুন।\n৩. তথ্য সাবমিট করার পর এডমিন টিম যাচাই করে আপনার একাউন্ট ১-৩ ঘণ্টার মধ্যে ১০০% ভেরিফাইড করে দেবে।',
  depositPaymentNumbers: {
    bkash: '01877722819',
    nagad: '01877722819',
    rocket: '01877722819',
    upay: '01877722819'
  },
  minDepositAmount: 10,
  maxDepositAmount: 25000,
  depositInstructions: '১. অফিশিয়াল বিকাশ/নগদ/রকেট পার্সোনাল নম্বরে Send Money করুন।\n২. আপনি যে নম্বর থেকে টাকা পাঠিয়েছেন সেই নম্বর এবং ট্রানজেকশন আইডি (TrxID) সঠিক ঘরে লিখে সাবমিট করুন।\n৩. এডমিন কর্তৃক TrxID যাচাইয়ের পর ব্যালেন্স ৫-১৫ মিনিটে অটোমেটিক যুক্ত হবে।',
  depositPolicyRules: '• সর্বনিম্ন ডিপোজিট ৳১০ এবং সর্বোচ্চ এককালীন ৳২৫,০০০।\n• ভুল TrxID বা ফেক তথ্য দিলে একাউন্ট সাময়িকভাবে স্থগিত হতে পারে।\n• কোনো সমস্যায় হেল্পলাইন অথবা এডমিন হোয়াটসঅ্যাপে সরাসরি যোগাযোগ করুন।',
  maxDailyWithdrawalAmount: 10000,
  withdrawalFeePercent: 0,
  withdrawalProcessingTime: '৩০ মিনিট থেকে ২ ঘণ্টা',
  withdrawalInstructions: '১. আপনার সঠিক ও সচল বিকাশ অথবা নগদ পার্সোনাল নম্বর দিন।\n২. সর্বনিম্ন উত্তোলন ৫০ টাকা। পর্যাপ্ত ব্যালেন্স থাকতে হবে।\n৩. উইথড্র রিকোয়েস্ট সফলভাবে জমা হওয়ার পর এডমিন টিম যাচাই করে পেমেন্ট পাঠিয়ে দেবে।',
  withdrawalPolicyRules: '• প্রতিদিন সর্বোচ্চ ১০,০০০ টাকা উত্তোলন করা যাবে।\n• পেমেন্ট সাধারণত ৩০ মিনিট থেকে ২ ঘণ্টার মধ্যে সম্পূর্ণ হয় (সর্বোচ্চ ২৪ ঘণ্টা)।\n• এজেন্ট নম্বর বা ভুল নম্বরে পেমেন্ট ফেল হলে কোম্পানি দায়ী থাকবে না।',
  featureToggles: {
    ads_view: true,
    quiz_job: true,
    typing_job: true,
    ad_marketing: true,
    micro_job: true,
    job_post: true,
    skill_course: true,
    freelancing: true,
    special_income: true,
    recharge: true,
    reselling: true,
    target_bonus: true,
    leaderboard: true,
    agency: true,
    kyc_required: true,
    community_groups: true,
    reels: true,
    offer_products: true
  },
  featureRewards: {
    ads_view: 0.50,
    quiz_job: 1.00,
    typing_job: 1.50,
    ad_marketing: 2.00,
    daily_bonus: 5.00
  },
  specialSocialConfig: {
    isEnabled: true,
    depositRequired: true,
    depositAmount: 150,
    notificationTitle: 'বিশেষ সোশ্যাল ইনকামের জন্য ডিপোজিট নির্দেশিকা',
    description: 'বিশেষ সোশ্যাল ইনকাম ফিচারে আনলিমিটেড উচ্চ-আয়ের জিমেইল ক্রিয়েশন, ইনস্টাগ্রাম প্রমোশন, হোয়াটসঅ্যাপ ও টেলিগ্রাম প্রিমিয়াম মাইক্রো টাস্ক রয়েছে। এই প্রিমিয়াম টাস্কগুলোতে প্রবেশের জন্য এবং জেনুইন ওয়ার্কার নিশ্চিত করতে এককালীন সিকিউরিটি ডিপোজিট আবশ্যক। ডিপোজিট সফলভাবে সম্পন্ন হলে আপনার একাউন্টে এই ফিচারটি আজীবনের জন্য আনলক হয়ে যাবে।',
    paymentMethod: 'bKash / Nagad',
    paymentNumber: '01877722819',
    terms: '১. নির্ধারিত বিকাশ অথবা নগদ নম্বরে সেন্ড মানি (Send Money) সম্পন্ন করুন।\n২. টাকা পাঠানোর পর যে নম্বর থেকে পাঠিয়েছেন সেই নম্বর ও TrxID লিখে সাবমিট করুন।\n৩. এডমিন প্যানেলে যাচাইকরণের পর শুধুমাত্র আপনার একাউন্টের জন্য এই ফিচারটি চালু হয়ে যাবে।\n৪. কোনো ভুল বা অসত্য তথ্য দিলে রিকোয়েস্ট বাতিল হতে পারে।'
  },
  autoAdsConfig: {
    totalAdsPerSession: 3,
    durationPerAd: 10,
    rewardPerSession: 1.50,
    cooldownMinutes: 30,
    ads: [
      {
        id: 'ad_auto_01',
        title: 'রয়েল শপ সুপার ডিল ও প্রিমিয়াম মেম্বারশিপ',
        sponsorName: 'Good Life Royal Shop',
        mediaType: 'banner',
        mediaUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
        targetUrl: 'https://goodlife.com.bd',
        description: 'অনলাইনে সহজে কেনাকাটা ও পাইকারি দামে প্রোডাক্ট কিনুন এবং আনলিমিটেড ক্যাশব্যাক উপভোগ করুন।'
      },
      {
        id: 'ad_auto_02',
        title: 'মাইক্রো জবস করে প্রতিদিন ঘরে বসে আয়',
        sponsorName: 'Freelance & Job Hub',
        mediaType: 'banner',
        mediaUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80',
        targetUrl: 'https://goodlife.com.bd',
        description: 'সহজ টাস্ক, ফেসবুক ও টেলিগ্রামের কাজ সম্পন্ন করে ইনস্ট্যান্ট বিকাশ/নগদে পেমেন্ট নিন।'
      },
      {
        id: 'ad_auto_03',
        title: 'অফিশিয়াল টেলিগ্রাম কমিউনিটিতে যোগ দিন',
        sponsorName: 'Official Telegram Channel',
        mediaType: 'banner',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        targetUrl: 'https://t.me/goodlifeofficialbd',
        description: 'দৈনিক পেমেন্ট প্রুফ ও নতুন কাজের নোটিফিকেশন পেতে আমাদের গ্রুপে যুক্ত থাকুন।'
      },
      {
        id: 'ad_auto_04',
        title: 'স্পেশাল টেলিকম ড্রাইভ ও ইন্টারনেট অফার',
        sponsorName: 'Telecom Drive Partner',
        mediaType: 'banner',
        mediaUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
        targetUrl: 'https://goodlife.com.bd',
        description: 'সব সিমের দারুণ সব ক্যাশব্যাক সহ আকর্ষণীয় এমবি এবং মিনিট প্যাক কিনুন সাশ্রয়ী মূল্যে।'
      }
    ],
    realPlayerConfig: {
      enabled: true,
      contentType: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      adUrl: 'https://goodlife.com.bd',
      title: 'স্পন্সরড ভিডিও বিজ্ঞাপন ও প্রমোশনাল অফার',
      sponsorName: 'Good Life Partner',
      durationSeconds: 10
    }
  },
  pageBannerAds: {
    enabled: true,
    adKey: 'b87ae65b2057f8d1935a8a65f245a61e',
    scriptUrl: 'https://www.highrevenueformat.com/b87ae65b2057f8d1935a8a65f245a61e/invoke.js',
    width: 728,
    height: 90,
    showTopBanner: true,
    showBottomBanner: true,
    pages: {
      ads_view: true,
      quiz_job: true,
      typing_job: true,
      ad_marketing: true
    }
  }
};

