/* SAMI field reliability UI. Device preferences stay outside portable projects. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  let api, mounted = false, warning = '', warningState = '', persistence = 'Not requested';
  let wakeSentinel = null, requestingWake = false;
  const pref = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const setPref = (key,value) => { try { localStorage.setItem(key,value); return true; } catch { return false; } };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function storageNotice(state, message) {
    warningState = state; warning = message;
    const notice = $('#storageNotice');
    if (notice) { notice.hidden = false; notice.textContent = message; notice.dataset.state = state; }
    $('#saveState')?.setAttribute('title', message);
  }
  function backupText() {
    const at = pref('sami.backup.' + api?.state.project.id);
    return at ? 'Backup requested ' + new Date(at).toLocaleString('en-GB') : 'No backup exported for this project';
  }
  function backupRequested(id) {
    setPref('sami.backup.' + id, new Date().toISOString());
    if ($('#backupStatus')) $('#backupStatus').textContent = backupText();
    api?.toast('Backup download requested. Check that the .sami file is in your downloads.');
  }
  async function requestPersistence() {
    if (!navigator.storage?.persist) { persistence = 'This browser does not offer protected storage'; return false; }
    try {
      const ok = await navigator.storage.persist();
      persistence = ok ? 'Protected storage granted' : 'Protection not granted — keep a separate backup';
      return ok;
    } catch { persistence = 'Storage protection unavailable — keep a separate backup'; return false; }
  }
  async function showDataSafety() {
    if (!api) return;
    api.showModal('Project backup & storage', `<p id="storageNotice" class="field-notice" role="status" ${warning ? '' : 'hidden'}>${esc(warning)}</p><p><strong id="dataSaveStatus">${esc($('#saveState')?.textContent)}</strong></p><div class="button-pair"><button data-field="retry">Save / retry</button><button data-field="export" class="primary">Export project backup</button></div><button data-field="import" class="wide-btn">Import backup as a new project</button><p id="backupStatus" class="subtle">${esc(backupText())}</p><p class="subtle">A backup includes this project's drawing, photographs, logos and saved records. Downloading starts a file transfer; check the file was saved. Browser/device preferences and API keys are not included.</p><div class="section-title">Device storage</div><p id="storageEstimate" role="status">Checking available storage…</p><p id="storageProtection">${esc(persistence)}</p><button data-field="protect">Protect saved projects</button><p class="subtle">Keep a separate backup before clearing browser data, uninstalling or changing device. Protection depends on your browser.</p>`);
    $('#modalBody').onclick = async event => {
      const button = event.target.closest('[data-field]'); if (!button) return;
      const action = button.dataset.field;
      if (action === 'export') { api.exportBackup(); return; }
      if (action === 'import') { api.closeModal(); api.runAction('openProject'); return; }
      button.disabled = true;
      try {
        if (action === 'retry') { await api.save(true,'Manual retry'); if ($('#dataSaveStatus')) $('#dataSaveStatus').textContent = $('#saveState').textContent; }
        if (action === 'protect') { await requestPersistence(); if ($('#storageProtection')) $('#storageProtection').textContent = persistence; }
      } finally { button.disabled = false; }
    };
    try {
      const estimate = await navigator.storage?.estimate?.();
      const persisted = await navigator.storage?.persisted?.();
      if (persisted) persistence = 'Protected storage granted';
      if ($('#storageEstimate')) $('#storageEstimate').textContent = estimate?.quota ? `${(estimate.usage / 1048576).toFixed(1)} MB used of approximately ${(estimate.quota / 1048576).toFixed(0)} MB available to this site.` : 'Storage estimates are unavailable in this browser.';
      if ($('#storageProtection')) $('#storageProtection').textContent = persistence;
    } catch { if ($('#storageEstimate')) $('#storageEstimate').textContent = 'Storage estimate unavailable. You can still export a backup.'; }
  }
  const activeTask = () => !!api?.state.tool || document.body.classList.contains('precision-active');
  async function updateWake() {
    const enabled = pref('sami.wakeLock') === 'on';
    const want = enabled && activeTask() && !document.hidden;
    if ((!want || !navigator.wakeLock) && wakeSentinel) { const w = wakeSentinel; wakeSentinel = null; await w.release().catch(() => {}); }
    if (want && navigator.wakeLock && !wakeSentinel && !requestingWake) {
      requestingWake = true;
      try { wakeSentinel = await navigator.wakeLock.request('screen'); wakeSentinel.addEventListener('release', () => { wakeSentinel = null; wakeStatus(); }, {once:true}); }
      catch {}
      finally { requestingWake = false; }
    }
    wakeStatus();
  }
  function wakeStatus() {
    const text = !navigator.wakeLock ? 'Keep awake unavailable in this browser' : wakeSentinel ? 'Screen stays awake while drawing' : pref('sami.wakeLock') === 'on' ? 'Keep awake ready · starts while drawing' : 'Keep screen awake: off';
    const button = $('#wakeLockButton');
    if (button) { button.setAttribute('aria-pressed', String(pref('sami.wakeLock') === 'on')); button.setAttribute('aria-label', text); button.title = text; button.classList.toggle('active', !!wakeSentinel); }
    if ($('#wakeLockStatus')) $('#wakeLockStatus').textContent = text;
  }
  function applyContrast() {
    const root=document.documentElement,style=getComputedStyle(root),accent=style.getPropertyValue('--accent').trim();
    const lum=hex=>{const rgb=(hex.match(/[a-f0-9]{2}/gi)||[]).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb.reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);};
    if(/^#[a-f0-9]{6}$/i.test(accent)) {
      const l=lum(accent);root.style.setProperty('--accent-ink',(l+.05)/.05>=4.5?'#07120b':'#ffffff');
      const light=['studioLight','arcticLight','paper'].includes(root.dataset.theme)||root.dataset.outdoor==='on';
      const panel=style.getPropertyValue('--panel').trim();const p=lum(panel);const ratio=(Math.max(l,p)+.05)/(Math.min(l,p)+.05);
      root.style.setProperty('--accent-text',ratio>=4.5?accent:(light?'#145331':'#b9f4d4'));
    }
  }
  function mount(workspace) {
    api = workspace; if (mounted) return; mounted = true; applyContrast();
    const save = $('#saveState'); if (save) { save.setAttribute('aria-label','Save status — project backup and storage'); save.onclick = showDataSafety; }
    const backup = $('#backupButton'); if (backup) backup.onclick = () => api.exportBackup();
    const mapControls=$('.map-controls');
    if (mapControls) {
      const wake = document.createElement('button'); wake.id = 'wakeLockButton'; wake.type = 'button'; wake.textContent = '☀'; wake.onclick = async () => { setPref('sami.wakeLock',pref('sami.wakeLock') === 'on' ? 'off' : 'on'); await updateWake(); api.toast(wake.title); };
      mapControls.append(wake);
      for (const [id,label] of [['undoBtn','Undo'],['redoBtn','Redo']]) { const button = $('#'+id); if(button) { button.setAttribute('aria-label',label); mapControls.append(button); } }
    }
    wakeStatus();
    new MutationObserver(updateWake).observe(document.body,{attributes:true,attributeFilter:['class']});
    if ($('#drawStatus')) new MutationObserver(updateWake).observe($('#drawStatus'),{attributes:true,attributeFilter:['hidden']});
    document.addEventListener('visibilitychange',updateWake);
    window.addEventListener('pagehide',()=>{wakeSentinel?.release().catch(()=>{});});
    const retry = document.createElement('button');retry.id='storageWarning';retry.type='button';retry.className='storage-warning';retry.hidden=true;retry.onclick=showDataSafety;$('#app')?.append(retry);
    if(warning) {retry.hidden=false;retry.textContent=warning+' Review storage';}
    window.addEventListener('sami:storage',e=>{retry.hidden=false;retry.textContent=e.detail.message+' Review storage';});
    window.addEventListener('sami:saved',()=>{if(warningState==='failed'){warning='';warningState='';retry.hidden=true;}});
    document.addEventListener('keydown',event=>{ if(event.key==='Escape'&&$('#modal')&&!$('#modal').classList.contains('hidden')){event.preventDefault();api.closeModal();} });
  }
  window.addEventListener('sami:storage',e=>storageNotice(e.detail.state,e.detail.message));
  window.SAMIField = {mount,showDataSafety,storageNotice,backupRequested,requestPersistence,updateWake,applyContrast};
})();
