(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./polygon-clipping.js'):root.polygonClipping);if(typeof module==='object'&&module.exports)module.exports=api;else root.SamiGeometry=api;})(typeof window!=='undefined'?window:this,function(pc){
'use strict';
const R=6371008.8,rad=Math.PI/180,copy=o=>JSON.parse(JSON.stringify(o));
function validCoord(p){return Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Number.isFinite(p[1])&&Math.abs(p[0])<=180&&Math.abs(p[1])<=85;}
function validBounds(b){return Array.isArray(b)&&b.length===4&&b.every(Number.isFinite)&&b[0]<b[2]&&b[1]<b[3]&&b[0]>=-180&&b[2]<=180&&b[1]>=-85&&b[3]<=85;}
function inside(p,b){return p[0]>=b[0]-1e-10&&p[0]<=b[2]+1e-10&&p[1]>=b[1]-1e-10&&p[1]<=b[3]+1e-10;}
function distance(a,b){const dlat=(b[1]-a[1])*rad,dlon=(b[0]-a[0])*rad;const h=Math.sin(dlat/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin(dlon/2)**2;return 2*R*Math.asin(Math.sqrt(Math.min(1,h)));}
function length(ps){return ps.slice(1).reduce((sum,p,i)=>sum+distance(ps[i],p),0);}
function projection(origin){const mx=R*rad*Math.cos(origin[1]*rad),my=R*rad;return{xy:p=>[(p[0]-origin[0])*mx,(p[1]-origin[1])*my],ll:p=>[origin[0]+p[0]/mx,origin[1]+p[1]/my]};}
function rectangle(center,l,w,angle=0){const p=projection(center),a=angle*rad,u=[Math.sin(a),Math.cos(a)],v=[Math.cos(a),-Math.sin(a)];const ring=[[-l/2,-w/2],[l/2,-w/2],[l/2,w/2],[-l/2,w/2]].map(([x,y])=>p.ll([u[0]*x+v[0]*y,u[1]*x+v[1]*y]));return{type:'Polygon',coordinates:[[...ring,ring[0].slice()]]};}
function boundsGeometry(b){return{type:'Polygon',coordinates:[[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]],[b[0],b[1]]]]};}
function boundsOf(g){const all=[];function visit(a){if(typeof a[0]==='number')all.push(a);else a.forEach(visit);}visit(g.coordinates);if(!all.length)return null;return [Math.min(...all.map(p=>p[0])),Math.min(...all.map(p=>p[1])),Math.max(...all.map(p=>p[0])),Math.max(...all.map(p=>p[1]))];}
function segment(a,b,box){let lo=0,hi=1;const d=[b[0]-a[0],b[1]-a[1]],p=[-d[0],d[0],-d[1],d[1]],q=[a[0]-box[0],box[2]-a[0],a[1]-box[1],box[3]-a[1]];for(let i=0;i<4;i++){if(Math.abs(p[i])<1e-16){if(q[i]<0)return null;}else{const r=q[i]/p[i];if(p[i]<0)lo=Math.max(lo,r);else hi=Math.min(hi,r);if(lo>hi)return null;}}if(hi-lo<1e-12)return null;return [[a[0]+lo*d[0],a[1]+lo*d[1]],[a[0]+hi*d[0],a[1]+hi*d[1]]];}
function clipLine(ps,b){const result=[];let line=null;for(let i=1;i<ps.length;i++){const seg=segment(ps[i-1],ps[i],b);if(!seg){line=null;continue;}const last=line?.[line.length-1];if(last&&Math.abs(last[0]-seg[0][0])<1e-10&&Math.abs(last[1]-seg[0][1])<1e-10)line.push(seg[1]);else{line=seg;result.push(line);}}return result;}
function clipGeometry(g,b){if(!validBounds(b))return copy(g);if(g.type==='Point')return inside(g.coordinates,b)?copy(g):null;if(g.type==='MultiPoint'){const pts=g.coordinates.filter(p=>inside(p,b));return pts.length?{type:'MultiPoint',coordinates:copy(pts)}:null;}if(['LineString','MultiLineString'].includes(g.type)){const lines=(g.type==='LineString'?[g.coordinates]:g.coordinates).flatMap(l=>clipLine(l,b));return !lines.length?null:lines.length===1?{type:'LineString',coordinates:lines[0]}:{type:'MultiLineString',coordinates:lines};}if(['Polygon','MultiPolygon'].includes(g.type)){const result=pc.intersection(g.coordinates,boundsGeometry(b).coordinates);return !result.length?null:result.length===1?{type:'Polygon',coordinates:result[0]}:{type:'MultiPolygon',coordinates:result};}return null;}
function area(b){return distance([b[0],b[1]],[b[2],b[1]])*distance([b[0],b[1]],[b[0],b[3]]);}
function validateFeature(f){if(!f||f.type!=='Feature'||!f.geometry||!['Point','MultiPoint','LineString','MultiLineString','Polygon','MultiPolygon'].includes(f.geometry.type))return false;let count=0;function walk(a){if(!Array.isArray(a)||!a.length)return false;if(typeof a[0]==='number'){count++;return validCoord(a);}return a.every(walk);}if(!walk(f.geometry.coordinates)||count>50000)return false;const g=f.geometry;const line=r=>r.length>=2&&r.every(validCoord),ring=r=>r.length>=4&&r.every(validCoord)&&r[0][0]===r.at(-1)[0]&&r[0][1]===r.at(-1)[1];if(g.type==='LineString')return line(g.coordinates);if(g.type==='MultiLineString')return g.coordinates.every(line);if(g.type==='Polygon')return g.coordinates.every(ring);if(g.type==='MultiPolygon')return g.coordinates.every(p=>p.length&&p.every(ring));return true;}
function sabrePanels(points,o){
 const pr=projection(points[0]),ps=points.map(pr.xy),out=[],warnings=[],l=1.8,w=3.8,lanes=Math.max(1,Math.min(2,+o.lanes||1)),q=+o.jointSpacingMm/1000,verified=o.jointVerified===true&&q>0&&q<=.3;
 let heading=null,lastCenter=null;
 const emit=(center,u,offset=0,forceUnverified=false)=>{const v=[-u[1],u[0]];for(let lane=0;lane<lanes;lane++){const c=[center[0]+v[0]*(lane-(lanes-1)/2)*w,center[1]+v[1]*(lane-(lanes-1)/2)*w],r=[[-l/2,-w/2],[l/2,-w/2],[l/2,w/2],[-l/2,w/2]].map(([a,b])=>pr.ll([c[0]+u[0]*a+v[0]*b,c[1]+u[1]*a+v[1]*b]));out.push({geometry:{type:'Polygon',coordinates:[[...r,r[0].slice()]]},sabreUnverified:forceUnverified||!verified,jointOffsetMm:Math.round(offset*1000),corner:Math.abs(offset)>.0001});}if(out.length>5000)throw Error('This run exceeds 5,000 panels.');};
 for(let i=1;i<ps.length;i++){
  const a=ps[i-1],b=ps[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<.01)continue;const dir=[(b[0]-a[0])/d,(b[1]-a[1])/d];
  if(!heading){heading=dir;lastCenter=[a[0]+heading[0]*l/2,a[1]+heading[1]*l/2];emit(lastCenter,heading,0);}
  const delta=Math.acos(Math.max(-1,Math.min(1,dir[0]*heading[0]+dir[1]*heading[1])))/rad;
  if(delta>15){warnings.push('Sabre-X change over 15°: separate aligned sections shown. A designed connection is required.');heading=dir;lastCenter=[a[0]+dir[0]*l/2,a[1]+dir[1]*l/2];emit(lastCenter,heading,0,true);}
  const v=[-heading[1],heading[0]],forward=(b[0]-lastCenter[0])*heading[0]+(b[1]-lastCenter[1])*heading[1],count=Math.max(0,Math.ceil((forward-l/2-1e-6)/l));
  for(let n=0;n<count;n++){const next=[lastCenter[0]+heading[0]*l,lastCenter[1]+heading[1]*l],t=Math.max(0,Math.min(1,((next[0]-a[0])*dir[0]+(next[1]-a[1])*dir[1])/d)),target=[a[0]+dir[0]*d*t,a[1]+dir[1]*d*t],need=(target[0]-next[0])*v[0]+(target[1]-next[1])*v[1],shift=verified?Math.round(need/q)*q:0,limited=Math.max(-.3,Math.min(.3,shift)),bad=Math.abs(shift)>.3001;next[0]+=v[0]*limited;next[1]+=v[1]*limited;emit(next,heading,limited,bad);lastCenter=next;}
 }
 if(!verified)warnings.push('Sabre-X: exact camlock spacing is unverified. Aligned fixed-size panels shown; confirm the joint drawing before laying out bends.');
 return{panels:out,warnings:[...new Set(warnings)],distance:length(points)};
}
function panels(points,o){
 if(points.length<2)throw Error('Tap at least two route points.');if(o.product==='sabre')return sabrePanels(points,o);
 const l=+o.length,w=+o.width,overlap=+o.overlap||0,lanes=+o.lanes||1,lateral=+o.lateralOverlap||0;
 if(!(l>.1&&w>.1&&overlap>=0&&overlap<l*.75&&lateral>=0&&lateral<w*.75&&lanes>=1&&lanes<=4))throw Error('Check the panel dimensions and overlaps.');
 const pr=projection(points[0]),ps=points.map(pr.xy),out=[],warnings=[],step=l-overlap,widthStep=w-lateral,cornerFamily=['lion','hybrid','tuff'].includes(o.product),runHalf=(lanes*w-(lanes-1)*lateral)/2,sharp=new Map();
 function add(x,y,ux,uy,cross=0,corner=false,junctionRow=0,cornerRule=''){const vx=-uy,vy=ux,c=[x+vx*cross,y+vy*cross],r=[[-l/2,-w/2],[l/2,-w/2],[l/2,w/2],[-l/2,w/2]].map(([a,b])=>pr.ll([c[0]+ux*a+vx*b,c[1]+uy*a+vy*b]));out.push({geometry:{type:'Polygon',coordinates:[[...r,r[0].slice()]]},corner,junctionRow,cornerRule});if(out.length>5000)throw Error('This run exceeds 5,000 panels. Use a smaller area or shorter runs.');}
 // Identify the established 5/4/3/2 sharp-corner construction first. The route points themselves are never rotated or normalised.
 if(cornerFamily)for(let i=1;i<ps.length-1;i++){
  const a=ps[i-1],b=ps[i],c=ps[i+1],d1=Math.hypot(b[0]-a[0],b[1]-a[1]),d2=Math.hypot(c[0]-b[0],c[1]-b[1]);if(d1<.01||d2<.01)continue;
  const u=[(b[0]-a[0])/d1,(b[1]-a[1])/d1],v=[(c[0]-b[0])/d2,(c[1]-b[1])/d2],dot=Math.max(-1,Math.min(1,u[0]*v[0]+u[1]*v[1])),angle=Math.acos(dot)/rad;
  if(angle<59.99999||angle>120.00001)continue;
  const side=Math.sign(u[0]*v[1]-u[1]*v[0])||1,n=[-u[1]*side,u[0]*side];
  // Keep the established 5/4/3/2 stepped corner. The outgoing run pivots from the
  // leading inner edge of the final two-panel row, overlaps that row, then aims at
  // the user's actual next route point. No synthetic 90-degree correction is added.
  const endRowCross=runHalf+3.5*widthStep,endRowSeam=[b[0]-u[0]*step+n[0]*endRowCross,b[1]-u[1]*step+n[1]*endRowCross];
  const exitAnchor=[endRowSeam[0]-n[0]*w/2,endRowSeam[1]-n[1]*w/2];
  const ex=[c[0]-exitAnchor[0],c[1]-exitAnchor[1]],ed=Math.hypot(ex[0],ex[1])||1,exitDir=[ex[0]/ed,ex[1]/ed],overlapDepth=Math.min(l*.36,.9);
  const exitStart=[exitAnchor[0]+exitDir[0]*(l/2-overlapDepth),exitAnchor[1]+exitDir[1]*(l/2-overlapDepth)];
  sharp.set(i,{u,v,side,n,angle,exitAnchor,exitDir,exitStart});
 }
 // Straight runs. After a 5/4/3/2 corner, the first exit panel overlaps the final two-panel row and follows the user's true exit bearing.
 for(let i=1;i<ps.length;i++){
  let a=ps[i-1],b=ps[i],seedExit=false;
  const previousSharp=sharp.get(i-1);
  if(previousSharp){a=previousSharp.exitStart;seedExit=true;}
  let ux,uy,d;if(seedExit){ux=previousSharp.exitDir[0];uy=previousSharp.exitDir[1];d=(b[0]-a[0])*ux+(b[1]-a[1])*uy;if(d<.01)continue;}else{const dx=b[0]-a[0],dy=b[1]-a[1];d=Math.hypot(dx,dy);if(d<.01)continue;ux=dx/d;uy=dy/d;}
  const centres=[];
  if(seedExit){centres.push(0);for(let x=step;x<=d-l/2+1e-6;x+=step)centres.push(x);if(d-l/2-(centres.at(-1)||0)>.35*step)centres.push(Math.max(0,d-l/2));}
  else if(d<=l)centres.push(d/2);else{for(let x=l/2;x<=d-l/2+1e-6;x+=step)centres.push(x);if(!centres.length||d-l/2-centres.at(-1)>.35*step)centres.push(d-l/2);}
  const seen=[];for(const x of centres){if(seen.some(y=>Math.abs(y-x)<1e-5))continue;seen.push(x);for(let k=0;k<lanes;k++)add(a[0]+ux*x,a[1]+uy*x,ux,uy,(k-(lanes-1)/2)*widthStep,seedExit&&x===0,seedExit&&x===0?4:0,seedExit&&x===0?'5/4/3/2 exit overlap · chosen bearing':'straight');}
 }
 function overlapRule(b,u,v,side,rule){const cross=side*(runHalf+w/2);for(let j=0;j<4;j++){add(b[0]-u[0]*(j+.5)*step,b[1]-u[1]*(j+.5)*step,u[0],u[1],cross,true,j+1,rule);add(b[0]+v[0]*(j+.5)*step,b[1]+v[1]*(j+.5)*step,v[0],v[1],cross,true,j+1,rule);}}
 for(let i=1;i<ps.length-1;i++){
  const a=ps[i-1],b=ps[i],c=ps[i+1],d1=Math.hypot(b[0]-a[0],b[1]-a[1]),d2=Math.hypot(c[0]-b[0],c[1]-b[1]);if(d1<.01||d2<.01)continue;
  const u=[(b[0]-a[0])/d1,(b[1]-a[1])/d1],v=[(c[0]-b[0])/d2,(c[1]-b[1])/d2],dot=Math.max(-1,Math.min(1,u[0]*v[0]+u[1]*v[1])),angle=Math.acos(dot)/rad,side=Math.sign(u[0]*v[1]-u[1]*v[0])||1;
  if(angle<=15.00001)continue;
  if(cornerFamily){
   if(angle<59.99999){overlapRule(b,u,v,side,'15-60 bend');continue;}
   if(angle<=120.00001){
    // Established 60–120° corner: rows of 5 / 4 / 3 / 2 panels. The exit pivots from the seam between the final two panels.
    const counts=[5,4,3,2];for(let row=0;row<counts.length;row++)for(let j=0;j<counts[row];j++)add(b[0]-u[0]*(j+.5)*step,b[1]-u[1]*(j+.5)*step,u[0],u[1],side*(runHalf+(row+.5)*widthStep),true,row+1,'5/4/3/2 corner');
    continue;
   }
   warnings.push('A turn over 120° needs a separately designed junction.');continue;
  }
  warnings.push('A sharp corner needs a separately designed junction.');
 }
 return{panels:out,warnings:[...new Set(warnings)],distance:length(points)};
}
function expandBoundsMeters(b,meters){
 if(!validBounds(b))return null;const m=Math.max(0,+meters||0),c=[(b[0]+b[2])/2,(b[1]+b[3])/2],pr=projection(c),sw=pr.xy([b[0],b[1]]),ne=pr.xy([b[2],b[3]]);const a=pr.ll([sw[0]-m,sw[1]-m]),z=pr.ll([ne[0]+m,ne[1]+m]);return[Math.max(-180,a[0]),Math.max(-85,a[1]),Math.min(180,z[0]),Math.min(85,z[1])];
}
function circlePolygon(center,radius,segments=40){
 const r=Math.max(.05,+radius||0),n=Math.max(12,Math.min(96,Math.round(segments)||40)),pr=projection(center),ring=[];for(let i=0;i<n;i++){const a=2*Math.PI*i/n;ring.push(pr.ll([Math.sin(a)*r,Math.cos(a)*r]));}ring.push(ring[0].slice());return{type:'Polygon',coordinates:[ring]};
}
function lineBuffer(points,width){
 if(!Array.isArray(points)||points.length<2)throw Error('Tap at least two points.');const w=+width;if(!(w>.05&&w<=200))throw Error('Enter a route width between 0.05 and 200 metres.');const pr=projection(points[0]),ps=points.map(pr.xy),half=w/2,parts=[];
 for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);if(d<.01)continue;const ux=dx/d,uy=dy/d,vx=-uy*half,vy=ux*half;parts.push([[[a[0]+vx,a[1]+vy],[b[0]+vx,b[1]+vy],[b[0]-vx,b[1]-vy],[a[0]-vx,a[1]-vy],[a[0]+vx,a[1]+vy]]]);}
 for(const p of ps){const ring=[],n=20;for(let j=0;j<n;j++){const a=2*Math.PI*j/n;ring.push([p[0]+Math.sin(a)*half,p[1]+Math.cos(a)*half]);}ring.push(ring[0].slice());parts.push([ring]);}
 if(!parts.length)throw Error('Route is too short.');const merged=pc.union(...parts);const back=poly=>poly.map(r=>r.map(pr.ll));const coords=merged.map(back);return coords.length===1?{type:'Polygon',coordinates:coords[0]}:{type:'MultiPolygon',coordinates:coords};
}
function smooth(points,tolerance=.3,closed=false){
 if(points.length<3)return copy(points);const pr=projection(points[0]),ps=points.map(pr.xy);if(closed&&distance(points[0],points.at(-1))<.001)ps.pop();
 const sq=tolerance*tolerance,segDist=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return(p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2;};
 function rdp(p){if(p.length<=2)return p;let max=0,index=0;for(let i=1;i<p.length-1;i++){const d=segDist(p[i],p[0],p.at(-1));if(d>max){max=d;index=i;}}return max>sq?[...rdp(p.slice(0,index+1)).slice(0,-1),...rdp(p.slice(index))]:[p[0],p.at(-1)];}
 let out;if(closed){let far=1;for(let i=2;i<ps.length;i++)if(Math.hypot(...ps[i])>Math.hypot(...ps[far]))far=i;out=[...rdp(ps.slice(0,far+1)).slice(0,-1),...rdp([...ps.slice(far),ps[0]]).slice(0,-1)];if(out.length<3)out=ps;}else out=rdp(ps);
 return out.map(pr.ll);
}
return{smooth,copy,validCoord,validBounds,inside,distance,length,projection,rectangle,boundsGeometry,boundsOf,segment,clipLine,clipGeometry,area,validateFeature,panels,expandBoundsMeters,circlePolygon,lineBuffer};
});
