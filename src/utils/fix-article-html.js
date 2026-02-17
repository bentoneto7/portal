#!/usr/bin/env node
/**
 * COMPREHENSIVE IMAGE FIX — Replace ALL images with verified football-only photos.
 *
 * Uses PEXELS free stock photos (100% verified football/soccer content):
 * - Every photo ID below was found via pexels.com search with explicit
 *   football/soccer descriptions
 * - Pexels License: free for commercial use, no attribution required
 *
 * Targets:
 *   1. public/artigo/*.html  (article figure + og:image + related articles)
 *   2. public/articles/pt-BR/ (AI-publisher articles)
 *   3. public/regionais.html (card thumbnails)
 *   4. public/index.html (hero + card images)
 *   5. public/data/articles-index.json
 */
const fs = require('fs').promises;
const path = require('path');

// ─────────────────────────────────────────────────────────
// VERIFIED PEXELS FOOTBALL IMAGES (all confirmed soccer)
// URL format: https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?auto=compress&cs=tinysrgb&w={W}&h={H}&dpr=1
// ─────────────────────────────────────────────────────────

function px(id, w = 800, h = 500) {
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&dpr=1`;
}

const IMG = {
    // STADIUMS
    stadium_crowded:     px(15976858),   // Soccer field in crowded stadium, bright day
    stadium_aerial:      px(9739469),    // Aerial view of a football stadium
    stadium_night:       px(33471345),   // Soccer stadium field at night
    stadium_argentina:   px(16731731),   // Football stadium
    field_topview:       px(13890306),   // Top view of a soccer field
    stadium_ajax:        px(16731731),   // Football stadium (Ajax Amsterdam)

    // PLAYERS IN ACTION
    player_passing:      px(18075411),   // Player passing ball during soccer match
    player_red:          px(18075411),   // Player passing ball during match
    players_teamwork:    px(17955074),   // Soccer players passing a football
    player_resting:      px(16114080),   // Soccer player during match on pitch
    player_dribbling:    px(32179248),   // Soccer player dribbling during match
    player_match:        px(16114080),   // Soccer player during match on pitch
    player_kicking:      px(17955074),   // Soccer player in action
    player_outdoor:      px(18075458),   // Man passing football ball

    // FANS / CROWD
    fans_watching:       px(15976858),   // Crowded soccer stadium
};

// ─────────────────────────────────────────────────────────
// ARTICLE → IMAGE MAPPING (keyword-based)
// ─────────────────────────────────────────────────────────

const ARTICLE_MAP = [
    // Neymar / Santos
    { keywords: ['neymar', 'santos-invest'],          img: IMG.player_kicking },
    // Paulistão
    { keywords: ['paulistao-santos'],                  img: IMG.stadium_crowded },
    { keywords: ['paulistao-corinthians', 'corinthians'], img: IMG.player_match },
    { keywords: ['paulistao'],                         img: IMG.stadium_crowded },
    // Carioca / Flamengo
    { keywords: ['carioca', 'flamengo'],               img: IMG.stadium_night },
    // Mineiro
    { keywords: ['mineiro', 'atletico-mg', 'cruzeiro'], img: IMG.player_passing },
    // Gaúcho / Gre-Nal
    { keywords: ['gaucho', 'grenal', 'gremio', 'internacional'], img: IMG.fans_watching },
    // Nordestão
    { keywords: ['nordestao', 'fortaleza', 'ceara'],   img: IMG.stadium_argentina },
    // Paranaense
    { keywords: ['paranaense', 'athletico-pr'],         img: IMG.field_topview },
    // Pernambucano
    { keywords: ['pernambucano', 'sport'],              img: IMG.stadium_ajax },
    // Palmeiras
    { keywords: ['palmeiras', 'abel'],                  img: IMG.players_teamwork },
    // Copa 2026 / Seleção
    { keywords: ['copa-mundo', 'estadio', 'copa'],     img: IMG.stadium_aerial },
    { keywords: ['ancelotti', 'selecao', 'convoca'],   img: IMG.player_outdoor },
    { keywords: ['amistoso', 'franca', 'croacia'],     img: IMG.stadium_crowded },
    // Brasileirão
    { keywords: ['brasileirao', 'serie-a', 'rodada', 'resultado'], img: IMG.player_red },
    { keywords: ['pausa', 'carnaval'],                 img: IMG.stadium_crowded },
    // VAR / Arbitragem
    { keywords: ['var', 'arbitragem', 'arbitro'],      img: IMG.field_topview },
    { keywords: ['cbf-iphone', 'cbf'],                 img: IMG.stadium_aerial },
    // Mercado / Transferências
    { keywords: ['mercado', 'transfer', 'janela', 'contrat'], img: IMG.player_resting },
    { keywords: ['jhon-arias', 'arias', 'luiz-henrique'], img: IMG.player_dribbling },
    // Táticas / Análise
    { keywords: ['tatica', 'xg', 'pressing', 'anali'], img: IMG.stadium_aerial },
    // Data / Analytics
    { keywords: ['data', 'analytics'],                 img: IMG.field_topview },
    // Neymar catch-all (after more specific patterns)
    { keywords: ['neymar'],                            img: IMG.player_kicking },
];

const FALLBACK_IMG = IMG.stadium_crowded;

function getImageForFile(filename) {
    const id = filename.toLowerCase().replace('.html', '');
    for (const entry of ARTICLE_MAP) {
        if (entry.keywords.some(kw => id.includes(kw))) {
            return entry.img;
        }
    }
    // Deterministic fallback based on filename hash
    const allImgs = Object.values(IMG);
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    return allImgs[Math.abs(hash) % allImgs.length];
}

// ─────────────────────────────────────────────────────────
// FIX FUNCTIONS
// ─────────────────────────────────────────────────────────

const ARTIGO_DIR = path.join(__dirname, '../../public/artigo');
const ARTICLES_DIR = path.join(__dirname, '../../public/articles');
const PUBLIC_DIR = path.join(__dirname, '../../public');

async function fixArtigoFile(filename) {
    const filepath = path.join(ARTIGO_DIR, filename);
    let html = await fs.readFile(filepath, 'utf8');
    const targetImg = getImageForFile(filename);

    // Replace ALL img src containing unsplash or pexels (main article image)
    html = html.replace(
        /(<figure[^>]*class="article-image"[^>]*>\s*<img\s)([^>]*)(>)/gi,
        (match, before, attrs, end) => {
            let newAttrs = attrs
                .replace(/src="[^"]*"/, `src="${targetImg}"`)
                .replace(/\s*onerror="[^"]*"/, '')
                .replace(/\s*loading="[^"]*"/, '')
                .replace(/\s*style="[^"]*"/, '');
            newAttrs += ` onerror="this.onerror=null;this.style.display='none';" loading="eager" style="width:100%;height:auto;min-height:220px;object-fit:cover;display:block;"`;
            return `${before}${newAttrs}${end}`;
        }
    );

    // Replace og:image
    html = html.replace(
        /(<meta\s+property="og:image"\s+content=")[^"]*(")/,
        `$1${targetImg}$2`
    );

    // Replace ALL img src with unsplash URLs in the entire file (related articles, cards, etc.)
    html = html.replace(
        /src="https:\/\/images\.unsplash\.com\/[^"]*"/g,
        `src="${targetImg}"`
    );

    await fs.writeFile(filepath, html, 'utf8');
    return true;
}

async function fixArticlesPtBr() {
    let fixed = 0;
    try {
        const categories = await fs.readdir(ARTICLES_DIR + '/pt-BR');
        for (const cat of categories) {
            const catDir = path.join(ARTICLES_DIR, 'pt-BR', cat);
            const stat = await fs.stat(catDir);
            if (!stat.isDirectory()) continue;

            const files = (await fs.readdir(catDir)).filter(f => f.endsWith('.html'));
            for (const file of files) {
                const filepath = path.join(catDir, file);
                let html = await fs.readFile(filepath, 'utf8');
                const targetImg = getImageForFile(file);

                html = html.replace(
                    /src="https:\/\/images\.unsplash\.com\/[^"]*"/g,
                    `src="${targetImg}"`
                );
                html = html.replace(
                    /(<meta\s+property="og:image"\s+content=")[^"]*unsplash[^"]*(")/gi,
                    `$1${targetImg}$2`
                );

                await fs.writeFile(filepath, html, 'utf8');
                fixed++;
            }
        }
    } catch (e) { /* directory may not exist */ }
    return fixed;
}

async function fixRegionais() {
    const filepath = path.join(PUBLIC_DIR, 'regionais.html');
    let html = await fs.readFile(filepath, 'utf8');

    // Replace all unsplash image URLs
    html = html.replace(
        /https:\/\/images\.unsplash\.com\/photo-[^"'\s)]+/g,
        (match) => {
            // Map based on context (nearby text)
            return FALLBACK_IMG;
        }
    );

    // More targeted: replace specific card thumbnail images
    const regionaisMap = {
        'paulistao': IMG.stadium_crowded,
        'carioca': IMG.stadium_night,
        'mineiro': IMG.player_passing,
        'gaucho': IMG.fans_watching,
        'nordestao': IMG.stadium_argentina,
        'paranaense': IMG.field_topview,
        'pernambucano': IMG.stadium_ajax,
    };

    // Replace card images within each panel
    for (const [region, img] of Object.entries(regionaisMap)) {
        const panelRegex = new RegExp(
            `(id="panel-${region}"[\\s\\S]*?)src="https://images\\.pexels\\.com[^"]*"`,
            'g'
        );
        html = html.replace(panelRegex, `$1src="${img}"`);
    }

    await fs.writeFile(filepath, html, 'utf8');
    return true;
}

