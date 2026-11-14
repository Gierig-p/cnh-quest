# Briefing comum para os especialistas (Codex)

Você é um especialista convidado para analisar o **CNH Quest**, um app web no estilo Duolingo (identidade própria, mascote Lumi) para estudar a **prova teórica do DETRAN** (1ª habilitação A/B). Ele está no ar em https://gierig-p.github.io/cnh-quest/. O app é feito em React 18, TypeScript e Vite, sem backend e sem login, e o progresso fica no `localStorage`.

## Leia antes
- `docs/ESTADO-DO-PROJETO.md`: estado, arquitetura, regras de negócio, restrições e próximos passos. **Obrigatório.**
- Depois, o código em `src/`. As telas ficam em `src/screens/`, os componentes em `src/components/`, as regras puras em `src/engine/`, o conteúdo em `src/content/`, o sistema de design em `src/styles.css` e o áudio em `src/ui/sound.ts`.
- Há capturas de tela antigas em `docs/capturas-cnh-quest/` (PNG). Elas podem estar desatualizadas.

## O que o dono do projeto quer (nas palavras dele)
1. Deixar o app **simples e fácil, para que qualquer pessoa consiga aprender leis de trânsito**. Isso inclui pessoas com pouca escolaridade, quem tem pouca familiaridade com celular, idosos e quem lê com dificuldade.
2. Deixar o app **viciante**, no bom sentido: a pessoa quer voltar todo dia.
3. **Melhorar as animações** e criar **animações diferentes para a sequência de acertos (combo)**, no estilo do Duolingo.
   - Hoje existe um combo só visual em `LessonPlayer.tsx`: o chip "N seguidas" a partir de 2 acertos, o som `combo` a partir de 3 e o texto "· N acertos seguidos!" no feedback.

## Regras que você precisa respeitar ao sugerir
- **Não** proponha mudar respostas, explicações legais ou fontes. Toda informação de lei precisa de fonte oficial.
- **Não** proponha copiar material, sons, ilustrações ou Lottie do Duolingo. Use só como referência de mecânica.
- Sem backend por enquanto. Se uma ideia precisar de servidor, marque como "futuro".
- Mantenha os nomes acessíveis usados nos testes (`Vamos lá`, `Começar a trilha`, `Verificar`, `Continuar`, `Sair da lição`, `Efeitos sonoros`...).
- Respeite `prefers-reduced-motion` e a acessibilidade.
- O "viciante" tem que ser ético: nada de culpa, manipulação ou punição pesada. A Lumi nunca deboche do erro.

## Restrições de execução (importante)
- **Não rode** navegador, Chrome, Edge, Playwright, servidor de desenvolvimento, `npm run dev` nem `npm install`. Analise só lendo os arquivos. Se quiser, pode rodar `npm test` ou `npx tsc --noEmit`.
- **Não altere** nenhum arquivo do projeto. Grave só a sua resposta, no caminho indicado no pedido.

## Formato da resposta (em português do Brasil, linguagem simples)
1. **Diagnóstico** (o que está bom e o que atrapalha), sempre citando `arquivo:linha` ou a tela.
2. **Propostas**, de 5 a 12. Cada uma com:
   - o que é;
   - por que ajuda a pessoa leiga;
   - o esforço (P, M ou G);
   - o impacto (baixo, médio ou alto);
   - os arquivos que mudariam;
   - o risco ou a regra que pode quebrar.
3. **Top 3**: o que você faria primeiro e por quê.
4. **O que NÃO fazer**: ideias que parecem boas, mas atrapalhariam.
