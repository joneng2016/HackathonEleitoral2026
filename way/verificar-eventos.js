/* =============================================================================
 * VERIFICAÇÃO VISUAL DO EVENTO DE CAMPANHA
 * -----------------------------------------------------------------------------
 * Escreve, para cada evento de dados/cenas.js, a imagem das duas abordagens
 * como a tela do evento a mostra:
 *
 *   previa-evento-<id>.html   os dois painéis, no tamanho real da tela do
 *                             evento (724px de conteúdo dentro do cartão de
 *                             780px, menos o padding) e ampliados, com e sem
 *                             escolha feita;
 *   previa-evento-<id>-cadeirante.html
 *                             o mesmo, com o avatar de cadeira de rodas — é o
 *                             avatar que mais fácil ficaria de fora de uma
 *                             cena de campanha desenhada à mão.
 * ========================================================================== */
'use strict';

var fs = require('fs');
var vm = require('vm');
var path = require('path');

var RAIZ = path.resolve(__dirname, '..');

function carregarContexto() {
  var ctx = { window: {} };
  vm.createContext(ctx);
  ['dados/cenas.js', 'js/ilustracoes.js'].forEach(function (rel) {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, rel), 'utf8'), ctx, { filename: rel });
  });
  return ctx.window;
}

var ESTILO = '' +
  'body{font:13px "Segoe UI",sans-serif;background:#fff;color:#222;margin:0;padding:14px}' +
  'h2{font-size:14px;margin:0 0 12px;border-bottom:1px solid #ccc;padding-bottom:5px}' +
  'h3{font-size:13px;margin:16px 0 6px;color:#444}' +
  '.item{margin:0 0 14px;border:1px solid #ddd;padding:8px;background:#fafafa}' +
  'figcaption{font-size:11px;color:#555;margin-bottom:6px}' +
  /* o cartão .evento tem 780px, padding 28px de cada lado: 724px de conteúdo */
  '.real{width:724px;line-height:0}' +
  '.ampliado{width:1200px;line-height:0;margin-top:10px}' +
  'svg{display:block;width:100%;height:auto}';

function html(titulo, corpo) {
  return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">' +
    '<style>' + ESTILO + '</style></head><body>' +
    '<h2>' + titulo + '</h2>' + corpo + '</body></html>';
}

function bloco(w, ev, av, rotulo, escolhida, comAmpliado) {
  return '<figure class="item"><figcaption>' + rotulo + '</figcaption>' +
    '<div class="real">' + w.ilustracaoDoEvento(ev, av, escolhida) + '</div>' +
    (comAmpliado
      ? '<div class="ampliado">' + w.ilustracaoDoEvento(ev, av, escolhida) + '</div>'
      : '') +
    '</figure>';
}

var w = carregarContexto();

var comum = w.AVATARES.filter(function (a) { return !a.cadeirante; })[0];
var cadeirante = w.AVATARES.filter(function (a) { return a.cadeirante; })[0];

w.EVENTOS.forEach(function (ev) {
  var escolhas = ['sem escolha', 'escolheu a 1', 'escolheu a 2'];

  /* avatar comum: as três fases da tela, no tamanho real */
  fs.writeFileSync(path.join(__dirname, 'previa-evento-' + ev.id + '.html'),
    html(ev.id + ' — ' + ev.titulo + ' · avatar ' + comum.nome,
      escolhas.map(function (rot, i) {
        return bloco(w, ev, comum, rot, i === 0 ? null : i - 1, i === 0);
      }).join('')), 'utf8');

  /* avatar cadeirante: sem escolha e com a escolha feita */
  fs.writeFileSync(path.join(__dirname, 'previa-evento-' + ev.id + '-cadeirante.html'),
    html(ev.id + ' — ' + ev.titulo + ' · avatar ' + cadeirante.nome,
      bloco(w, ev, cadeirante, 'sem escolha', null, true) +
      bloco(w, ev, cadeirante, 'escolheu a 2', 1, false)), 'utf8');

  console.log('gerado: way/previa-evento-' + ev.id + '.html');
  console.log('gerado: way/previa-evento-' + ev.id + '-cadeirante.html');
});

console.log('eventos: ' + w.EVENTOS.length +
  ' · chaves de abordagem: ' + w.CHAVES_ABORDAGEM.join(', '));

/* A conferência que importa: toda abordagem declarada em dados/cenas.js tem
   desenho, e nenhum desenho ficou órfão. */
var usadas = [];
w.EVENTOS.forEach(function (ev) {
  ev.abordagens.forEach(function (ab) { usadas.push(ab.cena); });
});
var orfas = w.CHAVES_ABORDAGEM.filter(function (k) { return usadas.indexOf(k) === -1; });
var faltando = usadas.filter(function (k) { return w.CHAVES_ABORDAGEM.indexOf(k) === -1; });
console.log('abordagens desenhadas e usadas: ' + usadas.length);
console.log('desenhos órfãos: ' + (orfas.length ? orfas.join(', ') : 'nenhum'));
console.log('abordagens sem desenho: ' + (faltando.length ? faltando.join(', ') : 'nenhuma'));
