# CNH Quest — estado do projeto

> Última atualização: **28/10/2026**. Leia este arquivo primeiro ao retomar o trabalho.
> Atualize a seção "Diário" e "Próximos passos" sempre que fechar uma etapa.

---

## 1. Em uma frase

App web (estilo Duolingo, identidade própria) para estudar a **prova teórica do DETRAN — 1ª habilitação A/B**, com trilha de lições curtas, feedback explicado com fonte legal, revisão espaçada, simulado no formato oficial e gamificação.

- **No ar:** https://gierig-p.github.io/cnh-quest/ (GitHub Pages, atualiza sozinho a cada push na `main`)
- **Repositório (público):** https://github.com/Gierig-p/cnh-quest
- **Dono:** Paulo Marinho (GitHub `Gierig-p`). Idioma de trabalho: **português do Brasil**.
- **Natureza:** app independente, sem vínculo com DETRAN/SENATRAN/Serpro. Questões **originais** (não são as da prova).

---

## 2. Como rodar e publicar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 29 testes (conteúdo, motor, interface, áudio)
npm run build      # dist/
```
- Node 24.22 / npm 11.19 na máquina do usuário (Windows 11). CI usa Node 20.
- **Publicar** = `git push origin main`. O workflow `.github/workflows/pages.yml` roda `npm ci → npm test → npm run build → deploy`. Se um teste falhar, o site antigo continua no ar.
- `vite.config.ts` usa `base: './'` (caminhos relativos) — necessário para funcionar em `/cnh-quest/`.
- Git local: `user.name "Paulo Marinho"`, `user.email "178224412+Gierig-p@users.noreply.github.com"` (e-mail anônimo para não expor o pessoal num repositório público). Branch principal: `main`.
- O usuário escolheu **não** tornar o app instalável (sem PWA/manifesto) — só site.

---

## 3. Arquitetura

React 18 + TypeScript + Vite + Vitest/Testing Library. Sem backend, sem login. Sem bibliotecas de UI/animação/ícones (tudo próprio).

```
src/
  content/    DADOS (não mexer sem verificar a fonte)
    types.ts            tipos de questão, lição, mundo, fontes
    world1.ts           Mundo 1: 6 lições, 47 questões, 10 cartões de conceito
    world2.ts           Mundo 2: 7 lições, 48 questões, 10 cartões de conceito
    sources.ts          fontes oficiais (CTB, MBST, Res. CONTRAN 1.020/2025…)
    referenceModules.ts os 4 módulos de referência + mundos planejados 3–8
    validate.ts         validador (rodado em content.test.ts)
    index.ts            WORLDS, QUESTIONS, EXAM_CONFIGS
  engine/     REGRAS PURAS (testadas em engine.test.ts)
    session.ts   sessão de lição, revisão de erros no fim (cada erro volta até 2×)
    grading.ts   correção + embaralhamento com semente
    progress.ts  XP, nível, ofensiva, meta diária, conquistas, Leitner, desbloqueio
    exam.ts      montagem e nota do simulado, resultado por módulo
  storage/progressStore.ts  localStorage, chave 'cnhquest:progress:v1'
  state/AppState.tsx        contexto React (progress, update, reset)
  ui/sound.ts               áudio sintetizado (Web Audio), volume em 'cnhquest:audio:v1'
  ui/hooks.ts               useSound, useReducedMotion, useCountUp
  components/  Lumi (mascote), Icons, Fx (Confetti/Burst/Dialog), Exercises, SignArt, SceneArt, Visual
  screens/     Home (trilha), LessonPlayer, CompleteScreen, ReviewScreen, ExamScreen, ProgressScreen, Panels, Onboarding
  styles.css   sistema de design inteiro (tokens no :root)
