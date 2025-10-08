import { useState, useEffect } from 'react'
import { Language, useTranslations } from '../lib/i18n/translations'

interface LanguageSelectorProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const t = useTranslations(currentLanguage)
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'pt' as Language, name: t.portuguese, flag: '🇧🇷' },
    { code: 'en' as Language, name: t.english, flag: '🇺🇸' },
    { code: 'es' as Language, name: t.spanish, flag: '🇪🇸' }
  ]

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-ctd-panel border border-ctd-border rounded-lg text-ctd-text hover:bg-ctd-border/30 transition-colors"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium">{currentLang.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-ctd-panel border border-ctd-border rounded-lg shadow-lg z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                onLanguageChange(language.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-ctd-border/30 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                language.code === currentLanguage ? 'bg-ctd-border/20 text-ctd-yellow' : 'text-ctd-text'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm font-medium">{language.name}</span>
              {language.code === currentLanguage && (
                <span className="ml-auto text-ctd-yellow">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Overlay para fechar quando clicar fora */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}