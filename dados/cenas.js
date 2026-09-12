/* =============================================================================
 * ARQUIVO DE DADOS — US-12
 * -----------------------------------------------------------------------------
 * Todo o conteúdo jurídico e pedagógico do jogo reside AQUI.
 * Alterar este arquivo altera o jogo, sem tocar em uma linha de código.
 *
 * ESTRUTURA DO JOGO
 *   AVATARES  o jovem candidato escolhido pelo jogador
 *   FASES     as duas candidaturas, com a tolerância a ilícitos de cada uma
 *   CENAS     as seis circunstâncias do dia da eleição
 *   PERGUNTAS_RESOLUCAO  as três perguntas exibidas ao final
 *   JUIZA     o julgamento da candidatura ao fim de cada fase
 *   SORTE     o resultado da urna, que não decide a progressão
 *
 * COMO A CENA FUNCIONA
 * -----------------------------------------------------------------------------
 * O jogador não julga uma conduta alheia: ele ESCOLHE a sua. Cada cena descreve
 * uma circunstância e oferece quatro condutas possíveis. Uma ou duas delas
 * são ilícitas — e é a escolha que o jogador faz que entra no índice.
 *
 * CAMPOS DE UMA CENA
 *   id, fase          identificação e a que fase pertence
 *   titulo            título curto exibido no cartão
 *   contexto          a circunstância, em segunda pessoa
 *   ilustracao        chave da ilustração (ver js/ilustracoes.js)
 *   descricaoImagem   texto alternativo da ilustração (acessibilidade)
 *   opcoes            as quatro condutas oferecidas
 *
 * CAMPOS DE UMA OPÇÃO
 *   id                identificador único
 *   texto             a conduta, na primeira pessoa
 *   natureza          'conforme' | 'crime' | 'vedacao'   (ver abaixo)
 *   titulo            manchete do retorno
 *   justificativa     fundamento em linguagem acessível (RNF-06).
 *                     Uma linha em branco separa parágrafos.
 *   baseLegal         referência normativa
 *   textoLegal        transcrição literal, montada a partir de window.LEI
 *
 * AS TRÊS NATUREZAS — e por que a distinção importa
 *   'conforme'  conduta adequada; não gera ilícito
 *   'crime'     crime do art. 39, § 5º, da Lei nº 9.504/97
 *   'vedacao'   conduta VEDADA, sem natureza penal — o § 1º do art. 39-A diz
 *               "É vedada", e não "constitui crime". Tratar as duas como a
 *               mesma coisa ensinaria que toda irregularidade eleitoral é
 *               crime, o que não é verdade.
 *
 * O ÍNDICE DE ILÍCITOS conta 'crime' e 'vedacao' — as duas são ilícitas.
 * A natureza aparece no retorno, para que o jogador saiba QUAL ilícito cometeu.
 * ========================================================================== */

/* =============================================================================
 * TRANSCRIÇÕES LITERAIS — Lei nº 9.504/97
 * -----------------------------------------------------------------------------
 * Os textos abaixo são citados entre aspas nas telas de retorno. Uma citação
 * entre aspas que não reproduza o dispositivo é pior do que nenhuma citação:
 * ensina uma norma que não existe. Se precisar corrigir, corrija AQUI — todas
 * as opções que citam o mesmo dispositivo passam a exibir o texto novo.
 * ========================================================================== */
window.LEI = {

  /* Art. 39, § 5º, caput — redação vigente */
  art39Caput:
    'Constituem crimes, no dia da eleição, puníveis com detenção, de seis ' +
    'meses a um ano, com a alternativa de prestação de serviços à comunidade ' +
    'pelo mesmo período, e multa no valor de cinco mil a quinze mil UFIR:',

  /* Art. 39, § 5º, II — redação dada pela Lei nº 11.300/2006 */
  art39II:
    'II – a arregimentação de eleitor ou a propaganda de boca de urna.',

  /* Art. 39, § 5º, III — redação dada pela Lei nº 12.034/2009 */
  art39III:
    'III – a divulgação de qualquer espécie de propaganda de partidos ' +
    'políticos ou de seus candidatos.',

  /* Art. 39-A, caput — acrescido pela Lei nº 12.034/2009 */
  art39A:
    'Art. 39-A. É permitida, no dia das eleições, a manifestação individual e ' +
    'silenciosa da preferência do eleitor por partido político, coligação ou ' +
    'candidato, revelada exclusivamente pelo uso de bandeiras, broches, ' +
    'dísticos e adesivos.',

  /* Art. 39-A, § 1º — o limite entre o individual e o coletivo */
  art39AP1:
    '§ 1º É vedada, no dia do pleito, até o término do horário de votação, a ' +
    'aglomeração de pessoas portando vestuário padronizado, bem como os ' +
    'instrumentos de propaganda referidos no caput, de modo a caracterizar ' +
    'manifestação coletiva, com ou sem utilização de veículos.'
};

/* =============================================================================
 * AVATARES — RF-14 / RF-15
 * -----------------------------------------------------------------------------
 * O jogador representa um jovem em sua primeira candidatura. As opções
 * existem para que o público-alvo se reconheça no personagem — é o que
 * sustenta o estímulo à participação política.
 *
 * As cores são usadas nas ilustrações: o avatar escolhido é o protagonista
 * desenhado em todas as cenas.
 *
 * Três campos além das cores mudam o DESENHO, e não a aparência da cor:
 *
 *   `cadeirante`   o protagonista aparece sentado, na cadeira de rodas, em
 *                  todas as cenas — e não apenas no retrato. Como a cadeira
 *                  não interfere em nada além do desenho, ela não entra em
 *                  nenhuma conta da ficha nem do julgamento (RF-14/RF-15).
 *   `cabeloLongo`  mechas que caem sobre os ombros, para que a cabeça não
 *                  seja o mesmo semicírculo em todos os retratos.
 *   `piercing`     argola no septo e brinco no queixo, no retrato — o único
 *                  rosto do jogo que tem traços onde eles possam cair.
 * ========================================================================== */
window.AVATARES = [
  {
    id: 'av1',
    nome: 'Ana',
    descricao: 'Jovem de pele morena clara, cabelo escuro preso atrás.',
    pele: '#e0aa78',
    cabelo: '#2b2318',
    camisa: '#3b6ea5'
  },
  {
    id: 'av2',
    nome: 'Bruno',
    descricao: 'Jovem de pele retinta e cabelo crespo escuro, em cadeira de rodas.',
    pele: '#7d4c2e',
    cabelo: '#1a1a1a',
    camisa: '#c98a3c',
    cadeirante: true
  },
  {
    id: 'av3',
    nome: 'Carla',
    descricao: 'Mulher de pele negra, cabelo roxo comprido e piercing no rosto.',
    pele: '#7d4c2e',
    cabelo: '#7e3fc9',
    camisa: '#4f9e6a',
    cabeloLongo: true,
    piercing: true
  },
  {
    id: 'av4',
    nome: 'Diego',
    descricao: 'Jovem de pele morena e cabelo castanho escuro.',
    pele: '#c98a5c',
    cabelo: '#4a3524',
    camisa: '#7a5aa8'
  }
];

