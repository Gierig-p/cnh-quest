# Plano técnico — CNH Quest (fim da Fase A)

## Verificado
- Duolingo: onboarding, tela de exercício, feedback de acerto/erro, vidas, 5 tipos de exercício, revisão de erros, trilha e layout de celular (ver `analise-duolingo.md`).
- Regras do exame pela Res. CONTRAN 1.020/2025, conteúdo pela Portaria SENATRAN 923/2025, CTB arts. 29, 44, 61, 70, 89, 90, 258, 259, 261, Lei 15.428/2026 (ver `matriz-conteudo-detran.md`).

## Falta investigar
Tela de conclusão de lição do Duolingo; volumes do MBST; distribuição oficial das 30 questões; posição atual do DETRAN-PE (20 × 21 acertos); URL oficial do Banco Nacional de Questões.

## Estrutura de conteúdo proposta (trilha)
1. Começando no trânsito (vias, circulação, hierarquia da sinalização)
2. A linguagem das placas (regulamentação, advertência, indicação, horizontal, semáforo, gestos)
3. Regras para circular (preferência, velocidade, ultrapassagem, estacionamento)
4. Infrações e consequências (natureza, pontos, suspensão, crimes)
5. Motorista defensivo
6. Emergências e primeiros socorros
7. Veículo, meio ambiente e cidadania
8. Preparação para a prova (simulado 30 questões, 20 acertos, 60 min — configurável por estado)

## Arquitetura recomendada
React + TypeScript + Vite; CSS Modules com tokens; animações em CSS (Motion só se necessário); conteúdo em JSON/TS validado por script (ids únicos, exatamente 1 correta, fonte e data obrigatórias); camada de persistência com interface `ProgressStore` (localStorage agora, API depois); Vitest + Testing Library + Playwright.

## Primeira versão (Fase C)
Mundo 1 com 3 lições (hierarquia da sinalização, preferência de passagem, velocidades sem sinalização), feedback com explicação e fonte, revisão de erros, tela de conclusão, XP, ofensiva e progresso persistentes.

## Riscos
- Regras mudaram em dez/2025 e podem mudar de novo → toda questão guarda fonte e data; parâmetros do exame ficam em configuração por estado.
- Páginas estaduais desatualizadas (DETRAN-PE) → mostrar a regra federal e avisar a divergência.
- Gamificação punitiva (vidas) pode atrapalhar o aprendizado → vidas opcionais.
- Imagens de placas precisam ser fiéis ao MBST.

## Próximos passos definidos no fim da Fase A (já cumpridos 1–3)
1. Ler MBST Vols. I e II e fechar o conteúdo do Mundo 1–2.
2. Criar o projeto Vite e o modelo de dados com validação.
3. Implementar a fatia vertical e testá-la (desktop e celular).
4. Expandir conteúdo e simulado.

## Situação em 20/10/2026
- Fase C (fatia vertical) concluída e testada: Mundo 1 com 3 lições + revisão, 5 tipos de exercício, feedback com fonte, revisão de erros, conclusão, XP, ofensiva, meta diária, conquistas, repetição espaçada, desempenho por assunto, simulado e ajustes.
- Testes: 20 automatizados (Vitest + Testing Library) e 3 roteiros no navegador via REA/Playwright (desktop 1280×800 e celular 390×844), sem erros de console. Evidências: `ev_6c75ccd2…709c` (lição completa + recarregar), `ev_bb556947…a9e3` (celular: placas, vidas, sair, revisão, simulado, progresso), `ev_9ab09eb5…756c` (trilha no celular após correção).
- Problemas achados nos testes e corrigidos: nó pulsante impedia o clique estável; rodapé de feedback abaixo da dobra; balão "Começar" cobrindo o nome da lição anterior no celular; cabeçalho fixo cobrindo o cronômetro do simulado; cálculo do resultado da lição dependia de atualização assíncrona de estado.

## Situação em 25/10/2026 — curso oficial CNH do Brasil
Investigação em `analise-cnh-do-brasil.md`. O curso exige login gov.br e o conteúdo não foi acessado. A estrutura vista no código público e na imprensa é: 4 módulos (sinalização; escolhas e consequências; direção defensiva; cuidado da vida e do meio ambiente), cada um com aulas e um quiz; depois, material complementar, simulado, avaliação e certificado.

