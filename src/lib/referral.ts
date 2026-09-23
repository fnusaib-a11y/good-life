/**
 * Generates a strictly 4-digit unique numeric referral code
 * e.g., '4892', '7103', '5284', '9162'
 */
export const generateShortReferralCode = (length: number = 4): string => {
  // Strictly 4 digits (1000 to 9999)
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Normalizes and guarantees any referral code is strictly 4 digits.
 * Converts any legacy 8-character, alphanumeric, or irregular codes into a clean 4-digit numeric code.
 */
export const formatStrict4DigitReferral = (code?: string): string => {
  if (!code) return '7788';
  const clean = code.toString().trim();
  const digits = clean.replace(/\D/g, '');
  if (digits.length >= 4) {
    return digits.slice(0, 4);
  }
  if (digits.length > 0) {
    return digits.padEnd(4, '0').slice(0, 4);
  }
  // If pure alphabetic without digits, hash into 4 digits
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) % 9000;
  }
  return (1000 + Math.abs(hash)).toString();
};

