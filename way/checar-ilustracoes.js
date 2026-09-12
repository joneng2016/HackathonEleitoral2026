'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm');
var janela = {};
var ctx = { window: janela, document: { createElement: function () { return {}; } }, console: console };
vm.createContext(ctx);
['dados/cenas.js', 'js/ilustracoes.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
});
var av = janela.AVATARES[0];
var ruins = [];
janela.CHAVES_ILUSTRACAO.forEach(function (k) {
  var s = janela.ilustracaoDaCena(k, av);
  var ok = s.length > 400 && s.indexOf('NaN') < 0 && s.indexOf('undefined') < 0;
  if (!ok) ruins.push(k);
});
console.log('chaves de ilustração: ' + janela.CHAVES_ILUSTRACAO.join(', '));
console.log('desenhos ruins: ' + (ruins.join(', ') || 'nenhum'));
console.log('cena da juíza: ' + janela.ilustracaoDaJuiza().length + ' bytes');
janela.AVATARES.forEach(function (a) {
  if (janela.retratoDoAvatar(a).length < 400) console.log('retrato ruim: ' + JSON.stringify(a));
});
console.log('retratos conferidos: ' + janela.AVATARES.length);
