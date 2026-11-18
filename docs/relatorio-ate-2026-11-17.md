# Relatório do projeto CNH Quest (02/11 a 17/11/2026)

Este relatório continua o `relatorio-ate-2026-11-01.md` e resume as mudanças desde então e como cada uma foi feita. Entre 02/11 e 13/11 não houve trabalho no projeto; tudo aconteceu de 14/11 a 17/11. Os detalhes técnicos de cada etapa estão no `ESTADO-DO-PROJETO.md` (seção 7, "Diário").

## 1. Situação em 17/11/2026

- O app está no ar em https://gierig-p.github.io/cnh-quest/. Cada `git push` na `main` roda os testes e republica.
- Último commit publicado: `2511715` (vídeos do Mundo 5, lote 4).
- **Nada está pendente no computador.** Tudo o que foi aprovado foi publicado.
- Conteúdo: **5 mundos e 337 questões**:

  | Mundo | Tema | Questões |
  |---|---|---|
  | 1 | Sinalização | 80 |
  | 2 | A linguagem das placas | 48 |
  | 3 | Regras para circular | 64 |
  | 4 | Infrações e consequências | 70 |
  | 5 | Motorista defensivo | 75 |

- Todos os cartões de conceito dos Mundos 1 a 5 têm vídeo animado com narração.
- As 6 situações "Na rua" do Mundo 5 são vídeos em que a pessoa escolhe o que fazer.
- Testes: 204 de 204 passando (eram 61 em 01/11). O build está ok.

## 2. Linha do tempo

| Data | Etapa | Commit |
|---|---|---|
| 14/11 | Mudanças de 01/11 publicadas: dicas de palavras, botão Dica, revisões sorteadas, variações do Mundo 1, tema escuro, sorteio salvo | `4f71ac5` |
| 14/11 | Imagens nas questões (87 de 128 com visual) e placas reais do Wikimedia Commons | `4f71ac5`, `ac4d431` |
| 14/11 | Plano de melhorias com o Codex (`docs/codex/PLANO-v2.md`), Entregas 1 a 4 | `b40e2bd`, `7d493b1` |
| 14/11 | Botão "Ouvir explicação" nos cartões (voz Davi, ElevenLabs) | `f6f9873` |
| 14/11 | Lições "Na rua": 6 situações narradas, com sons, no fim de cada mundo | `187566a` |
| 14/11 | Mundo 3 "Regras para circular", plano até a prova, pausa da ofensiva e missão do dia | `572288e` |
| 14/11 | Botão "Ir para as perguntas" e som que espera o áudio acordar | `14ceb21` |
| 15/11 | Cenas em estilo 3D (motor próprio em SVG): Mundos 1, 2 e 3 aprovados e ligados no app | `3566f18` a `79da513` |
| 15/11 | Imagens maiores nas lições e nos cartões | `bba83cf` |
| 15/11 | Vídeo animado no cartão de conceito: piloto aprovado, depois todos os cartões dos Mundos 1, 2 e 3 | `10fe17b` a `ca7cb17` |
| 16/11 | Mundo 4 "Infrações e consequências" e "Aulas" dentro da aba Revisar | `7e7b6b2` |
| 16/11 | Vídeos dos 12 cartões do Mundo 4 e imagens 3D das questões | `2c1726a` |
| 16/11 | Placas desenhadas nas questões, dica liberada em 20 s e botão de voltar | `23c8f90` |
| 16/11 | Correção do selo de mundo concluído | `c03522f` |
| 16/11 | Mundo 5 "Motorista defensivo" com áudios e imagens 3D | `adf2946` |
| 17/11 | Vídeos do Mundo 5, lotes 1 e 2, e plano das situações em vídeo | `b87d4c3` |
| 17/11 | Situações "Na rua" em vídeo de escolha: poça, moto no ponto cego, distância atrás do caminhão, sono de madrugada, neblina na serra, bola entre carros | `710105a` a `08e777c` |
| 17/11 | Motorista da "Posição certa ao dirigir" refeito com detalhes, cabeça e espelho detalhados | `bb7d57a` |
| 17/11 | Vídeos do Mundo 5, lote 3: reação, distração, dois segundos | `dc3c8b9` |
| 17/11 | Vídeos do Mundo 5, lote 4: velocidade na via, chuva, neblina | `2511715` |

