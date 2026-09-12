---
name: buscarporlivrosavalair
description: Skill de pesquisa bibliográfica acadêmica que, a partir de um assunto, localiza livros acadêmicos sobre o tema, compreende seu conteúdo, usa-os como fundamentação em textos acadêmicos e formula as referências conforme a ABNT NBR 6023.
tools:
  - WebSearch
  - WebFetch
  - Read
  - Write
  - Edit
---

# SKILL: BUSCA, COMPREENSÃO E REFERENCIAÇÃO DE LIVROS ACADÊMICOS

## OBJETIVO DA SKILL
A partir de um **assunto** fornecido pelo usuário, executar um pipeline em 4 etapas:

1. **Buscar** os livros acadêmicos (doutrina) relevantes sobre o assunto.
2. **Compreender** o conteúdo, as teses e os conceitos centrais de cada obra.
3. **Usar como base** o material compreendido na redação de textos acadêmicos (citações e paráfrases fundamentadas).
4. **Formular as referências** dos livros utilizados no formato ABNT NBR 6023.

---

## ETAPA 1 — BUSCA DOS LIVROS ACADÊMICOS

Para cada assunto recebido, realize pesquisas com a ferramenta `WebSearch` usando padrões como:

- `"<assunto>" livro doutrina autor`
- `"<assunto>" livro jurídico editora Saraiva OR Forense OR Malheiros OR Juspodivm OR Atlas OR RT`
- `"<assunto>" site:amazon.com.br livro`
- `"<assunto>" Google Books`

Priorize nesta ordem:
1. Obras clássicas e consagradas da área (autores de referência citados recorrentemente pela doutrina).
2. Livros de editoras acadêmicas reconhecidas.
3. Edições mais recentes disponíveis.

Para **cada livro encontrado**, colete e registre os metadados completos:
- Autor(es) (sobrenome e prenome por extenso)
- Título e subtítulo
- Edição (se não for a 1ª)
- Local de publicação, editora e ano
- ISBN (quando disponível)
- Número de páginas (quando disponível)

**Regra de integridade:** nunca invente metadados. Somente registre autor, edição, editora, ano ou ISBN que tenham sido confirmados na busca. Campo não confirmado deve ser marcado como `[verificar]`.

---

## ETAPA 2 — COMPREENSÃO DO CONTEÚDO

Para cada livro considerado relevante, use `WebFetch` em páginas de catálogo da editora, Google Books, resenhas acadêmicas e sumários disponíveis, extraindo:

- **Tese central** da obra e posição do autor sobre o assunto.
- **Conceitos-chave** e definições relevantes.
- **Capítulos ou seções** diretamente ligados ao assunto pesquisado.
- **Citações textuais** verificáveis (se a fonte as exibir), com indicação de página quando possível.

Registre o resultado de cada obra em uma **Ficha Bibliográfica** com o seguinte padrão:

```markdown
### FICHA — [SOBRENOME, Nome] — [TÍTULO]

- **Obra:** Título: subtítulo. Edição. Local: Editora, ano.
- **Tese central:** [síntese em 2 a 4 linhas]
- **Conceitos-chave:** [lista dos conceitos do livro úteis ao assunto]
- **Relevância para o assunto:** [em que o livro fundamenta o texto acadêmico]
- **Trechos verificados:** [citações confirmadas, com página quando disponível]
```

---

## ETAPA 3 — USO COMO BASE EM TEXTOS ACADÊMICOS

Ao redigir o texto acadêmico fundamentado nos livros, aplique as formas de citação conforme a ABNT NBR 10520:

### Citação direta curta (até 3 linhas)
Inserida no parágrafo, entre aspas duplas, com indicação de autoria:
> Conforme Silva (2019, p. 45), "texto da citação".

### Citação direta longa (mais de 3 linhas)
Em bloco destacado, recuo de 4 cm da margem esquerda, fonte menor (10 pt) e espaçamento simples, sem aspas.

### Paráfrase
Reescrita das ideias do autor com as próprias palavras, mantendo a fidelidade ao sentido original, sempre com indicação de autoria (sem página obrigatória).

**Regras de fidelidade:**
- Nunca atribuir ao autor posição ou frase que não tenha sido confirmada na Etapa 2.
- Não inventar números de página. Se a página não foi confirmada, usar apenas `(SOBRENOME, ano)`.
- Quando a posição exata do autor não puder ser confirmada, escrever de forma genérica ("a doutrina de [Autor] sobre o tema...") e marcar `[verificar]`.

---

## ETAPA 4 — FORMULAÇÃO DAS REFERÊNCIAS (ABNT NBR 6023)

Gerar ao final o bloco `## REFERÊNCIAS` com todas as obras efetivamente utilizadas no texto, seguindo estes formatos:

### Livro (um autor)
```
SOBRENOME, Nome. Título: subtítulo. Edição. Local: Editora, ano.
```
- Sobrenome em CAIXA ALTA, prenome por extenso ou abreviado.
- Edição indicada apenas a partir da 2ª ("2. ed.").
- Título destacado (negrito ou itálico).
- Exemplo: `SILVA, José Afonso da. Curso de direito constitucional positivo. 42. ed. São Paulo: Malheiros, 2019.`

### Livro (até 3 autores)
```
SOBRENOME, Nome; SOBRENOME, Nome; SOBRENOME, Nome. Título: subtítulo. Edição. Local: Editora, ano.
```
- Autores separados por ponto e vírgula.

### Livro (mais de 3 autores)
Indicar o primeiro autor seguido da expressão `et al.`

### Capítulo de livro
```
SOBRENOME, Nome. Título do capítulo. In: SOBRENOME, Nome (org.). Título do livro. Edição. Local: Editora, ano. p. inicial-final.
```

### E-book
Acrescentar `E-book.` após o título/subtítulo, antes do local.

### Obra em meio eletrônico
Acrescentar ao final: `Disponível em: URL. Acesso em: dia mês ano.`

**Regra de ordenação:** as referências devem ser listadas em ordem alfabética pelo sobrenome do autor, alinhadas à esquerda, com espaçamento simples e separadas entre si por um espaço em branco.

---

## RESULTADO ESPERADO DA SKILL

Toda execução deve entregar, nesta ordem:

1. **Lista de livros encontrados** sobre o assunto, com os metadados coletados na Etapa 1.
2. **Fichas bibliográficas** (Etapa 2) de cada obra relevante.
3. **Trecho acadêmico fundamentado** (Etapa 3) demonstrando o uso dos livros como base, com citações e paráfrases.
4. **Bloco `## REFERÊNCIAS`** (Etapa 4) em ABNT NBR 6023, contendo apenas as obras efetivamente citadas.

Campos não confirmados aparecem como `[verificar]` e nunca são apresentados como dados reais.
