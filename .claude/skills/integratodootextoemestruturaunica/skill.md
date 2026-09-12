---
name: integratodootextoemestruturaunica
description: Skill que ajusta um texto acadêmico longo e fragmentado para que fique integrado, coeso e com aparência de ter sido escrito em uma única estrutura contínua, preservando o sentido original, as posições dos autores e as referências.
tools:
  - Read
  - Write
  - Edit
  - Grep
---

# SKILL: INTEGRAÇÃO DE TEXTO ACADÊMICO EM ESTRUTURA ÚNICA

## OBJETIVO DA SKILL
Receber um texto acadêmico longo, fragmentado ou desconexo e reestruturá-lo para que o resultado final seja **integrado, coeso e fluido** — como se tivesse sido escrito de uma única vez, em uma única estrutura contínua, sem quebras de raciocínio, partes soltas ou passagens sem sentido.

O processo se divide em 4 etapas: **Diagnóstico → Mapa Estrutural → Integração → Entrega**.

---

## ETAPA 1 — DIAGNÓSTICO DO TEXTO

Ler o texto completo e identificar todos os problemas de desconexão:

- **Partes soltas:** trechos sem vínculo com o que vem antes ou depois.
- **Repetições:** mesma ideia redigida mais de uma vez, com variações.
- **Contradições:** trechos que se opõem entre si.
- **Transições abruptas:** mudança brusca de assunto sem conectivo ou anúncio.
- **Quebras de voz:** variações de pessoa (1ª/3ª), tempo verbal ou registro.
- **Terminologia oscilante:** mesmo conceito nomeado de formas diferentes.
- **Citações desconexas:** citações soltas, sem introdução, comentário ou ligação com o argumento.
- **Estrutura ausente:** falta de hierarquia clara entre introdução, desenvolvimento e conclusão.

Cada problema identificado deve ser registrado em um **Relatório de Diagnóstico** (ver Etapa 4).

---

## ETAPA 2 — MAPA ESTRUTURAL

Antes de reescrever, organizar o conteúdo em um mapa hierárquico:

1. **Tese central:** a ideia principal que o texto defende.
2. **Argumentos de apoio:** cada bloco temático que sustenta a tese.
3. **Ordem lógica:** sequência em que os argumentos devem aparecer (do geral ao específico, do conceito à aplicação).
4. **Estrutura final alvo:**
   - **Introdução** — apresenta o tema, delimita o problema e anuncia o percurso do texto.
   - **Desenvolvimento** — seções numeradas (1., 2., 3. ...), cada uma com um argumento e sua conclusão parcial.
   - **Conclusão** — retoma a tese e sintetiza os resultados do percurso.

Nenhum conteúdo do texto original pode ser descartado sem justificativa registrada (fusão por repetição ou realocação em seção mais adequada).

---

## ETAPA 3 — INTEGRAÇÃO (REESCRITA)

Reescrever o texto aplicando, em ordem:

### 3.1 Unidade de voz
- Padronizar pessoa e tempo verbal em todo o texto (preferência: 3ª pessoa do singular/plural, registro acadêmico formal).
- Eliminar saltos entre "eu/ele/nós/você".

### 3.2 Padronização terminológica
- Um único termo para cada conceito, do início ao fim.
- Na primeira ocorrência, apresentar o conceito; nas seguintes, manter exatamente o mesmo termo.

### 3.3 Coesão entre parágrafos e seções
- Cada parágrafo com **uma ideia-núcleo**, aberto por tópico frasal e fechado com gancho de transição para o próximo.
- Toda seção anuncia o que tratará; toda seção encerrada faz a ponte com a seguinte.
- Conectivos variados e adequados à relação lógica (adição, oposição, causa, consequência, exemplificação), sem repetição mecânica.

### 3.4 Fusão de repetições
- Passagens duplicadas são fundidas em uma única versão, mantendo a mais completa e correta.
- Fragmentos dispersos sobre o mesmo tema são agrupados na mesma seção.

### 3.5 Tratamento de contradições
- Contradições **nunca** são apagadas silenciosamente.
- Se houver divergência entre autores citados, manter as duas posições e marcar o confronto ("de um lado... de outro...").
- Se houver erro interno do próprio texto (dado conflitante), preservar a versão mais fundamentada e registrar a correção no Relatório de Alterações.

### 3.6 Integração de citações
- Toda citação direta ou paráfrase recebe: **introdução** (quem fala), **texto** e **comentário** (o que isso sustenta no argumento).
- Citações soltas são realocadas para a seção em que o argumento correspondente é desenvolvido.
- Padronizar o formato das chamadas conforme a ABNT NBR 10520: `(SOBRENOME, ano, p. X)` para citação direta; `(SOBRENOME, ano)` para paráfrase.

### 3.7 Bloco único de referências
- Consolidar todas as referências citadas em um único bloco `## REFERÊNCIAS`, em ordem alfabética, sem duplicatas, conforme a ABNT NBR 6023.
- Referências citadas no corpo devem constar no bloco, e vice-versa.

---

## REGRAS DE FIDELIDADE (INEGOCIÁVEIS)

1. **Preservar o sentido original:** a reescrita integra a forma; nunca altera a posição dos autores nem o conteúdo das ideias.
2. **Não inventar conteúdo:** nenhum dado, conceito, autor ou citação pode ser criado para "preencher" lacunas.
3. **Marcar incertezas:** trechos cuja origem ou correção não puder ser confirmada recebem a marca `[verificar]`.
4. **Registrar toda alteração:** fusões, realocações e correções são listadas no Relatório de Alterações.

---

## ETAPA 4 — ENTREGA DO RESULTADO

Toda execução deve entregar, nesta ordem:

1. **Relatório de Diagnóstico** — problemas de desconexão encontrados, com localização no texto original.
2. **Mapa Estrutural** — tese central, argumentos e a estrutura final adotada.
3. **Texto Integrado** — o texto acadêmico completo reescrito em estrutura única, coeso e fluido, em Markdown.
4. **Relatório de Alterações** — o que foi fundido, realocado, corrigido ou marcado como `[verificar]`.
5. **Bloco `## REFERÊNCIAS`** — consolidado, sem duplicatas, em ordem alfabética.
