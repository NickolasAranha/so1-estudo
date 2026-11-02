// Módulo 4, aula 1: multiprogramação pesada x leve, o que a thread compartilha e o que é dela, vantagens e exemplos.
SO1.registerLesson({
  id: 'm04-a01',
  titulo: 'Processos x threads',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.2.1 O uso de thread (p.57–60) e §2.2.2 O modelo de thread clássico (p.60–62)',
    'Slides cap4 (Oliveira/Carissimi/Toscani, UFRGS): vários processos x vários fluxos, multiprogramação pesada e leve, threads e processos, vantagens, por que utilizar threads',
    'Silberschatz, Fundamentos de SO: benefícios do multithreading (capacidade de resposta, compartilhamento de recursos, economia, escalabilidade)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a cozinha de um restaurante.</strong> Montar um restaurante novo é caro: alugar o ponto, comprar fogão, geladeira, panelas, abastecer a despensa. Se o movimento aumenta, ninguém abre um segundo restaurante só para fritar batatas; contrata-se <em>mais um cozinheiro</em> para a mesma cozinha. Os cozinheiros dividem o fogão, a despensa e o livro de receitas, mas cada um tem a <em>sua</em> tábua, o <em>seu</em> pedido na mão e sabe em que passo da receita parou.</p>
  <p>O restaurante é o <strong>processo</strong> (agrupa os recursos). Cada cozinheiro é uma <strong>thread</strong> (um fluxo de execução). Contratar um cozinheiro é muito mais barato e rápido do que abrir outro restaurante. Em compensação, nada impede um cozinheiro de pegar a panela do outro: eles precisam se coordenar.</p>
</div>

<h2>Multiprogramação pesada: um fluxo por processo</h2>
<p>No modelo tradicional, cada processo tem <strong>um espaço de endereçamento</strong> e <strong>um único fluxo de controle</strong> (uma thread). Para fazer várias coisas ao mesmo tempo, cria-se vários processos. É a <strong>multiprogramação pesada</strong>, porque a unidade manipulada é o processo inteiro, e isso custa caro:</p>
<ul>
  <li><strong>Criação do processo</strong>: alocar espaço de endereçamento, BDP, tabelas.</li>
  <li><strong>Troca de contexto</strong>: trocar de processo exige atualizar estruturas internas do SO (contexto, espaço de endereçamento etc.).</li>
  <li><strong>Proteção e memória virtual</strong>: cada processo é isolado dos outros, e esse isolamento tem um preço.</li>
  <li><strong>Comunicação (IPC)</strong>: como os processos não enxergam a memória um do outro, conversar exige mecanismos do núcleo (<em>Inter Process Communication</em>) que manipulam as estruturas complexas que representam o processo.</li>
</ul>
<p>Esses custos limitam a interação entre processos. A solução foi <strong>"aliviar" o peso</strong>: reduzir as estruturas envolvidas.</p>

<h2>Multiprogramação leve: vários fluxos no mesmo processo</h2>
<p>A <strong>thread</strong> (fluxo de execução, "linha de execução") é a abstração de um fluxo de instruções. Um fluxo é implementado basicamente por um <strong>contador de programa (PC)</strong> e uma <strong>pilha (SP)</strong>. Na <strong>multiprogramação leve</strong>, um mesmo processo contém <strong>várias threads</strong>, que compartilham código, dados e o descritor do processo, e se comunicam pela <strong>memória compartilhada</strong>. A unidade de execução deixa de ser o programa inteiro e passa a ser uma <strong>função</strong> do programa.</p>
<p>O Tanenbaum separa dois conceitos que no modelo clássico vinham juntos:</p>
<ul>
  <li><strong>Processo</strong> = <strong>agrupamento de recursos</strong>: espaço de endereçamento (código e dados), arquivos abertos, processos filhos, alarmes, sinais, informação de contabilidade.</li>
  <li><strong>Thread</strong> = <strong>entidade escalonada para execução na CPU</strong>: tem seu contador de programa, seus registradores e sua pilha.</li>
</ul>
<p>Como as threads têm algumas propriedades de processos, também são chamadas de <strong>processos leves</strong> (<em>lightweight processes</em>). O termo <strong>multithread</strong> descreve a situação em que um processo tem várias threads.</p>

<figure class="diagrama">
  <svg viewBox="0 0 480 330" style="max-width:600px" role="img" aria-label="Um processo com três threads: código, dados e arquivos são compartilhados; cada thread tem PC, registradores, pilha e estado próprios">
    <rect x="10" y="10" width="460" height="290" rx="10" fill="none" style="stroke:var(--azul)" stroke-width="2"/>
    <text x="240" y="32" font-size="15" font-weight="bold" text-anchor="middle" fill="currentColor">Processo (agrupa os recursos)</text>
    <rect x="30" y="44" width="420" height="72" rx="8" style="fill:var(--azul-claro);stroke:var(--azul)"/>
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <text x="240" y="64" font-weight="bold">Compartilhado por todas as threads</text>
      <text x="240" y="85">Espaço de endereçamento: código + variáveis globais</text>
      <text x="240" y="105">Arquivos abertos · processos filhos · sinais · contabilidade</text>
    </g>
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <rect x="40" y="130" width="120" height="155" rx="8" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <rect x="180" y="130" width="120" height="155" rx="8" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <rect x="320" y="130" width="120" height="155" rx="8" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <text x="100" y="150" font-weight="bold">Thread 1</text>
      <text x="240" y="150" font-weight="bold">Thread 2</text>
      <text x="380" y="150" font-weight="bold">Thread 3</text>
      <path d="M100 157 q6 5 0 10 q-6 5 0 10" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M240 157 q6 5 0 10 q-6 5 0 10" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M380 157 q6 5 0 10 q-6 5 0 10" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="100" y="200">PC</text><text x="100" y="220">Registradores</text><text x="100" y="240">Pilha</text><text x="100" y="260">Estado</text>
      <text x="240" y="200">PC</text><text x="240" y="220">Registradores</text><text x="240" y="240">Pilha</text><text x="240" y="260">Estado</text>
      <text x="380" y="200">PC</text><text x="380" y="220">Registradores</text><text x="380" y="240">Pilha</text><text x="380" y="260">Estado</text>
    </g>
    <text x="240" y="322" font-size="13" text-anchor="middle" fill="currentColor">Em cima: o que é do processo. Embaixo: o que é de cada thread.</text>
  </svg>
  <figcaption>Um processo com três threads. As threads enxergam a mesma memória e os mesmos arquivos; o que cada uma tem de seu é o mínimo para ser um fluxo independente: <strong>PC, registradores, pilha e estado</strong>.</figcaption>
</figure>

<h3>O que é compartilhado e o que é próprio (Tabela 2.4 do Tanenbaum)</h3>
<table>
  <tr><th>Itens por processo (compartilhados pelas threads)</th><th>Itens por thread (próprios)</th></tr>
  <tr><td>Espaço de endereçamento</td><td>Contador de programa (PC)</td></tr>
  <tr><td>Variáveis globais</td><td>Registradores</td></tr>
  <tr><td>Arquivos abertos</td><td>Pilha</td></tr>
  <tr><td>Processos filhos</td><td>Estado</td></tr>
  <tr><td>Alarmes pendentes; sinais e manipuladores de sinais; informação de contabilidade</td><td>&nbsp;</td></tr>
</table>
<p>Por que cada thread precisa da <strong>própria pilha</strong>? Porque cada uma chama funções diferentes, e a pilha guarda as variáveis locais e o endereço de retorno de cada função chamada que ainda não terminou. Se duas threads usassem a mesma pilha, uma apagaria a história de execução da outra.</p>
<p>Consequências do compartilhamento:</p>
<ul>
  <li>Se uma thread abre um arquivo, ele fica visível para as outras threads do processo: o arquivo é do <strong>processo</strong>.</li>
  <li><strong>Não há proteção entre threads</strong> do mesmo processo: uma pode ler, escrever ou até apagar a pilha da outra. Isso é aceitável porque o processo pertence a um único usuário, que criou as threads para <em>cooperar</em>, não para competir. Já processos diferentes podem ser de usuários diferentes e hostis, por isso são isolados.</li>
  <li>Como compartilham variáveis, as threads precisam de <strong>sincronização</strong> (assunto do módulo de concorrência).</li>
</ul>

<h3>Estados de uma thread</h3>
<p>Assim como um processo, uma thread pode estar <strong>Executando</strong>, <strong>Bloqueada</strong>, <strong>Apta (pronta)</strong> ou <strong>Finalizada</strong>, com as mesmas transições do diagrama de estados de processos. Exemplo: uma thread que faz <code>read</code> do teclado fica Bloqueada até a tecla chegar.</p>

<h3>As 4 combinações entre processos e threads</h3>
<figure class="diagrama">
  <svg viewBox="0 0 480 260" style="max-width:560px" role="img" aria-label="Quatro combinações: um processo uma thread; um processo várias threads; vários processos com uma thread cada; vários processos com várias threads cada">
    <g fill="none" style="stroke:var(--azul)" stroke-width="2">
      <rect x="95" y="15" width="50" height="62" rx="6"/>
      <rect x="320" y="15" width="80" height="62" rx="6"/>
      <rect x="66" y="145" width="30" height="62" rx="6"/><rect x="105" y="145" width="30" height="62" rx="6"/><rect x="144" y="145" width="30" height="62" rx="6"/>
      <rect x="304" y="145" width="52" height="62" rx="6"/><rect x="364" y="145" width="52" height="62" rx="6"/>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="2">
      <path d="M120 31 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M340 31 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M360 31 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M380 31 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/>
      <path d="M81 161 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M120 161 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M159 161 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M316 161 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M330 161 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M344 161 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M383 161 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/><path d="M397 161 q5 5 0 10 q-5 5 0 10 q5 5 0 10"/>
    </g>
    <g font-size="14" text-anchor="middle" fill="currentColor">
      <text x="120" y="98" font-weight="bold">1 processo, 1 thread</text>
      <text x="360" y="98" font-weight="bold">1 processo, N threads</text>
      <text x="120" y="228" font-weight="bold">N processos, 1 thread cada</text>
      <text x="360" y="228" font-weight="bold">N processos, N threads cada</text>
      <g font-size="13" style="fill:var(--suave)">
        <text x="120" y="118">ex.: MS-DOS</text>
        <text x="360" y="118">ex.: máquina virtual Java</text>
        <text x="120" y="248">ex.: UNIX antigo</text>
        <text x="360" y="248">ex.: Windows, Linux</text>
      </g>
    </g>
  </svg>
  <figcaption>As variações possíveis entre processos e threads (slides cap4). Cada retângulo é um processo; cada linha ondulada, uma thread. Os SOs atuais são multiprocesso e multithread.</figcaption>
</figure>

<h2>Por que usar threads: as vantagens</h2>
<p>Os slides e o Tanenbaum dão as razões; o Silberschatz as resume em quatro palavras que valem decorar:</p>
<table>
  <tr><th>Vantagem</th><th>O que significa</th></tr>
  <tr><td><strong>Capacidade de resposta</strong></td><td>Uma thread pode continuar atendendo o usuário enquanto outra está bloqueada ou fazendo um trabalho demorado. Permite associar threads a dispositivos de E/S e <strong>sobrepor cálculo com E/S</strong>. Resultado: melhor tempo de resposta e mais trabalho por unidade de tempo (<em>throughput</em>). <em>Obs.: o slide diz "aumentar tempo de resposta"; o sentido é melhorar (reduzir) o tempo de resposta.</em></td></tr>
  <tr><td><strong>Compartilhamento de recursos</strong></td><td>As threads dividem o espaço de endereçamento: comunicam-se pela memória compartilhada, <strong>sem interação com o núcleo</strong>. Isso é essencial em aplicações em que várias atividades precisam trabalhar sobre os mesmos dados (o que processos separados não conseguem fazer facilmente).</td></tr>
  <tr><td><strong>Economia</strong></td><td>Criar e destruir uma thread é mais barato que criar e destruir um processo, porque não há recursos a alocar (o Tanenbaum cita sistemas em que criar uma thread é <strong>cerca de 100 vezes mais rápido</strong>). O <strong>chaveamento de contexto entre threads</strong> do mesmo processo também é mais rápido que entre processos.</td></tr>
  <tr><td><strong>Escalabilidade (multiprocessador)</strong></td><td>Em máquinas com várias CPUs, threads diferentes do mesmo processo podem rodar <strong>de verdade ao mesmo tempo</strong> (paralelismo real), desde que o modelo de implementação permita (1:1 ou M:N, próxima aula).</td></tr>
</table>
<p><strong>Cuidado com o desempenho:</strong> threads <em>não</em> aceleram um programa em que todas as threads são <strong>CPU-bound</strong> (só cálculo, pouca E/S) numa máquina com <strong>uma única CPU</strong>. Nesse caso elas só se revezam (paralelismo aparente). O ganho aparece quando há <strong>E/S para sobrepor</strong> ou <strong>várias CPUs</strong>.</p>

<h2>Exemplos clássicos do Tanenbaum</h2>
<h3>Processador de texto com três threads</h3>
<ul>
  <li><strong>Thread 1 (interativa)</strong>: atende teclado e mouse.</li>
  <li><strong>Thread 2</strong>: reformata o documento em segundo plano (por exemplo, depois que o usuário apaga uma frase na página 1 de um livro de 800 páginas).</li>
  <li><strong>Thread 3</strong>: salva o documento no disco periodicamente (backup automático).</li>
</ul>
<p>Com uma thread só, o teclado ficaria "travado" enquanto o backup roda. Três <em>processos</em> não serviriam, porque os três precisam operar sobre o <strong>mesmo documento</strong> na memória. Uma planilha eletrônica funciona do mesmo jeito (uma thread interage, outra recalcula as fórmulas).</p>

<h3>Servidor Web multithread</h3>
<p>Uma thread <strong>despachante</strong> lê as requisições que chegam pela rede e entrega cada uma a uma <strong>thread operária</strong> ociosa. A operária procura a página na <strong>cache</strong> de páginas (na memória, compartilhada por todas as threads); se não estiver lá, lê do disco e fica bloqueada enquanto o disco trabalha. O Tanenbaum compara três formas de construir esse servidor (Tabela 2.3):</p>
<table>
  <tr><th>Modelo</th><th>Características</th></tr>
  <tr><td>Threads</td><td>Paralelismo, chamadas de sistema bloqueantes (programação simples).</td></tr>
  <tr><td>Processo monothread</td><td>Sem paralelismo, chamadas bloqueantes: enquanto espera o disco, não atende mais ninguém.</td></tr>
  <tr><td>Máquina de estados finitos</td><td>Paralelismo, mas com chamadas não bloqueantes e interrupções: programação difícil.</td></tr>
</table>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: o servidor Web atendendo duas requisições.</strong> D = despachante; O1 e O2 = operárias.</p>
  <table>
    <tr><th>Momento</th><th>O que acontece</th><th>Estados das threads</th></tr>
    <tr><td>1</td><td>Chega a requisição A (página rara). D a lê da rede e entrega a O1, que estava ociosa esperando trabalho.</td><td>D: Executando · O1: Bloqueada → Apta · O2: Bloqueada (ociosa)</td></tr>
    <tr><td>2</td><td>O1 ganha a CPU, procura a página na cache e não acha. Faz um <code>read</code> no disco.</td><td>O1: Executando → Bloqueada (esperando o disco)</td></tr>
    <tr><td>3</td><td>Chega a requisição B (página principal, muito acessada). D a entrega a O2.</td><td>D: Executando · O2: Bloqueada → Apta · O1: continua Bloqueada</td></tr>
    <tr><td>4</td><td>O2 acha a página na cache (que é compartilhada) e responde na hora. Volta a esperar trabalho.</td><td>O2: Executando → Bloqueada (ociosa)</td></tr>
    <tr><td>5</td><td>O disco termina a leitura de A. O1 envia a página ao cliente.</td><td>O1: Bloqueada → Apta → Executando</td></tr>
  </table>
  <p>B foi atendida <strong>enquanto</strong> A esperava o disco. Num servidor monothread, B teria esperado o disco de A sem necessidade. Repare que isso só funciona se o bloqueio de O1 <strong>não bloquear o processo inteiro</strong>: esse é exatamente o problema que diferencia os modelos de threads da próxima aula.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li>A <strong>pilha é da thread</strong>, não do processo. Já <strong>variáveis globais, arquivos abertos e o espaço de endereçamento são do processo</strong>, compartilhados por todas as threads.</li>
    <li>"Processo leve" é outro nome para <strong>thread</strong>, não um tipo de processo com menos memória.</li>
    <li>Todo processo tem <strong>pelo menos uma thread</strong>. O "processo tradicional" é o processo com uma única thread.</li>
    <li>Threads do mesmo processo <strong>não são protegidas</strong> umas das outras. A proteção do SO é entre <strong>processos</strong>.</li>
    <li>Várias threads numa CPU só = <strong>paralelismo aparente</strong> (revezamento). Paralelismo real exige várias CPUs <em>e</em> um modelo de threads que o SO enxergue.</li>
    <li>Threads não são "sempre mais rápidas": sem E/S para sobrepor e com uma CPU só, não há ganho de desempenho.</li>
  </ul>
</div>
`,
  resumo: 'Na multiprogramação pesada, cada processo tem um único fluxo, e criar, trocar e comunicar processos custa caro. Na multiprogramação leve, um processo (agrupamento de recursos) contém várias threads (fluxos de execução escalonados na CPU), que compartilham espaço de endereçamento, variáveis globais e arquivos abertos, mas têm PC, registradores, pilha e estado próprios. As vantagens são capacidade de resposta, compartilhamento de recursos, economia (criação e troca mais baratas) e uso de multiprocessadores; exemplos clássicos são o processador de texto e o servidor Web multithread.',
  questoes: [
    {
      id: 'm04-a01-q1',
      enunciado: 'Quais são as variações possíveis entre processos e threads?',
      alternativas: [
        { texto: 'Um processo com uma thread; um processo com várias threads; vários processos com uma thread cada; vários processos com várias threads cada.', correta: true, explicacao: 'Correto. São as quatro combinações dos slides do cap4. Exemplos: MS-DOS (1 e 1), máquina Java (1 processo, N threads), UNIX antigo (N processos, 1 thread cada) e Windows/Linux atuais (N processos, N threads cada).' },
        { texto: 'Apenas duas: processos pesados, com uma thread, e processos leves, sem thread nenhuma.', correta: false, explicacao: 'Não existe processo sem thread: todo processo tem pelo menos um fluxo de execução. Além disso, "processo leve" é sinônimo de thread, não um processo sem thread.' },
        { texto: 'Uma thread com vários processos; uma thread com um processo; várias threads sem processo.', correta: false, explicacao: 'Inverte a relação. É o processo que contém threads, e uma thread sempre pertence a um processo: ela usa o espaço de endereçamento e os recursos dele.' },
        { texto: 'Threads de usuário, threads de núcleo e threads híbridas.', correta: false, explicacao: 'Essas são formas de implementar threads (próxima aula: N:1, 1:1 e M:N), não as variações de quantos processos e quantas threads existem.' },
      ],
    },
    {
      id: 'm04-a01-q2',
      enunciado: 'Qual destes itens é <strong>próprio de cada thread</strong>, e não compartilhado com as outras threads do mesmo processo?',
      alternativas: [
        { texto: 'A pilha.', correta: true, explicacao: 'Correto. Cada thread chama funções diferentes, e a pilha guarda as variáveis locais e os endereços de retorno dessas chamadas. Por isso cada thread tem a sua, junto com PC, registradores e estado.' },
        { texto: 'As variáveis globais.', correta: false, explicacao: 'Variáveis globais ficam no espaço de endereçamento do processo, que todas as threads compartilham. É justamente por isso que threads precisam de sincronização.' },
        { texto: 'Os arquivos abertos.', correta: false, explicacao: 'Arquivos abertos são do processo. Se uma thread abre um arquivo, as outras threads do mesmo processo também podem ler e escrever nele.' },
        { texto: 'O espaço de endereçamento.', correta: false, explicacao: 'O espaço de endereçamento é o principal recurso compartilhado. Se cada thread tivesse o seu, ela seria, na prática, um processo separado.' },
      ],
    },
    {
      id: 'm04-a01-q3',
      enunciado: 'O que caracteriza a <strong>multiprogramação pesada</strong>, em contraste com a <strong>multiprogramação leve</strong>?',
      alternativas: [
        { texto: 'Na pesada, a unidade é o processo com um único fluxo, e criar, trocar e comunicar processos tem custo alto; na leve, vários fluxos (threads) dividem o mesmo processo e se comunicam pela memória compartilhada.', correta: true, explicacao: 'Correto. O "peso" vem das estruturas do processo (criação, troca de contexto, proteção, memória virtual, IPC pelo núcleo). A multiprogramação leve alivia esse peso com threads, cujo contexto é basicamente PC, pilha e registradores.' },
        { texto: 'A pesada roda programas grandes e a leve roda programas pequenos.', correta: false, explicacao: 'O tamanho do programa não tem relação com o termo. "Pesado" e "leve" se referem ao custo das estruturas que o SO manipula: processo inteiro x fluxo de execução.' },
        { texto: 'A pesada exige várias CPUs; a leve funciona com uma CPU só.', correta: false, explicacao: 'As duas funcionam com uma ou várias CPUs. A diferença é a unidade de execução (processo x thread), não a quantidade de processadores.' },
        { texto: 'Na pesada os processos compartilham o espaço de endereçamento; na leve cada thread tem o seu.', correta: false, explicacao: 'É o contrário: processos têm espaços de endereçamento separados, e as threads de um processo compartilham o mesmo espaço.' },
      ],
    },
    {
      id: 'm04-a01-q4',
      enunciado: 'Segundo o Tanenbaum, o modelo de processo se baseia em dois conceitos independentes. Qual alternativa associa corretamente cada conceito?',
      alternativas: [
        { texto: 'Processo agrupa recursos (memória, arquivos, filhos, sinais); thread é a entidade escalonada para execução na CPU.', correta: true, explicacao: 'Correto. O processo reúne os recursos relacionados para facilitar o gerenciamento; a thread é o fluxo com PC, registradores e pilha que o escalonador coloca na CPU.' },
        { texto: 'Processo é a entidade escalonada na CPU; thread agrupa recursos.', correta: false, explicacao: 'Está invertido. Recursos como arquivos abertos e espaço de endereçamento pertencem ao processo; o que vai para a CPU é a thread.' },
        { texto: 'Processo e thread são o mesmo conceito, com nomes diferentes em sistemas diferentes.', correta: false, explicacao: 'São conceitos diferentes que podem ser tratados separadamente: um processo pode ter várias threads, todas usando os mesmos recursos.' },
        { texto: 'Processo roda em modo núcleo e thread roda em modo usuário.', correta: false, explicacao: 'Modo de operação não define processo nem thread. Programas de usuário (com suas threads) rodam em modo usuário e entram no núcleo por chamadas de sistema.' },
      ],
    },
    {
      id: 'm04-a01-q5',
      enunciado: 'Um programa divide um cálculo pesado (sem nenhuma E/S) em 4 threads e roda num computador com <strong>uma única CPU</strong>. O que se espera?',
      alternativas: [
        { texto: 'Nenhum ganho de desempenho: as threads só se revezam na CPU, e o trabalho total é o mesmo.', correta: true, explicacao: 'Correto. O Tanenbaum é explícito: threads não trazem ganho quando todas são CPU-bound. O ganho vem de sobrepor cálculo com E/S ou de ter várias CPUs para paralelismo real.' },
        { texto: 'O programa fica cerca de 4 vezes mais rápido.', correta: false, explicacao: 'Para ficar 4 vezes mais rápido seria preciso 4 CPUs executando de verdade ao mesmo tempo. Com uma CPU só, há apenas paralelismo aparente.' },
        { texto: 'O programa fica mais rápido porque criar threads é 100 vezes mais barato que criar processos.', correta: false, explicacao: 'Criar threads é mais barato que criar processos, mas isso não acelera o cálculo em si. O tempo de CPU necessário continua o mesmo.' },
        { texto: 'O programa não funciona, pois threads exigem várias CPUs.', correta: false, explicacao: 'Threads funcionam numa CPU só, revezando-se como os processos na multiprogramação. Só não há paralelismo real.' },
      ],
    },
    {
      id: 'm04-a01-q6',
      enunciado: 'Por que o processador de texto do Tanenbaum usa <strong>três threads</strong> (interação, reformatação e backup) e não três <strong>processos</strong>?',
      alternativas: [
        { texto: 'Porque as três atividades precisam operar sobre o mesmo documento na memória, e threads compartilham o espaço de endereçamento.', correta: true, explicacao: 'Correto. Três processos teriam memórias separadas e não enxergariam o mesmo documento sem IPC complicada. Threads dividem a memória e têm acesso direto ao documento.' },
        { texto: 'Porque processos não podem fazer E/S de disco.', correta: false, explicacao: 'Processos fazem E/S normalmente, por chamadas de sistema. O motivo é o compartilhamento do documento, não uma limitação de E/S.' },
        { texto: 'Porque threads são protegidas umas das outras pelo SO, o que evita que o backup estrague o documento.', correta: false, explicacao: 'Não há proteção entre threads do mesmo processo: uma pode escrever na memória da outra. Quem dá proteção é o isolamento entre processos.' },
        { texto: 'Porque cada thread tem seu próprio espaço de endereçamento, o que deixa o programa mais seguro.', correta: false, explicacao: 'Threads não têm espaço de endereçamento próprio; elas compartilham o do processo. É isso que permite trabalharem juntas no mesmo documento.' },
      ],
    },
    {
      id: 'm04-a01-q7',
      enunciado: 'Qual alternativa <strong>não</strong> é uma vantagem do uso de threads?',
      alternativas: [
        { texto: 'Proteção de memória entre as threads do mesmo processo.', correta: true, explicacao: 'Correto: isso não é vantagem, nem existe. Threads do mesmo processo enxergam toda a memória umas das outras; uma pode até apagar a pilha da outra. O preço do compartilhamento é a necessidade de sincronização.' },
        { texto: 'Criação, destruição e troca de contexto mais rápidas que as de processos.', correta: false, explicacao: 'É uma vantagem (economia): a thread não tem recursos próprios a alocar e o chaveamento entre threads do mesmo processo não troca o espaço de endereçamento.' },
        { texto: 'Comunicação por memória compartilhada sem interação com o núcleo.', correta: false, explicacao: 'É uma vantagem (compartilhamento de recursos), citada nos slides: as threads compartilham o descritor e o espaço de endereçamento do processo.' },
        { texto: 'Possibilidade de explorar o paralelismo real de máquinas multiprocessadoras.', correta: false, explicacao: 'É uma vantagem (escalabilidade): threads do mesmo processo podem rodar em CPUs diferentes ao mesmo tempo, nos modelos 1:1 e M:N.' },
      ],
    },
    {
      id: 'm04-a01-q8',
      enunciado: 'No servidor Web multithread, a thread operária O1 está bloqueada esperando o disco. Chega uma nova requisição cuja página está na cache. O que acontece?',
      alternativas: [
        { texto: 'O despachante entrega a requisição a outra operária, que a atende pela cache enquanto O1 continua esperando o disco.', correta: true, explicacao: 'Correto. Esse é o ganho do modelo: o bloqueio de uma operária não impede as outras de trabalhar, e a cache é compartilhada por todas as threads do processo.' },
        { texto: 'A nova requisição espera O1 terminar, pois o processo inteiro está bloqueado.', correta: false, explicacao: 'Isso descreve o servidor monothread (ou um modelo de threads em que o SO bloqueia o processo inteiro). No servidor multithread do exemplo, só a thread que pediu o disco fica bloqueada.' },
        { texto: 'O despachante interrompe O1 e a obriga a atender a nova requisição.', correta: false, explicacao: 'O1 está bloqueada esperando o disco; não adianta interrompê-la. O despachante simplesmente escolhe uma operária ociosa.' },
        { texto: 'O servidor cria um novo processo para atender a requisição, porque threads não acessam a cache.', correta: false, explicacao: 'A cache fica na memória do processo e é compartilhada por todas as threads. Criar um processo novo seria mais caro e ele nem enxergaria essa cache.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm04-a01-d1',
      enunciado: 'Diferencie processo e thread. O que as threads de um mesmo processo compartilham e o que cada uma tem de próprio? Que combinações de processos e threads um sistema pode ter?',
      respostaModelo: `<p><strong>Processo</strong> é o agrupamento de recursos de um programa em execução: espaço de endereçamento (código e dados), arquivos abertos, processos filhos, sinais e contabilidade. <strong>Thread</strong> é um fluxo de execução dentro do processo, a entidade que o SO escalona na CPU; também é chamada de processo leve. No modelo tradicional (multiprogramação pesada) cada processo tem uma thread, e criar, trocar e comunicar processos custa caro; com threads (multiprogramação leve) várias atividades rodam no mesmo processo a custo menor.</p>
<p>As threads de um processo <strong>compartilham</strong> o espaço de endereçamento, as variáveis globais, os arquivos abertos, os processos filhos e os sinais. Cada thread tem <strong>próprios</strong> o contador de programa, os registradores, a pilha e o estado (Executando, Apta, Bloqueada, Finalizada). Como compartilham memória, comunicam-se sem passar pelo núcleo, mas não há proteção entre elas e é preciso sincronizá-las.</p>
<p>Variações: (1) um processo com uma thread (ex.: MS-DOS); (2) um processo com várias threads (ex.: máquina virtual Java); (3) vários processos com uma thread cada (ex.: UNIX tradicional); (4) vários processos com várias threads cada (ex.: Windows e Linux atuais).</p>`,
      pontosChave: [
        'Definiu processo como agrupamento de recursos e thread como fluxo de execução escalonado na CPU (processo leve)',
        'Listou o que é compartilhado: espaço de endereçamento/variáveis globais e arquivos abertos',
        'Listou o que é próprio da thread: PC, registradores, pilha e estado',
        'Citou as 4 variações: 1 processo/1 thread, 1 processo/N threads, N processos/1 thread, N processos/N threads',
      ],
    },
  ],
});
