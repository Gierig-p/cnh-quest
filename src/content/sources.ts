/** Registro das fontes oficiais. Se uma norma mudar, procure pelo id aqui para achar as questões afetadas. */

export interface Source {
  id: string;
  title: string;
  url: string;
  publishedAt?: string;
  checkedAt: string;
  sha256?: string;
}

export const SOURCES: Record<string, Source> = {
  ctb: {
    id: 'ctb',
    title: 'Código de Trânsito Brasileiro — Lei nº 9.503/1997 (texto compilado)',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',
    checkedAt: '2026-10-19',
  },
  res1020: {
    id: 'res1020',
    title: 'Resolução CONTRAN nº 1.020/2025 — habilitação e exames',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao10202025.pdf',
    publishedAt: '2025-12-09',
    checkedAt: '2026-10-19',
    sha256: 'b2bf0e60ba7e04b15adbc0199ad44cda4c089fec37bfbcf24f8874e61d7c65c0',
  },
  port923: {
    id: 'port923',
    title: 'Portaria SENATRAN nº 923/2025 — conteúdos didático-pedagógicos',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2025/Portaria9232025.pdf',
    publishedAt: '2025-12-11',
    checkedAt: '2026-10-19',
    sha256: '1969eacb74fa6ba1b3bd56a57cd936bb8757be9dc29fb35f60b461b6d87a458a',
  },
  res973: {
    id: 'res973',
    title: 'Resolução CONTRAN nº 973/2022 — Regulamento de Sinalização Viária (MBST)',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9732022.pdf',
    publishedAt: '2022-07-25',
    checkedAt: '2026-10-19',
  },
  mbst1: {
    id: 'mbst1',
    title: 'MBST Volume I — Sinalização Vertical de Regulamentação',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito',
    checkedAt: '2026-10-19',
    sha256: '5036743cc7fcde740852d140c53f75093cb53429c9926ebf7a837a4144cd604f',
  },
  mbst2: {
    id: 'mbst2',
    title: 'MBST Volume II — Sinalização Vertical de Advertência',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito',
    checkedAt: '2026-10-19',
    sha256: 'dc1608a7e1a2764ab04387f61e44542cdfc2014e3ed048af6b425d81a9e7a88d',
  },
  detranpe: {
    id: 'detranpe',
    title: 'DETRAN-PE — Prova Teórica/Reteste',
    url: 'https://www.detran.pe.gov.br/prova-teorica-reteste',
    checkedAt: '2026-10-19',
  },
};
