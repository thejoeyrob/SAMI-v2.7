(()=>{
'use strict';
const $=s=>document.querySelector(s),root=$('#samiLaunch'),canvas=$('#samiCinema'),film=$('#introFilm'),ctx=canvas?.getContext('2d',{alpha:false}),gate=$('#launchStartGate'),brand=$('#brandResolve'),logo=$('#finalWordmark'),wordmarkStage=$('#wordmarkStage'),welcomeUI=$('.welcome-ui'),words=$('#pitchWords'),sentence=$('#pitchLine'),status=$('#audioStatus');
const welcomeAudio=$('#welcomeAudio'),salesAudio=$('#salesAudio');
const isInstalled=()=>matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;
if(!isInstalled())document.documentElement.classList.add('install-required');
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
const PROMO_DURATION=73.15,VOICE_START=6.85,FRAGMENT_FAIL=30.75,CLEAN_START=34.10,CAD_RETRACT=59.45,CAD_END=63.00,WORK_SMARTER=64.10,TIME_TO=66.00,ASK_SAMI=67.15,LOGO_MORPH=68.25,SIGNATURE_START=69.35,SIGNATURE_END=71.40,TEXT_LEAD=.90;
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
 // Fragmented act: low oblique drift through tired, disconnected sources while the narration starts later.
 if(t<FRAGMENT_FAIL){const p=ease(t/FRAGMENT_FAIL),a=lerp(-1.42,.88,p),r=lerp(7.0,19.2,p),y=lerp(.72,7.0,p);return camera([Math.cos(a)*r,y,Math.sin(a)*r],[lerp(-2.8,.15,p),lerp(-.26,-.12,p),lerp(6.8,.2,p)],lerp(60,48,p))}
 // Failure/reset.
 if(t<CLEAN_START){const p=ease((t-FRAGMENT_FAIL)/(CLEAN_START-FRAGMENT_FAIL));return camera([lerp(11.0,5.4,p),lerp(7.0,2.1,p),lerp(12.0,6.1,p)],[0,-.18,0],lerp(48,50,p))}
 // Clean SAMI act: one full low-to-high drone orbit, always aimed at the central glow.
 if(t<55.75){const p=ease((t-CLEAN_START)/(55.75-CLEAN_START)),angle=-Math.PI*.66+Math.PI*2*p,r=lerp(5.6,44.8,p),y=lerp(1.18,34.6,p);return camera([Math.cos(angle)*r,y,Math.sin(angle)*r],[0,lerp(-.23,.14,p),0],lerp(55,48.5,p))}
 // Huge wide hero view.
 if(t<CAD_RETRACT){const p=ease((t-55.75)/(CAD_RETRACT-55.75)),angle=Math.PI*1.34+Math.PI*.18*p,r=lerp(44.8,51.0,p),y=lerp(34.6,39.0,p);return camera([Math.cos(angle)*r,y,Math.sin(angle)*r],[0,.14,0],lerp(48.5,50,p))}
 // Move back in while the completed CAD field retracts fully.
 if(t<CAD_END){const p=ease((t-CAD_RETRACT)/(CAD_END-CAD_RETRACT)),angle=Math.PI*1.52+Math.PI*.32*p,r=lerp(51.0,10.2,p),y=lerp(39.0,7.1,p);return camera([Math.cos(angle)*r,y,Math.sin(angle)*r],[0,lerp(.14,.02,p),0],lerp(50,45.5,p))}
 // Calm close view for the spoken closing lines and logo morph.
 if(t<SIGNATURE_START){const p=ease((t-CAD_END)/(SIGNATURE_START-CAD_END));return camera([lerp(-2.6,0,p),lerp(7.1,5.4,p),lerp(9.2,12.8,p)],[0,lerp(.02,.74,p),0],lerp(45.5,49,p))}
 // Fast 360 signature orbit after the logo surge.
 if(t<SIGNATURE_END){const p=ease((t-SIGNATURE_START)/(SIGNATURE_END-SIGNATURE_START)),angle=-Math.PI*.35+Math.PI*2*p,r=lerp(12.5,18.2,p),y=lerp(5.2,10.2,p);return camera([Math.cos(angle)*r,y,Math.sin(angle)*r],[0,.15,0],lerp(49,52,p))}
 return camera([0,5.4,12.8],[0,.74,0],49)
}
function drawGround(cam,t){
 ctx.fillStyle='#020405';ctx.fillRect(0,0,w,h);
 const clean=mode!=='sales'||t>CLEAN_START-.2,span=mode==='sales'&&t>CLEAN_START-.2?58:30,zNear=mode==='sales'&&t>CLEAN_START-.2?-56:-30,zFar=mode==='sales'&&t>CLEAN_START-.2?48:22;
 const poly=[[-span,-.32,zNear],[span,-.32,zNear],[span,-.32,zFar],[-span,-.32,zFar]].map(p=>project(cam,p)).filter(Boolean);
 if(poly.length===4){const g=ctx.createLinearGradient(0,Math.min(...poly.map(p=>p.y)),0,h);if(clean){g.addColorStop(0,'#07120f');g.addColorStop(.36,'#0b1213');g.addColorStop(.75,'#06100d');g.addColorStop(1,'#020607')}else{g.addColorStop(0,'#090d0e');g.addColorStop(.42,'#0b0f10');g.addColorStop(.78,'#06090a');g.addColorStop(1,'#020405')}ctx.fillStyle=g;path(poly);ctx.fill()}
 ctx.save();ctx.globalAlpha=clean?.038:.022;ctx.strokeStyle=clean?'#7ee8ac':'#7b8783';ctx.lineWidth=.7;for(let z=zNear+4;z<=zFar;z+=clean?5:4){const a=project(cam,[-span,-.305,z]),b=project(cam,[span,-.305,z]);if(a&&b){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}ctx.restore();
 const haze=ctx.createRadialGradient(w*.5,h*.56,0,w*.5,h*.56,Math.max(w,h)*.62);if(clean){haze.addColorStop(0,'rgba(25,67,51,.075)');haze.addColorStop(.5,'rgba(8,25,20,.025)')}else{haze.addColorStop(0,'rgba(47,55,52,.045)');haze.addColorStop(.5,'rgba(19,24,23,.02)')}haze.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
}
function circleProjected(cam,r,y=-.29,n=72){const ps=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,p=project(cam,[Math.cos(a)*r,y,Math.sin(a)*r]);if(p)ps.push(p)}return ps}
function roughCircleProjected(cam,r,y=-.29,phase=0,n=52){const ps=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,noise=1+.09*Math.sin(a*7+phase)+.045*Math.sin(a*13-phase*1.7),rr=r*noise,p=project(cam,[Math.cos(a)*rr,y,Math.sin(a)*rr]);if(p)ps.push(p)}return ps}
function drawCrater(cam,t,energy){if(mode==='sales')return;const impact=2.78;if(t<impact-.03)return;const active=t>=impact,build=active?smooth((t-impact)/.48):0,rr=lerp(.08,.70,build),c=roughCircleProjected(cam,rr,ENERGY_Y,.8);if(c.length>2){ctx.save();ctx.fillStyle=active?'#000101':'#050a08';path(c);ctx.fill();const inner=roughCircleProjected(cam,rr*.72,ENERGY_Y,2.1);if(inner.length>2){ctx.fillStyle='#000';path(inner);ctx.fill()}for(let pass=0;pass<3;pass++){ctx.strokeStyle=pass===0?`rgba(44,255,135,${.045*energy})`:pass===1?`rgba(66,240,144,${.15*energy})`:`rgba(172,255,207,${.32*energy})`;ctx.lineWidth=pass===0?13:pass===1?4:1;ctx.shadowColor='#37ff8b';ctx.shadowBlur=pass===0?24:pass===1?9:0;path(c);ctx.stroke()}ctx.shadowBlur=0;ctx.strokeStyle=`rgba(165,255,204,${.12*energy})`;ctx.lineWidth=.7;for(const phase of [1.4,2.7]){const rim=roughCircleProjected(cam,rr*(1.06+phase*.012),ENERGY_Y,phase);path(rim);ctx.stroke()}ctx.restore();}}
function drawFragments(cam,t){
 if(mode!=='sales'||t<.25||t>FRAGMENT_FAIL+1.25)return;
 const voiceFade=t<VOICE_START?1:lerp(1,.22,smooth((t-VOICE_START)/3.4)),collapse=smooth((t-(FRAGMENT_FAIL-.65))/1.55);
 ctx.save();
 for(const f of fragments){
  const revealAt=.45+(f.seed%11)*.38+Math.floor(f.seed/11)*.14,reveal=smooth((t-revealAt)/.42);if(reveal<=0)continue;
  const pull=collapse,fade=(1-collapse)*reveal,period=1.9+(f.seed%5)*.23,cy=((t+f.phase)%period)/period;
  const servicePulse=Math.max(0,1-Math.abs(cy-.13)/.11),failFlick=(.55+.45*Math.sin(t*(7.5+(f.seed%4)*1.7)+f.phase))*servicePulse;
  const initialSurge=Math.max(0,1-Math.abs((t-revealAt)-.18)/.22),surge=clamp(initialSurge+failFlick);
  const x=lerp(f.x,0,pull),z=lerp(f.z,0,pull),sc=lerp(1,.06,pull),rot=f.rot*(1-pull)+Math.sin(t*.22+f.phase)*.025*(1-pull),y=ENERGY_Y+f.lift*(.20+.80*reveal)*(1-pull);
  const cs=Math.cos(rot),sn=Math.sin(rot),hw=f.w*.5*sc,hd=f.d*.5*sc,world=(dx,dz)=>[x+dx*cs-dz*sn,y,z+dx*sn+dz*cs];
  const corners=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([dx,dz])=>project(cam,world(dx,dz))).filter(Boolean);if(corners.length!==4)continue;
  const baseAlpha=(t<VOICE_START?.22:.11)*voiceFade*fade,edgeAlpha=(baseAlpha+.42*surge*fade);
  const fills=['rgba(10,14,15,','rgba(18,17,15,','rgba(12,16,18,','rgba(19,15,15,','rgba(15,16,18,'],strokes=['122,136,132','177,145,94','111,137,160','171,108,96','148,157,159'];
  ctx.fillStyle=fills[f.kind%fills.length]+Math.min(.45,baseAlpha*2.35)+')';path(corners);ctx.fill();
  ctx.save();ctx.shadowColor=surge>.12?(f.kind%3===1?'rgba(255,199,116,.86)':'rgba(210,234,226,.84)'):'transparent';ctx.shadowBlur=surge*24;ctx.strokeStyle=`rgba(${strokes[f.kind%strokes.length]},${Math.min(.88,edgeAlpha)})`;ctx.lineWidth=.65+surge*.85;path(corners);ctx.stroke();ctx.restore();
  // Misregistered duplicate: tired version drift.
  if(f.seed%4===1&&collapse<.7){ctx.save();ctx.globalAlpha=.22*voiceFade*fade;ctx.translate((f.seed%2?1:-1)*(4+f.seed%5),(f.seed%3-1)*4);ctx.strokeStyle='rgba(184,109,94,.74)';ctx.lineWidth=.55;path(corners);ctx.stroke();ctx.restore()}
  const a=corners[0],b=corners[1],c=corners[2],d=corners[3],edge=(u,v,q)=>({x:lerp(u.x,v.x,q),y:lerp(u.y,v.y,q)}),contentAlpha=Math.min(.72,baseAlpha*2.3+surge*.24);
  for(let j=1;j<=3;j++){const q=.18+j*.19,l=edge(a,d,q),r=edge(b,c,q),end=.42+((f.seed+j)%5)*.1;ctx.strokeStyle=`rgba(190,201,196,${contentAlpha*(.18+j*.06)})`;ctx.lineWidth=.42;ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(lerp(l.x,r.x,end),lerp(l.y,r.y,end));ctx.stroke()}
  // Electrical service/frazzle sparks: short-lived, non-network pulses through the objects.
  if(surge>.16){const cx=(a.x+b.x+c.x+d.x)/4,cyy=(a.y+b.y+c.y+d.y)/4;ctx.save();ctx.globalCompositeOperation='screen';for(let k=0;k<3;k++){const ang=f.phase+k*2.1+t*(2.2+k*.4),len=(8+k*5)*surge;ctx.strokeStyle=k===1?`rgba(255,204,132,${.50*surge})`:`rgba(220,239,231,${.58*surge})`;ctx.lineWidth=.55+k*.12;ctx.shadowColor='rgba(230,246,239,.8)';ctx.shadowBlur=7*surge;ctx.beginPath();ctx.moveTo(cx+Math.cos(ang)*3,cyy+Math.sin(ang)*3);ctx.lineTo(cx+Math.cos(ang)*len,cyy+Math.sin(ang)*len);ctx.stroke()}ctx.restore()}
 }
 ctx.restore();
}
function drawDisconnectedLinks(cam,t){
 // Deliberately restrained: the disjointed idea is carried by the failing source objects, not a line network.
 if(mode!=='sales'||t<VOICE_START+2.5||t>FRAGMENT_FAIL-.4||fragments.length<8)return;
 const fade=(1-smooth((t-(FRAGMENT_FAIL-1.8))/1.4))*.30;if(fade<=0)return;ctx.save();ctx.lineCap='round';
 const pairs=[[0,5],[7,14],[2,18],[12,27],[6,30]];pairs.forEach(([ia,ib],idx)=>{const A=fragments[ia],B=fragments[ib],pa=project(cam,[A.x,ENERGY_Y+A.lift*.28,A.z]),pb=project(cam,[B.x,ENERGY_Y+B.lift*.28,B.z]);if(!pa||!pb)return;const phase=(Math.sin(t*7.2+idx*2.1)+1)/2,cut=.24+.16*phase,ex=lerp(pa.x,pb.x,cut),ey=lerp(pa.y,pb.y,cut);ctx.setLineDash([2,8]);ctx.lineDashOffset=-t*15;ctx.strokeStyle=`rgba(160,151,135,${.16*fade})`;ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(ex,ey);ctx.stroke();});ctx.restore();
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
 if(t<CLEAN_START+.18)return 0;
 if(t<47.0)return ease((t-(CLEAN_START+.18))/(47.0-(CLEAN_START+.18)));
 if(t<CAD_RETRACT)return 1;
 if(t<CAD_END)return 1-smooth((t-CAD_RETRACT)/(CAD_END-CAD_RETRACT));
 return 0
}
function drawCad(cam,t){
 const p=cadProgress(t);if(p<=0)return;const welcome=mode==='welcome',network=welcome?cad:promoCad,retract=(welcome&&t>=3.78)||(!welcome&&t>=CAD_RETRACT),active=network.length*p;
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
 const xs=mode==='welcome'?[4.98,5.24]:[FRAGMENT_FAIL+.18,FRAGMENT_FAIL+.46,LOGO_MORPH+.56,LOGO_MORPH+.92];let a=0;
 for(const x of xs){const d=Math.abs(t-x);if(d<.2)a=Math.max(a,(1-d/.2)*(mode==='welcome'||x<33?.58:.34))}
 if(a){ctx.fillStyle=`rgba(203,255,224,${a})`;ctx.fillRect(0,0,w,h)}
}
function drawPulse(cam,t){
 const center=project(cam,ENERGY_ORIGIN);if(!center)return;let energy=0;
 if(mode==='welcome')energy=t<.12?0:t<.75?.52*smooth((t-.12)/.63):t<4.75?.32+.24*Math.sin(t*8.8)**2:.52*(1-smooth((t-4.75)/.46));
 else if(t>CLEAN_START-.1&&t<LOGO_MORPH+1.15)energy=(.24+.30*Math.sin(t*5.5)**2)*smooth((t-(CLEAN_START-.1))/1.05)*(1-smooth((t-(LOGO_MORPH+.55))/.60));
 if(energy<=0)return;const r=95+energy*170,g=ctx.createRadialGradient(center.x,center.y,0,center.x,center.y,r);
 g.addColorStop(0,`rgba(54,255,140,${.13*energy})`);g.addColorStop(.26,`rgba(40,232,124,${.09*energy})`);g.addColorStop(.58,`rgba(30,200,110,${.035*energy})`);g.addColorStop(1,'rgba(30,200,110,0)');
 ctx.fillStyle=g;ctx.fillRect(center.x-r,center.y-r,r*2,r*2)
}
function drawEnergyCore(cam,t){
 const c=project(cam,ENERGY_ORIGIN);if(!c)return;let a=0;
 if(mode==='welcome'){if(t>.12&&t<5.18)a=smooth((t-.12)/.45)*(1-smooth((t-4.82)/.36))}
 else if(t>CLEAN_START-.12&&t<LOGO_MORPH+1.2)a=.88*smooth((t-(CLEAN_START-.12))/.72)*(1-smooth((t-(LOGO_MORPH+.55))/.65));
 if(a<=.01)return;const pulse=.76+.24*Math.sin(t*7.5)**2,r=lerp(12,25,pulse);
 ctx.save();const g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,r);g.addColorStop(0,`rgba(245,255,249,${.96*a})`);g.addColorStop(.16,`rgba(151,255,198,${.88*a})`);g.addColorStop(.44,`rgba(54,255,139,${.44*a})`);g.addColorStop(1,'rgba(45,255,137,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(177,255,211,${.28*a})`;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(c.x,c.y,lerp(6,10,pulse),0,Math.PI*2);ctx.stroke();ctx.restore()
}
function drawFinalPulse(cam,t){
 const c=project(cam,ENERGY_ORIGIN);if(!c)return;const moments=mode==='welcome'?[4.82,5.05]:[LOGO_MORPH+.48,LOGO_MORPH+.84];
 for(const at of moments){const age=t-at;if(age<0||age>.34)continue;const p=smooth(age/.34),a=(1-p)*.9,len=lerp(16,Math.min(w*.46,430),p);const g=ctx.createLinearGradient(c.x-len,c.y,c.x+len,c.y);g.addColorStop(0,'rgba(80,255,158,0)');g.addColorStop(.42,`rgba(105,255,178,${a*.48})`);g.addColorStop(.5,`rgba(238,255,246,${a})`);g.addColorStop(.58,`rgba(105,255,178,${a*.48})`);g.addColorStop(1,'rgba(80,255,158,0)');ctx.save();ctx.strokeStyle=g;ctx.lineWidth=lerp(5.5,.8,p);ctx.shadowColor='#5cff9f';ctx.shadowBlur=20*(1-p);ctx.beginPath();ctx.moveTo(c.x-len,c.y);ctx.lineTo(c.x+len,c.y);ctx.stroke();ctx.restore()}
}
function drawIgnitionLine(cam,t){
 if(mode!=='sales')return;const age=t-(CLEAN_START+.18);if(age<0||age>.92)return;const c=project(cam,ENERGY_ORIGIN);if(!c)return;
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
 if(mode!=='sales')return;const collapse=smooth((t-(FRAGMENT_FAIL-.8))/1.25);
 [...words.querySelectorAll('.process-word')].forEach(el=>{const at=+el.dataset.start,d=+el.dataset.duration,p=t-at,arrive=smooth(p/.28),foreground=1-smooth((p-d)/.42),settled=.10*smooth((p-d+.22)/.65),o=arrive*Math.max(foreground,settled)*(1-collapse);el.style.opacity=String(Math.max(0,o));const drift=lerp(12,-10,clamp(p/(d+1.1))),scale=foreground>.4?lerp(.97,1.035,clamp(p/d)):lerp(.94,.76,clamp((p-d)/2.7));el.style.transform=`translate(-50%,calc(-50% + ${drift}px)) scale(${scale})`;el.style.filter=`blur(${foreground>.3?0:Math.min(1.1,Math.max(0,p-d)*.2)}px)`});
 [...words.querySelectorAll('.process-data')].forEach((el,i)=>{const born=VOICE_START+4.0-TEXT_LEAD+(i%70)*.10+Math.floor(i/70)*.32,p=t-born,density=clamp((t-(VOICE_START+5))/13),o=smooth(p/.7)*(.012+.105*density)*(1-collapse);el.style.opacity=String(Math.max(0,o));el.style.transform=`translateY(${((t*7+i*3)%84)-42}px) scale(${.80+.14*((i%5)/4)})`})
}
function prepareWords(){
 words.replaceChildren();
 const timed=[
  [6.95,2.7,'BUILDING A SITE PLAN'],[10.1,2.3,'MULTIPLE SOURCES'],[12.8,2.15,'CHASING INFORMATION'],[15.2,2.15,'WAITING FOR ANSWERS'],[17.8,2.55,'EVERY DELAY COSTS TIME'],[21.0,2.75,'EVERY DELAY COSTS MONEY']
 ];
 timed.forEach(([at,d,text],i)=>{const el=document.createElement('div');el.className='process-word';el.textContent=text;el.style.setProperty('--x',(16+(i*31)%68)+'%');el.style.setProperty('--y',(18+(i*23)%60)+'%');el.dataset.start=String(at-TEXT_LEAD);el.dataset.duration=d;words.append(el)});
 for(let i=0;i<180;i++){const el=document.createElement('div');el.className='process-data';el.textContent=PROCESS[i%PROCESS.length]+' / '+String((i*314159)%100000).padStart(5,'0');el.style.setProperty('--x',(3+(i*43)%94)+'%');el.style.setProperty('--y',(7+(i*23)%86)+'%');words.append(el)}
}
function setSentence(text,opacity){if(sentence.dataset.text!==text){sentence.innerHTML='';sentence.textContent=text;sentence.dataset.text=text}sentence.style.opacity=String(opacity)}
function propositions(t){
 if(mode!=='sales')return;
 const items=[
  [26.0,30.15,'WHAT IF EVERYTHING YOU NEED WAS IN ONE PLACE?'],
  [34.30,36.10,'INTRODUCING SAMI'],
  [36.15,38.75,'SPATIAL ANALYSIS · MAPPING INTELLIGENCE'],
  [39.00,40.55,'FIND YOUR SITE'],
  [40.75,42.55,'DEFINE YOUR WORKING AREA'],
  [42.75,45.05,'BUILD TRUE-SCALE SITE PLANS'],
  [45.15,46.35,'ADD ASSETS'],
  [46.45,48.10,'ASSESS CONSTRAINTS'],
  [48.20,49.45,'PLAN ACCESS'],
  [49.55,50.95,'HGV ROUTES'],
  [51.05,53.20,'ALL WITHIN ONE WORKSPACE'],
  [53.35,55.15,'VOICE OR TEXT'],
  [55.25,58.80,'ASK SAMI TO MAKE THE CHANGES FOR YOU'],
  [WORK_SMARTER,65.70,'IT’S TIME TO WORK SMARTER']
 ];
 const x=items.find(([a,b])=>t>=a-TEXT_LEAD&&t<b-TEXT_LEAD);
 if(x){const[a,b,text]=x;const aa=a-TEXT_LEAD,bb=b-TEXT_LEAD;setSentence(text,smooth((t-aa)/.30)*(1-smooth((t-bb+.27)/.27)))}
 else if(t<TIME_TO-TEXT_LEAD)setSentence('',0)
}
function letterMorph(t){
 if(mode!=='sales'||t<TIME_TO-TEXT_LEAD)return;
 const selectedPhrase='…ASK SAMI',selected=[5,6,7,8],centres=[.153,.413,.724,.942],pauseEnd=66.78-TEXT_LEAD,pauseFade=66.66-TEXT_LEAD,askAt=ASK_SAMI-TEXT_LEAD,morphAt=LOGO_MORPH-TEXT_LEAD;
 if(t<pauseEnd){
  if(sentence.dataset.text!=='__time_pause__'){sentence.innerHTML=[...'IT’S TIME TO…'].map(c=>`<span>${c===' '?'&nbsp;':c}</span>`).join('');sentence.dataset.text='__time_pause__';}
  const show=smooth((t-(TIME_TO-TEXT_LEAD))/.28)*(1-smooth((t-pauseFade)/.20));sentence.style.opacity=String(show);return;
 }
 if(t<askAt){sentence.style.opacity='0';return}
 if(sentence.dataset.text!=='__sami_morph__'){sentence.innerHTML=[...selectedPhrase].map((c,i)=>`<span data-index="${i}">${c===' '?'&nbsp;':c}</span>`).join('');sentence.dataset.text='__sami_morph__';sentence.style.opacity='1'}
 const spans=[...sentence.querySelectorAll('span')],stage=wordmarkStage.getBoundingClientRect(),arrive=smooth((t-askAt)/.24),charge=smooth((t-(askAt+.28))/.30),move=ease((t-(askAt+.52))/1.05),morph=smooth((t-morphAt)/.76);
 sentence.style.opacity=String(arrive*(1-.08*morph));
 spans.forEach((el,i)=>{const n=selected.indexOf(i);if(!el.dataset.x){const b=el.getBoundingClientRect();el.dataset.x=b.left+b.width/2;el.dataset.y=b.top+b.height/2}if(n<0){el.style.opacity=String(1-smooth((t-(askAt+.34))/.46));el.style.filter='none';return}el.classList.add('charged');const tx=stage.left+stage.width*centres[n],ty=stage.top+stage.height*.51,dx=(tx-+el.dataset.x)*move,dy=(ty-+el.dataset.y)*move;el.style.opacity=String(1-morph*.98);el.style.transform=`translate(${dx}px,${dy}px) scale(${lerp(1,.84,move)})`;el.style.filter=`brightness(${1+charge*.86})`})
}
function brandProgress(t){
 const base=mode==='welcome'?5.08:LOGO_MORPH+.12,p=smooth((t-base)/(mode==='welcome'?.54:.76));logo.style.opacity=String(p);logo.style.transform=`translateY(${lerp(8,0,p)}px) scale(${lerp(.985,1,p)})`;
 const svg=$('.logo-edge-pass'),q=clamp((t-base-(mode==='welcome'?.10:.05))/(mode==='welcome'?.78:.94));svg.style.opacity=q>0&&q<1?'1':'0';svg.querySelectorAll('path').forEach(p=>p.style.strokeDashoffset=String(5-q*105));
 if(mode==='welcome'){welcomeUI.style.opacity='0';if(t>5.86)completeQuickLaunch();return}
 const ready=smooth((t-72.05)/.56);welcomeUI.style.opacity=String(ready);root.classList.toggle('ready',ready>.92)
}
function drawStructures(cam,t){
 if(mode!=='sales'||t<41.0||t>CAD_END)return;const master=smooth((t-41.0)/7.2)*(1-smooth((t-(CAD_RETRACT-.5))/3.1));if(master<=0)return;
 ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
 STRUCTURES.forEach((s,i)=>{const q=clamp((master-s.delay)/(1-s.delay));if(q<=0)return;const scale=1.42,y0=ENERGY_Y,y1=ENERGY_Y+s.h*1.18*smooth(q),cx=s.x*scale,cz=s.z*scale,x0=cx-s.w*.62,x1=cx+s.w*.62,z0=cz-s.d*.62,z1=cz+s.d*.62;
  const bottom=[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[x0,y0,z0]].map(p=>project(cam,p)).filter(Boolean),top=[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],[x0,y1,z0]].map(p=>project(cam,p)).filter(Boolean);
  const a=.12+.26*q,glow=.5+.5*Math.sin(t*4.2+i);ctx.strokeStyle=`rgba(111,255,177,${a})`;ctx.lineWidth=.72;ctx.shadowColor='#48ff98';ctx.shadowBlur=4+5*glow;if(bottom.length===5){path(bottom);ctx.stroke()}if(top.length===5){path(top);ctx.stroke()}
  [[x0,z0],[x1,z0],[x1,z1],[x0,z1]].forEach(([x,z])=>{const a=project(cam,[x,y0,z]),b=project(cam,[x,y1,z]);if(a&&b){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}})
 });ctx.restore()
}
function drawBlackout(t){
 if(mode!=='sales')return;let a=0;
 if(t>=FRAGMENT_FAIL&&t<FRAGMENT_FAIL+.55)a=smooth((t-FRAGMENT_FAIL)/.55);
 else if(t>=FRAGMENT_FAIL+.55&&t<CLEAN_START-1.15)a=1;
 else if(t>=CLEAN_START-1.15&&t<CLEAN_START)a=1-smooth((t-(CLEAN_START-1.15))/1.15);
 else if(t>=SIGNATURE_END-.28&&t<SIGNATURE_END+.16)a=smooth((t-(SIGNATURE_END-.28))/.44)*.96;
 else if(t>=SIGNATURE_END+.16)a=.96*(1-smooth((t-(SIGNATURE_END+.22))/.44));
 if(a>0){ctx.fillStyle=`rgba(0,0,0,${a})`;ctx.fillRect(0,0,w,h)}
}
function drawSignatureCad(cam,t){
 if(mode!=='sales'||t<SIGNATURE_START||t>SIGNATURE_END)return;
 const age=t-SIGNATURE_START,phase=age/(SIGNATURE_END-SIGNATURE_START),p=phase<.46?smooth(phase/.46):1-smooth((phase-.46)/.54),network=promoCad,active=network.length*clamp(p);
 for(let i=0;i<network.length;i++){const order=phase<.46?i:(network.length-1-i),local=clamp(active-order);if(local<=0)continue;const c=network[i],ps=partialPolyline(cam,c.pts,Math.max(.001,local));if(ps.length<2)continue;ctx.save();ctx.lineJoin='round';ctx.lineCap='round';const surge=.5+.5*Math.sin(t*20-i*.7);ctx.strokeStyle=c.major?`rgba(142,255,191,${.48+.4*surge})`:`rgba(72,245,143,${.24+.42*surge})`;ctx.lineWidth=c.major?1.8:.75;ctx.shadowColor='#47ff96';ctx.shadowBlur=c.major?12:5;path(ps);ctx.stroke();ctx.restore()}
}
function cameraFor(t){return camAt(t)}
function frame(now){
 if(!running)return;const t=(now-start)/1000,cam=cameraFor(t);drawGround(cam,t);if(mode==='sales'){drawDisconnectedLinks(cam,t);drawFragments(cam,t);}drawCrater(cam,t,mode==='sales'?0:cadProgress(t));drawImpactDebris(cam,t);drawIgnitionLine(cam,t);drawCad(cam,t);drawStructures(cam,t);drawSignatureCad(cam,t);drawPulse(cam,t);drawEnergyCore(cam,t);drawFinalPulse(cam,t);flash(t);drawBlackout(t);processWords(t);propositions(t);letterMorph(t);brandProgress(t);
 if((mode==='welcome'&&t<6)||(mode==='sales'&&t<PROMO_DURATION))raf=requestAnimationFrame(frame);else if(mode==='welcome')completeQuickLaunch();else finishAtWelcome()
}
function drawStill(){if(!ctx)return;const cam=camera([0,5.2,12.5],[0,.75,0],49);drawGround(cam,0)}
function resetVisual(){cancelAnimationFrame(raf);running=false;try{film?.pause()}catch{}if(film){film.classList.remove('active','holding');film.style.opacity='0'}canvas.style.opacity='1';words.replaceChildren();sentence.innerHTML='';sentence.dataset.text='';sentence.style.opacity='0';logo.style.opacity='0';logo.style.transform='translateY(8px) scale(.985)';welcomeUI.style.opacity='0';$('.logo-edge-pass').style.opacity='0';root.classList.remove('ready','film-mode','promo-complete');$('#cinemaClosed').hidden=true}
function stopAudio(){
 for(const a of [welcomeAudio,salesAudio]){try{a.pause()}catch{}}
}
function playAudio(which){
 if(which!=='sales'||!sound)return;stopAudio();salesAudio.currentTime=0;salesAudio.muted=!sound;salesAudio.volume=1;const bp=salesAudio.play();if(bp?.catch)bp.catch(()=>{if(sound)status.textContent='Cinematic soundtrack could not start. Tap Sound to retry.'});if(sound)status.textContent='Why SAMI soundtrack enabled';
}
async function playWelcomeFilm(){sound=false;filmFallback=true;root.classList.remove('film-mode');if(film){film.classList.remove('active','holding');film.style.opacity='0'}canvas.style.opacity='1';drawStill();await new Promise(r=>requestAnimationFrame(()=>r()));start=performance.now();running=true;raf=requestAnimationFrame(frame)}
async function play(which='welcome',options={}){prepareGeometry();resetVisual();stopAudio();root.classList.remove('promo-complete');mode=which;quickLaunchDone=false;welcomeExit=which==='welcome'?(options.after||'auto'):'menu';root.hidden=false;$('#app').inert=true;$('#app').setAttribute('aria-hidden','true');gate.classList.add('dismissed');if(which==='welcome'){const replaying=welcomeExit==='menu';$('#launchSkip').hidden=false;$('#launchSkip').textContent=replaying?'Back to welcome':'Skip intro';$('#launchSoundBtn').hidden=true;if(matchMedia('(prefers-reduced-motion: reduce)').matches||safePreference('sami.reducedMotion')==='on'){finishAtWelcome(false);return}await playWelcomeFilm();return}$('#launchSkip').hidden=false;$('#launchSoundBtn').hidden=false;$('#launchSkip').textContent='Back to welcome';start=performance.now();running=true;prepareWords();playAudio(which);raf=requestAnimationFrame(frame)}

