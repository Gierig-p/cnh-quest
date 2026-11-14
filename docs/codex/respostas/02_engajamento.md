# Engajamento ético — CNH Quest

Análise por leitura dos arquivos locais, em 14/11/2026. Não executei navegador, servidor, instalação nem testes. Este relatório é a única alteração feita para este pedido. As propostas são recomendações, não mudanças já implementadas. Esforço: P = pequeno, M = médio, G = grande; impacto é uma estimativa de produto, ainda sem pesquisa com usuários.

## 1. Diagnóstico

### O que já ajuda

- **Há um caminho concreto de estudo.** A trilha indica lição recomendada, rodadas e melhor resultado (`src/screens/Home.tsx:149`). O próximo passo já está conectado à conclusão (`src/App.tsx:115`). Isso reduz a dúvida sobre onde tocar.
- **O hábito tem uma base simples:** meta ajustável, XP, nível, recorde e sete conquistas (`src/engine/progress.ts:66`, `src/engine/progress.ts:262`, `src/screens/ProgressScreen.tsx:124`). Vidas são opcionais e começam desligadas (`src/engine/progress.ts:85`), uma boa escolha para quem precisa errar para aprender.
- **Voltar tem utilidade pedagógica.** A revisão seleciona questões já vistas e vencidas, priorizando caixas menores (`src/engine/progress.ts:126`); a sessão do dia limita a seleção a 12 questões (`src/screens/ReviewScreen.tsx:28`). É um motivo melhor que apenas acumular pontos.
- **O resultado explica o desempenho.** A conclusão mostra acertos de primeira e assuntos para revisar (`src/screens/CompleteScreen.tsx:86`, `src/screens/CompleteScreen.tsx:122`). O simulado mostra erros, explicações e módulos (`src/screens/ExamScreen.tsx:107`).
- **Existe cuidado com acessibilidade:** áudio configurável e redução de movimento nas contagens (`src/ui/hooks.ts:17`, `src/ui/hooks.ts:34`). Novas recompensas devem preservar essas opções e ter equivalente em texto.

### O que atrapalha

1. **O retorno amanhã não fica combinado.** A conclusão destaca XP, ofensiva e a próxima rodada, mas não oferece um plano curto para o dia seguinte (`src/screens/CompleteScreen.tsx:97`, `src/screens/CompleteScreen.tsx:134`). A revisão aparece quando já está pendente; falta antecipar o próximo encontro sem inventar uma obrigação.
2. **No celular, o resumo vem depois de toda a trilha.** Em `src/App.tsx:165`, meta e revisão estão no bloco lateral, após o conteúdo principal. Em telas menores ele vira um bloco comum (`src/styles.css:762`); a Home inclui também mundos em construção (`src/screens/Home.tsx:220`). Por leitura, há risco de a ação diária ficar longe do início; não houve validação visual neste trabalho.
3. **XP e nível medem atividade, não preparo.** Refazer lições continua rendendo XP (`src/engine/progress.ts:287`); o nível depende apenas do total (`src/engine/progress.ts:330`). O sorteio salvo repete questões ao reabrir (`src/App.tsx:53`). Pontos e melhores resultados podem crescer com familiaridade, sem comprovar transferência para perguntas novas.
4. **A ofensiva está ligada a XP positivo, não à meta.** Qualquer ganho positivo inicia ou prolonga a sequência; uma ausência a reinicia no próximo ganho (`src/engine/progress.ts:272`). Antes disso, as telas ainda exibem o número salvo, mesmo após vários dias sem estudar (`src/screens/Panels.tsx:11`, `src/screens/ProgressScreen.tsx:71`). Não há proteção nem histórico de presença para mostrar uma semana de estudo.
5. **Recompensas dependem da modalidade.** A prática avulsa usa `addXp`, mas retorna `newAchievements: []` (`src/App.tsx:88`): pode anunciar meta atingida sem conceder a conquista correspondente. O simulado registra respostas e suas duas conquistas, mas não passa por `addXp` (`src/screens/ExamScreen.tsx:38`); estudar só pelo simulado não alimenta meta nem ofensiva. Isso pode parecer injusto para quem não conhece o código.
6. **A promessa do Leitner é mais ampla que o comportamento.** Há intervalo de 16 dias para a caixa 5, mas `dueQuestions` exclui essa caixa (`src/engine/progress.ts:105`, `src/engine/progress.ts:129`). Portanto, a questão deixa de entrar automaticamente na fila ao chegar lá. A tela menciona retorno em 16 dias (`src/screens/ReviewScreen.tsx:24`). É preciso alinhar a comunicação à regra atual, sem alterar o algoritmo neste pedido.
7. **O desempenho por assunto é acumulado e pouco explicado.** O cálculo usa o histórico de primeiras tentativas (`src/engine/progress.ts:118`, `src/engine/progress.ts:143`); a tela exibe porcentagem e um número sem explicar bem a amostra (`src/screens/ProgressScreen.tsx:83`). Poucos acertos ou sucessivas repetições não significam domínio duradouro. “Erros anteriores” inclui qualquer erro histórico, mesmo já superado (`src/screens/ReviewScreen.tsx:12`).
8. **Ainda não dá para dizer se a pessoa passaria na prova real.** Há nota e critério no simulado, mas o projeto registra conteúdo incompleto e concentração em poucos assuntos (`docs/ESTADO-DO-PROJETO.md`, seções 3 e 8). A montagem usa somente o banco disponível (`src/engine/exam.ts:27`). O aviso atual explica a origem das questões e a distribuição desconhecida, mas não explicita ali os assuntos ainda ausentes (`src/screens/ExamScreen.tsx:86`). O histórico mostra notas isoladas e aprovação, sem síntese das limitações (`src/screens/ProgressScreen.tsx:93`).

