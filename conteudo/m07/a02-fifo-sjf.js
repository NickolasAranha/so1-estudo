// Módulo 7, aula 2: FIFO, SJF, SRTF, previsão por média exponencial, ordem que minimiza o turnaround.
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

var FIFO_ABCD = { procs: ['A', 'B', 'C', 'D'], cpu: [['A', 0, 12], ['B', 12, 20], ['C', 20, 35], ['D', 35, 40]], rotulo: 'FIFO na ordem A, B, C, D' };
var SJF_ABCD = { procs: ['A', 'B', 'C', 'D'], cpu: [['D', 0, 5], ['B', 5, 13], ['A', 13, 25], ['C', 25, 40]], rotulo: 'SJF com A=12, B=8, C=15, D=5' };
var SJF_Q3 = { procs: ['P1', 'P2', 'P3', 'P4'], cpu: [['P4', 0, 2], ['P2', 2, 6], ['P3', 6, 13], ['P1', 13, 23]], rotulo: 'SJF com P1=10, P2=4, P3=7, P4=2' };
var Q17 = { procs: ['P1', 'P2', 'P3', 'P4'], cpu: [['P3', 0, 2], ['P2', 2, 7], ['P4', 7, 14], ['P1', 14, 22]], rotulo: 'Ordem P3, P2, P4, P1' };
var SRTF = { procs: ['P1', 'P2', 'P3', 'P4'], chegada: { P2: 1, P3: 2, P4: 4 }, cpu: [['P1', 0, 1], ['P2', 1, 4], ['P4', 4, 6], ['P1', 6, 12], ['P3', 12, 20]], rotulo: 'SRTF com chegadas' };

