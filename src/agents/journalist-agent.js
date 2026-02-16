/**
 * JOURNALIST AI AGENT
 *
 * Este agente é responsável por:
 * 1. Receber múltiplas fontes de notícias
 * 2. Analisar criticamente o contexto
 * 3. Criar conteúdo original baseado nos fatos
 * 4. Manter jornalismo ético e factual
 */

const JOURNALIST_SYSTEM_PROMPT = `
Você é um jornalista profissional experiente trabalhando para um portal de notícias independente.

## SUA MISSÃO:
- Analisar múltiplas fontes de notícias sobre o mesmo tema
- Identificar os FATOS centrais e verificar consistência entre fontes
- Criar uma narrativa ORIGINAL com sua perspectiva jornalística
- Manter integridade factual - NUNCA invente informações
- Escrever de forma clara, objetiva e envolvente

## REGRAS ABSOLUTAS:
1. NUNCA copie texto literal das fontes
2. NUNCA invente fatos, números ou citações
3. SEMPRE cite quando houver informações conflitantes
4. Use linguagem jornalística profissional
5. Mantenha neutralidade em temas políticos sensíveis
6. Se não houver informação suficiente, seja honesto sobre isso

## ESTRUTURA DO ARTIGO:
1. **Título**: Chamativo mas factual (máx 80 caracteres)
2. **Lead**: Primeiro parágrafo resume os pontos principais (2-3 linhas)
3. **Desenvolvimento**: Expanda os fatos com contexto e análise
4. **Contexto**: Forneça background quando necessário
5. **Conclusão**: Feche com perspectivas ou próximos passos

## ESTILO:
- Parágrafos curtos (3-4 linhas)
- Frases diretas e claras
- Voz ativa sempre que possível
- Evite jargões técnicos sem explicação
- Use números e dados quando disponíveis

## VERIFICAÇÃO DE QUALIDADE:
Antes de entregar, certifique-se:
- ✓ Todos os fatos podem ser rastreados às fontes
- ✓ O texto é 100% original
- ✓ A narrativa flui naturalmente
- ✓ Não há erros gramaticais
- ✓ O título é atraente e honesto
`;

const JOURNALIST_TASK_PROMPT = `
## TAREFA:

Você recebeu as seguintes fontes sobre uma notícia:

{SOURCES}

## INFORMAÇÕES DAS FONTES:
- Total de fontes: {SOURCE_COUNT}
- Tema principal: {MAIN_TOPIC}
- Categoria: {CATEGORY}
- Idioma de saída: {LANGUAGE}

## INSTRUÇÕES:

1. Analise TODAS as fontes cuidadosamente
2. Identifique os fatos principais que aparecem em múltiplas fontes
3. Note qualquer discrepância entre as fontes
4. Crie um artigo ORIGINAL seguindo sua expertise jornalística
5. Use o estilo apropriado para {CATEGORY}
6. Escreva em {LANGUAGE}

## FORMATO DE SAÍDA (JSON):

{
    "title": "Título do artigo (máx 80 caracteres)",
    "excerpt": "Resumo em 2-3 linhas para preview",
    "content": "Conteúdo completo em HTML (use <p>, <h2>, <strong>, etc)",
    "category": "{CATEGORY}",
    "language": "{LANGUAGE}",
    "readingTime": número estimado de minutos,
    "keywords": ["palavra1", "palavra2", "palavra3"],
    "sources_analyzed": número de fontes analisadas,
    "confidence": "high/medium/low - sua confiança na informação",
    "fact_check_notes": "Notas sobre verificação de fatos se relevante"
}

IMPORTANTE:
- Retorne APENAS o JSON válido, sem texto adicional
- Todo o conteúdo deve ser ORIGINAL
- Mantenha a integridade jornalística
`;

class JournalistAgent {
    constructor(apiKey = null, model = 'claude-sonnet-4') {
        this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
        this.model = model;
        this.baseURL = 'https://api.anthropic.com/v1/messages';
    }

