/**
 * Helper para gerenciar URLs de API entre desenvolvimento e produção
 * 
 * Dev: usa /api
 * Prod: usa /.netlify/functions (export estático + Functions)
 * 
 * Configure NEXT_PUBLIC_BINNO_API_BASE no ambiente de produção
 */

export function apiURL(name: string): string {
  // Pega a base do ambiente ou usa /api como padrão (dev)
  const base = (process.env.NEXT_PUBLIC_BINNO_API_BASE || '/api').replace(/\/+$/, '');
  
  // Remove barras do início do nome
  const clean = name.replace(/^\/+/, '');
  
  return `${base}/${clean}`;
}

/**
 * Fetch defensivo com tratamento robusto de erros
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = apiURL(endpoint);
  
  // Headers padrão
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
    
    const res = await fetch(url, config);
    const contentType = res.headers.get('content-type') || '';
    const raw = await res.text();
    
    // Log detalhado para debug
    console.log(`📊 Response: ${res.status} | Content-Type: ${contentType}`);
    
    if (!res.ok) {
      // Mostra o erro REAL (HTML/stack/401 etc.)
      const errorMsg = `HTTP ${res.status} ${url}\n${raw.slice(0, 300)}`;
      console.error(`❌ API Error:`, errorMsg);
      throw new Error(errorMsg);
    }
    
    // Verifica se é realmente JSON
    if (!contentType.includes('application/json')) {
      const error = `Expected JSON but got: ${contentType}\n${raw.slice(0, 300)}`;
      console.error(`❌ Content-Type Error:`, error);
      throw new Error(error);
    }
    
    // Parse defensivo
    let data: any;
    try {
      data = JSON.parse(raw);
      console.log(`✅ JSON parsed successfully`);
    } catch (parseError) {
      const error = `Invalid JSON from ${url}: ${String(parseError)}\nBody:\n${raw.slice(0, 300)}`;
      console.error(`❌ JSON Parse Error:`, error);
      throw new Error(error);
    }
    
    return data;
    
  } catch (error) {
    console.error(`💥 API Request Failed:`, error);
    throw error;
  }
}

/**
 * Health check para validar conectividade e ambiente
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await apiRequest('health');
    return result.ok === true;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}

/**
 * Debugging info para ambiente
 */
export function getApiInfo() {
  return {
    base: process.env.NEXT_PUBLIC_BINNO_API_BASE || '/api',
    isProduction: process.env.NODE_ENV === 'production',
    hasBinnoBase: !!process.env.NEXT_PUBLIC_BINNO_API_BASE,
  };
}