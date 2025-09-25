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
    let baseClass = "w-full p-4 text-left rounded-lg border transition-colors "
    
    if (!showResult) {
      if (selectedAnswer === optionIndex + 1) {
        baseClass += "bg-primary text-dark border-primary"
      } else {
        baseClass += "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
      }
    } else {
      if (optionIndex + 1 === question.correctAnswer) {
        baseClass += "bg-green-600 text-white border-green-500"
      } else if (selectedAnswer === optionIndex + 1) {
        baseClass += "bg-red-600 text-white border-red-500"
      } else {
        baseClass += "bg-gray-700 text-gray-300 border-gray-600"
      }
    }
    
    return baseClass
  }
  
  return (
    <div className="card max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold text-white mb-6">
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
            <span className="font-medium mr-3">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </button>
        ))}
      </div>
      
      {showResult && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold text-primary mb-2">Explanation:</h4>
          <p className="text-gray-300">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}