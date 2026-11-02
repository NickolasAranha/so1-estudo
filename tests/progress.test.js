const test = require('node:test');
const assert = require('node:assert/strict');
const { createStore } = require('../js/core/progress.js');

function storageFake() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    _map: m,
  };
}

const storageQuebrado = {
  getItem() { throw new Error('SecurityError'); },
  setItem() { throw new Error('SecurityError'); },
};

test('aula concluída persiste ao recriar o store', () => {
  const st = storageFake();
  createStore(st).markComplete('m01-a01');
  const s2 = createStore(st);
  assert.equal(s2.isComplete('m01-a01'), true);
  assert.equal(s2.completedCount(), 1);
  assert.equal(s2.persistente, true);
  assert.ok(st._map.has('so1-progresso-v1'));
});

test('recordWrong não duplica e clearWrong remove', () => {
  const s = createStore(storageFake());
  s.recordWrong('q1', 'm01-a01');
  s.recordWrong('q1', 'm01-a01');
  assert.deepEqual(s.getWrong(), [{ questaoId: 'q1', aulaId: 'm01-a01' }]);
  s.clearWrong('q1');
  assert.deepEqual(s.getWrong(), []);
});

test('aula concluída continua concluída após novo erro', () => {
  const s = createStore(storageFake());
  s.markComplete('m01-a01');
  s.recordWrong('q2', 'm01-a01');
  assert.equal(s.isComplete('m01-a01'), true);
});

test('flagReview e unflagReview', () => {
  const s = createStore(storageFake());
  s.flagReview('m01-a02');
  s.flagReview('m01-a02');
  assert.deepEqual(s.getReviewLessons(), ['m01-a02']);
  s.unflagReview('m01-a02');
  assert.deepEqual(s.getReviewLessons(), []);
});

test('tema é salvo', () => {
  const st = storageFake();
  assert.equal(createStore(st).getTheme(), null);
  createStore(st).setTheme('escuro');
  assert.equal(createStore(st).getTheme(), 'escuro');
});

test('storage que lança erro cai para memória', () => {
  const s = createStore(storageQuebrado);
  assert.equal(s.persistente, false);
  s.markComplete('m01-a01');
  assert.equal(s.isComplete('m01-a01'), true);
});

test('sem storage também funciona em memória', () => {
  const s = createStore(null);
  assert.equal(s.persistente, false);
  s.markComplete('m01-a01');
  assert.equal(s.isComplete('m01-a01'), true);
});

test('JSON corrompido começa vazio', () => {
  const st = storageFake();
  st.setItem('so1-progresso-v1', '{não é json');
  const s = createStore(st);
  assert.equal(s.completedCount(), 0);
  assert.deepEqual(s.getWrong(), []);
});

test('storage que lê mas não grava é detectado já na criação', () => {
  const st = { getItem: () => null, setItem() { throw new Error('QuotaExceeded'); }, removeItem() {} };
  assert.equal(createStore(st).persistente, false);
});
