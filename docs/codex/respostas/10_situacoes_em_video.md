**Recomendo um vídeo SVG curto que pausa para a escolha, mostra brevemente a ação escolhida e, no erro, termina mostrando a ação correta; “Continuar” libera ao concluir essa sequência ou sua versão acessível equivalente.**

Este é um planejamento, sem implementação. Não alterei arquivos nem executei navegador, servidor, Vite ou testes. As durações abaixo são metas de produção, ainda dependentes da gravação das falas.

## 1. Diagnóstico e escolha do formato

O projeto já tem boa parte das peças necessárias:

- As seis situações têm alternativas, explicações, `whyWrong` e fontes verificadas em `src/content/situations.ts:714`.
- A lição tem seis questões, 15 XP e domínio de 80% em `src/content/world5.ts:1838`.
- `SituationBox.tsx:8` já apresenta os sons por escrito. Isso é uma boa base para quem não ouve.
- `VideoConceito.tsx:26` carrega cenas sob demanda; o componente já combina linha do tempo, áudio, legenda, pausa e repetição.
- `AnimScene.tsx:6` confirma o comportamento atual: tanto acerto quanto erro mostram a ação correta.
- `LessonPlayer.tsx:180` concentra a verificação; em `LessonPlayer.tsx:203`, o fluxo atual leva foco ao rodapé. Isso precisará de ajuste para não tirar a pessoa do final do vídeo.

O principal problema pedagógico seria produzir três erros diferentes e mostrar todos com o mesmo movimento. Quem escolheu “frear na poça” precisa ver essa escolha, não um carro acelerando.

| Formato | Como funciona | Aprendizado | Produção e risco |
|---|---|---|---|
| **A — Quatro finais completos** | Um final certo e três errados, cada erro com sua própria correção | Relação clara entre escolha e resultado | Esforço G; repete muita produção e facilita inconsistências |
| **B — Certo + erro genérico** | Todas as erradas levam ao mesmo final errado e depois à correção | Mais simples, mas pode representar outra escolha | Esforço M; risco de confundir causa e consequência |
| **C — Ação específica + correção compartilhada** | Cada alternativa tem um gesto curto próprio; os três erros chegam à mesma demonstração correta | Mostra o erro escolhido e termina reforçando o acerto | **Esforço M/G; recomendado**, com reaproveitamento de cenário, movimentos e áudio |

No formato C, existem quatro caminhos lógicos, mas não quatro produções completas: cenário e introdução são comuns; cada erro ganha aproximadamente 1–1,5 segundo de ação específica; a correção é compartilhada.

### Como conciliar com o pedido 07

O novo pedido substitui, **somente nessas seis situações**, as decisões anteriores de manter a cena parada antes da resposta, nunca mostrar o erro e liberar “Continuar” imediatamente.

Preservaria “sem batida nem susto” de forma mais rigorosa: **sem quase colisão dramática também**. O carro inicia a conduta errada; a cena congela antes de qualquer contato, com **X + “Essa escolha aumenta o perigo”**. Depois, um corte simples com **“Agora, veja o jeito seguro”** reinicia a situação no ponto de decisão e mostra a conduta correta.

Isso evita ensinar que uma manobra perigosa sempre termina em acidente ou que sempre dá tempo de corrigi-la na própria estrada.

## 2. Fluxo da tela no celular

A cena substitui a combinação atual de caixa extensa + imagem parada. O texto completo continua disponível em “Ler a situação”.

### Estado 1 — Introdução

O aluno inicia com “Tocar o vídeo”. Não exigir áudio ligado.

```text
[Sair da lição]        Situação 1 de 6

┌──────────────────────────────┐
│ Cena: carro, chuva e poça     │
│                              │
└──────────────────────────────┘
[chuva forte]
Chove forte. A luz baixa está acesa.

[──────●────────]  [Pausar o vídeo]
[Ler a situação]
```

Sem alternativas durante o movimento. A introdução apresenta o problema, sem antecipar a solução.

### Estado 2 — Pausa para decidir

A cena congela automaticamente. Não existe prazo para responder.

