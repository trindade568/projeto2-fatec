// Núcleo compartilhado do frontend: API, toasts e utilitários

const FZS = (() => {
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  const state = {
    toastStack: null
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value) || 0);
  }

  function formatDate(iso, options = {}) {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...options
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  function formatDayMonth(iso) {
    try {
      const date = new Date(iso);
      return {
        day: new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(date),
        month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', ''),
        year: new Intl.DateTimeFormat('pt-BR', { year: 'numeric' }).format(date)
      };
    } catch {
      return { day: '--', month: '---', year: '----' };
    }
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function debounce(fn, wait = 180) {
    let timer;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  async function api(path, options = {}) {
    const config = {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    };
    if (options.body) config.body = JSON.stringify(options.body);

    let response;
    try {
      response = await fetch(path, config);
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Verifique se ele está ativo na porta 2000.');
    }

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok || !payload || payload.ok === false) {
      const message = (payload && (payload.erro || payload.mensagem)) || `Erro ${response.status} ao processar a requisição.`;
      const error = new Error(message);
      error.status = response.status;
      error.details = payload && payload.detalhes;
      throw error;
    }

    return payload;
  }

  function toast(message, type = 'info', timeout = 4600) {
    if (!state.toastStack) {
      state.toastStack = document.createElement('div');
      state.toastStack.className = 'toast-stack';
      state.toastStack.setAttribute('role', 'status');
      state.toastStack.setAttribute('aria-live', 'polite');
      document.body.appendChild(state.toastStack);
    }

    const icons = { success: '✓', error: '!', info: 'i' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || 'i'}</span><span>${escapeHtml(message)}</span>`;
    state.toastStack.appendChild(el);

    const remove = () => {
      el.classList.add('is-out');
      setTimeout(() => el.remove(), 300);
    };
    setTimeout(remove, timeout);
    el.addEventListener('click', remove);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('Copiado para a área de transferência.', 'success');
      return true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        toast('Copiado para a área de transferência.', 'success');
        return true;
      } catch {
        toast('Não foi possível copiar automaticamente.', 'error');
        return false;
      } finally {
        area.remove();
      }
    }
  }

  function initHeader() {
    const header = $('.site-header');
    const toggle = $('.nav-toggle');
    const page = document.body.dataset.page;

    if (page) {
      $$('.main-nav a').forEach((link) => {
        if (link.dataset.nav === page) link.classList.add('is-active');
      });
    }

    const onScroll = () => {
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = document.body.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(open));
      });

      $$('.main-nav a').forEach((link) => {
        link.addEventListener('click', () => {
          document.body.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('click', (event) => {
        if (!document.body.classList.contains('nav-open')) return;
        if (event.target.closest('.main-nav') || event.target.closest('.nav-toggle')) return;
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          document.body.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
          document.body.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }


  function initBackToTop() {
    const button = document.createElement('button');
    button.className = 'to-top';
    button.type = 'button';
    button.setAttribute('aria-label', 'Voltar ao topo');
    button.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(button);

    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const onScroll = () => button.classList.toggle('is-visible', window.scrollY > 640);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function init() {
    initHeader();
    initBackToTop();

    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    $,
    $$,
    escapeHtml,
    formatCurrency,
    formatDate,
    formatDayMonth,
    param,
    debounce,
    api,
    toast,
    copyText
  };
})();

window.FZS = FZS;
