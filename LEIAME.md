# Ilícitos em Jogo

Jogo educativo sobre a distinção entre **conduta adequada e conduta ilícita no
dia da eleição**. O jogador cria um personagem de RPG — retrato e origem —,
conduz a campanha pelo evento de abertura de cada fase, e atravessa o dia da
eleição decidindo o que **fazer** em seis circunstâncias. Ao fim de cada
candidatura, uma **juíza do TRE** julga as condutas que ele escolheu. Julgando
pela conduta — e não pela urna —, passa à candidatura seguinte: de **vereador**
a **deputado estadual**.

---

## Como executar

Abra `index.html` no navegador. Não há instalação, cadastro, servidor, build
nem dependência externa (RNF-02 / US-01). Todo o processamento ocorre no
dispositivo do jogador; nenhum dado é coletado ou transmitido.

---

## Os dois medidores, e por que eles não se misturam

O jogo tem uma **ficha de RPG** e um **índice de ilícitos**. Os dois acompanham
a partida, os dois mudam a cada escolha, e eles medem coisas diferentes:

| Medidor | O que mede | Quem o lê |
|---|---|---|
| **Ficha** — nível, atributos, legitimidade, caixa | a **campanha** | ninguém. É estado do personagem. |
| **Índice de ilícitos** | a **conduta** | a **juíza**, e só ela |

**A ficha nunca entra no julgamento.** Dois candidatos com fichas opostas — um
com Discernimento 4 e R$ 120, outro com Discernimento 1 e R$ 260 — que escolham
as mesmas condutas cometem exatamente os mesmos ilícitos e recebem exatamente o
mesmo veredito. A bateria verifica isso com as quatro origens, jogando a
carreira inteira duas vezes por origem.

Se a ficha pesasse, o jogo ensinaria que prestígio, dinheiro ou instrução
compram impunidade — exatamente o contrário do que ele quer ensinar.

---

## A ideia do jogo

O jogo não pergunta ao jogador o que ele acha da conduta de outra pessoa.
Pergunta o que **ele faz**. Cada circunstância oferece quatro condutas, uma ou
duas delas ilícitas, e a escolha entra no **índice de ilícitos** da candidatura.
No fim da fase, a juíza lê o índice:

| Ilícitos na candidatura | Desfecho |
|---|---|
| Nenhum | **Candidatura deferida** — concorre sem ressalva |
| Um | **Deferida com advertência** — concorre, e o registro fica |
| Dois ou mais | **Impugnada** — não disputa a eleição, e a fase se refaz |

Uma candidatura deferida **concorre**, e o resultado da urna é **sorteado**.
O sorteio não muda nada: nem a fase seguinte, nem o que o jogador aprendeu.

**É esse o ponto.** O que faz o jogador seguir de candidatura é a conduta; o
que interrompe a carreira é o ilícito. Perder uma eleição com a candidatura
limpa vale mais do que vencê-la com ilícitos no caminho.

---

## Fluxo do jogo

```
CAPA → retrato → origem → ficha → EVENTO (d20) → circunstância 1..3 → juíza do TRE → apuração → …
qualquer                          (a reta final)   (4 condutas)        (sorteio)      │
tecla                                                                                  │ impugnada
                                                                                       ▼
                                                                              não se elegeu vereador
                                                                              → refaz a fase 1
```

O ciclo completo se repete na fase 2 (deputado estadual), com **duas condutas
ilícitas por circunstância** em vez de uma. A dificuldade cresce com o cargo.

---

## Estrutura

```
jogo_rpgs/
├── index.html              aplicação (interface e ponto de entrada)
├── css/estilo.css          estilos, temas claro e escuro, responsividade
├── js/app.js               estado, lógica, renderização e entrada
├── js/ficha.js             ★ CAMADA DE RPG — ficha, atributos, níveis e o d20
├── js/ilustracoes.js       ilustrações SVG, incluindo a juíza e a cadeira
└── dados/cenas.js          ★ ARQUIVO DE DADOS — todo o conteúdo
```

---

## As três naturezas de uma conduta

O jogo distingue três coisas, e a distinção não é decorativa:

| Natureza | O que é | Dispositivo |
|---|---|---|
| `conforme` | Conduta adequada | Art. 39-A, *caput* — a lei **permite** |
| `crime` | Crime eleitoral | Art. 39, § 5º — a lei **pune** |
| `vedacao` | Conduta vedada, **sem natureza penal** | Art. 39-A, § 1º — a lei **veda** |