```text
┌──────────────────────────────┐
│ Carro antes da poça           │
└──────────────────────────────┘
O que você faz?

[ A  Texto completo da opção   ]
[ B  Texto completo da opção   ]
[ C  Texto completo da opção   ]
[ D  Texto completo da opção   ]

[          Verificar          ]
```

As opções podem ocupar mais de uma tela. Não reduzir fonte para caber tudo.

### Estado 3 — Escolha marcada

```text
[ A  Texto completo           ]
[●B  Texto completo           ]
[ C  Texto completo           ]
[ D  Texto completo           ]

[          Verificar          ]
```

Tocar na opção apenas seleciona. “Verificar” confirma e registra a tentativa uma única vez.

### Estado 4A — Final certo

```text
┌──────────────────────────────┐
│ Carro executa a ação correta │
└──────────────────────────────┘
✓ Boa escolha
Freie antes da poça.

[─────────●───] Falta cerca de 3 s
[      Continuar — inativo     ]
```

O nome acessível do botão permanece **“Continuar”**. A mensagem sobre o tempo fica fora dele.

### Estado 4B — Final errado

```text
┌──────────────────────────────┐
│ Gesto errado → congelamento │
└──────────────────────────────┘
X Essa escolha aumenta o perigo.

Agora, veja o jeito seguro.
[reinício no ponto da decisão]
[ação correta]

[─────────●───] Final em andamento
[      Continuar — inativo     ]
```

O erro nunca fica sem identificação, mesmo por alguns segundos. O `whyWrong` da alternativa escolhida fica disponível desde a correção; sua leitura não precisa terminar antes da animação.

### Estado 5 — Feedback e avanço

```text
┌──────────────────────────────┐
│ Quadro final da ação correta │
└──────────────────────────────┘

Para guardar
Freie antes, volante firme em cima.

[Por que essa escolha?]
[explicação atual + fonte atual]

[Ver de novo]  [Ler o que aconteceu]

[          Continuar          ]
```

No erro, mostrar também o `whyWrong` original, sem reescrita. O resumo não substitui explicação ou fonte.

### Regras para esperar sem irritar

- A espera obrigatória acontece apenas no final curto, sem leitura cronometrada das alternativas.
- Barra sem arrastar, com “Final em andamento”. Contagem aproximada só enquanto estiver realmente reproduzindo.
- Pausar continua permitido. Durante a pausa, trocar a contagem por “Vídeo pausado”.
- Não oferecer avanço rápido na primeira reprodução do final.
- “Sair da lição” permanece disponível.
- Depois do término, “Ver de novo” não volta a bloquear “Continuar”.
- Se a aba ficar escondida, pausar áudio e cena. Ao voltar, oferecer “Retomar o vídeo”, sem contar o tempo fora da aba como assistido.
- No erro, o reinício é um corte identificado, sem animação de carro andando de ré ou câmera rebobinando.

### Movimento reduzido, leitor de tela e falhas

A regra deve significar **concluir a apresentação educativa**, não obrigar todas as pessoas a consumir movimento.

- **Movimento reduzido:** sequência de quadros estáticos “Sua escolha” → “Jeito seguro”, com texto equivalente. “Mostrar o resultado” apresenta a sequência completa e libera “Continuar”, sem espera artificial.
- **Leitor de tela:** disponibilizar a mesma versão textual. Não detectar automaticamente o leitor; oferecer “Ver em quadros e texto” para qualquer pessoa. Evitar legendas sendo anunciadas sobre a voz narrada.
- **Áudio indisponível:** o vídeo continua pelo relógio, com legendas e sons descritos.
- **Cena indisponível:** apresentar os quadros/texto de reserva. Nunca prender a pessoa esperando um evento de mídia que não chegará.
- **Mudança de preferência durante o final:** interromper movimento e apresentar a sequência estática equivalente.

Essas exceções devem fazer parte da aprovação do piloto.

## 3. Roteiros das seis situações

### Convenções

As falas entre aspas são propostas de narração em linguagem simples. Cada uma vira legenda idêntica, dividida em trechos curtos. Textos entre colchetes descrevem sons realmente presentes na mixagem.

As letras abaixo identificam os **IDs atuais**, não a posição visual: o ramo deve acompanhar o ID mesmo quando as alternativas forem embaralhadas.