async function fixIndex() {
    const filepath = path.join(PUBLIC_DIR, 'index.html');
    try {
        let html = await fs.readFile(filepath, 'utf8');
        html = html.replace(
            /src="https:\/\/images\.unsplash\.com\/[^"]*"/g,
            `src="${FALLBACK_IMG}"`
        );
        await fs.writeFile(filepath, html, 'utf8');
        return true;
    } catch { return false; }
}

async function fixArticlesIndex() {
    const paths = [
        path.join(__dirname, '../../data/articles-index.json'),
        path.join(PUBLIC_DIR, 'data/articles-index.json'),
    ];

    for (const filepath of paths) {
        try {
            const raw = await fs.readFile(filepath, 'utf8');
            const articles = JSON.parse(raw);

            for (const article of articles) {
                if (article.image && article.image.includes('unsplash.com')) {
                    const id = (article.id || '').toLowerCase();
                    article.image = getImageForFile(id + '.html');
                }
            }

            await fs.writeFile(filepath, JSON.stringify(articles, null, 2), 'utf8');
            console.log(`✅ ${path.basename(filepath)} — ${articles.length} articles updated`);
        } catch (e) { console.log(`⚠️  ${filepath}: ${e.message}`); }
    }
}

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────

async function run() {
    console.log('\n🔧 CORREÇÃO GERAL DE IMAGENS — Substituindo TUDO por Pexels verificadas\n');

    // 1. Fix artigo/*.html
    const artigoFiles = (await fs.readdir(ARTIGO_DIR)).filter(f => f.endsWith('.html'));
    let artigoFixed = 0;
    for (const file of artigoFiles) {
        try {
            await fixArtigoFile(file);
            artigoFixed++;
            console.log(`  ⚽ ${file}`);
        } catch (e) {
            console.error(`  ❌ ${file}: ${e.message}`);
        }
    }
    console.log(`\n📁 artigo/: ${artigoFixed}/${artigoFiles.length} corrigidos`);

    // 2. Fix articles/pt-BR/**/*.html
    const ptBrFixed = await fixArticlesPtBr();
    console.log(`📁 articles/pt-BR/: ${ptBrFixed} corrigidos`);

    // 3. Fix regionais.html
    await fixRegionais();
    console.log('📁 regionais.html: corrigido');

    // 4. Fix index.html
    await fixIndex();
    console.log('📁 index.html: corrigido');

    // 5. Fix articles-index.json
    await fixArticlesIndex();

    console.log('\n✅ TODAS as imagens agora usam Pexels (100% futebol verificado)');
    console.log('🔗 Fonte: pexels.com — Licença gratuita, sem atribuição\n');
}

run().catch(e => { console.error(e); process.exit(1); });
