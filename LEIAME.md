# Ilícitos em Jogo

Jogo educativo sobre a distinção entre **conduta lícita e conduta criminosa no
dia da eleição**. O jogador é um jovem candidato: escolhe um avatar, disputa a
eleição para **vereador** e, julgando corretamente as três situações da fase,
passa à candidatura seguinte, a **deputado estadual**.

---

## Como executar

Abra `index.html` no navegador. Não há instalação, cadastro, servidor, build
nem dependência externa (RNF-02 / US-01). Todo o processamento ocorre no
dispositivo do jogador; nenhum dado é coletado ou transmitido.

---

## Fluxo do jogo

```
escolha do avatar  →  FASE 1 · VEREADOR  →  aprovado?  →  FASE 2 · DEPUTADO ESTADUAL  →  encerramento
                      3 situações           │                                               │
                                            │ não                                           │ não
                                            ▼                                               ▼
                                    não se elegeu vereador                    eleito vereador, mas
                                    → refaz a fase 1                          não eleito deputado
```

**O critério de passagem é acertar as três situações da fase.** O critério é
rígido de propósito, e não por severidade: cada fase tem duas situações lícitas
e uma que não é. Nenhuma resposta repetida — tocar sempre em "Permitido",
sempre em "É crime", sempre em "Preciso observar melhor" — alcança as três. Só
passa quem julga caso a caso.

Reprovar na fase 1 leva a uma tela de derrota que revisa os três casos **com a
fundamentação jurídica de cada erro** e oferece refazer a fase. Reprovar na
fase 2 não é derrota: a carreira se encerra no cargo que o jogador já
conquistou, e a tela final mostra as duas fases lado a lado.

---

## Estrutura

```
jogo/
├── index.html              aplicação (interface e ponto de entrada)
├── css/estilo.css          estilos, temas claro e escuro, responsividade
├── js/app.js               estado, lógica, renderização e entrada
├── js/ilustracoes.js       ilustrações SVG e retratos dos avatares
└── dados/cenas.js          ★ ARQUIVO DE DADOS — todo o conteúdo
```

### Editando o conteúdo (US-12)

**Todo o conteúdo jurídico e pedagógico reside em `dados/cenas.js`.** Alterar
esse arquivo altera o jogo: não é preciso tocar em código, recompilar ou
reinstalar. É o único lugar onde uma correção de classificação precisa ser
feita.

O arquivo tem quatro blocos:

| Bloco | O que é |
|---|---|
| `LEI` | transcrições literais dos dispositivos, citadas entre aspas nas telas |
| `AVATARES` | as opções de avatar e as cores usadas para desenhá-las |
| `FASES` | as duas candidaturas e quais situações pertencem a cada uma |
| `CENAS` | as seis situações |
| `PERGUNTAS_RESOLUCAO` | as três perguntas exibidas ao final |

Cada situação declara:

| Campo | Função |
|---|---|
| `id`, `fase` | identificação e a que fase pertence |
| `titulo`, `enunciado` | o que o jogador lê |
| `ilustracao` | chave da ilustração em `js/ilustracoes.js` |
| `descricaoImagem` | texto alternativo da ilustração |
| `veredito` | `permitido`, `crime` ou `ambiguo` |
| `defensaveis` | alternativas aceitas (mais de uma = sem resposta fechada) |
| `justificativa` | fundamento em linguagem acessível (RNF-06). Linha em branco separa parágrafos. |
| `baseLegal`, `textoLegal` | referência e transcrição literal |
| `erroPorAlternativa` | explicação do equívoco, por alternativa incorreta (US-09) |

Para acrescentar, remover, reordenar ou redistribuir situações entre as fases,
basta editar as listas. O contador, a barra de progresso, o portão de fase e o
cálculo de acertos acompanham automaticamente.

---

## Decisões de projeto que não são óbvias

**A ordem das alternativas é sorteada a cada partida.** Os *rótulos* são fixos,
como o RF-02 exige. A *ordem* não é: com ordem fixa, "Permitido" seria sempre o
primeiro botão e duas das três situações de cada fase são lícitas — quem
tocasse sempre no primeiro botão faria 2/3. Com o sorteio, as teclas 1/2/3
passam a acompanhar a posição exibida, e nenhuma posição vira gabarito.

