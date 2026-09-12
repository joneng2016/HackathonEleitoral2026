/* =============================================================================
 * MEDIDOR DA TELA DA JUÍZA — meio de conferência, não parte do jogo
 * -----------------------------------------------------------------------------
 * Responde a uma pergunta que a aritmética do CSS não responde: "a juíza sai
 * pequena na tela, e quanto exatamente?". O cálculo de `fr`, `gap`, `padding`
 * e `max-width` dá um número, mas o número que importa é o que o navegador
 * desenha — e é ele que se mede aqui.
 *
 * O que faz: lê o index.html, reescreve os caminhos relativos para ../ e
 * injeta um roteiro que dirige o jogo real até a tela do julgamento pelos
 * ganchos de window.JOGO. Grava essa cópia em ./way/medir-juiza.html e abre no
 * Chrome headless, que devolve o DOM já medido.
 *
 *   node way/medir-juiza.js [largura]     (padrão: 1280)
 * ========================================================================== */

'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');
var execFileSync = require('child_process').execFileSync;

var RAIZ = path.join(__dirname, '..');
var LARGURA = Number(process.argv[2]) || 1280;
var ALTURA = Number(process.argv[3]) || 900;

/* ---------------------------------------------------------------------------
 * O roteiro injetado: chega à juíza com a candidatura limpa e mede.
 * ------------------------------------------------------------------------ */
var ROTEIRO = [
'<script>',
'(function () {',
'  function uniao(a, b) {',
'    return {',
'      left: Math.min(a.left, b.left), top: Math.min(a.top, b.top),',
'      right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom)',
'    };',
'  }',
'  function caixa(r) {',
'    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };',
'  }',
'  function medir() {',
'    var J = window.JOGO;',
'    var fig = document.querySelector(".juiza__figura");',
'    var svg = fig && fig.querySelector("svg");',
'    var corpo = document.querySelector(".juiza__corpo");',
'    var painel = document.querySelector(".juiza");',
'    var linhas = [];',
'    function linha(nome, r) {',
'      linhas.push(nome + ": " + Math.round(r.width || (r.right - r.left)) +',
'        "x" + Math.round(r.height || (r.bottom - r.top)) +',
'        " em (" + Math.round(r.left) + "," + Math.round(r.top) + ")");',
'    }',
'    if (!fig || !svg) { document.title = "MEDIDA-ERRO"; return; }',
'    linha("palco", document.querySelector(".palco").getBoundingClientRect());',
'    linha("painel", painel.getBoundingClientRect());',
'    linha("figura", fig.getBoundingClientRect());',
'    linha("svg", svg.getBoundingClientRect());',
'    linha("coluna de texto", corpo.getBoundingClientRect());',
'    /* Onde cai o veredito: é o que a tela existe para dizer, e uma figura',
'       maior que o empurre para fora da primeira tela não é ganho. */',
'    var ver = document.querySelector(".juiza__veredito");',
'    if (ver) {',
'      var rv = ver.getBoundingClientRect();',
'      linhas.push("veredito: topo em y=" + Math.round(rv.top) +',
'        (rv.top > window.innerHeight ? " — ABAIXO DA DOBRA (" +',
'          Math.round(rv.top - window.innerHeight) + "px)" : " — visível"));',
'    }',
'    /* A juíza desenhada: o grupo do sujeito é o <g> escalado de maior área.',
'       Dentro dele, os TRÊS ÚLTIMOS filhos são a bancada, o processo e a',
'       tábua — que são a MESA, e não o tamanho dela. O contrato é o mesmo que',
'       a ilustração declara ("a bancada vem DEPOIS da figura"); se ele deixar',
'       de valer, a medição sai errada em silêncio, e por isso ela se confere',
'       antes de responder. */',
'    var grupos = svg.querySelectorAll("g[transform]");',
'    var sujeito = null, area = -1, i;',
'    for (i = 0; i < grupos.length; i++) {',
'      if (grupos[i].getAttribute("transform").indexOf("scale(") === -1) continue;',
'      var r = grupos[i].getBoundingClientRect();',
'      if (r.width * r.height > area) { area = r.width * r.height; sujeito = grupos[i]; }',
'    }',
'    if (sujeito) {',
'      var filhos = sujeito.children;',
'      var mesa = [filhos[filhos.length - 1], filhos[filhos.length - 2],',
'                  filhos[filhos.length - 3]];',
'      var mesaLimpa = mesa.every(function (e) {',
'        return e.tagName.toLowerCase() === "g";',
'      });',
'      linhas.push("filhos do sujeito: " + filhos.length +',
'        " · os 3 últimos são grupos: " + (mesaLimpa ? "sim" : "NÃO — medição inválida"));',
'      if (mesaLimpa) {',
'        var u = null;',
'        for (i = 0; i < filhos.length - 3; i++) {',
'          var rf = caixa(filhos[i].getBoundingClientRect());',
'          u = u ? uniao(u, rf) : rf;',
'        }',
'        if (u) {',
'          linha("a juíza desenhada", u);',
'          linhas.push("escala do sujeito: " +',
'            /scale\\(([^)]+)\\)/.exec(sujeito.getAttribute("transform"))[1]);',
'        }',
'      }',
'    }',
'    var pre = document.createElement("pre");',
'    pre.id = "medidas";',
'    pre.textContent = "###MEDIDA###\\n" + linhas.join("\\n") + "\\n###FIM###";',
'    document.body.appendChild(pre);',
'    document.title = "MEDIDA-PRONTA";',
'  }',
'  window.addEventListener("load", function () {',
'    var J = window.JOGO;',
'    if (!J) { document.title = "MEDIDA-SEM-JOGO"; return; }',
'    J.iniciar();',
'    J.escolherAvatar(window.AVATARES[0].id);',
'    J.escolherOrigem(window.ORIGENS[0].id);',
'    J.comecar();',
'    var ev = J.estado.evento;',
'    J.escolherAbordagem(ev.evento.abordagens[0].id);',
'    J.rolar(); J.revelar(); J.aoDia();',
'    var quantas = J.situacoesDaFase(0).length;',
'    for (var i = 0; i < quantas; i++) {',
'      var c = J.cenaAtual();',
'      var conforme = c.opcoes.filter(function (o) {',
'        return o.natureza === "conforme";',
'      })[0];',
'      J.decidir(conforme.id);',
'      J.avancar();',
'    }',
'    /* Duas passagens pelo event loop: uma para o layout assentar, outra para',
'       a transição de entrada terminar. Medir durante a animação devolveria a',
'       caixa deslocada por alguns pixels. */',
'    setTimeout(function () { setTimeout(medir, 400); }, 100);',
'  });',
'})();',
'<\/script>'
].join('\n');

