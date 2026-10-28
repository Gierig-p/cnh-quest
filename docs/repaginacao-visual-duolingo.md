# Repaginação visual do CNH Quest (referência: Duolingo)

Data: 27/10/2026. Escopo: só visual, animação e áudio. Conteúdo pedagógico, respostas, regras de progressão, revisão espaçada, simulado, modelo de dados e persistência **não foram alterados**.

---

## 1. Investigação do Duolingo (REA)

### Ferramentas e ambiente
- REA `capture_browser_scenario` (Playwright), Edge/Chromium 156 headless, `pt-BR`, `reduced_motion: no-preference`, 1280×800.
- Somente conteúdo público / fluxo de visitante. Nenhum login, CAPTCHA ou paywall foi contornado.
- Evidências desta sessão: `ev_d878e074…` (cadastro → boas-vindas), `ev_f243ce67…` (mascote falando, botão bloqueado), `ev_a67f0098…` (rede com corpos de CSS/JS públicos), `ev_bbc9645d…` (`/learn` sem conta).
- Reaproveitadas da investigação de 19/10/2026 (`docs/analise-duolingo.md`): capturas `07`–`17` da trilha e da lição.

### O que foi observado
| Tema | Observação | Fonte |
|---|---|---|
| Acesso a `/learn` | Sem conta, `/learn` redireciona para a home pública. A trilha foi analisada pelas capturas de 19/10 (fluxo de visitante). | `r01-learn-sem-conta-redireciona-home.png`, `15-trilha-learn-desktop.png` |
| Botões | Volume por "lábio" inferior: `border-width: 2px 2px 4px` e `--lip-width: 4px`; no `:active` o botão desce `translateY(lip)` e o lábio some. Raio do botão 12 px (também 8/16/50%). | CSS público (`ev_a67f0098…`) |
| Raios | Mais usados: 16 px (46×), 12 px (34×), 56 px (pílulas), 8 px. | idem |
| Durações | Interações curtas: `.1s`–`.2s` (filtro/hover), `.3s`–`.5s` (opacidade, entradas), animações de `.4s ease-in-out`; 111 `@keyframes`. | idem |
| Curvas | Curvas com "ultrapassagem" (mola) para recompensas: `cubic-bezier(.49,.78,.46,1.34)`, `(.35,1.8,.35,.83)`; saída suave `(.22,1,.36,1)`. | idem |
| Brilho/partículas | Variáveis `--sparkle-duration: 0.7s` e animação de "shine" repetida em destaques. | idem |
| Trilha | Nós circulares 3D em zigue-zague (deslocamentos 0 / ±45 / ±70 px), nó atual com anel e balão "COMEÇAR" que flutua, nós bloqueados cinza, baú e troféu como nós especiais, personagem na curva livre, cabeçalho da unidade colorido com botão de guia. | `15-trilha-learn-desktop.png` |
| Lição | Barra de progresso com reflexo; opções com borda 2 px + base 4 px; selecionado em azul; rodapé verde (acerto) ou vermelho (erro) com ícone em círculo branco. | `07`, `08`, `10` |
| Mascote falando | O texto do balão aparece aos poucos e o botão **Continuar fica desabilitado até a fala terminar** (a11y: `button "Continuar" [disabled]` → habilitado ~2 s depois). | `ev_f243ce67…` passos `w0`→`w1` |
| Animações | Arquivos Lottie (`/lottie/splash/*.json`) carregados na home; uma referência a `.riv` (Rive) no JS. Só vistos como arquivos e quadros estáticos (headless). | rede `ev_bbc9645d…`, JS |
| Áudio | O JS público inclui **Howler.js** (`new Howl`, 13 ocorrências) e `AudioContext` (11). **Nenhum arquivo de som foi baixado** no fluxo de visitante e o navegador headless não reproduz áudio. Não é possível afirmar quais sons existem nem em quais eventos tocam. | JS público |

### Limitações
- Sem conta: não foi possível ver a trilha ao vivo nem celebrações reais de fim de lição, desbloqueio ou ofensiva.
- Captura headless: animações vistas como quadros e valores de CSS, não em movimento.
- Áudio **não ouvido**. A única afirmação possível é que o app tem infraestrutura de áudio (Howler/Web Audio).
- Nenhum recurso do Duolingo (CSS, Lottie, sons, ilustrações, mascote) foi copiado; os valores medidos serviram só de referência de proporção e ritmo.

