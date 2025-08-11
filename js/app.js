// ===== SW registro =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('✅ Service Worker registrado correctamente'))
      .catch(err => console.error('❌ SW error:', err));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'quickjot_notes_v2';

  const el = {
    input: document.getElementById('noteText'),
    add: document.getElementById('addNote'),
    list: document.getElementById('notesList'),
    empty: document.getElementById('emptyState'),
    count: document.getElementById('noteCount'),
    search: document.getElementById('searchInput'),
    snackbar: document.getElementById('snackbar'),
    fab: document.getElementById('fabAdd'),
    installBtn: document.getElementById('installBtn'),
  };

  // Migración simple si tenías formato antiguo (array de strings)
  let raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (raw.length && typeof raw[0] === 'string') {
    raw = raw.map(t => ({ text: t, createdAt: Date.now() }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
  }
  let notes = raw;

  // ===== Instalación PWA (botón del header) =====
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    el.installBtn.style.display = 'inline-flex';
  });
  el.installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    el.installBtn.style.display = 'none';
  });

  // ===== Utilidades =====
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  const showSnack = (msg) => {
    if (el.snackbar && el.snackbar.MaterialSnackbar) {
      el.snackbar.MaterialSnackbar.showSnackbar({ message: msg });
    } else {
      console.log('SNACK:', msg);
    }
  };
  const fmtDate = (ts) => new Date(ts).toLocaleString();

  // ===== Render =====
  function render(filter = '') {
    el.list.innerHTML = '';
    const lower = filter.trim().toLowerCase();
    const toRender = lower ? notes.filter(n => n.text.toLowerCase().includes(lower)) : notes;

    el.empty.style.display = toRender.length ? 'none' : 'block';
    el.count.textContent = String(notes.length);

    toRender.forEach((n, idx) => {
      const cell = document.createElement('div');
      cell.className = 'mdl-cell mdl-cell--12-col mdl-cell--4-col-desktop';
      cell.innerHTML = `
        <div class="note-card mdl-card mdl-shadow--3dp">
          <div class="mdl-card__title">${escapeHtml(firstLine(n.text))}</div>
          <div class="mdl-card__supporting-text"></div>
          <div class="mdl-card__actions mdl-card--border">
            <span class="note-date">${fmtDate(n.createdAt)}</span>
            <div>
              <button class="mdl-button mdl-js-button mdl-button--icon" title="Copiar">
                <i class="material-icons">content_copy</i>
              </button>
              <button class="mdl-button mdl-js-button mdl-button--icon" title="Eliminar">
                <i class="material-icons">delete</i>
              </button>
            </div>
          </div>
        </div>
      `;

      // Texto seguro (evita HTML)
      cell.querySelector('.mdl-card__supporting-text').innerText = n.text;

      const [copyBtn, delBtn] = cell.querySelectorAll('button');

      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(n.text);
          showSnack('Nota copiada');
        } catch { showSnack('No se pudo copiar'); }
      });

      delBtn.addEventListener('click', () => {
        const realIndex = notes.indexOf(n); // por si hay filtro
        notes.splice(realIndex, 1);
        save(); render(lower);
        showSnack('Nota eliminada');
      });

      el.list.appendChild(cell);
    });

    if (window.componentHandler) componentHandler.upgradeDom();
  }

  // Helpers
  function firstLine(t) {
    const s = (t || '').trim();
    const nl = s.indexOf('\n');
    return nl >= 0 ? s.slice(0, nl) : s || 'Nota';
  }
  function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));}

  // ===== Acciones =====
  function addNote() {
    const text = (el.input.value || '').trim();
    if (!text) return;
    notes.unshift({ text, createdAt: Date.now() });
    el.input.value = '';
    save(); render(el.search.value);
    showSnack('Nota añadida');
  }

  el.add.addEventListener('click', addNote);
  el.input.addEventListener('keypress', e => { if (e.key === 'Enter') addNote(); });
  el.fab.addEventListener('click', () => el.input.focus());
  el.search.addEventListener('input', e => render(e.target.value));

  render();
});
