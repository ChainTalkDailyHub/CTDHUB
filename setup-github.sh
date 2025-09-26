#!/bin/bash

# 🚀 CTDHUB GitHub Setup Script
echo "🚀 Configurando repositório GitHub para CTDHUB Platform..."

# Verificar se GitHub CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI não encontrado. Instale em: https://cli.github.com/"
    echo "📝 Ou siga os passos manuais abaixo:"
    echo ""
    echo "1. Vá para https://github.com/new"
    echo "2. Nome: ctdhub-platform"
    echo "3. Descrição: Modern blockchain learning platform built with Next.js 14"
    echo "4. Público ✅"
    echo "5. Não inicialize com README (já temos um)"
    echo "6. Clique 'Create repository'"
    echo ""
    echo "7. Execute estes comandos:"
    echo "   git remote add origin https://github.com/SEU_USUARIO/ctdhub-platform.git"
    echo "   git push -u origin master"
    echo ""
    echo "8. Configure Vercel:"
    echo "   - Vá para https://vercel.com"
    echo "   - Import Git Repository"
    echo "   - Selecione ctdhub-platform"
    echo "   - Configure variáveis de ambiente (.env.production)"
    echo "   - Deploy! 🚀"
    exit 1
fi

# Criar repositório via GitHub CLI
echo "📝 Criando repositório no GitHub..."
gh repo create ctdhub-platform --public --description "Modern blockchain learning platform built with Next.js 14" --source=. --remote=origin --push

echo "✅ Repositório criado com sucesso!"
echo ""
echo "🔗 Próximos passos:"
echo "1. Acesse: https://github.com/$(gh api user --jq .login)/ctdhub-platform"
echo "2. Configure Vercel: https://vercel.com"
echo "3. Import Git Repository"
echo "4. Configure environment variables"
echo "5. Deploy automático! 🚀"
echo ""
echo "📱 URLs importantes:"
echo "- Repository: https://github.com/$(gh api user --jq .login)/ctdhub-platform"
echo "- Vercel Deploy: https://vercel.com/new/clone?repository-url=https://github.com/$(gh api user --jq .login)/ctdhub-platform"