/* =============================================================================
 * FASES — a carreira do candidato
 * -----------------------------------------------------------------------------
 * `tolera`: quantos ilícitos a candidatura suporta antes de ser INDEFERIDA.
 * Com `tolera: 1`, UM ilícito ainda permite concorrer — a juíza o registra no
 * relatório e a candidatura passa com advertência — e DOIS indeferem o
 * registro. O limite é o mesmo em todas as fases, e o jogo se recusa a abrir
 * quando a declaração discorda dele: quem decide é a contagem de ilícitos, e
 * a declaração é conferida contra ela. Declarar a tolerância aqui é o que
 * permite ler a fase sem abrir o app.js, e por isso ela fica.
 *
 * `iliciosPorCena`: quantas das quatro condutas de cada cena são ilícitas.
 * Cresce com o cargo: a fase 1 oferece uma conduta ilícita por cena, e a fase
 * 2 oferece duas, na mesma proporção em que as situações do cargo maior se
 * aproximam do limite.
 *
 * `abertura` é a narração que apresenta a fase, logo antes da primeira
 * circunstância dela.
 * ========================================================================== */
window.FASES = [
  {
    id: 'f1',
    numero: 1,
    cargo: 'Vereador',
    chamada: 'A primeira candidatura',
    descricao:
      'Você tem dezenove anos, acaba de tirar o título de eleitor e é ' +
      'candidato a vereador do seu município. É dia de eleição e você vai ' +
      'votar — mas o dia reserva circunstâncias em que é preciso decidir o ' +
      'que fazer, e cada decisão tem preço.',
    abertura:
      'Nove dias atrás você tirou o título de eleitor. Hoje você é candidato, ' +
      'e o dia da eleição é uma prova que ninguém avisa que vai aplicar. São ' +
      'três circunstâncias, uma depois da outra, e por baixo de todas elas ' +
      'corre a mesma pergunta: o que você faz?',
    tolera: 1,
    iliciosPorCena: 1,
    situacoes: ['c01', 'c02', 'c03']
  },
  {
    id: 'f2',
    numero: 2,
    cargo: 'Deputado Estadual',
    chamada: 'O passo seguinte',
    descricao:
      'Você venceu a eleição para vereador e, dois anos depois, disputa uma ' +
      'cadeira na Assembleia Legislativa. O cargo é maior, e as ' +
      'circunstâncias deste dia de eleição estão mais próximas do limite ' +
      'entre o que se pode fazer e o que é ilícito.',
    abertura:
      'Dois anos se passaram. Você é vereador, tem um mandato curto e uma ' +
      'Assembleia inteira pela frente. A campanha é maior, o dinheiro é ' +
      'maior, e as circunstâncias que este dia reserva chegaram mais perto da ' +
      'linha. As três perguntas continuam as mesmas — só ficaram mais caras.',
    tolera: 1,
    iliciosPorCena: 2,
    situacoes: ['c04', 'c05', 'c06']
  }
];

/* =============================================================================
 * AS SEIS CIRCUNSTÂNCIAS
 * ========================================================================== */
