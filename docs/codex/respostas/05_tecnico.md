# Análise técnica do CNH Quest

Data: 14/11/2026. Análise por leitura do código e verificações locais, conforme o briefing. Nenhum código, conteúdo ou configuração foi alterado. As propostas abaixo são recomendações, não implementações.

## 1. Diagnóstico

**A base é boa para crescer com mudanças pequenas.** Há regras puras de sessão, correção e progresso, componentes próprios e poucas dependências de produção. O maior risco está em acrescentar mais responsabilidades às telas enquanto várias funcionalidades anteriores ainda estão pendentes de validação.

### Tamanho e responsabilidades

Contagem dos arquivos atuais, incluindo comentários e linhas vazias:

| Arquivo | Linhas | Tamanho em disco | Avaliação |
| --- | ---: | ---: | --- |
| `src/screens/LessonPlayer.tsx` | 435 | 18.297 bytes | Concentra sessão, correção, histórico, dicas, relógio, teclado, sons, combo e apresentação. |
| `src/App.tsx` | 193 | 9.530 bytes | Tamanho razoável, mas mistura navegação, sorteio salvo e conclusão. |
| `src/components/Exercises.tsx` | 455 | 18.238 bytes | Cinco exercícios com complexidades bem diferentes, sobretudo arrastar e associar. |
| `src/styles.css` | 810 | 60.801 bytes | Tokens e seções ajudam; o arquivo único amplia o alcance de mudanças na cascata. |

- **Fácil de evoluir:** o combo já é estado visual local (`LessonPlayer.tsx:74`), separado de `recordAnswer` e `answerCurrent` (`:124`). `Burst` e `Confetti` já existem, respeitam o hook de movimento e dispensam uma biblioteca de animação (`src/components/Fx.tsx:7`, `:52`).
- **Difícil de evoluir:** `check` reúne correção, combo, som atrasado, persistência, revisão de erros, vidas e foco (`LessonPlayer.tsx:115`). Os temporizadores do combo e da vida não têm limpeza ao sair (`:122`, `:131`), ao contrário da sequência sonora de conclusão (`src/screens/CompleteScreen.tsx:51`). Acrescentar efeitos diretamente ali aumenta a chance de tocar um som depois da saída.
- **Proteção contra ações repetidas incompleta:** `next` tem trava contra avanço duplo (`LessonPlayer.tsx:155`); `check` não tem trava equivalente nem guarda de feedback já emitido. A verificação automática de pares e a ação manual convergem nele (`:136`, `:337`). É um risco a testar, não uma duplicação de pontuação comprovada nesta análise.
- **Acoplamento entre telas:** `ExamScreen.tsx:13` importa `SourceList` de `LessonPlayer`. Uma peça compartilhada poderia estar em `components/`; isso também simplificaria uma futura divisão de carregamento.
- **Exercícios já têm boas fronteiras internas:** o despachante é simples (`Exercises.tsx:21`), mas `OrderEx` reúne geometria e ponteiros (`:263`) e `MatchEx` reúne seleção, correção imediata, som e anúncios acessíveis (`:356`). A celebração global deve ocorrer por questão verificada, sem contar cada par como uma questão.
- **Duplicações pequenas:** as duas navegações repetem a montagem dos botões (`App.tsx:141`, `:181`); há embaralhamentos semelhantes em `src/engine/progress.ts:193` e `src/engine/review.ts:53`. Não justificam uma refatoração geral agora. Alterar a ordem das chamadas aleatórias pode mudar os sorteios.
- **Movimento reduzido já existe, com uma ressalva:** o modo `full` pode sobrepor a preferência do sistema tanto no hook (`src/ui/hooks.ts:28`) quanto no CSS (`styles.css:179`). Para atender ao briefing estritamente, a celebração nova deve respeitar a redução pedida pelo sistema; alinhar os controles existentes requer cuidado para não oferecer uma opção que a interface ignore silenciosamente.

### Persistência e progresso antigo

O padrão de extensão opcional já funciona: `draws?`, `theme?` e `roundsDone?` (`src/engine/progress.ts:67`, `:43`, `:9`). O carregador mantém a chave `cnhquest:progress:v1`, aceita a versão 1 e combina valores padrão com o salvo (`src/storage/progressStore.ts:15–33`). A função já se chama `migrate`, mas adicionar campos opcionais não exige uma nova versão nem uma conversão destrutiva dos dados antigos.

