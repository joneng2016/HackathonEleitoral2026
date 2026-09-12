/* =============================================================================
 * ARQUIVO DE DADOS — US-12
 * -----------------------------------------------------------------------------
 * Todo o conteúdo jurídico e pedagógico do jogo reside AQUI.
 * Alterar este arquivo altera o jogo, sem tocar em uma linha de código.
 *
 * ESTRUTURA DO JOGO
 *   AVATARES   o jovem candidato escolhido pelo jogador
 *   FASES      as duas candidaturas, com as situações de cada uma
 *   CENAS      as seis situações de ilícito a que o candidato é exposto
 *
 * CAMPOS DE UMA SITUAÇÃO
 *   id                identificador único
 *   fase              a que fase pertence (ver FASES)
 *   titulo            título curto exibido no cartão
 *   enunciado         a situação a que o candidato é exposto
 *   ilustracao        chave da ilustração (ver js/ilustracoes.js)
 *   descricaoImagem   texto alternativo da ilustração (acessibilidade)
 *   veredito          'permitido' | 'crime' | 'ambiguo'
 *   defensaveis       alternativas aceitas. Mais de uma = SEM RESPOSTA
 *                     FECHADA, e o jogo declara isso expressamente (RF-06/US-08)
 *   justificativa     fundamento em linguagem acessível (RNF-06).
 *                     Uma linha em branco separa parágrafos.
 *   baseLegal         referência normativa
 *   erroPorAlternativa  explicação do equívoco, por alternativa incorreta (US-09)
 *
 * ALTERNATIVAS (rótulos fixos — RF-02; a ORDEM de exibição é sorteada)
 *   'permitido'  → "Permitido"
 *   'observar'   → "Preciso observar melhor"
 *   'crime'      → "É crime"
 * ========================================================================== */

/* =============================================================================
 * TRANSCRIÇÕES LITERAIS — Lei nº 9.504/97
 * -----------------------------------------------------------------------------
 * Os textos abaixo são citados entre aspas nas telas de retorno. Uma citação
 * entre aspas que não reproduza o dispositivo é pior do que nenhuma citação:
 * ensina uma norma que não existe. Se precisar corrigir, corrija AQUI — todas
 * as situações que citam o mesmo dispositivo passam a exibir o texto novo.
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
    descricao: 'Jovem de pele retinta e cabelo crespo escuro.',
    pele: '#7d4c2e',
    cabelo: '#1a1a1a',
    camisa: '#c98a3c'
  },
  {
    id: 'av3',
    nome: 'Carla',
    descricao: 'Jovem de pele clara e cabelo castanho claro.',
    pele: '#f1cba3',
    cabelo: '#8a6a3a',
    camisa: '#4f9e6a'
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
 * `exigeTodas`: o candidato só passa à fase seguinte se julgar corretamente
 * TODAS as situações da fase. O critério é rígido de propósito: cada fase tem
 * duas situações lícitas e uma criminosa (ou sem resposta fechada), de modo
 * que nenhuma resposta repetida — sempre "Permitido", sempre "É crime" —
 * alcança as três. Só passa quem julga caso a caso.
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
      'votar — mas o dia reserva situações que exigem julgamento.',
    exigeTodas: true,
    situacoes: ['c01', 'c02', 'c03']
  },
  {
    id: 'f2',
    numero: 2,
    cargo: 'Deputado Estadual',
    chamada: 'O passo seguinte',
    descricao:
      'Você venceu a eleição para vereador e, dois anos depois, disputa uma ' +
      'cadeira na Assembleia Legislativa. O cargo é maior, e as situações ' +
      'deste dia de eleição estão mais próximas do limite entre o permitido ' +
      'e o criminoso.',
    exigeTodas: true,
    situacoes: ['c04', 'c05', 'c06']
  }
];

/* =============================================================================
 * AS SEIS SITUAÇÕES
 * ========================================================================== */
