// Módulo 3, aula 1: programa x processo, ciclos de CPU e E/S (CPU-bound x I/O-bound), relacionamento entre processos.
SO1.registerLesson({
  id: 'm03-a01',
  titulo: 'O que é um processo',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., introdução do cap. 2 e §2.1.1 (p.50–52)',
    'Tanenbaum, SO Modernos 3ª ed., §2.1.2 e §2.1.4 (p.52–54): criação por fork/execve, hierarquia de processos',
    'Tanenbaum, SO Modernos 3ª ed., §2.4.1, "Comportamento do processo" (p.88–89): CPU-bound x I/O-bound',
    'Slides cap2 (Oliveira/Carissimi/Toscani, UFRGS): conceito de processo, ciclos de um processo, relacionamento entre processos',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a receita e o bolo (do Tanenbaum).</strong> A <em>receita</em> de bolo, guardada no livro, é o <strong>programa</strong>: um texto parado, que não faz nada sozinho. O confeiteiro é a <strong>CPU</strong> e os ingredientes são os <strong>dados</strong>. O <strong>processo</strong> é a <em>atividade</em> de ler a receita, buscar os ingredientes e assar o bolo. Se o filho do confeiteiro chega picado por uma abelha, ele marca em que passo da receita parou, cuida do filho (outro processo, com outra "receita": o livro de primeiros socorros) e depois volta ao bolo <em>do ponto em que parou</em>. Duas pessoas seguindo a mesma receita ao mesmo tempo são dois processos diferentes.</p>
</div>

<h2>Programa x processo</h2>
<p><strong>Processo é um programa em execução</strong>: é a abstração que o SO usa para "enxergar" um programa e permitir que ele execute. É o conceito mais central de um sistema operacional.</p>
<table>
  <tr><th></th><th>Programa</th><th>Processo</th></tr>
  <tr><td><strong>Natureza</strong></td><td>Entidade <strong>estática</strong> e <strong>permanente</strong> (fica no disco)</td><td>Entidade <strong>dinâmica</strong> e <strong>efêmera</strong> (nasce, executa e morre)</td></tr>
  <tr><td><strong>O que é</strong></td><td>Sequência de instruções</td><td>Instruções <em>em execução</em>, com estado que muda conforme avança</td></tr>
  <tr><td><strong>Para o SO</strong></td><td><strong>Passivo</strong>: o SO não gerencia um arquivo parado</td><td>Ativo: o SO cria, escalona, bloqueia e destrói</td></tr>
  <tr><td><strong>Composição</strong></td><td>Código</td><td><strong>Código + dados + contexto</strong> (valores do contador de programa, dos registradores e das variáveis)</td></tr>
  <tr><td><strong>Identificação</strong></td><td>Nome do arquivo</td><td>Número único: <strong>PID</strong> (<em>process identifier</em>)</td></tr>
</table>
<p>Um mesmo programa pode ter <strong>várias instâncias</strong> executando ao mesmo tempo, e cada uma é um <strong>processo diferente</strong>: mesmo código, mas dados e momento de execução (contexto) diferentes. Abrir o navegador duas vezes cria dois processos. O SO pode até manter uma única cópia do código na memória, mas isso é detalhe técnico: conceitualmente continuam sendo dois processos.</p>

<h3>Uma CPU, vários processos: pseudoparalelismo</h3>
<p>O Tanenbaum descreve o modelo assim: cada processo tem a sua própria <strong>CPU virtual</strong> (seu próprio contador de programa lógico). Na realidade, há um único contador de programa físico, e a CPU <strong>alterna rapidamente</strong> entre os processos. Quando a vez de um processo acaba, o contador de programa físico é salvo no contador lógico daquele processo, e o do próximo é carregado. Em cada instante só um processo executa, mas em um segundo vários avançam, o que dá a <strong>ilusão de paralelismo</strong> (<strong>pseudoparalelismo</strong>). Paralelismo real só existe com várias CPUs (ou núcleos). Essa alternância é a <strong>multiprogramação</strong>.</p>
<p>Consequência importante: como a CPU vai e volta, a velocidade de um processo <strong>não é uniforme nem reproduzível</strong>. Por isso um programa não deve depender de "quanto tempo leva" para executar um trecho.</p>
<p>Processos executam tanto <strong>programas de usuário</strong> quanto <strong>programas de sistema</strong>. Os processos de sistema que ficam em segundo plano esperando trabalho (receber e-mail, atender páginas web, imprimir) são chamados <strong>daemons</strong>.</p>

<h2>Ciclos de um processo: CPU e E/S</h2>
<p>Todo processo alterna entre dois ciclos básicos:</p>
<ul>
  <li><strong>Ciclo de processador</strong> (surto de CPU, <em>CPU burst</em>): o tempo em que ocupa a CPU calculando.</li>
  <li><strong>Ciclo de E/S</strong>: o tempo em que espera a conclusão de um evento, como a leitura do disco ou uma tecla.</li>
</ul>
<p>O <strong>primeiro ciclo é sempre de processador</strong>: para pedir uma E/S, o processo precisa estar executando instruções. As trocas de ciclo acontecem por:</p>
<ul>
  <li><strong>chamada de sistema</strong> (CPU → E/S): o processo pede, por exemplo, para ler um arquivo;</li>
  <li><strong>interrupção</strong> (nos dois sentidos): por exemplo, o fim da E/S;</li>
  <li><strong>ocorrência de evento</strong> (E/S → CPU): o dado esperado chegou.</li>
</ul>

<h3>CPU-bound x I/O-bound</h3>
<ul>
  <li><strong>CPU-bound</strong> (limitado pela CPU, orientado à CPU): ciclo de processador <strong>muito maior</strong> que o de E/S. Surtos longos de CPU e esperas por E/S raras. Ex.: renderizar um vídeo, cálculo científico, compactar arquivos.</li>
  <li><strong>I/O-bound</strong> (limitado pela E/S, orientado à E/S): ciclo de E/S <strong>muito maior</strong> que o de processador. Surtos curtos de CPU e esperas frequentes. Ex.: editor de texto (espera o usuário digitar), servidor que lê muito do disco.</li>
</ul>
<p>Não existe um número exato que separe um tipo do outro. O Tanenbaum destaca que o <strong>fator principal é o tamanho do surto de CPU</strong>, e não o tamanho da espera por E/S: um processo é I/O-bound porque calcula pouco entre uma requisição e outra, e não porque as suas requisições demoram mais. A <strong>situação ideal</strong> é <strong>misturar</strong> processos CPU-bound e I/O-bound na memória: enquanto os I/O-bound esperam os dispositivos, os CPU-bound usam a CPU, e todos os recursos ficam ocupados.</p>

<figure class="diagrama">
  <svg viewBox="0 0 440 210" style="max-width:600px" role="img" aria-label="Linhas do tempo de um processo CPU-bound, com surtos longos de CPU, e de um processo I/O-bound, com surtos curtos de CPU e muitas esperas por E/S">
    <defs>
      <marker id="m03a01-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" style="fill:currentColor"/></marker>
    </defs>
    <g font-size="12" fill="currentColor">
      <text x="10" y="20" font-weight="bold">(a) CPU-bound</text>
      <line x1="10" y1="45" x2="430" y2="45" stroke="currentColor" stroke-dasharray="3 3"/>
      <rect x="10" y="35" width="110" height="20" rx="3" style="fill:var(--azul);stroke:var(--azul)"/>
      <rect x="150" y="35" width="100" height="20" rx="3" style="fill:var(--azul);stroke:var(--azul)"/>
      <rect x="275" y="35" width="70" height="20" rx="3" style="fill:var(--azul);stroke:var(--azul)"/>
      <rect x="370" y="35" width="60" height="20" rx="3" style="fill:var(--azul);stroke:var(--azul)"/>
      <text x="65" y="74" text-anchor="middle">surto longo de CPU</text>
      <text x="135" y="30" text-anchor="middle" style="fill:var(--ambar)">E/S</text>

      <text x="10" y="110" font-weight="bold">(b) I/O-bound</text>
      <line x1="10" y1="135" x2="430" y2="135" stroke="currentColor" stroke-dasharray="3 3"/>
      <rect x="10" y="125" width="14" height="20" rx="2" style="fill:var(--verde);stroke:var(--verde)"/>
      <rect x="64" y="125" width="10" height="20" rx="2" style="fill:var(--verde);stroke:var(--verde)"/>
      <rect x="114" y="125" width="12" height="20" rx="2" style="fill:var(--verde);stroke:var(--verde)"/>
      <rect x="166" y="125" width="8" height="20" rx="2" style="fill:var(--verde);stroke:var(--verde)"/>
      <rect x="214" y="125" width="14" height="20" rx="2" style="fill:var(--verde);stroke:var(--verde)"/>
      <rect x="268" y="125" width="10" height="20" rx="2" style="fill:var(--verde);stroke:var(--verde)"/>
      <rect x="318" y="125" width="12" height="20" rx="2" style="fill:var(--verde);stroke:var(--verde)"/>
      <rect x="370" y="125" width="10" height="20" rx="2" style="fill:var(--verde);stroke:var(--verde)"/>
      <rect x="420" y="125" width="10" height="20" rx="2" style="fill:var(--verde);stroke:var(--verde)"/>
      <text x="44" y="120" text-anchor="middle" style="fill:var(--ambar)">E/S</text>
      <text x="94" y="120" text-anchor="middle" style="fill:var(--ambar)">E/S</text>
      <line x1="70" y1="168" x2="70" y2="150" stroke="currentColor" marker-end="url(#m03a01-seta)"/>
      <text x="76" y="172">surto curto de CPU</text>
      <rect x="10" y="185" width="14" height="12" style="fill:var(--azul)"/><text x="30" y="195">CPU</text>
      <line x1="80" y1="191" x2="110" y2="191" stroke="currentColor" stroke-dasharray="3 3"/><text x="116" y="195">esperando E/S (ciclo de E/S)</text>
    </g>
  </svg>
  <figcaption>Baseada na Figura 2.31 do Tanenbaum. O que diferencia os dois é o tamanho dos surtos de CPU entre uma E/S e outra.</figcaption>
</figure>

<h2>Relacionamento entre processos</h2>
<ul>
  <li><strong>Processos independentes</strong>: não têm relação com nenhum outro processo.</li>
  <li><strong>Grupo de processos</strong>: têm algum tipo de relacionamento, como a <strong>filiação</strong>, e podem <strong>compartilhar recursos</strong>.</li>
</ul>
<p>Na <strong>hierarquia de processos</strong>, o processo criador é o <strong>pai</strong> e o processo criado é o <strong>filho</strong>. O filho pode criar seus próprios filhos, formando uma <strong>árvore</strong> que muda com o tempo. No UNIX, quando o computador liga, o processo <strong>init</strong> cria um processo para cada terminal; quando o usuário entra, surge um interpretador de comandos (shell), que cria novos processos para cada comando. Todos os processos do sistema ficam numa única árvore com o <em>init</em> na raiz. No UNIX, um processo e todos os seus descendentes formam um <strong>grupo de processos</strong>: um sinal do teclado (como Ctrl+C) é entregue a todos os membros do grupo associado àquele teclado.</p>
<p>O <strong>Windows não tem hierarquia de processos</strong>: todos são iguais. Ao criar um filho, o pai recebe um identificador especial (<strong>handle</strong>) para controlá-lo, mas pode passar esse handle a outro processo, o que desfaz a hierarquia.</p>
<p>O que fazer com os filhos quando o pai é destruído? Os slides citam três semânticas possíveis:</p>
<ol>
  <li><strong>toda a descendência "morre"</strong> junto;</li>
  <li>a descendência é <strong>herdada pelo processo "avô"</strong> (no UNIX, uma variante: os órfãos são adotados pelo <em>init</em>, e não pelo avô);</li>
  <li>a destruição efetiva do pai é <strong>adiada até todos os filhos terminarem</strong>.</li>
</ol>

<figure class="diagrama">
  <svg viewBox="0 0 420 200" style="max-width:560px" role="img" aria-label="Árvore de processos do UNIX com init na raiz, shells como filhos e comandos como netos">
    <g stroke="currentColor" fill="none">
      <line x1="210" y1="44" x2="110" y2="84"/>
      <line x1="210" y1="44" x2="310" y2="84"/>
      <line x1="110" y1="114" x2="60" y2="154"/>
      <line x1="110" y1="114" x2="160" y2="154"/>
      <line x1="310" y1="114" x2="310" y2="154"/>
    </g>
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <rect x="160" y="14" width="100" height="30" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="210" y="34" font-weight="bold">init (PID 1)</text>
      <rect x="60" y="84" width="100" height="30" rx="6" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/>
      <text x="110" y="104">shell (João)</text>
      <rect x="260" y="84" width="100" height="30" rx="6" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/>
      <text x="310" y="104">shell (Ana)</text>
      <rect x="20" y="154" width="80" height="30" rx="6" fill="none" stroke="currentColor"/>
      <text x="60" y="174">cat</text>
      <rect x="120" y="154" width="80" height="30" rx="6" fill="none" stroke="currentColor"/>
      <text x="160" y="174">grep</text>
      <rect x="270" y="154" width="80" height="30" rx="6" fill="none" stroke="currentColor"/>
      <text x="310" y="174">sort</text>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="372" y="34">raiz</text>
      <text x="372" y="104">filhos</text>
      <text x="372" y="174">netos</text>
    </g>
  </svg>
  <figcaption>Hierarquia de processos no UNIX: cada processo tem um único pai; um pai pode ter nenhum, um ou vários filhos.</figcaption>
</figure>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: o usuário digita <code>sort dados.txt</code> no shell do UNIX.</strong></p>
  <table>
    <tr><th>Passo</th><th>O que acontece</th><th>Processos</th></tr>
    <tr><td>1</td><td>O shell (PID 200) lê o comando digitado.</td><td>shell</td></tr>
    <tr><td>2</td><td>O shell faz a chamada de sistema <code>fork</code>, que cria um <strong>clone</strong> dele: mesma imagem de memória, mesmas variáveis de ambiente, mesmos arquivos abertos. Cada um tem seu próprio espaço de endereçamento.</td><td>shell (pai, PID 200) e cópia do shell (filho, PID 201)</td></tr>
    <tr><td>3</td><td>O filho faz a chamada <code>execve</code>, que troca a sua imagem de memória pelo programa <em>sort</em>. O PID continua 201.</td><td>shell (200) e sort (201)</td></tr>
    <tr><td>4</td><td>O sort executa: lê o arquivo (ciclo de E/S), ordena (ciclo de CPU), escreve na tela (E/S).</td><td>shell espera; sort alterna CPU e E/S</td></tr>
    <tr><td>5</td><td>O sort termina com a chamada <code>exit</code>; o shell volta a pedir comandos.</td><td>só o shell</td></tr>
  </table>
  <p>Se o usuário abrir dois terminais e rodar <code>sort</code> em cada um, existirão <strong>dois processos</strong> (PIDs diferentes) executando o <strong>mesmo programa</strong>. No Windows, uma única chamada (<code>CreateProcess</code>) cria o processo e já carrega o programa nele.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Programa ≠ processo</strong>: programa é estático e passivo; processo é dinâmico, tem estado e PID. Executar o mesmo programa duas vezes gera <strong>dois processos</strong>.</li>
    <li>O <strong>primeiro ciclo é sempre de CPU</strong>, nunca de E/S.</li>
    <li>I/O-bound se define pelo <strong>surto curto de CPU</strong>, não por "E/S mais lenta".</li>
    <li>Com uma CPU, os processos <strong>não executam ao mesmo tempo</strong>: há pseudoparalelismo (alternância rápida).</li>
    <li>Hierarquia pai/filho é do UNIX; o <strong>Windows não tem hierarquia</strong> (usa handles).</li>
  </ul>
</div>
`,
  resumo: 'Processo é um programa em execução: entidade dinâmica, com código, dados e contexto, identificada por um PID; o programa é estático e passivo, e um mesmo programa pode originar vários processos. Todo processo alterna ciclos de CPU e de E/S, começando sempre pela CPU; os CPU-bound têm surtos longos de CPU e os I/O-bound, surtos curtos com muitas esperas, e o ideal é misturá-los. Processos podem ser independentes ou formar grupos; no UNIX, o criador é o pai, o criado é o filho, e todos formam uma árvore com o init na raiz.',
  questoes: [
    {
      id: 'm03-a01-q1',
      enunciado: 'Qual afirmação diferencia corretamente <strong>programa</strong> e <strong>processo</strong>?',
      alternativas: [
        { texto: 'O programa é uma entidade estática e passiva (sequência de instruções); o processo é dinâmico, tem estado que muda durante a execução e é identificado por um PID.', correta: true, explicacao: 'Correto. Essa é a diferenciação dos slides: programa é estático, permanente e passivo; processo é dinâmico, efêmero, composto por código, dados e contexto, com um PID único.' },
        { texto: 'O processo é o arquivo executável no disco; o programa é a sua cópia carregada na memória.', correta: false, explicacao: 'Está invertido. O arquivo no disco é o programa. O processo é a execução desse programa, com contador de programa, registradores e dados próprios.' },
        { texto: 'Programa e processo são sinônimos; os termos variam só entre autores.', correta: false, explicacao: 'Não são sinônimos. O Tanenbaum diz que a diferença é sutil, mas crucial: a receita (programa) não é a atividade de fazer o bolo (processo).' },
        { texto: 'Cada programa só pode originar um processo por vez.', correta: false, explicacao: 'Um mesmo programa pode ter várias instâncias em execução, e cada uma é um processo diferente, com o mesmo código e contextos diferentes.' },
      ],
    },
    {
      id: 'm03-a01-q2',
      enunciado: 'Um usuário abre o mesmo editor de texto três vezes, cada janela com um documento diferente. Do ponto de vista do SO:',
      alternativas: [
        { texto: 'Há três processos distintos, com PIDs diferentes, executando o mesmo programa com dados e contextos diferentes.', correta: true, explicacao: 'Correto. Cada execução é uma instância (processo). O SO pode até compartilhar uma única cópia do código na memória, mas conceitualmente são três processos.' },
        { texto: 'Há um único processo, porque o programa é o mesmo.', correta: false, explicacao: 'O que define o processo é a execução, não o código. Três execuções, três processos, cada um com seu contador de programa e seus dados.' },
        { texto: 'Há três programas diferentes, porque os documentos são diferentes.', correta: false, explicacao: 'O programa (o editor) é o mesmo. Os documentos são dados de entrada, que fazem parte de cada processo.' },
        { texto: 'Há três processos, mas eles obrigatoriamente compartilham as mesmas variáveis.', correta: false, explicacao: 'Cada processo tem seus próprios dados. Alterar uma variável em um não altera o outro, porque os espaços de endereçamento são distintos.' },
      ],
    },
    {
      id: 'm03-a01-q3',
      enunciado: 'Sobre os ciclos de um processo, é correto afirmar:',
      alternativas: [
        { texto: 'O primeiro ciclo é sempre de processador, e a troca para um ciclo de E/S acontece, por exemplo, por uma chamada de sistema.', correta: true, explicacao: 'Correto. O processo precisa executar instruções para pedir uma E/S, então começa sempre na CPU. As trocas ocorrem por chamada de sistema, interrupção ou ocorrência de evento.' },
        { texto: 'O primeiro ciclo é sempre de E/S, porque o programa precisa ser lido do disco.', correta: false, explicacao: 'Carregar o programa é trabalho do SO na criação do processo. Os ciclos do processo começam pelo processador.' },
        { texto: 'Um processo fica em um único ciclo do início ao fim: ou só usa CPU ou só faz E/S.', correta: false, explicacao: 'Quase todos os processos alternam surtos de CPU com esperas por E/S; é isso que permite à multiprogramação aproveitar a CPU.' },
        { texto: 'Durante o ciclo de E/S, o processo continua ocupando a CPU para acompanhar a transferência.', correta: false, explicacao: 'No ciclo de E/S o processo está esperando o evento e não ocupa a CPU, que pode ser entregue a outro processo.' },
      ],
    },
    {
      id: 'm03-a01-q4',
      enunciado: 'Segundo o Tanenbaum, o fator principal para classificar um processo como <strong>I/O-bound</strong> é:',
      alternativas: [
        { texto: 'O tamanho do surto de CPU: ele calcula pouco entre uma requisição de E/S e outra.', correta: true, explicacao: 'Correto. O livro observa que o fator principal é o tamanho do surto de CPU, e não o da espera por E/S. Ler um bloco do disco leva o mesmo tempo para qualquer processo.' },
        { texto: 'O tamanho da espera por E/S: as suas requisições demoram mais que as dos outros.', correta: false, explicacao: 'Essa é a pegadinha. A demora de uma leitura de disco não depende de quem pediu; o que muda é quanto o processo calcula entre as requisições.' },
        { texto: 'A prioridade que o usuário atribuiu ao processo.', correta: false, explicacao: 'Prioridade é um parâmetro de escalonamento, não uma característica do comportamento do processo.' },
        { texto: 'O fato de o processo ser um daemon do sistema.', correta: false, explicacao: 'Daemons podem ser de qualquer tipo. A classificação vem do padrão de uso de CPU e E/S.' },
      ],
    },
    {
      id: 'm03-a01-q5',
      enunciado: 'Qual combinação está corretamente classificada?',
      alternativas: [
        { texto: 'Renderização de vídeo: CPU-bound. Editor de texto esperando o usuário digitar: I/O-bound.', correta: true, explicacao: 'Correto. A renderização calcula por longos períodos (surtos longos de CPU). O editor passa a maior parte do tempo esperando teclas, com surtos curtos de CPU.' },
        { texto: 'Renderização de vídeo: I/O-bound. Editor de texto: CPU-bound.', correta: false, explicacao: 'Está invertido. Quem calcula sem parar é CPU-bound; quem espera o usuário ou o disco o tempo todo é I/O-bound.' },
        { texto: 'Cálculo científico de matrizes: I/O-bound.', correta: false, explicacao: 'Cálculo pesado em memória usa a CPU por longos períodos: é o exemplo típico de CPU-bound.' },
        { texto: 'Servidor que lê arquivos do disco para cada requisição: CPU-bound.', correta: false, explicacao: 'Ele faz pouca computação entre leituras de disco, portanto é I/O-bound.' },
      ],
    },
    {
      id: 'm03-a01-q6',
      enunciado: 'Por que é desejável manter na memória uma <strong>mistura</strong> de processos CPU-bound e I/O-bound?',
      alternativas: [
        { texto: 'Porque, enquanto os I/O-bound esperam os dispositivos, os CPU-bound usam a CPU, e assim CPU e dispositivos ficam ocupados ao mesmo tempo.', correta: true, explicacao: 'Correto. Os slides chamam isso de situação ideal, com benefícios para o escalonamento. Só CPU-bound deixaria os dispositivos parados; só I/O-bound deixaria a CPU ociosa.' },
        { texto: 'Porque processos I/O-bound não precisam de CPU.', correta: false, explicacao: 'Todo processo precisa de CPU (o primeiro ciclo é sempre de processador). Os I/O-bound apenas usam surtos curtos.' },
        { texto: 'Porque processos CPU-bound não fazem nenhuma E/S.', correta: false, explicacao: 'Fazem, só que raramente. A classificação é relativa: ciclo de CPU muito maior que o de E/S.' },
        { texto: 'Porque assim o SO dispensa o escalonador.', correta: false, explicacao: 'O escalonador continua necessário para decidir quem usa a CPU. A mistura apenas melhora o aproveitamento dos recursos.' },
      ],
    },
    {
      id: 'm03-a01-q7',
      enunciado: 'Sobre o relacionamento entre processos, assinale a alternativa correta.',
      alternativas: [
        { texto: 'No UNIX, o criador é o pai e o criado é o filho; os processos formam uma árvore com o init na raiz, e o Windows não tem esse conceito de hierarquia.', correta: true, explicacao: 'Correto. O UNIX organiza os processos numa única árvore com o init na raiz. No Windows todos os processos são iguais: o pai recebe um handle do filho, que pode ser repassado.' },
        { texto: 'Um processo filho pode ter vários pais.', correta: false, explicacao: 'Um processo tem exatamente um pai (que pode ter vários filhos). O Tanenbaum compara: não é como animais, que têm dois pais.' },
        { texto: 'Quando o pai é destruído, os filhos sempre são destruídos também.', correta: false, explicacao: 'Essa é só uma das semânticas possíveis. Os filhos também podem ser herdados pelo avô (no UNIX, uma variante: adotados pelo init, e não pelo avô) ou o fim do pai pode ser adiado até os filhos terminarem.' },
        { texto: 'Processos independentes compartilham recursos com o pai obrigatoriamente.', correta: false, explicacao: 'Processos independentes, por definição, não têm relacionamento com outros. Compartilhar recursos é uma característica dos grupos de processos.' },
      ],
    },
    {
      id: 'm03-a01-q8',
      enunciado: 'Em uma máquina com <strong>uma única CPU</strong>, um usuário vê o navegador, o player de música e o antivírus "rodando ao mesmo tempo". O que realmente acontece?',
      alternativas: [
        { texto: 'A CPU alterna rapidamente entre os processos; em cada instante só um executa, o que dá a ilusão de paralelismo (pseudoparalelismo).', correta: true, explicacao: 'Correto. Cada processo tem uma CPU virtual (seu contador de programa lógico), mas há um só contador físico. A alternância rápida é a multiprogramação.' },
        { texto: 'Os três executam instruções exatamente no mesmo instante.', correta: false, explicacao: 'Isso seria paralelismo real, que exige mais de uma CPU ou núcleo. Com uma CPU, a execução é concorrente, não simultânea.' },
        { texto: 'Os três formam um único processo, porque estão abertos na mesma sessão.', correta: false, explicacao: 'São programas diferentes em execução, portanto processos diferentes, cada um com seu PID.' },
        { texto: 'Cada processo executa até terminar e só então o próximo começa.', correta: false, explicacao: 'Isso seria monoprogramação. Na multiprogramação os processos se alternam antes de terminar.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm03-a01-d1',
      enunciado: 'Diferencie programa e processo. Em seguida, explique os ciclos de um processo e a diferença entre processos CPU-bound e I/O-bound.',
      respostaModelo: `<p><strong>Programa</strong> é uma entidade <strong>estática e permanente</strong>: uma sequência de instruções guardada no disco, passiva do ponto de vista do SO. <strong>Processo</strong> é um <strong>programa em execução</strong>: entidade <strong>dinâmica e efêmera</strong>, composta por código, dados e contexto (contador de programa, registradores, variáveis), cujo estado muda conforme avança, identificada por um <strong>PID</strong>. Um mesmo programa pode originar vários processos (instâncias com o mesmo código e contextos diferentes).</p>
<p>Todo processo alterna dois ciclos: o <strong>ciclo de processador</strong> (tempo usando a CPU) e o <strong>ciclo de E/S</strong> (tempo esperando um evento, como o fim de uma leitura). O <strong>primeiro ciclo é sempre de processador</strong>. As trocas ocorrem por chamada de sistema, interrupção ou ocorrência de evento.</p>
<p>Um processo <strong>CPU-bound</strong> tem ciclos de processador muito maiores que os de E/S (ex.: renderização de vídeo). Um processo <strong>I/O-bound</strong> tem ciclos de E/S muito maiores, com surtos curtos de CPU (ex.: editor de texto). Não há um limite numérico exato; o fator principal é o tamanho do surto de CPU. O ideal é misturar os dois tipos, para que CPU e dispositivos fiquem ocupados ao mesmo tempo.</p>`,
      pontosChave: [
        'Programa é estático/passivo; processo é dinâmico, programa em execução',
        'Processo tem código, dados e contexto e é identificado por um PID; um programa pode gerar vários processos',
        'Ciclos de processador e de E/S, sendo o primeiro sempre de processador',
        'CPU-bound: surtos longos de CPU; I/O-bound: surtos curtos e muita espera por E/S',
        'Misturar os dois tipos melhora o aproveitamento dos recursos',
      ],
    },
  ],
});
