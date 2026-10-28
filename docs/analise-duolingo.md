# Análise do Duolingo (Fase A) — CNH Quest

Data da investigação: 19/10/2026. Ferramenta: REA 6.7.0 (`capture_browser_scenario`, provedor Playwright), navegador Edge/Chromium 155 headless, locale pt-BR, fuso America/Recife, `reduced_motion: no-preference`.
Escopo: somente páginas públicas e o fluxo de visitante (sem conta). Nenhuma autenticação, CAPTCHA ou paywall foi contornado.

## 1. Funcionalidades observadas

| # | Funcionalidade | O que foi observado | Evidência (REA) | Captura |
|---|---|---|---|---|
| 1 | Home | Mascote + personagens, título, CTA "Comece agora" e "Já tenho uma conta"; no celular, layout em coluna única | `ev_a59a11bd…7856` | `01-home-mobile.png` |
| 2 | Escolha de curso | Grade de cursos com contagem de alunos (`/register`) | `ev_f90be021…76e7` | `01b-escolha-de-curso-desktop.png` |
| 3 | Onboarding | Etapas via `?welcomeStep=`: hdyhau → learningReason → proficiency → courseOverview → dailyGoal → choosePath; barra de progresso, seta voltar, mascote com balão | `ev_02350be2…4537`, `ev_60b230c1…a7c7`, `ev_c3980289…63a2`, `ev_808bda21…a2b8` | `02`–`06` |
| 4 | Meta diária | 4 níveis: Casual 5 min, Regular 10, Intensa 15, Puxada 20 (`data-test` daily-goal-10/20/30/50 → XP) | captura onb5 | `05-onboarding-meta-diaria.png` |
| 5 | Nivelamento | "Começar do zero" × "Encontrar o meu nível" | captura onb6 | `06-…escolher-caminho.png` |
| 6 | Tela de exercício | Botão sair (X), barra de progresso, contador de vidas (5), etiqueta "Palavra nova", enunciado `h1`, opções em `radiogroup`, "Pular", "Verificar" desabilitado até selecionar | `ev_bec06830…08e9` | `07-licao-imagem-selecionada.png` |
| 7 | Atalhos de teclado | Opções numeradas 1/2/3; tecla "2" selecionou a 2ª opção | `ev_bec06830…08e9` (passo L1-key2) | `07` |
| 8 | Feedback de acerto | Rodapé verde, ícone ✓, "Excelente!", ações "Muito fácil / Muito difícil / Reportar", "Continuar"; barra de progresso avança; opção fica verde | `ev_bec06830…08e9` | `08-licao-feedback-acerto.png` |
| 9 | Feedback de erro | Rodapé vermelho, ícone ✕, "Resposta correta: …", opções desabilitadas | `ev_4a59915f…d7d6` | `10-…erro-modal-vidas.png` |
| 10 | Vidas | No 1º erro, modal tutorial "Cada erro tira 1 vida!" com 5 corações; erro real no celular reduziu 5→4 com destaque no contador. Com "Pular" no desktop o contador permaneceu 5 | `ev_4a59915f…`, `ev_cf18d23d…1a74` | `10`, `17` |
| 11 | Variedade de exercícios | Escolher imagem; selecionar significado; "Escreva em português" com banco de palavras; "Complete a conversa"; "Toque no que escutar" (áudio normal e lento, "Não posso ouvir agora", "Usar teclado") | `ev_5b8492ee…a547` | `09`, `11`, `12`, `13` |
| 12 | Dicas contextuais | Palavras sublinhadas com dica ao passar o cursor/dedo; balão "Lembrete" na 1ª ocorrência | idem | `11` |
| 13 | Revisão de erros na lição | Após ~15 questões: mascote "Vamos rever o que você errou!" e reapresentação dos itens errados | `ev_5b8492ee…a547` (passo q16-w) | `14-licao-revisao-de-erros.png` |
| 14 | Trilha (`/learn`) | Cabeçalho da unidade (Seção 1, Unidade 1, título, botão "Guia"); nós por tipo (lição, baú, rádio, prática, revisão da unidade, teste "Pular pra unidade N"); zigue-zague (offsets 0 / ±44,9 / ±70 px); personagem bloqueado ao lado | `ev_4f5f37e4…80c3db` | `15-trilha-learn-desktop.png` |
| 15 | Gamificação lateral | Navegação Aprender/Sons/Ligas/Missões/Loja/Perfil/Mais; ofensiva 0, gemas 500, vidas 5; "Desbloqueie as Ligas (mais 3 lições)"; "Missões do dia: Ganhe 10 XP (0/10)"; convite para criar perfil | idem | `15` |
| 16 | Celular | Sem "Pular" nem números de atalho; grade 2 colunas; botão de ação em largura total; ações do feedback viram ícones | `ev_cf18d23d…1a74` | `16`, `17` |