window.CENAS = [

  /* =====================================================================
   * FASE 1 — VEREADOR · uma conduta ilícita por cena
   * ================================================================== */

  {
    id: 'c01',
    fase: 'f1',
    titulo: 'O broche no seu peito',
    contexto:
      'É manhã de eleição. Você vai a pé até a escola do seu bairro para ' +
      'votar. Na camiseta, prendeu um broche com o seu próprio número; na ' +
      'alça da mochila, um adesivo da sua candidatura. Na calçada, outros ' +
      'eleitores seguem na mesma direção, e a fila da seção já começa a se ' +
      'formar. No bolso, ainda há um maço dos santinhos que sobraram da ' +
      'campanha.',
    ilustracao: 'broche',
    descricaoImagem:
      'O jovem candidato caminha sozinho na calçada, com um broche na ' +
      'camiseta e um adesivo na alça da mochila. Ao fundo, outra pessoa ' +
      'caminha em sentido oposto, sem qualquer interação.',
    itens: ['titulo', 'broche', 'adesivo', 'santinhos', 'celular'],
    opcoes: [
      {
        id: 'c01o1',
        texto:
          'Sigo caminhando com o broche no peito e o adesivo na mochila, em ' +
          'silêncio, e entro na fila para votar.',
        natureza: 'conforme',
        titulo: 'Você exerceu um direito — e a lei o nomeia',
        justificativa:
          'Não há ilícito: há exercício de um direito, e ele vale também para ' +
          'quem é candidato. O broche e o adesivo são exatamente os meios que ' +
          'a lei nomeia, e a manifestação é individual, porque diz respeito só ' +
          'a você, e silenciosa, porque não aborda nem convoca ninguém.\n\n' +
          'A lei não apenas tolera essa conduta: ela a permite expressamente, ' +
          'e a palavra do dispositivo é essa mesmo, "permitida". Guarde este ' +
          'caso: ele é o padrão contra o qual você vai comparar todos os ' +
          'outros.',
        baseLegal: 'Art. 39-A, caput, da Lei nº 9.504/97'
      },
      {
        id: 'c01o2',
        texto:
          'Tiro do bolso o maço de santinhos que sobrou e começo a ' +
          'entregá-los de mão em mão a quem está na fila.',
        natureza: 'crime',
        titulo: 'A entrega consuma o crime, mesmo sem ninguém pedir',
        justificativa:
          'Há crime — e ele se consuma no instante da entrega. A distribuição ' +
          'de material no dia da eleição é crime de mera conduta: não se exige ' +
          'que o eleitor tenha sido pressionado, constrangido ou convencido. ' +
          'Foi entregue a um eleitor: está consumado.\n\n' +
          'A aparência ordinária do gesto é precisamente o que o torna difícil ' +
          'de reconhecer. Um santinho passado de mão em mão parece uma ' +
          'cortesia. E note de onde ele saiu: do seu bolso, não do bolso de ' +
          'outro. A diferença entre este caso e a cena do cabo eleitoral não ' +
          'está na lei — está em quem entregou.',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97'
      },
      {
        id: 'c01o3',
        texto:
          'Guardo o broche e o adesivo na mochila antes de entrar na seção, ' +
          'para não chamar atenção.',
        natureza: 'conforme',
        titulo: 'O direito existe — usá-lo ou não é escolha sua',
        justificativa:
          'Também aqui não há ilícito. A lei PERMITE a manifestação; ela não a ' +
          'impõe. Guardar o broche não é conduta típica, e nada no dia da ' +
          'eleição obriga o candidato a exibir a própria candidatura.\n\n' +
          'Vale registrar o que esta escolha custa, porém. O broche e o ' +
          'adesivo são meios que a lei nomeia justamente para que a ' +
          'manifestação individual e discreta tenha lugar garantido. Tratar ' +
          'como suspeito um direito expresso é o que faz o candidato se ' +
          'esconder no dia em que ele mais precisa ser visto com naturalidade.',
        baseLegal: 'Art. 39-A, caput, da Lei nº 9.504/97'
      },
      {
        id: 'c01o4',
        texto:
          'Paro ao lado da bandeira que um apoiador apoiou no chão, em ' +
          'silêncio, e fico ali até a fila andar.',
        natureza: 'conforme',
        titulo: 'A bandeira é o primeiro meio do rol legal',
        justificativa:
          'Conduta conforme. A bandeira abre o rol do art. 39-A — é o primeiro ' +
          'dos meios que a lei nomeia pelo nome. Ao lado dela, em silêncio e ' +
          'sem dirigir a palavra a ninguém, você está exatamente no terreno ' +
          'que o caput protege.\n\n' +
          'Repare no critério, porque é ele que vai decidir todas as outras ' +
          'cenas: o que caracteriza a manifestação permitida não é o objeto, ' +
          'mas o modo. A mesma bandeira, usada de outro jeito, sai da ' +
          'proteção — e é o que você verá na fase seguinte.',
        baseLegal: 'Art. 39-A, caput, da Lei nº 9.504/97'
      }
    ]
  },

  {
    id: 'c02',
    fase: 'f1',
    titulo: 'O cabo eleitoral na fila',
    contexto:
      'Na fila da sua seção eleitoral, um cabo eleitoral da sua campanha — ' +
      'que você não mandou fazer isso — tira do bolso um maço dos seus ' +
      'santinhos e começa a entregá-los de mão em mão aos eleitores à frente. ' +
      'Ele não pede voto em voz alta e não pressiona ninguém: apenas entrega. ' +
      'Você vê a cena a poucos metros. O material é seu, e a campanha é sua.',
    ilustracao: 'distribuicao',
    descricaoImagem:
      'Em uma fila, um cabo eleitoral estende um santinho de mão em mão a ' +
      'outro eleitor, enquanto o jovem candidato observa a poucos metros. ' +
      'Nenhum som, nenhuma faixa e nenhum alto-falante aparecem na cena.',
    itens: ['titulo', 'santinhos', 'celular'],
    opcoes: [
      {
        id: 'c02o1',
        texto:
          'Atravesso a fila, tiro o maço da mão dele e peço que ele pare e ' +
          'guarde o material.',
        natureza: 'conforme',
        titulo: 'Interromper a entrega é o que a cena pede',
        justificativa:
          'Conduta conforme — e é a mais acertada da cena. O crime já estava ' +
          'em curso, e cessá-lo não é ilícito de ninguém: nada na lei protege ' +
          'a continuidade de uma entrega criminosa.\n\n' +
          'Vale a pena entender o que estava em jogo. A distribuição de ' +
          'material é crime de mera conduta: consuma-se com a entrega, sem ' +
          'exigir pressão sobre o eleitor. Cada santinho que passava da mão ' +
          'dele para a de um eleitor era um crime consumado — e o material era ' +
          'da sua campanha.',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97'
      },
      {
        id: 'c02o2',
        texto:
          'Pego o maço da mão dele e termino a entrega eu mesmo, para não ' +
          'deixar o material sem uso.',
        natureza: 'crime',
        titulo: 'Agora foi você quem entregou — e isso basta',
        justificativa:
          'Há crime, e desta vez praticado por você. A distribuição de ' +
          'material no dia da eleição é crime de mera conduta: consuma-se com ' +
          'a simples entrega, e não se exige que o eleitor tenha sido ' +
          'pressionado. Foi entregue a um eleitor: está consumado.\n\n' +
          'Note o que mudou entre a cena do cabo eleitoral e esta. Lá, a ' +
          'conduta era de outra pessoa, e a responsabilidade penal é pessoal — ' +
          'ninguém responde criminalmente por ato que não ordenou, não ' +
          'instigou e não ajustou. Aqui, a mão é a sua. A pergunta que a lei ' +
          'faz é uma só: o material chegou à mão de um eleitor?',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97'
      },
      {
        id: 'c02o3',
        texto:
          'Peço a ele que deixe o material no carro e me acompanhe até a ' +
          'seção, para votarmos juntos.',
        natureza: 'conforme',
        titulo: 'Enquanto o material não chega a eleitor nenhum',
        justificativa:
          'Conduta conforme. Guardar não é distribuir, e a diferença entre as ' +
          'duas coisas é o que decide a cena. A lei pune a arregimentação de ' +
          'eleitor e a propaganda de boca de urna — condutas que se dirigem a ' +
          'alguém e que precisam ser demonstradas: exige-se a prova da efetiva ' +
          'entrega ou da abordagem, nunca a sua presunção.\n\n' +
          'Retirar o material de circulação, antes que ele chegue a mais ' +
          'alguém, corta o crime no ponto em que ele ainda não se consumou. É a ' +
          'mesma linha que separa a caixa fechada no porta-malas da ' +
          'distribuição na calçada — e você vai reencontrá-la na fase 2.',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97 — atipicidade do porte isolado'
      },
      {
        id: 'c02o4',
        texto:
          'Deixo o material com ele e sigo para a minha seção, porque a ' +
          'entrega é ato dele e não meu.',
        natureza: 'conforme',
        titulo: 'Não é crime seu — mas também não é problema resolvido',
        justificativa:
          'Perante a lei penal, esta conduta não é crime do candidato. A ' +
          'responsabilidade penal é pessoal: ninguém responde criminalmente ' +
          'por ato que não ordenou, não instigou e não ajustou. O crime é do ' +
          'cabo eleitoral, e a entrega continua sendo dele.\n\n' +
          'Mas "não é crime meu" não é o mesmo que "não é problema meu". Fora ' +
          'da esfera criminal, a Justiça Eleitoral examina a responsabilidade ' +
          'de quem se beneficiou da conduta, e esse exame depende da prova de ' +
          'que o beneficiário sabia. Você viu. Quem coordena uma campanha ' +
          'responde pelo que ela faz às vistas de todos — e o que ficou às ' +
          'vistas de todos, você deixou seguir.',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97'
      }
    ]
  },

  {
    id: 'c03',
    fase: 'f1',
    titulo: 'A camiseta na fila',
    contexto:
      'Você entra na fila da sua seção eleitoral vestindo uma camiseta com o ' +
      'seu número e o seu nome. Você não fala sobre a eleição, não entrega ' +
      'material e não aborda ninguém. Os outros eleitores da fila vestem ' +
      'roupa comum: você é o único com a camiseta da candidatura. No celular, ' +
      'a coordenação manda mensagem a cada meia hora.',
    ilustracao: 'camiseta',
    descricaoImagem:
      'O jovem candidato está parado na fila vestindo uma camiseta com número ' +
      'e nome impressos. Os demais eleitores usam roupas de cores diferentes ' +
      'entre si, sem padronização, e estão voltados para a frente.',
    itens: ['titulo', 'camiseta', 'broche', 'celular'],
    opcoes: [
      {
        id: 'c03o1',
        texto:
          'Fico na fila com a camiseta, em silêncio, e espero a minha vez de ' +
          'votar.',
        natureza: 'conforme',
        titulo: 'Um dístico, uma pessoa, nenhuma palavra',
        justificativa:
          'Conduta conforme. A camiseta é um dístico, e dístico é a terceira ' +
          'palavra do rol legal. Usada por uma só pessoa, sem palavra dirigida ' +
          'e sem entrega de material, ela é manifestação individual e ' +
          'silenciosa — exatamente o que o art. 39-A permite.\n\n' +
          'Repare no limite que o § 1º desenha: o que a lei veda é a ' +
          'aglomeração de pessoas com vestuário padronizado, capaz de ' +
          'caracterizar manifestação coletiva. Aqui há um candidato de ' +
          'camiseta e os demais com roupa comum. Individual, portanto.',
        baseLegal: 'Art. 39-A, caput e § 1º, da Lei nº 9.504/97'
      },
      {
        id: 'c03o2',
        texto:
          'Chamo pelo celular os quatro apoiadores que estão com a mesma ' +
          'camiseta para ficarmos todos juntos na frente da seção.',
        natureza: 'vedacao',
        titulo: 'A mesma camiseta, agora em grupo, muda de natureza',
        justificativa:
          'Aqui a conduta é ILÍCITA — mas a natureza do ilícito é outra, e ' +
          'essa diferença importa. O § 1º do art. 39-A não diz "constitui ' +
          'crime": diz "É vedada". A aglomeração de pessoas com vestuário ' +
          'padronizado, capaz de caracterizar manifestação coletiva, é ' +
          'conduta vedada pela lei eleitoral, sujeita às consequências ' +
          'próprias da seara eleitoral — e não ao art. 39, § 5º.\n\n' +
          'O que mudou não foi a camiseta: foi o número de gente. Uma pessoa ' +
          'de camiseta é manifestação individual; cinco pessoas de camiseta ' +
          'igual, paradas na frente da seção, são manifestação coletiva. A lei ' +
          'protege a manifestação do eleitor, não a mobilização de eleitores.',
        baseLegal: 'Art. 39-A, § 1º, da Lei nº 9.504/97'
      },
      {
        id: 'c03o3',
        texto:
          'Prendo também o broche com o número na camiseta e continuo na ' +
          'fila, sem falar com ninguém.',
        natureza: 'conforme',
        titulo: 'Somar meios nomeados não cria ilícito',
        justificativa:
          'Conduta conforme. Você somou dois dos meios que a lei nomeia — o ' +
          'dístico e o broche — e continuou sozinho e em silêncio. O que a lei ' +
          'examina é o modo da manifestação, não a quantidade de objetos: ' +
          'acrescentar um broche não torna coletivo o que segue individual.\n\n' +
          'Este é um bom teste do critério. Se a licitude dependesse do número ' +
          'de objetos, o rol do caput seria uma lista de limites, e não uma ' +
          'lista de permissões. O que faz a manifestação sair da proteção é ' +
          'outra coisa: virar grupo, virar som, virar abordagem.',
        baseLegal: 'Art. 39-A, caput, da Lei nº 9.504/97'
      },
      {
        id: 'c03o4',
        texto:
          'Combino com os apoiadores de nos encontrarmos depois da votação, ' +
          'longe da seção, para o grupo aparecer junto.',
        natureza: 'conforme',
        titulo: 'O que a lei veda tem hora e lugar',
        justificativa:
          'Conduta conforme. O § 1º veda a aglomeração padronizada "no dia do ' +
          'pleito, até o término do horário de votação" — e a delimitação de ' +
          'tempo e de lugar faz parte do próprio dispositivo. Concentrar o ' +
          'grupo depois do horário, longe da seção, está fora do que ele ' +
          'alcança.\n\n' +
          'Leia o dispositivo inteiro quando for aplicá-lo a um caso real. ' +
          'Boa parte das dúvidas sobre o dia da eleição se resolve não no ' +
          '"se", mas no "quando" e no "onde" — e o § 1º é o dispositivo que ' +
          'diz as duas coisas em voz alta.',
        baseLegal: 'Art. 39-A, § 1º, da Lei nº 9.504/97'
      }
    ]
  },

  /* =====================================================================
   * FASE 2 — DEPUTADO ESTADUAL · duas condutas ilícitas por cena
   * ================================================================== */

  {
    id: 'c04',
    fase: 'f2',
    titulo: 'A caixa no porta-malas',
    contexto:
      'Você estaciona o carro a duas quadras do local de votação. No ' +
      'porta-malas fechado há uma caixa com os santinhos que sobraram da ' +
      'campanha, que serão devolvidos ao comitê no dia seguinte. Você não ' +
      'abre a caixa, não retira nada e não entrega material a eleitor algum. ' +
      'Um cabo eleitoral da sua campanha espera por você na esquina.',
    ilustracao: 'portamalas',
    descricaoImagem:
      'Um carro está estacionado com o porta-malas aberto, revelando uma ' +
      'caixa fechada e lacrada. O jovem candidato está ao lado, sem retirar ' +
      'nada da caixa e sem interagir com outras pessoas.',
    itens: ['titulo', 'santinhos', 'chave', 'celular'],
    opcoes: [
      {
        id: 'c04o1',
        texto:
          'Deixo a caixa fechada no porta-malas e sigo a pé até a seção, com ' +
          'as mãos vazias.',
        natureza: 'conforme',
        titulo: 'Guardar não é distribuir',
        justificativa:
          'Conduta conforme. A lei pune a arregimentação de eleitor e a ' +
          'propaganda de boca de urna — condutas que se dirigem a alguém e que ' +
          'precisam ser demonstradas: exige-se a prova da efetiva entrega ou ' +
          'da abordagem, nunca a sua presunção.\n\n' +
          'Uma caixa fechada dentro de um carro não chega a eleitor nenhum. A ' +
          'jurisprudência é firme no sentido de que o simples porte de ' +
          'material, ainda que em grande quantidade, não configura o crime de ' +
          'boca de urna. Pune-se o ato, não a aparência do ato. Mas atenção: a ' +
          'linha é fina, e ela se rompe no instante em que a caixa se abre.',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97 — atipicidade do porte isolado'
      },
      {
        id: 'c04o2',
        texto:
          'Abro a caixa e entrego os santinhos a quem passa na calçada, a duas ' +
          'quadras da seção.',
        natureza: 'crime',
        titulo: 'A distância da seção não descaracteriza a entrega',
        justificativa:
          'Há crime. A distribuição de material no dia da eleição é crime de ' +
          'mera conduta: consuma-se com a simples entrega, sem exigir pressão ' +
          'sobre o eleitor. Foi entregue: está consumado.\n\n' +
          'A tentação aqui é achar que duas quadras de distância mudam alguma ' +
          'coisa. Não mudam quanto à distribuição — o inciso II pune a ' +
          'arregimentação e a boca de urna, e não fixa raio de distância. O ' +
          'que a distância pode alterar é o enquadramento de outras condutas, ' +
          'não o de entregar material a eleitor no dia da eleição.',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97'
      },
      {
        id: 'c04o3',
        texto:
          'Peço ao cabo eleitoral que fique com a caixa e entregue o material ' +
          'na fila enquanto eu voto.',
        natureza: 'crime',
        titulo: 'A mão é dele, mas a ordem é sua',
        justificativa:
          'Há crime — e aqui a distância entre a sua mão e a entrega não ' +
          'protege ninguém. A distribuição de material no dia da eleição é ' +
          'crime de mera conduta: consuma-se com a entrega, e não se exige ' +
          'pressão sobre o eleitor.\n\n' +
          'Note a diferença em relação à cena do cabo eleitoral que agiu por ' +
          'conta própria. Lá, a conduta era dele, e a responsabilidade penal é ' +
          'pessoal. Aqui, você ordenou: a lei não pergunta apenas quem ' +
          'entregou, pergunta também quem mandou entregar. Quem coordena uma ' +
          'campanha responde pelo que ela faz — e responde mais ainda pelo que ' +
          'ela faz porque ele mandou.',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97'
      },
      {
        id: 'c04o4',
        texto:
          'Deixo a caixa fechada e combino com o cabo eleitoral a devolução ' +
          'dela ao comitê amanhã cedo, antes de qualquer outra coisa.',
        natureza: 'conforme',
        titulo: 'A mesma caixa, o mesmo lugar — e nenhum eleitor alcançado',
        justificativa:
          'Conduta conforme. Compare esta escolha com a anterior: a caixa é a ' +
          'mesma, o cabo eleitoral é o mesmo, o carro é o mesmo. O que muda é ' +
          'o destino do material — e é isso que a lei examina. Nenhum eleitor ' +
          'é alcançado, e nenhuma entrega acontece.\n\n' +
          'Este é o critério que separa as duas opções: não importa o que ' +
          'existe, importa o que se faz. Enquanto a caixa permanece fechada e ' +
          'o material tem por destino o comitê, nenhuma conduta típica ' +
          'ocorreu. Toda a diferença entre esta opção e as duas ilícitas ' +
          'cabe numa pergunta: o santinho chegou à mão de alguém?',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97 — atipicidade do porte isolado'
      }
    ]
  },

  {
    id: 'c05',
    fase: 'f2',
    titulo: 'A abordagem na calçada',
    contexto:
      'A poucos metros de uma seção eleitoral, um eleitor que você não ' +
      'conhece para na calçada para conferir no celular o número da sua ' +
      'seção. Você está ao lado dele, com o broche no peito. Não há mais ' +
      'ninguém por perto, e não há material nenhum nas suas mãos.',
    ilustracao: 'abordagem',
    descricaoImagem:
      'O jovem candidato e um eleitor frente a frente na calçada, próximos a ' +
      'um prédio com a inscrição "seção eleitoral". O candidato gesticula ' +
      'como quem fala; o eleitor ouve. Nenhum material é trocado.',
    itens: ['titulo', 'broche', 'celular'],
    opcoes: [
      {
        id: 'c05o1',
        texto:
          'Cumprimento o eleitor e digo, em voz alta, que o número é 40 e que ' +
          'ele pode confiar.',
        natureza: 'crime',
        titulo: 'A preferência deixa de ser silenciosa quando se dirige a alguém',
        justificativa:
          'Há ilícito, e este é o caso de fronteira do jogo. A leitura mais ' +
          'firme sustenta propaganda de boca de urna: a fala foi dirigida a um ' +
          'eleitor determinado, dentro do raio de influência da seção, com ' +
          'conteúdo de pedido de voto.\n\n' +
          'Há divergência relevante quanto ao enquadramento exato — a ' +
          'jurisprudência oscila entre os incisos II e III em casos de ' +
          'fronteira, e diverge também sobre a exigência de um fim específico ' +
          'de aliciar. O que NÃO está em divergência, porém, é o núcleo: a ' +
          'manifestação deixa de ser silenciosa no instante em que se dirige a ' +
          'alguém, e é a silenciosidade que a lei protege.\n\n' +
          'Compare com as cenas do broche e da camiseta: ali você estava em ' +
          'silêncio; aqui, você falou com alguém. É essa a linha.',
        baseLegal:
          'Art. 39, § 5º, II e III, da Lei nº 9.504/97 — em contraste com o ' +
          'art. 39-A'
      },
      {
        id: 'c05o2',
        texto:
          'Passo em silêncio ao lado dele e sigo até a entrada da seção, sem ' +
          'dizer nada.',
        natureza: 'conforme',
        titulo: 'Ao lado dele, e ainda assim em silêncio',
        justificativa:
          'Conduta conforme. Estar perto não é abordar, e a lei não fixa ' +
          'distância: o que ela examina é se a manifestação se dirigiu a ' +
          'alguém. Passar ao lado em silêncio, com o broche no peito, mantém ' +
          'os dois requisitos do art. 39-A — individual e silenciosa.\n\n' +
          'Este é o par da opção ilícita desta cena, e a comparação é ' +
          'deliberada. A mesma pessoa, o mesmo lugar, o mesmo broche, a mesma ' +
          'proximidade da urna: o que separa as duas é uma única coisa, e não ' +
          'é a distância. É a palavra dirigida.',
        baseLegal: 'Art. 39-A, caput, da Lei nº 9.504/97'
      },
      {
        id: 'c05o3',
        texto:
          'Pergunto a ele em quem pretende votar e ofereço o meu número para ' +
          'ele considerar.',
        natureza: 'crime',
        titulo: 'Perguntar e oferecer é arregimentar',
        justificativa:
          'Há ilícito. A conduta não é apenas divulgação: é arregimentação de ' +
          'eleitor — o inciso II pune as duas coisas, e a primeira delas é ' +
          'exatamente esta. Perguntar em quem a pessoa pretende votar, para ' +
          'em seguida oferecer o próprio número, é o que a lei descreve.\n\n' +
          'Note que a pergunta vem antes da oferta, e é isso que torna a ' +
          'conduta mais grave do que a simples menção ao número. A lei não ' +
          'exige que o eleitor tenha sido constrangido: basta que tenha sido ' +
          'arregimentado — e a arregimentação se dá pela abordagem dirigida, ' +
          'não pelo resultado dela.',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97'
      },
      {
        id: 'c05o4',
        texto:
          'Digo apenas "bom dia" e aponto a porta da seção, sem mencionar ' +
          'candidatura nem número.',
        natureza: 'conforme',
        titulo: 'O que sai da proteção é o conteúdo, não a cortesia',
        justificativa:
          'Conduta conforme. Há fala dirigida a alguém — e ainda assim não há ' +
          'ilícito, porque falta o que a norma alcança: não se divulga ' +
          'propaganda, não se pede voto, não se menciona candidatura, partido ' +
          'ou número.\n\n' +
          'Esta opção existe para mostrar onde exatamente fica a linha. Não é ' +
          'a palavra que a lei pune — é a propaganda. Dizer "bom dia" e ' +
          'apontar uma porta é convivência; dizer o número é campanha. Entre ' +
          'as duas há uma diferença que o candidato precisa saber enxergar, ' +
          'porque é ele que vai ter de decidir na calçada.',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97 — em contraste com o art. 39-A'
      }
    ]
  },

  {
    id: 'c06',
    fase: 'f2',
    titulo: 'A bandeira apoiada no chão',
    contexto:
      'Em frente à sua seção eleitoral, você apoia no chão uma bandeira da sua ' +
      'candidatura. É o último dia da campanha, e os eleitores passam por você ' +
      'em direção à urna. Na esquina, um grupo de apoiadores com a mesma ' +
      'camiseta espera uma orientação sua.',
    ilustracao: 'bandeira',
    descricaoImagem:
      'O jovem candidato está parado ao lado de uma bandeira apoiada no chão, ' +
      'em frente a um prédio com a inscrição "seção eleitoral". Ele está em ' +
      'silêncio e não há interlocutor.',
    itens: ['titulo', 'bandeira', 'camiseta', 'celular'],
    opcoes: [
      {
        id: 'c06o1',
        texto:
          'Fico parado ao lado da bandeira, em silêncio, sem falar com ' +
          'ninguém até votar.',
        natureza: 'conforme',
        titulo: 'A bandeira é o primeiro dos meios nomeados',
        justificativa:
          'Conduta conforme. A bandeira abre o rol do art. 39-A, e os dois ' +
          'requisitos da manifestação permitida estão presentes: ela é ' +
          'individual, porque é de uma só pessoa, e silenciosa, porque nada é ' +
          'dirigido a alguém.\n\n' +
          'O que a lei pune no dia da eleição é a propaganda — o som, o ' +
          'comício, a carreata, a abordagem —, não a presença de uma bandeira. ' +
          'Este é o último caso do jogo, e ele fecha o critério: compare-o com ' +
          'a cena da calçada. Lá você falou; aqui você apenas está.',
        baseLegal: 'Art. 39-A, caput, da Lei nº 9.504/97'
      },
      {
        id: 'c06o2',
        texto:
          'Pego a bandeira e saio caminhando com ela à frente dos apoiadores ' +
          'de camiseta igual, animando a calçada.',
        natureza: 'vedacao',
        titulo: 'Um grupo padronizado em movimento é manifestação coletiva',
        justificativa:
          'Conduta ILÍCITA, e de natureza vedada, não penal. O § 1º do ' +
          'art. 39-A veda a aglomeração de pessoas portando vestuário ' +
          'padronizado, capaz de caracterizar manifestação coletiva, com ou ' +
          'sem utilização de veículos — e ele diz "É vedada", não "constitui ' +
          'crime".\n\n' +
          'O que a cena mostra é precisamente o que o dispositivo descreve: ' +
          'vestuário padronizado, várias pessoas, e a bandeira como ' +
          'instrumento de propaganda a frente do grupo. A bandeira sozinha ' +
          'não é o problema — a bandeira à frente de um grupo uniformizado é. ' +
          'Uma pessoa com uma bandeira está no caput; um grupo padronizado com ' +
          'uma bandeira está no § 1º.',
        baseLegal: 'Art. 39-A, § 1º, da Lei nº 9.504/97'
      },
      {
        id: 'c06o3',
        texto:
          'Empresto a bandeira a um cabo eleitoral, que passa a usá-la ' +
          'enquanto pede voto em voz alta para quem chega.',
        natureza: 'crime',
        titulo: 'A bandeira é permitida; a boca de urna não',
        justificativa:
          'Há crime. O que a lei pune é o pedido de voto dirigido a quem ' +
          'chega — propaganda de boca de urna —, e ele está lá, em voz alta, ' +
          'na porta da seção. A bandeira na mão dele não torna a conduta ' +
          'protegida: o que o art. 39-A protege é a manifestação silenciosa, e ' +
          'a cena deixou de ser silenciosa.\n\n' +
          'Repare no que você fez ao emprestar: transferiu a conduta para ' +
          'outra mão, mas não transferiu a responsabilidade. Quem coordena uma ' +
          'campanha responde pelo que ela faz — e a bandeira que ele segura é ' +
          'a sua. O objeto é o mesmo do caput; a conduta é a do § 5º.',
        baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97'
      },
      {
        id: 'c06o4',
        texto:
          'Dobro a bandeira e a guardo no carro antes de entrar para votar.',
        natureza: 'conforme',
        titulo: 'Fechar o último caso com o critério inteiro',
        justificativa:
          'Conduta conforme. Nenhum dos dois caminhos do ilícito foi tomado: ' +
          'a bandeira não virou grupo e não virou som. Guardá-la é o que o ' +
          'candidato prudente faz quando não tem certeza de que o grupo à ' +
          'espera de orientação vai se manter em silêncio.\n\n' +
          'Vale guardar o critério inteiro, porque ele serve fora do jogo. ' +
          'Pergunte, a cada conduta do dia da eleição: ela é individual ou ' +
          'coletiva? É silenciosa ou dirigida a alguém? Entrega algum bem ao ' +
          'eleitor? As três perguntas da tela final são essas — e este caso ' +
          'fecha as três com a resposta certa.',
        baseLegal: 'Art. 39-A, caput, da Lei nº 9.504/97'
      }
    ]
  }

];

