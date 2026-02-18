/**
 * SISTEMA DE COMENTÁRIOS - REGIONAIS
 * Bola na Rede | localStorage-based, no backend needed
 */

const CommentsSystem = (() => {
    const STORAGE_KEY = 'bolanarede_comments_v2';

    // Comentários iniciais pré-populados para dar vida ao site
    const SEED_COMMENTS = {
        paulistao: [
            { id: 'pau1', user: 'SantistaMKT', text: 'Neymar vai levar o Santos ao bicampeonato! Ainda duvida? 🐟⚽', ts: Date.now() - 86400000 * 2, likes: 34 },
            { id: 'pau2', user: 'Coringao1910', text: 'Corinthians na final, basta ter fé! Fiel não abandona jamais. 🖤🤍', ts: Date.now() - 86400000 * 1.5, likes: 21 },
            { id: 'pau3', user: 'PorcaoBranca', text: 'Palmeiras é favorito absoluto, mas o Paulistão sempre surpreende. Abel sabe o que faz.', ts: Date.now() - 86400000, likes: 18 },
            { id: 'pau4', user: 'TricolorPaulista', text: 'São Paulo está voando! Calleri em forma, o Paulistão pode ser do Tricolor sim!', ts: Date.now() - 43200000, likes: 12 },
            { id: 'pau5', user: 'NovoBoldini', text: 'Novorizontino está surpreendendo muito. Pequeno clube, grande coração!', ts: Date.now() - 7200000, likes: 8 },
        ],
        carioca: [
            { id: 'car1', user: 'MengoNation', text: 'Flamengo vai varrer o Carioca mais uma vez. Elenco absurdo esse ano! 🔴⚫', ts: Date.now() - 86400000 * 2, likes: 47 },
            { id: 'car2', user: 'VascoDePaulo', text: 'Vasco renasceu! Payet fazendo a diferença, o Carioca pode ser nosso.', ts: Date.now() - 86400000, likes: 29 },
            { id: 'car3', user: 'TrompetaFlu', text: 'Fluminense com Germán Cano vai longe nesse Carioca. Marcão acredita!', ts: Date.now() - 18000000, likes: 14 },
            { id: 'car4', user: 'Fogão100fogo', text: 'Botafogo está de volta com força total. Manoel e Tiquinho brilhando!', ts: Date.now() - 3600000, likes: 9 },
        ],
        mineiro: [
            { id: 'min1', user: 'GalaoMineiro', text: 'Atlético-MG vai ser campeão mineiro de novo, pode escrever. Hulk é eterno! ⚫⚪', ts: Date.now() - 86400000 * 3, likes: 31 },
            { id: 'min2', user: 'CruzeiroCeleste', text: 'Cruzeiro está reconstruído e forte. O mineiro vai ser disputado até o fim.', ts: Date.now() - 86400000 * 1.2, likes: 22 },
            { id: 'min3', user: 'AmericaMinas', text: 'América-MG pode dar susto nos grandes sim! Nosso elenco está bem calibrado.', ts: Date.now() - 21600000, likes: 7 },
        ],
        gaucho: [
            { id: 'gau1', user: 'GremistaoRS', text: 'Grêmio na final do Gaúcho! Renato Gaúcho sabe como ganhar esse título. 💙🖤⬜', ts: Date.now() - 86400000 * 2, likes: 38 },
            { id: 'gau2', user: 'ColoradoVermelho', text: 'Internacional vem forte! Grenal na final vai ser épico. Força Inter! 🔴', ts: Date.now() - 86400000, likes: 35 },
            { id: 'gau3', user: 'GreNalForever', text: 'Grenal na final do Gaúcho seria lindo para o futebol. Que espetáculo seria esse!', ts: Date.now() - 7200000, likes: 19 },
        ],
        nordestao: [
            { id: 'nor1', user: 'FortalezaLeon', text: 'Fortaleza é o time do momento no Nordeste! Vojvoda fez um trabalho excepcional. 🦁', ts: Date.now() - 86400000 * 2, likes: 26 },
            { id: 'nor2', user: 'CearaAlvinegro', text: 'Ceará tem elenco para brigar pelo título do Nordestão. Vozão na veia! ⚫⬜', ts: Date.now() - 86400000, likes: 18 },
            { id: 'nor3', user: 'BahiaTricolor', text: 'Bahia subiu e quer mostrar força no Nordestão. Treze no campo, a gente corre atrás! 🔵🔴', ts: Date.now() - 10800000, likes: 11 },
        ],
        paranaense: [
            { id: 'par1', user: 'FuracaoFan', text: 'Athletico-PR é superior no Paranaense. Fábio Carille montou um time sólido! 🔴⚫', ts: Date.now() - 86400000 * 2, likes: 22 },
            { id: 'par2', user: 'CoritibaMais', text: 'Coritiba vai dar trabalho pro Furacão esse ano. Coxa-Branca resiste!', ts: Date.now() - 86400000, likes: 14 },
            { id: 'par3', user: 'ParanaClube', text: 'Não subestimem os demais times do Paranaense. O regional sempre surpreende!', ts: Date.now() - 5400000, likes: 6 },
        ],
        pernambucano: [
            { id: 'per1', user: 'SportRecife', text: 'Sport Recife merece mais atenção. O Pernambucano tem qualidade! 🔴⬛', ts: Date.now() - 86400000, likes: 15 },
            { id: 'per2', user: 'NauticoBrasil', text: 'Náutico vai brigar forte no Pernambucano. Gigante nordestino de volta!', ts: Date.now() - 43200000, likes: 9 },
        ],
    };

    function _load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        // Retorna cópia profunda dos seeds
        const initial = {};
        for (const [regional, comments] of Object.entries(SEED_COMMENTS)) {
            initial[regional] = comments.map(c => ({ ...c }));
        }
        return initial;
    }

    function _save(data) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
    }

    function _timeAgo(ts) {
        const diff = (Date.now() - ts) / 1000;
        if (diff < 60) return 'agora mesmo';
        if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
        return `${Math.floor(diff / 86400)}d atrás`;
    }

    function _generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    function addComment(regional, user, text) {
        const data = _load();
        if (!data[regional]) data[regional] = [];
        data[regional].unshift({
            id: _generateId(),
            user: user.trim() || 'Torcedor Anônimo',
            text: text.trim(),
            ts: Date.now(),
            likes: 0
        });
        _save(data);
        return data[regional];
    }

    function likeComment(regional, commentId) {
        const data = _load();
        if (!data[regional]) return;
        const comment = data[regional].find(c => c.id === commentId);
        if (comment) {
            // Verifica se já curtiu (usando sessionStorage)
            const likedKey = `liked_${commentId}`;
            if (sessionStorage.getItem(likedKey)) return false;
            comment.likes++;
            sessionStorage.setItem(likedKey, '1');
            _save(data);
            return true;
        }
        return false;
    }

    function render(regional, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = _load();
        const comments = (data[regional] || []).slice(0, 20);

        container.innerHTML = `
            <!-- Formulário de novo comentário -->
            <div class="comment-form-wrap" style="
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
                border: 1px solid #e9ecef;
            ">
                <h4 style="margin:0 0 14px 0; font-size:16px; color:#1a1a1a;">💬 Deixe sua opinião</h4>
                <input type="text" id="comment-user-${regional}" placeholder="Seu nome ou apelido..."
                    style="width:100%; padding:10px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; margin-bottom:10px; box-sizing:border-box;">
                <textarea id="comment-text-${regional}" placeholder="O que você acha do ${_regionalName(regional)}? Quem vai ser campeão?" rows="3"
                    style="width:100%; padding:10px 14px; border:1px solid #ddd; border-radius:8px; font-size:14px; resize:vertical; box-sizing:border-box;"></textarea>
                <button onclick="CommentsSystem.submit('${regional}')" style="
                    margin-top:10px;
                    background: #009739;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 8px;
                    font-size:14px;
                    font-weight:700;
                    cursor:pointer;
                ">⚽ Comentar</button>
            </div>

            <!-- Lista de comentários -->
            <div id="comments-list-${regional}">
                ${comments.length === 0
                    ? '<p style="color:#999;text-align:center;padding:20px;">Seja o primeiro a comentar!</p>'
                    : comments.map(c => _renderComment(regional, c)).join('')
                }
            </div>
        `;
    }

    function _renderComment(regional, c) {
        const likedKey = `liked_${c.id}`;
        const alreadyLiked = sessionStorage.getItem(likedKey);
        return `
            <div class="comment-item" id="comment-${c.id}" style="
                display: flex;
                gap: 12px;
                padding: 14px 0;
                border-bottom: 1px solid #f0f0f0;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #009739, #005a1e);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 16px;
                    flex-shrink: 0;
                ">${(c.user || 'A')[0].toUpperCase()}</div>
                <div style="flex: 1;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                        <strong style="font-size:14px; color:#1a1a1a;">${_escape(c.user)}</strong>
                        <span style="font-size:12px; color:#aaa;">${_timeAgo(c.ts)}</span>
                    </div>
                    <p style="font-size:14px; color:#333; margin:0 0 8px 0; line-height:1.5;">${_escape(c.text)}</p>
                    <button onclick="CommentsSystem.like('${regional}', '${c.id}', this)" style="
                        background: none;
                        border: 1px solid ${alreadyLiked ? '#009739' : '#ddd'};
                        border-radius: 20px;
                        padding: 4px 12px;
                        font-size:12px;
                        cursor: pointer;
                        color: ${alreadyLiked ? '#009739' : '#666'};
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                    ">👍 <span class="like-count">${c.likes}</span></button>
                </div>
            </div>
        `;
    }

    function submit(regional) {
        const userEl = document.getElementById(`comment-user-${regional}`);
        const textEl = document.getElementById(`comment-text-${regional}`);
        if (!userEl || !textEl) return;

        const user = userEl.value.trim();
        const text = textEl.value.trim();
        if (!text) { textEl.style.borderColor = '#e53935'; textEl.focus(); return; }

        textEl.style.borderColor = '#ddd';
        addComment(regional, user, text);
        userEl.value = '';
        textEl.value = '';

        // Re-renderiza apenas a lista
        const listEl = document.getElementById(`comments-list-${regional}`);
        if (listEl) {
            const data = _load();
            const comments = (data[regional] || []).slice(0, 20);
            listEl.innerHTML = comments.map(c => _renderComment(regional, c)).join('');
        }
    }

    function like(regional, commentId, btn) {
        const result = likeComment(regional, commentId);
        if (result) {
            const countEl = btn.querySelector('.like-count');
            if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
            btn.style.color = '#009739';
            btn.style.borderColor = '#009739';
        }
    }

    function _escape(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function _regionalName(regional) {
        const names = {
            paulistao: 'Paulistão', carioca: 'Carioca', mineiro: 'Campeonato Mineiro',
            gaucho: 'Gaúcho', nordestao: 'Nordestão', paranaense: 'Paranaense',
            pernambucano: 'Pernambucano'
        };
        return names[regional] || regional;
    }

    return { render, submit, like, addComment };
})();
