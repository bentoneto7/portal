/**
 * PUBLICADOR DIÁRIO - Bola na Rede
 *
 * Responsável por:
 * 1. Gerar arquivos HTML dos artigos
 * 2. Atualizar o índice de artigos (articles-index.json)
 * 3. Atualizar índices por categoria
 * 4. Fazer commit e push para o GitHub
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DailyPublisher {
    constructor(baseDir) {
        this.baseDir = baseDir || process.cwd();
        this.articlesDir = path.join(this.baseDir, 'public', 'articles', 'pt-BR');
        this.dataDir = path.join(this.baseDir, 'data');
        this.indexPath = path.join(this.dataDir, 'articles-index.json');
        this.publishedPath = path.join(this.dataDir, 'published-titles.json');
    }

    /**
     * Publica a edição diária completa
     */
    async publicarEdicao(artigos) {
        console.log(`\n📰 Publicando edição diária: ${artigos.length} artigos\n`);

        const publicados = [];
        const data = new Date();
        const dataStr = data.toISOString().split('T')[0]; // YYYY-MM-DD

        for (const artigo of artigos) {
            try {
                const resultado = await this.publicarArtigo(artigo, dataStr);
                if (resultado) {
                    publicados.push(resultado);
                    console.log(`   ✅ ${resultado.titulo}`);
                }
            } catch (err) {
                console.error(`   ❌ Erro: ${err.message}`);
            }
        }

        // Atualiza índices
        this.atualizarIndice(publicados);
        this.atualizarTitulosPublicados(publicados);

        console.log(`\n📊 ${publicados.length}/${artigos.length} artigos publicados com sucesso\n`);
        return publicados;
    }

    /**
     * Publica um único artigo como arquivo HTML
     */
    async publicarArtigo(artigo, dataStr) {
        // Verifica duplicata
        if (this.jaPuplicado(artigo.titulo)) {
            console.log(`   ⏭️ Já publicado: ${artigo.titulo}`);
            return null;
        }

        const slug = this.gerarSlug(artigo.titulo);
        const filename = `${slug}.html`;
        const categoria = artigo.categoria || 'brasileirao';
        const categoriaDir = path.join(this.articlesDir, categoria);

        // Cria diretório da categoria se não existe
        fs.mkdirSync(categoriaDir, { recursive: true });

        const filepath = path.join(categoriaDir, filename);
        const urlPath = `/articles/pt-BR/${categoria}/${filename}`;

        // Gera HTML do artigo
        const html = this.gerarHTML(artigo, urlPath, dataStr);
        fs.writeFileSync(filepath, html, 'utf-8');

        return {
            titulo: artigo.titulo,
            subtitulo: artigo.subtitulo,
            resumo: artigo.resumo,
            categoria: categoria,
            tags: artigo.tags || [],
            destaque: artigo.destaque || false,
            slug: slug,
            url: urlPath,
            arquivo: filepath,
            publicadoEm: new Date().toISOString(),
            imagemSugerida: artigo.imagemSugerida || ''
        };
    }

    /**
     * Gera o HTML completo do artigo
     */
    gerarHTML(artigo, urlPath, dataStr) {
        const agora = new Date();
        const dataFormatada = agora.toLocaleDateString('pt-BR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const horaFormatada = agora.toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit'
        });

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHTML(artigo.titulo)} | Bola na Rede</title>
    <meta name="description" content="${this.escapeHTML(artigo.resumo || '')}">
    <meta name="keywords" content="${(artigo.tags || []).join(', ')}">

    <!-- Open Graph -->
    <meta property="og:title" content="${this.escapeHTML(artigo.titulo)}">
    <meta property="og:description" content="${this.escapeHTML(artigo.resumo || '')}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://portal-production-d8e6.up.railway.app${urlPath}">
    <meta property="og:site_name" content="Bola na Rede">
    <meta property="article:published_time" content="${agora.toISOString()}">
    <meta property="article:section" content="${artigo.categoria || 'Futebol'}">
    ${(artigo.tags || []).map(t => `<meta property="article:tag" content="${t}">`).join('\n    ')}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${this.escapeHTML(artigo.titulo)}">
    <meta name="twitter:description" content="${this.escapeHTML(artigo.resumo || '')}">

    <!-- Schema.org -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "${this.escapeHTML(artigo.titulo)}",
        "description": "${this.escapeHTML(artigo.resumo || '')}",
        "datePublished": "${agora.toISOString()}",
        "dateModified": "${agora.toISOString()}",
        "author": {
            "@type": "Organization",
            "name": "Bola na Rede"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Bola na Rede"
        },
        "articleSection": "${artigo.categoria || 'Futebol'}",
        "keywords": "${(artigo.tags || []).join(', ')}"
    }
    </script>

    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/article.css">
