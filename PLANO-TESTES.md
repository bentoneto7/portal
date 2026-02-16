# 📋 PLANO DE TESTES COMPLETO - Portal de Notícias de Futebol

**Data:** 16 de Fevereiro de 2026
**URL de Produção:** https://portal-production-d8e6.up.railway.app
**Versão:** 1.0

---

## 🎯 OBJETIVO

Garantir que o portal de notícias funcione perfeitamente em todos os aspectos: funcionalidade, design, performance, SEO e acessibilidade.

---

## 📊 CATEGORIAS DE TESTE

### 1️⃣ TESTES FUNCIONAIS
### 2️⃣ TESTES DE UI/UX
### 3️⃣ TESTES DE PERFORMANCE
### 4️⃣ TESTES DE SEO
### 5️⃣ TESTES DE ACESSIBILIDADE
### 6️⃣ TESTES DE COMPATIBILIDADE
### 7️⃣ TESTES DE CONTEÚDO

---

## 1️⃣ TESTES FUNCIONAIS

### 🏠 PÁGINA INICIAL (`/`)

**Checklist:**
- [ ] Página carrega sem erros
- [ ] Logo aparece no header
- [ ] Título "Portal de Notícias de Futebol" visível
- [ ] Menu de categorias funciona:
  - [ ] Brasileirão
  - [ ] Internacional
  - [ ] Libertadores
  - [ ] Copa do Mundo
- [ ] Cards de notícias aparecem (mínimo 10)
- [ ] Cada card mostra:
  - [ ] Imagem do Unsplash
  - [ ] Título da notícia
  - [ ] Resumo (excerpt)
  - [ ] Categoria
  - [ ] Data de publicação
  - [ ] Tempo de leitura
- [ ] Hover nos cards muda visual
- [ ] Click no card abre artigo
- [ ] Scroll funciona suavemente
- [ ] Footer aparece com copyright

**Como Testar:**
```bash
# Abrir no navegador
https://portal-production-d8e6.up.railway.app/

# Verificar console do navegador (F12)
# Não deve ter erros JavaScript ou 404
```

---

### 📰 PÁGINA DE ARTIGO

**URLs para Testar:**

1. **Neymar Estreia Santos**
   ```
   /articles/pt-BR/brasileirao/neymar-estreia-santos-2026-velo-clube.html
   ```

2. **Real Madrid vs Benfica**
   ```
   /articles/pt-BR/internacional/real-madrid-perde-benfica-playoffs-champions.html
   ```

3. **Vinícius Jr Contrato**
   ```
   /articles/pt-BR/internacional/vinicius-jr-contrato-real-madrid-travado.html
   ```

**Checklist para CADA artigo:**
- [ ] Página carrega sem erros
- [ ] Imagem de banner aparece (do Unsplash)
- [ ] Título principal (H1) visível
- [ ] Categoria aparece
- [ ] Data de publicação formatada (16/02/2026)
- [ ] Tempo de leitura (5-6 minutos)
- [ ] Conteúdo completo visível
- [ ] Parágrafos formatados
- [ ] Subtítulos (H2, H3) estilizados
- [ ] Listas formatadas
- [ ] Citações (se houver) estilizadas
- [ ] Botão "Voltar" funciona
- [ ] Link "Voltar" leva para home
- [ ] Footer aparece

**Testes de Navegação:**
- [ ] Click em "Voltar" retorna para home
- [ ] Logo no header leva para home
- [ ] Menu de categorias funciona
- [ ] Navegação por teclado (Tab) funciona
- [ ] Enter no link abre página

---

### 🔍 NAVEGAÇÃO POR CATEGORIA

**Testar Filtros:**

1. **Brasileirão:**
   - [ ] Mostra apenas notícias do Brasileirão
   - [ ] Neymar Santos aparece
   - [ ] Neymar Renovação aparece

2. **Internacional:**
   - [ ] Mostra notícias internacionais
   - [ ] Real Madrid aparece
   - [ ] Vinícius Jr aparece
   - [ ] Haaland aparece
   - [ ] Chelsea aparece

3. **Libertadores:**
   - [ ] Mostra notícias da Libertadores
   - [ ] Semifinal aparece

4. **Copa do Mundo:**
   - [ ] Mostra notícias da Copa
   - [ ] Neymar Seleção aparece
   - [ ] Preparativos Copa aparece

