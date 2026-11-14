# Revisão independente do PLANO-v1 — CNH Quest

Análise de 14/11/2026. Li o briefing, o estado do projeto, as cinco respostas, o plano e o código relacionado. Não executei navegador, servidor, instalação, testes ou avaliação audiovisual. Esta entrega altera apenas este relatório. As referências de linha são do código local atual; confirmação por leitura não equivale a confirmação de uso em aparelho real.

**Parecer:** o plano é uma boa base, mas eu não o aprovaria na ordem proposta. Ele organiza bem as celebrações e preserva o motor, porém adia barreiras de leitura, mistura riscos com bugs comprovados e deixa decisões de persistência sem marcação. O primeiro resultado deveria ser: a pessoa encontra onde começar, consegue responder e entende a correção; junto disso, recebe uma celebração pequena e agradável.

## 1. O que ficou faltando ou foi distorcido

| Origem | Diferença no plano | Ajuste recomendado |
|---|---|---|
| `01_simplicidade.md`, propostas 2 e 5 | “A meta já vem selecionada” aparece como melhoria futura, mas isso já ocorre com 20 XP em `src/screens/Onboarding.tsx:14` e `:59`. A mensagem que explica pares resolvidos após erros sumiu da correção em camadas. | Tratar a meta como comportamento a preservar; explicar “Você resolveu os pares; houve uma tentativa incorreta antes”, sem mudar a nota. |
| `01_simplicidade.md`, propostas 8–10 | Sumiram figuras junto dos exemplos existentes, acesso mais direto aos Ajustes e pausas opcionais entre blocos. | Registrar como adiadas, em vez de aparentar que o plano absorveu tudo. Priorizar Ajustes acessíveis e previsibilidade da revisão; figuras novas podem esperar. Pausa de sessão não pode prometer retomada após fechar a página. |
| `01_simplicidade.md`, validação; `04_acessibilidade.md`, proposta 10 | Não há etapa clara de observação com pessoas idosas, com dificuldade de leitura e pouca prática com celular. | Incluir tarefas de começar, explicar um cartão com as próprias palavras, responder e entender um erro. Isso vale mais para a simplicidade que aprovar só a aparência. |
| `02_engajamento.md`, propostas 1–2 | O cartão Hoje fala em “N questões”, mas a revisão existente limita a sessão a 12 (`src/screens/ReviewScreen.tsx:28`). O fechamento perde a ressalva sobre revisões vencidas hoje. | Mostrar o tamanho real da sessão, `min(12, pendentes)`, e não prometer amanhã quando ainda há questões para hoje. Consultar apenas caixas elegíveis abaixo de 5. |
| `02_engajamento.md`, propostas 3–4 | Sumiram a conquista de presença na prática e os cuidados com amostra, formatos diferentes de simulado e histórico incompleto por módulo. | Revisar também `ofensiva-3` na prática; mostrar limite e formato de cada resultado. Não reconstruir evolução por módulo usando só erros salvos. |
| `02_engajamento.md`, proposta 6 | A missão perdeu a exigência de manter alvo e conclusão estáveis no dia. Só o bônus de XP está marcado como decisão. | Ou usar a recomendação do cartão Hoje, sem sistema de missão, ou decidir explicitamente os campos salvos. Sem isso, a missão pode mudar ao recarregar. |
| `03_animacoes.md`, propostas 1–2 | A origem manda atualizar apenas o número depois de 10. O plano adiciona festas em 15, 20… e muda “10 acertos seguidos!” para “Em ritmo de estrada”. | Retirar as repetições inicialmente e manter texto literal, mais fácil de entender. Essa ampliação não veio da análise citada. |
| `03_animacoes.md`, propostas 6 e 9 | O resumo da perfeição omite `result.completed` e `total > 0`; o componente decorativo fica `aria-hidden`, mas não se explicita onde ficará a mensagem acessível. Também sumiram cancelamento ao ocultar a página/abrir diálogo e troca de preferência durante a cena. | Usar a condição completa e colocar número/frase no feedback acessível existente. Cancelar efeitos em todas essas situações, sem apagar a informação estática. |
| `04_acessibilidade.md`, diagnóstico 5–9 e propostas 2–5 | Faltam foco no novo enunciado, restauração de foco após desabilitar controles, retorno das lacunas, anúncio de posição e o balão de palavra que fecha ao sair do acionador. Parte da ordenação aparece só na última fase. | Levar o fluxo acessível para a primeira entrega utilizável; incluir teclado, toque, leitor de tela e ampliação. |
| `05_tecnico.md`, propostas 1 e 6–7 | A base virou sobretudo revisão do diff/commit. Ficaram de fora a validação pendente no celular, a compatibilidade do progresso e a falha de gravação após o armazenamento inicialmente funcionar. | Incluir essas verificações antes de novas recompensas salvas. Não é necessário criar um bloco genérico de engajamento agora. |
| `05_tecnico.md`, diagnóstico de movimento e propostas 5 e 9 | O plano usa o hook existente, mas não resolve a opção `full` que sobrepõe a redução do sistema. Extrações pequenas e medição do carregamento também ficaram fora. | Resolver a precedência de movimento antes dos novos efeitos; manter extrações e medições como trabalho condicionado à necessidade, sem refatoração geral. |

