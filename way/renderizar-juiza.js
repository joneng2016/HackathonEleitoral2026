/* =============================================================================
 * RENDERIZADOR DA JUÍZA — meio de conferência visual, não parte do jogo
 * -----------------------------------------------------------------------------
 * Carrega js/ilustracoes.js fora do navegador, pede o SVG da juíza e grava o
 * arquivo em ./way/ para ser convertido em PNG por rsvg-convert.
 *
 *   node way/renderizar-juiza.js            → way/juiza.svg
 *   rsvg-convert -z 2 way/juiza.svg -o way/juiza.png
 * ========================================================================== */

'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var RAIZ = path.join(__dirname, '..');

/* Recorte opcional: `node way/renderizar-juiza.js x,y,w,h [arquivo]` grava um
   SVG fechado nesse pedaço do quadro, para conferir de perto a cabeça, o
   martelo ou a mesa sem depender de ampliar a cena inteira. */
var recorte = (process.argv[2] || '').split(',').map(Number);
var destino = process.argv[3] || 'juiza';

var janela = {};
var contexto = {
  window: janela,
  document: { createElement: function () { return {}; } },
  console: console
};

vm.createContext(contexto);
vm.runInContext(
  fs.readFileSync(path.join(RAIZ, 'js', 'ilustracoes.js'), 'utf8'),
  contexto,
  { filename: 'js/ilustracoes.js' }
);

var svg = janela.ilustracaoDaJuiza();

if (recorte.length === 4 && recorte.every(function (n) { return isFinite(n); })) {
  svg = svg
    .replace('viewBox="0 0 640 360"', 'viewBox="' + recorte.join(' ') + '"')
    .replace('width="640"', 'width="' + recorte[2] + '"')
    .replace('height="360"', 'height="' + recorte[3] + '"');
}

/* O atributo de acessibilidade atrapalha nada no rsvg; o que falta para o
   arquivo ser um SVG autônomo válido é só o cabeçalho XML. */
fs.writeFileSync(
  path.join(__dirname, destino + '.svg'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' + svg + '\n'
);

/* Rede de segurança: um path com NaN ou undefined sai do rsvg como um buraco
   silencioso, e é justamente o tipo de erro que passa despercebido. */
var sujeira = svg.match(/NaN|undefined|null/g);
console.log('way/' + destino + '.svg — ' + svg.length + ' bytes' +
  (sujeira ? ' — ATENÇÃO: ' + sujeira.join(', ') : ' — sem NaN/undefined/null'));