Há dois cuidados: o espalhamento é superficial para campos novos, e a coerção `as Partial<ProgressState>` não valida o JSON em tempo de execução. Um objeto da versão 1 com campos de tipos errados ainda pode passar. Além disso, `volatile` é definido só na criação; se `setItem` falhar depois, o estado atualizado fica em memória sem mudar esse aviso (`progressStore.ts:36–56`). Com armazenamento disponível, `load` relê o disco e não usa essa cópia em memória. Não presumir que uma recompensa foi gravada permanentemente.

### Desempenho e rede lenta

- Os imports de telas são estáticos (`App.tsx:9–16`). Os dois mundos, índices de questões, glossário e dicas são montados no módulo de conteúdo (`src/content/index.ts:1–22`). Não há carregamento sob demanda explícito nessa estrutura. Separar apenas uma tela não retiraria os mundos do caminho inicial.
- Há um artefato antigo em `dist/assets`, com data local de 01/11/2026: JS de **401.430 bytes**, CSS de **50.995 bytes**. Comprimidos localmente em memória com gzip, ficaram em **112.838** e **11.354 bytes**, respectivamente. Isso é uma referência histórica, não o tamanho do código atual nem prova da compressão entregue pelo site. Não rodei build.
- Como conta ilustrativa, 124.192 bytes comprimidos de JS + CSS, a 400 kbit/s constantes, levam cerca de **2,5 s só para transferir esses dois arquivos**. Isso não é medição de 3G: faltam HTML, fontes, latência, conexão, processamento do JS e primeiro desenho. Sem compressão, os mesmos dois arquivos somam cerca de 452 kB e levariam aproximadamente 9 s nessa hipótese.
- Nunito vem de uma folha externa do Google Fonts com quatro pesos e `display=swap` (`index.html:9–10`). Há uma dependência adicional de rede; o texto deve continuar legível com a fonte de reserva.
- Os sons não baixam arquivos de áudio: são sintetizados (`src/ui/sound.ts:4`). O código e o custo de síntese continuam existindo. Há contexto reutilizado, deduplicação de 90 ms, respeito ao volume e bloqueio em aba oculta (`:63`, `:177`). O novo hook deve cancelar agendamentos e usar a preferência sonora atual, inclusive se ela mudar enquanto um som está aguardando.
- Boa parte dos efeitos usa transformações e opacidade. Pontos para investigar no celular: brilho com filtro contínuo (`styles.css:663`), desfoque do topo (`:770`), brilho de conquista animando `left` (`:629`) e animações contínuas da Lumi. São candidatos a custo de pintura, sem medição nesta análise. Confete já é limitado a 44 peças e desmonta em 3,8 s (`Fx.tsx:7`, `:26`).
- Toda atualização salva o JSON completo de forma síncrona (`src/state/AppState.tsx:18–24`, `progressStore.ts:54`). O combo atual evita esse custo por ser local. Não persistir partículas, contagens por quadro ou cada passo de animação.
- PWA instalável foi recusada pelo dono em `docs/ESTADO-DO-PROJETO.md`, seção 2. Não incluir manifesto ou service worker nesta etapa. Uma solução offline seria trabalho futuro, se solicitado, com testes próprios de atualização e cache.

### Saúde verificada e pendências

- `npx.cmd --no-install tsc --noEmit`: **passou**, código de saída 0.
- `npm.cmd test`: **não iniciou os testes**. O esbuild falhou ao carregar a configuração, com `Cannot read directory "..": Access is denied`. Não é evidência de falha de um teste do app, e também não permite afirmar que a suíte passou. Os comandos `.cmd` evitaram o bloqueio de execução de `npm.ps1`/`npx.ps1` do PowerShell, sem alterar a política do sistema.
- Há testes de fluxo, teclado, dicas, sorteio salvo, pares, regras e persistência (`src/App.test.tsx:31`, `src/components/match.test.tsx:30`, `src/engine/engine.test.ts:44`, `:439`). O teste de arrastar verifica funções de cálculo (`match.test.tsx:70`); ele não comprova o gesto e a rolagem em aparelho real. Os 61 testes citados no documento de estado são um registro anterior.
- O `git status` atual mostra **22 arquivos rastreados modificados**, e não cerca de 13. O resumo desses arquivos tem 1.791 inserções e 264 remoções. Existem ainda seis arquivos novos de código/teste em `src/`, além de documentação e logs não rastreados. Exemplos críticos: `engine/review.ts`, `content/hints.ts`, `content/glossary.ts` e `components/TermText.tsx`, já importados por arquivos modificados. Um commit que esqueça essas dependências pode funcionar na máquina e falhar no CI.

