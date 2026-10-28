# Análise do curso teórico "CNH do Brasil" (SENATRAN/Serpro)

Data da investigação: 25/10/2026.
Curso analisado: <https://eadcnh.bsa.estaleiro.serpro.gov.br/cursos/673a6cc7e3bb091c6db844aa> (curso "Seja um condutor").

Legenda: **Verificado** = visto diretamente em página oficial ou no código público do site · **Imprensa** = informado por reportagem, sem confirmação em fonte oficial · **Inferido** = dedução nossa a partir das evidências · **Pendente** = não foi possível verificar.

> **Atualização (25/10/2026, mais tarde):** as seções 1 a 8.3 descrevem a situação **antes** do login. Depois, o próprio usuário entrou na conta dele e foram vistas, com acesso legítimo, as telas descritas em **8.4 a 8.9**: índice, módulos, introdução do Módulo 1, simulado e resultado. Onde houver conflito, valem as seções 8.4 a 8.9.

## 1. Resumo

- **O conteúdo do curso não pôde ser acessado.** Sem login, o endereço do curso redireciona para o login gov.br (CPF, banco, QR code ou certificado digital, com hCaptcha). Não havia sessão autenticada disponível e não tentamos contornar o login.
- O que se pôde verificar foi a **estrutura da plataforma**, a partir do código JavaScript público que qualquer visitante baixa: introdução → módulos → aulas → quiz por módulo → avaliação → simulado → certificado. As aulas podem ter texto, áudio, vídeo (YouTube), imagem e link.
- Reportagens de dez/2025 informam **4 módulos com 4 etapas cada** e uma seção "Material Complementar e Simulado". Os temas dos módulos coincidem com os 4 módulos do **Banco Nacional de Questões v1.0** que já está na nossa matriz.
- **Nenhum conteúdo didático novo** (texto de aula, imagem, placa, questão) foi obtido. Por isso não há tema novo que possa ser marcado como "oficial" com base no curso. A principal lacuna do CNH Quest em relação ao curso é **organizacional**: falta relacionar cada lição a um dos 4 módulos oficiais. Há também um tema que a matriz não cobre: o **processo de habilitação**.

## 2. Recursos efetivamente acessados

### 2.1 Tentativa pela REA (Tarefa 1)

| Passo | Resultado |
|---|---|
| REA na porta CDP 9222 | Nenhum navegador com depuração aberto; não existia sessão autenticada para examinar. |
| Instância limpa do Edge (headless, perfil temporário vazio, sem login), aberta no endereço do curso | Redirecionada para `https://sso.acesso.gov.br/login?client_id=portal-logado.estaleiro.serpro.gov.br…`, título "gov.br - Acesse sua conta", com iframes do hCaptcha. |
| Link público `…/home?curso=673a6cc7e3bb091c6db844aa` (o que o gov.br divulga) | Também redireciona para o login gov.br (`client_id=cnhdigital.denatran.serpro.gov.br/carteiradigital`). |
| Raiz `https://eadcnh.bsa.estaleiro.serpro.gov.br/` | Redireciona para a página pública <https://www.gov.br/transportes/pt-br/cnh-do-brasil>. |
| Evidências REA | Inspeção passiva da página de login: `ev_43d688e9e2dff33a4c7807e0ec0e2dfa69a7b5c5bc614d16507d15ebff601de9`. Captura de tela: `ev_86a5d23d412603e9606d15ab02f49447dfd15e445a33de44756fae427518769d`, salva em `capturas-cnh-do-brasil/01-redirecionamento-login-govbr.png` (sha256 `4f1fd80d…5f42`). |
| Encerramento | Navegador temporário fechado e perfil apagado. Nenhuma senha, cookie ou token foi pedido, lido ou guardado. |

**Limitação exata:** todo o conteúdo do curso (aulas, materiais complementares, quizzes, avaliação, simulado) exige autenticação gov.br. A REA só consegue examinar o curso se o próprio usuário abrir o curso logado num navegador com depuração (`--remote-debugging-port`). Nesse caso a REA pode inspecionar passivamente as telas que o usuário tem direito de ver.

### 2.2 Código público do site (sem autenticação)

