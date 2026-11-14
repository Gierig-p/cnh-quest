# Animações e microinterações — CNH Quest

Análise por leitura do código em 14/11/2026. Foram lidos o briefing, o estado do projeto e os componentes envolvidos. Não executei navegador, servidor, instalação ou teste audiovisual. As durações propostas abaixo são especificações para implementação; fluidez, som e conforto no celular ainda precisam ser avaliados. Só este documento foi criado.

## 1. Diagnóstico

### O que está bom

- **Há uma linguagem comum de movimento.** `src/styles.css:67` define 110, 220 e 420 ms, com curvas de saída e de mola. Botões, alternativas e recompensas já dão respostas visuais claras.
- **Os efeitos são próprios e pequenos.** `src/components/Fx.tsx:7` cria confete em CSS; `src/components/Fx.tsx:59` oferece uma explosão local. Não há dependência de biblioteca ou material de terceiros.
- **A Lumi comunica emoções sem precisar de texto.** `src/components/Lumi.tsx:13` define seis humores; o desenho muda olhos, braços, boca e luz ativa. É uma boa base para celebrar sem exigir leitura adicional.
- **A acessibilidade já tem uma base.** `src/styles.css:178` reduz durações; `src/ui/hooks.ts:18` acompanha a preferência do sistema e o ajuste do app; `useCountUp` mostra o valor final sem contagem no modo reduzido. `Dialog` tem saída imediata nesse modo, em `src/components/Fx.tsx:87`.
- **O resultado já tem uma sequência.** `src/screens/CompleteScreen.tsx:51` encadeia conclusão, celebração e conquista, limpando os temporizadores ao sair. Os números usam o mesmo hook de contagem.

### O que atrapalha

- **O combo muda pouco de personalidade.** Em `src/screens/LessonPlayer.tsx:119`, qualquer resposta correta aumenta a sequência. O chip aparece em 2, o som extra toca nos ímpares a partir de 3 e o texto do rodapé aparece a partir de 3 (`:195`, `:205`, `:321`). Não há diferença visual específica entre 3, 5, 7 e 10; em 10 nem ocorre o som extra atual.
- **Acerto seguido não significa acerto de primeira.** A sequência inclui dica e revisão; já o registro de primeira tentativa usa outras condições (`LessonPlayer.tsx:124`). Isso não é um erro por si só: o problema seria chamar essa sequência de “perfeita” ou sugerir XP extra.
- **Já há bastante movimento simultâneo.** Questão entra em 320 ms (`src/styles.css:410`), alternativas têm entrada própria (`:469`), rodapé sobe, feedback sobe, ícone cresce e há partículas (`:552`–`:560`). Acrescentar celebração sobre tudo isso pode esconder a explicação.
- **Alguns efeitos fogem de transform e opacity.** Barra anima `width` (`src/styles.css:395`); estrada anima `stroke-dashoffset` (`:322`); desbloqueio usa `filter` (`:373`); brilho da Lumi usa filtro (`:663`); brilho de conquista anima `left` (`:631`). São candidatos a revisão antes de aumentar a quantidade de efeitos. Não há medição que prove lentidão neste aparelho.
- **Há ciclos decorativos contínuos.** Estrada, indicação da próxima lição, respiração, luzes, estrelas e raios da conclusão continuam se movendo. Eles competem com a leitura e mantêm trabalho gráfico depois da recompensa inicial.
- **Domínio e perfeição compartilham a celebração.** `CompleteScreen.tsx:47` define `good` por domínio e `:75` usa confete nesse caso. Não existe uma cena exclusiva de perfeição. O texto “Nenhum erro” depende de `missed.length` (`:133`), mas isso sozinho não identifica perfeição: uma dica pode tirar o acerto de primeira sem adicionar erro.
- **O som atrasado do combo não tem limpeza local.** O `setTimeout` em `LessonPlayer.tsx:122` pode tocar depois de avançar ou sair. A deduplicação de 90 ms em `src/ui/sound.ts` impede repetições muito próximas do mesmo efeito, mas não impede sobreposição entre sons diferentes.
- **O desbloqueio merece verificação do ciclo React.** `src/screens/Home.tsx:32` guarda estados em memória e `:107` calcula mudanças entre visitas. Isso evita precisar de persistência nova, mas a implementação futura deve garantir que o evento de celebração não desapareça num novo render nem se repita ao voltar à aba.

