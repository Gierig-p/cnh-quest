# Simplicidade e didática para leigos — CNH Quest

Análise de 14/11/2026, baseada no briefing, no estado do projeto e na leitura do código atual. Não abri navegador, servidor ou capturas antigas, nem executei testes. As dificuldades abaixo são hipóteses de uso fundamentadas no código; precisam ser confirmadas com pessoas do público. Nenhum arquivo do aplicativo foi alterado.

## 1. Diagnóstico

### Primeiro uso: o propósito aparece, mas o primeiro passo pode ficar mais claro

O onboarding apresenta a Lumi, explica o objetivo e oferece um botão principal, “Vamos lá” (`src/screens/Onboarding.tsx:23`). Isso ajuda. Porém, antes de estudar, a pessoa precisa ler um aviso com CTB, CONTRAN e SENATRAN e escolher entre quatro metas (`Onboarding.tsx:30`, `Onboarding.tsx:47`). Para quem lê devagar, é informação demais antes da primeira experiência de aprendizagem.

Na trilha, o próximo nó recebe a indicação “Começar” e o nome acessível inclui “recomendada agora” (`src/screens/Home.tsx:160`, `Home.tsx:175`). É uma boa orientação existente. Ainda assim, o caminho disputa atenção com módulos, percentuais, rodadas e mundos bloqueados. A tela também lista seis mundos em construção (`Home.tsx:220`). Minha hipótese: o propósito é compreensível, mas não dá para afirmar que a pessoa saberá onde tocar em cinco segundos sem um teste com usuários.

### Os cartões ensinam bem, mas exigem muita leitura de uma vez

Há uma base didática boa: linguagem acolhedora, definições, passos, exemplos e lembretes. O cartão inicial explica sinais por coisas conhecidas; o de preferência apresenta uma situação de rua (`src/content/world1.ts:14`, `world1.ts:80`). O Mundo 2 explica “conversão” e “retorno” antes de cobrar a diferença (`src/content/world2.ts:15`). Vale preservar esses apoios.

O problema principal é a soma. O componente mostra corpo, figura, todas as definições, todos os passos, exemplo, lembrete e fontes na mesma página (`src/screens/LessonPlayer.tsx:220`). O cartão inicial já traz dois termos e seis itens; o de preferência reúne quatro termos, cinco itens e exemplo (`world1.ts:19`, `world1.ts:85`). Não medi a altura em celular, mas a estrutura indica bastante rolagem e esforço para lembrar tudo.

### As dificuldades de linguagem são específicas, não gerais

O conteúdo já usa situações concretas. Há, porém, trechos que acumulam vocabulário técnico: “conversão”, “retorno”, “R-4a” e “R-5a” na mesma questão (`src/content/world2.ts:310`). A primeira pergunta exige perceber uma negação em “NÃO” (`src/content/world1.ts:242`). A explicação de associação remete a “inciso do art. 87”, sem desenvolver ali a ideia (`world1.ts:365`). Isso pode exigir domínio de leitura além do conhecimento de trânsito.

Também há atalhos culturais: “spoiler” (`world2.ts:108`) e a sequência “A-S-S-N” (`world1.ts:52`). Podem ajudar algumas pessoas, mas não devem ser o único caminho para entender. Registro essas dificuldades sem propor reescrita das questões, explicações legais ou fontes.

### O feedback ensina, mas pode virar outro bloco difícil de ler

Depois do erro, aparecem resposta correta, motivo específico do erro, explicação, lembrete e fonte (`src/screens/LessonPlayer.tsx:319`). O motor diferencia o motivo conforme a alternativa escolhida (`src/engine/grading.ts:21`), o que é pedagogicamente valioso. A revisão com outras perguntas do mesmo assunto também ajuda a aplicar o aprendizado, em vez de apenas decorar a resposta (`src/engine/session.ts:70`).

Por outro lado, o texto do feedback tem altura máxima de 34% da janela e rolagem própria (`src/styles.css:567`). A pessoa pode precisar descobrir uma segunda área de rolagem. No exercício de pares, um erro anterior faz o resultado final ser considerado incorreto mesmo após todos os pares serem resolvidos (`grading.ts:42`); a interface precisa explicar esse histórico para não parecer contraditória.

