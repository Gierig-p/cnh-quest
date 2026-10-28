import type { Visual as V } from '../content/types';
import { SignArt } from './SignArt';
import { SceneArt } from './SceneArt';

export function Visual({ v, size = 130 }: { v: V; size?: number }) {
  if (v.kind === 'sign' && v.sign) return <SignArt code={v.sign} speed={v.speed} size={size} title={v.alt} />;
  if (v.kind === 'scene' && v.scene) return <SceneArt scene={v.scene} title={v.alt} />;
  return null;
}