---

## 2. Auditoria do CNH Quest antes da mudança

Stack: React 18 + TypeScript + Vite, CSS global (`src/styles.css`), sem biblioteca de animação nem de ícones (SVG próprios), som sintetizado simples em `src/ui/sound.ts`, mascote Lumi em SVG.

Problemas priorizados (capturas `docs/capturas-cnh-quest/repaginacao/antes-*.png`):
1. **Trilha parecia lista**: nós soltos, sem caminho entre eles, estados concluída/dominada pouco distintos, mascote isolado no fim.
2. **Botões e cartões sem profundidade** consistente (sombras de 2–4 px variadas, sem reflexo nem estados de carregamento).
3. **Emojis misturados com ícones** (🏅 🎯 ⚡ 🔥 🏆), cada um renderizado diferente por sistema.
4. **Feedback** com "✓/✗" de texto, sem animação de entrada, sem reforço de sequência de acertos.
5. **Conclusão** estática: números fixos, avisos em caixas amarelas genéricas.
6. **Som**: 4 efeitos curtos, sem volume, sem prevenção de duplicados, sem controle rápido.
7. **Diálogos** sem animação de saída, sem Esc, sem foco preso.
8. **Celular**: cabeçalho apertado; Progresso estourava a largura por causa do `select` (corrigido nesta repaginação).
9. **Estados vazios** só com texto cinza.

---

## 3. Sistema de design

### Identidade própria
Metáfora de **estrada**: a trilha é uma pista; o trecho já percorrido é asfalto com faixa amarela tracejada (que se move devagar); o resto é pista clara pontilhada. Cabeçalhos com faixa de pedestre decorativa, bandeira quadriculada no fim do mundo. Guia: **Lumi**, o semáforo (personagem original já existente).

### Tokens (`:root` em `src/styles.css`)
- **Cores**: verde "siga" `#22b357` (marca/nós) e `#12883f` (botões com texto branco, contraste ≈ 4,6:1); asfalto `#2b3a48`; amarelo sinalização `#ffc83d`; ouro `#ffb800` (domínio/conquista); laranja `#ff9f1c` (ofensiva, combo); vermelho `#ff5a5f` / `#d93d42` (botão); azul `#1e96f0` / `#1477c4`; roxo `#8b5cf6` (XP, nós especiais). Cada cor tem `-dark` (lábio), `-soft` (fundo) e `-line` (borda).
- **Tipografia**: Nunito 700/800/900. Escala `--fs-display 32`, `--fs-h1 26`, `--fs-h2 19`, corpo 17, pequeno 15, legenda 13. Rótulos de botão e etiquetas em caixa alta com espaçamento .06–.08em.
- **Espaço**: base 4 px (`--s1`…`--s8`).
- **Forma**: raios 20/16/12 px; lábio `--lip: 4px` (botões), 8 px (nós da trilha), 4–5 px (cartões de destaque).
- **Movimento**: `--t-fast 110ms` (pressionar), `--t-med 220ms` (estados), `--t-slow 420ms` (entradas); `--ease-out (.22,1,.36,1)` e `--ease-spring (.34,1.56,.64,1)` para recompensas.

### Componentes e estados
| Componente | Estados |
|---|---|
| `.btn` (verde, azul, amarelo, vermelho, ghost, `sm`, `wide`) | normal com lábio e reflexo · hover (brilho) · pressionado (afunda o lábio) · foco (anel azul) · desabilitado (cinza, vence qualquer cor) · carregando (`aria-busy="true"`, spinner) |
| Nó da trilha | disponível (verde) · **atual** (anel pulsante + balão "Começar/Refazer" flutuando) · concluída (verde + selo ✓) · **dominada** (ouro + coroa) · bloqueada (cinza + cadeado) · especial/revisão (roxo, baú/troféu) · recém-desbloqueada (giro com mola + partículas + som) · recém-dominada |
| Cabeçalho do mundo | ativo (verde) · concluído (ouro + troféu) · bloqueado/em construção (cinza) · anel de progresso % |
| Opção de resposta | normal · hover · pressionada · selecionada (azul + "pop") · correta (verde + quique) · errada (vermelho + tremida) · bloqueada |
| Cartões laterais | ícone em pastilha colorida por tema; "Revisões pendentes" ganha destaque azul quando há pendências |
| Recompensas (conclusão) | ofensiva (laranja) · meta (azul) · conquista (ouro, medalha que balança + brilho que atravessa) |
| Estado vazio (`Empty`) | Lumi pensando + texto, borda tracejada |

