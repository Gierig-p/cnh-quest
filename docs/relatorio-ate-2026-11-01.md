# Relatório do projeto CNH Quest (26/10 a 01/11/2026)

Este relatório continua o `relatorio-ate-2026-10-25.md` e resume tudo o que foi feito desde então. Os detalhes técnicos de cada etapa estão no `ESTADO-DO-PROJETO.md` (seções 3, 5 e 7).

## 1. Situação em 01/11/2026

- O app está no ar em https://gierig-p.github.io/cnh-quest/. Cada `git push` na `main` roda os testes e republica.
- Último commit publicado: `16a6dc1` (rodadas e revisão da metade, 28/10).
- **Tudo o que foi feito em 01/11 está só no computador, sem commit nem publicação.** Está esperando o usuário testar no celular e pedir para publicar.
- Conteúdo: Mundos 1 e 2, com 128 questões no total (80 no Mundo 1 e 48 no Mundo 2). O simulado tem um banco de 40 questões.
- Testes: 61 de 61 passando. O build está ok.

## 2. Linha do tempo

| Data | Etapa | Resultado |
|---|---|---|
| 27/10 | Repaginação visual completa | Sistema de design, trilha em forma de estrada, animações, 11 sons, nova Lumi, diálogos e ajustes para celular. Testes de 24 para 29. Detalhes em `repaginacao-visual-duolingo.md`. |
| 27/10 | Publicação | GitHub Pages com deploy automático (repositório `Gierig-p/cnh-quest`). |
| 28/10 | Explicações mais didáticas | Os cartões de conceito ganharam fala da Lumi, "Palavras novas", "Passo a passo", "Na prática" e "Para guardar". Entraram 4 cartões novos para que toda questão seja ensinada antes de ser perguntada. |
| 28/10 | Mundo 2 "A linguagem das placas" | 5 lições + revisão, com questões conferidas nos Manuais Brasileiros de Sinalização de Trânsito (MBST, Vols. I–V). O simulado passou a ter as 30 questões completas (banco de 40). |
| 28/10 | Exercícios de fixação | Cada cartão tem pelo menos 4 exercícios variados. Nasceu a lição w1-l4 "Proibições e velocidade". Os exercícios de fixação ficam fora do simulado. |
| 28/10 | Rodadas e revisão da metade | Cada lição tem 2 rodadas; a 2ª é só prática. Cada mundo ganhou uma "Revisão da metade", além da revisão final. |
| 01/11 | Dicas de palavras | As palavras ensinadas nos cartões viram dicas clicáveis nos exercícios, como a "palavra nova" do Duolingo. |
| 01/11 | Botão "Dica" | Ajuda didática em 2 passos, com regras de uso (seção 3). |
| 01/11 | Mais variedade, parte 1 | As revisões ficaram maiores e são sorteadas. |
| 01/11 | Mais variedade, parte 2 (Mundo 1) | +33 variações de questões; a rodada 1 sorteia uma versão de cada objetivo. |
| 01/11 | Pares com correção na hora + tema escuro | Detalhes na seção 3. |
| 01/11 | Botão de tema no topo, ordenar arrastando, revisão de erros com perguntas diferentes | Detalhes na seção 3. |
| 01/11 | Sorteio salvo | A lição não troca mais de questões quando se sai e entra de novo. |

## 3. O que mudou para quem estuda (01/11)

### Dicas de palavras
- Palavras ensinadas nos cartões ficam destacadas nos exercícios. Um toque mostra a definição.
- **Roxo** = palavra ensinada nesta lição. **Cinza pontilhado** = palavra de uma lição anterior.
- O destaque reconhece plural e variações. Fica desligado nas questões em que a definição entregaria a resposta.
- Nenhum texto novo: as definições vêm dos cartões, que já tinham sido conferidos.

### Botão "Dica"
- Só libera depois de **60 segundos** na questão.
- Antes de mostrar, pede confirmação e avisa que a pontuação cai.
- Tem 2 passos: primeiro o "Para guardar" do cartão; depois, elimina uma alternativa errada explicando por quê (ou mostra um par / o primeiro item).
- Acertar usando dica **não conta como acerto de primeira**.
- Não existe dica no simulado, nas revisões nem nas perguntas de revisão de erros.