## 2. Propostas

P = pequeno; M = médio; G = grande, considerando implementação e validação.

### 1. Fechar uma base verificável antes de adicionar funcionalidades

- **O que é:** revisar o diff atual, listar os arquivos novos necessários, executar a suíte em ambiente com leitura permitida e validar no celular os comportamentos já pendentes. Depois, registrar commits coerentes por dependência; se as mudanças estiverem muito entrelaçadas, preferir uma base integrada revisada a separar trechos arbitrariamente. Não publicar automaticamente como parte desta análise.
- **Ajuda a pessoa leiga:** evita que novidades quebrem dicas, tema, ordenação ou progresso que ela já usa.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** os 22 modificados e os novos módulos/testes associados; documentação de estado quando a etapa for efetivamente fechada.
- **Risco/regra:** deixar imports sem seus arquivos, descartar trabalho ou publicar sem a validação pendente. Não incluir logs locais indiscriminadamente.

### 2. Criar uma camada local de celebração, sem escrever no progresso

- **O que é:** `useCelebration` controla combo, evento atual, identidade do evento e limpeza dos timers; `Celebration` apenas apresenta esse evento. Uma função pura pequena decide o visual para cada marco. Começar preservando os gatilhos atuais: chip a partir de 2, destaque a partir de 3 e som nos ímpares a partir de 3. Variar a intensidade visual em marcos como 3, 5 e 10, sem acrescentar bônus.
- **Encaixe:** `check` envia um evento uma única vez após a correção aceita, identificado por sessão + índice da fila. O índice distingue repetições da mesma questão. Um acerto aumenta a sequência e um erro zera, como hoje; cartões não aumentam. Acertos com dica e revisões seguem o comportamento visual atual. Não chamar `recordAnswer`, `addXp` ou `completeLesson` dentro do hook.
- **Marcos finais:** usar `goalReachedNow`, `streakIncreased` e `newAchievements` já calculados no `CompletionOutcome` (`engine/progress.ts:248`), sem recalcular nem conceder recompensas na apresentação. A tela final pode usar o mesmo componente visual com seu próprio ciclo de vida; não precisa de um provedor global.
- **Ajuda a pessoa leiga:** dá reconhecimento claro, sem criar novas regras para entender.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** novos `src/ui/useCelebration.ts`, `src/ui/celebration.ts`, `src/components/Celebration.tsx`; `LessonPlayer.tsx`, `CompleteScreen.tsx` e CSS.
- **Risco/regra:** alterar o significado de combo, contar cada par como questão, emitir eventos duas vezes ou confundir celebração com aumento de XP. O erro recebe apoio, sem humilhação.

### 3. Tornar a celebração leve e acessível por contrato

- **O que é:** efeito breve, junto ao feedback, sem bloquear “Continuar”, sem capturar foco e com `pointer-events: none`. Reutilizar `Burst` para combo e reservar confete para conclusão. Limitar a uma celebração ativa, desmontar partículas e cancelar som ao avançar ou sair. Sem movimento, manter uma mensagem estática de reconhecimento. Evitar anúncio duplicado: o feedback atual já é uma região viva (`LessonPlayer.tsx:313`).
- **Ajuda a pessoa leiga:** permite ler a explicação no próprio ritmo, inclusive com leitor de tela ou sensibilidade a movimento.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** `Celebration.tsx`, `useCelebration.ts`, `Fx.tsx`, `src/ui/hooks.ts`, `src/styles.css`; controles de movimento, se precisarem de alinhamento.
- **Risco/regra:** sobrepor explicação, mudar nomes acessíveis, piscar ou ignorar `prefers-reduced-motion`. Usar os tokens de cor existentes e verificar tema escuro.

### 4. Testar eventos, tempo e invariantes de pontuação

