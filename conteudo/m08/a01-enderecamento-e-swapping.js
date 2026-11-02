// Módulo 8, aula 1: sem abstração, base/limite, swapping, memória livre e fragmentação.
SO1.registerLesson({
  id: 'm08-a01',
  titulo: 'Espaços de endereçamento e swapping',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §3.1 (p.106–108): sem abstração de memória, problema da realocação, realocação estática',
    'Tanenbaum, §3.2 (p.108–114): espaço de endereçamento, registradores-base e limite, troca de memória (swapping), compactação, mapa de bits, listas encadeadas, first/next/best/worst/quick fit',
    'Tanenbaum, §3.5.3 (p.135) e §3.7.1 (p.147): fragmentação interna e fragmentação externa (checkerboarding)',
    'Conhecimento consolidado (Silberschatz; Machado & Maia): fragmentação interna x externa',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: um estacionamento sem vagas marcadas.</strong> Os carros (processos) chegam com tamanhos diferentes e param onde houver espaço. Quando alguns vão embora, sobram buracos espalhados: cabem motos, mas não um ônibus, mesmo que a soma dos buracos seja enorme. O manobrista (o SO) precisa saber onde estão os buracos, escolher em qual buraco cada carro para e, às vezes, tirar um carro do pátio para abrir espaço (levá-lo para outro estacionamento, o disco).</p>
  <p>Gerenciar memória é isso: <strong>saber o que está livre, decidir onde cada processo fica e proteger um processo do outro</strong>.</p>
</div>

<h2>A hierarquia de memória e o gerenciador de memória</h2>
<p>Todo programador quer uma memória <strong>grande, rápida e não volátil</strong>, e barata. Como isso não existe, o computador usa uma <strong>hierarquia de memória</strong>: poucos megabytes de cache (muito rápida e cara), alguns gigabytes de memória principal (RAM, velocidade e preço médios) e muito espaço em disco (lento, barato e não volátil). A parte do SO que administra essa hierarquia é o <strong>gerenciador de memória</strong>: controla quais partes da memória estão em uso, aloca memória aos processos quando precisam e a libera quando terminam.</p>

<h2>1. Sem abstração de memória</h2>
<p>Nos primeiros computadores (e ainda hoje em muitos sistemas embarcados), o programa enxergava <strong>a memória física diretamente</strong>: a instrução <code>MOV REGISTER1,1000</code> mexia no endereço físico 1000. Consequências:</p>
<ul>
  <li>Só dá para ter <strong>um programa por vez</strong> na memória (junto com o SO). Se um programa escrever no endereço errado, destrói o outro ou o próprio SO.</li>
  <li>Para rodar vários programas, o SO pode salvar a memória inteira em disco e trazer o próximo (é a ideia da <strong>troca</strong>, vista adiante).</li>
  <li>Se carregarmos dois programas lado a lado, surge o <strong>problema da realocação</strong>: os dois foram escritos achando que começam no endereço 0. O segundo programa, carregado no endereço 16384, executa <code>JMP 28</code> e salta para dentro do <em>primeiro</em> programa.</li>
</ul>
<p>O IBM 360 contornava isso com <strong>chaves de proteção</strong> (blocos de 2 KB com uma chave de 4 bits; o processo só acessa blocos com a sua chave) e com <strong>realocação estática</strong>: ao carregar o programa no endereço 16384, o carregador somava 16384 a todos os endereços do programa. Funciona, mas deixa a carga lenta e o carregador precisa saber o que é endereço e o que é constante (em <code>MOV REGISTER1,28</code>, o 28 não pode ser alterado).</p>

<h2>2. Espaço de endereçamento e registradores-base e limite</h2>
<p>A solução melhor é criar uma abstração: o <strong>espaço de endereçamento</strong>, o <strong>conjunto de endereços que um processo pode usar</strong> para endereçar a memória. Cada processo tem o seu, independente dos outros. Assim como o processo é uma "CPU abstrata", o espaço de endereçamento é uma "memória abstrata". Isso resolve dois problemas de uma vez: <strong>proteção</strong> e <strong>realocação</strong>.</p>
<p>A forma mais simples é a <strong>realocação dinâmica</strong> com dois registradores de hardware em cada CPU:</p>
<ul>
  <li><strong>Registrador-base</strong>: recebe o endereço físico onde o programa começa.</li>
  <li><strong>Registrador-limite</strong>: recebe o tamanho do programa.</li>
</ul>
<p>A cada acesso à memória, o hardware faz duas coisas: <strong>verifica</strong> se o endereço é menor que o limite (se for igual ou maior, gera um erro e o acesso é abortado) e <strong>soma</strong> o valor-base ao endereço antes de mandá-lo à memória. Só o SO pode alterar esses registradores. A desvantagem: <strong>uma adição e uma comparação a cada acesso</strong>.</p>

<figure class="diagrama">
  <svg viewBox="0 0 520 250" style="max-width:620px" role="img" aria-label="Registradores-base e limite: o endereço do programa é comparado com o limite e somado à base">
    <g font-size="13" fill="currentColor" text-anchor="middle">
      <rect x="10" y="95" width="110" height="50" rx="8" fill="none" stroke="currentColor"/>
      <text x="65" y="115">Endereço do</text>
      <text x="65" y="133">programa: 28</text>
      <rect x="160" y="20" width="120" height="40" rx="6" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
      <text x="220" y="45">Limite = 16384</text>
      <polygon points="220,90 270,120 220,150 170,120" style="fill:var(--lateral)" stroke="currentColor"/>
      <text x="220" y="118" font-size="12">28 &lt;</text>
      <text x="220" y="133" font-size="12">limite?</text>
      <rect x="300" y="20" width="110" height="40" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="355" y="45">Base = 16384</text>
      <circle cx="355" cy="120" r="22" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="355" y="126" font-size="20">+</text>
      <rect x="410" y="95" width="100" height="50" rx="8" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <text x="460" y="115">Endereço</text>
      <text x="460" y="133">físico 16412</text>
      <rect x="160" y="190" width="120" height="40" rx="6" style="fill:var(--vermelho-claro);stroke:var(--vermelho)"/>
      <text x="220" y="210" font-size="12">Não: erro, acesso</text>
      <text x="220" y="225" font-size="12">abortado</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M120 120 H168"/><path d="M220 60 V88"/><path d="M272 120 H331"/><path d="M355 60 V96"/><path d="M377 120 H408"/><path d="M220 150 V188"/>
    </g>
    <g font-size="12" fill="currentColor">
      <text x="285" y="112">sim</text>
      <text x="228" y="172">não</text>
    </g>
  </svg>
  <figcaption>Realocação dinâmica: o processo carregado em 16384 executa <code>JMP 28</code>; o hardware confere 28 &lt; 16384 e envia 16384 + 28 = 16412 à memória (Tanenbaum, Fig. 3.3).</figcaption>
</figure>

<h2>3. Troca de processos (swapping)</h2>
<p>Normalmente a soma de memória de todos os processos é maior que a RAM. Há duas estratégias:</p>
<ul>
  <li><strong>Troca de processos (swapping)</strong>: trazer o processo <strong>inteiro</strong> para a memória, executá-lo por um tempo e devolvê-lo ao disco. Processos ociosos ficam no disco, sem ocupar RAM.</li>
  <li><strong>Memória virtual</strong>: o processo roda mesmo estando <strong>apenas parcialmente</strong> na memória (próxima aula).</li>
</ul>
<p>Na troca, um processo que volta do disco pode cair em <strong>outra posição</strong> da memória, por isso os endereços precisam ser realocados (os registradores-base e limite resolvem). Com as entradas e saídas, a memória fica cheia de <strong>lacunas</strong> (buracos livres). Juntar todos os processos para baixo, formando um único espaço livre grande, chama-se <strong>compactação de memória</strong>; ela quase não é usada, porque gasta muito tempo de CPU (o livro estima cerca de 5 s para compactar 1 GB).</p>
<p>Outro detalhe: se os processos podem <strong>crescer</strong> (o heap cresce para cima e a pilha cresce para baixo), é boa ideia reservar uma <strong>área extra para expansão</strong> ao alocar o processo. Se o processo não puder crescer e não houver espaço, ele precisa ser movido, ir para o disco ou terminar.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: a memória ao longo do tempo com swapping</strong> (Tanenbaum, Fig. 3.4).</p>
  <table>
    <tr><th>Momento</th><th>O que acontece</th><th>Memória (de baixo para cima)</th></tr>
    <tr><td>a</td><td>Só A está na memória.</td><td>SO, A, livre</td></tr>
    <tr><td>b, c</td><td>B e depois C são trazidos do disco.</td><td>SO, A, B, C, livre</td></tr>
    <tr><td>d</td><td>A é devolvido ao disco.</td><td>SO, <em>lacuna</em>, B, C, livre</td></tr>
    <tr><td>e</td><td>D entra na lacuna deixada por A (é menor que A, sobra um pedaço livre).</td><td>SO, D, <em>lacuna</em>, B, C, livre</td></tr>
    <tr><td>f</td><td>B sai.</td><td>SO, D, <em>lacuna maior</em>, C, livre</td></tr>
    <tr><td>g</td><td>A volta para a lacuna entre D e C, ocupando-a toda, mas agora em <strong>outro endereço</strong>: precisa ser realocado.</td><td>SO, D, A, C, livre</td></tr>
  </table>
</div>

<h2>4. Gerenciando a memória livre</h2>
<p>Com alocação dinâmica, o SO precisa saber o que está livre. Há dois métodos:</p>
<h3>Mapa de bits</h3>
<p>A memória é dividida em <strong>unidades de alocação</strong> (de poucas palavras a vários KB). Cada unidade corresponde a <strong>1 bit</strong>: 0 se livre e 1 se ocupada (ou o contrário).</p>
<ul>
  <li>Unidade pequena → mapa grande. Unidade grande → mapa pequeno, mas desperdiça memória na última unidade do processo.</li>
  <li>O tamanho do mapa só depende do tamanho da memória e da unidade: é simples.</li>
  <li>Problema: para carregar um processo de <em>k</em> unidades, o SO precisa <strong>procurar k bits 0 consecutivos</strong> no mapa, uma busca lenta.</li>
</ul>
<h3>Listas encadeadas</h3>
<p>Uma lista de <strong>segmentos</strong>: cada nó indica se é um processo (<strong>P</strong>) ou uma lacuna (<strong>L</strong>), onde começa, o tamanho e um ponteiro para o próximo. Ordenada por endereço, facilita juntar lacunas vizinhas quando um processo termina (4 combinações de vizinhos; uma lista duplamente encadeada ajuda). Com a lista, o SO escolhe <strong>em qual lacuna</strong> colocar um processo:</p>
<table>
  <tr><th>Algoritmo</th><th>Como escolhe a lacuna</th><th>Característica</th></tr>
  <tr><td><strong>First fit</strong> (primeiro encaixe)</td><td>A primeira lacuna, desde o início da lista, grande o bastante.</td><td>Rápido: procura o mínimo possível.</td></tr>
  <tr><td><strong>Next fit</strong> (próximo encaixe)</td><td>Igual ao first fit, mas recomeça a busca de onde parou da última vez.</td><td>Simulações (Bays, 1977): um pouco <em>pior</em> que o first fit.</td></tr>
  <tr><td><strong>Best fit</strong> (melhor encaixe)</td><td>Percorre a lista inteira e pega a <strong>menor</strong> lacuna que serve.</td><td>Mais lento e, surpreendentemente, desperdiça mais memória: deixa lacunas minúsculas e inúteis.</td></tr>
  <tr><td><strong>Worst fit</strong> (pior encaixe)</td><td>Pega a <strong>maior</strong> lacuna, para que a sobra ainda seja útil.</td><td>Simulações mostram que também não é boa ideia.</td></tr>
  <tr><td><strong>Quick fit</strong> (encaixe mais rápido)</td><td>Mantém listas separadas para os tamanhos mais pedidos (4 KB, 8 KB, 12 KB...).</td><td>Busca muito rápida, mas juntar lacunas vizinhas ao liberar é caro.</td></tr>
</table>

<figure class="diagrama">
  <svg viewBox="0 0 560 230" style="max-width:640px" role="img" aria-label="Lacunas de 10, 4, 20, 18, 7, 9, 12 e 15 KB e onde cada algoritmo coloca um pedido de 12 KB">
    <g font-size="12" fill="currentColor" text-anchor="middle">
      <text x="280" y="18" font-weight="bold">Lacunas livres em ordem de endereço; pedido de 12 KB</text>
      <rect x="10" y="40" width="50" height="40" fill="none" stroke="currentColor"/><text x="35" y="65">10</text>
      <rect x="70" y="40" width="30" height="40" fill="none" stroke="currentColor"/><text x="85" y="65">4</text>
      <rect x="110" y="40" width="90" height="40" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/><text x="155" y="65">20</text>
      <rect x="210" y="40" width="82" height="40" fill="none" stroke="currentColor"/><text x="251" y="65">18</text>
      <rect x="302" y="40" width="40" height="40" fill="none" stroke="currentColor"/><text x="322" y="65">7</text>
      <rect x="352" y="40" width="46" height="40" fill="none" stroke="currentColor"/><text x="375" y="65">9</text>
      <rect x="408" y="40" width="60" height="40" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/><text x="438" y="65">12</text>
      <rect x="478" y="40" width="72" height="40" fill="none" stroke="currentColor"/><text x="514" y="65">15</text>
    </g>
    <g font-size="12" fill="currentColor">
      <path d="M155 82 V120" fill="none" style="stroke:var(--azul)" stroke-width="1.5"/>
      <text x="100" y="140" style="fill:var(--azul)" font-weight="bold">First fit e worst fit: 20 KB</text>
      <text x="100" y="156">(primeira que serve; e também a maior)</text>
      <path d="M438 82 V170" fill="none" style="stroke:var(--verde)" stroke-width="1.5"/>
      <text x="548" y="190" text-anchor="end" style="fill:var(--verde)" font-weight="bold">Best fit: 12 KB (encaixe exato)</text>
      <text x="548" y="206" text-anchor="end">(menor lacuna que serve; percorre a lista toda)</text>
    </g>
  </svg>
  <figcaption>O mesmo pedido de 12 KB cai em lacunas diferentes conforme o algoritmo. O next fit, no primeiro pedido, se comporta como o first fit (20 KB).</figcaption>
</figure>

<h2>5. Fragmentação interna x externa</h2>
<table>
  <tr><th>Tipo</th><th>O que é</th><th>Onde aparece</th></tr>
  <tr><td><strong>Fragmentação externa</strong></td><td>Memória livre <strong>fora</strong> dos processos, picada em lacunas pequenas e não contíguas: a soma é grande, mas nenhuma lacuna sozinha cabe o processo.</td><td>Alocação de tamanho variável: swapping com partições variáveis e segmentação pura (o Tanenbaum chama de <em>checkerboarding</em>). Remédio: compactação.</td></tr>
  <tr><td><strong>Fragmentação interna</strong></td><td>Memória desperdiçada <strong>dentro</strong> da área entregue ao processo: ele recebeu mais do que precisava porque a alocação é feita em unidades de tamanho fixo.</td><td>Unidades de alocação do mapa de bits, partições fixas e <strong>paginação</strong> (a última página fica, em média, meio vazia).</td></tr>
</table>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>O <strong>registrador-limite</strong> guarda o <strong>tamanho</strong> do programa (no Tanenbaum), não o último endereço físico. O endereço é comparado com o limite <em>antes</em> de somar a base; endereço igual ao limite já é inválido.</li>
    <li><strong>Swapping</strong> move o processo <strong>inteiro</strong>; a <strong>memória virtual</strong> permite rodar com só uma parte na memória. Não confunda.</li>
    <li><strong>Best fit não é o melhor</strong>: é mais lento que o first fit e deixa lacunas minúsculas. O next fit também é um pouco pior que o first fit.</li>
    <li>Interna = desperdício <strong>dentro</strong> do que foi alocado (tamanho fixo). Externa = desperdício <strong>entre</strong> alocações (tamanho variável). Compactação resolve só a externa.</li>
  </ul>
</div>
`,
  resumo: 'Sem abstração, o programa usa endereços físicos e surgem os problemas de proteção e realocação. O espaço de endereçamento resolve os dois; a forma simples é a realocação dinâmica com registradores-base (início) e limite (tamanho). Quando a memória não basta, o swapping troca processos inteiros entre memória e disco, deixando lacunas (que a compactação junta). A memória livre é controlada por mapa de bits ou listas encadeadas, com os algoritmos first, next, best, worst e quick fit. Fragmentação externa são lacunas entre alocações; interna é sobra dentro da unidade alocada.',
  questoes: [
    {
      id: 'm08-a01-q1',
      enunciado: 'Um processo foi carregado com registrador-base = 40000 e registrador-limite = 12000. Ele acessa os endereços 5000 e 12000. O que acontece?',
      alternativas: [
        { texto: '5000 vira o endereço físico 45000; 12000 gera erro, pois não é menor que o limite.', correta: true, explicacao: 'Correto. Passo 1: 5000 &lt; 12000, válido; físico = 40000 + 5000 = 45000. Passo 2: 12000 &lt; 12000 é falso (o limite é o tamanho, endereços válidos vão de 0 a 11999), então o hardware gera um erro e aborta o acesso.' },
        { texto: '5000 vira 45000; 12000 vira 52000.', correta: false, explicacao: 'A soma está certa para 5000, mas 12000 não passa na comparação: o hardware só soma a base se o endereço for menor que o limite. 12000 é igual ao limite, então é inválido.' },
        { texto: '5000 gera erro, pois é menor que a base 40000.', correta: false, explicacao: 'O endereço do programa é relativo ao próprio espaço de endereçamento, que começa em 0. Ele é comparado com o limite (tamanho), e não com a base. 5000 é válido.' },
        { texto: '5000 vira 35000 (base menos endereço); 12000 vira 28000.', correta: false, explicacao: 'O hardware soma a base ao endereço, nunca subtrai. E 12000 nem chega a ser traduzido: falha na comparação com o limite.' },
      ],
    },
    {
      id: 'm08-a01-q2',
      enunciado: 'A memória tem lacunas livres, em ordem de endereço, de 10, 4, 20, 18, 7, 9, 12 e 15 KB. Chegam, nesta ordem, pedidos de 12, 10 e 9 KB. Usando <strong>first fit</strong>, quais lacunas são escolhidas?',
      alternativas: [
        { texto: '20 KB, 10 KB e 18 KB.', correta: true, explicacao: 'Correto. Sempre do início da lista: <pre class="codigo"><code>12 KB: 10 não, 4 não, 20 sim -> sobra 8\nLista: 10 4 8 18 7 9 12 15\n10 KB: 10 sim -> sobra 0\nLista: 0 4 8 18 7 9 12 15\n 9 KB: 0,4,8 não, 18 sim -> sobra 9</code></pre>' },
        { texto: '12 KB, 10 KB e 9 KB.', correta: false, explicacao: 'Esse é o resultado do best fit, que percorre a lista inteira e escolhe a menor lacuna que serve (aqui, encaixes exatos). O first fit para na primeira que serve.' },
        { texto: '20 KB, 18 KB e 15 KB.', correta: false, explicacao: 'Esse é o worst fit: sempre a maior lacuna disponível (20, depois 18, depois 15, já que 20 e 18 viraram 8).' },
        { texto: '20 KB, 18 KB e 9 KB.', correta: false, explicacao: 'Esse é o next fit: depois de usar o 20, ele continua dali (8 não serve, 18 serve) e depois continua do 18 (sobra 8, 7 não servem, 9 serve). O first fit sempre volta ao início e encontra o 10 KB para o segundo pedido.' },
      ],
    },
    {
      id: 'm08-a01-q3',
      enunciado: 'Com as mesmas lacunas (10, 4, 20, 18, 7, 9, 12 e 15 KB) e os pedidos de 12, 10 e 9 KB, qual o resultado do <strong>next fit</strong>?',
      alternativas: [
        { texto: '20 KB, 18 KB e 9 KB.', correta: true, explicacao: 'Correto. O next fit lembra onde parou: <pre class="codigo"><code>12 KB: 10,4 não; 20 sim (para aqui) -> sobra 8\n10 KB: a partir do 20: 8 não; 18 sim -> sobra 8\n 9 KB: a partir do 18: 8 não; 7 não; 9 sim</code></pre>' },
        { texto: '20 KB, 10 KB e 18 KB.', correta: false, explicacao: 'Esse é o first fit, que volta ao início da lista a cada pedido e por isso pega o 10 KB no segundo pedido.' },
        { texto: '12 KB, 10 KB e 9 KB.', correta: false, explicacao: 'Esse é o best fit. O next fit não procura o menor encaixe, só continua a busca de onde parou.' },
        { texto: '20 KB, 18 KB e 15 KB.', correta: false, explicacao: 'Esse é o worst fit. No terceiro pedido, o next fit, vindo do 18, encontra o 9 KB antes do 15 KB.' },
      ],
    },
    {
      id: 'm08-a01-q4',
      enunciado: 'Sobre os algoritmos de alocação com lista de lacunas, é correto afirmar:',
      alternativas: [
        { texto: 'O best fit, além de mais lento que o first fit, tende a desperdiçar mais memória, pois deixa lacunas minúsculas e inúteis.', correta: true, explicacao: 'Correto. É o resultado "surpreendente" citado pelo Tanenbaum: ao escolher a lacuna mais justa, a sobra é quase sempre pequena demais para qualquer processo.' },
        { texto: 'O next fit tem desempenho bem melhor que o first fit, segundo as simulações.', correta: false, explicacao: 'As simulações de Bays (1977) mostraram o contrário: o next fit é ligeiramente pior que o first fit.' },
        { texto: 'O worst fit é a melhor escolha, porque a sobra da maior lacuna sempre será útil.', correta: false, explicacao: 'Essa era a ideia do worst fit, mas as simulações mostraram que ele também não é uma boa ideia.' },
        { texto: 'O quick fit é rápido para alocar e também para liberar, pois juntar lacunas vizinhas é trivial.', correta: false, explicacao: 'O quick fit acha lacunas muito rápido, mas ao liberar é caro descobrir os vizinhos para juntá-los, porque as lacunas ficam em listas separadas por tamanho.' },
      ],
    },
    {
      id: 'm08-a01-q5',
      enunciado: 'Uma memória de 64 MB é gerenciada por mapa de bits com unidade de alocação de 4 KB. Qual o tamanho do mapa de bits?',
      alternativas: [
        { texto: '2 KB.', correta: true, explicacao: 'Correto. Número de unidades = 64 MB / 4 KB = 2<sup>26</sup> / 2<sup>12</sup> = 2<sup>14</sup> = 16384 unidades → 16384 bits (1 bit por unidade) → 16384 / 8 = 2048 bytes = 2 KB.' },
        { texto: '16 KB.', correta: false, explicacao: '16384 é o número de bits (e de unidades), não de bytes. Dividindo por 8 bits por byte, o mapa tem 2048 bytes = 2 KB.' },
        { texto: '16 MB.', correta: false, explicacao: 'O mapa usa 1 bit por unidade de 4 KB, então é minúsculo perto da memória. 16 MB seria um quarto da memória inteira.' },
        { texto: 'Depende de quantos processos estão carregados.', correta: false, explicacao: 'Uma vantagem do mapa de bits é que seu tamanho depende só do tamanho da memória e da unidade de alocação, e não do número de processos (isso vale para a lista encadeada).' },
      ],
    },
    {
      id: 'm08-a01-q6',
      enunciado: 'Depois de várias trocas de processos, há 30 KB livres na memória, mas em 5 lacunas de 6 KB, e um processo de 10 KB não consegue ser carregado. Qual é o problema e qual técnica o resolve?',
      alternativas: [
        { texto: 'Fragmentação externa; compactação de memória.', correta: true, explicacao: 'Correto. A memória livre está fora dos processos, espalhada em lacunas não contíguas. A compactação move os processos para baixo e junta as lacunas num único bloco, ao custo de muito tempo de CPU.' },
        { texto: 'Fragmentação interna; compactação de memória.', correta: false, explicacao: 'Interna é a sobra dentro da área entregue a um processo. Aqui as sobras estão entre os processos, então é externa.' },
        { texto: 'Fragmentação externa; aumentar a unidade de alocação.', correta: false, explicacao: 'Aumentar a unidade de alocação não junta lacunas separadas e ainda aumenta a fragmentação interna.' },
        { texto: 'Falta de página; trazer a página do disco.', correta: false, explicacao: 'Falta de página é um evento da memória virtual (próxima aula). No swapping, o processo inteiro precisa caber numa área contígua.' },
      ],
    },
    {
      id: 'm08-a01-q7',
      enunciado: 'Qual é a diferença entre troca de processos (swapping) e memória virtual?',
      alternativas: [
        { texto: 'No swapping o processo é trazido inteiro para a memória; na memória virtual ele pode executar estando só parcialmente na memória.', correta: true, explicacao: 'Correto. É exatamente a distinção do Tanenbaum (§3.2.2): swapping traz e devolve o processo em sua totalidade; a memória virtual permite executar com apenas parte dele na RAM.' },
        { texto: 'O swapping usa o disco e a memória virtual não usa.', correta: false, explicacao: 'As duas usam o disco. Na memória virtual, as páginas ausentes ficam no disco e são trazidas quando referenciadas.' },
        { texto: 'São a mesma coisa com nomes diferentes.', correta: false, explicacao: 'São estratégias diferentes para lidar com a falta de memória: uma move processos inteiros, a outra move pedaços (páginas).' },
        { texto: 'A memória virtual exige compactação frequente; o swapping não.', correta: false, explicacao: 'É o contrário: as lacunas do swapping é que podem pedir compactação. A paginação usa blocos de tamanho fixo e não sofre fragmentação externa.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm08-a01-d1',
      enunciado: 'Explique como os registradores-base e limite resolvem os problemas de proteção e realocação. Em seguida, explique o que é fragmentação externa no swapping e compare first fit e best fit.',
      respostaModelo: `<p>Sem abstração, todos os programas usam endereços físicos: um pode destruir o outro (proteção) e um programa carregado fora do endereço 0 salta para lugares errados (realocação). Com <strong>realocação dinâmica</strong>, cada processo tem seu próprio <strong>espaço de endereçamento</strong> começando em 0. O <strong>registrador-base</strong> recebe o endereço físico de início do processo e o <strong>registrador-limite</strong> recebe seu tamanho. A cada acesso, o hardware <strong>compara</strong> o endereço com o limite (se for igual ou maior, gera erro: proteção) e <strong>soma</strong> a base (realocação). Só o SO altera esses registradores; o custo é uma soma e uma comparação por acesso.</p>
<p>No <strong>swapping</strong>, processos inteiros entram e saem da memória e deixam <strong>lacunas</strong> de tamanhos variados entre si. A <strong>fragmentação externa</strong> ocorre quando a soma das lacunas seria suficiente para um processo, mas nenhuma lacuna isolada é grande o bastante. A compactação resolve, mas é cara.</p>
<p>O <strong>first fit</strong> usa a primeira lacuna que serve, a partir do início da lista: é rápido. O <strong>best fit</strong> percorre a lista toda e escolhe a menor lacuna que serve: é mais lento e, na prática, desperdiça mais memória, pois deixa lacunas minúsculas e inúteis.</p>`,
      pontosChave: [
        'Base = início físico do processo, limite = tamanho; o hardware compara com o limite e soma a base a cada acesso',
        'Relacionou a comparação à proteção e a soma à realocação',
        'Definiu fragmentação externa como lacunas livres não contíguas entre processos, que somadas bastariam mas isoladas não',
        'Citou a compactação como solução (e que é cara)',
        'First fit: primeira lacuna que serve, rápido; best fit: menor lacuna que serve, mais lento e deixa lacunas pequenas',
      ],
    },
  ],
});
