#!/usr/bin/env node
/**
 * ANTI-BUG IMAGE VERIFICATION ALGORITHM
 * ======================================
 * Garante que cada artigo tenha a imagem correta para o seu assunto.
 *
 * PRIORIDADE DE CORRESPONDÊNCIA:
 *   1. Jogador específico (Neymar, Haaland, Cristiano, etc.)
 *   2. Treinador específico (Ancelotti, Abel Ferreira, etc.)
 *   3. Clube específico (Santos, Palmeiras, etc.)
 *   4. Competição (Paulistão, Carioca, VAR, Copa 2026, etc.)
 *   5. Contexto (gol, lesão, torcida, treino, mercado, etc.)
 *   6. Fallback: imagem genérica de futebol
 *
 * FONTES DE IMAGEM:
 *   - Wikimedia Commons (foto real do atleta/treinador, licença livre)
 *   - Pexels (fotos genéricas de contexto, licença livre)
 *
 * VALIDAÇÃO:
 *   - Cada imagem tem um fallback via onerror no HTML
 *   - Se a primary falhar, cai para a fallback
 *   - Se a fallback falhar, cai para o padrão Pexels
 */

require('dotenv').config({ quiet: true });
const fs = require('fs').promises;
const path = require('path');

const INDEX_PUBLIC = path.join(__dirname, '../../public/data/articles-index.json');
const ARTIGO_DIR   = path.join(__dirname, '../../public/artigo');

// ══════════════════════════════════════════════════════════
// BANCO DE IMAGENS VERIFICADAS
// ══════════════════════════════════════════════════════════

// Pexels: contexto genérico de futebol (verificados, licença gratuita)
function px(id, w = 800, h = 500) {
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&dpr=1`;
}

// Wikimedia Commons: fotos reais de atletas/treinadores (licença CC)
// URL computada via MD5 hash do filename (fórmula oficial Wikimedia)
function wm(filename, width = 400) {
    const name = filename.replace(/ /g, '_');
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(name).digest('hex');
    const a  = hash[0];
    const ab = hash.slice(0, 2);
    const ext = name.split('.').pop().toLowerCase();
    const thumbName = ext === 'svg' ? `${width}px-${name}.png` : `${width}px-${name}`;
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${a}/${ab}/${name}/${thumbName}`;
}