**O § 1º do art. 39-A diz "É vedada", e não "constitui crime".** Tratar as duas
coisas como a mesma ensinaria que toda irregularidade eleitoral é crime, o que
não é verdade. As duas contam no índice — as duas são ilícitas —, mas o retorno
diz **qual** das duas o jogador cometeu, e o bloco de equívoco muda de cor
conforme a natureza.

A natureza também governa o que a **campanha** ganha ou perde:

| Natureza | Experiência | Legitimidade |
|---|---|---|
| Conforme | +40 | +12 |
| Vedada | +25 | −8 |
| Crime | +15 | −15 |

A conduta conforme rende mais que a criminosa — porque o que se aprende
errando não pode valer tanto quanto o que se acerta.

---

## O que o jogador vê

### Na capa

Uma tela só de apresentação, antes de tudo: o jogo inteiro resumido em uma
imagem — a seção, a fila, a urna e o medalhão da Justiça —, com o título, a
pergunta que o jogo faz e a sinopse. Ela **não tem botão**: qualquer tecla,
qualquer clique e qualquer toque a dispensam e abrem a criação do personagem,
e é isso que a última linha diz.

### Na criação

Três passos: o **retrato** (só visual, RF-14/15), a **origem** (distribui os
mesmos nove pontos entre os quatro atributos, de modo que nenhuma seja a
melhor) e a **ficha** pronta.

### No evento de campanha

A narração de abertura, duas **abordagens** — cada uma cobrando um atributo — e
a rolagem de **d20**. Crítico no 20 natural, desastre no 1. As duas abordagens
são lícitas e nenhuma é uma circunstância de jogo: são decisões de logística de
campanha, e é por isso que podem ser resolvidas por dado.

### Na circunstância

A ilustração do dia da eleição, o contexto em segunda pessoa, o inventário do
dia, e as **quatro condutas** — descritas como ações, na primeira pessoa. Não
há rótulos de veredito ("Permitido", "É crime"): a pergunta é *"O que você
faz?"*.

A **ordem das quatro condutas é sorteada a cada circunstância.** O arquivo de
dados agrupa as conformes antes das ilícitas; exibi-las como estão faria da
posição um gabarito. As teclas 1 a 4 acompanham a posição exibida.

### No retorno

A fundamentação da conduta escolhida — justificativa, base legal e transcrição
literal —, a **consequência na campanha** (com os deltas aplicados à ficha), e
as **quatro condutas lado a lado**, cada uma marcada com o que era. A conduta
que o jogador não escolheu é, muitas vezes, a que ele ainda não sabe julgar.

### No julgamento

A **juíza eleitoral**, desenhada em perfil na sua cadeira de rodas, diante da
mesa de audiência e do emblema do Tribunal Regional Eleitoral. Ela lê o
relatório, lista os ilícitos da candidatura e decide.

---

## Editando o conteúdo (US-12)

**Todo o conteúdo jurídico e pedagógico reside em `dados/cenas.js`.**

| Bloco | O que é |
|---|---|
| `LEI` | transcrições literais dos dispositivos, citadas entre aspas nas telas |
| `AVATARES` | as opções de retrato, as cores e os três traços de desenho (`cadeirante`, `cabeloLongo`, `piercing`) |
| `FASES` | as duas candidaturas, a tolerância a ilícitos e quantas condutas ilícitas cada circunstância tem |
| `CENAS` | as seis circunstâncias e as quatro condutas de cada uma |
| `PERGUNTAS_RESOLUCAO` | as três perguntas exibidas ao final |
| `JUIZA` | o julgamento da candidatura, com os três desfechos |
| `SORTE` | o resultado da urna |
| `ATRIBUTOS` | os quatro traços do candidato |
| `ORIGENS` | de onde o candidato vem; define atributos e caixa inicial |
| `NIVEIS` | a progressão de experiência |
| `ITENS` | o que a campanha carrega no dia da eleição |
| `EVENTOS` | os eventos de campanha, resolvidos por d20; cada abordagem declara a `cena` que a desenha |
| `REGRAS` | os números que governam a camada de RPG |

Cada **conduta** declara `id`, `texto`, `natureza`, `titulo`, `justificativa`,
`baseLegal` e `textoLegal`.

