/* =============================================================================
 * JOGAR O JULGAMENTO — meio de conferência, não parte do jogo
 * -----------------------------------------------------------------------------
 * A bateria do veredito (way/verificar-veredito.js) confere a REGRA. Esta
 * confere a TELA: dirige o jogo pelos ganchos de window.JOGO — do retrato à
 * juíza, circunstância por circunstância — e lê o HTML que cada desfecho
 * produziu, procurando o que o jogador veria se algo tivesse quebrado:
 * "undefined", "NaN", contagem que não bate com o veredito, regra ausente.
 *
 * Cada fase é jogada três vezes: só com condutas conformes, só com ilícitas, e
 * alternando. Não há navegador aqui — o DOM é um objeto que só guarda o
 * innerHTML escrito nele, e é por isso que dá para ler a tela depois.
 *
 *   node way/jogar-julgamento.js
 * ========================================================================== */

'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var RAIZ = path.join(__dirname, '..');

/* ---------------------------------------------------------------------------
 * O DOM que guarda o que foi escrito nele
 * ------------------------------------------------------------------------ */
var elementos = {};

function elemento(id) {
  if (elementos[id]) return elementos[id];
  var el = {
    id: id, innerHTML: '', textContent: '', hidden: false, style: {},
    setAttribute: function (nome, valor) { this[nome] = valor; },
    getAttribute: function (nome) { return this[nome]; },
    appendChild: function () {}, removeChild: function () {},
    addEventListener: function () {}, removeEventListener: function () {},
    focus: function () {}, blur: function () {}, remove: function () {},
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    classList: { add: function () {}, remove: function () {}, toggle: function () {} }
  };
  elementos[id] = el;
  return el;
}

var janela = {};
var documento = {
  readyState: 'complete',
  addEventListener: function () {},
  getElementById: function (id) { return elemento('#' + id); },
  querySelector: function (sel) { return elemento(sel); },
  querySelectorAll: function () { return []; },
  createElement: function () { return elemento('<' + Math.random() + '>'); },
  body: elemento('body'),
  documentElement: elemento('html')
};

var contexto = {
  window: janela,
  console: console,
  setTimeout: function () { return 0; },
  clearTimeout: function () {},
  requestAnimationFrame: function () { return 0; },
  cancelAnimationFrame: function () {},
  document: documento
};
janela.document = documento;
janela.scrollTo = function () {};
janela.matchMedia = function () {
  return { matches: false, addEventListener: function () {} };
};
janela.localStorage = { getItem: function () { return null; },
                        setItem: function () {}, removeItem: function () {} };
janela.addEventListener = function () {};

vm.createContext(contexto);

['dados/cenas.js', 'js/ilustracoes.js', 'js/ficha.js', 'js/app.js']
    .forEach(function (arquivo) {
  vm.runInContext(fs.readFileSync(path.join(RAIZ, arquivo), 'utf8'), contexto,
    { filename: arquivo });
});

/* ---------------------------------------------------------------------------
 * A bateria
 * ------------------------------------------------------------------------ */
var JOGO = janela.JOGO;
var AVATARES = janela.AVATARES;
var ORIGENS = janela.ORIGENS;
var FASES = janela.FASES;
var JUIZA = janela.JUIZA;

var falhas = [];
var conferencias = 0;

function conferir(condicao, mensagem) {
  conferencias++;
  if (!condicao && falhas.length < 20) falhas.push(mensagem);
  return condicao;
}

function palco() { return elemento('#palco').innerHTML; }

/* Toda tela passa por aqui: nenhuma pode sair com resto de JavaScript na
   frente do jogador. */
function conferirTela(onde) {
  var html = palco();
  conferir(html.indexOf('undefined') === -1, onde + ': a tela mostra "undefined".');
  conferir(html.indexOf('NaN') === -1, onde + ': a tela mostra "NaN".');
  conferir(html.indexOf('[object Object]') === -1,
    onde + ': a tela mostra "[object Object]".');
  conferir(html.length > 400, onde + ': a tela saiu quase vazia (' +
    html.length + ' bytes).');
  return html;
}

/* Uma escolha de cada tipo, na circunstância corrente. */
function opcao(natureza) {
  var cena = JOGO.cenaAtual();
  if (!cena) return null;
  var lista = cena.opcoes.filter(function (o) {
    return natureza === 'ilicito' ? o.natureza !== 'conforme' : o.natureza === 'conforme';
  });
  return lista.length ? lista[0].id : null;
}

