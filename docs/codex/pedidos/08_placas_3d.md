# Pedido 08: Placas de trânsito nas cenas 3D (auditoria da peça `signPost` e do balão)

Leia `docs/codex/BRIEFING.md` e siga as regras dele, inclusive as restrições de execução: não rode navegador, servidor nem Vite, e não altere nenhum arquivo. Pode rodar `npx tsc --noEmit -p .`. Grave só a resposta.

**Seu papel:** revisor técnico e pedagógico. É uma **auditoria**: você confere e aponta, e quem corrige é o Claude.

## Contexto
O dono aprovou o motor 3D em SVG das cenas que reagem à resposta (`src/components/scenes/engine.tsx`, `models.tsx` e as cenas `PedestreFaixa.tsx`, `LinhaRetencao.tsx` e `PortaBicicleta.tsx`). Agora as cenas que têm placa vão usar uma placa 3D no poste. O dono aprovou o visual a partir destas folhas:
- `docs/piloto/folha_placas_celular.png`: tamanho real do celular;
- `docs/piloto/folha_placas_perto.png`: as mesmas placas de perto.

Pode abrir as duas imagens para olhar.

**Plano aprovado:**
1. **Desenho oficial na placa:** o desenho de `public/placas/` é colado na frente da chapa com uma transformação afim (a câmera é ortográfica, então o plano não deforma). Quando a placa não tem arquivo oficial, usa o desenho do próprio app (`SignArt`).
2. **A peça `signPost`:**
   - a chapa tem o recorte da placa;
   - a borda é fina e as costas são cinza;
   - o poste é um cano;
   - a chapa começa a cerca de 2 m do chão;
   - a placa é desenhada 1,5× maior que a real;
   - a frente fica sem luz nem sombra.
3. **Balão (`SignCallout`):** uma camada por cima da cena, com a placa a cerca de 46 px e uma linha fina até o alto do poste.
4. **Câmera:** fica atrás do carro e vê a placa no máximo cerca de 35° fora da frente.
5. **Regras por tipo de questão:**
   - "O que essa placa indica?": continua com a `SignArt` plana, sem cena 3D;
   - situação com placa: cena 3D com balão e animação;
   - `placa-escondida`: cena 3D sem balão, porque as folhas cobrem a placa de verdade;
   - `placa-distancias`: cena 3D de rodovia com a placa grande e um balão.
6. **Cenas que mudam:**
   - `placa-escondida` (`src/content/world1.ts:374`, `:830` e `:1493`);
   - `placa-distancias` (`src/content/world2.ts:1187`);
   - `w1-rua-5` (`src/content/situations.ts:133`, PARE, vira cena 3D animada);
   - `w2-rua-5` (`situations.ts:310`, A-41, "o que essa placa indica?") continua plana.

## Arquivos para ler
- `src/components/scenes/signs.tsx`: `signPost`, `signTop`, `signSize`, `SignCallout` e o recorte de cada forma em `contorno`.
- `src/components/SignArt.tsx`:
  - `placaUrl`, `signGraphic` (o aspecto de cada arquivo e o recorte da IND-destino);
  - `officialFile`;
  - a função `render` (o desenho do app quando não há arquivo).
- `src/components/scenes/engine.tsx`: o campo `art` em `Face` e `Art`, o `tf` e o trecho de `drawPart` que desenha o `art`.
- `public/placas/*.svg` e `public/placas/CREDITOS.md`.

## O que conferir
1. **Fidelidade das placas** (o aluno precisa reconhecer a placa na prova):
   - a forma de cada código está certa? (R-1 octógono, R-2 triângulo com a ponta para baixo, circulares, losango das A, A-41 em X, retângulo verde de indicação);
   - as cores e proporções correspondem ao arquivo oficial?
   - a forma de trás (o recorte) entrega a placa certa, como o octógono do PARE visto de trás?
   - a altura (a chapa a 2 m) e a posição no poste são plausíveis segundo o Manual Brasileiro de Sinalização (CONTRAN)? Diga se o aumento de 1,5× pode passar alguma ideia errada.
2. **O balão nunca entrega a resposta:**
   - leia as 3 questões de `placa-escondida`, a de `placa-distancias`, a `w1-rua-5` e a `w2-rua-5` (alternativas e explicação);
   - para cada uma, diga se o balão pode aparecer, onde e se ele muda o que a questão quer avaliar;
   - na `placa-escondida`, o balão mostraria a placa que as folhas escondem: confirme que deve ficar sem balão e diga se a cena 3D deve deixar algum pedaço visível;
   - na `placa-distancias`, os números da placa SÃO o conteúdo da questão: o balão deve mostrar os números? É preciso ler os três destinos e os km?
3. **Código** (sem editar):
   - erros de lógica em `contorno` (X, triângulo, octógono), na escolha da face da frente (`frente` em `signPost`) e na matriz do `art` em `drawPart`;
   - o `art` aparece só de frente? Some de trás e de lado, como deveria?
   - a ordem de desenho: a chapa contra o cano, a placa contra os carros e as árvores (o motor ordena por caixas e planos);
   - o `placaUrl` com `base: './'` no GitHub Pages: a imagem carrega dentro de `<image href>` no SVG?
   - acessibilidade: o balão e a placa são só decoração? O `alt` da cena já descreve a placa?
   - desempenho: cada `<image>` é um pedido de rede a mais; isso pesa num celular fraco? Vale embutir?
4. **Riscos:** o que pode ensinar errado, por exemplo uma placa do lado errado da via, virada para o lado errado ou longe demais do ponto de parada.

## Formato da resposta
Separe **correções obrigatórias** de **sugestões**. Para cada item, dê arquivo:linha (ou o id da questão), o que está errado e a sugestão.

**Grave a resposta em:** `docs/codex/respostas/08_placas_3d.md`