**`textoLegal` não é escrita à mão.** Um trecho no fim do arquivo a monta a
partir da natureza da conduta e das transcrições de `window.LEI`. Acrescentar
uma conduta nova não corre o risco de citar o dispositivo errado — e o teste
verifica que **nenhuma citação exibida ao jogador deixa de ter origem literal
em `window.LEI`**.

---

## Decisões de projeto que não são óbvias

**Dois medidores, e eles não se comunicam.** A ficha mede a campanha; o índice
mede a conduta. Misturá-los faria parecer que cometer um ilícito é só perder
pontos de campanha. Eles têm lugares distintos no cabeçalho, cores distintas e
públicos distintos: a ficha não julga ninguém.

**A sorte não decide nada, e isso é dito ao jogador.** O resultado da urna é
sorteado de propósito, e a nota ao pé da apuração explica por quê. Se o sorteio
decidisse a progressão, o jogo ensinaria o contrário do que quer ensinar.

**O índice é da candidatura, não da pessoa.** Cada fase é uma candidatura, e
cada candidatura responde pelos próprios ilícitos — por isso o índice zera ao
abrir a fase seguinte. O acumulado da carreira aparece no encerramento.

**Refazer a fase devolve a campanha e zera o índice.** A candidatura impugnada
é refeita do zero: não é uma segunda chance sobre uma campanha já desgastada,
é a mesma candidatura, de novo, com o jogador sabendo o que não sabia. O
evento de campanha é resorteado junto. O que não volta atrás é a lição — a
fundamentação de cada escolha continua na tela de derrota.

**O desenho nunca revela a resposta.** As quatro condutas de uma circunstância
usam as mesmas cores de figura, fundo e vestuário na ilustração.

**A capa não tem botão, e isso é a decisão, não a falta dela.** Uma tela de
abertura com um botão "Começar" pede uma mira que a tela ainda não ensinou: o
jogador chega sem saber onde clicar. Qualquer tecla e qualquer toque servem —
inclusive Tab e Esc —, e o cabeçalho fica escondido nela, porque contador,
trilha, ficha e índice só passam a dizer a verdade depois que existe um
personagem. Na capa o candidato também não é desenhado: quem chega ainda não
escolheu retrato, e desenhar um avatar antes da escolha seria dizer que já
existe um personagem.

**O evento tem imagem, e ela traz as DUAS abordagens.** A imagem do evento não
descreve o que aconteceu — não há veredito a preservar, porque as duas
abordagens são lícitas. Ela desenha as duas conduções da reta final lado a
lado, cada painel com o número da opção, os mesmos números das teclas e dos
botões logo abaixo: a escolha passa a ser feita sobre o que se vê e não só
sobre o que se lê. Depois de escolhida, o painel tomado fica aceso e o outro
recebe um véu, para que o jogador continue sabendo em qual das duas cenas está.

**A imagem do evento não põe o candidato em cima da cadeira.** A opção 1 do
primeiro evento é "subir na cadeira e falar de cabeça", e desenhá-la ao pé da
letra deixaria de fora todo avatar cadeirante — a cadeira de rodas que o
jogador escolheu no passo 1 tem de caber também aqui. O painel mostra o que a
opção cobra (falar sem papel na mão, para a sala inteira) e não o COMO da fala,
que é o detalhe que excluiria alguém.

**A juíza é desenhada em perfil, e não atrás de uma bancada.** A cadeira de
rodas é parte de quem ela é, e não um detalhe a esconder. Ela é desenhada em
três camadas — cadeira de trás, juíza, cadeira da frente —, porque sem essa
separação ou a roda cobre o colo dela, ou o assento some atrás do corpo.

**O protagonista cadeirante também é desenhado em camadas — e de frente.** O
avatar de cadeira de rodas é o único que encara o jogador sentado, e a cadeira
dele é desenhada em volta do MESMO tronco, dos mesmos braços e da mesma cabeça
de qualquer outro avatar. Só as pernas dão lugar ao assento. É o que mantém o
broche, a camiseta e o santinho das cenas caindo sobre o corpo, e é o que
permite trocar um avatar por outro sem tocar em nenhuma cena.

**O piercing existe no retrato, e não na cena.** O rosto das figuras das cenas
não tem traço nenhum — nem olhos, nem boca —, e uma argola solta em pele nua
não lê como piercing: lê como borrão. Ele fica no retrato, o único rosto
desenhado do jogo, onde olhos e sorriso lhe dão a altura em que precisa estar.

