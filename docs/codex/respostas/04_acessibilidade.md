# Acessibilidade e inclusão — CNH Quest

Análise em 14/11/2026, baseada no briefing, no estado do projeto e na leitura do código atual. Apenas este relatório foi criado. Não executei navegador, servidor, instalação ou testes. Não houve teste com leitor de tela, zoom, aparelho real ou áudio: os riscos abaixo precisam dessa validação antes de declarar conformidade com WCAG 2.2. Os cálculos de contraste usam as cores sólidas do CSS; não substituem a avaliação de gradientes, transparências e estados renderizados.

## 1. Diagnóstico

### O que já ajuda

- **Boa base para leitura:** corpo de 17 px, entrelinha 1,5 e conteúdo da lição limitado a 660 px (`src/styles.css:59`, `src/styles.css:164`, `src/styles.css:410`). Cartões divididos em palavras novas, passos, exemplo e resumo ajudam quem lê com dificuldade (`src/screens/LessonPlayer.tsx:233`). O idioma está declarado como português brasileiro e o viewport não bloqueia zoom (`index.html:2`).
- **Muitos alvos grandes:** botões principais com 50 px, alternativas com 62 px e palavras com 48 px de altura (`src/styles.css:191`, `src/styles.css:465`, `src/styles.css:493`). As setas de ordenar têm nomes que identificam a ação e o item, e área de 44 × 44 px (`src/components/Exercises.tsx:344`, `src/styles.css:215`).
- **Alternativas ao gesto:** ordenar já funciona por botões, sem exigir arraste (`src/components/Exercises.tsx:274`). Pares usam botões comuns nas duas colunas e permitem começar de qualquer lado (`src/components/Exercises.tsx:393`). São bases úteis para teclado e para o critério 2.5.7, sobre alternativa ao arraste.
- **Semântica presente:** alternativas têm grupo de rádio, seleção e navegação por setas; há foco visível, nomes para placas/cenas e progresso identificado (`src/components/Exercises.tsx:98`, `src/components/Exercises.tsx:111`, `src/styles.css:172`, `src/components/Visual.tsx:6`, `src/screens/LessonPlayer.tsx:203`). Acerto e erro também aparecem em texto e símbolos, além da cor (`src/components/Exercises.tsx:123`, `src/screens/LessonPlayer.tsx:313`).
- **Preferências úteis:** temas claro/escuro, volume, som desligável e animações reduzidas em Ajustes (`src/screens/ProgressScreen.tsx:134`). O CSS reduz duração e repetição; confetes e partículas deixam de renderizar e os números deixam de contar gradualmente (`src/styles.css:177`, `src/components/Fx.tsx`, `src/ui/hooks.ts:16`). Movimento reduzido não desliga som, o que permite escolhas independentes.
- **Pouca dependência de mídia remota:** placas/cenas são SVG e sons são sintetizados localmente (`src/components/Visual.tsx:6`, `src/ui/sound.ts:4`). Isso favorece celulares simples e conexões lentas.

### O que atrapalha ou merece verificação

