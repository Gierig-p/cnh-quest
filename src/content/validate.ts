import type { Question, World } from './types';
import { SOURCES } from './sources';
import { referenceModulesOf } from './referenceModules';

export interface ValidationIssue {
  where: string;
  message: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Regras de integridade do conteúdo. Retorna a lista de problemas (vazia = ok). */
export function validateContent(questions: Question[], worlds: World[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (where: string, message: string) => issues.push({ where, message });
  const ids = new Set<string>();

  for (const q of questions) {
    if (ids.has(q.id)) add(q.id, 'identificador duplicado');
    ids.add(q.id);
    if (!q.prompt.trim()) add(q.id, 'enunciado vazio');
    if (!q.explanation.trim()) add(q.id, 'explicação vazia');
    if (!q.mnemonic.trim()) add(q.id, 'frase de memorização vazia');
    if (!DATE.test(q.verifiedAt)) add(q.id, 'data de verificação inválida');
    if (q.sources.length === 0) add(q.id, 'sem fonte');
    for (const s of q.sources) {
      if (!SOURCES[s.sourceId]) add(q.id, `fonte desconhecida: ${s.sourceId}`);
      if (!s.locator.trim()) add(q.id, 'fonte sem dispositivo (artigo/código)');
    }

    switch (q.type) {
      case 'choice': {
        const optIds = q.options.map((o) => o.id);
        if (new Set(optIds).size !== optIds.length) add(q.id, 'alternativas com id repetido');
        const texts = q.options.map((o) => o.text.trim().toLowerCase());
        if (new Set(texts).size !== texts.length) add(q.id, 'alternativas com texto repetido');
        if (q.options.length < 2) add(q.id, 'menos de 2 alternativas');
        if (q.options.filter((o) => o.id === q.correct).length !== 1) add(q.id, 'resposta correta ausente ou ambígua');
        for (const o of q.options) {
          if (o.id !== q.correct && !o.whyWrong?.trim()) add(q.id, `alternativa ${o.id} sem explicação do erro`);
          if (o.id === q.correct && o.whyWrong) add(q.id, 'alternativa correta com explicação de erro');
        }
        if (q.examEligible && q.options.length !== 4) add(q.id, 'questão de simulado precisa de 4 alternativas');
        break;
      }
      case 'truefalse':
        if (!q.whyWrong.trim()) add(q.id, 'sem explicação do erro');
        if (q.examEligible) add(q.id, 'verdadeiro/falso não segue o formato oficial do exame');
        break;
      case 'fill':
        if ((q.sentence.match(/___/g) ?? []).length !== 1) add(q.id, 'a frase precisa de exatamente uma lacuna ___');
        if (!q.bank.includes(q.answer)) add(q.id, 'resposta fora do banco de palavras');
        if (new Set(q.bank).size !== q.bank.length) add(q.id, 'banco de palavras repetido');
        for (const w of q.bank) if (w !== q.answer && !q.whyWrong[w]) add(q.id, `palavra "${w}" sem explicação do erro`);
        break;
      case 'order': {
        const itemIds = q.items.map((i) => i.id).sort().join();
        if ([...q.answer].sort().join() !== itemIds) add(q.id, 'ordem correta não corresponde aos itens');
        if (q.items.map((i) => i.id).join() === q.answer.join()) add(q.id, 'itens já aparecem na ordem correta');
        break;
      }
      case 'match': {
        if (q.pairs.length < 2) add(q.id, 'menos de 2 pares');
        const rights = q.pairs.map((p) => p.right);
        if (new Set(rights).size !== rights.length) add(q.id, 'pares com lado direito repetido');
        break;
      }
    }
    if (q.examEligible && q.review !== 'verificado') add(q.id, 'questão de simulado sem verificação concluída');
  }

  for (const w of worlds) {
    const lessonIds = new Set<string>();
    for (const l of w.lessons) {
      if (lessonIds.has(l.id)) add(l.id, 'lição duplicada');
      lessonIds.add(l.id);
      if (!l.steps.some((s) => s.kind === 'question')) add(l.id, 'lição sem questões');
      const lessonQs = l.steps.flatMap((s) => (s.kind === 'question' ? questions.filter((q) => q.id === s.questionId) : []));
      if (![1, 2, 3, 4].includes(l.referenceModule)) add(l.id, 'módulo de referência inválido');
      else if (lessonQs.length && !referenceModulesOf(lessonQs).includes(l.referenceModule))
        add(l.id, 'módulo de referência não corresponde ao assunto de nenhuma questão da lição');
      for (const s of l.steps) {
        if (s.kind === 'question' && !ids.has(s.questionId)) add(l.id, `questão inexistente: ${s.questionId}`);
        if (s.kind === 'concept' && s.card.sources.some((r) => !SOURCES[r.sourceId]))
          add(l.id, `conceito ${s.card.id} com fonte desconhecida`);
      }
    }
  }
  return issues;
}

/** Questões afetadas por uma fonte — para quando uma norma mudar. */
export function questionsBySource(questions: Question[], sourceId: string, locatorIncludes?: string) {
  return questions.filter((q) =>
    q.sources.some((s) => s.sourceId === sourceId && (!locatorIncludes || s.locator.includes(locatorIncludes))),
  );
}
