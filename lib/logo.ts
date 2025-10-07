// lib/logo.ts - Utilitário para padronização da logo CTDHUB
// 🎨 PADRÃO OFICIAL: SEMPRE usar CTDHUB.png como primeira e única opção

/**
 * Retorna o caminho oficial da logo CTDHUB
 * USO OBRIGATÓRIO: Esta é a ÚNICA logo oficial do projeto
 */
export const OFFICIAL_LOGO_PATH = '/images/CTDHUB.png'

/**
 * Retorna o caminho completo para uso em APIs Node.js
 */
export const getLogoPath = (basePath: string = process.cwd()): string => {
  const path = require('path')
  return path.join(basePath, 'public', 'images', 'CTDHUB.png')
}

/**
 * Texto de fallback quando a logo não carrega
 * PADRÃO: Usar apenas "CTD HUB" como fallback
 */
export const LOGO_FALLBACK_TEXT = 'CTD HUB'

/**
 * Props padrão para componentes de logo
 */
export const LOGO_DEFAULT_PROPS = {
  src: OFFICIAL_LOGO_PATH,
  alt: 'CTDHUB - Blockchain Learning Platform',
  fallbackText: LOGO_FALLBACK_TEXT
}

/**
 * Função para garantir que sempre use a logo oficial
 * @param customPath - IGNORADO - sempre retorna a logo oficial
 * @returns Caminho oficial da logo
 */
export const ensureOfficialLogo = (customPath?: string): string => {
  // Ignora qualquer path customizado e sempre retorna a logo oficial
  return OFFICIAL_LOGO_PATH
}

/**
 * Verificação de tipo para evitar uso de logos alternativas
 */
type OfficialLogoOnly = typeof OFFICIAL_LOGO_PATH
export const validateLogoPath = (path: string): path is OfficialLogoOnly => {
  return path === OFFICIAL_LOGO_PATH
}