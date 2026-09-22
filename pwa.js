/* Install/update lifecycle. Updating is an explicit save-and-reload action. */
(() => {
  "use strict";
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol))
    return;
  let registration,
    banner,
    reloading = false;
  function announce(worker) {
    if (!worker || !navigator.serviceWorker.controller) return;
    if (!banner) {
      banner = document.createElement("section");
      banner.id = "updateBanner";
      banner.className = "update-banner";
      banner.setAttribute("aria-label", "SAMI update");
      const label = document.createElement("span");
      label.textContent = "Update available";
      label.setAttribute("role", "status");
      const reload = document.createElement("button");
      reload.type = "button";
      reload.textContent = "Save & reload";
      reload.className = "primary";
      const later = document.createElement("button");
      later.type = "button";
      later.textContent = "Later";
      later.onclick = () => (banner.hidden = true);
      reload.onclick = async () => {
        reload.disabled = true;
        try {
          await window.SAMIWorkspace?.ready;
          if (
            !(await window.SAMIWorkspace?.save?.(true, "Before app update"))
          ) {
            window.SAMIField?.showDataSafety?.();
            return;
          }
          const waiting = registration?.waiting;
          if (!waiting) {
            location.reload();
            return;
          }
          reloading = true;
          waiting.postMessage({ type: "ACTIVATE_UPDATE" });
        } finally {
          reload.disabled = false;
        }
      };
      banner.append(label, reload, later);
      document.body.append(banner);
    }
    banner.hidden = false;
  }
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) location.reload();
  });
  navigator.serviceWorker
    .register(window.SAMI_VERSION.asset("sw.js"), { updateViaCache: "none" })
    .then((reg) => {
      registration = reg;
      if (reg.waiting) announce(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed") announce(reg.waiting || worker);
        });
      });
      window.addEventListener("online", () => reg.update().catch(() => {}));
    })
    .catch(() => {
      window.SAMIField?.storageNotice?.(
        "warning",
        "Offline app files could not be prepared. Keep this window open and reconnect before closing.",
      );
    });
})();
