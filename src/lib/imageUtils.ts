/**
 * Image processing utilities for Kilagbe app
 */

/**
 * Compresses an image file client-side using an HTML canvas.
 * Returns a data URL (Base64 string) that is compact and safe for state/localStorage.
 */
export const compressImage = (
  file: File,
  maxWidth = 720,
  maxHeight = 720,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Common preset thumbnails for popular microjob categories
 */
export const JOB_PRESET_THUMBNAILS = [
  {
    name: 'ইউটিউব (YouTube)',
    category: 'ইউটিউব ওয়াচ',
    url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'ফেসবুক (Facebook)',
    category: 'সোশ্যাল মিডিয়া',
    url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'টিকটক (TikTok)',
    category: 'সোশ্যাল মিডিয়া',
    url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'টেলিগ্রাম (Telegram)',
    category: 'টেলিগ্রাম জয়েন',
    url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'অ্যাপ ইনস্টল (App Download)',
    category: 'অ্যাপ ইনস্টল',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'ওয়েবসাইট ভিজিট (Website)',
    category: 'ওয়েবসাইট ভিজিট',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'কুইজ / টাইপিং (Typing/Quiz)',
    category: 'কুইজ/টাইপিং',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80'
  }
];
