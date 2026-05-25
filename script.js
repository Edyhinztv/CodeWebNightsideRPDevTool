// ============================================================
// 🔒 PROTECCIÓN DE CÓDIGO — NightSide RP DevTools
// Prohibida la copia, inspección y robo del código fuente.
// ============================================================

// ============================================================
// 🎮 DISCORD OAuth2 LOGIN — NightSide RP DevTools
// ============================================================
(function discordLogin() {

    // ════════════════════════════════════════════════
    //  ► CONFIGURACIÓN — edita solo estas 3 líneas ◄
    // ════════════════════════════════════════════════
    const CLIENT_ID   = '1507541241141788692';           // Tu Client ID del portal de Discord
    const REDIRECT_URI = 'https://nightsidedevtools.netlify.app';      // La URL donde está tu web (sin / al final)

    // IDs de Discord que tienen acceso (el ID real que Discord devuelve)
    const ALLOWED_IDS = [
        '1357141184631279656',
    ];
    // ════════════════════════════════════════════════

    const SESSION_KEY  = 'ns_discord_token';
    const overlay      = document.getElementById('login-overlay');
    const loginBtn     = document.getElementById('login-btn');
    const loadingDiv   = document.getElementById('login-loading');
    const errorMsg     = document.getElementById('login-error');

    // ── Paso 1: ¿Venimos de Discord con un token en la URL? ──
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const token  = params.get('access_token');

        if (token) {
            // Limpiar el token de la URL (por seguridad)
            history.replaceState(null, '', window.location.pathname);

            // Guardar temporalmente y verificar con la API de Discord
            sessionStorage.setItem(SESSION_KEY, token);
            showLoading();
            verifyWithDiscord(token);
            return;
        }
    }

    // ── Paso 2: ¿Ya tiene sesión válida guardada? ──
    const savedToken = sessionStorage.getItem(SESSION_KEY);
    if (savedToken) {
        showLoading();
        verifyWithDiscord(savedToken);
        return;
    }

    // ── Paso 3: Mostrar botón de login ──
    loginBtn.addEventListener('click', redirectToDiscord);

    // ─────────────────────────────────────────
    function redirectToDiscord() {
        const authUrl = new URL('https://discord.com/oauth2/authorize');
        authUrl.searchParams.set('client_id',     CLIENT_ID);
        authUrl.searchParams.set('redirect_uri',  REDIRECT_URI);
        authUrl.searchParams.set('response_type', 'token');       // Implicit flow — sin backend
        authUrl.searchParams.set('scope',         'identify');    // Solo necesitamos saber quién es
        window.location.href = authUrl.toString();
    }

    async function verifyWithDiscord(token) {
        try {
            const res  = await fetch('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Token inválido');

            const user = await res.json();
            const id   = user.id;

            if (ALLOWED_IDS.includes(id)) {
                // ✅ Acceso concedido
                loginBtn.style.display = 'none';
                loadingDiv.innerHTML = `
                    <div style="font-size:2rem;">✓</div>
                    <p style="margin-top:0.5rem; color:#22c55e; font-weight:700;">¡Bienvenido, ${user.username}!</p>
                `;
                setTimeout(() => overlay.classList.add('hidden'), 1000);
            } else {
                // ❌ ID no en la lista
                sessionStorage.removeItem(SESSION_KEY);
                hideLoading();
                showError(`Tu cuenta de Discord (${user.username}) no tiene acceso. Contacta al administrador.`);
            }

        } catch (e) {
            sessionStorage.removeItem(SESSION_KEY);
            hideLoading();
            showError('Error al verificar tu cuenta. Intenta de nuevo.');
        }
    }

    function showLoading() {
        loginBtn.style.display  = 'none';
        loadingDiv.style.display = 'block';
        errorMsg.textContent    = '';
    }

    function hideLoading() {
        loginBtn.style.display   = 'flex';
        loadingDiv.style.display = 'none';
    }

    function showError(msg) {
        errorMsg.textContent = msg;
    }
})();