Os tempos excluem leitura, escolha e pausas. No erro, o total inclui a correção. A pergunta entra imediatamente antes da pausa.

### 3.1 `w5-rua-1` — Poça na chuva

**Referência:** `situations.ts:717`; bases `w5-l6-q3/q4`, `world5.ts:1592` e `1613`; `dd2005`, p. 41.

**Tempo:** introdução 8–10 s; final certo 5–6 s; final errado com correção 7–8 s. Total: **13–16 s no acerto; 15–18 s no erro**.

**Introdução**

1. Carro na rodovia, chuva e luz baixa identificáveis.
2. Poça à frente, ainda com espaço para a decisão.
3. Narração: “Chove forte. A luz baixa está acesa. Há uma poça grande na sua faixa. O que você faz?”
4. Legenda sonora: **[chuva forte]**. Pausa antes de chegar à poça.

| Escolha | O que aparece |
|---|---|
| **a — correta** | Carro reduz antes da água; luz de freio apaga antes de entrar; atravessa em linha estável. Pequeno quadro do volante ajuda a mostrar firmeza |
| b — acelerar | Carro acelera em direção à água; congelar na entrada. Sem derrapagem |
| c — frear na poça | Carro entra; luz de freio acende sobre a água; congelar. Sem giro |
| d — desviar sem olhar | Carro inicia deslocamento lateral; congelar antes de ocupar a outra faixa |

**Correção narrada, comum:** “Freie antes da poça. Sobre a água, não freie. Segure firme o volante.”

**Para guardar:** “Freie antes, volante firme em cima.” — mnemonic atual.

Não mostrar atravessamento de alagamento nem sugerir que qualquer profundidade de água pode ser enfrentada.

### 3.2 `w5-rua-2` — Distância atrás do caminhão

**Referência:** `situations.ts:745`; bases `w5-l5-q4/q5`, `world5.ts:1376` e `1397`; `dd2005`, p. 50–51.

**Tempo:** introdução 9–11 s; final certo 6–7 s; final errado 8–9 s. Total: **15–18 s / 17–20 s**.

**Introdução**

1. Dia de sol, caminhão à frente e placa como ponto fixo.
2. Caminhão passa pela placa.
3. Narração: “Você segue um caminhão. Ele passa pela placa. Você conta: cinquenta e um… Seu carro já chegou à placa. O que você faz?”
4. Sons: **[barulho da estrada]**.
5. Pausa no instante da chegada antecipada.

| Escolha | O que aparece |
|---|---|
| a — manter | Veículos continuam com o mesmo intervalo curto; X destaca a distância ainda insuficiente |
| b — piscar farol | Pulso suave no feixe, sem flash na tela; distância não aumenta |
| **c — correta** | Carro reduz, intervalo aumenta; nova demonstração com ponto fixo e contagem |
| d — aproximar | Intervalo diminui; congelar mantendo separação visível |

**Correção narrada:** “Reduza e conte de novo.” Depois, a contagem acompanha o caminhão passando pelo ponto; o carro chega apenas após seu término.

**Para guardar:** “Passou antes? Tire o pé e conte de novo.”

**Pendência antes da gravação:** conferir a formulação completa da contagem no trecho verificado que ensina o método. Não acrescentar uma fala numérica por memória.

**Cuidado:** a base `q5` trata de quem **dirige** veículo com mais de seis metros. Não ensinar “três segundos porque há um caminhão à frente”. Na demonstração da contagem, o tempo representado deve ser fiel; encurtar os trechos de aproximação, não acelerar os segundos.

### 3.3 `w5-rua-3` — Sono de madrugada

**Referência:** `situations.ts:773`; base `w5-l4-q8`, `world5.ts:1199`; `dd2005`, p. 25.

**Tempo:** introdução 8–10 s; final certo 4–5 s; final errado 6–7 s. Total: **12–15 s / 14–17 s**.

**Introdução**

1. Estrada noturna, indicação simples “4h”.
2. Pequeno quadro do motorista bocejando, sem fechar a tela como se a pessoa apagasse.
3. Narração: “São quatro da manhã. Você trabalhou o dia todo e dormiu pouco. Seus olhos pesam. O que você faz?”
4. Sons: **[barulho baixo da estrada]**.

