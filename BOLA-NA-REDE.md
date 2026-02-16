# ⚽ BOLA NA REDE - Documentação Completa

**O blog de futebol brasileiro que não tem medo de falar a verdade**

---

## 🎯 VISÃO GERAL

**Bola na Rede** é um blog 100% focado em futebol brasileiro, especificamente no Brasileirão Série A 2026.

### Diferencial
- **Tom direto e provocador** - Sem medo de criticar
- **Análises com dados** - xG, estatísticas, táticas
- **Sem clubismo** - Criticamos todos quando merecem
- **Polêmicas necessárias** - Falamos o que a imprensa não fala

---

## 🏗️ ESTRUTURA COMPLETA

### **Páginas Principais**

#### 🏠 Home (`/index.html`)
- Destaque principal (hero)
- 4 seções de conteúdo:
  - **Série A** - Últimas do Brasileirão
  - **Mercado da Bola** - Transferências e rumores
  - **Opinião** - Colunas sem filtro
  - **Táticas e Dados** - Análises profundas (xG, mapas)
- **Sidebar:**
  - Widget Classificação Série A (top 8 + bottom 4)
  - Newsletter
  - Enquete da semana
  - Mais lidas

#### ⚽ Clubes (`/clubes.html`)
- Grid com os 20 times da Série A
- Links para página individual de cada clube
- Escudos em emoji coloridos

#### 🎮 Simulador (`/simulador.html`)
- **Ferramenta interativa**
- Simule resultados da próxima rodada
- Cálculo automático de tabela
- Zonas coloridas (Libertadores/Rebaixamento)

### **Páginas Institucionais**

| Página | URL | Descrição |
|--------|-----|-----------|
| Sobre | `/sobre.html` | Missão, valores, quem somos |
| Contato | `/contato.html` | Email, redes sociais, colaboradores |
| Anuncie | `/anuncie.html` | Mídia kit, formatos de anúncio |
| Privacidade | `/privacy.html` | Política de privacidade (LGPD) |
| Termos | `/terms.html` | Termos de uso |

---

## 📊 CONTEÚDO

### **Artigos Existentes: 19**

| Categoria | Quantidade | Exemplos |
|-----------|------------|----------|
| **Mercado** | 3 | Palmeiras contrata, Flamengo vendas, SP renova |
| **Opinião** | 3 | VAR rouba?, Técnico vai cair, Rebaixamento |
| **Táticas** | 3 | Sistema 4-2-3-1, xG artilheiros, Defesa zona vs linha |
| Brasileirão | 3 | Neymar Santos (3x) |
| Internacional | 4 | Real Madrid, Vinícius Jr, Haaland, Chelsea |
| Copa | 2 | Neymar Seleção |
| Libertadores | 1 | Brasileiro semifinal |

### **Sistema de Categorias**

```javascript
// Mapeamento atual (temporário)
'serie-a' → 'brasileirao'
'mercado' → artigos específicos de mercado
'opiniao' → artigos de opinião
'taticas' → análises táticas
```

---

## 🎨 DESIGN

### **Dark Mode Vibrante (Padrão)**

```css
/* Cores Principais */
--bg-color: #0a0e14          /* Fundo escuro */
--card-bg: #1a2332           /* Cards */
--primary-color: #00ff88     /* Verde neon */
--secondary-color: #ff3366   /* Rosa vibrante */
--accent-yellow: #ffd700     /* Ouro */
--accent-blue: #00d4ff       /* Cyan */
```

### **Componentes Estilizados**

- ✅ Header com borda neon
- ✅ Logo com glow effect
- ✅ Navegação com hover vibrante
- ✅ Cards com bordas animadas
- ✅ Badges com gradientes
- ✅ Botões neon com sombra
- ✅ Widgets modernos
- ✅ Footer dark

---

## 💻 TECNOLOGIAS

### **Frontend**
- HTML5 semântico
- CSS3 (Grid + Flexbox + Custom Properties)
- JavaScript Vanilla (ES6+)
- **SEM frameworks** (100% estático)