---

## 4. Animações implementadas

Tudo em CSS (`transform`/`opacity`, sem bibliotecas novas) mais três ajudantes em `src/ui/hooks.ts` e `src/components/Fx.tsx`.

| Evento | Animação |
|---|---|
| Entrada de telas/abas | sobe 10 px + fade (220 ms); cartões laterais em cascata |
| Trilha | nós "estouram" em sequência (mola, 55 ms entre nós); faixa amarela anda; nó atual pulsa; balão flutua |
| Desbloqueio / domínio | nó gira e cresce com mola + 10 partículas + som `unlock` (só quando o estado muda desde a visita anterior) |
| Mudança de questão | entra pela direita (320 ms); alternativas aparecem em cascata (40 ms) |
| Seleção | "pop" de 2,5% + som `select` |
| Acerto | opção quica; rodapé sobe; ícone gira e cresce com partículas; som `correct` |
| Erro | opção treme; rodapé vermelho; coração "apanha" e o número troca; som `wrong` (grave e curto, sem tom de bronca) |
| Sequência de acertos | selo laranja "N seguidas" sobre a barra (a partir de 2) e "· N acertos seguidos!" no feedback (a partir de 3); som `combo`. Só visual: não muda XP nem progresso |
| Barra de progresso | avança com mola (520 ms) |
| Conclusão | Lumi entra pulando com raios girando; título cresce; blocos de XP/acertos sobem em cascata e **contam até o valor** (com tique de `xp`); recompensas entram depois; confete só quando a lição é dominada |
| Conquista | medalha balança, brilho atravessa o cartão, som `achievement` |
| Diálogos | entrada com mola, **saída animada** (170 ms), Esc fecha, foco preso, foco devolvido |
| Lumi | respira e pisca; `wave` acena; `happy` sorri de olhos fechados; `cheer` pula com sombra e estrelinhas; `think` inclina; `sad` murcha (sobrancelhas de preocupação, nunca brava); luz acesa brilha |
| Simulado | barra de respondidas, cronômetro pulsa nos 5 min finais, troca de questão desliza, resultado conta acertos, barras por módulo crescem, confete na aprovação |

**Redução de movimento**: a regra global já existente (sistema ou ajuste do app) zera durações e atrasos; além disso `useReducedMotion()` desliga confete, partículas e contagem animada (o número aparece direto).

---

## 5. Áudio

`src/ui/sound.ts` é o ponto único. Todos os efeitos são **sintetizados com Web Audio** (nenhum arquivo, nenhum som de terceiros, 0 bytes de download):

| Efeito | Uso | Desenho |
|---|---|---|
| `tap` | navegação, abrir lição, botões de ação | clique curto descendente |
| `select` | escolher alternativa / palavra / meta | duas notas rápidas |
| `correct` | acerto | arpejo Mi–Sol–Dó com harmônico de sino |
| `wrong` | erro | duas notas graves descendentes, suaves |
| `combo` | 3, 5, 7… acertos seguidos | três notas agudas |
| `transition` | "Continuar", iniciar simulado | sopro de ruído filtrado |
| `complete` | fim de lição / simulado reprovado | fanfarra ascendente |
| `xp` | contagem de XP | tique metálico |
| `celebrate` | lição dominada / simulado aprovado | fanfarra em dois tempos |
| `achievement` | conquista nova | arpejo brilhante |
| `unlock` | nova lição liberada | "clique" + subida |

