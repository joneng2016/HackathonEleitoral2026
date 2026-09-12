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
    marca:     '#1f3b73',
    metal:     '#d5dde9',
    metalEsc:  '#8b98ad'
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

  /* Uma pessoa. (x, y) é o ponto onde os pés tocam o chão — ou, para quem
     está na cadeira, onde as rodas tocam o chão. */
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
    var sentado  = o.cadeirante ? true : false;

    return '' +
      '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
        /* a sombra acompanha a largura das rodas */
        '<ellipse cx="0" cy="3" rx="' + (sentado ? 40 : 21) + '" ry="' +
          (sentado ? 6 : 5) + '" fill="rgba(20,28,44,.10)"/>' +
        (sentado ? cadeiraFrontalAtras() : '') +
        /* pernas: só em quem está de pé. Quem está sentado troca as pernas
           pelo assento — o tronco, os braços e a cabeça continuam iguais,
           e é isso que mantém o broche, a camiseta e o santinho das cenas
           caindo sobre o corpo em qualquer avatar. */
        (sentado ? '' :
          '<g transform="rotate(' + pernas + ' 0 -36)">' +
            '<rect x="-13" y="-38" width="11" height="38" rx="5" fill="' + calca + '"/>' +
          '</g>' +
          '<g transform="rotate(' + (-pernas) + ' 0 -36)">' +
            '<rect x="2" y="-38" width="11" height="38" rx="5" fill="' + calca + '"/>' +
          '</g>') +
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
        (o.cabeloLongo ? mechasLongas(cabelo) : '') +
        '<path d="M -13.5,-101 a 13.5,13.5 0 0 1 27,0 z" fill="' + cabelo + '"/>' +
        /* O piercing não é desenhado aqui: o rosto das figuras das cenas não
           tem um único traço onde ele caia (ver `retratoPiercing`). Na cena,
           quem identifica o avatar é a cor do cabelo e a da pele. */
        extra +
        (o.marcador ? marcadorVoce() : '') +
        (sentado ? cadeiraFrontalFrente(calca) : '') +
      '</g>';
  }

  /* Mechas que caem sobre os ombros. Desenhadas ANTES do cabelo do alto da
     cabeça: o semicírculo cobre a raiz das mechas, e o cabelo sai de baixo
     dele em vez de flutuar sobre a testa. */
  function mechasLongas(cabelo) {
    return '' +
      '<path d="M -12,-106 q -6,16 -4,32 q 3.5,2 7,0 q -1,-16 2,-30 z" fill="' + cabelo + '"/>' +
      '<path d="M 12,-106 q 6,16 4,32 q -3.5,2 -7,0 q 1,-16 -2,-30 z" fill="' + cabelo + '"/>';
  }

  /* O jovem candidato: a pessoa desenhada com o que o avatar escolhido
     carrega — as cores, a cadeira e as mechas. `piercing` não vem para cá:
     o rosto das figuras das cenas não tem traços onde ele caia (ver a nota
     em `pessoa`). */
  function protagonista(x, y, o, av) {
    av = av || AV_PADRAO;
    o = o || {};
    o.pele        = av.pele;
    o.cabelo      = av.cabelo;
    o.camisa      = av.camisa;
    o.cadeirante  = av.cadeirante ? true : false;
    o.cabeloLongo = av.cabeloLongo ? true : false;
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
  /* A cadeira no retrato. O retrato corta o corpo na altura do peito, então
     a cadeira aparece só por onde ela passa por trás de quem está sentado:
     o encosto e as alças de condução, dos dois lados do ombro. As rodas
     ficam abaixo do corte — quem as mostra é a cena. */
  function retratoCadeira() {
    return '' +
      '<rect x="18" y="46" width="84" height="11" rx="5.5" fill="' + QUADRO + '"/>' +
      '<rect x="18" y="46" width="11" height="74" rx="5.5" fill="' + QUADRO + '"/>' +
      '<rect x="91" y="46" width="11" height="74" rx="5.5" fill="' + QUADRO + '"/>' +
      '<rect x="13" y="37" width="21" height="10" rx="5" fill="' + QUADRO_CLARO + '"/>' +
      '<rect x="86" y="37" width="21" height="10" rx="5" fill="' + QUADRO_CLARO + '"/>';
  }

  function retrato(av) {
    av = av || AV_PADRAO;
    return svg(
      '<rect x="0" y="0" width="120" height="120" fill="#eef2f9"/>' +
      (av.cadeirante ? retratoCadeira() : '') +
      /* ombros */
      '<path d="M18,120 Q18,86 60,86 Q102,86 102,120 Z" fill="' + av.camisa + '"/>' +
      /* pescoço */
      '<rect x="52" y="66" width="16" height="20" fill="' + av.pele + '"/>' +
      /* cabeça */
      '<circle cx="60" cy="52" r="26" fill="' + av.pele + '"/>' +
      /* cabelo */
      (av.cabeloLongo ? retratoMechas(av.cabelo) : '') +
      '<path d="M34,50 a 26,26 0 0 1 52,0 z" fill="' + av.cabelo + '"/>' +
      '<path d="M34,50 Q34,30 46,26 Q38,38 38,52 Z" fill="' + av.cabelo + '"/>' +
      '<path d="M86,50 Q86,30 74,26 Q82,38 82,52 Z" fill="' + av.cabelo + '"/>' +
      /* olhos */
      '<circle cx="51" cy="53" r="2.6" fill="' + COR.linha + '"/>' +
      '<circle cx="69" cy="53" r="2.6" fill="' + COR.linha + '"/>' +
      /* sorriso */
      '<path d="M52,63 Q60,69 68,63" fill="none" stroke="' + COR.linha + '" ' +
        'stroke-width="2" stroke-linecap="round"/>' +
      (av.piercing ? retratoPiercing() : ''),
      120, 120
    );
  }

  /* Mechas compridas, caindo até a altura dos ombros. */
  function retratoMechas(cabelo) {
    return '' +
      '<path d="M34,44 q -7,26 -4,46 q 6,3 11,0 q -2,-20 2,-44 z" fill="' + cabelo + '"/>' +
      '<path d="M86,44 q 7,26 4,46 q -6,3 -11,0 q 2,-20 -2,-44 z" fill="' + cabelo + '"/>';
  }

  /* O piercing, no único rosto desenhado do jogo. São dois, os dois sobre a
     vertical do rosto, onde a pele é contínua.

     A altura da argola de septo é o ponto delicado do retrato. O sorriso
     começa em y=63 e a borda do traço sobe até y=62; uma argola baixa
     encosta nele, e as duas formas viram uma peça só — um sorriso com um
     aro claro dentro, que foi o que a primeira versão desenhou. Por isso a
     argola fica alta, na faixa dos olhos (y=53), com pele lisa abaixo dela
     até o sorriso.

     O segundo vai abaixo do lábio, no queixo. Um brinco de sobrancelha
     cairia dentro do cabelo — o semicírculo desce até y=50 —, e um ponto
     claro no meio do cabelo não lê como piercing: lê como falha de desenho. */
  function retratoPiercing() {
    return '' +
      '<path d="M56,55 a 4,4 0 0 0 8,0" fill="none" stroke="' + COR.metal + '" ' +
        'stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle cx="60" cy="72" r="2" fill="' + COR.metal + '" ' +
        'stroke="' + COR.metalEsc + '" stroke-width="1.2"/>';
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
          protagonista(0, 0, {
            bracoDir: 74,
            bracoEsq: -8,
            extra:
              '<circle cx="7" cy="-64" r="7" fill="' + COR.papel + '" stroke="' + COR.predioDet + '" stroke-width="1.6"/>' +
              '<text x="7" y="-60.6" font-family="' + FONTE + '" font-size="7.5" font-weight="700" ' +
                'fill="' + COR.predioDet + '" text-anchor="middle">40</text>'
          }, av) +
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
   * A JUÍZA DO TRE — o julgamento da candidatura
   * ---------------------------------------------------------------------
   * Desenhada em perfil, de frente para a mesa, porque é o perfil que torna a
   * cadeira de rodas imediatamente legível — e a cadeira é parte de quem ela
   * é, não um detalhe a esconder atrás de uma bancada.
   *
   * A toga e o jabot seguem o mesmo traço das outras figuras (RNF-05): se ela
   * fosse desenhada num registro gráfico diferente do resto do jogo, a
   * autoridade da cena viraria um corpo estranho.
   * ------------------------------------------------------------------ */
  var JUIZA = {
    pele:   '#5f3b23',
    cabelo: '#161616',
    toga:   '#232a3d',
    togaEsc:'#1a2030',
    jabot:  '#fbf9f2',
    madeira:'#8a6a3a',
    madeiraEsc:'#6d5230'
  };

  /* ---------------------------------------------------------------------
   * A CADEIRA DE RODAS — desenhada em duas partes
   * ---------------------------------------------------------------------
   * A parte de trás é desenhada ANTES da juíza e a da frente DEPOIS. Sem essa
   * separação, ou a roda cobre o colo dela, ou o assento some atrás do corpo:
   * nos dois casos a cadeira deixa de ser legível como cadeira, que é
   * exatamente o que a cena não pode perder.
   * ------------------------------------------------------------------ */
  var ARO = '#2b3648', QUADRO = '#44536b', QUADRO_CLARO = '#5b6b85';

  /* Roda principal, em perfil. (0,0) é o centro da roda. */
  function rodaPrincipal(cx, cy) {
    var raios = '';
    for (var i = 0; i < 8; i++) {
      var ang = (Math.PI * 2 / 8) * i;
      raios += '<line x1="' + (Math.cos(ang) * 7).toFixed(1) + '" y1="' +
                        (Math.sin(ang) * 7).toFixed(1) + '" x2="' +
                        (Math.cos(ang) * 40).toFixed(1) + '" y2="' +
                        (Math.sin(ang) * 40).toFixed(1) + '"/>';
    }
    return '' +
      '<g transform="translate(' + cx + ',' + cy + ')">' +
        '<g stroke="' + QUADRO_CLARO + '" stroke-width="2">' + raios + '</g>' +
        '<circle r="48" fill="none" stroke="' + ARO + '" stroke-width="6"/>' +
        '<circle r="41" fill="none" stroke="' + QUADRO_CLARO + '" stroke-width="2"/>' +
        '<circle r="7" fill="' + ARO + '"/>' +
        '<circle r="3" fill="' + QUADRO_CLARO + '"/>' +
      '</g>';
  }

  /* O que fica atrás da juíza: encosto, apoio de braço e roda do lado oposto. */
  function cadeiraAtras() {
    return '' +
      /* roda do lado oposto, esmaecida pela distância */
      '<circle cx="16" cy="-48" r="48" fill="none" stroke="' + ARO + '" ' +
        'stroke-width="6" opacity=".25"/>' +
      /* encosto */
      '<rect x="-46" y="-152" width="10" height="64" rx="4" fill="' + QUADRO + '"/>' +
      /* apoio de braço, atrás do braço dela */
      '<rect x="-38" y="-132" width="64" height="7" rx="3" fill="' + QUADRO_CLARO + '"/>' +
      '<rect x="-38" y="-132" width="7" height="40" rx="3" fill="' + QUADRO + '"/>' +
      /* tubo traseiro */
      '<line x1="-36" y1="-92" x2="-4" y2="-48" stroke="' + QUADRO + '" ' +
        'stroke-width="7" stroke-linecap="round"/>';
  }

  /* O que fica à frente: assento, quadro dianteiro, apoio de pé e rodízio. */
  function cadeiraFrente() {
    return '' +
      /* assento — logo abaixo do colo da toga, que o cobre por cima */
      '<rect x="-42" y="-88" width="84" height="9" rx="4" fill="' + QUADRO_CLARO + '"/>' +
      /* quadro dianteiro */
      '<line x1="32" y1="-84" x2="72" y2="-26" stroke="' + QUADRO + '" ' +
        'stroke-width="7" stroke-linecap="round"/>' +
      /* apoio de pé */
      '<line x1="34" y1="-84" x2="68" y2="-22" stroke="' + QUADRO + '" ' +
        'stroke-width="6" stroke-linecap="round"/>' +
      '<rect x="50" y="-20" width="44" height="8" rx="4" fill="' + QUADRO + '"/>' +
      /* rodízio dianteiro */
      '<circle cx="74" cy="-13" r="13" fill="none" stroke="' + ARO + '" stroke-width="5"/>' +
      '<circle cx="74" cy="-13" r="3" fill="' + ARO + '"/>' +
      /* roda principal */
      rodaPrincipal(0, -48);
  }

  /* ---------------------------------------------------------------------
   * A CADEIRA DE RODAS VISTA DE FRENTE — a do protagonista cadeirante
   * ---------------------------------------------------------------------
   * A juíza é desenhada em perfil porque é o perfil que torna a cadeira
   * legível. O protagonista, ao contrário, encara o jogador em todas as
   * cenas — ele precisa reconhecer-se de frente. Aqui a cadeira é partida
   * nas mesmas duas camadas: o que fica atrás do corpo (encosto, alças de
   * condução e rodas grandes) e o que fica à frente (assento, coxas, canelas,
   * apoio de pés e rodízios).
   *
   * O corpo entre as duas camadas é o MESMO da função `pessoa`: mesmo tronco,
   * mesmos braços, mesma cabeça. As pernas foram trocadas por um assento, e
   * só. Sem isso, o broche, a camiseta e o santinho que as cenas penduram no
   * tronco cairiam no vazio sobre um avatar cadeirante.
   *
   * O raio da roda (22) sai do lugar onde a figura é ancorada: o centro dela
   * fica em y=-22, de modo que a roda toque o chão exatamente em (0,0) — o
   * mesmo ponto em que os pés de quem está de pé tocam. É isso que permite
   * trocar um avatar pelo outro sem tocar em nenhuma cena.
   *
   * A cadeira da juíza e esta compartilham o aro, o quadro e as cores
   * (ARO / QUADRO / QUADRO_CLARO): são o mesmo objeto, visto de ângulos
   * diferentes — que é o que RNF-05 pede.
   * ------------------------------------------------------------------ */

  /* Atrás do corpo: encosto, alças e as duas rodas grandes. */
  function cadeiraFrontalAtras() {
    var roda = function (cx) {
      return '' +
        '<g transform="translate(' + cx + ',-22)">' +
          /* de frente a roda é o aro, o aro de impulso e o cubo — não há
             raios: um raio visto de frente é um ponto, e desenhá-los daria
             ao aro um aspecto de teia que a vista frontal não tem. */
          '<circle r="22" fill="none" stroke="' + ARO + '" stroke-width="5"/>' +
          '<circle r="17" fill="none" stroke="' + QUADRO_CLARO + '" stroke-width="1.5"/>' +
          '<circle r="3.4" fill="' + ARO + '"/>' +
        '</g>';
    };
    return '' +
      '<rect x="-22" y="-96" width="44" height="60" rx="7" fill="' + QUADRO + '"/>' +
      '<rect x="-31" y="-108" width="9" height="17" rx="4.5" fill="' + QUADRO_CLARO + '"/>' +
      '<rect x="22"  y="-108" width="9" height="17" rx="4.5" fill="' + QUADRO_CLARO + '"/>' +
      roda(-36) + roda(36);
  }

  /* À frente do corpo: o quadro, o assento, as pernas sentadas e o que toca
     o chão. A ordem de desenho é a profundidade: o tubo do quadro, a borda
     do assento, as canelas, as coxas por cima delas, o apoio de pés, os
     sapatos sobre o apoio e, por último, os rodízios. */
  function cadeiraFrontalFrente(calca) {
    return '' +
      '<line x1="-19" y1="-36" x2="-25" y2="-16" stroke="' + QUADRO + '" ' +
        'stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="19"  y1="-36" x2="25"  y2="-16" stroke="' + QUADRO + '" ' +
        'stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="-23" y="-26" width="46" height="7" rx="3" fill="' + QUADRO_CLARO + '"/>' +
      '<rect x="-15" y="-33" width="11" height="26" rx="5" fill="' + calca + '"/>' +
      '<rect x="4"   y="-33" width="11" height="26" rx="5" fill="' + calca + '"/>' +
      '<rect x="-20" y="-40" width="40" height="17" rx="7" fill="' + calca + '"/>' +
      '<rect x="-21" y="-10" width="42" height="7" rx="3" fill="' + QUADRO + '"/>' +
      '<rect x="-18" y="-16" width="15" height="9" rx="3.5" fill="' + COR.linha + '"/>' +
      '<rect x="3"   y="-16" width="15" height="9" rx="3.5" fill="' + COR.linha + '"/>' +
      '<circle cx="-27" cy="-7" r="7" fill="none" stroke="' + ARO + '" stroke-width="4"/>' +
      '<circle cx="27"  cy="-7" r="7" fill="none" stroke="' + ARO + '" stroke-width="4"/>';
  }

  /* A juíza sentada, em perfil, voltada para a direita.
     O ponto (0,0) é o chão, sob o centro da roda principal: é ele que permite
     empilhar as três camadas — cadeira de trás, juíza, cadeira da frente —
     sem que nenhuma precise saber onde as outras foram parar. */
  function juizaSentada() {
    return '' +
      /* canela e sapato, saindo de sob a toga */
      '<rect x="48" y="-90" width="18" height="64" rx="9" fill="' + JUIZA.togaEsc + '"/>' +
      '<rect x="52" y="-30" width="34" height="14" rx="6" fill="' + COR.linha + '"/>' +

      /* tronco e colo da toga */
      '<rect x="-12" y="-176" width="44" height="70" rx="15" fill="' + JUIZA.toga + '"/>' +
      '<rect x="-16" y="-112" width="80" height="30" rx="13" fill="' + JUIZA.toga + '"/>' +
      /* pregas */
      '<path d="M 0,-170 L 2,-116" stroke="' + JUIZA.togaEsc + '" stroke-width="2.4" opacity=".65"/>' +
      '<path d="M 14,-172 L 16,-118" stroke="' + JUIZA.togaEsc + '" stroke-width="2.4" opacity=".65"/>' +
      '<path d="M -6,-104 L 50,-100" stroke="' + JUIZA.togaEsc + '" stroke-width="2.2" opacity=".5"/>' +
      /* jabot */
      '<path d="M 2,-178 L 12,-158 L 22,-178 Z" fill="' + JUIZA.jabot + '"/>' +

      /* braço apoiado, com a mão sobre a pasta */
      '<line x1="20" y1="-166" x2="48" y2="-130" stroke="' + JUIZA.toga + '" ' +
        'stroke-width="14" stroke-linecap="round"/>' +
      '<circle cx="52" cy="-126" r="7.5" fill="' + JUIZA.pele + '"/>' +
      '<g transform="rotate(-9 66 -120)">' +
        '<rect x="44" y="-130" width="48" height="17" rx="3" fill="' + COR.papel + '" ' +
          'stroke="' + COR.papelEsc + '" stroke-width="1.4"/>' +
        '<rect x="50" y="-125" width="30" height="2.6" rx="1.3" fill="' + COR.papelEsc + '"/>' +
        '<rect x="50" y="-119" width="22" height="2.6" rx="1.3" fill="' + COR.papelEsc + '"/>' +
      '</g>' +

      /* pescoço e cabeça */
      '<rect x="6" y="-190" width="15" height="18" fill="' + JUIZA.pele + '"/>' +
      '<circle cx="12" cy="-208" r="21" fill="' + JUIZA.pele + '"/>' +

      /* Cabelo: um semicírculo de raio 22 assentado sobre o alto da cabeça,
         com a corda em y=-211. Um raio ligeiramente maior que o da cabeça dá
         o volume, e a corda reta é a linha do cabelo — o rosto começa abaixo
         dela. As feições ficam TODAS abaixo de -211: foi por colocá-las acima
         que a primeira versão saiu com uma faixa escura atravessando os olhos. */
      '<path d="M -10,-211 a 22,22 0 0 1 44,0 z" fill="' + JUIZA.cabelo + '"/>' +

      /* orelha e brinco */
      '<circle cx="-2" cy="-204" r="4.4" fill="' + JUIZA.pele + '"/>' +
      '<circle cx="-2" cy="-195" r="2.6" fill="' + COR.marca + '"/>' +

      /* olho, nariz e boca, de perfil */
      '<circle cx="24" cy="-205" r="2.5" fill="' + COR.linha + '"/>' +
      '<path d="M 31,-206 q 3.5,1.5 3,4" stroke="' + COR.linha + '" stroke-width="1.6" ' +
        'fill="none" stroke-linecap="round"/>' +
      '<path d="M 25,-195 q 5,1 8,-1" stroke="' + COR.linha + '" stroke-width="1.8" ' +
        'fill="none" stroke-linecap="round"/>';
  }

  /* Balança da Justiça, para o emblema da parede. */
  function balanca(cx, cy, escala) {
    escala = escala || 1;
    return '' +
      '<g transform="translate(' + cx + ',' + cy + ') scale(' + escala + ')" ' +
         'stroke="' + COR.marca + '" stroke-width="3.4" fill="none" stroke-linecap="round">' +
        '<line x1="0" y1="-34" x2="0" y2="30"/>' +
        '<line x1="-26" y1="-24" x2="26" y2="-24"/>' +
        '<path d="M -34,-10 a 9,9 0 0 0 16,0"/>' +
        '<path d="M 18,-10 a 9,9 0 0 0 16,0"/>' +
        '<line x1="-26" y1="-24" x2="-26" y2="-10"/>' +
        '<line x1="26" y1="-24" x2="26" y2="-10"/>' +
        '<line x1="-15" y1="30" x2="15" y2="30"/>' +
      '</g>';
  }

  /* A cena do julgamento, inteira.
     O enquadramento é fechado de propósito: a juíza ocupa a metade esquerda
     do quadro, e não um canto dele. Uma figura pequena ao lado de uma sala
     vazia sugeriria que ela é um detalhe da cena — e é o contrário. */
  function cenaJuiza() {
    var AUMENTO = 1.30;
    var CHAO = 344;

    return svg(
      /* parede e piso da sala de audiência */
      '<rect x="0" y="0" width="640" height="316" fill="#dfe7f2"/>' +
      '<rect x="286" y="0" width="354" height="316" fill="#cfdaea"/>' +
      '<rect x="0" y="316" width="640" height="44" fill="#c4ccda"/>' +
      '<rect x="0" y="311" width="640" height="5" fill="#aab4c6"/>' +

      /* estante ao fundo, dando profundidade sem disputar atenção */
      '<g opacity=".3">' +
        '<rect x="300" y="204" width="330" height="10" rx="3" fill="' + COR.predioDet + '"/>' +
        '<rect x="300" y="244" width="330" height="10" rx="3" fill="' + COR.predioDet + '"/>' +
        '<rect x="314" y="188" width="15" height="16" fill="' + COR.predioEsc + '"/>' +
        '<rect x="336" y="182" width="13" height="22" fill="' + COR.predioEsc + '"/>' +
        '<rect x="356" y="190" width="17" height="14" fill="' + COR.predioEsc + '"/>' +
        '<rect x="520" y="186" width="14" height="18" fill="' + COR.predioEsc + '"/>' +
        '<rect x="542" y="192" width="16" height="12" fill="' + COR.predioEsc + '"/>' +
      '</g>' +

      /* emblema e placa */
      '<circle cx="428" cy="86" r="46" fill="' + COR.papel + '" stroke="' + COR.predioDet + '" stroke-width="3"/>' +
      balanca(428, 86, 0.78) +
      '<rect x="324" y="146" width="208" height="29" rx="5" fill="' + COR.papel + '" ' +
        'stroke="' + COR.predioDet + '" stroke-width="2"/>' +
      '<text x="428" y="165" font-family="' + FONTE + '" font-size="12.5" font-weight="800" ' +
        'fill="' + COR.predioDet + '" text-anchor="middle" letter-spacing=".4">' +
        'TRIBUNAL REGIONAL ELEITORAL</text>' +

      /* a mesa de audiência, à direita */
      '<g transform="translate(346,296)">' +
        '<rect x="0" y="-24" width="216" height="20" rx="4" fill="' + JUIZA.madeira + '"/>' +
        '<rect x="0" y="-4" width="216" height="9" rx="3" fill="' + JUIZA.madeiraEsc + '"/>' +
        '<rect x="17" y="5" width="15" height="47" rx="3" fill="' + JUIZA.madeiraEsc + '"/>' +
        '<rect x="184" y="5" width="15" height="47" rx="3" fill="' + JUIZA.madeiraEsc + '"/>' +
      '</g>' +

      /* o processo sobre a mesa: é ele que ela acabou de ler */
      '<g transform="translate(392,262) rotate(-4)">' +
        '<rect x="0" y="0" width="88" height="17" rx="2" fill="' + COR.papel + '" ' +
          'stroke="' + COR.papelEsc + '" stroke-width="1.4"/>' +
        '<rect x="5" y="13" width="80" height="17" rx="2" fill="' + COR.papel + '" ' +
          'stroke="' + COR.papelEsc + '" stroke-width="1.4"/>' +
        '<rect x="12" y="6" width="48" height="3" rx="1.5" fill="' + COR.papelEsc + '"/>' +
      '</g>' +

      /* as três camadas: cadeira de trás, juíza, cadeira da frente */
      '<g transform="translate(104,' + CHAO + ') scale(' + AUMENTO + ')">' +
        cadeiraAtras() +
        juizaSentada() +
        cadeiraFrente() +
      '</g>',
      640, 360
    );
  }

  /* ---------------------------------------------------------------------
   * AS ABORDAGENS DO EVENTO — uma imagem, duas cenas
   * ---------------------------------------------------------------------
   * O evento de campanha não é uma circunstância: não há conduta a julgar, e
   * as duas abordagens são lícitas. Por isso a ilustração do evento faz outro
   * trabalho — ela não descreve o que aconteceu, e sim as DUAS conduções que o
   * jogador tem na frente, uma ao lado da outra, para que a escolha seja feita
   * sobre o que se vê e não só sobre o que se lê.
   *
   * Cada painel leva o número da opção, e são os mesmos números das teclas e
   * dos botões logo abaixo: 1 é a primeira abordagem, 2 é a segunda. A ordem
   * dos painéis é a ordem do vetor `abordagens`, em dados/cenas.js.
   *
   * O protagonista é desenhado pelo mesmo `protagonista` das cenas, com o
   * avatar escolhido — a cadeira de rodas inclusive. É por isso que o painel
   * do salão o mostra falando de pé, no chão, e não em cima de uma cadeira:
   * subir na cadeira é o COMO da fala, e desenhá-lo assim deixaria de fora a
   * cadeira de quem joga sentado. O que a opção cobra — falar sem papel na
   * mão, para a sala inteira — é o que o painel mostra.
   * ------------------------------------------------------------------ */

  var PAINEL = { largura: 306, vao: 28 };

  /* O salão da associação de moradores: parede, janela e piso. É o MESMO nos
     dois painéis da reunião — o salão não muda, muda o que se faz dentro. */
  function salaoDaAssociacao() {
    return '' +
      '<rect x="0" y="0" width="306" height="252" fill="#e3e9f2"/>' +
      '<rect x="0" y="248" width="306" height="6" fill="#aab4c6"/>' +
      '<rect x="0" y="254" width="306" height="106" fill="#ccd5e3"/>' +
      '<rect x="24" y="56" width="72" height="58" rx="4" fill="' + COR.vidro + '" ' +
        'stroke="' + COR.predioDet + '" stroke-width="2.5"/>' +
      '<line x1="60" y1="56" x2="60" y2="114" stroke="' + COR.predioDet + '" stroke-width="2.5"/>' +
      '<line x1="24" y1="85" x2="96" y2="85" stroke="' + COR.predioDet + '" stroke-width="2.5"/>';
  }

  /* Quem está sentado na plateia, visto de costas: por cima do encosto da
     cadeira aparecem a cabeça, o cabelo e os ombros — que é o que o jogador
     veria se estivesse atrás da sala. (x, y) é a base da cadeira no piso.
     Com `vazio`, desenha só a cadeira: o salão tem quarenta, e nem todas
     estão ocupadas. */
  function sentadoDeCostas(x, y, o) {
    o = o || {};
    var s      = o.escala === undefined ? 1 : o.escala;
    var pele   = o.pele   || COR.pele[1];
    var cabelo = o.cabelo || COR.cabelo[0];
    var camisa = o.camisa || COR.camisa[0];
    return '' +
      '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
        '<ellipse cx="0" cy="1" rx="20" ry="4" fill="rgba(20,28,44,.10)"/>' +
        (o.vazio ? '' :
          '<circle cx="0" cy="-62" r="10.5" fill="' + pele + '"/>' +
          '<path d="M -10.5,-64 a 10.5,10.5 0 0 1 21,0 z" fill="' + cabelo + '"/>' +
          '<rect x="-15" y="-56" width="30" height="22" rx="8" fill="' + camisa + '"/>') +
        /* o encosto da cadeira de plástico, à frente de quem está sentado */
        '<rect x="-17" y="-40" width="34" height="32" rx="5" fill="' + COR.papel + '" ' +
          'stroke="' + COR.papelEsc + '" stroke-width="1.6"/>' +
        '<rect x="-17" y="-14" width="34" height="6" rx="3" fill="' + COR.papelEsc + '"/>' +
        '<rect x="-15" y="-8" width="5" height="10" rx="2" fill="' + COR.predioEsc + '"/>' +
        '<rect x="10"  y="-8" width="5" height="10" rx="2" fill="' + COR.predioEsc + '"/>' +
      '</g>';
  }

  /* Três marcas de fala, neutras — as mesmas da circunstância da abordagem. */
  function marcasDeFala(x, y) {
    return '' +
      '<g stroke="' + COR.predioDet + '" stroke-width="3" stroke-linecap="round" opacity=".85">' +
        '<line x1="' + x + '" y1="' + y + '" x2="' + (x + 12) + '" y2="' + y + '"/>' +
        '<line x1="' + x + '" y1="' + (y + 12) + '" x2="' + (x + 18) + '" y2="' + (y + 12) + '"/>' +
        '<line x1="' + x + '" y1="' + (y + 24) + '" x2="' + (x + 10) + '" y2="' + (y + 24) + '"/>' +
      '</g>';
  }

  /* 1 — Subir na cadeira e falar de cabeça: o candidato de frente para a
     sala, os braços abertos, sem nada na mão. */
  function salaoDaReuniao(av) {
    return '' +
      salaoDaAssociacao() +
      /* o ventilador de teto, que no texto não dá conta */
      '<g stroke="' + COR.predioEsc + '" stroke-width="3" stroke-linecap="round">' +
        '<line x1="150" y1="36" x2="150" y2="20"/>' +
        '<line x1="150" y1="36" x2="164" y2="44"/>' +
        '<line x1="150" y1="36" x2="136" y2="44"/>' +
      '</g>' +
      '<circle cx="150" cy="36" r="15" fill="none" stroke="' + COR.predioEsc + '" stroke-width="2.5"/>' +
      '<circle cx="150" cy="36" r="3.5" fill="' + COR.predioEsc + '"/>' +
      /* o cartaz da candidatura, na parede */
      '<rect x="204" y="62" width="76" height="54" rx="3" fill="' + COR.papel + '" ' +
        'stroke="' + COR.papelEsc + '" stroke-width="2"/>' +
      '<rect x="212" y="70" width="28" height="28" rx="14" fill="' + COR.predioEsc + '"/>' +
      '<rect x="246" y="74" width="26" height="3.5" rx="1.75" fill="' + COR.papelEsc + '"/>' +
      '<rect x="246" y="83" width="18" height="3.5" rx="1.75" fill="' + COR.papelEsc + '"/>' +
      '<rect x="212" y="104" width="60" height="3.5" rx="1.75" fill="' + COR.papelEsc + '"/>' +
      /* A plateia, de costas, com uma cadeira vazia no meio. As duas filas são
         desenhadas em volta do candidato, e não antes dele: quem está na fila
         da frente está mais perto de quem olha, e tem de cobrir a cadeira de
         rodas de quem fala lá no fundo — a mesma ordem de profundidade que
         qualquer cena do jogo segue. */
      sentadoDeCostas(28, 312, { escala: 0.78, vazio: true }) +
      sentadoDeCostas(278, 312, { escala: 0.78, pele: COR.pele[0],
        cabelo: COR.cabelo[5], camisa: COR.camisa[2] }) +
      /* o candidato, de frente para a sala, de cabeça e sem papel na mão */
      protagonista(153, 300, { escala: 0.98, bracoEsq: 116, bracoDir: -116 }, av) +
      sentadoDeCostas(52, 356, { escala: 1.04, pele: COR.pele[3],
        cabelo: COR.cabelo[1], camisa: COR.camisa[4] }) +
      sentadoDeCostas(254, 354, { escala: 1.0, pele: COR.pele[1],
        cabelo: COR.cabelo[2], camisa: COR.camisa[5] }) +
      marcasDeFala(196, 155);
  }

  /* O mapa de ruas do bairro, aberto no peito — a peça que a opção 2 põe na
     mão do candidato. Desenhado em coordenadas locais de quem o segura.

     A largura (72) é menor que o vão entre as duas mãos de quem o segura a
     38°: se o mapa fosse mais largo, as mãos sumiriam atrás dele, e o
     candidato ficaria com um cartaz no lugar do peito. */
  function mapaDasRuas() {
    return '' +
      '<g transform="rotate(-3)">' +
        '<rect x="-36" y="-88" width="72" height="52" rx="3" fill="' + COR.papel + '" ' +
          'stroke="' + COR.papelEsc + '" stroke-width="2"/>' +
        '<g stroke="' + COR.predioEsc + '" stroke-width="2.4">' +
          '<line x1="-27" y1="-88" x2="-27" y2="-36"/>' +
          '<line x1="-9"  y1="-88" x2="-9"  y2="-36"/>' +
          '<line x1="9"   y1="-88" x2="9"   y2="-36"/>' +
          '<line x1="27"  y1="-88" x2="27"  y2="-36"/>' +
          '<line x1="-36" y1="-72" x2="36" y2="-72"/>' +
          '<line x1="-36" y1="-54" x2="36" y2="-54"/>' +
          '<line x1="-36" y1="-44" x2="36" y2="-44"/>' +
        '</g>' +
        /* os quarteirões já marcados */
        '<rect x="-24" y="-70" width="12" height="10" fill="' + COR.camisa[3] + '" opacity=".6"/>' +
        '<rect x="-4"  y="-52" width="12" height="7"  fill="' + COR.camisa[3] + '" opacity=".6"/>' +
      '</g>';
  }

  /* 2 — Passar a lista e dividir as tarefas por quarteirão: o candidato com o
     mapa aberto, e a folha que já circula entre a plateia. */
  function listaDeRuas(av) {
    return '' +
      salaoDaAssociacao() +
      protagonista(126, 306, {
        escala: 0.96, bracoEsq: 38, bracoDir: -38, extra: mapaDasRuas()
      }, av) +
      /* a folha que circula de mão em mão, e quem está sentado na frente */
      '<g transform="translate(178,262) rotate(-16)">' +
        '<rect x="-14" y="-19" width="28" height="38" rx="2.5" fill="' + COR.papel + '" ' +
          'stroke="' + COR.papelEsc + '" stroke-width="1.6"/>' +
        '<g stroke="' + COR.papelEsc + '" stroke-width="2" stroke-linecap="round">' +
          '<line x1="-8" y1="-10" x2="8" y2="-10"/>' +
          '<line x1="-8" y1="-3"  x2="8" y2="-3"/>' +
          '<line x1="-8" y1="4"   x2="4" y2="4"/>' +
          '<line x1="-8" y1="11"  x2="6" y2="11"/>' +
        '</g>' +
      '</g>' +
      sentadoDeCostas(24, 352, { escala: 0.96, vazio: true }) +
      sentadoDeCostas(218, 356, { escala: 1.02, pele: COR.pele[4],
        cabelo: COR.cabelo[3], camisa: COR.camisa[0] }) +
      sentadoDeCostas(286, 344, { escala: 0.86, pele: COR.pele[2],
        cabelo: COR.cabelo[4], camisa: COR.camisa[1] });
  }

  /* Uma barraca da feira: toldo listrado, balcão e os caixotes de fruta.
     (x, y) é o pé esquerdo da barraca no chão. */
  function barracaDaFeira(x, y, escala) {
    var s = escala === undefined ? 1 : escala;
    return '' +
      '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
        '<ellipse cx="46" cy="3" rx="52" ry="7" fill="rgba(20,28,44,.12)"/>' +
        '<rect x="3" y="-104" width="5" height="104" rx="2.5" fill="' + COR.predioDet + '"/>' +
        '<rect x="84" y="-104" width="5" height="104" rx="2.5" fill="' + COR.predioDet + '"/>' +
        /* o toldo, listrado */
        '<rect x="0" y="-106" width="92" height="24" rx="3" fill="' + COR.papel + '"/>' +
        '<rect x="0" y="-106" width="16" height="24" fill="' + COR.camisa[4] + '"/>' +
        '<rect x="31" y="-106" width="16" height="24" fill="' + COR.camisa[4] + '"/>' +
        '<rect x="62" y="-106" width="16" height="24" fill="' + COR.camisa[4] + '"/>' +
        '<rect x="0" y="-82" width="92" height="5" fill="' + COR.papelEsc + '"/>' +
        /* o balcão */
        '<rect x="-3" y="-54" width="98" height="12" rx="3" fill="' + COR.caixa + '"/>' +
        '<rect x="-3" y="-42" width="98" height="7" rx="2" fill="' + COR.caixaEsc + '"/>' +
        '<rect x="6"  y="-35" width="8" height="35" rx="2" fill="' + COR.caixaEsc + '"/>' +
        '<rect x="81" y="-35" width="8" height="35" rx="2" fill="' + COR.caixaEsc + '"/>' +
        /* a fruta, nos caixotes */
        '<circle cx="16" cy="-63" r="7" fill="' + COR.camisa[3] + '"/>' +
        '<circle cx="32" cy="-63" r="7" fill="' + COR.camisa[1] + '"/>' +
        '<circle cx="24" cy="-75" r="7" fill="' + COR.camisa[3] + '"/>' +
        '<circle cx="60" cy="-63" r="7" fill="' + COR.camisa[4] + '"/>' +
        '<circle cx="76" cy="-63" r="7" fill="' + COR.camisa[1] + '"/>' +
        '<circle cx="68" cy="-75" r="7" fill="' + COR.camisa[4] + '"/>' +
      '</g>';
  }

  /* 3 — Ir para a feira às cinco da manhã e fazer corpo a corpo: o sol ainda
     baixo, as barracas armadas e o aperto de mão. */
  function feiraDeMadrugada(av) {
    return '' +
      '<rect x="0" y="0" width="306" height="250" fill="' + COR.ceuAlto + '"/>' +
      /* o sol ainda baixo, entre as duas barracas */
      '<circle cx="196" cy="200" r="27" fill="' + COR.caixa + '" opacity=".4"/>' +
      '<rect x="0" y="250" width="306" height="110" fill="' + COR.chao + '"/>' +
      '<rect x="0" y="246" width="306" height="5" fill="' + COR.chaoEsc + '"/>' +
      barracaDaFeira(8, 268, 0.92) +
      barracaDaFeira(252, 260, 0.58) +
      /* o feirante, de avental, do outro lado do aperto de mão */
      pessoa(150, 308, {
        escala: 0.94,
        pele: COR.pele[2],
        cabelo: COR.cabelo[1],
        camisa: COR.camisa[5],
        bracoDir: -72,
        extra:
          '<rect x="-14" y="-72" width="28" height="38" rx="4" fill="' + COR.papel + '" ' +
            'opacity=".92"/>'
      }) +
      /* o candidato, que chegou às cinco da manhã */
      protagonista(232, 314, { escala: 0.98, bracoEsq: 72 }, av);
  }

  /* 4 — Cruzar os números da pesquisa interna: a mesa da coordenação, os
     papéis abertos e quem aponta para eles. */
  function mesaDaCoordenacao(av) {
    return '' +
      '<rect x="0" y="0" width="306" height="244" fill="#e3e9f2"/>' +
      '<rect x="0" y="240" width="306" height="6" fill="#aab4c6"/>' +
      '<rect x="0" y="246" width="306" height="114" fill="#ccd5e3"/>' +
      /* o mapa do bairro, pregado na parede */
      '<rect x="34" y="30" width="126" height="84" rx="3" fill="' + COR.papel + '" ' +
        'stroke="' + COR.predioDet + '" stroke-width="2"/>' +
      '<g stroke="' + COR.predioEsc + '" stroke-width="2.4">' +
        '<line x1="70" y1="30" x2="70" y2="114"/>' +
        '<line x1="106" y1="30" x2="106" y2="114"/>' +
        '<line x1="34" y1="58" x2="160" y2="58"/>' +
        '<line x1="34" y1="88" x2="160" y2="88"/>' +
      '</g>' +
      '<rect x="74" y="62" width="28" height="22" fill="' + COR.camisa[3] + '" opacity=".6"/>' +
      /* a coordenação, do outro lado da mesa */
      pessoa(222, 340, {
        escala: 0.94, pele: COR.pele[0], cabelo: COR.cabelo[4],
        camisa: COR.camisa[2], bracoEsq: 26
      }) +
      pessoa(276, 336, {
        escala: 0.92, pele: COR.pele[3], cabelo: COR.cabelo[0], camisa: COR.camisa[0]
      }) +
      /* O candidato, apontando para os números. O braço fica quase na
         horizontal de propósito: o tampo da mesa é desenhado depois dele, e
         um braço caído sumiria atrás do tampo — junto com o gesto que é o
         assunto do painel. */
      protagonista(64, 334, { escala: 0.98, bracoDir: -84, bracoEsq: 6 }, av) +
      /* a mesa */
      '<rect x="6" y="266" width="294" height="14" rx="4" fill="' + JUIZA.madeira + '"/>' +
      '<rect x="6" y="280" width="294" height="8" rx="3" fill="' + JUIZA.madeiraEsc + '"/>' +
      '<rect x="20"  y="288" width="15" height="56" rx="3" fill="' + JUIZA.madeiraEsc + '"/>' +
      '<rect x="272" y="288" width="15" height="56" rx="3" fill="' + JUIZA.madeiraEsc + '"/>' +
      /* Os papéis abertos sobre a mesa. Eles ficam no VÃO entre as três
         pessoas — sobre a mesa, um papel desenhado depois das figuras cobre
         quem estiver atrás dele, e o candidato sumiria atrás do mapa. */
      '<g transform="rotate(-4)">' +
        '<rect x="96" y="214" width="62" height="50" rx="2" fill="' + COR.papel + '" ' +
          'stroke="' + COR.papelEsc + '" stroke-width="1.6"/>' +
        '<g stroke="' + COR.predioEsc + '" stroke-width="2.2">' +
          '<line x1="110" y1="214" x2="110" y2="264"/>' +
          '<line x1="126" y1="214" x2="126" y2="264"/>' +
          '<line x1="142" y1="214" x2="142" y2="264"/>' +
          '<line x1="96" y1="238" x2="158" y2="238"/>' +
        '</g>' +
      '</g>' +
      /* a planilha, com as barras da pesquisa */
      '<g transform="rotate(3)">' +
        '<rect x="146" y="220" width="58" height="44" rx="2" fill="' + COR.papel + '" ' +
          'stroke="' + COR.papelEsc + '" stroke-width="1.6"/>' +
        '<rect x="154" y="242" width="9" height="14" fill="' + COR.marca + '" opacity=".7"/>' +
        '<rect x="167" y="234" width="9" height="22" fill="' + COR.marca + '" opacity=".7"/>' +
        '<rect x="180" y="246" width="9" height="10" fill="' + COR.marca + '" opacity=".7"/>' +
        '<line x1="152" y1="256" x2="196" y2="256" stroke="' + COR.predioEsc + '" stroke-width="2"/>' +
      '</g>';
  }

  var ABORDAGENS = {
    salao:    salaoDaReuniao,
    lista:    listaDeRuas,
    feira:    feiraDeMadrugada,
    planilha: mesaDaCoordenacao
  };

  /* Um painel: a cena, mais o número da opção. `destaque` é indefinido antes
     da escolha; depois dela, o painel escolhido ganha o contorno da marca e o
     outro recebe um véu — o jogador precisa saber em qual das duas cenas ele
     está, e o véu apaga a que ficou para trás. O número fica fora do véu: é
     ele que amarra a imagem ao botão. */
  function painelDoEvento(x, numero, conteudo, destaque) {
    var veu = (destaque === false)
      ? '<rect x="0" y="0" width="' + PAINEL.largura + '" height="360" ' +
        'fill="#eef2f9" opacity=".68"/>'
      : '';
    var contorno = (destaque === true)
      ? '<rect x="1.5" y="1.5" width="' + (PAINEL.largura - 3) + '" height="357" rx="8" ' +
        'fill="none" stroke="' + COR.marca + '" stroke-width="3"/>'
      : '';
    return '' +
      '<g transform="translate(' + x + ',0)">' +
        conteudo + veu + contorno +
        '<circle cx="27" cy="27" r="15" fill="' + COR.marca + '"/>' +
        '<text x="27" y="32.5" font-family="' + FONTE + '" font-size="15" ' +
          'font-weight="800" fill="#ffffff" text-anchor="middle">' + numero + '</text>' +
      '</g>';
  }

  /* ---------------------------------------------------------------------
   * A CAPA — o jogo inteiro numa imagem
   * ---------------------------------------------------------------------
   * A capa recebe quem chega e ainda não tem cena nenhuma para contar: ela
   * precisa resumir o jogo. Três coisas o resumem, e as três estão aqui — o
   * dia da eleição (a seção e a fila), a urna e a balança da Justiça. O
   * candidato NÃO está: quem chega ainda não escolheu retrato, e desenhar um
   * avatar antes da escolha seria dizer que já existe um personagem.
   * ------------------------------------------------------------------ */

  /* Um eleitor de costas, na fila. (x, y) é onde os pés tocam o chão. É a
     mesma figura de `pessoa` vista por trás — e de costas não há rosto: o
     cabelo cobre a cabeça inteira e o que aparece abaixo dele é a nuca. */
  function eleitorDeCostas(x, y, o) {
    o = o || {};
    var s      = o.escala === undefined ? 1 : o.escala;
    var pele   = o.pele   || COR.pele[1];
    var cabelo = o.cabelo || COR.cabelo[0];
    var camisa = o.camisa || COR.camisa[0];
    var calca  = o.calca  || COR.calca;
    return '' +
      '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
        '<ellipse cx="0" cy="3" rx="21" ry="5" fill="rgba(20,28,44,.10)"/>' +
        '<rect x="-13" y="-38" width="11" height="30" rx="5" fill="' + calca + '"/>' +
        '<rect x="2"   y="-38" width="11" height="30" rx="5" fill="' + calca + '"/>' +
        '<rect x="-16" y="-11" width="15" height="9" rx="3.5" fill="' + COR.linha + '"/>' +
        '<rect x="1"   y="-11" width="15" height="9" rx="3.5" fill="' + COR.linha + '"/>' +
        '<rect x="-16" y="-87" width="32" height="53" rx="11" fill="' + camisa + '"/>' +
        '<rect x="-24" y="-80" width="10" height="45" rx="5" fill="' + camisa + '"/>' +
        '<rect x="14"  y="-80" width="10" height="45" rx="5" fill="' + camisa + '"/>' +
        '<circle cx="-19" cy="-37" r="5.5" fill="' + pele + '"/>' +
        '<circle cx="19"  cy="-37" r="5.5" fill="' + pele + '"/>' +
        /* a nuca, e a cabeça inteira tomada pelo cabelo */
        '<rect x="-4.5" y="-92" width="9" height="9" fill="' + pele + '"/>' +
        '<circle cx="0" cy="-101" r="13.5" fill="' + cabelo + '"/>' +
      '</g>';
  }

  /* A urna, com a cédula já enfiada na fenda. (x, y) é a base no chão. */
  function urnaDaSecao(x, y, escala) {
    var s = escala === undefined ? 1 : escala;
    return '' +
      '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
        '<ellipse cx="0" cy="3" rx="52" ry="8" fill="rgba(20,28,44,.14)"/>' +
        '<rect x="-44" y="-74" width="88" height="74" rx="6" fill="' + COR.papel + '" ' +
          'stroke="' + COR.predioDet + '" stroke-width="2.5"/>' +
        /* o painel da frente */
        '<rect x="-34" y="-64" width="68" height="28" rx="4" fill="' + COR.vidro + '"/>' +
        '<rect x="-29" y="-58" width="26" height="4" rx="2" fill="' + COR.papelEsc + '"/>' +
        '<rect x="-29" y="-49" width="38" height="4" rx="2" fill="' + COR.papelEsc + '"/>' +
        '<text x="0" y="-16" font-family="' + FONTE + '" font-size="11" font-weight="800" ' +
          'fill="' + COR.predioDet + '" text-anchor="middle" letter-spacing=".8">URNA</text>' +
        /* a fenda, e a cédula entrando por ela */
        '<rect x="-26" y="-80" width="52" height="8" rx="4" fill="' + COR.predioEsc + '"/>' +
        '<g transform="translate(0,-84) rotate(-12)">' +
          '<rect x="-15" y="-36" width="30" height="40" rx="2" fill="' + COR.papel + '" ' +
            'stroke="' + COR.papelEsc + '" stroke-width="1.6"/>' +
          '<rect x="-9" y="-28" width="18" height="3.5" rx="1.75" fill="' + COR.papelEsc + '"/>' +
          '<rect x="-9" y="-20" width="12" height="3.5" rx="1.75" fill="' + COR.papelEsc + '"/>' +
        '</g>' +
      '</g>';
  }

  function cenaDaCapa() {
    return svg(
      base(COR.ceuAlto, COR.chao, 268) +
      quarteirao(268) +
      /* a seção eleitoral, à esquerda */
      predioSecao(30, 268, { escala: 0.72 }) +
      /* o medalhão da Justiça, à direita, com a balança do emblema */
      '<circle cx="486" cy="132" r="84" fill="' + COR.papel + '" ' +
        'stroke="' + COR.predioDet + '" stroke-width="3.5"/>' +
      '<circle cx="486" cy="132" r="74" fill="none" stroke="' + COR.papelEsc + '" stroke-width="1.5"/>' +
      balanca(486, 136, 1.9) +
      /* a fila, de costas, a caminho da seção */
      eleitorDeCostas(140, 322, { escala: 0.82, pele: COR.pele[3],
        cabelo: COR.cabelo[1], camisa: COR.camisa[4] }) +
      eleitorDeCostas(205, 340, { escala: 0.94, pele: COR.pele[0],
        cabelo: COR.cabelo[5], camisa: COR.camisa[2] }) +
      /* a urna, no primeiro plano — é ela que recolhe a decisão do dia */
      urnaDaSecao(320, 348, 1.14),
      640, 360
    );
  }

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

  /* A imagem do evento: as DUAS abordagens, lado a lado, na ordem em que
     estão em dados/cenas.js. `escolhida` é o índice da que o jogador tomou,
     ou nulo enquanto ele não escolheu — é ele que acende um painel e apaga o
     outro depois da escolha.

     A imagem é feita para dois painéis. Um evento com outro número de
     abordagens não caberia nela, e é melhor não desenhar nada do que
     desenhar a imagem de outro evento. */
  window.ilustracaoDoEvento = function (evento, avatar, escolhida) {
    var abs = (evento && evento.abordagens) || [];
    if (abs.length !== 2) return SVG_VAZIO;
    var desenha = [
      ABORDAGENS[abs[0].cena],
      ABORDAGENS[abs[1].cena]
    ];
    if (typeof desenha[0] !== 'function' ||
        typeof desenha[1] !== 'function') return SVG_VAZIO;

    var marcada = function (i) {
      return (escolhida === null || escolhida === undefined) ? undefined : escolhida === i;
    };

    return svg(
      /* o vão entre os painéis: sem ele, as duas cenas viram uma só */
      '<rect x="0" y="0" width="640" height="360" fill="' + COR.predioEsc + '"/>' +
      painelDoEvento(0, 1, desenha[0](avatar), marcada(0)) +
      painelDoEvento(PAINEL.largura + PAINEL.vao, 2, desenha[1](avatar), marcada(1)),
      640, 360
    );
  };

  /* A cena do julgamento não depende do avatar: quem está na cadeira é a
     juíza, e não o jogador. */
  window.ilustracaoDaJuiza = function () { return cenaJuiza(); };

  /* A capa também não: ela é anterior a qualquer escolha. */
  window.ilustracaoDaCapa = function () { return cenaDaCapa(); };

  /* Exposto para o harness de teste conferir que toda chave usada em
     dados/cenas.js tem desenho correspondente. */
  window.CHAVES_ILUSTRACAO = Object.keys(CENAS);
  window.CHAVES_ABORDAGEM = Object.keys(ABORDAGENS);
})();
