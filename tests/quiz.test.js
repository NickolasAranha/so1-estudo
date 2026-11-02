const test = require('node:test');
const assert = require('node:assert/strict');
const quiz = require('../js/core/quiz.js');

function rngFixo(seed = 42) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}

function questao(i) {
  return {
    id: 'm01-a01-q' + i,
    enunciado: 'Q' + i,
    alternativas: [
      { texto: `q${i} certa`, correta: true, explicacao: 'x'.repeat(20) },
      { texto: `q${i} errada 1`, correta: false, explicacao: 'x'.repeat(20) },
      { texto: `q${i} errada 2`, correta: false, explicacao: 'x'.repeat(20) },
      { texto: `q${i} errada 3`, correta: false, explicacao: 'x'.repeat(20) },
    ],
  };
}
const pool6 = [1, 2, 3, 4, 5, 6].map(questao);

test('pickQuestions devolve 5 de um pool de 6', () => {
  assert.equal(quiz.pickQuestions(pool6, 5, rngFixo()).length, 5);
});

test('pickQuestions mantém a alternativa correta depois de embaralhar', () => {
  for (const q of quiz.pickQuestions(pool6, 5, rngFixo(7))) {
    const original = pool6.find(o => o.id === q.id);
    const certaOriginal = original.alternativas.find(a => a.correta).texto;
    assert.equal(q.alternativas.filter(a => a.correta).length, 1);
    assert.equal(q.alternativas.find(a => a.correta).texto, certaOriginal);
  }
});

test('pickQuestions não muta o pool', () => {
  const copia = JSON.parse(JSON.stringify(pool6));
  quiz.pickQuestions(pool6, 5, rngFixo(3));
  assert.deepEqual(pool6, copia);
});

test('pickQuestions embaralha as alternativas em algum sorteio', () => {
  const sorteio = quiz.pickQuestions(pool6, 6, rngFixo(11));
  assert.ok(sorteio.some(q => !q.alternativas[0].correta));
});

test('pickQuestions com pool menor que n devolve o pool inteiro', () => {
  assert.equal(quiz.pickQuestions(pool6.slice(0, 3), 5, rngFixo()).length, 3);
});

test('gradeAttempt aprova com 4 de 5', () => {
  const r = quiz.gradeAttempt([true, true, true, true, false].map((acertou, i) => ({ questaoId: 'q' + i, acertou })));
  assert.deepEqual(r, { acertos: 4, total: 5, aprovado: true });
});

test('gradeAttempt reprova com 3 de 5', () => {
  const r = quiz.gradeAttempt([true, true, true, false, false].map((acertou, i) => ({ questaoId: 'q' + i, acertou })));
  assert.equal(r.aprovado, false);
});

test('checklistResult marca revisar abaixo da metade', () => {
  assert.equal(quiz.checklistResult(1, 4).revisar, true);
  assert.equal(quiz.checklistResult(2, 4).revisar, false);
  assert.equal(quiz.checklistResult(1, 3).revisar, true);
  assert.equal(quiz.checklistResult(2, 4).fracao, 0.5);
});

test('pickQuestions inclui primeiro as questões prioritárias (erradas)', () => {
  const pool20 = Array.from({ length: 20 }, (_, i) => questao(i + 1));
  for (let seed = 1; seed <= 30; seed++) {
    const ids = quiz.pickQuestions(pool20, 5, rngFixo(seed), ['m01-a01-q17', 'm01-a01-q3']).map(q => q.id);
    assert.equal(ids.length, 5);
    assert.ok(ids.includes('m01-a01-q17') && ids.includes('m01-a01-q3'), `seed ${seed}: ${ids}`);
    assert.equal(new Set(ids).size, 5);
  }
});

test('reviewAction: marca se qualquer dissertativa ficou fraca; desmarca só com todas conferidas e boas', () => {
  assert.equal(quiz.reviewAction({ d1: true }, 2), 'marcar');
  assert.equal(quiz.reviewAction({ d1: true, d2: false }, 2), 'marcar');
  assert.equal(quiz.reviewAction({ d2: false }, 2), 'manter');
  assert.equal(quiz.reviewAction({ d1: false, d2: false }, 2), 'desmarcar');
  assert.equal(quiz.reviewAction({ d1: false }, 1), 'desmarcar');
});
