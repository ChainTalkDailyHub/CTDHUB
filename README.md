# 🚀 CTD HUB - Web3 Learning Ecosystem

[![Deploy Status](https://api.netlify.com/api/v1/badges/687f2b27-768f-0513-1458-9568e8f9c123/deploy-status)](https://app.netlify.com/sites/extraordinary-treacle-1bc552/deploys)
[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://extraordinary-treacle-1bc552.netlify.app/)

**CTD HUB** is a comprehensive educational platform focused on Web3 and blockchain development, specifically optimized for the BNB Chain ecosystem. The platform offers interactive courses, adaptive assessments, and AI-powered tools to accelerate blockchain development learning.

## ✨ Key Features

### 🎓 Course Management System
- **Creator Studio**: Complete interface for course creation and management
- **Video Player**: YouTube integration for educational content
- **Comment System**: Interaction between students and instructors
- **Data Persistence**: Supabase integration for automatic backup

### 🤖 Binno AI - Intelligent Assistant
- **Web3 Advisor**: AI specialized in blockchain and DeFi
- **Interactive Chat**: Real-time support for developers
- **Project Analysis**: Intelligent evaluation of Web3 ideas

### 🧭 Skill Compass - Adaptive Assessment
- **Intelligent Questionnaire**: 30 adaptive questions based on previous responses
- **Project Focus**: First question collects detailed project information (name, tokens, network, category)
- **PDF Reports**: Complete exportable analysis
- **Personalized Recommendations**: Next steps based on knowledge level

### 🔧 Advanced Tools
- **Data Migration Center**: Protection against data loss during updates
- **User Profiles**: Complete profile system with Web3 experience tracking
- **Quiz Modules**: Blockchain knowledge tests
- **Wallet Integration**: Web3 wallet connectivity

### 🔥 QuizBurner System - NEW!
- **Smart Contract Integration**: Public blockchain proof for token burns
- **Eligibility Verification**: On-chain verification before burning
- **Multi-Network Support**: BSC mainnet, opBNB, and testnets
- **Public Transparency**: All burns recorded with verifiable events
- **Gas Optimized**: Efficient contract design for minimal transaction costs

## 🛠 Technology Stack

### Frontend
- **Next.js 14.2.5** - React framework with SSG/SSR
- **TypeScript** - Static typing for enhanced reliability
- **TailwindCSS** - Modern design system with dark/neon theme
- **React Hooks** - Optimized state management

### Backend & Infrastructure
- **Netlify Functions** - Serverless backend with TypeScript
- **Supabase PostgreSQL** - Relational database with automatic APIs
- **OpenAI API** - GPT-4 integration for AI functionalities
- **Netlify Hosting** - Automatic deployment with global CDN

### Blockchain & Smart Contracts
- **Hardhat Framework** - Smart contract development and deployment
- **Ethers.js 6.13.0** - Blockchain interaction library
- **OpenZeppelin Contracts** - Security-audited smart contract components
- **QuizBurner Contract** - Custom burning mechanism with public proof

### Integrations
- **Web3 Wallets** - MetaMask and other wallet support
- **YouTube API** - Video embedding and management
- **GitHub Actions** - Automated CI/CD
- **BSCScan API** - Contract verification and monitoring
- **PDF Generation** - Exportable reports

## 📋 Project Structure

```
ctdhub-rebuild/
├── 📁 components/          # Reusable React components
│   ├── CourseCard.tsx     # Course display card
│   ├── Header.tsx         # Main navigation
│   ├── UserMenu.tsx       # User profile menu
│   └── ...
├── 📁 pages/              # Next.js pages
│   ├── index.tsx          # Homepage
│   ├── courses/           # Course system
│   ├── binno-ai/          # AI Assistant
│   ├── questionnaire.tsx  # Skill Compass
│   └── data-migration.tsx # Migration center
├── 📁 netlify/functions/  # Serverless Functions
│   ├── course-manager.ts  # Course management
│   ├── user-profiles.ts   # Profile system
│   ├── binno-*.ts         # AI functionalities
│   └── data-migration.ts  # Data backup
├── 📁 lib/                # Utilities and business logic
│   ├── supabase.ts        # Supabase client
│   ├── binno-questionnaire.ts # AI for questionnaires
│   └── courses-storage.ts # Course management
└── 📁 styles/             # Global styling
    └── globals.css        # TailwindCSS + customizations
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional)
- OpenAI API Key (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/wallisson-ctd/CTDHUB.git
cd CTDHUB
```

2. **Install dependencies**
```bash
npm install
```

3. **Quick Setup (Recommended)**
```bash
# Automated configuration for QuizBurner
node setup-quizburner.js
```

4. **Manual Configuration** (Alternative)
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
# - Supabase credentials
# - OpenAI API key
# - Blockchain private keys
# - Contract addresses
```

5. **Deploy QuizBurner Smart Contract** (Optional)
```bash
# Install Hardhat dependencies
npm install

# Deploy to BSC mainnet
npm run deploy:bsc

# Verify contract
npm run verify:bsc
```

6. **Run development server**
```bash
npm run dev
```

7. **Access locally**
```
http://localhost:3000
```

## 📊 Database (Supabase)

### Main Tables

```sql
-- Courses
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  author TEXT NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Course Videos
CREATE TABLE course_videos (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  thumbnail TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comments
CREATE TABLE video_comments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  user_address TEXT NOT NULL,
  user_name TEXT,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  name TEXT,
  profession TEXT,
  web3_experience TEXT CHECK (web3_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
  project_name TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🌐 Deployment

### Netlify (Recommended)

1. **Configure on Netlify**
```bash
# Build Command
npm run netlify:build

# Publish Directory
out

# Environment Variables
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
OPENAI_API_KEY=your_openai_key
```

2. **Automatic deployment**
```bash
# Connect your GitHub repository to Netlify
# Commits to main branch deploy automatically
```

### Useful Commands

```bash
# Development
npm run dev

# Local build
npm run build

# Netlify deploy
netlify deploy --prod

# Lint
npm run lint
```

## 🔒 Security & Data Protection

- **Data Migration System**: Automatic protection against data loss
- **Automatic Backup**: Real-time Supabase synchronization
- **Input Validation**: User data sanitization
- **CORS Protection**: Configured security headers
- **Environment Variables**: Protected sensitive keys

## 📈 Roadmap

### In Development
- [ ] NFT certifications for course completion
- [ ] Course marketplace with crypto payments
- [ ] Integration with more blockchains (Ethereum, Polygon)
- [ ] Gamification with point system
- [ ] Native mobile app

### Planned Features
- [ ] Live streaming for live classes
- [ ] Developer collaboration tools
- [ ] Public API for developers
- [ ] VS Code plugin
- [ ] Discord/Telegram integration

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development**: CTDHUB Team
- **Design**: Web3-focused UI/UX
- **AI & Backend**: OpenAI + Supabase Integration

## � Contact

- **Website**: [https://extraordinary-treacle-1bc552.netlify.app/](https://extraordinary-treacle-1bc552.netlify.app/)
- **GitHub**: [https://github.com/wallisson-ctd/CTDHUB](https://github.com/wallisson-ctd/CTDHUB)

---

**CTDHUB** - Transforming Web3 education with AI and cutting-edge technology 🚀

*Built with ❤️ for the blockchain community*
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

### Frontend Development
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificação de código
npm run type-check   # Verificação TypeScript
```

### QuizBurner Smart Contract
```bash
# Setup and Configuration
node setup-quizburner.js      # Automated setup wizard

# Hardhat Development
npm run compile               # Compile smart contracts
npm run test:hardhat         # Run contract tests
npx hardhat node            # Local blockchain network

# Deployment Scripts
npm run deploy:bsc           # Deploy to BSC mainnet
npm run deploy:opbnb         # Deploy to opBNB mainnet
npm run deploy:testnet       # Deploy to BSC testnet
npm run deploy:local         # Deploy to local network

# Contract Verification
npm run verify:bsc           # Verify on BSCScan
npm run verify:opbnb         # Verify on opBNBScan
npm run verify:testnet       # Verify on testnet

# Treasury Management
npm run treasury:approve     # Approve QuizBurner for token spending
npm run treasury:balance     # Check treasury balance
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
│   ├── BurnBadge.tsx   # Badge de queima com proof blockchain
│   └── ContractAnalyzer.tsx # Analisador de contratos
├── contracts/          # Smart Contracts (NEW!)
│   ├── QuizBurner.sol  # Contract de queima com proof público
│   └── interfaces/     # Interfaces dos contratos
├── scripts/            # Scripts de deploy Hardhat
│   ├── deploy-quizburner.ts # Deploy automatizado
│   ├── verify-quizburner.ts # Verificação no explorer
│   └── treasury-approve.ts  # Aprovação do treasury
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

## 🎨 Padrões de Design

### Logo Oficial
- **Arquivo único:** `public/images/CTDHUB.png`
- **Uso obrigatório:** SEMPRE usar CTDHUB.png como primeira e única opção
- **Fallback:** Apenas texto "CTD HUB" se a imagem falhar
- **Dimensões:** Manter proporção original (variável por contexto)

### Referências corretas:
```tsx
// ✅ Correto - Header/Footer
<img src="/images/CTDHUB.png" alt="CTDHUB" />

// ✅ Correto - APIs/PDFs  
const logoPath = path.join(process.cwd(), 'public', 'images', 'CTDHUB.png')

// ✅ Correto - Fallback
onError={() => setText("CTD HUB")}
```

---

**CTDHub Platform** - Educação blockchain de qualidade com tecnologia moderna 🚀# Deploy trigger 10/08/2025 17:53:32
