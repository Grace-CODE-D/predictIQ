import { resolveLocale, t, registerTranslations, translations } from '../i18n';

// ---------------------------------------------------------------------------
// resolveLocale
// ---------------------------------------------------------------------------
describe('resolveLocale', () => {
  it('returns the locale when it is supported', () => {
    expect(resolveLocale('en')).toBe('en');
  });

  it('falls back to language subtag when full tag is unsupported', () => {
    registerTranslations('pt', { 'nav.features': 'Recursos' });
    expect(resolveLocale('pt-BR')).toBe('pt');
  });

  it('falls back to "en" for a completely unknown locale', () => {
    expect(resolveLocale('xx-YY')).toBe('en');
  });

  it('falls back to "en" for an empty string', () => {
    expect(resolveLocale('')).toBe('en');
  });
});

// ---------------------------------------------------------------------------
// t() — happy path
// ---------------------------------------------------------------------------
describe('t() — known keys', () => {
  it('returns the translation for a known key in "en"', () => {
    expect(t('nav.features', 'en')).toBe('Features');
  });

  it('resolves an unsupported locale to "en" and returns the translation', () => {
    expect(t('nav.features', 'zz')).toBe('Features');
  });

  it('uses a registered locale when available', () => {
    registerTranslations('de', { 'nav.features': 'Funktionen' });
    expect(t('nav.features', 'de')).toBe('Funktionen');
  });

  it('falls back to "en" value when key is missing in the resolved locale', () => {
    registerTranslations('es', {}); // empty — no keys
    expect(t('nav.features', 'es')).toBe('Features');
  });
});

// ---------------------------------------------------------------------------
// t() — missing keys
// ---------------------------------------------------------------------------
describe('t() — missing keys', () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  afterEach(() => warnSpy.mockClear());
  afterAll(() => warnSpy.mockRestore());

  it('returns the key itself when the key does not exist', () => {
    expect(t('nonexistent.key', 'en')).toBe('nonexistent.key');
  });

  it('logs a warning in development for a missing key', () => {
    const original = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

    t('missing.key', 'en');

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('missing.key')
    );

    Object.defineProperty(process.env, 'NODE_ENV', { value: original, writable: true });
  });

  it('does NOT log a warning in production for a missing key', () => {
    const original = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });

    t('another.missing.key', 'en');

    expect(warnSpy).not.toHaveBeenCalled();

    Object.defineProperty(process.env, 'NODE_ENV', { value: original, writable: true });
  });
});

// ---------------------------------------------------------------------------
// registerTranslations
// ---------------------------------------------------------------------------
describe('registerTranslations', () => {
  it('merges new keys into an existing locale', () => {
    registerTranslations('en', { 'test.merge': 'Merged' });
    expect(t('test.merge', 'en')).toBe('Merged');
  });

  it('creates a new locale bundle when the locale did not exist', () => {
    registerTranslations('ja', { 'nav.features': '機能' });
    expect(t('nav.features', 'ja')).toBe('機能');
  });

  it('does not overwrite unrelated keys in the same locale', () => {
    const before = t('hero.title', 'en');
    registerTranslations('en', { 'test.extra': 'Extra' });
    expect(t('hero.title', 'en')).toBe(before);
  });
});

// ---------------------------------------------------------------------------
// Fallback chain integration
// ---------------------------------------------------------------------------
describe('fallback chain integration', () => {
  it('pt-BR → pt → en when only "en" is registered', () => {
    // Ensure pt is not registered for this key
    delete (translations as any)['pt'];
    expect(t('hero.cta', 'pt-BR')).toBe('Get Early Access');
  });

  it('pt-BR → pt when "pt" has the key', () => {
    registerTranslations('pt', { 'hero.cta': 'Obter acesso antecipado' });
    expect(t('hero.cta', 'pt-BR')).toBe('Obter acesso antecipado');
  });
});