Nem toda exclusão é um erro: deixar baú, cache offline e divisão de carregamento fora da primeira entrega é sensato. O problema é não distinguir “adiado” de “incorporado”. Há também divergência legítima entre as origens: a resposta 05 começa preservando os sons atuais nos ímpares; a 03 propõe sons apenas nos marcos. Recomendo a 03, com um som substituindo o acerto comum, e registrar essa escolha.

## 2. Conferência de cada alegação da Fase 1

Os itens 3a–3c abaixo separam as três alegações de teclado. “Parcial” significa que há evidência de parte do problema, mas a consequência foi descrita de modo amplo demais.

| Item | Veredito | Evidência e alcance |
|---|---|---|
| 1. `check` sem trava e verificação duplicada | **Parcial** | A ausência de guarda é confirmada: `src/screens/LessonPlayer.tsx:115` só verifica questão/item/resposta pronta; não verifica `fb` nem uma trava por item. O timer dos pares chama a mesma função em `:139`, e o botão manual em `:337`. Porém, após feedback o botão troca e o efeito cancela o timer (`:138`–`:141`); Enter em botão comum é ignorado pelo listener global (`:180`). Portanto, “duplo clique/Enter/pares duplicam” não está demonstrado para todos esses caminhos. Se duas chamadas entrarem antes da atualização, `recordAnswer` pode contar duas vezes (`:125`; `src/engine/progress.ts:112`) e `answerCurrent` também incrementa respostas sem guarda (`src/engine/session.ts:80`). Criar trava síncrona por sessão + índice e teste de concorrência; não afirmar XP duplicado comprovado. |
| 2a. Timer de som do combo após sair | **Confirmado** | O `setTimeout` de `src/screens/LessonPlayer.tsx:122` não guarda identificador nem tem limpeza. Pode chamar `play` após sair ou avançar. A reprodução audível ainda depende das condições do áudio; não ouvi o efeito. |
| 2b. Timer de vida após sair | **Parcial** | O timer de `src/screens/LessonPlayer.tsx:131` também não tem limpeza, mas só chama `setHeartHit(false)`: ele não toca som. Corrigir a redação para “callback pendente após saída”. Limpar também o `requestAnimationFrame` de foco em `:133`. |
| 3a. Rádio eliminado pode retirar entrada por Tab | **Confirmado** | Sem seleção, `focusIndex` vira 0 em `src/components/Exercises.tsx:108`. Se esse item for o eliminado, fica desabilitado (`:114`, `:126`), e todos os demais recebem `tabIndex=-1` (`:124`). A entrada deve ser o primeiro rádio habilitado. |
| 3b. Atalhos numéricos atrás de diálogo | **Confirmado** | O listener global em `src/components/Exercises.tsx:83` não consulta diálogo/foco no exercício e seleciona e move foco em `:90`–`:91`. `Dialog` trata Escape e Tab, sem bloquear números nem tornar o fundo inerte (`src/components/Fx.tsx:86`, `:115`). A guarda dos diálogos em `LessonPlayer.tsx:178` protege apenas Enter. |
| 3c. Anúncio dos pares preso na mensagem anterior | **Confirmado** | `tryPair` grava `live` em `src/components/Exercises.tsx:383` e `:388`; nova seleção em `:393`–`:397` não o limpa. A expressão em `:412` prefere `live` à mensagem “Selecionado…”. Isso confirma a prioridade errada no texto; a fala efetiva precisa de leitor de tela. |
| 4. Ofensiva vencida continua exibida | **Confirmado** | `studiedToday` só compara com hoje (`src/screens/Panels.tsx:11`); o número exibido e o nome acessível usam diretamente o valor salvo (`:27`–`:28`). O Progresso repete esse valor em `src/screens/ProgressScreen.tsx:71`. A contagem só é reiniciada no próximo XP positivo (`src/engine/progress.ts:278`). Corrigir ambas as telas, preservando a sequência de ontem ainda válida e o recorde. Não zerar só porque a pessoa ainda não estudou hoje. |
| 5. Texto promete 16 dias, caixa 5 não volta à fila | **Confirmado** | `BOX_INTERVALS` contém 16 (`src/engine/progress.ts:105`) e a data é calculada em `:115`, mas a fila exige `box < 5` em `:129`. A promessa aparece em `src/screens/ReviewScreen.tsx:24`. Além disso, uma questão inédita começa na caixa 1 e o primeiro acerto de primeira a leva à 2 (`progress.ts:109`–`:110`): não basta apagar “16” para explicar perfeitamente os intervalos. Preferir texto simples sobre revisões conforme o desempenho, sem lista exata. Fazer caixa 5 retornar seria mudança de regra separada. |
| 6. Prática cumpre meta sem conceder conquista | **Confirmado** | `src/App.tsx:89`–`:91` chama `addXp`, mas devolve `newAchievements: []` e o estado sem concessão. `addXp` só informa a passagem da meta (`src/engine/progress.ts:283`); a concessão está em `completeLesson`, `:312`, não chamado na prática. O mesmo desvio afeta `ofensiva-3` (`:313`). |