/* -----------------------------------------------------------------------------
 * O texto legal de cada opção é montado a partir de window.LEI, para que uma
 * correção no dispositivo se propague a todas as opções que o citam.
 *
 * ONDE HÁ SUPRESSÃO, HÁ MARCA DE SUPRESSÃO. O art. 39, § 5º, tem quatro
 * incisos; citar o caput seguido do inciso II sem sinalizar a omissão faria
 * parecer que os incisos I e III não existem. A marca "[...]" é a convenção
 * para isso e é o que mantém a transcrição honesta.
 * -------------------------------------------------------------------------- */
(function montarTextosLegais() {
  var L = window.LEI;
  var OMISSAO = '[...]';

  function citar(t) { return '"' + t + '"'; }

  /* caput do art. 39, § 5º + os incisos efetivamente citados */
  function art39(incisos) {
    return citar(L.art39Caput + ' ' + OMISSAO + ' ' + incisos.join(' '));
  }

  /* Citação do caput do art. 39-A acompanhada, quando for o caso, do § 1º —
     é o par que decide as cenas do limite entre o individual e o coletivo. */
  function art39A(comParagrafo) {
    return citar(comParagrafo ? L.art39A + ' ' + L.art39AP1 : L.art39A);
  }

  var porId = {};
  window.CENAS.forEach(function (c) {
    porId[c.id] = c;
    c.opcoes.forEach(function (o) {
      /* O texto legal decorre da NATUREZA da opção, e não de um campo escrito
         à mão em cada uma: assim, acrescentar uma opção nova não corre o risco
         de citar o dispositivo errado. */
      if (o.natureza === 'crime') {
        o.textoLegal = art39([L.art39II]);
      } else if (o.natureza === 'vedacao') {
        o.textoLegal = citar(L.art39AP1);
      } else {
        o.textoLegal = art39A(false);
      }
    });
  });

  /* Ajustes em que a citação precisa contrastar os dois regimes. */
  porId.c05.opcoes[0].textoLegal =
    art39([L.art39II, L.art39III]) + ' — em contraste com o art. 39-A: ' +
    citar(L.art39A);
  porId.c05.opcoes[3].textoLegal =
    art39([L.art39II]) + ' — em contraste com o art. 39-A: ' + citar(L.art39A);
  porId.c03.opcoes[0].textoLegal = art39A(true);
  porId.c03.opcoes[1].textoLegal = art39A(true);
})();

