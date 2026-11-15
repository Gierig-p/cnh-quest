import type { Visual as V } from '../content/types';
import { SignArt } from './SignArt';
import { SceneArt } from './SceneArt';
import { AnimScene } from './AnimScene';
import { Cena3D, temCena3D } from './Cena3D';

/** `checked`: só a imagem do enunciado recebe; as cenas que reagem animam depois de verificar */
export function Visual({ v, size = 130, checked }: { v: V; size?: number; checked?: null | { correct: boolean } }) {
  if (v.kind === 'scene' && v.anim) return <AnimScene scene={v.anim} title={v.alt} checked={checked} />;
  if (v.kind === 'sign' && v.sign) return <SignArt code={v.sign} speed={v.speed} size={size} title={v.alt} />;
  if (v.kind === 'scene' && v.scene) return temCena3D(v.scene) ? <Cena3D scene={v.scene} title={v.alt} /> : <SceneArt scene={v.scene} title={v.alt} />;
  return null;
}