### Outros erros e riscos do plano

- **“Sem mudar regra de produto” é amplo demais.** Conceder conquistas também na prática muda comportamento de recompensa. É uma correção coerente, mas precisa aparecer como decisão explícita, conforme a resposta 02, proposta 3. Corrigir só o texto do Leitner e a exibição da ofensiva não exige mudar os cálculos.
- **Há decisões de dados sem marcação.** Data da prova, horário de lembrete, missão estável e pausa semanal exigem especificar armazenamento, padrões para dados antigos e reset. Um arquivo `.ics` não precisa, por si só, salvar preferência. A resposta 05 recomenda compatibilidade antes dessas extensões.
- **“Progresso honesto” está tarde e com título arriscado.** “Estou pronto para a prova?” pode sugerir uma conclusão que o banco parcial não sustenta. Prefiro “O que você já estudou”. Explicitar a cobertura também antes de iniciar o simulado, não somente em Progresso (`src/screens/ExamScreen.tsx:86`, conforme a resposta 02).
- **Ocultar o aviso inteiro é mais forte que a recomendação original.** A resposta 01 pede organizar detalhes sem suprimir informação. Manter visível uma frase curta sobre questões originais e app independente; recolher os detalhes, não a transparência essencial.
- **`aria-hidden` deve valer para a decoração.** Se o marco só existir dentro de `Celebration`, desaparece para tecnologia assistiva. A frase precisa integrar o feedback existente (`src/screens/LessonPlayer.tsx:313`), sem outro anúncio assertivo concorrente.
- **O orçamento visual precisa incluir os efeitos antigos.** Já existe `Burst count={8}` a cada acerto (`src/screens/LessonPlayer.tsx:316`). Somar 6 partículas de combo não respeita o teto anunciado. Nos marcos, substituir o efeito comum; no final perfeito, substituir o confete existente, não somar.
- **Redução de movimento ainda tem conflito real.** `src/ui/hooks.ts:28` e `src/styles.css:179` permitem que `full` sobreponha o sistema. Definir uma política visível e coerente com o briefing; minha recomendação é a preferência mais restritiva prevalecer. Não basta dizer que o hook já resolve.
- **Contrastes são indícios específicos, não laudo completo.** Os números do plano vêm da resposta 04 e de cores sólidas; faltam estados, gradientes e tema escuro. Conferir os usos antes de trocar tokens, sem recolorir placas pedagógicas.
- **A revisão da base não termina no commit.** Os 61 testes são execução relatada pelo Claude; não os executei nesta revisão. Aprovação por fase não substitui verificação. Um commit por fase pode ser grande demais; dividir por mudanças revisáveis e dependências, sem impor um ritual de aprovação para cada ajuste cosmético.

