/* SAMI project storage. One project document, independent saved checkpoints.
 * v2.7.7 keeps both existing databases, their schemas and recovery keys intact.
 */
(function (root) {
  'use strict';
  const LEGACY = 'sami.project.v1', JOURNAL = 'sami.recovery.v2', ACTIVE = 'sami.active.v2';
  let database = null, queue = Promise.resolve(), pending = Promise.resolve();
  const clone = o => JSON.parse(JSON.stringify(o));
  const id = () => root.crypto?.randomUUID?.() || 'project-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  const pref = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const parsed = key => { try { return JSON.parse(pref(key) || 'null'); } catch { return null; } };
  const notice = (state, message) => root.dispatchEvent(new CustomEvent('sami:storage', {detail: {state, message}}));
  function open() {
    if (database) return database;
    database = new Promise((resolve, reject) => {
      const request = indexedDB.open('sami-projects', 2);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', {keyPath: 'id'});
        if (!db.objectStoreNames.contains('versions')) {
          const v = db.createObjectStore('versions', {keyPath: 'key'});
          v.createIndex('projectId', 'projectId');
        }
        if (!db.objectStoreNames.contains('profiles')) db.createObjectStore('profiles', {keyPath: 'id'});
      };
      request.onblocked = () => notice('warning', 'Close other SAMI tabs so device storage can open.');
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); database = null; notice('warning', 'Storage changed in another window. Save a backup, then reopen SAMI.'); };
        resolve(db);
      };
      request.onerror = () => { database = null; reject(request.error || Error('Device storage could not open.')); };
    });
    return database;
  }
  async function transact(stores, mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      let tx;
      try { tx = db.transaction(stores, mode, mode === 'readwrite' ? {durability: 'strict'} : undefined); }
      catch { tx = db.transaction(stores, mode); }
      let result;
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error || Error('Device storage could not save.'));
      tx.onabort = () => reject(tx.error || Error('Storage interrupted.'));
      try { result = fn(tx); } catch (e) { tx.abort(); reject(e); }
    });
  }
  async function read(store, key) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const r = db.transaction(store).objectStore(store).get(key);
      r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    });
  }
  async function all(store) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const r = db.transaction(store).objectStore(store).getAll();
      r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    });
  }
  function journal(project) {
    try {
      localStorage.setItem(ACTIVE, project.id);
      localStorage.setItem(JOURNAL, JSON.stringify(project));
      return true;
    } catch {
      notice('warning', 'Recovery copy is unavailable. Keep SAMI open until Saved appears, and export a backup.');
      return false;
    }
  }
  function save(project, {checkpoint = false, label = 'Autosave'} = {}) {
    const p = clone(project);
    p.id ||= id(); p.savedAt = new Date().toISOString();
    journal(p);
    const work = async () => {
      const old = await read('projects', p.id);
      await transact(['projects','versions'], 'readwrite', tx => {
        if (checkpoint || !old || Date.parse(p.savedAt) - (Date.parse(old.checkpointAt || '') || 0) > 60000) {
          p.checkpointAt = p.savedAt;
          tx.objectStore('versions').put({key: p.id + ':' + Date.now() + ':' + id(), projectId: p.id, savedAt: p.savedAt, label, project: p});
        } else p.checkpointAt = old.checkpointAt;
        tx.objectStore('projects').put(p);
      });
      try {
        const excess = (await history(p.id)).slice(30);
        if (excess.length) await transact(['versions'], 'readwrite', tx => excess.forEach(v => tx.objectStore('versions').delete(v.key)));
      } catch { notice('warning', 'Project saved. Old checkpoints could not be tidied; export a backup if storage is nearly full.'); }
      return p;
    };
    pending = queue.then(work, work); queue = pending.catch(() => {});
    return pending;
  }
  async function history(projectId) {
    const db = await open();
    const values = await new Promise((resolve, reject) => {
      const request = db.transaction('versions').objectStore('versions').index('projectId').getAll(projectId);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    return values.sort((a,b) => b.savedAt.localeCompare(a.savedAt));
  }
  async function recover() {
    const draft = parsed(JOURNAL), legacy = parsed(LEGACY), active = pref(ACTIVE);
    let stored;
    try { stored = active ? await read('projects', active) : null; }
    catch { notice('warning', 'Device storage is unavailable. A recovery copy will be used where possible.'); }
    const candidates = [stored, draft, legacy].filter(p => p && /^SAMI-PROJECT-[123]$/.test(p.format));
    const score = p => Date.parse(p.savedAt || p.createdAt || '') || 0;
    const compatible = candidates.filter(p => !active || !p.id || p.id === active);
    const result = (compatible.length ? compatible : candidates).reduce((a,p) => !a || score(p) >= score(a) ? p : a, null);
    return result;
  }
  async function list() { return (await all('projects')).sort((a,b) => String(b.savedAt || '').localeCompare(String(a.savedAt || ''))); }
  async function duplicate(p, name) {
    const n = clone(p); n.id = id(); n.name = name || p.name + ' — copy'; n.createdAt = new Date().toISOString(); delete n.checkpointAt;
    return save(n, {checkpoint: true, label: 'Duplicated project'});
  }
  async function restore(key) {
    const v = await read('versions', key); if (!v) throw Error('That saved version is unavailable.');
    const current = await read('projects', v.projectId);
    if (current) await save(current, {checkpoint: true, label: 'Before restore'});
    const p = clone(v.project); p.id = v.projectId;
    return save(p, {checkpoint: true, label: 'Restored saved state'});
  }
  async function saveProfile(profile) {
    const p = clone(profile); p.id ||= id();
    await transact(['profiles'], 'readwrite', tx => tx.objectStore('profiles').put(p)); return p;
  }
  root.SAMIProjectStore = {open, save, journal, recover, list, get: projectId => read('projects', projectId), history, versions: history, duplicate, restore, profiles: () => all('profiles'), saveProfile, flush: () => pending};
})(window);