### **Backend**
- Node.js 16+ (opcional, para geração de conteúdo)
- Express.js
- Anthropic Claude API (geração de artigos)

### **Dados**
- `articles-index.json` - Índice de todos os artigos
- Mock data para tabela e enquete
- Sistema de categorias

---

## 🚀 FUNCIONALIDADES

### **✅ IMPLEMENTADAS**

1. **Identidade Forte**
   - Nome: "Bola na Rede"
   - Tagline: "O futebol sem filtro que você não vê na TV"
   - Tom provocador e direto

2. **Navegação Completa**
   - Série A, Mercado, Opinião, Táticas
   - Clubes, Simulador
   - Páginas institucionais

3. **Widgets Interativos**
   - ✅ Classificação Série A (atualizada)
   - ✅ Enquete da semana (funcional)
   - ✅ Newsletter (formulário)
   - ✅ Mais lidas

4. **Simulador de Tabela**
   - ✅ 100% funcional
   - ✅ Cálculo em tempo real
   - ✅ Zonas coloridas
   - ✅ Ordenação inteligente

5. **SEO Otimizado**
   - ✅ Meta tags completas
   - ✅ Open Graph
   - ✅ Twitter Cards
   - ✅ Schema.org (JSON-LD)
   - ✅ Sitemap.xml
   - ✅ robots.txt
   - ✅ URLs amigáveis

6. **Performance**
   - ✅ Lazy loading de imagens
   - ✅ CSS minificado (variáveis)
   - ✅ JavaScript otimizado
   - ✅ Sem dependências externas

### **📋 TODO (Futuras Implementações)**

1. **Páginas Individuais dos Clubes**
   - Template pronto (`/clubes.html`)
   - Criar 20 páginas (Flamengo, Palmeiras, etc.)
   - Notícias específicas por time

2. **Dados Táticos Avançados**
   - Integração com API de estatísticas
   - xG real (não mock)
   - Mapas de calor reais
   - Comparativos visuais

3. **Sistema de Comentários**
   - Disqus ou alternativa
   - Moderação de comentários

4. **Newsletter Backend**
   - Integração com Mailchimp/SendGrid
   - Envio automático diário (7h)

5. **Busca Funcional**
   - Busca por time, jogador, palavra-chave
   - Autocomplete

---

## 📦 ESTRUTURA DE ARQUIVOS

```
portal/
├── public/
│   ├── index.html           ⭐ Home principal
│   ├── sobre.html           ⭐ Sobre nós
│   ├── contato.html         ⭐ Contato
│   ├── anuncie.html         ⭐ Mídia kit
│   ├── privacy.html         ⭐ Privacidade
│   ├── terms.html           ⭐ Termos
│   ├── clubes.html          ⭐ Lista de clubes
│   ├── simulador.html       ⭐ Simulador interativo
│   ├── css/
│   │   ├── style.css        ⭐ Estilos principais (dark mode)
│   │   └── article.css      ⭐ Estilos de artigos
│   ├── js/
│   │   └── main.js          ⭐ JavaScript principal
│   ├── images/
│   ├── articles/            📰 Artigos gerados
│   │   └── pt-BR/
│   │       ├── mercado/
│   │       ├── opiniao/
│   │       ├── taticas/
│   │       ├── brasileirao/
│   │       └── ...
│   ├── robots.txt           🔍 SEO
│   └── sitemap.xml          🔍 SEO
│
├── data/
│   └── articles-index.json  📊 Índice de artigos (19)
│
├── src/                     🤖 Backend (opcional)
├── config/                  ⚙️ Configurações
└── README.md
```

---

## 🎯 COMO USAR

### **1. Visualizar Localmente**

```bash
# Opção 1: Servidor Python
cd portal/public
python3 -m http.server 8000

# Opção 2: Node.js http-server
npx http-server public -p 8000

# Acesse: http://localhost:8000
```

### **2. Deploy**

O projeto é **100% estático** e pode ser hospedado em:

- ✅ **Railway** (atual)
- ✅ Vercel
- ✅ Netlify
- ✅ GitHub Pages
- ✅ Cloudflare Pages

