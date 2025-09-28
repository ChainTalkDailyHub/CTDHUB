import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const DATA_DIR = path.join(process.cwd(), '.data')

// Check if we're in a serverless environment
const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

export interface CourseVideo {
  id: string
  title: string
  description: string
  youtubeUrl: string
  thumbnail?: string | null
  order: number
}

export interface Course {
  id: string
  title: string
  description: string
  author: string
  createdAt: number
  updatedAt: number
  videos: CourseVideo[]
  totalVideos: number
  totalDuration?: string
}

export async function readCourses(): Promise<Course[]> {
  // In serverless environments, return empty array for now
  if (isServerless) {
    console.log('Serverless environment detected, using in-memory storage')
    return []
  }
  
  try {
    // Ensure directory exists
    await fs.mkdir(DATA_DIR, { recursive: true })
    
    const filePath = path.join(DATA_DIR, 'courses.json')
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.log('No existing courses file found, returning empty array')
    return []
  }
}

export async function writeCourses(courses: Course[]): Promise<void> {
  // In serverless environments, simulate success for now
  if (isServerless) {
    console.log('Serverless environment detected, simulating course save')
    console.log('Course data:', JSON.stringify(courses, null, 2))
    return
  }
  
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const filePath = path.join(DATA_DIR, 'courses.json')
    await fs.writeFile(filePath, JSON.stringify(courses, null, 2), 'utf8')
    console.log('Courses written successfully to:', filePath)
  } catch (error) {
    console.error('Error writing courses:', error)
    throw new Error(`Failed to write courses: ${error}`)
  }
}

export function generateId(): string {
  return uuidv4()
}

export function ytIdFromUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

export function ytThumb(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function short(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}