### Ciclo do dia

Hoje: **abrir → escolher lição ou revisão → responder → receber XP e feedback → continuar**. Há meta, mas o principal botão incentiva mais uma sessão. Falta fechar o ciclo com **“por hoje está bom” e um próximo passo útil**. Não encontrei nos fluxos lidos missões diárias, proteção de ofensiva, baú de recompensa, data da prova ou lembrete configurável. O ícone de baú da trilha identifica revisões (`src/screens/Home.tsx:42`), não uma recompensa surpresa.

## 2. Propostas

### 1. Um próximo passo no início da Home

- **O que é:** cartão antes da estrada com uma recomendação principal: revisão vencida, se houver; caso contrário, próxima rodada liberada. Exemplo: “Hoje: revisar até 12 questões”. Meta em texto simples e acesso fácil para ajustá-la. Depois de cumprir, “Seu estudo de hoje está feito. Você pode parar por aqui”. Sem iniciar outra sessão automaticamente.
- **Por que ajuda:** a pessoa não precisa entender trilha, XP e quatro abas antes de começar.
- **Esforço / impacto:** M / alto.
- **Arquivos:** `src/screens/Home.tsx`, `src/screens/Panels.tsx`, `src/App.tsx`, `src/styles.css`.
- **Risco / regra:** reutilizar desbloqueio e fila existentes; não criar atalhos para lições bloqueadas. Evitar duplicar IDs acessíveis dos cartões já montados. Não prometer duração exata.

### 2. Fechar a sessão com convite para amanhã

- **O que é:** ao atingir a meta, mostrar uma saída tranquila para a trilha e uma frase sobre o próximo passo. Para revisão futura, consultar a menor data elegível entre caixas abaixo de 5; dizer “Sua próxima revisão está prevista para…” apenas quando houver dados. Caso contrário, convidar para a próxima lição disponível. Erros vencidos hoje continuam indicados como de hoje.
- **Por que ajuda:** a pessoa sabe que fez o suficiente e por que vale voltar, sem ter de memorizar o caminho.
- **Esforço / impacto:** P / alto.
- **Arquivos:** `src/screens/CompleteScreen.tsx`, `src/engine/progress.ts`, `src/App.tsx`.
- **Risco / regra:** não inventar retorno amanhã para toda questão nem mudar Leitner; manter os nomes acessíveis existentes, inclusive “Continuar”.

### 3. Tornar recompensas coerentes entre modalidades

- **O que é:** centralizar a avaliação das conquistas de meta e presença, para que práticas também sejam reconhecidas. Definir separadamente se um simulado concluído conta como dia estudado e como contribui para a meta. Minha recomendação é reconhecer sua conclusão como presença, sem depender da aprovação; a quantidade de XP exige decisão explícita antes de implementar.
- **Por que ajuda:** o mesmo esforço recebe uma resposta compreensível, inclusive quando a pessoa erra.
- **Esforço / impacto:** M / alto.
- **Arquivos:** `src/engine/progress.ts`, `src/App.tsx`, `src/screens/ExamScreen.tsx`, `src/screens/CompleteScreen.tsx`, `src/engine/engine.test.ts`.
- **Risco / regra:** altera regras de recompensa e possivelmente persistência; precisa de autorização específica na implementação. Não conceder presença por apenas abrir o simulado nem atrelar reconhecimento a passar.

### 4. Mostrar progresso de aprendizagem com limites claros

