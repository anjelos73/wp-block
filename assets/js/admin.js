/**
 * WP Block — Admin Editor
 * Vanilla ES6 + SortableJS
 * Angelo Spanu 2026
 */

(function() {
    'use strict';

    // --------------------------------------------------------
    // Stato globale del layout
    // --------------------------------------------------------
    const state = {
        layout: [],          // Array di righe
        selectedElement: null, // { rowIndex, colIndex, elIndex }
        nextId: 1,
    };

    // --------------------------------------------------------
    // Riferimenti DOM
    // --------------------------------------------------------
    const canvas      = document.getElementById('wpb-canvas');
    const sidebar     = document.getElementById('wpb-sidebar-inner');
    const elemList    = document.getElementById('wpb-elements-list');
    const layoutInput = document.getElementById('wpb-layout-data');
    const previewDiv  = document.getElementById('wpb-shortcode-preview');
    const previewCode = document.getElementById('wpb-shortcode-output');

    if (!canvas) return; // Non siamo in una pagina con l'editor

    const postId = document.getElementById('wpb-app').dataset.postId;

    // --------------------------------------------------------
    // Carica stato iniziale da JSON salvato
    // --------------------------------------------------------
    function loadInitialState() {
        const raw = layoutInput.value;
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                state.layout = parsed;
                // Ricalcola nextId
                parsed.forEach(row => {
                    row.columns_data && row.columns_data.forEach(col => {
                        col.elements && col.elements.forEach(el => {
                            if (el.id && el.id >= state.nextId) state.nextId = el.id + 1;
                        });
                    });
                });
            }
        } catch(e) {
            console.warn('WPBlock: impossibile parsare layout salvato', e);
        }
    }

    // --------------------------------------------------------
    // Popola il pannello degli elementi
    // --------------------------------------------------------
    function renderElementsPanel() {
        if (!WPB || !WPB.elements) return;
        elemList.innerHTML = '';
        WPB.elements.forEach(el => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'wpb-element-btn';
            btn.dataset.type = el.type;
            btn.innerHTML = `<span class="dashicons ${el.icon || 'dashicons-admin-generic'}"></span> ${el.label}`;
            btn.addEventListener('click', () => addElementToSelected(el.type));
            elemList.appendChild(btn);
        });
    }

    // --------------------------------------------------------
    // Aggiunge una riga al layout
    // --------------------------------------------------------
    function addRow(cols = 1) {
        const row = {
            id: state.nextId++,
            columns: cols,
            columns_data: [],
        };
        for (let i = 0; i < cols; i++) {
            row.columns_data.push({ elements: [] });
        }
        state.layout.push(row);
        renderCanvas();
        saveLayout();
    }

    // --------------------------------------------------------
    // Aggiunge un elemento alla colonna/riga selezionata
    // (oppure alla prima colonna della prima riga)
    // --------------------------------------------------------
    function addElementToSelected(type) {
        let rowIdx = 0, colIdx = 0;

        if (state.selectedElement !== null) {
            rowIdx = state.selectedElement.rowIndex;
            colIdx = state.selectedElement.colIndex;
        } else if (state.layout.length === 0) {
            addRow(1);
            return; // addRow -> renderCanvas -> userinfo, poi l'utente clicca di nuovo
        }

        if (!state.layout[rowIdx]) return;
        if (!state.layout[rowIdx].columns_data[colIdx]) return;

        const elDef = WPB.elements.find(e => e.type === type);
        if (!elDef) return;

        // Crea attributi con default
        const attrs = {};
        (elDef.fields || []).forEach(f => {
            attrs[f.key] = f.default !== undefined ? f.default : '';
        });

        const newEl = {
            id:    state.nextId++,
            type:  type,
            label: elDef.label,
            attrs: attrs,
        };

        state.layout[rowIdx].columns_data[colIdx].elements.push(newEl);
        renderCanvas();
        saveLayout();

        // Seleziona automaticamente il nuovo elemento
        const elIndex = state.layout[rowIdx].columns_data[colIdx].elements.length - 1;
        selectElement(rowIdx, colIdx, elIndex);
    }

    // --------------------------------------------------------
    // Render dell'intero canvas
    // --------------------------------------------------------
    function renderCanvas() {
        canvas.innerHTML = '';

        state.layout.forEach((row, rowIdx) => {
            const rowWrap = createRowEl(row, rowIdx);
            canvas.appendChild(rowWrap);
        });

        // SortableJS sulle righe
        Sortable.create(canvas, {
            handle: '.wpb-row-header',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: (evt) => {
                const moved = state.layout.splice(evt.oldIndex, 1)[0];
                state.layout.splice(evt.newIndex, 0, moved);
                saveLayout();
            },
        });
    }

    // --------------------------------------------------------
    // Crea HTML di una singola riga
    // --------------------------------------------------------
    function createRowEl(row, rowIdx) {
        const wrap = document.createElement('div');
        wrap.className = 'wpb-row-wrap';
        wrap.dataset.rowId = row.id;

        // Header riga
        const header = document.createElement('div');
        header.className = 'wpb-row-header';
        header.innerHTML = `
            <span>&#9776; Riga ${rowIdx + 1}</span>
            <div class="wpb-row-controls">
                <select class="wpb-col-selector" title="Numero colonne">
                    <option value="1" ${row.columns === 1 ? 'selected' : ''}>1 col</option>
                    <option value="2" ${row.columns === 2 ? 'selected' : ''}>2 col</option>
                    <option value="3" ${row.columns === 3 ? 'selected' : ''}>3 col</option>
                    <option value="4" ${row.columns === 4 ? 'selected' : ''}>4 col</option>
                </select>
                <button type="button" class="wpb-btn wpb-btn-danger wpb-delete-row" title="Elimina riga">&times;</button>
            </div>
        `;

        // Cambio colonne
        header.querySelector('.wpb-col-selector').addEventListener('change', (e) => {
            const newCols = parseInt(e.target.value);
            const diff = newCols - row.columns_data.length;
            if (diff > 0) {
                for (let i = 0; i < diff; i++) row.columns_data.push({ elements: [] });
            } else if (diff < 0) {
                // Merge elementi delle colonne rimosse nell'ultima colonna rimasta
                for (let i = 0; i < Math.abs(diff); i++) {
                    const removed = row.columns_data.pop();
                    if (removed && removed.elements.length) {
                        row.columns_data[row.columns_data.length - 1].elements.push(...removed.elements);
                    }
                }
            }
            row.columns = newCols;
            renderCanvas();
            saveLayout();
        });

        // Elimina riga
        header.querySelector('.wpb-delete-row').addEventListener('click', () => {
            if (confirm('Eliminare questa riga e tutti i suoi elementi?')) {
                state.layout.splice(rowIdx, 1);
                state.selectedElement = null;
                renderSidebar(null);
                renderCanvas();
                saveLayout();
            }
        });

        wrap.appendChild(header);

        // Colonne
        const colsWrap = document.createElement('div');
        colsWrap.className = 'wpb-columns';

        row.columns_data.forEach((col, colIdx) => {
            const colEl = document.createElement('div');
            colEl.className = 'wpb-column';
            colEl.dataset.colIdx = colIdx;

            if (col.elements.length === 0) {
                const hint = document.createElement('div');
                hint.className = 'wpb-column-drop-hint';
                hint.textContent = 'Trascina un elemento qui o usate il pannello sotto';
                colEl.appendChild(hint);
            }

            col.elements.forEach((el, elIdx) => {
                const item = createElementItem(el, rowIdx, colIdx, elIdx);
                colEl.appendChild(item);
            });

            // SortableJS su ogni colonna
            Sortable.create(colEl, {
                group: 'elements',
                animation: 150,
                ghostClass: 'sortable-ghost',
                filter: '.wpb-column-drop-hint',
                onAdd: (evt) => {
                    // Elemento spostato da un'altra colonna
                    const srcRowIdx = parseInt(evt.from.closest('.wpb-row-wrap').dataset.rowId);
                    // trovare rowIdx reale dal rowId
                    const srcRow = state.layout.find(r => r.id === srcRowIdx);
                    const srcColIdx = parseInt(evt.from.dataset.colIdx);
                    const movedEl = srcRow.columns_data[srcColIdx].elements.splice(evt.oldIndex, 1)[0];
                    col.elements.splice(evt.newIndex, 0, movedEl);
                    renderCanvas();
                    saveLayout();
                },
                onUpdate: (evt) => {
                    const moved = col.elements.splice(evt.oldIndex, 1)[0];
                    col.elements.splice(evt.newIndex, 0, moved);
                    saveLayout();
                },
            });

            colsWrap.appendChild(colEl);
        });

        wrap.appendChild(colsWrap);
        return wrap;
    }

    // --------------------------------------------------------
    // Crea HTML di un elemento nel canvas
    // --------------------------------------------------------
    function createElementItem(el, rowIdx, colIdx, elIdx) {
        const item = document.createElement('div');
        item.className = 'wpb-element-item';

        const isSelected = (
            state.selectedElement &&
            state.selectedElement.rowIndex === rowIdx &&
            state.selectedElement.colIndex === colIdx &&
            state.selectedElement.elIndex === elIdx
        );
        if (isSelected) item.classList.add('wpb-selected');

        const elDef = WPB.elements.find(e => e.type === el.type) || {};
        item.innerHTML = `
            <div class="wpb-element-label">
                <span class="dashicons ${elDef.icon || 'dashicons-admin-generic'}"></span>
                <strong>${el.label || el.type}</strong>
            </div>
            <div class="wpb-element-actions">
                <button type="button" class="wpb-btn wpb-btn-danger wpb-delete-el" title="Elimina">&times;</button>
            </div>
        `;

        // Seleziona elemento
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('wpb-delete-el')) return;
            selectElement(rowIdx, colIdx, elIdx);
        });

        // Elimina elemento
        item.querySelector('.wpb-delete-el').addEventListener('click', () => {
            state.layout[rowIdx].columns_data[colIdx].elements.splice(elIdx, 1);
            if (
                state.selectedElement &&
                state.selectedElement.rowIndex === rowIdx &&
                state.selectedElement.colIndex === colIdx &&
                state.selectedElement.elIndex === elIdx
            ) {
                state.selectedElement = null;
                renderSidebar(null);
            }
            renderCanvas();
            saveLayout();
        });

        return item;
    }

    // --------------------------------------------------------
    // Selezione di un elemento -> aggiorna sidebar
    // --------------------------------------------------------
    function selectElement(rowIdx, colIdx, elIdx) {
        state.selectedElement = { rowIndex: rowIdx, colIndex: colIdx, elIndex: elIdx };
        const el = state.layout[rowIdx].columns_data[colIdx].elements[elIdx];
        renderSidebar(el, rowIdx, colIdx, elIdx);

        // Aggiorna classe selected nel DOM
        document.querySelectorAll('.wpb-element-item').forEach(i => i.classList.remove('wpb-selected'));
        // Re-render canvas per aggiornare selected (leggero)
        renderCanvas();
    }

    // --------------------------------------------------------
    // Render sidebar proprietà
    // --------------------------------------------------------
    function renderSidebar(el, rowIdx, colIdx, elIdx) {
        if (!el) {
            sidebar.innerHTML = '<p class="wpb-sidebar-placeholder">Seleziona un elemento per modificarne le proprietà.</p>';
            return;
        }

        const elDef = WPB.elements.find(e => e.type === el.type) || { fields: [] };

        let html = `<h3 class="wpb-sidebar-title">${el.label || el.type}</h3>`;

        (elDef.fields || []).forEach(field => {
            const val = el.attrs[field.key] !== undefined ? el.attrs[field.key] : (field.default || '');
            html += `<div class="wpb-field-group">`;
            html += `<label for="wpb-field-${field.key}">${field.label}</label>`;

            switch (field.type) {
                case 'textarea':
                    html += `<textarea id="wpb-field-${field.key}" data-key="${field.key}">${val}</textarea>`;
                    break;
                case 'number':
                    html += `<input type="number" id="wpb-field-${field.key}" data-key="${field.key}" value="${val}">`;
                    break;
                case 'color':
                    html += `<input type="color" id="wpb-field-${field.key}" data-key="${field.key}" value="${val}">`;
                    break;
                case 'select':
                    html += `<select id="wpb-field-${field.key}" data-key="${field.key}">`;
                    Object.entries(field.options || {}).forEach(([k, v]) => {
                        html += `<option value="${k}" ${val === k ? 'selected' : ''}>${v}</option>`;
                    });
                    html += `</select>`;
                    break;
                default: // text
                    html += `<input type="text" id="wpb-field-${field.key}" data-key="${field.key}" value="${val}">`;
            }
            html += `</div>`;
        });

        sidebar.innerHTML = html;

        // Event listener sui campi: live update
        sidebar.querySelectorAll('[data-key]').forEach(input => {
            input.addEventListener('input', () => {
                const key = input.dataset.key;
                state.layout[rowIdx].columns_data[colIdx].elements[elIdx].attrs[key] = input.value;
                saveLayout();
            });
        });
    }

    // --------------------------------------------------------
    // Salva il layout come JSON nel hidden input
    // --------------------------------------------------------
    function saveLayout() {
        layoutInput.value = JSON.stringify(state.layout);
        updateShortcodePreview();
    }

    // --------------------------------------------------------
    // Aggiorna anteprima shortcode
    // --------------------------------------------------------
    function updateShortcodePreview() {
        previewCode.textContent = `[wp_block_layout id="${postId}"]`;
    }

    // --------------------------------------------------------
    // Toggle anteprima shortcode
    // --------------------------------------------------------
    document.getElementById('wpb-preview-toggle').addEventListener('click', () => {
        const isVisible = previewDiv.style.display !== 'none';
        previewDiv.style.display = isVisible ? 'none' : 'block';
        updateShortcodePreview();
    });

    // --------------------------------------------------------
    // Toolbar: Aggiungi Riga
    // --------------------------------------------------------
    document.querySelector('.wpb-add-row').addEventListener('click', () => {
        addRow(1);
    });

    // --------------------------------------------------------
    // INIT
    // --------------------------------------------------------
    loadInitialState();
    renderElementsPanel();
    renderCanvas();
    updateShortcodePreview();

})();
