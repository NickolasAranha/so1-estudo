// Módulo 10, aula 1: estudo de caso UNIX/Linux — processos (fork/exec/wait), estados, escalonamento, ext/i-nodes, "tudo é arquivo".
SO1.registerLesson({
  id: 'm10-a01',
  titulo: 'Estudo de caso: UNIX/Linux',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §10.1–10.2 (história e visão geral, p.443–454)',
    'Tanenbaum, SO Modernos 3ª ed., §10.3.1–10.3.4 (processos, fork/exec/waitpid, sinais, escalonamento, p.455–465)',
    'Tanenbaum, SO Modernos 3ª ed., §10.5.1 (arquivos especiais, p.475) e §10.6 (sistema de arquivos, ext2/ext3, i-nodes, p.480–491)',
    'Estados do Linux (TASK_RUNNING etc.) e escalonadores posteriores ao livro (CFS, EEVDF): conhecimento consolidado (Silberschatz, documentação do núcleo)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a fotocopiadora.</strong> No UNIX, um processo novo nasce como uma <em>fotocópia</em> do processo que o criou: mesmo conteúdo, mesmas variáveis, mesmos arquivos abertos. Se a cópia deve fazer outra coisa, ela <em>apaga a folha e escreve outro texto por cima</em>. Enquanto isso, o original pode esperar a cópia terminar o serviço.</p>
  <p>Essas três ações são as chamadas <strong>fork</strong> (copiar), <strong>exec</strong> (escrever outro programa por cima) e <strong>wait</strong> (esperar o filho). Quase tudo no Linux é construído com elas.</p>
</div>

<h2>UNIX e Linux em poucas linhas</h2>
<ul>
  <li><strong>UNIX</strong>: criado no fim dos anos 1960 nos Bell Labs (Ken Thompson e Dennis Ritchie), reescrito em <strong>C</strong>, o que o tornou portátil. Gerou várias famílias (System V, BSD) e o padrão <strong>POSIX</strong>.</li>
  <li><strong>Linux</strong>: núcleo escrito por <strong>Linus Torvalds</strong> a partir de 1991, inspirado no MINIX, de código aberto. É um <strong>núcleo monolítico</strong> com <strong>módulos carregáveis</strong> (drivers que entram no núcleo com o sistema rodando).</li>
  <li>Ideia de projeto citada pelo Tanenbaum: <strong>"o pequeno é bonito"</strong>, ou seja, poucas chamadas de sistema simples que se combinam (por exemplo, programas ligados por <strong>pipes</strong>: <code>sort &lt;f | head</code>).</li>
</ul>

<h2>Processos: fork, exec, wait e exit</h2>
<p>Cada processo tem um <strong>PID</strong> (identificador de processo). O criador é o <strong>processo pai</strong>; o criado, o <strong>processo filho</strong>. Os filhos podem ter filhos, formando uma <strong>árvore de processos</strong>. Processos que rodam em segundo plano sem usuário, como o <em>cron</em> (agenda tarefas), são chamados <strong>daemons</strong>.</p>
<table>
  <tr><th>Chamada</th><th>O que faz</th></tr>
  <tr><td><code>pid = fork()</code></td><td>Cria um filho que é uma <strong>cópia exata</strong> do pai (memória, registradores, arquivos abertos). Retorna <strong>duas vezes</strong>: <strong>0 no filho</strong> e o <strong>PID do filho no pai</strong> (ou −1 se falhar). Depois do fork, as alterações de um não aparecem no outro.</td></tr>
  <tr><td><code>execve(nome, argv, envp)</code></td><td><strong>Substitui a imagem de memória</strong> do processo pelo programa indicado. Não cria processo novo: o PID continua o mesmo.</td></tr>
  <tr><td><code>waitpid(pid, &amp;status, opts)</code></td><td>O pai espera um filho terminar (com −1, qualquer filho) e recebe o status de saída.</td></tr>
  <tr><td><code>exit(status)</code></td><td>Termina o processo e devolve um status (0 a 255) ao pai.</td></tr>
</table>
<p>Se o filho termina e o pai ainda não chamou wait, o filho vira um <strong>zumbi</strong>: já não executa, mas seu registro fica na tabela até o pai recolher o status. Os processos também se comunicam por <strong>pipes</strong> (canal de bytes) e por <strong>sinais</strong> (interrupções de software, como SIGKILL, que mata e não pode ser capturado, e SIGSEGV, acesso a endereço inválido).</p>

<figure class="diagrama">
  <svg viewBox="0 0 520 228" style="max-width:640px" role="img" aria-label="Linha do tempo do shell: fork cria o filho, o filho chama exec e vira ls, o pai espera em waitpid até o filho chamar exit">
    <g font-size="13" fill="currentColor">
      <text x="10" y="56" font-weight="bold">Pai (shell)</text>
      <text x="10" y="176" font-weight="bold">Filho</text>
    </g>
    <g stroke-width="3" fill="none">
      <path d="M100 50 H200" style="stroke:var(--azul)"/>
      <path d="M200 50 H390" style="stroke:var(--ambar)" stroke-dasharray="6 5"/>
      <path d="M390 50 H500" style="stroke:var(--azul)"/>
      <path d="M200 50 C215 110 215 170 235 170" style="stroke:var(--azul)"/>
      <path d="M235 170 H270" style="stroke:var(--azul)"/>
      <path d="M270 170 H380" style="stroke:var(--verde)"/>
      <path d="M380 170 C395 140 390 80 390 56" style="stroke:var(--verde)" stroke-dasharray="3 4"/>
    </g>
    <g fill="currentColor">
      <circle cx="200" cy="50" r="5"/><circle cx="270" cy="170" r="5"/><circle cx="380" cy="170" r="5"/><circle cx="390" cy="50" r="5"/>
    </g>
    <g font-size="12" fill="currentColor" text-anchor="middle">
      <text x="200" y="30" font-weight="bold">fork()</text>
      <text x="200" y="16">retorna PID do filho</text>
      <text x="295" y="40" style="fill:var(--ambar)">waitpid(): pai Bloqueado</text>
      <text x="235" y="195">fork retornou 0</text>
      <text x="270" y="215" font-weight="bold">execve("ls")</text>
      <text x="325" y="160" style="fill:var(--verde)">agora é o ls</text>
      <text x="380" y="192" font-weight="bold">exit(0)</text>
      <text x="445" y="16">shell lê o próximo</text>
      <text x="445" y="30">comando</text>
    </g>
  </svg>
  <figcaption>O shell repete este ciclo para cada comando: <strong>fork</strong> cria a cópia, o filho chama <strong>exec</strong> e vira o programa pedido, o pai fica em <strong>waitpid</strong> (Bloqueado) até o filho chamar <strong>exit</strong>.</figcaption>
</figure>

<pre class="codigo"><code>pid = fork();                 /* cria o filho */
if (pid &lt; 0) {
    erro();                   /* sem memória ou tabela cheia */
} else if (pid &gt; 0) {
    waitpid(-1, &amp;status, 0);  /* código do PAI: espera o filho */
} else {
    execve(comando, params, 0); /* código do FILHO: vira outro programa */
}</code></pre>

<h2>Estados de um processo no Linux</h2>
<p>O Linux guarda cada processo (ou thread) numa estrutura do núcleo chamada <strong>task_struct</strong>, que faz o papel do <strong>BDP (PCB)</strong>. Os estados têm nomes próprios, mas mapeiam no modelo da disciplina:</p>
<table>
  <tr><th>Estado no Linux</th><th>Equivale a</th></tr>
  <tr><td><strong>TASK_RUNNING</strong></td><td><strong>Apto</strong> (na fila de execução) <em>ou</em> <strong>Executando</strong>: o Linux usa o mesmo nome para os dois.</td></tr>
  <tr><td><strong>TASK_INTERRUPTIBLE</strong> / <strong>TASK_UNINTERRUPTIBLE</strong></td><td><strong>Bloqueado</strong>, esperando um evento (E/S, semáforo). No segundo, nem sinais o acordam.</td></tr>
  <tr><td><strong>TASK_STOPPED</strong></td><td>Parado por um sinal (ex.: Ctrl+Z envia SIGTSTP), parecido com uma suspensão.</td></tr>
  <tr><td><strong>EXIT_ZOMBIE</strong></td><td>Terminou, mas o pai ainda não chamou wait.</td></tr>
</table>
<p>Os processos à espera de evento ficam numa <strong>fila de espera</strong> (<em>waitqueue</em>); os prontos, na <strong>fila de execução</strong> (<em>runqueue</em>). No Linux, threads são criadas com a chamada <strong>clone</strong> e o escalonamento é feito <strong>por thread</strong> (cada thread tem um TID; as threads de um processo compartilham o mesmo PID).</p>

<h2>Escalonamento no Linux</h2>
<p>O Linux tem <strong>três classes</strong> de threads:</p>
<ol>
  <li><strong>FIFO de tempo real</strong>: maior prioridade e <strong>sem preempção por tempo</strong> (não tem quantum; só perde a CPU para uma thread de tempo real de prioridade maior, ou se bloquear ou ceder a vez).</li>
  <li><strong>Round Robin (circular) de tempo real</strong>: igual, mas com <strong>quantum</strong>; ao esgotá-lo, vai para o fim da fila do seu nível.</li>
  <li><strong>Tempo compartilhado</strong>: as threads comuns.</li>
</ol>
<p>Internamente há <strong>140 níveis</strong>: <strong>0 a 99</strong> para tempo real e <strong>100 a 139</strong> para as threads comuns. <strong>Número menor = prioridade maior.</strong> O usuário ajusta a prioridade estática com <strong>nice</strong>, de <strong>−20 a +19</strong> (padrão 0); só o administrador pode baixar o nice (pedir mais prioridade).</p>
<p>O escalonador descrito no Tanenbaum (núcleo 2.6, chamado <strong>O(1)</strong>) mantém, por CPU, uma runqueue com dois vetores de 140 filas: <strong>ativo</strong> e <strong>expirado</strong>. Escolhe a tarefa de maior prioridade do vetor ativo; quando o quantum dela expira, ela vai para o expirado; quando o ativo esvazia, os vetores trocam de papel (assim ninguém sofre inanição). Prioridades mais altas ganham quantum maior (cerca de 800 ms no nível 100 e 5 ms no 139). Threads que bloqueiam muito (interativas, limitadas por E/S) ganham um <strong>bônus</strong> de até −5 na prioridade dinâmica; as que gastam toda a CPU levam penalidade de até +5.</p>
<p><em>Depois do livro:</em> a partir do núcleo 2.6.23 o O(1) foi trocado pelo <strong>CFS</strong> (<em>Completely Fair Scheduler</em>), que reparte a CPU de forma proporcional ao peso (nice) de cada thread, e na versão 6.6 pelo <strong>EEVDF</strong>. As classes de tempo real e de tempo compartilhado, os níveis 0–139 e o nice continuam; surgiram outras classes (ex.: <strong>SCHED_DEADLINE</strong>, para tarefas com prazo).</p>

<h2>Sistema de arquivos: árvore única, i-nodes e "tudo é arquivo"</h2>
<p>Os arquivos formam <strong>uma única árvore</strong> a partir da raiz <code>/</code>. Outros discos e partições não ganham letra (como C: ou D:): são <strong>montados</strong> num diretório da árvore (ex.: <code>/mnt/pendrive</code>).</p>
<p><strong>"Tudo é arquivo"</strong>: o UNIX usa a mesma interface (open, read, write, close) para quase tudo. Diretórios são arquivos; dispositivos aparecem em <code>/dev</code> como <strong>arquivos especiais de bloco</strong> (discos) e <strong>de caractere</strong> (teclado, impressora, terminal); pipes também são lidos e gravados como arquivos. Um programa que grava em arquivo grava na impressora sem mudar nada.</p>
<h3>O i-node</h3>
<p>Cada arquivo é descrito por um <strong>i-node</strong> (nó-índice), com os <strong>atributos</strong> e os <strong>endereços dos blocos</strong>:</p>
<ul>
  <li>Tipo e bits de proteção (rwx), número de ligações (nomes que apontam para ele), UID e GID do dono, tamanho, horários de acesso, modificação e alteração.</li>
  <li>Endereços dos <strong>12 primeiros blocos</strong> (diretos) e de <strong>3 blocos indiretos</strong>: <strong>simples</strong> (aponta para um bloco cheio de endereços), <strong>duplo</strong> (aponta para blocos de blocos de endereços) e <strong>triplo</strong>.</li>
  <li><strong>O nome do arquivo não fica no i-node.</strong> O nome fica no <strong>diretório</strong>, cuja entrada é basicamente o par <em>(nome, número do i-node)</em>. Por isso o mesmo i-node pode ter vários nomes (ligações estritas, <em>hard links</em>).</li>
</ul>

<figure class="diagrama">
  <svg viewBox="0 0 520 300" style="max-width:640px" role="img" aria-label="Entrada de diretório aponta para o i-node, que tem 12 endereços diretos e ponteiros indiretos simples, duplo e triplo">
    <g font-size="12" fill="currentColor">
      <text x="10" y="22" font-weight="bold">Diretório</text>
      <rect x="10" y="30" width="120" height="26" fill="none" stroke="currentColor"/>
      <text x="18" y="48">relatorio.txt → 42</text>
      <text x="200" y="22" font-weight="bold">i-node 42</text>
      <rect x="200" y="30" width="140" height="250" rx="4" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="210" y="50">tipo + rwx</text>
      <text x="210" y="68">nº de ligações</text>
      <text x="210" y="86">UID, GID</text>
      <text x="210" y="104">tamanho</text>
      <text x="210" y="122">horários</text>
      <line x1="200" y1="132" x2="340" y2="132" style="stroke:var(--azul)"/>
      <text x="210" y="152" font-weight="bold">12 diretos</text>
      <text x="210" y="168" font-size="11">(blocos 0 a 11)</text>
      <line x1="200" y1="180" x2="340" y2="180" style="stroke:var(--azul)"/>
      <text x="210" y="200">indireto simples</text>
      <text x="210" y="230">indireto duplo</text>
      <text x="210" y="260">indireto triplo</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M130 43 H195"/>
      <path d="M340 155 H380"/>
      <path d="M340 196 H380"/>
      <path d="M340 226 H380"/>
      <path d="M340 256 H380"/>
    </g>
    <g font-size="11" fill="currentColor">
      <rect x="382" y="143" width="130" height="22" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <text x="390" y="158">blocos de dados</text>
      <rect x="382" y="184" width="130" height="22" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
      <text x="390" y="199">1 bloco de endereços</text>
      <rect x="382" y="214" width="130" height="22" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
      <text x="390" y="229">2 níveis de endereços</text>
      <rect x="382" y="244" width="130" height="22" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
      <text x="390" y="259">3 níveis de endereços</text>
    </g>
    <text x="260" y="296" font-size="11" text-anchor="middle" fill="currentColor">O nome está no diretório; o i-node guarda atributos e onde estão os blocos.</text>
  </svg>
  <figcaption>Arquivos pequenos usam só os 12 endereços diretos (acesso rápido). Arquivos grandes usam os blocos indiretos.</figcaption>
</figure>

<h3>ext2, ext3 e ext4</h3>
<p>No <strong>ext2</strong>, a partição é dividida em <strong>grupos de blocos</strong>. Cada grupo tem: <strong>superbloco</strong> (dados do sistema de arquivos: nº de i-nodes, de blocos, blocos livres), descritor do grupo, <strong>mapa de bits dos blocos</strong> e <strong>mapa de bits dos i-nodes</strong> (quais estão livres), a tabela de <strong>i-nodes</strong> e os <strong>blocos de dados</strong>. O ext2 tenta pôr os arquivos perto do diretório onde estão, para reduzir o movimento do braço do disco.</p>
<p>O <strong>ext3</strong> é o ext2 com <strong>diário</strong> (<em>journaling</em>): antes de alterar as estruturas, o sistema anota a operação num diário; se faltar energia no meio, basta refazer ou descartar o que está no diário, em vez de verificar o disco inteiro. O <strong>ext4</strong>, padrão atual em muitas distribuições, mantém o diário e passa a usar <em>extents</em> (faixas contíguas de blocos) para arquivos grandes.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: você digita <code>ls</code> no shell.</strong></p>
  <table>
    <tr><th>Momento</th><th>O que acontece</th><th>Estado</th></tr>
    <tr><td>1</td><td>O shell lê a linha e chama <strong>fork()</strong>. Nasce o filho, cópia do shell.</td><td>Shell: Executando. Filho: Apto (TASK_RUNNING).</td></tr>
    <tr><td>2</td><td>O shell chama <strong>waitpid(-1, ...)</strong>.</td><td>Shell: <strong>Bloqueado</strong> (fila de espera).</td></tr>
    <tr><td>3</td><td>O filho é escalonado; o fork retornou 0 nele, então ele chama <strong>execve("/bin/ls", ...)</strong>. O mesmo PID passa a executar o código do ls.</td><td>Filho: Executando.</td></tr>
    <tr><td>4</td><td>O ls abre o diretório: o núcleo procura cada componente do caminho no diretório e, achando o número do i-node, lê o i-node e os blocos.</td><td>Filho alterna entre Executando e Bloqueado (E/S de disco).</td></tr>
    <tr><td>5</td><td>O ls escreve a lista e chama <strong>exit(0)</strong>.</td><td>Filho: <strong>zumbi</strong> por um instante.</td></tr>
    <tr><td>6</td><td>O núcleo acorda o shell, que recebe o status em waitpid; o registro do filho é liberado.</td><td>Shell: Apto → Executando. Filho: não existe mais.</td></tr>
  </table>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>fork não executa outro programa</strong>: só copia o processo. Quem troca o programa é o <strong>exec</strong>, e exec <strong>não cria processo</strong> (o PID não muda).</li>
    <li>O fork <strong>retorna duas vezes</strong>: 0 no filho, PID do filho no pai. É assim que cada um sabe quem é.</li>
    <li>No Linux, <strong>nice maior = prioridade menor</strong> (e nível interno menor = prioridade maior). No Windows (próxima aula) é o contrário: número maior = mais prioridade.</li>
    <li><strong>O nome do arquivo não está no i-node</strong>, e sim na entrada do diretório.</li>
    <li>Zumbi é o filho que <strong>já terminou</strong> e espera o pai chamar wait; não é um processo travado gastando CPU.</li>
  </ul>
</div>
`,
  resumo: 'No UNIX/Linux, processos são criados por fork (cópia do pai; retorna 0 no filho e o PID do filho no pai), trocam de programa com exec (mesmo PID) e o pai espera com wait; filho terminado sem wait vira zumbi. O escalonador tem três classes (FIFO e RR de tempo real, tempo compartilhado), 140 níveis (0–99 tempo real, 100–139 comuns, menor = mais prioritário) e nice de −20 a +19. Os arquivos formam uma árvore única, "tudo é arquivo" (dispositivos em /dev) e cada arquivo é um i-node com atributos e 12 endereços diretos + indireto simples, duplo e triplo; o nome fica no diretório. O ext3 acrescenta diário ao ext2.',
  questoes: [
    {
      id: 'm10-a01-q1',
      enunciado: 'Um processo executa <code>pid = fork();</code>. Quais valores <code>pid</code> recebe no pai e no filho, se a chamada tiver sucesso?',
      alternativas: [
        { texto: 'No pai, o PID do filho; no filho, 0.', correta: true, explicacao: 'Correto. O fork retorna duas vezes. O valor diferente permite que o mesmo código siga caminhos distintos: o pai sabe qual filho criou e o filho sabe que é o filho (e pode descobrir o próprio PID com getpid).' },
        { texto: 'No pai, 0; no filho, o PID do pai.', correta: false, explicacao: 'Está invertido. Quem recebe 0 é o filho. O pai recebe o PID do filho, porque é o pai que precisa desse número (por exemplo, para chamar waitpid nele).' },
        { texto: 'O mesmo PID nos dois, pois o filho é uma cópia exata.', correta: false, explicacao: 'O filho é cópia da memória e dos registradores, mas o valor de retorno do fork é diferente justamente para distinguir os dois. Cada processo também tem PID próprio.' },
        { texto: '−1 nos dois, indicando que agora existem dois processos.', correta: false, explicacao: '−1 indica erro (por exemplo, falta de memória ou tabela de processos cheia), e nesse caso nenhum filho é criado.' },
      ],
    },
    {
      id: 'm10-a01-q2',
      enunciado: 'O que acontece quando um processo chama <code>execve("/bin/ls", ...)</code> com sucesso?',
      alternativas: [
        { texto: 'A imagem de memória do processo é substituída pelo programa ls; o PID continua o mesmo.', correta: true, explicacao: 'Correto. exec não cria processo: ele troca o programa que o processo executa. Por isso o shell faz fork primeiro (para ter um filho) e o filho faz exec.' },
        { texto: 'É criado um processo filho que executa o ls, e o processo original continua.', correta: false, explicacao: 'Isso é o efeito combinado de fork + exec. Sozinho, o exec não cria ninguém: o código antigo some e, se der certo, a chamada nem retorna.' },
        { texto: 'O processo fica bloqueado até o ls terminar.', correta: false, explicacao: 'Esperar o término de outro processo é papel do wait/waitpid, chamado pelo pai.' },
        { texto: 'O ls é carregado como thread dentro do processo atual, ao lado do código antigo.', correta: false, explicacao: 'Threads são criadas com clone (ou bibliotecas como pthreads). O exec descarta o código antigo e coloca o novo programa no lugar.' },
      ],
    },
    {
      id: 'm10-a01-q3',
      enunciado: 'Um processo filho terminou com <code>exit(0)</code>, mas o pai ainda não chamou <code>wait</code>. Em que situação está o filho?',
      alternativas: [
        { texto: 'Zumbi: já não executa, mas seu registro continua na tabela até o pai recolher o status.', correta: true, explicacao: 'Correto. O núcleo guarda o status de saída para entregá-lo ao pai. Quando o pai chama wait, o registro é liberado e o processo deixa de existir.' },
        { texto: 'Bloqueado, esperando o pai.', correta: false, explicacao: 'Bloqueado é quem ainda vai voltar a executar quando um evento ocorrer. O zumbi não executa nunca mais; só sobrou o registro com o status.' },
        { texto: 'Órfão, e será adotado por outro processo.', correta: false, explicacao: 'Órfão é o processo vivo cujo pai morreu antes. Aqui o pai está vivo e quem terminou foi o filho.' },
        { texto: 'Apto, porque o exit devolve o processo à fila de execução.', correta: false, explicacao: 'exit termina o processo. Um processo terminado não volta para a fila de execução.' },
      ],
    },
    {
      id: 'm10-a01-q4',
      enunciado: 'Sobre o escalonamento no Linux, qual afirmação está correta?',
      alternativas: [
        { texto: 'Há níveis 0–99 para tempo real e 100–139 para threads comuns; número menor significa prioridade maior.', correta: true, explicacao: 'Correto. As threads de tempo real (FIFO e RR) ficam sempre acima das de tempo compartilhado. O nice (−20 a +19) ajusta a prioridade das comuns.' },
        { texto: 'Um nice +19 dá a maior prioridade possível a um processo comum.', correta: false, explicacao: 'É o contrário: +19 é a menor prioridade ("ser gentil" com os outros). Valores negativos aumentam a prioridade e só o administrador pode usá-los.' },
        { texto: 'Threads da classe FIFO de tempo real perdem a CPU ao fim de cada quantum.', correta: false, explicacao: 'A classe FIFO de tempo real não tem quantum nem preempção por tempo. Quem tem quantum é a classe Round Robin de tempo real.' },
        { texto: 'O Linux escalona processos inteiros; as threads de um processo dividem uma única entrada na runqueue.', correta: false, explicacao: 'O Linux escalona threads (tarefas criadas por clone). Cada thread tem seu TID e é escalonada separadamente, embora compartilhe o PID.' },
      ],
    },
    {
      id: 'm10-a01-q5',
      enunciado: 'No sistema de arquivos ext do Linux, onde fica o <strong>nome</strong> de um arquivo?',
      alternativas: [
        { texto: 'Na entrada do diretório, que associa o nome ao número do i-node.', correta: true, explicacao: 'Correto. O diretório é uma lista de pares (nome, nº do i-node). Por isso dois nomes podem apontar para o mesmo i-node (hard links), e o i-node conta quantas ligações tem.' },
        { texto: 'No i-node, junto com o tamanho e as permissões.', correta: false, explicacao: 'É a pegadinha clássica. O i-node guarda tipo, permissões, dono, tamanho, horários e endereços dos blocos, mas não o nome.' },
        { texto: 'No superbloco, que lista todos os arquivos da partição.', correta: false, explicacao: 'O superbloco guarda dados gerais do sistema de arquivos (quantidade de i-nodes e blocos, blocos livres), não os nomes dos arquivos.' },
        { texto: 'No primeiro bloco de dados do próprio arquivo.', correta: false, explicacao: 'Os blocos de dados guardam só o conteúdo. O nome é informação do diretório.' },
      ],
    },
    {
      id: 'm10-a01-q6',
      enunciado: 'Um i-node tem 12 endereços diretos e um ponteiro de indireto simples. Os blocos têm 1 KB e cada endereço de disco ocupa 4 bytes. Qual o maior arquivo possível usando só os diretos e o indireto simples?',
      alternativas: [
        { texto: '268 KB', correta: true, explicacao: 'Correto. Um bloco de 1 KB = 1024 bytes cabe 1024 / 4 = 256 endereços. Diretos: 12 blocos × 1 KB = 12 KB. Indireto simples: 256 blocos × 1 KB = 256 KB. Total: 12 + 256 = 268 KB (o mesmo valor do Tanenbaum, p.490).' },
        { texto: '256 KB', correta: false, explicacao: 'Esse é só o que o indireto simples alcança (256 endereços × 1 KB). Faltou somar os 12 KB dos 12 endereços diretos.' },
        { texto: '13 KB', correta: false, explicacao: 'Isso trata o bloco indireto como se fosse um bloco de dados. Ele não guarda dados: guarda 256 endereços de outros blocos.' },
        { texto: '1036 KB', correta: false, explicacao: 'Esse cálculo usa 1024 endereços por bloco (como se cada endereço tivesse 1 byte). Com endereços de 4 bytes, cabem 1024 / 4 = 256 por bloco.' },
      ],
    },
    {
      id: 'm10-a01-q7',
      enunciado: 'O que significa o princípio <strong>"tudo é arquivo"</strong> do UNIX?',
      alternativas: [
        { texto: 'Dispositivos, diretórios e pipes são acessados pela mesma interface de arquivos (open, read, write, close); dispositivos aparecem em /dev.', correta: true, explicacao: 'Correto. Um disco é um arquivo especial de bloco e um terminal ou impressora é um arquivo especial de caractere. O programa usa as mesmas chamadas sem conhecer o dispositivo.' },
        { texto: 'Todo processo é gravado em disco como um arquivo enquanto executa.', correta: false, explicacao: 'Processos ficam na memória. O que pode ir para o disco é a área de troca (swap), e isso não tem relação com o princípio.' },
        { texto: 'O UNIX não tem diretórios, só arquivos numa lista plana.', correta: false, explicacao: 'O UNIX tem uma árvore hierárquica de diretórios a partir de /. Diretórios são arquivos especiais que guardam pares (nome, i-node).' },
        { texto: 'Cada partição recebe uma letra, como um arquivo separado (C:, D:).', correta: false, explicacao: 'Letras de unidade são coisa do Windows. No UNIX há uma árvore única e as partições são montadas em diretórios.' },
      ],
    },
    {
      id: 'm10-a01-q8',
      enunciado: 'Qual a principal diferença do <strong>ext3</strong> em relação ao <strong>ext2</strong>?',
      alternativas: [
        { texto: 'O ext3 tem diário (journaling): registra as operações antes de aplicá-las, para recuperar o sistema rapidamente após uma queda.', correta: true, explicacao: 'Correto. Com o diário, uma falta de energia no meio de uma alteração não deixa as estruturas inconsistentes: basta refazer ou descartar as operações anotadas.' },
        { texto: 'O ext3 abandona os i-nodes e usa uma tabela de alocação como a FAT.', correta: false, explicacao: 'O ext3 é uma continuação do ext2 e mantém i-nodes, grupos de blocos e mapas de bits.' },
        { texto: 'O ext3 permite nomes longos, que o ext2 não permitia.', correta: false, explicacao: 'Nomes longos (até 255 caracteres) já existiam no ext2. A limitação de 14 caracteres era do sistema de arquivos do MINIX, o primeiro do Linux.' },
        { texto: 'O ext3 guarda os nomes dentro dos i-nodes.', correta: false, explicacao: 'Os nomes continuam nas entradas de diretório, tanto no ext2 quanto no ext3.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm10-a01-d1',
      enunciado: 'Explique como um shell do UNIX/Linux executa um comando digitado pelo usuário, citando as chamadas de sistema usadas e o estado do shell e do processo filho em cada etapa.',
      respostaModelo: `<p>O shell lê o comando e chama <strong>fork()</strong>, que cria um processo filho, cópia exata do shell (memória, registradores e arquivos abertos). O fork retorna duas vezes: <strong>0 no filho</strong> e o <strong>PID do filho no pai</strong>, e cada um segue um ramo do código.</p>
<p>O pai (shell) chama <strong>waitpid</strong> e fica <strong>Bloqueado</strong> até o filho terminar. O filho, quando escalonado, chama <strong>exec</strong> (execve) com o nome do programa: a imagem de memória dele é substituída pelo programa pedido, mantendo o mesmo PID. Ele executa (alternando entre Executando, Apto e Bloqueado em E/S) e, ao fim, chama <strong>exit(status)</strong>.</p>
<p>Entre o exit e o wait do pai, o filho fica como <strong>zumbi</strong>. O núcleo então acorda o shell, que passa a Apto, recebe o status em waitpid e volta a ler o próximo comando; o registro do filho é liberado.</p>`,
      pontosChave: [
        'fork cria o filho como cópia do pai, retornando 0 no filho e o PID do filho no pai',
        'O filho chama exec, que substitui o programa sem criar processo novo (mesmo PID)',
        'O pai chama wait/waitpid e fica Bloqueado até o filho terminar',
        'O filho termina com exit e fica zumbi até o pai recolher o status',
      ],
    },
  ],
});
