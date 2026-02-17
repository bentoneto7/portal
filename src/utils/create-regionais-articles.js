#!/usr/bin/env node
/**
 * Gera artigos sobre campeonatos regionais brasileiros
 * Cria HTML files em public/artigo/ e atualiza articles-index.json
 */
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const ARTIGO_DIR = path.join(__dirname, '../../public/artigo');
const DATA_DIR = path.join(__dirname, '../../data');
const ARTICLES_INDEX = path.join(DATA_DIR, 'articles-index.json');
const PUBLIC_DATA_INDEX = path.join(__dirname, '../../public/data/articles-index.json');

const ARTICLES = [
    {
        id: 'paulistao-santos-neymar-quartas-2026',
        regional: 'paulistao',
        title: 'Neymar nas Quartas do Paulistão: Santos Sonha com o Título Inédito em Décadas',
        excerpt: 'Com Neymar em crescente, Santos chega às quartas do Paulistão 2026 como grande favorito. Torcida do Peixe já projeta título após quase 10 anos de espera.',
        image: 'https://images.unsplash.com/photo-1518604964608-d2e32de0920f?w=800&h=400&fit=crop&auto=format&q=80',
        readingTime: 5,
        body: `<p>O Santos Futebol Clube chega às quartas de final do Campeonato Paulista 2026 embalado pela melhor fase de Neymar Jr. desde o seu retorno à Vila Belmiro. O camisa 10, que ainda vai aquecer a torcida santista antes da Copa do Mundo, acumula 4 gols e 6 assistências na fase de grupos — números que fazem a Prainha viver um misto de esperança e nervosismo.</p>

<h2>O Momento de Neymar</h2>
<p>Fisicamente mais estável e tecnicamente incontestável, Neymar tem sido o diferencial do time do técnico Fábio Carille. Nas últimas rodadas, o craque deixou para trás as dúvidas sobre condicionamento físico e entregou atuações à altura do seu status. Dribles desconcertantes, visão de jogo apurada e — o mais importante para a torcida — uma felicidade visível dentro de campo.</p>

<p>"Estou feliz aqui. O Santos me deu a chance de renascer, e eu pretendo dar de volta com títulos", declarou Neymar após a classificação às quartas.</p>

<h2>Adversários nas Quartas</h2>
<p>O Santos enfrentará o Novorizontino, surpreendente campanha e equipe organizada. Não será moleza: o time do interior paulista eliminou adversários maiores na fase anterior e aposta no coletivo bem entrosado. Mas a qualidade individual dos santistas — com Neymar, Marcos Leonardo e o retornado Lucas Lima — parece superior.</p>

<p>Palmeiras, Corinthians e São Paulo chegam igualmente fortes, tornando as quartas o momento mais emocionante do Paulistão. Com quatro gigantes do estado e quatro zebras potenciais, o campeonato promete surpresas.</p>

<h2>A Espera da Torcida</h2>
<p>A última vez que o Santos levantou a taça do Paulistão foi em 2015 — época ainda com Neymar na equipe. A simbologia é óbvia: o craque retornou, e com ele o sonho do título paulista. A torcida santista, que encheu o Urbano Caldeira em cada jogo das quartas, sente que esse pode ser o ano.</p>

<p>As quartas de final do Paulistão 2026 prometem noites históricas. E o Santos, com Neymar no auge, está pronto para ser protagonista.</p>`
    },
    {
        id: 'paulistao-corinthians-analise-2026',
        regional: 'paulistao',
        title: 'Corinthians nas Quartas: Como o Timão Pode Surpreender no Paulistão 2026',
        excerpt: 'Apesar das turbulências fora de campo, Corinthians montou um time competitivo. Análise tática mostra como o Timão pode chegar à final do Paulistão.',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop&auto=format&q=80',
        readingTime: 4,
        body: `<p>Toda temporada o Corinthians vive crises. E toda temporada a Fiel continua acreditando. O Paulistão 2026 não é diferente: mesmo com problemas financeiros crônicos e contratações modestas, o Timão chegou às quartas de final jogando um futebol funcional e baseado numa defesa sólida.</p>

<h2>Defensivamente Competente</h2>
<p>O técnico Ramón Díaz construiu um bloco defensivo difícil de ser batido. Com apenas 4 gols sofridos na fase de grupos, o Corinthians tem no goleiro Hugo Souza um pilar. A linha de quatro fica compacta, dificulta espaços e aposta no contra-ataque para criar perigo.</p>

<h2>O Ataque Depende de Memphis</h2>
<p>Quando Memphis Depay aparece, o Corinthians aparece. O holandês tem capacidade técnica para resolver jogos sozinho — mas precisa de consistência. Nos grandes jogos, Memphis tem se apresentado. Se mantiver o ritmo, pode ser a chave para o título paulistano.</p>

<h2>A Chance de Ouro</h2>
<p>A Fiel não vê um título paulistano desde 2019. Com a janela fechando, o Paulistão 2026 pode ser a chance do Corinthians de dar alegria ao torcedor e aliviar a pressão de uma temporada sempre tumultuada. A equipe está pronta para brigar — e a torcida está pronta para acreditar.</p>`
    },
    {
        id: 'carioca-flamengo-bicampeao-2026',
        regional: 'carioca',
        title: 'Flamengo Rumo ao Bicampeonato Carioca: Elenco Recheado e Favoritismo Absoluto',
        excerpt: 'Com Gabigol, Gerson e Pedro no auge, Flamengo chega às semifinais do Carioca 2026 como favorito absoluto. Mas os rivais prometem dificultar.',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop&auto=format&q=80',
        readingTime: 5,
        body: `<p>Se existe um time construído para ganhar campeonatos estaduais com tranquilidade, esse time é o Flamengo de 2026. Com um elenco que mistura experientes e jovens promessas, Filipe Luís conduziu os rubro-negros com autoridade pela fase de grupos do Campeonato Carioca — 6 vitórias em 6 jogos, 18 gols marcados, apenas 2 sofridos.</p>

<h2>O Poder de Fogo do Mengão</h2>
<p>Pedro segue como referência no ataque: artilheiro do Carioca com 7 gols. Ao redor dele, Gerson dita o ritmo no meio-campo, Arrascaeta cria oportunidades com passes milimétricos e o retornado Gabigol busca recuperar a forma após período difícil. Com essa coleção de talentos, qualquer adversário terá dificuldades.</p>

<h2>Vasco Tenta Estragar a Festa</h2>
<p>O Vasco é o único time carioca com condições reais de incomodar o Flamengo. Phillipe Coutinho e Vegetti formam uma dupla criativa e eficiente. Os são-januarenses querem usar o Carioca como pontapé inicial para uma temporada de redemption.</p>

<h2>A Pergunta que Não Quer Calar</h2>
<p>Flamengo vai vencer o Carioca com facilidade ou alguém vai surpreender? A história mostra que estaduais raramente seguem o roteiro previsto. Mas com essa diferença de elenco, seria uma surpresa e tanto se o Mengão não faturasse o bicampeonato.</p>`
    },
    {
        id: 'mineiro-atletico-cruzeiro-semifinal-2026',
        regional: 'mineiro',
        title: 'Clássico Mineiro na Semifinal: Atlético-MG e Cruzeiro pelo Título Estadual 2026',
        excerpt: 'Atletico-MG e Cruzeiro se enfrentam nas semifinais do Campeonato Mineiro 2026. O clássico estadual vai definir quem chega à grande final.',
        image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&h=400&fit=crop&auto=format&q=80',
        readingTime: 5,
        body: `<p>O clássico mais intenso de Minas Gerais vai acontecer na semifinal do Campeonato Mineiro 2026. Atlético-MG, bicampeão estadual, e Cruzeiro, reconstruído e sedento por títulos, se enfrentarão em dois jogos que prometem paralisar o estado.</p>

<h2>Atlético: Potência e Experiência</h2>
<p>O Galo chega como favorito. Com Hulk ainda puxando o time no aspecto liderança, mesmo com menos minutos em campo, e jovens como Bernard sendo revelados pelo clube, o Atlético de Gabriel Milito tem um bloco forte. A defesa sólida e o ataque eficiente fazem do Galo o grande candidato ao tricampeonato mineiro.</p>

<h2>Cruzeiro: A Sede de Redenção</h2>
<p>O Cruzeiro passou por anos difíceis, desceu para a Série B e relutante lutou para retornar. Agora reestruturado sob a gestão de Ronaldo Fenômeno, a Raposa monta equipe competitiva e quer o Mineiro como sinal de que está de volta à elite do futebol nacional.</p>

<p>Diogo Barbosa e Robert chegaram como reforços para a temporada, e o ataque tem opções variadas. O clássico vai ser intenso — como todo clássico mineiro é.</p>

<h2>Uma Semifinal que Vale um Título</h2>
<p>Para o futebol mineiro, semifinais entre Atlético e Cruzeiro são eventos especiais. As arquibancadas estarão lotadas, os ânimos estarão exaltados e, no final das contas, apenas um time seguirá em busca do troféu. Minas respira futebol neste momento.</p>`
    },
    {
        id: 'gaucho-grenal-semifinal-2026',
        regional: 'gaucho',
        title: 'Grenal nas Semifinais do Gauchão: O Clássico que Paralisa o Rio Grande do Sul',
        excerpt: 'Grêmio e Internacional se encontram nas semifinais do Gauchão 2026. O Grenal que definirá quem disputa o título do campeonato estadual gaúcho.',
        image: 'https://images.unsplash.com/photo-1576206483374-5afe7a616717?w=800&h=400&fit=crop&auto=format&q=80',
        readingTime: 4,
        body: `<p>Poucos eventos esportivos no Brasil têm a capacidade de paralisar uma cidade como o Grenal. A rivalidade entre Grêmio e Internacional vai além do futebol — é identidade, pertencimento e paixão geração após geração. E em 2026, o Grenal acontece nas semifinais do Gaúcho, elevando ainda mais a tensão.</p>

<h2>O Grêmio de Renato Gaúcho</h2>
<p>Com Renato Portaluppi no comando, o Grêmio tem no estilo ofensivo a sua principal característica. Nathan Fernandes tem se destacado como a principal revelação tricolor, e o velho Suárez... bem, esse nem precisa de apresentação. A experiência do time gremista pode fazer a diferença nos momentos decisivos.</p>

<h2>O Internacional Quer Resposta</h2>
<p>Após temporada frustrante em 2025, o Internacional reestruturou o elenco e aposta na solidez defensiva para superar o Grêmio. Roger Machado construiu uma equipe equilibrada que concede poucos espaços. A questão é: o ataque é suficiente para superar a defesa tricolor?</p>

<h2>A Importância do Gaúcho</h2>
<p>Para ambos os clubes, o Gauchão é mais que um estadual — é o pontapé inicial para a temporada. Quem ganha o clássico chega à final com moral elevada, elenco confiante e torcida animada. O Grenal de 2026 promete ser épico.</p>`
    },
    {
        id: 'nordestao-fortaleza-favorito-2026',
        regional: 'nordestao',
        title: 'Fortaleza Domina o Nordestão 2026: Vojvoda Construiu uma Máquina Vencedora',
        excerpt: 'Fortaleza lidera o grupo A do Nordestão com 100% de aproveitamento. O trabalho de Vojvoda transformou o Leão no maior favorito à Copa do Nordeste.',
        image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=400&fit=crop&auto=format&q=80',
        readingTime: 4,
        body: `<p>O Fortaleza de Juan Pablo Vojvoda está jogando um futebol de outro nível no Nordestão 2026. Liderando o Grupo A com 100% de aproveitamento — 4 vitórias em 4 jogos, 12 gols marcados e apenas 1 sofrido — o Leão do Pici tem mostrado porque é considerado o melhor trabalho em andamento no futebol nordestino.</p>

<h2>O Sistema Vojvoda</h2>
<p>Vojvoda construiu um Fortaleza intenso, bem organizado e com jogadores que entendem profundamente os princípios do treinador argentino. O pressing alto, a transição rápida e a capacidade de atacar por múltiplos canais fazem do time cearense um adversário temido por qualquer equipe do Nordeste.</p>

<p>Yago Pikachu e Lucero são os destaques do time, mas é o coletivo que impressiona. Nenhum jogador parece dispensável, todos contribuem.</p>

<h2>Ceará e Bahia: Os Rivais</h2>
<p>Ceará e Bahia surgem como os principais adversários do Fortaleza. O Vozão tem um histórico respeitável na Copa do Nordeste, e o Bahia, de volta à Série A, quer usar o regional para pegar ritmo. Mas o Fortaleza parece um nível acima.</p>

<h2>Nordestão: Mais do que um Regional</h2>
<p>A Copa do Nordeste tem uma importância histórica e cultural enorme para o futebol nordestino. Times que ganham o Nordestão entram para o hall dos grandes da região. O Fortaleza de 2026 tem condições de dominar a competição do início ao fim.</p>`
    },
    {
        id: 'paranaense-athletico-defende-titulo-2026',
        regional: 'paranaense',
        title: 'Athletico-PR é Favorito no Paranaense 2026 e Busca o Tetracampeonato Estadual',
        excerpt: 'Athletico-PR defende o título paranaense em 2026 e busca o tetracampeonato. Furacão chega às semifinais com o elenco mais qualificado do estado.',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=400&fit=crop&auto=format&q=80',
        readingTime: 4,
        body: `<p>O Athletico Paranaense não para. Tricampeão paranaense, o Furacão da Baixada chega às semifinais do Campeonato Paranaense 2026 com o objetivo claro de conquistar o tetracampeonato estadual. Com um dos elencos mais qualificados do interior do Paraná e uma estrutura de clube que inveja muitos times de Série A, o Athletico é sim o grande favorito.</p>

<h2>O Trabalho de Fábio Carille</h2>
<p>Desde que chegou ao comando do Athletico, Fábio Carille imprimiu uma identidade clara: defesa sólida, transições rápidas e eficiência nos momentos decisivos. O Paranaense tem sido o terreno onde o Furacão testa suas ideias antes da temporada nacional.</p>

<p>Vitor Roque, após retornar do exterior, está encontrando seu melhor futebol no Athletico. Seus 5 gols no estadual fazem dele a grande esperança de gol do Furacão.</p>

<h2>Coritiba Quer Quebrar a Hegemonia</h2>
<p>O Coritiba, eterno rival, montou um elenco competitivo para 2026 e quer interromper o domínio do Athletico no estado. O Coxa-Branca tem na velha guarda e na consistência defensiva seus trunfos contra o Furacão.</p>

<h2>Final Prometida</h2>
<p>Se o roteiro se confirmar, Athletico x Coritiba na final do Paranaense 2026 será um dos clássicos mais aguardados do interior do Brasil. Para o futebol paranaense, é ouro.</p>`
    },
    {
        id: 'pernambucano-sport-titulo-2026',
        regional: 'pernambucano',
        title: 'Sport Recife Busca o Título Pernambucano 2026 e Manda Recado para a Série B',
        excerpt: 'Sport Recife é o favorito no Pernambucano 2026. Leão da Ilha mira título estadual como trampolim para recuperar o acesso à Série A.',
        image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=400&fit=crop&auto=format&q=80',
        readingTime: 4,
        body: `<p>O Sport Recife de 2026 quer mandatos. O Leão da Ilha, disputando a Série B em busca do retorno à elite nacional, usa o Campeonato Pernambucano como laboratório e aquecimento. Com o melhor elenco do estado mais uma vez, o Sport é o favorito ao título estadual e quer usar esse troféu como combustível emocional para uma temporada nacional ambiciosa.</p>

<h2>Elenco Renovado, Ambição Renovada</h2>
<p>A diretoria do Sport investiu com estratégia na formação do elenco 2026. Rafael Thyere na zaga, Luciano Juba no meio e Zé Love no ataque formam um time que mescla experiência e velocidade. Para o técnico Marcelino Alves, o Pernambucano é a fase de ajuste antes da Série B.</p>

<h2>Náutico e Santa Cruz: Os Rivais</h2>
<p>O Clássico das Multidões entre Sport e Santa Cruz tem a capacidade de encher qualquer estádio. O tricolor recifense, que luta para se reestruturar financeiramente, quer usar o Pernambucano como vitrine para atrair investidores. Náutico, com novidades no elenco, também surge como candidato.</p>

<h2>A Importância do Regional Para Pernambuco</h2>
<p>Em Pernambuco, o futebol tem uma paixão que transcende resultados. O Pernambucano 2026 vai movimentar as ruas do Recife, as conversas de trabalho e as famílias divididas entre Sport, Náutico e Santa Cruz. Que espetáculo!</p>`
    }
];

