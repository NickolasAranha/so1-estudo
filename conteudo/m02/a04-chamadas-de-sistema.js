// Módulo 2, aula 4: chamadas de sistema (trap, os passos de read, POSIX e Win32).
SO1.registerLesson({
  id: 'm02-a04',
  titulo: 'Chamadas de sistema',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §1.6 Chamadas de sistema (p.29–37): Fig. 1.17 (11 passos de read), Tabela 1.1 (POSIX), §1.6.5 API Win32 e Tabela 1.2',
    'Tanenbaum, SO Modernos 3ª ed., §1.3.1 (p.13: instrução TRAP) e §1.7.1 (p.38: estrutura de uma chamada no sistema monolítico)',
    'Slides cap1 (Oliveira/Carissimi/Toscani, UFRGS): chamadas de sistema, SO na visão do usuário e de projeto',
    'Slides cap2 (Oliveira/Carissimi/Toscani, UFRGS): proteção de periféricos (2) e princípio de chamada de sistema',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: o guichê do cartório.</strong> Você não entra no arquivo do cartório para pegar a sua certidão. Preenche um formulário padronizado (qual serviço, seus dados), entrega no guichê e espera. O funcionário confere se está tudo certo, busca o documento e devolve. Se faltar um dado, recebe o formulário de volta com o motivo.</p>
  <p>O formulário é a <strong>chamada de sistema</strong>; o guichê é a <strong>instrução TRAP</strong>, a única porta de entrada para a área restrita; o funcionário é o <strong>núcleo</strong>.</p>
</div>

<h2>O que é uma chamada de sistema</h2>
<p><strong>Chamada de sistema</strong> (<em>system call</em>) é a <strong>maneira pela qual os programas solicitam serviços ao sistema operacional</strong>. Ela é <strong>análoga a uma chamada de sub-rotina</strong>, mas o serviço é executado pelo <strong>núcleo (kernel)</strong>. Os serviços se agrupam em gerência do processador (processos), de memória, de arquivos e de E/S.</p>
<p>Por que não chamar o código do SO diretamente? Porque o programa roda em <strong>modo usuário</strong> e as operações de E/S, de proteção etc. são <strong>privilegiadas</strong> (Aula 2). A chamada de sistema é a única porta controlada para o modo núcleo: ela usa uma <strong>interrupção de software (trap)</strong>, e o SO então:</p>
<ol>
  <li>identifica o serviço requisitado;</li>
  <li>verifica a validade dos parâmetros;</li>
  <li>executa o serviço;</li>
  <li>retorna ao processo do usuário.</li>
</ol>

<h2>A instrução TRAP x uma chamada de rotina comum</h2>
<p>Para o programa, uma chamada de sistema parece uma chamada de rotina. Mas a instrução <strong>TRAP</strong> difere da instrução CALL comum em dois pontos fundamentais:</p>
<table>
  <tr><th></th><th>Chamada de rotina (CALL)</th><th>Chamada de sistema (TRAP)</th></tr>
  <tr><td><strong>Modo da CPU</strong></td><td>Não muda: continua em modo usuário.</td><td>Muda para <strong>modo núcleo</strong>, como efeito colateral.</td></tr>
  <tr><td><strong>Destino</strong></td><td>Qualquer endereço escolhido pelo programa.</td><td>Um <strong>local fixo</strong> do SO, obtido de uma tabela (o programa não pode escolher um endereço arbitrário dentro do núcleo).</td></tr>
</table>
<p>Além disso, a chamada de sistema pode <strong>bloquear</strong> quem a fez: se um processo pede para ler do teclado e nada foi digitado, ele fica Bloqueado e o SO executa outro processo até a entrada chegar.</p>

<h2>Os 11 passos de <code>read(fd, buffer, nbytes)</code></h2>
<p>Em C, a chamada é feita pela <strong>rotina de biblioteca</strong> de mesmo nome: <code>contador = read(fd, buffer, nbytes);</code> (fd = arquivo, buffer = onde colocar os dados, nbytes = quantos ler). Ela devolve o número de bytes realmente lidos; em caso de erro devolve <strong>−1</strong> e coloca o código do erro na variável global <strong>errno</strong>.</p>

<figure class="diagrama">
  <svg viewBox="0 0 520 360" style="max-width:640px" role="img" aria-label="Os 11 passos da chamada read: empilhar parâmetros, chamar a biblioteca, colocar o número no registrador, TRAP, despacho, tratador, retorno">
    <defs>
      <marker id="m02a04-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
      </marker>
    </defs>
    <rect x="10" y="10" width="500" height="250" rx="8" style="fill:var(--verde-claro);stroke:var(--verde)"/>
    <rect x="10" y="270" width="500" height="80" rx="8" style="fill:var(--azul-claro);stroke:var(--azul)"/>
    <g font-size="12" fill="currentColor">
      <text x="20" y="30" font-weight="bold" style="fill:var(--verde)">Espaço do usuário (modo usuário)</text>
      <text x="20" y="290" font-weight="bold" style="fill:var(--azul)">Espaço do núcleo (modo núcleo)</text>
    </g>
    <g font-size="12" fill="currentColor">
      <rect x="40" y="45" width="230" height="95" rx="6" style="fill:var(--cartao)" stroke="currentColor"/>
      <text x="50" y="62" font-weight="bold">Rotina read da biblioteca</text>
      <text x="50" y="82">⑤ põe o nº da chamada no registrador</text>
      <text x="50" y="102">⑥ TRAP para o núcleo</text>
      <text x="50" y="122">⑩ retorna a quem chamou</text>
      <rect x="40" y="160" width="230" height="90" rx="6" style="fill:var(--cartao)" stroke="currentColor"/>
      <text x="50" y="177" font-weight="bold">Programa do usuário</text>
      <text x="50" y="195">①②③ empilha nbytes, &amp;buffer, fd</text>
      <text x="50" y="213">④ chama read (CALL comum)</text>
      <text x="50" y="231">⑪ incrementa SP (limpa a pilha)</text>
      <rect x="60" y="305" width="110" height="34" rx="6" style="fill:var(--cartao)" stroke="currentColor"/>
      <text x="115" y="327" text-anchor="middle">Despacho</text>
      <rect x="300" y="305" width="190" height="34" rx="6" style="fill:var(--cartao)" stroke="currentColor"/>
      <text x="395" y="321" text-anchor="middle">Rotina de tratamento</text>
      <text x="395" y="334" text-anchor="middle">da chamada read</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M150 160 V144" marker-end="url(#m02a04-seta)"/>
      <path d="M40 102 H24 V322 H56" style="stroke:var(--ambar)" stroke-width="2" marker-end="url(#m02a04-seta)"/>
      <path d="M170 322 H296" marker-end="url(#m02a04-seta)"/>
      <path d="M440 302 V95 H274" marker-end="url(#m02a04-seta)"/>
      <path d="M230 140 V156" marker-end="url(#m02a04-seta)"/>
    </g>
    <g font-size="12" fill="currentColor">
      <text x="156" y="155">④</text>
      <text x="30" y="257" style="fill:var(--ambar)" font-weight="bold">⑥ TRAP</text>
      <text x="200" y="316">⑦ tabela</text>
      <text x="448" y="200">⑧ executa</text>
      <text x="448" y="216">⑨ volta à</text>
      <text x="448" y="232">biblioteca</text>
      <text x="236" y="153">⑩</text>
    </g>
  </svg>
  <figcaption>Adaptado da Fig. 1.17 do Tanenbaum. Só o passo ⑥ (TRAP) cruza a fronteira usuário → núcleo; o passo ⑨ devolve o controle ao espaço do usuário.</figcaption>
</figure>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: os 11 passos de <code>read(fd, buffer, nbytes)</code>.</strong></p>
  <table>
    <tr><th>Passo</th><th>Quem</th><th>O que acontece</th><th>Modo</th></tr>
    <tr><td>1–3</td><td>Programa</td><td>Empilha os parâmetros (em ordem inversa: nbytes, &amp;buffer, fd). O buffer é passado por referência (o endereço).</td><td>Usuário</td></tr>
    <tr><td>4</td><td>Programa</td><td>Chama a rotina <code>read</code> da biblioteca (chamada de rotina normal).</td><td>Usuário</td></tr>
    <tr><td>5</td><td>Biblioteca</td><td>Coloca o <strong>número da chamada de sistema</strong> num local esperado pelo SO (um registrador).</td><td>Usuário</td></tr>
    <tr><td>6</td><td>Biblioteca</td><td>Executa a instrução <strong>TRAP</strong>: a CPU passa para <strong>modo núcleo</strong> e desvia para um endereço fixo do núcleo.</td><td>Usuário → <strong>Núcleo</strong></td></tr>
    <tr><td>7</td><td>Núcleo (despacho)</td><td>Verifica o número da chamada e consulta a <strong>tabela de ponteiros</strong> para as rotinas de tratamento, indexada por esse número.</td><td>Núcleo</td></tr>
    <tr><td>8</td><td>Núcleo</td><td>Executa a <strong>rotina de tratamento</strong> da chamada (a leitura propriamente dita). Se o dado ainda não estiver disponível, o processo pode ser bloqueado aqui.</td><td>Núcleo</td></tr>
    <tr><td>9</td><td>Núcleo</td><td>Terminado o serviço, devolve o controle à rotina de biblioteca, na instrução seguinte ao TRAP.</td><td>Núcleo → Usuário</td></tr>
    <tr><td>10</td><td>Biblioteca</td><td>Retorna ao programa do usuário, como em qualquer retorno de rotina.</td><td>Usuário</td></tr>
    <tr><td>11</td><td>Programa</td><td>Limpa a pilha (incrementa o ponteiro de pilha) para remover os parâmetros. Segue a execução.</td><td>Usuário</td></tr>
  </table>
</div>

<h2>Principais chamadas POSIX</h2>
<p>O padrão <strong>POSIX</strong> (seguido por UNIX, Linux, BSD, MINIX 3) tem <strong>cerca de cem</strong> chamadas de rotina. Algumas das mais importantes (Tabela 1.1 do Tanenbaum):</p>
<table>
  <tr><th>Grupo</th><th>Chamadas</th><th>O que fazem</th></tr>
  <tr><td><strong>Gerenciamento de processos</strong></td><td><code>fork</code>, <code>waitpid</code>, <code>execve</code>, <code>exit</code></td><td>Cria um filho idêntico ao pai; espera um filho terminar; substitui a imagem do processo por outro programa; termina e devolve o status.</td></tr>
  <tr><td><strong>Gerenciamento de arquivos</strong></td><td><code>open</code>, <code>close</code>, <code>read</code>, <code>write</code>, <code>lseek</code>, <code>stat</code></td><td>Abre e fecha arquivo; lê e escreve com um buffer; move o ponteiro do arquivo; obtém informações do arquivo.</td></tr>
  <tr><td><strong>Diretórios e sistema de arquivos</strong></td><td><code>mkdir</code>, <code>rmdir</code>, <code>link</code>, <code>unlink</code>, <code>mount</code>, <code>umount</code></td><td>Cria e remove diretório (vazio); cria e remove entrada de diretório; monta e desmonta um sistema de arquivos.</td></tr>
  <tr><td><strong>Diversas</strong></td><td><code>chdir</code>, <code>chmod</code>, <code>kill</code>, <code>time</code></td><td>Muda o diretório de trabalho; muda os bits de proteção; envia um sinal a um processo; obtém o tempo desde 1º/1/1970.</td></tr>
</table>
<p>Um exemplo clássico é o <strong>shell</strong>: ele lê um comando, faz <code>fork</code> para criar um filho; o filho faz <code>execve</code> para executar o programa pedido, e o pai faz <code>waitpid</code> para esperar o filho terminar (com <code>exit</code>).</p>
<pre class="codigo"><code>while (TRUE) {                       /* repete para sempre */
  type_prompt();                     /* mostra o prompt na tela */
  read_command(command, parameters); /* lê o comando do terminal */
  if (fork() != 0) {                 /* cria o processo filho */
    waitpid(-1, &amp;status, 0);         /* pai: espera o filho terminar */
  } else {
    execve(command, parameters, 0);  /* filho: executa o comando */
  }
}</code></pre>

<h2>A API Win32 do Windows</h2>
<p>No UNIX, há uma relação quase 1 para 1 entre a rotina de biblioteca e a chamada de sistema. No Windows é diferente: a Microsoft definiu a <strong>API Win32</strong> (<em>application program interface</em>), um conjunto de rotinas para acessar os serviços do SO, <strong>desacoplado das chamadas reais</strong>. Ela tem <strong>milhares</strong> de rotinas; algumas fazem chamadas de sistema, outras rodam inteiramente no espaço do usuário, e isso pode mudar de versão para versão. Correspondências aproximadas (Tabela 1.2):</p>
<table>
  <tr><th>UNIX (POSIX)</th><th>Win32</th><th>Observação</th></tr>
  <tr><td><code>fork</code> + <code>execve</code></td><td><code>CreateProcess</code></td><td>Cria um novo processo (faz o papel dos dois). O Windows não tem hierarquia pai/filho.</td></tr>
  <tr><td><code>waitpid</code></td><td><code>WaitForSingleObject</code></td><td>Espera um processo (ou outro evento).</td></tr>
  <tr><td><code>exit</code></td><td><code>ExitProcess</code></td><td>Termina a execução.</td></tr>
  <tr><td><code>open</code> / <code>close</code></td><td><code>CreateFile</code> / <code>CloseHandle</code></td><td>Cria ou abre arquivo / fecha.</td></tr>
  <tr><td><code>read</code> / <code>write</code></td><td><code>ReadFile</code> / <code>WriteFile</code></td><td>Lê / escreve dados.</td></tr>
  <tr><td><code>mkdir</code> / <code>unlink</code></td><td><code>CreateDirectory</code> / <code>DeleteFile</code></td><td>Cria diretório / remove arquivo.</td></tr>
  <tr><td><code>link</code>, <code>mount</code>, <code>chmod</code>, <code>kill</code></td><td>(nenhuma)</td><td>Win32 não tem equivalente direto.</td></tr>
</table>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Chamada de sistema não é o mesmo que interrupção</strong>: a chamada é o <em>pedido de serviço</em> feito pelo programa; o <em>mecanismo</em> que a implementa é uma interrupção de software (trap). Interrupções de hardware acontecem sem o programa pedir.</li>
    <li>Quem executa o TRAP é a <strong>rotina de biblioteca</strong>, não o código que o programador escreveu. A chamada <code>read</code> do programa em C é uma chamada de rotina comum até o passo 5.</li>
    <li>O TRAP <strong>não</strong> vai para um endereço escolhido pelo programa: vai para um local <strong>fixo</strong> do núcleo, e o despacho usa o <strong>número da chamada</strong> para achar a rotina certa.</li>
    <li><strong>Programas de sistema</strong> (shell, compiladores) <strong>usam</strong> chamadas de sistema; não são chamadas de sistema.</li>
    <li>Nem toda rotina da API Win32 é uma chamada de sistema.</li>
  </ul>
</div>
`,
  resumo: 'Chamada de sistema é a forma de um programa pedir um serviço ao SO (processos, memória, arquivos, E/S). Parece uma chamada de rotina, mas usa a instrução TRAP (interrupção de software), que muda a CPU para modo núcleo e desvia para um local fixo; o núcleo identifica o serviço pelo número da chamada, verifica os parâmetros, executa e retorna. No read há 11 passos: empilhar parâmetros, chamar a biblioteca, pôr o número no registrador, TRAP, despacho pela tabela, tratador, retorno e limpeza da pilha. O POSIX tem cerca de cem chamadas (fork, waitpid, execve, exit, open, read, write, mkdir...); a API Win32 tem milhares de rotinas, desacopladas das chamadas reais (CreateProcess, ReadFile...).',
  questoes: [
    {
      id: 'm02-a04-q1',
      enunciado: 'O que é uma chamada de sistema?',
      alternativas: [
        { texto: 'A forma pela qual um programa solicita um serviço ao sistema operacional, que o executa em modo núcleo.', correta: true, explicacao: 'Correto. É a definição dos slides do cap1: a maneira pela qual os programas solicitam serviços ao SO, de forma análoga a uma sub-rotina, com o serviço executado pelo núcleo.' },
        { texto: 'Um sinal enviado por um dispositivo para avisar que uma E/S terminou.', correta: false, explicacao: 'Isso é uma interrupção de hardware. A chamada de sistema é iniciada pelo próprio programa, de propósito.' },
        { texto: 'Um programa utilitário, como o compilador ou o shell.', correta: false, explicacao: 'Esses são programas de sistema, que rodam em modo usuário e fazem chamadas de sistema.' },
        { texto: 'A chamada de uma função da biblioteca matemática, como sqrt.', correta: false, explicacao: 'Uma função como sqrt é executada inteiramente em modo usuário, sem pedir nada ao núcleo. Não é chamada de sistema.' },
      ],
    },
    {
      id: 'm02-a04-q2',
      enunciado: 'O que deve ocorrer para que haja uma chamada de sistema?',
      alternativas: [
        { texto: 'O programa precisa de um serviço do SO (ex.: ler um arquivo) e executa, por meio da biblioteca, uma instrução TRAP que passa o controle ao núcleo.', correta: true, explicacao: 'Correto. A chamada é provocada intencionalmente pelo programa, que precisa de algo que só o SO pode fazer (operações privilegiadas como E/S). O TRAP é o mecanismo de entrada no núcleo.' },
        { texto: 'Um dispositivo de E/S precisa terminar uma transferência.', correta: false, explicacao: 'Isso gera uma interrupção de hardware, não uma chamada de sistema. A chamada parte do programa.' },
        { texto: 'O programa precisa executar uma divisão por zero.', correta: false, explicacao: 'Divisão por zero gera uma exceção, que não é intencional. A chamada de sistema é um pedido deliberado de serviço.' },
        { texto: 'O timer precisa chegar ao fim do quantum.', correta: false, explicacao: 'O fim do quantum gera uma interrupção de hardware do temporizador, sem participação do programa.' },
      ],
    },
    {
      id: 'm02-a04-q3',
      enunciado: 'Em que a instrução TRAP difere de uma instrução comum de chamada de rotina (CALL)?',
      alternativas: [
        { texto: 'O TRAP muda a CPU para modo núcleo e desvia para um local fixo do SO; a CALL não muda o modo e pode desviar para qualquer endereço.', correta: true, explicacao: 'Correto. São as duas diferenças apontadas pelo Tanenbaum. O destino fixo impede que o programa pule para um ponto arbitrário dentro do núcleo.' },
        { texto: 'O TRAP é privilegiado e só o SO pode executá-lo.', correta: false, explicacao: 'Se só o SO pudesse executar o TRAP, os programas não teriam como pedir serviços. Qualquer programa pode executá-lo; ele é seguro porque o destino é fixo.' },
        { texto: 'Não há diferença; o TRAP é só outro nome para CALL.', correta: false, explicacao: 'Há duas diferenças fundamentais: a troca para modo núcleo e o destino fixo (obtido de uma tabela).' },
        { texto: 'O TRAP não salva o endereço de retorno, por isso o programa não continua depois.', correta: false, explicacao: 'O endereço de retorno é salvo; no passo 9, o núcleo retorna à instrução seguinte ao TRAP.' },
      ],
    },
    {
      id: 'm02-a04-q4',
      enunciado: 'Nos passos de <code>read(fd, buffer, nbytes)</code>, qual é a ordem correta?',
      alternativas: [
        { texto: 'Empilha os parâmetros → chama a rotina de biblioteca → número da chamada no registrador → TRAP → despacho pela tabela → rotina de tratamento → retorno à biblioteca → retorno ao programa → limpa a pilha.', correta: true, explicacao: 'Correto. São os 11 passos da Fig. 1.17: 1–3 empilhar, 4 chamar read, 5 número no registrador, 6 TRAP, 7 despacho, 8 tratador, 9 volta à biblioteca, 10 volta ao programa, 11 incrementa o SP.' },
        { texto: 'TRAP → empilha os parâmetros → chama a biblioteca → rotina de tratamento → retorno.', correta: false, explicacao: 'O TRAP vem depois de empilhar os parâmetros e de a biblioteca colocar o número da chamada no registrador; senão o núcleo não saberia o que fazer.' },
        { texto: 'Chama a biblioteca → rotina de tratamento em modo usuário → TRAP → retorno.', correta: false, explicacao: 'A rotina de tratamento roda em modo núcleo, depois do TRAP. Antes do TRAP tudo ocorre em modo usuário.' },
        { texto: 'O programa executa o TRAP diretamente, sem biblioteca, e o núcleo lê os parâmetros do teclado.', correta: false, explicacao: 'Em C, quem executa o TRAP é a rotina de biblioteca; os parâmetros estão na pilha (e em registradores), não vêm do teclado.' },
      ],
    },
    {
      id: 'm02-a04-q5',
      enunciado: 'Uma chamada <code>read</code> não pôde ser realizada porque o descritor de arquivo é inválido. O que a rotina devolve ao programa?',
      alternativas: [
        { texto: '−1, e o código do erro fica na variável global errno.', correta: true, explicacao: 'Correto. Por isso os programas devem sempre verificar o resultado de uma chamada de sistema para saber se ocorreu um erro.' },
        { texto: '0, indicando que nada foi lido.', correta: false, explicacao: 'Um valor menor que nbytes (inclusive 0) pode indicar fim de arquivo, não erro. O erro é sinalizado com −1.' },
        { texto: 'O número de bytes pedido em nbytes.', correta: false, explicacao: 'Esse é o retorno normal de uma leitura bem-sucedida e completa, não de um erro.' },
        { texto: 'Nada: o processo é encerrado automaticamente pelo SO.', correta: false, explicacao: 'Um parâmetro inválido não encerra o processo; o SO apenas recusa o serviço e informa o erro.' },
      ],
    },
    {
      id: 'm02-a04-q6',
      enunciado: 'Qual chamada POSIX cria um novo processo, cópia exata do processo que a executou?',
      alternativas: [
        { texto: 'fork', correta: true, explicacao: 'Correto. O fork é o único modo de criar um processo em UNIX: o filho é uma cópia exata do pai (descritores de arquivo, registradores, memória). Depois, pai e filho seguem caminhos separados.' },
        { texto: 'execve', correta: false, explicacao: 'O execve não cria processo: substitui a imagem do processo atual por outro programa. O shell usa fork e, no filho, execve.' },
        { texto: 'waitpid', correta: false, explicacao: 'O waitpid faz o processo esperar o término de um filho; não cria nada.' },
        { texto: 'CreateProcess', correta: false, explicacao: 'CreateProcess é da API Win32, não do POSIX. E ele faz o papel de fork + execve juntos, criando um processo que já executa outro programa.' },
      ],
    },
    {
      id: 'm02-a04-q7',
      enunciado: 'Sobre a API Win32, é correto afirmar:',
      alternativas: [
        { texto: 'É desacoplada das chamadas de sistema reais: tem milhares de rotinas, e algumas são executadas totalmente no espaço do usuário.', correta: true, explicacao: 'Correto. Isso permite à Microsoft mudar as chamadas reais entre versões sem invalidar os programas existentes. No UNIX, ao contrário, a relação entre rotina de biblioteca e chamada é quase 1 para 1.' },
        { texto: 'Cada rotina Win32 corresponde exatamente a uma chamada de sistema, como no UNIX.', correta: false, explicacao: 'No Windows a relação não é 1 para 1. É impossível, pela API, saber se uma rotina faz ou não uma chamada de sistema.' },
        { texto: 'Tem exatamente as mesmas cerca de cem chamadas do POSIX.', correta: false, explicacao: 'O POSIX tem cerca de cem chamadas; a Win32 tem milhares de rotinas, e várias chamadas UNIX (link, mount, kill) não têm equivalente.' },
        { texto: 'Win32 tem uma chamada equivalente ao fork, que cria um filho idêntico ao pai.', correta: false, explicacao: 'O Windows não tem hierarquia pai/filho nem fork. CreateProcess cria um processo já executando outro programa (fork + execve).' },
      ],
    },
    {
      id: 'm02-a04-q8',
      enunciado: 'Um processo chama <code>read</code> para ler do teclado, mas o usuário ainda não digitou nada. O que acontece?',
      alternativas: [
        { texto: 'O processo é bloqueado dentro da chamada; o SO executa outro processo e, quando a entrada chegar, o processo volta a Apto e a chamada é concluída.', correta: true, explicacao: 'Correto. O Tanenbaum observa que a chamada de sistema pode bloquear quem a fez. Os passos 9 a 11 só ocorrem quando o dado estiver disponível e o processo voltar a executar.' },
        { texto: 'O processo fica em espera ocupada, num laço, consumindo a CPU até o usuário digitar.', correta: false, explicacao: 'Isso desperdiçaria a CPU. Num SO multiprogramado, o processo é bloqueado e outro processo usa a CPU.' },
        { texto: 'A chamada retorna −1 imediatamente com erro.', correta: false, explicacao: 'Não é erro esperar a entrada. Em modo normal (bloqueante), a chamada espera; não falha.' },
        { texto: 'O núcleo inventa um valor qualquer para não atrasar o processo.', correta: false, explicacao: 'O SO nunca devolve dados falsos. O processo espera, bloqueado, até a entrada real chegar.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm02-a04-d1',
      enunciado: 'Diferencie chamada de sistema e interrupção, dando exemplos de situações que disparam cada uma.',
      respostaModelo: `<p><strong>Chamada de sistema</strong> é a forma pela qual um programa <strong>solicita um serviço ao sistema operacional</strong> (criar processo, abrir/ler/gravar arquivo, alocar memória, fazer E/S). Como o programa roda em modo usuário e essas operações são privilegiadas, ele executa (pela rotina de biblioteca) uma instrução <strong>TRAP</strong>, uma interrupção de software que muda a CPU para <strong>modo núcleo</strong> e desvia para um ponto fixo do SO. O SO identifica o serviço pelo número da chamada, verifica os parâmetros, executa e retorna ao programa. <em>Para haver uma chamada</em>, o programa precisa pedir algo ao SO: por exemplo, ler um arquivo com <code>read</code>, criar um processo com <code>fork</code> ou terminar com <code>exit</code>.</p>
<p><strong>Interrupção</strong> é um sinal que <strong>avisa a CPU da ocorrência de um evento</strong>; a CPU termina a instrução atual, salva o contexto (PC e PSW), consulta o vetor de interrupção, executa a rotina de tratamento e depois restaura o contexto. <em>Para haver uma interrupção</em> de hardware, um evento externo deve ocorrer: o disco terminar uma leitura, uma tecla ser pressionada, chegar um pacote de rede ou o <strong>timer</strong> esgotar o quantum. Também há exceções, causadas por erros como divisão por zero ou acesso ilegal à memória.</p>
<p>Diferença principal: a chamada de sistema é <strong>síncrona e intencional</strong> (o programa pede); a interrupção de hardware é <strong>assíncrona</strong> (o evento acontece independentemente do programa).</p>`,
      pontosChave: [
        'Definiu chamada de sistema como pedido de serviço do programa ao SO, via trap, com passagem para modo núcleo',
        'Deu exemplo correto de chamada (ex.: read, open, fork, exit)',
        'Definiu interrupção como sinal de evento que desvia a CPU para uma rotina de tratamento, salvando e restaurando o contexto',
        'Deu exemplo correto de interrupção (ex.: fim de E/S, teclado, timer, divisão por zero)',
        'Diferenciou: chamada é intencional/síncrona; interrupção de hardware é assíncrona',
      ],
    },
  ],
});
