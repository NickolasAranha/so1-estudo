// Módulo 5, aula 6: semáforos (P/V, down/up), produtor-consumidor com semáforos, mutex e semáforo x mutex.
SO1.registerLesson({
  id: 'm05-a06',
  titulo: 'Semáforos e mutex',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.3.5 Semáforos e §2.3.6 Mutexes, incluindo mutexes em Pthreads (p.77–81) e a inversão dos downs (p.82)',
    'Slides cap3 (Oliveira/Carissimi/Toscani, UFRGS): semáforos (Dijkstra, P/V), implementação com fila, semáforos binários e contadores, mutex (lock/unlock), semáforos versus mutex',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: o estacionamento com placar.</strong> Na entrada há um placar com o número de vagas livres (digamos, 3). Cada carro que entra <strong>decrementa</strong> o placar; se o placar está em 0, o carro <strong>espera na fila</strong> da cancela (sem ficar dando voltas no quarteirão). Cada carro que sai <strong>incrementa</strong> o placar ou, se há fila, libera o primeiro da fila. Isso é um <strong>semáforo contador</strong>.</p>
  <p>Agora pense no banheiro com <strong>uma chave só</strong>: quem pega a chave entra, e <strong>a mesma pessoa</strong> que pegou devolve. Isso é um <strong>mutex</strong>.</p>
</div>

<h2>Semáforos (Dijkstra, 1965)</h2>
<p>Dijkstra propôs uma variável inteira que <strong>conta os sinais de acordar</strong> guardados para uso futuro: o <strong>semáforo</strong>. É um tipo abstrato de dados com <strong>um valor inteiro</strong> e <strong>uma fila de processos</strong>, manipulado só por duas operações:</p>
<table>
  <tr><th>Operação</th><th>Nomes</th><th>O que faz (Tanenbaum)</th></tr>
  <tr><td><strong>down</strong></td><td><strong>P</strong> (<em>Proberen</em>, testar)</td><td>Se o valor é maior que 0, <strong>decrementa</strong> e continua. Se é 0, o processo é posto para <strong>dormir</strong> (Bloqueado), sem terminar o down.</td></tr>
  <tr><td><strong>up</strong></td><td><strong>V</strong> (<em>Verhogen</em>, incrementar)</td><td><strong>Incrementa</strong> o valor. Se havia processos dormindo no semáforo, <strong>um deles é acordado</strong> e completa seu down (o valor, então, continua 0). up nunca bloqueia ninguém.</td></tr>
</table>
<p>down e up generalizam sleep e wakeup, com uma diferença crucial: cada operação é uma <strong>ação atômica</strong>: verificar o valor, alterá-lo e eventualmente dormir acontecem como uma só ação indivisível. Assim o sinal não se perde. Para garantir a atomicidade, o SO implementa down e up como chamadas de sistema e <strong>desabilita as interrupções</strong> durante as poucas instruções (com uma CPU) ou usa uma variável de trava com <strong>TSL/XCHG</strong> (com várias CPUs). Essa espera ocupada dura só alguns microssegundos, ao contrário da espera pela seção crítica inteira.</p>

<h3>Implementação com fila (slides)</h3>
<p>Os slides mostram uma versão em que o valor pode ficar <strong>negativo</strong>; o valor negativo indica <strong>quantos processos estão na fila</strong>:</p>
<pre class="codigo"><code>P(s):  s.valor = s.valor - 1;
       se (s.valor &lt; 0) {
           insere o processo em s.fila;
           bloqueia o processo (sleep);
       }

V(s):  s.valor = s.valor + 1;
       se (s.valor &lt;= 0) {
           retira um processo de s.fila;
           acorda o processo (wakeup);
       }</code></pre>
<p>As duas versões se comportam igual: na do Tanenbaum o valor para em 0 e a fila guarda quem espera; na dos slides o valor desce abaixo de 0 e o módulo dele é o tamanho da fila.</p>

<figure class="diagrama">
  <svg viewBox="0 0 540 200" style="max-width:640px" role="img" aria-label="Semáforo formado por um valor inteiro e uma fila de processos bloqueados; down decrementa ou bloqueia, up incrementa ou acorda">
    <defs>
      <marker id="m05a06-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
      </marker>
    </defs>
    <rect x="170" y="30" width="200" height="140" rx="10" fill="none" stroke="currentColor" stroke-width="2"/>
    <text x="270" y="22" font-size="13" text-anchor="middle" fill="currentColor" font-weight="bold">semáforo s</text>
    <rect x="190" y="45" width="160" height="40" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
    <text x="270" y="71" font-size="14" text-anchor="middle" fill="currentColor">valor = 0</text>
    <text x="270" y="108" font-size="12" text-anchor="middle" fill="currentColor">fila de bloqueados</text>
    <g stroke="currentColor" stroke-width="1">
      <rect x="195" y="118" width="45" height="32" rx="4" style="fill:var(--ambar-claro)"/>
      <rect x="247" y="118" width="45" height="32" rx="4" style="fill:var(--ambar-claro)"/>
      <rect x="299" y="118" width="45" height="32" rx="4" style="fill:var(--cartao)" stroke-dasharray="3 3"/>
    </g>
    <g font-size="13" text-anchor="middle" fill="currentColor"><text x="217" y="139">P3</text><text x="269" y="139">P4</text></g>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <line x1="20" y1="65" x2="186" y2="65" marker-end="url(#m05a06-seta)"/>
      <line x1="80" y1="65" x2="80" y2="134" /><line x1="80" y1="134" x2="190" y2="134" marker-end="url(#m05a06-seta)"/>
      <line x1="520" y1="65" x2="354" y2="65" marker-end="url(#m05a06-seta)"/>
      <line x1="460" y1="65" x2="460" y2="134"/><line x1="460" y1="134" x2="296" y2="134" stroke-dasharray="4 3"/>
    </g>
    <g font-size="12" fill="currentColor">
      <text x="10" y="55">down / P</text>
      <text x="86" y="100">valor = 0:</text>
      <text x="86" y="114">bloqueia</text>
      <text x="470" y="55">up / V</text>
      <text x="395" y="100">fila não vazia:</text>
      <text x="395" y="114">acorda um</text>
    </g>
  </svg>
  <figcaption>Um semáforo é um valor inteiro mais uma fila. down (P) decrementa ou, se o valor é 0, bloqueia o processo na fila. up (V) incrementa ou, se há alguém na fila, acorda um processo, que completa seu down.</figcaption>
</figure>

<h3>Binário x contador</h3>
<ul>
  <li><strong>Semáforo binário</strong>: começa em <strong>1</strong> e é usado por dois ou mais processos para garantir que só um entre na seção crítica. Cada processo faz <code>down</code> antes de entrar e <code>up</code> depois de sair: exclusão mútua garantida.</li>
  <li><strong>Semáforo contador</strong>: começa em <strong>n</strong> e controla <strong>n unidades</strong> de um recurso (vagas no buffer, impressoras, conexões).</li>
</ul>

<h2>Produtor-consumidor com semáforos</h2>
<p>A solução usa três semáforos: <code>full</code> conta os lugares <strong>preenchidos</strong> (começa em 0), <code>empty</code> conta os lugares <strong>vazios</strong> (começa em N) e <code>mutex</code> garante que produtor e consumidor não mexam no buffer ao mesmo tempo (começa em 1).</p>
<pre class="codigo"><code>#define N 100
typedef int semaphore;
semaphore mutex = 1;           /* controla o acesso à região crítica */
semaphore empty = N;           /* conta os lugares vazios            */
semaphore full = 0;            /* conta os lugares preenchidos       */

void producer(void) {                 void consumer(void) {
  int item;                             int item;
  while (TRUE) {                        while (TRUE) {
    item = produce_item();                down(&amp;full);    /* há item? */
    down(&amp;empty);   /* há vaga?  */        down(&amp;mutex);   /* entra    */
    down(&amp;mutex);   /* entra     */        item = remove_item();
    insert_item(item);                    up(&amp;mutex);     /* sai      */
    up(&amp;mutex);     /* sai       */        up(&amp;empty);     /* 1 vaga a mais */
    up(&amp;full);      /* 1 item a mais */    consume_item(item);
  }                                     }
}                                     }</code></pre>
<p>Aqui os semáforos têm <strong>dois usos diferentes</strong>: <code>mutex</code> serve para <strong>exclusão mútua</strong>; <code>full</code> e <code>empty</code> servem para <strong>sincronização</strong> (o produtor para quando o buffer está cheio, o consumidor quando está vazio).</p>
<p><strong>Cuidado com a ordem dos downs.</strong> Se o produtor fizesse <code>down(&amp;mutex)</code> <em>antes</em> de <code>down(&amp;empty)</code> e o buffer estivesse cheio, ele dormiria segurando o mutex (mutex = 0). O consumidor faria <code>down(&amp;mutex)</code> e também dormiria. Os dois ficariam bloqueados para sempre: um <strong>impasse (deadlock)</strong>. Um erro sutil desses mostra que programar com semáforos exige muito cuidado.</p>

<h2>Mutex</h2>
<p>Quando não é preciso contar, usa-se uma versão simplificada do semáforo: o <strong>mutex</strong> (de <em>mutual exclusion</em>, exclusão mútua). É uma variável que tem só <strong>dois estados: desimpedido (livre) ou impedido (travado)</strong>; basta 1 bit, embora na prática se use um inteiro (0 = desimpedido). Serve para gerenciar a <strong>exclusão mútua</strong> de um recurso ou trecho de código compartilhado. Duas rotinas:</p>
<ul>
  <li><strong>mutex_lock</strong> (lock): chamada antes de entrar na seção crítica. Se o mutex está desimpedido, a chamada prossegue e o processo entra (o mutex fica impedido). Se já está impedido, o processo fica <strong>bloqueado</strong> até quem está na seção crítica chamar unlock. Se vários estiverem esperando, um deles é escolhido.</li>
  <li><strong>mutex_unlock</strong> (unlock): chamada ao sair; desimpede o mutex.</li>
</ul>
<p>Implementação com TSL (Tanenbaum, Figura 2.24): parecida com o <code>enter_region</code> da aula 4, com uma diferença fundamental: se a trava está ocupada, <code>mutex_lock</code> chama <strong>thread_yield</strong> e cede a CPU para outro thread, em vez de ficar em espera ocupada.</p>
<pre class="codigo"><code>mutex_lock:
    TSL REGISTER,MUTEX   | copia mutex para o registrador e atribui a ele 1
    CMP REGISTER,#0      | o mutex era zero?
    JZE ok               | se era zero, estava desimpedido: retorne
    CALL thread_yield    | o mutex está ocupado: escalone outro thread
    JMP mutex_lock       | tente novamente mais tarde
ok: RET                  | entrou na região crítica

mutex_unlock:
    MOVE MUTEX,#0        | coloca 0 em mutex
    RET</code></pre>
<p>Nas <strong>Pthreads</strong> as chamadas são <code>pthread_mutex_init</code>, <code>pthread_mutex_destroy</code>, <code>pthread_mutex_lock</code> (conquista a trava ou bloqueia), <code>pthread_mutex_trylock</code> (conquista a trava ou falha, sem bloquear) e <code>pthread_mutex_unlock</code>.</p>

<div class="exemplo">
  <p><strong>Exemplos práticos de mutex.</strong></p>
  <table>
    <tr><th>Situação</th><th>Recurso compartilhado</th><th>Sem mutex</th><th>Com mutex</th></tr>
    <tr><td><strong>Contador compartilhado</strong> (visitas de um site, atendidos por várias threads)</td><td>A variável <code>visitas</code></td><td>Duas threads leem 500 e gravam 501: uma visita some.</td><td><code>lock(m); visitas++; unlock(m);</code></td></tr>
    <tr><td><strong>Impressora / fila de impressão</strong></td><td>A fila do spool (<code>in</code>)</td><td>Dois processos usam a mesma vaga e um pedido se perde.</td><td>Só um processo por vez insere na fila.</td></tr>
    <tr><td><strong>Conta bancária</strong> (saque no caixa eletrônico e débito automático ao mesmo tempo)</td><td>O <code>saldo</code></td><td>Saldo 1000; os dois leem 1000, sacam 300 e 200; o último a gravar deixa 700 ou 800, e não 500.</td><td><code>lock(m); saldo = saldo - valor; unlock(m);</code></td></tr>
  </table>
  <p>Passo a passo da conta com mutex: (1) o caixa chama <code>lock(m)</code>: mutex desimpedido, entra e o mutex fica impedido; (2) o débito automático chama <code>lock(m)</code> e fica <strong>Bloqueado</strong>; (3) o caixa lê 1000, grava 700 e chama <code>unlock(m)</code>; (4) o débito é acordado, entra, lê 700 e grava 500. Resultado correto: <strong>500</strong>.</p>
</div>

<h2>Semáforo x mutex</h2>
<table>
  <tr><th></th><th>Mutex (lock/unlock)</th><th>Semáforo (P/V, down/up)</th></tr>
  <tr><td><strong>Valores</strong></td><td>Só dois: desimpedido ou impedido.</td><td>Inteiro: binário (0/1) ou contador (0..n).</td></tr>
  <tr><td><strong>Quem chama</strong></td><td>lock e unlock são feitos <strong>necessariamente pelo mesmo processo</strong> (quem trancou destranca).</td><td>P e V <strong>podem ser feitos por processos diferentes</strong> (o produtor faz up em full, o consumidor faz down).</td></tr>
  <tr><td><strong>Uso típico</strong></td><td><strong>Acesso à seção crítica</strong> (exclusão mútua).</td><td><strong>Gerência de recursos</strong> e sincronização (contar vagas, avisar eventos), além de exclusão mútua.</td></tr>
</table>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>P = down = Proberen (testar)</strong>; <strong>V = up = Verhogen (incrementar)</strong>. Dijkstra, 1965.</li>
    <li>down só bloqueia se o valor é 0 (na versão dos slides, se fica negativo). <strong>up nunca bloqueia</strong>.</li>
    <li>O que torna o semáforo correto é a <strong>atomicidade</strong> de down/up; sem ela, voltaria o sinal perdido.</li>
    <li>Mutex <strong>não conta</strong>: tem só dois estados. E quem dá lock é quem dá unlock; no semáforo, P e V podem vir de processos diferentes.</li>
    <li>No produtor-consumidor, <strong>inverter os downs</strong> (mutex antes de empty) causa deadlock com o buffer cheio.</li>
  </ul>
</div>
`,
  resumo: 'Semáforo (Dijkstra, 1965) é um inteiro com uma fila, manipulado por operações atômicas: down/P decrementa ou bloqueia se o valor é 0; up/V incrementa ou acorda um processo da fila. O semáforo binário (inicia em 1) dá exclusão mútua; o contador (inicia em n) gerencia n unidades de recurso. O produtor-consumidor usa full = 0, empty = N e mutex = 1, e inverter os downs causa deadlock. Mutex é a versão simplificada com dois estados (desimpedido/impedido) e rotinas lock/unlock chamadas pelo mesmo processo, para proteger seções críticas como um contador, uma fila de impressão ou o saldo de uma conta.',
  questoes: [
    {
      id: 'm05-a06-q1',
      enunciado: 'O que é um <strong>mutex</strong> e como ele funciona?',
      alternativas: [
        { texto: 'Variável com dois estados (desimpedido/impedido) usada para exclusão mútua: lock entra se estiver desimpedido ou bloqueia o processo; unlock, chamado por quem entrou, libera.', correta: true, explicacao: 'Correto. É a definição do Tanenbaum. O mutex é um semáforo simplificado, sem contagem, e lock/unlock são feitos pelo mesmo processo.' },
        { texto: 'Semáforo contador que controla n unidades de um recurso.', correta: false, explicacao: 'Contar unidades é papel do semáforo contador. O mutex tem só dois estados e não conta nada.' },
        { texto: 'Instrução de hardware que desabilita interrupções durante a seção crítica.', correta: false, explicacao: 'O mutex pode ser implementado com TSL ou XCHG, mas ele não é uma instrução e não desabilita interrupções.' },
        { texto: 'Mecanismo de troca de mensagens entre máquinas de uma rede.', correta: false, explicacao: 'Troca de mensagens (send/receive) é outro mecanismo, usado quando não há memória compartilhada. O mutex depende de uma variável compartilhada.' },
      ],
    },
    {
      id: 'm05-a06-q2',
      enunciado: 'Um semáforo <code>s</code> começa com valor <strong>2</strong>. Em sequência: P1 faz down, P2 faz down, P3 faz down, P1 faz up. (Versão do Tanenbaum.) Qual o estado final?',
      alternativas: [
        { texto: 's = 0; P3 foi acordado pelo up de P1 e não há ninguém bloqueado.', correta: true, explicacao: 'Correto. down de P1: 2 → 1. down de P2: 1 → 0. down de P3: valor 0, P3 dorme. up de P1: há alguém dormindo, então P3 é acordado e completa o down; o valor continua 0.' },
        { texto: 's = 1; ninguém bloqueado.', correta: false, explicacao: 'O up de P1 não deixa o valor em 1, porque havia P3 dormindo: o "incremento" é consumido imediatamente pelo down de P3.' },
        { texto: 's = 0; P3 continua bloqueado.', correta: false, explicacao: 'up acorda um processo que esteja dormindo no semáforo. P3 era o único, então foi acordado.' },
        { texto: 's = −1; P3 bloqueado.', correta: false, explicacao: 'Na versão dos slides o valor chegaria a −1 após o down de P3, mas o up de P1 volta para 0 e acorda P3. No fim ninguém está bloqueado.' },
      ],
    },
    {
      id: 'm05-a06-q3',
      enunciado: 'Na implementação dos slides (P decrementa e bloqueia se o valor fica &lt; 0), um semáforo está com <code>s.valor = −2</code>. O que isso indica?',
      alternativas: [
        { texto: 'Há 2 processos bloqueados na fila do semáforo.', correta: true, explicacao: 'Correto. Cada P que deixou o valor negativo colocou um processo na fila. −2 significa dois processos esperando um V.' },
        { texto: 'O semáforo está corrompido: valores negativos são impossíveis.', correta: false, explicacao: 'Na versão dos slides valores negativos são normais. Só na versão do Tanenbaum o valor para em 0.' },
        { texto: 'Há 2 unidades do recurso livres.', correta: false, explicacao: 'Unidades livres correspondem a valor positivo. Valor negativo indica processos esperando.' },
        { texto: 'Os próximos 2 V serão ignorados.', correta: false, explicacao: 'Nenhum V é ignorado: cada V incrementa o valor e, se ele ficar ≤ 0, acorda um processo da fila.' },
      ],
    },
    {
      id: 'm05-a06-q4',
      enunciado: 'No produtor-consumidor com semáforos, quais os valores iniciais de <code>mutex</code>, <code>empty</code> e <code>full</code> (buffer de N lugares)?',
      alternativas: [
        { texto: 'mutex = 1, empty = N, full = 0.', correta: true, explicacao: 'Correto. O buffer começa vazio: N lugares vazios e 0 preenchidos. mutex = 1 é um semáforo binário que deixa um processo por vez no buffer.' },
        { texto: 'mutex = 0, empty = 0, full = N.', correta: false, explicacao: 'Com mutex = 0 ninguém entraria na região crítica, e full = N diria que o buffer começa cheio.' },
        { texto: 'mutex = 1, empty = 0, full = N.', correta: false, explicacao: 'Trocou empty e full. No início não há itens (full = 0) e todos os lugares estão vazios (empty = N).' },
        { texto: 'mutex = N, empty = N, full = N.', correta: false, explicacao: 'mutex = N deixaria N processos na região crítica ao mesmo tempo, e full e empty não podem ser N juntos.' },
      ],
    },
    {
      id: 'm05-a06-q5',
      enunciado: 'Se o produtor fizer <code>down(&amp;mutex)</code> <strong>antes</strong> de <code>down(&amp;empty)</code> e o buffer estiver cheio, o que acontece?',
      alternativas: [
        { texto: 'Deadlock: o produtor dorme em empty segurando o mutex, e o consumidor dorme ao tentar o down no mutex.', correta: true, explicacao: 'Correto. É o exemplo do Tanenbaum (p.82). O consumidor nunca consegue retirar um item para liberar espaço, e os dois ficam bloqueados para sempre.' },
        { texto: 'Nada muda: a ordem dos downs não importa.', correta: false, explicacao: 'Importa muito. Dormir segurando o mutex impede o único processo que poderia acordar o produtor.' },
        { texto: 'O produtor sobrescreve um item, pois não há vaga.', correta: false, explicacao: 'O produtor não chega a inserir: ele dorme em empty. O problema é o impasse, não a sobrescrita.' },
        { texto: 'O consumidor entra na região crítica junto com o produtor.', correta: false, explicacao: 'O mutex continua garantindo exclusão mútua: o consumidor é bloqueado. O resultado é deadlock.' },
      ],
    },
    {
      id: 'm05-a06-q6',
      enunciado: 'Segundo os slides, qual é a diferença entre <strong>semáforo e mutex</strong>?',
      alternativas: [
        { texto: 'lock e unlock são feitos necessariamente pelo mesmo processo (acesso à seção crítica); P e V podem ser feitos por processos diferentes (gerência de recursos).', correta: true, explicacao: 'Correto. No produtor-consumidor, por exemplo, quem faz up em full é o produtor e quem faz down é o consumidor; já o mutex é destrancado por quem trancou.' },
        { texto: 'O mutex conta recursos; o semáforo só tem dois estados.', correta: false, explicacao: 'Está invertido. O mutex tem dois estados; o semáforo pode contar (semáforo contador).' },
        { texto: 'Semáforos só funcionam em sistemas distribuídos.', correta: false, explicacao: 'Semáforos dependem de memória compartilhada; em sistemas distribuídos sem memória comum usa-se troca de mensagens.' },
        { texto: 'Não há diferença: são nomes diferentes para a mesma coisa.', correta: false, explicacao: 'O mutex é uma versão simplificada (binária) do semáforo, e há a diferença de quem chama as operações.' },
      ],
    },
    {
      id: 'm05-a06-q7',
      enunciado: 'Saldo da conta = 1000. Sem mutex, o caixa eletrônico (saque de 300) e o débito automático (200) leem o saldo antes de qualquer um gravar. Quais saldos finais são possíveis?',
      alternativas: [
        { texto: '700 ou 800, dependendo de quem grava por último.', correta: true, explicacao: 'Correto. Os dois leem 1000. O caixa grava 1000 − 300 = 700; o débito grava 1000 − 200 = 800. Fica o valor de quem gravar por último, e uma das operações se perde. Com mutex o resultado seria 500.' },
        { texto: 'Sempre 500.', correta: false, explicacao: '500 é o resultado correto, mas só ocorre se uma operação ler o saldo depois que a outra gravou. Com as leituras sobrepostas, uma atualização se perde.' },
        { texto: '500 ou 1000.', correta: false, explicacao: 'Com as duas leituras em 1000, cada um grava 1000 menos o próprio valor: 700 ou 800. Nenhum grava 500 nem mantém 1000.' },
        { texto: 'O sistema detecta o conflito e cancela as duas operações.', correta: false, explicacao: 'Sem mecanismo de sincronização, nada detecta a corrida. É por isso que o mutex é necessário.' },
      ],
    },
    {
      id: 'm05-a06-q8',
      enunciado: 'Na implementação de <code>mutex_lock</code> do Tanenbaum, o que acontece quando o mutex já está impedido?',
      alternativas: [
        { texto: 'O thread chama thread_yield e cede a CPU a outro thread, tentando de novo mais tarde, sem espera ocupada.', correta: true, explicacao: 'Correto. Essa é a diferença para o enter_region com TSL: em vez de girar no laço, o thread abre mão da CPU para que o dono da trava possa executar e liberá-la.' },
        { texto: 'O thread fica num laço executando TSL sem parar.', correta: false, explicacao: 'Isso é o enter_region da aula 4 (espera ocupada). O mutex_lock chama thread_yield justamente para evitar isso.' },
        { texto: 'O thread desabilita as interrupções.', correta: false, explicacao: 'O mutex_lock usa TSL e thread_yield; não mexe em interrupções.' },
        { texto: 'O mutex passa a contar quantos threads estão esperando.', correta: false, explicacao: 'O mutex não conta: tem só dois estados. Quem conta é o semáforo.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm05-a06-d1',
      enunciado: 'Explique o que é um mutex e como ele funciona, com dois exemplos de uso prático.',
      respostaModelo: `<p><strong>Mutex</strong> (de <em>mutual exclusion</em>) é uma versão simplificada do semáforo, usada para garantir <strong>exclusão mútua</strong> no acesso a um recurso ou trecho de código compartilhado (seção crítica). É uma variável compartilhada com apenas <strong>dois estados: desimpedido ou impedido</strong>.</p>
<p><strong>Funcionamento:</strong> antes de entrar na seção crítica, o processo (ou thread) chama <strong>lock</strong> (mutex_lock). Se o mutex está desimpedido, ele passa a impedido e o processo entra. Se está impedido, o processo fica <strong>bloqueado</strong> (ou cede a CPU) até que o processo que está na seção crítica saia. Ao sair, o processo chama <strong>unlock</strong> (mutex_unlock), que desimpede o mutex e permite que um dos que esperam entre. lock e unlock são feitos pelo <strong>mesmo processo</strong>. Para que o teste e a mudança de estado sejam atômicos, o mutex é implementado com instruções como <strong>TSL</strong> ou XCHG.</p>
<p><strong>Exemplos:</strong> (1) <strong>conta bancária</strong>: um saque e um débito automático alteram o mesmo saldo; com lock/unlock em volta de "saldo = saldo − valor", nenhuma atualização se perde. (2) <strong>fila de impressão</strong>: vários processos inserem pedidos no spool; o mutex garante que só um por vez pegue a próxima vaga livre, e nenhum pedido é sobrescrito. (Outro: contador compartilhado de acessos a um site.)</p>`,
      pontosChave: [
        'Definiu mutex como mecanismo de exclusão mútua com dois estados (desimpedido/impedido)',
        'Explicou lock: entra se livre, bloqueia se ocupado; e unlock: libera ao sair',
        'Mencionou que lock/unlock são feitos pelo mesmo processo ou que a operação é atômica (TSL/XCHG)',
        'Deu 2 exemplos práticos corretos (conta bancária, impressora/spool, contador compartilhado...)',
      ],
    },
  ],
});
