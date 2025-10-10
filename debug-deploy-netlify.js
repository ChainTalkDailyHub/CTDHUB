#!/usr/bin/env node

// Debug Deploy Netlify
// Identifica possíveis problemas no deploy

console.log('🔧 Debug Deploy Netlify - Análise de Problemas');
console.log('=' .repeat(60));

console.log('\n📍 Status Atual:');
console.log('   ❌ Site retornando 404');
console.log('   ❌ Functions não acessíveis');
console.log('   ✅ Código foi pushed para GitHub');
console.log('   ✅ Build local funcionando');

console.log('\n📍 Possíveis Causas do Problema:');

const possibleIssues = [
  {
    issue: 'Deploy ainda processando',
    solution: 'Aguardar mais tempo (5-10 minutos)',
    probability: 'Alta'
  },
  {
    issue: 'Site Netlify não conectado ao repositório',
    solution: 'Conectar repositório no dashboard Netlify',
    probability: 'Alta'
  },
  {
    issue: 'Configuração de build incorreta',
    solution: 'Verificar netlify.toml e package.json',
    probability: 'Média'
  },
  {
    issue: 'Environment variables não configuradas',
    solution: 'Configurar OPENAI_API_KEY, SUPABASE_URL, etc.',
    probability: 'Média'
  },
  {
    issue: 'Branch incorreta no Netlify',
    solution: 'Configurar deploy branch como "main"',
    probability: 'Baixa'
  },
  {
    issue: 'Falha no build',
    solution: 'Verificar logs de build no dashboard',
    probability: 'Baixa'
  }
];

possibleIssues.forEach((item, index) => {
  console.log(`\n   ${index + 1}. ${item.issue} (${item.probability}):`);
  console.log(`      Solução: ${item.solution}`);
});

console.log('\n📍 Configuração Atual do Projeto:');

const config = {
  'Build Command': 'npm run netlify:build',
  'Publish Directory': 'out',
  'Functions Directory': 'netlify/functions',
  'Node Version': '18',
  'Repository': 'https://github.com/wallisson-ctd/CTDHUB.git',
  'Branch': 'main',
  'Latest Commit': 'f1a5e5c - Sistema de proteção contra tradução'
};

Object.entries(config).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});

console.log('\n📍 Verificação de Arquivos Críticos:');

const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'netlify.toml',
  'package.json', 
  'next.config.js',
  'netlify/functions/binno-generate-question.ts',
  'pages/questionnaire.tsx'
];

criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n📍 Passos para Resolver:');

const steps = [
  'Acessar dashboard do Netlify (app.netlify.com)',
  'Verificar se site está conectado ao repositório',
  'Confirmar branch de deploy está como "main"',
  'Verificar logs de build na aba "Deploys"',
  'Configurar environment variables se necessário',
  'Fazer manual deploy se automático falhou',
  'Verificar se domínio está configurado corretamente'
];

steps.forEach((step, index) => {
  console.log(`   ${index + 1}. ${step}`);
});

console.log('\n📍 Comandos para Debug Local:');
console.log(`
   Teste build local:
   npm run netlify:build
   
   Teste com functions:
   npm run netlify:dev
   
   Verificar configuração:
   cat netlify.toml
   cat package.json | grep scripts
   
   Check GitHub:
   git log --oneline -5
   git status
`);

console.log('\n📍 URLs para Verificar:');
console.log('   🌐 GitHub Repo: https://github.com/wallisson-ctd/CTDHUB');
console.log('   🚀 Netlify Dashboard: https://app.netlify.com');
console.log('   📊 Deploy Logs: Netlify Dashboard > Deploys > [Latest Deploy]');

console.log('\n📍 Deploy Manual (se necessário):');
console.log(`
   Se deploy automático falhou:
   
   1. No dashboard Netlify:
      - Sites > [Seu Site] > Deploys
      - Click "Trigger deploy" > "Deploy site"
   
   2. Ou via CLI (se instalado):
      - netlify deploy --prod --dir=out
`);

console.log('\n' + '='.repeat(60));
console.log('🔧 PRÓXIMA AÇÃO RECOMENDADA:');
console.log('📊 Verificar dashboard Netlify para status do deploy');
console.log('⏱️  Se ainda processando, aguardar mais 5-10 minutos');
console.log('🔗 Se não conectado, conectar repositório GitHub');
console.log('=' .repeat(60));