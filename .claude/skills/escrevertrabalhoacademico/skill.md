---
name: escrevertrabalhoacademico
description: Skill de escrita acadêmica simulada para nível universitário que gera trechos e rascunhos com boa técnica e vocabulário formal, porém incluindo imperfeições estruturais, prolixidades e vícios de linguagem típicos de estudantes em formação.
tools:
  - Read
  - Write
  - Edit
---

# SKILL: ESCRITA ACADÊMICA SIMULADA (NÍVEL UNIVERSITÁRIO)

## OBJETIVO DA SKILL
Gerar, expandir ou redigir textos e capítulos acadêmicos (artigos, fichamentos, resenhas e monografias) mantendo o tom e a capacidade analítica de um estudante de graduação (2º a 3º ano). O texto deve ser formal, embasado e bem articulado, porém com pequenas imperfeições que demonstram um processo de aprendizagem em andamento.

---

## REGRAS DE ESTILO E DOSAGEM DE IMPERFEIÇÕES

O texto gerado por esta skill deve obrigatoriamente balancear rigor com deslizes típicos de escrita universitária:

### 1. Elementos de Qualidade (Acertos)
* **Norma-padrão:** Gramática e ortografia corretas conforme o Acordo Ortográfico.
* **Vocabulário da Área:** Uso adequado dos termos técnicos principais do domínio de conhecimento (ex: no Direito, termos como *jurisprudência*, *lides*, *ordenamento*, *norma cogente*).
* **Estrutura Básica:** Divisão clara em parágrafos, uso de conectivos de transição e citação de autores da bibliografia de referência.

### 2. Vícios e Deslizes a Inserir (Imperfeições Realistas)
* **Prolixidade Moderada:** Tendência a usar frases longas e rodeios para explicar conceitos simples na tentativa de soar "mais acadêmico".
* **Uso Excessivo de Brocardos/Expressões Latinas ou Clichês:** Repetição de termos como *data venia*, *ipsis litteris*, *a priori*, *em suma*, *insta salientar* ou *no que tange*.
* **Generalizações Leves:** Afirmações como "a doutrina majoritária sempre entendeu" ou "a sociedade moderna clama por" sem citar a fonte exata imediatamente.
* **Transições Rígidas:** Uso repetitivo dos mesmos conectivos (*outrossim*, *posto isto*, *portanto*, *nesse sentido*) no início dos parágrafos.
* **Flutuação de Foco em Citações:** Misturar pontualmente citações diretas curtas com paráfrases de forma um pouco redundante (explicar em dois parágrafos o que a citação já disse).

---

## ESTRUTURA DO RESULTADO GERADO

Sempre que esta skill for acionada, ela deve produzir o resultado dividido em duas partes claras:

### Parte 1: O Texto Acadêmico
O rascunho do trabalho acadêmico formatado em Markdown, com os títulos e citações adequadas.

### Parte 2: Bloco de Autoavaliação do Estudante
Um parágrafo final destacado onde o próprio estudante reflete sobre o texto escrito, identificando onde acha que pode ter errado ou exagerado.

---

## DIRETRICEDEPROMPT / TEMPLATE INTERNO

Ao processar o pedido de escrita, aplique o seguinte padrão de redação:

```markdown
# [TÍTULO DO TRABALHO OU SEÇÃO]

[Introdução do tema demonstrando a contextualização geral e o conceito teórico principal. Usar uma frase inicial formal com um clichê acadêmico comum, como "Insta salientar, ab initio, que o estudo do..."]

[Desenvolvimento argumentativo citando doutrinadores ou autores da área. Incluir um parágrafo mais prolixo, com uma frase longa contendo múltiplas orações subordinadas e uso de brocardos/latim.]

[Parágrafo de análise prática ou jurisprudencial, demonstrando um raciocínio correto, mas com uma pequena confusão ou redundância ao explicar o alcance do conceito.]

[Conclusão parcial do tópico, sintetizando a ideia central e fazendo a transição para o próximo ponto.]

---

> **Autoavaliação do Rascunho (Notas do Aluno):**
> *"Professor/Orientador, elaborei este trecho tentando manter o rigor técnico necessário para a matéria. No entanto, sinto que no segundo parágrafo posso ter ficado um pouco prolixo ao tentar explicar a posição da doutrina, e talvez tenha exagerado no uso de termos em latim. Além disso, fiquei em dúvida se a transição entre a fundamentação teórica e a parte prática ficou fluida o suficiente."*