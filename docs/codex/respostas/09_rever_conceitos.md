**Recomendação em uma frase:** manter as quatro abas e colocar **“Rever explicações” em destaque dentro de Revisar**, com atalhos na trilha e no feedback que abram a mesma tela de conceito.

| Opção | Pontos positivos | Pontos negativos | Como melhorar |
|---|---|---|---|
| Quinta aba “Conceitos” | Acesso direto; biblioteca fácil de reencontrar. | “Conceitos” é uma palavra abstrata; cria dúvida entre ela e “Revisar”; aperta a navegação. | Usar linguagem concreta e validar com pessoas do público antes de acrescentar uma aba. |
| Botão em cada lição da trilha | A explicação fica perto de onde foi aprendida. | Exige lembrar a lição e procurar na trilha; muitos botões podem poluir a estrada. | Um acesso secundário “Rever explicações”, apenas nas lições com conteúdo já estudado. |
| Quinta aba + botões na trilha | Atende à procura geral e à procura por lição. | Soma os custos das duas opções e aumenta a interface. | Compartilhar a mesma biblioteca e a mesma tela de detalhe. |
| **Biblioteca dentro de Revisar + atalhos** | Preserva a navegação conhecida; reúne as duas necessidades de revisão. | Pode ficar escondida entre os treinos atuais. | Colocar “Rever explicações” no início da tela, com descrição “Vídeos e textos das lições que você já estudou”. |
| Somente botão após erro | Ajuda no momento da dúvida. | Não atende quem quer consultar espontaneamente; depende de responder uma questão. | Usá-lo como complemento da biblioteca, após a resposta ser corrigida. |

## Diagnóstico

O app já tem os principais componentes necessários. A mudança é sobretudo de **acesso e organização**, sem precisar criar outro conteúdo pedagógico.

- **Navegação:** as quatro abas são compartilhadas entre desktop e celular em `src/App.tsx:26`. No celular, o CSS fixa quatro colunas em `src/styles.css:835`. Acrescentar um item exige ajustar essa estrutura.
- **Revisar hoje significa responder questões:** há revisão espaçada, erros anteriores e treino por assunto (`src/screens/ReviewScreen.tsx:18`). Falta uma entrada explícita para consultar explicações.
- **Já existe um atalho no feedback:** “Ver a explicação de novo” aparece nas lições comuns, inclusive após acertos (`src/screens/LessonPlayer.tsx:276` e `:403`). Porém, para cartões com vídeo, o diálogo mostra somente resumo e “Para guardar”; não mostra vídeo nem termos (`:493`).
- **“Já estudado” não é igual a “lição terminada”:** `lessonsWithCardsSeen` reconhece a primeira rodada concluída (`src/engine/progress.ts:265`); `lessonFinished` exige todas as rodadas (`:270`). Esperar a segunda rodada atrasaria desnecessariamente o acesso às explicações.
- **Há erros por questão e desempenho por assunto, mas não estatísticas persistidas por cartão de conceito.** `QuestionStat` guarda tentativas, erros e caixa de revisão; `TopicStat` guarda contagens por assunto (`src/engine/progress.ts:13`). Não há registro persistente de vídeos assistidos ou favoritos.
- **Os vídeos são componentes SVG carregados sob demanda:** o import acontece quando `VideoConceito` é montado (`src/components/VideoConceito.tsx:26` e `:82`). O áudio é criado ao tocar (`:154`). Portanto, montar todos os vídeos numa biblioteca faria carregar várias cenas, mesmo sem reprodução.
- **O Mundo 4 pode participar desde o início:** seus cartões não têm vídeo, mas há narrações em `src/content/narration.ts:352`. O componente só oferece o botão quando encontra narração (`src/components/NarrationButton.tsx:25`).

**Cinco abas cabem?** Geometricamente, podem caber: em 320 px seriam cerca de 64 px por item, antes de considerar outros detalhes. Isso não garante boa leitura, especialmente com letra ampliada e rótulos como “Progresso”. Como não houve avaliação visual ou com usuários, não afirmaria que cabem bem. A quinta aba não se justifica neste primeiro passo.

## Propostas

### 1. Destacar “Rever explicações” dentro de Revisar

Colocar uma entrada grande antes dos blocos atuais, com ícone acompanhado de texto. Ao abrir, mostrar a biblioteca. Manter os treinos atuais e seus nomes.

**Por que ajuda:** a pessoa escolhe entre consultar uma explicação e responder perguntas, usando palavras concretas.

**Esforço:** M. **Impacto:** alto.  
**Arquivos:** `src/screens/ReviewScreen.tsx`, `src/App.tsx`, `src/styles.css`; nova tela de biblioteca.  
**Risco:** esconder a revisão do dia. A entrada deve ser compacta e não deslocar os treinos para muito abaixo.

### 2. Liberar os cartões após a primeira rodada

