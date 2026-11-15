# Auditoria 08 — placas 3D e balão

Revisão em 15/11/2026. Foram lidos o briefing, o estado do projeto, as seis questões, os componentes envolvidos, os SVG e os créditos. As duas folhas aprovadas foram abertas como imagens locais. Não rodei navegador, servidor, instalação ou testes; não alterei implementação nem conteúdo. As conclusões sobre integração são por leitura do código, não por execução.

## Diagnóstico

A solução é adequada: preservar os arquivos de referência, usar projeção ortográfica e oferecer uma ampliação ajuda quem tem dificuldade de leitura. Nas folhas, as formas principais são reconhecíveis e as costas não mostram símbolos espelhados. A folha de perto permite reconhecer o octógono do PARE por trás; a de celular mostra por que o balão faz diferença.

O trabalho ainda é uma peça isolada: a busca em `src/` encontrou `signPost` e `SignCallout` apenas em `src/components/scenes/signs.tsx`. `placa-escondida` e `placa-distancias` continuam no desenho antigo (`SceneArt.tsx:996` e `:1029`); `w1-rua-5` ainda usa placa plana (`situations.ts:144`). `AnimScene.tsx:16` registra somente as três cenas do piloto. Portanto, não é possível aprovar posicionamento, ocultação ou animação das futuras cenas como se já existissem.

## Correções obrigatórias

### 1. A placa de distâncias precisa de desenho próprio e legível

**Onde:** `SignArt.tsx:30–38`, caso `IND-destino` na função `render`; `SceneArt.tsx:1042–1049`; questão `w2-l3-q9` (`world2.ts:1186`).

O desenho reutilizável atual contém **Centro/Praia e setas**, não Vila Nova 15 km / Santa Rita 40 km / Porto Alto 72 km. A última linha das folhas aprovadas também mostra Centro/Praia. Ela demonstra uma placa de destinos, mas não valida a cena de distâncias pedida.

**Correção:** permitir que a chapa e o balão recebam a mesma arte específica de distâncias, mantendo as três linhas e os mesmos números do enunciado. Não substituir globalmente `IND-destino`, pois ele também atende outros usos. O recorte atual de 92 × 60 está correto para Centro/Praia, mas não deve determinar à força o aspecto da nova placa. A arte antiga de distâncias ocupa 240 × 88.

**Por que ajuda:** a pessoa compara informações coerentes, sem precisar adivinhar letras pequenas. Os três destinos e respectivos km devem ficar disponíveis e legíveis; não basta ampliar só “15”. O balão apresenta os dados da pergunta, sem destacar qual alternativa escolher. A 46 unidades, o texto de 14 unidades do desenho Centro/Praia teria cerca de 7 unidades de altura após o recorte: esse tamanho não serve como garantia de leitura de três linhas.

**Esforço M · impacto alto.** Arquivos: `SignArt.tsx`, `signs.tsx`, futura cena de distâncias e ligação em `AnimScene.tsx`/tipos. Risco: mudar os dados ou transformar o balão numa resposta marcada.

### 2. Proibir balão nas três questões da placa escondida

**Onde:** `world1.ts:374`, `:830`, `:1493`; futura substituição de `SceneArt.tsx:996`.

Não há balão nessas questões hoje; esta é uma exigência para a integração. Uma ampliação contornaria a árvore e desfaria a situação que sustenta a pergunta. A nova cena deve manter a placa encoberta durante todos os quadros, inclusive após verificar e com movimento reduzido.

Para q7/q11, pode aparecer poste ou um fragmento sem símbolo legível, apenas para situar o objeto. Para q24, o enunciado diz **totalmente coberta**: a chapa deve ficar inteiramente escondida. Como as três compartilham a mesma cena, cobrir toda a chapa é a solução mais segura sem acrescentar variantes. Não mover as folhas para revelar o E ou a tarja.

**Esforço M · impacto alto.** Arquivos: futura cena escondida, `AnimScene.tsx` e tipos. Risco: contradizer o enunciado ou ensinar que uma sinalização claramente visível equivale à escondida. Preservar respostas e explicações.

### 3. As cores da frente ainda recebem os filtros globais