| Escolha | O que aparece |
|---|---|
| a — som alto | Ícone do rádio aumenta; carro continua. Não aumentar agressivamente o volume real |
| **b — correta** | Corte para local seguro fora da pista; carro estacionado e motorista descansando |
| c — acelerar | Movimento do carro aumenta discretamente; congelar antes de qualquer perigo novo |
| d — abrir janela | Janela abre; carro continua. O sono não desaparece visualmente |

**Correção narrada:** “Pare em um local seguro e descanse antes de seguir.”

**Para guardar:** “Bateu o sono? Pare e descanse.”

O local seguro não deve parecer acostamento ou faixa de circulação. A cena não ensina tempo de descanso, café ou outros tratamentos. A orientação de parar e descansar já existe na situação; o comentário aponta como base uma questão que verifica principalmente o efeito do sono. Registrar essa diferença na ficha editorial, sem inventar outra fonte.

### 3.4 `w5-rua-4` — Moto no ponto cego

**Referência:** `situations.ts:801`; bases `w5-l3-q9/q12`, `world5.ts:994` e `1051`; `dd2005`, p. 24.

**Tempo:** introdução 8–10 s; final certo 5–6 s; final errado 7–8 s. Total: **13–16 s / 15–18 s**.

**Introdução**

1. Carro na faixa central; retrovisor parece livre.
2. Informação sonora equivalente para todos: **[motor de veículo bem perto]**, com ícone discreto de motor.
3. Narração: “Você quer ir para a faixa da esquerda. O espelho parece livre, mas há barulho de motor bem perto. O que você faz?”
4. Pausa antes da mudança de faixa.

Não apontar uma seta diretamente para a moto escondida. A pista inicial deve informar o som, sem revelar mais do que ele permite saber. A localização da moto aparece ao conferir o ponto cego.

| Escolha | O que aparece |
|---|---|
| a — confiar no espelho | Carro inicia deslocamento lateral sem conferência; congelar bem antes da moto |
| b — buzinar e mudar | **[buzina curta]**, ícone visual e início do mesmo deslocamento |
| c — mudar rápido | Início lateral um pouco mais curto e rápido; congelar sem aproximação dramática |
| **d — correta** | Motorista vira um pouco a cabeça; outro ângulo revela a moto; carro mantém a faixa enquanto ela ocupa o espaço |

**Correção narrada:** “Olhe o ponto cego. Só mude de faixa se estiver livre.”

**Para guardar:** “Espelho, cabeça e só depois a manobra.”

O final correto pode ser **esperar**, sem completar a mudança. Não inventar que conferir autoriza mudar quando há uma moto ali.

A legenda descreve informação disponível no exercício; não apresentar ouvir motores como requisito para uma pessoa surda dirigir.

### 3.5 `w5-rua-5` — Neblina na serra

**Referência:** `situations.ts:829`; bases `w5-l6-q8/q9/q10`, `world5.ts:1691`, `1711` e `1726`; `dd2005`, p. 42, e CTB já registrado.

**Tempo:** introdução 7–9 s; final certo 7–8 s; final errado 9–10 s. Total: **14–17 s / 16–19 s**.

**Introdução**

1. Serra, neblina aumentando gradualmente.
2. Traseira do carro da frente pouco visível.
3. Narração: “Na serra, a neblina fecha. Você mal vê o carro da frente. O que você faz?”
4. Sons: **[barulho da estrada]**. Não criar “som de neblina”.

| Escolha | O que aparece |
|---|---|
| a — luz alta | Feixe alto reflete na neblina e diminui a visão; sem clarão na tela |
| b — parar na pista | Carro para dentro da faixa; X marca sua posição. Não trazer outro carro em direção a ele |
| **c — correta** | Luz baixa, redução e aumento de distância; quadro complementar mostra parada em posto se não for possível seguir |
| d — aproximar | Carro reduz a distância até um limite ainda seguro para a representação; congelar |

**Correção narrada:** “Use luz baixa. Reduza e aumente a distância. Se não der para seguir, pare em um local seguro.”

