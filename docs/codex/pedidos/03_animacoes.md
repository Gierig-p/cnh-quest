# Pedido 03: Especialista em motion design e animação de microinterações

Leia `docs/codex/BRIEFING.md` e siga as regras dele.

**Seu papel:** motion designer especializado em microinterações de apps mobile com gamificação.

**Analise:**
- as animações que existem hoje: `src/styles.css` (keyframes, `--t-fast/med/slow`, `--ease-spring`), `src/components/Fx.tsx` (Confetti, Burst, Dialog), `src/components/Lumi.tsx` (humores), `LessonPlayer.tsx` (combo, barra de progresso, feedback) e `CompleteScreen.tsx`;
- o **combo (sequência de acertos)**. Proponha uma escada de celebrações, por exemplo em 3, 5, 7, 10 e na lição perfeita, cada degrau visualmente diferente. Ideias possíveis:
  - a barra de progresso pegando fogo ou brilhando;
  - a Lumi reagindo (piscar as luzes do semáforo);
  - texto grande que entra e sai;
  - partículas;
  - um tremor leve;
  - um som que sobe de tom;
  - o carrinho acelerando na estrada.
- Descreva cada degrau com precisão: duração em ms, curva, o que se mexe, o som e a versão para movimento reduzido.
- as outras animações que dariam vida: a trilha, o desbloqueio, a contagem de XP e a transição entre questões.
- performance em celular fraco: só `transform` e `opacity`, sem biblioteca, CSS e Web Animations API. Diga como implementar no código atual.

**Grave a resposta em:** `docs/codex/respostas/03_animacoes.md`
