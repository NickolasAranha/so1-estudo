// Liga a interface: carrega as aulas publicadas, roteia por hash e trata o quiz e as dissertativas.
(function () {
  const SO1 = window.SO1;
  const { render, quiz } = SO1;
  let storage = null;
  try { storage = window.localStorage; } catch (e) { storage = null; }
  const store = SO1.progress.createStore(storage);

  const $ = sel => document.querySelector(sel);
  const elConteudo = $('#conteudo');
  const elSidebar = $('#sidebar');
  const falharam = new Set();
  // Data da prova vem da <meta name="so1-prova">; sem ela, não há contagem regressiva nem plano de estudo.
  const PROVA = ($('meta[name="so1-prova"]') || {}).content || null;

  function hojeISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Módulos como a interface os enxerga: uma aula só conta como publicada se o arquivo carregou.
  function modulosVisiveis() {
    return SO1.getModules().map(m => ({
      ...m,
      aulas: m.aulas.map(a => ({ ...a, publicada: a.publicada && !falharam.has(a.id) && !!SO1.getLesson(a.id) })),
    }));
  }

  function carregarConteudo() {
    const pendentes = SO1.lessonIndex().filter(a => a.publicada);
    return Promise.all(pendentes.map(a => new Promise(resolve => {
      const s = document.createElement('script');
      s.src = a.arquivo;
      s.onload = () => resolve();
      s.onerror = () => { falharam.add(a.id); resolve(); };
      document.body.appendChild(s);
    })));
  }

  function rota() {
    const h = location.hash.replace(/^#\/?/, '');
    if (h.startsWith('aula/')) return { tipo: 'aula', id: h.slice(5) };
    if (h === 'revisar') return { tipo: 'revisar' };
    return { tipo: 'home' };
  }

  function mostrar() {
    const r = rota();
    const modulos = modulosVisiveis();
    elSidebar.innerHTML = render.renderSidebar(modulos, store, r.id);
    fecharMenu();
    document.querySelectorAll('.menu-topo a').forEach(a => {
      if (a.dataset.rota === r.tipo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const elContagem = $('#contagem-topo');
    if (PROVA) {
      const texto = render.contagem(hojeISO(), PROVA);
      elContagem.innerHTML = `<span class="longo">${texto}</span><span class="curto">${texto.replace(' para a prova', '')}</span>`;
    } else if (elContagem) elContagem.remove();

    if (r.tipo === 'aula') {
      const indice = SO1.lessonIndex();
      const pos = indice.findIndex(a => a.id === r.id);
      const entrada = pos >= 0 ? { ...indice[pos], publicada: modulos.flatMap(m => m.aulas)[pos].publicada } : undefined;
      const aula = entrada && entrada.publicada ? SO1.getLesson(r.id) : undefined;
      elConteudo.innerHTML = render.renderLesson(aula, entrada, {
        anterior: pos > 0 ? indice[pos - 1] : undefined,
        proxima: pos >= 0 && pos < indice.length - 1 ? indice[pos + 1] : undefined,
      });
      if (aula) {
        document.title = `${aula.titulo} · SO1`;
        rotularTabelas(elConteudo);
        janelasMac(elConteudo.querySelector('.corpo'));
        if (aula.questoes.length) iniciarQuiz(aula);
        ligarDissertativas(aula);
      }
    } else if (r.tipo === 'revisar') {
      document.title = 'Revisar · SO1';
      elConteudo.innerHTML = render.renderReview(modulos, store, id => SO1.getLesson(id));
    } else {
      document.title = 'SO1 · Estudo';
      const aulas = modulos.flatMap(m => m.aulas);
      const concluidas = new Set(aulas.filter(a => store.isComplete(a.id)).map(a => a.id));
      const plano = PROVA ? SO1.plan.buildStudyPlan(aulas, concluidas, hojeISO(), PROVA) : { dias: [] };
      elConteudo.innerHTML = render.renderHome(modulos, plano, store, hojeISO(), id => SO1.getLesson(id), PROVA);
      janelasMac(elConteudo);
    }
    window.scrollTo(0, 0);
    const atual = elSidebar.querySelector('.atual');
    if (atual) atual.scrollIntoView({ block: 'nearest' });
  }

  // Blocos de código e exemplos passo a passo ganham a moldura de janela (três bolinhas e título).
  function barraJanela(titulo) {
    const barra = document.createElement('div');
    barra.className = 'janela-barra';
    barra.innerHTML = '<span class="bolinhas" aria-hidden="true"><i></i><i></i><i></i></span>';
    if (titulo) {
      const t = document.createElement('span');
      t.className = 'janela-titulo';
      t.textContent = titulo;
      barra.appendChild(t);
    }
    return barra;
  }

  function janelasMac(raiz) {
    if (!raiz) return;
    raiz.querySelectorAll('pre.codigo').forEach(pre => {
      if (pre.parentElement.classList.contains('janela')) return;
      const caixa = document.createElement('div');
      caixa.className = 'janela janela-codigo-caixa';
      pre.replaceWith(caixa);
      caixa.append(barraJanela(''), pre);
    });
    raiz.querySelectorAll('.exemplo').forEach(ex => {
      if (ex.classList.contains('janela')) return;
      let titulo = 'Exemplo passo a passo';
      const p = ex.firstElementChild;
      const forte = p && p.tagName === 'P' && p.firstElementChild && p.firstElementChild.tagName === 'STRONG' &&
        p.firstChild === p.firstElementChild ? p.firstElementChild : null;
      if (forte) {
        titulo = forte.textContent.trim().replace(/[.:]$/, '');
        forte.remove();
        if (!p.textContent.trim()) p.remove();
        else if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, '');
      }
      const miolo = document.createElement('div');
      miolo.className = 'janela-miolo';
      while (ex.firstChild) miolo.appendChild(ex.firstChild);
      ex.classList.add('janela');
      ex.append(barraJanela(titulo), miolo);
    });
  }

  // Cada tabela ganha uma moldura com rolagem lateral. No celular, tabelas de 3+ colunas viram
  // cartões: cada célula recebe o nome da sua coluna.
  function rotularTabelas(raiz) {
    raiz.querySelectorAll('.corpo table').forEach(tabela => {
      if (!tabela.parentElement.classList.contains('tabela')) {
        const moldura = document.createElement('div');
        moldura.className = 'tabela';
        tabela.replaceWith(moldura);
        moldura.appendChild(tabela);
      }
      const linhas = [...tabela.rows];
      if (!linhas.length) return;
      const titulos = [...linhas[0].cells].map(c => c.textContent.trim());
      if (titulos.length < 3 || linhas[0].cells[0].tagName !== 'TH') return;
      tabela.classList.add('empilhavel');
      linhas[0].classList.add('cabecalho');
      linhas.slice(1).forEach(tr => [...tr.cells].forEach((td, i) => td.setAttribute('data-rotulo', titulos[i] || '')));
    });
  }

  function iniciarQuiz(aula) {
    const caixa = $('#quiz');
    const erradas = store.getWrong().filter(e => e.aulaId === aula.id).map(e => e.questaoId);
    const questoes = quiz.pickQuestions(aula.questoes, 5, Math.random, erradas);
    const resultados = [];
    let i = 0;

    // Fluxo: escolher uma alternativa (pode trocar), verificar, ler a explicação e seguir.
    function proxima(focar) {
      if (i >= questoes.length) return finalizar();
      const q = questoes[i];
      let escolhida = -1;
      caixa.innerHTML = render.renderQuestion(q, i, questoes.length, resultados);
      const botoes = [...caixa.querySelectorAll('.alt')];
      const verificar = caixa.querySelector('.verificar');
      const dica = caixa.querySelector('.dica');
      const escolher = idx => {
        escolhida = idx;
        botoes.forEach((b, j) => {
          b.classList.toggle('escolhida', j === idx);
          b.setAttribute('aria-pressed', String(j === idx));
        });
        verificar.disabled = false;
        dica.textContent = 'Confira sua escolha e verifique.';
      };
      botoes.forEach((b, j) => b.addEventListener('click', () => escolher(j)));
      verificar.addEventListener('click', () => {
        if (verificar.dataset.etapa === 'seguir') { i++; proxima(true); return; }
        if (escolhida < 0) return;
        responder(q, escolhida, botoes, verificar, dica);
      });
      caixa.onkeydown = e => {
        if (verificar.dataset.etapa === 'seguir' || e.target.tagName === 'TEXTAREA') return;
        const k = 'abcd'.indexOf(e.key.toLowerCase()) >= 0 ? 'abcd'.indexOf(e.key.toLowerCase()) : '1234'.indexOf(e.key);
        if (k >= 0 && k < botoes.length) { escolher(k); botoes[k].focus(); }
      };
      if (focar) caixa.querySelector('.enunciado').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function responder(q, idx, botoes, verificar, dica) {
      const acertou = q.alternativas[idx].correta;
      resultados.push({ questaoId: q.id, acertou });
      if (acertou) store.clearWrong(q.id); else store.recordWrong(q.id, aula.id);
      botoes.forEach((btn, j) => {
        btn.disabled = true;
        if (q.alternativas[j].correta) btn.classList.add('certa');
        else if (j === idx) btn.classList.add('errada');
      });
      const seg = caixa.querySelectorAll('.segmentos span')[i];
      if (seg) seg.className = acertou ? 'certo' : 'errado';
      const fb = caixa.querySelector('.feedback');
      fb.innerHTML = render.renderFeedback(q, idx);
      janelasMac(fb);
      dica.textContent = acertou ? 'Você acertou.' : 'Leia a explicação antes de seguir.';
      verificar.dataset.etapa = 'seguir';
      verificar.textContent = i + 1 < questoes.length ? 'Próxima questão' : 'Ver resultado';
      verificar.focus();
    }

    function finalizar() {
      const r = quiz.gradeAttempt(resultados);
      const jaConcluida = store.isComplete(aula.id);
      if (r.aprovado) store.markComplete(aula.id);
      caixa.innerHTML = render.renderResult(r, jaConcluida, resultados);
      caixa.querySelector('.refazer').addEventListener('click', () => iniciarQuiz(aula));
      elSidebar.innerHTML = render.renderSidebar(modulosVisiveis(), store, aula.id);
    }

    proxima(false);
  }

  function ligarDissertativas(aula) {
    const resultados = {};
    document.querySelectorAll('.dissertativa').forEach(caixa => {
      const modelo = caixa.querySelector('.modelo');
      caixa.querySelector('.ver-modelo').addEventListener('click', e => {
        modelo.hidden = false;
        e.currentTarget.hidden = true;
      });
      caixa.querySelector('.conferir').addEventListener('click', () => {
        const marcas = caixa.querySelectorAll('input[type="checkbox"]');
        const marcados = [...marcas].filter(c => c.checked).length;
        const r = quiz.checklistResult(marcados, marcas.length);
        resultados[caixa.dataset.id] = r.revisar;
        const acao = quiz.reviewAction(resultados, aula.dissertativas.length);
        if (acao === 'marcar') store.flagReview(aula.id);
        else if (acao === 'desmarcar') store.unflagReview(aula.id);
        caixa.querySelector('.resultado-check').textContent = r.revisar
          ? `Você citou ${marcados} de ${marcas.length} pontos. A aula foi para a lista Revisar.`
          : `Você citou ${marcados} de ${marcas.length} pontos. Boa resposta!`;
      });
    });
  }

  // Tema
  function temaAtual() {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr === 'dark' ? 'escuro' : 'claro';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  }
  document.querySelectorAll('.alternar-tema').forEach(b => b.addEventListener('click', () => {
    const novo = temaAtual() === 'escuro' ? 'claro' : 'escuro';
    document.documentElement.setAttribute('data-theme', novo === 'escuro' ? 'dark' : 'light');
    store.setTheme(novo);
  }));

  // Menu no celular
  const botaoMenu = $('.abrir-menu');
  const veu = $('.veu');
  function fecharMenu() {
    elSidebar.classList.remove('aberta');
    veu.hidden = true;
    botaoMenu.setAttribute('aria-expanded', 'false');
  }
  botaoMenu.addEventListener('click', () => {
    elSidebar.classList.add('aberta');
    veu.hidden = false;
    botaoMenu.setAttribute('aria-expanded', 'true');
    const alvo = elSidebar.querySelector('.atual') || elSidebar.querySelector('a');
    if (alvo) alvo.focus();
  });
  veu.addEventListener('click', fecharMenu);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && elSidebar.classList.contains('aberta')) { fecharMenu(); botaoMenu.focus(); }
  });

  function conferirStorage() {
    if (!store.persistente) $('.aviso-storage').hidden = false;
  }
  conferirStorage();
  document.addEventListener('click', () => setTimeout(conferirStorage, 0));
  window.addEventListener('hashchange', mostrar);
  carregarConteudo().then(mostrar);
})();
