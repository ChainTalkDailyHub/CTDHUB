// Sistema de internacionalização para o Skill Compass
export type Language = 'pt' | 'en' | 'es'

export interface Translations {
  // Header e navegação
  skillCompass: string
  questionOf: string
  
  // Botões e ações
  previousButton: string
  nextQuestion: string
  completeAssessment: string
  processing: string
  
  // Estados de carregamento
  generatingQuestion: string
  generatingQuestionDesc: string
  generatingReport: string
  
  // Erros e validações
  shortAnswer: string
  translationDetected: string
  translationWarning: string
  errorTitle: string
  tryAgain: string
  
  // Relatório final
  skillAnalysisTitle: string
  basedOnAnswers: string
  backToBinno: string
  downloadReport: string
  
  // AI branding
  poweredByBinno: string
  
  // Seletor de idioma
  language: string
  portuguese: string
  english: string
  spanish: string
}

export const translations: Record<Language, Translations> = {
  pt: {
    // Header e navegação
    skillCompass: '🧭 CTD Skill Compass - Web3 Assessment',
    questionOf: 'Question {current} of {total}',
    
    // Botões e ações
    previousButton: '← Previous',
    nextQuestion: 'Next Question →',
    completeAssessment: 'Complete Assessment',
    processing: 'Processing...',
    
    // Estados de carregamento
    generatingQuestion: '🤖 AI is analyzing your response and generating the next personalized question...',
    generatingQuestionDesc: 'This ensures each question builds upon your previous answers',
    generatingReport: 'Generating AI Analysis...',
    
    // Erros e validações
    shortAnswer: 'Please provide a more detailed answer (at least 10 characters)',
    translationDetected: '⚠️ Page translation detected. Please disable browser translation and refresh the page to continue.',
    translationWarning: 'Please disable page translation and refresh the page to continue the assessment safely.',
    errorTitle: 'Oops! Something went wrong',
    tryAgain: 'Try again',
    
    // Relatório final
    skillAnalysisTitle: '🎯 Your CTD Skill Compass Analysis',
    basedOnAnswers: 'Based on your {count} detailed responses',
    backToBinno: 'Back to Binno AI',
    downloadReport: 'Download PDF Report',
    
    // AI branding
    poweredByBinno: '🤖 Powered by Binno AI • Questions adapt based on your responses • CTDHUB',
    
    // Seletor de idioma
    language: 'Language',
    portuguese: 'Português',
    english: 'English',
    spanish: 'Español'
  },
  
  en: {
    // Header e navegação
    skillCompass: '🧭 CTD Skill Compass - Web3 Assessment',
    questionOf: 'Question {current} of {total}',
    
    // Botões e ações
    previousButton: '← Previous',
    nextQuestion: 'Next Question →',
    completeAssessment: 'Complete Assessment',
    processing: 'Processing...',
    
    // Estados de carregamento
    generatingQuestion: '🤖 AI is analyzing your response and generating the next personalized question...',
    generatingQuestionDesc: 'This ensures each question builds upon your previous answers',
    generatingReport: 'Generating AI Analysis...',
    
    // Erros e validações
    shortAnswer: 'Please provide a more detailed answer (at least 10 characters)',
    translationDetected: '⚠️ Page translation detected. Please disable browser translation and refresh the page to continue.',
    translationWarning: 'Please disable page translation and refresh the page to continue the assessment safely.',
    errorTitle: 'Oops! Something went wrong',
    tryAgain: 'Try again',
    
    // Relatório final
    skillAnalysisTitle: '🎯 Your CTD Skill Compass Analysis',
    basedOnAnswers: 'Based on your {count} detailed responses',
    backToBinno: 'Back to Binno AI',
    downloadReport: 'Download PDF Report',
    
    // AI branding
    poweredByBinno: '🤖 Powered by Binno AI • Questions adapt based on your responses • CTDHUB',
    
    // Seletor de idioma
    language: 'Language',
    portuguese: 'Português',
    english: 'English',
    spanish: 'Español'
  },
  
  es: {
    // Header e navegação
    skillCompass: '🧭 Skill Compass - Evaluación Web3',
    questionOf: 'Pregunta {current} de {total}',
    
    // Botões e ações
    previousButton: '← Anterior',
    nextQuestion: 'Siguiente Pregunta →',
    completeAssessment: 'Completar Evaluación',
    processing: 'Procesando...',
    
    // Estados de carregamento
    generatingQuestion: '🤖 La IA está analizando tu respuesta y generando la siguiente pregunta personalizada...',
    generatingQuestionDesc: 'Esto asegura que cada pregunta se base en tus respuestas anteriores',
    generatingReport: 'Generando Análisis IA...',
    
    // Erros e validações
    shortAnswer: 'Por favor, proporciona una respuesta más detallada (al menos 10 caracteres)',
    translationDetected: '⚠️ Traducción de página detectada. Por favor, desactiva la traducción del navegador y actualiza la página para continuar.',
    translationWarning: 'Por favor, desactiva la traducción de la página y actualiza la página para continuar la evaluación de forma segura.',
    errorTitle: '¡Ups! Algo salió mal',
    tryAgain: 'Inténtalo de nuevo',
    
    // Relatório final
    skillAnalysisTitle: '🎯 Tu Análisis del Skill Compass',
    basedOnAnswers: 'Basado en tus {count} respuestas detalladas',
    backToBinno: 'Volver a Binno AI',
    downloadReport: 'Descargar Reporte PDF',
    
    // AI branding
    poweredByBinno: '🤖 Powered by Binno AI • Las preguntas se adaptan basadas en tus respuestas • CTDHUB',
    
    // Seletor de idioma
    language: 'Idioma',
    portuguese: 'Português',
    english: 'English',
    spanish: 'Español'
  }
}

// Hook para usar as traduções
export function useTranslations(language: Language): Translations {
  return translations[language]
}

// Função para formatar strings com placeholders
export function formatString(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match
  })
}