/* =============================================================================
 * ILUSTRAÇÕES — SVG inline, sem dependências
 * -----------------------------------------------------------------------------
 * RNF-05: as ilustrações devem distinguir cada situação mantendo padronização
 * gráfica entre si. Por isso todas compartilham a MESMA paleta, o mesmo
 * traço e os mesmos módulos (pessoa, prédio, calçada, objeto).
 *
 * DUAS REGRAS PEDAGÓGICAS GOVERNAM ESTE ARQUIVO:
 *
 * 1. A cor NUNCA antecipa o veredito. As cenas lícitas, criminosa e ambígua
 *    usam exatamente as mesmas cores de figura, fundo e vestuário. Se a
 *    ilustração denunciasse a resposta, a situação deixaria de exigir
 *    julgamento — que é o núcleo do produto (RF-05).
 *
 * 2. O protagonista é o avatar escolhido pelo jogador (RF-14/RF-15). Ele
 *    aparece em todas as cenas, marcado com a etiqueta "VOCÊ", porque o
 *    jogador precisa reconhecer-se na cena para julgar a própria conduta.
 * ========================================================================== */

(function () {
  'use strict';

  var COR = {
    ceu:       '#d8e6f6',
    ceuAlto:   '#c0d5ee',
    chao:      '#e7e2d7',
    chaoEsc:   '#d5cec0',
    predio:    '#ccd7e4',
    predioEsc: '#adbbcd',
    predioDet: '#8da0b7',
    vidro:     '#b7cbe4',
    linha:     '#2b3648',
    papel:     '#fbf9f2',
    papelEsc:  '#ddd7c8',
    pele:      ['#f1cba3', '#e0aa78', '#c98a5c', '#a3663f', '#7d4c2e'],
    cabelo:    ['#2b2318', '#4a3524', '#7a5230', '#1a1a1a', '#5c4033', '#8a6a3a'],
    camisa:    ['#3b6ea5', '#c98a3c', '#7a5aa8', '#4f9e6a', '#b45a5a', '#3f7f8f'],
    calca:     '#39435a',
    carro:     '#5b6b85',
    carroEsc:  '#44536b',
    caixa:     '#c9a06a',
    caixaEsc:  '#a67f4d',
    marca:     '#1f3b73'
  };

  var FONTE = "'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif";

  /* Avatar de reserva: se o jogador chegar a uma cena sem ter escolhido,
     o desenho sai assim em vez de quebrar. */
  var AV_PADRAO = { pele: COR.pele[1], cabelo: COR.cabelo[0], camisa: COR.camisa[0] };

  /* ---------------------------------------------------------------------
   * MÓDULOS REUTILIZÁVEIS
   * ------------------------------------------------------------------ */

  function marcadorVoce() {
    return '' +
      '<g transform="translate(0,-141)">' +
        '<rect x="-23" y="0" width="46" height="19" rx="9.5" fill="' + COR.marca + '"/>' +
        '<text x="0" y="13.5" font-family="' + FONTE + '" font-size="10" font-weight="800" ' +
          'fill="#ffffff" text-anchor="middle" letter-spacing=".8">VOCÊ</text>' +
      '</g>';
  }

  /* Uma pessoa. (x, y) é o ponto onde os pés tocam o chão. */
  function pessoa(x, y, o) {
    o = o || {};
    var s        = o.escala === undefined ? 1 : o.escala;
    var pele     = o.pele     || COR.pele[1];
    var cabelo   = o.cabelo   || COR.cabelo[0];
    var camisa   = o.camisa   || COR.camisa[0];
    var calca    = o.calca    || COR.calca;
    var bracoDir = o.bracoDir === undefined ? 0 : o.bracoDir;   /* graus */
    var bracoEsq = o.bracoEsq === undefined ? 0 : o.bracoEsq;
    var pernas   = o.pernas || 0;                                /* graus, abertura */
    var extra    = o.extra || '';                                /* SVG adicional no tronco */

    return '' +
      '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
        '<ellipse cx="0" cy="3" rx="21" ry="5" fill="rgba(20,28,44,.10)"/>' +
        /* pernas */
        '<g transform="rotate(' + pernas + ' 0 -36)">' +
          '<rect x="-13" y="-38" width="11" height="38" rx="5" fill="' + calca + '"/>' +
        '</g>' +
        '<g transform="rotate(' + (-pernas) + ' 0 -36)">' +
          '<rect x="2" y="-38" width="11" height="38" rx="5" fill="' + calca + '"/>' +
        '</g>' +
        /* tronco */
        '<rect x="-16" y="-87" width="32" height="53" rx="11" fill="' + camisa + '"/>' +
        /* braços */
        '<g transform="rotate(' + bracoEsq + ' -14 -80)">' +
          '<rect x="-24" y="-80" width="10" height="45" rx="5" fill="' + camisa + '"/>' +
          '<circle cx="-19" cy="-37" r="5.5" fill="' + pele + '"/>' +
        '</g>' +
        '<g transform="rotate(' + bracoDir + ' 14 -80)">' +
          '<rect x="14" y="-80" width="10" height="45" rx="5" fill="' + camisa + '"/>' +
          '<circle cx="19" cy="-37" r="5.5" fill="' + pele + '"/>' +
        '</g>' +
        /* cabeça */
        '<rect x="-4.5" y="-92" width="9" height="9" fill="' + pele + '"/>' +
        '<circle cx="0" cy="-100" r="13.5" fill="' + pele + '"/>' +
        '<path d="M -13.5,-101 a 13.5,13.5 0 0 1 27,0 z" fill="' + cabelo + '"/>' +
        extra +
        (o.marcador ? marcadorVoce() : '') +
      '</g>';
  }

  /* O jovem candidato: a pessoa desenhada com as cores do avatar escolhido. */
  function protagonista(x, y, o, av) {
    av = av || AV_PADRAO;
    o = o || {};
    o.pele   = av.pele;
    o.cabelo = av.cabelo;
    o.camisa = av.camisa;
    o.marcador = true;
    return pessoa(x, y, o);
  }

  /* Prédio da seção eleitoral, com faixa. (x, y) é o canto inferior esquerdo. */
  function predioSecao(x, y, o) {
    o = o || {};
    var s = o.escala === undefined ? 1 : o.escala;
    return '' +
      '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
        '<rect x="0" y="-150" width="230" height="150" rx="6" fill="' + COR.predio + '"/>' +
        '<rect x="0" y="-150" width="230" height="16" rx="6" fill="' + COR.predioEsc + '"/>' +
        /* janelas */
        '<rect x="20" y="-118" width="38" height="34" rx="4" fill="' + COR.vidro + '"/>' +
        '<rect x="76" y="-118" width="38" height="34" rx="4" fill="' + COR.vidro + '"/>' +
        '<rect x="132" y="-118" width="38" height="34" rx="4" fill="' + COR.vidro + '"/>' +
        '<rect x="188" y="-118" width="22" height="34" rx="4" fill="' + COR.vidro + '"/>' +
        /* porta */
        '<rect x="96" y="-62" width="46" height="62" rx="5" fill="' + COR.predioDet + '"/>' +
        '<circle cx="134" cy="-30" r="3.4" fill="' + COR.predioEsc + '"/>' +
        /* faixa */
        '<rect x="20" y="-52" width="64" height="20" rx="4" fill="' + COR.papel + '"/>' +
        '<rect x="154" y="-52" width="64" height="20" rx="4" fill="' + COR.papel + '"/>' +
        '<text x="52" y="-37.5" font-family="' + FONTE + '" font-size="9" font-weight="700" ' +
          'fill="' + COR.predioDet + '" text-anchor="middle" letter-spacing=".4">SEÇÃO</text>' +
        '<text x="186" y="-37.5" font-family="' + FONTE + '" font-size="9" font-weight="700" ' +
          'fill="' + COR.predioDet + '" text-anchor="middle" letter-spacing=".4">ELEITORAL</text>' +
      '</g>';
  }

  /* Um santinho (papel de propaganda). */
  function santinho(x, y, giro) {
    giro = giro || 0;
    return '' +
      '<g transform="translate(' + x + ',' + y + ') rotate(' + giro + ')">' +
        '<rect x="-11" y="-15" width="22" height="30" rx="2.5" fill="' + COR.papel + '" ' +
          'stroke="' + COR.papelEsc + '" stroke-width="1.4"/>' +
        '<rect x="-5" y="-9" width="10" height="10" rx="5" fill="' + COR.predioEsc + '"/>' +
        '<rect x="-7" y="4" width="14" height="2.6" rx="1.3" fill="' + COR.papelEsc + '"/>' +
        '<rect x="-7" y="9" width="9" height="2.6" rx="1.3" fill="' + COR.papelEsc + '"/>' +
      '</g>';
  }

  function base(ceu, chao, horizonte) {
    horizonte = horizonte === undefined ? 268 : horizonte;
    return '' +
      '<rect x="0" y="0" width="640" height="' + horizonte + '" fill="' + ceu + '"/>' +
      '<rect x="0" y="' + horizonte + '" width="640" height="' + (360 - horizonte) + '" fill="' + chao + '"/>' +
      '<rect x="0" y="' + (horizonte - 6) + '" width="640" height="6" fill="' + COR.chaoEsc + '"/>';
  }

  /* Prédios distantes, para dar profundidade sem chamar atenção. */
  function quarteirao(y, tons) {
    var t = tons || COR.predioEsc;
    return '' +
      '<g opacity=".55">' +
        '<rect x="0"   y="' + (y - 70) + '" width="72"  height="70" rx="4" fill="' + t + '"/>' +
        '<rect x="84"  y="' + (y - 96) + '" width="58"  height="96" rx="4" fill="' + t + '"/>' +
        '<rect x="470" y="' + (y - 84) + '" width="66"  height="84" rx="4" fill="' + t + '"/>' +
        '<rect x="548" y="' + (y - 60) + '" width="92"  height="60" rx="4" fill="' + t + '"/>' +
      '</g>';
  }

  /* width/height explícitos além do viewBox: sem tamanho intrínseco, o WebKit
     antigo resolve `height:auto` como 150px e achata a ilustração, que é o
     principal elemento de julgamento da cena. O CSS sobrescreve os atributos
     para o layout responsivo. */
  function svg(conteudo, largura, altura) {
    largura = largura || 640;
    altura  = altura  || 360;
    return '<svg viewBox="0 0 ' + largura + ' ' + altura + '" width="' + largura +
           '" height="' + altura + '" preserveAspectRatio="xMidYMid meet" ' +
           'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
           conteudo + '</svg>';
  }

  var SVG_VAZIO = svg('', 640, 360);

  /* ---------------------------------------------------------------------
   * RETRATO DO AVATAR — tela de seleção (RF-14 / RF-15)
   * ------------------------------------------------------------------ */
  function retrato(av) {
    av = av || AV_PADRAO;
    return svg(
      '<rect x="0" y="0" width="120" height="120" fill="#eef2f9"/>' +
      /* ombros */
      '<path d="M18,120 Q18,86 60,86 Q102,86 102,120 Z" fill="' + av.camisa + '"/>' +
      /* pescoço */
      '<rect x="52" y="66" width="16" height="20" fill="' + av.pele + '"/>' +
      /* cabeça */
      '<circle cx="60" cy="52" r="26" fill="' + av.pele + '"/>' +
      /* cabelo */
      '<path d="M34,50 a 26,26 0 0 1 52,0 z" fill="' + av.cabelo + '"/>' +
      '<path d="M34,50 Q34,30 46,26 Q38,38 38,52 Z" fill="' + av.cabelo + '"/>' +
      '<path d="M86,50 Q86,30 74,26 Q82,38 82,52 Z" fill="' + av.cabelo + '"/>' +
      /* olhos */
      '<circle cx="51" cy="53" r="2.6" fill="' + COR.linha + '"/>' +
      '<circle cx="69" cy="53" r="2.6" fill="' + COR.linha + '"/>' +
      /* sorriso */
      '<path d="M52,63 Q60,69 68,63" fill="none" stroke="' + COR.linha + '" ' +
        'stroke-width="2" stroke-linecap="round"/>',
      120, 120
    );
  }

  /* ---------------------------------------------------------------------
   * AS SEIS CENAS — todas recebem o avatar do jogador
   * ------------------------------------------------------------------ */
  var CENAS = {

    /* 1 — O candidato com broche e adesivo, a caminho da seção. */
    broche: function (av) {
      return svg(
        base(COR.ceu, COR.chao) +
        quarteirao(268) +
        predioSecao(370, 268, { escala: 0.86 }) +
        '<rect x="0" y="300" width="640" height="60" fill="' + COR.chaoEsc + '" opacity=".5"/>' +
        '<rect x="86" y="150" width="7" height="118" rx="3" fill="' + COR.predioEsc + '"/>' +
        /* uma segunda pessoa ao longe, sem interação com o candidato */
        pessoa(556, 292, { escala: 0.7, camisa: COR.camisa[1], cabelo: COR.cabelo[2], pernas: 4 }) +
        protagonista(210, 316, {
          escala: 1.16,
          pernas: 7,
          extra:
            '<circle cx="9" cy="-64" r="7" fill="' + COR.papel + '" stroke="' + COR.predioDet + '" stroke-width="1.6"/>' +
            '<text x="9" y="-60.6" font-family="' + FONTE + '" font-size="7.5" font-weight="700" ' +
              'fill="' + COR.predioDet + '" text-anchor="middle">40</text>' +
            '<rect x="-30" y="-84" width="17" height="42" rx="7" fill="' + COR.predioEsc + '"/>' +
            '<rect x="-27" y="-78" width="11" height="13" rx="2" fill="' + COR.papel + '" stroke="' + COR.papelEsc + '" stroke-width="1.2"/>'
        }, av)
      );
    },

    /* 2 — O cabo eleitoral distribuindo; o candidato observa. */
    distribuicao: function (av) {
      return svg(
        base(COR.ceuAlto, COR.chao, 274) +
        predioSecao(392, 274, { escala: 0.9 }) +
        /* fila: três eleitores voltados para a frente */
        pessoa(556, 330, { escala: 1.0,  camisa: COR.camisa[0], cabelo: COR.cabelo[2], pele: COR.pele[2], bracoEsq: 4 }) +
        pessoa(474, 336, { escala: 1.04, camisa: COR.camisa[4], cabelo: COR.cabelo[0], pele: COR.pele[0] }) +
        pessoa(398, 334, { escala: 1.02, camisa: COR.camisa[2], cabelo: COR.cabelo[5], pele: COR.pele[3], bracoEsq: 30 }) +
        /* o cabo eleitoral, de costas para a fila (espelhado) */
        '<g transform="translate(300,342) scale(-1.08,1.08)">' +
          pessoa(0, 0, {
            camisa: COR.camisa[5],
            cabelo: COR.cabelo[1],
            pele: COR.pele[1],
            bracoDir: 62,
            extra:
              '<rect x="-27" y="-74" width="20" height="15" rx="2" fill="' + COR.papel + '" ' +
                'stroke="' + COR.papelEsc + '" stroke-width="1.2"/>'
          }) +
        '</g>' +
        /* o santinho no instante da entrega */
        santinho(344, 288, -14) +
        santinho(358, 296, 8) +
        /* o candidato, a poucos metros, observando a cena */
        protagonista(180, 348, { escala: 1.14, bracoEsq: 8 }, av)
      );
    },

    /* 3 — O candidato de camiseta, dentro da fila. */
    camiseta: function (av) {
      return svg(
        base(COR.ceuAlto, COR.chao, 274) +
        predioSecao(378, 274, { escala: 0.9 }) +
        pessoa(548, 340, { escala: 1.0,  camisa: COR.camisa[5], cabelo: COR.cabelo[2], pele: COR.pele[3] }) +
        pessoa(452, 336, { escala: 0.96, camisa: COR.camisa[2], cabelo: COR.cabelo[4], pele: COR.pele[1] }) +
        protagonista(196, 350, {
          escala: 1.26,
          extra:
            '<rect x="-13" y="-78" width="26" height="30" rx="4" fill="' + COR.papel + '" opacity=".94"/>' +
            '<text x="0" y="-65" font-family="' + FONTE + '" font-size="13" font-weight="800" ' +
              'fill="' + COR.predioDet + '" text-anchor="middle">40</text>' +
            '<text x="0" y="-54" font-family="' + FONTE + '" font-size="7" font-weight="700" ' +
              'fill="' + COR.predioDet + '" text-anchor="middle" letter-spacing=".5">NOME</text>'
        }, av)
      );
    },

    /* 4 — O candidato ao lado do carro com a caixa fechada. */
    portamalas: function (av) {
      return svg(
        base(COR.ceu, COR.chao, 276) +
        quarteirao(276) +
        /* asfalto */
        '<rect x="0" y="276" width="640" height="84" fill="#5f6a7d"/>' +
        '<rect x="0" y="306" width="640" height="5" fill="#8a94a5" opacity=".5"/>' +
        '<g transform="translate(150,300)">' +
          '<ellipse cx="120" cy="6" rx="140" ry="9" fill="rgba(20,28,44,.16)"/>' +
          '<path d="M-6,-34 L6,-72 Q10,-80 22,-80 L86,-80 Q98,-80 102,-72 L114,-34 Z" fill="' + COR.carro + '"/>' +
          '<rect x="-10" y="-38" width="240" height="36" rx="9" fill="' + COR.carro + '"/>' +
          '<path d="M4,-74 L22,-30 L44,-30 L30,-74 Z" fill="' + COR.vidro + '" opacity=".8"/>' +
          /* tampa do porta-malas aberta */
          '<path d="M96,-34 L124,-96 Q128,-104 136,-102 L142,-100" fill="none" ' +
            'stroke="' + COR.carroEsc + '" stroke-width="9" stroke-linecap="round"/>' +
          /* a caixa, fechada e lacrada */
          '<rect x="60" y="-78" width="46" height="34" rx="4" fill="' + COR.caixa + '"/>' +
          '<rect x="60" y="-78" width="46" height="9" rx="4" fill="' + COR.caixaEsc + '"/>' +
          '<rect x="78" y="-78" width="6" height="34" fill="' + COR.papel + '" opacity=".7"/>' +
          '<circle cx="34"  cy="-2" r="19" fill="#243044"/>' +
          '<circle cx="34"  cy="-2" r="8"  fill="#7c879a"/>' +
          '<circle cx="176" cy="-2" r="19" fill="#243044"/>' +
          '<circle cx="176" cy="-2" r="8"  fill="#7c879a"/>' +
        '</g>' +
        protagonista(486, 348, { escala: 1.18, bracoEsq: 10 }, av)
      );
    },

    /* 5 — O candidato falando com um eleitor. */
    abordagem: function (av) {
      return svg(
        base(COR.ceu, COR.chao) +
        quarteirao(268) +
        predioSecao(414, 268, { escala: 0.78 }) +
        '<rect x="0" y="300" width="640" height="60" fill="' + COR.chaoEsc + '" opacity=".5"/>' +
        /* marcas de fala, neutras */
        '<g stroke="' + COR.predioDet + '" stroke-width="3" stroke-linecap="round" opacity=".75">' +
          '<line x1="312" y1="252" x2="324" y2="252"/>' +
          '<line x1="312" y1="264" x2="330" y2="264"/>' +
          '<line x1="312" y1="276" x2="322" y2="276"/>' +
        '</g>' +
        /* quem é abordado */
        '<g transform="translate(420,332) scale(-1.06,1.06)">' +
          pessoa(0, 0, {
            camisa: COR.camisa[0],
            cabelo: COR.cabelo[5],
            pele: COR.pele[0],
            bracoEsq: 10
          }) +
        '</g>' +
        /* o candidato, com o adesivo no peito, falando */
        '<g transform="translate(252,332) scale(1.16)">' +
          pessoa(0, 0, {
            pele: av ? av.pele : AV_PADRAO.pele,
            cabelo: av ? av.cabelo : AV_PADRAO.cabelo,
            camisa: av ? av.camisa : AV_PADRAO.camisa,
            bracoDir: 74,
            bracoEsq: -8,
            marcador: true,
            extra:
              '<circle cx="7" cy="-64" r="7" fill="' + COR.papel + '" stroke="' + COR.predioDet + '" stroke-width="1.6"/>' +
              '<text x="7" y="-60.6" font-family="' + FONTE + '" font-size="7.5" font-weight="700" ' +
                'fill="' + COR.predioDet + '" text-anchor="middle">40</text>'
          }) +
        '</g>'
      );
    },

    /* 6 — O candidato ao lado da bandeira apoiada no chão. */
    bandeira: function (av) {
      return svg(
        base(COR.ceuAlto, COR.chao) +
        quarteirao(268) +
        predioSecao(346, 268, { escala: 0.9 }) +
        '<rect x="0" y="300" width="640" height="60" fill="' + COR.chaoEsc + '" opacity=".5"/>' +
        /* mastro + bandeira */
        '<rect x="228" y="150" width="6" height="152" rx="3" fill="' + COR.predioDet + '"/>' +
        '<rect x="222" y="296" width="18" height="9" rx="4" fill="' + COR.predioEsc + '"/>' +
        '<path d="M234,156 L322,168 L322,214 L234,202 Z" fill="' + COR.camisa[3] + '"/>' +
        '<path d="M234,166 L310,176 L310,190 L234,180 Z" fill="' + COR.papel + '" opacity=".85"/>' +
        protagonista(300, 314, { escala: 1.14, bracoEsq: 6, bracoDir: -6 }, av)
      );
    }
  };

  /* ---------------------------------------------------------------------
   * API PÚBLICA
   * ------------------------------------------------------------------ */

  /* A busca é na própria tabela, e não na cadeia de protótipos: com
     CENAS['constructor'] a expressão devolveria uma função herdada de
     Object.prototype e o desenho sairia como "[object Object]", ou lançaria
     exceção no caso de '__proto__', deixando o palco em branco. */
  window.ilustracaoDaCena = function (chave, avatar) {
    if (!Object.prototype.hasOwnProperty.call(CENAS, chave)) return SVG_VAZIO;
    return CENAS[chave](avatar);
  };

  window.retratoDoAvatar = function (avatar) { return retrato(avatar); };

  /* Exposto para o harness de teste conferir que toda chave usada em
     dados/cenas.js tem desenho correspondente. */
  window.CHAVES_ILUSTRACAO = Object.keys(CENAS);
})();
