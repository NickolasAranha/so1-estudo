// Módulo 9, aula 6: alocação (contígua, encadeada, FAT, i-nodes), diretórios, links, journaling, espaço livre, backup, consistência e cache.
SO1.registerLesson({
  id: 'm09-a06',
  titulo: 'Implementação de sistemas de arquivos',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §4.3 implementação do sistema de arquivos (p.169–180): alocação contígua, por lista encadeada, FAT, i-nodes, diretórios, arquivos compartilhados, journaling, VFS',
    'Tanenbaum, SO Modernos 3ª ed., §4.4 gerenciamento e otimização (p.180–193): tamanho de bloco, blocos livres, cópias de segurança, consistência, desempenho',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: guardar os capítulos de um livro num estacionamento de vagas numeradas.</strong></p>
  <ul>
    <li><strong>Contígua</strong>: o livro ocupa vagas seguidas (12 a 20). Achar é fácil, mas quando livros saem sobram buracos que não servem para livros grandes.</li>
    <li><strong>Encadeada</strong>: cada vaga tem um bilhete "o próximo capítulo está na vaga 37". Para chegar ao capítulo 10, é preciso visitar as 9 vagas anteriores.</li>
    <li><strong>FAT</strong>: os bilhetes ficam todos num <em>quadro na portaria</em>; segue-se a corrente no quadro, sem andar pelo estacionamento.</li>
    <li><strong>i-node</strong>: cada livro tem a sua <em>ficha</em> com a lista das vagas de todos os capítulos; só ficam na portaria as fichas dos livros sendo lidos.</li>
  </ul>
</div>

<h2>Organização do disco</h2>
<p>O disco é dividido em <strong>partições</strong>, cada uma com um sistema de arquivos independente. O setor 0 é o <strong>MBR</strong> (registro mestre de inicialização), com a tabela de partições. Cada partição começa com o <strong>bloco de inicialização</strong>, seguido do <strong>superbloco</strong> (número mágico do tipo de sistema de arquivos, número de blocos e outros dados administrativos), da informação de <strong>blocos livres</strong> (mapa de bits ou lista), dos <strong>i-nodes</strong>, do <strong>diretório-raiz</strong> e, por fim, dos arquivos e diretórios.</p>

<h2>Alocação de arquivos: quais blocos pertencem a qual arquivo?</h2>
<h3>1. Alocação contígua</h3>
<p>Cada arquivo ocupa <strong>blocos consecutivos</strong> (com blocos de 1 KB, um arquivo de 50 KB ocupa 50 blocos seguidos). <strong>Vantagens</strong>: simples (basta guardar o endereço do primeiro bloco e o número de blocos) e <strong>desempenho de leitura excelente</strong> (um seek e depois tudo em sequência). <strong>Desvantagem</strong>: <strong>fragmentação externa</strong>: arquivos removidos deixam lacunas; compactar exige copiar milhões de blocos, e na criação é preciso saber o tamanho final do arquivo. É ótima para mídias gravadas uma vez, como <strong>CD-ROM e DVD</strong>.</p>
<h3>2. Alocação por lista encadeada</h3>
<p>Cada bloco guarda, na primeira palavra, o <strong>ponteiro para o próximo bloco</strong>. Não há fragmentação externa e a entrada do diretório só precisa do primeiro bloco. <strong>Desvantagens</strong>: <strong>acesso aleatório lentíssimo</strong> (para chegar ao bloco n é preciso ler os n − 1 anteriores) e a área de dados de cada bloco deixa de ser potência de 2, porque o ponteiro ocupa alguns bytes.</p>
<h3>3. Lista encadeada com tabela na memória: FAT</h3>
<p>Tira-se o ponteiro de cada bloco e põe-se numa <strong>tabela na memória principal</strong>, a <strong>FAT</strong> (<em>file allocation table</em>, usada no MS-DOS e no Windows). O bloco inteiro fica para dados, e o acesso aleatório, embora ainda siga a corrente, é feito <strong>na memória</strong>, sem ler o disco. <strong>Desvantagem</strong>: a tabela inteira precisa ficar na memória o tempo todo e cresce com o disco: com 200 GB e blocos de 1 KB são 200 milhões de entradas, de 3 ou 4 bytes cada, ou seja, <strong>600 a 800 MB de RAM</strong>.</p>
<h3>4. i-nodes (nós-índice)</h3>
<p>Cada arquivo tem uma pequena estrutura, o <strong>i-node</strong>, com os <strong>atributos</strong> e os <strong>endereços dos blocos</strong> do arquivo. <strong>Vantagem</strong>: só o i-node dos <strong>arquivos abertos</strong> precisa estar na memória. Se cada i-node ocupa n bytes e podem existir k arquivos abertos, bastam k·n bytes, um valor proporcional ao número de arquivos abertos e não ao tamanho do disco. Para arquivos que crescem além dos endereços diretos, o i-node aponta para <strong>blocos indiretos</strong>, que contêm mais endereços.</p>

<figure class="diagrama">
  <svg viewBox="0 0 470 330" style="max-width:620px" role="img" aria-label="i-node com atributos, 10 endereços diretos e ponteiros para blocos indiretos simples, duplo e triplo">
    <g font-size="12" fill="currentColor">
      <rect x="10" y="10" width="150" height="40" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="85" y="27" text-anchor="middle" font-weight="bold">i-node</text>
      <text x="85" y="43" text-anchor="middle" font-size="10">atributos (dono, tempos, links…)</text>
      <rect x="10" y="50" width="150" height="22" fill="none" stroke="currentColor"/><text x="85" y="65" text-anchor="middle">endereço do bloco 0</text>
      <rect x="10" y="72" width="150" height="22" fill="none" stroke="currentColor"/><text x="85" y="87" text-anchor="middle">endereço do bloco 1</text>
      <rect x="10" y="94" width="150" height="22" fill="none" stroke="currentColor"/><text x="85" y="109" text-anchor="middle">⋮</text>
      <rect x="10" y="116" width="150" height="22" fill="none" stroke="currentColor"/><text x="85" y="131" text-anchor="middle">endereço do bloco 9</text>
      <rect x="10" y="138" width="150" height="22" style="fill:var(--verde-claro);stroke:var(--verde)"/><text x="85" y="153" text-anchor="middle">indireto simples</text>
      <rect x="10" y="160" width="150" height="22" style="fill:var(--ambar-claro);stroke:var(--ambar)"/><text x="85" y="175" text-anchor="middle">indireto duplo</text>
      <rect x="10" y="182" width="150" height="22" style="fill:var(--vermelho-claro);stroke:var(--vermelho)"/><text x="85" y="197" text-anchor="middle">indireto triplo</text>
    </g>
    <g fill="none" stroke="currentColor">
      <rect x="420" y="52" width="40" height="18"/><rect x="420" y="74" width="40" height="18"/><rect x="420" y="118" width="40" height="18"/>
      <path d="M160 61 H418 M160 83 H418 M160 127 H418"/>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="440" y="48" text-anchor="middle">dados</text>
      <text x="300" y="104" text-anchor="middle">10 endereços diretos → blocos de dados</text>
    </g>
    <g fill="none" stroke-width="1.5">
      <rect x="200" y="150" width="60" height="40" style="stroke:var(--verde)"/>
      <path d="M160 149 H198" style="stroke:var(--verde)"/>
      <path d="M260 170 H418" style="stroke:var(--verde)"/>
      <rect x="420" y="161" width="40" height="18" stroke="currentColor"/>
      <rect x="200" y="210" width="60" height="40" style="stroke:var(--ambar)"/>
      <rect x="300" y="210" width="60" height="40" style="stroke:var(--ambar)"/>
      <path d="M160 171 H180 V230 H198" style="stroke:var(--ambar)"/>
      <path d="M260 230 H298 M360 230 H418" style="stroke:var(--ambar)"/>
      <rect x="420" y="221" width="40" height="18" stroke="currentColor"/>
      <rect x="200" y="270" width="50" height="40" style="stroke:var(--vermelho)"/>
      <rect x="275" y="270" width="50" height="40" style="stroke:var(--vermelho)"/>
      <rect x="350" y="270" width="50" height="40" style="stroke:var(--vermelho)"/>
      <path d="M160 193 H170 V290 H198" style="stroke:var(--vermelho)"/>
      <path d="M250 290 H273 M325 290 H348 M400 290 H418" style="stroke:var(--vermelho)"/>
      <rect x="420" y="281" width="40" height="18" stroke="currentColor"/>
    </g>
    <g font-size="10" fill="currentColor" text-anchor="middle">
      <text x="230" y="167">bloco de</text><text x="230" y="180">endereços</text>
      <text x="230" y="234">endereços</text><text x="330" y="234">endereços</text>
      <text x="225" y="294">end.</text><text x="300" y="294">end.</text><text x="375" y="294">end.</text>
      <text x="235" y="325">cada nível de indireção multiplica os endereços (256 por bloco de 1 KB)</text>
    </g>
  </svg>
  <figcaption>i-node no estilo do UNIX: atributos, 10 endereços diretos e três ponteiros para blocos indiretos (simples, duplo e triplo). O Tanenbaum mostra primeiro uma versão simplificada (Figura 4.11), com 8 endereços diretos e um bloco de ponteiros.</figcaption>
</figure>

<table>
  <tr><th>Método</th><th>Fragmentação externa</th><th>Acesso aleatório</th><th>Memória necessária</th></tr>
  <tr><td>Contígua</td><td>Sim</td><td>Ótimo (cálculo direto)</td><td>Mínima (início + tamanho)</td></tr>
  <tr><td>Lista encadeada</td><td>Não</td><td>Péssimo (lê os blocos anteriores)</td><td>Mínima (primeiro bloco)</td></tr>
  <tr><td>FAT</td><td>Não</td><td>Bom (segue a corrente na RAM)</td><td>Tabela inteira, proporcional ao disco</td></tr>
  <tr><td>i-node</td><td>Não</td><td>Bom (endereços no i-node)</td><td>Só os i-nodes dos arquivos abertos</td></tr>
</table>

<div class="exemplo">
  <p><strong>Exemplo passo a passo 1: seguindo a FAT</strong> (Figura 4.10 do Tanenbaum). O arquivo A começa no bloco 4; o B, no bloco 6.</p>
  <table>
    <tr><th>Bloco</th><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td><td>10</td><td>11</td><td>12</td><td>14</td></tr>
    <tr><th>Entrada da FAT (próximo)</th><td>10</td><td>11</td><td>7</td><td>3</td><td>2</td><td>12</td><td>14</td><td>−1</td><td>−1</td></tr>
  </table>
  <p>Arquivo A: 4 → (FAT[4]=7) 7 → (FAT[7]=2) 2 → (FAT[2]=10) 10 → (FAT[10]=12) 12 → (FAT[12]=−1) fim. Blocos: <strong>4, 7, 2, 10, 12</strong>. Arquivo B: 6 → 3 → 11 → 14 → fim. A entrada do diretório só guarda o bloco inicial; o −1 marca o fim.</p>
  <p><strong>Exemplo passo a passo 2: tamanho máximo com i-node.</strong> Blocos de 1 KB, endereços de 4 bytes, i-node com 10 endereços diretos e 1 indireto simples.</p>
  <table>
    <tr><th>Parte</th><th>Conta</th><th>Blocos</th></tr>
    <tr><td>Diretos</td><td>10 endereços</td><td>10</td></tr>
    <tr><td>Indireto simples</td><td>1 bloco de 1.024 B ÷ 4 B por endereço</td><td>256</td></tr>
    <tr><td><strong>Total</strong></td><td>266 blocos × 1 KB</td><td><strong>266 KB</strong></td></tr>
  </table>
  <p>Com o indireto duplo somam-se mais 256 × 256 = 65.536 blocos (64 MB); com o triplo, mais 256³ blocos.</p>
</div>

<h2>Implementação de diretórios</h2>
<p>A função do diretório é <strong>mapear o nome ASCII do arquivo na informação para achar os dados</strong> (endereço do primeiro bloco, número do i-node...). Onde ficam os atributos?</p>
<ul>
  <li><strong>Na própria entrada do diretório</strong> (MS-DOS/Windows): entradas de tamanho fixo com nome, atributos e endereços.</li>
  <li><strong>No i-node</strong> (UNIX): a entrada contém só o <strong>nome e o número do i-node</strong>.</li>
</ul>
<p>Nomes longos e de tamanho variável podem ficar na própria entrada (entradas de tamanho variável, que deixam lacunas quando removidas) ou num <strong>heap</strong> no fim do diretório, com ponteiros. Para diretórios grandes, a busca linear pode ser trocada por <strong>tabela hash</strong> ou por uma <strong>cache</strong> das buscas.</p>

<h2>Arquivos compartilhados (links)</h2>
<p>Um mesmo arquivo pode aparecer em diretórios de dois usuários. O sistema de arquivos deixa de ser árvore e vira um <strong>grafo acíclico dirigido (DAG)</strong>.</p>
<table>
  <tr><th></th><th>Ligação estrita (hard link)</th><th>Ligação simbólica (symbolic link)</th></tr>
  <tr><td>Como é</td><td>Duas entradas de diretório apontam para o <strong>mesmo i-node</strong>; o i-node tem um <strong>contador de ligações</strong>.</td><td>Um novo arquivo do tipo LINK que contém só o <strong>caminho</strong> do arquivo original.</td></tr>
  <tr><td>Remoção do original</td><td>O dono remove sua entrada, o contador cai para 1 e o arquivo continua existindo; o dono ainda é "cobrado" pelo arquivo.</td><td>O arquivo some e a ligação fica <strong>apontando para nada</strong>.</td></tr>
  <tr><td>Custo</td><td>Nenhum extra no acesso.</td><td>É preciso ler o arquivo de link e percorrer o caminho; gasta um i-node a mais. Em compensação, liga arquivos de <strong>outras máquinas e outros sistemas de arquivos</strong>.</td></tr>
</table>
<p>Problema comum: um programa de backup pode copiar o mesmo arquivo duas vezes, uma por caminho.</p>

<h2>Journaling</h2>
<p>Remover um arquivo no UNIX exige três passos: (1) <strong>remover a entrada do diretório</strong>; (2) <strong>liberar o i-node</strong>; (3) <strong>devolver os blocos à lista de livres</strong>. Se o sistema cair no meio, o disco fica <strong>inconsistente</strong> (ex.: i-node liberado mas blocos não, que viram blocos perdidos). Um sistema de arquivos com <strong>journaling</strong> primeiro <strong>grava no disco um registro (log) do que vai fazer</strong>, depois executa as operações e, quando terminam, apaga o registro. Após uma queda, o sistema lê o log e <strong>refaz</strong> as operações pendentes. Para isso funcionar, as operações registradas precisam ser <strong>idempotentes</strong> (repetir não causa dano). Exemplos: <strong>NTFS</strong>, <strong>ext3</strong>, ReiserFS.</p>
<p>(Complemento: o <strong>VFS</strong>, sistema de arquivos virtual, é a camada que integra vários sistemas de arquivos diferentes sob uma mesma interface (open, read, write), chamando as funções de cada sistema de arquivos real.)</p>

<h2>Gerenciamento e otimização</h2>
<h3>Tamanho do bloco</h3>
<p>Bloco grande: arquivos pequenos <strong>desperdiçam espaço</strong> (um arquivo de 1 byte ocupa um bloco inteiro). Bloco pequeno: arquivos ocupam muitos blocos espalhados, com muitos seeks e <strong>desperdício de tempo</strong>. É um compromisso entre espaço e desempenho.</p>
<h3>Gerência de espaço livre</h3>
<ul>
  <li><strong>Lista encadeada de blocos livres</strong>: blocos do próprio disco guardam números de blocos livres (com blocos de 1 KB e números de 32 bits, 255 por bloco mais o ponteiro para o próximo bloco da lista).</li>
  <li><strong>Mapa de bits</strong>: <strong>1 bit por bloco</strong> (livre ou ocupado). Ocupa menos espaço, exceto quando o disco está quase cheio, caso em que a lista é menor.</li>
</ul>
<p>Os sistemas também podem impor <strong>cotas de disco</strong> por usuário (limites flexível e estrito de blocos e de arquivos).</p>
<h3>Cópias de segurança (backup)</h3>
<p>Servem para recuperar de <strong>desastres</strong> (disco queimado, incêndio) e de <strong>erros do usuário</strong> (arquivo apagado). Decisões: copiar só o necessário (não copiar executáveis reinstaláveis nem /dev); <strong>cópia incremental</strong> (uma cópia completa periódica + só o que mudou desde a última); compactar ou não; copiar com o sistema em uso (snapshot); guardar as fitas fora do local. Estratégias: <strong>cópia física</strong> (copia todos os blocos do disco do 0 ao último: simples e rápida, mas copia blocos vazios e não permite restaurar um arquivo só) e <strong>cópia lógica</strong> (parte de diretórios e copia os arquivos e diretórios alterados desde uma data: permite incremental e restaurar arquivos individuais; é a mais usada).</p>
<h3>Consistência</h3>
<p>Após uma queda, um utilitário (<strong>fsck</strong> no UNIX, scandisk no Windows) verifica o sistema de arquivos. Na verificação de <strong>blocos</strong>, monta duas tabelas de contadores, "em uso" (percorrendo os i-nodes) e "livres" (percorrendo a lista ou o mapa):</p>
<table>
  <tr><th>Situação</th><th>Em uso / livre</th><th>Correção</th></tr>
  <tr><td>Consistente</td><td>1 e 0, ou 0 e 1</td><td>Nada a fazer.</td></tr>
  <tr><td>Bloco desaparecido (perdido)</td><td>0 e 0</td><td>Acrescentar à lista de livres.</td></tr>
  <tr><td>Duplicado na lista de livres</td><td>0 e 2</td><td>Reconstruir a lista de livres.</td></tr>
  <tr><td>Bloco em dois arquivos</td><td>2 e 0</td><td>Copiar o bloco para um bloco livre, dar a cópia a um dos arquivos e avisar o usuário.</td></tr>
</table>
<p>Na verificação de <strong>arquivos</strong>, conta-se quantas entradas de diretório apontam para cada i-node e compara-se com o contador de ligações do i-node. Contador maior que o real: o arquivo nunca seria liberado (desperdício). Contador menor: perigoso, pois o i-node seria liberado ainda em uso. Nos dois casos, corrige-se o contador.</p>
<h3>Desempenho</h3>
<ul>
  <li><strong>Cache de blocos</strong> (buffer cache): blocos do disco mantidos na memória, localizados por tabela hash e substituídos por um LRU modificado. Blocos críticos para a consistência (i-nodes, diretórios) são gravados logo. O UNIX grava os blocos modificados periodicamente (<code>sync</code> a cada 30 s); o MS-DOS usava <strong>escrita direta</strong> (write-through), gravando cada bloco modificado imediatamente.</li>
  <li><strong>Leitura antecipada</strong> de blocos (read-ahead): ao ler o bloco k de um arquivo lido sequencialmente, já traz o k + 1 para a cache.</li>
  <li><strong>Reduzir o movimento do braço</strong>: alocar próximos os blocos de um arquivo (mesmo cilindro), colocar os i-nodes no meio do disco ou dividir o disco em grupos de cilindros, cada um com seus i-nodes e blocos. A <strong>desfragmentação</strong> reagrupa os blocos dos arquivos.</li>
</ul>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>FAT</strong> é lista encadeada, só que com os ponteiros numa <strong>tabela na memória</strong>; o problema é o tamanho da tabela, proporcional ao <strong>disco</strong>. O i-node ocupa memória proporcional aos <strong>arquivos abertos</strong>.</li>
    <li>Só a <strong>alocação contígua</strong> sofre fragmentação externa.</li>
    <li>Hard link aponta para o <strong>i-node</strong>; link simbólico guarda o <strong>caminho</strong>. Apagar o original quebra só o simbólico.</li>
    <li>Journaling registra <strong>antes</strong> de fazer, e as operações devem ser <strong>idempotentes</strong>.</li>
    <li>No UNIX, os atributos ficam no <strong>i-node</strong>, não na entrada do diretório (que tem só nome + número do i-node).</li>
  </ul>
</div>
`,
  resumo: 'Os blocos de um arquivo podem ser alocados de forma contígua (rápida, mas com fragmentação externa), por lista encadeada (acesso aleatório lento), por FAT (ponteiros numa tabela na memória, proporcional ao disco) ou por i-nodes (atributos e endereços diretos e indiretos, com só os arquivos abertos na memória). Diretórios mapeiam nomes em blocos ou i-nodes; arquivos compartilhados usam hard links (mesmo i-node, com contador) ou links simbólicos (caminho). Journaling registra as operações antes de executá-las para recuperar quedas. O espaço livre é controlado por lista ou mapa de bits; backup (físico ou lógico, incremental), verificação de consistência (fsck) e cache de blocos, leitura antecipada e redução do movimento do braço completam a gerência.',
  questoes: [
    {
      id: 'm09-a06-q1',
      enunciado: 'Qual método de alocação sofre de <strong>fragmentação externa</strong>, mas tem o melhor desempenho de leitura sequencial?',
      alternativas: [
        { texto: 'Alocação contígua.', correta: true, explicacao: 'Correto. Os blocos do arquivo são consecutivos: um seek e o resto é leitura contínua. Mas a remoção de arquivos deixa lacunas que podem não caber arquivos novos, e compactar é caro.' },
        { texto: 'Alocação por lista encadeada.', correta: false, explicacao: 'Na lista encadeada qualquer bloco livre serve, então não há fragmentação externa. O problema dela é o acesso aleatório lento.' },
        { texto: 'FAT.', correta: false, explicacao: 'A FAT também usa qualquer bloco livre (é uma lista encadeada com os ponteiros numa tabela), sem fragmentação externa.' },
        { texto: 'i-nodes.', correta: false, explicacao: 'Com i-nodes os blocos podem ficar em qualquer lugar do disco; não há fragmentação externa.' },
      ],
    },
    {
      id: 'm09-a06-q2',
      enunciado: 'Pela FAT abaixo, o arquivo A começa no bloco 4. Quais blocos ele ocupa, em ordem?<br><code>FAT[2]=10, FAT[3]=11, FAT[4]=7, FAT[6]=3, FAT[7]=2, FAT[10]=12, FAT[11]=14, FAT[12]=−1, FAT[14]=−1</code>',
      alternativas: [
        { texto: '4, 7, 2, 10, 12', correta: true, explicacao: 'Correto. FAT[4]=7, FAT[7]=2, FAT[2]=10, FAT[10]=12 e FAT[12]=−1 (fim do arquivo). É o exemplo da Figura 4.10 do Tanenbaum.' },
        { texto: '4, 7, 2, 10, 12, 14', correta: false, explicacao: 'O −1 em FAT[12] marca o fim de A. O bloco 14 pertence ao arquivo B (6, 3, 11, 14).' },
        { texto: '4, 5, 6, 7, 8', correta: false, explicacao: 'Isso seria alocação contígua. Na FAT, o próximo bloco é o valor da entrada, não o bloco vizinho.' },
        { texto: '6, 3, 11, 14', correta: false, explicacao: 'Essa é a corrente do arquivo B, que começa no bloco 6.' },
      ],
    },
    {
      id: 'm09-a06-q3',
      enunciado: 'Um disco de <strong>20 GB</strong> usa blocos de <strong>4 KB</strong> e uma FAT com entradas de <strong>4 bytes</strong>. Quanta memória a FAT ocupa? (Use 1 GB = 2<sup>30</sup> B e 1 KB = 2<sup>10</sup> B.)',
      alternativas: [
        { texto: '20 MB', correta: true, explicacao: 'Correto. Número de blocos = 20 × 2³⁰ / 2¹² = 20 × 2¹⁸ = 5.242.880 blocos (5 M), um por entrada. 5 M entradas × 4 B = 20 MB. E fica tudo na memória o tempo todo.' },
        { texto: '5 MB', correta: false, explicacao: '5 M é o número de entradas (blocos). Cada entrada tem 4 bytes: 5 M × 4 B = 20 MB.' },
        { texto: '80 MB', correta: false, explicacao: 'Esse seria o resultado com blocos de 1 KB (20 M entradas × 4 B). Com blocos de 4 KB há 4 vezes menos entradas: 20 MB.' },
        { texto: '20 GB', correta: false, explicacao: 'Esse é o tamanho do disco. A FAT tem uma entrada pequena (4 B) por bloco de 4 KB, cerca de 1/1.024 do disco: 20 MB.' },
      ],
    },
    {
      id: 'm09-a06-q4',
      enunciado: 'Um i-node tem <strong>10 endereços diretos</strong> e <strong>1 endereço indireto simples</strong>. Blocos de <strong>1 KB</strong> e endereços de <strong>4 bytes</strong>. Qual o tamanho máximo de um arquivo?',
      alternativas: [
        { texto: '266 KB', correta: true, explicacao: 'Correto. Diretos: 10 blocos. O bloco indireto de 1.024 B guarda 1.024/4 = 256 endereços, ou seja, mais 256 blocos. Total 266 blocos × 1 KB = 266 KB.' },
        { texto: '11 KB', correta: false, explicacao: 'Você contou o indireto como se apontasse para um bloco de dados. Ele aponta para um bloco cheio de endereços (256), cada um de um bloco de dados.' },
        { texto: '1.034 KB', correta: false, explicacao: 'Você somou 1.024 endereços no bloco indireto, mas cada endereço tem 4 bytes: 1.024/4 = 256. Total 10 + 256 = 266 KB.' },
        { texto: '256 KB', correta: false, explicacao: 'Faltaram os 10 blocos diretos: 10 + 256 = 266 KB.' },
      ],
    },
    {
      id: 'm09-a06-q5',
      enunciado: 'Por que o esquema de <strong>i-nodes</strong> usa menos memória que a FAT em discos grandes?',
      alternativas: [
        { texto: 'Porque só os i-nodes dos arquivos abertos precisam estar na memória, enquanto a FAT inteira, proporcional ao disco, fica sempre carregada.', correta: true, explicacao: 'Correto. Com k arquivos abertos e i-nodes de n bytes, bastam k·n bytes, seja o disco de 10 GB ou de 1.000 GB.' },
        { texto: 'Porque o i-node guarda os dados do arquivo, dispensando os blocos.', correta: false, explicacao: 'O i-node guarda atributos e endereços de blocos; os dados continuam nos blocos de disco.' },
        { texto: 'Porque i-nodes usam alocação contígua.', correta: false, explicacao: 'Com i-nodes os blocos podem estar em qualquer lugar; o i-node lista os endereços deles.' },
        { texto: 'Porque i-nodes não precisam de blocos indiretos.', correta: false, explicacao: 'Arquivos grandes precisam de blocos indiretos. A economia vem de manter na memória apenas os i-nodes dos arquivos abertos.' },
      ],
    },
    {
      id: 'm09-a06-q6',
      enunciado: 'O usuário A cria um arquivo e o usuário B faz uma <strong>ligação estrita</strong> (hard link) para ele. Depois, A remove o arquivo do seu diretório. O que acontece?',
      alternativas: [
        { texto: 'O contador de ligações do i-node cai de 2 para 1 e o arquivo continua acessível por B.', correta: true, explicacao: 'Correto. As duas entradas apontam para o mesmo i-node; o arquivo só é apagado quando o contador chega a 0. Efeito colateral: A continua sendo o dono e é "cobrado" pelo arquivo.' },
        { texto: 'O arquivo é apagado e a entrada de B fica apontando para nada.', correta: false, explicacao: 'Isso acontece com a ligação simbólica, que guarda só o caminho. A ligação estrita aponta para o i-node, que continua existindo.' },
        { texto: 'O sistema impede a remoção enquanto houver ligações.', correta: false, explicacao: 'A remoção é permitida; ela só tira a entrada de A e decrementa o contador.' },
        { texto: 'B passa a ver uma cópia independente do arquivo.', correta: false, explicacao: 'Não há cópia: existe um único i-node e um único conjunto de blocos.' },
      ],
    },
    {
      id: 'm09-a06-q7',
      enunciado: 'Como funciona um sistema de arquivos com <strong>journaling</strong>?',
      alternativas: [
        { texto: 'Antes de executar as operações, grava um registro (log) delas no disco; após uma queda, refaz as operações registradas, que devem ser idempotentes.', correta: true, explicacao: 'Correto. Ex.: remover um arquivo exige tirar a entrada do diretório, liberar o i-node e devolver os blocos. Com o log, uma queda no meio não deixa o disco inconsistente. NTFS e ext3 usam journaling.' },
        { texto: 'Faz uma cópia de segurança completa do disco a cada operação.', correta: false, explicacao: 'Isso seria backup, e seria caríssimo. O journaling grava só a descrição das operações pendentes.' },
        { texto: 'Grava cada bloco em dois discos ao mesmo tempo.', correta: false, explicacao: 'Isso é espelhamento (RAID 1), que protege contra falha de disco, não contra queda no meio de uma operação.' },
        { texto: 'Executa as operações e só depois anota no log o que foi feito.', correta: false, explicacao: 'Se anotasse depois, uma queda no meio da operação não deixaria registro. O log é gravado antes.' },
      ],
    },
    {
      id: 'm09-a06-q8',
      enunciado: 'Na verificação de consistência de blocos, um bloco aparece com contador <strong>0 na tabela "em uso"</strong> e <strong>0 na tabela "livres"</strong>. Qual o problema e a correção?',
      alternativas: [
        { texto: 'Bloco desaparecido (perdido): não pertence a nenhum arquivo nem está livre; deve ser acrescentado à lista de livres.', correta: true, explicacao: 'Correto. Não causa dano, só desperdiça espaço. O verificador (fsck) o devolve à lista de blocos livres.' },
        { texto: 'Bloco duplicado em dois arquivos; deve ser copiado.', correta: false, explicacao: 'Bloco em dois arquivos aparece como 2 na tabela "em uso". A correção é copiá-lo para um bloco livre e avisar o usuário.' },
        { texto: 'Bloco duplicado na lista de livres; a lista deve ser reconstruída.', correta: false, explicacao: 'Isso aparece como 2 na tabela "livres" (possível com lista encadeada; com mapa de bits não ocorre).' },
        { texto: 'Situação consistente; nada a fazer.', correta: false, explicacao: 'Consistente é ter exatamente um 1: em uso (1/0) ou livre (0/1). Zero nas duas é inconsistente.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm09-a06-d1',
      enunciado: 'Compare a alocação contígua, a alocação por lista encadeada, a FAT e os i-nodes, citando uma vantagem e uma desvantagem de cada.',
      respostaModelo: `<p><strong>Contígua:</strong> cada arquivo ocupa blocos consecutivos. Vantagens: simples (guarda-se só o primeiro bloco e o tamanho) e leitura excelente (um seek). Desvantagem: fragmentação externa com a remoção de arquivos, e é preciso saber o tamanho final ao criar. Boa para CD-ROM.</p>
<p><strong>Lista encadeada:</strong> cada bloco aponta para o próximo. Vantagem: sem fragmentação externa; o diretório guarda só o primeiro bloco. Desvantagens: acesso aleatório lento (precisa ler os blocos anteriores) e o ponteiro ocupa espaço no bloco.</p>
<p><strong>FAT:</strong> os ponteiros ficam numa tabela na memória. Vantagem: bloco inteiro para dados e acesso aleatório seguindo a corrente na RAM, sem ler o disco. Desvantagem: a tabela inteira fica na memória e cresce com o disco (200 GB com blocos de 1 KB → 600 a 800 MB).</p>
<p><strong>i-nodes:</strong> cada arquivo tem uma estrutura com atributos e endereços dos blocos (diretos e indiretos). Vantagem: só os i-nodes dos arquivos abertos ficam na memória (k·n bytes). Desvantagem: número fixo de endereços no i-node, exigindo blocos indiretos para arquivos grandes, com acessos extras ao disco.</p>`,
      pontosChave: [
        'Contígua: leitura rápida e simples, mas fragmentação externa',
        'Lista encadeada: sem fragmentação, mas acesso aleatório lento',
        'FAT: ponteiros numa tabela na memória, mas a tabela é proporcional ao disco',
        'i-node: só os arquivos abertos na memória, com blocos indiretos para arquivos grandes',
      ],
    },
  ],
});