**O avatar é o protagonista desenhado em todas as cenas**, marcado com a
etiqueta "VOCÊ". Sem isso o jogador não se reconhece na situação — e é a
própria conduta dele que está sendo julgada.

**O desenho nunca revela a resposta.** Cenas lícitas, criminosa e ambígua usam
exatamente as mesmas cores de figura, fundo e vestuário. Se a ilustração
denunciasse o veredito, a situação deixaria de exigir julgamento.

**A cena 2 (o cabo eleitoral) ensina responsabilidade de campanha.** O crime é
praticado por um terceiro, não pelo candidato. O jogo diz que a conduta é
crime e que quem coordena uma campanha responde pelo que ela faz às vistas de
todos — sem afirmar imputação penal automática ao candidato, que dependeria de
participação. **Este ponto deve ser conferido na revisão jurídica.**

**Não há Canvas.** A interface é predominante e a animação é pouca: o desenho é
SVG inline, gerado sem dependência.

---

## Escopo entregue

### Implementado

| Origem | Situação |
|---|---|
| RF-01 a RF-04 | seis situações, três alternativas de rótulo fixo, fundamentação imediata |
| RF-05 | quatro das seis situações são de conduta lícita |
| RF-06 / US-08 | a situação 5 não tem resposta fechada, e o jogo declara isso |
| RF-07 / US-06 | as três perguntas de resolução ao final |
| RF-08 / RF-09 (parcial) | estrutura de campanha por fases, com progressão e portão |
| RF-14 / RF-15 | escolha de avatar que representa pessoas jovens |
| RNF-01 / US-07 | responsivo, sem rolagem horizontal; alvos de toque ≥ 44 px |
| RNF-02 / US-01 | abre no navegador, sem cadastro nem instalação |
| RNF-05 | padronização gráfica entre as ilustrações |
| RNF-06 | justificativas em linguagem acessível |
| US-03, US-05, US-09, US-10, US-11, US-12 | retorno fundamentado, desempenho, erro explicado, progresso, reinício, conteúdo em arquivo de dados |

### Não implementado

- **Simulação de campanha completa** (RF-09 a RF-13): fases com minigames,
  pontos de credibilidade, cronômetro e adversários por IA. A progressão aqui
  é por julgamento correto, não por acumulação de pontos.
- **Personalização de partido** (RF-16 a RF-18): o jogo tem avatar, não
  agremiação. A RN-08 previa uma única agremiação na primeira implantação.
- **Minigames** (RF-12): desvio de obstáculos, sabatina e dilemas binários.
- **Módulo de mandato** (RF-19, RF-20), **multiplayer** (RNF-04), **cadastro**
  (US-20) e **painel de curadoria** (US-21).

---

## Fundamentação normativa

Lei nº 9.504, de 30 de setembro de 1997 (Lei das Eleições). As transcrições
exibidas ao jogador são literais e residem em `window.LEI`, no topo de
`dados/cenas.js` — corrigir o dispositivo ali propaga a correção a todas as
situações que o citam.

**Art. 39-A, caput** — a manifestação individual e silenciosa da preferência do
eleitor, *permitida* pelo uso de bandeiras, broches, dísticos e adesivos. A
palavra do dispositivo é "permitida", e é ela que sustenta a RN-01: trata-se de
permissão legal expressa, não de tolerância.

**Art. 39-A, § 1º** — veda a aglomeração de pessoas com vestuário padronizado
capaz de caracterizar manifestação coletiva. É o dispositivo que responde à
primeira pergunta de resolução, e é ele que sustenta a distinção ensinada na
situação 3.

**Art. 39, § 5º, II** — arregimentação de eleitor ou propaganda de boca de urna,
com pena de detenção de seis meses a um ano, alternativa de prestação de
serviços à comunidade e multa. A distribuição de material é crime de **mera
conduta**: consuma-se com a entrega, sem exigir coerção sobre o eleitor.

**Art. 39, § 5º, III** — divulgação de qualquer espécie de propaganda de
partidos políticos ou de seus candidatos.

Duas precisões incorporadas ao conteúdo, e que divergem de formulações
correntes:

- **Porte não é distribuição — e o fundamento não é a proporcionalidade.**
  A conclusão (porte isolado não configura boca de urna) é firme na
  jurisprudência, mas repousa na **atipicidade da conduta** e na exigência de
  prova da efetiva entrega, vedada a imputação objetiva. A proporcionalidade
  incide na dosimetria da multa, não na tipicidade. A situação 4 adota o
  fundamento correto.