## 3. Ordem recomendada

**Eu trocaria `0 → 1 → 3 → 2 → 4 → 5` por esta sequência:**

1. **Fechar a base existente:** revisar alterações e arquivos novos juntos, conferir testes/TypeScript e planejar validação dos comportamentos já pendentes no celular. Sem incluir publicação automática. A leitura atual confirma arquivos modificados e novos necessários; não autoriza descartá-los nem reescrevê-los.
2. **Garantir que a pessoa consegue estudar:** travas, cancelamento, foco, atalhos, pares, contraste, rolagem da ordenação e do feedback. Incluir coerência do movimento reduzido. Ofensiva exibida e texto do Leitner entram aqui; conquista da prática depende da decisão de recompensa.
3. **Entregar um pacote pequeno de clareza e satisfação:** cartão Hoje, instruções dos formatos e combo inicial em 3/5/10, com movimentos concorrentes reduzidos. Mostrar também o limite do banco no simulado. Assim o pedido de animação aparece cedo, sem preceder a capacidade de ler e responder.
4. **Melhorar compreensão e retorno:** experimentar cartões densos em partes, correção em camadas, explicação de novo e fechamento do dia. Validar com pessoas do público antes de aplicar a divisão a todos os cartões.
5. **Ampliar só com evidência:** letra grande e protótipo de voz conforme dificuldades observadas; carrinho e final perfeito depois da base de combo; missões, novas conquistas, pausa semanal e calendário apenas se ainda trouxerem benefício claro.

Acessibilidade acompanha cada etapa, não é uma fase final. Conteúdo novo tem uma frente própria, com autorização e fontes oficiais; a ausência dos outros assuntos deve ser informada desde já. Não é necessário esperar seis mundos novos para melhorar a interface, nem prometer preparo completo enquanto faltam assuntos.

## 4. A escada de combo para pessoas leigas

**Recomendo começar com três marcos: 3, 5 e 10.** O chip pode continuar aparecendo em 2. Em 3, uma expansão curta; em 5, um gesto da Lumi; em 10, a cena breve de estrada, quando estiver validada. Enquanto a cena de 10 não estiver pronta, usar uma pose própria e estática ou simples. Sem festa extra em 7, 15, 20… na primeira versão; o número continua crescendo.

Quatro marcos não são necessariamente incompreensíveis: a pessoa não deveria ter de memorizar nenhum deles. Ainda assim, 5 e 7 ficam próximos, e o plano acumula chip, Lumi, barra, faíscas, carro e texto. Três marcos permitem testar satisfação com menos trabalho e menos interrupção. Em lições de oito questões, não alcançar 10 é normal; não alongar sessões para mostrar a animação.

Para tornar o combo agradável:

- Dizer “5 acertos seguidos!”, sem “combo”, promessa de bônus ou metáfora no texto principal.
- Usar gesto diferente por marco, em área reservada e sem deslocar a explicação. A barra continua mostrando somente o progresso real.
- Fazer o som do marco substituir `correct`, com volume estável. Respeitar silêncio e cancelar ao continuar, sair, abrir diálogo ou ocultar a página.
- Manter feedback e Continuar imediatamente disponíveis. A cena pode durar menos de um segundo; número e frase continuam legíveis depois dela, inclusive no modo reduzido.
- Contar a questão de pares uma única vez, não cada par. Preservar dica e revisão no combo visual; cartões não alteram a sequência. Não chamar isso de perfeição.
- Recomeçar os marcos após erro sem aviso de perda e sem reprovação da Lumi. Reconhecer também quem conclui com dificuldade.

