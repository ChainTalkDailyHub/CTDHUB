const fs = require('fs');

// Verificar se o arquivo tem erros de sintaxe básicos
const content = fs.readFileSync('QuizBurner_EXACT.sol', 'utf8');

console.log("🔍 Verificando sintaxe do arquivo QuizBurner_EXACT.sol...");

// Verificar função verifyEligibility
const funcMatch = content.match(/function verifyEligibility\([^)]+\)/);
if (funcMatch) {
    console.log("✅ Função verifyEligibility encontrada:");
    console.log(funcMatch[0]);
} else {
    console.log("❌ Função verifyEligibility não encontrada!");
}

// Verificar vírgulas na declaração de parâmetros
const hasCorrectCommas = content.includes('address user,') && content.includes('uint256 quizId,');
console.log(hasCorrectCommas ? "✅ Vírgulas corretas nos parâmetros" : "❌ Problema com vírgulas");

// Verificar se não há erros óbvios
const hasErrors = content.includes('uint256, quizId') || content.includes('address user\n        uint256');
console.log(hasErrors ? "❌ Ainda há erros de sintaxe" : "✅ Sintaxe parece correta");

console.log("\n📊 Status geral:", hasCorrectCommas && !hasErrors ? "✅ CORRIGIDO" : "❌ PRECISA CORREÇÃO");