async function escape(text) {
    return (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateHTML(article) {
    const pubDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const url = `/artigo/${article.id}.html`;
    const regionalLabels = {
        paulistao: 'Paulistão', carioca: 'Carioca', mineiro: 'Mineiro',
        gaucho: 'Gaúcho', nordestao: 'Nordestão', paranaense: 'Paranaense', pernambucano: 'Pernambucano'
    };
    const label = regionalLabels[article.regional] || 'Regional';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - Bola na Rede</title>
    <meta name="description" content="${article.excerpt}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://bolanarede.com.br${url}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.excerpt}">
    <meta property="og:image" content="${article.image}">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "${article.title.replace(/"/g, '\\"')}",
        "image": "${article.image}",
        "datePublished": "${new Date().toISOString()}",
        "description": "${article.excerpt.replace(/"/g, '\\"')}",
        "articleSection": "${label}",
        "publisher": { "@type": "Organization", "name": "Bola na Rede" }
    }
    </script>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/article.css">
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">
                <a href="/"><strong>BOLA NA REDE</strong></a>
                <span class="tagline">O futebol sem filtro</span>
            </div>
            <ul class="main-nav">
                <li><a href="/">Início</a></li>
                <li><a href="/#brasileirao">Série A</a></li>
                <li><a href="/regionais.html">Regionais</a></li>
                <li><a href="/#copa">Copa 2026</a></li>
                <li><a href="/#mercado">Mercado</a></li>
            </ul>
        </nav>
    </header>

    <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol>
                <li><a href="/">Home</a></li>
                <li><a href="/regionais.html#${article.regional}">${label}</a></li>
                <li aria-current="page">${article.title.substring(0, 50)}...</li>
            </ol>
        </nav>
    </div>

    <main class="article-page">
        <div class="container article-container">
            <div class="article-content">
                <div class="article-header">
                    <span class="article-category">${label}</span>
                    <h1 class="article-title">${article.title}</h1>
                    <p class="article-subtitle">${article.excerpt}</p>
                    <div class="article-meta">
                        <span class="article-date">📅 ${pubDate}</span>
                        <span class="article-reading-time">⏱️ ${article.readingTime} min de leitura</span>
                    </div>
                </div>

                <figure class="article-image">
                    <img src="${article.image}" alt="${article.title}" loading="eager">
                </figure>

                <div class="article-body">
                    ${article.body}
                </div>

                <div class="article-share">
                    <p><strong>Compartilhe:</strong></p>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}" target="_blank" rel="noopener">🐦 Twitter</a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://bolanarede.com.br' + url)}" target="_blank" rel="noopener">📘 Facebook</a>
                    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' - https://bolanarede.com.br' + url)}" target="_blank" rel="noopener">💬 WhatsApp</a>
                </div>

                <div style="margin-top:24px; padding:16px; background:#f0fdf4; border-radius:8px; border-left:4px solid #009739;">
                    <p style="margin:0; font-size:14px;">💬 <strong>Debata sobre este regional!</strong> <a href="/regionais.html#${article.regional}">Clique aqui para comentar no fórum do ${label}</a></p>
                </div>

                <div class="related-articles-container"></div>
            </div>
        </div>
    </main>

    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2026 Bola na Rede. Futebol sem filtro.</p>
        </div>
    </footer>

    <script src="/js/main.js"></script>
    <script src="/js/related-articles.js"></script>