- **O que é:** testar a função pura nos limites 2/3/5/10, erro e reinício de sessão. Com relógio falso, testar desmontagem, cancelamento, mudança do som e preferência de movimento. No fluxo React, verificar que clique/Enter e conclusão automática de pares não duplicam correção ou celebração; acrescentar uma trava de verificação por item se necessário. Comparar os mesmos resultados com celebração ligada e desligada: XP, domínio, Leitner e desbloqueios devem permanecer iguais.
- **Ajuda a pessoa leiga:** evita som fora de hora, pulos de questão e progresso incorreto.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** novos testes de celebração; `src/App.test.tsx`, `src/components/match.test.tsx`, `src/engine/engine.test.ts`; `LessonPlayer.tsx` para a guarda por item.
- **Risco/regra:** testar só classes CSS e deixar passar duplicação real. Não substituir os testes de negócio existentes por snapshots visuais.

### 5. Separar responsabilidades com extrações pequenas

- **O que é:** extrair primeiro `SourceList` para componente compartilhado e o cartão de conceito para uma peça de apresentação. Depois, se necessário, mover o relógio/estado de dicas para hook próprio e separar `OrderEx`/`MatchEx`, mantendo suas interfaces. Fazer em etapas distintas da mudança de comportamento.
- **Ajuda a pessoa leiga:** facilita corrigir uma interação sem causar problemas em outra tela.
- **Esforço:** M. **Impacto:** médio.
- **Arquivos:** `LessonPlayer.tsx`, `ExamScreen.tsx`, `Exercises.tsx` e componentes/hooks extraídos. `App.tsx` só precisaria de extração da preparação da sessão quando essa função crescer.
- **Risco/regra:** remontar exercício, perder seleção ou reiniciar relógio ao mudar chaves e posição dos componentes. Não criar um framework genérico de exercícios agora.

### 6. Planejar campos opcionais com padrões de leitura seguros

- **O que é:** numa implementação futura autorizada, acrescentar um bloco opcional ao `ProgressState`, mantendo chave e versão. Exemplo de desenho, ainda sem regra de concessão:

```ts
engagement?: {
  missions?: { day: string; counts: Record<string, number>; claimed: string[] };
  chest?: { available: number; opened: number };
  streakProtection?: { available: number; usedDays: string[] };
};
```

Ausente significa nenhuma missão registrada e nenhum item concedido. Ler com valores padrão, por exemplo `p.engagement?.chest?.available ?? 0`, e preencher apenas quando ocorrer uma ação válida. Não exigir uma gravação de migração na abertura. Preservar irmãos com espalhamento em cada nível atualizado. No carregador existente, validar apenas os campos novos: objetos, contagens inteiras não negativas, listas e datas coerentes; descartar o trecho novo inválido sem apagar lições, XP ou sorteios.
- **Ajuda a pessoa leiga:** quem já estudou continua com o mesmo progresso ao receber uma atualização.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** `src/engine/progress.ts`, `src/storage/progressStore.ts`, futuro módulo de engajamento e testes de persistência.
- **Risco/regra:** campos opcionais não definem a regra do produto. Proteção de ofensiva muda o cálculo de dias (`progress.ts:272`); não é só animação e depende de pedido explícito. Missão e baú não devem alterar XP nesta proposta. Usar a data local de `dayKey` (`:100`); sem servidor, não prometer proteção contra alteração do relógio nem sincronização entre aparelhos.

### 7. Cobrir compatibilidade e falha de gravação

- **O que é:** testar JSON antigo sem o bloco novo, dados parciais, persistência após uma resposta, recarga e reset; testar tipos inválidos e armazenamento que começa a lançar erro após a sondagem. Tornar a indisponibilidade após falha visível no contexto e preservar a cópia recente em memória durante a sessão. Resgates futuros devem ser idempotentes: repetir a mesma ação não abre dois baús nem consome duas proteções.
- **Ajuda a pessoa leiga:** reduz perda silenciosa e evita prometer que algo foi salvo quando só está na memória.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** `progressStore.ts`, `AppState.tsx`, testes próprios do armazenamento e fluxo de aviso existente.
- **Risco/regra:** não apagar progresso por um campo novo inválido, nem adiar a gravação de respostas para otimizar efeitos visuais. A aparência do aviso deve continuar simples.