## 3. O que mudou para quem estuda

### Novos mundos
- **Mundo 3 "Regras para circular"**: mão e faixas, ultrapassagem, conversões, luzes e buzina, parada e estacionamento, velocidade e equipamentos. O texto do CTB foi conferido no Planalto em 14/11.
- **Mundo 4 "Infrações e consequências"**: multa e pontos, suspensão e cassação, infrações do dia a dia, álcool, crimes de trânsito e a multa no seu nome.
- **Mundo 5 "Motorista defensivo"**: pensar antes, veículo em dia, postura e visão, atenção e reação, distância e velocidade, chuva, neblina e luz.
- Cada mundo segue a mesma estrutura:
  - lições com 2 rodadas;
  - "Revisão da metade";
  - "Na rua";
  - revisão final.

### Explicações em vídeo
- A primeira página de cada cartão de conceito é um vídeo animado de 40 a 65 segundos com narração da voz **Davi** e legenda.
- Tem barra de progresso e um toque pausa.
- As falas repetem o texto do cartão, sem fato novo.

### Situações "Na rua" em vídeo de escolha (Mundo 5)
- A cena começa. A pessoa escolhe o que fazer e vê a consequência.
- No erro, o carro começa a errar e congela antes de qualquer batida, com um X e "Agora, veja o jeito seguro".
- A questão e a resposta são as mesmas que já estavam no app. Só a apresentação mudou.

### Imagens
- As questões ganharam cenas em estilo "3D desenhado", com sombra e volume.
- As placas são as oficiais (MBST e Wikimedia Commons).
- As imagens ficaram maiores: até 440 px, ocupando a largura no celular.
- Algumas cenas reagem à resposta. Por exemplo, o PARE de madrugada na `w1-rua-5`.

### Estudo do dia a dia
- **Cartão "Hoje"** no topo da trilha, com uma só ação: revisar o que venceu, continuar a lição ou "estudo de hoje feito".
- **Plano até a prova** (opcional): com a data marcada, o app mostra "Prova em N dias" e quantas lições fazer por dia.
- **Pausa da ofensiva**: um dia sem estudar a cada 7 não quebra a sequência.
- **Missão do dia.**
- **Aulas** (dentro da aba Revisar): reveja o vídeo e o resumo de qualquer conceito e pratique só aquela aula.

### Conforto e acessibilidade
- **Cartão em partes**: cartões longos são divididos em "Parte 1 de N", com botão Voltar.
- **Botão "Ouvir explicação"** em todos os cartões.
- **Letra grande** em Ajustes.
- **Movimento reduzido.**
- Contraste melhor e foco certo pelo teclado.
- Som de acerto mais suave.
- **Botão "Dica"** agora libera em 20 s (antes 60 s).
- **Placas pelo código**: tocar no código de uma placa já ensinada mostra a placa grande. Se a placa entregaria a resposta, ela fica guardada para a dica.

## 4. Como foi feito

### Método de trabalho combinado com o dono
1. **Planejamento com o Codex** nas mudanças grandes, com os pedidos e as respostas guardados em `docs/codex/`:
   - plano de melhorias (`PLANO-v2.md`);
   - cenas animadas (pedido 07);
   - rever explicações (pedido 09);
   - situações em vídeo (pedido 10).
2. **Lotes pequenos com aprovação.** Toda arte e todo vídeo foram feitos em lotes de 3 vídeos ou de uma situação. Cada lote gera uma **folha de quadros** (`docs/piloto/folha_*.png`) para o dono aprovar. Só depois da aprovação acontecem o commit e a publicação.
3. **Conferência antes de mostrar.** Cada folha foi conferida ampliada, procurando textos sobrepostos, objetos cortados, cenas confusas e proporções erradas. O que estava errado foi corrigido antes de chegar ao dono.
4. **Conteúdo legal com fonte oficial.** Conferido no CTB (Planalto), nos MBST e nas Resoluções do CONTRAN. Os vídeos e as situações só repetem fatos que já estavam verificados nos cartões e nas questões.

