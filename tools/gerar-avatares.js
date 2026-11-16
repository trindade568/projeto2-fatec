// Gera avatares geométricos (SVG) para os integrantes da equipe.
// Uso: node tools/gerar-avatares.js

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'equipe');

const PESSOAS = [
  { id: 'ana', iniciais: 'AC', pele: '#e8b08a', cabelo: '#3a2a22', fundo: '#c8102e' },
  { id: 'bruno', iniciais: 'BL', pele: '#c98d63', cabelo: '#151312', fundo: '#0e6ba8' },
  { id: 'carla', iniciais: 'CM', pele: '#f2c9a4', cabelo: '#7a3b12', fundo: '#b4530a' },
  { id: 'daniel', iniciais: 'DR', pele: '#8a5a3b', cabelo: '#0d0c0b', fundo: '#1d6f42' },
  { id: 'eduarda', iniciais: 'EN', pele: '#d9a06b', cabelo: '#4a3524', fundo: '#6d28d9' },
  { id: 'felipe', iniciais: 'FA', pele: '#e8b08a', cabelo: '#2b2b2b', fundo: '#334155' }
];

function avatar({ iniciais, pele, cabelo, fundo }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Avatar de ${iniciais}">
  <rect width="120" height="120" rx="24" fill="${fundo}"/>
  <circle cx="60" cy="52" r="22" fill="${pele}"/>
  <path d="M38 46c2-14 12-21 22-21s20 7 22 21c-7-6-13-9-22-9s-15 3-22 9z" fill="${cabelo}"/>
  <path d="M20 108c4-22 20-32 40-32s36 10 40 32z" fill="${pele}" opacity="0.92"/>
  <circle cx="50" cy="52" r="2.4" fill="#1c1a19"/>
  <circle cx="70" cy="52" r="2.4" fill="#1c1a19"/>
  <path d="M53 62c4.5 3.4 9.5 3.4 14 0" stroke="#1c1a19" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="60" y="112" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700" fill="#ffffff" letter-spacing="2">${iniciais}</text>
</svg>
`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const pessoa of PESSOAS) {
  const file = path.join(OUT_DIR, `${pessoa.id}.svg`);
  fs.writeFileSync(file, avatar(pessoa), 'utf8');
  console.log('gerado:', path.relative(process.cwd(), file));
}