### 8. Organizar CSS sem mudar tudo de uma vez

- **O que é:** iniciar com uma seção isolada de celebração, classes próprias e tokens atuais. Se a manutenção continuar difícil, separar tokens, base, exercícios, efeitos e telas em arquivos com ordem de importação explícita. Reduzir animações contínuas e trocar o deslocamento do brilho por `transform` quando for validado visualmente.
- **Ajuda a pessoa leiga:** mantém consistência de botões e leitura, com menos distração em celular simples.
- **Esforço:** M. **Impacto:** médio.
- **Arquivos:** `styles.css`, futuros estilos separados e `src/main.tsx` se os imports mudarem.
- **Risco/regra:** separar CSS melhora manutenção, mas não reduz necessariamente o download. A cascata, os temas e as regras de redução de movimento precisam manter a precedência.

### 9. Medir antes de dividir o carregamento

- **O que é:** numa etapa posterior autorizada, produzir build atual e medir bytes brutos/comprimidos, rede lenta e resposta em celular. Considerar `React.lazy` para Simulado e Progresso apenas se o ganho compensar a espera ao abrir essas abas. Usar estado de carregamento legível. Antes disso, tirar o import de `SourceList` entre telas. Conforme novos mundos chegarem, planejar a separação entre resumo da trilha e conteúdo detalhado, porque o índice central hoje carrega todos.
- **Ajuda a pessoa leiga:** reduz a espera inicial sem deixá-la diante de uma tela vazia.
- **Esforço:** M para telas; G para conteúdo por mundo. **Impacto:** médio agora, potencialmente alto com expansão.
- **Arquivos:** `App.tsx`, `src/content/index.ts`, componentes compartilhados e configuração de build apenas se a medição justificar.
- **Risco/regra:** criar mais viagens de rede, falha de chunk após atualização ou retirar conteúdo necessário à revisão/simulado. Não adicionar biblioteca de animação nem PWA para tentar resolver isso.

## 3. Top 3 e ordem segura

1. **Fechar a base pendente e a verificação (proposta 1).** Há alterações amplas e arquivos novos necessários ainda fora do Git; a suíte desta sessão não executou. Revisar, testar em ambiente permitido e obter a validação de celular já registrada no projeto precede novas funcionalidades.
2. **Implementar celebração local com acessibilidade e testes (propostas 2–4).** É o caminho de maior efeito visível com menor interferência no motor. Fazer um commit de extrações necessárias e outro da funcionalidade testada, preservando as regras atuais.
3. **Preparar compatibilidade e falhas de armazenamento antes de recompensas persistentes (propostas 6–7).** Primeiro testar leitura antiga, reset e gravação; só depois implementar missões/baú quando solicitados. A proteção de ofensiva precisa de definição e autorização próprias por alterar regra de progressão.

Após esses passos, organizar CSS e medir o carregamento. Não misturar nova gamificação, refatoração ampla, mudanças pedagógicas e publicação numa única etapa. Nenhum commit ou push foi feito nesta análise.

## 4. O que NÃO fazer

- Acrescentar mais timers soltos e gravações dentro de `check`, ou tocar sons dentro de atualizadores de estado. O app usa `StrictMode` (`src/main.tsx:8`); atualizadores precisam continuar previsíveis.
- Dar XP por combo ou por renderização de uma comemoração. Recompensa visual não deve mudar domínio, dicas, revisão ou simulado.
- Salvar o estado de cada animação, guardar um histórico ilimitado de eventos ou conceder itens automaticamente porque um campo está ausente no progresso antigo.
- Tratar um baú ou proteção de ofensiva como simples campo opcional: a compatibilidade do JSON não resolve as regras de resgate, consumo e datas.
- Bloquear “Continuar” enquanto a animação termina, ocultar explicações, forçar som ou transformar erro e perda de sequência em culpa.
- Instalar biblioteca pesada, copiar assets do Duolingo, criar service worker ou prometer funcionamento offline nesta etapa.
- Declarar desempenho em 3G, fluidez, qualidade sonora ou suíte aprovada sem observação correspondente. Os tamanhos de `dist` são antigos; os testes ficaram bloqueados pelo ambiente.
- Alterar respostas, explicações legais, fontes ou regras de XP para facilitar a implementação técnica.