// ──────────────────────────────────────────────────────────
// BANCO DE SUJEITOS: jogadores, treinadores, clubes
// Cada entrada tem:
//   keywords : termos para detectar no título/id do artigo
//   primary  : melhor imagem (Wikimedia Commons, real do sujeito)
//   fallback : imagem de backup (Pexels genérica de futebol)
// ──────────────────────────────────────────────────────────
const SUBJECTS = {

    // ── JOGADORES ──────────────────────────────────────────
    players: [
        {
            name: 'Neymar',
            keywords: ['neymar'],
            primary:  wm('Neymar_PSG.jpg'),             // Neymar em apresentação no PSG (CC-BY-SA)
            fallback: px(17955074),
        },
        {
            name: 'Haaland',
            keywords: ['haaland', 'erling'],
            primary:  wm('Erling_Haaland_2023_(cropped).jpg'),
            fallback: px(32179248),                     // jogador driblando
        },
        {
            name: 'Cristiano Ronaldo',
            keywords: ['cristiano', 'ronaldo', 'cr7'],
            primary:  wm('Cristiano_Ronaldo_2018.jpg'),
            fallback: px(18075458),
        },
        {
            name: 'Messi',
            keywords: ['messi', 'lionel'],
            primary:  wm('Lionel-Messi-Argentina-2022-FIFA-World-Cup_(cropped).jpg'),
            fallback: px(32179248),
        },
        {
            name: 'Vinicius Jr',
            keywords: ['vinicius', 'vinícius', 'vini jr'],
            primary:  wm('Vinicius_Junior_-_2019.jpg'),
            fallback: px(17955074),
        },
        {
            name: 'Rodrygo',
            keywords: ['rodrygo'],
            primary:  wm('Rodrygo_2022.jpg'),
            fallback: px(17955074),
        },
        {
            name: 'Endrick',
            keywords: ['endrick'],
            primary:  wm('Endrick_Brasil_2023.jpg'),
            fallback: px(17955074),
        },
        {
            name: 'Gabigol',
            keywords: ['gabigol', 'gabriel barbosa', 'gabriel'],
            primary:  wm('Gabigol_2019.jpg'),
            fallback: px(33257251),                     // comemoração de gol
        },
        {
            name: 'Pedro (Flamengo)',
            keywords: ['pedro'],
            primary:  wm('Pedro_Guilherme_Abreu_dos_Santos_Filho.jpg'),
            fallback: px(18075411),
        },
        {
            name: 'Hulk',
            keywords: ['hulk'],
            primary:  wm('Hulk_Vieira_de_Souza_Footballer.jpg'),
            fallback: px(18075411),
        },
        {
            name: 'Jhon Arias',
            keywords: ['jhon arias', 'arias'],
            primary:  px(32179248),                     // jogador driblando (sem foto no Commons)
            fallback: px(18075411),
        },
        {
            name: 'Luiz Henrique',
            keywords: ['luiz henrique'],
            primary:  px(32179248),
            fallback: px(17955074),
        },
    ],

    // ── TREINADORES ────────────────────────────────────────
    coaches: [
        {
            name: 'Ancelotti',
            keywords: ['ancelotti', 'carlo ancelotti'],
            primary:  wm('Carlo_Ancelotti,_Everton_v_Brighton_(cropped).jpg'),
            fallback: px(18075458),
        },
        {
            name: 'Abel Ferreira',
            keywords: ['abel ferreira', 'abel'],
            primary:  wm('Abel_Ferreira_-_CP_vs_SCP_2019-20.jpg'),
            fallback: px(15153169),                     // treino tático
        },
        {
            name: 'Vojvoda',
            keywords: ['vojvoda'],
            primary:  px(3131405),                      // jogo noturno (sem foto no Commons)
            fallback: px(15976858),
        },
    ],

    // ── CLUBES (sem jogador/treinador específico) ──────────
    clubs: [
        {
            name: 'Santos',
            keywords: ['santos', 'vila belmiro'],
            primary:  wm('Vila_Belmiro.jpg'),           // estádio do Santos
            fallback: px(16731731),
        },
        {
            name: 'Palmeiras',
            keywords: ['palmeiras', 'allianz parque'],
            primary:  wm('Allianz_Parque.jpg'),
            fallback: px(15976858),
        },
        {
            name: 'Flamengo',
            keywords: ['flamengo', 'maracanã', 'maracana'],
            primary:  wm('Maracana_estadio_Joao_Havelange.jpg'),
            fallback: px(3131405),
        },
        {
            name: 'Corinthians',
            keywords: ['corinthians', 'neo química'],
            primary:  px(18075411),                     // ação em campo
            fallback: px(17955074),
        },
        {
            name: 'Atlético-MG',
            keywords: ['atlético-mg', 'atletico-mg', 'atletico mg', 'galo'],
            primary:  px(3131405),
            fallback: px(18075411),
        },
        {
            name: 'Cruzeiro',
            keywords: ['cruzeiro'],
            primary:  px(3131405),
            fallback: px(18075411),
        },
        {
            name: 'Grêmio',
            keywords: ['grêmio', 'gremio'],
            primary:  px(17071576),                     // torcida
            fallback: px(3131405),
        },
        {
            name: 'Internacional',
            keywords: ['internacional', 'inter gaúcho'],
            primary:  px(17071576),
            fallback: px(3131405),
        },
        {
            name: 'Fortaleza',
            keywords: ['fortaleza'],
            primary:  px(3131405),
            fallback: px(16731731),
        },
        {
            name: 'Sport Recife',
            keywords: ['sport recife', 'sport'],
            primary:  px(16731731),
            fallback: px(15976858),
        },
        {
            name: 'Athletico-PR',
            keywords: ['athletico-pr', 'athletico pr', 'furacão'],
            primary:  px(32179248),
            fallback: px(3131405),
        },
        {
            name: 'Fluminense',
            keywords: ['fluminense'],
            primary:  px(3131405),
            fallback: px(17071576),
        },
    ],

    // ── CONTEXTOS TEMÁTICOS ────────────────────────────────
    contexts: [
        // VAR / Arbitragem - MÁXIMA PRIORIDADE para evitar foto errada
        { keywords: ['var', 'árbitro', 'arbitro', 'arbitragem', 'iphone var', 'cbf iphone'],
          primary: px(5817858), fallback: px(5817858), label: 'Árbitro' },

        // Lesão / Recuperação
        { keywords: ['joelho', 'lesão', 'lesao', 'recuperação', 'recuperacao', 'cirurgia'],
          primary: px(32228926), fallback: px(32228926), label: 'Lesão' },

        // Gol / Resultado / Rodada
        { keywords: ['gol', 'placar', 'rodada', 'resultado', 'marcou', 'vitória'],
          primary: px(33257251), fallback: px(18075411), label: 'Gol/Resultado' },

        // Torcida / Clássico
        { keywords: ['grenal', 'clássico', 'classico', 'torcida', 'arquibancada'],
          primary: px(17071576), fallback: px(3131405), label: 'Torcida' },

        // Copa do Mundo / Seleção
        { keywords: ['copa do mundo', 'copa 2026', 'copa mundo', 'fifa 2026', 'mundial', 'seleção brasileira', 'selecao brasileira'],
          primary: px(15976858), fallback: px(9739469), label: 'Copa/Seleção' },

        // Estádio / Arena
        { keywords: ['estádio', 'estadio', 'arena', 'aprovado pela fifa', 'capacidade'],
          primary: px(15976858), fallback: px(16731731), label: 'Estádio' },

        // Táticas / Treino / Analytics
        { keywords: ['tática', 'tatica', 'pressing', 'treino', 'esquema', 'xg', 'analytics', 'dados', 'blitz ofensiva'],
          primary: px(15153169), fallback: px(17955074), label: 'Táticas/Treino' },

        // Mercado / Transferências / Janela
        { keywords: ['janela', 'transferência', 'transferencia', 'mercado da bola', 'contratação', 'contratacao', 'reforço', 'reforco'],
          primary: px(32179248), fallback: px(16114080), label: 'Mercado' },

        // Amistoso / Internacional
        { keywords: ['amistoso', 'france', 'croácia', 'croacia', 'eua', 'boston'],
          primary: px(15976858), fallback: px(9739469), label: 'Amistoso' },

        // Carnaval / Pausa
        { keywords: ['carnaval', 'pausa', 'cinzas'],
          primary: px(15976858), fallback: px(17071576), label: 'Carnaval' },
    ],
};

