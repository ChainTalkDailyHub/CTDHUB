# 🔍 ANÁLISE - Trust Wallet Reverter

## ✅ PROGRESSOS

1. **Trust Wallet NÃO alerta scam** ✅ (diferente do MetaMask)
2. **Usuário está elegível** ✅ 
3. **Transação foi enviada** ✅
4. **Gas foi pago** ✅ (99,471 gas usado)

## ❌ PROBLEMA

**Status da transação: 0 (Failed)**

```javascript
"data": ""  // VAZIO!
"status": 0 // Failed
"gasUsed": "99471"
```

### Causa Raiz:

A transação foi enviada **SEM O DATA DA FUNÇÃO**. Foi como enviar BNB diretamente para o contrato, que não aceita e reverte.

## 🔍 POSSÍVEIS CAUSAS

### 1. **Trust Wallet não enviou o data corretamente**
- Trust Wallet pode ter bug com ethers.js v6
- Pode ter stripped o data da transação
- Pode ter problema com `type: 0` (legacy)

### 2. **Problema na integração WalletConnect**
- Trust Wallet usa WalletConnect
- ethers.js pode não estar encodando corretamente
- Legacy transaction pode não ser suportada

### 3. **Race condition**
- Contract ou signer não inicializou completamente
- burnQuizTokens foi chamado antes do contrato estar pronto

## 🎯 SOLUÇÕES

### SOLUÇÃO 1: Remover `type: 0`

Trust Wallet pode não suportar forçar type 0. Deixar o provider escolher:

```typescript
const tx = await contract.burnQuizTokens(quizId, {
  gasLimit: 100000,
  gasPrice: safeGasPrice
  // Remover: type: 0
})
```

### SOLUÇÃO 2: Adicionar verificação do data

Antes de enviar, verificar se o data está presente:

```typescript
// Preparar a transação
const tx = await contract.burnQuizTokens.populateTransaction(quizId)
console.log('📦 Transaction data:', tx.data)

if (!tx.data || tx.data === '0x' || tx.data === '') {
  throw new Error('Transaction data is empty!')
}

// Enviar com override
const sentTx = await signer.sendTransaction({
  ...tx,
  gasLimit: 100000,
  gasPrice: safeGasPrice
})
```

### SOLUÇÃO 3: Usar método direto sem options

```typescript
// Não passar options, deixar ethers.js gerenciar
const tx = await contract.burnQuizTokens(quizId)
```

### SOLUÇÃO 4: Verificar se é Trust Wallet e ajustar

```typescript
const isTrustWallet = window.ethereum?.isTrust
if (isTrustWallet) {
  // Trust Wallet: não forçar type 0
  const tx = await contract.burnQuizTokens(quizId, {
    gasLimit: 100000,
    gasPrice: safeGasPrice
  })
} else {
  // MetaMask: forçar type 0
  const tx = await contract.burnQuizTokens(quizId, {
    gasLimit: 100000,
    gasPrice: safeGasPrice,
    type: 0
  })
}
```

## 🔧 IMPLEMENTAÇÃO RECOMENDADA

Testar primeiro **SOLUÇÃO 1** (remover type: 0):

```typescript
// 7. Executar transação com gas price personalizado
const tx = await contract.burnQuizTokens(quizId, {
  gasLimit: 100000,
  gasPrice: safeGasPrice
  // Removido: type: 0
})
```

**Por quê:**
- BSC aceita tanto Type 0 quanto Type 2
- Trust Wallet pode estar rejeitando o type: 0 forçado
- Deixar o provider escolher é mais seguro

## 📊 ANÁLISE DA TRANSAÇÃO FALHADA

**Hash:** `0x0adcda0bbe199a0272f5cbe5310845839ad36eb4de62a643cab50ad4d0de00e5`

```
✅ From: 0x5d600a007d9158D8A15F11c0A3BA6bee7Ddda393
✅ To: 0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958
✅ Gas Price: 5 Gwei (correto!)
✅ Gas Used: 99,471 (pagou)
❌ Data: "" (VAZIO!)
❌ Status: 0 (Failed)
❌ Logs: [] (Nenhum evento emitido)
```

**Conclusão:** A transação foi uma **transfer simples** sem chamar função, que reverteu porque o contrato não aceita.

## 🚀 PRÓXIMOS PASSOS

1. Remover `type: 0` do código
2. Rebuild e redeploy
3. Testar novamente com Trust Wallet
4. Se funcionar, adicionar detecção de wallet para MetaMask

**Implementar agora?**
