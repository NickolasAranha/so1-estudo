// Módulo 7, aula 4: prioridades, starvation e aging, múltiplas filas com realimentação, adaptativo, tempo real, UNIX.
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

var PRIO = { procs: ['P1', 'P2', 'P3', 'P4'], chegada: { P2: 2, P3: 3, P4: 5 }, cpu: [['P1', 0, 2], ['P2', 2, 5], ['P4', 5, 7], ['P3', 7, 11], ['P1', 11, 15]], rotulo: 'Prioridade preemptiva com chegadas' };

// Tabela da questão 13 reescrita (intervalos de 5 ms). E = execução, P = pronto, W = espera.
var TAB13 = (function () {
  var cel = function (tag, s) { return '<' + tag + ' style="padding:4px 8px;border:1px solid var(--linha);text-align:center">' + s + '</' + tag + '>'; };
  var linha = function (tag, itens) { return '<tr>' + itens.map(function (s) { return cel(tag, s); }).join('') + '</tr>'; };
  return '<div style="overflow-x:auto"><table style="border-collapse:collapse;margin:8px 0">'
    + linha('th', ['Início do intervalo (ms)', '0', '5', '10', '15', '20', '25', '30', '35', '40'])
    + linha('td', ['<strong>A</strong> (menos prioritário)', 'E', 'P', 'P', 'E', 'W', 'W', 'E', 'P', 'E'])
    + linha('td', ['<strong>B</strong> (mais prioritário)', 'W', 'E', 'E', 'W', 'E', 'E', 'W', 'E', 'W'])
    + '</table></div>';
})();

