export interface Course {
  id: string
  slug: string
  title: string
  description: string
  thumbnail: string
  youtubeUrl: string
  creator?: string
  creatorAddress?: string
  isSystemCourse?: boolean
}

// Course management system - no admin restrictions

export const courses: Course[] = [
  // All courses removed - start fresh with an empty platform
]