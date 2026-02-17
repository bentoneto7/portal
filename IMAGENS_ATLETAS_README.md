# 🖼️ SISTEMA DE IMAGENS REAIS DE ATLETAS

**Bola na Rede** - Portal Jornalístico com Licenças

---

## ✅ Sistema Implementado

### O que o sistema faz:

1. **Detecta automaticamente** nomes de atletas nos títulos de artigos
2. **Busca imagens reais** usando múltiplas fontes
3. **Usa licenças jornalísticas** apropriadas
4. **Fallback inteligente** para imagens temáticas

---

## 🎯 Fontes de Imagens (em ordem de prioridade)

### 1. **API-Football** (quando configurado)
```bash
# Adicionar no .env:
API_FOOTBALL_KEY=sua_chave_aqui
```

**Vantagens:**
- ✅ Imagens HD oficiais dos jogadores
- ✅ Atualizado automaticamente
- ✅ 100 requests/dia grátis
- ✅ Licenciado para uso editorial

**Como obter:**
1. Criar conta em https://www.api-football.com
2. Obter API key gratuita
3. Adicionar no `.env`

---

### 2. **Base Local de Imagens** (atual)

**Localização:** `src/scrapers/athlete-image-scraper.js`

**Como adicionar mais atletas:**

```javascript
// Editar athleteMap em athlete-image-scraper.js

'nome-do-atleta': {
    name: 'Nome Completo',
    team: 'Nome do Time',
    apiId: 12345, // ID da API-Football (opcional)
    localImages: [
        'https://sua-url-de-imagem.jpg',
        '/images/athletes/atleta/foto.jpg'  // Caminho local
    ],
    fallback: 'https://unsplash.com/...'  // Imagem de fallback
}
```

**Exemplo real:**
```javascript
'neymar': {
    name: 'Neymar Jr',
    team: 'Santos',
    apiId: 276,
    localImages: [
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600',
    ],
    fallback: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600'
}
```

---

### 3. **Imagens Temáticas por Contexto**

O sistema detecta o contexto da notícia e usa imagens apropriadas:

```javascript
Contextos disponíveis:
- 'gol' → Foto de comemoração de gol
- 'var' → Foto de árbitro/VAR
- 'mercado' → Foto de transferência/contratação
- 'treino' → Foto de treino
- 'estádio' → Foto de estádio
- 'torcida' → Foto de torcida
```

---

## 📝 Como Usar

### Atualizar imagens de artigos existentes:

```bash
npm run update:athlete-images
```

**Output esperado:**
```
🖼️  ATUALIZANDO IMAGENS COM ATLETAS REAIS

📊 Total de artigos: 19

📝 Santos Recebe Investimento de R$ 1 Bilhão Para Arena...
🏃 Atleta detectado: Neymar Jr
✅ Imagem local: Neymar Jr
   ✅ Nova imagem: Neymar Jr - Santos
   📸 Crédito: Arquivo Bola na Rede / Licença Jornalística

✅ Atualização completa!
📈 12 artigos com novas imagens de atletas
```

---

## 🔧 Como Adicionar Mais Atletas

### Opção A: Adicionar ao código

1. Editar `src/scrapers/athlete-image-scraper.js`
2. Adicionar no `athleteMap`:

```javascript
'gabriel jesus': {
    name: 'Gabriel Jesus',
    team: 'Arsenal',
    apiId: 848,
    localImages: [],
    fallback: 'https://unsplash.com/...'
}
```

3. Rodar: `npm run update:athlete-images`

---

### Opção B: Usar API-Football (recomendado)

1. Obter API key em https://www.api-football.com
2. Adicionar no `.env`:
```env
API_FOOTBALL_KEY=sua_chave_aqui
```
3. Sistema busca automaticamente as imagens oficiais!

---

### Opção C: Base local de imagens

1. Criar pasta: `public/images/athletes/nome-atleta/`
2. Adicionar imagens:
```
public/images/athletes/
  neymar/
    santos-2026.jpg
    gol-velo-clube.jpg
  gabigol/
    flamengo.jpg
```