/* -----------------------------------------------------------------------------
 * PERGUNTAS DE RESOLUÇÃO — RF-07 / US-06
 * Critério de análise reutilizável pelo jogador fora do jogo.
 * -------------------------------------------------------------------------- */
window.PERGUNTAS_RESOLUCAO = [
  {
    numero: 1,
    pergunta: 'A conduta é individual ou coletiva?',
    explicacao:
      'Uma pessoa com um broche está no terreno do art. 39-A. Um grupo com ' +
      'vestuário padronizado, um carro de som ou uma passeata estão no terreno ' +
      'da propaganda — e o § 1º do art. 39-A veda expressamente a aglomeração ' +
      'que caracterize manifestação coletiva. A lei protege a manifestação do ' +
      'eleitor, não a mobilização de eleitores.'
  },
  {
    numero: 2,
    pergunta: 'A conduta é silenciosa ou dirigida a alguém?',
    explicacao:
      'Este é o critério decisivo na maior parte dos casos. Silenciosa é a ' +
      'manifestação que não interpela ninguém: o broche, o adesivo, a ' +
      'bandeira, a camiseta. Dirigida é aquela que busca convencer alguém: a ' +
      'fala, o convite, o pedido de voto. No momento em que a preferência é ' +
      'dirigida a um eleitor, ela deixa de estar protegida pelo art. 39-A.'
  },
  {
    numero: 3,
    pergunta: 'A conduta entrega algum bem ao eleitor?',
    explicacao:
      'A entrega de material — santinho, panfleto, brinde, camiseta dada a ' +
      'outrem — consuma o ilícito pela simples entrega. Não é preciso que o ' +
      'eleitor tenha sido pressionado, nem que tenha prometido o voto. Mas ' +
      'atenção à distinção que decide a cena do porta-malas: portar material ' +
      'não é o mesmo que distribuí-lo, e a entrega precisa ser demonstrada, ' +
      'não presumida.'
  }
];

