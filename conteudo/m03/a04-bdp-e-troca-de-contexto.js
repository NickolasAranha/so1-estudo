// Módulo 3, aula 4: criação de processo, BDP, filas, quando retirar da CPU, dispatcher e troca de contexto (custo).
SO1.registerLesson({
  id: 'm03-a04',
  titulo: 'BDP, filas e troca de contexto',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.1.6 (p.55–56): tabela de processos, Tabela 2.1 e Tabela 2.2',
    'Tanenbaum, SO Modernos 3ª ed., §2.4.1 (p.88): custo do chaveamento de processos',
    'Slides cap4 (Oliveira/Carissimi/Toscani, UFRGS): implementação de processo, BDP, filas, criação, quando retirar, seleção, dispatcher, chaveamento de contexto',
    'Resolução dos exercícios do cap. 4 (Machado & Maia), Q2 e Q14: escalonador x dispatcher, overhead das trocas de contexto',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a ficha do paciente.</strong> Um médico atende vários pacientes alternadamente. Para não se perder, cada paciente tem uma <strong>ficha</strong> com nome, número do prontuário, situação (esperando, em atendimento, aguardando exame), em que ponto do tratamento parou, prioridade e exames pedidos: é o <strong>BDP</strong>. As fichas ficam em pilhas: "aguardando consulta", "aguardando exame". Quando o médico troca de paciente, ele <strong>anota na ficha do atual onde parou</strong>, guarda-a na pilha certa, pega a ficha do próximo e <strong>lê onde tinha parado</strong>: é a <strong>troca de contexto</strong>. Durante essa troca de fichas, ninguém está sendo atendido: é o <strong>custo</strong> da troca.</p>
</div>

<h2>Implementando o processo</h2>
<p>Para gerenciar processos, o SO precisa organizar filas de processos nos diferentes estados, saber que eventos causam as transições e decidir quando e como cada processo usa o processador. Para isso, mantém uma série de informações sobre cada processo.</p>

<h3>Criação de processo: tarefas típicas</h3>
<ol>
  <li><strong>Alocar um descritor</strong> de processo (BDP).</li>
  <li><strong>Obter um identificador único</strong> para o processo (<strong>PID</strong>).</li>
  <li><strong>Inicializar o descritor</strong> (estado, prioridade, contexto inicial, memória).</li>
  <li><strong>Inserir apontadores</strong> para esse descritor nas estruturas de controle do SO, por exemplo <strong>na fila de aptos</strong>.</li>
  <li><strong>Criar ou expandir estruturas de dados</strong> do SO para o processo, por exemplo as de contabilização.</li>
</ol>

<h2>BDP: bloco descritor de processo</h2>
<p>O <strong>BDP</strong> (bloco descritor de processo; em inglês <strong>PCB</strong>, <em>process control block</em>) é a <strong>estrutura de dados que implementa a abstração de processo</strong>. Cada processo tem o seu, e o conjunto deles forma a <strong>tabela de processos</strong>. Sua <strong>função</strong> é guardar tudo o que o SO precisa saber sobre o processo, em especial o que deve ser salvo quando o processo deixa de executar, para que ele possa ser <strong>retomado depois como se nunca tivesse parado</strong>.</p>
<table>
  <tr><th>Informação</th><th>Exemplo</th></tr>
  <tr><td><strong>Identificação</strong></td><td>PID, processo pai, usuário e grupo</td></tr>
  <tr><td><strong>Estado do processo</strong></td><td>Apto, Executando, Bloqueado...</td></tr>
  <tr><td><strong>Contexto de execução</strong> (contexto de hardware)</td><td>Contador de programa (PC), ponteiro de pilha (SP), registradores, palavra de estado do programa (PSW)</td></tr>
  <tr><td><strong>Prioridade</strong> e parâmetros de escalonamento</td><td>Prioridade 5; tempo de CPU já usado</td></tr>
  <tr><td><strong>Memória</strong></td><td>Localização e tamanho na memória principal; ponteiros para os segmentos de código, dados e pilha</td></tr>
  <tr><td><strong>Arquivos abertos</strong></td><td>Descritores de arquivo, diretório de trabalho</td></tr>
  <tr><td><strong>Contabilidade</strong></td><td>Tempo de CPU usado, momento de início, espaço de memória</td></tr>
  <tr><td><strong>Apontadores de encadeamento</strong></td><td>Ponteiro para o próximo BDP da mesma fila</td></tr>
</table>
<p>O exemplo dos slides mostra um BDP simplificado em C:</p>
<pre class="codigo"><code>struct desc_proc {
    char     estado_atual;
    int      prioridade;
    unsigned inicio_memoria;
    unsigned tamanho_mem;
    struct arquivos arquivos_abertos[20];
    unsigned tempo_cpu;
    unsigned proc_pc;     /* contador de programa */
    unsigned proc_sp;     /* ponteiro de pilha */
    unsigned proc_acc;    /* acumulador */
    unsigned proc_rx;     /* registrador */
    struct desc_proc *proximo;  /* encadeamento na fila */
};
struct desc_proc tab_desc[MAX_PROCESS];  /* tabela de processos */</code></pre>

<h2>Os processos e as filas</h2>
<p><strong>Um processo sempre faz parte de alguma fila</strong>, e normalmente os próprios BDPs são os elementos dessas filas, ligados pelo campo <code>proximo</code>. As filas típicas são:</p>
<ul>
  <li><strong>fila de livres</strong>: descritores não usados (número máximo fixo de processos, ou alocação dinâmica);</li>
  <li><strong>fila de aptos</strong>: processos esperando a CPU;</li>
  <li><strong>fila(s) de bloqueados</strong>: em geral uma por dispositivo ou evento (disco, teclado...).</li>
</ul>
<p>O processo Executando é apontado por uma variável própria (no exemplo dos slides, <code>usando_cpu</code>). Os <strong>eventos movem o BDP de uma fila para outra</strong>: uma transição de estado é, na prática, tirar o descritor de uma lista e colocá-lo em outra.</p>

<figure class="diagrama">
  <svg viewBox="0 0 460 210" style="max-width:600px" role="img" aria-label="Filas de BDPs: Executando aponta para o BDP 5; a fila de aptos tem os BDPs 12, 4 e 7 encadeados; a fila de bloqueados do disco tem os BDPs 3 e 9; a fila de livres tem descritores vazios">
    <defs>
      <marker id="m03a04-s1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" style="fill:currentColor"/></marker>
    </defs>
    <g font-size="12" fill="currentColor">
      <text x="10" y="34" font-weight="bold">Executando</text>
      <text x="10" y="84" font-weight="bold">Aptos</text>
      <text x="10" y="134" font-weight="bold">Bloqueados</text>
      <text x="10" y="148" font-size="11">(disco)</text>
      <text x="10" y="184" font-weight="bold">Livres</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.3">
      <line x1="96" y1="30" x2="128" y2="30" marker-end="url(#m03a04-s1)"/>
      <line x1="96" y1="80" x2="128" y2="80" marker-end="url(#m03a04-s1)"/>
      <line x1="186" y1="80" x2="214" y2="80" marker-end="url(#m03a04-s1)"/>
      <line x1="272" y1="80" x2="300" y2="80" marker-end="url(#m03a04-s1)"/>
      <line x1="96" y1="130" x2="128" y2="130" marker-end="url(#m03a04-s1)"/>
      <line x1="186" y1="130" x2="214" y2="130" marker-end="url(#m03a04-s1)"/>
      <line x1="96" y1="180" x2="128" y2="180" marker-end="url(#m03a04-s1)"/>
      <line x1="186" y1="180" x2="214" y2="180" marker-end="url(#m03a04-s1)"/>
      <line x1="272" y1="180" x2="300" y2="180" marker-end="url(#m03a04-s1)"/>
    </g>
    <g font-size="12" text-anchor="middle" fill="currentColor">
      <rect x="130" y="16" width="56" height="28" rx="4" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/><text x="158" y="35">BDP 5</text>
      <rect x="130" y="66" width="56" height="28" rx="4" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/><text x="158" y="85">BDP 12</text>
      <rect x="216" y="66" width="56" height="28" rx="4" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/><text x="244" y="85">BDP 4</text>
      <rect x="302" y="66" width="56" height="28" rx="4" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/><text x="330" y="85">BDP 7</text>
      <rect x="130" y="116" width="56" height="28" rx="4" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="2"/><text x="158" y="135">BDP 3</text>
      <rect x="216" y="116" width="56" height="28" rx="4" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="2"/><text x="244" y="135">BDP 9</text>
      <rect x="130" y="166" width="56" height="28" rx="4" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
      <rect x="216" y="166" width="56" height="28" rx="4" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
      <rect x="302" y="166" width="56" height="28" rx="4" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="366" y="84">fim (NULL)</text>
      <text x="280" y="134">fim (NULL)</text>
      <text x="366" y="184">...</text>
    </g>
  </svg>
  <figcaption>Os BDPs são encadeados em filas. Quando o disco termina a leitura do processo 3, o BDP 3 sai da fila de bloqueados e entra no fim da fila de aptos.</figcaption>
</figure>

<h2>Quando retirar um processo do processador?</h2>
<ul>
  <li><strong>Término</strong> do processo.</li>
  <li>Um processo de <strong>prioridade mais alta</strong> fica apto a executar.</li>
  <li><strong>Interrupção de tempo</strong>: o processo executou pelo tempo máximo permitido (fatia de tempo, <em>quantum</em>).</li>
  <li><strong>Interrupção de dispositivo de E/S</strong> (e, claro, quando o próprio processo pede E/S e bloqueia).</li>
  <li><strong>Interrupção por falta de página</strong> (ou segmento): o endereço acessado não está na memória (memória virtual).</li>
  <li><strong>Interrupção por erro</strong>.</li>
</ul>
<p>Sempre que a CPU fica livre e há processos aptos, é preciso <strong>selecionar</strong> um deles. Isso é feito pelo <strong>escalonador</strong> mais o <strong>dispatcher</strong>:</p>
<ul>
  <li>o <strong>escalonador</strong> é a rotina que aplica a <strong>política</strong> de escalonamento e <strong>decide</strong> qual processo apto usará a CPU;</li>
  <li>o <strong>dispatcher</strong> é a rotina que <strong>executa a troca de contexto</strong> e entrega a CPU ao processo escolhido.</li>
</ul>

<h2>Dispatcher e troca de contexto</h2>
<p>A <strong>troca de contexto</strong> (chaveamento de contexto, chaveamento de processos) é a operação de <strong>salvar o contexto do processo que está executando e restaurar o contexto de outro</strong>, para que a CPU passe a executá-lo. Passos do dispatcher, segundo os slides:</p>
<ol>
  <li><strong>salvar o contexto</strong> do processo em execução (registradores, PC, SP) no seu BDP;</li>
  <li><strong>atualizar o estado</strong> desse processo no BDP (Apto, Bloqueado...);</li>
  <li><strong>inserir o BDP na fila apropriada</strong> (aptos ou bloqueados);</li>
  <li><strong>selecionar outro processo</strong> para execução (decisão do escalonador);</li>
  <li><strong>atualizar o BDP do processo selecionado</strong> (estado Executando);</li>
  <li><strong>atualizar as estruturas de gerência de memória</strong> (mapa de memória, MMU) e de E/S;</li>
  <li><strong>restaurar o contexto</strong> do processo selecionado, que continua do ponto onde parou.</li>
</ol>
<p><strong>Quem executa</strong> a troca de contexto é o <strong>sistema operacional</strong> (o núcleo, por meio do dispatcher), em <strong>modo supervisor</strong>. O processo não participa nem fica sabendo. A troca é disparada por uma <strong>interrupção</strong> (do temporizador, de um dispositivo) ou por uma <strong>chamada de sistema</strong> (o processo pede E/S ou termina). O hardware faz só o primeiro passo: ao receber a interrupção, empilha o contador de programa e a palavra de estado e desvia para a rotina de tratamento; daí em diante é software.</p>

<figure class="diagrama">
  <svg viewBox="0 0 460 390" style="max-width:600px" role="img" aria-label="Troca de contexto entre os processos P0 e P1: P0 executa, uma interrupção leva ao SO, que salva o contexto no BDP0 e restaura do BDP1; P1 executa; nova interrupção, o SO salva no BDP1 e restaura do BDP0; P0 volta a executar">
    <defs>
      <marker id="m03a04-s2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" style="fill:currentColor"/></marker>
    </defs>
    <g font-size="12" text-anchor="middle" fill="currentColor" font-weight="bold">
      <text x="70" y="20">Processo P0</text>
      <text x="230" y="20">SO (dispatcher)</text>
      <text x="390" y="20">Processo P1</text>
    </g>
    <g stroke-width="10">
      <line x1="70" y1="36" x2="70" y2="106" style="stroke:var(--verde)"/>
      <line x1="390" y1="186" x2="390" y2="256" style="stroke:var(--verde)"/>
      <line x1="70" y1="336" x2="70" y2="380" style="stroke:var(--verde)"/>
    </g>
    <g stroke="currentColor" stroke-dasharray="3 4" opacity="0.6">
      <line x1="70" y1="110" x2="70" y2="332"/>
      <line x1="390" y1="36" x2="390" y2="182"/>
      <line x1="390" y1="260" x2="390" y2="380"/>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="82" y="74">executando</text>
      <text x="82" y="224">apto (parado)</text>
      <text x="82" y="362">executando</text>
      <text x="378" y="74" text-anchor="end">apto (parado)</text>
      <text x="378" y="224" text-anchor="end">executando</text>
      <text x="378" y="330" text-anchor="end">apto (parado)</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.3">
      <line x1="76" y1="110" x2="158" y2="118" marker-end="url(#m03a04-s2)"/>
      <line x1="302" y1="174" x2="384" y2="184" marker-end="url(#m03a04-s2)"/>
      <line x1="384" y1="260" x2="302" y2="268" marker-end="url(#m03a04-s2)"/>
      <line x1="158" y1="324" x2="76" y2="334" marker-end="url(#m03a04-s2)"/>
    </g>
    <g font-size="10" fill="currentColor" font-style="italic">
      <text x="86" y="100">interrupção</text>
      <text x="320" y="252">interrupção</text>
    </g>
    <g font-size="11" text-anchor="middle" fill="currentColor">
      <rect x="160" y="112" width="140" height="64" rx="6" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="1.5"/>
      <text x="230" y="134">salva contexto</text>
      <text x="230" y="148">no BDP0</text>
      <text x="230" y="166">restaura do BDP1</text>
      <rect x="160" y="262" width="140" height="64" rx="6" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="1.5"/>
      <text x="230" y="284">salva contexto</text>
      <text x="230" y="298">no BDP1</text>
      <text x="230" y="316">restaura do BDP0</text>
      <text x="230" y="206" style="fill:var(--vermelho)">overhead: nenhum</text>
      <text x="230" y="220" style="fill:var(--vermelho)">processo de usuário</text>
      <text x="230" y="234" style="fill:var(--vermelho)">avança durante a troca</text>
    </g>
  </svg>
  <figcaption>Troca de contexto entre P0 e P1 (tempo correndo para baixo). As caixas do SO são tempo gasto só com a troca.</figcaption>
</figure>

<h3>O custo (overhead) da troca de contexto</h3>
<p>Durante a troca, a CPU executa código do SO, e <strong>nenhum processo de usuário avança</strong>: é trabalho de administração, puro <strong>overhead</strong>. O Tanenbaum lista o que torna o chaveamento caro: mudar do modo usuário para o modo núcleo, <strong>salvar os registradores</strong> no BDP, salvar o mapa de memória, executar o algoritmo de escalonamento, <strong>recarregar a MMU</strong> com o mapa de memória do novo processo e iniciá-lo; além disso, o chaveamento normalmente <strong>invalida a memória cache</strong>, que precisa ser recarregada. Conclusão do livro: muitos chaveamentos por segundo consomem uma parte grande do tempo de CPU.</p>
<p>Por isso, a fatia de tempo (quantum) não pode ser pequena demais: trocas muito frequentes aumentam o overhead. Se for grande demais, a multiprogramação perde a interatividade (isso é estudado no módulo de escalonamento).</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: P3 está executando quando o disco termina a leitura pedida por P7</strong> (sequência da Tabela 2.2 do Tanenbaum, com o dispatcher).</p>
  <table>
    <tr><th>Passo</th><th>Quem faz</th><th>O que acontece</th></tr>
    <tr><td>1</td><td>Hardware</td><td>Recebe a interrupção do disco, empilha o PC e a palavra de estado de P3 e carrega o endereço da rotina de tratamento (vetor de interrupções).</td></tr>
    <tr><td>2</td><td>SO (rotina em assembly)</td><td>Salva os registradores de P3 no BDP3 e prepara uma pilha temporária.</td></tr>
    <tr><td>3</td><td>SO (tratador de interrupção)</td><td>Trata o disco: o evento de P7 ocorreu. O BDP7 sai da fila de bloqueados do disco e vai para a fila de aptos (Bloqueado → Apto).</td></tr>
    <tr><td>4</td><td>Escalonador</td><td>Decide quem executa. Suponha que P7 tenha prioridade maior que P3.</td></tr>
    <tr><td>5</td><td>Dispatcher</td><td>Marca P3 como Apto e insere o BDP3 na fila de aptos; marca P7 como Executando; atualiza o mapa de memória (MMU).</td></tr>
    <tr><td>6</td><td>Dispatcher</td><td>Restaura os registradores e o PC de P7 a partir do BDP7.</td></tr>
    <tr><td>7</td><td>P7</td><td>Continua exatamente da instrução seguinte ao <code>read</code> que tinha feito.</td></tr>
  </table>
  <p><strong>Custo em números:</strong> com quantum de 4 ms e troca de contexto de 1 ms, a cada 5 ms a CPU perde 1 ms: <strong>1/5 = 20%</strong> de overhead. Com quantum de 100 ms e a mesma troca, perde 1 ms a cada 101 ms: <strong>cerca de 1%</strong>.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Escalonador ≠ dispatcher</strong>: o escalonador <em>decide</em> quem executa (política); o dispatcher <em>faz</em> a troca de contexto (mecanismo).</li>
    <li>Quem faz a troca de contexto é o <strong>SO</strong>, em modo supervisor, e não o processo nem só o hardware. O hardware apenas salva o PC e a PSW (palavra de estado) na interrupção.</li>
    <li>A troca de contexto <strong>não é trabalho útil</strong>: é overhead. Trocas frequentes demais desperdiçam CPU.</li>
    <li>O BDP guarda <strong>informações sobre</strong> o processo (inclusive ponteiros para a memória), e não o código do programa em si.</li>
    <li>"BDP" e "PCB" são a mesma coisa; o Tanenbaum chama o conjunto de <strong>tabela de processos</strong>.</li>
  </ul>
</div>
`,
  resumo: 'Para criar um processo, o SO aloca um BDP, obtém um PID, inicializa o descritor, insere-o na fila de aptos e cria as estruturas de contabilização. O BDP (PCB) guarda tudo sobre o processo: PID, estado, contexto (PC, SP, registradores), prioridade, memória, arquivos abertos, contabilidade e o ponteiro para a fila. Os BDPs ficam encadeados em filas (livres, aptos, bloqueados). Quando o processo sai da CPU, o escalonador escolhe o próximo e o dispatcher, parte do SO em modo supervisor, faz a troca de contexto: salva o contexto no BDP do atual e restaura o do escolhido. Essa troca é overhead, porque nenhum processo de usuário avança enquanto ela acontece.',
  questoes: [
    {
      id: 'm03-a04-q1',
      enunciado: 'O que é o BDP e qual é o seu objetivo?',
      alternativas: [
        { texto: 'É a estrutura de dados que representa o processo no SO, guardando informações como PID, estado, contexto, prioridade, memória e arquivos abertos, para que o processo possa ser interrompido e retomado.', correta: true, explicacao: 'Correto. O bloco descritor de processo (PCB) implementa a abstração de processo. Sem ele, o SO não saberia de onde continuar um processo que saiu da CPU.' },
        { texto: 'É a área de memória onde fica o código executável do programa.', correta: false, explicacao: 'O código fica no espaço de endereçamento do processo. O BDP guarda informações sobre o processo, como a localização e o tamanho na memória.' },
        { texto: 'É a rotina do SO que escolhe qual processo apto vai executar.', correta: false, explicacao: 'Isso é o escalonador. O BDP é uma estrutura de dados, não uma rotina.' },
        { texto: 'É um registrador da CPU que guarda o endereço da próxima instrução.', correta: false, explicacao: 'Isso é o contador de programa (PC). O valor do PC é salvo dentro do BDP na troca de contexto, mas o BDP fica na memória do SO.' },
      ],
    },
    {
      id: 'm03-a04-q2',
      enunciado: 'Qual das informações abaixo <strong>não</strong> costuma fazer parte do BDP?',
      alternativas: [
        { texto: 'O código-fonte do programa que originou o processo.', correta: true, explicacao: 'Correto, não faz parte. O BDP guarda dados de controle (PID, estado, registradores, prioridade, ponteiros de memória, arquivos, contabilidade). O código-fonte não é necessário para executar; o executável fica no espaço de endereçamento do processo.' },
        { texto: 'O valor do contador de programa e dos registradores no momento em que o processo saiu da CPU.', correta: false, explicacao: 'Faz parte: é o contexto de execução, essencial para retomar o processo do ponto onde parou.' },
        { texto: 'A lista de arquivos abertos pelo processo.', correta: false, explicacao: 'Faz parte: os slides citam a identificação dos arquivos abertos, e o Tanenbaum, os descritores de arquivo.' },
        { texto: 'O tempo de CPU já consumido pelo processo.', correta: false, explicacao: 'Faz parte: são as informações de contabilidade, usadas também pelo escalonamento.' },
      ],
    },
    {
      id: 'm03-a04-q3',
      enunciado: 'O que é o <strong>dispatcher</strong> e o que é a <strong>troca de contexto</strong>?',
      alternativas: [
        { texto: 'O dispatcher é a rotina do SO que entrega a CPU ao processo escolhido; a troca de contexto é salvar o contexto do processo atual no seu BDP e restaurar o do próximo.', correta: true, explicacao: 'Correto. Depois que o escalonador decide, o dispatcher realiza o chaveamento: salva registradores, atualiza estados e filas, atualiza a gerência de memória e restaura o contexto do escolhido.' },
        { texto: 'O dispatcher é o algoritmo que decide qual processo executa; a troca de contexto é mudar a prioridade do processo.', correta: false, explicacao: 'Quem decide é o escalonador (política). O dispatcher executa a troca (mecanismo). E a troca de contexto não tem relação com mudar prioridades.' },
        { texto: 'O dispatcher é um dispositivo de hardware; a troca de contexto é levar o processo para o disco.', correta: false, explicacao: 'O dispatcher é software do SO. Levar o processo para o disco é swapping (suspensão), não troca de contexto.' },
        { texto: 'O dispatcher é o processo do usuário que libera a CPU; a troca de contexto é feita pelo próprio processo.', correta: false, explicacao: 'O processo não participa da troca nem fica sabendo dela. É o SO, em modo supervisor, que a realiza.' },
      ],
    },
    {
      id: 'm03-a04-q4',
      enunciado: 'Quem executa a troca de contexto e o que a dispara?',
      alternativas: [
        { texto: 'O sistema operacional (dispatcher), em modo supervisor, disparado por uma interrupção (temporizador, dispositivo) ou por uma chamada de sistema.', correta: true, explicacao: 'Correto. O hardware só empilha o PC e a PSW e desvia para o tratador; a partir daí o SO salva o contexto, atualiza o BDP e as filas e restaura o contexto do próximo processo.' },
        { texto: 'O próprio processo do usuário, ao terminar sua fatia de tempo.', correta: false, explicacao: 'O processo não tem como salvar o próprio contexto e escolher o próximo; nem sabe que perdeu a CPU. A interrupção do temporizador entrega o controle ao SO.' },
        { texto: 'Exclusivamente o hardware, sem participação do SO.', correta: false, explicacao: 'O hardware salva só o mínimo (PC e palavra de estado). Salvar todos os registradores, mover BDPs entre filas e restaurar o próximo processo é trabalho do SO.' },
        { texto: 'O usuário, pelo gerenciador de tarefas.', correta: false, explicacao: 'As trocas de contexto acontecem centenas de vezes por segundo, automaticamente. O usuário não participa.' },
      ],
    },
    {
      id: 'm03-a04-q5',
      enunciado: 'Por que a troca de contexto é considerada <strong>overhead</strong>?',
      alternativas: [
        { texto: 'Porque durante a troca a CPU executa só código do SO (salvar e restaurar registradores, recarregar a MMU, cache invalidada) e nenhum processo de usuário avança.', correta: true, explicacao: 'Correto. É o argumento do Tanenbaum: chavear processos é custoso e, se feito muitas vezes por segundo, consome uma parte grande do tempo de CPU.' },
        { texto: 'Porque a troca de contexto apaga os dados do processo, que precisa recomeçar.', correta: false, explicacao: 'O contexto é salvo no BDP justamente para o processo continuar do ponto onde parou, sem perder nada.' },
        { texto: 'Porque a troca de contexto é feita pelo usuário e demora segundos.', correta: false, explicacao: 'É feita pelo SO, automaticamente, e dura microssegundos. O problema é a soma de muitas trocas.' },
        { texto: 'Porque a troca de contexto só ocorre quando há erro no processo.', correta: false, explicacao: 'Ela ocorre o tempo todo: fim do quantum, pedido de E/S, interrupções, término. Erros são só um dos casos.' },
      ],
    },
    {
      id: 'm03-a04-q6',
      enunciado: 'Um sistema usa quantum de <strong>4 ms</strong> e cada troca de contexto leva <strong>1 ms</strong>. Considerando que sempre há processos aptos e que todos usam o quantum inteiro, qual fração do tempo da CPU é gasta com trocas de contexto?',
      alternativas: [
        { texto: '20%.', correta: true, explicacao: 'Cada ciclo tem 4 ms de processo + 1 ms de troca = 5 ms. Tempo perdido: 1/5 = 0,20 = 20%. Linha do tempo: [P1 0–4][troca 4–5][P2 5–9][troca 9–10]...' },
        { texto: '25%.', correta: false, explicacao: '25% seria 1/4, dividindo a troca pelo quantum. Mas o ciclo completo é quantum + troca = 5 ms, então a fração é 1/5 = 20%.' },
        { texto: '80%.', correta: false, explicacao: '80% (4/5) é a fração útil, o tempo em que processos de usuário executam. A pergunta é sobre o tempo perdido com trocas: 20%.' },
        { texto: '1%.', correta: false, explicacao: 'Isso valeria com um quantum de cerca de 100 ms (1/101). Com quantum de 4 ms, a troca pesa muito mais: 1/5 = 20%.' },
      ],
    },
    {
      id: 'm03-a04-q7',
      enunciado: 'Qual das situações abaixo <strong>não</strong> é motivo para retirar um processo do processador?',
      alternativas: [
        { texto: 'Um processo de prioridade mais baixa fica apto.', correta: true, explicacao: 'Correto, não é motivo. A preempção acontece quando um processo de prioridade mais alta fica apto; um de prioridade mais baixa simplesmente espera na fila.' },
        { texto: 'O processo executou pelo tempo máximo permitido (interrupção de tempo).', correta: false, explicacao: 'É motivo: a interrupção do temporizador impede que um processo monopolize a CPU.' },
        { texto: 'O processo acessa um endereço que não está carregado na memória (falta de página).', correta: false, explicacao: 'É motivo: a página precisa ser lida do disco, e o processo espera enquanto outro usa a CPU.' },
        { texto: 'O processo termina.', correta: false, explicacao: 'É motivo: o término libera a CPU para o próximo processo apto.' },
      ],
    },
    {
      id: 'm03-a04-q8',
      enunciado: 'Depois de estudar a gerência do processador, qual definição de processo é a mais completa?',
      alternativas: [
        { texto: 'Um programa em execução, representado no SO por um BDP com seu contexto e seu estado, que fica sempre em alguma fila e disputa a CPU, sendo alternado com outros por trocas de contexto.', correta: true, explicacao: 'Correto. Junta tudo: a abstração (programa em execução), a implementação (BDP), os estados e filas e o mecanismo que permite alternar processos (dispatcher e troca de contexto).' },
        { texto: 'Um arquivo executável armazenado no disco.', correta: false, explicacao: 'Isso é o programa. O processo é a execução, com estado e contexto que mudam com o tempo.' },
        { texto: 'Uma fila de BDPs gerenciada pelo escalonador.', correta: false, explicacao: 'Cada processo tem um BDP, e os BDPs formam filas, mas a fila não é o processo.' },
        { texto: 'Uma interrupção gerada pelo temporizador.', correta: false, explicacao: 'A interrupção do temporizador é um evento que pode causar troca de contexto; não é o processo.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm03-a04-d1',
      enunciado: 'Explique a troca de contexto: o que acontece em cada etapa e qual componente do SO a realiza.',
      respostaModelo: `<p><strong>Troca de contexto</strong> (chaveamento de contexto) é a operação de <strong>retirar a CPU de um processo e entregá-la a outro</strong>, salvando o contexto do processo que sai e restaurando o do processo que entra, de modo que cada um continue depois exatamente do ponto onde parou.</p>
<p><strong>Quem executa:</strong> o <strong>sistema operacional</strong>, por meio do <strong>dispatcher</strong>, em <strong>modo supervisor</strong>. Ela é disparada por uma interrupção (temporizador, dispositivo de E/S, falta de página, erro) ou por uma chamada de sistema; o hardware apenas salva o PC e a palavra de estado e desvia para o tratador. O processo não participa.</p>
<p><strong>Tarefas:</strong></p>
<ol>
  <li>salvar o contexto do processo atual (PC, SP, registradores) no seu BDP;</li>
  <li>atualizar o estado desse processo no BDP (Apto ou Bloqueado);</li>
  <li>inserir o BDP na fila apropriada;</li>
  <li>selecionar o próximo processo (decisão do escalonador);</li>
  <li>atualizar o BDP do selecionado (Executando);</li>
  <li>atualizar as estruturas de gerência de memória (MMU) e de E/S;</li>
  <li>restaurar o contexto do selecionado.</li>
</ol>
<p>É <strong>overhead</strong>: durante a troca nenhum processo de usuário avança, por isso trocas frequentes demais desperdiçam CPU.</p>`,
      pontosChave: [
        'Define como salvar o contexto do processo atual e restaurar o de outro',
        'Quem executa: o SO (dispatcher), em modo supervisor, disparado por interrupção ou chamada de sistema',
        'Salvar contexto no BDP, atualizar estado e inserir na fila',
        'Selecionar o próximo, atualizar memória/MMU e restaurar o contexto dele',
        'Menciona o custo (overhead) da troca',
      ],
    },
    {
      id: 'm03-a04-d2',
      enunciado: 'Para que serve o BDP (bloco descritor de processo)? Liste cinco informações que ele armazena.',
      respostaModelo: `<p>O <strong>BDP</strong> (bloco descritor de processo, ou PCB) é a <strong>estrutura de dados que representa o processo</strong> dentro do SO; o conjunto dos BDPs forma a tabela de processos. Sua <strong>função</strong> é guardar todas as informações de que o SO precisa para gerenciar o processo, em especial o contexto salvo quando ele sai da CPU, permitindo retomá-lo depois como se nunca tivesse parado. Os BDPs também são os elementos das filas (livres, aptos, bloqueados).</p>
<p><strong>Informações contidas:</strong></p>
<ul>
  <li><strong>identificação</strong>: PID, processo pai, usuário;</li>
  <li><strong>estado</strong> do processo (Apto, Executando, Bloqueado...);</li>
  <li><strong>contexto de execução</strong>: contador de programa, ponteiro de pilha, registradores;</li>
  <li><strong>prioridade</strong> e parâmetros de escalonamento;</li>
  <li><strong>localização e tamanho na memória</strong> (ponteiros para código, dados e pilha);</li>
  <li><strong>arquivos abertos</strong>;</li>
  <li><strong>contabilidade</strong>: tempo de CPU usado, momento de início;</li>
  <li><strong>ponteiro para o próximo BDP</strong> da fila.</li>
</ul>`,
      pontosChave: [
        'Função: estrutura de dados que representa o processo e permite interrompê-lo e retomá-lo',
        'Contexto de execução (PC, registradores, SP) e estado do processo',
        'PID e prioridade',
        'Informações de memória e arquivos abertos',
        'Contabilidade e ponteiro de encadeamento nas filas',
      ],
    },
  ],
});
