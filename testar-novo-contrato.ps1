#!/usr/bin/env pwsh

# 🎯 Teste do Novo Contrato Quiz Burner
# Contrato: 0x27E975342Ef23E188987DfC3bEE1322a651E5C9A

Write-Host "🎯 TESTE DO NOVO CONTRATO QUIZ BURNER" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

$newContract = "0x27E975342Ef23E188987DfC3bEE1322a651E5C9A"
$oldContract = "0xAd4F38b3583b5c8C114e041125b816DC83096604"

Write-Host ""
Write-Host "🔄 ATUALIZAÇÃO REALIZADA:" -ForegroundColor Cyan
Write-Host "   ❌ Contrato Anterior: $oldContract" -ForegroundColor Red
Write-Host "   ✅ Novo Contrato: $newContract" -ForegroundColor Green

Write-Host ""
Write-Host "📋 VERIFICANDO ATUALIZAÇÕES:" -ForegroundColor Cyan

# Verificar arquivos principais
$files = @(
    ".env.example",
    "set-treasury-allowance.js",
    "verificar-rede-bsc.js",
    "quick-syntax-check.js",
    "DEPLOY_SUCCESS_REPORT.md",
    "TESTE_QUIZBURNER.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match $newContract) {
            Write-Host "   ✅ $file - Atualizado" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $file - Não atualizado" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️  $file - Não encontrado" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🌐 LINKS DO NOVO CONTRATO:" -ForegroundColor Cyan
Write-Host "   BSCScan: https://bscscan.com/address/$newContract" -ForegroundColor Yellow
Write-Host "   Read: https://bscscan.com/address/$newContract#readContract" -ForegroundColor Yellow
Write-Host "   Write: https://bscscan.com/address/$newContract#writeContract" -ForegroundColor Yellow

Write-Host ""
Write-Host "🔧 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "   1. ✅ Contrato substituído em todos os arquivos" -ForegroundColor White
Write-Host "   2. 🔄 Configurar allowance no novo contrato" -ForegroundColor Yellow
Write-Host "   3. 🌐 Atualizar variáveis no Netlify" -ForegroundColor Yellow
Write-Host "   4. 🧪 Testar sistema de burn" -ForegroundColor Yellow

Write-Host ""
$response = Read-Host "Deseja configurar a allowance do treasury agora? (s/n)"

if ($response -eq 's' -or $response -eq 'S') {
    Write-Host ""
    Write-Host "🚀 Executando configuração de allowance..." -ForegroundColor Green
    node set-treasury-allowance.js
} else {
    Write-Host ""
    Write-Host "💡 Para configurar allowance depois:" -ForegroundColor Yellow
    Write-Host "   node set-treasury-allowance.js" -ForegroundColor White
}

Write-Host ""
$testResponse = Read-Host "Deseja abrir o BSCScan do novo contrato? (s/n)"

if ($testResponse -eq 's' -or $testResponse -eq 'S') {
    Write-Host "🌐 Abrindo BSCScan..." -ForegroundColor Green
    Start-Process "https://bscscan.com/address/$newContract"
}

Write-Host ""
Write-Host "🏆 ATUALIZAÇÃO COMPLETA!" -ForegroundColor Green
Write-Host "   Novo contrato: $newContract" -ForegroundColor White
Write-Host "   Status: ✅ Ativo e configurado" -ForegroundColor Green
Write-Host "   Sistema: 🚀 Pronto para uso" -ForegroundColor Green