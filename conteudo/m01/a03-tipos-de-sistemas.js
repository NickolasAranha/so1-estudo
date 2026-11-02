// Módulo 1, aula 3: classificações de SO, on-line x batch, tempo real, distribuídos, paralelos, SMP x AMP, zoológico.
SO1.registerLesson({
  id: 'm01-a03',
  titulo: 'Tipos de sistemas operacionais',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §1.4 (p.20–22)',
    'Tanenbaum, SO Modernos 3ª ed., introdução do cap. 8 e §8.1, §8.1.2 (p.324–325, 331–333)',
    'Slides cap1 (Oliveira/Carissimi/Toscani, UFRGS): mono/multiusuário, mono/multitarefa, distribuídos, tempo real, paralelos, SMP',
    'Machado & Maia, Arquitetura de SO (processamento batch e on-line, conhecimento consolidado)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: tipos de cozinha.</strong> Um food truck com um cozinheiro que faz um prato de cada vez é <em>monotarefa</em>; se ele alterna entre várias panelas, é <em>multitarefa</em>. Uma cozinha industrial com vários cozinheiros dividindo <em>a mesma despensa</em> é um sistema <em>fortemente acoplado</em>. Uma rede de franquias em cidades diferentes, cada uma com sua despensa, que se falam por telefone, é um sistema <em>fracamente acoplado</em>. E uma pizzaria que garante "30 minutos ou é de graça" trabalha em <em>tempo real</em>: não basta acertar a pizza, tem que acertar o prazo.</p>
</div>

<p>Não existe uma classificação única de SOs. Cada critério responde a uma pergunta diferente, e o mesmo sistema entra em várias categorias ao mesmo tempo.</p>

<h2>Quantos usuários? Monousuário x multiusuário</h2>
<ul>
  <li><strong>Monousuário</strong>: projetado para ser usado por um único usuário. Ex.: MS-DOS, Windows 3.x, 9x e ME.</li>
  <li><strong>Multiusuário</strong>: suporta várias sessões de usuários no mesmo computador, com proteção entre elas. Ex.: UNIX, Windows NT/2000.</li>
</ul>

<h2>Quantas tarefas? Monotarefa x multitarefa</h2>
<ul>
  <li><strong>Monotarefa</strong>: executa uma tarefa de cada vez. Ex.: MS-DOS.</li>
  <li><strong>Multitarefa</strong>: executa várias tarefas "simultaneamente" (com uma CPU, revezando). Existem dois tipos:
    <ul>
      <li><strong>Cooperativa</strong>: o programa é quem <em>devolve</em> a CPU voluntariamente. Se ele travar em um laço, trava o sistema. Ex.: Windows 3.x e aplicativos de 16 bits do Windows 9x.</li>
      <li><strong>Preemptiva</strong>: o SO <em>retira</em> a CPU do programa (usando o temporizador). Ex.: UNIX, Windows NT, OS/2 e aplicativos de 32 bits do Windows 9x.</li>
    </ul>
  </li>
</ul>

<h2>Como o trabalho é processado? Batch x on-line</h2>
<table>
  <tr><th></th><th>Processamento em lote (batch)</th><th>Processamento on-line</th></tr>
  <tr><td>Interação</td><td>Nenhuma: os jobs são submetidos e executados depois, sem o usuário acompanhar.</td><td>O usuário está <strong>conectado diretamente</strong> ao sistema por um terminal e interage com ele.</td></tr>
  <tr><td>Quando os dados são processados</td><td>Acumulados e processados todos juntos, de uma vez.</td><td><strong>No momento em que a transação ocorre</strong>; os dados ficam atualizados na hora.</td></tr>
  <tr><td>Critério importante</td><td>Throughput (volume processado).</td><td>Tempo de resposta.</td></tr>
  <tr><td>Aplicações</td><td>Folha de pagamento, faturamento de fim de mês, relatórios, backup noturno.</td><td>Caixa eletrônico e transações bancárias, reservas de passagens aéreas, ponto de venda em supermercado, consultas a bancos de dados, comércio eletrônico.</td></tr>
</table>
<p>O Tanenbaum chama esse tipo de serviço de <strong>processamento de transações</strong>: muitas requisições pequenas, centenas ou milhares por segundo (ex.: verificações em um banco, reservas aéreas). Os sistemas de tempo compartilhado também são chamados de sistemas on-line, porque o usuário interage com o programa pelo terminal. O termo "on-line" já aparecia na 2ª geração, por oposição a "off-line": impressão feita num computador <em>não conectado</em> ao principal.</p>

<h2>Prazos: sistemas de tempo real</h2>
<p>Nos sistemas de <strong>tempo real</strong>, o <strong>tempo é um parâmetro fundamental</strong>: a resposta tem de sair dentro de um intervalo definido. Uma resposta certa fora do prazo é uma resposta errada. A noção de "tempo" depende da aplicação: milissegundos, minutos ou horas. São usados em controle de processos industriais, experimentos científicos, imagens médicas, aviônica.</p>
<ul>
  <li><strong>Tempo real crítico</strong> (<em>hard real time</em>): a ação <strong>precisa</strong> ocorrer no instante certo; perder o prazo causa falha ou dano. Ex.: robô soldador em linha de montagem (soldar cedo ou tarde demais estraga o carro), aviônica, controle industrial, aplicações militares.</li>
  <li><strong>Tempo real não crítico</strong> (<em>soft real time</em>): perder um prazo de vez em quando não é desejável, mas é aceitável e não causa dano permanente. Ex.: áudio digital, multimídia, telefones digitais.</li>
</ul>

<h2>Timesharing x sistemas distribuídos</h2>
<table>
  <tr><th></th><th>Tempo compartilhado (timesharing)</th><th>Sistema distribuído</th></tr>
  <tr><td>Hardware</td><td><strong>Um</strong> computador.</td><td><strong>Vários</strong> computadores autônomos interconectados.</td></tr>
  <tr><td>Ideia</td><td>Vários usuários, cada um num terminal, dividem a CPU em fatias de tempo; cada um tem a ilusão de máquina dedicada.</td><td>A realização de uma tarefa é distribuída entre os computadores; o software dá uma <strong>visão única</strong> do sistema (<strong>transparência</strong>).</td></tr>
  <tr><td>Comunicação</td><td>Memória do próprio computador.</td><td>Troca de mensagens pela rede.</td></tr>
  <tr><td>Vantagens</td><td>Interatividade, tempo de resposta baixo, depuração rápida, custo da máquina dividido entre os usuários.</td><td>Compartilhamento de recursos, balanceamento de carga, maior confiabilidade (se uma máquina cai, as outras continuam).</td></tr>
</table>
<p>A frase de Leslie Lamport citada nos slides brinca com a transparência: "um sistema distribuído é aquele em que a falha de um computador que você nem sabia que existia pode tornar o seu computador inutilizável".</p>

<h2>Mais de um processador: fortemente x fracamente acoplados</h2>
<ul>
  <li><strong>Fortemente acoplados</strong> (<em>tightly coupled</em>), também chamados <strong>sistemas paralelos</strong> ou multiprocessadores: os processadores <strong>compartilham a memória e um relógio comum</strong>, e a comunicação é feita <strong>pela memória</strong>. Há um único SO. Vantagens: maior throughput (mais processos executados), economia (compartilham memória, periféricos e gabinete) e maior confiabilidade, com degradação gradual (<em>graceful degradation</em>, <em>fail-soft</em>): se um processador falha, os outros continuam, só que mais devagar.</li>
  <li><strong>Fracamente acoplados</strong> (<em>loosely coupled</em>): <strong>máquinas independentes</strong>, cada uma com sua própria memória (e seu próprio SO), que se comunicam por <strong>troca de mensagens</strong> pela rede. Os sistemas distribuídos e as redes de computadores são fracamente acoplados.</li>
</ul>
<p>O Tanenbaum (Fig. 8.1) compara três modelos em números: acessar uma palavra num <strong>multiprocessador de memória compartilhada</strong> leva de 2 a 50 ns; mandar uma mensagem num <strong>multicomputador</strong> (cada CPU com sua memória privada, ligadas por uma interconexão de alta velocidade, normalmente na mesma sala), de 10 a 50 µs; num <strong>sistema distribuído</strong> pela Internet, de 10 a 50 ms. São cerca de três ordens de grandeza entre cada um. O multicomputador muda de categoria conforme a fonte: pelos slides, é <strong>fracamente acoplado</strong> (não compartilha memória e troca mensagens); pelo Tanenbaum, é <strong>fortemente acoplado</strong>, em contraste com o sistema distribuído.</p>
<div class="atencao">
  <p><strong>Duas definições de "fortemente acoplado".</strong> Os slides da disciplina usam o critério <strong>memória compartilhada x troca de mensagens</strong>, e é essa a resposta esperada na prova. O Tanenbaum (cap. 8, p.325) usa um critério de <strong>escala e latência da interconexão</strong>: chama de fortemente acoplados tanto os multiprocessadores quanto os multicomputadores (Fig. 8.1b), e reserva "fracamente acoplado" para os sistemas distribuídos, ligados por rede de longa distância. Se a questão citar o Tanenbaum ou multicomputadores, mencione as duas visões.</p>
</div>

<figure class="diagrama">
  <svg viewBox="0 0 420 225" style="max-width:600px" role="img" aria-label="Fortemente acoplado: CPUs ligadas a uma memória compartilhada. Fracamente acoplado: computadores com memória própria ligados por uma rede.">
    <g font-size="13" fill="currentColor" text-anchor="middle">
      <text x="100" y="18" font-weight="bold">Fortemente acoplado</text>
      <rect x="50" y="95" width="100" height="50" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="100" y="116" font-size="12">Memória</text>
      <text x="100" y="133" font-size="12">compartilhada</text>
      <g fill="none" stroke="currentColor">
        <rect x="5" y="35" width="46" height="30" rx="4"/><rect x="149" y="35" width="46" height="30" rx="4"/>
        <rect x="5" y="175" width="46" height="30" rx="4"/><rect x="149" y="175" width="46" height="30" rx="4"/>
        <path d="M45 65 L62 95 M155 65 L138 95 M45 175 L62 145 M155 175 L138 145"/>
      </g>
      <text x="28" y="55">CPU</text><text x="172" y="55">CPU</text><text x="28" y="195">CPU</text><text x="172" y="195">CPU</text>

      <text x="320" y="18" font-weight="bold">Fracamente acoplado</text>
      <ellipse cx="320" cy="120" rx="40" ry="22" fill="none" style="stroke:var(--verde)" stroke-width="2"/>
      <text x="320" y="125">Rede</text>
      <g fill="none" stroke="currentColor">
        <rect x="222" y="35" width="62" height="40" rx="4"/><rect x="356" y="35" width="62" height="40" rx="4"/>
        <rect x="222" y="165" width="62" height="40" rx="4"/><rect x="356" y="165" width="62" height="40" rx="4"/>
        <path d="M280 75 L298 102 M360 75 L342 102 M280 165 L298 138 M360 165 L342 138"/>
      </g>
      <g font-size="11"><text x="253" y="52">CPU +</text><text x="253" y="67">memória</text><text x="387" y="52">CPU +</text><text x="387" y="67">memória</text>
      <text x="253" y="182">CPU +</text><text x="253" y="197">memória</text><text x="387" y="182">CPU +</text><text x="387" y="197">memória</text></g>
    </g>
  </svg>
  <figcaption>À esquerda, as CPUs conversam pela memória comum (um só SO). À direita, cada máquina tem sua memória e as máquinas conversam por mensagens na rede.</figcaption>
</figure>

<h2>Multiprocessadores: SMP x AMP</h2>
<p>Dentro de um sistema fortemente acoplado, há duas formas de organizar o SO entre as CPUs:</p>
<table>
  <tr><th></th><th>AMP: multiprocessamento assimétrico (mestre-escravo)</th><th>SMP: multiprocessamento simétrico</th></tr>
  <tr><td>Quem executa o SO</td><td>Só a CPU <strong>mestre</strong>. As chamadas de sistema de todas as CPUs são redirecionadas para ela.</td><td><strong>Qualquer CPU</strong>. Há uma cópia do SO na memória e todas as CPUs são iguais (os slides dizem que cada processador executa uma cópia idêntica do SO).</td></tr>
  <tr><td>Papel das CPUs</td><td>Cada processador tem uma tarefa específica: o mestre aloca as tarefas aos escravos, que executam processos de usuário (o mestre também roda processos de usuário quando sobra tempo de CPU).</td><td>Todos fazem tudo; processos e memória são balanceados dinamicamente.</td></tr>
  <tr><td>Vantagem</td><td>Simples; não há duas CPUs mexendo nas tabelas do SO ao mesmo tempo.</td><td>Sem gargalo de mestre; vários processos rodam em paralelo sem perda de desempenho.</td></tr>
  <tr><td>Problema</td><td>O mestre vira <strong>gargalo</strong> com muitas CPUs. Se 10% do tempo é gasto em chamadas de sistema, 10 CPUs já saturam o mestre.</td><td>Duas CPUs podem executar o código do SO ao mesmo tempo e pegar o mesmo processo; é preciso sincronização (mutex, regiões críticas dentro do SO).</td></tr>
</table>
<p>A maioria dos SOs atuais (Windows, Linux) é SMP e aproveita as várias CPUs com <strong>multithreading</strong> (Módulo 4).</p>

<figure class="diagrama">
  <svg viewBox="0 0 280 300" style="max-width:420px" role="img" aria-label="AMP: uma CPU mestre executa o SO e três escravas executam processos. SMP: quatro CPUs iguais executam o SO e processos.">
    <g font-size="12" fill="currentColor" text-anchor="middle">
      <text x="140" y="16" font-weight="bold">AMP (mestre-escravo)</text>
      <rect x="10" y="28" width="58" height="50" rx="4" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="2"/>
      <text x="39" y="48">Mestre</text><text x="39" y="64">roda SO</text>
      <g fill="none" stroke="currentColor"><rect x="76" y="28" width="58" height="50" rx="4"/><rect x="142" y="28" width="58" height="50" rx="4"/><rect x="208" y="28" width="58" height="50" rx="4"/></g>
      <text x="105" y="48">Escrava</text><text x="105" y="64">usuário</text>
      <text x="171" y="48">Escrava</text><text x="171" y="64">usuário</text>
      <text x="237" y="48">Escrava</text><text x="237" y="64">usuário</text>
      <path d="M39 78 V96 H237 V78 M105 96 V78 M171 96 V78" fill="none" style="stroke:var(--ambar)" stroke-dasharray="4 3"/>
      <text x="140" y="114" font-size="11">chamadas de sistema vão todas para o mestre</text>

      <text x="140" y="170" font-weight="bold">SMP (simétrico)</text>
      <g style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"><rect x="10" y="182" width="58" height="54" rx="4"/><rect x="76" y="182" width="58" height="54" rx="4"/><rect x="142" y="182" width="58" height="54" rx="4"/><rect x="208" y="182" width="58" height="54" rx="4"/></g>
      <text x="39" y="200">CPU</text><text x="39" y="215" font-size="11">SO e</text><text x="39" y="228" font-size="11">usuário</text>
      <text x="105" y="200">CPU</text><text x="105" y="215" font-size="11">SO e</text><text x="105" y="228" font-size="11">usuário</text>
      <text x="171" y="200">CPU</text><text x="171" y="215" font-size="11">SO e</text><text x="171" y="228" font-size="11">usuário</text>
      <text x="237" y="200">CPU</text><text x="237" y="215" font-size="11">SO e</text><text x="237" y="228" font-size="11">usuário</text>
      <text x="140" y="262" font-size="11">todas iguais; qualquer uma executa o SO</text>
      <text x="140" y="278" font-size="11">(precisa de mutex nas tabelas do SO)</text>
    </g>
  </svg>
  <figcaption>No AMP só o mestre executa o SO; no SMP qualquer CPU executa o SO.</figcaption>
</figure>

<h2>O zoológico de sistemas operacionais (Tanenbaum §1.4)</h2>
<table>
  <tr><th>Tipo</th><th>Característica</th><th>Exemplos</th></tr>
  <tr><td>Computadores de grande porte</td><td>Muita E/S; oferecem lote, processamento de transações e tempo compartilhado.</td><td>OS/390 (descendente do OS/360)</td></tr>
  <tr><td>Servidores</td><td>Servem vários usuários pela rede (arquivos, impressão, Web).</td><td>Solaris, FreeBSD, Linux, Windows Server</td></tr>
  <tr><td>Multiprocessadores</td><td>Várias CPUs num único sistema; variações dos SOs de servidores.</td><td>Windows, Linux em máquinas multinúcleo</td></tr>
  <tr><td>Computadores pessoais</td><td>Multiprogramação para um único usuário.</td><td>Linux, FreeBSD, Windows, Mac OS</td></tr>
  <tr><td>Portáteis (PDA, celular)</td><td>Pequenos, com telefonia, fotografia e aplicativos de terceiros.</td><td>Symbian OS, Palm OS</td></tr>
  <tr><td>Embarcados</td><td>Controlam aparelhos; não aceitam software instalado pelo usuário (tudo em ROM).</td><td>QNX, VxWorks</td></tr>
  <tr><td>Nós sensores</td><td>Minúsculos, a bateria, dirigidos por eventos, comunicação sem fio.</td><td>TinyOS</td></tr>
  <tr><td>Tempo real</td><td>Tempo como parâmetro fundamental; crítico ou não crítico.</td><td>e-Cos</td></tr>
  <tr><td>Cartões inteligentes</td><td>Muito restritos em energia e memória; alguns rodam Java (JVM).</td><td>Sistemas proprietários</td></tr>
</table>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: classificando sistemas reais.</strong> Para cada sistema, pergunte: quantos usuários? quantas tarefas? há interação? há prazo? quantos processadores e como se comunicam?</p>
  <table>
    <tr><th>Sistema</th><th>Classificação</th><th>Por quê</th></tr>
    <tr><td>Caixa eletrônico do banco</td><td>Processamento on-line (transações)</td><td>O saque atualiza o saldo na hora, com o cliente esperando a resposta.</td></tr>
    <tr><td>Folha de pagamento rodada de madrugada</td><td>Lote (batch)</td><td>Os dados do mês são acumulados e processados juntos, sem ninguém interagindo.</td></tr>
    <tr><td>Controle do airbag de um carro</td><td>Tempo real crítico, embarcado</td><td>Abrir o airbag atrasado é falha grave; o software vem de fábrica.</td></tr>
    <tr><td>Chamada de vídeo</td><td>Tempo real não crítico</td><td>Um quadro perdido incomoda, mas não causa dano.</td></tr>
    <tr><td>Servidor Linux com 3 pessoas conectadas por SSH</td><td>Multiusuário e multitarefa preemptiva</td><td>Várias sessões ao mesmo tempo, e o SO retira a CPU de quem demora.</td></tr>
    <tr><td>Notebook com processador de 4 núcleos</td><td>Fortemente acoplado, SMP</td><td>Os núcleos compartilham a mesma memória, e qualquer um executa o SO.</td></tr>
    <tr><td>Busca do Google em milhares de servidores</td><td>Distribuído, fracamente acoplado</td><td>Máquinas independentes trocam mensagens, e o usuário vê um serviço só.</td></tr>
  </table>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>On-line não é sinônimo de sistema distribuído nem de Internet.</strong> On-line quer dizer que o usuário interage e a transação é processada na hora. Responder "SO distribuído" para a pergunta sobre processamento on-line é um erro conhecido.</li>
    <li><strong>Tempo real não é "rápido"</strong>; é <strong>cumprir prazos</strong> de forma previsível. Um prazo de horas também pode ser tempo real.</li>
    <li><strong>Multiusuário implica multitarefa</strong>, mas o contrário não vale: o Windows 95 é multitarefa e monousuário.</li>
    <li>Fortemente acoplado = <strong>memória compartilhada</strong>; fracamente acoplado = <strong>troca de mensagens</strong>. Pela definição dos slides, o critério é memória compartilhada x mensagens (o Tanenbaum usa outro critério para os multicomputadores; veja a nota acima).</li>
    <li>No <strong>SMP qualquer CPU executa o SO</strong>; no <strong>AMP só o mestre</strong>.</li>
  </ul>
</div>
`,
  resumo: 'Os SOs se classificam por vários critérios: monousuário x multiusuário, monotarefa x multitarefa (cooperativa ou preemptiva), lote x on-line (interação e processamento na hora da transação), tempo real (crítico ou não crítico: o importante é cumprir prazos). Timesharing divide um computador entre usuários; sistemas distribuídos usam vários computadores com transparência. Fortemente acoplados compartilham memória e relógio; fracamente acoplados trocam mensagens. No SMP qualquer CPU executa o SO; no AMP só o mestre. O Tanenbaum lista ainda o zoológico de SOs: grande porte, servidores, PCs, portáteis, embarcados, sensores, tempo real e cartões inteligentes.',
  questoes: [
    {
      id: 'm01-a03-q1',
      enunciado: 'O que caracteriza o processamento on-line?',
      alternativas: [
        { texto: 'O usuário está conectado diretamente ao sistema e as transações são processadas no momento em que ocorrem, com os dados atualizados na hora.', correta: true, explicacao: 'Correto. On-line é interação direta com processamento imediato da transação, como num caixa eletrônico ou numa reserva de passagem aérea.' },
        { texto: 'O processamento é dividido entre vários computadores interligados por uma rede.', correta: false, explicacao: 'Isso descreve um sistema distribuído. É uma confusão comum: on-line fala de interação e processamento imediato, não de várias máquinas.' },
        { texto: 'Os dados são acumulados e processados todos juntos, depois, sem interação.', correta: false, explicacao: 'Esse é o processamento em lote (batch), o oposto do on-line.' },
        { texto: 'O sistema precisa estar conectado à Internet.', correta: false, explicacao: 'On-line, em SO, quer dizer usuário conectado diretamente ao sistema (por exemplo, por um terminal), e não acesso à Internet. O termo é usado desde os anos 1960.' },
      ],
    },
    {
      id: 'm01-a03-q2',
      enunciado: 'Qual aplicação é típica de processamento on-line?',
      alternativas: [
        { texto: 'Reserva de passagens aéreas.', correta: true, explicacao: 'Correto. Cada reserva é uma transação processada na hora: o assento precisa ficar indisponível imediatamente para os outros clientes. O Tanenbaum cita esse exemplo de processamento de transações.' },
        { texto: 'Folha de pagamento processada no fim do mês.', correta: false, explicacao: 'É o exemplo clássico de lote: os dados do mês são acumulados e processados juntos, sem interação.' },
        { texto: 'Backup completo do servidor durante a madrugada.', correta: false, explicacao: 'O backup noturno roda sem interação e sem pressa de resposta, como um job em lote.' },
        { texto: 'Geração de relatórios anuais de vendas.', correta: false, explicacao: 'Relatórios consolidados processam um grande volume de dados de uma vez, típico de lote.' },
      ],
    },
    {
      id: 'm01-a03-q3',
      enunciado: 'Qual a diferença entre sistemas fortemente acoplados (tightly coupled) e fracamente acoplados (loosely coupled)?',
      alternativas: [
        { texto: 'Nos fortemente acoplados, os processadores compartilham memória e relógio e se comunicam pela memória; nos fracamente acoplados, as máquinas são independentes e se comunicam por troca de mensagens.', correta: true, explicacao: 'Correto. A diferença está no compartilhamento da memória e na forma de comunicação: memória comum x mensagens pela rede.' },
        { texto: 'Nos fortemente acoplados, os computadores ficam fisicamente próximos; nos fracamente acoplados, ficam em cidades diferentes.', correta: false, explicacao: 'A proximidade física sozinha não define o acoplamento. Dois computadores na mesma mesa, ligados por uma rede local e cada um com seu próprio SO e sua própria memória, são fracamente acoplados: não compartilham memória e só se comunicam por mensagens.' },
        { texto: 'Nos fortemente acoplados, cada processador tem sua própria memória e seu próprio SO.', correta: false, explicacao: 'Isso descreve os fracamente acoplados. Nos fortemente acoplados a memória é compartilhada e há um único SO.' },
        { texto: 'São sinônimos de monotarefa e multitarefa.', correta: false, explicacao: 'Monotarefa e multitarefa falam de quantas tarefas o SO executa; acoplamento fala de como vários processadores se comunicam.' },
      ],
    },
    {
      id: 'm01-a03-q4',
      enunciado: 'O que é SMP e qual a diferença para AMP?',
      alternativas: [
        { texto: 'No SMP (simétrico), todas as CPUs são iguais e qualquer uma pode executar o SO; no AMP (assimétrico), uma CPU mestre executa o SO e distribui tarefas às escravas.', correta: true, explicacao: 'Correto. O SMP elimina a assimetria e o gargalo do mestre, mas exige sincronização nas tabelas do SO; o AMP é simples, mas o mestre vira gargalo com muitas CPUs.' },
        { texto: 'No SMP, uma CPU mestre executa o SO; no AMP, todas as CPUs executam o SO.', correta: false, explicacao: 'Está invertido. O mestre-escravo é o modelo assimétrico (AMP); no simétrico (SMP) todas as CPUs são iguais.' },
        { texto: 'SMP é um sistema distribuído pela Internet; AMP é um computador com uma só CPU.', correta: false, explicacao: 'Os dois são multiprocessadores fortemente acoplados (memória compartilhada). A diferença é quem executa o SO.' },
        { texto: 'SMP e AMP diferem apenas na quantidade de memória de cada processador.', correta: false, explicacao: 'Nos dois modelos a memória é compartilhada. O que muda é se qualquer CPU pode executar o SO (SMP) ou só o mestre (AMP).' },
      ],
    },
    {
      id: 'm01-a03-q5',
      enunciado: 'Num multiprocessador mestre-escravo, 10% do tempo de execução é gasto em chamadas de sistema. O que acontece quando o sistema cresce para 20 CPUs?',
      alternativas: [
        { texto: 'O mestre fica sobrecarregado: com 10 CPUs ele já estaria saturado, porque todas as chamadas de sistema vão para ele.', correta: true, explicacao: 'Correto. É o exemplo do Tanenbaum: 10 CPUs gastando 10% em chamadas já ocupam 100% do mestre. Com 20, ele vira gargalo. Por isso o mestre-escravo só serve para multiprocessadores pequenos.' },
        { texto: 'Nada: cada CPU trata as próprias chamadas de sistema.', correta: false, explicacao: 'Isso é o SMP. No mestre-escravo todas as chamadas de sistema são redirecionadas para a CPU mestre.' },
        { texto: 'O desempenho dobra, já que o número de CPUs dobrou.', correta: false, explicacao: 'O ganho fica limitado pelo mestre, que atende as chamadas de sistema de todas as CPUs. As escravas passam a esperar por ele.' },
        { texto: 'As CPUs escravas passam a se comunicar por troca de mensagens.', correta: false, explicacao: 'O sistema continua fortemente acoplado, com memória compartilhada. O problema é o gargalo no mestre, não a forma de comunicação.' },
      ],
    },
    {
      id: 'm01-a03-q6',
      enunciado: 'Um robô soldador numa linha de montagem precisa soldar no instante certo, ou o carro é perdido. Esse sistema é:',
      alternativas: [
        { texto: 'De tempo real crítico.', correta: true, explicacao: 'Correto. No tempo real crítico, a ação precisa ocorrer no momento certo; perder o prazo causa dano. É o exemplo do próprio Tanenbaum.' },
        { texto: 'De tempo real não crítico.', correta: false, explicacao: 'No não crítico, perder um prazo de vez em quando é aceitável e não causa dano permanente (áudio, multimídia). Aqui um atraso estraga o carro.' },
        { texto: 'De processamento em lote.', correta: false, explicacao: 'Lote é processar jobs acumulados sem prazo rígido. O robô tem prazo e reage a eventos da linha.' },
        { texto: 'Distribuído, porque a fábrica tem várias máquinas.', correta: false, explicacao: 'O que define o caso é o prazo rígido. Ter várias máquinas na fábrica não torna o sistema distribuído.' },
      ],
    },
    {
      id: 'm01-a03-q7',
      enunciado: 'Qual afirmação sobre sistemas de tempo compartilhado e sistemas distribuídos está correta?',
      alternativas: [
        { texto: 'O timesharing divide um único computador entre vários usuários em fatias de tempo; o distribuído reúne vários computadores autônomos que o usuário enxerga como um só.', correta: true, explicacao: 'Correto. A diferença central: um computador compartilhado no tempo x vários computadores com transparência, comunicando-se por mensagens.' },
        { texto: 'Os dois usam vários computadores; a diferença é só a velocidade da rede.', correta: false, explicacao: 'O timesharing usa um único computador com vários terminais. Só o distribuído tem vários computadores.' },
        { texto: 'No timesharing, a comunicação entre as máquinas é feita por troca de mensagens.', correta: false, explicacao: 'No timesharing não há várias máquinas trocando mensagens: todos os programas estão na memória do mesmo computador. Troca de mensagens é do distribuído.' },
        { texto: 'O sistema distribuído tem como vantagem principal a ilusão de máquina dedicada a cada usuário.', correta: false, explicacao: 'A ilusão de máquina dedicada é característica do timesharing. As vantagens do distribuído são compartilhamento de recursos, balanceamento de carga e confiabilidade.' },
      ],
    },
    {
      id: 'm01-a03-q8',
      enunciado: 'Qual combinação de classificação é <strong>impossível</strong>?',
      alternativas: [
        { texto: 'Multiusuário e monotarefa.', correta: true, explicacao: 'Correto. Para atender várias sessões de usuários ao mesmo tempo, o SO precisa executar várias tarefas. Por isso todo SO multiusuário é multitarefa.' },
        { texto: 'Monousuário e multitarefa.', correta: false, explicacao: 'É possível e comum: o Windows 95 é multitarefa e monousuário. Um único usuário pode ter vários programas abertos.' },
        { texto: 'Monousuário e monotarefa.', correta: false, explicacao: 'É possível: o MS-DOS é monousuário e monotarefa.' },
        { texto: 'Multiusuário e multitarefa preemptiva.', correta: false, explicacao: 'É possível e é o caso do UNIX e do Windows NT.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm01-a03-d1',
      enunciado: 'Explique o que é processamento on-line e dê exemplos de aplicações que funcionam nesse modelo.',
      respostaModelo: `<p>No processamento <strong>on-line</strong>, o usuário está <strong>conectado diretamente</strong> ao sistema (por um terminal) e <strong>interage</strong> com ele. Cada <strong>transação é processada no momento em que ocorre</strong> e os dados ficam atualizados imediatamente, de modo que a próxima consulta já vê o resultado. O critério importante é o <strong>tempo de resposta</strong>. É o oposto do processamento em lote (batch), em que os dados são acumulados e processados depois, sem interação.</p>
<p>Aplicações: sistemas bancários e caixas eletrônicos (saques, transferências, consulta de saldo), reservas de passagens aéreas e de hotéis, pontos de venda em supermercados (baixa de estoque na hora), consultas a bancos de dados e comércio eletrônico. São aplicações de <strong>processamento de transações</strong>: muitas requisições pequenas, que precisam de resposta rápida e de dados sempre atualizados.</p>`,
      pontosChave: [
        'Usuário conectado diretamente ao sistema, interagindo com ele',
        'Transação processada no momento em que ocorre, com dados atualizados na hora',
        'Contraste com o processamento em lote (sem interação, processado depois)',
        'Citou aplicações corretas (banco/caixa eletrônico, reservas aéreas, ponto de venda, consultas)',
      ],
    },
    {
      id: 'm01-a03-d2',
      enunciado: 'Explique como funciona um sistema de tempo compartilhado, quais são suas vantagens e em que ele difere de um sistema distribuído.',
      respostaModelo: `<p><strong>Funcionamento:</strong> o tempo compartilhado (timesharing) é uma variante da multiprogramação. Vários usuários, cada um em seu terminal, usam <strong>um mesmo computador</strong>. O SO divide o tempo de CPU em <strong>fatias</strong> e reveza entre os programas dos usuários; como a troca é rápida e boa parte dos usuários está pensando ou digitando, cada um tem a <strong>ilusão de ter a máquina só para si</strong>. Depende de hardware de proteção (memória, modo dual) e do temporizador.</p>
<p><strong>Vantagens:</strong> interatividade (o usuário vê o resultado e corrige na hora), tempo de resposta baixo, depuração mais rápida que no lote e melhor aproveitamento de uma máquina cara, cujo custo é dividido entre os usuários.</p>
<p><strong>Comparação:</strong> o sistema <strong>distribuído</strong> é um conjunto de <strong>vários computadores autônomos</strong> interligados, que se comunicam por <strong>troca de mensagens</strong> e que o software apresenta como um sistema único (<strong>transparência</strong>). No timesharing há <strong>um</strong> computador dividido no tempo; no distribuído, <strong>vários</strong> computadores dividem o trabalho. As vantagens do distribuído são compartilhamento de recursos, balanceamento de carga e confiabilidade (a falha de uma máquina não para o sistema), enquanto no timesharing a falha do computador central para todos os usuários.</p>`,
      pontosChave: [
        'Um único computador compartilhado por vários usuários em terminais',
        'CPU dividida em fatias de tempo, dando a ilusão de máquina dedicada',
        'Vantagens: interatividade e tempo de resposta baixo',
        'Distribuído: vários computadores autônomos, troca de mensagens e transparência',
        'Vantagens do distribuído: compartilhamento de recursos, balanceamento de carga e confiabilidade',
      ],
    },
  ],
});
