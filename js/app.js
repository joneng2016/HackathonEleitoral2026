/* =============================================================================
 * ILÍCITOS EM JOGO — lógica da aplicação
 * -----------------------------------------------------------------------------
 * O jogador é um jovem candidato. Ele escolhe um avatar, disputa a eleição
 * para vereador e, se julgar corretamente as três situações da fase, passa à
 * candidatura seguinte, a deputado estadual.
 *
 * ESTADOS
 *   'avatar'  → escolha do avatar            (RF-14 / RF-15)
 *   'cena'    → situação a julgar
 *   'retorno' → fundamentação da resposta
 *   'eleito'  → aprovado na fase; passa à candidatura seguinte
 *   'derrota' → reprovado na fase 1; refaz a fase
 *   'final'   → encerramento da carreira, com desempenho e perguntas
 *
 * Arquitetura (create-game.plan.md, Fase 2): estado explícito, separação entre
 * estado / lógica / renderização / entrada. Sem framework, sem dependência.
 * ========================================================================== */

(function () {
  'use strict';

  var AVATARES = window.AVATARES || [];
  var FASES    = window.FASES || [];
  var CENAS    = window.CENAS || [];

  var POR_ID = {};
  CENAS.forEach(function (c) { POR_ID[c.id] = c; });

  /* Rótulos fixos das alternativas — RF-02 / US-02 */
  var OPCOES = [
    { chave: 'permitido', rotulo: 'Permitido',               marca: '✔' },
    { chave: 'observar',  rotulo: 'Preciso observar melhor', marca: '?' },
    { chave: 'crime',     rotulo: 'É crime',                 marca: '⚠' }
  ];

  var TOM_DO_VEREDITO = {
    permitido: 'permitido',
    observar:  'observar',
    crime:     'crime',
    ambiguo:   'observar'   /* situação sem resposta fechada: tom de dúvida */
  };

  var TEXTO_ESTADO = {
    certo:      'Julgamento correto',
    errado:     'Julgamento incorreto',
    defensavel: 'Julgamento defensável'
  };

  var ICONE_ESTADO = { certo: '✔', errado: '✖', defensavel: '◆' };

  /* `tela` é a guarda de reentrância: toda transição a sobrescreve antes de
     renderizar, de modo que um segundo toque no mesmo instante encontra a
     tela já trocada e é ignorado. */
  var estado = {
    tela: 'avatar',
    avatar: null,
    fase: 0,          /* índice em FASES */
    cena: 0,          /* índice dentro da fase */
    respostas: [],    /* { idCena, escolha, acertou, defensavel } */
    ultimaFaseReprovada: false
  };

  /* Ordem de exibição das alternativas nesta partida. Os RÓTULOS são fixos
     (RF-02), a ORDEM não: com ordem fixa, "Permitido" seria sempre o primeiro
     botão e duas das três situações de cada fase são lícitas — quem tocasse
     sempre no primeiro botão acertaria 2/3 e, com um critério frouxo, seria
     aprovado sem julgar nada. A ordem é sorteada a cada partida, e as teclas
     1/2/3 acompanham a posição exibida. */
  var ordemAtual = null;

  function embaralhar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function ordem() {
    if (!ordemAtual) ordemAtual = embaralhar(OPCOES);
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

  /* Rótulo de exibição de uma alternativa. Nunca recebe cena.veredito: em
     situação ambígua esse campo vale 'ambiguo', que não é alternativa. */
  function rotuloDe(chave) {
    for (var i = 0; i < OPCOES.length; i++) {
      if (OPCOES[i].chave === chave) return OPCOES[i].rotulo;
    }
    return chave;
  }

  /* Alternativas aceitas numa situação, na ordem de exibição (US-08). */
  function defensaveisDe(cena) {
    var d = cena.defensaveis || [cena.veredito];
    return OPCOES.map(function (o) { return o.chave; })
                 .filter(function (ch) { return d.indexOf(ch) !== -1; });
  }

  /* ------------------------------------------------------------- FASES */
  function faseAtual() { return FASES[estado.fase] || null; }

  function situacoesDaFase(i) {
    var f = FASES[i];
    if (!f) return [];
    return f.situacoes.map(function (id) { return POR_ID[id]; })
                      .filter(function (c) { return !!c; });
  }

  function cenaAtual() { return situacoesDaFase(estado.fase)[estado.cena] || null; }

  function respostaDe(idCena) {
    for (var i = 0; i < estado.respostas.length; i++) {
      if (estado.respostas[i].idCena === idCena) return estado.respostas[i];
    }
    return null;
  }

  function acertosDaFase(i) {
    return situacoesDaFase(i).filter(function (c) {
      var r = respostaDe(c.id);
      return r && r.acertou;
    }).length;
  }

  /* O critério da fase. Com `exigeTodas`, só passa quem acerta todas —
     é o que derrota qualquer resposta repetida. */
  function faseAprovada(i) {
    var f = FASES[i];
    if (!f) return false;
    var total = situacoesDaFase(i).length;
    if (f.exigeTodas === false) return acertosDaFase(i) >= Math.ceil(total / 2);
    return total > 0 && acertosDaFase(i) === total;
  }

  function totalAcertos() {
    return estado.respostas.filter(function (r) { return r.acertou; }).length;
  }

  function descartarRespostasDaFase(i) {
    var ids = situacoesDaFase(i).map(function (c) { return c.id; });
    estado.respostas = estado.respostas.filter(function (r) {
      return ids.indexOf(r.idCena) === -1;
    });
  }

  /* Avalia a escolha contra as alternativas defensáveis da situação (US-08) */
  function avaliar(cena, escolha) {
    var defensaveis = cena.defensaveis || [cena.veredito];
    var acertou = defensaveis.indexOf(escolha) !== -1;
    return {
      idCena: cena.id,
      escolha: escolha,
      acertou: acertou,
      /* acerto em situação sem resposta fechada é registrado com nuance */
      defensavel: acertou && defensaveis.length > 1
    };
  }

  /* O desenho é opcional: se js/ilustracoes.js faltar, a situação ainda deve
     poder ser julgada pelo enunciado. */
  function desenhoDaCena(chave) {
    if (typeof window.ilustracaoDaCena !== 'function') {
      return '<svg viewBox="0 0 640 360" width="640" height="360" ' +
             'xmlns="http://www.w3.org/2000/svg" aria-hidden="true"></svg>';
    }
    return window.ilustracaoDaCena(chave, estado.avatar);
  }

  /* ------------------------------------------------------------ RENDERIZA */
  function renderizarTrilha() {
    var trilha = $('#trilha');
    var situacoes = situacoesDaFase(estado.fase);
    var html = '';

    for (var i = 0; i < situacoes.length; i++) {
      var r = respostaDe(situacoes[i].id);
      var e = 'pendente';
      if (r) e = r.defensavel ? 'defensavel' : (r.acertou ? 'certo' : 'errado');
      else if (i === estado.cena && (estado.tela === 'cena' || estado.tela === 'retorno')) {
        e = 'atual';
      }

      var rotulo = 'Situação ' + (i + 1) + ' de ' + situacoes.length + ': ';
      rotulo += r
        ? TEXTO_ESTADO[r.defensavel ? 'defensavel' : (r.acertou ? 'certo' : 'errado')]
        : (e === 'atual' ? 'situação atual' : 'não respondida');

      html += '<span class="trilha__passo" data-estado="' + e + '" title="' +
              escapar(rotulo) + '"></span>';
    }

    trilha.innerHTML = html;
    trilha.hidden = (estado.tela === 'avatar');
    trilha.setAttribute('aria-valuemax', String(situacoes.length));
    trilha.setAttribute('aria-valuenow', String(Math.min(estado.cena, situacoes.length)));
    trilha.setAttribute('aria-valuetext',
      'Fase ' + (estado.fase + 1) + ': ' + estado.respostas.length +
      ' situações respondidas no total');
  }

  function renderizarCabecalho() {
    var contador = $('#contador');
    var f = faseAtual();

    if (estado.tela === 'avatar') {
      contador.innerHTML = 'Antes de começar';
    } else if (estado.tela === 'final') {
      contador.innerHTML = 'Candidatura encerrada';
    } else if (!f) {
      contador.innerHTML = '';
    } else {
      contador.innerHTML = 'Fase <b>' + f.numero + '</b> · ' + escapar(f.cargo);
    }
    renderizarTrilha();
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
        '<p class="cena__rotulo">Sua candidatura começa aqui</p>' +
        '<h1 class="abertura__titulo" id="titulo-avatar" tabindex="-1">' +
          'Escolha quem vai disputar a eleição</h1>' +
        '<p class="abertura__texto">Você tem dezenove anos e vai concorrer a ' +
          'vereador do seu município. Escolha o avatar que vai representar ' +
          'você nas duas candidaturas — é ele que aparece em todas as cenas.' +
        '</p>' +
        '<div class="avatares" role="group" aria-labelledby="titulo-avatar">' +
          cartoes +
        '</div>' +
        '<p class="abertura__nota">A escolha é só visual: o avatar não ' +
          'altera as situações nem as respostas.</p>' +
      '</section>';

    var t = $('#titulo-avatar');
    if (t) t.focus({ preventScroll: true });
  }

  /* --- Tela: situação-problema ------------------------------------- */
  function telaCena() {
    var cena = cenaAtual();
    var f = faseAtual();
    if (!cena) { telaFinal(); return; }

    var total = situacoesDaFase(estado.fase).length;

    var alternativas = ordem().map(function (o, pos) {
      return '' +
        '<button class="alt" type="button" data-opcao="' + o.chave + '">' +
          '<span class="alt__marca" aria-hidden="true">' + o.marca + '</span>' +
          '<span class="alt__texto">' + escapar(o.rotulo) + '</span>' +
          '<span class="alt__tecla" aria-hidden="true">' + (pos + 1) + '</span>' +
        '</button>';
    }).join('');

    /* na primeira situação de uma fase, apresenta a candidatura */
    var abertura = (estado.cena === 0)
      ? '<div class="fase-abertura">' +
          '<p class="fase-abertura__titulo">' + escapar(f.chamada) + '</p>' +
          '<p class="fase-abertura__texto">' + escapar(f.descricao) + '</p>' +
        '</div>'
      : '';

    $('#palco').innerHTML = '' +
      '<article class="cena entra">' +
        '<figure class="cena__figura" role="img" aria-label="' +
            escapar(cena.descricaoImagem) + '">' +
          desenhoDaCena(cena.ilustracao) +
        '</figure>' +
        '<div class="cena__corpo">' +
          '<p class="cena__rotulo">Fase ' + f.numero + ' · ' + escapar(f.cargo) +
             ' — situação ' + (estado.cena + 1) + ' de ' + total + '</p>' +
          abertura +
          '<h1 class="cena__titulo" id="titulo-cena" tabindex="-1">' +
            escapar(cena.titulo) + '</h1>' +
          '<p class="cena__enunciado">' + escapar(cena.enunciado) + '</p>' +
          '<p class="cena__pergunta" id="pergunta-julgamento">' +
             'Qual é o seu julgamento sobre essa conduta?</p>' +
          '<div class="alternativas" role="group" aria-labelledby="pergunta-julgamento">' +
            alternativas +
          '</div>' +
        '</div>' +
      '</article>';

    var titulo = $('#titulo-cena');
    if (titulo) titulo.focus({ preventScroll: true });
  }

  /* --- Tela: retorno com fundamentação ----------------------------- */
  function telaRetorno() {
    var cena = cenaAtual();
    var r = respostaDe(cena.id);
    var tom = TOM_DO_VEREDITO[cena.veredito] || 'observar';
    var ambiguo = (cena.defensaveis || []).length > 1;

    var blocoErro = '';
    if (!r.acertou && cena.erroPorAlternativa && cena.erroPorAlternativa[r.escolha]) {
      blocoErro = '' +
        '<div class="bloco-erro">' +
          '<h3>Por que essa leitura não se sustenta</h3>' +
          '<p>' + escapar(cena.erroPorAlternativa[r.escolha]) + '</p>' +
        '</div>';
    }

    var rotuloSelo = r.defensavel ? 'Julgamento defensável'
                   : (r.acertou ? 'Julgamento correto' : 'Julgamento incorreto');

    var titulo = ambiguo
      ? 'Esta situação não tem resposta fechada'
      : 'A conduta ' + (cena.veredito === 'crime' ? 'é crime' : 'é permitida');

    var ultima = (estado.cena === situacoesDaFase(estado.fase).length - 1);
    var rotuloBotao = !ultima ? 'Próxima situação →'
                    : (faseAprovada(estado.fase)
                        ? (estado.fase === FASES.length - 1
                            ? 'Ver o resultado da minha carreira →'
                            : 'Você venceu esta eleição →')
                        : 'Ver o resultado desta fase →');

    $('#palco').innerHTML = '' +
      '<article class="retorno entra" data-tom="' + tom + '">' +
        '<div class="retorno__topo">' +
          '<span class="selo">' + rotuloSelo + '</span>' +
          '<h1 class="retorno__veredito" id="titulo-retorno" tabindex="-1">' +
            escapar(titulo) + '</h1>' +
          '<p class="retorno__escolha">Você respondeu: <strong>' +
            escapar(rotuloDe(r.escolha)) + '</strong></p>' +
        '</div>' +
        '<div class="retorno__corpo">' +
          '<div class="retorno__texto">' + paragrafos(cena.justificativa) + '</div>' +
          blocoErro +
          '<div class="base-legal">' +
            '<h3>Base legal</h3>' +
            '<p class="base-legal__ref">' + escapar(cena.baseLegal) + '</p>' +
            '<blockquote>' + escapar(cena.textoLegal) + '</blockquote>' +
          '</div>' +
          '<button class="botao botao--primario" type="button" id="btn-avancar">' +
            rotuloBotao +
          '</button>' +
        '</div>' +
      '</article>';

    var t = $('#titulo-retorno');
    if (t) t.focus({ preventScroll: true });
  }

  /* --- Bloco reutilizável: revisão situação por situação ----------- */
  function listaRevisao(situacoes) {
    return '<ul class="revisao">' + situacoes.map(function (c, i) {
      var r = respostaDe(c.id);
      if (!r) return '';
      var e = r.defensavel ? 'defensavel' : (r.acertou ? 'certo' : 'errado');
      var aceitas = defensaveisDe(c);
      var semRespostaFechada = aceitas.length > 1;
      var detalhe;

      if (r.acertou && semRespostaFechada) {
        detalhe = 'Sem resposta fechada: sua leitura está entre as defensáveis. ' +
                  'A divergência é sobre o enquadramento, não sobre a licitude. ' +
                  'Leituras aceitas: ' + aceitas.map(rotuloDe).join(' ou ') + '.';
      } else if (r.acertou) {
        detalhe = 'Você respondeu “' + rotuloDe(r.escolha) + '”.';
      } else if (semRespostaFechada) {
        detalhe = 'Você respondeu “' + rotuloDe(r.escolha) +
                  '”. Nesta situação eram defensáveis: ' +
                  aceitas.map(rotuloDe).join(' ou ') + '.';
      } else {
        detalhe = 'Você respondeu “' + rotuloDe(r.escolha) +
                  '”; o correto era “' + rotuloDe(aceitas[0]) + '”.';
      }

      return '' +
        '<li class="revisao__item" data-estado="' + e + '">' +
          '<span class="revisao__icone" aria-hidden="true">' + ICONE_ESTADO[e] + '</span>' +
          '<span class="revisao__texto">' +
            '<span class="revisao__nome">' + (i + 1) + '. ' + escapar(c.titulo) + '</span>' +
            '<span class="revisao__detalhe">' + escapar(detalhe) + '</span>' +
            (r.acertou ? '' :
              '<span class="revisao__legal">' + escapar(c.baseLegal) + ' — ' +
              escapar(c.textoLegal) + '</span>') +
          '</span>' +
        '</li>';
    }).join('') + '</ul>';
  }

  /* --- Tela: aprovado na fase (passa à candidatura seguinte) ------- */
  function telaEleito() {
    var f = faseAtual();
    var proxima = FASES[estado.fase + 1];
    var total = situacoesDaFase(estado.fase).length;

    $('#palco').innerHTML = '' +
      '<div class="final entra">' +
        '<section class="placar placar--vitoria" id="topo-eleito" tabindex="-1">' +
          '<p class="placar__rotulo">Fase ' + f.numero + ' concluída</p>' +
          '<p class="placar__numero">' + total + '<span> / ' + total + '</span></p>' +
          '<h1 class="placar__titulo">Você se elegeu ' + escapar(f.cargo) + '</h1>' +
          '<p class="placar__leitura">Você julgou corretamente as ' + total +
            ' situações desta fase. Uma campanha que conhece o limite entre o ' +
            'permitido e o crime chega ao cargo sem ser cassada no caminho.</p>' +
        '</section>' +
        '<section class="painel">' +
          '<h2 class="painel__titulo">O que você julgou nesta fase</h2>' +
          '<p class="painel__sub">A revisão abaixo é a sua prestação de contas.</p>' +
          listaRevisao(situacoesDaFase(estado.fase)) +
        '</section>' +
        '<div class="acoes-finais">' +
          '<button class="botao botao--primario" type="button" id="btn-proxima-fase">' +
            'Disputar a eleição para ' + escapar(proxima ? proxima.cargo : 'o cargo seguinte') +
            ' →</button>' +
        '</div>' +
      '</div>';

    var t = $('#topo-eleito');
    if (t) t.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  /* --- Tela: reprovado na fase 1 (refaz a fase) -------------------- */
  function telaDerrota() {
    var f = faseAtual();
    var situacoes = situacoesDaFase(estado.fase);
    var acertos = acertosDaFase(estado.fase);

    $('#palco').innerHTML = '' +
      '<div class="final entra">' +
        '<section class="placar placar--derrota" id="topo-derrota" tabindex="-1">' +
          '<p class="placar__rotulo">Fase ' + f.numero + ' · ' + escapar(f.cargo) + '</p>' +
          '<p class="placar__numero">' + acertos + '<span> / ' + situacoes.length + '</span></p>' +
          '<h1 class="placar__titulo">Você não se elegeu ' + escapar(f.cargo) + '</h1>' +
          '<p class="placar__leitura">Nesta fase é preciso julgar corretamente as ' +
            situacoes.length + ' situações — cada fase mistura condutas permitidas e ' +
            'condutas criminosas de propósito, para que nenhuma resposta repetida ' +
            'dê conta delas.</p>' +
        '</section>' +
        '<section class="painel">' +
          '<h2 class="painel__titulo">Onde o seu julgamento se desviou</h2>' +
          '<p class="painel__sub">Leia a fundamentação de cada erro antes de ' +
            'tentar de novo: é ela que decide a próxima tentativa.</p>' +
          listaRevisao(situacoes) +
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

  /* --- Tela: encerramento da carreira ------------------------------ */
  function telaFinal() {
    estado.tela = 'final';
    renderizarCabecalho();

    var ultima = FASES.length - 1;
    var venceuTudo = faseAprovada(ultima);
    var total = CENAS.length;
    var acertos = totalAcertos();

    var titulo, leitura, classe;
    if (venceuTudo) {
      classe = 'placar--vitoria';
      titulo = 'Eleito vereador e deputado estadual';
      leitura = 'Você percorreu as duas candidaturas julgando corretamente todas ' +
                'as situações. É exatamente esse o critério que separa a campanha ' +
                'que se sustenta da campanha que termina na Justiça Eleitoral.';
    } else {
      classe = 'placar--parcial';
      titulo = 'Eleito vereador. Não eleito deputado estadual.';
      leitura = 'Sua primeira candidatura foi limpa, mas a segunda não passou. ' +
                'O cargo maior traz situações mais próximas do limite — e é ' +
                'justamente nelas que a diferença entre o permitido e o crime ' +
                'custa a eleição.';
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
      var situacoes = situacoesDaFase(FASES.indexOf(f));
      return '' +
        '<h3 class="painel__subtitulo">Fase ' + f.numero + ' · ' + escapar(f.cargo) +
          ' <span class="painel__contagem">' +
          acertosDaFase(FASES.indexOf(f)) + '/' + situacoes.length + '</span></h3>' +
        listaRevisao(situacoes);
    }).join('');

    var acoes = '<button class="botao botao--primario" type="button" id="btn-reiniciar">' +
                'Jogar novamente</button>';
    if (!venceuTudo) {
      acoes += '<button class="botao botao--contorno" type="button" id="btn-refazer-fase">' +
               'Tentar de novo a fase 2</button>';
    }

    $('#palco').innerHTML = '' +
      '<div class="final entra">' +
        '<section class="placar ' + classe + '" id="topo-final" tabindex="-1">' +
          '<p class="placar__rotulo">Sua carreira política</p>' +
          '<p class="placar__numero">' + acertos + '<span> / ' + total + '</span></p>' +
          '<h1 class="placar__titulo">' + escapar(titulo) + '</h1>' +
          '<p class="placar__leitura">' + escapar(leitura) + '</p>' +
        '</section>' +

        '<section class="painel">' +
          '<h2 class="painel__titulo">Situação por situação</h2>' +
          '<p class="painel__sub">O que você julgou em cada caso e onde o ' +
             'julgamento se desviou.</p>' +
          revisaoPorFase +
        '</section>' +

        '<section class="painel">' +
          '<h2 class="painel__titulo">As três perguntas que resolvem os casos reais</h2>' +
          '<p class="painel__sub">Fora do jogo, não há alternativas para marcar. ' +
             'Estas três perguntas substituem o gabarito: aplique-as a qualquer ' +
             'situação que você encontrar no dia da eleição.</p>' +
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
    estado.tela = 'avatar';
    estado.avatar = null;
    estado.fase = 0;
    estado.cena = 0;
    estado.respostas = [];
    estado.ultimaFaseReprovada = false;
    ordemAtual = null;
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
    estado.tela = 'cena';                    /* trocado ANTES de renderizar */
    renderizarCabecalho();
    telaCena();
    window.scrollTo(0, 0);
  }

  function escolher(chave) {
    if (estado.tela !== 'cena') return;      /* guarda de reentrância */
    var cena = cenaAtual();
    if (!cena) return;

    /* NÃO limpar as respostas da fase aqui: esta função roda a cada situação,
       e limpar apagaria as respostas anteriores da mesma fase. A limpeza
       pertence a quem RECOMEÇA a fase — `refazerFase()` —, não a quem
       responde mais uma. */
    estado.respostas.push(avaliar(cena, chave));
    estado.tela = 'retorno';                 /* trocado ANTES de renderizar */
    renderizarCabecalho();
    telaRetorno();
    window.scrollTo(0, 0);
  }

  function avancar() {
    if (estado.tela !== 'retorno') return;   /* guarda de reentrância */

    var ultimaDaFase = estado.cena === situacoesDaFase(estado.fase).length - 1;

    if (!ultimaDaFase) {
      estado.cena++;
      estado.tela = 'cena';
      renderizarCabecalho();
      telaCena();
      window.scrollTo(0, 0);
      return;
    }

    /* fim da fase: o portão */
    if (faseAprovada(estado.fase)) {
      if (estado.fase === FASES.length - 1) {
        telaFinal();
      } else {
        estado.tela = 'eleito';
        renderizarCabecalho();
        telaEleito();
      }
    } else if (estado.fase === 0) {
      estado.tela = 'derrota';
      renderizarCabecalho();
      telaDerrota();
    } else {
      /* reprovado na última fase: a carreira termina no cargo anterior */
      estado.ultimaFaseReprovada = true;
      telaFinal();
    }
    window.scrollTo(0, 0);
  }

  function proximaFase() {
    if (estado.tela !== 'eleito') return;
    estado.fase++;
    estado.cena = 0;
    estado.tela = 'cena';
    ordemAtual = null;                       /* nova fase, nova ordem */
    renderizarCabecalho();
    telaCena();
    window.scrollTo(0, 0);
  }

  function refazerFase() {
    if (estado.tela !== 'derrota' && estado.tela !== 'final') return;
    if (estado.tela === 'final') {           /* refazer a fase 2, mantendo a 1 */
      estado.fase = FASES.length - 1;
      estado.ultimaFaseReprovada = false;
    }
    descartarRespostasDaFase(estado.fase);
    estado.cena = 0;
    estado.tela = 'cena';
    ordemAtual = null;
    renderizarCabecalho();
    telaCena();
    window.scrollTo(0, 0);
  }

  /* -------------------------------------------------------------- ENTRADA */
  document.addEventListener('click', function (ev) {
    if (!ev.target.closest) return;

    var av = ev.target.closest('.avatar');
    if (av) { escolherAvatar(av.getAttribute('data-avatar')); return; }

    var alt = ev.target.closest('.alt');
    if (alt) { escolher(alt.getAttribute('data-opcao')); return; }

    if (ev.target.closest('#btn-avancar'))      { avancar();      return; }
    if (ev.target.closest('#btn-proxima-fase')) { proximaFase();  return; }
    if (ev.target.closest('#btn-refazer-fase')) { refazerFase();  return; }
    if (ev.target.closest('#btn-reiniciar'))    { iniciar();      return; }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;

    /* Um botão em foco já responde ao Enter por conta própria. Sem esta saída,
       a tecla acionaria o botão E o atalho, duas vezes. */
    var emBotao = document.activeElement &&
                  document.activeElement.tagName === 'BUTTON';

    if (estado.tela === 'avatar') {
      var k = ['1', '2', '3', '4'].indexOf(ev.key);
      if (k !== -1 && AVATARES[k]) {
        ev.preventDefault();
        escolherAvatar(AVATARES[k].id);
      }
      return;
    }

    if (estado.tela === 'cena') {
      var i = ['1', '2', '3'].indexOf(ev.key);
      if (i !== -1 && ordem()[i]) {
        ev.preventDefault();
        escolher(ordem()[i].chave);   /* a tecla segue a POSIÇÃO exibida */
      }
      return;
    }

    /* Só o Enter. A barra de espaço fica livre para rolar a página: as telas
       de resultado são longas, e roubar a tecla de rolagem seria uma
       armadilha. */
    if (ev.key === 'Enter' && !emBotao) {
      if (estado.tela === 'retorno')      { ev.preventDefault(); avancar(); }
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
             'está vazio ou não define uma lista de situações.';
    }
    for (var i = 0; i < CENAS.length; i++) {
      var c = CENAS[i];
      if (!c || typeof c !== 'object' || typeof c.titulo !== 'string' ||
          typeof c.enunciado !== 'string' || typeof c.justificativa !== 'string' ||
          !Array.isArray(c.defensaveis) || c.defensaveis.length === 0) {
        return 'A situação de número ' + (i + 1) + ' em ' +
               '<strong>dados/cenas.js</strong> está incompleta. Cada situação ' +
               'precisa de <em>titulo</em>, <em>enunciado</em>, ' +
               '<em>justificativa</em> e <em>defensaveis</em>.';
      }
    }
    for (var j = 0; j < FASES.length; j++) {
      var f = FASES[j];
      if (!f || !Array.isArray(f.situacoes) || f.situacoes.length === 0) {
        return 'A fase de número ' + (j + 1) + ' em <strong>dados/cenas.js</strong> ' +
               'não lista situações.';
      }
      for (var k = 0; k < f.situacoes.length; k++) {
        if (!POR_ID[f.situacoes[k]]) {
          return 'A fase de número ' + (j + 1) + ' cita a situação ' +
                 '<em>' + escapar(f.situacoes[k]) + '</em>, que não existe em ' +
                 '<strong>CENAS</strong>.';
        }
      }
    }
    if (typeof window.ilustracaoDaCena !== 'function') {
      return 'O arquivo <strong>js/ilustracoes.js</strong> não foi carregado. ' +
             'As situações existem, mas as ilustrações não puderam ser ' +
             'desenhadas.';
    }
    if (!Array.isArray(window.PERGUNTAS_RESOLUCAO) ||
        window.PERGUNTAS_RESOLUCAO.length === 0) {
      return 'O arquivo <strong>dados/cenas.js</strong> não define as ' +
             '<em>PERGUNTAS_RESOLUCAO</em>, exigidas ao final da partida.';
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
})();
