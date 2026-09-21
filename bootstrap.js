/* Runs before first paint. Explicit user choices survive updates. */
(() => {
  function localStorageSafe(key){try{return localStorage.getItem(key)}catch{return null}}
  try {
    const preference = localStorageSafe('sami.appearance');
    document.documentElement.dataset.theme = preference && preference !== 'system' ? preference : matchMedia('(prefers-color-scheme: dark)').matches ? 'graphite' : 'studioLight';
    document.documentElement.dataset.outdoor = localStorageSafe('sami.outdoor') === 'on' ? 'on' : 'off';
  } catch { document.documentElement.dataset.theme = 'graphite'; }
  const installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  if(!installed)document.documentElement.classList.add('install-required');
  else if(localStorageSafe('sami.launch.seen')!=='yes')document.documentElement.classList.add('intro-running');
  document.documentElement.dataset.reducedMotion=localStorageSafe('sami.reducedMotion')==='on'?'on':'off';
  window.__SAMI_INSTALL_PROMPT__ = null;
  addEventListener('beforeinstallprompt',event => {
    event.preventDefault(); window.__SAMI_INSTALL_PROMPT__ = event;
    window.dispatchEvent(new Event('sami:installready'));
  });
})();