SO1.registerLesson({
  id: 'm07-a02',
  titulo: 'FIFO e SJF',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.4.2 (p.92–93): primeiro a chegar, primeiro a ser servido; tarefa mais curta primeiro (Fig. 2.32); próximo de menor tempo restante; §2.4.3 (p.95): próximo processo mais curto e aging',
    'Slides cap4 (Oliveira/Carissimi/Toscani, UFRGS): FIFO, SJF, previsão por média exponencial',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: filas de supermercado.</strong> No caixa comum, quem chegou primeiro passa primeiro, mesmo que esteja com o carrinho lotado: é o <strong>FIFO</strong>. Se o gerente deixasse sempre passar primeiro quem tem menos itens, a espera média cairia muito (quem tem 2 itens não espera o carrinho de 200): é a ideia do <strong>SJF</strong>. O problema: quem tem o carrinho cheio pode nunca ser atendido se não parar de chegar gente com poucos itens.</p>
</div>

<h2>FIFO (First In, First Out) ou FCFS</h2>
<p>Também chamado <strong>FCFS</strong> (<em>First-Come, First-Served</em>, "primeiro a chegar, primeiro a ser servido"). É o algoritmo mais simples:</p>
<ul>
  <li>Há <strong>uma única fila de Apto</strong>. Quem fica Apto entra no <strong>fim</strong> da fila; o processo do <strong>início</strong> é o próximo a executar.</li>
  <li>É <strong>não preemptivo</strong>: o processo executa até <strong>terminar</strong>, <strong>bloquear</strong> (chamada de sistema, E/S) ou <strong>liberar a CPU</strong> voluntariamente.</li>
  <li>Quando um processo Bloqueado volta a Apto, ele vai para o <strong>fim</strong> da fila, como se tivesse acabado de chegar.</li>
</ul>
<p><strong>Vantagem:</strong> fácil de entender e de programar (uma lista encadeada). <strong>Desvantagem:</strong> <strong>prejudica os processos I/O-bound</strong>. No exemplo do Tanenbaum, um processo CPU-bound executa 1 s e depois lê o disco; vários I/O-bound precisam de 1.000 leituras de disco cada. Cada vez que o CPU-bound pega a CPU, todos os I/O-bound esperam 1 s para fazer uma leitura, e cada um leva 1.000 s para terminar. Com preempção a cada 10 ms, terminariam em 10 s. Além disso, o tempo médio depende muito da <strong>ordem de chegada</strong>.</p>

<h3>Exemplo dos slides: a ordem importa</h3>
<p>A=12, B=8, C=15 e D=5 u.t., todos em Apto em t=0. O <strong>tempo de espera</strong> de cada um é o instante em que começa a executar.</p>
<figure class="diagrama">${gantt(FIFO_ABCD)}
<figcaption>FIFO na ordem A-B-C-D: espera média = (0 + 12 + 20 + 35) / 4 = <strong>16,75 u.t.</strong> Se D tivesse chegado primeiro (D-A-B-C): (0 + 5 + 17 + 25) / 4 = 11,75 u.t.</figcaption></figure>

<h2>SJF (Shortest Job First)</h2>
<p>"Tarefa mais curta primeiro": entre os processos em Apto, executa primeiro o que tem o <strong>menor tempo de CPU</strong> (o menor próximo surto de CPU). Na forma clássica é <strong>não preemptivo</strong>: o escolhido executa até terminar ou bloquear.</p>
<figure class="diagrama">${gantt(SJF_ABCD)}
<figcaption>Mesmos processos com SJF (D, B, A, C): espera média = (0 + 5 + 13 + 25) / 4 = <strong>10,75 u.t.</strong>, contra 16,75 do FIFO.</figcaption></figure>
<ul>
  <li><strong>É ótimo:</strong> dá o <strong>menor tempo médio de espera</strong> (e de turnaround) para um conjunto de processos, <strong>desde que todos estejam disponíveis ao mesmo tempo</strong>. Prova do Tanenbaum: com quatro tarefas de tempos a, b, c e d, executadas nessa ordem, o turnaround médio é (4a + 3b + 2c + d) / 4. O primeiro tempo pesa 4 vezes, então ele deve ser o menor, depois o segundo menor, e assim por diante.</li>
  <li>Exemplo do Tanenbaum (Fig. 2.32): A=8, B=4, C=4, D=4. Na ordem A-B-C-D os turnarounds são 8, 12, 16 e 20 (média 14); na ordem SJF (B-C-D-A), 4, 8, 12 e 20 (média 11).</li>
  <li><strong>Favorece os processos I/O-bound</strong>, que têm surtos de CPU curtos.</li>
  <li><strong>Dificuldade:</strong> o SO não sabe de antemão quanto tempo de CPU cada processo vai usar. Funciona bem em lote (o tempo de jobs repetitivos é conhecido) e, nos outros casos, o tempo é <strong>previsto</strong> pelo passado.</li>
  <li><strong>Risco de starvation:</strong> se sempre chegarem processos curtos, um processo longo pode nunca executar.</li>
</ul>
<p>Contraexemplo do Tanenbaum para "todos ao mesmo tempo": A=2 e B=4 chegam em t=0; C, D e E (1 cada) chegam em t=3. Em t=0 o SJF só pode escolher entre A e B, e a ordem A, B, C, D, E dá turnaround médio de 4,6; a ordem B, C, D, E, A daria 4,4. Como C, D e E ainda não tinham chegado, o SJF não foi ótimo.</p>

<h3>SRTF: a versão preemptiva do SJF</h3>
<p><strong>SRTF</strong> (<em>Shortest Remaining Time First</em>; o Tanenbaum chama de "próximo de menor tempo restante"): sempre executa o processo com o <strong>menor tempo restante</strong>. Quando chega um processo novo, seu tempo total é comparado com o <strong>tempo que falta</strong> ao processo em execução; se o novo for menor, o atual sofre <strong>preempção</strong> e volta para Apto. Assim, processos curtos que chegam depois são atendidos logo.</p>

<h2>Prevendo o próximo surto de CPU</h2>
<p>Para usar SJF com processos interativos, estima-se o próximo surto de CPU pela <strong>média exponencial</strong> dos surtos anteriores:</p>
<p style="text-align:center;font-size:1.15em"><strong>τ<sub>n+1</sub> = α · t<sub>n</sub> + (1 − α) · τ<sub>n</sub></strong></p>
<ul>
  <li><strong>t<sub>n</sub></strong>: duração <strong>medida</strong> do n-ésimo surto (o mais recente).</li>
  <li><strong>τ<sub>n</sub></strong>: valor que tinha sido <strong>previsto</strong> para esse surto (resume a história passada).</li>
  <li><strong>τ<sub>n+1</sub></strong>: previsão para o <strong>próximo</strong> surto.</li>
  <li><strong>α</strong> (0 ≤ α ≤ 1) é o peso do último surto. <strong>α = 0</strong>: ignora o último surto (τ<sub>n+1</sub> = τ<sub>n</sub>, só o passado conta). <strong>α = 1</strong>: só o último surto conta (τ<sub>n+1</sub> = t<sub>n</sub>). Tipicamente <strong>α = 0,5</strong>: mesmo peso para o presente e para o passado.</li>
</ul>
<p>Com α = 1/2 as estimativas sucessivas ficam T<sub>0</sub>, T<sub>0</sub>/2 + T<sub>1</sub>/2, T<sub>0</sub>/4 + T<sub>1</sub>/4 + T<sub>2</sub>/2... Depois de três novos surtos, o peso de T<sub>0</sub> já caiu para 1/8: o passado distante é esquecido aos poucos. O Tanenbaum chama essa técnica de <strong>aging</strong> (envelhecimento) da estimativa.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: SRTF com chegadas.</strong> P1 chega em 0 (7 u.t.), P2 em 1 (3 u.t.), P3 em 2 (8 u.t.) e P4 em 4 (2 u.t.). Sem troca de contexto.</p>
  <table>
    <tr><th>Instante</th><th>O que acontece</th><th>Decisão</th></tr>
    <tr><td>0</td><td>Só P1 existe.</td><td>P1 executa.</td></tr>
    <tr><td>1</td><td>Chega P2 (3). P1 ainda precisa de 6.</td><td>3 &lt; 6: <strong>preempção</strong> de P1; P2 executa.</td></tr>
    <tr><td>2</td><td>Chega P3 (8). P2 ainda precisa de 2.</td><td>2 &lt; 8: P2 continua.</td></tr>
    <tr><td>4</td><td>P2 termina. Chega P4 (2). Restantes: P1=6, P3=8, P4=2.</td><td>P4 executa.</td></tr>
    <tr><td>6</td><td>P4 termina. Restantes: P1=6, P3=8.</td><td>P1 executa até o fim (12).</td></tr>
    <tr><td>12</td><td>P1 termina.</td><td>P3 executa até 20.</td></tr>
  </table>
  <figure class="diagrama">${gantt(SRTF)}
  <figcaption>Espera = término − chegada − tempo de CPU: P1 = 12 − 0 − 7 = 5; P2 = 4 − 1 − 3 = 0; P3 = 20 − 2 − 8 = 10; P4 = 6 − 4 − 2 = 0. Média = 15 / 4 = <strong>3,75 u.t.</strong></figcaption></figure>
  <p>Com SJF <strong>não preemptivo</strong>, P1 executaria de 0 a 7 sem interrupção; depois P4 (7–9), P2 (9–12) e P3 (12–20). Esperas: 0, 8, 10 e 3, média <strong>5,25 u.t.</strong> A preempção ajudou os processos curtos que chegaram depois.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>FIFO e SJF clássicos são não preemptivos.</strong> A versão preemptiva do SJF tem outro nome: SRTF.</li>
    <li>O SJF só é <strong>ótimo</strong> se todos os processos estão disponíveis ao mesmo tempo, e ele precisa <strong>conhecer ou prever</strong> o tempo de CPU.</li>
    <li>Na fórmula, <strong>α multiplica o surto medido (t<sub>n</sub>)</strong>, e (1 − α) multiplica a previsão anterior (τ<sub>n</sub>). Trocar os dois é o erro mais comum.</li>
    <li>SJF <strong>favorece</strong> I/O-bound; FIFO <strong>prejudica</strong> I/O-bound.</li>
    <li>Tempo de espera é o tempo em Apto; turnaround inclui o tempo de execução. Leia com atenção qual dos dois a questão pede.</li>
  </ul>
</div>
`,
  resumo: 'FIFO (FCFS) atende pela ordem de chegada numa única fila, é não preemptivo, simples e prejudica processos I/O-bound; o tempo médio depende da ordem. SJF executa primeiro o menor tempo de CPU, é não preemptivo e dá o menor tempo médio de espera quando todos estão disponíveis ao mesmo tempo, mas precisa prever o surto (τn+1 = α·tn + (1−α)·τn) e pode causar starvation. SRTF é a versão preemptiva: um processo que chega com tempo menor que o restante do atual toma a CPU.',
  questoes: [
    {
      id: 'm07-a02-q1',
      enunciado: 'Sobre o escalonamento FIFO, é correto afirmar:',
      alternativas: [
        { texto: 'É não preemptivo; usa uma única fila; um processo que sai de Bloqueado volta para o fim da fila de Apto.', correta: true, explicacao: 'Correto. No FIFO o processo só larga a CPU ao terminar, bloquear ou ceder; quem fica Apto (inclusive quem volta da E/S) entra no fim da fila.' },
        { texto: 'É preemptivo: cada processo executa no máximo um quantum e volta para o fim da fila.', correta: false, explicacao: 'Isso descreve o Round Robin (circular), que é o FIFO com quantum. O FIFO puro não tem fatia de tempo.' },
        { texto: 'Escolhe o processo com menor tempo de CPU, independentemente da ordem de chegada.', correta: false, explicacao: 'Esse é o SJF. O FIFO ignora o tempo de CPU e respeita apenas a ordem de chegada.' },
        { texto: 'Favorece os processos I/O-bound, pois eles chegam com mais frequência à fila.', correta: false, explicacao: 'É o contrário: o FIFO prejudica os I/O-bound, que ficam atrás de processos CPU-bound longos a cada vez que voltam da E/S.' },
      ],
    },
    {
      id: 'm07-a02-q2',
      enunciado: 'Os processos A, B, C e D, com tempos de CPU de 12, 8, 15 e 5 u.t., estão em Apto em t=0 e são executados por FIFO na ordem A, B, C, D, sem troca de contexto. Qual é o tempo médio de espera?',
      alternativas: [
        { texto: '16,75 u.t.', correta: true, explicacao: 'Correto. A começa em 0, B em 12, C em 20 e D em 35. Espera média = (0 + 12 + 20 + 35) / 4 = 67 / 4 = 16,75.<figure class="diagrama">' + gantt(FIFO_ABCD) + '</figure>' },
        { texto: '10,75 u.t.', correta: false, explicacao: '10,75 é a espera média com SJF (D, B, A, C). Em FIFO a ordem é a de chegada: A, B, C, D, com espera média de 16,75.' },
        { texto: '26,75 u.t.', correta: false, explicacao: 'Esse é o turnaround médio (12 + 20 + 35 + 40) / 4. O tempo de espera não inclui o tempo de execução: (0 + 12 + 20 + 35) / 4 = 16,75.' },
        { texto: '10 u.t.', correta: false, explicacao: '10 é a média dos tempos de CPU (40 / 4), não da espera. Cada processo espera o término de todos os que estão à frente: 0, 12, 20 e 35.' },
      ],
    },
    {
      id: 'm07-a02-q3',
      enunciado: 'Quatro processos estão em Apto em t=0: P1 = 10, P2 = 4, P3 = 7 e P4 = 2 u.t. de CPU. Com <strong>SJF</strong> e sem troca de contexto, qual é o tempo médio de espera?',
      alternativas: [
        { texto: '5,25 u.t.', correta: true, explicacao: 'Correto. Ordem SJF: P4 (0–2), P2 (2–6), P3 (6–13), P1 (13–23). Esperas: 0, 2, 6 e 13; média = 21 / 4 = 5,25.<figure class="diagrama">' + gantt(SJF_Q3) + '</figure>' },
        { texto: '11,25 u.t.', correta: false, explicacao: 'Essa é a média em FIFO na ordem P1, P2, P3, P4: esperas 0, 10, 14 e 21. Com SJF os curtos vão primeiro: média 5,25.' },
        { texto: '11 u.t.', correta: false, explicacao: '11 é o turnaround médio do SJF: (2 + 6 + 13 + 23) / 4. A espera não inclui o próprio tempo de execução: (0 + 2 + 6 + 13) / 4 = 5,25.' },
        { texto: '5,75 u.t.', correta: false, explicacao: 'Provável erro de soma ou de ordem. Refaça: P4 começa em 0, P2 em 2, P3 em 6 e P1 em 13; (0 + 2 + 6 + 13) / 4 = 5,25.' },
      ],
    },
    {
      id: 'm07-a02-q4',
      enunciado: 'Quatro processos, P1, P2, P3 e P4, aguardam em Apto e precisam de 8, 5, 2 e 7 u.t. de CPU, respectivamente. Em que ordem devem ser executados para <strong>minimizar o turnaround médio</strong>?',
      alternativas: [
        { texto: 'P3, P2, P4, P1 (turnaround médio de 11,25 u.t.).', correta: true, explicacao: 'Correto: menor tempo primeiro (SJF). Turnarounds: P3 = 2, P2 = 7, P4 = 14, P1 = 22; média 45 / 4 = 11,25. Na ordem original (P1, P2, P3, P4) seria (8 + 13 + 15 + 22) / 4 = 14,5.<figure class="diagrama">' + gantt(Q17) + '</figure>' },
        { texto: 'P1, P2, P3, P4 (ordem de chegada).', correta: false, explicacao: 'Essa é a ordem FIFO: turnarounds 8, 13, 15 e 22, média 14,5. Colocar primeiro o maior faz todos os outros esperarem por ele.' },
        { texto: 'P1, P4, P2, P3 (maior tempo primeiro).', correta: false, explicacao: 'Maior primeiro é a pior escolha: turnarounds 8, 15, 20 e 22, média 16,25. O tempo do primeiro processo é somado ao turnaround de todos.' },
        { texto: 'Qualquer ordem: o turnaround médio é sempre 22 u.t., pois o último termina sempre em 22.', correta: false, explicacao: 'O último processo termina sempre em 22, mas os outros terminam em instantes diferentes conforme a ordem. A média muda, e é mínima com o menor primeiro.' },
      ],
    },
    {
      id: 'm07-a02-q5',
      enunciado: 'Com <strong>SRTF</strong> (SJF preemptivo), sem troca de contexto: P1 chega em 0 com 7 u.t.; P2 em 1 com 3 u.t.; P3 em 2 com 8 u.t.; P4 em 4 com 2 u.t. Qual é o tempo médio de espera?',
      alternativas: [
        { texto: '3,75 u.t.', correta: true, explicacao: 'Correto. P1 (0–1), P2 (1–4), P4 (4–6), P1 (6–12), P3 (12–20). Esperas (término − chegada − CPU): P1 = 5, P2 = 0, P3 = 10, P4 = 0; média 15 / 4 = 3,75.<figure class="diagrama">' + gantt(SRTF) + '</figure>' },
        { texto: '5,25 u.t.', correta: false, explicacao: 'Esse é o resultado do SJF não preemptivo: P1 (0–7), P4, P2, P3. No SRTF, P2 toma a CPU de P1 em t=1, porque 3 é menor que os 6 que faltam a P1.' },
        { texto: '8,75 u.t.', correta: false, explicacao: 'Esse é o turnaround médio do SRTF: (12 + 3 + 18 + 2) / 4. Para a espera, subtraia o tempo de CPU de cada um: 15 / 4 = 3,75.' },
        { texto: '2,5 u.t.', correta: false, explicacao: 'Faltou parte da espera de algum processo. P3 chega em 2 e só começa em 12 (espera 10); P1 espera de 1 a 6 (5). Soma 15, média 3,75.' },
      ],
    },
    {
      id: 'm07-a02-q6',
      enunciado: 'Um processo teve previsão inicial τ<sub>0</sub> = 10 u.t. Seus dois surtos de CPU medidos foram t<sub>0</sub> = 6 e, depois, t<sub>1</sub> = 4. Com α = 0,5 e τ<sub>n+1</sub> = α·t<sub>n</sub> + (1 − α)·τ<sub>n</sub>, qual é a previsão τ<sub>2</sub> para o próximo surto?',
      alternativas: [
        { texto: '6 u.t.', correta: true, explicacao: 'Correto. τ<sub>1</sub> = 0,5·6 + 0,5·10 = 3 + 5 = 8. τ<sub>2</sub> = 0,5·4 + 0,5·8 = 2 + 4 = 6.' },
        { texto: '8 u.t.', correta: false, explicacao: '8 é τ<sub>1</sub>, a previsão depois do primeiro surto. Falta aplicar a fórmula com t<sub>1</sub> = 4: τ<sub>2</sub> = 0,5·4 + 0,5·8 = 6.' },
        { texto: '5 u.t.', correta: false, explicacao: '5 é a média simples dos dois surtos medidos (6 e 4), que ignora a previsão inicial. A média exponencial carrega o passado: τ<sub>2</sub> = 6.' },
        { texto: '4 u.t.', correta: false, explicacao: '4 seria a previsão com α = 1 (só o último surto conta). Com α = 0,5, presente e passado têm o mesmo peso: τ<sub>2</sub> = 6.' },
      ],
    },
    {
      id: 'm07-a02-q7',
      enunciado: 'Na previsão τ<sub>n+1</sub> = α·t<sub>n</sub> + (1 − α)·τ<sub>n</sub>, o que acontece com α = 0?',
      alternativas: [
        { texto: 'O último surto medido é ignorado: τ<sub>n+1</sub> = τ<sub>n</sub>, ou seja, só a história passada conta.', correta: true, explicacao: 'Correto. Com α = 0 o termo α·t<sub>n</sub> some, e a previsão nunca muda. Com α = 1 acontece o oposto: só o último surto conta.' },
        { texto: 'Só o último surto conta: τ<sub>n+1</sub> = t<sub>n</sub>.', correta: false, explicacao: 'Isso acontece com α = 1, quando (1 − α)·τ<sub>n</sub> vale zero.' },
        { texto: 'O último surto e a história passada têm o mesmo peso.', correta: false, explicacao: 'Pesos iguais acontecem com α = 0,5, o valor típico.' },
        { texto: 'A previsão vira sempre zero.', correta: false, explicacao: 'Com α = 0 a fórmula fica τ<sub>n+1</sub> = 1·τ<sub>n</sub>, que repete a previsão anterior, não zero.' },
      ],
    },
    {
      id: 'm07-a02-q8',
      enunciado: 'Por que se diz que o SJF é "ótimo"? Escolha a afirmação correta.',
      alternativas: [
        { texto: 'Ele dá o menor tempo médio de espera, desde que todos os processos estejam disponíveis ao mesmo tempo e os tempos de CPU sejam conhecidos.', correta: true, explicacao: 'Correto. Se processos chegam depois (contraexemplo do Tanenbaum: 4,6 contra 4,4) ou se os tempos são mal previstos, o SJF deixa de ser ótimo.' },
        { texto: 'Ele garante que nenhum processo sofra starvation.', correta: false, explicacao: 'O SJF pode causar starvation: se sempre chegarem processos curtos, um processo longo pode nunca executar.' },
        { texto: 'Ele dá o menor tempo de resposta em sistemas interativos sem precisar prever nada.', correta: false, explicacao: 'O SJF precisa conhecer ou prever o surto de CPU; em sistemas interativos isso é feito por média exponencial. E é não preemptivo, ruim para resposta.' },
        { texto: 'Ele minimiza a quantidade de trocas de contexto em qualquer cenário.', correta: false, explicacao: 'O critério otimizado pelo SJF é o tempo médio de espera (e de turnaround), não o número de trocas de contexto.' },
      ],
    },
    {
      id: 'm07-a02-q9',
      enunciado: 'Um processo CPU-bound executa 1 s antes de cada leitura de disco, e vários processos I/O-bound precisam de 1.000 leituras cada. Com FIFO, o que acontece?',
      alternativas: [
        { texto: 'Os I/O-bound demoram muito: a cada leitura esperam o CPU-bound usar a CPU por 1 s, levando cerca de 1.000 s para terminar.', correta: true, explicacao: 'Correto, é o exemplo do Tanenbaum. O FIFO prejudica os I/O-bound. Com preempção a cada 10 ms, eles terminariam em cerca de 10 s.' },
        { texto: 'Os I/O-bound terminam primeiro, porque o FIFO favorece surtos curtos.', correta: false, explicacao: 'O FIFO não olha o tamanho do surto, só a ordem de chegada. Quem favorece surtos curtos é o SJF.' },
        { texto: 'O CPU-bound sofre preempção a cada leitura dos I/O-bound.', correta: false, explicacao: 'O FIFO é não preemptivo: o CPU-bound só larga a CPU quando bloqueia para ler o disco ou termina.' },
        { texto: 'Nada muda em relação a qualquer outro algoritmo, pois o tempo total de CPU é o mesmo.', correta: false, explicacao: 'O tempo total de CPU é o mesmo, mas a ordem muda muito o tempo de espera e o turnaround de cada processo.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm07-a02-d1',
      enunciado: 'Como funcionam os algoritmos SJF e de prioridades? Compare os dois.',
      respostaModelo: `<p><strong>SJF (Shortest Job First):</strong> o escalonador escolhe, entre os processos em Apto, o que tem o <strong>menor tempo de CPU</strong> a executar. Na forma clássica é não preemptivo. Dá o menor tempo médio de espera quando todos os processos estão disponíveis ao mesmo tempo e favorece os I/O-bound. A dificuldade é saber o tempo de CPU com antecedência: em lote ele é conhecido; nos outros casos é previsto por média exponencial (τ<sub>n+1</sub> = α·t<sub>n</sub> + (1 − α)·τ<sub>n</sub>). Pode causar starvation dos processos longos. Sua versão preemptiva é o SRTF (menor tempo restante).</p>
<p><strong>Prioridades:</strong> cada processo recebe um valor de <strong>prioridade</strong>; o processo Apto de maior prioridade é sempre o escolhido, e processos de mesma prioridade seguem FIFO. Normalmente é preemptivo (preempção por prioridade: se chega em Apto um processo mais prioritário, o atual perde a CPU). A prioridade pode ser estática ou dinâmica. O risco é a starvation dos processos de baixa prioridade, resolvida com aging (aumentar a prioridade de quem espera muito).</p>`,
      pontosChave: [
        'SJF escolhe o menor tempo de CPU (não preemptivo na forma clássica)',
        'SJF minimiza o tempo médio de espera, mas exige conhecer ou prever o tempo de CPU',
        'Prioridades: executa o Apto de maior prioridade; iguais seguem FIFO; em geral preemptivo',
        'Citou starvation (e aging como solução)',
      ],
    },
  ],
});
})();
