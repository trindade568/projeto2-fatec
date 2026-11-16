// Quem Somos: renderiza os integrantes a partir da API

(async function quemSomosPage() {
  const grid = FZS.$('#teamGrid');

  try {
    const payload = await FZS.api('/api/equipe');
    grid.innerHTML = payload.equipe.map((m) => `
      <article class="card member-card">
        <div class="member-head">
          <img src="${FZS.escapeHtml(m.avatar)}" alt="Avatar de ${FZS.escapeHtml(m.nome)}" width="84" height="84">
          <div>
            <h3>${FZS.escapeHtml(m.nome)}</h3>
            <div class="member-role">${FZS.escapeHtml(m.funcao)}</div>
            <div class="ra">RA ${FZS.escapeHtml(m.ra)}</div>
          </div>
        </div>
        <p class="member-bio">${FZS.escapeHtml(m.bio)}</p>
        <div class="tech-chips">${m.tecnologias.map((t) => `<span class="tech-chip">${FZS.escapeHtml(t)}</span>`).join('')}</div>
        <ul>${m.contribuicoes.map((c) => `<li>${FZS.escapeHtml(c)}</li>`).join('')}</ul>
      </article>`).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Não foi possível carregar a equipe.<br><small>${FZS.escapeHtml(err.message)}</small></div>`;
  }
})();