(function applyProtection() {
    // 1. Deshabilitar clic derecho
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // 2. Deshabilitar selección de texto con mouse
    document.addEventListener('selectstart', (e) => {
        // Permitir selección solo dentro de textareas e inputs
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
        }
    });

    // 3. Bloquear atajos de teclado peligrosos
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;

        // Ctrl+U (ver fuente), Ctrl+S (guardar), Ctrl+Shift+I/J/C (DevTools)
        if (ctrl && (key === 'u' || key === 's')) {
            e.preventDefault();
            return;
        }

        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C — DevTools
        if (ctrl && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
            e.preventDefault();
            return;
        }

        // F12 — DevTools
        if (e.key === 'F12') {
            e.preventDefault();
            return;
        }

        // Ctrl+A solo bloqueado fuera de inputs/textareas
        if (ctrl && key === 'a') {
            if (document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
            }
            return;
        }

        // Ctrl+C solo bloqueado fuera de inputs/textareas
        if (ctrl && key === 'c') {
            if (document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
            }
        }
    });

})();

document.addEventListener('DOMContentLoaded', () => {
    // Tab Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // --- SVG Generator Tool ---
    const container = document.getElementById('svgContainer');
    const addBtn = document.getElementById('addSvgBtn');
    const copyBtn = document.getElementById('copyBtn');
    const baseWidthInput = document.getElementById('baseWidth');
    const baseHeightInput = document.getElementById('baseHeight');
    const luaCodeOutput = document.getElementById('luaCode');

    let svgCounter = 0;

    function createSvgCard() {
        svgCounter++;
        const id = svgCounter;
        const card = document.createElement('div');
        card.className = 'card glass svg-item';
        card.dataset.id = id;

        card.innerHTML = `
            <div class="svg-card-header">
                <h3>Componente SVG #${id}</h3>
                <button class="btn-danger remove-btn" aria-label="Eliminar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <div class="input-group" style="margin-bottom: 1rem;">
                <label>Nombre (Variable)</label>
                <input type="text" class="svg-name" placeholder="ej. logo, fondo" value="svg_${id}">
            </div>
            <div class="input-row" style="margin-bottom: 0.5rem;">
                <div class="input-group">
                    <label>Posición X</label>
                    <input type="number" class="svg-pos-x" value="0" placeholder="ej. 100">
                </div>
                <div class="input-group">
                    <label>Posición Y</label>
                    <input type="number" class="svg-pos-y" value="0" placeholder="ej. 200">
                </div>
            </div>
            <div class="input-group" style="margin-bottom: 0.5rem;">
                <label>Código SVG</label>
                <textarea class="svg-code" placeholder="Pega tu código <svg>...</svg> aquí..."></textarea>
            </div>
            <div class="texts-section" style="margin-bottom: 0.5rem;">
                <div class="texts-section-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <label style="font-size:0.875rem; color:var(--text-secondary); font-weight:500;">Textos (dxDrawText manual)</label>
                    <button class="btn-add-text" type="button" style="background:var(--secondary-color); border:1px solid var(--card-border); color:var(--text-primary); border-radius:6px; padding:0.25rem 0.75rem; font-size:0.8rem; cursor:pointer;">+ Añadir</button>
                </div>
                <div class="text-entries"></div>
            </div>
            <p class="subtitle" style="margin-bottom: 0;">Posición X/Y y textos manuales desde Figma.</p>
        `;

        const removeBtn = card.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
            card.remove();
            generateCode();
        });

        const staticInputs = card.querySelectorAll('.svg-name, .svg-pos-x, .svg-pos-y, .svg-code');
        staticInputs.forEach(input => {
            input.addEventListener('input', generateCode);
        });

        const addTextBtn = card.querySelector('.btn-add-text');
        const textEntries = card.querySelector('.text-entries');
        addTextBtn.addEventListener('click', () => {
            addTextEntry(textEntries);
            generateCode();
        });

        container.appendChild(card);
        generateCode();
    }

    function addTextEntry(container, values) {
        const entry = document.createElement('div');
        entry.className = 'text-entry';
        entry.innerHTML = ' \
            <div class="input-row" style="margin-bottom:0.25rem;"> \
                <div class="input-group" style="flex:0.5; min-width:44px;"> \
                    <label style="font-size:0.7rem;">X</label> \
                    <input type="number" class="text-x" value="' + (values?.x || 0) + '" style="padding:0.4rem 0.5rem; font-size:0.8rem;"> \
                </div> \
                <div class="input-group" style="flex:0.5; min-width:44px;"> \
                    <label style="font-size:0.7rem;">Y</label> \
                    <input type="number" class="text-y" value="' + (values?.y || 0) + '" style="padding:0.4rem 0.5rem; font-size:0.8rem;"> \
                </div> \
                <div class="input-group" style="flex:0.6; min-width:44px;"> \
                    <label style="font-size:0.7rem;">Ancho</label> \
                    <input type="number" class="text-w" value="' + (values?.w || 0) + '" style="padding:0.4rem 0.5rem; font-size:0.8rem;"> \
                </div> \
                <div class="input-group" style="flex:0.6; min-width:44px;"> \
                    <label style="font-size:0.7rem;">Alto</label> \
                    <input type="number" class="text-h" value="' + (values?.h || 0) + '" style="padding:0.4rem 0.5rem; font-size:0.8rem;"> \
                </div> \
                <div style="align-self:flex-end;"> \
                    <button class="btn-remove-text" type="button" style="background:transparent; border:1px solid rgba(239,68,68,0.3); color:var(--danger); border-radius:6px; padding:0.4rem 0.5rem; font-size:0.9rem; cursor:pointer; line-height:1;">\u2715</button> \
                </div> \
            </div> \
            <div class="input-row" style="margin-bottom:0.25rem;"> \
                <div class="input-group" style="flex:0.5; min-width:44px;"> \
                    <label style="font-size:0.7rem;">Tama\u00f1o</label> \
                    <input type="number" class="text-size" value="' + (values?.size || 24) + '" style="padding:0.4rem 0.5rem; font-size:0.8rem;"> \
                </div> \
                <div class="input-group" style="flex:0.7; min-width:65px;"> \
                    <label style="font-size:0.7rem;">Color</label> \
                    <input type="text" class="text-color" value="' + (values?.color || '#ffffff') + '" style="padding:0.4rem 0.5rem; font-size:0.8rem;"> \
                </div> \
                <div style="flex:1;"></div> \
            </div> \
            <div class="input-group" style="margin-bottom:0.35rem;"> \
                <input type="text" class="text-content" placeholder="Texto a mostrar" value="' + (values?.content || '') + '" style="padding:0.4rem 0.5rem; font-size:0.8rem;"> \
            </div> \
        ';

        entry.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', generateCode);
        });

        entry.querySelector('.btn-remove-text').addEventListener('click', () => {
            entry.remove();
            generateCode();
        });

        container.appendChild(entry);
    }

    function extractDimensions(svgString) {
        let result = { w: 100, h: 100, x: 0, y: 0 };
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgString, "image/svg+xml");
            const svgEl = doc.querySelector('svg');
            if(svgEl) {
                const w = svgEl.getAttribute('width');
                const h = svgEl.getAttribute('height');
                const x = svgEl.getAttribute('x');
                const y = svgEl.getAttribute('y');
                
                if(w && !isNaN(parseFloat(w))) result.w = parseFloat(w);
                if(h && !isNaN(parseFloat(h))) result.h = parseFloat(h);
                if(x && !isNaN(parseFloat(x))) result.x = parseFloat(x);
                if(y && !isNaN(parseFloat(y))) result.y = parseFloat(y);
                
                // If no width/height but has viewBox
                if((!w || !h) && svgEl.getAttribute('viewBox')) {
                    const vb = svgEl.getAttribute('viewBox').split(/[ ,]+/);
                    if(vb.length >= 4) {
                        result.w = parseFloat(vb[2]);
                        result.h = parseFloat(vb[3]);
                    }
                }
            }
        } catch(e) {
            console.error("Failed to parse SVG", e);
        }
        return result;
    }

    function escapeLuaString(str) {
        return str.replace(/\]\]/g, ']].."]]"..[[');
    }

    function htmlEscape(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }

    function extractTextElements(svgString) {
        const texts = [];
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgString, "image/svg+xml");
            doc.querySelectorAll('text').forEach(el => {
                texts.push({
                    x: parseFloat(el.getAttribute('x')) || 0,
                    y: parseFloat(el.getAttribute('y')) || 0,
                    fontSize: parseFloat(el.getAttribute('font-size')) || 14,
                    fill: el.getAttribute('fill') || '#ffffff',
                    fontFamily: el.getAttribute('font-family') || 'default',
                    textAnchor: el.getAttribute('text-anchor') || 'start',
                    fontWeight: el.getAttribute('font-weight') || 'normal',
                    content: el.textContent || ''
                });
            });
        } catch(e) {
            console.error("Failed to parse SVG texts", e);
        }
        return texts;
    }

    function removeTextElementsFromSvg(svgString) {
        return svgString.replace(/<text[^>]*>[\s\S]*?<\/text>/gi, '');
    }

    function parseColor(colorStr) {
        if (!colorStr || colorStr === 'none') return { r: 255, g: 255, b: 255, a: 255 };
        if (colorStr.startsWith('#')) {
            let hex = colorStr.substring(1);
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            return {
                r: parseInt(hex.substring(0, 2), 16) || 255,
                g: parseInt(hex.substring(2, 4), 16) || 255,
                b: parseInt(hex.substring(4, 6), 16) || 255,
                a: 255
            };
        }
        const named = {
            white: { r: 255, g: 255, b: 255 }, black: { r: 0, g: 0, b: 0 },
            red: { r: 255, g: 0, b: 0 }, green: { r: 0, g: 255, b: 0 },
            blue: { r: 0, g: 0, b: 255 }, yellow: { r: 255, g: 255, b: 0 },
            cyan: { r: 0, g: 255, b: 255 }, magenta: { r: 255, g: 0, b: 255 },
            gray: { r: 128, g: 128, b: 128 }, grey: { r: 128, g: 128, b: 128 }
        };
        if (named[colorStr.toLowerCase()]) return { ...named[colorStr.toLowerCase()], a: 255 };
        const rgb = colorStr.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3], a: 255 };
        return { r: 255, g: 255, b: 255, a: 255 };
    }

    function textAnchorToAlign(anchor) {
        if (anchor === 'middle') return 'center';
        if (anchor === 'end') return 'right';
        return 'left';
    }

    function svgFontToMta(fontFamily, fontWeight) {
        const isBold = fontWeight === 'bold' || parseInt(fontWeight) >= 700;
        const lower = (fontFamily || 'default').toLowerCase();
        if (isBold) return 'default-bold';
        if (lower.includes('mono')) return 'default';
        return 'default';
    }

    function generateCode() {
        const baseW = baseWidthInput.value || 1920;
        const baseH = baseHeightInput.value || 1080;
        const items = container.querySelectorAll('.svg-item');

        if(items.length === 0) {
            luaCodeOutput.innerHTML = '<span class="comment">-- Añade tus SVGs para ver el código generado</span>';
            return;
        }

        let code = `<span class="comment">-- Tamaños responsivos basados en resolución de Figma</span>\n`;
        code += `<span class="keyword">local</span> screenW, screenH = <span class="function">guiGetScreenSize</span>()\n`;
        code += `<span class="keyword">local</span> baseX, baseY = <span class="number">${baseW}</span>, <span class="number">${baseH}</span>\n`;
        code += `<span class="keyword">local</span> resW, resH = screenW/baseX, screenH/baseY\n\n`;

        code += `<span class="comment">-- Tabla para almacenar texturas SVG</span>\n`;
        code += `<span class="keyword">local</span> svgs = {}\n\n`;

        // SVG creation (text elements stripped from texture)
        code += `<span class="function">addEventHandler</span>(<span class="string">"onClientResourceStart"</span>, resourceRoot,\n`;
        code += `    <span class="keyword">function</span>()\n`;

        items.forEach(item => {
            let name = item.querySelector('.svg-name').value.replace(/[^a-zA-Z0-9_]/g, '_') || 'unnamed';
            const rawSvg = item.querySelector('.svg-code').value.trim() || '<svg></svg>';
            const dim = extractDimensions(rawSvg);

            const svgNoText = removeTextElementsFromSvg(rawSvg);
            const cleanSvg = escapeLuaString(svgNoText);

            code += `        <span class="comment">-- Crear ${name}</span>\n`;
            code += `        <span class="keyword">local</span> raw_${name} = <span class="string">[[</span>\n${htmlEscape(cleanSvg)}\n<span class="string">]]</span>\n`;
            code += `        svgs.${name} = <span class="function">svgCreate</span>(${dim.w} * resW, ${dim.h} * resH, raw_${name})\n\n`;
        });

        code += `    <span class="keyword">end</span>\n)\n\n`;

        // Render loop
        code += `<span class="function">addEventHandler</span>(<span class="string">"onClientRender"</span>, root,\n`;
        code += `    <span class="keyword">function</span>()\n`;

        items.forEach(item => {
            let name = item.querySelector('.svg-name').value.replace(/[^a-zA-Z0-9_]/g, '_') || 'unnamed';
            const rawSvg = item.querySelector('.svg-code').value.trim() || '<svg></svg>';
            const dim = extractDimensions(rawSvg);
            const posX = parseFloat(item.querySelector('.svg-pos-x').value) || 0;
            const posY = parseFloat(item.querySelector('.svg-pos-y').value) || 0;
            const textElements = extractTextElements(rawSvg);

            code += `        <span class="keyword">if</span> svgs.${name} <span class="keyword">then</span>\n`;
            code += `            <span class="function">dxDrawImage</span>(${posX} * resW, ${posY} * resH, ${dim.w} * resW, ${dim.h} * resH, svgs.${name}, <span class="number">0</span>, <span class="number">0</span>, <span class="number">0</span>, <span class="function">tocolor</span>(<span class="number">255</span>, <span class="number">255</span>, <span class="number">255</span>, <span class="number">255</span>), <span class="keyword">false</span>)\n`;

            textElements.forEach(text => {
                const color = parseColor(text.fill);
                const mtaFont = svgFontToMta(text.fontFamily, text.fontWeight);
                const align = textAnchorToAlign(text.textAnchor);
                const scale = (text.fontSize / 12).toFixed(2);
                const txt = htmlEscape(escapeLuaString(text.content));
                const l = (posX + text.x).toFixed(1);
                const t = (posY + text.y - text.fontSize).toFixed(1);
                const r = (posX + text.x + text.content.length * text.fontSize * 0.6).toFixed(1);
                const b = (posY + text.y).toFixed(1);

                code += `            <span class="function">dxDrawText</span>(<span class="string">[[${txt}]]</span>, <span class="number">${l}</span> * resW, <span class="number">${t}</span> * resH, <span class="number">${r}</span> * resW, <span class="number">${b}</span> * resH, <span class="function">tocolor</span>(${color.r}, ${color.g}, ${color.b}, ${color.a}), <span class="number">${scale}</span> * resH, <span class="string">"${mtaFont}"</span>, <span class="string">"${align}"</span>, <span class="string">"top"</span>, <span class="keyword">false</span>, <span class="keyword">false</span>, <span class="keyword">false</span>)\n`;
            });

            const manualTexts = item.querySelectorAll('.text-entry');
            manualTexts.forEach(entry => {
                const content = entry.querySelector('.text-content').value.trim();
                if (!content) return;
                const tx = parseFloat(entry.querySelector('.text-x').value) || 0;
                const ty = parseFloat(entry.querySelector('.text-y').value) || 0;
                const tw = parseFloat(entry.querySelector('.text-w').value) || 0;
                const th = parseFloat(entry.querySelector('.text-h').value) || 0;
                const fontSize = parseFloat(entry.querySelector('.text-size').value) || 14;
                const color = parseColor(entry.querySelector('.text-color').value);
                const scale = (fontSize / 12).toFixed(2);
                const txt = htmlEscape(escapeLuaString(content));
                const l = (posX + tx).toFixed(1);
                const t = (posY + ty).toFixed(1);
                const r = tw ? (posX + tx + tw).toFixed(1) : (posX + tx + content.length * fontSize * 0.6).toFixed(1);
                const b = th ? (posY + ty + th).toFixed(1) : (posY + ty + fontSize).toFixed(1);

                code += `            <span class="function">dxDrawText</span>(<span class="string">[[${txt}]]</span>, <span class="number">${l}</span> * resW, <span class="number">${t}</span> * resH, <span class="number">${r}</span> * resW, <span class="number">${b}</span> * resH, <span class="function">tocolor</span>(${color.r}, ${color.g}, ${color.b}, ${color.a}), <span class="number">${scale}</span> * resH, <span class="string">"default"</span>, <span class="string">"left"</span>, <span class="string">"top"</span>, <span class="keyword">false</span>, <span class="keyword">false</span>, <span class="keyword">false</span>)\n`;
            });

            code += `        <span class="keyword">end</span>\n`;
        });

        code += `    <span class="keyword">end</span>\n)\n`;

        luaCodeOutput.innerHTML = code;
    }

    addBtn.addEventListener('click', createSvgCard);
    baseWidthInput.addEventListener('input', generateCode);
    baseHeightInput.addEventListener('input', generateCode);

    copyBtn.addEventListener('click', () => {
        const textToCopy = luaCodeOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "¡Copiado!";
            setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
        });
    });

    // Initialize with one card
    createSvgCard();

    // --- Comment Remover Tool ---
    const rawCodeInput = document.getElementById('rawCodeInput');
    const cleanCodeOutput = document.getElementById('cleanCodeOutput');
    const removeCommentsBtn = document.getElementById('removeCommentsBtn');
    const copyCleanCodeBtn = document.getElementById('copyCleanCodeBtn');

    function removeComments() {
        let code = rawCodeInput.value;
        
        // This regex matches strings (to ignore them) OR various comment styles.
        // It supports JS/C++ (//, /* */), Lua (-- , --[[ ]]), HTML (<!-- -->)
        const pattern = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|--\[\[[\s\S]*?\]\]|--.*|\/\*[\s\S]*?\*\/|\/\/.*|<!--[\s\S]*?-->/g;
        
        let cleaned = code.replace(pattern, (match, stringMatch) => {
            if (stringMatch) {
                return stringMatch; // It's a string, keep it intact
            }
            return ''; // It's a comment, remove it
        });

        // Optional: Remove empty lines left by comment deletion
        cleaned = cleaned.replace(/^\s*[\r\n]/gm, '');

        cleanCodeOutput.textContent = cleaned;
    }

    removeCommentsBtn.addEventListener('click', removeComments);

    copyCleanCodeBtn.addEventListener('click', () => {
        const textToCopy = cleanCodeOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHTML = copyCleanCodeBtn.innerHTML;
            copyCleanCodeBtn.innerHTML = "¡Copiado!";
            setTimeout(() => { copyCleanCodeBtn.innerHTML = originalHTML; }, 2000);
        });
    });

    // --- Debug Remover Tool ---
    const rawDebugCodeInput = document.getElementById('rawDebugCodeInput');
    const cleanDebugOutput = document.getElementById('cleanDebugOutput');
    const removeDebugBtn = document.getElementById('removeDebugBtn');
    const copyCleanDebugBtn = document.getElementById('copyCleanDebugBtn');

    function removeDebugPrints() {
        let code = rawDebugCodeInput.value;
        const targets = ["outputChatBox", "outputDebugString"];
        
        targets.forEach(target => {
            let index = 0;
            while ((index = code.indexOf(target, index)) !== -1) {
                // Check if it's part of another word (e.g. my_outputChatBox)
                const prevChar = code[index - 1];
                if (prevChar && /[a-zA-Z0-9_]/.test(prevChar)) {
                    index += target.length;
                    continue;
                }

                let openParen = code.indexOf('(', index);
                // Make sure there are only spaces between the function name and '('
                if (openParen !== -1 && code.substring(index + target.length, openParen).trim() === '') {
                    let depth = 0;
                    let closeParen = -1;
                    let inString = false;
                    let stringChar = '';
                    
                    for (let i = openParen; i < code.length; i++) {
                        const c = code[i];
                        const prev = code[i-1];
                        
                        if (!inString) {
                            if (c === '"' || c === "'") {
                                inString = true;
                                stringChar = c;
                            } else if (c === '[' && code[i+1] === '[') {
                                inString = true;
                                stringChar = '[[';
                            } else if (c === '(') {
                                depth++;
                            } else if (c === ')') {
                                depth--;
                                if (depth === 0) {
                                    closeParen = i;
                                    break;
                                }
                            }
                        } else {
                            if (c === stringChar && prev !== '\\' && stringChar !== '[[') {
                                inString = false;
                            } else if (stringChar === '[[' && c === ']' && code[i+1] === ']') {
                                inString = false;
                                i++; // skip second bracket
                            }
                        }
                    }
                    
                    if (closeParen !== -1) {
                        let endRemove = closeParen + 1;
                        while (code[endRemove] === ' ' || code[endRemove] === '\t' || code[endRemove] === ';') {
                            endRemove++;
                        }
                        
                        let startRemove = index;
                        let onlySpacesBefore = true;
                        let i = index - 1;
                        while (i >= 0 && code[i] !== '\n') {
                            if (code[i] !== ' ' && code[i] !== '\t') {
                                onlySpacesBefore = false;
                                break;
                            }
                            i--;
                        }
                        
                        if (onlySpacesBefore) {
                            startRemove = i + 1; // start from right after newline
                            if (code[endRemove] === '\r') endRemove++;
                            if (code[endRemove] === '\n') endRemove++;
                        }
                        
                        code = code.substring(0, startRemove) + code.substring(endRemove);
                        continue; // Do not advance index, string shrank
                    }
                }
                index += target.length;
            }
        });
        
        cleanDebugOutput.textContent = code;
    }

    removeDebugBtn.addEventListener('click', removeDebugPrints);

    copyCleanDebugBtn.addEventListener('click', () => {
        const textToCopy = cleanDebugOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHTML = copyCleanDebugBtn.innerHTML;
            copyCleanDebugBtn.innerHTML = "¡Copiado!";
            setTimeout(() => { copyCleanDebugBtn.innerHTML = originalHTML; }, 2000);
        });
    });

    // --- Formatter Tool ---
    const rawFormatInput = document.getElementById('rawFormatInput');
    const formatOutput = document.getElementById('formatOutput');
    const formatBtn = document.getElementById('formatBtn');
    const copyFormatBtn = document.getElementById('copyFormatBtn');

    function formatLuaCode() {
        let code = rawFormatInput.value;
        let lines = code.split(/\r?\n/);
        let indentLevel = 0;
        const indentString = "    "; // 4 spaces
        let formatted = [];
        
        let inMultiline = false;
        
        for (let i = 0; i < lines.length; i++) {
            let originalLine = lines[i];
            let line = originalLine.trim();
            
            if (!line && !inMultiline) { 
                formatted.push(""); 
                continue; 
            }
            
            // Handle being inside a multi-line string or comment
            if (inMultiline) {
                // IMPORTANT: We push the original line without trimming to avoid breaking strings
                formatted.push(originalLine); 
                if (line.includes("]]")) inMultiline = false;
                continue;
            }
            
            let codeOnly = line.replace(/--.*$/g, ''); 
            codeOnly = codeOnly.replace(/"(?:\\.|[^"\\])*"/g, '""'); 
            codeOnly = codeOnly.replace(/'(?:\\.|[^'\\])*'/g, "''"); 
            
            // Check if a multi-line string opens here and doesn't close
            let openBrackets = (codeOnly.match(/\[\[/g) || []).length;
            let closeBrackets = (codeOnly.match(/\]\]/g) || []).length;
            
            if (line.includes("--[[") && !line.includes("]]")) {
                inMultiline = true;
            } else if (openBrackets > closeBrackets) {
                inMultiline = true;
            }

            codeOnly = codeOnly.replace(/\[\[.*?\]\]/g, ''); 
            
            let opens = 0;
            let closes = 0;
            
            const words = codeOnly.match(/[a-zA-Z_]+/g) || [];
            words.forEach(w => {
                if (['if', 'function', 'while', 'for', 'repeat'].includes(w)) opens++;
                if (['end', 'until'].includes(w)) closes++;
                if (['else', 'elseif'].includes(w)) { closes++; opens++; } 
            });
            
            const symbols = codeOnly.match(/[\{\}\(\)]/g) || [];
            symbols.forEach(s => {
                if (s === '{' || s === '(') opens++;
                if (s === '}' || s === ')') closes++;
            });
            
            let outdentCurrent = 0;
            if (/^\s*(end|until|else|elseif|\}|\))/.test(codeOnly)) {
                outdentCurrent = 1;
            }
            
            let printIndent = Math.max(0, indentLevel - outdentCurrent);
            formatted.push(indentString.repeat(printIndent) + line);
            
            indentLevel += (opens - closes);
            indentLevel = Math.max(0, indentLevel);
        }
        
        formatOutput.textContent = formatted.join("\n");
    }

    formatBtn.addEventListener('click', formatLuaCode);

    copyFormatBtn.addEventListener('click', () => {
        const textToCopy = formatOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHTML = copyFormatBtn.innerHTML;
            copyFormatBtn.innerHTML = "¡Copiado!";
            setTimeout(() => { copyFormatBtn.innerHTML = originalHTML; }, 2000);
        });
    });

    // --- Fondo interactivo optimizado (sin lag) ---
    const orb1 = document.getElementById('bg-orb-1');
    const orb2 = document.getElementById('bg-orb-2');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let rafPending = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(() => {
                // Orbe 1 sigue al cursor (centrado en el cursor)
                orb1.style.transform = `translate(${mouseX - 300}px, ${mouseY - 300}px)`;
                // Orbe 2 va en dirección opuesta
                orb2.style.transform = `translate(${window.innerWidth - mouseX - 300}px, ${window.innerHeight - mouseY - 300}px)`;
                rafPending = false;
            });
        }
    });

    // --- Custom Spinners ---
    document.querySelectorAll('.custom-number-wrapper').forEach(wrapper => {
        const input = wrapper.querySelector('input[type="number"]');
        const upBtn = wrapper.querySelector('.spin-up');
        const downBtn = wrapper.querySelector('.spin-down');

        if(upBtn && downBtn && input) {
            upBtn.addEventListener('click', () => {
                input.stepUp();
                if(typeof generateCode === 'function') generateCode();
            });

            downBtn.addEventListener('click', () => {
                input.stepDown();
                if(typeof generateCode === 'function') generateCode();
            });
        }
    });
});
