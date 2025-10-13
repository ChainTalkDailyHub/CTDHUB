# 🔥 CTD Quiz Burner - Sistema de Queima de Alta Segurança

## 📋 Visão Geral

O **CTDQuizBurner** é um smart contract de alta segurança para queimar tokens CTD após completar questionários na plataforma CTDHUB. 

### ✨ Características Principais

- 🔒 **Alta Segurança**: ReentrancyGuard, Pausable, Ownable
- 🎯 **Uma Queima por Usuário**: Sistema de controle rígido
- 💰 **Tokens do Projeto**: Queima tokens da carteira do projeto, usuário paga apenas gas
- 🔄 **Múltiplas Execuções**: Suporta queimas simultâneas de vários usuários
- 📊 **Rastreabilidade**: Registros completos de todas as queimas
- ⚡ **API v2 Etherscan**: Verificação usando API mais recente

## 🏗️ Arquitetura

```
📁 blockchain/
├── 📁 contracts/           # Smart contracts
│   ├── CTDQuizBurner.sol   # Contrato principal
│   └── MockERC20.sol       # Mock para testes
├── 📁 scripts/             # Scripts de deploy e gestão
│   ├── deploy-quiz-burner.js    # Deploy do contrato
│   ├── setup-allowance.js       # Configurar allowance
│   ├── verify-contract.js       # Verificação BSCScan
│   └── test-complete-flow.js    # Teste integrado
├── 📁 tests/               # Testes unitários
│   └── CTDQuizBurner.test.js
└── deployment-info.json    # Info do último deploy
```

## 🚀 Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Ambiente

Certifique-se que o `.env.local` tem:

```bash
# Blockchain
ADMIN_PRIVATE_KEY=sua_private_key_aqui
CTD_TOKEN_ADDRESS=0x7f890a4a575558307826C82e4cb6E671f3178bfc
PROJECT_TREASURY_ADDRESS=0x27f79d0a52F88D04e1d04875Fe55d6C23f514Ec4

# API Keys
ETHERSCAN_API_KEY=MGMTWJN7YCWA54BWYY1E29MAADNK5HKNGK
BSCSCAN_API_KEY=1A8YXSRK5VIPP3IQN3RYA4K2HVXH81MM4E
```

### 3. Compilar Contratos

```bash
npm run hardhat:compile
```

## 📦 Deploy

### Deploy na BSC Mainnet

```bash
npm run deploy:burner
```

### Deploy na BSC Testnet

```bash
npm run deploy:burner:testnet
```

### Deploy Local (para testes)

```bash
# Terminal 1 - Iniciar node local
npm run hardhat:node

# Terminal 2 - Deploy local
npm run deploy:burner:local
```

## ⚙️ Configuração Pós-Deploy

### 1. Configurar Allowance do Treasury

```bash
npm run setup:allowance
```

### 2. Verificar Contrato

```bash
npm run verify:contract
```

### 3. Atualizar .env.local

Após o deploy, atualize o `.env.local` com o novo endereço:

```bash
QUIZ_BURNER_ADDRESS=endereco_do_contrato_deployado
NEXT_PUBLIC_QUIZ_BURNER_ADDRESS=endereco_do_contrato_deployado
```

## 🧪 Testes

### Testes Unitários

```bash
npm run test:burner
```

### Teste de Fluxo Completo

```bash
npm run test:flow
```

### Teste com Múltiplos Usuários

```bash
npm run test:multi
```

### Testes Locais (Hardhat Network)

```bash
npm run hardhat:test
```

## 🔧 Como Funciona

### 1. Pré-requisitos

- Usuário completa questionário na plataforma
- Treasury tem saldo suficiente de tokens CTD
- Treasury aprovou allowance para o contrato

### 2. Processo de Queima

```solidity
function burnQuizTokens(string memory quizId) external {
    // 1. Verificações de segurança
    // 2. Transfere tokens do treasury para address(0)
    // 3. Registra usuário como completado
    // 4. Emite evento QuizCompleted
}
```

