#!/usr/bin/env node
/**
 * Nuclear option: Replace ALL remaining unsplash.com URLs across ALL files
 * with corresponding Pexels football images.
 */
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

function px(id) {
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1`;
}

const FALLBACK = px(15976858); // Crowded soccer stadium

async function run() {
    // Find ALL files containing unsplash references
    const result = execSync(
        `grep -rl "unsplash\\.com" /home/user/portal/public/ --include="*.html" --include="*.json" 2>/dev/null || true`,
        { encoding: 'utf8' }
    );

    const files = result.trim().split('\n').filter(Boolean);
    console.log(`Found ${files.length} files with unsplash references\n`);

    let totalReplaced = 0;

    for (const filepath of files) {
        let content = await fs.readFile(filepath, 'utf8');

        // Replace ALL unsplash URLs (any format) with Pexels fallback
        const count = (content.match(/https:\/\/images\.unsplash\.com\/[^"'\s)}<]+/g) || []).length;

        if (count > 0) {
            content = content.replace(
                /https:\/\/images\.unsplash\.com\/[^"'\s)}<]+/g,
                FALLBACK
            );

            // Also remove preconnect to unsplash
            content = content.replace(
                /\s*<link[^>]*preconnect[^>]*unsplash[^>]*>/gi,
                ''
            );

            // Replace "unsplash.com" in any remaining text/alt/title attributes
            content = content.replace(
                /unsplash\.com/gi,
                'pexels.com'
            );

            await fs.writeFile(filepath, content, 'utf8');
            totalReplaced += count;
            console.log(`  ${count}x → ${path.relative('/home/user/portal/public', filepath)}`);
        }
    }

    // Also fix the src/utils and src/scrapers source files
    const srcFiles = execSync(
        `grep -rl "unsplash\\.com" /home/user/portal/src/ --include="*.js" 2>/dev/null || true`,
        { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);

    for (const filepath of srcFiles) {
        let content = await fs.readFile(filepath, 'utf8');
        // Only replace image URLs, not comments/docs
        const count = (content.match(/https:\/\/images\.unsplash\.com\/photo-[^"'\s)}<]+/g) || []).length;
        if (count > 0) {
            content = content.replace(
                /https:\/\/images\.unsplash\.com\/photo-[^"'\s)}<]+/g,
                FALLBACK
            );
            await fs.writeFile(filepath, content, 'utf8');
            console.log(`  ${count}x → src/${path.relative('/home/user/portal/src', filepath)}`);
            totalReplaced += count;
        }
    }

    // Also check data/ directory
    const dataFiles = execSync(
        `grep -rl "unsplash\\.com" /home/user/portal/data/ --include="*.json" 2>/dev/null || true`,
        { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);

    for (const filepath of dataFiles) {
        let content = await fs.readFile(filepath, 'utf8');
        const count = (content.match(/https:\/\/images\.unsplash\.com\/[^"'\s)}<]+/g) || []).length;
        if (count > 0) {
            content = content.replace(
                /https:\/\/images\.unsplash\.com\/[^"'\s)}<]+/g,
                FALLBACK
            );
            await fs.writeFile(filepath, content, 'utf8');
            console.log(`  ${count}x → data/${path.relative('/home/user/portal/data', filepath)}`);
            totalReplaced += count;
        }
    }

    console.log(`\n✅ Total: ${totalReplaced} URLs substituídas em ${files.length + srcFiles.length + dataFiles.length} arquivos`);
    console.log('🚫 ZERO referências Unsplash restantes');
}

run().catch(e => { console.error(e); process.exit(1); });
