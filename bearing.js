/* View bearing rotates display only. All project and export geometry stays geographic. */
window.SAMIBearing=function(map,viewport,onChange,onLockedAttempt){
'use strict';
const el=map.getContainer();let bearing=0,size=0,viewWidth=0,viewHeight=0,dragStart=null,gesture=null,lockedGesture=null,resizeRaf=0,lastView='',rotationLocked=true,lastLockedHint=0;
const rotate=(p,a)=>{a*=Math.PI/180;return L.point(p.x*Math.cos(a)-p.y*Math.sin(a),p.x*Math.sin(a)+p.y*Math.cos(a))};
const view=()=>viewport.getBoundingClientRect();
function resize(){const r=view(),key=Math.round(r.width)+'x'+Math.round(r.height);if(key===lastView&&size){apply();return}const centre=map._loaded?map.getCenter():null,zoom=map.getZoom();lastView=key;viewWidth=r.width;viewHeight=r.height;size=Math.ceil(Math.hypot(r.width,r.height))+4;el.style.width=size+'px';el.style.height=size+'px';el.style.left=(r.width-size)/2+'px';el.style.top=(r.height-size)/2+'px';el.style.transformOrigin='50% 50%';map.invalidateSize({pan:false,animate:false});if(centre)map.setView(centre,zoom,{animate:false});apply();}
function scheduleResize(){cancelAnimationFrame(resizeRaf);resizeRaf=requestAnimationFrame(resize)}
function apply(){el.style.transform='rotate('+bearing+'deg)';el.style.setProperty('--counter-bearing',-bearing+'deg');}
function set(value,save=true){bearing=((Number(value)||0)%360+360)%360;if(Math.abs(bearing-360)<.01)bearing=0;apply();if(save)onChange?.(bearing);map.fire('bearingchange',{bearing});}
function fromScreen(x,y){const r=view(),q=rotate(L.point(x-r.left-r.width/2,y-r.top-r.height/2),-bearing);return q.add([size/2,size/2]);}
function toScreen(point){const r=view(),p=rotate(L.point(point).subtract([size/2,size/2]),bearing);return p.add([r.left+r.width/2,r.top+r.height/2]);}
function angularDelta(a,b){return((a-b+540)%360)-180;}
function lockedAttempt(){const now=performance.now();if(now-lastLockedHint<1400)return;lastLockedHint=now;onLockedAttempt?.();}
map.mouseEventToContainerPoint=e=>fromScreen(e.clientX,e.clientY);
map.getBearing=()=>bearing;map.setBearing=set;
const d=map.dragging?._draggable;
if(d){d.on('dragstart',()=>{dragStart=d._startPos.clone()});d.on('predrag',()=>{if(!dragStart)return;d._newPos=dragStart.add(rotate(d._newPos.subtract(dragStart),-bearing));});d.on('dragend',()=>dragStart=null);}
map.on('layeradd',e=>{const marker=e.layer;if(!(marker instanceof L.Marker)||!marker.options.draggable)return;requestAnimationFrame(()=>{const d=marker.dragging?._draggable;if(!d||d._samiBearing)return;d._samiBearing=true;let start;d.on('dragstart',()=>start=d._startPos.clone());d.on('predrag',()=>{if(start)d._newPos=start.add(rotate(d._newPos.subtract(start),-bearing))});});});
const angle=t=>Math.atan2(t[1].clientY-t[0].clientY,t[1].clientX-t[0].clientX)*180/Math.PI;
viewport.addEventListener('touchstart',e=>{if(e.touches.length!==2)return;if(rotationLocked){lockedGesture={angle:angle(e.touches)};gesture=null;}else{gesture={angle:angle(e.touches),bearing};lockedGesture=null;}},{passive:true});
viewport.addEventListener('touchmove',e=>{if(e.touches.length!==2)return;if(rotationLocked&&lockedGesture){if(Math.abs(angularDelta(angle(e.touches),lockedGesture.angle))>4){lockedAttempt();lockedGesture.angle=angle(e.touches);}return;}if(gesture){set(gesture.bearing+angle(e.touches)-gesture.angle,false);e.preventDefault();}},{passive:false});
viewport.addEventListener('touchend',e=>{if(e.touches.length<2){if(gesture)onChange?.(bearing);gesture=null;lockedGesture=null;}},{passive:true});
viewport.addEventListener('touchcancel',()=>{if(gesture)onChange?.(bearing);gesture=null;lockedGesture=null;},{passive:true});
const observer=new ResizeObserver(scheduleResize);observer.observe(viewport);resize();
return{set,get:()=>bearing,setLocked:v=>{rotationLocked=!!v;gesture=null;lockedGesture=null;},getLocked:()=>rotationLocked,resize,fromScreen,toScreen,fromLocalPoint:(x,y)=>rotate(L.point(x-viewWidth/2,y-viewHeight/2),-bearing).add([size/2,size/2]),toLocalPoint:point=>rotate(L.point(point).subtract([size/2,size/2]),bearing).add([viewWidth/2,viewHeight/2]),visibleCorners:()=>{const r=view();return[[r.left,r.top],[r.right,r.top],[r.right,r.bottom],[r.left,r.bottom]].map(([x,y])=>map.containerPointToLatLng(fromScreen(x,y)))} };
};
