# Pedido 07: Cenas animadas que reagem à resposta ("3D disfarçado de 2D")

Leia `docs/codex/BRIEFING.md` e siga as regras dele, inclusive as restrições de execução: não rode navegador nem servidor e não altere nenhum arquivo, grave só a resposta.

**Seu papel:** diretor de arte técnico e especialista em ilustração animada para apps educativos mobile. Esta é uma **auditoria de viabilidade**: ninguém vai implementar nada antes da sua resposta.

## A ideia do dono (nas palavras dele, 14/11/2026)
> "Fazer umas imagens mais detalhadas, e algumas quero animar, fazer uma espécie de 3D disfarçado de 2D. E quando responder a questão o carro faz o movimento de acordo com a pergunta. Ex.: o pedestre está passando na faixa, o que você faz? Quando fizer a resposta certa, o pedestre atravessa a rua."
>
> "Quero fazer todas as imagens novas nesse mesmo formato, priorizando a qualidade."

Ou seja:
1. **Todas as cenas novas** (as que ainda faltam, por exemplo os desenhos do Mundo 3 e os mundos 4 a 8) vão nascer num visual novo, mais detalhado, com cara de 2D mas com profundidade de 3D: volume, sombra, perspectiva.
2. **Algumas questões** ganham uma cena que se mexe depois da resposta. O carro ou as pessoas fazem o que a resposta certa manda.

## O que existe hoje (leia)
- As cenas são SVG feito à mão em `src/components/SceneArt.tsx` (cerca de 1.050 linhas, `viewBox 320x200`, vista de cima ou de lado, texturas em `<Defs/>`). As placas estão em `src/components/SignArt.tsx`, e o despacho fica em `src/components/Visual.tsx`.
- O tipo `Visual` e a lista `SceneId` ficam em `src/content/types.ts:38-70`. As cenas são usadas nas questões de `src/content/world1.ts`, `world2.ts` e `situations.ts`. O Mundo 3 (`world3.ts`) ainda não tem desenhos.
- A tela da questão e o feedback ficam em `src/screens/LessonPlayer.tsx` (`check`, `fb`, `next`). As animações atuais estão em `src/styles.css` e `src/components/Fx.tsx`. A resposta do pedido 03 (`docs/codex/respostas/03_animacoes.md`) já discutiu desempenho de animação.
- O app é publicado no GitHub Pages (estático). O público usa muito celular simples, e a pessoa pode ter pouca escolaridade.

## Técnicas a comparar (ou outras que você ache melhores)
- **A) SVG em camadas animado** com CSS e a Web Animations API. É o que existe hoje, mais detalhado: sombras, perspectiva isométrica ou 3/4, camadas que se mexem.
- **B) 3D de verdade no navegador** (Three.js com câmera ortográfica e luz "toon", que parece desenho). Vale pesar o custo no tamanho do app, na bateria e no celular fraco.
- **C) Pré-renderizado:** a cena é feita em 3D fora do app (o dono já tem um fluxo de Remotion e Three.js em outro projeto) e exportada como vídeo curto (WebM ou MP4 mudo) ou como sequência de quadros. Teria um estado parado, a animação da resposta certa e talvez a da errada.
- **D) Híbrida:** por exemplo, o fundo pré-renderizado e os personagens em SVG animado por cima.

Para cada técnica, diga a qualidade visual possível, o peso em KB por cena, o desempenho em celular fraco, a dificuldade de produzir 50 a 100 cenas mantendo o mesmo estilo, a acessibilidade (`prefers-reduced-motion`, texto alternativo) e o custo de manutenção.

## O que responder
1. **Viabilidade e recomendação:** qual técnica (ou combinação) você usaria para "todas as cenas novas" e qual para "as que reagem à resposta". Justifique.
2. **Regras pedagógicas da animação:**
   - a cena parada nunca entrega a resposta;
   - o que acontece na **resposta errada**: mostrar a consequência, ficar parada ou mostrar o certo depois? Pense no ético (BRIEFING: sem culpa e sem susto pesado, nada de batida ou atropelamento mostrado de forma chocante);
   - a animação não pode atrasar o "Continuar" nem esconder o feedback;
   - quanto tempo cada animação deve durar.
3. **Questões candidatas:** leia as questões de `world1.ts`, `world2.ts`, `world3.ts` e `situations.ts` e escolha **de 8 a 15** que ficam melhores com a cena reagindo à resposta. Para cada uma, dê:
   - o id da questão;
   - a cena parada (o que aparece antes de responder);
   - o que se mexe na resposta certa;
   - o que acontece na errada;
   - se a animação continua fiel à lei e à explicação da questão (cite o artigo ou a fonte que já está na questão).
   Separe também as que **não** devem animar e diga por quê (por exemplo, questões de conceito puro ou de placa).
4. **Encaixe no código:** como o tipo `Visual` mudaria (por exemplo, um campo com os estados `parado`, `certo` e `errado`), onde a `LessonPlayer` dispara a animação e como fica o modo de movimento reduzido. Descreva sem escrever o código.
5. **Estilo visual:** proponha um guia curto para as cenas novas, que mantenha a identidade do app (`src/styles.css`, cores da Lumi):
   - o ângulo de câmera;
   - a paleta;
   - a espessura do contorno;
   - a sombra;
   - as proporções de carros e pessoas;
   - como evitar estereótipos.
6. **Riscos e o que NÃO fazer:**
   - peso do site;
   - celular fraco;
   - cenas que ensinam errado por detalhe visual (posição do carro, faixa, sinal);
   - tempo de produção.
7. **Piloto:** sugira uma ordem de trabalho começando por um piloto de 2 ou 3 cenas, entre elas a do pedestre na faixa (`pedestre-faixa`), para o dono aprovar o estilo antes de refazer as demais.

**Grave a resposta em:** `docs/codex/respostas/07_cenas_animadas.md`
