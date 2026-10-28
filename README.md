# CNH Quest

Aplicativo web para aprender o conteúdo da prova teórica do DETRAN (1ª habilitação, categorias A e B) em lições curtas e gamificadas.

**Acesse:** https://gierig-p.github.io/cnh-quest/ · Estado atual e próximos passos: [`docs/ESTADO-DO-PROJETO.md`](docs/ESTADO-DO-PROJETO.md)

## Como rodar

Requisitos: Node.js 20 ou mais recente (testado com Node 24.22 e npm 11.19).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes automatizados (conteúdo, motor, interface)
npm run build      # build de produção em dist/
npm run preview    # serve o build em http://localhost:4173
```

## O que já funciona (versão 0.1)

- **Trilha** com o Mundo 1 "Começando no trânsito": 3 lições + revisão do mundo, com desbloqueio em sequência.
- Cada mundo e lição mostra o **módulo de referência** (1 Sinalização de trânsito · 2 Escolhas e consequências · 3 Direção defensiva · 4 Cuidado com a vida e o meio ambiente). Essa divisão é organização própria do app (`src/content/referenceModules.ts`; origem dos nomes em `docs/matriz-conteudo-detran.md`, seção 3b).
- **5 tipos de exercício**: escolha (texto, placa ou cena), identificar placa em grade, verdadeiro/falso, completar lacuna com banco de palavras, ordenar e associar pares.
- **Feedback pedagógico**: resposta correta, por que está correta, por que a alternativa escolhida está errada, frase para memorizar e fonte legal com link.
- **Revisão de erros** no fim da lição (cada erro volta até 2 vezes).
- **Gamificação**: XP, nível, meta diária, ofensiva de dias, 7 conquistas, celebração na conclusão e mascote Lumi com expressões.
- **Personalização**: desempenho por assunto (aponta assuntos fracos mesmo com média alta), repetição espaçada (caixas de Leitner: 1, 2, 4, 8, 16 dias) e treino por assunto.
- **Simulado**: regra nacional (Res. CONTRAN 1.020/2025: 30 questões, 20 acertos, 60 min) ou a regra que a página do DETRAN-PE ainda mostra (21 acertos), cronômetro, navegação entre questões, resultado por módulo de referência (acertos, % e barra, com detalhe por assunto) e erros explicados.
- **Persistência** em `localStorage`: o progresso sobrevive a recarregar a página.
- **Acessibilidade**: teclado (1–9 escolhe, Enter verifica/continua), foco visível, `radiogroup`, feedback com ícone e texto (não só cor), redução de movimento (sistema ou ajuste do app).
- **Responsivo**: barra lateral no desktop e navegação inferior no celular.

## Estrutura

```
src/
  content/   dados: tipos, fontes oficiais, Mundo 1, validador e testes de integridade
  engine/    regras puras: sessão de lição, correção, progresso/XP/ofensiva, simulado
  storage/   persistência (interface ProgressStore + localStorage)
  state/     estado global React
  components/ placas (SVG), cenas, mascote, exercícios, ícones
  screens/   trilha, lição, conclusão, revisão, simulado, progresso, boas-vindas
docs/        investigação do Duolingo, matriz de conteúdo, plano técnico, capturas
```

Para trocar `localStorage` por um servidor, implemente outra `ProgressStore` (`src/storage/progressStore.ts`). Não há login nesta versão.

## Conteúdo e fontes

Toda questão tem fonte (`src/content/sources.ts`), dispositivo exato (artigo do CTB ou item do MBST), data de verificação e estado de revisão. `npm test` falha se houver id duplicado, questão sem resposta correta, alternativa errada sem explicação, fonte inexistente ou lição com módulo de referência que não bate com o assunto das suas questões. Para achar as questões afetadas por uma mudança de lei: `questionsBySource(QUESTIONS, 'ctb', 'art. 29')`.

As questões são originais. Não são as questões aplicadas pelo DETRAN.

## Problemas conhecidos

- Só o Mundo 1 tem conteúdo (23 questões). Os mundos 2 a 8 aparecem como "em construção".
- O simulado tem 14 questões no formato oficial. Até o banco chegar a 30, ele usa todas, com nota mínima e tempo proporcionais, e avisa isso na tela.
- A distribuição oficial das 30 questões por assunto não foi publicada; o simulado alterna os módulos.
- Os sons são efeitos sintetizados próprios (11 efeitos, com volume). Não há narração.
- Progresso só no navegador atual (sem conta e sem sincronização).
- Sair de uma lição no meio descarta a sessão (as respostas já dadas ficam no histórico).
