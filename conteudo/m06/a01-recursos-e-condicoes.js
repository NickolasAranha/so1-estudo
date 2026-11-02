// Módulo 6, aula 1: recursos, definição de deadlock, 4 condições de Coffman e grafo de alocação.
SO1.registerLesson({
  id: 'm06-a01',
  titulo: 'Recursos e as 4 condições',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §6.1 Recursos (p.269–271) e §6.2 Introdução aos impasses (p.271–274)',
    'Slides cap3 (Oliveira/Carissimi/Toscani, UFRGS): Deadlock e condições para ocorrência de deadlocks',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: o cruzamento travado.</strong> Quatro carros chegam juntos a um cruzamento sem semáforo, um em cada rua, e cada um avança até o meio. Agora cada carro ocupa um pedaço do cruzamento e precisa do pedaço que está ocupado pelo carro da frente para continuar. Ninguém dá ré, ninguém cede. Todos estão esperando, e o que cada um espera só pode ser liberado por outro carro que também está esperando. Ninguém sai dali.</p>
  <p>Isso é um <strong>deadlock</strong> (em português, <strong>impasse</strong> ou <strong>impasse fatal</strong>): um grupo de processos parado para sempre, cada um segurando algo que o outro quer.</p>
</div>

<h2>Recursos</h2>
<p><strong>Recurso</strong> é qualquer coisa que um processo precisa usar com exclusividade por algum tempo: um <strong>dispositivo de hardware</strong> (impressora, gravador de CD, unidade de fita) ou uma <strong>informação</strong> (um registro travado num banco de dados, uma entrada na tabela de processos). Pode haver várias instâncias idênticas do mesmo recurso (três impressoras iguais); nesse caso, qualquer uma delas atende ao pedido.</p>
<p>O uso de um recurso sempre segue três passos:</p>
<ol>
  <li><strong>Requisitar</strong> o recurso (se não estiver disponível, o processo espera; em geral fica <strong>Bloqueado</strong>).</li>
  <li><strong>Usar</strong> o recurso.</li>
  <li><strong>Liberar</strong> o recurso.</li>
</ol>
<p>Quando é o próprio processo que gerencia os recursos (por exemplo, registros de um banco de dados), uma forma comum é associar um <strong>semáforo</strong> (ou mutex) a cada recurso: <code>down</code> para requisitar e <code>up</code> para liberar (semáforos são vistos no Módulo 5).</p>

<h3>Recursos preemptíveis x não preemptíveis</h3>
<table>
  <tr><th>Tipo</th><th>Definição</th><th>Exemplos</th></tr>
  <tr><td><strong>Preemptível</strong></td><td>Pode ser <strong>retirado</strong> do processo que o possui <strong>sem nenhum prejuízo</strong>; depois é devolvido e o processo continua como se nada tivesse acontecido.</td><td><strong>Memória</strong> (o SO pode levar o processo para o disco e trazê-lo de volta), CPU.</td></tr>
  <tr><td><strong>Não preemptível</strong></td><td><strong>Não pode</strong> ser tomado do processo sem que a computação <strong>falhe</strong>.</td><td><strong>Gravador de CD</strong> (tirar no meio da gravação estraga o CD), <strong>impressora</strong> (as páginas de dois documentos se misturariam).</td></tr>
</table>
<p>Exemplo do Tanenbaum: o processo A pegou a impressora e o processo B ocupou toda a memória; A precisa de memória para terminar de imprimir. Como a memória é preemptível, o SO leva B para o disco, dá a memória para A, A termina e libera a impressora. <strong>Nenhum impasse.</strong> Por isso, os deadlocks que interessam envolvem <strong>recursos não preemptíveis</strong>.</p>

<h2>O que é deadlock</h2>
<p>Definição dos slides: <strong>situação na qual um ou mais processos ficam impedidos de prosseguir sua execução porque cada um está aguardando acesso a recursos já alocados por outro processo</strong>.</p>
<p>Definição formal do Tanenbaum: <em>"Um conjunto de processos estará em situação de impasse se todo processo pertencente ao conjunto estiver esperando por um evento que somente outro processo desse mesmo conjunto poderá fazer acontecer."</em> Como todos estão esperando, nenhum deles vai provocar o evento que acordaria outro: a espera é <strong>eterna</strong>. Na maioria dos casos, o evento esperado é a <strong>liberação de um recurso</strong>; isso é o <strong>impasse de recurso</strong>, o tipo mais comum.</p>
<p>Exemplo clássico: o processo A pede o scanner e consegue; o processo B, programado de outra forma, pede o gravador de CD e consegue. Agora A pede o gravador (ocupado por B) e B pede o scanner (ocupado por A). Os dois ficam bloqueados para sempre. Os recursos podem ser também de software: se A trava o registro R1 e B trava o registro R2 de um banco de dados, e depois cada um tenta travar o registro do outro, há impasse do mesmo jeito.</p>

<h3>Como um detalhe de programação cria o impasse</h3>
<p>Dois processos usam semáforos para proteger dois recursos. A única diferença entre os códigos abaixo é a <strong>ordem</strong> em que o processo B pede os recursos:</p>
<p><strong>(a) Sem impasse</strong>: os dois pedem na mesma ordem.</p>
<pre class="codigo"><code>processo_A:          processo_B:
  down(&amp;r1);           down(&amp;r1);
  down(&amp;r2);           down(&amp;r2);
  usa_os_dois();       usa_os_dois();
  up(&amp;r2);             up(&amp;r2);
  up(&amp;r1);             up(&amp;r1);</code></pre>
<p><strong>(b) Com possibilidade de impasse</strong>: B pede na ordem inversa.</p>
<pre class="codigo"><code>processo_A:          processo_B:
  down(&amp;r1);           down(&amp;r2);
  down(&amp;r2);           down(&amp;r1);
  usa_os_dois();       usa_os_dois();
  up(&amp;r2);             up(&amp;r1);
  up(&amp;r1);             up(&amp;r2);</code></pre>
<p>Em (a), quem pegar r1 primeiro também consegue r2; o outro só espera um pouco. Em (b), pode acontecer de A pegar r1 e B pegar r2; então cada um fica bloqueado tentando pegar o recurso do outro. O erro pode passar anos sem aparecer, porque depende da ordem exata em que o escalonador intercala os processos.</p>

<h2>As 4 condições de Coffman</h2>
<p>Coffman et al. (1971) mostraram que um deadlock de recurso só ocorre se <strong>quatro condições</strong> forem satisfeitas <strong>simultaneamente</strong>:</p>
<table>
  <tr><th>Condição</th><th>O que diz</th><th>No cruzamento</th></tr>
  <tr><td><strong>1. Exclusão mútua</strong></td><td>Cada recurso ou está <strong>disponível</strong> ou está atribuído a <strong>um único processo</strong>.</td><td>Dois carros não ocupam o mesmo pedaço da pista.</td></tr>
  <tr><td><strong>2. Posse e espera</strong> (nos slides, "segura/espera"; em inglês, <em>hold and wait</em>)</td><td>Processos que <strong>já possuem</strong> recursos podem <strong>solicitar novos</strong> recursos (e esperar por eles sem soltar os que têm).</td><td>O carro fica parado no seu pedaço esperando o próximo.</td></tr>
  <tr><td><strong>3. Não preempção</strong> (recurso não preemptível)</td><td>Um recurso concedido <strong>não pode ser tomado à força</strong>; só o processo que o possui pode liberá-lo.</td><td>Ninguém guincha um carro para fora.</td></tr>
  <tr><td><strong>4. Espera circular</strong></td><td>Existe um <strong>ciclo de 2 ou mais processos</strong>, cada um esperando um recurso que está com o próximo processo do ciclo.</td><td>Cada carro espera o da frente, e o último espera o primeiro.</td></tr>
</table>
<p>Na leitura de Stallings e Silberschatz, as três primeiras são <strong>políticas</strong> do sistema (o sistema pode ou não adotá-las); a quarta é a situação que acontece quando as três primeiras deixam. Se <strong>faltar qualquer uma</strong>, o impasse <strong>não ocorre</strong>. É isso que a prevenção de deadlocks explora (próxima aula).</p>

<h2>Grafo de alocação de recursos</h2>
<p>Holt (1972) mostrou como modelar as quatro condições com um <strong>grafo dirigido</strong> de dois tipos de nó:</p>
<ul>
  <li><strong>Círculo</strong> = processo. <strong>Quadrado</strong> = recurso.</li>
  <li>Seta do <strong>recurso para o processo</strong> (R → A): o recurso <strong>está alocado</strong> a esse processo (posse).</li>
  <li>Seta do <strong>processo para o recurso</strong> (B → S): o processo <strong>está bloqueado esperando</strong> esse recurso (requisição).</li>
  <li>Se existe um <strong>ciclo</strong> no grafo, existe um impasse, e os processos do ciclo estão em deadlock (considerando <strong>uma instância de cada recurso</strong>). Se não há ciclo, não há impasse.</li>
</ul>

<figure class="diagrama">
  <svg viewBox="0 0 380 480" style="max-width:440px" role="img" aria-label="Grafos de alocação de recursos: posse, requisição e um ciclo de impasse entre C, T, D e U">
    <defs>
      <marker id="m06a01-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
      <marker id="m06a01-seta-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--vermelho)"/></marker>
    </defs>
    <g font-size="15" text-anchor="middle" fill="currentColor">
      <!-- (a) posse -->
      <circle cx="95" cy="40" r="20" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="95" y="45">A</text>
      <rect x="75" y="120" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="95" y="145">R</text>
      <line x1="95" y1="118" x2="95" y2="63" stroke="currentColor" stroke-width="2" marker-end="url(#m06a01-seta)"/>
      <text x="95" y="188" font-size="13" font-weight="bold">(a) Posse</text>
      <text x="95" y="206" font-size="12">R está alocado a A</text>
      <!-- (b) requisição -->
      <rect x="265" y="20" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="285" y="45">S</text>
      <circle cx="285" cy="140" r="20" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="285" y="145">B</text>
      <line x1="285" y1="118" x2="285" y2="63" stroke="currentColor" stroke-width="2" marker-end="url(#m06a01-seta)"/>
      <text x="285" y="188" font-size="13" font-weight="bold">(b) Requisição</text>
      <text x="285" y="206" font-size="12">B bloqueado esperando S</text>
      <!-- (c) ciclo -->
      <circle cx="190" cy="262" r="20" style="fill:var(--vermelho-claro);stroke:var(--vermelho)" stroke-width="2"/>
      <text x="190" y="267">D</text>
      <circle cx="190" cy="388" r="20" style="fill:var(--vermelho-claro);stroke:var(--vermelho)" stroke-width="2"/>
      <text x="190" y="393">C</text>
      <rect x="90" y="305" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="110" y="330">T</text>
      <rect x="250" y="305" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="270" y="330">U</text>
    </g>
    <line x1="20" y1="226" x2="360" y2="226" style="stroke:var(--linha)" stroke-width="1.5"/>
    <g fill="none" stroke-width="2.5" style="stroke:var(--vermelho)">
      <path d="M122 303 L172 274" marker-end="url(#m06a01-seta-v)"/>
      <path d="M208 274 L258 303" marker-end="url(#m06a01-seta-v)"/>
      <path d="M258 347 L208 376" marker-end="url(#m06a01-seta-v)"/>
      <path d="M172 376 L122 347" marker-end="url(#m06a01-seta-v)"/>
    </g>
    <g font-size="12" fill="currentColor">
      <text x="130" y="276" text-anchor="end">T alocado a D</text>
      <text x="250" y="276">D espera U</text>
      <text x="250" y="384">U alocado a C</text>
      <text x="130" y="384" text-anchor="end">C espera T</text>
      <text x="190" y="436" text-anchor="middle" font-size="13" font-weight="bold">(c) Impasse: ciclo C → T → D → U → C</text>
      <text x="190" y="458" text-anchor="middle">Círculo = processo · Quadrado = recurso</text>
      <text x="190" y="474" text-anchor="middle">Recurso → processo = posse · Processo → recurso = espera</text>
    </g>
  </svg>
  <figcaption>Grafo de alocação de recursos (Tanenbaum, Fig. 6.3). Em (c), C espera T, que está com D; D espera U, que está com C. O ciclo mostra que C e D estão em deadlock: nenhum dos dois vai liberar o que tem.</figcaption>
</figure>

<p>Observação (Silberschatz): quando um recurso tem <strong>várias instâncias</strong>, o ciclo é <strong>necessário, mas não suficiente</strong>, porque outra instância pode ser liberada por um processo fora do ciclo. Para esse caso existe o algoritmo com matrizes, visto na próxima aula.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: três processos e três recursos (Tanenbaum, Fig. 6.4).</strong> O processo A precisa de R e S; B precisa de S e T; C precisa de T e R. Cada um pede os dois recursos, usa e libera. O escalonador (Round Robin) intercala os pedidos assim:</p>
  <table>
    <tr><th>Passo</th><th>O que acontece</th><th>Grafo / estado</th></tr>
    <tr><td>1</td><td>A requisita R</td><td>R livre: R → A. A continua.</td></tr>
    <tr><td>2</td><td>B requisita S</td><td>S livre: S → B. B continua.</td></tr>
    <tr><td>3</td><td>C requisita T</td><td>T livre: T → C. C continua.</td></tr>
    <tr><td>4</td><td>A requisita S</td><td>S está com B: A → S. <strong>A fica Bloqueado.</strong></td></tr>
    <tr><td>5</td><td>B requisita T</td><td>T está com C: B → T. <strong>B fica Bloqueado.</strong></td></tr>
    <tr><td>6</td><td>C requisita R</td><td>R está com A: C → R. <strong>C fica Bloqueado.</strong> Surge o ciclo A → S → B → T → C → R → A: <strong>deadlock</strong>.</td></tr>
  </table>
  <p>Confira as 4 condições no passo 6: cada recurso tem um só dono (exclusão mútua); cada processo segura um recurso e espera outro (posse e espera); ninguém toma recurso à força (não preempção); há um ciclo (espera circular).</p>
  <p><strong>A mesma carga sem impasse:</strong> se o SO soubesse do risco, poderia suspender B (não escalonar) e rodar só A e C: A pega R, C pega T, A pega S, C pede R e espera; A termina e libera R e S; C recebe R e termina; depois B roda sozinho. Nenhum ciclo se forma. O grafo é uma ferramenta para ver, a cada pedido, se aquela sequência leva ou não a um impasse.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>As 4 condições são <strong>necessárias e devem ocorrer juntas</strong>. Basta eliminar <strong>uma</strong> para não haver deadlock. "Preempção" e "inanição" <strong>não</strong> estão na lista; a condição é "<strong>não</strong> preempção".</li>
    <li>O sentido das setas cai em prova: <strong>recurso → processo = alocado</strong>; <strong>processo → recurso = pedindo/esperando</strong>.</li>
    <li>Memória e CPU são <strong>preemptíveis</strong>; impressora e gravador de CD são <strong>não preemptíveis</strong>. Deadlock de recurso envolve os não preemptíveis.</li>
    <li>No deadlock os processos estão <strong>Bloqueados</strong>, não gastando CPU. Isso o diferencia do <em>livelock</em> (processos ativos tentando sem progredir) e da <strong>inanição</strong> (um processo preterido indefinidamente, sem ciclo nenhum), vistos na próxima aula.</li>
    <li>Deadlock não depende só de hardware: registros de banco de dados, semáforos e entradas de tabelas internas também são recursos.</li>
  </ul>
</div>
`,
  resumo: 'Recurso é algo que um processo usa com exclusividade (requisitar, usar, liberar); preemptível pode ser retirado sem prejuízo (memória), não preemptível não (gravador de CD, impressora). Deadlock é um conjunto de processos em que cada um espera um evento (em geral a liberação de um recurso) que só outro processo do conjunto pode causar. Só ocorre com as 4 condições de Coffman juntas: exclusão mútua, posse e espera, não preempção e espera circular; no grafo de alocação (recurso → processo = posse, processo → recurso = espera), um ciclo indica deadlock quando há uma instância de cada recurso.',
  questoes: [
    {
      id: 'm06-a01-q1',
      enunciado: 'Qual alternativa define corretamente deadlock (impasse)?',
      alternativas: [
        { texto: 'Um conjunto de processos em que cada um espera por um evento que só outro processo do mesmo conjunto pode provocar, de modo que todos esperam para sempre.', correta: true, explicacao: 'Correto. É a definição formal do Tanenbaum. Como todos estão esperando, nenhum provoca o evento (em geral, a liberação de um recurso) que acordaria o outro.' },
        { texto: 'Um processo que nunca recebe a CPU porque processos de prioridade maior chegam sempre na frente.', correta: false, explicacao: 'Isso é inanição (starvation): um processo preterido indefinidamente. Não há ciclo de espera entre processos, e o sistema como um todo continua progredindo.' },
        { texto: 'Dois processos que acessam a mesma variável ao mesmo tempo e deixam o valor final errado.', correta: false, explicacao: 'Isso é condição de corrida (race condition), o problema que a exclusão mútua resolve. No deadlock ninguém consegue acessar nada: todos estão parados.' },
        { texto: 'Um processo em laço infinito que ocupa a CPU e trava o computador.', correta: false, explicacao: 'Um laço infinito é um erro de um único programa e não envolve espera por recursos de outros processos. Com preempção por tempo, o SO ainda tira a CPU dele.' },
      ],
    },
    {
      id: 'm06-a01-q2',
      enunciado: 'Qual dos recursos abaixo é <strong>preemptível</strong>?',
      alternativas: [
        { texto: 'A memória principal.', correta: true, explicacao: 'Correto. O SO pode levar um processo para o disco (swap), dar a memória a outro e depois devolvê-la, sem prejuízo para a computação. É o exemplo do Tanenbaum.' },
        { texto: 'Um gravador de CD.', correta: false, explicacao: 'Retirar o gravador no meio da gravação estraga o CD. Por isso é o exemplo clássico de recurso não preemptível.' },
        { texto: 'Uma impressora durante a impressão de um documento.', correta: false, explicacao: 'Se a impressora fosse passada a outro processo no meio do trabalho, as páginas dos dois documentos se misturariam. É não preemptível.' },
        { texto: 'Um registro de banco de dados travado para atualização.', correta: false, explicacao: 'Tomar à força um registro travado pode deixar os dados inconsistentes no meio de uma atualização; o próprio processo é quem precisa liberá-lo. É tratado como não preemptível.' },
      ],
    },
    {
      id: 'm06-a01-q3',
      enunciado: 'Qual item <strong>não</strong> é uma das quatro condições de Coffman para a ocorrência de deadlock?',
      alternativas: [
        { texto: 'Preempção de recursos.', correta: true, explicacao: 'Correto: a condição é o contrário, "não preempção". Se os recursos pudessem ser retirados à força, a terceira condição não estaria presente e o impasse poderia ser desfeito.' },
        { texto: 'Exclusão mútua.', correta: false, explicacao: 'É a condição 1: cada recurso está disponível ou atribuído a um único processo.' },
        { texto: 'Posse e espera.', correta: false, explicacao: 'É a condição 2 (nos slides, "segura/espera"): quem já possui recursos pode pedir novos e esperar por eles sem liberar os que tem.' },
        { texto: 'Espera circular.', correta: false, explicacao: 'É a condição 4: um ciclo de dois ou mais processos, cada um esperando um recurso que está com o próximo.' },
      ],
    },
    {
      id: 'm06-a01-q4',
      enunciado: 'O processo P1 está com a impressora e, sem liberá-la, pede o scanner. Essa situação, isoladamente, corresponde a qual condição de deadlock?',
      alternativas: [
        { texto: 'Posse e espera.', correta: true, explicacao: 'Correto. P1 retém um recurso já concedido (impressora) e solicita outro (scanner). É exatamente a condição 2.' },
        { texto: 'Espera circular.', correta: false, explicacao: 'Para haver espera circular é preciso um ciclo: por exemplo, o scanner estar com P2 e P2 esperar a impressora. Só com P1 pedindo não há ciclo.' },
        { texto: 'Exclusão mútua.', correta: false, explicacao: 'Exclusão mútua é a propriedade do recurso (só um dono por vez), não o comportamento de segurar um e pedir outro.' },
        { texto: 'Não preempção.', correta: false, explicacao: 'Não preempção diz que o recurso não pode ser tomado à força. O enunciado descreve o processo segurando um recurso enquanto pede outro, que é posse e espera.' },
      ],
    },
    {
      id: 'm06-a01-q5',
      enunciado: 'Num grafo de alocação de recursos, o que significa uma seta que sai do quadrado <strong>R</strong> e chega ao círculo <strong>A</strong>?',
      alternativas: [
        { texto: 'O recurso R está alocado ao processo A.', correta: true, explicacao: 'Correto. Seta de recurso para processo indica posse: R foi concedido a A e está em uso por ele.' },
        { texto: 'O processo A está bloqueado esperando o recurso R.', correta: false, explicacao: 'Esse é o sentido contrário: a seta de processo para recurso (A → R) indica requisição pendente.' },
        { texto: 'O processo A acabou de liberar o recurso R.', correta: false, explicacao: 'Quando um recurso é liberado, a seta simplesmente desaparece do grafo. Nenhuma seta representa liberação.' },
        { texto: 'O processo A e o recurso R estão em deadlock.', correta: false, explicacao: 'Uma seta isolada não indica impasse. O deadlock só aparece quando há um ciclo no grafo.' },
      ],
    },
    {
      id: 'm06-a01-q6',
      enunciado: 'Um sistema tem sete processos (A a G) e seis recursos (R, S, T, U, V, W), uma instância de cada:<br>A possui R e requisita S · B não possui nada e requisita T · C não possui nada e requisita S · D possui U e requisita S e T · E possui T e requisita V · F possui W e requisita S · G possui V e requisita U.<br>Quais processos formam o ciclo de deadlock?',
      alternativas: [
        { texto: 'D, E e G.', correta: true, explicacao: 'Correto. Montando o grafo: D → T → E (T está com E), E → V → G (V está com G), G → U → D (U está com D). O ciclo D-T-E-V-G-U-D prende os três. S está livre, então A, C e F podem recebê-lo um de cada vez e terminar. B espera T, que está com E: fica parado enquanto o impasse durar, mas não faz parte do ciclo.' },
        { texto: 'A, C e F.', correta: false, explicacao: 'Os três disputam S, mas S não está com nenhum processo. Esperar um recurso livre não é impasse: S será alocado a um deles, que termina e libera, e assim por diante.' },
        { texto: 'Todos os sete processos.', correta: false, explicacao: 'Só os processos de um ciclo estão em deadlock. A, C e F conseguem terminar porque S está disponível.' },
        { texto: 'Nenhum: não há ciclo no grafo.', correta: false, explicacao: 'Há ciclo: D espera T (com E), E espera V (com G) e G espera U (com D). Com uma instância de cada recurso, ciclo significa deadlock.' },
      ],
    },
    {
      id: 'm06-a01-q7',
      enunciado: 'Dois processos usam semáforos para dois recursos. A faz <code>down(r1); down(r2);</code> e B faz <code>down(r2); down(r1);</code>. O que pode acontecer?',
      alternativas: [
        { texto: 'A pode pegar r1, B pode pegar r2, e cada um fica bloqueado esperando o recurso do outro: deadlock.', correta: true, explicacao: 'Correto. É o exemplo da Fig. 6.2(b) do Tanenbaum. Se os dois pedissem na mesma ordem (r1 e depois r2), quem pegasse r1 também conseguiria r2 e não haveria ciclo.' },
        { texto: 'Nunca há problema, porque semáforos garantem exclusão mútua.', correta: false, explicacao: 'Semáforos garantem que só um processo use cada recurso, mas exclusão mútua é justamente uma das condições do deadlock. A ordem diferente dos pedidos cria a espera circular.' },
        { texto: 'Ocorre condição de corrida e os dois usam r1 ao mesmo tempo.', correta: false, explicacao: 'O down impede que dois processos tenham r1 ao mesmo tempo. O risco aqui não é acesso simultâneo, e sim espera mútua.' },
        { texto: 'O deadlock acontece em toda execução, sempre no mesmo ponto.', correta: false, explicacao: 'Depende da intercalação feita pelo escalonador. Se A fizer os dois downs antes de B começar, tudo funciona. Por isso esse tipo de erro é difícil de detectar.' },
      ],
    },
    {
      id: 'm06-a01-q8',
      enunciado: 'Num sistema estão presentes exclusão mútua, posse e espera e espera circular, mas o SO pode retirar à força qualquer recurso de um processo e devolvê-lo depois sem prejuízo. Pode haver deadlock permanente?',
      alternativas: [
        { texto: 'Não, porque falta a condição de não preempção; o SO pode retirar um recurso e quebrar o ciclo.', correta: true, explicacao: 'Correto. As 4 condições precisam ocorrer simultaneamente. Sem "não preempção", qualquer ciclo pode ser desfeito tirando o recurso de um processo e dando-o ao outro.' },
        { texto: 'Sim, porque basta haver espera circular.', correta: false, explicacao: 'A espera circular sozinha não basta. Se os recursos podem ser tomados, o ciclo é desfeito; é o caso da memória no exemplo do Tanenbaum.' },
        { texto: 'Sim, porque três das quatro condições já são suficientes.', correta: false, explicacao: 'As condições são todas necessárias. Se faltar uma, o impasse não ocorre; essa é a base da prevenção de deadlocks.' },
        { texto: 'Não, porque exclusão mútua impede qualquer espera.', correta: false, explicacao: 'É o contrário: a exclusão mútua é o que obriga os outros processos a esperar. A resposta é "não" pela falta da não preempção.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm06-a01-d1',
      enunciado: 'Conceitue deadlock e explique as quatro condições necessárias para que ele ocorra. Dê um exemplo.',
      respostaModelo: `<p><strong>Deadlock</strong> (impasse) é a situação em que um conjunto de processos fica impedido de prosseguir porque cada um está esperando um evento, em geral a liberação de um recurso, que só outro processo do mesmo conjunto pode provocar. Como todos estão bloqueados, ninguém libera nada e a espera é eterna.</p>
<p>Segundo Coffman, quatro condições devem ocorrer <strong>simultaneamente</strong>:</p>
<ol>
  <li><strong>Exclusão mútua</strong>: cada recurso está disponível ou alocado a um único processo.</li>
  <li><strong>Posse e espera</strong>: um processo que já possui recursos pode pedir novos e esperar por eles sem liberar os que tem.</li>
  <li><strong>Não preempção</strong>: um recurso concedido não pode ser retirado à força; só o dono o libera.</li>
  <li><strong>Espera circular</strong>: há um ciclo de dois ou mais processos, cada um esperando um recurso que está com o próximo.</li>
</ol>
<p>Se qualquer uma faltar, não há deadlock.</p>
<p><strong>Exemplo</strong>: o processo A obtém o scanner e o processo B obtém o gravador de CD. Em seguida, A pede o gravador e B pede o scanner. Cada um segura um recurso não preemptível e espera o do outro, formando o ciclo A → gravador → B → scanner → A no grafo de alocação.</p>`,
      pontosChave: [
        'Definiu deadlock como processos esperando eventos/recursos que só outro processo do mesmo conjunto pode liberar (espera eterna)',
        'Citou e explicou exclusão mútua e posse e espera',
        'Citou e explicou não preempção e espera circular',
        'Disse que as quatro condições precisam ocorrer simultaneamente (faltando uma, não há deadlock)',
        'Deu um exemplo correto com dois ou mais processos e recursos',
      ],
    },
  ],
});
