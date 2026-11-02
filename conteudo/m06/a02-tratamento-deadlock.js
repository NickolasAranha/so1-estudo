// Módulo 6, aula 2: estratégias para tratar deadlocks (avestruz, detecção e recuperação, evitação/banqueiro, prevenção) e inanição.
SO1.registerLesson({
  id: 'm06-a02',
  titulo: 'Tratando deadlocks',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §6.2 (p.274: as quatro estratégias), §6.3 Algoritmo do avestruz (p.274), §6.4 Detecção e recuperação (p.274–278), §6.5 Evitando impasses (p.278–281), §6.6 Prevenção (p.281–283), §6.7 Outras questões: livelock e inanição (p.283–286)',
    'Slides cap3 (Oliveira/Carissimi/Toscani, UFRGS): Estratégias para tratamento de deadlocks',
    'Slides cap4 (Oliveira/Carissimi/Toscani, UFRGS): starvation e aging no escalonamento por prioridades',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a prefeitura e o cruzamento que trava.</strong> A prefeitura tem quatro opções. (1) <strong>Não fazer nada</strong>: o cruzamento trava uma vez por ano, não compensa gastar. (2) <strong>Deixar travar e resolver</strong>: um agente percebe o congestionamento e manda guinchar um carro. (3) <strong>Controlar a entrada</strong>: um guarda só deixa um carro entrar no cruzamento se tiver certeza de que ele consegue sair do outro lado. (4) <strong>Mudar a construção</strong>: fazer uma rotatória de mão única, onde o ciclo de carros parados nunca se forma.</p>
  <p>São exatamente as quatro estratégias para lidar com deadlocks: <strong>ignorar</strong>, <strong>detectar e recuperar</strong>, <strong>evitar</strong> e <strong>prevenir</strong>.</p>
</div>

<h2>As quatro estratégias</h2>
<figure class="diagrama">
  <svg viewBox="0 0 340 360" style="max-width:440px" role="img" aria-label="As quatro estratégias para deadlock e o momento em que cada uma atua">
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <rect x="10" y="10" width="155" height="165" rx="10" style="fill:var(--linha)" stroke="currentColor"/>
      <text x="87" y="36" font-weight="bold" font-size="14">1. Ignorar</text>
      <text x="87" y="54">(avestruz)</text>
      <text x="87" y="82">Não faz nada.</text>
      <text x="87" y="99">Se travar,</text>
      <text x="87" y="116">reinicia.</text>
      <text x="87" y="146" font-size="11">atua:</text>
      <text x="87" y="162" font-size="12" font-weight="bold">nunca</text>

      <rect x="175" y="10" width="155" height="165" rx="10" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="2"/>
      <text x="252" y="36" font-weight="bold" font-size="14">2. Detecção e</text>
      <text x="252" y="54" font-weight="bold" font-size="14">recuperação</text>
      <text x="252" y="82">Deixa ocorrer,</text>
      <text x="252" y="99">procura ciclos</text>
      <text x="252" y="116">e desfaz.</text>
      <text x="252" y="146" font-size="11">atua:</text>
      <text x="252" y="162" font-size="12" font-weight="bold">depois que ocorre</text>

      <rect x="10" y="185" width="155" height="165" rx="10" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="87" y="211" font-weight="bold" font-size="14">3. Evitação</text>
      <text x="87" y="229">(banqueiro)</text>
      <text x="87" y="257">A cada pedido,</text>
      <text x="87" y="274">só concede se o</text>
      <text x="87" y="291">estado for seguro.</text>
      <text x="87" y="321" font-size="11">atua:</text>
      <text x="87" y="337" font-size="12" font-weight="bold">a cada pedido</text>

      <rect x="175" y="185" width="155" height="165" rx="10" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/>
      <text x="252" y="211" font-weight="bold" font-size="14">4. Prevenção</text>
      <text x="252" y="229">(por construção)</text>
      <text x="252" y="257">Nega uma das</text>
      <text x="252" y="274">4 condições de</text>
      <text x="252" y="291">Coffman.</text>
      <text x="252" y="321" font-size="11">atua:</text>
      <text x="252" y="337" font-size="12" font-weight="bold">no projeto do SO</text>
    </g>
    <g stroke="currentColor" stroke-opacity="0.35">
      <line x1="30" y1="130" x2="145" y2="130"/><line x1="195" y1="130" x2="310" y2="130"/>
      <line x1="30" y1="305" x2="145" y2="305"/><line x1="195" y1="305" x2="310" y2="305"/>
    </g>
  </svg>
  <figcaption>As quatro estratégias (Tanenbaum §6.2; slides cap3). Detecção deixa o impasse acontecer; evitação e prevenção impedem que ele aconteça, mas de formas diferentes: a evitação decide pedido a pedido, a prevenção muda as regras do sistema.</figcaption>
</figure>

<h2>1. Algoritmo do avestruz (ignorar)</h2>
<p>"Enterre a cabeça na areia e finja que nada está acontecendo." É uma decisão de <strong>custo x benefício</strong>: se os impasses ocorrem, digamos, uma vez a cada cinco anos, e o sistema já trava toda semana por falhas de hardware, de compilador ou do próprio SO, não vale perder desempenho ou impor restrições incômodas aos processos para eliminá-los. Segundo o Tanenbaum, <strong>a maioria dos SOs, inclusive UNIX e Windows, simplesmente ignora o problema</strong>. Exemplo: a tabela de processos é finita; se ela encher, um <code>fork</code> falha, e dez processos tentando criar filhos sem parar podem travar uns aos outros. O SO aceita esse risco em vez de limitar todo mundo.</p>

<h2>2. Detecção e recuperação</h2>
<p>O SO não tenta impedir os impasses: <strong>monitora os recursos alocados e liberados</strong>, verifica se há impasse e, se houver, age.</p>
<h3>Detecção com um recurso de cada tipo</h3>
<p>Monta o <strong>grafo de alocação</strong> (aula anterior) e procura <strong>ciclos</strong>. Todo processo que está num ciclo está em deadlock.</p>
<h3>Detecção com vários recursos de cada tipo</h3>
<p>Usa vetores e matrizes, para <em>n</em> processos e <em>m</em> classes de recursos:</p>
<ul>
  <li><strong>E</strong> (recursos existentes): total de instâncias de cada classe.</li>
  <li><strong>A</strong> (recursos disponíveis): instâncias livres agora.</li>
  <li><strong>C</strong> (matriz de alocação atual): linha <em>i</em> = o que o processo P<sub>i</sub> possui.</li>
  <li><strong>R</strong> (matriz de requisições): linha <em>i</em> = o que P<sub>i</sub> ainda quer.</li>
</ul>
<p>Para cada classe, alocado + disponível = existente. O algoritmo:</p>
<ol>
  <li>Procure um processo <strong>não marcado</strong> cuja linha em R seja <strong>≤ A</strong> (todos os pedidos podem ser atendidos agora).</li>
  <li>Se achar, suponha que ele termina: <strong>some a linha dele em C ao vetor A</strong> (devolve os recursos), marque-o e volte ao passo 1.</li>
  <li>Se não achar, pare. Os processos <strong>que ficaram sem marca estão em deadlock</strong>.</li>
</ol>
<p><strong>Quando verificar?</strong> A cada pedido de recurso (detecta cedo, mas gasta muita CPU), a cada <em>k</em> minutos, ou quando a utilização da CPU cair abaixo de um limite (muitos processos em impasse deixam a CPU ociosa).</p>
<h3>Recuperação</h3>
<table>
  <tr><th>Técnica</th><th>Como funciona</th><th>Problema</th></tr>
  <tr><td><strong>Preempção</strong></td><td>Toma temporariamente o recurso de um processo e dá a outro (às vezes manualmente: o operador separa as folhas já impressas, suspende o dono e passa a impressora).</td><td>Depende muito da natureza do recurso; muitas vezes é impossível.</td></tr>
  <tr><td><strong>Retrocesso</strong> (rollback)</td><td>Os processos gravam periodicamente <strong>pontos de salvaguarda</strong> (<em>checkpoints</em>: imagem da memória e estado dos recursos). O processo que tem o recurso disputado volta a um checkpoint anterior à aquisição.</td><td>Todo o trabalho feito depois do checkpoint é perdido.</td></tr>
  <tr><td><strong>Eliminação de processos</strong></td><td>"Matar" um ou mais processos do ciclo (ou um fora do ciclo que tenha o recurso necessário) até o ciclo se quebrar. É a forma mais grosseira e mais simples.</td><td>Deve-se escolher um processo que possa ser <strong>reexecutado do início sem efeitos colaterais</strong>: uma compilação pode; um processo que soma 1 a um registro do banco de dados, não (rodar de novo somaria 2).</td></tr>
</table>

<h2>3. Evitação (anulação dinâmica)</h2>
<p>Aqui os processos pedem recursos <strong>um de cada vez</strong>, e o SO decide, a cada pedido, se concedê-lo é seguro. Para isso ele precisa saber <strong>antecipadamente</strong> o máximo de cada recurso que cada processo pode pedir.</p>
<ul>
  <li>Um estado é <strong>seguro</strong> se não está em impasse e existe <strong>alguma ordem de execução</strong> em que todos os processos conseguem terminar, mesmo que cada um peça, de repente, o seu máximo.</li>
  <li>Um estado <strong>inseguro não é um impasse</strong>: os processos ainda podem rodar e, por sorte, liberar recursos antes de pedir mais. A diferença é que, de um estado seguro, o sistema <strong>garante</strong> que todos terminarão; de um inseguro, não há essa garantia.</li>
</ul>
<h3>Algoritmo do banqueiro (Dijkstra, 1965)</h3>
<p>Um banqueiro tem clientes com <strong>linhas de crédito</strong> (o máximo que cada um pode pedir) e sabe que nem todos vão precisar do máximo ao mesmo tempo, então guarda em caixa menos do que a soma das linhas. Os clientes são os <strong>processos</strong>, o dinheiro são os <strong>recursos</strong> e o banqueiro é o <strong>SO</strong>. A cada pedido, ele <strong>simula</strong> a concessão e verifica se o estado resultante é seguro: se for, concede; se não, o pedido é <strong>adiado</strong> (o processo espera).</p>
<p>Com vários tipos de recurso, a verificação de segurança é a mesma do algoritmo de detecção, usando a matriz de <strong>recursos ainda necessários</strong> (máximo − alocado) no lugar de R: procure uma linha ≤ A, suponha que o processo termina e devolve tudo, repita. Se todos forem marcados, o estado é seguro.</p>
<p><strong>Na prática</strong>, o banqueiro é quase inútil: os processos raramente sabem o seu máximo antecipadamente, o número de processos muda o tempo todo e recursos podem sumir (uma unidade de fita quebra). Poucos sistemas o usam.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: banqueiro com um tipo de recurso (Tanenbaum, Fig. 6.9 e 6.10).</strong> Há 10 instâncias no total. "Possui" é o que cada processo tem; "Máx." é o máximo que pode pedir; "Falta" = Máx. − Possui.</p>
  <table>
    <tr><th>Processo</th><th>Possui</th><th>Máx.</th><th>Falta</th></tr>
    <tr><td>A</td><td>3</td><td>9</td><td>6</td></tr>
    <tr><td>B</td><td>2</td><td>4</td><td>2</td></tr>
    <tr><td>C</td><td>2</td><td>7</td><td>5</td></tr>
  </table>
  <p>Disponível = 10 − (3 + 2 + 2) = <strong>3</strong>. Este estado é seguro? Procure uma ordem em que todos terminam:</p>
  <table>
    <tr><th>Passo</th><th>Quem roda</th><th>Por que pode</th><th>Disponível depois</th></tr>
    <tr><td>1</td><td>B recebe 2 e termina</td><td>Falta 2 ≤ 3</td><td>3 − 2 + 4 = <strong>5</strong></td></tr>
    <tr><td>2</td><td>C recebe 5 e termina</td><td>Falta 5 ≤ 5</td><td>5 − 5 + 7 = <strong>7</strong></td></tr>
    <tr><td>3</td><td>A recebe 6 e termina</td><td>Falta 6 ≤ 7</td><td>7 − 6 + 9 = <strong>10</strong></td></tr>
  </table>
  <p>A sequência B, C, A existe: o estado é <strong>seguro</strong>.</p>
  <p><strong>Agora A pede mais 1.</strong> O banqueiro simula: A passaria a ter 4 (falta 5), e o disponível cairia para <strong>2</strong>. Só B cabe (falta 2 ≤ 2): B termina e o disponível vai a 2 − 2 + 4 = <strong>4</strong>. Agora A precisa de 5 e C precisa de 5, e só há 4. Nenhuma ordem garante o fim de todos: o estado seria <strong>inseguro</strong>, então o pedido de A é <strong>adiado</strong>. (Não é um impasse ainda: A poderia liberar algo antes de pedir mais. Mas o banqueiro não aposta.)</p>
  <p><strong>Com vários recursos (Fig. 6.12).</strong> Classes: (fitas, plotters, impressoras, CD-ROM). Existentes E = (6 3 4 2), alocados P = (5 3 2 2), disponíveis A = E − P = (1 0 2 0).</p>
  <table>
    <tr><th>Processo</th><th>Alocados (C)</th><th>Ainda necessários</th></tr>
    <tr><td>A</td><td>3 0 1 1</td><td>1 1 0 0</td></tr>
    <tr><td>B</td><td>0 1 0 0</td><td>0 1 1 2</td></tr>
    <tr><td>C</td><td>1 1 1 0</td><td>3 1 0 0</td></tr>
    <tr><td>D</td><td>1 1 0 1</td><td>0 0 1 0</td></tr>
    <tr><td>E</td><td>0 0 0 0</td><td>2 1 1 0</td></tr>
  </table>
  <p>Verificação: D cabe (0010 ≤ 1020) e devolve 1101 → A = 2121; o processo A (1100) cabe e devolve 3011 → 5132; E (2110) cabe → 5132; B (0112) cabe e devolve 0100 → 5232; C (3100) cabe e devolve 1110 → 6342 = E. Todos marcados: <strong>seguro</strong>.</p>
  <p>Se B pede 1 impressora: B fica com 0110, precisa de 0102, e o disponível vira (1 0 1 0). Ainda é seguro (D, depois A, E, B, C), então o pedido é <strong>atendido</strong>. Se, em seguida, E pede a última impressora: o disponível vira (1 0 0 0) e nenhuma linha de "ainda necessários" cabe (todas precisam de um plotter, de uma impressora ou de mais fitas). Estado inseguro: o pedido de E é <strong>adiado</strong>.</p>
</div>

<h2>4. Prevenção (por construção)</h2>
<p>Como as 4 condições de Coffman são todas necessárias, basta garantir <strong>por construção</strong> que <strong>uma delas nunca seja satisfeita</strong> (Havender, 1968).</p>
<table>
  <tr><th>Condição atacada</th><th>Como</th><th>Problema</th></tr>
  <tr><td><strong>Exclusão mútua</strong></td><td><strong>Spool</strong>: os processos gravam a saída em disco e só um processo, o <em>daemon</em> de impressão, usa a impressora de verdade. Como o daemon não pede outros recursos, não há impasse envolvendo a impressora. Princípio: evitar alocar um recurso quando não for absolutamente necessário.</td><td>Nem todo recurso pode ir para spool; e o próprio espaço do spool em disco pode gerar impasse (dois processos enchendo o spool pela metade).</td></tr>
  <tr><td><strong>Posse e espera</strong></td><td>Exigir que o processo <strong>requisite todos os recursos antes de começar</strong> (tudo ou nada). Variante: para pedir um recurso novo, o processo libera temporariamente tudo o que tem e depois pede tudo de uma vez.</td><td>O processo raramente sabe de tudo que vai precisar; recursos ficam presos sem uso (a impressora reservada por uma hora antes de imprimir).</td></tr>
  <tr><td><strong>Não preempção</strong></td><td><strong>Retomar</strong> recursos alocados, ou virtualizá-los (spool da impressora).</td><td>Tomar uma impressora no meio do trabalho é complicado ou impossível; registros travados de banco de dados não podem ser virtualizados.</td></tr>
  <tr><td><strong>Espera circular</strong></td><td><strong>Ordenar numericamente os recursos</strong> e só permitir pedidos em <strong>ordem crescente</strong> (ex.: 1 impressora, 2 scanner, 3 plotter, 4 fita, 5 CD-ROM). Variante: o processo só pode ter um recurso por vez.</td><td>Pode ser impossível achar uma ordem que satisfaça todos; "um por vez" é inaceitável (copiar de fita para impressora exige os dois).</td></tr>
</table>
<p>Por que a ordenação funciona: se A tem o recurso <em>i</em> e B tem o <em>j</em>, A só pode pedir <em>j</em> se <em>j</em> &gt; <em>i</em>, e B só pode pedir <em>i</em> se <em>i</em> &gt; <em>j</em>. As duas coisas não podem ser verdade ao mesmo tempo, então o ciclo nunca fecha. Das quatro abordagens, é a mais viável em código real: por exemplo, sempre adquirir os locks (mutexes) numa ordem fixa.</p>

<h2>Inanição (starvation) e livelock</h2>
<p><strong>Inanição</strong>: um processo é <strong>preterido indefinidamente</strong> e nunca recebe o recurso, <strong>embora não esteja em impasse</strong>. Exemplo do Tanenbaum: a impressora é sempre dada ao processo com o <strong>menor arquivo</strong>. Parece justo, mas com um fluxo constante de arquivos pequenos o processo com o arquivo grande nunca imprime. Soluções: atender por ordem de chegada (<strong>FIFO</strong>), ou aumentar a prioridade de quem espera há muito tempo (<strong>envelhecimento</strong>, <em>aging</em>, visto no escalonamento por prioridades).</p>
<p><strong>Livelock</strong>: processos que não ficam Bloqueados, mas tentam repetidamente obter recursos (espera ocupada), falham e tentam de novo, sem nunca progredir. Ninguém está bloqueado, mas ninguém avança.</p>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Evitação ≠ prevenção.</strong> O banqueiro é <strong>evitação</strong>: as 4 condições continuam possíveis, e o SO decide pedido a pedido. Prevenção muda as regras para que uma condição nunca ocorra.</li>
    <li><strong>Estado inseguro não é deadlock.</strong> Inseguro = sem garantia de que todos terminem. Todo estado de deadlock é inseguro, mas nem todo estado inseguro leva a deadlock.</li>
    <li><strong>Inanição não é deadlock.</strong> No deadlock há um ciclo de processos bloqueados que não sai do lugar; na inanição o sistema progride, mas um processo específico é sempre passado para trás.</li>
    <li>Na detecção com matrizes, quem fica <strong>sem marca</strong> está em deadlock (e não quem foi marcado).</li>
    <li>Spool ataca a <strong>exclusão mútua</strong>; pedir tudo no início ataca a <strong>posse e espera</strong>; ordenar os recursos ataca a <strong>espera circular</strong>.</li>
  </ul>
</div>
`,
  resumo: 'Há quatro estratégias: ignorar (avestruz, usado por UNIX e Windows), detectar e recuperar (grafo ou matrizes E, A, C, R; recuperação por preempção, retrocesso a checkpoints ou eliminação de processos), evitar (só conceder pedidos que mantenham o estado seguro, como no algoritmo do banqueiro de Dijkstra) e prevenir (negar uma das 4 condições: spool, pedir tudo no início, retomar recursos, ordenar os recursos). Estado inseguro não é deadlock, e inanição (processo preterido indefinidamente, resolvida com FIFO ou aging) também não.',
  questoes: [
    {
      id: 'm06-a02-q1',
      enunciado: 'O que é o "algoritmo do avestruz" no tratamento de deadlocks?',
      alternativas: [
        { texto: 'Ignorar o problema, porque impasses são raros e o custo de eliminá-los (desempenho, restrições aos processos) seria maior que o benefício.', correta: true, explicacao: 'Correto. É a estratégia "ignorar" dos slides. O Tanenbaum observa que a maioria dos SOs, inclusive UNIX e Windows, adota essa postura.' },
        { texto: 'Esconder os recursos dos processos até que todos estejam livres.', correta: false, explicacao: 'Isso lembra a prevenção da posse e espera (pedir tudo de uma vez), não o avestruz. O avestruz não faz nada.' },
        { texto: 'Procurar ciclos no grafo de alocação periodicamente.', correta: false, explicacao: 'Procurar ciclos é detecção. O avestruz justamente não verifica nada.' },
        { texto: 'Simular cada pedido e só concedê-lo se o estado continuar seguro.', correta: false, explicacao: 'Isso é evitação, como no algoritmo do banqueiro.' },
      ],
    },
    {
      id: 'm06-a02-q2',
      enunciado: 'Um sistema tem 10 instâncias de um recurso. Estado atual (possui / máximo): A 1/6, B 1/5, C 2/4, D 4/7; disponível = 2. B pede mais 1 instância. Usando o algoritmo do banqueiro, o que o SO deve fazer?',
      alternativas: [
        { texto: 'Adiar o pedido: após a concessão sobraria 1 instância e nenhum processo conseguiria completar seu máximo, então o estado seria inseguro.', correta: true, explicacao: 'Correto. Simulando: B passa a 2/5 e o disponível cai para 1. O que falta a cada um: A 5, B 3, C 2, D 3. Nenhum cabe em 1, então não existe sequência que garanta o fim de todos (Fig. 6.11c do Tanenbaum). Antes do pedido o estado era seguro: com 2 livres, C terminava, liberava 4 e assim por diante.' },
        { texto: 'Conceder: ainda sobra 1 instância livre, então não há impasse.', correta: false, explicacao: 'O banqueiro não pergunta se há impasse agora, e sim se o estado resultante é seguro. Com 1 livre, ninguém consegue chegar ao máximo: inseguro.' },
        { texto: 'Conceder, porque B pediu menos que o seu máximo.', correta: false, explicacao: 'Pedir dentro do máximo é condição para o pedido ser válido, mas não basta: o banqueiro ainda verifica se o estado continua seguro.' },
        { texto: 'Matar o processo D, que é o que mais possui recursos.', correta: false, explicacao: 'Eliminar processos é recuperação, usada depois que um deadlock é detectado. O banqueiro (evitação) apenas adia o pedido inseguro.' },
      ],
    },
    {
      id: 'm06-a02-q3',
      enunciado: 'Detecção com vários recursos. Classes: (fita, plotter, scanner, CD). Disponível A = (2 1 0 0).<br>Alocação: P1 = (0 0 1 0), P2 = (2 0 0 1), P3 = (0 1 2 0).<br>Requisição: P1 = (2 0 0 1), P2 = (1 0 3 0), P3 = (2 1 0 0).<br>Quais processos estão em deadlock?',
      alternativas: [
        { texto: 'P1 e P2.', correta: true, explicacao: 'Correto. Existentes: E = (4 2 3 1). De início só P3 cabe: (2 1 0 0) ≤ (2 1 0 0). Ele termina e devolve (0 1 2 0), e A = (2 2 2 0). P1 pede 1 CD, mas há 0 livres: o único CD está com P2. P2 pede 3 scanners, mas há só 2 livres: o terceiro está com P1. P1 segura um scanner e espera o CD de P2; P2 segura o CD e espera o scanner de P1. É um ciclo de verdade, e nenhum dos dois pode ser marcado. É uma variação da Fig. 6.7 do Tanenbaum.' },
        { texto: 'Nenhum: todos podem terminar.', correta: false, explicacao: 'Isso valeria para a versão original da Fig. 6.7, em que P2 pedia (1 0 1 0): depois de P3, P2 receberia 1 scanner, terminaria e liberaria o CD para P1. Com P2 pedindo 3 scanners, ele precisa do scanner que está com P1, e P1 precisa do CD que está com P2.' },
        { texto: 'Apenas P3.', correta: false, explicacao: 'P3 é o único que pode ser atendido logo de início, porque sua requisição (2 1 0 0) cabe exatamente em A. Ele termina.' },
        { texto: 'P1, P2 e P3.', correta: false, explicacao: 'P3 pode terminar, pois sua requisição cabe no disponível. Só ficam sem marca P1 e P2, que esperam um pelo outro (CD e scanner).' },
      ],
    },
    {
      id: 'm06-a02-q4',
      enunciado: 'Sobre estados seguros e inseguros, é correto afirmar:',
      alternativas: [
        { texto: 'Um estado inseguro não é necessariamente um deadlock; ele apenas não garante que todos os processos terminarão.', correta: true, explicacao: 'Correto. De um estado inseguro, os processos ainda podem rodar e talvez liberar recursos antes de pedir mais. De um estado seguro, o sistema garante que todos terminam.' },
        { texto: 'Todo estado inseguro é um deadlock.', correta: false, explicacao: 'O Tanenbaum destaca que não: a partir de um estado inseguro o sistema pode continuar rodando por um tempo, e um processo pode liberar recursos antes de pedir outros.' },
        { texto: 'Um estado é seguro se há recursos livres suficientes para atender ao máximo de todos os processos ao mesmo tempo.', correta: false, explicacao: 'Basta existir uma ordem em que os processos terminam um de cada vez, cada um devolvendo seus recursos. Não é preciso atender todos simultaneamente.' },
        { texto: 'Um estado seguro pode conter processos em deadlock, desde que haja recursos livres.', correta: false, explicacao: 'Por definição, um estado seguro não está em situação de impasse.' },
      ],
    },
    {
      id: 'm06-a02-q5',
      enunciado: 'O algoritmo do banqueiro pertence a qual estratégia de tratamento de deadlocks?',
      alternativas: [
        { texto: 'Evitação: impedir o impasse cuidando de cada alocação de recurso.', correta: true, explicacao: 'Correto. Nos slides: "impedir ocorrência cuidando na alocação de recursos: algoritmo do banqueiro". As 4 condições continuam possíveis; o SO só recusa os pedidos que levariam a um estado inseguro.' },
        { texto: 'Prevenção: negar uma das quatro condições de Coffman.', correta: false, explicacao: 'Pegadinha clássica. Prevenção muda as regras do sistema (spool, ordenar recursos...). O banqueiro não elimina nenhuma condição; decide pedido a pedido.' },
        { texto: 'Detecção e recuperação.', correta: false, explicacao: 'Detecção deixa o deadlock acontecer e depois o desfaz. O banqueiro age antes, recusando pedidos perigosos.' },
        { texto: 'Algoritmo do avestruz.', correta: false, explicacao: 'O avestruz ignora o problema. O banqueiro faz uma verificação a cada pedido, o que é o oposto de ignorar.' },
      ],
    },
    {
      id: 'm06-a02-q6',
      enunciado: 'Um sistema exige que cada processo requisite <strong>todos</strong> os recursos de que vai precisar antes de iniciar a execução. Qual condição de deadlock está sendo atacada e qual é a desvantagem?',
      alternativas: [
        { texto: 'Posse e espera; recursos ficam reservados sem uso por muito tempo, e o processo nem sempre sabe de antemão do que vai precisar.', correta: true, explicacao: 'Correto. Se o processo já tem tudo antes de começar, ele nunca fica segurando algo enquanto espera outro recurso. O custo é desperdício: a impressora fica presa por uma hora enquanto o processo ainda lê a fita.' },
        { texto: 'Exclusão mútua; dois processos passam a usar o mesmo recurso ao mesmo tempo.', correta: false, explicacao: 'Atacar a exclusão mútua seria permitir compartilhar o recurso (por exemplo, com spool). Pedir tudo no início não muda o fato de cada recurso ter um só dono.' },
        { texto: 'Espera circular; é preciso numerar todos os recursos.', correta: false, explicacao: 'Numerar os recursos e pedir em ordem crescente é a técnica contra espera circular. Aqui a regra é pedir tudo de uma vez.' },
        { texto: 'Não preempção; o SO passa a tomar recursos à força.', correta: false, explicacao: 'A regra descrita não retira recursos de ninguém; ela só obriga a pedir tudo antes de começar.' },
      ],
    },
    {
      id: 'm06-a02-q7',
      enunciado: 'Os recursos recebem números (1 impressora, 2 scanner, 3 plotter, 4 fita) e um processo só pode pedir recursos em ordem crescente. Que condição isso elimina?',
      alternativas: [
        { texto: 'Espera circular.', correta: true, explicacao: 'Correto. Se A tem i e B tem j, A só pode pedir j se j > i, e B só pode pedir i se i > j. Os dois não podem ser verdade, então nenhum ciclo se forma.' },
        { texto: 'Exclusão mútua.', correta: false, explicacao: 'Cada recurso continua tendo um só dono. Quem ataca a exclusão mútua é o spool.' },
        { texto: 'Posse e espera.', correta: false, explicacao: 'O processo ainda pode segurar o recurso 1 e esperar pelo 3. O que muda é que ele nunca pede um número menor que o que já tem, e isso impede o ciclo.' },
        { texto: 'Não preempção.', correta: false, explicacao: 'Nenhum recurso é retirado à força. A regra só restringe a ordem dos pedidos.' },
      ],
    },
    {
      id: 'm06-a02-q8',
      enunciado: 'Um deadlock foi detectado. Para eliminar processos e quebrar o ciclo, qual é o melhor candidato a vítima?',
      alternativas: [
        { texto: 'Um processo que possa ser reexecutado desde o início sem efeitos colaterais, como uma compilação.', correta: true, explicacao: 'Correto. A compilação só lê o fonte e gera o objeto, então rodá-la de novo dá o mesmo resultado. Matar um processo que atualiza um banco de dados pode deixar o registro incrementado duas vezes ao reexecutar.' },
        { texto: 'Um processo que soma 1 a um registro do banco de dados.', correta: false, explicacao: 'É o contraexemplo do Tanenbaum: se ele já tiver somado e for reexecutado, o registro fica com 2 em vez de 1.' },
        { texto: 'Sempre o processo mais antigo do sistema.', correta: false, explicacao: 'A idade não é o critério principal. Matar o mais antigo costuma desperdiçar mais trabalho. O ideal é que a vítima libere o recurso necessário e possa ser reexecutada com segurança.' },
        { texto: 'Qualquer processo, mesmo fora do ciclo, desde que não tenha recursos.', correta: false, explicacao: 'Um processo fora do ciclo só ajuda se tiver um recurso de que o ciclo precisa. Matar quem não tem recursos não libera nada.' },
      ],
    },
    {
      id: 'm06-a02-q9',
      enunciado: 'A impressora é sempre entregue ao processo com o menor arquivo. Com uma chegada constante de arquivos pequenos, um processo com um arquivo enorme nunca imprime. Esse problema é:',
      alternativas: [
        { texto: 'Inanição (starvation), resolvida atendendo por ordem de chegada (FIFO) ou com envelhecimento (aging).', correta: true, explicacao: 'Correto. É o exemplo do Tanenbaum (§6.7.4). O processo não está em impasse: o sistema progride, mas ele é sempre preterido. Atender por ordem de chegada garante que o mais antigo seja o próximo.' },
        { texto: 'Deadlock, porque o processo fica esperando para sempre.', correta: false, explicacao: 'Esperar para sempre não basta para ser deadlock. Não há ciclo de processos segurando recursos uns dos outros; a impressora é liberada e entregue a outros o tempo todo.' },
        { texto: 'Livelock, porque o processo fica em espera ocupada.', correta: false, explicacao: 'No livelock os processos tentam ativamente e falham sem parar (sem ficar bloqueados). Aqui o processo está apenas na fila, sendo sempre passado para trás.' },
        { texto: 'Condição de corrida na impressora.', correta: false, explicacao: 'Condição de corrida é acesso simultâneo que corrompe dados. Aqui a impressora é usada por um processo de cada vez; o problema é a política de escolha.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm06-a02-d1',
      enunciado: 'Quais são as estratégias para tratamento de deadlocks? Explique cada uma.',
      respostaModelo: `<p>São quatro:</p>
<ol>
  <li><strong>Ignorar (algoritmo do avestruz)</strong>: o SO não faz nada, porque impasses são raros e o custo de tratá-los (desempenho, restrições) seria maior que o benefício. É o que fazem a maioria dos SOs, como UNIX e Windows.</li>
  <li><strong>Detecção e recuperação</strong>: o SO deixa o impasse ocorrer, monitora os recursos alocados e liberados e procura deadlocks (ciclos no grafo de alocação, ou o algoritmo com as matrizes de alocação e de requisição). Ao encontrar, recupera por <strong>preempção</strong> do recurso, por <strong>retrocesso</strong> a um ponto de salvaguarda (checkpoint) ou pela <strong>eliminação de processos</strong> até quebrar o ciclo.</li>
  <li><strong>Evitação</strong>: o SO cuida de cada alocação, concedendo um pedido só se o estado resultante for <strong>seguro</strong> (existe uma ordem em que todos terminam). O exemplo é o <strong>algoritmo do banqueiro</strong> (Dijkstra), que exige conhecer antecipadamente o máximo de recursos de cada processo.</li>
  <li><strong>Prevenção</strong>: o sistema é construído de modo que pelo menos uma das 4 condições nunca ocorra: spool (exclusão mútua), pedir todos os recursos no início (posse e espera), retomar recursos (não preempção) ou ordenar numericamente os recursos (espera circular).</li>
</ol>`,
      pontosChave: [
        'Ignorar / algoritmo do avestruz, com a justificativa de custo x frequência',
        'Detecção e recuperação, citando pelo menos uma forma de recuperação (preempção, retrocesso ou eliminação de processos)',
        'Evitação com estado seguro e algoritmo do banqueiro',
        'Prevenção negando pelo menos uma das 4 condições, com exemplo de técnica',
      ],
    },
    {
      id: 'm06-a02-d2',
      enunciado: 'Diferencie prevenção e evitação de deadlocks e explique como a prevenção pode atacar cada uma das quatro condições.',
      respostaModelo: `<p><strong>Prevenção</strong> impede o deadlock <strong>por construção</strong>: as regras do sistema garantem que uma das quatro condições de Coffman nunca seja satisfeita, então o impasse é estruturalmente impossível. <strong>Evitação</strong> não elimina nenhuma condição; o SO analisa <strong>cada pedido</strong> em tempo de execução e só o concede se o sistema continuar em estado seguro (algoritmo do banqueiro), o que exige saber de antemão o máximo que cada processo vai pedir.</p>
<p>Prevenção por condição:</p>
<ul>
  <li><strong>Exclusão mútua</strong>: usar spool, de modo que só o daemon acesse a impressora real.</li>
  <li><strong>Posse e espera</strong>: exigir que o processo peça todos os recursos antes de começar (ou libere tudo o que tem antes de pedir algo novo).</li>
  <li><strong>Não preempção</strong>: permitir retomar recursos ou virtualizá-los; difícil para impressoras e registros de banco de dados.</li>
  <li><strong>Espera circular</strong>: numerar os recursos e só permitir pedidos em ordem crescente.</li>
</ul>`,
      pontosChave: [
        'Prevenção: nega uma condição por construção (impasse estruturalmente impossível)',
        'Evitação: decide pedido a pedido mantendo o estado seguro (banqueiro), exigindo conhecer o máximo antecipadamente',
        'Exclusão mútua com spool e posse e espera pedindo tudo no início',
        'Não preempção retomando recursos e espera circular com ordenação numérica',
      ],
    },
  ],
});
