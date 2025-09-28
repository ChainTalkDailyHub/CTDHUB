# 🚀 Configuração das Variáveis de Ambiente no Netlify

## 📋 Problema Identificado

O botão "View Course" está mostrando "Course Not Found" porque o sistema está funcionando em ambiente serverless (Netlify) mas as variáveis do Supabase não estão configuradas na produção.

## 🔧 Solução: Configurar Variáveis no Netlify

### 1. **Acesse o Dashboard do Netlify**
- Vá para [https://app.netlify.com](https://app.netlify.com)
- Selecione seu site (extraordinary-treacle-1bc552)

### 2. **Configure as Variáveis de Ambiente**
- No dashboard do site, vá para **Site settings** → **Environment variables**
- Adicione as seguintes variáveis:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://srqgmflodlowmybgxxeu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ
```

### 3. **Deploy Novamente**
Após configurar as variáveis, execute:
```bash
npm run deploy:netlify
```

## 🔍 Como Verificar se Funcionou

1. **Acesse a aplicação**: https://extraordinary-treacle-1bc552.netlify.app
2. **Conecte a carteira** e vá para **Dev Area**
3. **Publique um curso** de teste
4. **Clique em "View Course"** - deve mostrar o curso em vez do erro

## 📊 Fluxo Atual do Sistema

```mermaid
graph TD
    A[Usuario clica 'View Course'] --> B[Chama /api/courses/[id]]
    B --> C{Supabase configurado?}
    C -->|SIM| D[Busca no Supabase]
    C -->|NÃO| E[Busca em arquivo local]
    E --> F[Retorna array vazio em serverless]
    F --> G[Course Not Found]
    D --> H[Retorna curso encontrado]
    H --> I[Exibe página do curso]
```

## 🎯 Benefícios da Configuração

- ✅ Cursos persistem entre deploys
- ✅ Múltiplos usuários podem criar conteúdo
- ✅ Sistema de comentários funcionando
- ✅ Performance melhorada
- ✅ Backup automático dos dados

## 🚨 Importante

Sem as variáveis do Supabase configuradas no Netlify:
- Os cursos não são salvos permanentemente
- "View Course" sempre retorna "Course Not Found"
- Sistema funciona apenas localmente

Com as variáveis configuradas:
- Tudo funciona corretamente em produção
- Dados persistem no banco de dados
- Experiência completa do usuário