/* Uma carreira nova, até a primeira circunstância da fase 1. A escolha da
   história leva direto ao dia da eleição: não há evento de abertura nem dado
   entre a criação do personagem e a primeira conduta. */
function comecarCarreira() {
  JOGO.iniciar();
  JOGO.abrirCriacao();                    /* a capa sai para a criação */
  JOGO.escolherAvatar(AVATARES[0].id);
  JOGO.escolherOrigem(ORIGENS[0].id);
  conferir(JOGO.estado.tela === 'cena',
    'Depois da história o jogo foi para "' + JOGO.estado.tela +
    '", e devia ir direto para a circunstância.');
}

/* Decide as circunstâncias da fase corrente, uma a uma, e para na juíza. */
function decidirCircunstancias(plano) {
  var quantas = JOGO.situacoesDaFase(JOGO.estado.fase).length;
  for (var i = 0; i < quantas; i++) {
    var id = opcao(plano(i));
    conferir(id !== null, 'Não há conduta ' + plano(i) + ' na circunstância ' +
      (i + 1) + ' da fase ' + (JOGO.estado.fase + 1) + '.');
    if (id === null) return;
    JOGO.decidir(id);
    JOGO.avancar();
  }
}

/* Chega à juíza da fase pedida com o plano pedido. A fase 2 exige atravessar
   a fase 1 — e ela é atravessada sempre com condutas conformes, para que a
   única coisa sob teste seja a candidatura da fase 2. */
function chegarAoJulgamento(indice, plano) {
  comecarCarreira();
  decidirCircunstancias(indice === 0 ? plano.f : function () { return 'conforme'; });

  if (indice === 1) {
    JOGO.aposJulgamento();                /* deferida: vai à urna */
    JOGO.seguir();
    JOGO.proximaFase();
    decidirCircunstancias(plano.f);
  }

  return conferirTela('Fase ' + (indice + 1) + ' · ' + plano.nome);
}

/* --- Os planos de escolha, por fase ---------------------------------------
   Cada plano declara quantos ilícitos produz. O limite é um, e por isso os
   planos que importam são três: nenhum ilícito, exatamente um — o último que
   ainda concorre —, e dois, o primeiro que não concorre. */
var PLANOS = [
  [
    { nome: 'tudo conforme', n: 0, f: function () { return 'conforme'; } },
    { nome: 'um ilícito',    n: 1, f: function (i) { return i === 0 ? 'ilicito' : 'conforme'; } },
    { nome: 'dois ilícitos', n: 2, f: function (i) { return i < 2 ? 'ilicito' : 'conforme'; } },
    { nome: 'tudo ilícito',  n: 3, f: function () { return 'ilicito'; } }
  ],
  [
    { nome: 'tudo conforme', n: 0, f: function () { return 'conforme'; } },
    { nome: 'um ilícito',    n: 1, f: function (i) { return i === 0 ? 'ilicito' : 'conforme'; } },
    { nome: 'dois ilícitos', n: 2, f: function (i) { return i < 2 ? 'ilicito' : 'conforme'; } },
    { nome: 'tudo ilícito',  n: 3, f: function () { return 'ilicito'; } }
  ]
];

