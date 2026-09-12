/* =============================================================================
 * VERIFICADOR DO VEREDITO — meio de conferência, não parte do jogo
 * -----------------------------------------------------------------------------
 * O veredito é o NÚMERO DE ILÍCITOS: nenhum ou um, candidatura deferida — com
 * um, com advertência; dois ou mais, candidatura indeferida. Esta bateria
 * percorre TODAS as combinações de escolha das duas fases — 4^3 = 64 em cada
 * uma, 128 no total — e confere, combinação a combinação, que a decisão que o
 * jogo toma é a que a regra manda.
 *
 * Ela carrega dados/cenas.js, js/ficha.js e js/app.js na mesma ordem do
 * index.html, num contexto de node com um DOM de mentira: o app.js registra o
 * ouvinte de DOMContentLoaded e nada renderiza, de modo que a bateria roda
 * sobre a LÓGICA do jogo, e não sobre a tela dele. As escolhas são escritas
 * direto em JOGO.estado.escolhas, no mesmo formato que a função `decidir`
 * grava — é o contrato entre a decisão e o julgamento, e é ele que se testa.
 *
 *   node way/verificar-veredito.js
 * ========================================================================== */

'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var RAIZ = path.join(__dirname, '..');

/* ---------------------------------------------------------------------------
 * O DOM de mentira. Tudo devolve ausência, e nada lança: o app.js é escrito
 * com guardas (`if (!alvo) return;`), e é por causa delas que ele atravessa
 * um documento vazio sem quebrar.
 * ------------------------------------------------------------------------ */
function no() { return null; }
var elementoVazio = {
  style: {}, hidden: false, innerHTML: '', textContent: '',
  setAttribute: function () {}, getAttribute: no, appendChild: function () {},
  addEventListener: function () {}, focus: function () {}, remove: function () {}
};

var janela = {};
var contexto = {
  window: janela,
  console: console,
  setTimeout: function () { return 0; },
  clearTimeout: function () {},
  requestAnimationFrame: function () { return 0; },
  document: {
    /* `loading` de propósito: com ele o app.js apenas REGISTRA o ouvinte de
       DOMContentLoaded, e não tenta desenhar o jogo num documento vazio. */
    readyState: 'loading',
    addEventListener: function () {},
    getElementById: no,
    querySelector: no,
    querySelectorAll: function () { return []; },
    createElement: function () { return elementoVazio; },
    body: elementoVazio,
    documentElement: elementoVazio
  }
};
janela.document = contexto.document;
janela.scrollTo = function () {};
janela.matchMedia = function () {
  return { matches: false, addEventListener: function () {} };
};
janela.localStorage = {
  getItem: no, setItem: function () {}, removeItem: function () {}
};
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
var FASES = janela.FASES;
var JUIZA = janela.JUIZA;

/* O LIMITE do jogo: um ilícito. A bateria o declara em vez de o importar para
   que a conferência valha por si — se o app.js mudar de limite sem que a
   regra escrita mude, é aqui que a divergência aparece. */
var LIMITE_ILICITOS = 1;

var falhas = [];
var conferencias = 0;
var contaBlocos = { semIlicito: 0, umIlicito: 0, doisOuMaisIlicitos: 0 };
var contaVeredito = { deferida: 0, indeferida: 0 };

function conferir(condicao, mensagem) {
  conferencias++;
  if (!condicao && falhas.length < 20) falhas.push(mensagem);
  return condicao;
}

if (!JOGO) {
  console.log('js/app.js não expôs window.JOGO — a bateria não tem o que conferir.');
  process.exit(1);
}

/* --- 0. O jogo aceita os próprios dados? --------------------------------- */
/* A mesma conferência que o jogo faz antes de abrir — inclusive a que exige
   que `tolera` concorde com a maioria dos atos. Se ela reprovar, o jogo não
   abre na mão do jogador, e a bateria tem de reprovar junto. */
var problema = JOGO.conferirAmbiente();
conferir(problema === null, 'A conferência de ambiente do jogo reprovou: ' +
  String(problema).replace(/<[^>]*>/g, ''));

