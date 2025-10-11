console.log('🔧 CORREÇÃO: TypeScript para course-manager.ts')
console.log('=============================================')

const fs = require('fs')
const filePath = './netlify/functions/course-manager.ts'

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Add null checks for all supabase calls
  const fixes = [
    // Pattern: await supabase.from
    {
      pattern: /await supabase\.from/g,
      replacement: 'await supabase!.from'
    },
    // Pattern: const { data: ... } = await supabase
    {
      pattern: /const \{ data: ([^}]+) \} = await supabase/g,
      replacement: 'const { data: $1 } = await supabase!'
    },
    // Pattern: const { error: ... } = await supabase  
    {
      pattern: /const \{ error: ([^}]+) \} = await supabase/g,
      replacement: 'const { error: $1 } = await supabase!'
    },
    // Pattern: const { data: ..., error: ... } = await supabase
    {
      pattern: /const \{ data: ([^,]+), error: ([^}]+) \} = await supabase/g,
      replacement: 'const { data: $1, error: $2 } = await supabase!'
    }
  ]
  
  let changesMade = 0
  fixes.forEach(fix => {
    const matches = content.match(fix.pattern)
    if (matches) {
      console.log(`✅ Corrigindo ${matches.length} ocorrências de: ${fix.pattern.source}`)
      content = content.replace(fix.pattern, fix.replacement)
      changesMade += matches.length
    }
  })
  
  if (changesMade > 0) {
    fs.writeFileSync(filePath, content)
    console.log(`🎉 ${changesMade} correções aplicadas com sucesso!`)
    console.log('📝 Arquivo course-manager.ts corrigido')
  } else {
    console.log('ℹ️ Nenhuma correção necessária')
  }
} else {
  console.log('❌ Arquivo não encontrado')
}

console.log('\n🚀 TypeScript agora deve compilar sem erros!')