## 2. Propostas

Esforço: **P** = ajuste localizado; **M** = coordenação entre componentes; **G** = cena nova com mais estados. Impacto é uma estimativa para clareza e vontade de continuar, sem pesquisa com usuários.

### 1. Uma celebração por vez, comandada por um evento visual

**O que é:** guardar em `LessonPlayer` um evento temporário como `{ id, tier }`, separado de `combo`. O identificador pode combinar índice da etapa e marco. Disparar somente em 3, 5, 7 e 10; demais acertos mantêm feedback normal e chip. Depois de 10, atualizar só o número. Se a pessoa errar e construir outra sequência, os marcos podem aparecer novamente.

Preservar a regra atual: dica e revisão continuam contando na sequência visual; cartões de conceito não aumentam nem zeram o combo. Erro zera silenciosamente. Sem novos pontos, vidas ou campos salvos. A lição perfeita tem condição separada, descrita na proposta 6.

**Por que ajuda:** a pessoa entende “estou acertando em sequência” sem aprender outra regra ou esperar uma festa a cada resposta.

**Esforço:** M. **Impacto:** alto. **Arquivos:** `src/screens/LessonPlayer.tsx`, `src/components/Fx.tsx`, `src/ui/sound.ts`, `src/ui/hooks.ts`.

**Risco/regra:** dupla verificação por Enter ou correção automática de pares não pode gerar dois eventos. Proteger a verificação já respondida, emitir fora dos atualizadores de estado e cancelar evento, animações e temporizadores ao continuar, errar, abrir diálogo ou desmontar a tela. Nenhum efeito deve atrasar `Continuar`.

### 2. Escada de combo com desenhos diferentes

**O que é:** quatro pequenos momentos com a metáfora de estrada. Toda a cena fica numa área reservada junto ao topo ou ao feedback, sem cobrir pergunta, fonte ou botão. O título é curto e o número permanece no chip depois que a cena termina.

Curvas: **saída** = `cubic-bezier(.22,1,.36,1)`; **mola** = `cubic-bezier(.34,1.56,.64,1)`; **suave** = `cubic-bezier(.4,0,.2,1)`; deslocamento constante usa `linear`. Os tempos abaixo começam na confirmação da resposta, sem espera artificial. O feedback pedagógico aparece imediatamente.

| Marco | Visual e movimento | Duração e curva | Som proposto | Movimento reduzido |
|---|---|---|---|---|
| 3 — “3 acertos seguidos!” | Só o chip faz uma pequena expansão: escala .90 → 1.06 → 1. A Lumi e a barra ficam quietas. | 280 ms, mola; estados em 0%, 60%, 100%. | Mi5–Sol5, notas iniciadas em 0/70 ms, cauda até 210 ms. | Chip estático com o número; texto permanece no feedback; mesmo som se habilitado. |
| 5 — “5 acertos seguidos!” | Lumi pequena sorri e levanta um braço uma vez; braço gira 0 → −12° → 0. Uma camada de luz verde sobe em opacidade .35 → .8 → .35, sem alternância rápida de cores. | 520 ms, suave; pico em 45%. | Sol5–Dó6, inícios 0/90 ms, término em 270 ms. | Lumi sorrindo e luz verde estáticas; sem aceno nem pulso; mesmo som opcional. |
| 7 — “7 acertos seguidos!” | Uma faixa clara percorre a camada de brilho da barra; 6 partículas saem ao redor do chip em raios de 24 px, encolhendo 1 → .3 e apagando. Não se move a tela. | Faixa: 600 ms, linear, de antes da borda esquerda até depois da direita; partículas: 450 ms, saída, opacidade 1 → 0. | Sol5–Dó6–Mi6, inícios 0/80/160 ms, término em 360 ms. | Barra com destaque estático e número; sem faixa móvel ou partículas; mesmo som opcional. |
| 10 — “10 acertos seguidos!” | Carrinho original percorre uma miniestrada horizontal de 96 px ao lado da Lumi; leve inclinação de −3° volta a 0 no fim. O texto entra de baixo, 8 px → 0, com escala .96 → 1. | Cena: 900 ms. Texto entra em 180 ms, saída; permanece 540 ms; sai por opacidade em 180 ms. Carro anda entre 100–720 ms, suave; cena apaga entre 720–900 ms. | Dó6–Mi6–Sol6, inícios 0/90/180 ms, término em 440 ms. Sem ruído de motor. | Carro estacionado, Lumi feliz e texto fixos durante o feedback; sem deslocamento ou desaparecimento automático da mensagem. |