/* =============================================================================
 * A JUÍZA — o julgamento da candidatura, ao fim de cada fase
 * -----------------------------------------------------------------------------
 * A juíza não julga o jogador: julga a CANDIDATURA. Ela lê os ilícitos que o
 * índice registrou e decide se a candidatura pode concorrer.
 *
 * A REGRA DO VEREDITO
 * -----------------------------------------------------------------------------
 * O veredito é o NÚMERO DE ILÍCITOS. Cada circunstância da fase vale um ato, o
 * ato é lícito ou ilícito, e a candidatura é:
 *
 *   nenhum ilícito  → DEFERIDA   (o registro passa, e ela concorre)
 *   um ilícito      → DEFERIDA   (passa com advertência, e o registro fica)
 *   dois ou mais    → INDEFERIDA (o registro é negado, e a fase se refaz)
 *
 * Não é uma soma de gravidade: é uma contagem, e ela é dita ao jogador na tela
 * do julgamento, com o número à vista e o limite escrito ao lado. `tolera`, na
 * fase, é a declaração desse mesmo limite — conferida contra a contagem.
 *
 * O QUE O JOGO COMPRIME, E O QUE ELE NÃO PODE COMPRIMIR
 * -----------------------------------------------------------------------------
 * No jogo, a candidatura é INDEFERIDA a partir do segundo ilícito — automática
 * e aritmeticamente, sem processo. Na lei, a impugnação não é automática, e a
 * diferença é grande:
 *
 *   - A ação de impugnação de registro de candidatura (AIRC) tem assento no
 *     art. 3º da Lei Complementar nº 64/90, com prazo de 5 dias contados da
 *     publicação do edital, e legitimados próprios (candidato, partido,
 *     coligação ou Ministério Público Eleitoral). Qualquer cidadão no gozo dos
 *     direitos políticos pode dar notícia de inelegibilidade, na forma do
 *     art. 97, § 3º, do Código Eleitoral.
 *   - A inelegibilidade por condenação criminal por crime eleitoral está no
 *     art. 1º, I, "e", da LC 64/90, e exige CONDENAÇÃO — proferida por órgão
 *     colegiado ou transitada em julgado —, e não a mera prática da conduta.
 *     É também a esse título que incide o art. 15, III, da Constituição, que
 *     trata da suspensão dos direitos políticos por condenação criminal
 *     transitada em julgado.
 *   - O art. 15 da LC 64/90 só produz os efeitos de negar o registro, cancelar
 *     o já feito ou anular o diploma depois do trânsito em julgado ou da
 *     publicação de decisão colegiada.
 *
 * Ou seja: um candidato que praticou a conduta, mas ainda não foi condenado
 * em decisão colegiada, não está automaticamente inelegível. O jogo comprime
 * esse caminho para caber numa tela — e declara as duas compressões ao
 * jogador, na nota ao pé do julgamento: a de que aqui a conta basta, sem
 * processo, e a de que o jogo não pesa a gravidade de cada ilícito.
 *
 * Os dispositivos acima são CITADOS POR REFERÊNCIA, sem transcrição entre
 * aspas, porque não foram conferidos literalmente contra o texto oficial. É a
 * mesma regra que governa window.LEI: uma citação entre aspas que não reproduza
 * o dispositivo é pior do que nenhuma citação.
 * ========================================================================== */
