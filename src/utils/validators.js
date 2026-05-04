// ═══════════════════════════════════════════
//  SYNCARE — validators.js
//  Form validation rules matching backend constraints
// ═══════════════════════════════════════════

/** Checks that a value is not empty/null/undefined */
export const required = (value) =>
  value !== undefined && value !== null && String(value).trim() !== ''
    ? null
    : 'This field is required.';

/** age: integer 0–200 */
export const validateAge = (value) => {
  if (required(value)) return 'Age is required.';
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 200)
    return 'Age must be a whole number between 0 and 200.';
  return null;
};

/** gender: "M" or "F" (case-insensitive) */
export const validateGender = (value) => {
  if (required(value)) return 'Gender is required.';
  if (!['M', 'F', 'm', 'f'].includes(value))
    return 'Gender must be M or F.';
  return null;
};

/** gov_id: exactly 14 chars, starts with 2 or 3 */
export const validateGovId = (value) => {
  if (required(value)) return 'National ID is required.';
  const s = String(value).trim();
  if (s.length !== 14) return 'National ID must be exactly 14 characters.';
  if (!['2', '3'].includes(s[0]))
    return 'National ID must start with 2 or 3.';
  if (!/^\d{14}$/.test(s)) return 'National ID must contain digits only.';
  return null;
};

/** password: min 10 characters, no arabic */
export const validatePassword = (value) => {
  if (required(value)) return 'Password is required.';
  const str = String(value);
  if (/[\u0600-\u06FF\u0750-\u077F]/.test(str))
    return 'Password cannot contain Arabic characters.';
  if (str.length < 10)
    return 'Password must be at least 10 characters.';
  return null;
};

/** phone number: basic non-empty string */
export const validatePhone = (value) => {
  if (required(value)) return 'Phone number is required.';
  if (!/^\d{10,15}$/.test(String(value).trim()))
    return 'Enter a valid phone number (10–15 digits).';
  return null;
};

/** name: non-empty string */
export const validateName = (value) => {
  if (required(value)) return 'Name is required.';
  if (String(value).trim().length < 2)
    return 'Name must be at least 2 characters.';
  return null;
};

/** date: YYYY-MM-DD format (from input type="date"), must be in the future */
export const validateDate = (value) => {
  if (required(value)) return 'Date is required.';
  const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = String(value).trim().match(regex);
  if (!match) return 'Invalid date.';
  const [, yyyy, mm, dd] = match;
  const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  if (isNaN(date.getTime())) return 'Invalid date.';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date <= today) return 'Appointment date must be in the future.';
  return null;
};

/** time: HH:MM (24-hour) */
export const validateTime = (value) => {
  if (required(value)) return 'Time is required.';
  const str = String(value).trim();
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(str))
    return 'Time must be in HH:MM (24-hour) format.';
  if (!/^([01]\d|2[0-3]):(00|15|30|45)$/.test(str))
    return 'Minutes must be 00, 15, 30, or 45.';
  
  const [hh, mm] = str.split(':').map(Number);
  if (hh < 8 || hh > 12 || (hh === 12 && mm > 0)) {
    return 'Appointments are only available between 08:00 AM and 12:00 PM.';
  }
  return null;
};

/** clinic type: must be one of the valid options */
export const validateClinicType = (value, CLINIC_TYPES) => {
  if (required(value)) return 'Please select a clinic type.';
  if (!CLINIC_TYPES.includes(value))
    return 'Please select a valid clinic type.';
  return null;
};

/**
 * Run a map of { fieldName: validatorFn } against a values object.
 * Returns { fieldName: errorString | null }
 */
export const runValidation = (schema, values) => {
  const errors = {};
  let isValid = true;
  for (const [field, validate] of Object.entries(schema)) {
    const err = validate(values[field]);
    errors[field] = err;
    if (err) isValid = false;
  }
  return { errors, isValid };
};
