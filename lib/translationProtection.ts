import React from 'react';

// Utility para detectar e prevenir problemas com tradutor de página
export function detectTranslation(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Verificar se há atributos de tradução no documento
  const hasGoogleTranslate = document.querySelector('[translate]') !== null;
  const hasTranslateClass = document.querySelector('.translated-ltr, .translated-rtl') !== null;
  const hasTranslateAttribute = document.documentElement.hasAttribute('translate');
  
  // Verificar meta tags de tradução
  const hasTranslateMeta = document.querySelector('meta[name="google"][content*="translate"]') !== null;
  
  // Verificar se o idioma da página foi alterado
  const originalLang = document.documentElement.getAttribute('data-original-lang') || 'en';
  const currentLang = document.documentElement.lang || 'en';
  const langChanged = originalLang !== currentLang;
  
  return hasGoogleTranslate || hasTranslateClass || hasTranslateAttribute || hasTranslateMeta || langChanged;
}

export function preventTranslation(): void {
  if (typeof window === 'undefined') return;
  
  // Adicionar meta tag para prevenir tradução automática
  const metaTag = document.createElement('meta');
  metaTag.name = 'google';
  metaTag.content = 'notranslate';
  document.head.appendChild(metaTag);
  
  // Marcar o idioma original
  if (!document.documentElement.hasAttribute('data-original-lang')) {
    document.documentElement.setAttribute('data-original-lang', document.documentElement.lang || 'en');
  }
  
  // Adicionar classe notranslate em elementos críticos
  const criticalSelectors = [
    'input[type="text"]',
    'input[type="email"]',
    'textarea',
    'button[type="submit"]',
    '.questionnaire-form',
    '.binno-input',
    '[data-critical]'
  ];
  
  criticalSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.classList.add('notranslate');
      element.setAttribute('translate', 'no');
    });
  });
}

export function createTranslationWarning(): HTMLDivElement {
  const warning = document.createElement('div');
  warning.id = 'translation-warning';
  warning.className = 'fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 text-center';
  warning.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <p class="font-semibold mb-2">⚠️ Browser Translation Detected</p>
      <p class="text-sm">Please disable page translation and refresh to ensure the questionnaire works correctly.</p>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 px-3 py-1 bg-red-700 rounded text-xs">
        Dismiss
      </button>
    </div>
  `;
  return warning;
}

export function monitorTranslation(): void {
  if (typeof window === 'undefined') return;
  
  let translationWarningShown = false;
  
  const checkTranslation = () => {
    if (detectTranslation() && !translationWarningShown) {
      translationWarningShown = true;
      
      // Remover aviso anterior se existir
      const existingWarning = document.getElementById('translation-warning');
      if (existingWarning) {
        existingWarning.remove();
      }
      
      // Adicionar novo aviso
      const warning = createTranslationWarning();
      document.body.insertBefore(warning, document.body.firstChild);
      
      // Auto-remover após 10 segundos
      setTimeout(() => {
        if (warning.parentElement) {
          warning.remove();
        }
      }, 10000);
    }
  };
  
  // Verificar imediatamente
  checkTranslation();
  
  // Monitorar mudanças no DOM
  const observer = new MutationObserver(() => {
    checkTranslation();
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang', 'translate', 'class']
  });
  
  // Verificar periodicamente
  setInterval(checkTranslation, 5000);
}

export function sanitizeTranslatedInput(input: string): string {
  if (!input) return input;
  
  // Mapeamento de termos comuns traduzidos para inglês
  const translationMap: Record<string, string> = {
    // Português para Inglês
    'projeto': 'project',
    'blockchain': 'blockchain',
    'contrato inteligente pt': 'smart contract',
    'contratos inteligentes pt': 'smart contracts',
    'token': 'token',
    'DeFi': 'DeFi',
    'descentralizado pt': 'decentralized',
    'descentralizada pt': 'decentralized',
    'cripto': 'crypto',
    'criptomoeda': 'cryptocurrency',
    'rede': 'network',
    'protocolo': 'protocol',
    'aplicativo': 'application',
    'aplicação': 'application',
    'plataforma pt': 'platform',
    'desenvolvimento': 'development',
    'desenvolvedor': 'developer',
    'segurança': 'security',
    'liquidez pt': 'liquidity',
    'governança': 'governance',
    'comunidade': 'community',
    'usuário': 'user',
    'usuários': 'users',
    
    // Espanhol para Inglês
    'proyecto': 'project',
    'cadena de bloques': 'blockchain',
    'contrato inteligente es': 'smart contract',
    'contratos inteligentes es': 'smart contracts',
    'descentralizado es': 'decentralized',
    'descentralizada es': 'decentralized',
    'aplicación': 'application',
    'plataforma es': 'platform',
    'desarrollo': 'development',
    'desarrollador': 'developer',
    'seguridad': 'security',
    'liquidez es': 'liquidity',
    'gobernanza': 'governance',
    'comunidad': 'community',
    'usuario': 'user',
    'usuarios': 'users'
  };
  
  let sanitized = input;
  
  // Aplicar mapeamento de tradução
  Object.entries(translationMap).forEach(([translated, original]) => {
    const regex = new RegExp(`\\b${translated}\\b`, 'gi');
    sanitized = sanitized.replace(regex, original);
  });
  
  return sanitized;
}

// Hook React para usar as funções de tradução
export function useTranslationProtection() {
  React.useEffect(() => {
    preventTranslation();
    monitorTranslation();
    
    return () => {
      // Cleanup - remover observer se necessário
      const warning = document.getElementById('translation-warning');
      if (warning) {
        warning.remove();
      }
    };
  }, []);
  
  return {
    detectTranslation,
    sanitizeTranslatedInput
  };
}