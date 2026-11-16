// Vestibular: cronograma renderizado da API + FAQ accordion

(async function vestibularPage() {
  const timeline = FZS.$('#timeline');
  const faq = FZS.$('#faqList');
  const steps = FZS.$('#stepsList');

  try {
    const payload = await FZS.api('/api/vestibular');
    const v = payload.vestibular;

    steps.innerHTML = v.orientacoes.map((o) => `
      <div class="step"><span class="step-num">Passo ${o.passo}</span><h3>${FZS.escapeHtml(o.titulo)}</h3><p>${FZS.escapeHtml(o.texto)}</p></div>`).join('');

    const hoje = Date.now();
    timeline.innerHTML = v.cronograma.map((item) => {
      const inicio = new Date(item.inicio);
      const fim = new Date(item.fim);
      const done = fim.getTime() < hoje;
      const mesmaData = inicio.toDateString() === fim.toDateString();
      const dataTxt = mesmaData
        ? FZS.formatDate(item.inicio, { day: '2-digit', month: 'short', year: 'numeric' })
        : `${FZS.formatDate(item.inicio, { day: '2-digit', month: 'short' })} — ${FZS.formatDate(item.fim, { day: '2-digit', month: 'short', year: 'numeric' })}`;
      return `
        <div class="tl-item ${done ? 'is-done' : ''} ${item.destaque ? 'destaque' : ''}">
          <div class="tl-card">
            <div class="tl-date">${FZS.escapeHtml(dataTxt)}<small>${done ? 'Concluído' : 'Próximo'}</small></div>
            <div>
              <h3>${FZS.escapeHtml(item.titulo)}</h3>
              <p>${FZS.escapeHtml(item.descricao)}</p>
            </div>
          </div>
        </div>`;
    }).join('');

    faq.innerHTML = v.faq.map((item, index) => `
      <details class="faq-item" ${index === 0 ? 'open' : ''}>
        <summary class="faq-q">${FZS.escapeHtml(item.pergunta)}<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></summary>
        <div class="faq-a">${FZS.escapeHtml(item.resposta)}</div>
      </details>`).join('');
  } catch (err) {
    timeline.innerHTML = `<div class="empty-state">Não foi possível carregar o cronograma.<br><small>${FZS.escapeHtml(err.message)}</small></div>`;
  }
})();