As notas são uma sugestão de composição própria: onda senoidal/triangular e envelope curto, usando a infraestrutura existente. O som do marco **substitui** `correct` naquele acerto, em vez de tocar por cima. A subida de tom não aumenta o volume. O modo reduzido mantém a preferência de som independente da preferência de movimento.

**Por que ajuda:** cada marco é reconhecível pelo gesto e pela forma, mesmo para quem lê devagar. As mensagens não exigem conhecer a palavra “combo”.

**Esforço:** M para 3/5/7; G incluindo o carrinho de 10. **Impacto:** alto. **Arquivos:** `src/screens/LessonPlayer.tsx`, `src/components/Fx.tsx`, `src/components/Lumi.tsx`, `src/components/Icons.tsx`, `src/styles.css`, `src/ui/sound.ts`.

**Risco/regra:** não apresentar as luzes como uma aula sobre a ordem do semáforo. Usar apenas verde na celebração, sem flashes. O carro é decorativo e não altera a porcentagem real. Cancelar a cena ao avançar; em lições curtas, chegar a 10 não precisa ser possível.

### 3. Barra que avança com firmeza e brilho leve

**O que é:** trocar a animação de largura por preenchimento de largura fixa com `transform-origin: left` e `scaleX(ratio)`, em 420 ms com curva de saída. Evitar mola no avanço para não sugerir progresso além do valor real. Manter o cálculo de `progressRatio` e os atributos ARIA existentes.

A faixa do marco 7 fica em camada irmã, recortada numa moldura arredondada, para não deformar junto do preenchimento. Seu gradiente é estático; só a posição por `translateX` e a opacidade mudam. Não usar fogo contínuo. O chip fica fora da moldura para não ser cortado.

**Por que ajuda:** mostra avanço de maneira previsível, sem aparência de recuo ou de pontos extras.

**Esforço:** P/M. **Impacto:** médio. **Arquivos:** `src/screens/LessonPlayer.tsx`, `src/styles.css`.

**Risco/regra:** hoje a barra mostra no mínimo 4% visualmente; preservar essa convenção explicitamente ou revisar apenas a apresentação, sem mudar o valor acessível nem o motor. Arredondamento e reflexo podem deformar com `scaleX`; separá-los em camadas estáticas. No modo reduzido, aplicar o valor final imediatamente.

### 4. Lumi reage uma vez e depois deixa a pessoa ler

**O que é:** manter os humores atuais e adicionar uma classe temporária para o marco, sem transformar todos os `happy` em celebração. Acerto comum: sorriso estático; marco 5: aceno; conclusão: um salto de 650 ms, em vez de três. Trocar o filtro da luz por uma pequena camada verde de brilho pronta, com opacidade animada uma única vez. Remover ciclos de estrelas e raios depois da entrada.

**Por que ajuda:** a mascote reforça a resposta e depois devolve a atenção ao conteúdo. O erro continua acolhedor, sem novo tremor.

