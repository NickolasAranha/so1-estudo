// Progresso do aluno em localStorage; sem storage disponível, funciona só em memória.
(function (root) {
  const CHAVE = 'so1-progresso-v1';

  function estadoVazio() {
    return { concluidas: [], erradas: [], revisar: [], tema: null };
  }

  function createStore(storage) {
    let persistente = !!storage;
    let estado = estadoVazio();

    if (storage) {
      try {
        const bruto = storage.getItem(CHAVE);
        if (bruto) {
          try {
            estado = Object.assign(estadoVazio(), JSON.parse(bruto));
          } catch (e) {
            estado = estadoVazio();
          }
        }
        // Sonda de gravação: alguns navegadores leem mas recusam gravar (modo privado, cota cheia).
        storage.setItem(CHAVE + '-sonda', '1');
        if (storage.removeItem) storage.removeItem(CHAVE + '-sonda');
      } catch (e) {
        persistente = false;
      }
    }

    function salvar() {
      if (!persistente) return;
      try {
        storage.setItem(CHAVE, JSON.stringify(estado));
      } catch (e) {
        persistente = false;
        store.persistente = false;
      }
    }

    function addUnico(lista, valor) {
      if (!lista.includes(valor)) lista.push(valor);
    }

    const store = {
      persistente,
      isComplete: id => estado.concluidas.includes(id),
      markComplete(id) { addUnico(estado.concluidas, id); salvar(); },
      completedCount: () => estado.concluidas.length,
      recordWrong(questaoId, aulaId) {
        if (!estado.erradas.some(e => e.questaoId === questaoId)) {
          estado.erradas.push({ questaoId, aulaId });
          salvar();
        }
      },
      clearWrong(questaoId) {
        estado.erradas = estado.erradas.filter(e => e.questaoId !== questaoId);
        salvar();
      },
      getWrong: () => estado.erradas.map(e => ({ ...e })),
      flagReview(id) { addUnico(estado.revisar, id); salvar(); },
      unflagReview(id) { estado.revisar = estado.revisar.filter(x => x !== id); salvar(); },
      getReviewLessons: () => estado.revisar.slice(),
      getTheme: () => estado.tema,
      setTheme(t) { estado.tema = t; salvar(); },
    };
    return store;
  }

  const api = { createStore };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.SO1 = root.SO1 || {}).progress = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