```

### Regras de negócio (resumo — a fonte é o código em `engine/`)
- **Lição:** XP da lição (+5 se perfeita); se as vidas acabarem, recebe 1/3. **Dominada** quando acerto na 1ª tentativa ≥ `masteryThreshold` (80%).
- **Vidas:** opcionais (Progresso → "Modo desafio"), 5 por lição. Desligadas por padrão.
- **Rodadas (estilo "Lição 1 de 4" do Duolingo, versão mais leve):** cada lição comum (com cartões) tem `rounds: 2`. Rodada 1 = cartões + exercícios (XP da lição). Rodada 2 = só prática, **8 questões** da própria lição, embaralhadas, com as já erradas primeiro (XP = 2/3 da lição). A trilha mostra um anel de progresso e a dica "Rodada 2 de 2". Revisões têm 1 rodada. Progresso salvo antes das rodadas: lição concluída conta como "1 de 2" (`roundsDone` ausente → 1) e não bloqueia o que já foi feito.
- **Revisões:** uma **"Revisão da metade"** no meio de cada mundo (10 questões das lições anteriores, sem cartões) e a **revisão do mundo** no final. Mundo 1: L1, L2, metade, L3, L4, revisão do mundo. Mundo 2: L1–L3, metade, L4, L5, revisão do mundo.
- **Desbloqueio:** lições em sequência (a próxima abre só depois de todas as rodadas da anterior); mundo seguinte após o anterior.
- **Revisão espaçada (Leitner):** errou → volta no mesmo dia; acertou → 1, 2, 4, 8, 16 dias.
- **Prática avulsa** (revisão/treino): XP = acertos de 1ª × 2.
- **Nível:** 50 XP para o nível 2, cada nível pede 25% a mais.
- **Metas diárias:** 10/20/30/50 XP (5/10/15/20 min).
- **Conquistas (7):** primeira-licao, perfeita, meta-diaria, ofensiva-3, mundo-1, primeiro-simulado, aprovado.
- **Simulado:** regra nacional (Res. CONTRAN 1.020/2025: 30 questões, 20 acertos, 60 min) ou regra da página do DETRAN-PE (21 acertos). Banco atual: **40** questões no formato oficial (14 do Mundo 1 + 26 do Mundo 2) → simulado completo de 30. Como só existem os Mundos 1 e 2, o sorteio fica concentrado em Sinalização (módulo 1) e Direção defensiva (módulo 3) até os Mundos 3–7 existirem. Resultado por módulo de referência (1–4) com erros explicados.

### Conteúdo
- **Mundo 1 "Começando no trânsito"** (módulos 1 e 3): 4 lições (2 rodadas cada) + revisão da metade + revisão do mundo, **47 questões verificadas** (14 no formato do simulado).
- **Mundo 2 "A linguagem das placas"** (módulo 1): 5 lições (placas que mandam, avisam e indicam, pinturas no chão, semáforo; 2 rodadas cada) + revisão da metade + revisão do mundo, **48 questões verificadas** (26 no formato do simulado). Fontes: MBST Vols. I a V. Os desenhos das placas são didáticos (inspirados nos manuais, que só trazem os símbolos como imagem), não cópias oficiais.
- **Mundos 3–8**: só planejados (aparecem "em construção"): 3 Regras para circular · 4 Infrações · 5 Motorista defensivo · 6 Emergências e primeiros socorros · 7 Veículo, meio ambiente e cidadania · 8 Preparação para a prova.
- **4 módulos de referência** (organização própria, espelha o curso oficial CNH do Brasil): 1 Sinalização · 2 Escolhas e consequências · 3 Direção defensiva · 4 Cuidado com a vida e o meio ambiente.
- Toda questão tem fonte + dispositivo exato + data de verificação. O validador barra: id duplicado, sem resposta correta, alternativa errada sem explicação, fonte inexistente, módulo incoerente.
- Evitar alternativa "todas as anteriores".

---

## 4. Sistema visual (repaginação de 27/10/2026)

Detalhes completos: `docs/repaginacao-visual-duolingo.md`.
- **Identidade:** metáfora de estrada (trilha = pista; trecho percorrido asfaltado com faixa amarela). Mascote **Lumi** (semáforo com boné de instrutor), humores `idle · wave · happy · cheer · think · sad` — nunca debochar do erro.
- **Tokens** em `:root` de `styles.css`: verde marca `#22b357`, verde botão `#12883f` (contraste AA com branco), asfalto `#2b3a48`, amarelo `#ffc83d`, ouro `#ffb800`, laranja, vermelho, azul, roxo; cada um com `-dark` (lábio), `-soft`, `-line`. Nunito 700–900. Raios 20/16/12. Lábio 4 px. Movimento `--t-fast/med/slow`, `--ease-spring`.
- **Botões 3D** (`.btn`, variantes `red blue yellow ghost sm wide`, `aria-busy` = carregando). Desabilitado sempre cinza.
- **Áudio:** 11 efeitos sintetizados (tap, select, correct, wrong, combo, transition, complete, xp, celebrate, achievement, unlock). Só toca após gesto do usuário; dedup de 90 ms; liga/desliga em `prefs.sound` (botão de alto-falante no topo); volume em Ajustes.
- **Movimento reduzido:** regra CSS global + `useReducedMotion()` (desliga confete, partículas e contagens).
- Nada do Duolingo foi copiado (mascote, ilustrações, sons, Lottie, CSS).

---

## 5. Restrições combinadas com o usuário (respeitar sempre)

