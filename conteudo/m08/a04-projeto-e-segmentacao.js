// Módulo 8, aula 4: questões de projeto da paginação e segmentação.
SO1.registerLesson({
  id: 'm08-a04',
  titulo: 'Questões de projeto e segmentação',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §3.5 (p.133–140): alocação local x global (Fig. 3.21), alocação igual e proporcional, PFF (Fig. 3.22), controle de carga, tamanho de página (custo = se/p + p/2), espaços I e D, páginas compartilhadas e copiar-na-escrita, bibliotecas compartilhadas',
    'Tanenbaum, §3.7 (p.144–153): segmentação, comparação paginação x segmentação (Tab. 3.3), segmentação pura e checkerboarding (Fig. 3.31), segmentação com paginação no MULTICS (Fig. 3.32–3.35)',
    'Silberschatz, Fundamentos de SO: tradução de endereço segmentado com tabela de segmentos (base e limite)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: uma república de estudantes com um só armário.</strong> Se cada morador só pode tirar as próprias coisas para abrir espaço, ninguém invade o outro, mas quem precisa de mais espaço sofre (alocação <strong>local</strong>). Se qualquer um pode tirar as coisas de qualquer um, o espaço se ajusta sozinho, mas um morador pode acabar sem nada (alocação <strong>global</strong>). E se moradores demais tentam usar o armário, todos passam o dia guardando e tirando coisas sem fazer nada útil: é a <strong>ultrapaginação</strong>. A solução é mandar alguém passar uns dias fora.</p>
</div>

<h2>1. Alocação local x global</h2>
<p>Na falta de página, de quem tirar a moldura? No exemplo do livro (Fig. 3.21), os processos A, B e C estão na memória e A sofre uma falta. Cada página tem um valor de "idade" (o contador do envelhecimento: quanto menor, há mais tempo a página não é usada). A vítima é, portanto, a página de <strong>menor</strong> valor de idade.</p>
<ul>
  <li><strong>Algoritmo local</strong>: considera <strong>só as páginas do próprio processo</strong>. Cada processo tem uma fração <strong>fixa</strong> da memória. No exemplo, sai A5 (menor valor de idade entre as páginas de A: 3).</li>
  <li><strong>Algoritmo global</strong>: considera <strong>todas as páginas da memória</strong>. O número de molduras de cada processo <strong>varia</strong>. No exemplo, sai B3 (menor valor de idade de todas: 2).</li>
</ul>
<p>Em geral, <strong>os globais funcionam melhor</strong>, principalmente quando o conjunto de trabalho varia: com local, um processo cujo conjunto de trabalho cresce sofre ultrapaginação mesmo havendo molduras livres; e se o conjunto diminui, o local desperdiça memória. Com global, o SO precisa decidir quantas molduras dar a cada processo:</p>
<ul>
  <li><strong>Alocação igual</strong>: divide as molduras igualmente. Ex.: 12.416 molduras e 10 processos → 1.241 para cada; as 6 restantes ficam num <em>pool</em> para as faltas.</li>
  <li><strong>Alocação proporcional</strong>: proporcional ao tamanho do processo (um processo de 300 KB recebe 30 vezes mais que um de 10 KB). Sempre com um <strong>mínimo</strong> de molduras, para que qualquer instrução consiga executar.</li>
  <li><strong>PFF</strong> (<em>page fault frequency</em>, frequência de faltas de página): mede as faltas por segundo de cada processo. Acima de um limite A (muitas faltas), o processo ganha molduras; abaixo de um limite B (poucas faltas), perde molduras. O PFF controla o <strong>tamanho</strong> da alocação, não qual página sai.</li>
</ul>
<p>Alguns algoritmos servem nos dois modos (FIFO, LRU). Já o <strong>conjunto de trabalho</strong> e o <strong>WSClock</strong> só fazem sentido como <strong>locais</strong>, pois se referem a um processo específico.</p>

<h2>2. Ultrapaginação (thrashing) e controle de carga</h2>
<p><strong>Ultrapaginação</strong> é quando o sistema gasta mais tempo trocando páginas do que executando: os conjuntos de trabalho somados de todos os processos <strong>não cabem na memória</strong>, cada processo gera faltas a cada poucas instruções e a CPU fica ociosa esperando o disco. O sintoma no PFF: alguns processos precisam de mais memória e <strong>nenhum</strong> pode ceder.</p>
<p>A solução é o <strong>controle de carga</strong>: <strong>reduzir o número de processos</strong> que competem pela memória, levando alguns para o disco (swapping) e distribuindo suas molduras entre os outros. É o <strong>escalonamento de dois níveis</strong> (o mesmo escalonamento de médio prazo do módulo de processos, que gera os estados suspensos). Mas não se pode exagerar: com poucos processos na memória, a CPU fica ociosa. Ao escolher quem sai, considera-se tamanho, taxa de paginação e se o processo é limitado por CPU ou por E/S.</p>

<h2>3. Tamanho de página</h2>
<table>
  <tr><th>Páginas pequenas</th><th>Páginas grandes</th></tr>
  <tr><td>Menos <strong>fragmentação interna</strong>: em média, metade da última página fica vazia (com n segmentos na memória e páginas de p bytes, perdem-se n·p/2 bytes).</td><td>Tabela de páginas menor e menos entradas para carregar a cada troca de contexto.</td></tr>
  <tr><td>Menos partes do programa não usadas na memória.</td><td>Transferir uma página grande custa quase o mesmo que uma pequena (o tempo de disco é dominado por posicionamento e rotação): 64 páginas de 512 B levam 64 × 10 ms; 4 de 8 KB, cerca de 4 × 12 ms.</td></tr>
</table>
<p>Matematicamente, com processo de tamanho médio <strong>s</strong> bytes, página de <strong>p</strong> bytes e <strong>e</strong> bytes por entrada da tabela:</p>
<p style="text-align:center"><strong>custo adicional = s·e/p + p/2</strong> (tabela de páginas + fragmentação interna)</p>
<p>Derivando e igualando a zero, o tamanho ótimo é <strong>p = √(2·s·e)</strong>. Para s = 1 MB e e = 8 bytes, p = √(2 × 2<sup>20</sup> × 8) = √2<sup>24</sup> = 4096 = <strong>4 KB</strong>. Os tamanhos comerciais vão de 512 bytes a 64 KB; o típico é 4 KB ou 8 KB.</p>

<h2>4. Espaços I e D, páginas e bibliotecas compartilhadas</h2>
<ul>
  <li><strong>Espaços I e D separados</strong>: um espaço de endereçamento para instruções (I) e outro para dados (D), cada um com sua tabela de páginas, dobrando o espaço disponível (pioneiro no PDP-11).</li>
  <li><strong>Páginas compartilhadas</strong>: vários usuários rodando o mesmo programa podem compartilhar suas páginas em vez de ter cópias. Páginas <strong>somente de leitura</strong> (código) são compartilháveis; dados alteráveis não. Cuidado: se o processo A termina, o SO não pode liberar as páginas que B ainda usa.</li>
  <li><strong>Copiar-na-escrita</strong> (<em>copy on write</em>): após o fork no UNIX, pai e filho compartilham todas as páginas marcadas como SOMENTE LEITURA. Quando um deles tenta escrever, ocorre uma interrupção e o SO faz uma cópia privada daquela página, agora como LEITURA-ESCRITA. Só as páginas realmente modificadas são copiadas.</li>
  <li><strong>Bibliotecas compartilhadas</strong> (DLLs no Windows): em vez de ligar a biblioteca em cada executável, o programa usa uma rotina <em>stub</em> e a biblioteca é carregada uma vez e compartilhada. Economiza disco e RAM, e uma correção na biblioteca vale para todos os programas sem recompilar. Como cada processo a vê em um endereço diferente, ela deve usar <strong>código independente de posição</strong> (só deslocamentos relativos).</li>
</ul>

<h2>5. Segmentação</h2>
<p>A memória paginada é <strong>unidimensional</strong>: os endereços vão de 0 ao máximo, um após o outro. Um compilador tem várias tabelas que crescem e diminuem (código-fonte, tabela de símbolos, constantes, árvore sintática, pilha); num espaço único, uma pode "bater" na outra. A <strong>segmentação</strong> dá à máquina <strong>vários espaços de endereçamento independentes</strong>, os <strong>segmentos</strong>:</p>
<ul>
  <li>Cada segmento é uma sequência linear de endereços de 0 a um máximo; segmentos diferentes têm <strong>tamanhos diferentes</strong>, que podem <strong>variar durante a execução</strong>.</li>
  <li>O endereço tem <strong>duas partes</strong>: <strong>(número do segmento, endereço dentro do segmento)</strong>.</li>
  <li>O segmento é uma <strong>entidade lógica</strong> que o programador conhece (uma rotina, um arranjo, a pilha). Por isso cada um pode ter a <strong>proteção</strong> adequada (código só execução, dados leitura/escrita), o <strong>compartilhamento</strong> fica fácil (uma biblioteca num segmento) e a ligação de rotinas compiladas separadamente é simplificada.</li>
</ul>

<figure class="diagrama">
  <svg viewBox="0 0 560 300" style="max-width:640px" role="img" aria-label="Tradução de endereço segmentado: o número do segmento indexa a tabela de segmentos, o deslocamento é comparado com o limite e somado à base">
    <g font-size="13" fill="currentColor" text-anchor="middle">
      <text x="110" y="20" font-weight="bold">Endereço lógico (2, 53)</text>
      <rect x="40" y="30" width="70" height="36" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/><text x="75" y="53">seg. 2</text>
      <rect x="110" y="30" width="90" height="36" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/><text x="155" y="53">desloc. 53</text>

      <text x="110" y="100" font-weight="bold" font-size="12">Tabela de segmentos</text>
      <text x="40" y="118" font-size="11">seg.</text><text x="105" y="118" font-size="11">limite</text><text x="170" y="118" font-size="11">base</text>
      <rect x="70" y="124" width="70" height="22" fill="none" stroke="currentColor"/><rect x="140" y="124" width="70" height="22" fill="none" stroke="currentColor"/><text x="40" y="140" font-size="12">0</text><text x="105" y="140" font-size="12">1000</text><text x="175" y="140" font-size="12">1400</text>
      <rect x="70" y="146" width="70" height="22" fill="none" stroke="currentColor"/><rect x="140" y="146" width="70" height="22" fill="none" stroke="currentColor"/><text x="40" y="162" font-size="12">1</text><text x="105" y="162" font-size="12">400</text><text x="175" y="162" font-size="12">6300</text>
      <rect x="70" y="168" width="70" height="22" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/><rect x="140" y="168" width="70" height="22" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/><text x="40" y="184" font-size="12" font-weight="bold">2</text><text x="105" y="184" font-size="12" font-weight="bold">400</text><text x="175" y="184" font-size="12" font-weight="bold">4300</text>
      <rect x="70" y="190" width="70" height="22" fill="none" stroke="currentColor"/><rect x="140" y="190" width="70" height="22" fill="none" stroke="currentColor"/><text x="40" y="206" font-size="12">3</text><text x="105" y="206" font-size="12">1100</text><text x="175" y="206" font-size="12">3200</text>
      <rect x="70" y="212" width="70" height="22" fill="none" stroke="currentColor"/><rect x="140" y="212" width="70" height="22" fill="none" stroke="currentColor"/><text x="40" y="228" font-size="12">4</text><text x="105" y="228" font-size="12">1000</text><text x="175" y="228" font-size="12">4700</text>

      <polygon points="340,149 400,179 340,209 280,179" style="fill:var(--lateral)" stroke="currentColor"/>
      <text x="340" y="176" font-size="11">53 &lt; 400?</text>
      <text x="340" y="190" font-size="11">(limite)</text>
      <circle cx="480" cy="179" r="20" style="fill:var(--azul-claro);stroke:var(--azul)"/><text x="480" y="186" font-size="20">+</text>
      <rect x="420" y="240" width="120" height="44" rx="8" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <text x="480" y="259">Endereço físico</text><text x="480" y="276" font-weight="bold">4300 + 53 = 4353</text>
      <rect x="275" y="240" width="130" height="44" rx="8" style="fill:var(--vermelho-claro);stroke:var(--vermelho)"/>
      <text x="340" y="259" font-size="12">Não: interrupção</text><text x="340" y="275" font-size="12">(erro de endereço)</text>
    </g>
    <g fill="none" stroke-width="1.6">
      <path d="M75 66 V84 H18 V179 H30" style="stroke:var(--azul)"/>
      <path d="M200 48 H340 V147" style="stroke:var(--verde)"/>
      <path d="M210 179 H278" style="stroke:var(--azul)"/>
      <path d="M400 179 H458" stroke="currentColor"/>
      <path d="M480 201 V238" stroke="currentColor"/>
      <path d="M340 209 V238" stroke="currentColor"/>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="414" y="172">sim</text><text x="346" y="228">não</text>
      <text x="214" y="172">400 | 4300</text>
      <text x="346" y="100">deslocamento 53</text>
      <text x="456" y="146">soma a base</text><text x="470" y="159">4300</text>
    </g>
  </svg>
  <figcaption>Segmentação: o número do segmento indexa a tabela de segmentos; o deslocamento é comparado com o limite (tamanho do segmento) e somado à base. A ideia é a mesma dos registradores-base e limite, mas com um par por segmento.</figcaption>
</figure>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: traduzindo endereços segmentados</strong> com a tabela da figura.</p>
  <table>
    <tr><th>Endereço (seg., desloc.)</th><th>Desloc. &lt; limite?</th><th>Cálculo</th><th>Resultado</th></tr>
    <tr><td>(2, 53)</td><td>53 &lt; 400: sim</td><td>4300 + 53</td><td><strong>4353</strong></td></tr>
    <tr><td>(3, 852)</td><td>852 &lt; 1100: sim</td><td>3200 + 852</td><td><strong>4052</strong></td></tr>
    <tr><td>(0, 1222)</td><td>1222 &lt; 1000: não</td><td>—</td><td><strong>Interrupção</strong> (endereço além do segmento)</td></tr>
    <tr><td>(1, 400)</td><td>400 &lt; 400: não</td><td>—</td><td><strong>Interrupção</strong> (o último válido é 399)</td></tr>
  </table>
</div>

<h3>Segmentação pura e fragmentação externa</h3>
<p>Na segmentação pura, cada segmento ocupa uma área contígua da memória, de tamanho variável. Com segmentos entrando e saindo, a memória fica dividida em segmentos e <strong>lacunas</strong>: é a <strong>fragmentação externa</strong>, que o Tanenbaum chama de <strong>checkerboarding</strong> (tabuleiro de xadrez). Resolve-se com <strong>compactação</strong>. (A paginação não tem esse problema, pois todas as molduras têm o mesmo tamanho; ela só tem fragmentação interna.)</p>

<h3>Segmentação com paginação (MULTICS, Pentium)</h3>
<p>Segmentos grandes podem não caber inteiros na memória. A ideia é <strong>paginar cada segmento</strong>: só as páginas realmente necessárias ficam na memória. Junta as vantagens da paginação (tamanho uniforme, sem fragmentação externa, segmento não precisa estar todo na memória) com as da segmentação (programação modular, proteção e compartilhamento por segmento).</p>
<p>No <strong>MULTICS</strong>, cada programa tem uma <strong>tabela de segmentos</strong> com um <strong>descritor</strong> por segmento (até 2<sup>18</sup> segmentos, cada um com até 65.536 palavras). O descritor indica se o segmento está na memória, aponta para a tabela de páginas do segmento e traz tamanho e bits de proteção. O endereço tem <strong>número do segmento (18 bits)</strong> + <strong>número da página (6 bits)</strong> + <strong>deslocamento (10 bits)</strong>. Tradução: (1) o número do segmento acha o descritor; (2) se a tabela de páginas do segmento não está na memória, ocorre <strong>falta de segmento</strong> (violação de proteção gera interrupção); (3) a entrada da página é examinada (se ausente, <strong>falta de página</strong>); (4) o deslocamento é somado ao início da moldura; (5) faz-se a leitura ou escrita. Uma TLB de 16 entradas evita repetir isso a cada acesso. O Pentium também usa segmentação com paginação (tabelas LDT e GDT).</p>

<h2>6. Paginação x segmentação (Tanenbaum, Tab. 3.3)</h2>
<table>
  <tr><th>Consideração</th><th>Paginação</th><th>Segmentação</th></tr>
  <tr><td>O programador precisa saber que essa técnica está sendo usada?</td><td>Não</td><td>Sim</td></tr>
  <tr><td>Quantos espaços de endereçamento linear há?</td><td>1</td><td>Muitos</td></tr>
  <tr><td>O espaço total pode superar o tamanho da memória física?</td><td>Sim</td><td>Sim</td></tr>
  <tr><td>Rotinas e dados podem ser distinguidos e protegidos separadamente?</td><td>Não</td><td>Sim</td></tr>
  <tr><td>Tabelas de tamanho variável podem ser facilmente acomodadas?</td><td>Não</td><td>Sim</td></tr>
  <tr><td>O compartilhamento de rotinas entre usuários é facilitado?</td><td>Não</td><td>Sim</td></tr>
  <tr><td>Por que a técnica foi inventada?</td><td>Para obter um grande espaço de endereçamento linear sem comprar mais memória física</td><td>Para dividir programas e dados em espaços logicamente independentes, ajudando o compartilhamento e a proteção</td></tr>
</table>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>Página = tamanho <strong>fixo</strong>, invisível ao programador (divisão física). Segmento = tamanho <strong>variável</strong>, visível ao programador (divisão lógica).</li>
    <li>Paginação → fragmentação <strong>interna</strong>. Segmentação pura → fragmentação <strong>externa</strong> (checkerboarding).</li>
    <li>Ultrapaginação <strong>não</strong> se resolve com algoritmo de substituição melhor: é preciso <strong>reduzir o grau de multiprogramação</strong> (levar processos para o disco).</li>
    <li>Conjunto de trabalho e WSClock são algoritmos <strong>locais</strong>. O PFF decide <strong>quantas</strong> molduras um processo tem, não <strong>qual</strong> página sai.</li>
    <li>Na tabela de segmentos, o deslocamento deve ser <strong>menor</strong> que o limite; deslocamento igual ao limite já gera interrupção.</li>
  </ul>
</div>
`,
  resumo: 'Algoritmos locais escolhem a vítima entre as páginas do próprio processo (alocação fixa); globais, entre todas (alocação variável, geralmente melhor), com alocação igual, proporcional ou guiada pelo PFF. Ultrapaginação ocorre quando os conjuntos de trabalho não cabem na memória e se resolve com controle de carga. O tamanho de página equilibra fragmentação interna e tamanho da tabela (p = √(2se)). Código somente leitura pode ser compartilhado, com copiar-na-escrita para dados. A segmentação oferece vários espaços lógicos de tamanho variável, endereçados por (segmento, deslocamento); pura, sofre fragmentação externa; com paginação (MULTICS, Pentium) junta as vantagens das duas.',
  questoes: [
    {
      id: 'm08-a04-q1',
      enunciado: 'Tabela de segmentos: seg. 0 (base 1400, limite 1000), seg. 1 (6300, 400), seg. 2 (4300, 400), seg. 3 (3200, 1100), seg. 4 (4700, 1000). Qual o endereço físico de <strong>(3, 852)</strong>?',
      alternativas: [
        { texto: '4052.', correta: true, explicacao: 'Correto. <pre class="codigo"><code>seg. 3: base 3200, limite 1100\n852 &lt; 1100 -> válido\nfísico = 3200 + 852 = 4052</code></pre>' },
        { texto: '4152.', correta: false, explicacao: 'Conta errada: 3200 + 852 = 4052. Confira a soma com calma; na prova, um erro de conta derruba a questão inteira.' },
        { texto: '4300.', correta: false, explicacao: 'Somou o limite à base (3200 + 1100). O limite só serve para verificar se o deslocamento é válido; quem é somado à base é o deslocamento (852).' },
        { texto: 'Interrupção, pois 852 é maior que o limite do segmento 2.', correta: false, explicacao: 'O endereço é do segmento 3, cujo limite é 1100. Como 852 &lt; 1100, o acesso é válido.' },
      ],
    },
    {
      id: 'm08-a04-q2',
      enunciado: 'Com a mesma tabela de segmentos, o que acontece no acesso a <strong>(0, 1222)</strong> e a <strong>(1, 400)</strong>?',
      alternativas: [
        { texto: 'Os dois geram interrupção (erro de endereço): 1222 ≥ 1000 e 400 ≥ 400.', correta: true, explicacao: 'Correto. <pre class="codigo"><code>(0,1222): limite 1000 -> 1222 &lt; 1000? não -> interrupção\n(1, 400): limite  400 ->  400 &lt;  400? não -> interrupção</code></pre> Endereços válidos no segmento 1 vão de 0 a 399.' },
        { texto: '(0, 1222) vira 2622 e (1, 400) vira 6700.', correta: false, explicacao: 'As somas estariam certas, mas nenhum dos dois passa na verificação de limite, que é feita antes da soma. Os dois geram interrupção.' },
        { texto: '(0, 1222) gera interrupção e (1, 400) vira 6700.', correta: false, explicacao: '400 não é menor que o limite 400. Assim como nos registradores-base e limite, o deslocamento igual ao limite já está fora do segmento.' },
        { texto: 'Os dois geram falta de página.', correta: false, explicacao: 'Falta de página é a página válida que não está na memória. Aqui o deslocamento ultrapassa o tamanho do segmento: é erro de endereçamento (violação), tratado com interrupção ao SO.' },
      ],
    },
    {
      id: 'm08-a04-q3',
      enunciado: 'Qual é a diferença entre um algoritmo de substituição <strong>local</strong> e um <strong>global</strong>?',
      alternativas: [
        { texto: 'O local escolhe a vítima só entre as páginas do processo que teve a falta (alocação fixa); o global escolhe entre todas as páginas da memória (alocação variável).', correta: true, explicacao: 'Correto. No exemplo do livro, a falta de A leva o local a remover A5 (o menor valor de idade entre as páginas de A, ou seja, a página de A sem uso há mais tempo) e o global a remover B3 (o menor valor de idade de todas).' },
        { texto: 'O local roda na própria máquina; o global roda num servidor da rede.', correta: false, explicacao: 'Local e global se referem a qual conjunto de páginas é considerado na escolha da vítima, não a onde o algoritmo roda.' },
        { texto: 'O local é sempre melhor, porque um processo não prejudica os outros.', correta: false, explicacao: 'Segundo o Tanenbaum, os globais em geral funcionam melhor: com local, um processo cujo conjunto de trabalho cresce sofre ultrapaginação mesmo havendo molduras livres.' },
        { texto: 'O conjunto de trabalho e o WSClock são exemplos de algoritmos globais.', correta: false, explicacao: 'É o contrário: eles se referem ao conjunto de trabalho de um processo específico, então só fazem sentido como algoritmos locais.' },
      ],
    },
    {
      id: 'm08-a04-q4',
      enunciado: 'Um sistema apresenta CPU quase ociosa, disco o tempo todo ocupado com paginação e processos fazendo pouco progresso. Qual é o problema e a solução adequada?',
      alternativas: [
        { texto: 'Ultrapaginação (thrashing); reduzir o número de processos na memória, levando alguns para o disco (controle de carga).', correta: true, explicacao: 'Correto. Os conjuntos de trabalho somados não cabem na memória. Nenhum algoritmo de substituição resolve isso; é preciso diminuir a competição pela memória (escalonamento de dois níveis).' },
        { texto: 'Ultrapaginação; aumentar o número de processos para manter a CPU ocupada.', correta: false, explicacao: 'Mais processos significa ainda menos molduras por processo e ainda mais faltas: a situação piora.' },
        { texto: 'Fragmentação externa; fazer compactação da memória.', correta: false, explicacao: 'Com paginação não há fragmentação externa (molduras de tamanho fixo). O sintoma descrito é excesso de faltas de página.' },
        { texto: 'Anomalia de Belady; trocar o FIFO pelo LRU.', correta: false, explicacao: 'A anomalia de Belady é um efeito pontual do FIFO. O cenário descrito, de memória insuficiente para os conjuntos de trabalho, persiste com qualquer algoritmo.' },
      ],
    },
    {
      id: 'm08-a04-q5',
      enunciado: 'Usando a fórmula do Tanenbaum para o tamanho ótimo de página, p = √(2·s·e), qual o tamanho ótimo para processos de tamanho médio s = 256 KB e entradas de tabela de e = 8 bytes?',
      alternativas: [
        { texto: '2 KB.', correta: true, explicacao: 'Correto. <pre class="codigo"><code>s = 256 KB = 2^18 bytes, e = 8 = 2^3\n2·s·e = 2^1 · 2^18 · 2^3 = 2^22\np = raiz(2^22) = 2^11 = 2048 bytes = 2 KB</code></pre>' },
        { texto: '4 KB.', correta: false, explicacao: '4 KB é o resultado do exemplo do livro, com s = 1 MB. Com s = 256 KB (4 vezes menor), p cai pela raiz de 4: 4 KB / 2 = 2 KB.' },
        { texto: '1 KB.', correta: false, explicacao: 'Confira os expoentes: 2 · 2<sup>18</sup> · 2<sup>3</sup> = 2<sup>22</sup>, cuja raiz é 2<sup>11</sup> = 2048 bytes, e não 2<sup>10</sup>.' },
        { texto: '4 MB.', correta: false, explicacao: 'Esqueceu a raiz: 2<sup>22</sup> bytes = 4 MB é o valor de 2·s·e. O tamanho ótimo é a raiz disso, 2<sup>11</sup> = 2 KB.' },
      ],
    },
    {
      id: 'm08-a04-q6',
      enunciado: 'Com alocação global <strong>proporcional</strong>, há 60 molduras disponíveis para dois processos: A, com 100 páginas, e B, com 200 páginas. Quantas molduras cada um recebe?',
      alternativas: [
        { texto: 'A recebe 20 e B recebe 40.', correta: true, explicacao: 'Correto. <pre class="codigo"><code>total = 100 + 200 = 300 páginas\nA = 60 x 100/300 = 20\nB = 60 x 200/300 = 40</code></pre>' },
        { texto: 'A e B recebem 30 cada.', correta: false, explicacao: 'Isso é alocação igual. Na proporcional, o processo maior recebe mais molduras na proporção do seu tamanho.' },
        { texto: 'A recebe 40 e B recebe 20.', correta: false, explicacao: 'Invertido: B é o dobro de A e recebe o dobro de molduras.' },
        { texto: 'A recebe 100 e B recebe 200.', correta: false, explicacao: 'Só há 60 molduras. A alocação proporcional reparte as molduras existentes na proporção dos tamanhos; não dá a cada processo todas as suas páginas.' },
      ],
    },
    {
      id: 'm08-a04-q7',
      enunciado: 'Qual afirmação compara corretamente paginação e segmentação?',
      alternativas: [
        { texto: 'Na segmentação o programador enxerga vários espaços de endereçamento de tamanho variável, que podem ser protegidos e compartilhados separadamente; na paginação há um único espaço linear e a técnica é invisível ao programador.', correta: true, explicacao: 'Correto, conforme a Tab. 3.3 do Tanenbaum: a paginação foi inventada para ter um grande espaço linear sem comprar memória; a segmentação, para dividir programas e dados em espaços logicamente independentes, ajudando a proteção e o compartilhamento.' },
        { texto: 'Só a paginação permite que o espaço de endereçamento total supere a memória física.', correta: false, explicacao: 'Pela Tab. 3.3, as duas permitem que o espaço total supere a memória física.' },
        { texto: 'A paginação sofre fragmentação externa e a segmentação sofre fragmentação interna.', correta: false, explicacao: 'É o contrário: páginas de tamanho fixo geram fragmentação interna; segmentos de tamanho variável geram fragmentação externa (checkerboarding).' },
        { texto: 'Segmentação e paginação não podem ser combinadas.', correta: false, explicacao: 'O MULTICS e o Pentium combinam as duas: cada segmento é paginado, e só as páginas necessárias ficam na memória.' },
      ],
    },
    {
      id: 'm08-a04-q8',
      enunciado: 'Após um fork no UNIX, pai e filho compartilham as páginas de dados como SOMENTE LEITURA. O filho então escreve numa variável. O que acontece?',
      alternativas: [
        { texto: 'Ocorre uma interrupção por violação de proteção; o SO copia aquela página para o filho e marca as duas cópias como LEITURA-ESCRITA (copiar-na-escrita).', correta: true, explicacao: 'Correto. Só as páginas realmente modificadas são copiadas, o que economiza memória e tempo; as páginas que ninguém altera (incluindo todo o código) continuam compartilhadas.' },
        { texto: 'O filho é eliminado por tentar escrever em página somente leitura.', correta: false, explicacao: 'Aqui a proteção de somente leitura é um truque do SO: a interrupção é tratada fazendo a cópia, e a instrução continua normalmente.' },
        { texto: 'A escrita altera a página compartilhada e o pai também vê o novo valor.', correta: false, explicacao: 'Pai e filho devem ter memórias independentes após o fork. É justamente para evitar isso que a página é copiada no momento da escrita.' },
        { texto: 'O SO copia todas as páginas do pai para o filho nesse momento.', correta: false, explicacao: 'Copiar tudo é o que o copiar-na-escrita evita. Só a página escrita é copiada.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm08-a04-d1',
      enunciado: 'O que é ultrapaginação (thrashing), por que ocorre e como o SO pode controlá-la? Explique a diferença entre alocação local e global nesse contexto.',
      respostaModelo: `<p><strong>Ultrapaginação</strong> é a situação em que o sistema passa mais tempo trocando páginas entre memória e disco do que executando processos. Ocorre quando a soma dos <strong>conjuntos de trabalho</strong> dos processos (as páginas que cada um usa na fase atual) é maior que a memória disponível: cada processo gera faltas de página a cada poucas instruções, fica bloqueado esperando o disco e a CPU fica ociosa.</p>
<p>Com <strong>alocação local</strong>, cada processo tem um número fixo de molduras e a vítima sai do próprio processo; se seu conjunto de trabalho crescer, ele entra em ultrapaginação mesmo que outros tenham molduras sobrando. Com <strong>alocação global</strong>, a vítima pode ser de qualquer processo e o número de molduras varia, o que em geral funciona melhor; o SO pode usar o <strong>PFF</strong> (frequência de faltas de página) para dar mais molduras a quem tem muitas faltas e tirar de quem tem poucas.</p>
<p>Quando todos precisam de mais memória e ninguém pode ceder, o SO faz <strong>controle de carga</strong>: reduz o grau de multiprogramação levando alguns processos inteiros para o disco (swapping, escalonamento de médio prazo) e distribui suas molduras entre os demais, até a taxa de faltas ficar aceitável, sem deixar a CPU ociosa por falta de processos.</p>`,
      pontosChave: [
        'Definiu ultrapaginação: mais tempo paginando do que executando, CPU ociosa',
        'Causa: soma dos conjuntos de trabalho maior que a memória disponível',
        'Local: vítima do próprio processo, alocação fixa; global: vítima de qualquer processo, alocação variável (em geral melhor)',
        'Citou o PFF como forma de ajustar a alocação',
        'Solução: controle de carga, retirando processos da memória (swapping) para reduzir o grau de multiprogramação',
      ],
    },
  ],
});
