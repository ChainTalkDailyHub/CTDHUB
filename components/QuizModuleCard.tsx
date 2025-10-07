import Link from 'next/link'

interface QuizModuleCardProps {
  module: {
    id: number
    title: string
    description: string
    questions: any[]
  }
  isCompleted: boolean
  isLocked: boolean
}

export default function QuizModuleCard({ module, isCompleted, isLocked }: QuizModuleCardProps) {
  const getCardClass = () => {
    let baseClass = "card transition-all duration-300 relative "
    
    if (isLocked) {
      baseClass += "opacity-60 cursor-not-allowed"
    } else if (isCompleted) {
      baseClass += "border-ctd-holo shadow-ctd-holo/20"
    } else {
      baseClass += "hover:shadow-lg hover:shadow-ctd-yellow/20 border-ctd-yellow/50"
    }
    
    return baseClass
  }
  
  return (
    <div className={getCardClass()}>
      <div className="corner corner--tl"></div>
      <div className="corner corner--tr"></div>
      <div className="corner corner--bl"></div>
      <div className="corner corner--br"></div>
      
      <div className="relative z-10 p-1">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-ctd-text">
            Module {module.id}: {module.title}
          </h3>
          
          {isCompleted && (
            <div className="flex items-center text-ctd-holo">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {isLocked && (
            <div className="flex items-center text-ctd-mute">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <p className="text-ctd-text mb-4">{module.description}</p>
        <p className="text-sm text-ctd-mute mb-6">{module.questions.length} questions</p>
        
        {!isLocked ? (
          <Link 
            href={`/quiz/${module.id}`}
            className={`btn-primary block text-center ${isCompleted ? 'opacity-75' : ''}`}
          >
            {isCompleted ? 'Review Module' : 'Start Module'}
          </Link>
        ) : (
          <div className="btn-ghost opacity-50 cursor-not-allowed text-center">
            Warm-up first. Finish Module {module.id - 1} to unlock this one.
          </div>
        )}
      </div>
    </div>
  )
}