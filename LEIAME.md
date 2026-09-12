# Ilícitos em Jogo

Jogo educativo sobre a distinção entre **conduta adequada e conduta ilícita no
dia da eleição**. O jogador cria um candidato — retrato e história — e vai
direto ao dia da eleição, decidindo o que **fazer** em seis circunstâncias. Ao
fim de cada candidatura, uma **juíza do TRE** julga as condutas que ele
escolheu. Julgando pela conduta — e não pela urna —, passa à candidatura
seguinte: de **vereador** a **deputado estadual**.

---

## Como executar

Abra `index.html` no navegador. Não há instalação, cadastro, servidor, build
nem dependência externa (RNF-02 / US-01). Todo o processamento ocorre no
dispositivo do jogador; nenhum dado é coletado ou transmitido.

---

## Os dois medidores, e por que eles não se misturam

O jogo tem uma **experiência** e um **índice de ilícitos**. Os dois acompanham
a partida, os dois mudam a cada escolha, e eles medem coisas diferentes:

| Medidor | O que mede | Quem o lê |
|---|---|---|
| **Experiência** — o XP e o nível que ele abre | a **campanha** | ninguém. É estado do candidato. |
| **Índice de ilícitos** | a **conduta** | a **juíza**, e só ela |

**A experiência nunca entra no julgamento.** Dois candidatos com experiências
opostas — um no nível 4, outro ainda no nível 1 — que escolham as mesmas
condutas cometem exatamente os mesmos ilícitos e recebem exatamente o mesmo
veredito. A bateria verifica isso com as quatro origens, jogando a carreira
inteira duas vezes por origem.

Se a experiência pesasse, o jogo ensinaria que uma campanha bem-sucedida compra
impunidade — exatamente o contrário do que ele quer ensinar.

**A campanha tem um número só.** Não há atributo, não há dado e não há dinheiro:
a conduta conforme rende experiência, o ilícito devolve, e é isso, do começo ao
fim, que faz o candidato avançar ou recuar. A ficha inteira cabe em duas linhas
no cabeçalho — quem o candidato é e em que nível ele está.

---

## A ideia do jogo

O jogo não pergunta ao jogador o que ele acha da conduta de outra pessoa.
Pergunta o que **ele faz**. Cada circunstância oferece quatro condutas, uma ou
duas delas ilícitas, e a escolha entra no **índice de ilícitos** da candidatura.
No fim da fase, a juíza lê o índice e decide pelo que ele conta:

| Ilícitos da candidatura | Desfecho |
|---|---|
| Nenhum | **Candidatura deferida** — o registro passa sem ressalva, e ela concorre |
| Um | **Candidatura deferida com advertência** — passa, e o registro do ilícito fica |
| Dois ou mais | **Candidatura indeferida** — o registro é negado, e a fase se refaz |

**O veredito é o NÚMERO DE ILÍCITOS.** Cada circunstância vale um ato, o ato é
lícito ou ilícito, e o que decide é quantos ilícitos a candidatura somou. Não é
uma soma de gravidade: uma conduta vedada e um crime valem o mesmo no registro.
E não é uma proporção: os atos lícitos não entram na conta. A regra é dita ao
jogador na tela do julgamento, com o número à vista e o limite escrito ao lado —
a conta que julga não pode ser a única coisa que o jogador não vê.

**O limite é um, e é o mesmo nas duas candidaturas.** Ele não cresce com o
cargo, e não poderia: a mensagem do jogo é que o ilícito não tem cota. O que
cresce com o cargo é a exposição — a fase 2 oferece duas condutas ilícitas por
circunstância em vez de uma, de modo que passar do limite fica mais fácil sem
que o limite se mova.

**A advertência não é um terceiro veredito.** Com um ilícito, o registro é
deferido — o mesmo veredito de sempre —, e o que fica é o **registro** do
ilícito, que a juíza lê em voz alta. O veredito é binário, e a tela não pode
apresentar a advertência como um resultado à parte.

Uma candidatura deferida **concorre**, e o resultado da urna é **sorteado**.
O sorteio não muda nada: nem a fase seguinte, nem o que o jogador aprendeu.

**É esse o ponto.** O que faz o jogador seguir de candidatura é a conduta; o
que interrompe a carreira é o ilícito. Perder uma eleição com a candidatura
limpa vale mais do que vencê-la com ilícitos no caminho.

---

## Fluxo do jogo