**A nota de honestidade intelectual fica visível ao jogador.** O jogo comprime
o rito da impugnação para caber numa tela, e diz isso na própria tela, com as
referências corretas.

**Correção de um defeito herdado.** O atributo `hidden` do HTML vale
`display:none` apenas pela folha do navegador. Qualquer regra de autor com
`display` — `.trilha{display:flex}`, `.ficha{display:grid}` — vence essa folha,
e o elemento "escondido" continuava na tela. A folha agora traz
`[hidden]{display:none !important}`.

---

## Fundamentação normativa

Lei nº 9.504, de 30 de setembro de 1997 (Lei das Eleições). As transcrições
exibidas ao jogador são literais e residem em `window.LEI`, no topo de
`dados/cenas.js`.

**Art. 39-A, caput** — a manifestação individual e silenciosa da preferência do
eleitor, *permitida* pelo uso de bandeiras, broches, dísticos e adesivos. A
palavra do dispositivo é "permitida", e é ela que sustenta a RN-01: trata-se de
permissão legal expressa, não de tolerância.

**Art. 39-A, § 1º** — veda a aglomeração de pessoas com vestuário padronizado
capaz de caracterizar manifestação coletiva. É o dispositivo das condutas
**vedadas** — inclusive porque diz "É vedada", e não "constitui crime".

**Art. 39, § 5º, II** — arregimentação de eleitor ou propaganda de boca de urna.
A distribuição de material é crime de **mera conduta**: consuma-se com a
entrega, sem exigir coerção sobre o eleitor.

**Art. 39, § 5º, III** — divulgação de qualquer espécie de propaganda de
partidos políticos ou de seus candidatos.

Duas precisões incorporadas ao conteúdo:

- **Porte não é distribuição — e o fundamento não é a proporcionalidade.** A
  conclusão repousa na **atipicidade da conduta** e na exigência de prova da
  efetiva entrega, vedada a imputação objetiva. A proporcionalidade incide na
  dosimetria da multa, não na tipicidade.
- **A circunstância sem resposta fechada não é ausência de resposta jurídica.**
  Há divergência sobre o enquadramento entre os incisos II e III em casos de
  fronteira; o núcleo, porém, está assentado — a manifestação deixa de ser
  silenciosa quando se dirige a alguém. O jogo declara a divergência.

### A impugnação — e o que o jogo comprime

No jogo, **dois ilícitos impugnam a candidatura automaticamente**. Na lei, essa
automaticidade não existe:

- A **ação de impugnação de registro de candidatura (AIRC)** está no **art. 3º
  da Lei Complementar nº 64/90**, com prazo de 5 dias da publicação do edital e
  legitimados próprios. Qualquer cidadão no gozo dos direitos políticos pode dar
  **notícia de inelegibilidade**, na forma do **art. 97, § 3º, do Código
  Eleitoral**.
- A **inelegibilidade por condenação criminal por crime eleitoral** está no
  **art. 1º, I, "e", da LC 64/90**, e exige **condenação** — em decisão
  colegiada ou transitada em julgado —, não a mera prática da conduta. É também
  a esse título que incide o **art. 15, III, da Constituição**.
- O **art. 15 da LC 64/90** só produz os efeitos de negar o registro, cancelar
  o já feito ou anular o diploma depois do trânsito em julgado ou da publicação
  de decisão colegiada.

Ou seja: **um candidato que praticou a conduta, mas ainda não foi condenado em
decisão colegiada, não está automaticamente inelegível.** O jogo comprime esse
caminho e **declara a compressão ao jogador**, na nota ao pé do julgamento.

**Os dispositivos acima são citados por referência, sem transcrição entre
aspas**, porque não foram conferidos literalmente contra o texto oficial. É a
mesma regra que governa `window.LEI`.

---

## ⚠ Pendência bloqueante de publicação (RN-05)

**A classificação das condutas ainda NÃO foi submetida à revisão de
profissional com formação em Direito Eleitoral.** Essa revisão é condição
necessária à publicação, nos termos da regra RN-05.

O risco é simétrico: uma conduta mal classificada ensina o erro com a mesma
eficácia com que ensinaria o acerto. Enquanto a revisão não ocorrer, o material
deve ser tratado como **versão de demonstração**.