</body>
</html>`;
}

async function run() {
    await fs.mkdir(ARTIGO_DIR, { recursive: true });

    // Carrega index existente
    let articles = [];
    try {
        const data = await fs.readFile(ARTICLES_INDEX, 'utf8');
        articles = JSON.parse(data);
    } catch (e) {}

    // Filtra artigos regionais já existentes (evita duplicatas)
    const existingIds = new Set(articles.map(a => a.id));

    let added = 0;
    for (const article of ARTICLES) {
        if (existingIds.has(article.id)) {
            console.log(`⏭️  Já existe: ${article.id}`);
            continue;
        }

        // Gera HTML
        const html = generateHTML(article);
        const htmlPath = path.join(ARTIGO_DIR, `${article.id}.html`);
        await fs.writeFile(htmlPath, html, 'utf8');
        console.log(`✅ HTML: ${article.id}.html`);

        // Adiciona ao index
        articles.unshift({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            category: 'regionais',
            regional: article.regional,
            language: 'pt-BR',
            url: `/artigo/${article.id}.html`,
            image: article.image,
            publishedAt: new Date().toISOString(),
            readingTime: article.readingTime
        });
        added++;
    }

    // Salva index (mantém 100 mais recentes)
    articles = articles.slice(0, 100);
    const indexJson = JSON.stringify(articles, null, 2);
    await fs.writeFile(ARTICLES_INDEX, indexJson, 'utf8');
    await fs.writeFile(PUBLIC_DATA_INDEX, indexJson, 'utf8');

    console.log(`\n✅ Concluído: ${added} artigos regionais criados`);
    console.log(`📊 Total no índice: ${articles.length}`);
}

run().catch(err => { console.error('❌ Erro:', err); process.exit(1); });
