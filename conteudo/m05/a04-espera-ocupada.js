// Módulo 5, aula 4: exclusão mútua com espera ocupada: desabilitar interrupções, lock, alternância, Peterson, TSL.
SO1.registerLesson({
  id: 'm05-a04',
  titulo: 'Exclusão mútua com espera ocupada',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.3.3 Exclusão mútua com espera ociosa (p.71–75) e início de §2.3.4 (inversão de prioridade, p.75)',
    'Slides cap3 (Oliveira/Carissimi/Toscani, UFRGS): desabilitação de interrupções, variáveis lock, alternância, Dekker/Peterson, primitivas lock/unlock (TSL, CAS) e seus problemas',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: o banheiro de um bar.</strong> Só cabe uma pessoa (exclusão mútua). Ideias para controlar: (1) trancar a porta do bar inteiro enquanto alguém usa (funciona, mas é poder demais); (2) uma plaquinha "livre/ocupado" que cada um olha e vira (se duas pessoas olham "livre" ao mesmo tempo, as duas entram); (3) revezamento obrigatório "agora é a vez da mesa 1, depois da mesa 2" (se a mesa 2 não quer ir, a mesa 1 fica esperando à toa); (4) uma chave única pendurada no balcão: quem pega a chave entra, e pegar a chave é um gesto só, que ninguém consegue fazer pela metade.</p>
  <p>Em todas, quem está esperando fica <strong>parado na porta conferindo sem parar</strong> se já pode entrar. Isso é a <strong>espera ocupada</strong>.</p>
</div>

<p>Esta aula mostra as soluções de exclusão mútua em que o processo que não pode entrar fica <strong>testando em laço</strong> até poder. O Tanenbaum chama isso de <strong>espera ociosa</strong>; os slides chamam de <strong>busy waiting</strong> (espera ocupada).</p>

<h2>1. Desabilitar interrupções</h2>
<pre class="codigo"><code>CLI            ; desliga as interrupções
  ... seção crítica ...
STI            ; religa as interrupções</code></pre>
<p>Sem interrupções (nem a do relógio), a CPU não troca de processo, então ninguém entra na seção crítica no meio. <strong>Desvantagens:</strong></p>
<ul>
  <li><strong>Poder demais para um processo de usuário</strong>: se ele desliga as interrupções e nunca mais liga, é o fim do sistema.</li>
  <li><strong>Não funciona em multiprocessadores</strong>: CLI afeta só a CPU que a executou; as outras continuam rodando e acessando a memória compartilhada (viola a regra de não fazer suposições sobre o número de CPUs).</li>
</ul>
<p>É útil <strong>dentro do núcleo</strong>, por poucas instruções (ao atualizar a lista de processos prontos, por exemplo), mas não serve como mecanismo geral para processos de usuário.</p>

<h2>2. Variável de trava (lock)</h2>
<p>Uma variável compartilhada <code>lock</code>: 0 = livre, 1 = ocupado.</p>
<pre class="codigo"><code>while (lock == 1) ;   /* espera ficar livre (espera ocupada) */
lock = 1;             /* tranca                              */
  ... seção crítica ...
lock = 0;             /* libera                              */</code></pre>
<p><strong>Falha:</strong> tem a <strong>mesma condição de corrida</strong> do spool. Testar e trancar são duas operações separadas:</p>
<table>
  <tr><th>Passo</th><th>O que acontece</th><th>lock</th></tr>
  <tr><td>1</td><td>A testa: <code>lock == 0</code>, sai do while.</td><td>0</td></tr>
  <tr><td>2</td><td>Interrupção antes de A executar <code>lock = 1</code>. B executa.</td><td>0</td></tr>
  <tr><td>3</td><td>B testa: <code>lock == 0</code>, faz <code>lock = 1</code> e entra na seção crítica.</td><td>1</td></tr>
  <tr><td>4</td><td>A volta, faz <code>lock = 1</code> (já estava) e também entra.</td><td>1</td></tr>
  <tr><td>5</td><td><strong>A e B estão na seção crítica ao mesmo tempo.</strong></td><td>1</td></tr>
</table>

<h2>3. Alternância estrita (chaveamento obrigatório)</h2>
<p>Uma variável <code>turn</code> diz de quem é a vez. Cada processo espera a sua vez e, ao sair, passa a vez ao outro:</p>
<pre class="codigo"><code>/* Processo 0 */                     /* Processo 1 */
while (TRUE) {                       while (TRUE) {
  while (turn != 0) ;  /* laço */      while (turn != 1) ;  /* laço */
  critical_region();                   critical_region();
  turn = 1;                            turn = 0;
  noncritical_region();                noncritical_region();
}                                    }</code></pre>
<p>Garante exclusão mútua, mas:</p>
<ul>
  <li>o teste contínuo de <code>turn</code> <strong>desperdiça CPU</strong> (espera ocupada; uma trava com espera ocupada se chama <strong>spin lock</strong>);</li>
  <li><strong>viola a progressão</strong> (regra 2 dos slides, condição 3 do Tanenbaum) quando a parte não crítica de um processo é muito maior que a do outro: o processo 0 quer entrar de novo, mas <code>turn</code> está em 1 e o processo 1 está ocupado <em>fora</em> da seção crítica. Quem está fora bloqueia quem quer entrar;</li>
  <li>obriga os processos a se alternarem: nenhum pode entrar duas vezes seguidas.</li>
</ul>

<h2>4. Solução de Peterson (1981)</h2>
<p>Combina a ideia da vez (<code>turn</code>) com variáveis de interesse. Antes dele, T. Dekker (matemático holandês) já havia encontrado uma solução por software sem alternância obrigatória (Dijkstra, 1965); Peterson achou uma bem mais simples:</p>
<pre class="codigo"><code>#define N 2                     /* número de processos            */
int turn;                        /* de quem é a vez?               */
int interested[N];               /* todos começam com FALSE        */

void enter_region(int process) { /* process é 0 ou 1               */
  int other = 1 - process;       /* número do outro processo       */
  interested[process] = TRUE;    /* mostra que está interessado    */
  turn = process;                /* altera o valor de turn         */
  while (turn == process &amp;&amp; interested[other] == TRUE) ; /* espera */
}

void leave_region(int process) {
  interested[process] = FALSE;   /* indica a saída da região crítica */
}</code></pre>
<p>Se só um processo quer entrar, <code>interested[other]</code> é FALSE e ele entra na hora. Se os dois chamam <code>enter_region</code> quase juntos, ambos gravam seu número em <code>turn</code>; <strong>vale o último que gravou</strong>, e é esse que fica esperando. Exemplo: o processo 1 grava por último (turn = 1). O processo 0 testa <code>turn == 0</code>, que é falso, e entra; o processo 1 testa <code>turn == 1 &amp;&amp; interested[0]</code>, que é verdadeiro, e fica no laço até o processo 0 chamar <code>leave_region</code>.</p>

<h2>5. A instrução TSL (ajuda do hardware)</h2>
<p><code>TSL RX,LOCK</code> (<em>test and set lock</em>): <strong>lê o conteúdo da palavra <code>lock</code> para o registrador RX e grava um valor diferente de zero em <code>lock</code></strong>, numa operação <strong>indivisível (atômica)</strong>. A CPU que executa a TSL <strong>impede o acesso ao barramento de memória</strong>, de modo que nenhuma outra CPU acessa a memória até a instrução terminar. Isso é diferente de desabilitar interrupções, que não segura as outras CPUs.</p>
<pre class="codigo"><code>enter_region:
    TSL REGISTER,LOCK   | copia lock para o registrador e põe lock em 1
    CMP REGISTER,#0     | lock valia zero?
    JNE enter_region    | se não era zero, estava travado: tenta de novo (laço)
    RET                 | retorna; entrou na região crítica

leave_region:
    MOVE LOCK,#0        | coloca 0 em lock
    RET</code></pre>
<p>Agora "testar" e "trancar" são uma coisa só, e o problema da variável lock some. Uma alternativa é a instrução <strong>XCHG</strong>, que troca atomicamente o conteúdo de um registrador e de uma palavra de memória (todas as CPUs Intel x86 usam XCHG para sincronização de baixo nível). Os slides também citam a <strong>CAS</strong>. É com essas instruções que se implementam as primitivas <strong>lock/unlock</strong> (o mutex, visto na aula 6).</p>

<h2>Os problemas da espera ocupada</h2>
<p>Peterson e TSL estão <strong>corretos</strong>, mas todos esses métodos têm problemas:</p>
<ul>
  <li><strong>Desperdício de CPU</strong>: quem espera fica num laço testando, gastando tempo de processador sem fazer nada útil.</li>
  <li><strong>Confiar no programador</strong>: cada processo precisa chamar lock/unlock (enter/leave) nos momentos certos. Um processo "trapaceiro" ou com erro quebra a exclusão mútua.</li>
  <li><strong>Inversão de prioridade</strong>: veja a figura.</li>
</ul>

<figure class="diagrama">
  <svg viewBox="0 0 540 210" style="max-width:660px" role="img" aria-label="Inversão de prioridade: L está na região crítica, H fica pronto e faz espera ocupada para sempre, e L nunca volta a executar">
    <g font-size="13" fill="currentColor" font-weight="bold">
      <text x="10" y="58">H (alta)</text>
      <text x="10" y="128">L (baixa)</text>
    </g>
    <g stroke="currentColor" stroke-width="1">
      <rect x="90" y="110" width="120" height="26" style="fill:var(--azul-claro)"/>
      <rect x="210" y="40" width="320" height="26" style="fill:var(--vermelho-claro)"/>
      <rect x="210" y="110" width="320" height="26" style="fill:var(--linha)" stroke-dasharray="4 3"/>
    </g>
    <g font-size="12" text-anchor="middle" fill="currentColor">
      <text x="150" y="128">região crítica</text>
      <text x="370" y="58">espera ocupada: while (lock) ; ... para sempre</text>
      <text x="370" y="128">Apto, segurando o lock, nunca escalonado</text>
    </g>
    <path d="M210 30 V150" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
    <text x="210" y="22" font-size="11" text-anchor="middle" fill="currentColor">H fica pronto (fim da E/S)</text>
    <path d="M90 162 H530" fill="none" stroke="currentColor"/>
    <path d="M524 158 L530 162 L524 166" fill="none" stroke="currentColor"/>
    <text x="90" y="184" font-size="12" fill="currentColor">tempo → o escalonador sempre escolhe H;</text>
    <text x="90" y="200" font-size="12" fill="currentColor">L nunca sai da região crítica; H nunca entra</text>
  </svg>
  <figcaption>Inversão de prioridade: regra de escalonamento "H executa sempre que estiver pronto". L entra na região crítica; H fica pronto e começa a espera ocupada. Como L nunca é escalonado enquanto H executa, L não libera o lock, e H fica no laço para sempre.</figcaption>
</figure>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: alternância estrita violando a progressão.</strong> Começo: <code>turn = 0</code>. A parte não crítica do processo 1 é muito longa.</p>
  <table>
    <tr><th>Passo</th><th>O que acontece</th><th>turn</th></tr>
    <tr><td>1</td><td>P0 vê turn = 0, entra na região crítica, sai e faz turn = 1.</td><td>1</td></tr>
    <tr><td>2</td><td>P1 vê turn = 1, entra, sai, faz turn = 0 e começa sua longa parte não crítica.</td><td>0</td></tr>
    <tr><td>3</td><td>P0 entra de novo (turn = 0), sai e faz turn = 1. Sua parte não crítica é curta.</td><td>1</td></tr>
    <tr><td>4</td><td>P0 quer entrar outra vez, mas turn = 1: fica no laço <code>while (turn != 0)</code>.</td><td>1</td></tr>
    <tr><td>5</td><td>P1 continua na parte não crítica. <strong>Nenhum processo está na região crítica, e mesmo assim P0 está impedido</strong>: progressão violada.</td><td>1</td></tr>
  </table>
</div>

<h2>Resumo das tentativas</h2>
<table>
  <tr><th>Técnica</th><th>Garante exclusão mútua?</th><th>Problema</th></tr>
  <tr><td>Desabilitar interrupções</td><td>Só com 1 CPU</td><td>Poder demais ao usuário; não funciona em multiprocessador</td></tr>
  <tr><td>Variável lock</td><td>Não</td><td>Corrida entre testar e trancar</td></tr>
  <tr><td>Alternância estrita</td><td>Sim</td><td>Espera ocupada; viola a progressão</td></tr>
  <tr><td>Peterson</td><td>Sim</td><td>Espera ocupada; inversão de prioridade</td></tr>
  <tr><td>TSL / XCHG</td><td>Sim</td><td>Espera ocupada; inversão de prioridade; depende do programador</td></tr>
</table>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>Desabilitar interrupções <strong>não</strong> resolve em multiprocessador: só a CPU que executou CLI para de ser interrompida.</li>
    <li>A variável lock <strong>falha</strong> pelo mesmo motivo que o spool: testar e trancar não são atômicos. A TSL corrige isso fazendo os dois numa instrução só.</li>
    <li>A alternância estrita <strong>garante</strong> exclusão mútua; o defeito dela é violar a <strong>progressão</strong> (e gastar CPU).</li>
    <li>Peterson e TSL são <strong>corretos</strong>; o defeito comum é a <strong>espera ocupada</strong>, que gasta CPU e permite a inversão de prioridade.</li>
    <li>Na inversão de prioridade, quem fica "travado" é o de <strong>alta</strong> prioridade, esperando o de baixa, que não consegue executar.</li>
  </ul>
</div>
`,
  resumo: 'Soluções com espera ocupada: desabilitar interrupções (poder demais e não funciona em multiprocessador), variável lock (tem corrida entre testar e trancar), alternância estrita (garante exclusão mútua mas viola a progressão), Peterson (correto, por software) e TSL/XCHG (correto, instrução atômica que trava o barramento). Todas fazem o processo testar em laço, o que desperdiça CPU, depende de o programador chamar lock/unlock certo e pode causar inversão de prioridade (H em espera ocupada impede L de liberar o lock).',
  questoes: [
    {
      id: 'm05-a04-q1',
      enunciado: 'Por que desabilitar interrupções <strong>não</strong> garante exclusão mútua numa máquina multiprocessadora?',
      alternativas: [
        { texto: 'Porque só a CPU que executou a instrução deixa de ser interrompida; as outras continuam executando e acessando a memória compartilhada.', correta: true, explicacao: 'Correto. CLI tem efeito local. Outro processo, em outra CPU, pode entrar na seção crítica ao mesmo tempo, o que viola a regra de não supor nada sobre o número de CPUs.' },
        { texto: 'Porque em multiprocessadores não existem interrupções.', correta: false, explicacao: 'Multiprocessadores têm interrupções normalmente. O problema é que desabilitá-las numa CPU não afeta as demais.' },
        { texto: 'Porque desabilitar interrupções é uma instrução privilegiada que trava todas as CPUs para sempre.', correta: false, explicacao: 'Ela não trava todas as CPUs; ao contrário, afeta só uma. Por isso não basta para a exclusão mútua.' },
        { texto: 'Porque a seção crítica fica mais lenta.', correta: false, explicacao: 'Velocidade não é o problema. A técnica simplesmente não impede que outra CPU acesse os dados compartilhados.' },
      ],
    },
    {
      id: 'm05-a04-q2',
      enunciado: 'Por que a solução com uma simples variável <code>lock</code> (<code>while (lock == 1); lock = 1;</code>) falha?',
      alternativas: [
        { texto: 'Porque testar e trancar são operações separadas: dois processos podem ver lock = 0 antes de qualquer um gravar 1 e entrar juntos.', correta: true, explicacao: 'Correto. É a mesma corrida do spool: uma interrupção entre o teste e a atribuição deixa os dois processos passarem.' },
        { texto: 'Porque viola a progressão, como a alternância estrita.', correta: false, explicacao: 'O defeito da variável lock é mais grave: ela nem garante exclusão mútua. A violação da progressão é o defeito da alternância estrita.' },
        { texto: 'Porque o valor de lock nunca volta a 0.', correta: false, explicacao: 'O processo grava lock = 0 ao sair. O problema está na entrada, entre o teste e a atribuição.' },
        { texto: 'Porque só funciona em multiprocessadores.', correta: false, explicacao: 'Ela falha até com uma CPU, por causa da troca de processo no meio do protocolo de entrada.' },
      ],
    },
    {
      id: 'm05-a04-q3',
      enunciado: 'A alternância estrita (variável <code>turn</code>) garante exclusão mútua, mas é considerada inadequada porque:',
      alternativas: [
        { texto: 'Viola a progressão: um processo fora da região crítica pode impedir o outro de entrar, além de usar espera ocupada.', correta: true, explicacao: 'Correto. Se a parte não crítica de um processo for longa, o outro fica esperando a vez mesmo com a região crítica vazia (e gastando CPU no laço).' },
        { texto: 'Permite que os dois processos entrem juntos na região crítica.', correta: false, explicacao: 'Isso não acontece: turn só pode valer 0 ou 1, então só um processo passa do while por vez.' },
        { texto: 'Depende de instruções especiais do hardware.', correta: false, explicacao: 'A alternância é uma solução puramente de software. Quem depende de hardware é a TSL.' },
        { texto: 'Só funciona com mais de dois processos.', correta: false, explicacao: 'Ela foi escrita justamente para dois processos (turn = 0 ou 1). O problema é a progressão.' },
      ],
    },
    {
      id: 'm05-a04-q4',
      enunciado: 'O que a instrução <code>TSL RX,LOCK</code> faz?',
      alternativas: [
        { texto: 'Copia o valor de LOCK para o registrador RX e grava um valor diferente de zero em LOCK, numa operação atômica que trava o barramento.', correta: true, explicacao: 'Correto. Leitura e escrita são indivisíveis: nenhuma outra CPU acessa a memória no meio. Se RX vier 0, a trava estava livre e agora é sua.' },
        { texto: 'Desabilita as interrupções enquanto o processo está na região crítica.', correta: false, explicacao: 'TSL não desabilita interrupções. Ela impede o acesso ao barramento durante a própria instrução, o que funciona também com várias CPUs.' },
        { texto: 'Coloca o processo para dormir até a trava ser liberada.', correta: false, explicacao: 'TSL não bloqueia ninguém. Se a trava estiver ocupada, o código volta a executar a TSL em laço (espera ocupada).' },
        { texto: 'Grava zero em LOCK para liberar a região crítica.', correta: false, explicacao: 'Liberar é feito com uma instrução comum (MOVE LOCK,#0). A TSL é usada na entrada.' },
      ],
    },
    {
      id: 'm05-a04-q5',
      enunciado: 'Na solução de Peterson, os processos 0 e 1 chamam <code>enter_region</code> quase ao mesmo tempo, e o processo <strong>1 grava em <code>turn</code> por último</strong> (turn = 1). O que acontece?',
      alternativas: [
        { texto: 'O processo 0 entra na região crítica; o processo 1 fica no laço até o 0 sair.', correta: true, explicacao: 'Correto. Para o processo 0, turn == 0 é falso, então ele sai do while. Para o 1, turn == 1 e interested[0] é TRUE, então ele espera. Quem grava por último espera.' },
        { texto: 'O processo 1 entra, pois foi o último a gravar.', correta: false, explicacao: 'É o contrário: o último a gravar em turn é quem cede a vez. O primeiro valor é sobreposto e perdido.' },
        { texto: 'Os dois entram ao mesmo tempo.', correta: false, explicacao: 'Peterson garante exclusão mútua. turn só tem um valor, e só o processo cujo número não está em turn pode passar.' },
        { texto: 'Os dois ficam esperando para sempre.', correta: false, explicacao: 'Não há impasse: como turn vale 1, a condição do processo 0 é falsa e ele entra.' },
      ],
    },
    {
      id: 'm05-a04-q6',
      enunciado: 'O processo H (alta prioridade) fica pronto enquanto L (baixa prioridade) está na região crítica. O escalonador sempre executa H quando ele está pronto, e H fica em espera ocupada pelo lock. Que problema é esse?',
      alternativas: [
        { texto: 'Inversão de prioridade: L nunca é escalonado para sair da região crítica, e H fica no laço para sempre.', correta: true, explicacao: 'Correto. É o exemplo do Tanenbaum. A espera ocupada de H ocupa a CPU, e L, que segura o lock, nunca tem chance de liberá-lo.' },
        { texto: 'Condição de corrida entre H e L.', correta: false, explicacao: 'Não há acesso simultâneo aos dados: a exclusão mútua funciona. O problema é que ninguém progride.' },
        { texto: 'Violação da exclusão mútua.', correta: false, explicacao: 'Só L está na região crítica; H está fora, no laço. A exclusão mútua está mantida.' },
        { texto: 'Não há problema: H termina primeiro por ter maior prioridade.', correta: false, explicacao: 'H não consegue terminar, porque nunca entra na região crítica: depende de L liberar o lock, e L não executa.' },
      ],
    },
    {
      id: 'm05-a04-q7',
      enunciado: 'Com alternância estrita, <code>turn = 1</code>. O processo 0 acabou de sair da região crítica e quer entrar de novo; o processo 1 está executando uma longa parte <strong>não crítica</strong>. O que ocorre?',
      alternativas: [
        { texto: 'O processo 0 fica em espera ocupada até o processo 1 entrar e sair da região crítica, mesmo com ela vazia.', correta: true, explicacao: 'Correto. Esse é o defeito da alternância: quem está fora da região crítica (o processo 1) bloqueia quem quer entrar (o 0). Viola a progressão.' },
        { texto: 'O processo 0 entra imediatamente, pois a região crítica está vazia.', correta: false, explicacao: 'O processo 0 só entra quando turn == 0. Quem coloca turn em 0 é o processo 1, ao sair da região crítica, o que ainda não aconteceu.' },
        { texto: 'O processo 0 é bloqueado (dorme) e acordado pelo processo 1.', correta: false, explicacao: 'Na alternância não há sleep/wakeup: o processo 0 fica testando turn em laço, gastando CPU.' },
        { texto: 'Os dois processos entram em deadlock permanente.', correta: false, explicacao: 'Não é permanente: quando o processo 1 terminar a parte não crítica, entrar e sair da região crítica, turn volta a 0 e o 0 entra.' },
      ],
    },
    {
      id: 'm05-a04-q8',
      enunciado: 'Qual é o defeito <strong>comum</strong> a Peterson e à TSL, que motivou as soluções da próxima aula (sleep/wakeup)?',
      alternativas: [
        { texto: 'Espera ocupada: o processo que não pode entrar fica testando em laço, gastando CPU.', correta: true, explicacao: 'Correto. As duas soluções são corretas, mas o tempo de CPU gasto no laço é desperdício. A ideia seguinte é bloquear o processo em vez de deixá-lo testando.' },
        { texto: 'Não garantem exclusão mútua.', correta: false, explicacao: 'Ambas garantem exclusão mútua. O defeito está no custo da espera, não na correção.' },
        { texto: 'Só funcionam com interrupções desabilitadas.', correta: false, explicacao: 'Nenhuma delas desabilita interrupções. Peterson é só software; a TSL usa o travamento do barramento.' },
        { texto: 'Exigem que os processos se alternem obrigatoriamente.', correta: false, explicacao: 'A alternância obrigatória é defeito da solução com turn simples. Peterson foi criado justamente para eliminá-la.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm05-a04-d1',
      enunciado: 'Explique como a instrução TSL permite implementar a exclusão mútua e por que a variável lock simples não funciona. Quais os problemas das soluções com espera ocupada?',
      respostaModelo: `<p>Com uma <strong>variável lock simples</strong>, o processo testa se lock vale 0 e depois grava 1. Como são duas operações separadas, uma interrupção entre o teste e a gravação permite que outro processo também veja 0 e entre: os dois ficam na seção crítica ao mesmo tempo (condição de corrida).</p>
<p>A instrução <strong>TSL RX,LOCK</strong> (test and set lock) lê o valor de lock para um registrador e grava um valor diferente de zero em lock numa operação <strong>atômica</strong>: a CPU trava o barramento de memória durante a instrução, e nenhuma outra CPU acessa a memória no meio. Para entrar, o processo executa a TSL e compara o valor lido com 0: se era 0, a trava estava livre e agora é dele; senão, repete a TSL em laço. Para sair, grava 0 em lock. Assim testar e trancar viram um passo só, e a exclusão mútua funciona até em multiprocessadores.</p>
<p>Problemas da espera ocupada (TSL, Peterson, alternância): o processo que espera <strong>gasta CPU</strong> testando em laço; depende de cada processo chamar enter/leave corretamente; e pode ocorrer <strong>inversão de prioridade</strong>: um processo de alta prioridade em espera ocupada impede que o de baixa prioridade, que está na seção crítica, execute e libere a trava.</p>`,
      pontosChave: [
        'Explicou a falha da variável lock: teste e atribuição separados permitem corrida',
        'Explicou que a TSL lê e grava a trava numa operação atômica (travando o barramento)',
        'Descreveu o uso: repetir a TSL até ler 0 para entrar e gravar 0 para sair',
        'Citou os problemas da espera ocupada: desperdício de CPU e inversão de prioridade',
      ],
    },
  ],
});