O final perfeito fica separado: `result.completed && result.total > 0 && result.correctFirstTry === result.total`. Isso preserva a diferença entre acertar em sequência, dominar e acertar tudo de primeira. O prazer virá de resposta imediata e variedade pequena; não há evidência de que mais partículas ou marcos aumentem o retorno.

## 5. Propostas concretas para revisar o plano

P = pequeno; M = médio; G = grande. Esforço e impacto são estimativas. As oito propostas abaixo não autorizam implementação.

| Proposta — o que é e por que ajuda | Esforço | Impacto | Arquivos que mudariam | Risco ou regra |
|---|---|---|---|---|
| **1. Base e correção única:** conferir dependências, proteger uma verificação por item e cancelar timers/foco pendentes; evita resposta registrada duas vezes e som fora de hora. | M | alto | `LessonPlayer.tsx`, testes de interface, documentação da base | Não mudar correção, vidas ou sorteios; não esquecer arquivos novos no commit. |
| **2. Caminho acessível completo:** corrigir rádios, diálogos, foco novo, anúncios e alça de ordenar; permite concluir sem depender de gesto ou cor. | M | alto | `Exercises.tsx`, `Fx.tsx`, `LessonPlayer.tsx`, `App.tsx`, `ExamScreen.tsx`, testes | Preservar correção automática, erros dos pares e nomes acessíveis. |
| **3. Leitura confortável:** ajustar contraste e retirar disputa de rolagem; facilita ler ajuda e fontes. | M | alto | `styles.css`, `LessonPlayer.tsx`, telas de resultado | Conferir zoom/tema; manter explicações integrais e cores das placas. |
| **4. Hoje com um próximo passo:** mostrar sessão real de até 12 revisões ou lição liberada e seu estado final; reduz decisões ao abrir. | M | alto | `Home.tsx`, `Panels.tsx`, `App.tsx`, `styles.css` | Reutilizar desbloqueios e tratar fim de conteúdo; não criar missão paralela. |
| **5. Combo pequeno e acessível:** eventos locais, marcos 3/5/10 e redução de efeitos antigos; reconhece esforço sem interromper leitura. | M; G com cena nova completa | alto | novos `celebration.ts`, `useCelebration.ts`, `Celebration.tsx`; `LessonPlayer.tsx`, `hooks.ts`, `sound.ts`, `styles.css`, testes | Sem XP novo, persistência ou anúncio duplicado; sistema reduzido respeitado. |
| **6. Compreensão em etapas:** testar um cartão denso dividido, instruções e correção expansível, incluindo histórico dos pares; ajuda a entender o que fazer e por que errou. | M | alto | `LessonPlayer.tsx`, `Exercises.tsx`, `styles.css`, `App.test.tsx` | Não separar exceção da regra, considerar cartão visto cedo nem criar cliques excessivos. |
| **7. Fechamento e progresso honestos:** mensagem de pausa, próxima data elegível e limites do banco também no simulado; dá motivo útil para voltar. | M | alto | `CompleteScreen.tsx`, `ProgressScreen.tsx`, `ExamScreen.tsx`, `Panels.tsx`, `progress.ts` | Não prever aprovação nem inventar histórico/data; corrigir exibição sem mudar Leitner/ofensiva. |
| **8. Validar antes de ampliar:** tarefas com público, aparelhos modestos, teclado/leitor, zoom e teste de gravação; encontra bloqueios que código não mostra. | M | alto | roteiro em `docs/`, testes de interface e armazenamento; `progressStore.ts`/`AppState.tsx` se corrigida falha | Validação futura, fora desta análise; não declarar acessibilidade, fluidez ou retenção comprovadas antecipadamente. |

## 6. Decisões que o dono precisa tomar

Cada linha traz a decisão e minha recomendação.

