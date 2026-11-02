const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScripts } = require('./helpers');

function novoSO1() {
  return loadScripts(['js/core/registry.js']).SO1;
}

const modulos = [
  { id: 'm01', titulo: 'Introdução', aulas: [
    { id: 'm01-a01', titulo: 'O que é', arquivo: 'conteudo/m01/a01.js', publicada: true },
    { id: 'm01-a02', titulo: 'Histórico', arquivo: 'conteudo/m01/a02.js', publicada: false },
  ] },
  { id: 'm02', titulo: 'Estrutura', aulas: [
    { id: 'm02-a01', titulo: 'Hardware', arquivo: 'conteudo/m02/a01.js', publicada: false },
  ] },
];

test('getLesson devolve a aula registrada', () => {
  const SO1 = novoSO1();
  SO1.registerModules(modulos);
  SO1.registerLesson({ id: 'm01-a01', titulo: 'O que é' });
  assert.equal(SO1.getLesson('m01-a01').titulo, 'O que é');
  assert.equal(SO1.getLesson('m09-a09'), undefined);
});

test('registrar o mesmo id duas vezes lança erro', () => {
  const SO1 = novoSO1();
  SO1.registerLesson({ id: 'm01-a01', titulo: 'x' });
  assert.throws(() => SO1.registerLesson({ id: 'm01-a01', titulo: 'y' }), /m01-a01/);
});

test('lessonIndex preserva a ordem módulo→aula e preenche moduloTitulo', () => {
  const SO1 = novoSO1();
  SO1.registerModules(modulos);
  const idx = SO1.lessonIndex();
  assert.deepEqual([...idx.map(a => a.id)], ['m01-a01', 'm01-a02', 'm02-a01']);
  assert.equal(idx[2].moduloId, 'm02');
  assert.equal(idx[2].moduloTitulo, 'Estrutura');
  assert.equal(idx[0].publicada, true);
  assert.equal(idx[1].arquivo, 'conteudo/m01/a02.js');
});

test('getModules devolve os módulos registrados', () => {
  const SO1 = novoSO1();
  SO1.registerModules(modulos);
  assert.equal(SO1.getModules().length, 2);
});
