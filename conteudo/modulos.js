// Índice do curso. Para publicar uma aula: crie o arquivo e mude publicada para true.
SO1.registerModules([
  { id: 'm01', titulo: 'Introdução e histórico', aulas: [
    { id: 'm01-a01', titulo: 'O que é um sistema operacional', arquivo: 'conteudo/m01/a01-o-que-e-um-so.js', publicada: true },
    { id: 'm01-a02', titulo: 'Histórico: do batch ao timesharing', arquivo: 'conteudo/m01/a02-historico.js', publicada: true },
    { id: 'm01-a03', titulo: 'Tipos de sistemas operacionais', arquivo: 'conteudo/m01/a03-tipos-de-sistemas.js', publicada: true },
  ] },
  { id: 'm02', titulo: 'Estrutura do SO e suporte de hardware', aulas: [
    { id: 'm02-a01', titulo: 'Revisão de hardware', arquivo: 'conteudo/m02/a01-revisao-hardware.js', publicada: true },
    { id: 'm02-a02', titulo: 'Modos de operação e proteção', arquivo: 'conteudo/m02/a02-modos-e-protecao.js', publicada: true },
    { id: 'm02-a03', titulo: 'Interrupções', arquivo: 'conteudo/m02/a03-interrupcoes.js', publicada: true },
    { id: 'm02-a04', titulo: 'Chamadas de sistema', arquivo: 'conteudo/m02/a04-chamadas-de-sistema.js', publicada: true },
    { id: 'm02-a05', titulo: 'Estruturas de SO', arquivo: 'conteudo/m02/a05-estruturas-de-so.js', publicada: true },
  ] },
  { id: 'm03', titulo: 'Processos', aulas: [
    { id: 'm03-a01', titulo: 'O que é um processo', arquivo: 'conteudo/m03/a01-conceito-de-processo.js', publicada: true },
    { id: 'm03-a02', titulo: 'Estados de um processo', arquivo: 'conteudo/m03/a02-estados.js', publicada: true },
    { id: 'm03-a03', titulo: 'Processos suspensos', arquivo: 'conteudo/m03/a03-suspensos.js', publicada: true },
    { id: 'm03-a04', titulo: 'BDP, filas e troca de contexto', arquivo: 'conteudo/m03/a04-bdp-e-troca-de-contexto.js', publicada: true },
  ] },
  { id: 'm04', titulo: 'Threads', aulas: [
    { id: 'm04-a01', titulo: 'Processos x threads', arquivo: 'conteudo/m04/a01-processos-x-threads.js', publicada: true },
    { id: 'm04-a02', titulo: 'Modelos de threads (N:1, 1:1, M:N)', arquivo: 'conteudo/m04/a02-modelos-de-threads.js', publicada: true },
  ] },
  { id: 'm05', titulo: 'Concorrência e sincronização', aulas: [
    { id: 'm05-a01', titulo: 'Programação concorrente', arquivo: 'conteudo/m05/a01-programacao-concorrente.js', publicada: true },
    { id: 'm05-a02', titulo: 'Especificando paralelismo (fork, parbegin/parend)', arquivo: 'conteudo/m05/a02-especificacao-paralelismo.js', publicada: true },
    { id: 'm05-a03', titulo: 'Condição de corrida e seção crítica', arquivo: 'conteudo/m05/a03-secao-critica.js', publicada: true },
    { id: 'm05-a04', titulo: 'Exclusão mútua com espera ocupada', arquivo: 'conteudo/m05/a04-espera-ocupada.js', publicada: true },
    { id: 'm05-a05', titulo: 'Dormir e acordar: produtor-consumidor', arquivo: 'conteudo/m05/a05-dormir-acordar.js', publicada: true },
    { id: 'm05-a06', titulo: 'Semáforos e mutex', arquivo: 'conteudo/m05/a06-semaforos-mutex.js', publicada: true },
    { id: 'm05-a07', titulo: 'Monitores, troca de mensagens e RPC', arquivo: 'conteudo/m05/a07-monitores-mensagens.js', publicada: true },
    { id: 'm05-a08', titulo: 'Problemas clássicos', arquivo: 'conteudo/m05/a08-problemas-classicos.js', publicada: true },
  ] },
  { id: 'm06', titulo: 'Deadlock (impasses)', aulas: [
    { id: 'm06-a01', titulo: 'Recursos e as 4 condições', arquivo: 'conteudo/m06/a01-recursos-e-condicoes.js', publicada: true },
    { id: 'm06-a02', titulo: 'Tratando deadlocks', arquivo: 'conteudo/m06/a02-tratamento-deadlock.js', publicada: true },
  ] },
  { id: 'm07', titulo: 'Escalonamento', aulas: [
    { id: 'm07-a01', titulo: 'Conceitos e critérios de escalonamento', arquivo: 'conteudo/m07/a01-conceitos-e-criterios.js', publicada: true },
    { id: 'm07-a02', titulo: 'FIFO e SJF', arquivo: 'conteudo/m07/a02-fifo-sjf.js', publicada: true },
    { id: 'm07-a03', titulo: 'Round Robin', arquivo: 'conteudo/m07/a03-round-robin.js', publicada: true },
    { id: 'm07-a04', titulo: 'Prioridades e múltiplas filas', arquivo: 'conteudo/m07/a04-prioridades-e-filas.js', publicada: true },
    { id: 'm07-a05', titulo: 'Exercícios de linha do tempo', arquivo: 'conteudo/m07/a05-exercicios-linha-do-tempo.js', publicada: true },
  ] },
  { id: 'm08', titulo: 'Memória e memória virtual', aulas: [
    { id: 'm08-a01', titulo: 'Espaços de endereçamento e swapping', arquivo: 'conteudo/m08/a01-enderecamento-e-swapping.js', publicada: true },
    { id: 'm08-a02', titulo: 'Memória virtual e paginação', arquivo: 'conteudo/m08/a02-paginacao.js', publicada: true },
    { id: 'm08-a03', titulo: 'Algoritmos de substituição de páginas', arquivo: 'conteudo/m08/a03-substituicao-de-paginas.js', publicada: true },
    { id: 'm08-a04', titulo: 'Questões de projeto e segmentação', arquivo: 'conteudo/m08/a04-projeto-e-segmentacao.js', publicada: true },
  ] },
  { id: 'm09', titulo: 'E/S, discos e sistemas de arquivos', aulas: [
    { id: 'm09-a01', titulo: 'Hardware de E/S', arquivo: 'conteudo/m09/a01-hardware-de-es.js', publicada: true },
    { id: 'm09-a02', titulo: 'Técnicas e software de E/S', arquivo: 'conteudo/m09/a02-tecnicas-e-software-de-es.js', publicada: true },
    { id: 'm09-a03', titulo: 'Discos e escalonamento de disco', arquivo: 'conteudo/m09/a03-discos.js', publicada: true },
    { id: 'm09-a04', titulo: 'RAID', arquivo: 'conteudo/m09/a04-raid.js', publicada: true },
    { id: 'm09-a05', titulo: 'Arquivos e diretórios', arquivo: 'conteudo/m09/a05-arquivos-e-diretorios.js', publicada: true },
    { id: 'm09-a06', titulo: 'Implementação de sistemas de arquivos', arquivo: 'conteudo/m09/a06-implementacao-de-arquivos.js', publicada: true },
  ] },
  { id: 'm10', titulo: 'Estudos de caso e tópicos complementares', aulas: [
    { id: 'm10-a01', titulo: 'Estudo de caso: UNIX/Linux', arquivo: 'conteudo/m10/a01-linux-unix.js', publicada: true },
    { id: 'm10-a02', titulo: 'Estudo de caso: Windows', arquivo: 'conteudo/m10/a02-windows.js', publicada: true },
    { id: 'm10-a03', titulo: 'Multiprocessadores e noções de segurança', arquivo: 'conteudo/m10/a03-multiprocessadores-e-seguranca.js', publicada: true },
  ] },
]);
