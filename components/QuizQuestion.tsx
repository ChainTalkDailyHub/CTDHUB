interface QuizQuestionProps {
  question: {
    id: number
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }
  selectedAnswer: number | null
  onAnswerSelect: (answer: number) => void
  showResult: boolean
}

export default function QuizQuestion({ 
  question, 
  selectedAnswer, 
  onAnswerSelect, 
  showResult 
}: QuizQuestionProps) {
  const getOptionClass = (optionIndex: number) => {
    let baseClass = "w-full p-4 text-left rounded-lg border transition-all duration-200 "
    
    if (!showResult) {
      if (selectedAnswer === optionIndex + 1) {
        baseClass += "bg-ctd-yellow text-black border-ctd-yellow font-medium"
      } else {
        baseClass += "bg-ctd-panel text-ctd-text border-ctd-border hover:bg-ctd-border hover:border-ctd-yellow"
      }
    } else {
      if (optionIndex + 1 === question.correctAnswer) {
        baseClass += "bg-green-600 text-white border-green-500"
      } else if (selectedAnswer === optionIndex + 1) {
        baseClass += "bg-red-600 text-white border-red-500"
      } else {
        baseClass += "bg-ctd-panel text-ctd-mute border-ctd-border"
      }
    }
    
    return baseClass
  }
  
  return (
    <div className="card max-w-3xl mx-auto relative">
      <div className="corner corner--tl"></div>
      <div className="corner corner--tr"></div>
      <div className="corner corner--bl"></div>
      <div className="corner corner--br"></div>
      
      <div className="relative z-10 p-1">
        <h3 className="text-xl font-semibold text-ctd-text mb-6">
          {question.question}
        </h3>
        
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && onAnswerSelect(index + 1)}
              disabled={showResult}
              className={getOptionClass(index)}
            >
              <span className="font-medium mr-3 text-ctd-yellow">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>
        
        {showResult && (
          <div className="mt-6 p-4 bg-ctd-panel border border-ctd-border rounded-lg">
            <h4 className="text-sm font-semibold text-ctd-yellow mb-2">Explanation:</h4>
            <p className="text-ctd-mute">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}