window.JUIZA = {
  nome: 'A juíza eleitoral',
  apresentacao:
    'A juíza do Tribunal Regional Eleitoral preside a mesa do julgamento. ' +
    'Sobre a toga, o broche da Justiça Eleitoral. Ela abre a pasta, lê o ' +
    'relatório das condutas do dia da eleição e levanta os olhos.',

  /* A REGRA, ESCRITA PARA O JOGADOR. O veredito não pode ser uma surpresa
     que só o resultado revela: a conta é simples, e ela é dita na tela do
     julgamento, ao lado do número que a compõe. */
  regra:
    'Um ilícito, e a candidatura passa com advertência. Dois ilícitos ou ' +
    'mais, e o registro é indeferido: o candidato não concorre.',

  /* --- Veredito: deferida, com nenhum ilícito ------------------------ */
  semIlicito: {
    veredito: 'deferida',
    rotulo: 'Candidatura deferida',
    titulo: 'Nada há para julgar',
    fala:
      'A pasta está limpa. Não há conduta a examinar — e isso, aqui, é o ' +
      'resultado mais difícil de todos. Concorrer sem ter o que responder ' +
      'exige mais do que conhecer a lei: exige ter decidido, no meio da rua, ' +
      'com pressa e com vontade de ganhar, que ela seria respeitada.' +
      '\n\n' +
      'A candidatura está deferida. Você concorre com os demais candidatos.'
  },

  /* --- Veredito: deferida, com um ilícito no registro -----------------
     O limite é um, e ele foi alcançado sem ser ultrapassado: o veredito é o
     mesmo — deferida. O que muda é a advertência, e é dela que a fala trata:
     não é um terceiro veredito, é a mesma candidatura deferida com uma
     mancha a mais. */
  umIlicito: {
    veredito: 'deferida',
    rotulo: 'Candidatura deferida',
    titulo: 'Um ilícito: passa com advertência',
    fala:
      'Há uma conduta ilícita no relatório, e uma só. O limite é um: a ' +
      'candidatura concorre, com advertência. Mas o registro do que ' +
      'aconteceu fica, e ele não desaparece porque a eleição deu certo.' +
      '\n\n' +
      'Não é preciso mais do que uma vez para que uma campanha mude de ' +
      'natureza. O que você faz com o que ficou registrado é o que decide o ' +
      'resto: a mesma conduta repetida deixa de ser um acidente e passa a ser ' +
      'um método — e o método é o que me obriga a indeferir.'
  },

  /* --- Veredito: indeferida, do segundo ilícito em diante ------------ */
  doisOuMaisIlicitos: {
    veredito: 'indeferida',
    rotulo: 'Candidatura indeferida',
    titulo: 'Dois ou mais ilícitos: o registro é indeferido',
    fala:
      'A conta está fechada, e ela não me deixa alternativa: esta candidatura ' +
      'passou do limite. Não foi um passo em falso — foi uma campanha em que o ' +
      'ilícito deixou de ser exceção e passou a ser o método, decisão após ' +
      'decisão, cada uma delas tomada por alguém que já sabia o que a lei ' +
      'dizia.' +
      '\n\n' +
      'Não é o número que decide a gravidade — é o que o número revela. ' +
      'Indefiro o registro. Você não concorre nesta eleição.' +
      '\n\n' +
      'E é aqui que a lição deste jogo se fecha: o que estava em disputa ' +
      'nunca foi o cargo. Uma candidatura indeferida ensina mais sobre o ' +
      'candidato do que qualquer votação ensinaria.'
  },

  /* --- Nota de honestidade intelectual ------------------------------- */
  nota:
    'Nota do jogo: aqui, a conta decide — dois ilícitos ou mais, registro ' +
    'indeferido; nenhum ou um, registro deferido. Duas compressões estão ' +
    'nessa frase. A primeira: na lei, essa automaticidade não existe. A ' +
    'ação de impugnação de registro de candidatura está no art. 3º da Lei ' +
    'Complementar nº 64/90, com prazo e legitimados próprios, e a notícia de ' +
    'inelegibilidade por qualquer cidadão está no art. 97, § 3º, do Código ' +
    'Eleitoral. A inelegibilidade por crime eleitoral (art. 1º, I, "e", da ' +
    'LC 64/90) exige CONDENAÇÃO em decisão colegiada ou transitada em ' +
    'julgado — não basta ter praticado a conduta. Os efeitos do art. 15 da ' +
    'LC 64/90 só vêm depois disso. A segunda: o jogo conta ilícitos e não ' +
    'pesa gravidades — uma conduta vedada e um crime valem o mesmo no ' +
    'registro, e a lei não funciona assim. O jogo comprime o caminho para ' +
    'caber numa tela; o caminho real tem processo, contraditório e prazo.'
};

