// Componentes reutilizáveis: cards de curso e ícones SVG

const FZSComponents = (() => {
  const ICONS = {
    terminal: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17l6-5-6-5M12 19h8"/></svg>',
    devices: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="13" height="10" rx="1.5"/><path d="M6 18h6M9 14v4"/><rect x="16.5" y="9" width="5.5" height="10" rx="1.4"/></svg>',
    chart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V4M4 20h16"/><path d="M9 16l4-5 4 3 4-7"/></svg>',
    truck: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6h12v11H2zM14 10h4.5L22 13.5V17h-8"/><circle cx="6.5" cy="17" r="1.6"/><circle cx="17.5" cy="17" r="1.6"/></svg>',
    building: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16M16 9h3a1 1 0 0 1 1 1v11"/><path d="M8 7h2M8 11h2M8 15h2"/></svg>',
    theater: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v6a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V5z"/><path d="M9 15v4M15 15v4M7 19h10"/></svg>',
    book: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>',
    monitor: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    car: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16l1.5-6A2 2 0 0 1 7.4 8.5h9.2a2 2 0 0 1 1.9 1.5l1.5 6"/><path d="M4 16h16v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3z"/><path d="M7.5 12h9"/></svg>',
    coffee: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2M7 6c.8-1 1.6-1 2.4 0M12 6c.8-1 1.6-1 2.4 0"/></svg>',
    access: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="1.6"/><path d="M12 9v5M8.5 21l3.5-7 3.5 7M6 11h12"/></svg>'
  };

  function icon(name, size) {
    const svg = ICONS[name] || ICONS.terminal;
    return size ? svg.replace('width="22" height="22"', `width="${size}" height="${size}"`) : svg;
  }

  function courseCard(curso) {
    const periodos = curso.periodos.map((p) => `${FZS.escapeHtml(p.nome)} (${p.vagas})`).join(' · ');
    return `
      <a class="course-card" style="--accent:${FZS.escapeHtml(curso.cor)}" href="curso.html?slug=${encodeURIComponent(curso.slug)}" aria-label="Ver detalhes do curso ${FZS.escapeHtml(curso.nome)}">
        <div class="course-body">
          <div class="course-sigla">
            <span class="sigla">${FZS.escapeHtml(curso.sigla)}</span>
            <span class="icon-badge" aria-hidden="true">${icon(curso.icone)}</span>
          </div>
          <h3>${FZS.escapeHtml(curso.nome)}</h3>
          <p>${FZS.escapeHtml(curso.tagline)}</p>
          <div class="course-foot">
            <span><strong>${periodos}</strong><br>vagas por turma</span>
            <span class="arrow">Ver curso →</span>
          </div>
        </div>
      </a>`;
  }

  function skeletonCard() {
    return '<div class="card" style="padding:20px"><div class="skeleton" style="height:26px;width:40%"></div><div class="skeleton" style="height:20px;width:85%;margin-top:14px"></div><div class="skeleton" style="height:16px;width:100%;margin-top:12px"></div><div class="skeleton" style="height:16px;width:70%;margin-top:6px"></div></div>';
  }

  return { icon, courseCard, skeletonCard, ICONS };
})();

window.FZSComponents = FZSComponents;