Usar `lessonsWithCardsSeen` para listar os cartões das lições cuja primeira rodada foi concluída. Não exigir domínio, pontuação mínima adicional nem a segunda rodada.

Para o restante:

- Esconder cartões individuais ainda não estudados.
- Mostrar apenas uma mensagem discreta ao final: “Outras explicações aparecem conforme você avança na trilha”.
- Sem conteúdo disponível: “Faça a primeira lição para encontrar suas explicações aqui”, com acesso à trilha.

Cartões vistos numa sessão abandonada não ficam registrados individualmente hoje. No primeiro lançamento, aceitar esse limite; dentro da sessão, continuar permitindo rever o cartão já apresentado.

**Por que ajuda:** evita uma biblioteca cheia de cadeados e aproveita o progresso existente.

**Esforço:** P. **Impacto:** alto.  
**Arquivos:** nova seleção de catálogo em `src/content/` ou `src/engine/`, biblioteca; reutilização de `src/engine/progress.ts:265`.  
**Risco:** confundir “estudado” com “dominado”. Não usar selo “Aprendido” como garantia de aprendizagem.

### 3. Organizar por mundo, lição e título do conceito

Manter a ordem conhecida da trilha. Cada linha mostra título e formato disponível: “Vídeo e resumo” ou “Texto e áudio”, conforme os recursos reais.

Incluir busca simples por título e palavras dos cartões, ignorando acentos e maiúsculas. A navegação por lista precisa funcionar sem digitar.

**Assistidos e favoritos:** deixar para depois. Exigem novos dados persistidos e aprovação específica dessa mudança. Ter concluído a primeira rodada não comprova que a pessoa assistiu ao vídeo.

**Por que ajuda:** permite reconhecer o assunto sem depender da memória exata ou da escrita.

**Esforço:** M. **Impacto:** alto.  
**Arquivos:** biblioteca, catálogo derivado, `src/styles.css`.  
**Risco:** excesso de filtros. Começar sem filtros de status.

### 4. Criar uma tela única para consultar o conceito

Mostrar:

1. Título e localização na trilha.
2. Vídeo com reprodução por toque, quando existir.
3. Resumo já existente.
4. “Palavras novas” e “Para guardar”.
5. Fontes.
6. “Praticar este conceito”.

Nos cartões sem vídeo, mostrar os blocos existentes de explicação, passo a passo e exemplo, mais narração disponível. Não inventar um resumo novo nem exibir uma área vazia de vídeo.

Reutilizar `ConceptBlocks`, preservando a apresentação dividida em partes durante a lição. Na consulta, permitir chegar ao texto sem assistir primeiro.

**Por que ajuda:** oferece imagem, leitura e escuta sem obrigar um único modo de aprender.

**Esforço:** M. **Impacto:** alto.  
**Arquivos:** nova tela de conceito, `src/components/ConceptView.tsx`, `NarrationButton.tsx`, `src/App.tsx`.  
**Risco:** áudio simultâneo. Pausar uma reprodução ao iniciar outra e ao sair.

### 5. Acrescentar atalhos discretos na trilha

Nas lições com a primeira rodada feita, oferecer “Rever explicações” junto ao título, como botão separado do nó principal. Abrir a biblioteca filtrada naquela lição.

Nas revisões e em “Na rua”, evitar um botão vazio: inicialmente, deixar esses atalhos apenas nas lições que contêm cartões.

**Por que ajuda:** atende quem lembra onde estudou, sem obrigar a refazer a lição.

**Esforço:** M. **Impacto:** médio.  
**Arquivos:** `src/screens/Home.tsx`, `src/App.tsx`, `src/styles.css`.  
**Risco:** sobreposição na trilha de altura e posições calculadas (`Home.tsx:148`). Preservar área de toque e nome acessível do nó.

### 6. Ampliar o atalho já existente no feedback

Reaproveitar “Ver a explicação de novo” para abrir a mesma apresentação completa do conceito. Estender o acesso ao feedback das práticas e revisões, **depois da correção**.

Ao fechar, manter questão, resposta, feedback e posição da sessão. No simulado, oferecer consulta somente após finalizar, na análise dos erros.

O vínculo atual `HINT_CARDS` ajuda, mas só associa questões quando o cartão tem `remember` (`src/content/hints.ts:20`). Criar um índice geral questão → cartão, independente dessa condição, sem modificar a regra da Dica. Questões sem vínculo seguro ficam sem atalho; não associar apenas por semelhança de título ou assunto.

**Por que ajuda:** reduz o caminho entre perceber a dificuldade e recuperar a explicação.

**Esforço:** M. **Impacto:** alto.  
**Arquivos:** `src/screens/LessonPlayer.tsx`, `src/screens/ExamScreen.tsx`, `src/content/index.ts`, novo índice de conceitos.  
**Risco:** oferecer ajuda antes da resposta e contornar as regras da Dica.

