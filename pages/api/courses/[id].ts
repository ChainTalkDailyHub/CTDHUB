import { NextApiRequest, NextApiResponse } from 'next'
import { readCourses, Course } from '../../../lib/courses-storage'
import { readCoursesFromSupabase, getCourseByIdFromSupabase } from '../../../lib/supabase-storage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'Course ID is required' })
      }

      // Try Supabase first, fallback to file system
      const useSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      let course = null
      if (useSupabase) {
        console.log('Using Supabase for course by ID')
        course = await getCourseByIdFromSupabase(id as string)
      } else {
        console.log('Using file system for course by ID')
        const courses = await readCourses()
        course = courses.find(c => c.id === id)
      }

      if (!course) {
        return res.status(404).json({ error: 'Course not found' })
      }

      return res.status(200).json(course)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}