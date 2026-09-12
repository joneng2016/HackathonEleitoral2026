# PROMPT MESTRE DE EXECUÇÃO EM CADEIA: ELABORAÇÃO E CONVERSÃO DE TRABALHO ACADÊMICO

Atue como o orquestrador do sistema e execute em sequência estrita o pipeline de criação do trabalho acadêmico utilizando o ecossistema de agentes, habilidades e planos de ação cadastrados.

---

## 1. AMBIENTE E ARQUIVOS DE ENTRADA
Certifique-se de acessar as seguintes fontes no workspace:
- Arquivo de Contexto Base: `./source/projetocademico.pdf`
- Arquivo de Estrutura/Diretrizes: `./source/estrututuraprojeto.md`
- Arquivo Final de Saída: `./trabalho_academico_final.docx`

---

## 2. PIPELINE DE EXECUÇÃO EM 4 FASES

### FASE 1: Análise e Entendimento do Projeto
- Invoque e execute integralmente as etapas descritas no plano `planparaentenderprojeto.plan.md`.
- Leia os arquivos da pasta `./source/` para identificar:
  1. O problema central de pesquisa e as hipóteses.
  2. Os objetivos gerais e específicos.
  3. A delimitação teórica e metodológica exigida.
- Gere a síntese de contexto antes de avançar para a escrita.

### FASE 2: Estruturação dos Conteúdos
- Invoque e execute o plano `planparalerosarquivosprojeto.plan.md`.
- Conecte as diretrizes da análise ao agente `aluno-direito-segundo-ano` e ao `professor-orientador-direito` para delinear o sumário, os capítulos e a fundamentação doutrinária/jurisprudencial necessária.

### FASE 3: Redação Modular em Markdown (UTF-8)
- Invoque e execute o plano de escrita em Markdown.
- Utilize a skill `escrevertrabalhoacademico` para redigir o texto dos capítulos na pasta `./drafts/` (`01_introducao.md`, `02_fundamentacao.md`, `03_metodologia.md`, `04_desenvolvimento.md`, `05_conclusao.md`, `06_referencias.md`).
- **Diretrizes de Tom e Estilo:** O texto deve ser escrito na perspectiva do estudante de 2º ano de Direito (Lucas) — formal, técnico, articulado, mas contendo os pequenos vícios de linguagem e o bloco de autoavaliação crítica.
- Consolide todos os módulos no arquivo único `./trabalho_completo.md` garantindo a codificação **UTF-8 sem BOM**.

### FASE 4: Compilação e Formatação ABNT para Word (.docx)
- Invoque e execute o plano de conversão para Word.
- Dispare a skill `conversor-markdown-docx-engine` para processar o arquivo `./trabalho_completo.md`.
- Aplique rigorosamente as normas da ABNT no XML do Word:
  - Margens: Esquerda/Superior 3,0 cm | Direita/Inferior 2,0 cm.
  - Fonte: Times New Roman 12 pt (1,5 de espaçamento e 1,25 cm de recuo de parágrafo).
  - Citações Longas: Fonte 10 pt, espaçamento simples e recuo de 4,0 cm da margem esquerda.
  - Caracteres em Português: Preservar acentuação e cedilha via UTF-8 estrito.
- Salve o arquivo binário final em `./trabalho_academico_final.docx`.

---

## 3. INSTRUÇÃO DE START
Por favor, confirme o recebimento deste prompt, leia os arquivos em `./source/` e inicie a **FASE 1** do pipeline imediatamente.