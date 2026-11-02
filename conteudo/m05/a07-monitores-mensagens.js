// Módulo 5, aula 7: monitores (variáveis de condição, wait/signal), troca de mensagens e RPC.
SO1.registerLesson({
  id: 'm05-a07',
  titulo: 'Monitores, troca de mensagens e RPC',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., variáveis de condição em Pthreads (p.80–81), §2.3.7 Monitores (p.81–85) e §2.3.8 Troca de mensagens (p.85–87)',
    'Slides cap3 (Oliveira/Carissimi/Toscani, UFRGS): implementação de mecanismos de exclusão mútua (monitor), troca de mensagens, primitivas send e receive, Remote Procedure Call (stubs, run time, rpcgen)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: três jeitos de organizar um escritório.</strong></p>
  <ul>
    <li><strong>Monitor</strong>: uma sala de arquivo com <em>porteiro</em>. Só uma pessoa entra por vez, e o porteiro (o compilador) cuida disso sozinho; ninguém precisa lembrar de trancar a porta. Se lá dentro a pessoa descobre que a pasta que precisa ainda não chegou, ela vai esperar num banco (variável de condição) e libera a sala.</li>
    <li><strong>Troca de mensagens</strong>: filiais em cidades diferentes, sem sala comum. Elas se comunicam só por <em>carta</em> (send/receive), deixada numa caixa postal.</li>
    <li><strong>RPC</strong>: você liga para um "assistente" na sua mesa e pede "calcule isso". Ele, sem você ver, manda o pedido por carta à filial, espera a resposta e lhe entrega o resultado como se tudo tivesse sido feito ali.</li>
  </ul>
</div>

<h2>Monitores</h2>
<p>Semáforos são fáceis de usar errado: basta inverter dois downs para causar um impasse (aula 6). Para facilitar, <strong>Hoare (1974) e Brinch Hansen (1973)</strong> propuseram uma primitiva de alto nível: o <strong>monitor</strong>.</p>
<p>Um <strong>monitor</strong> é uma <strong>coleção de rotinas, variáveis e estruturas de dados agrupadas num módulo</strong> especial. Os processos podem chamar as rotinas do monitor, mas <strong>não acessam diretamente</strong> suas estruturas internas. A propriedade essencial:</p>
<ul>
  <li><strong>Só um processo pode estar ativo dentro do monitor em cada momento.</strong></li>
  <li>O monitor é um <strong>conceito de linguagem de programação</strong>: é o <strong>compilador</strong> que trata as chamadas às rotinas do monitor e gera a exclusão mútua (em geral com um mutex ou semáforo binário). Se outro processo já está ativo, quem chamou fica Bloqueado até ele sair.</li>
  <li>Basta transformar todas as regiões críticas em rotinas do monitor: dois processos nunca executarão suas regiões críticas ao mesmo tempo. Como quem garante é o compilador, e não o programador, a chance de erro é muito menor.</li>
</ul>

<h3>Variáveis de condição: wait e signal</h3>
<p>A exclusão mútua não basta: é preciso também <strong>bloquear</strong> um processo que não pode continuar (o produtor com o buffer cheio). Para isso o monitor tem <strong>variáveis de condição</strong>, com duas operações:</p>
<ul>
  <li><strong>wait(c)</strong>: o processo descobre que não pode continuar e se bloqueia na condição <code>c</code>. Isso <strong>libera o monitor</strong>, para que outro processo entre.</li>
  <li><strong>signal(c)</strong>: acorda um processo bloqueado em <code>c</code>.</li>
</ul>
<p>Depois de um signal, para não haver dois processos ativos no monitor, é preciso uma regra:</p>
<ul>
  <li><strong>Hoare</strong>: o processo acordado executa e quem sinalizou fica Bloqueado.</li>
  <li><strong>Brinch Hansen</strong>: quem emite o signal deve <strong>sair do monitor imediatamente</strong>; o signal só pode ser o último comando da rotina. (É a proposta usada pelo Tanenbaum, por ser mais simples.)</li>
  <li>Terceira opção: quem sinalizou continua, e o acordado só começa quando ele sair do monitor.</li>
</ul>
<p>Importante: <strong>variáveis de condição não são contadores</strong>. Diferente dos semáforos, elas <strong>não acumulam sinais</strong>: um signal numa condição em que ninguém espera é <strong>perdido</strong>. Por isso o wait deve vir antes do signal. Por que isso não causa o problema do sinal perdido da aula 5? Porque, dentro do monitor, a exclusão mútua é automática: o processo testa a condição e faz wait sem que ninguém o interrompa no meio.</p>
<pre class="codigo"><code>monitor ProducerConsumer
  condition full, empty;
  integer count;

  procedure insert(item: integer);
  begin
    if count = N then wait(full);       { buffer cheio: espera }
    insert_item(item);
    count := count + 1;
    if count = 1 then signal(empty)     { estava vazio: acorda o consumidor }
  end;

  function remove: integer;
  begin
    if count = 0 then wait(empty);      { buffer vazio: espera }
    remove = remove_item;
    count := count - 1;
    if count = N - 1 then signal(full)  { estava cheio: acorda o produtor }
  end;

  count := 0;
end monitor;</code></pre>
<p>Linguagens reais com monitores: <strong>Java</strong> (métodos <code>synchronized</code>: uma vez que um thread começa a executar um método synchronized de um objeto, nenhum outro executa outro método synchronized do mesmo objeto). C e Pascal não têm monitores. Em Pthreads, o equivalente é usar <strong>mutex + variáveis de condição</strong> (<code>pthread_cond_wait</code>, <code>pthread_cond_signal</code>, <code>pthread_cond_broadcast</code>).</p>
<p><strong>Limite</strong> de semáforos e monitores: foram feitos para máquinas com <strong>memória compartilhada</strong>. Num sistema distribuído, cada CPU tem sua memória privada, e essas primitivas não servem. Além disso, nenhuma delas permite <strong>troca de informações</strong> entre máquinas.</p>

<h2>Troca de mensagens</h2>
<p>Mutex e semáforos se baseiam em variáveis compartilhadas, ou seja, precisam de memória comum, que <strong>não existe em sistemas distribuídos</strong>. A solução é outro paradigma: a <strong>troca de mensagens</strong> (<em>message passing</em>), com duas primitivas, que são chamadas de sistema (e não construções de linguagem):</p>
<pre class="codigo"><code>send(destino, &amp;mensagem);      /* envia uma mensagem a um destino     */
receive(origem, &amp;mensagem);    /* recebe uma mensagem de uma origem
                                   (ou de qualquer uma)                 */</code></pre>
<p>Se nenhuma mensagem estiver disponível, o receptor pode <strong>ficar bloqueado</strong> até chegar uma, ou retornar imediatamente com um código de erro. Os slides mostram as variações de semântica: <strong>bloqueante</strong>, <strong>não bloqueante</strong> e <strong>rendezvous</strong>. Exemplos de bibliotecas: sockets, MPI, PVM.</p>
<h3>Questões de projeto</h3>
<ul>
  <li><strong>Mensagens perdidas na rede</strong>: o receptor devolve uma <strong>confirmação de recebimento</strong> (<em>acknowledgement</em>); se ela não chega a tempo, o emissor retransmite.</li>
  <li><strong>Mensagem duplicada</strong> (a mensagem chegou, mas a confirmação se perdeu): cada mensagem leva um <strong>número de sequência</strong>, e o receptor ignora uma mensagem com número repetido.</li>
  <li><strong>Nomeação</strong> dos processos (para que send/receive não sejam ambíguos) e <strong>autenticação</strong> (o cliente está falando com o servidor verdadeiro?).</li>
  <li><strong>Desempenho</strong>, quando emissor e receptor estão na mesma máquina: copiar mensagens é mais lento que uma operação de semáforo.</li>
</ul>
<h3>Endereçamento: caixa postal e rendezvous</h3>
<ul>
  <li><strong>Caixa postal</strong> (<em>mailbox</em>): lugar que armazena temporariamente um certo número de mensagens, definido na criação. send e receive usam o endereço da caixa postal, e não do processo. Quem tenta enviar para uma caixa cheia fica Bloqueado até alguém retirar uma mensagem.</li>
  <li><strong>Rendezvous</strong> ("encontro marcado"): <strong>sem armazenamento</strong>. Se o send vem antes do receive, o emissor fica bloqueado até o receive, e vice-versa; a mensagem é copiada direto. Mais simples de implementar, menos flexível.</li>
</ul>
<p>No produtor-consumidor por mensagens (Figura 2.29), o consumidor começa enviando <strong>N mensagens vazias</strong>; o produtor pega uma vazia, preenche com um item e devolve. O número total de mensagens no sistema fica constante (como os N lugares do buffer). Se o produtor é mais rápido, todas as mensagens ficam cheias e ele bloqueia esperando uma vazia.</p>

<h2>RPC (Remote Procedure Call)</h2>
<p>Com a <strong>chamada de procedimento remoto</strong>, o programa chama uma rotina que está <strong>em outra máquina como se fosse uma rotina local</strong>. Toda a troca de mensagens fica escondida:</p>

<figure class="diagrama">
  <svg viewBox="0 0 560 250" style="max-width:680px" role="img" aria-label="RPC: cliente chama o stub do cliente, que empacota e envia pela rede; o stub do servidor desempacota e chama o servidor; a resposta volta pelo caminho inverso">
    <defs>
      <marker id="m05a07-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
      </marker>
    </defs>
    <g font-size="13" text-anchor="middle" fill="currentColor" font-weight="bold">
      <text x="120" y="20">Máquina cliente</text>
      <text x="420" y="20">Máquina servidora</text>
    </g>
    <g stroke-width="2">
      <rect x="40" y="32" width="160" height="40" rx="6" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <rect x="40" y="102" width="160" height="40" rx="6" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
      <rect x="40" y="172" width="160" height="40" rx="6" style="fill:var(--linha);stroke:currentColor"/>
      <rect x="340" y="32" width="160" height="40" rx="6" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <rect x="340" y="102" width="160" height="40" rx="6" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
      <rect x="340" y="172" width="160" height="40" rx="6" style="fill:var(--linha);stroke:currentColor"/>
    </g>
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <text x="120" y="57">Cliente: call S(x)</text>
      <text x="120" y="127">Stub do cliente</text>
      <text x="120" y="197">Run time / SO</text>
      <text x="420" y="57">Servidor: rotina S</text>
      <text x="420" y="127">Stub do servidor</text>
      <text x="420" y="197">Run time / SO</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <line x1="100" y1="74" x2="100" y2="100" marker-end="url(#m05a07-seta)"/>
      <line x1="100" y1="144" x2="100" y2="170" marker-end="url(#m05a07-seta)"/>
      <line x1="202" y1="186" x2="338" y2="186" marker-end="url(#m05a07-seta)"/>
      <line x1="400" y1="170" x2="400" y2="144" marker-end="url(#m05a07-seta)"/>
      <line x1="400" y1="100" x2="400" y2="74" marker-end="url(#m05a07-seta)"/>
      <line x1="440" y1="74" x2="440" y2="100" stroke-dasharray="4 3" marker-end="url(#m05a07-seta)"/>
      <line x1="440" y1="144" x2="440" y2="170" stroke-dasharray="4 3" marker-end="url(#m05a07-seta)"/>
      <line x1="338" y1="202" x2="202" y2="202" stroke-dasharray="4 3" marker-end="url(#m05a07-seta)"/>
      <line x1="140" y1="170" x2="140" y2="144" stroke-dasharray="4 3" marker-end="url(#m05a07-seta)"/>
      <line x1="140" y1="100" x2="140" y2="74" stroke-dasharray="4 3" marker-end="url(#m05a07-seta)"/>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="8" y="92">chama</text>
      <text x="8" y="162">pack +</text>
      <text x="8" y="174">send</text>
      <text x="270" y="180" text-anchor="middle">rede (mensagem)</text>
      <text x="270" y="222" text-anchor="middle">resposta (tracejado)</text>
      <text x="506" y="162">recv +</text>
      <text x="506" y="174">unpack</text>
      <text x="506" y="92">chama</text>
      <text x="506" y="104">S local</text>
    </g>
    <text x="270" y="244" font-size="12" text-anchor="middle" fill="currentColor">O cliente fica esperando (wait) até a resposta voltar e ser desempacotada pelo seu stub.</text>
  </svg>
  <figcaption>No RPC, o cliente chama o <strong>stub do cliente</strong> como uma rotina local. O stub empacota os parâmetros (pack) e o run time envia a mensagem. O <strong>stub do servidor</strong> recebe, desempacota (unpack) e chama a rotina real. A resposta faz o caminho inverso.</figcaption>
</figure>

<ul>
  <li><strong>Stubs</strong>: rotinas "procuradoras" geradas automaticamente. O do cliente tem a mesma interface da rotina remota; o do servidor recebe as mensagens e chama a rotina verdadeira.</li>
  <li>Os slides citam o RPC como base de comunicação do <strong>DCE</strong>, composto por um <strong>núcleo executivo (run time)</strong> e interfaces de programação. Há uma <strong>linguagem própria</strong> para descrever as funções e um <strong>compilador (rpcgen)</strong> que gera os stubs e os liga ao programa. A comunicação é toda gerada pelo run time, de forma <strong>transparente</strong> para o programador.</li>
</ul>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: um cliente chama <code>saldo = consulta(conta)</code> num servidor remoto via RPC.</strong></p>
  <table>
    <tr><th>Passo</th><th>Onde</th><th>O que acontece</th></tr>
    <tr><td>1</td><td>Cliente</td><td>Chama <code>consulta(conta)</code> normalmente; na verdade está chamando o stub do cliente.</td></tr>
    <tr><td>2</td><td>Stub do cliente</td><td><strong>Empacota</strong> (pack) o nome da rotina e o parâmetro numa mensagem e pede ao run time para enviá-la (send). O cliente fica bloqueado esperando a resposta.</td></tr>
    <tr><td>3</td><td>Rede</td><td>A mensagem viaja até a máquina servidora.</td></tr>
    <tr><td>4</td><td>Stub do servidor</td><td>Recebe (recv), <strong>desempacota</strong> (unpack) e chama a rotina <code>consulta</code> verdadeira, como chamada local.</td></tr>
    <tr><td>5</td><td>Servidor</td><td>Executa e retorna o saldo ao stub do servidor, que empacota e envia a resposta.</td></tr>
    <tr><td>6</td><td>Stub do cliente</td><td>Recebe, desempacota e retorna o valor. Para o cliente, foi só uma chamada de função.</td></tr>
  </table>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>Monitor é <strong>construção de linguagem</strong>: quem garante a exclusão mútua é o <strong>compilador</strong>. Semáforos e send/receive são chamadas de biblioteca/sistema.</li>
    <li>No monitor, <strong>só um processo ativo por vez</strong>. wait <strong>libera o monitor</strong> ao bloquear.</li>
    <li>Variáveis de condição <strong>não contam sinais</strong>: signal sem ninguém esperando se perde. Semáforos guardam (contam) os ups.</li>
    <li>Troca de mensagens é a saída para <strong>sistemas distribuídos</strong>, onde não há memória comum para semáforos e monitores.</li>
    <li>Caixa postal <strong>armazena</strong> mensagens; rendezvous <strong>não armazena</strong> (quem chega primeiro bloqueia).</li>
    <li>No RPC, quem empacota e desempacota são os <strong>stubs</strong>; a transparência é o objetivo (chamada remota com cara de chamada local).</li>
  </ul>
</div>
`,
  resumo: 'Monitor (Hoare/Brinch Hansen) é um módulo de linguagem com rotinas e dados em que só um processo fica ativo por vez; o compilador gera a exclusão mútua. Variáveis de condição (wait libera o monitor e bloqueia; signal acorda) permitem esperar por condições, mas não guardam sinais. Sem memória compartilhada (sistemas distribuídos) usa-se troca de mensagens com send/receive, que exige confirmações, números de sequência e nomeação, com caixa postal (armazena) ou rendezvous (sem buffer). RPC chama uma rotina remota como se fosse local: os stubs empacotam e desempacotam os parâmetros e o run time cuida da comunicação.',
  questoes: [
    {
      id: 'm05-a07-q1',
      enunciado: 'Qual é a propriedade essencial de um <strong>monitor</strong>?',
      alternativas: [
        { texto: 'Somente um processo pode estar ativo dentro do monitor em cada momento, e a exclusão mútua é gerada pelo compilador.', correta: true, explicacao: 'Correto. É o que torna o monitor útil: basta colocar as regiões críticas como rotinas do monitor, e o compilador garante que nunca haja dois processos dentro dele.' },
        { texto: 'Permite que vários processos executem suas rotinas simultaneamente, desde que em CPUs diferentes.', correta: false, explicacao: 'O número de CPUs não importa: o monitor admite um único processo ativo por vez.' },
        { texto: 'É uma chamada de sistema que conta quantos processos estão esperando.', correta: false, explicacao: 'Isso lembra um semáforo. O monitor é uma construção de linguagem de programação, não uma chamada de sistema.' },
        { texto: 'Exige que o programador chame lock e unlock em cada rotina.', correta: false, explicacao: 'A vantagem do monitor é justamente não depender do programador: o compilador insere a exclusão mútua.' },
      ],
    },
    {
      id: 'm05-a07-q2',
      enunciado: 'Dentro de um monitor, o produtor encontra o buffer cheio e executa <code>wait(full)</code>. O que acontece?',
      alternativas: [
        { texto: 'O produtor é bloqueado na variável de condição e o monitor é liberado para outro processo (por exemplo, o consumidor) entrar.', correta: true, explicacao: 'Correto. wait bloqueia quem chama e libera o monitor; se não liberasse, o consumidor nunca entraria para esvaziar o buffer.' },
        { texto: 'O produtor fica em espera ocupada dentro do monitor, impedindo outros de entrar.', correta: false, explicacao: 'Isso causaria um impasse. wait bloqueia o processo e libera o monitor; não há espera ocupada.' },
        { texto: 'O produtor descarta o item e sai do monitor.', correta: false, explicacao: 'O item não é descartado: o produtor espera e, quando acordado por um signal, continua a inserção.' },
        { texto: 'O produtor incrementa o contador de sinais de full.', correta: false, explicacao: 'Variáveis de condição não são contadores. Quem conta sinais é o semáforo.' },
      ],
    },
    {
      id: 'm05-a07-q3',
      enunciado: 'Qual a diferença entre <strong>variáveis de condição</strong> e <strong>semáforos</strong> quanto aos sinais?',
      alternativas: [
        { texto: 'Variáveis de condição não acumulam sinais: um signal sem ninguém esperando é perdido; o semáforo conta os ups para uso futuro.', correta: true, explicacao: 'Correto. Por isso, no monitor, o wait deve vir antes do signal. Dentro do monitor isso não é problema, porque testar a condição e fazer wait acontece sob exclusão mútua.' },
        { texto: 'As duas acumulam sinais da mesma forma.', correta: false, explicacao: 'Só o semáforo acumula. O Tanenbaum destaca que variáveis de condição não têm memória.' },
        { texto: 'Variáveis de condição acumulam sinais; semáforos não.', correta: false, explicacao: 'Está invertido: o semáforo é exatamente um contador de sinais de acordar.' },
        { texto: 'Nenhuma das duas pode bloquear processos.', correta: false, explicacao: 'As duas bloqueiam: down num semáforo em 0 e wait numa variável de condição.' },
      ],
    },
    {
      id: 'm05-a07-q4',
      enunciado: 'Por que semáforos e monitores <strong>não servem</strong> para sincronizar processos em máquinas diferentes de um sistema distribuído?',
      alternativas: [
        { texto: 'Porque dependem de memória compartilhada, e em sistemas distribuídos cada máquina tem sua memória privada; por isso se usa troca de mensagens.', correta: true, explicacao: 'Correto. Os slides dizem que mutex e semáforos se baseiam em variáveis compartilhadas, que não existem sem memória comum. A troca de mensagens (send/receive, RPC) resolve isso.' },
        { texto: 'Porque são lentos demais para redes rápidas.', correta: false, explicacao: 'O problema não é velocidade: sem memória comum, simplesmente não há onde guardar a variável do semáforo para todos.' },
        { texto: 'Porque só funcionam com uma CPU.', correta: false, explicacao: 'Semáforos funcionam em multiprocessadores com memória compartilhada (usando TSL/XCHG). O obstáculo é a falta de memória comum.' },
        { texto: 'Porque sistemas distribuídos não têm processos concorrentes.', correta: false, explicacao: 'Têm, e muitos. Só que eles se comunicam pela rede, por mensagens.' },
      ],
    },
    {
      id: 'm05-a07-q5',
      enunciado: 'Na troca de mensagens, a mensagem chegou ao receptor, mas a <strong>confirmação de recebimento se perdeu</strong>. O emissor retransmite. Como o receptor evita processar a mesma mensagem duas vezes?',
      alternativas: [
        { texto: 'Cada mensagem leva um número de sequência; uma mensagem com número já recebido é reconhecida como duplicata e ignorada.', correta: true, explicacao: 'Correto. É a solução do Tanenbaum: números consecutivos permitem distinguir uma mensagem nova de uma retransmissão.' },
        { texto: 'O receptor desliga as interrupções enquanto recebe.', correta: false, explicacao: 'Desligar interrupções não ajuda a identificar duplicatas e nem afeta a outra máquina.' },
        { texto: 'Usando um semáforo compartilhado entre as duas máquinas.', correta: false, explicacao: 'Não há memória compartilhada entre as máquinas; esse é justamente o motivo de usar mensagens.' },
        { texto: 'Não é possível evitar: duplicatas sempre são processadas.', correta: false, explicacao: 'É possível, com números de sequência nas mensagens.' },
      ],
    },
    {
      id: 'm05-a07-q6',
      enunciado: 'Qual a diferença entre <strong>caixa postal</strong> e <strong>rendezvous</strong>?',
      alternativas: [
        { texto: 'A caixa postal armazena temporariamente as mensagens; no rendezvous não há armazenamento, e quem chega primeiro (send ou receive) fica bloqueado até o outro.', correta: true, explicacao: 'Correto. No rendezvous a mensagem é copiada direto do emissor ao receptor; é mais simples, mas força os dois a trabalhar em sincronia.' },
        { texto: 'O rendezvous armazena um número ilimitado de mensagens.', correta: false, explicacao: 'O rendezvous é justamente o extremo sem nenhum armazenamento.' },
        { texto: 'A caixa postal nunca bloqueia ninguém.', correta: false, explicacao: 'Quem envia para uma caixa postal cheia fica Bloqueado até alguém retirar uma mensagem.' },
        { texto: 'São a mesma coisa, com nomes diferentes.', correta: false, explicacao: 'São extremos opostos do projeto: com buffer (caixa postal) e sem buffer (rendezvous).' },
      ],
    },
    {
      id: 'm05-a07-q7',
      enunciado: 'No RPC, qual é o papel do <strong>stub do cliente</strong>?',
      alternativas: [
        { texto: 'Ter a mesma interface da rotina remota, empacotar os parâmetros numa mensagem, enviá-la e desempacotar a resposta, tornando a chamada transparente.', correta: true, explicacao: 'Correto. O cliente chama o stub como se fosse a rotina local; o stub, com o run time, cuida da comunicação.' },
        { texto: 'Executar a rotina remota na máquina do cliente.', correta: false, explicacao: 'A rotina executa no servidor. O stub do cliente apenas representa essa rotina localmente.' },
        { texto: 'Garantir a exclusão mútua entre os threads do cliente.', correta: false, explicacao: 'Exclusão mútua é papel de mutex, semáforo ou monitor, não do stub.' },
        { texto: 'Compilar o programa do servidor.', correta: false, explicacao: 'Os stubs são gerados por um compilador próprio (rpcgen); eles não compilam o servidor.' },
      ],
    },
    {
      id: 'm05-a07-q8',
      enunciado: 'No produtor-consumidor com troca de mensagens do Tanenbaum, por que o consumidor começa enviando <strong>N mensagens vazias</strong> ao produtor?',
      alternativas: [
        { texto: 'Para que o total de mensagens no sistema fique constante (como os N lugares do buffer): o produtor só envia um item quando tem uma mensagem vazia para preencher.', correta: true, explicacao: 'Correto. As mensagens vazias fazem o papel das vagas do buffer. Se o produtor for mais rápido, todas ficam cheias e ele bloqueia esperando uma vazia voltar.' },
        { texto: 'Para testar se a rede está funcionando.', correta: false, explicacao: 'As mensagens vazias não são um teste: elas limitam quantos itens podem estar em trânsito, como um buffer de N lugares.' },
        { texto: 'Para autenticar o produtor.', correta: false, explicacao: 'Autenticação é outra questão de projeto. As mensagens vazias controlam o fluxo.' },
        { texto: 'Porque o receive só funciona depois de N sends.', correta: false, explicacao: 'receive funciona a qualquer momento; o motivo é o controle de fluxo, não uma regra do receive.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm05-a07-d1',
      enunciado: 'Explique o que é um monitor e como as variáveis de condição funcionam. Por que, em sistemas distribuídos, usa-se troca de mensagens em vez de semáforos e monitores?',
      respostaModelo: `<p><strong>Monitor</strong> é uma construção de linguagem de programação (Hoare e Brinch Hansen) que agrupa <strong>rotinas, variáveis e estruturas de dados</strong> num módulo. Os processos chamam as rotinas, mas não acessam diretamente os dados internos. A propriedade principal é que <strong>só um processo pode estar ativo no monitor por vez</strong>; o <strong>compilador</strong> gera essa exclusão mútua (normalmente com um mutex ou semáforo binário), o que reduz os erros do programador.</p>
<p>Para que um processo possa esperar por uma condição (por exemplo, buffer cheio), há <strong>variáveis de condição</strong>: <strong>wait(c)</strong> bloqueia o processo na condição e <strong>libera o monitor</strong> para outro entrar; <strong>signal(c)</strong> acorda um processo bloqueado em c. Para não haver dois ativos, quem sinaliza deve sair do monitor (Brinch Hansen) ou fica Bloqueado (Hoare). Variáveis de condição não acumulam sinais: um signal sem ninguém esperando se perde.</p>
<p>Semáforos e monitores dependem de <strong>memória compartilhada</strong>. Num sistema distribuído, cada máquina tem sua memória privada e não há onde guardar uma variável comum; além disso, essas primitivas não trocam informações entre máquinas. Por isso usa-se <strong>troca de mensagens</strong> com <strong>send/receive</strong> (ou RPC), tratando perda de mensagens com confirmações e números de sequência.</p>`,
      pontosChave: [
        'Definiu monitor como módulo de linguagem (rotinas + dados) com um só processo ativo por vez',
        'Disse que a exclusão mútua é garantida pelo compilador',
        'Explicou wait (bloqueia e libera o monitor) e signal (acorda um processo)',
        'Justificou a troca de mensagens pela falta de memória compartilhada em sistemas distribuídos',
      ],
    },
  ],
});
