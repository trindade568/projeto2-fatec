// Listagem de cursos com busca em tempo real e filtro por período

(async function cursosPage() {
  const grid = FZS.$('#cursosGrid');
  const search = FZS.$('#busca');
  const chips = FZS.$$('.filter-btn[data-periodo]');
  const count = FZS.$('#resultCount');

  let cursos = [];
  let periodoAtivo = 'todos';

  function render() {
    const termo = (search.value || '').trim().toLowerCase();
    let lista = cursos.slice();

    if (periodoAtivo !== 'todos') {
      lista = lista.filter((c) => c.periodos.some((p) => p.nome.toLowerCase() === periodoAtivo));
    }
    if (termo) {
      lista = lista.filter((c) =>
        [c.nome, c.sigla, c.tagline, c.resumo, c.modalidade, c.duracao]
          .join(' ').toLowerCase().includes(termo)
      );
    }

    count.textContent = `${lista.length} ${lista.length === 1 ? 'curso encontrado' : 'cursos encontrados'}`;

    if (!lista.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">Nenhum curso corresponde à busca.<br><small>Tente outro termo ou limpe os filtros.</small></div>';
      return;
    }

    grid.innerHTML = lista.map((c) => FZSComponents.courseCard(c)).join('');
  }

  try {
    grid.innerHTML = Array.from({ length: 4 }, () => FZSComponents.skeletonCard()).join('');
    const payload = await FZS.api('/api/cursos');
    cursos = payload.cursos;
    render();
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Não foi possível carregar os cursos.<br><small>${FZS.escapeHtml(err.message)}</small></div>`;
    return;
  }

  search.addEventListener('input', FZS.debounce(render, 160));

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      periodoAtivo = chip.dataset.periodo;
      chips.forEach((c) => {
        c.classList.toggle('is-active', c === chip);
        c.setAttribute('aria-pressed', String(c === chip));
      });
      render();
    });
  });
})();
