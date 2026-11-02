// Funções puras que montam o HTML das telas. O conteúdo das aulas é HTML autoral (confiável).
(function (root) {
  const LETRAS = ['A', 'B', 'C', 'D'];
  const PROVA = '2026-11-07';
  const SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function todasAulas(modulos) {
    return modulos.flatMap((m, mi) => m.aulas.map(a => ({ ...a, moduloId: m.id, moduloTitulo: m.titulo, moduloNum: mi + 1 })));
  }

  function partes(iso) { return iso.split('-').map(Number); }
  function diaUTC(iso) { const [a, m, d] = partes(iso); return Date.UTC(a, m - 1, d) / 86400000; }
  function diasAte(hojeISO, alvoISO) { return diaUTC(alvoISO) - diaUTC(hojeISO); }
  function dataCurta(iso) { const [, m, d] = partes(iso); return `${d}/${m}`; }
  function diaDaSemana(iso) { return new Date(diaUTC(iso) * 86400000).getUTCDay(); }
  function dataExtensa(iso) { const [, m, d] = partes(iso); return `${SEMANA[diaDaSemana(iso)]}, ${d} de ${MESES[m - 1]}`; }
  function somaDias(iso, n) {
    const t = new Date((diaUTC(iso) + n) * 86400000);
    return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
  }

  function contagem(hojeISO, prova = PROVA) {
    const n = diasAte(hojeISO, prova);
    if (n > 1) return `${n} dias para a prova`;
    if (n === 1) return '1 dia para a prova';
    if (n === 0) return 'Hoje é a prova';
    return 'A prova já passou';
  }

  const SVG_CHECK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SVG_PERGUNTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16.9" r="1.1" fill="currentColor"/></svg>';

  function janela(titulo, miolo, classe = '') {
    return `<div class="janela ${classe}"><div class="janela-barra"><span class="bolinhas" aria-hidden="true"><i></i><i></i><i></i></span>
      ${titulo ? `<span class="janela-titulo">${titulo}</span>` : ''}</div>${miolo}</div>`;
  }

  function renderSidebar(modulos, store, aulaAtualId) {
    const aulas = todasAulas(modulos);
    const feitas = aulas.filter(a => store.isComplete(a.id)).length;
    const pct = aulas.length ? Math.round((feitas / aulas.length) * 100) : 0;
    const blocos = modulos.map((m, i) => {
      const itens = m.aulas.map(a => {
        const classes = ['aula-link'];
        if (store.isComplete(a.id)) classes.push('concluida');
        if (a.id === aulaAtualId) classes.push('atual');
        if (!a.publicada) classes.push('breve');
        const marca = store.isComplete(a.id) ? `<span class="marca" aria-label="concluída">${SVG_CHECK}</span>` : '<span class="marca"></span>';
        const breve = a.publicada ? '' : ' <span class="tag-breve">em breve</span>';
        const atual = a.id === aulaAtualId ? ' aria-current="page"' : '';
        return `<li><a class="${classes.join(' ')}" href="#/aula/${a.id}"${atual}>${marca}<span>${esc(a.titulo)}${breve}</span></a></li>`;
      }).join('');
      return `<section class="modulo"><h3>Módulo ${i + 1}: ${esc(m.titulo)}</h3><ul>${itens}</ul></section>`;
    }).join('');
    return `<div class="trilha-cabeca">
        <span class="trilha-icone" aria-hidden="true">SO</span>
        <div><strong>Sistemas Operacionais 1</strong><span>${feitas} de ${aulas.length} aulas (${pct}%)</span></div>
      </div>
      <div class="barra" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Aulas concluídas"><span style="width:${pct}%"></span></div>
      ${blocos}`;
  }

  // Trecho curto da aula para a janela do início: o primeiro bloco de código ou, sem ele, a analogia.
  function trechoDaAula(aula) {
    if (!aula || !aula.corpo) return '';
    const codigo = aula.corpo.match(/<pre class="codigo"><code>([\s\S]*?)<\/code><\/pre>/);
    if (codigo) {
      const linhas = codigo[1].replace(/<[^>]+>/g, '').split('\n').slice(0, 9).join('\n');
      return janela('Trecho da aula', `<pre class="janela-codigo"><code>${linhas}</code></pre>`, 'janela-trecho');
    }
    const analogia = aula.corpo.match(/<div class="analogia">\s*(<p>[\s\S]*?<\/p>)/);
    if (analogia) {
      return janela('Analogia da aula', `<div class="janela-texto">${analogia[1].replace(/<(?!\/?(strong|em|p)\b)[^>]+>/g, '')}</div>`, 'janela-trecho');
    }
    return '';
  }

  // prova = null: versão sem data de prova (sem contagem regressiva e sem plano de estudo).
  function renderHome(modulos, plano, store, hojeISO, lessonLookup = () => undefined, prova = PROVA) {
    const aulas = todasAulas(modulos);
    const porId = Object.fromEntries(aulas.map(a => [a.id, a]));
    const publicadas = aulas.filter(a => a.publicada);
    const feitas = aulas.filter(a => store.isComplete(a.id)).length;
    const pct = aulas.length ? Math.round((feitas / aulas.length) * 100) : 0;
    const proxima = publicadas.find(a => !store.isComplete(a.id));

    let destaque;
    if (proxima) {
      const aula = lessonLookup(proxima.id);
      const posicao = aulas.findIndex(a => a.id === proxima.id) + 1;
      const doModulo = aulas.filter(a => a.moduloId === proxima.moduloId);
      const feitasModulo = doModulo.filter(a => store.isComplete(a.id)).length;
      const deProva = aula && aula.questoes ? aula.questoes.filter(q => q.origem).length + (aula.dissertativas || []).filter(d => d.origem).length : 0;
      const trecho = trechoDaAula(aula);
      destaque = `<article class="destaque${trecho ? '' : ' sem-trecho'}">
        <div class="destaque-info">
          <p class="etiquetas"><span class="etiqueta">Módulo ${proxima.moduloNum}</span><span class="etiqueta">Aula ${posicao} de ${aulas.length}</span>
            ${deProva ? `<span class="etiqueta prova">${deProva} ${deProva === 1 ? 'questão' : 'questões'} de prova</span>` : ''}</p>
          <h3><a href="#/aula/${proxima.id}">${esc(proxima.titulo)}</a></h3>
          ${aula && aula.resumo ? `<p class="destaque-resumo">${aula.resumo}</p>` : ''}
          <div class="destaque-rodape">
            <p><strong>${feitasModulo} de ${doModulo.length}</strong> aulas de ${esc(proxima.moduloTitulo)}</p>
            <a class="botao" href="#/aula/${proxima.id}">${feitasModulo || store.isComplete(proxima.id) ? 'Continuar' : 'Começar'} aula</a>
          </div>
        </div>
        ${trecho ? `<div class="destaque-janela">${trecho}</div>` : ''}
      </article>`;
    } else {
      destaque = `<article class="destaque sem-trecho"><div class="destaque-info">
        <h3>Todas as aulas disponíveis foram concluídas</h3>
        <p class="destaque-resumo">${prova ? 'Use os dias que faltam para refazer' : 'Agora é hora de refazer'} as questões que você errou e reler as aulas marcadas.</p>
        <div class="destaque-rodape"><span></span><a class="botao" href="#/revisar">Abrir Revisar</a></div>
      </div></article>`;
    }

    const dias = plano.dias.map(d => {
      const hoje = d.data === hojeISO;
      const rotulo = `<span class="dia-data"><strong>${dataCurta(d.data)}</strong>${hoje ? '<small>hoje</small>' : ''}</span>`;
      if (d.revisao) {
        return `<li class="dia revisao${hoje ? ' hoje' : ''}">${rotulo}<span class="dia-aulas">Revisão geral: refaça as questões erradas em <a href="#/revisar">Revisar</a>.</span></li>`;
      }
      const lista = d.aulas.map(id => {
        const a = porId[id];
        if (!a) return '';
        const breve = a.publicada ? '' : ' <span class="tag-breve">em breve</span>';
        const feita = store.isComplete(id) ? ' class="feita"' : '';
        return `<li${feita}><a href="#/aula/${id}">${esc(a.titulo)}</a>${breve}</li>`;
      }).join('');
      return `<li class="dia${hoje ? ' hoje' : ''}">${rotulo}<ul class="dia-aulas">${lista}</ul></li>`;
    }).join('');

    const mods = modulos.map((m, i) => {
      const feitasM = m.aulas.filter(a => store.isComplete(a.id)).length;
      const pctM = m.aulas.length ? Math.round((feitasM / m.aulas.length) * 100) : 0;
      const alvo = m.aulas.find(a => a.publicada && !store.isComplete(a.id)) || m.aulas[0];
      return `<li><a class="cartao-modulo" href="#/aula/${alvo.id}">
        <span class="num" aria-hidden="true">${i + 1}</span>
        <span class="cm-texto"><strong>${esc(m.titulo)}</strong><small>${feitasM} de ${m.aulas.length} aulas</small></span>
        <span class="barra" aria-hidden="true"><span style="width:${pctM}%"></span></span>
      </a></li>`;
    }).join('');

    const faltam = prova ? diasAte(hojeISO, prova) : -1;
    const quadros = [];
    for (let i = 0; prova && i <= Math.min(Math.max(faltam, 0), 13); i++) {
      const iso = somaDias(hojeISO, i);
      const classe = iso === prova ? 'prova' : i === 0 ? 'hoje' : '';
      quadros.push(`<li class="${classe}" title="${dataExtensa(iso)}"><span>${SEMANA[diaDaSemana(iso)][0].toUpperCase()}</span><small>${partes(iso)[2]}</small></li>`);
    }
    const erradas = store.getWrong().length;
    const marcadas = store.getReviewLessons().length;

    return `<div class="home">
      <div class="home-principal">
        <header class="secao-cabeca"><h2>Próxima aula</h2><p>${dataExtensa(hojeISO)}</p></header>
        ${prova && plano.mensagem ? `<p class="aviso">${esc(plano.mensagem)}</p>` : ''}
        ${destaque}
        ${prova ? `<header class="secao-cabeca"><h2>Plano de estudo</h2><p>Cada aula termina com questões para treinar.</p></header>
        <ol class="plano">${dias}</ol>` : ''}
        <header class="secao-cabeca"><h2>Módulos</h2></header>
        <ol class="lista-modulos">${mods}</ol>
      </div>
      <aside class="home-lateral">
        ${prova ? `<section class="painel contagem">
          <p class="contagem-numero">${faltam > 0 ? `<strong>${faltam} ${faltam === 1 ? 'dia' : 'dias'}</strong>` : `<strong>${faltam === 0 ? 'Hoje' : 'Prova feita'}</strong>`}</p>
          <p class="contagem-legenda">${faltam > 0 ? `para a prova (${dataExtensa(prova)})` : contagem(hojeISO, prova)}</p>
          ${quadros.length ? `<ol class="calendario" aria-label="Dias até a prova">${quadros.join('')}</ol>` : ''}
        </section>` : ''}
        <section class="painel">
          <h2>Seu progresso</h2>
          <p class="painel-numero"><strong>${feitas}</strong> de ${aulas.length} aulas concluídas</p>
          <span class="barra"><span style="width:${pct}%"></span></span>
        </section>
        <section class="painel">
          <h2>Revisar</h2>
          <p>${erradas ? `<strong>${erradas}</strong> ${erradas === 1 ? 'questão errada' : 'questões erradas'} para refazer.` : 'Nenhuma questão errada por enquanto.'}
            ${marcadas ? ` <strong>${marcadas}</strong> ${marcadas === 1 ? 'aula' : 'aulas'} para reler.` : ''}</p>
          <a class="link-forte" href="#/revisar">Abrir Revisar</a>
        </section>
      </aside>
    </div>`;
  }

  function renderLesson(aula, entrada, vizinhas) {
    if (!entrada && !aula) {
      return `<article class="pagina vazio"><h1>Aula não encontrada</h1>
        <p>O endereço não corresponde a nenhuma aula. <a href="#/">Voltar ao início</a>.</p></article>`;
    }
    const navAulas = `<nav class="nav-aulas" aria-label="Outras aulas">
      ${vizinhas.anterior ? `<a class="anterior" href="#/aula/${vizinhas.anterior.id}"><small>Aula anterior</small><span>${esc(vizinhas.anterior.titulo || '')}</span></a>` : '<span></span>'}
      ${vizinhas.proxima ? `<a class="proxima" href="#/aula/${vizinhas.proxima.id}"><small>Próxima aula</small><span>${esc(vizinhas.proxima.titulo || '')}</span></a>` : '<span></span>'}
    </nav>`;
    if (!aula) {
      return `<article class="pagina vazio"><h1>${esc(entrada.titulo)}</h1>
        <p>Esta aula ainda está sendo preparada (em breve). Enquanto isso, continue pelas aulas já disponíveis.</p>
        <p><a href="#/">Voltar ao início</a></p>${navAulas}</article>`;
    }
    const temQuiz = aula.questoes && aula.questoes.length;
    const temDiss = aula.dissertativas && aula.dissertativas.length;
    return `<article class="pagina aula">
      <nav class="migalha" aria-label="Você está em"><a href="#/">${esc(entrada.moduloTitulo || 'Início')}</a><span aria-hidden="true">/</span><span>${esc(aula.titulo)}</span></nav>
      <h1>${esc(aula.titulo)}</h1>
      <div class="corpo">${aula.corpo}</div>
      <section class="resumo"><h2>Resumo</h2><p>${aula.resumo}</p></section>
      ${temQuiz ? '<section class="pratica" id="quiz" aria-label="Questões de prática"></section>' : ''}
      ${temDiss ? `<section class="dissertativas"><h2>Responda por escrito</h2>
        <p class="secao-nota">Escreva como faria na prova e depois compare com a resposta-modelo.</p>
        ${aula.dissertativas.map(renderDissertativa).join('')}</section>` : ''}
      ${aula.fontes && aula.fontes.length ? `<details class="fontes"><summary>Fontes desta aula</summary><ul>${aula.fontes.map(f => `<li>${esc(f)}</li>`).join('')}</ul></details>` : ''}
      ${navAulas}
    </article>`;
  }

  function cabecaPratica(indice, total) {
    return `<header class="pratica-topo">
        <span class="pratica-icone">${SVG_PERGUNTA}</span>
        <div><h2>Pratique o que aprendeu</h2><p>${total} questões. Acerte pelo menos 4 para concluir a aula.</p></div>
        <span class="contador">${Math.min(indice + 1, total)}/${total}</span>
      </header>`;
  }

  function renderQuestion(q, indice, total, resultados = []) {
    const segmentos = Array.from({ length: total }, (_, i) => {
      const r = resultados[i];
      const classe = r ? (r.acertou ? 'certo' : 'errado') : i === indice ? 'agora' : '';
      return `<span class="${classe}"></span>`;
    }).join('');
    const alts = q.alternativas.map((a, i) =>
      `<button type="button" class="alt" data-alt="${i}" aria-pressed="false"><span class="letra">${LETRAS[i]}</span><span class="alt-texto">${a.texto}</span></button>`).join('');
    return `${cabecaPratica(indice, total)}
      <div class="segmentos" aria-hidden="true">${segmentos}</div>
      <div class="questao"><p class="enunciado"><span class="n">${indice + 1}</span><span>${q.enunciado}</span></p>
      ${q.origem ? `<p class="origem">Questão de prova: ${esc(q.origem)}</p>` : ''}
      <div class="alts" role="group" aria-label="Alternativas">${alts}</div>
      <div class="feedback" aria-live="polite"></div>
      <footer class="pratica-rodape"><p class="dica">Selecione uma alternativa e verifique.</p>
        <button type="button" class="botao verificar" disabled>Verificar resposta</button></footer></div>`;
  }

  function renderFeedback(q, escolhidaIdx) {
    const escolhida = q.alternativas[escolhidaIdx];
    const certaIdx = q.alternativas.findIndex(a => a.correta);
    if (escolhida.correta) {
      const jaDiz = /^\s*Correto\b/.test(escolhida.explicacao.replace(/<[^>]+>/g, ''));
      return `<div class="fb certo">${jaDiz ? '' : '<strong>Correto!</strong> '}${escolhida.explicacao}</div>`;
    }
    return `<div class="fb errado"><strong>Não é essa.</strong> ${escolhida.explicacao}</div>
      <div class="fb certo"><strong>Resposta: ${LETRAS[certaIdx]}.</strong> ${q.alternativas[certaIdx].explicacao}</div>`;
  }

  function renderResult(r, jaConcluida, resultados = []) {
    const segmentos = resultados.map(x => `<span class="${x.acertou ? 'certo' : 'errado'}"></span>`).join('');
    let msg;
    if (r.aprovado) msg = jaConcluida ? 'Você acertou de novo. A aula continua concluída.' : 'Aula concluída. As questões que você errou foram para Revisar.';
    else if (jaConcluida) msg = 'A aula continua concluída. Releia os pontos que errou: essas questões foram para Revisar.';
    else msg = 'Faltou pouco: são necessários 4 acertos. Releia os pontos que errou e tente de novo.';
    return `${cabecaPratica(r.total, r.total)}
      ${segmentos ? `<div class="segmentos" aria-hidden="true">${segmentos}</div>` : ''}
      <div class="resultado ${r.aprovado ? 'aprovado' : ''}">
        <p class="resultado-numero"><strong>${r.acertos}</strong> de ${r.total} acertos</p>
        <p>${msg}</p>
        <button type="button" class="botao secundario refazer">Tentar de novo</button>
      </div>`;
  }

  function renderDissertativa(d) {
    const pontos = d.pontosChave.map((p, i) =>
      `<label><input type="checkbox" data-ponto="${i}"><span>${p}</span></label>`).join('');
    return `<div class="dissertativa" data-id="${d.id}">
      <p class="enunciado">${d.enunciado}</p>
      ${d.origem ? `<p class="origem">Questão de prova: ${esc(d.origem)}</p>` : ''}
      <textarea rows="5" aria-label="Sua resposta" placeholder="Escreva sua resposta antes de ver a resposta-modelo."></textarea>
      <button type="button" class="botao secundario ver-modelo">Ver resposta-modelo</button>
      <div class="modelo" hidden>
        <div class="resposta-modelo"><p class="rotulo-modelo">Resposta-modelo</p>${d.respostaModelo}</div>
        <p class="checklist-titulo">Marque o que você citou:</p>
        <div class="checklist">${pontos}</div>
        <button type="button" class="botao conferir">Conferir</button>
        <p class="resultado-check" aria-live="polite"></p>
      </div>
    </div>`;
  }

  function renderReview(modulos, store, lessonLookup) {
    const aulas = todasAulas(modulos);
    const porId = Object.fromEntries(aulas.map(a => [a.id, a]));
    const marcadas = store.getReviewLessons();
    const erradas = store.getWrong();
    if (!marcadas.length && !erradas.length) {
      return `<article class="pagina vazio"><h1>Revisar</h1>
        <p>Nada para revisar ainda. Questões que você errar e aulas em que a resposta escrita ficou incompleta aparecem aqui.</p>
        <p><a class="botao" href="#/">Voltar ao início</a></p></article>`;
    }
    const listaMarcadas = marcadas.map(id =>
      `<li><a href="#/aula/${id}">${esc((porId[id] || {}).titulo || id)}</a></li>`).join('');
    const grupos = {};
    for (const e of erradas) (grupos[e.aulaId] = grupos[e.aulaId] || []).push(e.questaoId);
    const listaErradas = Object.entries(grupos).map(([aulaId, ids]) => {
      const aula = lessonLookup(aulaId);
      const qs = ids.map(id => {
        const q = aula && aula.questoes.find(x => x.id === id);
        return q ? `<li>${q.enunciado}</li>` : '';
      }).join('');
      return `<li class="grupo-revisao"><div class="grupo-cabeca"><a href="#/aula/${aulaId}">${esc((porId[aulaId] || {}).titulo || aulaId)}</a>
        <span class="etiqueta">${ids.length} ${ids.length === 1 ? 'questão' : 'questões'}</span></div><ul>${qs}</ul></li>`;
    }).join('');
    return `<article class="pagina revisar"><h1>Revisar</h1>
      ${marcadas.length ? `<h2>Aulas para reler</h2><p class="secao-nota">A resposta escrita ficou incompleta nestas aulas.</p><ul class="lista-reler">${listaMarcadas}</ul>` : ''}
      ${erradas.length ? `<h2>Questões que você errou</h2><p class="secao-nota">Refaça o quiz da aula: as questões erradas aparecem primeiro e, ao acertar, saem desta lista.</p><ul class="lista-erradas">${listaErradas}</ul>` : ''}
    </article>`;
  }

  const api = { renderSidebar, renderHome, renderLesson, renderQuestion, renderFeedback, renderResult, renderDissertativa, renderReview, contagem };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.SO1 = root.SO1 || {}).render = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
