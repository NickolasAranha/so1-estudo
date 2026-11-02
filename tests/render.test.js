const test = require('node:test');
const assert = require('node:assert/strict');
const render = require('../js/ui/render.js');
const { createStore } = require('../js/core/progress.js');

const modulos = [
  { id: 'm01', titulo: 'Introdução', aulas: [
    { id: 'm01-a01', titulo: 'O que é', publicada: true },
    { id: 'm01-a02', titulo: 'Histórico', publicada: true },
    { id: 'm01-a03', titulo: 'Discos', publicada: false },
  ] },
];

function questao() {
  return {
    id: 'm01-a01-q1',
    enunciado: 'Para onde vai o processo?',
    alternativas: [
      { texto: 'Apto', correta: true, explicacao: 'EXPLICA-CERTA: volta para a fila.' },
      { texto: 'Executando', correta: false, explicacao: 'EXPLICA-ERRADA: não vai direto.' },
      { texto: 'Finalizado', correta: false, explicacao: 'EXPLICA-F: ainda não terminou nada.' },
      { texto: 'Criado', correta: false, explicacao: 'EXPLICA-C: já foi criado antes.' },
    ],
  };
}

test('renderLesson sem aula e sem entrada mostra "Aula não encontrada" com link para o início', () => {
  const html = render.renderLesson(undefined, undefined, {});
  assert.match(html, /Aula não encontrada/);
  assert.match(html, /href="#\/"/);
});

test('renderLesson de aula não publicada mostra "em breve"', () => {
  const html = render.renderLesson(undefined, { publicada: false, titulo: 'Discos' }, {});
  assert.match(html, /em breve/);
  assert.match(html, /Discos/);
});

test('renderLesson mostra corpo, resumo e navegação', () => {
  const aula = { id: 'm01-a02', titulo: 'Histórico', corpo: '<p>CORPO-AQUI</p>', resumo: 'RESUMO-AQUI',
    questoes: [], dissertativas: [] };
  const entrada = { id: 'm01-a02', titulo: 'Histórico', moduloTitulo: 'Introdução', publicada: true };
  const html = render.renderLesson(aula, entrada, { anterior: { id: 'm01-a01' }, proxima: { id: 'm01-a03' } });
  assert.match(html, /CORPO-AQUI/);
  assert.match(html, /class="resumo"[^>]*>[\s\S]*RESUMO-AQUI/);
  assert.match(html, /href="#\/aula\/m01-a01"/);
  assert.match(html, /href="#\/aula\/m01-a03"/);
  assert.match(html, /Introdução/);
});