```
retrato  →  origem  →  circunstância 1..3  →  juíza do TRE  →  apuração  →  …
 a história  4 condutas cada                   │             (sorteio)
                                               │ indeferida
                                               ▼
                                      não se elegeu vereador
                                      → refaz a fase 1
```

**A história é a última escolha antes do dia da eleição.** Não há tela de ficha
nem evento de abertura entre ela e a primeira circunstância: escolhido o
candidato, o jogo começa.

O ciclo completo se repete na fase 2 (deputado estadual), com **duas condutas
ilícitas por circunstância** em vez de uma. A dificuldade cresce com o cargo.

---

## Estrutura

```
├── index.html              aplicação (interface e ponto de entrada)
├── css/estilo.css          estilos, temas claro e escuro, responsividade
├── js/app.js               estado, lógica, renderização e entrada
├── js/ficha.js             a experiência, os níveis e a ficha do candidato
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

A natureza também governa o que a **campanha** ganha ou perde. O sinal é a
lição: acertar soma, errar subtrai.

| Natureza | Experiência |
|---|---|
| Conforme | **+40** |
| Vedada | **−20** |
| Crime | **−40** |

O crime custa o dobro da conduta vedada, e custa o mesmo que a conduta conforme
rende — mas nada disso entra no julgamento: quem decide a candidatura é o
**índice de ilícitos**, e ele conta condutas, não pontos.

**A experiência nunca fica negativa.** Ela para em zero: um ilícito cometido por
quem já não tem o que devolver aparece na tela como "0 XP", e não como um
número negativo. O que não para é o índice — o ilícito conta, tenha havido
experiência a perder ou não.

---

## O que o jogador vê

### Na capa

Uma tela só de apresentação, antes de tudo: o jogo inteiro resumido em uma
imagem — a seção, a fila, a urna e o medalhão da Justiça —, com o título, a
pergunta que o jogo faz e a sinopse. Ela **não tem botão**: qualquer tecla,
qualquer clique e qualquer toque a dispensam e abrem a criação do personagem,
e é isso que a última linha diz.

### Na criação

Dois passos: o **retrato** (só visual, RF-14/15) e a **história** — de onde o
candidato vem. Nenhuma história é melhor que as outras, porque nenhuma delas
altera nada do jogo: o que muda é quem o jogador decide ser. Escolhida a
história, o jogo vai direto à primeira circunstância.

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
literal —, a **consequência na campanha** (a experiência que a conduta rendeu ou
devolveu, e a mudança de nível quando ela acontece), e as **quatro condutas lado
a lado**, cada uma marcada com o que era. A conduta que o jogador não escolheu é,
muitas vezes, a que ele ainda não sabe julgar.

### No julgamento

A **juíza eleitoral**, desenhada de frente na sua cadeira de rodas, no eixo do
quadro, ocupando a maior parte dele, com a bancada de audiência à frente e o
emblema do Tribunal Regional Eleitoral ao fundo. Sobre o tampo estão o processo que ela acabou de ler e a
tábua onde o martelo vai bater. De peruca branca, toga preta e o martelo
erguido, ela encara quem joga: lê o relatório, lista os ilícitos da
candidatura e decide.

---

## Editando o conteúdo (US-12)

**Todo o conteúdo jurídico e pedagógico reside em `dados/cenas.js`.**

| Bloco | O que é |
|---|---|
| `LEI` | transcrições literais dos dispositivos, citadas entre aspas nas telas |
| `AVATARES` | as opções de retrato, as cores e os três traços de desenho (`cadeirante`, `cabeloLongo`, `piercing`) |
| `FASES` | as duas candidaturas, o limite de ilícitos (`tolera`) e quantas condutas ilícitas cada circunstância tem |
| `CENAS` | as seis circunstâncias e as quatro condutas de cada uma |
| `PERGUNTAS_RESOLUCAO` | as três perguntas exibidas ao final |
| `JUIZA` | o julgamento da candidatura: a regra do veredito e os textos de cada caso |
| `SORTE` | o resultado da urna |
| `ORIGENS` | a história do candidato; só narrativa |
| `NIVEIS` | a progressão de experiência |
| `ITENS` | o que a campanha carrega no dia da eleição |
| `REGRAS` | a experiência que cada natureza rende (`REGRAS.xp`) |

Cada **conduta** declara `id`, `texto`, `natureza`, `titulo`, `justificativa`,
`baseLegal` e `textoLegal`.

**`textoLegal` não é escrita à mão.** Um trecho no fim do arquivo a monta a
partir da natureza da conduta e das transcrições de `window.LEI`. Acrescentar
uma conduta nova não corre o risco de citar o dispositivo errado — e o teste
verifica que **nenhuma citação exibida ao jogador deixa de ter origem literal
em `window.LEI`**.

---

## Decisões de projeto que não são óbvias

**Dois medidores, e eles não se comunicam.** A experiência mede a campanha; o
índice mede a conduta. Misturá-los faria parecer que cometer um ilícito é só
perder pontos de campanha. Eles têm lugares distintos no cabeçalho, cores
distintas e públicos distintos: a ficha não julga ninguém.

**A simplificação é o ponto, e ela tem uma direção.** A versão anterior tinha
atributos, dado de vinte faces, legitimidade, caixa e eventos de campanha. O
público-alvo é o estudante do ensino médio da rede pública, e cada camada a mais
era uma camada a mais para aprender antes de chegar ao que o jogo quer ensinar.
O que sobrou é o que ensina: a **conduta**, o **índice** que a conta e a
**experiência** que ela move. Tudo o mais saiu — e o que saiu não deixou buraco,
porque nada do que ficou dependia dele.

**A sorte não decide nada, e isso é dito ao jogador.** O resultado da urna é
sorteado de propósito, e a nota ao pé da apuração explica por quê. Se o sorteio
decidisse a progressão, o jogo ensinaria o contrário do que quer ensinar.

**O índice é da candidatura, não da pessoa.** Cada fase é uma candidatura, e
cada candidatura responde pelos próprios ilícitos — por isso o índice zera ao
abrir a fase seguinte. O acumulado da carreira aparece no encerramento.

**Refazer a fase devolve a campanha e zera o índice.** A candidatura indeferida
é refeita do zero: não é uma segunda chance sobre uma campanha já desgastada,
é a mesma candidatura, de novo, com o jogador sabendo o que não sabia. A
experiência volta ao que era, e o índice volta a zero junto. O que não volta
atrás é a lição — a fundamentação de cada escolha continua na tela de derrota.

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

**A juíza é desenhada de frente, e a bancada fica à frente dela.** Ela é a
cena, e não um detalhe dela: por isso está no eixo do quadro, encarando quem
joga, e a mesa está no mesmo eixo, com o processo e a tábua sobre o tampo.
A cadeira de rodas é parte de quem ela é, e não um detalhe a esconder: mesa
tem vão. O desenho da bancada vem *depois* do desenho da figura, então o tampo
tapa a faixa do colo dela — mas sob o tampo a cadeira continua à vista, com o
apoio de pé e os rodízios passando entre as pernas. Fechar esse vão com um
painel esconderia a cadeira inteira, e é justamente o que não se quer. De
frente a cadeira se lê pelas duas rodas ladeando o corpo, pelos rodízios e
pela tábua do apoio de pé. A roda vista de frente é uma elipse estreita e sem
raios — de frente os raios não apareceriam, e desenhá-los faria a roda voltar
a parecer de perfil. Ela é desenhada em três camadas — cadeira de trás, juíza,
cadeira da frente —, porque sem essa separação ou a roda cobre o colo dela, ou
o assento some atrás do corpo. Os empurradores, que de frente ficam atrás dos
ombros, não são desenhados: viram duas borrachas escuras coladas na peruca.

**O tamanho dela no quadro tem um teto, e o teto é aritmético.** A juíza, a
cadeira e a bancada formam **um só grupo**, escalado a partir do chão: o que
cresce é o sujeito inteiro, e a bancada continua na cintura dela porque cresce
junto. O ponto mais alto da figura é a cabeça do martelo erguido, 240 unidades
acima do chão, e ele não pode bater no topo do quadro. Com a escala em **1,38**
ele para em y=13, com 12 de folga; em 1,45 seria cortado. Não há como aumentar
muito mais sem fechar o enquadramento — e fechar o enquadramento custaria o
emblema, a placa e a estante, que é o preço que este desenho não paga.

Estar num só grupo também tirou uma conta frágil: a tábua sob o martelo era
posicionada por `EIXO - 44 * 1.24`, com a escala escrita à mão dentro da
coordenada. Toda vez que a figura crescesse, a tábua sairia de baixo do martelo
em silêncio. Dentro do grupo ela está em `x=-44`, a mesma unidade do martelo, e
as pernas da bancada descem até `y=0`, que é o chão do grupo. As prateleiras da
estante encurtaram de 160 para 112: a quina do tampo subiu de 190 para 141, e as
prateleiras têm de acabar antes dela.

**O traje é do ofício; a cadeira e as feições são dela.** A peruca branca, a
toga preta e o martelo dizem o que ela faz; a cadeira de rodas, a orelha, o
brinco e o rosto dizem quem ela é. O traje veio depois e não pode ter custado
nenhum dos dois: por isso os cachos da peruca param antes da orelha, e a
orelha e o brinco são desenhados por cima dela. Pelo mesmo motivo a canela sai
em `COR.calca` e não em preto, e as pregas da toga são claras: sobre o preto, o
vinco que se lê é a luz que bate na dobra, não a sombra que ela faz.

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

### O indeferimento — e o que o jogo comprime

No jogo, **o número de ilícitos decide automaticamente**: cada circunstância vale
um ato, e dois ilícitos bastam para indeferir a candidatura — mesmo que os atos
lícitos sejam maioria. Na lei, essa automaticidade não existe:

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
transcrição próprias.

**A bateria que conferia o conteúdo jurídico não está mais no repositório.**
Havia um `way/teste-conteudo.js` que comparava as cinco transcrições literais de
`window.LEI` contra uma referência congelada e verificava que nenhuma citação
entre aspas havia sido inventada. Ele foi perdido, e o que era verificado por
ele **hoje não é verificado por nada** — as duas afirmações abaixo são registro
do que valia então, e não garantia desta versão:

1. As cinco transcrições literais de `window.LEI` eram byte a byte as mesmas da
   referência.
2. Nenhuma citação entre aspas foi inventada: toda `textoLegal` continha,
   literalmente, um dos dispositivos de `window.LEI`.

Reconstruir essa conferência é o primeiro item da fila antes da publicação.

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
4. **O limite de um ilícito, e não o peso da conduta** é decisão de produto:
   três circunstâncias iguais, valendo um ato cada, e uma candidatura com uma
   única conduta ilícita ainda concorre — com advertência. Vale conferir se é a
   mensagem desejada.
5. **O indeferimento automático** é compressão declarada, não direito vigente.

---

---

## Verificação

Tudo o que se segue roda em **node**, sem navegador e sem dependência externa.
Os scripts moram em `way/` — que é a pasta dos meios, não do jogo.

### A regra do veredito — `way/verificar-veredito.js`

**920 conferências, 128 combinações de escolha, nenhuma divergência.** A bateria
enumera exaustivamente as escolhas das duas fases (4³ = 64 em cada, 128 no
total) e confere, combinação a combinação:

- que `indeferida` é verdadeiro exatamente quando o número de ilícitos **passa
  do limite** — e não quando supera o número de lícitos, que era a regra antiga;
- que a soma de ilícitos e lícitos bate com o número de circunstâncias;
- que a declaração `tolera` de cada fase concorda com o limite do jogo;
- que o bloco de texto escolhido (`semIlicito`, `umIlicito` ou
  `doisOuMaisIlicitos`) declara o veredito que a conta manda;
- que o jogo aceita os próprios dados — a mesma `conferirAmbiente()` que roda
  antes de o jogo abrir na mão do jogador.

```
node way/verificar-veredito.js
→ divergências: nenhuma
→ conferências: 920
→ combinações de escolha percorridas: 128 (2 fases)
→ vereditos: 86 deferidas · 42 indeferidas
→ textos: 35 sem ilícito · 51 com um ilícito · 42 com dois ou mais
```

### A tela do julgamento — `way/jogar-julgamento.js`

**238 conferências, 8 partidas jogadas até a juíza, nenhuma divergência.** Esta
bateria dirige o jogo de verdade pelos ganchos de `window.JOGO` — da capa à
juíza, circunstância por circunstância — e lê o HTML que cada desfecho escreveu,
procurando o que o jogador veria se algo tivesse quebrado: `undefined`, `NaN`,
`[object Object]`, contagem que não bate com o veredito, regra ausente, os dois
vereditos ao mesmo tempo, ou um terceiro veredito inventado para a advertência.

Cada fase é jogada com quatro planos — nenhum ilícito, exatamente um, dois, e
todos — e cada plano confere também o que **não** pode estar na tela: os atos
lícitos e a palavra "maioria" voltariam a ensinar a regra antiga.

Confere ainda o que vem depois do julgamento: candidatura deferida segue para a
apuração e a urna; indeferida encerra a candidatura.

```
node way/jogar-julgamento.js
→ divergências: nenhuma
→ conferências: 238
→ partidas jogadas até a juíza: 8
```

### As ilustrações — `way/checar-ilustracoes.js` e `way/verificar-avatares.js`

`checar-ilustracoes.js` desenha **as seis chaves de cena** e o retrato de cada um
dos **quatro avatares**, e reprova qualquer desenho curto demais ou que saia com
`NaN` ou `undefined` no SVG. É ele que pega uma chave órfã: uma `ilustracao`
citada em `dados/cenas.js` que ninguém desenha.

`verificar-avatares.js` gera as prévias em HTML — os retratos, os rostos
ampliados e as seis cenas por avatar — para a conferência visual.

```
node way/checar-ilustracoes.js
→ chaves de ilustração: broche, distribuicao, camiseta, portamalas, abordagem, bandeira
→ desenhos ruins: nenhum
→ cena da juíza: 7743 bytes
→ retratos conferidos: 4
```

### A tela da juíza, medida — `way/medir-juiza.js`

A pergunta que a aritmética do CSS não responde: "a juíza sai pequena na tela, e
quanto exatamente?". O script lê o `index.html`, corrige os caminhos relativos,
injeta um roteiro que dirige o jogo real até o julgamento pelos ganchos de
`window.JOGO`, e abre a cópia no Chrome headless para medir o que o navegador
desenhou. `way/renderizar-juiza.js` faz o mesmo com a ilustração isolada.

```
node way/medir-juiza.js [largura]     (padrão: 1280)
```

### O jogo dirigido por script — `way/teste-avatares.html`

O jogo real, no navegador, pilotado por parâmetros na URL:

| Parâmetro | Efeito |
|---|---|
| `?avatar=av2` | escolhe quem joga — é o que permite conferir o protagonista cadeirante nas seis cenas |
| `?ate=N` | para no passo N, para fotografar cada tela da criação |
| `?capa=clique` | sai da capa pelo toque em vez da tecla |

`way/teste-capa.html` responde a uma pergunta separada: **quais teclas dispensam
a capa e quais não**. Shift e F5 ficam; "a" sai. `way/jogar-avatares.html` joga a
carreira inteira uma vez por avatar.

### O que nenhuma bateria prova

Que a **classificação das 24 condutas** está certa. Elas provam que o veredito
decorre da contagem — não que a contagem decorra da lei.

### O portão do acaso, medido

Escolhendo **sempre a primeira posição exibida** — a estratégia que não lê nada —
a chance de ser indeferido é:

| Fase | Condutas ilícitas por cena | Reprova por escolha cega |
|---|---|---|
| Fase 1 (vereador) | 1 em 4 | **~15,6%** |
| Fase 2 (deputado estadual) | 2 em 4 | **~50%** |

Os números são exatos, e não medidos: com três circunstâncias e uma conduta
ilícita entre quatro, a chance de acumular dois ilícitos é de 10/64; com duas
entre quatro, de 1/2.

**A regra nova não mudou esse portão, e é importante dizê-lo.** Com três atos,
"dois ou mais ilícitos" e "mais ilícitos que lícitos" são a mesma coisa — as duas
contas coincidem aqui. O que a mudança fez foi outra coisa: tirou a regra da
aritmética da proporção e a pôs num **limite declarado**, que não depende de
quantas circunstâncias a fase tem. Se uma fase futura tiver um número par de
atos, ela passa a ter um veredito definido — pela regra antiga, empatada, ela
não tinha.

O que o jogo **garante** é que a posição da conduta ilícita varia a cada partida,
de modo que nenhuma posição é gabarito. O que ele **não** garante é que a
escolha cega reprove.

---

## Artefatos de uma versão anterior

Estes arquivos descrevem o **evento de campanha**, que não existe mais. Ficaram
para trás e precisam ser removidos: `way/verificar-eventos.js`,
`way/moldura-evento.html`, `way/previa-evento-ev1.html`,
`way/previa-evento-ev1-cadeirante.html`, `way/previa-evento-ev2.html`,
`way/previa-evento-ev2-cadeirante.html` e `way/jogo-evento.png`.
