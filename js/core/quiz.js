// Lógica pura do quiz: sorteio, correção e resultado do checklist das dissertativas.
(function (root) {
  const APROVACAO = 4;

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Questões em `prioritarias` (ids, ex.: as erradas antes) entram primeiro; o resto é sorteado.
  function pickQuestions(pool, n = 5, rng = Math.random, prioritarias = []) {
    const prio = shuffle(pool.filter(q => prioritarias.includes(q.id)), rng);
    const resto = shuffle(pool.filter(q => !prioritarias.includes(q.id)), rng);
    return prio.concat(resto).slice(0, Math.min(n, pool.length)).map(q => ({
      ...q,
      alternativas: shuffle(q.alternativas.map(a => ({ ...a })), rng),
    }));
  }

  function gradeAttempt(results) {
    const acertos = results.filter(r => r.acertou).length;
    return { acertos, total: results.length, aprovado: acertos >= APROVACAO };
  }

  function checklistResult(marcados, total) {
    return { fracao: total ? marcados / total : 0, revisar: marcados < total / 2 };
  }

  // resultados: { [dissertativaId]: revisar? } das dissertativas já conferidas na aula.
  function reviewAction(resultados, totalDissertativas) {
    const valores = Object.values(resultados);
    if (valores.some(Boolean)) return 'marcar';
    return valores.length >= totalDissertativas ? 'desmarcar' : 'manter';
  }

  const api = { pickQuestions, gradeAttempt, checklistResult, reviewAction };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.SO1 = root.SO1 || {}).quiz = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
