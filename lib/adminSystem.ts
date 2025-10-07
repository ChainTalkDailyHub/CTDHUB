// lib/adminSystem.ts - Sistema de Administração Global CTDHUB

export const ADMIN_CONFIG = {
  ADMIN_ADDRESS: '0xC89d1a590588af563Be329f81B4Bfff5007eBd91',
  ADMIN_NAME: 'ChainTalkDaily',
  ADMIN_COURSES_KEY: 'ctdhub-admin-courses',
  API_BASE_URL: '/.netlify/functions/courses-api'
}

export interface AdminCourse {
  id: string
  slug: string
  title: string
  description: string
  thumbnail: string
  youtubeUrl: string
  creator: string
  creatorAddress: string
  isAdminCourse: boolean
  createdAt: string
  category?: string
  difficulty?: string
}

export class AdminSystem {
  // Verificar se é admin
  static isAdmin(walletAddress: string): boolean {
    return walletAddress.toLowerCase() === ADMIN_CONFIG.ADMIN_ADDRESS.toLowerCase()
  }

  // Salvar curso do admin (com sincronização global)
  static async saveAdminCourse(course: AdminCourse): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    try {
      // Tentar salvar na API global primeiro
      const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}/admin-courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course)
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          // Também salvar localmente para sincronização
          this.saveToLocalStorage(course)
          console.log('✅ Curso salvo globalmente:', result.message)
          return true
        }
      }
    } catch (error) {
      console.error('❌ Erro ao salvar na API global:', error)
    }

    // Fallback: salvar apenas localmente
    this.saveToLocalStorage(course)
    console.log('⚠️ Curso salvo apenas localmente (offline)')
    return true
  }

  // Obter todos os cursos do admin (com sincronização global)
  static async getAllAdminCourses(): Promise<AdminCourse[]> {
    if (typeof window === 'undefined') return []
    
    try {
      // Tentar carregar da API global primeiro
      const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}/admin-courses`)
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.courses) {
          // Sincronizar com localStorage para cache
          localStorage.setItem(ADMIN_CONFIG.ADMIN_COURSES_KEY, JSON.stringify(result.courses))
          
          console.log('✅ Cursos carregados globalmente:', result.courses.length)
          return result.courses
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar da API global:', error)
    }

    // Fallback: carregar do localStorage
    const localCourses = this.getFromLocalStorage()
    console.log('⚠️ Carregando cursos do cache local:', localCourses.length)
    return localCourses
  }

  // Deletar curso do admin (com sincronização global)
  static async deleteAdminCourse(courseId: string): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    try {
      // Tentar deletar da API global
      const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}/admin-courses?id=${courseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          // Também deletar localmente
          this.deleteFromLocalStorage(courseId)
          console.log('✅ Curso deletado globalmente')
          return true
        }
      }
    } catch (error) {
      console.error('❌ Erro ao deletar da API global:', error)
    }

    // Fallback: deletar apenas localmente
    this.deleteFromLocalStorage(courseId)
    console.log('⚠️ Curso deletado apenas localmente')
    return true
  }

  // Sincronizar cursos entre dispositivos
  static async syncCourses(): Promise<void> {
    console.log('🔄 Sincronizando cursos...')
    await this.getAllAdminCourses() // Isto já faz a sincronização
  }

  // Funções auxiliares para localStorage
  static saveToLocalStorage(course: AdminCourse): void {
    const adminCourses = this.getFromLocalStorage()
    const existingIndex = adminCourses.findIndex(c => c.id === course.id)
    
    if (existingIndex >= 0) {
      adminCourses[existingIndex] = course
    } else {
      adminCourses.push(course)
    }
    
    localStorage.setItem(ADMIN_CONFIG.ADMIN_COURSES_KEY, JSON.stringify(adminCourses))
    
    // Trigger event para atualizar outras abas
    window.dispatchEvent(new CustomEvent('ctdhub-admin-courses-updated', { 
      detail: adminCourses 
    }))
  }

  static getFromLocalStorage(): AdminCourse[] {
    const stored = localStorage.getItem(ADMIN_CONFIG.ADMIN_COURSES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static deleteFromLocalStorage(courseId: string): void {
    const adminCourses = this.getFromLocalStorage().filter(c => c.id !== courseId)
    localStorage.setItem(ADMIN_CONFIG.ADMIN_COURSES_KEY, JSON.stringify(adminCourses))
    
    // Trigger event para atualizar outras abas
    window.dispatchEvent(new CustomEvent('ctdhub-admin-courses-updated', { 
      detail: adminCourses 
    }))
  }

  // Utilitário para gerar thumbnail do YouTube
  static getYouTubeThumbnail(url: string): string {
    if (!url) return '/images/course-placeholder.svg'
    
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
    }
    
    return '/images/course-placeholder.svg'
  }

  // Verificar status da conectividade
  static async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}/admin-courses`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
      })
      
      return response.ok
    } catch (error) {
      console.log('📡 Modo offline detectado')
      return false
    }
  }
}