- **O que é:** separar três informações: “Lições concluídas”, “Como você foi nos simulados” e “Assuntos disponíveis”. Mostrar notas recentes do mesmo formato, tamanho de amostra e mínimo registrado em cada tentativa. Exibir os quatro módulos, inclusive “ainda sem conteúdo” e “ainda não praticado”. Usar “resultado neste banco de treino”, sem porcentagem de chance de aprovação ou selo “pronto”.
- **Por que ajuda:** aproxima o progresso do objetivo real e evita confundir nível alto com preparo completo.
- **Esforço / impacto:** M / alto.
- **Arquivos:** `src/screens/ProgressScreen.tsx`, `src/screens/ExamScreen.tsx`, `src/screens/Panels.tsx`, `src/content/referenceModules.ts`, `src/engine/exam.ts`.
- **Risco / regra:** não inventar distribuição oficial, nota mínima ou previsão. Usar os parâmetros e fontes já existentes. O registro atual não guarda todos os IDs sorteados nem acertos por módulo; uma evolução por módulo entre provas exigiria ampliar o histórico e tratar registros antigos como incompletos. Não reconstruí-la apenas com `wrongIds`.

### 5. Ofensiva acolhedora e proteção simples

- **O que é:** primeiro corrigir a exibição de sequências vencidas, com mensagem “Bom ter você de volta” e recorde preservado. Como etapa posterior, oferecer uma pausa gratuita por semana, claramente marcada como descanso, sem contar como dia estudado. Não vender proteção nem exigir atividade extra para recuperá-la.
- **Por que ajuda:** faltar um dia deixa de parecer perda de todo o aprendizado; quem tem rotina irregular consegue retomar.
- **Esforço / impacto:** M / médio.
- **Arquivos:** `src/engine/progress.ts`, `src/screens/Panels.tsx`, `src/screens/ProgressScreen.tsx`, `src/storage/progressStore.ts`, `src/engine/engine.test.ts`.
- **Risco / regra:** proteção muda a regra de ofensiva e precisa de autorização. Exige datas de presença/pausa que hoje não existem; não fabricar histórico antigo. Usar dias locais, testar virada de mês/ano e não tratar relógio do aparelho como prova confiável de presença.

### 6. Uma missão diária ligada ao aprendizado

- **O que é:** no máximo uma missão, escolhida por necessidade: “Conclua uma revisão” ou “Faça a próxima rodada”. Sem prazo em contagem regressiva, sem exigir perfeição, sem bônus de velocidade e sem penalidade se não fizer. Não oferecer revisão indisponível; quando todo o conteúdo acabar, oferecer treino opcional. Usar conclusão como critério, não aprovação.
- **Por que ajuda:** traduz “ganhar XP” em uma ação concreta e aproveita os caminhos já existentes.
- **Esforço / impacto:** M / médio.
- **Arquivos:** `src/screens/Home.tsx`, `src/screens/Panels.tsx`, `src/App.tsx`, `src/engine/progress.ts`, `src/storage/progressStore.ts`.
- **Risco / regra:** pode virar uma segunda obrigação paralela à meta; apresentar como sugestão, sem nova moeda. Salvar data, alvo e conclusão para a missão não mudar a cada acesso; campos opcionais com padrão para dados antigos. Recompensa de XP adicional seria mudança de regra, não requisito desta ideia.

### 7. Celebrar retomada e revisão, além da perfeição

- **O que é:** acrescentar marcos como “Primeira revisão concluída” e “Voltou a estudar”. Dar feedback descritivo: “Você praticou de novo um assunto difícil”. Só dizer que melhorou se houver comparação confiável. “Sem arranhões” pode continuar, mas não deve ser a celebração principal.
- **Por que ajuda:** quem aprende devagar também recebe reconhecimento por ações úteis, sem incentivo a evitar questões difíceis.
- **Esforço / impacto:** M / médio.
- **Arquivos:** `src/engine/progress.ts`, `src/App.tsx`, `src/screens/CompleteScreen.tsx`, `src/screens/ProgressScreen.tsx`.
- **Risco / regra:** ampliar conquistas exige definir concessão e compatibilidade; ausência de registro não prova que alguém nunca revisou. Sem medalhas retiradas por ausência, comparação pública ou deboche do erro.

### 8. Lembrete opcional e data da prova

