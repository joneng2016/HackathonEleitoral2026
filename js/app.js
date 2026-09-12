/* =============================================================================
 * ILÍCITOS EM JOGO — lógica da aplicação
 * -----------------------------------------------------------------------------
 * O jogador é um jovem candidato. Ele cria o personagem — retrato e história —
 * e vai direto ao dia da eleição, decidindo o que FAZER em seis circunstâncias,
 * três em cada candidatura. Ao fim de cada candidatura, uma juíza do TRE julga
 * as condutas que ele escolheu.
 *
 * DOIS MEDIDORES, E ELES NÃO SE MISTURAM
 * -----------------------------------------------------------------------------
 * A EXPERIÊNCIA (js/ficha.js) mede a CAMPANHA: a conduta conforme rende
 * experiência, o ilícito devolve, e é esse número — e só ele — que diz em que
 * nível o candidato está. Não há atributo, não há dado e não há dinheiro: a
 * ficha do candidato tem um número só.
 *
 * O ÍNDICE DE ILÍCITOS mede a CONDUTA: quantas vezes, naquela candidatura, o
 * jogador escolheu uma conduta que a lei alcança. Só ele decide o julgamento
 * da juíza: nenhum ilícito ou um, a candidatura passa — com um, com
 * advertência; dois ou mais, o registro é indeferido.
 *
 * Essa separação é o ponto. Se a experiência decidisse o julgamento, um
 * personagem de nível alto se sairia melhor diante da lei — e o jogo ensinaria
 * exatamente o contrário do que quer ensinar. Dois candidatos com experiências
 * opostas, que escolham as mesmas condutas, são julgados igualmente.
 *
 * ESTADOS
 *   'capa'    → a abertura
 *   'avatar'  → escolha do retrato              (RF-14 / RF-15)
 *   'origem'  → a história de onde o candidato vem
 *   'cena'    → a circunstância e as quatro condutas oferecidas
 *   'retorno' → fundamentação da conduta, e a consequência na campanha
 *   'juiza'   → o julgamento da candidatura, e depois a apuração
 *   'eleito'  → candidatura deferida; passa à candidatura seguinte
 *   'derrota' → candidatura indeferida na fase 1; refaz a fase
 *   'final'   → encerramento da carreira
 *
 * Arquitetura: estado explícito, separação entre estado / lógica / renderização
 * / entrada. Sem framework, sem dependência, sem build.
 * ========================================================================== */