1. **Não alterar** sem pedido explícito: conteúdo pedagógico, respostas, explicações, matriz do DETRAN, regras de progressão, revisão espaçada, critérios do simulado, modelo de dados/persistência.
2. Toda afirmação sobre lei/prova precisa de **fonte oficial verificada**; não inventar.
3. Não copiar material do Duolingo nem do curso oficial; usar só como referência.
4. Investigações com **REA** só em conteúdo público ou na sessão que o próprio usuário autenticou; nunca contornar login/CAPTCHA/paywall; não ler nem guardar senhas/cookies/tokens.
5. Não afirmar o que não foi observado (ex.: sons do Duolingo não foram ouvidos).
6. Manter os nomes acessíveis usados nos testes (`Vamos lá`, `Começar a trilha`, `Verificar`, `Continuar`, `Sair da lição`, `Efeitos sonoros`, etc.).
7. Comunicação com o usuário em português, simples e direta.
8. **Fixação estilo Duolingo:** depois de cada cartão de conceito vêm **no mínimo 4 exercícios variados** sobre ele (escolha, V/F, completar, associar, ordenar), antes do próximo cartão. O teste `content.test.ts` garante isso. Se a lição passar de ~16 passos, dividir em duas. Exercícios de fixação **não entram no simulado** (sem `examEligible`), para o simulado não repetir o mesmo fato.
9. **Estrutura de cada mundo:** lições comuns com 2 rodadas (cada uma com pelo menos 8 questões), uma "Revisão da metade" no meio e a revisão do mundo no final. O teste `content.test.ts` garante isso.

---

## 6. Ferramentas e como verificar

- **REA** (MCP `rea`): `capture_browser_scenario` com Edge em `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (headless). Respostas grandes vão para arquivo; extrair screenshots com um script Python (base64 em `normalized_result.steps[].artifacts.screenshot.value.data_base64`). Para muitas evidências: `export_evidence_bundle`.
- Viewports usados: desktop 1280×800, celular 390×844.
- Para pular o onboarding num teste de navegador: `localStorage['cnhquest:progress:v1'] = {"version":1,"onboarded":true}`.
- Dev server para captura: `npx vite --port 5199 --strictPort` → `http://localhost:5199/` (usar `localhost`, não `127.0.0.1`).
- `gh` está autenticado na conta `Gierig-p`. Python da máquina não tem PIL.

---

## 7. Diário (linha do tempo)

| Data | O que aconteceu | Onde está |
|---|---|---|
| 19/10/2026 | Fase A: análise do Duolingo (mecânicas) e das regras da prova | `analise-duolingo.md`, `matriz-conteudo-detran.md` §0–3 |
| 19–20/10 | Fases B/C: versão 0.1 (Mundo 1, 5 tipos de exercício, gamificação, Leitner, simulado, acessibilidade, testes) | `plano-tecnico.md` |
| 25/10 | Curso oficial CNH do Brasil investigado (público + sessão do usuário); 4 módulos de referência; simulado com resultado por módulo | `analise-cnh-do-brasil.md`, `relatorio-ate-2026-10-25.md` |
| 27/10 | **Repaginação visual completa** (sistema de design, trilha-estrada, animações, 11 sons, Lumi nova, diálogos, estados vazios, correções de celular). Testes 24 → 29 | `repaginacao-visual-duolingo.md`, `capturas-cnh-quest/repaginacao/` |
| 27/10 | **Publicado** no GitHub Pages com deploy automático (repo público `Gierig-p/cnh-quest`, 1º commit `a95a207`) | `.github/workflows/pages.yml` |
| 28/10 | **Explicações mais didáticas** no Mundo 1: cartões de conceito agora têm fala da Lumi + "Palavras novas" + "Passo a passo" + "Na prática" + "Para guardar" (campos opcionais `terms`, `points`, `example`, `remember` em `ConceptCard`). 4 cartões novos (placa escondida, ambulância, placas de proibição, limite de velocidade), para toda questão ser ensinada antes de ser perguntada. Definições conferidas no CTB Anexo I e art. 258. Questões, respostas e regras não mudaram | `src/content/world1.ts`, `LessonPlayer.tsx` |
| 28/10 | **Mundo 2 "A linguagem das placas"**: 5 lições + revisão, 10 cartões didáticos, 33 questões verificadas nos MBST Vols. I–V (fontes `mbst3`, `mbst4`, `mbst5` adicionadas com sha256). **Banco do simulado: 14 → 40 questões**, então o simulado agora tem as 30 questões completas. Novos desenhos: R-4a, R-5a, R-26, R-33, A-12, A-14, A-24, A-41, placa verde de destino e 4 cenas (linha amarela contínua/tracejada, linha de retenção, semáforo amarelo), conferidos por captura de tela. Testes 29/29 e build ok | `src/content/world2.ts`, `SignArt.tsx`, `SceneArt.tsx`, `sources.ts`, `index.ts` |
| 28/10 | **Exercícios de fixação (estilo Duolingo)**: cada cartão de conceito agora tem no mínimo 4 exercícios variados antes do próximo. +24 questões no Mundo 1 (23 → 47) e +13 no Mundo 2 (35 → 48), todas com fonte conferida (CTB, MBST I–V) e só sobre o que o cartão ensina. A lição "Primeiras placas" foi dividida e surgiu a lição **w1-l4 "Proibições e velocidade"**. Exercícios de fixação ficam fora do simulado (banco continua com 40). Teste novo garante o mínimo de 4 por cartão. Testes 30/30 e build ok | `world1.ts`, `world2.ts`, `content.test.ts`, `engine.test.ts` |
| 28/10 | **Rodadas e revisão da metade (pedido do usuário, inspirado no "Lição 2 de 4" do Duolingo, com 2 em vez de 4)**: cada lição comum agora tem 2 rodadas (a 2ª só prática, 8 questões, erradas primeiro, 2/3 do XP); anel de progresso e dica "Rodada 2 de 2" na trilha; tela final mostra "Rodada 1 de 2 concluída" e o botão "Fazer a rodada 2". Nova lição "Revisão da metade" em cada mundo (10 questões já verificadas, sem conteúdo novo); revisão do mundo mantida no final. Progresso antigo conta como 1 de 2. Campo opcional `rounds` em `Lesson` e `roundsDone` em `LessonProgress`. Conferido por captura de tela. Testes 35/35 e build ok | `engine/progress.ts`, `App.tsx`, `Home.tsx`, `CompleteScreen.tsx`, `LessonPlayer.tsx`, `world1.ts`, `world2.ts` |

