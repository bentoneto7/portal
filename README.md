# ⚽ Bola na Rede - Portal de Notícias de Futebol

> O blog de futebol brasileiro que não tem medo de falar a verdade. Análises sem filtro do Brasileirão Série A, mercado da bola, táticas e polêmicas.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Deploy](#deploy)
- [SEO e Performance](#seo-e-performance)
- [Customização](#customização)

---

## 🎯 Sobre o Projeto

**Bola na Rede** é um portal de notícias de futebol brasileiro moderno, responsivo e otimizado para SEO, com foco em:

- 📰 Notícias em tempo real do Brasileirão Série A 2026
- 💰 Mercado da bola e transferências
- 📊 Análises táticas e estatísticas (xG, pressing, etc.)
- 🏆 Cobertura completa da Copa do Mundo 2026
- 🔥 Opinião sem filtro sobre polêmicas do futebol

---

## ✨ Funcionalidades

### 🔴 Features Principais

- **News Ticker** - Barra rolante com últimas notícias ao vivo
- **Contador Copa 2026** - Countdown em tempo real (dias, horas, minutos, segundos)
- **Widget de Jogos** - Carrossel com placares, próximos jogos e resultados
- **Barra "Em Alta"** - Trending topics clicáveis
- **Seção de Colunistas** - Colunistas com avatares e prévias de artigos
- **19 Artigos Completos** - Conteúdo original sobre Brasileirão, Copa, mercado, táticas e opinião
- **Menu Mobile** - Hamburguer menu responsivo
- **Newsletter** - Formulário de inscrição
- **Enquete** - Votação interativa
- **Tabela Classificação** - Série A atualizada
- **Simulador** - Página para simular tabela do Brasileirão

### 📱 Responsividade

- ✅ Desktop (1920px+)
- ✅ Laptop (1366px - 1920px)
- ✅ Tablet (768px - 1366px)
- ✅ Mobile (320px - 768px)

### 🔍 SEO Otimizado

- ✅ Meta tags completas (Open Graph, Twitter Cards)
- ✅ Schema.org JSON-LD para artigos
- ✅ URLs semânticas e amigáveis
- ✅ Canonical URLs
- ✅ Sitemap.xml (configurável)
- ✅ Lazy loading de imagens
- ✅ Performance otimizada

---

## 🛠️ Tecnologias

### Frontend
- **HTML5** - Semântico e acessível
- **CSS3** - CSS moderno com variáveis CSS, Grid, Flexbox
- **Vanilla JavaScript** - Sem dependências de frameworks

### Backend
- **Node.js** - Servidor Express simples
- **JSON** - Base de dados de artigos

### Hospedagem
- **Railway** - Deploy automático via Git
- **GitHub** - Controle de versão

### Imagens
- **Unsplash** - Imagens de alta qualidade (livres para uso)

---

## 📁 Estrutura do Projeto

```
portal/
├── data/
│   ├── articles-index.json       # Índice de todos os artigos (19 artigos)
│   └── published-titles.json      # Controle de títulos publicados
├── public/
│   ├── articles/
│   │   └── pt-BR/
│   │       ├── brasileirao/      # 5 artigos
│   │       ├── copa/             # 4 artigos
│   │       ├── mercado/          # 4 artigos
│   │       ├── opiniao/          # 3 artigos
│   │       └── taticas/          # 3 artigos
│   ├── css/
│   │   ├── style.css             # Estilos principais (27KB)
│   │   └── article.css           # Estilos de artigos
│   ├── js/
│   │   └── main.js               # JavaScript principal (21KB)
│   ├── images/                   # Imagens locais (placeholders)
│   ├── index.html                # Homepage
│   ├── clubes.html               # Página de clubes
│   ├── simulador.html            # Simulador da tabela
│   ├── sobre.html                # Sobre nós
│   ├── contato.html              # Contato
│   ├── anuncie.html              # Anuncie conosco
│   ├── privacy.html              # Política de privacidade
│   └── terms.html                # Termos de uso
├── server.js                     # Servidor Express
├── package.json
└── README.md                     # Este arquivo
```

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ e npm

### Passo a passo

1. **Clone o repositório**
\`\`\`bash
git clone https://github.com/bentoneto7/portal.git
cd portal
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
\`\`\`

3. **Inicie o servidor de desenvolvimento**
\`\`\`bash
npm start
\`\`\`

4. **Acesse no navegador**
\`\`\`
http://localhost:4567
\`\`\`

---

## 🌐 Deploy

### Deploy no Railway

1. **Conecte o repositório GitHub no Railway**
2. **Configure a branch**: \`claude/news-portal-seo-5pQcP\`
3. **Variáveis de ambiente** (opcional):
   \`\`\`
   PORT=4567
   NODE_ENV=production
   \`\`\`
4. **Deploy automático** ativado ✅

### Deploy em outros serviços

- **Vercel**: \`vercel --prod\`
- **Netlify**: Configure \`netlify.toml\`
- **Heroku**: \`git push heroku main\`

---

## 🎨 Customização

### Alterar Cores

Edite as variáveis CSS em \`public/css/style.css\`:

\`\`\`css
:root {
    --bg-color: #0a0a0a;           /* Fundo principal */
    --text-color: #ffffff;          /* Texto principal */
    --primary-color: #00ff88;       /* Verde neon */
    --secondary-color: #ff0066;     /* Rosa/vermelho */
    --accent-yellow: #ffd700;       /* Amarelo Copa */
}
\`\`\`

### Adicionar Novos Artigos

1. Crie o arquivo HTML em \`public/articles/pt-BR/[categoria]/\`
2. Adicione entrada no \`data/articles-index.json\`:

\`\`\`json
{
  "id": "seu-artigo-id",
  "title": "Título do Artigo",
  "excerpt": "Resumo curto",
  "category": "brasileirao|copa|mercado|opiniao|taticas",
  "language": "pt-BR",
  "url": "/articles/pt-BR/categoria/seu-artigo-id.html",
  "image": "https://images.unsplash.com/photo-XXXXX",
  "publishedAt": "2026-02-17T10:00:00.000Z",
  "readingTime": 5
}
\`\`\`

3. Copie para \`public/data/articles-index.json\`

### Substituir Imagens

**Opção 1: Unsplash** (grátis, alta qualidade)
- Mantenha o formato: \`https://images.unsplash.com/photo-XXXXX?w=800&h=600&fit=crop&auto=format&q=80\`

**Opção 2: Imagens Próprias**
- Coloque em \`public/images/\`
- Atualize URLs no \`articles-index.json\`
- Certifique-se de ter direitos de uso

**Opção 3: Imagens Licenciadas** (Getty, AFP, Reuters)
- Adquira licenças
- Substitua URLs nos artigos

### Google AdSense

Descomente os blocos de anúncios em \`public/index.html\` e substitua \`ca-pub-SEUIDDOADSENSE\`:

\`\`\`html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-SEUIDDOADSENSE"
     crossorigin="anonymous"></script>
\`\`\`

---

## 📊 SEO e Performance

### Checklist SEO ✅

- [x] Meta tags completas (title, description, keywords)
- [x] Open Graph para Facebook/LinkedIn
- [x] Twitter Cards
- [x] Schema.org JSON-LD (NewsArticle)
- [x] Canonical URLs
- [x] URLs semânticas
- [x] Alt text em imagens
- [x] Heading hierarchy (H1, H2, H3)
- [x] Robots.txt
- [x] Sitemap.xml (configurável)

### Performance ✅

- [x] Lazy loading de imagens
- [x] CSS otimizado (27KB)
- [x] JavaScript otimizado (21KB)
- [x] Sem dependências externas pesadas
- [x] Imagens otimizadas do Unsplash
- [x] Cache-Control headers (configurável no servidor)

### Lighthouse Score (Objetivo)

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

---

## 📝 Artigos Criados (19 total)

### Brasileirão (5)
1. ⚽ Neymar volta e dá assistência na goleada do Santos 6-0
2. 🎭 Brasileirão entra em pausa para Carnaval
3. 🏥 Santos não quer apressar Neymar - joelho requer cuidados
4. 📊 Resultados da rodada 12 de fevereiro
5. 👨‍⚖️ CBF revoluciona arbitragem com R$ 1 milhão/mês

### Copa 2026 (4)
1. 💣 Ancelotti revela: 18 dos 26 jogadores já definidos
2. 🇧🇷 Brasil enfrenta França e Croácia em amistosos nos EUA
3. 🎯 Ancelotti impõe condições para Neymar voltar à Seleção
4. 🏟️ FIFA aprova estádios brasileiros para Copa 2026

### Mercado (4)
1. 💰 Palmeiras e Flamengo travam guerra por Luiz Henrique - €25M
2. 🛡️ Jhon Arias recusa Flamengo e Palmeiras por respeito ao Fluminense
3. 🏗️ Santos recebe R$ 1 bilhão para arena com Neymar Sr
4. ⏰ Janela de transferências fecha em 3 de março

### Opinião (3)
1. 🔥 VAR já causou 3 polêmicas em apenas 2 rodadas
2. 📱 CBF gasta milhões em iPhone 17 Pro para VAR, mas problema é outro
3. 💵 Palmeiras tem elenco mais valioso do Brasil - mas garante título?

### Táticas (3)
1. ⚡ A revolução do pressing no Brasileirão
2. 📈 Clubes brasileiros investem pesado em xG e analytics
3. 🎯 Palmeiras tem melhor ataque do Brasileirão 2026 - 7 gols em 2 jogos

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👤 Autor

**Equipe Bola na Rede**

- GitHub: [@bentoneto7](https://github.com/bentoneto7)
- Email: contato@bolanared.com

---

## 🙏 Agradecimentos

- [Unsplash](https://unsplash.com) - Imagens de alta qualidade
- [Railway](https://railway.app) - Hospedagem
- Comunidade de futebol brasileiro

---

**🎉 Site 100% funcional e otimizado! Pronto para produção.**

Última atualização: 17 de fevereiro de 2026
