/* SAMI project storage. One project document, independent saved checkpoints. */
(function (root) {
  "use strict";
  const LEGACY = "sami.project.v1",
    JOURNAL = "sami.recovery.v2",
    ACTIVE = "sami.active.v2";
  let database = null,
    queue = Promise.resolve();
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const notice = (state, message) =>
    root.dispatchEvent(
      new CustomEvent("sami:storage", { detail: { state, message } }),
    );
  function id() {
    return (
      root.crypto?.randomUUID?.() ||
      "project-" + Date.now() + "-" + Math.random().toString(36).slice(2)
    );
  }
  function open() {
    if (database) return database;
    database = new Promise((resolve, reject) => {
      const r = indexedDB.open("sami-projects", 2);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains("projects"))
          db.createObjectStore("projects", { keyPath: "id" });
        if (!db.objectStoreNames.contains("versions")) {
          const v = db.createObjectStore("versions", { keyPath: "key" });
          v.createIndex("projectId", "projectId");
        }
        if (!db.objectStoreNames.contains("profiles"))
          db.createObjectStore("profiles", { keyPath: "id" });
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.onblocked = () =>
        notice("warning", "Close other SAMI tabs so device storage can open.");
    });
    return database;
  }
  async function transact(stores, mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(stores, mode);
      let result;
      try {
        result = fn(tx);
      } catch (e) {
        tx.abort();
        reject(e);
        return;
      }
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || Error("Storage interrupted"));
    });
  }
  async function get(store, key) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const r = db.transaction(store).objectStore(store).get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async function all(store) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const r = db.transaction(store).objectStore(store).getAll();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  function journal(project) {
    try {
      localStorage.setItem(JOURNAL, JSON.stringify(project));
      localStorage.setItem(ACTIVE, project.id);
      return true;
    } catch {
      notice(
        "warning",
        "The quick recovery copy is full. The project will still save to device storage; export a SAMI backup now.",
      );
      return false;
    }
  }
  function save(project, { checkpoint = false, label = "Autosave" } = {}) {
    const p = clone(project);
    p.id ||= id();
    p.savedAt = new Date().toISOString();
    journal(p);
    const work = async () => {
      const old = await get("projects", p.id);
      await transact(["projects", "versions"], "readwrite", (tx) => {
        if (
          checkpoint ||
          !old ||
          Date.parse(p.savedAt) - Date.parse(old.checkpointAt || 0) > 60000
        ) {
          tx.objectStore("versions").put({
            key: p.id + ":" + Date.now() + ":" + id(),
            projectId: p.id,
            savedAt: p.savedAt,
            label,
            project: p,
          });
          p.checkpointAt = p.savedAt;
        } else p.checkpointAt = old.checkpointAt;
        tx.objectStore("projects").put(p);
      });
      const versions = (await history(p.id)).slice(30);
      if (versions.length)
        await transact(["versions"], "readwrite", (tx) =>
          versions.forEach((v) => tx.objectStore("versions").delete(v.key)),
        );
      return p;
    };
    const result = queue.then(work, work);
    queue = result.catch(() => {});
    return result;
  }
  async function history(projectId) {
    return (await all("versions"))
      .filter((x) => x.projectId === projectId)
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  }
  async function recover() {
    let draft, legacy;
    try {
      draft = JSON.parse(localStorage.getItem(JOURNAL) || "null");
      legacy = JSON.parse(localStorage.getItem(LEGACY) || "null");
    } catch {}
    const active = localStorage.getItem(ACTIVE);
    let stored;
    try {
      stored = active ? await get("projects", active) : null;
    } catch {}
    if (
      draft &&
      (!stored ||
        Date.parse(draft.savedAt || 0) >= Date.parse(stored.savedAt || 0))
    )
      return draft;
    return stored || legacy || null;
  }
  async function list() {
    return (await all("projects")).sort((a, b) =>
      String(b.savedAt || "").localeCompare(String(a.savedAt || "")),
    );
  }
  async function duplicate(p, name) {
    const n = clone(p);
    n.id = id();
    n.name = name || p.name + " — copy";
    n.createdAt = new Date().toISOString();
    delete n.checkpointAt;
    await save(n, { checkpoint: true, label: "Duplicated project" });
    return n;
  }
  async function restore(key) {
    const v = await get("versions", key);
    if (!v) throw Error("That saved version is unavailable.");
    const current = await get("projects", v.projectId);
    if (current)
      await save(current, { checkpoint: true, label: "Before restore" });
    const p = clone(v.project);
    p.savedAt = new Date().toISOString();
    await save(p, { checkpoint: true, label: "Restored saved state" });
    return p;
  }
  async function saveProfile(profile) {
    const p = clone(profile);
    p.id ||= id();
    await transact(["profiles"], "readwrite", (tx) =>
      tx.objectStore("profiles").put(p),
    );
    return p;
  }
  root.SAMIProjectStore = {
    open,
    save,
    journal,
    recover,
    list,
    get: (projectId) => get("projects", projectId),
    history,
    duplicate,
    restore,
    profiles: () => all("profiles"),
    saveProfile,
    flush: () => queue,
  };
})(window);
