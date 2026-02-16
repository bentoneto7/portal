# 🚂 Deploy no Railway - Guia Completo

## Por Que Railway?

- ✅ **Perfeito para Node.js** com processos longos
- ✅ **$5 de crédito gratuito** por mês
- ✅ **Deploy em 2 minutos**
- ✅ **HTTPS automático**
- ✅ **Domínio gratuito** (.railway.app)
- ✅ **Logs em tempo real**
- ✅ **Suporta cron jobs e background tasks**

---

## 🚀 Passo a Passo

### 1. Criar Conta no Railway

1. Acesse: https://railway.app/
2. Clique em "Start a New Project"
3. Faça login com GitHub

### 2. Conectar Repositório

```bash
# No terminal local:
# Certifique-se que está na branch correta
git checkout claude/news-portal-seo-5pQcP

# Push para seu GitHub
git remote add origin https://github.com/seu-usuario/portal.git
git push -u origin claude/news-portal-seo-5pQcP
```

### 3. Deploy no Railway

**Opção A: Via Interface Web**

1. No Railway Dashboard, clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha seu repositório `portal`
4. Railway detecta automaticamente que é Node.js
5. Clique em "Deploy"

**Opção B: Via Railway CLI** (Recomendado)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

### 4. Configurar Variáveis de Ambiente

No Railway Dashboard:

1. Vá em seu projeto
2. Clique em "Variables"
3. Adicione as seguintes variáveis:

```env
# OBRIGATÓRIO
ANTHROPIC_API_KEY=sk-ant-api03-sua-chave-aqui
NEWS_API_KEY=4RwzeEh1wdxzds5ub55TLd4sGAW82LkK68UM1cUy

# OPCIONAL (mas recomendado)
PORT=3000
NODE_ENV=production
PUBLISH_INTERVAL=1800000
MIN_SOURCES=2
```

### 5. Verificar Deploy

1. Railway gera uma URL automaticamente: `https://seu-app.railway.app`
2. Acesse a URL
3. Verifique logs em tempo real no dashboard

### 6. Configurar Domínio Próprio (Opcional)

1. No Railway Dashboard, vá em "Settings"
2. Clique em "Domains"
3. Clique em "Custom Domain"
4. Adicione seu domínio (ex: newsportal.com)
5. Configure DNS no seu registrador:
   ```
   CNAME -> seu-app.railway.app
   ```

---

## 🔧 Comandos Úteis Railway CLI

```bash
# Ver logs em tempo real
railway logs

# Abrir projeto no navegador
railway open

# Ver variáveis de ambiente
railway variables

# Adicionar variável
railway variables set KEY=value

# Rodar comando no Railway
railway run npm start

# Deploy manual
railway up

# Ver status
railway status

# Linkar projeto existente
railway link
```

---

## 📊 Monitoramento

### Ver Logs:
```bash
railway logs --follow
```

### Métricas no Dashboard:
- CPU usage
- Memory usage
- Request count
- Response time

---

## 💰 Custos

### Plano Gratuito:
- **$5 de crédito/mês** (renova todo mês)
- **500 horas de execução**
- **100GB de tráfego**
- **1GB de RAM**

**Suficiente para começar!** 🎉

### Quanto você vai gastar:
- **Mês 1-2**: Grátis (dentro do crédito)
- **Mês 3+**: ~$5-10/mês (se crescer muito)

---

## 🐛 Troubleshooting

### Deploy falhou?

1. **Verifique logs**:
   ```bash
   railway logs
   ```

2. **Build error**: Certifique-se que `package.json` está correto

3. **Start error**: Verifique se variáveis de ambiente estão configuradas

### App crashando?

1. **Ver últimos logs**:
   ```bash
   railway logs --tail 100
   ```

2. **Restart manual**:
   - No dashboard, clique em "Restart"

3. **Verificar variáveis**:
   ```bash
   railway variables
   ```

### Porta errada?

Railway usa a variável `PORT` automaticamente. Seu código já está preparado:

```javascript
const PORT = process.env.PORT || 3000;
```

---

## ✅ Checklist de Deploy

- [ ] Conta criada no Railway
- [ ] Código no GitHub
- [ ] Projeto criado no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] URL funcionando
- [ ] Logs sem erros
- [ ] Artigos sendo gerados (após 30 min)
- [ ] (Opcional) Domínio próprio configurado

---

## 🎯 Próximos Passos Após Deploy

1. **Google Analytics**: Adicionar tracking
2. **Google Search Console**: Submeter sitemap
3. **Monitorar logs**: Primeiras 24h
4. **Testar funcionalidades**: RSS, API, etc
5. **Aplicar para Adsense**: Após 50+ artigos

---

## 🚀 Deploy em 1 Comando

Se você já tem Railway CLI configurado:

```bash
# Setup completo em 1 linha!
railway login && railway init && railway up && railway open
```

---

## 📞 Suporte Railway

- Documentação: https://docs.railway.app/
- Discord: https://discord.gg/railway
- Status: https://status.railway.app/

---

**PRONTO!** Seu portal estará no ar em minutos! 🎉

URL: https://seu-portal.railway.app