O HTML inicial (sha256 `196bb13e…8664`) é o esqueleto de um app Angular. O pacote principal `main-LTXRRBCK.js` (1.687.901 bytes, sha256 `0bf4e5ed…4d61`) é público e foi lido apenas por busca de texto. Nenhuma API foi chamada. Uma tentativa de verificar se a API responde sem login foi barrada pelas regras de permissão desta sessão e não foi repetida.

O que o código mostra (**Verificado**, estrutura da plataforma, não o conteúdo):

- Telas: lista de cursos, requisitos do curso, introdução, mapa do curso, módulo (com imagem e ícone), aula, quiz, avaliação, simulado e certificado (o certificado é gerado em PDF).
- Cada módulo tem uma lista de **aulas** e, opcionalmente, um **quiz**. As etapas de um módulo são contadas como `aulas + quiz`. O módulo só fica "concluído" quando todas as aulas e o quiz estão feitos. A plataforma indica a próxima aula ou o próximo quiz pendente.
- O conteúdo de uma aula é uma lista de blocos dos tipos **texto, áudio, vídeo (YouTube incorporado), imagem e link**. Os títulos aparecem como "Módulo N".
- O curso pode **exigir avaliação** (`exigeAvaliacao`). Ela é liberada com 100% das etapas concluídas. O **simulado** é separado e tem questões próprias.
- O progresso fica salvo no servidor. Existe um mecanismo de **reinício do curso** a partir de uma data.

### 2.3 Páginas oficiais públicas

| Fonte | O que traz | Situação |
|---|---|---|
| <https://www.gov.br/transportes/pt-br/cnh-do-brasil> | Atalhos "Seja um condutor" e "Seja um instrutor", links do app e requisitos para ser condutor: ter CPF, 18 anos completos, saber ler e escrever e ter documento de identificação. | Verificado |
| <https://www.gov.br/transportes/pt-br/conteudos-cnh-do-brasil/saiba-mais-sobre-o-programa> (publ. 05/12/2025, mod. 13/07/2026) | Curso teórico digital e gratuito pelo app; o candidato pode usar a plataforma, uma autoescola ou as duas; exames teórico e prático continuam obrigatórios; as 20 h-aula práticas mínimas deixaram de ser obrigatórias. Não traz módulos nem carga horária do curso teórico. | Verificado |
| Notícias do gov.br/transportes e da Secom sobre o lançamento | Retornaram **"Conteúdo Restrito"** / HTTP 401 em 25/10/2026. | Pendente (pode ser restrição temporária; não verificado) |
| Catálogo da Biblioteca do DETRAN/RS, "Banco nacional de questões: versão 1.0" (SENATRAN, 2025, 313 p.) | Segundo o resultado de busca, o registro descreve a obra como "apostila com Banco Nacional de Questões disponibilizada no Programa CNH do Brasil". A página não abriu (erro de certificado TLS). | Pendente |

### 2.4 Imprensa (não oficial)

