// Infraestrutura: mapa interativo do campus + detalhes dinâmicos

(async function infraPage() {
  const detailNome = FZS.$('#detalheNome');
  const detailCapacidade = FZS.$('#detalheCapacidade');
  const detailDesc = FZS.$('#detalheDesc');
  const detailDestaques = FZS.$('#detalheDestaques');
  const detailIcone = FZS.$('#detalheIcone');
  const rulesList = FZS.$('#rulesList');
  const zones = FZS.$$('.map-zone');

  let ambientes = [];

  function select(id) {
    const item = ambientes.find((a) => a.id === id);
    if (!item) return;

    zones.forEach((zone) => {
      const active = zone.dataset.id === id;
      zone.classList.toggle('is-active', active);
      zone.classList.toggle('is-dim', !active);
      zone.setAttribute('aria-pressed', String(active));
    });

    detailNome.textContent = item.nome;
    detailCapacidade.textContent = item.capacidade;
    detailDesc.textContent = item.descricao;
    detailIcone.innerHTML = FZSComponents.icon(item.icone, 34);
    detailDestaques.innerHTML = item.destaques.map((d) => `
      <li><span class="check" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>${FZS.escapeHtml(d)}</li>`).join('');
  }

  try {
    const payload = await FZS.api('/api/infraestrutura');
    const infra = payload.infraestrutura;
    ambientes = infra.ambientes;

    zones.forEach((zone) => {
      zone.addEventListener('click', () => select(zone.dataset.id));
      zone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select(zone.dataset.id);
        }
      });
    });

    rulesList.innerHTML = infra.regras.map((r) => `<li>${FZS.escapeHtml(r)}</li>`).join('');

    select('predio-2');
  } catch (err) {
    detailNome.textContent = 'Erro ao carregar dados';
    detailDesc.textContent = err.message;
  }
})();
