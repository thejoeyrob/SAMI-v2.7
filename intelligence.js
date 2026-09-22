(() => {
  "use strict";
  const norm = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  const unitFactor = (u) => {
    u = norm(u);
    return /^(ft|feet|foot)$/.test(u)
      ? 0.3048
      : /^(cm|centimetre|centimeter)/.test(u)
        ? 0.01
        : /^(mm|millimetre|millimeter)/.test(u)
          ? 0.001
          : 1;
  };
  function parseDimensions(text) {
    const s = norm(text).replace(/,/g, ".");
    const m = s.match(
      /(\d+(?:\.\d+)?)\s*(m|metres?|meters?|cm|centimetres?|centimeters?|mm|millimetres?|millimeters?|ft|feet|foot)?\s*(?:x|×|by)\s*(\d+(?:\.\d+)?)\s*(m|metres?|meters?|cm|centimetres?|centimeters?|mm|millimetres?|millimeters?|ft|feet|foot)?/i,
    );
    if (!m) return null;
    const shared = m[4] || m[2] || "m",
      a = +m[1] * unitFactor(m[2] || shared),
      b = +m[3] * unitFactor(m[4] || shared);
    if (!(a > 0 && b > 0 && Number.isFinite(a) && Number.isFinite(b)))
      return null;
    return { widthM: +a.toFixed(4), heightM: +b.toFixed(4), raw: m[0] };
  }
  function detectProduct(text) {
    const s = norm(text);
    if (/\blion\b/.test(s)) return "lion";
    if (/\bhybrid\b/.test(s)) return "hybrid";
    if (/\btuff\s*-?\s*trak\b|\btufftrak\b|\btuff\b/.test(s)) return "tuff";
    if (/\bsabre\s*-?\s*x\b|\bsabre\b/.test(s)) return "sabre";
    return null;
  }
  function detectFitMode(text) {
    const s = norm(text);
    if (
      /\bat least\b|\bminimum\b|\bno smaller\b|\bnot less than\b|\bmust cover\b|\bcover at least\b/.test(
        s,
      )
    )
      return "atLeast";
    if (
      /\bfit inside\b|\bwithin\b|\bmaximum\b|\bno bigger\b|\bnot exceed\b|\bmust not exceed\b/.test(
        s,
      )
    )
      return "inside";
    return "closest";
  }
  function span(count, full, overlap) {
    if (count < 1) return 0;
    const step = Math.max(0.001, full - Math.max(0, +overlap || 0));
    return full + (count - 1) * step;
  }
  function countCandidates(target, full, overlap, mode) {
    const step = Math.max(0.001, full - Math.max(0, +overlap || 0));
    const exact = target <= full ? 1 : 1 + (target - full) / step;
    const lo = Math.floor(exact),
      hi = Math.ceil(exact);
    if (mode === "atLeast") return [Math.max(1, hi)];
    if (mode === "inside") {
      if (full > target + 1e-9) return [];
      return [Math.max(1, lo)];
    }
    return [lo, hi, lo - 1, hi + 1]
      .map((n) => Math.max(1, n))
      .filter((n, i, a) => a.indexOf(n) === i);
  }
  function solvePanelGrid(
    targetWidth,
    targetHeight,
    product,
    mode = "closest",
  ) {
    const tw = +targetWidth,
      th = +targetHeight,
      p = product || {};
    if (!(tw > 0 && th > 0 && p.length > 0 && p.width > 0))
      throw Error("Valid target and panel dimensions are required.");
    const options = [];
    for (const longOnX of [true, false]) {
      const fullX = longOnX ? +p.length : +p.width,
        overlapX = longOnX ? +p.overlap || 0 : +p.lateralOverlap || 0,
        fullY = longOnX ? +p.width : +p.length,
        overlapY = longOnX ? +p.lateralOverlap || 0 : +p.overlap || 0;
      const xs = countCandidates(tw, fullX, overlapX, mode),
        ys = countCandidates(th, fullY, overlapY, mode);
      for (const nx of xs)
        for (const ny of ys) {
          const aw = span(nx, fullX, overlapX),
            ah = span(ny, fullY, overlapY);
          if (mode === "atLeast" && (aw + 1e-9 < tw || ah + 1e-9 < th))
            continue;
          if (mode === "inside" && (aw - 1e-9 > tw || ah - 1e-9 > th)) continue;
          const dw = Math.abs(aw - tw),
            dh = Math.abs(ah - th),
            maxRel = Math.max(dw / tw, dh / th),
            sumRel = dw / tw + dh / th,
            areaRel = Math.abs(aw * ah - tw * th) / (tw * th),
            count = nx * ny;
          options.push({
            nx,
            ny,
            longOnX,
            actualWidth: aw,
            actualHeight: ah,
            panelCount: count,
            diffWidth: aw - tw,
            diffHeight: ah - th,
            score: maxRel * 1000 + sumRel * 100 + areaRel * 10 + count / 100000,
          });
        }
    }
    if (!options.length)
      throw Error(
        mode === "inside"
          ? "No whole-panel layout fits inside that size."
          : "No practical whole-panel layout was found.",
      );
    options.sort((a, b) => a.score - b.score || a.panelCount - b.panelCount);
    return { ...options[0], targetWidth: tw, targetHeight: th, mode };
  }
  function parsePanelPadRequest(text) {
    const s = norm(text),
      dims = parseDimensions(s);
    if (!dims) return null;
    const product = detectProduct(s);
    const hasPanel =
        /\bpanels?\b|\btrakway\b|\blion\b|\bhybrid\b|\btuff(?:trak)?\b|\bsabre(?:-x)?\b/.test(
          s,
        ),
      hasShape =
        /\bpad\b|\barea\b|\bplatform\b|\bmat\b|\bhardstanding\b|\bdeck\b|\bbase\b/.test(
          s,
        );
    if (
      !hasPanel ||
      (!hasShape &&
        !/\bcreate\b|\bmake\b|\bbuild\b|\bgive me\b|\bi need\b/.test(s))
    )
      return null;
    return { type: "panelPad", product, fitMode: detectFitMode(s), ...dims };
  }
  const BUILTIN_ASSET_ALIASES = {
    concreteMixer8: [
      "cement delivery truck",
      "concrete delivery truck",
      "concrete mixer",
      "mixer truck",
      "ready mix truck",
      "readymix truck",
      "cement mixer truck",
    ],
    telehandler: ["telehandler", "tele handler"],
    forklift: ["forklift", "fork lift"],
    artic: ["articulated hgv", "artic truck", "45 ft artic", "45ft artic"],
    rigid: ["rigid hgv", "rigid truck"],
    van: ["3.5t van", "3.5 t van", "site van"],
    skip: ["skip"],
    generator: ["generator"],
    fuel: ["fuel bowser", "fuel tank", "bowser"],
    wheelwash: ["wheel wash", "wheelwash"],
    toilet: ["portable toilet", "site toilet"],
    fire: ["fire point"],
    muster: ["muster point"],
    firstaid: ["first aid point", "first aid"],
  };
  function detectBuiltinAsset(text) {
    const s = norm(text);
    let best = null;
    for (const [k, aliases] of Object.entries(BUILTIN_ASSET_ALIASES))
      for (const a of aliases)
        if (s.includes(a) && (!best || a.length > best.alias.length))
          best = { kind: k, alias: a };
    return best?.kind || null;
  }
  function parseRequest(text) {
    return (
      parsePanelPadRequest(text) ||
      (() => {
        const k = detectBuiltinAsset(text);
        return k ? { type: "asset", kind: k } : null;
      })()
    );
  }
  window.SamiIntelligentObject = {
    parseDimensions,
    detectProduct,
    detectFitMode,
    solvePanelGrid,
    parsePanelPadRequest,
    detectBuiltinAsset,
    parseRequest,
    span,
    version: "1.0.0",
  };
})();
