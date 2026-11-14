# Pedido 05: Especialista em arquitetura front-end e viabilidade técnica

Leia `docs/codex/BRIEFING.md` e siga as regras dele.

**Seu papel:** engenheiro front-end sênior (React, desempenho em celular, PWA e testes).

**Analise:**
- a saúde do código atual: tamanho e complexidade de `LessonPlayer.tsx`, `App.tsx`, `Exercises.tsx` e `styles.css`; duplicações; e onde uma mudança de animação ou gamificação ficaria fácil ou difícil;
- como encaixar uma **camada de celebração** (combo, marcos) de forma limpa, por exemplo um componente `Celebration` ou um hook `useCelebration`, com testes e sem mexer nas regras de XP;
- como guardar coisas novas (missões, baú, proteção de ofensiva) no `progressStore` sem quebrar o progresso antigo, com campos opcionais e sem migração;
- o desempenho: tamanho do bundle, CSS, animações, áudio e o carregamento em 3G;
- os riscos: ~13 arquivos modificados e ainda sem commit (veja `git status`). Recomende uma ordem segura (por exemplo, fechar o que está pendente antes de começar coisas novas).
- Pode rodar `npm test` e `npx tsc --noEmit` para conferir a saúde atual.

**Grave a resposta em:** `docs/codex/respostas/05_tecnico.md`