**Onde:** `signs.tsx:103`, `engine.tsx:420–429` e `:523–525`.

`flat` evita o sombreamento da face, e o `art` é desenhado sem cálculo de luz. Porém, os retângulos de sol e vinheta vêm **depois de todo o corpo** e alteram também a imagem da placa. Isso contraria a frente sem luz/sombra aprovada.

**Correção:** excluir a frente dos filtros de acabamento, preservando a ocultação por árvores e veículos. Não resolver desenhando todas as frentes por último: elas passariam a aparecer através dos obstáculos. O balão já pode entrar no `overlay`, depois dos filtros.

**Esforço M · impacto médio.** Arquivo: `engine.tsx`. Benefício: manter as cores de reconhecimento. Risco: corrigir a cor e quebrar a profundidade.

### 4. Corrigir a documentação do sentido de rotação

**Onde:** `signs.tsx:68–69`, `:111`; `engine.tsx:37–40` (`Rz`).

A documentação diz que `face = π/2` olha para leste. A normal inicial é +y; `Rz(π/2)` a transforma em **−x, oeste**. A transformação está coerente com a matemática do motor; o comentário está errado.

**Correção:** documentar π/2 = oeste e −π/2 = leste, ou adotar outra convenção explicitamente e atualizar os usos. Na integração, conferir frente voltada para o motorista que se aproxima, sem espelhar a arte. A câmera não determina o sentido legal da placa.

**Esforço P · impacto alto.** Arquivo: `signs.tsx`. Benefício: evitar placa virada para o fluxo contrário. Risco: trocar o sinal da rotação sem revisar consumidores.

### 5. Completar a integração sem antecipar a ação correta

**Onde:** `Visual.tsx:9–11`, `AnimScene.tsx:16–20`, `situations.ts:144`, cenas antigas em `SceneArt.tsx:996` e `:1029`.

Ainda faltam as cenas aprovadas e seu encaminhamento. Para `w1-rua-5`, o quadro inicial deve mostrar aproximação e PARE, sem executar a sequência “parar, olhar e seguir” antes da resposta. A demonstração correta entra depois de verificar, seguindo `AnimScene.tsx:32–49` e respeitando movimento reduzido.

Colocar o PARE na aproximação da esquina e mostrar o carro parando antes de invadir a via transversal; se houver linha de retenção, manter a frente do carro antes dela. Não copiar a folha de demonstração como cenário final: ela é uma rua reta, sem ponto de parada contextualizado.

**Esforço G · impacto alto.** Arquivos: tipos, `AnimScene.tsx`, `situations.ts` e novas cenas. Benefício: ensinar a conduta no lugar certo. Risco: parada depois da esquina, placa do outro lado da via ou animação que já resolve a pergunta.

### 6. Preservar proporção e altura útil ao montar as cenas

**Onde:** `SignArt.tsx:23–24`; `signs.tsx:27`, `:88–106`; `models.tsx:460–465`.

`ASPECT` declara que os demais arquivos são quadrados, mas `A-24.svg` tem viewBox 50.908195 × 50.195348. `preserveAspectRatio="meet"` preserva o desenho externo, porém introduz folga dentro da chapa quadrada; não há correspondência exata entre os aspectos. Incluir o aspecto verdadeiro, sem esticar o SVG.

Além disso, `h = 2` é coordenada mundial, não altura medida sobre uma calçada elevada. A calçada usa z próximo de 0,16: a referência nominal cairia para cerca de 1,84 m sobre ela, antes dos ajustes de contorno. Não apresentar esse padrão como instalação urbana de 2 m. O recorte também é encolhido: a borda real não coincide exatamente com `h`.

**Correção:** definir a base do poste na superfície de implantação e medir a borda efetiva da chapa a partir dela. O aumento 1,5× pode permanecer como recurso didático, sem ensinar que os valores de `LARGURA` são dimensões universais de instalação.

**Esforço M · impacto médio.** Arquivos: `SignArt.tsx`, `signs.tsx`, futuras cenas. Benefício: proporção e implantação coerentes. Risco: usar uma altura única para vias urbanas, rodovias e placas de indicação.

## Decisão por questão