### **3. Adicionar Novo Artigo**

1. Criar HTML do artigo em `/public/articles/pt-BR/[categoria]/`
2. Adicionar entrada no `data/articles-index.json`:

```json
{
  "id": "slug-do-artigo",
  "title": "Título Chamativo",
  "excerpt": "Resumo do artigo...",
  "category": "mercado|opiniao|taticas|brasileirao",
  "language": "pt-BR",
  "url": "/articles/pt-BR/categoria/slug.html",
  "image": "https://images.unsplash.com/...",
  "publishedAt": "2026-02-16T12:00:00.000Z",
  "readingTime": 5
}
```

### **4. Atualizar Tabela de Classificação**

Editar em `/public/js/main.js`:

```javascript
const tabelaSerieA = {
    data: [
        { pos: 1, time: 'Botafogo', pontos: 52, ... },
        // ... atualizar pontos e posições
    ]
};
```

### **5. Criar Nova Enquete**

Editar em `/public/js/main.js`:

```javascript
const enquete = {
    question: 'Sua pergunta aqui?',
    options: [
        { id: 1, text: 'Opção 1', votes: 100 },
        { id: 2, text: 'Opção 2', votes: 200 },
        // ...
    ]
};
```

---

## 📈 ANALYTICS & MONETIZAÇÃO

### **Google Adsense**

Placeholders prontos em:
- Header (`ad-top`)
- Sidebar (`ad-sidebar`)
- Feed (`ad-feed`)

**Para ativar:**
1. Substituir `ca-pub-XXXXXXXXXXXXXXXX` pelo seu ID
2. Adicionar slots reais

### **Google Analytics**

Adicionar no `<head>` de todas as páginas:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🔧 MANUTENÇÃO

### **Arquivos Críticos**

| Arquivo | Função | Atualização |
|---------|--------|-------------|
| `articles-index.json` | Índice de artigos | A cada novo artigo |
| `main.js` | Lógica principal | Raramente |
| `style.css` | Estilos dark mode | Raramente |
| `sitemap.xml` | SEO | Mensal |

### **Checklist Mensal**

- [ ] Atualizar tabela de classificação
- [ ] Criar nova enquete
- [ ] Verificar links quebrados
- [ ] Atualizar sitemap
- [ ] Revisar analytics
- [ ] Adicionar novos artigos (mínimo 12/mês)

---

## 🎨 PERSONALIZAÇÃO

### **Mudar Cores**

Editar em `/public/css/style.css`:

```css
:root {
    --primary-color: #00ff88;    /* Verde neon */
    --secondary-color: #ff3366;  /* Rosa */
    /* ... */
}
```

### **Mudar Logo**

Editar em todos os HTML:

```html
<h1><a href="/">⚽ BOLA NA REDE</a></h1>
<p class="tagline">Seu novo tagline aqui</p>
```

---

## 📞 SUPORTE

- **Email:** contato@bolanarede.com
- **Documentação:** Este arquivo
- **Issues:** GitHub Issues (se aplicável)

---

## 📜 LICENÇA

© 2026 Bola na Rede. Todos os direitos reservados.

Conteúdo editorial protegido por liberdade de expressão.

---

## 🎉 CRÉDITOS

**Desenvolvido por:** Claude Code
**Data:** 16 de Fevereiro de 2026
**Versão:** 1.0.0
**Status:** ✅ PRODUÇÃO

---

## 🚀 PRÓXIMOS PASSOS RECOMENDADOS

1. ✅ **Deploy no Railway** (já feito)
2. 📝 Criar 20+ artigos por mês
3. 🎯 Aplicar para Google Adsense
4. 📊 Configurar Google Analytics
5. 📱 Promover nas redes sociais
6. 🔗 Criar backlinks (SEO)
7. 📧 Crescer base de newsletter
8. 👥 Recrutar colunistas
9. 📈 Monitorar métricas
10. 💰 Monetizar (ads + patrocínios)

---

**Bola na Rede** - O futebol sem filtro que você não vê na TV ⚽🔥