“Errar faz parte” é acolhedor. Já “Agora você já sabe a explicação” presume que a pessoa entendeu apenas por ter visto o texto (`LessonPlayer.tsx:275`). O apoio para pedir ajuda também é trabalhoso: a dica espera 60 segundos e abre uma confirmação sobre perda de pontuação e domínio (`LessonPlayer.tsx:287`, `LessonPlayer.tsx:425`). Não proponho mudar essas regras neste parecer, mas elas são um ponto de atenção para o público.

### Navegação: a quantidade de abas é administrável; as opções internas pesam mais

A navegação principal tem Trilha, Revisar, Simulado e Progresso (`src/App.tsx:27`). Eu manteria essas quatro entradas. O excesso aparece dentro delas: Progresso reúne nível, quatro estatísticas, desempenho, simulados, conquistas e ajustes (`src/screens/ProgressScreen.tsx:59`). Para mudar a meta ou o volume, a pessoa passa por muita informação.

“XP”, “Nv” e “ofensiva” exigem aprender o vocabulário do jogo (`src/screens/Panels.tsx:27`). Na revisão, explicar logo os intervalos “1, 2, 4, 8 e 16 dias” expõe o funcionamento do sistema antes da ação principal (`src/screens/ReviewScreen.tsx:23`). Os rótulos das abas no celular usam 11 px (`src/styles.css:768`), algo a conferir com idosos e ampliação de texto.

Já existem dicas de palavras acionáveis por toque e teclado (`src/components/TermText.tsx:69`), fonte básica de 17 px e suporte a movimento reduzido (`src/styles.css:59`, `styles.css:178`). São fundamentos a preservar. A busca em `src/` não encontrou implementação de leitura por voz.

## 2. Propostas

As propostas são para implementação posterior. P = ajuste pequeno; M = mudança em componentes e validação de uso; G = mudança estrutural. Impacto é uma estimativa, não resultado medido. Nenhuma proposta altera respostas, explicações legais ou fontes.

### 1. Destacar uma ação para começar ou continuar

- **O que é:** colocar antes da estrada um botão com o nome da próxima lição e um convite curto: “Toque aqui para estudar”. Usar a recomendação que já existe no motor. Após a primeira rodada, explicar que a próxima é prática do mesmo assunto.
- **Por que ajuda:** a pessoa pode agir sem entender primeiro os símbolos da trilha.
- **Esforço:** P. **Impacto:** alto.
- **Arquivos que mudariam:** `src/screens/Home.tsx`, `src/styles.css`.
- **Risco/regra:** o botão deve respeitar desbloqueios e rodadas; não criar uma segunda lógica de progressão. Manter “Começar a trilha” no onboarding.

### 2. Reduzir a carga de decisão no onboarding

- **O que é:** deixar a meta atual selecionada e explicar que basta continuar se a pessoa não souber o que escolher. Apresentar o aviso institucional com melhor separação visual e acesso aos detalhes, sem suprimir sua informação.
- **Por que ajuda:** evita que uma escolha inicial pareça uma prova ou compromisso obrigatório.
- **Esforço:** P. **Impacto:** médio.
- **Arquivos que mudariam:** `src/screens/Onboarding.tsx`, `src/styles.css`.
- **Risco/regra:** preservar as quatro metas, o valor padrão e os nomes “Vamos lá” e “Começar a trilha”. Não prometer duração exata a partir de XP.

### 3. Apresentar os cartões em partes pequenas

- **O que é:** distribuir os blocos existentes em partes visíveis, com indicação “Parte 1 de 3”, por exemplo. Manter as condições e exceções junto da regra a que pertencem. O último “Continuar” leva aos exercícios; os anteriores apenas avançam a apresentação do cartão.
- **Por que ajuda:** permite ler e compreender um bloco de cada vez, sem uma página longa.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos que mudariam:** `src/screens/LessonPlayer.tsx`, `src/styles.css`, `src/App.test.tsx`.
- **Risco/regra:** não transformar as partes em novos passos do motor, nem considerar o cartão visto antes do fim. Preservar pelo menos quatro exercícios depois de cada cartão e o conteúdo integral. Evitar excesso de toques: testar primeiro nos cartões mais densos.

### 4. Ensinar como responder antes de cada formato novo

