// Módulo 9, aula 2: E/S programada, por interrupção e DMA; objetivos e camadas do software de E/S.
SO1.registerLesson({
  id: 'm09-a02',
  titulo: 'Técnicas e software de E/S',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §5.1.4 DMA (p.207–209), §5.2 princípios do software de E/S (p.211–214), §5.3 camadas do software de E/S (p.214–222)',
    'Slides cap5 (Oliveira/Carissimi/Toscani, UFRGS): técnicas de E/S, desvantagens, evolução, objetivos da gerência de E/S, estrutura em camadas, síncrono x assíncrono, E/S independente do dispositivo, drivers, E/S de usuário',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: esperar uma encomenda.</strong></p>
  <ul>
    <li><strong>E/S programada</strong>: você fica na janela olhando a rua até o entregador aparecer. Não faz mais nada.</li>
    <li><strong>E/S por interrupção</strong>: você vai trabalhar e o porteiro <em>interfona</em> quando chega cada caixa. Mas são 100 caixas, e você desce 100 vezes para carregar uma por uma.</li>
    <li><strong>DMA</strong>: você contrata um carregador, diz "leve as 100 caixas para o quarto" e só é interfonado <em>uma vez</em>, no final.</li>
  </ul>
</div>

<h2>As três técnicas de E/S</h2>
<p>O exemplo do Tanenbaum: um processo quer imprimir a cadeia "ABCDEFGH". Ele faz uma chamada de sistema; o SO copia a cadeia para um buffer do núcleo (<code>copy_from_user</code>) e então precisa entregar os caracteres à impressora, um de cada vez.</p>

<h3>1. E/S programada</h3>
<p>Toda a interação entre o processador e a controladora é feita pela CPU. Ciclo: a CPU <strong>envia o comando</strong> à controladora e <strong>espera</strong> a conclusão, consultando sem parar o registrador de status (os bits de estado que a controladora atualiza). Essa consulta contínua é a <strong>espera ocupada</strong> (<em>busy waiting</em>) ou <strong>polling</strong>.</p>
<pre class="codigo"><code>for (i = 0; i &lt; count; i++) {
    while (*printer_status_reg != READY) ;  /* espera ocupada */
    *printer_data_register = p[i];          /* envia 1 caractere */
}</code></pre>
<p><strong>Desvantagem:</strong> desperdiça o tempo da CPU, que fica presa verificando o estado enquanto o dispositivo (muito mais lento) trabalha. Uma solução parcial é intercalar outras operações entre consultas sucessivas (polling periódico), mas aí surge o problema de <strong>determinar a frequência</strong> do polling. É aceitável só em sistemas simples (ex.: embarcados) em que a CPU não tem mais nada a fazer.</p>

<h3>2. E/S orientada a interrupção (interrupt driven)</h3>
<p>Criada para evitar o desperdício do polling. A CPU <strong>inicia</strong> a operação (envia o primeiro caractere), e o processo que pediu fica <strong>Bloqueado</strong>; o escalonador põe <strong>outro processo</strong> para executar. Quando a impressora termina o caractere e está pronta, ela gera uma <strong>interrupção</strong>; o <strong>tratador de interrupção</strong> envia o próximo caractere e retorna. Quando o último caractere sai, o tratador desbloqueia o processo.</p>
<p><strong>Desvantagem:</strong> a CPU continua sendo <strong>intermediária</strong> da transferência: <strong>cada palavra</strong> lida ou escrita passa por ela, e ocorre <strong>uma interrupção por caractere</strong>. Interrupções levam tempo (salvar contexto, tratar, restaurar).</p>

<h3>3. Acesso direto à memória (DMA)</h3>
<p>Um hardware especial, o <strong>controlador de DMA</strong>, transfere <strong>um bloco inteiro</strong> diretamente entre a memória e a controladora do dispositivo. A CPU só participa <strong>no começo</strong> (programa o DMA) e <strong>no final</strong> (trata a interrupção que sinaliza o fim). É "E/S programada feita pelo controlador de DMA, e não pela CPU".</p>
<p><strong>Vantagem:</strong> o número de interrupções cai de <em>uma por caractere</em> para <em>uma por bloco (buffer)</em>. <strong>Desvantagens:</strong> exige hardware extra; o controlador de DMA costuma ser bem mais lento que a CPU, então se a CPU não tiver outro trabalho, a E/S por interrupção ou até a programada pode ser mais rápida; e o DMA <strong>disputa o barramento</strong> com a CPU.</p>
<ul>
  <li><strong>Roubo de ciclo</strong> (<em>cycle stealing</em>, modo palavra): o DMA pede o barramento, transfere uma palavra e devolve; a CPU espera um ciclo de vez em quando.</li>
  <li><strong>Modo de surto</strong> (<em>burst</em>, modo bloco): o DMA pega o barramento e transfere uma série de palavras de uma vez. É mais eficiente, mas pode bloquear a CPU por um tempo maior.</li>
</ul>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: ler um bloco do disco com DMA</strong> (Figura 5.3 do Tanenbaum).</p>
  <table>
    <tr><th>Passo</th><th>Quem age</th><th>O que acontece</th></tr>
    <tr><td>1</td><td>CPU</td><td>Programa o controlador de DMA: <strong>endereço de memória</strong> de destino, <strong>contador de bytes</strong> e sentido. Manda a controladora de disco ler o bloco para seu buffer interno e conferir o ECC. Depois, a CPU vai executar outro processo.</td></tr>
    <tr><td>2</td><td>DMA</td><td>Quando os dados estão válidos no buffer da controladora, o DMA pede a ela, pelo barramento, a leitura de uma palavra, informando o endereço de memória.</td></tr>
    <tr><td>3</td><td>Controladora de disco</td><td>Escreve a palavra diretamente na memória.</td></tr>
    <tr><td>4</td><td>Controladora → DMA</td><td>Envia confirmação (acknowledgement). O DMA <strong>incrementa o endereço</strong> e <strong>decrementa o contador</strong>. Se o contador &gt; 0, repete os passos 2–4.</td></tr>
    <tr><td>5</td><td>DMA → CPU</td><td>Contador chegou a 0: o DMA <strong>interrompe a CPU</strong>. O bloco já está na memória; o SO não precisa copiá-lo e desbloqueia o processo.</td></tr>
  </table>
  <p>Comparando, para imprimir 1.000 caracteres: programada = CPU ocupada o tempo todo; por interrupção = cerca de 1.000 interrupções; DMA = 1 interrupção.</p>
</div>

<table>
  <tr><th>Técnica</th><th>CPU durante a E/S</th><th>Interrupções</th><th>Desvantagem principal</th></tr>
  <tr><td>Programada</td><td>Presa em espera ocupada (polling)</td><td>Nenhuma</td><td>Desperdiça tempo de CPU</td></tr>
  <tr><td>Por interrupção</td><td>Livre entre um caractere e outro, mas copia cada palavra</td><td>Uma por caractere/palavra</td><td>CPU é intermediária; muitas interrupções</td></tr>
  <tr><td>DMA</td><td>Livre; só age no início e no fim</td><td>Uma por bloco</td><td>Hardware extra; disputa do barramento; DMA lento</td></tr>
</table>
<p>Os slides mostram essa <strong>evolução</strong> da arquitetura de E/S: CPU controla o periférico diretamente → controladora com E/S programada → controladora com interrupções → DMA → <strong>processador de E/S</strong> (canal: um processador separado só para E/S) → computador dedicado à E/S (ex.: via rede).</p>

<h2>Objetivos do software de E/S</h2>
<p>A E/S é extremamente lenta comparada à CPU e à memória; a multiprogramação deixa outros processos executarem enquanto um espera E/S (até o swapping é E/S). Por isso a gerência de E/S deve ser eficiente. Os objetivos (Tanenbaum §5.2.1 e slides):</p>
<ul>
  <li><strong>Independência do dispositivo</strong>: o mesmo programa lê de disco, CD ou pen drive sem ser alterado (ex.: <code>sort &lt;entrada &gt;saida</code> funciona com qualquer dispositivo). Os slides chamam de <strong>generalidade</strong>: tratar os dispositivos da forma mais uniforme possível, oferecendo abstrações genéricas como <code>open</code>, <code>read</code>, <code>write</code>, <code>close</code>.</li>
  <li><strong>Nomeação uniforme</strong>: o nome de um arquivo ou dispositivo é uma cadeia ou um número que não depende do dispositivo (no UNIX, um pen drive é <em>montado</em> num diretório; dispositivos aparecem em <code>/dev</code>).</li>
  <li><strong>Tratamento de erros</strong> o mais perto possível do hardware: a controladora corrige o que puder; senão o driver tenta de novo; só então as camadas superiores são avisadas.</li>
  <li><strong>Transferência síncrona (bloqueante) x assíncrona (orientada a interrupção)</strong>: o hardware é assíncrono, mas os programas são mais fáceis de escrever com chamadas bloqueantes; o SO faz operações assíncronas parecerem bloqueantes. (Nos slides: síncrona = processo suspenso até a conclusão; assíncrona = processo continua, avisado por interrupção ou usando multithreading.)</li>
  <li><strong>Utilização de buffer</strong>: os dados muitas vezes precisam ficar num armazenamento temporário antes do destino final (ex.: pacote de rede; dispositivos de tempo real como áudio).</li>
  <li><strong>Dispositivos compartilhados x dedicados</strong>: vários usuários podem usar um disco ao mesmo tempo, mas uma impressora ou fita deve ser dedicada a um usuário até ele terminar.</li>
</ul>

<h2>Camadas do software de E/S</h2>
<figure class="diagrama">
  <svg viewBox="0 0 470 280" style="max-width:620px" role="img" aria-label="Quatro camadas do software de E/S sobre o hardware, com as funções de cada uma">
    <g font-size="13" fill="currentColor" text-anchor="middle">
      <rect x="20" y="20" width="180" height="40" rx="6" fill="none" stroke="currentColor"/>
      <text x="110" y="45">Processos do usuário</text>
      <rect x="20" y="70" width="180" height="40" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="110" y="88">Software independente</text>
      <text x="110" y="103">do dispositivo</text>
      <rect x="20" y="120" width="180" height="40" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="110" y="145">Drivers dos dispositivos</text>
      <rect x="20" y="170" width="180" height="40" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <text x="110" y="188">Tratadores de</text>
      <text x="110" y="203">interrupção</text>
      <rect x="20" y="220" width="180" height="40" rx="6" style="fill:var(--linha)" stroke="currentColor"/>
      <text x="110" y="245">Hardware</text>
    </g>
    <g stroke="currentColor" stroke-width="1.5" fill="none">
      <path d="M8 30 V250"/><path d="M4 244 L8 252 L12 244"/>
      <path d="M212 250 V30"/><path d="M208 36 L212 28 L216 36"/>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="6" y="16" text-anchor="start">pedido</text>
      <text x="196" y="16">resposta</text>
      <text x="228" y="44">Faz a chamada de E/S; formata (printf); spool</text>
      <text x="228" y="88">Nomeação, proteção, bloqueio, buffer,</text>
      <text x="228" y="102">alocação de dispositivos, erros</text>
      <text x="228" y="145">Programa os registradores; verifica status</text>
      <text x="228" y="196">Acorda o driver quando a E/S termina</text>
      <text x="228" y="245">Executa a operação de E/S</text>
    </g>
    <text x="110" y="276" font-size="11" text-anchor="middle" style="fill:var(--azul)">em azul: dentro do núcleo do SO</text>
  </svg>
  <figcaption>As camadas da Figura 5.15 do Tanenbaum. O pedido desce do processo até o hardware; a resposta (interrupção) sobe. Os slides agrupam as três camadas do núcleo em "E/S independente do dispositivo" + "drivers", sobre o hardware.</figcaption>
</figure>

<h3>1. Tratadores de interrupção (camada mais baixa)</h3>
<p>Devem ficar escondidos o mais fundo possível. O driver que iniciou a E/S <strong>se bloqueia</strong> (ex.: <code>down</code> num semáforo) até a interrupção chegar. O tratador salva o contexto, faz o que é preciso para aquela interrupção e <strong>desbloqueia o driver</strong> que esperava.</p>
<h3>2. Drivers de dispositivo</h3>
<p>Código <strong>específico de cada dispositivo</strong> (normalmente escrito pelo fabricante), que roda no núcleo. Recebe pedidos abstratos ("leia o bloco n"), verifica os parâmetros, traduz para comandos concretos, escreve nos registradores da controladora, espera (bloqueado) ou não, confere erros e devolve os dados. Exporta uma visão uniforme: dispositivos <strong>de bloco</strong>, <strong>de caractere</strong> e <strong>pseudodispositivos</strong>. Também é responsável pelo tratamento de erros do dispositivo.</p>
<h3>3. Software de E/S independente do dispositivo</h3>
<p>Funções comuns a todos os dispositivos: <strong>interface uniforme</strong> para os drivers; <strong>nomeação</strong> (no UNIX, <code>/dev/ttyS0</code> tem <em>major number</em>, que escolhe o driver, e <em>minor number</em>, que escolhe a unidade); <strong>proteção/direitos de acesso</strong>; <strong>buffer</strong> e cache de dados; <strong>escalonamento de E/S</strong>; <strong>alocação e liberação</strong> de dispositivos dedicados; <strong>tamanho de bloco</strong> independente do dispositivo; <strong>informe de erros</strong>.</p>
<h3>4. Software de E/S no espaço do usuário</h3>
<p>Bibliotecas ligadas aos programas (ex.: <code>printf</code> formata a cadeia e chama <code>write</code>; <code>scanf</code>) e a interface de comandos (<code>ls</code>, <code>cp</code>, <code>mv</code>), todas construídas sobre as chamadas de sistema. Aqui fica também o <strong>spooling</strong>: para não deixar um processo segurar a impressora e não liberá-la, cria-se um processo especial, o <strong>daemon</strong>, e um <strong>diretório de spool</strong>. Quem quer imprimir coloca o arquivo no diretório; só o daemon tem permissão de usar a impressora e imprime um arquivo de cada vez. O mesmo vale para envio de arquivos pela rede e news (USENET).</p>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>Com DMA <strong>ainda existe interrupção</strong>: uma só, no fim do bloco. Não diga que DMA "elimina as interrupções".</li>
    <li>Na E/S por interrupção a CPU <strong>não</strong> fica parada, mas continua <strong>copiando cada palavra</strong>; essa é a desvantagem que o DMA resolve.</li>
    <li>Polling = <strong>espera ocupada</strong> = E/S programada. O problema de "qual frequência de polling usar" também está nos slides.</li>
    <li>Spooling é feito <strong>no espaço do usuário</strong> (daemon + diretório), não pelo driver.</li>
    <li>A ordem das camadas, de baixo para cima: hardware → tratadores de interrupção → drivers → software independente → processos do usuário.</li>
  </ul>
</div>
`,
  resumo: 'Na E/S programada a CPU fica em espera ocupada (polling); na E/S por interrupção a CPU fica livre, mas recebe uma interrupção e copia cada palavra; no DMA um controlador transfere o bloco inteiro e a CPU só age no início e numa única interrupção no fim. O software de E/S busca independência do dispositivo, nomeação uniforme, tratamento de erros perto do hardware, chamadas bloqueantes, buffer e controle de dispositivos dedicados, e é organizado em camadas: tratadores de interrupção, drivers, software independente do dispositivo e software do usuário (bibliotecas e spooling).',
  questoes: [
    {
      id: 'm09-a02-q1',
      enunciado: 'Qual é a principal desvantagem da <strong>E/S programada</strong>?',
      alternativas: [
        { texto: 'A CPU desperdiça tempo verificando continuamente o estado do dispositivo (espera ocupada).', correta: true, explicacao: 'Correto. Como o dispositivo é muito mais lento, a CPU passa quase todo o tempo num laço lendo o registrador de status, sem fazer trabalho útil.' },
        { texto: 'Gera uma interrupção para cada caractere transferido.', correta: false, explicacao: 'Essa é a desvantagem da E/S por interrupção. Na E/S programada não há interrupção: a CPU fica consultando o status.' },
        { texto: 'Exige um controlador de DMA, que encarece o hardware.', correta: false, explicacao: 'O hardware extra é custo do DMA. A E/S programada é a técnica mais simples e não precisa de hardware especial.' },
        { texto: 'Não permite verificar se o dispositivo está pronto.', correta: false, explicacao: 'É justamente o que ela faz o tempo todo: lê o status repetidamente até o dispositivo ficar pronto.' },
      ],
    },
    {
      id: 'm09-a02-q2',
      enunciado: 'Na <strong>E/S orientada a interrupção</strong>, por que a CPU ainda é considerada "intermediária" da transferência?',
      alternativas: [
        { texto: 'Porque cada palavra lida ou escrita passa pela CPU, que executa o tratador de interrupção a cada caractere.', correta: true, explicacao: 'Correto. A CPU fica livre entre um caractere e outro, mas é ela quem copia cada palavra, com uma interrupção por palavra. O DMA resolve isso.' },
        { texto: 'Porque a CPU fica em espera ocupada até o fim da transferência.', correta: false, explicacao: 'Espera ocupada é a E/S programada. Na E/S por interrupção, a CPU executa outro processo enquanto espera.' },
        { texto: 'Porque a CPU precisa programar o controlador de DMA.', correta: false, explicacao: 'Programar o DMA é o passo inicial da técnica de DMA, não da E/S por interrupção.' },
        { texto: 'Porque a CPU desliga as interrupções durante toda a transferência.', correta: false, explicacao: 'Sem interrupções a técnica não funcionaria; o mecanismo depende delas para saber quando enviar o próximo caractere.' },
      ],
    },
    {
      id: 'm09-a02-q3',
      enunciado: 'Uma transferência de um bloco de 4.096 bytes é feita, primeiro, por E/S orientada a interrupção (uma interrupção por byte) e, depois, por DMA. Quantas interrupções a CPU recebe em cada caso?',
      alternativas: [
        { texto: '4.096 por interrupção e 1 com DMA.', correta: true, explicacao: 'Correto. Por interrupção, cada byte gera uma interrupção (4.096). Com DMA, o controlador transfere o bloco todo e interrompe a CPU uma única vez, no final.' },
        { texto: '4.096 por interrupção e 0 com DMA.', correta: false, explicacao: 'Com DMA ainda há uma interrupção: é ela que avisa a CPU que o bloco terminou.' },
        { texto: '1 nos dois casos.', correta: false, explicacao: 'Na E/S por interrupção, a interrupção ocorre a cada caractere transferido, não só no fim.' },
        { texto: '0 por interrupção e 1 com DMA.', correta: false, explicacao: 'Quem não tem interrupção é a E/S programada (polling). A E/S orientada a interrupção, como diz o nome, usa uma por palavra.' },
      ],
    },
    {
      id: 'm09-a02-q4',
      enunciado: 'O DMA aparece entre os suportes de hardware que tornaram a multiprogramação possível. Por que o <strong>DMA</strong> está entre esses suportes?',
      alternativas: [
        { texto: 'Porque libera a CPU durante a transferência de blocos, permitindo que ela execute outros processos enquanto a E/S acontece.', correta: true, explicacao: 'Correto. Multiprogramação é aproveitar a espera por E/S de um processo para executar outro. Com DMA (e interrupções), a CPU só participa no início e no fim da transferência.' },
        { texto: 'Porque permite que dois processos executem instruções ao mesmo tempo na mesma CPU.', correta: false, explicacao: 'Uma CPU executa um processo por vez; multiprogramação é intercalar processos. O DMA não executa instruções de processos.' },
        { texto: 'Porque protege a memória de um processo contra os outros.', correta: false, explicacao: 'Proteção de memória (registradores de limite, modo dual) é outro suporte de hardware à multiprogramação, mas não é o papel do DMA.' },
        { texto: 'Porque elimina a necessidade de interrupções.', correta: false, explicacao: 'O DMA usa a interrupção para avisar o fim da transferência. Interrupção e DMA são suportes complementares.' },
      ],
    },
    {
      id: 'm09-a02-q5',
      enunciado: 'No modo de <strong>roubo de ciclo</strong> (cycle stealing), o controlador de DMA:',
      alternativas: [
        { texto: 'Pede o barramento, transfere uma palavra e o devolve, atrasando a CPU um ciclo de vez em quando.', correta: true, explicacao: 'Correto. É o modo palavra: a CPU perde ciclos ocasionais de barramento. No modo de surto (burst), o DMA transfere várias palavras de uma vez.' },
        { texto: 'Rouba ciclos de CPU para executar instruções do driver.', correta: false, explicacao: 'O DMA não executa instruções da CPU; o que ele "rouba" é o uso do barramento.' },
        { texto: 'Transfere o bloco inteiro de uma vez, segurando o barramento até o fim.', correta: false, explicacao: 'Isso é o modo de surto (burst). Ele é mais eficiente, mas pode bloquear a CPU por mais tempo.' },
        { texto: 'Interrompe a CPU a cada palavra transferida.', correta: false, explicacao: 'O DMA interrompe a CPU apenas no fim do bloco. Uma interrupção por palavra é a E/S orientada a interrupção.' },
      ],
    },
    {
      id: 'm09-a02-q6',
      enunciado: 'Qual camada do software de E/S contém o código <strong>específico</strong> de cada dispositivo e escreve nos registradores da controladora?',
      alternativas: [
        { texto: 'Os drivers de dispositivo.', correta: true, explicacao: 'Correto. O driver conhece os registradores e comandos da controladora; transforma pedidos abstratos ("ler bloco n") em comandos concretos.' },
        { texto: 'O software de E/S independente do dispositivo.', correta: false, explicacao: 'Essa camada faz o que é comum a todos os dispositivos: nomeação, proteção, buffer, alocação, informe de erros. O código específico fica abaixo dela, nos drivers.' },
        { texto: 'Os tratadores de interrupção.', correta: false, explicacao: 'O tratador apenas atende a interrupção e acorda o driver que estava bloqueado esperando a E/S terminar.' },
        { texto: 'As bibliotecas no espaço do usuário.', correta: false, explicacao: 'Bibliotecas como printf apenas formatam dados e fazem chamadas de sistema; não acessam registradores (isso exige modo núcleo).' },
      ],
    },
    {
      id: 'm09-a02-q7',
      enunciado: 'Como funciona o <strong>spooling</strong> de impressão?',
      alternativas: [
        { texto: 'Os processos colocam os arquivos num diretório de spool, e um processo especial (daemon), o único com permissão de usar a impressora, imprime um de cada vez.', correta: true, explicacao: 'Correto. Assim nenhum processo comum abre a impressora e a segura indefinidamente. O spooling fica no software de E/S do espaço do usuário.' },
        { texto: 'O driver da impressora imprime os caracteres de todos os processos intercalados.', correta: false, explicacao: 'A impressora é um dispositivo dedicado: intercalar saídas de vários processos misturaria as páginas. O spooling serializa os trabalhos.' },
        { texto: 'Cada processo abre o arquivo especial da impressora e espera a sua vez em espera ocupada.', correta: false, explicacao: 'É exatamente o problema que o spool evita: um processo poderia abrir a impressora, ficar horas sem imprimir e bloquear todos.' },
        { texto: 'É uma técnica de hardware que copia os dados direto para a impressora sem passar pela CPU.', correta: false, explicacao: 'Isso lembra o DMA. Spooling é uma técnica de software (daemon + diretório de spool).' },
      ],
    },
    {
      id: 'm09-a02-q8',
      enunciado: 'O objetivo de <strong>independência do dispositivo</strong> significa que:',
      alternativas: [
        { texto: 'Um programa deve poder acessar disco, CD ou pen drive sem ser modificado para cada dispositivo.', correta: true, explicacao: 'Correto. O exemplo do Tanenbaum é "sort <entrada >saida", que deve funcionar com qualquer dispositivo. O SO esconde as diferenças com abstrações como open, read, write e close.' },
        { texto: 'Cada dispositivo deve ter seu próprio sistema operacional.', correta: false, explicacao: 'O SO é um só; ele é que oferece a mesma interface para dispositivos diferentes.' },
        { texto: 'Os dispositivos não precisam de driver.', correta: false, explicacao: 'O driver continua necessário, e é ele que encapsula o que é específico. A independência é vista pelos programas, acima do driver.' },
        { texto: 'Os erros nunca devem ser tratados pelo hardware.', correta: false, explicacao: 'É o oposto: o objetivo de tratamento de erros diz que eles devem ser tratados o mais perto possível do hardware.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm09-a02-d1',
      enunciado: 'Descreva as três técnicas de E/S (programada, orientada a interrupção e DMA), explicando o papel da CPU em cada uma e a desvantagem de cada técnica.',
      respostaModelo: `<p><strong>E/S programada:</strong> a CPU envia o comando à controladora e fica consultando continuamente o registrador de status até a operação terminar (espera ocupada ou polling), transferindo cada palavra. Desvantagem: desperdiça tempo de CPU, pois o dispositivo é muito mais lento; intercalar outras tarefas entre as consultas cria o problema de escolher a frequência do polling.</p>
<p><strong>E/S orientada a interrupção:</strong> a CPU inicia a operação e o processo é bloqueado; a CPU executa outro processo. Quando o dispositivo fica pronto, gera uma interrupção, e o tratador transfere a próxima palavra. Desvantagem: a CPU continua intermediária, pois cada palavra passa por ela, e há uma interrupção por caractere, o que tem custo.</p>
<p><strong>DMA:</strong> a CPU programa o controlador de DMA (endereço de memória, contador, sentido) e a controladora do dispositivo; o DMA transfere o bloco inteiro direto entre a controladora e a memória e interrompe a CPU uma única vez no fim. A CPU só atua no começo e no final. Desvantagens: hardware adicional, disputa do barramento (roubo de ciclo ou surto) e o controlador de DMA costuma ser mais lento que a CPU.</p>`,
      pontosChave: [
        'E/S programada: CPU em espera ocupada (polling), desperdiçando tempo',
        'Por interrupção: CPU livre entre operações, mas uma interrupção e uma cópia por palavra',
        'DMA: controlador transfere o bloco direto para a memória; CPU só no início e no fim',
        'Mencionou que no DMA ainda há uma interrupção no fim do bloco',
        'Citou uma desvantagem do DMA (hardware extra, disputa de barramento ou lentidão do controlador)',
      ],
    },
  ],
});