## 2. Comportamentos e transições
- "Continuar" fica desabilitado por instantes após o clique (evita duplo avanço).
- Fala do mascote animada letra a letra (cada caractere em um elemento).
- Troca de questão com sobreposição breve da questão antiga e da nova (transição deslizante).
- Opções acessíveis: `role="radio"`, `aria-checked`, tabindex "roving" (0 no primeiro, −1 nos demais).
- Conteúdo e ordem das opções variam entre sessões (ex.: "chá" × "café"); o número de questões também variou.
- Sair da primeira lição levou direto a `/learn` (sem confirmação), com modal de proficiência sobreposto.

## 3. Mecânicas que serão adaptadas
| Mecânica Duolingo | Adaptação CNH Quest |
|---|---|
| Etiqueta "Palavra nova" + reconhecimento por imagem | "Placa nova": identificar placa pelo desenho/código |
| Selecionar significado | Placa → significado; situação → conduta |
| Banco de palavras | Montar a regra/frase ("Em cruzamento não sinalizado, a preferência é de quem vem pela ___") |
| Complete a conversa | Diálogo com agente/instrutor; decisão em cena |
| Revisão de erros ao fim da lição | Mantida, com explicação do porquê |
| Vidas | **Opcional** e só no modo prática; nunca bloqueia o estudo de lei (decisão pedagógica) |
| Meta diária em XP/min | Mantida (5/10/15/20 min) |
| Teste de nivelamento / pular unidade | "Já sei isso" — teste de domínio que desbloqueia a unidade |
| Trilha em zigue-zague com tipos de nó | Lição, revisão, desafio de placas, simulado curto, baú |
| Feedback verde/vermelho + "Reportar" | Feedback com ícone e texto (não só cor), explicação, fonte legal e "Reportar erro de conteúdo" |

Não adaptado: áudio "Toque no que escutar" (sem valor para a prova), Ligas competitivas (fora da 1ª versão), Loja/gemas.

## 4. Elementos de implementação própria
Personagens originais, ilustrações de placas (desenhadas a partir do MBST, não do Duolingo), sons, animações, paleta, tipografia e todos os textos. Nada do Duolingo (mascote, ilustrações, Lottie, sons) será copiado.

## 5. Limitações
- Tela de **conclusão de lição** não observada: a revisão de erros reapresenta itens e o conteúdo varia por sessão, impedindo um roteiro reprodutível pulando questões.
- Não observados (exigem conta ou progresso): ofensiva em andamento, Ligas, Missões detalhadas, Loja, perfil, diálogo de saída no meio da lição, sons (captura headless sem áudio).
- Capturas em modo headless; animações vistas só como quadros estáticos.
- Os arquivos `_tmp_*` na raiz do projeto vieram de uma tentativa anterior sem registro de evidência e **não** foram usados.

## 6. Decisões de design resultantes
1. Rodapé fixo de ação com estados: desabilitado → "Verificar" → feedback (acerto/erro) → "Continuar".
2. Opções como grupo de rádio acessível + atalhos numéricos no desktop.
3. Revisão de erros dentro da própria lição antes da conclusão.
4. Trilha vertical em zigue-zague, com nós tipados e teste para pular unidade.
5. Celular: botão de largura total, grade 2 colunas para placas, sem atalhos.
6. Explicação pedagógica obrigatória no feedback (o Duolingo mostra só a resposta certa; nós explicamos o porquê e citamos a fonte).
