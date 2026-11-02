// Plano de estudo: distribui as aulas pendentes pelos dias até a véspera da prova (dia de revisão).
(function (root) {
  const PROVA = '2026-11-07';

  // Datas como dias inteiros em UTC, para não depender do fuso.
  function paraDia(iso) {
    const [a, m, d] = iso.split('-').map(Number);
    return Date.UTC(a, m - 1, d) / 86400000;
  }

  function paraISO(dia) {
    return new Date(dia * 86400000).toISOString().slice(0, 10);
  }

  function buildStudyPlan(aulas, concluidas, hojeISO, provaISO = PROVA) {
    const hoje = paraDia(hojeISO);
    const vespera = paraDia(provaISO) - 1;
    if (hoje > vespera) return { dias: [], mensagem: 'O dia da prova chegou. Boa prova!' };

    const pendentes = aulas.filter(a => !concluidas.has(a.id)).map(a => a.id);
    const revisao = { data: paraISO(vespera), aulas: [], revisao: true };
    const diasEstudo = vespera - hoje;
    const dias = [];

    if (pendentes.length && diasEstudo > 0) {
      const porDia = Math.ceil(pendentes.length / diasEstudo);
      for (let i = 0; i < diasEstudo && i * porDia < pendentes.length; i++) {
        dias.push({ data: paraISO(hoje + i), aulas: pendentes.slice(i * porDia, (i + 1) * porDia) });
      }
    }
    dias.push(revisao);

    const r = { dias };
    if (!pendentes.length) r.mensagem = 'Todas as aulas concluídas! Use os dias restantes para revisar.';
    return r;
  }

  const api = { buildStudyPlan };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.SO1 = root.SO1 || {}).plan = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
