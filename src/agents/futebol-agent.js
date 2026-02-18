/**
 * AGENTE JORNALISTA DE FUTEBOL - Bola na Rede
 *
 * Estilo editorial: TNT Sports / Lance / Globo Esporte
 * Cobertura: Brasileirão, Copa do Mundo 2026, Mercado da Bola,
 *            Libertadores, Champions League, Seleção Brasileira
 *
 * Características do estilo:
 * - Títulos impactantes e diretos
 * - Linguagem vibrante, apaixonada mas informativa
 * - Dados estatísticos integrados na narrativa
 * - Contextualização histórica quando relevante
 * - Opinião fundamentada em fatos
 */

const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `Você é um jornalista esportivo brasileiro de elite, especialista em futebol.
Seu estilo editorial combina o melhor de TNT Sports, Lance e Globo Esporte.

DIRETRIZES DE ESTILO:
1. TÍTULOS: Impactantes, diretos, com verbos fortes. Use pontuação dramática quando apropriado.
   - BOM: "Flamengo atropela rival e dispara na liderança do Brasileirão"
   - RUIM: "Flamengo vence jogo do campeonato brasileiro"

2. LINGUAGEM: Vibrante mas profissional. Transmita a emoção do futebol sem perder credibilidade.
   - Use metáforas esportivas naturais ("goleada", "sufoco", "virada épica")
   - Integre dados e estatísticas na narrativa de forma fluida
   - Contextualize com referências históricas quando relevante

3. ESTRUTURA DO ARTIGO:
   - Lide forte nos 2 primeiros parágrafos (quem, o quê, quando, onde)
   - Desenvolvimento com detalhes táticos e análise
   - Dados estatísticos e comparações
   - Contexto e impacto na competição
   - Fechamento com próximos jogos ou desdobramentos

4. TOM: Apaixonado por futebol, mas equilibrado. Nunca tendencioso para um clube.
   Trate todos os times com respeito profissional.

5. CATEGORIAS DE COBERTURA:
   - brasileirao: Série A, B e estaduais relevantes
   - copa: Copa do Mundo 2026 e eliminatórias
   - mercado: Transferências e negociações
   - internacional: Champions League, Libertadores, ligas europeias
   - selecao: Seleção Brasileira
   - opiniao: Análises e colunas de opinião

6. FORMATO: Sempre em português brasileiro (pt-BR). Artigos entre 400-800 palavras.
   Use aspas para citações de jogadores/técnicos (podem ser paráfrases de declarações públicas).

7. INTEGRIDADE: Baseie-se APENAS nos fatos fornecidos nas fontes. NÃO invente informações,
   resultados ou declarações. Se a fonte for limitada, escreva um artigo mais curto mas factual.

IMPORTANTE: Cada artigo deve incluir ao final uma seção "tags" com palavras-chave relevantes
e "categoria" indicando a editoria (brasileirao, copa, mercado, internacional, selecao, opiniao).`;

class FutebolAgent {
    constructor(apiKey) {
        this.client = new Anthropic({ apiKey });
        this.model = process.env.AI_MODEL || 'claude-sonnet-4-5-20250514';
    }

    /**
     * Gera um artigo original a partir de fontes de notícias
     */
    async gerarArtigo(fontes, categoria = 'brasileirao') {
        const fontesTexto = fontes.map((f, i) =>
            `[FONTE ${i + 1}] ${f.title}\n${f.description || ''}\n${f.content || ''}\nPublicado: ${f.publishedAt || 'N/A'}\nFonte: ${f.source || 'N/A'}`
        ).join('\n\n---\n\n');

        const prompt = `Com base nas seguintes fontes de notícias sobre futebol, escreva um artigo original e envolvente.

FONTES:
${fontesTexto}

CATEGORIA SUGERIDA: ${categoria}

Responda EXCLUSIVAMENTE em formato JSON válido, sem markdown, sem code blocks:
{
    "titulo": "Título impactante do artigo",
    "subtitulo": "Subtítulo complementar com contexto",
    "corpo": "Texto completo do artigo em HTML com parágrafos (<p>), negritos (<strong>) e subtítulos (<h3>) quando necessário",
    "resumo": "Resumo de 2 linhas para preview/SEO",
    "categoria": "brasileirao|copa|mercado|internacional|selecao|opiniao",
    "tags": ["tag1", "tag2", "tag3"],
    "destaque": true/false (se é notícia de grande impacto),
    "imagemSugerida": "descrição da imagem ideal para o artigo"
}`;

        try {
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 4096,
                system: SYSTEM_PROMPT,
                messages: [{ role: 'user', content: prompt }]
            });

