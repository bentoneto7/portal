#!/usr/bin/env node

/**
 * NEWS PORTAL - Main Entry Point
 *
 * Este arquivo inicializa todo o sistema:
 * 1. News Aggregator (coleta de notícias)
 * 2. Journalist Agent (IA para criar conteúdo original)
 * 3. Automated Publisher (publicação automática)
 * 4. Web Server (servidor Express)
 */

require('dotenv').config();

const { NewsAggregator } = require('./scrapers/news-aggregator');
const { JournalistAgent } = require('./agents/journalist-agent');
const { AutomatedPublisher } = require('./publisher/automated-publisher');

async function main() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║     NEWS PORTAL - AI JOURNALIST      ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Valida configuração
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ ERROR: ANTHROPIC_API_KEY not configured');
        console.error('Please set your Anthropic API key in .env file\n');
        console.error('Example:');
        console.error('ANTHROPIC_API_KEY=sk-ant-...\n');
        process.exit(1);
    }

    // Inicializa componentes
    console.log('🔧 Initializing components...\n');

    const newsAggregator = new NewsAggregator({
        newsApiKey: process.env.NEWS_API_KEY,
        newsDataApiKey: process.env.NEWSDATA_API_KEY,
        currentsApiKey: process.env.CURRENTS_API_KEY
    });

    const journalistAgent = new JournalistAgent(
        process.env.ANTHROPIC_API_KEY,
        process.env.AI_MODEL || 'claude-sonnet-4'
    );

    const publisher = new AutomatedPublisher({
        newsAggregator,
        journalistAgent,
        minSourcesForArticle: parseInt(process.env.MIN_SOURCES || '2'),
        publishInterval: parseInt(process.env.PUBLISH_INTERVAL || '1800000') // 30 min
    });

    // Inicia o servidor web
    console.log('🌐 Starting web server...');
    require('./server');

    // Aguarda 2 segundos para o servidor iniciar
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Inicia o publisher
    console.log('\n📰 Starting automated publisher...');
    await publisher.start();

    console.log('\n✅ All systems operational!\n');
    console.log('Press Ctrl+C to stop\n');

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Shutting down gracefully...');
        publisher.stop();
        setTimeout(() => {
            console.log('✅ Shutdown complete');
            process.exit(0);
        }, 1000);
    });
}

// Run
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