- **O que é:** permitir informar ou remover a data da prova e escolher um horário de estudo. Mostrar “Sua prova está marcada para…” de modo neutro. Oferecer exportação de um evento para o calendário, com instrução de que a pessoa precisa adicioná-lo e conferir o alerta no próprio calendário. Como alternativa simples, orientar a criar um alarme no celular.
- **Por que ajuda:** associa o estudo à rotina escolhida pela pessoa e reduz o esforço de lembrar.
- **Esforço / impacto:** M / médio.
- **Arquivos:** `src/screens/ProgressScreen.tsx`, `src/screens/Home.tsx`, `src/engine/progress.ts`, `src/storage/progressStore.ts`; novo utilitário de exportação de calendário.
- **Risco / regra:** localStorage guarda a preferência, mas não entrega alertas por si só. Não prometer notificação com site fechado nem basear o produto em temporizador da página. Validar calendário/fuso nos aparelhos antes de oferecer exportação; a proposta não exige PWA. Datas opcionais, sem pedir permissão de notificação ao entrar. Push com infraestrutura de servidor fica para o futuro, fora desta fase.

### 9. Surpresa pequena, sem sorteio de vantagem

- **O que é:** uma variação ocasional e gratuita de fala ou pose original da Lumi ao concluir o estudo, sempre com texto equivalente e sem ação adicional para “resgatar”. Preferir isso a um baú com prêmio aleatório. Pode haver uma sequência local de celebrações, sem duplicar prêmio ao recarregar.
- **Por que ajuda:** oferece novidade sem introduzir moeda, inventário ou uma nova regra difícil de entender.
- **Esforço / impacto:** P / baixo.
- **Arquivos:** `src/screens/CompleteScreen.tsx`, `src/components/Lumi.tsx`, `src/styles.css`; `src/engine/progress.ts` e armazenamento apenas se a sequência precisar persistir.
- **Risco / regra:** não alterar XP, acertos, desbloqueio ou memória por sorte. Respeitar áudio desligado e movimento reduzido; sem flashes, demora obrigatória, prêmio raro ou material copiado do Duolingo. Prioridade inferior à clareza do progresso.

## 3. Top 3

1. **Próximo passo no topo da Home (proposta 1).** Remove uma decisão difícil logo na entrada, principalmente no celular. Pode reutilizar regras atuais sem criar outro sistema de pontos.
2. **Progresso de aprendizagem com limites claros (proposta 4).** O objetivo é aprender para a prova. Antes de aumentar recompensas, é essencial deixar visível o que já foi praticado e o que o banco ainda não cobre.
3. **Fechamento com convite para amanhã (proposta 2).** Completa o ciclo do hábito com uma tarefa útil e permissão clara para descansar. É uma mudança pequena e não exige servidor nem nova economia.

A inconsistência de conquistas da prática merece correção próxima, com testes de meta alcançada em lição e revisão. A política de presença do simulado deve ser decidida antes de adicionar proteção ou missões.

Para avaliar essas mudanças, observar com pessoas do público-alvo se conseguem começar sem ajuda, explicar o próximo passo e entender que uma boa nota no banco atual não garante aprovação. Medir retorno no dia seguinte junto com revisão concluída e compreensão, não apenas minutos de uso ou XP. Sem backend, contagens locais podem apoiar testes voluntários, mas não representam retenção de toda a base nem sobrevivem à limpeza do navegador. Um diário por data, se autorizado, deve registrar só o necessário e aceitar progresso antigo sem histórico.

## 4. O que NÃO fazer

- Prometer “90% pronto para a prova” por XP, nível, trilha concluída ou uma aprovação no simulado atual.
- Criar ranking, cobrança pública, aviso “a Lumi está triste com você” ou perda de aprendizado por ausência.
- Vender ou sortear proteção de ofensiva, introduzir vidas obrigatórias ou bloquear revisão por falta de moeda.
- Oferecer baú raro, roleta, prêmio por assistir anúncio ou várias tarefas com prazo para segurar a pessoa no app.
- Exigir lição perfeita, resposta rápida ou mais acertos seguidos para cumprir a missão. Isso pune leitura lenta e incentiva evitar dificuldade.
- Ocultar ausência de conteúdo sob barras completas, misturar critérios diferentes de simulado ou chamar poucos acertos de domínio comprovado.
- Mudar intervalos do Leitner, sorteios salvos, desbloqueios, respostas, fontes ou critérios legais como efeito colateral da gamificação. Qualquer mudança dessas regras é outro pedido.
- Prometer lembrete automático com o site fechado apenas porque o horário está salvo no navegador.
- Pedir telefone, conta ou permissão de notificação como condição para estudar; implementar PWA contra a decisão registrada no projeto.
- Acrescentar confetes, sons ou animações obrigatórias antes de tornar o próximo passo e o resultado fáceis de entender.