- **A situação sem resposta fechada não é ausência de resposta jurídica.**
  Há divergência relevante nos casos de fronteira — enquadramento entre os
  incisos II e III, exigência ou não de fim específico de aliciar, e a linha
  entre porte e entrega. Os pontos nucleares, porém, estão assentados, e um
  deles resolve a situação 5: a manifestação deixa de ser silenciosa quando
  se dirige a alguém. O jogo declara a divergência sem sugerir que tudo seja
  indefinido.

---

## ⚠ Pendência bloqueante de publicação (RN-05)

**A classificação das seis situações ainda NÃO foi submetida à revisão de
profissional com formação em Direito Eleitoral.** Essa revisão é condição
necessária à publicação, nos termos da regra RN-05 e das condições
transversais de entrega do backlog.

O risco é simétrico e está registrado na própria especificação: uma situação
mal classificada ensina o erro com a mesma eficiência com que ensinaria o
acerto. Enquanto a revisão não ocorrer, o material deve ser tratado como
**versão de demonstração**, e não como produto publicável. O rodapé da
aplicação exibe esse aviso ao jogador.

### O que já foi conferido, e o que falta

Conferido: a **fidelidade textual** das transcrições legais, verificada contra
a jurisprudência do TSE e de TREs e contra publicações oficiais. Foi essa
conferência que corrigiu duas impropriedades da versão inicial — o art. 39-A
havia sido transcrito como "É assegurada" quando o dispositivo diz "É
permitida", e o fundamento do porte isolado havia sido atribuído à
proporcionalidade quando o fundamento é a atipicidade.

Não conferido: a **classificação de cada situação**. Se cada uma das seis
cenas retrata efetivamente uma conduta lícita, criminosa ou de fronteira é
juízo que exige profissional habilitado, e é exatamente o que a RN-05 exige
antes da publicação.

Quatro ressalvas conhecidas, para a revisão:

1. A **situação 5** é de fronteira por construção. Se a revisão concluir que o
   caso tem resposta fechada, ela deve ser convertida em situação comum, e o
   jogo passará a descumprir o RF-06 — que exige ao menos uma situação sem
   resposta fechada. Nesse caso, é preciso repor a ambiguidade em outra cena,
   não simplesmente fechar esta.
2. A **situação 4** depende de o material estar de fato lacrado e não
   distribuído. Se o enunciado for lido como quem guarda material para
   distribuir em seguida, a conclusão pode se inverter.
3. A **situação 2** atribui à campanha a responsabilidade pela conduta de um
   cabo eleitoral. A formulação evita afirmar imputação penal automática ao
   candidato, mas o ponto é sensível e pede conferência.
4. O **critério de passagem** (acertar as três) é decisão de produto, não
   jurídica — mas ele determina que o jogador veja a tela de derrota com
   frequência. Vale conferir se o tom dessa tela não desestimula o público
   jovem que o projeto quer atrair.

---

## Verificação

Bateria automatizada executada em navegador real (Chrome headless), com
**172 verificações**: tela de avatar, integridade e validação do arquivo de
dados, fidelidade das transições legais, percurso completo das duas fases,
portão de aprovação, reprovação e refazer fase nas duas fases, reinício,
controles de teclado, spam de entrada, sorteio da ordem das alternativas,
contraste do selo de veredito e ausência de erros no console.

O critério do portão é verificado por exaustão: as três estratégias de resposta
repetida são jogadas de ponta a ponta e nenhuma delas aprova a fase 1.

Responsividade medida carregando o `index.html` real em viewports de
**320, 360, 390, 414, 768, 1024 e 1280 px**, nas telas de avatar, situação,
retorno e encerramento — 28 medições, nenhuma com rolagem horizontal e nenhum
elemento excedendo o viewport. Alvos de toque: 56/56 com altura ≥ 44 px.

Artefatos de verificação em `../way/`:

| Arquivo | Função |
|---|---|
| `way/teste-jogo.html` | bateria de 172 verificações |
| `way/moldura.html` | medição de responsividade em viewports reais |
| `way/captura.html`, `way/captura-responsiva.html` | captura de tela por estado |
| `way/capturas/` | capturas usadas na revisão visual |
| `way/extract_docx.py` | extração do texto dos documentos de origem |