</head>
<body>
    <header class="article-header">
        <nav>
            <a href="/" class="logo">⚽ Bola na Rede</a>
            <div class="nav-links">
                <a href="/?cat=brasileirao">Brasileirão</a>
                <a href="/?cat=copa">Copa 2026</a>
                <a href="/?cat=mercado">Mercado</a>
                <a href="/?cat=internacional">Internacional</a>
                <a href="/?cat=selecao">Seleção</a>
            </div>
        </nav>
    </header>

    <main class="article-main">
        <article>
            <div class="article-meta">
                <span class="categoria categoria-${artigo.categoria || 'brasileirao'}">${this.nomeCategoria(artigo.categoria)}</span>
                <time datetime="${agora.toISOString()}">${dataFormatada} às ${horaFormatada}</time>
            </div>

            <h1>${this.escapeHTML(artigo.titulo)}</h1>
            ${artigo.subtitulo ? `<h2 class="subtitulo">${this.escapeHTML(artigo.subtitulo)}</h2>` : ''}

            <div class="article-body">
                ${artigo.corpo}
            </div>

            <div class="article-tags">
                ${(artigo.tags || []).map(t => `<a href="/?tag=${encodeURIComponent(t)}" class="tag">#${t}</a>`).join(' ')}
            </div>

            <div class="article-share">
                <p>Compartilhe:</p>
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(artigo.titulo)}&url=${encodeURIComponent('https://portal-production-d8e6.up.railway.app' + urlPath)}" target="_blank" rel="noopener">Twitter</a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://portal-production-d8e6.up.railway.app' + urlPath)}" target="_blank" rel="noopener">Facebook</a>
                <a href="https://wa.me/?text=${encodeURIComponent(artigo.titulo + ' ' + 'https://portal-production-d8e6.up.railway.app' + urlPath)}" target="_blank" rel="noopener">WhatsApp</a>
            </div>
        </article>
    </main>

    <footer>
        <p>&copy; ${agora.getFullYear()} Bola na Rede - Todos os direitos reservados</p>
        <p>Conteúdo gerado com inteligência artificial. Baseado em fontes públicas verificadas.</p>
    </footer>

    <script src="/js/main.js"></script>
</body>
</html>`;
    }

    /**
     * Atualiza o índice principal de artigos
     */
    atualizarIndice(novosArtigos) {
        let indice = [];

        try {
            if (fs.existsSync(this.indexPath)) {
                indice = JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
            }
        } catch (err) {
            console.warn('Índice anterior inválido, criando novo...');
        }

        // Adiciona novos artigos no início
        indice = [...novosArtigos, ...indice];

        // Mantém máximo de 500 artigos no índice
        if (indice.length > 500) {
            indice = indice.slice(0, 500);
        }

        fs.mkdirSync(this.dataDir, { recursive: true });
        fs.writeFileSync(this.indexPath, JSON.stringify(indice, null, 2), 'utf-8');

        // Atualiza índices por categoria
        this.atualizarIndicesCategoria(indice);

        console.log(`📋 Índice atualizado: ${indice.length} artigos total`);
    }

    /**
     * Atualiza índices separados por categoria
     */
    atualizarIndicesCategoria(indice) {
        const categorias = {};

        for (const artigo of indice) {
            const cat = artigo.categoria || 'geral';
            if (!categorias[cat]) categorias[cat] = [];
            categorias[cat].push(artigo);
        }

        const indicesDir = path.join(this.dataDir, 'indices');
        fs.mkdirSync(indicesDir, { recursive: true });

        for (const [cat, artigos] of Object.entries(categorias)) {
            const filepath = path.join(indicesDir, `pt-BR-${cat}.json`);
            fs.writeFileSync(filepath, JSON.stringify(artigos, null, 2), 'utf-8');
        }
    }

    /**
     * Controle de duplicatas
     */
    atualizarTitulosPublicados(novosArtigos) {
        let titulos = [];

        try {
            if (fs.existsSync(this.publishedPath)) {
                titulos = JSON.parse(fs.readFileSync(this.publishedPath, 'utf-8'));
            }
        } catch (err) { /* Arquivo novo */ }

        for (const artigo of novosArtigos) {
            titulos.push(artigo.titulo.toLowerCase().trim());
        }

        // Mantém últimos 1000 títulos
        if (titulos.length > 1000) {
            titulos = titulos.slice(-1000);
        }

        fs.writeFileSync(this.publishedPath, JSON.stringify(titulos, null, 2), 'utf-8');
    }

    jaPuplicado(titulo) {
        try {
            if (fs.existsSync(this.publishedPath)) {
                const titulos = JSON.parse(fs.readFileSync(this.publishedPath, 'utf-8'));
                return titulos.includes(titulo.toLowerCase().trim());
            }
        } catch (err) { /* Arquivo novo */ }
        return false;
    }

    /**
     * Faz commit e push para o GitHub
     */
    async commitEPush() {
        const data = new Date().toLocaleDateString('pt-BR');
        const mensagem = `📰 Edição diária - ${data}`;

        try {
            execSync('git add -A', { cwd: this.baseDir, stdio: 'pipe' });
            execSync(`git commit -m "${mensagem}"`, { cwd: this.baseDir, stdio: 'pipe' });
            execSync('git push origin main', { cwd: this.baseDir, stdio: 'pipe' });
            console.log(`\n🚀 Push realizado: "${mensagem}"`);
            return true;
        } catch (err) {
            // Se não houver mudanças, tudo bem
            if (err.message.includes('nothing to commit')) {
                console.log('ℹ️ Nenhuma mudança para commit');
                return true;
            }
            console.error(`❌ Erro no git: ${err.message}`);
            return false;
        }
    }

    // --- Utilidades ---

    gerarSlug(titulo) {
        return titulo
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 80)
            .replace(/-$/, '');
    }

    escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    nomeCategoria(cat) {
        const nomes = {
            brasileirao: 'Brasileirão',
            copa: 'Copa 2026',
            mercado: 'Mercado da Bola',
            internacional: 'Internacional',
            selecao: 'Seleção Brasileira',
            opiniao: 'Opinião'
        };
        return nomes[cat] || 'Futebol';
    }
}

module.exports = DailyPublisher;
