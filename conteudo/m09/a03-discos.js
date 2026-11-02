// Módulo 9, aula 3: geometria do disco, tempos de acesso, entrelaçamento e escalonamento do braço.
SO1.registerLesson({
  id: 'm09-a03',
  titulo: 'Discos e escalonamento de disco',
  fontes: [
    'Tanenbaum, SO Modernos 3ª ed., §5.4.1 hardware do disco (p.222–224), §5.4.2 formatação, deslocamento de cilindro e entrelaçamento (p.233–235), §5.4.3 algoritmos de escalonamento do braço (p.235–237)',
    'Slides cap5 (Oliveira/Carissimi/Toscani, UFRGS): disco magnético, organização e formatação, características físicas, CHS/LBA, desempenho do disco, seek, latência rotacional, tempo de transferência e exemplo, entrelaçamento, escalonamento do disco (FCFS, SSTF, SCAN, C-SCAN, C-LOOK, N-step-SCAN, FSCAN)',
  ],
  corpo: `
<div class="analogia">
  <p><strong>Analogia: o elevador de um prédio.</strong> Pessoas chamam o elevador em andares diferentes. Se ele atender na ordem das chamadas, sobe e desce feito louco. Se atender sempre o andar mais próximo, quem está no 30º andar pode esperar para sempre. A solução dos prédios: seguir numa direção atendendo todos os andares pelo caminho e só então inverter. O braço do disco tem exatamente o mesmo problema, e o nome de um dos algoritmos é <em>algoritmo do elevador</em>.</p>
</div>

<h2>Geometria do disco</h2>
<p>O disco magnético tem um ou mais <strong>pratos</strong> (platters) recobertos de material magnético, girando em velocidade constante. Os dados são lidos e gravados por <strong>cabeçotes</strong> (um por superfície), montados num <strong>braço</strong> móvel que se desloca junto para todos os pratos.</p>
<figure class="diagrama">
  <svg viewBox="0 0 470 220" style="max-width:540px" role="img" aria-label="Vista de cima de um prato com trilhas, um setor e o braço com o cabeçote">
    <g fill="none" stroke="currentColor">
      <circle cx="120" cy="110" r="95"/>
      <circle cx="120" cy="110" r="75"/>
      <circle cx="120" cy="110" r="55"/>
      <circle cx="120" cy="110" r="35"/>
      <circle cx="120" cy="110" r="10"/>
    </g>
    <path d="M120 110 L215 110 A95 95 0 0 0 202.3 62.5 Z" style="fill:var(--azul-claro);stroke:var(--azul)" stroke-width="1.5"/>
    <circle cx="120" cy="110" r="55" fill="none" style="stroke:var(--verde)" stroke-width="4"/>
    <path d="M330 200 L170 50" style="stroke:var(--ambar)" stroke-width="6" stroke-linecap="round"/>
    <circle cx="330" cy="200" r="9" style="fill:var(--ambar)"/>
    <rect x="160" y="40" width="14" height="14" style="fill:var(--ambar)"/>
    <g font-size="12" fill="currentColor">
      <text x="230" y="70" style="fill:var(--azul)">setor</text>
      <text x="230" y="84">(ex.: 512 bytes)</text>
      <text x="20" y="215" style="fill:var(--verde)">trilha (círculo concêntrico)</text>
      <text x="250" y="40" style="fill:var(--ambar)">cabeçote</text>
      <text x="275" y="140" style="fill:var(--ambar)">braço</text>
      <text x="348" y="185">move todos os</text>
      <text x="348" y="199">cabeçotes juntos</text>
      <text x="348" y="213">(seek)</text>
    </g>
  </svg>
  <figcaption>Um prato visto de cima. <strong>Cilindro</strong> é o conjunto das trilhas de mesmo número em todas as superfícies, ou seja, tudo o que os cabeçotes alcançam sem mover o braço.</figcaption>
</figure>
<ul>
  <li><strong>Trilha</strong>: círculo concêntrico; trilhas são separadas por intervalos (gaps).</li>
  <li><strong>Setor</strong>: pedaço de tamanho fixo de uma trilha (em geral 512 bytes), com <strong>preâmbulo</strong> (marca o início e traz cilindro e setor), <strong>dados</strong> e <strong>ECC</strong>. Trilhas e setores são criados pela <strong>formatação de baixo nível</strong> (feita na fábrica). A transferência é sempre em blocos de setores.</li>
  <li><strong>Cilindro</strong>: trilhas de mesmo número em pratos diferentes.</li>
  <li>Endereçar um dado exige cilindro, cabeçote (superfície) e setor: método <strong>CHS</strong>. Discos modernos usam <strong>LBA</strong> (endereçamento lógico de bloco): setores numerados 0, 1, 2… e a controladora converte para CHS. Discos modernos também têm <strong>zonas</strong> (mais setores nas trilhas externas) e apresentam ao SO uma <strong>geometria virtual</strong>.</li>
  <li>Exemplo dos slides: disco de 4,1 GB com 255 cabeças, 63 setores de 512 bytes e 525 cilindros: capacidade = 255 × 63 × 512 × 525 bytes.</li>
</ul>

<h2>Os três tempos de acesso</h2>
<p>Para ler ou escrever, o cabeçote precisa estar na trilha certa e no início do setor certo:</p>
<p style="text-align:center"><strong>t<sub>acesso</sub> = t<sub>seek</sub> + t<sub>latência</sub> + t<sub>transferência</sub></strong></p>
<table>
  <tr><th>Tempo</th><th>O que é</th><th>Como estimar</th></tr>
  <tr><td><strong>Seek</strong> (posicionamento)</td><td>Mover o braço até o cilindro certo: acionar/acelerar o braço + deslocar + confirmar a trilha. Não é linear no número de trilhas.</td><td>O fabricante informa o <strong>seek médio</strong> (ex.: 5 a 10 ms).</td></tr>
  <tr><td><strong>Latência rotacional</strong></td><td>Esperar o início do setor passar sob o cabeçote.</td><td>Em média, <strong>meia rotação</strong>: 1/(2r). Ex.: 10.000 rpm → 1 rotação = 60.000/10.000 = 6 ms → latência média 3 ms.</td></tr>
  <tr><td><strong>Transferência</strong></td><td>Ler ou gravar os dados de fato.</td><td><strong>T = b / (r·N)</strong>, com b = bytes a transferir, N = bytes por trilha, r = rotação (por unidade de tempo). Ou seja: fração da trilha × tempo de uma rotação.</td></tr>
</table>
<p>Fórmula dos slides para o tempo médio de acesso: <strong>T<sub>acesso</sub> = t<sub>seek médio</sub> + 1/(2r) + b/(r·N)</strong>. Na maioria dos discos o <strong>seek domina</strong> os outros dois tempos; por isso os algoritmos de escalonamento tentam reduzir o deslocamento do braço.</p>

<div class="exemplo">
  <p><strong>Exemplo dos slides: ler um arquivo de 1,3 MB.</strong> Disco: seek médio 10 ms, 10.000 rpm (1 rotação = 6 ms, latência média = 3 ms), setores de 512 bytes, 320 setores por trilha. O arquivo tem 2.560 setores = 8 trilhas × 320.</p>
  <table>
    <tr><th>Caso</th><th>Conta</th><th>Resultado</th></tr>
    <tr><td><strong>I. Sequencial</strong> (trilhas inteiras e vizinhas)</td><td>1 seek + 8 × (latência 3 ms + 1 rotação inteira 6 ms para ler a trilha) = 10 + 8 × 9</td><td><strong>82 ms</strong></td></tr>
    <tr><td><strong>II. Aleatório</strong> (um setor por vez, cada um num lugar)</td><td>Transferência de 1 setor = 6 ms / 320 = 0,01875 ms; total = 2.560 × (10 + 3 + 0,01875) = 2.560 × 13,01875</td><td><strong>33.328 ms ≈ 33,3 s</strong></td></tr>
  </table>
  <p>Os mesmos dados, cerca de <strong>400 vezes mais lentos</strong> no acesso aleatório: quase todo o tempo vai em seek e latência. Moral: posicionar o braço é o que custa caro.</p>
</div>

<h2>Entrelaçamento (interleaving) e deslocamento de cilindro</h2>
<p><strong>Entrelaçamento</strong>: depois de ler um setor, a controladora gasta tempo copiando o buffer para a memória; enquanto isso o próximo setor já passou sob o cabeçote, e seria preciso esperar uma rotação inteira. A solução é numerar os setores <strong>com um espaço entre eles</strong>: no <strong>entrelaçamento simples</strong>, os setores consecutivos ficam separados por um setor (0, 4, 1, 5, 2, 6, 3, 7 numa trilha de 8); no <strong>duplo</strong>, por dois. Nos slides, o mesmo conceito aparece como <strong>fator de entrelaçamento</strong> (o número de setores entre dois setores consecutivos): <strong>fator 1 = simples, 2 = duplo; 0 = sem entrelaçamento</strong>. Os slides desenham os fatores 0 e 2 numa trilha de 16 setores. O objetivo é evitar a latência rotacional entre setores logicamente adjacentes. Controladoras modernas, com buffer de uma trilha inteira, dispensam o entrelaçamento.</p>
<p><strong>Deslocamento de cilindro</strong> (cylinder skew): a posição do setor 0 de cada trilha é deslocada em relação à anterior, para que, depois de mover o braço para a trilha vizinha, o setor 0 ainda não tenha passado.</p>

<h2>Algoritmos de escalonamento do braço</h2>
<p>Com várias requisições pendentes, o driver escolhe a ordem de atendimento para <strong>minimizar o seek</strong> (e aproveitar a largura de banda do disco: bytes transferidos ÷ tempo entre o primeiro pedido e o fim da transferência).</p>
<table>
  <tr><th>Algoritmo</th><th>Regra</th><th>Prós e contras</th></tr>
  <tr><td><strong>FCFS</strong> (first-come, first-served)</td><td>Na ordem de chegada.</td><td>Justo e simples, mas o braço vai e volta à toa.</td></tr>
  <tr><td><strong>SSTF</strong> (shortest seek time first; no Tanenbaum, <strong>SSF</strong>)</td><td>Sempre a requisição <strong>mais próxima</strong> da posição atual.</td><td>Análogo ao SJF. Reduz muito o seek, mas pode causar <strong>postergação indefinida</strong> (starvation) das requisições nas extremidades, porque o braço tende a ficar no meio do disco.</td></tr>
  <tr><td><strong>SCAN</strong> (elevador)</td><td>Varre numa direção atendendo tudo pelo caminho <strong>até a extremidade do disco</strong>, depois inverte.</td><td>Sem starvation; distância máxima limitada (2 × número de cilindros).</td></tr>
  <tr><td><strong>LOOK</strong></td><td>Como o SCAN, mas inverte na <strong>última requisição</strong> da direção, sem ir até a extremidade.</td><td>É o "algoritmo do elevador" descrito pelo Tanenbaum (um bit de direção SOBE/DESCE).</td></tr>
  <tr><td><strong>C-SCAN</strong> (circular)</td><td>Atende só <strong>num sentido</strong>; ao chegar à extremidade, volta direto ao início do disco e recomeça.</td><td>Trata o disco como fila circular: tempo de espera <strong>mais uniforme</strong> que o SCAN.</td></tr>
  <tr><td><strong>C-LOOK</strong></td><td>Como o C-SCAN, mas não vai até a extremidade: depois da última requisição, volta à requisição de menor número.</td><td>Versão do C-SCAN sem o trecho inútil até a ponta.</td></tr>
</table>
<p><strong>Atenção aos nomes:</strong> nos slides, <strong>elevador = SCAN</strong> (vai até a extremidade); no Tanenbaum, o <strong>elevador inverte na última requisição (= LOOK)</strong>. É dessa mistura que vem o 208 do slide (ver abaixo).</p>
<p><strong>Resumo do exemplo clássico dos slides</strong> (disco 0–199, cabeçote em 53, fila 98, 183, 37, 122, 14, 124, 65, 67; ↓ = começa descendo, ↑ = começa subindo):</p>
<table>
  <tr><th>Algoritmo</th><th>FCFS</th><th>SSTF</th><th>SCAN↓</th><th>LOOK↓</th><th>C-SCAN↑</th><th>C-LOOK↑</th></tr>
  <tr><td>Deslocamento total</td><td>640</td><td>236</td><td>236</td><td>208</td><td>382 (183 sem o retorno)</td><td>322 (153 sem o retorno)</td></tr>
</table>
<p>Variações: <strong>N-step-SCAN</strong> (divide a fila em subfilas de tamanho N, cada uma atendida com SCAN; novas requisições vão para outra subfila) e <strong>FSCAN</strong> (duas filas: uma recebe as novas requisições enquanto a outra é atendida). Os slides dizem que o SSTF é o mais usado, que SCAN e C-SCAN se saem melhor com muitos acessos e que o algoritmo deve ser um módulo separado do SO, fácil de trocar.</p>

<div class="exemplo">
  <p><strong>Exemplo passo a passo (Tanenbaum, Figuras 5.25 e 5.26).</strong> Disco com 40 cilindros (0 a 39). O braço está no <strong>cilindro 11</strong>. Chegam, nesta ordem, requisições para os cilindros <strong>1, 36, 16, 34, 9 e 12</strong>.</p>
  <table>
    <tr><th>Algoritmo</th><th>Ordem de atendimento</th><th>Deslocamentos</th><th>Total</th></tr>
    <tr><td>FCFS</td><td>11 → 1 → 36 → 16 → 34 → 9 → 12</td><td>10 + 35 + 20 + 18 + 25 + 3</td><td><strong>111</strong></td></tr>
    <tr><td>SSTF</td><td>11 → 12 → 9 → 16 → 1 → 34 → 36</td><td>1 + 3 + 7 + 15 + 33 + 2</td><td><strong>61</strong></td></tr>
    <tr><td>Elevador/LOOK (subindo)</td><td>11 → 12 → 16 → 34 → 36 → 9 → 1</td><td>1 + 4 + 18 + 2 + 27 + 8</td><td><strong>60</strong></td></tr>
    <tr><td>SCAN (subindo até 39)</td><td>11 → 12 → 16 → 34 → 36 → <em>39</em> → 9 → 1</td><td>(39 − 11) + (39 − 1) = 28 + 38</td><td><strong>66</strong></td></tr>
    <tr><td>C-LOOK (subindo)</td><td>11 → 12 → 16 → 34 → 36 ⤳ 1 → 9</td><td>25 + retorno 35 + 8</td><td><strong>68</strong> (33 sem contar o retorno)</td></tr>
  </table>
  <p>Como decidir no SSTF, passo a passo: em 11, a mais próxima é 12 (dist. 1). Em 12: 9 (3) ganha de 16 (4). Em 9: 16 (7) ganha de 1 (8). Em 16: 1 (15) ganha de 34 (18). Em 1: só restam 34 (33) e 36. Por fim 36 (2).</p>
  <figure class="diagrama">
    <svg viewBox="0 0 460 415" style="max-width:640px" role="img" aria-label="Movimento do braço para FCFS, SSTF e elevador, com cilindros de 0 a 39 no eixo horizontal e o tempo descendo">
<text x="30" y="20" font-size="13" font-weight="bold" fill="currentColor">FCFS</text>
<text x="430" y="20" font-size="13" text-anchor="end" style="fill:var(--vermelho)" font-weight="bold">total = 111 cilindros</text>
<g font-size="10" text-anchor="middle" fill="currentColor"><text x="30" y="36">0</text><text x="80" y="36">5</text><text x="130" y="36">10</text><text x="180" y="36">15</text><text x="230" y="36">20</text><text x="280" y="36">25</text><text x="330" y="36">30</text><text x="380" y="36">35</text></g>
<line x1="30" y1="40" x2="420" y2="40" stroke="currentColor"/>
<circle cx="40" cy="40" r="3.5" fill="currentColor"/><circle cx="120" cy="40" r="3.5" fill="currentColor"/><circle cx="150" cy="40" r="3.5" fill="currentColor"/><circle cx="190" cy="40" r="3.5" fill="currentColor"/><circle cx="370" cy="40" r="3.5" fill="currentColor"/><circle cx="390" cy="40" r="3.5" fill="currentColor"/>
<circle cx="140" cy="40" r="4.5" fill="none" style="stroke:var(--azul)" stroke-width="2"/>
<polyline points="140,52 40,65 390,78 190,91 370,104 120,117 150,130" fill="none" style="stroke:var(--vermelho)" stroke-width="2"/>
<circle cx="140" cy="52" r="3" style="fill:var(--vermelho)"/><circle cx="40" cy="65" r="3" style="fill:var(--vermelho)"/><circle cx="390" cy="78" r="3" style="fill:var(--vermelho)"/><circle cx="190" cy="91" r="3" style="fill:var(--vermelho)"/><circle cx="370" cy="104" r="3" style="fill:var(--vermelho)"/><circle cx="120" cy="117" r="3" style="fill:var(--vermelho)"/><circle cx="150" cy="130" r="3" style="fill:var(--vermelho)"/>
<g font-size="10" fill="currentColor"><text x="34" y="69" text-anchor="end">1</text><text x="396" y="82" text-anchor="start">36</text><text x="184" y="95" text-anchor="end">16</text><text x="376" y="108" text-anchor="start">34</text><text x="114" y="121" text-anchor="end">9</text><text x="156" y="134" text-anchor="start">12</text></g>
<text x="30" y="155" font-size="13" font-weight="bold" fill="currentColor">SSTF (SSF)</text>
<text x="430" y="155" font-size="13" text-anchor="end" style="fill:var(--ambar)" font-weight="bold">total = 61 cilindros</text>
<g font-size="10" text-anchor="middle" fill="currentColor"><text x="30" y="171">0</text><text x="80" y="171">5</text><text x="130" y="171">10</text><text x="180" y="171">15</text><text x="230" y="171">20</text><text x="280" y="171">25</text><text x="330" y="171">30</text><text x="380" y="171">35</text></g>
<line x1="30" y1="175" x2="420" y2="175" stroke="currentColor"/>
<circle cx="40" cy="175" r="3.5" fill="currentColor"/><circle cx="120" cy="175" r="3.5" fill="currentColor"/><circle cx="150" cy="175" r="3.5" fill="currentColor"/><circle cx="190" cy="175" r="3.5" fill="currentColor"/><circle cx="370" cy="175" r="3.5" fill="currentColor"/><circle cx="390" cy="175" r="3.5" fill="currentColor"/>
<circle cx="140" cy="175" r="4.5" fill="none" style="stroke:var(--azul)" stroke-width="2"/>
<polyline points="140,187 150,200 120,213 190,226 40,239 370,252 390,265" fill="none" style="stroke:var(--ambar)" stroke-width="2"/>
<circle cx="140" cy="187" r="3" style="fill:var(--ambar)"/><circle cx="150" cy="200" r="3" style="fill:var(--ambar)"/><circle cx="120" cy="213" r="3" style="fill:var(--ambar)"/><circle cx="190" cy="226" r="3" style="fill:var(--ambar)"/><circle cx="40" cy="239" r="3" style="fill:var(--ambar)"/><circle cx="370" cy="252" r="3" style="fill:var(--ambar)"/><circle cx="390" cy="265" r="3" style="fill:var(--ambar)"/>
<g font-size="10" fill="currentColor"><text x="156" y="204" text-anchor="start">12</text><text x="114" y="217" text-anchor="end">9</text><text x="196" y="230" text-anchor="start">16</text><text x="34" y="243" text-anchor="end">1</text><text x="364" y="256" text-anchor="end">34</text><text x="396" y="269" text-anchor="start">36</text></g>
<text x="30" y="290" font-size="13" font-weight="bold" fill="currentColor">Elevador (LOOK), subindo</text>
<text x="430" y="290" font-size="13" text-anchor="end" style="fill:var(--verde)" font-weight="bold">total = 60 cilindros</text>
<g font-size="10" text-anchor="middle" fill="currentColor"><text x="30" y="306">0</text><text x="80" y="306">5</text><text x="130" y="306">10</text><text x="180" y="306">15</text><text x="230" y="306">20</text><text x="280" y="306">25</text><text x="330" y="306">30</text><text x="380" y="306">35</text></g>
<line x1="30" y1="310" x2="420" y2="310" stroke="currentColor"/>
<circle cx="40" cy="310" r="3.5" fill="currentColor"/><circle cx="120" cy="310" r="3.5" fill="currentColor"/><circle cx="150" cy="310" r="3.5" fill="currentColor"/><circle cx="190" cy="310" r="3.5" fill="currentColor"/><circle cx="370" cy="310" r="3.5" fill="currentColor"/><circle cx="390" cy="310" r="3.5" fill="currentColor"/>
<circle cx="140" cy="310" r="4.5" fill="none" style="stroke:var(--azul)" stroke-width="2"/>
<polyline points="140,322 150,335 190,348 370,361 390,374 120,387 40,400" fill="none" style="stroke:var(--verde)" stroke-width="2"/>
<circle cx="140" cy="322" r="3" style="fill:var(--verde)"/><circle cx="150" cy="335" r="3" style="fill:var(--verde)"/><circle cx="190" cy="348" r="3" style="fill:var(--verde)"/><circle cx="370" cy="361" r="3" style="fill:var(--verde)"/><circle cx="390" cy="374" r="3" style="fill:var(--verde)"/><circle cx="120" cy="387" r="3" style="fill:var(--verde)"/><circle cx="40" cy="400" r="3" style="fill:var(--verde)"/>
<g font-size="10" fill="currentColor"><text x="156" y="339" text-anchor="start">12</text><text x="184" y="352" text-anchor="end">16</text><text x="364" y="365" text-anchor="end">34</text><text x="396" y="378" text-anchor="start">36</text><text x="114" y="391" text-anchor="end">9</text><text x="34" y="404" text-anchor="end">1</text></g>
    </svg>
    <figcaption>Movimento do braço: o eixo horizontal são os cilindros (pontos = requisições; círculo azul = posição inicial, cilindro 11) e o tempo corre para baixo. Quanto menos "zigue-zague", menor o deslocamento total.</figcaption>
  </figure>
</div>

<div class="atencao">
  <p><strong>Pegadinhas de prova</strong></p>
  <ul>
    <li><strong>SCAN vai até a extremidade; LOOK para na última requisição.</strong> No exemplo clássico dos slides (cabeçote em 53, disco 0–199, fila 98, 183, 37, 122, 14, 124, 65, 67), o <strong>desenho</strong> do slide de SCAN leva o braço até o cilindro 0, o que dá <strong>236</strong> (53 + 183). O <strong>208</strong> escrito no texto do slide <strong>não bate com o desenho</strong>: é o valor do LOOK descendo (inverte em 14: 39 + 169). Leia o enunciado e diga qual convenção usou.</li>
    <li>No C-SCAN e no C-LOOK, o enunciado deve dizer se o <strong>retorno</strong> do braço entra no total. Se não disser, mostre as duas contas.</li>
    <li>A <strong>direção inicial</strong> muda tudo no SCAN/LOOK/C-SCAN. Se não for dada, assuma uma e declare.</li>
    <li>SSTF ≈ SJF: ótimo em média, mas com <strong>starvation</strong>. FCFS nunca tem starvation.</li>
    <li>Latência média = <strong>metade</strong> de uma rotação (não a rotação inteira). 60.000 / rpm dá o tempo de uma rotação em ms.</li>
  </ul>
</div>
`,
  resumo: 'O disco é organizado em pratos, superfícies, trilhas, setores e cilindros. O tempo de acesso é seek + latência rotacional (meia rotação em média) + transferência (b / rN), e o seek domina, por isso os algoritmos de escalonamento reduzem o deslocamento do braço: FCFS (ordem de chegada), SSTF (mais próxima, com risco de starvation), SCAN (elevador, até a extremidade), LOOK (inverte na última requisição), C-SCAN e C-LOOK (atendem num sentido só, com espera mais uniforme). O entrelaçamento numera setores com espaços para não perder uma rotação entre setores consecutivos.',
  questoes: [
    {
      id: 'm09-a03-q1',
      enunciado: 'Disco com cilindros 0 a 199, cabeçote no cilindro <strong>53</strong>. Fila de requisições, na ordem de chegada: 98, 183, 37, 122, 14, 124, 65, 67. Qual o deslocamento total do braço com <strong>FCFS</strong>?',
      alternativas: [
        { texto: '640 cilindros.', correta: true, explicacao: 'Correto. Ordem de chegada: 53→98 (45), 98→183 (85), 183→37 (146), 37→122 (85), 122→14 (108), 14→124 (110), 124→65 (59), 65→67 (2). Soma: 45+85+146+85+108+110+59+2 = 640, o mesmo valor dos slides.' },
        { texto: '236 cilindros.', correta: false, explicacao: '236 é o total do SSTF para essa mesma fila (e também do SCAN descendo até o cilindro 0). O FCFS não reordena nada, por isso dá muito mais.' },
        { texto: '208 cilindros.', correta: false, explicacao: '208 é o total quando o braço desce até 14 e depois sobe até 183 (LOOK descendo). O FCFS atende na ordem de chegada: 45+85+146+85+108+110+59+2 = 640.' },
        { texto: '590 cilindros.', correta: false, explicacao: 'Faltou algum trecho. Some os oito deslocamentos: 45, 85, 146, 85, 108, 110, 59 e 2, que dão 640.' },
      ],
    },
    {
      id: 'm09-a03-q2',
      enunciado: 'Mesmo disco e mesma fila (cabeçote em 53; fila 98, 183, 37, 122, 14, 124, 65, 67). Qual o deslocamento total com <strong>SSTF</strong>?',
      alternativas: [
        { texto: '236 cilindros.', correta: true, explicacao: 'Correto. Sempre a mais próxima: 53→65 (12; 37 está a 16), 65→67 (2), 67→37 (30; 98 está a 31), 37→14 (23), 14→98 (84), 98→122 (24), 122→124 (2), 124→183 (59). Soma: 12+2+30+23+84+24+2+59 = 236.' },
        { texto: '208 cilindros.', correta: false, explicacao: '208 é o LOOK descendo (53→14 = 39, depois 14→183 = 169). No SSTF, de 67 o braço volta para 37 (30), porque 98 está a 31, e o total fica 236.' },
        { texto: '640 cilindros.', correta: false, explicacao: '640 é o FCFS. O SSTF reordena pela proximidade e corta o deslocamento para 236.' },
        { texto: '180 cilindros.', correta: false, explicacao: 'Não fecha. Seguindo a regra "a mais próxima" a partir de 53, a ordem é 65, 67, 37, 14, 98, 122, 124, 183, com total de 236.' },
      ],
    },
    {
      id: 'm09-a03-q3',
      enunciado: 'Mesmo cenário (cabeçote em 53, disco 0–199, fila 98, 183, 37, 122, 14, 124, 65, 67). Usando <strong>C-LOOK</strong> com o braço <strong>subindo</strong> e <strong>contando o retorno</strong> do braço, qual o deslocamento total?',
      alternativas: [
        { texto: '322 cilindros.', correta: true, explicacao: 'Correto. Sobe atendendo 65, 67, 98, 122, 124, 183: 183−53 = 130. Volta direto à menor requisição, 14: 183−14 = 169. Sobe até 37: 23. Total = 130 + 169 + 23 = 322 (153 sem contar o retorno).' },
        { texto: '382 cilindros.', correta: false, explicacao: '382 é o C-SCAN contando o retorno: sobe até a extremidade 199 (146), volta ao 0 (199) e sobe até 37 (37). O C-LOOK não vai às extremidades.' },
        { texto: '153 cilindros.', correta: false, explicacao: '153 é o C-LOOK sem contar o retorno (130 + 23). O enunciado pede para incluir o trecho 183→14 (169), totalizando 322.' },
        { texto: '299 cilindros.', correta: false, explicacao: '299 é o LOOK subindo (130 até 183 e 169 descendo até 14), que atende também na descida. No C-LOOK a volta não atende ninguém, e depois o braço ainda sobe de 14 a 37 (23): 322.' },
      ],
    },
    {
      id: 'm09-a03-q4',
      enunciado: 'Mesmo cenário (cabeçote em 53, disco 0–199). Com <strong>SCAN</strong>, o braço inicialmente <strong>descendo</strong> e indo até a extremidade (cilindro 0) antes de inverter, qual o deslocamento total?',
      alternativas: [
        { texto: '236 cilindros.', correta: true, explicacao: 'Correto. Desce atendendo 37 e 14 e vai até 0: 53 cilindros. Inverte e sobe até a última requisição, 183: 183 cilindros. Total 53 + 183 = 236. Coincide com o SSTF só neste exemplo.' },
        { texto: '208 cilindros.', correta: false, explicacao: '208 seria inverter em 14, sem ir ao 0 (comportamento LOOK): 39 + 169. É o número que aparece no slide de SCAN, mas o SCAN "puro" vai até a extremidade: 53 + 183 = 236.' },
        { texto: '331 cilindros.', correta: false, explicacao: '331 é o SCAN subindo primeiro: 53→199 (146) e 199→14 (185). O enunciado diz que o braço começa descendo.' },
        { texto: '382 cilindros.', correta: false, explicacao: '382 é o C-SCAN subindo e contando o retorno. No SCAN o braço atende nos dois sentidos.' },
      ],
    },
    {
      id: 'm09-a03-q5',
      enunciado: 'Um disco gira a <strong>6.000 rpm</strong>, tem seek médio de <strong>8 ms</strong> e trilhas de <strong>500 setores</strong> de 512 bytes. Pela fórmula dos slides, qual o tempo médio para ler <strong>um setor</strong>?',
      alternativas: [
        { texto: '13,02 ms.', correta: true, explicacao: 'Correto. 1 rotação = 60.000 ms / 6.000 = 10 ms. Latência média = 10/2 = 5 ms. Transferência de 1 setor = 10 ms / 500 = 0,02 ms. Total = 8 + 5 + 0,02 = 13,02 ms.' },
        { texto: '18,02 ms.', correta: false, explicacao: 'Você usou a rotação inteira (10 ms) como latência. A latência média é meia rotação: 5 ms. Total correto: 8 + 5 + 0,02 = 13,02 ms.' },
        { texto: '8,02 ms.', correta: false, explicacao: 'Faltou a latência rotacional (5 ms), a espera para o setor chegar sob o cabeçote. Total: 8 + 5 + 0,02 = 13,02 ms.' },
        { texto: '23 ms.', correta: false, explicacao: 'Você somou seek + latência (meia rotação) + uma rotação inteira de transferência. Ler um setor ocupa só 1/500 da trilha: 10/500 = 0,02 ms. Total 13,02 ms.' },
      ],
    },
    {
      id: 'm09-a03-q6',
      enunciado: 'Qual é a <strong>latência rotacional média</strong> de um disco de <strong>15.000 rpm</strong>?',
      alternativas: [
        { texto: '2 ms.', correta: true, explicacao: 'Correto. 1 rotação = 60.000 ms / 15.000 = 4 ms. Em média o setor está a meia volta de distância: 4 / 2 = 2 ms.' },
        { texto: '4 ms.', correta: false, explicacao: '4 ms é o tempo de uma rotação inteira. A latência média é metade disso: 2 ms.' },
        { texto: '0,25 ms.', correta: false, explicacao: 'Cuidado com as unidades: 15.000 rotações por minuto = 250 por segundo, então 1 rotação = 1/250 s = 4 ms, e a latência média é 2 ms.' },
        { texto: '15 ms.', correta: false, explicacao: 'A rotação em rpm não vira milissegundos diretamente. Faça 60.000 / 15.000 = 4 ms por rotação, e a metade, 2 ms.' },
      ],
    },
    {
      id: 'm09-a03-q7',
      enunciado: 'Qual é o principal problema do algoritmo <strong>SSTF</strong>?',
      alternativas: [
        { texto: 'Pode causar postergação indefinida (starvation) das requisições distantes, nas extremidades do disco.', correta: true, explicacao: 'Correto. Se continuam chegando pedidos perto do braço, os distantes nunca são os mais próximos. É o mesmo problema do SJF no escalonamento de processos.' },
        { texto: 'Desloca o braço mais do que o FCFS.', correta: false, explicacao: 'É o contrário: o SSTF reduz muito o deslocamento (no exemplo do Tanenbaum, 61 contra 111 do FCFS).' },
        { texto: 'Precisa ir sempre até a extremidade do disco antes de inverter.', correta: false, explicacao: 'Isso é o SCAN. O SSTF não tem direção fixa; só escolhe a requisição mais próxima.' },
        { texto: 'Só funciona em discos com entrelaçamento.', correta: false, explicacao: 'Entrelaçamento trata da latência rotacional entre setores; não tem relação com a escolha da ordem das requisições.' },
      ],
    },
    {
      id: 'm09-a03-q8',
      enunciado: 'Qual é o objetivo do <strong>entrelaçamento</strong> (interleaving) de setores?',
      alternativas: [
        { texto: 'Evitar esperar uma rotação inteira entre setores logicamente consecutivos, dando tempo à controladora de copiar o buffer.', correta: true, explicacao: 'Correto. Numerando os setores com espaço entre eles (ex.: 0, 4, 1, 5, 2, 6, 3, 7), o próximo setor lógico chega ao cabeçote quando a controladora já está livre.' },
        { texto: 'Reduzir o tempo de seek entre trilhas distantes.', correta: false, explicacao: 'O seek é reduzido pelos algoritmos de escalonamento do braço. O entrelaçamento ataca a latência rotacional.' },
        { texto: 'Gravar cada dado em dois discos para tolerar falhas.', correta: false, explicacao: 'Isso é espelhamento (RAID 1), assunto da próxima aula.' },
        { texto: 'Aumentar a capacidade do disco colocando mais setores nas trilhas externas.', correta: false, explicacao: 'Isso descreve a gravação em zonas. O entrelaçamento não muda a quantidade de setores, só a numeração.' },
      ],
    },
  ],
  dissertativas: [
    {
      id: 'm09-a03-d1',
      enunciado: 'Quais tempos compõem o acesso a um setor do disco? Explique cada um e diga por que os algoritmos de escalonamento do disco concentram-se em reduzir o seek.',
      respostaModelo: `<p>O tempo de acesso é <strong>t<sub>acesso</sub> = t<sub>seek</sub> + t<sub>latência</sub> + t<sub>transferência</sub></strong>.</p>
<p><strong>Seek (posicionamento):</strong> tempo para mover o braço até o cilindro desejado; inclui acelerar o braço, deslocá-lo e confirmar a trilha. O fabricante informa o seek médio (ex.: 5 a 10 ms). <strong>Latência rotacional:</strong> tempo até o início do setor passar sob o cabeçote; em média meia rotação, 1/(2r) (ex.: 10.000 rpm → 6 ms por rotação → 3 ms). <strong>Transferência:</strong> tempo de ler ou gravar os dados, b/(rN), ou seja, a fração da trilha lida vezes o tempo de uma rotação.</p>
<p>Na maioria dos discos o seek é o maior dos três, e é o único que o SO pode reduzir escolhendo a ordem das requisições. Por isso os algoritmos (SSTF, SCAN, C-SCAN, LOOK, C-LOOK) reordenam a fila para diminuir o deslocamento total do braço. O exemplo dos slides mostra o efeito: 1,3 MB lidos sequencialmente levam 82 ms; lidos setor a setor em posições aleatórias, cerca de 33 s.</p>`,
      pontosChave: [
        'Escreveu a soma seek + latência rotacional + transferência',
        'Explicou o seek como movimento do braço até o cilindro',
        'Explicou a latência como espera pelo setor, em média meia rotação',
        'Explicou a transferência como a leitura efetiva (fração da trilha × tempo de rotação)',
        'Justificou que o seek domina e é o que a ordem de atendimento consegue reduzir',
      ],
    },
    {
      id: 'm09-a03-d2',
      enunciado: 'Disco com cilindros 0 a 99, cabeçote no cilindro 50, movendo-se para cilindros maiores. Fila: 20, 75, 10, 90, 55, 30. Calcule o deslocamento total com FCFS, SSTF, SCAN e C-LOOK (contando o retorno), mostrando a ordem de atendimento.',
      respostaModelo: `<table>
  <tr><th>Algoritmo</th><th>Ordem</th><th>Deslocamentos</th><th>Total</th></tr>
  <tr><td>FCFS</td><td>50 → 20 → 75 → 10 → 90 → 55 → 30</td><td>30 + 55 + 65 + 80 + 35 + 25</td><td><strong>290</strong></td></tr>
  <tr><td>SSTF</td><td>50 → 55 → 75 → 90 → 30 → 20 → 10</td><td>5 + 20 + 15 + 60 + 10 + 10</td><td><strong>120</strong></td></tr>
  <tr><td>SCAN (subindo até 99)</td><td>50 → 55 → 75 → 90 → 99 → 30 → 20 → 10</td><td>49 + 89</td><td><strong>138</strong></td></tr>
  <tr><td>C-LOOK (com retorno)</td><td>50 → 55 → 75 → 90 ⤳ 10 → 20 → 30</td><td>40 + 80 + 20</td><td><strong>140</strong> (60 sem o retorno)</td></tr>
</table>
<p>No SSTF, em 55 a requisição 75 (distância 20) ganha de 30 (distância 25). O SCAN vai até a extremidade 99 antes de inverter; o C-LOOK volta da última requisição (90) direto para a menor (10) e atende subindo.</p>`,
      pontosChave: [
        'FCFS = 290, atendendo na ordem de chegada',
        'SSTF = 120, com a ordem 55, 75, 90, 30, 20, 10',
        'SCAN = 138, indo até o cilindro 99 antes de inverter',
        'C-LOOK = 140 contando o retorno (ou 60 sem ele), atendendo só subindo',
      ],
    },
  ],
});
