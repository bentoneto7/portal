# 🗞️ Portal de Notícias com IA Jornalista

Portal de notícias automatizado que usa Inteligência Artificial para criar conteúdo original baseado em múltiplas fontes. Sistema completo para monetização com Google Adsense.

## 🎯 Características Principais

- ✅ **Conteúdo 100% Original** - IA reescreve notícias com perspectiva crítica
- ✅ **Multilíngue** - Suporta Português (BR), Inglês (US) e Espanhol
- ✅ **SEO Otimizado** - Meta tags, Schema.org, Sitemap, Open Graph
- ✅ **Monetização** - Preparado para Google Adsense
- ✅ **Publicação Automática** - Sistema autônomo de agregação e publicação
- ✅ **Responsivo** - Design mobile-first
- ✅ **Verificação de Fatos** - IA valida informações de múltiplas fontes

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐
│  News Sources   │ (NewsAPI, NewsData, Currents)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ News Aggregator │ (Coleta e agrupa notícias similares)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Journalist AI   │ (Claude - Cria conteúdo original)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Publisher     │ (Gera HTML e publica)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Web Server     │ (Express + API)
└─────────────────┘
```

## 📦 Estrutura de Diretórios

```
portal/
├── public/                 # Arquivos públicos
│   ├── index.html         # Página principal
│   ├── css/
│   │   └── style.css      # Estilos responsivos
│   ├── js/
│   │   └── main.js        # JavaScript do frontend
│   ├── articles/          # Artigos publicados (gerados)
│   │   ├── pt-BR/
│   │   ├── en-US/
│   │   └── es/
│   └── robots.txt         # SEO
│
├── src/
│   ├── agents/
│   │   └── journalist-agent.js      # IA Jornalista
│   ├── scrapers/
│   │   └── news-aggregator.js       # Agregador de notícias
│   ├── publisher/
│   │   └── automated-publisher.js   # Sistema de publicação
│   ├── server.js          # Servidor Express
│   └── index.js           # Entry point
│
├── data/                  # Dados e índices (gerado)
│   ├── articles-index.json
│   ├── published-titles.json
│   └── indices/
│
├── config/                # Configurações
├── .env                   # Variáveis de ambiente
└── package.json
```

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

- Node.js 16+
- Chave da API Anthropic (Claude)
- Chaves de APIs de notícias (pelo menos uma)

### 2. Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd portal

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
nano .env  # Edite com suas chaves de API
```

### 3. Configuração do .env

```env
# OBRIGATÓRIO: Chave da Anthropic para IA Jornalista
ANTHROPIC_API_KEY=sk-ant-api03-sua-chave-aqui

# APIs de Notícias (pelo menos uma recomendado)
NEWS_API_KEY=sua-chave-newsapi
NEWSDATA_API_KEY=sua-chave-newsdata
CURRENTS_API_KEY=sua-chave-currents

# Configurações do servidor
PORT=3000
MIN_SOURCES=2
PUBLISH_INTERVAL=1800000  # 30 minutos em ms
```

### 4. Executar

```bash
# Modo produção
npm start

# Modo desenvolvimento (com auto-reload)
npm run dev

# Apenas servidor (sem publicação automática)
npm run server
```

## 🔑 Obtendo Chaves de API

### Anthropic API (OBRIGATÓRIO)
1. Acesse: https://console.anthropic.com/
2. Crie uma conta
3. Vá em "API Keys"
4. Crie uma nova chave
5. Cole no `.env` como `ANTHROPIC_API_KEY`

### NewsAPI (Recomendado)
1. Acesse: https://newsapi.org/
2. Registre-se gratuitamente
3. Copie sua API key
4. Cole no `.env` como `NEWS_API_KEY`

### NewsData.io (Opcional)
- https://newsdata.io/

### Currents API (Opcional)
- https://currentsapi.services/

## 📝 Como Funciona o Agente Jornalista

O sistema usa IA avançada (Claude) para criar conteúdo original:

### Processo de Criação de Artigos

1. **Agregação**: Coleta múltiplas fontes sobre o mesmo tema
2. **Análise**: IA analisa todas as fontes identificando fatos principais
3. **Verificação**: Compara informações entre fontes
4. **Criação**: Escreve artigo ORIGINAL com perspectiva crítica
5. **Validação**: Verifica qualidade e integridade jornalística
6. **Publicação**: Gera HTML otimizado para SEO

### Prompts Profissionais

O agente jornalista segue regras rigorosas:

- ✅ **NUNCA copia** texto literal das fontes
- ✅ **NUNCA inventa** fatos ou citações
- ✅ Mantém **neutralidade** em temas sensíveis
- ✅ Usa **múltiplas fontes** para validação
- ✅ Escreve com **estilo jornalístico** profissional
- ✅ Cita **fontes conflitantes** quando necessário

## 💰 Monetização com Google Adsense

### Preparação

1. **Crie conta no Adsense**: https://www.google.com/adsense/
2. **Aguarde aprovação** (requer conteúdo original e tráfego)
3. **Obtenha seus IDs** de cliente e slots
4. **Atualize os arquivos HTML**:

```javascript
// Em public/index.html e templates de artigos
// Substitua XXXXXXXXXXXXXXXX pelo seu ID
data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
data-ad-slot="XXXXXXXXXX"
```

### Posicionamento de Anúncios

O sistema já inclui:
- ✅ Banner topo
- ✅ Anúncios in-feed entre notícias
- ✅ Anúncios in-article dentro dos artigos
- ✅ Sidebar responsiva

### Dicas para Aprovação Adsense

1. **Conteúdo Original**: ✅ O sistema já garante isso
2. **Tráfego**: Promova seu portal nas redes sociais
3. **Design Profissional**: ✅ Já incluído
4. **Política de Privacidade**: Crie uma página
5. **Domínio Próprio**: Registre um domínio (.com, .com.br)

