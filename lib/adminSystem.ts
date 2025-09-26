// lib/adminSystem.ts - Sistema de Administração CTDHUB

export const ADMIN_CONFIG = {
  ADMIN_ADDRESS: '0xC89d1a590588af563Be329f81B4Bfff5007eBd91',
  ADMIN_NAME: 'ChainTalkDaily',
  ADMIN_COURSES_KEY: 'ctdhub-admin-courses'
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

  // Salvar curso do admin
  static saveAdminCourse(course: AdminCourse): void {
    if (typeof window === 'undefined') return
    
    const adminCourses = this.getAllAdminCourses()
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

  // Obter todos os cursos do admin
  static getAllAdminCourses(): AdminCourse[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(ADMIN_CONFIG.ADMIN_COURSES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Deletar curso do admin
  static deleteAdminCourse(courseId: string): void {
    if (typeof window === 'undefined') return
    
    const adminCourses = this.getAllAdminCourses().filter(c => c.id !== courseId)
    localStorage.setItem(ADMIN_CONFIG.ADMIN_COURSES_KEY, JSON.stringify(adminCourses))
    
    // Trigger event para atualizar outras abas
    window.dispatchEvent(new CustomEvent('ctdhub-admin-courses-updated', { 
      detail: adminCourses 
    }))
  }

  // Utilitário para gerar thumbnail do YouTube
  static getYouTubeThumbnail(url: string): string {
    if (!url) return '/images/course-placeholder.jpg'
    
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
    }
    
    return '/images/course-placeholder.jpg'
  }

  // Migrar cursos antigos do sistema para admin (se necessário)
  static migrateOldSystemCourses(): void {
    // Esta função pode ser usada para migrar cursos do arquivo courses.ts
    // para o sistema de admin, se necessário
  }
}