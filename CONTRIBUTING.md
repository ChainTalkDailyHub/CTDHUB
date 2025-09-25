# Contributing to CTDHUB Platform

Obrigado por considerar contribuir para a CTDHUB Platform! 🎉

## Como Contribuir

### Reportar Bugs
- Use o template de Bug Report
- Inclua passos detalhados para reproduzir
- Adicione screenshots quando possível
- Especifique o ambiente (OS, browser, device)

### Sugerir Features
- Use o template de Feature Request  
- Explique o problema que a feature resolve
- Descreva a solução proposta
- Considere alternativas

### Pull Requests

1. **Fork** o repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commite** suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

### Padrões de Código

- **TypeScript**: Use tipagem estrita
- **ESLint**: Siga as regras configuradas
- **Prettier**: Formate o código automaticamente
- **Commits**: Use Conventional Commits

#### Exemplo de Commit:
```
feat: adicionar autenticação social
fix: corrigir bug no sistema de quiz
docs: atualizar documentação da API
style: ajustar espaçamento dos botões
```

### Estrutura de Branches

- `master/main`: Produção
- `develop`: Desenvolvimento
- `feature/*`: Novas funcionalidades
- `hotfix/*`: Correções urgentes
- `release/*`: Preparação de releases

### Setup Local

```bash
# Clone o projeto
git clone https://github.com/SEU_USUARIO/ctdhub-platform.git

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env.local

# Rode localmente
npm run dev
```

### Code Review

Todos os PRs passam por review. Verificamos:

- ✅ Funcionalidade
- ✅ Testes
- ✅ Performance
- ✅ Acessibilidade
- ✅ Segurança
- ✅ Documentação

### Dúvidas?

- 💬 Abra uma Issue para discussão
- 📧 Entre em contato via email
- 🐦 Siga nas redes sociais

Obrigado por contribuir com a CTDHUB! 🚀