| Questão | O que avalia e conferência das alternativas/explicação | Balão e posição |
| --- | --- | --- |
| `w1-l1-q7` | Responsabilidade pela sinalização insuficiente. A correta afasta a sanção específica; as erradas atribuem multa automática, responsabilidade ao imóvel ou liberação de todas as regras. A explicação mantém as regras gerais. | **Não.** A árvore deve impedir a leitura; nenhum balão nem ampliação em outro canto. |
| `w1-l1-q11` | A frase “todas as regras deixam de valer” é falsa. A explicação limita o efeito ao sinal insuficiente. | **Não.** Mesma ocultação, sem revelar o símbolo durante animação. |
| `w1-l1-q24` | A placa citada é Proibido estacionar e está totalmente coberta. Alternativas e explicação avaliam o mesmo limite da sanção e a responsabilidade do órgão, não reconhecimento do E. | **Não.** Chapa toda coberta; poste pode aparecer. O alt atual diz “quase toda”, divergindo de “totalmente” do enunciado: encaminhar essa inconsistência ao responsável pelo conteúdo. |
| `w2-l3-q9` | Comparar 15, 40 e 72 km. Correta Vila Nova; distratores Santa Rita, Porto Alto e impossibilidade de saber. Explicação relaciona ordem e distância. | **Sim**, ao lado da placa, em espaço livre fora da pista e do carro, com os três nomes e km. Aumentar além de 46 se necessário. Sem cor, seta ou animação destacando Vila Nova. O enunciado e o alt já transcrevem os dados; o balão mantém equivalência visual. |
| `w1-rua-5` | Conduta no PARE de madrugada: parar, olhar e seguir com segurança. Distratores sugerem só reduzir, ignorar à noite ou piscar farol. | **Sim**, próximo ao alto do poste, sem cobrir esquina, linha ou carro. A palavra PARE já está no enunciado; ampliá-la não entrega uma informação escondida. A ação só depois de verificar. |
| `w2-rua-5` | Reconhecer a A-41, distinguindo passagem de trem de cruzamento comum, proibição e ponte. A explicação identifica cruzamento no mesmo nível. | **Sem cena 3D nem balão.** Manter `SignArt` plana. Acrescentar trilhos, trem ou cancela tornaria a resposta dedutível pelo cenário. |

## Conferência técnica da peça

