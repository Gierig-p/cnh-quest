# Pedido 09: Um jeito fácil de rever os vídeos e os resumos dos conceitos

Leia `docs/codex/BRIEFING.md` e siga as regras dele, inclusive as restrições de execução: não rode navegador, servidor nem Vite, e não altere nenhum arquivo. Pode rodar `npx tsc --noEmit -p .`. A sua resposta final (a última mensagem) é gravada automaticamente; não precisa salvar arquivo.

**Seu papel:** designer de UX e pedagogo (aprendizagem de adultos leigos e de pouca escolaridade, no celular). É um **planejamento**: você analisa e propõe, e quem implementa é o Claude depois que o dono aprovar.

## O pedido do dono (nas palavras dele, resumido)
> "Os vídeos de cada conceito ficaram perfeitos. O usuário pode esquecer as explicações e eu queria um jeito fácil de ele rever. Uma ideia: junto com Trilha, Revisar, Simulado e Progresso, uma aba **Conceitos**, que mostra os vídeos e o resumo de cada conceito aprendido até o ponto atual da trilha. Outra ideia: ao lado de cada estágio da trilha, uma opção para rever os vídeos dos conceitos daquele estágio. O que seria mais intuitivo? Qual a melhor função?"

## Como é hoje (confira no código)
- Navegação com 4 abas em `src/App.tsx:27-30` (Trilha, Revisar, Simulado, Progresso), na barra lateral e na barra de baixo no celular.
- Trilha: `src/screens/Home.tsx` (nós das lições, revisão da metade, "Na rua", revisão do mundo).
- Aba Revisar: `src/screens/ReviewScreen.tsx` (prática de questões).
- Cartões de conceito: `src/components/ConceptView.tsx` (`cardParts`, `ConceptBlocks`: blocos `video`, `resumo`, `terms`, `guardar`), com narração (`NarrationButton.tsx`, `src/content/narration.ts`).
- Vídeos: `src/components/VideoConceito.tsx` e `src/components/scenes/Video*.tsx` (animações SVG, não arquivos de vídeo). Os Mundos 1 a 3 já têm vídeo em todos os cartões; o Mundo 4 acabou de ser criado e ainda não tem vídeos.
- Conteúdo dos cartões: `src/content/world1.ts` a `world4.ts`, tipos em `src/content/types.ts`.
- Progresso: `src/engine/progress.ts` (`lessonFinished`, `roundsDone`, `nodeState`...). O progresso fica no `localStorage`.

## Perguntas que o dono quer respondidas
1. **Aba "Conceitos" x botão em cada estágio da trilha x as duas coisas x outra opção** (por exemplo, dentro de "Revisar", ou um botão "Rever a explicação" no feedback de erro da questão). Para cada opção: pontos positivos, pontos negativos e como melhorar.
2. Qual é a **recomendação final** e por quê, pensando em quem tem pouca intimidade com celular. Cinco abas no celular cabem bem?
3. **Quais conceitos aparecem:** só os das lições já feitas? Como mostrar os ainda bloqueados (esconder, cadeado, prévia)? E os cartões sem vídeo (Mundo 4 por enquanto)?
4. **Como organizar a lista:** por mundo e por lição, busca, "assistidos", "favoritos", "os que você mais erra" (há dados de erro por questão e por conceito? confira).
5. **O que a tela de um conceito mostra:** vídeo, resumo, termos, "Para guardar", narração, botão "Praticar este conceito" (questões só daquele conceito, sem mudar regras de XP, revisão ou simulado).
6. **Ligações úteis:** do erro numa questão para o vídeo do conceito, e da revisão para o conceito.
7. Riscos: peso no app (os vídeos são componentes carregados sob demanda?), testes que dependem dos nomes acessíveis, regras de progressão que **não** podem mudar, e acessibilidade (movimento reduzido, leitor de tela).

## Formato
Siga o formato do briefing (Diagnóstico, Propostas com esforço/impacto/arquivos/risco, Top 3, O que NÃO fazer) e acrescente no começo uma **tabela comparando as opções** e a **recomendação em uma frase**. Inclua um esboço em texto (ASCII) da tela recomendada no celular.
