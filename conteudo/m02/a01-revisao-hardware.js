// Módulo 2, aula 1: revisão de hardware (CPU, memória, discos, E/S, barramentos, inicialização).
SO1.registerLesson({
  id: 'm02-a01',
  titulo: 'Revisão de hardware',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §1.3 Revisão sobre hardware de computadores (p.11–20): processadores, memória, discos, fitas, dispositivos de E/S, barramentos, inicialização',
    'Slides cap5 (Oliveira/Carissimi/Toscani, UFRGS): periféricos, controladoras, E/S mapeada em memória x espaço de E/S',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: uma cozinha de restaurante.</strong> O <em>chef</em> (CPU) só trabalha com o que está na bancada (registradores). Logo ao lado fica a geladeira pequena (cache), um pouco mais longe a despensa (memória principal) e, no fundo, o depósito (disco). Quanto mais longe, mais espaço e mais demora para buscar. Os pedidos chegam por garçons (controladores de E/S), que circulam pelos corredores (barramentos). Antes de abrir, alguém liga as luzes e confere os equipamentos (inicialização).</p>
  <p>O SO precisa conhecer essa cozinha, porque é ele quem a administra.</p>
</div>

<p>O SO <strong>estende</strong> o conjunto de instruções do computador e <strong>gerencia</strong> os seus recursos; para isso, precisa conhecer bem o hardware. Conceitualmente, um computador pessoal simples tem <strong>CPU, memória e dispositivos de E/S ligados por um barramento</strong>.</p>

<h2>1. Processador (CPU)</h2>
<p>A CPU é o "cérebro" do computador. O seu trabalho é um ciclo repetido até o programa terminar:</p>
<ol>
  <li><strong>Busca</strong>: traz da memória a instrução apontada pelo contador de programa.</li>
  <li><strong>Decodifica</strong>: descobre qual operação é e quais são os operandos.</li>
  <li><strong>Executa</strong>: realiza a operação. Em seguida, busca a próxima instrução.</li>
</ol>

<figure class="diagrama">
  <svg viewBox="0 0 460 252" style="max-width:560px" role="img" aria-label="Ciclo busca, decodifica, executa, com verificação de interrupção ao final">
    <defs>
      <marker id="m02a01-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
      </marker>
    </defs>
    <g font-size="14" text-anchor="middle" fill="currentColor">
      <rect x="150" y="10" width="160" height="50" rx="10" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="230" y="32" font-weight="bold">1. Busca</text>
      <text x="230" y="50" font-size="11">lê memória[PC]; PC avança</text>
      <rect x="300" y="110" width="150" height="50" rx="10" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="375" y="132" font-weight="bold">2. Decodifica</text>
      <text x="375" y="150" font-size="11">qual operação? operandos?</text>
      <rect x="150" y="190" width="160" height="50" rx="10" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="230" y="212" font-weight="bold">3. Executa</text>
      <text x="230" y="230" font-size="11">ULA e registradores</text>
      <rect x="10" y="110" width="150" height="50" rx="10" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="2"/>
      <text x="85" y="130" font-weight="bold" font-size="12">Interrupção</text>
      <text x="85" y="146" font-weight="bold" font-size="12">pendente?</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.6">
      <path d="M310 40 Q372 50 375 105" marker-end="url(#m02a01-seta)"/>
      <path d="M375 160 Q370 205 315 213" marker-end="url(#m02a01-seta)"/>
      <path d="M150 213 Q90 205 85 165" marker-end="url(#m02a01-seta)"/>
      <path d="M85 110 Q90 45 145 37" marker-end="url(#m02a01-seta)"/>
    </g>
    <text x="4" y="58" font-size="11" fill="currentColor">não: próxima</text>
    <text x="4" y="72" font-size="11" fill="currentColor">instrução</text>
    <text x="6" y="232" font-size="11" style="fill:var(--ambar)">sim: desvia para</text>
    <text x="6" y="246" font-size="11" style="fill:var(--ambar)">o tratador (aula 3)</text>
  </svg>
  <figcaption>O ciclo de instrução. Ao fim de cada instrução, o hardware verifica se há interrupção pendente; é assim que a CPU "percebe" um evento externo (Aula 3).</figcaption>
</figure>

<p>Cada CPU tem o <strong>seu próprio conjunto de instruções</strong>: um Pentium não executa programas de SPARC e vice-versa. Como buscar dados na memória é bem mais lento do que executar uma instrução, a CPU tem <strong>registradores</strong> internos para guardar variáveis e resultados temporários. Além dos registradores de uso geral, há <strong>registradores especiais</strong>:</p>
<table>
  <tr><th>Registrador</th><th>O que guarda</th></tr>
  <tr><td><strong>Contador de programa (PC)</strong></td><td>O endereço da <strong>próxima instrução</strong> a ser buscada. Depois de cada busca, é atualizado.</td></tr>
  <tr><td><strong>Ponteiro de pilha (SP)</strong></td><td>O topo da pilha atual na memória. A pilha tem uma estrutura por rotina chamada e ainda não terminada: parâmetros, variáveis locais e temporárias.</td></tr>
  <tr><td><strong>PSW</strong> (<em>program status word</em>, palavra de estado do programa)</td><td>Bits de código de condição (resultado de comparações), prioridade da CPU, <strong>modo de execução (usuário ou núcleo)</strong> e outros bits de controle. O programa de usuário pode ler a PSW, mas só altera alguns campos.</td></tr>
</table>
<p>Quando o SO tira a CPU de um programa para dar a outro, ele precisa <strong>salvar todos os registradores</strong> para restaurá-los depois. Isso é a base da troca de contexto (Módulo 3).</p>
<p>Para ganhar desempenho, as CPUs modernas usam <strong>pipeline</strong> (busca, decodificação e execução de instruções diferentes ao mesmo tempo, como numa linha de montagem) e são <strong>superescalares</strong> (várias unidades de execução, com instruções podendo ser executadas fora de ordem). Também existem <strong>multithreading/hyperthreading</strong> (a CPU mantém o estado de duas threads e alterna entre elas em nanossegundos, <em>sem</em> paralelismo real) e <strong>chips multinúcleo</strong> (vários processadores completos num chip, com paralelismo real).</p>

<h2>2. Memória: uma hierarquia</h2>
<p>A memória ideal seria muito rápida, muito grande e barata. Nenhuma tecnologia atende aos três, então se usa uma <strong>hierarquia de camadas</strong>: as de cima são mais rápidas, menores e mais caras por bit.</p>

<figure class="diagrama">
  <svg viewBox="0 0 540 240" style="max-width:640px" role="img" aria-label="Hierarquia de memória: registradores, cache, memória principal, disco, fita, com tempos e capacidades">
    <g transform="translate(70,0)">
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <polygon points="195,15 275,15 290,55 180,55" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="1.5"/>
      <text x="235" y="40">Registradores</text>
      <polygon points="180,60 290,60 305,100 165,100" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="1.5"/>
      <text x="235" y="85">Cache</text>
      <polygon points="165,105 305,105 320,145 150,145" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="1.5"/>
      <text x="235" y="130">Memória principal</text>
      <polygon points="150,150 320,150 335,190 135,190" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="1.5"/>
      <text x="235" y="175">Disco magnético</text>
      <polygon points="135,195 335,195 350,235 120,235" style="fill:var(--linha)" stroke="currentColor" stroke-width="1"/>
      <text x="235" y="220">Fita magnética</text>
    </g>
    <g font-size="12" fill="currentColor" text-anchor="end">
      <text x="110" y="12" font-weight="bold">Acesso</text>
      <text x="110" y="40">1 ns</text>
      <text x="110" y="85">2 ns</text>
      <text x="110" y="130">10 ns</text>
      <text x="110" y="175">10 ms</text>
      <text x="110" y="220">100 s</text>
    </g>
    <g font-size="12" fill="currentColor">
      <text x="360" y="12" font-weight="bold">Capacidade</text>
      <text x="360" y="40">&lt; 1 KB</text>
      <text x="360" y="85">4 MB</text>
      <text x="360" y="130">512–2048 MB</text>
      <text x="360" y="175">200–1000 GB</text>
      <text x="360" y="220">400–800 GB</text>
    </g>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="10" y="70" style="fill:var(--azul)">↑ mais rápida,</text>
      <text x="10" y="84" style="fill:var(--azul)">mais cara por bit</text>
      <text x="10" y="200" style="fill:var(--ambar)">↓ maior,</text>
      <text x="10" y="214" style="fill:var(--ambar)">mais barata</text>
    </g>
  </svg>
  <figcaption>Hierarquia de memória típica (Tanenbaum, Fig. 1.9; números aproximados). Descendo, o tempo de acesso cresce muito, a capacidade também, e o custo por bit cai.</figcaption>
</figure>

<ul>
  <li><strong>Registradores</strong>: dentro da CPU, tão rápidos quanto ela. Os programas (não o hardware) decidem o que guardar neles.</li>
  <li><strong>Cache</strong>: controlada principalmente pelo <strong>hardware</strong>. A memória é dividida em <strong>linhas de cache</strong> (normalmente 64 bytes). Se a palavra pedida está na cache, é um <strong>cache hit</strong> (cerca de 2 ciclos); se não está, é um <strong>cache miss</strong> e a busca vai à memória principal, com grande penalidade. Há a <strong>L1</strong> (dentro da CPU, sem atraso, tipicamente 16 KB) e a <strong>L2</strong> (alguns MB, um ou dois ciclos de atraso). A ideia de <em>caching</em> aparece em todo o SO: por exemplo, guardar na memória partes muito usadas de arquivos do disco.</li>
  <li><strong>Memória principal (RAM)</strong>: a "locomotiva" do sistema; tudo que a cache não atende vem dela. É <strong>volátil</strong>.</li>
  <li><strong>Memórias não voláteis</strong>: <strong>ROM</strong> (gravada na fábrica, só leitura; guarda, por exemplo, o carregador de inicialização em alguns computadores); <strong>EEPROM</strong> e <strong>flash</strong> (podem ser regravadas, mas a escrita é mais lenta; a flash se desgasta com muitas gravações); <strong>CMOS</strong> (volátil, mas mantida por uma bateria: guarda data, hora e a configuração de qual disco usar no boot).</li>
</ul>
<p>A <strong>MMU</strong> (<em>memory management unit</em>, unidade de gerenciamento de memória), parte da CPU, converte os endereços gerados pelos programas em endereços físicos da RAM. Ela é a base da memória virtual (Módulo 8). Na troca de contexto, pode ser preciso limpar a cache e recarregar a MMU, operações caras.</p>

<h2>3. Discos e fitas</h2>
<p>O disco magnético é cerca de <strong>duas ordens de grandeza mais barato por bit e maior</strong> que a RAM, mas cerca de <strong>três ordens de grandeza mais lento</strong> no acesso aleatório, porque é <strong>mecânico</strong>.</p>
<ul>
  <li>Pratos metálicos giram a 5.400, 7.200 ou 10.800 rpm; um <strong>braço</strong> com uma cabeça por superfície se move sobre eles.</li>
  <li><strong>Trilha</strong>: o círculo que uma cabeça lê numa posição do braço. <strong>Cilindro</strong>: todas as trilhas daquela posição do braço. Cada trilha é dividida em <strong>setores</strong> (normalmente 512 bytes).</li>
  <li>Tempos: mover o braço para o cilindro vizinho leva cerca de 1 ms; para um cilindro qualquer, 5 a 10 ms (<strong>busca</strong>, <em>seek</em>). Depois, espera-se o setor passar sob a cabeça: mais 5 a 10 ms (<strong>latência rotacional</strong>). A transferência é de 50 a 160 MB/s.</li>
</ul>
<p>A <strong>fita magnética</strong> é a última camada: barata e removível, usada para cópias de segurança (backup), mas de acesso sequencial (minutos para chegar a um bloco). Discos são vistos em detalhe no Módulo 9.</p>

<h2>4. Dispositivos de E/S</h2>
<p>Um dispositivo de E/S tem duas partes: o <strong>controlador</strong> (chip ou placa que controla fisicamente o dispositivo e oferece uma interface mais simples ao SO) e o <strong>dispositivo</strong> em si. O software que conversa com o controlador é o <strong>driver de dispositivo</strong>, fornecido pelo fabricante para cada SO; ele roda <strong>em modo núcleo</strong>.</p>
<p>Todo controlador tem alguns <strong>registradores</strong> (o conjunto deles forma o <strong>espaço de portas de E/S</strong>). Eles podem ser acessados de duas formas:</p>
<table>
  <tr><th>Forma</th><th>Como funciona</th><th>Prós e contras</th></tr>
  <tr><td><strong>E/S mapeada em memória</strong></td><td>Os registradores do dispositivo aparecem no espaço de endereçamento da memória e são lidos/escritos como palavras de memória.</td><td>Não precisa de instruções especiais; gasta parte do espaço de endereçamento. Programas de usuário ficam longe do hardware com registradores base e limite (Aula 2).</td></tr>
  <tr><td><strong>Espaço de E/S separado (portas)</strong></td><td>Cada registrador tem um endereço de porta e é acessado por instruções especiais (IN e OUT), disponíveis <strong>só em modo núcleo</strong>.</td><td>Não gasta espaço de endereçamento; exige instruções especiais.</td></tr>
</table>
<p>Há três maneiras de fazer E/S, comparadas na Aula 3 e no Módulo 9: <strong>espera ocupada</strong> (a CPU fica perguntando se terminou), <strong>por interrupção</strong> (o controlador avisa quando termina) e <strong>DMA</strong> (um chip transfere os dados direto para a memória e interrompe a CPU só no fim).</p>

<h2>5. Barramentos</h2>
<p>Com CPUs e memórias mais rápidas, um único barramento virou gargalo. Um Pentium grande tem vários: <strong>cache, local, memória, PCI, SCSI, USB, IDE e ISA</strong>, cada um com função e taxa diferentes. A CPU fala com uma <strong>ponte PCI</strong>, que liga a memória e o barramento PCI.</p>
<table>
  <tr><th>Barramento</th><th>Característica</th></tr>
  <tr><td><strong>ISA</strong></td><td>O do IBM PC/AT original: 8,33 MHz, 2 bytes por vez, até 16,67 MB/s. Mantido para placas antigas.</td></tr>
  <tr><td><strong>PCI</strong> (e o sucessor <strong>PCI Express</strong>)</td><td>Sucessor do ISA: 66 MHz, 8 bytes por vez, 528 MB/s. Usado pela maioria dos dispositivos rápidos.</td></tr>
  <tr><td><strong>IDE</strong></td><td>Liga discos e CD-ROMs.</td></tr>
  <tr><td><strong>USB</strong></td><td>Serial, para dispositivos lentos (teclado, mouse). Centralizado: um dispositivo-raiz interroga os outros a cada 1 ms. 1,5 MB/s; USB 2.0, 60 MB/s. Um único driver USB serve todos, e os dispositivos podem ser conectados sem reiniciar.</td></tr>
  <tr><td><strong>SCSI</strong></td><td>Alto desempenho: discos rápidos, scanners; até 160 MB/s.</td></tr>
</table>
<p><strong>Plug and play</strong>: antes, cada placa tinha nível de interrupção e endereços de E/S fixos, configurados por jumpers; duas placas na mesma interrupção entravam em conflito. Com o plug and play, o sistema coleta automaticamente as informações dos dispositivos e atribui de forma centralizada os níveis de interrupção e endereços.</p>

<h2>6. Inicialização do computador (boot)</h2>
<p>A placa-mãe tem o <strong>BIOS</strong> (<em>basic input output system</em>), com rotinas de E/S de baixo nível, gravado hoje em <strong>flash RAM</strong> (não volátil, mas atualizável). Os passos estão no exemplo abaixo.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: do botão "ligar" à tela de login.</strong></p>
  <table>
    <tr><th>Passo</th><th>Quem age</th><th>O que acontece</th></tr>
    <tr><td>1</td><td>BIOS</td><td>Verifica quanta RAM está instalada e se o teclado e outros dispositivos básicos respondem.</td></tr>
    <tr><td>2</td><td>BIOS</td><td>Varre os barramentos ISA e PCI para detectar os dispositivos (legados e plug and play) e os registra. Se mudaram desde o último boot, configura os novos.</td></tr>
    <tr><td>3</td><td>BIOS</td><td>Escolhe o <strong>dispositivo de inicialização</strong> pela lista guardada na <strong>CMOS</strong> (ex.: disquete → CD-ROM → disco rígido).</td></tr>
    <tr><td>4</td><td>BIOS</td><td>Lê o <strong>primeiro setor</strong> desse dispositivo para a memória e o executa. Esse programa examina a <strong>tabela de partições</strong> e descobre qual partição está ativa.</td></tr>
    <tr><td>5</td><td>Carregador secundário</td><td>Lido da partição ativa, ele carrega o <strong>sistema operacional</strong> e o inicia.</td></tr>
    <tr><td>6</td><td>SO</td><td>Consulta o BIOS para obter a configuração, verifica se tem o driver de cada dispositivo (pedindo um CD do fabricante se faltar) e <strong>carrega os drivers no núcleo</strong>.</td></tr>
    <tr><td>7</td><td>SO</td><td>Inicializa suas tabelas, cria os processos de segundo plano necessários e inicia um programa de <strong>login</strong> ou uma interface gráfica.</td></tr>
  </table>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>O <strong>PC</strong> aponta para a <strong>próxima</strong> instrução, não para a que está sendo executada.</li>
    <li>O <strong>modo de execução</strong> (usuário/núcleo) é um <strong>bit da PSW</strong>. Programas de usuário podem ler a PSW, mas não mudar esse bit.</li>
    <li>Na hierarquia, subir significa <strong>mais rápido e mais caro por bit</strong>; descer, <strong>maior e mais barato</strong>. A cache é gerenciada pelo hardware; os registradores, pelo programa (compilador).</li>
    <li><strong>Hyperthreading não é paralelismo real</strong>: só um processo executa por vez, com chaveamento muito rápido. <strong>Multinúcleo</strong> é paralelismo real.</li>
    <li>O <strong>driver</strong> é software (roda no núcleo); o <strong>controlador</strong> é hardware.</li>
  </ul>
</div>
`,
  resumo: 'A CPU repete o ciclo busca → decodifica → executa, usando registradores (PC = próxima instrução, SP = topo da pilha, PSW = códigos de condição e modo usuário/núcleo). A memória é uma hierarquia (registradores, cache, RAM, disco, fita): subir é mais rápido e caro, descer é maior e barato. Dispositivos de E/S têm controlador (hardware) e driver (software no núcleo), acessados por E/S mapeada em memória ou por portas; vários barramentos (PCI, USB, IDE, SCSI, ISA) os interligam. No boot, o BIOS testa o hardware, escolhe o dispositivo pela CMOS, lê o primeiro setor, e o carregador sobe o SO, que carrega os drivers e inicia o login.',
  questoes: [
    {
      id: 'm02-a01-q1',
      enunciado: 'Qual é a ordem do ciclo básico de execução de uma CPU?',
      alternativas: [
        { texto: 'Busca a instrução na memória, decodifica e executa; depois repete com a próxima.', correta: true, explicacao: 'Correto. Esse é o ciclo descrito no Tanenbaum: buscar, decodificar para determinar operandos e operação, executar, e então buscar a próxima, até o programa parar.' },
        { texto: 'Decodifica, busca e executa.', correta: false, explicacao: 'Não há o que decodificar antes de buscar: a instrução precisa primeiro ser trazida da memória para a CPU.' },
        { texto: 'Executa, busca e decodifica.', correta: false, explicacao: 'A CPU não pode executar uma instrução que ainda não buscou nem decodificou. A ordem é busca → decodifica → executa.' },
        { texto: 'Busca todas as instruções do programa, decodifica todas e depois executa todas.', correta: false, explicacao: 'O ciclo é feito instrução por instrução. Mesmo com pipeline, cada instrução passa pelas três etapas; o pipeline apenas sobrepõe etapas de instruções diferentes.' },
      ],
    },
    {
      id: 'm02-a01-q2',
      enunciado: 'Qual registrador guarda o bit que indica se a CPU está em modo usuário ou em modo núcleo?',
      alternativas: [
        { texto: 'A PSW (palavra de estado do programa).', correta: true, explicacao: 'Correto. A PSW contém os códigos de condição, a prioridade da CPU, o modo de execução (usuário ou núcleo) e outros bits de controle.' },
        { texto: 'O contador de programa (PC).', correta: false, explicacao: 'O PC guarda o endereço da próxima instrução a ser buscada, não o modo de execução.' },
        { texto: 'O ponteiro de pilha (SP).', correta: false, explicacao: 'O SP aponta para o topo da pilha atual na memória, onde ficam parâmetros e variáveis locais das rotinas.' },
        { texto: 'A cache L1.', correta: false, explicacao: 'A cache L1 não é um registrador: é uma memória rápida dentro da CPU que guarda linhas de memória usadas recentemente.' },
      ],
    },
    {
      id: 'm02-a01-q3',
      enunciado: 'O contador de programa (PC) contém:',
      alternativas: [
        { texto: 'O endereço de memória da próxima instrução a ser buscada.', correta: true, explicacao: 'Correto. Depois de buscar uma instrução, o PC é atualizado para apontar para a seguinte. Por isso ele é salvo numa interrupção: indica onde o programa deve continuar.' },
        { texto: 'A instrução que está sendo executada.', correta: false, explicacao: 'O PC guarda um endereço, não a instrução. E aponta para a próxima, pois é atualizado logo após a busca.' },
        { texto: 'Quantas instruções o programa já executou.', correta: false, explicacao: 'Apesar do nome "contador", o PC não conta instruções executadas: ele guarda o endereço da próxima instrução.' },
        { texto: 'O endereço do topo da pilha.', correta: false, explicacao: 'Essa é a função do ponteiro de pilha (SP), outro registrador especial.' },
      ],
    },
    {
      id: 'm02-a01-q4',
      enunciado: 'Sobre a hierarquia de memória, é correto afirmar:',
      alternativas: [
        { texto: 'Quanto mais alta a camada, menor o tempo de acesso, menor a capacidade e maior o custo por bit.', correta: true, explicacao: 'Correto. Registradores (cerca de 1 ns, menos de 1 KB) estão no topo; a fita (cerca de 100 s, centenas de GB) na base. Descendo, o tempo de acesso e a capacidade crescem e o custo por bit cai.' },
        { texto: 'A memória principal é mais rápida que a cache, mas menor.', correta: false, explicacao: 'É o contrário: a cache fica acima da RAM, é mais rápida (cerca de 2 ns contra 10 ns) e menor (MB contra GB).' },
        { texto: 'O disco é mais rápido que a RAM porque guarda os dados de forma permanente.', correta: false, explicacao: 'Ser não volátil não deixa o disco mais rápido. Por ser mecânico, ele leva cerca de 10 ms por acesso, contra cerca de 10 ns da RAM.' },
        { texto: 'Todas as camadas têm o mesmo custo por bit; muda só a velocidade.', correta: false, explicacao: 'A hierarquia existe justamente porque memória rápida é cara. Se o custo fosse igual, bastaria usar só a memória mais rápida.' },
      ],
    },
    {
      id: 'm02-a01-q5',
      enunciado: 'A CPU pede uma palavra e o hardware verifica que a linha correspondente já está na cache. O que acontece?',
      alternativas: [
        { texto: 'É um cache hit: a requisição é atendida pela cache, sem acessar a memória principal pelo barramento.', correta: true, explicacao: 'Correto. Num cache hit a palavra vem da cache em cerca de dois ciclos. Só num cache miss é preciso buscar a linha na memória principal, com penalidade de tempo.' },
        { texto: 'É um cache miss: a linha precisa ser buscada na memória principal.', correta: false, explicacao: 'Cache miss é quando a linha NÃO está na cache. Se ela já está lá, é um cache hit.' },
        { texto: 'O SO é chamado para copiar a linha da cache para a RAM.', correta: false, explicacao: 'A cache é controlada principalmente pelo hardware. O SO não intervém em cada acesso à cache.' },
        { texto: 'A palavra é lida do disco, pois a cache é só uma cópia.', correta: false, explicacao: 'Não há acesso ao disco: a linha está na cache, que é a camada mais rápida depois dos registradores.' },
      ],
    },
    {
      id: 'm02-a01-q6',
      enunciado: 'Num disco magnético, o conjunto de todas as trilhas que ficam sob as cabeças numa mesma posição do braço chama-se:',
      alternativas: [
        { texto: 'Cilindro.', correta: true, explicacao: 'Correto. Em cada posição do braço, cada cabeça lê uma trilha; todas essas trilhas juntas formam um cilindro.' },
        { texto: 'Setor.', correta: false, explicacao: 'Setor é uma divisão de uma trilha (normalmente 512 bytes), não o conjunto de trilhas.' },
        { texto: 'Prato.', correta: false, explicacao: 'Prato é o disco metálico físico que gira. Cada prato tem duas superfícies, e cada superfície tem várias trilhas.' },
        { texto: 'Linha de cache.', correta: false, explicacao: 'Linha de cache é o bloco (normalmente 64 bytes) em que a memória é dividida para a cache; não tem relação com a geometria do disco.' },
      ],
    },
    {
      id: 'm02-a01-q7',
      enunciado: 'Na E/S mapeada em memória:',
      alternativas: [
        { texto: 'Os registradores do controlador aparecem no espaço de endereçamento e são acessados como palavras de memória, sem instruções especiais de E/S.', correta: true, explicacao: 'Correto. A vantagem é dispensar instruções especiais; a desvantagem é consumir parte do espaço de endereçamento. Os programas de usuário são mantidos longe desses endereços com registradores base e limite.' },
        { texto: 'Cada registrador tem um endereço de porta e é acessado pelas instruções IN e OUT.', correta: false, explicacao: 'Isso descreve o espaço de E/S separado (portas de E/S), a outra forma de acessar os registradores dos dispositivos.' },
        { texto: 'O dispositivo copia toda a memória principal para o seu buffer.', correta: false, explicacao: 'Não há cópia da memória para o dispositivo. Mapear em memória significa que alguns endereços correspondem a registradores do controlador.' },
        { texto: 'Qualquer programa de usuário pode escrever livremente nos registradores do dispositivo.', correta: false, explicacao: 'O acesso continua protegido: o SO deixa esses endereços fora do alcance dos programas de usuário (registradores base e limite).' },
      ],
    },
    {
      id: 'm02-a01-q8',
      enunciado: 'Na inicialização de um PC, depois de testar a memória e detectar os dispositivos, o que o BIOS faz?',
      alternativas: [
        { texto: 'Escolhe o dispositivo de inicialização pela lista guardada na CMOS e lê para a memória o primeiro setor desse dispositivo, executando-o.', correta: true, explicacao: 'Correto. O programa do primeiro setor examina a tabela de partições, encontra a partição ativa e lê o carregador secundário, que carrega o SO.' },
        { texto: 'Executa diretamente o programa de login.', correta: false, explicacao: 'O login é a última etapa, iniciada pelo próprio SO depois que ele foi carregado e configurou os drivers.' },
        { texto: 'Carrega todos os drivers de dispositivo no núcleo.', correta: false, explicacao: 'Quem carrega os drivers é o sistema operacional, depois de ser iniciado pelo carregador e consultar o BIOS.' },
        { texto: 'Grava o sistema operacional na flash RAM.', correta: false, explicacao: 'A flash RAM guarda o próprio BIOS. O SO fica no disco e é carregado na RAM a cada inicialização.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm02-a01-d1',
      enunciado: 'Explique o que é a hierarquia de memória e por que ela existe. Descreva o papel da cache e o que são cache hit e cache miss.',
      respostaModelo: `<p>A memória ideal seria ao mesmo tempo muito rápida (para não atrasar a CPU), muito grande e barata. Nenhuma tecnologia atende a esses três requisitos, por isso a memória é organizada em uma <strong>hierarquia de camadas</strong>: registradores, cache, memória principal, disco magnético e fita. As camadas superiores são <strong>mais rápidas, menores e mais caras por bit</strong>; descendo, o tempo de acesso e a capacidade crescem e o custo por bit cai (ex.: registradores cerca de 1 ns e menos de 1 KB; disco cerca de 10 ms e centenas de GB).</p>
<p>A <strong>cache</strong> fica entre os registradores e a memória principal e é controlada principalmente pelo <strong>hardware</strong>. A memória é dividida em <strong>linhas de cache</strong> (ex.: 64 bytes), e as linhas mais usadas ficam na cache. Quando a CPU pede uma palavra que está na cache, ocorre um <strong>cache hit</strong> e ela é obtida em poucos ciclos; quando não está, ocorre um <strong>cache miss</strong> e a linha precisa ser buscada na memória principal, com grande penalidade de tempo. Assim, o sistema tem quase a velocidade da camada rápida com a capacidade da camada lenta.</p>`,
      pontosChave: [
        'Explicou que nenhuma memória é ao mesmo tempo rápida, grande e barata, por isso a hierarquia',
        'Citou as camadas em ordem (registradores, cache, RAM, disco, fita)',
        'Relacionou subir na hierarquia com mais velocidade, menos capacidade e maior custo por bit',
        'Definiu cache hit (palavra na cache) e cache miss (busca na memória principal, mais lenta)',
      ],
    },
  ],
});