window.CENAS = [

  /* =====================================================================
   * FASE 1 — VEREADOR
   * ================================================================== */

  /* --- 1 — CONDUTA LÍCITA ------------------------------------------- */
  {
    id: 'c01',
    fase: 'f1',
    titulo: 'O broche no seu peito',
    enunciado:
      'É manhã de eleição. Você vai a pé até a escola do seu bairro para ' +
      'votar. Na camiseta, prendeu um broche com o seu próprio número e, na ' +
      'alça da mochila, um adesivo da sua candidatura. Você caminha em ' +
      'silêncio: não aborda eleitor, não discursa e não carrega material ' +
      'para repartir.',
    ilustracao: 'broche',
    descricaoImagem:
      'O jovem candidato caminha sozinho na calçada, com um broche na ' +
      'camiseta e um adesivo na alça da mochila. Ao fundo, outra pessoa ' +
      'caminha em sentido oposto, sem qualquer interação.',
    veredito: 'permitido',
    defensaveis: ['permitido'],
    justificativa:
      'Não há crime: há exercício de um direito — e ele vale também para ' +
      'quem é candidato. O broche e o adesivo são exatamente os meios que a ' +
      'lei nomeia, e a manifestação é individual, porque diz respeito só a ' +
      'você, e silenciosa, porque não aborda nem convoca ninguém.\n\n' +
      'A lei não apenas tolera essa conduta: ela a permite expressamente, e a ' +
      'palavra do dispositivo é essa mesmo, "permitida". Guarde este caso: ' +
      'ele é o padrão contra o qual você vai comparar todos os outros.',
    baseLegal: 'Art. 39-A, caput, da Lei nº 9.504/97',
    erroPorAlternativa: {
      observar:
        'Não há o que observar melhor nesta cena. A lei descreve o broche e o ' +
        'adesivo pelo nome, e a conduta é individual e silenciosa. Tratar como ' +
        'duvidoso um direito expresso é o que faz o candidato se esconder no ' +
        'dia em que ele mais precisa ser visto com naturalidade.',
      crime:
        'A leitura está equivocada porque confunde manifestação com ' +
        'propaganda. O broche e o adesivo usados individualmente estão ' +
        'nomeados na lei como meios legítimos de manifestação. Não houve ' +
        'divulgação, abordagem nem entrega de material: houve o exercício de ' +
        'um direito assegurado.'
    }
  },

  /* --- 2 — CONDUTA CRIMINOSA (crime de mera conduta) ---------------- */
  {
    id: 'c02',
    fase: 'f1',
    titulo: 'O cabo eleitoral na fila',
    enunciado:
      'Na fila da sua seção eleitoral, um cabo eleitoral da sua campanha — ' +
      'que você não mandou fazer isso — tira do bolso um maço dos seus ' +
      'santinhos e começa a entregá-los de mão em mão aos eleitores à frente. ' +
      'Ele não pede voto em voz alta e não pressiona ninguém: apenas entrega. ' +
      'Você vê a cena a poucos metros.',
    ilustracao: 'distribuicao',
    descricaoImagem:
      'Em uma fila, um cabo eleitoral estende um santinho de mão em mão a ' +
      'outro eleitor, enquanto o jovem candidato observa a poucos metros. ' +
      'Nenhum som, nenhuma faixa e nenhum alto-falante aparecem na cena.',
    veredito: 'crime',
    defensaveis: ['crime'],
    justificativa:
      'Há crime, ainda que a cena pareça uma simples cortesia — e ainda que ' +
      'você não tenha ordenado nada. A distribuição de material no dia da ' +
      'eleição é crime de mera conduta: consuma-se com a simples entrega, e ' +
      'não se exige que o eleitor tenha sido pressionado, constrangido ou ' +
      'convencido. Foi entregue a um eleitor: está consumado.\n\n' +
      'A aparência ordinária do gesto é precisamente o que o torna difícil de ' +
      'reconhecer. E o fato de a conduta ser de outra pessoa não devolve a ' +
      'tranquilidade: a lei não pergunta se o candidato mandou, pergunta se o ' +
      'material chegou à mão de um eleitor. Quem coordena uma campanha ' +
      'responde pelo que ela faz às vistas de todos.',
    baseLegal: 'Art. 39, § 5º, II, da Lei nº 9.504/97',
    erroPorAlternativa: {
      permitido:
        'A cena é feita para parecer inofensiva — e não é. Ninguém foi ' +
        'pressionado, é verdade, mas a lei não exige pressão. A distribuição é ' +
        'crime de mera conduta: basta a entrega. Como o material saiu do ' +
        'bolso de um cabo eleitoral da sua campanha e chegou à mão de um ' +
        'eleitor, a conduta está consumada.',
      observar:
        'Observar melhor ajudaria a perceber o essencial: o material saiu da ' +
        'mão de quem o trazia e chegou à mão de um eleitor. Esse é o fato que ' +
        'a norma descreve, e ele já aconteceu diante de você. Não há ' +
        'ambiguidade aqui — há uma entrega, e a entrega se consuma por si só.'
    }
  },

  /* --- 3 — CONDUTA LÍCITA (e o limite com o coletivo) --------------- */
  {
    id: 'c03',
    fase: 'f1',
    titulo: 'A camiseta na fila',
    enunciado:
      'Você entra na fila da sua seção eleitoral vestindo uma camiseta com o ' +
      'seu número e o seu nome. Você não fala sobre a eleição, não entrega ' +
      'material e não aborda ninguém. Os outros eleitores da fila vestem ' +
      'roupa comum: você é o único com a camiseta da candidatura, e não há ' +
      'grupo uniformizado.',
    ilustracao: 'camiseta',
    descricaoImagem:
      'O jovem candidato está parado na fila vestindo uma camiseta com número ' +
      'e nome impressos. Os demais eleitores usam roupas de cores diferentes ' +
      'entre si, sem padronização, e estão voltados para a frente.',
    veredito: 'permitido',
    defensaveis: ['permitido'],
    justificativa:
      'A camiseta é um dístico, e dístico é a terceira palavra do rol legal. ' +
      'Usada por uma só pessoa, sem palavra dirigida e sem entrega de ' +
      'material, ela é manifestação individual e silenciosa — exatamente o que ' +
      'o art. 39-A permite.\n\n' +
      'Repare agora no limite que o § 1º desenha: o que a lei veda é a ' +
      'aglomeração de pessoas com vestuário padronizado, capaz de ' +
      'caracterizar manifestação coletiva. Aqui há um candidato de camiseta e ' +
      'os demais com roupa comum. Individual, portanto. Estar dentro da fila ' +
      'não retira o direito: o que descaracteriza a proteção é o coletivo, o ' +
      'som e a abordagem — não a proximidade da urna.',
    baseLegal: 'Art. 39-A, caput e § 1º, da Lei nº 9.504/97',
    erroPorAlternativa: {
      observar:
        'A observação devolve a resposta, e desta vez com um critério a mais: ' +
        'um candidato, uma camiseta, os demais com roupa comum, nenhuma ' +
        'palavra dirigida, nenhum material entregue. Não há aglomeração ' +
        'padronizada, que é o que o § 1º veda.',
      crime:
        'Equívoco compreensível, mas equivocado. Vestir a camiseta com o ' +
        'próprio número é usar um dístico, meio expressamente nomeado no ' +
        'art. 39-A. Não houve divulgação, abordagem nem entrega — e a ' +
        'aglomeração de vestuário padronizado, que o § 1º proíbe, também não ' +
        'ocorreu.'
    }
  },

  /* =====================================================================
   * FASE 2 — DEPUTADO ESTADUAL
   * ================================================================== */

  /* --- 4 — CONDUTA LÍCITA (porte não é distribuição) ---------------- */
  {
    id: 'c04',
    fase: 'f2',
    titulo: 'A caixa no porta-malas',
    enunciado:
      'Você estaciona o carro a duas quadras do local de votação. No ' +
      'porta-malas fechado há uma caixa com os santinhos que sobraram da ' +
      'campanha, que serão devolvidos ao comitê no dia seguinte. Você não ' +
      'abre a caixa, não retira nada, não entrega material a eleitor algum e ' +
      'não aborda ninguém.',
    ilustracao: 'portamalas',
    descricaoImagem:
      'Um carro está estacionado com o porta-malas aberto, revelando uma ' +
      'caixa fechada e lacrada. O jovem candidato está ao lado, sem retirar ' +
      'nada da caixa e sem interagir com outras pessoas.',
    veredito: 'permitido',
    defensaveis: ['permitido'],
    justificativa:
      'Guardar não é distribuir. A lei pune a arregimentação de eleitor e a ' +
      'propaganda de boca de urna — condutas que se dirigem a alguém e que ' +
      'precisam ser demonstradas: exige-se a prova da efetiva entrega ou da ' +
      'abordagem, nunca a sua presunção.\n\n' +
      'Uma caixa fechada dentro de um carro não chega a eleitor nenhum. A ' +
      'jurisprudência é firme no sentido de que o simples porte de material, ' +
      'ainda que em grande quantidade, não configura o crime de boca de urna. ' +
      'Pune-se o ato, não a aparência do ato. Mas atenção: a linha é fina, e ' +
      'ela se rompe no instante em que a caixa se abre.',
    baseLegal:
      'Art. 39, § 5º, II, da Lei nº 9.504/97 — atipicidade do porte isolado',
    erroPorAlternativa: {
      observar:
        'Vale observar, mas a observação confirma a licitude. Não há ninguém ' +
        'sendo abordado, nada sendo entregue, nada sendo divulgado. O único ' +
        'fato existente é a guarda de material em local fechado — e o tipo ' +
        'penal não alcança a guarda, porque não descreve essa conduta.',
      crime:
        'Este é o equívoco mais comum de todos: confundir o que existe com o ' +
        'que se faz. O crime de boca de urna exige a efetiva distribuição ou a ' +
        'abordagem ao eleitor — e essa prova cabe a quem acusa, não se ' +
        'presume. Enquanto a caixa permanece fechada no porta-malas, nenhuma ' +
        'dessas condutas ocorreu.'
    }
  },

  /* --- 5 — SITUAÇÃO SEM RESPOSTA FECHADA (RF-06 / US-08) ------------ */
  {
    id: 'c05',
    fase: 'f2',
    titulo: 'A abordagem na calçada',
    enunciado:
      'A poucos metros de uma seção eleitoral, você se aproxima de um eleitor ' +
      'que não conhece, cumprimenta e diz em voz alta: "vota em mim, o número ' +
      'é 40". Você não entrega nada, não usa alto-falante, não toca em ' +
      'ninguém e não impede a passagem.',
    ilustracao: 'abordagem',
    descricaoImagem:
      'O jovem candidato e um eleitor frente a frente na calçada, próximos a ' +
      'um prédio com a inscrição "seção eleitoral". O candidato gesticula ' +
      'como quem fala; o eleitor ouve. Nenhum material é trocado.',
    veredito: 'ambiguo',
    defensaveis: ['observar', 'crime'],
    justificativa:
      'Esta é a única situação do jogo SEM RESPOSTA FECHADA, e a ausência de ' +
      'resposta faz parte do que você precisa aprender. Duas leituras são ' +
      'defensáveis.\n\n' +
      'A primeira sustenta que houve propaganda de boca de urna: a fala foi ' +
      'dirigida a um eleitor determinado, dentro do raio de influência da ' +
      'seção, com conteúdo de pedido de voto. A segunda sustenta que o ' +
      'enquadramento exato é discutível — a jurisprudência diverge entre os ' +
      'incisos II e III em casos de fronteira, e diverge também sobre a ' +
      'exigência de um fim específico de aliciar.\n\n' +
      'Note o que NÃO está em divergência, porém: os pontos nucleares estão ' +
      'assentados, e um deles resolve esta cena. A manifestação deixa de ser ' +
      'silenciosa no instante em que se dirige a alguém, e é a silenciosidade ' +
      'que a lei protege — por isso a resposta "Permitido" não se sustenta. ' +
      'Compare com as cenas do broche e da camiseta: ali você estava em ' +
      'silêncio; aqui, você falou com alguém.',
    baseLegal:
      'Art. 39, § 5º, II e III, da Lei nº 9.504/97 — em contraste com o ' +
      'art. 39-A',
    erroPorAlternativa: {
      permitido:
        'Cuidado: é aqui que a leitura otimista tropeça. O art. 39-A protege a ' +
        'manifestação individual e SILENCIOSA. O broche no peito e a camiseta ' +
        'estavam protegidos — a fala dirigida a um eleitor, não. No momento em ' +
        'que a preferência deixa de ser silenciosa e passa a ser dirigida a ' +
        'alguém, ela sai da proteção do art. 39-A e entra no terreno da ' +
        'propaganda.'
    }
  },

  /* --- 6 — CONDUTA LÍCITA ------------------------------------------- */
  {
    id: 'c06',
    fase: 'f2',
    titulo: 'A bandeira apoiada no chão',
    enunciado:
      'Em frente à sua seção eleitoral, você apoia no chão uma bandeira da sua ' +
      'candidatura e permanece ao lado dela, em silêncio. Você não discursa, ' +
      'não chama eleitores, não usa som e não entrega nada a ninguém.',
    ilustracao: 'bandeira',
    descricaoImagem:
      'O jovem candidato está parado ao lado de uma bandeira apoiada no chão, ' +
      'em frente a um prédio com a inscrição "seção eleitoral". Ele está em ' +
      'silêncio e não há interlocutor.',
    veredito: 'permitido',
    defensaveis: ['permitido'],
    justificativa:
      'A bandeira é o primeiro dos meios nomeados pela lei, e os dois ' +
      'requisitos da manifestação permitida estão presentes: ela é individual, ' +
      'porque é de uma só pessoa, e silenciosa, porque nada é dirigido a ' +
      'alguém.\n\n' +
      'O que a lei pune no dia da eleição é a propaganda — o som, o comício, ' +
      'a carreata, a abordagem —, não a presença de uma bandeira. Este é o ' +
      'último caso do jogo, e ele fecha o critério: compare-o com a cena da ' +
      'calçada. Lá você falou; aqui você apenas está.',
    baseLegal: 'Art. 39-A, caput, da Lei nº 9.504/97',
    erroPorAlternativa: {
      observar:
        'A cena é clara o bastante para dispensar observação adicional. ' +
        'Bandeira é meio expressamente nomeado na lei, e os dois requisitos — ' +
        'individual e silencioso — estão atendidos. A dúvida aqui não decorre ' +
        'da cena, mas da suposição de que a proximidade da seção eleitoral ' +
        'tornaria tudo ilícito.',
      crime:
        'Equívoco frequente, e é exatamente ele que a lei quis desfazer. A ' +
        'bandeira individual e silenciosa está no rol do art. 39-A como ' +
        'manifestação permitida. Não há alto-falante, comício, carreata, ' +
        'abordagem nem entrega de material.'
    }
  }

];

/* -----------------------------------------------------------------------------
 * O texto legal de cada situação é montado a partir de window.LEI, para que uma
 * correção no dispositivo se propague a todas as situações que o citam.
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

  var porId = {};
  window.CENAS.forEach(function (c) { porId[c.id] = c; });

  porId.c01.textoLegal = citar(L.art39A);
  porId.c03.textoLegal = citar(L.art39A + ' ' + L.art39AP1);

  porId.c02.textoLegal = art39([L.art39II]);
  porId.c04.textoLegal = art39([L.art39II]);

  /* II e III são incisos vizinhos: entre eles não há omissão a marcar */
  porId.c05.textoLegal = art39([L.art39II, L.art39III]) +
                         ' — em contraste com o art. 39-A: ' + citar(L.art39A);

  porId.c06.textoLegal = citar(L.art39A);
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