**Como Testar:**
```javascript
// Abrir Console (F12) e testar filtro
const category = 'brasileirao';
const articles = articlesIndex.filter(a => a.category === category);
console.log(`Artigos de ${category}:`, articles);
```

---

## 2️⃣ TESTES DE UI/UX

### 🎨 DESIGN E LAYOUT

**Desktop (1920x1080):**
- [ ] Layout centralizado
- [ ] Largura máxima respeitada (1200px)
- [ ] Espaçamentos adequados
- [ ] Cards em grid 3 colunas
- [ ] Imagens proporcionais
- [ ] Fontes legíveis
- [ ] Cores harmoniosas

**Tablet (768x1024):**
- [ ] Layout ajusta para 2 colunas
- [ ] Menu responsivo
- [ ] Imagens redimensionam
- [ ] Textos legíveis
- [ ] Botões clicáveis

**Mobile (375x667 - iPhone SE):**
- [ ] Layout 1 coluna
- [ ] Menu hamburger (se implementado)
- [ ] Cards empilhados
- [ ] Imagens responsivas
- [ ] Textos legíveis
- [ ] Botões com área de toque adequada (44x44px)
- [ ] Scroll suave

**Como Testar:**
```bash
# Chrome DevTools (F12)
1. Click em "Toggle Device Toolbar" (Ctrl+Shift+M)
2. Testar resoluções:
   - iPhone SE (375x667)
   - iPad (768x1024)
   - Desktop (1920x1080)
3. Verificar layout em cada resolução
```

---

### 🖼️ IMAGENS

**Checklist:**
- [ ] Todas as 10 imagens carregam
- [ ] Não aparece ícone de imagem quebrada
- [ ] Imagens têm boa qualidade
- [ ] Proporção mantida (não esticadas)
- [ ] Lazy loading funciona
- [ ] Alt text presente (acessibilidade)
- [ ] Tempo de carregamento < 3s

**Imagens para Verificar:**
1. Real Madrid vs Benfica → Estádio
2. Vinícius Jr → Jogador
3. Haaland → Bola/Gol
4. Neymar Santos → Futebol BR
5. Chelsea Murillo → Premier League
6. Neymar Seleção → Copa
7. Neymar Renovação → Contrato
8. Brasileirão → Torcida
9. Libertadores → Troféu
10. Copa 2026 → Estádio Mundial

**Teste de Performance de Imagens:**
```javascript
// Console (F12)
performance.getEntriesByType("resource")
  .filter(r => r.name.includes('unsplash'))
  .forEach(r => console.log(`${r.name}: ${r.duration}ms`));
```

---

### 🎨 CORES E TIPOGRAFIA