FASES.forEach(function (fase, indice) {
  PLANOS[indice].forEach(function (plano) {
    var html = chegarAoJulgamento(indice, plano);
    if (html === null) return;

    var n = JOGO.ilicitoDaFase(indice);
    var l = JOGO.licitoDaFase(indice);
    var indeferida = JOGO.indeferida(indice);
    var onde = 'Fase ' + (indice + 1) + ' · ' + plano.nome;

    conferir(n === plano.n,
      onde + ': a fase somou ' + n + ' ilícitos, e o plano previa ' +
      plano.n + '.');

    /* O VEREDITO NA TELA, pela palavra que o jogador lê. */
    conferir(html.indexOf('data-veredito="' + (indeferida ? 'indeferida' : 'deferida') + '"') !== -1,
      onde + ': o veredito na tela não é o que a regra manda (' +
      (indeferida ? 'indeferida' : 'deferida') + ').');
    conferir(html.indexOf(indeferida ? 'Candidatura indeferida' : 'Candidatura deferida') !== -1,
      onde + ': o rótulo do veredito não aparece na tela.');
    conferir(html.indexOf(indeferida ? 'data-veredito="deferida"' : 'data-veredito="indeferida"') === -1,
      onde + ': a tela traz os dois vereditos ao mesmo tempo.');
    /* A ADVERTÊNCIA NÃO É UM TERCEIRO VEREDITO. Ela é o registro de um ilícito
       numa candidatura que passou, e a tela não pode apresentá-la como um
       resultado à parte. */
    conferir(html.indexOf('data-veredito="advertencia"') === -1,
      onde + ': a tela inventou um terceiro veredito para a advertência.');

    /* A CONTA À VISTA: o número de ilícitos, o total de circunstâncias e o
       limite, que é o que o jogador precisa conferir. */
    var atosFase = JOGO.situacoesDaFase(indice).length;
    conferir(html.indexOf('>' + n + '<span class="juiza__conta-rotulo">' +
      (n === 1 ? ' ilícito' : ' ilícitos') + '</span>') !== -1,
      onde + ': a tela não mostra os ' + n + ' ilícitos.');
    conferir(html.indexOf('>' + atosFase +
      '<span class="juiza__conta-rotulo"> circunstâncias</span>') !== -1,
      onde + ': a tela não mostra as ' + atosFase + ' circunstâncias.');
    conferir(html.indexOf('o limite é 1 ilícito') !== -1,
      onde + ': a tela não escreve o limite de um ilícito.');
    conferir(html.indexOf(JUIZA.regra.replace(/&/g, '&amp;')) !== -1,
      onde + ': a regra do veredito não está escrita na tela.');
    /* Os atos lícitos não decidem mais nada: se a tela voltasse a exibi-los
       como parte da conta, estaria ensinando a regra antiga. */
    conferir(html.indexOf('atos lícitos') === -1,
      onde + ': a tela voltou a contar os atos lícitos — a regra é o número ' +
      'de ilícitos.');
    conferir(html.indexOf('a maioria') === -1,
      onde + ': a tela ainda fala em maioria — a regra é o número de ilícitos.');

    /* O TEXTO ESCOLHIDO, e o que ele diz. */
    var bloco = n === 0 ? JUIZA.semIlicito
              : (indeferida ? JUIZA.doisOuMaisIlicitos : JUIZA.umIlicito);
    conferir(html.indexOf(bloco.titulo.replace(/&/g, '&amp;')) !== -1,
      onde + ': a tela não traz o título do veredito previsto.');

    /* A TELA SEGUINTE: deferida vai à urna, indeferida encerra a candidatura. */
    JOGO.aposJulgamento();
    var depois = conferirTela(onde + ' · a tela seguinte');
    if (indeferida) {
      conferir(JOGO.estado.tela === (indice === 0 ? 'derrota' : 'final'),
        onde + ': depois do indeferimento o jogo foi para "' +
        JOGO.estado.tela + '".');
      if (indice === 0) {
        conferir(depois.indexOf('candidatura indeferida') !== -1,
          onde + ': a tela de derrota não diz que o registro foi indeferido.');
      } else {
        conferir(depois.indexOf('Candidatura indeferida para deputado') !== -1,
          onde + ': o encerramento não diz que a candidatura foi indeferida.');
      }
    } else {
      conferir(JOGO.estado.tela === 'juiza' && JOGO.estado.etapaJuiza === 'apuracao',
        onde + ': a candidatura deferida não seguiu para a apuração.');
      JOGO.seguir();
      var eleito = conferirTela(onde + ' · a tela de candidatura deferida');
      conferir(JOGO.estado.tela === (indice === 0 ? 'eleito' : 'final'),
        onde + ': a candidatura deferida não seguiu de fase.');
      if (indice === 0) {
        conferir(eleito.indexOf('candidatura deferida') !== -1,
          onde + ': a tela de vitória não diz que o registro foi deferido.');
      }
    }
  });
});

/* --- O relatório ---------------------------------------------------------- */
if (falhas.length) {
  console.log('DIVERGÊNCIAS:');
  falhas.forEach(function (f) { console.log('  · ' + f); });
  process.exitCode = 1;
} else {
  console.log('divergências: nenhuma');
}
console.log('conferências: ' + conferencias);
var partidas = PLANOS.reduce(function (soma, lista) { return soma + lista.length; }, 0);
console.log('partidas jogadas até a juíza: ' + partidas);
