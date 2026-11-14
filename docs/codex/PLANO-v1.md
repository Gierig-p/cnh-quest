# Plano de melhorias do CNH Quest (v1, rascunho do Claude)

Este plano junta as cinco análises em `docs/codex/respostas/01..05`. Ainda não foi aprovado pelo dono do projeto.

**Objetivo do dono:**
1. Qualquer pessoa consegue aprender as leis de trânsito de forma simples.
2. O app dá vontade de voltar todo dia.
3. Animações melhores e uma escada de celebrações nos acertos seguidos, no estilo do Duolingo.

**Saúde de hoje (14/11):**
- `npm test` passa: 61/61, rodado pelo Claude. No sandbox do Codex ele não rodou.
- `tsc` está ok.
- Há 22 arquivos modificados e 6 novos em `src/` sem commit, que são o trabalho de 01/11.

## Princípio que guia tudo

**Primeiro clareza, depois festa.**
- Cada tela tem uma ação óbvia.
- A celebração é curta, não cobre a explicação e não segura o "Continuar".
- Nenhuma regra de XP, Leitner, desbloqueio, conteúdo legal ou simulado muda sem um pedido explícito. As propostas que mudam regras estão marcadas com **[DECISÃO]**.

---

## Fase 0: fechar a base (pré-requisito)

1. Revisar o diff pendente e garantir que os arquivos novos (`review.ts`, `hints.ts`, `glossary.ts`, `TermText.tsx` e os testes) entrem juntos.
2. Fazer o commit só quando o dono pedir. O push publica o site.
3. Colocar `.codex/` (os logs) no `.gitignore`.

## Fase 1: correções de bugs encontrados na análise (P, sem mudar regra de produto)

1. **`check` sem trava:** clicar duas vezes, apertar Enter e a verificação automática dos pares podem verificar duas vezes. Adicionar uma trava por item (`LessonPlayer.tsx:115`).
2. **Timers soltos:** o som atrasado do combo e o timer de vida podem tocar depois de sair da lição. Limpar no unmount (`LessonPlayer.tsx:122`, `:131`).
3. **Acessibilidade de teclado:**
   - Depois da dica, o rádio de índice 0 pode estar desabilitado e o Tab pula o grupo inteiro (`Exercises.tsx:108`).
   - Os atalhos 1–9 continuam ativos atrás de um diálogo aberto (`Exercises.tsx:83`).
   - Nos pares, o anúncio fica preso na mensagem anterior (`Exercises.tsx:379`).
4. **Ofensiva vencida:** o topo mostra uma sequência antiga mesmo depois de dias sem estudar (`Panels.tsx:11`). Mostrar 0 e a mensagem "Bom ter você de volta", mantendo o recorde. É só exibição, a regra não muda.
5. **Texto do Leitner:** a tela promete revisão em 16 dias, mas a caixa 5 nunca volta à fila (`progress.ts:129`, `ReviewScreen.tsx:24`). Corrigir só o texto. **[DECISÃO]**: ou fazer a caixa 5 voltar.
6. **Prática avulsa:** a meta diária pode ser cumprida sem conceder a conquista "meta-diaria" (`App.tsx:88`).

## Fase 2: "começar sem pensar" (simplicidade)

1. **Cartão "Hoje"** no topo da Home, antes da estrada:
   - uma ação só: "Revisar N questões" se houver revisão vencida; se não, "Continuar: <nome da lição>";
   - a meta em texto simples;
   - depois de cumprida, a mensagem "Seu estudo de hoje está feito. Pode parar por aqui";
   - reutiliza `lessonState` e `dueQuestions`, sem lógica nova de progressão.
2. **Onboarding mais leve:** a meta já vem selecionada ("pode trocar depois") e o aviso legal fica recolhido em "Saiba mais".
3. **Trilha mais quieta:**
   - os mundos em construção ficam recolhidos em "Ver todos os assuntos";
   - XP passa a se chamar "pontos" nos textos de apoio.
4. **Instrução curta na primeira vez de cada tipo de exercício**, por sessão. Exemplos: "Toque em uma resposta e depois em Verificar", "Toque em um item de cada lado".
5. **Cartão de conceito em partes**, com "Parte 1 de 3":
   - só muda a apresentação, o conteúdo é o mesmo;
   - o cartão conta como visto só no fim;
   - testar primeiro nos cartões mais longos.
6. **Correção em camadas:**
   - "certo/errado + por que" fica visível;
   - "Ver explicação completa" abre a explicação, o lembrete e a fonte;
   - acaba a segunda rolagem de 34vh.
7. **"Ver a explicação de novo"**, depois de responder: reabre o cartão que ensina a questão (usa `hints.ts`). Só nas lições comuns.

## Fase 3: animações e a escada de combo (o pedido central)

**Arquitetura:**
- `src/ui/celebration.ts`: uma função pura que diz qual marco cada combo atinge.
- `src/ui/useCelebration.ts`: controla o evento atual, o id único (sessão e índice), o cancelamento de timers e animações e a preferência de movimento e som.
- `src/components/Celebration.tsx`: só apresenta. É `aria-hidden`, tem `pointer-events:none` e não tira o foco.

