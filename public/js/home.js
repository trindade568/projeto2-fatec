// Página inicial: contadores, cursos em destaque, próximos eventos e contagem

(async function home() {
  const counters = FZS.$$('[data-counter]');
  if ('IntersectionObserver' in window && counters.length) {
    const animate = (el) => {
      const target = Number(el.dataset.counter || 0);
      const decimals = Number(el.dataset.decimals || 0);
      const duration = 1600;
      const start = performance.now();
      const frame = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const ease = 1 - Math.pow(2, -10 * progress);
        const value = target * (progress === 1 ? 1 : ease);
        el.textContent = decimals
          ? value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
          : Math.round(value).toLocaleString('pt-BR');
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => observer.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = Number(el.dataset.counter || 0).toLocaleString('pt-BR');
    });
  }

  const grid = FZS.$('#homeCourses');
  try {
    const payload = await FZS.api('/api/cursos');
    grid.innerHTML = payload.cursos.map((c) => FZSComponents.courseCard(c)).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Não foi possível carregar os cursos.<br><small>${FZS.escapeHtml(err.message)}</small></div>`;
  }

  const list = FZS.$('#homeEvents');
  try {
    const payload = await FZS.api('/api/eventos');
    const now = Date.now();
    const proximos = payload.eventos
      .filter((e) => new Date(e.fim || e.inicio).getTime() >= now)
      .slice(0, 3);
    const catById = Object.fromEntries(payload.categorias.map((c) => [c.id, c]));

    if (!proximos.length) {
      list.innerHTML = '<div class="empty-state">Nenhum evento futuro programado no momento.</div>';
    } else {
      list.innerHTML = proximos.map((evento) => {
        const d = FZS.formatDayMonth(evento.inicio);
        const cat = catById[evento.categoria];
        return `
          <article class="card event-card">
            <div class="event-date"><b>${d.day}</b><span>${d.month} · ${d.year}</span></div>
            <div>
              <span class="cat-chip" style="background:${FZS.escapeHtml(cat ? cat.cor : '#666')}">${FZS.escapeHtml(cat ? cat.nome : evento.categoria)}</span>
              <h3 style="margin-top:8px">${FZS.escapeHtml(evento.titulo)}</h3>
              <div class="event-meta"><span>${FZS.escapeHtml(evento.local)}</span></div>
            </div>
            <div class="event-side"><a class="link-arrow" href="eventos.html">Agenda completa →</a></div>
          </article>`;
      }).join('');
    }
  } catch (err) {
    list.innerHTML = `<div class="empty-state">Não foi possível carregar os eventos.<br><small>${FZS.escapeHtml(err.message)}</small></div>`;
  }
})();
