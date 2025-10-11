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
    let baseClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-medium "
    
    if (!showResult) {
      if (selectedAnswer === optionIndex + 1) {
        baseClass += "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-400 shadow-lg transform scale-[1.02]"
      } else {
        baseClass += "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-yellow-400 hover:shadow-md"
      }
    } else {
      if (optionIndex + 1 === question.correctAnswer) {
        baseClass += "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500 shadow-lg"
      } else if (selectedAnswer === optionIndex + 1) {
        baseClass += "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-lg"
      } else {
        baseClass += "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
      }
    }
    
    return baseClass
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto p-8 transition-colors duration-300">
      <div className="relative z-10">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-8 leading-relaxed">
          {question.question}
        </h3>
        
        <div className="space-y-4 mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && onAnswerSelect(index + 1)}
              disabled={showResult}
              className={getOptionClass(index)}
            >
              <span className="font-bold mr-3 text-lg">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="text-left">{option}</span>
            </button>
          ))}
        </div>
        
        {showResult && (
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl">
            <h4 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">💡 Explanation:</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}