    /**
     * Processa múltiplas fontes e cria um artigo original
     */
    async createArticleFromSources(sources, options = {}) {
        const {
            category = 'geral',
            language = 'pt-BR',
            mainTopic = this.extractMainTopic(sources)
        } = options;

        // Formata as fontes para o prompt
        const formattedSources = this.formatSources(sources);

        // Monta o prompt completo
        const taskPrompt = JOURNALIST_TASK_PROMPT
            .replace('{SOURCES}', formattedSources)
            .replace('{SOURCE_COUNT}', sources.length)
            .replace('{MAIN_TOPIC}', mainTopic)
            .replace(/{CATEGORY}/g, category)
            .replace(/{LANGUAGE}/g, language);

        try {
            const article = await this.callAnthropicAPI(taskPrompt);

            // Validação do artigo
            this.validateArticle(article);

            // Adiciona metadados
            article.created_at = new Date().toISOString();
            article.slug = this.generateSlug(article.title);
            article.image = this.selectBestImage(sources);

            return article;
        } catch (error) {
            console.error('Error creating article:', error);
            throw new Error(`Failed to create article: ${error.message}`);
        }
    }

    /**
     * Formata as fontes para inclusão no prompt
     */
    formatSources(sources) {
        return sources.map((source, index) => `
### FONTE ${index + 1}:
**Título:** ${source.title}
**Veículo:** ${source.source || 'Não especificado'}
**Data:** ${source.publishedAt || 'Não especificada'}
**Resumo:** ${source.description || source.content?.substring(0, 500) || 'Sem resumo'}
**URL:** ${source.url}
        `).join('\n\n---\n\n');
    }

    /**
     * Extrai o tópico principal das fontes
     */
    extractMainTopic(sources) {
        // Análise simples - pode ser melhorada com NLP
        const titles = sources.map(s => s.title).join(' ');

        // Palavras comuns que aparecem
        const words = titles.toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 4)
            .reduce((acc, word) => {
                acc[word] = (acc[word] || 0) + 1;
                return acc;
            }, {});

        const topWord = Object.entries(words)
            .sort((a, b) => b[1] - a[1])[0];

        return topWord ? topWord[0] : 'notícias';
    }

    /**
     * Chama a API da Anthropic (Claude)
     */
    async callAnthropicAPI(userPrompt) {
        if (!this.apiKey) {
            throw new Error('Anthropic API key not configured');
        }

        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: 4096,
                system: JOURNALIST_SYSTEM_PROMPT,
                messages: [
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        const content = data.content[0].text;

        // Parse JSON da resposta
        try {
            return JSON.parse(content);
        } catch (e) {
            // Se a resposta não for JSON puro, tenta extrair
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid JSON response from AI');
        }
    }

    /**
     * Valida o artigo gerado
     */
    validateArticle(article) {
        const required = ['title', 'excerpt', 'content', 'category', 'language'];

        for (const field of required) {
            if (!article[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validações de qualidade
        if (article.title.length > 120) {
            console.warn('Title is too long, truncating...');
            article.title = article.title.substring(0, 117) + '...';
        }

        if (article.excerpt.length > 300) {
            console.warn('Excerpt is too long, truncating...');
            article.excerpt = article.excerpt.substring(0, 297) + '...';
        }

        if (article.content.length < 200) {
            throw new Error('Article content is too short');
        }
    }

    /**
     * Gera slug para URL
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, '-') // Substitui espaços por hífens
            .replace(/-+/g, '-') // Remove hífens duplicados
            .substring(0, 100);
    }

    /**
     * Seleciona a melhor imagem das fontes
     */
    selectBestImage(sources) {
        // Prioriza imagens de alta qualidade
        for (const source of sources) {
            if (source.urlToImage && source.urlToImage.includes('http')) {
                return source.urlToImage;
            }
        }
        return null;
    }

    /**
     * Batch processing - processa múltiplos artigos
     */
    async createArticleBatch(sourcesArray, options = {}) {
        const articles = [];

        for (const sources of sourcesArray) {
            try {
                const article = await this.createArticleFromSources(sources, options);
                articles.push(article);

                // Rate limiting - aguarda 1 segundo entre requests
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Error processing batch item:', error);
                // Continua com os próximos
            }
        }

        return articles;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JournalistAgent, JOURNALIST_SYSTEM_PROMPT };
}
