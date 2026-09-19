import { useEffect, useRef, useState } from 'react';
import { EventBus } from '@/game/EventBus';
import { MiniHud, formatTime, type ChallengeProps } from './types';
const SAFE = [8,5,2,0];
const LANES = [{y:7,speed:1.05,width:1.05,gap:4,kind:'cart'},{y:6,speed:-1.4,width:1.05,gap:4.5,kind:'cart'},{y:4,speed:.8,width:2.65,gap:3.9,kind:'raft'},{y:3,speed:-.65,width:2.65,gap:3.9,kind:'raft'},{y:1,speed:1,width:2.8,gap:4,kind:'raft'}];
const mod = (n:number,d:number) => ((n%d)+d)%d;
function supports(time:number,lane:typeof LANES[number],x:number) { return mod(x-time*lane.speed-lane.y*.55,lane.gap)<lane.width; }
export default function MonsoonCrossingGame(props:ChallengeProps) {
  const callbacks=useRef(props);callbacks.current=props;
  const run=useRef({x:3.5,y:8,time:0,riverTime:0,rescues:0,latches:0,checkpoint:8,immune:0,hop:0,done:false,message:'DODGE CARTS · RIDE RAFTS · REACH THREE BANKS'});
  const [view,setView]=useState({...run.current});
  const rescue=()=>{const r=run.current;if(r.time<r.immune||r.done)return;r.rescues++;r.x=3.5;r.y=r.checkpoint;r.immune=r.time+1;r.message='RESCUED AT YOUR LAST BANK · WATCH THE NEXT GAP';EventBus.emit('ui-sfx','wrong');if(r.rescues>=3){r.done=true;callbacks.current.onFail();}};
  const move=(dx:number,dy:number)=>{
    const r=run.current;if(r.done||r.time<r.hop)return;
    r.x=Math.max(.5,Math.min(6.5,r.x+dx));r.y=Math.max(0,Math.min(8,r.y+dy));r.hop=r.time+.16;EventBus.emit('ui-sfx','slice');
    const index=[5,2,0].indexOf(r.y);
    if(index>=0&&index+1>r.latches){r.latches=index+1;r.checkpoint=r.y;r.message=`BANK ${r.latches}/3 SECURED!`;EventBus.emit('ui-sfx','perfect');}
    if(r.latches===3){r.done=true;callbacks.current.onWin(callbacks.current.assisted?'ASSISTED':r.rescues===0&&r.time<45?'GOLD':r.rescues<=1?'SILVER':'BRONZE');}
    setView({...r});
  };
  useEffect(()=>{
    let frame=0,last=performance.now();
    const key=(e:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();if(e.repeat)return;const direction:Record<string,number[]>={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};const d=direction[e.key]??direction[e.key.toLowerCase()];if(d)move(d[0],d[1]);};
    window.addEventListener('keydown',key);
    const tick=(now:number)=>{
      const r=run.current,dt=Math.min(.04,(now-last)/1000);last=now;if(r.done)return;
      r.time+=dt;const riverDelta=dt*(callbacks.current.assisted?.65:1);r.riverTime+=riverDelta;
      const lane=LANES.find(l=>l.y===r.y);
      if(lane&&r.time>r.hop){
        if(lane.kind==='raft')r.x+=lane.speed*riverDelta;
        const overlap=lane.kind==='cart' ? supports(r.riverTime,lane,r.x-.2)||supports(r.riverTime,lane,r.x+.2) : !supports(r.riverTime,lane,r.x);
        if(overlap||r.x<.12||r.x>6.88)rescue();
      }
      if(r.time>=90){r.done=true;callbacks.current.onFail();}
      setView({...r});if(!r.done)frame=requestAnimationFrame(tick);
    };frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',key);};
  },[]);
  return <div className="crossing-game"><MiniHud left={`BANKS ${view.latches}/3 · ${'♥'.repeat(Math.max(0,3-view.rescues))}`} right={formatTime(90-view.time)}/>
    <div className="river-field" onPointerDown={e=>{const b=e.currentTarget.getBoundingClientRect(),x=(e.clientX-b.left)/b.width*7,y=Math.floor((e.clientY-b.top)/b.height*9);const dy=y-view.y;move(dy===0?Math.sign(x-view.x):0,Math.sign(dy));}}>
      {Array.from({length:9},(_,y)=><div key={y} className={`river-row ${SAFE.includes(y)?'bank':y>=6?'traffic':'water'}`} style={{top:`${y/9*100}%`}}>{SAFE.includes(y)&&<span>{y===8?'START':y===0?'FINISH':`CHECKPOINT ${y===5?1:2}`} {view.checkpoint<=y?'✦':''}</span>}</div>)}
      {LANES.flatMap(lane=>Array.from({length:5},(_,i)=>{const x=mod(view.riverTime*lane.speed+lane.y*.55,lane.gap)+(i-2)*lane.gap;return <div key={`${lane.y}-${i}`} className={`river-object ${lane.kind}`} style={{left:`${x/7*100}%`,top:`${(lane.y+.17)/9*100}%`,width:`${lane.width/7*100}%`}}>{lane.kind==='cart'?'▤':'≋'}</div>;}))}
      <div className={`river-player ${view.immune>view.time?'rescuing':''}`} style={{left:`${view.x/7*100}%`,top:`${(view.y+.5)/9*100}%`,scale:view.hop>view.time?'1.15':'1'}}><img src="/assets/mooshak-scout.png" alt="Mooshak"/></div>
    </div>
    <p className="crossing-message">{view.message}</p><div className="rally-controls crossing-direction"><button onPointerDown={()=>move(-1,0)}>◀</button><button onPointerDown={()=>move(0,-1)}>▲ HOP</button><button onPointerDown={()=>move(1,0)}>▶</button><button onPointerDown={()=>move(0,1)}>▼ BACK</button></div>
  </div>;
}