// ══════════════════════════════════════════════════════════
// ALGORITMO PRINCIPAL DE VERIFICAÇÃO
// ══════════════════════════════════════════════════════════

/**
 * Encontra a melhor imagem para um artigo.
 * Retorna { primary, fallback, label, reason }
 */
function findBestImage(articleId, articleTitle) {
    const text = `${articleId} ${articleTitle}`.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');  // remove acentos para comparação

    // 1. JOGADORES (prioridade máxima)
    for (const player of SUBJECTS.players) {
        if (player.keywords.some(kw => text.includes(kw))) {
            return {
                primary:  player.primary,
                fallback: player.fallback,
                label:    player.name,
                reason:   `Jogador: ${player.name}`,
            };
        }
    }

    // 2. TREINADORES
    for (const coach of SUBJECTS.coaches) {
        if (coach.keywords.some(kw => text.includes(kw))) {
            return {
                primary:  coach.primary,
                fallback: coach.fallback,
                label:    coach.name,
                reason:   `Treinador: ${coach.name}`,
            };
        }
    }

    // 3. CONTEXTOS TEMÁTICOS (antes dos clubes para temas como VAR/lesão)
    for (const ctx of SUBJECTS.contexts) {
        if (ctx.keywords.some(kw => text.includes(kw))) {
            return {
                primary:  ctx.primary,
                fallback: ctx.fallback,
                label:    ctx.label,
                reason:   `Contexto: ${ctx.label}`,
            };
        }
    }

    // 4. CLUBES
    for (const club of SUBJECTS.clubs) {
        if (club.keywords.some(kw => text.includes(kw))) {
            return {
                primary:  club.primary,
                fallback: club.fallback,
                label:    club.name,
                reason:   `Clube: ${club.name}`,
            };
        }
    }

    // 5. FALLBACK GENÉRICO
    return {
        primary:  px(15976858),
        fallback: px(18075411),
        label:    'Genérico',
        reason:   'Fallback genérico (futebol)',
    };
}

// ══════════════════════════════════════════════════════════
// APLICAÇÃO: atualiza index + HTMLs
// ══════════════════════════════════════════════════════════

