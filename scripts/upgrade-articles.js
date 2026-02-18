#!/usr/bin/env node
/**
 * Upgrade dos artigos: imagens temáticas, recomendações e CSS fixes
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '../public/articles/pt-BR');
const IMAGES_DIR = path.join(__dirname, '../public/images/articles');
const DATA_DIR = path.join(__dirname, '../data');
const PUBLIC_DATA_DIR = path.join(__dirname, '../public/data');
const SITE_URL = 'https://portal-production-d8e6.up.railway.app';

// Carrega o índice
const indexPath = path.join(DATA_DIR, 'articles-index.json');
const articles = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

// ============================================================
// 1. GERAR SVGs TEMÁTICOS COM ILUSTRAÇÕES
// ============================================================

const articleThemes = {
  'brasileirao-3a-rodada-resultados-12-fev': {
    bg: ['#0d4f22', '#071a0d'],
    accent: '#2ecc71',
    illustration: 'stadium',
    subtitle: '3ª RODADA'
  },
  'remo-volta-serie-a-32-anos-emocao': {
    bg: ['#003366', '#001a33'],
    accent: '#00bfff',
    illustration: 'celebration',
    subtitle: 'HISTÓRICO'
  },
  'neymar-volta-gramados-santos-6x0-velo-clube': {
    bg: ['#1a1a2e', '#0a0a15'],
    accent: '#f1c40f',
    illustration: 'player',
    subtitle: 'NEYMAR JR'
  },
  'santos-crise-temporada-2026-numeros': {
    bg: ['#1a1a1a', '#0d0d0d'],
    accent: '#e74c3c',
    illustration: 'stats',
    subtitle: 'ANÁLISE'
  },
  'ancelotti-18-convocados-copa-2026-definidos': {
    bg: ['#002776', '#001040'],
    accent: '#ffdf00',
    illustration: 'trophy',
    subtitle: 'CONVOCAÇÃO'
  },
  'road-to-26-brasil-franca-croacia-amistosos': {
    bg: ['#009c3b', '#005520'],
    accent: '#ffdf00',
    illustration: 'flags',
    subtitle: 'ROAD TO 26'
  },
  'cruzeiro-gerson-30-milhoes-euros-maior-contratacao': {
    bg: ['#003399', '#001a4d'],
    accent: '#e67e22',
    illustration: 'transfer',
    subtitle: 'RECORDE'
  },
  'paqueta-estreia-flamengo-supercopa-2026': {
    bg: ['#8b0000', '#4a0000'],
    accent: '#ff4444',
    illustration: 'stadium',
    subtitle: 'SUPERCOPA'
  },
  'paulistao-2026-quartas-final-confrontos': {
    bg: ['#2c1a5e', '#150d2e'],
    accent: '#9b59b6',
    illustration: 'bracket',
    subtitle: 'QUARTAS'
  },
  'carioca-2026-semifinais-fla-flu-vasco-madureira': {
    bg: ['#1a3a2a', '#0d1d15'],
    accent: '#27ae60',
    illustration: 'derby',
    subtitle: 'SEMIFINAIS'
  },
  'derby-paulista-memphis-penalti-analise': {
    bg: ['#2d1b1b', '#1a0d0d'],
    accent: '#e74c3c',
    illustration: 'penalty',
    subtitle: 'OPINIÃO'
  },
  'abel-ferreira-reclamacao-arbitragem-palmeiras-inter': {
    bg: ['#0d4f22', '#071a0d'],
    accent: '#3498db',
    illustration: 'tactics',
    subtitle: 'TÁTICA'
  },
  'supercopa-2026-corinthians-campea-analise-tatica': {
    bg: ['#1a1a1a', '#0d0d0d'],
    accent: '#f39c12',
    illustration: 'trophy',
    subtitle: 'CAMPEÃO'
  }
};

function generateIllustration(type, accent) {
  const illustrations = {
    stadium: `
      <rect x="200" y="300" width="400" height="120" rx="8" fill="${accent}" opacity="0.15"/>
      <rect x="220" y="280" width="30" height="140" rx="4" fill="${accent}" opacity="0.2"/>
      <rect x="270" y="290" width="30" height="130" rx="4" fill="${accent}" opacity="0.25"/>
      <rect x="320" y="270" width="30" height="150" rx="4" fill="${accent}" opacity="0.3"/>
      <rect x="370" y="260" width="30" height="160" rx="4" fill="${accent}" opacity="0.35"/>
      <rect x="420" y="270" width="30" height="150" rx="4" fill="${accent}" opacity="0.3"/>
      <rect x="470" y="290" width="30" height="130" rx="4" fill="${accent}" opacity="0.25"/>
      <rect x="520" y="300" width="30" height="120" rx="4" fill="${accent}" opacity="0.2"/>
      <circle cx="400" cy="380" r="25" fill="white" opacity="0.9"/>
      <path d="M400 355 L410 370 L405 370 L405 405 L395 405 L395 370 L390 370 Z" fill="${accent}" opacity="0.0"/>
      <line x1="388" y1="380" x2="412" y2="380" stroke="${accent}" stroke-width="2" opacity="0.6"/>
      <line x1="400" y1="368" x2="400" y2="392" stroke="${accent}" stroke-width="2" opacity="0.6"/>
      <path d="M395 370 Q400 362 405 370" stroke="#333" stroke-width="1.5" fill="none"/>
      <path d="M395 390 Q400 398 405 390" stroke="#333" stroke-width="1.5" fill="none"/>
    `,
    celebration: `
      <circle cx="650" cy="200" r="60" fill="${accent}" opacity="0.1"/>
      <circle cx="650" cy="200" r="40" fill="${accent}" opacity="0.15"/>
      <circle cx="650" cy="200" r="20" fill="${accent}" opacity="0.25"/>
      <line x1="650" y1="130" x2="650" y2="100" stroke="${accent}" stroke-width="3" opacity="0.5"/>
      <line x1="580" y1="160" x2="560" y2="140" stroke="${accent}" stroke-width="3" opacity="0.5"/>
      <line x1="720" y1="160" x2="740" y2="140" stroke="${accent}" stroke-width="3" opacity="0.5"/>
      <line x1="700" y1="250" x2="720" y2="270" stroke="${accent}" stroke-width="3" opacity="0.3"/>
      <line x1="600" y1="250" x2="580" y2="270" stroke="${accent}" stroke-width="3" opacity="0.3"/>
      <text x="650" y="210" font-family="Arial" font-size="36" fill="white" text-anchor="middle" opacity="0.8">★</text>
    `,
    player: `
      <circle cx="680" cy="220" r="45" fill="${accent}" opacity="0.15"/>
      <circle cx="680" cy="190" r="20" fill="${accent}" opacity="0.25"/>
      <rect x="668" y="215" width="24" height="40" rx="8" fill="${accent}" opacity="0.2"/>
      <text x="680" y="240" font-family="Arial" font-size="22" fill="white" text-anchor="middle" font-weight="bold" opacity="0.7">10</text>
      <circle cx="720" cy="300" r="18" fill="white" opacity="0.15"/>
      <path d="M710 300 L720 290 L730 300 L720 310 Z" fill="${accent}" opacity="0.2"/>
    `,
    stats: `
      <rect x="550" y="330" width="40" height="80" rx="4" fill="${accent}" opacity="0.3"/>
      <rect x="600" y="290" width="40" height="120" rx="4" fill="${accent}" opacity="0.25"/>
      <rect x="650" y="350" width="40" height="60" rx="4" fill="${accent}" opacity="0.35"/>
      <rect x="700" y="310" width="40" height="100" rx="4" fill="${accent}" opacity="0.2"/>
      <line x1="550" y1="420" x2="740" y2="420" stroke="${accent}" stroke-width="2" opacity="0.4"/>
      <circle cx="570" cy="330" r="4" fill="white" opacity="0.5"/>
      <circle cx="620" cy="290" r="4" fill="white" opacity="0.5"/>
      <circle cx="670" cy="350" r="4" fill="white" opacity="0.5"/>
      <circle cx="720" cy="310" r="4" fill="white" opacity="0.5"/>
      <polyline points="570,330 620,290 670,350 720,310" fill="none" stroke="white" stroke-width="2" opacity="0.3"/>
    `,
    trophy: `
      <g transform="translate(640, 180)" opacity="0.3">
        <path d="M-30 0 L30 0 L25 60 L-25 60 Z" fill="${accent}"/>
        <rect x="-10" y="60" width="20" height="20" fill="${accent}"/>
        <rect x="-20" y="80" width="40" height="8" rx="4" fill="${accent}"/>
        <path d="M-30 0 Q-60 10 -50 40 Q-40 60 -25 50" fill="${accent}" opacity="0.6"/>
        <path d="M30 0 Q60 10 50 40 Q40 60 25 50" fill="${accent}" opacity="0.6"/>
      </g>
      <text x="640" y="155" font-family="Arial" font-size="28" fill="${accent}" text-anchor="middle" opacity="0.4">★</text>
    `,
    flags: `
      <g transform="translate(600, 200)" opacity="0.25">
        <rect x="0" y="0" width="60" height="40" rx="4" fill="#009c3b"/>
        <polygon points="30,5 55,20 30,35 5,20" fill="#ffdf00"/>
        <circle cx="30" cy="20" r="8" fill="#002776"/>
      </g>
      <g transform="translate(680, 220)" opacity="0.25">
        <rect x="0" y="0" width="60" height="40" rx="4" fill="#002395"/>
        <rect x="0" y="13" width="60" height="14" fill="white"/>
        <rect x="0" y="18" width="60" height="4" fill="#ED2939"/>
      </g>
      <g transform="translate(640, 280)" opacity="0.25">
        <rect x="0" y="0" width="60" height="40" rx="4" fill="#FF0000"/>
        <rect x="0" y="13" width="60" height="14" fill="white"/>
        <rect x="0" y="18" width="60" height="4" fill="#171796"/>
      </g>
    `,
    transfer: `
      <g transform="translate(620, 220)" opacity="0.3">
        <circle cx="0" cy="0" r="35" fill="none" stroke="${accent}" stroke-width="3"/>
        <text x="0" y="8" font-family="Arial" font-size="20" fill="${accent}" text-anchor="middle" font-weight="bold">€</text>
      </g>
      <path d="M560 220 L590 220" stroke="${accent}" stroke-width="3" opacity="0.25" marker-end="url(#arrow)"/>
      <path d="M650 220 L680 220" stroke="${accent}" stroke-width="3" opacity="0.25"/>
      <circle cx="700" cy="200" r="15" fill="${accent}" opacity="0.15"/>
      <circle cx="540" cy="240" r="15" fill="${accent}" opacity="0.15"/>
    `,
    bracket: `
      <g transform="translate(550, 160)" opacity="0.25">
        <rect x="0" y="0" width="100" height="25" rx="4" fill="${accent}"/>
        <rect x="0" y="35" width="100" height="25" rx="4" fill="${accent}" opacity="0.7"/>
        <line x1="100" y1="12" x2="120" y2="12" stroke="${accent}" stroke-width="2"/>
        <line x1="100" y1="47" x2="120" y2="47" stroke="${accent}" stroke-width="2"/>
        <line x1="120" y1="12" x2="120" y2="47" stroke="${accent}" stroke-width="2"/>
        <line x1="120" y1="30" x2="140" y2="30" stroke="${accent}" stroke-width="2"/>

        <rect x="0" y="80" width="100" height="25" rx="4" fill="${accent}"/>
        <rect x="0" y="115" width="100" height="25" rx="4" fill="${accent}" opacity="0.7"/>
        <line x1="100" y1="92" x2="120" y2="92" stroke="${accent}" stroke-width="2"/>
        <line x1="100" y1="127" x2="120" y2="127" stroke="${accent}" stroke-width="2"/>
        <line x1="120" y1="92" x2="120" y2="127" stroke="${accent}" stroke-width="2"/>
        <line x1="120" y1="110" x2="140" y2="110" stroke="${accent}" stroke-width="2"/>

        <rect x="150" y="20" width="100" height="25" rx="4" fill="white" opacity="0.3"/>
        <rect x="150" y="100" width="100" height="25" rx="4" fill="white" opacity="0.3"/>
      </g>
    `,
    derby: `
      <g transform="translate(580, 200)" opacity="0.25">
        <text x="0" y="0" font-family="Arial" font-size="60" fill="${accent}" font-weight="bold">VS</text>
      </g>
      <circle cx="560" cy="200" r="30" fill="${accent}" opacity="0.15"/>
      <circle cx="720" cy="200" r="30" fill="${accent}" opacity="0.15"/>
    `,
    penalty: `
      <g transform="translate(550, 200)" opacity="0.25">
        <rect x="0" y="0" width="200" height="120" rx="0" fill="none" stroke="${accent}" stroke-width="3"/>
        <rect x="50" y="20" width="100" height="80" rx="0" fill="none" stroke="${accent}" stroke-width="2"/>
        <circle cx="100" cy="130" r="5" fill="${accent}"/>
        <circle cx="160" cy="50" r="15" fill="white" opacity="0.5"/>
        <path d="M100 130 Q130 80 160 50" fill="none" stroke="white" stroke-width="2" stroke-dasharray="5,5" opacity="0.4"/>
      </g>
    `,
    tactics: `
      <g transform="translate(520, 160)" opacity="0.2">
        <rect x="0" y="0" width="260" height="180" rx="8" fill="none" stroke="${accent}" stroke-width="2"/>
        <line x1="130" y1="0" x2="130" y2="180" stroke="${accent}" stroke-width="1.5"/>
        <circle cx="130" cy="90" r="25" fill="none" stroke="${accent}" stroke-width="1.5"/>
        <circle cx="60" cy="40" r="8" fill="${accent}"/>
        <circle cx="60" cy="140" r="8" fill="${accent}"/>
        <circle cx="110" cy="90" r="8" fill="${accent}"/>
        <circle cx="180" cy="60" r="8" fill="white" opacity="0.5"/>
        <circle cx="180" cy="120" r="8" fill="white" opacity="0.5"/>
        <circle cx="220" cy="90" r="8" fill="white" opacity="0.5"/>
        <path d="M60 40 L110 90" stroke="${accent}" stroke-width="1" stroke-dasharray="4,4"/>
        <path d="M110 90 L180 60" stroke="${accent}" stroke-width="1" stroke-dasharray="4,4"/>
      </g>
    `
  };
  return illustrations[type] || illustrations.stadium;
}

function generateEnhancedSVG(article, theme) {
  const [bg1, bg2] = theme.bg;
  const titleLines = [];
  const words = article.title.split(' ');
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).length > 30) {
      titleLines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += ' ' + word;
    }
  }
  if (currentLine.trim()) titleLines.push(currentLine.trim());
  // Max 4 lines
  const lines = titleLines.slice(0, 4);

  const titleSVG = lines.map((line, i) =>
    `<text x="40" y="${170 + i * 38}" font-family="'Segoe UI',Arial,sans-serif" font-size="30" font-weight="bold" fill="white" letter-spacing="-0.5">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</text>`
  ).join('\n    ');

  const illustration = generateIllustration(theme.illustration, theme.accent);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg-${article.id.slice(0,8)}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${bg2};stop-opacity:1" />
    </linearGradient>
    <filter id="glow-${article.id.slice(0,8)}">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="500" fill="url(#bg-${article.id.slice(0,8)})"/>

  <!-- Decorative elements -->
  <circle cx="700" cy="100" r="200" fill="${theme.accent}" opacity="0.03"/>
  <circle cx="100" cy="450" r="150" fill="${theme.accent}" opacity="0.03"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="800" height="5" fill="${theme.accent}"/>

  <!-- Illustration -->
  ${illustration}

  <!-- Category badge -->
  <rect x="40" y="60" width="${theme.subtitle.length * 12 + 30}" height="34" rx="17" fill="${theme.accent}" opacity="0.9"/>
  <text x="${40 + (theme.subtitle.length * 12 + 30) / 2}" y="83" font-family="'Segoe UI',Arial,sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" letter-spacing="1.5">${theme.subtitle}</text>

  <!-- Title -->
  ${titleSVG}

  <!-- Bottom bar -->
  <rect x="0" y="460" width="800" height="40" fill="rgba(0,0,0,0.4)"/>
  <text x="40" y="486" font-family="'Segoe UI',Arial,sans-serif" font-size="15" fill="${theme.accent}" font-weight="bold">⚽ BOLA NA REDE</text>
  <text x="760" y="486" font-family="'Segoe UI',Arial,sans-serif" font-size="13" fill="rgba(255,255,255,0.6)" text-anchor="end">${new Date(article.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</text>

  <!-- Subtle grid pattern -->
  <pattern id="grid-${article.id.slice(0,8)}" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${theme.accent}" stroke-width="0.5" opacity="0.05"/>
  </pattern>
  <rect width="800" height="500" fill="url(#grid-${article.id.slice(0,8)})"/>
</svg>`;
}

console.log('🎨 Gerando SVGs temáticos...');
articles.forEach(article => {
  const theme = articleThemes[article.id];
  if (!theme) {
    console.log(`  ⚠️ Sem tema para: ${article.id}`);
    return;
  }
  const svg = generateEnhancedSVG(article, theme);
  const svgPath = path.join(IMAGES_DIR, `${article.id}.svg`);
  fs.writeFileSync(svgPath, svg, 'utf-8');
  console.log(`  ✓ ${article.id}.svg`);
});

// ============================================================
// 2. ATUALIZAR HTML DOS ARTIGOS COM RECOMENDAÇÕES
// ============================================================

function getRelatedArticles(currentArticle, allArticles) {
  // Prioridade: mesma categoria, depois outras
  const sameCategory = allArticles.filter(a =>
    a.id !== currentArticle.id && a.category === currentArticle.category
  );
  const otherCategory = allArticles.filter(a =>
    a.id !== currentArticle.id && a.category !== currentArticle.category
  );

  // Pega 1 da mesma categoria + 3 de outras
  const related = [...sameCategory.slice(0, 1), ...otherCategory.slice(0, 3)];
  return related.slice(0, 4);
}

function getCategoryLabel(cat) {
  return {
    brasileirao: 'BRASILEIRÃO',
    neymar: 'NEYMAR',
    copa: 'COPA 2026',
    mercado: 'MERCADO',
    regionais: 'REGIONAIS',
    opiniao: 'OPINIÃO',
    taticas: 'TÁTICAS'
  }[cat] || cat.toUpperCase();
}

function getCategoryLink(cat) {
  return {
    brasileirao: 'Série-a',
    neymar: 'Neymar',
    copa: 'Copa-2026',
    mercado: 'Mercado',
    regionais: 'Regionais',
    opiniao: 'Opinião',
    taticas: 'Táticas'
  }[cat] || cat;
}

function generateArticleHTML(article, allArticles) {
  const categoryLabel = getCategoryLabel(article.category);
  const categoryLink = getCategoryLink(article.category);
  const date = new Date(article.publishedAt);
  const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const related = getRelatedArticles(article, allArticles);

  // Build related sidebar HTML
  const sidebarRelated = related.map((r, i) => `
                        <li class="continue-reading-item">
                            <a href="/articles/pt-BR/${r.category}/${r.id}.html">
                                <div class="continue-reading-content">
                                    <span class="continue-reading-number">${i + 1}</span>
                                    <span class="continue-reading-category">${getCategoryLabel(r.category)}</span>
                                    <h4>${r.title.substring(0, 80)}${r.title.length > 80 ? '...' : ''}</h4>
                                </div>
                            </a>
                        </li>`).join('');

  // Build "Leia Também" section
  const leiaRelated = related.slice(0, 3).map(r => `
                    <a href="/articles/pt-BR/${r.category}/${r.id}.html" class="related-card">
                        <div class="related-card-image">
                            <img src="/images/articles/${r.id}.svg" alt="${r.title}" loading="lazy">
                        </div>
                        <div class="related-card-content">
                            <span style="color:${getAccentColor(r.category)};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${getCategoryLabel(r.category)}</span>
                            <h4>${r.title.substring(0, 70)}${r.title.length > 70 ? '...' : ''}</h4>
                        </div>
                    </a>`).join('');

  const tagsHTML = (article.tags || []).map(t => `<span class="tag">${t}</span>`).join('\n                ');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - Bola na Rede</title>
    <meta name="description" content="${article.excerpt}">
    <meta name="author" content="Bola na Rede">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.excerpt}">
    <meta property="og:image" content="${SITE_URL}/images/articles/${article.id}.svg">
    <meta property="og:type" content="article">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/article.css">

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "${article.title}",
        "description": "${article.excerpt}",
        "image": "${SITE_URL}/images/articles/${article.id}.svg",
        "datePublished": "${article.publishedAt}",
        "dateModified": "${article.publishedAt}",
        "author": { "@type": "Organization", "name": "Bola na Rede" },
        "publisher": { "@type": "Organization", "name": "Bola na Rede" }
    }
    </script>

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${article.title}">
    <meta name="twitter:description" content="${article.excerpt}">
    <meta name="twitter:image" content="${SITE_URL}/images/articles/${article.id}.svg">
    <link rel="canonical" href="${SITE_URL}/articles/pt-BR/${article.category}/${article.id}.html">
    <meta name="keywords" content="${(article.tags || []).join(', ')}">
</head>
<body>
    <header class="article-header">
        <nav>
            <a href="/" class="logo">⚽ BOLA NA REDE</a>
        </nav>
    </header>

    <main class="article-container">
        <article class="article-content">
            <nav class="breadcrumb">
                <a href="/">Início</a> &raquo;
                <a href="/#${categoryLink}">${categoryLabel}</a> &raquo;
                <span>${article.title.substring(0, 50)}...</span>
            </nav>

            <div class="article-category">${categoryLabel}</div>

            <h1 class="article-title">${article.title}</h1>

            <p class="article-subtitle">${article.excerpt}</p>

            <div class="article-meta">
                <span class="author">Por <strong>Bola na Rede</strong></span>
                <span class="date">${dateStr}</span>
                <span class="reading-time">⏱️ ${article.readingTime} min de leitura</span>
            </div>

            <figure class="article-image">
                <img src="/images/articles/${article.id}.svg" alt="${article.title}">
                <figcaption>${categoryLabel} | Bola na Rede</figcaption>
            </figure>

            <div class="article-body">
                ${article.body.trim()}
            </div>

            <div class="article-tags">
                ${tagsHTML}
            </div>

            <div class="article-share">
                <p><strong>Compartilhe esta notícia:</strong></p>
                <div class="share-buttons">
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(SITE_URL + '/articles/pt-BR/' + article.category + '/' + article.id + '.html')}" target="_blank" class="share-btn twitter">𝕏 Twitter</a>
                    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + SITE_URL + '/articles/pt-BR/' + article.category + '/' + article.id + '.html')}" target="_blank" class="share-btn whatsapp">💬 WhatsApp</a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL + '/articles/pt-BR/' + article.category + '/' + article.id + '.html')}" target="_blank" class="share-btn facebook">📘 Facebook</a>
                </div>
            </div>

            <!-- LEIA TAMBÉM -->
            <div class="related-articles">
                <h3>📰 Leia Também</h3>
                <div class="related-grid">
                    ${leiaRelated}
                </div>
            </div>
        </article>

        <aside class="article-sidebar">
            <div class="widget">
                <h3>🔥 Continue Lendo</h3>
                <ul class="continue-reading-list">
                    ${sidebarRelated}
                </ul>
            </div>
            <div class="widget newsletter">
                <h3>📧 Newsletter</h3>
                <p>Receba as melhores notícias de futebol no seu email.</p>
                <form class="newsletter-form">
                    <input type="email" placeholder="Seu email" required>
                    <button type="submit">⚽ ASSINAR</button>
                </form>
            </div>
        </aside>
    </main>

    <footer class="site-footer">
        <div class="container">
            <div class="footer-bottom">
                <p>&copy; 2026 Bola na Rede. Futebol sem filtro desde 2026.</p>
                <p><a href="/">Voltar ao início</a> | <a href="/privacy.html">Privacidade</a> | <a href="/terms.html">Termos</a></p>
            </div>
        </div>
    </footer>
</body>
</html>`;
}

function getAccentColor(cat) {
  return {
    brasileirao: '#2ecc71',
    neymar: '#f1c40f',
    copa: '#3498db',
    mercado: '#e67e22',
    regionais: '#9b59b6',
    opiniao: '#e74c3c',
    taticas: '#3498db'
  }[cat] || '#2ecc71';
}

// Precisamos dos bodies dos artigos — lê do script de geração original
const articleBodies = {
  'carioca-2026-semifinais-fla-flu-vasco-madureira': fs.readFileSync(path.join(ARTICLES_DIR, 'regionais/carioca-2026-semifinais-fla-flu-vasco-madureira.html'), 'utf-8'),
};

// Vamos extrair o body de cada HTML existente
function extractBody(htmlContent) {
  const match = htmlContent.match(/<div class="article-body">([\s\S]*?)<\/div>\s*\n\s*<div class="article-tags">/);
  if (match) return match[1].trim();
  // Fallback
  const match2 = htmlContent.match(/<div class="article-body">([\s\S]*?)<\/div>/);
  if (match2) return match2[1].trim();
  return '<p>Conteúdo não disponível.</p>';
}

console.log('\n📝 Atualizando HTMLs com recomendações...');

articles.forEach(article => {
  const catDir = path.join(ARTICLES_DIR, article.category);
  const htmlPath = path.join(catDir, `${article.id}.html`);

  if (!fs.existsSync(htmlPath)) {
    console.log(`  ⚠️ HTML não encontrado: ${htmlPath}`);
    return;
  }

  // Extrai body do HTML existente
  const existingHTML = fs.readFileSync(htmlPath, 'utf-8');
  const body = extractBody(existingHTML);

  // Reconstrói artigo com body e tags extraídos
  const articleWithBody = {
    ...article,
    body: body,
    tags: article.tags || extractTags(existingHTML)
  };

  const newHTML = generateArticleHTML(articleWithBody, articles);
  fs.writeFileSync(htmlPath, newHTML, 'utf-8');
  console.log(`  ✓ [${article.category}] ${article.id}`);
});

function extractTags(html) {
  const matches = html.match(/<span class="tag">(.*?)<\/span>/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/<[^>]+>/g, ''));
}

// Atualiza tags no index
articles.forEach(article => {
  const htmlPath = path.join(ARTICLES_DIR, article.category, `${article.id}.html`);
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    article.tags = extractTags(html);
  }
});

// Salva índice atualizado em ambos os locais
fs.writeFileSync(indexPath, JSON.stringify(articles, null, 2), 'utf-8');
fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'articles-index.json'), JSON.stringify(articles, null, 2), 'utf-8');

console.log('\n✅ Upgrade completo!');
console.log(`   📸 ${Object.keys(articleThemes).length} SVGs temáticos gerados`);
console.log(`   📝 ${articles.length} HTMLs atualizados com recomendações`);
console.log(`   🔗 Sidebar "Continue Lendo" + "Leia Também" em cada artigo`);
console.log(`   📲 Botões de compartilhamento reais (Twitter, WhatsApp, Facebook)`);
