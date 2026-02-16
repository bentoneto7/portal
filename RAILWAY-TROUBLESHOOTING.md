# 🔧 Railway Troubleshooting - Resolver Erros de Deploy

## ❌ ERROS COMUNS E SOLUÇÕES

### 1. "Module not found" ou "Cannot find module '@anthropic-ai/sdk'"

**Causa**: Dependência faltando no `package.json`

**Solução**: ✅ **JÁ CORRIGIDO!** O SDK da Anthropic foi adicionado.

Verifique se seu `package.json` tem:
```json
"dependencies": {
  "@anthropic-ai/sdk": "^0.32.1",
  ...
}
```

---

### 2. "ANTHROPIC_API_KEY not configured"

**Causa**: Variáveis de ambiente não configuradas no Railway

**Solução**:

1. Railway Dashboard → Seu projeto
2. Clique em **"Variables"** (aba lateral)
3. Adicione **UMA POR UMA**:

```
ANTHROPIC_API_KEY = sk-ant-api03-sua-chave-aqui
NEWS_API_KEY = sua-chave-newsapi-aqui
NODE_ENV = production
PORT = 3000
PUBLISH_INTERVAL = 1800000
MIN_SOURCES = 2
```

4. **IMPORTANTE**: Clique em **"Add"** para cada variável!
5. Railway vai fazer **redeploy automático**

---

### 3. "Application failed to respond"

**Causa**: Porta incorreta ou servidor não iniciou

**Solução**:

Railway define `PORT` automaticamente. Certifique-se que:

```javascript
// No código (já está assim):
const PORT = process.env.PORT || 3000;
```

E no Railway Variables:
```
PORT = 3000
```

---

### 4. "Build failed" ou "npm install failed"

**Causa**:
- Internet lenta
- Dependências incompatíveis
- Falta de `package-lock.json`

**Solução**:

```bash
# Local: Gerar package-lock.json
npm install
git add package-lock.json
git commit -m "fix: add package-lock.json"
git push origin claude/news-portal-seo-5pQcP
```

Railway vai tentar novamente automaticamente.

---

### 5. "Deploy succeeded but app crashes"

**Causa**: Erro no código ou variável faltando

**Solução**:

1. **Ver logs no Railway**:
   - Dashboard → "Deployments"
   - Clique no deploy ativo
   - Scroll até ver o erro (vermelho)

2. **Procure por**:
   ```
   ❌ ERROR:
   Error:
   TypeError:
   ReferenceError:
   ```

3. **Me mande o erro** e eu resolvo! 😊

---

### 6. Railway não detecta o projeto

**Causa**: Falta de configuração

**Solução**: ✅ **JÁ CORRIGIDO!**

Arquivos criados:
- ✅ `railway.json` - Configuração Railway
- ✅ `Procfile` - Comando de start
- ✅ `package.json` - Com todas as dependências

---

## 🔍 COMO VER LOGS NO RAILWAY

### Opção 1: Via Dashboard

1. Acesse https://railway.app/
2. Clique no seu projeto
3. Clique em "**Deployments**"
4. Clique no deploy **mais recente** (verde ou vermelho)
5. **Scroll** para ver todos os logs

### Opção 2: Via CLI (Recomendado)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto (primeira vez)
railway link

# Ver logs em tempo real
railway logs --follow
```

---

## 📋 CHECKLIST DE DEBUG

Marque cada item:

**Configuração básica**:
- [ ] Código está no GitHub
- [ ] Branch `claude/news-portal-seo-5pQcP` foi selecionada
- [ ] Railway conectado ao repositório

**Dependências**:
- [ ] `package.json` tem `@anthropic-ai/sdk`
- [ ] `package.json` tem todas as dependências
- [ ] `npm install` funciona localmente

**Variáveis de Ambiente**:
- [ ] `ANTHROPIC_API_KEY` configurada
- [ ] `NEWS_API_KEY` configurada
- [ ] `NODE_ENV` = production
- [ ] `PORT` = 3000
- [ ] Todas variáveis sem aspas

**Deploy**:
- [ ] Build completou (verde)
- [ ] Deploy está ativo
- [ ] URL foi gerada
- [ ] Logs sem erros

---

## 🚀 FORÇAR REDEPLOY

Se nada funcionar:

### Opção 1: Via Dashboard

1. Railway Dashboard
2. Clique em "**Settings**"
3. Role até "**Danger Zone**"
4. Clique em "**Redeploy**"

### Opção 2: Push vazio

```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push origin claude/news-portal-seo-5pQcP
```

### Opção 3: Recriar projeto

1. Delete o projeto no Railway
2. Crie novo projeto
3. Conecte GitHub novamente
4. Configure variáveis novamente

---

## 💡 DICAS PRO

### 1. Testar Localmente Primeiro

```bash
# Instalar dependências
npm install

# Criar .env com suas chaves
cp .env.example .env
# Edite .env com suas chaves reais

# Testar
npm start

# Deve mostrar:
# ✅ Server running on port 3000
# 🚀 News Portal running
```

### 2. Ver Todos os Logs

Railway limita logs na interface. Para ver tudo:

```bash
railway logs --tail 500
```

### 3. Debugar Build

Ver exatamente o que Railway está fazendo:

```bash
railway logs --deployment [ID]
```

### 4. Verificar Variáveis

```bash
railway variables
```

---

## 🆘 ERRO ESPECÍFICO?

**Me mande**:

1. **Print do erro** no Railway Dashboard
2. **Últimas linhas dos logs** (as vermelhas)
3. **Qual variável você configurou**

Formato:
```
Erro: [copie aqui]
Variáveis: ANTHROPIC_API_KEY, NEWS_API_KEY, ...
Logs:
[últimas 20 linhas]
```

Eu resolvo rapidinho! 🔧

---

## 📞 LINKS ÚTEIS

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app/
- Anthropic Status: https://status.anthropic.com/

---

## ✅ PRÓXIMOS PASSOS APÓS CORRIGIR

1. ✅ Fazer novo push (se mudou código)
2. ✅ Redeploy no Railway
3. ✅ Verificar logs (sem vermelho)
4. ✅ Testar URL
5. ✅ Aguardar 30 min (primeiro artigo)

---

**VAMOS RESOLVER ISSO!** 💪

Me mande o erro específico que eu te ajudo! 😊
