// Detalhe do curso (curso.html?slug=...)

(async function cursoPage() {
  const root = FZS.$('#cursoRoot');
  const slug = FZS.param('slug');

  if (!slug) {
    root.innerHTML = '<div class="empty-state">Nenhum curso informado. <a class="link-arrow" href="cursos.html">Ver os 4 cursos →</a></div>';
    return;
  }

  try {
    const payload = await FZS.api(`/api/cursos/${encodeURIComponent(slug)}`);
    const c = payload.curso;

    document.title = `${c.nome} — Fatec Zona Sul`;
    FZS.$('#crumbName').textContent = c.nome;

    FZS.$('#cursoHero').style.setProperty('--accent', c.cor);
    FZS.$('#cursoSigla').textContent = c.sigla;
    FZS.$('#cursoSigla').style.color = c.cor;
    FZS.$('#cursoIcon').innerHTML = FZSComponents.icon(c.icone, 30);
    FZS.$('#cursoIcon').style.color = c.cor;
    FZS.$('#cursoNome').textContent = c.nome;
    FZS.$('#cursoTagline').textContent = c.tagline;
    FZS.$('#cursoDescricao').textContent = c.descricao;

    FZS.$('#cursoMeta').innerHTML = [
      `<span class="chip">${c.duracao}</span>`,
      `<span class="chip">${FZS.escapeHtml(c.modalidade)}</span>`,
      `<span class="chip">Grau: ${FZS.escapeHtml(c.grau)}</span>`,
      `<span class="chip">${c.vagasVestibularTotal} vagas no vestibular</span>`
    ].join('');

    FZS.$('#cursoPeriodos').innerHTML = c.periodos.map((p) => `
      <li class="checklist" style="display:flex; gap:12px; align-items:center; list-style:none; padding:10px 14px; background:var(--card); border:1px solid var(--line); border-radius:12px">
        <strong style="font-family:var(--font-mono); color:var(--brand); min-width:64px">${FZS.escapeHtml(p.nome)}</strong>
        <span class="muted">${p.vagas} vagas · vestibular</span>
      </li>`).join('');

    FZS.$('#cursoAprende').innerHTML = c.oQueVoceAprende.map((item) => `
      <li><span class="check" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>${FZS.escapeHtml(item)}</li>`).join('');

    FZS.$('#cursoDisciplinas').innerHTML = c.disciplinasDestaque.map((d) => `<li class="tech-chip" style="list-style:none">${FZS.escapeHtml(d)}</li>`).join('');

    FZS.$('#cursoAreas').innerHTML = c.areasAtuacao.map((a) => `
      <li><span class="check" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>${FZS.escapeHtml(a)}</li>`).join('');

    FZS.$('#coordNome').textContent = c.coordenacao.nome;
    FZS.$('#coordEmail').textContent = c.coordenacao.email;
    FZS.$('#coordEmail').href = `mailto:${c.coordenacao.email}`;
    FZS.$('#linkOficial').href = c.linkOficial;

    const obsBlock = FZS.$('#cursoObs');
    if (c.observacoes && c.observacoes.length) {
      obsBlock.innerHTML = c.observacoes.map((o) => `<li>${FZS.escapeHtml(o)}</li>`).join('');
      obsBlock.parentElement.hidden = false;
    } else {
      obsBlock.parentElement.hidden = true;
    }

    const relacionados = FZS.$('#relacionados');
    relacionados.innerHTML = payload.relacionados.map((r) => `
      <a class="course-card" style="--accent:${FZS.escapeHtml(r.cor)}" href="curso.html?slug=${encodeURIComponent(r.slug)}">
        <div class="course-body">
          <div class="course-sigla"><span class="sigla">${FZS.escapeHtml(r.sigla)}</span><span class="icon-badge" aria-hidden="true">${FZSComponents.icon(r.icone)}</span></div>
          <h3>${FZS.escapeHtml(r.nome)}</h3>
          <div class="course-foot"><span class="arrow">Ver curso →</span></div>
        </div>
      </a>`).join('');

    FZS.$('#cursoContent').hidden = false;
    FZS.$('#cursoSkeleton').hidden = true;
  } catch (err) {
    FZS.$('#cursoSkeleton').hidden = true;
    root.innerHTML = `<div class="empty-state">${FZS.escapeHtml(err.message)}<br><a class="link-arrow" href="cursos.html">Voltar para a lista de cursos →</a></div>`;
  }
})();
