// Módulo 2, aula 2: modo usuário x supervisor, instruções privilegiadas, proteção de periféricos, memória e processador.
SO1.registerLesson({
  id: 'm02-a02',
  titulo: 'Modos de operação e proteção',
  fontes: [
    'Slides cap2 (Oliveira/Carissimi/Toscani, UFRGS): suporte de hardware à multiprogramação, proteção entre processos, modos de operação do processador, proteção de periféricos, memória e processador',
    'Tanenbaum, SO Modernos 3ª ed., §1.3.1 Processadores (p.12–13) e §1.3.5 Dispositivos de E/S (p.16–17)',
    'Tanenbaum, SO Modernos 3ª ed., §3.2.1 Registradores-base e registradores-limite (p.108–109)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: um banco.</strong> Os clientes (programas de usuário) circulam no saguão e podem fazer muita coisa sozinhos, mas não entram no cofre, não mexem no sistema de alarme e não ajustam o relógio que controla o expediente. Para sacar dinheiro, pedem ao caixa (o SO), que tem o crachá de funcionário. Se alguém tenta pular o balcão, o segurança intervém na hora.</p>
  <p>O crachá é o <strong>modo supervisor</strong>; o cofre e o alarme são as <strong>instruções privilegiadas</strong>; o segurança é o <strong>hardware</strong>, que detecta a tentativa ilegal e chama o SO.</p>
</div>

<h2>Por que proteger?</h2>
<p>Na multiprogramação, vários programas compartilham CPU, memória e periféricos. É preciso garantir que <strong>a execução incorreta (ou maliciosa) de um programa não influencie a execução de outro</strong> nem a do próprio SO. Os slides tratam de: modos de operação, proteção de periféricos, de memória e do processador. Todos se apoiam no hardware:</p>
<ul>
  <li><strong>modos de operação do processador</strong> (com as instruções privilegiadas);</li>
  <li><strong>proteção de periféricos</strong> e <strong>proteção de memória</strong>;</li>
  <li>e, para a CPU, a <strong>proteção do processador</strong> com o temporizador (timer).</li>
</ul>
<p>Junto com a <strong>interrupção</strong> (Aula 3), esses são os mecanismos básicos do <strong>suporte de hardware à multiprogramação</strong>.</p>

<h2>Modos de operação: usuário x supervisor</h2>
<table>
  <tr><th></th><th>Modo supervisor (protegido, núcleo, kernel)</th><th>Modo usuário</th></tr>
  <tr><td><strong>Instruções</strong></td><td>Pode executar <strong>todas</strong> as instruções do processador e usar todo o hardware.</td><td>Certas instruções (as <strong>privilegiadas</strong>) não podem ser executadas.</td></tr>
  <tr><td><strong>Quem roda</strong></td><td>O sistema operacional (núcleo).</td><td>Os processos de usuário (inclusive shell, compiladores, editores).</td></tr>
</table>
<p>O modo atual é guardado em um <strong>bit da PSW</strong>. Alterar esse bit para modo núcleo é, naturalmente, proibido em modo usuário. O chaveamento entre os modos segue uma regra fixa:</p>

<figure class="diagrama">
  <svg viewBox="0 0 460 220" style="max-width:580px" role="img" aria-label="Chaveamento de modo: de usuário para supervisor só por interrupção; de supervisor para usuário por instrução">
    <defs>
      <marker id="m02a02-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
      </marker>
    </defs>
    <g font-size="14" text-anchor="middle" fill="currentColor">
      <rect x="20" y="20" width="420" height="60" rx="10" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="230" y="45" font-weight="bold">Modo supervisor (SO)</text>
      <text x="230" y="65" font-size="12">todas as instruções</text>
      <rect x="20" y="140" width="420" height="60" rx="10" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/>
      <text x="230" y="165" font-weight="bold">Modo usuário (processos)</text>
      <text x="230" y="185" font-size="12">instruções privilegiadas proibidas</text>
    </g>
    <g fill="none" stroke-width="2">
      <path d="M140 138 V84" style="stroke:var(--ambar)" marker-end="url(#m02a02-seta)"/>
      <path d="M320 82 V136" stroke="currentColor" marker-end="url(#m02a02-seta)"/>
    </g>
    <g font-size="12" fill="currentColor">
      <text x="148" y="105" style="fill:var(--ambar)" font-weight="bold">interrupção</text>
      <text x="148" y="120" style="fill:var(--ambar)">(de hardware, trap ou exceção)</text>
      <text x="328" y="105" font-weight="bold">instrução</text>
      <text x="328" y="120">(privilegiada)</text>
    </g>
  </svg>
  <figcaption>Usuário → supervisor: <strong>somente por interrupção</strong> (inclusive a interrupção de software, o trap, usado nas chamadas de sistema). Supervisor → usuário: por uma <strong>instrução</strong> que o SO executa ao devolver a CPU ao processo.</figcaption>
</figure>

<h2>Instruções privilegiadas</h2>
<p>São as instruções que, se usadas livremente, permitiriam a um programa burlar a proteção. Exemplos:</p>
<ul>
  <li><strong>instruções de E/S</strong> (como IN e OUT, que acessam as portas dos dispositivos);</li>
  <li>carregar os <strong>registradores base e limite</strong> (ou mexer na MMU);</li>
  <li><strong>programar o temporizador</strong> (timer);</li>
  <li><strong>desabilitar/habilitar interrupções</strong>;</li>
  <li><strong>alterar o bit de modo</strong> da PSW e parar a CPU (halt).</li>
</ul>
<p>Se um processo em modo usuário tenta executar uma delas, o hardware <strong>não executa</strong> e gera uma <strong>interrupção de proteção</strong> (uma exceção). O controle passa ao SO, que normalmente encerra o processo. Os slides do cap2 citam como exemplo de término por erro a "tentativa de executar instruções privilegiadas".</p>

<h2>Proteção de periféricos</h2>
<p>As <strong>instruções de E/S são privilegiadas</strong>. Então, como um processo de usuário lê um arquivo ou escreve na tela? Pedindo ao SO, por meio de uma <strong>chamada de sistema</strong>: o método empregado para um processo de usuário solicitar serviços ao SO. Ela é normalmente baseada em <strong>interrupções de software (traps)</strong>, que acionam uma rotina do SO, a qual:</p>
<ol>
  <li>identifica o serviço requisitado;</li>
  <li>verifica a validade dos parâmetros (por exemplo, se o usuário tem permissão para aquele arquivo);</li>
  <li>executa o serviço;</li>
  <li>retorna ao processo do usuário.</li>
</ol>
<p>Assim, todo acesso a periférico passa pelo SO, que confere as permissões. A Aula 4 detalha as chamadas de sistema.</p>

<h2>Proteção de memória: registradores base e limite</h2>
<p>É preciso evitar que um processo corrompa a memória que não é dele (de outro processo ou do SO). A solução usa dois registradores da CPU, carregados pelo SO (instrução privilegiada) a cada troca de processo:</p>
<ul>
  <li><strong>registrador base</strong>: o limite inferior da área do processo;</li>
  <li><strong>registrador limite</strong>: o limite superior.</li>
</ul>
<p>A cada acesso, o hardware compara o endereço gerado: se <strong>endereço ≥ base</strong> e <strong>endereço &lt; limite</strong>, o acesso segue para a memória; caso contrário, gera uma <strong>interrupção (acesso ilegal)</strong> e o SO assume. Como essa comparação é feita pelo hardware em todo acesso, não há como o programa "pular" a verificação.</p>

<figure class="diagrama">
  <svg viewBox="0 0 520 260" style="max-width:640px" role="img" aria-label="Endereço da CPU comparado com base e limite; fora da faixa gera interrupção de acesso ilegal">
    <defs>
      <marker id="m02a02-seta2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
      </marker>
    </defs>
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <rect x="10" y="100" width="70" height="40" rx="6" fill="none" stroke="currentColor"/>
      <text x="45" y="125">CPU</text>
      <polygon points="150,90 200,120 150,150 100,120" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="150" y="118" font-size="11">end ≥</text>
      <text x="150" y="131" font-size="11">base?</text>
      <polygon points="270,90 320,120 270,150 220,120" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="270" y="118" font-size="11">end &lt;</text>
      <text x="270" y="131" font-size="11">limite?</text>
      <rect x="150" y="205" width="160" height="40" rx="6" style="fill:var(--vermelho-claro);stroke:var(--vermelho)"/>
      <text x="230" y="222" font-size="12">Interrupção</text>
      <text x="230" y="238" font-size="12">(acesso ilegal) → SO</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M80 120 H98" marker-end="url(#m02a02-seta2)"/>
      <path d="M200 120 H218" marker-end="url(#m02a02-seta2)"/>
      <path d="M320 120 H378" marker-end="url(#m02a02-seta2)"/>
      <path d="M150 150 V200" style="stroke:var(--vermelho)" marker-end="url(#m02a02-seta2)"/>
      <path d="M270 150 V200" style="stroke:var(--vermelho)" marker-end="url(#m02a02-seta2)"/>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="203" y="112">sim</text>
      <text x="326" y="112">sim</text>
      <text x="156" y="178" style="fill:var(--vermelho)">não</text>
      <text x="276" y="178" style="fill:var(--vermelho)">não</text>
    </g>
    <g font-size="12" text-anchor="middle" fill="currentColor">
      <rect x="380" y="10" width="130" height="40" style="fill:var(--linha)" stroke="currentColor"/>
      <text x="445" y="35">Usuário 3</text>
      <rect x="380" y="50" width="130" height="40" fill="none" stroke="currentColor"/>
      <text x="445" y="75">Usuário 2</text>
      <rect x="380" y="90" width="130" height="60" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/>
      <text x="445" y="118" font-weight="bold">Usuário 1</text>
      <text x="445" y="135" font-size="11">(em execução)</text>
      <rect x="380" y="150" width="130" height="40" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="445" y="175">Sistema operacional</text>
    </g>
    <g font-size="11" fill="currentColor" text-anchor="end">
      <text x="376" y="96" style="fill:var(--verde)">limite →</text>
      <text x="376" y="154" style="fill:var(--verde)">base →</text>
    </g>
    <text x="445" y="210" font-size="11" text-anchor="middle" fill="currentColor">Memória</text>
  </svg>
  <figcaption>Proteção de memória como nos slides do cap2: o endereço gerado pela CPU só chega à memória se estiver entre o registrador base (inclusive) e o registrador limite (exclusive). Fora dessa faixa, o hardware gera uma interrupção de acesso ilegal.</figcaption>
</figure>

<p><strong>Duas convenções.</strong> Nos slides, o limite é o <em>endereço final</em> da área. No Tanenbaum (§3.2.1), o limite é o <em>tamanho</em> da área: o hardware verifica se o endereço gerado pelo programa é menor que o limite e, se for, <strong>soma o base</strong> a ele para obter o endereço físico (o que também resolve a relocação). A ideia de proteção é a mesma: o hardware impede o acesso fora da faixa.</p>
<p>A proteção de memória também <strong>protege dispositivos</strong> quando se usa <strong>E/S mapeada em memória</strong>: basta deixar os endereços dos registradores dos dispositivos fora da faixa do processo.</p>

<h2>Proteção do processador: o temporizador</h2>
<p>E se um programa entrar em <strong>laço infinito</strong>, sem fazer chamadas de sistema? O SO nunca mais receberia a CPU. Para garantir que o SO volte a executar, uma <strong>interrupção de tempo (timer)</strong> ocorre <strong>periodicamente</strong>. Ela:</p>
<ul>
  <li>devolve o controle ao SO, que pode tirar a CPU do processo e dar a outro: é a base da <strong>multiprogramação com preempção</strong> e do timesharing;</li>
  <li>mantém a <strong>contabilização de tempo</strong> para o SO (relógio do sistema, tempo de CPU de cada processo).</li>
</ul>
<p>As <strong>instruções que programam o temporizador são privilegiadas</strong>; senão, um programa poderia simplesmente desligá-lo.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: o processo P1 (área de 3000 a 5000) tenta "se dar bem".</strong> O SO carregou base = 3000 e limite = 5000.</p>
  <table>
    <tr><th>Tentativa de P1</th><th>O que o hardware faz</th><th>Resultado</th></tr>
    <tr><td>Ler o endereço 4200</td><td>4200 ≥ 3000 e 4200 &lt; 5000: acesso liberado.</td><td>Normal: é memória do próprio P1.</td></tr>
    <tr><td>Escrever no endereço 5000</td><td>5000 não é &lt; 5000: interrupção de acesso ilegal.</td><td>O SO assume e normalmente encerra P1.</td></tr>
    <tr><td>Escrever no endereço 1000 (área do SO)</td><td>1000 &lt; 3000: interrupção de acesso ilegal.</td><td>O SO fica protegido.</td></tr>
    <tr><td>Executar OUT direto na porta da impressora</td><td>Instrução privilegiada em modo usuário: interrupção de proteção.</td><td>Para imprimir, P1 deve fazer uma chamada de sistema.</td></tr>
    <tr><td>Carregar limite = 9000 para "crescer"</td><td>Carregar o registrador limite é privilegiado: interrupção de proteção.</td><td>Só o SO altera base e limite.</td></tr>
    <tr><td>Entrar em <code>while(1);</code></td><td>O timer dispara periodicamente e gera interrupção.</td><td>O SO retoma a CPU e a entrega a outro processo.</td></tr>
  </table>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>Usuário → supervisor <strong>não</strong> acontece por uma instrução comum do programa: só por <strong>interrupção</strong> (o trap da chamada de sistema é uma interrupção de software). Supervisor → usuário é por <strong>instrução</strong>.</li>
    <li>A instrução <strong>trap em si não é privilegiada</strong>: qualquer programa pode executá-la. Ela é segura porque desvia para um endereço <strong>fixo</strong> do SO, não para onde o programa quiser.</li>
    <li>O shell, os compiladores e os editores rodam em <strong>modo usuário</strong>, mesmo sendo programas de sistema.</li>
    <li>"Modo protegido" nos slides é o <strong>modo supervisor</strong> (núcleo), e não o modo do usuário.</li>
    <li>Sem o timer, a multiprogramação ainda poderia existir (troca na E/S), mas o SO não conseguiria tirar a CPU de um programa que nunca faz E/S: <strong>sem timer não há preempção</strong> nem timesharing.</li>
    <li>Na P1-Q1 (suporte de hardware à multiprogramação), complete com <strong>discos magnéticos</strong> e <strong>DMA</strong> (Módulo 1, Aula 2).</li>
  </ul>
</div>
`,
  resumo: 'O processador tem dois modos: supervisor (núcleo, todas as instruções, onde roda o SO) e usuário (instruções privilegiadas proibidas). Usuário → supervisor só por interrupção (inclusive trap); supervisor → usuário por instrução. Instruções privilegiadas incluem E/S, carregar base/limite, programar o timer e desabilitar interrupções; tentá-las em modo usuário gera interrupção de proteção. Periféricos são protegidos porque a E/S é privilegiada (o processo usa chamadas de sistema); a memória, pelos registradores base e limite comparados pelo hardware a cada acesso; o processador, pelo timer, que devolve periodicamente o controle ao SO.',
  questoes: [
    {
      id: 'm02-a02-q1',
      enunciado: 'Como a CPU passa do modo usuário para o modo supervisor?',
      alternativas: [
        { texto: 'Somente por meio de uma interrupção (de hardware, exceção ou trap de software).', correta: true, explicacao: 'Correto. Os slides do cap2: chaveamento usuário → protegido por interrupção; protegido → usuário por instrução. Assim, toda entrada no modo supervisor desvia para código do SO.' },
        { texto: 'Por uma instrução comum que qualquer programa pode executar para ligar o bit de modo da PSW.', correta: false, explicacao: 'Se qualquer programa pudesse ligar o bit de modo, a proteção não existiria. Alterar o bit de modo para núcleo é proibido em modo usuário.' },
        { texto: 'Automaticamente, sempre que o programa acessa a memória.', correta: false, explicacao: 'Acessos à memória são feitos em modo usuário normalmente; o hardware só intervém (com interrupção) se o endereço estiver fora da faixa permitida.' },
        { texto: 'Quando o programa termina de ser compilado.', correta: false, explicacao: 'Compilação não tem relação com o modo da CPU. O compilador, aliás, roda em modo usuário.' },
      ],
    },
    {
      id: 'm02-a02-q2',
      enunciado: 'Qual das instruções abaixo <strong>não</strong> precisa ser privilegiada?',
      alternativas: [
        { texto: 'Somar dois registradores de uso geral.', correta: true, explicacao: 'Correto. Uma soma afeta só os registradores do próprio processo e não ameaça os outros. Instruções aritméticas são permitidas em modo usuário.' },
        { texto: 'Programar o temporizador (timer).', correta: false, explicacao: 'Deve ser privilegiada: se um programa pudesse desligar ou adiar o timer, monopolizaria a CPU e o SO não retomaria o controle.' },
        { texto: 'Carregar o registrador limite.', correta: false, explicacao: 'Deve ser privilegiada: um processo que mudasse o próprio limite poderia invadir a memória de outros processos.' },
        { texto: 'Desabilitar as interrupções.', correta: false, explicacao: 'Deve ser privilegiada: com interrupções desabilitadas, o timer não funciona e o processo nunca perderia a CPU.' },
      ],
    },
    {
      id: 'm02-a02-q3',
      enunciado: 'Se as instruções de E/S são privilegiadas, como um processo de usuário consegue ler um arquivo do disco?',
      alternativas: [
        { texto: 'Fazendo uma chamada de sistema: um trap passa o controle ao SO, que verifica os parâmetros, executa a E/S e retorna ao processo.', correta: true, explicacao: 'Correto. É a resposta dos slides para a proteção de periféricos: a chamada de sistema, baseada em interrupção de software, identifica o serviço, verifica os parâmetros, executa e retorna.' },
        { texto: 'Desabilitando as interrupções e executando a instrução de E/S diretamente.', correta: false, explicacao: 'Desabilitar interrupções também é privilegiado. Em modo usuário, as duas instruções gerariam interrupção de proteção.' },
        { texto: 'Pedindo ao compilador para gerar instruções IN e OUT.', correta: false, explicacao: 'Mesmo que o compilador gerasse essas instruções, executá-las em modo usuário causaria uma interrupção de proteção.' },
        { texto: 'Não consegue: só o SO lê arquivos para si mesmo.', correta: false, explicacao: 'Consegue, de forma indireta e controlada: o SO executa a E/S em nome do processo, depois de conferir as permissões.' },
      ],
    },
    {
      id: 'm02-a02-q4',
      enunciado: 'Com a convenção dos slides (base = limite inferior, limite = limite superior), o SO carregou base = 3000 e limite = 5000 para o processo em execução. Qual acesso gera interrupção de acesso ilegal?',
      alternativas: [
        { texto: 'Endereço 5000.', correta: true, explicacao: 'Correto. O acesso só é permitido se endereço ≥ 3000 E endereço < 5000. Como 5000 não é menor que 5000, a segunda comparação falha e o hardware gera a interrupção.' },
        { texto: 'Endereço 3000.', correta: false, explicacao: '3000 ≥ 3000 (verdadeiro) e 3000 < 5000 (verdadeiro): acesso permitido. O registrador base é o primeiro endereço válido.' },
        { texto: 'Endereço 4999.', correta: false, explicacao: '4999 ≥ 3000 e 4999 < 5000: as duas comparações são verdadeiras, então é o último endereço válido do processo.' },
        { texto: 'Endereço 4200.', correta: false, explicacao: '4200 está entre 3000 e 4999, dentro da área do processo. O acesso segue normalmente para a memória.' },
      ],
    },
    {
      id: 'm02-a02-q5',
      enunciado: 'Qual é a função da interrupção periódica do temporizador (timer) na proteção do processador?',
      alternativas: [
        { texto: 'Garantir que o SO retome o controle da CPU de tempos em tempos, mesmo que o processo não faça chamadas de sistema, permitindo a preempção e a contabilização de tempo.', correta: true, explicacao: 'Correto. Os slides: a interrupção de tempo garante a execução do SO, é usada para implementar a multiprogramação e mantém a contabilização de tempo (relógio).' },
        { texto: 'Impedir que o processo acesse memória fora da sua área.', correta: false, explicacao: 'Isso é proteção de memória, feita pelos registradores base e limite, não pelo timer.' },
        { texto: 'Aumentar a frequência de clock da CPU.', correta: false, explicacao: 'O timer não altera a velocidade da CPU. Ele gera interrupções em intervalos regulares.' },
        { texto: 'Transferir dados do disco para a memória sem usar a CPU.', correta: false, explicacao: 'Essa é a função do DMA. O timer só gera interrupções periódicas.' },
      ],
    },
    {
      id: 'm02-a02-q6',
      enunciado: 'Um processo em modo usuário executa uma instrução privilegiada. O que acontece?',
      alternativas: [
        { texto: 'O hardware não a executa e gera uma interrupção de proteção; o SO assume e normalmente encerra o processo.', correta: true, explicacao: 'Correto. A tentativa de executar instruções privilegiadas é um dos motivos de término por erro listados nos slides do cap2. É o hardware quem detecta; o SO decide o que fazer.' },
        { texto: 'A instrução é executada normalmente, mas o SO registra um aviso.', correta: false, explicacao: 'Se a instrução fosse executada, a proteção já teria sido violada. O hardware a bloqueia antes.' },
        { texto: 'A CPU muda sozinha para modo supervisor e executa a instrução.', correta: false, explicacao: 'O modo muda, sim, mas para executar o tratador do SO, não a instrução do processo. A instrução privilegiada do usuário não é executada.' },
        { texto: 'O computador é reiniciado.', correta: false, explicacao: 'Não há reinicialização: o erro fica restrito ao processo, que é tratado pelo SO. Os outros processos continuam.' },
      ],
    },
    {
      id: 'm02-a02-q7',
      enunciado: 'Na E/S mapeada em memória, como os dispositivos ficam protegidos contra acessos diretos dos processos de usuário?',
      alternativas: [
        { texto: 'Pela proteção de memória: os endereços dos registradores dos dispositivos ficam fora da faixa base–limite do processo.', correta: true, explicacao: 'Correto. Os slides dizem que é possível proteger dispositivos de E/S com os registradores base e limite quando se usa E/S mapeada em memória. O Tanenbaum diz o mesmo em §1.3.5.' },
        { texto: 'Pelo timer, que interrompe o processo antes de ele acessar o dispositivo.', correta: false, explicacao: 'O timer protege o processador contra monopólio; ele não verifica endereços acessados.' },
        { texto: 'Não ficam protegidos: com E/S mapeada em memória qualquer processo acessa os dispositivos.', correta: false, explicacao: 'Ficam, sim: como são endereços de memória, a mesma verificação base–limite os protege.' },
        { texto: 'Pela instrução trap, que é executada a cada acesso à memória.', correta: false, explicacao: 'O trap só é executado quando o programa faz uma chamada de sistema; ele não acompanha cada acesso à memória.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm02-a02-d1',
      enunciado: 'Explique como o hardware ajuda o sistema operacional a proteger os processos uns dos outros. Aborde os modos de operação, a proteção de periféricos, de memória e do processador.',
      respostaModelo: `<p>Na multiprogramação, a execução incorreta de um programa não pode afetar os outros nem o SO. Para isso o hardware oferece:</p>
<ul>
  <li><strong>Modos de operação</strong>: em <strong>modo supervisor</strong> (núcleo) o processador executa todas as instruções; é onde roda o SO. Em <strong>modo usuário</strong>, onde rodam os processos, as <strong>instruções privilegiadas</strong> são proibidas; tentar executá-las gera uma interrupção de proteção. O chaveamento usuário → supervisor só ocorre por interrupção, e supervisor → usuário por instrução.</li>
  <li><strong>Proteção de periféricos</strong>: as instruções de E/S são privilegiadas. O processo pede a E/S ao SO por uma <strong>chamada de sistema</strong> (trap), e o SO identifica o serviço, verifica os parâmetros e permissões, executa e retorna.</li>
  <li><strong>Proteção de memória</strong>: os registradores <strong>base e limite</strong>, carregados pelo SO, delimitam a área do processo. Em cada acesso o hardware compara o endereço; fora da faixa, gera uma interrupção de acesso ilegal. Isso também protege dispositivos com E/S mapeada em memória.</li>
  <li><strong>Proteção do processador</strong>: o <strong>temporizador</strong> gera interrupções periódicas, garantindo que o SO retome a CPU mesmo se um processo entrar em laço infinito; permite a preempção e a contabilização de tempo. Programar o timer é privilegiado.</li>
</ul>`,
      pontosChave: [
        'Diferenciou modo supervisor (todas as instruções, SO) e modo usuário (sem instruções privilegiadas)',
        'Explicou que E/S é privilegiada e o processo usa chamada de sistema (trap) para pedir E/S',
        'Explicou a proteção de memória com registradores base e limite e interrupção em acesso ilegal',
        'Explicou o timer: interrupção periódica que devolve o controle ao SO (preempção)',
      ],
    },
  ],
});
