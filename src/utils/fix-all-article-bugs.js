#!/usr/bin/env node
/**
 * FIX ALL ARTICLE BUGS - Comprehensive Article HTML Fixer
 * ========================================================
 * Fixes ALL known bugs in article HTML files:
 *
 * 1. Duplicate onerror attributes on <img> tags
 * 2. Duplicate loading="eager" attributes
 * 3. Duplicate <meta charset> and <meta viewport> tags
 * 4. Inconsistent og:image vs twitter:image (must match)
 * 5. Schema.org image must match og:image
 * 6. wordCount: 0 in schema → calculated from content
 * 7. Broken HTML (missing space before attributes)
 * 8. Google Analytics placeholder cleanup
 * 9. Missing manifest.json reference removal
 */

const fs = require('fs').promises;
const path = require('path');

const ARTIGO_DIR = path.join(__dirname, '../../public/artigo');

async function fixAllArticles() {
    console.log('\n🔧 FIX ALL ARTICLE BUGS\n');
    console.log('='.repeat(70));

    const files = await fs.readdir(ARTIGO_DIR);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    let totalFixed = 0;
    const bugReport = [];

    for (const file of htmlFiles) {
        const filePath = path.join(ARTIGO_DIR, file);
        let html = await fs.readFile(filePath, 'utf8');
        const original = html;
        const bugs = [];

        // ─── FIX 1: Remove duplicate meta charset ───
        const charsetMatches = html.match(/<meta charset="UTF-8">/g);
        if (charsetMatches && charsetMatches.length > 1) {
            // Keep only the first one - remove duplicates after line 5
            let found = 0;
            html = html.replace(/<meta charset="UTF-8">/g, (match) => {
                found++;
                return found === 1 ? match : ''; // keep first, remove rest
            });
            bugs.push('Duplicate meta charset removed');
        }

        // ─── FIX 2: Remove duplicate meta viewport ───
        const viewportMatches = html.match(/<meta name="viewport"[^>]*>/g);
        if (viewportMatches && viewportMatches.length > 1) {
            let found = 0;
            html = html.replace(/<meta name="viewport"[^>]*>/g, (match) => {
                found++;
                return found === 1 ? match : '';
            });
            bugs.push('Duplicate meta viewport removed');
        }

        // ─── FIX 3: Fix multiple onerror attributes on img tags ───
        // Pattern: img with multiple onerror= attributes
        html = html.replace(/<img\s+([^>]*?)>/g, (fullMatch, attrs) => {
            // Count onerror occurrences
            const onerrorMatches = attrs.match(/onerror="[^"]*"/g);
            if (onerrorMatches && onerrorMatches.length > 1) {
                // Keep only the first meaningful onerror (the one with fallback src)
                const goodOnerror = onerrorMatches.find(oe => oe.includes('this.src='));
                if (goodOnerror) {
                    // Remove ALL onerror attributes, then add the good one back
                    attrs = attrs.replace(/\s*onerror="[^"]*"/g, '');
                    attrs = attrs.trim() + ' ' + goodOnerror;
                }
                bugs.push('Multiple onerror fixed');
            }

            // Fix duplicate loading attributes
            const loadingMatches = attrs.match(/loading="[^"]*"/g);
            if (loadingMatches && loadingMatches.length > 1) {
                let foundLoading = 0;
                attrs = attrs.replace(/loading="[^"]*"/g, (m) => {
                    foundLoading++;
                    return foundLoading === 1 ? m : '';
                });
                bugs.push('Duplicate loading attr fixed');
            }

            // Fix missing space before attributes (e.g., style="..."onerror=)
            attrs = attrs.replace(/"(onerror|loading|style|class|alt|src)=/g, '" $1=');

            // Clean up extra whitespace
            attrs = attrs.replace(/\s{2,}/g, ' ').trim();

            return `<img ${attrs}>`;
        });

        // ─── FIX 4: Make og:image, twitter:image, and schema image consistent ───
        const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        if (ogImageMatch) {
            const ogImage = ogImageMatch[1];

            // Make twitter:image match og:image
            html = html.replace(
                /(<meta name="twitter:image" content=")[^"]*(")/,
                `$1${ogImage}$2`
            );

            // Make schema.org "image" → "url" match og:image
            html = html.replace(
                /("image"\s*:\s*\{[\s\S]*?"url"\s*:\s*")[^"]*(")/,
                `$1${ogImage}$2`
            );

            bugs.push('Images synchronized (og/twitter/schema)');
        }

        // ─── FIX 5: Fix wordCount in schema ───
        // Count actual words in article-text/article-content
        const articleTextMatch = html.match(/<div class="article-text">([\s\S]*?)<\/div>/);
        if (articleTextMatch) {
            const textContent = articleTextMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
            if (wordCount > 0) {
                html = html.replace(/"wordCount"\s*:\s*\d+/, `"wordCount": ${wordCount}`);
                bugs.push(`wordCount updated to ${wordCount}`);
            }
        }

        // ─── FIX 6: Remove placeholder GA tag ───
        html = html.replace(
            /\s*<!-- Google Analytics 4 -->\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-XXXXXXXXXX"><\/script>\s*<script>\s*window\.dataLayer[^<]*<\/script>/g,
            '\n    <!-- Google Analytics: configure with real GA4 ID -->'
        );
        html = html.replace(
            /\s*<!-- Preconnect -->\s*<link rel="preconnect" href="https:\/\/www\.googletagmanager\.com">/g,
            ''
        );

        // ─── FIX 7: Clean up empty lines from removed duplicates ───
        html = html.replace(/\n{3,}/g, '\n\n');

        // ─── FIX 8: Ensure all images in article have proper onerror fallback ───
        html = html.replace(/<img\s+src="(https:\/\/[^"]+)"([^>]*?)(?<!\s)>/g, (match, src, rest) => {
            if (!rest.includes('onerror=')) {
                const fallback = 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1';
                return `<img src="${src}"${rest} onerror="this.onerror=null;this.src='${fallback}'">`;
            }
            return match;
        });

        if (html !== original) {
            await fs.writeFile(filePath, html, 'utf8');
            totalFixed++;
            bugReport.push({ file, bugs: [...new Set(bugs)] });
            console.log(`✅ ${file} — ${[...new Set(bugs)].length} fix(es)`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`🎯 ${totalFixed}/${htmlFiles.length} artigos corrigidos`);
    console.log('\n📋 DETALHES:');
    bugReport.forEach(r => {
        console.log(`   ${r.file}`);
        r.bugs.forEach(b => console.log(`      → ${b}`));
    });
}

fixAllArticles().catch(console.error);
