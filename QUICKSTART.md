# 🚀 Guia Rápido de Início

## Em 5 Minutos

### 1. Instale as Dependências

```bash
npm install
```

### 2. Configure suas Chaves de API

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite o `.env` e adicione pelo menos:

```env
ANTHROPIC_API_KEY=sk-ant-api03-sua-chave-aqui
NEWS_API_KEY=sua-chave-newsapi  # Opcional mas recomendado
```

### 3. Execute o Sistema

```bash
npm start
```

### 4. Acesse o Portal

Abra no navegador: **http://localhost:3000**

Aguarde 30 minutos para os primeiros artigos serem gerados automaticamente!

---

## 📋 Checklist de Configuração

- [ ] Node.js 16+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado e configurado
- [ ] Chave Anthropic API adicionada
- [ ] Pelo menos uma API de notícias configurada
- [ ] Sistema rodando (`npm start`)
- [ ] Portal acessível em http://localhost:3000

---

## 🔑 Onde Obter as Chaves de API

### Anthropic (OBRIGATÓRIO)
- URL: https://console.anthropic.com/
- Tempo: 5 minutos
- Custo: Pay-per-use (muito acessível)

### NewsAPI (Recomendado)
- URL: https://newsapi.org/
- Tempo: 2 minutos
- Custo: Grátis até 100 requests/dia

---

## 🎯 Próximos Passos

Depois que o sistema estiver rodando:

1. **Personalize o visual** - Edite `public/css/style.css`
2. **Ajuste categorias** - Edite `src/scrapers/news-aggregator.js`
3. **Configure Adsense** - Atualize IDs nos arquivos HTML
4. **Registre domínio** - GoDaddy, Registro.br, etc
5. **Deploy em produção** - Heroku, DigitalOcean, AWS, etc

---

## 💡 Dicas Importantes

- Os artigos são gerados **automaticamente** a cada 30 minutos
- O primeiro ciclo pode demorar mais (está criando índices)
- Verifique os **logs no console** para acompanhar o progresso
- Se algo der errado, leia a seção **Troubleshooting** no README.md

---

## 🆘 Problemas Comuns

**Erro: "Cannot find module"**
→ Execute: `npm install`

**Erro: "ANTHROPIC_API_KEY not configured"**
→ Verifique o arquivo `.env`

**Artigos não aparecem**
→ Aguarde 30 minutos para o primeiro ciclo

**Precisa de ajuda?**
→ Leia o README.md completo

---

Boa sorte! 🚀
