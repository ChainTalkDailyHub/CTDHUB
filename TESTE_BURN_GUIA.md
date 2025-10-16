# 🧪 Guia de Teste - Sistema de Burn CTD

## ⚠️ PRÉ-REQUISITOS

Antes de testar, certifique-se de ter:

- [ ] MetaMask instalado no navegador
- [ ] Conectado à **BSC Mainnet** (Chain ID: 56)
- [ ] Pelo menos **0.001 BNB** para pagar gas (~$0.20-0.30)
- [ ] Completado **10 módulos do quiz** no CTDHUB

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### 1. Verificar Status do Sistema ✅

Execute no terminal:
```bash
node verify-allowance.js
```

**Resultado esperado:**
- ✅ Treasury com saldo > 1000 CTD
- ✅ Allowance > 1000 CTD
- ✅ Conexão com BSC funcionando

---

## 🔬 TESTE PASSO A PASSO

### Passo 1: Acessar a Página de Quiz

1. Abra: https://chaintalkdailyhub.com/quiz
2. Verifique se a página carrega corretamente
3. Conecte sua wallet MetaMask

**✅ Checkpoint:** Wallet conectada e endereço exibido

---

### Passo 2: Completar os Módulos

1. Complete todos os 10 módulos do quiz
2. Verifique o progresso: "X/10 modules completed"
3. Aguarde até ver "10/10 modules completed"

**✅ Checkpoint:** Todos módulos completados

---

### Passo 3: Seção de Burn Aparece

Quando completar 10 módulos, você deverá ver:

```
🔥 Burn Your Badge
✅ You are eligible to burn!
Complete the burn to claim your achievement

💰 Transaction Cost
⛽ Gas Price: X.XX Gwei
📊 Gas Limit: 100000
Your Cost: X.XXXXXX BNB (≈ $X.XX USD)

🔥 What will be burned:
• 1000 CTD tokens (from project treasury)
• Sent to dead address (0x000...dEaD)
• Permanently removed from circulation
• You only pay gas fee (~$0.20-0.30)

[🔥 Burn 1000 CTD Tokens]
```

**✅ Checkpoint:** Seção de burn visível com estimativa de gas

---

### Passo 4: Verificar Elegibilidade

**Verifique na tela:**
- ✅ Badge verde: "You are eligible to burn"
- ⛽ Gas estimado mostrando valores reais
- 💰 Custo em BNB e USD atualizado

**Se não elegível, possíveis razões:**
- ❌ MetaMask não instalado
- ❌ Menos de 10 módulos completados
- ❌ Já completou burn anteriormente
- ❌ Problema de conexão com contrato

---

### Passo 5: Clicar em "Burn 1000 CTD Tokens"

1. Clique no botão laranja **"🔥 Burn 1000 CTD Tokens"**
2. MetaMask abrirá automaticamente
3. **Verifique os detalhes da transação:**

```
MetaMask - Confirmação de Transação

De: [Seu endereço]
Para: 0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958
Rede: Binance Smart Chain
Taxa de gas estimada: ~0.0003 BNB ($0.20)

Dados da transação:
Function: burnQuizTokens
Parameter: quiz_0x...._timestamp
```

**✅ Checkpoint:** MetaMask aberto com detalhes corretos

---

### Passo 6: Confirmar Transação no MetaMask

1. **IMPORTANTE:** Revise os detalhes
   - Endereço do contrato: `0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958`
   - Gas fee: ~$0.20-0.30 USD
   - Você NÃO está enviando CTD, apenas assinando

2. Clique em **"Confirmar"**

3. Aguarde a confirmação (5-15 segundos)

**✅ Checkpoint:** Transação enviada

---

### Passo 7: Aguardar Confirmação

Na tela do CTDHUB você verá:

```
⏳ Confirming Transaction...
[Loading spinner]
```

**Tempo esperado:** 5-30 segundos (depende da rede BSC)

---

### Passo 8: Sucesso! 🎉

Quando confirmado, você verá:

```
✅ Burn Successful!
Your transaction has been confirmed on the blockchain

[View on BscScan →]
```

**✅ Checkpoint:** Mensagem de sucesso exibida

---

### Passo 9: Verificar no BscScan

1. Clique em **"View on BscScan →"**
2. Você será redirecionado para: `https://bscscan.com/tx/0x...`

**O que verificar no BscScan:**

- ✅ **Status**: Success ✓
- ✅ **From**: [Seu endereço]
- ✅ **To**: `0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958`
- ✅ **Transaction Action**: 
  ```
  Transfer 1000 CTD From 0x27f79d0...514Ec4 To 0x000...dEaD
  ```
