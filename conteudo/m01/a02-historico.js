// Módulo 1, aula 2: gerações, batch, monitor residente, spooling, multiprogramação e timesharing.
SO1.registerLesson({
  id: 'm01-a02',
  titulo: 'Histórico: do batch ao timesharing',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §1.2 (p.4–11)',
    'Slides cap1 (Oliveira/Carissimi/Toscani, UFRGS): histórico, sistemas em lote, monitor residente, multiprogramação, timesharing',
    'Slides cap2 (Oliveira/Carissimi/Toscani, UFRGS): suporte de hardware à multiprogramação',
    'Silberschatz, Fundamentos de SO (monitor residente e DMA, conhecimento consolidado)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a evolução de uma cozinha.</strong></p>
  <ol>
    <li>No começo, cada cliente entra na cozinha e prepara a própria comida; os outros esperam na fila (sem SO: o usuário opera a máquina).</li>
    <li>Depois, os clientes deixam os pedidos no balcão e um <strong>gerente</strong> que nunca sai da cozinha passa de um pedido para o próximo sozinho (lote + <strong>monitor residente</strong>).</li>
    <li>Então o cozinheiro percebe que, enquanto um prato está no forno, dá para preparar outro (<strong>multiprogramação</strong>).</li>
    <li>Por fim, o garçom passa tão rápido por cada mesa que cada cliente sente que é o único atendido (<strong>timesharing</strong>).</li>
  </ol>
</div>

<p>A evolução dos SOs foi motivada por três coisas: <strong>melhor utilização dos recursos</strong> (o computador era caríssimo e não podia ficar parado), <strong>avanços tecnológicos</strong> (novos tipos de hardware) e <strong>adição de novos serviços</strong>. O Tanenbaum organiza a história pelas gerações de hardware.</p>

<h2>As quatro gerações</h2>
<table>
  <tr><th>Geração</th><th>Hardware</th><th>Como se usava</th><th>Marco do SO</th></tr>
  <tr><td><strong>1ª (1945–1955)</strong></td><td>Válvulas e painéis de programação</td><td>O mesmo grupo projetava, construía, programava e operava a máquina. Programação em linguagem de máquina, sem nem assembly. O programador reservava horário numa planilha. No início dos anos 1950 vieram os cartões perfurados.</td><td><strong>Não havia SO.</strong></td></tr>
  <tr><td><strong>2ª (1955–1965)</strong></td><td>Transistores; computadores de grande porte (mainframes)</td><td><strong>Operadores profissionais</strong>: o usuário entrega o <strong>job</strong> (programa + dados em cartões) e não opera mais a máquina. Jobs agrupados em <strong>lote (batch)</strong>.</td><td><strong>Sistemas em lote e monitor residente</strong> (ex.: FMS, IBSYS no IBM 7094).</td></tr>
  <tr><td><strong>3ª (1965–1980)</strong></td><td>Circuitos integrados (IBM System/360); minicomputadores (PDP)</td><td>Discos magnéticos, terminais on-line.</td><td><strong>Multiprogramação, spooling e timesharing</strong> (OS/360, CTSS, MULTICS; o UNIX nasce de uma versão simplificada do MULTICS).</td></tr>
  <tr><td><strong>4ª (1980–hoje)</strong></td><td>Integração em larga escala (LSI); microprocessador</td><td>Computador pessoal: uma pessoa, uma máquina.</td><td>CP/M, MS-DOS, interface gráfica (Macintosh, Windows), Windows NT, Linux.</td></tr>
</table>

<h2>Sistemas em lote (batch)</h2>
<p>Na 2ª geração, o computador custava milhões e o tempo perdido entre um job e outro era desperdício. A solução foi o <strong>lote</strong>: jobs com necessidades parecidas (por exemplo, todos usando o mesmo compilador Fortran) eram agrupados. No esquema do Tanenbaum, um IBM 1401 (barato) lia os cartões e gravava o lote numa fita; o IBM 7094 (caro) processava a fita e gravava a saída em outra fita; outro 1401 imprimia essa saída <strong>off-line</strong> (sem estar ligado ao computador principal).</p>
<p>No início, a <strong>passagem de um job para o outro continuava manual</strong>: o operador tinha que intervir a cada job. Automatizar essa passagem deu origem ao primeiro SO.</p>

<h2>Monitor residente</h2>
<p>O <strong>monitor residente</strong> é considerado o <strong>primeiro sistema operacional</strong> (rudimentar). Ele faz o <strong>sequenciamento automático de jobs</strong>, transferindo o controle de um job para o próximo sem intervenção do operador.</p>
<ul>
  <li><strong>Residente</strong>: fica <strong>permanentemente na memória</strong>. É o primeiro programa a executar.</li>
  <li>Ele lê os <strong>cartões de controle</strong> e <strong>transfere o controle para o job</strong>.</li>
  <li>Quando o job termina, <strong>o controle retorna ao monitor</strong>, que carrega o próximo job automaticamente.</li>
  <li>Ele <strong>centraliza as rotinas de acesso a periféricos</strong> e as disponibiliza aos programas dos usuários (cada programa não precisa ter seu próprio código para a leitora ou a impressora).</li>
</ul>
<p>Os <strong>cartões de controle</strong> diziam ao monitor o que fazer. No FMS (Fortran Monitor System), um job típico era:</p>
<table>
  <tr><th>Cartão</th><th>Função</th></tr>
  <tr><td><code>$JOB</code></td><td>Início do job: tempo máximo de execução, número da conta e nome do programador.</td></tr>
  <tr><td><code>$FORTRAN</code></td><td>Carregar o compilador Fortran da fita e compilar os cartões seguintes (o programa).</td></tr>
  <tr><td><code>$LOAD</code></td><td>Carregar na memória o programa recém-compilado.</td></tr>
  <tr><td><code>$RUN</code></td><td>Executar o programa com os dados dos cartões seguintes.</td></tr>
  <tr><td><code>$END</code></td><td>Fim do job: o controle volta ao monitor.</td></tr>
</table>
<p>Esses cartões são os precursores das linguagens de controle de tarefas (JCL) e dos interpretadores de comando atuais. Segundo o Silberschatz, o monitor tem três partes: <strong>carregador</strong>, <strong>sequenciador de jobs</strong> e <strong>interpretador de cartões de controle</strong>, além das rotinas de E/S.</p>

<figure class="diagrama">
  <svg viewBox="0 0 420 270" style="max-width:600px" role="img" aria-label="Memória com monitor residente e área do job, ao lado de um maço de cartões de controle">
    <g font-size="13" fill="currentColor" text-anchor="middle">
      <text x="90" y="18" font-weight="bold">Memória</text>
      <rect x="10" y="28" width="160" height="120" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="90" y="50" font-weight="bold">Monitor residente</text>
      <text x="90" y="72" font-size="12">carregador</text>
      <text x="90" y="90" font-size="12">sequenciador de jobs</text>
      <text x="90" y="108" font-size="12">interpretador de cartões</text>
      <text x="90" y="126" font-size="12">rotinas de E/S</text>
      <rect x="10" y="148" width="160" height="90" rx="6" fill="none" stroke="currentColor"/>
      <text x="90" y="190">Área do programa</text>
      <text x="90" y="208">do usuário (1 job)</text>
    </g>
    <g fill="none" stroke-width="2">
      <path d="M180 100 C214 100 214 190 180 190" style="stroke:var(--verde)"/>
      <path d="M188 183 L178 190 L188 197" style="stroke:var(--verde)"/>
      <path d="M180 205 C228 205 228 85 180 85" style="stroke:var(--ambar)" stroke-dasharray="5 4"/>
      <path d="M188 78 L178 85 L188 92" style="stroke:var(--ambar)"/>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="226" y="178">1. transfere</text>
      <text x="226" y="192">o controle</text>
      <text x="226" y="92" style="fill:var(--ambar)">2. job termina:</text>
      <text x="226" y="106" style="fill:var(--ambar)">controle volta</text>
    </g>
    <g font-size="12" fill="currentColor" font-family="monospace">
      <rect x="306" y="214" width="100" height="22" fill="none" stroke="currentColor"/><text x="312" y="230">$JOB</text>
      <rect x="312" y="192" width="100" height="22" fill="none" stroke="currentColor"/><text x="318" y="208">$FORTRAN</text>
      <rect x="318" y="170" width="94" height="22" fill="none" stroke="currentColor" stroke-dasharray="3 3"/><text x="324" y="186">programa</text>
      <rect x="318" y="148" width="94" height="22" fill="none" stroke="currentColor"/><text x="324" y="164">$LOAD</text>
      <rect x="318" y="126" width="94" height="22" fill="none" stroke="currentColor"/><text x="324" y="142">$RUN</text>
      <rect x="318" y="104" width="94" height="22" fill="none" stroke="currentColor" stroke-dasharray="3 3"/><text x="324" y="120">dados</text>
      <rect x="318" y="82" width="94" height="22" fill="none" stroke="currentColor"/><text x="324" y="98">$END</text>
    </g>
    <text x="360" y="258" font-size="12" text-anchor="middle" fill="currentColor">Cartões de um job</text>
  </svg>
  <figcaption>O monitor fica sempre na memória. Ele lê os cartões de controle, passa o controle ao job e o recebe de volta quando o job termina. Só um job ocupa a memória por vez.</figcaption>
</figure>

<h2>O problema: CPU parada esperando E/S</h2>
<p>O monitor residente executa <strong>um programa de cada vez</strong>. Quando esse programa pede uma E/S (ler uma fita, imprimir), a CPU fica ociosa até a E/S terminar. Em processamento comercial (programas <em>I/O-bound</em>), a espera pela E/S chegava a <strong>80% ou 90% do tempo</strong>.</p>

<h2>Multiprogramação (3ª geração)</h2>
<p>A <strong>multiprogramação</strong> mantém <strong>vários programas na memória ao mesmo tempo</strong>, cada um numa partição. Enquanto um programa espera a E/S, a CPU executa outro. Com programas suficientes na memória, a CPU fica ocupada quase 100% do tempo.</p>

<figure class="diagrama">
  <svg viewBox="0 0 380 250" style="max-width:600px" role="img" aria-label="Linha do tempo da CPU em monoprogramação e multiprogramação">
    <g font-size="12" fill="currentColor">
      <text x="10" y="18" font-weight="bold">Monoprogramação (1 job na memória)</text>
      <rect x="10" y="28" width="40" height="26" style="fill:var(--azul)"/>
      <rect x="50" y="28" width="80" height="26" style="fill:var(--vermelho-claro);stroke:var(--vermelho)" stroke-dasharray="4 3"/>
      <rect x="130" y="28" width="40" height="26" style="fill:var(--azul)"/>
      <rect x="170" y="28" width="40" height="26" style="fill:var(--verde)"/>
      <rect x="210" y="28" width="80" height="26" style="fill:var(--vermelho-claro);stroke:var(--vermelho)" stroke-dasharray="4 3"/>
      <rect x="290" y="28" width="40" height="26" style="fill:var(--verde)"/>
      <g text-anchor="middle">
        <text x="30" y="46" style="fill:var(--sobre-cor)">A</text>
        <text x="90" y="46" style="fill:var(--vermelho)">ociosa</text>
        <text x="150" y="46" style="fill:var(--sobre-cor)">A</text>
        <text x="190" y="46" style="fill:var(--sobre-cor)">B</text>
        <text x="250" y="46" style="fill:var(--vermelho)">ociosa</text>
        <text x="310" y="46" style="fill:var(--sobre-cor)">B</text>
      </g>
      <g font-size="10" text-anchor="middle">
        <text x="10" y="68">0</text><text x="50" y="68">5</text><text x="130" y="68">15</text><text x="170" y="68">20</text><text x="210" y="68">25</text><text x="290" y="68">35</text><text x="330" y="68">40</text>
      </g>
      <text x="338" y="46">fim: 40</text>

      <text x="10" y="102" font-weight="bold">Multiprogramação (A e B na memória)</text>
      <rect x="10" y="112" width="40" height="26" style="fill:var(--azul)"/>
      <rect x="50" y="112" width="40" height="26" style="fill:var(--verde)"/>
      <rect x="90" y="112" width="40" height="26" style="fill:var(--vermelho-claro);stroke:var(--vermelho)" stroke-dasharray="4 3"/>
      <rect x="130" y="112" width="40" height="26" style="fill:var(--azul)"/>
      <rect x="170" y="112" width="40" height="26" style="fill:var(--verde)"/>
      <g text-anchor="middle">
        <text x="30" y="130" style="fill:var(--sobre-cor)">A</text>
        <text x="70" y="130" style="fill:var(--sobre-cor)">B</text>
        <text x="110" y="130" font-size="10" style="fill:var(--vermelho)">ociosa</text>
        <text x="150" y="130" style="fill:var(--sobre-cor)">A</text>
        <text x="190" y="130" style="fill:var(--sobre-cor)">B</text>
      </g>
      <g font-size="10" text-anchor="middle">
        <text x="10" y="152">0</text><text x="50" y="152">5</text><text x="90" y="152">10</text><text x="130" y="152">15</text><text x="170" y="152">20</text><text x="210" y="152">25</text>
      </g>
      <text x="218" y="130">fim: 25</text>

      <text x="10" y="182">Cada job: 5 de CPU, 10 de E/S, 5 de CPU.</text>
      <text x="10" y="200">"ociosa" = CPU parada porque o job está em E/S.</text>
      <text x="10" y="222">CPU ocupada sem multiprogramação: 20 de 40 (50%).</text>
      <text x="10" y="240">CPU ocupada com multiprogramação: 20 de 25 (80%).</text>
    </g>
  </svg>
  <figcaption>Com dois jobs na memória, a CPU executa B enquanto A faz E/S. O trabalho total é o mesmo, mas termina antes e a CPU fica menos tempo parada.</figcaption>
</figure>

<div class="exemplo">
  <p><strong>Exemplo passo a passo da figura (multiprogramação).</strong> Jobs A e B, cada um com 5 u.t. de CPU, depois 10 u.t. de E/S, depois mais 5 u.t. de CPU. A chega primeiro. Cada job usa um dispositivo de E/S diferente.</p>
  <table>
    <tr><th>Tempo</th><th>CPU</th><th>Job A</th><th>Job B</th></tr>
    <tr><td>0–5</td><td>executa A</td><td>usando a CPU</td><td>esperando a CPU</td></tr>
    <tr><td>5–10</td><td>executa B</td><td>fazendo E/S (5 a 15)</td><td>usando a CPU</td></tr>
    <tr><td>10–15</td><td><strong>ociosa</strong></td><td>ainda em E/S</td><td>fazendo E/S (10 a 20)</td></tr>
    <tr><td>15–20</td><td>executa A</td><td>usando a CPU; termina em 20</td><td>ainda em E/S</td></tr>
    <tr><td>20–25</td><td>executa B</td><td>terminado</td><td>usando a CPU; termina em 25</td></tr>
  </table>
  <p>Sem multiprogramação: A ocupa a máquina de 0 a 20 e B de 20 a 40. Resultado: <strong>40 u.t. com 50% de uso da CPU</strong> contra <strong>25 u.t. com 80% de uso da CPU</strong> (20 u.t. de CPU em 25).</p>
</div>

<h3>O hardware que tornou a multiprogramação possível</h3>
<p>Multiprogramação não é só uma ideia de software. Ela precisou de mudanças no hardware:</p>
<table>
  <tr><th>Recurso de hardware</th><th>Por que a multiprogramação precisa dele</th></tr>
  <tr><td><strong>Interrupções</strong></td><td>O dispositivo avisa a CPU que a E/S terminou. Sem isso, a CPU teria de ficar perguntando ao dispositivo e não poderia executar outro programa enquanto isso.</td></tr>
  <tr><td><strong>Discos magnéticos</strong></td><td>Acesso rápido e aleatório (randômico) a jobs diferentes. Com fita, só dá para ler em sequência.</td></tr>
  <tr><td><strong>DMA (acesso direto à memória)</strong></td><td>O controlador transfere os dados entre o dispositivo e a memória sem ocupar a CPU, que fica livre para outro programa e só é interrompida no fim da transferência.</td></tr>
  <tr><td><strong>Proteção de memória</strong></td><td>Com vários programas na memória, um não pode invadir a partição do outro nem a do SO. O Tanenbaum destaca que isso exigia hardware especial.</td></tr>
  <tr><td><strong>Dois modos de operação</strong> (usuário e supervisor) e <strong>instruções privilegiadas</strong></td><td>Só o SO, em modo supervisor, pode executar E/S e alterar a proteção. Isso também protege os periféricos.</td></tr>
  <tr><td><strong>Temporizador (proteção do processador)</strong></td><td>Interrompe o programa depois de um tempo, para que nenhum programa monopolize a CPU. É essencial no timesharing.</td></tr>
</table>
<p>Os slides do cap1 destacam as duas inovações que "possibilitaram o surgimento" da multiprogramação: interrupções e discos. Os do cap2 resumem o suporte de hardware como interrupção, dois modos de operação e proteção de periféricos, memória e processador. Esses mecanismos são estudados no Módulo 2.</p>

<h2>Spooling</h2>
<p><strong>Spooling</strong> (<em>Simultaneous Peripheral Operation On-Line</em>) usa o <strong>disco como intermediário</strong> entre os periféricos lentos e a CPU. Os jobs são lidos dos cartões para o disco assim que chegam à sala do computador; quando um job termina, o SO carrega um novo job do disco na partição liberada. O mesmo vale para a saída: o que vai para a impressora é gravado no disco e impresso depois. Com o spooling, os computadores 1401 auxiliares e o "leva e traz" de fitas desapareceram, e a E/S passou a acontecer em paralelo com o processamento.</p>

<h2>Timesharing (tempo compartilhado)</h2>
<p>Mesmo com multiprogramação, os sistemas da 3ª geração ainda eram em lote: o programador entregava o job e esperava horas pela saída; uma vírgula errada custava meio dia. O <strong>timesharing</strong> é uma <strong>variante da multiprogramação</strong> em que <strong>cada usuário tem um terminal on-line</strong> e interage com o seu programa.</p>
<ul>
  <li>O tempo de CPU é <strong>dividido entre os usuários</strong>, em fatias. Cada um tem a <strong>ilusão de ter a máquina só para si</strong>.</li>
  <li>O <strong>tempo de resposta</strong> passa a ser o critério importante.</li>
  <li>Exemplo do Tanenbaum: 20 usuários conectados, 17 pensando ou tomando café; a CPU é alocada, em revezamento, aos 3 que pedem processamento.</li>
  <li>O primeiro foi o <strong>CTSS</strong> (MIT, num 7094 modificado). Ele só se popularizou quando o <strong>hardware de proteção</strong> ficou comum. Depois vieram o MULTICS e o UNIX.</li>
</ul>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Monitor residente não é multiprogramação</strong>: ele executa um job por vez. Ele automatiza a passagem de um job para o outro (sequenciamento), e só.</li>
    <li><strong>Lote (batch) e multiprogramação são coisas diferentes</strong>: os sistemas da 3ª geração eram multiprogramados <em>e</em> em lote. Lote fala da falta de interação; multiprogramação fala de vários programas na memória.</li>
    <li>O hardware da multiprogramação é <strong>interrupção, proteção de memória, modo dual, discos e DMA</strong>. Responder "vários processadores" está errado: multiprogramação acontece com <strong>uma única CPU</strong>.</li>
    <li>Timesharing é um <strong>tipo de multiprogramação</strong>, com interação e fatias de tempo; não é sinônimo de sistema distribuído.</li>
  </ul>
</div>
`,
  resumo: 'Na 1ª geração não havia SO. Na 2ª, os jobs passaram a ser processados em lote e surgiu o monitor residente, o primeiro SO: fica sempre na memória, lê cartões de controle, passa o controle ao job, recebe-o de volta e carrega o próximo job automaticamente, mas executa um job por vez. Na 3ª geração, a multiprogramação manteve vários jobs na memória para a CPU não ficar parada durante a E/S, o que exigiu interrupções, discos, DMA, proteção de memória e modo dual; vieram também o spooling e o timesharing (multiprogramação interativa, com fatias de tempo). Na 4ª geração, chegaram os computadores pessoais.',
  questoes: [
    {
      id: 'm01-a02-q1',
      enunciado: 'Sobre o monitor residente, é correto afirmar:',
      alternativas: [
        { texto: 'Fica permanentemente na memória, lê os cartões de controle, transfere o controle para o job e o recebe de volta quando o job termina, sequenciando os jobs automaticamente.', correta: true, explicacao: 'Correto. Essa é a definição dos slides: residente porque fica sempre na memória; sequenciamento automático de jobs guiado pelos cartões de controle; o controle volta ao monitor no fim de cada job.' },
        { texto: 'Mantém vários jobs na memória e alterna entre eles quando um faz E/S.', correta: false, explicacao: 'Isso é multiprogramação, que veio depois. O monitor residente executa um job de cada vez e a CPU fica parada durante a E/S.' },
        { texto: 'Divide o tempo de CPU entre usuários conectados por terminais.', correta: false, explicacao: 'Isso é timesharing (3ª geração). O monitor residente era usado em sistemas em lote, sem interação com o usuário.' },
        { texto: 'É um programa que o operador carrega manualmente antes de cada job.', correta: false, explicacao: 'É o contrário: o monitor foi criado justamente para eliminar a passagem manual entre jobs. Ele fica residente e carrega os jobs sozinho.' },
      ],
    },
    {
      id: 'm01-a02-q2',
      enunciado: 'O monitor residente surgiu para resolver qual problema dos primeiros sistemas em lote?',
      alternativas: [
        { texto: 'A passagem de um job para o outro era manual, e o computador caro ficava parado enquanto o operador trabalhava.', correta: true, explicacao: 'Correto. Nos primeiros sistemas em lote a passagem entre jobs ainda era manual. O monitor automatizou o sequenciamento de jobs, tornando-se o primeiro SO (rudimentar).' },
        { texto: 'A CPU ficava ociosa enquanto o job fazia E/S.', correta: false, explicacao: 'Esse problema continuou com o monitor residente, porque ele executa um job por vez. Quem resolveu foi a multiprogramação.' },
        { texto: 'Os usuários queriam interagir com seus programas por terminais.', correta: false, explicacao: 'A interação veio com o timesharing, na 3ª geração. Na época do monitor, o usuário entregava cartões e esperava a saída.' },
        { texto: 'Um programa podia invadir a memória de outro programa.', correta: false, explicacao: 'Com só um job na memória, isso não era o problema central. A proteção entre programas virou necessidade com a multiprogramação.' },
      ],
    },
    {
      id: 'm01-a02-q3',
      enunciado: 'Para haver multiprogramação, qual conjunto de recursos de hardware foi necessário?',
      alternativas: [
        { texto: 'Interrupções, proteção de memória, modos usuário e supervisor, discos magnéticos e DMA.', correta: true, explicacao: 'Correto. Interrupções avisam o fim da E/S; discos dão acesso rápido e aleatório aos jobs; DMA libera a CPU durante a transferência; proteção de memória e modo dual impedem que um programa invada outro ou o SO.' },
        { texto: 'Vários processadores acoplados compartilhando a memória.', correta: false, explicacao: 'Erro clássico. Multiprogramação funciona com uma única CPU: o que muda é ter vários programas na memória e alternar entre eles.' },
        { texto: 'Fitas magnéticas mais rápidas e leitoras de cartão de alta velocidade.', correta: false, explicacao: 'Fitas só permitem acesso sequencial. Foram os discos, com acesso aleatório, que permitiram escolher entre vários jobs.' },
        { texto: 'Interface gráfica e mouse.', correta: false, explicacao: 'A interface gráfica é da 4ª geração e não tem relação com a multiprogramação, que surgiu na 3ª.' },
      ],
    },
    {
      id: 'm01-a02-q4',
      enunciado: 'Por que a <strong>proteção de memória</strong> se tornou indispensável com a multiprogramação?',
      alternativas: [
        { texto: 'Porque vários programas ficam na memória ao mesmo tempo, e um programa com erro poderia sobrescrever outro programa ou o próprio SO.', correta: true, explicacao: 'Correto. Com um job por vez, havia pouco a proteger. Com vários jobs em partições, o hardware precisa impedir que um acesse a partição do outro.' },
        { texto: 'Porque a memória da época apagava os dados quando faltava energia.', correta: false, explicacao: 'A volatilidade da memória não tem relação com proteção entre programas.' },
        { texto: 'Porque o spooling gravava os jobs diretamente na memória da impressora.', correta: false, explicacao: 'O spooling usa o disco como intermediário, não a memória da impressora. A proteção é necessária por causa dos vários programas na memória principal.' },
        { texto: 'Porque cada usuário passou a ter seu próprio computador.', correta: false, explicacao: 'Isso descreve a 4ª geração (PCs). A proteção nasce da necessidade de várias tarefas dividirem a mesma memória.' },
      ],
    },
    {
      id: 'm01-a02-q5',
      enunciado: 'Dois jobs estão na memória. X: 6 u.t. de CPU, 6 de E/S e 2 de CPU. Y: 4 u.t. de CPU, 4 de E/S e 4 de CPU. X começa primeiro e cada um usa um dispositivo de E/S diferente. Com multiprogramação, em que instante os dois jobs terminam?',
      alternativas: [
        { texto: 'Em 18 u.t.', correta: true, explicacao: 'Linha do tempo: 0–6 CPU executa X; 6–10 CPU executa Y (X em E/S de 6 a 12); 10–12 CPU ociosa (Y em E/S de 10 a 14); 12–14 X termina; 14–18 Y termina. CPU ocupada 16 de 18 u.t. (cerca de 89%).' },
        { texto: 'Em 26 u.t.', correta: false, explicacao: 'Esse é o tempo sem multiprogramação: X sozinho leva 6+6+2 = 14 e Y leva 4+4+4 = 12, um depois do outro, 26 no total. A multiprogramação sobrepõe a E/S de um com a CPU do outro.' },
        { texto: 'Em 16 u.t.', correta: false, explicacao: '16 é só a soma dos tempos de CPU (6+2+4+4). Entre 10 e 12 a CPU fica ociosa, porque os dois jobs estão em E/S, então o fim é em 18.' },
        { texto: 'Em 14 u.t.', correta: false, explicacao: 'Em 14, X termina, mas Y ainda precisa de 4 u.t. de CPU (de 14 a 18). Os dois só terminam em 18.' },
      ],
    },
    {
      id: 'm01-a02-q6',
      enunciado: 'O que é spooling?',
      alternativas: [
        { texto: 'Usar o disco como intermediário: os jobs são lidos para o disco assim que chegam e a saída para a impressora é gravada no disco e impressa depois, sobrepondo E/S e processamento.', correta: true, explicacao: 'Correto. Spooling (Simultaneous Peripheral Operation On-Line) eliminou os 1401 auxiliares e o leva e traz de fitas, e depende do acesso aleatório do disco.' },
        { texto: 'Dividir o tempo de CPU entre usuários de terminais.', correta: false, explicacao: 'Isso é timesharing. O spooling trata da E/S com periféricos lentos (leitora de cartões, impressora).' },
        { texto: 'Gravar o lote de jobs numa fita usando um computador auxiliar e imprimir a saída off-line.', correta: false, explicacao: 'Esse é o esquema anterior, do lote em fita da 2ª geração. O spooling substituiu as fitas e os computadores auxiliares pelo disco.' },
        { texto: 'Transferir dados entre o dispositivo e a memória sem usar a CPU.', correta: false, explicacao: 'Isso é DMA (acesso direto à memória), um recurso de hardware. O spooling é uma técnica do SO que usa o disco como intermediário.' },
      ],
    },
    {
      id: 'm01-a02-q7',
      enunciado: 'Qual afirmação sobre timesharing está correta?',
      alternativas: [
        { texto: 'É uma variante da multiprogramação em que cada usuário tem um terminal on-line e a CPU é dividida em fatias de tempo, dando a ilusão de máquina dedicada.', correta: true, explicacao: 'Correto. Timesharing é multiprogramação com interação: o critério importante passa a ser o tempo de resposta.' },
        { texto: 'É um sistema com vários computadores autônomos ligados em rede, vistos como um só.', correta: false, explicacao: 'Isso é sistema distribuído. O timesharing usa um único computador compartilhado por vários usuários.' },
        { texto: 'É o modo de operação do monitor residente da 2ª geração.', correta: false, explicacao: 'O monitor residente era usado em lote, sem interação. O timesharing é da 3ª geração (CTSS, no MIT).' },
        { texto: 'Dispensa hardware de proteção, porque cada usuário usa a CPU em um momento diferente.', correta: false, explicacao: 'Ao contrário: o Tanenbaum diz que o timesharing só se popularizou quando o hardware de proteção ficou comum, porque os programas de vários usuários dividem a mesma memória.' },
      ],
    },
    {
      id: 'm01-a02-q8',
      enunciado: 'Associe corretamente geração e marco:',
      alternativas: [
        { texto: '1ª: válvulas, sem SO. 2ª: transistores e lote. 3ª: CIs e multiprogramação. 4ª: computadores pessoais.', correta: true, explicacao: 'Correto. É a divisão do Tanenbaum: válvulas (1945–55), transistores e batch (1955–65), circuitos integrados e multiprogramação (1965–80), computadores pessoais (1980 em diante).' },
        { texto: '1ª: transistores e lote. 2ª: válvulas. 3ª: computadores pessoais. 4ª: multiprogramação.', correta: false, explicacao: 'A ordem está trocada. As válvulas vieram primeiro, e a multiprogramação (3ª geração) é anterior aos computadores pessoais (4ª).' },
        { texto: '1ª: válvulas e monitor residente. 2ª: multiprogramação. 3ª: timesharing. 4ª: lote.', correta: false, explicacao: 'Na 1ª geração não havia SO nenhum. O monitor residente e o lote são da 2ª; multiprogramação e timesharing, da 3ª.' },
        { texto: '1ª: cartões perfurados e timesharing. 2ª: CIs. 3ª: transistores. 4ª: válvulas.', correta: false, explicacao: 'A ordem do hardware é válvulas, transistores, circuitos integrados e LSI. O timesharing só aparece na 3ª geração.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm01-a02-d1',
      enunciado: 'Explique o que foi o monitor residente: em que contexto surgiu, que problema resolvia e como funcionava.',
      respostaModelo: `<p><strong>Origem:</strong> na 2ª geração (transistores, mainframes), os jobs (programa + dados em cartões) eram entregues a operadores e agrupados em lotes (batch). A passagem de um job para outro ainda era manual, e o computador, caríssimo, ficava parado. Para automatizar essa passagem surgiu o monitor residente, considerado o primeiro sistema operacional (rudimentar).</p>
<p><strong>Conceito:</strong> é um programa que fica <strong>permanentemente na memória</strong> (por isso "residente") e faz o <strong>sequenciamento automático dos jobs</strong>.</p>
<p><strong>Funcionamento:</strong> o monitor é o primeiro a executar. Ele lê os <strong>cartões de controle</strong> (por exemplo $JOB, $FORTRAN, $LOAD, $RUN, $END), carrega o programa e <strong>transfere o controle ao job</strong>. Quando o job termina, o <strong>controle volta ao monitor</strong>, que carrega o próximo. Ele também <strong>centraliza as rotinas de acesso aos periféricos</strong> e as oferece aos programas. É formado por carregador, sequenciador de jobs, interpretador de cartões de controle e rotinas de E/S.</p>
<p><strong>Limitação:</strong> executa um job por vez; a CPU fica ociosa durante a E/S, problema resolvido depois pela multiprogramação.</p>`,
      pontosChave: [
        'Origem: sistemas em lote da 2ª geração, para eliminar a passagem manual entre jobs',
        'Fica permanentemente na memória e é considerado o primeiro SO',
        'Sequenciamento automático: transfere o controle ao job e o recebe de volta quando o job termina',
        'Usa cartões de controle para saber o que fazer com cada job',
        'Centraliza as rotinas de acesso a periféricos e executa um job por vez',
      ],
    },
    {
      id: 'm01-a02-d2',
      enunciado: 'Que recursos de hardware tornaram a multiprogramação possível? Explique o papel de cada um.',
      respostaModelo: `<p>Multiprogramação é manter vários programas na memória e, quando um faz E/S, entregar a CPU a outro. Para isso o hardware precisou oferecer:</p>
<ul>
  <li><strong>Interrupções</strong>: o dispositivo avisa a CPU quando a E/S termina, de modo que a CPU possa executar outro programa nesse meio tempo e voltar ao primeiro depois.</li>
  <li><strong>Discos magnéticos</strong>: acesso rápido e aleatório a jobs diferentes (com fita, só em sequência).</li>
  <li><strong>DMA</strong>: o controlador transfere blocos entre dispositivo e memória sem ocupar a CPU, interrompendo-a só no fim.</li>
  <li><strong>Proteção de memória</strong>: com vários programas na memória, um não pode acessar a área de outro nem a do SO.</li>
  <li><strong>Dois modos de operação</strong> (usuário e supervisor) com <strong>instruções privilegiadas</strong>: só o SO executa E/S e altera a proteção, o que protege os periféricos.</li>
  <li><strong>Temporizador</strong> (proteção do processador): impede que um programa monopolize a CPU.</li>
</ul>
<p>Não é necessário ter mais de um processador: a multiprogramação acontece com uma única CPU.</p>`,
      pontosChave: [
        'Interrupções para sinalizar o fim da E/S',
        'Proteção de memória entre os programas e o SO',
        'Modo usuário x supervisor com instruções privilegiadas',
        'Discos magnéticos (acesso aleatório) e DMA',
      ],
    },
  ],
});
