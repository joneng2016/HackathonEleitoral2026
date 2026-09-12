# PLANO DE AÇÃO: Compilação e Conversão do Markdown para Word (.docx ABNT)

**Objetivo:** Ler o arquivo Markdown unificado (`./trabalho_completo.md`), validar sua estrutura semântica e invocar a skill de conversão programática para gerar o documento final em formato Microsoft Word (`.docx`) em conformidade estrita com as normas da ABNT e codificação UTF-8.

**Pré-requisito:** Arquivo `./trabalho_completo.md` gerado e validado.

---

## ETAPAS DE EXECUÇÃO

### 1. Inspeção e Preparação do Arquivo Fonte
- [ ] **Validar Leitura em UTF-8:** Ler o arquivo `./trabalho_completo.md` assegurando que a codificação de caracteres esteja preservada (sem erros de acentuação como *mojibake*).
- [ ] **Verificar Estrutura de Marcação:** Confirmar se as seções primárias (`#`), secundárias (`##`), citações longas (`> `) e listas estão corretamente anotadas no Markdown.

### 2. Configuração do Runtime de Conversão
- [ ] **Detectar Ambiente Disponível:** Verificar no sistema qual ferramenta/runtime está disponível via `Bash` (Python com `python-docx`, Node.js com a biblioteca `docx`, ou `pandoc`).
- [ ] **Definir Parâmetros ABNT:** Garantir que o script aplique as especificações geométricas:
  - Margens: Esquerda/Superior 3 cm, Direita/Inferior 2 cm.
  - Fonte: Times New Roman / Arial (12 pt para corpo, 10 pt para citações longas).
  - Espaçamento: 1,5 entre linhas (simples para citações longas).
  - Recuo de Parágrafo: 1,25 cm na primeira linha.
  - Recuo de Citação Longa: 4 cm da margem esquerda.

### 3. Execução da Conversão
- [ ] **Invocação da Skill (`conversor-markdown-docx-engine`):** Executar a conversão do arquivo `./trabalho_completo.md` para `./trabalho_academico_final.docx`.
- [ ] **Monitoramento de Execução:** Acompanhar o log de saída do script e garantir que não ocorram exceções de *buffer* ou *encoding*.

### 4. Validação e Entrega do Artefato Final
- [ ] **Confirmar Arquivo de Saída:** Checar se o arquivo `./trabalho_academico_final.docx` foi gerado na raiz com tamanho binário válido.
- [ ] **Notificação de Conclusão:** Reportar ao usuário a disponibilização do arquivo Word formatado segundo as normas ABNT e pronto para impressão/envio.