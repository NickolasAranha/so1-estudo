// Registro global de módulos e aulas. Os arquivos de conteúdo chamam SO1.registerLesson().
(function (root) {
  const SO1 = root.SO1 || (root.SO1 = {});
  let modulos = [];
  let aulas = {};

  SO1.registerModules = function (mods) {
    modulos = mods;
  };

  SO1.registerLesson = function (aula) {
    if (aulas[aula.id]) throw new Error('Aula registrada duas vezes: ' + aula.id);
    aulas[aula.id] = aula;
  };

  SO1.getModules = function () {
    return modulos;
  };

  SO1.getLesson = function (id) {
    return aulas[id];
  };

  SO1.lessonIndex = function () {
    const lista = [];
    for (const m of modulos) {
      for (const a of m.aulas) {
        lista.push({ id: a.id, titulo: a.titulo, moduloId: m.id, moduloTitulo: m.titulo,
          publicada: a.publicada, arquivo: a.arquivo });
      }
    }
    return lista;
  };

  SO1._reset = function () {
    modulos = [];
    aulas = {};
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SO1;
})(typeof globalThis !== 'undefined' ? globalThis : this);
