// Validador do conteúdo real: índice de módulos e cada aula publicada.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScripts, siteFileExists } = require('./helpers');

const ctx = loadScripts(['js/core/registry.js', 'conteudo/modulos.js']);
const SO1 = ctx.SO1;
const indice = SO1.lessonIndex();
const publicadas = indice.filter(a => a.publicada);

const FONTES_PROIBIDAS = ['Prova', 'Prof.', 'Lista de'];

test('índice tem 10 módulos m01..m10', () => {
  const ids = [...SO1.getModules().map(m => m.id)];
  assert.deepEqual(ids, Array.from({ length: 10 }, (_, i) => 'm' + String(i + 1).padStart(2, '0')));
});

test('índice tem 42 aulas com ids únicos e no formato do módulo', () => {
  assert.equal(indice.length, 42);
  assert.equal(new Set(indice.map(a => a.id)).size, 42);
  for (const a of indice) {
    assert.match(a.id, /^m\d{2}-a\d{2}$/);
    assert.ok(a.id.startsWith(a.moduloId + '-'), a.id);
    assert.ok(a.titulo && a.arquivo, a.id);
  }
});

test('cada aula publicada tem arquivo que registra o mesmo id e título', () => {
  for (const a of publicadas) {
    assert.ok(siteFileExists(a.arquivo), `arquivo ausente: ${a.arquivo}`);
    loadScripts([a.arquivo], ctx);
    const aula = SO1.getLesson(a.id);
    assert.ok(aula, `${a.arquivo} não registrou ${a.id}`);
    assert.equal(aula.titulo, a.titulo, a.id);
  }
});

const questaoIds = new Set();

for (const a of publicadas) {
  test(`aula ${a.id} segue o formato`, () => {
    if (!SO1.getLesson(a.id) && siteFileExists(a.arquivo)) loadScripts([a.arquivo], ctx);
    const aula = SO1.getLesson(a.id);
    assert.ok(aula, a.id);

    assert.ok(Array.isArray(aula.fontes) && aula.fontes.length >= 1, 'fontes');
    for (const f of aula.fontes) {
      for (const p of FONTES_PROIBIDAS) assert.ok(!f.includes(p), `fonte proibida "${p}" em ${a.id}`);
    }
    assert.ok(aula.corpo.includes('class="analogia"'), 'corpo sem analogia');
    assert.ok(aula.corpo.includes('class="exemplo"'), 'corpo sem exemplo');
    assert.ok(aula.resumo && aula.resumo.trim(), 'resumo vazio');

    assert.ok(aula.questoes.length >= 5, 'menos de 5 questões');
    for (const q of aula.questoes) {
      assert.ok(q.id.startsWith(a.id + '-'), `id de questão ${q.id}`);
      assert.ok(!questaoIds.has(q.id), `id duplicado ${q.id}`);
      questaoIds.add(q.id);
      assert.ok(q.enunciado && q.enunciado.trim(), q.id);
      assert.equal(q.alternativas.length, 4, `${q.id} sem 4 alternativas`);
      assert.equal(q.alternativas.filter(x => x.correta === true).length, 1, `${q.id} sem exatamente 1 correta`);
      for (const alt of q.alternativas) {
        assert.ok(alt.texto && alt.texto.trim(), q.id);
        assert.ok(alt.explicacao && alt.explicacao.length >= 20, `${q.id} explicação curta`);
      }
    }

    assert.ok(aula.dissertativas.length >= 1 && aula.dissertativas.length <= 2, 'dissertativas 1–2');
    for (const d of aula.dissertativas) {
      assert.ok(d.id.startsWith(a.id + '-'), d.id);
      assert.ok(d.enunciado && d.respostaModelo && d.respostaModelo.trim(), d.id);
      assert.ok(d.pontosChave.length >= 3, `${d.id} com menos de 3 pontos-chave`);
    }
  });
}
