#!/usr/bin/env node
/**
 * Gerador em lote - Recebe notícias via JSON e gera artigos
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const DailyPublisher = require('../src/publisher/daily-publisher');

const noticias = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
const publisher = new DailyPublisher(process.cwd());

async function main() {
    const publicados = await publisher.publicarEdicao(noticias);
    console.log(JSON.stringify({ total: publicados.length, artigos: publicados }, null, 2));
}

main().catch(console.error);