**A aplicação não exibe esse aviso.** A pedido, o rodapé foi removido de
`index.html`. A pendência continua registrada aqui; o jogador, porém, já não é
avisado por ela. A nota sobre a compressão do rito da impugnação, essa,
continua visível na tela do julgamento, porque é conteúdo, e não aviso
institucional.

### O alcance da pendência, nesta versão

São **24 condutas** a conferir, cada uma com justificativa, base legal e
transcrição próprias — o dobro da exposição da versão com uma conduta por cena.
Duas coisas estão verificadas automaticamente:

1. **As cinco transcrições literais de `window.LEI` são byte a byte as mesmas
   da referência.**
2. **Nenhuma citação entre aspas foi inventada**: toda `textoLegal` exibida
   contém, literalmente, um dos dispositivos de `window.LEI`.

O que **não** está verificado, e é o que a RN-05 exige: **se cada uma das 24
condutas está corretamente classificada** como conforme, crime ou vedada.

**Nenhum dos 23 textos da versão anterior sobreviveu literalmente.** A
reformulação trocou o formato — de "julgue esta conduta" para "escolha a sua
conduta" — e reescreveu toda a prosa. A substância das precisões foi preservada
(a atipicidade do porte isolado, a responsabilidade penal pessoal, a divergência
de enquadramento), mas **a revisão de texto que houvesse sido feita sobre a
prosa anterior não se transfere**. Ela precisa ser refeita junto com a
classificação.

### Ressalvas conhecidas, para a revisão

1. **A circunstância da calçada** é a de fronteira.
2. **A caixa no porta-malas** depende de o material estar de fato lacrado e não
   distribuído.
3. **O cabo eleitoral na fila** atribui à campanha a responsabilidade pela
   conduta de um terceiro — ponto sensível, que pede conferência.
4. **A tolerância de um ilícito** é decisão de produto: uma candidatura com uma
   conduta ilícita ainda se elege. Vale conferir se é a mensagem desejada.
5. **A impugnação automática** é compressão declarada, não direito vigente.

---

## Verificação

### Conteúdo jurídico — `way/teste-conteudo.js`

**42 comparações**: as cinco transcrições literais, a origem de todas as 24
citações, e a estrutura que não podia mudar (avatares, perguntas, identificação
das fases e das circunstâncias).

```
node way/teste-conteudo.js
→ comparações: 42
→ conteúdo jurídico fiel à referência; nenhuma citação inventada
```

**A referência é um snapshot congelado.** Em 2026-09-11, às 22:57 — durante o
trabalho —, `jogo/dados/cenas.js` foi reescrito por outra origem e passou a usar
um modelo diferente de mecânica. Comparar contra um alvo que se move não
verifica nada. A referência é `way/referencia-cenas.js`, cópia byte a byte do
conteúdo de origem, com o hash conferido a cada execução.

### Bateria em navegador real — `way/teste-conduta.html`

**146 verificações** em Chrome headless, carregando os mesmos arquivos do
`index.html`, na mesma ordem, sobre a mesma estrutura de DOM.

Cobrem: integridade referencial do arquivo de dados; os três passos da criação;
o evento de campanha ponta a ponta com o dado controlado; a aplicação e a
exibição dos efeitos na ficha; a subida do índice e seus três estados; os três
desfechos do julgamento; a impugnação nas duas fases; o restauro da ficha **e**
do índice ao refazer a fase; a reentrância da entrada; o teclado; o reinício; a
responsividade; e ausência de erros no console.

**As invariantes centrais são verificadas por força bruta:**

- **A urna não decide a progressão.** A mesma candidatura limpa é jogada com a
  urna forçada para vitória e para derrota; nas duas, o jogo segue de fase.
- **A ficha não decide o julgamento.** As quatro origens jogam a carreira
  inteira duas vezes cada — uma escolhendo sempre conforme, outra sempre
  ilícita — e as quatro produzem exatamente os mesmos ilícitos, cena a cena.
- **A ficha reage à conduta.** Com o dado do evento congelado, a carreira limpa
  termina com mais legitimidade e mais experiência que a carreira ilícita. Se
  não reagisse, a camada de RPG seria decorativa.
- **A posição não é gabarito.** A conduta ilícita aparece nas quatro posições ao
  longo de 60 partidas.

### Responsividade — `way/moldura-conduta.html`

A bateria inteira roda **dentro de um iframe por largura**. O motivo é
concreto: o headless do Chrome no Windows não respeita `--window-size` abaixo
de 500px — pedir 320 devolve 500, e a medição mentiria sem avisar.

