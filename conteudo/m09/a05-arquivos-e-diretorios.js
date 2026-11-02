// Módulo 9, aula 5: arquivos (nomes, estrutura, tipos, acesso, atributos, operações) e diretórios.
SO1.registerLesson({
  id: 'm09-a05',
  titulo: 'Arquivos e diretórios',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §4.1 arquivos (p.159–166) e §4.2 diretórios (p.166–169)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: o arquivo de aço de um escritório.</strong> Cada <em>pasta</em> tem um nome na etiqueta e uma ficha grampeada na capa (quem criou, quando, quem pode ver): é o <strong>arquivo</strong> com seus <strong>atributos</strong>. As <em>gavetas</em> e <em>divisórias</em> organizam as pastas: são os <strong>diretórios</strong>. Para pedir uma pasta a alguém, você diz o caminho inteiro ("gaveta 2, divisória Clientes, pasta Silva") ou, se a pessoa já está na divisória certa, só "pasta Silva": caminho <strong>absoluto</strong> x <strong>relativo</strong>.</p>
</div>

<h2>Por que existem arquivos</h2>
<p>Os programas precisam (1) guardar muita informação, (2) que ela <strong>sobreviva</strong> ao término do processo e (3) que vários processos a acessem ao mesmo tempo. A solução é o <strong>arquivo</strong>: uma abstração do SO que esconde do usuário onde e como os dados ficam no disco (setores, trilhas). A parte do SO que trata dos arquivos é o <strong>sistema de arquivos</strong>.</p>

<h2>Nomes</h2>
<ul>
  <li>Em geral, cadeias de até 255 caracteres (o MS-DOS antigo aceitava só 1 a 8 caracteres + extensão de até 3, o formato "8.3").</li>
  <li>O UNIX <strong>diferencia maiúsculas e minúsculas</strong> (<code>Prova</code> ≠ <code>prova</code>); o MS-DOS/Windows não.</li>
  <li><strong>Extensão</strong> (<code>.c</code>, <code>.pdf</code>, <code>.zip</code>): no UNIX é só uma <em>convenção</em> que o SO não impõe (quem liga é o programa, ex.: o compilador C exige <code>.c</code>); no Windows o SO conhece as extensões e associa cada uma a um programa.</li>
</ul>

<h2>Estrutura</h2>
<table>
  <tr><th>Estrutura</th><th>Como é</th><th>Uso</th></tr>
  <tr><td><strong>Sequência de bytes</strong></td><td>O SO não sabe nem se importa com o conteúdo; o significado é dado pelo programa.</td><td>UNIX e Windows: flexibilidade máxima.</td></tr>
  <tr><td><strong>Sequência de registros</strong></td><td>Registros de tamanho fixo; read devolve um registro.</td><td>Mainframes antigos (cartões de 80 colunas).</td></tr>
  <tr><td><strong>Árvore</strong></td><td>Registros com um campo-chave, organizados em árvore para busca rápida pela chave.</td><td>Alguns mainframes de processamento comercial.</td></tr>
</table>

<h2>Tipos de arquivo</h2>
<ul>
  <li><strong>Arquivos regulares</strong>: contêm dados do usuário. Podem ser <strong>ASCII</strong> (linhas de texto, legíveis e editáveis em qualquer editor) ou <strong>binários</strong> (estrutura interna conhecida só pelos programas que os usam; ex.: executável, com cabeçalho e número mágico).</li>
  <li><strong>Diretórios</strong>: arquivos do sistema que mantêm a estrutura do sistema de arquivos.</li>
  <li><strong>Arquivos especiais de caractere</strong>: modelam dispositivos de E/S seriais (terminal, impressora, rede).</li>
  <li><strong>Arquivos especiais de bloco</strong>: modelam discos.</li>
</ul>

<h2>Acesso: sequencial x aleatório</h2>
<ul>
  <li><strong>Acesso sequencial</strong>: lê os bytes ou registros em ordem, do início, sem pular; pode-se voltar ao início (rebobinar). Era o natural nas fitas magnéticas.</li>
  <li><strong>Acesso aleatório</strong> (direto): lê em qualquer ordem, por chave ou posição. Essencial para bancos de dados (consultar a reserva de um voo sem ler todas as outras). Duas formas: cada <code>read</code> informa a posição, ou a operação <strong><code>seek</code></strong> posiciona e depois lê-se sequencialmente a partir dali (UNIX e Windows).</li>
</ul>

<h2>Atributos (metadados)</h2>
<p>Além do nome e dos dados, o SO guarda informações sobre cada arquivo:</p>
<table>
  <tr><th>Grupo</th><th>Exemplos</th></tr>
  <tr><td>Proteção</td><td>Quem pode acessar e como; senha; criador; proprietário</td></tr>
  <tr><td>Flags</td><td>Somente leitura; oculto; sistema; arquivamento (já tem backup?); ASCII/binário; acesso aleatório; temporário; bloqueio</td></tr>
  <tr><td>Registros</td><td>Tamanho do registro; posição e tamanho da chave</td></tr>
  <tr><td>Tempos</td><td>Criação; último acesso; última modificação</td></tr>
  <tr><td>Tamanho</td><td>Tamanho atual; tamanho máximo</td></tr>
</table>

<h2>Operações (chamadas de sistema)</h2>
<p><strong>create</strong> (cria vazio, define atributos) · <strong>delete</strong> (libera o espaço) · <strong>open</strong> (traz atributos e endereços do disco para a memória, para acesso rápido) · <strong>close</strong> (libera essas estruturas da memória; força a escrita do último bloco) · <strong>read</strong> e <strong>write</strong> (a partir da posição atual) · <strong>append</strong> (escreve no final) · <strong>seek</strong> (reposiciona, no acesso aleatório) · <strong>get attributes</strong> e <strong>set attributes</strong> · <strong>rename</strong>.</p>

<h2>Diretórios</h2>
<h3>Nível único</h3>
<p>Um só diretório (o <strong>diretório-raiz</strong>) contém todos os arquivos. Simples e rápido de procurar, foi usado nos primeiros computadores pessoais e ainda aparece em câmeras digitais e tocadores de música. Problema: com vários usuários, dois podem escolher o mesmo nome (ex.: <code>mailbox</code>) e um sobrescreve o do outro; e não há como agrupar arquivos por assunto.</p>
<h3>Hierárquico (árvore)</h3>
<p>Diretórios contêm arquivos e outros diretórios (subdiretórios), formando uma <strong>árvore</strong>. Cada usuário pode ter seu diretório e organizar os arquivos como quiser. É o que todos os SOs modernos usam.</p>

<figure class="diagrama">
  <svg viewBox="0 0 460 250" style="max-width:600px" role="img" aria-label="Árvore de diretórios com raiz, bin, usr e home; usr contém ast e jim; ast contém correio e livros; jim contém notas.txt">
    <g stroke="currentColor" fill="none">
      <path d="M230 38 L80 88 M230 38 L230 88 M230 38 L380 88"/>
      <path d="M230 112 L150 158 M230 112 L320 158"/>
      <path d="M150 182 L90 218 M150 182 L200 218"/>
      <path d="M320 182 L320 218"/>
    </g>
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <rect x="205" y="14" width="50" height="24" rx="5" style="fill:var(--azul-claro);stroke:var(--azul)"/><text x="230" y="31">/</text>
      <rect x="55" y="88" width="50" height="24" rx="5" fill="none" stroke="currentColor"/><text x="80" y="105">bin</text>
      <rect x="205" y="88" width="50" height="24" rx="5" fill="none" stroke="currentColor"/><text x="230" y="105">usr</text>
      <rect x="350" y="88" width="60" height="24" rx="5" fill="none" stroke="currentColor"/><text x="380" y="105">home</text>
      <rect x="125" y="158" width="50" height="24" rx="5" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/><text x="150" y="175">ast</text>
      <rect x="295" y="158" width="50" height="24" rx="5" fill="none" stroke="currentColor"/><text x="320" y="175">jim</text>
      <text x="90" y="232">correio</text>
      <text x="200" y="232">livros</text>
      <text x="320" y="232">notas.txt</text>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="10" y="150" style="fill:var(--verde)" font-weight="bold">diretório de trabalho</text>
      <text x="10" y="164" style="fill:var(--verde)">= /usr/ast</text>
      <text x="270" y="30">raiz</text>
      <text x="10" y="248">retângulos = diretórios; texto solto = arquivos</text>
    </g>
  </svg>
  <figcaption>Sistema de diretórios hierárquico. O nome absoluto de <code>notas.txt</code> é <code>/usr/jim/notas.txt</code>; a partir de <code>/usr/ast</code>, o nome relativo é <code>../jim/notas.txt</code>.</figcaption>
</figure>

<h3>Nomes de caminho</h3>
<ul>
  <li><strong>Caminho absoluto</strong>: do diretório-raiz até o arquivo; começa com o separador (<code>/usr/ast/correio</code> no UNIX, <code>\\usr\\ast\\correio</code> no Windows). É <strong>único</strong> e funciona de qualquer lugar.</li>
  <li><strong>Caminho relativo</strong>: a partir do <strong>diretório de trabalho</strong> (diretório atual) do processo; não começa com o separador. Com o diretório de trabalho <code>/usr/ast</code>, <code>correio</code> é o mesmo que <code>/usr/ast/correio</code>.</li>
  <li>Entradas especiais: <strong><code>.</code></strong> (o próprio diretório) e <strong><code>..</code></strong> (o diretório pai; na raiz, <code>..</code> aponta para ela mesma).</li>
</ul>
<h3>Operações sobre diretórios</h3>
<p><strong>create</strong> (cria vazio, só com <code>.</code> e <code>..</code>) · <strong>delete</strong> (só se estiver vazio) · <strong>opendir</strong> · <strong>closedir</strong> · <strong>readdir</strong> (devolve a próxima entrada, independentemente da estrutura interna) · <strong>rename</strong> · <strong>link</strong> (faz um arquivo aparecer em mais de um diretório; ligação estrita) · <strong>unlink</strong> (remove a entrada; se for a única, o arquivo é apagado).</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: navegando na árvore da figura.</strong></p>
  <table>
    <tr><th>Passo</th><th>Diretório de trabalho</th><th>Nome usado</th><th>Arquivo/diretório alcançado</th></tr>
    <tr><td>1</td><td>/usr/ast</td><td><code>correio</code> (relativo)</td><td>/usr/ast/correio</td></tr>
    <tr><td>2</td><td>/usr/ast</td><td><code>/usr/ast/correio</code> (absoluto)</td><td>o mesmo arquivo: o absoluto ignora o diretório de trabalho</td></tr>
    <tr><td>3</td><td>/usr/ast</td><td><code>../jim/notas.txt</code></td><td><code>..</code> sobe para /usr, depois desce para jim: /usr/jim/notas.txt</td></tr>
    <tr><td>4</td><td>/usr/ast</td><td><code>./livros</code></td><td><code>.</code> é o próprio /usr/ast: /usr/ast/livros</td></tr>
    <tr><td>5</td><td>/usr/jim (após <code>cd ../jim</code>)</td><td><code>correio</code></td><td>/usr/jim/correio, que <strong>não existe</strong>: o relativo depende de onde se está</td></tr>
  </table>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>Caminho absoluto começa na <strong>raiz</strong> (com <code>/</code>); relativo começa no <strong>diretório de trabalho</strong>.</li>
    <li>No UNIX a <strong>extensão é convenção</strong>, não regra do SO; e os nomes diferenciam maiúsculas de minúsculas.</li>
    <li>Diretório <strong>também é arquivo</strong> (do sistema). Arquivos especiais de bloco e de caractere representam <strong>dispositivos</strong>.</li>
    <li><code>seek</code> é operação do <strong>acesso aleatório</strong>; acesso sequencial não pula posições.</li>
    <li><code>open</code> existe para trazer os atributos e endereços do arquivo para a memória antes das leituras, não para ler o conteúdo.</li>
  </ul>
</div>
`,
  resumo: 'Arquivo é a abstração do SO para guardar informação persistente e compartilhada. Tem nome (com extensão, que no UNIX é só convenção), estrutura (em geral sequência de bytes), tipo (regular ASCII ou binário, diretório, especial de caractere ou de bloco), acesso sequencial ou aleatório (com seek), atributos (proteção, flags, tempos, tamanho) e operações como create, open, read, write, seek e close. Diretórios podem ser de nível único ou hierárquicos; no hierárquico, um arquivo é nomeado por caminho absoluto (a partir da raiz) ou relativo (a partir do diretório de trabalho, com . e ..).',
  questoes: [
    {
      id: 'm09-a05-q1',
      enunciado: 'O diretório de trabalho de um processo é <code>/usr/ast</code>. A qual arquivo se refere o caminho <code>../jim/notas.txt</code>?',
      alternativas: [
        { texto: '/usr/jim/notas.txt', correta: true, explicacao: 'Correto. ".." sobe de /usr/ast para /usr; depois desce para jim e chega a notas.txt: /usr/jim/notas.txt.' },
        { texto: '/usr/ast/jim/notas.txt', correta: false, explicacao: 'Isso seria o caminho "jim/notas.txt" (sem o ".."). O ".." leva ao diretório pai antes de descer.' },
        { texto: '/jim/notas.txt', correta: false, explicacao: 'Seria preciso subir dois níveis ("../../jim/notas.txt"). Um único ".." vai de /usr/ast só até /usr.' },
        { texto: 'Caminho inválido, pois caminhos relativos não podem usar "..".', correta: false, explicacao: 'O ".." é exatamente uma entrada especial de diretório para escrever caminhos relativos que sobem na árvore.' },
      ],
    },
    {
      id: 'm09-a05-q2',
      enunciado: 'Qual a diferença entre <strong>caminho absoluto</strong> e <strong>caminho relativo</strong>?',
      alternativas: [
        { texto: 'O absoluto parte do diretório-raiz e é único; o relativo parte do diretório de trabalho do processo.', correta: true, explicacao: 'Correto. /usr/ast/correio funciona de qualquer lugar; "correio" só chega ao mesmo arquivo se o diretório de trabalho for /usr/ast.' },
        { texto: 'O absoluto inclui a extensão do arquivo e o relativo não.', correta: false, explicacao: 'A extensão faz parte do nome do arquivo nos dois casos. A diferença é o ponto de partida do caminho.' },
        { texto: 'O absoluto só existe no Windows e o relativo no UNIX.', correta: false, explicacao: 'Os dois sistemas têm ambos; muda só o separador (/ no UNIX, \\ no Windows).' },
        { texto: 'O relativo parte do diretório-raiz e o absoluto do diretório de trabalho.', correta: false, explicacao: 'Está invertido. Absoluto = desde a raiz; relativo = desde o diretório de trabalho.' },
      ],
    },
    {
      id: 'm09-a05-q3',
      enunciado: 'Um banco de dados de reservas aéreas precisa ler o registro de um voo específico sem ler todos os anteriores. Que tipo de acesso e que operação ele usa?',
      alternativas: [
        { texto: 'Acesso aleatório, posicionando com seek antes de ler.', correta: true, explicacao: 'Correto. No acesso aleatório os bytes podem ser lidos em qualquer ordem; no UNIX e no Windows, seek ajusta a posição atual e o read lê dali.' },
        { texto: 'Acesso sequencial, lendo do início até achar o registro.', correta: false, explicacao: 'Funcionaria, mas é justamente o que se quer evitar. O acesso sequencial obriga a ler tudo que vem antes.' },
        { texto: 'Acesso sequencial com append.', correta: false, explicacao: 'Append só acrescenta dados ao final do arquivo; não serve para ler um registro no meio.' },
        { texto: 'Acesso por rename.', correta: false, explicacao: 'Rename só muda o nome do arquivo; não é uma forma de acesso aos dados.' },
      ],
    },
    {
      id: 'm09-a05-q4',
      enunciado: 'No UNIX, o que representa um <strong>arquivo especial de bloco</strong>?',
      alternativas: [
        { texto: 'Um dispositivo de bloco, como um disco.', correta: true, explicacao: 'Correto. Arquivos especiais permitem tratar dispositivos com as mesmas operações dos arquivos: os de bloco modelam discos e os de caractere modelam terminais, impressoras e rede.' },
        { texto: 'Um arquivo regular binário, como um executável.', correta: false, explicacao: 'Executáveis são arquivos regulares binários, não arquivos especiais.' },
        { texto: 'Um diretório com muitos arquivos.', correta: false, explicacao: 'Diretório é outro tipo de arquivo do sistema. Arquivos especiais representam dispositivos de E/S.' },
        { texto: 'Um arquivo de texto ASCII dividido em linhas.', correta: false, explicacao: 'Esse é o arquivo regular ASCII.' },
      ],
    },
    {
      id: 'm09-a05-q5',
      enunciado: 'Qual é o principal problema de um sistema de <strong>diretório em nível único</strong> usado por vários usuários?',
      alternativas: [
        { texto: 'Dois usuários podem escolher o mesmo nome de arquivo, e um sobrescreve o arquivo do outro.', correta: true, explicacao: 'Correto. Com um só diretório para todos, os nomes disputam o mesmo espaço. Também não há como agrupar arquivos. O diretório hierárquico resolve os dois problemas.' },
        { texto: 'A busca por um arquivo é muito mais lenta que numa árvore.', correta: false, explicacao: 'Pelo contrário: a simplicidade e a rapidez de localização são as vantagens do nível único. O problema é o conflito de nomes.' },
        { texto: 'Não permite arquivos com extensão.', correta: false, explicacao: 'A extensão faz parte do nome e independe da organização dos diretórios.' },
        { texto: 'Exige caminhos absolutos muito longos.', correta: false, explicacao: 'Com nível único não há caminhos: todo arquivo está direto na raiz. Caminhos longos são consequência da hierarquia.' },
      ],
    },
    {
      id: 'm09-a05-q6',
      enunciado: 'Qual afirmação sobre <strong>extensões</strong> de arquivos está correta?',
      alternativas: [
        { texto: 'No UNIX a extensão é uma convenção que o SO não impõe; no Windows o SO associa cada extensão a um programa.', correta: true, explicacao: 'Correto. No UNIX quem se importa com a extensão é o programa (o compilador C espera .c); no Windows o SO usa a extensão para escolher o programa que abre o arquivo.' },
        { texto: 'Em todos os SOs a extensão define o conteúdo do arquivo e não pode ser alterada.', correta: false, explicacao: 'Renomear "foto.jpg" para "foto.txt" não muda o conteúdo. A extensão é só parte do nome.' },
        { texto: 'O UNIX exige exatamente 3 caracteres de extensão.', correta: false, explicacao: 'O limite de 3 caracteres era do MS-DOS (formato 8.3). O UNIX nem exige extensão.' },
        { texto: 'A extensão é um atributo guardado separadamente, fora do nome.', correta: false, explicacao: 'A extensão é parte do nome do arquivo, depois do ponto.' },
      ],
    },
    {
      id: 'm09-a05-q7',
      enunciado: 'Para que serve a chamada <strong>open</strong> antes de ler um arquivo?',
      alternativas: [
        { texto: 'Para o sistema trazer para a memória os atributos e a lista de endereços de disco do arquivo, agilizando os acessos seguintes.', correta: true, explicacao: 'Correto. Abrir evita procurar o arquivo no disco a cada read. O close libera essas estruturas da memória.' },
        { texto: 'Para copiar todo o conteúdo do arquivo para a memória.', correta: false, explicacao: 'O conteúdo é lido sob demanda pelos reads. O open busca só as informações para localizar os dados.' },
        { texto: 'Para criar o arquivo, caso ele não exista.', correta: false, explicacao: 'Criar é a operação create. (Algumas APIs combinam as duas com uma opção, mas são operações distintas.)' },
        { texto: 'Para posicionar a leitura no fim do arquivo.', correta: false, explicacao: 'Posicionar é tarefa do seek (ou o efeito do append, na escrita).' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm09-a05-d1',
      enunciado: 'O que é um arquivo para o sistema operacional? Cite os tipos de arquivo, as formas de acesso e pelo menos quatro atributos. Explique também a diferença entre caminho absoluto e relativo.',
      respostaModelo: `<p><strong>Arquivo</strong> é a abstração do SO para guardar informação de forma persistente (sobrevive ao processo) e compartilhável, escondendo os detalhes do disco. Em geral é uma sequência de bytes cujo significado é dado pelos programas.</p>
<p><strong>Tipos:</strong> regulares (ASCII ou binários), diretórios (mantêm a estrutura do sistema de arquivos), especiais de caractere (dispositivos seriais) e especiais de bloco (discos).</p>
<p><strong>Acesso:</strong> sequencial (em ordem, desde o início) ou aleatório (em qualquer ordem, posicionando com seek; essencial para bancos de dados).</p>
<p><strong>Atributos:</strong> proteção, proprietário, criador, flags (somente leitura, oculto, sistema, arquivamento), tempos de criação, último acesso e última modificação, tamanho atual e máximo.</p>
<p><strong>Caminhos:</strong> o absoluto parte da raiz (<code>/usr/ast/correio</code>) e é único; o relativo parte do diretório de trabalho do processo (<code>correio</code>, se o diretório de trabalho for <code>/usr/ast</code>), podendo usar <code>.</code> e <code>..</code>.</p>`,
      pontosChave: [
        'Definiu arquivo como abstração para armazenamento persistente que esconde os detalhes do disco',
        'Citou os tipos: regular (ASCII/binário), diretório, especial de caractere e de bloco',
        'Diferenciou acesso sequencial de aleatório (seek)',
        'Citou pelo menos quatro atributos corretos',
        'Diferenciou caminho absoluto (raiz) de relativo (diretório de trabalho)',
      ],
    },
  ],
});
