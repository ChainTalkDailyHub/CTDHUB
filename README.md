# CTDHub Platform - Rebuild

Uma plataforma educacional blockchain moderna construída com Next.js 14, React 18 e integração BSC.

## 🚀 Características Principais

- **Autenticação Web3**: Login via MetaMask com suporte BSC
- **Sistema de Cursos**: 10 módulos educacionais sobre blockchain
- **Quiz Inteligente**: Sistema de perguntas com distribuição balanceada
- **Auto-Burn**: Mecanismo automático de queima de tokens
- **Binno AI**: Assistente IA integrado para dúvidas blockchain
- **Área Desenvolvedores**: Ferramentas de debug e análise

## 🛠 Stack Tecnológica

- **Frontend**: Next.js 14.2.5, React 18, TypeScript
- **Styling**: Tailwind CSS 3.4.1
- **Blockchain**: Ethers.js v6, Binance Smart Chain
- **UI/UX**: Tema escuro (preto/amarelo)
- **Storage**: localStorage para progresso e configurações

## 📦 Instalação

### 1. Clone e Instale

```bash
cd ctdhub-rebuild
npm install
```

### 2. Configuração do Ambiente

Crie um arquivo `.env.local`:

```env
# Blockchain Configuration
BSC_RPC_URL=https://bsc-dataseed.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
PRIVATE_KEY=sua_chave_privada_aqui

# AI Configuration  
AI_API_KEY=sua_chave_api_ia_aqui

# Contract Addresses (BSC Mainnet)
CTD_TOKEN_ADDRESS=0x...
CTD_PREMIUM_NFT_ADDRESS=0x...
CTD_CERT_ADDRESS=0x...

# Development
NODE_ENV=development
NEXT_PUBLIC_CHAIN_ID=56
```

### 3. Execute o Projeto

```bash
npm run dev
```

Acesse `http://localhost:3000`

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificação de código
npm run type-check   # Verificação TypeScript
```

## 📁 Estrutura do Projeto

```
ctdhub-rebuild/
├── components/          # Componentes React
│   ├── Header.tsx      # Cabeçalho principal
│   ├── Footer.tsx      # Rodapé
│   ├── WalletButton.tsx # Botão de conexão wallet
│   ├── CourseCard.tsx  # Card de curso
│   ├── QuizQuestion.tsx # Componente de pergunta
│   ├── BurnBadge.tsx   # Badge de queima de tokens
│   └── ContractAnalyzer.tsx # Analisador de contratos
├── pages/              # Páginas Next.js
│   ├── index.tsx       # Página inicial
│   ├── courses/        # Sistema de cursos
│   ├── quiz/          # Sistema de quiz
│   ├── binno-ai/      # Chat com IA
│   ├── developer/     # Área de desenvolvimento
│   └── api/           # API routes
├── lib/               # Utilitários e serviços
│   ├── ethers-bsc.ts  # Integração BSC
│   ├── quizPattern.ts # Padrão de distribuição quiz
│   └── storage.ts     # Gerenciamento localStorage
├── types/             # Definições TypeScript
└── styles/           # Estilos globais
```

## 🎯 Funcionalidades Detalhadas

### Sistema de Quiz
- **10 Módulos**: Cada um com 10 perguntas
- **Distribuição Balanceada**: A B C D → B C D A → C D A B
- **Progresso Persistente**: Salvamento automático no localStorage
- **Scoring Inteligente**: Cálculo de pontuação por módulo e total

### Integração Blockchain
- **BSC Network**: Suporte completo Binance Smart Chain
- **MetaMask**: Conexão via Web3 provider
- **Auto-Burn**: Queima automática de tokens ao completar quiz
- **Token Management**: Verificação de saldo e transações

### Binno AI
- **Chat Interativo**: Interface de conversação em tempo real
- **Conhecimento Blockchain**: Especializado em Web3, DeFi, Smart Contracts
- **Histórico**: Manutenção do histórico de conversas
- **API Integrada**: Conexão com serviços de IA externos

### Área de Desenvolvimento
- **Debug Tools**: Ferramentas de depuração e teste
- **Contract Analyzer**: Análise de contratos inteligentes
- **Progress Management**: Exportar/importar progresso
- **Environment Info**: Informações do ambiente e configuração

## 🔐 Configuração Blockchain

### MetaMask Setup
1. Instale a extensão MetaMask
2. Configure a rede BSC:
   - **Nome**: Binance Smart Chain
   - **RPC URL**: https://bsc-dataseed.binance.org/
   - **Chain ID**: 56
   - **Símbolo**: BNB
   - **Explorer**: https://bscscan.com

### Testnet (Desenvolvimento)
- **Chain ID**: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Faucet**: https://testnet.binance.org/faucet-smart

## 🎨 Design System

### Cores Principais
- **Background**: `#000000` (Preto)
- **Primary**: `#EAB308` (Amarelo 500)
- **Secondary**: `#1F2937` (Cinza 800)
- **Text**: `#F59E0B` (Amarelo 400)
- **Muted**: `#6B7280` (Cinza 500)

### Componentes
- **Cards**: Bordas arredondadas, sombra sutil
- **Buttons**: Hover effects, transições suaves
- **Forms**: Inputs escuros com borda amarela
- **Layout**: Grid responsivo, mobile-first

## 🔄 Fluxo de Usuário

1. **Landing Page**: Apresentação e call-to-action
2. **Wallet Connection**: Conectar MetaMask
3. **Course Selection**: Escolher módulo para estudar
4. **Quiz Completion**: Responder perguntas do módulo
5. **Auto-Burn**: Queima automática após conclusão
6. **AI Assistant**: Tirar dúvidas com Binno AI
7. **Progress Tracking**: Acompanhar evolução

## 🧪 Desenvolvimento

### Comandos Úteis
```bash
# Verificar tipos TypeScript
npm run type-check

# Análise de código
npm run lint

# Build e teste
npm run build && npm start
```

### Debug
- Use a página `/developer` para ferramentas de debug
- Logs detalhados no console do navegador
- LocalStorage inspector para dados persistidos

## 📚 API Endpoints

```
GET /api/courses         # Lista de cursos
GET /api/quiz/[module]   # Perguntas do módulo
POST /api/ai/chat        # Chat com Binno AI
POST /api/burn          # Executar queima de tokens
```

## 🛡 Segurança

- **Chaves Privadas**: Nunca commitadas, apenas em .env
- **Validação**: Input sanitization em todas APIs
- **Rate Limiting**: Proteção contra spam de requisições
- **Audit**: Contratos auditados antes do deploy

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Configuração de Produção
- Configure variáveis de ambiente no painel Vercel
- Ative SSL/HTTPS
- Configure domínio customizado
- Monitore performance e logs

## 📞 Suporte

Para dúvidas e suporte:
- **GitHub Issues**: Reporte bugs e sugestões
- **Discord**: Comunidade CTDHub
- **Email**: support@ctdhub.com

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**CTDHub Platform** - Educação blockchain de qualidade com tecnologia moderna 🚀