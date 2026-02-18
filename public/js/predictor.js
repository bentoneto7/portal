/**
 * MOTOR DE ANÁLISE PREDITIVA — REGIONAIS 2026
 * Bola na Rede | Calcula scores e projeta destaques por fase
 */

const Predictor = (() => {

    // ─────────────────────────────────────────
    // PESOS DA FÓRMULA PREDITIVA
    // ─────────────────────────────────────────
    const PHASE_CONFIG = {
        quartas: { form: 1.0, experience: 1.0, goals: 1.0, label: 'Quartas de Final' },
        semis:   { form: 1.2, experience: 1.5, goals: 1.1, label: 'Semifinais'       },
        final:   { form: 1.4, experience: 2.0, goals: 1.2, label: 'Final'            },
        grupos:  { form: 0.9, experience: 0.9, goals: 1.0, label: 'Fase de Grupos'   }
    };

    const POSITION_MULT = { AT: 1.20, ME: 1.10, MC: 1.00, LD: 0.85, LE: 0.85, ZAG: 0.80, GK: 0.75 };
    const FORM_ICON = { W: '✅', D: '🟡', L: '❌' };

    let _data = null;

    // ─────────────────────────────────────────
    // CARGA DE DADOS
    // ─────────────────────────────────────────
    async function loadData() {
        if (_data) return _data;
        try {
            const res = await fetch('/data/regionais-data.json');
            _data = await res.json();
            return _data;
        } catch (e) {
            console.error('[Predictor] Falha ao carregar regionais-data.json', e);
            return null;
        }
    }

    // ─────────────────────────────────────────
    // ALGORITMO PREDITIVO
    // ─────────────────────────────────────────
    function calcScore(player, phase) {
        const cfg = PHASE_CONFIG[phase] || PHASE_CONFIG.quartas;
        const posMult = POSITION_MULT[player.position] || 1.0;

        const gpg = player.goals / Math.max(player.matches, 1);
        const apg = player.assists / Math.max(player.matches, 1);
        const avgForm = player.form.reduce((a, b) => a + b, 0) / player.form.length;
        // Tendência: diferença entre média das 3 últimas e 2 primeiras
        const recent = player.form.slice(-3).reduce((a,b) => a+b, 0) / 3;
        const early  = player.form.slice(0, 2).reduce((a,b) => a+b, 0) / 2;
        const trend = Math.max(0, recent - early); // só bônus se melhorando

        const score = (
            gpg * 30 * cfg.goals +
            apg * 20 +
            player.rating * 8 +
            avgForm * 6 * cfg.form +
            trend * 5 * cfg.form +
            player.experience * 3 * cfg.experience
        ) * posMult;

        return Math.min(100, Math.round(score * 10) / 10);
    }

    function calcTeamStrength(team) {
        const avgPlayerRating = team.players.reduce((a, p) => a + p.rating, 0) / team.players.length;
        const formPoints = team.form.reduce((pts, r) => pts + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);
        return (avgPlayerRating * 5 + team.teamRating * 5 + formPoints * 1.5).toFixed(1);
    }

    // ─────────────────────────────────────────
    // CONSULTAS
    // ─────────────────────────────────────────
    function getAllPlayers(regionalData) {
        return regionalData.teams.flatMap(team =>
            team.players.map(p => ({ ...p, teamId: team.id, teamName: team.name, teamColor: team.color, teamLogo: team.logo, teamAbbr: team.abbr }))
        );
    }

    function getTopPlayers(regionalData, phase, limit = 3) {
        return getAllPlayers(regionalData)
            .map(p => ({ ...p, score: calcScore(p, phase) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    function getTopScorer(regionalData) {
        return getAllPlayers(regionalData)
            .sort((a, b) => b.goals - a.goals || b.assists - a.assists)[0];
    }

    function getPredictedChampion(regionalData) {
        return regionalData.teams
            .map(t => ({ ...t, strength: parseFloat(calcTeamStrength(t)) }))
            .sort((a, b) => b.strength - a.strength)[0];
    }

    function getPredictedFinalists(regionalData) {
        return regionalData.teams
            .map(t => ({ ...t, strength: parseFloat(calcTeamStrength(t)) }))
            .sort((a, b) => b.strength - a.strength)
            .slice(0, 2);
    }

    // ─────────────────────────────────────────
    // HELPERS DE RENDERIZAÇÃO
    // ─────────────────────────────────────────
    function playerAvatar(player) {
        const initials = player.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const bg = (player.teamColor || '#009739').replace('#', '');
        const fg = _isLight(player.teamColor) ? '000000' : 'ffffff';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=${fg}&size=96&bold=true&font-size=0.5`;
    }

    function teamLogo(team) {
        if (team.logo || team.teamLogo) {
            return `<img src="${team.logo || team.teamLogo}" alt="${team.name}" style="width:32px;height:32px;object-fit:contain;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                    <span style="display:none;width:32px;height:32px;background:${team.teamColor || team.color || '#009739'};color:#fff;border-radius:50%;align-items:center;justify-content:center;font-size:10px;font-weight:900;">${(team.teamAbbr || team.abbr || '').substring(0,3)}</span>`;
        }
        const bg = (team.teamColor || team.color || '009739').replace('#','');
        const fg = _isLight(team.teamColor || team.color) ? '000000' : 'ffffff';
        return `<span style="display:flex;width:32px;height:32px;background:#${bg};color:#${fg};border-radius:50%;align-items:center;justify-content:center;font-size:10px;font-weight:900;">${(team.teamAbbr || team.abbr || '').substring(0,3)}</span>`;
    }

    function _isLight(hex) {
        if (!hex) return false;
        const c = hex.replace('#','');
        const r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
        return (r * 299 + g * 587 + b * 114) / 1000 > 128;
    }

    function scoreBar(score) {
        const pct = Math.round(score);
        const color = score >= 80 ? '#009739' : score >= 65 ? '#f5a623' : '#e53935';
        return `<div style="background:#f0f0f0;border-radius:4px;height:6px;overflow:hidden;margin-top:4px;">
                    <div style="width:${pct}%;height:100%;background:${color};transition:width .8s ease;"></div>
                </div>`;
    }

    function formBadge(formArr) {
        return (formArr || []).map(r => `<span style="font-size:11px;">${FORM_ICON[r] || '⬜'}</span>`).join('');
    }

    function posLabel(pos) {
        const labels = { AT: 'Atacante', ME: 'Meia', MC: 'Meia-Central', ZAG: 'Zagueiro', LD: 'Lateral Dir.', LE: 'Lateral Esq.', GK: 'Goleiro' };
        return labels[pos] || pos;
    }

    // ─────────────────────────────────────────
    // CARD: TOP PLAYER
    // ─────────────────────────────────────────
    function renderTopPlayerCard(player, rank, phase) {
        const isFirst = rank === 1;
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[rank - 1] || `#${rank}`;
        const avatar = playerAvatar(player);
        const tl = teamLogo({ logo: player.teamLogo, name: player.teamName, color: player.teamColor, abbr: player.teamAbbr });
        const formTrend = player.form[player.form.length - 1] - player.form[0];
        const trendIcon = formTrend > 0.3 ? '📈' : formTrend < -0.3 ? '📉' : '➡️';

        if (isFirst) {
            return `
            <div style="
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                border-radius: 14px;
                padding: 20px;
                color: white;
                display: flex;
                gap: 16px;
                align-items: center;
                margin-bottom: 12px;
                border: 2px solid #009739;
                position: relative;
                overflow: hidden;
            ">
                <div style="position:absolute;top:0;right:0;width:120px;height:120px;background:rgba(0,151,57,.08);border-radius:50%;transform:translate(30%,-30%);"></div>
                <div style="position:relative;z-index:1;">
                    <div style="text-align:center;margin-bottom:4px;font-size:24px;">${medal}</div>
                    <img src="${avatar}" alt="${player.name}"
                         style="width:72px;height:72px;border-radius:50%;border:3px solid #009739;object-fit:cover;"
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(player.name.substring(0,2))}&background=009739&color=fff&size=72&bold=true'">
                </div>
                <div style="flex:1;position:relative;z-index:1;">
                    <div style="font-size:18px;font-weight:900;margin-bottom:2px;">${player.name}</div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                        ${tl}
                        <span style="font-size:13px;color:#ccc;">${player.teamName}</span>
                        <span style="background:#009739;color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">${player.position}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px;">
                        <div style="text-align:center;background:rgba(255,255,255,.08);border-radius:8px;padding:6px;">
                            <div style="font-size:18px;font-weight:900;color:#00e05b;">${player.goals}</div>
                            <div style="font-size:10px;color:#aaa;">Gols</div>
                        </div>
                        <div style="text-align:center;background:rgba(255,255,255,.08);border-radius:8px;padding:6px;">
                            <div style="font-size:18px;font-weight:900;color:#5bc8ff;">${player.assists}</div>
                            <div style="font-size:10px;color:#aaa;">Assist.</div>
                        </div>
                        <div style="text-align:center;background:rgba(255,255,255,.08);border-radius:8px;padding:6px;">
                            <div style="font-size:18px;font-weight:900;color:#ffd700;">${player.rating.toFixed(1)}</div>
                            <div style="font-size:10px;color:#aaa;">Nota</div>
                        </div>
                        <div style="text-align:center;background:rgba(255,255,255,.08);border-radius:8px;padding:6px;">
                            <div style="font-size:18px;font-weight:900;color:#ff9f40;">${player.score}</div>
                            <div style="font-size:10px;color:#aaa;">Score</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:11px;color:#888;">Forma:</span>
                        ${formBadge(player.form)}
                        <span style="font-size:14px;">${trendIcon}</span>
                    </div>
                </div>
            </div>`;
        }

        // 2º e 3º colocados — mais compacto
        return `
        <div style="
            background: white;
            border-radius: 10px;
            padding: 12px 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
            border: 1px solid #f0f0f0;
            box-shadow: 0 1px 4px rgba(0,0,0,.05);
        ">
            <div style="font-size:20px;width:28px;text-align:center;">${medal}</div>
            <img src="${avatar}" alt="${player.name}"
                 style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid ${player.teamColor || '#009739'};"
                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(player.name.substring(0,2))}&background=${(player.teamColor||'#009739').replace('#','')}&color=fff&size=44&bold=true'">
            <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${player.name}</div>
                <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
                    ${tl}
                    <span style="font-size:12px;color:#666;">${player.teamName}</span>
                </div>
                ${scoreBar(player.score)}
            </div>
            <div style="text-align:right;flex-shrink:0;">
                <div style="font-size:16px;font-weight:900;color:#009739;">${player.score}</div>
                <div style="font-size:11px;color:#aaa;">${player.goals}G ${player.assists}A</div>
                <div style="font-size:10px;color:#999;">${posLabel(player.position)}</div>
            </div>
        </div>`;
    }

    // ─────────────────────────────────────────
    // CARD: EQUIPE FAVORITA
    // ─────────────────────────────────────────
    function renderChampionCard(champion, finalists, regional) {
        const totalStrength = finalists.reduce((sum, t) => sum + t.strength, 0);
        const pct = Math.round((champion.strength / totalStrength) * 100);
        const tl = teamLogo({ logo: champion.logo, name: champion.name, color: champion.color, abbr: champion.abbr });

        return `
        <div style="
            background: linear-gradient(135deg, #fff9e6 0%, #fffdf5 100%);
            border: 2px solid #f5a623;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 14px;
        ">
            <div style="font-size:32px;">🏆</div>
            <div style="flex:1;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:4px;">Campeão Previsto</div>
                <div style="display:flex;align-items:center;gap:8px;">
                    ${tl}
                    <span style="font-size:17px;font-weight:900;color:#1a1a1a;">${champion.name}</span>
                </div>
                <div style="margin-top:8px;background:#f0f0f0;border-radius:4px;height:8px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:#f5a623;border-radius:4px;transition:width .8s;"></div>
                </div>
                <div style="font-size:12px;color:#888;margin-top:4px;">Força relativa: ${pct}% — ${formBadge(champion.form)}</div>
            </div>
            <div style="text-align:center;flex-shrink:0;">
                <div style="font-size:22px;font-weight:900;color:#f5a623;">${champion.strength}</div>
                <div style="font-size:11px;color:#999;">Score</div>
            </div>
        </div>`;
    }

    // ─────────────────────────────────────────
    // CARD: ARTILHEIRO PREVISTO
    // ─────────────────────────────────────────
    function renderTopScorerCard(scorer) {
        const avatar = playerAvatar(scorer);
        const tl = teamLogo({ logo: scorer.teamLogo, name: scorer.teamName, color: scorer.teamColor, abbr: scorer.teamAbbr });
        return `
        <div style="
            background: #f0fdf4;
            border: 2px solid #009739;
            border-radius: 12px;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        ">
            <div style="font-size:28px;">⚽</div>
            <img src="${avatar}" alt="${scorer.name}"
                 style="width:48px;height:48px;border-radius:50%;border:2px solid #009739;object-fit:cover;"
                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(scorer.name.substring(0,2))}&background=009739&color=fff&size=48&bold=true'">
            <div style="flex:1;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:3px;">Artilheiro Previsto</div>
                <div style="font-size:16px;font-weight:900;color:#1a1a1a;">${scorer.name}</div>
                <div style="display:flex;align-items:center;gap:6px;margin-top:3px;">
                    ${tl}
                    <span style="font-size:12px;color:#555;">${scorer.teamName}</span>
                </div>
            </div>
            <div style="text-align:center;">
                <div style="font-size:28px;font-weight:900;color:#009739;">${scorer.goals}</div>
                <div style="font-size:11px;color:#666;">gols</div>
            </div>
        </div>`;
    }

    // ─────────────────────────────────────────
    // BLOCO: SELETOR DE FASE
    // ─────────────────────────────────────────
    function renderPhaseSelector(regional, currentPhase) {
        const phases = ['quartas', 'semis', 'final'];
        return `<div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
            ${phases.map(ph => `
                <button onclick="Predictor.switchPhase('${regional}', '${ph}')" id="phase-btn-${regional}-${ph}" style="
                    padding: 8px 18px;
                    border-radius: 20px;
                    border: 2px solid ${ph === currentPhase ? '#009739' : '#ddd'};
                    background: ${ph === currentPhase ? '#009739' : 'white'};
                    color: ${ph === currentPhase ? 'white' : '#555'};
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all .2s;
                ">${PHASE_CONFIG[ph].label}</button>
            `).join('')}
        </div>`;
    }

    // ─────────────────────────────────────────
    // BLOCO: TABELA DE TODOS OS JOGADORES
    // ─────────────────────────────────────────
    function renderFullTable(regionalData, phase) {
        const players = getAllPlayers(regionalData)
            .map(p => ({ ...p, score: calcScore(p, phase) }))
            .sort((a, b) => b.score - a.score);

        return `
        <div style="overflow-x:auto;border-radius:10px;border:1px solid #f0f0f0;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:560px;">
                <thead>
                    <tr style="background:#f8f9fa;border-bottom:2px solid #009739;">
                        <th style="padding:10px 12px;text-align:left;">#</th>
                        <th style="padding:10px 12px;text-align:left;">Jogador</th>
                        <th style="padding:10px 12px;text-align:left;">Clube</th>
                        <th style="padding:10px 12px;text-align:center;">Pos.</th>
                        <th style="padding:10px 12px;text-align:center;">G</th>
                        <th style="padding:10px 12px;text-align:center;">A</th>
                        <th style="padding:10px 12px;text-align:center;">Nota</th>
                        <th style="padding:10px 12px;text-align:center;">Score</th>
                        <th style="padding:10px 12px;text-align:left;">Forma</th>
                    </tr>
                </thead>
                <tbody>
                    ${players.map((p, i) => `
                    <tr style="border-bottom:1px solid #f5f5f5;${i === 0 ? 'background:#f0fdf4;' : ''}">
                        <td style="padding:10px 12px;font-weight:700;color:${i < 3 ? '#009739' : '#999'};">${i + 1}</td>
                        <td style="padding:10px 12px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <img src="${playerAvatar(p)}" alt="${p.name}"
                                     style="width:32px;height:32px;border-radius:50%;object-fit:cover;"
                                     onerror="this.style.display='none'">
                                <div>
                                    <div style="font-weight:700;">${p.name}</div>
                                    <div style="font-size:11px;color:#999;">Exp: ${p.experience}/10</div>
                                </div>
                            </div>
                        </td>
                        <td style="padding:10px 12px;">
                            <div style="display:flex;align-items:center;gap:6px;">
                                ${teamLogo({ logo: p.teamLogo, name: p.teamName, color: p.teamColor, abbr: p.teamAbbr })}
                                <span style="font-size:12px;color:#555;">${p.teamAbbr}</span>
                            </div>
                        </td>
                        <td style="padding:10px 12px;text-align:center;">
                            <span style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;">${p.position}</span>
                        </td>
                        <td style="padding:10px 12px;text-align:center;font-weight:700;color:#009739;">${p.goals}</td>
                        <td style="padding:10px 12px;text-align:center;font-weight:700;color:#5bc8ff;">${p.assists}</td>
                        <td style="padding:10px 12px;text-align:center;font-weight:700;color:#ffd700;">${p.rating.toFixed(1)}</td>
                        <td style="padding:10px 12px;text-align:center;">
                            <div style="font-weight:900;font-size:14px;color:${p.score >= 80 ? '#009739' : p.score >= 65 ? '#f5a623' : '#e53935'};">${p.score}</div>
                            ${scoreBar(p.score)}
                        </td>
                        <td style="padding:10px 12px;">${formBadge(p.form)}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
    }

    // ─────────────────────────────────────────
    // RENDER PRINCIPAL — injeta tudo
    // ─────────────────────────────────────────
    async function renderPredictor(regional) {
        const containerId = `predictor-${regional}`;
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = await loadData();
        if (!data || !data[regional]) {
            container.innerHTML = '<p style="color:#999;padding:20px;text-align:center;">Dados preditivos não disponíveis.</p>';
            return;
        }

        const regionalData = data[regional];
        const phase = regionalData.phase || 'quartas';

        _renderPhase(container, regional, regionalData, phase);
    }

    function _renderPhase(container, regional, regionalData, phase) {
        const topPlayers = getTopPlayers(regionalData, phase, 3);
        const topScorer = getTopScorer(regionalData);
        const champion = getPredictedChampion(regionalData);
        const finalists = getPredictedFinalists(regionalData);

        container.innerHTML = `
        <div style="
            background: white;
            border-radius: 14px;
            padding: 24px;
            box-shadow: 0 2px 16px rgba(0,0,0,.08);
            margin-bottom: 30px;
            border-top: 4px solid #009739;
        ">
            <!-- Cabeçalho -->
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <div style="
                    width:44px;height:44px;
                    background:linear-gradient(135deg,#009739,#005a1e);
                    border-radius:50%;
                    display:flex;align-items:center;justify-content:center;
                    font-size:20px;
                ">🔮</div>
                <div>
                    <h3 style="margin:0;font-size:18px;font-weight:900;color:#1a1a1a;">Análise Preditiva — ${regionalData.name}</h3>
                    <p style="margin:0;font-size:13px;color:#888;">Projeção por IA baseada em stats, forma e experiência</p>
                </div>
            </div>

            <!-- Seletor de Fase -->
            <div style="margin-bottom:6px;">
                <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:.5px;">Projetar para:</p>
                ${renderPhaseSelector(regional, phase)}
            </div>

            <!-- Título seção -->
            <div style="
                font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;
                color:#009739;margin-bottom:14px;padding-bottom:6px;border-bottom:1px solid #e9ecef;
            ">⭐ Melhores Jogadores — ${PHASE_CONFIG[phase].label}</div>

            <!-- Top Players -->
            <div id="predictor-players-${regional}">
                ${topPlayers.map((p, i) => renderTopPlayerCard(p, i + 1, phase)).join('')}
            </div>

            <!-- Previsões (Campeão + Artilheiro) lado a lado -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px;" class="predictions-grid">
                <div id="predictor-champion-${regional}">
                    ${renderChampionCard(champion, finalists, regional)}
                </div>
                <div id="predictor-scorer-${regional}">
                    ${renderTopScorerCard(topScorer)}
                </div>
            </div>

            <!-- Tabela completa (collapsible) -->
            <div style="margin-top:20px;">
                <button onclick="document.getElementById('full-table-${regional}').style.display = document.getElementById('full-table-${regional}').style.display === 'none' ? 'block' : 'none'" style="
                    background:#f8f9fa;
                    border:1px solid #ddd;
                    border-radius:8px;
                    padding:9px 18px;
                    font-size:13px;
                    font-weight:700;
                    cursor:pointer;
                    width:100%;
                    text-align:left;
                    color:#333;
                ">📊 Ver ranking completo de todos os jogadores ↕</button>
                <div id="full-table-${regional}" style="display:none;margin-top:12px;">
                    ${renderFullTable(regionalData, phase)}
                </div>
            </div>
        </div>

        <style>
            @media (max-width:600px) {
                .predictions-grid { grid-template-columns: 1fr !important; }
            }
        </style>`;
    }

    // Troca de fase (chamada pelo botão)
    async function switchPhase(regional, newPhase) {
        const data = await loadData();
        if (!data || !data[regional]) return;

        const container = document.getElementById(`predictor-${regional}`);
        if (!container) return;

        // Re-render inteiro com nova fase
        _renderPhase(container, regional, data[regional], newPhase);
    }

    return { renderPredictor, switchPhase };

})();

// Expõe globalmente para uso nas tabs
window.Predictor = Predictor;