SO1.registerLesson({
  id: 'm07-a04',
  titulo: 'Prioridades e múltiplas filas',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.4.3 (p.93–95): escalonamento por prioridades, classes de prioridade (Fig. 2.34), filas múltiplas (CTSS); §2.4.4 (p.96–97): tempo real e escalonabilidade',
    'Slides cap4 (Oliveira/Carissimi/Toscani, UFRGS): prioridades estática x dinâmica, problemas com prioridades, múltiplas filas com realimentação, escalonamento UNIX, tempo real',
    'Machado & Maia, Arquitetura de SO (escalonamento adaptativo, preempção por tempo x por prioridade)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a triagem do pronto-socorro.</strong> Quem chega com infarto é atendido antes de quem tem uma torção, mesmo tendo chegado depois: isso é <strong>prioridade</strong>. Se um caso grave chega enquanto o médico atende um leve, o médico interrompe o leve: <strong>preempção por prioridade</strong>. E se ninguém olhar para a fila, quem tem uma dor leve pode passar o dia sem atendimento (<strong>starvation</strong>); por isso, quem espera demais vai "subindo de cor" (<strong>aging</strong>).</p>
</div>

<h2>Escalonamento por prioridades</h2>
<p>O Round Robin supõe que todos os processos são igualmente importantes. No escalonamento por <strong>prioridades</strong>, cada processo recebe um valor de prioridade e o escalonador <strong>sempre escolhe o processo Apto de maior prioridade</strong>; processos de mesma prioridade seguem FIFO (ou RR).</p>
<ul>
  <li><strong>Preemptivo</strong> (o caso usual): sempre que entra em Apto um processo de prioridade <strong>maior</strong> que a do que está executando, ocorre <strong>preempção</strong>. Os slides dizem que o escalonamento com prioridades é "inerente à preempção", mas que também existe prioridade não preemptiva.</li>
  <li>Implementação: <strong>uma fila de Apto para cada prioridade</strong>; cada fila pode ter sua própria política (FIFO, SJF, RR).</li>
  <li>Uso típico: dar prioridade aos I/O-bound, para compensar o tempo que passam esperando.</li>
</ul>

<h3>Preempção por tempo x preempção por prioridade</h3>
<table>
  <tr><th>Tipo</th><th>O processo perde a CPU porque...</th><th>Onde aparece</th></tr>
  <tr><td><strong>Por tempo</strong></td><td>sua <strong>fatia de tempo (quantum) acabou</strong> (interrupção de relógio).</td><td>Round Robin</td></tr>
  <tr><td><strong>Por prioridade</strong></td><td>entrou em Apto um processo de <strong>prioridade maior</strong>.</td><td>Prioridades preemptivas, tempo real</td></tr>
</table>

<h3>Prioridade estática x dinâmica</h3>
<ul>
  <li><strong>Estática:</strong> definida na criação do processo e mantida por toda a sua vida. Ex. do Tanenbaum: num computador militar, processos de generais com prioridade 100, coronéis 90, majores 80... O comando UNIX <code>nice</code> permite ao usuário <em>reduzir</em> a prioridade do próprio processo.</li>
  <li><strong>Dinâmica:</strong> ajustada pelo SO conforme o comportamento do processo ou do sistema. Ex.: prioridade = <strong>1/f</strong>, onde f é a fração do último quantum que o processo usou. Nos slides, com quantum de 100 ms: quem usou 2 ms (f = 0,02) recebe prioridade 1/0,02 = <strong>50</strong>; quem usou 50 ms (f = 0,5) recebe 1/0,5 = <strong>2</strong>. Quem usa pouco a CPU (I/O-bound) sobe; quem usa muito (CPU-bound) desce.</li>
</ul>

<h3>Problemas: starvation e aging</h3>
<p>Com prioridades, um processo de baixa prioridade pode <strong>nunca executar</strong> enquanto houver processos mais prioritários: é a <strong>starvation</strong> (postergação indefinida, inanição). Outro problema: um processo que muda de comportamento (de CPU-bound para I/O-bound) fica mal classificado. Soluções:</p>
<ul>
  <li><strong>Aging</strong> (envelhecimento): aumentar aos poucos a prioridade de quem espera muito tempo.</li>
  <li>Reduzir a prioridade do processo em execução a cada tique de relógio, ou dar a cada processo um quantum máximo (Tanenbaum).</li>
  <li><strong>Múltiplas filas com realimentação</strong>, a seguir.</li>
</ul>

<h2>Múltiplas filas com realimentação</h2>
<figure class="diagrama">
  <svg viewBox="0 0 540 230" style="max-width:640px" role="img" aria-label="Múltiplas filas com realimentação: quem esgota o quantum desce de fila">
    <g font-size="12" fill="currentColor">
      <text x="10" y="20" font-weight="bold">Fila</text><text x="130" y="20" font-weight="bold">Processos Aptos</text><text x="440" y="20" font-weight="bold">Quantum</text>
      <text x="10" y="52">0 (maior)</text><text x="10" y="102">1</text><text x="10" y="152">2</text><text x="10" y="202">n (menor)</text>
      <text x="440" y="52">pequeno (1)</text><text x="440" y="102">2</text><text x="440" y="152">4</text><text x="440" y="202">grande (RR/FIFO)</text>
    </g>
    <g>
      <rect x="90" y="34" width="34" height="26" rx="3" style="fill:var(--azul-claro);stroke:var(--azul)"/><rect x="134" y="34" width="34" height="26" rx="3" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <rect x="90" y="84" width="34" height="26" rx="3" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <rect x="90" y="134" width="34" height="26" rx="3" style="fill:var(--azul-claro);stroke:var(--azul)"/><rect x="134" y="134" width="34" height="26" rx="3" style="fill:var(--azul-claro);stroke:var(--azul)"/><rect x="178" y="134" width="34" height="26" rx="3" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <rect x="90" y="184" width="34" height="26" rx="3" style="fill:var(--azul-claro);stroke:var(--azul)"/><rect x="134" y="184" width="34" height="26" rx="3" style="fill:var(--azul-claro);stroke:var(--azul)"/>
    </g>
    <g fill="none" stroke-width="1.5">
      <path d="M260 47 C300 60 300 85 262 95" style="stroke:var(--ambar)"/><path d="M260 97 C300 110 300 135 262 145" style="stroke:var(--ambar)"/><path d="M260 147 C300 160 300 185 262 195" style="stroke:var(--ambar)"/>
      <path d="M350 195 C380 150 380 90 350 52" style="stroke:var(--verde)" stroke-dasharray="4 3"/><path d="M346 56 l4 -6 2 7" style="stroke:var(--verde)"/>
    </g>
    <g font-size="11">
      <text x="254" y="75" text-anchor="end" style="fill:var(--ambar)">esgotou o</text><text x="254" y="88" text-anchor="end" style="fill:var(--ambar)">quantum: desce</text>
      <text x="254" y="180" text-anchor="end" style="fill:var(--ambar)">desce</text>
      <text x="384" y="124" style="fill:var(--verde)">aging:</text><text x="384" y="137" style="fill:var(--verde)">sobe</text>
    </g>
  </svg>
  <figcaption>O escalonador só atende uma fila quando as de maior prioridade estão vazias. Quem gasta o quantum inteiro (CPU-bound) desce; quem bloqueia antes (I/O-bound) permanece em cima; o aging promove quem espera muito.</figcaption>
</figure>
<ul>
  <li>Baseado em <strong>prioridades dinâmicas</strong>: há várias filas de Apto, cada uma com uma prioridade, e o processo <strong>pode trocar de fila</strong> conforme seu uso de CPU.</li>
  <li>Filas de maior prioridade têm quantum <strong>menor</strong>. Quem esgota o quantum desce para uma fila de menor prioridade e quantum maior.</li>
  <li><strong>Favorece os I/O-bound</strong>: eles quase nunca esgotam o quantum, portanto raramente sofrem preempção por tempo e permanecem nas filas de alta prioridade; os CPU-bound vão para as filas de baixo.</li>
  <li>O <strong>aging</strong> evita a postergação indefinida dos processos das filas inferiores.</li>
</ul>
<p>Origem histórica (Tanenbaum): no <strong>CTSS</strong> (MIT, IBM 7094), cada troca de processo exigia levar o processo para o disco. A solução foi criar classes: a mais alta executava 1 quantum, a seguinte 2, depois 4, 8... Um processo que precisasse de 100 quanta executaria 1, 2, 4, 8, 16, 32 e 64 quanta (usando só 37 dos últimos 64), com apenas <strong>7 trocas</strong> em vez de 100.</p>

<h2>Escalonamento adaptativo</h2>
<p>É um mecanismo em que o SO <strong>identifica o comportamento</strong> dos processos durante a execução (CPU-bound, I/O-bound, interativo) e <strong>adapta dinamicamente</strong> as políticas de escalonamento a eles. As múltiplas filas com realimentação são um exemplo.</p>

<h2>Tempo real</h2>
<ul>
  <li><strong>Tempo real crítico</strong> (<em>hard real-time</em>): uma tarefa crítica <strong>precisa</strong> terminar dentro de um prazo absoluto (ex.: piloto automático, controle de usina).</li>
  <li><strong>Tempo real não crítico</strong> (<em>soft real-time</em>): perder um prazo de vez em quando é tolerável, mas o processo crítico deve receber prioridade maior que os outros (ex.: áudio e vídeo).</li>
  <li>Exigem <strong>escalonamento por prioridades com preempção por prioridade</strong>: a prioridade é dada pela importância da tarefa, e a preempção garante que um processo crítico seja escalonado <strong>imediatamente</strong> quando fica Apto. As prioridades de tempo real normalmente não mudam dinamicamente.</li>
  <li>Eventos podem ser <strong>periódicos</strong> ou <strong>aperiódicos</strong>. Com m eventos periódicos, o evento i com período P<sub>i</sub> e C<sub>i</sub> segundos de CPU, o sistema é <strong>escalonável</strong> se Σ C<sub>i</sub>/P<sub>i</sub> ≤ 1. Exemplo do Tanenbaum: períodos de 100, 200 e 500 ms com 50, 30 e 100 ms de CPU → 0,5 + 0,15 + 0,2 = 0,85 ≤ 1.</li>
  <li>Os algoritmos podem ser <strong>estáticos</strong> (decidem antes de o sistema começar a executar) ou <strong>dinâmicos</strong> (decidem durante a execução).</li>
</ul>

<h2>Exemplo: escalonamento no UNIX</h2>
<ul>
  <li><strong>Múltiplas filas com realimentação</strong>, com <strong>Round Robin</strong> em cada fila.</li>
  <li>Prioridades de <strong>0 a 127</strong>: <strong>quanto menor o número, maior a prioridade</strong>. 0–49: processos do núcleo; 50–127: processos de usuário.</li>
  <li>As prioridades são <strong>reavaliadas uma vez por segundo</strong>, em função da prioridade atual, da prioridade do usuário, do uso recente da CPU e do fator <strong>nice</strong>. A troca dinâmica respeita a faixa do tipo de usuário.</li>
  <li>Ordem decrescente de prioridade: swapper; controle de dispositivos de E/S de bloco; manipulação de arquivos; controle de dispositivos de E/S de caractere; processos de usuário.</li>
</ul>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: lendo uma tabela de prioridades (versão da questão 13 da lista).</strong> A e B disputam uma CPU; a avaliação ocorre a cada 5 ms; E = execução, P = pronto (Apto), W = espera (Bloqueado). <strong>A tem menor prioridade que B.</strong></p>
  ${TAB13}
  <table>
    <tr><th>Instante</th><th>Transição</th><th>Interpretação</th></tr>
    <tr><td>5</td><td>A: E → P; B: W → E</td><td>B ficou Apto e é mais prioritário: <strong>A sofre preempção por prioridade</strong>.</td></tr>
    <tr><td>15</td><td>A: P → E; B: E → W</td><td>B bloqueou por conta própria (não é preempção); A volta a executar.</td></tr>
    <tr><td>20</td><td>A: E → W; B: W → E</td><td>A <strong>bloqueou</strong> (foi para W, não para P): não é preempção.</td></tr>
    <tr><td>30</td><td>A: W → E; B: E → W</td><td>B bloqueou. Na granularidade de 5 ms, a E/S de A termina em 30: A passa por Apto instantaneamente e executa porque B bloqueou nesse mesmo instante.</td></tr>
    <tr><td>35</td><td>A: E → P; B: W → E</td><td>De novo <strong>preempção de A</strong>, pela volta de B.</td></tr>
    <tr><td>40</td><td>A: P → E; B: E → W</td><td>B bloqueou; A executa.</td></tr>
  </table>
  <p>Resultado: A sofre preempção em <strong>5 ms e 35 ms</strong>. B <strong>nunca</strong> sofre preempção: sendo o mais prioritário, só sai da CPU quando ele mesmo bloqueia. Preempção é sempre <strong>E → P</strong>; uma passagem E → W é bloqueio.</p>
  <p>Agora com prioridade numérica e chegadas (quanto <strong>maior</strong> o número, maior a prioridade; preemptivo; sem troca de contexto): P1 (chega em 0, 6 u.t., prioridade 2), P2 (2, 3 u.t., prioridade 4), P3 (3, 4 u.t., prioridade 3), P4 (5, 2 u.t., prioridade 5).</p>
  <figure class="diagrama">${gantt(PRIO)}
  <figcaption>Em 2, P2 (4) toma a CPU de P1 (2). Em 3, P3 (3) chega mas é menos prioritário que P2. Em 5, P2 termina e P4 (5) chega e executa. Depois P3 (7–11) e, por último, P1 (11–15).</figcaption></figure>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>Múltiplas filas com realimentação <strong>favorecem os I/O-bound</strong> (eles não esgotam o quantum e ficam nas filas altas).</li>
    <li>Preempção por <strong>tempo</strong> = acabou o quantum; por <strong>prioridade</strong> = chegou alguém mais importante. O escalonamento por prioridades puro não usa fatia de tempo.</li>
    <li>No <strong>UNIX</strong>, número <strong>menor</strong> = prioridade <strong>maior</strong>. Em exercícios, leia sempre qual convenção o enunciado usa.</li>
    <li>Starvation é a consequência; <strong>aging</strong> é a solução. Não confunda com o aging da estimativa de surto do SJF (aula 2), que é a média exponencial.</li>
    <li>Tempo real exige <strong>prioridade com preempção</strong>, não Round Robin: o RR faria a tarefa crítica esperar a vez dos outros.</li>
  </ul>
</div>
`,
  resumo: 'No escalonamento por prioridades executa sempre o processo Apto de maior prioridade, em geral com preempção por prioridade (diferente da preempção por tempo do RR). A prioridade pode ser estática ou dinâmica (ex.: 1/f); o risco é a starvation, resolvida com aging. Múltiplas filas com realimentação usam prioridades dinâmicas: quem esgota o quantum desce, e por isso os I/O-bound são favorecidos. O escalonamento adaptativo ajusta a política ao comportamento dos processos; tempo real exige prioridades com preempção; o UNIX usa filas com realimentação, RR em cada fila e prioridades 0–127 (menor número, maior prioridade).',
  questoes: [
    {
      id: 'm07-a04-q1',
      enunciado: 'Como a preempção por tempo se diferencia da preempção por prioridade?',
      alternativas: [
        { texto: 'Por tempo: o SO tira a CPU porque a fatia de tempo do processo acabou. Por prioridade: tira porque entrou em Apto um processo de prioridade maior.', correta: true, explicacao: 'Correto. A primeira é disparada pela interrupção de relógio (Round Robin); a segunda, pela chegada de um processo mais importante (prioridades preemptivas).' },
        { texto: 'Por tempo: o processo bloqueia esperando E/S. Por prioridade: o processo termina.', correta: false, explicacao: 'Bloquear ou terminar não é preempção: preempção é retirar a CPU de quem ainda podia continuar executando.' },
        { texto: 'São a mesma coisa; só muda o nome conforme o livro.', correta: false, explicacao: 'O motivo é diferente: na preempção por tempo ninguém mais importante precisa chegar; basta o quantum acabar.' },
        { texto: 'Por prioridade só existe em sistemas não preemptivos.', correta: false, explicacao: 'Toda preempção, por definição, ocorre em escalonamento preemptivo.' },
      ],
    },
    {
      id: 'm07-a04-q2',
      enunciado: 'O que caracteriza um escalonamento adaptativo?',
      alternativas: [
        { texto: 'Aquele em que o SO identifica o comportamento dos processos durante a execução e adapta dinamicamente as políticas de escalonamento.', correta: true, explicacao: 'Correto. Exemplo: múltiplas filas com realimentação, em que o processo muda de fila conforme se mostra CPU-bound ou I/O-bound.' },
        { texto: 'Aquele em que o usuário escolhe o algoritmo de escalonamento a cada execução.', correta: false, explicacao: 'No adaptativo quem observa e ajusta é o próprio SO, automaticamente.' },
        { texto: 'Aquele em que as prioridades são fixas desde a criação do processo.', correta: false, explicacao: 'Isso é prioridade estática, justamente o oposto de adaptar.' },
        { texto: 'Aquele que só funciona em sistemas com mais de um processador.', correta: false, explicacao: 'Adaptar a política ao comportamento dos processos não depende do número de processadores.' },
      ],
    },
    {
      id: 'm07-a04-q3',
      enunciado: 'Que tipo de escalonamento é necessário para aplicações de tempo real?',
      alternativas: [
        { texto: 'Escalonamento por prioridades com preempção por prioridade, para que um processo crítico execute imediatamente quando fica Apto.', correta: true, explicacao: 'Correto. A prioridade reflete a importância da tarefa, e a preempção garante atendimento imediato; nos sistemas críticos os prazos têm que ser cumpridos.' },
        { texto: 'Round Robin com quantum pequeno, para que todos recebam CPU de forma justa.', correta: false, explicacao: 'Justiça não é o objetivo em tempo real: a tarefa crítica não pode esperar a vez dos outros processos.' },
        { texto: 'FIFO, porque é previsível.', correta: false, explicacao: 'O FIFO é não preemptivo: uma tarefa crítica poderia ficar esperando um processo longo terminar.' },
        { texto: 'SJF, porque minimiza o tempo médio de espera.', correta: false, explicacao: 'Tempo real não quer o melhor tempo médio, e sim cumprir prazos de tarefas específicas, independentemente do tamanho delas.' },
      ],
    },
    {
      id: 'm07-a04-q4',
      enunciado: 'Entre processos CPU-bound e I/O-bound, quais são beneficiados pelas múltiplas filas com realimentação?',
      alternativas: [
        { texto: 'I/O-bound: como raramente esgotam o quantum, quase não sofrem preempção por tempo e permanecem nas filas de alta prioridade.', correta: true, explicacao: 'Correto. Os CPU-bound esgotam o quantum, descem de fila e acabam nas filas de baixa prioridade.' },
        { texto: 'CPU-bound: como usam o quantum inteiro, sobem para as filas de maior prioridade.', correta: false, explicacao: 'É o contrário: quem esgota o quantum desce. Os CPU-bound ganham quanta maiores nas filas de baixo, mas prioridade menor.' },
        { texto: 'Nenhum dos dois: todos recebem o mesmo quantum na mesma fila.', correta: false, explicacao: 'Isso descreve o Round Robin puro. Na realimentação, os processos mudam de fila conforme o uso de CPU.' },
        { texto: 'CPU-bound, porque as filas de baixa prioridade são atendidas primeiro.', correta: false, explicacao: 'As filas de maior prioridade são atendidas primeiro; as de baixo só quando as de cima estão vazias.' },
      ],
    },
    {
      id: 'm07-a04-q5',
      enunciado: 'Escalonamento por prioridades, avaliado a cada 5 ms; A tem <strong>menor</strong> prioridade que B (E = execução, P = pronto, W = espera). Em que instantes <strong>A sofre preempção</strong>?' + TAB13,
      alternativas: [
        { texto: 'Em 5 ms e em 35 ms.', correta: true, explicacao: 'Correto. Preempção é passar de E para P. Isso acontece com A em 5 (B voltou a Apto) e em 35 (de novo). Em 20, A passa de E para W: é bloqueio, não preempção.' },
        { texto: 'Em 5, 20 e 35 ms.', correta: false, explicacao: 'Em 20 A vai de E para W (espera): ele mesmo bloqueou para E/S. Só conta como preempção a passagem E → P.' },
        { texto: 'Em 15 e 40 ms.', correta: false, explicacao: 'Em 15 e 40 A passa de P para E: ele ganha a CPU, não perde.' },
        { texto: 'A nunca sofre preempção.', correta: false, explicacao: 'Em 5 e 35 A estava executando e queria continuar (foi para P), mas B, mais prioritário, ficou Apto e tomou a CPU.' },
      ],
    },
    {
      id: 'm07-a04-q6',
      enunciado: 'Na mesma tabela (A menos prioritário que B), em que instantes <strong>B sofre preempção</strong>?' + TAB13,
      alternativas: [
        { texto: 'Nunca: B só sai da CPU quando ele mesmo bloqueia (E → W).', correta: true, explicacao: 'Correto. B é o mais prioritário, então ninguém pode tirá-lo da CPU. Todas as saídas de B (15, 30, 40) são E → W, ou seja, bloqueios.' },
        { texto: 'Em 15, 30 e 40 ms.', correta: false, explicacao: 'Nesses instantes B vai de E para W: ele bloqueia por conta própria. Preempção exigiria E → P.' },
        { texto: 'Em 5 e 35 ms.', correta: false, explicacao: 'Nesses instantes quem sofre preempção é A. B ganha a CPU.' },
        { texto: 'Em 20 ms.', correta: false, explicacao: 'Em 20 B passa de W para E: ele volta a executar.' },
      ],
    },
    {
      id: 'm07-a04-q7',
      enunciado: 'O que é starvation no escalonamento por prioridades e como é resolvida?',
      alternativas: [
        { texto: 'Um processo de baixa prioridade nunca executa porque sempre há outros mais prioritários; resolve-se com aging, aumentando a prioridade de quem espera muito.', correta: true, explicacao: 'Correto. Starvation (postergação indefinida) é a consequência; aging (envelhecimento) é a solução usada, por exemplo, nas múltiplas filas com realimentação.' },
        { texto: 'Dois processos esperam um pelo outro para sempre; resolve-se com prioridades estáticas.', correta: false, explicacao: 'Esperar um pelo outro em ciclo é deadlock (Módulo 6). Starvation é um processo ser sempre preterido.' },
        { texto: 'A CPU fica ociosa por falta de processos; resolve-se aumentando o quantum.', correta: false, explicacao: 'CPU ociosa não é starvation. Starvation é ter um processo pronto que nunca é escolhido.' },
        { texto: 'Um processo de alta prioridade perde a CPU; resolve-se reduzindo a prioridade dos outros.', correta: false, explicacao: 'O problema atinge os processos de baixa prioridade, que podem nunca receber a CPU.' },
      ],
    },
    {
      id: 'm07-a04-q8',
      enunciado: 'Um sistema usa prioridade dinâmica = 1/f, onde f é a fração do último quantum que o processo usou. Com quantum de 100 ms, o processo X usou 2 ms e o processo Y usou 50 ms. Quais as novas prioridades?',
      alternativas: [
        { texto: 'X = 50 e Y = 2.', correta: true, explicacao: 'Correto. X: f = 2/100 = 0,02 → 1/0,02 = 50. Y: f = 50/100 = 0,5 → 1/0,5 = 2. Quem usa pouco a CPU (I/O-bound) ganha prioridade alta.' },
        { texto: 'X = 2 e Y = 50.', correta: false, explicacao: 'Foram usados os milissegundos no lugar de 1/f. A fórmula dá prioridade alta a quem usou pouca CPU: X = 50, Y = 2.' },
        { texto: 'X = 0,02 e Y = 0,5.', correta: false, explicacao: 'Esses são os valores de f (fração usada). A prioridade é o inverso: 1/f.' },
        { texto: 'As duas ficam iguais, pois o quantum é o mesmo.', correta: false, explicacao: 'O quantum é o mesmo, mas a fração usada é diferente, e é ela que define a prioridade dinâmica.' },
      ],
    },
    {
      id: 'm07-a04-q9',
      enunciado: 'Prioridade preemptiva (quanto <strong>maior</strong> o número, maior a prioridade), sem troca de contexto: P1 chega em 0 (6 u.t., prioridade 2); P2 em 2 (3 u.t., prioridade 4); P3 em 3 (4 u.t., prioridade 3); P4 em 5 (2 u.t., prioridade 5). Quando P1 termina?',
      alternativas: [
        { texto: 'Em 15.', correta: true, explicacao: 'Correto. P1 (0–2); P2 chega e toma a CPU (2–5); P4 chega quando P2 termina (5–7); P3 (7–11); P1 executa os 4 u.t. que faltam (11–15).<figure class="diagrama">' + gantt(PRIO) + '</figure>' },
        { texto: 'Em 6.', correta: false, explicacao: 'Seria assim sem preempção: P1 executaria de 0 a 6. Com preempção, P2 (prioridade 4) tira a CPU de P1 em t=2.' },
        { texto: 'Em 11.', correta: false, explicacao: 'Em 11 termina P3, que tem prioridade 3, maior que a de P1 (2). P1 só volta depois e termina em 15.' },
        { texto: 'Em 9.', correta: false, explicacao: 'Faltou contar algum processo mais prioritário. Depois de t=2, P2, P4 e P3 executam antes de P1: 3 + 2 + 4 = 9 u.t.; P1 termina em 2 + 9 + 4 = 15.' },
      ],
    },
    {
      id: 'm07-a04-q10',
      enunciado: 'Um sistema de tempo real tem três eventos periódicos, com períodos de 100, 200 e 500 ms, que exigem 50, 30 e 100 ms de CPU por ocorrência. O sistema é escalonável?',
      alternativas: [
        { texto: 'Sim: 50/100 + 30/200 + 100/500 = 0,5 + 0,15 + 0,2 = 0,85 ≤ 1.', correta: true, explicacao: 'Correto, é o exemplo do Tanenbaum. A carga é escalonável se a soma de C<sub>i</sub>/P<sub>i</sub> não passa de 1 (desprezando o custo da troca de contexto).' },
        { texto: 'Não: 50 + 30 + 100 = 180 ms, maior que o menor período (100 ms).', correta: false, explicacao: 'Não se compara a soma bruta com um período: cada evento ocorre com frequência diferente. O critério é a fração de CPU de cada um: Σ C<sub>i</sub>/P<sub>i</sub> = 0,85.' },
        { texto: 'Não: 0,5 + 0,15 + 0,2 = 1,15 > 1.', correta: false, explicacao: 'Erro de soma: 0,5 + 0,15 + 0,2 = 0,85, que é menor que 1.' },
        { texto: 'Não dá para saber sem conhecer o quantum.', correta: false, explicacao: 'O teste de escalonabilidade de eventos periódicos usa só C<sub>i</sub> e P<sub>i</sub>; o quantum não entra.' },
      ],
    },
    {
      id: 'm07-a04-q11',
      enunciado: 'No escalonamento do UNIX descrito nos slides, é correto afirmar:',
      alternativas: [
        { texto: 'As prioridades vão de 0 a 127, e quanto menor o número, maior a prioridade; 0–49 são do núcleo e 50–127 de usuário.', correta: true, explicacao: 'Correto. O UNIX usa múltiplas filas com realimentação e RR em cada fila, reavaliando as prioridades uma vez por segundo (prioridade atual, do usuário, uso recente de CPU e nice).' },
        { texto: 'Quanto maior o número, maior a prioridade; processos de usuário ficam entre 0 e 49.', correta: false, explicacao: 'No UNIX a escala é invertida: número menor = prioridade maior. A faixa 0–49 é do núcleo.' },
        { texto: 'Usa FIFO puro, sem prioridades.', correta: false, explicacao: 'O UNIX usa múltiplas filas com realimentação, com Round Robin em cada fila.' },
        { texto: 'As prioridades são estáticas e nunca são reavaliadas.', correta: false, explicacao: 'São dinâmicas: reavaliadas uma vez por segundo, respeitando a faixa do tipo de usuário.' },
      ],
    },
    {
      id: 'm07-a04-q12',
      enunciado: 'No CTSS, a classe mais alta executava 1 quantum, a seguinte 2, depois 4, 8, 16... Quantas vezes um processo que precisa de 100 quanta é levado para a CPU?',
      alternativas: [
        { texto: '7 vezes (1 + 2 + 4 + 8 + 16 + 32 = 63; a 7ª vez, de 64 quanta, completa os 100).', correta: true, explicacao: 'Correto, é o exemplo do Tanenbaum: na última vez ele usa só 37 dos 64 quanta. Com quanta fixos seriam 100 trocas.' },
        { texto: '100 vezes.', correta: false, explicacao: 'Seria assim com um quantum fixo de 1. As filas múltiplas dobram o quantum a cada descida justamente para reduzir as trocas.' },
        { texto: '6 vezes.', correta: false, explicacao: 'Depois de 6 vezes (1 + 2 + 4 + 8 + 16 + 32) ele executou só 63 quanta; falta uma 7ª vez.' },
        { texto: '10 vezes.', correta: false, explicacao: 'Some as fatias dobradas: 1, 2, 4, 8, 16, 32 dá 63; com a 7ª (64), passa de 100. São 7 vezes.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm07-a04-d1',
      enunciado: 'Múltiplas filas com realimentação beneficiam mais os processos CPU-bound ou os I/O-bound? Explique por quê.',
      respostaModelo: `<p>Favorece os processos <strong>I/O-bound</strong>.</p>
<p>Nesse esquema há várias filas de Apto com prioridades diferentes; as filas de maior prioridade têm quantum menor e são atendidas primeiro. A prioridade é <strong>dinâmica</strong>: o processo que <strong>esgota o quantum</strong> sofre preempção por tempo e desce para uma fila de prioridade menor.</p>
<p>Os I/O-bound usam a CPU por pouco tempo e bloqueiam para E/S antes de o quantum acabar. A probabilidade de sofrerem preempção por tempo é baixa, então tendem a <strong>permanecer nas filas de alta prioridade</strong>. Os CPU-bound esgotam o quantum repetidamente e se posicionam nas filas de baixa prioridade. Para evitar a starvation destes, usa-se aging.</p>`,
      pontosChave: [
        'Respondeu I/O-bound',
        'Explicou que quem esgota o quantum desce de fila (prioridade dinâmica)',
        'Explicou que I/O-bound bloqueiam antes do fim do quantum e ficam nas filas altas',
        'Citou que CPU-bound vão para as filas baixas (e/ou aging contra starvation)',
      ],
    },
    {
      id: 'm07-a04-d2',
      enunciado: 'Compare preempção por tempo e preempção por prioridade, citando um algoritmo que usa cada uma.',
      respostaModelo: `<p><strong>Preempção por tempo:</strong> o SO interrompe o processo em execução porque sua <strong>fatia de tempo (quantum) expirou</strong>, detectada por uma interrupção de relógio, e o devolve ao fim da fila de Apto. Exemplo: Round Robin (circular).</p>
<p><strong>Preempção por prioridade:</strong> o SO interrompe o processo em execução porque <strong>entrou em Apto um processo de prioridade maior</strong>. Exemplo: escalonamento por prioridades preemptivo, usado em sistemas de tempo real.</p>
<p>Em ambos os casos o processo ainda podia continuar executando e volta para Apto, o que diferencia a preempção do bloqueio ou do término.</p>`,
      pontosChave: [
        'Por tempo: fim do quantum (interrupção de relógio)',
        'Por prioridade: chegada em Apto de processo mais prioritário',
        'Exemplos corretos: Round Robin para tempo; prioridades preemptivas ou tempo real para prioridade',
      ],
    },
  ],
});
})();
