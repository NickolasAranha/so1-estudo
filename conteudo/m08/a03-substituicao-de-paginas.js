// Módulo 8, aula 3: algoritmos de substituição de páginas e contagem de faltas.
SO1.registerLesson({
  id: 'm08-a03',
  titulo: 'Algoritmos de substituição de páginas',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §3.4 (p.122–133): ótimo, NRU, FIFO, segunda chance (Fig. 3.14), relógio (Fig. 3.15), LRU (Fig. 3.16), NFU e envelhecimento (Fig. 3.17), conjunto de trabalho (Fig. 3.18–3.19), WSClock (Fig. 3.20), resumo (Tab. 3.2)',
    'Silberschatz, Fundamentos de SO: anomalia de Belady (sequência 1 2 3 4 1 2 5 1 2 3 4 5) e algoritmos de pilha',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a geladeira cheia.</strong> Chegou compra nova e a geladeira está lotada: algo tem de sair. Você pode tirar <em>o que entrou primeiro</em> (FIFO), mesmo que seja o leite que todo mundo usa. Pode tirar <em>o que ninguém pega há mais tempo</em> (LRU), o que costuma funcionar muito bem. Ou, se tivesse uma bola de cristal, tiraria <em>o que só vai ser usado daqui a mais tempo</em> (ótimo). Tirar coisa errada significa voltar ao mercado logo em seguida.</p>
  <p>Na memória virtual, cada "volta ao mercado" é uma <strong>falta de página</strong>, que custa um acesso ao disco (milissegundos). O algoritmo de substituição escolhe <strong>qual página remover</strong> para minimizar essas faltas.</p>
</div>

<h2>O problema</h2>
<p>Na falta de página, sem moldura livre, o SO escolhe uma página para sair. Se ela foi <strong>modificada</strong> (bit M = 1), tem de ser gravada no disco; se não, basta sobrescrevê-la. Escolher ao acaso funciona, mas é melhor remover uma página <strong>pouco usada</strong>: uma página muito usada provavelmente volta logo, com custo extra.</p>

<h2>Os algoritmos</h2>
<h3>Ótimo</h3>
<p>Remove a página que vai demorar <strong>mais tempo para ser referenciada de novo</strong> (rotula cada página com o número de instruções até seu próximo uso e remove a de maior rótulo). É o melhor possível, mas <strong>impossível de implementar</strong>: o SO não sabe o futuro. Serve como <strong>padrão de comparação</strong>, simulando-o numa segunda execução com o registro de referências da primeira.</p>

<h3>NRU (não usada recentemente)</h3>
<p>Usa os bits <strong>R</strong> (referenciada) e <strong>M</strong> (modificada). Periodicamente (a cada tique do relógio), o SO zera o bit R. Na falta de página, as páginas são divididas em 4 classes:</p>
<table>
  <tr><th>Classe</th><th>R</th><th>M</th><th>Significado</th></tr>
  <tr><td>0</td><td>0</td><td>0</td><td>não referenciada, não modificada (melhor vítima)</td></tr>
  <tr><td>1</td><td>0</td><td>1</td><td>não referenciada, modificada</td></tr>
  <tr><td>2</td><td>1</td><td>0</td><td>referenciada, não modificada</td></tr>
  <tr><td>3</td><td>1</td><td>1</td><td>referenciada, modificada (pior vítima)</td></tr>
</table>
<p>O NRU remove <strong>aleatoriamente uma página da classe não vazia de menor número</strong>. A classe 1 parece impossível, mas surge quando a interrupção de relógio zera o R de uma página da classe 3 (o M não é zerado, pois indica se é preciso gravar no disco). Ideia: é melhor remover uma página modificada mas não usada há um tique do que uma página limpa muito usada. Fácil de entender e implementar; desempenho adequado.</p>

<h3>FIFO (primeiro a entrar, primeiro a sair)</h3>
<p>Lista das páginas em ordem de chegada; remove a <strong>mais antiga</strong> (a cabeça da lista). Barato, mas pode remover uma página muito usada só porque ela é antiga. Por isso, em sua forma pura, <strong>raramente é usado</strong>.</p>

<h3>Segunda chance</h3>
<p>FIFO melhorado: olha o bit R da página mais antiga. Se <strong>R = 0</strong>, ela é velha e não usada: é removida. Se <strong>R = 1</strong>, o bit é zerado e a página vai para o <strong>fim da lista</strong>, como se tivesse acabado de chegar (seu tempo de carga é atualizado); a busca continua. Se todas tiverem R = 1, ele degenera para o FIFO puro.</p>

<h3>Relógio</h3>
<p>Mesma lógica da segunda chance, mas sem ficar movendo páginas na lista: as páginas ficam numa <strong>lista circular</strong> e um <strong>ponteiro</strong> aponta a mais antiga. Na falta de página: se R = 0, a página é removida, a nova entra no lugar dela e o ponteiro avança; se R = 1, zera R e avança o ponteiro, repetindo até achar R = 0.</p>

<figure class="diagrama">
  <svg viewBox="0 0 520 300" style="max-width:600px" role="img" aria-label="Algoritmo do relógio: páginas em círculo com bit R, ponteiro na página C">
    <g font-size="13" fill="currentColor" text-anchor="middle">
      <circle cx="170" cy="150" r="105" fill="none" stroke="currentColor" stroke-dasharray="3 5"/>
      <rect x="145" y="28" width="50" height="34" rx="6" style="fill:var(--cartao)" stroke="currentColor"/><text x="170" y="50">A R=1</text>
      <rect x="230" y="60" width="50" height="34" rx="6" style="fill:var(--cartao)" stroke="currentColor"/><text x="255" y="82">B R=0</text>
      <rect x="255" y="133" width="58" height="34" rx="6" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="2"/><text x="284" y="155">C R=1</text>
      <rect x="230" y="206" width="50" height="34" rx="6" style="fill:var(--cartao)" stroke="currentColor"/><text x="255" y="228">D R=1</text>
      <rect x="145" y="238" width="50" height="34" rx="6" style="fill:var(--vermelho-claro);stroke:var(--vermelho)" stroke-width="2"/><text x="170" y="260">E R=0</text>
      <rect x="60" y="206" width="50" height="34" rx="6" style="fill:var(--cartao)" stroke="currentColor"/><text x="85" y="228">F R=1</text>
      <rect x="27" y="133" width="50" height="34" rx="6" style="fill:var(--cartao)" stroke="currentColor"/><text x="52" y="155">G R=0</text>
      <rect x="60" y="60" width="50" height="34" rx="6" style="fill:var(--cartao)" stroke="currentColor"/><text x="85" y="82">H R=1</text>
    </g>
    <path d="M170 150 L250 150" style="stroke:var(--ambar)" stroke-width="3"/>
    <polygon points="252,144 252,156 262,150" style="fill:var(--ambar)"/>
    <circle cx="170" cy="150" r="5" style="fill:var(--ambar)"/>
    <g font-size="12" fill="currentColor">
      <text x="335" y="70" font-weight="bold">Falta de página, ponteiro em C:</text>
      <text x="335" y="95">1. C tem R=1: zera R, avança</text>
      <text x="335" y="117">2. D tem R=1: zera R, avança</text>
      <text x="335" y="139" style="fill:var(--vermelho)" font-weight="bold">3. E tem R=0: E sai,</text>
      <text x="335" y="157" style="fill:var(--vermelho)" font-weight="bold">    a nova página entra</text>
      <text x="335" y="175">    no lugar de E</text>
      <text x="335" y="197">4. O ponteiro avança para F</text>
      <text x="335" y="232" font-size="11">R = 0: remover a página</text>
      <text x="335" y="248" font-size="11">R = 1: zerar R e avançar</text>
    </g>
  </svg>
  <figcaption>Algoritmo do relógio (Tanenbaum, Fig. 3.15): é a segunda chance implementada com lista circular e ponteiro, sem mover páginas.</figcaption>
</figure>

<h3>LRU (usada menos recentemente)</h3>
<p>Baseia-se na <strong>localidade</strong>: páginas muito usadas nas últimas instruções provavelmente serão usadas de novo, e páginas sem uso há muito tempo provavelmente continuarão sem uso. Na falta, remove a página <strong>não usada há mais tempo</strong>. É uma ótima aproximação do ótimo, mas <strong>cara</strong>: exige atualizar uma lista a cada referência à memória. Implementações com hardware especial: um <strong>contador de 64 bits</strong> incrementado a cada instrução e copiado na entrada da página a cada acesso (remove a de menor contador), ou uma <strong>matriz n × n de bits</strong> (ao referenciar a moldura k, liga a linha k e zera a coluna k; a linha de menor valor binário é a LRU).</p>

<h3>NFU e envelhecimento (aging): LRU em software</h3>
<p>O <strong>NFU</strong> (não frequentemente usada) soma o bit R a um contador por página a cada tique e remove a de menor contador. Problema: <strong>nunca esquece</strong> (uma página muito usada no passado continua com contador alto). O <strong>envelhecimento</strong> corrige isso: a cada tique, cada contador é <strong>deslocado 1 bit para a direita</strong> e o bit R é colocado no <strong>bit mais à esquerda</strong>. Remove-se a página de menor contador. Difere do LRU porque não distingue a ordem dos acessos dentro de um mesmo tique e porque o contador tem bits finitos (8 bits = 8 tiques de memória).</p>

<h3>Conjunto de trabalho (working set)</h3>
<ul>
  <li><strong>Paginação por demanda</strong>: o processo começa sem páginas e cada uma é carregada só quando pedida (por falta de página).</li>
  <li><strong>Localidade de referência</strong>: em cada fase, o processo usa só uma pequena fração de suas páginas.</li>
  <li><strong>Conjunto de trabalho</strong>: o conjunto de páginas que o processo está usando atualmente, w(k, t) = páginas usadas nas k referências mais recentes. Se ele cabe na memória, há poucas faltas; se não cabe, o processo gera faltas a cada poucas instruções: <strong>ultrapaginação (thrashing)</strong>.</li>
  <li><strong>Pré-paginação</strong>: carregar o conjunto de trabalho <em>antes</em> de o processo voltar a executar.</li>
</ul>
<p>Na prática usa-se o <strong>tempo virtual atual</strong> (tempo de CPU que o processo realmente usou): o conjunto de trabalho são as páginas usadas nos últimos τ segundos de tempo virtual. Cada entrada guarda o <strong>instante do último uso</strong> e o bit R. Na falta de página, a tabela é varrida:</p>
<ul>
  <li><strong>R = 1</strong>: a página foi usada neste tique; o instante do último uso recebe o tempo virtual atual. Não é removida.</li>
  <li><strong>R = 0 e idade &gt; τ</strong> (idade = tempo atual − último uso): está fora do conjunto de trabalho; é removida.</li>
  <li><strong>R = 0 e idade ≤ τ</strong>: está no conjunto; é poupada, mas o SO anota a de maior idade. Se nenhuma for removida, sai a de maior idade; se todas tiverem R = 1, sai uma aleatória, de preferência limpa.</li>
</ul>
<p>O <strong>WSClock</strong> junta isso ao relógio: lista circular com instante do último uso, R e M. R = 1: zera e avança. R = 0, idade &gt; τ e página <strong>limpa</strong>: é substituída. Se estiver <strong>suja</strong>, agenda a escrita em disco e avança (pode haver uma página velha e limpa logo adiante). É simples, eficiente e muito usado.</p>

<h3>Tabela-resumo (Tanenbaum, Tab. 3.2)</h3>
<table>
  <tr><th>Algoritmo</th><th>Comentário</th></tr>
  <tr><td>Ótimo</td><td>Não implementável, mas útil como padrão de desempenho</td></tr>
  <tr><td>NRU (não usada recentemente)</td><td>Aproximação muito rudimentar do LRU</td></tr>
  <tr><td>FIFO</td><td>Pode descartar páginas importantes</td></tr>
  <tr><td>Segunda chance</td><td>Algoritmo FIFO bastante melhorado</td></tr>
  <tr><td>Relógio</td><td>Realista</td></tr>
  <tr><td>LRU (usada menos recentemente)</td><td>Excelente, porém difícil de implementar de maneira exata</td></tr>
  <tr><td>NFU (não frequentemente usada)</td><td>Aproximação bastante rudimentar do LRU</td></tr>
  <tr><td>Envelhecimento (aging)</td><td>Algoritmo eficiente que aproxima bem o LRU</td></tr>
  <tr><td>Conjunto de trabalho</td><td>Implementação um tanto cara</td></tr>
  <tr><td>WSClock</td><td>Algoritmo bom e eficiente</td></tr>
</table>
<p>Segundo o livro, os dois melhores na prática são o <strong>envelhecimento</strong> e o <strong>WSClock</strong>.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: contando faltas de página.</strong> Sequência de referências <strong>7 0 1 2 0 3 0 4 2 3</strong>, 3 molduras, memória inicialmente vazia. Cada coluna mostra as molduras <em>depois</em> da referência; F = falta.</p>
  <p><strong>FIFO</strong> (sai a que entrou há mais tempo):</p>
  <table>
    <tr><td><strong>Ref.</strong></td><td>7</td><td>0</td><td>1</td><td>2</td><td>0</td><td>3</td><td>0</td><td>4</td><td>2</td><td>3</td></tr>
    <tr><td>Moldura 1</td><td>7</td><td>7</td><td>7</td><td>2</td><td>2</td><td>2</td><td>2</td><td>4</td><td>4</td><td>4</td></tr>
    <tr><td>Moldura 2</td><td></td><td>0</td><td>0</td><td>0</td><td>0</td><td>3</td><td>3</td><td>3</td><td>2</td><td>2</td></tr>
    <tr><td>Moldura 3</td><td></td><td></td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>3</td></tr>
    <tr><td>Falta?</td><td>F</td><td>F</td><td>F</td><td>F</td><td></td><td>F</td><td>F</td><td>F</td><td>F</td><td>F</td></tr>
  </table>
  <p>Total: <strong>9 faltas</strong>. Repare: em "3" sai o 0 (o mais antigo, mesmo tendo sido usado logo antes) e na referência seguinte o 0 já faz falta.</p>
  <p><strong>LRU</strong> (sai a que está há mais tempo sem uso):</p>
  <table>
    <tr><td><strong>Ref.</strong></td><td>7</td><td>0</td><td>1</td><td>2</td><td>0</td><td>3</td><td>0</td><td>4</td><td>2</td><td>3</td></tr>
    <tr><td>Moldura 1</td><td>7</td><td>7</td><td>7</td><td>2</td><td>2</td><td>2</td><td>2</td><td>4</td><td>4</td><td>4</td></tr>
    <tr><td>Moldura 2</td><td></td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>3</td></tr>
    <tr><td>Moldura 3</td><td></td><td></td><td>1</td><td>1</td><td>1</td><td>3</td><td>3</td><td>3</td><td>2</td><td>2</td></tr>
    <tr><td>Falta?</td><td>F</td><td>F</td><td>F</td><td>F</td><td></td><td>F</td><td></td><td>F</td><td>F</td><td>F</td></tr>
  </table>
  <p>Total: <strong>8 faltas</strong>. Em "3", o último uso de cada página era 2 (4º), 0 (5º) e 1 (3º): sai o 1. O 0, usado há pouco, fica, e a referência seguinte a 0 é acerto.</p>
  <p><strong>Ótimo</strong> (sai a que demora mais para ser usada de novo):</p>
  <table>
    <tr><td><strong>Ref.</strong></td><td>7</td><td>0</td><td>1</td><td>2</td><td>0</td><td>3</td><td>0</td><td>4</td><td>2</td><td>3</td></tr>
    <tr><td>Moldura 1</td><td>7</td><td>7</td><td>7</td><td>2</td><td>2</td><td>2</td><td>2</td><td>2</td><td>2</td><td>2</td></tr>
    <tr><td>Moldura 2</td><td></td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>4</td><td>4</td><td>4</td></tr>
    <tr><td>Moldura 3</td><td></td><td></td><td>1</td><td>1</td><td>1</td><td>3</td><td>3</td><td>3</td><td>3</td><td>3</td></tr>
    <tr><td>Falta?</td><td>F</td><td>F</td><td>F</td><td>F</td><td></td><td>F</td><td></td><td>F</td><td></td><td></td></tr>
  </table>
  <p>Total: <strong>6 faltas</strong>, o mínimo possível. Em "2", nem 7 nem 1 voltam a ser usados (qualquer um serve; saiu o 7). Em "4", o 0 nunca mais é usado, então sai o 0.</p>
  <p>Resultado: Ótimo (6) &lt; LRU (8) &lt; FIFO (9). Dica de método: anote, para cada página na memória, <em>quando entrou</em> (FIFO), <em>quando foi usada por último</em> (LRU) ou <em>quando será usada de novo</em> (ótimo).</p>
</div>

<h2>Anomalia de Belady</h2>
<p>Intuitivamente, mais molduras deveriam dar menos faltas. Mas com o <strong>FIFO</strong> isso nem sempre vale. Com a sequência <strong>1 2 3 4 1 2 5 1 2 3 4 5</strong>, o FIFO tem <strong>9 faltas com 3 molduras</strong> e <strong>10 faltas com 4 molduras</strong>. Esse aumento de faltas com mais memória é a <strong>anomalia de Belady</strong>. O <strong>LRU</strong> e o <strong>ótimo</strong> não sofrem dela (são "algoritmos de pilha": o conjunto de páginas na memória com n molduras está sempre contido no conjunto com n + 1).</p>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>As primeiras referências com memória vazia <strong>também contam como faltas</strong> (faltas compulsórias). Com 3 molduras, as 3 primeiras páginas distintas já são 3 faltas.</li>
    <li>No <strong>FIFO</strong>, um acerto <strong>não</strong> muda a ordem; no <strong>LRU</strong>, cada acerto atualiza o "último uso". É o erro mais comum ao montar a tabela.</li>
    <li>O <strong>ótimo</strong> não é implementável; é referência para comparar os outros.</li>
    <li>NRU remove da <strong>menor classe não vazia</strong>; NFU ≠ NRU (NFU conta referências e nunca esquece).</li>
    <li>Segunda chance e relógio têm o <strong>mesmo comportamento</strong>; o relógio só é mais eficiente (não move páginas na lista).</li>
    <li>A anomalia de Belady acontece no <strong>FIFO</strong>, não no LRU nem no ótimo.</li>
  </ul>
</div>
`,
  resumo: 'Na falta de página sem moldura livre, o algoritmo de substituição escolhe a vítima. O ótimo (remove a usada mais tarde no futuro) é impossível, mas serve de padrão. NRU usa 4 classes de R e M; FIFO remove a mais antiga; segunda chance e relógio poupam páginas com R = 1; LRU remove a não usada há mais tempo (excelente, mas caro), aproximado em software pelo envelhecimento; conjunto de trabalho e WSClock removem páginas fora do conjunto usado nos últimos τ de tempo virtual. O FIFO sofre a anomalia de Belady.',
  questoes: [
    {
      id: 'm08-a03-q1',
      enunciado: 'Sequência de referências <strong>1 2 3 1 4 1 5 2 1 4</strong>, 3 molduras, memória inicialmente vazia. Quantas faltas de página ocorrem com o <strong>LRU</strong>?',
      alternativas: [
        { texto: '7.', correta: true, explicacao: 'Correto. <pre class="codigo"><code>ref  molduras   falta  (sai)\n 1   1 - -      F\n 2   1 2 -      F\n 3   1 2 3      F\n 1   1 2 3      -\n 4   1 4 3      F   (2: sem uso há mais tempo)\n 1   1 4 3      -\n 5   1 4 5      F   (3)\n 2   1 2 5      F   (4)\n 1   1 2 5      -\n 4   1 2 4      F   (5)\nTotal = 7</code></pre>' },
        { texto: '8.', correta: false, explicacao: '8 é o resultado do FIFO. O erro típico é não atualizar o último uso nos acertos: no LRU, o acerto em 1 (4ª ref.) torna o 1 recente, então em "4" sai o 2, e não o 1.' },
        { texto: '6.', correta: false, explicacao: '6 é o resultado do ótimo, que olha o futuro. A diferença nasce na 5ª referência (o 4), com a memória {1, 2, 3}: o LRU remove o 2 (sem uso há mais tempo), mas o 2 volta na 8ª referência e gera uma falta; o ótimo removeria o 3, que nunca mais é usado. Por isso o LRU tem uma falta a mais (7 contra 6).' },
        { texto: '10.', correta: false, explicacao: 'Isso seria contar todas as referências como faltas. Há 3 acertos (as referências ao 1 na 4ª, 6ª e 9ª posições), então são 10 − 3 = 7 faltas.' },
      ],
    },
    {
      id: 'm08-a03-q2',
      enunciado: 'Mesma sequência <strong>1 2 3 1 4 1 5 2 1 4</strong>, 3 molduras, memória vazia. Quantas faltas ocorrem com o <strong>FIFO</strong>?',
      alternativas: [
        { texto: '8.', correta: true, explicacao: 'Correto. No FIFO, acerto não muda a fila. <pre class="codigo"><code>ref  fila (antiga->nova)  falta (sai)\n 1   1                   F\n 2   1 2                 F\n 3   1 2 3               F\n 1   1 2 3               -\n 4   2 3 4               F  (1)\n 1   3 4 1               F  (2)\n 5   4 1 5               F  (3)\n 2   1 5 2               F  (4)\n 1   1 5 2               -\n 4   5 2 4               F  (1)\nTotal = 8</code></pre>' },
        { texto: '7.', correta: false, explicacao: '7 é o resultado do LRU. No FIFO, o acerto em 1 na 4ª referência não "rejuvenesce" o 1: ele continua o mais antigo e sai quando chega o 4, gerando uma falta logo depois.' },
        { texto: '6.', correta: false, explicacao: '6 é o ótimo, o mínimo possível para essa sequência e 3 molduras. O FIFO não pode fazer melhor que o ótimo.' },
        { texto: '9.', correta: false, explicacao: 'Há dois acertos no FIFO (4ª e 9ª referências), então são 10 − 2 = 8 faltas. Refaça a fila sem mexer nela nos acertos.' },
      ],
    },
    {
      id: 'm08-a03-q3',
      enunciado: 'Com a sequência <strong>1 2 3 4 1 2 5 1 2 3 4 5</strong> e o algoritmo <strong>FIFO</strong>, quantas faltas ocorrem com 3 e com 4 molduras?',
      alternativas: [
        { texto: '9 faltas com 3 molduras e 10 com 4: é a anomalia de Belady.', correta: true, explicacao: 'Correto. <pre class="codigo"><code>3 molduras: 1F 2F 3F 4F 1F 2F 5F 1- 2- 3F 4F 5-  = 9\n4 molduras: 1F 2F 3F 4F 1- 2- 5F 1F 2F 3F 4F 5F = 10</code></pre> Com 4 molduras, o 5 expulsa o 1 (mais antigo) e daí cada página chega logo depois de ser expulsa. Mais memória, mais faltas.' },
        { texto: '10 faltas com 3 molduras e 9 com 4.', correta: false, explicacao: 'Os números estão invertidos. O que torna a sequência famosa é justamente o FIFO piorar com mais molduras: 9 com 3 e 10 com 4.' },
        { texto: '9 faltas com 3 molduras e 8 com 4.', correta: false, explicacao: '8 faltas com 4 molduras é o resultado do LRU, que não sofre a anomalia. O FIFO tem 10.' },
        { texto: '12 faltas nos dois casos.', correta: false, explicacao: 'Há acertos nos dois casos: com 3 molduras, as referências 1, 2 (8ª e 9ª) e 5 (última) são acertos; com 4 molduras, 1 e 2 (5ª e 6ª).' },
      ],
    },
    {
      id: 'm08-a03-q4',
      enunciado: 'No NRU, ocorre uma falta de página e a memória tem: P1 (R=1, M=1), P2 (R=0, M=1), P3 (R=1, M=0) e P4 (R=1, M=1). Qual página é removida?',
      alternativas: [
        { texto: 'P2, única da classe 1 (não referenciada, modificada), a menor classe não vazia.', correta: true, explicacao: 'Correto. Classes: P1 e P4 = 3 (R=1, M=1); P2 = 1 (R=0, M=1); P3 = 2 (R=1, M=0). Não há classe 0, então a vítima sai da classe 1: P2. Ela será gravada no disco antes de sair, pois M = 1.' },
        { texto: 'P3, porque é a única não modificada e não precisa ser gravada no disco.', correta: false, explicacao: 'P3 está na classe 2 (R=1, M=0). O NRU prefere uma página não usada recentemente, mesmo suja (classe 1), a uma página limpa mas em uso (classe 2).' },
        { texto: 'P1, porque é a primeira da lista.', correta: false, explicacao: 'Escolher pela posição seria FIFO. O NRU escolhe pela classe; P1 está na classe 3, a pior vítima.' },
        { texto: 'Nenhuma, pois a classe 1 é impossível e indica erro.', correta: false, explicacao: 'A classe 1 parece impossível, mas surge quando a interrupção de relógio zera o bit R de uma página da classe 3 (o M não é zerado).' },
      ],
    },
    {
      id: 'm08-a03-q5',
      enunciado: 'No algoritmo do <strong>relógio</strong>, o ponteiro está na página C e a lista circular segue C (R=1), D (R=1), E (R=0), F (R=1). Ocorre uma falta de página. O que acontece?',
      alternativas: [
        { texto: 'C e D têm R zerado e o ponteiro passa por elas; E é removida, a nova página entra no lugar de E e o ponteiro avança para F.', correta: true, explicacao: 'Correto. <pre class="codigo"><code>C: R=1 -> R=0, avança\nD: R=1 -> R=0, avança\nE: R=0 -> remove E, nova página entra aqui\nponteiro -> F</code></pre> C e D ganharam uma "segunda chance".' },
        { texto: 'C é removida, pois é a página apontada.', correta: false, explicacao: 'A página apontada só sai se tiver R = 0. C tem R = 1, então tem o bit zerado e é poupada.' },
        { texto: 'E é removida, mas os bits R de C e D continuam em 1.', correta: false, explicacao: 'Ao passar por uma página com R = 1, o relógio zera seu bit R. Se não zerasse, ela seria poupada para sempre.' },
        { texto: 'C vai para o fim da lista com R = 0 e D é removida.', correta: false, explicacao: 'Mover para o fim da lista é o jeito da segunda chance. No relógio nada se move; e D também tem R = 1, então também é poupada.' },
      ],
    },
    {
      id: 'm08-a03-q6',
      enunciado: 'No algoritmo do <strong>envelhecimento</strong> (aging) com contadores de 8 bits, todos começam em 00000000. Nos três tiques seguintes, os bits R das páginas A, B e C são: tique 1: A=1, B=0, C=1; tique 2: A=0, B=1, C=1; tique 3: A=0, B=1, C=0. Qual página é removida numa falta logo após o tique 3?',
      alternativas: [
        { texto: 'A, cujo contador é o menor (00100000).', correta: true, explicacao: 'Correto. A cada tique: desloca 1 bit à direita e põe R no bit da esquerda. <pre class="codigo"><code>     tique 1   tique 2   tique 3\nA:  10000000  01000000  00100000\nB:  00000000  10000000  11000000\nC:  10000000  11000000  01100000</code></pre> Menor contador: A (32), depois C (96) e B (192).' },
        { texto: 'B, pois não foi referenciada no tique 1.', correta: false, explicacao: 'O envelhecimento dá mais peso às referências recentes. B foi usada nos tiques 2 e 3 e tem o maior contador (11000000).' },
        { texto: 'C, pois não foi referenciada no último tique.', correta: false, explicacao: 'A também não foi referenciada no tique 3, e nem no tique 2. O contador de C (01100000) é maior que o de A (00100000).' },
        { texto: 'Empate entre A e C, pois as duas têm R = 0 no último tique; o SO sorteia uma.', correta: false, explicacao: 'Não há empate: os contadores são 00100000 (A) e 01100000 (C), porque C foi usada no tique 2 e A não. O envelhecimento guarda o histórico dos últimos 8 tiques, não só o último bit R (quem olha só o R atual é o NRU).' },
      ],
    },
    {
      id: 'm08-a03-q7',
      enunciado: 'No algoritmo do conjunto de trabalho, o tempo virtual atual é 2204 e τ = 600. A tabela tem, entre outras com R = 1, duas páginas com R = 0: uma com instante do último uso 1213 e outra com 1620. Qual é removida?',
      alternativas: [
        { texto: 'A de último uso 1213, pois sua idade (991) é maior que τ: está fora do conjunto de trabalho.', correta: true, explicacao: 'Correto. Idade = tempo atual − último uso. 2204 − 1213 = 991 &gt; 600 → fora do conjunto, removida. 2204 − 1620 = 584 ≤ 600 → ainda no conjunto, poupada. As páginas com R = 1 só têm o último uso atualizado para 2204.' },
        { texto: 'A de último uso 1620, pois foi a última a ser usada.', correta: false, explicacao: 'Idade de 1620 = 2204 − 1620 = 584, que é ≤ τ: ela ainda está no conjunto de trabalho. Quem sai é a que está há mais tempo sem uso, com idade &gt; τ.' },
        { texto: 'Nenhuma: como há páginas com R = 1, sai uma delas aleatoriamente.', correta: false, explicacao: 'Páginas com R = 1 foram usadas neste tique e estão no conjunto de trabalho. A escolha aleatória só acontece se todas tiverem R = 1.' },
        { texto: 'As duas, pois ambas têm R = 0.', correta: false, explicacao: 'Uma falta de página precisa liberar uma moldura. Além disso, R = 0 não basta: a página com idade 584 ≤ τ está no conjunto de trabalho e é poupada.' },
      ],
    },
    {
      id: 'm08-a03-q8',
      enunciado: 'Na <strong>segunda chance</strong>, as páginas A a H estão na lista em ordem de chegada (A é a mais antiga). Ocorre uma falta; A tem R = 1 e B tem R = 0. O que acontece?',
      alternativas: [
        { texto: 'A tem R zerado e vai para o fim da lista como se tivesse acabado de chegar; B é removida.', correta: true, explicacao: 'Correto (Tanenbaum, Fig. 3.14). A página mais antiga com R = 1 ganha uma segunda chance: R = 0 e tempo de carga atualizado, indo para o fim. A busca continua em B, que é velha e não usada: sai.' },
        { texto: 'A é removida, por ser a mais antiga.', correta: false, explicacao: 'Isso seria o FIFO puro. A segunda chance verifica o bit R: como A foi usada (R = 1), é poupada.' },
        { texto: 'A é removida e B vai para o fim da lista.', correta: false, explicacao: 'Invertido: quem tem R = 1 (A) é poupada e vai para o fim; quem tem R = 0 (B) é removida.' },
        { texto: 'H é removida, por ser a mais recente.', correta: false, explicacao: 'Nenhum algoritmo razoável remove a página mais recente. A segunda chance começa pela mais antiga.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm08-a03-d1',
      enunciado: 'Compare os algoritmos de substituição de páginas ótimo, FIFO, segunda chance/relógio e LRU: como cada um escolhe a vítima, vantagens e desvantagens. O que é a anomalia de Belady?',
      respostaModelo: `<p>O <strong>ótimo</strong> remove a página que vai demorar mais para ser referenciada de novo. Gera o menor número possível de faltas, mas é <strong>impossível de implementar</strong>, porque o SO não conhece o futuro; serve como padrão de comparação.</p>
<p>O <strong>FIFO</strong> remove a página que está há mais tempo na memória. É simples e barato, mas pode remover uma página muito usada só porque é antiga.</p>
<p>A <strong>segunda chance</strong> melhora o FIFO usando o bit R: se a mais antiga tem R = 0, sai; se tem R = 1, o bit é zerado e ela vai para o fim da fila. O <strong>relógio</strong> faz o mesmo com uma lista circular e um ponteiro, sem mover páginas, por isso é mais eficiente.</p>
<p>O <strong>LRU</strong> remove a página não usada há mais tempo, apoiado na localidade de referência. É uma ótima aproximação do ótimo, mas implementá-lo exatamente é caro (precisa atualizar uma lista ou contador a cada acesso à memória, com hardware especial); em software é aproximado pelo envelhecimento (aging).</p>
<p>A <strong>anomalia de Belady</strong> é o aumento do número de faltas quando se aumenta o número de molduras, o que pode acontecer com o FIFO. Exemplo: a sequência 1 2 3 4 1 2 5 1 2 3 4 5 gera 9 faltas com 3 molduras e 10 com 4. O LRU e o ótimo não sofrem dessa anomalia.</p>`,
      pontosChave: [
        'Ótimo: remove a que será usada mais tarde; mínimo de faltas, mas não implementável (padrão de comparação)',
        'FIFO: remove a mais antiga; simples, mas pode remover página muito usada',
        'Segunda chance/relógio: usam o bit R para poupar páginas referenciadas; o relógio usa lista circular com ponteiro',
        'LRU: remove a não usada há mais tempo; bom desempenho, mas caro de implementar (hardware ou aproximação por aging)',
        'Anomalia de Belady: mais molduras gerando mais faltas, típica do FIFO',
      ],
    },
  ],
});