| Fonte | Informação |
|---|---|
| [Exame, 10/12/2025](https://exame.com/brasil/cnh-sem-autoescola-saiba-como-acessar-o-curso-teorico-gratuito/) | Login gov.br e vídeo de introdução. Quatro partes: "Sinalização: placas, cores e caminhos…"; "Escolhas e consequências: atitudes e comportamentos seguros…"; "Segurança: princípios de direção defensiva"; "Cuidado: cuidado da vida e do meio ambiente". Quatro aulas por módulo: a 1ª introduz, a 2ª e a 3ª aprofundam e a **4ª é um teste**. Seção "Material Complementar e Simulado" com apostilas, PDFs das aulas e simulado. Certificado automático. Mínimo de 2 h-aula práticas depois do curso. |
| [Campo Grande News, 10/12/2025](https://www.campograndenews.com.br/brasil/cidades/candidato-conclui-curso-teorico-da-cnh-em-1-dia-pelo-novo-aplicativo-incrivel) | Quatro módulos com quatro etapas cada. Vídeos, podcasts, materiais complementares e simulados. Certificado registrado no SNT. Progresso salvo. Sem carga horária mínima (candidato concluiu em 1 dia). |
| [ND Mais](https://ndmais.com.br/politica/aplicativo-cnh-do-brasil-ja-tem-7-mil-pessoas-fazendo-curso-teorico-veja-como-acessar/), [Midiamax](https://midiamax.com.br/cotidiano/2026/curso-teorico-gratuito-oferecido-cnh-brasil-ja-beneficiou-39-mil-sul-mato-grossenses/), [CNN Brasil](https://www.cnnbrasil.com.br/auto/aplicativo-da-cnh-do-brasil-passo-a-passo-para-tirar-primeira-habilitacao/) | Confirmam o acesso pelo app (seção Educação) e a gratuidade. |
| Sites de terceiros (autoescolawaze.com.br, ninjafsa.com.br, cfcdigital.online) | Usam os nomes "Placas, Cores e Caminhos", "Escolhas e Consequências", "Na Direção da Segurança" e "Cuidar, Agir e Preservar". **Não são fontes oficiais.** O ninjafsa atribui as contagens 412/205/623 a módulos diferentes dos do Banco Nacional v1.0 lido por nós (412 = Mód. 1 Placas), ou seja, contém erro. Não usar. |

## 3. Estrutura do curso identificada

```
Curso "Seja um condutor"
├─ Requisitos (CPF, 18 anos, ler e escrever, documento)        [Verificado: gov.br]
├─ Introdução (vídeo)                                          [Verificado: tela existe · Imprensa: vídeo]
├─ Módulo 1 — Sinalização / placas, cores e caminhos           [Imprensa + Inferido]
│   ├─ Aula 1 introdução · Aulas 2–3 aprofundamento            [Imprensa]
│   └─ Quiz do módulo (a "4ª aula/etapa")                      [Verificado: quiz existe · Inferido: é a 4ª etapa]
├─ Módulo 2 — Escolhas e consequências                         [Imprensa]
├─ Módulo 3 — Segurança / direção defensiva                    [Imprensa]
├─ Módulo 4 — Cuidado da vida e do meio ambiente               [Imprensa]
├─ Material complementar (apostila/PDF) e simulado             [Imprensa · simulado Verificado no código]
├─ Avaliação final (quando o curso exige)                      [Verificado no código; não sabemos se este curso exige]
└─ Certificado automático, registrado no SNT                   [Imprensa · geração de PDF Verificada no código]
```

"Quatro etapas por módulo" (imprensa) bate com o código, que conta as etapas como aulas + quiz. Daí a inferência de **3 aulas + 1 quiz** por módulo. Os títulos exatos dos módulos e das aulas continuam **Pendentes**.

## 4. Assuntos encontrados

- **Conteúdo programático:** legislação de trânsito, direção defensiva, primeiros socorros e meio ambiente (imprensa). Coincide com os 4 eixos da Portaria SENATRAN 923/2025, já lidos e registrados na matriz.
- **Temas dos módulos:** sinalização; escolhas e consequências (comportamento, infrações e penalidades); direção defensiva; cuidado com a vida e o meio ambiente. A correspondência com os módulos do Banco Nacional v1.0 é **Inferida** por semelhança de tema.
- **Processo de habilitação** (requisitos, etapas, certificado, aulas práticas, PPD): aparece no gov.br e na imprensa, mas **não está na matriz do CNH Quest**.
- **Imagens, placas, ilustrações, exercícios e referências do curso:** **Pendente.** Nenhuma tela de aula foi acessada.

## 5. Diferenças em relação ao CNH Quest

| Aspecto | Curso CNH do Brasil | CNH Quest hoje | Ação |
|---|---|---|---|
| Organização | 4 módulos temáticos (sinalização, escolhas e consequências, segurança, cuidado) | 8 mundos próprios (`plano-tecnico.md`) sem ligação explícita aos 4 módulos | Marcar em cada mundo/lição o módulo oficial correspondente, sem mudar a trilha |
| Ritmo | 3 aulas + quiz por módulo | Lições curtas com revisão de erros e revisão de mundo | Manter. A revisão de mundo já cumpre o papel do quiz |
| Formatos | Texto, áudio (podcast), vídeo, imagem, link, PDF | Exercícios interativos com feedback e fonte. Sem áudio nem leitura longa | Opcional no futuro: cartões curtos de "leitura" antes das lições. Sem vídeos ou áudios copiados |
| Avaliação | Quiz por módulo, avaliação final e simulado | Revisão de mundo e simulado (30/20/60) | Equivalente. Falta só o banco chegar a 30+ questões |
| Processo de habilitação | Requisitos e etapas aparecem no programa | Ausente | Assunto verificado na matriz (seção 3d, 25/10/2026). Lição ainda não escrita |
| Material complementar | Apostila/PDF; provavelmente o Banco Nacional v1.0 | Banco v1.0 usado só como referência de estilo | Manter. Questões do app continuam originais e citando o CTB/MBST |
| Certificado | Oficial, registrado no SNT | Não existe e não deve existir (o app não é curso credenciado) | Deixar claro na interface que o app é complementar e não substitui o curso oficial |

## 6. Informações que ainda precisam ser verificadas

1. Títulos exatos dos 4 módulos e das aulas (exige acesso logado pelo próprio usuário).
2. Se o curso "Seja um condutor" exige avaliação final, e com que nota mínima.
3. Formato e número de questões do quiz de módulo e do simulado do curso.
4. Se o material complementar é o Banco Nacional de Questões v1.0, ou outra apostila, e em que condições de uso.
5. Imagens de placas usadas no curso: conferem com o MBST?
6. ~~Mínimo de aulas práticas e prazo da PPD~~: **resolvido em 25/10/2026**. A Res. 1.020/2025 exige mínimo de 2 horas de aulas práticas (art. 38) e a PPD vale 1 ano (CTB art. 148 §2º). Detalhes na seção 3d da matriz.
7. Por que as notícias oficiais aparecem como "Conteúdo Restrito" e se voltam a ficar públicas.
8. URL oficial do Banco Nacional de Questões (pendência antiga, continua aberta).

## 7. Recomendações

1. **Não mudar a trilha nem a arquitetura.** Os 8 mundos cobrem os 4 eixos. Basta acrescentar, nos dados de conteúdo, um campo como `officialModule: 1 | 2 | 3 | 4` por lição. Ele permitiria (a) mostrar o progresso por módulo oficial e (b) distribuir o simulado pelos 4 módulos. Isso é alteração de dados e de tela, a fazer só depois da aprovação deste relatório.
2. **Simulado:** como a distribuição oficial das 30 questões continua desconhecida, manter o rodízio entre módulos. Se for usado o peso do Banco v1.0 (412/205/623/260), isso deve aparecer na tela como **escolha do app**, não como regra oficial.
3. **Novo assunto "Processo de habilitação"** no Mundo 1 ou 8, só com fatos verificados: requisitos (página gov.br), regras do exame (Res. 1.020/2025, já verificadas) e demais etapas depois da leitura da norma.
4. **Aviso na interface** (texto curto): "O CNH Quest é um app de estudo independente. O curso teórico oficial e gratuito está no app CNH do Brasil."
5. **Para continuar a investigação legitimamente:** o usuário abre o curso, logado, num navegador iniciado com `--remote-debugging-port=9222`. A REA então inspeciona apenas as telas visíveis, sem guardar cookies ou tokens, e registramos estrutura e temas (não cópia de textos, vídeos ou imagens).
6. **Direitos autorais:** usar o curso só como referência de temas e sequência. Textos, áudios, vídeos e ilustrações do curso não devem ser copiados. As placas do app continuam desenhadas a partir das especificações do MBST.

## 8. Continuação em 25/10/2026

### 8.1 Telas do curso efetivamente acessadas

*(Situação no começo da continuação. Superada pelas seções 8.4 a 8.9.)*

Nenhuma tela nova. A única tela vista continua sendo o **redirecionamento para o login gov.br** (seção 2.1). Nesta etapa não houve sessão autenticada, nenhuma aula, quiz, material complementar, avaliação ou simulado do curso foi aberto, e **nenhum conteúdo interno foi inspecionado**. Tudo o que está na seção 3 continua com a mesma classificação (Verificado no código público / Imprensa / Inferido / Pendente).

O que mudou nesta etapa vem de fontes oficiais, não do curso:
- Processo de habilitação: lido no CTB (arts. 140, 141, 147, 148) e na Res. CONTRAN 1.020/2025 (arts. 12, 17, 20, 21, 31–38, 48–51). Ver a seção 3d da matriz.
- Nomes e origem dos 4 módulos de referência e ligação mundo → módulo → lição (marcada como organização própria do app). Ver as seções 3b e 3c da matriz.

### 8.2 O que a REA consegue fazer numa sessão autenticada (capacidades conferidas nos esquemas das ferramentas)

| Ferramenta REA | Faz | Não faz / limites |
|---|---|---|
| `list_browser_targets` | Lista as abas de um navegador com depuração num endereço local (`http://127.0.0.1:PORTA`) | Não abre navegador nem faz login |
| `inspect_web_page` | Lê passivamente a aba escolhida: URL, título, estrutura e texto de acessibilidade | Não executa script, não navega, não clica |
| `capture_web_screenshot` | Captura só a parte visível da aba | Não rola a página |
| `observe_web_session` | Registra, por um tempo definido, a navegação feita **pelo usuário** | Não age na página |
| `capture_browser_scenario` (modo `connect`) | Executa ações declaradas (ir, clicar, preencher, aguardar) numa aba existente | Também oferece captura de armazenamento e de rede. **Não será usado com essas opções.** |

Limites que vamos respeitar:
- **Não** pedir captura de armazenamento (cookies, localStorage).
- **Não** pedir corpo de requisições, de respostas ou valores de cabeçalhos.
- **Não** exportar scripts.
- **Não** chamar a API do curso diretamente.
- Ler só as telas que a sessão do usuário já mostra, e registrar só **estrutura e temas**: títulos de módulos e aulas, tipos de bloco, existência de quiz. Nada de texto corrido, imagens, vídeos ou áudios.

A REA **não faz login** e não deve receber senha. Se o navegador não estiver aberto com depuração, ela não tem como ver o curso. Não existe outra forma legítima de acesso.

### 8.3 Passo a passo para o usuário (depende de você)

1. Feche só as janelas do Edge que você abrir para este fim. O perfil habitual não é usado nem alterado.
2. No PowerShell, abra um Edge separado, com perfil próprio e depuração acessível apenas pela própria máquina:

   ```powershell
   & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
     --remote-debugging-address=127.0.0.1 --remote-debugging-port=9222 `
     --user-data-dir="$env:LOCALAPPDATA\cnhquest-rea-profile" `
     --no-first-run "https://eadcnh.bsa.estaleiro.serpro.gov.br/cursos/673a6cc7e3bb091c6db844aa"
   ```

3. Nessa janela, faça você mesmo o login gov.br e abra o curso. Não informe a senha a ninguém, nem a mim.
4. Deixe aberta a tela que quer que seja examinada (por exemplo, o mapa do curso ou a lista de aulas de um módulo) e avise.
5. Eu uso `list_browser_targets` com `http://127.0.0.1:9222` para achar a aba. Depois uso `inspect_web_page` (texto de acessibilidade, sem chaves de armazenamento e sem fontes de script) e, se útil, `capture_web_screenshot`. Para acompanhar você navegando entre telas, uso `observe_web_session`.
6. Ao terminar, **feche essa janela do Edge**. Enquanto ela está aberta, qualquer programa da sua máquina pode controlar esse perfil pela porta 9222. Se quiser, apague depois a pasta `%LOCALAPPDATA%\cnhquest-rea-profile` (ela só tem a sessão criada para este fim).

Para conferir se a porta só está acessível localmente: `netstat -ano | findstr 9222` deve mostrar `127.0.0.1:9222`, não `0.0.0.0:9222`.

Se a página do curso bloquear o navegador com depuração ou o login falhar, **não tentaremos contornar**. Nesse caso, a alternativa é você mesmo anotar os títulos dos módulos e das aulas (só os títulos), ou tirar capturas de tela das telas de índice e salvá-las em `docs/capturas-cnh-do-brasil/`. Registramos apenas a estrutura.

### 8.4 Primeira tela interna: índice do curso (25/10/2026, 22:24 UTC)

O usuário abriu o Edge com perfil separado e fez o login ele mesmo. A porta foi conferida antes: `netstat` mostrou `127.0.0.1:9222`. Nessa sessão, a REA leu **uma única tela**, sem clicar, navegar ou executar script:
- `list_browser_targets`: 1 aba, "CNH do Brasil", em `/cursos/673a6cc7e3bb091c6db844aa`.
- `capture_web_screenshot`: só a parte visível da tela.
- `inspect_web_page`: com texto de acessibilidade, sem armazenamento, scripts, console ou corpos de rede.

Evidências REA: `ev_1f0ec793…` (lista de abas). O print e a leitura de estrutura ficaram só localmente. **O print não foi salvo no repositório porque mostra o nome do usuário.**

Estrutura vista (só títulos):

| Bloco | Título na tela | Indicação |
|---|---|---|
| Cabeçalho | Formação de Condutores | saudação ao usuário (nome não registrado) |
| Módulo 1 | Placas, cores e caminhos | 0/4 etapas |
| Módulo 2 | Escolhas e consequências | 0/4 etapas |
| Módulo 3 | Na direção da segurança | 0/4 etapas |
| Módulo 4 | Cuidar, agir e preservar | 0/4 etapas |
| — | Certificado | "Acesse aqui seu certificado" |
| — | Material Complementar e Simulado | "Acesse aqui recursos extras e simulado" |

O que isto confirma:
- Os 4 títulos dos módulos (antes só no Banco v1.0 e na imprensa).
- O curso tem **4 etapas por módulo**.
- **Material complementar e simulado** ficam num bloco próprio, separado dos módulos.

O que continua **A investigar**:
- Os títulos e os tipos das 4 etapas de cada módulo. Os módulos estão recolhidos, e a REA, em modo passivo, não os expande.
- O formato do quiz, da avaliação e do simulado.
- O conteúdo do material complementar.

Próximo passo, que depende do usuário: expandir um módulo, ou a seção "Material Complementar e Simulado", e avisar. Então repetimos só a leitura passiva.

### 8.5 Índice com os módulos expandidos (25/10/2026)

O próprio usuário clicou para expandir todos os blocos. A REA repetiu a leitura passiva da mesma aba: texto de acessibilidade e captura da parte visível. Não houve clique, navegação, armazenamento nem rede.

Etapas de cada módulo (só títulos):

| Módulo | Etapa 1 | Etapa 2 | Etapa 3 | Etapa 4 |
|---|---|---|---|---|
| 1 Placas, cores e caminhos | Introdução | Sinalização Vertical (Placas) | Demais sinalizações | Teste seus conhecimentos! |
| 2 Escolhas e consequências | Introdução | Infrações e penalidades | Infrações mais comuns | Teste seus conhecimentos! |
| 3 Na direção da segurança | Introdução | Normas Gerais de Circulação | Direção Defensiva e segura | Teste seus conhecimentos! |
| 4 Cuidar, agir e preservar | Introdução | Cuidados e Primeiros Socorros | Cuidados com o meio ambiente | Teste seus conhecimentos! |

O bloco "Material Complementar e Simulado" tem dois botões: "Ver materiais complementares" e "Fazer um simulado".

O que fica **Confirmado na tela do curso**:
- Cada módulo tem **4 etapas: introdução, 2 aulas temáticas e "Teste seus conhecimentos!"**. Isso bate com a inferência anterior, feita a partir do código público, de "3 aulas + 1 quiz".
- Etapas **bloqueadas em sequência**. No estado inicial, só a Introdução do Módulo 1 aparece sem o ícone 🚫.
- Os assuntos das aulas coincidem com o mapeamento do app (`MODULE_TO_REFERENCE`): sinalização no módulo 1, infrações no 2, **normas de circulação e direção defensiva no 3**, primeiros socorros e meio ambiente no 4. A colocação de circulação no módulo 3, antes só inferida, agora tem respaldo **nos títulos** das aulas.
- **Não há aula intitulada "processo de habilitação"**. No app, esse tema continua como conteúdo próprio, com base no CTB e na Res. 1.020.

O que continua **A investigar**:
- O conteúdo das aulas.
- O formato do "Teste seus conhecimentos!" e do simulado: número de questões, tempo, correção.
- A lista do material complementar.

Para ver qualquer um deles, o usuário teria de abrir a etapa. As etapas bloqueadas só abrem com progresso legítimo no curso, e não tentaremos contornar isso.

### 8.6 Etapa aberta: Módulo 1 › Introdução (25/10/2026)

O usuário abriu a etapa. A REA fez leitura passiva e capturou a parte visível da página, sem clicar, sem reproduzir o vídeo e sem armazenamento ou rede.
- Endereço da aula: `/cursos/673a6cc7e3bb091c6db844aa/aula/692f5ab537dabe0705d3f9b3`.
- Evidência da lista de abas: `ev_8191f34e…`.

Estrutura da página (Confirmado na tela do curso):

| Bloco | O que é |
|---|---|
| Cabeçalho | "Aula: Introdução", com o subtítulo do módulo |
| 🎬 Vídeo da Aula | Vídeo incorporado do YouTube, do canal do Ministério dos Transportes, intitulado "CNH do Brasil - Placas, cores e caminhos". Apresentador e **intérprete de Libras** aparecem na imagem de capa. O vídeo não foi reproduzido. |
| 📖 Material de Leitura | Texto curto: um título com o nome do módulo e 2 parágrafos, com termos-chave em negrito |
| Ações | "Voltar aos Módulos" e **"Concluir"** |

A conclusão é manual: o aluno marca a etapa como concluída. Não clicamos em "Concluir", porque isso alteraria o progresso do usuário.

Tema da introdução, em paráfrase e sem cópia: a sinalização como linguagem comum entre todos no trânsito, formada por símbolos, cores e formas.

Consequências para o app:
- O tema bate com a lição w1-l1 ("Quem manda no trânsito?") e com o cartão de conceito que abre o Mundo 1. Isso confirma que o recorte da lição é adequado.
- O formato do curso é **vídeo + leitura**, com conclusão manual. O CNH Quest é complementar: oferece prática ativa, com questões, explicação e fonte, que o curso deixa para o "Teste seus conhecimentos!".
- Vale considerar acessibilidade em Libras ou vídeo no futuro. Por ora, não há mudança no código.

Continua **A investigar**: o conteúdo do vídeo, as aulas seguintes (bloqueadas), o formato do "Teste seus conhecimentos!", o simulado e o material complementar.

### 8.7 Página inicial do Simulado (25/10/2026)

O usuário abriu a página `/cursos/673a6cc7e3bb091c6db844aa/simulado` a partir do índice. A REA fez leitura passiva e capturou a parte visível. **O simulado não foi iniciado**: ninguém clicou em "Iniciar Simulado" e nenhuma questão foi vista. Evidência da lista de abas: `ev_44d48f7d…`.

Confirmado na tela do curso, em paráfrase:
- **30 questões** sobre todos os temas do curso. As categorias citadas são Sinalização, Legislação, Direção Defensiva, Segurança, Primeiros Socorros e Meio Ambiente.
- Pode ser feito **quantas vezes o aluno quiser**.
- **Resultado detalhado por categoria** ao final.
- A página lembra que o exame teórico do DETRAN exige **20 acertos em 30**. Isso bate com a Res. 1.020, art. 33.
- O simulado está **liberado sem concluir os módulos**: o acesso é direto pelo bloco "Material Complementar e Simulado".
- A página inicial **não informa tempo limite**.

Comparação com o simulado do CNH Quest:
- Igual: 30 questões e aprovação com 20.
- O app usa cronômetro de 60 minutos, o tempo mínimo da prova (Res. 1.020, art. 32). Se o simulado oficial tem cronômetro continua **A investigar**.
- O app ainda **não mostra o resultado por categoria**. É uma melhoria candidata: resultado por módulo de referência (1–4) ao final do simulado.

Continua **A investigar**:
- O formato das questões do simulado oficial (alternativas, imagens, correção imediata ou ao final).
- Se há cronômetro.
- Se as questões vêm do Banco Nacional.

Para ver isso, o usuário precisaria iniciar o simulado. O resultado ficaria no histórico dele.

### 8.8 Simulado iniciado: tela da questão (25/10/2026)

O usuário clicou em "Iniciar Simulado". A REA fez leitura passiva e capturou a parte visível da **questão 1**. Não marcou nenhuma alternativa e não navegou. O enunciado e as alternativas **não foram copiados** para o projeto.

Estrutura da tela (Confirmado na tela do curso):

| Elemento | Observado |
|---|---|
| Etiqueta do módulo | Cada questão traz o título do módulo de origem. Na questão 1, "Na direção da segurança" (Mód. 3). |
| Progresso | Barra e "Questão 1 de 30". |
| Questão | Enunciado só em texto, sem imagem nesta questão. **4 alternativas** em botões de opção (radio). Uma delas é do tipo "Todas as alternativas estão corretas". |
| Navegação | Botões "Anterior" e "Próxima", mais uma grade de **navegação rápida de 1 a 30**: dá para ir e voltar livremente entre as questões. |
| Cronômetro | **Nenhum visível** na tela. |
| Correção | Não há botão de confirmar por questão. Isso sugere correção ao final, ainda **não confirmada**. |

Consequências para o CNH Quest:
- O formato de 4 alternativas e 1 correta bate com o simulado do app e com a Res. 1.020, art. 31.
- O curso identifica o módulo de cada questão e dá o resultado por categoria. Isso reforça o próximo passo do plano: **resultado por módulo de referência** no simulado do app.
- A navegação livre (pular e voltar) é diferente do fluxo atual do simulado do app. Avaliar depois, se houver pedido.
- Ao escrever questões, não usar "todas as alternativas estão corretas". O formato do app exige que cada alternativa errada tenha explicação própria, e essa opção dificulta isso.

Continua **A investigar**:
- A tela de resultado: o formato do "resultado por categoria" e se mostra as respostas certas.
- Se há tempo limite oculto.
- A proporção de questões por módulo.

### 8.9 Simulado concluído: tela de resultado (25/10/2026)

O usuário pediu que o assistente fizesse o simulado. A REA usou `capture_browser_scenario` em modo `connect`, sem captura de armazenamento, rede ou cabeçalhos, para:
- clicar em "Iniciar Simulado";
- marcar a 1ª alternativa de cada questão;
- avançar até a questão 30.

Evidência do teste com 2 questões: `ev_eabae2b9…`. Na questão 29, um clique em "Próxima" não respondeu dentro do prazo, mas a aba já estava na questão 30. O usuário marcou a última resposta e clicou em "Finalizar". **O resultado não mede conhecimento**: as respostas não foram escolhidas pelo conteúdo e algumas podem ter ficado em branco. Os enunciados não foram registrados no projeto.

Tela de resultado (Confirmado na tela do curso):

| Elemento | Observado |
|---|---|
| Título | Mensagem de incentivo, que varia com o desempenho (aqui, "Continue estudando!") |
| Total | Percentual e "N de 30 questões corretas" |
| Desempenho por Categoria | **Uma linha por módulo do curso**, com "acertos de total" e percentual. As categorias são os 4 títulos de módulo, não os 6 temas citados na página inicial. |
| Ações | "Estudar Material Complementar" e "Tentar Novamente" |
| Dicas para melhorar | Revisar os módulos com mais erros, refazer à vontade (mesmo depois de aprovado), estudar o material complementar e praticar |
| Revisão questão a questão | **Não aparece** na tela de resultado. Até onde se viu, o curso não mostra o gabarito nem explica os erros. |

**Distribuição das 30 questões nesta tentativa**:
- Mód. 3: 12
- Mód. 2: 9
- Mód. 1: 6
- Mód. 4: 3

É **uma única amostra**. A ordem das questões mudou entre duas tentativas, então a distribuição pode ser sorteada. A proporção oficial continua **A investigar**.

Consequências para o CNH Quest:
1. **Resultado por módulo de referência no simulado**: o curso faz exatamente isso, com os mesmos 4 módulos. É o próximo passo de implementação.
2. **Diferencial do app**: revisão questão a questão, com explicação e fonte, que o simulado oficial não oferece. O app já faz isso.
3. Na geração do simulado do app, considerar no futuro uma distribuição por módulo, quando houver questões suficientes nos mundos 2–8.
