// Amostras de voz do 1º cartão, para o dono escolher a voz antes de gerar o resto.
import { join } from 'node:path';
import { fala, RAIZ } from './eleven.mjs';

const TEXTO = [
  'Oi! Vamos começar do zero, sem pressa.',
  'Sinal de trânsito é qualquer coisa que dá um recado a quem dirige ou anda na rua. Por exemplo: pare, vá devagar, cuidado.',
  'A lei de trânsito diz que existem só seis tipos de sinal.',
  'Primeiro, as placas. Elas ficam em pé, em postes. São os sinais verticais.',
  'Segundo, as pinturas no chão, como a faixa de pedestres e as linhas da pista. São os sinais horizontais.',
  'Terceiro, as luzes do semáforo, que muita gente chama de sinaleiro. São os sinais luminosos.',
  'Quarto, o apito do agente de trânsito. É o sinal sonoro. Agente de trânsito é a pessoa autorizada a fiscalizar e organizar o trânsito.',
  'Quinto, os gestos: os movimentos de braço do agente, e também os do próprio motorista.',
  'Sexto, os dispositivos auxiliares. São peças que ajudam a sinalizar, como cones e tachões.',
  'Para guardar: placa, pintura, luz, som, gesto e auxiliar. Só isso é sinal. Em pé é placa. Deitado no chão é pintura.',
].join(' ');

// Escolhida: davi (14/11/2026).
const VOZES = {
  'manoel': 'zoe2cQFqDDW4DteHDEWI',
  'jairo': '362PVGN0qz9gh4Hb4qdA',
  'davi': '2CECaLAGTS5NRGxgbcxr',
};

for (const [nome, id] of Object.entries(VOZES)) {
  const f = await fala(TEXTO, id, join(RAIZ, '_tmp_amostras', `voz_${nome}.mp3`));
  console.log('ok', nome, f);
}