Larguras medidas: **320, 360, 390, 414, 768, 1024 e 1280 px** — **144/144 nas
sete**, nenhuma com rolagem horizontal e nenhum elemento excedendo o viewport.
O relatório confere a largura que cada bateria informou contra a largura
pedida: se o iframe não tivesse recebido a largura certa, a linha seria marcada
como medição inválida em vez de aprovada.

**Por que 144 e não 146:** as duas asserções sobre a taxa de aprovação por
escolha aleatória só são feitas quando a amostra as sustenta. Dentro da moldura
a bateria roda sete vezes, e 150 partidas por fase em cada quadro custaria
minutos sem acrescentar nada à medição de responsividade — então a amostra cai
para 10, e as duas afirmações viram medida. O relatório imprime o total que
efetivamente rodou, em vez de um número fixo que poderia estar errado.

### O portão é mais fraco que o da primeira versão — medido

A versão original garantia, por construção, que **nenhuma** estratégia de
resposta repetida aprovava uma fase. O formato novo não tem essa garantia, e a
bateria **mede** em vez de presumir. Escolhendo sempre a **primeira posição
exibida**, em cinco rodadas de 150 partidas por fase:

| Fase | R1 | R2 | R3 | R4 | R5 |
|---|---|---|---|---|---|
| Fase 1 (1 ilícita em 4, tolerância 1) | 87% | 85% | 89% | 83% | 87% |
| Fase 2 (2 ilícitas em 4, tolerância 1) | 50% | 49% | 52% | 53% | 47% |

O número decorre da aritmética das escolhas feitas: com uma conduta ilícita
entre quatro e três circunstâncias, a chance de acumular dois ilícitos é de
cerca de 16%; com duas entre quatro, de cerca de 50%. O que o jogo **garante**
é outra coisa, e está verificado de forma determinística: **a posição da
conduta ilícita varia a cada partida**, de modo que nenhuma posição é gabarito.
O que ele **não** garante é que a escolha aleatória reprove — e ela passa com
uma frequência que a versão original não permitia.

Baixar a tolerância para zero (um ilícito já impugna) levaria a reprovação por
escolha aleatória a cerca de 58% na fase 1 e 88% na fase 2, sem tocar em mais
nada. **É decisão de produto, e está registrada aqui para ser tomada com o
número à vista.**

### Revisão visual — `way/captura-jogo.html` e `way/capturas-jogo/`

Dezesseis telas capturadas nos **dois temas**.

Os avatares têm a sua própria revisão, feita quando os dois retratos novos
entraram. Ela existe porque uma ilustração de cena é pequena: uma cadeira de
rodas que só se reconhece ampliada não serve.

| Arquivo | Função |
|---|---|
| `way/teste-conteudo.js` | transcrições, origem das citações e estrutura fixa |
| `way/referencia-cenas.js` | snapshot congelado do conteúdo de origem |
| `way/teste-conduta.html` | bateria de 146 verificações |
| `way/moldura-conduta.html` | a bateria inteira em viewports reais, por iframe |
| `way/captura-jogo.html` | captura de tela por estado, nos dois temas |
| `way/capturas-jogo/` | capturas |
| `way/verificar-avatares.js` | prévias dos retratos e das cenas, no tamanho real e ampliados |
| `way/verificar-eventos.js` | prévias da imagem dos eventos, com e sem escolha feita, e o conferidor de chaves órfãs |
| `way/teste-avatares.html` | o jogo real dirigido por script — `?avatar=av2` escolhe quem joga, `?ate=N` para o piloto no passo N, `?capa=clique` sai da capa pelo toque em vez da tecla |
| `way/moldura-evento.html` | a tela da capa e a do evento medidas em viewports reais, por iframe — `?w=320&ate=0` |
| `way/capa-tema-claro.js` | monta o jogo no tema claro, que o headless não alcança por flag |
| `way/teste-capa.html` | quais teclas dispensam a capa e quais não — Shift e F5 ficam, "a" sai |
| `way/previa-*.html`, `way/jogo-*.png`, `way/capa-*.png`, `way/retrato-grande-*.png` | as prévias e as capturas, nos dois temas |
| `way/verificacao.txt` | registro da última execução |
| `way/teste-jogo.html`, `way/moldura.html`, `way/capturas/` | verificação da versão original, preservada |
| `way/rpg-arquivado/` | a edição intermediária, guardada para consulta |