### 3. Verificações de Segurança

- ✅ Usuário não completou quiz antes
- ✅ Quiz ID não foi usado antes
- ✅ Contrato não está pausado
- ✅ Treasury tem allowance suficiente
- ✅ Treasury tem saldo suficiente
- ✅ Proteção contra reentrância

## 📊 Funções Principais

### Para Usuários

```solidity
// Queimar tokens após completar quiz
burnQuizTokens(string quizId)

// Verificar se pode fazer queima
canBurnTokens(address user) returns (bool, string)

// Ver informações do usuário
getUserInfo(address user) returns (bool, uint256, uint256, string)
```

### Para Consultas

```solidity
// Estatísticas gerais
getStats() returns (uint256 totalBurned, uint256 totalUsers, uint256 treasuryBalance, uint256 allowance)

// Lista de usuários que fizeram queima
getBurnersList(uint256 offset, uint256 limit) returns (address[], uint256)
```

### Para Administrador

```solidity
// Pausar/despausar contrato
togglePause()

// Retirada de emergência
emergencyWithdraw(address token, uint256 amount, address to)
```

## 🔍 Verificação e Monitoramento

### BSCScan

Após deploy, o contrato pode ser verificado em:
- https://bscscan.com/address/ENDERECO_DO_CONTRATO

### Eventos Importantes

```solidity
event QuizCompleted(address indexed user, uint256 amount, string quizId, uint256 timestamp);
event EmergencyWithdraw(address indexed token, uint256 amount, address indexed to);
```

### Logs e Debugging

```bash
# Ver logs do último deploy
cat blockchain/deployment-info.json

# Verificar status atual
npm run verify:contract

# Testar fluxo completo
npm run test:flow
```

## 🛡️ Segurança

### Recursos de Segurança

1. **ReentrancyGuard**: Previne ataques de reentrância
2. **Pausable**: Permite pausar em emergências
3. **Ownable**: Controle de acesso administrativo
4. **Validações rigorosas**: Múltiplas verificações antes da execução

### Boas Práticas Implementadas

- ✅ Checks-Effects-Interactions pattern
- ✅ Validação de parâmetros de entrada
- ✅ Eventos para todas as ações importantes
- ✅ Função de emergência para casos críticos
- ✅ Limites de gas otimizados

## 🔧 Troubleshooting

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `Quiz ja completado anteriormente` | Usuário já fez queima | Normal - cada usuário pode queimar apenas uma vez |
| `Allowance insuficiente do treasury` | Treasury não aprovou tokens | Execute `npm run setup:allowance` |
| `Saldo insuficiente no treasury` | Treasury sem tokens CTD | Transferir tokens para treasury |
| `Contrato pausado` | Admin pausou contrato | Contactar administrador |

### Diagnósticos

```bash
# Verificar status completo
npm run test:flow

# Verificar apenas allowance
npm run setup:allowance

# Verificar contrato no BSCScan
npm run verify:contract
```

## 📈 Estatísticas de Gas

| Função | Gas Estimado | Custo BNB (~$300) |
|--------|--------------|-------------------|
| `burnQuizTokens` | ~80,000 | ~$0.48 |
| `canBurnTokens` | ~15,000 | ~$0.09 |
| `getUserInfo` | ~5,000 | ~$0.03 |

## 🔄 Atualizações

Para atualizar o contrato:

1. Fazer backup do arquivo `deployment-info.json`
2. Deploy nova versão
3. Executar `setup:allowance`
4. Atualizar `.env.local`
5. Testar com `test:flow`

## 📞 Suporte

Para questões sobre o contrato:

1. Verificar este README
2. Executar `npm run test:flow` para diagnóstico
3. Verificar logs em `blockchain/deployment-info.json`
4. Contactar equipe de desenvolvimento

---

**⚠️ IMPORTANTE**: Este contrato lida com tokens de valor. Sempre teste em testnet antes de usar em produção!