O último trecho usa corte identificado **“Se não der para seguir”**, mostrando o posto. Não parecer que a pessoa parou obrigatoriamente em toda neblina.

**Para guardar:** “Neblina: luz baixa, nunca alta.” — mnemonic atual. A explicação completa continua mostrando também distância e velocidade.

### 3.6 `w5-rua-6` — Bola entre carros

**Referência:** `situations.ts:857`; base `w5-l1-q5`, `world5.ts:424`; `dd2005`, p. 12.

**Tempo:** introdução 7–9 s; final certo 4–5 s; final errado 6–7 s. Total: **11–14 s / 13–16 s**.

**Introdução**

1. Rua de bairro, carros estacionados dos dois lados.
2. Bola rola de trás de um carro.
3. Narração: “Há carros estacionados dos dois lados. Uma bola rola para a rua. O que você faz?”
4. Sons: **[barulho do bairro]**.
5. Pausa assim que a bola fica visível.

| Escolha | O que aparece |
|---|---|
| **a — correta** | Carro reduz e freia, preparado para parar antes da região de onde saiu a bola |
| b — buzinar e manter | **[buzina curta]**, ícone visual; carro segue sem reduzir e a cena congela |
| c — acelerar | Carro acelera brevemente; congelar antes de alcançar a região da bola |
| d — contramão | Carro inicia desvio para a faixa contrária; congelar antes de completar |

**Correção narrada:** “Reduza e prepare-se para parar. Pode vir uma criança atrás da bola.”

**Para guardar:** “Bola na rua? Criança logo atrás.” — mnemonic atual.

Na explicação, reforçar **“pode vir”**. Não fazer uma criança surgir na trajetória para provar o risco; a habilidade ensinada é prever sem esperar que alguém apareça.

### Revisão editorial dos roteiros

As falas propostas reutilizam fatos dos registros atuais. Antes de produzir áudio, conferir cada fala e cada quadro contra alternativa, explicação e fonte registradas.

Não fiz uma nova auditoria jurídica das fontes. A pendência explícita é a formulação completa da contagem da situação 2. Qualquer acréscimo sobre velocidade numérica, tempo de descanso, profundidade da poça ou técnica de manobra precisaria de verificação e aprovação próprias.

## 4. Legendas e acessibilidade auditiva

Em 360 px, reservar aproximadamente 328 px de largura útil para cena e legendas, com margens laterais. Cena em proporção próxima de 8:5; legenda **fora da imagem**, abaixo.

- Fonte de pelo menos 16 px como ponto inicial de projeto; permitir ampliação.
- Preferir até duas linhas por trecho em tamanho padrão, sem impor altura que corte texto ampliado.
- Dividir falas por sentido: “Use luz baixa.” / “Reduza e aumente a distância.”
- Sons importantes recebem texto e sinal visual no momento em que acontecem.
- A pista do motor permanece visível na pausa, para não depender de ter lido um instante específico.
- Sem depender de cor: acerto e erro têm símbolo e texto.
- Legendas sempre disponíveis, inclusive com áudio desligado.
- Transcrição completa em “Ler a situação” e “Ler o que aconteceu”.
- Narração e efeitos de correção não devem se sobrepor. Apenas um áudio principal toca por vez.

No caso da moto, a legenda inicial deve ser **“motor de veículo bem perto”**, equivalente ao enunciado. “Moto à esquerda” revelaria localização e identidade que o som, sozinho, não garante.

## 5. Propostas de melhoria

As propostas abaixo incluem o núcleo do pedido e melhorias complementares.

