// Módulo 3, aula 3: razões para suspender, Apto-suspenso e Bloqueado-suspenso, diagrama completo de 7 estados.
SO1.registerLesson({
  id: 'm03-a03',
  titulo: 'Processos suspensos',
  fontes: [
    'Slides cap2 (Oliveira/Carissimi/Toscani, UFRGS): processos suspensos, razões para suspender um processo, diagrama de estados de processos',
    'Tanenbaum, SO Modernos 3ª ed., §2.1.5 (p.54–55) e §3.2.2, troca de memória (swapping) (p.110)',
    'Stallings, Operating Systems (modelo de sete estados e razões para suspensão, conhecimento consolidado)',
    'Machado & Maia, Arquitetura de SO (escalonamento de médio prazo, conhecimento consolidado)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: o restaurante lotado.</strong> O salão (a <strong>memória</strong>) tem poucas mesas. Alguns clientes estão parados esperando a comida que demora (<strong>Bloqueados</strong>), ocupando mesa sem consumir nada, enquanto há gente na porta querendo entrar. O gerente pede a quem está só esperando que aguarde no <strong>banco do lado de fora</strong> (o <strong>disco</strong>): esse cliente fica <strong>suspenso</strong>. Se a comida dele ficar pronta enquanto está lá fora, ele continua lá fora, agora "pronto para comer" (<strong>Apto-suspenso</strong>), até uma mesa liberar e o gerente chamá-lo de volta (<strong>ativação</strong>).</p>
</div>

<h2>Por que suspender processos?</h2>
<p>O processador é muito mais rápido que as operações de E/S. Por isso, pode acontecer de <strong>todos os processos na memória estarem bloqueados</strong> esperando E/S, e a CPU ficar ociosa, enquanto há processos novos que não cabem na memória. A solução é <strong>liberar a memória</strong> ocupada por processos que não estão em condições de executar, <strong>transferindo-os para o disco</strong>. Essa técnica é a <strong>troca</strong> (<em>swapping</em>): levar um processo inteiro da memória para o disco (<em>swap-out</em>) e trazê-lo de volta depois (<em>swap-in</em>).</p>
<p>Com isso, o estado Bloqueado passa a ter duas situações (bloqueado com o processo na memória e bloqueado com o processo no disco), e o mesmo vale para o Apto. Surgem dois estados novos:</p>
<table>
  <tr><th>Estado</th><th>Onde está</th><th>O que espera</th></tr>
  <tr><td><strong>Bloqueado-suspenso</strong> (<em>blocked, suspend</em>)</td><td>No <strong>disco</strong></td><td>Espera um <strong>evento</strong> <em>e</em> precisa voltar à memória para executar.</td></tr>
  <tr><td><strong>Apto-suspenso</strong> (<em>ready, suspend</em>)</td><td>No <strong>disco</strong></td><td>Já pode executar; só falta <strong>voltar à memória</strong> (ser ativado).</td></tr>
</table>
<p>Quem decide quais processos vão para o disco e quais voltam é o <strong>escalonador de médio prazo</strong>, que controla quantos processos disputam a memória.</p>

<h2>Razões para suspender um processo</h2>
<table>
  <tr><th>Razão</th><th>Explicação e exemplo</th></tr>
  <tr><td><strong>Swapping (falta de memória)</strong></td><td>O SO precisa liberar memória para executar um processo novo ou para dar espaço a um processo apto. Ex.: memória cheia de processos bloqueados esperando disco.</td></tr>
  <tr><td><strong>Outra razão do SO</strong> (Stallings; os slides citam 4 razões)</td><td>O SO suspende um processo utilitário ou de fundo (contabilidade, estatísticas), ou um processo suspeito de causar problema.</td></tr>
  <tr><td><strong>Solicitação do usuário</strong></td><td>O usuário quer pausar a execução. É o comportamento típico de <strong>depuradores</strong> (parar num breakpoint) ou do Ctrl+Z num terminal UNIX.</td></tr>
  <tr><td><strong>Temporização</strong></td><td>O processo é executado periodicamente e fica suspenso entre uma execução e outra. Ex.: um processo de monitoramento ou de estatísticas que roda a cada minuto.</td></tr>
  <tr><td><strong>Pedido de outro processo (processo pai)</strong></td><td>Um processo suspende outro, por exemplo o pai suspende um filho para examiná-lo ou para sincronizar o trabalho dos dois.</td></tr>
</table>
<p>Repare a diferença: um processo fica <strong>Bloqueado</strong> por causa <strong>dele mesmo</strong> (pediu algo e espera um evento) e sai do bloqueio quando o evento ocorre. Ele fica <strong>suspenso</strong> por uma <strong>decisão externa</strong> (SO, usuário, pai) e só deixa de estar suspenso quando essa mesma autoridade o <strong>ativa</strong>.</p>
<p>No modelo, <strong>suspenso</strong> significa "não disponível para execução e candidato a ir para o disco". Na prática, uma pausa pedida pelo usuário (Ctrl+Z, depurador) nem sempre leva o processo ao disco: ele pode continuar na memória, só impedido de executar.</p>

<h2>O diagrama completo: sete estados</h2>
<figure class="diagrama">
  <svg viewBox="0 0 520 440" style="max-width:660px" role="img" aria-label="Diagrama de sete estados. Na memória: Criado, Apto, Executando, Bloqueado e Finalizado, com as transições do modelo de cinco estados. No disco: Apto-suspenso e Bloqueado-suspenso. Criado vai para Apto-suspenso por admissão suspensa. Apto e Apto-suspenso se ligam por suspensão e ativação. Bloqueado e Bloqueado-suspenso se ligam por suspensão e ativação. Bloqueado-suspenso vai para Apto-suspenso quando o evento ocorre.">
    <defs>
      <marker id="m03a03-s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" style="fill:currentColor"/></marker>
    </defs>
    <line x1="0" y1="340" x2="520" y2="340" stroke="currentColor" stroke-dasharray="6 5" opacity="0.6"/>
    <g font-size="11" fill="currentColor" text-anchor="end" font-style="italic">
      <text x="512" y="332">na memória principal</text>
      <text x="512" y="356">no disco (swap)</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <line x1="72" y1="62" x2="108" y2="126" marker-end="url(#m03a03-s)"/>
      <path d="M22 62 C4 200 12 330 46 376" marker-end="url(#m03a03-s)"/>
      <line x1="418" y1="128" x2="448" y2="64" marker-end="url(#m03a03-s)"/>
      <path d="M180 142 Q260 102 338 142" marker-end="url(#m03a03-s)"/>
      <path d="M340 160 Q260 200 182 160" marker-end="url(#m03a03-s)"/>
      <line x1="382" y1="172" x2="334" y2="248" marker-end="url(#m03a03-s)"/>
      <line x1="250" y1="250" x2="162" y2="174" marker-end="url(#m03a03-s)"/>
      <line x1="95" y1="172" x2="95" y2="376" marker-end="url(#m03a03-s)"/>
      <line x1="135" y1="378" x2="135" y2="174" marker-end="url(#m03a03-s)"/>
      <line x1="285" y1="292" x2="285" y2="376" marker-end="url(#m03a03-s)"/>
      <line x1="325" y1="378" x2="325" y2="294" marker-end="url(#m03a03-s)"/>
      <line x1="250" y1="400" x2="182" y2="400" marker-end="url(#m03a03-s)"/>
    </g>
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <rect x="10" y="20" width="110" height="40" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="65" y="45" font-weight="bold">Criado</text>
      <rect x="400" y="20" width="110" height="40" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="455" y="45" font-weight="bold">Finalizado</text>
      <rect x="60" y="130" width="120" height="40" rx="8" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2"/>
      <text x="120" y="155" font-weight="bold">Apto</text>
      <rect x="340" y="130" width="130" height="40" rx="8" style="fill:var(--verde-claro);stroke:var(--verde)" stroke-width="2"/>
      <text x="405" y="155" font-weight="bold">Executando</text>
      <rect x="230" y="250" width="120" height="40" rx="8" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="2"/>
      <text x="290" y="275" font-weight="bold">Bloqueado</text>
      <rect x="40" y="380" width="140" height="40" rx="8" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="2" stroke-dasharray="6 3"/>
      <text x="110" y="405" font-weight="bold">Apto-suspenso</text>
      <rect x="250" y="380" width="170" height="40" rx="8" style="fill:var(--ambar-claro);stroke:var(--ambar)" stroke-width="2" stroke-dasharray="6 3"/>
      <text x="335" y="405" font-weight="bold">Bloqueado-suspenso</text>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="96" y="96">admissão</text>
      <text x="30" y="236">admissão</text>
      <text x="30" y="250">suspensa</text>
      <text x="440" y="100">término</text>
      <text x="260" y="112" text-anchor="middle">seleção</text>
      <text x="260" y="198" text-anchor="middle">fim do quantum</text>
      <text x="362" y="222">espera evento</text>
      <text x="226" y="268" text-anchor="end">evento ocorre</text>
      <text x="88" y="300" text-anchor="end">suspensão</text>
      <text x="142" y="300">ativação</text>
      <text x="278" y="320" text-anchor="end">suspensão</text>
      <text x="332" y="320">ativação</text>
      <text x="216" y="364" text-anchor="middle">evento</text>
      <text x="216" y="378" text-anchor="middle">ocorre</text>
    </g>
  </svg>
  <figcaption>Modelo de sete estados (baseado no diagrama dos slides cap2). Acima da linha tracejada, o processo está na memória; abaixo, no disco. Os estados suspensos têm borda tracejada.</figcaption>
</figure>

<h3>As transições novas</h3>
<table>
  <tr><th>Transição</th><th>Gatilho</th></tr>
  <tr><td><strong>Bloqueado → Bloqueado-suspenso</strong> (suspensão)</td><td>O SO precisa de memória e escolhe um processo que está bloqueado (ele não ia usar a CPU mesmo). É a forma mais comum de swap-out.</td></tr>
  <tr><td><strong>Bloqueado-suspenso → Apto-suspenso</strong></td><td>O <strong>evento ocorre</strong> enquanto o processo está no disco. Ele deixa de esperar o evento, mas continua no disco.</td></tr>
  <tr><td><strong>Apto-suspenso → Apto</strong> (ativação)</td><td>Há memória livre (ou o processo tem prioridade maior que os aptos da memória): o SO traz o processo de volta (swap-in).</td></tr>
  <tr><td><strong>Apto → Apto-suspenso</strong> (suspensão)</td><td>Não há processo bloqueado para liberar memória suficiente, ou o usuário/pai pediu a suspensão: o SO leva um processo apto para o disco.</td></tr>
  <tr><td><strong>Bloqueado-suspenso → Bloqueado</strong> (ativação)</td><td>Menos comum: o SO traz de volta um processo bloqueado que tem prioridade alta, esperando que o evento ocorra em breve.</td></tr>
  <tr><td><strong>Criado → Apto-suspenso</strong> (admissão suspensa)</td><td>O processo é admitido, mas não há memória: ele já começa no disco.</td></tr>
</table>
<p>As transições do modelo de cinco estados continuam valendo (admissão, seleção, fim do quantum, espera de evento, ocorrência de evento, término). Alguns autores (Stallings) incluem ainda <strong>Executando → Apto-suspenso</strong>, quando um processo perde a CPU e o SO precisa liberar memória imediatamente; os slides não desenham essa seta.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo.</strong> A memória comporta 3 processos. Estão nela A, B e C. Uma CPU.</p>
  <table>
    <tr><th>Momento</th><th>O que acontece</th><th>A</th><th>B</th><th>C</th><th>D</th></tr>
    <tr><td>1</td><td>A usa a CPU; B e C esperam o disco.</td><td>Executando</td><td>Bloqueado</td><td>Bloqueado</td><td>—</td></tr>
    <tr><td>2</td><td>A pede E/S e bloqueia. CPU ociosa: todos esperam E/S. Chega o processo D, mas não há memória.</td><td>Bloqueado</td><td>Bloqueado</td><td>Bloqueado</td><td>Criado</td></tr>
    <tr><td>3</td><td>O SO leva B para o disco (swap-out) e admite D.</td><td>Bloqueado</td><td><strong>Bloqueado-suspenso</strong></td><td>Bloqueado</td><td>Apto</td></tr>
    <tr><td>4</td><td>D é selecionado e executa.</td><td>Bloqueado</td><td>Bloqueado-suspenso</td><td>Bloqueado</td><td>Executando</td></tr>
    <tr><td>5</td><td>A leitura de B termina, mas B está no disco.</td><td>Bloqueado</td><td><strong>Apto-suspenso</strong></td><td>Bloqueado</td><td>Executando</td></tr>
    <tr><td>6</td><td>C termina a E/S; logo depois D termina e libera memória.</td><td>Bloqueado</td><td>Apto-suspenso</td><td>Apto</td><td>Finalizado</td></tr>
    <tr><td>7</td><td>O SO traz B de volta (ativação, swap-in).</td><td>Bloqueado</td><td><strong>Apto</strong></td><td>Apto</td><td>—</td></tr>
  </table>
  <p>B nunca foi do disco direto para Executando: precisou primeiro voltar à memória (Apto) e então ser selecionado.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Nenhum estado suspenso vai direto para Executando.</strong> O processo precisa ser ativado (voltar à memória como Apto) e depois ser selecionado.</li>
    <li>Quando o evento ocorre para um <strong>Bloqueado-suspenso</strong>, ele vai para <strong>Apto-suspenso</strong>, e não para Apto: continua no disco.</li>
    <li><strong>Apto-suspenso não vira Bloqueado-suspenso</strong>: um processo que não executa não pode pedir E/S.</li>
    <li>Suspenso ≠ bloqueado: bloqueio vem de um pedido do próprio processo e acaba com o evento; suspensão vem de fora (SO, usuário, pai, temporização) e acaba com a ativação.</li>
    <li>O "modelo mais completo" de diagrama de estados, em questões dissertativas, é este de <strong>sete estados</strong>.</li>
  </ul>
</div>
`,
  resumo: 'Como a CPU é muito mais rápida que a E/S, a memória pode ficar cheia de processos bloqueados; o SO então leva processos para o disco (swapping), criando os estados Apto-suspenso e Bloqueado-suspenso. Suspende-se por falta de memória, decisão do SO, pedido do usuário (depuração), temporização ou pedido do processo pai. No modelo de sete estados, Apto e Bloqueado têm suspensão e ativação para os seus pares suspensos, Bloqueado-suspenso vira Apto-suspenso quando o evento ocorre, e nenhum suspenso vai direto para Executando.',
  questoes: [
    {
      id: 'm03-a03-q1',
      enunciado: 'Um processo está <strong>Bloqueado-suspenso</strong> esperando o fim de uma leitura de disco. A leitura termina. Qual é o novo estado?',
      alternativas: [
        { texto: 'Apto-suspenso: deixa de esperar o evento, mas continua no disco até ser ativado.', correta: true, explicacao: 'Correto. O evento resolve o motivo do bloqueio, mas não traz o processo de volta à memória. Para isso é preciso a ativação (swap-in).' },
        { texto: 'Apto: volta para a memória automaticamente.', correta: false, explicacao: 'A ocorrência do evento não faz swap-in. Quem decide trazer o processo de volta é o SO (escalonador de médio prazo), na ativação.' },
        { texto: 'Executando: como estava esperando havia muito tempo, recebe a CPU.', correta: false, explicacao: 'Nenhum estado suspenso vai direto para Executando. O processo está no disco e não pode executar de lá.' },
        { texto: 'Bloqueado: volta à memória ainda bloqueado.', correta: false, explicacao: 'Bloqueado-suspenso → Bloqueado é uma ativação, não depende do evento. E, como o evento já ocorreu, o processo não está mais bloqueado.' },
      ],
    },
    {
      id: 'm03-a03-q2',
      enunciado: 'Qual é a principal motivação para existirem os estados suspensos?',
      alternativas: [
        { texto: 'Liberar memória: como a CPU é muito mais rápida que a E/S, todos os processos na memória podem ficar bloqueados, e então alguns são levados para o disco (swapping).', correta: true, explicacao: 'Correto. É o argumento dos slides: com todos bloqueados, a CPU fica ociosa e não há espaço para processos novos. A troca para o disco libera memória.' },
        { texto: 'Acelerar a E/S, levando os processos para perto do disco.', correta: false, explicacao: 'Levar o processo para o disco não acelera a E/S dele; ao contrário, ele vai precisar de um swap-in para executar depois.' },
        { texto: 'Permitir que processos executem diretamente do disco.', correta: false, explicacao: 'Processo no disco não executa. Para executar ele precisa voltar à memória (ativação) e ser selecionado.' },
        { texto: 'Substituir o estado Bloqueado, que deixa de existir.', correta: false, explicacao: 'O Bloqueado continua existindo (processo na memória esperando evento). Os suspensos são estados a mais.' },
      ],
    },
    {
      id: 'm03-a03-q3',
      enunciado: 'Qual transição <strong>não existe</strong> no modelo de sete estados dos slides?',
      alternativas: [
        { texto: 'Apto-suspenso → Executando.', correta: true, explicacao: 'Correto, não existe. O processo está no disco: primeiro precisa ser ativado (Apto-suspenso → Apto) e depois selecionado (Apto → Executando).' },
        { texto: 'Bloqueado → Bloqueado-suspenso.', correta: false, explicacao: 'Existe: é a suspensão mais comum, quando o SO leva para o disco um processo que está esperando um evento.' },
        { texto: 'Bloqueado-suspenso → Apto-suspenso.', correta: false, explicacao: 'Existe: ocorre quando o evento esperado acontece enquanto o processo está no disco.' },
        { texto: 'Criado → Apto-suspenso.', correta: false, explicacao: 'Existe nos slides ("admissão suspenso"): o processo é admitido, mas, sem memória disponível, já começa no disco.' },
      ],
    },
    {
      id: 'm03-a03-q4',
      enunciado: 'Um programador usa um <strong>depurador</strong> e a execução para num breakpoint. Qual razão de suspensão é essa?',
      alternativas: [
        { texto: 'Solicitação do usuário.', correta: true, explicacao: 'Correto. Os slides citam a solicitação do usuário como comportamento típico de depuradores: o usuário quer examinar o processo parado.' },
        { texto: 'Swapping por falta de memória.', correta: false, explicacao: 'Swapping é decisão do SO para liberar memória. No breakpoint, quem decidiu parar foi o usuário.' },
        { texto: 'Temporização.', correta: false, explicacao: 'Temporização é para processos que executam periodicamente e ficam suspensos entre as execuções.' },
        { texto: 'O processo ficou bloqueado esperando E/S.', correta: false, explicacao: 'Bloqueio é causado por um pedido do próprio processo. No breakpoint, a parada vem de fora (o depurador, a pedido do usuário).' },
      ],
    },
    {
      id: 'm03-a03-q5',
      enunciado: 'Qual é a diferença entre um processo <strong>bloqueado</strong> e um processo <strong>suspenso</strong>?',
      alternativas: [
        { texto: 'O bloqueado espera um evento que ele mesmo pediu e sai do bloqueio quando o evento ocorre; o suspenso foi retirado da memória por decisão externa e só volta quando é ativado.', correta: true, explicacao: 'Correto. São motivos independentes, por isso existe Bloqueado-suspenso: o processo espera um evento e, além disso, está no disco.' },
        { texto: 'São a mesma coisa: suspenso é só outro nome para bloqueado.', correta: false, explicacao: 'Se fossem iguais, não haveria Apto-suspenso, um processo que não espera evento nenhum, mas está no disco.' },
        { texto: 'O suspenso está na memória e o bloqueado está no disco.', correta: false, explicacao: 'É o contrário: suspenso significa estar no disco. O Bloqueado (sem "suspenso") está na memória.' },
        { texto: 'O bloqueado foi suspenso pelo usuário; o suspenso foi bloqueado pelo SO.', correta: false, explicacao: 'O bloqueio vem do próprio processo (pedido de E/S ou espera de evento), não do usuário.' },
      ],
    },
    {
      id: 'm03-a03-q6',
      enunciado: 'A memória está cheia e o SO precisa liberar espaço. Qual processo é, em geral, a <strong>primeira escolha</strong> para ser levado ao disco?',
      alternativas: [
        { texto: 'Um processo Bloqueado, que não usaria a CPU de qualquer forma até o evento ocorrer.', correta: true, explicacao: 'Correto. Suspender um bloqueado não atrasa quem pode executar. Ele vira Bloqueado-suspenso. Só se isso não bastar o SO suspende um Apto.' },
        { texto: 'O processo Executando, porque é o que mais usa memória.', correta: false, explicacao: 'Retirar quem está executando desperdiça o trabalho do escalonador e da troca de contexto. A transição a partir de Executando existe só em alguns autores, como caso extremo.' },
        { texto: 'Um processo Apto, porque está pronto para ir ao disco.', correta: false, explicacao: 'Suspender um Apto atrasa um processo que poderia executar. Ele é escolhido só quando não há bloqueados suficientes.' },
        { texto: 'Um processo Finalizado.', correta: false, explicacao: 'Um processo finalizado tem seus recursos liberados pelo SO; não há o que levar para o disco.' },
      ],
    },
    {
      id: 'm03-a03-q7',
      enunciado: 'Qual situação leva um processo ao estado <strong>Bloqueado-suspenso</strong>?',
      alternativas: [
        { texto: 'O processo está esperando a resposta de uma leitura de rede e o SO o leva para o disco para liberar memória para um processo novo.', correta: true, explicacao: 'Correto. Duas condições: esperar um evento (bloqueado) e ter sido retirado da memória (suspenso). Swapping de um bloqueado é a situação mais comum.' },
        { texto: 'O processo termina a sua fatia de tempo e volta para a fila de aptos.', correta: false, explicacao: 'Isso é Executando → Apto. O processo continua na memória e não espera nenhum evento.' },
        { texto: 'O processo, que estava no disco já pronto para executar, é trazido de volta à memória.', correta: false, explicacao: 'Isso é a ativação Apto-suspenso → Apto. O processo sai da suspensão em vez de entrar nela.' },
        { texto: 'O processo está no disco e o evento que ele esperava acontece.', correta: false, explicacao: 'Nesse caso ele sai de Bloqueado-suspenso e vai para Apto-suspenso: deixa de esperar o evento.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm03-a03-d1',
      enunciado: 'Descreva três ou mais situações reais em que um processo vai parar no estado Bloqueado-suspenso, explicando cada uma.',
      respostaModelo: `<p>Um processo está <strong>Bloqueado-suspenso</strong> quando, ao mesmo tempo, <strong>espera um evento</strong> (está bloqueado) e <strong>foi retirado da memória para o disco</strong> (está suspenso). Situações práticas:</p>
<ol>
  <li><strong>Swapping por falta de memória:</strong> o processo pediu uma leitura de disco ou de rede e está bloqueado; chega um processo novo e não há memória. O SO escolhe esse processo bloqueado (que não usaria a CPU mesmo) e o leva para o disco: Bloqueado → Bloqueado-suspenso.</li>
  <li><strong>Pedido do usuário:</strong> o processo está esperando entrada do teclado ou de um arquivo e o usuário o pausa (Ctrl+Z no terminal ou um depurador). O SO suspende o processo, que continua esperando o evento e se torna candidato a ir para o disco (na prática, uma pausa do usuário nem sempre leva o processo ao disco).</li>
  <li><strong>Pedido do processo pai:</strong> um filho está esperando uma mensagem e o pai o suspende para sincronizar o trabalho ou examiná-lo.</li>
  <li><strong>Temporização:</strong> um processo periódico (monitoramento, estatísticas) espera o próximo intervalo de tempo e, por estar parado por muito tempo, é mantido suspenso no disco até lá.</li>
  <li><strong>Outra razão do SO</strong> (Stallings; os slides citam 4 razões): o SO suspende um processo utilitário ou de fundo, ou suspeito de causar problema, enquanto ele espera um recurso.</li>
</ol>
<p>Quando o evento ocorre, ele vai para <strong>Apto-suspenso</strong>; só volta à memória com a ativação, e nunca vai direto para Executando.</p>`,
      pontosChave: [
        'Define Bloqueado-suspenso: espera um evento e está no disco',
        'Swapping de processo bloqueado por falta de memória',
        'Pausa pedida pelo usuário (depurador, Ctrl+Z) com o processo esperando um evento',
        'Suspensão pedida pelo processo pai, por temporização ou por decisão do SO',
        'Quando o evento ocorre, vai para Apto-suspenso (não para Executando)',
      ],
    },
    {
      id: 'm03-a03-d2',
      enunciado: 'Descreva o diagrama de estados de processos com sete estados, explicando o que muda em relação ao modelo de cinco estados.',
      respostaModelo: `<p>O modelo de cinco estados (Criado, Apto, Executando, Bloqueado, Finalizado) supõe que todos os processos estão na memória. Como a CPU é muito mais rápida que a E/S, todos podem ficar bloqueados, ocupando a memória. O SO passa então a levar processos para o disco (<strong>swapping</strong>), e surgem dois estados: <strong>Apto-suspenso</strong> (no disco, pronto para executar) e <strong>Bloqueado-suspenso</strong> (no disco, esperando evento).</p>
<p><strong>Transições mantidas:</strong> Criado → Apto (admissão), Apto → Executando (seleção), Executando → Apto (fim do quantum/preempção), Executando → Bloqueado (espera evento), Bloqueado → Apto (evento ocorre), Executando → Finalizado (término normal; cancelamento ou intervenção do SO também podem encerrar um Apto ou Bloqueado).</p>
<p><strong>Transições novas:</strong> Bloqueado → Bloqueado-suspenso e Apto → Apto-suspenso (suspensão); Apto-suspenso → Apto e Bloqueado-suspenso → Bloqueado (ativação); Bloqueado-suspenso → Apto-suspenso (o evento ocorre com o processo no disco); Criado → Apto-suspenso (admissão sem memória disponível).</p>
<p>Razões para suspender: falta de memória, decisão do SO, pedido do usuário, temporização e pedido do processo pai. Nenhum estado suspenso vai direto para Executando.</p>`,
      pontosChave: [
        'Motivação: memória cheia de processos bloqueados; swapping para o disco',
        'Define Apto-suspenso e Bloqueado-suspenso',
        'Transições de suspensão e ativação entre cada estado e seu par suspenso',
        'Bloqueado-suspenso → Apto-suspenso quando o evento ocorre',
        'Mantém as transições do modelo de cinco estados',
      ],
    },
  ],
});
