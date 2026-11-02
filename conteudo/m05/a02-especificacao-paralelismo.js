// Módulo 5, aula 2: especificação do paralelismo: fork/exit/wait, parbegin/parend e grafo de precedência.
SO1.registerLesson({
  id: 'm05-a02',
  titulo: 'Especificando paralelismo (fork, parbegin/parend)',
  fontes: [
    'Slides cap3 (Oliveira/Carissimi/Toscani, UFRGS): especificação do paralelismo, fork/wait, parbegin/parend, comentários gerais',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: a receita de bolo com ajudantes.</strong> "Enquanto você bate a massa, eu preparo a cobertura; quando os dois terminarem, montamos o bolo." Para dividir o trabalho, alguém precisa dizer <em>quantas pessoas</em> vão ajudar, <em>quem faz o quê</em> e <em>o que depende do quê</em> (só se monta o bolo depois da massa <strong>e</strong> da cobertura).</p>
  <p>Num programa concorrente é igual: o programador precisa <strong>especificar o paralelismo</strong>, e para isso existem comandos próprios (fork, wait, parbegin/parend) e um desenho que mostra as dependências (o grafo de precedência).</p>
</div>

<h2>O que precisa ser especificado</h2>
<p>Segundo os slides, para escrever um programa concorrente é preciso definir:</p>
<ul>
  <li><strong>quantos processos</strong> participarão;</li>
  <li><strong>quem fará o quê</strong> (que trecho cada processo executa);</li>
  <li>a <strong>dependência entre as tarefas</strong>, normalmente desenhada como um <strong>grafo de precedência</strong>.</li>
</ul>
<p>Há duas notações clássicas para expressar o paralelismo: <strong>fork/wait</strong> (também chamada fork/join) e <strong>parbegin/parend</strong>.</p>

<h2>fork, exit e wait</h2>
<table>
  <tr><th>Comando</th><th>O que faz</th></tr>
  <tr><td><strong>fork</strong></td><td>Cria um <strong>segundo fluxo de execução</strong>, paralelo àquele que executou o comando. Depois do fork, os dois fluxos seguem ao mesmo tempo.</td></tr>
  <tr><td><strong>exit</strong></td><td>Faz o fluxo de controle ser <strong>interrompido imediatamente</strong> (o fluxo termina).</td></tr>
  <tr><td><strong>wait</strong> (join)</td><td>Faz o fluxo de execução <strong>esperar outro fluxo terminar</strong>. Se o outro ainda não acabou, quem chamou wait fica <strong>Bloqueado</strong>.</td></tr>
</table>
<p>Os comandos <strong>exit e wait são auxiliares ao fork</strong>: o fork divide, o exit encerra um ramo, e o wait junta de novo.</p>
<p>Exemplo dos slides: o processo A cria B e C, faz sua parte e depois espera os dois.</p>
<pre class="codigo"><code>Processo A:
    fork B;      /* cria B, que passa a executar em paralelo */
    fork C;      /* cria C */
    ...          /* A continua trabalhando */
    wait C;      /* se C não terminou, A fica Bloqueado */
    wait B;      /* espera B terminar */
    ...          /* daqui em diante, B e C já acabaram */</code></pre>

<h2>parbegin / parend</h2>
<p>Enquanto um bloco <strong>begin ... end</strong> delimita comandos executados <strong>em sequência</strong>, o par <strong>parbegin ... parend</strong> (<em>parallel begin / parallel end</em>) delimita comandos executados <strong>em paralelo</strong> (concorrentemente).</p>
<pre class="codigo"><code>parbegin
    Tarefa B;    /* B e C começam juntas */
    Tarefa C;
parend;          /* barreira: só passa quando B e C terminarem */
...</code></pre>
<p>O <strong>parend funciona como ponto de sincronização (barreira)</strong>: quem chegou primeiro fica esperando (Bloqueado) até que todos os comandos do bloco terminem. Só então a execução continua depois do parend.</p>
<p><strong>Comentário dos slides:</strong> primitivas de alto nível como parbegin/parend podem ser <strong>traduzidas por pré-compiladores ou interpretadores</strong> para primitivas de mais baixo nível (fork/wait). Ou seja, parbegin/parend é mais fácil de ler, e fork/wait é o que fica "por baixo".</p>

<h2>Grafo de precedência</h2>
<p>É um grafo dirigido em que cada <strong>nó é uma tarefa</strong> (um comando ou trecho) e cada <strong>seta S<sub>i</sub> → S<sub>j</sub></strong> diz que S<sub>j</sub> <strong>só pode começar depois que S<sub>i</sub> terminar</strong>. Tarefas sem caminho entre si podem executar em paralelo.</p>
<p>Exemplo, com quatro comandos:</p>
<pre class="codigo"><code>S1:  a = x + y;
S2:  b = z * 2;
S3:  c = a - b;     /* precisa de a (S1) e de b (S2) */
S4:  d = c + 1;     /* precisa de c (S3) */</code></pre>

<figure class="diagrama">
  <svg viewBox="0 0 520 260" style="max-width:620px" role="img" aria-label="Grafo de precedência: S1 e S2 apontam para S3, que aponta para S4; ao lado, o código parbegin/parend equivalente">
    <defs>
      <marker id="m05a02-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
      </marker>
    </defs>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <line x1="72" y1="56" x2="112" y2="118" marker-end="url(#m05a02-seta)"/>
      <line x1="188" y1="56" x2="148" y2="118" marker-end="url(#m05a02-seta)"/>
      <line x1="130" y1="162" x2="130" y2="200" marker-end="url(#m05a02-seta)"/>
    </g>
    <g stroke-width="2">
      <circle cx="60" cy="38" r="22" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <circle cx="200" cy="38" r="22" style="fill:var(--azul-claro);stroke:var(--azul)"/>
      <circle cx="130" cy="140" r="22" style="fill:var(--verde-claro);stroke:var(--verde)"/>
      <circle cx="130" cy="224" r="22" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
    </g>
    <g font-size="14" text-anchor="middle" fill="currentColor" font-weight="bold">
      <text x="60" y="43">S1</text><text x="200" y="43">S2</text>
      <text x="130" y="145">S3</text><text x="130" y="229">S4</text>
    </g>
    <text x="130" y="90" font-size="12" text-anchor="middle" fill="currentColor">em paralelo</text>
    <path d="M90 38 H170" fill="none" stroke="currentColor" stroke-dasharray="4 4"/>
    <g font-family="monospace" font-size="13" fill="currentColor">
      <text x="280" y="40">begin</text>
      <text x="296" y="62" style="fill:var(--azul)">parbegin</text>
      <text x="312" y="84">S1;</text>
      <text x="312" y="106">S2;</text>
      <text x="296" y="128" style="fill:var(--azul)">parend;</text>
      <text x="296" y="150">S3;</text>
      <text x="296" y="172">S4;</text>
      <text x="280" y="194">end</text>
    </g>
    <g font-size="11" fill="currentColor">
      <text x="380" y="128">← barreira: espera</text>
      <text x="380" y="142">S1 e S2 terminarem</text>
    </g>
  </svg>
  <figcaption>S1 e S2 não dependem uma da outra e podem rodar em paralelo. S3 precisa das duas (duas setas chegando), e S4 precisa de S3. No código, o parend é a barreira que garante que S3 só comece depois de S1 e S2.</figcaption>
</figure>

<p>O mesmo grafo escrito com <strong>fork/wait</strong>:</p>
<pre class="codigo"><code>Processo principal:          Processo P2:
    fork P2;                     S2;
    S1;                          exit;
    wait P2;   /* espera S2 */
    S3;
    S4;</code></pre>

<div class="exemplo">
  <p><strong>Exemplo passo a passo:</strong> executando o grafo acima numa máquina com <strong>2 CPUs</strong>, supondo que cada comando leva <strong>1 unidade de tempo</strong> (u.t.).</p>
  <table>
    <tr><th>Tempo</th><th>CPU 1</th><th>CPU 2</th><th>Por quê</th></tr>
    <tr><td>0–1</td><td>S1</td><td>S2</td><td>S1 e S2 não têm setas chegando: podem começar já, em paralelo.</td></tr>
    <tr><td>1</td><td>chega ao parend</td><td>chega ao parend</td><td>Os dois terminaram; a barreira é liberada.</td></tr>
    <tr><td>1–2</td><td>S3</td><td>(ociosa)</td><td>S3 dependia de S1 e S2, que acabaram.</td></tr>
    <tr><td>2–3</td><td>S4</td><td>(ociosa)</td><td>S4 dependia de S3.</td></tr>
  </table>
  <p>Total: <strong>3 u.t.</strong>, contra 4 u.t. executando tudo em sequência. O ganho é limitado pela parte que não pode ser paralelizada (S3 → S4). E se S2 demorasse mais que S1? O processo que executou S1 ficaria <strong>Bloqueado no parend</strong> (ou no wait) até S2 terminar.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>begin/end = sequencial; parbegin/parend = paralelo.</strong> Não inverta.</li>
    <li>O <strong>parend é uma barreira</strong>: ninguém passa dele enquanto algum comando do bloco não terminou.</li>
    <li><strong>fork cria</strong> um fluxo; <strong>exit encerra</strong> o fluxo; <strong>wait espera</strong> outro fluxo terminar. Exit e wait são auxiliares ao fork.</li>
    <li>No grafo, a seta indica <strong>ordem obrigatória</strong>, não troca de mensagem. Tarefas sem caminho entre si <strong>podem</strong> rodar em paralelo, e a ordem entre elas é imprevisível.</li>
    <li>parbegin/parend é de <strong>alto nível</strong> e pode ser traduzido por pré-compilador para fork/wait (baixo nível).</li>
  </ul>
</div>
`,
  resumo: 'Para especificar o paralelismo é preciso dizer quantos processos participam, quem faz o quê e as dependências (grafo de precedência: seta Si → Sj significa que Sj só começa depois de Si). fork cria um fluxo paralelo, exit encerra um fluxo e wait espera outro terminar. parbegin/parend delimita comandos executados em paralelo, e o parend é uma barreira; é uma notação de alto nível que pode ser traduzida para fork/wait.',
  questoes: [
    {
      id: 'm05-a02-q1',
      enunciado: 'O que faz o comando <strong>fork</strong>?',
      alternativas: [
        { texto: 'Cria um segundo fluxo de execução, paralelo àquele que executou o comando.', correta: true, explicacao: 'Correto. É a definição do slide. Depois do fork existem dois fluxos seguindo ao mesmo tempo.' },
        { texto: 'Interrompe imediatamente o fluxo de controle.', correta: false, explicacao: 'Isso é o exit, que encerra um fluxo. O fork faz o contrário: cria um fluxo novo.' },
        { texto: 'Faz o fluxo esperar outro fluxo terminar.', correta: false, explicacao: 'Isso é o wait (join). O fork divide a execução; o wait junta de novo.' },
        { texto: 'Executa uma lista de comandos em sequência.', correta: false, explicacao: 'Executar em sequência é o papel do bloco begin/end, não do fork.' },
      ],
    },
    {
      id: 'm05-a02-q2',
      enunciado: 'No par <strong>parbegin/parend</strong>, qual é o papel do <strong>parend</strong>?',
      alternativas: [
        { texto: 'É um ponto de sincronização (barreira): só deixa a execução continuar quando todos os comandos do bloco terminarem.', correta: true, explicacao: 'Correto. Os slides dizem que o parend funciona como barreira. Quem termina antes fica Bloqueado esperando os outros.' },
        { texto: 'Cancela os comandos que ainda não terminaram.', correta: false, explicacao: 'O parend não cancela nada: ele espera. Todos os comandos do bloco executam até o fim.' },
        { texto: 'Inicia os comandos do bloco em sequência, um depois do outro.', correta: false, explicacao: 'Os comandos entre parbegin e parend executam em paralelo. Execução em sequência é o begin/end.' },
        { texto: 'Cria um novo processo para cada comando seguinte ao bloco.', correta: false, explicacao: 'Os comandos depois do parend voltam a ser sequenciais; o parend apenas sincroniza o fim do bloco paralelo.' },
      ],
    },
    {
      id: 'm05-a02-q3',
      enunciado: 'Num grafo de precedência, as setas são: S1 → S2, S1 → S3, S2 → S4 e S3 → S4. Qual código implementa esse grafo?',
      alternativas: [
        { texto: '<code>begin S1; parbegin S2; S3; parend; S4; end</code>', correta: true, explicacao: 'Correto. S1 vem primeiro; S2 e S3 dependem só de S1 e podem rodar em paralelo; S4 depende das duas, e o parend garante que ela espere ambas.' },
        { texto: '<code>parbegin S1; S2; S3; S4; parend</code>', correta: false, explicacao: 'Isso deixaria os quatro comandos rodarem em paralelo, ignorando todas as setas (S4 poderia rodar antes de S1, por exemplo).' },
        { texto: '<code>begin S1; S2; S3; S4; end</code>', correta: false, explicacao: 'Isso respeita as dependências, mas é totalmente sequencial: perde o paralelismo possível entre S2 e S3, que o grafo permite.' },
        { texto: '<code>begin parbegin S1; S2; parend; S3; S4; end</code>', correta: false, explicacao: 'Aqui S1 e S2 rodariam em paralelo, mas o grafo diz que S2 depende de S1 (seta S1 → S2). E S3 e S4 ficariam em sequência, sem necessidade.' },
      ],
    },
    {
      id: 'm05-a02-q4',
      enunciado: 'Considere o código <code>begin S1; parbegin S2; begin S3; S4; end; parend; S5; end</code>. Qual afirmação é verdadeira?',
      alternativas: [
        { texto: 'S2 pode executar em paralelo com S3 e com S4, e S5 só começa depois que S2 e S4 terminarem.', correta: true, explicacao: 'Correto. O bloco paralelo tem dois ramos: S2 e a sequência S3;S4. Os ramos correm em paralelo, e o parend espera os dois antes de S5.' },
        { texto: 'S3 e S4 podem executar em paralelo.', correta: false, explicacao: 'S3 e S4 estão dentro de um begin/end, que é sequencial: S4 só começa depois de S3.' },
        { texto: 'S5 pode começar assim que S2 terminar.', correta: false, explicacao: 'O parend é uma barreira: S5 espera os dois ramos (S2 e S3;S4) terminarem.' },
        { texto: 'S2 só começa depois de S4.', correta: false, explicacao: 'S2 e o ramo S3;S4 começam juntos, logo depois de S1. Não há dependência entre S2 e S4.' },
      ],
    },
    {
      id: 'm05-a02-q5',
      enunciado: 'Grafo: S1 e S2 sem dependências; S3 depende de S1 e S2; S4 depende de S3. Cada comando leva 1 u.t. Com <strong>2 CPUs</strong>, qual o menor tempo total?',
      alternativas: [
        { texto: '3 u.t.', correta: true, explicacao: 'Correto. Linha do tempo: 0–1 S1 (CPU1) e S2 (CPU2); 1–2 S3; 2–3 S4. S3 e S4 não podem ser paralelizados porque formam uma cadeia de dependências.' },
        { texto: '2 u.t.', correta: false, explicacao: 'Seria preciso rodar S3 e S4 em paralelo, mas S4 depende de S3. A cadeia S1 → S3 → S4 já tem 3 comandos, então o mínimo é 3 u.t.' },
        { texto: '4 u.t.', correta: false, explicacao: 'Esse é o tempo sequencial (com 1 CPU). Com 2 CPUs, S1 e S2 rodam juntos e se economiza 1 u.t.' },
        { texto: '1 u.t.', correta: false, explicacao: 'Impossível: as dependências obrigam pelo menos três etapas (S1/S2, depois S3, depois S4), não importa quantas CPUs haja.' },
      ],
    },
    {
      id: 'm05-a02-q6',
      enunciado: 'Qual a relação entre parbegin/parend e fork/wait, segundo os slides?',
      alternativas: [
        { texto: 'parbegin/parend é uma primitiva de mais alto nível, que pode ser traduzida por pré-compiladores ou interpretadores para primitivas de mais baixo nível como fork/wait.', correta: true, explicacao: 'Correto. Os "comentários gerais" do slide dizem exatamente isso: o programador escreve parbegin/parend, e por baixo isso vira criação e espera de fluxos.' },
        { texto: 'São notações incompatíveis: um programa não pode usar as duas ideias.', correta: false, explicacao: 'Não são incompatíveis; uma pode ser traduzida na outra. São duas formas de expressar o mesmo tipo de paralelismo.' },
        { texto: 'fork/wait é de alto nível e parbegin/parend é de baixo nível.', correta: false, explicacao: 'Está invertido. parbegin/parend é a notação estruturada (alto nível); fork/wait é a primitiva de baixo nível.' },
        { texto: 'parbegin/parend serve só para máquinas multiprocessadoras.', correta: false, explicacao: 'A notação expressa paralelismo lógico. Com uma CPU, os comandos do bloco simplesmente se revezam (paralelismo aparente).' },
      ],
    },
    {
      id: 'm05-a02-q7',
      enunciado: 'O processo A executa <code>fork B; fork C; ...; wait C; wait B;</code>. C termina rapidamente, mas B demora muito. O que acontece com A?',
      alternativas: [
        { texto: 'Passa direto pelo wait C (C já terminou) e fica Bloqueado no wait B até B terminar.', correta: true, explicacao: 'Correto. wait só bloqueia se o fluxo esperado ainda não terminou. C já acabou, então A segue; B não, então A bloqueia até B terminar.' },
        { texto: 'Fica Bloqueado no wait C para sempre, pois C já terminou antes do wait.', correta: false, explicacao: 'Se o fluxo já terminou, o wait retorna imediatamente. Não há espera infinita nesse caso.' },
        { texto: 'Encerra B à força para poder continuar.', correta: false, explicacao: 'wait não mata ninguém: apenas espera. Encerrar um fluxo é papel do exit, executado pelo próprio fluxo.' },
        { texto: 'Continua executando sem esperar B, pois wait só vale para o último fork.', correta: false, explicacao: 'Cada wait se refere a um fluxo específico (aqui, B). A só passa do wait B quando B terminar.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm05-a02-d1',
      enunciado: 'Dado o trecho <code>S1: a = 2*x; S2: b = y + 3; S3: c = a + b; S4: d = a * 5; S5: e = c + d;</code>, desenhe (descreva) o grafo de precedência e escreva o programa usando parbegin/parend, aproveitando o paralelismo.',
      respostaModelo: `<p><strong>Dependências:</strong> S1 e S2 não dependem de nada. S3 usa <em>a</em> e <em>b</em>, então depende de S1 e S2. S4 usa <em>a</em>, então depende de S1. S5 usa <em>c</em> e <em>d</em>, então depende de S3 e S4.</p>
<p><strong>Grafo:</strong> S1 → S3, S2 → S3, S1 → S4, S3 → S5, S4 → S5.</p>
<p><strong>Programa:</strong></p>
<pre class="codigo"><code>begin
  parbegin S1; S2; parend;
  parbegin S3; S4; parend;
  S5;
end</code></pre>
<p>S1 e S2 rodam em paralelo; a barreira do primeiro parend garante que S3 tenha <em>a</em> e <em>b</em> prontos. Depois S3 e S4 rodam em paralelo, e o segundo parend garante que S5 tenha <em>c</em> e <em>d</em>. Observação: neste código, S4 espera também por S2, o que o grafo não exige; o resultado continua correto. Para seguir o grafo exatamente seria preciso fork/wait (por exemplo, o fluxo que executa S1 faz fork de S4 logo em seguida), porque esse formato de grafo não se escreve só com blocos parbegin/parend aninhados.</p>`,
      pontosChave: [
        'Identificou as dependências pelas variáveis lidas e escritas (S3 ← S1,S2; S4 ← S1; S5 ← S3,S4)',
        'Descreveu o grafo com as setas corretas',
        'Usou parbegin/parend para rodar S1 e S2 em paralelo e S3 e S4 em paralelo',
        'Colocou S5 depois de uma barreira (parend), garantindo a ordem',
      ],
    },
  ],
});