- ✅ **Gas Fee**: ~0.0003 BNB pago por você

---

## ✅ RESULTADO ESPERADO

### No Frontend:
- ✅ Botão "Burn" desabilitado
- ✅ Mensagem: "✅ Burn Completed"
- ✅ Link para transação no BscScan

### No BscScan:
- ✅ Transação confirmada
- ✅ Tokens transferidos da Treasury para Dead Address
- ✅ Seu endereço registrado como executor

### No Contrato:
- ✅ Seu endereço marcado como `hasCompletedQuiz = true`
- ✅ Não pode fazer burn novamente

---

## ❌ POSSÍVEIS ERROS E SOLUÇÕES

### Erro 1: "MetaMask not installed"
**Solução:** Instale MetaMask e recarregue a página

### Erro 2: "Not Eligible - Already completed"
**Motivo:** Você já fez burn anteriormente
**Solução:** Use outra wallet para testar

### Erro 3: "Insufficient BNB for gas fee"
**Solução:** Adicione pelo menos 0.001 BNB na sua wallet

### Erro 4: "Transaction rejected by user"
**Motivo:** Você cancelou no MetaMask
**Solução:** Tente novamente e confirme

### Erro 5: "Network Error"
**Solução:** 
1. Verifique se está na BSC Mainnet (Chain ID 56)
2. Tente trocar de rede e voltar para BSC
3. Recarregue a página

### Erro 6: "Execution reverted"
**Possíveis causas:**
- Treasury sem allowance (verificar com `node verify-allowance.js`)
- Treasury sem saldo de CTD
- Contrato pausado pelo owner

---

## 🔍 MONITORAMENTO

### Ver todas transações do contrato:
https://bscscan.com/address/0xB5e0393E1D8E95bF5cf4fd11b03abD03855eB958

### Ver tokens queimados (Dead Address):
https://bscscan.com/token/0x7f890a4a575558307826C82e4cb6E671f3178bfc?a=0x000000000000000000000000000000000000dead

### Verificar allowance atual:
```bash
node verify-allowance.js
```

---

## 📊 MÉTRICAS DE SUCESSO

Um teste bem-sucedido deve ter:

- ✅ Tempo de execução: 5-30 segundos
- ✅ Gas fee pago: $0.15-0.35 USD
- ✅ Transação confirmada no BscScan
- ✅ 1000 CTD queimados (visível no BscScan)
- ✅ Usuário marcado como completado no contrato
- ✅ Frontend atualizado com sucesso

---

## 🎯 TESTES ADICIONAIS

### Teste 1: Verificar Gas Estimation
- [ ] Valores atualizando em tempo real (a cada 30s)
- [ ] Gas price condizente com BSC (~3-5 Gwei)
- [ ] Preço USD atualizado

### Teste 2: Tentar Queimar Novamente (Deve Falhar)
- [ ] Mensagem: "Already completed! You can only burn once."
- [ ] Botão desabilitado
- [ ] Badge vermelho de inelegível

### Teste 3: Testar com Wallet Diferente
- [ ] Conectar outra wallet
- [ ] Completar 10 módulos
- [ ] Executar burn novamente
- [ ] Verificar segunda transação no BscScan

---

## 📝 RELATÓRIO DE TESTE

Após concluir, preencha:

```
Data: ___/___/2025
Testador: ________________
Wallet usada: 0x________________

✅ Pré-requisitos: [ ] OK [ ] Falhou
✅ Frontend carregou: [ ] OK [ ] Falhou
✅ Wallet conectada: [ ] OK [ ] Falhou
✅ 10 módulos completados: [ ] OK [ ] Falhou
✅ Seção de burn apareceu: [ ] OK [ ] Falhou
✅ Gas estimation funcionou: [ ] OK [ ] Falhou
✅ MetaMask abriu: [ ] OK [ ] Falhou
✅ Transação confirmada: [ ] OK [ ] Falhou
✅ BscScan verificado: [ ] OK [ ] Falhou
✅ Tokens queimados: [ ] OK [ ] Falhou

TX Hash: 0x_______________________

Observações:
_________________________________
_________________________________
```

---

## 🎉 CONCLUSÃO

Se todos os checkpoints passaram:
- ✅ Sistema de burn funcionando 100%
- ✅ Integração MetaMask operacional
- ✅ Smart contract executando corretamente
- ✅ Gas estimation em tempo real
- ✅ BscScan tracking funcional

**O sistema está PRONTO PARA PRODUÇÃO! 🚀**