/* --- 1. O que os dados declaram sobre o veredito ------------------------- */
conferir(typeof JUIZA === 'object' && JUIZA !== null,
  'dados/cenas.js não define window.JUIZA.');
conferir(typeof JUIZA.regra === 'string' && JUIZA.regra.length > 0,
  'JUIZA.regra não está declarada: o jogador não tem como ler a regra.');

['semIlicito', 'umIlicito', 'doisOuMaisIlicitos'].forEach(function (chave) {
  var b = JUIZA[chave];
  conferir(!!b, 'JUIZA.' + chave + ' não existe.');
  if (!b) return;
  conferir(b.veredito === 'deferida' || b.veredito === 'indeferida',
    'JUIZA.' + chave + '.veredito é "' + b.veredito + '", e não um dos dois ' +
    'vereditos possíveis.');
  conferir(typeof b.rotulo === 'string' && typeof b.fala === 'string',
    'JUIZA.' + chave + ' não tem rótulo e fala.');
});

/* Regra de bolso dos dados: cada bloco anuncia no rótulo o veredito que
   declara. Um rótulo que dissesse "deferida" num bloco indeferido seria lido
   pelo jogador antes de qualquer conferência. */
conferir(JUIZA.semIlicito.rotulo === 'Candidatura deferida',
  'JUIZA.semIlicito.rotulo não é "Candidatura deferida".');
conferir(JUIZA.umIlicito.rotulo === 'Candidatura deferida',
  'JUIZA.umIlicito.rotulo não é "Candidatura deferida" — o registro com um ' +
  'ilícito continua sendo um registro deferido, ainda que advertido.');
conferir(JUIZA.doisOuMaisIlicitos.rotulo === 'Candidatura indeferida',
  'JUIZA.doisOuMaisIlicitos.rotulo não é "Candidatura indeferida".');

/* --- 2. As fases --------------------------------------------------------- */
conferir(Array.isArray(FASES) && FASES.length > 0,
  'dados/cenas.js não define window.FASES.');

FASES.forEach(function (fase, i) {
  var atos = JOGO.situacoesDaFase(i).length;
  conferir(atos > 0, 'A fase ' + (i + 1) + ' não tem circunstâncias.');
  /* A fase declara o mesmo limite que o jogo aplica. Um limite por fase não
     faria sentido com a regra nova — a conta é a mesma em qualquer cargo —, e
     por isso a declaração é conferida contra a constante. */
  conferir(fase.tolera === LIMITE_ILICITOS,
    'A fase ' + (i + 1) + ' declara tolerar ' + fase.tolera + ', e o limite ' +
    'do jogo é ' + LIMITE_ILICITOS + '.');
});

