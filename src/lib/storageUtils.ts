/**
 * Safe localStorage wrapper and quota management system.
 * Prevents QuotaExceededError crashes and JSON parsing exceptions across the application.
 */

// Fallback compact placeholder image for bloated Base64 strings
const COMPACT_PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230284c7'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M4 20c0-4 4-6 8-6s8 2 8 6'/%3E%3C/svg%3E";
const COMPACT_PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&auto=format&fit=crop&q=80";

/**
 * Sanitizes a single object or value if it contains heavy Base64 strings or oversized structures
 */
export function sanitizeStorageValue(key: string, rawValue: string, emergency = false): string {
  if (!rawValue || rawValue.length < 5000) {
    return rawValue;
  }

  try {
    const parsed = JSON.parse(rawValue);

    // 1. lg_user or individual user profile
    if (key === 'lg_user' || key.startsWith('lg_user_')) {
      if (parsed && typeof parsed === 'object') {
        const u = { ...parsed };
        if (typeof u.avatar === 'string' && u.avatar.startsWith('data:image/') && u.avatar.length > 20000) {
          u.avatar = COMPACT_PLACEHOLDER_AVATAR;
        }
        if (typeof u.coverPhoto === 'string' && u.coverPhoto.startsWith('data:image/') && u.coverPhoto.length > 20000) {
          u.coverPhoto = COMPACT_PLACEHOLDER_IMAGE;
        }
        return JSON.stringify(u);
      }
    }

    // 2. lg_registered_users list
    if (key === 'lg_registered_users' && Array.isArray(parsed)) {
      const maxUsers = emergency ? 10 : 25;
      const cleaned = parsed.slice(0, maxUsers).map((item: any) => {
        if (!item) return item;
        const entry = { ...item };
        const userObj = entry.user || entry;
        if (userObj && typeof userObj === 'object') {
          const uCopy = { ...userObj };
          if (typeof uCopy.avatar === 'string' && uCopy.avatar.startsWith('data:image/') && uCopy.avatar.length > 15000) {
            uCopy.avatar = COMPACT_PLACEHOLDER_AVATAR;
          }
          if (entry.user) {
            entry.user = uCopy;
          } else {
            return uCopy;
          }
        }
        return entry;
      });
      return JSON.stringify(cleaned);
    }

    // 3. Arrays of submissions, verification requests, orders, logs
    if (Array.isArray(parsed)) {
      const maxItems = emergency ? 8 : 18;
      const sliced = parsed.slice(0, maxItems).map((item: any) => {
        if (!item || typeof item !== 'object') return item;
        const c = { ...item };
        if (typeof c.proofImage === 'string' && c.proofImage.startsWith('data:image/') && c.proofImage.length > 15000) {
          c.proofImage = COMPACT_PLACEHOLDER_IMAGE;
        }
        if (typeof c.frontImage === 'string' && c.frontImage.startsWith('data:image/') && c.frontImage.length > 15000) {
          c.frontImage = COMPACT_PLACEHOLDER_IMAGE;
        }
        if (typeof c.backImage === 'string' && c.backImage.startsWith('data:image/') && c.backImage.length > 15000) {
          c.backImage = COMPACT_PLACEHOLDER_IMAGE;
        }
        if (typeof c.image === 'string' && c.image.startsWith('data:image/') && c.image.length > 20000) {
          c.image = COMPACT_PLACEHOLDER_IMAGE;
        }
        if (typeof c.cvFile === 'string' && c.cvFile.length > 20000) {
          c.cvFile = '';
        }
        return c;
      });
      return JSON.stringify(sliced);
    }

    return rawValue;
  } catch {
    return rawValue;
  }
}

/**
 * Clean up bloated duplicate keys and heavy Base64 entries from localStorage
 */
