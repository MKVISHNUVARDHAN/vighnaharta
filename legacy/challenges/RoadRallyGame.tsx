import { useEffect, useRef, useState } from 'react';
import { EventBus } from '@/game/EventBus';
import { MiniHud, type ChallengeProps } from './types';

type ObjectOnRoad = { id: number; lane: number; y: number; kind: 'cart' | 'puddle' | 'petal'; resolved?: boolean };
type Run = { time: number; x: number; lane: number; jump: number; hearts: number; petals: number; combo: number; objects: ObjectOnRoad[]; nextWave: number; id: number; immune: number; feedback: string; done: boolean };
export default function RoadRallyGame(props: ChallengeProps) {
  const callbacks = useRef(props); callbacks.current = props;
  const run = useRef<Run>({ time: 0, x: 1, lane: 1, jump: 0, hearts: 3, petals: 0, combo: 0, objects: [], nextWave: .5, id: 0, immune: 0, feedback: 'CHASE THE GOLD · HOP BLUE PUDDLES · DODGE CARTS', done: false });
  const [view, setView] = useState<Run>({...run.current});
  const move = (direction: number) => { run.current.lane = Math.max(0, Math.min(2, run.current.lane + direction)); };
  const hop = () => { const r = run.current; if (r.time >= r.jump) { r.jump = r.time + .65; EventBus.emit('ui-sfx', 'slice'); } };
  useEffect(() => {
    let raf = 0, previous = performance.now();
    const key = (e: KeyboardEvent) => {
      if (['ArrowLeft','ArrowRight','ArrowUp',' '].includes(e.key)) e.preventDefault();
      if (e.repeat) return;
      if (['ArrowLeft','a','A'].includes(e.key)) move(-1);
      if (['ArrowRight','d','D'].includes(e.key)) move(1);
      if (['ArrowUp','w','W',' '].includes(e.key)) hop();
    };
    window.addEventListener('keydown', key);
    const frame = (now: number) => {
      const r = run.current, dt = Math.min(.04, (now - previous) / 1000); previous = now;
      if (r.done) return;
      r.time += dt; r.x += (r.lane - r.x) * (1 - Math.exp(-dt * 22));
      if (r.time >= r.nextWave && r.time < 30) {
        const wave = Math.floor(r.nextWave / 1.25), safe = [1,0,2,1,2,0][wave % 6];
        r.objects.push({ id:r.id++,lane:safe,y:-10,kind:'petal' }, { id:r.id++,lane:safe,y:-28,kind:'petal' });
        r.objects.push({ id:r.id++,lane:(safe + 1) % 3,y:-10,kind:wave % 3 === 0 ? 'puddle' : 'cart' });
        if (wave > 7) r.objects.push({ id:r.id++,lane:(safe + 2) % 3,y:-10,kind:wave % 2 ? 'puddle' : 'cart' });
        r.nextWave += callbacks.current.assisted ? 1.55 : 1.25;
      }
      const speed = (callbacks.current.assisted ? 29 : 35) + Math.min(12, r.time * .35);
      for (const object of r.objects) {
        object.y += speed * dt;
        if (object.resolved || object.y < 78 || object.y > 89 || Math.abs(object.lane - r.x) > .38) continue;
        object.resolved = true;
        if (object.kind === 'petal') {
          r.petals++; r.combo++; r.feedback = r.combo >= 5 ? `${r.combo} PICKUP STREAK!` : '+1 PETAL'; EventBus.emit('ui-sfx', r.combo % 5 ? 'good' : 'perfect');
        } else if (object.kind === 'puddle' && r.jump > r.time) {
          r.feedback = 'CLEAN HOP!'; EventBus.emit('ui-sfx','perfect');
        } else if (r.time > r.immune) {
          r.hearts--; r.combo = 0; r.immune = r.time + 1.1; r.feedback = 'OUCH! FIND THE OPEN LANE'; EventBus.emit('ui-sfx','wrong');
        }
      }
      r.objects = r.objects.filter(o => o.y < 112 && !(o.resolved && o.kind === 'petal'));
      setView({...r,objects:[...r.objects]});
      if (r.hearts <= 0 || r.time >= 34) {
        r.done = true;
        if (r.hearts <= 0) callbacks.current.onFail();
        else callbacks.current.onWin(callbacks.current.assisted ? 'ASSISTED' : r.hearts === 3 && r.petals >= 28 ? 'GOLD' : r.petals >= 18 ? 'SILVER' : 'BRONZE');
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown',key); };
  }, []);
  const lift = view.jump > view.time ? Math.sin((1 - (view.jump - view.time) / .65) * Math.PI) * 74 : 0;
  return <div className="road-rally-game">
    <MiniHud left={`${'♥'.repeat(Math.max(0,view.hearts))} · ${Math.min(100,Math.floor(view.time / 34 * 100))}% TO THE BELL`} right={`${view.petals} PETALS`} />
    <div className={`runner-road ${view.immune > view.time ? 'impact' : ''}`}>
      <div className="road-stream" />
      <div className="runner-distance" style={{width:`${view.time / 34 * 100}%`}} />
      {view.objects.map(o => <div key={o.id} className={`road-hazard ${o.kind}`} style={{left:`${25+o.lane*25}%`,top:`${o.y}%`,opacity:o.resolved ? .3 : 1}}>{o.kind === 'cart' ? <span className="wood-cart">▤</span> : o.kind === 'petal' ? '✦' : '≈'}</div>)}
      <div className="runner-shadow" style={{left:`${25+view.x*25}%`,transform:`translateX(-50%) scale(${1-lift/160})`}} />
      <div className="runner-sprite" role="img" aria-label="Mooshak running" style={{left:`${25+view.x*25}%`,marginBottom:lift}} />
      <div className="runner-callout">{view.feedback}</div>
    </div>
    <div className="rally-controls"><button onPointerDown={() => move(-1)}>◀ LEFT</button><button className="hop" onPointerDown={hop}>HOP · SPACE</button><button onPointerDown={() => move(1)}>RIGHT ▶</button></div>
    <p className="match-message">GOLD: FINISH UNHURT + COLLECT 28 PETALS</p>
  </div>;
}
