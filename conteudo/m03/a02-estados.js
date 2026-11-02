// Módulo 3, aula 2: modelo de 2 estados e sua limitação, modelo de 5 estados com transições, criação e término de processos.
SO1.registerLesson({
  id: 'm03-a02',
  titulo: 'Estados de um processo',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.1.2 a §2.1.5 (p.52–55): criação, término, hierarquia e estados (Figura 2.2)',
    'Slides cap2 (Oliveira/Carissimi/Toscani, UFRGS): modelo a dois estados, limitação, criação e término, modelo a 5 estados e diagrama de transição',
    'Slides cap4 (Oliveira/Carissimi/Toscani, UFRGS): eventos de transição de estados',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a fila do caixa eletrônico.</strong> Você chega ao banco e pega a senha (<strong>Criado</strong>). Senta e espera ser chamado, pronto para usar o caixa (<strong>Apto</strong>). Chamam a sua senha e você usa o caixa (<strong>Executando</strong>). No meio da operação, o caixa pede o código que chegou por SMS e o celular está sem sinal: você sai do caixa e espera o SMS chegar (<strong>Bloqueado</strong>). Quando o SMS chega, você <em>não</em> volta direto para o caixa, que já está com outra pessoa: volta para a fila de espera (<strong>Apto</strong>). Ao terminar, vai embora (<strong>Finalizado</strong>).</p>
</div>

<p>Um processo não fica o tempo todo usando a CPU. Ao longo da vida, ele passa por <strong>estados</strong>, e o SO precisa saber em qual estado cada processo está para decidir quem recebe a CPU. A mudança de um estado para outro é uma <strong>transição</strong>, e cada transição é causada por um <strong>evento</strong> (gatilho).</p>

<h2>Primeiro modelo: dois estados</h2>
<p>Numa máquina com uma CPU, vários processos querem executar, mas só um pode usar o processador. A solução mais simples é uma <strong>fila de aptos</strong> (<em>ready queue</em>): os processos que esperam o processador ficar livre.</p>
<ul>
  <li>Estados: <strong>Apto</strong> e <strong>Executando</strong>.</li>
  <li>Transições: <strong>criação</strong> (entra como Apto), <strong>dispatcher</strong> (Apto → Executando), <strong>pausa</strong> (Executando → Apto) e <strong>término</strong> (sai de Executando).</li>
  <li>O <strong>escalonador/dispatcher</strong> atribui o processador a um processo da fila de aptos e pode impedir que um único processo monopolize a CPU.</li>
</ul>

<figure class="diagrama">
  <svg viewBox="0 0 470 130" style="max-width:520px" role="img" aria-label="Modelo de dois estados: criação leva a Apto, dispatcher leva de Apto a Executando, pausa volta a Apto, término sai de Executando">
    <defs>
      <marker id="m03a02-s1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" style="fill:currentColor"/></marker>
    </defs>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <line x1="10" y1="65" x2="98" y2="65" marker-end="url(#m03a02-s1)"/>
      <path d="M200 55 Q245 25 290 55" marker-end="url(#m03a02-s1)"/>
      <path d="M290 75 Q245 105 200 75" marker-end="url(#m03a02-s1)"/>
      <line x1="400" y1="65" x2="462" y2="65" marker-end="url(#m03a02-s1)"/>
    </g>
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <rect x="100" y="45" width="100" height="40" rx="8" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="150" y="70" font-weight="bold">Apto</text>
      <rect x="290" y="45" width="110" height="40" rx="8" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/>
      <text x="345" y="70" font-weight="bold">Executando</text>
    </g>
    <g font-size="11" text-anchor="middle" fill="currentColor">
      <text x="52" y="56">criação</text>
      <text x="245" y="28">dispatcher</text>
      <text x="245" y="114">pausa</text>
      <text x="432" y="56">término</text>
    </g>
  </svg>
  <figcaption>Modelo simplificado a dois estados (slides cap2).</figcaption>
</figure>

<h3>A limitação do modelo de dois estados</h3>
<p>Existem <strong>dois motivos diferentes</strong> para um processo não estar executando:</p>
<ol>
  <li>ele está <strong>esperando o processador</strong> (está pronto, só falta a CPU);</li>
  <li>ele está <strong>esperando um evento externo</strong>, como o fim de uma leitura do disco ou uma tecla.</li>
</ol>
<p>No modelo de dois estados, os dois casos ficam misturados na mesma fila. O escalonador poderia escolher um processo que está esperando o disco, e ele não teria como executar. Como o <strong>escalonador não pode selecionar um processo bloqueado</strong>, o modelo de dois estados não é suficiente: é preciso criar novos estados.</p>

<h2>O modelo de cinco estados</h2>
<table>
  <tr><th>Estado</th><th>Significado</th></tr>
  <tr><td><strong>Criado</strong> (Novo, <em>New</em>; "Criação" nos slides)</td><td>O processo está sendo criado: o SO aloca o descritor (BDP) e as estruturas, mas ainda não o admitiu para disputar a CPU.</td></tr>
  <tr><td><strong>Apto</strong> (Pronto, <em>Ready</em>)</td><td>Pode executar e só espera a CPU ficar livre. Fica na <strong>fila de aptos</strong>.</td></tr>
  <tr><td><strong>Executando</strong> (Em execução, <em>Running</em>)</td><td>Está usando a CPU naquele instante. Numa máquina com uma CPU, <strong>só um processo</strong> está neste estado.</td></tr>
  <tr><td><strong>Bloqueado</strong> (<em>Blocked</em>)</td><td>Não pode executar, <strong>mesmo que a CPU esteja livre</strong>, porque espera um evento externo (E/S, sinal de outro processo).</td></tr>
  <tr><td><strong>Finalizado</strong> (Destruição, <em>Exit</em>)</td><td>Terminou ou foi cancelado; o SO libera os recursos e o descritor.</td></tr>
</table>

<figure class="diagrama">
  <svg viewBox="0 0 480 340" style="max-width:620px" role="img" aria-label="Diagrama do modelo de cinco estados: Criado vai para Apto por admissão; Apto vai para Executando por seleção do dispatcher; Executando volta para Apto por fim do quantum ou preempção; Executando vai para Bloqueado ao pedir E/S ou esperar um evento; Bloqueado vai para Apto quando o evento ocorre; Executando vai para Finalizado no término">
    <defs>
      <marker id="m03a02-s2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" style="fill:currentColor"/></marker>
    </defs>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <line x1="72" y1="62" x2="94" y2="136" marker-end="url(#m03a02-s2)"/>
      <line x1="394" y1="138" x2="412" y2="64" marker-end="url(#m03a02-s2)"/>
      <path d="M160 152 Q240 110 318 152" marker-end="url(#m03a02-s2)"/>
      <path d="M320 170 Q240 212 162 170" marker-end="url(#m03a02-s2)"/>
      <line x1="364" y1="182" x2="284" y2="278" marker-end="url(#m03a02-s2)"/>
      <line x1="198" y1="278" x2="116" y2="184" marker-end="url(#m03a02-s2)"/>
    </g>
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <rect x="10" y="20" width="110" height="40" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="65" y="45" font-weight="bold">Criado</text>
      <rect x="360" y="20" width="110" height="40" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="415" y="45" font-weight="bold">Finalizado</text>
      <rect x="40" y="140" width="120" height="40" rx="8" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="100" y="165" font-weight="bold">Apto</text>
      <rect x="320" y="140" width="130" height="40" rx="8" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/>
      <text x="385" y="165" font-weight="bold">Executando</text>
      <rect x="180" y="280" width="120" height="40" rx="8" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="2"/>
      <text x="240" y="305" font-weight="bold">Bloqueado</text>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="92" y="100">admissão</text>
      <text x="408" y="100" text-anchor="end">término</text>
      <text x="240" y="118" text-anchor="middle">seleção (dispatcher)</text>
      <text x="240" y="210" text-anchor="middle">fim do quantum</text>
      <text x="240" y="224" text-anchor="middle">ou preempção</text>
      <text x="336" y="238">pede E/S ou espera</text>
      <text x="336" y="252">evento (chamada</text>
      <text x="336" y="266">de sistema)</text>
      <text x="146" y="238" text-anchor="end">E/S termina ou</text>
      <text x="146" y="252" text-anchor="end">evento ocorre</text>
      <text x="146" y="266" text-anchor="end">(interrupção)</text>
    </g>
  </svg>
  <figcaption>Modelo de cinco estados. Repare: quando o evento ocorre, o Bloqueado vai para o Apto, e só o Apto chega ao Executando.</figcaption>
</figure>

<h3>As transições e seus gatilhos</h3>
<table>
  <tr><th>Transição</th><th>Gatilho (evento)</th><th>Quem provoca</th></tr>
  <tr><td><strong>Criado → Apto</strong></td><td><strong>Admissão</strong>: o SO aceita o processo para disputar a CPU (há recursos e o descritor está pronto).</td><td>SO</td></tr>
  <tr><td><strong>Apto → Executando</strong></td><td><strong>Seleção</strong>: a CPU ficou livre e o escalonador escolhe este processo; o dispatcher entrega a CPU a ele.</td><td>Escalonador + dispatcher</td></tr>
  <tr><td><strong>Executando → Apto</strong></td><td><strong>Fim da fatia de tempo</strong> (interrupção do temporizador) ou <strong>preempção</strong> por um processo de prioridade mais alta que ficou apto.</td><td>SO (o processo não pediu)</td></tr>
  <tr><td><strong>Executando → Bloqueado</strong></td><td>O processo faz uma <strong>chamada de sistema</strong> pedindo E/S ou precisa esperar um evento de <strong>sincronização</strong> (ex.: uma mensagem de outro processo).</td><td>O próprio processo, ao pedir algo que não está disponível</td></tr>
  <tr><td><strong>Bloqueado → Apto</strong></td><td><strong>Ocorrência do evento</strong> esperado, geralmente sinalizada por uma <strong>interrupção</strong> (ex.: o disco terminou a leitura).</td><td>Hardware/SO</td></tr>
  <tr><td><strong>Executando → Finalizado</strong></td><td><strong>Término</strong>: saída normal (chamada <code>exit</code>), saída por erro ou erro fatal.</td><td>Processo ou SO</td></tr>
</table>
<p><strong>Nota sobre o término:</strong> o diagrama dos slides só desenha a seta Executando → Finalizado, mas um processo também pode ser encerrado <strong>sem estar executando</strong>. O cancelamento por outro processo (<code>kill</code>), a intervenção do SO (por exemplo, matar um processo em deadlock, que está Bloqueado) ou o logoff do usuário podem levar um processo <strong>Apto</strong> ou <strong>Bloqueado</strong> direto a Finalizado. O Stallings desenha essas setas (Apto → Finalizado e Bloqueado → Finalizado); os slides não.</p>
<p>O Tanenbaum usa só os três estados centrais (Em execução, Pronto, Bloqueado) e numera as quatro transições entre eles: <strong>1</strong> o processo bloqueia aguardando uma entrada; <strong>2</strong> o escalonador seleciona outro processo; <strong>3</strong> o escalonador seleciona este processo; <strong>4</strong> a entrada fica disponível. As transições 2 e 3 são do escalonador, e o processo nem fica sabendo delas.</p>
<p><strong>Apto x Bloqueado</strong>: nos dois o processo não executa, mas o motivo é diferente. O Apto <em>poderia</em> executar, só falta a CPU. O Bloqueado <em>não pode</em> executar nem com a CPU livre, porque falta o evento.</p>

<h2>Criação de processos</h2>
<p>Eventos que criam processos:</p>
<ul>
  <li><strong>início do sistema</strong> (vários processos, inclusive daemons para serviços);</li>
  <li><strong>logon de um usuário</strong> (o login cria o shell da sessão);</li>
  <li><strong>pedido de um processo existente</strong>, por chamada de sistema (<em>spawn</em>; no UNIX, <code>fork</code>);</li>
  <li><strong>pedido do usuário</strong> (digitar um comando, clicar num ícone);</li>
  <li><strong>submissão de um job</strong> em sistemas em lote.</li>
</ul>
<p>Tecnicamente, em todos os casos, um processo já existente executa a chamada de sistema de criação. O que o SO faz ao criar um processo (alocar BDP, PID etc.) é visto na aula 4.</p>

<h2>Término de processos</h2>
<p>O Tanenbaum agrupa as causas em quatro:</p>
<ol>
  <li><strong>saída normal</strong> (voluntária): o trabalho acabou, o processo chama <code>exit</code>;</li>
  <li><strong>saída por erro</strong> (voluntária): o processo detecta um erro, por exemplo um arquivo inexistente, e decide terminar;</li>
  <li><strong>erro fatal</strong> (involuntário): instrução ilegal, acesso a memória não autorizada, divisão por zero;</li>
  <li><strong>cancelamento por outro processo</strong> (involuntário): no UNIX, <code>kill</code>; no Windows, <code>TerminateProcess</code>.</li>
</ol>
<p>Os slides detalham as situações anormais: exceder o <strong>tempo limite</strong>, <strong>falta de memória</strong>, <strong>erros de proteção</strong> (escrever em arquivo somente leitura, acessar área de memória não autorizada), <strong>erros aritméticos</strong> (divisão por zero, overflow, underflow), <strong>erro em periférico de E/S</strong>, <strong>instrução inválida</strong> (executar área de dados, instrução privilegiada em modo usuário), <strong>intervenção do SO</strong> (por exemplo, para desfazer um deadlock) e <strong>logoff</strong> do usuário.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: a vida de um processo que lê um arquivo e faz cálculos.</strong> Uma CPU, outros processos disputando-a.</p>
  <table>
    <tr><th>Momento</th><th>O que acontece</th><th>Estado</th></tr>
    <tr><td>1</td><td>O usuário dá um duplo clique no programa; o SO aloca o descritor e um PID.</td><td>Criado</td></tr>
    <tr><td>2</td><td>O SO admite o processo e o coloca na fila de aptos.</td><td>Apto</td></tr>
    <tr><td>3</td><td>A CPU fica livre; o escalonador o seleciona e o dispatcher entrega a CPU.</td><td>Executando</td></tr>
    <tr><td>4</td><td>O processo faz a chamada de sistema <code>read</code> para ler o arquivo do disco.</td><td>Bloqueado</td></tr>
    <tr><td>5</td><td>Enquanto isso, a CPU executa outros processos.</td><td>Bloqueado</td></tr>
    <tr><td>6</td><td>O disco termina e gera uma interrupção; o SO marca o evento como ocorrido.</td><td><strong>Apto</strong> (não Executando: a CPU está com outro)</td></tr>
    <tr><td>7</td><td>O processo é selecionado de novo.</td><td>Executando</td></tr>
    <tr><td>8</td><td>A fatia de tempo dele acaba (interrupção do temporizador).</td><td>Apto</td></tr>
    <tr><td>9</td><td>É selecionado mais uma vez, termina o cálculo e chama <code>exit</code>.</td><td>Executando → Finalizado</td></tr>
  </table>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Bloqueado nunca vai direto para Executando.</strong> Quando o evento ocorre, ele vai para Apto e espera ser selecionado.</li>
    <li><strong>Apto nunca vai para Bloqueado.</strong> Para bloquear, o processo precisa pedir algo (E/S, evento), e só quem está executando faz pedidos.</li>
    <li><strong>Criado não vai direto para Executando</strong>: passa por Apto.</li>
    <li>Executando → Apto é <strong>involuntário</strong> (tempo ou preempção); Executando → Bloqueado é causado pelo <strong>pedido do próprio processo</strong>.</li>
    <li>Com uma CPU, há no máximo <strong>um</strong> processo Executando; Aptos e Bloqueados podem ser muitos.</li>
    <li>O término <strong>normal</strong> (<code>exit</code>) parte de Executando, mas um processo Apto ou Bloqueado pode ser encerrado direto por <code>kill</code>, intervenção do SO ou logoff.</li>
    <li>O modelo "mais completo" pedido em prova é o de <strong>sete estados</strong>, com Apto-suspenso e Bloqueado-suspenso (próxima aula).</li>
  </ul>
</div>
`,
  resumo: 'O modelo de dois estados (Apto e Executando) não separa quem espera a CPU de quem espera um evento, por isso surgiu o modelo de cinco estados: Criado, Apto, Executando, Bloqueado e Finalizado. Admissão leva de Criado a Apto; seleção pelo dispatcher, de Apto a Executando; fim do quantum ou preempção, de volta a Apto; um pedido de E/S ou espera por evento, de Executando a Bloqueado; a ocorrência do evento, de Bloqueado a Apto; e o término normal, de Executando a Finalizado (cancelamento, intervenção do SO ou logoff podem encerrar também um Apto ou Bloqueado). Bloqueado nunca vai direto para Executando.',
  questoes: [
    {
      id: 'm03-a02-q1',
      enunciado: 'Um processo está <strong>Bloqueado</strong> esperando a leitura de um disco. A leitura termina e o disco gera uma interrupção. Para qual estado o processo vai?',
      alternativas: [
        { texto: 'Apto: ele volta para a fila de aptos e espera ser selecionado pelo escalonador.', correta: true, explicacao: 'Correto. A ocorrência do evento leva de Bloqueado para Apto. Ele só executa quando o escalonador o selecionar (transição 4 do Tanenbaum, seguida depois da 3).' },
        { texto: 'Executando: como o evento ocorreu, ele retoma a CPU imediatamente.', correta: false, explicacao: 'Pegadinha clássica: não existe a transição Bloqueado → Executando. A CPU pode estar com outro processo, e quem decide quem executa é o escalonador.' },
        { texto: 'Criado: o processo é recriado para continuar a execução.', correta: false, explicacao: 'O processo nunca volta ao estado Criado. Ele mantém seu contexto salvo e continua do ponto onde parou.' },
        { texto: 'Continua Bloqueado até o usuário intervir.', correta: false, explicacao: 'O evento esperado era justamente o fim da leitura. Ocorrido o evento, o processo deixa de estar bloqueado, sem intervenção do usuário.' },
      ],
    },
    {
      id: 'm03-a02-q2',
      enunciado: 'Qual transição <strong>não existe</strong> no modelo de cinco estados?',
      alternativas: [
        { texto: 'Apto → Bloqueado.', correta: true, explicacao: 'Correto, não existe. Um processo bloqueia ao pedir algo (E/S, evento), e só quem está executando pode fazer pedidos. Um processo Apto não executa instruções.' },
        { texto: 'Executando → Apto.', correta: false, explicacao: 'Existe: acontece quando a fatia de tempo acaba (interrupção do temporizador) ou quando um processo mais prioritário fica apto (preempção).' },
        { texto: 'Bloqueado → Apto.', correta: false, explicacao: 'Existe: ocorre quando o evento esperado acontece, geralmente avisado por uma interrupção.' },
        { texto: 'Executando → Bloqueado.', correta: false, explicacao: 'Existe: ocorre quando o processo faz uma chamada de sistema de E/S ou precisa esperar um evento de sincronização.' },
      ],
    },
    {
      id: 'm03-a02-q3',
      enunciado: 'Por que o modelo de <strong>dois estados</strong> (Apto e Executando) não é suficiente?',
      alternativas: [
        { texto: 'Porque mistura processos que esperam a CPU com processos que esperam um evento externo, e o escalonador não pode selecionar um processo que está esperando um evento.', correta: true, explicacao: 'Correto. É a limitação apontada nos slides: há duas causas para não executar. Foi criado o estado Bloqueado para separar quem espera um evento.' },
        { texto: 'Porque não permite que mais de um processo execute ao mesmo tempo numa CPU.', correta: false, explicacao: 'Nenhum modelo permite isso: com uma CPU, só um processo executa por vez. O problema é outro.' },
        { texto: 'Porque não tem transição de término.', correta: false, explicacao: 'O modelo de dois estados tem criação e término. O que falta é distinguir esperar a CPU de esperar um evento.' },
        { texto: 'Porque não usa o dispatcher.', correta: false, explicacao: 'O dispatcher já aparece no modelo de dois estados: é ele que leva o processo de Apto para Executando.' },
      ],
    },
    {
      id: 'm03-a02-q4',
      enunciado: 'Um processo que está executando tem sua <strong>fatia de tempo esgotada</strong> pela interrupção do temporizador. Qual transição ocorre?',
      alternativas: [
        { texto: 'Executando → Apto.', correta: true, explicacao: 'Correto. O processo ainda pode executar (não espera nenhum evento), só perdeu a vez. Vai para o fim da fila de aptos.' },
        { texto: 'Executando → Bloqueado.', correta: false, explicacao: 'Bloqueado é para quem espera um evento externo. O fim da fatia de tempo não faz o processo esperar nada além da CPU.' },
        { texto: 'Executando → Finalizado.', correta: false, explicacao: 'O fim da fatia não encerra o processo; ele volta depois para continuar. Término é por exit, erro ou cancelamento.' },
        { texto: 'Apto → Executando.', correta: false, explicacao: 'Essa é a transição de outro processo, o próximo selecionado. O processo que perdeu a CPU sai de Executando para Apto.' },
      ],
    },
    {
      id: 'm03-a02-q5',
      enunciado: 'Qual é a diferença entre os estados <strong>Apto</strong> e <strong>Bloqueado</strong>?',
      alternativas: [
        { texto: 'O Apto poderia executar e só espera a CPU; o Bloqueado não pode executar nem com a CPU livre, porque espera um evento.', correta: true, explicacao: 'Correto. O Tanenbaum destaca que os dois primeiros estados (execução e pronto) são parecidos, e o Bloqueado é diferente: falta o evento, não a CPU.' },
        { texto: 'O Apto está no disco e o Bloqueado está na memória.', correta: false, explicacao: 'No modelo de cinco estados, os dois estão na memória. Estar no disco é a ideia dos estados suspensos (próxima aula).' },
        { texto: 'Não há diferença prática; são dois nomes da mesma fila.', correta: false, explicacao: 'São filas diferentes justamente porque o escalonador só pode escolher processos aptos.' },
        { texto: 'O Bloqueado tem prioridade maior e executa assim que a CPU fica livre.', correta: false, explicacao: 'O Bloqueado não pode ser escolhido pelo escalonador enquanto o evento não ocorrer.' },
      ],
    },
    {
      id: 'm03-a02-q6',
      enunciado: 'Qual evento leva um processo de <strong>Executando</strong> para <strong>Bloqueado</strong>?',
      alternativas: [
        { texto: 'O processo faz uma chamada de sistema para ler um arquivo do disco.', correta: true, explicacao: 'Correto. Ao pedir uma E/S, o processo precisa esperar o resultado e não pode continuar; o SO o bloqueia e entrega a CPU a outro.' },
        { texto: 'Um processo de prioridade mais alta fica apto.', correta: false, explicacao: 'Isso causa preempção: Executando → Apto. O processo preemptado poderia continuar, só perdeu a vez.' },
        { texto: 'O dispatcher seleciona outro processo da fila de aptos.', correta: false, explicacao: 'A seleção é consequência de a CPU estar livre ou de uma preempção; ela não faz o processo esperar um evento.' },
        { texto: 'O disco termina a leitura que o processo pediu.', correta: false, explicacao: 'Isso é o evento que desbloqueia: Bloqueado → Apto, o caminho contrário.' },
      ],
    },
    {
      id: 'm03-a02-q7',
      enunciado: 'Defina processo e indique a sequência correta de estados de um processo que é criado, executa, pede uma E/S, recebe o resultado e termina (modelo de cinco estados).',
      alternativas: [
        { texto: 'Processo é um programa em execução. Sequência: Criado → Apto → Executando → Bloqueado → Apto → Executando → Finalizado.', correta: true, explicacao: 'Correto. Depois da E/S o processo volta para Apto e só executa de novo quando é selecionado; termina normalmente (exit) a partir de Executando.' },
        { texto: 'Processo é o arquivo executável. Sequência: Criado → Executando → Bloqueado → Executando → Finalizado.', correta: false, explicacao: 'Dois erros: o arquivo executável é o programa, não o processo; e falta o Apto, tanto depois da criação quanto depois do bloqueio.' },
        { texto: 'Processo é um programa em execução. Sequência: Criado → Apto → Bloqueado → Executando → Finalizado.', correta: false, explicacao: 'Apto não vai para Bloqueado (só quem executa faz pedidos de E/S) e Bloqueado não vai para Executando.' },
        { texto: 'Processo é um programa em execução. Sequência: Apto → Executando → Bloqueado → Finalizado.', correta: false, explicacao: 'Falta o estado Criado no início. Além disso, o enunciado diz que o processo recebe o resultado da E/S: quando isso acontece ele deixa de estar Bloqueado (vai para Apto e depois executa), em vez de terminar ainda bloqueado.' },
      ],
    },
    {
      id: 'm03-a02-q8',
      enunciado: 'Qual das situações é um término <strong>involuntário</strong> de processo?',
      alternativas: [
        { texto: 'O processo tenta dividir por zero e o SO o encerra (erro fatal).', correta: true, explicacao: 'Correto. Erro fatal e cancelamento por outro processo são os términos involuntários na classificação do Tanenbaum.' },
        { texto: 'O compilador termina a compilação e chama exit.', correta: false, explicacao: 'Saída normal: o processo terminou o trabalho e pediu para sair. É voluntário.' },
        { texto: 'O compilador percebe que o arquivo pedido não existe e termina.', correta: false, explicacao: 'Saída por erro: o próprio processo detecta o problema e decide terminar. Ainda é voluntário.' },
        { texto: 'O usuário fecha o editor pelo menu "Sair".', correta: false, explicacao: 'O programa recebe o pedido e termina chamando exit: saída normal, voluntária.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm03-a02-d1',
      enunciado: 'O que é um processo? Descreva todos os estados por que ele pode passar, da criação ao término, usando o modelo de estados mais completo.',
      respostaModelo: `<p><strong>Processo</strong> é um <strong>programa em execução</strong>: entidade dinâmica formada por código, dados e contexto (registradores, contador de programa), identificada por um PID e representada no SO por um descritor (BDP).</p>
<p><strong>Estados (modelo de cinco estados):</strong> <strong>Criado</strong> (o SO monta o descritor), <strong>Apto</strong> (pronto, esperando a CPU na fila de aptos), <strong>Executando</strong> (usando a CPU), <strong>Bloqueado</strong> (esperando um evento, como o fim de uma E/S) e <strong>Finalizado</strong> (terminou; recursos liberados).</p>
<p><strong>Transições:</strong> Criado → Apto (admissão); Apto → Executando (seleção pelo escalonador/dispatcher); Executando → Apto (fim da fatia de tempo ou preempção); Executando → Bloqueado (chamada de sistema de E/S ou espera por evento); Bloqueado → Apto (ocorrência do evento, avisada por interrupção); Executando → Finalizado (término normal, por erro ou erro fatal). Não existem Bloqueado → Executando nem Apto → Bloqueado. Um processo Apto ou Bloqueado pode ainda ser encerrado direto por cancelamento (kill), intervenção do SO ou logoff (setas que o Stallings desenha e os slides omitem).</p>
<p><strong>Modelo mais completo (sete estados):</strong> quando falta memória, o SO leva processos para o disco (swap). Surgem <strong>Apto-suspenso</strong> e <strong>Bloqueado-suspenso</strong>: Apto ↔ Apto-suspenso e Bloqueado ↔ Bloqueado-suspenso (suspensão e ativação), Bloqueado-suspenso → Apto-suspenso (o evento ocorre com o processo no disco) e Criado → Apto-suspenso (admissão direto no disco).</p>`,
      pontosChave: [
        'Processo é um programa em execução (código, dados e contexto, com PID)',
        'Cita os cinco estados: Criado, Apto, Executando, Bloqueado e Finalizado',
        'Explica as transições com seus gatilhos (admissão, seleção, tempo/preempção, E/S, evento, término)',
        'Deixa claro que Bloqueado volta para Apto, não direto para Executando',
        'Menciona os estados suspensos (Apto-suspenso e Bloqueado-suspenso) do modelo completo',
      ],
    },
  ],
});
