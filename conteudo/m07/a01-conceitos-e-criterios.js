// Módulo 7, aula 1: política de escalonamento, escalonador x dispatcher, critérios, níveis, preemptivo x não preemptivo.
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

SO1.registerLesson({
  id: 'm07-a01',
  titulo: 'Conceitos e critérios de escalonamento',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.4.1 (p.87–91): introdução ao escalonamento, comportamento do processo, quando escalonar, categorias e objetivos (Tabela 2.8)',
    'Slides cap4 (Oliveira/Carissimi/Toscani, UFRGS): objetivos, escalonador x dispatcher, níveis de escalonamento, tipos de escalonador',
    'Machado & Maia, Arquitetura de SO, cap. Gerência do Processador (conhecimento consolidado)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: o caixa único de uma padaria.</strong> Há um só caixa (a CPU) e uma fila de clientes prontos para pagar (os processos em Apto). Alguém precisa decidir <em>quem é atendido agora</em>: quem chegou primeiro? quem tem só um pãozinho? o idoso? Esse conjunto de regras é a <strong>política</strong>. Quem aplica as regras e aponta o próximo cliente é o <strong>escalonador</strong>. Quem efetivamente tira um cliente do balcão e coloca o outro, guardando onde a conta do primeiro parou, é o <strong>dispatcher</strong>.</p>
</div>

<h2>Por que escalonar</h2>
<p>Num sistema multiprogramado, vários processos ficam em <strong>Apto (pronto)</strong> disputando um único processador. O <strong>escalonamento</strong> é a função do SO que decide qual deles usa a CPU e por quanto tempo. Uma boa decisão muda muito o desempenho percebido; uma ruim deixa a CPU ou os discos ociosos e o usuário esperando.</p>

<h3>Política, escalonador e dispatcher</h3>
<table>
  <tr><th>Termo</th><th>O que é</th></tr>
  <tr><td><strong>Política de escalonamento</strong></td><td>Conjunto de <strong>critérios</strong> que determinam qual processo em estado Apto será escolhido para usar o processador (ex.: "o que chegou primeiro", "o mais curto", "o de maior prioridade").</td></tr>
  <tr><td><strong>Escalonador</strong> (<em>scheduler</em>)</td><td>Rotina do SO que <strong>implementa a política</strong>: olha a fila de Apto e <strong>escolhe</strong> o próximo processo.</td></tr>
  <tr><td><strong>Dispatcher</strong></td><td>Rotina que faz a <strong>troca de contexto</strong> depois da escolha: salva o contexto do processo que sai no seu BDP (PCB), carrega o contexto do escolhido e entrega a CPU a ele.</td></tr>
</table>
<p>Nos slides: <em>"escalonador: política de seleção; dispatcher: efetua a troca de contexto"</em>. A troca de contexto custa caro, e o Tanenbaum lista o que ela envolve: passar do modo usuário para o modo núcleo, salvar registradores na tabela de processos, salvar o mapa de memória, escolher o novo processo, recarregar a MMU com o mapa dele e iniciá-lo; ainda por cima a memória cache fica "fria" (com dados do processo anterior). Por isso trocar demais desperdiça CPU.</p>

<h2>Comportamento do processo: CPU-bound x I/O-bound</h2>
<p>Quase todo processo alterna <strong>surtos de CPU</strong> (computando) com <strong>esperas por E/S</strong> (Bloqueado). O que diferencia os processos é o tamanho do surto de CPU:</p>
<figure class="diagrama">
  <svg viewBox="0 0 520 150" style="max-width:620px" role="img" aria-label="Processo CPU-bound com surtos longos de CPU e processo I/O-bound com surtos curtos">
    <g font-size="13" fill="currentColor">
      <text x="0" y="30" font-weight="bold">(a) CPU-bound</text>
      <text x="0" y="95" font-weight="bold">(b) I/O-bound</text>
    </g>
    <line x1="120" y1="25" x2="510" y2="25" stroke="currentColor"/>
    <line x1="120" y1="90" x2="510" y2="90" stroke="currentColor"/>
    <g style="fill:var(--azul)">
      <rect x="120" y="16" width="110" height="18"/><rect x="250" y="16" width="120" height="18"/><rect x="390" y="16" width="100" height="18"/>
      <rect x="120" y="81" width="14" height="18"/><rect x="170" y="81" width="12" height="18"/><rect x="218" y="81" width="16" height="18"/>
      <rect x="270" y="81" width="12" height="18"/><rect x="318" y="81" width="14" height="18"/><rect x="368" y="81" width="12" height="18"/>
      <rect x="416" y="81" width="14" height="18"/><rect x="466" y="81" width="12" height="18"/>
    </g>
    <g font-size="12" fill="currentColor">
      <text x="120" y="55">surtos longos de CPU, raras esperas por E/S (linha fina)</text>
      <text x="120" y="120">surtos curtos de CPU, esperas frequentes por E/S</text>
      <rect x="120" y="132" width="14" height="10" style="fill:var(--azul)"/><text x="140" y="141">usando a CPU</text>
      <line x1="240" y1="137" x2="270" y2="137" stroke="currentColor"/><text x="276" y="141">esperando E/S</text>
    </g>
  </svg>
  <figcaption>Baseado na Fig. 2.31 do Tanenbaum. <strong>CPU-bound</strong> (limitado pela CPU): passa a maior parte do tempo computando. <strong>I/O-bound</strong> (limitado pela E/S): passa a maior parte do tempo Bloqueado esperando E/S. O fator principal é o tamanho do <em>surto de CPU</em>, não o da E/S.</figcaption>
</figure>
<p>Ideia básica: se um I/O-bound quer a CPU, deve recebê-la logo, para disparar o próximo pedido de E/S e manter o disco ocupado. Misturar bem os dois tipos mantém <strong>todas as partes do sistema ocupadas</strong>.</p>

<h2>Quando o escalonador é chamado</h2>
<ul>
  <li>Quando um processo é <strong>criado</strong> (executar o pai ou o filho?).</li>
  <li>Quando um processo <strong>termina</strong>.</li>
  <li>Quando um processo <strong>bloqueia</strong> (E/S, semáforo etc.).</li>
  <li>Quando ocorre uma <strong>interrupção de E/S</strong> (um processo Bloqueado volta a Apto).</li>
  <li>Em <strong>interrupções de relógio</strong> (base do escalonamento preemptivo). Os slides somam as <strong>chamadas de sistema</strong> e os <strong>sinais</strong>.</li>
</ul>

<h2>Critérios (objetivos) de escalonamento</h2>
<table>
  <tr><th>Critério</th><th>Definição</th><th>Objetivo</th></tr>
  <tr><td><strong>Utilização do processador</strong></td><td>Fração do tempo em que a CPU está ocupada.</td><td>Maximizar</td></tr>
  <tr><td><strong>Throughput</strong> (vazão, produtividade)</td><td>Número de processos executados por unidade de tempo.</td><td>Maximizar</td></tr>
  <tr><td><strong>Tempo de processador</strong> (tempo de CPU)</td><td>Tempo que o processo passa em <strong>Executando</strong> durante sua vida.</td><td>Depende do código; o escalonador não muda</td></tr>
  <tr><td><strong>Tempo de espera</strong></td><td>Tempo total que o processo passa na <strong>fila de Apto</strong>, esperando a CPU.</td><td>Minimizar</td></tr>
  <tr><td><strong>Turnaround</strong> (tempo de retorno, tempo de vida)</td><td>Tempo da <strong>criação ao término</strong>: soma espera por memória, fila de Apto, CPU e E/S.</td><td>Minimizar</td></tr>
  <tr><td><strong>Tempo de resposta</strong></td><td>Tempo entre uma <strong>requisição</strong> (um comando, um clique) e o instante em que a <strong>resposta</strong> aparece.</td><td>Minimizar</td></tr>
</table>
<p>Os critérios conflitam. O Tanenbaum mostra que um escalonador que sempre roda tarefas curtas pode ter ótima <strong>vazão</strong> e, ao mesmo tempo, um <strong>tempo de retorno</strong> péssimo para as tarefas longas, que talvez nunca executem. Por isso os algoritmos buscam bons <strong>tempos médios</strong> em vez de otimizar um critério só. O que importa também muda com o ambiente (Tabela 2.8 do Tanenbaum):</p>
<table>
  <tr><th>Ambiente</th><th>Objetivos principais</th></tr>
  <tr><td>Todos os sistemas</td><td><strong>Justiça</strong> (porção justa de CPU para cada processo), <strong>aplicação da política</strong>, <strong>equilíbrio</strong> (todas as partes ocupadas).</td></tr>
  <tr><td>Lote (batch)</td><td>Vazão, tempo de retorno (turnaround), utilização da CPU.</td></tr>
  <tr><td>Interativo</td><td><strong>Tempo de resposta</strong> e <strong>proporcionalidade</strong> (atender à expectativa do usuário).</td></tr>
  <tr><td>Tempo real</td><td><strong>Cumprir os prazos</strong> e <strong>previsibilidade</strong>.</td></tr>
</table>

<h2>Níveis de escalonamento</h2>
<figure class="diagrama">
  <svg viewBox="0 0 560 250" style="max-width:640px" role="img" aria-label="Escalonadores de longo, médio e curto prazo no ciclo de vida do processo">
    <g font-size="12" fill="currentColor" text-anchor="middle">
      <rect x="10" y="40" width="80" height="34" rx="6" fill="none" stroke="currentColor"/><text x="50" y="62">Novos</text>
      <rect x="170" y="40" width="120" height="34" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)"/><text x="230" y="62">Fila de Apto</text>
      <rect x="380" y="40" width="80" height="34" rx="6" style="fill:var(--azul);stroke:var(--azul)"/><text x="420" y="62" style="fill:var(--sobre-cor)" font-weight="bold">CPU</text>
      <rect x="490" y="40" width="64" height="34" rx="6" fill="none" stroke="currentColor"/><text x="522" y="62">Término</text>
      <rect x="250" y="120" width="140" height="34" rx="6" style="fill:var(--ambar-claro);stroke:var(--ambar)"/><text x="320" y="142">Bloqueados</text>
      <rect x="80" y="195" width="170" height="34" rx="6" fill="none" stroke="currentColor" stroke-dasharray="5 3"/><text x="165" y="217">Suspensos (disco)</text>
    </g>
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <path d="M90 57 H166"/><path d="M290 57 H376"/><path d="M460 57 H486"/>
      <path d="M420 74 V137 H394"/><path d="M250 137 H215 V78"/>
      <path d="M200 74 V191"/><path d="M150 191 V74" stroke-dasharray="4 3"/>
      <path d="M440 40 V20 H230 V36" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor">
      <path d="M166 53 l6 4 -6 4z"/><path d="M376 53 l6 4 -6 4z"/><path d="M486 53 l6 4 -6 4z"/>
      <path d="M394 133 l-6 4 6 4z"/><path d="M211 78 l4 -6 4 6z"/><path d="M196 191 l4 6 4 -6z"/><path d="M146 78 l4 -6 4 6z"/><path d="M226 36 l4 6 4 -6z"/>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="128" y="34" text-anchor="middle" style="fill:var(--verde)" font-weight="bold">longo prazo</text>
      <text x="333" y="34" text-anchor="middle" style="fill:var(--azul)" font-weight="bold">curto prazo</text>
      <text x="300" y="14" text-anchor="middle">preempção (fim do quantum)</text>
      <text x="430" y="100">E/S, evento</text>
      <text x="260" y="112">fim da E/S</text>
      <text x="206" y="178" style="fill:var(--ambar)" font-weight="bold">médio prazo</text>
      <text x="96" y="178" style="fill:var(--ambar)" font-weight="bold">swap</text>
    </g>
  </svg>
  <figcaption>O <strong>longo prazo</strong> admite novos processos; o <strong>curto prazo</strong> escolhe quem, entre os Aptos, usa a CPU; o <strong>médio prazo</strong> retira processos da memória (suspende) e os traz de volta (swapping).</figcaption>
</figure>
<table>
  <tr><th>Nível</th><th>Quando age</th><th>O que decide</th></tr>
  <tr><td><strong>Longo prazo</strong></td><td>Quando um processo novo é criado.</td><td>Quando o processo novo passa a ser considerado, ou seja, quando vira Apto. <strong>Controla o grau de multiprogramação</strong> (quantos processos ativos): quanto mais processos, menor a fatia de CPU de cada um.</td></tr>
  <tr><td><strong>Médio prazo</strong></td><td>Quando falta memória (ou para equilibrar a carga).</td><td>Associado à gerência de memória: participa do <strong>swapping</strong>, suspendendo processos (Apto-suspenso, Bloqueado-suspenso) e trazendo-os de volta. Também ajusta o grau de multiprogramação.</td></tr>
  <tr><td><strong>Curto prazo</strong></td><td>Muito frequentemente: interrupção de relógio, interrupção de E/S, chamadas de sistema, sinais.</td><td><strong>Qual processo Apto usa a CPU agora.</strong> É o mais importante e o que estudamos nas próximas aulas.</td></tr>
</table>

<h2>Preemptivo x não preemptivo</h2>
<p><strong>Preempção</strong> é o SO <strong>retirar a CPU</strong> de um processo que ainda quer executar e devolvê-lo à fila de Apto.</p>
<table>
  <tr><th>Tipo</th><th>O processo só larga a CPU quando...</th><th>Exemplos</th></tr>
  <tr><td><strong>Não preemptivo</strong> (cooperativo)</td><td>termina; faz uma requisição de E/S ou de sincronização (bloqueia); ou libera a CPU voluntariamente (<em>yield</em>). Nenhum evento externo tira a CPU dele.</td><td>FIFO, SJF</td></tr>
  <tr><td><strong>Preemptivo</strong></td><td>tudo o que está à esquerda <strong>e também</strong>: interrupção de relógio (acabou o quantum) ou chegada em Apto de um processo de prioridade mais alta.</td><td>Round Robin, prioridades preemptivas, múltiplas filas, SRTF</td></tr>
</table>
<p>O escalonamento preemptivo exige um <strong>relógio</strong> que gere interrupções periódicas; sem ele, só o não preemptivo é possível. Em sistemas interativos a preempção é essencial para que um processo não monopolize a CPU.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: medindo os tempos de um processo P.</strong> P é criado em t=0, junto com outro processo Q, que ganha a CPU primeiro.</p>
  <table>
    <tr><th>Intervalo</th><th>O que acontece</th><th>Estado de P</th></tr>
    <tr><td>0–4</td><td>Q executa; P espera na fila.</td><td>Apto (conta como <strong>espera</strong>)</td></tr>
    <tr><td>4–7</td><td>P executa 3 u.t. e pede uma leitura de disco.</td><td>Executando (<strong>CPU</strong>)</td></tr>
    <tr><td>7–12</td><td>A E/S de P dura 5 u.t.; Q usa a CPU.</td><td>Bloqueado (<strong>E/S</strong>)</td></tr>
    <tr><td>12–14</td><td>A E/S terminou, mas Q ainda está na CPU.</td><td>Apto (<strong>espera</strong>)</td></tr>
    <tr><td>14–16</td><td>P executa as últimas 2 u.t. e termina.</td><td>Executando (<strong>CPU</strong>)</td></tr>
  </table>
  <p>Tempo de CPU = 3 + 2 = <strong>5</strong>. Tempo de espera = 4 + 2 = <strong>6</strong>. Tempo em E/S = <strong>5</strong>. Turnaround = 16 − 0 = <strong>16</strong> = 5 + 6 + 5.</p>
  <figure class="diagrama">${gantt({ procs: ['P'], cpu: [['Q', 0, 4], ['P', 4, 7], ['Q', 7, 14], ['P', 14, 16]], es: [['P', 7, 12]], rotulo: 'Linha do tempo do processo P' })}
  <figcaption>Linha "CPU": quem está no processador. Linha "P": estado de P em cada intervalo.</figcaption></figure>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Escalonador escolhe; dispatcher troca.</strong> Quem salva e restaura o contexto é o dispatcher, não o escalonador.</li>
    <li><strong>Tempo de espera</strong> é só o tempo em <strong>Apto</strong>. Tempo Bloqueado esperando E/S <strong>não</strong> entra no tempo de espera, mas entra no turnaround.</li>
    <li><strong>Tempo de resposta ≠ turnaround.</strong> Resposta mede até a primeira reação a uma requisição; turnaround mede a vida inteira do processo.</li>
    <li>Quem <strong>controla o grau de multiprogramação</strong> é o escalonador de <strong>longo prazo</strong> (e o de médio prazo, pelo swapping). O de curto prazo só escolhe entre os que já estão em Apto.</li>
    <li>No não preemptivo o processo ainda pode sair da CPU: ao <strong>terminar</strong>, <strong>bloquear</strong> ou fazer <em>yield</em>. O que não existe é a retirada forçada.</li>
  </ul>
</div>
`,
  resumo: 'A política de escalonamento é o conjunto de critérios para escolher qual processo Apto usa a CPU; o escalonador implementa a política e o dispatcher faz a troca de contexto. Os critérios são utilização da CPU, throughput, tempo de CPU, tempo de espera (em Apto), turnaround (criação ao término) e tempo de resposta. Há três níveis (longo prazo: admissão e grau de multiprogramação; médio prazo: swapping; curto prazo: quem usa a CPU) e dois tipos: não preemptivo (só sai ao terminar, bloquear ou ceder) e preemptivo (também por relógio ou prioridade).',
  questoes: [
    {
      id: 'm07-a01-q1',
      enunciado: 'O que é a política de escalonamento de um sistema operacional?',
      alternativas: [
        { texto: 'O conjunto de critérios que determina qual processo em estado Apto será escolhido para usar o processador.', correta: true, explicacao: 'Correto. A política é a regra de escolha ("o primeiro da fila", "o mais curto", "o de maior prioridade"). O escalonador é a rotina que aplica essa regra.' },
        { texto: 'A rotina que salva o contexto do processo que sai e carrega o do processo que entra.', correta: false, explicacao: 'Isso é o dispatcher (troca de contexto). A política diz quem deve entrar; o dispatcher faz a entrada acontecer.' },
        { texto: 'O conjunto de regras que define quais páginas de memória serão retiradas quando a memória enche.', correta: false, explicacao: 'Isso é política de substituição de páginas, da gerência de memória. A política de escalonamento trata da CPU.' },
        { texto: 'A ordem em que os dispositivos de E/S são atendidos pela controladora.', correta: false, explicacao: 'Ordenar pedidos de dispositivos é escalonamento de E/S (por exemplo, de disco). A política de escalonamento do processador escolhe entre processos Aptos.' },
      ],
    },
    {
      id: 'm07-a01-q2',
      enunciado: 'Quais são as funções do escalonador e do dispatcher?',
      alternativas: [
        { texto: 'O escalonador implementa a política e escolhe o próximo processo; o dispatcher faz a troca de contexto e entrega a CPU ao escolhido.', correta: true, explicacao: 'Correto. Nos slides: "escalonador: política de seleção; dispatcher: efetua a troca de contexto". Primeiro se escolhe, depois se troca.' },
        { texto: 'O escalonador faz a troca de contexto; o dispatcher escolhe o próximo processo.', correta: false, explicacao: 'Os papéis estão invertidos. O dispatcher salva e restaura contextos; a escolha é do escalonador.' },
        { texto: 'Os dois são o mesmo módulo: o escalonador é só o nome do dispatcher em sistemas preemptivos.', correta: false, explicacao: 'São duas partes distintas do escalonamento, tanto em sistemas preemptivos quanto nos não preemptivos: seleção (escalonador) e troca de contexto (dispatcher).' },
        { texto: 'O escalonador admite novos processos no sistema; o dispatcher decide quais processos vão para o disco.', correta: false, explicacao: 'Admitir processos é o papel do escalonador de longo prazo, e mandar para o disco é o swapping do médio prazo. O dispatcher apenas troca o contexto do processo escolhido pelo escalonador de curto prazo.' },
      ],
    },
    {
      id: 'm07-a01-q3',
      enunciado: 'Qual item <strong>não</strong> é um critério usado para avaliar uma política de escalonamento?',
      alternativas: [
        { texto: 'Tamanho do arquivo executável do programa.', correta: true, explicacao: 'Correto: o tamanho do executável não mede a qualidade do escalonamento. Os critérios são utilização da CPU, throughput, tempo de CPU, tempo de espera, turnaround e tempo de resposta.' },
        { texto: 'Throughput (número de processos executados por unidade de tempo).', correta: false, explicacao: 'Throughput (vazão) é critério: quanto mais processos terminados por unidade de tempo, melhor, principalmente em sistemas em lote.' },
        { texto: 'Tempo de espera na fila de Apto.', correta: false, explicacao: 'Tempo de espera é critério: o escalonador influencia diretamente quanto tempo cada processo passa em Apto, e quer minimizá-lo.' },
        { texto: 'Utilização do processador.', correta: false, explicacao: 'Utilização da CPU é critério: o objetivo é manter o processador ocupado o máximo possível.' },
      ],
    },
    {
      id: 'm07-a01-q4',
      enunciado: 'Um processo P é criado em t=0. Ele fica em Apto de 0 a 4, executa de 4 a 7, fica Bloqueado (E/S) de 7 a 12, volta a Apto de 12 a 14 e executa de 14 a 16, quando termina. Quais são o <strong>tempo de espera</strong> e o <strong>turnaround</strong> de P?',
      alternativas: [
        { texto: 'Espera = 6 u.t.; turnaround = 16 u.t.', correta: true, explicacao: 'Correto. Espera = só o tempo em Apto: (4 − 0) + (14 − 12) = 6. Turnaround = da criação ao término: 16 − 0 = 16, que é a soma de CPU (5) + espera (6) + E/S (5).<figure class="diagrama">' + gantt({ procs: ['P'], cpu: [['Q', 0, 4], ['P', 4, 7], ['Q', 7, 14], ['P', 14, 16]], es: [['P', 7, 12]], rotulo: 'Linha do tempo do processo P' }) + '</figure>' },
        { texto: 'Espera = 11 u.t.; turnaround = 16 u.t.', correta: false, explicacao: 'Foram somados os 5 u.t. em Bloqueado ao tempo de espera. Tempo de espera é só o tempo na fila de Apto (6); a E/S entra no turnaround, não na espera.' },
        { texto: 'Espera = 6 u.t.; turnaround = 5 u.t.', correta: false, explicacao: '5 u.t. é o tempo de CPU (3 + 2), não o turnaround. Turnaround é a vida inteira do processo: 16 − 0 = 16.' },
        { texto: 'Espera = 4 u.t.; turnaround = 11 u.t.', correta: false, explicacao: 'Faltou contar a segunda espera em Apto (12 a 14), e 11 seria o turnaround sem a E/S. Correto: espera 4 + 2 = 6; turnaround 16.' },
      ],
    },
    {
      id: 'm07-a01-q5',
      enunciado: 'Qual a diferença entre escalonamento preemptivo e não preemptivo?',
      alternativas: [
        { texto: 'No preemptivo o SO pode retirar a CPU de um processo que ainda quer executar (por fim de quantum ou por prioridade); no não preemptivo o processo só sai ao terminar, bloquear ou ceder a CPU.', correta: true, explicacao: 'Correto. Preempção = retirada forçada da CPU, devolvendo o processo a Apto. No não preemptivo nenhum evento externo tira a CPU do processo.' },
        { texto: 'No não preemptivo o processo nunca sai da CPU antes de terminar, nem mesmo para fazer E/S.', correta: false, explicacao: 'Mesmo no não preemptivo, um processo que pede E/S bloqueia e libera a CPU. O que não existe é a retirada forçada por relógio ou prioridade.' },
        { texto: 'O preemptivo não precisa de relógio; o não preemptivo precisa de interrupções de relógio.', correta: false, explicacao: 'É o contrário: a preempção por tempo depende de interrupções de relógio. Sem relógio, só o não preemptivo é possível.' },
        { texto: 'FIFO e SJF são preemptivos; Round Robin é não preemptivo.', correta: false, explicacao: 'Também ao contrário: FIFO e SJF (na forma clássica) são não preemptivos; Round Robin é preemptivo, pois tira a CPU ao fim do quantum.' },
      ],
    },
    {
      id: 'm07-a01-q6',
      enunciado: 'Qual nível de escalonamento é executado quando um processo é criado e <strong>controla o grau de multiprogramação</strong>?',
      alternativas: [
        { texto: 'Longo prazo.', correta: true, explicacao: 'Correto. O escalonador de longo prazo decide quando um processo recém-criado passa a ser Apto e, assim, quantos processos disputam a CPU (grau de multiprogramação).' },
        { texto: 'Curto prazo.', correta: false, explicacao: 'O curto prazo escolhe, entre os processos que já estão em Apto, qual usa a CPU agora. Ele não decide quantos processos entram no sistema.' },
        { texto: 'Médio prazo.', correta: false, explicacao: 'O médio prazo também influencia o grau de multiprogramação, mas pelo swapping (suspender e trazer de volta). Quem age na criação é o longo prazo.' },
        { texto: 'Dispatcher.', correta: false, explicacao: 'O dispatcher não é um nível de escalonamento: ele só executa a troca de contexto decidida pelo escalonador de curto prazo.' },
      ],
    },
    {
      id: 'm07-a01-q7',
      enunciado: 'O escalonador associado à gerência de memória, que participa do <strong>swapping</strong> suspendendo processos e trazendo-os de volta, é o de:',
      alternativas: [
        { texto: 'Médio prazo.', correta: true, explicacao: 'Correto. O médio prazo leva processos para o disco (Apto-suspenso, Bloqueado-suspenso) quando falta memória e os traz de volta depois.' },
        { texto: 'Curto prazo.', correta: false, explicacao: 'O curto prazo só escolhe quem usa a CPU entre os Aptos que estão na memória. Não move processos para o disco.' },
        { texto: 'Longo prazo.', correta: false, explicacao: 'O longo prazo age na admissão de processos novos. A suspensão de processos que já existem é do médio prazo.' },
        { texto: 'Tempo real.', correta: false, explicacao: '"Tempo real" é um tipo de sistema com prazos, não um nível de escalonamento. Os níveis são longo, médio e curto prazo.' },
      ],
    },
    {
      id: 'm07-a01-q8',
      enunciado: 'Em qual situação o escalonador de curto prazo <strong>não</strong> precisa ser chamado?',
      alternativas: [
        { texto: 'Quando o processo em execução faz uma soma entre dois registradores.', correta: true, explicacao: 'Correto. Uma instrução comum não gera evento para o SO. O escalonador é chamado em eventos: criação e término de processo, bloqueio, interrupção de E/S, interrupção de relógio, chamadas de sistema e sinais.' },
        { texto: 'Quando o processo em execução termina.', correta: false, explicacao: 'Ao término, a CPU fica livre e é preciso escolher outro processo Apto (ou o processo ocioso).' },
        { texto: 'Quando o processo em execução pede uma leitura de disco e bloqueia.', correta: false, explicacao: 'Ao bloquear, o processo libera a CPU, e o escalonador precisa escolher outro para executar.' },
        { texto: 'Quando ocorre uma interrupção de relógio num sistema preemptivo.', correta: false, explicacao: 'A interrupção de relógio é justamente o momento em que o escalonador preemptivo verifica se o quantum acabou e se deve trocar de processo.' },
      ],
    },
    {
      id: 'm07-a01-q9',
      enunciado: 'Em um sistema <strong>interativo</strong> (usuários em terminais), qual critério de escalonamento é o mais importante?',
      alternativas: [
        { texto: 'Tempo de resposta.', correta: true, explicacao: 'Correto. Segundo o Tanenbaum (Tabela 2.8), sistemas interativos priorizam o tempo de resposta e a proporcionalidade: o usuário quer reação rápida a cada comando.' },
        { texto: 'Throughput (tarefas por hora).', correta: false, explicacao: 'Throughput é o objetivo típico de sistemas em lote, onde ninguém está esperando na frente do terminal.' },
        { texto: 'Cumprimento de prazos.', correta: false, explicacao: 'Cumprir prazos é o objetivo de sistemas de tempo real (controle industrial, multimídia).' },
        { texto: 'Utilização da CPU próxima de 100%.', correta: false, explicacao: 'Utilização é objetivo de sistemas em lote. Num sistema interativo, uma CPU 100% ocupada pode até significar respostas lentas.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm07-a01-d1',
      enunciado: 'Explique o papel do escalonador de processos, seus objetivos e os níveis e tipos de escalonamento existentes.',
      respostaModelo: `<p>O <strong>escalonador</strong> é a rotina do SO que implementa a política de escalonamento: escolhe, entre os processos em Apto, qual vai usar o processador. Depois da escolha, o <strong>dispatcher</strong> faz a troca de contexto.</p>
<p><strong>Objetivos:</strong> maximizar a utilização do processador e o throughput; minimizar o turnaround, o tempo de espera e o tempo de resposta; ser justo com os processos.</p>
<p><strong>Níveis:</strong> <em>longo prazo</em>, executado na criação de processos, decide quando um processo novo vira Apto e controla o grau de multiprogramação; <em>médio prazo</em>, ligado à gerência de memória, faz o swapping (suspende processos e os traz de volta); <em>curto prazo</em>, o mais importante, escolhe qual Apto usa a CPU e é executado a cada interrupção de relógio, interrupção de E/S, chamada de sistema ou sinal.</p>
<p><strong>Tipos:</strong> <em>não preemptivo</em>, em que o processo só libera a CPU ao terminar, bloquear (E/S, sincronização) ou ceder voluntariamente (ex.: FIFO, SJF); <em>preemptivo</em>, em que o SO também pode retirar a CPU por interrupção de relógio (fim do quantum) ou pela chegada de um processo mais prioritário (ex.: Round Robin, prioridades).</p>`,
      pontosChave: [
        'Definiu escalonador como quem escolhe o processo Apto que usa a CPU (e citou o dispatcher fazendo a troca de contexto)',
        'Citou objetivos: utilização, throughput, turnaround, espera e/ou resposta',
        'Descreveu os três níveis: longo (admissão, grau de multiprogramação), médio (swapping) e curto (quem usa a CPU)',
        'Diferenciou preemptivo de não preemptivo, com exemplos',
      ],
    },
    {
      id: 'm07-a01-d2',
      enunciado: 'Explique a diferença entre tempo de processador, tempo de espera, turnaround e tempo de resposta.',
      respostaModelo: `<p><strong>Tempo de processador (tempo de CPU):</strong> tempo que o processo passa no estado Executando ao longo da vida.</p>
<p><strong>Tempo de espera:</strong> tempo total que o processo passa na fila de Apto, esperando a CPU. Não inclui o tempo Bloqueado esperando E/S.</p>
<p><strong>Turnaround (tempo de retorno):</strong> tempo da criação ao término do processo, somando espera por memória, espera em Apto, tempo de CPU e tempo em E/S.</p>
<p><strong>Tempo de resposta:</strong> tempo entre uma requisição ao sistema (um comando, um clique) e o instante em que a resposta é exibida. É o critério principal em sistemas interativos.</p>`,
      pontosChave: [
        'Tempo de CPU = tempo em Executando',
        'Tempo de espera = tempo na fila de Apto (sem contar a E/S)',
        'Turnaround = da criação ao término, incluindo tudo',
        'Tempo de resposta = da requisição até a resposta aparecer',
      ],
    },
  ],
});
})();
