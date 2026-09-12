/* =============================================================================
 * FICHA DO CANDIDATO — a experiência da campanha
 * -----------------------------------------------------------------------------
 * Este arquivo faz duas coisas, e só duas:
 *
 *   1. REGRAS  (window.RPG)    — a experiência e os níveis que ela abre.
 *   2. FICHA   (window.RPGUI)  — a folha do candidato em HTML: o resumo que
 *                                acompanha a partida, a ficha das telas de
 *                                criação e de resultado, e o inventário do dia.
 *
 * A CAMPANHA TEM UM NÚMERO SÓ, E ELE É A EXPERIÊNCIA. A conduta conforme
 * rende experiência; o ilícito devolve. Não há atributo, não há dado, não há
 * dinheiro e não há prestígio: quanto mais o candidato acerta, mais alto ele
 * chega, e quanto mais ele erra, mais ele recua — e é isso, do começo ao fim,
 * que faz o personagem avançar.
 *
 * O QUE ESTE ARQUIVO NUNCA FAZ: julgar conduta. Nenhuma função daqui recebe
 * uma circunstância nem decide se uma escolha foi lícita. Quem classifica cada
 * conduta é o arquivo de dados, no campo `natureza`; quem aplica a
 * consequência é js/app.js. O número daqui governa a CAMPANHA — nunca a
 * licitude, e nunca a contagem de ilícitos, que tem medidor próprio.
 *
 * Sem dependência externa, sem framework, sem build (RNF-02).
 * ========================================================================== */

(function () {
  'use strict';

  var NIVEIS = window.NIVEIS || [];
  var REGRAS = window.REGRAS || { xp: {} };

  /* --------------------------------------------------------------- APOIO */
  function limitar(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function escapar(txt) {
    return String(txt).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
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

  /* Cria a ficha a partir do retrato escolhido e da história escolhida. A
     origem entra como texto — quem o candidato é —, e não como número: nenhuma
     origem começa com vantagem sobre as outras. */
  function novoPersonagem(avatar, origem) {
    return {
      avatar: avatar || null,
      origem: origem || null,
      xp: 0,
      nivel: nivelDe(0).nivel,
      diario: []
    };
  }

  /* Cópia profunda o bastante para servir de ponto de retorno. Usada quando o
     jogador refaz uma fase: a campanha daquela fase volta ao estado em que
     estava antes dela começar. A lição aprendida, essa, não volta atrás. */
  function copiar(p) {
    return {
      avatar: p.avatar,
      origem: p.origem,
      xp: p.xp,
      nivel: p.nivel,
      diario: p.diario.slice()
    };
  }

  /* Aplica os efeitos de uma conduta e devolve o delta REALMENTE aplicado —
     depois dos limites. Se a campanha já estava sem experiência, um prejuízo
     de 40 aparece como 0, e não como 40: mostrar o número grande seria mentir
     sobre a ficha. A experiência nunca fica negativa. */
  function aplicarEfeitos(p, efeitos) {
    var d = { xp: 0, subiuNivel: false, desceuNivel: false, nivel: null };
    if (!efeitos) return d;

    var nivelAntes = nivelDe(p.xp).nivel;

    if (efeitos.xp) {
      var novoXp = Math.max(0, p.xp + efeitos.xp);
      d.xp = novoXp - p.xp;
      p.xp = novoXp;
    }

    var nivelDepois = nivelDe(p.xp);
    d.subiuNivel = nivelDepois.nivel > nivelAntes;
    d.desceuNivel = nivelDepois.nivel < nivelAntes;
    d.nivel = nivelDepois;
    p.nivel = nivelDepois.nivel;
    return d;
  }

  /* Aplica à campanha a consequência de uma conduta escolhida (ver js/app.js).
     `natureza` é 'conforme', 'vedacao' ou 'crime' — e é ela, e só ela, que
     determina o que a ficha ganha ou perde.

     A CONDUTA CONFORME É A ÚNICA QUE RENDE: +40 de experiência. O ilícito
     devolve, e devolve mais quanto mais grave ele é — a conduta vedada custa
     20, o crime custa 40. O sinal é a lição: acertar soma, errar subtrai.

     Nada aqui conta ilícitos: quem faz essa conta é o índice, em js/app.js, a
     partir da natureza registrada na escolha. A ficha e o índice são dois
     medidores distintos, e é importante que continuem sendo — um mede a
     campanha, o outro mede a conduta. */
  function aplicarJulgamento(p, natureza) {
    var d = aplicarEfeitos(p, { xp: REGRAS.xp[natureza] });
    d.natureza = natureza;
    return d;
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
      '</div>';
  }

  /* --- Ficha completa (resultado) ----------------------------------- */
  function fichaCompleta(p, ctx) {
    ctx = ctx || {};
    var n = nivelDe(p.xp);
    var cargo = ctx.cargo
      ? '<p class="ficha-cheia__cargo">' + escapar(ctx.cargo) + '</p>' : '';

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
            cargo +
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

  /* --- Efeitos aplicados ---------------------------------------------
     Um efeito só, agora: a experiência. O chip aparece SEMPRE, inclusive
     quando o delta é zero — se a campanha não tinha mais experiência a
     perder, o "0 XP" ao lado da conduta ilícita diz exatamente isso, e é
     melhor dizê-lo do que esconder o efeito. */
  function efeitos(d) {
    if (!d) return '';

    var sinal = d.xp > 0 ? 'mais' : (d.xp < 0 ? 'menos' : 'zero');
    var texto = d.xp > 0 ? '+' + d.xp + ' XP'
              : (d.xp < 0 ? '−' + Math.abs(d.xp) + ' XP' : '0 XP');

    return '<p class="efeitos">' +
             '<span class="efeito efeito--xp" data-sinal="' + sinal + '">' +
               texto + '</span>' +
           '</p>';
  }

  /* ========================================================================= */
  window.RPG = {
    nivelDe: nivelDe,
    percentualXp: percentualXp,
    novoPersonagem: novoPersonagem,
    copiar: copiar,
    aplicarEfeitos: aplicarEfeitos,
    aplicarJulgamento: aplicarJulgamento
  };

  window.RPGUI = {
    hud: hud,
    fichaCompleta: fichaCompleta,
    inventario: inventario,
    efeitos: efeitos,
    barra: barra,
    escapar: escapar
  };
})();
