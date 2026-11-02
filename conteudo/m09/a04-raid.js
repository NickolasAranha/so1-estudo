// Módulo 9, aula 4: RAID 0 a 6 e 10; RAID por hardware x software.
SO1.registerLesson({
  id: 'm09-a04',
  titulo: 'RAID',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §5.4.1, subseção RAID (p.224–227), Figura 5.17 (RAID 0 a 5)',
    'Slides cap5 (Oliveira/Carissimi/Toscani, UFRGS): RAID níveis 0, 1, 2, 3 (reconstrução por paridade), 4, 5, 6 e 10; software de RAID',
    'Conhecimento consolidado (Silberschatz; Stallings) para RAID 6 e a comparação de capacidade útil',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: copiar a matéria da prova em grupo.</strong> Se quatro colegas dividem o caderno, cada um copiando um capítulo, termina-se quatro vezes mais rápido, mas se um perder o caderno, aquele capítulo some (RAID 0). Se cada capítulo é copiado por duas pessoas, ninguém perde nada, mas gasta-se o dobro de papel (RAID 1). Um meio-termo esperto: um colega anota só um "resumo de conferência" que permite reconstruir qualquer capítulo perdido (paridade, RAID 3/4/5).</p>
</div>

<h2>O que é RAID</h2>
<p><strong>RAID</strong> (<em>Redundant Array of Inexpensive Disks</em>, arranjo redundante de discos baratos; a indústria trocou o "I" por <em>Independent</em>) é um conjunto de discos que o SO enxerga como <strong>um único disco lógico</strong>. Foi proposto por Patterson et al. (1988) como alternativa ao <strong>SLED</strong> (<em>single large expensive disk</em>). Duas ideias:</p>
<ul>
  <li><strong>Desempenho</strong>: os dados são distribuídos entre os discos (<strong>striping</strong>), permitindo acessos em paralelo.</li>
  <li><strong>Confiabilidade</strong>: informações redundantes (cópia ou paridade) permitem recuperar os dados se um disco falhar. Isso é necessário porque <strong>mais discos significam mais chance de falha</strong>.</li>
</ul>
<p>O disco lógico é dividido em <strong>faixas</strong> (strips) de k setores; as faixas são distribuídas nos n discos em <strong>alternância circular</strong> (round-robin). Uma "linha" de faixas, uma em cada disco, é uma <strong>stripe</strong>. Os "níveis" não formam hierarquia: são só organizações diferentes.</p>

<figure class="diagrama">
  <svg viewBox="0 0 470 330" style="max-width:620px" role="img" aria-label="Distribuição das faixas em RAID 0, RAID 1 e RAID 5 com quatro ou cinco discos">
    <g font-size="12" fill="currentColor" font-weight="bold">
      <text x="10" y="18">RAID 0 (striping): 4 discos</text>
      <text x="10" y="128">RAID 1 (espelhamento): 2 + 2 discos</text>
      <text x="10" y="238">RAID 5 (paridade distribuída): 5 discos</text>
    </g>
    <g font-size="11" text-anchor="middle" fill="currentColor">
      <g transform="translate(10,26)">
        <rect x="0" y="0" width="70" height="80" rx="6" fill="none" stroke="currentColor"/>
        <rect x="80" y="0" width="70" height="80" rx="6" fill="none" stroke="currentColor"/>
        <rect x="160" y="0" width="70" height="80" rx="6" fill="none" stroke="currentColor"/>
        <rect x="240" y="0" width="70" height="80" rx="6" fill="none" stroke="currentColor"/>
        <text x="35" y="22">Faixa 0</text><text x="115" y="22">Faixa 1</text><text x="195" y="22">Faixa 2</text><text x="275" y="22">Faixa 3</text>
        <text x="35" y="44">Faixa 4</text><text x="115" y="44">Faixa 5</text><text x="195" y="44">Faixa 6</text><text x="275" y="44">Faixa 7</text>
        <text x="35" y="66">Faixa 8</text><text x="115" y="66">Faixa 9</text><text x="195" y="66">Faixa 10</text><text x="275" y="66">Faixa 11</text>
        <text x="390" y="34" font-size="11">sem redundância:</text>
        <text x="390" y="50" font-size="11">1 falha = perda total</text>
      </g>
      <g transform="translate(10,136)">
        <rect x="0" y="0" width="70" height="80" rx="6" fill="none" stroke="currentColor"/>
        <rect x="80" y="0" width="70" height="80" rx="6" fill="none" stroke="currentColor"/>
        <rect x="170" y="0" width="70" height="80" rx="6" style="fill:var(--verde-claro);stroke:var(--verde)"/>
        <rect x="250" y="0" width="70" height="80" rx="6" style="fill:var(--verde-claro);stroke:var(--verde)"/>
        <text x="35" y="22">Faixa 0</text><text x="115" y="22">Faixa 1</text><text x="205" y="22">Faixa 0</text><text x="285" y="22">Faixa 1</text>
        <text x="35" y="44">Faixa 2</text><text x="115" y="44">Faixa 3</text><text x="205" y="44">Faixa 2</text><text x="285" y="44">Faixa 3</text>
        <text x="35" y="66">Faixa 4</text><text x="115" y="66">Faixa 5</text><text x="205" y="66">Faixa 4</text><text x="285" y="66">Faixa 5</text>
        <text x="395" y="34" font-size="11">cópias (em verde):</text>
        <text x="395" y="50" font-size="11">capacidade útil 50%</text>
      </g>
      <g transform="translate(10,246)">
        <rect x="0" y="0" width="64" height="80" rx="6" fill="none" stroke="currentColor"/>
        <rect x="70" y="0" width="64" height="80" rx="6" fill="none" stroke="currentColor"/>
        <rect x="140" y="0" width="64" height="80" rx="6" fill="none" stroke="currentColor"/>
        <rect x="210" y="0" width="64" height="80" rx="6" fill="none" stroke="currentColor"/>
        <rect x="280" y="0" width="64" height="80" rx="6" fill="none" stroke="currentColor"/>
        <rect x="282" y="10" width="60" height="18" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
        <rect x="212" y="32" width="60" height="18" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
        <rect x="142" y="54" width="60" height="18" style="fill:var(--ambar-claro);stroke:var(--ambar)"/>
        <text x="32" y="23">F0</text><text x="102" y="23">F1</text><text x="172" y="23">F2</text><text x="242" y="23">F3</text><text x="312" y="23">P0-3</text>
        <text x="32" y="45">F4</text><text x="102" y="45">F5</text><text x="172" y="45">F6</text><text x="242" y="45">P4-7</text><text x="312" y="45">F7</text>
        <text x="32" y="67">F8</text><text x="102" y="67">F9</text><text x="172" y="67">P8-11</text><text x="242" y="67">F10</text><text x="312" y="67">F11</text>
        <text x="405" y="34" font-size="11">paridade (amarelo)</text>
        <text x="405" y="50" font-size="11">gira entre os discos</text>
      </g>
    </g>
  </svg>
  <figcaption>Baseado na Figura 5.17 do Tanenbaum. No RAID 4 a organização é a mesma do RAID 5, mas toda a paridade fica num único disco.</figcaption>
</figure>

<h2>Os níveis</h2>
<h3>RAID 0: striping</h3>
<p>Faixas distribuídas em round-robin pelos discos, <strong>sem redundância</strong>. Ótimo desempenho para requisições grandes (um pedido de 4 faixas vira 4 comandos em paralelo). Ruim para quem lê um setor por vez (não há paralelismo). <strong>Não é "de verdade" RAID</strong>, pois não tem redundância, e a confiabilidade é <em>pior</em> que a de um disco: com 4 discos de tempo médio de falha de 20 mil horas, espera-se uma falha a cada 5 mil horas, e qualquer falha perde tudo.</p>
<h3>RAID 1: espelhamento (mirroring)</h3>
<p>Cada faixa é gravada em <strong>dois discos</strong>. Escrita: cada faixa é escrita duas vezes (desempenho igual ao de um disco). Leitura: qualquer cópia serve, escolhendo o disco com menor seek e latência, com até o dobro do desempenho. Recuperação simples: troca-se o disco e copia-se o espelho. Desvantagem: <strong>custo</strong>, o dobro do espaço físico.</p>
<h3>RAID 2: palavras com código de Hamming</h3>
<p>Trabalha com <strong>bits ou palavras</strong>, não faixas. Ex.: cada 4 bits de dados + 3 bits de Hamming = 7 bits, um em cada um de 7 discos <strong>sincronizados</strong> (todos os braços e rotações alinhados). Corrige erro de 1 bit; o número de discos redundantes cresce com o logaritmo do número de discos de dados. Alta taxa de transferência, mas exige muitos discos e controlador complexo (Hamming a cada bit).</p>
<h3>RAID 3: paridade de bit em disco único</h3>
<p>Versão simplificada do RAID 2: <strong>um único bit de paridade</strong> por palavra, num <strong>disco de paridade</strong>; discos sincronizados. Paridade só detecta erro aleatório, mas <strong>corrige a falha de um disco</strong>, porque a posição do bit perdido é conhecida. Alta taxa de dados, mas trata <strong>uma requisição por vez</strong> (todos os discos participam de cada E/S).</p>
<h3>RAID 4: paridade de faixa em disco dedicado</h3>
<p>Volta a trabalhar com <strong>faixas</strong> e discos <strong>independentes</strong> (atendem requisições em paralelo). A faixa de paridade é o XOR das faixas de dados e fica num disco extra. Problema: numa <strong>pequena atualização</strong>, é preciso ler a faixa antiga e a paridade antiga, recalcular e escrever as duas (2 leituras + 2 escritas), e o <strong>disco de paridade vira gargalo</strong>, pois toda escrita passa por ele.</p>
<h3>RAID 5: paridade distribuída</h3>
<p>Igual ao RAID 4, mas a paridade é <strong>distribuída em todos os discos</strong>, em round-robin, eliminando o gargalo. Tolera a falha de <strong>um</strong> disco; a reconstrução, porém, é um processo complexo.</p>
<h3>RAID 6: dupla paridade</h3>
<p>Acrescenta um <strong>segundo cálculo de paridade</strong> (o XOR do RAID 4/5 + um algoritmo adicional de verificação), também distribuído. Vantagem: <strong>dois discos podem falhar simultaneamente</strong>. Custa dois discos de capacidade e escritas mais lentas (duas paridades a atualizar).</p>
<h3>RAID 10 (1+0)</h3>
<p>Combina os dois: os dados são divididos em faixas (<strong>RAID 0</strong>) e os discos de dados são <strong>espelhados</strong> (<strong>RAID 1</strong>). Desempenho alto e boa tolerância a falhas (sobrevive à perda de um disco de cada par), ao custo de 50% da capacidade.</p>

<h2>Tabela comparativa</h2>
<table>
  <tr><th>Nível</th><th>Redundância</th><th>Desempenho</th><th>Capacidade útil (n discos)</th><th>Falhas toleradas</th></tr>
  <tr><td>0</td><td>Nenhuma (só striping)</td><td>Leitura e escrita altas</td><td>100% (n)</td><td>0</td></tr>
  <tr><td>1</td><td>Espelhamento</td><td>Leitura até 2×; escrita como 1 disco</td><td>50%</td><td>1 (de cada par)</td></tr>
  <tr><td>2</td><td>Código de Hamming (bit)</td><td>Transferência alta; uma E/S por vez</td><td>ex.: 4 de 7 (≈57%)</td><td>1</td></tr>
  <tr><td>3</td><td>Paridade de bit, disco dedicado</td><td>Transferência alta; uma E/S por vez</td><td>(n − 1)/n</td><td>1</td></tr>
  <tr><td>4</td><td>Paridade de faixa, disco dedicado</td><td>Leituras paralelas; escrita com gargalo no disco de paridade</td><td>(n − 1)/n</td><td>1</td></tr>
  <tr><td>5</td><td>Paridade de faixa distribuída</td><td>Leituras paralelas; escrita melhor que RAID 4</td><td>(n − 1)/n</td><td>1</td></tr>
  <tr><td>6</td><td>Dupla paridade distribuída</td><td>Leitura boa; escrita mais lenta que RAID 5</td><td>(n − 2)/n</td><td>2</td></tr>
  <tr><td>10</td><td>Espelhamento de faixas</td><td>Leitura e escrita altas</td><td>50%</td><td>1 por par</td></tr>
</table>

<h2>RAID por hardware x por software</h2>
<ul>
  <li><strong>Hardware</strong>: os discos físicos formam o disco lógico; a organização é configurada e gerenciada pela <strong>controladora RAID</strong>, cujo firmware gera a redundância. O SO enxerga um disco comum.</li>
  <li><strong>Software</strong>: diferentes <strong>partições</strong> (discos lógicos) compõem um único disco lógico, e o RAID é feito pelo <strong>driver de disco</strong> (software, usando a CPU). Normalmente implementa <strong>RAID 1 e RAID 5</strong>.</li>
</ul>

<div class="exemplo">
  <p><strong>Exemplo passo a passo: reconstruindo um disco pela paridade</strong> (slides, RAID 3). Arranjo de 5 discos: discos 0 a 3 com dados e disco 4 com paridade, calculada bit a bit por OU exclusivo (XOR, ⊕): <code>x4 = x3 ⊕ x2 ⊕ x1 ⊕ x0</code>. Lembrete: XOR dá 1 quando o número de 1s é ímpar.</p>
  <table>
    <tr><th>Momento</th><th>Disco 0</th><th>Disco 1</th><th>Disco 2</th><th>Disco 3</th><th>Disco 4 (paridade)</th></tr>
    <tr><td>1. Gravação do bit i</td><td>1</td><td>0</td><td>1</td><td>1</td><td>1 ⊕ 0 ⊕ 1 ⊕ 1 = <strong>1</strong></td></tr>
    <tr><td>2. Disco 1 queima</td><td>1</td><td><strong>?</strong></td><td>1</td><td>1</td><td>1</td></tr>
    <tr><td>3. Reconstrução</td><td colspan="5"><code>x1 = x4 ⊕ x3 ⊕ x2 ⊕ x0</code> = 1 ⊕ 1 ⊕ 1 ⊕ 1 = <strong>0</strong> ✔ (era 0)</td></tr>
  </table>
  <p>A controladora sabe <em>qual</em> disco falhou, então um único bit de paridade basta para corrigir. Repetindo isso para todos os bits, o disco novo é preenchido.</p>
  <p><strong>Capacidade útil</strong> com 4 discos de 2 TB: RAID 0 = 8 TB; RAID 10 = 4 TB; RAID 5 = 3 × 2 = 6 TB; RAID 6 = 2 × 2 = 4 TB.</p>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>RAID 0 não tem redundância</strong> e é <em>menos</em> confiável que um disco só.</li>
    <li><strong>RAID 4 x RAID 5</strong>: os dois usam paridade de faixa; a diferença é <strong>onde</strong> fica a paridade (disco dedicado x distribuída). O gargalo de escrita é do RAID 4.</li>
    <li><strong>RAID 2 e 3</strong> trabalham com bits/palavras e discos sincronizados; <strong>4, 5 e 6</strong> com faixas e discos independentes.</li>
    <li>Paridade simples corrige <strong>uma</strong> falha de disco (porque se sabe qual disco falhou). Para duas falhas simultâneas, só RAID 6 (ou RAID 10, se forem de pares diferentes).</li>
    <li>RAID <strong>não substitui backup</strong>: um arquivo apagado por engano é apagado em todas as cópias.</li>
  </ul>
</div>
`,
  resumo: 'RAID é um conjunto de discos visto como um disco lógico, que distribui faixas (striping) para ganhar desempenho e guarda redundância para tolerar falhas. RAID 0 só faz striping; RAID 1 espelha; RAID 2 usa Hamming e RAID 3 um disco de paridade de bit (discos sincronizados); RAID 4 tem paridade de faixa em disco dedicado (gargalo) e RAID 5 a distribui; RAID 6 tem dupla paridade e tolera duas falhas; RAID 10 combina striping e espelhamento. Pode ser feito pela controladora (hardware) ou pelo driver (software, em geral RAID 1 e 5).',
  questoes: [
    {
      id: 'm09-a04-q1',
      enunciado: 'Qual nível de RAID distribui os dados entre os discos <strong>sem nenhuma redundância</strong>?',
      alternativas: [
        { texto: 'RAID 0.', correta: true, explicacao: 'Correto. RAID 0 é só striping: ganha desempenho em requisições grandes, mas a falha de qualquer disco perde os dados. Por isso o Tanenbaum diz que ele não é "de verdade" RAID.' },
        { texto: 'RAID 1.', correta: false, explicacao: 'RAID 1 é espelhamento: cada faixa é gravada em dois discos. É redundância pura.' },
        { texto: 'RAID 5.', correta: false, explicacao: 'RAID 5 guarda paridade distribuída e tolera a falha de um disco.' },
        { texto: 'RAID 10.', correta: false, explicacao: 'RAID 10 faz striping, mas também espelha os discos, então tem redundância.' },
      ],
    },
    {
      id: 'm09-a04-q2',
      enunciado: 'Qual a diferença essencial entre <strong>RAID 4</strong> e <strong>RAID 5</strong>?',
      alternativas: [
        { texto: 'No RAID 4 a paridade fica num disco dedicado, que vira gargalo nas escritas; no RAID 5 ela é distribuída por todos os discos.', correta: true, explicacao: 'Correto. Ambos usam paridade de faixa (XOR) e discos independentes. Como toda escrita atualiza a paridade, concentrá-la num disco o sobrecarrega; o RAID 5 espalha essa carga.' },
        { texto: 'O RAID 4 usa espelhamento e o RAID 5 usa paridade.', correta: false, explicacao: 'Espelhamento é o RAID 1. RAID 4 e 5 usam paridade.' },
        { texto: 'O RAID 5 tolera duas falhas simultâneas e o RAID 4 só uma.', correta: false, explicacao: 'Os dois toleram uma falha. Quem tolera duas é o RAID 6, com a segunda paridade.' },
        { texto: 'O RAID 4 trabalha com bits em discos sincronizados e o RAID 5 com faixas.', correta: false, explicacao: 'Bits e discos sincronizados são características dos RAIDs 2 e 3. RAID 4 e 5 trabalham com faixas.' },
      ],
    },
    {
      id: 'm09-a04-q3',
      enunciado: 'Num RAID 3 com 4 discos de dados e 1 de paridade, os bits de dados de uma posição são 1, 0, 1, 1 (discos 0 a 3). O disco 1 falha. Qual valor é reconstruído para ele?',
      alternativas: [
        { texto: '0, porque x1 = x4 ⊕ x3 ⊕ x2 ⊕ x0 = 1 ⊕ 1 ⊕ 1 ⊕ 1 = 0.', correta: true, explicacao: 'Correto. A paridade gravada foi x4 = 1 ⊕ 0 ⊕ 1 ⊕ 1 = 1 (três 1s, ímpar). Na reconstrução, XOR de quatro 1s (par) dá 0, que é o valor original do disco 1.' },
        { texto: '1, porque a paridade vale 1.', correta: false, explicacao: 'O bit perdido não é igual à paridade: é o XOR da paridade com os bits restantes. 1 ⊕ 1 ⊕ 1 ⊕ 1 = 0.' },
        { texto: 'Não é possível reconstruir: paridade só detecta erros.', correta: false, explicacao: 'Para erro aleatório, paridade só detecta. Mas numa falha de disco a posição do bit perdido é conhecida, e então a paridade permite corrigir.' },
        { texto: 'É preciso copiar o espelho do disco 1.', correta: false, explicacao: 'Espelho existe no RAID 1 e no 10. O RAID 3 recupera pela paridade, sem cópia.' },
      ],
    },
    {
      id: 'm09-a04-q4',
      enunciado: 'Um servidor tem <strong>5 discos de 1 TB</strong> em <strong>RAID 5</strong>. Qual a capacidade útil e quantas falhas simultâneas ele tolera?',
      alternativas: [
        { texto: '4 TB; tolera a falha de 1 disco.', correta: true, explicacao: 'Correto. Em RAID 5, o equivalente a um disco é usado para paridade (distribuída): (5 − 1) × 1 TB = 4 TB. Com uma paridade, só uma falha é recuperável.' },
        { texto: '5 TB; tolera a falha de 1 disco.', correta: false, explicacao: '5 TB seria o RAID 0, sem redundância. A paridade do RAID 5 ocupa o equivalente a um disco.' },
        { texto: '3 TB; tolera a falha de 2 discos.', correta: false, explicacao: 'Isso descreve o RAID 6: duas paridades, (5 − 2) × 1 TB = 3 TB, tolerando duas falhas.' },
        { texto: '2,5 TB; tolera a falha de metade dos discos.', correta: false, explicacao: '50% de capacidade é característica do espelhamento (RAID 1 ou 10), não do RAID 5.' },
      ],
    },
    {
      id: 'm09-a04-q5',
      enunciado: 'Por que o <strong>RAID 0</strong> com 4 discos é <em>menos</em> confiável que um único disco?',
      alternativas: [
        { texto: 'Porque há mais discos que podem falhar e a falha de qualquer um deles perde os dados, já que não há redundância.', correta: true, explicacao: 'Correto. O exemplo do Tanenbaum: 4 discos com tempo médio de falha de 20 mil horas dão uma falha esperada a cada 5 mil horas, e qualquer falha destrói todo o conjunto.' },
        { texto: 'Porque os discos precisam estar sincronizados e se desalinham.', correta: false, explicacao: 'Sincronização é exigida nos RAIDs 2 e 3, não no RAID 0.' },
        { texto: 'Porque o disco de paridade vira gargalo.', correta: false, explicacao: 'RAID 0 não tem paridade. O gargalo no disco de paridade é problema do RAID 4.' },
        { texto: 'Na verdade é mais confiável, porque divide os dados.', correta: false, explicacao: 'Dividir os dados sem redundância só espalha o risco: perder uma faixa estraga os arquivos que passam por ela.' },
      ],
    },
    {
      id: 'm09-a04-q6',
      enunciado: 'Qual nível permite que <strong>dois discos falhem simultaneamente</strong> sem perda de dados, em qualquer combinação?',
      alternativas: [
        { texto: 'RAID 6.', correta: true, explicacao: 'Correto. O RAID 6 calcula duas informações de redundância diferentes (XOR + outro algoritmo), o que permite reconstruir dois discos quaisquer.' },
        { texto: 'RAID 5.', correta: false, explicacao: 'O RAID 5 tem uma só paridade e tolera uma falha. Uma segunda falha antes da reconstrução perde dados.' },
        { texto: 'RAID 10.', correta: false, explicacao: 'O RAID 10 sobrevive a duas falhas só se forem em pares espelhados diferentes. Se os dois discos de um mesmo par falharem, os dados se perdem.' },
        { texto: 'RAID 0.', correta: false, explicacao: 'O RAID 0 não tolera nenhuma falha.' },
      ],
    },
    {
      id: 'm09-a04-q7',
      enunciado: 'Sobre RAID implementado <strong>por software</strong>, é correto afirmar:',
      alternativas: [
        { texto: 'Partições (discos lógicos) são combinadas num disco lógico pelo driver de disco, normalmente em RAID 1 ou RAID 5.', correta: true, explicacao: 'Correto, como nos slides. O trabalho de redundância é feito pelo software (driver), usando a CPU, em vez do firmware da controladora.' },
        { texto: 'A controladora RAID gera a redundância no firmware e o SO não percebe nada.', correta: false, explicacao: 'Isso descreve o RAID por hardware.' },
        { texto: 'Só é possível implementar RAID 0 por software.', correta: false, explicacao: 'Os slides dizem que RAID por software normalmente implementa os níveis 1 e 5.' },
        { texto: 'Dispensa os discos físicos, simulando-os na memória.', correta: false, explicacao: 'O RAID por software ainda usa discos reais; ele só organiza as partições num disco lógico.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm09-a04-d1',
      enunciado: 'Explique o que é RAID e compare os níveis 0, 1 e 5 quanto a redundância, desempenho e capacidade útil.',
      respostaModelo: `<p><strong>RAID</strong> (arranjo redundante de discos baratos/independentes) é um conjunto de discos que o SO enxerga como um único disco lógico. Os dados são distribuídos em faixas pelos discos (striping), o que permite acessos paralelos, e informações redundantes permitem recuperar os dados se um disco falhar, o que é importante porque mais discos aumentam a chance de falha.</p>
<p><strong>RAID 0:</strong> só striping, sem redundância. Melhor desempenho em leitura e escrita para requisições grandes e 100% da capacidade, mas a falha de qualquer disco perde tudo (menos confiável que um disco).</p>
<p><strong>RAID 1:</strong> espelhamento: cada faixa é gravada em dois discos. Leituras podem usar a cópia mais próxima (até 2× mais rápidas); escritas como um disco. Recuperação simples, mas usa só 50% da capacidade.</p>
<p><strong>RAID 5:</strong> faixas com paridade (XOR) distribuída em todos os discos. Tolera uma falha, reconstruindo o disco pela paridade; leituras paralelas e escritas sem o gargalo do disco de paridade do RAID 4 (mas cada pequena escrita exige ler e reescrever a paridade). Capacidade útil (n − 1)/n.</p>`,
      pontosChave: [
        'Definiu RAID como vários discos vistos como um disco lógico, com striping e redundância',
        'RAID 0: striping sem redundância, alto desempenho, 100% da capacidade',
        'RAID 1: espelhamento, leitura melhor, 50% da capacidade',
        'RAID 5: paridade distribuída, tolera 1 falha, capacidade (n − 1)/n',
        'Mencionou a diferença para o RAID 4 (disco de paridade dedicado como gargalo) ou o custo de escrita da paridade',
      ],
    },
  ],
});