export function cleanUpBloatedStorage(): void {
  try {
    const keysToRemove: string[] = [];
    const keysToSanitize: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Duplicate per-user caches that are already stored in primary keys & Cloud Firestore
      if (
        key.startsWith('lg_job_submissions_usr_') || 
        key.startsWith('lg_job_submissions_guest') ||
        key.startsWith('lg_transactions_usr_') ||
        key.startsWith('lg_wallet_usr_') ||
        key.startsWith('lg_user_usr_')
      ) {
        keysToRemove.push(key);
      } else if (
        key.startsWith('lg_job_submissions') || 
        key.startsWith('lg_transactions') || 
        key.startsWith('lg_orders') || 
        key.startsWith('lg_notifications') ||
        key.startsWith('lg_verification_requests') ||
        key.startsWith('lg_service_applications') ||
        key.startsWith('lg_registered_users') ||
        key === 'lg_user'
      ) {
        keysToSanitize.push(key);
      }
    }

    // 1. Remove duplicate redundant user keys
    for (const k of keysToRemove) {
      try {
        localStorage.removeItem(k);
      } catch {}
    }

    // 2. Sanitize oversized JSON collections and strip base64 bloat
    for (const k of keysToSanitize) {
      try {
        const val = localStorage.getItem(k);
        if (val && (val.length > 30000 || val.includes('data:image/'))) {
          const sanitized = sanitizeStorageValue(k, val, false);
          if (sanitized !== val) {
            localStorage.setItem(k, sanitized);
          }
        }
      } catch {}
    }
  } catch (err) {
    console.warn('[storageUtils] Cleanup warning:', err);
  }
}

/**
 * Emergency eviction of non-essential transient caches if storage is 100% full
 */
export function emergencyEvictNonEssentialKeys(): void {
  try {
    const nonEssential = [
      'lg_audit_logs',
      'lg_reels',
      'lg_notifications',
      'lg_group_links',
      'lg_leaderboard',
      'lg_network_users'
    ];
    for (const k of nonEssential) {
      try {
        localStorage.removeItem(k);
      } catch {}
    }
  } catch {}
}

/**
 * Safe localStorage.setItem with auto-recovery and compaction
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`[storageUtils] localStorage.setItem failed for key "${key}", running emergency compaction...`);
    try {
      cleanUpBloatedStorage();
      const sanitized = sanitizeStorageValue(key, value, false);
      localStorage.setItem(key, sanitized);
      return true;
    } catch (secondError) {
      try {
        emergencyEvictNonEssentialKeys();
        const emergencySanitized = sanitizeStorageValue(key, value, true);
        localStorage.setItem(key, emergencySanitized);
        return true;
      } catch (finalError) {
        console.warn(`[storageUtils] LocalStorage quota reached for "${key}". Value kept safely in React memory.`);
        return false;
      }
    }
  }
}

export function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`[storageUtils] JSON parse failed for key "${key}", using fallback:`, error);
    return fallback;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storageUtils] removeItem failed for key "${key}":`, error);
  }
}

// Global runtime safeguard: patch Storage.prototype.setItem so NO uncaught QuotaExceededError
// can ever crash the application, even if called directly anywhere in the app or packages.
if (typeof window !== 'undefined' && window.Storage && !((window.Storage.prototype as any).__safeQuotaPatched)) {
  try {
    const originalSetItem = window.Storage.prototype.setItem;
    (window.Storage.prototype as any).__safeQuotaPatched = true;

    window.Storage.prototype.setItem = function (key: string, value: string) {
      try {
        originalSetItem.call(this, key, value);
      } catch (err: any) {
        const isQuota = 
          err?.name === 'QuotaExceededError' || 
          err?.code === 22 || 
          err?.number === -2147024882 ||
          (err?.message && String(err.message).toLowerCase().includes('quota'));

        if (isQuota) {
          console.warn(`[storageUtils:patch] Quota exceeded on Storage.setItem("${key}"). Recovering...`);
          try {
            cleanUpBloatedStorage();
            const sanitized = sanitizeStorageValue(key, value, false);
            originalSetItem.call(this, key, sanitized);
          } catch {
            try {
              emergencyEvictNonEssentialKeys();
              const emergencySanitized = sanitizeStorageValue(key, value, true);
              originalSetItem.call(this, key, emergencySanitized);
            } catch {
              console.warn(`[storageUtils:patch] Quota completely exhausted for "${key}". Suppressing unhandled crash.`);
            }
          }
        } else {
          throw err;
        }
      }
    };
  } catch (patchErr) {
    console.warn('[storageUtils] Storage prototype patch warning:', patchErr);
  }
}

// Run initial cleanup on module load
try {
  cleanUpBloatedStorage();
} catch {}
