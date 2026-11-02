// Módulo 8, aula 2: memória virtual, paginação, MMU, tabela de páginas, TLB, multinível, invertida, falta de página.
SO1.registerLesson({
  id: 'm08-a02',
  titulo: 'Memória virtual e paginação',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §3.3 (p.114–122): sobreposições (overlays), memória virtual, paginação, MMU (Fig. 3.8–3.10), tabela de páginas (Fig. 3.11), TLB (Tab. 3.1), ausência leve e completa, tabelas multinível (Fig. 3.12) e invertidas (Fig. 3.13)',
    'Tanenbaum, §3.6.2 (p.140–141): tratamento de falta de página',
    'Silberschatz, Fundamentos de SO, cap. Memória principal (paginação, TLB): tempo efetivo de acesso com taxa de acerto da TLB',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: um livro enorme e uma mesa pequena.</strong> Você estuda um livro de 1.000 páginas, mas na mesa cabem só 8 folhas. Você mantém na mesa só as folhas que está usando e um <strong>índice</strong> anotando "folha 5 do livro está na posição 3 da mesa". Se precisar de uma folha que não está na mesa, você para, vai até a estante, traz a folha e, se a mesa estiver cheia, devolve uma folha pouco usada. Para quem lê, parece que o livro inteiro está ali.</p>
  <p>Na memória virtual, o livro é o <strong>espaço de endereçamento virtual</strong> do processo, a mesa é a <strong>RAM</strong>, a estante é o <strong>disco</strong> e o índice é a <strong>tabela de páginas</strong>.</p>
</div>

<h2>Por que memória virtual</h2>
<p>Os programas cresceram mais rápido que as memórias. Nos anos 1960, a saída eram as <strong>sobreposições (overlays)</strong>: o <em>programador</em> dividia o programa em módulos, e um gerenciador de sobreposições os trazia e levava do disco. Era trabalhoso e sujeito a erros. A <strong>memória virtual</strong> (Fotheringham, 1961) passou essa tarefa ao computador:</p>
<ul>
  <li>Cada programa tem seu próprio <strong>espaço de endereçamento</strong>, dividido em blocos chamados <strong>páginas</strong>.</li>
  <li>As páginas são mapeadas na memória física, mas <strong>nem todas precisam estar na memória</strong> para o programa executar.</li>
  <li>Se o programa referencia uma parte que não está na memória, o SO é avisado, busca a parte que falta e reexecuta a instrução.</li>
</ul>
<p>Assim, um programa pode ser <strong>maior que a memória física</strong>. E enquanto um processo espera uma página vir do disco, a CPU vai para outro processo (combina bem com multiprogramação).</p>

<h2>Paginação: páginas, molduras e a MMU</h2>
<p>Os endereços gerados pelo programa são <strong>endereços virtuais</strong> e formam o <strong>espaço de endereçamento virtual</strong>. Eles não vão direto para o barramento: passam pela <strong>MMU</strong> (<em>memory management unit</em>, unidade de gerenciamento de memória), hardware normalmente dentro do chip da CPU, que os <strong>mapeia em endereços físicos</strong>.</p>
<ul>
  <li>O espaço virtual é dividido em <strong>páginas</strong>; a memória física, em <strong>molduras de página</strong> (<em>page frames</em>, também chamadas quadros). Páginas e molduras têm <strong>o mesmo tamanho</strong> (no exemplo do livro, 4 KB).</li>
  <li>As transferências entre memória e disco são sempre de <strong>páginas inteiras</strong>.</li>
  <li>O tamanho da página é uma <strong>potência de 2</strong>, para o endereço virtual se dividir em duas partes sem conta nenhuma: <strong>número da página</strong> (bits mais altos) e <strong>deslocamento</strong> (bits mais baixos).</li>
</ul>
<p>Exemplo do Tanenbaum: endereços virtuais de <strong>16 bits</strong> (0 a 64 KB − 1), memória física de <strong>32 KB</strong> e páginas de <strong>4 KB</strong>. São <strong>16 páginas virtuais</strong> (4 bits de página + 12 bits de deslocamento, pois 4 KB = 2<sup>12</sup>) e só <strong>8 molduras</strong> (endereço físico de 15 bits). A tabela de páginas do exemplo (Fig. 3.9) é:</p>
<table>
  <tr><td><strong>Página virtual</strong></td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12–15</td></tr>
  <tr><td><strong>Moldura</strong></td><td>2</td><td>1</td><td>6</td><td>0</td><td>4</td><td>3</td><td>X</td><td>X</td><td>X</td><td>5</td><td>X</td><td>7</td><td>X</td></tr>
</table>
<p>"X" significa <strong>não mapeada</strong>: o bit <strong>presente/ausente</strong> está em 0 e a página está só no disco.</p>

<figure class="diagrama">
  <svg viewBox="0 0 560 330" style="max-width:640px" role="img" aria-label="Tradução do endereço virtual 8196 no endereço físico 24580: página 2, deslocamento 4, tabela de páginas aponta moldura 6">
    <g font-size="13" fill="currentColor" text-anchor="middle">
      <text x="140" y="18" font-weight="bold">Endereço virtual 8196 (16 bits)</text>
      <rect x="40" y="28" width="70" height="36" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="75" y="44" font-family="monospace">0010</text>
      <text x="75" y="58" font-size="11">página 2</text>
      <rect x="110" y="28" width="150" height="36" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/>
      <text x="185" y="44" font-family="monospace">000000000100</text>
      <text x="185" y="58" font-size="11">deslocamento 4 (12 bits)</text>

      <text x="75" y="100" font-weight="bold" font-size="12">Tabela de páginas</text>
      <text x="40" y="118" font-size="11">pág.</text><text x="88" y="118" font-size="11">moldura</text><text x="130" y="118" font-size="11">P/A</text>
      <rect x="55" y="124" width="60" height="22" fill="none" stroke="currentColor"/><text x="40" y="140" font-size="12">0</text><text x="85" y="140" font-size="12">2</text><rect x="115" y="124" width="28" height="22" fill="none" stroke="currentColor"/><text x="129" y="140" font-size="12">1</text>
      <rect x="55" y="146" width="60" height="22" fill="none" stroke="currentColor"/><text x="40" y="162" font-size="12">1</text><text x="85" y="162" font-size="12">1</text><rect x="115" y="146" width="28" height="22" fill="none" stroke="currentColor"/><text x="129" y="162" font-size="12">1</text>
      <rect x="55" y="168" width="60" height="22" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/><text x="40" y="184" font-size="12" font-weight="bold">2</text><text x="85" y="184" font-size="12" font-weight="bold">6</text><rect x="115" y="168" width="28" height="22" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/><text x="129" y="184" font-size="12">1</text>
      <rect x="55" y="190" width="60" height="22" fill="none" stroke="currentColor"/><text x="40" y="206" font-size="12">3</text><text x="85" y="206" font-size="12">0</text><rect x="115" y="190" width="28" height="22" fill="none" stroke="currentColor"/><text x="129" y="206" font-size="12">1</text>
      <text x="85" y="226" font-size="12">⋮</text>
      <rect x="55" y="234" width="60" height="22" style="fill:var(--vermelho-claro);stroke:var(--vermelho)"/><text x="40" y="250" font-size="12">8</text><text x="85" y="250" font-size="12">—</text><rect x="115" y="234" width="28" height="22" style="fill:var(--vermelho-claro);stroke:var(--vermelho)"/><text x="129" y="250" font-size="12">0</text>
      <text x="100" y="276" font-size="11" style="fill:var(--vermelho)">P/A = 0: falta de página</text>

      <text x="400" y="200" font-weight="bold">Endereço físico 24580 (15 bits)</text>
      <rect x="300" y="210" width="60" height="36" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="330" y="226" font-family="monospace">110</text>
      <text x="330" y="240" font-size="11">moldura 6</text>
      <rect x="360" y="210" width="150" height="36" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/>
      <text x="435" y="226" font-family="monospace">000000000100</text>
      <text x="435" y="240" font-size="11">deslocamento 4</text>
      <text x="400" y="275" font-size="12">6 × 4096 + 4 = 24580</text>
    </g>
    <g fill="none" stroke-width="1.8">
      <path d="M75 64 V82 H16 V179 H30" style="stroke:var(--azul)"/>
      <path d="M143 179 H330 V207" style="stroke:var(--azul)"/>
      <path d="M260 46 H435 V207" style="stroke:var(--verde)" stroke-dasharray="5 4"/>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="200" y="172">número da moldura</text>
      <text x="445" y="120">deslocamento copiado</text>
      <text x="445" y="134">sem alteração</text>
    </g>
    <text x="280" y="315" font-size="12" text-anchor="middle" fill="currentColor">A MMU troca o número da página pelo número da moldura e mantém o deslocamento.</text>
  </svg>
  <figcaption>Tradução de endereço pela MMU (Tanenbaum, Fig. 3.10): os 4 bits altos de 8196 (página 2) indexam a tabela; a entrada tem bit presente = 1 e moldura 6 (110); o deslocamento de 12 bits é copiado. Resultado: 24580.</figcaption>
</figure>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: traduzindo endereços com a tabela acima</strong> (página de 4 KB = 4096 bytes).</p>
  <table>
    <tr><th>Endereço virtual</th><th>Página = end. ÷ 4096</th><th>Deslocamento = resto</th><th>Tabela</th><th>Endereço físico</th></tr>
    <tr><td>0</td><td>0</td><td>0</td><td>pág. 0 → moldura 2</td><td>2 × 4096 + 0 = <strong>8192</strong></td></tr>
    <tr><td>8192</td><td>2</td><td>0</td><td>pág. 2 → moldura 6</td><td>6 × 4096 + 0 = <strong>24576</strong></td></tr>
    <tr><td>20500</td><td>5 (5 × 4096 = 20480)</td><td>20</td><td>pág. 5 → moldura 3</td><td>3 × 4096 + 20 = <strong>12308</strong></td></tr>
    <tr><td>32780</td><td>8 (8 × 4096 = 32768)</td><td>12</td><td>pág. 8 → <strong>X</strong></td><td><strong>Falta de página</strong></td></tr>
  </table>
  <p>No último caso, o SO escolhe uma moldura pouco usada (digamos a moldura 1), grava seu conteúdo no disco se ela foi modificada, traz a página 8 para a moldura 1, marca a página 1 como não mapeada, marca a página 8 com moldura 1 e reexecuta a instrução. Agora 32780 vira 1 × 4096 + 12 = <strong>4108</strong>.</p>
</div>

<h2>A tabela de páginas e seus bits</h2>
<p>A <strong>tabela de páginas</strong> é uma função: recebe o número da página virtual e devolve o número da moldura. Cada processo tem a sua. Uma entrada típica (32 bits é comum) contém:</p>
<table>
  <tr><th>Campo</th><th>Para que serve</th></tr>
  <tr><td><strong>Número da moldura</strong></td><td>O campo mais importante: o objetivo do mapeamento é achar esse valor.</td></tr>
  <tr><td><strong>Presente/ausente</strong></td><td>1 = a página está na memória e a entrada é válida; 0 = não está, e o acesso causa <strong>falta de página</strong>.</td></tr>
  <tr><td><strong>Proteção</strong></td><td>Que acessos são permitidos: 1 bit (leitura/escrita ou só leitura) ou 3 bits (leitura, escrita, execução).</td></tr>
  <tr><td><strong>Modificada (M)</strong></td><td>O hardware põe 1 ao <strong>escrever</strong> na página. Se a página "suja" for removida, precisa ser gravada no disco; se estiver "limpa", basta abandoná-la. Também chamado <strong>bit sujo</strong>.</td></tr>
  <tr><td><strong>Referenciada (R)</strong></td><td>Posto em 1 a cada acesso, <strong>leitura ou escrita</strong>. Ajuda o SO a escolher a página a remover (próxima aula).</td></tr>
  <tr><td><strong>Cache desabilitado</strong></td><td>Desliga o cache para páginas que mapeiam registradores de dispositivos (E/S mapeada em memória).</td></tr>
</table>
<p>O endereço da página no disco <strong>não</strong> fica na tabela de páginas: a tabela só tem o que o hardware precisa para traduzir; o resto fica em tabelas do SO.</p>

<h2>Acelerando: a TLB</h2>
<p>Dois problemas: (1) o mapeamento acontece em <strong>toda</strong> referência à memória, então precisa ser muito rápido; (2) com endereços de 32 bits e páginas de 4 KB são 2<sup>20</sup> (um milhão) de páginas, e a tabela fica <strong>enorme</strong>. Guardar a tabela na memória exigiria um acesso extra à memória por referência, o que dobraria o tempo.</p>
<p>A solução vem da observação de que os programas fazem muitas referências a <strong>poucas páginas</strong>. A <strong>TLB</strong> (<em>translation lookaside buffer</em>), ou <strong>memória associativa</strong>, é um pequeno hardware dentro da MMU com poucas entradas (raramente mais de 64). Cada entrada tem número da página virtual, bit de validade, bit modificada, proteção e moldura.</p>
<ul>
  <li>O hardware compara o número da página com <strong>todas as entradas ao mesmo tempo</strong> (em paralelo). Se achar (e a proteção permitir), pega a moldura direto, <strong>sem consultar a tabela de páginas</strong>.</li>
  <li>Se não achar, faz a busca normal na tabela de páginas e coloca a entrada na TLB no lugar de outra (o bit modificada da entrada removida volta para a tabela).</li>
  <li>Em máquinas RISC (SPARC, MIPS), a TLB é gerenciada <strong>por software</strong>: uma ausência na TLB gera interrupção e o SO a preenche.</li>
  <li><strong>Ausência leve</strong> (<em>soft miss</em>): a página não está na TLB, mas está na memória; basta atualizar a TLB (10 a 20 instruções, nanossegundos). <strong>Ausência completa</strong> (<em>hard miss</em>): a página não está nem na memória; precisa de acesso ao disco (milissegundos).</li>
</ul>
<h3>Duas contas que caem em prova</h3>
<p><strong>Tamanho da tabela de páginas</strong> (tabela de um nível): nº de entradas = 2<sup>(bits do endereço virtual − bits do deslocamento)</sup>; tamanho = nº de entradas × tamanho da entrada. Ex.: 32 bits, página de 4 KB (12 bits de deslocamento) e entrada de 4 B → 2<sup>20</sup> entradas × 4 B = 4 MB <em>por processo</em>.</p>
<p><strong>Tempo efetivo de acesso (TEA) com TLB</strong> (fórmula do Silberschatz), supondo tabela de um nível, nenhuma falta de página e consulta à TLB antes da tabela:</p>
<p style="text-align:center"><strong>TEA = h × (t<sub>TLB</sub> + t<sub>mem</sub>) + (1 − h) × (t<sub>TLB</sub> + 2 × t<sub>mem</sub>)</strong></p>
<p>Onde h é a taxa de acerto na TLB. No acerto, gasta-se a TLB e um acesso à memória (o dado). Na ausência, gasta-se a TLB, um acesso à tabela de páginas e outro ao dado. Algumas edições desprezam o tempo da TLB; leia a convenção do enunciado.</p>

<h2>Tabelas para memórias grandes</h2>
<h3>Tabela de páginas multinível</h3>
<p>O endereço virtual de 32 bits é dividido em <strong>PT1</strong> (10 bits), <strong>PT2</strong> (10 bits) e <strong>deslocamento</strong> (12 bits). PT1 indexa a tabela de nível 1 (1024 entradas, cada uma cobrindo 4 MB), que aponta para uma tabela de nível 2; PT2 indexa essa tabela e dá a moldura. O segredo: <strong>só as tabelas necessárias ficam na memória</strong>. Um processo com 12 MB (4 MB de código embaixo, 4 MB de dados, 4 MB de pilha no topo) precisa só da tabela de nível 1 e de <strong>3 tabelas de nível 2</strong>, em vez de uma tabela com um milhão de entradas. O esquema pode ter 3 ou 4 níveis.</p>
<p>Exemplo: o endereço 0x00403004 (4.206.596) tem PT1 = 1, PT2 = 3 e deslocamento = 4. PT1 = 1 aponta a tabela de nível 2 dos endereços de 4 MB a 8 MB; a entrada 3 dela cobre de 12288 a 16383 dentro desse pedaço.</p>
<h3>Tabela de páginas invertida</h3>
<p>Com 64 bits, até a tabela multinível fica inviável (2<sup>52</sup> entradas com páginas de 4 KB). A <strong>tabela invertida</strong> tem <strong>uma entrada por moldura</strong> da memória real, e não por página virtual: com 1 GB de RAM e páginas de 4 KB, são só 2<sup>18</sup> = 262.144 entradas. Cada entrada diz qual par (processo, página virtual) está naquela moldura. O problema: a tradução fica difícil, porque é preciso <strong>procurar</strong> o par (n, p) na tabela inteira. Soluções: usar a <strong>TLB</strong> e, nas ausências, uma <strong>tabela de espalhamento (hash)</strong> indexada pela página virtual.</p>

<h2>Falta de página (page fault), passo a passo</h2>
<ol>
  <li>O programa referencia uma página com bit presente = 0. A MMU gera uma interrupção (desvio para o núcleo), salvando o contador de programa.</li>
  <li>O SO descobre qual página virtual foi pedida e verifica se o endereço é válido e a proteção permite o acesso (se não, o processo recebe um sinal ou é eliminado).</li>
  <li>O SO escolhe uma moldura livre ou, se não houver, uma página vítima pelo <strong>algoritmo de substituição</strong>.</li>
  <li>Se a vítima foi modificada (bit M = 1), ela é escalonada para gravação no disco; o processo fica bloqueado e outro processo usa a CPU.</li>
  <li>A página pedida é lida do disco para a moldura (de novo, outro processo executa enquanto isso).</li>
  <li>Quando o disco interrompe avisando que terminou, a tabela de páginas é atualizada (bit presente = 1, nova moldura).</li>
  <li>A instrução que causou a falta é <strong>reexecutada</strong> e o processo volta a ser escalonado.</li>
</ol>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Página</strong> é do espaço virtual; <strong>moldura</strong> (quadro) é da memória física. Têm o mesmo tamanho, mas não são a mesma coisa.</li>
    <li>A MMU troca só o número da página pelo número da moldura; <strong>o deslocamento não muda</strong>.</li>
    <li>Falta de página <strong>não é erro</strong> do programa: é um evento normal tratado pelo SO, e a instrução é reexecutada. Erro é acessar endereço inválido ou violar a proteção.</li>
    <li>O bit <strong>R</strong> vai a 1 em leitura <em>ou</em> escrita; o bit <strong>M</strong> só em escrita.</li>
    <li>A tabela <strong>invertida</strong> tem uma entrada por <strong>moldura física</strong>, não por página virtual. A multinível economiza porque não aloca tabelas de nível 2 não usadas.</li>
    <li>Na tradução brasileira do livro, o texto do exemplo 0x00403004 diz "PT2 = 2", mas o próprio parágrafo usa a entrada 3; o valor correto é <strong>PT2 = 3</strong> (0x403 tem os 10 bits baixos = 3).</li>
  </ul>
</div>
`,
  resumo: 'Memória virtual permite executar processos maiores que a RAM: o espaço virtual é dividido em páginas e a memória física em molduras do mesmo tamanho, e só parte das páginas precisa estar na memória. A MMU divide o endereço virtual em número da página e deslocamento, consulta a tabela de páginas (moldura, presente/ausente, proteção, R, M, cache) e troca a página pela moldura. Acessar página ausente gera falta de página, tratada pelo SO. A TLB acelera a tradução; tabelas multinível e invertidas resolvem o tamanho da tabela.',
  questoes: [
    {
      id: 'm08-a02-q1',
      enunciado: 'Com páginas de 4 KB e a tabela do exemplo (página 0→2, 1→1, 2→6, 3→0, 4→4, 5→3, 9→5, 11→7; as demais não mapeadas), em que endereço físico a MMU transforma o endereço virtual <strong>20500</strong>?',
      alternativas: [
        { texto: '12308.', correta: true, explicacao: 'Correto. <pre class="codigo"><code>página = 20500 div 4096 = 5  (5 x 4096 = 20480)\ndesloc. = 20500 - 20480 = 20\npágina 5 -> moldura 3\nfísico = 3 x 4096 + 20 = 12288 + 20 = 12308</code></pre>' },
        { texto: '20500.', correta: false, explicacao: 'Isso seria supor que o endereço virtual é igual ao físico. A página 5 está na moldura 3, então o endereço muda para 12308.' },
        { texto: '12288.', correta: false, explicacao: '12288 é só o início da moldura 3. Falta somar o deslocamento 20, que é copiado sem alteração: 12288 + 20 = 12308.' },
        { texto: 'Falta de página, pois a página 5 não está mapeada.', correta: false, explicacao: 'A página 5 está mapeada na moldura 3 (bit presente = 1). As não mapeadas são 6, 7, 8, 10 e 12 a 15.' },
      ],
    },
    {
      id: 'm08-a02-q2',
      enunciado: 'Ainda com a mesma tabela e páginas de 4 KB, o que acontece quando o programa acessa o endereço virtual <strong>24600</strong>?',
      alternativas: [
        { texto: 'Falta de página: o endereço está na página 6, que não está mapeada.', correta: true, explicacao: 'Correto. <pre class="codigo"><code>página = 24600 div 4096 = 6  (6 x 4096 = 24576)\ndesloc. = 24\npágina 6 -> X (presente/ausente = 0)\n=> interrupção de falta de página</code></pre> O SO traz a página 6 do disco para uma moldura e reexecuta a instrução.' },
        { texto: 'Vira o endereço físico 24600, pois ele cabe nos 32 KB de memória física.', correta: false, explicacao: 'Caber na memória física não importa: o endereço é virtual e tem de passar pela tabela de páginas. A página 6 não tem moldura.' },
        { texto: 'Vira 6 × 4096 + 24 = 24600, pois a página 6 fica na moldura 6.', correta: false, explicacao: 'A página virtual não tem de ficar na moldura de mesmo número. Na tabela, a página 6 está marcada com X: não mapeada. Quem está na moldura 6 é a página 2.' },
        { texto: 'O processo é eliminado por acessar memória inválida.', correta: false, explicacao: 'O endereço é válido (está no espaço virtual do processo); a página só não está na memória. Isso é uma falta de página, um evento normal tratado pelo SO.' },
      ],
    },
    {
      id: 'm08-a02-q3',
      enunciado: 'Um computador gera endereços virtuais de 16 bits, tem 32 KB de memória física e usa páginas de 4 KB. Quantas páginas virtuais e quantas molduras existem, e quantos bits tem o deslocamento?',
      alternativas: [
        { texto: '16 páginas virtuais, 8 molduras e deslocamento de 12 bits.', correta: true, explicacao: 'Correto. 4 KB = 2<sup>12</sup>, logo o deslocamento tem 12 bits. Sobram 16 − 12 = 4 bits para a página: 2<sup>4</sup> = 16 páginas (64 KB / 4 KB). Molduras: 32 KB / 4 KB = 8 (endereço físico de 15 bits).' },
        { texto: '8 páginas virtuais, 16 molduras e deslocamento de 12 bits.', correta: false, explicacao: 'Invertido: o espaço virtual (64 KB) é maior que a memória física (32 KB), então há mais páginas (16) que molduras (8).' },
        { texto: '16 páginas virtuais, 8 molduras e deslocamento de 4 bits.', correta: false, explicacao: 'O deslocamento endereça cada byte dentro da página: 4 KB = 4096 bytes exigem 12 bits. Os 4 bits são o número da página.' },
        { texto: '4096 páginas virtuais, 8 molduras e deslocamento de 4 bits.', correta: false, explicacao: '4096 é o tamanho da página em bytes, não o número de páginas. Com 16 bits de endereço e 12 de deslocamento, há só 16 páginas.' },
      ],
    },
    {
      id: 'm08-a02-q4',
      enunciado: 'Sobre os bits de uma entrada da tabela de páginas, é correto afirmar:',
      alternativas: [
        { texto: 'O bit modificada (sujo) indica que a página foi escrita e, se for removida, precisa ser gravada de volta no disco.', correta: true, explicacao: 'Correto. Se M = 1 a cópia do disco está desatualizada e a página tem de ser reescrita; se M = 0, a página pode ser simplesmente abandonada.' },
        { texto: 'O bit referenciada só vai para 1 quando há escrita na página.', correta: false, explicacao: 'O bit R vai a 1 em qualquer acesso, leitura ou escrita. Quem só vai a 1 na escrita é o bit M.' },
        { texto: 'O bit presente/ausente igual a 1 indica que a página está apenas no disco.', correta: false, explicacao: 'É o contrário: 1 = presente na memória (entrada válida); 0 = ausente, e o acesso causa falta de página.' },
        { texto: 'A entrada guarda o endereço da página no disco, usado pela MMU quando a página está ausente.', correta: false, explicacao: 'O endereço no disco não faz parte da tabela de páginas. Ela só guarda o que o hardware precisa para traduzir; o endereço em disco fica em tabelas do SO.' },
      ],
    },
    {
      id: 'm08-a02-q5',
      enunciado: 'Qual é a função da TLB (memória associativa)?',
      alternativas: [
        { texto: 'Guardar, num hardware pequeno e rápido dentro da MMU, as traduções das páginas mais usadas, evitando consultar a tabela de páginas na memória.', correta: true, explicacao: 'Correto. Os programas usam muito poucas páginas por vez; a TLB compara a página com todas as suas entradas em paralelo e, se encontrar, dá a moldura sem acessar a tabela de páginas.' },
        { texto: 'Guardar as páginas que foram removidas da memória até serem gravadas no disco.', correta: false, explicacao: 'A TLB não guarda conteúdo de páginas, só traduções (página virtual → moldura, com bits de proteção e modificada).' },
        { texto: 'Substituir a tabela de páginas, que deixa de existir quando há TLB.', correta: false, explicacao: 'A TLB tem poucas entradas (raramente mais de 64). Quando a página não está nela, a busca é feita normalmente na tabela de páginas.' },
        { texto: 'Tratar as faltas de página, trazendo a página do disco.', correta: false, explicacao: 'Quem trata a falta de página é o SO. Uma ausência na TLB com a página na memória é só uma ausência leve, resolvida atualizando a TLB.' },
      ],
    },
    {
      id: 'm08-a02-q6',
      enunciado: 'Qual a diferença entre uma <strong>ausência leve</strong> (soft miss) e uma <strong>ausência completa</strong> (hard miss)?',
      alternativas: [
        { texto: 'Na leve, a página não está na TLB mas está na memória; na completa, a página não está nem na memória e precisa vir do disco.', correta: true, explicacao: 'Correto. A ausência leve só atualiza a TLB (10 a 20 instruções, nanossegundos); a completa exige acesso a disco (milissegundos), milhões de vezes mais lenta.' },
        { texto: 'Na leve, a página está no disco; na completa, o endereço é inválido.', correta: false, explicacao: 'Página no disco é ausência completa. Endereço inválido não é ausência: é um erro que leva o SO a enviar um sinal ou eliminar o processo.' },
        { texto: 'As duas exigem acesso ao disco; a leve lê menos bytes.', correta: false, explicacao: 'A ausência leve não acessa o disco: a página já está na memória, só falta a tradução na TLB.' },
        { texto: 'A leve acontece em leitura e a completa em escrita.', correta: false, explicacao: 'O tipo de acesso não importa. O que distingue as duas é onde a página está: na memória (leve) ou só no disco (completa).' },
      ],
    },
    {
      id: 'm08-a02-q7',
      enunciado: 'Em um sistema de 64 bits com páginas de 4 KB e 1 GB de RAM, uma tabela de páginas invertida tem quantas entradas, e qual a sua principal dificuldade?',
      alternativas: [
        { texto: '262.144 entradas (uma por moldura); a tradução exige procurar o par (processo, página) na tabela, o que se ameniza com TLB e tabela hash.', correta: true, explicacao: 'Correto. 1 GB / 4 KB = 2<sup>30</sup> / 2<sup>12</sup> = 2<sup>18</sup> = 262.144 molduras, uma entrada para cada. Como a página virtual não serve de índice, é preciso buscar; a TLB e o espalhamento (hash) tornam isso viável.' },
        { texto: '2<sup>52</sup> entradas (uma por página virtual); a dificuldade é o espaço ocupado.', correta: false, explicacao: '2<sup>52</sup> entradas seria a tabela tradicional, que é justamente o que a invertida evita. A invertida tem uma entrada por moldura física.' },
        { texto: '1.024 entradas, como a tabela de nível 1 da multinível.', correta: false, explicacao: '1.024 entradas é a tabela de nível 1 do exemplo multinível de 32 bits. A invertida depende do tamanho da RAM: 2<sup>18</sup> molduras.' },
        { texto: '262.144 entradas; a dificuldade é que ela não pode ser usada com TLB.', correta: false, explicacao: 'O número está certo, mas a TLB é justamente a principal ajuda da tabela invertida: se a TLB contém as páginas mais usadas, a busca na tabela fica rara.' },
      ],
    },
    {
      id: 'm08-a02-q8',
      enunciado: 'Por que a tabela de páginas multinível economiza memória?',
      alternativas: [
        { texto: 'Porque só as tabelas de nível 2 realmente usadas precisam existir na memória; regiões vazias do espaço virtual não ganham tabela.', correta: true, explicacao: 'Correto. No exemplo do livro, um processo de 12 MB precisa só da tabela de nível 1 e de 3 tabelas de nível 2 (código, dados e pilha), em vez de uma tabela de um milhão de entradas.' },
        { texto: 'Porque ela elimina a necessidade de deslocamento no endereço.', correta: false, explicacao: 'O deslocamento continua existindo (12 bits no exemplo). O que muda é que o número da página é dividido em PT1 e PT2.' },
        { texto: 'Porque guarda uma entrada por moldura física.', correta: false, explicacao: 'Essa é a tabela invertida. A multinível continua indexada pela página virtual, mas em níveis.' },
        { texto: 'Porque torna a tradução mais rápida que a TLB.', correta: false, explicacao: 'A multinível exige mais acessos à memória por tradução (um por nível); quem acelera é a TLB. A vantagem da multinível é espaço, não velocidade.' },
      ],
    },
    {
      id: 'm08-a02-q9',
      enunciado: 'Um sistema tem endereços virtuais de 32 bits, páginas de 4 KB e entradas da tabela de páginas de 4 bytes. Qual o tamanho de uma tabela de páginas de um nível, para um processo?',
      alternativas: [
        { texto: '4 MB.', correta: true, explicacao: 'Correto. <pre class="codigo"><code>4 KB = 2^12 -> 12 bits de deslocamento\nbits de página = 32 - 12 = 20\nentradas = 2^20 = 1.048.576\ntamanho = 2^20 x 4 B = 2^22 B = 4 MB</code></pre> E isso por processo, o que motiva as tabelas multinível.' },
        { texto: '1 MB.', correta: false, explicacao: '2<sup>20</sup> (cerca de 1 milhão) é o número de entradas, não de bytes. Cada entrada tem 4 bytes: 2<sup>20</sup> × 4 B = 4 MB.' },
        { texto: '4 KB.', correta: false, explicacao: '4 KB é o tamanho de uma página, não da tabela. A tabela tem uma entrada por página virtual: 2<sup>20</sup> entradas de 4 B, ou seja, 4 MB.' },
        { texto: '4 GB.', correta: false, explicacao: '4 GB (2<sup>32</sup> bytes) é o espaço de endereçamento virtual inteiro. A tabela só guarda uma entrada de 4 B para cada página de 4 KB: 4 GB / 4 KB × 4 B = 4 MB.' },
      ],
    },
    {
      id: 'm08-a02-q10',
      enunciado: 'A consulta à TLB leva 20 ns, um acesso à memória leva 100 ns e a taxa de acerto na TLB é de 80%. A tabela de páginas tem um nível e está na memória; não há faltas de página. A TLB é consultada antes da tabela. Qual o tempo efetivo de acesso (TEA)?',
      alternativas: [
        { texto: '140 ns.', correta: true, explicacao: 'Correto (fórmula do Silberschatz). <pre class="codigo"><code>acerto  (80%): TLB + dado        = 20 + 100       = 120 ns\nausência (20%): TLB + tabela + dado = 20 + 100 + 100 = 220 ns\nTEA = 0,8 x 120 + 0,2 x 220 = 96 + 44 = 140 ns</code></pre> Comparado aos 100 ns sem paginação, a TLB limita a perda a 40%. Sem TLB seriam 200 ns.' },
        { texto: '136 ns.', correta: false, explicacao: 'Você usou 200 ns na ausência, esquecendo que a TLB também foi consultada (e falhou) antes de ir à tabela: 0,8 × 120 + 0,2 × 200 = 136. Pela convenção do enunciado, a ausência custa 20 + 100 + 100 = 220 ns, o que dá 140 ns.' },
        { texto: '120 ns.', correta: false, explicacao: '120 ns é só o caso de acerto. Em 20% dos acessos a tradução não está na TLB e é preciso um acesso extra à tabela de páginas (220 ns), o que eleva a média para 140 ns.' },
        { texto: '36 ns.', correta: false, explicacao: 'Esta conta (0,8 × 20 + 0,2 × 100) mistura os tempos sem somá-los por caso. O TEA é a média ponderada do custo total de cada caso: 0,8 × (20 + 100) + 0,2 × (20 + 100 + 100) = 140 ns.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm08-a02-d1',
      enunciado: 'Explique o que é memória virtual com paginação e descreva como a MMU traduz um endereço virtual em físico. O que acontece quando a página não está na memória?',
      respostaModelo: `<p><strong>Memória virtual</strong> é a técnica em que cada processo tem seu próprio <strong>espaço de endereçamento virtual</strong>, que pode ser maior que a memória física, e só parte dele precisa estar na RAM. Na <strong>paginação</strong>, o espaço virtual é dividido em <strong>páginas</strong> e a memória física em <strong>molduras</strong> de mesmo tamanho (potência de 2); as transferências entre memória e disco são de páginas inteiras.</p>
<p>A <strong>MMU</strong> recebe o endereço virtual e o divide em <strong>número da página</strong> (bits altos) e <strong>deslocamento</strong> (bits baixos). O número da página indexa a <strong>tabela de páginas</strong> do processo; se o bit <strong>presente/ausente</strong> for 1, a entrada fornece o número da moldura, que substitui o número da página, e o deslocamento é copiado sem mudança. Exemplo com páginas de 4 KB: 8196 = página 2, deslocamento 4; página 2 na moldura 6 → 6 × 4096 + 4 = 24580. A <strong>TLB</strong> guarda as traduções mais usadas para evitar consultar a tabela.</p>
<p>Se o bit presente for 0, ocorre uma <strong>falta de página</strong>: a MMU gera uma interrupção, o SO verifica se o acesso é válido, escolhe uma moldura (se preciso, remove uma página vítima, gravando-a no disco se o bit modificada estiver em 1), lê a página do disco (o processo fica bloqueado e outro usa a CPU), atualiza a tabela de páginas e reexecuta a instrução.</p>`,
      pontosChave: [
        'Definiu memória virtual: espaço virtual próprio, possivelmente maior que a RAM, com só parte na memória',
        'Páginas (virtuais) e molduras (físicas) de mesmo tamanho',
        'Tradução: número da página indexa a tabela de páginas, moldura substitui a página e o deslocamento é mantido',
        'Citou o bit presente/ausente e a falta de página como interrupção tratada pelo SO',
        'Descreveu o tratamento: escolher vítima (gravar se modificada), trazer do disco, atualizar a tabela e reexecutar a instrução',
      ],
    },
  ],
});