/* =============================================================================
 * A SORTE — o resultado da urna
 * -----------------------------------------------------------------------------
 * Decidido por sorteio, e DELIBERADAMENTE separado da progressão: vencer ou
 * perder a eleição não muda nada no que o jogador aprendeu, e não muda a fase
 * em que ele está. É o ponto do jogo — uma eleição vencida de forma ilegal não
 * vale mais do que uma candidatura limpa que não venceu.
 * ========================================================================== */
window.SORTE = {
  vitoria: {
    rotulo: 'Eleito',
    titulo: 'Você venceu a eleição',
    texto:
      'A apuração terminou, e a conta deu para o seu lado. Você vai tomar ' +
      'posse.'
  },
  derrota: {
    rotulo: 'Não eleito',
    titulo: 'Você não venceu a eleição',
    texto:
      'A apuração terminou, e a conta não deu para o seu lado. Você não vai ' +
      'tomar posse.'
  },
  nota:
    'Este resultado foi sorteado, e não decide nada no jogo: o que faz você ' +
    'seguir para a próxima candidatura é a sua conduta, não a urna. Perder ' +
    'uma eleição com a candidatura limpa vale mais do que vencê-la com ' +
    'ilícitos no caminho.'
};

/* =============================================================================
 * A EXPERIÊNCIA — o único medidor do jogo
 * -----------------------------------------------------------------------------
 * A CONDUTA é a única coisa que move a experiência. Não há atributo, não há
 * dado, não há dinheiro: a conduta escolhida é lícita ou ilícita, e é isso, e
 * só isso, que faz o candidato avançar ou recuar.
 *
 * Esta camada não julga nada. Nenhum nível decide se uma conduta é lícita nem
 * quantos ilícitos o jogador cometeu: o julgamento da candidatura sai do
 * ÍNDICE, que conta ilícitos e tem medidor próprio. São dois medidores
 * distintos, e é importante que continuem sendo — um mede a campanha, o outro
 * mede a conduta.
 *
 * BLOCOS
 *   ORIGENS    de onde o candidato vem (escolha narrativa)
 *   NIVEIS     a progressão de experiência
 *   ITENS      o que a campanha carrega no dia da eleição
 *   REGRAS     a experiência que cada conduta rende
 * ========================================================================== */

/* -----------------------------------------------------------------------------
 * ORIGENS — RF-14 ampliado
 * -----------------------------------------------------------------------------
 * A origem é a HISTÓRIA do cidadão, e não um conjunto de números. Nenhuma
 * origem é melhor que as outras, porque nenhuma delas altera nada do jogo: o
 * que muda é quem o jogador decide ser, e o texto que acompanha essa escolha.
 * A conduta julgada no dia da eleição é a mesma para todas.
 * -------------------------------------------------------------------------- */
window.ORIGENS = [
  {
    id: 'org1',
    nome: 'Estudante de Direito',
    descricao:
      'Terceiro período, Centro Acadêmico, noites inteiras lendo lei seca ' +
      'para uma prova que ainda vai demorar.',
    lema: 'Você já leu o texto. Falta ver o texto acontecer.'
  },
  {
    id: 'org2',
    nome: 'Liderança comunitária',
    descricao:
      'Dez anos de associação de moradores, abaixo-assinado de calçada e ' +
      'reunião que só acaba quando alguém dá a luz da rua por consertada.',
    lema: 'Você não precisa se apresentar ao bairro.'
  },
  {
    id: 'org3',
    nome: 'Filho do comércio da esquina',
    descricao:
      'Cresceu atrás do balcão ouvindo o bairro inteiro contar o que pensa ' +
      '— e quem paga a conta no fim do mês.',
    lema: 'Você sabe quanto custa cada coisa, inclusive uma campanha.'
  },
  {
    id: 'org4',
    nome: 'Criado na associação do bairro',
    descricao:
      'Time de futebol, grupo de jovens, mutirão de fim de semana. Você ' +
      'cresceu ouvindo que o certo se faz mesmo quando ninguém está vendo.',
    lema: 'Você aguenta a pressão de quem diz que todo mundo faz assim.'
  }
];

/* -----------------------------------------------------------------------------
 * NÍVEIS — a progressão da campanha
 * -----------------------------------------------------------------------------
 * O teto é 240 XP: seis condutas conformes, e mais nada. Um candidato que
 * atravessa as duas candidaturas sem um único ilícito chega exatamente ao
 * último nível — e um que comete ilícitos não chega, porque cada ilícito
 * DEVOLVE experiência em vez de render.
 *
 * Nível nenhum altera o julgamento da conduta: a ficha cresce, o critério não.
 * -------------------------------------------------------------------------- */
window.NIVEIS = [
  { nivel: 1, titulo: 'Estreante', xp: 0,
    nota: 'Ninguém sabe o seu nome ainda.' },
  { nivel: 2, titulo: 'Candidato', xp: 80,
    nota: 'A campanha existe, e alguém já ouviu falar dela.' },
  { nivel: 3, titulo: 'Veterano', xp: 160,
    nota: 'Você já viu o bastante para não se surpreender.' },
  { nivel: 4, titulo: 'Estadista', xp: 240,
    nota: 'A campanha termina maior do que começou.' }
];

/* -----------------------------------------------------------------------------
 * ITENS — o que a campanha carrega no dia da eleição
 * -----------------------------------------------------------------------------
 * REGRA: o inventário descreve o dia, e não a resposta. O material que aparece
 * aqui é o mesmo que o próprio contexto da circunstância já declara estar à
 * mão — e é justamente por isso que ele pode ser listado: se o inventário
 * apontasse sozinho qual das quatro condutas é a ilícita, a escolha deixaria
 * de exigir julgamento. As duas condutas ilícitas de material, no jogo,
 * partem de itens que também aparecem em circunstâncias sem ilícito de
 * material nenhum.
 * -------------------------------------------------------------------------- */
window.ITENS = {
  titulo:    { nome: 'Título de eleitor', icone: '▭',
               nota: 'Dobrado no bolso de trás desde as sete da manhã.' },
  broche:    { nome: 'Broche com o número 40', icone: '◉',
               nota: 'Pendurado na camiseta, do lado do peito.' },
  adesivo:   { nome: 'Adesivo de campanha', icone: '▰',
               nota: 'Colado na alça da mochila.' },
  camiseta:  { nome: 'Camiseta número 40', icone: '▤',
               nota: 'Vestida. É a única peça de campanha no seu corpo.' },
  santinhos: { nome: 'Santinhos da campanha', icone: '▯',
               nota: 'Sobraram da campanha e continuam na embalagem.' },
  chave:     { nome: 'Chave do carro', icone: '⚿',
               nota: 'O carro está a duas quadras da sua seção.' },
  bandeira:  { nome: 'Bandeira da candidatura', icone: '⚑',
               nota: 'Dobrada debaixo do braço até você chegar à calçada.' },
  celular:   { nome: 'Celular', icone: '▮',
               nota: 'A coordenação manda mensagem a cada meia hora.' }
};

window.REGRAS = {
  /* Experiência por conduta escolhida. O SINAL é o que ensina: a conduta
     conforme RENDE experiência, e o ilícito DEVOLVE — quanto mais grave, mais
     devolve. A experiência nunca fica negativa: ela para em zero.

     As duas naturezas ilícitas têm preços diferentes porque a lei as trata
     diferentemente: 'vedacao' é a conduta que o § 1º do art. 39-A diz "É
     vedada", e 'crime' é o que o art. 39, § 5º, pune com detenção. */
  xp: { conforme: 40, vedacao: -20, crime: -40 }
};
