# Plano de melhorias do CNH Quest (v2: Claude e Codex de acordo)

Este plano junta as cinco análises dos especialistas (`respostas/01..05`), o rascunho `PLANO-v1.md` e a crítica do Codex (`respostas/06_critica_plano.md`). **Ele espera a aprovação do dono.**

**Princípio:** primeiro a pessoa consegue estudar, depois vem a festa. Nenhuma regra de XP, Leitner, desbloqueio, conteúdo legal ou simulado muda sem decisão do dono.

## Entrega 1: base fechada e sem tropeços
- Fechar o trabalho de 01/11, que está sem commit: 22 arquivos modificados e 6 novos. Os testes passam (61/61, rodados pelo Claude em 14/11).
- **Bugs que o Codex confirmou no código:**
  - O som do combo pode tocar depois de sair da lição (`LessonPlayer.tsx:122`).
  - Depois de usar a dica, o Tab pode pular todas as alternativas (`Exercises.tsx:108`).
  - As teclas 1–9 funcionam atrás de um diálogo aberto (`Exercises.tsx:83`).
  - Nos pares, o leitor de tela fica preso na mensagem anterior (`Exercises.tsx:412`).
  - O topo mostra uma ofensiva antiga mesmo depois de dias sem estudar (`Panels.tsx:11`, `ProgressScreen.tsx:71`). A correção é só na exibição.
  - A tela de revisão promete "16 dias", mas a caixa 5 nunca volta à fila. A correção é só no texto.
- **Risco parcial:** o `check` não tem trava. Entra uma trava por questão e um teste, sem afirmar que o XP já duplica.
- **Foco e leitura:**
  - o foco vai para o enunciado novo a cada questão;
  - na ordenação, o arraste fica numa alça;
  - o contraste das cores de texto é corrigido nos pontos medidos;
  - o feedback deixa de ter uma segunda rolagem.
- **Movimento reduzido:** quando o celular pede menos movimento, prevalece a opção mais restritiva. Isso fica explicado em Ajustes.

## Entrega 2: começar fácil e uma festa pequena (o pedido central)
- **Cartão "Hoje"** no topo da trilha, com uma ação só:
  - "Revisar N questões", com o tamanho real da sessão (até 12);
  - ou "Continuar: <lição>";
  - quando a meta é batida, "Seu estudo de hoje está feito".
- **Instrução curta na primeira vez de cada tipo de exercício**, como "Toque em uma resposta e depois em Verificar".
- **Combo com 3 marcos:**
  - chip a partir de 2;
  - **3:** o chip pulsa e aparece "3 acertos seguidos!";
  - **5:** a Lumi acena e acende a luz verde;
  - **10:** um carrinho próprio atravessa uma mini-estrada.
  - Depois do 10, só o número cresce.
  - O som de cada marco **substitui** o som de acerto, com tons que sobem.
  - A frase entra no feedback que já existe, para o leitor de tela também ler.
  - A celebração substitui as faíscas comuns, sem somar a elas.
  - Dura menos de 1 s, nunca segura o "Continuar" e é cancelada ao avançar, sair ou abrir um diálogo.
  - Sem XP extra. Errar zera o combo em silêncio.
- **Movimento mais calmo:**
  - a troca de questão leva 180 ms, sem cascata;
  - a barra de progresso fica mais suave (`scaleX`);
  - a estrada para de se mexer à toa;
  - o desbloqueio ganha um anel e um som.
- **Aviso no simulado** de que o banco ainda não cobre todos os assuntos.

## Entrega 3: entender melhor e querer voltar
- **Cartão longo em partes** ("Parte 1 de 3"). Primeiro num cartão de teste, depois nos outros.
- **Correção em camadas:**
  - "certo/errado + por quê" fica visível;
  - "Ver explicação completa" abre o resto;
  - nos pares, uma mensagem explica que houve um erro no caminho.
- **"Ver a explicação de novo"** depois de responder, só nas lições comuns.
- **Fim de sessão honesto:** "Por hoje está ótimo" e a data real da próxima revisão.
- **Tela "O que você já estudou"** com os 4 módulos ("sem conteúdo ainda", "começou", "praticado") e as notas do simulado, nunca uma "chance de passar".
- **Final especial para a lição perfeita** (todos os acertos de primeira): selo, a Lumi pula e confete curto.

## Entrega 4: só com evidência (depois de testar com pessoas)
- Letra grande em Ajustes.
- "Ouvir texto" (a voz do navegador), num protótipo.
- A fonte servida pelo próprio site.
- Missão diária, pausa semanal da ofensiva, data da prova e lembrete `.ics`, só se o cartão "Hoje" não bastar.

## Em paralelo: conteúdo
Os Mundos 3–8 (regras de circulação, infrações, primeiros socorros, meio ambiente) são o que mais pesa para passar na prova. Seguem numa frente própria, com fonte oficial.

## Validação
Antes de ampliar, testar com 3 a 5 pessoas do público (idosos, quem lê com dificuldade, quem usa pouco o celular):
- começar sozinho;
- explicar um cartão com as próprias palavras;
- entender por que errou.
