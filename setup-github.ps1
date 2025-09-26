# 🚀 CTDHUB GitHub Setup Script (PowerShell)
Write-Host "🚀 Configurando repositório GitHub para CTDHUB Platform..." -ForegroundColor Cyan

# Verificar se GitHub CLI está instalado
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI não encontrado. Vamos usar o método manual..." -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 PASSOS PARA CRIAR REPOSITÓRIO GITHUB:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 🌐 Vá para: https://github.com/new" -ForegroundColor Green
    Write-Host "2. 📝 Nome: ctdhub-platform" -ForegroundColor Green
    Write-Host "3. 📋 Descrição: Modern blockchain learning platform built with Next.js 14" -ForegroundColor Green
    Write-Host "4. 🔓 Público ✅" -ForegroundColor Green
    Write-Host "5. ❌ NÃO inicialize com README (já temos um)" -ForegroundColor Green
    Write-Host "6. 🎯 Clique 'Create repository'" -ForegroundColor Green
    Write-Host ""
    Write-Host "7. 🔗 Execute estes comandos:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/SEU_USUARIO/ctdhub-platform.git" -ForegroundColor White
    Write-Host "   git push -u origin master" -ForegroundColor White
    Write-Host ""
    Write-Host "8. 🚀 Configure Vercel:" -ForegroundColor Yellow
    Write-Host "   - Vá para https://vercel.com" -ForegroundColor White
    Write-Host "   - Clique 'Import Git Repository'" -ForegroundColor White
    Write-Host "   - Selecione 'ctdhub-platform'" -ForegroundColor White
    Write-Host "   - Configure variáveis de ambiente (veja .env.production)" -ForegroundColor White
    Write-Host "   - Deploy automático! 🚀" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Dica: Após o push, o GitHub Actions fará deploy automático!" -ForegroundColor Cyan
    return
}

# Se GitHub CLI estiver disponível
try {
    Write-Host "📝 Criando repositório no GitHub..." -ForegroundColor Yellow
    gh repo create ctdhub-platform --public --description "Modern blockchain learning platform built with Next.js 14" --source=. --remote=origin --push
    
    Write-Host "✅ Repositório criado com sucesso!" -ForegroundColor Green
    
    $username = gh api user --jq .login
    Write-Host ""
    Write-Host "🔗 Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. 🌐 Repository: https://github.com/$username/ctdhub-platform" -ForegroundColor Green
    Write-Host "2. 🚀 Vercel Deploy: https://vercel.com" -ForegroundColor Green
    Write-Host "3. 📥 Import Git Repository" -ForegroundColor Green
    Write-Host "4. ⚙️  Configure environment variables" -ForegroundColor Green
    Write-Host "5. 🎉 Deploy automático!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erro ao criar repositório. Use o método manual acima." -ForegroundColor Red
}