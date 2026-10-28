# Relatório do projeto CNH Quest (até 25/10/2026)

Este documento resume o que foi feito até agora e aponta onde estão os detalhes. Os documentos de origem continuam valendo:
- `analise-duolingo.md`
- `matriz-conteudo-detran.md`
- `analise-cnh-do-brasil.md`
- `plano-tecnico.md`

## 1. O que é o projeto

O CNH Quest é um app web em estilo Duolingo para estudar a prova teórica do DETRAN (1ª habilitação, categorias A e B). Ele funciona em lições curtas, com XP, ofensiva, revisão espaçada e simulado.
- Stack: React 18, TypeScript, Vite e Vitest. O progresso fica no `localStorage`.
- É um app independente, sem vínculo com DETRAN, SENATRAN ou Serpro. As questões são originais.

## 2. Linha do tempo

| Data | Etapa | Resultado |
|---|---|---|
| 19/10/2026 | Fase A: análise do Duolingo e pesquisa das regras da prova | `analise-duolingo.md` (mecânicas que adaptamos); `matriz-conteudo-detran.md` §0–3 (Res. CONTRAN 1.020/2025: 30 questões, 20 acertos, 60 min; Portaria SENATRAN 923/2025) |
| 19–20/10/2026 | Fases B e C: primeira versão (0.1) | Mundo 1 com 3 lições e revisão; 5 tipos de exercício; feedback com fonte legal; gamificação; repetição espaçada; simulado; acessibilidade; testes |
| 25/10/2026 | Investigação do curso oficial CNH do Brasil sem login | O curso exige login gov.br e não tentamos contornar. Vimos só a estrutura no código público e as reportagens (`analise-cnh-do-brasil.md` §1–7). |
| 25/10/2026 | Reorganização pedagógica | Criados os 4 módulos de referência e o mapa mundo → módulo → lição, como organização própria do app (§3b e §3c da matriz). Processo de habilitação conferido no CTB e na Res. 1.020/2025 (§3d). Mudanças no app descritas na seção 4. |
| 25/10/2026 | Sessão autenticada do usuário | O usuário entrou na própria conta num Edge com depuração local (127.0.0.1:9222) e perfil separado. Vimos o índice, os módulos, a introdução do Módulo 1, o simulado e o resultado (`analise-cnh-do-brasil.md` §8.4–8.9). |
| 25/10/2026 | Resultado do simulado por módulo | Implementado no app (seção 4). |

## 3. Achados sobre o curso oficial (vistos na sessão do usuário)

**Estrutura**: 4 módulos, cada um com 4 etapas que se desbloqueiam em sequência. As etapas são:
- Introdução;
- duas aulas temáticas;
- "Teste seus conhecimentos!".

Fora dos módulos há a seção "Material Complementar e Simulado" e o Certificado.

**Os 4 módulos e o mapeamento do app.** Os títulos dos módulos coincidem com o Banco Nacional de Questões v1.0 e confirmam o mapeamento já usado no app.

| Mód. | Título no curso | Aulas | Nome no app | Assuntos do app |
|---|---|---|---|---|
| 1 | Placas, cores e caminhos | Sinalização vertical (placas); Demais sinalizações | Sinalização de trânsito | sinalização |
| 2 | Escolhas e consequências | Infrações e penalidades; Infrações mais comuns | Escolhas e consequências | infrações |
| 3 | Na direção da segurança | Normas gerais de circulação; Direção defensiva e segura | Direção defensiva | circulação, direção defensiva |
| 4 | Cuidar, agir e preservar | Cuidados e primeiros socorros; Cuidados com o meio ambiente | Cuidado com a vida e o meio ambiente | primeiros socorros, meio ambiente |

**Formato da aula** (vimos só a Introdução do Módulo 1): um vídeo do YouTube com intérprete de Libras, um material de leitura curto e o botão "Concluir", que é manual.

**Processo de habilitação**: não existe uma aula específica sobre isso. O app vai cobrir o tema com fontes legais, na lição "O caminho até a CNH" do Mundo 8.