Decisões para o planejamento pedagógico (nenhuma mudança de código feita ainda):
- A trilha de 8 mundos continua. Cada mundo/lição passa a indicar o módulo oficial (1–4) correspondente, conforme a tabela da seção 3a da matriz.
- O Mundo 8 (preparação para a prova) ganha a lição "Processo de habilitação", só com fatos verificados.
- O simulado continua alternando os 4 módulos. Qualquer peso por módulo é escolha do app e deve aparecer assim na tela.
- Aviso curto na interface: o app é independente e não substitui o curso oficial gratuito.

## Decisões de 25/10/2026 (continuação)
Arquitetura (mudança incremental, nada foi reconstruído):
- Novo tipo `ReferenceModuleId = 1 | 2 | 3 | 4` e campo obrigatório `Lesson.referenceModule`. O nome não é `officialModule` porque a ligação lição → módulo é **organização pedagógica própria**, não classificação oficial.
- `src/content/referenceModules.ts` concentra:
  - os 4 módulos, com nome e origem do nome;
  - o mapa assunto da questão (`module`) → módulo;
  - os mundos planejados 2–8 com o módulo previsto. Antes era uma lista fixa em `Home.tsx`.
- O validador de conteúdo rejeita lição cujo módulo principal não corresponde ao assunto de nenhuma das suas questões. Assim a etiqueta não fica solta dos dados.
- `startSession` passou a exigir só `id` e `steps`. As sessões avulsas (revisão espaçada) não têm módulo, e não faria sentido inventar um.
- Trilha: etiquetas "Módulo N · nome" no cabeçalho de cada mundo, inclusive os planejados, e "Módulo N" sob cada lição. A origem do nome aparece ao passar o mouse.
- Aviso no fim da trilha: o app é independente, o curso oficial gratuito está no app CNH do Brasil, e a divisão por módulos é organização própria.
- `window.scrollTo` simulado no ambiente de testes (jsdom), o que eliminou o ruído "Not implemented" nos testes.

Conteúdo:
- Os 4 módulos e a origem dos nomes estão na seção 3b da matriz; o mapa mundo → módulo → lições, na seção 3c.
- Processo de habilitação conferido na lei (seção 3d da matriz). A lição "O caminho até a CNH" vai para o Mundo 8 e ainda não foi escrita.
- Nenhuma questão nova: o Mundo 1 continua com 23 questões verificadas.

## Próximos passos
0. ~~Campo de módulo nos dados e aviso na interface~~ (feito em 25/10/2026). Ainda falta mostrar o progresso por módulo na tela de progresso.
0a. Se o usuário abrir o curso logado (`analise-cnh-do-brasil.md` §8.3), registrar os títulos dos módulos e das aulas e revisar os vínculos da seção 3c.
1. Mundo 2 (placas: regulamentação, advertência, indicação, marcas viárias, semáforo e gestos) — exige ler MBST Vols. III–V.
2. Levar o banco do simulado a 30+ questões verificadas no formato oficial.
3. Mundos 3–8 conforme a matriz.
4. Testes de interface do simulado e de acessibilidade automatizada (axe).

### Achados no curso oficial (25/10/2026, sessão do usuário)

Detalhes: `analise-cnh-do-brasil.md`, §8.4 a §8.7.
- O curso tem 4 módulos, cada um com Introdução, 2 aulas e "Teste seus conhecimentos!", liberados em sequência.
- As aulas são vídeo com Libras e leitura, com conclusão manual.
- O simulado tem 30 questões, tentativas livres e resultado por categoria.
- **Candidato a próximo passo:** mostrar o resultado do simulado do app por módulo de referência (1–4). O mapeamento `MODULE_TO_REFERENCE` já existe.
- Confirmado em 25/10/2026 (ver `analise-cnh-do-brasil.md` §8.9): no resultado, o simulado oficial mostra o desempenho **por módulo**, com acertos, total e %, mas não faz revisão questão a questão. O app deve fazer as duas coisas.
- **Implementado em 25/10/2026:** resultado do simulado por módulo de referência (`ExamScore.byReference` em `src/engine/exam.ts`; seção "Desempenho por módulo" em `ExamScreen.tsx`), com acertos, total, % e barra. Abaixo de 70% fica em vermelho e, quando o módulo reúne mais de um assunto, o detalhe aparece embaixo.
