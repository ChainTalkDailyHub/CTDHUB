export function correctPos(moduleIndex: number, questionIndex: number, seed?: number): number {
  // Pattern: A B C D → B C D A → C D A B → D A B C → A C B D → B D C A
  const patterns = [
    [1, 2, 3, 4], // A B C D
    [2, 3, 4, 1], // B C D A
    [3, 4, 1, 2], // C D A B
    [4, 1, 2, 3], // D A B C
    [1, 3, 2, 4], // A C B D
    [2, 4, 3, 1]  // B D C A
  ]
  
  const patternIndex = moduleIndex % patterns.length
  const correctIndex = questionIndex % patterns[patternIndex].length
  
  return patterns[patternIndex][correctIndex]
}

export function shuffleOptions(correctAnswer: string, wrongOptions: string[], correctPos: number): string[] {
  const allOptions = [correctAnswer, ...wrongOptions]
  const shuffled = new Array(4)
  
  // Place correct answer at correct position
  shuffled[correctPos - 1] = correctAnswer
  
  // Fill remaining positions with wrong options
  let wrongIndex = 0
  for (let i = 0; i < 4; i++) {
    if (i !== correctPos - 1) {
      shuffled[i] = wrongOptions[wrongIndex++]
    }
  }
  
  return shuffled
}

export function getModuleDistribution() {
  const modules = []
  for (let i = 0; i < 10; i++) {
    const questions = []
    for (let j = 0; j < 10; j++) {
      questions.push({
        id: j + 1,
        correctPosition: correctPos(i, j)
      })
    }
    modules.push({
      id: i + 1,
      questions
    })
  }
  return modules
}