**Esforço:** M. **Impacto:** médio. **Arquivos:** `src/components/Lumi.tsx`, `src/styles.css`, `src/screens/LessonPlayer.tsx`, `src/screens/CompleteScreen.tsx`.

**Risco/regra:** animar o braço num grupo separado do corpo; dois efeitos não podem disputar o mesmo `transform`. No modo reduzido, manter a pose final e o sorriso, sem salto, respiração, pulso ou giro. Não depender só de verde/vermelho para comunicar o resultado.

### 5. Transição curta entre questões, com explicação parada

**O que é:** aproveitar o `key={s.index}` de `LessonPlayer.tsx:219` para uma única entrada: 180 ms, curva de saída, `translateX(12px)` → 0 e opacidade 0 → 1. Retirar a entrada em cascata das alternativas nessa tela. Ao verificar, deixar o texto da explicação parado; animar só o ícone por 180 ms e usar uma entrada de opacidade no conjunto do rodapé.

**Por que ajuda:** a pessoa percebe a troca e pode começar a ler sem acompanhar várias peças se movendo.

**Esforço:** P. **Impacto:** alto. **Arquivos:** `src/styles.css`, `src/screens/LessonPlayer.tsx`.

**Risco/regra:** preservar remontagem dos exercícios, eventos de pares e nomes `Verificar`/`Continuar`. Manter foco no botão após conferir; ao avançar, dar contexto à nova questão com foco programático no título, sem duplicar anúncio do enunciado. Em movimento reduzido, troca imediata, sem deslocamento nem atraso. Diálogos mantêm sua gestão de foco.

### 6. Lição perfeita tem um final próprio

**O que é:** separar a cena perfeita da celebração de domínio. Usar `result.completed && result.total > 0 && result.correctFirstTry === result.total`, alinhado a `src/engine/progress.ts:288`, sem alterar XP ou conquista. Usar “Todos os acertos de primeira!” no destaque; esse texto não deve aparecer apenas por `missed.length === 0`.

Cena de 1.200 ms: Lumi dá um salto de 10 px entre 0–600 ms, curva de saída; um selo com estrela entra por escala .85 → 1 nos primeiros 240 ms, mola; 18 confetes locais percorrem até 80 px e apagam entre 150–1.000 ms, saída; os raios entram por opacidade nos primeiros 220 ms e ficam estáticos. Selo e título permanecem ao fim. Não somar o confete padrão de 44 peças.

Som: reutilizar `celebrate` como assinatura da perfeição, uma vez na entrada, substituindo a dupla `complete` + `celebrate` nesse caso. Conquista pode soar depois de 1.600 ms, se a tela continuar ativa. Se o marco 10 ocorrer na última pergunta, ele acontece no feedback; ao continuar, é cancelado antes da conclusão.

No modo reduzido: Lumi em pose alegre, selo e mensagem estáticos, sem partículas ou raios girando; áudio opcional. Lição dominada sem perfeição mantém uma celebração mais simples. Concluir abaixo do domínio também recebe acolhimento e um próximo passo claro.

**Por que ajuda:** deixa claro o que foi especial sem desvalorizar quem precisou de ajuda.

**Esforço:** M. **Impacto:** alto. **Arquivos:** `src/screens/CompleteScreen.tsx`, `src/components/Fx.tsx`, `src/styles.css`.

**Risco/regra:** uma dica impede perfeição mesmo sem erro; prática avulsa pode não ter `outcome`. Não inferir bônus onde ele não existe. O botão de saída fica utilizável desde a entrada, sem esperar os 1.200 ms.

### 7. Trilha mais quieta e desbloqueio que aponta o próximo passo

**O que é:** deixar as faixas da estrada estáticas; limitar a indicação da próxima lição a dois pulsos suaves de 700 ms. No desbloqueio real, usar um anel separado: escala .9 → 1.12 e opacidade .7 → 0 em 500 ms, saída; o nó entra em 360 ms, mola, escala .92 → 1. Sem filtro, rotação ou tremor. Usar 6 partículas locais, no máximo, e som `unlock` uma vez. “Disponível” continua legível depois.