1. **Qual deve ser a primeira entrega?** Recomendo acesso e leitura básicos, cartão Hoje e combo pequeno, antes de novas recompensas.
2. **Quais marcos terão festa?** Recomendo 3, 5 e 10; depois disso, só atualizar o número, sem XP extra.
3. **O que prevalece quando o aparelho pede menos movimento?** Recomendo respeitar a opção mais restritiva e explicar isso nos Ajustes.
4. **Como apresentar cartões longos?** Recomendo testar um cartão em partes antes de dividir todos, mantendo regra e exceções juntas.
5. **O que ficará visível na correção?** Recomendo resposta e motivo imediato, com toda a explicação e fonte acessíveis sem rolagem interna difícil.
6. **A prática deve conceder conquistas de meta e presença?** Recomendo sim, com concessão única, sem mudar o XP já calculado.
7. **O simulado deve contar como dia estudado?** Recomendo reconhecer somente a conclusão, independentemente de passar, e decidir separadamente sua contribuição para a meta, pois hoje presença depende de XP.
8. **A caixa 5 deve voltar automaticamente?** Recomendo manter a regra nesta etapa e corrigir o texto; mudar o agendamento merece análise pedagógica separada.
9. **É necessária uma missão além da meta e do cartão Hoje?** Recomendo começar sem ela e sem bônus; adicionar apenas se a orientação atual se mostrar insuficiente.
10. **Adicionar conquistas e pausa semanal agora?** Recomendo adiar ambas até resolver reconhecimento da prática e exibição da ofensiva, sem inventar presença passada.
11. **Salvar letra grande e data da prova?** Recomendo priorizar letra grande; salvar campos opcionais só com compatibilidade e reset definidos, deixando calendário para depois.
12. **Investir em voz e fonte local?** Recomendo fonte local com licença conferida e protótipo de voz sob demanda, sem prometer voz pt-BR ou funcionamento offline universal.
13. **Como validar e publicar?** Recomendo testar a entrega concreta no celular e publicar só com o pedido do dono; as restrições desta revisão não autorizam navegador nem publicação.

## 7. Se eu só pudesse fazer cinco coisas do plano — Top 3 primeiro

1. **Eliminar barreiras para responder e ler:** teclado, foco, anúncios, contraste e rolagem. É o requisito de “qualquer pessoa”, não acabamento.
2. **Colocar o cartão Hoje antes da trilha:** uma ação clara, com quantidade correta e sem lição bloqueada. É a melhoria mais direta para começar sem ajuda.
3. **Entregar combo 3/5/10 com cancelamento e menos movimento concorrente:** atende cedo ao pedido explícito de celebrações, sem interferir no aprendizado.
4. **Organizar cartões densos e correção:** preservar tudo, mas permitir leitura em blocos e entender o erro, inclusive nos pares. Validar primeiro num caso.
5. **Fechar o dia com progresso honesto:** mostrar o que foi feito, o limite do banco e a próxima revisão real, permitindo parar sem culpa.

Fechar a base, executar verificações e observar uso real são condições dessas cinco entregas, não funcionalidades extras que se pode cortar para caber no limite.

## 8. O que NÃO fazer

- Implementar toda a escada, missões, calendário e proteção antes de testar se a pessoa entende a primeira lição.
- Transformar risco de dupla chamada em relato de XP duplicado sem reprodução ou teste correspondente.
- Esconder aviso de cobertura, fontes ou condições legais para reduzir texto.
- Criar bônus por combo, perfeição obrigatória, velocidade, culpa por ausência ou dificuldade para parar.
- Tratar uma animação de 1 ms como apresentação estática suficiente ou deixar `aria-hidden` ocultar a única mensagem do marco.
- Confundir acerto com dica ou na revisão com todos os acertos de primeira.
- Adicionar campos persistentes sem autorização e compatibilidade, ou prometer que progresso local significa retomada/offline/sincronização.
- Copiar arte, sons ou animações do Duolingo; a Lumi e a estrada já oferecem identidade própria.
- Declarar testes, som, fluidez, retenção ou conformidade como verificados nesta revisão por leitura.
