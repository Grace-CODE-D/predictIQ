/**
 * Minimal i18n utility with graceful locale fallback.
 *
 * Resolution order:
 *   1. Requested locale
 *   2. Language-only tag (e.g. "pt" from "pt-BR")
 *   3. "en" (hard fallback)
 *
 * Missing keys:
 *   - Development: console.warn + return key
 *   - Production:  return key silently
 */

export type Locale = string;
export type TranslationMap = Record<string, string>;
export type Translations = Record<Locale, TranslationMap>;

const FALLBACK_LOCALE = 'en';

// ---------------------------------------------------------------------------
// Built-in translations (extend as needed)
// ---------------------------------------------------------------------------
const translations: Translations = {
  en: {
    'nav.features': 'Features',
    'nav.how_it_works': 'How It Works',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'hero.title': 'Decentralized Prediction Markets',
    'hero.cta': 'Get Early Access',
    'newsletter.placeholder': 'Enter your email',
    'newsletter.success': 'Successfully subscribed to updates!',
    'form.email_required': 'Email is required',
    'form.email_invalid': 'Please enter a valid email address',
  },
};

// ---------------------------------------------------------------------------
// Supported locale resolution
// ---------------------------------------------------------------------------

/** Returns the best available locale key for the given tag. */
export function resolveLocale(requested: string): Locale {
  if (translations[requested]) return requested;

  // Try language-only subtag (e.g. "pt" from "pt-BR")
  const lang = requested.split('-')[0];
  if (lang !== requested && translations[lang]) return lang;

  return FALLBACK_LOCALE;
}

/** Detects the browser's preferred locale and resolves it. */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return FALLBACK_LOCALE;
  const preferred = navigator.language || FALLBACK_LOCALE;
  return resolveLocale(preferred);
}

// ---------------------------------------------------------------------------
// Translation lookup
// ---------------------------------------------------------------------------

/**
 * Returns the translation for `key` in `locale`.
 * Falls back to `en` for missing keys and warns in development.
 */
export function t(key: string, locale: Locale = detectLocale()): string {
  const resolved = resolveLocale(locale);
  const map = translations[resolved] ?? translations[FALLBACK_LOCALE];

  if (key in map) return map[key];

  // Try the hard fallback map if we weren't already using it
  if (resolved !== FALLBACK_LOCALE && key in translations[FALLBACK_LOCALE]) {
    return translations[FALLBACK_LOCALE][key];
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[i18n] Missing translation key "${key}" for locale "${locale}"`);
  }

  return key;
}

// ---------------------------------------------------------------------------
// Registration helper (for lazy-loaded locale bundles)
// ---------------------------------------------------------------------------

/** Registers additional translations. Merges into existing locale maps. */
export function registerTranslations(locale: Locale, map: TranslationMap): void {
  translations[locale] = { ...(translations[locale] ?? {}), ...map };
}

export { translations };
