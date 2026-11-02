// Módulo 10, aula 3: multiprocessadores (SO para multiprocessador, SMP x AMP, multicore, escalonamento) e noções de segurança e proteção.
SO1.registerLesson({
  id: 'm10-a03',
  titulo: 'Multiprocessadores e noções de segurança',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §8.1.1–8.1.2 (hardware de multiprocessador, multinúcleo, tipos de SO para multiprocessador, p.325–333)',
    'Tanenbaum, SO Modernos 3ª ed., §8.1.3–8.1.4 (sincronização e escalonamento em multiprocessadores, p.333–340)',
    'Tanenbaum, SO Modernos 3ª ed., §9.1 (metas e ameaças, Tab. 9.1, p.380–381), §9.3.1–9.3.3 (domínios, matriz de proteção, ACL, capacidades, p.385–390), §9.4 (autenticação, p.397–404), §9.7 (malware, p.412–424) e §9.8 (defesas, p.427)',
    'Slides cap1 (Oliveira/Carissimi/Toscani, UFRGS): sistemas paralelos, SMP e multiprocessamento assimétrico; slides cap3: desabilitar interrupções não funciona em SMP',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a cozinha de um restaurante com vários cozinheiros.</strong> Dá para organizar de três jeitos: (1) cada cozinheiro com sua cozinha separada, sem dividir nada; (2) um <em>chefe</em> que recebe todos os pedidos e distribui para os auxiliares; (3) um mural único de pedidos de onde <em>qualquer</em> cozinheiro pega o próximo. Esses são os três modelos de SO para multiprocessador.</p>
  <p>Já a segurança é como a <strong>portaria de um prédio</strong>: primeiro você prova quem é (<em>autenticação</em>: documento, crachá, digital); depois a portaria consulta a que andares você pode ir (<em>controle de acesso</em>).</p>
</div>

<h2>Parte 1: multiprocessadores</h2>
<p>Um <strong>multiprocessador</strong> é um computador com várias CPUs que <strong>compartilham a mesma memória</strong> (sistema <strong>fortemente acoplado</strong>, como visto no Módulo 1). Hoje o caso mais comum é o processador <strong>multinúcleo</strong> (<em>multicore</em>): vários núcleos completos num mesmo chip, que o SO enxerga como CPUs independentes; em geral compartilham parte da cache. Se toda CPU acessa toda a memória no mesmo tempo, a máquina é <strong>UMA</strong> (acesso uniforme); se cada CPU tem memória "local" mais rápida, é <strong>NUMA</strong> (acesso não uniforme).</p>

<h3>Três tipos de SO para multiprocessador</h3>
<table>
  <tr><th>Modelo</th><th>Como funciona</th><th>Problemas</th></tr>
  <tr><td><strong>Cada CPU com seu próprio SO</strong></td><td>A memória é dividida em partes; cada CPU roda sua cópia privada (dados) do SO, como n computadores independentes.</td><td>Não compartilha processos (uma CPU ociosa enquanto outra está sobrecarregada), não empresta páginas, e as caches de disco de cada SO podem ficar inconsistentes. Pouco usado.</td></tr>
  <tr><td><strong>Mestre-escravo</strong> (assimétrico, <strong>AMP</strong>)</td><td>O SO e suas tabelas ficam <strong>só na CPU mestre</strong>; todas as chamadas de sistema vão para ela. As escravas executam processos de usuário, que o mestre distribui. O mestre também executa processos de usuário quando sobra tempo de CPU (Tanenbaum).</td><td>O <strong>mestre vira gargalo</strong>: bom para poucas CPUs, ruim para muitas.</td></tr>
  <tr><td><strong>Multiprocessador simétrico</strong> (<strong>SMP</strong>)</td><td>Há <strong>uma cópia do SO na memória</strong> e <strong>qualquer CPU pode executá-la</strong>; todas são iguais. Balanceia processos e memória dinamicamente.</td><td>Duas CPUs podem mexer na mesma tabela do núcleo ao mesmo tempo: o núcleo precisa ser dividido em <strong>regiões críticas</strong> independentes, cada uma com seu <strong>mutex</strong>.</td></tr>
</table>
<p>Os slides da disciplina definem o <strong>multiprocessamento assimétrico</strong> de forma mais geral: <strong>cada processador tem uma tarefa específica</strong>; o mestre-escravo (mestre que aloca tarefas aos escravos) é o exemplo clássico. Os mesmos slides dizem que no SMP "cada processador executa uma cópia idêntica do sistema operacional": é a mesma ideia (todas as CPUs rodam o mesmo código do SO, sem mestre). Windows e Linux atuais são <strong>SMP</strong>.</p>

<figure class="diagrama">
  <svg viewBox="0 0 520 220" style="max-width:640px" role="img" aria-label="Mestre-escravo: só a CPU 1 executa o SO e distribui processos, e também roda processos de usuário se sobrar tempo. SMP: as quatro CPUs executam o SO e pegam processos de uma fila comum">
    <g font-size="12" fill="currentColor" text-anchor="middle">
      <text x="125" y="18" font-weight="bold">Mestre-escravo (AMP)</text>
      <rect x="10" y="30" width="50" height="44" rx="5" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="2"/>
      <text x="35" y="46">CPU 1</text><text x="35" y="59" font-weight="bold">SO</text><text x="35" y="71" font-size="10">(+ usuário)</text>
      <rect x="70" y="30" width="50" height="44" rx="5" fill="none" stroke="currentColor"/>
      <text x="95" y="50">CPU 2</text><text x="95" y="66">usuário</text>
      <rect x="130" y="30" width="50" height="44" rx="5" fill="none" stroke="currentColor"/>
      <text x="155" y="50">CPU 3</text><text x="155" y="66">usuário</text>
      <rect x="190" y="30" width="50" height="44" rx="5" fill="none" stroke="currentColor"/>
      <text x="215" y="50">CPU 4</text><text x="215" y="66">usuário</text>
      <path d="M35 74 V96 H215 V80 M95 96 V80 M155 96 V80" fill="none" style="stroke:var(--ambar)" stroke-width="2"/>
      <text x="125" y="118">chamadas de sistema → CPU 1</text>
      <text x="125" y="134">(o mestre vira gargalo)</text>
      <text x="125" y="150" font-size="11">CPU 1: SO (+ usuário se sobrar tempo)</text>

      <text x="395" y="18" font-weight="bold">Simétrico (SMP)</text>
      <rect x="280" y="30" width="50" height="44" rx="5" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="305" y="46">CPU 1</text><text x="305" y="59" font-size="11">SO +</text><text x="305" y="71" font-size="11">usuário</text>
      <rect x="340" y="30" width="50" height="44" rx="5" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="365" y="46">CPU 2</text><text x="365" y="59" font-size="11">SO +</text><text x="365" y="71" font-size="11">usuário</text>
      <rect x="400" y="30" width="50" height="44" rx="5" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="425" y="46">CPU 3</text><text x="425" y="59" font-size="11">SO +</text><text x="425" y="71" font-size="11">usuário</text>
      <rect x="460" y="30" width="50" height="44" rx="5" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="485" y="46">CPU 4</text><text x="485" y="59" font-size="11">SO +</text><text x="485" y="71" font-size="11">usuário</text>
      <path d="M305 74 V96 H485 V74 M365 96 V74 M425 96 V74" fill="none" style="stroke:var(--azul)" stroke-width="2"/>
      <text x="395" y="118">qualquer CPU executa o SO</text>
      <text x="395" y="134">(tabelas protegidas por mutex)</text>

      <rect x="10" y="160" width="500" height="26" style="fill:var(--linha)" stroke="currentColor"/>
      <text x="260" y="178">Memória compartilhada (barramento): processos de usuário + uma cópia do SO</text>
      <text x="260" y="210" font-size="11">Nos dois casos as CPUs compartilham a memória; muda quem pode executar o código do SO.</text>
    </g>
  </svg>
  <figcaption>No AMP só o mestre executa o SO (e, se sobrar tempo, também processos de usuário); no SMP qualquer CPU executa, e o núcleo usa mutex nas suas regiões críticas.</figcaption>
</figure>

<h3>Sincronização em multiprocessador</h3>
<ul>
  <li><strong>Desabilitar interrupções não garante exclusão mútua</strong>: só afeta a CPU que executou a instrução; as outras continuam rodando.</li>
  <li>A instrução <strong>TSL</strong> precisa <strong>travar o barramento</strong> para que duas CPUs não leiam a variável de trava ao mesmo tempo.</li>
  <li>Esperar em laço (<strong>espera ocupada</strong>, <em>spin lock</em>) faz mais sentido aqui do que num monoprocessador: a trava pode ser liberada por outra CPU em pouco tempo, e trocar de thread custa caro.</li>
</ul>

<h3>Escalonamento em multiprocessador</h3>
<p>Num monoprocessador, o escalonador decide <em>qual</em> thread executa. Num multiprocessador a decisão é <strong>bidimensional</strong>: <em>qual</em> thread e <em>em qual CPU</em>.</p>
<ul>
  <li><strong>Tempo compartilhado com fila única</strong>: uma só estrutura de prontos para todas as CPUs; a CPU que fica livre pega a thread de maior prioridade. Balanceia a carga automaticamente, mas a fila vira ponto de disputa (contenção) e a thread perde o conteúdo da cache ao mudar de CPU.</li>
  <li><strong>Escalonamento por afinidade</strong>: tenta executar a thread na <strong>mesma CPU</strong> onde ela rodou antes, porque a cache (e a TLB) dessa CPU ainda tem os dados dela. O <strong>escalonamento em dois níveis</strong> implementa isso: ao ser criada, a thread vai para uma CPU (a menos carregada); depois, <strong>cada CPU escalona sua própria fila</strong>, e uma CPU ociosa "pega" trabalho de outra.</li>
  <li><strong>Compartilhamento de espaço</strong>: threads relacionadas de um mesmo programa recebem um grupo (partição) de CPUs dedicadas ao mesmo tempo, para se comunicarem sem esperar.</li>
  <li><strong>Escalonamento em bando</strong> (<em>gang scheduling</em>): abordagem própria que <strong>combina compartilhamento de tempo e de espaço</strong>. As threads relacionadas formam um bando e são escalonadas como uma unidade: todas executam ao mesmo tempo, em CPUs diferentes, e começam e terminam suas fatias de tempo juntas.</li>
  <li><strong>Escalonamento inteligente</strong>: uma thread que segura uma trava ganha um pouco mais de tempo antes da preempção, para não deixar as outras CPUs girando à espera.</li>
</ul>
<p>Os estudos de caso usam essas ideias: o Linux mantém uma <strong>fila de execução por CPU</strong> com afinidade e balanceamento periódico; o Windows tenta pôr cada thread no seu <strong>processador ideal</strong>.</p>

<h2>Parte 2: noções de segurança e proteção</h2>
<p>O Tanenbaum separa <strong>segurança</strong> (o problema geral: técnico, administrativo, legal) de <strong>mecanismos de proteção</strong> (o que o SO faz para proteger as informações). As metas e as ameaças correspondentes (Tabela 9.1):</p>
<table>
  <tr><th>Meta</th><th>Ameaça</th></tr>
  <tr><td><strong>Confidencialidade</strong> dos dados (só quem tem permissão lê)</td><td>Exposição dos dados</td></tr>
  <tr><td><strong>Integridade</strong> dos dados (só quem tem permissão altera)</td><td>Manipulação dos dados</td></tr>
  <tr><td><strong>Disponibilidade</strong> do sistema (ninguém consegue torná-lo inutilizável)</td><td>Recusa de serviço (<em>denial of service</em>)</td></tr>
  <tr><td>Exclusão de invasores</td><td>Controle do sistema por vírus (máquina "zumbi")</td></tr>
</table>

<h3>Autenticação</h3>
<p>Antes de tudo, o SO precisa saber <strong>quem é o usuário</strong>. Os métodos se baseiam em três princípios:</p>
<ol>
  <li><strong>Algo que o usuário sabe</strong>: senha, PIN.</li>
  <li><strong>Algo que o usuário tem</strong>: cartão, token, celular.</li>
  <li><strong>Algo que o usuário é</strong>: biometria (digital, íris, rosto, voz).</li>
</ol>
<p>Combinar dois princípios aumenta a segurança (autenticação de dois fatores, como cartão + PIN no banco). Cuidados com senhas: não exibi-las na tela; responder "login inválido" só depois de pedir nome <em>e</em> senha (para não revelar quais nomes existem); evitar senhas fáceis (num estudo clássico de Morris e Thompson, 86% das senhas estavam numa lista de palavras e nomes comuns).</p>

<h3>Controle de acesso: domínios, ACL e capacidades</h3>
<ul>
  <li><strong>Objetos</strong>: o que precisa ser protegido (arquivos, impressoras, segmentos de memória, semáforos). Cada um tem operações permitidas (ler, escrever, executar...).</li>
  <li><strong>Domínio</strong>: um conjunto de pares <em>(objeto, direitos)</em>. Normalmente corresponde a um usuário. Princípio do <strong>menor privilégio</strong> (POLA): cada domínio deve ter só os direitos necessários ao seu trabalho.</li>
  <li><strong>Matriz de proteção</strong>: linhas = domínios, colunas = objetos, células = direitos. Ela é enorme e quase vazia, então é guardada de duas formas:</li>
</ul>
<table>
  <tr><th></th><th>Lista de controle de acesso (ACL)</th><th>Lista de capacidades</th></tr>
  <tr><td>Fatia da matriz</td><td><strong>Coluna</strong>: associada a cada <strong>objeto</strong></td><td><strong>Linha</strong>: associada a cada <strong>domínio</strong> (processo)</td></tr>
  <tr><td>Diz</td><td>"Quem pode fazer o quê com este arquivo"</td><td>"O que este processo pode acessar"</td></tr>
  <tr><td>Exemplo</td><td>Arquivo F1: A pode ler e escrever; B pode ler</td><td>Processo de A: F1 (leitura e escrita), Impressora (escrita)</td></tr>
</table>
<p>As permissões <code>rwx</code> do UNIX (dono, grupo, outros) são uma ACL simplificada; o NTFS usa ACLs completas.</p>

<figure class="diagrama">
  <svg viewBox="0 0 525 210" style="max-width:640px" role="img" aria-label="Matriz de proteção com domínios nas linhas e objetos nas colunas; a coluna de um objeto é a ACL e a linha de um domínio é a lista de capacidades">
    <g font-size="12" fill="currentColor" text-anchor="middle">
      <text x="60" y="40" font-weight="bold">Domínio</text>
      <text x="160" y="40" font-weight="bold">Arquivo1</text>
      <text x="260" y="40" font-weight="bold">Arquivo2</text>
      <text x="360" y="40" font-weight="bold">Impressora</text>
      <rect x="215" y="48" width="90" height="120" fill="none" style="stroke:var(--verde)" stroke-width="3"/>
      <rect x="20" y="88" width="390" height="38" fill="none" style="stroke:var(--ambar)" stroke-width="3"/>
      <text x="60" y="72">A</text><text x="160" y="72">Ler</text><text x="260" y="72">Ler, Escrever</text><text x="360" y="72">—</text>
      <text x="60" y="112">B</text><text x="160" y="112">—</text><text x="260" y="112">Ler</text><text x="360" y="112">Escrever</text>
      <text x="60" y="152">C</text><text x="160" y="152">—</text><text x="260" y="152">—</text><text x="360" y="152">Escrever</text>
      <text x="260" y="190" style="fill:var(--verde)" font-weight="bold">coluna = ACL do Arquivo2</text>
      <text x="465" y="104" style="fill:var(--ambar)" font-weight="bold">linha =</text>
      <text x="465" y="120" style="fill:var(--ambar)" font-weight="bold">capacidades de B</text>
    </g>
    <g stroke="currentColor" stroke-opacity="0.4">
      <line x1="20" y1="50" x2="410" y2="50"/><line x1="20" y1="88" x2="410" y2="88"/><line x1="20" y1="126" x2="410" y2="126"/>
      <line x1="110" y1="26" x2="110" y2="166"/>
    </g>
  </svg>
  <figcaption>Guardar a matriz por coluna dá as ACLs (uma por objeto); guardar por linha dá as listas de capacidades (uma por domínio).</figcaption>
</figure>

<h3>Malware em linhas gerais</h3>
<table>
  <tr><th>Tipo</th><th>Característica</th></tr>
  <tr><td><strong>Cavalo de Troia</strong></td><td>Programa aparentemente útil (jogo, utilitário) que esconde código malicioso. O próprio usuário o instala; não se reproduz sozinho.</td></tr>
  <tr><td><strong>Vírus</strong></td><td>Código que se reproduz <strong>inserindo-se em outro programa</strong> (ou setor de inicialização, documento); precisa de um hospedeiro e de que ele seja executado.</td></tr>
  <tr><td><strong>Verme</strong> (<em>worm</em>)</td><td>Programa que <strong>se propaga sozinho pela rede</strong>, explorando falhas, sem precisar de hospedeiro nem de ação do usuário.</td></tr>
  <tr><td><strong>Spyware</strong></td><td>Coleta informações do usuário (hábitos, senhas) e as envia sem consentimento. Um caso é o <strong>keylogger</strong>, que registra as teclas.</td></tr>
  <tr><td><strong>Rootkit</strong></td><td>Conjunto de programas que <strong>esconde a própria presença</strong> (e a de outros malwares), muitas vezes modificando o SO.</td></tr>
</table>
<p>Uma máquina infectada que obedece a um criminoso é um <strong>zumbi</strong>; um conjunto delas é uma <strong>botnet</strong>, usada para spam e ataques de recusa de serviço. Defesas comuns: <strong>firewall</strong> (filtra o tráfego de rede), <strong>antivírus</strong> (procura assinaturas e comportamentos suspeitos), manter o sistema <strong>atualizado</strong> e seguir o menor privilégio.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: a usuária Ana abre <code>notas.txt</code> num servidor SMP de 4 CPUs.</strong></p>
  <table>
    <tr><th>Momento</th><th>O que acontece</th><th>Conceito</th></tr>
    <tr><td>1</td><td>Ana digita usuário e senha; o SO compara com o que tem guardado e cria a sessão com o UID dela.</td><td><strong>Autenticação</strong> (algo que ela sabe)</td></tr>
    <tr><td>2</td><td>O editor da Ana é escalonado na CPU 2, a menos carregada no momento.</td><td>Escalonamento em <strong>dois níveis</strong> (fila por CPU)</td></tr>
    <tr><td>3</td><td>O editor chama open. A própria CPU 2 executa o código do SO (não há mestre), pegando o mutex da tabela de arquivos.</td><td><strong>SMP</strong> e região crítica no núcleo</td></tr>
    <tr><td>4</td><td>O SO consulta a ACL de notas.txt: "Ana: leitura e escrita; grupo: leitura". O acesso é liberado.</td><td><strong>Controle de acesso por ACL</strong></td></tr>
    <tr><td>5</td><td>O editor bloqueia para ler o disco; quando volta, o escalonador o coloca de novo na CPU 2, cuja cache ainda tem seus dados.</td><td><strong>Afinidade</strong></td></tr>
  </table>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>No <strong>SMP qualquer CPU executa o SO</strong>; no <strong>AMP (mestre-escravo) só o mestre executa o SO</strong>. Isso não quer dizer que o mestre só roda o SO: ele também executa processos de usuário quando sobra tempo. As escravas nunca executam o SO. Nos dois a memória é compartilhada.</li>
    <li>Em multiprocessador, <strong>desabilitar interrupções não garante exclusão mútua</strong> (só afeta uma CPU).</li>
    <li><strong>ACL = por objeto (coluna)</strong>; <strong>capacidade = por domínio (linha)</strong>. Não troque.</li>
    <li><strong>Autenticação</strong> (quem é você?) é diferente de <strong>autorização / controle de acesso</strong> (o que você pode fazer?).</li>
    <li><strong>Vírus precisa de hospedeiro</strong>; <strong>verme se espalha sozinho</strong> pela rede; <strong>cavalo de Troia não se replica</strong>.</li>
  </ul>
</div>
`,
  resumo: 'Multiprocessadores compartilham a memória (o multinúcleo é o caso mais comum). Há três modelos de SO: cada CPU com seu SO, mestre-escravo (AMP: só o mestre executa o SO, rodando também processos de usuário se sobrar tempo, e vira gargalo) e SMP (uma cópia do SO que qualquer CPU executa, com mutex nas regiões críticas do núcleo). O escalonamento escolhe thread e CPU: fila única, afinidade com dois níveis, compartilhamento de espaço e bando. Em segurança, as metas são confidencialidade, integridade e disponibilidade; a autenticação usa algo que o usuário sabe, tem ou é; o controle de acesso usa domínios, a matriz de proteção e suas formas ACL (por objeto) e capacidades (por domínio); e os malwares principais são cavalo de Troia, vírus, verme, spyware e rootkit.',
  questoes: [
    {
      id: 'm10-a03-q1',
      enunciado: 'O que é SMP e qual a diferença para o modelo AMP (mestre-escravo)?',
      alternativas: [
        { texto: 'No SMP há uma cópia do SO e qualquer CPU pode executá-la; no AMP só a CPU mestre executa o SO e as escravas rodam processos de usuário.', correta: true, explicacao: 'Correto. O mestre também pode rodar processos de usuário quando sobra tempo, mas é o único que executa o SO. O SMP elimina o gargalo do mestre, mas exige que o núcleo proteja suas tabelas com mutex, pois duas CPUs podem executar o SO ao mesmo tempo.' },
        { texto: 'No SMP cada CPU tem sua memória privada; no AMP a memória é compartilhada.', correta: false, explicacao: 'Nos dois modelos as CPUs compartilham a memória. O que muda é quem pode executar o código do SO.' },
        { texto: 'No AMP qualquer CPU executa o SO; no SMP só a CPU mestre.', correta: false, explicacao: 'Está invertido. Simétrico quer dizer que todas as CPUs são iguais, e todas podem executar o SO.' },
        { texto: 'SMP e AMP são nomes diferentes para sistemas distribuídos ligados em rede.', correta: false, explicacao: 'Sistemas distribuídos são fracamente acoplados (cada máquina com sua memória, comunicando-se por mensagens). SMP e AMP são formas de organizar o SO num multiprocessador de memória compartilhada.' },
      ],
    },
    {
      id: 'm10-a03-q2',
      enunciado: 'Por que o modelo mestre-escravo funciona mal com muitas CPUs?',
      alternativas: [
        { texto: 'Porque todas as chamadas de sistema vão para a CPU mestre, que vira gargalo.', correta: true, explicacao: 'Correto. O Tanenbaum dá o exemplo: se 10% do tempo é gasto no SO, cerca de 10 CPUs já saturam o mestre; com 20 CPUs ele fica completamente sobrecarregado.' },
        { texto: 'Porque cada CPU tem sua própria cópia das tabelas e elas ficam inconsistentes.', correta: false, explicacao: 'Esse é um problema do modelo "cada CPU com seu próprio SO". No mestre-escravo há uma única cópia das tabelas, no mestre.' },
        { texto: 'Porque uma CPU pode ficar ociosa enquanto outra está sobrecarregada, sem compartilhar processos.', correta: false, explicacao: 'No mestre-escravo isso não acontece: o mestre mantém a fila de Aptos e entrega trabalho a qualquer escrava ociosa. A falta de compartilhamento é do modelo com SO por CPU.' },
        { texto: 'Porque as CPUs escravas não conseguem executar processos de usuário.', correta: false, explicacao: 'Executar processos de usuário é justamente o trabalho das escravas. O que elas não fazem é executar o SO.' },
      ],
    },
    {
      id: 'm10-a03-q3',
      enunciado: 'Num multiprocessador, por que se prefere executar uma thread na mesma CPU em que ela executou antes (escalonamento por afinidade)?',
      alternativas: [
        { texto: 'Porque a cache (e a TLB) daquela CPU provavelmente ainda tem os dados da thread, o que reduz faltas de cache.', correta: true, explicacao: 'Correto. Ao mudar de CPU a thread encontra uma cache "fria" e precisa recarregar tudo da memória. O escalonamento em dois níveis (uma fila por CPU) favorece essa afinidade.' },
        { texto: 'Porque uma thread só pode executar na CPU onde foi criada.', correta: false, explicacao: 'Qualquer CPU pode executar qualquer thread num SMP. A afinidade é uma preferência de desempenho, não uma restrição.' },
        { texto: 'Porque assim não é preciso proteger as tabelas do núcleo com mutex.', correta: false, explicacao: 'O núcleo continua precisando de mutex, pois outras CPUs executam o SO ao mesmo tempo. A afinidade trata de cache, não de exclusão mútua.' },
        { texto: 'Porque a fila única de prontos garante isso automaticamente.', correta: false, explicacao: 'É o contrário: com fila única, a thread vai para qualquer CPU que ficar livre e tende a perder a cache. Afinidade exige filas por CPU ou cuidado extra.' },
      ],
    },
    {
      id: 'm10-a03-q4',
      enunciado: 'Desabilitar interrupções protege uma seção crítica num monoprocessador. Por que isso não basta num multiprocessador?',
      alternativas: [
        { texto: 'Porque só a CPU que executou a instrução para de ser interrompida; as outras CPUs continuam executando e podem entrar na seção crítica.', correta: true, explicacao: 'Correto. Os slides do cap3 citam isso como desvantagem: em SMP, desabilitar interrupções viola a exclusão mútua. É preciso TSL com trava do barramento, spin locks ou semáforos.' },
        { texto: 'Porque multiprocessadores não têm interrupções.', correta: false, explicacao: 'Multiprocessadores têm interrupções normalmente. O problema é que cada CPU tem as suas, e desligar numa não afeta as demais.' },
        { texto: 'Porque desabilitar interrupções desliga todas as CPUs ao mesmo tempo.', correta: false, explicacao: 'Se desligasse todas, até funcionaria (com custo enorme). A instrução afeta só a CPU que a executa, e por isso não protege.' },
        { texto: 'Porque em multiprocessador não existe condição de corrida.', correta: false, explicacao: 'Existe, e é ainda mais provável: duas CPUs podem acessar o mesmo dado de verdade ao mesmo tempo (paralelismo real).' },
      ],
    },
    {
      id: 'm10-a03-q5',
      enunciado: 'Um banco exige que o cliente use o cartão e digite a senha no caixa eletrônico. Quais princípios de autenticação estão sendo combinados?',
      alternativas: [
        { texto: 'Algo que o usuário tem (cartão) e algo que o usuário sabe (senha).', correta: true, explicacao: 'Correto. É autenticação de dois fatores: roubar só o cartão ou só descobrir a senha não basta para entrar.' },
        { texto: 'Algo que o usuário sabe (cartão) e algo que o usuário é (senha).', correta: false, explicacao: 'O cartão é um objeto físico (algo que se tem) e a senha é conhecimento (algo que se sabe). "Algo que o usuário é" é biometria.' },
        { texto: 'Algo que o usuário é (cartão) e algo que o usuário tem (senha).', correta: false, explicacao: 'Está trocado. O cartão é algo que se tem; a senha é algo que se sabe.' },
        { texto: 'Controle de acesso por ACL e por capacidades.', correta: false, explicacao: 'ACL e capacidades decidem o que o usuário pode fazer depois de identificado (autorização). Cartão e senha servem para provar quem ele é (autenticação).' },
      ],
    },
    {
      id: 'm10-a03-q6',
      enunciado: 'Na matriz de proteção (domínios × objetos), o que é uma <strong>lista de controle de acesso (ACL)</strong>?',
      alternativas: [
        { texto: 'A coluna da matriz guardada junto de cada objeto: quais domínios podem acessá-lo e com quais direitos.', correta: true, explicacao: 'Correto. Exemplo: arquivo F1 com "A: leitura e escrita; B: leitura". As permissões rwx do UNIX e as ACLs do NTFS seguem essa ideia.' },
        { texto: 'A linha da matriz guardada junto de cada processo: todos os objetos que ele pode acessar.', correta: false, explicacao: 'Isso é a lista de capacidades (por domínio). A ACL é por objeto.' },
        { texto: 'A lista de usuários e senhas usada no login.', correta: false, explicacao: 'Essa lista serve à autenticação. A ACL serve ao controle de acesso, depois que o usuário já foi identificado.' },
        { texto: 'Uma lista de assinaturas de vírus usada pelo antivírus.', correta: false, explicacao: 'Antivírus compara arquivos com assinaturas de malware conhecidos; não tem relação com a matriz de proteção.' },
      ],
    },
    {
      id: 'm10-a03-q7',
      enunciado: 'Qual malware se propaga sozinho pela rede, explorando falhas, sem precisar se anexar a outro programa nem de ação do usuário?',
      alternativas: [
        { texto: 'Verme (worm).', correta: true, explicacao: 'Correto. O verme é um programa independente que se copia de máquina em máquina pela rede.' },
        { texto: 'Vírus.', correta: false, explicacao: 'O vírus precisa de um hospedeiro: insere seu código em outro programa (ou setor de inicialização) e só se espalha quando o hospedeiro é executado.' },
        { texto: 'Cavalo de Troia.', correta: false, explicacao: 'O cavalo de Troia não se reproduz: depende de o usuário instalar o programa "útil" que o esconde.' },
        { texto: 'Rootkit.', correta: false, explicacao: 'O rootkit serve para esconder a presença do invasor e de outros malwares, não para se propagar.' },
      ],
    },
    {
      id: 'm10-a03-q8',
      enunciado: 'Um atacante envia milhares de requisições por segundo a um servidor web até ele não conseguir atender mais ninguém. Qual meta de segurança foi atacada?',
      alternativas: [
        { texto: 'Disponibilidade do sistema (ataque de recusa de serviço).', correta: true, explicacao: 'Correto. Nenhum dado foi lido nem alterado: o sistema simplesmente ficou inutilizável. É a ameaça correspondente à disponibilidade na Tabela 9.1.' },
        { texto: 'Confidencialidade dos dados.', correta: false, explicacao: 'Confidencialidade é atacada quando dados secretos são expostos a quem não deveria vê-los. Aqui nada foi lido.' },
        { texto: 'Integridade dos dados.', correta: false, explicacao: 'Integridade é atacada quando dados são modificados, removidos ou inseridos sem permissão. Aqui nada foi alterado.' },
        { texto: 'Autenticação de usuários.', correta: false, explicacao: 'O ataque não tentou se passar por ninguém; apenas sobrecarregou o servidor.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm10-a03-d1',
      enunciado: 'Descreva os três modelos de sistema operacional para multiprocessadores citados por Tanenbaum e explique por que o SMP é o mais usado, apesar de exigir mais cuidado no núcleo.',
      respostaModelo: `<p><strong>1. Cada CPU com seu próprio SO:</strong> a memória é dividida e cada CPU funciona como um computador independente. É simples, mas não compartilha processos (uma CPU pode ficar ociosa enquanto outra está sobrecarregada), não empresta páginas de memória e as caches de disco de cada SO podem ficar inconsistentes.</p>
<p><strong>2. Mestre-escravo (assimétrico, AMP):</strong> o SO e suas tabelas ficam só na CPU mestre, que trata todas as chamadas de sistema e distribui processos às escravas; o mestre também executa processos de usuário quando sobra tempo de CPU. É o exemplo clássico de multiprocessamento assimétrico, em que cada processador tem uma tarefa específica. Resolve o compartilhamento, mas o mestre vira <strong>gargalo</strong> quando há muitas CPUs.</p>
<p><strong>3. Simétrico (SMP):</strong> há uma única cópia do SO na memória e <strong>qualquer CPU pode executá-la</strong>. Não há gargalo de mestre e a carga é balanceada dinamicamente. O custo é que duas CPUs podem executar o SO ao mesmo tempo, então as tabelas do núcleo precisam ser protegidas: o núcleo é dividido em regiões críticas independentes, cada uma com seu mutex. Por escalar bem, é o modelo de Windows e Linux.</p>`,
      pontosChave: [
        'Descreveu o modelo com um SO por CPU e seus problemas (sem compartilhar processos, memória ou cache de disco)',
        'Descreveu o mestre-escravo (AMP): só o mestre executa o SO (e roda processos de usuário se sobrar tempo) e ele vira gargalo',
        'Relacionou o AMP à definição de cada processador com uma tarefa específica (mestre aloca tarefas aos escravos)',
        'Descreveu o SMP: uma cópia do SO que qualquer CPU executa',
        'Explicou que o SMP exige mutex/regiões críticas nas tabelas do núcleo',
      ],
    },
    {
      id: 'm10-a03-d2',
      enunciado: 'Diferencie autenticação de controle de acesso. Cite os três princípios de autenticação e explique a diferença entre lista de controle de acesso (ACL) e lista de capacidades.',
      respostaModelo: `<p><strong>Autenticação</strong> é verificar <em>quem</em> é o usuário; <strong>controle de acesso</strong> (autorização) é decidir <em>o que</em> esse usuário, já identificado, pode fazer com cada objeto.</p>
<p>A autenticação se baseia em <strong>algo que o usuário sabe</strong> (senha, PIN), <strong>algo que tem</strong> (cartão, token) ou <strong>algo que é</strong> (biometria); combinar dois deles aumenta a segurança.</p>
<p>O controle de acesso pode ser modelado por uma <strong>matriz de proteção</strong> com domínios nas linhas e objetos nas colunas. A <strong>ACL</strong> guarda a matriz por <strong>coluna</strong>: cada objeto tem a lista de domínios que podem acessá-lo e com quais direitos (ex.: permissões rwx do UNIX, ACLs do NTFS). A <strong>lista de capacidades</strong> guarda por <strong>linha</strong>: cada domínio (processo) tem a lista de objetos que pode acessar e com quais direitos. Em ambos vale o princípio do menor privilégio.</p>`,
      pontosChave: [
        'Autenticação = identificar quem é o usuário; controle de acesso = o que ele pode fazer',
        'Três princípios: algo que sabe, algo que tem, algo que é',
        'ACL: por objeto (coluna da matriz), lista quem pode acessar e com quais direitos',
        'Capacidades: por domínio/processo (linha da matriz), lista o que ele pode acessar',
      ],
    },
  ],
});