**Por que ajuda:** mostra onde tocar e reduz o ruído visual da trilha inteira.

**Esforço:** M. **Impacto:** alto. **Arquivos:** `src/screens/Home.tsx`, `src/styles.css`, `src/components/Fx.tsx`.

**Risco/regra:** preservar `lessonState` e o desbloqueio só após todas as rodadas. Capturar a mudança num evento estável antes de atualizar `seenState`; consumi-lo uma vez. Primeira visita não é desbloqueio novo. Sem rolagem automática ou mudança de foco para um nó distante. No modo reduzido, etiqueta e estado finais imediatos; nenhum pulso ou partícula.

### 8. XP com leitura estável e menos sons

**O que é:** manter `useCountUp`, mas contar só XP, por 650 ms após 200 ms de entrada. Mostrar acertos e quantidade de questões já nos valores finais. Reservar espaço para o número completo e manter algarismos tabulares. Tocar `xp` uma vez no fim da contagem, coordenado com os outros sons; suprimir se coincidir com a assinatura de perfeição.

O texto acessível contém o total final desde o início. A contagem decorativa fica com `aria-hidden`, sem anúncio de cada valor intermediário. Movimento reduzido mostra o valor final imediatamente e dispensa o som de contagem.

**Por que ajuda:** ensina o ganho sem fazer três números mudarem enquanto a pessoa tenta entendê-los.

**Esforço:** P. **Impacto:** médio. **Arquivos:** `src/screens/CompleteScreen.tsx`, `src/ui/hooks.ts`, `src/styles.css`.

**Risco/regra:** nunca recalcular XP no componente; usar `outcome.xpGained`. Contagem textual é uma exceção consciente ao movimento por transform/opacity: muda texto num único cartão por tempo curto. Atualizar apenas quando o inteiro mudar, sem ler medidas a cada quadro.

### 9. Orçamento de efeitos e modo reduzido com a mesma informação

**O que é:** limitar os novos movimentos a `transform` e `opacity`, com CSS para cenas simples e Web Animations API quando for útil cancelar uma sequência. Limite proposto: até 6 partículas no combo, 18 na perfeição, uma cena ativa por vez e nenhuma camada decorativa permanente promovida à GPU.

Implementação no código atual:

1. Extrair de `Fx.tsx` um `ComboCelebration` pequeno, com classe por marco e evento como chave. Configurações guardam duração, quantidade e som. Elementos decorativos usam `aria-hidden` e `pointer-events: none`.
2. Preferir keyframes CSS com começo/fim explícitos. Se usar `element.animate`, guardar os objetos `Animation` em refs e chamar `cancel()` ao avançar, sair, ocultar a página ou mudar a preferência. Sem suporte à API, mostrar a pose final; não criar dependência.
3. Limpar temporizadores e desmontar partículas ao final. Ouvir o fim da animação com alternativa por temporizador; no modo reduzido, não esperar `animationend`. Cancelar tudo também ao desmontar. Não deixar promises de animação cancelada sem tratamento.
4. Parar os ciclos atuais da estrada e os filtros animados. Trocar o brilho que anima `left` por uma faixa fixa movida via `translateX`. Para anéis SVG, manter os traços finais estáticos e celebrar com um grupo sobreposto por escala/opacidade; não animar `stroke-dasharray`.
5. Aplicar `will-change` só durante o efeito e removê-lo no fim. Usar tokens de cor existentes nos novos elementos; sombra, gradiente e borda podem existir estaticamente, mas não variar quadro a quadro. Não medir layout em cada quadro nem atualizar estado React para mover partículas.
6. Consultar `useReducedMotion` antes de criar efeitos. CSS global de 1 ms continua como proteção, mas não substitui a apresentação estática: uma cena que termina invisível não deve levar consigo a informação do marco. Respeitar a precedência atual dos ajustes `system/reduce/full` sem alterar preferências salvas.
7. Incorporar o marco à mensagem de feedback existente, em vez de abrir outra região de anúncio concorrente. Rever `aria-live="assertive"` em `LessonPlayer.tsx:313` para anúncio educado de feedback comum; nenhuma partícula ou contagem deve ser anunciada. Preservar integralmente explicações e fontes.

