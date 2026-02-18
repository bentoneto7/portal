# ⚽ CONFIGURAÇÃO API-FOOTBALL

**Guia completo para integração com API-Football**

---

## 📋 O QUE É API-FOOTBALL?

API-Football é a **maior API de dados de futebol do mundo**, com:

- ✅ **Imagens HD de jogadores** (+ 100.000 atletas)
- ✅ **Logos de times** (4.000+ clubes)
- ✅ **Dados ao vivo** (placar, estatísticas, eventos)
- ✅ **Escalações** de partidas
- ✅ **Tabelas** de classificação
- ✅ **Histórico** de partidas
- ✅ **Transferências** de jogadores
- ✅ **Lesões** e suspensões

**Site:** https://www.api-football.com

---

## 💰 PLANOS E PREÇOS

| Plano | Custo | Requests/dia | Ideal para |
|-------|-------|--------------|------------|
| **Free** | $0/mês | 100 | Testes e desenvolvimento |
| **Basic** | $10/mês | 500 | Blogs e portais pequenos |
| **Pro** | $25/mês | 3.000 | Portais médios ✅ **RECOMENDADO** |
| **Ultra** | $50/mês | 10.000 | Portais grandes |
| **Mega** | $100/mês | 30.000 | Aplicativos comerciais |

**Para você:** Recomendo começar com **Free** (100/dia) e depois migrar para **Pro** ($25/mês).

---

## 🚀 PASSO 1: CRIAR CONTA E OBTER API KEY

### 1. Criar conta:
```
1. Acesse: https://www.api-football.com/register
2. Preencha:
   - Email
   - Senha
   - Nome
3. Confirme email
```

### 2. Obter API Key:
```
1. Login em: https://dashboard.api-football.com
2. Vá em "My Access"
3. Copie sua API Key:

   Exemplo: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 🔧 PASSO 2: CONFIGURAR NO PORTAL

### 1. Adicionar no `.env`:

```bash
# API-Football Configuration
API_FOOTBALL_KEY=SUA_CHAVE_AQUI
API_FOOTBALL_HOST=v3.football.api-sports.io
```

### 2. Exemplo de `.env` completo:

```bash
# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-xxx

# API-Football (imagens de atletas)
API_FOOTBALL_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
API_FOOTBALL_HOST=v3.football.api-sports.io

# News API (opcional)
NEWS_API_KEY=xxx

# Server
PORT=3000
NODE_ENV=production
```

---

## 📊 PASSO 3: TESTAR INTEGRAÇÃO

### 1. Criar arquivo de teste:

```bash
node src/utils/test-api-football.js
```

Vou criar este arquivo para você testar!

---

## 🎯 O QUE VOCÊ PODE FAZER COM API-FOOTBALL

### 1. **Imagens de Jogadores** (✅ JÁ IMPLEMENTADO)

```javascript
// Busca foto do Neymar
GET https://v3.football.api-sports.io/players?id=276

Response:
{
  "player": {
    "id": 276,
    "name": "Neymar da Silva Santos Júnior",
    "firstname": "Neymar",
    "lastname": "da Silva Santos Júnior",
    "age": 32,
    "birth": {
      "date": "1992-02-05",
      "place": "Mogi das Cruzes",
      "country": "Brazil"
    },
    "nationality": "Brazil",
    "height": "175 cm",
    "weight": "68 kg",
    "photo": "https://media.api-sports.io/football/players/276.png"
  }
}
```

### 2. **Logos de Times**

```javascript
// Busca logo do Flamengo
GET https://v3.football.api-sports.io/teams?id=127

Response:
{
  "team": {
    "id": 127,
    "name": "Flamengo",
    "code": "FLA",
    "country": "Brazil",
    "founded": 1895,
    "logo": "https://media.api-sports.io/football/teams/127.png"
  }
}
```

### 3. **Jogos Ao Vivo** (IMPLEMENTAR)

```javascript
// Busca partidas ao vivo
GET https://v3.football.api-sports.io/fixtures?live=all

Response:
{
  "fixture": {
    "id": 1234567,
    "date": "2026-02-17T20:00:00+00:00",
    "status": {
      "long": "In Play",
      "short": "1H",
      "elapsed": 23
    }
  },
  "teams": {
    "home": {
      "id": 127,
      "name": "Flamengo",
      "logo": "...",
      "winner": null
    },
    "away": {
      "id": 142,
      "name": "Palmeiras",
      "logo": "...",
      "winner": null
    }
  },
  "goals": {
    "home": 1,
    "away": 0
  }
}
```

### 4. **Tabela do Brasileirão** (IMPLEMENTAR)

```javascript
// Busca classificação
GET https://v3.football.api-sports.io/standings?league=71&season=2026