1. **Contraste insuficiente em combinações concretas.** `--text-3` (#7f8b94) sobre branco dá aproximadamente **3,49:1**: abaixo de 4,5:1 para texto comum. Aparece em legendas de alternativas e fontes (`src/styles.css:46`, `src/styles.css:489`, `src/styles.css:544`). Branco sobre `--green` dá **2,74:1**; o cabeçalho usa um gradiente que começa nessa cor (`src/styles.css:288`). Branco sobre `--gold` dá **1,73:1**: conferir os títulos das caixas de resultado, cujo fundo usa `--c` (`src/styles.css:619`). `--green-ink` sobre `--green-soft` no tema claro dá **3,52:1**, combinação usada em respostas corretas (`src/styles.css:88`, `src/styles.css:500`). Já branco sobre `--green-btn` dá **4,55:1** no estado sólido normal. A análise não cobre todos os estados ou o tema escuro. Referências: 1.4.3 e 1.4.11; texto desabilitado tem exceção normativa, mas ainda pode ser difícil de entender.
2. **Texto importante fica pequeno.** Legendas de 13–14 px e pares reduzidos a 15 px no celular exigem mais esforço de baixa visão (`src/styles.css:61`, `src/styles.css:571`, `src/styles.css:584`). Letras maiúsculas e espaçadas em botões e etiquetas podem dificultar reconhecer palavras (`src/styles.css:192`, `src/styles.css:413`). Não há modo de letra grande nos Ajustes. Pixels não impedem necessariamente o zoom do navegador, mas dificultam uma escala própria consistente.
3. **Pode faltar entrada de teclado no grupo de rádio após uma dica.** `focusIndex` cai no índice zero quando não há seleção; esse botão pode ser justamente o eliminado e desabilitado. Os demais ficam com `tabIndex=-1` (`src/components/Exercises.tsx:108`, `src/components/Exercises.tsx:124`). Assim, Tab pode pular todas as alternativas. O atalho numérico não substitui uma sequência normal de foco.
4. **Atalhos globais continuam ativos atrás de diálogos.** As teclas 1–9 são ouvidas em `window`, sem limitar o foco ao exercício ou oferecer desligamento (`src/components/Exercises.tsx:83`). O diálogo contém Tab e Escape, mas não isola o restante da página; só o Enter da lição verifica se há confirmação aberta (`src/components/Fx.tsx`, `src/screens/LessonPlayer.tsx:178`). Pode haver seleção e mudança de foco por trás da confirmação. Referências: 2.1.4 e 2.4.3.
5. **Mudanças de etapa não orientam bem o foco.** Ao corrigir, o foco vai para Continuar; ao avançar, o corpo é remontado, sem foco explícito no novo enunciado (`src/screens/LessonPlayer.tsx:133`, `src/screens/LessonPlayer.tsx:155`, `src/screens/LessonPlayer.tsx:219`). Nas abas e no simulado há rolagem para o topo, mas não anúncio/foco do conteúdo novo (`src/App.tsx:43`, `src/screens/ExamScreen.tsx:174`). O risco é continuar sem perceber a próxima pergunta.
6. **Pares têm anúncio que pode ficar preso no resultado anterior.** A expressão `live || (...)` dá prioridade à última mensagem, e `click` não limpa `live` ao selecionar novamente. Depois do primeiro par, o novo “Selecionado…” pode não ser anunciado (`src/components/Exercises.tsx:379`, `src/components/Exercises.tsx:393`, `src/components/Exercises.tsx:411`). Repetir o mesmo erro também pode produzir texto idêntico sem novo anúncio. Ao acertar, o botão focado é desabilitado; falta gestão explícita do próximo foco. A informação não deve depender do flash de 450/650 ms.
7. **Lacunas e ordenação precisam de retorno mais previsível.** A palavra usada fica invisível no banco, enquanto surge um botão para removê-la; isso pode retirar o controle que tinha foco (`src/styles.css:498`, `src/components/Exercises.tsx:212`). Há região viva na lacuna, mas sua fala precisa ser confirmada com leitor de tela. Ordenar não anuncia “item na posição 2 de 4”; mover ao limite pode desabilitar a seta focada (`src/components/Exercises.tsx:274`, `src/components/Exercises.tsx:344`). Além disso, `touch-action:none` ocupa todo o item, dificultando começar a rolagem sobre ele (`src/styles.css:513`).
8. **Explicações podem ficar em uma segunda rolagem.** O rodapé é aderente e o texto do feedback tem limite de 34 vh com rolagem interna (`src/styles.css:549`, `src/styles.css:567`). Em tela pequena ou com zoom, isso pode esconder partes do conteúdo e dificultar ler a explicação inteira pelo teclado. São riscos a verificar para refluxo e foco não encoberto, não falhas visuais já observadas.
9. **Dicas de palavras ajudam, mas exigem cuidado.** Há botão, Escape e descrição associada (`src/components/TermText.tsx:44`, `src/components/TermText.tsx:73`). Porém o mouse sai do acionador antes de alcançar o balão separado por 10 px; o fechamento no `onMouseLeave` pode impedir a leitura ao passar o ponteiro sobre o conteúdo (`src/components/TermText.tsx:69`, `src/styles.css:441`). Referência: 1.4.13. Alvos pequenos dentro do texto merecem avaliação considerando as exceções de conteúdo em linha do critério 2.5.8.
10. **Som e celebração podem competir com a explicação.** O som começa habilitado, com volume padrão 70%; um acerto pode tocar `correct` e depois `combo` (`src/engine/progress.ts:85`, `src/ui/sound.ts:30`, `src/screens/LessonPlayer.tsx:121`). O feedback inteiro é assertivo (`src/screens/LessonPlayer.tsx:313`), podendo interromper outra fala. Não ouvi os efeitos. As animações decorativas contínuas da ofensiva e dos raios finais também merecem revisão de pausa/remoção para 2.2.2 (`src/styles.css:250`, `src/styles.css:607`). A redução global é uma boa base, mas duração de 1 ms não elimina transforms aplicados diretamente durante o arraste.
11. **Offline ainda não é garantido.** Conteúdo local e progresso no navegador não significam que o site abre sem rede. Não encontrei implementação de service worker nos arquivos consultados. A fonte Nunito depende do Google Fonts, com fallback local (`index.html:8`, `src/styles.css:55`). Não há TTS implementado nos arquivos analisados.

## 2. Propostas

P = pequeno esforço; M = médio; G = grande. São estimativas relativas, sem compromisso de prazo.

### 1. Corrigir a paleta de leitura e estados

- **O que é:** ajustar tokens de texto secundário, verde sobre fundo suave e texto sobre cores de recompensa. Conferir claro/escuro, hover, seleção e foco. Buscar 4,5:1 em texto comum, 3:1 em texto grande e nos elementos gráficos essenciais conforme o critério aplicável.
- **Por que ajuda:** idosos e pessoas com baixa visão deixam de depender de esforço para ler legendas e reconhecer estados.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** `src/styles.css`, `src/screens/CompleteScreen.tsx`, `src/screens/ExamScreen.tsx` (inclui o verde fixo em `:149`).
- **Risco/regra:** preservar as cores pedagógicas das placas; corrigir a interface sem recolorir sinais. Não basta trocar um token sem conferir seus usos.

### 2. Consertar foco, rádios e atalhos

- **O que é:** escolher o primeiro rádio habilitado como ponto de entrada; limitar atalhos ao exercício focado e suspendê-los em diálogos. Ao trocar de tela/pergunta, orientar o foco para o título, com `tabIndex=-1`, sem alterar a ordem normal de Tab. Isolar o fundo do diálogo e restaurar foco no acionador válido.
- **Por que ajuda:** a pessoa consegue seguir apenas com teclado e entende onde está.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** `src/components/Exercises.tsx`, `src/components/Fx.tsx`, `src/screens/LessonPlayer.tsx`, `src/screens/ExamScreen.tsx`, `src/App.tsx`; testes de interface correspondentes.
- **Risco/regra:** preservar os nomes acessíveis existentes e evitar foco no título a cada seleção, o que interromperia o exercício.

### 3. Tornar pares, lacunas e ordenação compreensíveis sem visão

- **O que é:** instruções visíveis curtas para cada tipo; região de status dedicada que informe seleção, erro e posição final. Em pares, limpar a mensagem anterior na nova seleção e permitir reanúncio de tentativas iguais. Levar o foco a um controle útil quando o atual ficar indisponível. Na lacuna, manter a frase completa acessível e oferecer troca/remoção previsível.
- **Por que ajuda:** a pessoa aprende a interação sem precisar interpretar cor, tremor ou desaparecimento de palavras.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** `src/components/Exercises.tsx`, `src/screens/LessonPlayer.tsx`, `src/components/match.test.tsx`, `src/styles.css`.
- **Risco/regra:** manter a contagem de erros dos pares e a verificação final automática existentes. Não anunciar a resposta correta antes da correção nem duplicar a leitura de toda a tela.

### 4. Oferecer letra grande e acomodar o conteúdo

- **O que é:** escala tipográfica em unidades relativas, opção de letra maior, corpo confortável de 19–20 px nessa opção e menos maiúsculas em textos de apoio. Permitir quebra de botões e reorganização das colunas. No feedback, preferir rolagem da página; conferir 200% de ampliação e largura de 320 CSS px, além de espaçamento de texto personalizado.
- **Por que ajuda:** reduz esforço de leitura sem exigir conhecer o zoom do celular.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** `src/styles.css`, `src/screens/ProgressScreen.tsx`, `src/state/AppState.tsx`; se salva como preferência, também `src/engine/progress.ts` e `src/storage/progressStore.ts`.
- **Risco/regra:** persistir uma nova preferência depende de autorização para o modelo de dados. Pode começar como escolha de sessão. Não prometer que uma fonte específica resolve dislexia; preservar ajuste individual e espaço entre linhas.

### 5. Facilitar toque e rolagem

- **O que é:** usar 44 × 44 px como meta de conforto para ações, inclusive volume e controles pequenos. O mínimo AA de 2.5.8 é 24 × 24 CSS px, com exceções; 44 px é uma meta mais generosa, não esse mínimo. Restringir o arraste a uma alça, mantendo as setas, e permitir rolar ao tocar no texto do item.
- **Por que ajuda:** pessoas com tremor ou pouca prática erram menos toques e conseguem mover a página.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** `src/styles.css`, `src/components/Exercises.tsx`, `src/screens/ProgressScreen.tsx`, `src/components/TermText.tsx`.
- **Risco/regra:** não sobrepor áreas invisíveis de toque nem afastar palavras dentro da frase. Manter toque sem movimento sem reordenar nada.

### 6. Adicionar leitura em voz alta sob demanda

- **O que é:** botão “Ouvir texto” com ícone e texto, parar/repetir e velocidade simples. Ler enunciado e alternativas em ordem, sem revelar solução; explicação só depois da correção. Interromper ao trocar de etapa e evitar sobreposição com efeitos. Usar detecção de suporte e voz em português quando disponível.
- **Por que ajuda:** apoia leitura lenta, cansaço e dificuldade de decodificar palavras.
- **Esforço:** G. **Impacto:** alto.
- **Arquivos:** novo `src/ui/speech.ts`, `src/screens/LessonPlayer.tsx`, `src/components/Exercises.tsx`, `src/styles.css`; eventual ajuste em `src/ui/sound.ts`.
- **Risco/regra:** TTS não substitui leitor de tela. A disponibilidade e o funcionamento offline dependem das vozes e do aparelho; verificar na implementação. Não iniciar automaticamente, não exigir microfone e não alterar textos legais. Prototipar primeiro nas lições; avaliar o simulado separadamente sem mudar suas regras.

### 7. Criar apresentação de estudo mais simples

- **O que é:** um bloco por vez nos cartões, com títulos claros e acesso explícito a “Palavras novas”, “Na prática” e fontes. Instruções de interface curtas, como “Toque em uma palavra para completar”. Ícones acompanham texto; os decorativos ficam fora da leitura assistiva. Manter um caminho óbvio para ver todo o conteúdo.
- **Por que ajuda:** reduz a quantidade de informação simultânea para pessoas com pouca escolaridade ou pouca familiaridade com celular.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** `src/screens/LessonPlayer.tsx`, `src/components/Exercises.tsx`, `src/components/Icons.tsx`, `src/styles.css`.
- **Risco/regra:** “Texto simples” deve começar como apresentação. Não resumir, reescrever ou ocultar permanentemente explicações legais e fontes sem autorização e revisão do conteúdo. Não usar só pictogramas ou criar passos demais.

### 8. Fazer combos breves e acessíveis

- **O que é:** celebração local por menos de um segundo em marcos espaçados, sem modal, bloqueio ou mudança de foco. Com redução de movimento, apenas texto/ícone estático. Manter o combo no mesmo aviso breve do acerto, sem segunda região assertiva; explicação permanece disponível para leitura. Evitar piscadas, tremor de tela e efeitos decorativos contínuos. Preferir um som de recompensa por marco, respeitando silêncio/volume.
- **Por que ajuda:** dá satisfação sem atrapalhar a compreensão ou causar desconforto sensorial.
- **Esforço:** M. **Impacto:** médio.
- **Arquivos:** `src/screens/LessonPlayer.tsx`, `src/components/Fx.tsx`, `src/ui/hooks.ts`, `src/ui/sound.ts`, `src/styles.css`.
- **Risco/regra:** combo continua apenas visual, sem mudar XP ou progresso. Respeitar sistema e escolha explícita de movimento. Não afirmar segurança contra flashes só pela duração curta; evitar o efeito de flash desde o desenho e validar depois.

### 9. Melhorar acesso com internet ruim

- **O que é:** primeiro manter fallbacks locais e estudar servir a fonte localmente, respeitando sua licença. Como etapa separada, cache versionado do aplicativo e dos dois mundos para abrir após uma primeira visita completa, com mensagem clara sobre disponibilidade e atualização.
- **Por que ajuda:** reduz espera e permite estudar onde o sinal falha.
- **Esforço:** P para reduzir dependência de fonte; G para offline completo. **Impacto:** alto.
- **Arquivos:** `index.html`, `src/styles.css`, `src/main.tsx`, `vite.config.ts`, futuro arquivo de service worker e interface de status.
- **Risco/regra:** o dono escolheu site sem PWA instalável. Cache offline não exige instalação, mas precisa de decisão explícita de escopo. Não adicionar manifesto/convite de instalação. Garantir caminhos de `/cnh-quest/`, limpeza de versões e atualização coerente de conteúdo; não prometer disponibilidade na primeira visita sem rede. Não exige backend.

### 10. Validar acessibilidade com tarefas reais

- **O que é:** na futura etapa de execução autorizada, testar teclado e leitor de tela nos cinco tipos, dicas, confirmações, troca de pergunta e simulado; claro/escuro, zoom e letra maior; movimento reduzido, som desligado e conexão ruim. Incluir pessoas idosas e com dificuldade de leitura. Automatizar regressões de foco e avisos e considerar axe como complemento.
- **Por que ajuda:** revela barreiras que a leitura do código não confirma, sobretudo compreensão e uso em celular barato.
- **Esforço:** M. **Impacto:** alto.
- **Arquivos:** testes de interface em `src/App.test.tsx`, `src/components/match.test.tsx` e novos testes específicos; roteiro em `docs/`.
- **Risco/regra:** nenhuma ferramenta garante conformidade sozinha. Esta análise não executou navegador nem instalou dependências, conforme o briefing. Não alterar tempo, nota ou regra oficial do simulado para resolver acessibilidade sem uma decisão separada.

## 3. Top 3

1. **Foco e atalhos (proposta 2):** resolve risco de bloqueio no exercício e de interação atrás de diálogos. É o caminho para concluir a lição com teclado.
2. **Contraste (proposta 1):** há combinações abaixo do necessário identificadas por cálculo; o benefício alcança todo o aplicativo.
3. **Retorno dos exercícios (proposta 3):** torna pares, lacunas e ordenação previsíveis e corrige a prioridade da mensagem antiga nos pares. Fazer antes de aumentar a quantidade de celebrações.

Letra grande vem em seguida. TTS é valioso, mas não deve adiar correções na leitura e no teclado existentes.

## 4. O que NÃO fazer

- Obrigar arraste, gesto rápido ou reconhecimento apenas por cor/som; retirar as setas para “limpar” a tela.
- Colocar confete em toda resposta, tremer a página, piscar o fundo ou interromper a explicação com um anúncio longo de combo.
- Fazer o modo reduzido apenas acelerar uma animação grande: usar estado estático para celebrações e evitar movimento decorativo contínuo.
- Tocar narração automaticamente, acumular efeitos sobre a voz ou prometer TTS offline em qualquer celular.
- Esconder fontes e explicações para reduzir texto, trocar termos legais sem revisão ou infantilizar a linguagem.
- Tratar tema escuro, fonte para dislexia ou ícones como solução universal. Oferecer escolhas e verificar compreensão.
- Diminuir mais a fonte para caber em tela pequena ou forçar duas colunas quando o texto precisa de mais espaço.
- Chamar cache comum de “funciona offline”, ativar instalação sem pedido ou adicionar punição quando a sequência de acertos terminar.
