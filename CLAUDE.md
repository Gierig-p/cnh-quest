# CNH Quest — instruções para o Claude

**Antes de qualquer trabalho, leia `docs/ESTADO-DO-PROJETO.md`.** Ele resume o projeto, a arquitetura, as regras combinadas com o usuário, o que já foi feito e os próximos passos. Atualize as seções "Diário" e "Próximos passos" desse arquivo ao terminar cada etapa.

Resumo rápido:
- App web estilo Duolingo (identidade própria, mascote Lumi) para a prova teórica do DETRAN (1ª habilitação A/B). React 18 + TS + Vite + Vitest.
- No ar em https://gierig-p.github.io/cnh-quest/. Cada `git push` na `main` roda os testes e republica (`.github/workflows/pages.yml`).
- Fale com o usuário em **português do Brasil**, de forma simples.
- **Não altere** conteúdo pedagógico, respostas, regras de progressão/revisão/simulado ou o modelo de dados sem pedido explícito. Toda informação legal precisa de fonte oficial verificada.
- Não copie material do Duolingo nem do curso oficial. Investigações com REA: só conteúdo público ou sessão autenticada pelo próprio usuário; nunca contornar login.
- Rode `npm test` antes de qualquer commit. Faça commit/push só quando o usuário pedir.
