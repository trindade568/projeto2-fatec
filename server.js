const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const PORT = 2000;
const HOST = '0.0.0.0';
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const INTERESSE_FILE = path.join(DATA_DIR, 'interesse.json');
const MAX_BODY = 1024 * 128;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.ics': 'text/calendar; charset=utf-8'
};

function log(req, status, extra = '') {
  const stamp = new Date().toISOString();
  console.log(`[${stamp}] ${req.method} ${req.url} -> ${status}${extra ? ' ' + extra : ''}`);
}

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function error(res, status, message, details) {
  json(res, status, { ok: false, erro: message, detalhes: details || null });
}

async function readJsonFile(file) {
  const raw = await fsp.readFile(file, 'utf8');
  return JSON.parse(raw);
}

async function loadData(name) {
  return readJsonFile(path.join(DATA_DIR, `${name}.json`));
}

function sanitizeText(value, max = 160) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value) && value.length <= 120;
}

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

let storeQueue = Promise.resolve();

function enqueue(task) {
  const run = storeQueue.then(task, task);
  storeQueue = run.catch(() => {});
  return run;
}

async function ensureStore() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  try {
    await fsp.access(INTERESSE_FILE);
  } catch {
    await fsp.writeFile(INTERESSE_FILE, '[]\n', 'utf8');
  }
}

