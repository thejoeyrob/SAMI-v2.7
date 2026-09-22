/* Shared, explicit geocoding requests. No autocomplete or map-tile prefetch. */
(() => {
  "use strict";
  const cache = new Map(),
    pending = new Map();
  let queue = Promise.resolve(),
    nextStart = 0;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  function deliver(promise, signal) {
    if (!signal) return promise;
    if (signal.aborted)
      return Promise.reject(
        signal.reason || new DOMException("Cancelled", "AbortError"),
      );
    return new Promise((resolve, reject) => {
      const abort = () =>
        reject(signal.reason || new DOMException("Cancelled", "AbortError"));
      signal.addEventListener("abort", abort, { once: true });
      promise
        .then(resolve, reject)
        .finally(() => signal.removeEventListener("abort", abort));
    });
  }
  async function request(url, options = {}) {
    const key = String(url),
      hit = cache.get(key);
    if (hit && Date.now() - hit.at < 15 * 60 * 1000)
      return new Response(hit.text, {
        headers: { "Content-Type": "application/json" },
      });
    let job = pending.get(key);
    if (!job) {
      job = queue
        .catch(() => {})
        .then(async () => {
          await wait(Math.max(0, nextStart - Date.now()));
          nextStart = Date.now() + 1100;
          const controller = new AbortController(),
            timer = setTimeout(() => controller.abort(), 10000);
          try {
            const response = await fetch(key, {
              headers: { Accept: "application/json" },
              signal: controller.signal,
            });
            if (!response.ok) {
              if (response.status === 429)
                nextStart = Math.max(
                  nextStart,
                  Date.now() +
                    Math.min(
                      60000,
                      Math.max(
                        2000,
                        (Number(response.headers.get("Retry-After")) || 5) *
                          1000,
                      ),
                    ),
                );
              throw Error(
                "Address service unavailable. Map drawing and saved projects still work. Try again shortly.",
              );
            }
            const reader = response.body.getReader(),
              parts = [];
            let bytes = 0;
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              bytes += value.byteLength;
              if (bytes > 1048576) {
                await reader.cancel();
                throw Error("Address response was too large.");
              }
              parts.push(value);
            }
            const text = await new Blob(parts).text();
            JSON.parse(text);
            cache.set(key, { text, at: Date.now() });
            if (cache.size > 50) cache.delete(cache.keys().next().value);
            return text;
          } finally {
            clearTimeout(timer);
          }
        });
      pending.set(key, job);
      queue = job;
      job.then(
        () => pending.delete(key),
        () => pending.delete(key),
      );
    }
    const text = await deliver(job, options.signal);
    return new Response(text, {
      headers: { "Content-Type": "application/json" },
    });
  }
  window.SAMINetwork = Object.freeze({ geocode: request });
})();