**Por que ajuda:** conserva clareza e controles rápidos em aparelhos modestos e para pessoas sensíveis ao movimento.

**Esforço:** M. **Impacto:** alto. **Arquivos:** `src/components/Fx.tsx`, `src/styles.css`, `src/ui/hooks.ts`, `src/screens/LessonPlayer.tsx`, `src/screens/Home.tsx`, `src/screens/CompleteScreen.tsx`.

**Risco/regra:** transform/opacity não garantem fluidez por si só; muitas camadas grandes ainda custam memória e composição. Esses limites são ponto de partida, não resultado de benchmark. O plano usa apenas memória temporária; não exige backend, biblioteca ou mudança no armazenamento.

## 3. Top 3

1. **Organizar os eventos e a escada de combo (propostas 1 e 2).** Atende diretamente ao pedido, preserva a sequência atual e resolve sons atrasados e festas repetidas. Começar por 3/5/7; adicionar o carrinho depois da base estar estável.
2. **Simplificar o movimento durante a leitura (propostas 5 e 9).** Torna o ganho de animação compatível com a prioridade de ensinar. Reduz efeitos concorrentes e estabelece o modo reduzido antes de ampliar as cenas.
3. **Separar perfeição de domínio (proposta 6).** Dá um final especial e coerente com as regras existentes, incluindo o efeito da dica, sem mudar recompensas.

### Como verificar numa futura implementação

Nesta entrega não rodei testes: não houve mudança funcional. Quando implementar, verificar com testes de estado/interface: marcos 3/5/7/10 uma vez por evento; sequência reiniciada após erro; dica e revisão preservando a semântica atual; cartões sem quebrar combo; pares e Enter sem duplicação; avanço/saída cancelando som e efeito; modo reduzido desde a entrada e alterado durante a cena; perfeição com total positivo e todos os acertos de primeira; dica impedindo selo perfeito; desbloqueio só após todas as rodadas. Rodar a suíte existente e a checagem TypeScript.

Uma etapa posterior, fora das restrições desta análise, deve avaliar em celular real o som ligado/desligado, tema claro/escuro, foco e leitor de tela, viewport estreito, texto ampliado, toque rápido em Continuar e duração dos quadros. Só essa observação poderá confirmar conforto e desempenho; capturas estáticas não bastam.

## 4. O que NÃO fazer

- Não copiar sons, ilustrações, Lottie ou movimentos distintivos do Duolingo. A estrada, a Lumi e o sintetizador próprio já oferecem identidade.
- Não adicionar fogo contínuo, flashes de luz, tremor da tela inteira ou vibração automática. O marco 7 pode brilhar sem simular um alerta.
- Não fazer o carro percorrer a trilha inteira nem mover automaticamente a página. Isso tira o ponto de leitura e exigiria uma cena mais cara e difícil de acompanhar.
- Não retirar XP, mostrar “perdeu tudo” ou fazer a Lumi reprovar a pessoa quando o combo termina. A sequência simplesmente recomeça.
- Não transformar combo em bônus ou modificar vidas, progressão, conteúdo, respostas ou fontes neste trabalho.
- Não esconder explicação nem bloquear Continuar até terminar a festa. A animação acompanha o ritmo da pessoa.
- Não depender de áudio, cor ou movimento para informar o marco. Número e frase simples continuam disponíveis.
- Não chamar domínio de perfeição, nem usar ausência de erros como substituto do critério de acerto de primeira.
- Não animar largura, posição por `left/top`, filtro, sombra ou traços SVG para as novas cenas. Não instalar uma biblioteca para quatro celebrações pequenas.
- Não prometer 60 fps, retenção maior ou acessibilidade comprovada sem medição e uso real.
