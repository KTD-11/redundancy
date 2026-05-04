// ═══════════════════════════════════════════
//  SYNCARE — constants.js
//  Central config: base URL, clinic types, etc.
// ═══════════════════════════════════════════

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://trickle-vanity-catlike.ngrok-free.dev';

export const TOKEN_KEY = 'syncare_token';
export const USER_KEY  = 'syncare_user';
export const TOKEN_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours in ms
export const TOKEN_TS_KEY = 'syncare_token_ts';

export const CLINIC_TYPES = [
  'Adult General Medicine',
  'General Surgery',
  "Women's Health",
  "Children's Health",
  'Heart Clinic',
  'Eye Clinic',
  'Bones and Joints',
  'Brain and Nerves',
  'Skin Clinic',
  'Cancer Care',
  'Ear, Nose, and Throat',
];

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];
