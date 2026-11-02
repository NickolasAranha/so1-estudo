// Módulo 4, aula 2: threads de usuário x de núcleo, modelos N:1, 1:1 e M:N, Pthreads e implementações híbridas.
SO1.registerLesson({
  id: 'm04-a02',
  titulo: 'Modelos de threads (N:1, 1:1, M:N)',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.2.3 Threads POSIX (p.62–64), §2.2.4 Threads no espaço do usuário (p.63–66), §2.2.5 Threads no núcleo (p.66), §2.2.6 Implementações híbridas (p.66–67), §2.2.7 Ativações do escalonador (p.67)',
    'Slides cap4 (Oliveira/Carissimi/Toscani, UFRGS): implementação de threads, modelos N:1, 1:1 e M:N com vantagens e desvantagens',
    'Silberschatz, Fundamentos de SO: modelos muitos-para-um, um-para-um e muitos-para-muitos',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: os crachás de uma empresa terceirizada.</strong> Uma empresa terceirizada coloca vários funcionários dentro de um prédio. A portaria do prédio (o SO) só libera a passagem de quem tem crachá.</p>
  <ul>
    <li><strong>Um crachá para a equipe toda</strong>: a portaria nem sabe quantos funcionários existem; o chefe da equipe é quem organiza o revezamento. É barato, mas se o portador do crachá fica preso esperando na portaria, <em>a equipe inteira</em> fica parada. É o modelo <strong>N:1</strong>.</li>
    <li><strong>Um crachá por funcionário</strong>: a portaria conhece cada um, e se um fica esperando os outros passam normalmente. Mas cadastrar cada crachá dá trabalho para a portaria. É o modelo <strong>1:1</strong>.</li>
    <li><strong>Alguns crachás para a equipe</strong>: a empresa recebe, digamos, 3 crachás para 10 funcionários, e o chefe reveza os crachás entre eles. É o modelo <strong>M:N</strong>.</li>
  </ul>
</div>

<h2>Onde as threads são implementadas</h2>
<p>Uma thread é representada por um <strong>descritor de thread</strong> (TCB, <em>Thread Control Block</em>), estrutura parecida com o BDP, porém menos complexa (leve): guarda PC, registradores, ponteiro de pilha e estado. A pergunta que define os modelos é: <strong>quem conhece e gerencia esses descritores?</strong> Há dois lugares possíveis:</p>
<ul>
  <li><strong>Espaço do usuário</strong>: as threads são gerenciadas por uma <strong>biblioteca</strong> dentro do processo. São as <strong>threads de usuário</strong> (<em>user level threads</em>, ou <em>process scope</em>).</li>
  <li><strong>Espaço do núcleo</strong>: o próprio SO gerencia as threads. São as <strong>threads de núcleo</strong> (<em>kernel level threads</em>, ou <em>system scope</em>).</li>
</ul>
<p>A notação <strong>X:Y</strong> diz quantas threads de usuário (X) são mapeadas sobre quantas entidades que o núcleo escalona (Y). O Silberschatz chama os modelos de muitos-para-um, um-para-um e muitos-para-muitos.</p>

<figure class="diagrama">
  <svg viewBox="0 0 500 265" style="max-width:640px" role="img" aria-label="Os três modelos de threads: N:1 com uma biblioteca e uma entidade no núcleo; 1:1 com uma thread de núcleo por thread de usuário; M:N com biblioteca multiplexando quatro threads de usuário sobre duas threads de núcleo">
    <g font-size="14" fill="currentColor">
      <text x="4" y="80" font-weight="bold">Usuário</text>
      <text x="4" y="182" font-weight="bold">Núcleo</text>
    </g>
    <line x1="56" y1="140" x2="496" y2="140" stroke="currentColor" stroke-dasharray="6 4"/>
    <g fill="none" style="stroke:var(--azul)" stroke-width="1.5">
      <rect x="67" y="18" width="130" height="100" rx="8"/>
      <rect x="212" y="18" width="130" height="100" rx="8"/>
      <rect x="357" y="18" width="130" height="100" rx="8"/>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="2">
      <path d="M92 30 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M132 30 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M172 30 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/>
      <path d="M237 30 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M277 30 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M317 30 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/>
      <path d="M377 30 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M407 30 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M437 30 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M467 30 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/>
    </g>
    <g stroke="currentColor" stroke-width="1.5">
      <line x1="92" y1="62" x2="92" y2="80"/><line x1="132" y1="62" x2="132" y2="80"/><line x1="172" y1="62" x2="172" y2="80"/>
      <line x1="132" y1="102" x2="132" y2="165"/>
      <line x1="237" y1="62" x2="237" y2="165"/><line x1="277" y1="62" x2="277" y2="165"/><line x1="317" y1="62" x2="317" y2="165"/>
      <line x1="377" y1="62" x2="377" y2="80"/><line x1="407" y1="62" x2="407" y2="80"/><line x1="437" y1="62" x2="437" y2="80"/><line x1="467" y1="62" x2="467" y2="80"/>
      <line x1="397" y1="102" x2="397" y2="165"/><line x1="447" y1="102" x2="447" y2="165"/>
    </g>
    <g style="fill:var(--azul-claro);stroke:var(--azul)">
      <rect x="77" y="80" width="110" height="22" rx="4"/>
      <rect x="367" y="80" width="110" height="22" rx="4"/>
    </g>
    <g font-size="14" text-anchor="middle" fill="currentColor">
      <text x="132" y="96">biblioteca</text>
      <text x="422" y="96">biblioteca</text>
    </g>
    <g style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="2">
      <rect x="120" y="165" width="24" height="24" rx="4"/>
      <rect x="225" y="165" width="24" height="24" rx="4"/><rect x="265" y="165" width="24" height="24" rx="4"/><rect x="305" y="165" width="24" height="24" rx="4"/>
      <rect x="385" y="165" width="24" height="24" rx="4"/><rect x="435" y="165" width="24" height="24" rx="4"/>
    </g>
    <text x="277" y="212" font-size="14" text-anchor="middle" fill="currentColor">O SO escalona os quadrados nas CPUs</text>
    <g text-anchor="middle" fill="currentColor">
      <text x="132" y="238" font-size="18" font-weight="bold">N:1</text>
      <text x="277" y="238" font-size="18" font-weight="bold">1:1</text>
      <text x="422" y="238" font-size="18" font-weight="bold">M:N</text>
      <g font-size="14" style="fill:var(--suave)">
        <text x="132" y="254">threads de usuário</text>
        <text x="277" y="254">threads de núcleo</text>
        <text x="422" y="254">híbrido</text>
      </g>
    </g>
  </svg>
  <figcaption>Os três modelos. Linhas onduladas: threads do programa. Quadrados: o que o núcleo enxerga e escalona (a "CPU virtual"). No <strong>N:1</strong> o núcleo vê só o processo; no <strong>1:1</strong> vê cada thread; no <strong>M:N</strong> a biblioteca reparte várias threads de usuário sobre algumas threads de núcleo.</figcaption>
</figure>

<h2>Modelo N:1 — threads de usuário</h2>
<p>Todo o gerenciamento é feito <strong>na aplicação</strong>, por uma <strong>biblioteca</strong> ligada ao programa, que oferece uma API (criar, sincronizar, terminar threads). O <strong>SO não "enxerga" as threads</strong>: para ele existe um processo comum, monothread. Cada processo mantém a sua <strong>tabela de threads</strong>, gerenciada pelo <strong>sistema de tempo de execução</strong> (<em>runtime</em>). A troca de contexto entre threads é feita <strong>em modo usuário</strong>, pelo escalonador embutido na biblioteca, sem privilégios especiais. São dois níveis de divisão: o SO divide a CPU entre os processos "pesados", e a biblioteca divide o tempo do processo entre as suas threads.</p>
<table>
  <tr><th>Vantagens</th><th>Desvantagens</th></tr>
  <tr><td>
    <ul>
      <li><strong>Leve</strong>: trocar de thread não exige chamada ao núcleo, troca de modo nem troca de contexto do SO. É pelo menos uma ordem de grandeza mais rápido que um desvio para o núcleo.</li>
      <li>Funciona em <strong>SO que não suporta threads</strong> (era o caso de todos os SOs antigos).</li>
      <li>Cada processo pode ter seu <strong>próprio algoritmo de escalonamento</strong>.</li>
      <li>Escala bem: as threads não ocupam tabelas nem pilhas dentro do núcleo.</li>
    </ul>
  </td><td>
    <ul>
      <li>Uma <strong>chamada de sistema bloqueante</strong> (ex.: E/S) feita por uma thread <strong>bloqueia o processo inteiro</strong>, com todas as threads. O mesmo vale para uma <strong>falta de página</strong>: o núcleo não sabe que existem outras threads.</li>
      <li><strong>Não explora multiprocessadores</strong>: o núcleo escalona só o processo, então as threads dele nunca rodam em duas CPUs ao mesmo tempo.</li>
      <li>Dentro do processo não há interrupção de relógio para as threads: se uma thread nunca libera a CPU voluntariamente (<code>thread_yield</code>), as outras do mesmo processo não executam.</li>
    </ul>
  </td></tr>
</table>
<p>Para contornar o bloqueio, alguns sistemas usam a chamada <code>select</code>: a biblioteca troca o <code>read</code> por um código que primeiro verifica se a leitura vai bloquear e, se for, executa outra thread. Esse código envoltório é chamado de <strong>jaqueta</strong> (<em>jacket</em> ou <em>wrapper</em>). Funciona, mas é deselegante e ineficiente.</p>

<h2>Modelo 1:1 — threads de núcleo</h2>
<p>Criado para resolver as desvantagens do N:1. O <strong>SO enxerga as threads</strong>: mantém informações sobre processos <em>e</em> sobre threads, numa <strong>tabela de threads no núcleo</strong>. Não há biblioteca de escalonamento no processo. Criar ou destruir uma thread é uma <strong>chamada de sistema</strong>, e a troca de contexto entre threads exige a intervenção do SO.</p>
<table>
  <tr><th>Vantagens</th><th>Desvantagens</th></tr>
  <tr><td>
    <ul>
      <li>Explora o <strong>paralelismo de multiprocessadores (SMP)</strong>: threads do mesmo processo rodam em CPUs diferentes ao mesmo tempo.</li>
      <li>Quando uma thread bloqueia (E/S, falta de página), o núcleo escolhe <strong>outra thread</strong> pronta, do mesmo processo ou de outro: <strong>só ela fica bloqueada</strong>.</li>
      <li>Facilita sobrepor operações de E/S com cálculo.</li>
      <li>Não precisa de chamadas de sistema não bloqueantes nem de jaquetas.</li>
    </ul>
  </td><td>
    <ul>
      <li>Implementação <strong>"mais pesada"</strong> que a N:1: criar, terminar e sincronizar threads custa uma chamada de sistema, bem mais cara que chamar uma rotina da biblioteca.</li>
      <li>Cada thread ocupa espaço de tabela e de pilha no núcleo, o que pesa quando há muitas threads.</li>
    </ul>
  </td></tr>
</table>
<p>Por causa do custo de criação, alguns sistemas <strong>reciclam</strong> threads: quando uma thread termina, ela é marcada como não executável, mas suas estruturas no núcleo são mantidas para reaproveitamento na próxima criação. Windows e Linux atuais usam o modelo 1:1.</p>

<h2>Modelo M:N — implementação híbrida</h2>
<p>Combina os dois anteriores: a biblioteca multiplexa <strong>M threads de usuário</strong> sobre <strong>N threads de núcleo</strong> (com N ≤ M). O programador decide quantas threads de núcleo usar e quantas threads de usuário colocar sobre cada uma. Há <strong>dois níveis de escalonamento</strong>:</p>
<ul>
  <li><strong>Nível usuário</strong>: a biblioteca escalona as threads de usuário sobre as unidades de escalonamento (threads de núcleo).</li>
  <li><strong>Nível sistema</strong>: o SO escalona as threads de núcleo sobre os processadores.</li>
</ul>
<p><strong>Vantagens:</strong> é o modelo de <strong>máxima flexibilidade</strong>; tem paralelismo real (há várias threads de núcleo) e boa parte das operações de thread continua barata (feita na biblioteca); uma thread bloqueada não para todas as outras. <strong>Desvantagens:</strong> é o mais <strong>complexo</strong> de implementar, e a dificuldade é <strong>parametrizar M e N</strong> (quantas threads de núcleo dar a cada processo).</p>
<p>Uma variação estudada pelo Tanenbaum são as <strong>ativações do escalonador</strong>: o núcleo dá a cada processo um número de processadores virtuais e, quando uma thread bloqueia, avisa o sistema de tempo de execução do processo por uma <strong>upcall</strong>, para que ele escalone outra thread de usuário.</p>

<h2>Comparação dos três modelos</h2>
<table>
  <tr><th>Critério</th><th>N:1 (usuário)</th><th>1:1 (núcleo)</th><th>M:N (híbrido)</th></tr>
  <tr><td>O SO enxerga as threads?</td><td>Não</td><td>Sim</td><td>Enxerga as N threads de núcleo</td></tr>
  <tr><td>Quem escalona as threads</td><td>Biblioteca (modo usuário)</td><td>SO</td><td>Biblioteca + SO (2 níveis)</td></tr>
  <tr><td>Chamada bloqueante</td><td>Bloqueia o processo todo</td><td>Bloqueia só a thread</td><td>Não bloqueia todas</td></tr>
  <tr><td>Paralelismo em multiprocessador</td><td>Não</td><td>Sim</td><td>Sim</td></tr>
  <tr><td>Custo de criar e trocar threads</td><td>Baixo</td><td>Mais alto (chamada de sistema)</td><td>Intermediário</td></tr>
  <tr><td>Ponto fraco</td><td>Bloqueio e falta de paralelismo</td><td>Peso das operações</td><td>Complexidade; ajustar M e N</td></tr>
</table>

<h2>Pthreads (threads POSIX)</h2>
<p>Para permitir programas com threads <strong>portáveis</strong>, o IEEE definiu o padrão <strong>IEEE 1003.1c</strong>, cujo pacote de threads se chama <strong>Pthreads</strong>. A maioria dos sistemas UNIX o suporta. O padrão define mais de 60 chamadas; as principais são:</p>
<table>
  <tr><th>Chamada</th><th>Descrição</th></tr>
  <tr><td><code>pthread_create</code></td><td>Cria uma nova thread; devolve o identificador dela (papel parecido com o PID devolvido pelo <code>fork</code>).</td></tr>
  <tr><td><code>pthread_exit</code></td><td>Termina a thread que chamou e libera sua pilha.</td></tr>
  <tr><td><code>pthread_join</code></td><td>Espera uma thread específica terminar.</td></tr>
  <tr><td><code>pthread_yield</code></td><td>Libera a CPU voluntariamente para outra thread executar.</td></tr>
  <tr><td><code>pthread_attr_init</code></td><td>Cria e inicializa a estrutura de atributos de uma thread (ex.: prioridade, tamanho da pilha).</td></tr>
  <tr><td><code>pthread_attr_destroy</code></td><td>Remove a estrutura de atributos (as threads que a usaram continuam existindo).</td></tr>
</table>
<p>Pthreads é uma <strong>especificação de API</strong>, não um modelo: a mesma interface pode ser implementada por uma biblioteca no espaço do usuário (N:1) ou sobre threads de núcleo (1:1 ou M:N). Trecho simplificado do exemplo do Tanenbaum:</p>
<pre class="codigo"><code>void *diz_ola(void *id) {
    printf("Ola da thread %ld\\n", (long) id);
    pthread_exit(NULL);              /* termina esta thread */
}

int main(void) {
    pthread_t threads[10];
    for (long i = 0; i &lt; 10; i++)
        pthread_create(&amp;threads[i], NULL, diz_ola, (void *) i);
    for (int i = 0; i &lt; 10; i++)
        pthread_join(threads[i], NULL);  /* espera cada uma terminar */
    return 0;
}</code></pre>
<p>A ordem em que as mensagens aparecem é <strong>indeterminada</strong> e pode mudar de uma execução para outra: depende do escalonamento.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: o mesmo programa em N:1 e em 1:1.</strong> Um processo tem três threads: T1 lê o teclado, T2 e T3 fazem cálculos. A máquina tem <strong>2 CPUs</strong>.</p>
  <table>
    <tr><th>Momento</th><th>O que acontece</th><th>Em N:1</th><th>Em 1:1</th></tr>
    <tr><td>1</td><td>O processo começa a rodar. As três threads estão Aptas.</td><td>O núcleo vê um processo só e o coloca em <strong>uma</strong> CPU. A biblioteca escolhe T2; T1 e T3 esperam. A outra CPU fica sem uso para este processo.</td><td>O núcleo vê 3 threads Aptas e coloca T2 e T3 nas <strong>duas</strong> CPUs ao mesmo tempo (paralelismo real). T1 espera na fila de Aptos.</td></tr>
    <tr><td>2</td><td>Chega a vez de T1, que faz <code>read</code> do teclado (chamada bloqueante).</td><td>A biblioteca troca T2 por T1 (em modo usuário). T1 faz o <code>read</code> e o núcleo bloqueia o <strong>processo inteiro</strong>: T2 e T3 param, mesmo tendo trabalho.</td><td>O núcleo tira T3 da CPU e coloca T1 no lugar; T2 continua na outra CPU. T1 faz o <code>read</code>: <strong>só T1</strong> fica Bloqueada, e T3 volta à CPU.</td></tr>
    <tr><td>3</td><td>O usuário tecla, 5 segundos depois.</td><td>O processo volta a Apto e, quando ganha a CPU, a biblioteca retoma T2. Nesses 5 s nenhuma thread calculou: tempo perdido.</td><td>T1 passa a Apta. Durante os 5 s, T2 e T3 calcularam nas duas CPUs: nada foi perdido.</td></tr>
    <tr><td>4</td><td>T1 precisa da CPU para tratar a tecla: a vez passa de T2 para T1 (troca de thread).</td><td>A biblioteca salva os registradores de T2 e carrega os de T1, sem entrar no núcleo: troca <strong>muito rápida</strong>.</td><td>O núcleo tira T2 da CPU e coloca T1 (T3 segue na outra CPU). A troca passa pelo núcleo: <strong>mais cara</strong>.</td></tr>
  </table>
  <p>Em <strong>M:N</strong> com 2 threads de núcleo, o momento 1 seria igual ao 1:1 (duas threads em paralelo) e, no momento 2 só a thread de núcleo em que T1 rodava ficaria bloqueada: a biblioteca continuaria rodando T2 ou T3 sobre a outra thread de núcleo.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>No N:1, o problema é que a chamada bloqueante <strong>bloqueia o processo inteiro</strong>, não "só a thread". Não troque com o 1:1.</li>
    <li>Threads de usuário são <strong>mais rápidas</strong> para criar e trocar; threads de núcleo são <strong>mais pesadas</strong>, mas permitem paralelismo real e bloqueio isolado. Uma prova pode pedir a vantagem de um e a desvantagem do outro na mesma questão.</li>
    <li>Num processo N:1 com 4 threads numa máquina com 4 CPUs, executa <strong>uma thread por vez</strong>: o núcleo só conhece o processo.</li>
    <li>"Threads de usuário" não significa que o usuário as gerencia à mão: quem gerencia é uma <strong>biblioteca</strong> que roda em modo usuário.</li>
    <li><strong>Pthreads</strong> é um padrão de interface (IEEE 1003.1c), não um dos três modelos.</li>
    <li>A dificuldade típica do M:N cobrada em prova: <strong>parametrizar M e N</strong> e a complexidade de ter dois escalonadores.</li>
  </ul>
</div>
`,
  resumo: 'Threads podem ser implementadas no espaço do usuário (biblioteca, modelo N:1: leve e portável, mas uma chamada bloqueante bloqueia o processo inteiro e não há paralelismo em multiprocessador) ou no núcleo (modelo 1:1: o SO enxerga cada thread, há paralelismo real e bloqueio isolado, mas as operações são mais pesadas). O modelo M:N (híbrido) multiplexa M threads de usuário sobre N threads de núcleo, com dois níveis de escalonamento e máxima flexibilidade, ao custo de complexidade e da dificuldade de ajustar M e N. Pthreads (IEEE 1003.1c) é a API padrão de threads.',
  questoes: [
    {
      id: 'm04-a02-q1',
      enunciado: 'Em qual modelo de implementação de threads uma chamada de sistema bloqueante (por exemplo, uma leitura de disco) feita por uma thread bloqueia <strong>todas</strong> as threads do processo?',
      alternativas: [
        { texto: 'N:1 (threads de usuário).', correta: true, explicacao: 'Correto. O núcleo não enxerga as threads, só o processo. Quando uma thread faz a chamada bloqueante, o núcleo bloqueia o processo, e com ele todas as threads.' },
        { texto: '1:1 (threads de núcleo).', correta: false, explicacao: 'No 1:1 o núcleo conhece cada thread; ele bloqueia apenas a que fez a chamada e pode escalonar outra thread do mesmo processo.' },
        { texto: 'M:N (híbrido).', correta: false, explicacao: 'No M:N há várias threads de núcleo. Se uma bloqueia, as outras continuam executando as demais threads de usuário.' },
        { texto: 'Em todos os modelos, pois threads compartilham o processo.', correta: false, explicacao: 'Compartilhar o espaço de endereçamento não significa bloquear juntas. O bloqueio coletivo só acontece quando o núcleo não sabe que as threads existem (N:1).' },
      ],
    },
    {
      id: 'm04-a02-q2',
      enunciado: 'Qual é a principal <strong>desvantagem</strong> do modelo 1:1 em relação ao N:1?',
      alternativas: [
        { texto: 'É mais pesado: criar, terminar e trocar threads exige chamadas de sistema e intervenção do núcleo.', correta: true, explicacao: 'Correto. Cada operação de thread vira uma chamada ao núcleo, bem mais cara que chamar uma rotina da biblioteca em modo usuário. Além disso, cada thread ocupa tabela e pilha no núcleo.' },
        { texto: 'Não aproveita máquinas com várias CPUs.', correta: false, explicacao: 'É o contrário: aproveitar o paralelismo de multiprocessadores é uma vantagem do 1:1. Quem não aproveita é o N:1.' },
        { texto: 'Uma thread bloqueada bloqueia o processo inteiro.', correta: false, explicacao: 'Esse é o problema do N:1. No 1:1 o núcleo bloqueia só a thread que fez a chamada.' },
        { texto: 'Só funciona em SOs que não suportam threads.', correta: false, explicacao: 'O 1:1 exige um SO que suporte threads, pois é o núcleo quem as gerencia. Rodar em SO sem suporte a threads é vantagem do N:1.' },
      ],
    },
    {
      id: 'm04-a02-q3',
      enunciado: 'Sobre o modelo M:N, é correto afirmar:',
      alternativas: [
        { texto: 'Combina os modelos N:1 e 1:1, com dois níveis de escalonamento; a dificuldade é parametrizar M e N.', correta: true, explicacao: 'Correto. A biblioteca escalona as threads de usuário sobre as threads de núcleo, e o SO escalona as threads de núcleo sobre as CPUs. Escolher quantas threads de núcleo usar é a dificuldade apontada nos slides.' },
        { texto: 'Cada thread de usuário tem exatamente uma thread de núcleo correspondente.', correta: false, explicacao: 'Isso é o modelo 1:1. No M:N, várias threads de usuário são multiplexadas sobre um número geralmente menor de threads de núcleo.' },
        { texto: 'O SO não enxerga nenhuma thread, apenas o processo.', correta: false, explicacao: 'Isso descreve o N:1. No M:N o SO enxerga e escalona as N threads de núcleo.' },
        { texto: 'Tem um único nível de escalonamento, feito pela biblioteca.', correta: false, explicacao: 'São dois níveis: a biblioteca (threads de usuário sobre threads de núcleo) e o SO (threads de núcleo sobre processadores).' },
      ],
    },
    {
      id: 'm04-a02-q4',
      enunciado: 'Por que trocar de uma thread para outra é muito mais rápido no modelo de threads de usuário (N:1)?',
      alternativas: [
        { texto: 'Porque a troca é feita pela biblioteca, em modo usuário, sem chamada ao núcleo nem troca de modo.', correta: true, explicacao: 'Correto. Salvar os registradores de uma thread e carregar os de outra são rotinas locais da biblioteca. Não há desvio para o núcleo, por isso é pelo menos uma ordem de grandeza mais rápido.' },
        { texto: 'Porque cada thread de usuário roda numa CPU diferente.', correta: false, explicacao: 'No N:1 as threads de um processo nunca rodam em CPUs diferentes ao mesmo tempo; o núcleo só escalona o processo.' },
        { texto: 'Porque threads de usuário não têm registradores nem pilha.', correta: false, explicacao: 'Toda thread tem PC, registradores e pilha próprios. A biblioteca salva esses dados na tabela de threads do processo a cada troca.' },
        { texto: 'Porque o núcleo dá prioridade máxima às threads de usuário.', correta: false, explicacao: 'O núcleo nem sabe que as threads de usuário existem; não tem como dar prioridade a elas.' },
      ],
    },
    {
      id: 'm04-a02-q5',
      enunciado: 'Num processo com threads de usuário (N:1), uma thread entra num laço longo de cálculo e nunca chama <code>thread_yield</code>. O que acontece com as outras threads desse processo?',
      alternativas: [
        { texto: 'Elas não executam, pois dentro do processo não há interrupção de relógio que tire a CPU da thread.', correta: true, explicacao: 'Correto. O relógio interrompe o processo, e o SO pode trocar de processo, mas quando o processo volta, a biblioteca não retoma o controle: a mesma thread continua. Sem cooperação, as outras threads não têm vez.' },
        { texto: 'O núcleo percebe e escalona outra thread do processo.', correta: false, explicacao: 'No N:1 o núcleo não enxerga as threads; ele não tem como escolher outra thread do mesmo processo.' },
        { texto: 'Todas as threads do processo passam a executar em paralelo em outras CPUs.', correta: false, explicacao: 'O N:1 não explora multiprocessadores: o processo inteiro roda em uma CPU por vez.' },
        { texto: 'O processo é encerrado pelo SO por violar a política de escalonamento.', correta: false, explicacao: 'Um laço de cálculo não viola nada. O SO apenas divide a CPU entre processos; ele não encerra um processo por não ceder a vez entre suas threads.' },
      ],
    },
    {
      id: 'm04-a02-q6',
      enunciado: 'Um processo tem 4 threads implementadas no modelo <strong>N:1</strong> e roda numa máquina com <strong>4 CPUs</strong> livres. Quantas dessas threads podem estar executando ao mesmo tempo?',
      alternativas: [
        { texto: '1.', correta: true, explicacao: 'Correto. O núcleo só conhece o processo (1 entidade escalonável), então o coloca em uma CPU. A biblioteca reveza as 4 threads nessa CPU. As outras 3 CPUs não servem a esse processo.' },
        { texto: '4.', correta: false, explicacao: 'Seria 4 no modelo 1:1 (ou M:N com pelo menos 4 threads de núcleo). No N:1, o núcleo não sabe que há 4 threads e não consegue espalhá-las.' },
        { texto: '2.', correta: false, explicacao: 'Não há nada no N:1 que permita duas threads em CPUs diferentes. Só existe 1 entidade no núcleo.' },
        { texto: 'Depende do algoritmo de escalonamento da biblioteca.', correta: false, explicacao: 'A biblioteca decide qual thread roda, mas não pode colocar threads em outras CPUs: quem distribui entidades pelas CPUs é o núcleo, e ele só vê uma.' },
      ],
    },
    {
      id: 'm04-a02-q7',
      enunciado: 'Sobre Pthreads, assinale a alternativa correta.',
      alternativas: [
        { texto: 'É o padrão IEEE 1003.1c de API de threads; <code>pthread_join</code> faz a thread esperar outra thread específica terminar.', correta: true, explicacao: 'Correto. Pthreads é a interface POSIX padronizada para programas portáveis. pthread_create cria, pthread_exit termina, pthread_join espera e pthread_yield cede a CPU.' },
        { texto: 'É um quarto modelo de threads, diferente de N:1, 1:1 e M:N.', correta: false, explicacao: 'Pthreads é uma especificação de interface. A mesma API pode ser implementada no espaço do usuário ou sobre threads de núcleo.' },
        { texto: '<code>pthread_yield</code> cria uma nova thread.', correta: false, explicacao: 'Quem cria é pthread_create. pthread_yield faz a thread liberar a CPU voluntariamente para que outra execute.' },
        { texto: '<code>pthread_exit</code> encerra o processo inteiro com todas as threads.', correta: false, explicacao: 'pthread_exit termina apenas a thread que a chamou e libera a pilha dela. As outras threads continuam.' },
      ],
    },
    {
      id: 'm04-a02-q8',
      enunciado: 'Uma thread de um processo com threads de usuário (N:1) provoca uma <strong>falta de página</strong> (precisa de um trecho do programa que não está na memória). O que acontece?',
      alternativas: [
        { texto: 'O núcleo bloqueia o processo inteiro até a página ser lida do disco, mesmo que outras threads pudessem executar.', correta: true, explicacao: 'Correto. O Tanenbaum aponta esse problema: o núcleo nem sabe que há threads, então bloqueia o processo todo enquanto busca a página. No 1:1, o núcleo poderia rodar outra thread do processo.' },
        { texto: 'Só a thread que causou a falta fica bloqueada; a biblioteca escolhe outra.', correta: false, explicacao: 'A biblioteca nem fica sabendo da falta de página: quem a trata é o núcleo, que bloqueia o processo inteiro. A biblioteca não recebe o controle para escolher outra thread.' },
        { texto: 'O processo é encerrado, pois threads de usuário não podem causar falta de página.', correta: false, explicacao: 'Qualquer código pode causar falta de página; é um evento normal da memória virtual. O problema é só que, no N:1, ela para o processo todo.' },
        { texto: 'A thread passa a ser uma thread de núcleo automaticamente.', correta: false, explicacao: 'O modelo de implementação não muda em tempo de execução. A thread continua sendo de usuário, e o processo fica bloqueado.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm04-a02-d1',
      enunciado: 'Quais as vantagens de usar threads? Descreva os modelos de implementação de threads e os prós e contras de cada um.',
      respostaModelo: `<p><strong>Por que usar threads:</strong> criar, destruir e trocar threads é mais barato que fazer o mesmo com processos; as threads compartilham o espaço de endereçamento e se comunicam por memória compartilhada sem passar pelo núcleo; permitem sobrepor cálculo e E/S, melhorando o tempo de resposta e o throughput; e permitem explorar o paralelismo real de multiprocessadores (nos modelos 1:1 e M:N).</p>
<p><strong>N:1 (threads de usuário):</strong> uma biblioteca no espaço do usuário gerencia as threads, e o SO não as enxerga. Vantagens: leve (troca de thread sem chamada ao núcleo), funciona em SO sem suporte a threads, escalonamento personalizado por processo. Desvantagens: uma chamada de sistema bloqueante (ou falta de página) bloqueia o processo inteiro; não explora multiprocessadores; sem interrupção de relógio entre as threads.</p>
<p><strong>1:1 (threads de núcleo):</strong> o SO enxerga e escalona cada thread. Vantagens: paralelismo real em multiprocessadores (SMP); uma thread bloqueada não bloqueia as outras; facilita sobrepor E/S e cálculo. Desvantagem: implementação mais pesada, pois criar, terminar e trocar threads exige chamadas de sistema.</p>
<p><strong>M:N (híbrido):</strong> M threads de usuário multiplexadas sobre N threads de núcleo, com dois níveis de escalonamento (biblioteca e SO). Vantagens: combina a leveza do N:1 com o paralelismo e o bloqueio isolado do 1:1; máxima flexibilidade. Desvantagens: complexidade e dificuldade de parametrizar M e N.</p>`,
      pontosChave: [
        'Justificou o uso de threads (custo menor que processos, compartilhamento de memória, sobreposição de E/S e cálculo, multiprocessador)',
        'N:1: biblioteca no espaço do usuário; leve, mas chamada bloqueante bloqueia o processo inteiro e não há paralelismo real',
        '1:1: SO gerencia cada thread; paralelismo real e bloqueio isolado, mas mais pesado (chamadas de sistema)',
        'M:N: combina os dois com dois níveis de escalonamento; flexível, mas complexo e difícil de parametrizar M e N',
      ],
    },
  ],
});