- **O que é:** mostrar uma instrução curta na primeira ocorrência: “Toque em uma resposta. Depois, toque em Verificar”; nos pares, explicar que se escolhe um item de cada lado e que a correção é imediata. Na ordenação, mostrar que existem setas além do arraste.
- **Por que ajuda:** separa a dificuldade de usar o celular da dificuldade do assunto estudado.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos que mudariam:** `src/components/Exercises.tsx`, `src/screens/LessonPlayer.tsx`, `src/styles.css`.
- **Risco/regra:** não revelar a solução ou acrescentar instruções que contradigam a verificação automática dos pares. Manter teclado, leitor de tela e nomes acessíveis existentes. Pode usar estado da sessão, sem mudar a persistência.

### 5. Organizar a correção para leitura em etapas

- **O que é:** manter a resposta e o motivo do erro imediatamente visíveis; permitir expandir a explicação completa, o lembrete e a fonte sem sair da questão. Para pares resolvidos após uma tentativa errada, acrescentar uma mensagem de interface que reconheça a resolução e explique o erro anterior.
- **Por que ajuda:** dá prioridade ao que ensina aquele erro e evita um rodapé cheio de informações concorrentes.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos que mudariam:** `src/screens/LessonPlayer.tsx`, `src/styles.css`.
- **Risco/regra:** preservar integralmente `whyWrong`, `explanation`, `mnemonic` e fontes; não mudar nota ou acerto de primeira. A expansão deve funcionar por teclado, anunciar seu estado e não perder o foco. Conferir depois se a rolagem interna ainda é necessária.

### 6. Oferecer “Ver a explicação de novo” após responder

- **O que é:** após a correção, abrir o cartão que ensina a questão usando o índice já existente. Mostrar as partes “Palavras novas” e “Na prática”, quando presentes. Usar esse rótulo enquanto não houver uma versão realmente mais fácil.
- **Por que ajuda:** permite voltar à base sem sair da lição nem supor que ler uma vez foi suficiente.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos que mudariam:** `src/screens/LessonPlayer.tsx`, `src/content/hints.ts`, `src/styles.css`.
- **Risco/regra:** começar apenas nas lições comuns, depois da resposta. Não liberar por esse caminho dicas antes de responder, nem levar ajuda ao simulado ou às revisões. “Explica de novo, mais fácil” exigiria outro conteúdo pedagógico: depende de pedido explícito e revisão com fontes oficiais, fora desta proposta.

### 7. Preparar leitura em voz alta, opcional

- **O que é:** fazer uma prova técnica de Web Speech API antes da implementação. Se adequada nos aparelhos do público, oferecer “Ouvir texto” e “Parar leitura” nos cartões e exercícios das lições, lendo exatamente o conteúdo mostrado. Ler alternativas em ordem, sem indicar a correta antes da resposta.
- **Por que ajuda:** oferece outro acesso ao texto para quem lê com dificuldade, sem obrigar ninguém a ouvir.
- **Esforço:** M. **Impacto:** alto para esse público, condicionado à qualidade da voz.
- **Arquivos que mudariam:** novo `src/ui/speech.ts`, `src/screens/LessonPlayer.tsx`, `src/components/Exercises.tsx`, `src/styles.css`.
- **Risco/regra:** validar suporte, voz em português, pronúncia das siglas e funcionamento com ou sem conexão na documentação oficial e nos aparelhos antes de prometer o recurso. Sem reprodução automática; cancelar ao trocar de questão ou sair. Separar narração de “Efeitos sonoros”. Se indisponível, o texto continua completo e utilizável. Não incluir no simulado nesta primeira proposta; não exige backend próprio.

### 8. Usar figuras para acompanhar exemplos já existentes

- **O que é:** aproveitar os desenhos próprios para acompanhar o trecho “Na prática”. Nos cartões que contrastam situações, apresentar as figuras lado a lado ou uma abaixo da outra, com a frase correspondente. Priorizar o cruzamento e a diferença visual entre conversão e retorno.
- **Por que ajuda:** torna o exemplo concreto e reduz a necessidade de imaginar uma cena enquanto se lê.
- **Esforço:** M. **Impacto:** médio.
- **Arquivos que mudariam:** `src/screens/LessonPlayer.tsx`, `src/components/SceneArt.tsx`, `src/components/SignArt.tsx`, `src/styles.css`.
- **Risco/regra:** começar com arte existente e fiel ao exemplo. Qualquer cena nova deve ser conferida contra as fontes oficiais já associadas ao conteúdo. Não depender só de cor, não copiar arte de terceiros e fornecer descrição acessível. Movimento é dispensável; respeitar movimento reduzido.

