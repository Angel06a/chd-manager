// ----------------------------------------------------
// MULTI-LANGUAGE SYSTEM & LINK BINDING
// ----------------------------------------------------
let currentLang = 'es';

function applySiteLinks() {
    if (typeof siteLinks === 'undefined') return;
    
    document.querySelectorAll('.link-download').forEach(el => el.href = siteLinks.download);
    document.querySelectorAll('.link-github').forEach(el => el.href = siteLinks.github);
    document.querySelectorAll('.link-gravatar').forEach(el => el.href = siteLinks.gravatar);
    document.querySelectorAll('.link-kofi').forEach(el => el.href = siteLinks.kofi);
}

function setLanguage(lang) {
    if (!translations[lang]) lang = 'es';
    currentLang = lang;
    
    const globalLangSelect = document.getElementById('global-lang-select');
    if (globalLangSelect) globalLangSelect.value = lang;

    // Cambiar el título de la pestaña del navegador dinámicamente
    if (translations[lang]['pageTitle']) {
        document.title = translations[lang]['pageTitle'];
    }

    // Traducir elementos con atributo data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Actualizar texto de la consola si está en estado inicial
    const consoleEl = document.getElementById('ui-console');
    if (consoleEl && (!isSimulating && consoleEl.value.includes("Cómo empezar") || consoleEl.value.includes("How to start"))) {
        consoleEl.value = translations[lang]['consoleInitialGuide'];
    }

    updateSystemDescription();
}

function initLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang ? browserLang.substring(0, 2) : 'es';
    
    currentLang = (translations[shortLang]) ? shortLang : 'es';
    setLanguage(currentLang);
}

// ----------------------------------------------------
// SYSTEM DESCRIPTION UPDATER
// ----------------------------------------------------
const systemDescriptions = {
    es: {
        generic_cd: "createdcd con los códecs por defecto. Válido para PlayStation 1, Sega Saturn, Sega CD, PC Engine CD y similares basados en .cue. Multidisco: usa Playlists .m3u al terminar.",
        ps2: "createdvd con los códecs por defecto. Válido para PlayStation 2 (PS2) e imágenes DVD ISO. Ideal para reducir archivos de hasta 4.7 GB.",
        dc: "createcd optimizado para imágenes GDI/BIN de SEGA Dreamcast. Compatible con Flycast y Redream.",
        psp: "createdvd u opcional optimizado para ISOs de PlayStation Portable."
    },
    en: {
        generic_cd: "createdcd with default codecs. Valid for PlayStation 1, Sega Saturn, Sega CD, PC Engine CD and similar .cue based games. Multi-disc: use .m3u playlists when finished.",
        ps2: "createdvd with default codecs. Valid for PlayStation 2 (PS2) and DVD ISO images. Ideal for reducing files up to 4.7 GB.",
        dc: "createcd optimized for SEGA Dreamcast GDI/BIN images. Compatible with Flycast and Redream.",
        psp: "createdvd or optional optimized for PlayStation Portable ISOs."
    }
};

function updateSystemDescription() {
    const select = document.getElementById('ui-system-select');
    const desc = document.getElementById('ui-system-desc');
    if (!select || !desc) return;
    
    const langDict = systemDescriptions[currentLang] || systemDescriptions['es'];
    desc.textContent = langDict[select.value] || langDict['generic_cd'];
}

// ----------------------------------------------------
// INTERACTIVE COMPRESSION SIMULATOR
// ----------------------------------------------------
let isSimulating = false;
let simInterval = null;

