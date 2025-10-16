# Script de Início Rápido para Teste do Sistema de Burn
# CTDHUB - ChainTalkDaily Educational Platform

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         🚀 CTDHUB BURN SYSTEM - QUICK START 🚀              ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "⚡ Iniciando ferramentas de teste...`n" -ForegroundColor Yellow

# Verificar se está no diretório correto
if (-not (Test-Path "monitor-burn-events.js")) {
    Write-Host "❌ ERRO: Execute este script no diretório raiz do projeto!" -ForegroundColor Red
    exit 1
}

# 1. Abrir frontend no navegador
Write-Host "📱 Abrindo frontend..." -ForegroundColor Cyan
Start-Process "https://chaintalkdailyhub.com/quiz"
Start-Sleep -Seconds 2

# 2. Abrir BscScan do contrato
Write-Host "🔍 Abrindo BscScan..." -ForegroundColor Cyan
Start-Process "https://bscscan.com/address/0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958"
Start-Sleep -Seconds 2

# 3. Abrir documentação
Write-Host "📖 Abrindo documentação..." -ForegroundColor Cyan
if (Test-Path "TESTE_FINAL.md") {
    Start-Process "TESTE_FINAL.md"
}
Start-Sleep -Seconds 2

# 4. Verificar status do sistema
Write-Host "`n📊 Verificando status do sistema...`n" -ForegroundColor Yellow
node verify-allowance.js

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  ✅ TUDO PRONTO PARA TESTE!                  ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "🎧 PRÓXIMO PASSO:" -ForegroundColor Yellow
Write-Host "   Abra um NOVO terminal e execute:" -ForegroundColor White
Write-Host "   → " -NoNewline -ForegroundColor White
Write-Host "node monitor-burn-events.js" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host "`n   Isso vai monitorar os burns em tempo real!`n" -ForegroundColor White

Write-Host "📝 EM SEGUIDA:" -ForegroundColor Yellow
Write-Host "   1. Vá para a página do quiz (já aberta no navegador)" -ForegroundColor White
Write-Host "   2. Complete 10 módulos" -ForegroundColor White
Write-Host "   3. Conecte MetaMask" -ForegroundColor White
Write-Host "   4. Clique 'Burn 1000 CTD Tokens'" -ForegroundColor White
Write-Host "   5. Assine a transação`n" -ForegroundColor White

Write-Host "💡 DICA:" -ForegroundColor Yellow
Write-Host "   O monitor vai mostrar TUDO em tempo real:" -ForegroundColor White
Write-Host "   - Quem fez burn" -ForegroundColor Gray
Write-Host "   - Quanto foi queimado" -ForegroundColor Gray
Write-Host "   - Link direto para BscScan" -ForegroundColor Gray
Write-Host "   - Status atualizado do contrato`n" -ForegroundColor Gray

Write-Host "🆘 COMANDOS ÚTEIS:" -ForegroundColor Yellow
Write-Host "   Verificar allowance:  " -NoNewline -ForegroundColor White
Write-Host "node verify-allowance.js" -ForegroundColor Cyan
Write-Host "   Verificar usuário:    " -NoNewline -ForegroundColor White
Write-Host "node check-user.js <ENDEREÇO>" -ForegroundColor Cyan
Write-Host "   Aumentar allowance:   " -NoNewline -ForegroundColor White
Write-Host "node setup-allowance.js" -ForegroundColor Cyan

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              🎯 BOA SORTE COM O TESTE! 🎯                   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Perguntar se quer iniciar o monitor automaticamente
Write-Host "❓ Deseja iniciar o monitor agora? (S/N): " -NoNewline -ForegroundColor Yellow
$resposta = Read-Host

if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host "`n🎧 Iniciando monitor de eventos...`n" -ForegroundColor Green
    Write-Host "   (Pressione Ctrl+C para parar)`n" -ForegroundColor Gray
    node monitor-burn-events.js
} else {
    Write-Host "`n✅ OK! Execute manualmente quando quiser:`n" -ForegroundColor Green
    Write-Host "   node monitor-burn-events.js`n" -ForegroundColor Cyan
}