### Desenho das cenas (sem 3D no navegador)
- **Mini motor 3D em SVG** (`src/components/scenes/engine.tsx`):
  - câmera ortográfica 3/4, com luz do alto à esquerda;
  - sombras no chão;
  - ordem de desenho automática.
- Fica leve: não usa biblioteca nem vídeo MP4.
- Peças reaproveitáveis: carros, casas, árvores, placas no poste (`signs.tsx`), a cabine com o motorista (`VideoPosicao.tsx`) e as peças de interface de cada mundo (`infracoesUI.tsx`, `defensivaUI.tsx`).
- **Pedido do dono, 17/11: "construir com detalhes".**
  - Personagens e cenas realistas, sem bonecos de palito.
  - O motorista ganhou proporções corretas, braços e pernas com duas articulações, e o interior do carro de verdade.
  - Esse motorista virou o modelo de todas as cenas dentro do carro.
- Cada parte do código de cena só carrega quando é usada. Exemplos: Mundo 4 e Mundo 5.

### Vídeos dos cartões
1. **Falas**
   - Escritas em `src/content/videos.ts`, a partir do texto do cartão.
   - Números escritos por extenso.
   - Nenhum fato novo.
2. **Áudio**
   - Gerado com o ElevenLabs (voz Davi), que também gera os tempos de cada fala (`src/content/videos/*.json`).
   - O mp3 fica em `public/audio/videos/`.
3. **Cena**
   - Um arquivo `Video*.tsx` com um trecho por fala.
   - A função `fazerVideo` troca de trecho meio segundo antes de cada fala, com um escurecido rápido no corte.
4. **Ligação**
   - O cartão no `worldN.ts` recebe o vídeo e o resumo.
   - O carregador fica em `VideoConceito.tsx`.
5. **Testes**
   - Conferem que as falas batem com os tempos.
   - Conferem que cada vídeo abre.

### Situações em vídeo de escolha
- **Catálogo de apresentação** em `src/content/escolhas.ts`:
  - fala da introdução;
  - fala de cada final, pelo ID da alternativa;
  - textos dos quadros parados.
- A questão original em `situations.ts` não mudou.
- O áudio mistura a voz com um som de fundo (chuva, estrada, bairro, neblina). Em alguns finais entra um efeito, como a buzina curta. O ffmpeg roda com `-nostdin` para não travar.
- Cada situação tem sua cena (`Escolha*.tsx`): introdução, um final por alternativa e o "jeito seguro" depois do erro.

### Segurança
- **Chave do ElevenLabs**
  - Fica fora do repositório.
  - Antes de cada commit, uma busca no que vai ser enviado confere que ela não está lá. O repositório é público.
- **Testes antes do commit.** O `npm test` roda sempre antes de cada commit. O GitHub roda de novo antes de publicar: se um teste falhar, o site antigo continua no ar.

## 5. Regras novas combinadas com o dono

1. Todas as artes vão para o estilo 3D, em lotes por mundo, cada lote aprovado por folha.
2. Vídeos e situações "com detalhes": personagens e cenas realistas, no estilo das animações aprovadas.
3. As falas dos vídeos repetem o cartão, sem fato novo.
4. Nas situações em vídeo, o erro nunca mostra a batida: a cena congela antes.
5. Fixação continua valendo: pelo menos 4 exercícios por cartão. Os exercícios de fixação ficam fora do simulado.
6. A aprovação é lote a lote. "Aprovo, pode continuar" autoriza o commit, a publicação e o próximo lote.

## 6. Pendências e próximos passos

1. **Mundo 6 "Emergências e primeiros socorros"**: conteúdo com fonte oficial, imagens 3D, vídeos dos cartões e situações "Na rua".
2. Levar o vídeo de escolha às situações "Na rua" dos Mundos 1 a 4, se o dono quiser.
3. Os demais itens seguem a lista de próximos passos do `ESTADO-DO-PROJETO.md`.