- **Formas (`signs.tsx:15–60`):** R-1 octogonal com lados horizontais/verticais; R-2 com ponta para baixo; R circulares; A em losango, exceto A-41 em X; indicação retangular. O raio `w / cos(π/8)` do octógono é coerente com a largura entre lados. Não encontrei inversão do triângulo nem auto-interseção evidente na sequência de 12 vértices do X. Os recortes são aproximações reduzidas, não cópias exatas das curvas oficiais. A cruz por trás continua reconhecível; círculo de 20 lados fica facetado de perto.
- **Frente (`signs.tsx:98–105`):** `extrude` cria cap0 em y=0 e cap1 em y=0,03; `part` orienta as normais para fora. Buscar normal +y e coordenada da cap1 seleciona a frente corretamente nas formas atuais. A arte não é escolhida pela orientação inicial do contorno. O `as Face` só suprime a verificação de ausência em TypeScript; uma mudança futura na geometria poderia causar erro ao acessar `flat`.
- **Matriz (`engine.tsx:179–184`, `:425–429`):** correta: as colunas são `(u−o)/100` e `(v−o)/100`, com translação em `o`. O vetor vertical de comprimento W em `signs.tsx:105` é intencional: a arte tem altura `100/aspect`, resultando em H=W/aspect. Trocar W por H ali achataria R-2, A-41 e indicação. A transformação afim reproduz a projeção do plano; ainda há encurtamento visual normal quando visto de lado.
- **Visibilidade (`engine.tsx:417–425`):** a face some com produto normal/câmera ≤0,0001. A arte acompanha a face e não aparece por trás nem exatamente de perfil; perto do perfil ainda aparece estreita, como esperado. A regra de câmera até 35° não é imposta por `signPost`: precisa ser cumprida por cada cena. Se “35°” for ângulo espacial, considerar também pitch, não só yaw.
- **Chapa/cano (`signs.tsx:108–111`):** cano termina atrás, com y aproximadamente −0,105 a −0,015, enquanto a chapa fica entre 0 e 0,03. Há separação geométrica. A frente vai por último dentro da chapa; a ordenação entre peças depende dos planos e da tolerância de 0,025 m do motor. A folha mostra resultado plausível, mas não prova todos os ângulos.
- **Outros objetos (`engine.tsx:358–405`, `:475–488`):** não há z-buffer nem recorte entre objetos; caixas sobrepostas e ciclos usam desempate por profundidade. Uma árvore pode precisar cobrir só a chapa sem cobrir o carro: isso exige separação adequada de copa/tronco ou composição dedicada. O X é côncavo, enquanto o motor pressupõe sólidos convexos; seus planos internos não são separadores universais. É risco de ordenação, não prova de desenho errado na folha. Evitar cruzar esses volumes ou decompor a cruz em peças convexas quando necessário.
- **Cores e arquivos:** `OFFICIAL` aponta para os SVG locais; os aspectos especiais de R-2 e A-41 coincidem com os viewBoxes. Os demais são praticamente quadrados, com a diferença de A-24 apontada acima. Nas folhas, PARE vermelho/branco, R circulares, advertência amarela e indicação verde são reconhecíveis. “Arquivo oficial” é nome interno: os créditos distinguem desenhos R de autores do Commons e A atribuídos ao DNIT. Não é certificação de todo arquivo pelo CONTRAN. Preservar créditos e licenças.
- **IND-destino (`SignArt.tsx:34`):** a ordem `scale(1.087) translate(-4 -20)` primeiro desloca o retângulo para a origem e depois escala: aproxima corretamente 100/92, sem inverter as operações. O arredondamento é pequeno; não há um `clipPath` real. Arte e chapa podem ter pequena diferença nas bordas.
- **URL (`SignArt.tsx:18–20`, `:38`):** com `BASE_URL='./'`, produz `./placas/R-1.svg`. Dentro de SVG inline, `<image href>` resolve em relação ao documento, não ao chunk JS: é compatível com a página `/cnh-quest/`. Não há defeito demonstrado nesse caminho. Confirmar carregamento real fica para a integração; não o testei. Rotas profundas sem tratamento poderiam mudar a base relativa.

## Altura e implantação: limite da aprovação

