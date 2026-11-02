// Módulo 5, aula 8: problemas clássicos: jantar dos filósofos, leitores e escritores, barreiras.
SO1.registerLesson({
  id: 'm05-a08',
  titulo: 'Problemas clássicos',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.3.9 Barreiras (p.87), §2.5.1 O jantar dos filósofos e §2.5.2 Leitores e escritores (p.98–101)',
    'Slides cap3 (Oliveira/Carissimi/Toscani, UFRGS): parend como barreira, semáforos',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: problemas de convivência.</strong> Cinco amigos numa mesa redonda com um hashi (pauzinho) entre cada dois pratos: para comer, cada um precisa dos dois hashis ao lado. Uma biblioteca em que muitos podem <em>ler</em> o mesmo livro ao mesmo tempo, mas quem vai <em>corrigir</em> o livro precisa dele só para si. Uma excursão em que o ônibus só parte quando <em>todos</em> voltaram.</p>
  <p>Esses três cenários são os <strong>problemas clássicos</strong> de sincronização: servem de teste para qualquer nova primitiva (semáforo, monitor...) e modelam situações reais de SO.</p>
</div>

<h2>1. O jantar dos filósofos (Dijkstra, 1965)</h2>
<p><strong>Cinco filósofos</strong> estão sentados a uma mesa circular. Cada um tem um prato de espaguete e, <strong>entre cada par de pratos, há um garfo</strong> (5 garfos). Para comer, um filósofo precisa de <strong>dois garfos</strong>: o da esquerda e o da direita. A vida de um filósofo alterna entre <strong>pensar e comer</strong>. Quando fica com fome, tenta pegar os dois garfos, um de cada vez, em qualquer ordem; se conseguir, come por um tempo, devolve os garfos e volta a pensar. O problema modela processos que competem pelo <strong>acesso exclusivo a um número limitado de recursos</strong> (como dispositivos de E/S).</p>

<figure class="diagrama">
  <svg viewBox="0 0 520 300" style="max-width:600px" role="img" aria-label="Mesa circular com cinco filósofos F0 a F4 e cinco garfos, um entre cada par de filósofos">
    <circle cx="160" cy="150" r="95" fill="none" stroke="currentColor" stroke-width="2"/>
    <g stroke-width="2">
      <circle cx="160" cy="40" r="22" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <circle cx="265" cy="116" r="22" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <circle cx="225" cy="239" r="22" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <circle cx="95" cy="239" r="22" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <circle cx="55" cy="116" r="22" style="fill:var(--verde-claro);stroke:var(--verde)"/>
    </g>
    <g font-size="13" text-anchor="middle" fill="currentColor" font-weight="bold">
      <text x="160" y="45">F0</text><text x="265" y="121">F1</text><text x="225" y="244">F2</text>
      <text x="95" y="244">F3</text><text x="55" y="121">F4</text>
    </g>
    <g stroke-width="4" stroke-linecap="round" style="stroke:var(--ambar)">
      <line x1="212" y1="78" x2="222" y2="92"/>
      <line x1="236" y1="182" x2="250" y2="178"/>
      <line x1="160" y1="232" x2="160" y2="248"/>
      <line x1="70" y1="178" x2="84" y2="182"/>
      <line x1="98" y1="92" x2="108" y2="78"/>
    </g>
    <g font-size="11" fill="currentColor" text-anchor="middle">
      <text x="160" y="140">mesa</text>
      <text x="160" y="156">5 garfos</text>
    </g>
    <g font-size="12" fill="currentColor">
      <text x="320" y="60" font-weight="bold">Regras</text>
      <text x="320" y="82">• cada filósofo precisa</text>
      <text x="320" y="98">  dos 2 garfos vizinhos</text>
      <text x="320" y="120">• vizinhos não comem juntos</text>
      <text x="320" y="142">• com 5 garfos, no máximo</text>
      <text x="320" y="158">  2 filósofos comem ao</text>
      <text x="320" y="174">  mesmo tempo</text>
      <text x="320" y="204" style="fill:var(--verde)" font-weight="bold">verde: comendo</text>
      <text x="320" y="222">(F2 e F4 não são vizinhos)</text>
    </g>
  </svg>
  <figcaption>Cinco filósofos e cinco garfos (em âmbar), um entre cada par. Na figura, F2 e F4 comem ao mesmo tempo, pois não compartilham garfo; F3, entre eles, não tem nenhum garfo livre.</figcaption>
</figure>

<h3>Solução óbvia (errada) e seus problemas</h3>
<pre class="codigo"><code>#define N 5
void philosopher(int i) {        /* i: número do filósofo, de 0 a 4 */
  while (TRUE) {
    think();
    take_fork(i);                /* pega o garfo esquerdo           */
    take_fork((i+1) % N);        /* pega o garfo direito            */
    eat();
    put_fork(i);
    put_fork((i+1) % N);
  }
}</code></pre>
<ul>
  <li><strong>Impasse (deadlock)</strong>: se os cinco ficam com fome ao mesmo tempo e cada um pega o garfo da esquerda, nenhum consegue o da direita. Todos esperam para sempre.</li>
  <li><strong>Tentativa: devolver e tentar de novo.</strong> Se o garfo direito não está livre, o filósofo devolve o esquerdo, espera um tempo e tenta outra vez. Com azar, todos fazem isso em sincronia para sempre: os programas continuam executando, mas ninguém progride. O Tanenbaum (§2.5.1) chama isso de <strong>inanição (starvation)</strong>; no cap. 6 (Módulo 6) o mesmo fenômeno recebe o nome mais preciso de <strong>livelock</strong>, e "inanição", em sentido estrito, fica para um processo que é sempre preterido. Esperar um tempo <em>aleatório</em> torna isso improvável (é o que a Ethernet faz), mas não impossível.</li>
  <li><strong>Tentativa: proteger tudo com um semáforo binário</strong> (<code>down(&amp;mutex)</code> antes de pegar os garfos, <code>up(&amp;mutex)</code> depois de devolver). Funciona, mas só <strong>um filósofo come por vez</strong>, quando os 5 garfos permitiriam dois.</li>
</ul>

<h3>Solução correta (Tanenbaum, Figura 2.38)</h3>
<p>Usa um arranjo <code>state[N]</code> com o estado de cada filósofo (<strong>THINKING</strong>, <strong>HUNGRY</strong>, <strong>EATING</strong>), um semáforo <code>mutex</code> para proteger esse arranjo e <strong>um semáforo por filósofo</strong> (<code>s[N]</code>, iniciados em 0) para bloquear quem está com fome mas não pode comer. Um filósofo só passa a EATING se <strong>nenhum dos vizinhos estiver comendo</strong>. Os vizinhos de i são <code>LEFT = (i+N−1)%N</code> e <code>RIGHT = (i+1)%N</code>; para i = 2, LEFT = 1 e RIGHT = 3.</p>
<pre class="codigo"><code>void take_forks(int i) {
  down(&amp;mutex);          /* entra na região crítica             */
  state[i] = HUNGRY;     /* registra que está faminto           */
  test(i);               /* tenta pegar dois garfos             */
  up(&amp;mutex);            /* sai da região crítica               */
  down(&amp;s[i]);           /* bloqueia se os garfos não foram pegos */
}

void put_forks(int i) {
  down(&amp;mutex);
  state[i] = THINKING;   /* acabou de comer                     */
  test(LEFT);            /* o vizinho da esquerda pode comer agora? */
  test(RIGHT);           /* e o da direita?                     */
  up(&amp;mutex);
}

void test(int i) {
  if (state[i] == HUNGRY &amp;&amp; state[LEFT] != EATING &amp;&amp; state[RIGHT] != EATING) {
    state[i] = EATING;
    up(&amp;s[i]);           /* libera o filósofo i                 */
  }
}</code></pre>
<p>Essa solução é <strong>livre de impasse</strong> e permite o <strong>máximo de paralelismo</strong>: com 5 filósofos, até 2 comem ao mesmo tempo.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo</strong> com a solução correta. Todos começam pensando.</p>
  <table>
    <tr><th>Passo</th><th>Evento</th><th>O que test() decide</th><th>Comendo</th></tr>
    <tr><td>1</td><td>F1 fica com fome (take_forks(1)).</td><td>Vizinhos F0 e F2 não comem: F1 vira EATING e o up(&amp;s[1]) deixa o down passar.</td><td>F1</td></tr>
    <tr><td>2</td><td>F2 fica com fome.</td><td>Vizinho F1 está comendo: F2 fica HUNGRY e bloqueia em down(&amp;s[2]).</td><td>F1</td></tr>
    <tr><td>3</td><td>F3 fica com fome.</td><td>Vizinhos F2 (faminto, não comendo) e F4 (pensando): F3 vira EATING.</td><td>F1, F3</td></tr>
    <tr><td>4</td><td>F1 termina (put_forks(1)).</td><td>test(0): F0 não está faminto. test(2): F2 está faminto, mas F3 come: continua bloqueado.</td><td>F3</td></tr>
    <tr><td>5</td><td>F3 termina (put_forks(3)).</td><td>test(2): F2 faminto e F1, F3 não comem: F2 vira EATING e é acordado. test(4): F4 não está faminto.</td><td>F2</td></tr>
  </table>
</div>

<h2>2. Leitores e escritores (Courtois et al., 1971)</h2>
<p>Modela o acesso a uma <strong>base de dados</strong> (exemplo: reservas de passagens aéreas). É aceitável que <strong>vários processos leiam ao mesmo tempo</strong>; mas, se um processo está <strong>escrevendo</strong>, <strong>nenhum outro</strong> pode acessar a base, <strong>nem mesmo os leitores</strong>.</p>
<pre class="codigo"><code>semaphore mutex = 1;          /* controla o acesso a rc         */
semaphore db = 1;             /* controla o acesso à base       */
int rc = 0;                   /* nº de processos lendo ou querendo ler */

void reader(void) {                     void writer(void) {
  while (TRUE) {                          while (TRUE) {
    down(&amp;mutex);                           think_up_data();
    rc = rc + 1;                            down(&amp;db);   /* acesso exclusivo */
    if (rc == 1) down(&amp;db);  /* 1º leitor */   write_data_base();
    up(&amp;mutex);                             up(&amp;db);
    read_data_base();                     }
    down(&amp;mutex);                       }
    rc = rc - 1;
    if (rc == 0) up(&amp;db);    /* último leitor */
    up(&amp;mutex);
    use_data_read();
  }
}</code></pre>
<ul>
  <li>O <strong>primeiro leitor</strong> faz <code>down(&amp;db)</code>, "trancando" a base contra escritores; os leitores seguintes só incrementam <code>rc</code>. O <strong>último leitor</strong> a sair faz <code>up(&amp;db)</code>, liberando um escritor bloqueado.</li>
  <li>Problema: essa solução dá <strong>prioridade aos leitores</strong>. Enquanto houver pelo menos um leitor ativo, novos leitores entram. Com um fluxo constante de leitores (um a cada 2 segundos, cada um lendo por 5), <strong>o escritor nunca entra</strong>: inanição do escritor.</li>
  <li>Alternativa: quando um escritor está esperando, os novos leitores ficam Bloqueados atrás dele. O escritor espera só os leitores que já estavam ativos. A desvantagem é <strong>menos concorrência</strong> (pior desempenho).</li>
</ul>

<h2>3. Barreiras</h2>
<p>Mecanismo de sincronização para <strong>grupos de processos</strong> (e não para pares como produtor-consumidor). Algumas aplicações são divididas em <strong>fases</strong>, com a regra de que <strong>nenhum processo avança para a próxima fase até que todos tenham terminado a fase atual</strong>. Coloca-se uma <strong>barreira</strong> no fim de cada fase: o processo que chega à barreira (chamando a primitiva <code>barrier</code>) fica <strong>bloqueado</strong> até que todos cheguem; quando o último chega, <strong>todos são liberados</strong>.</p>
<p>Exemplo do Tanenbaum: cálculo de como o calor se propaga numa placa de metal, representada por uma matriz enorme. Cada processo calcula uma parte da nova matriz, mas a iteração n + 1 só pode começar quando a iteração n estiver completa. Cada processo executa <code>barrier</code> ao terminar sua parte. Note a semelhança com o <strong>parend</strong> da aula 2, que também funciona como barreira.</p>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>Na solução ingênua dos filósofos, todos pegando o garfo esquerdo ao mesmo tempo é <strong>deadlock</strong> (todos parados). Devolver e tentar de novo em sincronia é <strong>livelock</strong> (todos executando sem progredir); no §2.5.1 o Tanenbaum chama isso de inanição.</li>
    <li>Proteger o jantar inteiro com um único mutex é <strong>correto, mas ineficiente</strong>: só 1 come, quando 2 poderiam.</li>
    <li>Com 5 filósofos, o máximo comendo ao mesmo tempo é <strong>2</strong> (precisam de 4 dos 5 garfos e não podem ser vizinhos).</li>
    <li>Leitores e escritores: <strong>vários leitores juntos podem</strong>; escritor é <strong>exclusivo</strong>, inclusive contra leitores. A solução clássica favorece leitores e pode deixar o escritor em inanição.</li>
    <li>Barreira sincroniza um <strong>grupo</strong>: ninguém passa até o <strong>último</strong> chegar.</li>
  </ul>
</div>
`,
  resumo: 'Jantar dos filósofos (Dijkstra): 5 filósofos e 5 garfos; pegar o garfo esquerdo e depois o direito leva a deadlock, devolver e tentar de novo pode levar a livelock (a "inanição" do Tanenbaum §2.5.1), e um único mutex deixa só um comer. A solução correta usa estados (pensando, faminto, comendo), um mutex e um semáforo por filósofo, e permite 2 comendo ao mesmo tempo. Leitores e escritores: vários leitores juntos, escritor exclusivo; a solução com rc, mutex e db favorece os leitores e pode deixar o escritor esperando para sempre. Barreira: cada processo de um grupo bloqueia no fim da fase até que o último chegue, e então todos são liberados.',
  questoes: [
    {
      id: 'm05-a08-q1',
      enunciado: 'Na solução óbvia do jantar dos filósofos (pegar o garfo esquerdo e depois o direito), o que acontece se os cinco ficam com fome ao mesmo tempo e cada um pega seu garfo esquerdo?',
      alternativas: [
        { texto: 'Impasse (deadlock): nenhum consegue o garfo direito e todos esperam para sempre.', correta: true, explicacao: 'Correto. Cada filósofo segura um garfo e espera o que está com o vizinho, formando uma espera circular.' },
        { texto: 'Dois filósofos comem e os outros esperam.', correta: false, explicacao: 'Para comer é preciso ter os dois garfos. Como cada um pegou exatamente um, nenhum tem dois.' },
        { texto: 'Inanição, porque os filósofos continuam tentando sem parar.', correta: false, explicacao: 'Na solução óbvia eles não devolvem o garfo para tentar de novo: ficam parados esperando. Isso é deadlock. O livelock (a "inanição" do §2.5.1) aparece na variante "devolve e tenta de novo".' },
        { texto: 'Nada de mais: o SO dá o garfo direito a um deles.', correta: false, explicacao: 'Nada na solução tira um garfo de quem o pegou. Sem preempção, todos ficam esperando.' },
      ],
    },
    {
      id: 'm05-a08-q2',
      enunciado: 'Na variante em que o filósofo devolve o garfo esquerdo se o direito estiver ocupado, espera um tempo fixo e tenta de novo, todos podem repetir isso em sincronia para sempre. Como se chama essa situação?',
      alternativas: [
        { texto: 'Livelock (no §2.5.1 o Tanenbaum chama de inanição): os programas continuam executando, mas ninguém progride.', correta: true, explicacao: 'Correto. No §2.5.1 o Tanenbaum chama isso de inanição; no cap. 6 ele usa o nome livelock, e inanição em sentido estrito é um processo sempre preterido (Módulo 6). Diferente do deadlock, aqui todos estão ativos, pegando e devolvendo garfos, sem nunca comer. Esperar um tempo aleatório torna isso improvável.' },
        { texto: 'Deadlock, porque todos estão bloqueados.', correta: false, explicacao: 'Ninguém está bloqueado: todos executam, devolvendo e tentando de novo. Por isso é livelock (a "inanição" do §2.5.1), não deadlock.' },
        { texto: 'Condição de corrida.', correta: false, explicacao: 'Não há dados corrompidos; o problema é a falta de progresso.' },
        { texto: 'Inversão de prioridade.', correta: false, explicacao: 'Não há prioridades envolvidas; todos os filósofos são iguais.' },
      ],
    },
    {
      id: 'm05-a08-q3',
      enunciado: 'Na solução correta do Tanenbaum, com <strong>5 filósofos</strong>, qual o número máximo de filósofos comendo ao mesmo tempo?',
      alternativas: [
        { texto: '2', correta: true, explicacao: 'Correto. Cada um usa 2 garfos: 2 filósofos usam 4 dos 5. Um terceiro precisaria de mais 2 garfos, e só sobra 1. Além disso, quem come não pode ter vizinho comendo.' },
        { texto: '1', correta: false, explicacao: 'Esse é o resultado da solução com um único semáforo protegendo tudo: correta, mas ineficiente. A solução com estados permite 2.' },
        { texto: '3', correta: false, explicacao: '3 filósofos precisariam de 6 garfos, e só há 5.' },
        { texto: '5', correta: false, explicacao: 'Se todos comessem, seriam 10 garfos. Com 5 garfos, no máximo 2 comem.' },
      ],
    },
    {
      id: 'm05-a08-q4',
      enunciado: 'Na solução correta, os vizinhos de i são <code>LEFT = (i+N−1)%N</code> e <code>RIGHT = (i+1)%N</code>, com N = 5. Quais são os vizinhos do filósofo <strong>0</strong>?',
      alternativas: [
        { texto: 'LEFT = 4 e RIGHT = 1.', correta: true, explicacao: 'Correto. LEFT = (0 + 5 − 1) % 5 = 4; RIGHT = (0 + 1) % 5 = 1. A mesa é circular, então o vizinho da esquerda de 0 é o último filósofo.' },
        { texto: 'LEFT = −1 e RIGHT = 1.', correta: false, explicacao: 'O "+N" na fórmula existe justamente para evitar o −1: (0 + 4) % 5 = 4.' },
        { texto: 'LEFT = 1 e RIGHT = 4.', correta: false, explicacao: 'Trocou os lados. Pela fórmula, RIGHT = (0+1)%5 = 1 e LEFT = 4.' },
        { texto: 'LEFT = 4 e RIGHT = 0.', correta: false, explicacao: 'RIGHT = (0+1)%5 = 1. O filósofo não é vizinho de si mesmo.' },
      ],
    },
    {
      id: 'm05-a08-q5',
      enunciado: 'No problema dos leitores e escritores, qual afirmação descreve as regras de acesso à base de dados?',
      alternativas: [
        { texto: 'Vários leitores podem ler ao mesmo tempo; um escritor precisa de acesso exclusivo, sem nenhum outro processo, nem leitores.', correta: true, explicacao: 'Correto. Ler não altera os dados, então leitores simultâneos não causam problema. Escrever exige exclusividade total.' },
        { texto: 'Só um processo por vez, seja leitor ou escritor.', correta: false, explicacao: 'Isso seria correto, mas desnecessariamente restritivo. O problema permite vários leitores simultâneos.' },
        { texto: 'Vários escritores podem escrever ao mesmo tempo, desde que não haja leitores.', correta: false, explicacao: 'Dois escritores juntos causariam condição de corrida na base. Escritor é sempre exclusivo.' },
        { texto: 'Leitores e escritores podem acessar juntos, desde que em registros diferentes.', correta: false, explicacao: 'O problema clássico trata a base como um todo: com um escritor ativo, ninguém mais acessa.' },
      ],
    },
    {
      id: 'm05-a08-q6',
      enunciado: 'Na solução clássica dos leitores e escritores (com <code>rc</code>, <code>mutex</code> e <code>db</code>), por que só o <strong>primeiro</strong> leitor faz <code>down(&amp;db)</code> e só o <strong>último</strong> faz <code>up(&amp;db)</code>?',
      alternativas: [
        { texto: 'Porque o grupo de leitores, como um todo, tranca a base contra escritores: o primeiro tranca, os seguintes só contam (rc), e o último a sair libera.', correta: true, explicacao: 'Correto. Assim vários leitores leem juntos, e um escritor só entra quando rc volta a 0.' },
        { texto: 'Porque db é um semáforo contador iniciado com o número de leitores.', correta: false, explicacao: 'db começa em 1 (binário). Quem conta os leitores é a variável rc.' },
        { texto: 'Para dar prioridade aos escritores.', correta: false, explicacao: 'É o contrário: essa solução favorece os leitores, e o escritor pode esperar para sempre.' },
        { texto: 'Porque cada leitor precisa de acesso exclusivo à base.', correta: false, explicacao: 'Leitores não precisam de exclusividade entre si; se precisassem, cada um faria down(&amp;db).' },
      ],
    },
    {
      id: 'm05-a08-q7',
      enunciado: 'Na solução clássica dos leitores e escritores, chega um leitor novo a cada 2 segundos e cada leitor lê por 5 segundos. Um escritor está esperando. O que acontece?',
      alternativas: [
        { texto: 'O escritor nunca entra (inanição), porque sempre há pelo menos um leitor ativo e novos leitores continuam sendo admitidos.', correta: true, explicacao: 'Correto. É o exemplo do Tanenbaum. rc nunca volta a 0, então o up(&amp;db) que liberaria o escritor nunca acontece.' },
        { texto: 'O escritor entra após o primeiro leitor terminar.', correta: false, explicacao: 'O escritor só entra quando rc chega a 0. Com leitores se sobrepondo, isso não acontece.' },
        { texto: 'Ocorre deadlock entre leitores e escritor.', correta: false, explicacao: 'Os leitores continuam progredindo; só o escritor fica esperando. Isso é inanição, não deadlock.' },
        { texto: 'Leitores e escritor acessam a base juntos.', correta: false, explicacao: 'O semáforo db impede isso: o escritor fica bloqueado enquanto houver leitores.' },
      ],
    },
    {
      id: 'm05-a08-q8',
      enunciado: 'Quatro processos A, B, C e D executam uma fase de cálculo e chamam <code>barrier</code> ao terminar. A, B e D já chegaram à barreira; C ainda está calculando. Qual o estado?',
      alternativas: [
        { texto: 'A, B e D estão bloqueados na barreira; quando C chegar, os quatro são liberados para a próxima fase.', correta: true, explicacao: 'Correto. É a Figura 2.30 do Tanenbaum: ninguém avança até o último processo do grupo chegar.' },
        { texto: 'A, B e D seguem para a próxima fase; C vai depois.', correta: false, explicacao: 'A barreira existe justamente para impedir isso: a próxima fase depende dos resultados de todos.' },
        { texto: 'A barreira mata C, por estar atrasado.', correta: false, explicacao: 'A barreira só espera; não encerra nenhum processo.' },
        { texto: 'O primeiro que chegou (A) é liberado e os outros esperam.', correta: false, explicacao: 'Não há liberação individual: todos são liberados juntos quando o último chega.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm05-a08-d1',
      enunciado: 'Descreva o problema do jantar dos filósofos, explique por que a solução "pegar o garfo esquerdo e depois o direito" falha e como a solução correta funciona.',
      respostaModelo: `<p><strong>Problema:</strong> cinco filósofos sentam-se a uma mesa circular, cada um com um prato de espaguete, e há um garfo entre cada par de pratos (5 garfos). Para comer, o filósofo precisa dos <strong>dois garfos</strong> vizinhos. Eles alternam entre pensar e comer. O problema modela processos que disputam acesso exclusivo a um número limitado de recursos.</p>
<p><strong>Por que a solução óbvia falha:</strong> se todos ficam com fome ao mesmo tempo e cada um pega o garfo esquerdo, nenhum consegue o direito e todos esperam para sempre: <strong>impasse (deadlock)</strong>. Se, em vez disso, cada um devolve o garfo e tenta de novo após um tempo fixo, todos podem repetir isso em sincronia sem nunca comer: <strong>livelock</strong> (o Tanenbaum, no §2.5.1, chama de inanição). Proteger tudo com um único semáforo funciona, mas deixa só um filósofo comer por vez.</p>
<p><strong>Solução correta:</strong> manter o estado de cada filósofo (pensando, faminto, comendo) num arranjo protegido por um semáforo mutex, e um semáforo por filósofo (iniciado em 0). Ao ficar com fome, o filósofo marca HUNGRY e chama test: só passa a EATING se <strong>nenhum dos vizinhos estiver comendo</strong>; caso contrário, bloqueia no seu semáforo. Ao terminar, volta a THINKING e testa os dois vizinhos, acordando-os se puderem comer. Não há impasse e até 2 filósofos comem ao mesmo tempo.</p>`,
      pontosChave: [
        'Descreveu o cenário: 5 filósofos, 5 garfos, cada um precisa de 2 garfos vizinhos',
        'Explicou o deadlock da solução óbvia (todos pegam o garfo esquerdo)',
        'Citou o livelock (a "inanição" do Tanenbaum §2.5.1) na variante de devolver e tentar de novo ou a ineficiência do mutex único',
        'Explicou a solução com estados e semáforo por filósofo (só come se nenhum vizinho come)',
      ],
    },
  ],
});
