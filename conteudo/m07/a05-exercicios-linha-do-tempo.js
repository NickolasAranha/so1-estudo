// Módulo 7, aula 5: como montar a linha do tempo, a convenção dos exercícios e os exercícios numéricos.
// Todos os gabaritos foram calculados à mão e conferidos por um simulador independente.
(function () {
// Linha do tempo (Gantt) em SVG. o.cpu: [[quem, ini, fim]] ('tc' = troca de contexto);
  // o.es: [[proc, ini, fim]] (E/S); o.procs: linhas exibidas; o.T: instantes marcados;
  // o.chegada: {proc: instante} (padrão: todos chegam em t=0). Antes da chegada a linha fica vazia.
  function gantt(o) {
    var es = o.es || [], T = o.T || [], chegada = o.chegada || {}, fim = 0;
    o.cpu.concat(es).forEach(function (s) { if (s[2] > fim) fim = s[2]; });
    T.forEach(function (t) { if (t + 2 > fim) fim = t + 2; });
    var W = 640, x0 = 46, x1 = W - 16, k = (x1 - x0) / fim, h = 22, gap = 8;
    var X = function (t) { return +(x0 + t * k).toFixed(1); };
    var nivelT = [];
    T.forEach(function (t, i) { nivelT.push(i > 0 && Math.abs(t - T[i - 1]) * k < 34 ? 1 - nivelT[i - 1] : 0); });
    var topo = T.length ? (nivelT.indexOf(1) >= 0 ? 36 : 24) : 8;
    var yL = function (i) { return topo + (h + gap) * i; };
    var out = [];
    var txt = function (x, y, s, extra) { out.push('<text x="' + x + '" y="' + y + '"' + (extra || '') + '>' + s + '</text>'); };
    var rect = function (a, b, y, estilo) { out.push('<rect x="' + X(a) + '" y="' + y + '" width="' + (X(b) - X(a)).toFixed(1) + '" height="' + h + '" style="' + estilo + '"/>'); };
    var centro = function (a, b) { return ((X(a) + X(b)) / 2).toFixed(1); };
    // linha da CPU
    txt(x0 - 6, yL(0) + 15, 'CPU', ' text-anchor="end" font-weight="bold"');
    var ocupado = o.cpu.slice().sort(function (p, q) { return p[1] - q[1]; }), cursor = 0;
    ocupado.forEach(function (s) {
      if (s[1] > cursor) {
        out.push('<line x1="' + X(cursor) + '" y1="' + (yL(0) + h / 2) + '" x2="' + X(s[1]) + '" y2="' + (yL(0) + h / 2) + '" stroke="currentColor" stroke-dasharray="3 3"/>');
        if (X(s[1]) - X(cursor) >= 40) txt(centro(cursor, s[1]), yL(0) + h / 2 - 4, 'ociosa', ' text-anchor="middle" font-size="10"');
      }
      cursor = s[2];
      var largura = X(s[2]) - X(s[1]);
      if (s[0] === 'tc') {
        rect(s[1], s[2], yL(0), 'fill:var(--vermelho-claro);stroke:var(--vermelho)');
        if (largura >= 14) txt(centro(s[1], s[2]), yL(0) + 15, 'tc', ' text-anchor="middle" font-size="10" style="fill:var(--vermelho)"');
      } else {
        rect(s[1], s[2], yL(0), 'fill:none;stroke:currentColor');
        if (largura >= 16) txt(centro(s[1], s[2]), yL(0) + 15, s[0], ' text-anchor="middle"');
      }
    });
    // uma linha por processo, com o estado em cada intervalo
    var ESTILO = {
      E: ['fill:var(--azul);stroke:var(--azul)', 'fill:var(--sobre-cor)'],
      A: ['fill:var(--azul-claro);stroke:var(--azul)', 'fill:currentColor'],
      B: ['fill:var(--ambar);stroke:var(--ambar)', 'fill:var(--sobre-cor)'],
    };
    o.procs.forEach(function (p, i) {
      var y = yL(i + 1), meus = o.cpu.filter(function (s) { return s[0] === p; });
      var minhasEs = es.filter(function (s) { return s[0] === p; });
      var fimP = 0; meus.forEach(function (s) { if (s[2] > fimP) fimP = s[2]; });
      txt(x0 - 6, y + 15, p, ' text-anchor="end" font-weight="bold"');
      var cheg = chegada[p] || 0, cortes = [cheg, fimP];
      meus.concat(minhasEs).forEach(function (s) { cortes.push(s[1], s[2]); });
      cortes = cortes.filter(function (c, j, a) { return c >= cheg && c <= fimP && a.indexOf(c) === j; }).sort(function (a, b) { return a - b; });
      var trechos = [];
      for (var j = 0; j + 1 < cortes.length; j++) {
        var a = cortes[j], b = cortes[j + 1], m = (a + b) / 2;
        var dentro = function (s) { return s[1] < m && m < s[2]; };
        var e = meus.some(dentro) ? 'E' : minhasEs.some(dentro) ? 'B' : 'A';
        var ult = trechos[trechos.length - 1];
        if (ult && ult[0] === e) ult[2] = b; else trechos.push([e, a, b]);
      }
      trechos.forEach(function (t) {
        rect(t[1], t[2], y, ESTILO[t[0]][0]);
        if (X(t[2]) - X(t[1]) >= 12) txt(centro(t[1], t[2]), y + 15, t[0], ' text-anchor="middle" font-size="11" style="' + ESTILO[t[0]][1] + '"');
      });
      if (fimP < fim) txt(X(fimP) + 4, y + 15, 'fim', ' font-size="10" style="fill:var(--suave)"');
    });
    // eixo do tempo com todas as transições (rótulos em degraus para não se sobreporem)
    var yE = yL(o.procs.length + 1) - 2;
    out.push('<line x1="' + x0 + '" y1="' + yE + '" x2="' + x1 + '" y2="' + yE + '" stroke="currentColor"/>');
    var marcas = [0];
    Object.keys(chegada).forEach(function (p) { marcas.push(chegada[p]); });
    o.cpu.concat(es).forEach(function (s) { marcas.push(s[1], s[2]); });
    marcas = marcas.filter(function (c, j, a) { return a.indexOf(c) === j; }).sort(function (a, b) { return a - b; });
    var ultimoX = [-99, -99, -99], nivelMax = 0;
    marcas.forEach(function (t) {
      var x = X(t), nv = 0;
      while (nv < 2 && x - ultimoX[nv] < 20) nv++;
      ultimoX[nv] = x; if (nv > nivelMax) nivelMax = nv;
      out.push('<line x1="' + x + '" y1="' + yE + '" x2="' + x + '" y2="' + (yE + 4 + nv * 11) + '" stroke="currentColor" stroke-width="0.6"/>');
      txt(x, yE + 14 + nv * 11, t, ' text-anchor="middle" font-size="10"');
    });
    // instantes perguntados
    T.forEach(function (t, i) {
      var x = X(t);
      out.push('<line x1="' + x + '" y1="' + (topo - 6 - 12 * nivelT[i]) + '" x2="' + x + '" y2="' + yE + '" style="stroke:var(--vermelho)" stroke-width="1.6" stroke-dasharray="4 3"/>');
      txt(Math.min(Math.max(x, x0 + 14), x1 - 14), topo - 10 - 12 * nivelT[i], 'T=' + t, ' text-anchor="middle" font-size="11" font-weight="bold" style="fill:var(--vermelho)"');
    });
    // legenda
    var yLeg = yE + 30 + nivelMax * 11, lx = x0;
    var temTc = o.cpu.some(function (s) { return s[0] === 'tc'; });
    [['E', 'Executando'], ['A', 'Apto'], ['B', 'Bloqueado'], ['tc', 'troca de contexto'], ['', Object.keys(chegada).length ? 'vazio = não chegou / Finalizado' : 'vazio = Finalizado']].filter(function (l) {
      return (l[0] !== 'B' || es.length) && (l[0] !== 'tc' || temTc);
    }).forEach(function (l) {
      if (l[0] === 'tc') out.push('<rect x="' + lx + '" y="' + (yLeg - 10) + '" width="14" height="12" style="fill:var(--vermelho-claro);stroke:var(--vermelho)"/>');
      else if (l[0]) out.push('<rect x="' + lx + '" y="' + (yLeg - 10) + '" width="14" height="12" style="' + ESTILO[l[0]][0] + '"/>');
      txt(lx + (l[0] ? 18 : 0), yLeg, l[1], ' font-size="10"');
      lx += (l[0] ? 18 : 0) + l[1].length * 5.6 + 14;
    });
    var H = yLeg + 8;
    return '<div style="overflow-x:auto"><svg viewBox="0 0 ' + W + ' ' + H + '" style="min-width:540px" role="img" aria-label="' + (o.rotulo || 'Linha do tempo do escalonamento') + '"><g font-size="12" fill="currentColor">' + out.join('') + '</g></svg></div>';
  }

function com(base, T) { var o = {}; for (var k in base) o[k] = base[k]; o.T = T; return o; }
function fig(base, T) { return '<figure class="diagrama">' + gantt(com(base, T)) + '</figure>'; }

var CONV = '<br><em>Convenção da aula: (1) havendo troca de contexto, ela ocorre antes de <strong>cada</strong> despacho, inclusive o primeiro; (2) durante a troca ninguém está Executando; (3) quem volta da E/S no mesmo instante em que outro perde o quantum entra <strong>antes</strong> na fila de Apto; (4) T nunca coincide com uma transição; (5) estados: Apto, Executando, Bloqueado, Finalizado.</em>';

// SJF: 20/30/12/5/9, troca de 2 u.t.
var SJF_A = { procs: ['P1', 'P2', 'P3', 'P4', 'P5'], rotulo: 'SJF com troca de contexto de 2 u.t.',
  cpu: [['tc', 0, 2], ['P4', 2, 7], ['tc', 7, 9], ['P5', 9, 18], ['tc', 18, 20], ['P3', 20, 32], ['tc', 32, 34], ['P1', 34, 54], ['tc', 54, 56], ['P2', 56, 86]] };
var ENUN_SJF = 'SO com escalonamento <strong>SJF</strong>. Em t=0 há 5 processos em Apto: P1, P2, P3, P4 e P5, com tempos de CPU de 20, 30, 12, 5 e 9 u.t. A <strong>troca de contexto leva 2 u.t.</strong>';
// RR q=10, 12/6/14/11, só P1 faz E/S (a cada 5 u.t., dura 8).
var RR_ES = { procs: ['P1', 'P2', 'P3', 'P4'], rotulo: 'Round Robin com quantum 10 e E/S de P1',
  cpu: [['P1', 0, 5], ['P2', 5, 11], ['P3', 11, 21], ['P4', 21, 31], ['P1', 31, 36], ['P3', 36, 40], ['P4', 40, 41], ['P1', 44, 46]],
  es: [['P1', 5, 13], ['P1', 36, 44]] };
var ENUN_RR_ES = 'Escalonamento <strong>circular</strong> com quantum de 10 u.t., sem troca de contexto. Em Apto, na ordem P1, P2, P3, P4, com tempos de CPU de 12, 6, 14 e 11 u.t. Apenas P1 faz E/S: depois de cada 5 u.t. de CPU executadas ele faz uma E/S que consome 8 u.t. (ao completar seus 12 u.t. ele termina, sem nova E/S).';
// RR q=10, 22/31/14, ordem P3, P2, P1, troca de 2 u.t. (20% do quantum).
var RR_TC = { procs: ['P1', 'P2', 'P3'], rotulo: 'Round Robin com quantum 10 e troca de 2 u.t.',
  cpu: [['tc', 0, 2], ['P3', 2, 12], ['tc', 12, 14], ['P2', 14, 24], ['tc', 24, 26], ['P1', 26, 36], ['tc', 36, 38], ['P3', 38, 42], ['tc', 42, 44], ['P2', 44, 54], ['tc', 54, 56], ['P1', 56, 66], ['tc', 66, 68], ['P2', 68, 78], ['tc', 78, 80], ['P1', 80, 82], ['tc', 82, 84], ['P2', 84, 85]] };
var ENUN_RR_TC = 'Escalonamento <strong>circular</strong> com quantum de 10 u.t. Em Apto estão P1, P2 e P3, com tempos de CPU de 22, 31 e 14 u.t., executados na ordem <strong>P3, P2, P1</strong>. O dispatcher gasta 20% do quantum em cada troca de contexto, ou seja, <strong>2 u.t. por troca</strong>, somadas fora da fatia (10 de CPU + 2 de troca). Os "20%" admitem outra leitura: a troca ocorrendo dentro da fatia (8 de CPU + 2 de troca). Na prova, declare por escrito a interpretação que você adotou.';
// RR q=10, 17/5/12, sem E/S.
var RR_SIMPLES = { procs: ['P1', 'P2', 'P3'], rotulo: 'Round Robin com quantum 10',
  cpu: [['P1', 0, 10], ['P2', 10, 15], ['P3', 15, 25], ['P1', 25, 32], ['P3', 32, 34]] };
var ENUN_RR_SIMPLES = 'Escalonamento <strong>circular</strong> com quantum de 10 u.t., sem troca de contexto e sem E/S. Em Apto, na ordem P1, P2, P3, com tempos de CPU de 17, 5 e 12 u.t.';
// RR q=10, 11/3/11, só P1 faz E/S (a cada 4, dura 9). Exemplo resolvido no corpo.
var RR_EX = { procs: ['P1', 'P2', 'P3'], rotulo: 'Round Robin com quantum 10 e E/S de P1',
  cpu: [['P1', 0, 4], ['P2', 4, 7], ['P3', 7, 17], ['P1', 17, 21], ['P3', 21, 22], ['P1', 30, 33]],
  es: [['P1', 4, 13], ['P1', 21, 30]] };
// Variação inédita: RR q=4, troca 1; P1=6 (E/S de 5 a cada 2 u.t.), P2=6, P3=3.
var RR_V1 = { procs: ['P1', 'P2', 'P3'], rotulo: 'Variação: Round Robin com quantum 4, troca de 1 u.t. e E/S de P1',
  cpu: [['tc', 0, 1], ['P1', 1, 3], ['tc', 3, 4], ['P2', 4, 8], ['tc', 8, 9], ['P3', 9, 12], ['tc', 12, 13], ['P1', 13, 15], ['tc', 15, 16], ['P2', 16, 18], ['tc', 20, 21], ['P1', 21, 23]],
  es: [['P1', 3, 8], ['P1', 15, 20]] };
var ENUN_V1 = 'Escalonamento <strong>circular</strong> com quantum de 4 u.t. e <strong>troca de contexto de 1 u.t.</strong> Em Apto, na ordem P1, P2, P3, com tempos de CPU de 6, 6 e 3 u.t. Só P1 faz E/S: depois de cada 2 u.t. de CPU executadas, faz uma E/S de 5 u.t. (ao completar 6 u.t. termina, sem nova E/S).';
// Mini-exemplo de troca de contexto no corpo.
var MINI = { procs: ['X', 'Y'], rotulo: 'Mini-exemplo: quantum 3 e troca de 1 u.t.', cpu: [['tc', 0, 1], ['X', 1, 4], ['tc', 4, 5], ['Y', 5, 7], ['tc', 7, 8], ['X', 8, 9]] };

SO1.registerLesson({
  id: 'm07-a05',
  titulo: 'Exercícios de linha do tempo',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.4.2–2.4.3 (p.92–94): SJF, Round Robin, custo do chaveamento',
    'Slides cap4 (Oliveira/Carissimi/Toscani, UFRGS): FIFO, SJF, Round Robin, dispatcher',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a escala de uma quadra de esportes.</strong> Para saber quem estava jogando às 15h, você não adivinha: monta a escala do dia, hora a hora, anotando quem entrou, quem saiu e quem ficou esperando no banco. Os exercícios de escalonamento são isso: montar a escala da CPU desde t=0 e depois "fotografar" o instante T pedido.</p>
</div>

<h2>A convenção usada nos exercícios</h2>
<p>Enunciados de prova costumam deixar detalhes em aberto. Para que cada exercício tenha uma única resposta, este site segue sempre esta convenção (e ela é repetida em cada questão de cálculo):</p>
<ol>
  <li>Se houver <strong>overhead de troca de contexto</strong>, ele ocorre antes de <strong>cada</strong> despacho, <strong>inclusive o primeiro</strong> (em t=0 o dispatcher também precisa carregar o primeiro processo).</li>
  <li><strong>Durante a troca nenhum processo está Executando</strong>: todos os que estão prontos estão em <strong>Apto</strong>.</li>
  <li>Quando um processo <strong>volta da E/S no mesmo instante</strong> em que outro <strong>perde o quantum</strong>, o que volta da E/S entra <strong>antes</strong> na fila de Apto.</li>
  <li>Os instantes T perguntados <strong>nunca coincidem com uma transição</strong> (assim não há dúvida sobre "antes ou depois" do evento).</li>
  <li>Os estados possíveis são <strong>Apto</strong>, <strong>Executando</strong>, <strong>Bloqueado</strong> e <strong>Finalizado</strong>.</li>
</ol>
<p>Suposições que valem sempre: todos os processos estão em Apto em t=0, na ordem dada; quem sofre preempção ou volta da E/S vai para o <strong>fim</strong> da fila de Apto; a E/S começa assim que o processo bloqueia (não há fila no dispositivo); a troca de contexto não conta como tempo de CPU de ninguém.</p>
<figure class="diagrama">${gantt(MINI)}
<figcaption>Regras 1 e 2 em ação (X = 4 u.t., Y = 2 u.t., quantum 3, troca 1). Há troca antes do primeiro despacho (0–1). Nos intervalos de troca, X e Y estão os dois em Apto e a CPU não executa ninguém.</figcaption></figure>

<h2>Passo a passo para montar a linha do tempo</h2>
<ol>
  <li><strong>Anote os dados:</strong> algoritmo, quantum, tempo de troca, tempo de CPU de cada processo e quem faz E/S (a cada quantas u.t. e por quanto tempo).</li>
  <li><strong>Defina a ordem inicial da fila</strong>: no FIFO e no RR é a ordem dada; no SJF, do menor para o maior tempo de CPU.</li>
  <li><strong>Monte uma tabela de intervalos</strong> com as colunas: intervalo, quem está na CPU (ou "troca", ou "ociosa"), o que acontece no fim do intervalo e como fica a fila de Apto. Em cada despacho: troca (se houver) → processo executa até o <strong>primeiro</strong> destes eventos: acabar o quantum, chegar a hora da E/S ou terminar.</li>
  <li><strong>Atualize os restantes</strong>: quanto falta de CPU para cada processo e quando cada E/S termina.</li>
  <li><strong>Desenhe o Gantt</strong>: uma linha para a CPU e uma para cada processo, marcando Executando, Apto, Bloqueado e Finalizado.</li>
  <li><strong>Leia o instante T</strong>: trace uma linha vertical em T e anote o estado de cada processo. Confira: no máximo um processo Executando (com uma CPU), e nenhum durante troca ou CPU ociosa.</li>
</ol>

<div class="exemplo">
  <p><strong>Exemplo resolvido.</strong> Escalonamento circular com quantum de 10 u.t., sem troca de contexto. Em Apto, na ordem P1, P2, P3, com 11, 3 e 11 u.t. de CPU. Só P1 faz E/S: depois de cada 4 u.t. de CPU, uma E/S de 9 u.t. Estado de cada processo em T = 6, 15 e 25.</p>
  <table>
    <tr><th>Intervalo</th><th>CPU</th><th>O que acontece</th><th>Fila de Apto depois</th></tr>
    <tr><td>0–4</td><td>P1</td><td>P1 executa 4 u.t. e faz E/S: Bloqueado de 4 a 13. Faltam 7.</td><td>P2, P3</td></tr>
    <tr><td>4–7</td><td>P2</td><td>P2 precisa só de 3: <strong>termina</strong> em 7.</td><td>P3</td></tr>
    <tr><td>7–17</td><td>P3</td><td>Em 13, P1 volta da E/S e entra na fila. Em 17, P3 perde o quantum (falta 1).</td><td>P1, P3</td></tr>
    <tr><td>17–21</td><td>P1</td><td>P1 executa mais 4 (total 8) e faz a 2ª E/S: Bloqueado de 21 a 30. Faltam 3.</td><td>P3</td></tr>
    <tr><td>21–22</td><td>P3</td><td>P3 executa o 1 que faltava: <strong>termina</strong> em 22.</td><td>vazia</td></tr>
    <tr><td>22–30</td><td>ociosa</td><td>Ninguém em Apto; P1 está Bloqueado.</td><td>vazia</td></tr>
    <tr><td>30–33</td><td>P1</td><td>P1 volta da E/S e executa os 3 finais: <strong>termina</strong> em 33 (11 não é múltiplo de 4, então não há 3ª E/S).</td><td>vazia</td></tr>
  </table>
  <figure class="diagrama">${gantt(com(RR_EX, [6, 15, 25]))}
  <figcaption>Linha do tempo do exemplo com os instantes pedidos.</figcaption></figure>
  <table>
    <tr><th>T</th><th>P1</th><th>P2</th><th>P3</th></tr>
    <tr><td>6</td><td>Bloqueado</td><td>Executando</td><td>Apto</td></tr>
    <tr><td>15</td><td>Apto</td><td>Finalizado</td><td>Executando</td></tr>
    <tr><td>25</td><td>Bloqueado</td><td>Finalizado</td><td>Finalizado</td></tr>
  </table>
  <p>Note em T=15: P1 já voltou da E/S (em 13), mas está em <strong>Apto</strong>, esperando P3 terminar o quantum. Bloqueado nunca vai direto para Executando.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Esquecer a troca antes do primeiro despacho</strong> desloca toda a linha do tempo em uma troca. Pela convenção, ela existe.</li>
    <li>Durante a troca de contexto e com a CPU ociosa, <strong>ninguém</strong> está Executando.</li>
    <li>Processo que acaba de voltar da E/S está em <strong>Apto</strong>, não em Executando.</li>
    <li>Processo que termina <strong>antes</strong> do fim do quantum libera a CPU na hora; o próximo começa imediatamente (após a troca, se houver).</li>
    <li><strong>Se a prova perguntar um instante de transição, escreva o estado logo após o evento e cite a transição.</strong> No exercício de Round Robin com E/S desta aula: em <strong>T=13</strong>, P1 acaba de voltar da E/S (Bloqueado → Apto) e entra na fila atrás de P4; P3 Executando, P4 Apto, P2 Finalizado. Em <strong>T=46</strong>, P1 termina (Executando → Finalizado) e todos ficam Finalizados.</li>
    <li>Finalizado e Bloqueado são diferentes: o Finalizado nunca mais volta; o Bloqueado volta para Apto quando o evento ocorre.</li>
  </ul>
</div>
`,
  resumo: 'Para resolver exercícios de escalonamento, monte a linha do tempo desde t=0 numa tabela de intervalos (CPU, evento, fila de Apto), desenhe o Gantt e leia o estado de cada processo no instante T. Convenção: troca de contexto antes de cada despacho, inclusive o primeiro; durante a troca ninguém executa; quem volta da E/S junto com uma perda de quantum entra antes na fila; T nunca coincide com transição; estados Apto, Executando, Bloqueado e Finalizado.',
  questoes: [
    {
      id: 'm07-a05-q1',
      enunciado: ENUN_SJF + ' Qual o estado de cada processo em <strong>T = 29</strong>?' + CONV,
      alternativas: [
        { texto: 'P1 Apto · P2 Apto · P3 Executando · P4 Finalizado · P5 Finalizado', correta: true, explicacao: 'Correto. Ordem SJF: P4 (5), P5 (9), P3 (12), P1 (20), P2 (30), com troca de 2 antes de cada um: troca 0–2, P4 2–7, troca 7–9, P5 9–18, troca 18–20, <strong>P3 20–32</strong>, troca 32–34, P1 34–54, troca 54–56, P2 56–86. Em 29, P3 executa; P4 e P5 já terminaram.' + fig(SJF_A, [29]) },
        { texto: 'P1 Executando · P2 Apto · P3 Finalizado · P4 Finalizado · P5 Finalizado', correta: false, explicacao: 'Essa seria a resposta sem troca de contexto (P4 0–5, P5 5–14, P3 14–26, P1 26–46). Com 2 u.t. antes de cada despacho, P3 só termina em 32.' },
        { texto: 'P1 Finalizado · P2 Executando · P3 Apto · P4 Apto · P5 Apto', correta: false, explicacao: 'Essa é a ordem FIFO (P1 primeiro). No SJF o menor tempo de CPU vai primeiro: P4, P5, P3, P1, P2.' },
        { texto: 'P1 Apto · P2 Apto · P3 Executando · P4 Bloqueado · P5 Bloqueado', correta: false, explicacao: 'P4 e P5 terminaram (em 7 e 18) e estão Finalizados. Ninguém faz E/S neste exercício, então ninguém fica Bloqueado.' },
      ],
    },
    {
      id: 'm07-a05-q2',
      enunciado: ENUN_SJF + ' Qual o estado de cada processo em <strong>T = 70</strong> e em <strong>T = 80</strong>?' + CONV,
      alternativas: [
        { texto: 'Nos dois instantes: P2 Executando e P1, P3, P4 e P5 Finalizados.', correta: true, explicacao: 'Correto. P1 termina em 54; depois vem a troca 54–56 e P2 executa de 56 a 86. Tanto 70 quanto 80 caem dentro da execução de P2.' + fig(SJF_A, [70, 80]) },
        { texto: 'T = 70: P2 Executando, demais Finalizados; T = 80: todos Finalizados.', correta: false, explicacao: 'Sem troca de contexto, P2 executaria de 46 a 76 e estaria Finalizado em 80. Com as cinco trocas de 2 u.t. (10 u.t. no total), P2 só termina em 86.' },
        { texto: 'Nos dois instantes: P1 Executando, P2 Finalizado, demais Finalizados.', correta: false, explicacao: 'Isso inverteria P1 e P2. No SJF, P1 (20) executa antes de P2 (30); P2 é o último.' },
        { texto: 'Nos dois instantes: P2 Executando, P1 Apto, P3, P4 e P5 Finalizados.', correta: false, explicacao: 'P1 executou de 34 a 54 e terminou: no SJF não preemptivo, quem começa vai até o fim. Em 70 ele está Finalizado.' },
      ],
    },
    {
      id: 'm07-a05-q3',
      enunciado: ENUN_SJF + ' (Variação) Qual o estado de cada processo em <strong>T = 8</strong>?' + CONV,
      alternativas: [
        { texto: 'P4 Finalizado; P1, P2, P3 e P5 Apto; nenhum Executando (troca de contexto entre 7 e 9).', correta: true, explicacao: 'Correto. P4 executa de 2 a 7 e termina; de 7 a 9 o dispatcher faz a troca para P5. Pela regra 2, durante a troca ninguém está Executando e todos os prontos estão em Apto.' + fig(SJF_A, [8]) },
        { texto: 'P4 Finalizado; P5 Executando; P1, P2 e P3 Apto.', correta: false, explicacao: 'P5 só começa a executar em 9, depois da troca de 2 u.t. (7–9). Sem troca, P5 estaria executando em 8.' },
        { texto: 'P4 Executando; P1, P2, P3 e P5 Apto.', correta: false, explicacao: 'P4 precisa de 5 u.t. e executa de 2 a 7. Em 8 ele já terminou; a troca não conta como tempo de CPU de P4.' },
        { texto: 'P4 Finalizado; P1, P2, P3 e P5 Bloqueados durante a troca.', correta: false, explicacao: 'Bloqueado é esperar um evento (como E/S). Durante a troca os processos prontos continuam em Apto (regra 2).' },
      ],
    },
    {
      id: 'm07-a05-q4',
      enunciado: ENUN_RR_ES + ' Qual o estado de cada processo em <strong>T = 17</strong>?' + CONV,
      alternativas: [
        { texto: 'P1 Apto · P2 Finalizado · P3 Executando · P4 Apto', correta: true, explicacao: 'Correto. P1 0–5 (E/S de 5 a 13), P2 5–11 (termina), P3 11–21 (quantum). Em 13 P1 volta da E/S e entra na fila atrás de P4. Em 17, P3 executa e P1 espera em Apto.' + fig(RR_ES, [17]) },
        { texto: 'P1 Bloqueado · P2 Finalizado · P3 Executando · P4 Apto', correta: false, explicacao: 'A E/S de P1 começa em 5 e dura 8, terminando em 13. Em 17 ela já acabou e P1 está em Apto.' },
        { texto: 'P1 Executando · P2 Finalizado · P3 Apto · P4 Apto', correta: false, explicacao: 'Quem volta da E/S vai para Apto, nunca direto para Executando. P3 começou seu quantum em 11 e só o perde em 21.' },
        { texto: 'P1 Apto · P2 Finalizado · P3 Apto · P4 Executando', correta: false, explicacao: 'P3 começou em 11 (depois de P2 terminar, sem esperar o quantum de P2) e tem direito a 10 u.t., até 21. P4 só entra em 21.' },
      ],
    },
    {
      id: 'm07-a05-q5',
      enunciado: ENUN_RR_ES + ' Qual o estado de cada processo em <strong>T = 45</strong>?' + CONV,
      alternativas: [
        { texto: 'P1 Executando · P2 Finalizado · P3 Finalizado · P4 Finalizado', correta: true, explicacao: 'Correto. Depois de 21: P4 21–31, P1 31–36 (2ª E/S de 36 a 44), P3 36–40 (termina), P4 40–41 (termina), CPU ociosa 41–44, P1 44–46 (termina). Em 45 só P1 resta, executando.' + fig(RR_ES, [45]) },
        { texto: 'P1 Bloqueado · P2 Finalizado · P3 Finalizado · P4 Finalizado', correta: false, explicacao: 'A 2ª E/S de P1 vai de 36 a 44. Em 45 ela já terminou e P1 executa seus 2 u.t. finais (44–46).' },
        { texto: 'Todos Finalizados.', correta: false, explicacao: 'Seria assim se P1 fizesse só uma E/S. Mas ele faz E/S depois de 5 e depois de 10 u.t. de CPU, e só termina em 46.' },
        { texto: 'P1 Apto · P2 Finalizado · P3 Finalizado · P4 Executando', correta: false, explicacao: 'P4 executou de 21 a 31 e de 40 a 41 (11 u.t. no total) e terminou em 41.' },
      ],
    },
    {
      id: 'm07-a05-q6',
      enunciado: ENUN_RR_ES + ' Qual o estado de cada processo em <strong>T = 52</strong>?' + CONV,
      alternativas: [
        { texto: 'Todos Finalizados.', correta: true, explicacao: 'Correto. O último a terminar é P1, em 46. Em 52 não há mais nada a executar.' + fig(RR_ES, [52]) },
        { texto: 'P1 Bloqueado, demais Finalizados.', correta: false, explicacao: 'P1 precisa de 12 u.t.: faz E/S depois de 5 e de 10, e os últimos 2 terminam o processo sem nova E/S (12 não é múltiplo de 5).' },
        { texto: 'P1 Executando, demais Finalizados.', correta: false, explicacao: 'P1 executa de 44 a 46 e termina. Em 52 ele está Finalizado.' },
        { texto: 'P3 Executando, demais Finalizados.', correta: false, explicacao: 'P3 (14 u.t.) executa de 11 a 21 e de 36 a 40, terminando em 40.' },
      ],
    },
    {
      id: 'm07-a05-q7',
      enunciado: ENUN_RR_ES + ' (Variação) Qual o estado de cada processo em <strong>T = 42</strong>?' + CONV,
      alternativas: [
        { texto: 'P1 Bloqueado · P2, P3 e P4 Finalizados (CPU ociosa).', correta: true, explicacao: 'Correto. P4 termina em 41; P1 está na 2ª E/S (36–44). De 41 a 44 não há ninguém em Apto: a CPU fica ociosa.' + fig(RR_ES, [42]) },
        { texto: 'P1 Apto · P2, P3 e P4 Finalizados.', correta: false, explicacao: 'Se P1 estivesse em Apto com a CPU livre, ele estaria executando. Ele está Bloqueado até 44, esperando a E/S.' },
        { texto: 'P1 Executando · P2, P3 e P4 Finalizados.', correta: false, explicacao: 'P1 só volta da E/S em 44. Em 42 ele ainda está Bloqueado e a CPU está ociosa.' },
        { texto: 'P1 Bloqueado · P4 Executando · P2 e P3 Finalizados.', correta: false, explicacao: 'Em 40 P4 tinha só 1 u.t. restante (executou 10 de 21 a 31) e terminou em 41.' },
      ],
    },
    {
      id: 'm07-a05-q8',
      enunciado: ENUN_RR_TC + ' Qual o estado de cada processo em <strong>T = 31</strong> e em <strong>T = 35</strong>?' + CONV,
      alternativas: [
        { texto: 'Nos dois instantes: P1 Executando · P2 Apto · P3 Apto.', correta: true, explicacao: 'Correto. Troca 0–2, P3 2–12, troca 12–14, P2 14–24, troca 24–26, <strong>P1 26–36</strong>. Tanto 31 quanto 35 caem no primeiro quantum de P1.' + fig(RR_TC, [31, 35]) },
        { texto: 'T = 31: P1 Executando; T = 35: nenhum executando (troca), todos Apto.', correta: false, explicacao: 'Seria assim sem a troca antes do primeiro despacho (P3 0–10, troca 10–12, P2 12–22, troca 22–24, P1 24–34, troca 34–36). Pela regra 1, há troca também em t=0, e P1 executa de 26 a 36.' },
        { texto: 'T = 31: P3 Executando; T = 35: P2 Executando.', correta: false, explicacao: 'Sem nenhuma troca, P3 voltaria à CPU de 30 a 34 e P2 entraria em 34. Com 2 u.t. por troca, P3 só volta à CPU em 38.' },
        { texto: 'T = 31: P1 Executando; T = 35: P1 Finalizado.', correta: false, explicacao: 'P1 precisa de 22 u.t.; num quantum executa só 10. Ele termina apenas em 82.' },
      ],
    },
    {
      id: 'm07-a05-q9',
      enunciado: ENUN_RR_TC + ' Qual o estado de cada processo em <strong>T = 40</strong>?' + CONV,
      alternativas: [
        { texto: 'P1 Apto · P2 Apto · P3 Executando', correta: true, explicacao: 'Correto. P1 perde o quantum em 36; troca 36–38; P3 executa os 4 u.t. que faltavam, de 38 a 42.' + fig(RR_TC, [40]) },
        { texto: 'P1 Apto · P2 Executando · P3 Finalizado', correta: false, explicacao: 'Sem trocas, P3 terminaria em 34 e P2 estaria executando em 40. Com 2 u.t. por troca, P3 só termina em 42.' },
        { texto: 'Nenhum Executando (troca) · P1, P2 e P3 Apto', correta: false, explicacao: 'A troca depois do quantum de P1 vai de 36 a 38. Em 40, P3 já está executando.' },
        { texto: 'P1 Finalizado · P2 Apto · P3 Executando', correta: false, explicacao: 'P1 (22 u.t.) executou só 10 até aqui (26–36). Ainda faltam 12.' },
      ],
    },
    {
      id: 'm07-a05-q10',
      enunciado: ENUN_RR_SIMPLES + ' Qual o estado de cada processo em <strong>T = 7</strong>?' + CONV,
      alternativas: [
        { texto: 'P1 Executando · P2 Apto · P3 Apto', correta: true, explicacao: 'Correto. P1 é o primeiro da fila e executa seu quantum de 0 a 10.' + fig(RR_SIMPLES, [7]) },
        { texto: 'P1 Apto · P2 Executando · P3 Apto', correta: false, explicacao: 'Escolher P2 por ser o mais curto seria SJF. No circular a ordem é a da fila: P1 primeiro.' },
        { texto: 'P1 Apto · P2 Apto · P3 Executando', correta: false, explicacao: 'P3 é o último da fila; só começa em 15, depois de P1 (0–10) e P2 (10–15).' },
        { texto: 'P1 Executando · P2 Finalizado · P3 Apto', correta: false, explicacao: 'P2 ainda nem executou em 7: ele começa em 10.' },
      ],
    },
    {
      id: 'm07-a05-q11',
      enunciado: ENUN_RR_SIMPLES + ' Qual o estado de cada processo em <strong>T = 12</strong>?' + CONV,
      alternativas: [
        { texto: 'P1 Apto · P2 Executando · P3 Apto', correta: true, explicacao: 'Correto. Em 10 P1 perde o quantum (faltam 7) e vai para o fim da fila; P2 executa de 10 a 15.' + fig(RR_SIMPLES, [12]) },
        { texto: 'P1 Executando · P2 Apto · P3 Apto', correta: false, explicacao: 'Seria FIFO (P1 de 0 a 17). Com quantum 10, P1 sofre preempção em 10.' },
        { texto: 'P1 Bloqueado · P2 Executando · P3 Apto', correta: false, explicacao: 'Preempção por tempo leva para Apto, não para Bloqueado. Não há E/S neste exercício.' },
        { texto: 'P1 Apto · P2 Apto · P3 Executando', correta: false, explicacao: 'Depois de P1 vem P2 na fila. P3 só começa em 15.' },
      ],
    },
    {
      id: 'm07-a05-q12',
      enunciado: ENUN_RR_SIMPLES + ' Qual o estado de cada processo em <strong>T = 33</strong>?' + CONV,
      alternativas: [
        { texto: 'P1 Finalizado · P2 Finalizado · P3 Executando', correta: true, explicacao: 'Correto. P1 0–10, P2 10–15 (termina), P3 15–25, P1 25–32 (termina, faltavam 7), P3 32–34 (termina).' + fig(RR_SIMPLES, [33]) },
        { texto: 'P1 Executando · P2 Finalizado · P3 Apto', correta: false, explicacao: 'No 2º turno P1 precisava só de 7 u.t. (25–32). Ele não usa o quantum inteiro e termina em 32.' },
        { texto: 'P1 Finalizado · P2 Finalizado · P3 Finalizado', correta: false, explicacao: 'P3 (12 u.t.) executou 10 de 15 a 25 e ainda precisa de 2, que executa de 32 a 34.' },
        { texto: 'P1 Apto · P2 Finalizado · P3 Executando', correta: false, explicacao: 'P1 já terminou em 32: 10 u.t. no 1º quantum + 7 no 2º = 17.' },
      ],
    },
    {
      id: 'm07-a05-q17',
      enunciado: 'Escalonamento <strong>circular</strong> com quantum de 10 u.t., sem troca de contexto. Em Apto, na ordem P1, P2, P3, com tempos de CPU de 11, 3 e 11 u.t. Só P1 faz E/S: depois de cada 4 u.t. de CPU executadas, uma E/S de 9 u.t. (ao completar 11 u.t. termina, sem nova E/S). Qual o estado de cada processo em <strong>T = 27</strong>?' + CONV,
      alternativas: [
        { texto: 'P1 Bloqueado · P2 Finalizado · P3 Finalizado (CPU ociosa)', correta: true, explicacao: 'Correto. P1 0–4 (E/S 4–13), P2 4–7 (termina), P3 7–17 (quantum; P1 volta em 13), P1 17–21 (2ª E/S 21–30), P3 21–22 (termina). De 22 a 30 a CPU fica ociosa, com P1 Bloqueado; depois P1 executa de 30 a 33.' + fig(RR_EX, [27]) },
        { texto: 'P1 Apto · P2 Finalizado · P3 Finalizado', correta: false, explicacao: 'A 2ª E/S de P1 começa em 21 e termina em 30. Em 27 ele está Bloqueado; se estivesse Apto com a CPU livre, já estaria executando.' },
        { texto: 'P1 Bloqueado · P2 Finalizado · P3 Executando', correta: false, explicacao: 'Depois do quantum (7–17), faltava a P3 só 1 u.t., executado de 21 a 22. Em 27 ele já terminou.' },
        { texto: 'P1 Executando · P2 Finalizado · P3 Finalizado', correta: false, explicacao: 'P1 só volta da 2ª E/S em 30 e executa os 3 u.t. finais de 30 a 33.' },
      ],
    },
    {
      id: 'm07-a05-q13',
      enunciado: ENUN_V1 + ' Qual o estado de cada processo em <strong>T = 14</strong>?' + CONV,
      alternativas: [
        { texto: 'P1 Executando · P2 Apto · P3 Finalizado', correta: true, explicacao: 'Correto. Troca 0–1, P1 1–3 (E/S de 3 a 8), troca 3–4, P2 4–8. Em 8, P1 volta da E/S <strong>e</strong> P2 perde o quantum: pela regra 3, P1 entra antes, e a fila fica P3, P1, P2. Troca 8–9, P3 9–12 (termina), troca 12–13, <strong>P1 13–15</strong>.' + fig(RR_V1, [14]) },
        { texto: 'P1 Apto · P2 Executando · P3 Finalizado', correta: false, explicacao: 'Seria assim se P2 entrasse na fila antes de P1 em t=8. A regra 3 diz o contrário: quem volta da E/S entra antes de quem perdeu o quantum.' },
        { texto: 'Nenhum Executando (troca) · P1 e P2 Apto · P3 Finalizado', correta: false, explicacao: 'A troca depois do término de P3 vai de 12 a 13. Em 14, P1 já está executando (13–15).' },
        { texto: 'P1 Apto · P2 Apto · P3 Executando', correta: false, explicacao: 'P3 precisa de 3 u.t. e executa de 9 a 12. Em 14 ele está Finalizado.' },
      ],
    },
    {
      id: 'm07-a05-q14',
      enunciado: ENUN_V1 + ' Qual o estado de cada processo em <strong>T = 19</strong>?' + CONV,
      alternativas: [
        { texto: 'P1 Bloqueado · P2 Finalizado · P3 Finalizado (CPU ociosa)', correta: true, explicacao: 'Correto. P1 13–15 faz a 2ª E/S (15–20); troca 15–16; P2 executa os 2 u.t. que faltavam, de 16 a 18, e termina. De 18 a 20 só resta P1, Bloqueado: CPU ociosa. Em 20 ele volta, há troca (20–21) e P1 termina em 23.' + fig(RR_V1, [19]) },
        { texto: 'P1 Apto · P2 Finalizado · P3 Finalizado', correta: false, explicacao: 'A 2ª E/S de P1 começa em 15 e dura 5, até 20. Em 19 ele ainda está Bloqueado.' },
        { texto: 'P1 Bloqueado · P2 Executando · P3 Finalizado', correta: false, explicacao: 'P2 tinha 2 u.t. restantes depois do primeiro quantum (4 de 6) e as executa de 16 a 18. Em 19 ele já terminou.' },
        { texto: 'P1 Executando · P2 Finalizado · P3 Finalizado', correta: false, explicacao: 'P1 só volta da E/S em 20, e ainda há a troca de 20 a 21. Ele executa de 21 a 23.' },
      ],
    },
    {
      id: 'm07-a05-q15',
      enunciado: 'Pela convenção da aula, durante uma troca de contexto, em que estado estão os processos que ainda não terminaram e não estão esperando E/S?',
      alternativas: [
        { texto: 'Todos em Apto; nenhum processo está Executando durante a troca.', correta: true, explicacao: 'Correto (regra 2). Durante a troca a CPU executa o dispatcher, não um processo de usuário. O que saiu já voltou para Apto e o que vai entrar ainda não começou.' },
        { texto: 'O processo que está saindo continua Executando até a troca acabar.', correta: false, explicacao: 'O processo que sai deixa de executar quando o dispatcher assume. Pela convenção, ele já está em Apto (ou Bloqueado, se saiu por E/S).' },
        { texto: 'O processo escolhido já está Executando desde o início da troca.', correta: false, explicacao: 'O escolhido só começa a executar depois que seu contexto foi carregado, ou seja, ao fim da troca.' },
        { texto: 'Todos ficam Bloqueados até a troca terminar.', correta: false, explicacao: 'Bloqueado é esperar um evento externo (E/S, semáforo). A troca não é evento pelo qual o processo espera; ele continua pronto, em Apto.' },
      ],
    },
    {
      id: 'm07-a05-q16',
      enunciado: 'Round Robin. A fila de Apto contém só P3. Em t=20, P1 volta da E/S no mesmo instante em que P2, que estava executando, perde o quantum. Pela convenção da aula, como fica a fila de Apto?',
      alternativas: [
        { texto: 'P3, P1, P2.', correta: true, explicacao: 'Correto (regra 3). P3 já estava na fila. Dos dois que chegam juntos, quem volta da E/S entra antes de quem perdeu o quantum.' },
        { texto: 'P3, P2, P1.', correta: false, explicacao: 'Essa é a ordem oposta à da regra 3. Pela convenção, P1 (volta da E/S) entra antes de P2 (preempção).' },
        { texto: 'P1, P3, P2.', correta: false, explicacao: 'Quem volta da E/S vai para o fim da fila, atrás de quem já estava esperando (P3). Não há "fura-fila" no Round Robin.' },
        { texto: 'P2, P3, P1.', correta: false, explicacao: 'Quem perde o quantum vai para o fim da fila, não para o início, e ainda depois de P1 pela regra 3.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm07-a05-d1',
      enunciado: 'Um SO usa escalonamento SJF. Num dado instante, há apenas 5 processos em Apto: P1, P2, P3, P4 e P5, que precisam de 20, 30, 12, 5 e 9 u.t. de CPU. Cada troca de contexto leva 2 u.t. Monte a linha do tempo e dê o estado de cada processo em T = 29, T = 70 e T = 80 (use a convenção da aula).',
      respostaModelo: `<p><strong>Ordem SJF</strong> (menor tempo de CPU primeiro): P4 (5), P5 (9), P3 (12), P1 (20), P2 (30). Troca de 2 u.t. antes de cada despacho, inclusive o primeiro.</p>
<table>
  <tr><th>Intervalo</th><th>CPU</th></tr>
  <tr><td>0–2</td><td>troca</td></tr><tr><td>2–7</td><td>P4 (termina)</td></tr>
  <tr><td>7–9</td><td>troca</td></tr><tr><td>9–18</td><td>P5 (termina)</td></tr>
  <tr><td>18–20</td><td>troca</td></tr><tr><td>20–32</td><td>P3 (termina)</td></tr>
  <tr><td>32–34</td><td>troca</td></tr><tr><td>34–54</td><td>P1 (termina)</td></tr>
  <tr><td>54–56</td><td>troca</td></tr><tr><td>56–86</td><td>P2 (termina)</td></tr>
</table>
${'<figure class="diagrama">' + gantt(com(SJF_A, [29, 70, 80])) + '</figure>'}
<div style="overflow-x:auto"><table>
  <tr><th>T</th><th>P1</th><th>P2</th><th>P3</th><th>P4</th><th>P5</th></tr>
  <tr><td>29</td><td>Apto</td><td>Apto</td><td>Executando</td><td>Finalizado</td><td>Finalizado</td></tr>
  <tr><td>70</td><td>Finalizado</td><td>Executando</td><td>Finalizado</td><td>Finalizado</td><td>Finalizado</td></tr>
  <tr><td>80</td><td>Finalizado</td><td>Executando</td><td>Finalizado</td><td>Finalizado</td><td>Finalizado</td></tr>
</table></div>
<p>Nenhum dos três instantes coincide com uma transição. Sem a troca de contexto, P2 terminaria em 76 e estaria Finalizado em 80; é a troca que muda essa resposta.</p>`,
      pontosChave: [
        'Ordenou pelo SJF: P4, P5, P3, P1, P2',
        'Incluiu a troca de 2 u.t. antes de cada despacho (P2 termina em 86)',
        'T = 29: P3 Executando, P1 e P2 Apto, P4 e P5 Finalizados',
        'T = 70 e T = 80: P2 Executando, demais Finalizados',
        'Apresentou a linha do tempo (tabela ou Gantt)',
      ],
    },
    {
      id: 'm07-a05-d2',
      enunciado: 'Um SO usa escalonamento circular com fatia de tempo de 10 u.t. Há apenas 4 processos em Apto, na ordem P1, P2, P3 e P4, que precisam de 12, 6, 14 e 11 u.t. de CPU. Apenas P1 faz E/S: cada operação ocorre depois de 5 u.t. de CPU e consome 8 u.t. Sem troca de contexto. Monte a linha do tempo e dê o estado de cada processo em T = 17, T = 45 e T = 52.',
      respostaModelo: `<div style="overflow-x:auto"><table>
  <tr><th>Intervalo</th><th>CPU</th><th>O que acontece</th><th>Fila de Apto depois</th></tr>
  <tr><td>0–5</td><td>P1</td><td>E/S de 5 a 13 (faltam 7)</td><td>P2, P3, P4</td></tr>
  <tr><td>5–11</td><td>P2</td><td>termina</td><td>P3, P4</td></tr>
  <tr><td>11–21</td><td>P3</td><td>em 13 P1 volta; em 21 quantum acaba (faltam 4)</td><td>P4, P1, P3</td></tr>
  <tr><td>21–31</td><td>P4</td><td>quantum acaba (falta 1)</td><td>P1, P3, P4</td></tr>
  <tr><td>31–36</td><td>P1</td><td>2ª E/S de 36 a 44 (faltam 2)</td><td>P3, P4</td></tr>
  <tr><td>36–40</td><td>P3</td><td>termina</td><td>P4</td></tr>
  <tr><td>40–41</td><td>P4</td><td>termina</td><td>vazia</td></tr>
  <tr><td>41–44</td><td>ociosa</td><td>P1 Bloqueado</td><td>vazia</td></tr>
  <tr><td>44–46</td><td>P1</td><td>termina</td><td>vazia</td></tr>
</table></div>
${'<figure class="diagrama">' + gantt(com(RR_ES, [17, 45, 52])) + '</figure>'}
<div style="overflow-x:auto"><table>
  <tr><th>T</th><th>P1</th><th>P2</th><th>P3</th><th>P4</th></tr>
  <tr><td>17</td><td>Apto</td><td>Finalizado</td><td>Executando</td><td>Apto</td></tr>
  <tr><td>45</td><td>Executando</td><td>Finalizado</td><td>Finalizado</td><td>Finalizado</td></tr>
  <tr><td>52</td><td>Finalizado</td><td>Finalizado</td><td>Finalizado</td><td>Finalizado</td></tr>
</table></div>
<p><strong>Se a prova perguntar um instante de transição, escreva o estado logo após o evento e cite a transição.</strong> Por exemplo, em <strong>T=13</strong>, P1 acaba de voltar da E/S (Bloqueado → Apto) e entra na fila atrás de P4; P3 Executando, P4 Apto, P2 Finalizado. Em <strong>T=46</strong>, P1 termina (Executando → Finalizado) e todos ficam Finalizados.</p>`,
      pontosChave: [
        'P1 executa 5 u.t. e fica Bloqueado de 5 a 13; P2 termina em 11; P3 executa de 11 a 21',
        'Ao voltar da E/S, P1 entra no fim da fila (atrás de P4), em Apto',
        'Segunda E/S de P1 de 36 a 44, CPU ociosa de 41 a 44 e P1 termina em 46',
        'T = 17: P1 Apto, P2 Finalizado, P3 Executando, P4 Apto',
        'T = 45: P1 Executando, demais Finalizados; T = 52: todos Finalizados',
      ],
    },
  ],
});
})();
