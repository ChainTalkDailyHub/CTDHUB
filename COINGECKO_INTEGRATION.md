# 🦎 CoinGecko API Integration - Comprehensive Token Data

## 🎯 Overview

Integração da **CoinGecko API** (complementar à GeckoTerminal) para fornecer informações **completas e detalhadas** sobre tokens, incluindo:

✅ **Descrição do projeto**  
✅ **Market Cap (capitalização de mercado)**  
✅ **Circulating Supply (tokens em circulação)**  
✅ **Total Supply / Max Supply**  
✅ **Preço atualizado em USD**  
✅ **Volume 24h**  
✅ **Variação de preço (24h e 7d)**  
✅ **Categorias do projeto**  
✅ **Links (Website, Twitter, Telegram)**  

## 🔄 Estratégia de Dupla API

### Fluxo de Busca:
```
Usuário pergunta sobre token
    ↓
1️⃣ CoinGecko API (PRIORIDADE)
   ✅ Descrição do projeto
   ✅ Market Cap
   ✅ Supply completo
   ✅ Preço + Volume
    ↓
2️⃣ GeckoTerminal API (FALLBACK)
   ✅ Dados on-chain (DEX)
   ✅ Liquidez em pools
   ✅ Tokens não listados em CoinGecko
    ↓
3️⃣ Resposta formatada ao usuário
```

## 📊 Comparação: CoinGecko vs GeckoTerminal

| Feature | CoinGecko | GeckoTerminal |
|---------|-----------|---------------|
| **Descrição do projeto** | ✅ Sim | ❌ Não |
| **Market Cap** | ✅ Sim | ⚠️ Parcial |
| **Circulating Supply** | ✅ Sim | ❌ Não |
| **Total/Max Supply** | ✅ Sim | ❌ Não |
| **Preço USD** | ✅ Sim | ✅ Sim |
| **Volume 24h** | ✅ Sim | ✅ Sim |
| **Liquidez DEX** | ❌ Não | ✅ Sim |
| **Tokens pequenos** | ⚠️ Poucos | ✅ Muitos |
| **Links sociais** | ✅ Sim | ❌ Não |
| **Categorias** | ✅ Sim | ❌ Não |

## 📋 Exemplo de Resposta Completa

### Pergunta:
```
"what is Bitcoin?"
```

### Resposta do Binno:
```
🪙 Bitcoin (BTC)

About Bitcoin:
Bitcoin is a decentralized cryptocurrency originally described in a 2008 
whitepaper by a person using the alias Satoshi Nakamoto. It was launched 
soon after, in January 2009. Bitcoin is a peer-to-peer online currency, 
meaning that all transactions happen directly between equal, independent 
network participants...

💰 Market Data:
- Current Price: $67,234.50
- Market Cap: $1.32T
- 24h Volume: $45.2B
- 24h Change: 📈 +2.45%
- 7d Change: 📈 +8.32%

📊 Supply:
- Circulating Supply: 19.5M BTC
- Total Supply: 19.5M BTC
- Max Supply: 21.0M BTC

🔗 Contract:
- Network: BTC
- Address: Native blockchain

🏷️ Categories: Cryptocurrency, Store of Value, Payment

🔗 Links: [Website](https://bitcoin.org) | [Twitter](https://twitter.com/bitcoin)

💡 Data from CoinGecko - Always DYOR before investing!
```

## 🔧 Arquitetura

### Novo Arquivo: `lib/coinGeckoAPI.ts`

```typescript
// Principais funções exportadas:

getTokenByNameOrSymbol(query: string): Promise<SimplifiedTokenData | null>
// Busca completa: search + details

searchCoin(query: string): Promise<string | null>
// Busca coin ID por nome/símbolo

getCoinDetails(coinId: string): Promise<SimplifiedTokenData | null>
// Obtém informações detalhadas

formatCoinGeckoDataForAI(tokenData): string
// Formata resposta completa e legível

getTrendingCoins(): Promise<SimplifiedTokenData[]>
// Top 5 trending globalmente
```

### Integração: `netlify/functions/ai-chat.ts`

**Novo Fluxo:**
```typescript
if (tokenQuery) {
  // 1️⃣ Tenta CoinGecko primeiro (dados completos)
  const coinGeckoData = await getTokenByNameOrSymbol(tokenQuery)
  if (coinGeckoData) {
    return formatCoinGeckoDataForAI(coinGeckoData)
  }
  
  // 2️⃣ Fallback para GeckoTerminal (DEX data)
  const geckoTerminalData = await searchToken(tokenQuery)
  if (geckoTerminalData) {
    return formatTokenDataForAI(geckoTerminalData)
  }
  
  // 3️⃣ Não encontrado em nenhum lugar
  return "Token not found"
}
```

## 🔑 Configuração da API Key

### 1. Obter API Key (OPCIONAL - funciona sem):
- Acesse: https://www.coingecko.com/en/api/pricing
- **Free Tier**: 10-50 calls/min (suficiente para uso normal)
- **Pro Tier**: Mais chamadas + prioridade

