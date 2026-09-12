/* =============================================================================
 * A CAPA NO TEMA CLARO
 * -----------------------------------------------------------------------------
 * O CSS do jogo escolhe o tema por `prefers-color-scheme`, e o Chrome headless
 * desta máquina não tem como ser convencido a preferir o claro — o sistema
 * está no escuro, e não há flag que mude isso sem o DevTools. Então o tema
 * claro é montado à mão: este script copia o index.html e injeta, DEPOIS da
 * folha de estilo, as variáveis do `:root` claro sob o seletor `html:root`.
 *
 * `html:root` tem especificidade maior que o `:root` de dentro do
 * `@media (prefers-color-scheme: dark)` — a media query não muda a
 * especificidade —, e por vir depois ele vence. O resultado é o jogo inteiro
 * no tema claro, para a captura.
 *
 *   node way/capa-tema-claro.js
 *   chrome --headless --screenshot=capa-claro.png way/capa-tema-claro.html
 * ========================================================================== */
'use strict';

var fs = require('fs');
var path = require('path');

var RAIZ = path.resolve(__dirname, '..');

var html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8')
  /* os caminhos sobem um nível: a página vai morar em way/ */
  .replace(/(href|src)="(css|dados|js)\//g, '$1="../$2/');

var raizClaro = fs.readFileSync(path.join(RAIZ, 'css/estilo.css'), 'utf8')
  .match(/^:root \{[\s\S]*?^\}/m)[0]
  .replace(/^:root/, 'html:root');

var destino = path.join(__dirname, 'capa-tema-claro.html');
fs.writeFileSync(destino,
  html.replace('</head>', '<style>' + raizClaro + '</style></head>'), 'utf8');

console.log('gerado: way/capa-tema-claro.html (tema claro forçado)');
