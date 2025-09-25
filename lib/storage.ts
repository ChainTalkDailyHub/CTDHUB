export interface UserProgress {
  userAddress: string
  completedModules: number[]
  timestamp: number
}

class StorageService {
  private static instance: StorageService
  private progressData: Map<string, UserProgress> = new Map()

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  saveProgress(userAddress: string, completedModules: number[]): void {
    this.progressData.set(userAddress.toLowerCase(), {
      userAddress: userAddress.toLowerCase(),
      completedModules,
      timestamp: Date.now()
    })
  }

  getProgress(userAddress: string): UserProgress | null {
    return this.progressData.get(userAddress.toLowerCase()) || null
  }

  isAllModulesCompleted(userAddress: string): boolean {
    const progress = this.getProgress(userAddress)
    return progress ? progress.completedModules.length === 10 : false
  }

  // Para testes - força conclusão de todos os módulos
  forceCompleteAllModules(userAddress: string): void {
    this.saveProgress(userAddress, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    console.log(` Forçada conclusão de todos os módulos para ${userAddress}`)
  }
}

export const storage = StorageService.getInstance()
