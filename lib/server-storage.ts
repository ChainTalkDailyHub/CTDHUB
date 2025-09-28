import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')

export async function readJson(filename: string): Promise<any[]> {
  try {
    const filePath = path.join(DATA_DIR, filename)
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export async function writeJson(filename: string, data: any[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const filePath = path.join(DATA_DIR, filename)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    throw new Error(`Failed to write ${filename}: ${error}`)
  }
}