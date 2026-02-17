#!/usr/bin/env node
/**
 * Fix article images (topic-relevant) + stagger dates
 */
require('dotenv').config({ quiet: true });
const fs = require('fs').promises;
const path = require('path');

const INDEX_DATA = path.join(__dirname, '../../data/articles-index.json');
const INDEX_PUBLIC = path.join(__dirname, '../../public/data/articles-index.json');
const ARTIGO_DIR = path.join(__dirname, '../../public/artigo');

// Topic-relevant Pexels images (ALL verified football/soccer — NO basketball)
// Source: pexels.com search results with explicit football descriptions
// License: Free for commercial use, no attribution required
function px(id) {
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1`;
}
const TOPIC_IMAGES = {
    // Paulistão
    'paulistao-santos-neymar':      px(15976858),  // Crowded soccer stadium
    'paulistao-corinthians':        px(16114080),  // Soccer player during match
    // Carioca
    'carioca-flamengo':             px(33471345),  // Soccer stadium at night
    // Mineiro
    'mineiro-atletico':             px(18075411),  // Player passing ball
    // Gaúcho
    'gaucho-grenal':                px(1884576),   // People watching football match
    // Nordestão
    'nordestao-fortaleza':          px(61135),     // Football stadium (Argentina)
    // Paranaense
    'paranaense-athletico':         px(13890306),  // Top view soccer field
    // Pernambucano
    'pernambucano-sport':           px(16731731),  // Football stadium (Ajax)
    // Neymar / Santos
    'neymar':                       px(50713),     // Soccer player kicking ball
    // Copa 2026 / Seleção
    'copa':                         px(9739469),   // Aerial view football stadium
    'selecao':                      px(9739469),   // Aerial view football stadium
    // Brasileirão / Série A
    'brasileirao':                  px(159684),    // Person playing soccer
    // VAR / Arbitragem
    'var':                          px(13890306),  // Top view soccer field
    // Mercado / Transferência
    'mercado':                      px(30782381),  // Young soccer player resting
    // Táticas / Análise
    'tatica':                       px(9739469),   // Aerial view stadium
    // Palmeiras
    'palmeiras':                    px(17955074),  // Soccer players teamwork
    // Ancelotti / Seleção
    'ancelotti':                    px(18075458),  // Man passing football
    // Estádio genérico
    'estadio':                      px(9739469),   // Aerial view stadium
    // Default
    'default':                      px(15976858)   // Crowded soccer stadium
};

function pickImage(article) {
    const id = (article.id || '').toLowerCase();
    const title = (article.title || '').toLowerCase();
    const text = id + ' ' + title;

    if (text.includes('paulistao') && text.includes('neymar') || text.includes('santos') && text.includes('neymar')) return TOPIC_IMAGES['paulistao-santos-neymar'];
    if (text.includes('paulistao') && text.includes('corinthians')) return TOPIC_IMAGES['paulistao-corinthians'];
    if (text.includes('carioca') || text.includes('flamengo')) return TOPIC_IMAGES['carioca-flamengo'];
    if (text.includes('mineiro') || text.includes('atletico-mg') || text.includes('cruzeiro')) return TOPIC_IMAGES['mineiro-atletico'];
    if (text.includes('gaucho') || text.includes('grenal') || text.includes('gremio') || text.includes('internacional')) return TOPIC_IMAGES['gaucho-grenal'];
    if (text.includes('nordestao') || text.includes('fortaleza') || text.includes('ceara')) return TOPIC_IMAGES['nordestao-fortaleza'];
    if (text.includes('paranaense') || text.includes('athletico')) return TOPIC_IMAGES['paranaense-athletico'];
    if (text.includes('pernambucano') || text.includes('sport recife')) return TOPIC_IMAGES['pernambucano-sport'];
    if (text.includes('neymar')) return TOPIC_IMAGES['neymar'];
    if (text.includes('copa') && (text.includes('2026') || text.includes('mundo'))) return TOPIC_IMAGES['copa'];
    if (text.includes('selecao') || text.includes('ancelotti')) return TOPIC_IMAGES['ancelotti'];
    if (text.includes('palmeiras')) return TOPIC_IMAGES['palmeiras'];
    if (text.includes('brasileirao') || text.includes('serie a')) return TOPIC_IMAGES['brasileirao'];
    if (text.includes('var') || text.includes('arbitragem')) return TOPIC_IMAGES['var'];
    if (text.includes('mercado') || text.includes('transfer')) return TOPIC_IMAGES['mercado'];
    if (text.includes('tatica') || text.includes('xg') || text.includes('pressing') || text.includes('analis')) return TOPIC_IMAGES['tatica'];
    if (text.includes('estadio') || text.includes('copa')) return TOPIC_IMAGES['estadio'];
    return TOPIC_IMAGES['default'];
}

// Realistic staggered dates — spread articles over the last 5 days
function staggerDate(article, index, total) {
    const id = (article.id || '').toLowerCase();
    const title = (article.title || '').toLowerCase();
    const text = id + ' ' + title;

    const now = new Date('2026-02-17T00:00:00Z');

    // Recent news (today) — match results, live news
    if (text.includes('hoje') || text.includes('quartas') || text.includes('semifinal') || text.includes('final') || text.includes('rodada')) {
        // Today, random hour between 8h and 20h
        const h = 8 + Math.floor(Math.random() * 12);
        return new Date(now.getTime() + h * 3600000).toISOString();
    }

    // Yesterday
    if (text.includes('ontem') || text.includes('paulistao') || text.includes('carioca') || text.includes('mineiro')) {
        const h = 10 + Math.floor(Math.random() * 10);
        return new Date(now.getTime() - 86400000 + h * 3600000).toISOString();
    }

    // 2-3 days ago for transfer/market news
    if (text.includes('mercado') || text.includes('contrato') || text.includes('janela') || text.includes('transfer')) {
        const days = 2 + Math.floor(Math.random() * 2);
        return new Date(now.getTime() - days * 86400000 + 36000000).toISOString();
    }

    // 3-5 days ago for analysis/opinion
    if (text.includes('analis') || text.includes('tatica') || text.includes('xg') || text.includes('pressing') || text.includes('var')) {
        const days = 3 + Math.floor(Math.random() * 3);
        return new Date(now.getTime() - days * 86400000 + 36000000).toISOString();
    }

    // Keep original date if it's already varied
    if (article.publishedAt) {
        return article.publishedAt;
    }

    // Default: spread evenly over last 3 days
    const spread = Math.floor((index / total) * 3 * 86400000);
    return new Date(now.getTime() - spread).toISOString();
}

async function run() {
    const raw = await fs.readFile(INDEX_DATA, 'utf8');
    const articles = JSON.parse(raw);
    const total = articles.length;

    let imageUpdated = 0;
    let dateUpdated = 0;

    articles.forEach((article, i) => {
        // Update image
        const newImage = pickImage(article);
        if (newImage !== article.image) {
            article.image = newImage;
            imageUpdated++;
        }

        // Stagger date
        const newDate = staggerDate(article, i, total);
        if (newDate !== article.publishedAt) {
            article.publishedAt = newDate;
            dateUpdated++;
        }
    });

    // Re-sort by date descending
    articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const json = JSON.stringify(articles, null, 2);
    await fs.writeFile(INDEX_DATA, json, 'utf8');
    await fs.writeFile(INDEX_PUBLIC, json, 'utf8');

    // Also update images in the artigo HTML files for regional articles
    const regionalArticles = articles.filter(a => a.category === 'regionais');
    for (const article of regionalArticles) {
        const htmlPath = path.join(ARTIGO_DIR, `${article.id}.html`);
        try {
            let html = await fs.readFile(htmlPath, 'utf8');
            // Replace old image in og:image and article img src
            const oldImgMatch = html.match(/property="og:image" content="([^"]+)"/);
            if (oldImgMatch && oldImgMatch[1] !== article.image) {
                html = html.replace(
                    /property="og:image" content="[^"]+"/,
                    `property="og:image" content="${article.image}"`
                );
                // Update the <img> in the article figure
                html = html.replace(
                    /(<figure class="article-image">\s*<img src=")[^"]+"/,
                    `$1${article.image}"`
                );
                await fs.writeFile(htmlPath, html, 'utf8');
                console.log(`🖼️  Imagem atualizada: ${article.id}`);
            }
        } catch (e) { /* file may not exist */ }
    }

    console.log(`\n✅ Imagens atualizadas: ${imageUpdated}`);
    console.log(`📅 Datas ajustadas: ${dateUpdated}`);
    console.log(`📊 Total de artigos: ${total}`);
}

run().catch(e => { console.error(e); process.exit(1); });