async function readInteresse() {
  try {
    const list = await readJsonFile(INTERESSE_FILE);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function writeInteresse(list) {
  const tmp = `${INTERESSE_FILE}.${process.pid}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(list, null, 2) + '\n', 'utf8');
  await fsp.rename(tmp, INTERESSE_FILE);
}

function publicInteresse(item) {
  return {
    protocolo: item.protocolo,
    nome: item.nome,
    email: item.email,
    cidade: item.cidade,
    cursoSlug: item.cursoSlug,
    cursoNome: item.cursoNome,
    periodo: item.periodo,
    comoConheceu: item.comoConheceu,
    status: item.status,
    criadoEm: item.criadoEm
  };
}

async function apiFatec(res) {
  const [fatec, cursos, eventos, interesse] = await Promise.all([
    loadData('fatec'),
    loadData('cursos'),
    loadData('eventos'),
    readInteresse()
  ]);
  const agora = Date.now();
  const proximos = eventos.eventos
    .filter((e) => new Date(e.fim || e.inicio).getTime() >= agora)
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
  json(res, 200, {
    ok: true,
    fatec,
    resumo: {
      cursos: cursos.length,
      vagasVestibular: fatec.numeros.vagasVestibular,
      eventosFuturos: proximos.length,
      interessados: interesse.length
    }
  });
}

async function apiCursos(res) {
  const cursos = await loadData('cursos');
  const lista = cursos.map((c) => ({
    slug: c.slug,
    nome: c.nome,
    sigla: c.sigla,
    grau: c.grau,
    duracao: c.duracao,
    modalidade: c.modalidade,
    periodos: c.periodos,
    vagasVestibularTotal: c.vagasVestibularTotal,
    cor: c.cor,
    icone: c.icone,
    tagline: c.tagline,
    resumo: c.resumo
  }));
  json(res, 200, { ok: true, cursos: lista });
}

async function apiCurso(res, slug) {
  const cursos = await loadData('cursos');
  const curso = cursos.find((c) => c.slug === slug);
  if (!curso) return error(res, 404, 'Curso não encontrado.');
  const relacionados = cursos
    .filter((c) => c.slug !== slug)
    .map((c) => ({ slug: c.slug, nome: c.nome, sigla: c.sigla, cor: c.cor, icone: c.icone, tagline: c.tagline }));
  json(res, 200, { ok: true, curso, relacionados });
}

async function apiEventos(res, url) {
  const data = await loadData('eventos');
  const categoria = sanitizeText(url.searchParams.get('categoria') || '', 30);
  const mes = sanitizeText(url.searchParams.get('mes') || '', 7);

  let eventos = data.eventos.slice();
  if (categoria) eventos = eventos.filter((e) => e.categoria === categoria);
  if (/^\d{4}-\d{2}$/.test(mes)) {
    eventos = eventos.filter((e) => String(e.inicio).startsWith(mes) || String(e.fim || e.inicio).startsWith(mes));
  }
  eventos.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

  json(res, 200, {
    ok: true,
    categorias: data.categorias,
    eventos
  });
}

async function apiInfraestrutura(res) {
  const infra = await loadData('infraestrutura');
  json(res, 200, { ok: true, infraestrutura: infra });
}

async function apiEquipe(res) {
  const equipe = await loadData('equipe');
  json(res, 200, { ok: true, equipe });
}

async function apiVestibular(res) {
  const vestibular = await loadData('vestibular');
  json(res, 200, { ok: true, vestibular });
}

async function apiInteressePorProtocolo(res, protocolo) {
  const cadastros = await readInteresse();
  const item = cadastros.find((i) => i.protocolo.toUpperCase() === protocolo.toUpperCase());
  if (!item) return error(res, 404, 'Nenhum cadastro encontrado para este protocolo.');
  json(res, 200, { ok: true, interesse: publicInteresse(item) });
}

async function apiCriarInteresse(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return error(res, 400, err.message);
  }

  const nome = sanitizeText(body.nome, 100);
  const email = sanitizeText(body.email, 120).toLowerCase();
  const telefone = digitsOnly(body.telefone).slice(0, 13);
  const cidade = sanitizeText(body.cidade, 90);
  const cursoSlug = sanitizeText(body.curso, 40);
  const periodo = sanitizeText(body.periodo, 20);
  const comoConheceu = sanitizeText(body.comoConheceu, 60) || 'Não informado';
  const aceite = body.aceite === true;

  const erros = [];
  if (nome.length < 3 || !nome.includes(' ')) erros.push('Informe o nome completo (nome e sobrenome).');
  if (!isValidEmail(email)) erros.push('Informe um e-mail válido.');
  if (telefone.length < 10) erros.push('Informe um telefone com DDD válido.');
  if (cidade.length < 2) erros.push('Informe a cidade onde você mora.');
  if (!aceite) erros.push('É necessário aceitar a política de privacidade (LGPD).');
  if (erros.length) return error(res, 422, 'Revise os dados informados.', erros);

  const result = await enqueue(async () => {
    const cursos = await loadData('cursos');
    const curso = cursos.find((c) => c.slug === cursoSlug);
    if (!curso) return { status: 422, erro: 'Selecione um curso válido da FATEC Zona Sul.' };

    const periodoValido = curso.periodos.some((p) => p.nome.toLowerCase() === periodo.toLowerCase());
    if (!periodoValido) return { status: 422, erro: 'Selecione um período válido para o curso escolhido.' };

    const cadastros = await readInteresse();
    if (cadastros.some((i) => i.email === email && i.status !== 'cancelado')) {
      return { status: 409, erro: 'Este e-mail já possui um cadastro de interesse.' };
    }

    const protocolo = `FZS27-${crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 7)}`;
    const interesse = {
      protocolo,
      nome,
      email,
      telefone,
      cidade,
      cursoSlug: curso.slug,
      cursoNome: curso.nome,
      periodo: curso.periodos.find((p) => p.nome.toLowerCase() === periodo.toLowerCase()).nome,
      comoConheceu,
      status: 'ativo',
      criadoEm: new Date().toISOString()
    };

    cadastros.push(interesse);
    await writeInteresse(cadastros);
    return { status: 201, interesse };
  });

  if (result.erro) return error(res, result.status, result.erro);
  log(req, 201, `protocolo=${result.interesse.protocolo}`);
  json(res, 201, {
    ok: true,
    mensagem: 'Cadastro recebido com sucesso!',
    protocolo: result.interesse.protocolo,
    interesse: publicInteresse(result.interesse)
  });
}

async function apiHealth(res) {
  json(res, 200, {
    ok: true,
    servico: 'Fatec Zona Sul API',
    versao: '1.0.0',
    porta: PORT,
    uptimeSegundos: Math.round(process.uptime()),
    hora: new Date().toISOString()
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('Corpo da requisição excede o limite permitido.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('JSON inválido no corpo da requisição.'));
      }
    });
    req.on('error', () => reject(new Error('Falha ao ler o corpo da requisição.')));
  });
}

async function serveStatic(req, res, pathname) {
  let relative = decodeURIComponent(pathname);
  if (relative === '/' || relative === '') relative = '/index.html';

  // /cursos vira /cursos.html
  if (!path.extname(relative)) {
    const asHtml = path.join(PUBLIC_DIR, `${relative}.html`);
    try {
      const st = await fsp.stat(asHtml);
      if (st.isFile()) relative = `${relative}.html`;
    } catch {
    }
  }

  const filePath = path.resolve(PUBLIC_DIR, `.${path.sep}${relative.replace(/^[/\\]+/, '')}`);
  const relativeToPublic = path.relative(PUBLIC_DIR, filePath);

  if (relativeToPublic.startsWith('..') || path.isAbsolute(relativeToPublic)) {
    return error(res, 403, 'Acesso negado.');
  }

  let stat;
  try {
    stat = await fsp.stat(filePath);
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      stat = await fsp.stat(indexPath);
      return streamFile(req, res, indexPath, stat);
    }
  } catch {
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      try {
        const notFound = path.join(PUBLIC_DIR, '404.html');
        const st = await fsp.stat(notFound);
        return streamFile(req, res, notFound, st, 404);
      } catch {
      }
    }
    return error(res, 404, 'Recurso não encontrado.');
  }

  return streamFile(req, res, filePath, stat);
}

function streamFile(req, res, filePath, stat, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const cache = 'no-cache';

  res.writeHead(statusCode, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Cache-Control': cache,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });

  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(filePath)
    .on('error', () => res.destroy())
    .pipe(res);
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, { Allow: 'GET, POST, HEAD, OPTIONS' });
    return res.end();
  }

  if (pathname === '/api' || pathname === '/api/') {
    return json(res, 200, {
      ok: true,
      servico: 'Fatec Zona Sul API',
      endpoints: [
        'GET /api/health',
        'GET /api/fatec',
        'GET /api/cursos',
        'GET /api/cursos/:slug',
        'GET /api/eventos?categoria=&mes=',
        'GET /api/infraestrutura',
        'GET /api/equipe',
        'GET /api/vestibular',
        'POST /api/interesse',
        'GET /api/interesse/:protocolo'
      ]
    });
  }

  if (pathname.startsWith('/api/')) {
    if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'HEAD') {
      return error(res, 405, 'Método não permitido.');
    }

    if (pathname === '/api/health') return apiHealth(res);
    if (pathname === '/api/fatec') return apiFatec(res);
    if (pathname === '/api/cursos') return apiCursos(res);
    if (pathname === '/api/eventos') return apiEventos(res, url);
    if (pathname === '/api/infraestrutura') return apiInfraestrutura(res);
    if (pathname === '/api/equipe') return apiEquipe(res);
    if (pathname === '/api/vestibular') return apiVestibular(res);

    const matchCurso = pathname.match(/^\/api\/cursos\/([a-z0-9-]+)$/i);
    if (matchCurso) return apiCurso(res, matchCurso[1].toLowerCase());

    if (pathname === '/api/interesse' && req.method === 'POST') {
      return apiCriarInteresse(req, res);
    }

    const matchInteresse = pathname.match(/^\/api\/interesse\/([A-Za-z0-9-]+)$/);
    if (matchInteresse && req.method === 'GET') {
      return apiInteressePorProtocolo(res, matchInteresse[1]);
    }

    return error(res, 404, 'Endpoint não encontrado.');
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return error(res, 405, 'Método não permitido.');
  }

  return serveStatic(req, res, pathname);
}

const server = http.createServer((req, res) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Powered-By', 'Fatec Zona Sul Portal');

  handleRequest(req, res).catch((err) => {
    console.error('[ERRO]', err);
    if (!res.headersSent) error(res, 500, 'Erro interno no servidor.');
    else res.destroy();
  });

  res.on('finish', () => {
    if (urlPath(req.url).startsWith('/api/')) log(req, res.statusCode);
  });
});

function urlPath(raw) {
  try {
    return new URL(raw, 'http://localhost').pathname;
  } catch {
    return raw || '';
  }
}

async function start() {
  await ensureStore();
  server.listen(PORT, HOST, () => {
    console.log('');
    console.log('   ═══════════════════════════════════════');
    console.log('      F A T E C   Z O N A   S U L');
    console.log('      Dom Paulo Evaristo Arns');
    console.log('   ═══════════════════════════════════════');
    console.log('');
    console.log('   Projeto acadêmico · Desenvolvimento Web');
    console.log(`   Servidor ativo em: http://localhost:${PORT}`);
    console.log(`   API REST em:       http://localhost:${PORT}/api`);
    console.log(`   Porta fixa:        ${PORT}`);
    console.log('');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n  A porta ${PORT} já está em uso. Encerre o processo que a utiliza e tente novamente.\n`);
      process.exit(1);
    }
    throw err;
  });
}

process.on('SIGINT', () => {
  console.log('\n  Encerrando o servidor...');
  server.close(() => process.exit(0));
});

start();
