(()=>{
'use strict';
const $=s=>document.querySelector(s),root=$('#samiLaunch'),canvas=$('#samiCinema'),film=$('#introFilm'),ctx=canvas?.getContext('2d',{alpha:false}),gate=$('#launchStartGate'),brand=$('#brandResolve'),logo=$('#finalWordmark'),wordmarkStage=$('#wordmarkStage'),welcomeUI=$('.welcome-ui'),words=$('#pitchWords'),sentence=$('#pitchLine'),status=$('#audioStatus');
const welcomeAudio=$('#welcomeAudio'),salesAudio=$('#salesAudio'),salesVoice=$('#salesVoice');
const NARRATION=['https://www.aidocmaker.com/g0/audio?name=44a2ca403f624d8ba1787a51fa47c06e'];
let narrationIndex=0,narrationActive=false,narrationTimer=0;
const PROCESS=['SITE VISITS','PHOTOGRAPHS','NOTES','SERVICE INFORMATION','UTILITY PLANS','MEASUREMENTS','VERIFICATION','COMMUNICATION','DRAFTING','CAD','REVIEW','AMENDMENTS','RE-REVIEW','APPROVAL','PROJECT CHANGES','UPDATES','TIME','COST','TRAVEL','DUPLICATION','ENVIRONMENTAL IMPACT','VERSION CONTROL','ACCESS CONSTRAINTS','GROUND CONDITIONS','OVERHEAD LINES','UNDERGROUND SERVICES','TRAFFIC MANAGEMENT','ASSUMPTIONS','HANDOFFS','REWORK','DISCONNECTED FILES'];
const STRUCTURES=[
{x:-12,z:7,w:4.6,d:3.2,h:2.9,delay:0},{x:-5.5,z:10,w:3.1,d:4.1,h:4.4,delay:.08},
{x:5.8,z:7.5,w:4.4,d:3.4,h:3.6,delay:.16},{x:12.4,z:2.6,w:3.6,d:5.2,h:5.4,delay:.24},
{x:-9.8,z:-5.8,w:5.1,d:3.6,h:2.5,delay:.32},{x:1.7,z:-7.6,w:4.0,d:4.0,h:4.8,delay:.4},
{x:10.7,z:-9.2,w:5.5,d:3.3,h:3.1,delay:.48}
];
let mode='welcome',running=false,start=0,raf=0,w=0,h=0,dpr=1,sound=true,cracks=[],blocks=[],cad=[],promoCad=[],fragments=[],sparks=[],seed=170926,suspendedAt=0,filmUrl='',filmLoading=null,filmFallback=false;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,out=t=>1-Math.pow(1-clamp(t),3),smooth=t=>{t=clamp(t);return t*t*(3-2*t)},ease=t=>{t=clamp(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
const ENERGY_Y=-.285,ENERGY_ORIGIN=[0,ENERGY_Y,0];
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
function resize(){if(!ctx)return;const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.75);w=r.width;h=r.height;canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#020405';ctx.fillRect(0,0,w,h);if(!running)drawStill();}
function vsub(a,b){return a.map((x,i)=>x-b[i])}function dot(a,b){return a.reduce((s,x,i)=>s+x*b[i],0)}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}function norm(a){const m=Math.hypot(...a)||1;return a.map(x=>x/m)}
function camera(pos,target,fov=54){const forward=norm(vsub(target,pos)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward),f=Math.min(w,h)*.92/Math.tan(fov*Math.PI/360);return{pos,target,forward,right,up,f}}
function project(cam,p){const d=vsub(p,cam.pos),z=dot(d,cam.forward);if(z<=.05)return null;return{x:w/2+dot(d,cam.right)*cam.f/z,y:h/2-dot(d,cam.up)*cam.f/z,z,scale:cam.f/z}}
function path(points){if(points.length<2)return false;ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);return true}
function prepareGeometry(){
 seed=170926;cracks=[];blocks=[];cad=[];promoCad=[];fragments=[];sparks=[];
 const fissures=12;
 for(let i=0;i<fissures;i++){
  let heading=i/fissures*Math.PI*2+(rnd()-.5)*.52,x=0,z=0;
  const pts=[[0,ENERGY_Y,0]],steps=16+Math.floor(rnd()*10);
  for(let j=0;j<steps;j++){
   const seg=j<2?.18+rnd()*.08:.32+rnd()*.62;
   heading+=(rnd()-.5)*(j<3?.18:.34)+Math.sin((j+i)*.45)*.02;
   if(j>2&&rnd()>.82)heading+=(rnd()>.5?1:-1)*(.16+rnd()*.28);
   x+=Math.cos(heading)*seg;z+=Math.sin(heading)*seg;
   pts.push([x,ENERGY_Y,z]);
   if(j>1&&j<steps-1&&rnd()>.42){
    let bx=x,bz=z,ba=heading+(rnd()>.5?1:-1)*(.26+rnd()*.64),branch=[[x,ENERGY_Y,z]],branchSteps=3+Math.floor(rnd()*6);
    for(let k=0;k<branchSteps;k++){
     const bl=.16+rnd()*.38;ba+=(rnd()-.5)*(.32+k*.035);bx+=Math.cos(ba)*bl;bz+=Math.sin(ba)*bl;branch.push([bx,ENERGY_Y,bz]);
     if(k>0&&rnd()>.68){
      let sx=bx,sz=bz,sa=ba+(rnd()>.5?1:-1)*(.26+rnd()*.55),split=[[bx,ENERGY_Y,bz]];
      for(let m=0;m<2+Math.floor(rnd()*4);m++){
       const sl=.12+rnd()*.24;sa+=(rnd()-.5)*.42;sx+=Math.cos(sa)*sl;sz+=Math.sin(sa)*sl;split.push([sx,ENERGY_Y,sz]);
      }
      cracks.push({pts:split,seed:i*701+j*17+k,branch:true,delay:.16+j*.031+k*.018+rnd()*.14,broken:rnd()>.25,flicker:rnd()});
     }
    }
    cracks.push({pts:branch,seed:i*101+j,branch:true,delay:.09+j*.028+rnd()*.16,broken:rnd()>.15,flicker:rnd()});
   }
  }
  cracks.push({pts,seed:i,branch:false,delay:rnd()*.12,broken:rnd()>.48,flicker:rnd()});
 }
 for(let i=0;i<32;i++){
  const a=i/32*Math.PI*2+(rnd()-.5)*.1,r0=.22+rnd()*.17,r1=.8+rnd()*2.25,span=.08+rnd()*.14;
  blocks.push({a,r0,r1,span,lift:.08+rnd()*.48,drift:.05+rnd()*.25,tilt:(rnd()-.5)*.15,seed:i})
 }
 const add=(pts,delay=0,major=false)=>cad.push({pts:pts.map(([x,z])=>[x,ENERGY_Y,z]),delay,major});
 for(const off of [-.48,.48]){add([[0,0],[3.2,0],[3.2,4+off],[11,4+off],[11,12+off],[23,12+off]],0,true);add([[0,0],[-3.3,0],[-3.3,-4+off],[-17,-4+off],[-17,-13+off]],.08,true)}
 for(let side of [-1,1])for(let r=0;r<5;r++){const x=side*(6+r*3.4),z=(r%2?1:-1)*(5+r*1.25),ww=2.2+r*.15,hh=2.2+r*.35;add([[0,0],[x/2,0],[x/2,z],[x,z],[x+side*ww,z],[x+side*ww,z+hh],[x,z+hh],[x,z]],.1+r*.055);for(let j=0;j<3;j++)add([[x,z+.45+j*.65],[x+side*ww,z+.45+j*.65]],.16+r*.055)}
 for(let i=0;i<16;i++){let z=-13+i*1.16;add([[0,0],[2.2,-2],[2.2,z],[4.5,z],[4.5,z+1.02],[2.2,z+1.02],[2.2,z]],.15+i*.012)}
 for(let i=0;i<7;i++){const x=-18+i*6,z=15+Math.sin(i)*2.8,c=[];for(let j=0;j<=28;j++){const a=j/28*Math.PI*2;c.push([x+Math.cos(a)*1.1,z+Math.sin(a)*1.1])}add([[0,0],[x/2,8],[x,z],...c],.32+i*.02)}
 add([[-24,20],[25,20],[25,-21],[-24,-21],[-24,20]],.48,true);for(let i=0;i<11;i++){const x=-21+i*4.3;add([[x,20],[x,21.4],[x+.9,21.4]],.55+i*.01)}
 for(let i=0;i<65;i++)sparks.push({angle:rnd()*Math.PI*2,speed:1.3+rnd()*6.5,height:.8+rnd()*4.2,life:1.7+rnd()*1.5,seed:rnd()});
 cad.sort((a,b)=>{const ap=a.pts[a.pts.length-1],bp=b.pts[b.pts.length-1];const aa=(Math.atan2(ap[2],ap[0])+Math.PI*2)%(Math.PI*2),ba=(Math.atan2(bp[2],bp[0])+Math.PI*2)%(Math.PI*2);return aa-ba});
 // Promo-only disconnected information tiles: intentionally misregistered sheets, photos and data cards.
 for(let i=0;i<34;i++){const ring=3.2+(i%8)*2.35+rnd()*2.2,a=rnd()*Math.PI*2;fragments.push({x:Math.cos(a)*ring,z:Math.sin(a)*ring,w:1.8+rnd()*4.5,d:1.1+rnd()*3.1,rot:(rnd()-.5)*1.15,lift:.03+rnd()*.55,phase:rnd()*Math.PI*2,delay:rnd()*7.5,kind:i%5,seed:i});}
 // Promo-only larger CAD field; the beloved startup geometry remains unchanged.
 promoCad=cad.map(c=>({pts:c.pts.map(([x,y,z])=>[x*1.55,y,z*1.55]),delay:c.delay,major:c.major}));
 const padd=(pts,delay=0,major=false)=>promoCad.push({pts:pts.map(([x,z])=>[x,ENERGY_Y,z]),delay,major});
 for(let q=0;q<18;q++){const side=q%2?-1:1,x=side*(19+(q%6)*4.6),z=-24+Math.floor(q/2)*5.6,wid=2.8+(q%3)*.7,dep=2.4+(q%4)*.55;padd([[0,0],[x*.42,z*.18],[x*.7,z],[x,z],[x+side*wid,z],[x+side*wid,z+dep],[x,z+dep],[x,z]],.24+q*.014,q%5===0);}
 padd([[-39,31],[42,31],[42,-35],[-39,-35],[-39,31]],.42,true);
}
function camAt(t){
 if(mode==='welcome'){const glide=clamp(t/5.9),p=ease(glide);return camera([lerp(.6,8.6,p),lerp(1.55,8.8,p),lerp(4.9,16.2,p)],[0,lerp(-.10,.16,p),0],lerp(44,48,p))}
 // Promo act one: move through disconnected information rather than green fractures.
 if(t<18.9){const p=ease(t/18.9),a=lerp(-1.18,.72,p),r=lerp(8.4,14.5,p),y=lerp(1.05,5.8,p);return camera([Math.cos(a)*r,y,Math.sin(a)*r],[lerp(-2.0,0,p),lerp(-.24,-.12,p),lerp(5.5,0,p)],lerp(57,48,p))}
 if(t<22.9){const p=ease((t-18.9)/4);return camera([lerp(10.8,5.6,p),lerp(6.1,2.1,p),lerp(10.4,6.2,p)],[0,-.18,0],lerp(48,50,p))}
 // SAMI act: a drone lifts from near ground, orbits a complete 360 degrees and reveals the full site intelligence field.
 if(t<39.3){const p=ease((t-22.9)/16.4),angle=-Math.PI*.58+Math.PI*2*p,r=lerp(6.2,39,p),y=lerp(1.45,30.5,p);return camera([Math.cos(angle)*r,y,Math.sin(angle)*r],[0,lerp(-.22,.12,p),0],lerp(53,49,p))}
 // Fly back toward the energy origin as the drawing retracts.
 if(t<42.45){const p=ease((t-39.3)/3.15),angle=Math.PI*1.42+Math.PI*.46*p,r=lerp(39,9.5,p),y=lerp(30.5,7.0,p);return camera([Math.cos(angle)*r,y,Math.sin(angle)*r],[0,lerp(.12,.02,p),0],lerp(49,45.5,p))}
 const p=ease((t-42.45)/1.55);return camera([lerp(-2.8,0,p),lerp(7,5.4,p),lerp(9.1,12.8,p)],[0,lerp(.02,.74,p),0],lerp(45.5,49,p))
}
function drawGround(cam,t){
 ctx.fillStyle='#020405';ctx.fillRect(0,0,w,h);
 const clean=mode!=='sales'||t>22.15,span=mode==='sales'&&t>22.2?58:30,zNear=mode==='sales'&&t>22.2?-56:-30,zFar=mode==='sales'&&t>22.2?48:22;
 const poly=[[-span,-.32,zNear],[span,-.32,zNear],[span,-.32,zFar],[-span,-.32,zFar]].map(p=>project(cam,p)).filter(Boolean);
 if(poly.length===4){const g=ctx.createLinearGradient(0,Math.min(...poly.map(p=>p.y)),0,h);if(clean){g.addColorStop(0,'#07120f');g.addColorStop(.36,'#0b1213');g.addColorStop(.75,'#06100d');g.addColorStop(1,'#020607')}else{g.addColorStop(0,'#090d0e');g.addColorStop(.42,'#0b0f10');g.addColorStop(.78,'#06090a');g.addColorStop(1,'#020405')}ctx.fillStyle=g;path(poly);ctx.fill()}
 ctx.save();ctx.globalAlpha=clean?.038:.022;ctx.strokeStyle=clean?'#7ee8ac':'#7b8783';ctx.lineWidth=.7;for(let z=zNear+4;z<=zFar;z+=clean?5:4){const a=project(cam,[-span,-.305,z]),b=project(cam,[span,-.305,z]);if(a&&b){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}ctx.restore();
 const haze=ctx.createRadialGradient(w*.5,h*.56,0,w*.5,h*.56,Math.max(w,h)*.62);if(clean){haze.addColorStop(0,'rgba(25,67,51,.075)');haze.addColorStop(.5,'rgba(8,25,20,.025)')}else{haze.addColorStop(0,'rgba(47,55,52,.045)');haze.addColorStop(.5,'rgba(19,24,23,.02)')}haze.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
}
function circleProjected(cam,r,y=-.29,n=72){const ps=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,p=project(cam,[Math.cos(a)*r,y,Math.sin(a)*r]);if(p)ps.push(p)}return ps}
function roughCircleProjected(cam,r,y=-.29,phase=0,n=52){const ps=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,noise=1+.09*Math.sin(a*7+phase)+.045*Math.sin(a*13-phase*1.7),rr=r*noise,p=project(cam,[Math.cos(a)*rr,y,Math.sin(a)*rr]);if(p)ps.push(p)}return ps}
function drawCrater(cam,t,energy){if(mode==='sales')return;const impact=2.78;if(t<impact-.03)return;const active=t>=impact,build=active?smooth((t-impact)/.48):0,rr=lerp(.08,.70,build),c=roughCircleProjected(cam,rr,ENERGY_Y,.8);if(c.length>2){ctx.save();ctx.fillStyle=active?'#000101':'#050a08';path(c);ctx.fill();const inner=roughCircleProjected(cam,rr*.72,ENERGY_Y,2.1);if(inner.length>2){ctx.fillStyle='#000';path(inner);ctx.fill()}for(let pass=0;pass<3;pass++){ctx.strokeStyle=pass===0?`rgba(44,255,135,${.045*energy})`:pass===1?`rgba(66,240,144,${.15*energy})`:`rgba(172,255,207,${.32*energy})`;ctx.lineWidth=pass===0?13:pass===1?4:1;ctx.shadowColor='#37ff8b';ctx.shadowBlur=pass===0?24:pass===1?9:0;path(c);ctx.stroke()}ctx.shadowBlur=0;ctx.strokeStyle=`rgba(165,255,204,${.12*energy})`;ctx.lineWidth=.7;for(const phase of [1.4,2.7]){const rim=roughCircleProjected(cam,rr*(1.06+phase*.012),ENERGY_Y,phase);path(rim);ctx.stroke()}ctx.restore();}}
function drawFragments(cam,t){
 if(mode!=='sales'||t<.35||t>20.05)return;
 const build=smooth((t-.35)/4.2),density=smooth((t-4.2)/11.4),collapse=smooth((t-17.25)/2.35);
 ctx.save();
 for(const f of fragments){
  const born=smooth((t-(.35+f.delay*.52))/.78);if(born<=0)continue;
  const pull=collapse,fade=(1-collapse)*born;
  const flick=.72+.28*Math.sin(t*(2.0+(f.seed%5)*.37)+f.phase);
  const x=lerp(f.x,0,pull),z=lerp(f.z,0,pull),sc=lerp(1,.06,pull),rot=f.rot*(1-pull)+Math.sin(t*.22+f.phase)*.03*(1-pull);
  const y=ENERGY_Y+f.lift*(.22+.78*build)*(1-pull);
  const cs=Math.cos(rot),sn=Math.sin(rot),hw=f.w*.5*sc,hd=f.d*.5*sc;
  const world=(dx,dz)=>[x+dx*cs-dz*sn,y,z+dx*sn+dz*cs];
  const corners=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([dx,dz])=>project(cam,world(dx,dz))).filter(Boolean);
  if(corners.length!==4)continue;
  const alpha=(.12+.18*density)*fade*(f.seed%7===0?flick:1);
  const fills=['rgba(12,16,17,','rgba(22,20,17,','rgba(14,18,20,','rgba(23,18,18,','rgba(17,18,20,'];
  const strokes=['112,128,123','180,145,91','102,126,151','167,100,89','145,151,154'];
  ctx.fillStyle=fills[f.kind%fills.length]+(alpha*2.15)+')';path(corners);ctx.fill();
  ctx.strokeStyle=`rgba(${strokes[f.kind%strokes.length]},${alpha*.95})`;ctx.lineWidth=.7;ctx.setLineDash((f.seed%4===0)?[7,5]:[]);path(corners);ctx.stroke();ctx.setLineDash([]);
  // duplicate/misregistered copy to suggest version drift
  if(f.seed%4===1&&collapse<.7){ctx.save();ctx.globalAlpha=.34*fade;ctx.translate((f.seed%2?1:-1)*(4+f.seed%5),(f.seed%3-1)*4);ctx.strokeStyle='rgba(186,108,93,.72)';ctx.lineWidth=.55;path(corners);ctx.stroke();ctx.restore()}
  // Internal content varies by fragment type: plan, photo, note, revision, utility sheet.
  const a=corners[0],b=corners[1],c=corners[2],d=corners[3];
  const edge=(u,v,q)=>({x:lerp(u.x,v.x,q),y:lerp(u.y,v.y,q)});
  if(f.kind===0||f.kind===4){
   for(let j=1;j<=4;j++){const q=.14+j*.15,l=edge(a,d,q),r=edge(b,c,q),end=.42+((f.seed+j)%5)*.10;ctx.strokeStyle=`rgba(190,201,196,${alpha*(.22+j*.055)})`;ctx.lineWidth=.42;ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(lerp(l.x,r.x,end),lerp(l.y,r.y,end));ctx.stroke()}
   const v1=edge(a,b,.28),v2=edge(d,c,.28);ctx.strokeStyle=`rgba(119,144,157,${alpha*.5})`;ctx.beginPath();ctx.moveTo(v1.x,v1.y);ctx.lineTo(v2.x,v2.y);ctx.stroke();
  }else if(f.kind===1){
   const inset=.18,tl=edge(a,b,inset),tr=edge(b,a,inset),bl=edge(d,c,inset),br=edge(c,d,inset);ctx.strokeStyle=`rgba(194,169,111,${alpha*.8})`;ctx.lineWidth=.48;ctx.beginPath();ctx.moveTo(tl.x,tl.y);ctx.lineTo(br.x,br.y);ctx.moveTo(tr.x,tr.y);ctx.lineTo(bl.x,bl.y);ctx.stroke();
  }else if(f.kind===2){
   for(let j=0;j<3;j++){const q=.25+j*.18,l=edge(a,d,q),r=edge(b,c,q);ctx.strokeStyle=`rgba(111,145,174,${alpha*(.34+j*.08)})`;ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(r.x,r.y);ctx.stroke()}
   const cc={x:(a.x+b.x+c.x+d.x)/4,y:(a.y+b.y+c.y+d.y)/4};ctx.strokeStyle=`rgba(111,145,174,${alpha*.75})`;ctx.beginPath();ctx.arc(cc.x,cc.y,Math.max(3,8*sc),0,Math.PI*2);ctx.stroke();
  }else{
   const q=.42,l=edge(a,d,q),r=edge(b,c,q);ctx.strokeStyle=`rgba(186,100,88,${alpha*.72})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(r.x,r.y);ctx.stroke();
   const q2=.58,l2=edge(a,d,q2),r2=edge(b,c,q2);ctx.strokeStyle=`rgba(211,155,92,${alpha*.55})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(l2.x,l2.y);ctx.lineTo(lerp(l2.x,r2.x,.68),lerp(l2.y,r2.y,.68));ctx.stroke();
  }
 }
 ctx.restore();
}
function drawDisconnectedLinks(cam,t){
 if(mode!=='sales'||t<2.2||t>19.7||fragments.length<8)return;
 const density=smooth((t-3.0)/10.5),collapse=smooth((t-17.35)/2.1),fade=(1-collapse)*density;
 if(fade<=0)return;ctx.save();ctx.lineCap='round';
 const pairs=[[0,5],[3,11],[7,14],[9,21],[2,18],[12,27],[6,30],[15,24],[4,19],[1,28],[10,31]];
 pairs.forEach(([ia,ib],idx)=>{const A=fragments[ia],B=fragments[ib],pa=project(cam,[A.x,ENERGY_Y+A.lift*.28,A.z]),pb=project(cam,[B.x,ENERGY_Y+B.lift*.28,B.z]);if(!pa||!pb)return;const phase=(Math.sin(t*8.5+idx*2.1)+1)/2,cut=.38+.28*phase,ex=lerp(pa.x,pb.x,cut),ey=lerp(pa.y,pb.y,cut);ctx.setLineDash(idx%3===0?[6,9]:[2,7]);ctx.lineDashOffset=-t*(18+idx%4*5);ctx.strokeStyle=idx%4===0?`rgba(183,104,89,${.22*fade})`:idx%4===1?`rgba(191,151,88,${.2*fade})`:`rgba(128,145,151,${.16*fade})`;ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(ex,ey);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=`rgba(220,229,224,${.28*fade})`;ctx.beginPath();ctx.arc(ex,ey,1.5+phase*1.4,0,Math.PI*2);ctx.fill()});
 ctx.restore();
}
function irregularProgress(t){
 const keys=[[.8,0],[2,.06],[3.2,.12],[4.4,.19],[5.8,.27],[7.2,.34],[8.6,.42],[10,.50],[11.4,.59],[12.8,.68],[14,.77],[15.2,.85],[16.2,.92],[17.35,1]];
 if(t<=keys[0][0])return 0;
 for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const[a,x]=keys[i-1],[b,y]=keys[i];return lerp(x,y,smooth((t-a)/(b-a)))}
 return 1
}
function crackProgress(t){
 if(mode==='welcome')return 0;
 if(t<17.8)return irregularProgress(t);
 if(t<20.05)return 1-ease((t-17.8)/2.25);
 return 0
}
function partialPolyline(cam,pts,progress){if(progress<=0)return[];const segs=[];for(let i=1;i<pts.length;i++)segs.push(Math.hypot(pts[i][0]-pts[i-1][0],pts[i][2]-pts[i-1][2]));const total=segs.reduce((a,b)=>a+b,0)*progress;let left=total,out=[pts[0]];for(let i=1;i<pts.length&&left>0;i++){const d=segs[i-1];if(left>=d){out.push(pts[i]);left-=d}else{const q=left/d,a=pts[i-1],b=pts[i];out.push([lerp(a[0],b[0],q),lerp(a[1],b[1],q),lerp(a[2],b[2],q)]);left=0}}return out.map(p=>project(cam,p)).filter(Boolean)}
function pointAlong(ps,p){if(ps.length<2)return null;let lens=[],total=0;for(let i=1;i<ps.length;i++){const d=Math.hypot(ps[i].x-ps[i-1].x,ps[i].y-ps[i-1].y);lens.push(d);total+=d}let d=total*clamp(p);for(let i=1;i<ps.length;i++){if(d<=lens[i-1]){const q=d/(lens[i-1]||1);return{x:lerp(ps[i-1].x,ps[i].x,q),y:lerp(ps[i-1].y,ps[i].y,q)}}d-=lens[i-1]}return ps.at(-1)}
function drawCracks(cam,t){
 const base=crackProgress(t);if(base<=0)return;const retract=mode==='welcome'?t>=7.6:t>=17.8;const chaos=mode==='sales'&&t<20.2;
 for(const c of cracks){
  const p=clamp((base-c.delay)/(1-c.delay)),ps=partialPolyline(cam,c.pts,p);if(ps.length<2)continue;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  const pulse=.55+.45*Math.sin(t*6.2+c.seed*.91),flicker=chaos?(.72+.28*Math.sin(t*17+c.flicker*11)*Math.sin(t*4.6+c.seed*.21)):1;
  if(chaos){
   ctx.strokeStyle=`rgba(2,6,5,${.82})`;ctx.lineWidth=c.branch?4.6:7.4;ctx.shadowBlur=0;path(ps);ctx.stroke();
   ctx.globalCompositeOperation='screen';
   if(c.broken){ctx.setLineDash(c.branch?[10,8,2,10]:[18,12,4,12]);ctx.lineDashOffset=-(t*(c.branch?46:66)+c.seed*9)%60}
   ctx.strokeStyle=`rgba(61,255,123,${(.06+.05*pulse)*flicker})`;ctx.lineWidth=c.branch?8.5:14.5;ctx.shadowColor='rgba(53,255,122,.98)';ctx.shadowBlur=c.branch?20:34;path(ps);ctx.stroke();
   ctx.strokeStyle=`rgba(140,255,136,${(.09+.09*pulse)*flicker})`;ctx.lineWidth=c.branch?3.2:5.8;ctx.shadowColor='rgba(114,255,128,.92)';ctx.shadowBlur=12;path(ps);ctx.stroke();
   ctx.setLineDash([]);
   ctx.strokeStyle=`rgba(248,255,220,${(.22+.30*pulse)*flicker})`;ctx.lineWidth=c.branch?.9:1.25;ctx.shadowBlur=3;path(ps);ctx.stroke();
  }else{
   ctx.strokeStyle=`rgba(21,255,122,${.028+.042*pulse})`;ctx.lineWidth=c.branch?7:12;ctx.shadowColor='#1fff77';ctx.shadowBlur=c.branch?18:28;path(ps);ctx.stroke();
   ctx.strokeStyle=`rgba(39,226,127,${.10+.10*pulse})`;ctx.lineWidth=c.branch?2.5:4.2;ctx.shadowBlur=8;path(ps);ctx.stroke();
   ctx.strokeStyle=`rgba(195,255,218,${.32+.38*pulse})`;ctx.lineWidth=c.branch?.55:.82;ctx.shadowBlur=2;path(ps);ctx.stroke();
  }
  ctx.shadowBlur=0;
  const travel=retract?1-((t*1.45+c.seed*.031)%1):((t*.82+c.seed*.019)%1),bead=pointAlong(ps,travel);
  if(bead){
   const radius=chaos?(c.branch?10:14):(c.branch?8:12),gr=ctx.createRadialGradient(bead.x,bead.y,0,bead.x,bead.y,radius);
   gr.addColorStop(0,'rgba(245,255,246,.95)');gr.addColorStop(.18,chaos?'rgba(179,255,123,.75)':'rgba(93,255,163,.55)');gr.addColorStop(1,chaos?'rgba(64,255,137,0)':'rgba(45,255,137,0)');
   ctx.fillStyle=gr;ctx.beginPath();ctx.arc(bead.x,bead.y,radius,0,Math.PI*2);ctx.fill()
  }
  ctx.restore();
 }
}
function drawBlocks(cam,t){
 if(mode!=='sales'||t<1||t>20.1)return;
 const f=irregularProgress(t),collapse=smooth((t-17.8)/2.25);
 for(const b of blocks){
  const q=clamp((f-(b.seed%8)*.012)/.72),dr=b.r1*(.25+.75*q)*(1-.5*collapse);
  const jitter=(.02+.045*Math.sin(t*3.7+b.seed))*q*(1-collapse),a=b.a+b.tilt*q+jitter;
  const lift=(.02+b.lift*.12)*Math.sin(Math.PI*clamp((t-1)/6))*q*(1-collapse);
  const pts=[[Math.cos(a-b.span)*b.r0,-.29+lift,Math.sin(a-b.span)*b.r0],[Math.cos(a-b.span)*dr,-.285+lift,Math.sin(a-b.span)*dr],[Math.cos(a+b.span)*dr,-.29+lift,Math.sin(a+b.span)*dr],[Math.cos(a+b.span)*b.r0,-.29+lift,Math.sin(a+b.span)*b.r0]].map(p=>project(cam,p)).filter(Boolean);
  if(pts.length===4){ctx.fillStyle=`rgba(${5+b.seed%4},${10+b.seed%7},${8+b.seed%5},${.54-collapse*.46})`;path(pts);ctx.fill();ctx.strokeStyle=`rgba(84,248,151,${.045*q*(1-collapse)})`;ctx.lineWidth=.55;ctx.stroke()}
 }
}
function drawImpactDebris(cam,t){return}
function cadProgress(t){
 if(mode==='welcome'){if(t<.75)return 0;if(t<3.15)return smooth((t-.75)/2.4);if(t<3.78)return 1;if(t<4.88)return 1-smooth((t-3.78)/1.1);return 0}
 if(t<22.9)return 0;if(t<35.9)return ease((t-22.9)/13);if(t<39.3)return 1;if(t<42.25)return 1-smooth((t-39.3)/2.95);return 0
}
function drawCad(cam,t){
 const p=cadProgress(t);if(p<=0)return;const welcome=mode==='welcome',network=welcome?cad:promoCad,retract=(welcome&&t>=3.78)||(!welcome&&t>=39.3),active=network.length*p;
 for(let i=0;i<network.length;i++){
  const order=retract?(network.length-1-i):i,local=clamp(active-order);if(local<=0)continue;
  const c=network[i],ps=partialPolyline(cam,c.pts,Math.max(.001,local));if(ps.length<2)continue;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';const surge=.5+.5*Math.sin(t*10-i*.42);
  ctx.strokeStyle=c.major?`rgba(118,255,178,${.42+.38*surge})`:`rgba(66,232,132,${.24+.42*surge})`;ctx.lineWidth=c.major?1.7:.8;ctx.shadowColor='rgba(53,255,139,.95)';ctx.shadowBlur=c.major?10:5;path(ps);ctx.stroke();ctx.shadowBlur=0;
  const head=pointAlong(ps,1);if(head){const rg=ctx.createRadialGradient(head.x,head.y,0,head.x,head.y,18);rg.addColorStop(0,'rgba(242,255,247,.98)');rg.addColorStop(.18,'rgba(114,255,180,.90)');rg.addColorStop(.45,'rgba(76,255,153,.35)');rg.addColorStop(1,'rgba(76,255,153,0)');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(head.x,head.y,18,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(175,255,210,${.16+.22*surge})`;ctx.lineWidth=c.major?.9:.5;path(ps);ctx.stroke()}
  ctx.restore()
 }
}
function flash(t){
 const xs=mode==='welcome'?[4.98,5.24]:[19.72,20.00,42.10];let a=0;
 for(const x of xs){const d=Math.abs(t-x);if(d<.2)a=Math.max(a,(1-d/.2)*(x<20.2?.58:.3))}
 if(a){ctx.fillStyle=`rgba(203,255,224,${a})`;ctx.fillRect(0,0,w,h)}
}
function drawPulse(cam,t){
 const center=project(cam,ENERGY_ORIGIN);if(!center)return;let energy=0;
 if(mode==='welcome')energy=t<.12?0:t<.75?.52*smooth((t-.12)/.63):t<4.75?.32+.24*Math.sin(t*8.8)**2:.52*(1-smooth((t-4.75)/.46));
 else if(t>22.35&&t<42.25)energy=(.24+.30*Math.sin(t*5.5)**2)*smooth((t-22.35)/1.05)*(1-smooth((t-41.75)/.50));
 if(energy<=0)return;const r=95+energy*170,g=ctx.createRadialGradient(center.x,center.y,0,center.x,center.y,r);
 g.addColorStop(0,`rgba(54,255,140,${.13*energy})`);g.addColorStop(.26,`rgba(40,232,124,${.09*energy})`);g.addColorStop(.58,`rgba(30,200,110,${.035*energy})`);g.addColorStop(1,'rgba(30,200,110,0)');
 ctx.fillStyle=g;ctx.fillRect(center.x-r,center.y-r,r*2,r*2)
}
function drawEnergyCore(cam,t){
 const c=project(cam,ENERGY_ORIGIN);if(!c)return;let a=0;
 if(mode==='welcome'){if(t>.12&&t<5.18)a=smooth((t-.12)/.45)*(1-smooth((t-4.82)/.36))}
 else if(t>22.3&&t<42.25)a=.88*smooth((t-22.3)/.72)*(1-smooth((t-41.7)/.55));
 if(a<=.01)return;const pulse=.76+.24*Math.sin(t*7.5)**2,r=lerp(12,25,pulse);
 ctx.save();const g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,r);g.addColorStop(0,`rgba(245,255,249,${.96*a})`);g.addColorStop(.16,`rgba(151,255,198,${.88*a})`);g.addColorStop(.44,`rgba(54,255,139,${.44*a})`);g.addColorStop(1,'rgba(45,255,137,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(177,255,211,${.28*a})`;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(c.x,c.y,lerp(6,10,pulse),0,Math.PI*2);ctx.stroke();ctx.restore()
}
function drawFinalPulse(cam,t){
 const c=project(cam,ENERGY_ORIGIN);if(!c)return;const moments=mode==='welcome'?[4.82,5.05]:[42.05,42.30];
 for(const at of moments){const age=t-at;if(age<0||age>.34)continue;const p=smooth(age/.34),a=(1-p)*.9,len=lerp(16,Math.min(w*.46,430),p);const g=ctx.createLinearGradient(c.x-len,c.y,c.x+len,c.y);g.addColorStop(0,'rgba(80,255,158,0)');g.addColorStop(.42,`rgba(105,255,178,${a*.48})`);g.addColorStop(.5,`rgba(238,255,246,${a})`);g.addColorStop(.58,`rgba(105,255,178,${a*.48})`);g.addColorStop(1,'rgba(80,255,158,0)');ctx.save();ctx.strokeStyle=g;ctx.lineWidth=lerp(5.5,.8,p);ctx.shadowColor='#5cff9f';ctx.shadowBlur=20*(1-p);ctx.beginPath();ctx.moveTo(c.x-len,c.y);ctx.lineTo(c.x+len,c.y);ctx.stroke();ctx.restore()}
}
function drawIgnitionLine(cam,t){
 if(mode!=='sales')return;const age=t-22.45;if(age<0||age>.92)return;const c=project(cam,ENERGY_ORIGIN);if(!c)return;
 const p=smooth(age/.88),a=(1-smooth((age-.56)/.32))*.95,len=lerp(Math.min(h*.22,120),Math.min(h*.84,430),p);
 ctx.save();
 const g=ctx.createLinearGradient(c.x,c.y-len,c.x,c.y+len);
 g.addColorStop(0,'rgba(83,255,157,0)');g.addColorStop(.38,`rgba(116,255,176,${a*.45})`);g.addColorStop(.5,`rgba(244,255,247,${a})`);g.addColorStop(.62,`rgba(116,255,176,${a*.45})`);g.addColorStop(1,'rgba(83,255,157,0)');
 ctx.strokeStyle=g;ctx.lineWidth=lerp(7.5,1.2,p);ctx.shadowColor='#6dffb0';ctx.shadowBlur=28*(1-p);ctx.beginPath();ctx.moveTo(c.x,c.y-len);ctx.lineTo(c.x,c.y+len);ctx.stroke();
 const rg=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,lerp(16,54,p));
 rg.addColorStop(0,`rgba(247,255,250,${a*.9})`);rg.addColorStop(.22,`rgba(138,255,194,${a*.65})`);rg.addColorStop(1,'rgba(76,255,153,0)');
 ctx.fillStyle=rg;ctx.beginPath();ctx.arc(c.x,c.y,lerp(10,42,p),0,Math.PI*2);ctx.fill();
 ctx.restore();
}
function processWords(t){
 if(mode!=='sales')return;const rel=t-1.3,collapse=smooth((t-17.8)/2.1);
 [...words.querySelectorAll('.process-word')].forEach(el=>{const at=+el.dataset.start,d=+el.dataset.duration,p=rel-at,arrive=smooth(p/.34),foreground=1-smooth((p-d)/.48),settled=.16*smooth((p-d+.25)/.7),o=arrive*Math.max(foreground,settled)*(1-collapse);el.style.opacity=String(Math.max(0,o));const drift=lerp(14,-12,clamp(p/(d+1.2))),scale=foreground>.4?lerp(.96,1.04,clamp(p/d)):lerp(.9,.72,clamp((p-d)/3));el.style.transform=`translate(-50%,calc(-50% + ${drift}px)) scale(${scale})`;el.style.filter=`blur(${foreground>.3?0:Math.min(1.2,Math.max(0,p-d)*.22)}px)`});
 [...words.querySelectorAll('.process-data')].forEach((el,i)=>{const born=4.7+(i%70)*.16+Math.floor(i/70)*.35,p=t-born,density=clamp((t-7.5)/9.6),o=smooth(p/.8)*(.018+.15*density)*(1-collapse);el.style.opacity=String(Math.max(0,o));el.style.transform=`translateY(${((t*8+i*3)%90)-45}px) scale(${.78+.18*((i%5)/4)})`})
}
function prepareWords(){
 words.replaceChildren();let at=0;PROCESS.forEach((text,i)=>{const el=document.createElement('div');el.className='process-word';el.textContent=text;el.style.setProperty('--x',(11+(i*29)%78)+'%');el.style.setProperty('--y',(16+(i*19)%66)+'%');el.dataset.start=at;el.dataset.duration=.95+(i%4)*.18;at+=.43+(i%3)*.08;words.append(el)});
 for(let i=0;i<230;i++){const el=document.createElement('div');el.className='process-data';el.textContent=PROCESS[i%PROCESS.length]+' / '+String((i*314159)%100000).padStart(5,'0');el.style.setProperty('--x',(2+(i*43)%95)+'%');el.style.setProperty('--y',(5+(i*23)%90)+'%');words.append(el)}
}
function setSentence(text,opacity){if(sentence.dataset.text!==text){sentence.innerHTML='';sentence.textContent=text;sentence.dataset.text=text}sentence.style.opacity=String(opacity)}
function propositions(t){
 if(mode!=='sales')return;if(t<20.7){setSentence('',0);return}
 if(t>=38.75)return;
 const items=[[20.75,23.0,'WHAT IF THERE WAS A BETTER WAY?'],[23.2,25.0,'ONE SOURCE OF INFORMATION'],[25.05,26.8,'ONE CONNECTED PROJECT'],[26.85,28.35,'ONE WORKSPACE'],[28.4,31.1,'SERVICES · CONSTRAINTS · ACCESS · MEASUREMENTS · DESIGN'],[31.15,33.7,'DEFINE THE SITE ONCE. DRAW IT TO SCALE.'],[33.75,35.65,'LESS DUPLICATION. FEWER ASSUMPTIONS.'],[35.7,37.2,'CLEARER DECISIONS.'],[37.25,38.7,'IT’S TIME TO WORK SMARTER']];
 const x=items.find(([a,b])=>t>=a&&t<b);if(x){const[a,b,text]=x;setSentence(text,smooth((t-a)/.35)*(1-smooth((t-b+.32)/.32)))}else setSentence('',0)
}
function letterMorph(t){
 if(mode!=='sales'||t<38.75)return;
 const phrase='IT’S TIME TO ASK SAMI', selected=[3,13,19,20],centres=[.153,.413,.724,.942];
 if(sentence.dataset.text!=='__sami_morph__'){
  sentence.innerHTML=[...phrase].map((c,i)=>`<span data-index="${i}">${c===' '?'&nbsp;':c}</span>`).join('');sentence.dataset.text='__sami_morph__';sentence.style.opacity='1';
 }
 const spans=[...sentence.querySelectorAll('span')],stage=wordmarkStage.getBoundingClientRect();
 const arrive=smooth((t-38.75)/.42),charge=smooth((t-39.15)/.55),move=ease((t-39.8)/1.35),morph=smooth((t-41.05)/1.0);
 sentence.style.opacity=String(arrive*(1-.08*morph));
 spans.forEach((el,i)=>{
  const n=selected.indexOf(i);if(!el.dataset.x){const b=el.getBoundingClientRect();el.dataset.x=b.left+b.width/2;el.dataset.y=b.top+b.height/2}
  if(n<0){el.style.opacity=String(1-smooth((t-39.55)/.7));el.style.filter='none';return}
  el.classList.add('charged');
  const tx=stage.left+stage.width*centres[n],ty=stage.top+stage.height*.51,dx=(tx-+el.dataset.x)*move,dy=(ty-+el.dataset.y)*move;
  el.style.opacity=String(1-morph*.96);el.style.transform=`translate(${dx}px,${dy}px) scale(${lerp(1,.84,move)})`;el.style.filter=`brightness(${1+charge*.65})`;
 });
}
function brandProgress(t){
 const base=mode==='welcome'?5.08:41.45,p=smooth((t-base)/(mode==='welcome'?.54:.72));logo.style.opacity=String(p);logo.style.transform=`translateY(${lerp(8,0,p)}px) scale(${lerp(.985,1,p)})`;
 const svg=$('.logo-edge-pass'),q=clamp((t-base-(mode==='welcome'?.10:.06))/(mode==='welcome'?.78:1.05));svg.style.opacity=q>0&&q<1?'1':'0';svg.querySelectorAll('path').forEach(p=>p.style.strokeDashoffset=String(5-q*105));
 if(mode==='welcome'){welcomeUI.style.opacity='0';if(t>5.86)completeQuickLaunch();return}
 const ready=smooth((t-base-1.35)/.72);welcomeUI.style.opacity=String(ready);root.classList.toggle('ready',ready>.95)
}
function drawStructures(cam,t){
 if(mode!=='sales'||t<27||t>42.15)return;const master=smooth((t-27)/7.2)*(1-smooth((t-39.35)/2.2));if(master<=0)return;
 ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
 STRUCTURES.forEach((s,i)=>{const q=clamp((master-s.delay)/(1-s.delay));if(q<=0)return;const scale=1.42,y0=ENERGY_Y,y1=ENERGY_Y+s.h*1.18*smooth(q),cx=s.x*scale,cz=s.z*scale,x0=cx-s.w*.62,x1=cx+s.w*.62,z0=cz-s.d*.62,z1=cz+s.d*.62;
  const bottom=[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[x0,y0,z0]].map(p=>project(cam,p)).filter(Boolean),top=[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],[x0,y1,z0]].map(p=>project(cam,p)).filter(Boolean);
  const a=.12+.26*q,glow=.5+.5*Math.sin(t*4.2+i);ctx.strokeStyle=`rgba(111,255,177,${a})`;ctx.lineWidth=.72;ctx.shadowColor='#48ff98';ctx.shadowBlur=4+5*glow;if(bottom.length===5){path(bottom);ctx.stroke()}if(top.length===5){path(top);ctx.stroke()}
  [[x0,z0],[x1,z0],[x1,z1],[x0,z1]].forEach(([x,z])=>{const a=project(cam,[x,y0,z]),b=project(cam,[x,y1,z]);if(a&&b){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}})
 });ctx.restore()
}
function drawBlackout(t){
 if(mode!=='sales')return;let a=0;if(t>=19.55&&t<20.08)a=smooth((t-19.55)/.53);else if(t>=20.08&&t<21.95)a=1;else if(t>=21.95&&t<22.75)a=1-smooth((t-21.95)/.8);if(a>0){ctx.fillStyle=`rgba(0,0,0,${a})`;ctx.fillRect(0,0,w,h)}
}
function cameraFor(t){return camAt(t)}
function frame(now){
 if(!running)return;const t=(now-start)/1000,cam=cameraFor(t);drawGround(cam,t);if(mode==='sales'){drawDisconnectedLinks(cam,t);drawFragments(cam,t);}drawCrater(cam,t,mode==='sales'?0:cadProgress(t));drawImpactDebris(cam,t);drawIgnitionLine(cam,t);drawCad(cam,t);drawStructures(cam,t);drawPulse(cam,t);drawEnergyCore(cam,t);drawFinalPulse(cam,t);flash(t);drawBlackout(t);processWords(t);propositions(t);letterMorph(t);brandProgress(t);
 if((mode==='welcome'&&t<6)||(mode==='sales'&&t<44.5))raf=requestAnimationFrame(frame);else if(mode==='welcome')completeQuickLaunch();else finishAtWelcome()
}
function drawStill(){if(!ctx)return;const cam=camera([0,5.2,12.5],[0,.75,0],49);drawGround(cam,0)}
function resetVisual(){cancelAnimationFrame(raf);running=false;try{film?.pause()}catch{}if(film){film.classList.remove('active','holding');film.style.opacity='0'}canvas.style.opacity='1';words.replaceChildren();sentence.innerHTML='';sentence.dataset.text='';sentence.style.opacity='0';logo.style.opacity='0';logo.style.transform='translateY(8px) scale(.985)';welcomeUI.style.opacity='0';$('.logo-edge-pass').style.opacity='0';root.classList.remove('ready','film-mode');$('#cinemaClosed').hidden=true}
function stopNarration(reset=false){narrationActive=false;if(!salesVoice)return;try{salesVoice.pause();if(reset){narrationIndex=0;salesVoice.src=NARRATION[0];salesVoice.currentTime=0;salesVoice.load();}}catch{}}
function startNarration(reset=true){if(!salesVoice||!sound)return;if(reset){narrationIndex=0;salesVoice.src=NARRATION[0];salesVoice.currentTime=0;}narrationActive=true;salesVoice.muted=false;salesVoice.volume=.98;const p=salesVoice.play();if(p?.catch)p.catch(()=>{narrationActive=false;status.textContent='Narration could not start. Tap Sound off, then Sound on to retry.';});}
if(salesVoice){salesVoice.addEventListener('ended',()=>{narrationActive=false;});salesVoice.addEventListener('error',()=>{narrationActive=false;status.textContent='Narration could not load. The cinematic soundtrack will continue.';});}
async function ensureIntroFilm(){if(!film)return'';if(filmUrl)return filmUrl;if(filmLoading)return filmLoading;filmLoading=fetch('sami-intro-cinematic-v230.mp3',{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('intro film '+r.status);return r.arrayBuffer()}).then(buf=>{filmUrl=URL.createObjectURL(new Blob([buf],{type:'video/mp4'}));film.src=filmUrl;film.load();return filmUrl}).catch(err=>{filmLoading=null;throw err});return filmLoading;}
function stopAudio(){
 try{film?.pause()}catch{}for(const a of [welcomeAudio,salesAudio]){try{a.pause()}catch{}}try{salesVoice?.pause()}catch{}if(narrationTimer){clearTimeout(narrationTimer);narrationTimer=0}narrationActive=false
}
function playAudio(which){
 if(which!=='sales')return;stopAudio();salesAudio.currentTime=0;salesAudio.muted=!sound;salesAudio.volume=.46;const bp=salesAudio.play();if(bp?.catch)bp.catch(()=>{if(sound)status.textContent='Cinematic music could not start.'});
 if(salesVoice){salesVoice.src=NARRATION[0];salesVoice.load();salesVoice.currentTime=0;salesVoice.muted=!sound;salesVoice.volume=1;if(sound)startNarration(false)}
 if(sound){status.textContent='Cinematic soundtrack and narration enabled'}
}
async function playWelcomeFilm(){sound=false;filmFallback=true;root.classList.remove('film-mode');if(film){film.classList.remove('active','holding');film.style.opacity='0'}canvas.style.opacity='1';drawStill();await new Promise(r=>requestAnimationFrame(()=>r()));start=performance.now();running=true;raf=requestAnimationFrame(frame)}
async function play(which='welcome',options={}){prepareGeometry();resetVisual();mode=which;quickLaunchDone=false;welcomeExit=which==='welcome'?(options.after||'auto'):'menu';root.hidden=false;$('#app').inert=true;$('#app').setAttribute('aria-hidden','true');gate.classList.add('dismissed');if(which==='welcome'){const replaying=welcomeExit==='menu';$('#launchSkip').hidden=!replaying;$('#launchSoundBtn').hidden=true;if(replaying)$('#launchSkip').textContent='Back to workspace';await playWelcomeFilm();return}$('#launchSkip').hidden=false;$('#launchSoundBtn').hidden=false;$('#launchSkip').textContent='Back to welcome';start=performance.now();running=true;prepareWords();playAudio(which);raf=requestAnimationFrame(frame)}

let quickLaunchDone=false,welcomeExit='auto';
async function completeQuickLaunch(){
 if(quickLaunchDone||mode!=='welcome')return;quickLaunchDone=true;cancelAnimationFrame(raf);running=false;logo.style.opacity='1';logo.style.transform='translateY(0) scale(1)';$('.logo-edge-pass').style.opacity='0';await new Promise(r=>setTimeout(r,120));
 finishAtWelcome(false)
}
function finishAtWelcome(fromFilm=false){
 cancelAnimationFrame(raf);running=false;for(const a of [salesAudio,welcomeAudio]){try{a.pause()}catch{}}try{salesVoice?.pause()}catch{}narrationActive=false;words.replaceChildren();sentence.innerHTML='';sentence.style.opacity='0';
 if(fromFilm&&film&&!filmFallback){try{film.pause()}catch{}film.classList.add('holding');film.style.opacity='1';canvas.style.opacity='0';logo.style.opacity='0';root.classList.add('film-mode')}
 else{try{film?.pause()}catch{}if(film){film.classList.remove('active','holding');film.style.opacity='0'}root.classList.remove('film-mode');canvas.style.opacity='1';logo.style.opacity='1';logo.style.transform='translateY(0) scale(1)';drawStill()}
 welcomeUI.style.opacity='1';$('.logo-edge-pass').style.opacity='0';root.classList.add('ready');$('#launchSkip').hidden=true;$('#launchSoundBtn').hidden=true
}
async function enter(){resetVisual();stopAudio();root.hidden=true;$('#app').inert=false;$('#app').setAttribute('aria-hidden','false');await window.SAMIWorkspace?.ready;if(localStorage.getItem('sami.tutorial.seen')!=='yes')window.SAMIWorkspace?.runAction('tutorial')}
async function startWithSound(){sound=true;$('#launchSoundBtn').textContent='Sound on';status.textContent='Cinematic sound enabled';await play(location.hash==='#why'?'sales':'welcome',{after:'auto'})}
async function shutdown(){resetVisual();root.hidden=false;$('#app').inert=true;$('#app').setAttribute('aria-hidden','true');gate.classList.add('dismissed');$('#launchSkip').hidden=true;$('#launchSoundBtn').hidden=true;logo.style.opacity='1';logo.style.transform='translateY(0) scale(1)';await logo.animate([{opacity:1,filter:'brightness(1)'},{opacity:.5,filter:'brightness(1.5)',offset:.38},{opacity:0,filter:'brightness(.25)'}],{duration:1800,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).finished.catch(()=>{});logo.style.opacity='0';$('#cinemaClosed').hidden=false}
$('#startSound').onclick=startWithSound;$('#startQuiet').onclick=async()=>{sound=false;$('#launchSoundBtn').textContent='Sound off';await play(location.hash==='#why'?'sales':'welcome',{after:'auto'})};$('#launchSkip').onclick=()=>{if(mode==='welcome'&&welcomeExit==='menu')return enter();return root.classList.contains('ready')?enter():finishAtWelcome(false)};$('#launchSoundBtn').onclick=async()=>{sound=!sound;$('#launchSoundBtn').textContent=sound?'Sound on':'Sound off';if(mode==='welcome'&&film&&!filmFallback){film.muted=!sound;if(sound&&running&&film.paused)film.play().catch(()=>{});return}salesAudio.muted=!sound;if(salesVoice)salesVoice.muted=!sound;if(!sound){try{salesVoice?.pause()}catch{}narrationActive=false;}else{salesAudio.play().catch(()=>{});if(mode==='sales'&&salesVoice){if(!salesVoice.src||!salesVoice.src.includes('44a2ca403f624d8ba1787a51fa47c06e'))salesVoice.src=NARRATION[0];const elapsed=Math.max(0,(performance.now()-start)/1000-.5);try{if(Number.isFinite(salesVoice.duration)&&salesVoice.duration>0)salesVoice.currentTime=Math.min(elapsed,salesVoice.duration-.1)}catch{}narrationActive=true;salesVoice.play().catch(()=>{narrationActive=false;});}}};if(film){film.addEventListener('ended',()=>{if(mode==='welcome')finishAtWelcome(true)});film.addEventListener('error',()=>{if(mode==='welcome'&&!filmFallback){filmFallback=true;root.classList.remove('film-mode');film.style.opacity='0';canvas.style.opacity='1';start=performance.now();running=true;raf=requestAnimationFrame(frame)}})}$('#enterSami').onclick=enter;$('#whySami').onclick=()=>{sound=true;$('#launchSoundBtn').textContent='Sound on';play('sales');};$('#reopenSami').onclick=()=>{gate.classList.remove('dismissed');$('#cinemaClosed').hidden=true;logo.style.opacity='0';welcomeUI.style.opacity='0';if(film){film.classList.remove('active','holding');film.style.opacity='0'}root.classList.remove('film-mode');$('#launchSkip').hidden=true;$('#launchSoundBtn').hidden=true};
window.SAMICinema={play,shutdown,enter};addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){suspendedAt=performance.now();cancelAnimationFrame(raf);if(mode==='welcome'&&film&&!filmFallback){try{film.pause()}catch{}}else stopAudio();}else if(suspendedAt&&running){const pausedFor=performance.now()-suspendedAt;suspendedAt=0;if(mode==='welcome'&&film&&!filmFallback){film.muted=!sound;film.play().catch(()=>{})}else{start+=pausedFor;const elapsed=(performance.now()-start)/1000;salesAudio.currentTime=Math.min(elapsed,Number.isFinite(salesAudio.duration)?salesAudio.duration:elapsed);salesAudio.play().catch(()=>{});if(mode==='sales'&&salesVoice&&sound){narrationActive=true;salesVoice.play().catch(()=>{narrationActive=false;})}raf=requestAnimationFrame(frame)}}});
prepareGeometry();resize();sound=false;document.documentElement.classList.add('intro-running');root.hidden=false;$('#app').inert=true;$('#app').setAttribute('aria-hidden','true');gate.classList.add('dismissed');$('#launchSkip').hidden=true;$('#launchSoundBtn').hidden=true;requestAnimationFrame(()=>requestAnimationFrame(()=>play('welcome',{after:'auto'})));
})();
