# PLANO DE AÇÃO: Escrita e Formatação Modular em Markdown

**Objetivo:** Redigir, modularizar e consolidar todo o conteúdo do trabalho acadêmico diretamente em arquivos Markdown (`.md`) com suporte nativo a codificação UTF-8 e regras de hierarquia ABNT.

**Pré-requisito:** Conclusão da estruturação do conteúdo definida no plano `planparalerosarquivosprojeto.plan.md`.

---

## ETAPAS DE EXECUÇÃO

### 1. Configuração do Workspace de Escrita
- [ ] **Criar Diretório de Capítulos:** Estruturar a pasta `./drafts/` para armazenar os arquivos `.md` individuais.
- [ ] **Definir Arquivo Mestre:** Criar o arquivo `./drafts/00_sumario_e_metadados.md` com a estrutura base, folha de rosto simplificada e lista de arquivos a serem unificados.

### 2. Escrita Modular dos Arquivos Markdown
- [ ] **Escrever `./drafts/01_introducao.md`:** Redigir o capítulo de introdução aplicando cabeçalho primário (`# 1 INTRODUÇÃO`), parágrafos justificadores e o problema de pesquisa.
- [ ] **Escrever `./drafts/02_fundamentacao_teorica.md`:** Redigir o embasamento teórico utilizando subseções (`## 2.1...`), citações diretas curtas (com aspas) e citações longas estruturadas via bloco Markdown (`> `).
- [ ] **Escrever `./drafts/03_metodologia.md`:** Descrever os procedimentos metodológicos e referências normativas em seções estruturadas.
- [ ] **Escrever `./drafts/04_desenvolvimento.md`:** Redigir a análise central do trabalho, incluindo tabelas ou listas em Markdown quando necessário.
- [ ] **Escrever `./drafts/05_conclusao.md`:** Finalizar as considerações com síntese dos resultados obtidos.
- [ ] **Escrever `./drafts/06_referencias.md`:** Formatar a lista de referências em alinhamento à esquerda e espaçamento adequado.

### 3. Validação do Markdown e Codificação UTF-8
- [ ] **Verificar Sintaxe Markdown:** Validar se a hierarquia dos títulos (`#`, `##`, `###`) e as marcações de citação em bloco (`>`) estão corretas.
- [ ] **Validar Encoding UTF-8 sem BOM:** Garantir que a acentuação (ç, ã, é) esteja intacta em todos os arquivos para evitar problemas de exibição (*mojibake*).

### 4. Unificação do Documento
- [ ] **Compilar em Arquivo Único:** Unir sequencialmente todos os capítulos no arquivo final `./trabalho_completo.md`.
- [ ] **Inspeção Final do `.md`:** Confirmar se o documento `trabalho_completo.md` está pronto para ser consumido pela skill de conversão para Word.