let quickLaunchDone=false,welcomeExit='auto';
async function completeQuickLaunch(){
 if(quickLaunchDone||mode!=='welcome')return;quickLaunchDone=true;cancelAnimationFrame(raf);running=false;logo.style.opacity='1';logo.style.transform='translateY(0) scale(1)';$('.logo-edge-pass').style.opacity='0';await new Promise(r=>setTimeout(r,120));
 if(document.documentElement.classList.contains('install-required')){document.documentElement.classList.remove('intro-running');root.hidden=true;setupBrowserGate();return;}
 finishAtWelcome(false)
}
function finishAtWelcome(fromFilm=false){
 cancelAnimationFrame(raf);running=false;for(const a of [salesAudio,welcomeAudio]){try{a.pause()}catch{}}words.replaceChildren();sentence.innerHTML='';sentence.style.opacity='0';
 if(mode==='sales'&&document.documentElement.classList.contains('install-required')){root.hidden=true;document.documentElement.classList.remove('intro-running');setupBrowserGate();return;}
 if(fromFilm&&film&&!filmFallback){try{film.pause()}catch{}film.classList.add('holding');film.style.opacity='1';canvas.style.opacity='0';logo.style.opacity='0';root.classList.add('film-mode')}
 else{try{film?.pause()}catch{}if(film){film.classList.remove('active','holding');film.style.opacity='0'}root.classList.remove('film-mode');canvas.style.opacity='1';logo.style.opacity='1';logo.style.transform='translateY(0) scale(1)';drawStill()}
 welcomeUI.style.opacity='1';$('.logo-edge-pass').style.opacity='0';root.classList.toggle('promo-complete',mode==='sales');root.classList.add('ready');$('#launchSkip').hidden=true;$('#launchSoundBtn').hidden=true
}
function safePreference(key){try{return localStorage.getItem(key)}catch{return null}}
async function handleLaunchAction(){const url=new URL(location.href),action=url.searchParams.get('action');if(!action||!isInstalled())return;url.searchParams.delete('action');history.replaceState(null,'',url);if(action==='new')await window.SAMIWorkspace?.runAction('newProject');if(action==='last')await window.SAMIWorkspace?.runAction('resumeProject');if(action==='route'){await window.SAMIWorkspace?.runAction('resumeProject');await window.SAMIWorkspace?.runAction('stage:route')}}
async function enter(options={}){if(document.documentElement.classList.contains('install-required')){setupBrowserGate();return}const permissionRun=options.automatic?null:window.SAMIWorkspace?.requestEntryPermissions?.(),blurKeyboard=()=>{const a=document.activeElement;if(a&&/^(INPUT|TEXTAREA)$/i.test(a.tagName))a.blur?.()};blurKeyboard();resetVisual();stopAudio();root.hidden=true;$('#app').inert=false;$('#app').setAttribute('aria-hidden','false');await window.SAMIWorkspace?.ready;permissionRun?.catch?.(()=>{});try{localStorage.setItem('sami.launch.seen','yes')}catch{}if(!options.automatic)window.SAMIField?.requestPersistence?.();blurKeyboard();requestAnimationFrame(blurKeyboard);setTimeout(blurKeyboard,100);setTimeout(blurKeyboard,350);try{if(!options.automatic&&localStorage.getItem('sami.tutorial.seen')!=='yes')window.SAMIWorkspace?.runAction('tutorial')}catch{}if(options.automatic)await window.SAMIWorkspace?.runAction('resumeProject');await handleLaunchAction()}
async function startWithSound(){sound=true;$('#launchSoundBtn').textContent='Sound on';status.textContent='Cinematic sound enabled';await play(location.hash==='#why'?'sales':'welcome',{after:'auto'})}
async function shutdown(){resetVisual();root.hidden=false;$('#app').inert=true;$('#app').setAttribute('aria-hidden','true');gate.classList.add('dismissed');$('#launchSkip').hidden=true;$('#launchSoundBtn').hidden=true;logo.style.opacity='1';logo.style.transform='translateY(0) scale(1)';await logo.animate([{opacity:1,filter:'brightness(1)'},{opacity:.5,filter:'brightness(1.5)',offset:.38},{opacity:0,filter:'brightness(.25)'}],{duration:1800,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).finished.catch(()=>{});logo.style.opacity='0';$('#cinemaClosed').hidden=false}
function setupBrowserGate(){const box=$('#mobileInstallGate'),btn=$('#gateInstallBtn'),copy=$('#gateInstallInstructions'),help=$('#installHelp'),steps=$('#installHelpSteps'),close=$('#closeInstallHelp');if(!box)return;const ua=navigator.userAgent,ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),android=/Android/i.test(ua),samsung=/SamsungBrowser/i.test(ua),firefox=/Firefox|FxiOS/i.test(ua),embedded=/FBAN|FBAV|Instagram|WhatsApp|Teams|Outlook|; wv\)/i.test(ua),safari=/Safari\//.test(ua)&&!/Chrome|Chromium|CriOS|FxiOS|Edg/.test(ua);let title='Install SAMI',instructions=[];if(ios){title='Install on iPhone or iPad';instructions=['Open the Share menu and look for Add to Home Screen.','If it is missing, copy this link and open it in Safari.','In Safari, choose Share → Add to Home Screen. Enable Open as Web App if shown, then tap Add.','Open SAMI from the new Home Screen icon.']}else if(embedded){title='Open in your main browser';instructions=['This in-app browser may not offer installation. Copy the link below.','Open it in Chrome or Edge on Android/Windows, or Safari on iPhone, iPad or Mac.','Use that browser’s Install app, Add to Home Screen or Add to Dock command.']}else if(android){title=samsung?'Install with Samsung Internet':'Install on Android';instructions=[firefox?'Open the Firefox menu and choose Install.':samsung?'Open the browser menu and choose Add page to → Home screen.':'Use Install SAMI below, or the browser menu → Install app / Add to Home Screen.','Confirm and launch SAMI from its new app icon.','If no install option appears, copy this link into Chrome or Samsung Internet.']}else if(safari){title='Install on Mac';instructions=['In a supported Safari version, choose File → Add to Dock.','Confirm, then launch SAMI from the Dock.','If Add to Dock is unavailable, use Chrome or Edge with its Install app command.']}else if(firefox){title='Use an install-capable browser';instructions=['If your Firefox version offers Install or Add to Taskbar, use it to create the app.','Otherwise copy this link into Chrome or Edge and use the browser’s Install app command.','Launch the installed SAMI icon to enter the workspace.']}else instructions=['Use Install SAMI below if available, or the install icon in the address bar.','In Chrome or Edge, the browser menu also offers an Install app command.','If this browser has no install option, copy the link into Chrome, Edge or a supported Safari version.','Open SAMI from its installed icon.'];copy?.replaceChildren();if(copy){const heading=document.createElement('strong');heading.textContent=title;const text=document.createElement('p');text.textContent='Install once, then launch from the app icon. The browser page is for installation and the SAMI introduction.';copy.append(heading,text)}if(steps)steps.replaceChildren(...instructions.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));const showHelp=()=>{if(!help||!close)return;help.hidden=false;close.focus({preventScroll:true});help.scrollIntoView({behavior:'auto',block:'nearest'})};if(close)close.onclick=()=>{help.hidden=true;btn?.focus()};if(btn){btn.hidden=false;btn.textContent=window.__SAMI_INSTALL_PROMPT__?'Install SAMI':'Show installation steps';btn.onclick=async()=>{const prompt=window.__SAMI_INSTALL_PROMPT__;if(prompt){window.__SAMI_INSTALL_PROMPT__=null;try{await prompt.prompt();const choice=await prompt.userChoice;if(choice?.outcome==='accepted'){if(copy?.lastChild)copy.lastChild.textContent='Installation requested. Open SAMI from its app icon when installation finishes.';return}}catch{}}showHelp()}}let link=$('#copyInstallLink');if(!link&&btn){link=document.createElement('button');link.id='copyInstallLink';link.className='quiet';link.type='button';link.textContent='Copy link for another browser';btn.after(link)}if(link)link.onclick=async()=>{try{await navigator.clipboard.writeText(location.href);link.textContent='Link copied'}catch{let field=$('#installURL');if(!field){field=document.createElement('input');field.id='installURL';field.readOnly=true;field.setAttribute('aria-label','SAMI link to copy');link.after(field)}field.value=location.href;field.focus();field.select();link.textContent='Select and copy the link below'}};const why=$('#gateWhySami');if(why)why.onclick=()=>{document.documentElement.classList.add('intro-running');root.hidden=false;sound=true;play('sales')};box.setAttribute('aria-label',title)}
window.addEventListener('sami:installready',setupBrowserGate);window.addEventListener('appinstalled',()=>{window.__SAMI_INSTALL_PROMPT__=null;setupBrowserGate();const p=$('#gateInstallInstructions p');if(p)p.textContent='SAMI is installed. Launch it from its new app icon.'});
$('#startSound').onclick=startWithSound;
$('#startQuiet').onclick=async()=>{sound=false;$('#launchSoundBtn').textContent='Sound off';await play(location.hash==='#why'?'sales':'welcome',{after:'auto'})};
$('#launchSkip').onclick=()=>{if(mode==='welcome'&&welcomeExit==='menu')return finishAtWelcome(false);return root.classList.contains('ready')?enter():finishAtWelcome(false)};
$('#launchSoundBtn').onclick=()=>{sound=!sound;$('#launchSoundBtn').textContent=sound?'Sound on':'Sound off';salesAudio.muted=!sound;if(sound){salesAudio.play().catch(()=>{})}else{salesAudio.pause()}};
if(film){film.addEventListener('ended',()=>{if(mode==='welcome')finishAtWelcome(true)});film.addEventListener('error',()=>{if(mode==='welcome'&&!filmFallback){filmFallback=true;root.classList.remove('film-mode');film.style.opacity='0';canvas.style.opacity='1';start=performance.now();running=true;raf=requestAnimationFrame(frame)}})}
$('#enterSami').onclick=enter;
$('#whySami').onclick=()=>{sound=true;$('#launchSoundBtn').textContent='Sound on';play('sales')};
$('#reopenSami').onclick=()=>{gate.classList.remove('dismissed');$('#cinemaClosed').hidden=true;logo.style.opacity='0';welcomeUI.style.opacity='0';if(film){film.classList.remove('active','holding');film.style.opacity='0'}root.classList.remove('film-mode');$('#launchSkip').hidden=true;$('#launchSoundBtn').hidden=true};
window.SAMICinema={play,shutdown,enter};
addEventListener('resize',resize,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){suspendedAt=performance.now();cancelAnimationFrame(raf);if(mode==='welcome'&&film&&!filmFallback){try{film.pause()}catch{}}else stopAudio();}else if(suspendedAt&&running){const pausedFor=performance.now()-suspendedAt;suspendedAt=0;if(mode==='welcome'&&film&&!filmFallback){film.muted=!sound;film.play().catch(()=>{})}else{start+=pausedFor;const elapsed=(performance.now()-start)/1000;salesAudio.currentTime=Math.min(elapsed,Number.isFinite(salesAudio.duration)?salesAudio.duration:elapsed);if(sound)salesAudio.play().catch(()=>{});raf=requestAnimationFrame(frame)}}});
prepareGeometry();resize();setupBrowserGate();sound=false;$('#app').inert=true;$('#app').setAttribute('aria-hidden','true');gate.classList.add('dismissed');$('#launchSoundBtn').hidden=true;if(!isInstalled()){document.documentElement.classList.remove('intro-running');root.hidden=true}else if(safePreference('sami.launch.seen')==='yes'){document.documentElement.classList.remove('intro-running');root.hidden=true;enter({automatic:true})}else{document.documentElement.classList.add('intro-running');root.hidden=false;$('#launchSkip').hidden=false;requestAnimationFrame(()=>play('welcome',{after:'auto'}))}
})();