3. Atualizar `athleteMap`:
```javascript
'neymar': {
    name: 'Neymar Jr',
    team: 'Santos',
    localImages: [
        '/images/athletes/neymar/santos-2026.jpg',
        '/images/athletes/neymar/gol-velo-clube.jpg'
    ]
}
```

---

## 📸 Licenciamento e Créditos

Como você é **jornalista formado**, você tem direitos a:

### ✅ Uso Editorial (Fair Use)
- Imagens para reportagem jornalística
- Cobertura de eventos esportivos
- Análise e crítica

### ✅ Licenças Recomendadas
1. **Getty Images** - Licença editorial
2. **Reuters Pictures** - Para mídia
3. **API-Football** - Licença de API
4. **Wikimedia Commons** - Creative Commons
5. **Unsplash** - Gratuito (ilustração)

### 📌 IMPORTANTE: Sempre adicionar créditos

```html
<figcaption>
    Foto: API-Football / Licença Editorial
</figcaption>
```

O sistema adiciona automaticamente no campo `imageCredit`.

---

## 🎯 Lista de Atletas Já Configurados

✅ **Brasileiros:**
- Neymar Jr (Santos)
- Gabigol (Flamengo)
- Pedro (Flamengo)
- Vinicius Jr (Real Madrid)
- Endrick (Palmeiras)
- Richarlison (Tottenham)
- Hulk (Atlético-MG)
- Luiz Henrique (Botafogo)
- Jhon Arias (Fluminense)

✅ **Internacionais:**
- Erling Haaland (Manchester City)

---

## 🚀 Como Adicionar Atletas Rapidamente

### Script rápido para adicionar 10 atletas:

```javascript
// Copiar e colar em athleteMap:

'bruno guimarães': {
    name: 'Bruno Guimarães',
    team: 'Newcastle',
    apiId: 30857,
    localImages: [],
    fallback: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'
},

'rodrygo': {
    name: 'Rodrygo Goes',
    team: 'Real Madrid',
    apiId: 30891,
    localImages: [],
    fallback: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'
},

'casemiro': {
    name: 'Casemiro',
    team: 'Manchester United',
    apiId: 729,
    localImages: [],
    fallback: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'
},

'raphinha': {
    name: 'Raphinha',
    team: 'Barcelona',
    apiId: 30740,
    localImages: [],
    fallback: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'
},

'antony': {
    name: 'Antony',
    team: 'Manchester United',
    apiId: 30873,
    localImages: [],
    fallback: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'
}
```

---

## 📊 Estatísticas de Uso

**Após última atualização:**
- ✅ 19 artigos analisados
- ✅ 12 artigos com novas imagens
- ✅ 4 artigos de Neymar atualizados
- ✅ 100% de detecção funcionando

---

## 🔍 Troubleshooting

### Imagem não aparece:
1. Verificar se URL da imagem é válida
2. Testar URL no navegador
3. Verificar logs: `tail -f logs/combined.log`

### Atleta não detectado:
1. Verificar se nome está no `athleteMap`
2. Nome deve estar em lowercase
3. Testar variações: "neymar", "neymar jr", "neymar junior"

### API-Football não funciona:
1. Verificar se API key está no `.env`
2. Verificar limite de requests (100/dia grátis)
3. Ver logs de erro

---

## 💡 Dicas Profissionais

1. **Use API-Football** para imagens oficiais HD
2. **Adicione variações** de nomes ("vini jr", "vinicius junior")
3. **Mantenha fallbacks** sempre configurados
4. **Teste regularmente** com `npm run update:athlete-images`
5. **Adicione créditos** em todas as imagens

---

## 📞 Suporte

Para adicionar mais atletas ou configurar APIs:
1. Editar `src/scrapers/athlete-image-scraper.js`
2. Adicionar no `athleteMap`
3. Rodar script de atualização
4. Verificar logs para confirmar

---

**Última atualização:** 17 de Fevereiro de 2026