**Simulado oficial**:
- 30 questões, aprovação com 20 acertos e tentativas ilimitadas;
- não exige terminar os módulos e não mostra cronômetro;
- 4 alternativas por questão, só texto na questão vista, navegação livre entre as questões;
- no resultado, mostra o total e o **desempenho por módulo** (acertos, total e %), além de dicas e dos botões "Estudar Material Complementar" e "Tentar Novamente";
- **não mostra gabarito nem explicação** das questões.

**Tentativa feita pelo assistente**, a pedido do usuário: marcou sempre a 1ª alternativa e terminou com 6 de 30. A nota não mede conhecimento. Nessa tentativa, as 30 questões ficaram assim:
- Mód. 3: 12
- Mód. 2: 9
- Mód. 1: 6
- Mód. 4: 3

É uma única amostra. A distribuição oficial continua "A investigar".

**Decisão tirada daí**: o app evita a alternativa "todas as alternativas estão corretas".

## 4. O que mudou no app

**Módulos de referência** (`src/content/referenceModules.ts`):
- `REFERENCE_MODULES`, com a origem de cada nome;
- `MODULE_TO_REFERENCE`, que liga cada assunto a um módulo;
- `PLANNED_WORLDS`, com os mundos 2 a 8 e seus módulos previstos.

**Lições e validação**:
- `Lesson.referenceModule` passou a ser obrigatório (`types.ts`).
- O validador recusa módulo fora de 1–4 e módulo que não corresponda às questões da lição.

**Trilha** (`Home.tsx`): mostra "Módulo N" em cada mundo e lição, com aviso de que o app é independente e de que essa organização é própria.

**Simulado** (`engine/exam.ts`, `screens/ExamScreen.tsx`):
- O cálculo da nota agora gera `byReference`.
- A tela "Desempenho por módulo" mostra acertos, total, % e barra. Abaixo de 70% fica em vermelho, e o detalhe por assunto aparece quando o módulo reúne mais de um.
- Continua o diferencial em relação ao curso: revisão de cada erro, com explicação e fonte.

**Testes**: 24 passam, `tsc` sem erros e o build de produção funciona. Testes novos:
- soma por módulo no motor;
- seção de resultado na interface;
- validação dos módulos.

## 5. Segurança e direitos autorais (como a investigação foi feita)

- O login foi feito pelo próprio usuário. Nenhuma senha foi pedida e nenhum cookie, token ou credencial foi lido, registrado ou exportado.
- As ferramentas da REA foram usadas sem captura de armazenamento, rede ou cabeçalhos. Não houve chamada direta à API do curso.
- Não houve cópia de enunciados, textos de aula, imagens ou vídeos. Registramos só a estrutura e os temas, com nossas palavras.
- Os prints da sessão autenticada não foram salvos no projeto, e o nome do usuário não aparece em nenhum documento.
- O que está em `docs/capturas-*` vem das etapas anteriores e mostra só páginas públicas: o Duolingo e o redirecionamento para o login gov.br.
- Recomendação: fechar o Edge aberto com depuração e, se quiser, apagar a pasta `%LOCALAPPDATA%\cnhquest-rea-profile`.

## 6. Ainda não verificado

- Aulas temáticas, "Teste seus conhecimentos!", Material Complementar e Certificado: não foram abertos, porque dependem do desbloqueio em sequência.
- Distribuição oficial das questões por módulo no exame.
- Se existe resolução CONTRAN posterior que altere a Res. 1.020/2025.
- Conteúdo técnico dos mundos 2 a 8, que ainda não têm questões.

## 7. Próximos passos sugeridos

1. Escrever o Mundo 2, "A linguagem das placas" (Módulo 1), com fontes do MBST.
2. Escrever a lição "O caminho até a CNH" (Mundo 8), apresentando juntas as regras do CTB art. 148 e da Res. 1.020 art. 51.
3. Quando houver questões suficientes, fazer o simulado do app sortear por módulo.
4. Abrir as próximas etapas do curso oficial na sessão do usuário, com as mesmas regras de segurança.
