/* Optional feature scripts are local, version pinned and included in the offline shell. */
(() => {
  'use strict';
  const pending=new Map(),features={qr:['qrcode.js','SAMI_QRCode'],shapes:['shape-import.js','SAMIShapeImport']};
  window.SAMILoadFeature = name => {
    const feature=features[name];if(!feature)return Promise.reject(Error('Unknown SAMI feature'));
    const [file,global]=feature;if(window[global])return Promise.resolve();if(pending.has(name))return pending.get(name);
    const promise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=window.SAMI_VERSION.asset(file);script.async=true;
      const fail=()=>{clearTimeout(timer);script.remove();pending.delete(name);reject(Error('This tool could not load. Reconnect once to prepare offline files, then retry.'));};
      const timer=setTimeout(fail,15000);script.onerror=fail;script.onload=()=>{clearTimeout(timer);if(window[global])resolve();else fail();};document.head.append(script);
    });pending.set(name,promise);return promise;
  };
})();