**Esquema de Cores (Brasil):**
- [ ] Verde (#009C3B) - Headers, categorias
- [ ] Amarelo (#FFDF00) - Destaques, hover
- [ ] Azul (#002776) - Links, accent
- [ ] Branco (#FFFFFF) - Fundo
- [ ] Cinza (#333333) - Textos

**Fontes:**
- [ ] Títulos: Arial/Helvetica (negrito)
- [ ] Corpo: Arial/Helvetica (regular)
- [ ] Tamanhos legíveis:
  - [ ] H1: 32-36px
  - [ ] H2: 24-28px
  - [ ] H3: 20-24px
  - [ ] Corpo: 16-18px
  - [ ] Mobile: Ajustado proporcionalmente

**Contraste:**
- [ ] Texto preto em fundo branco (AA+)
- [ ] Texto branco em verde (mínimo AA)
- [ ] Links visíveis e sublinhados no hover

---

### ✨ INTERATIVIDADE

**Efeitos e Animações:**
- [ ] Hover nos cards:
  - [ ] Sombra aparece
  - [ ] Card levanta (transform)
  - [ ] Transição suave (0.3s)
- [ ] Hover nos links:
  - [ ] Cor muda
  - [ ] Sublinhado aparece
- [ ] Click visual feedback
- [ ] Scroll suave
- [ ] Loading states (se houver)

**Estados:**
- [ ] Normal
- [ ] Hover
- [ ] Active (clicado)
- [ ] Focus (navegação por teclado)
- [ ] Disabled (se aplicável)

---

## 3️⃣ TESTES DE PERFORMANCE

### ⚡ VELOCIDADE DE CARREGAMENTO

**Métricas Alvo:**
- [ ] **FCP (First Contentful Paint):** < 1.8s
- [ ] **LCP (Largest Contentful Paint):** < 2.5s
- [ ] **TTI (Time to Interactive):** < 3.8s
- [ ] **Total Blocking Time:** < 200ms
- [ ] **Cumulative Layout Shift:** < 0.1

**Ferramentas de Teste:**

1. **Google PageSpeed Insights:**
   ```
   https://pagespeed.web.dev/
   URL: https://portal-production-d8e6.up.railway.app/
   ```
   - [ ] Score Mobile > 90
   - [ ] Score Desktop > 95

2. **Chrome DevTools (F12 → Network):**
   ```bash
   # Limpar cache: Ctrl+Shift+R
   # Verificar:
   - [ ] Página completa < 2MB
   - [ ] Requests < 50
   - [ ] Imagens otimizadas
   ```

3. **GTmetrix:**
   ```
   https://gtmetrix.com/
   URL: https://portal-production-d8e6.up.railway.app/
   ```
   - [ ] Grade A ou B
   - [ ] Performance > 85%

---

### 📦 TAMANHO DOS RECURSOS

**Checklist:**
- [ ] HTML: < 50KB
- [ ] CSS: < 100KB
- [ ] JavaScript: < 200KB
- [ ] Imagens: < 200KB cada (Unsplash otimizado)
- [ ] Total da página: < 2MB
- [ ] Gzip/Brotli ativado

**Como Testar:**
```bash
# Chrome DevTools → Network
1. Reload com cache limpo (Ctrl+Shift+R)
2. Ver coluna "Size"
3. Ver coluna "Time"
4. Verificar se recursos estão comprimidos (gzip)
```

---

### 🚀 OTIMIZAÇÕES

**Checklist:**
- [ ] Imagens lazy load
- [ ] CSS minificado
- [ ] JavaScript minificado
- [ ] Fonts otimizadas
- [ ] Cache headers configurados
- [ ] CDN para imagens (Unsplash)
- [ ] Compressão Gzip/Brotli
- [ ] HTTP/2 ativo

---

## 4️⃣ TESTES DE SEO

### 🔍 META TAGS

**Página Inicial:**
```html
<!-- Verificar no HTML (Ctrl+U) -->
<title>Portal de Notícias de Futebol - Últimas Notícias</title>
<meta name="description" content="...">
<meta name="keywords" content="futebol, notícias, brasileirão, libertadores">

<!-- Open Graph (Facebook/WhatsApp) -->
<meta property="og:title" content="Portal de Notícias de Futebol">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:url" content="https://portal-production-d8e6.up.railway.app/">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
```

**Checklist:**
- [ ] Title único e descritivo (50-60 caracteres)
- [ ] Description atrativa (150-160 caracteres)
- [ ] Keywords relevantes
- [ ] Open Graph completo
- [ ] Twitter Card completo
- [ ] Canonical URL definido
- [ ] Lang="pt-BR" no HTML

**Páginas de Artigo:**
```html
<title>Título do Artigo | Portal de Notícias de Futebol</title>
<meta name="description" content="Excerpt do artigo...">
<meta property="og:type" content="article">
<meta property="article:published_time" content="2026-02-16">
<meta property="article:author" content="...">
<meta property="article:section" content="Brasileirão">
```

**Checklist:**
- [ ] Cada artigo tem título único
- [ ] Description usa excerpt
- [ ] og:type = "article"
- [ ] Data de publicação presente
- [ ] Autor definido
- [ ] Categoria/seção presente

---

### 🗺️ SITEMAP E ROBOTS

**Sitemap (sitemap.xml):**
- [ ] Existe em `/sitemap.xml`
- [ ] Lista todas as páginas
- [ ] URLs absolutas
- [ ] Prioridades definidas:
  - [ ] Home: 1.0
  - [ ] Artigos: 0.8
  - [ ] Categorias: 0.6
- [ ] Datas de modificação
- [ ] Formato XML válido

**Robots.txt (robots.txt):**
- [ ] Existe em `/robots.txt`
- [ ] Permite crawlers (User-agent: *)
- [ ] Referencia sitemap
- [ ] Bloqueia páginas privadas (se houver)

**Exemplo:**
```
User-agent: *
Allow: /
Sitemap: https://portal-production-d8e6.up.railway.app/sitemap.xml
```

---

### 🔗 ESTRUTURA DE URLs

**Checklist:**
- [ ] URLs amigáveis (sem query strings)
- [ ] Estrutura semântica:
  ```
  /articles/pt-BR/categoria/slug-do-artigo.html
  ```
- [ ] Lowercase
- [ ] Hífens ao invés de underscores
- [ ] Sem caracteres especiais
- [ ] Breadcrumbs no path

**Exemplos Corretos:**
✅ `/articles/pt-BR/brasileirao/neymar-estreia-santos-2026.html`
✅ `/articles/pt-BR/internacional/real-madrid-benfica.html`

**Evitar:**
❌ `/article.html?id=123`
❌ `/Artigo_Neymar.html`
❌ `/artigos/2026/02/16/notícia.html`

---

### 📊 TESTE DE SEO

**Ferramentas:**

1. **Google Search Console:**
   ```
   https://search.google.com/search-console
   ```
   - [ ] Propriedade verificada
   - [ ] Sitemap enviado
   - [ ] Sem erros de crawl
   - [ ] Mobile-friendly

2. **SEO Analyzer:**
   ```
   https://www.seoptimer.com/
   URL: https://portal-production-d8e6.up.railway.app/
   ```
   - [ ] Score > 75/100
   - [ ] Sem erros críticos

3. **Rich Results Test:**
   ```
   https://search.google.com/test/rich-results
   ```
   - [ ] Artigos com dados estruturados
   - [ ] Schema.org implementado

---

### 📱 COMPARTILHAMENTO SOCIAL

**Teste WhatsApp:**
```
1. Enviar URL para você mesmo
2. Verificar preview:
   - [ ] Imagem aparece
   - [ ] Título correto
   - [ ] Descrição atrativa
```

**Teste Facebook:**
```
https://developers.facebook.com/tools/debug/
1. Colar URL
2. Verificar preview
3. Corrigir avisos
```

**Teste Twitter:**
```
https://cards-dev.twitter.com/validator
1. Colar URL
2. Verificar card
3. Preview completo
```

---

## 5️⃣ TESTES DE ACESSIBILIDADE

### ♿ WCAG 2.1 COMPLIANCE

**Nível A (Mínimo):**
- [ ] Textos alternativos em imagens
- [ ] Contraste mínimo 4.5:1
- [ ] Navegação por teclado
- [ ] Labels em formulários
- [ ] HTML semântico
- [ ] Heading hierarchy (H1 > H2 > H3)

**Nível AA (Recomendado):**
- [ ] Contraste 7:1 para títulos
- [ ] Resize de texto até 200%
- [ ] Sem conteúdo piscante
- [ ] Skip links
- [ ] Focus visível

---

### 🎹 NAVEGAÇÃO POR TECLADO

**Teclas para Testar:**
- [ ] **Tab:** Navega entre elementos
- [ ] **Shift+Tab:** Navega para trás
- [ ] **Enter:** Ativa links/botões
- [ ] **Space:** Scroll down
- [ ] **Setas:** Navegação (se aplicável)
- [ ] **Esc:** Fecha modals (se houver)

**Checklist:**
- [ ] Todos os links acessíveis via Tab
- [ ] Focus visível (outline)
- [ ] Ordem lógica de navegação
- [ ] Sem keyboard trap
- [ ] Skip to content (se houver)

---

### 🔍 LEITORES DE TELA

**Testar com NVDA (Windows) ou VoiceOver (Mac):**

**NVDA (Grátis):**
```bash
# Download: https://www.nvaccess.org/
# Atalhos:
- Ctrl: Para leitura
- Insert+↓: Lê linha atual
- H: Próximo heading
- K: Próximo link
```

**Checklist:**
- [ ] Página title anunciado
- [ ] Headings anunciados
- [ ] Links descritivos
- [ ] Alt text em imagens
- [ ] ARIA labels (se houver)
- [ ] Landmarks (<nav>, <main>, <footer>)

---

### 🎨 CONTRASTE E COR

**Ferramentas:**

1. **WebAIM Contrast Checker:**
   ```
   https://webaim.org/resources/contrastchecker/
   ```
   - [ ] Texto preto (#333) em branco (#FFF): ✅ 12.6:1 (AAA)
   - [ ] Texto branco (#FFF) em verde (#009C3B): Verificar
   - [ ] Links azul (#002776) em branco: Verificar

2. **Chrome DevTools:**
   ```bash
   F12 → Elements → Computed → Accessibility
   # Verificar contraste de cada elemento
   ```

**Checklist:**
- [ ] Texto legível sem cor (para daltônicos)
- [ ] Links identificáveis sem cor
- [ ] Estados visíveis sem depender de cor

---

### 🏗️ HTML SEMÂNTICO

**Estrutura Correta:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>...</head>
<body>
  <header>
    <nav>...</nav>
  </header>
  <main>
    <article>...</article>
  </main>
  <footer>...</footer>
</body>
</html>
```

**Checklist:**
- [ ] Um H1 por página
- [ ] Headings em ordem (H1 → H2 → H3)
- [ ] <nav> para navegação
- [ ] <main> para conteúdo principal
- [ ] <article> para notícias
- [ ] <footer> para rodapé
- [ ] <section> para seções
- [ ] Tags semânticas ao invés de <div>

---

### 🔧 FERRAMENTAS DE TESTE

**1. WAVE (WebAIM):**
```
https://wave.webaim.org/
URL: https://portal-production-d8e6.up.railway.app/
```
- [ ] Sem erros (vermelho)
- [ ] Avisos (amarelo) revisados
- [ ] Estrutura correta

**2. axe DevTools:**
```bash
# Chrome Extension
# F12 → axe → Scan All
```
- [ ] Sem violações críticas
- [ ] Sem violações sérias

**3. Lighthouse (Chrome):**
```bash
F12 → Lighthouse → Accessibility
```
- [ ] Score > 90

---

## 6️⃣ TESTES DE COMPATIBILIDADE

### 🌐 NAVEGADORES

**Desktop:**
- [ ] **Chrome:** Versão 120+ (Windows/Mac/Linux)
- [ ] **Firefox:** Versão 121+
- [ ] **Safari:** Versão 17+ (Mac)
- [ ] **Edge:** Versão 120+ (Windows)

**Mobile:**
- [ ] **Chrome Mobile:** Android
- [ ] **Safari Mobile:** iOS
- [ ] **Firefox Mobile:** Android
- [ ] **Samsung Internet:** Android

**Checklist para Cada Browser:**
- [ ] Página carrega
- [ ] Layout correto
- [ ] Imagens aparecem
- [ ] JavaScript funciona
- [ ] CSS renderiza
- [ ] Interações funcionam
- [ ] Sem erros no console

---

### 📱 DISPOSITIVOS

**Smartphones:**
- [ ] iPhone SE (375x667)
- [ ] iPhone 12/13/14 (390x844)
- [ ] iPhone 14 Pro Max (430x932)
- [ ] Samsung Galaxy S21 (360x800)
- [ ] Pixel 5 (393x851)

**Tablets:**
- [ ] iPad (768x1024)
- [ ] iPad Pro (1024x1366)
- [ ] Galaxy Tab (800x1280)

**Desktop:**
- [ ] 1366x768 (laptop comum)
- [ ] 1920x1080 (Full HD)
- [ ] 2560x1440 (2K)
- [ ] 3840x2160 (4K)

---

### 🔄 ORIENTAÇÕES

**Mobile/Tablet:**
- [ ] Portrait (vertical)
- [ ] Landscape (horizontal)
- [ ] Rotação funciona
- [ ] Layout ajusta automaticamente

---

## 7️⃣ TESTES DE CONTEÚDO

### ✍️ QUALIDADE DO TEXTO

**Checklist:**
- [ ] Sem erros ortográficos
- [ ] Gramática correta
- [ ] Pontuação adequada
- [ ] Parágrafos bem formatados
- [ ] Títulos descritivos
- [ ] Subtítulos relevantes

**Ferramentas:**
```
# LanguageTool (extensão Chrome)
# Grammarly (para inglês)
```

---

### 🔗 LINKS

**Checklist:**
- [ ] Todos os links internos funcionam
- [ ] Links externos abrem em nova aba
- [ ] Sem links quebrados (404)
- [ ] Âncoras funcionam (#section)
- [ ] Links descritivos (não "clique aqui")

**Teste Automatizado:**
```bash
# Dead Link Checker
https://www.deadlinkchecker.com/
URL: https://portal-production-d8e6.up.railway.app/
```

---

### 📅 DATAS E HORÁRIOS

**Checklist:**
- [ ] Formato brasileiro (DD/MM/AAAA)
- [ ] Timezone correto (America/Sao_Paulo)
- [ ] Datas em ordem cronológica
- [ ] "Publicado em" visível
- [ ] Data relativa (se implementado):
  - [ ] "Há 2 horas"
  - [ ] "Ontem"
  - [ ] "Há 3 dias"

---

### 📊 CATEGORIZAÇÃO

**Checklist:**
- [ ] Todas as notícias têm categoria
- [ ] Categorias consistentes:
  - [ ] brasileirao
  - [ ] internacional
  - [ ] libertadores
  - [ ] copa
- [ ] Badge de categoria visível
- [ ] Filtro por categoria funciona
- [ ] Cores de categoria únicas

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

### ✅ APROVADO SE:
- [ ] **Funcional:** 100% dos testes passam
- [ ] **UI/UX:** Layout perfeito em todos os dispositivos
- [ ] **Performance:** Score > 90 no PageSpeed
- [ ] **SEO:** Score > 75 no SEOptimer
- [ ] **Acessibilidade:** Score > 90 no Lighthouse
- [ ] **Compatibilidade:** Funciona em todos os browsers principais
- [ ] **Conteúdo:** Sem erros, links funcionam

### ⚠️ REVISAR SE:
- [ ] Algum teste crítico falha
- [ ] Performance < 80
- [ ] Acessibilidade < 85
- [ ] Erros no console
- [ ] Links quebrados

### ❌ REPROVAR SE:
- [ ] Página não carrega
- [ ] Imagens quebradas
- [ ] Layout quebrado no mobile
- [ ] Performance < 50
- [ ] Erros JavaScript críticos

---

## 📝 RELATÓRIO DE TESTES

**Template:**

```markdown
# RELATÓRIO DE TESTES - [DATA]

## 🎯 SUMÁRIO
- Testes Executados: X/Y
- Testes Aprovados: X
- Testes Falhados: Y
- Taxa de Sucesso: Z%

## ✅ APROVADOS
1. [Nome do teste]
2. [Nome do teste]
...

## ❌ FALHADOS
1. [Nome do teste]
   - Problema: [Descrição]
   - Severidade: Alta/Média/Baixa
   - Screenshot: [Link]

## 🔧 AÇÕES NECESSÁRIAS
1. [Correção necessária]
2. [Melhoria sugerida]

## 📊 MÉTRICAS
- PageSpeed Score: X/100
- Lighthouse Score: X/100
- Accessibility Score: X/100
- SEO Score: X/100

## 🏆 CONCLUSÃO
[Aprovado / Aprovado com ressalvas / Reprovado]
```

---

## 🚀 TESTES AUTOMATIZADOS (OPCIONAL)

### 🤖 Scripts de Teste

**1. Teste de Links (Node.js):**
```javascript
// test-links.js
const https = require('https');
const links = [
  'https://portal-production-d8e6.up.railway.app/',
  'https://portal-production-d8e6.up.railway.app/articles/pt-BR/brasileirao/neymar-estreia-santos-2026-velo-clube.html',
  // ... outros links
];

links.forEach(url => {
  https.get(url, (res) => {
    console.log(`${url}: ${res.statusCode}`);
  });
});
```

**2. Lighthouse CI:**
```bash
npm install -g @lhci/cli
lhci autorun --collect.url=https://portal-production-d8e6.up.railway.app/
```

---

## 📞 SUPORTE

**Problemas Encontrados?**
- Anote screenshot
- Anote mensagem de erro
- Anote navegador/dispositivo
- Reporte para equipe de desenvolvimento

---

## ✅ CHECKLIST RÁPIDO (TL;DR)

### ANTES DE LANÇAR:
- [ ] Todas as imagens carregam
- [ ] Mobile funciona perfeitamente
- [ ] PageSpeed > 90
- [ ] Sem erros no console
- [ ] Todos os links funcionam
- [ ] SEO implementado
- [ ] Compartilhamento social funciona
- [ ] Acessibilidade > 90

### PONTO CRÍTICO:
**Se um usuário consegue:**
1. Abrir o site no celular ✅
2. Ver as notícias com imagens ✅
3. Clicar e ler artigo completo ✅
4. Voltar para home ✅
5. Compartilhar no WhatsApp ✅

**→ APROVADO! 🎉**

---

**Última atualização:** 16/02/2026
**Versão:** 1.0
**Próxima revisão:** Após correções