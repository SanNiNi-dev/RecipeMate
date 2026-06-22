import en from './translations/en.json'
import my from './translations/my.json'
import zh from './translations/zh.json'
import th from './translations/th.json'
import ja from './translations/ja.json'

export const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'my', label: 'မြန်မာ',   flag: '🇲🇲' },
  { code: 'zh', label: '中文',      flag: '🇨🇳' },
  { code: 'th', label: 'ไทย',      flag: '🇹🇭' },
  { code: 'ja', label: '日本語',    flag: '🇯🇵' },
]

const translations = { en, my, zh, th, ja }

/**
 * Get a nested value from an object using a dot-separated key.
 * e.g. getNestedValue(obj, 'home.hero_title_1')
 */
function getNestedValue(obj, key) {
  return key.split('.').reduce((acc, part) => acc?.[part], obj)
}

/**
 * Create a translation function for the given language code.
 * Supports string interpolation: t('login.welcome_back', { name: 'John' })
 * Falls back to English, then to the raw key.
 */
export function createT(langCode) {
  const dict = translations[langCode] || translations.en

  return function t(key, replacements) {
    let value = getNestedValue(dict, key)

    // Fall back to English if not found in the selected language
    if (value === undefined) {
      value = getNestedValue(translations.en, key)
    }

    // If still not found, return the key itself
    if (value === undefined) return key

    // Apply replacements: {name} → value
    if (replacements && typeof value === 'string') {
      Object.entries(replacements).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }

    return value
  }
}

export const DEFAULT_LANGUAGE = 'en'
export const STORAGE_KEY = 'rm-language'
