/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DevTech Contact Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * FILE:      src/lib/contactConfig.ts
 * PURPOSE:   Single source of truth for all public contact details.
 *            Update values here to reflect changes site-wide.
 *
 * VARIABLES:
 *   CONTACT.email      — Support email address
 *   CONTACT.phone1     — Primary phone number (digits only, no spaces/dashes)
 *   CONTACT.phone2     — Secondary phone number (digits only, no spaces/dashes)
 *   CONTACT.phone1Display — Primary phone formatted for display
 *   CONTACT.phone2Display — Secondary phone formatted for display
 *   CONTACT.location   — Office location label
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CONTACT = {
  /** Support email — used in mailto: links */
  email: 'support@devtechh.com',

  /** Primary phone — raw digits for tel: href */
  phone1: '01063771764',
  /** Primary phone — human-readable display string */
  phone1Display: '010 6377 1764',

  /** Secondary phone — raw digits for tel: href */
  phone2: '01277445066',
  /** Secondary phone — human-readable display string */
  phone2Display: '012 7744 5066',

  /** Office location label */
  location: 'Cairo, Egypt',
} as const;