## 🎯 SEO e Otimizações

### SEO On-Page (Implementado)

- ✅ Meta tags otimizadas
- ✅ Schema.org (NewsArticle, Organization)
- ✅ Open Graph para redes sociais
- ✅ Twitter Cards
- ✅ URLs amigáveis (slugs)
- ✅ Sitemap XML automático
- ✅ RSS Feed
- ✅ robots.txt
- ✅ Canonical URLs
- ✅ Alt tags em imagens
- ✅ Responsive design
- ✅ Fast loading

### Melhorias Recomendadas

1. **Domínio Próprio**: Registre um domínio relevante
2. **HTTPS**: Use Cloudflare ou Let's Encrypt
3. **CDN**: CloudFlare para velocidade
4. **Google Search Console**: Submeta seu sitemap
5. **Backlinks**: Compartilhe nas redes sociais
6. **Google Analytics**: Monitore tráfego

## 🌍 Suporte Multilíngue

O sistema suporta 3 idiomas:

- 🇧🇷 **Português (Brasil)**: Notícias do Brasil
- 🇺🇸 **Inglês (EUA)**: Notícias dos Estados Unidos
- 🇲🇽 **Espanhol (México)**: Notícias da América Latina

### Como Adicionar Novos Idiomas

Edite `src/scrapers/news-aggregator.js`:

```javascript
this.countryMappings = {
    'pt-BR': { country: 'br', language: 'pt' },
    'en-US': { country: 'us', language: 'en' },
    'es': { country: 'mx', language: 'es' },
    // Adicione novo idioma aqui
    'fr-FR': { country: 'fr', language: 'fr' }
};
```

## 🔧 Customização

### Categorias

Edite em `src/scrapers/news-aggregator.js`:

```javascript
this.categoryMappings = {
    'brasil': 'general',
    'mundo': 'world',
    'economia': 'business',
    'tecnologia': 'technology',
    // Adicione mais categorias
    'saude': 'health',
    'esportes': 'sports'
};
```

### Estilo Visual

Personalize `public/css/style.css`:

```css
:root {
    --primary-color: #0066cc;  /* Cor principal */
    --secondary-color: #333;    /* Cor secundária */
    --accent-color: #ff4444;    /* Cor de destaque */
}
```

### Intervalo de Publicação

No `.env`:

```env
# 30 minutos = 1800000 ms
# 1 hora = 3600000 ms
PUBLISH_INTERVAL=1800000
```

## 📊 API Endpoints

```
GET  /                       # Homepage
GET  /api/featured           # Artigo em destaque
GET  /api/news?category=X    # Notícias por categoria
GET  /api/trending           # Mais lidas
POST /api/newsletter/subscribe  # Newsletter
GET  /sitemap.xml            # Sitemap
GET  /rss.xml                # RSS Feed
GET  /health                 # Health check
```

## 🛡️ Aspectos Legais

### O Que o Sistema FAZ

- ✅ Analisa múltiplas fontes
- ✅ Cria conteúdo ORIGINAL inspirado nos fatos
- ✅ Reescreve com perspectiva única
- ✅ Mantém integridade factual

### O Que o Sistema NÃO FAZ

- ❌ NÃO copia texto das fontes
- ❌ NÃO plagia conteúdo
- ❌ NÃO inventa informações falsas
- ❌ NÃO republica sem transformação

### Responsabilidade

- Você é responsável pelo conteúdo publicado
- Revise artigos importantes manualmente
- Mantenha política de correções
- Respeite direitos autorais

## 📈 Estratégia de Crescimento

### Fase 1: Lançamento (Mês 1-2)

1. Configure e publique o portal
2. Registre no Google Search Console
3. Crie perfis em redes sociais
4. Publique 50-100 artigos iniciais

### Fase 2: SEO (Mês 2-3)

1. Construa backlinks orgânicos
2. Compartilhe artigos nas redes
3. Otimize títulos baseado em analytics
4. Adicione mais categorias

### Fase 3: Monetização (Mês 3-4)

1. Aplique para Google Adsense
2. Otimize posicionamento de anúncios
3. Teste diferentes formatos
4. Monitore métricas

### Fase 4: Escala (Mês 4+)

1. Aumente frequência de publicação
2. Adicione mais idiomas
3. Crie newsletter ativa
4. Considere outros formatos (vídeo, podcast)

## 🐛 Troubleshooting

### Erro: "ANTHROPIC_API_KEY not configured"

- Verifique se o arquivo `.env` existe
- Confirme que a chave está correta
- Reinicie o servidor

### Erro: "Failed to load news"

- Verifique suas chaves de API de notícias
- Confirme conexão com internet
- Verifique limites de rate da API

### Artigos não aparecem

- Aguarde o primeiro ciclo de publicação (30 min)
- Verifique logs do console
- Confirme que há fontes de notícias configuradas

### Performance lenta

- Aumente intervalo de publicação
- Use CDN para assets estáticos
- Otimize imagens
- Configure cache

## 📞 Suporte

- Issues: Abra uma issue no GitHub
- Documentação: Leia este README
- Logs: Verifique console para erros

## 🎓 Próximos Passos

1. **Configure suas APIs**
2. **Execute o sistema**: `npm start`
3. **Aguarde primeiros artigos** (30 min)
4. **Acesse**: http://localhost:3000
5. **Customize visual e categorias**
6. **Registre domínio próprio**
7. **Aplique para Adsense**
8. **Promova nas redes sociais**

## 📄 Licença

MIT License - Use livremente para projetos comerciais

---

**Desenvolvido com ❤️ usando Claude AI**

Boa sorte com seu portal de notícias! 🚀