### Mais variedade
- **Revisões sorteadas:** a revisão da metade passou de 10 para 15 questões e a revisão do mundo, de 10 para 20. Elas cobrem todos os cartões, trazem primeiro as que a pessoa errou e misturam os tipos de exercício. Nenhuma questão nova.
- **Variações no Mundo 1:** +33 questões (de 47 para 80, 8 por cartão), cada uma treinando o mesmo objetivo de uma questão que já existia, com outro tipo de exercício. A rodada 1 sorteia uma versão por objetivo, e as lições continuam do mesmo tamanho.
- Textos legais conferidos no CTB (Planalto: arts. 29, 61, 70, 87, 89, 90, 208 e 214). Fatos dos MBST, só os já verificados. As variações não entram no simulado.

### Sorteio salvo
- O sorteio de cada lição acontece na **primeira vez** que ela abre e fica guardado no progresso.
- Sair e entrar, ou "Tentar de novo", repete as mesmas questões. Vale para a rodada 1, a rodada de prática e as revisões.
- Se uma questão salva deixar de existir, a lição sorteia de novo. "Recomeçar progresso" apaga também os sorteios.

### Revisão de erros com perguntas diferentes
- Ao errar, entram no fim da lição **até 2 perguntas diferentes sobre o mesmo assunto** (do mesmo cartão). Primeiro as que treinam a mesma ideia, de preferência em outro formato.
- Se só existe 1 alternativa, a própria questão errada completa as 2. Se não existe nenhuma, a mesma questão volta, como era antes.
- Errar na revisão não traz mais perguntas. As perguntas da revisão não contam na porcentagem de acerto de primeira.

### Exercícios
- **Pares:** cada par é conferido na hora. O par certo fica verde e trava; o errado fica vermelho e solta. O exercício se verifica sozinho no fim. Um erro no caminho tira o acerto de primeira.
- **Colocar em ordem:** dá para arrastar as caixas com o dedo ou com o mouse. As setas continuam lá, para teclado e leitor de tela.

### Tema escuro
- Botão de **lua/sol no topo** para ligar e desligar o tema escuro.
- Em Progresso → "Tema" há as opções Automático, Claro e Escuro. Automático segue o celular.
- A escolha fica salva e já vale ao abrir o app, sem piscar o tema claro.
- Em celulares estreitos (até 400 px), o nome "CNH Quest" some do topo e fica só a Lumi, para tudo caber.

## 4. Regras novas combinadas com o usuário

- Acerto com dica não conta como acerto de primeira. Sem dica no simulado, nas revisões e na revisão de erros.
- A revisão de erros usa perguntas diferentes do mesmo assunto, com volta ao jeito antigo quando não houver alternativa.
- O sorteio de cada lição fica salvo depois da primeira abertura.
- Nos próximos mundos:
  - termos dos cartões precisam de `aliases` (plural e variações), e as dicas que entregariam a resposta são desligadas com `skipIn`;
  - todo cartão precisa de "Para guardar" (`remember`) e toda alternativa errada precisa de explicação (`whyWrong`).
- Continuam valendo: pelo menos 4 exercícios por cartão, fora do simulado; 2 rodadas por lição; revisão da metade e revisão final.

## 5. Como foi conferido

- Testes automáticos: de 29 (27/10) para **61**, cobrindo conteúdo, motor, interface, dicas, sorteios, pares, tema, ordenar arrastando, revisão de erros e sorteio salvo.
- Capturas de tela no navegador: dicas de palavras, botão Dica, trilha e cartão no tema escuro, e o topo do celular em 360 px.
- **Ainda não testado em aparelho real:** arrastar no "Colocar em ordem" (a ferramenta de captura não simula arrasto), o ritmo da correção dos pares e as cores do tema escuro.

## 6. Pendências e próximos passos

1. **O usuário testar no celular** tudo o que foi feito em 01/11 e pedir a publicação (commit + push).
2. **Decidir:** ao refazer uma lição já concluída, ela deve sortear questões novas? Hoje repete o mesmo sorteio. Com o sorteio fixo, a rodada de prática e as revisões também deixam de priorizar os erros novos.
3. Variedade no Mundo 2, como foi feito no Mundo 1 (cerca de 8 questões por cartão, com fonte oficial conferida).
4. Mundo 3 "Regras para circular" e Mundo 4 "Infrações", para equilibrar o simulado entre os módulos.
5. Os demais itens seguem a lista da seção 9 do `ESTADO-DO-PROJETO.md`.
