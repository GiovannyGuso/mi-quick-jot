
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('✅ SW registrado'))
      .catch(err => console.error('❌ SW falló:', err));
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const inputEl   = document.getElementById('noteText');
  const addBtn    = document.getElementById('addNote');
  const notesList = document.getElementById('notesList');

  // Carga notas de localStorage o array vacío
  let notes = JSON.parse(localStorage.getItem('quickJotNotes')) || [];

  // Renderiza notas: UNA tarjeta por cada elemento del array
  function renderNotes() {
    notesList.innerHTML = ''; // vacía el contenedor

    notes.forEach((text, idx) => {
      const cell = document.createElement('div');
      cell.className = 'mdl-cell mdl-cell--12-col';

      cell.innerHTML = `
        <div class="mdl-card mdl-shadow--2dp">
          <div class="mdl-card__supporting-text">${text}</div>
          <button class="mdl-button mdl-js-button mdl-button--icon">
            <i class="material-icons">delete</i>
          </button>
        </div>
      `;

      // Eliminar nota al pulsar el papelero
      const delBtn = cell.querySelector('button');
      delBtn.addEventListener('click', () => {
        notes.splice(idx, 1);
        saveAndRender();
      });

      notesList.appendChild(cell);
    });

    // Reaplica JS de MDL a los nuevos elementos
    if (window.componentHandler) componentHandler.upgradeDom();
  }

  // Guarda en localStorage y vuelve a dibujar
  function saveAndRender() {
    localStorage.setItem('quickJotNotes', JSON.stringify(notes));
    renderNotes();
  }

  // Añade nota nueva
  function addNote() {
    const text = inputEl.value.trim();
    if (!text) return;
    notes.push(text);
    inputEl.value = '';
    saveAndRender();
  }

  // Listeners
  addBtn.addEventListener('click', addNote);
  inputEl.addEventListener('keypress', e => {
    if (e.key === 'Enter') addNote();
  });

  // Primer render
  renderNotes();
});
