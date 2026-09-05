import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import ptBR from './locales/pt-BR.json'
import enUS from './locales/en-US.json'
import es from './locales/es.json'
import de from './locales/de.json'
import fr from './locales/fr.json'
import it from './locales/it.json'

const dictionaries: Record<string, Record<string, string>> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  es,
  de,
  fr,
  it,
}

const DEFAULT_LOCALE = 'pt-BR'

function resolveBaseLocale(navLang: string): string {
  const base = (navLang || '').split('-')[0].toLowerCase()
  if (base === 'pt') return 'pt-BR'
  if (base === 'en') return 'en-US'
  if (base === 'es') return 'es'
  if (base === 'de') return 'de'
  if (base === 'fr') return 'fr'
  if (base === 'it') return 'it'
  return DEFAULT_LOCALE
}

function getInitialLocale(): string {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('momai_locale')
      if (saved && dictionaries[saved]) return saved
      if (saved) return resolveBaseLocale(saved)
      const navLang = navigator?.language || ''
      if (navLang) return resolveBaseLocale(navLang)
    }
  } catch {}
  return DEFAULT_LOCALE
}

interface SmartHomeI18nContextValue {
  locale: string
  t: (key: string, vars?: Record<string, string | number>) => string
}

const SmartHomeI18nContext = createContext<SmartHomeI18nContextValue>({
  locale: DEFAULT_LOCALE,
  t: (key) => key,
})

export function SmartHomeI18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<string>(getInitialLocale)

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ locale: string }>
      if (ce?.detail?.locale) setLocale(ce.detail.locale)
    }
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'momai_locale' && e.newValue) {
        setLocale(resolveBaseLocale(e.newValue))
      }
    }
    window.addEventListener('momai:locale-changed', handler)
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener('momai:locale-changed', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const dict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE] || {}
      let text = dict[key] || dictionaries[DEFAULT_LOCALE]?.[key] || key
      if (vars) {
        for (const [varKey, varValue] of Object.entries(vars)) {
          text = text.replaceAll(`{${varKey}}`, String(varValue))
        }
      }
      return text
    },
    [locale]
  )

  const value = useMemo(() => ({ locale, t }), [locale, t])

  return (
    <SmartHomeI18nContext.Provider value={value}>
      {children}
    </SmartHomeI18nContext.Provider>
  )
}

export function useSmartHomeI18n() {
  return useContext(SmartHomeI18nContext)
}

// Synchronous lookup for module-level code paths (fetch timeout handlers)
// that cannot call the hook. Resolves the stored host locale the same way
// getInitialLocale does and falls back to pt-BR, then to the key itself.
export function translateSh(key: string, vars?: Record<string, string | number>): string {
  let locale = DEFAULT_LOCALE
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('momai_locale')
      if (saved && dictionaries[saved]) locale = saved
      else if (saved) locale = resolveBaseLocale(saved)
      else if (navigator?.language) locale = resolveBaseLocale(navigator.language)
    }
  } catch {}
  const dict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE] || {}
  let text = dict[key] || dictionaries[DEFAULT_LOCALE]?.[key] || key
  if (vars) {
    for (const [varKey, varValue] of Object.entries(vars)) {
      text = text.replaceAll(`{${varKey}}`, String(varValue))
    }
  }
  return text
}
