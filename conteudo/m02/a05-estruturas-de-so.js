// Módulo 2, aula 5: estruturas de SO (monolítico, camadas, micronúcleo, cliente-servidor, máquinas virtuais, exonúcleo).
SO1.registerLesson({
  id: 'm02-a05',
  titulo: 'Estruturas de SO',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §1.7 Estrutura de sistemas operacionais (p.37–43): monolíticos, camadas (THE, MULTICS), micronúcleo (MINIX 3), cliente-servidor, máquinas virtuais (VM/370, hipervisores, JVM), exonúcleo',
    'Slides cap1 (Oliveira/Carissimi/Toscani, UFRGS): chamadas de sistema executadas pelo núcleo; variação micro-kernel (serviços básicos)',
    'Silberschatz, §2.7.3 (desvantagem de desempenho do micronúcleo)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: formas de organizar uma empresa.</strong></p>
  <ul>
    <li><strong>Monolítico</strong>: uma empresa pequena em que todos trabalham na mesma sala e qualquer um fala com qualquer um. Rápido, mas, se alguém causa um incêndio, a sala inteira queima.</li>
    <li><strong>Camadas</strong>: andares; cada andar só usa os serviços do andar de baixo.</li>
    <li><strong>Micronúcleo / cliente-servidor</strong>: uma diretoria mínima e departamentos separados, que conversam por memorando (mensagens). Um departamento com problema não derruba os outros.</li>
    <li><strong>Máquina virtual</strong>: um prédio dividido em salas idênticas, cada uma parecendo um escritório completo, onde cada inquilino monta a empresa que quiser.</li>
    <li><strong>Exonúcleo</strong>: o síndico só divide o espaço e confere que ninguém invade a sala do vizinho.</li>
  </ul>
</div>

<p>O Tanenbaum apresenta seis estruturas internas de SO. Elas não são as únicas, mas mostram o espectro de possibilidades.</p>

<h2>1. Sistemas monolíticos</h2>
<p>É de longe a organização mais comum. O <strong>SO inteiro é executado como um único programa em modo núcleo</strong>: uma coleção de rotinas ligadas num único grande programa binário executável. Cada rotina pode chamar qualquer outra, sem restrição, o que é eficiente, mas milhares de rotinas chamando umas às outras tornam o sistema difícil de compreender. <strong>Não há ocultação de informação</strong>: toda rotina é visível a todas as outras.</p>
<p>Mesmo assim há um mínimo de estrutura. Uma chamada de sistema coloca os parâmetros num local definido e executa um <strong>trap</strong>; o SO busca os parâmetros, descobre qual chamada é e usa uma tabela para achar a rotina que a atende. Daí a estrutura básica em três níveis:</p>
<ol>
  <li>um <strong>programa principal</strong>, que invoca a rotina de serviço requisitada;</li>
  <li>um conjunto de <strong>rotinas de serviço</strong>, que executam as chamadas de sistema;</li>
  <li>um conjunto de <strong>rotinas utilitárias</strong>, que auxiliam as rotinas de serviço (ex.: buscar dados dos programas de usuário).</li>
</ol>
<p>Muitos SOs monolíticos aceitam <strong>extensões carregáveis</strong> sob demanda, como drivers de E/S e sistemas de arquivos.</p>

<h2>2. Sistemas de camadas</h2>
<p>O SO é organizado como uma <strong>hierarquia de camadas</strong>, cada uma construída sobre a imediatamente inferior. O primeiro foi o <strong>THE</strong> (Technische Hogeschool Eindhoven, Holanda), de <strong>E. W. Dijkstra e alunos, 1968</strong>, um sistema em lote com <strong>seis camadas</strong>:</p>
<table>
  <tr><th>Camada</th><th>Função</th></tr>
  <tr><td>5</td><td>O operador</td></tr>
  <tr><td>4</td><td>Programas de usuário</td></tr>
  <tr><td>3</td><td>Gerenciamento de entrada/saída</td></tr>
  <tr><td>2</td><td>Comunicação operador–processo</td></tr>
  <tr><td>1</td><td>Memória e gerenciamento de tambor</td></tr>
  <tr><td>0</td><td>Alocação do processador e multiprogramação</td></tr>
</table>
<p>A camada 0 chaveava os processos quando ocorriam interrupções ou quando os temporizadores expiravam; acima dela, cada processo podia ser programado sem se preocupar com os demais. A camada 1 movia páginas entre a memória e o tambor magnético; acima dela, ninguém precisava saber onde estava cada página. E assim por diante. No THE, as camadas eram só um <strong>suporte ao projeto</strong>: no fim, tudo era ligado num único programa.</p>
<p>O <strong>MULTICS</strong> generalizou a ideia com <strong>anéis concêntricos</strong>, cada anel interno mais privilegiado que os externos. Para chamar uma rotina de um anel interno, era preciso o equivalente a uma chamada de sistema (TRAP, com validação dos parâmetros). Lá, ao contrário do THE, o mecanismo era <strong>reforçado pelo hardware em tempo de execução</strong>.</p>

<h2>3. Micronúcleo (microkernel)</h2>
<p>Erros no núcleo podem derrubar o sistema instantaneamente; erros em processos de usuário, não. Estima-se cerca de <strong>dez erros a cada mil linhas</strong> de código: um núcleo monolítico de cinco milhões de linhas teria uns 50 mil erros. A ideia do micronúcleo é colocar o <strong>mínimo possível em modo núcleo</strong>: dividir o SO em módulos pequenos e bem definidos, dos quais <strong>só um, o micronúcleo, roda em modo núcleo</strong>; o resto roda como <strong>processos de usuário</strong> comuns, com relativamente pouco poder. Os slides do cap1 resumem: o micro-kernel oferece apenas os <strong>serviços básicos</strong>.</p>
<p>Com cada driver e sistema de arquivos num processo separado, um erro neles pode derrubar <strong>aquele componente</strong>, mas não o sistema inteiro. Exemplo do livro: num micronúcleo, um driver de áudio defeituoso faz o som falhar, mas não trava o computador; num sistema monolítico, ele pode escrever num endereço inválido e parar o sistema.</p>
<p>O exemplo detalhado é o <strong>MINIX 3</strong>: o micronúcleo tem cerca de <strong>3.200 linhas de C e 800 de assembler</strong> e oferece cerca de <strong>35 chamadas de núcleo</strong>. Ele trata interrupções, processos, escalonamento e a comunicação entre processos (mensagens). Fora dele, em modo usuário, há três camadas: <strong>drivers</strong> (exceto o driver do relógio, que fica no núcleo, porque interage de perto com o escalonador), <strong>servidores</strong> (sistema de arquivos, gerenciador de processos, e o <strong>servidor de reencarnação</strong>, que verifica se os outros estão funcionando e substitui automaticamente um defeituoso) e <strong>programas de usuário</strong>. Outros micronúcleos: Integrity, K42, L4, PikeOS, QNX, Symbian. São comuns em sistemas de tempo real, industriais, aviônicos e militares, que exigem alta confiabilidade.</p>
<p>Ideia relacionada: separar <strong>mecanismo</strong> (no núcleo) de <strong>política</strong> (fora dele). Ex.: no escalonamento, o núcleo apenas procura o processo de maior prioridade e o executa (mecanismo); quem atribui as prioridades pode ser um processo de usuário (política).</p>

<figure class="diagrama">
  <svg viewBox="0 0 520 250" style="max-width:640px" role="img" aria-label="Comparação: no monolítico, tudo em modo núcleo; no micronúcleo, só o micronúcleo em modo núcleo e drivers e servidores em modo usuário">
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <text x="125" y="18" font-weight="bold">Monolítico</text>
      <text x="390" y="18" font-weight="bold">Micronúcleo</text>
    </g>
    <line x1="10" y1="100" x2="510" y2="100" stroke="currentColor" stroke-dasharray="6 4"/>
    <g font-size="11" fill="currentColor">
      <text x="12" y="95">modo usuário ↑</text>
      <text x="12" y="114">modo núcleo ↓</text>
    </g>
    <g font-size="12" text-anchor="middle" fill="currentColor">
      <rect x="30" y="35" width="190" height="45" rx="6" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <text x="125" y="62">Programas de usuário</text>
      <rect x="30" y="120" width="190" height="115" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="125" y="142" font-weight="bold">Núcleo único</text>
      <text x="125" y="162">escalonamento, memória,</text>
      <text x="125" y="178">sistema de arquivos,</text>
      <text x="125" y="194">drivers, rede...</text>
      <text x="125" y="220" font-size="11" style="fill:var(--vermelho)">erro num driver derruba tudo</text>

      <rect x="280" y="28" width="70" height="28" rx="14" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <text x="315" y="47" font-size="11">Shell</text>
      <rect x="355" y="28" width="70" height="28" rx="14" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <text x="390" y="47" font-size="11">Editor</text>
      <rect x="430" y="28" width="60" height="28" rx="14" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <text x="460" y="47" font-size="11">...</text>
      <rect x="280" y="62" width="70" height="28" rx="14" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
      <text x="315" y="81" font-size="11">Arquivos</text>
      <rect x="355" y="62" width="70" height="28" rx="14" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
      <text x="390" y="81" font-size="11">Driver disco</text>
      <rect x="430" y="62" width="60" height="28" rx="14" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
      <text x="460" y="81" font-size="11">Reencarn.</text>
      <rect x="290" y="120" width="190" height="50" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="385" y="141" font-weight="bold">Micronúcleo</text>
      <text x="385" y="159" font-size="11">interrupções, processos, escalon., IPC</text>
      <text x="385" y="195" font-size="11">drivers e servidores = processos de</text>
      <text x="385" y="210" font-size="11">usuário, que trocam mensagens</text>
      <text x="385" y="230" font-size="11" style="fill:var(--verde)">erro num driver derruba só ele</text>
    </g>
  </svg>
  <figcaption>Monolítico x micronúcleo. No micronúcleo, drivers e servidores (em âmbar) saem do núcleo e viram processos de usuário; o núcleo fica pequeno e mais confiável.</figcaption>
</figure>

<h2>4. Modelo cliente-servidor</h2>
<p>Uma variação da ideia do micronúcleo: distinguir duas classes de processos, os <strong>servidores</strong>, que prestam algum serviço, e os <strong>clientes</strong>, que usam esses serviços. Frequentemente a camada inferior é um micronúcleo, mas isso não é obrigatório. A comunicação é por <strong>troca de mensagens</strong>: o cliente monta uma mensagem dizendo o que deseja e a envia ao servidor, que faz o trabalho e devolve a resposta. Como o cliente só envia e recebe mensagens, ele não precisa saber se o servidor está <strong>na mesma máquina ou em outra, pela rede</strong>. A Web é um uso típico: o navegador (cliente) pede uma página ao servidor Web.</p>

<h2>5. Máquinas virtuais</h2>
<p>O <strong>VM/370</strong> da IBM (originalmente CP/CMS) partiu de uma observação: um sistema de tempo compartilhado fornece (1) <strong>multiprogramação</strong> e (2) uma <strong>máquina estendida</strong> mais conveniente que o hardware. A essência do VM/370 é <strong>separar completamente essas duas funções</strong>.</p>
<ul>
  <li>O <strong>monitor de máquina virtual</strong> executa diretamente sobre o hardware e faz a multiprogramação, fornecendo várias <strong>máquinas virtuais</strong> à camada de cima.</li>
  <li>Essas máquinas virtuais <strong>não</strong> são máquinas estendidas: são <strong>cópias exatas do hardware</strong>, inclusive com modo núcleo/usuário, E/S e interrupções.</li>
  <li>Por isso, cada uma pode executar <strong>qualquer SO</strong>. No VM/370, rodavam OS/360 (lote, transações) e o <strong>CMS</strong>, um SO monousuário interativo. A chamada de sistema do programa CMS vai para o CMS da própria máquina virtual; as instruções de E/S que o CMS emite são desviadas (trap) para o VM/370, que as simula no hardware real.</li>
</ul>
<p><strong>Hoje</strong> o monitor de máquina virtual se chama <strong>hipervisor</strong>. Usos: consolidar vários servidores numa só máquina física (uma falha num não afeta os outros), hospedagem Web com máquinas virtuais alugadas, e usuários que querem rodar Windows e Linux ao mesmo tempo.</p>
<table>
  <tr><th>Tipo</th><th>Onde roda</th><th>Exemplo</th></tr>
  <tr><td><strong>Hipervisor tipo 1</strong></td><td>Diretamente sobre o hardware; os SOs (Windows, Linux...) rodam sobre ele.</td><td>O "monitor de máquina virtual" clássico, como o VM/370.</td></tr>
  <tr><td><strong>Hipervisor tipo 2</strong></td><td>Como um programa aplicativo sobre um <strong>SO hospedeiro</strong> (Windows, Linux); o <strong>SO hóspede</strong> roda dentro dele.</td><td>VMware Workstation.</td></tr>
</table>
<p>Para virtualizar, a CPU precisa ser <strong>virtualizável</strong>: quando um SO numa máquina virtual (em modo usuário) executa uma instrução privilegiada, o hardware deve gerar um trap para o hipervisor emular a instrução. Nos Pentium antigos, algumas dessas instruções eram simplesmente <strong>ignoradas</strong> em modo usuário, o que impedia a virtualização; a solução veio com hipervisores que traduzem o código e, depois, com a <strong>paravirtualização</strong> (modificar o SO hóspede para chamar o hipervisor em vez de executar instruções sensíveis).</p>
<p>Outro uso, um pouco diferente: a <strong>JVM</strong> (máquina virtual Java). O compilador Java gera código para a JVM, que é executado por um interpretador; assim o mesmo código roda em qualquer computador com uma JVM, num ambiente protegido.</p>

<h2>6. Exonúcleo</h2>
<p>Em vez de <strong>clonar</strong> a máquina real (como nas máquinas virtuais), o exonúcleo a <strong>divide</strong>: cada usuário recebe um <strong>subconjunto dos recursos</strong>. Ex.: uma máquina virtual fica com os blocos 0 a 1.023 do disco; outra, com os blocos 1.024 a 2.047. Na camada mais baixa, em modo núcleo, o <strong>exonúcleo</strong> aloca os recursos às máquinas virtuais e verifica as tentativas de uso, garantindo que nenhuma use recursos de outra. Cada máquina virtual roda o seu próprio SO em nível de usuário. Vantagens: <strong>dispensa a camada de mapeamento</strong> (nas máquinas virtuais, cada uma acha que tem o disco começando no bloco 0, e o monitor precisa remapear; aqui basta registrar qual recurso é de quem) e separa, com menor custo, a multiprogramação (no exonúcleo) do código do SO do usuário.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: um driver de áudio com bug escreve num endereço de memória inválido.</strong></p>
  <table>
    <tr><th>Estrutura</th><th>Onde está o driver</th><th>O que acontece</th></tr>
    <tr><td><strong>Monolítico</strong></td><td>Dentro do núcleo, em modo núcleo, com acesso a toda a memória.</td><td>A escrita pode corromper estruturas do núcleo: o <strong>sistema inteiro pode travar</strong>.</td></tr>
    <tr><td><strong>Camadas (THE)</strong></td><td>Na camada de E/S, mas tudo ligado num único programa.</td><td>A organização ajuda no projeto, mas não impede o estrago em tempo de execução. (No MULTICS, os anéis protegidos pelo hardware limitariam o dano.)</td></tr>
    <tr><td><strong>Micronúcleo (MINIX 3)</strong></td><td>Processo de usuário separado, sem acesso direto à memória dos outros.</td><td>O hardware gera uma exceção e só o driver é afetado: o som para. O <strong>servidor de reencarnação</strong> detecta a falha e reinicia o driver sozinho.</td></tr>
    <tr><td><strong>Máquina virtual</strong></td><td>Dentro do SO de uma máquina virtual.</td><td>Na pior hipótese, cai o SO daquela máquina virtual; as outras e o hipervisor continuam.</td></tr>
  </table>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>No <strong>monolítico</strong> também há chamadas de sistema com trap e alguma estrutura (programa principal, serviço, utilitárias); o que falta é <strong>ocultação de informação</strong> e isolamento.</li>
    <li>No <strong>micronúcleo</strong>, os drivers e o sistema de arquivos rodam em <strong>modo usuário</strong>. A vantagem é <strong>confiabilidade</strong>; o custo costuma ser <strong>desempenho</strong> (mais trocas de mensagens e de modo).</li>
    <li>A máquina virtual do VM/370 é uma <strong>cópia exata do hardware</strong>, e <strong>não</strong> uma máquina estendida: quem oferece a máquina estendida é o SO que roda dentro dela (o CMS).</li>
    <li>Hipervisor <strong>tipo 1</strong> roda direto no hardware; <strong>tipo 2</strong> roda sobre um SO hospedeiro (VMware Workstation).</li>
    <li>Máquina virtual <strong>clona</strong> a máquina; exonúcleo <strong>divide</strong> os recursos.</li>
  </ul>
</div>
`,
  resumo: 'Monolítico: o SO inteiro é um único programa em modo núcleo, com rotinas que se chamam livremente (programa principal, rotinas de serviço e utilitárias). Camadas: hierarquia em que cada camada usa a de baixo (THE, de Dijkstra, com 6 camadas; MULTICS com anéis). Micronúcleo: só um núcleo mínimo em modo núcleo; drivers e servidores são processos de usuário, o que aumenta a confiabilidade (MINIX 3, servidor de reencarnação). Cliente-servidor: clientes pedem serviços a servidores por mensagens, local ou pela rede. Máquinas virtuais: o monitor (hipervisor) separa multiprogramação de máquina estendida e oferece cópias exatas do hardware (VM/370; hipervisor tipo 1 e tipo 2). Exonúcleo: divide os recursos entre máquinas virtuais e só verifica o uso, sem remapear.',
  questoes: [
    {
      id: 'm02-a05-q1',
      enunciado: 'Qual é a característica principal de um sistema operacional monolítico?',
      alternativas: [
        { texto: 'O SO inteiro executa como um único programa em modo núcleo, e cada rotina pode chamar qualquer outra.', correta: true, explicacao: 'Correto. É a organização mais comum: uma coleção de rotinas ligadas num único binário, sem ocultação de informação. É eficiente, mas um erro em qualquer parte pode derrubar o sistema.' },
        { texto: 'Só um núcleo mínimo roda em modo núcleo; drivers e servidores rodam em modo usuário.', correta: false, explicacao: 'Essa é a descrição do micronúcleo, praticamente o oposto do monolítico.' },
        { texto: 'Cada camada só pode usar os serviços da camada imediatamente inferior.', correta: false, explicacao: 'Essa é a organização em camadas (como o THE). No monolítico, qualquer rotina chama qualquer outra.' },
        { texto: 'O SO oferece cópias exatas do hardware para que cada usuário rode outro SO.', correta: false, explicacao: 'Essa é a ideia das máquinas virtuais (VM/370, hipervisores).' },
      ],
    },
    {
      id: 'm02-a05-q2',
      enunciado: 'No sistema THE, de Dijkstra, qual era a função da camada 0?',
      alternativas: [
        { texto: 'Alocação do processador e multiprogramação: chavear processos nas interrupções e quando os temporizadores expiravam.', correta: true, explicacao: 'Correto. Acima da camada 0, cada processo podia ser programado como se estivesse sozinho, sem se preocupar com os outros na mesma CPU.' },
        { texto: 'Gerenciamento de memória e do tambor magnético.', correta: false, explicacao: 'Essa era a camada 1, que movia páginas entre a memória principal e o tambor.' },
        { texto: 'Programas de usuário.', correta: false, explicacao: 'Os programas de usuário ficavam na camada 4; acima deles, só o operador (camada 5).' },
        { texto: 'Gerenciamento de entrada/saída.', correta: false, explicacao: 'A E/S ficava na camada 3, que oferecia dispositivos abstratos às camadas de cima.' },
      ],
    },
    {
      id: 'm02-a05-q3',
      enunciado: 'Qual é a principal vantagem do micronúcleo em relação ao monolítico?',
      alternativas: [
        { texto: 'Confiabilidade: como drivers e servidores rodam como processos de usuário, um erro num deles derruba só aquele componente, não o sistema inteiro.', correta: true, explicacao: 'Correto. É o argumento do Tanenbaum: erros no núcleo derrubam o sistema; erros em processos de usuário, não. Colocar o mínimo no núcleo reduz o código "perigoso".' },
        { texto: 'Desempenho maior, pois tudo roda em modo núcleo sem trocas de mensagem.', correta: false, explicacao: 'É o contrário: no micronúcleo os componentes trocam mensagens e mudam de modo com mais frequência. O ponto forte é confiabilidade, não desempenho.' },
        { texto: 'Não precisa de modo usuário e modo núcleo.', correta: false, explicacao: 'O micronúcleo depende justamente dessa separação: só ele roda em modo núcleo, e o resto, em modo usuário.' },
        { texto: 'Dispensa o uso de interrupções.', correta: false, explicacao: 'O micronúcleo continua tratando as interrupções; no MINIX 3, essa é uma das suas poucas funções.' },
      ],
    },
    {
      id: 'm02-a05-q4',
      enunciado: 'No MINIX 3, qual é a função do servidor de reencarnação?',
      alternativas: [
        { texto: 'Verificar se os outros servidores e drivers estão funcionando e substituir automaticamente um componente defeituoso, sem intervenção do usuário.', correta: true, explicacao: 'Correto. Assim o sistema se autorrecupera e atinge alta confiabilidade, algo possível porque os drivers são processos separados.' },
        { texto: 'Reiniciar o computador inteiro sempre que um driver falha.', correta: false, explicacao: 'O objetivo é justamente evitar reiniciar tudo: só o componente defeituoso é substituído.' },
        { texto: 'Criar novos processos de usuário a pedido do shell.', correta: false, explicacao: 'Criar processos é tarefa do gerenciador de processos, outro servidor.' },
        { texto: 'Escalonar os processos por prioridade.', correta: false, explicacao: 'O mecanismo de escalonamento fica no micronúcleo; o servidor de reencarnação só monitora e substitui componentes.' },
      ],
    },
    {
      id: 'm02-a05-q5',
      enunciado: 'No modelo cliente-servidor, como os clientes obtêm os serviços?',
      alternativas: [
        { texto: 'Enviando mensagens aos servidores, que fazem o trabalho e devolvem a resposta; o cliente não precisa saber se o servidor está na mesma máquina ou na rede.', correta: true, explicacao: 'Correto. A troca de mensagens torna o modelo uma abstração que serve tanto para uma única máquina quanto para uma rede (como na Web).' },
        { texto: 'Chamando diretamente as rotinas do servidor, como no sistema monolítico.', correta: false, explicacao: 'Clientes e servidores são processos separados; a comunicação é por mensagens, não por chamadas diretas de rotina.' },
        { texto: 'Lendo a memória do servidor diretamente.', correta: false, explicacao: 'Os processos são isolados; um cliente não acessa a memória do servidor. Por isso usam mensagens.' },
        { texto: 'Só funciona se cliente e servidor estiverem na mesma máquina.', correta: false, explicacao: 'Uma vantagem do modelo é justamente funcionar igual em uma máquina ou em várias, pela rede.' },
      ],
    },
    {
      id: 'm02-a05-q6',
      enunciado: 'Qual foi a ideia central do VM/370?',
      alternativas: [
        { texto: 'Separar completamente a multiprogramação (feita pelo monitor de máquina virtual) da máquina estendida (oferecida pelo SO de cada máquina virtual, como o CMS).', correta: true, explicacao: 'Correto. O monitor oferece cópias exatas do hardware, e cada máquina virtual roda o SO que quiser. Essa separação deixa cada parte mais simples e flexível.' },
        { texto: 'Oferecer a cada usuário uma máquina estendida com arquivos e outras abstrações convenientes.', correta: false, explicacao: 'As máquinas virtuais do VM/370 NÃO são máquinas estendidas: são cópias exatas do hardware, com modo núcleo/usuário, E/S e interrupções.' },
        { texto: 'Dividir os blocos do disco entre usuários sem remapeamento.', correta: false, explicacao: 'Isso descreve o exonúcleo, que divide os recursos em vez de clonar a máquina.' },
        { texto: 'Executar todo o SO como um único programa em modo núcleo.', correta: false, explicacao: 'Isso descreve o sistema monolítico.' },
      ],
    },
    {
      id: 'm02-a05-q7',
      enunciado: 'O VMware Workstation roda como um programa sobre o Windows, e dentro dele roda um Linux. Ele é um exemplo de:',
      alternativas: [
        { texto: 'Hipervisor tipo 2: roda sobre um SO hospedeiro, e o Linux é o SO hóspede.', correta: true, explicacao: 'Correto. O Tanenbaum cita o VMware Workstation como hipervisor tipo 2, executado como aplicativo sobre Windows ou Linux.' },
        { texto: 'Hipervisor tipo 1: roda diretamente sobre o hardware.', correta: false, explicacao: 'O tipo 1 roda direto no hardware, sem SO hospedeiro. Aqui há o Windows por baixo.' },
        { texto: 'Exonúcleo.', correta: false, explicacao: 'O exonúcleo divide recursos entre máquinas virtuais a partir do modo núcleo; não é um aplicativo sobre outro SO.' },
        { texto: 'Micronúcleo.', correta: false, explicacao: 'Micronúcleo é uma forma de estruturar um SO (núcleo mínimo), não um programa que executa outros SOs.' },
      ],
    },
    {
      id: 'm02-a05-q8',
      enunciado: 'Qual é a diferença entre as máquinas virtuais (como no VM/370) e o exonúcleo?',
      alternativas: [
        { texto: 'A máquina virtual clona a máquina real; o exonúcleo divide os recursos, dando a cada usuário um subconjunto, e só verifica se ninguém usa o recurso de outro.', correta: true, explicacao: 'Correto. Com isso o exonúcleo dispensa a camada de mapeamento: não precisa traduzir "bloco 0 da máquina virtual" para o bloco real, basta registrar qual recurso é de quem.' },
        { texto: 'O exonúcleo roda todo o SO em modo núcleo; a máquina virtual, em modo usuário.', correta: false, explicacao: 'No exonúcleo, só ele roda em modo núcleo; cada máquina virtual roda o seu SO em nível de usuário.' },
        { texto: 'Não há diferença: são nomes diferentes para a mesma coisa.', correta: false, explicacao: 'São estratégias diferentes: clonar (cópia exata do hardware, com remapeamento) x dividir (subconjunto dos recursos, sem remapeamento).' },
        { texto: 'Máquinas virtuais não permitem rodar SOs diferentes ao mesmo tempo.', correta: false, explicacao: 'Permitem: no VM/370, OS/360 e CMS rodavam em máquinas virtuais diferentes ao mesmo tempo.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm02-a05-d1',
      enunciado: 'Compare a estrutura monolítica com a estrutura de micronúcleo, apontando vantagens e desvantagens de cada uma.',
      respostaModelo: `<p><strong>Monolítico</strong>: o SO inteiro é um único programa executado em <strong>modo núcleo</strong>, formado por rotinas ligadas num só binário; cada rotina pode chamar qualquer outra. Há uma estrutura mínima (programa principal, rotinas de serviço e utilitárias), e extensões como drivers podem ser carregadas sob demanda. <em>Vantagem</em>: eficiência, pois as rotinas se chamam diretamente, sem mensagens nem trocas de modo. <em>Desvantagens</em>: falta de ocultação de informação (difícil de entender e manter) e baixa tolerância a falhas: um erro em qualquer parte, como um driver, pode derrubar o sistema inteiro.</p>
<p><strong>Micronúcleo</strong>: apenas um núcleo mínimo roda em modo núcleo (interrupções, processos, escalonamento, comunicação entre processos); drivers, sistema de arquivos e gerência de processos rodam como <strong>processos de usuário</strong>, que se comunicam por <strong>mensagens</strong>. <em>Vantagens</em>: <strong>confiabilidade</strong> e modularidade, pois um erro num driver derruba só aquele componente, que pode até ser substituído automaticamente (servidor de reencarnação do MINIX 3); o núcleo é pequeno (MINIX 3: cerca de 3.200 linhas de C). <em>Desvantagem</em>: desempenho menor, por causa das trocas de mensagens e de modo entre os componentes. É comum em sistemas de tempo real, industriais e militares, que exigem alta confiabilidade.</p>`,
      pontosChave: [
        'Descreveu o monolítico: SO inteiro como um programa em modo núcleo, rotinas que se chamam livremente',
        'Descreveu o micronúcleo: núcleo mínimo em modo núcleo, drivers e servidores em modo usuário com mensagens',
        'Vantagem do monolítico: eficiência; desvantagem: um erro pode derrubar o sistema / difícil de manter',
        'Vantagem do micronúcleo: confiabilidade/modularidade; desvantagem: desempenho (mensagens e trocas de modo)',
      ],
    },
  ],
});