(function () {
  'use strict';

  var AVATARES = window.AVATARES || [];
  var FASES    = window.FASES || [];
  var CENAS    = window.CENAS || [];
  var ORIGENS  = window.ORIGENS || [];
  var JUIZA    = window.JUIZA || null;
  var SORTE    = window.SORTE || null;

  var POR_ID = {};
  CENAS.forEach(function (c) { POR_ID[c.id] = c; });

  /* O LIMITE DE ILÍCITOS DA CANDIDATURA. Um ilícito, e só um: com ele o
     registro passa advertido; a partir do segundo, é indeferido. O número é
     único para o jogo inteiro, e as fases o declaram em `tolera` — o jogo se
     recusa a abrir quando a declaração discorda dele. */
  var LIMITE_ILICITOS = 1;

  /* As três naturezas de uma conduta. A distinção entre 'crime' e 'vedacao'
     não é decorativa: o § 1º do art. 39-A diz "É vedada", e não "constitui
     crime". As duas contam no índice — as duas são ilícitas —, mas o retorno
     diz QUAL ilícito o jogador cometeu, porque tratar tudo como crime
     ensinaria direito errado. */
  var NATUREZA = {
    conforme: { rotulo: 'Conduta conforme', curto: 'conforme', marca: '✔', tom: 'permitido' },
    crime:    { rotulo: 'Crime',            curto: 'crime',    marca: '⚠', tom: 'crime' },
    vedacao:  { rotulo: 'Conduta vedada',   curto: 'vedada',   marca: '⊘', tom: 'observar' }
  };

  var TEXTO_ESTADO = {
    certo:      'Conduta conforme',
    errado:     'Conduta ilícita',
    defensavel: 'Ilícito não penal'
  };

  var ICONE_ESTADO = { certo: '✔', errado: '⚠', defensavel: '⊘' };

  /* `tela` é a guarda de reentrância: toda transição a sobrescreve antes de
     renderizar, de modo que um segundo toque no mesmo instante encontra a
     tela já trocada e é ignorado. */
  var estado = {
    tela: 'capa',
    avatar: null,
    origem: null,
    personagem: null,
    fase: 0,
    cena: 0,
    escolhas: [],       /* { idCena, idOpcao, natureza, ilicito } */
    /* O índice é o da CANDIDATURA corrente. Cada fase é uma candidatura, e
       cada candidatura responde pelos próprios ilícitos — por isso ele zera ao
       abrir a fase seguinte. O acumulado aparece no encerramento. */
    ilicitoFase: 0,
    ilicitoCarreira: 0,
    etapaJuiza: null,   /* 'julgamento' | 'apuracao' */
    sorteio: null,
    ultimoJulgamento: null,
    /* ponto de retorno da campanha: a ficha volta a este estado se o jogador
       refizer a fase. A lição aprendida não volta atrás; a campanha sim. */
    retornoFase: null,
    ultimaFaseImpugnada: false
  };

  /* Ordem de exibição das condutas nesta circunstância. O arquivo de dados
     agrupa as conformes antes das ilícitas; exibi-las como estão faria da
     posição um gabarito. A ordem é sorteada a cada circunstância, e as teclas
     1-4 acompanham a posição exibida. */
  var ordemAtual = null;
  var cenaDaOrdem = null;

  function embaralhar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function ordemDaCena(cena) {
    if (!cena) return [];
    if (cenaDaOrdem !== cena.id || !ordemAtual) {
      ordemAtual = embaralhar(cena.opcoes);
      cenaDaOrdem = cena.id;
    }
    return ordemAtual;
  }

  /* ----------------------------------------------------------- UTILIDADES */
  function $(sel, raiz) { return (raiz || document).querySelector(sel); }

  function escapar(txt) {
    return String(txt).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Quebra o texto em parágrafos. O autor separa os parágrafos com uma linha
     em branco no arquivo de dados. */
  function paragrafos(txt) {
    return String(txt).split(/\n\s*\n/).map(function (p) {
      return '<p class="retorno__justificativa">' + escapar(p.trim()) + '</p>';
    }).join('');
  }

  function naturezaDe(chave) { return NATUREZA[chave] || NATUREZA.conforme; }

  function ehIlicito(opcao) { return opcao.natureza !== 'conforme'; }

  /* A experiência vem de js/ficha.js. Se o arquivo faltar, o jogo continua
     jogável — sem campanha, mas jogável. */
  function temFicha() { return !!(window.RPG && window.RPGUI); }

  /* ------------------------------------------------------------- FASES */
  function faseAtual() { return FASES[estado.fase] || null; }

  function situacoesDaFase(i) {
    var f = FASES[i];
    if (!f) return [];
    return f.situacoes.map(function (id) { return POR_ID[id]; })
                      .filter(function (c) { return !!c; });
  }

  function cenaAtual() { return situacoesDaFase(estado.fase)[estado.cena] || null; }

  function escolhaDe(idCena) {
    for (var i = 0; i < estado.escolhas.length; i++) {
      if (estado.escolhas[i].idCena === idCena) return estado.escolhas[i];
    }
    return null;
  }

  function opcaoDe(cena, idOpcao) {
    for (var i = 0; i < cena.opcoes.length; i++) {
      if (cena.opcoes[i].id === idOpcao) return cena.opcoes[i];
    }
    return null;
  }

  function ilicitoDaFase(i) {
    return situacoesDaFase(i).reduce(function (soma, c) {
      var e = escolhaDe(c.id);
      return soma + (e && e.ilicito ? 1 : 0);
    }, 0);
  }

  function licitoDaFase(i) {
    return situacoesDaFase(i).length - ilicitoDaFase(i);
  }

  function ilicitoTotal() {
    return estado.escolhas.filter(function (e) { return e.ilicito; }).length;
  }

  /* O VEREDITO É O NÚMERO DE ILÍCITOS. Não é uma soma de gravidade: cada
     circunstância vale um ato, o ato é lícito ou ilícito, e o que decide é
     quantos ilícitos a candidatura somou.

       nenhum ilícito  → DEFERIDA   (o registro passa sem ressalva)
       um ilícito      → DEFERIDA   (passa com advertência, e o registro fica)
       dois ou mais    → INDEFERIDA (o registro é negado, e a fase se refaz)

     Duas notas sobre a regra:

     - ELA NÃO OLHA OS ATOS LÍCITOS. Uma candidatura de três atos com dois
       ilícitos é indeferida, e uma de dez atos com dois ilícitos também. O
       que a juíza lê é o número de condutas que a lei alcança — não a
       proporção delas.
     - `tolera`, nos dados, continua declarado pela fase, e o teste de ambiente
       recusa abrir o jogo quando a declaração discorda do limite — uma fonte
       só decide, e a outra é conferida contra ela.

     O veredito olha a CANDIDATURA, e não a carreira: o índice zera a cada
     fase, e a conta se refaz com os atos daquela candidatura. */
  function indeferida(i) {
    var atos = situacoesDaFase(i).length;
    return atos > 0 && ilicitoDaFase(i) > LIMITE_ILICITOS;
  }

  /* O nome do estado continua 'impugnacao' porque é o que o CSS e o harness
     conhecem; o veredito que ele pinta é o indeferimento do registro. */
  function situacaoDaFase(i) {
    var n = ilicitoDaFase(i);
    if (!FASES[i]) return 'limpo';
    if (indeferida(i)) return 'impugnacao';
    if (n > 0) return 'advertencia';
    return 'limpo';
  }

  function descartarEscolhasDaFase(i) {
    var ids = situacoesDaFase(i).map(function (c) { return c.id; });
    estado.escolhas = estado.escolhas.filter(function (e) {
      return ids.indexOf(e.idCena) === -1;
    });
  }

  /* ------------------------------------------------------------ RENDERIZA */
  function renderizarFicha() {
    var alvo = $('#ficha');
    if (!alvo) return;

    var duranteCriacao = (estado.tela === 'avatar' || estado.tela === 'origem');
    if (duranteCriacao || !estado.personagem || !temFicha()) {
      alvo.hidden = true;
      alvo.innerHTML = '';
      return;
    }

    var f = faseAtual();
    alvo.innerHTML = window.RPGUI.hud(estado.personagem,
      f ? { cargo: 'Fase ' + f.numero + ' · ' + f.cargo } : {});
    alvo.hidden = false;
  }

  function renderizarIndice() {
    var alvo = $('#indice');
    if (!alvo) return;

    if (estado.tela === 'avatar' || estado.tela === 'origem') {
      alvo.hidden = true;
      alvo.innerHTML = '';
      return;
    }

    var n = ilicitoDaFase(estado.fase);
    var atos = situacoesDaFase(estado.fase).length;
    var situacao = situacaoDaFase(estado.fase);
    var pct = atos ? n / atos * 100 : 0;

    var frase = {
      limpo: 'Nenhum ilícito. A candidatura vai limpa.',
      advertencia: 'Um ilícito em ' + atos + ' circunstâncias: a candidatura ' +
        'passa com advertência — mas o registro fica.',
      impugnacao: n + ' ilícitos: passou do limite de ' + LIMITE_ILICITOS +
        ', e por isso a candidatura está indeferida.'
    }[situacao];

    /* Uma marca por ATO, acesa a cada ilícito. A segunda marca é a DO LIMITE:
       é ali que a candidatura deixa de concorrer, e é isso que a escala
       precisa mostrar antes de o jogador chegar lá. */
    var marcas = '';
    for (var i = 0; i < atos; i++) {
      marcas += '<span class="indice__marca' + (i < n ? ' indice__marca--cheia' : '') +
               (i === LIMITE_ILICITOS ? ' indice__marca--limite' : '') +
               '" aria-hidden="true"></span>';
    }

    alvo.innerHTML = '' +
      '<span class="indice__rotulo">Ilícitos na candidatura</span>' +
      '<span class="indice__barra"><i style="width:' + pct + '%"></i></span>' +
      '<span class="indice__marcas">' + marcas + '</span>' +
      '<b class="indice__valor">' + n + '</b>' +
      '<span class="indice__frase">' + escapar(frase) + '</span>';

    alvo.setAttribute('data-estado', situacao);
    alvo.hidden = false;
  }

  function renderizarTrilha() {
    var trilha = $('#trilha');
    var situacoes = situacoesDaFase(estado.fase);
    var html = '';

    for (var i = 0; i < situacoes.length; i++) {
      var e = escolhaDe(situacoes[i].id);
      var st = 'pendente';
      if (e) st = e.natureza === 'conforme' ? 'certo'
                : (e.natureza === 'crime' ? 'errado' : 'defensavel');
      else if (i === estado.cena && (estado.tela === 'cena' || estado.tela === 'retorno')) {
        st = 'atual';
      }

      var rotulo = 'Circunstância ' + (i + 1) + ' de ' + situacoes.length + ': ';
      rotulo += e ? TEXTO_ESTADO[st] : (st === 'atual' ? 'circunstância atual' : 'não decidida');

      html += '<span class="trilha__passo" data-estado="' + st + '" title="' +
              escapar(rotulo) + '"></span>';
    }

    trilha.innerHTML = html;
    trilha.hidden = (estado.tela === 'avatar' || estado.tela === 'origem');
    trilha.setAttribute('aria-valuemax', String(situacoes.length));
    trilha.setAttribute('aria-valuenow', String(Math.min(estado.cena, situacoes.length)));
    trilha.setAttribute('aria-valuetext',
      'Fase ' + (estado.fase + 1) + ': ' + estado.escolhas.length +
      ' circunstâncias decididas no total');
  }

  function renderizarCabecalho() {
    var contador = $('#contador');
    var f = faseAtual();

    /* O cabeçalho vivo mentiria sobre um jogo que ainda não começou: a capa é
       a única tela sem contador, sem trilha, sem ficha e sem índice. */
    var cab = $('.cabecalho');
    if (cab) cab.hidden = (estado.tela === 'capa');

    if (estado.tela === 'avatar') {
      contador.innerHTML = 'Criação de personagem';
    } else if (estado.tela === 'origem') {
      contador.innerHTML = 'Criação de personagem';
    } else if (estado.tela === 'final') {
      contador.innerHTML = 'Candidatura encerrada';
    } else if (estado.tela === 'juiza') {
      contador.innerHTML = 'Fase <b>' + f.numero + '</b> · julgamento';
    } else if (!f) {
      contador.innerHTML = '';
    } else {
      contador.innerHTML = 'Fase <b>' + f.numero + '</b> · ' + escapar(f.cargo);
    }
    renderizarTrilha();
    renderizarFicha();
    renderizarIndice();
  }

  /* --- Tela: a capa ------------------------------------------------- */
  /* A capa é a única tela que não pede nada: ela se apresenta e sai. Não tem
     botão — qualquer tecla e qualquer toque servem —, e por isso não há nada
     nela que possa ser mal clicado. */
  function telaCapa() {
    $('#palco').innerHTML = '' +
      '<section class="capa entra">' +
        '<figure class="capa__figura" role="img" aria-label="' +
          'A seção eleitoral, a fila de eleitores de costas, a urna com a ' +
          'cédula na fenda e, sobre a rua, o medalhão da Justiça com a balança.">' +
          (typeof window.ilustracaoDaCapa === 'function'
            ? window.ilustracaoDaCapa() : '') +
        '</figure>' +
        '<div class="capa__texto">' +
          '<p class="capa__rotulo">Um jogo de decisão sobre o dia da eleição</p>' +
          '<h1 class="capa__titulo" id="titulo-capa" tabindex="-1">' +
            'Ilícitos em Jogo</h1>' +
          '<p class="capa__chamada">O que você faz no dia da eleição?</p>' +
          '<p class="capa__sinopse">Você tem dezenove anos, acaba de tirar o ' +
            'título de eleitor e é candidato pela primeira vez. São duas ' +
            'candidaturas, seis circunstâncias no dia da eleição e quatro ' +
            'condutas em cada uma — e nenhuma tela diz qual delas é lícita. ' +
            'Esse julgamento é seu, e é ele que decide se a sua candidatura ' +
            'sobrevive ao pleito.</p>' +
          '<p class="capa__dica">Toque na tela, clique ou pressione qualquer ' +
            'tecla para começar</p>' +
        '</div>' +
      '</section>';

    var t = $('#titulo-capa');
    if (t) t.focus({ preventScroll: true });
  }

  /* --- Tela: escolha do avatar (RF-14 / RF-15) --------------------- */
  function telaAvatar() {
    var cartoes = AVATARES.map(function (av, i) {
      return '' +
        '<button class="avatar" type="button" data-avatar="' + escapar(av.id) + '" ' +
                'aria-label="Escolher ' + escapar(av.nome) + '. ' + escapar(av.descricao) + '">' +
          '<span class="avatar__retrato" aria-hidden="true">' +
            (typeof window.retratoDoAvatar === 'function' ? window.retratoDoAvatar(av) : '') +
          '</span>' +
          '<span class="avatar__nome">' + escapar(av.nome) + '</span>' +
          '<span class="avatar__tecla" aria-hidden="true">' + (i + 1) + '</span>' +
        '</button>';
    }).join('');

    $('#palco').innerHTML = '' +
      '<section class="abertura entra">' +
        '<p class="passo">Passo 1 de 2 · o retrato</p>' +
        '<h1 class="abertura__titulo" id="titulo-avatar" tabindex="-1">' +
          'Quem vai disputar esta eleição?</h1>' +
        '<p class="abertura__texto">Você tem dezenove anos e vai concorrer a ' +
          'vereador do seu município. Escolha o retrato do seu personagem — é ' +
          'ele que aparece em todas as cenas, marcado com a etiqueta "VOCÊ".' +
        '</p>' +
        '<div class="avatares" role="group" aria-labelledby="titulo-avatar">' +
          cartoes +
        '</div>' +
        '<p class="abertura__nota">O retrato é só visual: ele não altera ' +
          'nada do jogo nem o julgamento das condutas.</p>' +
      '</section>';

    var t = $('#titulo-avatar');
    if (t) t.focus({ preventScroll: true });
  }

  /* --- Tela: escolha da história (a origem) ------------------------ */
  function telaOrigem() {
    var cartoes = ORIGENS.map(function (org, i) {
      return '' +
        '<button class="origem" type="button" data-origem="' + escapar(org.id) + '" ' +
                'aria-label="Escolher a origem ' + escapar(org.nome) + '">' +
          '<span class="origem__topo">' +
            '<span class="origem__nome">' + escapar(org.nome) + '</span>' +
            '<span class="origem__tecla" aria-hidden="true">' + (i + 1) + '</span>' +
          '</span>' +
          '<span class="origem__desc">' + escapar(org.descricao) + '</span>' +
          '<span class="origem__lema">' + escapar(org.lema) + '</span>' +
        '</button>';
    }).join('');

    $('#palco').innerHTML = '' +
      '<section class="abertura entra">' +
        '<p class="passo">Passo 2 de 2 · a história</p>' +
        '<h1 class="abertura__titulo" id="titulo-origem" tabindex="-1">' +
          'De onde você vem?</h1>' +
        '<p class="abertura__texto">Esta é a história do cidadão que vai ' +
          'disputar a eleição. Nenhuma origem é melhor que as outras: todas ' +
          'começam no mesmo lugar e são julgadas pelas mesmas condutas. O que ' +
          'muda é quem você decide ser antes de o dia começar.</p>' +
        '<div class="origens" role="group" aria-labelledby="titulo-origem">' +
          cartoes +
        '</div>' +
        '<p class="abertura__nota">A história é só narrativa: ela não altera ' +
          'nada do jogo. O que decide o julgamento da sua candidatura são as ' +
          'condutas que você escolher no dia da eleição.</p>' +
      '</section>';

    var t = $('#titulo-origem');
    if (t) t.focus({ preventScroll: true });
  }

  /* --- Tela: a circunstância e as condutas possíveis ---------------- */
  function telaCena() {
    var cena = cenaAtual();
    var f = faseAtual();
    if (!cena) { telaFinal(); return; }

    var total = situacoesDaFase(estado.fase).length;

    var opcoes = ordemDaCena(cena).map(function (o, pos) {
      return '' +
        '<button class="conduta" type="button" data-opcao="' + escapar(o.id) + '">' +
          '<span class="conduta__tecla" aria-hidden="true">' + (pos + 1) + '</span>' +
          '<span class="conduta__texto">' + escapar(o.texto) + '</span>' +
        '</button>';
    }).join('');

    /* na primeira circunstância de uma fase, reapresenta a candidatura e a
       narração que a abre */
    var abertura = (estado.cena === 0)
      ? '<div class="fase-abertura">' +
          '<p class="fase-abertura__titulo">' + escapar(f.chamada) + '</p>' +
          '<p class="fase-abertura__texto">' + escapar(f.descricao) + '</p>' +
          (f.abertura
            ? '<p class="fase-abertura__texto">' + escapar(f.abertura) + '</p>'
            : '') +
        '</div>'
      : '';

    var inventario = temFicha() ? window.RPGUI.inventario(cena.itens) : '';

    $('#palco').innerHTML = '' +
      '<article class="cena entra">' +
        '<figure class="cena__figura" role="img" aria-label="' +
            escapar(cena.descricaoImagem) + '">' +
          (typeof window.ilustracaoDaCena === 'function'
            ? window.ilustracaoDaCena(cena.ilustracao, estado.avatar)
            : '') +
        '</figure>' +
        '<div class="cena__corpo">' +
          '<p class="cena__rotulo">Fase ' + f.numero + ' · ' + escapar(f.cargo) +
             ' — circunstância ' + (estado.cena + 1) + ' de ' + total + '</p>' +
          abertura +
          '<h1 class="cena__titulo" id="titulo-cena" tabindex="-1">' +
            escapar(cena.titulo) + '</h1>' +
          '<p class="cena__enunciado">' + escapar(cena.contexto) + '</p>' +
          inventario +
          '<p class="cena__pergunta" id="pergunta-conduta">' +
             'O que você faz?</p>' +
          '<div class="condutas" role="group" aria-labelledby="pergunta-conduta">' +
            opcoes +
          '</div>' +
        '</div>' +
      '</article>';

    var titulo = $('#titulo-cena');
    if (titulo) titulo.focus({ preventScroll: true });
  }

  /* --- Tela: retorno com a fundamentação e a consequência ----------- */
  function telaRetorno() {
    var cena = cenaAtual();
    var e = escolhaDe(cena.id);
    var escolhida = opcaoDe(cena, e.idOpcao);
    var nat = naturezaDe(escolhida.natureza);

    /* Todas as quatro condutas, com o que cada uma era. O jogador precisa
       saber o que as outras opções significavam: a que ele não escolheu é,
       muitas vezes, a que ele ainda não sabe julgar. */
    var revisao = ordemDaCena(cena).map(function (o) {
      var n = naturezaDe(o.natureza);
      var foi = (o.id === escolhida.id);
      return '' +
        '<li class="conduta-rev' + (foi ? ' conduta-rev--escolhida' : '') + '" ' +
            'data-natureza="' + escapar(o.natureza) + '">' +
          '<span class="conduta-rev__marca" aria-hidden="true">' + n.marca + '</span>' +
          '<span class="conduta-rev__texto">' +
            '<span class="conduta-rev__frase">' + escapar(o.texto) + '</span>' +
            '<span class="conduta-rev__rotulo">' + escapar(n.rotulo) +
              (foi ? ' · foi a sua escolha' : '') + '</span>' +
          '</span>' +
        '</li>';
    }).join('');

    var blocoIlicito = '';
    if (ehIlicito(escolhida)) {
      blocoIlicito = '' +
        '<div class="bloco-erro" data-natureza="' + escapar(escolhida.natureza) + '">' +
          '<h3>' + (escolhida.natureza === 'crime'
                      ? 'Esta conduta é crime'
                      : 'Esta conduta é vedada pela lei eleitoral') + '</h3>' +
          '<p>' + escapar('Ela entrou no seu índice de ilícitos. ' +
            (escolhida.natureza === 'crime'
              ? 'O índice conta os crimes e as condutas vedadas — e o que ele ' +
                'registra não desaparece porque a eleição deu certo.'
              : 'O índice conta os crimes e as condutas vedadas. Esta não é ' +
                'crime: o § 1º do art. 39-A diz "É vedada", e não "constitui ' +
                'crime" — mas é ilícita, e também fica registrada.')) + '</p>' +
        '</div>';
    }

    /* A consequência na campanha: a experiência reage à conduta escolhida.
       Fica separada do bloco jurídico de propósito — são dois medidores
       distintos, e o jogador precisa ver que um não é o outro. */
    var consequencia = '';
    if (temFicha() && estado.ultimoJulgamento) {
      var d = estado.ultimoJulgamento;
      consequencia = '' +
        '<div class="consequencia" data-tom="' + (ehIlicito(escolhida) ? 'errado' : 'certo') + '">' +
          '<p class="consequencia__rotulo">Na campanha</p>' +
          '<p class="consequencia__texto">' +
            escapar(ehIlicito(escolhida)
              ? 'A conduta ilícita devolve experiência: errar custa, e o custo ' +
                'sai do mesmo número que o acerto faz crescer. Mas atenção ao ' +
                'que decide o seu julgamento — quem lê o seu registro é o ' +
                'índice de ilícitos, e não a sua experiência.'
              : 'A campanha sai maior do que entrou: a conduta conforme rende ' +
                'experiência.') +
          '</p>' +
          window.RPGUI.efeitos(d) +
          (d.subiuNivel
            ? '<p class="consequencia__nivel">Você subiu para o nível ' +
              d.nivel.nivel + ' — ' + escapar(d.nivel.titulo) + '.</p>'
            : '') +
          (d.desceuNivel
            ? '<p class="consequencia__nivel">Você desceu para o nível ' +
              d.nivel.nivel + ' — ' + escapar(d.nivel.titulo) + '.</p>'
            : '') +
        '</div>';
    }

    var ultima = (estado.cena === situacoesDaFase(estado.fase).length - 1);
    var rotuloBotao = !ultima ? 'Próxima circunstância →'
                    : 'Ir ao julgamento da candidatura →';

    $('#palco').innerHTML = '' +
      '<article class="retorno entra" data-tom="' + nat.tom + '">' +
        '<div class="retorno__topo">' +
          '<span class="selo">' + escapar(nat.rotulo) + '</span>' +
          '<h1 class="retorno__veredito" id="titulo-retorno" tabindex="-1">' +
            escapar(escolhida.titulo) + '</h1>' +
          '<p class="retorno__escolha">Você decidiu: <strong>' +
            escapar(escolhida.texto) + '</strong></p>' +
        '</div>' +
        '<div class="retorno__corpo">' +
          '<div class="retorno__texto">' + paragrafos(escolhida.justificativa) + '</div>' +
          blocoIlicito +
          consequencia +
          '<div class="base-legal">' +
            '<h3>Base legal</h3>' +
            '<p class="base-legal__ref">' + escapar(escolhida.baseLegal) + '</p>' +
            '<blockquote>' + escapar(escolhida.textoLegal) + '</blockquote>' +
          '</div>' +
          '<div class="painel-condutas">' +
            '<h3 class="painel-condutas__titulo">O que eram as quatro condutas</h3>' +
            '<ul class="conduta-rev-lista">' + revisao + '</ul>' +
          '</div>' +
          '<button class="botao botao--primario" type="button" id="btn-avancar">' +
            rotuloBotao +
          '</button>' +
        '</div>' +
      '</article>';

    var t = $('#titulo-retorno');
    if (t) t.focus({ preventScroll: true });
  }

  /* --- Bloco reutilizável: revisão circunstância por circunstância -- */
  function listaRevisao(situacoes) {
    return '<ul class="revisao">' + situacoes.map(function (c, i) {
      var e = escolhaDe(c.id);
      if (!e) return '';
      var escolhida = opcaoDe(c, e.idOpcao);
      var nat = naturezaDe(escolhida.natureza);
      var st = escolhida.natureza === 'conforme' ? 'certo'
             : (escolhida.natureza === 'crime' ? 'errado' : 'defensavel');
      var certas = c.opcoes.filter(function (o) { return !ehIlicito(o); });

      return '' +
        '<li class="revisao__item" data-estado="' + st + '">' +
          '<span class="revisao__icone" aria-hidden="true">' + ICONE_ESTADO[st] + '</span>' +
          '<span class="revisao__texto">' +
            '<span class="revisao__nome">' + (i + 1) + '. ' + escapar(c.titulo) + '</span>' +
            '<span class="revisao__detalhe">' +
              escapar(nat.rotulo + ' — você decidiu: “' + escolhida.texto + '”') +
            '</span>' +
            (ehIlicito(escolhida) && certas.length
              ? '<span class="revisao__legal">Condutas conformes nesta ' +
                'circunstância: ' +
                escapar(certas.map(function (o) { return '“' + o.texto + '”'; }).join(' · ')) +
                '</span>'
              : '') +
          '</span>' +
        '</li>';
    }).join('') + '</ul>';
  }

  /* --- Tela: o julgamento da candidatura ---------------------------- */
  function telaJuiza() {
    var f = faseAtual();
    var n = ilicitoDaFase(estado.fase);
    var indeferidaAgora = indeferida(estado.fase);

    var bloco;
    if (estado.etapaJuiza === 'apuracao') {
      var s = SORTE[estado.sorteio];
      bloco = '' +
        '<div class="apuracao" data-resultado="' + escapar(estado.sorteio) + '">' +
          '<p class="apuracao__rotulo">Apuração</p>' +
          '<p class="apuracao__resultado">' + escapar(s.rotulo) + '</p>' +
          '<h2 class="apuracao__titulo">' + escapar(s.titulo) + '</h2>' +
          '<p class="apuracao__texto">' + escapar(s.texto) + '</p>' +
        '</div>' +
        '<p class="nota-jogo">' + escapar(SORTE.nota) + '</p>' +
        (temFicha() ? window.RPGUI.fichaCompleta(estado.personagem, { cargo: f.cargo }) : '') +
        '<button class="botao botao--primario" type="button" id="btn-seguir">' +
          (estado.fase === FASES.length - 1
            ? 'Ver o resultado da minha carreira →'
            : 'Disputar a eleição para ' +
              escapar(FASES[estado.fase + 1].cargo) + ' →') +
        '</button>';

    } else {
      var veredito = indeferidaAgora
        ? JUIZA.doisOuMaisIlicitos
        : (n === 0 ? JUIZA.semIlicito : JUIZA.umIlicito);

      var lista = situacoesDaFase(estado.fase).map(function (c) {
        var e = escolhaDe(c.id);
        if (!e || !e.ilicito) return '';
        var o = opcaoDe(c, e.idOpcao);
        return '<li class="ilicito-item" data-natureza="' + escapar(o.natureza) + '">' +
                 '<b>' + escapar(c.titulo) + '</b>' +
                 '<span>' + escapar(naturezaDe(o.natureza).rotulo + ' — ') +
                   escapar(o.texto) + '</span>' +
               '</li>';
      }).join('');

      bloco = '' +
        '<div class="juiza__fala">' + paragrafos(veredito.fala) + '</div>' +

        '<div class="juiza__veredito" data-veredito="' +
            (indeferidaAgora ? 'indeferida' : 'deferida') + '">' +
          '<p class="juiza__veredito-rotulo">' + escapar(veredito.rotulo) + '</p>' +
          '<h2 class="juiza__veredito-titulo">' + escapar(veredito.titulo) + '</h2>' +
        '</div>' +

        /* A CONTA À VISTA. O veredito é o número de ilícitos, e o número
           sozinho não diz nada: ele aparece ao lado do total de circunstâncias
           e do LIMITE, que é o que o jogador precisa conferir. */
        '<div class="juiza__conta">' +
          '<span class="juiza__conta-numero' + (n > 0 ? ' juiza__conta-numero--ilicito' : '') +
            '">' + n +
            '<span class="juiza__conta-rotulo">' +
              (n === 1 ? ' ilícito' : ' ilícitos') + '</span></span>' +
          '<span class="juiza__conta-x">em</span>' +
          '<span class="juiza__conta-numero">' + situacoesDaFase(estado.fase).length +
            '<span class="juiza__conta-rotulo"> circunstâncias</span></span>' +
          '<span class="juiza__conta-total">o limite é ' + LIMITE_ILICITOS +
            (LIMITE_ILICITOS === 1 ? ' ilícito' : ' ilícitos') + '</span>' +
        '</div>' +
        '<p class="juiza__regra">' + escapar(JUIZA.regra) + '</p>' +

        (lista
          ? '<div class="juiza__ilicito">' +
              '<h3>O que o índice registrou nesta candidatura</h3>' +
              '<ul class="ilicito-lista">' + lista + '</ul>' +
            '</div>'
          : '<p class="juiza__limpo">Nenhuma conduta ilícita foi registrada ' +
            'nesta candidatura.</p>') +

        '<p class="nota-jogo">' + escapar(JUIZA.nota) + '</p>' +

        '<button class="botao botao--primario" type="button" id="btn-julgar">' +
          (indeferidaAgora
            ? 'Aceitar o julgamento →'
            : 'Acompanhar a apuração →') +
        '</button>';
    }

    $('#palco').innerHTML = '' +
      '<div class="final final--juiza entra">' +
        '<section class="juiza" id="topo-juiza" tabindex="-1">' +
          '<figure class="juiza__figura" role="img" aria-label="' +
            escapar('A juíza eleitoral, negra e cadeirante, em toga, sentada ' +
                    'em sua cadeira de rodas diante da mesa de audiência, com ' +
                    'o emblema do Tribunal Regional Eleitoral ao fundo.') + '">' +
            (typeof window.ilustracaoDaJuiza === 'function'
              ? window.ilustracaoDaJuiza() : '') +
          '</figure>' +
          '<div class="juiza__corpo">' +
            '<p class="cena__rotulo">Fase ' + f.numero + ' · ' + escapar(f.cargo) +
               ' — julgamento da candidatura</p>' +
            '<h1 class="juiza__titulo">' + escapar(JUIZA.nome) + '</h1>' +
            '<p class="juiza__apresentacao">' + escapar(JUIZA.apresentacao) + '</p>' +
            bloco +
          '</div>' +
        '</section>' +
      '</div>';

    var t = $('#topo-juiza');
    if (t) t.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  /* --- Tela: candidatura deferida (passa à candidatura seguinte) ---- */
  function telaEleito() {
    var f = faseAtual();
    var proxima = FASES[estado.fase + 1];
    var n = ilicitoDaFase(estado.fase);

    $('#palco').innerHTML = '' +
      '<div class="final entra">' +
        '<section class="placar placar--vitoria" id="topo-eleito" tabindex="-1">' +
          '<p class="placar__rotulo">Fase ' + f.numero + ' · candidatura deferida</p>' +
          '<p class="placar__numero">' + n + '<span> ilícito' + (n === 1 ? '' : 's') +
            ' em ' + situacoesDaFase(estado.fase).length + '</span></p>' +
          '<h1 class="placar__titulo">Você vai disputar a eleição para ' +
            escapar(f.cargo) + '</h1>' +
          '<p class="placar__leitura">' +
            (n === 0
              ? 'Todos os atos da candidatura foram lícitos, e a juíza deferiu ' +
                'o registro sem ressalva. É esse o resultado que o jogo mede.'
              : 'Um ilícito em ' + situacoesDaFase(estado.fase).length +
                ' circunstâncias. O limite é um, e a juíza deferiu o registro ' +
                'com advertência: a candidatura concorre — mas o ilícito ficou ' +
                'registrado, e o registro não desaparece porque a eleição deu ' +
                'certo.') +
          '</p>' +
        '</section>' +

        (temFicha() ? window.RPGUI.fichaCompleta(estado.personagem, { cargo: f.cargo }) : '') +

        '<section class="painel">' +
          '<h2 class="painel__titulo">O que você decidiu nesta fase</h2>' +
          '<p class="painel__sub">A revisão abaixo é a sua prestação de contas.</p>' +
          listaRevisao(situacoesDaFase(estado.fase)) +
        '</section>' +

        '<div class="acoes-finais">' +
          '<button class="botao botao--primario" type="button" id="btn-proxima-fase">' +
            'Disputar a eleição para ' +
            escapar(proxima ? proxima.cargo : 'o cargo seguinte') +
            ' →</button>' +
        '</div>' +
      '</div>';

    var t = $('#topo-eleito');
    if (t) t.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  /* --- Tela: candidatura indeferida (refaz a fase) ------------------ */
  function telaDerrota() {
    var f = faseAtual();
    var situacoes = situacoesDaFase(estado.fase);
    var n = ilicitoDaFase(estado.fase);

    $('#palco').innerHTML = '' +
      '<div class="final entra">' +
        '<section class="placar placar--derrota" id="topo-derrota" tabindex="-1">' +
          '<p class="placar__rotulo">Fase ' + f.numero + ' · candidatura indeferida</p>' +
          '<p class="placar__numero">' + n + '<span> ilícitos em ' +
            situacoes.length + '</span></p>' +
          '<h1 class="placar__titulo">Você não vai disputar esta eleição</h1>' +
          '<p class="placar__leitura">' + n + ' ilícitos em ' + situacoes.length +
            ' circunstâncias: passou do limite de ' + LIMITE_ILICITOS +
            ', e a juíza indeferiu o registro. Não foi um passo em falso — foi ' +
            'uma candidatura em que o ilícito deixou de ser exceção e passou a ' +
            'ser a regra.</p>' +
        '</section>' +

        '<section class="painel">' +
          '<h2 class="painel__titulo">Onde a sua conduta se desviou</h2>' +
          '<p class="painel__sub">Leia a fundamentação de cada escolha antes ' +
            'de tentar de novo: é ela que decide a próxima tentativa.</p>' +
          listaRevisao(situacoes) +
        '</section>' +

        '<section class="painel painel--rp">' +
          '<h2 class="painel__titulo">A campanha volta ao ponto de partida</h2>' +
          '<p class="painel__sub">Refazer a fase devolve a CAMPANHA ao estado ' +
            'em que ela estava antes de o dia começar — a experiência volta ao ' +
            'que era, e o índice de ilícitos volta a zero junto: a candidatura ' +
            'é refeita do zero, e não é uma segunda chance sobre um registro ' +
            'já manchado. O que não volta atrás é o que você aprendeu.</p>' +
        '</section>' +

        '<div class="acoes-finais">' +
          '<button class="botao botao--primario" type="button" id="btn-refazer-fase">' +
            'Refazer a fase ' + f.numero + ' →</button>' +
        '</div>' +
      '</div>';

    var t = $('#topo-derrota');
    if (t) t.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  /* --- Epílogo: as conquistas da carreira -------------------------- */
  function conquistas() {
    var p = estado.personagem;
    var lista = [];

    if (ilicitoTotal() === 0) {
      lista.push({ nome: 'Ficha limpa', nota:
        'Você terminou a carreira sem uma única conduta ilícita nas duas ' +
        'candidaturas.' });
    }
    if (window.RPG.nivelDe(p.xp).maximo) {
      lista.push({ nome: 'Estadista', nota:
        'Você terminou a carreira com ' + p.xp + ' de experiência — o teto ' +
        'do jogo, que só uma campanha inteiramente lícita alcança.' });
    }
    var c05 = escolhaDe('c05');
    if (c05 && !c05.ilicito) {
      lista.push({ nome: 'Na linha', nota:
        'Você atravessou a circunstância de fronteira sem cometer ilícito.' });
    }
    return lista;
  }

  /* --- Tela: encerramento da carreira ------------------------------ */
  function telaFinal() {
    estado.tela = 'final';
    renderizarCabecalho();

    var ultima = FASES.length - 1;
    var indeferidaNaUltima = indeferida(ultima);
    var total = ilicitoTotal();
    var totalCircunstancias = CENAS.length;

    var titulo, leitura, classe;
    if (!indeferidaNaUltima) {
      classe = 'placar--vitoria';
      titulo = 'Duas candidaturas, e nenhuma indeferida';
      leitura = 'Nas duas candidaturas você ficou dentro do limite de um ' +
                'ilícito, e a Justiça Eleitoral não teve de interromper ' +
                'nenhuma delas. Ganhar ou perder a eleição foi decidido pela ' +
                'urna — e não é isso que este jogo mede.';
    } else {
      classe = 'placar--parcial';
      titulo = 'Eleito vereador. Candidatura indeferida para deputado.';
      leitura = 'A primeira candidatura passou. Na segunda, os ilícitos ' +
                'passaram do limite de ' + LIMITE_ILICITOS + ', e a juíza ' +
                'indeferiu o registro — o cargo maior trouxe circunstâncias ' +
                'mais próximas do limite, e foi nelas que a diferença entre o ' +
                'permitido e o ilícito custou a eleição.';
    }

    var perguntas = (window.PERGUNTAS_RESOLUCAO || []).map(function (p) {
      return '' +
        '<div class="pergunta">' +
          '<span class="pergunta__numero" aria-hidden="true">' +
            escapar(p.numero) + '</span>' +
          '<div>' +
            '<p class="pergunta__texto">' + escapar(p.pergunta) + '</p>' +
            '<p class="pergunta__explicacao">' + escapar(p.explicacao) + '</p>' +
          '</div>' +
        '</div>';
    }).join('');

    var revisaoPorFase = FASES.map(function (f) {
      var i = FASES.indexOf(f);
      var situacoes = situacoesDaFase(i);
      var il = ilicitoDaFase(i);
      return '' +
        '<h3 class="painel__subtitulo">Fase ' + f.numero + ' · ' + escapar(f.cargo) +
          ' <span class="painel__contagem">' + il + ' ilícito' +
          (il === 1 ? '' : 's') + ' em ' + situacoes.length + '</span></h3>' +
        listaRevisao(situacoes);
    }).join('');

    var blocoConquistas = '';
    if (temFicha()) {
      var lista = conquistas();
      blocoConquistas =
        '<section class="painel">' +
          '<h2 class="painel__titulo">O que a campanha deixou</h2>' +
          '<p class="painel__sub">As marcas que ficaram da sua passagem — e as ' +
             'que você conseguiu não deixar.</p>' +
          (lista.length
            ? '<ul class="conquistas">' + lista.map(function (c) {
                return '<li class="conquista">' +
                         '<b class="conquista__nome">' + escapar(c.nome) + '</b>' +
                         '<span class="conquista__nota">' + escapar(c.nota) + '</span>' +
                       '</li>';
              }).join('') + '</ul>'
            : '<p class="painel__sub">Nenhuma marca registrada nesta carreira.</p>') +
        '</section>';
    }

    var acoes = '<button class="botao botao--primario" type="button" id="btn-reiniciar">' +
                'Criar outro personagem</button>';
    if (indeferidaNaUltima) {
      acoes += '<button class="botao botao--contorno" type="button" id="btn-refazer-fase">' +
               'Tentar de novo a fase 2</button>';
    }

    $('#palco').innerHTML = '' +
      '<div class="final entra">' +
        '<section class="placar ' + classe + '" id="topo-final" tabindex="-1">' +
          '<p class="placar__rotulo">Sua carreira política</p>' +
          '<p class="placar__numero">' + total + '<span> / ' +
            totalCircunstancias + '</span></p>' +
          '<h1 class="placar__titulo">' + escapar(titulo) + '</h1>' +
          '<p class="placar__leitura">' + escapar(leitura) + '</p>' +
        '</section>' +

        (temFicha() ? window.RPGUI.fichaCompleta(estado.personagem,
          { cargo: 'Fim da carreira' }) : '') +

        /* A tese do jogo, dita por inteiro e sem rodeio. */
        '<section class="painel painel--tese">' +
          '<h2 class="painel__titulo">O que este jogo queria ensinar</h2>' +
          '<p class="painel__sub">' +
            'Uma atitude adequada com as leis vale mais do que uma eleição ' +
            'vencida de forma ilegal. É por isso que o resultado da urna, ' +
            'aqui, é sorteado — e não decide nada. O que faz você seguir para ' +
            'a candidatura seguinte é a sua conduta; o que interrompe a ' +
            'carreira é o ilícito, e não a derrota.' +
          '</p>' +
          '<p class="painel__sub">' +
            'Nas duas candidaturas, você decidiu ' + totalCircunstancias +
            ' vezes e cometeu ' + total + ' ilícito' + (total === 1 ? '' : 's') +
            '. ' + (total === 0
              ? 'Nenhuma delas precisou ser explicada a um juiz.'
              : 'Cada uma delas está registrada abaixo, com o dispositivo que ' +
                'a alcança.') +
          '</p>' +
        '</section>' +

        blocoConquistas +

        '<section class="painel">' +
          '<h2 class="painel__titulo">Circunstância por circunstância</h2>' +
          '<p class="painel__sub">O que você decidiu em cada caso e o que cada ' +
             'conduta era, à luz da lei.</p>' +
          revisaoPorFase +
        '</section>' +

        '<section class="painel">' +
          '<h2 class="painel__titulo">As três perguntas que resolvem os casos reais</h2>' +
          '<p class="painel__sub">Fora do jogo, não há alternativas para ' +
             'escolher. Estas três perguntas substituem o gabarito: aplique-as ' +
             'a qualquer situação que você encontrar no dia da eleição.</p>' +
          perguntas +
        '</section>' +

        '<div class="acoes-finais">' + acoes + '</div>' +
      '</div>';

    var t = $('#topo-final');
    if (t) t.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------- MÁQUINA */
  function iniciar() {
    estado.tela = 'capa';
    estado.avatar = null;
    estado.origem = null;
    estado.personagem = null;
    estado.fase = 0;
    estado.cena = 0;
    estado.escolhas = [];
    estado.ilicitoFase = 0;
    estado.ilicitoCarreira = 0;
    estado.etapaJuiza = null;
    estado.sorteio = null;
    estado.ultimoJulgamento = null;
    estado.retornoFase = null;
    estado.ultimaFaseImpugnada = false;
    ordemAtual = null;
    cenaDaOrdem = null;
    renderizarCabecalho();
    telaCapa();
    window.scrollTo(0, 0);
  }

  /* A capa sai por qualquer tecla e por qualquer toque. A troca da tela vem
     ANTES de renderizar, como em toda transição: a segunda tecla de uma
     rajada encontra a tela já trocada e é ignorada. */
  function abrirCriacao() {
    if (estado.tela !== 'capa') return;
    estado.tela = 'avatar';
    renderizarCabecalho();
    telaAvatar();
    window.scrollTo(0, 0);
  }

  function escolherAvatar(id) {
    if (estado.tela !== 'avatar') return;
    var av = null;
    for (var i = 0; i < AVATARES.length; i++) {
      if (AVATARES[i].id === id) { av = AVATARES[i]; break; }
    }
    if (!av) return;

    estado.avatar = av;
    estado.tela = 'origem';                  /* trocado ANTES de renderizar */
    renderizarCabecalho();
    telaOrigem();
    window.scrollTo(0, 0);
  }

  function escolherOrigem(id) {
    if (estado.tela !== 'origem') return;
    var org = null;
    for (var i = 0; i < ORIGENS.length; i++) {
      if (ORIGENS[i].id === id) { org = ORIGENS[i]; break; }
    }
    if (!org) return;

    estado.origem = org;
    estado.personagem = window.RPG.novoPersonagem(estado.avatar, org);
    /* A história é a última escolha antes do dia da eleição: daqui o jogador
       vai direto para a primeira circunstância. */
    abrirFase(0);
  }

  /* Abre uma fase: fotografa a campanha, zera o índice da candidatura, descarta
     as escolhas daquela fase, redefine a ordem das condutas e vai à primeira
     circunstância. */
  function abrirFase(i) {
    if (i < 0 || i >= FASES.length) { telaFinal(); return; }

    estado.fase = i;
    estado.cena = 0;
    estado.etapaJuiza = null;
    estado.sorteio = null;
    estado.ultimaFaseImpugnada = false;
    estado.retornoFase = window.RPG.copiar(estado.personagem);
    descartarEscolhasDaFase(i);
    ordemAtual = null;
    cenaDaOrdem = null;

    estado.tela = 'cena';
    renderizarCabecalho();
    telaCena();
    window.scrollTo(0, 0);
  }

  /* --- A decisão de conduta ----------------------------------------- */
  function decidir(idOpcao) {
    if (estado.tela !== 'cena') return;      /* guarda de reentrância */
    var cena = cenaAtual();
    if (!cena) return;

    var o = opcaoDe(cena, idOpcao);
    if (!o) return;

    /* NÃO limpar as escolhas da fase aqui: esta função roda a cada
       circunstância, e limpar apagaria as anteriores. A limpeza pertence a
       quem RECOMEÇA a fase — `refazerFase()` —, não a quem decide mais uma. */
    estado.escolhas.push({
      idCena: cena.id,
      idOpcao: o.id,
      natureza: o.natureza,
      ilicito: ehIlicito(o)
    });

    /* A ficha reage à conduta; o índice também, mas por caminho separado.
       São dois medidores, e é importante que continuem sendo: a ficha mede a
       campanha, o índice mede a conduta, e só o índice julga. */
    estado.ultimoJulgamento = temFicha()
      ? window.RPG.aplicarJulgamento(estado.personagem, o.natureza) : null;

    estado.tela = 'retorno';                 /* trocado ANTES de renderizar */
    renderizarCabecalho();
    telaRetorno();
    window.scrollTo(0, 0);
  }

  function avancar() {
    if (estado.tela !== 'retorno') return;   /* guarda de reentrância */

    var ultima = estado.cena === situacoesDaFase(estado.fase).length - 1;

    if (!ultima) {
      estado.cena++;
      estado.tela = 'cena';
      renderizarCabecalho();
      telaCena();
      window.scrollTo(0, 0);
      return;
    }

    /* fim da fase: o julgamento */
    estado.tela = 'juiza';
    estado.etapaJuiza = 'julgamento';
    estado.sorteio = null;
    renderizarCabecalho();
    telaJuiza();
    window.scrollTo(0, 0);
  }

  /* O julgamento leva a dois lugares diferentes, e o jogador sabe qual deles
     antes de tocar no botão: indeferida, a candidatura termina; deferida, ela
     vai à urna. Nada da ficha entra nesta decisão. */
  function aposJulgamento() {
    if (estado.tela !== 'juiza' || estado.etapaJuiza !== 'julgamento') return;

    if (indeferida(estado.fase)) {
      estado.ultimaFaseImpugnada = true;
      if (estado.fase === 0) {
        estado.tela = 'derrota';
        renderizarCabecalho();
        telaDerrota();
      } else {
        telaFinal();
      }
      window.scrollTo(0, 0);
      return;
    }

    /* Deferida: a urna decide, e não decide nada. O sorteio é feito agora e
       guardado, para que a tela seguinte seja só a revelação de um resultado
       que já existe. */
    estado.sorteio = (Math.random() < 0.5) ? 'vitoria' : 'derrota';
    estado.etapaJuiza = 'apuracao';
    renderizarCabecalho();
    telaJuiza();
    window.scrollTo(0, 0);
  }

  function seguir() {
    if (estado.tela !== 'juiza' || estado.etapaJuiza !== 'apuracao') return;

    if (estado.fase === FASES.length - 1) {
      telaFinal();
      return;
    }

    estado.tela = 'eleito';
    renderizarCabecalho();
    telaEleito();
    window.scrollTo(0, 0);
  }

  function proximaFase() {
    if (estado.tela !== 'eleito') return;
    abrirFase(estado.fase + 1);
  }

  function refazerFase() {
    if (estado.tela !== 'derrota' && estado.tela !== 'final') return;

    /* A campanha volta ao ponto em que estava quando a fase começou. Refazer
       não é uma segunda chance sobre uma campanha já desgastada: é a mesma
       campanha, de novo, com o jogador sabendo o que não sabia. O índice volta
       a zero pelo mesmo caminho — `abrirFase` descarta as escolhas da fase. */
    if (estado.retornoFase) estado.personagem = window.RPG.copiar(estado.retornoFase);

    var alvo = (estado.tela === 'final') ? FASES.length - 1 : estado.fase;
    abrirFase(alvo);
  }

  /* -------------------------------------------------------------- ENTRADA */
  document.addEventListener('click', function (ev) {
    if (!ev.target.closest) return;

    /* Na capa, qualquer toque serve — inclusive fora dela. */
    if (estado.tela === 'capa') { abrirCriacao(); return; }

    var av = ev.target.closest('.avatar');
    if (av) { escolherAvatar(av.getAttribute('data-avatar')); return; }

    var org = ev.target.closest('.origem');
    if (org) { escolherOrigem(org.getAttribute('data-origem')); return; }

    var cd = ev.target.closest('.conduta');
    if (cd) { decidir(cd.getAttribute('data-opcao')); return; }

    if (ev.target.closest('#btn-avancar'))       { avancar();        return; }
    if (ev.target.closest('#btn-julgar'))        { aposJulgamento(); return; }
    if (ev.target.closest('#btn-seguir'))        { seguir();         return; }
    if (ev.target.closest('#btn-proxima-fase'))  { proximaFase();    return; }
    if (ev.target.closest('#btn-refazer-fase'))  { refazerFase();    return; }
    if (ev.target.closest('#btn-reiniciar'))     { iniciar();        return; }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;

    /* Um botão em foco já responde ao Enter por conta própria. Sem esta saída,
       a tecla acionaria o botão E o atalho, duas vezes. */
    var emBotao = document.activeElement &&
                  document.activeElement.tagName === 'BUTTON';

    /* A capa sai com qualquer tecla de entrada — inclusive Tab e Esc: não há
       navegação a preservar numa tela cujo único caminho é sair dela.

       As exceções são as teclas que não são entrada de nada: as que só
       modificam outras (Shift, Control…), as de trava (CapsLock…) e as de
       função. Roubar o F5 de quem quer recarregar a página, ou o F12 de quem
       quer abrir o inspetor, seria prender o jogador na capa. */
    var TECLAS_QUE_NAO_ENTRAM = {
      Shift: 1, Control: 1, Alt: 1, Meta: 1, AltGraph: 1,
      CapsLock: 1, NumLock: 1, ScrollLock: 1
    };
    if (estado.tela === 'capa') {
      if (TECLAS_QUE_NAO_ENTRAM[ev.key] || /^F\d+$/.test(ev.key)) return;
      ev.preventDefault();
      abrirCriacao();
      return;
    }

    if (estado.tela === 'avatar') {
      var k = ['1', '2', '3', '4'].indexOf(ev.key);
      if (k !== -1 && AVATARES[k]) {
        ev.preventDefault();
        escolherAvatar(AVATARES[k].id);
      }
      return;
    }

    if (estado.tela === 'origem') {
      var ko = ['1', '2', '3', '4'].indexOf(ev.key);
      if (ko !== -1 && ORIGENS[ko]) {
        ev.preventDefault();
        escolherOrigem(ORIGENS[ko].id);
      }
      return;
    }

    if (estado.tela === 'cena') {
      var i = ['1', '2', '3', '4'].indexOf(ev.key);
      var opcoes = ordemDaCena(cenaAtual());
      if (i !== -1 && opcoes[i]) {
        ev.preventDefault();
        decidir(opcoes[i].id);   /* a tecla segue a POSIÇÃO exibida */
      }
      return;
    }

    /* Só o Enter. A barra de espaço fica livre para rolar a página: as telas
       de resultado são longas, e roubar a tecla de rolagem seria uma
       armadilha. */
    if (ev.key === 'Enter' && !emBotao) {
      if (estado.tela === 'retorno')      { ev.preventDefault(); avancar(); }
      else if (estado.tela === 'juiza') {
        if (estado.etapaJuiza === 'julgamento')    { ev.preventDefault(); aposJulgamento(); }
        else if (estado.etapaJuiza === 'apuracao') { ev.preventDefault(); seguir(); }
      }
      else if (estado.tela === 'eleito')  { ev.preventDefault(); proximaFase(); }
      else if (estado.tela === 'derrota') { ev.preventDefault(); refazerFase(); }
      else if (estado.tela === 'final')   { ev.preventDefault(); iniciar(); }
    }
  });

  /* --------------------------------------------------------------- INÍCIO */

  /* -----------------------------------------------------------------------
   * Toda peça externa é conferida antes de o jogo começar. Um erro de uma
   * letra em dados/cenas.js não pode produzir uma tela cheia de "undefined":
   * o jogador precisa saber que o arquivo é que está errado, e não que ele
   * jogou errado.
   * -------------------------------------------------------------------- */
  function conferirAmbiente() {
    if (!Array.isArray(AVATARES) || AVATARES.length === 0) {
      return 'O arquivo <strong>dados/cenas.js</strong> não define os avatares ' +
             '(<em>AVATARES</em>).';
    }
    if (!Array.isArray(FASES) || FASES.length === 0) {
      return 'O arquivo <strong>dados/cenas.js</strong> não define as fases ' +
             '(<em>FASES</em>).';
    }
    if (!Array.isArray(CENAS) || CENAS.length === 0) {
      return 'O arquivo <strong>dados/cenas.js</strong> não foi encontrado, ' +
             'está vazio ou não define uma lista de circunstâncias.';
    }
    if (!JUIZA || !JUIZA.doisOuMaisIlicitos || !JUIZA.semIlicito || !JUIZA.umIlicito) {
      return 'O arquivo <strong>dados/cenas.js</strong> não define o ' +
             'julgamento da juíza (<em>JUIZA</em>): faltam os dois vereditos ' +
             '(deferida e indeferida) ou os textos de cada caso.';
    }
    if (typeof JUIZA.regra !== 'string' || !JUIZA.regra) {
      return 'O arquivo <strong>dados/cenas.js</strong> não declara a regra do ' +
             'veredito (<em>JUIZA.regra</em>). O jogador precisa poder ler a ' +
             'conta que decide a candidatura.';
    }
    if (!SORTE || !SORTE.vitoria || !SORTE.derrota) {
      return 'O arquivo <strong>dados/cenas.js</strong> não define o resultado ' +
             'da urna (<em>SORTE</em>).';
    }

    for (var i = 0; i < CENAS.length; i++) {
      var c = CENAS[i];
      if (!c || typeof c.titulo !== 'string' || typeof c.contexto !== 'string' ||
          !Array.isArray(c.opcoes) || c.opcoes.length === 0) {
        return 'A circunstância de número ' + (i + 1) + ' em ' +
               '<strong>dados/cenas.js</strong> está incompleta. Cada ' +
               'circunstância precisa de <em>titulo</em>, <em>contexto</em> e ' +
               '<em>opcoes</em>.';
      }
      for (var j = 0; j < c.opcoes.length; j++) {
        var o = c.opcoes[j];
        if (!o || typeof o.texto !== 'string' || typeof o.titulo !== 'string' ||
            typeof o.justificativa !== 'string' || typeof o.baseLegal !== 'string' ||
            typeof o.textoLegal !== 'string' ||
            !NATUREZA[o.natureza]) {
          return 'A conduta de número ' + (j + 1) + ' da circunstância ' +
                 '<em>' + escapar(c.id) + '</em> está incompleta. Cada conduta ' +
                 'precisa de <em>texto</em>, <em>natureza</em>, ' +
                 '<em>titulo</em>, <em>justificativa</em>, <em>baseLegal</em> ' +
                 'e <em>textoLegal</em>.';
        }
      }
      var fase = null;
      for (var k = 0; k < FASES.length; k++) {
        if (FASES[k].id === c.fase) { fase = FASES[k]; break; }
      }
      if (!fase) {
        return 'A circunstância <em>' + escapar(c.id) + '</em> aponta para a ' +
               'fase <em>' + escapar(c.fase) + '</em>, que não existe.';
      }
      /* A quantidade de ilícitos por cena é uma promessa feita ao jogador e
         verificada pelo teste: se ela não bater com a fase, o jogo não abre. */
      var ilic = c.opcoes.filter(ehIlicito).length;
      if (typeof fase.iliciosPorCena === 'number' && ilic !== fase.iliciosPorCena) {
        return 'A circunstância <em>' + escapar(c.id) + '</em> tem ' + ilic +
               ' condutas ilícitas, e a fase <em>' + escapar(fase.cargo) +
               '</em> declara ' + fase.iliciosPorCena + '.';
      }
    }

    for (var m = 0; m < FASES.length; m++) {
      var f = FASES[m];
      if (!f || !Array.isArray(f.situacoes) || f.situacoes.length === 0) {
        return 'A fase de número ' + (m + 1) + ' em <strong>dados/cenas.js</strong> ' +
               'não lista circunstâncias.';
      }
      if (typeof f.tolera !== 'number') {
        return 'A fase <em>' + escapar(f.cargo) + '</em> não declara quantos ' +
               'ilícitos tolera (<em>tolera</em>).';
      }
      /* O veredito é o número de ilícitos, e `tolera` é a declaração da fase
         sobre esse limite. Se as duas discordarem, uma das duas está errada —
         e um jogo que abre com duas regras diferentes é pior do que um jogo
         que não abre. */
      if (f.tolera !== LIMITE_ILICITOS) {
        return 'A fase <em>' + escapar(f.cargo) + '</em> declara tolerar ' +
               f.tolera + ' ilícito' + (f.tolera === 1 ? '' : 's') + ', e o ' +
               'limite do jogo é ' + LIMITE_ILICITOS + '.';
      }
      for (var n = 0; n < f.situacoes.length; n++) {
        if (!POR_ID[f.situacoes[n]]) {
          return 'A fase de número ' + (m + 1) + ' cita a circunstância ' +
                 '<em>' + escapar(f.situacoes[n]) + '</em>, que não existe em ' +
                 '<strong>CENAS</strong>.';
        }
      }
    }

    if (typeof window.ilustracaoDaCena !== 'function') {
      return 'O arquivo <strong>js/ilustracoes.js</strong> não foi carregado. ' +
             'As circunstâncias existem, mas as ilustrações não puderam ser ' +
             'desenhadas.';
    }
    if (typeof window.ilustracaoDaJuiza !== 'function') {
      return 'O arquivo <strong>js/ilustracoes.js</strong> não desenha a cena ' +
             'do julgamento (<em>ilustracaoDaJuiza</em>).';
    }
    if (!Array.isArray(window.PERGUNTAS_RESOLUCAO) ||
        window.PERGUNTAS_RESOLUCAO.length === 0) {
      return 'O arquivo <strong>dados/cenas.js</strong> não define as ' +
             '<em>PERGUNTAS_RESOLUCAO</em>, exigidas ao final da partida.';
    }

    /* A experiência — conferida com o mesmo rigor, e pelo mesmo motivo. */
    if (!window.RPG || !window.RPGUI) {
      return 'O arquivo <strong>js/ficha.js</strong> não foi carregado. Ele ' +
             'define a experiência do candidato e os níveis que ela abre.';
    }
    if (!Array.isArray(ORIGENS) || ORIGENS.length === 0) {
      return 'O arquivo <strong>dados/cenas.js</strong> não define as origens ' +
             '(<em>ORIGENS</em>).';
    }
    if (!Array.isArray(window.NIVEIS) || window.NIVEIS.length === 0) {
      return 'O arquivo <strong>dados/cenas.js</strong> não define os níveis ' +
             '(<em>NIVEIS</em>).';
    }
    /* A experiência que cada natureza rende é o único número que move a
       campanha: sem ela, a conduta não teria consequência nenhuma. */
    var xpRegras = (window.REGRAS && window.REGRAS.xp) || null;
    for (var a = 0; a < Object.keys(NATUREZA).length; a++) {
      var chaveNat = Object.keys(NATUREZA)[a];
      if (!xpRegras || typeof xpRegras[chaveNat] !== 'number') {
        return 'O arquivo <strong>dados/cenas.js</strong> não define a ' +
               'experiência da conduta <em>' + escapar(chaveNat) +
               '</em> (<em>REGRAS.xp</em>).';
      }
    }
    for (var og = 0; og < ORIGENS.length; og++) {
      var org = ORIGENS[og];
      if (typeof org.nome !== 'string' || typeof org.descricao !== 'string' ||
          typeof org.lema !== 'string') {
        return 'A origem de número ' + (og + 1) + ' em ' +
               '<strong>dados/cenas.js</strong> está incompleta. Cada origem ' +
               'precisa de <em>nome</em>, <em>descricao</em> e <em>lema</em>.';
      }
    }
    return null;
  }

  function mostrarErro(mensagem) {
    /* O cabeçalho vivo mentiria sobre um jogo que não carregou: some com ele. */
    var cab = $('.cabecalho');
    if (cab) cab.hidden = true;

    $('#palco').innerHTML = '' +
      '<div class="aviso-erro">' +
        '<h1 class="cena__titulo">Não foi possível iniciar o jogo</h1>' +
        '<p class="cena__enunciado">' + mensagem + '</p>' +
      '</div>';
  }

  function iniciarQuandoPronto() {
    var problema = conferirAmbiente();
    if (problema) { mostrarErro(problema); return; }
    iniciar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarQuandoPronto);
  } else {
    iniciarQuandoPronto();
  }

  /* -----------------------------------------------------------------------
   * Ganchos de inspeção — usados pelo harness de verificação em way/. Não
   * alteram o jogo: expõem o estado e as transições para que um teste possa
   * percorrer as duas candidaturas sem depender de sorteio nem de tempo.
   * -------------------------------------------------------------------- */
  window.JOGO = {
    estado: estado,
    /* A própria conferência de ambiente do jogo, exposta para que o harness
       possa exigir que o jogo aceite os dados que ele carregou. */
    conferirAmbiente: conferirAmbiente,
    ordemDaCena: ordemDaCena,
    faseAtual: faseAtual,
    situacoesDaFase: situacoesDaFase,
    cenaAtual: cenaAtual,
    opcaoDe: opcaoDe,
    escolhaDe: escolhaDe,
    ilicitoDaFase: ilicitoDaFase,
    licitoDaFase: licitoDaFase,
    ilicitoTotal: ilicitoTotal,
    indeferida: indeferida,
    impugnada: indeferida,   /* nome antigo, mantido para o harness de way/ */
    situacaoDaFase: situacaoDaFase,
    conquistas: conquistas,
    abrirCriacao: abrirCriacao,
    escolherAvatar: escolherAvatar,
    escolherOrigem: escolherOrigem,
    abrirFase: abrirFase,
    decidir: decidir,
    avancar: avancar,
    aposJulgamento: aposJulgamento,
    seguir: seguir,
    proximaFase: proximaFase,
    refazerFase: refazerFase,
    iniciar: iniciar
  };
})();