| Proposta: o que é | Por que ajuda | Esforço | Impacto | Arquivos que mudariam | Risco/regra |
|---|---|---:|---|---|---|
| **1. Vídeo com pausa e ramos por alternativa** | Liga escolha à ação vista | G | Alto | Novo `VideoEscolha.tsx`, catálogo e seis cenas | Mostrar outro erro ou revelar solução antes da escolha |
| **2. Correção compartilhada após o erro** | A última ação vista é a segura | M | Alto | Catálogo, cenas e falas | Alongar demais ou parecer correção possível após qualquer manobra |
| **3. Trava curta com conclusão acessível** | Torna a espera previsível e evita exclusão | M | Alto | `LessonPlayer.tsx`, novo componente | Travamento por falha de mídia; mudar nomes acessíveis |
| **4. Legendas de fala e som fora da cena** | Mantém todas as pistas sem áudio | M | Alto | Novo componente, tempos e `styles.css` | Texto cortado em 360 px ou pista visual entregar mais informação |
| **5. “Ver de novo” por trecho** | Permite rever só o jeito seguro | P/M | Médio | Novo componente | Recontar tentativa, XP ou bloquear avanço novamente |
| **6. “Ler o que aconteceu”** | Dá tempo para compreender sem acompanhar movimento | M | Alto | Novo componente e catálogo textual | Versões com informações diferentes |
| **7. Convite “O que você faria?”** | Estimula uma decisão antes de procurar a opção certa | P | Médio | Novo componente | Criar outra pausa obrigatória; usar sem atraso extra |
| **8. Teste de compreensão no piloto** | Verifica se a pessoa consegue aplicar a ideia | M | Alto | Roteiro de avaliação em documentação | Confundir gosto pela animação com aprendizado |

**Alternativas curtas:** deixaria como opção posterior. Inicialmente, manteria o texto completo verificado, com quebra de linha e área de toque ampla. Uma versão abreviada pode apagar condições essenciais, como “antes da poça”, “sem frear” ou “só se estiver livre”. Exigiria aprovação editorial, preservando o original e sua equivalência acessível.

**Ícones nas alternativas:** também opcionais. Só ajudam quando distinguem ações sem revelar qual é certa. Não usar ✓, escudo verde ou outro sinal de aprovação antes da verificação.

## 6. Como verificar aprendizado e manter pontuação

Assistir até o fim não comprova aprendizado. A sequência deve combinar:

1. Decisão antes da demonstração.
2. Relação entre a escolha e o gesto mostrado.
3. `whyWrong` específico no erro.
4. Demonstração correta.
5. Frase curta para guardar.
6. Revisão de erros já existente, sem criar outra regra de pontuação.

No piloto, pedir à pessoa, depois de outra atividade: **“O que você faria nessa situação? Por quê?”** Usar a explicação em suas palavras como evidência, sem exigir leitura fluente. Comparar compreensão com áudio desligado e na versão em quadros.

Não adicionar uma segunda pergunta obrigatória nem um botão “Entendi” como suposta prova de aprendizagem. Uma nova checagem dentro da lição seria opção futura, dependente de aprovação do dono.

**Regras preservadas:**

- 15 XP e domínio de 80% da lição.
- Acerto de primeira registrado na verificação original.
- Rever ou assistir à correção não transforma erro em acerto de primeira.
- Mesmas regras de vidas, combo, bônus, Leitner e revisão de erros.
- Sem entrada no simulado.
- Sem entrada na revisão sorteada: `reviewPool`, em `src/engine/review.ts:20`, seleciona lições com cartões; “Na rua” não os possui.
- Nenhuma nova persistência ou mudança de `localStorage`.

## 7. Técnica e implementação em lotes

### Formato técnico recomendado

Reaproveitar **motor SVG, modelos e pipeline de áudio**, criando um controlador próprio para o jogo.

`VideoConceito` oferece uma boa referência de relógio, áudio e carregamento; `AnimScene` oferece reação à resposta. Nenhum dos dois deve receber uma mudança global de comportamento para atender apenas ao Mundo 5.

O novo componente precisará receber **ID da alternativa**, não apenas `correct: boolean`, porque isso determina qual gesto errado mostrar.

Estados sugeridos:

`início → introdução → decisão → final da escolha → correção, se houver → concluído`

Pausa, erro de mídia e apresentação estática são condições tratadas explicitamente. A confirmação registra a nota; a conclusão visual apenas libera o avanço.

### Peso e carregamento

- Carregar apenas a cena atual e os recursos necessários a ela.
- Compartilhar motor, veículos e cenário entre ramos.
- Baixar áudio do ramo escolhido após a confirmação; não carregar os áudios das seis situações ao abrir a lição.
- Ter quadros/texto de reserva disponíveis sem depender do MP3.
- Manter caminhos compatíveis com `import.meta.env.BASE_URL`.
- Medir bytes transferidos, resposta dos botões e fluidez em Android simples antes de ampliar.
- Não presumir que SVG será leve: reduzir objetos, chuva e geometria que não ajudam a decisão.

