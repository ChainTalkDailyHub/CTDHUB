# 🚀 CTDHUB - Deploy no Netlify

## 🌐 Por que Netlify?

- ✅ **Deploy automático** via Git
- ✅ **CDN global** ultrarrápido
- ✅ **SSL automático** e gratuito
- ✅ **Funções serverless** para APIs
- ✅ **Preview deployments** para PRs
- ✅ **Analytics e formas** integrados
- ✅ **100GB bandwidth** gratuito/mês

## 🚀 Método 1: Deploy Direto (MAIS FÁCIL)

### Opção A: Arrastar e Soltar
1. Execute: `npm run netlify:build`
2. Vá para: https://app.netlify.com/drop
3. Arraste a pasta `.next` para o site
4. 🎉 Site no ar instantaneamente!

### Opção B: Netlify CLI
```bash
# 1. Login no Netlify
netlify login

# 2. Build da aplicação
npm run netlify:build

# 3. Deploy direto
netlify deploy --prod --dir=.next
```

## 🔗 Método 2: GitHub + Netlify (RECOMENDADO)

### Passo 1: Subir para GitHub
```bash
# Criar repositório no GitHub primeiro
git remote add origin https://github.com/SEU_USUARIO/ctdhub-platform.git
git push -u origin master
```

### Passo 2: Conectar Netlify
1. 🌐 Acesse: https://app.netlify.com
2. 🔗 Clique: "Import from Git"
3. 📂 Selecione: GitHub → ctdhub-platform
4. ⚙️ Configurações de build:
   - **Build command**: `npm run netlify:build`
   - **Publish directory**: `.next`
   - **Node version**: `18`

### Passo 3: Variáveis de Ambiente
No Netlify Dashboard → Site Settings → Environment Variables:

```bash
# Blockchain
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_CTD_TOKEN_ADDRESS=seu_endereco_token
NEXT_PUBLIC_PREMIUM_NFT_ADDRESS=seu_endereco_nft
NEXT_PUBLIC_CERTIFICATE_ADDRESS=seu_endereco_certificado

# Aplicação
NEXT_PUBLIC_APP_NAME=CTDHUB Platform
NEXT_PUBLIC_APP_VERSION=2.0.0
NETLIFY=true

# Segurança
JWT_SECRET=seu-jwt-secret-super-seguro

# APIs (opcional)
OPENAI_API_KEY=sua-openai-key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=seu-project-id
```

## 🎯 Configurações Avançadas

### Domínio Personalizado
1. Site Settings → Domain management
2. Add custom domain → seu-dominio.com
3. Configure DNS:
   - **CNAME**: `nome-do-site.netlify.app`
   - **A Record**: IP do Netlify (automático)

### Analytics
1. Site Settings → Analytics
2. Enable Netlify Analytics ($9/mês)
3. Ou use Google Analytics (gratuito)

### Funções Serverless
- ✅ Já configuradas em `netlify/functions/`
- ✅ APIs Next.js funcionam automaticamente
- ✅ Suporte a Node.js 18

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento local com Netlify
npm run netlify:dev

# Build otimizado para Netlify
npm run netlify:build

# Deploy de preview
npm run preview:netlify

# Deploy de produção
npm run deploy:netlify
```

## 🚦 Troubleshooting

### Build Falhou?
1. Verifique Node.js version (18+)
2. Execute `npm install` localmente
3. Teste `npm run netlify:build`
4. Verifique logs no Netlify Dashboard

### APIs não funcionam?
1. Verifique `netlify/functions/api.js`
2. Teste funções localmente: `netlify dev`
3. Verifique environment variables

### Images não carregam?
1. Imagens estão em `public/images/`
2. Configuração `unoptimized: true` no Next.js
3. Use caminhos absolutos: `/images/CTDHUB.png` (logo oficial)
4. **IMPORTANTE:** SEMPRE usar `CTDHUB.png` como única logo oficial

## 📊 Comparação: Netlify vs Vercel

| Recurso | Netlify | Vercel |
|---------|---------|---------|
| **Deploy gratuito** | ✅ 100GB | ✅ 100GB |
| **Funções serverless** | ✅ 125k/mês | ✅ 100GB-hrs |
| **Analytics** | 💰 $9/mês | ✅ Gratuito |
| **Forms** | ✅ 100/mês | ❌ |
| **Split Testing** | ✅ | ❌ |
| **Edge Functions** | ✅ | ✅ |
| **Next.js otimizado** | ⚠️ Bom | ✅ Excelente |

## 🎉 Vantagens Específicas do Netlify para CTDHUB

1. **Edge Functions**: Processamento global ultrarrápido
2. **Split Testing**: Teste A/B de features
3. **Forms**: Contato e feedback sem backend
4. **Identity**: Autenticação gerenciada
5. **Analytics**: Insights detalhados de uso

## 🚀 Deploy Rápido (1 Comando)

Para deploy imediato:
```bash
# 1. Login (só uma vez)
netlify login

# 2. Deploy direto
netlify deploy --prod --dir=.next --open
```

## 📱 URLs Importantes

- **Netlify App**: https://app.netlify.com
- **Documentação**: https://docs.netlify.com
- **Status**: https://status.netlify.com
- **Community**: https://community.netlify.com

---

**🎯 Escolha o método que preferir e em poucos minutos o CTDHUB estará online! 🚀**