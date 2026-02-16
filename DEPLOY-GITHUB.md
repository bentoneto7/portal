# 🔗 Deploy com Integração GitHub - Railway & Vercel

## ✅ Integração Direta com GitHub

Tanto **Railway** quanto **Vercel** suportam deploy automático via GitHub!

**Como funciona**:
```
Você faz commit → Push para GitHub → Deploy automático! 🚀
```

---

## 🚂 RAILWAY + GITHUB (RECOMENDADO)

### 🎯 Por Que Railway?

- ✅ **Auto-deploy** em cada push
- ✅ **Preview deployments** para PRs
- ✅ **Rollback com 1 clique**
- ✅ **Suporta processos background** (seu publisher!)
- ✅ **Sem timeout** em funções
- ✅ **Logs em tempo real**

### 📋 Setup Completo (5 minutos)

#### 1. Prepare seu Código

```bash
# Certifique-se que está na branch correta
git checkout claude/news-portal-seo-5pQcP

# Faça push para GitHub
git push origin claude/news-portal-seo-5pQcP
```

#### 2. Conecte Railway ao GitHub

1. Acesse: https://railway.app/new
2. Clique em "Deploy from GitHub repo"
3. Autorize Railway a acessar seu GitHub
4. Selecione o repositório `portal`
5. Escolha a branch `claude/news-portal-seo-5pQcP`
6. Clique em "Deploy Now"

✅ **Pronto!** Railway detecta automaticamente Node.js e faz o build!

#### 3. Configure Variáveis de Ambiente

No Railway Dashboard:

```
Settings → Variables → Add Variable
```

Adicione:
```env
ANTHROPIC_API_KEY=sua-chave-anthropic-aqui
NEWS_API_KEY=sua-chave-newsapi-aqui
NODE_ENV=production
PORT=3000
PUBLISH_INTERVAL=1800000
MIN_SOURCES=2
```

**IMPORTANTE**: Use suas próprias chaves de API! Não compartilhe chaves no código.

#### 4. Deploy Automático Configurado! 🎉

Agora, **toda vez que você fizer push**:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin claude/news-portal-seo-5pQcP
```

**Railway vai automaticamente**:
1. Detectar o push
2. Fazer build
3. Deploy
4. Te notificar

---

## ▲ VERCEL + GITHUB

### ⚠️ Limitações para Seu Projeto

Vercel tem **timeout de 10s** em funções serverless. Seu projeto:
- ❌ Publisher automático não funciona
- ❌ IA demora >10s para criar artigos
- ❌ Processos background não suportados

**Solução**: Use Railway! 🚂

### Se Ainda Quiser Tentar Vercel...

#### 1. Conectar GitHub

1. Acesse: https://vercel.com/new
2. "Import Git Repository"
3. Selecione seu repo `portal`
4. Escolha branch `claude/news-portal-seo-5pQcP`
5. Configure:
   ```
   Framework Preset: Other
   Build Command: npm install
   Output Directory: public
   Install Command: npm install
   ```

#### 2. Variáveis de Ambiente

```
Settings → Environment Variables
```

Adicione as mesmas variáveis do Railway.

#### 3. Deploy

Clique em "Deploy"

**Problema**: Publisher não vai funcionar devido ao timeout!

---

## 🔄 Workflow Completo com GitHub

### Railway (Recomendado)

```bash
# 1. Desenvolvimento local
git checkout -b feature/nova-funcionalidade
# ... fazer mudanças ...

# 2. Commit
git add .
git commit -m "feat: adicionar nova categoria"

# 3. Push
git push origin feature/nova-funcionalidade

# 4. Merge para branch principal
git checkout claude/news-portal-seo-5pQcP
git merge feature/nova-funcionalidade
git push origin claude/news-portal-seo-5pQcP

# 5. Railway detecta e faz deploy automático! 🚀
```

### Features Automáticas:

✅ **Deploy Preview**: Cada PR gera URL de preview
✅ **Rollback**: Voltar para versão anterior com 1 clique
✅ **Logs**: Ver erros em tempo real
✅ **Notificações**: Discord, Slack, Email

---

## 🎯 Comparação Final

| Feature | Railway 🚂 | Vercel ▲ |
|---------|-----------|----------|
| **GitHub Integration** | ✅ Sim | ✅ Sim |
| **Auto Deploy** | ✅ Sim | ✅ Sim |
| **Preview Deploy** | ✅ Sim | ✅ Sim |
| **Processos Longos** | ✅ Sim | ❌ 10s timeout |
| **Background Tasks** | ✅ Sim | ❌ Não |
| **Node.js Backend** | ✅ Perfeito | ⚠️ Limitado |
| **Seu Projeto** | ✅ **100%** | ❌ 40% |

---

## 🚀 RECOMENDAÇÃO FINAL

### Para Seu Portal de Notícias:

**USE RAILWAY! 🚂**

```bash
# Setup em 3 comandos:
1. git push origin claude/news-portal-seo-5pQcP
2. Conectar Railway ao GitHub (interface web)
3. Adicionar variáveis de ambiente
```

**Resultado**:
- ✅ Deploy automático
- ✅ Publisher funcionando 24/7
- ✅ IA criando artigos
- ✅ Tudo funcionando perfeitamente

---

## 📝 Checklist de Deploy

### Railway + GitHub:

- [ ] Código no GitHub
- [ ] Conta Railway criada
- [ ] Repositório conectado
- [ ] Branch selecionada
- [ ] Variáveis configuradas
- [ ] Deploy inicial completo
- [ ] URL funcionando
- [ ] Auto-deploy testado (fazer push)
- [ ] Logs sem erros

---

## 🎓 Próximos Passos

1. **Deploy inicial**: Railway + GitHub
2. **Teste auto-deploy**: Fazer mudança e push
3. **Monitorar logs**: Primeiras 24h
4. **Configurar domínio**: (opcional)
5. **Aplicar Adsense**: Após conteúdo

---

## 💡 Dica Pro

### Setup Completo em 10 Minutos:

```bash
# 1. Push para GitHub (1 min)
git push origin claude/news-portal-seo-5pQcP

# 2. Railway setup (5 min)
# - Conectar repo na web
# - Adicionar variáveis

# 3. Deploy automático! (4 min)
# - Railway faz build
# - Deploy completo
# - URL gerada

# TOTAL: ~10 minutos ⚡
```

---

## 📞 Suporte

**Railway**:
- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway

**GitHub**:
- Docs: https://docs.github.com/

---

**PRONTO!** Deploy automático configurado! 🎉

Toda vez que você fizer push, seu portal atualiza automaticamente! 🚀