MP4 ramificado é possível, mas acrescenta exportações, arquivos e sincronização entre finais. Não oferece vantagem suficiente para este primeiro lote.

### Lotes

| Lote | Entrega | Arquivos previstos | Condição para seguir |
|---|---|---|---|
| **1 — Piloto da poça** | Introdução, quatro ações, correção comum, legendas, versão estática e bloqueio curto | Novos componente/catálogo/cena; integração em `LessonPlayer.tsx`, `Exercises.tsx` e, se necessário, `Visual.tsx`; estilos | Dono aprovar clareza, duração e representação do erro |
| **2 — Validar pistas e tempo** | Moto e distância | Duas cenas, falas, tempos e áudio | Informação equivalente sem som; contagem correta |
| **3 — Completar** | Sono, neblina e bola | Três cenas e respectivos recursos | Revisão editorial de todos os ramos |
| **4 — Consolidar** | Desempenho, acessibilidade e regressões | Testes, documentação e eventuais ajustes compartilhados | Nenhuma regra de progresso ou questão fora do escopo afetada |

Para áudio, adaptar o fluxo de `scripts/audio/videos.ts` e os auxiliares usados por `scripts/audio/situacoes.ts`, mantendo a voz Davi. Produzir trechos e tempos próprios para introdução e finais. Não gerar falas nem consumir créditos antes de aprovar o roteiro.

Manter `situations.ts` como conteúdo verificado; preferir catálogo de apresentação separado, indexado pelos seis IDs. `world5.ts`, `grading.ts` e `session.ts` não precisam mudar suas regras.

### Testes necessários na implementação

- Selecionar não verifica; “Verificar” registra uma única tentativa.
- Cada ID abre o ramo certo, inclusive com alternativas embaralhadas.
- “Continuar” fica bloqueado no final e libera ao concluir.
- Erro passa pela correção antes de concluir.
- Repetição não altera nota, vidas, combo nem XP.
- Questão repetida na sessão reinicia o estado visual.
- Aba escondida pausa; retorno não pula para o fim.
- Falha de áudio usa relógio; falha de cena oferece equivalente sem travamento.
- Movimento reduzido, inclusive ativado durante a reprodução.
- Saída e troca de questão cancelam áudio, relógios e carregamentos pendentes.
- Conteúdo original, fontes, elegibilidade e revisão sorteada preservados.
- Nomes acessíveis “Verificar”, “Continuar” e “Sair da lição” preservados.

Executar `npx tsc --noEmit -p .` e `npm test` na implementação. A avaliação visual em 360 px, com ampliação de texto e tecnologias assistivas fica para uma etapa futura autorizada; não foi realizada nesta análise.

## 8. Top 3

1. **Aprovar o piloto da poça:** permite avaliar o erro sem susto e a correção curta.
2. **Resolver conclusão e acessibilidade no mesmo piloto:** evita produzir seis cenas sobre um fluxo que prende ou exclui pessoas.
3. **Validar moto e contagem antes do restante:** são os casos com maior risco de informação desigual e tempo representado incorretamente.

## 9. Riscos e o que NÃO fazer

- Não mostrar colisão, atropelamento, criança em trajetória de impacto, gritos ou freada assustadora.
- Não deixar o erro terminar como uma manobra bem-sucedida sem identificação.
- Não usar o mesmo gesto errado para alternativas com ações diferentes.
- Não transformar “pode acontecer” em consequência inevitável.
- Não obrigar movimento ou áudio para liberar a lição.
- Não liberar pelo tempo de relógio passado com a aba escondida.
- Não depender exclusivamente de `ended` ou `animationend`.
- Não ler a explicação inteira durante uma animação rápida.
- Não diminuir fonte nem cobrir a pista com legenda.
- Não alterar respostas, explicações, fontes ou pontuação para encaixar o vídeo.
- Não expandir o novo comportamento para outras cenas sem pedido.
- Não considerar tempo assistido como evidência de aprendizagem.