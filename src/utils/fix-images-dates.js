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

// Topic-relevant Unsplash images (known working photo IDs)
const TOPIC_IMAGES = {
    // Paulistão
    'paulistao-santos-neymar':      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop&auto=format&q=80',
    'paulistao-corinthians':        'https://images.unsplash.com/photo-1540747913346-19212a4b1b5c?w=800&h=400&fit=crop&auto=format&q=80',
    // Carioca
    'carioca-flamengo':             'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop&auto=format&q=80',
    // Mineiro
    'mineiro-atletico':             'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&h=400&fit=crop&auto=format&q=80',
    // Gaúcho
    'gaucho-grenal':                'https://images.unsplash.com/photo-1576206483374-5afe7a616717?w=800&h=400&fit=crop&auto=format&q=80',
    // Nordestão
    'nordestao-fortaleza':          'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=400&fit=crop&auto=format&q=80',
    // Paranaense
    'paranaense-athletico':         'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=400&fit=crop&auto=format&q=80',
    // Pernambucano
    'pernambucano-sport':           'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=400&fit=crop&auto=format&q=80',
    // Neymar / Santos
    'neymar':                       'https://images.unsplash.com/photo-1518604964608-d2e32de0920f?w=800&h=400&fit=crop&auto=format&q=80',
    // Copa 2026 / Seleção
    'copa':                         'https://images.unsplash.com/photo-1551958219-acbc595b5e01?w=800&h=400&fit=crop&auto=format&q=80',
    'selecao':                      'https://images.unsplash.com/photo-1551958219-acbc595b5e01?w=800&h=400&fit=crop&auto=format&q=80',
    // Brasileirão / Série A
    'brasileirao':                  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop&auto=format&q=80',
    // VAR / Arbitragem
    'var':                          'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop&auto=format&q=80',
    // Mercado / Transferência
    'mercado':                      'https://images.unsplash.com/photo-1567459169668-c9b8eb60a406?w=800&h=400&fit=crop&auto=format&q=80',
    // Táticas / Análise
    'tatica':                       'https://images.unsplash.com/photo-1504016798967-59a258e9de58?w=800&h=400&fit=crop&auto=format&q=80',
    // Palmeiras
    'palmeiras':                    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&auto=format&q=80',
    // Ancelotti / Seleção
    'ancelotti':                    'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&h=400&fit=crop&auto=format&q=80',
    // Estádio genérico
    'estadio':                      'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&h=400&fit=crop&auto=format&q=80',
    // Default
    'default':                      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop&auto=format&q=80'
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