### 9. Deixar detalhes do jogo em segundo plano

- **O que é:** recolher módulos e mundos futuros sob “Ver todos os assuntos”; agrupar detalhes de conquistas e estatísticas no Progresso; permitir chegar aos Ajustes pelo início dessa tela. Explicar XP como “pontos de estudo”, sem exigir que a pessoa entenda níveis para continuar.
- **Por que ajuda:** mantém o foco em aprender e facilita encontrar controles úteis.
- **Esforço:** M. **Impacto:** médio.
- **Arquivos que mudariam:** `src/screens/Home.tsx`, `src/screens/Panels.tsx`, `src/screens/ProgressScreen.tsx`, `src/styles.css`.
- **Risco/regra:** preservar as quatro abas e todos os dados. Expansões precisam de rótulos e estado acessíveis. Não esconder a limitação de cobertura do curso nem sugerir que XP mede prontidão para a prova. Aumentar a legibilidade das abas sem reduzir a área de toque.

### 10. Dar pausas naturais sem encurtar as regras da lição

- **O que é:** mostrar uma pausa opcional entre blocos já existentes, com “Continuar” em destaque e acesso ao diálogo atual de saída. Explicar quando começa a prática e quando começa a revisão de erros. Usar a quantidade da sessão atual em vez de prometer “só mais uma”, pois erros podem ampliar a revisão.
- **Por que ajuda:** torna a duração mais previsível e permite descansar sem pressão.
- **Esforço:** M. **Impacto:** médio.
- **Arquivos que mudariam:** `src/screens/LessonPlayer.tsx`, `src/styles.css`.
- **Risco/regra:** a pausa mantém a página aberta; não prometer retomada após fechar. Hoje sair descarta a sessão. Não reduzir exercícios, retirar rodadas, encurtar revisões ou mudar persistência. Lições realmente menores ou retomada salva exigem autorização específica para mudar essas regras.

## 3. Top 3: por onde começar

1. **Ação principal na trilha (proposta 1).** É uma mudança pequena que pode resolver a dúvida mais básica: “onde eu começo?”.
2. **Cartões em partes (proposta 3).** Atua no maior esforço de leitura observado, aproveitando o material didático existente.
3. **Correção organizada (proposta 5).** Ajuda no momento em que a pessoa mais precisa compreender o assunto e pode estar insegura.

Depois, priorizaria instruções dos exercícios e leitura por voz. A voz tem potencial alto, mas precisa de validação técnica e de compreensão; não deve atrasar as melhorias mais simples.

Para validar essas escolhas em uma etapa futura, convidaria cinco adultos com perfis variados do público, sem tratar baixa escolaridade como falta de capacidade. Pediria que começassem uma lição sem ajuda, explicassem um cartão com suas palavras, respondessem formatos diferentes e contassem o que entenderam após um erro. Observaria hesitação, pedido de ajuda, rolagem e compreensão. A pergunta dos cinco segundos seria: “Onde você tocaria para começar?”. Isso fornece sinais iniciais, não uma prova estatística. Nenhum desses testes foi realizado nesta análise.

## 4. O que NÃO fazer

- Reescrever questões, respostas ou explicações legais para caber na tela. Melhorar primeiro a apresentação do material existente.
- Usar só um macete ou figura e esconder condições e exceções da regra.
- Chamar o recurso de “mais fácil” quando ele apenas repete o mesmo texto.
- Acrescentar novas abas, tutoriais longos ou uma tela de configuração antes do primeiro estudo.
- Remover exercícios e rodadas para cumprir uma promessa de poucos minutos.
- Tocar voz automaticamente, confundir narração com efeitos sonoros ou exigir áudio para aprender.
- Exigir arraste como único meio de ordenar ou usar só cor para explicar acerto e erro.
- Aumentar culpa ao errar ou pedir ajuda; a Lumi deve orientar com respeito.
- Apresentar mundos em construção ou o banco parcial como preparação completa para a prova.
- Copiar personagens, sons ou animações do Duolingo. A identidade própria já oferece uma base adequada.
