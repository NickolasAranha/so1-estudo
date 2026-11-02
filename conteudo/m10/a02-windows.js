// Módulo 10, aula 2: estudo de caso Windows — processos e threads, escalonamento por prioridades, memória virtual, NTFS.
SO1.registerLesson({
  id: 'm10-a02',
  titulo: 'Estudo de caso: Windows',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §11.1 (história: MS-DOS, Windows 9x, NT, p.502–505) e §11.3 (estrutura, p.513)',
    'Tanenbaum, SO Modernos 3ª ed., §11.4 (processos, threads, tarefas e filamentos; CreateProcess; escalonamento, Tab. 11.15 e Fig. 11.13, p.532–543)',
    'Tanenbaum, SO Modernos 3ª ed., §11.5.1 (memória virtual, p.543–545)',
    'Tanenbaum, SO Modernos 3ª ed., §11.8 (NTFS, MFT, Fig. 11.24, p.560–563)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: uma empresa.</strong> O <strong>processo</strong> é como um <em>projeto</em>: tem sala, armários e verba (espaço de endereçamento, arquivos abertos, recursos), mas sozinho não faz nada. Quem trabalha são os <strong>funcionários</strong>, as <strong>threads</strong>. O gerente que distribui o trabalho (o escalonador) olha para os funcionários, não para os projetos: escolhe sempre o funcionário de maior urgência que está livre para trabalhar.</p>
</div>

<h2>De onde vem o Windows atual</h2>
<ul>
  <li><strong>MS-DOS</strong> (1981): monousuário e monotarefa, linha de comando.</li>
  <li><strong>Windows 95/98/Me</strong>: ainda <strong>baseados no MS-DOS</strong>.</li>
  <li><strong>Windows NT</strong> (1993, projeto liderado por <strong>Dave Cutler</strong>): reescrito do zero, 32 bits, multiprogramado, com proteção de memória e pensado para multiprocessadores. <strong>Windows 2000, XP, Vista, 7, 8, 10 e 11 são todos da família NT.</strong> O Tanenbaum descreve o Vista, mas os conceitos abaixo continuam valendo.</li>
</ul>
<p>Estrutura: no modo núcleo ficam a <strong>HAL</strong> (camada de abstração de hardware, que esconde diferenças entre placas), o <strong>núcleo</strong> (escalonamento, interrupções, sincronização), o <strong>executivo</strong> (gerenciadores de processos, memória, E/S, objetos) e os drivers. Os programas usam a API <strong>Win32</strong>, que chama as funções nativas do núcleo.</p>

<h2>Processos e threads</h2>
<table>
  <tr><th>Conceito</th><th>O que é</th></tr>
  <tr><td><strong>Tarefa</strong> (<em>job</em>)</td><td>Agrupa processos para aplicar limites comuns (cotas de CPU, memória). Opcional (hoje usada, por exemplo, em sandboxes e contêineres).</td></tr>
  <tr><td><strong>Processo</strong></td><td><strong>Contêiner de recursos</strong>: espaço de endereçamento virtual, descritores (<em>handles</em>) para objetos do núcleo (arquivos, semáforos...), token de segurança e threads. Tem um <strong>PEB</strong> (bloco do ambiente do processo) com a lista de DLLs carregadas, variáveis de ambiente etc.</td></tr>
  <tr><td><strong>Thread</strong></td><td><strong>Unidade de escalonamento</strong>. Tem prioridade, duas pilhas (modo usuário e modo núcleo) e um <strong>TEB</strong> (bloco do ambiente da thread). Todo processo começa com uma thread.</td></tr>
  <tr><td><strong>Filamento</strong> (<em>fiber</em>)</td><td>"Thread leve" escalonada pelo próprio programa, em modo usuário (o núcleo não sabe que existe). Trocar de filamento é muito mais barato que trocar de thread, pois não entra no núcleo.</td></tr>
</table>
<p><strong>Criação:</strong> no Windows não há fork. Uma única chamada, <strong>CreateProcess</strong>, cria o processo <em>e</em> já carrega nele o programa indicado, com uma thread inicial. Ela recebe muitos parâmetros (programa, linha de comando, atributos de segurança, herança de handles, prioridade...). Compare com o UNIX, que separa a criação (fork) da troca de programa (exec).</p>

<h2>Escalonamento por prioridades</h2>
<p>O escalonador do Windows é <strong>preemptivo por prioridades</strong> e escolhe <strong>threads</strong>, sem olhar a qual processo pertencem. Não existe uma "thread escalonadora": o código do escalonador roda quando a thread atual <strong>bloqueia</strong> (semáforo, E/S...), <strong>sinaliza um objeto</strong> (pode ter liberado alguém mais prioritário), seu <strong>quantum expira</strong>, uma <strong>E/S termina</strong> ou uma <strong>espera temporizada expira</strong>.</p>
<ul>
  <li>Há <strong>32 prioridades, de 0 a 31</strong>. <strong>Número maior = prioridade maior.</strong></li>
  <li><strong>16 a 31: tempo real</strong> (prioridade fixa, nunca é ajustada pelo sistema). Usuário comum não pode usar.</li>
  <li><strong>1 a 15: threads de usuário</strong> (prioridade variável).</li>
  <li><strong>0</strong>: a thread <em>ZeroPage</em>, que zera páginas livres quando não há mais nada a fazer.</li>
  <li>Há uma fila de prontos por prioridade. O escalonador pega a primeira thread da fila não vazia de maior número; dentro de um mesmo nível o revezamento é <strong>circular (Round Robin)</strong>, um quantum por vez.</li>
</ul>
<p>A <strong>prioridade-base</strong> de uma thread vem da combinação da <strong>classe de prioridade do processo</strong> (definida por SetPriorityClass) com a <strong>prioridade relativa da thread</strong> (SetThreadPriority). Parte da Tabela 11.15:</p>
<table>
  <tr><th>Thread \\ Classe do processo</th><th>Tempo real</th><th>Alta</th><th>Acima do normal</th><th>Normal</th><th>Abaixo do normal</th><th>Ociosa</th></tr>
  <tr><td>Tempo crítico</td><td>31</td><td>15</td><td>15</td><td>15</td><td>15</td><td>15</td></tr>
  <tr><td>A mais alta</td><td>26</td><td>15</td><td>12</td><td>10</td><td>8</td><td>6</td></tr>
  <tr><td>Acima do normal</td><td>25</td><td>14</td><td>11</td><td>9</td><td>7</td><td>5</td></tr>
  <tr><td><strong>Normal</strong></td><td>24</td><td>13</td><td>10</td><td><strong>8</strong></td><td>6</td><td>4</td></tr>
  <tr><td>Abaixo do normal</td><td>23</td><td>12</td><td>9</td><td>7</td><td>5</td><td>3</td></tr>
  <tr><td>A mais baixa</td><td>22</td><td>11</td><td>8</td><td>6</td><td>4</td><td>2</td></tr>
  <tr><td>Ociosa</td><td>16</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
</table>
<h3>Prioridade atual: aumentos temporários (boosts)</h3>
<p>A prioridade usada para escolher a fila é a <strong>prioridade atual</strong>, que pode subir acima da base (<strong>mas nunca acima de 15</strong>) e depois volta:</p>
<ul>
  <li>Quando uma <strong>E/S termina</strong> e libera a thread: +1 para disco, +2 para porta serial, <strong>+6 para teclado</strong>, +8 para placa de som. Assim, quem faz E/S volta logo a usar o dispositivo e os programas interativos respondem rápido.</li>
  <li>Quando a thread é liberada de um <strong>semáforo, mutex ou evento</strong>: +2 se pertence ao processo em primeiro plano, +1 caso contrário.</li>
  <li>A cada <strong>quantum inteiro</strong> que a thread usa, a prioridade cai 1, até voltar à base.</li>
  <li>Contra a <strong>inanição</strong> e a <strong>inversão de prioridade</strong>: se uma thread pronta não executa há muito tempo, ela vai para 15 por dois quanta (por exemplo, para poder liberar um semáforo que uma thread mais prioritária espera).</li>
  <li><strong>Quantum</strong>: no Vista, 20 ms na versão cliente e 180 ms na de servidor; a janela em primeiro plano ganha quantum maior.</li>
</ul>

<figure class="diagrama">
  <svg viewBox="0 0 500 290" style="max-width:620px" role="img" aria-label="Vetor de 32 prioridades: 16 a 31 tempo real, 1 a 15 usuário, 0 ZeroPage; o escalonador pega a fila não vazia de maior número">
    <g font-size="12" fill="currentColor">
      <rect x="140" y="20" width="60" height="110" style="fill:var(--vermelho-claro);stroke:var(--vermelho)"/>
      <rect x="140" y="130" width="60" height="120" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <rect x="140" y="250" width="60" height="14" style="fill:var(--linha)" stroke="currentColor"/>
      <text x="132" y="30" text-anchor="end">31</text>
      <text x="132" y="128" text-anchor="end">16</text>
      <text x="132" y="146" text-anchor="end">15</text>
      <text x="132" y="215" text-anchor="end">8</text>
      <text x="132" y="248" text-anchor="end">1</text>
      <text x="132" y="262" text-anchor="end">0</text>
      <text x="20" y="70" style="fill:var(--vermelho)" font-weight="bold">Tempo real</text>
      <text x="20" y="86">prioridade fixa</text>
      <text x="20" y="180" style="fill:var(--azul)" font-weight="bold">Usuário</text>
      <text x="20" y="196">prioridade variável</text>
      <text x="20" y="276">ZeroPage</text>
    </g>
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <path d="M200 50 H240"/><path d="M200 145 H240"/><path d="M200 211 H240"/>
    </g>
    <g fill="none" stroke="currentColor">
      <circle cx="252" cy="50" r="10" style="stroke:var(--vermelho)" stroke-width="2"/>
      <circle cx="252" cy="145" r="10"/><circle cx="278" cy="145" r="10"/>
      <circle cx="252" cy="211" r="10"/><circle cx="278" cy="211" r="10"/><circle cx="304" cy="211" r="10"/><circle cx="330" cy="211" r="10"/>
    </g>
    <g font-size="12" fill="currentColor">
      <text x="272" y="46">← próxima a executar</text>
      <text x="272" y="62">(fila não vazia de maior nº)</text>
      <text x="300" y="150">E/S de teclado: 8 → até 14</text>
      <text x="345" y="216">várias threads em 8:</text>
      <text x="345" y="232">Round Robin entre elas</text>
    </g>
  </svg>
  <figcaption>Uma fila de threads prontas para cada uma das 32 prioridades. Os boosts movem threads de usuário temporariamente para filas mais altas, sem passar de 15.</figcaption>
</figure>

<h2>Memória virtual</h2>
<ul>
  <li>Cada processo tem seu <strong>próprio espaço de endereçamento virtual</strong>. No x86 de 32 bits são <strong>4 GB</strong>: em geral <strong>2 GB para o modo usuário</strong> e 2 GB para o modo núcleo (compartilhados entre todos os processos); opcionalmente 3 GB para o usuário. Nos sistemas de 64 bits o espaço é muito maior.</li>
  <li><strong>Paginação sob demanda</strong> com páginas de <strong>4 KB</strong> (às vezes páginas grandes de 4 MB).</li>
  <li>Os primeiros e os últimos 64 KB do espaço do processo ficam <strong>sem mapeamento</strong>: um ponteiro inválido (0 ou −1) causa erro em vez de ler lixo.</li>
  <li>Páginas que saem da memória vão para o <strong>arquivo de paginação</strong> (<em>pagefile</em>; até 16 arquivos). Código de EXE e DLL não vai para o pagefile: é relido do próprio arquivo do programa.</li>
  <li><strong>Copiar se escrita</strong> (<em>copy-on-write</em>): páginas compartilhadas só são copiadas quando alguém tenta modificá-las.</li>
  <li>Cada processo tem um <strong>conjunto de trabalho</strong> (<em>working set</em>); quando a memória física fica baixa, o gerenciador "apara" os conjuntos de trabalho, tirando páginas dos processos.</li>
</ul>

<h2>NTFS</h2>
<ul>
  <li>Cada volume é uma sequência de <strong>clusters</strong> (blocos de 512 bytes a 64 KB; o comum é <strong>4 KB</strong>), endereçados com <strong>64 bits</strong>.</li>
  <li>A estrutura central é a <strong>MFT</strong> (<em>Master File Table</em>, tabela mestre de arquivos): uma sequência de <strong>registros de 1 KB</strong>, <strong>um por arquivo ou diretório</strong>, com seus <strong>atributos</strong> (nome, horários, segurança, lista de blocos...). É o equivalente da tabela de i-nodes do UNIX, mas o nome fica no próprio registro.</li>
  <li>Se os dados forem pequenos, cabem dentro do registro da MFT (<strong>arquivo imediato</strong>), sem ocupar blocos.</li>
  <li>Os <strong>16 primeiros registros</strong> são arquivos de metadados: <strong>$Mft</strong> (a própria MFT), $MftMirr (cópia de segurança do início dela), <strong>$LogFile</strong> (diário para recuperação), $Volume, $AttrDef, <strong>$</strong> (diretório-raiz), <strong>$Bitmap</strong> (blocos livres), $Boot, $BadClus (blocos defeituosos), $Secure (descritores de segurança), $Upcase, $Extend; 12–15 reservados.</li>
  <li>Nomes de até 255 caracteres em <strong>Unicode</strong> (caminho até 32.767); separador <code>\\</code>. Um arquivo pode ter vários <strong>fluxos de dados</strong> (<code>arq:fluxo1</code>).</li>
  <li>Recursos: <strong>diário</strong> ($LogFile: alterações estruturais são registradas antes de serem feitas), permissões por <strong>ACL</strong>, compressão, criptografia e, desde o Vista, ligações simbólicas.</li>
</ul>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: a prioridade de uma thread de editor de texto.</strong> O processo do editor é da classe <strong>Normal</strong> e sua thread tem prioridade relativa <strong>Normal</strong>: pela tabela, <strong>base = 8</strong>.</p>
  <table>
    <tr><th>Momento</th><th>O que acontece</th><th>Prioridade atual</th></tr>
    <tr><td>1</td><td>A thread espera uma tecla (bloqueada).</td><td>8 (fora da fila de prontos)</td></tr>
    <tr><td>2</td><td>O usuário tecla; a E/S de teclado termina e libera a thread com aumento de +6.</td><td><strong>14</strong>: passa à frente das threads em 8 e responde rápido</td></tr>
    <tr><td>3</td><td>Ela usa um quantum inteiro (por exemplo, para reformatar o texto).</td><td>13</td></tr>
    <tr><td>4</td><td>Usa mais quanta inteiros.</td><td>12, 11, 10, 9...</td></tr>
    <tr><td>5</td><td>Chega à base e ali fica, até o próximo aumento.</td><td>8</td></tr>
  </table>
  <p>Se o processo fosse da classe <strong>Alta</strong> com thread <strong>Acima do normal</strong>, a base seria <strong>14</strong>, e o mesmo +6 a levaria só até <strong>15</strong> (teto das threads de usuário).</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>O Windows <strong>escalona threads, não processos</strong>. O processo é só contêiner de recursos.</li>
    <li>No Windows, <strong>número maior = prioridade maior</strong> (31 é a mais alta). No Linux é o contrário.</li>
    <li>Os aumentos de prioridade <strong>nunca levam uma thread de usuário acima de 15</strong>, e as threads de tempo real (16–31) <strong>nunca</strong> são ajustadas.</li>
    <li><strong>CreateProcess</strong> cria o processo e já carrega o programa: equivale a fork + exec numa chamada só.</li>
    <li>NTFS usa a <strong>MFT</strong> (um registro de 1 KB por arquivo), não uma tabela FAT; FAT-32 é outro sistema de arquivos, mais simples e sem diário.</li>
  </ul>
</div>
`,
  resumo: 'O Windows atual descende do NT. O processo é um contêiner de recursos (espaço de endereçamento, handles, PEB) e a thread é a unidade de escalonamento; há ainda tarefas (jobs) e filamentos (fibers), e a criação é feita por CreateProcess. O escalonamento é preemptivo por prioridades sobre threads: 32 níveis (16–31 tempo real fixo, 1–15 usuário variável, 0 ZeroPage), base = classe do processo + prioridade relativa da thread, aumentos temporários após E/S e semáforos (sem passar de 15) e Round Robin dentro do nível. A memória virtual é paginada sob demanda (4 KB, pagefile, copy-on-write, working set) e o NTFS organiza o volume pela MFT, com registros de 1 KB por arquivo e diário ($LogFile).',
  questoes: [
    {
      id: 'm10-a02-q1',
      enunciado: 'No Windows, qual é a unidade escolhida pelo escalonador para usar a CPU?',
      alternativas: [
        { texto: 'A thread; o escalonador não considera a qual processo ela pertence.', correta: true, explicacao: 'Correto. O processo é um contêiner de recursos (espaço de endereçamento, handles). Quem recebe a CPU são as threads, escolhidas pela prioridade atual de cada uma.' },
        { texto: 'O processo; depois o próprio processo escolhe qual de suas threads executa.', correta: false, explicacao: 'Isso descreve threads de usuário (modelo N:1), não o Windows. No Windows as threads são de núcleo e o escalonador escolhe diretamente a thread.' },
        { texto: 'O filamento (fiber).', correta: false, explicacao: 'Filamentos são escalonados pelo próprio programa, em modo usuário; o núcleo nem sabe que existem. O núcleo escalona threads.' },
        { texto: 'A tarefa (job).', correta: false, explicacao: 'A tarefa só agrupa processos para aplicar limites comuns (cotas). Ela não é escalonada.' },
      ],
    },
    {
      id: 'm10-a02-q2',
      enunciado: 'Um processo da classe de prioridade <strong>Normal</strong> tem uma thread com prioridade relativa <strong>Normal</strong>. Qual a prioridade-base dessa thread?',
      alternativas: [
        { texto: '8', correta: true, explicacao: 'Correto. Pela Tabela 11.15 do Tanenbaum, Normal + Normal = 8, o valor típico da maioria das threads de aplicação.' },
        { texto: '24', correta: false, explicacao: '24 é Normal na classe Tempo real. Um processo comum da classe Normal fica na faixa de usuário (1 a 15).' },
        { texto: '15', correta: false, explicacao: '15 é o teto da faixa de usuário, obtido com a prioridade relativa "Tempo crítico" (ou por aumento temporário). Normal + Normal é 8.' },
        { texto: '0', correta: false, explicacao: 'A prioridade 0 é reservada para a thread ZeroPage, que zera páginas livres. Nenhuma thread de aplicação fica em 0.' },
      ],
    },
    {
      id: 'm10-a02-q3',
      enunciado: 'Um processo da classe <strong>Alta</strong> tem uma thread com prioridade relativa <strong>Acima do normal</strong>. A thread espera uma tecla e, quando a E/S de teclado termina, recebe aumento de +6. Qual a prioridade-base e qual a prioridade atual logo após a tecla?',
      alternativas: [
        { texto: 'Base 14; atual 15.', correta: true, explicacao: 'Correto. Pela tabela, Alta + Acima do normal = 14. O aumento de +6 daria 20, mas threads que não são de tempo real nunca passam de 15. Logo, a atual fica em 15.' },
        { texto: 'Base 14; atual 20.', correta: false, explicacao: 'Os aumentos temporários nunca levam uma thread comum à faixa de tempo real (16–31). O teto é 15.' },
        { texto: 'Base 11; atual 15.', correta: false, explicacao: '11 é Acima do normal na classe Acima do normal, não na classe Alta. Na coluna Alta, a linha Acima do normal vale 14.' },
        { texto: 'Base 14; atual 14, pois threads de classe Alta não recebem aumentos.', correta: false, explicacao: 'Quem não recebe ajustes são as threads de tempo real (16–31). Uma thread em 14 é da faixa variável e recebe o aumento, limitado a 15.' },
      ],
    },
    {
      id: 'm10-a02-q4',
      enunciado: 'Sobre as 32 prioridades do Windows, qual afirmação está correta?',
      alternativas: [
        { texto: '16 a 31 são de tempo real e têm prioridade fixa; 1 a 15 são de usuário e variam com os aumentos temporários.', correta: true, explicacao: 'Correto. As threads de tempo real nunca são ajustadas pelo sistema. As de usuário sobem após E/S ou semáforo e descem 1 a cada quantum inteiro usado, até a base.' },
        { texto: 'A prioridade 0 é a mais alta e 31 a mais baixa.', correta: false, explicacao: 'No Windows é o contrário: 31 é a mais alta. Quem usa "número menor = mais prioridade" é o Linux.' },
        { texto: 'Qualquer usuário pode colocar seus processos na classe Tempo real sem restrição.', correta: false, explicacao: 'Usar tempo real exige um privilégio especial no token do processo. Uma thread de usuário em laço numa prioridade acima das threads de teclado e mouse travaria o sistema.' },
        { texto: 'Threads de mesma prioridade executam até terminar, sem revezamento.', correta: false, explicacao: 'Dentro do mesmo nível as threads se revezam em Round Robin: ao fim do quantum, a thread vai para o fim da fila do seu nível.' },
      ],
    },
    {
      id: 'm10-a02-q5',
      enunciado: 'Qual a diferença entre criar um processo no Windows e no UNIX?',
      alternativas: [
        { texto: 'No Windows, CreateProcess cria o processo e já carrega o programa; no UNIX, fork cria uma cópia e exec troca o programa.', correta: true, explicacao: 'Correto. O UNIX separa as duas etapas (o que facilita redirecionamentos no shell entre o fork e o exec). O Windows faz tudo numa chamada, com muitos parâmetros.' },
        { texto: 'No Windows, o novo processo é uma cópia exata do pai, como no fork.', correta: false, explicacao: 'CreateProcess não copia o pai: cria um espaço de endereçamento novo com o programa indicado. O pai pode, no máximo, deixar o filho herdar alguns handles.' },
        { texto: 'No UNIX, uma única chamada (exec) cria e carrega o processo.', correta: false, explicacao: 'exec não cria processo: substitui o programa do processo atual. A criação no UNIX é feita pelo fork.' },
        { texto: 'Não há diferença: os dois usam fork.', correta: false, explicacao: 'O Windows não tem fork na API Win32. A criação é por CreateProcess.' },
      ],
    },
    {
      id: 'm10-a02-q6',
      enunciado: 'No NTFS, qual estrutura guarda um registro com os atributos de cada arquivo e diretório do volume?',
      alternativas: [
        { texto: 'A MFT (tabela mestre de arquivos), com registros de 1 KB.', correta: true, explicacao: 'Correto. Cada arquivo ou diretório tem pelo menos um registro na MFT, com atributos como nome, horários, segurança e onde estão os dados. Dados pequenos cabem no próprio registro (arquivo imediato).' },
        { texto: 'A FAT (tabela de alocação de arquivos).', correta: false, explicacao: 'A FAT é a estrutura dos sistemas FAT-16/FAT-32, mais antigos e simples. O NTFS foi criado justamente para substituí-los, com MFT, diário e segurança.' },
        { texto: 'A tabela de i-nodes, como no ext2.', correta: false, explicacao: 'i-node é do mundo UNIX. A MFT cumpre papel parecido, mas é outra estrutura (e guarda o nome no registro, o que o i-node não faz).' },
        { texto: 'O arquivo de paginação (pagefile).', correta: false, explicacao: 'O pagefile é usado pela memória virtual para guardar páginas que saíram da RAM. Não descreve arquivos.' },
      ],
    },
    {
      id: 'm10-a02-q7',
      enunciado: 'Sobre a memória virtual do Windows, qual afirmação está correta?',
      alternativas: [
        { texto: 'Cada processo tem seu próprio espaço virtual, paginado sob demanda; páginas retiradas da RAM vão para o arquivo de paginação.', correta: true, explicacao: 'Correto. As páginas (normalmente de 4 KB) só são carregadas quando usadas. As modificadas que saem da memória são gravadas no pagefile; o código de EXE e DLL é relido do próprio arquivo do programa.' },
        { texto: 'Todos os processos compartilham um único espaço de endereçamento de usuário.', correta: false, explicacao: 'Só a parte do núcleo (a metade de cima, no x86 de 32 bits) é compartilhada. A parte de usuário é privada de cada processo.' },
        { texto: 'O Windows usa segmentação pura, sem páginas.', correta: false, explicacao: 'O Windows usa paginação sob demanda, com páginas de 4 KB (e páginas grandes de 4 MB em alguns casos).' },
        { texto: 'Páginas compartilhadas são sempre copiadas assim que um segundo processo as mapeia.', correta: false, explicacao: 'Com copiar se escrita (copy-on-write), a cópia só é feita quando alguém tenta modificar a página. Enquanto todos só leem, ela continua compartilhada.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm10-a02-d1',
      enunciado: 'Descreva como funciona o escalonamento de threads no Windows: faixas de prioridade, como se obtém a prioridade-base e quando a prioridade atual muda.',
      respostaModelo: `<p>O Windows usa escalonamento <strong>preemptivo por prioridades</strong> e escolhe <strong>threads</strong>, não processos. Há <strong>32 prioridades (0 a 31)</strong>, com número maior significando mais prioridade: <strong>16–31</strong> são de tempo real (fixas), <strong>1–15</strong> são de usuário (variáveis) e <strong>0</strong> é da thread ZeroPage. Existe uma fila de prontos por prioridade; o escalonador pega a primeira thread da fila não vazia de maior número e, dentro do mesmo nível, alterna as threads em <strong>Round Robin</strong> pelo quantum.</p>
<p>A <strong>prioridade-base</strong> combina a <strong>classe de prioridade do processo</strong> (tempo real, alta, acima do normal, normal, abaixo do normal, ociosa) com a <strong>prioridade relativa da thread</strong>; por exemplo, Normal + Normal = 8.</p>
<p>A <strong>prioridade atual</strong> sobe temporariamente quando uma E/S termina (+1 disco, +6 teclado, +8 som) ou quando a thread é liberada de um semáforo/evento, e cai 1 a cada quantum inteiro usado até voltar à base. Ela nunca passa de 15, e threads de tempo real não são ajustadas. Threads prontas há muito tempo sem executar sobem para 15 por dois quanta, o que evita inanição e trata a inversão de prioridade.</p>`,
      pontosChave: [
        'Escalonamento preemptivo por prioridades sobre threads (não processos)',
        '32 prioridades: 16–31 tempo real fixas, 1–15 usuário variáveis, 0 ZeroPage; número maior = mais prioridade',
        'Prioridade-base = classe do processo + prioridade relativa da thread',
        'Aumentos temporários após E/S ou semáforo, decaindo 1 por quantum, sem passar de 15',
        'Round Robin entre threads de mesma prioridade',
      ],
    },
  ],
});
