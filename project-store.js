/* SAMI project storage. Private device workspace with independent saved checkpoints. */
(function(root){
'use strict';
const DB_NAME='sami-projects-v3', JOURNAL='sami.recovery.v3', ACTIVE='sami.active.v3', RESET_MARK='sami.storage.reset.2713';
const OLD_LOCAL_KEYS=['sami.project.v1','sami.project.v2','sami.recovery.v2','sami.active.v2','sami.meta'];
let database=null,queue=Promise.resolve(),resetPromise=null;
const clone=o=>JSON.parse(JSON.stringify(o));
function id(){return root.crypto?.randomUUID?.()||'project-'+Date.now()+'-'+Math.random().toString(36).slice(2)}
function deleteDb(name){return new Promise(resolve=>{try{const r=indexedDB.deleteDatabase(name);r.onsuccess=r.onerror=r.onblocked=()=>resolve();}catch{resolve();}})}
async function clearLegacyOnce(){
 if(resetPromise)return resetPromise;
 resetPromise=(async()=>{
  try{if(localStorage.getItem(RESET_MARK)==='1')return;for(const k of OLD_LOCAL_KEYS)localStorage.removeItem(k);}catch{}
  await deleteDb('sami-projects');
  try{localStorage.setItem(RESET_MARK,'1')}catch{}
 })();
 return resetPromise;
}
function open(){if(database)return database;database=(async()=>{await clearLegacyOnce();return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('projects'))db.createObjectStore('projects',{keyPath:'id'});if(!db.objectStoreNames.contains('versions')){const v=db.createObjectStore('versions',{keyPath:'key'});v.createIndex('projectId','projectId');}if(!db.objectStoreNames.contains('profiles'))db.createObjectStore('profiles',{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});})();return database;}
async function transact(stores,mode,fn){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(stores,mode);let result;try{result=fn(tx)}catch(e){tx.abort();reject(e);return}tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Storage interrupted'));});}
async function get(store,key){const db=await open();return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function all(store){const db=await open();return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function journal(project){try{localStorage.setItem(JOURNAL,JSON.stringify(project));localStorage.setItem(ACTIVE,project.id);return true}catch{return false}}
function save(project,{checkpoint=false,label='Autosave'}={}){const p=clone(project);p.id||=id();p.savedAt=new Date().toISOString();journal(p);const work=async()=>{const old=await get('projects',p.id);await transact(['projects','versions'],'readwrite',tx=>{if(checkpoint||!old||Date.parse(p.savedAt)-Date.parse(old.checkpointAt||0)>60000){tx.objectStore('versions').put({key:p.id+':'+Date.now()+':'+id(),projectId:p.id,savedAt:p.savedAt,label,project:p});p.checkpointAt=p.savedAt;}else p.checkpointAt=old.checkpointAt;tx.objectStore('projects').put(p)});const versions=(await history(p.id)).slice(30);if(versions.length)await transact(['versions'],'readwrite',tx=>versions.forEach(v=>tx.objectStore('versions').delete(v.key)));return p;};const result=queue.then(work,work);queue=result.catch(()=>{});return result;}
async function history(projectId){return (await all('versions')).filter(x=>x.projectId===projectId).sort((a,b)=>b.savedAt.localeCompare(a.savedAt));}
async function recover(){let draft;try{draft=JSON.parse(localStorage.getItem(JOURNAL)||'null')}catch{}const active=localStorage.getItem(ACTIVE);let stored;try{stored=active?await get('projects',active):null}catch{}if(draft&&(!stored||Date.parse(draft.savedAt||0)>=Date.parse(stored.savedAt||0)))return draft;return stored||null;}
async function list(){return(await all('projects')).sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||'')));}
async function duplicate(p,name){const n=clone(p);n.id=id();n.name=name||p.name+' — copy';n.createdAt=new Date().toISOString();delete n.checkpointAt;await save(n,{checkpoint:true,label:'Duplicated project'});return n;}
async function restore(key){const v=await get('versions',key);if(!v)throw Error('That saved version is unavailable.');const current=await get('projects',v.projectId);if(current)await save(current,{checkpoint:true,label:'Before restore'});const p=clone(v.project);p.savedAt=new Date().toISOString();await save(p,{checkpoint:true,label:'Restored saved state'});return p;}
async function saveProfile(profile){const p=clone(profile);p.id||=id();await transact(['profiles'],'readwrite',tx=>tx.objectStore('profiles').put(p));return p;}
root.SAMIProjectStore={open,save,journal,recover,list,get:projectId=>get('projects',projectId),history,duplicate,restore,profiles:()=>all('profiles'),saveProfile,flush:()=>queue,clearLegacyOnce};
})(window);
