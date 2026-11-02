// Módulo 5, aula 3: condição de corrida, seção (região) crítica, exclusão mútua e as 4 condições.
SO1.registerLesson({
  id: 'm05-a03',
  titulo: 'Condição de corrida e seção crítica',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §2.3.1 Condições de corrida e §2.3.2 Regiões críticas (p.70–72)',
    'Slides cap3 (Oliveira/Carissimi/Toscani, UFRGS): compartilhamento de recursos, produtor-consumidor (servidor de impressão), problema da seção crítica, propriedades para exclusão mútua (regras 1–4)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: o placar de vagas no quadro branco.</strong> Num evento, o quadro mostra "Vagas: 5". Duas recepcionistas atendem ao mesmo tempo. Cada uma <em>lê</em> o quadro (5), faz a inscrição, <em>calcula</em> 5 − 1 = 4 e <em>escreve</em> 4. Resultado: duas pessoas inscritas, mas o quadro diz 4 em vez de 3. Nenhuma das duas errou a conta; o erro veio de as duas lerem o valor <strong>antes</strong> que a outra escrevesse.</p>
  <p>A solução é óbvia: <strong>uma de cada vez</strong> mexe no quadro. O trecho "ler, calcular, escrever" é a <strong>seção crítica</strong>, e "uma de cada vez" é a <strong>exclusão mútua</strong>.</p>
</div>

<h2>Condição de corrida (race condition)</h2>
<p>A programação concorrente implica <strong>compartilhar recursos</strong>, e as variáveis compartilhadas são essenciais para ela. Os acessos precisam ser feitos de forma a manter o sistema num <strong>estado coerente e correto</strong>.</p>
<p><strong>Condição de corrida</strong> (o Tanenbaum também chama de <strong>condição de disputa</strong>) é a situação em que <strong>dois ou mais processos manipulam (leem e escrevem) os mesmos dados concorrentemente</strong> e o <strong>resultado final depende da ordem</strong> exata em que os acessos são feitos, isto é, de quem executa e quando.</p>
<p>Por que acontece? Porque uma operação que parece única no programa, como <code>count = count + 1</code>, vira <strong>várias instruções de máquina</strong>, e o processo pode perder a CPU (por uma interrupção de relógio, por exemplo) <strong>no meio delas</strong>:</p>
<pre class="codigo"><code>LOAD  R, count    /* 1. lê count da memória para o registrador */
ADD   R, 1        /* 2. soma 1 no registrador                 */
STORE R, count    /* 3. grava o registrador de volta em count */</code></pre>

<figure class="diagrama">
  <svg viewBox="0 0 540 268" style="max-width:660px" role="img" aria-label="Linha do tempo de uma condição de corrida: P1 e P2 leem count igual a 5 e ambos gravam 6">
    <g font-size="13" fill="currentColor" font-weight="bold">
      <text x="10" y="58">P1</text>
      <text x="10" y="128">P2</text>
      <text x="10" y="204">count</text>
    </g>
    <g stroke="currentColor" stroke-width="1">
      <rect x="60" y="40" width="80" height="26" style="fill:var(--azul-claro)"/>
      <rect x="380" y="40" width="70" height="26" style="fill:var(--azul-claro)"/>
      <rect x="450" y="40" width="80" height="26" style="fill:var(--vermelho-claro)"/>
      <rect x="150" y="110" width="70" height="26" style="fill:var(--verde-claro)"/>
      <rect x="220" y="110" width="70" height="26" style="fill:var(--verde-claro)"/>
      <rect x="290" y="110" width="80" height="26" style="fill:var(--verde-claro)"/>
    </g>
    <g font-size="12" text-anchor="middle" fill="currentColor">
      <text x="100" y="58">LOAD (5)</text>
      <text x="415" y="58">ADD (6)</text>
      <text x="490" y="58">STORE 6</text>
      <text x="185" y="128">LOAD (5)</text>
      <text x="255" y="128">ADD (6)</text>
      <text x="330" y="128">STORE 6</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-dasharray="4 3">
      <line x1="145" y1="30" x2="145" y2="150"/>
      <line x1="375" y1="30" x2="375" y2="150"/>
    </g>
    <g font-size="11" text-anchor="middle" fill="currentColor">
      <text x="145" y="24">interrupção: P1 perde a CPU</text>
      <text x="375" y="24">P1 volta (com R = 5)</text>
    </g>
    <g stroke="currentColor" stroke-width="1">
      <rect x="60" y="186" width="270" height="26" style="fill:var(--linha)"/>
      <rect x="330" y="186" width="160" height="26" style="fill:var(--linha)"/>
      <rect x="490" y="186" width="40" height="26" style="fill:var(--vermelho-claro)"/>
    </g>
    <g font-size="13" text-anchor="middle" fill="currentColor">
      <text x="195" y="204">5</text>
      <text x="410" y="204">6</text>
      <text x="510" y="204" font-weight="bold">6</text>
    </g>
    <path d="M60 226 H530" fill="none" stroke="currentColor"/>
    <path d="M524 222 L530 226 L524 230" fill="none" stroke="currentColor"/>
    <text x="60" y="244" font-size="12" fill="currentColor">tempo → dois incrementos, mas count termina em 6 (o certo seria 7):</text>
    <text x="60" y="260" font-size="12" fill="currentColor">a atualização de P2 se perdeu</text>
  </svg>
  <figcaption>Corrida no contador: P1 lê 5 e é interrompido antes de gravar. P2 lê o mesmo 5, soma e grava 6. P1 volta com o valor velho no registrador e também grava 6, apagando o trabalho de P2.</figcaption>
</figure>

<div class="exemplo">
  <p><strong>Exemplo do Tanenbaum: o diretório de spool de impressão.</strong> Para imprimir, um processo coloca o nome do arquivo numa vaga livre do <strong>diretório de spool</strong>; o <strong>daemon de impressão</strong> imprime e remove. Há duas variáveis compartilhadas: <code>out</code> (próximo arquivo a imprimir) e <code>in</code> (próxima vaga livre). As vagas 4 a 6 estão ocupadas, então <code>out = 4</code> e <code>in = 7</code>. Os processos A e B decidem imprimir quase ao mesmo tempo:</p>
  <table>
    <tr><th>Passo</th><th>O que acontece</th><th>Situação</th></tr>
    <tr><td>1</td><td>A lê <code>in</code> e guarda 7 na variável local <em>próxima_vaga_livre</em>.</td><td>A pensa: "minha vaga é a 7".</td></tr>
    <tr><td>2</td><td>Interrupção de relógio: a CPU é dada a B.</td><td>A está Apto (pronto), com 7 guardado.</td></tr>
    <tr><td>3</td><td>B lê <code>in</code> (ainda 7), escreve o nome do seu arquivo na vaga 7 e atualiza <code>in</code> para 8.</td><td>Vaga 7 = arquivo de B.</td></tr>
    <tr><td>4</td><td>A volta de onde parou: escreve seu arquivo na vaga 7 (apagando o de B) e faz <code>in</code> = 7 + 1 = 8.</td><td>Vaga 7 = arquivo de A.</td></tr>
    <tr><td>5</td><td>O daemon não nota nada: o diretório está internamente consistente.</td><td><strong>B nunca recebe sua impressão.</strong></td></tr>
  </table>
  <p>Os slides da UFRGS mostram a mesma ideia com a fila de impressão como buffer circular (in = 5): P1 lê 5 e perde a CPU, P2 insere na 5 e faz in = 6, P1 volta, insere na 5 e faz in = 7. A impressão de um deles é perdida e a posição 6 fica sem pedido válido. Atenção: o slide diz "Impressão de P1 é perdida", mas, pela sequência mostrada, P1 escreve por cima na posição 5, e quem perde a impressão é <strong>P2</strong>.</p>
</div>

<p>O pior das condições de corrida: <strong>a maioria dos testes passa</strong>. O erro só aparece quando a interrupção cai exatamente no ponto ruim, o que torna a depuração muito difícil.</p>

<h2>Seção crítica (região crítica)</h2>
<p><strong>Seção crítica</strong> (ou <strong>região crítica</strong>) é o <strong>segmento de código</strong> no qual o processo <strong>acessa (e altera) um recurso compartilhado</strong>: a memória, um arquivo, uma variável. Atenção: é o <em>trecho de código</em>, não o recurso.</p>
<p>Para eliminar as corridas, é preciso garantir a <strong>exclusão mútua</strong>: se um processo está usando o recurso compartilhado, os outros ficam <strong>impedidos</strong> de usá-lo ao mesmo tempo. Se nunca houver dois processos dentro de suas seções críticas ao mesmo tempo, as corridas são evitadas. Para isso cria-se um <strong>protocolo</strong> em volta da seção crítica:</p>
<pre class="codigo"><code>entry_section();     /* protocolo de entrada: pede permissão, espera se preciso */
  /* seção crítica: acessa o recurso compartilhado */
exit_section();      /* protocolo de saída: libera para o próximo           */
  /* seção não crítica */</code></pre>

<h2>As 4 condições para uma boa solução</h2>
<p>Só evitar a corrida não basta: os processos também precisam cooperar de forma <strong>correta e eficiente</strong>. O Tanenbaum lista quatro condições; os slides da UFRGS chamam de <strong>regras</strong> e mudam a ordem:</p>
<table>
  <tr><th>Condição</th><th>Tanenbaum</th><th>Slides UFRGS</th></tr>
  <tr><td><strong>Exclusão mútua</strong></td><td>1. Dois processos nunca podem estar simultaneamente em suas regiões críticas.</td><td>Regra 1: dois ou mais processos não podem estar simultaneamente numa seção crítica.</td></tr>
  <tr><td><strong>Nenhuma suposição de velocidade</strong></td><td>2. Nada pode ser afirmado sobre a velocidade ou o número de CPUs.</td><td>Regra 4: não fazer considerações sobre o número de processadores nem suas velocidades relativas.</td></tr>
  <tr><td><strong>Progressão</strong></td><td>3. Nenhum processo executando fora de sua região crítica pode bloquear outros processos.</td><td>Regra 2: nenhum processo fora da seção crítica pode bloquear a execução de outro.</td></tr>
  <tr><td><strong>Espera limitada</strong></td><td>4. Nenhum processo deve esperar eternamente para entrar em sua região crítica.</td><td>Regra 3: nenhum processo deve esperar infinitamente para entrar numa seção crítica.</td></tr>
</table>
<p>Na prática (Figura 2.17 do livro): A entra na região crítica em T1; B tenta entrar em T2 e fica <strong>bloqueado</strong> porque A está lá; A sai em T3 e B entra imediatamente; B sai em T4.</p>

<h2>Qual é o principal problema?</h2>
<p>O principal problema da seção crítica é a <strong>condição de corrida</strong>: sem controle, processos que acessam o mesmo recurso ao mesmo tempo deixam os dados <strong>inconsistentes</strong> (atualizações perdidas, pedidos de impressão sumindo), e o erro depende da ordem de execução. O desafio é <strong>garantir a exclusão mútua</strong> sem violar as outras condições: sem esperas infinitas, sem que um processo de fora bloqueie quem quer entrar e sem depender da velocidade ou do número de CPUs. As próximas aulas mostram as tentativas de solução.</p>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>Seção crítica é o trecho de código</strong> que acessa o recurso compartilhado, e não o recurso em si.</li>
    <li>Corrida <strong>também acontece com uma CPU só</strong>: basta uma interrupção (troca de processo) no meio do "ler, calcular, escrever".</li>
    <li>Só há corrida quando há <strong>dado compartilhado com escrita</strong>. Variáveis locais de cada processo, ou dados que todos só leem, não precisam de exclusão mútua.</li>
    <li>Exclusão mútua sozinha <strong>não</strong> é solução completa: uma solução que bloqueia todo mundo para sempre garante exclusão mútua, mas viola a espera limitada e a progressão.</li>
    <li>As condições do Tanenbaum e as regras da UFRGS são as mesmas quatro ideias, em <strong>ordem diferente</strong>. Prefira citar pelo nome (exclusão mútua, progressão, espera limitada, nenhuma suposição de velocidade/número de CPUs).</li>
  </ul>
</div>
`,
  resumo: 'Condição de corrida é quando processos leem e escrevem dados compartilhados concorrentemente e o resultado depende da ordem dos acessos (ex.: contador que perde incrementos, spool que perde um pedido). Seção crítica é o trecho de código que acessa o recurso compartilhado; para evitar corridas é preciso exclusão mútua, cercando a seção crítica com protocolos de entrada e saída. Uma boa solução cumpre 4 condições: exclusão mútua, progressão (quem está fora não bloqueia), espera limitada e nenhuma suposição sobre velocidade ou número de CPUs.',
  questoes: [
    {
      id: 'm05-a03-q1',
      enunciado: 'O que é uma <strong>condição de corrida</strong>?',
      alternativas: [
        { texto: 'Situação em que vários processos manipulam os mesmos dados concorrentemente e o resultado depende da ordem em que os acessos são feitos.', correta: true, explicacao: 'Correto. É a definição dos slides e do Tanenbaum (que também usa "condição de disputa"). O resultado varia conforme quem executa primeiro.' },
        { texto: 'Situação em que dois processos esperam um pelo outro para sempre.', correta: false, explicacao: 'Isso é deadlock (impasse). Na corrida, os processos não ficam parados: eles avançam, mas deixam os dados inconsistentes.' },
        { texto: 'Disputa entre processos pela CPU, resolvida pelo escalonador.', correta: false, explicacao: 'Disputar a CPU é normal na multiprogramação e não causa erro. A corrida envolve dados compartilhados cujo resultado depende da ordem de acesso.' },
        { texto: 'Situação em que um processo de alta prioridade nunca consegue executar.', correta: false, explicacao: 'Isso lembra inanição (starvation) ou inversão de prioridade, não condição de corrida.' },
      ],
    },
    {
      id: 'm05-a03-q2',
      enunciado: 'A variável compartilhada <code>count</code> vale 10. Os processos P1 e P2 executam, cada um, <strong>uma vez</strong> <code>count = count + 1</code> (LOAD, ADD, STORE), sem nenhuma sincronização. Quais valores finais são possíveis?',
      alternativas: [
        { texto: '11 ou 12.', correta: true, explicacao: 'Correto. Se um processo faz LOAD/ADD/STORE inteiro antes do outro ler, o resultado é 12. Se os dois leem 10 antes de qualquer STORE, ambos gravam 11 e um incremento se perde.' },
        { texto: 'Somente 12.', correta: false, explicacao: '12 é o resultado correto, mas não é garantido: se P2 ler count entre o LOAD e o STORE de P1, os dois gravam 11.' },
        { texto: 'Somente 11.', correta: false, explicacao: '11 acontece só na intercalação ruim. Se os incrementos não se sobrepuserem, o resultado é 12.' },
        { texto: '10, 11 ou 12.', correta: false, explicacao: 'Para terminar em 10 nenhum STORE poderia ter acontecido, mas os dois processos gravam pelo menos 11. Então 10 é impossível.' },
      ],
    },
    {
      id: 'm05-a03-q3',
      enunciado: 'No exemplo do spool do Tanenbaum (<code>in = 7</code>), o processo A lê <code>in</code> e é interrompido; B lê <code>in</code>, coloca seu arquivo na vaga 7 e faz <code>in = 8</code>; A volta, coloca seu arquivo na vaga 7 e faz <code>in = 8</code>. Qual o resultado?',
      alternativas: [
        { texto: 'O arquivo de B é sobrescrito pelo de A e nunca será impresso.', correta: true, explicacao: 'Correto. A ainda tinha o valor velho 7 guardado e escreveu por cima do nome do arquivo de B. O diretório parece consistente, então o daemon nem percebe.' },
        { texto: 'Os dois arquivos são impressos, nas vagas 7 e 8.', correta: false, explicacao: 'Ninguém escreveu na vaga 8: os dois usaram a vaga 7, porque leram in = 7 antes de qualquer atualização.' },
        { texto: 'O arquivo de A se perde, pois B chegou primeiro à vaga 7.', correta: false, explicacao: 'B escreveu primeiro, mas A escreveu depois, por cima. Quem sobrevive é o último a escrever (A); quem se perde é B.' },
        { texto: 'O daemon de impressão detecta a inconsistência e avisa os usuários.', correta: false, explicacao: 'O diretório fica internamente consistente (in = 8, vaga 7 ocupada). Por isso o daemon não nota nada, e é isso que torna a corrida traiçoeira.' },
      ],
    },
    {
      id: 'm05-a03-q4',
      enunciado: 'O que é a <strong>seção crítica</strong> de um processo?',
      alternativas: [
        { texto: 'O segmento de código em que o processo acessa (altera) um recurso compartilhado.', correta: true, explicacao: 'Correto. É o trecho do programa, e não o recurso, que precisa ser executado em exclusão mútua.' },
        { texto: 'A variável compartilhada propriamente dita.', correta: false, explicacao: 'A variável é o recurso compartilhado. Seção crítica é o trecho de código que a manipula.' },
        { texto: 'A parte do núcleo que trata interrupções.', correta: false, explicacao: 'Tratadores de interrupção podem conter seções críticas, mas o conceito vale para qualquer código que acesse dados compartilhados, inclusive de usuário.' },
        { texto: 'O trecho de código que mais consome CPU no processo.', correta: false, explicacao: '"Crítico" aqui não tem a ver com desempenho, e sim com acesso a recurso compartilhado.' },
      ],
    },
    {
      id: 'm05-a03-q5',
      enunciado: 'A condição "nenhum processo executando <strong>fora</strong> de sua seção crítica pode bloquear outros processos" é conhecida como:',
      alternativas: [
        { texto: 'Progressão.', correta: true, explicacao: 'Correto. É a regra 2 dos slides (condição 3 no Tanenbaum). Quem não está usando o recurso não pode impedir os outros de entrar.' },
        { texto: 'Exclusão mútua.', correta: false, explicacao: 'Exclusão mútua diz que dois processos não podem estar ao mesmo tempo na seção crítica. Não fala de quem está fora.' },
        { texto: 'Espera limitada.', correta: false, explicacao: 'Espera limitada diz que ninguém espera para sempre para entrar. A condição do enunciado é outra: proíbe que quem está fora bloqueie quem quer entrar.' },
        { texto: 'Nenhuma suposição de velocidade.', correta: false, explicacao: 'Essa condição proíbe depender do número de CPUs ou das velocidades relativas, não trata de quem está fora da seção crítica.' },
      ],
    },
    {
      id: 'm05-a03-q6',
      enunciado: 'Uma condição de corrida pode ocorrer numa máquina com <strong>apenas uma CPU</strong>?',
      alternativas: [
        { texto: 'Sim: uma interrupção pode tirar o processo da CPU no meio da seção crítica, e outro processo acessa os mesmos dados.', correta: true, explicacao: 'Correto. Os exemplos do spool e do contador acontecem com uma CPU: basta a troca de processo entre a leitura e a escrita.' },
        { texto: 'Não: com uma CPU os processos nunca executam ao mesmo tempo.', correta: false, explicacao: 'Eles não executam no mesmo instante, mas se intercalam. A intercalação no meio do "ler, calcular, escrever" basta para a corrida.' },
        { texto: 'Só se os processos tiverem prioridades diferentes.', correta: false, explicacao: 'A prioridade não importa: qualquer troca de processo no ponto errado causa a corrida.' },
        { texto: 'Só se o programa for escrito em assembly.', correta: false, explicacao: 'Em qualquer linguagem, um comando como count = count + 1 vira várias instruções de máquina, que podem ser interrompidas.' },
      ],
    },
    {
      id: 'm05-a03-q7',
      enunciado: 'Em qual situação <strong>não</strong> é necessário garantir exclusão mútua?',
      alternativas: [
        { texto: 'Cada thread incrementa uma variável local, declarada dentro da sua própria função.', correta: true, explicacao: 'Correto. Variável local fica na pilha de cada thread e não é compartilhada, então não há corrida.' },
        { texto: 'Dois processos inserem pedidos na mesma fila de impressão.', correta: false, explicacao: 'É o exemplo clássico do spool: fila compartilhada com escrita exige exclusão mútua.' },
        { texto: 'Várias threads atualizam o saldo da mesma conta bancária.', correta: false, explicacao: 'O saldo é compartilhado e alterado por várias threads: sem exclusão mútua, depósitos ou saques podem se perder.' },
        { texto: 'Dois processos incrementam um contador global compartilhado.', correta: false, explicacao: 'Contador global compartilhado é o caso típico de corrida (LOAD, ADD, STORE intercalados).' },
      ],
    },
    {
      id: 'm05-a03-q8',
      enunciado: 'Uma solução de exclusão mútua só funciona se um processo for mais rápido que o outro. Qual condição ela viola?',
      alternativas: [
        { texto: 'Não fazer suposições sobre a velocidade ou o número de CPUs.', correta: true, explicacao: 'Correto. A solução precisa funcionar com qualquer velocidade relativa e qualquer número de processadores (regra 4 dos slides, condição 2 do Tanenbaum).' },
        { texto: 'Exclusão mútua.', correta: false, explicacao: 'Pode até garantir exclusão mútua nas condições "certas", mas o problema descrito é depender da velocidade, que é outra condição.' },
        { texto: 'Progressão.', correta: false, explicacao: 'Progressão trata de processos fora da seção crítica bloqueando outros, não de dependência de velocidade.' },
        { texto: 'Nenhuma: depender de velocidade é aceitável.', correta: false, explicacao: 'Não é aceitável. A velocidade relativa muda com a carga, as interrupções e o hardware; uma solução que depende dela falha imprevisivelmente.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm05-a03-d1',
      enunciado: 'O que é seção crítica e qual problema ela representa em programas concorrentes?',
      respostaModelo: `<p><strong>Seção crítica</strong> (ou região crítica) é o <strong>trecho de código</strong> em que um processo <strong>acessa e altera um recurso compartilhado</strong> com outros processos (variável, memória compartilhada, arquivo, fila de impressão).</p>
<p>O <strong>principal problema</strong> é a <strong>condição de corrida</strong>: se dois ou mais processos executam suas seções críticas ao mesmo tempo (ou intercalados por interrupções), o resultado depende da ordem dos acessos e os dados ficam <strong>inconsistentes</strong>. Exemplo: dois processos leem a vaga livre do spool (in = 7) antes de qualquer um atualizá-la; ambos escrevem na vaga 7 e um pedido de impressão se perde.</p>
<p>A solução é garantir <strong>exclusão mútua</strong>: cercar a seção crítica com um protocolo de entrada e saída, de modo que só um processo por vez esteja dentro dela. Uma boa solução deve atender às quatro condições: (1) <strong>exclusão mútua</strong>: dois processos nunca simultaneamente na seção crítica; (2) <strong>progressão</strong>: processo fora da seção crítica não bloqueia outros; (3) <strong>espera limitada</strong>: ninguém espera eternamente para entrar; (4) <strong>nenhuma suposição</strong> sobre velocidades ou número de CPUs.</p>`,
      pontosChave: [
        'Definiu seção crítica como trecho de código que acessa recurso compartilhado',
        'Apontou a condição de corrida (resultado depende da ordem) como principal problema, com dados inconsistentes',
        'Citou a exclusão mútua (um processo por vez) como solução, com protocolo de entrada/saída',
        'Citou as 4 condições: exclusão mútua, progressão, espera limitada e nenhuma suposição de velocidade/CPUs',
      ],
    },
  ],
});
