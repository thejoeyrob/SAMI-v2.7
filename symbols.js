(function(root){
'use strict';
const P={rect:(x,y,w,h,fill='accent',stroke='ink')=>({type:'rect',x,y,w,h,fill,stroke}),ellipse:(x,y,w,h,fill='paper',stroke='ink')=>({type:'ellipse',x,y,w,h,fill,stroke}),line:(x,y,x2,y2,stroke='ink')=>({type:'line',x,y,x2,y2,stroke}),poly:(points,fill='paper',stroke='ink')=>({type:'poly',points,fill,stroke})};
const {rect,ellipse,line,poly}=P;
function validParts(parts){return Array.isArray(parts)&&parts.length<=500&&parts.every(p=>p&&['rect','ellipse','line','poly'].includes(p.type)&&Object.entries(p).every(([k,v])=>['type','fill','stroke'].includes(k)?typeof v==='string'&&v.length<32:k==='points'?Array.isArray(v)&&v.length<=80&&v.every(q=>Array.isArray(q)&&q.length===2&&q.every(n=>Number.isFinite(n)&&n>=-100&&n<=200)):Number.isFinite(v)&&Math.abs(v)<=300));}
function parts(kind,m={}){
 if(m.symbolPartsJSON){try{const p=JSON.parse(m.symbolPartsJSON);if(validParts(p))return p;}catch{}}
 if(kind?.startsWith('panel_')||m.type==='panel')return [rect(0,0,100,100,'accent'),line(6,15,94,15,'muted'),line(6,85,94,85,'muted')];
 const wheels=[rect(18,0,12,9,'ink'),rect(18,91,12,9,'ink'),rect(76,0,12,9,'ink'),rect(76,91,12,9,'ink')];
 if(['rigid','artic','van','pickup','concreteMixer8','truck','ambulance','fireEngine'].includes(kind)){
  const body=[...wheels,rect(3,10,72,80,'accent'),rect(77,13,21,74,'paper'),rect(85,20,10,60,'glass'),line(82,50,98,50)];
  if(kind==='concreteMixer8')body.push(ellipse(16,21,49,58,'paper'),poly([[38,24],[56,40],[29,76]],'accent'));
  if(kind==='artic')body.push(line(66,14,66,86),line(72,50,79,50));
  if(kind==='pickup')body.push(rect(7,17,44,66,'paper'));
  if(kind==='ambulance'||kind==='fireEngine')body.push(rect(32,28,10,44,'red'),rect(20,44,35,12,'red'));
  return body;
 }
 if(['forklift','telehandler','excavator8','excavator20','roller','dumper','mewp','crane'].includes(kind)){
  const a=[rect(14,3,42,17,'ink'),rect(14,80,42,17,'ink'),rect(15,23,40,54,'accent'),rect(20,29,19,33,'glass')];
  if(kind.startsWith('excavator')||kind==='crane'||kind==='mewp')a.push(ellipse(37,29,23,42,'paper'),poly([[49,45],[77,28],[96,17],[99,27],[79,38],[53,57]],'accent'),rect(91,14,8,20,'ink'));
  else if(kind==='forklift')a.push(rect(53,28,6,45,'ink'),rect(59,30,40,8,'paper'),rect(59,63,40,8,'paper'));
  else if(kind==='roller')a.push(rect(68,8,23,84,'muted'));
  else a.push(rect(58,13,37,74,'paper'),line(59,20,93,80));
  return a;
 }
 if(/^cabin|storage|office|kitchen/.test(kind))return [rect(1,1,98,98,'accent'),line(69,2,69,98),rect(8,3,18,7,'glass'),rect(36,3,18,7,'glass'),rect(12,90,18,8,'glass'),line(70,60,93,60),poly([[70,60],[70,83],[88,72]],'paper')];
 if(['toilet','accessibleToilet','shower'].includes(kind))return [rect(1,1,98,98,'accent'),rect(8,8,23,36,'paper'),ellipse(37,26,48,48,'paper'),line(7,92,35,74),line(35,74,35,92)];
 if(['heras','storm','barrier','crowdBarrier','pedGate','vehicleGate'].includes(kind))return [rect(0,35,100,30,'accent'),line(0,0,0,100),line(100,0,100,100),...Array.from({length:8},(_,i)=>line(8+i*12,36,15+i*12,64,'muted'))];
 if(kind==='pole')return [ellipse(24,24,52,52,'paper'),line(0,50,100,50),line(50,0,50,100)];
 if(kind==='tower')return [poly([[8,8],[92,8],[92,92],[8,92]],'paper'),line(8,8,92,92),line(92,8,8,92),line(0,35,100,35),line(0,65,100,65)];
 if(kind==='parking')return [line(1,1,1,99),line(1,1,99,1),line(1,99,99,99),rect(43,28,9,50,'accent'),poly([[52,28],[70,28],[70,52],[52,52]],'accent')];
 if(['stage','grandstand'].includes(kind))return [rect(0,0,100,100,'accent'),rect(8,8,78,84,'paper'),...Array.from({length:4},(_,i)=>line(10,22+i*18,83,22+i*18,'muted')),rect(88,22,12,56,'muted')];
 if(['marquee','tent','gazebo'].includes(kind))return [rect(0,0,100,100,'paper'),poly([[0,0],[50,50],[100,0]],'accent'),poly([[0,100],[50,50],[100,100]],'accent'),line(0,0,100,100),line(100,0,0,100)];
 if(['firstaid','muster','fire','accessible','noEntry'].includes(kind))return [rect(0,0,100,100,kind==='fire'||kind==='noEntry'?'red':'accent'),...(kind==='firstaid'?[rect(40,17,20,66,'paper'),rect(17,40,66,20,'paper')]:kind==='noEntry'?[ellipse(12,12,76,76,'red','paper'),rect(23,44,54,12,'paper')]:kind==='fire'?[rect(37,27,28,59,'paper'),line(37,24,72,24,'paper'),line(72,24,72,65,'paper')]:[ellipse(39,16,22,22,'paper'),rect(38,43,24,42,'paper'),line(15,50,33,62,'paper'),line(85,50,67,62,'paper')])];
 if(['fuel','waterTank'].includes(kind))return [rect(5,10,90,80,'accent'),ellipse(5,10,20,80,'paper'),ellipse(75,10,20,80,'paper'),line(25,10,75,10),line(25,90,75,90)];
 if(['generator','distribution'].includes(kind))return [rect(2,5,96,90,'accent'),rect(9,15,28,70,'muted'),poly([[66,15],[47,55],[64,55],[55,85],[83,44],[65,44]],'paper')];
 if(['tree','planter'].includes(kind))return [ellipse(10,10,80,80,'accent'),ellipse(22,3,44,42,'accent'),ellipse(3,35,45,45,'accent'),ellipse(50,40,47,45,'accent'),ellipse(42,42,16,16,'ink')];
 if(['roundTable'].includes(kind))return [ellipse(12,12,76,76,'accent'),rect(42,0,16,12,'paper'),rect(42,88,16,12,'paper'),rect(0,42,12,16,'paper'),rect(88,42,12,16,'paper')];
 if(['chair'].includes(kind))return [rect(15,15,70,70,'accent'),rect(15,0,70,20,'paper')];
 if(kind==='skip')return [poly([[12,0],[88,0],[100,100],[0,100]],'accent'),poly([[20,12],[80,12],[89,87],[11,87]],'muted')];
 if(['foodTruck','ticketBooth','bar'].includes(kind))return [rect(2,2,96,96,'accent'),rect(7,7,86,24,'paper'),line(18,30,18,97),line(80,30,80,97)];
 return [rect(1,1,98,98,'accent'),line(8,8,92,92,'muted'),line(92,8,8,92,'muted')];
}
function color(v,m={}){const result=({accent:m.styleFill||m.color||'#a2c4b8',ink:m.styleColor||'#264b43',paper:'#ffffff',glass:'#afd1df',muted:'#688b82',red:'#b54747',none:'none'})[v]||v;return result==='none'||/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(result||'')?result:'#264b43';}
function svgParts(ps,m={}){if(!validParts(ps))return '';return ps.map(p=>{const st=`fill="${p.type==='line'||m.fillEnabled===false?'none':color(m.recolourParts&&p.fill!=='none'?'accent':p.fill||'paper',m)}" stroke="${m.outlineEnabled===false?'none':color(m.recolourParts&&p.stroke!=='none'?'ink':p.stroke||'ink',m)}" stroke-width="${Math.max(.1,Math.min(6,+m.styleWeight||.8))}" vector-effect="non-scaling-stroke" stroke-linejoin="round"`;if(p.type==='rect')return `<rect x="${p.x}" y="${p.y}" width="${Math.max(0,p.w)}" height="${Math.max(0,p.h)}" ${st}/>`;if(p.type==='ellipse')return `<ellipse cx="${p.x+p.w/2}" cy="${p.y+p.h/2}" rx="${Math.max(0,p.w/2)}" ry="${Math.max(0,p.h/2)}" ${st}/>`;if(p.type==='line')return `<line x1="${p.x}" y1="${p.y}" x2="${p.x2}" y2="${p.y2}" ${st}/>`;return `<polygon points="${p.points.map(p=>p.join(',')).join(' ')}" ${st}/>`;}).join('');}
function svg(kind,m={}){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 106 106" aria-hidden="true">${svgParts(parts(kind,m),m)}</svg>`;}
root.SAMISymbols={parts,validParts,color,svgParts,svg,P};
})(typeof window!=='undefined'?window:globalThis);
