import type { NextApiRequest, NextApiResponse } from 'next'

interface Course {
  id: number
  title: string
  description: string
  icon: string
  color: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  modules: number
  completed: boolean
}

const courses: Course[] = [
  {
    id: 1,
    title: "Blockchain Fundamentals",
    description: "Learn the core concepts of blockchain technology, decentralization, and distributed ledgers.",
    icon: "🔗",
    color: "from-blue-400 to-blue-600",
    difficulty: "Beginner",
    duration: "2 hours",
    modules: 10,
    completed: false
  },
  {
    id: 2,
    title: "Cryptocurrency Basics",
    description: "Understanding digital currencies, Bitcoin, and the economic principles behind cryptocurrencies.",
    icon: "₿",
    color: "from-orange-400 to-orange-600",
    difficulty: "Beginner",
    duration: "1.5 hours",
    modules: 8,
    completed: false
  },
  {
    id: 3,
    title: "Smart Contracts",
    description: "Deep dive into smart contracts, their applications, and how they work on blockchain networks.",
    icon: "📄",
    color: "from-green-400 to-green-600",
    difficulty: "Intermediate",
    duration: "3 hours",
    modules: 12,
    completed: false
  },
  {
    id: 4,
    title: "DeFi Ecosystem",
    description: "Explore Decentralized Finance protocols, yield farming, and liquidity provision strategies.",
    icon: "🏦",
    color: "from-purple-400 to-purple-600",
    difficulty: "Advanced",
    duration: "4 hours",
    modules: 15,
    completed: false
  },
  {
    id: 5,
    title: "NFTs and Digital Assets",
    description: "Understanding Non-Fungible Tokens, digital ownership, and the creator economy.",
    icon: "🎨",
    color: "from-pink-400 to-pink-600",
    difficulty: "Intermediate",
    duration: "2.5 hours",
    modules: 10,
    completed: false
  },
  {
    id: 6,
    title: "Web3 Development",
    description: "Learn to build decentralized applications using modern Web3 tools and frameworks.",
    icon: "⚡",
    color: "from-indigo-400 to-indigo-600",
    difficulty: "Advanced",
    duration: "5 hours",
    modules: 18,
    completed: false
  },
  {
    id: 7,
    title: "Consensus Mechanisms",
    description: "Study different consensus algorithms like Proof of Work, Proof of Stake, and their trade-offs.",
    icon: "⚖️",
    color: "from-teal-400 to-teal-600",
    difficulty: "Intermediate",
    duration: "2 hours",
    modules: 9,
    completed: false
  },
  {
    id: 8,
    title: "Blockchain Security",
    description: "Security best practices, common vulnerabilities, and how to protect blockchain applications.",
    icon: "🛡️",
    color: "from-red-400 to-red-600",
    difficulty: "Advanced",
    duration: "3.5 hours",
    modules: 14,
    completed: false
  },
  {
    id: 9,
    title: "Tokenomics",
    description: "Economics of tokens, distribution models, and designing sustainable token economies.",
    icon: "💰",
    color: "from-yellow-400 to-yellow-600",
    difficulty: "Intermediate",
    duration: "2.5 hours",
    modules: 11,
    completed: false
  },
  {
    id: 10,
    title: "Future of Blockchain",
    description: "Emerging trends, scalability solutions, and the future direction of blockchain technology.",
    icon: "🚀",
    color: "from-cyan-400 to-cyan-600",
    difficulty: "Advanced",
    duration: "3 hours",
    modules: 13,
    completed: false
  }
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    // Get user progress from query or headers (in a real app, this would come from auth)
    const userProgress = req.query.progress ? JSON.parse(req.query.progress as string) : {}
    
    // Update courses with user progress
    const coursesWithProgress = courses.map(course => ({
      ...course,
      completed: userProgress[course.id]?.completed || false
    }))

    return res.status(200).json({
      success: true,
      courses: coursesWithProgress,
      totalCourses: courses.length
    })

  } catch (error) {
    console.error('Courses API error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch courses'
    })
  }
}