// Módulo 1, aula 1: conceito de SO, objetivos, serviços e visões.
SO1.registerLesson({
  id: 'm01-a01',
  titulo: 'O que é um sistema operacional',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., cap. 1 (p.1) e §1.1 (p.2–4)',
    'Slides cap1 (Oliveira/Carissimi/Toscani, UFRGS): conceito, objetivos, serviços, imagens do SO, visão do usuário x de projeto',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a recepção de um hotel.</strong> O hóspede pede "quero uma toalha" e não precisa saber onde fica a lavanderia nem quem está de plantão: a recepção <em>esconde os detalhes</em> e oferece um serviço simples. Ao mesmo tempo, a recepção <em>distribui</em> quartos, vagas na garagem e horários do restaurante entre todos os hóspedes, para que ninguém fique no quarto do outro e nada fique parado à toa.</p>
  <p>O sistema operacional faz as duas coisas com o computador: <strong>esconde o hardware</strong> atrás de serviços simples e <strong>reparte o hardware</strong> entre os programas.</p>
</div>

<h2>Onde o SO fica</h2>
<p>Um sistema computacional tem quatro componentes:</p>
<ul>
  <li><strong>Hardware</strong>: os recursos básicos (CPU, memória, dispositivos de E/S).</li>
  <li><strong>Sistema operacional</strong>: controla e coordena o uso do hardware entre os vários programas e usuários.</li>
  <li><strong>Programas aplicativos e de sistema</strong>: definem como o hardware é usado para resolver um problema (compiladores, editores, navegadores, jogos, bancos de dados).</li>
  <li><strong>Usuários</strong>: pessoas, máquinas ou outros computadores.</li>
</ul>

<figure class="diagrama">
  <svg viewBox="0 0 460 300" style="max-width:600px" role="img" aria-label="Camadas: usuários, programas, sistema operacional e hardware, com as duas visões do SO">
    <g font-size="14" text-anchor="middle" fill="currentColor">
      <rect x="100" y="10" width="260" height="44" rx="8" fill="none" stroke="currentColor"/>
      <text x="230" y="37">Usuários</text>
      <rect x="100" y="70" width="260" height="54" rx="8" fill="none" stroke="currentColor"/>
      <text x="230" y="93">Programas aplicativos e</text>
      <text x="230" y="112">programas de sistema</text>
      <rect x="100" y="140" width="260" height="54" rx="8" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="230" y="164" font-weight="bold">Sistema operacional</text>
      <text x="230" y="184" font-size="12">(roda em modo núcleo)</text>
      <rect x="100" y="210" width="260" height="44" rx="8" style="fill:var(--linha)" stroke="currentColor"/>
      <text x="230" y="237">Hardware (CPU, memória, E/S)</text>
    </g>
    <g fill="none" stroke-width="2">
      <path d="M95 80 H88 V230 H95" style="stroke:var(--verde)"/>
      <path d="M365 80 H372 V230 H365" style="stroke:var(--ambar)"/>
    </g>
    <g font-size="12" fill="currentColor">
      <text x="80" y="128" text-anchor="end" style="fill:var(--verde)" font-weight="bold">Máquina</text>
      <text x="80" y="143" text-anchor="end" style="fill:var(--verde)" font-weight="bold">estendida</text>
      <text x="80" y="160" text-anchor="end">oferece</text>
      <text x="80" y="175" text-anchor="end">abstrações</text>
      <text x="80" y="192" text-anchor="end">(top-down)</text>
      <text x="380" y="128" style="fill:var(--ambar)" font-weight="bold">Gerente de</text>
      <text x="380" y="143" style="fill:var(--ambar)" font-weight="bold">recursos</text>
      <text x="380" y="160">gerencia o</text>
      <text x="380" y="175">hardware</text>
      <text x="380" y="192">(bottom-up)</text>
    </g>
    <text x="230" y="285" font-size="12" text-anchor="middle" fill="currentColor">O SO fica entre o hardware e os programas dos usuários.</text>
  </svg>
  <figcaption>O SO é a camada entre programas e hardware. Visão <strong>top-down</strong> (máquina estendida): parte do todo e enxerga o SO como quem oferece abstrações aos programas. Visão <strong>bottom-up</strong> (gerente de recursos): parte das peças e enxerga o SO como quem gerencia e reparte o hardware.</figcaption>
</figure>

<h2>Conceito</h2>
<p>O que se espera de um computador? Que <strong>execute os programas dos usuários</strong> e que <strong>permita resolver problemas</strong>. O <strong>sistema operacional</strong> é o programa colocado <strong>entre o hardware e os programas dos usuários</strong> para atingir esses dois objetivos.</p>
<p>O Tanenbaum acrescenta um critério prático: o SO é o software que roda em <strong>modo núcleo</strong> (ou modo supervisor), com acesso total ao hardware. Os demais programas rodam em <strong>modo usuário</strong>, com um subconjunto das instruções. Os modos de operação são vistos em detalhe no Módulo 2.</p>

<h2>Objetivos: conveniência e eficiência</h2>
<table>
  <tr><th>Objetivo</th><th>O que significa</th><th>Como o SO consegue</th></tr>
  <tr><td><strong>Conveniência</strong></td><td>Tornar o uso do computador mais fácil para o usuário e o programador.</td><td>Esconde os detalhes internos do hardware e reduz o tempo necessário para construir programas.</td></tr>
  <tr><td><strong>Eficiência</strong></td><td>Usar bem o hardware: obter mais trabalho do mesmo hardware.</td><td>Distribui melhor os recursos (CPU, memória, E/S) entre os programas.</td></tr>
</table>

<h2>Serviços oferecidos pelo SO</h2>
<table>
  <tr><th>Serviço</th><th>Exemplos</th></tr>
  <tr><td><strong>Criação de programas</strong></td><td>Editores, depuradores e compiladores disponíveis para o programador.</td></tr>
  <tr><td><strong>Execução de programas</strong></td><td>Carregar o programa na memória e iniciá-lo.</td></tr>
  <tr><td><strong>Acesso a dispositivos de E/S</strong></td><td>O programa pede "ler" ou "escrever" e o SO cuida dos detalhes de cada dispositivo.</td></tr>
  <tr><td><strong>Controle de acesso a arquivos</strong></td><td>Criar, abrir, ler e gravar arquivos, respeitando as permissões.</td></tr>
  <tr><td><strong>Acesso aos recursos do sistema e proteção</strong></td><td>Proteção entre usuários: um não lê nem destrói os dados do outro.</td></tr>
  <tr><td><strong>Contabilidade</strong></td><td>Estatísticas, monitoração de desempenho, sinalizar upgrades necessários (memória, disco), tarifação de usuários.</td></tr>
  <tr><td><strong>Detecção de erros</strong></td><td>Erros de hardware (memória, falha em dispositivo de E/S), erros de programação (overflow aritmético, acesso não autorizado à memória) e pedidos de recursos que o SO não pode atender.</td></tr>
</table>

<h2>Duas visões do que o SO faz</h2>
<h3>1. Máquina estendida (visão de cima para baixo, top-down)</h3>
<p>O hardware é primitivo e difícil de programar. O SO <strong>esconde essa complexidade</strong> e oferece <strong>abstrações</strong> claras: arquivos, processos, espaço de endereçamento. Exemplo do Tanenbaum: o controlador de disquete NEC PD765 tinha 16 comandos, e um simples <em>read</em> exigia 13 parâmetros em 9 bytes e devolvia 23 campos de status em 7 bytes. Com o SO, o programador só abre, lê e fecha um <strong>arquivo</strong>. Nas palavras do livro, o SO "transforma o hardware feio em abstrações bonitas".</p>
<h3>2. Gerente de recursos (visão de baixo para cima, bottom-up)</h3>
<p>O SO faz uma <strong>alocação ordenada e controlada</strong> dos processadores, das memórias e dos dispositivos de E/S entre os programas que competem por eles: decide quem usa qual recurso, atende os pedidos, contabiliza o uso e resolve conflitos. O compartilhamento (multiplexação) acontece de duas formas:</p>
<ul>
  <li><strong>No tempo</strong>: os programas se revezam no mesmo recurso. Exemplos: a CPU e a impressora.</li>
  <li><strong>No espaço</strong>: cada programa fica com uma parte do recurso. Exemplos: a memória principal e o disco.</li>
</ul>

<h2>Visão do usuário x visão de projeto</h2>
<p>A interface que cada tipo de pessoa enxerga forma a <strong>"imagem" do SO</strong> para ela: o <strong>usuário final</strong> vê os aplicativos; o <strong>programador</strong> vê os utilitários e as chamadas de sistema; o <strong>projetista do SO</strong> vê o sistema por dentro.</p>
<ul>
  <li><strong>Visão do usuário</strong>: o SO é aquilo que ele oferece. São as <strong>chamadas de sistema</strong> (a forma como os programas pedem serviços ao núcleo, parecida com chamar uma sub-rotina) e os <strong>programas de sistema</strong> (utilitários que rodam <em>fora</em> do núcleo, como compiladores, ligadores e o interpretador de comandos ou a interface gráfica).</li>
  <li><strong>Visão de projeto</strong>: é <em>como</em> o SO implementa os serviços. O SO é <strong>ativado por eventos</strong>, que são as <strong>chamadas de sistema</strong> e as <strong>interrupções</strong>. O mecanismo de interrupção é essencial: sinaliza término e ocorrência de eventos, trata exceções e ajuda nas atividades de gerência.</li>
</ul>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: você clica em "Imprimir" no editor de texto.</strong></p>
  <table>
    <tr><th>Momento</th><th>O que acontece</th><th>O que o SO está fazendo</th></tr>
    <tr><td>1</td><td>O editor pede ao SO para gravar o documento na impressora, por meio de uma chamada de sistema.</td><td><strong>Máquina estendida</strong> e <strong>acesso a E/S</strong>: o editor não conhece os comandos da impressora (conveniência).</td></tr>
    <tr><td>2</td><td>O SO confere se o usuário tem permissão para usar aquela impressora.</td><td><strong>Proteção</strong>.</td></tr>
    <tr><td>3</td><td>Outro programa também está imprimindo. O SO guarda as duas saídas no disco e manda uma de cada vez para a impressora.</td><td><strong>Gerente de recursos</strong>: multiplexação no tempo da impressora (eficiência, sem saída misturada).</td></tr>
    <tr><td>4</td><td>A impressora fica sem papel e avisa o computador com uma interrupção.</td><td><strong>Detecção de erros</strong>, acionada por um evento (visão de projeto).</td></tr>
    <tr><td>5</td><td>Ao terminar, o SO registra quantas páginas o usuário imprimiu.</td><td><strong>Contabilidade</strong> (tarifação).</td></tr>
  </table>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Objetivos</strong> não são <strong>serviços</strong>. Os objetivos são dois: conveniência e eficiência. Serviços são o que o SO oferece para atingi-los (arquivos, E/S, proteção...). Questões dissertativas costumam pedir os dois separadamente.</li>
    <li>O <strong>interpretador de comandos (shell) e a interface gráfica não fazem parte do núcleo</strong>: são programas de sistema que <em>usam</em> o SO. Compiladores e editores também são programas de sistema, muitas vezes confundidos com o próprio SO.</li>
    <li>Máquina estendida = <strong>abstração</strong> (de cima para baixo). Gerente de recursos = <strong>alocação e compartilhamento</strong> (de baixo para cima). Não troque as duas.</li>
  </ul>
</div>
`,
  resumo: 'O SO é o programa entre o hardware e os programas dos usuários, que permite executar programas e resolver problemas. Tem dois objetivos (conveniência e eficiência) e oferece serviços como criação e execução de programas, E/S, arquivos, proteção, contabilidade e detecção de erros. Pode ser visto como máquina estendida (abstrações) ou gerente de recursos (compartilhamento no tempo e no espaço); para o usuário ele é chamadas e programas de sistema, e para o projetista é um software ativado por eventos (chamadas de sistema e interrupções).',
  questoes: [
    {
      id: 'm01-a01-q1',
      enunciado: 'Quais são os dois objetivos de um sistema operacional?',
      alternativas: [
        { texto: 'Conveniência e eficiência.', correta: true, explicacao: 'Correto. Conveniência: tornar o uso do computador mais fácil, escondendo detalhes do hardware. Eficiência: obter mais trabalho do mesmo hardware, distribuindo melhor os recursos.' },
        { texto: 'Velocidade e segurança.', correta: false, explicacao: 'O SO não torna o hardware mais rápido; ele usa melhor o que existe (eficiência). Segurança é consequência do serviço de proteção, não um dos dois objetivos clássicos.' },
        { texto: 'Gerenciar arquivos e gerenciar a E/S.', correta: false, explicacao: 'Esses são serviços oferecidos pelo SO, não objetivos. Os objetivos são conveniência e eficiência; os serviços são os meios para atingi-los.' },
        { texto: 'Compilar e executar programas.', correta: false, explicacao: 'Compilar é tarefa de um programa de sistema (o compilador), e executar programas é um serviço. Nenhum dos dois é objetivo do SO.' },
      ],
    },
    {
      id: 'm01-a01-q2',
      enunciado: 'Qual alternativa define corretamente um sistema operacional?',
      alternativas: [
        { texto: 'Programa colocado entre o hardware e os programas dos usuários, para permitir a execução de programas e a solução de problemas.', correta: true, explicacao: 'É a definição dos slides: o SO fica entre o hardware e os programas e existe para que o computador execute programas e resolva problemas. O Tanenbaum completa dizendo que ele roda em modo núcleo.' },
        { texto: 'Conjunto de aplicativos instalados no computador, como editor de texto e navegador.', correta: false, explicacao: 'Aplicativos ficam acima do SO e usam seus serviços. Eles não controlam o hardware.' },
        { texto: 'Interface gráfica com janelas e ícones pela qual o usuário interage com o computador.', correta: false, explicacao: 'A interface gráfica (assim como o shell) é um programa de sistema que usa o SO. O próprio Tanenbaum diz que ela não faz parte do sistema operacional.' },
        { texto: 'Parte física do computador responsável por executar as instruções.', correta: false, explicacao: 'Isso descreve o hardware (a CPU). O SO é software, uma camada acima do hardware.' },
      ],
    },
    {
      id: 'm01-a01-q3',
      enunciado: 'Qual item <strong>não</strong> é um serviço oferecido pelo sistema operacional?',
      alternativas: [
        { texto: 'Aumentar a frequência de clock da CPU para executar programas mais rápido.', correta: true, explicacao: 'Correto: isso não é serviço do SO. Ele não muda a velocidade do hardware; ele reparte o hardware que existe entre os programas.' },
        { texto: 'Contabilidade: estatísticas de uso e tarifação de usuários.', correta: false, explicacao: 'Contabilidade é um serviço listado nos slides: estatísticas, monitoração de desempenho, sinalização de upgrades e tarifação.' },
        { texto: 'Detecção de erros, como overflow aritmético ou acesso não autorizado à memória.', correta: false, explicacao: 'Detecção de erros é um serviço do SO e cobre erros de hardware, erros de programação e pedidos de recursos que não podem ser atendidos.' },
        { texto: 'Proteção entre usuários no acesso aos recursos do sistema.', correta: false, explicacao: 'Proteção é um serviço do SO: impede que um usuário leia ou destrua os dados e programas de outro.' },
      ],
    },
    {
      id: 'm01-a01-q4',
      enunciado: 'O SO oferece ao programador a abstração de "arquivo", de modo que ele não precise conhecer os comandos do controlador de disco. Essa função corresponde a qual visão do SO?',
      alternativas: [
        { texto: 'Máquina estendida.', correta: true, explicacao: 'Correto. Na visão de máquina estendida (de cima para baixo), o SO esconde o hardware complexo e oferece abstrações simples, como arquivos e processos.' },
        { texto: 'Gerente de recursos.', correta: false, explicacao: 'A visão de gerente de recursos trata de repartir CPU, memória e E/S entre programas concorrentes, e não de criar abstrações.' },
        { texto: 'Visão de projeto.', correta: false, explicacao: 'A visão de projeto descreve como o SO implementa os serviços internamente (ativado por chamadas de sistema e interrupções). Oferecer abstrações ao programador é a visão de máquina estendida.' },
        { texto: 'Contabilidade.', correta: false, explicacao: 'Contabilidade é um serviço (estatísticas e tarifação), não uma visão do SO.' },
      ],
    },
    {
      id: 'm01-a01-q5',
      enunciado: 'Três programas querem imprimir ao mesmo tempo. O SO guarda as saídas em disco e envia uma de cada vez para a impressora. Isso é um exemplo de:',
      alternativas: [
        { texto: 'SO como gerente de recursos, com multiplexação no tempo.', correta: true, explicacao: 'Correto. Os programas se revezam no uso da impressora, um depois do outro: compartilhamento no tempo, organizado pelo SO como gerente de recursos.' },
        { texto: 'SO como gerente de recursos, com multiplexação no espaço.', correta: false, explicacao: 'Na multiplexação no espaço, cada programa fica com uma parte do recurso ao mesmo tempo (como na memória). Uma impressora não pode imprimir pedaços de três documentos ao mesmo tempo, por isso o revezamento é no tempo.' },
        { texto: 'SO como máquina estendida, com abstração de arquivo.', correta: false, explicacao: 'A máquina estendida trata de esconder detalhes do hardware. Aqui o foco é decidir quem usa a impressora e quando, que é gerência de recursos.' },
        { texto: 'Detecção de erros de E/S.', correta: false, explicacao: 'Não há erro nenhum no cenário. O SO está apenas organizando o uso de um recurso disputado.' },
      ],
    },
    {
      id: 'm01-a01-q6',
      enunciado: 'Na visão de projeto, o sistema operacional é um software ativado por eventos. Quais são esses eventos?',
      alternativas: [
        { texto: 'Chamadas de sistema e interrupções.', correta: true, explicacao: 'Correto. O SO entra em ação quando um programa pede um serviço (chamada de sistema) ou quando ocorre um evento, como o fim de uma E/S ou uma exceção (interrupção).' },
        { texto: 'Cliques do mouse e teclas pressionadas, apenas.', correta: false, explicacao: 'Teclado e mouse geram interrupções, mas são só um caso. Os eventos que ativam o SO são, de forma geral, as chamadas de sistema e todas as interrupções.' },
        { texto: 'Compilação e ligação de programas.', correta: false, explicacao: 'Compilar e ligar são tarefas de programas de sistema (compilador, ligador), que rodam fora do núcleo.' },
        { texto: 'Abertura e fechamento de janelas da interface gráfica.', correta: false, explicacao: 'A interface gráfica é um programa de sistema. Ela usa chamadas de sistema, mas janelas não são a categoria de evento que ativa o SO.' },
      ],
    },
    {
      id: 'm01-a01-q7',
      enunciado: 'Sobre compiladores, ligadores e o interpretador de comandos (shell), é correto afirmar:',
      alternativas: [
        { texto: 'São programas de sistema: rodam fora do núcleo, mas muitas vezes são confundidos com o próprio SO.', correta: true, explicacao: 'Correto. Os slides dizem que os programas de sistema rodam fora do kernel e implementam tarefas básicas, e por isso costumam ser confundidos com o SO.' },
        { texto: 'Fazem parte do núcleo e rodam em modo supervisor.', correta: false, explicacao: 'Eles rodam em modo usuário, como qualquer programa. Só o núcleo do SO roda em modo núcleo (supervisor).' },
        { texto: 'São chamadas de sistema.', correta: false, explicacao: 'Chamada de sistema é o pedido que um programa faz ao núcleo. Compiladores e shells são programas que fazem chamadas de sistema, não as próprias chamadas.' },
        { texto: 'São componentes de hardware que auxiliam a CPU.', correta: false, explicacao: 'São software. O shell, por exemplo, é só um programa que lê comandos e pede ao SO para executá-los.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm01-a01-d1',
      enunciado: 'O que é um sistema operacional e para que ele existe? Explique seus objetivos e descreva três ou mais serviços que ele oferece.',
      respostaModelo: `<p>Sistema operacional é o programa colocado <strong>entre o hardware e os programas dos usuários</strong>, que controla e coordena o uso do hardware para permitir a <strong>execução de programas</strong> e a <strong>solução de problemas</strong>. Ele roda em modo núcleo e pode ser visto como uma máquina estendida (oferece abstrações) e como um gerente de recursos (reparte CPU, memória e E/S).</p>
<p>Objetivos: <strong>conveniência</strong> (tornar o uso do computador mais fácil, escondendo os detalhes do hardware e reduzindo o tempo de construção de programas) e <strong>eficiência</strong> (obter mais trabalho do mesmo hardware, distribuindo melhor os recursos).</p>
<p>Serviços: criação de programas (editores, compiladores, depuradores); execução de programas (carga na memória); acesso aos dispositivos de E/S; controle de acesso a arquivos; proteção entre usuários; contabilidade (estatísticas e tarifação); detecção de erros (de hardware e de programação).</p>`,
      pontosChave: [
        'Definiu o SO como camada entre o hardware e os programas dos usuários',
        'Citou a finalidade: executar programas e resolver problemas (ou controlar e coordenar o hardware)',
        'Citou os dois objetivos: conveniência e eficiência, explicando cada um',
        'Citou pelo menos 3 serviços corretos (ex.: E/S, arquivos, proteção, contabilidade, detecção de erros)',
      ],
    },
  ],
});
