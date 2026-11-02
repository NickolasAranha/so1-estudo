// Módulo 9, aula 1: dispositivos de bloco x caractere, controladoras, E/S mapeada em memória x espaço de E/S.
SO1.registerLesson({
  id: 'm09-a01',
  titulo: 'Hardware de E/S',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §5.1.1–5.1.3 (p.203–207)',
    'Slides cap5 (Oliveira/Carissimi/Toscani, UFRGS): princípios básicos de hardware, dispositivos de E/S, controladoras, mapeamento em memória x em espaço de E/S',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: o balcão de uma loja de peças.</strong> O cliente (a CPU) não entra no estoque para procurar a peça. Ele fala com o <em>balconista</em> (a controladora), que entende o estoque (o dispositivo). Para conversar, existem duas formas de "endereçar" o balconista: ou ele tem um <em>guichê próprio</em>, com uma fila só para ele (espaço de E/S separado), ou ele fica numa das <em>mesas numeradas do salão</em>, junto com as mesas comuns, e você só precisa saber o número da mesa (E/S mapeada em memória).</p>
</div>

<h2>Periférico, interface e controladora</h2>
<p>Um <strong>periférico</strong> é um dispositivo ligado ao computador para que ele interaja com o mundo externo (teclado, disco, rede, impressora). Todo dispositivo de E/S tem uma <strong>parte mecânica</strong> (o dispositivo em si) e uma <strong>parte eletrônica</strong>, a <strong>controladora</strong> (ou <em>adaptador</em>), em geral uma placa ou um chip na placa-mãe.</p>
<ul>
  <li>O periférico se liga ao computador por uma <strong>interface</strong>, que fica conectada aos <strong>barramentos</strong> internos.</li>
  <li>A controladora tem um <strong>processador dedicado</strong> que faz e controla as operações de E/S. Ela converte o fluxo serial de bits do dispositivo em blocos de bytes, guarda o bloco num <strong>buffer interno</strong> e confere erros com o <strong>ECC</strong> (código de correção de erros).</li>
  <li>O SO quase nunca fala com o dispositivo: ele fala com a <strong>controladora</strong>.</li>
</ul>
<p>Pela ligação física, a interface pode ser <strong>serial</strong> (uma linha de dados, bit a bit) ou <strong>paralela</strong> (várias linhas ao mesmo tempo, por exemplo n × 8 bits).</p>

<h2>Dispositivos de bloco x de caractere</h2>
<table>
  <tr><th></th><th>Orientado a <strong>bloco</strong></th><th>Orientado a <strong>caractere</strong></th></tr>
  <tr><td>Unidade de transferência</td><td>Bloco de tamanho fixo (ex.: 512 bytes a 32 KB)</td><td>Fluxo (stream) de caracteres</td></tr>
  <tr><td>Endereçável?</td><td><strong>Sim</strong>: cada bloco tem endereço e pode ser lido ou escrito independentemente dos outros</td><td><strong>Não</strong>: não há endereço nem operação de busca (seek)</td></tr>
  <tr><td>Exemplos</td><td>Disco rígido, CD-ROM, pen drive, fita DAT</td><td>Teclado, mouse, impressora, interface serial, placa de rede</td></tr>
</table>
<p>A classificação <strong>não é perfeita</strong>: alguns dispositivos não se encaixam em nenhuma das duas. O exemplo clássico é o <strong>relógio (timer)</strong>, que não tem blocos nem fluxo de caracteres; ele só gera interrupções em intervalos definidos. A memória de vídeo mapeada também é citada nos slides como exceção.</p>
<p>Os slides classificam ainda pelo tipo de entidade com que o dispositivo interage: com o <strong>usuário</strong> (vídeo, teclado, mouse, impressora), com <strong>dispositivos eletrônicos</strong> (discos, fitas, atuadores) e com <strong>dispositivos remotos</strong> (modem, placa de rede). Cada dispositivo tem características próprias: taxa de transferência, complexidade de controle, unidade de transferência, representação dos dados e tratamento de erros.</p>

<h2>Como a CPU conversa com a controladora</h2>
<p>A controladora tem <strong>registradores de controle</strong> (de configuração): a CPU escreve neles para dar <strong>ordens</strong> (ler, escrever, ligar, desligar) e lê deles o <strong>estado</strong> do dispositivo (pronto? ocupado? erro?). Muitos dispositivos também têm um <strong>buffer de dados</strong> (ex.: a memória de vídeo). A questão é: <em>como a CPU endereça esses registradores?</em> Existem dois esquemas (e um híbrido).</p>

<figure class="diagrama">
  <svg viewBox="0 0 470 266" style="max-width:600px" role="img" aria-label="Três esquemas: espaços de memória e E/S separados, E/S mapeada em memória e híbrido">
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <text x="80" y="18" font-weight="bold">(a) Espaços separados</text>
      <text x="235" y="18" font-weight="bold">(b) Mapeada em memória</text>
      <text x="395" y="18" font-weight="bold">(c) Híbrido</text>
    </g>
    <g stroke="currentColor" fill="none">
      <rect x="30" y="40" width="60" height="150"/>
      <rect x="205" y="40" width="60" height="150"/>
      <rect x="365" y="40" width="60" height="150"/>
    </g>
    <rect x="100" y="165" width="40" height="25" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
    <rect x="205" y="40" width="60" height="28" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
    <rect x="365" y="40" width="60" height="28" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
    <rect x="435" y="165" width="30" height="25" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
    <g font-size="11" text-anchor="middle" fill="currentColor">
      <text x="60" y="120">Memória</text>
      <text x="120" y="158">Portas</text>
      <text x="120" y="181">E/S</text>
      <text x="60" y="210">mov →</text>
      <text x="60" y="224">memória</text>
      <text x="125" y="210">in/out →</text>
      <text x="125" y="224">portas</text>
      <text x="235" y="58">regs. E/S</text>
      <text x="235" y="120">Memória</text>
      <text x="235" y="210">um só espaço:</text>
      <text x="235" y="224">mov acessa os dois</text>
      <text x="395" y="58">buffers</text>
      <text x="395" y="120">Memória</text>
      <text x="450" y="158">portas</text>
      <text x="395" y="210">buffers na memória,</text>
      <text x="395" y="224">registradores em portas</text>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="26" y="44" text-anchor="end">alto</text>
      <text x="26" y="192" text-anchor="end">0</text>
    </g>
    <text x="235" y="246" font-size="11" text-anchor="middle" fill="currentColor">Ex.: IBM 360 e família Intel (portas) em (a); PDP-11/Motorola em (b);</text>
    <text x="235" y="260" font-size="11" text-anchor="middle" fill="currentColor">o PC com Pentium usa (c).</text>
  </svg>
  <figcaption>Os três esquemas da Figura 5.1 do Tanenbaum. Em amarelo, o que pertence aos dispositivos de E/S.</figcaption>
</figure>

<h3>1. E/S mapeada em espaço de E/S (portas de E/S)</h3>
<p>O processador tem <strong>dois espaços de endereçamento distintos</strong>: o de memória e o de E/S. Cada registrador de controle recebe um número de <strong>porta de E/S</strong>. Para acessá-lo existem <strong>instruções especiais</strong>, como <code>IN REG,PORTA</code> e <code>OUT PORTA,REG</code>. Assim, <code>IN R0,4</code> lê a <em>porta</em> 4, enquanto <code>MOV R0,4</code> lê a <em>palavra de memória</em> 4: são coisas sem relação. Exemplo: processadores da família <strong>Intel</strong>; foi o esquema da maioria dos primeiros computadores, como o IBM 360.</p>

<h3>2. E/S mapeada em memória</h3>
<p>Há <strong>um único espaço de endereçamento</strong>. No projeto do computador, uma parte dos endereços é reservada para os registradores das controladoras, e nenhuma memória responde a esses endereços. A mesma instrução <code>mov</code> pode acessar uma posição de memória ou um registrador de dispositivo. Exemplo: família <strong>Motorola</strong>; apresentado pelo PDP-11.</p>

<h3>3. Híbrido</h3>
<p>Os <strong>buffers de dados</strong> ficam mapeados em memória e os <strong>registradores de controle</strong> ficam em portas de E/S. É o caso do Pentium nos PCs: endereços de 640 KB a 1 MB − 1 para buffers e portas de 0 a 64 K − 1.</p>

<h3>Vantagens e desvantagens da E/S mapeada em memória</h3>
<table>
  <tr><th>Vantagens</th><th>Desvantagens</th></tr>
  <tr><td><strong>Driver todo em C</strong>: os registradores viram variáveis comuns (ponteiros); não é preciso assembly para executar IN/OUT.</td><td><strong>Cache</strong>: guardar em cache um registrador de dispositivo seria desastroso (a CPU leria sempre o valor antigo do status). O hardware precisa poder <strong>desabilitar a cache por página</strong>, o que complica hardware e SO.</td></tr>
  <tr><td><strong>Proteção sem mecanismo extra</strong>: basta não mapear a página dos registradores no espaço de endereçamento do usuário; cada driver pode ter seus registradores numa página diferente.</td><td><strong>Barramentos separados</strong>: com um barramento rápido só para a memória, os dispositivos de E/S não "enxergam" os endereços que passam por ele, e são necessárias soluções extras (ex.: tentar a memória primeiro e, se falhar, os outros barramentos).</td></tr>
  <tr><td><strong>Qualquer instrução de memória serve</strong>: uma instrução TEST que testa uma palavra de memória testa também um registrador de controle, economizando instruções em laços de espera.</td><td></td></tr>
</table>

<div class="exemplo">
  <p><strong>Exemplo passo a passo (slides cap5): imprimir um caractere.</strong> Uma controladora de impressão tem um registrador de <em>status</em> no endereço <code>315H</code> e um registrador de <em>dado</em> (caractere a imprimir) no endereço <code>312H</code>. Vamos imprimir o caractere de código <code>65H</code>.</p>
  <table>
    <tr><th>Passo</th><th>Mapeada em memória</th><th>Mapeada em espaço de E/S</th><th>O que acontece</th></tr>
    <tr><td>1. Ler o status</td><td><code>mov AL, 315H</code></td><td><code>in AL, 315H</code></td><td>A CPU lê o registrador de status da controladora para ver se a impressora está pronta.</td></tr>
    <tr><td>2. Preparar o caractere</td><td><code>mov AL, 65H</code></td><td><code>mov AL, 65H</code></td><td>Carrega o caractere num registrador da CPU (operação interna, igual nos dois esquemas).</td></tr>
    <tr><td>3. Enviar o caractere</td><td><code>mov 312H, AL</code></td><td><code>out 312H, AL</code></td><td>A CPU escreve no registrador de dado; a controladora cuida de imprimir.</td></tr>
  </table>
  <p>Repare: em memória, <strong>tudo é <code>mov</code></strong>; o endereço 315H "cai" na controladora porque essa faixa foi reservada para ela. No espaço de E/S, o mesmo número 315H usado com <code>mov</code> seria uma posição de <em>memória</em>; por isso é preciso usar <code>in</code>/<code>out</code>.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>Quem distingue os dois esquemas é a <strong>instrução</strong>: espaço de E/S exige <strong>instruções especiais (IN/OUT)</strong>; mapeada em memória usa as <strong>instruções normais de acesso à memória</strong>.</li>
    <li>Bloco = <strong>endereçável</strong> e com seek; caractere = <strong>não endereçável</strong>. O relógio não é nem um nem outro.</li>
    <li>A <strong>controladora</strong> é a parte eletrônica; o SO conversa com ela, não com a parte mecânica. Ela tem processador e buffer próprios.</li>
    <li>E/S mapeada em memória <strong>não</strong> significa que o dado do dispositivo é copiado para a RAM: os endereços são <em>desviados</em> para a controladora.</li>
  </ul>
</div>
`,
  resumo: 'Todo dispositivo de E/S tem uma parte mecânica e uma controladora eletrônica, com registradores e buffer, com a qual o SO conversa. Dispositivos são orientados a bloco (endereçáveis, como o disco) ou a caractere (fluxo, como o teclado); o relógio foge da classificação. Os registradores da controladora são acessados por portas num espaço de E/S separado (instruções IN/OUT, ex.: Intel) ou mapeados no espaço de memória (instruções comuns, ex.: Motorola), ou ainda num esquema híbrido.',
  questoes: [
    {
      id: 'm09-a01-q1',
      enunciado: 'Qual característica distingue um dispositivo <strong>orientado a bloco</strong> de um <strong>orientado a caractere</strong>?',
      alternativas: [
        { texto: 'No dispositivo de bloco, cada bloco tem endereço e pode ser lido ou escrito independentemente; no de caractere, há um fluxo sem endereços nem seek.', correta: true, explicacao: 'Correto. É o critério do Tanenbaum: o disco é endereçável por bloco; o teclado ou a impressora apenas entregam ou recebem uma sequência de caracteres.' },
        { texto: 'Dispositivos de bloco são sempre mais rápidos que os de caractere.', correta: false, explicacao: 'Velocidade não é o critério. Uma placa de rede (caractere) pode ser mais rápida que um disquete (bloco). O critério é a unidade de transferência e o endereçamento.' },
        { texto: 'Dispositivos de caractere usam controladora e os de bloco não.', correta: false, explicacao: 'Ambos têm controladora. Teclado e disco têm uma parte eletrônica que conversa com a CPU.' },
        { texto: 'Dispositivos de bloco são de entrada e os de caractere são de saída.', correta: false, explicacao: 'O disco faz entrada e saída, e o teclado é de entrada. A classificação bloco/caractere não tem relação com o sentido da transferência.' },
      ],
    },
    {
      id: 'm09-a01-q2',
      enunciado: 'Qual dispositivo é citado como exemplo de que a classificação bloco x caractere <strong>não é perfeita</strong>?',
      alternativas: [
        { texto: 'O relógio (timer), que só gera interrupções em intervalos definidos.', correta: true, explicacao: 'Correto. O relógio não é endereçável por blocos nem gera ou aceita um fluxo de caracteres. Os slides citam também a memória de vídeo mapeada.' },
        { texto: 'O disco rígido.', correta: false, explicacao: 'O disco é o exemplo típico de dispositivo de bloco, não uma exceção.' },
        { texto: 'O teclado.', correta: false, explicacao: 'O teclado é o exemplo típico de dispositivo de caractere.' },
        { texto: 'A fita DAT.', correta: false, explicacao: 'Os slides citam a fita DAT como dispositivo orientado a bloco, junto com o disco.' },
      ],
    },
    {
      id: 'm09-a01-q3',
      enunciado: 'Em um processador com <strong>espaço de E/S separado</strong>, como o software acessa o registrador de status de uma controladora?',
      alternativas: [
        { texto: 'Com instruções especiais de E/S, como IN e OUT, usando o número da porta.', correta: true, explicacao: 'Correto. Nesse esquema há dois espaços distintos; a porta 4 e o endereço de memória 4 são coisas diferentes, e só IN/OUT chegam às portas.' },
        { texto: 'Com uma instrução MOV comum, porque o registrador está num endereço de memória reservado.', correta: false, explicacao: 'Isso descreve a E/S mapeada em memória. Com espaço de E/S separado, MOV acessaria a memória, não a porta.' },
        { texto: 'Por DMA, sem participação da CPU.', correta: false, explicacao: 'DMA é uma técnica de transferência de dados (aula 2). Mesmo com DMA, a CPU precisa programar o controlador de DMA por meio de registradores.' },
        { texto: 'Por uma chamada de sistema que o hardware executa sozinho.', correta: false, explicacao: 'Chamada de sistema é o pedido do programa ao SO. O driver, dentro do SO, é quem executa IN/OUT para chegar ao registrador.' },
      ],
    },
    {
      id: 'm09-a01-q4',
      enunciado: 'Qual é uma <strong>vantagem</strong> da E/S mapeada em memória?',
      alternativas: [
        { texto: 'O driver pode ser escrito inteiramente em C, porque os registradores são acessados como variáveis comuns.', correta: true, explicacao: 'Correto. Sem instruções IN/OUT, não é preciso trecho em assembly. Outra vantagem é a proteção: basta não mapear a página dos registradores para os processos de usuário.' },
        { texto: 'Os registradores podem ficar na cache, acelerando a leitura do status.', correta: false, explicacao: 'É o contrário: manter registrador de dispositivo em cache é um problema da E/S mapeada em memória. A CPU leria um status velho e o laço de espera nunca terminaria; por isso a cache precisa ser desabilitada para essas páginas.' },
        { texto: 'Dispensa a controladora, pois a CPU fala direto com o dispositivo.', correta: false, explicacao: 'A controladora continua existindo. O que muda é só a forma de endereçar os registradores dela.' },
        { texto: 'Funciona sem ajustes em máquinas com barramento de memória separado do barramento de E/S.', correta: false, explicacao: 'Esse é justamente um problema: com barramento dedicado à memória, os dispositivos não veem os endereços que passam por ele, e o hardware precisa de soluções extras.' },
      ],
    },
    {
      id: 'm09-a01-q5',
      enunciado: 'Num esquema mapeado em memória, o endereço 312H corresponde ao registrador de dados de uma impressora. O que faz a instrução <code>mov 312H, AL</code>?',
      alternativas: [
        { texto: 'Envia o conteúdo de AL para o registrador de dados da controladora da impressora.', correta: true, explicacao: 'Correto. Essa faixa de endereços foi reservada para a controladora, então a escrita "cai" no registrador dela, que recebe o caractere a imprimir.' },
        { texto: 'Grava AL na posição 312H da RAM, e a impressora não é afetada.', correta: false, explicacao: 'Isso aconteceria no esquema de espaço de E/S separado. Mapeado em memória, nenhuma RAM responde nesse endereço: quem responde é a controladora.' },
        { texto: 'Lê o status da impressora para AL.', correta: false, explicacao: 'O destino é 312H e a origem é AL: a instrução escreve no dispositivo. A leitura de status seria do endereço 315H para AL.' },
        { texto: 'Gera erro, pois mov não pode acessar dispositivos.', correta: false, explicacao: 'Na E/S mapeada em memória, mov é exatamente a instrução usada para acessar os dispositivos.' },
      ],
    },
    {
      id: 'm09-a01-q6',
      enunciado: 'Sobre a <strong>controladora</strong> de um dispositivo, é correto afirmar:',
      alternativas: [
        { texto: 'É a parte eletrônica do dispositivo; tem registradores, buffer e muitas vezes um processador próprio, e é com ela que o SO conversa.', correta: true, explicacao: 'Correto. Ela converte o fluxo de bits em blocos, confere o ECC, guarda o bloco no buffer e avisa a CPU. O SO programa os registradores dela.' },
        { texto: 'É um programa do SO que traduz pedidos genéricos em comandos do dispositivo.', correta: false, explicacao: 'Isso é o driver (software). A controladora é hardware; o driver é o software que conversa com ela.' },
        { texto: 'Só existe em dispositivos de bloco.', correta: false, explicacao: 'Teclado, mouse e placa de rede também têm controladora.' },
        { texto: 'É o barramento que liga a CPU à memória.', correta: false, explicacao: 'O barramento é o caminho. A controladora fica ligada a ele, por meio de uma interface, e cuida de um ou mais dispositivos.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm09-a01-d1',
      enunciado: 'Compare a E/S mapeada em espaço de E/S com a E/S mapeada em memória. Dê um exemplo de código de cada uma e cite uma vantagem e uma desvantagem da E/S mapeada em memória.',
      respostaModelo: `<p>A controladora de um dispositivo tem registradores (de controle, de status e de dados) que a CPU precisa ler e escrever. Na <strong>E/S mapeada em espaço de E/S</strong>, o processador tem dois espaços de endereçamento distintos: o de memória e o de E/S (portas). Os registradores recebem números de porta e só são acessados por <strong>instruções especiais</strong>, como <code>in AL, 315H</code> e <code>out 312H, AL</code> (ex.: processadores Intel).</p>
<p>Na <strong>E/S mapeada em memória</strong>, existe um só espaço de endereçamento: parte dos endereços é reservada para as controladoras e as <strong>instruções comuns</strong> de memória acessam os registradores, como <code>mov AL, 315H</code> e <code>mov 312H, AL</code> (ex.: Motorola). Há também o esquema híbrido (buffers em memória, registradores em portas), usado no PC.</p>
<p>Vantagens da mapeada em memória: o driver pode ser escrito todo em C; a proteção é feita simplesmente não mapeando as páginas dos registradores para os processos de usuário; qualquer instrução que acessa memória serve para testar um registrador. Desvantagens: a cache precisa ser desabilitada para essas páginas (senão a CPU leria um status antigo) e, com barramentos separados para memória, os dispositivos não veem os endereços.</p>`,
      pontosChave: [
        'Explicou que no espaço de E/S há dois espaços de endereçamento e instruções especiais (IN/OUT)',
        'Explicou que na mapeada em memória há um só espaço e as instruções normais (MOV) acessam os registradores',
        'Deu exemplo de código ou de processador para cada esquema (Intel x Motorola)',
        'Citou ao menos uma vantagem (driver em C, proteção por página, instruções comuns)',
        'Citou ao menos uma desvantagem (cache precisa ser desabilitada, barramentos separados)',
      ],
    },
  ],
});
