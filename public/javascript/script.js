let currentModule = 1;
const totalModules = 9;

// Cambia el módulo activo
function switchModule(moduleIndex) {
    if (moduleIndex < 1 || moduleIndex > totalModules) return;

    // Ocultar actual
    const currentModuleEl = document.getElementById(`module-${currentModule}`);
    if (currentModuleEl) {
        currentModuleEl.classList.add('hidden');
    }
    
    // Desactivar pestaña
    const prevNav = document.getElementById(`nav-mod-${currentModule}`);
    if (prevNav) {
        prevNav.classList.remove('border-blue-800', 'bg-slate-100');
        prevNav.classList.add('border-transparent');
        const badge = prevNav.querySelector('span:first-child');
        if (badge) {
            badge.classList.replace('bg-blue-900', 'bg-slate-200');
            badge.classList.replace('text-white', 'text-slate-700');
        }
    }

    currentModule = moduleIndex;

    // Mostrar nuevo
    const newModuleEl = document.getElementById(`module-${currentModule}`);
    if (newModuleEl) {
        newModuleEl.classList.remove('hidden');
    }

    // Activar pestaña nueva
    const newNav = document.getElementById(`nav-mod-${currentModule}`);
    if (newNav) {
        newNav.classList.add('border-blue-800', 'bg-slate-100');
        newNav.classList.remove('border-transparent');
        const badge = newNav.querySelector('span:first-child');
        if (badge) {
            badge.classList.replace('bg-slate-200', 'bg-blue-900');
            badge.classList.replace('text-slate-700', 'text-white');
        }
    }

    // Actualizar botones de navegación
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const summaryBtn = document.getElementById('summaryBtn');

    if (currentModule === 1) {
        prevBtn.classList.add('invisible');
    } else {
        prevBtn.classList.remove('invisible');
    }

    if (currentModule === totalModules) {
        nextBtn.classList.add('hidden');
        summaryBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        summaryBtn.classList.add('hidden');
    }

    // Actualizar indicador de progreso
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateModule(direction) {
    switchModule(currentModule + direction);
}

function updateProgress() {
    const percentage = Math.round((currentModule / totalModules) * 100);
    const progressBar = document.getElementById('globalProgressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.innerText = `${currentModule} de ${totalModules}`;
}

// Extraer datos del formulario como Objeto
function getFormData() {
    const form = document.getElementById('caracterizacionForm');
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }
    return data;
}

// Guardar Borrador en LocalStorage
function saveDraft(evt) {
    const data = getFormData();
    localStorage.setItem('caracterizacion_borrador', JSON.stringify(data));
    
    // Mostrar Feedback
    const btn = evt ? evt.currentTarget : document.getElementById('saveDraftHeaderBtn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-check"></i> ¡Guardado!`;
    
    const originalBg = btn.classList.contains('bg-blue-700') ? 'bg-blue-700' : 'bg-slate-800';
    btn.classList.replace(originalBg, 'bg-emerald-600');
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.replace('bg-emerald-600', originalBg);
    }, 2000);
}

// Exportar a JSON
function exportJSONData() {
    const data = getFormData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `caracterizacion_sistema_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Cargar borrador previo si existe
function loadDraft() {
    const saved = localStorage.getItem('caracterizacion_borrador');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        const form = document.getElementById('caracterizacionForm');

        Object.keys(data).forEach(key => {
            const elements = form.querySelectorAll(`[name="${key}"]`);
            elements.forEach(el => {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    if (Array.isArray(data[key])) {
                        el.checked = data[key].includes(el.value);
                    } else {
                        el.checked = (el.value === data[key] || data[key] === "on");
                    }
                } else {
                    el.value = data[key];
                }
            });
        });
    } catch (e) {
        console.error("Error al cargar borrador", e);
    }
}

// Modal de Resumen
function openSummaryModal() {
    const data = getFormData();
    const container = document.getElementById('modalContent');
    
    let html = `<div class="space-y-4">`;

    const modulesTitle = [
        "I. Identificación Institucional",
        "II. Procesos Académicos y Control de Estudios",
        "III. Personal, Carga Docente y Presupuesto",
        "IV. Aplicaciones, Licenciamientos y SO",
        "V. Hospedaje y Redes",
        "VI. Bases de Datos y Calidad de Información",
        "VII. Interoperabilidad y GTU",
        "VIII. Seguridad, Continuidad y Auditoría",
        "IX. Preparación para Migración"
    ];

    modulesTitle.forEach((title, idx) => {
        const modPrefix = `m${idx+1}_`;
        const keys = Object.keys(data).filter(k => k.startsWith(modPrefix));
        
        html += `
            <div class="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h4 class="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1 mb-2">${title}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        `;

        if (keys.length === 0) {
            html += `<span class="text-slate-400 italic col-span-2">Sin campos registrados en este módulo.</span>`;
        } else {
            keys.forEach(k => {
                const label = k.replace(modPrefix, '').replace(/_/g, ' ');
                const val = Array.isArray(data[k]) ? data[k].join(', ') : data[k];
                html += `
                    <div>
                        <span class="font-semibold text-slate-600 capitalize">${label}:</span> 
                        <span class="text-slate-900">${val || 'N/R'}</span>
                    </div>
                `;
            });
        }

        html += `</div></div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
    document.getElementById('summaryModal').classList.remove('hidden');
}

function closeSummaryModal() {
    document.getElementById('summaryModal').classList.add('hidden');
}

// Inicialización
window.onload = function() {
    loadDraft();
    updateProgress();
};