const test = require('node:test');
const assert = require('node:assert/strict');
const { buildStudyPlan } = require('../js/core/plan.js');

const aulas = Array.from({ length: 42 }, (_, i) => ({ id: 'a' + i, publicada: i < 3 }));

test('42 aulas a partir de 27/10: revisão em 06/11 e todas distribuídas em ordem', () => {
  const { dias } = buildStudyPlan(aulas, new Set(), '2026-10-27');
  assert.equal(dias[0].data, '2026-10-27');
  const ultimo = dias[dias.length - 1];
  assert.equal(ultimo.data, '2026-11-06');
  assert.equal(ultimo.revisao, true);
  assert.deepEqual(ultimo.aulas, []);
  const todas = dias.flatMap(d => d.aulas);
  assert.deepEqual(todas, aulas.map(a => a.id));
  // dias de estudo: 27/10..05/11 = 10 dias, ceil(42/10) = 5 por dia no máximo
  assert.ok(dias.slice(0, -1).every(d => d.aulas.length <= 5));
});

test('aulas concluídas ficam fora do plano', () => {
  const concluidas = new Set(aulas.slice(0, 40).map(a => a.id));
  const { dias } = buildStudyPlan(aulas, concluidas, '2026-10-27');
  assert.deepEqual(dias.flatMap(d => d.aulas), ['a40', 'a41']);
});

test('na véspera só há o dia de revisão', () => {
  const { dias } = buildStudyPlan(aulas, new Set(), '2026-11-06');
  assert.equal(dias.length, 1);
  assert.equal(dias[0].revisao, true);
  assert.equal(dias[0].data, '2026-11-06');
});

test('no dia da prova ou depois o plano é vazio com mensagem', () => {
  for (const hoje of ['2026-11-07', '2026-12-01']) {
    const r = buildStudyPlan(aulas, new Set(), hoje);
    assert.deepEqual(r.dias, []);
    assert.match(r.mensagem, /prova/i);
  }
});

test('todas concluídas: só revisão e mensagem', () => {
  const r = buildStudyPlan(aulas, new Set(aulas.map(a => a.id)), '2026-10-27');
  assert.equal(r.dias.length, 1);
  assert.equal(r.dias[0].revisao, true);
  assert.match(r.mensagem, /Todas as aulas concluídas/);
});

test('virada de mês sem fuso: 31/10 seguido de 01/11', () => {
  const { dias } = buildStudyPlan(aulas, new Set(), '2026-10-31');
  assert.deepEqual(dias.slice(0, 2).map(d => d.data), ['2026-10-31', '2026-11-01']);
});