Response:
[
  {
    "rank": 1,
    "team": {
      "id": 127,
      "name": "Flamengo",
      "logo": "..."
    },
    "points": 45,
    "goalsDiff": 18,
    "all": {
      "played": 20,
      "win": 14,
      "draw": 3,
      "lose": 3
    }
  }
]
```

---

## 💡 FEATURES PRONTAS PARA IMPLEMENTAR

### ✅ Já implementado:
1. **Athlete Image Scraper** - Busca fotos de jogadores
2. **Cache de 24h** - Reduz requests
3. **Fallback** - Usa imagem local se API falhar

### 🔜 Próximas features com API-Football:

#### 1. **Live Scores Widget**
```javascript
// Widget com placar ao vivo
npm run feature:live-scores
```

#### 2. **Tabela do Brasileirão**
```javascript
// Tabela de classificação automática
npm run feature:league-table
```

#### 3. **Próximos Jogos**
```javascript
// Calendário de partidas
npm run feature:fixtures
```

#### 4. **Estatísticas de Jogadores**
```javascript
// Cards com stats (gols, assistências, etc)
npm run feature:player-stats
```

---

## 📈 OTIMIZAÇÃO DE REQUESTS

### Limites do plano Free (100 requests/dia):

**Estratégia para não exceder:**

1. **Cache agressivo** (24-48h)
2. **Atualizar apenas quando necessário**
3. **Priorizar imagens de jogadores** (já implementado)
4. **Live scores apenas em horário de jogos** (18h-23h)

### Consumo estimado:

| Feature | Requests/dia | Prioridade |
|---------|--------------|------------|
| Fotos de jogadores | 20-30 | ✅ Alta |
| Logos de times | 5-10 | ✅ Alta |
| Placar ao vivo | 30-50 | 🟡 Média |
| Tabela do Brasileirão | 2-5 | 🟡 Média |
| Estatísticas | 10-20 | 🔵 Baixa |
| **TOTAL** | **67-115** | **OK com Pro** |

**Conclusão:** Plano **Free funciona** para testes, mas **Pro ($25/mês)** é ideal para produção.

---

## 🔐 SEGURANÇA

### ⚠️ NUNCA faça:

```javascript
// ❌ ERRADO: expor API key no frontend
<script>
  const apiKey = 'a1b2c3d4e5...';
</script>

// ✅ CERTO: usar apenas no backend
// src/scrapers/athlete-image-scraper.js
this.apiFootballKey = process.env.API_FOOTBALL_KEY;
```

### ✅ Boas práticas:

1. **API key apenas no backend** (.env)
2. **Nunca commitar** .env no git
3. **Usar cache** para reduzir requests
4. **Rate limiting** para evitar abusos

---

## 🧪 COMO TESTAR

### Teste manual:

```bash
curl -X GET \
  "https://v3.football.api-sports.io/players?id=276" \
  -H "x-rapidapi-key: SUA_CHAVE_AQUI" \
  -H "x-rapidapi-host: v3.football.api-sports.io"
```

**Resposta esperada:** JSON com dados do Neymar + foto HD

---

## 🎯 IMPLEMENTAÇÃO ATUAL

### O que já está funcionando:

```javascript
// src/scrapers/athlete-image-scraper.js

async getAthleteImageAPI(athlete) {
    const response = await axios.get(
        `${this.apiFootballUrl}/players`,
        {
            params: { id: athlete.apiId },
            headers: {
                'x-rapidapi-key': this.apiFootballKey,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        }
    );

    return response.data.response[0].player.photo;
}
```

### Atletas com API IDs configurados:

```javascript
'neymar': { apiId: 276 }
'gabigol': { apiId: 9739 }
'pedro': { apiId: 30894 }
'vinicius jr': { apiId: 30893 }
'endrick': { apiId: 326422 }
'richarlison': { apiId: 738 }
'hulk': { apiId: 1470 }
```

---

## 📊 MONITORAMENTO DE USO

### Dashboard API-Football:

1. Login: https://dashboard.api-football.com
2. Vá em "Statistics"
3. Veja:
   - Requests usados hoje
   - Requests restantes
   - Histórico de uso
   - Endpoints mais usados

### Alertas recomendados:

```javascript
// Adicionar no código:
if (requestsUsed > 80% do limite) {
    console.warn('⚠️  Atingindo limite da API-Football');
    // Enviar email de alerta
}
```

---

## 🚀 PRÓXIMOS PASSOS

### 1. **Agora (com Free tier):**
- ✅ Configurar API key no .env
- ✅ Testar busca de imagens
- ✅ Atualizar artigos com fotos reais

### 2. **Próxima semana:**
- 📅 Implementar Live Scores Widget
- 📅 Adicionar mais 50+ jogadores

### 3. **Próximo mês:**
- 📅 Upgrade para plano Pro ($25/mês)
- 📅 Implementar tabela do Brasileirão
- 📅 Calendário de jogos

---

## 💰 CUSTOS TOTAIS (COM API-FOOTBALL)

| Item | Custo/mês |
|------|-----------|
| API-Football Free | $0 |
| API-Football Pro | $25 (quando crescer) |
| Hosting (Vercel/Netlify) | $0 |
| Domain (.com.br) | ~$3 |
| **TOTAL** | **$0-28/mês** |

---

## ✨ RESULTADO ESPERADO

### Antes (sem API-Football):
```
Artigo: "Neymar marca gol pelo Santos"
Imagem: https://unsplash.com/generic-stadium.jpg
❌ Genérica
```

### Depois (com API-Football):
```
Artigo: "Neymar marca gol pelo Santos"
Imagem: https://media.api-sports.io/football/players/276.png
✅ FOTO REAL DO NEYMAR EM HD
✅ Licenciada pela API
✅ Atualizada automaticamente
```

---

## 📞 SUPORTE API-FOOTBALL

- **Email:** contact@api-football.com
- **Discord:** https://discord.gg/api-football
- **Docs:** https://www.api-football.com/documentation-v3

---

## 🎉 ESTÁ PRONTO!

**Sistema já configurado para usar API-Football!**

Basta adicionar sua API key no `.env` e rodar:

```bash
# Adicionar no .env
echo "API_FOOTBALL_KEY=sua_chave_aqui" >> .env

# Testar
npm run update:athlete-images

# Ver resultado
npm start
```

---

**Quer que eu crie o script de teste da API-Football?** 🚀