test('renderSidebar conta concluídas e marca só uma', () => {
  const store = createStore(null);
  store.markComplete('m01-a01');
  const html = render.renderSidebar(modulos, store, 'm01-a02');
  assert.match(html, /1 de 3/);
  assert.equal((html.match(/class="aula-link concluida/g) || []).length, 1);
  assert.match(html, /em breve/);
  assert.match(html, /aula-link[^"]*atual/);
});

test('renderQuestion mostra contador e 4 alternativas com letras', () => {
  const html = render.renderQuestion(questao(), 0, 5);
  assert.match(html, /1\/5/);
  assert.equal((html.match(/data-alt="/g) || []).length, 4);
  assert.match(html, />D</);
});

test('renderFeedback de escolha errada mostra a explicação da escolhida e da correta', () => {
  const html = render.renderFeedback(questao(), 1);
  assert.match(html, /EXPLICA-ERRADA/);
  assert.match(html, /EXPLICA-CERTA/);
});

test('renderFeedback de escolha certa mostra a explicação da correta', () => {
  const html = render.renderFeedback(questao(), 0);
  assert.match(html, /EXPLICA-CERTA/);
  assert.doesNotMatch(html, /EXPLICA-ERRADA/);
});

test('renderDissertativa tem área de resposta, botão e checklist', () => {
  const html = render.renderDissertativa({ id: 'm01-a01-d1', enunciado: 'Defina SO', respostaModelo: '<p>MODELO</p>',
    pontosChave: ['P1', 'P2', 'P3'] });
  assert.match(html, /<textarea/);
  assert.match(html, /Ver resposta-modelo/);
  assert.equal((html.match(/type="checkbox"/g) || []).length, 3);
});

test('renderReview vazio mostra "Nada para revisar"', () => {
  const html = render.renderReview(modulos, createStore(null), () => undefined);
  assert.match(html, /Nada para revisar/);
});

test('renderReview lista aula marcada e questão errada', () => {
  const store = createStore(null);
  store.flagReview('m01-a02');
  store.recordWrong('m01-a01-q1', 'm01-a01');
  const lookup = id => (id === 'm01-a01' ? { id, titulo: 'O que é', questoes: [questao()] } : { id, titulo: 'Histórico', questoes: [] });
  const html = render.renderReview(modulos, store, lookup);
  assert.match(html, /Histórico/);
  assert.match(html, /Para onde vai o processo\?/);
});

test('renderHome mostra plano e mensagem', () => {
  const html = render.renderHome(modulos, { dias: [{ data: '2026-10-27', aulas: ['m01-a01', 'm01-a03'] },
    { data: '2026-11-06', aulas: [], revisao: true }] }, createStore(null), '2026-10-27');
  assert.match(html, /27\/10/);
  assert.match(html, /Revisão geral/);
  assert.match(html, /em breve/);
  assert.match(html, /11 dias/);
});

test('renderQuestion tem botão "Verificar resposta" desabilitado até escolher', () => {
  const html = render.renderQuestion(questao(), 1, 5);
  assert.match(html, /<button[^>]*class="botao verificar"[^>]*disabled/);
  assert.match(html, /Verificar resposta/);
  assert.equal((html.match(/aria-pressed="false"/g) || []).length, 4);
});

test('contagem regressiva usa singular, plural, dia da prova e depois da prova', () => {
  assert.equal(render.contagem('2026-10-27'), '11 dias para a prova');
  assert.equal(render.contagem('2026-11-06'), '1 dia para a prova');
  assert.equal(render.contagem('2026-11-07'), 'Hoje é a prova');
  assert.equal(render.contagem('2026-11-09'), 'A prova já passou');
});

test('renderHome destaca a próxima aula não concluída com um trecho da aula', () => {
  const store = createStore(null);
  store.markComplete('m01-a01');
  const lookup = id => (id === 'm01-a02'
    ? { id, titulo: 'Histórico', resumo: 'RESUMO-HIST', corpo: '<p>x</p><pre class="codigo"><code>TRECHO &lt;b&gt;</code></pre>' }
    : undefined);
  const html = render.renderHome(modulos, { dias: [] }, store, '2026-10-27', lookup);
  assert.match(html, /Próxima aula/);
  assert.match(html, /href="#\/aula\/m01-a02"/);
  assert.match(html, /RESUMO-HIST/);
  assert.match(html, /TRECHO &lt;b&gt;/);
});

test('renderHome sem nada pendente parabeniza e manda para Revisar', () => {
  const store = createStore(null);
  ['m01-a01', 'm01-a02'].forEach(id => store.markComplete(id));
  const html = render.renderHome(modulos, { dias: [] }, store, '2026-10-27', () => undefined);
  assert.match(html, /Todas as aulas disponíveis foram concluídas/);
  assert.match(html, /href="#\/revisar"/);
});

test('renderHome sem data de prova não mostra contagem nem plano', () => {
  const html = render.renderHome(modulos, { dias: [{ data: '2026-10-27', aulas: ['m01-a01'] }] }, createStore(null), '2026-10-27',
    () => undefined, null);
  assert.doesNotMatch(html, /para a prova|calendario|Plano de estudo|class="plano"/);
  assert.match(html, /Próxima aula/);
  assert.match(html, /Seu progresso/);
});

test('contagem aceita outra data de prova', () => {
  assert.equal(render.contagem('2026-12-01', '2026-12-03'), '2 dias para a prova');
});

test('renderLesson mostra o título das aulas vizinhas na navegação', () => {
  const aula = { id: 'm01-a02', titulo: 'Histórico', corpo: '', resumo: '', questoes: [], dissertativas: [] };
  const html = render.renderLesson(aula, { id: 'm01-a02', titulo: 'Histórico', moduloTitulo: 'Introdução', publicada: true },
    { anterior: { id: 'm01-a01', titulo: 'O que é' }, proxima: { id: 'm01-a03', titulo: 'Discos' } });
  assert.match(html, /O que é/);
  assert.match(html, /Discos/);
});

test('renderResult diferencia aprovação, reprovação e aula já concluída', () => {
  assert.match(render.renderResult({ acertos: 5, total: 5, aprovado: true }, false), /Aula concluída/);
  assert.match(render.renderResult({ acertos: 2, total: 5, aprovado: false }, false), /são necessários 4 acertos/);
  const ja = render.renderResult({ acertos: 2, total: 5, aprovado: false }, true);
  assert.match(ja, /continua concluída/);
  assert.doesNotMatch(ja, /Faltou pouco/);
});
