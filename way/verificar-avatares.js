/* =============================================================================
 * VERIFICAÇÃO VISUAL DOS AVATARES
 * -----------------------------------------------------------------------------
 * Carrega dados/cenas.js e js/ilustracoes.js no mesmo contexto em que o
 * navegador os carrega, e escreve páginas de prévia:
 *
 *   previa-retratos.html        os quatro retratos, no tamanho em que o jogo
 *                               os exibe (96px, o max-width de
 *                               .avatar__retrato, com recorte circular) e
 *                               ampliados;
 *   previa-cenas-<id>.html      as seis cenas de cada avatar marcado como
 *                               cadeirante ou com piercing.
 *
 * Cada página é capturada em separado pelo Chrome headless: uma página única
 * com tudo dentro sairia alta demais para a captura ser legível.
 *
 * O objetivo é um só: ver se o desenho novo é legível no tamanho real. Uma
 * cadeira de rodas que só se reconhece ampliada não serve.
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
    vm.runInContext(fs.readFileSync(path.join(RAIZ, rel), 'utf8'), ctx, {
      filename: rel
    });
  });
  return ctx.window;
}

var ESTILO = '' +
  'body{font:13px "Segoe UI",sans-serif;background:#fff;color:#222;margin:0;padding:14px}' +
  'h2{font-size:14px;margin:0 0 10px;border-bottom:1px solid #ccc;padding-bottom:5px}' +
  '.grade{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start}' +
  '.item{margin:0;border:1px solid #ddd;padding:8px;background:#fafafa}' +
  'figcaption{font-size:11px;color:#555;margin-bottom:6px}' +
  /* o recorte circular e o max-width de .avatar__retrato, do estilo.css */
  '.retratoReal{width:96px;border-radius:50%;overflow:hidden;line-height:0}' +
  '.retratoGrande{width:480px;line-height:0;margin-top:8px}' +
  /* a largura aproximada da coluna .cena__figura */
  '.cena{width:440px;line-height:0}' +
  'svg{display:block;width:100%;height:auto}';

function html(titulo, corpo) {
  return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">' +
    '<style>' + ESTILO + '</style></head><body>' +
    '<h2>' + titulo + '</h2>' + corpo +
    '</body></html>';
}

function retratos(w) {
  return '<div class="grade">' + w.AVATARES.map(function (av) {
    return '<figure class="item"><figcaption>' + av.id + ' · ' + av.nome +
      ' — 96px (jogo)</figcaption>' +
      '<div class="retratoReal">' + w.retratoDoAvatar(av) + '</div>' +
      '<div class="retratoGrande">' + w.retratoDoAvatar(av) + '</div></figure>';
  }).join('') + '</div>';
}

function cenas(w, av) {
  return '<div class="grade">' + w.CHAVES_ILUSTRACAO.map(function (k) {
    return '<figure class="item"><figcaption>' + av.nome + ' · ' + k +
      '</figcaption><div class="cena">' + w.ilustracaoDaCena(k, av) +
      '</div></figure>';
  }).join('') + '</div>';
}

/* Uma aproximação do rosto do protagonista, cinco vezes maior, para conferir
   o que não se lê no tamanho da cena: onde exatamente caem a argola e o
   brinco, e se eles ficam sobre a pele ou sobre o cabelo. Em `broche` o
   protagonista está em (210, 316) com escala 1,16, e a cabeça dele fica em
   (210, 200) — é esse ponto que a ampliação põe no centro. */
function zoom(w, av, cena, cx, cy) {
  return '<div class="lupa">' + w.ilustracaoDaCena(cena, av) + '</div>' +
    '<style>.lupa{width:640px;height:360px;overflow:hidden;position:relative}' +
    '.lupa svg{position:absolute;left:0;top:0;width:640px;height:360px;' +
    'transform-origin:' + cx + 'px ' + cy + 'px;transform:scale(5)}' +
    '</style>';
}

function escrever(nome, conteudo) {
  var destino = path.join(__dirname, nome);
  fs.writeFileSync(destino, conteudo, 'utf8');
  console.log('gerado: way/' + nome);
}

var w = carregarContexto();

escrever('previa-retratos.html', html('Retratos — 96px e 300px', retratos(w)));

w.AVATARES.filter(function (av) {
  return av.cadeirante || av.piercing;
}).forEach(function (av) {
  escrever('previa-cenas-' + av.id + '.html',
    html('Cenas com ' + av.nome + ' (440px)', cenas(w, av)));

  escrever('previa-rosto-' + av.id + '.html',
    html('Rosto de ' + av.nome + ' na cena broche, 5x',
      zoom(w, av, 'broche', 210, 200)));

  /* O retrato sozinho, grande: é onde o piercing precisa ser legível. */
  escrever('previa-retrato-' + av.id + '.html',
    html('Retrato de ' + av.nome,
      '<div style="width:600px;line-height:0">' + w.retratoDoAvatar(av) + '</div>'));
});

console.log('avatares: ' + w.AVATARES.length +
  ' · cenas por avatar: ' + w.CHAVES_ILUSTRACAO.length);
