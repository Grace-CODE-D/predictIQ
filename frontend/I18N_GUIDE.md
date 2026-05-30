# i18n Guide

## Overview

`src/lib/i18n.ts` provides a lightweight, dependency-free i18n utility for the PredictIQ frontend.

## Locale Resolution

When a locale is requested the library resolves it in this order:

1. **Exact match** — `pt-BR` → uses `pt-BR` bundle if registered.
2. **Language subtag** — `pt-BR` → falls back to `pt` bundle.
3. **Hard fallback** — always falls back to `en`.

No errors are thrown for unsupported locales; the caller always receives a string.

## Usage

```ts
import { t, detectLocale, resolveLocale } from '@/lib/i18n';

// Auto-detect from navigator.language
const label = t('nav.features');

// Explicit locale
const label = t('nav.features', 'fr');

// Resolve what locale would actually be used
const locale = resolveLocale('zh-TW'); // → 'zh' or 'en'
```

## Adding a New Locale

```ts
import { registerTranslations } from '@/lib/i18n';

registerTranslations('fr', {
  'nav.features': 'Fonctionnalités',
  'hero.title': 'Marchés de prédiction décentralisés',
});
```

Call `registerTranslations` before any `t()` calls for that locale (e.g. in a layout component or route loader).

## Missing Keys

| Environment | Behaviour |
|-------------|-----------|
| `development` | `console.warn` + returns the key string |
| `production` | returns the key string silently |

This means the UI never crashes or renders `undefined` — worst case it shows the raw key, which is a visible signal during development.

## Adding Translation Keys

All keys live in the `translations` object in `i18n.ts`. Use dot-notation namespacing:

```
nav.*        Navigation labels
hero.*       Hero section copy
newsletter.* Newsletter form copy
form.*       Generic form validation messages
```

## Testing

Unit tests live in `src/lib/__tests__/i18n.test.ts` and cover:

- Exact locale match
- Language-subtag fallback (`pt-BR` → `pt`)
- Unknown locale fallback to `en`
- Missing key warning in development
- Missing key silent in production
- `registerTranslations` merging