function startSimulatedCompression() {
    if (isSimulating) return;

    isSimulating = true;
    const consoleEl = document.getElementById('ui-console');
    const progress1 = document.getElementById('ui-progress-1');
    const progress2 = document.getElementById('ui-progress-2');
    const statusLabel = document.getElementById('ui-status-label');
    const btnCompress = document.getElementById('btn-compress');
    const btnCancel = document.getElementById('btn-cancel');

    if (!consoleEl) return;

    btnCompress.disabled = true;
    btnCancel.disabled = false;

    const folder = document.getElementById('ui-game-folder').value || "C:\\Programas\\CHD Manager";
    const systemName = document.getElementById('ui-system-select').options[document.getElementById('ui-system-select').selectedIndex].text;

    consoleEl.value = `[INICIO] Iniciando lote de compresión a CHD...\n`;
    consoleEl.value += `[CONFIG] Sistema seleccionado: ${systemName}\n`;
    consoleEl.value += `[CONFIG] Ruta origen: ${folder}\n`;
    consoleEl.value += `[INFO] Escaneando archivos en la carpeta...\n`;

    let step = 0;
    let p1 = 0;
    let p2 = 0;

    simInterval = setInterval(() => {
        step++;

        if (step === 3) {
            consoleEl.value += `[HALLAZGO] Encontrado: "Tekken 3 (USA).cue" (712 MB)\n`;
            consoleEl.value += `[HALLAZGO] Encontrado: "Crash Bandicoot (USA).cue" (480 MB)\n`;
            consoleEl.value += `[CHDMAN] Ejecutando: chdman.exe createcd -i "Tekken 3 (USA).cue" -o "Tekken 3 (USA).chd"\n`;
            statusLabel.textContent = "Procesando: Tekken 3 (USA).cue (1 de 2)";
        }

        if (step > 3 && step <= 25) {
            p1 = Math.min(100, (step - 3) * 4.5);
            p2 = Math.min(50, (step - 3) * 2.2);
            progress1.style.width = p1 + '%';
            progress2.style.width = p2 + '%';

            if (step % 5 === 0) {
                consoleEl.value += `[CHDMAN] Compresión en curso: ${Math.round(p1)}% completado...\n`;
                consoleEl.scrollTop = consoleEl.scrollHeight;
            }
        }

        if (step === 26) {
            consoleEl.value += `[ÉXITO] "Tekken 3 (USA).chd" creado. Ahorro: 39% (434 MB)\n`;
            consoleEl.value += `[CHDMAN] Ejecutando: chdman.exe createcd -i "Crash Bandicoot (USA).cue" -o "Crash Bandicoot (USA).chd"\n`;
            statusLabel.textContent = "Procesando: Crash Bandicoot (USA).cue (2 de 2)";
            progress1.style.width = '0%';
        }

        if (step > 26 && step <= 45) {
            p1 = Math.min(100, (step - 26) * 5.2);
            p2 = Math.min(100, 50 + (step - 26) * 2.6);
            progress1.style.width = p1 + '%';
            progress2.style.width = p2 + '%';

            if (step % 4 === 0) {
                consoleEl.value += `[CHDMAN] Compresión en curso: ${Math.round(p1)}% completado...\n`;
                consoleEl.scrollTop = consoleEl.scrollHeight;
            }
        }

        if (step >= 46) {
            clearInterval(simInterval);
            isSimulating = false;

            consoleEl.value += `[ÉXITO] "Crash Bandicoot (USA).chd" creado. Ahorro: 44% (268 MB)\n`;
            consoleEl.value += `[FIN] Tarea de compresión finalizada con éxito. Total procesados: 2.\n`;
            consoleEl.scrollTop = consoleEl.scrollHeight;

            statusLabel.textContent = "Listo. Operación completada.";
            progress1.style.width = '100%';
            progress2.style.width = '100%';

            btnCompress.disabled = false;
            btnCancel.disabled = true;

            if (document.getElementById('opt-sound').checked) {
                showToast('¡Proceso de compresión terminado con éxito!', 'success');
            }
        }

    }, 120);
}

function cancelSimulatedCompression() {
    if (simInterval) {
        clearInterval(simInterval);
    }
    isSimulating = false;
    document.getElementById('ui-status-label').textContent = "Operación cancelada por el usuario.";
    document.getElementById('ui-console').value += `\n[CANCELADO] Proceso detenido por el usuario.`;
    document.getElementById('btn-compress').disabled = false;
    document.getElementById('btn-cancel').disabled = true;
    showToast('Proceso cancelado', 'info');
}

// Mock Helper Actions for Buttons
function simFolderSelect() { showToast('Selección de carpeta simulada', 'info'); }
function simFileSelect() { showToast('Selección de archivos CUE/ISO simulada', 'info'); }
function simOutFolderSelect() { showToast('Selección de carpeta destino simulada', 'info'); }
function simOpenLogs() { showToast('Abriendo carpeta de registros...', 'info'); }
function simRecompress() { showToast('Función Recomprimir CHD lista', 'info'); }
function simExtract() { showToast('Función Extraer CHD a ISO/CUE lista', 'info'); }
function simVerify() { showToast('Iniciando verificación de CHD...', 'info'); }
function simM3u() { showToast('Generando listas de reproducción .m3u...', 'success'); }
function simInfo() { showToast('Leyendo cabecera de CHD...', 'info'); }
function simSelectChdman() { showToast('Selector ejecutable chdman.exe abierto', 'info'); }

// ----------------------------------------------------
// CALCULATOR LOGIC
// ----------------------------------------------------
function calculateSavings() {
    const systemSelect = document.getElementById('calc-system');
    if (!systemSelect) return;
    
    const ratio = parseFloat(systemSelect.options[systemSelect.selectedIndex].getAttribute('data-ratio'));
    const gbInput = parseFloat(document.getElementById('calc-gb').value) || 0;

    const chdGB = gbInput * ratio;
    const savedGB = gbInput - chdGB;
    const percent = Math.round((1 - ratio) * 100);

    document.getElementById('calc-orig-res').textContent = `${gbInput.toFixed(0)} GB`;
    document.getElementById('calc-chd-res').textContent = `${chdGB.toFixed(0)} GB`;
    document.getElementById('calc-saved-res').textContent = `${savedGB.toFixed(0)} GB (-${percent}%)`;
}

// ----------------------------------------------------
// TOAST NOTIFICATIONS
// ----------------------------------------------------
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-slate-900 text-white border-green-500' : 'bg-slate-900 text-white border-blue-500';
    const icon = type === 'success' ? 'fa-circle-check text-green-400' : 'fa-circle-info text-blue-400';

    toast.className = `pointer-events-auto flex items-center gap-2 px-3 py-2 rounded border-l-4 ${bgColor} shadow-lg text-xs font-sans transition-all duration-300 transform translate-y-2 opacity-0`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => { toast.classList.remove('translate-y-2', 'opacity-0'); }, 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => { if (container.contains(toast)) container.removeChild(toast); }, 300);
    }, 3000);
}

// Inicialización general
document.addEventListener('DOMContentLoaded', () => {
    applySiteLinks();
    initLanguage();
    calculateSavings();

    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
    }
});