**Regras do combo:**
- O combo continua só visual: sem XP e sem mudança no progresso.
- Dica e revisão continuam contando, como hoje.
- Cartões não contam nem zeram.
- Errar zera o combo em silêncio, sem a Lumi triste.

**Escada (as durações e os sons estão detalhados em `respostas/03_animacoes.md`):**

| Marco | Visual | Som | Movimento reduzido |
|---|---|---|---|
| 3 | O chip pulsa (280 ms, mola) e aparece "3 seguidas!" | 2 notas subindo, no lugar do `correct` | Chip e texto estáticos |
| 5 | A Lumi acena, a luz verde acende uma vez e a barra ganha brilho (520 ms) | 2 notas, um tom acima | Lumi sorrindo, parada |
| 7 | Uma faixa de luz percorre a barra e 6 faíscas saem do chip | 3 notas | Barra destacada, parada |
| 10 | Um carrinho original atravessa uma mini-estrada e aparece "10 seguidas! Em ritmo de estrada" (900 ms) | 3 notas, mais agudas | Carrinho parado e texto |
| 15, 20... | Repete o 10 com o número | Igual ao 10 | Igual ao 10 |
| Lição perfeita (todos os acertos de primeira, `correctFirstTry === total`) | Final próprio na tela de conclusão: selo com estrela, a Lumi pula, 18 confetes (1,2 s) e "Todos de primeira!" | `celebrate` | Selo e texto estáticos |

**Junto com a escada:**
- A barra de progresso passa a usar `scaleX` em vez de `width`.
- A transição entre questões fica em 180 ms, sem cascata nas alternativas.
- A explicação fica parada.
- O desbloqueio na trilha usa um anel (500 ms) e o som `unlock`. As faixas da estrada ficam paradas e a próxima lição pulsa 2 vezes.
- Na conclusão, só o XP conta, em 650 ms, e os outros números aparecem prontos.
- Os ciclos decorativos contínuos (raios, estrelas, filtros animados) param depois da entrada.

**Orçamento:**
- só `transform` e `opacity`;
- uma celebração por vez;
- no máximo 6 partículas no combo e 18 na lição perfeita;
- nenhuma biblioteca nova.

**Testes:**
- marcos disparados uma vez só;
- Enter e os pares não duplicam;
- sair cancela o som;
- movimento reduzido;
- XP, domínio e Leitner iguais com a celebração ligada e desligada.

## Fase 4: hábito ético ("quero voltar amanhã")

1. **Fechar o dia na tela de conclusão:** quando a meta é batida, a mensagem "Por hoje está ótimo" e "Sua próxima revisão: amanhã/dia X" (a data real do Leitner, se existir).
2. **Progresso honesto, "Estou pronto para a prova?"**, na aba Progresso:
   - os 4 módulos, cada um como "ainda sem conteúdo", "começou" ou "praticado";
   - as últimas notas do simulado;
   - um aviso de que o banco ainda não cobre tudo;
   - nunca uma porcentagem de chance de passar.
3. **Uma missão diária**, como sugestão ("Conclua uma revisão" ou "Faça a próxima rodada"), sem moeda e sem punição. **[DECISÃO]**: se dá XP extra.
4. **Novos marcos de conquista:** "Primeira revisão concluída" e "Voltou a estudar". **[DECISÃO]**: são conquistas novas.
5. **Uma pausa grátis por semana** na ofensiva. **[DECISÃO]**: muda a regra de ofensiva.
6. **O simulado contar como dia estudado.** **[DECISÃO]**.
7. **Data da prova (opcional)** e exportar um lembrete `.ics` para o calendário do celular. Não prometer notificação com o site fechado.
8. **Pequena surpresa:** de vez em quando, uma fala ou pose diferente da Lumi no fim. Sem baú, roleta ou moeda.

## Fase 5: acessibilidade e leitura

1. **Contraste:**
   - corrigir `--text-3` (3,49:1);
   - branco sobre verde (2,74:1) e sobre dourado (1,73:1);
   - `--green-ink` sobre `--green-soft` (3,52:1).
2. **Letra grande** em Ajustes, com corpo de 19–20 px. **[DECISÃO]**: salvar como preferência, o que adiciona um campo opcional.
3. **Ordenar:** arrastar só pela alça, para não bloquear a rolagem. As setas ficam, e o leitor de tela anuncia "posição 2 de 4".
4. **"Ouvir texto" (Web Speech API):**
   - primeiro um protótipo, só se a voz pt-BR for boa nos aparelhos;
   - toca só quando a pessoa pedir;
   - não lê a resposta antes de ela responder.
5. **Fonte Nunito local** (licença OFL), para não depender do Google Fonts.

## Fora deste plano (conteúdo, prioridade separada)

O fator que mais pesa para "aprender para a prova" é o **conteúdo que falta**: Mundos 3–8 (infrações, primeiros socorros, meio ambiente). O plano acima não substitui isso. Sugestão: alternar uma fase de experiência e um mundo novo.

## Ordem sugerida

0 → 1 → 3 (o pedido central, as animações) → 2 → 4 → 5, com um commit por fase e aprovação do dono em cada uma.
