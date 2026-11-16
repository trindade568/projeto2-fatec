// Eventos: calendário mensal interativo, filtros, favoritos (localStorage) e exportação .ics

(async function eventosPage() {
  const calGrid = FZS.$('#calGrid');
  const calLabel = FZS.$('#calLabel');
  const eventList = FZS.$('#eventList');
  const filterRow = FZS.$('#categoryFilters');
  const clearDay = FZS.$('#clearDayFilter');

  const FAV_KEY = 'fzs.eventos.favoritos';
  let eventos = [];
  let categorias = [];
  let categoriaAtiva = 'todos';
  let diaSelecionado = null;
  let mesReferencia = new Date();
  mesReferencia.setDate(1);

  const hojeISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const isoDay = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  function loadFavoritos() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
  }
  function saveFavoritos(list) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch { /* ignora */ }
  }

  function catById() {
    return Object.fromEntries(categorias.map((c) => [c.id, c]));
  }

  function renderCalendar() {
    const year = mesReferencia.getFullYear();
    const month = mesReferencia.getMonth();
    calLabel.textContent = mesReferencia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = hojeISO();
    const cat = catById();

    const dotsByDay = {};
    eventos.forEach((e) => {
      const d = new Date(e.inicio);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = isoDay(d);
        (dotsByDay[key] = dotsByDay[key] || []).push(e.categoria);
      }
    });

    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let html = weekdays.map((d) => `<div class="cal-weekday">${d}</div>`).join('');

    for (let i = 0; i < firstWeekday; i++) html += '<div></div>';

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cats = dotsByDay[iso] || [];
      const classes = ['cal-day'];
      if (cats.length) classes.push('has-events');
      if (iso === today) classes.push('is-today');
      if (iso === diaSelecionado) classes.push('is-selected');
      const dots = cats.slice(0, 4).map((c) => `<span class="cal-dot" style="background:${FZS.escapeHtml(cat[c] ? cat[c].cor : '#999')}"></span>`).join('');
      html += `<button class="${classes.join(' ')}" data-day="${iso}" ${cats.length ? '' : 'tabindex="-1" aria-disabled="true"'}>${day}<span class="cal-dots">${dots}</span></button>`;
    }

    calGrid.innerHTML = html;

    FZS.$$('.cal-day.has-events', calGrid).forEach((btn) => {
      btn.addEventListener('click', () => {
        diaSelecionado = diaSelecionado === btn.dataset.day ? null : btn.dataset.day;
        renderCalendar();
        renderList();
      });
    });
  }

  FZS.$('#calPrev').addEventListener('click', () => { mesReferencia.setMonth(mesReferencia.getMonth() - 1); diaSelecionado = null; renderCalendar(); renderList(); });
  FZS.$('#calNext').addEventListener('click', () => { mesReferencia.setMonth(mesReferencia.getMonth() + 1); diaSelecionado = null; renderCalendar(); renderList(); });
  FZS.$('#calToday').addEventListener('click', () => { mesReferencia = new Date(); mesReferencia.setDate(1); diaSelecionado = null; renderCalendar(); renderList(); });
  clearDay.addEventListener('click', () => { diaSelecionado = null; renderCalendar(); renderList(); });

  function renderList() {
    const cat = catById();
    let lista = eventos.slice();

    if (categoriaAtiva !== 'todos') lista = lista.filter((e) => e.categoria === categoriaAtiva);
    if (diaSelecionado) lista = lista.filter((e) => isoDay(new Date(e.inicio)) === diaSelecionado);

    clearDay.hidden = !diaSelecionado;

    if (!lista.length) {
      eventList.innerHTML = '<div class="empty-state">Nenhum evento neste recorte.<br><small>Limpe o filtro de dia ou escolha outra categoria.</small></div>';
      return;
    }

    const favoritos = loadFavoritos();

    eventList.innerHTML = lista.map((evento) => {
      const d = FZS.formatDayMonth(evento.inicio);
      const c = cat[evento.categoria];
      const isFav = favoritos.includes(evento.id);
      const sameDay = new Date(evento.inicio).toDateString() === new Date(evento.fim || evento.inicio).toDateString();
      const hora = new Date(evento.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `
        <article class="card event-card">
          <div class="event-date"><b>${d.day}</b><span>${d.month} · ${d.year}</span></div>
          <div>
            <span class="cat-chip" style="background:${FZS.escapeHtml(c ? c.cor : '#666')}">${FZS.escapeHtml(c ? c.nome : evento.categoria)}</span>
            ${evento.destaque ? '<span class="badge" style="margin-left:8px">Destaque</span>' : ''}
            <h3 style="margin-top:8px">${FZS.escapeHtml(evento.titulo)}</h3>
            <div class="event-meta">
              <span>${sameDay ? (hora !== '00:00' ? hora : 'Dia inteiro') : 'Vários dias'}</span>
              <span>${FZS.escapeHtml(evento.local)}</span>
            </div>
            <p class="event-desc">${FZS.escapeHtml(evento.descricao)}</p>
          </div>
          <div class="event-side">
            <button class="icon-btn fav-toggle ${isFav ? 'is-fav' : ''}" data-id="${FZS.escapeHtml(evento.id)}" aria-pressed="${isFav}" aria-label="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}" title="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17.5l-6.2 3.4 1.4-7L2.6 9.4l7.1-.8L12 2.5l2.3 6.1 7.1.8-4.6 4.5 1.4 7z"/></svg>
            </button>
            <button class="icon-btn ics-btn" data-id="${FZS.escapeHtml(evento.id)}" aria-label="Adicionar à agenda (.ics)" title="Adicionar à agenda (.ics)">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18M12 13v4M10 15h4"/></svg>
            </button>
          </div>
        </article>`;
    }).join('');

    FZS.$$('.fav-toggle', eventList).forEach((btn) => {
      btn.addEventListener('click', () => {
        const favoritos = loadFavoritos();
        const id = btn.dataset.id;
        const next = favoritos.includes(id) ? favoritos.filter((f) => f !== id) : [...favoritos, id];
        saveFavoritos(next);
        renderList();
        FZS.toast(next.includes(id) ? 'Evento salvo nos favoritos.' : 'Evento removido dos favoritos.', 'success');
      });
    });

    FZS.$$('.ics-btn', eventList).forEach((btn) => {
      btn.addEventListener('click', () => downloadIcs(btn.dataset.id));
    });
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function icsDate(date) {
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
  }

  function downloadIcs(id) {
    const evento = eventos.find((e) => e.id === id);
    if (!evento) return;
    const inicio = new Date(evento.inicio);
    const fim = new Date(evento.fim || evento.inicio);
    if (fim <= inicio) fim.setHours(inicio.getHours() + 1);

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fatec Zona Sul//Portal//PT-BR',
      'BEGIN:VEVENT',
      `UID:${evento.id}@fateczonasul.portal`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(inicio)}`,
      `DTEND:${icsDate(fim)}`,
      `SUMMARY:${evento.titulo.replace(/[,;]/g, '\\$&')}`,
      `LOCATION:${String(evento.local).replace(/[,;]/g, '\\$&')}`,
      `DESCRIPTION:${String(evento.descricao).replace(/[,;]/g, '\\$&').replace(/\n/g, ' ')}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${evento.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    FZS.toast('Evento exportado para sua agenda.', 'success');
  }

  try {
    const payload = await FZS.api('/api/eventos');
    eventos = payload.eventos;
    categorias = payload.categorias;

    filterRow.innerHTML = [
      '<button class="filter-btn is-active" data-categoria="todos" aria-pressed="true">Todos os eventos</button>',
      ...categorias.map((c) => `<button class="filter-btn" data-categoria="${FZS.escapeHtml(c.id)}" aria-pressed="false">${FZS.escapeHtml(c.nome)}</button>`)
    ].join('');

    FZS.$$('.filter-btn', filterRow).forEach((btn) => {
      btn.addEventListener('click', () => {
        categoriaAtiva = btn.dataset.categoria;
        FZS.$$('.filter-btn', filterRow).forEach((b) => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
        renderList();
      });
    });

    // Posiciona o calendário no mês do próximo evento futuro
    const agora = Date.now();
    const proximo = eventos.find((e) => new Date(e.fim || e.inicio).getTime() >= agora);
    if (proximo) {
      mesReferencia = new Date(proximo.inicio);
      mesReferencia.setDate(1);
    }

    renderCalendar();
    renderList();
  } catch (err) {
    eventList.innerHTML = `<div class="empty-state">Não foi possível carregar os eventos.<br><small>${FZS.escapeHtml(err.message)}</small></div>`;
  }
})();
