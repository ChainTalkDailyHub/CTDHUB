# 🦎 GeckoTerminal API Integration - Binno AI

## 🎯 Overview

Integração da API pública do GeckoTerminal para trazer dados on-chain em tempo real ao Binno AI, permitindo responder perguntas sobre tokens específicos com informações atualizadas.

## ✨ Features Implementadas

### 1. **Token Search** 🔍
Busca automática de tokens por nome ou símbolo em múltiplas redes:
- BSC (Binance Smart Chain) - prioridade
- Ethereum
- Polygon
- Arbitrum
- Avalanche
- Base

### 2. **Real-Time Data** 📊
Dados on-chain atualizados:
- Preço atual em USD
- Variação de 24h
- Volume de 24h
- Market Cap
- Liquidez em pools principais
- Endereço do contrato
- DEX principal

### 3. **Trending Tokens** 📈
Lista dos tokens em alta na rede:
- Top 5 trending tokens na BSC
- Atualização em tempo real
- Ordenação por volume/atividade

### 4. **Smart Detection** 🧠
Detecção inteligente de queries sobre tokens:
- "What is NAMT token?"
- "Tell me about Namimoto"
- "Check BNB price"
- "USDT token info"
- "Trending tokens"

## 📋 Exemplos de Uso

### Pergunta do Usuário:
```
"what is the Namimoto token?"
```

### Resposta do Binno:
```
🪙 Namimoto (NAMT)

Network: BSC
Contract: 0x1234...5678

Price: $0.0045
24h Change: 📈 +15.32%
24h Volume: $125.5K
Market Cap: $2.3M

Main Pool:
- DEX: PANCAKESWAP
- Liquidity: $450K

💡 Quick Insights:
- This is real-time on-chain data from GeckoTerminal
- Always verify contract addresses before interacting
- DYOR (Do Your Own Research) before investing
```

### Se o token não for encontrado:
```
🔍 I couldn't find a token called NAMT on major networks.

Possible reasons:
- Token might not be listed on DEXs yet
- Name/symbol might be different
- Token might be on a different network

💡 Try:
- Providing the full token name
- Checking the contract address on BscScan
- Asking about popular tokens like BNB, ETH, USDT
```

## 🔧 Arquitetura

### Arquivo Principal: `lib/geckoTerminalAPI.ts`

```typescript
// Principais funções exportadas:

searchToken(query: string): Promise<TokenData | null>
// Busca token por nome/símbolo em múltiplas redes

getTokenByAddress(network: string, address: string): Promise<TokenData | null>
// Busca token por endereço de contrato

getTrendingTokens(network: string, limit: number): Promise<TokenData[]>
// Retorna tokens em alta

detectTokenQuery(message: string): string | null
// Detecta se mensagem pergunta sobre token

formatTokenDataForAI(tokenData: TokenData): string
// Formata dados para resposta legível
```

### Integração: `netlify/functions/ai-chat.ts`

**Fluxo de Execução:**
1. Recebe mensagem do usuário
2. **PRIMEIRO** verifica se é query de token (antes do OpenAI)
3. Se sim, busca dados no GeckoTerminal
4. Formata resposta com dados on-chain
5. Retorna imediatamente (economiza chamada OpenAI)
6. Se não, continua para OpenAI ou respostas estáticas

## 📊 Redes Suportadas

| Rede | ID GeckoTerminal | Prioridade |
|------|------------------|------------|
| BSC | `bsc` | 🥇 Alta |
| Ethereum | `eth` | 🥈 Média |
| Polygon | `polygon_pos` | 🥉 Baixa |
| Arbitrum | `arbitrum` | 🥉 Baixa |
| Avalanche | `avalanche` | 🥉 Baixa |
| Base | `base` | 🥉 Baixa |

## 🎨 Formatação de Respostas

### Elementos visuais:
- 🪙 Emoji de token
- 📈📉➡️ Indicadores de variação de preço
- 💡 Insights e dicas
- ⚠️ Avisos de segurança

### Formatação de números:
- Bilhões: `$2.5B`
- Milhões: `$125.5M`
- Milhares: `$45.2K`
- Pequenos: `$0.0045`

## 🔒 Segurança & Avisos

**Sempre incluído nas respostas:**
```
💡 Quick Insights:
- This is real-time on-chain data from GeckoTerminal
- Always verify contract addresses before interacting
- DYOR (Do Your Own Research) before investing
```

## 📈 Performance

### Otimizações:
1. **Busca em cascata**: Tenta BSC primeiro (mais relevante)
2. **Early return**: Retorna assim que encontra resultado
3. **Cache-friendly**: Dados podem ser cacheados no futuro
4. **Fallback graceful**: Se API falhar, mensagem clara ao usuário

### Tempo de resposta típico:
- Token encontrado: **500-800ms**
- Token não encontrado: **2-3s** (tenta todas as redes)
- Trending tokens: **300-500ms**

## 🚀 Exemplos de Queries Suportadas

### Queries de Token:
- "what is NAMT?"
- "tell me about Namimoto token"
- "check BNB price"
- "USDT token info"
- "information about CAKE"
- "price of ETH"
- "BTC"

### Queries de Trending:
- "trending tokens"
- "hot tokens"
- "popular tokens BSC"
- "top tokens"

## 🔄 Fluxo Completo

```
Usuário: "what is the Namimoto token?"
    ↓
1. detectTokenQuery() → "NAMIMOTO"
    ↓
2. searchToken("NAMIMOTO")
    ↓
3. Busca na BSC → encontrado!
    ↓
4. formatTokenDataForAI(tokenData)
    ↓
5. Adiciona insights de segurança
    ↓
6. Retorna resposta formatada
    ↓
Binno: "🪙 Namimoto (NAMT) ..."
```

## 📝 TODO / Melhorias Futuras

- [ ] Cache de resultados (Redis/Memory)
- [ ] Suporte a mais redes (Solana, Cosmos, etc)
- [ ] Gráficos de preço (via Chart.js)
- [ ] Alerts de preço personalizados
- [ ] Comparação entre tokens
- [ ] Análise de liquidez profunda
- [ ] Detecção de rugpulls/scams
- [ ] Integração com CoinGecko para dados adicionais

## 🐛 Troubleshooting

### API não responde:
```typescript
// Adicionar timeout na chamada:
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)

fetch(url, { signal: controller.signal })
```

### Token não encontrado:
1. Verificar se nome/símbolo está correto
2. Checar se token está em DEX (não CEX)
3. Confirmar rede do token
4. Verificar se tem liquidez mínima

## 📚 Referências

- [GeckoTerminal API Docs](https://www.geckoterminal.com/dex-api)
- [API Base URL](https://api.geckoterminal.com/api/v2)
- [Supported Networks](https://www.geckoterminal.com/dex-api#/networks/get_networks)

---

**Implementado:** 16 de outubro de 2025  
**Status:** ✅ Produção  
**Testado:** Binno AI Chat (/binno-ai)