Garantias:
- O `AudioContext` só nasce dentro de `playSound`, que é chamado a partir de cliques/teclas: **nada toca ao abrir a página** e a política de autoplay é respeitada.
- Mesmo efeito repetido em < 90 ms é ignorado (duplo clique, React StrictMode).
- Liga/desliga: `prefs.sound` (já existia e já era persistido) — agora também pelo botão de alto-falante no topo.
- Volume: controle deslizante em Progresso → Ajustes, com pré-escuta; salvo em `localStorage['cnhquest:audio:v1']`, **separado** do progresso para não mexer no modelo de dados.
- Compressor no canal mestre evita picos; aba em segundo plano não toca som; qualquer falha é silenciosa.

---

## 6. Personagem

A Lumi foi mantida e aprimorada (mesma silhueta de semáforo com boné de instrutor): olhos com brilho, boné com botão amarelo, luzes com degradê e brilho, contorno do corpo, novo humor `happy`, braços animados. Uso por situação:

| Situação | Humor |
|---|---|
| Boas-vindas, conceito novo, trilha com lição recomendada | `wave` |
| Acerto/conclusão comum | `happy` |
| Lição dominada, aprovação, mundo concluído | `cheer` |
| Revisão de erros, escolha de meta, estado vazio, simulado | `think` |
| Sair da lição, vidas acabaram, reprovação | `sad` (preocupada e encorajadora — nunca ri do aluno) |

Proposta para próximas fases (não implementada): personagens secundários — um **cone** (atenção/obras), uma **placa de PARE** (regras de preferência) e uma **ambulância** (primeiros socorros) — no mesmo traço (contorno escuro 2,5 px, rosto em visor claro, bochechas rosadas) para guiar mundos específicos.

---

## 7. Arquivos e mudanças estruturais

| Arquivo | Mudança |
|---|---|
| `src/styles.css` | Reescrito: tokens, botões 3D, trilha-estrada, lição, conclusão, simulado, progresso, onboarding, diálogos, responsivo |
| `src/ui/sound.ts` | Novo sistema de áudio (11 efeitos, volume, deduplicação) — mantém a assinatura `playSound(kind, enabled)` |
| `src/ui/hooks.ts` (novo) | `useSound`, `useReducedMotion`, `useCountUp` |
| `src/components/Fx.tsx` (novo) | `Confetti`, `Burst`, `Dialog` (+ `useDialogClose`) |
| `src/components/Lumi.tsx` | Nova arte e humores |
| `src/components/Icons.tsx` | 13 ícones novos (som, coração, coroa, medalha, alvo, relógio, baú, estrada…) |
| `src/components/Exercises.tsx` | Só apresentação: setas SVG, classes de certo/errado no lugar de cores fixas |
| `src/screens/*` e `src/App.tsx` | Novo layout visual, sons e animações. Lógica de sessão, avaliação, XP e progresso intocada |

Pequenas adaptações estruturais (isoladas):
- `LessonPlayer`: contador local `combo` (só exibição) e trava contra avanço duplo no "Continuar".
- `Home`: um `Map` em memória lembra o estado dos nós entre visitas para animar desbloqueios (não é persistido).
- Volume em chave própria do `localStorage` (o modelo `ProgressState` não mudou).

Sem dependências novas. Build: CSS 43,6 kB (9,9 kB gzip), JS 258 kB (80 kB gzip).

---

## 8. Verificação

- Capturas antes/depois via REA em 1280×800 e 390×844: `docs/capturas-cnh-quest/repaginacao/`.
- Corrigido durante a verificação: Lumi "triste" parecia brava; cabeçalho do celular quebrando linha; Progresso estourando a largura no celular; botão azul desabilitado continuava azul.
- Console sem erros nas execuções.
- Testes: 29/29 (`npm test`), incluindo os novos:
  - `src/ui/sound.test.ts`: nenhum `AudioContext` ao carregar ou com som desligado; deduplicação; volume zero silencia; volume salvo fora do progresso.
  - `src/App.test.tsx`: som desligado pelo atalho do topo e persistido; Esc fecha o diálogo de saída sem sair da lição.
  - Os testes existentes de fluxo (onboarding → lição → erro → explicação → persistência → revisão pendente), teclado e simulado continuam passando sem alteração.