/* ---------------------------------------------------------------------------
 * A cópia do index.html com os caminhos corrigidos e o roteiro no fim
 * ------------------------------------------------------------------------ */
var html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8')
  .replace(/(href|src)="(css|js|dados)\//g, '$1="../$2/')
  .replace('</body>', ROTEIRO + '\n</body>');

/* Variantes de layout, aplicadas por cima na cópia medida — para comparar
   desenhos de tela sem tocar no repositório. Comparar de memória não é
   comparar: o "antes" e o "depois" têm de sair da mesma régua.
     antes          o que a tela era antes desta rodada
     largura-total  a figura ocupando a largura do painel, texto abaixo */
var VARIANTES = {
  'antes':
    '.final--juiza{max-width:860px}' +
    '.juiza{grid-template-columns:minmax(0,1fr) minmax(0,1.15fr)}',
  'largura-total':
    '.final--juiza{max-width:var(--largura)}' +
    '.juiza{grid-template-columns:minmax(0,1fr)}' +
    '.juiza__corpo{max-width:760px;margin:0 auto}'
};
var variante = VARIANTES[process.argv[4]];
if (process.argv[4] && !variante) {
  console.log('variante desconhecida: ' + process.argv[4] +
    ' (use ' + Object.keys(VARIANTES).join(' ou ') + ')');
  process.exit(1);
}
if (variante) {
  html = html.replace('</head>', '<style>' + variante + '</style>\n</head>');
}

var alvo = path.join(__dirname, 'medir-juiza.html');
fs.writeFileSync(alvo, html);

/* ---------------------------------------------------------------------------
 * O Chrome headless
 * ------------------------------------------------------------------------ */
var CHROME = ['google-chrome-stable', 'chromium', 'chromium-browser', 'brave']
  .filter(function (nome) {
    try {
      execFileSync('sh', ['-c', 'command -v ' + nome], { stdio: 'pipe' });
      return true;
    } catch (e) { return false; }
  })[0];

if (!CHROME) {
  console.log('Nenhum navegador encontrado — a medição não pode ser feita.');
  process.exit(1);
}

var perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'medir-juiza-'));

var dom;
try {
  dom = execFileSync(CHROME, [
    '--headless',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + perfil,
    '--window-size=' + LARGURA + ',' + ALTURA,
    '--virtual-time-budget=6000',
    '--dump-dom',
    'file://' + alvo
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
} catch (e) {
  console.log('O navegador falhou: ' + e.message);
  process.exit(1);
}

/* O `--dump-dom` devolve o documento inteiro, e o roteiro injetado CONTÉM a
   marca, como texto do próprio <script>. Por isso a ÚLTIMA ocorrência: a
   primeira é o roteiro, a última é o que ele mediu. */
var achados = dom.match(/###MEDIDA###([\s\S]*?)###FIM###/g) || [];
var trecho = achados.length
  ? /###MEDIDA###([\s\S]*?)###FIM###/.exec(achados[achados.length - 1])
  : null;
console.log('janela: ' + LARGURA + 'x' + ALTURA + '  ·  ' + CHROME);
if (!trecho) {
  var titulo = /<title>([^<]*)<\/title>/.exec(dom);
  console.log('a tela não foi medida — título do documento: ' +
    (titulo ? titulo[1] : '?'));
  process.exit(1);
}
console.log(trecho[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim());

var foto = path.join(__dirname, 'juiza-tela.png');
execFileSync(CHROME, [
  '--headless', '--disable-gpu', '--no-first-run',
  '--user-data-dir=' + perfil,
  '--window-size=' + LARGURA + ',' + ALTURA,
  '--virtual-time-budget=6000',
  '--screenshot=' + foto,
  'file://' + alvo
], { stdio: 'ignore' });
console.log('captura: way/juiza-tela.png');