            const texto = response.content[0].text.trim();
            // Limpa possíveis code blocks
            const jsonLimpo = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(jsonLimpo);
        } catch (error) {
            console.error('Erro ao gerar artigo:', error.message);
            throw error;
        }
    }

    /**
     * Gera a edição diária com múltiplos artigos
     */
    async gerarEdicaoDiaria(todasFontes) {
        const artigos = [];
        const categorias = this.categorizarFontes(todasFontes);

        for (const [categoria, fontes] of Object.entries(categorias)) {
            if (fontes.length === 0) continue;

            // Agrupa fontes relacionadas (máx 3-4 fontes por artigo)
            const grupos = this.agruparFontesRelacionadas(fontes);

            for (const grupo of grupos) {
                try {
                    console.log(`📝 Gerando artigo: ${categoria} (${grupo.length} fontes)`);
                    const artigo = await this.gerarArtigo(grupo, categoria);
                    artigo.geradoEm = new Date().toISOString();
                    artigo.fontesUsadas = grupo.length;
                    artigos.push(artigo);

                    // Rate limiting
                    await this.delay(2000);
                } catch (err) {
                    console.error(`Erro na categoria ${categoria}:`, err.message);
                }
            }
        }

        return artigos;
    }

    /**
     * Categoriza automaticamente as fontes por editoria
     */
    categorizarFontes(fontes) {
        const categorias = {
            brasileirao: [],
            copa: [],
            mercado: [],
            internacional: [],
            selecao: [],
            opiniao: []
        };

        const regras = {
            brasileirao: /brasileir[aã]o|s[ée]rie [ab]|campeonato brasileiro|flamengo|palmeiras|corinthians|s[aã]o paulo|santos|grêmio|inter(nacional)?|cruzeiro|atl[ée]tico|vasco|botafogo|fluminense|bahia|fortaleza|estadual|paulist[aã]o|carioca|ga[uú]cho|mineiro/i,
            copa: /copa do mundo|copa 2026|mundial 2026|fifa world cup|eliminat[oó]rias|qualifiers/i,
            mercado: /transfer[eê]ncia|contrat|renov|emprest|negocia|mercado|compra|venda|proposta|oferta|acordo|assina/i,
            internacional: /champions|libertadores|europa league|premier league|la liga|serie a italiana|bundesliga|ligue 1|psg|real madrid|barcelona|manchester|liverpool|bayern|juventus/i,
            selecao: /sele[cç][aã]o brasileira|sele[cç][aã]o do brasil|cbf|ancelotti|convoca[cç][aã]o|amistoso.*brasil/i
        };

        for (const fonte of fontes) {
            const texto = `${fonte.title} ${fonte.description || ''} ${fonte.content || ''}`;
            let categorizada = false;

            for (const [cat, regex] of Object.entries(regras)) {
                if (regex.test(texto)) {
                    categorias[cat].push(fonte);
                    categorizada = true;
                    break;
                }
            }

            if (!categorizada) {
                // Tenta colocar em internacional como fallback para futebol genérico
                if (/futebol|soccer|football|gol|jogo|partida|campeonato/i.test(texto)) {
                    categorias.internacional.push(fonte);
                }
            }
        }

        return categorias;
    }

    /**
     * Agrupa fontes sobre o mesmo assunto
     */
    agruparFontesRelacionadas(fontes) {
        if (fontes.length <= 4) return [fontes];

        const grupos = [];
        const usadas = new Set();

        for (let i = 0; i < fontes.length; i++) {
            if (usadas.has(i)) continue;

            const grupo = [fontes[i]];
            usadas.add(i);

            for (let j = i + 1; j < fontes.length && grupo.length < 4; j++) {
                if (usadas.has(j)) continue;
                if (this.fontesRelacionadas(fontes[i], fontes[j])) {
                    grupo.push(fontes[j]);
                    usadas.add(j);
                }
            }

            grupos.push(grupo);
        }

        return grupos;
    }

    /**
     * Verifica se duas fontes tratam do mesmo assunto
     */
    fontesRelacionadas(a, b) {
        const palavrasA = new Set(a.title.toLowerCase().split(/\s+/).filter(p => p.length > 3));
        const palavrasB = new Set(b.title.toLowerCase().split(/\s+/).filter(p => p.length > 3));

        let comuns = 0;
        for (const p of palavrasA) {
            if (palavrasB.has(p)) comuns++;
        }

        return comuns >= 2;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = FutebolAgent;