/* --- 3. Todas as combinações de escolha, nas duas fases ------------------ */
FASES.forEach(function (fase, i) {
  var situacoes = JOGO.situacoesDaFase(i);
  var opcoes = situacoes.map(function (c) { return c.opcoes; });
  var total = opcoes.reduce(function (acc, lista) { return acc * lista.length; }, 1);
  var escolhas = [];

  /* Enumera em base mista: um índice por circunstância, de 0 até o número de
     condutas dela menos um. */
  function combinar(posicao, indices) {
    if (posicao === situacoes.length) {
      JOGO.estado.escolhas = indices.map(function (k, s) {
        var o = opcoes[s][k];
        return {
          idCena: situacoes[s].id,
          idOpcao: o.id,
          natureza: o.natureza,
          ilicito: o.natureza !== 'conforme'
        };
      });
      julgar(i, situacoes, indices.map(function (k, s) { return opcoes[s][k]; }));
      return;
    }
    for (var k = 0; k < opcoes[posicao].length; k++) {
      combinar(posicao + 1, indices.concat([k]));
    }
  }

  conferir(opcoes.every(function (lista) { return lista.length > 0; }),
    'A fase ' + (i + 1) + ' tem circunstância sem condutas.');
  combinar(0, []);
  conferir(total > 0 && JOGO.estado.escolhas.length >= 0, '');

  function julgar(indiceFase, situacoesDaVez, escolhidas) {
    var atos = situacoesDaVez.length;
    var n = JOGO.ilicitoDaFase(indiceFase);
    var l = JOGO.licitoDaFase(indiceFase);
    var indeferida = JOGO.indeferida(indiceFase);
    var fase = FASES[indiceFase];

    var rotulo = escolhidas.map(function (o) { return o.natureza; }).join(',');

    conferir(n + l === atos,
      'Fase ' + (indiceFase + 1) + ' · ' + rotulo + ': ' + n + ' ilícitos e ' +
      l + ' lícitos não somam os ' + atos + ' atos.');
    conferir(n <= atos && l >= 0, 'Contagem impossível na fase ' + (indiceFase + 1) + '.');

    /* A REGRA. É esta linha que a bateria existe para conferir: indeferida
       quando os ilícitos PASSAM do limite. Com três circunstâncias por fase,
       passar do limite equivale a ter mais ilícitos que lícitos — as duas
       contas coincidem aqui, e é por isso que a bateria confere o LIMITE, e
       não a proporção: o limite é a regra, e a coincidência é do dado. */
    conferir(indeferida === (n > LIMITE_ILICITOS),
      'Fase ' + (indiceFase + 1) + ' · ' + rotulo + ': ' + n + ' ilícitos e ' +
      l + ' lícitos, e o jogo ' + (indeferida ? 'indeferiu' : 'deferiu') +
      ' — com o limite em ' + LIMITE_ILICITOS + ', o veredito era o outro.');

    /* A declaração da fase não pode discordar da contagem. */
    conferir(indeferida === (n > fase.tolera),
      'Fase ' + (indiceFase + 1) + ' · ' + rotulo + ': o veredito não bate com ' +
      'a tolerância declarada (' + fase.tolera + ').');

    /* O nome antigo continua respondendo pelo mesmo valor. */
    conferir(JOGO.impugnada(indiceFase) === indeferida,
      'JOGO.impugnada divergiu de JOGO.indeferida na fase ' + (indiceFase + 1) + '.');

    /* O estado do índice: três estados, e cada um no seu caso. */
    var estado = JOGO.situacaoDaFase(indiceFase);
    conferir(estado === (indeferida ? 'impugnacao' : (n > 0 ? 'advertencia' : 'limpo')),
      'Fase ' + (indiceFase + 1) + ' · ' + rotulo + ': o índice ficou em "' +
      estado + '".');

    /* O TEXTO ESCOLHIDO. A seleção é a mesma que a tela do julgamento faz. */
    var bloco = n === 0 ? 'semIlicito'
              : (indeferida ? 'doisOuMaisIlicitos' : 'umIlicito');
    var dados = JUIZA[bloco];
    conferir(!!dados && dados.veredito === (indeferida ? 'indeferida' : 'deferida'),
      'Fase ' + (indiceFase + 1) + ' · ' + rotulo + ': o bloco JUIZA.' + bloco +
      ' declara o veredito "' + (dados && dados.veredito) + '".');
    contaBlocos[bloco] = (contaBlocos[bloco] || 0) + 1;
    contaVeredito[indeferida ? 'indeferida' : 'deferida']++;
  }
});

JOGO.estado.escolhas = [];

/* --- 4. O relatório ------------------------------------------------------ */
if (falhas.length) {
  console.log('DIVERGÊNCIAS:');
  falhas.forEach(function (f) { console.log('  · ' + f); });
  process.exitCode = 1;
} else {
  console.log('divergências: nenhuma');
}
console.log('conferências: ' + conferencias);
console.log('combinações de escolha percorridas: ' +
  (contaVeredito.deferida + contaVeredito.indeferida) + ' (' +
  FASES.length + ' fases)');
console.log('vereditos: ' + contaVeredito.deferida + ' deferidas · ' +
  contaVeredito.indeferida + ' indeferidas');
console.log('textos: ' + contaBlocos.semIlicito + ' sem ilícito · ' +
  contaBlocos.umIlicito + ' com um ilícito · ' +
  contaBlocos.doisOuMaisIlicitos + ' com dois ou mais');
