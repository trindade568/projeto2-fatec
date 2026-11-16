# Portal Fatec Zona Sul

Projeto da disciplina de Desenvolvimento Web: um site sobre a Fatec Zona Sul — Dom Paulo Evaristo Arns, com frontend e backend e tudo rodando na **porta 2000**.

> Não é o site oficial da faculdade. Usei como base o site oficial (fateczonasul.edu.br), o portal do vestibular e o Centro Paula Souza. Inscrição oficial só em vestibular.fatec.sp.gov.br.

## Como rodar

Precisa ter o Node.js instalado. Depois:

```bash
npm start
```

Abre no navegador: **http://localhost:2000**

Não precisa de `npm install` (o projeto não usa nenhuma biblioteca externa). Pra parar o servidor: `Ctrl + C`.

## Páginas

| Página | O que tem |
| --- | --- |
| Início | Apresentação, números, cursos, contagem pra prova do vestibular |
| Vestibular | Cronograma completo, taxa, orientações e link oficial de inscrição |
| Cadastro de interesse | Formulário com envio pra API e comprovante com protocolo |
| Cursos | Os 4 cursos; cada um tem página própria (curso.html?slug=ads) |
| Infraestrutura | Mapa interativo do campus com detalhes dos ambientes |
| Eventos | Calendário interativo; dá pra salvar favoritos e exportar .ics |
| Quem Somos | A equipe do projeto e a arquitetura |

## Tecnologias

- **Backend:** Node.js puro (`node:http`), com API REST em `/api` e os dados em arquivos JSON na pasta `data/`
- **Frontend:** HTML, CSS e JavaScript puro (sem frameworks)
- **Extras:** validação no cliente e no servidor, persistência em JSON, protocolo único por cadastro

## Estrutura

```text
fatec-zona-sul-portal/
├── server.js          # servidor + API
├── data/              # dados (cursos, eventos, infraestrutura etc.)
├── public/            # frontend (html, css, js, assets)
└── tools/             # gerador dos avatares da equipe
```

## Observações

- Os nomes e RAs da equipe em `data/equipe.json` são fictícios; troque pelos do grupo real.
- As datas acadêmicas são estimativas pra demonstração; as do vestibular são as oficiais (consulte sempre o edital).
- Cadastros ficam salvos em `data/interesse.json` (inicia como `[]`).

Feito por alunos da Fatec Zona Sul. © 2026
