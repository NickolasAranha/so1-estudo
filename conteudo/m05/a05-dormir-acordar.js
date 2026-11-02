// Módulo 5, aula 5: sleep/wakeup, problema produtor-consumidor e o sinal de acordar perdido.
SO1.registerLesson({
  id: 'm05-a05',
  titulo: 'Dormir e acordar: produtor-consumidor',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.3.4 Dormir e acordar e o problema produtor-consumidor (p.75–77)',
    'Slides cap3 (Oliveira/Carissimi/Toscani, UFRGS): relação produtor-consumidor (servidor de impressão, buffer circular), primitivas lock/unlock: problemas e solução com sleep/wakeup',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a cozinha e o garçom.</strong> O cozinheiro (produtor) põe pratos num balcão que cabe N pratos; o garçom (consumidor) tira e leva às mesas. Em vez de ficar olhando o balcão sem parar (espera ocupada), o garçom <strong>tira um cochilo</strong> quando o balcão está vazio, e o cozinheiro <strong>toca a campainha</strong> quando põe o primeiro prato. Se o balcão encher, quem cochila é o cozinheiro, e o garçom toca a campainha ao liberar espaço.</p>
  <p>O perigo: o garçom olha o balcão, vê que está vazio e <em>vai</em> para o sofá. Antes de ele deitar, o cozinheiro põe um prato e toca a campainha. O garçom ainda não estava dormindo, então <strong>não ouve</strong>. Depois deita e dorme... e ninguém vai tocar de novo.</p>
</div>

<h2>A ideia: bloquear em vez de esperar ocupado</h2>
<p>Peterson e TSL funcionam, mas o processo que espera fica testando em laço: gasta CPU e pode causar inversão de prioridade. A solução proposta é <strong>bloquear o processo</strong> em vez de fazer espera ocupada, com duas primitivas:</p>
<ul>
  <li><strong>sleep</strong>: chamada de sistema que faz quem a chamou <strong>dormir</strong>, isto é, ficar <strong>Bloqueado</strong> ("suspenso" no Tanenbaum, sem relação com o estado Bloqueado-suspenso) até que outro processo o desperte. Bloqueado, ele não usa CPU.</li>
  <li><strong>wakeup(processo)</strong>: <strong>acorda</strong> o processo indicado, que volta para Apto (pronto).</li>
</ul>

<h2>O problema produtor-consumidor (buffer limitado)</h2>
<p>Dois processos compartilham um <strong>buffer de tamanho fixo</strong> (N lugares). O <strong>produtor</strong> coloca itens no buffer; o <strong>consumidor</strong> retira. É uma situação muito comum em SO. Exemplo dos slides: no <strong>servidor de impressão</strong>, os processos de usuário produzem impressões, que vão para uma fila; um processo consumidor lê a fila e envia à impressora.</p>
<ul>
  <li>Se o produtor quer pôr um item e o <strong>buffer está cheio</strong>, ele vai <strong>dormir</strong> até o consumidor retirar algum.</li>
  <li>Se o consumidor quer retirar e o <strong>buffer está vazio</strong>, ele vai <strong>dormir</strong> até o produtor colocar algo.</li>
</ul>

<figure class="diagrama">
  <svg viewBox="0 0 540 210" style="max-width:640px" role="img" aria-label="Produtor coloca itens num buffer de N posições na posição in; consumidor retira na posição out; count conta os itens">
    <defs>
      <marker id="m05a05-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
      </marker>
    </defs>
    <rect x="10" y="70" width="100" height="50" rx="8" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
    <text x="60" y="100" font-size="14" text-anchor="middle" fill="currentColor" font-weight="bold">Produtor</text>
    <rect x="430" y="70" width="100" height="50" rx="8" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/>
    <text x="480" y="100" font-size="14" text-anchor="middle" fill="currentColor" font-weight="bold">Consumidor</text>
    <g stroke="currentColor" stroke-width="1">
      <rect x="150" y="75" width="40" height="40" style="fill:var(--cartao)"/>
      <rect x="190" y="75" width="40" height="40" style="fill:var(--ambar-claro)"/>
      <rect x="230" y="75" width="40" height="40" style="fill:var(--ambar-claro)"/>
      <rect x="270" y="75" width="40" height="40" style="fill:var(--ambar-claro)"/>
      <rect x="310" y="75" width="40" height="40" style="fill:var(--cartao)"/>
      <rect x="350" y="75" width="40" height="40" style="fill:var(--cartao)"/>
    </g>
    <g font-size="12" text-anchor="middle" fill="currentColor">
      <text x="210" y="100">item</text><text x="250" y="100">item</text><text x="290" y="100">item</text>
      <text x="270" y="60">buffer com N lugares</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <line x1="112" y1="95" x2="146" y2="95" marker-end="url(#m05a05-seta)"/>
      <line x1="394" y1="95" x2="428" y2="95" marker-end="url(#m05a05-seta)"/>
      <line x1="330" y1="150" x2="330" y2="120" marker-end="url(#m05a05-seta)"/>
      <line x1="210" y1="150" x2="210" y2="120" marker-end="url(#m05a05-seta)"/>
    </g>
    <g font-size="12" text-anchor="middle" fill="currentColor">
      <text x="330" y="166">in: próxima vaga livre</text>
      <text x="200" y="166">out: próximo a retirar</text>
      <text x="270" y="196" font-weight="bold">count = 3 (itens no buffer)</text>
    </g>
  </svg>
  <figcaption>O produtor insere na posição <code>in</code>; o consumidor retira da posição <code>out</code> (nos slides, um buffer circular). A variável <code>count</code>, compartilhada, guarda quantos itens há: 0 = vazio, N = cheio.</figcaption>
</figure>

<p>O código do Tanenbaum (Figura 2.22), com <code>count</code> compartilhado:</p>
<pre class="codigo"><code>#define N 100                      /* número de lugares no buffer   */
int count = 0;                     /* número de itens no buffer     */

void producer(void) {
  int item;
  while (TRUE) {
    item = produce_item();         /* gera o próximo item           */
    if (count == N) sleep();       /* buffer cheio: vá dormir       */
    insert_item(item);             /* põe o item no buffer          */
    count = count + 1;
    if (count == 1) wakeup(consumer);   /* buffer estava vazio?     */
  }
}

void consumer(void) {
  int item;
  while (TRUE) {
    if (count == 0) sleep();       /* buffer vazio: vá dormir       */
    item = remove_item();          /* retira o item do buffer       */
    count = count - 1;
    if (count == N - 1) wakeup(producer);   /* buffer estava cheio? */
    consume_item(item);
  }
}</code></pre>
<p>Parece certo, mas tem uma <strong>condição de corrida fatal</strong>: o acesso a <code>count</code> é <strong>irrestrito</strong>. O teste <code>if (count == 0)</code> e a chamada <code>sleep()</code> não são uma operação única.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: o sinal de acordar perdido.</strong> Buffer vazio, <code>count = 0</code>.</p>
  <table>
    <tr><th>Passo</th><th>O que acontece</th><th>count</th><th>Estado</th></tr>
    <tr><td>1</td><td>O consumidor lê <code>count</code> e vê 0. Vai chamar <code>sleep()</code>...</td><td>0</td><td>Consumidor Executando</td></tr>
    <tr><td>2</td><td>...mas antes disso o escalonador o interrompe e passa a CPU ao produtor.</td><td>0</td><td>Consumidor Apto, <strong>ainda acordado</strong></td></tr>
    <tr><td>3</td><td>O produtor insere um item e faz <code>count = 1</code>.</td><td>1</td><td>Produtor Executando</td></tr>
    <tr><td>4</td><td>Como <code>count == 1</code>, o produtor deduz que o consumidor dormia e chama <code>wakeup(consumer)</code>.</td><td>1</td><td><strong>O consumidor não está dormindo: o sinal se perde</strong></td></tr>
    <tr><td>5</td><td>O consumidor volta a executar. Ele já tinha lido 0 no passo 1, então chama <code>sleep()</code>.</td><td>1</td><td>Consumidor Bloqueado</td></tr>
    <tr><td>6</td><td>O produtor continua produzindo; o próximo wakeup só seria enviado com <code>count == 1</code>, o que não acontece mais. Ele enche o buffer (<code>count = N</code>) e também dorme.</td><td>N</td><td><strong>Os dois dormem para sempre</strong></td></tr>
  </table>
</div>

<h2>O remendo do bit de espera</h2>
<p>A essência do problema: um <strong>wakeup enviado a um processo que ainda não está dormindo é perdido</strong>. Uma correção rápida é adicionar um <strong>bit de espera pelo sinal de acordar</strong> (<em>wakeup waiting bit</em>): quando um wakeup chega para um processo acordado, o bit é ligado; depois, quando o processo tentar dormir, se o bit estiver ligado, ele o desliga e <strong>continua acordado</strong>. O bit funciona como um "cofrinho" que guarda um sinal de acordar.</p>
<p>Mas com <strong>três ou mais processos</strong> um bit só não basta, e pôr 2, 8 ou 32 bits é só adiar o problema. É preciso um mecanismo que <strong>conte</strong> quantos sinais de acordar estão guardados: o <strong>semáforo</strong>, assunto da próxima aula.</p>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>sleep/wakeup <strong>resolve a espera ocupada</strong> (o processo bloqueado não usa CPU), mas o código ingênuo do produtor-consumidor ainda tem <strong>condição de corrida</strong> sobre <code>count</code>.</li>
    <li>No sinal perdido, o wakeup é enviado a um processo que <strong>ainda não dormiu</strong>; sleep e wakeup não guardam memória do sinal.</li>
    <li>Resultado final do sinal perdido: <strong>os dois processos dormem para sempre</strong> (o consumidor primeiro, o produtor quando o buffer enche).</li>
    <li>Produtor dorme com buffer <strong>cheio</strong>; consumidor dorme com buffer <strong>vazio</strong>. Não troque.</li>
    <li>O bit de espera resolve para dois processos, mas não é uma solução geral; o semáforo é a generalização que conta os sinais.</li>
  </ul>
</div>
`,
  resumo: 'sleep bloqueia quem chama até outro processo chamar wakeup, eliminando a espera ocupada. No produtor-consumidor (buffer de N lugares), o produtor dorme com buffer cheio e o consumidor com buffer vazio, e cada um acorda o outro. Como o acesso a count é irrestrito, o wakeup pode chegar a um processo que ainda não dormiu e se perder: os dois acabam dormindo para sempre. O bit de espera pelo sinal de acordar remedia para dois processos, mas a solução geral é contar os sinais: o semáforo.',
  questoes: [
    {
      id: 'm05-a05-q1',
      enunciado: 'Qual é a principal vantagem de usar <strong>sleep/wakeup</strong> em vez das soluções com espera ocupada?',
      alternativas: [
        { texto: 'O processo que não pode prosseguir fica Bloqueado e não gasta tempo de CPU testando em laço.', correta: true, explicacao: 'Correto. Em vez de girar num while, o processo dorme e só volta a competir pela CPU quando alguém o acorda.' },
        { texto: 'Elimina automaticamente todas as condições de corrida.', correta: false, explicacao: 'Não elimina: o produtor-consumidor com sleep/wakeup ingênuo ainda tem corrida sobre count, que leva ao sinal perdido.' },
        { texto: 'Dispensa qualquer variável compartilhada.', correta: false, explicacao: 'O exemplo do produtor-consumidor continua usando count e o buffer compartilhados.' },
        { texto: 'Faz o processo executar mais rápido dentro da seção crítica.', correta: false, explicacao: 'sleep/wakeup não muda a velocidade da seção crítica; muda o que acontece com quem está esperando.' },
      ],
    },
    {
      id: 'm05-a05-q2',
      enunciado: 'No problema produtor-consumidor com buffer limitado, quando cada processo vai dormir?',
      alternativas: [
        { texto: 'O produtor dorme quando o buffer está cheio; o consumidor dorme quando o buffer está vazio.', correta: true, explicacao: 'Correto. O produtor não tem onde pôr o item; o consumidor não tem o que retirar. Cada um acorda o outro quando a situação muda.' },
        { texto: 'O produtor dorme quando o buffer está vazio; o consumidor quando está cheio.', correta: false, explicacao: 'Está invertido. Com buffer vazio é o consumidor que não tem o que fazer; com buffer cheio, o produtor.' },
        { texto: 'Os dois dormem sempre que o outro está executando.', correta: false, explicacao: 'Eles só dormem quando não podem prosseguir (cheio/vazio). Fora disso, produzem e consomem normalmente.' },
        { texto: 'Nenhum dorme: o buffer cresce conforme a necessidade.', correta: false, explicacao: 'O problema é justamente de buffer limitado (tamanho fixo N).' },
      ],
    },
    {
      id: 'm05-a05-q3',
      enunciado: 'No código da Figura 2.22 do Tanenbaum, em que momento o produtor chama <code>wakeup(consumer)</code>?',
      alternativas: [
        { texto: 'Logo após inserir um item, se <code>count == 1</code>, porque então o buffer estava vazio e o consumidor pode estar dormindo.', correta: true, explicacao: 'Correto. count == 1 depois do incremento significa que antes havia 0 itens. O produtor deduz que o consumidor dormiu e o acorda.' },
        { texto: 'Sempre que insere qualquer item.', correta: false, explicacao: 'O código só acorda o consumidor quando count passa de 0 para 1. Nos outros casos, presume que ele está acordado.' },
        { texto: 'Quando <code>count == N</code>.', correta: false, explicacao: 'count == N é o teste para o próprio produtor dormir (buffer cheio), não para acordar o consumidor.' },
        { texto: 'Quando <code>count == N − 1</code>.', correta: false, explicacao: 'count == N − 1 é o teste do consumidor para acordar o produtor (o buffer estava cheio).' },
      ],
    },
    {
      id: 'm05-a05-q4',
      enunciado: 'Buffer vazio. O consumidor lê <code>count = 0</code> e, antes de chamar <code>sleep()</code>, perde a CPU. O produtor insere um item, vê <code>count == 1</code> e chama <code>wakeup(consumer)</code>. Qual o desfecho?',
      alternativas: [
        { texto: 'O wakeup se perde; o consumidor dorme ao voltar, o produtor enche o buffer e também dorme: os dois dormem para sempre.', correta: true, explicacao: 'Correto. O consumidor ainda não estava dormindo, então o sinal não teve efeito. Ele dorme com base no valor velho (0), e nenhum novo wakeup será enviado.' },
        { texto: 'O consumidor acorda imediatamente e consome o item.', correta: false, explicacao: 'O consumidor não estava dormindo quando o wakeup chegou. Sem memória do sinal, ele dorme logo depois.' },
        { texto: 'O wakeup fica guardado e o consumidor não chega a dormir.', correta: false, explicacao: 'Isso só aconteceria com o bit de espera ou com semáforos. sleep/wakeup puros não guardam sinais.' },
        { texto: 'O produtor percebe o erro e envia outro wakeup.', correta: false, explicacao: 'O produtor só envia wakeup quando count passa a 1. Com o buffer enchendo, isso não acontece mais.' },
      ],
    },
    {
      id: 'm05-a05-q5',
      enunciado: 'Qual é a causa raiz do problema do sinal de acordar perdido?',
      alternativas: [
        { texto: 'O acesso irrestrito a <code>count</code>: o teste e o sleep não são atômicos, e um wakeup enviado a um processo ainda acordado é perdido.', correta: true, explicacao: 'Correto. Entre ler count e dormir, o outro processo age. E sleep/wakeup não guardam o sinal enviado a quem não dormia.' },
        { texto: 'O buffer é pequeno demais.', correta: false, explicacao: 'O tamanho do buffer não importa; com N = 100 ou N = 1 o sinal pode se perder do mesmo jeito.' },
        { texto: 'O produtor é mais rápido que o consumidor.', correta: false, explicacao: 'A falha depende da intercalação, não de quem é mais rápido. Uma solução correta não pode depender de velocidades.' },
        { texto: 'O sistema tem mais de uma CPU.', correta: false, explicacao: 'O problema ocorre com uma CPU só: basta o escalonador trocar de processo entre o teste e o sleep.' },
      ],
    },
    {
      id: 'm05-a05-q6',
      enunciado: 'Sobre o <strong>bit de espera pelo sinal de acordar</strong>, é correto afirmar:',
      alternativas: [
        { texto: 'Guarda um wakeup enviado a um processo acordado; resolve o caso de dois processos, mas não é suficiente com três ou mais.', correta: true, explicacao: 'Correto. O bit é um "cofrinho" de um sinal só. Com mais processos seriam precisos mais bits, o que só adia o problema; a generalização é o semáforo, que conta os sinais.' },
        { texto: 'Resolve o problema para qualquer número de processos.', correta: false, explicacao: 'O Tanenbaum mostra que com três ou mais processos o bit não basta. Adicionar mais bits não resolve em princípio.' },
        { texto: 'Faz o processo entrar em espera ocupada até o bit ser ligado.', correta: false, explicacao: 'Não há espera ocupada: o bit é verificado quando o processo vai dormir; se estiver ligado, ele é desligado e o processo segue acordado.' },
        { texto: 'Desabilita as interrupções durante o sleep.', correta: false, explicacao: 'O bit não mexe em interrupções; apenas registra que um sinal de acordar chegou.' },
      ],
    },
    {
      id: 'm05-a05-q7',
      enunciado: 'No servidor de impressão dos slides, quem faz o papel de produtor e de consumidor?',
      alternativas: [
        { texto: 'Os processos de usuário produzem impressões na fila; o processo que lê a fila e envia à impressora é o consumidor.', correta: true, explicacao: 'Correto. Vários produtores (P1...Pn) e um consumidor compartilham a fila de impressão, organizada como buffer circular com ponteiros in e out.' },
        { texto: 'A impressora produz e os usuários consomem.', correta: false, explicacao: 'Está invertido. Os usuários geram pedidos (produzem); a impressão é o consumo desses pedidos.' },
        { texto: 'O SO é o produtor e o disco é o consumidor.', correta: false, explicacao: 'Produtor e consumidor são processos que compartilham o buffer. O disco é só onde a fila pode ficar guardada.' },
        { texto: 'Não há produtor-consumidor nesse exemplo, só exclusão mútua.', correta: false, explicacao: 'Os slides apresentam o servidor de impressão justamente como exemplo de relação produtor-consumidor.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm05-a05-d1',
      enunciado: 'Descreva o problema produtor-consumidor resolvido com sleep/wakeup e explique como pode ocorrer a perda do sinal de acordar.',
      respostaModelo: `<p>No <strong>produtor-consumidor</strong>, dois processos compartilham um buffer de tamanho fixo N: o produtor insere itens e o consumidor retira. Com sleep/wakeup, usa-se uma variável compartilhada <strong>count</strong> com o número de itens. Se o buffer está <strong>cheio</strong> (count = N), o produtor chama <strong>sleep</strong>; se está <strong>vazio</strong> (count = 0), o consumidor dorme. Ao inserir o primeiro item (count = 1), o produtor chama <strong>wakeup(consumidor)</strong>; ao retirar de um buffer cheio (count = N − 1), o consumidor chama <strong>wakeup(produtor)</strong>. Assim ninguém fica em espera ocupada.</p>
<p><strong>Perda do sinal:</strong> o acesso a count é irrestrito. O consumidor lê count = 0, mas perde a CPU antes de chamar sleep. O produtor insere um item, vê count = 1 e chama wakeup(consumidor); como o consumidor <strong>ainda não estava dormindo</strong>, o sinal é perdido. Quando o consumidor volta, ele dorme com base no valor antigo. O produtor enche o buffer e também dorme. <strong>Os dois dormem para sempre.</strong></p>
<p>Um bit de espera pelo sinal de acordar remedia o caso de dois processos, mas a solução geral é usar <strong>semáforos</strong>, que contam os sinais e têm operações atômicas.</p>`,
      pontosChave: [
        'Descreveu o buffer limitado e quando cada processo dorme (produtor cheio, consumidor vazio)',
        'Explicou que cada um acorda o outro com wakeup quando a condição muda',
        'Explicou a sequência do sinal perdido: wakeup enviado a processo ainda acordado, por acesso irrestrito a count',
        'Concluiu que os dois dormem para sempre (ou citou semáforo/bit de espera como solução)',
      ],
    },
  ],
});
