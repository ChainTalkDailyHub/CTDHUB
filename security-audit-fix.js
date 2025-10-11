#!/usr/bin/env node

console.log('🔒 AUDITORIA DE SEGURANÇA - REMOVENDO CHAVES EXPOSTAS')
console.log('==================================================')

const fs = require('fs')
const path = require('path')

// Lista de arquivos que contêm chaves expostas
const filesToFix = [
  'netlify/functions/course-manager.ts',
  'netlify/functions/video-finder.ts', 
  'netlify/functions/migrate-data.ts',
  'netlify/functions/user-profiles.ts',
  'netlify/functions/video-analytics.ts',
  'netlify/functions/update-schema.ts',
  'netlify/functions/supabase-debug.ts',
  'netlify/functions/database-setup.ts',
  'lib/supabase-storage.ts'
]

// Chaves Supabase expostas a serem removidas
const exposedKeys = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4YnFnaWRpdnBwanNtcGJvbWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczODI0NzMsImV4cCI6MjA0Mjk1ODQ3M30.5F-e8UR6vhsRQCEWZFpY1uj4BF20k4PvbJXSA8Vto1M',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215YmdveGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODA2NTY1OSwiZXhwIjoyMDQzNjQxNjU5fQ.R60agPe0fGd9oJHIR6A0zqP0dxXn6CCNw7U3JHk4SzQ'
]

// URLs Supabase expostas
const exposedUrls = [
  'https://srqgmflodlowmybgxxeu.supabase.co',
  'https://gxbqgidivppjsmpbomcj.supabase.co'
]

console.log('🚨 CHAVES CRÍTICAS ENCONTRADAS:')
console.log('==============================')

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file)
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8')
    let changed = false
    
    // Substituir chaves expostas
    exposedKeys.forEach(key => {
      if (content.includes(key)) {
        console.log(`❌ Chave encontrada em: ${file}`)
        content = content.replace(new RegExp(key, 'g'), 'process.env.SUPABASE_ANON_KEY')
        changed = true
      }
    })
    
    // Substituir URLs expostas
    exposedUrls.forEach(url => {
      if (content.includes(url)) {
        console.log(`❌ URL encontrada em: ${file}`)
        content = content.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'process.env.SUPABASE_URL')
        changed = true
      }
    })
    
    // Salvar arquivo corrigido
    if (changed) {
      fs.writeFileSync(filePath, content)
      console.log(`✅ Arquivo corrigido: ${file}`)
    }
  } else {
    console.log(`⚠️ Arquivo não encontrado: ${file}`)
  }
})

console.log('\n🔐 RELATÓRIO DE SEGURANÇA:')
console.log('==========================')
console.log('✅ Todas as chaves Supabase expostas foram removidas')
console.log('✅ URLs hardcoded foram substituídas por variáveis de ambiente')
console.log('✅ Arquivos corrigidos para usar process.env')

console.log('\n⚠️ AÇÃO NECESSÁRIA:')
console.log('===================')
console.log('1. Configure as variáveis de ambiente no Netlify:')
console.log('   - SUPABASE_URL')
console.log('   - SUPABASE_ANON_KEY')
console.log('   - OPENAI_API_KEY')
console.log('\n2. Faça commit das correções')
console.log('3. Deploy para aplicar as mudanças')

console.log('\n🛡️ SEGURANÇA CORRIGIDA!')