### 2. Adicionar no `.env.local`:
```bash
# CoinGecko API (opcional - funciona com API pública também)
COINGECKO_API_KEY=CG-YourAPIKeyHere
```

### 3. Sistema Automático:
```typescript
// Se API key presente → usa endpoint Pro
// Se não → usa endpoint público (com rate limit)

function getBaseUrl(): string {
  const apiKey = getApiKey()
  return apiKey 
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
}
```

## 📊 Informações Fornecidas

### Dados Básicos:
- ✅ Nome completo do projeto
- ✅ Símbolo (ticker)
- ✅ Descrição detalhada (500 chars)
- ✅ Categorias (DeFi, Gaming, etc)

### Dados de Mercado:
- ✅ Preço atual (USD)
- ✅ Market Cap (capitalização)
- ✅ Volume 24h
- ✅ Variação 24h (%)
- ✅ Variação 7d (%)

### Supply (Oferta):
- ✅ Circulating Supply (em circulação)
- ✅ Total Supply (total emitido)
- ✅ Max Supply (máximo possível)
- ✅ Formatado com B/M/K

### Blockchain:
- ✅ Rede principal (BSC/ETH/etc)
- ✅ Endereço do contrato
- ✅ Prioriza BSC, depois ETH

### Links Sociais:
- ✅ Website oficial
- ✅ Twitter handle
- ✅ Telegram channel
- ✅ Formatado como links clicáveis

## 🎨 Formatação de Dados

### Números Grandes:
```typescript
$1,320,000,000,000 → $1.32T (Trilhões)
$45,200,000,000 → $45.2B (Bilhões)  
$125,500,000 → $125.5M (Milhões)
$45,200 → $45.2K (Milhares)
```

### Supply:
```typescript
19,500,000 BTC → 19.5M BTC
1,000,000,000 USDT → 1.0B USDT
∞ (unlimited) → ♾️ Unlimited
```

### Variação de Preço:
```typescript
+2.45% → 📈 +2.45%
-1.23% → 📉 -1.23%
0% → ➡️ 0%
```

## 🚀 Performance

### Rate Limits:

**API Pública (sem key):**
- 10-50 calls/minuto
- Suficiente para uso normal

**API Pro (com key):**
- 500+ calls/minuto
- Sem throttling
- Melhor uptime

### Tempo de Resposta:
- **CoinGecko search**: ~300-500ms
- **CoinGecko details**: ~400-600ms
- **Total (search + details)**: ~700-1100ms
- **Fallback GeckoTerminal**: +500-800ms

### Otimizações:
```typescript
// 1. CoinGecko primeiro (mais completo)
// 2. GeckoTerminal fallback (mais tokens)
// 3. Cache futuro (Redis) pode reduzir para <100ms
```

## 📝 Exemplos de Queries

### Tokens Grandes (CoinGecko):
```
✅ "what is Bitcoin?"
✅ "tell me about Ethereum"
✅ "BNB token info"
✅ "check USDT"
✅ "Solana price"
```

### Tokens Pequenos (GeckoTerminal fallback):
```
✅ "what is NAMT token?"
✅ "Namimoto price"
✅ "check random DEX token"
```

### Trending:
```
✅ "trending coins"
✅ "hot tokens"
✅ "popular cryptocurrencies"
```

## 🔒 Segurança & Disclaimers

**Sempre incluído:**
```
💡 Data from CoinGecko - Always DYOR before investing!
```

**Para tokens não verificados:**
```
⚠️ This token is not listed on CoinGecko
⚠️ Always verify contract addresses
⚠️ Risk of scam or rugpull
```

## 🐛 Troubleshooting

### API Key não funciona:
```bash
# Verificar formato (deve começar com CG-)
COINGECKO_API_KEY=CG-abc123xyz...

# Testar endpoint:
curl -H "x-cg-pro-api-key: YOUR_KEY" \
  https://pro-api.coingecko.com/api/v3/ping
```

### Rate limit excedido:
```
Error 429: Too Many Requests
Solução:
1. Adicionar API key (aumenta limite)
2. Implementar cache (Redis)
3. Aguardar 1 minuto
```

### Token não encontrado:
```
1. Verificar nome/símbolo correto
2. Checar se está listado no CoinGecko
3. Tentar GeckoTerminal (DEX data)
4. Buscar por contract address
```

## 📈 Melhorias Futuras

- [ ] Cache de resultados (Redis/Memory)
- [ ] Histórico de preços (gráficos)
- [ ] Alertas de preço personalizados
- [ ] Comparação entre tokens
- [ ] Análise técnica (RSI, MACD)
- [ ] Portfolio tracking
- [ ] News & updates do projeto
- [ ] Audit status (CertiK, etc)

## 📚 Referências

- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [Free API Endpoint](https://api.coingecko.com/api/v3)
- [Pro API Endpoint](https://pro-api.coingecko.com/api/v3)
- [API Pricing](https://www.coingecko.com/en/api/pricing)

---

**Implementado:** 16 de outubro de 2025  
**Status:** ✅ Produção  
**Prioridade:** CoinGecko → GeckoTerminal → Fallback  
**Testado:** Binno AI Chat (/binno-ai)
