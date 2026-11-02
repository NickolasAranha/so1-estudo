// Módulo 5, aula 1: programa sequencial x concorrente, paralelismo real x aparente, premissas, vantagens e desvantagens.
SO1.registerLesson({
  id: 'm05-a01',
  titulo: 'Programação concorrente',
  fontes: [
    'Slides cap3 (Oliveira/Carissimi/Toscani, UFRGS): introdução, motivação, exemplo do servidor de impressão, desvantagens, comentários gerais',
    'Tanenbaum, SO Modernos 3ª ed., §2.1 (pseudoparalelismo, p.50) e §2.3 (p.70)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a cozinha de um restaurante.</strong> Um cozinheiro sozinho prepara três pratos: mexe o molho, vira o bife, volta ao molho, tempera a salada... Os três pratos estão "em preparo" ao mesmo tempo, mas a cada instante ele só mexe em <em>um</em>. Agora imagine três cozinheiros, um em cada prato: aí sim os pratos são feitos <em>ao mesmo tempo de verdade</em>.</p>
  <p>Nos dois casos, se todos os pratos são do <strong>mesmo pedido</strong> e precisam sair juntos, os cozinheiros têm de <strong>combinar</strong> entre si (quem usa o forno, quando servir). Isso é programação concorrente: vários fluxos trabalhando numa tarefa comum, e <strong>conversando</strong> para não atrapalhar uns aos outros.</p>
</div>

<h2>Programa sequencial x programa concorrente</h2>
<table>
  <tr><th></th><th>Programa sequencial</th><th>Programa concorrente</th></tr>
  <tr><td><strong>Quem executa</strong></td><td>Apenas <strong>um processo</strong>.</td><td><strong>Vários processos</strong> (ou threads) que <strong>cooperam</strong> entre si para realizar uma tarefa (aplicação).</td></tr>
  <tr><td><strong>Fluxos de controle</strong></td><td>Existe <strong>um único</strong> fluxo de controle.</td><td>Existem <strong>vários</strong> fluxos de controle.</td></tr>
  <tr><td><strong>Interação</strong></td><td>Não precisa.</td><td>Precisa de <strong>interação para troca de informações</strong>, ou seja, <strong>sincronização</strong>.</td></tr>
</table>
<p>Os processos de um programa concorrente <strong>disputam recursos comuns</strong> (variáveis, periféricos...). Um processo é <strong>cooperante</strong> quando é capaz de <strong>afetar, ou ser afetado</strong>, pela execução de outro processo. Processos que não afetam nem são afetados por ninguém são <strong>independentes</strong>.</p>

<h2>Paralelismo real x paralelismo aparente</h2>
<ul>
  <li><strong>Paralelismo real</strong>: só ocorre em <strong>máquinas multiprocessadoras</strong> (várias CPUs ou núcleos). Duas instruções de processos diferentes são executadas <strong>no mesmo instante</strong>.</li>
  <li><strong>Paralelismo aparente</strong> (<strong>concorrência</strong>, ou <strong>pseudoparalelismo</strong> no Tanenbaum): ocorre em <strong>máquinas monoprocessadoras</strong>. A CPU alterna rapidamente entre os processos (multiprogramação), e o usuário tem a ilusão de que tudo roda junto.</li>
</ul>
<p>Daí vem uma distinção importante:</p>
<ul>
  <li><strong>Execução simultânea</strong>: os processos estão <strong>executando instruções no mesmo instante</strong>, cada um numa CPU. É o paralelismo real.</li>
  <li><strong>Estar "em estado de execução" simultaneamente</strong>: os processos <strong>já começaram e ainda não terminaram</strong>; todos estão "em andamento", mas a CPU única executa <strong>um de cada vez</strong>, e os outros esperam no estado Apto (pronto) ou Bloqueado. É o paralelismo aparente.</li>
</ul>

<figure class="diagrama">
  <svg viewBox="0 0 520 250" style="max-width:640px" role="img" aria-label="Linha do tempo: com uma CPU os processos A, B e C se alternam; com três CPUs executam ao mesmo tempo">
    <g font-size="13" fill="currentColor">
      <text x="10" y="22" font-weight="bold">1 CPU: paralelismo aparente (concorrência)</text>
      <text x="10" y="52">CPU</text>
      <text x="10" y="142" font-weight="bold">3 CPUs: paralelismo real</text>
      <text x="10" y="172">CPU 1</text>
      <text x="10" y="197">CPU 2</text>
      <text x="10" y="222">CPU 3</text>
    </g>
    <g stroke="currentColor" stroke-width="1">
      <rect x="60" y="36" width="60" height="24" style="fill:var(--azul-claro)"/>
      <rect x="120" y="36" width="60" height="24" style="fill:var(--verde-claro)"/>
      <rect x="180" y="36" width="60" height="24" style="fill:var(--ambar-claro)"/>
      <rect x="240" y="36" width="60" height="24" style="fill:var(--azul-claro)"/>
      <rect x="300" y="36" width="60" height="24" style="fill:var(--verde-claro)"/>
      <rect x="360" y="36" width="60" height="24" style="fill:var(--ambar-claro)"/>
      <rect x="420" y="36" width="60" height="24" style="fill:var(--azul-claro)"/>
      <rect x="60" y="156" width="180" height="22" style="fill:var(--azul-claro)"/>
      <rect x="60" y="181" width="180" height="22" style="fill:var(--verde-claro)"/>
      <rect x="60" y="206" width="180" height="22" style="fill:var(--ambar-claro)"/>
    </g>
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <text x="90" y="53">A</text><text x="150" y="53">B</text><text x="210" y="53">C</text>
      <text x="270" y="53">A</text><text x="330" y="53">B</text><text x="390" y="53">C</text><text x="450" y="53">A</text>
      <text x="150" y="172">A</text><text x="150" y="197">B</text><text x="150" y="222">C</text>
    </g>
    <g fill="none" stroke="currentColor">
      <path d="M60 72 H490" /><path d="M484 68 L490 72 L484 76"/>
      <path d="M60 238 H490" /><path d="M484 234 L490 238 L484 242"/>
    </g>
    <g font-size="12" fill="currentColor">
      <text x="440" y="88">tempo</text>
      <text x="60" y="105">A, B e C estão todos "em estado de execução",</text>
      <text x="60" y="121">mas a cada instante só um executa de fato.</text>
      <text x="260" y="185">execução simultânea:</text>
      <text x="260" y="201">no mesmo instante, cada</text>
      <text x="260" y="217">processo na sua CPU</text>
    </g>
  </svg>
  <figcaption>Com uma CPU, os processos se revezam (paralelismo aparente): estão em execução "ao mesmo tempo" só no sentido de que todos começaram e nenhum terminou. Com várias CPUs, executam no mesmo instante (paralelismo real).</figcaption>
</figure>

<h2>Por que programar de forma concorrente (vantagens)</h2>
<ul>
  <li><strong>Aumento de desempenho</strong>:
    <ul>
      <li>explora o <strong>paralelismo real</strong> das máquinas multiprocessadoras (cada parte da tarefa numa CPU);</li>
      <li>permite a <strong>sobreposição de E/S com processamento</strong>: enquanto um fluxo espera o disco ou a rede, outro usa a CPU. Isso vale até numa máquina com uma CPU só.</li>
    </ul>
  </li>
  <li><strong>Facilidade de desenvolvimento</strong> de aplicações que têm um <strong>paralelismo intrínseco</strong>: problemas que já são "naturalmente" formados por atividades independentes (um servidor que atende vários clientes, um editor que corrige a ortografia enquanto você digita) ficam mais simples de escrever como vários fluxos do que como um só.</li>
</ul>

<h2>Desvantagens</h2>
<ul>
  <li><strong>Programação complexa</strong>.</li>
  <li>Aos erros "comuns" se somam <strong>erros próprios do modelo</strong>, que vêm das <strong>diferenças de velocidade relativa</strong> entre os processos (quem chega primeiro a uma variável compartilhada?).</li>
  <li><strong>Não determinismo</strong>: os processos paralelos podem ser executados em qualquer ordem. Duas execuções do mesmo programa, com os <strong>mesmos dados de entrada</strong>, podem dar <strong>resultados diferentes</strong>. Isso não é necessariamente um erro, mas, quando é, o erro aparece só de vez em quando.</li>
  <li><strong>Depuração difícil</strong>: como o erro depende da ordem de execução, ele pode não se repetir quando você roda de novo para investigar.</li>
</ul>

<h2>Premissas para uma aplicação ser concorrente</h2>
<p>Para que faça sentido (e funcione) escrever uma aplicação concorrente, é preciso que:</p>
<ol>
  <li>a tarefa possa ser <strong>dividida em partes</strong> que possam avançar ao mesmo tempo (paralelismo na própria tarefa);</li>
  <li>essas partes sejam executadas por <strong>vários processos ou threads</strong> (vários fluxos de controle), o que exige um SO com multiprogramação e uma forma de criar esses fluxos;</li>
  <li>os fluxos <strong>cooperem para um objetivo comum</strong> e, por isso, <strong>interajam</strong>: troquem informações e compartilhem recursos;</li>
  <li>haja <strong>mecanismos de sincronização e comunicação</strong> que garantam um resultado <strong>correto qualquer que seja a ordem e a velocidade</strong> de execução de cada fluxo (sem supor nada sobre o número de CPUs ou suas velocidades).</li>
</ol>

<div class="exemplo">
  <p><strong>Exemplo dos slides: um servidor de impressão concorrente.</strong> Em vez de um programa único que faz tudo em sequência, o servidor é dividido em processos que cooperam. Uma divisão possível, com os nomes do slide:</p>
  <table>
    <tr><th>Processo</th><th>O que faz</th><th>Coopera com</th></tr>
    <tr><td><strong>Receptor</strong></td><td>Recebe da rede os pedidos de impressão.</td><td>Passa os pedidos ao Protocolo.</td></tr>
    <tr><td><strong>Protocolo</strong></td><td>Interpreta as mensagens e controla a conversa com os clientes.</td><td>Repassa os dados ao Escritor e as respostas ao Transmissor.</td></tr>
    <tr><td><strong>Transmissor</strong></td><td>Envia respostas (confirmações) aos clientes pela rede.</td><td>Recebe as respostas do Protocolo.</td></tr>
    <tr><td><strong>Escritor</strong></td><td>Grava os arquivos recebidos na fila de impressão (spool, em disco).</td><td>Deposita na fila que o Leitor consome.</td></tr>
    <tr><td><strong>Leitor</strong></td><td>Retira da fila o próximo arquivo a imprimir.</td><td>Entrega ao Impressor.</td></tr>
    <tr><td><strong>Impressor</strong></td><td>Envia os dados para a impressora.</td><td>Recebe do Leitor.</td></tr>
  </table>
  <p>Ganho: enquanto o Impressor espera a impressora (lenta), o Receptor continua aceitando pedidos e o Escritor continua gravando, ou seja, há <strong>sobreposição de E/S com processamento</strong>. Custo: Escritor e Leitor mexem na <strong>mesma fila</strong> e precisam de <strong>sincronização</strong>, senão um pedido pode se perder. É esse problema que as próximas aulas resolvem.</p>
</div>

<h2>E rodar o MS-Word 10 vezes, é concorrência?</h2>
<p><strong>Não é programação (aplicação) concorrente.</strong> As 10 instâncias são <strong>10 processos independentes</strong> do mesmo programa: cada um tem seu próprio espaço de endereçamento, edita seu próprio documento e <strong>não coopera nem troca informação</strong> com os outros para realizar uma tarefa comum. Cada instância, sozinha, é um programa <strong>sequencial</strong>.</p>
<p>Os 10 processos <strong>concorrem</strong> pela CPU e pelos recursos (memória, disco): o SO os reveza por <strong>multiprogramação</strong>, com paralelismo aparente se houver uma CPU só. Mas eles <strong>não formam um programa concorrente</strong>: não cooperam nem interagem (não afetam nem são afetados uns pelos outros) para realizar uma tarefa comum, e por isso não precisam de sincronização entre si.</p>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Paralelismo real exige mais de uma CPU.</strong> Numa máquina com uma CPU só existe paralelismo <em>aparente</em>, mesmo que pareça que tudo roda junto.</li>
    <li>"Estar em estado de execução simultaneamente" <strong>não</strong> é "executar no mesmo instante". É ter começado e ainda não terminado, revezando a CPU.</li>
    <li>Resultado diferente com a mesma entrada <strong>não é necessariamente erro</strong> num programa concorrente; é consequência do não determinismo. Mas se o resultado <em>correto</em> depende da ordem, há uma condição de corrida (aula 3).</li>
    <li>Vários processos rodando ≠ programa concorrente. Eles concorrem pela CPU, mas, sem <strong>cooperação/interação</strong> numa tarefa comum, há só multiprogramação, e não uma aplicação concorrente (caso do Word 10 vezes).</li>
  </ul>
</div>
`,
  resumo: 'Programa sequencial tem um só fluxo de controle; programa concorrente tem vários processos que cooperam numa tarefa e precisam de sincronização. Paralelismo real (execução simultânea) só existe com várias CPUs; com uma CPU há paralelismo aparente: os processos estão "em estado de execução" ao mesmo tempo, mas se revezam. A concorrência traz desempenho (multiprocessador, sobreposição de E/S) e facilidade para problemas com paralelismo intrínseco, ao custo de programação complexa, não determinismo e depuração difícil. Rodar o Word 10 vezes não é programação concorrente: os 10 processos concorrem pela CPU (multiprogramação), mas são independentes e não cooperam numa tarefa comum.',
  questoes: [
    {
      id: 'm05-a01-q1',
      enunciado: 'Qual alternativa diferencia corretamente "execução simultânea" de "estar em estado de execução simultaneamente"?',
      alternativas: [
        { texto: 'Execução simultânea é paralelismo real (instruções no mesmo instante, em CPUs diferentes); estar em estado de execução simultaneamente é paralelismo aparente (todos começaram e não terminaram, mas revezam uma CPU).', correta: true, explicacao: 'Correto. Esta é a distinção dos slides: no paralelismo real cada processo tem sua CPU; no aparente os processos estão "em andamento" juntos, mas a CPU executa um de cada vez.' },
        { texto: 'São sinônimos: os dois termos descrevem processos rodando em várias CPUs.', correta: false, explicacao: 'Os slides fazem questão de separar os termos ("purismo"). Só a execução simultânea exige várias CPUs; estar em estado de execução simultaneamente acontece com uma CPU só.' },
        { texto: 'Execução simultânea ocorre em máquinas monoprocessadoras; estar em estado de execução ocorre só em multiprocessadoras.', correta: false, explicacao: 'Está invertido. Com uma CPU não há como duas instruções executarem no mesmo instante, por isso execução simultânea exige multiprocessador.' },
        { texto: 'Estar em estado de execução simultaneamente significa que os processos estão todos no estado Executando ao mesmo tempo numa única CPU.', correta: false, explicacao: 'Numa CPU só há um processo no estado Executando por vez. Os demais "em execução" no sentido amplo estão Aptos (prontos) ou Bloqueados, aguardando a vez.' },
      ],
    },
    {
      id: 'm05-a01-q2',
      enunciado: 'Executar o MS-Word 10 vezes na mesma máquina caracteriza programação concorrente?',
      alternativas: [
        { texto: 'Não. São 10 processos independentes, que não cooperam nem trocam informações para uma tarefa comum; há apenas multiprogramação (competição pela CPU).', correta: true, explicacao: 'Correto. Os 10 processos concorrem pela CPU e pelos recursos (multiprogramação, paralelismo aparente), mas não formam um programa concorrente: não cooperam nem interagem para uma tarefa comum. Cada instância é um programa sequencial.' },
        { texto: 'Sim, porque os 10 processos estão em estado de execução ao mesmo tempo.', correta: false, explicacao: 'Estar em estado de execução ao mesmo tempo mostra que os processos concorrem pela CPU (multiprogramação, paralelismo aparente), mas não faz deles um programa concorrente: para isso, eles teriam de cooperar e interagir numa tarefa comum, o que não acontece aqui.' },
        { texto: 'Sim, mas só se a máquina tiver mais de uma CPU.', correta: false, explicacao: 'O número de CPUs decide se o paralelismo é real ou aparente, não se há cooperação. Com 1 ou 8 CPUs, as instâncias continuam independentes.' },
        { texto: 'Sim, porque todas as instâncias executam o mesmo código.', correta: false, explicacao: 'Executar o mesmo código não cria cooperação. Cada instância tem seu espaço de endereçamento e seus próprios dados, sem interagir com as outras.' },
      ],
    },
    {
      id: 'm05-a01-q3',
      enunciado: 'Em uma máquina com <strong>uma única CPU</strong>, três processos de uma aplicação concorrente estão ativos. Que tipo de paralelismo existe?',
      alternativas: [
        { texto: 'Paralelismo aparente (concorrência): a CPU alterna entre os processos.', correta: true, explicacao: 'Correto. Com uma CPU só um processo executa por vez; a alternância rápida dá a ilusão de que os três rodam juntos (pseudoparalelismo).' },
        { texto: 'Paralelismo real, pois os três estão ativos.', correta: false, explicacao: 'Paralelismo real só ocorre em máquinas multiprocessadoras, onde instruções de processos diferentes executam no mesmo instante.' },
        { texto: 'Nenhum: com uma CPU não é possível ter programa concorrente.', correta: false, explicacao: 'É possível sim. O programa continua concorrente (vários fluxos que cooperam); só que o paralelismo é aparente.' },
        { texto: 'Paralelismo real, desde que haja sobreposição de E/S com processamento.', correta: false, explicacao: 'A sobreposição de E/S com CPU é uma vantagem da concorrência, mas não transforma o paralelismo em real: continua havendo uma única CPU executando instruções.' },
      ],
    },
    {
      id: 'm05-a01-q4',
      enunciado: 'Um programa concorrente foi executado duas vezes com os <strong>mesmos dados de entrada</strong> e produziu resultados diferentes. O que se pode concluir?',
      alternativas: [
        { texto: 'Não é necessariamente um erro: processos paralelos podem executar em qualquer ordem (não determinismo).', correta: true, explicacao: 'Correto. Os slides dizem exatamente isso. Se o resultado correto depender da ordem, aí há um problema (condição de corrida) que precisa de sincronização.' },
        { texto: 'Com certeza o compilador gerou código errado.', correta: false, explicacao: 'Não há motivo para culpar o compilador. A diferença vem das velocidades relativas e da ordem em que o SO escalona os processos.' },
        { texto: 'É impossível: um programa sempre produz o mesmo resultado para a mesma entrada.', correta: false, explicacao: 'Isso vale para programas sequenciais. Programas concorrentes são não determinísticos, uma das desvantagens listadas nos slides.' },
        { texto: 'O hardware está com defeito na memória.', correta: false, explicacao: 'A causa normal é a ordem de execução dos processos, que varia a cada execução, e não falha de hardware.' },
      ],
    },
    {
      id: 'm05-a01-q5',
      enunciado: 'Qual item é uma <strong>vantagem</strong> da programação concorrente segundo os slides?',
      alternativas: [
        { texto: 'Sobrepor operações de E/S com processamento.', correta: true, explicacao: 'Correto. Enquanto um fluxo espera a E/S, outro usa a CPU. Junto com a exploração de multiprocessadores e a facilidade para problemas com paralelismo intrínseco, é uma das motivações.' },
        { texto: 'Facilitar a depuração, pois os erros sempre se repetem.', correta: false, explicacao: 'É o contrário: a depuração fica difícil, porque o erro depende da ordem de execução e pode não se repetir.' },
        { texto: 'Eliminar a necessidade de sincronização entre processos.', correta: false, explicacao: 'Programa concorrente é justamente o que mais precisa de sincronização, já que os fluxos interagem e compartilham recursos.' },
        { texto: 'Garantir que o programa execute sempre na mesma ordem.', correta: false, explicacao: 'A concorrência introduz não determinismo; a ordem pode mudar a cada execução.' },
      ],
    },
    {
      id: 'm05-a01-q6',
      enunciado: 'Segundo os slides, um processo é dito <strong>cooperante</strong> quando:',
      alternativas: [
        { texto: 'é capaz de afetar, ou ser afetado, pela execução de outro processo.', correta: true, explicacao: 'Correto. É a definição dos slides UFRGS. Processos cooperantes compartilham dados ou trocam informações e por isso precisam de sincronização.' },
        { texto: 'executa sempre em paralelo real com outro processo.', correta: false, explicacao: 'Cooperação não depende do número de CPUs. Processos cooperantes podem rodar com paralelismo real ou aparente.' },
        { texto: 'cede voluntariamente a CPU a outro processo.', correta: false, explicacao: 'Ceder a CPU tem a ver com escalonamento (não preemptivo), não com a definição de processo cooperante.' },
        { texto: 'não compartilha nenhum recurso com outros processos.', correta: false, explicacao: 'Isso descreve um processo independente, o oposto de cooperante.' },
      ],
    },
    {
      id: 'm05-a01-q7',
      enunciado: 'Qual alternativa <strong>não</strong> é uma premissa para uma aplicação ser concorrente?',
      alternativas: [
        { texto: 'A máquina precisa ter obrigatoriamente mais de um processador.', correta: true, explicacao: 'Correto: isso não é premissa. Com uma CPU a aplicação continua concorrente, só que com paralelismo aparente. Várias CPUs permitem paralelismo real, mas não são obrigatórias.' },
        { texto: 'A tarefa deve poder ser dividida em partes que avançam ao mesmo tempo, executadas por vários processos ou threads.', correta: false, explicacao: 'É premissa: sem várias partes e vários fluxos de controle, o programa é sequencial.' },
        { texto: 'Os processos devem cooperar e interagir (trocar informações, compartilhar recursos).', correta: false, explicacao: 'É premissa: cooperação é o que diferencia uma aplicação concorrente de processos independentes rodando juntos.' },
        { texto: 'Deve haver mecanismos de sincronização que garantam resultado correto qualquer que seja a velocidade de cada processo.', correta: false, explicacao: 'É premissa: como as velocidades relativas variam, sem sincronização o resultado pode ficar errado.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm05-a01-d1',
      enunciado: 'Qual a diferença entre dois processos executarem simultaneamente e dois processos estarem, ao mesmo tempo, em estado de execução?',
      respostaModelo: `<p><strong>Execução simultânea</strong> é o <strong>paralelismo real</strong>: dois ou mais processos executam instruções <strong>no mesmo instante</strong>, cada um em um processador. Só ocorre em máquinas <strong>multiprocessadoras</strong> (várias CPUs ou núcleos).</p>
<p><strong>Estar em estado de execução simultaneamente</strong> é o <strong>paralelismo aparente</strong> (concorrência ou pseudoparalelismo): os processos <strong>já foram iniciados e ainda não terminaram</strong>, portanto estão todos "em andamento", mas uma única CPU os executa <strong>um de cada vez</strong>, alternando rapidamente entre eles (multiprogramação). Enquanto um está Executando, os outros esperam Aptos (prontos) ou Bloqueados. Para o usuário parece que rodam juntos, mas em cada instante só um executa de fato. Ocorre em máquinas monoprocessadoras.</p>`,
      pontosChave: [
        'Execução simultânea = paralelismo real, instruções no mesmo instante',
        'Execução simultânea exige mais de um processador',
        'Estar em estado de execução = paralelismo aparente/concorrência: todos iniciados e não terminados',
        'Com uma CPU, os processos se revezam (só um executa por vez, os outros Aptos ou Bloqueados)',
      ],
    },
    {
      id: 'm05-a01-d2',
      enunciado: 'O que uma aplicação precisa ter para ser concorrente (paralela)? Discuta as vantagens e as desvantagens dessa abordagem.',
      respostaModelo: `<p><strong>Premissas:</strong> a tarefa precisa poder ser <strong>dividida em partes</strong> que avancem ao mesmo tempo; essas partes são executadas por <strong>vários processos ou threads</strong> (vários fluxos de controle, o que exige SO com multiprogramação); os fluxos <strong>cooperam</strong> para um objetivo comum e, por isso, <strong>interagem</strong> (trocam informações e compartilham recursos); e devem existir <strong>mecanismos de sincronização/comunicação</strong> que garantam resultado correto independentemente da ordem e da velocidade relativa de cada fluxo.</p>
<p><strong>Vantagens:</strong> aumento de desempenho, explorando o paralelismo real de máquinas multiprocessadoras e sobrepondo E/S com processamento; facilidade para desenvolver aplicações que já têm paralelismo intrínseco (ex.: servidor que atende vários clientes).</p>
<p><strong>Desvantagens:</strong> programação mais complexa; surgem erros próprios do modelo, causados pelas diferenças de velocidade entre os processos (condições de corrida); comportamento não determinístico (a mesma entrada pode gerar resultados diferentes); depuração difícil, pois o erro pode não se repetir.</p>`,
      pontosChave: [
        'Premissa: tarefa dividida em partes executadas por vários processos/threads',
        'Premissa: os processos cooperam e interagem, exigindo sincronização/comunicação',
        'Vantagens: desempenho (multiprocessador e/ou sobreposição de E/S com CPU) e facilidade para problemas com paralelismo intrínseco',
        'Desvantagens: programação complexa, não determinismo e depuração difícil',
      ],
    },
  ],
});
