/* =============================================================================
 * FICHA DO PERSONAGEM — a camada de RPG
 * -----------------------------------------------------------------------------
 * Este arquivo faz duas coisas, e só duas:
 *
 *   1. REGRAS  (window.RPG)    — atributos, experiência, níveis, legitimidade,
 *                                caixa e a rolagem de d20.
 *   2. FICHA   (window.RPGUI)  — a folha de personagem em HTML: o resumo que
 *                                acompanha a partida, a ficha completa das telas
 *                                de criação e de resultado, o inventário do dia
 *                                e o dado.
 *
 * O QUE ESTE ARQUIVO NUNCA FAZ: julgar conduta. Nenhuma função daqui recebe
 * uma circunstância nem decide se uma escolha foi lícita. Quem classifica cada
 * conduta é o arquivo de dados, no campo `natureza`; quem aplica a
 * consequência é js/app.js. Os números daqui governam a CAMPANHA — nunca a
 * licitude, e nunca a contagem de ilícitos, que tem medidor próprio.
 *
 * Sem dependência externa, sem framework, sem build (RNF-02).
 * ========================================================================== */

(function () {
  'use strict';

  var ATRIBUTOS = window.ATRIBUTOS || [];
  var NIVEIS    = window.NIVEIS    || [];
  var REGRAS    = window.REGRAS    || { xp: {}, legitimidade: {}, evento: {} };

  /* --------------------------------------------------------------- APOIO */
  function limitar(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function escapar(txt) {
    return String(txt).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function moeda(v) {
    /* Separador de milhar sem depender de toLocaleString: o agrupamento
       varia com o locale do navegador e o valor aqui é sempre em reais. */
    var s = String(Math.round(v));
    return 'R$ ' + s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function atributoDe(chave) {
    for (var i = 0; i < ATRIBUTOS.length; i++) {
      if (ATRIBUTOS[i].chave === chave) return ATRIBUTOS[i];
    }
    return null;
  }

  /* =========================================================================
   * REGRAS — window.RPG
   * ====================================================================== */

  /* O nível correspondente a uma quantidade de experiência. Devolve também o
     piso e o teto da faixa, que é o que a barra de XP precisa desenhar. */
  function nivelDe(xp) {
    var atual = NIVEIS[0];
    for (var i = 0; i < NIVEIS.length; i++) {
      if (xp >= NIVEIS[i].xp) atual = NIVEIS[i];
    }
    var idx = NIVEIS.indexOf(atual);
    var proximo = (idx >= 0 && idx + 1 < NIVEIS.length) ? NIVEIS[idx + 1] : null;

    return {
      nivel:    atual.nivel,
      titulo:   atual.titulo,
      nota:     atual.nota,
      piso:     atual.xp,
      teto:     proximo ? proximo.xp : atual.xp,
      proximo:  proximo,
      maximo:   !proximo
    };
  }

  function percentualXp(xp) {
    var n = nivelDe(xp);
    if (n.maximo) return 100;
    var faixa = n.teto - n.piso;
    if (faixa <= 0) return 100;
    return limitar(Math.round(((xp - n.piso) / faixa) * 100), 0, 100);
  }

  /* Cria a ficha a partir do avatar escolhido e da origem escolhida. */
  function novoPersonagem(avatar, origem) {
    var atrs = {};
    for (var i = 0; i < ATRIBUTOS.length; i++) {
      var ch = ATRIBUTOS[i].chave;
      atrs[ch] = (origem && origem.atributos && typeof origem.atributos[ch] === 'number')
        ? origem.atributos[ch] : 1;
    }

    return {
      avatar: avatar || null,
      origem: origem || null,
      atributos: atrs,
      xp: 0,
      nivel: nivelDe(0).nivel,
      legitimidade: (REGRAS.legitimidade && REGRAS.legitimidade.inicial) || 50,
      caixa: (origem && origem.caixa) || 0,
      diario: []
    };
  }

  /* Cópia profunda o bastante para servir de ponto de retorno. Usada quando o
     jogador refaz uma fase: a campanha daquela fase volta ao estado em que
     estava antes dela começar. A lição aprendida, essa, não volta atrás. */
  function copiar(p) {
    var atrs = {};
    for (var k in p.atributos) {
      if (Object.prototype.hasOwnProperty.call(p.atributos, k)) atrs[k] = p.atributos[k];
    }
    return {
      avatar: p.avatar,
      origem: p.origem,
      atributos: atrs,
      xp: p.xp,
      nivel: p.nivel,
      legitimidade: p.legitimidade,
      caixa: p.caixa,
      diario: p.diario.slice()
    };
  }

  /* Aplica os efeitos de qualquer fonte (evento de campanha, julgamento) e
     devolve o deltas REALMENTE aplicado — depois dos limites. Se a
     legitimidade já estava em 100, um ganho de 14 aparece como 0, e não como
     14: mostrar o número grande seria mentir sobre a ficha. */
  function aplicarEfeitos(p, efeitos) {
    var d = { xp: 0, legitimidade: 0, caixa: 0, subiuNivel: false, nivel: null };
    if (!efeitos) return d;

    var nivelAntes = nivelDe(p.xp).nivel;

    if (efeitos.xp) {
      var novoXp = Math.max(0, p.xp + efeitos.xp);
      d.xp = novoXp - p.xp;
      p.xp = novoXp;
    }
    if (efeitos.legitimidade) {
      var alvoL = limitar(p.legitimidade + efeitos.legitimidade, 0, 100);
      d.legitimidade = alvoL - p.legitimidade;
      p.legitimidade = alvoL;
    }
    if (efeitos.caixa) {
      var alvoC = Math.max(0, p.caixa + efeitos.caixa);
      d.caixa = alvoC - p.caixa;
      p.caixa = alvoC;
    }

    var nivelDepois = nivelDe(p.xp);
    d.subiuNivel = nivelDepois.nivel > nivelAntes;
    d.nivel = nivelDepois;
    p.nivel = nivelDepois.nivel;
    return d;
  }

  /* Aplica à campanha a consequência de uma conduta escolhida (ver js/app.js).
     `natureza` é 'conforme', 'vedacao' ou 'crime' — e é ela, e só ela, que
     determina o que a ficha ganha ou perde.

     A CONDUTA CONFORME é a que mais rende: XP cheio e ganho de legitimidade.
     A VEDADA custa legitimidade sem ser crime. A CRIMINOSA custa mais, e rende
     a menor experiência do jogo — porque o que se aprende errando não pode
     valer tanto quanto o que se acerta.

     Nada aqui conta ilícitos: quem faz essa conta é o índice, em js/app.js, a
     partir da natureza registrada na escolha. A ficha e o índice são dois
     medidores distintos, e é importante que continuem sendo — um mede a
     campanha, o outro mede a conduta. */
  function aplicarJulgamento(p, natureza) {
    var R = REGRAS;
    var d = aplicarEfeitos(p, {
      xp: R.xp[natureza],
      legitimidade: R.legitimidade[natureza]
    });
    d.natureza = natureza;
    return d;
  }

  /* ------------------------------------------------------------ O DADO */
  function rolarDado(faces) {
    faces = faces || (REGRAS.evento && REGRAS.evento.faces) || 20;
    return 1 + Math.floor(Math.random() * faces);
  }

  /* Resolve uma abordagem de evento de campanha contra o d20 já rolado.
     Separado da rolagem para que o mesmo resultado possa ser recalculado
     (útil em teste) sem sortear de novo. */
  function resolverEvento(p, abordagem, d20) {
    var mod = p.atributos[abordagem.atributo] || 0;
    var total = d20 + mod;
    var faixa;

    /* O crítico e o desastre vêm do VALOR DO DADO, não do total: um 20 natural
       é crítico mesmo que o atributo já bastasse, e um 1 natural é desastre
       mesmo para quem tem atributo alto. É o que faz o dado importar. */
    if (d20 === REGRAS.evento.critico)      faixa = 'critico';
    else if (d20 === REGRAS.evento.desastre) faixa = 'desastre';
    else if (total >= abordagem.cd)          faixa = 'sucesso';
    else                                     faixa = 'falha';

    var r = abordagem.resultados[faixa];

    return {
      d20: d20,
      mod: mod,
      total: total,
      cd: abordagem.cd,
      atributo: abordagem.atributo,
      faixa: faixa,
      texto: r.texto,
      efeitos: r.efeitos || {}
    };
  }

  /* =========================================================================
   * FICHA — window.RPGUI
   * ====================================================================== */

  function barra(percentual, classe, rotulo) {
    return '<span class="barra ' + (classe || '') + '">' +
             '<i style="width:' + limitar(percentual, 0, 100) + '%"></i>' +
             (rotulo ? '<span class="barra__rotulo">' + escapar(rotulo) + '</span>' : '') +
           '</span>';
  }

  function retrato(p) {
    if (typeof window.retratoDoAvatar !== 'function' || !p.avatar) return '';
    return window.retratoDoAvatar(p.avatar);
  }

  function atributosHtml(p, comResumo) {
    return ATRIBUTOS.map(function (a) {
      var v = p.atributos[a.chave] || 0;
      return '' +
        '<li class="atr' + (comResumo ? ' atr--longo' : '') + '">' +
          '<span class="atr__icone" aria-hidden="true">' + escapar(a.icone) + '</span>' +
          '<span class="atr__texto">' +
            '<span class="atr__nome">' + escapar(comResumo ? a.nome : a.abrev) + '</span>' +
            (comResumo ? '<span class="atr__resumo">' + escapar(a.resumo) + '</span>' : '') +
          '</span>' +
          '<b class="atr__valor" title="' + escapar(a.nome) + '">' + v + '</b>' +
        '</li>';
    }).join('');
  }

  /* A legitimidade é o único recurso que muda de cor conforme o valor: ela é o
     termômetro da campanha, e um número baixo precisa ser legível como
     problema, não como mais um número. */
  function faixaDeLegitimidade(v) {
    if (v >= 65) return 'alto';
    if (v >= 35) return 'medio';
    return 'baixo';
  }

  /* Os dois recursos da campanha. O terceiro medidor do jogo — o índice de
     ilícitos — não mora aqui: ele conta condutas, e não recursos, e tem o
     próprio lugar no cabeçalho (ver js/app.js). Misturar os dois faria parecer
     que cometer um ilícito é só perder pontos de campanha. */
  function recursosHtml(p) {
    return '' +
      '<span class="rec rec--largo" data-nivel="' + faixaDeLegitimidade(p.legitimidade) + '">' +
        '<span class="rec__nome">Legitimidade</span>' +
        barra(p.legitimidade) +
        '<b class="rec__valor">' + p.legitimidade + '</b>' +
      '</span>' +
      '<span class="rec">' +
        '<span class="rec__nome">Caixa</span>' +
        '<b class="rec__valor">' + escapar(moeda(p.caixa)) + '</b>' +
      '</span>';
  }

  /* --- Resumo que acompanha a partida ------------------------------- */
  function hud(p, ctx) {
    ctx = ctx || {};
    var n = nivelDe(p.xp);
    var cargo = ctx.cargo
      ? '<span class="ficha__cargo">' + escapar(ctx.cargo) + '</span>' : '';

    return '' +
      '<div class="ficha__ident">' +
        '<span class="ficha__retrato" aria-hidden="true">' + retrato(p) + '</span>' +
        '<span class="ficha__quem">' +
          '<b class="ficha__nome">' + escapar(p.avatar ? p.avatar.nome : 'Candidato') + '</b>' +
          '<span class="ficha__origem">' +
            escapar(p.origem ? p.origem.nome : 'Sem origem') + '</span>' +
          cargo +
        '</span>' +
      '</div>' +

      '<div class="ficha__nivel">' +
        '<span class="ficha__nivel-linha">' +
          'Nível <b>' + n.nivel + '</b> · ' + escapar(n.titulo) +
        '</span>' +
        barra(percentualXp(p.xp), 'barra--xp') +
        '<span class="ficha__xp-num">' +
          (n.maximo ? p.xp + ' XP · nível máximo'
                    : p.xp + ' / ' + n.teto + ' XP') +
        '</span>' +
      '</div>' +

      '<ul class="ficha__atributos">' + atributosHtml(p, false) + '</ul>' +

      '<div class="ficha__recursos">' + recursosHtml(p) + '</div>';
  }

  /* --- Ficha completa (criação e resultado) ------------------------- */
  function fichaCompleta(p, ctx) {
    ctx = ctx || {};
    var n = nivelDe(p.xp);

    return '' +
      '<section class="ficha-cheia">' +
        '<div class="ficha-cheia__topo">' +
          '<span class="ficha-cheia__retrato" aria-hidden="true">' + retrato(p) + '</span>' +
          '<div class="ficha-cheia__quem">' +
            '<h3 class="ficha-cheia__nome">' +
              escapar(p.avatar ? p.avatar.nome : 'Candidato') + '</h3>' +
            '<p class="ficha-cheia__origem">' +
              escapar(p.origem ? p.origem.nome : '—') + '</p>' +
            (p.origem ? '<p class="ficha-cheia__lema">' +
              escapar(p.origem.lema) + '</p>' : '') +
          '</div>' +
          '<div class="ficha-cheia__nivel">' +
            '<p class="ficha-cheia__nivel-num">Nível ' + n.nivel + '</p>' +
            '<p class="ficha-cheia__nivel-titulo">' + escapar(n.titulo) + '</p>' +
            barra(percentualXp(p.xp), 'barra--xp') +
            '<p class="ficha-cheia__xp">' +
              (n.maximo ? p.xp + ' XP · nível máximo'
                        : p.xp + ' / ' + n.teto + ' XP') + '</p>' +
            '<p class="ficha-cheia__nota">' + escapar(n.nota) + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="ficha-cheia__recursos">' + recursosHtml(p) + '</div>' +

        '<ul class="ficha-cheia__atributos">' + atributosHtml(p, true) + '</ul>' +
      '</section>';
  }

  /* --- Inventário do dia -------------------------------------------- */
  function inventario(itens) {
    var ITENS = window.ITENS || {};
    if (!itens || !itens.length) return '';

    var lista = itens.map(function (chave) {
      var it = ITENS[chave];
      if (!it) return '';
      return '' +
        '<li class="item" title="' + escapar(it.nota) + '">' +
          '<span class="item__icone" aria-hidden="true">' + escapar(it.icone) + '</span>' +
          '<span class="item__texto">' +
            '<span class="item__nome">' + escapar(it.nome) + '</span>' +
            '<span class="item__nota">' + escapar(it.nota) + '</span>' +
          '</span>' +
        '</li>';
    }).join('');

    return '' +
      '<div class="inventario">' +
        '<p class="inventario__titulo">Neste dia, a campanha carrega</p>' +
        '<ul class="inventario__lista">' + lista + '</ul>' +
      '</div>';
  }

  /* --- O dado -------------------------------------------------------- */
  var HEX = [[60, 10], [16.7, 35], [16.7, 85], [60, 110], [103.3, 85], [103.3, 35]];

  function pontos(lista) {
    return lista.map(function (p) { return p[0] + ',' + p[1]; }).join(' ');
  }

  /* Um d20 visto de frente: o hexágono externo, o triângulo voltado para cima
     e o voltado para baixo. O número fica na face central. */
  function dado(valor, estado) {
    estado = estado || 'parado';
    var mostrado = (valor === null || valor === undefined) ? '?' : String(valor);

    return '' +
      '<svg class="dado" data-estado="' + escapar(estado) + '" viewBox="0 0 120 120" ' +
           'width="120" height="120" xmlns="http://www.w3.org/2000/svg" ' +
           'role="img" aria-label="' +
           (valor === null || valor === undefined
             ? 'Dado de vinte faces, ainda não rolado'
             : 'Dado de vinte faces: ' + mostrado) + '">' +
        '<polygon class="dado__face" points="' + pontos(HEX) + '"/>' +
        '<polygon class="dado__linha" points="60,10 16.7,85 103.3,85"/>' +
        '<polygon class="dado__linha" points="60,110 16.7,35 103.3,35"/>' +
        '<text class="dado__numero" x="60" y="60" text-anchor="middle" ' +
              'dominant-baseline="central">' + escapar(mostrado) + '</text>' +
      '</svg>';
  }

  /* --- Efeitos aplicados --------------------------------------------- */
  function efeitos(d) {
    if (!d) return '';
    var partes = [];

    /* O sinal define a cor, não o tipo de recurso: perder legitimidade não
       pode aparecer em verde só porque "legitimidade" é um recurso bom. */
    function sinal(v) { return v > 0 ? 'mais' : 'menos'; }

    if (d.xp) {
      partes.push('<span class="efeito efeito--xp" data-sinal="' + sinal(d.xp) + '">' +
                  (d.xp > 0 ? '+' : '') + d.xp + ' XP</span>');
    }
    if (d.legitimidade) {
      partes.push('<span class="efeito efeito--leg" data-sinal="' +
                  sinal(d.legitimidade) + '">' +
                  (d.legitimidade > 0 ? '+' : '') + d.legitimidade +
                  ' legitimidade</span>');
    }
    if (d.caixa) {
      partes.push('<span class="efeito efeito--caixa" data-sinal="' +
                  sinal(d.caixa) + '">' +
                  (d.caixa > 0 ? '+' : '−') + escapar(moeda(Math.abs(d.caixa))) +
                  '</span>');
    }
    if (!partes.length) return '';

    return '<p class="efeitos">' + partes.join('') + '</p>';
  }

  /* ========================================================================= */
  window.RPG = {
    nivelDe: nivelDe,
    percentualXp: percentualXp,
    novoPersonagem: novoPersonagem,
    copiar: copiar,
    aplicarEfeitos: aplicarEfeitos,
    aplicarJulgamento: aplicarJulgamento,
    rolarDado: rolarDado,
    resolverEvento: resolverEvento,
    atributoDe: atributoDe,
    moeda: moeda
  };

  window.RPGUI = {
    hud: hud,
    fichaCompleta: fichaCompleta,
    inventario: inventario,
    dado: dado,
    efeitos: efeitos,
    barra: barra,
    escapar: escapar
  };
})();
