// Módulo 7, aula 3: Round Robin (circular) e o efeito do quantum.
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

var RR5 = { procs: ['A', 'B', 'C', 'D'], cpu: [['A', 0, 5], ['B', 5, 10], ['C', 10, 15], ['D', 15, 20], ['A', 20, 25], ['B', 25, 28], ['C', 28, 33], ['A', 33, 35], ['C', 35, 40]], rotulo: 'Round Robin com quantum 5' };
var OVER = { procs: ['A', 'B'], cpu: [['tc', 0, 1], ['A', 1, 10], ['tc', 10, 11], ['B', 11, 20], ['tc', 20, 21], ['A', 21, 30]], rotulo: 'Quantum de 9 com troca de 1' };

SO1.registerLesson({
  id: 'm07-a03',
  titulo: 'Round Robin',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.4.3 (p.93): escalonamento por chaveamento circular (round-robin), Fig. 2.33, tamanho do quantum',
    'Slides cap4 (Oliveira/Carissimi/Toscani, UFRGS): RR – Round Robin (1), (2) e (3)',
    'Machado & Maia, Arquitetura de SO (escalonamento circular)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: o rodízio do videogame.</strong> Quatro amigos e um só console. Regra: cada um joga no máximo 5 minutos e passa o controle para o próximo, voltando para o fim da fila. Se alguém perde antes dos 5 minutos (ou vai buscar um lanche), passa o controle na hora. Ninguém monopoliza o console, e todo mundo joga logo. Mas se a vez fosse de 10 segundos, o tempo gasto passando o controle seria maior que o tempo jogando.</p>
</div>

<h2>Como funciona</h2>
<p>O <strong>Round Robin</strong> (RR, <strong>circular</strong>, chaveamento circular) é um dos algoritmos mais antigos, simples, justos e usados. É o <strong>FIFO com preempção por tempo</strong>:</p>
<ul>
  <li>A fila de Apto é tratada como uma <strong>fila circular</strong>.</li>
  <li>Cada processo recebe uma <strong>fatia de tempo</strong> (<em>time-slice</em>, <strong>quantum</strong>) para usar a CPU.</li>
  <li>Se o processo ainda estiver executando ao fim do quantum, sofre <strong>preempção</strong>: volta para o <strong>fim da fila</strong> de Apto e a CPU vai para o próximo.</li>
  <li>Se ele <strong>bloquear ou terminar antes</strong> do fim do quantum, a CPU é chaveada <strong>na hora</strong>; não se espera o quantum acabar.</li>
  <li>Precisa de um <strong>relógio</strong> que gere interrupções para delimitar as fatias.</li>
</ul>
<p>Pelos slides, o processo perde o processador quando: libera explicitamente (<em>yield</em>), faz uma chamada de sistema e bloqueia, termina, ou <strong>esgota sua fatia de tempo</strong>. Este último motivo é o que torna o RR <strong>preemptivo</strong>. Foi projetado especialmente para sistemas de <strong>tempo compartilhado</strong>.</p>

<figure class="diagrama">
  <svg viewBox="0 0 520 170" style="max-width:600px" role="img" aria-label="Fila circular antes e depois de B usar todo o seu quantum">
    <g font-size="13" fill="currentColor" text-anchor="middle">
      <text x="10" y="44" text-anchor="start" font-weight="bold">(a)</text>
      <text x="10" y="134" text-anchor="start" font-weight="bold">(b)</text>
      <rect x="60" y="25" width="50" height="30" rx="4" style="fill:var(--azul);stroke:var(--azul)"/><text x="85" y="45" style="fill:var(--sobre-cor)" font-weight="bold">B</text>
      <rect x="150" y="25" width="50" height="30" rx="4" style="fill:var(--azul-claro);stroke:var(--azul)"/><text x="175" y="45">F</text>
      <rect x="240" y="25" width="50" height="30" rx="4" style="fill:var(--azul-claro);stroke:var(--azul)"/><text x="265" y="45">D</text>
      <rect x="330" y="25" width="50" height="30" rx="4" style="fill:var(--azul-claro);stroke:var(--azul)"/><text x="355" y="45">G</text>
      <rect x="420" y="25" width="50" height="30" rx="4" style="fill:var(--azul-claro);stroke:var(--azul)"/><text x="445" y="45">A</text>
      <rect x="60" y="115" width="50" height="30" rx="4" style="fill:var(--azul);stroke:var(--azul)"/><text x="85" y="135" style="fill:var(--sobre-cor)" font-weight="bold">F</text>
      <rect x="150" y="115" width="50" height="30" rx="4" style="fill:var(--azul-claro);stroke:var(--azul)"/><text x="175" y="135">D</text>
      <rect x="240" y="115" width="50" height="30" rx="4" style="fill:var(--azul-claro);stroke:var(--azul)"/><text x="265" y="135">G</text>
      <rect x="330" y="115" width="50" height="30" rx="4" style="fill:var(--azul-claro);stroke:var(--azul)"/><text x="355" y="135">A</text>
      <rect x="420" y="115" width="50" height="30" rx="4" style="fill:var(--azul-claro);stroke:var(--ambar)" stroke-width="2"/><text x="445" y="135">B</text>
      <text x="85" y="16" font-size="11">executando</text>
      <text x="175" y="16" font-size="11">próximo</text>
      <text x="445" y="163" font-size="11" style="fill:var(--ambar)">B voltou ao fim</text>
    </g>
    <g stroke="currentColor" fill="none"><path d="M110 40 H146"/><path d="M200 40 H236"/><path d="M290 40 H326"/><path d="M380 40 H416"/>
      <path d="M110 130 H146"/><path d="M200 130 H236"/><path d="M290 130 H326"/><path d="M380 130 H416"/>
      <path d="M85 58 V80 H445 V111" style="stroke:var(--ambar)" stroke-dasharray="4 3"/></g>
    <g fill="currentColor"><path d="M146 36 l6 4 -6 4z"/><path d="M236 36 l6 4 -6 4z"/><path d="M326 36 l6 4 -6 4z"/><path d="M416 36 l6 4 -6 4z"/>
      <path d="M146 126 l6 4 -6 4z"/><path d="M236 126 l6 4 -6 4z"/><path d="M326 126 l6 4 -6 4z"/><path d="M416 126 l6 4 -6 4z"/>
      <path d="M441 109 l4 6 4 -6z" style="fill:var(--ambar)"/></g>
  </svg>
  <figcaption>Baseado na Fig. 2.33 do Tanenbaum. (a) B está executando e F é o próximo. (b) B usou todo o seu quantum: sofre preempção, vai para o fim da fila e F assume a CPU.</figcaption>
</figure>

<h2>O tamanho do quantum</h2>
<p>Cada troca de processo custa tempo (salvar e carregar registradores e mapas de memória, atualizar tabelas, recarregar a cache). O Tanenbaum faz a conta: com troca de <strong>1 ms</strong> e quantum de <strong>4 ms</strong>, a cada 5 ms de CPU, 1 ms é administração, ou seja, <strong>20% da CPU desperdiçada</strong>. Fórmula: desperdício = troca / (quantum + troca).</p>
<table>
  <tr><th>Quantum</th><th>Efeito</th></tr>
  <tr><td><strong>Muito pequeno</strong></td><td>Muitas trocas de contexto: <strong>overhead</strong> alto e eficiência da CPU baixa. Em compensação, a resposta interativa é boa.</td></tr>
  <tr><td><strong>Muito grande</strong></td><td>Pouco overhead (com 100 ms, cerca de 1%), mas <strong>resposta ruim</strong>: se 50 processos estiverem na fila, o último espera cerca de 5 s. Se o quantum for maior que (quase) todos os surtos de CPU, a preempção quase não acontece e o RR <strong>vira FIFO</strong> (com quantum → ∞, RR = FIFO). Favorece CPU-bound e prejudica I/O-bound.</td></tr>
  <tr><td><strong>Razoável</strong></td><td>Segundo o Tanenbaum, algo entre <strong>20 e 50 ms</strong>: um pouco maior que o surto de CPU típico, para que a maioria dos processos bloqueie antes de o quantum acabar.</td></tr>
</table>
<p>Os slides resumem o dilema: é um compromisso entre <strong>overhead</strong> e <strong>tempo de resposta</strong>, em função do número de usuários (com k usuários, cada um recebe cerca de <strong>1/k</strong> da CPU). Há ainda um segundo problema: <strong>processos I/O-bound são prejudicados</strong>. Eles quase nunca usam o quantum inteiro (bloqueiam antes), mas esperam na fila tanto quanto os CPU-bound. A solução é dar prioridade a eles (próxima aula).</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: RR com quantum 5.</strong> A=12, B=8, C=15 e D=5 u.t., em Apto em t=0 na ordem A, B, C, D, sem troca de contexto.</p>
  <table>
    <tr><th>Intervalo</th><th>Executa</th><th>O que acontece</th><th>Fila de Apto depois</th></tr>
    <tr><td>0–5</td><td>A</td><td>Quantum acaba; falta 7.</td><td>B, C, D, A</td></tr>
    <tr><td>5–10</td><td>B</td><td>Quantum acaba; falta 3.</td><td>C, D, A, B</td></tr>
    <tr><td>10–15</td><td>C</td><td>Quantum acaba; falta 10.</td><td>D, A, B, C</td></tr>
    <tr><td>15–20</td><td>D</td><td>Usa exatamente 5 e <strong>termina</strong>.</td><td>A, B, C</td></tr>
    <tr><td>20–25</td><td>A</td><td>Quantum acaba; falta 2.</td><td>B, C, A</td></tr>
    <tr><td>25–28</td><td>B</td><td>Precisa só de 3: <strong>termina</strong> antes do quantum.</td><td>C, A</td></tr>
    <tr><td>28–33</td><td>C</td><td>Quantum acaba; falta 5.</td><td>A, C</td></tr>
    <tr><td>33–35</td><td>A</td><td><strong>Termina</strong>.</td><td>C</td></tr>
    <tr><td>35–40</td><td>C</td><td><strong>Termina</strong>.</td><td>vazia</td></tr>
  </table>
  <figure class="diagrama">${gantt(RR5)}
  <figcaption>Términos: A = 35, B = 28, C = 40, D = 20. Turnaround médio = (35 + 28 + 40 + 20) / 4 = <strong>30,75</strong>.</figcaption></figure>
  <p>Comparando com FIFO na mesma ordem (A, B, C, D): o turnaround médio do FIFO é (12 + 20 + 35 + 40) / 4 = 26,75, <strong>melhor</strong> que o do RR. Mas o tempo até a primeira execução (resposta) no RR é (0 + 5 + 10 + 15) / 4 = <strong>7,5</strong>, contra (0 + 12 + 20 + 35) / 4 = 16,75 no FIFO. O RR troca turnaround por <strong>tempo de resposta</strong>, que é o que importa num sistema interativo.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>Um processo que <strong>bloqueia</strong> antes do fim do quantum <strong>não</strong> sofre preempção: ele sai da CPU para Bloqueado, e só volta para o fim da fila de Apto quando a E/S terminar.</li>
    <li>Quem termina ou bloqueia antes do quantum <strong>não "guarda" o resto</strong> da fatia: na próxima vez recebe um quantum novo.</li>
    <li>Quantum pequeno → <strong>overhead</strong>; quantum grande → <strong>vira FIFO</strong> e piora a resposta. Não existe quantum bom em todos os casos.</li>
    <li>Na conta de desperdício, o denominador é <strong>quantum + troca</strong>: quantum 4 e troca 1 dão 1/5 = 20%, não 1/4 = 25%.</li>
    <li>O RR prejudica os <strong>I/O-bound</strong>; a correção vem com prioridades e múltiplas filas.</li>
  </ul>
</div>
`,
  resumo: 'Round Robin (circular) é o FIFO com quantum: cada processo usa a CPU por no máximo uma fatia de tempo e, se não terminou nem bloqueou, sofre preempção e volta ao fim da fila. É preemptivo, justo e precisa de relógio. Quantum pequeno gera overhead de troca de contexto (troca / (quantum + troca)); quantum grande piora a resposta e, no limite, vira FIFO; 20–50 ms é razoável. O RR melhora o tempo de resposta, mas prejudica processos I/O-bound.',
  questoes: [
    {
      id: 'm07-a03-q1',
      enunciado: 'Em que o escalonamento circular (Round Robin) difere do FIFO?',
      alternativas: [
        { texto: 'Ambos usam uma fila por ordem de chegada, mas o circular limita o uso contínuo da CPU a um quantum e faz preempção quando ele acaba; o FIFO é não preemptivo.', correta: true, explicacao: 'Correto. O circular é "FIFO + fatia de tempo". No FIFO o processo só sai ao terminar, bloquear ou ceder a CPU.' },
        { texto: 'O FIFO usa quantum e o circular não.', correta: false, explicacao: 'É o contrário: o quantum é justamente o que o circular acrescenta ao FIFO.' },
        { texto: 'O circular escolhe o processo mais curto; o FIFO, o mais antigo.', correta: false, explicacao: 'Escolher o mais curto é o SJF. O circular percorre a fila em ordem, dando um quantum a cada processo.' },
        { texto: 'Não há diferença: circular é só outro nome para FIFO.', correta: false, explicacao: 'Só seriam iguais com quantum infinito. Com quantum finito, o circular faz preempção por tempo e o FIFO não.' },
      ],
    },
    {
      id: 'm07-a03-q2',
      enunciado: 'Qual é a principal desvantagem de um quantum com valor muito pequeno?',
      alternativas: [
        { texto: 'Overhead alto: as preempções são muito frequentes e boa parte da CPU é gasta em trocas de contexto.', correta: true, explicacao: 'Correto. Exemplo do Tanenbaum: quantum de 4 ms com troca de 1 ms desperdiça 20% da CPU só em administração.' },
        { texto: 'O escalonamento passa a se comportar como FIFO.', correta: false, explicacao: 'Isso acontece com quantum muito grande: a preempção quase não ocorre.' },
        { texto: 'Os processos I/O-bound deixam de ser atendidos.', correta: false, explicacao: 'Com quantum pequeno os I/O-bound são atendidos com frequência. O problema é o desperdício com trocas de contexto.' },
        { texto: 'O tempo de resposta dos usuários interativos fica muito alto.', correta: false, explicacao: 'Quantum pequeno melhora o tempo de resposta (a vez de cada um chega rápido). Resposta ruim é consequência de quantum grande.' },
      ],
    },
    {
      id: 'm07-a03-q3',
      enunciado: 'O que acontece com o Round Robin quando o quantum tende ao infinito (fica maior que qualquer surto de CPU)?',
      alternativas: [
        { texto: 'Ele se comporta como FIFO: ninguém sofre preempção por tempo.', correta: true, explicacao: 'Correto, como dizem os slides: "se quantum → ∞ obtém-se o comportamento de um escalonador FIFO". Cada processo executa até terminar ou bloquear.' },
        { texto: 'Ele se comporta como SJF.', correta: false, explicacao: 'O RR nunca reordena os processos pelo tamanho. Sem preempção, sobra só a ordem de chegada (FIFO).' },
        { texto: 'O overhead de troca de contexto fica máximo.', correta: false, explicacao: 'É o oposto: com quantum enorme quase não há trocas por tempo, e o overhead fica mínimo.' },
        { texto: 'O tempo de resposta interativo melhora muito.', correta: false, explicacao: 'Piora: um processo longo segura a CPU e todos esperam atrás dele.' },
      ],
    },
    {
      id: 'm07-a03-q4',
      enunciado: 'A=12, B=8, C=15 e D=5 u.t. estão em Apto em t=0, na ordem A, B, C, D. Com Round Robin, quantum = 5 e sem troca de contexto, em que instantes os processos terminam?',
      alternativas: [
        { texto: 'A = 35, B = 28, C = 40, D = 20.', correta: true, explicacao: 'Correto. A(0–5), B(5–10), C(10–15), D(15–20, termina), A(20–25), B(25–28, termina), C(28–33), A(33–35, termina), C(35–40, termina).<figure class="diagrama">' + gantt(RR5) + '</figure>' },
        { texto: 'A = 12, B = 20, C = 35, D = 40.', correta: false, explicacao: 'Esses são os términos em FIFO, sem quantum. No RR cada processo só executa 5 u.t. por vez.' },
        { texto: 'A = 35, B = 30, C = 40, D = 20.', correta: false, explicacao: 'B não usa o segundo quantum inteiro: faltavam só 3 u.t., então termina em 25 + 3 = 28 e libera a CPU na hora.' },
        { texto: 'A = 32, B = 28, C = 40, D = 20.', correta: false, explicacao: 'Depois de B terminar em 28, quem executa é C (28–33), que estava antes de A na fila. A só volta em 33 e termina em 35.' },
      ],
    },
    {
      id: 'm07-a03-q5',
      enunciado: 'Num Round Robin, o quantum é de 9 ms e cada troca de contexto leva 1 ms. Supondo que todos os processos usam o quantum inteiro, que fração do tempo da CPU é gasta com trocas de contexto?',
      alternativas: [
        { texto: '10%.', correta: true, explicacao: 'Correto. A cada ciclo há 1 ms de troca + 9 ms de trabalho: 1 / (9 + 1) = 1/10 = 10%.<figure class="diagrama">' + gantt(OVER) + '</figure>' },
        { texto: '11,1%.', correta: false, explicacao: 'Foi feito 1/9, dividindo só pelo quantum. O ciclo completo inclui a troca: 1 / (9 + 1) = 10%.' },
        { texto: '90%.', correta: false, explicacao: '90% é a fração útil (9 / 10). A pergunta é sobre o desperdício com trocas: 10%.' },
        { texto: '1%.', correta: false, explicacao: '1% seria o desperdício com quantum de 99 ms. Com 9 ms o desperdício é 1 / 10 = 10%.' },
      ],
    },
    {
      id: 'm07-a03-q6',
      enunciado: 'No Round Robin, um processo pede uma leitura de disco quando ainda restam 3 ms do seu quantum. O que acontece?',
      alternativas: [
        { texto: 'Ele vai para Bloqueado e a CPU passa imediatamente para o próximo da fila; quando a E/S terminar, ele entra no fim da fila de Apto.', correta: true, explicacao: 'Correto. Bloquear é um dos motivos para largar a CPU; não se espera o quantum acabar. A sobra de 3 ms é perdida, e na próxima vez ele recebe um quantum novo.' },
        { texto: 'A CPU fica ociosa por 3 ms, até o quantum acabar, e só então passa ao próximo.', correta: false, explicacao: 'Desperdiçar CPU não faz sentido: o escalonador é chamado assim que o processo bloqueia.' },
        { texto: 'Ele sofre preempção e vai direto para o fim da fila de Apto.', correta: false, explicacao: 'Preempção é retirar a CPU de quem ainda podia executar. Aqui o processo não pode continuar (espera E/S), então vai para Bloqueado, não para Apto.' },
        { texto: 'Quando a E/S terminar, ele volta direto para Executando para usar os 3 ms que sobraram.', correta: false, explicacao: 'Bloqueado nunca vai direto para Executando: ao fim da E/S o processo vai para Apto e espera sua vez.' },
      ],
    },
    {
      id: 'm07-a03-q7',
      enunciado: 'Por que o Round Robin puro prejudica os processos I/O-bound?',
      alternativas: [
        { texto: 'Eles quase nunca usam o quantum inteiro (bloqueiam antes), mas esperam na fila tanto quanto os CPU-bound.', correta: true, explicacao: 'Correto, como apontam os slides. A cada volta da E/S, o I/O-bound vai para o fim da fila e espera os CPU-bound gastarem seus quanta inteiros. A solução são prioridades.' },
        { texto: 'Eles sofrem preempção com mais frequência que os CPU-bound.', correta: false, explicacao: 'É o contrário: como bloqueiam antes do fim do quantum, os I/O-bound raramente sofrem preempção por tempo.' },
        { texto: 'O RR não deixa processos fazerem E/S.', correta: false, explicacao: 'Qualquer processo pode fazer E/S no RR; ele apenas bloqueia e volta para a fila depois.' },
        { texto: 'O quantum de um I/O-bound é menor que o de um CPU-bound.', correta: false, explicacao: 'No RR puro todos recebem o mesmo quantum. O problema é a espera, não o tamanho da fatia.' },
      ],
    },
    {
      id: 'm07-a03-q8',
      enunciado: 'Comparado ao FIFO, o que o Round Robin costuma melhorar?',
      alternativas: [
        { texto: 'O tempo de resposta: todos começam a executar cedo, mesmo que o turnaround médio possa piorar.', correta: true, explicacao: 'Correto. No exemplo da aula (A=12, B=8, C=15, D=5, q=5), o tempo médio até a primeira execução cai de 16,75 (FIFO) para 7,5 (RR), embora o turnaround médio suba de 26,75 para 30,75.' },
        { texto: 'O turnaround médio, sempre.', correta: false, explicacao: 'Não sempre: no exemplo da aula, o turnaround médio do RR (30,75) é pior que o do FIFO (26,75), porque os processos se intercalam e todos terminam mais tarde.' },
        { texto: 'O overhead de troca de contexto.', correta: false, explicacao: 'O RR faz mais trocas que o FIFO, então o overhead aumenta.' },
        { texto: 'O throughput de tarefas em lote.', correta: false, explicacao: 'Para lote, as preempções do RR só acrescentam trocas. O RR foi pensado para sistemas interativos (tempo compartilhado).' },
      ],
    },
    {
      id: 'm07-a03-q9',
      enunciado: 'Como um quantum muito <strong>grande</strong> afeta a multiprogramação?',
      alternativas: [
        { texto: 'Reduz as preempções por tempo, favorecendo os CPU-bound e prejudicando os I/O-bound e o tempo de resposta.', correta: true, explicacao: 'Correto. Com poucas preempções, um CPU-bound segura a CPU por muito tempo e os outros, inclusive os interativos, esperam mais.' },
        { texto: 'Aumenta o overhead de troca de contexto.', correta: false, explicacao: 'Quantum grande diminui o número de trocas e, portanto, o overhead.' },
        { texto: 'Favorece os I/O-bound, que passam a receber mais CPU.', correta: false, explicacao: 'Os I/O-bound usam pouco do quantum; aumentá-lo só beneficia quem usa a fatia inteira, ou seja, os CPU-bound.' },
        { texto: 'Não afeta: o quantum só importa em sistemas de lote.', correta: false, explicacao: 'O quantum é essencial justamente em sistemas interativos (tempo compartilhado), onde define o tempo de resposta.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm07-a03-d1',
      enunciado: 'De que forma o tamanho do quantum (fatia de tempo) influencia um sistema multiprogramado? Que problema surge quando o quantum é pequeno demais?',
      respostaModelo: `<p>Um quantum <strong>grande</strong> reduz as preempções por tempo: cada processo fica mais tempo com a CPU, o que favorece os CPU-bound, prejudica os I/O-bound e piora o tempo de resposta. No limite (quantum maior que qualquer surto), o Round Robin vira FIFO.</p>
<p>Um quantum <strong>pequeno</strong> faz a CPU passar rapidamente por todos os processos (boa resposta), mas a <strong>principal desvantagem</strong> é o <strong>overhead</strong>: as trocas de contexto ficam muito frequentes e consomem uma fração grande da CPU. Exemplo: troca de 1 ms com quantum de 4 ms desperdiça 1/(4 + 1) = 20% da CPU.</p>
<p>O valor ideal é um compromisso entre overhead e tempo de resposta, um pouco maior que o surto típico de CPU (o Tanenbaum sugere 20 a 50 ms).</p>`,
      pontosChave: [
        'Quantum grande: menos preempções, favorece CPU-bound, piora a resposta (tende a FIFO)',
        'Quantum pequeno: muitas trocas de contexto, overhead alto',
        'Exemplo ou fórmula do desperdício: troca / (quantum + troca)',
        'Conclusão: compromisso entre overhead e tempo de resposta',
      ],
    },
  ],
});
})();
