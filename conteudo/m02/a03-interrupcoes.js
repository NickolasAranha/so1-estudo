// Módulo 2, aula 3: interrupções (conceito, tipos, mecanismo, importância para a multiprogramação, timer e preempção).
SO1.registerLesson({
  id: 'm02-a03',
  titulo: 'Interrupções',
  fontes: [
    'Slides cap2 (Oliveira/Carissimi/Toscani, UFRGS): mecanismo de interrupção (1) e (2), suporte de hardware à multiprogramação, proteção do processador',
    'Slides cap1 (Oliveira/Carissimi/Toscani, UFRGS): SO na visão de projeto (ativado por eventos); interrupções e discos possibilitaram a multiprogramação',
    'Tanenbaum, SO Modernos 3ª ed., §1.3.1 (p.13: traps e armadilhas de hardware) e §1.3.5 Dispositivos de E/S (p.17–18, Fig. 1.11)',
    'Tanenbaum, SO Modernos 3ª ed., §5.1.5 Interrupções revisitadas (p.209–210, Fig. 5.4)',
    'Silberschatz, Fundamentos de SO, §1.2.1 e §13.2.2 (interrupções mascaráveis e não mascaráveis/NMI, falhas de hardware)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a campainha do forno.</strong> Você coloca um bolo no forno por 40 minutos. Sem campainha, teria de ficar abrindo o forno a cada minuto para ver se assou e não faria mais nada (isso é <em>espera ocupada</em>). Com a campainha, você vai lavar a louça; quando ela toca, você <strong>termina o prato que está lavando</strong>, guarda a esponja <strong>no lugar exato</strong> (para saber onde parou), tira o bolo e depois volta à louça de onde parou.</p>
  <p>A campainha é a <strong>interrupção</strong>; terminar o prato é terminar a instrução atual; guardar a esponja no lugar é <strong>salvar o contexto</strong>; tirar o bolo é a <strong>rotina de tratamento</strong>.</p>
</div>

<h2>O que é uma interrupção</h2>
<p>Uma <strong>interrupção</strong> é um sinal que <strong>avisa a ocorrência de um evento</strong>, pedindo a atenção do processador para tratá-lo. Ela provoca a execução de uma rotina especial, o <strong>tratador (rotina de tratamento) de interrupção</strong>, de forma <strong>parecida com a chamada de uma sub-rotina</strong>: o programa interrompido para, a rotina é executada e, depois, o programa continua exatamente de onde parou, sem perceber.</p>
<p>A diferença para uma sub-rotina comum é que o programa <strong>não chamou</strong> o tratador: o desvio é provocado pelo hardware, quando o evento acontece. Na visão de projeto, o SO é um software <strong>ativado por eventos</strong> (chamadas de sistema e interrupções), e o mecanismo de interrupção é essencial para sinalizar o término e a ocorrência de eventos, tratar exceções e auxiliar as atividades de gerência.</p>

<h2>Tipos de interrupção</h2>
<table>
  <tr><th>Tipo</th><th>Origem</th><th>Exemplos</th></tr>
  <tr><td><strong>De hardware (externa)</strong></td><td>Um <strong>evento externo</strong> à CPU, sinalizado por um dispositivo. Acontece a qualquer momento, sem relação com a instrução em execução (<strong>assíncrona</strong>).</td><td>Fim de uma leitura de disco, tecla pressionada, pacote chegou da rede, <strong>interrupção do temporizador (timer)</strong>, fim de uma transferência por DMA.</td></tr>
  <tr><td><strong>De software (trap)</strong></td><td>A <strong>execução de uma instrução específica</strong> pelo próprio programa, de propósito (<strong>síncrona</strong>).</td><td>Instrução TRAP de uma <strong>chamada de sistema</strong> (pedir leitura de arquivo, criar processo).</td></tr>
  <tr><td><strong>Exceção</strong></td><td>Um <strong>erro na execução</strong> de uma instrução (síncrona, mas não intencional). O Tanenbaum chama de "armadilhas de hardware".</td><td>Divisão por zero, overflow e underflow, acesso fora da faixa base–limite, instrução privilegiada em modo usuário.</td></tr>
  <tr><td><strong>Falha de hardware</strong></td><td>Não aparece nos slides, que listam só hardware, software e exceção. É um defeito detectado pelo próprio hardware, que costuma chegar por uma <strong>interrupção não mascarável (NMI)</strong>, de prioridade máxima: ela não pode ser desabilitada.</td><td>Erro de paridade na memória, queda de energia iminente.</td></tr>
</table>
<p>Cada interrupção é <strong>identificada por um número</strong>, usado como índice no <strong>vetor de interrupção</strong>: uma tabela na memória com o <strong>endereço do tratador</strong> de cada tipo. Traps e interrupções de hardware usam o mesmo mecanismo e, muitas vezes, compartilham o mesmo vetor. As interrupções também têm <strong>prioridades</strong>: se dois dispositivos interrompem ao mesmo tempo, o de maior prioridade é atendido primeiro. A CPU pode <strong>desabilitar (mascarar)</strong> as interrupções (exceto a NMI) por um tempo, por exemplo enquanto trata outra; os dispositivos continuam sinalizando e são atendidos quando elas forem reabilitadas. Habilitar e desabilitar interrupções são <strong>instruções privilegiadas</strong>.</p>

<h2>O mecanismo, passo a passo</h2>
<p>Os slides resumem o ciclo em três partes: <strong>salvar o contexto</strong> (preparar a transferência de controle), <strong>desviar para o tratador</strong> e, ao final, <strong>restaurar o contexto</strong> e voltar ao ponto interrompido. Com os detalhes do Tanenbaum (Fig. 1.11 e 5.4), para uma interrupção de disco:</p>

<figure class="diagrama">
  <svg viewBox="0 0 520 330" style="max-width:640px" role="img" aria-label="Mecanismo de interrupção: dispositivo, controlador, CPU termina a instrução, salva PC e PSW, consulta o vetor, executa o tratador e retorna">
    <defs>
      <marker id="m02a03-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
      </marker>
    </defs>
    <g font-size="12" text-anchor="middle" fill="currentColor">
      <rect x="10" y="10" width="110" height="44" rx="6" fill="none" stroke="currentColor"/>
      <text x="65" y="30">Controlador</text>
      <text x="65" y="45">de disco</text>
      <rect x="160" y="10" width="130" height="44" rx="6" fill="none" stroke="currentColor"/>
      <text x="225" y="30">Controlador de</text>
      <text x="225" y="45">interrupção</text>
      <rect x="340" y="10" width="170" height="44" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="425" y="37" font-weight="bold">CPU</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M120 32 H156" marker-end="url(#m02a03-seta)"/>
      <path d="M290 32 H336" marker-end="url(#m02a03-seta)"/>
    </g>
    <g font-size="11" fill="currentColor" text-anchor="middle">
      <text x="138" y="70">① sinal</text>
      <text x="313" y="70">② nº do</text>
      <text x="313" y="83">dispositivo</text>
    </g>
    <g font-size="12" fill="currentColor">
      <rect x="40" y="100" width="440" height="30" rx="6" fill="none" stroke="currentColor"/>
      <text x="52" y="120">③ CPU <tspan font-weight="bold">termina a instrução atual</tspan> (não para no meio dela)</text>
      <rect x="40" y="138" width="440" height="30" rx="6" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
      <text x="52" y="158">④ hardware <tspan font-weight="bold">salva PC e PSW</tspan> (na pilha) e muda para modo núcleo</text>
      <rect x="40" y="176" width="440" height="30" rx="6" fill="none" stroke="currentColor"/>
      <text x="52" y="196">⑤ nº da interrupção indexa o <tspan font-weight="bold">vetor de interrupção</tspan> → endereço</text>
      <rect x="40" y="214" width="440" height="30" rx="6" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <text x="52" y="234">⑥ <tspan font-weight="bold">tratador</tspan>: salva os demais registradores, confirma, trata o evento</text>
      <rect x="40" y="252" width="440" height="30" rx="6" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
      <text x="52" y="272">⑦ <tspan font-weight="bold">restaura o contexto</tspan> e retorna à instrução seguinte</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.3">
      <path d="M425 56 V96" marker-end="url(#m02a03-seta)"/>
      <path d="M260 130 V136" marker-end="url(#m02a03-seta)"/>
      <path d="M260 168 V174" marker-end="url(#m02a03-seta)"/>
      <path d="M260 206 V212" marker-end="url(#m02a03-seta)"/>
      <path d="M260 244 V250" marker-end="url(#m02a03-seta)"/>
    </g>
    <text x="260" y="310" font-size="11" text-anchor="middle" fill="currentColor">Em ⑦ o SO pode, em vez de voltar ao mesmo processo, chamar o escalonador e entregar a CPU a outro.</text>
  </svg>
  <figcaption>Mecanismo de interrupção. O <strong>contexto</strong> mínimo salvo pelo hardware é o PC (onde continuar) e a PSW (modo e códigos de condição); o tratador salva o resto dos registradores.</figcaption>
</figure>

<ol>
  <li>O controlador de disco termina a transferência e envia um sinal numa linha de interrupção do barramento.</li>
  <li>O <strong>controlador de interrupção</strong> verifica se pode atendê-la (pode estar ocupado com outra de maior prioridade; nesse caso o dispositivo continua sinalizando). Se puder, coloca o <strong>número do dispositivo</strong> no barramento e sinaliza a CPU.</li>
  <li>A CPU <strong>termina a instrução em execução</strong>. O hardware verifica se há interrupção pendente ao final de cada instrução.</li>
  <li>O hardware <strong>salva o contador de programa (PC) e a PSW</strong>, normalmente na pilha, e chaveia a CPU para <strong>modo núcleo</strong>.</li>
  <li>O número da interrupção é usado como índice no <strong>vetor de interrupção</strong>, que fornece o novo PC: o endereço do tratador.</li>
  <li>O <strong>tratador</strong> (parte do driver) salva os demais registradores, confirma a interrupção ao controlador (liberando-o para a próxima) e trata o evento: por exemplo, copia os dados, consulta o estado do dispositivo e <strong>acorda o processo que esperava</strong> essa E/S.</li>
  <li>O contexto é <strong>restaurado</strong> e a execução volta à primeira instrução ainda não executada do programa interrompido.</li>
</ol>

<h2>Por que a interrupção é tão importante para a multiprogramação</h2>
<p>A ideia da multiprogramação é: <strong>enquanto um programa espera a E/S, a CPU executa outro</strong>. Isso só funciona se a CPU não precisar ficar vigiando o dispositivo:</p>
<ul>
  <li><strong>Sem interrupção</strong>, a única forma de saber se a E/S terminou é a <strong>espera ocupada</strong> (<em>polling</em>): a CPU fica num laço perguntando "já terminou?". Enquanto isso, nenhum outro programa executa; não há sobreposição entre CPU e E/S.</li>
  <li><strong>Com interrupção</strong>, o SO inicia a E/S, coloca o processo como <strong>Bloqueado</strong> e entrega a CPU a outro processo. Quando o dispositivo termina, a interrupção avisa; o SO passa o processo que esperava para <strong>Apto</strong>. A CPU e os dispositivos trabalham <strong>em paralelo</strong>.</li>
  <li>A <strong>interrupção do timer</strong> devolve periodicamente o controle ao SO. Sem ela, um processo que nunca faz E/S ficaria com a CPU para sempre: não haveria <strong>preempção</strong> nem timesharing.</li>
  <li>As <strong>traps</strong> são a porta de entrada das chamadas de sistema, e as <strong>exceções</strong> permitem ao SO conter erros de um processo sem afetar os outros (proteção).</li>
</ul>
<p>Por isso os slides do cap1 dizem que as <strong>interrupções</strong> (junto com os discos) foram as inovações de hardware que <strong>possibilitaram o surgimento da multiprogramação</strong>.</p>

<h2>Timer e preempção</h2>
<p>O <strong>temporizador</strong> é um dispositivo que gera interrupções em intervalos regulares. A cada interrupção do timer, o SO atualiza o relógio e a contabilização de tempo e verifica se o processo em execução já esgotou a sua fatia de tempo (<strong>quantum</strong>). Se esgotou, o SO o devolve à fila de <strong>Apto</strong> e o <strong>dispatcher</strong> entrega a CPU a outro processo. Tirar a CPU de um processo que ainda poderia continuar é a <strong>preempção</strong>, base do escalonamento Round Robin (Módulo 7).</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: dois processos, A e B, com uma leitura de disco.</strong></p>
  <table>
    <tr><th>Momento</th><th>O que acontece</th><th>A</th><th>B</th></tr>
    <tr><td>1</td><td>A executa e faz <code>read</code> (chamada de sistema: <strong>trap</strong>). O SO manda o controlador de disco ler o bloco.</td><td>Executando → Bloqueado</td><td>Apto</td></tr>
    <tr><td>2</td><td>O SO escolhe B. Enquanto o disco trabalha, a CPU executa B (sobreposição CPU × E/S).</td><td>Bloqueado</td><td>Executando</td></tr>
    <tr><td>3</td><td>O disco termina e gera uma <strong>interrupção de hardware</strong>. A CPU termina a instrução de B, salva PC e PSW e desvia para o tratador do disco.</td><td>Bloqueado</td><td>Executando (interrompido)</td></tr>
    <tr><td>4</td><td>O tratador copia os dados e marca A como pronto para continuar. Restaura o contexto de B, que continua.</td><td>Bloqueado → Apto</td><td>Executando</td></tr>
    <tr><td>5</td><td>A <strong>interrupção do timer</strong> mostra que B esgotou o quantum: <strong>preempção</strong>. O dispatcher salva o contexto de B e restaura o de A.</td><td>Apto → Executando</td><td>Executando → Apto</td></tr>
    <tr><td>6</td><td>A continua logo após o <code>read</code>, já com os dados no buffer.</td><td>Executando</td><td>Apto</td></tr>
  </table>
  <p>Note que, no momento 4, A vai para <strong>Apto</strong>, e não direto para Executando: a CPU está com B.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>A CPU <strong>termina a instrução atual</strong> antes de atender a interrupção; ela não abandona a instrução no meio.</li>
    <li><strong>Interrupção de hardware é assíncrona</strong> (vem de fora, a qualquer momento); <strong>trap e exceção são síncronas</strong> (causadas pela instrução que está executando). Trap é intencional; exceção é erro.</li>
    <li>A chamada de sistema <strong>é implementada com</strong> uma interrupção de software (trap), mas "chamada de sistema" e "interrupção" não são sinônimos: uma questão dissertativa pode pedir os dois separadamente.</li>
    <li>O <strong>vetor de interrupção</strong> guarda <strong>endereços</strong> dos tratadores, não os tratadores em si.</li>
    <li>Quando a E/S termina, o processo vai de Bloqueado para <strong>Apto</strong>, nunca direto para Executando.</li>
  </ul>
</div>
`,
  resumo: 'Interrupção é um sinal de que ocorreu um evento; ela desvia a CPU para um tratador, como uma sub-rotina não chamada pelo programa. Tipos: de hardware (externa, assíncrona: E/S, timer), de software (trap, instrução de chamada de sistema) e exceção (erro de execução), além de falhas de hardware. Mecanismo: a CPU termina a instrução, salva PC e PSW, muda para modo núcleo, usa o número da interrupção no vetor de interrupção para achar o tratador, trata o evento e restaura o contexto. É essencial à multiprogramação porque libera a CPU durante a E/S (o processo bloqueia e outro executa) e, com o timer, permite a preempção.',
  questoes: [
    {
      id: 'm02-a03-q1',
      enunciado: 'Por que a interrupção é essencial para a multiprogramação?',
      alternativas: [
        { texto: 'Porque permite que a CPU execute outro programa enquanto um espera a E/S: o dispositivo avisa o término por interrupção, sem que a CPU fique em espera ocupada.', correta: true, explicacao: 'Correto. Sem interrupção, a CPU teria de ficar perguntando ao dispositivo se a E/S terminou (polling) e não poderia executar outro programa. Com ela, CPU e E/S trabalham em paralelo; e o timer, também por interrupção, permite a preempção.' },
        { texto: 'Porque permite que vários processadores executem ao mesmo tempo.', correta: false, explicacao: 'Multiprogramação acontece com uma única CPU. Ter vários processadores é multiprocessamento, outro conceito.' },
        { texto: 'Porque aumenta a capacidade da memória principal.', correta: false, explicacao: 'A interrupção não muda a capacidade da memória. Ela é um mecanismo de sinalização de eventos.' },
        { texto: 'Porque elimina a necessidade de o SO trocar de processo.', correta: false, explicacao: 'É o contrário: a interrupção é justamente o que dá ao SO a oportunidade de trocar de processo (no fim de uma E/S ou no fim do quantum).' },
      ],
    },
    {
      id: 'm02-a03-q2',
      enunciado: 'Qual situação exemplifica uma interrupção de <strong>hardware</strong> (externa)?',
      alternativas: [
        { texto: 'O controlador de disco termina de ler um bloco e sinaliza a CPU.', correta: true, explicacao: 'Correto. É um evento externo à CPU, que ocorre a qualquer momento (assíncrono). Teclado, rede, timer e fim de DMA são outros exemplos.' },
        { texto: 'O programa executa uma divisão por zero.', correta: false, explicacao: 'Divisão por zero é uma exceção: um erro na execução de uma instrução do próprio programa, não um evento externo.' },
        { texto: 'O programa executa a instrução TRAP para pedir a leitura de um arquivo.', correta: false, explicacao: 'Isso é uma interrupção de software (trap), provocada de propósito por uma instrução do programa numa chamada de sistema.' },
        { texto: 'O programa chama uma função da sua própria biblioteca.', correta: false, explicacao: 'Uma chamada de função comum não é interrupção: não muda o modo da CPU nem passa pelo vetor de interrupção.' },
      ],
    },
    {
      id: 'm02-a03-q3',
      enunciado: 'Classifique: (I) acesso a endereço fora da faixa base–limite; (II) tecla pressionada; (III) instrução TRAP de uma chamada de sistema.',
      alternativas: [
        { texto: 'I = exceção; II = hardware; III = software (trap).', correta: true, explicacao: 'Correto. O acesso ilegal é um erro de execução (exceção); a tecla é um evento externo (hardware); o TRAP é a instrução que gera interrupção de software de propósito.' },
        { texto: 'I = hardware; II = exceção; III = software (trap).', correta: false, explicacao: 'A tecla pressionada vem de um dispositivo externo: é interrupção de hardware, não exceção. O acesso ilegal é causado pela instrução do programa: é exceção.' },
        { texto: 'I = software (trap); II = hardware; III = exceção.', correta: false, explicacao: 'O TRAP é intencional, por isso é interrupção de software; exceção é erro. E o acesso ilegal não é intencional: é exceção.' },
        { texto: 'Todas são interrupções de hardware.', correta: false, explicacao: 'Só a tecla vem de um dispositivo externo. As outras duas são causadas pela instrução em execução (síncronas).' },
      ],
    },
    {
      id: 'm02-a03-q4',
      enunciado: 'Qual é a ordem correta do tratamento de uma interrupção?',
      alternativas: [
        { texto: 'Termina a instrução atual → salva o contexto (PC, PSW) → consulta o vetor de interrupção → executa o tratador → restaura o contexto e retorna.', correta: true, explicacao: 'Correto. É o ciclo dos slides (salva contexto, desvia para o tratador, restaura e retorna), com os detalhes do Tanenbaum (vetor de interrupção, PC e PSW na pilha).' },
        { texto: 'Abandona a instrução atual → executa o tratador → salva o contexto → retorna.', correta: false, explicacao: 'A CPU termina a instrução atual, e o contexto precisa ser salvo ANTES do tratador; senão o tratador sobrescreveria os registradores do programa interrompido.' },
        { texto: 'Executa o tratador → consulta o vetor → termina a instrução → retorna.', correta: false, explicacao: 'O vetor precisa ser consultado antes, pois é ele que informa o endereço do tratador.' },
        { texto: 'Salva o contexto → reinicia o programa interrompido do começo → executa o tratador.', correta: false, explicacao: 'O programa interrompido continua do ponto onde parou, não do começo. É para isso que o PC é salvo.' },
      ],
    },
    {
      id: 'm02-a03-q5',
      enunciado: 'O que é o vetor de interrupção?',
      alternativas: [
        { texto: 'Uma tabela na memória, indexada pelo número da interrupção, que contém os endereços das rotinas de tratamento.', correta: true, explicacao: 'Correto. O número da interrupção (colocado no barramento pelo controlador) indexa o vetor, que fornece o novo PC: o início do tratador.' },
        { texto: 'Uma fila com os processos bloqueados esperando E/S.', correta: false, explicacao: 'Filas de processos bloqueados são estruturas do SO (Módulo 3). O vetor guarda endereços de tratadores.' },
        { texto: 'O registrador que guarda o endereço da próxima instrução.', correta: false, explicacao: 'Esse é o contador de programa (PC). O vetor de interrupção é uma tabela na memória.' },
        { texto: 'O código do tratador de cada dispositivo.', correta: false, explicacao: 'O vetor não contém o código, só os endereços onde cada tratador começa.' },
      ],
    },
    {
      id: 'm02-a03-q6',
      enunciado: 'Um processo de cálculo nunca faz E/S nem chamadas de sistema. Como o SO consegue tirar a CPU dele para executar outros processos?',
      alternativas: [
        { texto: 'Pela interrupção do temporizador (timer), que ocorre periodicamente e devolve o controle ao SO, permitindo a preempção.', correta: true, explicacao: 'Correto. O timer garante que o SO execute de tempos em tempos. Se o quantum do processo acabou, o SO o devolve à fila de Apto e escala outro.' },
        { texto: 'Esperando o processo terminar; não há outra forma.', correta: false, explicacao: 'Isso aconteceria num sistema sem timer (não preemptivo). Com o timer, o SO retoma a CPU periodicamente.' },
        { texto: 'Pela proteção de memória, que interrompe o processo a cada acesso.', correta: false, explicacao: 'A proteção de memória só gera interrupção em acesso ILEGAL. Um processo correto nunca a dispara.' },
        { texto: 'Pelo DMA, que pausa a CPU para transferir dados.', correta: false, explicacao: 'O DMA transfere dados entre dispositivo e memória; ele não decide qual processo usa a CPU.' },
      ],
    },
    {
      id: 'm02-a03-q7',
      enunciado: 'O processo A estava Bloqueado esperando uma leitura de disco, e o processo B está Executando. Chega a interrupção de fim da leitura. Logo após o tratamento, qual é o estado de A?',
      alternativas: [
        { texto: 'Apto: o tratador sinaliza que o evento ocorreu, e A espera a vez de usar a CPU.', correta: true, explicacao: 'Correto. Bloqueado nunca vai direto para Executando: o processo passa para Apto e só volta a executar quando o escalonador o escolher.' },
        { texto: 'Executando: A recebe a CPU imediatamente, porque o evento dele aconteceu.', correta: false, explicacao: 'Pegadinha clássica. A interrupção desbloqueia A, mas a CPU continua com B (ou com quem o escalonador escolher). A vai para Apto.' },
        { texto: 'Bloqueado: A só sai desse estado quando B terminar.', correta: false, explicacao: 'A espera de A era pela E/S, que terminou. Ele não depende do término de B.' },
        { texto: 'Terminado: a E/S era a última operação de A.', correta: false, explicacao: 'Nada indica que A terminou. Depois da leitura, ele ainda precisa executar o código seguinte ao read.' },
      ],
    },
    {
      id: 'm02-a03-q8',
      enunciado: 'Sobre interrupções desabilitadas (mascaradas) pela CPU, é correto afirmar:',
      alternativas: [
        { texto: 'Os dispositivos continuam sinalizando, mas a CPU só é interrompida quando as interrupções forem reabilitadas; habilitar e desabilitar são instruções privilegiadas.', correta: true, explicacao: 'Correto (Tanenbaum §1.3.5). Se vários dispositivos terminam nesse período, o controlador de interrupção decide pela prioridade qual atender primeiro. A exceção é a NMI (interrupção não mascarável, usada em falhas graves de hardware), que não pode ser desabilitada.' },
        { texto: 'As interrupções que ocorrem nesse período são descartadas e perdidas.', correta: false, explicacao: 'O dispositivo continua emitindo o sinal até ser atendido; a interrupção fica pendente, não é perdida.' },
        { texto: 'Qualquer programa de usuário pode desabilitar as interrupções quando quiser.', correta: false, explicacao: 'Se pudesse, desligaria o timer e monopolizaria a CPU. Por isso essas instruções são privilegiadas.' },
        { texto: 'Desabilitar interrupções faz a CPU trocar de processo mais rápido.', correta: false, explicacao: 'É o contrário: sem interrupções (inclusive a do timer), o SO não consegue fazer a preempção.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm02-a03-d1',
      enunciado: 'Explique como funciona o mecanismo de interrupção e por que, sem ele, a multiprogramação não seria viável.',
      respostaModelo: `<p><strong>Importância.</strong> A multiprogramação mantém vários programas na memória e, quando um deles faz E/S, entrega a CPU a outro. Para isso, a CPU não pode ficar presa esperando o dispositivo. Sem interrupção, ela teria de fazer <strong>espera ocupada</strong> (perguntar repetidamente se a E/S terminou) e nenhum outro programa executaria. Com a interrupção, o SO inicia a E/S, coloca o processo como <strong>Bloqueado</strong> e executa outro; quando o dispositivo termina, ele <strong>avisa por interrupção</strong> e o processo volta a <strong>Apto</strong>. Assim CPU e E/S trabalham em paralelo. Além disso, a <strong>interrupção do timer</strong> devolve periodicamente o controle ao SO, permitindo a <strong>preempção</strong> (timesharing); as <strong>traps</strong> implementam as chamadas de sistema e as <strong>exceções</strong> permitem tratar erros de um processo sem afetar os outros.</p>
<p><strong>Mecanismo.</strong> (1) O dispositivo sinaliza o evento ao controlador de interrupção, que passa o número da interrupção à CPU (considerando prioridades). (2) A CPU <strong>termina a instrução atual</strong>. (3) O hardware <strong>salva o contexto</strong> (PC e PSW, na pilha) e passa para modo supervisor. (4) O número da interrupção indexa o <strong>vetor de interrupção</strong>, que dá o endereço da <strong>rotina de tratamento</strong>. (5) A rotina trata o evento (como uma sub-rotina). (6) O contexto é <strong>restaurado</strong> e a execução volta ao ponto interrompido (ou o SO escala outro processo).</p>`,
      pontosChave: [
        'Explicou que, sem interrupção, a CPU ficaria em espera ocupada durante a E/S',
        'Explicou que a interrupção permite executar outro processo enquanto um espera E/S (Bloqueado → Apto ao fim)',
        'Citou o timer/preempção como uso da interrupção na multiprogramação',
        'Descreveu o mecanismo: termina a instrução, salva o contexto, vetor de interrupção, tratador, restaura',
      ],
    },
  ],
});
