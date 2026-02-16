# ▲ Deploy no Vercel - Guia Completo

## ⚠️ IMPORTANTE: Limitações do Vercel

O Vercel é **ÓTIMO para frontend**, mas tem **limitações** para seu projeto:

### ❌ Problemas:
1. **Timeout de 10s** em funções serverless (artigos demoram mais)
2. **Sem processos background** (publisher automático não funciona)
3. **Sem cron jobs nativos** (precisa de add-ons)
4. **Cold starts** (primeira request é lenta)

### ✅ Alternativa:
Use **Railway** (veja DEPLOY-RAILWAY.md) - funciona 100% sem limitações!

---

## Se Ainda Assim Quiser Usar Vercel...

Você pode fazer deploy do **FRONTEND apenas**, mas precisará:
- Rodar publisher manualmente ou em outro servidor
- Usar Vercel Cron (pago)
- Ou usar GitHub Actions para publicação

---

## 🚀 Deploy Simples (Frontend Apenas)

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Deploy

```bash
# No diretório do projeto
vercel

# Ou deploy em produção direto
vercel --prod
```

### 4. Configurar Variáveis

```bash
# Adicionar variáveis de ambiente
vercel env add ANTHROPIC_API_KEY
vercel env add NEWS_API_KEY
vercel env add PORT
```

---

## 🔧 Configuração Avançada

Crie `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## ⚡ Solução Híbrida (Recomendado)

### Frontend no Vercel + Backend no Railway

1. **Vercel**: Apenas páginas estáticas (HTML/CSS/JS)
2. **Railway**: API + Publisher + IA

**Arquitetura**:
```
Vercel (Frontend)
    ↓
Railway (API + Backend)
    ↓
Anthropic (IA)
```

---

## 🎯 Recomendação Final

### Para Seu Projeto:

**USE RAILWAY! 🚂**

**Por quê?**
- ✅ Tudo funciona out-of-the-box
- ✅ Sem limitações de timeout
- ✅ Processos background funcionam
- ✅ Mais simples de configurar
- ✅ Mesma facilidade de deploy

### Quando Usar Vercel:

- Sites estáticos
- Next.js / React apps
- Jamstack sites
- **NÃO para backends complexos como o seu**

---

## 📞 Precisa de Ajuda?

Veja o guia completo do Railway: `DEPLOY-RAILWAY.md`

Ou me pergunte! 😊