---

## 8. Problemas conhecidos

- Só os Mundos 1 e 2 têm conteúdo (95 questões). O simulado já tem 40 questões no formato oficial, mas quase só de Sinalização e Direção defensiva; faltam Infrações, Primeiros socorros e Meio ambiente.
- Distribuição oficial das 30 questões por assunto não foi publicada.
- Progresso só no navegador atual (sem conta/sincronização); aba anônima perde tudo.
- Sair de uma lição no meio descarta a sessão (respostas já dadas ficam no histórico).
- Animações e sons da repaginação foram conferidos por capturas estáticas e testes; **ainda não foram ouvidos/vistos em movimento num aparelho real**.
- Aviso do GitHub Actions: ações usam Node 20 (descontinuado) e o runner vai migrar para Ubuntu 26 — não impede o deploy hoje; atualizar versões das actions quando houver novas.

---

## 9. Próximos passos (ordem sugerida)

1. **Feedback do usuário no celular** sobre a repaginação e os novos cartões de explicação (tamanho do texto, se ficou claro) e ajustes.
   - Regra nova: nos próximos mundos, todo assunto perguntado precisa ser ensinado antes num cartão no formato didático.
   - Regra nova: no mínimo 4 exercícios variados por cartão (§5, item 8).
2. **Publicar** as rodadas e a revisão da metade (quando o usuário pedir) e o usuário testar no celular se o ritmo ficou bom.
3. **Usuário testar o Mundo 2** no celular (desenhos novos e cartões) e ajustes.
4. **Mundo 3 "Regras para circular"** (módulo 3) e **Mundo 4 "Infrações"** (módulo 2), para o simulado ficar equilibrado entre os módulos.
5. Lição **"O caminho até a CNH"** (Mundo 8): CTB art. 148 + Res. 1.020/2025 art. 51 (`matriz` §3d).
6. Mostrar **progresso por módulo** (1–4) na tela de Progresso.
7. Mundos 3–8 conforme `matriz-conteudo-detran.md` §3c.
8. Testes de acessibilidade automatizados (axe) e de interface do simulado.
9. Opcional, quando o usuário pedir: PWA instalável, conta/sincronização, personagens secundários (cone, placa PARE, ambulância).

---

## 10. Índice da documentação

| Arquivo | Conteúdo |
|---|---|
| `README.md` | visão geral e como rodar |
| `docs/ESTADO-DO-PROJETO.md` | **este arquivo** — estado atual e próximos passos |
| `docs/analise-duolingo.md` | mecânicas do Duolingo adaptadas (19/10) |
| `docs/repaginacao-visual-duolingo.md` | investigação visual, sistema de design, animações e áudio (27/10) |
| `docs/matriz-conteudo-detran.md` | regras da prova, eixos oficiais, módulos, mapa mundo→lição, processo de habilitação |
| `docs/analise-cnh-do-brasil.md` | curso oficial CNH do Brasil (estrutura, simulado oficial) |
| `docs/plano-tecnico.md` | decisões técnicas e histórico de fases |
| `docs/relatorio-ate-2026-10-25.md` | relatório consolidado até 25/10 |
| `docs/capturas-*` | capturas de tela de referência e de antes/depois |
