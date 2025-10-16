# Guia para Verificar Contrato no BscScan
# Resolve o problema de "Suspicious Address" no MetaMask

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🔍 VERIFICAR CONTRATO NO BSCSCAN - REMOVER ALERTA 🔍    ║" -ForegroundColor Yellow
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "⚠️ PROBLEMA IDENTIFICADO:" -ForegroundColor Red
Write-Host "   O contrato 0xB5e03...eB958 aparece como 'suspeito' no MetaMask" -ForegroundColor White
Write-Host "   porque o código-fonte NÃO ESTÁ VERIFICADO no BscScan.`n" -ForegroundColor White

Write-Host "✅ SOLUÇÃO:" -ForegroundColor Green
Write-Host "   Verificar o código-fonte do contrato no BscScan.`n" -ForegroundColor White

Write-Host "📝 OPÇÕES DE VERIFICAÇÃO:`n" -ForegroundColor Yellow

Write-Host "   OPÇÃO 1: Verificação Manual no BscScan (RECOMENDADO)" -ForegroundColor Magenta
Write-Host "   ─────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "   1. Acesse: https://bscscan.com/verifyContract" -ForegroundColor White
Write-Host "   2. Preencha:`n" -ForegroundColor White
Write-Host "      • Contract Address: " -NoNewline -ForegroundColor Gray
Write-Host "0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958" -ForegroundColor Cyan
Write-Host "      • Compiler Type: " -NoNewline -ForegroundColor Gray
Write-Host "Solidity (Single file)" -ForegroundColor Cyan
Write-Host "      • Compiler Version: " -NoNewline -ForegroundColor Gray
Write-Host "v0.8.20+commit.a1b79de6" -ForegroundColor Cyan
Write-Host "      • License: " -NoNewline -ForegroundColor Gray
Write-Host "MIT" -ForegroundColor Cyan
Write-Host "`n   3. Cole o código-fonte do contrato (CTDQuizBurner.sol)" -ForegroundColor White
Write-Host "   4. Clique 'Verify and Publish'`n" -ForegroundColor White

Write-Host "   OPÇÃO 2: Verificação via Hardhat (Automático)" -ForegroundColor Magenta
Write-Host "   ───────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "   Execute no diretório blockchain/:" -ForegroundColor White
Write-Host "   " -NoNewline
Write-Host "npx hardhat verify --network bsc 0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host "`n   (Requer BSCSCAN_API_KEY configurada)`n" -ForegroundColor Gray

Write-Host "📂 LOCALIZAÇÃO DO CÓDIGO-FONTE:" -ForegroundColor Yellow
Write-Host "   O código do contrato está em:" -ForegroundColor White

$contractPath = "blockchain\contracts\CTDQuizBurner.sol"
if (Test-Path $contractPath) {
    Write-Host "   ✅ " -NoNewline -ForegroundColor Green
    Write-Host $contractPath -ForegroundColor Cyan
    Write-Host "`n   Você pode abrir e copiar o código deste arquivo.`n" -ForegroundColor White
} else {
    Write-Host "   ❌ Arquivo não encontrado neste diretório" -ForegroundColor Red
    Write-Host "   📝 Busque o arquivo CTDQuizBurner.sol no projeto`n" -ForegroundColor Yellow
}

Write-Host "🔑 INFORMAÇÕES NECESSÁRIAS PARA VERIFICAÇÃO:" -ForegroundColor Yellow
Write-Host "   ─────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "   Contract Address:  " -NoNewline -ForegroundColor White
Write-Host "0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958" -ForegroundColor Cyan
Write-Host "   Compiler Version:  " -NoNewline -ForegroundColor White
Write-Host "v0.8.20+commit.a1b79de6" -ForegroundColor Cyan
Write-Host "   Optimization:      " -NoNewline -ForegroundColor White
Write-Host "Yes (200 runs)" -ForegroundColor Cyan
Write-Host "   License:           " -NoNewline -ForegroundColor White
Write-Host "MIT" -ForegroundColor Cyan
Write-Host "   EVM Version:       " -NoNewline -ForegroundColor White
Write-Host "paris" -ForegroundColor Cyan

Write-Host "`n📋 CONSTRUCTOR ARGUMENTS:" -ForegroundColor Yellow
Write-Host "   O contrato foi deployado com 2 argumentos:" -ForegroundColor White
Write-Host "   1. CTD Token:   " -NoNewline -ForegroundColor Gray
Write-Host "0x7f890a4a575558307826C82e4cb6E671f3178bfc" -ForegroundColor Cyan
Write-Host "   2. Treasury:    " -NoNewline -ForegroundColor Gray
Write-Host "0x27f79d0a52F88D04e1d04875Fe55d6C23f514Ec4" -ForegroundColor Cyan

Write-Host "`n   Para verificação manual, você precisará dos argumentos codificados:" -ForegroundColor White
Write-Host "   (Será gerado automaticamente pelo BscScan)`n" -ForegroundColor Gray

Write-Host "⏱️ APÓS VERIFICAÇÃO:" -ForegroundColor Yellow
Write-Host "   ✅ Contrato aparecerá com ✓ verde no BscScan" -ForegroundColor White
Write-Host "   ✅ Código-fonte será público e auditável" -ForegroundColor White
Write-Host "   ✅ MetaMask removerá o alerta de 'suspeito'" -ForegroundColor White
Write-Host "   ✅ Usuários terão mais confiança no contrato`n" -ForegroundColor White

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            🎯 PRÓXIMA AÇÃO: VERIFICAR NO BSCSCAN! 🎯         ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "💡 DICA:" -ForegroundColor Yellow
Write-Host "   Após verificar, aguarde 1-2 minutos para o BscScan processar." -ForegroundColor White
Write-Host "   Então teste novamente - o alerta do MetaMask desaparecerá!`n" -ForegroundColor White

Write-Host "❓ Deseja abrir o BscScan para verificar agora? (S/N): " -NoNewline -ForegroundColor Yellow
$resposta = Read-Host

if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host "`n🌐 Abrindo BscScan Verify Contract...`n" -ForegroundColor Green
    Start-Process "https://bscscan.com/verifyContract"
    Start-Sleep -Seconds 2
    Start-Process "https://bscscan.com/address/0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958#code"
} else {
    Write-Host "`n✅ OK! Verifique manualmente quando estiver pronto.`n" -ForegroundColor Green
}

Write-Host "📚 Para mais detalhes, consulte:" -ForegroundColor Yellow
Write-Host "   https://docs.bscscan.com/tutorials/verifying-contracts`n" -ForegroundColor Cyan