### 7. Oferecer prática exclusiva daquele cartão

Selecionar as questões vinculadas ao cartão, incluindo suas variações, com uma rodada curta de até oito questões distintas. Se houver menos, usar as disponíveis.

Iniciar uma **prática avulsa**, aproveitando `startPracticeSession` (`src/App.tsx:77`). Aplicar as regras atuais: XP por acerto de primeira, registro de respostas, revisão espaçada e demais efeitos já previstos. Não concluir lição, rodada ou desbloquear trecho por essa prática.

**Por que ajuda:** depois de rever, a pessoa tenta lembrar e aplicar o que acabou de consultar.

**Esforço:** M. **Impacto:** alto.  
**Arquivos:** catálogo de questões por cartão, nova tela de conceito, `src/App.tsx`.  
**Risco:** chamar `completeLesson` por engano ou iniciar prática vazia. Preservar `completePractice` (`src/engine/progress.ts:479`).

### 8. Deixar recomendações e cuidados técnicos preparados

Uma seção futura “Vale rever” pode reunir cartões com questões que já tiveram erro e ainda estão em caixas baixas, seguindo o critério semelhante ao de `src/engine/review.ts:61`.

Não chamar isso de “os conceitos que você mais erra”: as contagens incluem repetições, pessoas praticam quantidades diferentes e não há histórico temporal detalhado por cartão.

Na implementação inicial:

- Lista com texto e ícones; montar somente o vídeo do conceito aberto.
- Abrir cada conceito com identidade própria, por exemplo `key={card.id}`, evitando reaproveitar estado do vídeo anterior.
- Tratar falha no carregamento da cena, mantendo o texto disponível.
- Preservar movimento reduzido, já contemplado em `VideoConceito.tsx:185`.
- Garantir foco no título, retorno ao acionador, botões nomeados e texto completo acessível. Evitar que legendas e leitor de tela produzam falas simultâneas confusas.

**Por que ajuda:** mantém o recurso leve e utilizável por quem precisa de leitura assistida.

**Esforço:** M. **Impacto:** alto nos cuidados técnicos; médio na recomendação futura.  
**Arquivos:** biblioteca, tela de conceito, `VideoConceito.tsx`, `src/styles.css`; testes de interface e motor existentes.  
**Risco:** apresentar uma estimativa como diagnóstico de aprendizagem.

## Esboço no celular

```text
+--------------------------------+
| Revisar                        |
|                                |
| [Rever explicacoes          >] |
| Videos e textos ja estudados   |
|                                |
| Revisao do dia                 |
| [Revisar 8 questoes]           |
| Erros anteriores ...           |
+--------------------------------+
| Trilha Revisar Simulado Progresso|
+--------------------------------+

Ao abrir "Rever explicacoes":

+--------------------------------+
| < Voltar                       |
| Rever explicacoes              |
| [Buscar uma explicacao       ] |
|                                |
| Mundo 1                        |
| Licao: titulo da licao         |
| [Tipos de sinais            >] |
|  Video e resumo                |
| [Quem passa primeiro        >] |
|  Video e resumo                |
|                                |
| Outras explicacoes aparecem    |
| conforme voce avanca.          |
+--------------------------------+
```

Ao voltar do conceito, preservar busca, grupos abertos e posição da lista.

## Top 3

1. **Biblioteca em Revisar, liberada pela primeira rodada:** resolve a consulta espontânea sem acrescentar uma aba.
2. **Tela de conceito compartilhada com o feedback:** recupera vídeos, resumo e áudio por um caminho consistente.
3. **Atalho na trilha e prática por conceito:** liga a consulta ao lugar conhecido e à aplicação do conteúdo, mantendo o motor atual.

Na implementação, verificar especialmente: progresso antigo sem `roundsDone`, primeira rodada feita com segunda pendente, cartão sem vídeo, questão sem vínculo, retorno à sessão e ausência de alteração de progresso ao apenas consultar. Preservar nomes acessíveis como “Verificar”, “Continuar”, “Sair da lição” e os controles existentes do vídeo.

## O que NÃO fazer

- Acrescentar a quinta aba como primeira solução sem validar a compreensão de “Conceitos”.
- Colocar um player em cada linha da biblioteca.
- Exigir assistir até o fim para ler o resumo ou sair.
- Dar XP, marcar domínio ou avançar a trilha por abrir uma explicação.
- Oferecer consulta durante questões ainda não corrigidas ou durante o simulado.
- Usar cadeados em dezenas de cartões ou chamar a ausência de vídeo do Mundo 4 de falha.
- Criar favoritos, histórico de reprodução ou mudanças de persistência sem aprovação específica.
- Alterar textos legais, respostas, fontes, sorteios salvos ou regras de progressão para acomodar a biblioteca.

Análise feita pela leitura dos documentos e do código. Nenhum arquivo foi alterado; não executei navegador, servidor ou Vite.