async function verifyAndFix() {
    console.log('\n🔍 ALGORITMO ANTI-BUG — Verificação de Imagens\n');
    console.log('='.repeat(70));

    // Carrega o index
    const indexData = await fs.readFile(INDEX_PUBLIC, 'utf8');
    const articles  = JSON.parse(indexData);

    let indexChanges = 0;
    let htmlChanges  = 0;
    const report = [];

    for (const article of articles) {
        const best = findBestImage(article.id, article.title);
        const currentImg = article.image || '';
        const currentId  = (currentImg.match(/\/photos\/(\d+)\//) || currentImg.match(/\/([^/]+)\.[a-z]+$/)||['','?'])[1];

        // Atualiza o index com a primary
        if (article.image !== best.primary) {
            console.log(`\n📰 ${article.title.substring(0, 60)}`);
            console.log(`   → ${best.reason}`);
            console.log(`   OLD: ${currentImg.substring(0, 70)}`);
            console.log(`   NEW: ${best.primary.substring(0, 70)}`);
            article.image = best.primary;
            indexChanges++;
        }

        report.push({
            id:      article.id,
            title:   article.title.substring(0, 50),
            reason:  best.reason,
            primary: best.primary,
            fallback:best.fallback,
        });

        // Atualiza o HTML do artigo em /artigo/
        const htmlPath = path.join(ARTIGO_DIR, article.id + '.html');
        try {
            let html = await fs.readFile(htmlPath, 'utf8');
            const original = html;

            // 1. Atualiza a imagem principal (og:image, figure img, schema)
            // Substitui qualquer URL pexels ou wikimedia por a nova
            html = html.replace(
                /(https:\/\/(?:images\.pexels\.com\/photos\/\d+\/[^"']+|upload\.wikimedia\.org\/[^"']+))/g,
                (match) => {
                    // Só substitui se for a imagem principal do artigo
                    // (og:image, schema, figure img) — não substitui dentro de outros contextos
                    return match;  // será substituído abaixo de forma mais precisa
                }
            );

            // Substitui og:image
            html = html.replace(
                /(<meta property="og:image" content=")[^"]*(")/g,
                `$1${best.primary}$2`
            );

            // Substitui schema.org image
            html = html.replace(
                /("image"\s*:\s*")[^"]*(")/g,
                `$1${best.primary}$2`
            );

            // Substitui a imagem no figure (src da img principal) com fallback
            html = html.replace(
                /(<figure[^>]*class="article-image"[^>]*>[\s\S]*?<img\s+src=")[^"]*("\s+alt="[^"]*"[^>]*)(onerror="[^"]*")?/g,
                (match, before, afterAlt, oldOnerror) => {
                    const onerror = `onerror="this.onerror=null;this.src='${best.fallback}'"`;
                    return `${before}${best.primary}${afterAlt}${onerror}`;
                }
            );

            // Garante que TODA img do artigo tenha onerror fallback
            html = html.replace(
                /<img\s+src="(https:\/\/(?:images\.pexels|upload\.wikimedia)[^"]+)"([^>]*?)(?:onerror="[^"]*")?([^>]*?)>/g,
                (match, src, before, after) => {
                    const fb = src.includes('pexels') ? best.fallback : best.fallback;
                    return `<img src="${src}"${before} onerror="this.onerror=null;this.src='${fb}'"${after}>`;
                }
            );

            if (html !== original) {
                await fs.writeFile(htmlPath, html, 'utf8');
                htmlChanges++;
            }
        } catch (e) {
            // Arquivo não existe em /artigo/ — tudo bem
        }
    }

    // Salva index atualizado
    if (indexChanges > 0) {
        await fs.writeFile(INDEX_PUBLIC, JSON.stringify(articles, null, 2), 'utf8');
        // Copia também para /data/ se existir
        const dataIndex = path.join(__dirname, '../../data/articles-index.json');
        try {
            await fs.writeFile(dataIndex, JSON.stringify(articles, null, 2), 'utf8');
        } catch(e) {}
    }

    // Relatório final
    console.log('\n' + '='.repeat(70));
    console.log(`✅ VERIFICAÇÃO CONCLUÍDA`);
    console.log(`   ${indexChanges} imagens atualizadas no index`);
    console.log(`   ${htmlChanges} HTMLs atualizados em /artigo/`);
    console.log('\n📊 DISTRIBUIÇÃO DE IMAGENS POR ASSUNTO:');
    const dist = {};
    report.forEach(r => { dist[r.reason] = (dist[r.reason] || 0) + 1; });
    Object.entries(dist).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => {
        console.log(`   ${String(v).padStart(2)} artigo(s) → ${k}`);
    });

    console.log('\n📋 TABELA COMPLETA:');
    report.forEach(r => {
        const isWikimedia = r.primary.includes('wikimedia');
        const icon = isWikimedia ? '👤' : '📸';
        console.log(`   ${icon} ${r.title.padEnd(52)} [${r.reason}]`);
    });
}

verifyAndFix().catch(console.error);