Para regulamentação urbana, a referência consultada estabelece borda inferior entre 2 e 2,5 m; para implantação rural de regulamentação, 1,2 m, medidos em relação à pista. O padrão de 2 m é plausível para uma cena urbana, com referência de solo corrigida. Não extrapolar esses valores para toda placa de indicação. O PARE deve ficar na aproximação da interseção e ser associado ao ponto de parada, não depois dele. Conferir lado direito no sentido do fluxo atendido. Fonte: [MBST I, itens 4.12 e R-1, cópia oficial hospedada pelo DNIT](https://www.gov.br/dnit/pt-br/rodovias/operacoes-rodoviarias/faixa-de-dominio/regulamentacao-atual/manual-de-sinalizacao-vertical-de-regulamentacao-contran/@@download/file).

O catálogo atual foi conferido na [SENATRAN](https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito). Os downloads atuais dos volumes I–III falharam nesta consulta por tamanho/tempo; as medidas acima foram verificadas na cópia oficial do Volume I de 2007, não afirmo comparação integral com a edição atual. A implantação rodoviária da nova placa de distâncias precisa ser conferida no Volume III antes da entrega. A ampliação 1,5× está aprovada como convenção didática; ela pode sugerir uma escala real incorreta se o exercício passar a cobrar medidas. Não usar a ilustração como desenho técnico de instalação.

## Sugestões

### 7. Limitar o balão à área útil da cena

**Onde:** `signs.tsx:119–135`, `engine.tsx:497` (viewBox 320 × 200).

`dx/dy` fixos não evitam corte nem sobreposição. As 46 unidades só equivalem a 46 px quando a cena é exibida com 320 px de largura. Calcular os limites pelo tamanho completo do balão e reservar espaço para “Você”. `signTop` aponta para o topo da caixa nominal da placa, não exatamente para o alto do cano; para a cruz, o cano termina no centro. Definir qual ancoragem visual se deseja e nomeá-la com clareza.

**Esforço P · impacto médio.** Arquivos: `signs.tsx` e cenas. Benefício: leitura sem cobrir informação importante. Risco: balão encostado na borda ou linha atravessando texto.

### 8. Tratar falha de imagem e manter cache

**Onde:** `SignArt.tsx:38`, comparado ao `onError` de `:58`.

O `<image>` do 3D não tem o fallback existente no `SignArt`. Se falhar, pode restar uma chapa colorida sem símbolo. Reutilizar uma política de fallback, preservando as proporções de R-2 e A-41.

Os SVG locais têm cerca de 1,8 a 9 KB cada. Duas instâncias do mesmo href, na chapa e no balão, não implicam obrigatoriamente duas transferências: o navegador pode compartilhar o recurso/cache. Não há pedido de rede novo a cada quadro de animação com URL estável. Manter arquivos externos inicialmente; embutir tudo aumentaria o JavaScript e repetiria estruturas SVG. Medir antes de mudar.

**Esforço M · impacto médio.** Arquivo: `SignArt.tsx` e eventual componente compartilhado. Benefício: placa reconhecível mesmo com falha de recurso. Risco: fallback deformado, IDs SVG duplicados ou perda dos créditos.

### 9. Uma descrição acessível por cena

**Onde:** `AnimScene.tsx:73–78`, `engine.tsx:497`, `signs.tsx:127` e os `visual.alt` das seis questões.

O invólucro animado já tem `role="img"` e descrição; `Scene3D` sem label fica oculto da árvore acessível. Manter chapa/balão como partes dessa mesma ilustração, sem foco nem rótulos repetidos. Tornar o balão explicitamente decorativo quando reutilizado fora desse arranjo. Ele contém dados importantes, mas esses dados já estão no alt/enunciado, especialmente em distâncias; não esconder a única transcrição textual.

Os alts atuais descrevem proibição encoberta, os três destinos/km, PARE e a forma da A-41. Na migração do PARE, encaminhar descrição da nova situação para revisão, preservando os nomes acessíveis usados nos testes. Não acrescentar ao alt “a resposta é parar” ou o nome do destino correto isoladamente.

**Esforço P · impacto alto.** Arquivos: futuras cenas, `signs.tsx`, metadados visuais sob revisão. Benefício: equivalência para leitor de tela. Risco: informação duplicada ou resposta antecipada.

### 10. Guardar verificações pontuais da geometria

**Onde:** `signs.tsx:98–105`, `engine.tsx:425–429` e integração das novas cenas.

Ao implementar, verificar que cada forma tem uma frente válida, que R-2/A-41 preservam aspecto e que frente/costas/perfil mantêm a visibilidade esperada. Conferir também q24 sem chapa visível e distâncias com as três linhas idênticas na placa/balão. São verificações com valor pedagógico e geométrico; TypeScript sozinho não detecta essas falhas.

**Esforço M · impacto médio.** Arquivos: testes das cenas e da peça. Benefício: evitar regressões que ensinem algo errado. Risco: testes baseados só em snapshots aprovarem uma cena incorreta.

## Top 3

1. **Arte correta e leitura da placa de distâncias:** o desenho reutilizável atual não contém o conteúdo avaliado.
2. **Ocultação garantida sem balão:** preserva a premissa das três questões, especialmente “totalmente coberta” na q24.
3. **Integração do PARE com direção e parada corretas:** a conduta depende da relação entre placa, carro e esquina; acertar só o símbolo não basta.

## O que não fazer

- Usar balão em toda placa automaticamente, incluindo a escondida.
- Trocar Vila Nova/Santa Rita/Porto Alto por Centro/Praia ou omitir quilômetros.
- Mostrar trilhos ou trem na questão plana da A-41, acrescentando pistas visuais.
- Mostrar a ação correta antes de verificar ou ignorar movimento reduzido.
- Desenhar a arte de todas as placas acima de todos os carros e árvores para resolver a ordenação.
- Aplicar filtros de luz às cores da frente, tratar 2 m como regra universal ou apresentar a escala 1,5× como dimensão normativa.
- Alterar respostas, explicações ou fontes para acomodar a nova ilustração.
