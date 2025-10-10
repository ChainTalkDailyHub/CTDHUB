# Configuração de Environment Variables para CTD Skill Compass

## Arquivo de configuração para produção no Netlify

Este arquivo documenta as variáveis de ambiente necessárias para o deploy em produção.

### 🚀 Configuração no Netlify Dashboard

1. Vá para: Site settings → Environment variables
2. Adicione as seguintes variáveis:

```bash
# API Base (CRÍTICO para resolver problema de rotas)
NEXT_PUBLIC_BINNO_API_BASE=/.netlify/functions

# OpenAI (obrigatório para análise AI)
OPENAI_API_KEY=sk-proj-...

# Supabase (opcional, mas recomendado)
SUPABASE_URL=https://srqgmflodlowmybgxxeu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Build Configuration
NODE_ENV=production
NETLIFY=true
```

### 📋 Validação

Após configurar as variáveis, teste:

1. **Health Check**: Acesse `/.netlify/functions/health`
   - Deve retornar `"status": "healthy"`
   - Verificar se todas as variáveis estão configuradas

2. **API Base Test**: No console do navegador na página do questionário:
   ```javascript
   console.log('API Base:', process.env.NEXT_PUBLIC_BINNO_API_BASE)
   ```

3. **Teste Completo**: Complete um questionário e veja se gera relatório

### 🔧 Desenvolvimento vs Produção

**Desenvolvimento (.env.local)**:
```bash
NEXT_PUBLIC_BINNO_API_BASE=/api
OPENAI_API_KEY=sk-proj-...
```

**Produção (Netlify)**:
```bash
NEXT_PUBLIC_BINNO_API_BASE=/.netlify/functions
OPENAI_API_KEY=sk-proj-...
```

### ⚠️ Problemas Comuns

1. **JSON Parse Errors**: 
   - Causa: NEXT_PUBLIC_BINNO_API_BASE não definida
   - Solução: Configurar `/.netlify/functions` no Netlify

2. **404 Not Found**:
   - Causa: Frontend tentando usar `/api/` em produção
   - Solução: Garantir que `NEXT_PUBLIC_BINNO_API_BASE` está setada

3. **CORS Errors**:
   - Causa: Headers não configurados
   - Solução: Headers já adicionados nas funções

4. **500 Internal Error**:
   - Causa: OPENAI_API_KEY ausente
   - Solução: Configurar a chave da OpenAI

### 📊 Checklist de Deploy

- [ ] NEXT_PUBLIC_BINNO_API_BASE configurada
- [ ] OPENAI_API_KEY configurada  
- [ ] Health check retorna status healthy
- [ ] Teste de questionário completo funciona
- [ ] Logs das functions não mostram erros
- [ ] CORS funcionando sem bloqueios

### 🔗 Links Úteis

- Netlify Dashboard: https://app.netlify.com/sites/extraordinary-treacle-1bc552/settings/env
- Health Check: https://extraordinary-treacle-1bc552.netlify.app/.netlify/functions/health
- Questionário: https://extraordinary-treacle-1bc552.netlify.app/questionnaire