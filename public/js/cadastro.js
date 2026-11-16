// Cadastro de interesse: formulário com validação client + server, comprovante com protocolo

(function cadastroPage() {
  const form = FZS.$('#interesseForm');
  const successBox = FZS.$('#cadastroSuccess');
  const formBox = FZS.$('#cadastroBox');
  const cursoSelect = FZS.$('#curso');
  const periodoSelect = FZS.$('#periodo');

  let cursosCache = [];

  const telefone = FZS.$('#telefone');
  telefone.addEventListener('input', () => {
    const digits = telefone.value.replace(/\D/g, '').slice(0, 11);
    let out = digits;
    if (digits.length > 2) out = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length > 7) out = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    telefone.value = out;
  });

  async function carregarCursos() {
    try {
      const payload = await FZS.api('/api/cursos');
      cursosCache = payload.cursos;
      cursoSelect.innerHTML = '<option value="" selected disabled>Selecione o curso…</option>' +
        cursosCache.map((c) => `<option value="${FZS.escapeHtml(c.slug)}">${FZS.escapeHtml(c.sigla)} — ${FZS.escapeHtml(c.nome)}</option>`).join('');
    } catch (err) {
      cursoSelect.innerHTML = '<option value="" selected disabled>Erro ao carregar cursos</option>';
      FZS.toast(err.message, 'error');
    }
  }

  cursoSelect.addEventListener('change', () => {
    const curso = cursosCache.find((c) => c.slug === cursoSelect.value);
    periodoSelect.innerHTML = '<option value="" selected disabled>Selecione o período…</option>' +
      (curso ? curso.periodos : []).map((p) => `<option value="${FZS.escapeHtml(p.nome)}">${FZS.escapeHtml(p.nome)} — ${p.vagas} vagas no vestibular</option>`).join('');
    periodoSelect.disabled = !curso;
  });

  carregarCursos();

  function setError(field, message) {
    const el = FZS.$(`[data-error-for="${field}"]`);
    if (el) el.textContent = message || '';
    const input = FZS.$(`#${field}`);
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function clearErrors() {
    ['nome', 'email', 'telefone', 'cidade', 'curso', 'periodo', 'aceite'].forEach((f) => setError(f, ''));
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();

    const data = {
      nome: FZS.$('#nome').value.trim(),
      email: FZS.$('#email').value.trim(),
      telefone: FZS.$('#telefone').value.replace(/\D/g, ''),
      cidade: FZS.$('#cidade').value.trim(),
      curso: cursoSelect.value,
      periodo: periodoSelect.value,
      comoConheceu: FZS.$('#comoConheceu').value,
      aceite: FZS.$('#aceite').checked
    };

    // Validação client-side (espelha a do servidor)
    const erros = {};
    if (data.nome.length < 3 || !data.nome.includes(' ')) erros.nome = 'Informe nome e sobrenome.';
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(data.email)) erros.email = 'Informe um e-mail válido.';
    if (data.telefone.length < 10) erros.telefone = 'Telefone com DDD.';
    if (data.cidade.length < 2) erros.cidade = 'Informe sua cidade.';
    if (!data.curso) erros.curso = 'Selecione um curso.';
    if (!data.periodo) erros.periodo = 'Selecione um período.';
    if (!data.aceite) erros.aceite = 'É necessário aceitar a LGPD.';

    if (Object.keys(erros).length) {
      Object.entries(erros).forEach(([field, message]) => setError(field, message));
      FZS.toast('Revise os campos destacados.', 'error');
      const first = FZS.$(`#${Object.keys(erros)[0]}`);
      if (first) first.focus();
      return;
    }

    const submit = FZS.$('#submitBtn');
    submit.disabled = true;
    submit.textContent = 'Enviando…';

    try {
      const payload = await FZS.api('/api/interesse', { method: 'POST', body: data });
      FZS.$('#protocolo').textContent = payload.protocolo;
      FZS.$('#receiptNome').textContent = payload.interesse.nome;
      FZS.$('#receiptCurso').textContent = `${payload.interesse.cursoNome} — ${payload.interesse.periodo}`;
      FZS.$('#receiptEmail').textContent = payload.interesse.email;
      FZS.$('#receiptData').textContent = new Date(payload.interesse.criadoEm).toLocaleString('pt-BR');
      formBox.hidden = true;
      successBox.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      FZS.toast('Cadastro recebido com sucesso!', 'success');
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        FZS.toast(err.details[0], 'error');
      } else {
        FZS.toast(err.message, 'error');
      }
      submit.disabled = false;
      submit.textContent = 'Enviar cadastro';
    }
  });

  FZS.$('#copyProtocolo').addEventListener('click', () => {
    FZS.copyText(FZS.$('#protocolo').textContent);
  });

  FZS.$('#printReceipt').addEventListener('click', () => window.print());
})();
