# 🚀 CTDHUB - Guia de Deploy

## Opções de Deploy

### 1. Vercel (Recomendada - GRATUITA)

#### Deploy Automático via GitHub:
1. Faça push do código para GitHub
2. Conecte sua conta GitHub na Vercel
3. Importe o repositório
4. Configure as variáveis de ambiente
5. Deploy automático!

#### Deploy via CLI:
```bash
# 1. Login na Vercel
vercel login

# 2. Deploy de teste
npm run preview

# 3. Deploy de produção
npm run deploy
```

#### Configuração de Variáveis de Ambiente na Vercel:
No dashboard da Vercel, vá em Settings → Environment Variables e adicione:

```
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_CTD_TOKEN_ADDRESS=seu_endereco_token
NEXT_PUBLIC_PREMIUM_NFT_ADDRESS=seu_endereco_nft
NEXT_PUBLIC_CERTIFICATE_ADDRESS=seu_endereco_certificado
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=seu_project_id
JWT_SECRET=seu_jwt_secret_super_seguro
OPENAI_API_KEY=sua_openai_key (se usar)
```

### 2. Netlify (Alternativa GRATUITA)

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Build do projeto
npm run build

# 3. Deploy
netlify deploy --prod --dir=.next
```

### 3. DigitalOcean App Platform

1. Conecte seu GitHub
2. Selecione o repositório
3. Configure as variáveis de ambiente
4. Deploy automático

### 4. Railway (GRATUITA com $5 de crédito)

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up
```

## Preparação Pré-Deploy

### 1. Teste Local de Produção:
```bash
npm run build
npm start
```

### 2. Configurações Importantes:

#### next.config.js - Otimizado para Produção:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Para containers
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig
```

## Domínio Personalizado

### Vercel:
1. Vá em Settings → Domains
2. Adicione seu domínio
3. Configure DNS (CNAME ou A record)

### Namecheap/GoDaddy DNS:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

## Monitoramento

### Analytics Recomendados:
- Vercel Analytics (nativo)
- Google Analytics 4
- PostHog (open-source)

### Performance:
- Vercel Speed Insights
- Lighthouse CI

## Segurança

### Headers de Segurança (next.config.js):
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

## Custos Estimados

| Plataforma | Tier Gratuito | Tier Pago |
|-----------|---------------|-----------|
| **Vercel** | ✅ Hobby (100GB/mês) | Pro $20/mês |
| **Netlify** | ✅ Starter (100GB/mês) | Pro $19/mês |
| **Railway** | ✅ $5 crédito | $5+/mês |
| **DigitalOcean** | ❌ | $12+/mês |

## Recomendação Final

**Para CTDHUB, recomendo VERCEL:**
- ✅ Gratuita para projetos como o seu
- ✅ Deploy automático via Git
- ✅ CDN global
- ✅ Otimizada para Next.js
- ✅ SSL automático
- ✅ Preview deployments
- ✅ Analytics integrado

## Próximos Passos

1. **Faça backup do código atual**
2. **Suba para GitHub**
3. **Configure Vercel**
4. **Adicione domínio personalizado**
5. **Configure analytics**
6. **Teste performance**
7. **🎉 CTDHUB no ar!**