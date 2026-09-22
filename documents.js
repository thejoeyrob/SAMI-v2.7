(function () {
  "use strict";
  const PT = 72 / 25.4,
    G = window.SamiGeometry;
  const SERVICE_COLORS = {
    electric: "#d92929",
    gas: "#d69b00",
    water: "#167fc3",
    drainage: "#735542",
    telecom: "#bc671e",
    ohl: "#bb3f98",
    ecology: "#2f8e55",
    sssi: "#3f8744",
    tpo: "#1e7868",
    heritage: "#86529a",
    archaeology: "#aa654c",
    flood: "#3779b6",
    conservation: "#567e6a",
    other: "#687aac",
  };
  const REPL = {
    "–": "-",
    "—": "-",
    "→": "->",
    "←": "<-",
    "×": "x",
    "•": "*",
    "·": "-",
    "“": '"',
    "”": '"',
    "’": "'",
    "£": "GBP ",
    "°": " deg ",
    "…": "...",
    "☑": "[x]",
    "☐": "[ ]",
  };
  function ascii(s) {
    return String(s ?? "")
      .replace(/[–—→←×•·“”’£°…☑☐]/g, (c) => REPL[c] || c)
      .replace(/[^\x20-\x7E\n]/g, "?");
  }
  function escPdf(s) {
    return ascii(s)
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }
  function hex(h) {
    h = String(h || "#000").replace("#", "");
    if (h.length === 3)
      h = h
        .split("")
        .map((x) => x + x)
        .join("");
    const n = parseInt(h, 16) || 0;
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  function fmt(n) {
    return Number(n || 0)
      .toFixed(3)
      .replace(/\.000$/, "");
  }
  function mm(n) {
    return n * PT;
  }
  function u8(s) {
    return new TextEncoder().encode(s);
  }
  function concat(arrs) {
    let n = 0;
    for (const a of arrs) n += a.length;
    const out = new Uint8Array(n);
    let p = 0;
    for (const a of arrs) {
      out.set(a, p);
      p += a.length;
    }
    return out;
  }
  function pdfTextSizeApprox(text, size) {
    return (ascii(text).length * size * 0.49) / PT;
  }
  function wrap(text, maxMm, size) {
    const words = ascii(text).replace(/\s+/g, " ").trim().split(" "),
      lines = [];
    let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (pdfTextSizeApprox(t, size) <= maxMm) line = t;
      else {
        if (line) lines.push(line);
        line = w;
      }
    }
    if (line) lines.push(line);
    return lines;
  }
  class PDF {
    constructor(wMm, hMm, logicalW = wMm, logicalH = hMm) {
      this.w = wMm;
      this.h = hMm;
      this.logicalW = logicalW;
      this.logicalH = logicalH;
      this.objs = [];
      this.pages = [];
      this.images = [];
      this.fontId = this.obj(
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      );
      this.fontBoldId = this.obj(
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
      );
    }
    obj(data) {
      this.objs.push(data);
      return this.objs.length;
    }
    addImageJPEG(bytes, width, height) {
      const head = `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`;
      const data = concat([u8(head), bytes, u8("\nendstream")]);
      const id = this.obj(data);
      this.images.push(id);
      return id;
    }
    addPage(content, imageIds = []) {
      this.pages.push({ content, imageIds });
    }
    build() {
      const pageIds = [],
        contentIds = [];
      for (const p of this.pages) {
        contentIds.push(
          this.obj(
            `<< /Length ${u8(p.content).length} >>\nstream\n${p.content}\nendstream`,
          ),
        );
        pageIds.push(null);
      }
      const pagesId = this.objs.length + this.pages.length + 1;
      for (let i = 0; i < this.pages.length; i++) {
        const p = this.pages[i],
          x = p.imageIds.map((id, j) => `/Im${j + 1} ${id} 0 R`).join(" ");
        const res = `<< /Font << /F1 ${this.fontId} 0 R /F2 ${this.fontBoldId} 0 R >>${x ? ` /XObject << ${x} >>` : ""} >>`;
        pageIds[i] = this.obj(
          `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${fmt(mm(this.w))} ${fmt(mm(this.h))}] /Resources ${res} /Contents ${contentIds[i]} 0 R >>`,
        );
      }
      const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
      this.obj(`<< /Type /Pages /Count ${pageIds.length} /Kids [${kids}] >>`);
      const catalogId = this.obj(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
      const infoId = this.obj(
        `<< /Title (${escPdf("SAMI Site Logistics Pack")}) /Creator (${escPdf("SAMI Document Engine")}) /Producer (${escPdf("SAMI - JW EDS")}) >>`,
      );
      let parts = [u8("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")],
        offset = parts[0].length,
        offsets = [0];
      for (let i = 0; i < this.objs.length; i++) {
        offsets.push(offset);
        const data =
          this.objs[i] instanceof Uint8Array ? this.objs[i] : u8(this.objs[i]);
        const chunk = concat([u8(`${i + 1} 0 obj\n`), data, u8("\nendobj\n")]);
        parts.push(chunk);
        offset += chunk.length;
      }
      const xref = offset;
      let xs = `xref\n0 ${this.objs.length + 1}\n0000000000 65535 f \n`;
      for (let i = 1; i < offsets.length; i++)
        xs += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
      xs += `trailer\n<< /Size ${this.objs.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
      parts.push(u8(xs));
      return new Blob([concat(parts)], { type: "application/pdf" });
    }
  }
  class Page {
    constructor(pdf) {
      this.pdf = pdf;
      this.w = pdf.logicalW || pdf.w;
      this.h = pdf.logicalH || pdf.h;
      this.c = [];
      this.imageIds = [];
    }
    y(y) {
      return mm(this.h - y);
    }
    stroke(color = "#000", width = 0.25, dash = null) {
      const [r, g, b] = hex(color);
      this.c.push(`${fmt(r)} ${fmt(g)} ${fmt(b)} RG ${fmt(mm(width))} w`);
      this.c.push(
        dash ? `[${dash.map((v) => fmt(mm(v))).join(" ")}] 0 d` : "[] 0 d",
      );
    }
    fill(color = "#fff") {
      const [r, g, b] = hex(color);
      this.c.push(`${fmt(r)} ${fmt(g)} ${fmt(b)} rg`);
    }
    line(x1, y1, x2, y2, color = "#000", width = 0.25, dash = null) {
      this.stroke(color, width, dash);
      this.c.push(
        `${fmt(mm(x1))} ${fmt(this.y(y1))} m ${fmt(mm(x2))} ${fmt(this.y(y2))} l S`,
      );
    }
    rect(x, y, w, h, stroke = "#000", fill = null, width = 0.25) {
      if (fill) {
        this.fill(fill);
        this.stroke(stroke, width);
        this.c.push(
          `${fmt(mm(x))} ${fmt(this.y(y + h))} ${fmt(mm(w))} ${fmt(mm(h))} re B`,
        );
      } else {
        this.stroke(stroke, width);
        this.c.push(
          `${fmt(mm(x))} ${fmt(this.y(y + h))} ${fmt(mm(w))} ${fmt(mm(h))} re S`,
        );
      }
    }
    poly(points, stroke = "#000", fill = null, width = 0.25, dash = null) {
      if (!points?.length) return;
      this.stroke(stroke, width, dash);
      if (fill) this.fill(fill);
      let s = `${fmt(mm(points[0][0]))} ${fmt(this.y(points[0][1]))} m `;
      for (let i = 1; i < points.length; i++)
        s += `${fmt(mm(points[i][0]))} ${fmt(this.y(points[i][1]))} l `;
      s += fill ? "h B" : "S";
      this.c.push(s);
    }
    text(text, x, y, size = 8, bold = false, color = "#111", opts = {}) {
      const [r, g, b] = hex(color),
        font = bold ? "F2" : "F1";
      this.c.push(
        `BT /${font} ${fmt(size)} Tf ${fmt(r)} ${fmt(g)} ${fmt(b)} rg ${fmt(mm(x))} ${fmt(this.y(y))} Td (${escPdf(text)}) Tj ET`,
      );
    }
    wrapped(
      text,
      x,
      y,
      w,
      size = 7.2,
      bold = false,
      color = "#222",
      leading = 3.6,
      maxLines = 99,
    ) {
      const lines = wrap(text, w, size).slice(0, maxLines);
      lines.forEach((l, i) =>
        this.text(l, x, y + i * leading, size, bold, color),
      );
      return y + lines.length * leading;
    }
    circle(cx, cy, r, stroke = "#000", fill = null, width = 0.25) {
      const k = 0.5522847498,
        X = mm(cx),
        Y = this.y(cy),
        R = mm(r);
      this.stroke(stroke, width);
      if (fill) this.fill(fill);
      const op = fill ? "B" : "S";
      this.c.push(
        `${fmt(X + R)} ${fmt(Y)} m ${fmt(X + R)} ${fmt(Y + k * R)} ${fmt(X + k * R)} ${fmt(Y + R)} ${fmt(X)} ${fmt(Y + R)} c ${fmt(X - k * R)} ${fmt(Y + R)} ${fmt(X - R)} ${fmt(Y + k * R)} ${fmt(X - R)} ${fmt(Y)} c ${fmt(X - R)} ${fmt(Y - k * R)} ${fmt(X - k * R)} ${fmt(Y - R)} ${fmt(X)} ${fmt(Y - R)} c ${fmt(X + k * R)} ${fmt(Y - R)} ${fmt(X + R)} ${fmt(Y - k * R)} ${fmt(X + R)} ${fmt(Y)} c ${op}`,
      );
    }
    image(jpeg, x, y, w, h) {
      const id = this.pdf.addImageJPEG(jpeg.bytes, jpeg.width, jpeg.height);
      this.imageIds.push(id);
      const idx = this.imageIds.length;
      this.c.push(
        `q ${fmt(mm(w))} 0 0 ${fmt(mm(h))} ${fmt(mm(x))} ${fmt(this.y(y + h))} cm /Im${idx} Do Q`,
      );
    }
    done() {
      let content = this.c.join("\n");
      const sx = this.pdf.w / this.w,
        sy = this.pdf.h / this.h;
      if (Math.abs(sx - 1) > 0.0001 || Math.abs(sy - 1) > 0.0001)
        content = `q ${fmt(sx)} 0 0 ${fmt(sy)} 0 0 cm\n${content}\nQ`;
      this.pdf.addPage(content, this.imageIds);
    }
  }
  function boundsOfGeom(g) {
    if (!g) return null;
    const pts = [];
    (function rec(v) {
      if (Array.isArray(v) && typeof v[0] === "number") pts.push(v);
      else if (Array.isArray(v)) v.forEach(rec);
    })(g.coordinates);
    if (!pts.length) return null;
    return [
      Math.min(...pts.map((p) => p[0])),
      Math.min(...pts.map((p) => p[1])),
      Math.max(...pts.map((p) => p[0])),
      Math.max(...pts.map((p) => p[1])),
    ];
  }
  function mergeBounds(bs) {
    const a = bs.filter(Boolean);
    if (!a.length) return null;
    return [
      Math.min(...a.map((b) => b[0])),
      Math.min(...a.map((b) => b[1])),
      Math.max(...a.map((b) => b[2])),
      Math.max(...a.map((b) => b[3])),
    ];
  }
  function expandBounds(b, m) {
    if (!b) return null;
    const lat = (b[1] + b[3]) / 2,
      dy = m / 110540,
      dx = m / (111320 * Math.cos((lat * Math.PI) / 180) || 1);
    return [b[0] - dx, b[1] - dy, b[2] + dx, b[3] + dy];
  }
  function localProject(bounds) {
    const lon0 = (bounds[0] + bounds[2]) / 2,
      lat0 = (bounds[1] + bounds[3]) / 2,
      cosLat = Math.cos((lat0 * Math.PI) / 180);
    return (coord) => [
      (coord[0] - lon0) * 111320 * cosLat,
      (coord[1] - lat0) * 110540,
    ];
  }
  function standardScale(raw) {
    const std = [
      50, 100, 125, 200, 250, 500, 1000, 1250, 2000, 2500, 5000, 10000, 12500,
      25000, 50000, 100000, 250000, 500000,
    ];
    return std.find((s) => s >= raw) || Math.ceil(raw / 100000) * 100000;
  }
  function makeTransform(bounds, box) {
    const pr = localProject(bounds),
      a = pr([bounds[0], bounds[1]]),
      b = pr([bounds[2], bounds[3]]),
      wm = Math.abs(b[0] - a[0]),
      hm = Math.abs(b[1] - a[1]),
      scale = standardScale(Math.max((wm / box.w) * 1000, (hm / box.h) * 1000)),
      mmPerM = 1000 / scale,
      cx = (bounds[0] + bounds[2]) / 2,
      cy = (bounds[1] + bounds[3]) / 2,
      pc = pr([cx, cy]);
    return {
      scale,
      point(c) {
        const p = pr(c);
        return [
          box.x + box.w / 2 + (p[0] - pc[0]) * mmPerM,
          box.y + box.h / 2 - (p[1] - pc[1]) * mmPerM,
        ];
      },
      mmPerM,
    };
  }
  function flattenLines(g) {
    if (!g) return [];
    if (g.type === "LineString") return [g.coordinates];
    if (g.type === "MultiLineString") return g.coordinates;
    if (g.type === "Polygon") return g.coordinates;
    if (g.type === "MultiPolygon") return g.coordinates.flat();
    return [];
  }
  function mapFeatureLayer(m) {
    if (m.type === "panel") return "trakway";
    if (
      ["hazard", "hazard-marker"].includes(m.type) ||
      ["fire", "muster", "firstaid", "safety-sign"].includes(m.kind)
    )
      return "safety";
    if (m.type === "asset") return "assets";
    if (m.type === "service") {
      if (
        [
          "ecology",
          "sssi",
          "tpo",
          "heritage",
          "archaeology",
          "flood",
          "conservation",
          "other",
        ].includes(m.serviceType)
      )
        return "environment";
      return "utilities";
    }
    if (m.type === "measure") return "dimensions";
    if (["note", "textBox"].includes(m.type)) return "labels";
    return "other";
  }
  function includeFeature(f, opt) {
    const m = f.properties || {},
      k = mapFeatureLayer(m);
    if (m.guideHidden) return false;
    return opt.layers?.[k] !== false;
  }
  function featureStyle(f) {
    const m = f.properties || {};
    let st;
    if (m.type === "service")
      st = {
        stroke: SERVICE_COLORS[m.serviceType] || "#6d7485",
        fill: [
          "ecology",
          "sssi",
          "tpo",
          "heritage",
          "archaeology",
          "flood",
          "conservation",
          "other",
        ].includes(m.serviceType)
          ? "#f2f3f1"
          : null,
        width: 0.25,
        dash: m.serviceType === "ohl" ? [2, 1] : [1.5, 1],
      };
    else if (m.type === "panel")
      st = { stroke: "#4f4a32", fill: "#d8cf9d", width: 0.28 };
    else if (m.type === "asset")
      st = { stroke: "#153f38", fill: "#edf4f1", width: 0.35 };
    else if (m.type === "measure")
      st = { stroke: "#263238", width: 0.3, dash: [1, 1] };
    else if (m.type === "access") st = { stroke: "#087f61", width: 1 };
    else if (m.type === "egress")
      st = { stroke: "#cb4d32", width: 1, dash: [2, 1] };
    else if (m.type === "route") st = { stroke: "#356bd6", width: 0.8 };
    else if (m.type === "hazard")
      st = { stroke: "#b42727", fill: "#fff1f1", width: 0.5, dash: [2, 1] };
    else if (m.type === "stoneRoad")
      st = { stroke: "#7b786e", fill: "#c8c4b6", width: 0.35 };
    else
      st = {
        stroke: "#4b5a58",
        fill: m.type === "area" ? "#f0f4f2" : null,
        width: 0.35,
      };
    if (m.styleColor) st.stroke = m.styleColor;
    if (m.styleFill) st.fill = m.styleFill;
    if (Number.isFinite(+m.styleWeight))
      st.width = Math.max(0.15, Math.min(2, +m.styleWeight * 0.14));
    if (m.styleDash === "solid") delete st.dash;
    if (m.styleDash === "dashed") st.dash = [2, 1];
    if (m.styleDash === "dotted") st.dash = [0.4, 1];
    return st;
  }
  const SERVICE_NAMES = {
    electric: "Underground electricity",
    gas: "Gas service",
    water: "Water service",
    drainage: "Drainage / sewer",
    telecom: "Telecoms",
    ohl: "Overhead line",
    ecology: "Ecology constraint",
    sssi: "SSSI / protected site",
    tpo: "TPO / protected tree",
    heritage: "Listed / heritage constraint",
    archaeology: "Archaeological constraint",
    flood: "Flood constraint",
    conservation: "Conservation constraint",
    other: "Other constraint",
  };
  function legendName(m) {
    if (m.type === "service")
      return SERVICE_NAMES[m.serviceType] || m.label || "Service / constraint";
    if (m.type === "panel")
      return m.product ? `Trakway panel - ${m.product}` : "Trakway panel";
    if (m.type === "asset") return m.label || m.name || "Site asset";
    if (m.type === "route") return m.label || "Trakway / site route";
    if (m.type === "access") return m.label || "Access";
    if (m.type === "egress") return m.label || "Egress";
    if (m.type === "hazard") return m.label || "Hazard / exclusion area";
    return m.label || m.type || "Drawing object";
  }
  function drawCoordinateBorder(page, bounds, box) {
    if (!bounds) return;
    const n = 4;
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        x = box.x + t * box.w,
        y = box.y + t * box.h,
        lon = bounds[0] + t * (bounds[2] - bounds[0]),
        lat = bounds[3] - t * (bounds[3] - bounds[1]);
      page.line(x, box.y, x, box.y + 1.8, "#4a5551", 0.18);
      page.line(x, box.y + box.h - 1.8, x, box.y + box.h, "#4a5551", 0.18);
      page.text(lon.toFixed(5), x - 5, box.y + 3.2, 3.6, false, "#59635f");
      page.line(box.x, y, box.x + 1.8, y, "#4a5551", 0.18);
      page.line(box.x + box.w - 1.8, y, box.x + box.w, y, "#4a5551", 0.18);
      page.text(lat.toFixed(5), box.x + 2.3, y + 1, 3.6, false, "#59635f");
    }
  }
  function drawBase(page, features, tr, box, opt = {}) {
    const placed = [],
      roadPolygons = (features || []).flatMap((feature) => {
        if (feature.properties?.baseClass !== "road") return [];
        if (feature.geometry?.type === "Polygon")
          return [feature.geometry.coordinates];
        if (feature.geometry?.type === "MultiPolygon")
          return feature.geometry.coordinates;
        return [];
      });
    let joinedRoads = false;
    if (roadPolygons.length && window.polygonClipping?.union) {
      try {
        const merged = window.polygonClipping.union(...roadPolygons);
        for (const polygon of merged || []) {
          const points = (polygon[0] || []).map(tr.point);
          if (points.length > 2)
            page.poly(points, "#818b87", "#ffffff", 0.35);
        }
        joinedRoads = !!merged?.length;
      } catch {}
    }
    for (const f of features || []) {
      const m = f.properties || {},
        cls = m.baseClass,
        st =
          cls === "building"
            ? { s: "#727d7a", f: "#eceeed", w: 0.25 }
            : cls === "road"
              ? { s: "#818b87", f: "#f5f5f2", w: 0.35 }
              : cls === "path"
                ? { s: "#a0a7a4", w: 0.25 }
                : cls === "rail"
                  ? { s: "#454b49", w: 0.4, d: [1, 1] }
                  : cls === "water"
                    ? { s: "#4e8dac", f: "#e7f3f8", w: 0.3 }
                    : cls === "power"
                      ? { s: "#98628e", w: 0.3, d: [2, 1] }
                      : cls === "barrier"
                        ? { s: "#656b68", w: 0.25, d: [1, 1] }
                        : { s: "#bdc2bf", f: null, w: 0.15 };
      if (cls === "tree" && f.geometry.type === "Point") {
        const c = f.geometry.coordinates,
          pr = G.projection(c),
          radius = +m.radius || 3,
          ring = Array.from({ length: 49 }, (_, i) => {
            const a = (i * Math.PI) / 24,
              r = radius * (1 + 0.1 * Math.sin(a * 12));
            return tr.point(pr.ll([Math.cos(a) * r, Math.sin(a) * r]));
          });
        page.poly(ring, "#7e9583", "#f5f8f3", 0.14);
        const pt = tr.point(c);
        page.line(pt[0] - 0.5, pt[1], pt[0] + 0.5, pt[1], "#7e9583", 0.14);
        page.line(pt[0], pt[1] - 0.5, pt[0], pt[1] + 0.5, "#7e9583", 0.14);
        continue;
      }
      if (!(cls === "road" && joinedRoads)) {
        for (const ring of flattenLines(f.geometry)) {
          const pts = ring
            .map(tr.point)
            .filter(
              (p) =>
                p[0] >= box.x - 10 &&
                p[0] <= box.x + box.w + 10 &&
                p[1] >= box.y - 10 &&
                p[1] <= box.y + box.h + 10,
            );
          if (pts.length < 2) continue;
          const closed =
            ring.length > 2 &&
            ring[0][0] === ring.at(-1)[0] &&
            ring[0][1] === ring.at(-1)[1];
          page.poly(pts, st.s, closed ? st.f : null, st.w, st.d);
        }
      }
      const essentialRoad =
        cls === "road" &&
        (["motorway", "trunk", "primary", "secondary", "tertiary"].includes(
          m.highway,
        ) || !!m.ref);
      if (m.name && (opt.essentialLabels === false || essentialRoad)) {
        const b = boundsOfGeom(f.geometry);
        let c = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
        try {
          const p = JSON.parse(m.labelPointJSON);
          if (G.inside(p, tr.bounds)) c = p;
        } catch {}
        const pt = tr.point(c);
        if (
          pt[0] > box.x + 4 &&
          pt[0] < box.x + box.w - 30 &&
          pt[1] > box.y + 4 &&
          pt[1] < box.y + box.h - 4 &&
          !placed.some(
            (p) => Math.abs(p[0] - pt[0]) < 22 && Math.abs(p[1] - pt[1]) < 4,
          )
        ) {
          placed.push(pt);
          page.text(
            String(m.name).slice(0, 70),
            pt[0],
            pt[1],
            5.5,
            false,
            cls === "water" ? "#4e8dac" : "#677369",
          );
        }
      }
    }
  }
  function assetGlyph(page, f, tr) {
    const m = f.properties || {},
      ring =
        f.geometry?.type === "Polygon" ? f.geometry.coordinates?.[0] : null,
      b = boundsOfGeom(f.geometry);
    if (!b) return;
    const c = tr.point([(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]),
      p1 = tr.point([b[0], b[1]]),
      p2 = tr.point([b[2], b[3]]),
      w = Math.max(2, Math.abs(p2[0] - p1[0])),
      h = Math.max(2, Math.abs(p2[1] - p1[1])),
      k = m.kind || "",
      stroke = "#173e38";
    const pts = ring?.map(tr.point);
    if (pts?.length > 2) page.poly(pts, stroke, "#f5f8f6", 0.35);
    const x0 = c[0] - w / 2,
      y0 = c[1] - h / 2,
      x1 = c[0] + w / 2,
      y1 = c[1] + h / 2,
      small = Math.max(1.1, Math.min(w, h) * 0.13);
    if (k === "fire" || k === "muster" || k === "firstaid") {
      const col = k === "fire" ? "#b62323" : "#156a55";
      page.circle(
        c[0],
        c[1],
        Math.max(2, Math.min(4, Math.min(w, h) / 2)),
        col,
        "#ffffff",
        0.6,
      );
      if (k === "firstaid") {
        page.line(c[0] - 1.6, c[1], c[0] + 1.6, c[1], col, 0.8);
        page.line(c[0], c[1] - 1.6, c[0], c[1] + 1.6, col, 0.8);
      } else
        page.text(
          k === "fire" ? "F" : "M",
          c[0] - 1.3,
          c[1] + 1.5,
          7.5,
          true,
          col,
        );
      return;
    }
    if (["artic", "rigid", "van", "pickup"].includes(k)) {
      page.line(x0 + w * 0.12, c[1], x1 - w * 0.12, c[1], stroke, 0.25);
      const cabX = k === "artic" ? x1 - w * 0.2 : x1 - w * 0.28;
      page.line(cabX, y0 + 1, cabX, y1 - 1, stroke, 0.35);
      for (const yy of [y0, y1]) {
        page.circle(x0 + w * 0.22, yy, small, "#111", "#111", 0.1);
        page.circle(x1 - w * 0.22, yy, small, "#111", "#111", 0.1);
      }
      if (k === "artic")
        page.line(
          c[0] - w * 0.1,
          y0 + 1,
          c[0] - w * 0.1,
          y1 - 1,
          "#5a6864",
          0.22,
        );
      return;
    }
    if (/^cabin/.test(k) || k === "storage") {
      page.line(x0 + w * 0.72, y0 + 1, x0 + w * 0.72, y1 - 1, "#62706c", 0.25);
      page.line(x0 + w * 0.18, c[1], x0 + w * 0.38, c[1], "#62706c", 0.25);
      page.circle(x0 + w * 0.18, c[1], 0.7, "#62706c", null, 0.2);
      return;
    }
    if (k === "toilet") {
      page.circle(
        c[0],
        c[1],
        Math.max(1.3, Math.min(w, h) * 0.22),
        "#4e5e59",
        null,
        0.25,
      );
      page.line(c[0], y0 + 1, c[0], c[1] - 1, "#4e5e59", 0.25);
      return;
    }
    if (
      [
        "forklift",
        "telehandler",
        "excavator8",
        "excavator20",
        "roller",
        "dumper",
        "mewp",
      ].includes(k)
    ) {
      for (const yy of [y0 + 0.7, y1 - 0.7]) {
        page.circle(x0 + w * 0.22, yy, small, "#222", "#222", 0.1);
        page.circle(x1 - w * 0.22, yy, small, "#222", "#222", 0.1);
      }
      if (k === "forklift") {
        page.line(
          x1 - w * 0.16,
          c[1],
          x1 + Math.min(3, w * 0.25),
          c[1],
          stroke,
          0.55,
        );
        page.line(
          x1 + Math.min(3, w * 0.25),
          c[1] - 1.2,
          x1 + Math.min(3, w * 0.25),
          c[1] + 1.2,
          stroke,
          0.35,
        );
      } else if (k === "telehandler" || k === "mewp") {
        page.line(
          c[0] - w * 0.12,
          c[1] + h * 0.12,
          x1 - w * 0.06,
          y0 + h * 0.18,
          stroke,
          0.55,
        );
        page.circle(x1 - w * 0.06, y0 + h * 0.18, 1, stroke, "#fff", 0.25);
      } else if (k.startsWith("excavator")) {
        page.circle(
          c[0] - w * 0.05,
          c[1],
          Math.max(1.3, Math.min(w, h) * 0.24),
          stroke,
          "#fff",
          0.3,
        );
        page.line(
          c[0] + w * 0.1,
          c[1],
          x1 - w * 0.04,
          y0 + h * 0.18,
          stroke,
          0.55,
        );
        page.line(
          x1 - w * 0.04,
          y0 + h * 0.18,
          x1,
          y0 + h * 0.05,
          stroke,
          0.45,
        );
      } else if (k === "roller") {
        page.line(
          x0 + w * 0.16,
          y0 + 0.6,
          x0 + w * 0.16,
          y1 - 0.6,
          stroke,
          1.1,
        );
        page.line(
          x1 - w * 0.16,
          y0 + 0.6,
          x1 - w * 0.16,
          y1 - 0.6,
          stroke,
          1.1,
        );
      } else if (k === "dumper") {
        page.poly(
          [
            [x0 + w * 0.18, y0 + h * 0.18],
            [x1 - w * 0.08, y0 + h * 0.28],
            [x1 - w * 0.08, y1 - h * 0.28],
            [x0 + w * 0.18, y1 - h * 0.18],
          ],
          stroke,
          null,
          0.3,
        );
      }
      return;
    }
    if (["heras", "storm", "pedGate", "vehicleGate", "barrier"].includes(k)) {
      const horizontal = w >= h;
      if (horizontal) {
        page.line(x0, c[1], x1, c[1], stroke, 0.65);
        for (let x = x0 + 2; x < x1; x += 3)
          page.line(x, c[1] - 1.4, x, c[1] + 1.4, "#6c7773", 0.18);
      } else {
        page.line(c[0], y0, c[0], y1, stroke, 0.65);
        for (let y = y0 + 2; y < y1; y += 3)
          page.line(c[0] - 1.4, y, c[0] + 1.4, y, "#6c7773", 0.18);
      }
      if (["pedGate", "vehicleGate"].includes(k))
        page.circle(c[0], c[1], 1.1, "#177464", "#fff", 0.3);
      return;
    }
    if (k === "parking") {
      page.text("P", c[0] - 1.8, c[1] + 2.2, 10, true, "#24558a");
      return;
    }
    if (k === "generator") {
      page.line(c[0] - 2, c[1] - 2, c[0] + 0.2, c[1] - 2, "#9a7414", 0.7);
      page.line(c[0] + 0.2, c[1] - 2, c[0] - 1, c[1] + 0.2, "#9a7414", 0.7);
      page.line(c[0] - 1, c[1] + 0.2, c[0] + 1.8, c[1] + 0.2, "#9a7414", 0.7);
      page.line(c[0] + 1.8, c[1] + 0.2, c[0], c[1] + 2.5, "#9a7414", 0.7);
      return;
    }
    if (k === "fuel") {
      page.circle(
        c[0],
        c[1],
        Math.max(1.5, Math.min(w, h) * 0.28),
        "#7b5b2e",
        "#fff",
        0.35,
      );
      page.line(c[0] - 2, c[1], c[0] + 2, c[1], "#7b5b2e", 0.25);
      return;
    }
    if (k === "skip") {
      page.poly(
        [
          [x0 + 1, y0 + 1],
          [x1 - 1, y0 + 2],
          [x1 - 1, y1 - 2],
          [x0 + 1, y1 - 1],
        ],
        stroke,
        null,
        0.4,
      );
      page.line(x0 + 1, y0 + 1, x1 - 1, y1 - 2, "#78827e", 0.2);
      return;
    }
    if (k === "wheelwash") {
      for (let x = x0 + 2; x < x1; x += 3)
        page.line(x, y0 + 1, x, y1 - 1, "#4b7080", 0.22);
      return;
    }
    if (k === "stage") {
      page.line(x0 + 1, y0 + 1, x1 - 1, y1 - 1, "#5c5a76", 0.25);
      page.line(x1 - 1, y0 + 1, x0 + 1, y1 - 1, "#5c5a76", 0.25);
      return;
    }
    page.line(x0 + 1, y0 + 1, x1 - 1, y1 - 1, "#6b7773", 0.2);
    page.line(x1 - 1, y0 + 1, x0 + 1, y1 - 1, "#6b7773", 0.2);
  }
  function drawProjectFeatures(page, project, tr, box, opt, legend) {
    for (const f of project.features || []) {
      if (!includeFeature(f, opt)) continue;
      const m = f.properties || {},
        st = featureStyle(f);
      if (m.type === "asset") {
        assetGlyph(page, f, tr);
        legend.set(legendName(m), { color: st.stroke, type: "asset" });
        continue;
      }
      for (const ring of flattenLines(f.geometry)) {
        const pts = ring.map(tr.point);
        if (pts.length < 2) continue;
        const closed =
          f.geometry.type.includes("Polygon") ||
          (ring.length > 2 &&
            ring[0][0] === ring.at(-1)[0] &&
            ring[0][1] === ring.at(-1)[1]);
        page.poly(pts, st.stroke, closed ? st.fill : null, st.width, st.dash);
      }
      if (f.geometry?.type === "Point") {
        const p = tr.point(f.geometry.coordinates);
        page.circle(p[0], p[1], 1.5, st.stroke, st.fill || "#fff", 0.35);
      }
      if (m.type === "measure" && f.geometry?.type === "LineString") {
        const cs = f.geometry.coordinates,
          p = tr.point(cs[Math.floor(cs.length / 2)]);
        page.text(
          (m.distance || 0) >= 1000
            ? (m.distance / 1000).toFixed(2) + " km"
            : (m.distance || 0).toFixed(1) + " m",
          p[0] + 2,
          p[1] - 1,
          5.5,
          true,
          "#202827",
        );
      }
      if (
        (m.type === "textBox" || m.type === "note") &&
        f.geometry?.type === "Point" &&
        opt.layers?.labels !== false
      ) {
        const p = tr.point(f.geometry.coordinates);
        page.wrapped(
          m.text || m.label,
          p[0] + 2,
          p[1] - 2,
          28,
          5.2,
          false,
          "#222",
          2.8,
          3,
        );
      }
      if (m.includeLegend !== false) {
        const name = legendName(m);
        legend.set(name, { color: st.stroke, type: m.type });
      }
    }
  }
  function drawNorth(page, x, y) {
    page.line(x, y + 12, x, y, "#111", 0.5);
    page.poly(
      [
        [x, y],
        [x - 2.2, y + 5],
        [x + 2.2, y + 5],
      ],
      "#111",
      "#111",
      0.3,
    );
    page.text("N", x - 1.5, y + 17, 8, true, "#111");
  }
  function drawScaleBar(page, x, y, scale, maxW = 45) {
    const choices = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
    const metersPerMm = scale / 1000;
    const m = choices.filter((v) => v / metersPerMm <= maxW).at(-1) || 1,
      w = m / metersPerMm;
    page.line(x, y, x + w, y, "#111", 0.8);
    page.line(x, y - 1.5, x, y + 1.5, "#111", 0.4);
    page.line(x + w / 2, y - 1.5, x + w / 2, y + 1.5, "#111", 0.4);
    page.line(x + w, y - 1.5, x + w, y + 1.5, "#111", 0.4);
    page.text("0", x - 1, y + 5, 5.2, false);
    page.text(String(m / 2), x + w / 2 - 2, y + 5, 5.2, false);
    page.text(
      m >= 1000 ? m / 1000 + " km" : m + " m",
      x + w - 3,
      y + 5,
      5.2,
      false,
    );
  }
  function sheetHeader(page, title, pageNo, total) {
    page.text("SAMI", 12, 11, 13, true, "#0d4038");
    page.text(
      "SPATIAL ANALYSIS & MAPPING INTELLIGENCE",
      31,
      10.7,
      5.2,
      true,
      "#48615c",
    );
    page.text(title, page.w / 2 - 45, 11, 10, true, "#17211f");
    page.text(`PAGE ${pageNo} OF ${total}`, page.w - 34, 11, 5.6, true, "#333");
  }
  function titleBlock(page, project, opt, pageNo, total, scaleText = "NTS") {
    const x = 12,
      y = page.h - 44,
      w = page.w - 24,
      h = 32;
    page.rect(x, y, w, h, "#24332f", null, 0.35);
    const c1 = x + w * 0.2,
      c2 = x + w * 0.42,
      c3 = x + w * 0.63,
      c4 = x + w * 0.82;
    const cols = [x, c1, c2, c3, c4, x + w];
    for (let i = 1; i < cols.length - 1; i++)
      page.line(cols[i], y, cols[i], y + h, "#73807c", 0.2);
    page.line(x, y + 11, x + w, y + 11, "#73807c", 0.2);
    const m = project.meta || {};
    const status = opt.status || m.drawingStatus || "Preliminary";
    page.text("PROJECT", x + 2, y + 4, 4.5, true, "#52615d");
    page.text(project.name || "Untitled site", x + 2, y + 9, 6.7, true);
    page.text("CLIENT", c1 + 2, y + 4, 4.5, true, "#52615d");
    page.text(m.clientName || "-", c1 + 2, y + 9, 6.2, true);
    page.text("DRAWING / REFERENCE", c2 + 2, y + 4, 4.5, true, "#52615d");
    page.text(
      m.drawingNo || m.siteRef || "SAMI-SITE",
      c2 + 2,
      y + 9,
      6.2,
      true,
    );
    page.text("REVISION", c3 + 2, y + 4, 4.5, true, "#52615d");
    page.text(opt.revision || m.revision || "-", c3 + 2, y + 9, 6.2, true);
    page.text("SCALE", c4 + 2, y + 4, 4.5, true, "#52615d");
    page.text(scaleText, c4 + 2, y + 9, 6.2, true);
    page.text("STATUS", x + 2, y + 16, 4.5, true, "#52615d");
    page.text(status, x + 2, y + 22, 6.0, true);
    page.text("PREPARED BY", c1 + 2, y + 16, 4.5, true, "#52615d");
    page.text(opt.preparedBy || m.creator || "-", c1 + 2, y + 22, 6.0, true);
    page.text("DATE", c2 + 2, y + 16, 4.5, true, "#52615d");
    page.text(
      new Date().toLocaleDateString("en-GB"),
      c2 + 2,
      y + 22,
      6.0,
      true,
    );
    page.text("DRAWING STATUS", c3 + 2, y + 16, 4.5, true, "#52615d");
    page.text(status, c3 + 2, y + 22, 5.7, true);
    page.text("SHEET", c4 + 2, y + 16, 4.5, true, "#52615d");
    page.text(`${pageNo}/${total}`, c4 + 2, y + 22, 6.0, true);
    page.text(
      "CREATED USING SAMI - JW EDS",
      x + w - 51,
      y + h - 3,
      4.6,
      true,
      "#0d4038",
    );
  }
  function drawLegend(page, legend, x, y, w, h) {
    page.rect(x, y, w, h, "#5b6864", null, 0.25);
    page.text("LEGEND / KEY", x + 3, y + 7, 6.2, true, "#1c2926");
    let yy = y + 13,
      i = 0;
    for (const [name, st] of legend) {
      if (yy > y + h - 5 || i++ > 22) break;
      page.line(
        x + 3,
        yy - 1.6,
        x + 12,
        yy - 1.6,
        st.color || "#333",
        0.9,
        st.type === "service" ? [1.5, 1] : null,
      );
      page.wrapped(name, x + 15, yy, w - 18, 5.1, false, "#303a38", 2.8, 2);
      yy += 6;
    }
    if (!legend.size)
      page.text("No exported layers", x + 3, y + 16, 5.5, false, "#666");
  }
  function routeBounds(route) {
    return mergeBounds([
      route?.geometry?.length
        ? boundsOfGeom({ coordinates: route.geometry })
        : null,
      route?.start ? [...route.start, ...route.start] : null,
      route?.end ? [...route.end, ...route.end] : null,
    ]);
  }
  function routeFinalBounds(route) {
    if (!route?.end) return null;
    const pts = (route.geometry || []).slice(
      -Math.min(80, (route.geometry || []).length),
    );
    let b = mergeBounds([
      boundsOfGeom({ coordinates: pts }),
      [route.end[0], route.end[1], route.end[0], route.end[1]],
    ]);
    return expandBounds(
      b || [route.end[0], route.end[1], route.end[0], route.end[1]],
      600,
    );
  }
  function qrMatrix(text) {
    if (!window.SAMI_QRCode) return null;
    try {
      const qr = new window.SAMI_QRCode(
        -1,
        window.SAMI_QRErrorCorrectLevel?.M || 0,
      );
      qr.addData(text);
      qr.make();
      return qr.modules;
    } catch {
      return null;
    }
  }
  function drawQR(page, text, x, y, size) {
    const mat = qrMatrix(text);
    page.rect(x, y, size, size, "#111", "#fff", 0.2);
    if (!mat)
      return page.text(
        "QR unavailable",
        x + 3,
        y + size / 2,
        5.5,
        true,
        "#b00",
      );
    const quiet = 4,
      n = mat.length + quiet * 2,
      s = size / n;
    page.fill("#000");
    for (let r = 0; r < mat.length; r++)
      for (let c = 0; c < mat[r].length; c++)
        if (mat[r][c])
          page.rect(
            x + (c + quiet) * s,
            y + (r + quiet) * s,
            s + 0.02,
            s + 0.02,
            "#000",
            "#000",
            0,
          );
  }
  function tileXY(lon, lat, z) {
    const n = 2 ** z,
      x = ((lon + 180) / 360) * n,
      y =
        ((1 -
          Math.log(
            Math.tan((lat * Math.PI) / 180) +
              1 / Math.cos((lat * Math.PI) / 180),
          ) /
            Math.PI) /
          2) *
        n;
    return [x, y];
  }
  function tileLL(x, y, z) {
    const n = 2 ** z,
      lon = (x / n) * 360 - 180,
      lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
    return [lon, lat];
  }
  async function imageFromBlob(blob) {
    if ("createImageBitmap" in window) return await createImageBitmap(blob);
    return await new Promise((res, rej) => {
      const u = URL.createObjectURL(blob),
        im = new Image();
      im.onload = () => {
        URL.revokeObjectURL(u);
        res(im);
      };
      im.onerror = (e) => {
        URL.revokeObjectURL(u);
        rej(e);
      };
      im.src = u;
    });
  }
  function dataUrlBytes(data) {
    const b64 = data.split(",")[1],
      bin = atob(b64),
      out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function fetchMapJPEG(bounds, style, wPx = 1600, hPx = 1000) {
    if (style === "cad" || !bounds) return null;
    try {
      const span =
        tileXY(bounds[2], bounds[1], 0)[0] - tileXY(bounds[0], bounds[3], 0)[0];
      let z = 18;
      for (let zz = 3; zz <= 18; zz++) {
        const a = tileXY(bounds[0], bounds[3], zz),
          b = tileXY(bounds[2], bounds[1], zz);
        if (
          Math.max(((b[0] - a[0]) * 256) / wPx, ((b[1] - a[1]) * 256) / hPx) >
          0.9
        ) {
          z = Math.max(3, zz - 1);
          break;
        }
      }
      const a = tileXY(bounds[0], bounds[3], z),
        b = tileXY(bounds[2], bounds[1], z),
        x0 = Math.floor(a[0]),
        y0 = Math.floor(a[1]),
        x1 = Math.floor(b[0]),
        y1 = Math.floor(b[1]);
      if ((x1 - x0 + 1) * (y1 - y0 + 1) > 20) return null;
      const canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        full = document.createElement("canvas"),
        fw = (x1 - x0 + 1) * 256,
        fh = (y1 - y0 + 1) * 256;
      full.width = fw;
      full.height = fh;
      const fctx = full.getContext("2d");
      let successfulTiles = 0;
      fctx.fillStyle = "#f3f6f0";
      fctx.fillRect(0, 0, fw, fh);
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) {
          const url =
            style === "satellite"
              ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
              : `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
          const r = await fetch(url, {
            mode: "cors",
            signal: AbortSignal.timeout(9000),
          });
          if (!r.ok) continue;
          const im = await imageFromBlob(await r.blob());
          fctx.drawImage(im, (x - x0) * 256, (y - y0) * 256, 256, 256);
          successfulTiles++;
        }
      if (!successfulTiles) return null;
      const px0 = (a[0] - x0) * 256,
        py0 = (a[1] - y0) * 256,
        px1 = (b[0] - x0) * 256,
        py1 = (b[1] - y0) * 256;
      canvas.width = wPx;
      canvas.height = hPx;
      ctx.drawImage(
        full,
        px0,
        py0,
        Math.max(1, px1 - px0),
        Math.max(1, py1 - py0),
        0,
        0,
        wPx,
        hPx,
      );
      const data = canvas.toDataURL(
        "image/jpeg",
        style === "satellite" ? 0.88 : 0.82,
      );
      return { bytes: dataUrlBytes(data), width: wPx, height: hPx };
    } catch (e) {
      console.warn("SAMI PDF background unavailable", e);
      return null;
    }
  }
  function metaRows(project) {
    const m = project.meta || {};
    return [
      ["Drawing title", "Site Drawing / Site Logistics Plan"],
      ["Site address", m.siteAddress || "-"],
      ["What3words", m.what3words || m.w3w || "-"],
      ["Site reference", m.siteRef || "-"],
      ["Client", m.clientName || "-"],
    ];
  }
  async function renderSitePage(pdf, project, opt, pageNo, total) {
    const p = new Page(pdf);
    p.rect(7, 7, p.w - 14, p.h - 14, "#182923", null, 0.45);
    sheetHeader(p, "SITE DRAWING / SITE LOGISTICS PLAN", pageNo, total);
    const plan = { x: 12, y: 18, w: p.w - 134, h: p.h - 68 },
      side = { x: p.w - 116, y: 18, w: 104, h: p.h - 68 };
    const baseBounds = project.area
      ? expandBounds(project.area, +project.planBleed || 60)
      : mergeBounds(
          (project.features || []).map((f) => boundsOfGeom(f.geometry)),
        );
    if (!baseBounds) {
      p.text(
        "Define a Site Drawing area before export.",
        20,
        50,
        12,
        true,
        "#a21c1c",
      );
      titleBlock(p, project, opt, pageNo, total);
      p.done();
      return;
    }
    const tr = makeTransform(baseBounds, plan),
      legend = new Map();
    p.rect(plan.x, plan.y, plan.w, plan.h, "#4d5d58", "#ffffff", 0.3);
    const raster = await fetchMapJPEG(baseBounds, opt.style, 1600, 1100);
    if (raster) p.image(raster, plan.x, plan.y, plan.w, plan.h);
    if (opt.style === "cad" || !raster)
      drawBase(p, project.planBase || [], tr, plan, opt);
    drawProjectFeatures(p, project, tr, plan, opt, legend);
    drawCoordinateBorder(p, baseBounds, plan);
    if (project.area) {
      const ring = [
        [project.area[0], project.area[1]],
        [project.area[2], project.area[1]],
        [project.area[2], project.area[3]],
        [project.area[0], project.area[3]],
        [project.area[0], project.area[1]],
      ].map(tr.point);
      p.poly(ring, "#111111", null, 0.45, [2, 1]);
    }
    drawNorth(p, plan.x + plan.w - 12, plan.y + 8);
    drawScaleBar(p, plan.x + 8, plan.y + plan.h - 9, tr.scale, 48);
    p.text(
      `SCALE 1:${tr.scale}`,
      plan.x + 8,
      plan.y + plan.h - 15,
      5.6,
      true,
      "#26322f",
    );
    p.text(
      opt.style === "cad"
        ? "CAD / simplified vector plan"
        : opt.style === "satellite"
          ? "Satellite context + SAMI vectors"
          : "Map context + SAMI vectors",
      plan.x + 8,
      plan.y + 8,
      5.4,
      true,
      "#28332f",
    );
    if (opt.style === "map")
      p.text(
        "Map data (c) OpenStreetMap contributors",
        plan.x + plan.w - 58,
        plan.y + plan.h - 4,
        3.7,
        false,
        "#4b5552",
      );
    if (opt.style === "satellite")
      p.text(
        "Imagery (c) Esri and contributors",
        plan.x + plan.w - 55,
        plan.y + plan.h - 4,
        3.7,
        false,
        "#4b5552",
      );
    p.rect(side.x, side.y, side.w, 38, "#56635f", null, 0.25);
    p.text("PROJECT / SITE", side.x + 3, side.y + 7, 6.5, true, "#143c35");
    let yy = side.y + 13;
    for (const [k, v] of metaRows(project)) {
      p.text(k.toUpperCase(), side.x + 3, yy, 4.1, true, "#66736f");
      yy =
        p.wrapped(v, side.x + 31, yy, side.w - 34, 5.1, false, "#222", 2.7, 2) +
        2.2;
    }
    drawLegend(
      p,
      legend,
      side.x,
      side.y + 43,
      side.w,
      Math.min(95, side.h - 96),
    );
    const notesY = side.y + 143;
    p.rect(
      side.x,
      notesY,
      side.w,
      side.y + side.h - notesY,
      "#56635f",
      null,
      0.25,
    );
    p.text(
      "NOTES / ISSUE INFORMATION",
      side.x + 3,
      notesY + 7,
      6.2,
      true,
      "#1d2b27",
    );
    let ny = notesY + 13;
    ny = p.wrapped(
      opt.notes ||
        project.meta?.siteNotes ||
        "Use this drawing with current project information. Verify critical dimensions, utilities, legal boundaries and access restrictions before construction activity.",
      side.x + 3,
      ny,
      side.w - 6,
      5.2,
      false,
      "#333",
      3,
      15,
    );
    p.text(
      "DATA / SAFETY NOTE",
      side.x + 3,
      Math.min(side.y + side.h - 16, ny + 5),
      4.7,
      true,
      "#8b2929",
    );
    p.wrapped(
      "Public utility and planning layers are reference data only. Do not use this document as a substitute for statutory searches, utility-owner records, CAT/Genny survey, trial holes or other required safe-dig controls.",
      side.x + 3,
      Math.min(side.y + side.h - 10, ny + 11),
      side.w - 6,
      4.8,
      false,
      "#7a2d2d",
      2.7,
      4,
    );
    titleBlock(p, project, opt, pageNo, total, `1:${tr.scale}`);
    p.done();
  }
  function routeConstraintLines(route) {
    const raw =
      route?.constraints || route?.restrictions || route?.hazards || [];
    if (Array.isArray(raw) && raw.length)
      return raw
        .slice(0, 14)
        .map((x) =>
          typeof x === "string" ? x : x.label || x.type || JSON.stringify(x),
        );
    return [
      "No structured restriction list was returned by the current routing source.",
      "Verify low bridges, height/weight/width restrictions, weak bridges, road closures, TROs and final access before travel.",
    ];
  }
  async function renderRoutePage(pdf, project, opt, pageNo, total) {
    const p = new Page(pdf);
    p.rect(7, 7, p.w - 14, p.h - 14, "#182923", null, 0.45);
    sheetHeader(p, "ROUTE TO SITE / DRIVER INFORMATION", pageNo, total);
    const r = (project.routes || []).at(-1),
      m = project.meta || {};
    if (!r) {
      p.text(
        "No Route to Site record is currently saved.",
        18,
        36,
        12,
        true,
        "#9f2929",
      );
      p.wrapped(
        "Plan the HGV route in SAMI before issuing the driver sheet. The page will then include the selected vehicle, route map, final approach, arrival notes and QR hand-off.",
        18,
        48,
        p.w - 36,
        7,
        false,
        "#333",
        4,
        5,
      );
      titleBlock(p, project, opt, pageNo, total);
      p.done();
      return;
    }
    const left = { x: 12, y: 18, w: 118, h: 70 },
      routeBox = { x: 136, y: 18, w: p.w - 148, h: 120 };
    p.rect(left.x, left.y, left.w, left.h, "#52615d", null, 0.25);
    p.text(
      "PROJECT / DESTINATION INFORMATION",
      left.x + 3,
      left.y + 7,
      6.2,
      true,
      "#133c34",
    );
    let y = left.y + 14;
    const rows = [
      ["PROJECT", project.name],
      ["DESTINATION", m.siteAddress || r.endLabel || "-"],
      ["WHAT3WORDS", m.what3words || m.w3w || "-"],
      [
        "COORDINATES",
        r.end ? `${r.end[1].toFixed(6)}, ${r.end[0].toFixed(6)}` : "-",
      ],
      ["SITE CONTACT", m.siteContact || "-"],
      ["TELEPHONE", m.sitePhone || "-"],
      ["SITE ENTRANCE / GATE", m.siteEntrance || "-"],
    ];
    for (const [k, v] of rows) {
      p.text(k, left.x + 3, y, 4.2, true, "#68746f");
      y =
        p.wrapped(v, left.x + 32, y, left.w - 35, 5, false, "#222", 2.8, 2) + 2;
    }
    p.rect(left.x, left.y + 75, left.w, 57, "#52615d", null, 0.25);
    p.text("ROUTE INFORMATION", left.x + 3, left.y + 82, 6.2, true, "#133c34");
    const vehicle =
      r.vehicle && Object.keys(r.vehicle).length
        ? `${r.profileName || r.profile || "HGV"} · ${r.vehicle.weight || ""}t · ${r.vehicle.height || ""}m H · ${r.vehicle.width || ""}m W · ${r.vehicle.length || ""}m L`
        : r.profileName || r.profile || "HGV";
    let ry = left.y + 91;
    for (const [k, v] of [
      ["ROUTE PREPARED FOR", vehicle],
      ["ORIGIN", r.startLabel || "-"],
      ["DISTANCE", `${Number(r.distanceKm || 0).toFixed(1)} km`],
      ["EST. JOURNEY", `${Math.round((r.timeSec || 0) / 60)} min`],
      ["ROUTING SOURCE", r.provider || "-"],
    ]) {
      p.text(k, left.x + 3, ry, 4.1, true, "#68746f");
      ry =
        p.wrapped(v, left.x + 36, ry, left.w - 39, 4.9, false, "#222", 2.7, 2) +
        2;
    }
    const rb = expandBounds(
      routeBounds(r),
      Math.max(500, (r.distanceKm || 1) * 40),
    );
    const rtr = makeTransform(rb, routeBox);
    p.rect(
      routeBox.x,
      routeBox.y,
      routeBox.w,
      routeBox.h,
      "#53605c",
      "#fff",
      0.25,
    );
    const overview = await fetchMapJPEG(rb, "map", 1800, 900);
    if (overview)
      p.image(overview, routeBox.x, routeBox.y, routeBox.w, routeBox.h);
    if (r.geometry?.length) {
      const pts = r.geometry.map(rtr.point);
      p.poly(pts, "#bf2626", null, 1.3);
      const s = rtr.point(r.start),
        e = rtr.point(r.end);
      p.circle(s[0], s[1], 2.4, "#1b5c4f", "#fff", 0.8);
      p.circle(e[0], e[1], 2.8, "#a71f1f", "#fff", 0.8);
      p.text("START", s[0] + 3, s[1], 5, true, "#1b5c4f");
      p.text("SITE", e[0] + 3, e[1], 5, true, "#a71f1f");
    }
    p.text("ROUTE OVERVIEW", routeBox.x + 4, routeBox.y + 7, 5.8, true, "#222");
    p.text(
      "Map data (c) OpenStreetMap contributors",
      routeBox.x + routeBox.w - 54,
      routeBox.y + routeBox.h - 3.2,
      3.6,
      false,
      "#555",
    );
    p.text(
      "Recommended SAMI route shown in red. Confirm current restrictions before travel.",
      routeBox.x + 4,
      routeBox.y + routeBox.h - 5,
      4.5,
      true,
      "#7a2525",
    );
    const final = { x: 12, y: 156, w: 185, h: 86 },
      constraints = { x: 203, y: 156, w: p.w - 215, h: 86 };
    p.rect(final.x, final.y, final.w, final.h, "#53605c", "#fff", 0.25);
    const fb = routeFinalBounds(r),
      ftr = makeTransform(fb, final),
      fimg = await fetchMapJPEG(fb, "map", 1200, 700);
    if (fimg) p.image(fimg, final.x, final.y, final.w, final.h);
    if (r.geometry?.length) {
      const near = r.geometry.filter(
        (c) => c[0] >= fb[0] && c[0] <= fb[2] && c[1] >= fb[1] && c[1] <= fb[3],
      );
      if (near.length > 1) p.poly(near.map(ftr.point), "#bf2626", null, 1.3);
      const e = ftr.point(r.end);
      p.circle(e[0], e[1], 3, "#a71f1f", "#fff", 0.9);
      p.text("SITE ENTRANCE / ARRIVAL", e[0] + 4, e[1], 5.2, true, "#a71f1f");
      if (near.length > 3) {
        const a = ftr.point(near[Math.max(0, near.length - 6)]),
          b = ftr.point(near.at(-1));
        p.line(a[0], a[1], b[0], b[1], "#b11e1e", 1.8);
        p.poly(
          [
            [b[0], b[1]],
            [b[0] - 3, b[1] - 1.5],
            [b[0] - 2, b[1] + 2],
          ],
          "#b11e1e",
          "#b11e1e",
          0.2,
        );
      }
    }
    p.text("FINAL APPROACH", final.x + 4, final.y + 7, 5.8, true, "#222");
    p.text(
      "Map data (c) OpenStreetMap contributors",
      final.x + final.w - 54,
      final.y + final.h - 3.2,
      3.6,
      false,
      "#555",
    );
    p.text(
      "APPROACH DIRECTION -> SITE ENTRANCE -> DELIVERY / ARRIVAL POINT",
      final.x + 4,
      final.y + final.h - 5,
      4.6,
      true,
      "#7a2525",
    );
    p.rect(
      constraints.x,
      constraints.y,
      constraints.w,
      constraints.h,
      "#53605c",
      null,
      0.25,
    );
    p.text(
      "KNOWN / RETURNED ROUTE CONSTRAINTS",
      constraints.x + 3,
      constraints.y + 7,
      5.9,
      true,
      "#183a34",
    );
    let cy = constraints.y + 14;
    for (const line of routeConstraintLines(r)) {
      p.text("•", constraints.x + 3, cy, 5, true, "#8a2727");
      cy =
        p.wrapped(
          line,
          constraints.x + 7,
          cy,
          constraints.w - 10,
          4.8,
          false,
          "#333",
          2.7,
          2,
        ) + 2;
      if (cy > constraints.y + 49) break;
    }
    p.text(
      "DRIVER / ARRIVAL NOTES",
      constraints.x + 3,
      constraints.y + 55,
      5.8,
      true,
      "#183a34",
    );
    const arrivalText =
      [
        m.arrivalInstructions ? "ARRIVAL: " + m.arrivalInstructions : "",
        m.driverNotes ? "DRIVER NOTE: " + m.driverNotes : "",
      ]
        .filter(Boolean)
        .join("  ") ||
      "Follow issued route and final approach information. Call the site contact if access conditions differ from this issue.";
    p.wrapped(
      arrivalText,
      constraints.x + 3,
      constraints.y + 62,
      constraints.w - 49,
      5,
      false,
      "#222",
      2.8,
      6,
    );
    const nav = `https://www.google.com/maps/dir/?api=1&origin=${r.start[1]},${r.start[0]}&destination=${r.end[1]},${r.end[0]}&travelmode=driving`;
    drawQR(p, nav, constraints.x + constraints.w - 42, constraints.y + 50, 35);
    p.text(
      "SCAN TO OPEN ROUTE",
      constraints.x + constraints.w - 43,
      constraints.y + 89,
      4.5,
      true,
      "#1b4038",
    );
    p.wrapped(
      "Navigation apps may recalculate for a car. Use the issued HGV route and driver notes.",
      constraints.x + constraints.w - 44,
      constraints.y + 94,
      42,
      4,
      false,
      "#7a2525",
      2.3,
      3,
    );
    titleBlock(p, project, opt, pageNo, total);
    p.done();
  }
  async function generate(project, opt = {}) {
    if (!project) throw Error("No SAMI project supplied.");
    const paper = opt.paper === "a4" ? [297, 210] : [420, 297],
      pdf = new PDF(paper[0], paper[1], 420, 297),
      pages = [];
    if (opt.pages?.site !== false) pages.push("site");
    if (opt.pages?.route !== false) pages.push("route");
    if (!pages.length) throw Error("Select at least one document page.");
    let n = 1;
    for (const type of pages) {
      if (type === "site")
        await renderSitePage(pdf, project, opt, n, pages.length);
      else await renderRoutePage(pdf, project, opt, n, pages.length);
      n++;
    }
    return pdf.build();
  }
  async function share(blob, name = "SAMI_Site_Logistics_Pack.pdf") {
    const file = new File([blob], name, { type: "application/pdf" });
    if (
      navigator.share &&
      (!navigator.canShare || navigator.canShare({ files: [file] }))
    ) {
      await navigator.share({
        title: "SAMI Site Logistics Pack",
        files: [file],
      });
      return true;
    }
    return false;
  }
  function mercator(c) {
    const r = 6371008.8;
    return [
      (r * c[0] * Math.PI) / 180,
      r * Math.log(Math.tan(Math.PI / 4 + (c[1] * Math.PI) / 360)),
    ];
  }
  function inverseMercator(p) {
    const r = 6371008.8;
    return [
      ((p[0] / r) * 180) / Math.PI,
      ((2 * Math.atan(Math.exp(p[1] / r)) - Math.PI / 2) * 180) / Math.PI,
    ];
  }
  makeTransform = function (bounds, box) {
    const a = mercator([bounds[0], bounds[1]]),
      b = mercator([bounds[2], bounds[3]]),
      cx = (a[0] + b[0]) / 2,
      cy = (a[1] + b[1]) / 2,
      raw =
        Math.max((b[0] - a[0]) / box.w, (b[1] - a[1]) / box.h, 0.0001) * 1.025,
      cos = Math.cos((((bounds[1] + bounds[3]) / 2) * Math.PI) / 180),
      sw = inverseMercator([cx - (box.w * raw) / 2, cy - (box.h * raw) / 2]),
      ne = inverseMercator([cx + (box.w * raw) / 2, cy + (box.h * raw) / 2]);
    return {
      scale: Math.round(raw * cos * 1000),
      mmPerM: 1 / (raw * cos),
      bounds: [sw[0], sw[1], ne[0], ne[1]],
      point(c) {
        const p = mercator(c);
        return [
          box.x + box.w / 2 + (p[0] - cx) / raw,
          box.y + box.h / 2 - (p[1] - cy) / raw,
        ];
      },
    };
  };
  function clipStart(page, b) {
    page.c.push(
      `q ${fmt(mm(b.x))} ${fmt(page.y(b.y + b.h))} ${fmt(mm(b.w))} ${fmt(mm(b.h))} re W n`,
    );
  }
  function clipEnd(page) {
    page.c.push("Q");
  }
  function rotatedImage(page, jpeg, f, tr) {
    const r = f.geometry.coordinates[0],
      p = r.slice(0, 4).map(tr.point),
      u = [p[1][0] - p[0][0], p[1][1] - p[0][1]],
      v = [p[3][0] - p[0][0], p[3][1] - p[0][1]],
      id = page.pdf.addImageJPEG(jpeg.bytes, jpeg.width, jpeg.height);
    page.imageIds.push(id);
    page.c.push(
      `q ${fmt(mm(u[0]))} ${fmt(-mm(u[1]))} ${fmt(-mm(v[0]))} ${fmt(mm(v[1]))} ${fmt(mm(p[3][0]))} ${fmt(page.y(p[3][1]))} cm /Im${page.imageIds.length} Do Q`,
    );
  }
  async function preparedImage(data, darkWordmark = false) {
    try {
      const blob = String(data).startsWith("data:")
          ? new Blob([dataUrlBytes(data)], {
              type:
                String(data).slice(5, String(data).indexOf(";")) ||
                "image/png",
            })
          : await (await fetch(data)).blob(),
        im = await imageFromBlob(blob),
        c = document.createElement("canvas"),
        output = document.createElement("canvas");
      c.width = im.width;
      c.height = im.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(im, 0, 0);
      if (darkWordmark) {
        const pixels = ctx.getImageData(0, 0, c.width, c.height),
          values = pixels.data;
        for (let index = 0; index < values.length; index += 4) {
          if (
            values[index + 3] > 12 &&
            values[index] > 175 &&
            values[index + 1] > 175 &&
            values[index + 2] > 175
          ) {
            values[index] = 24;
            values[index + 1] = 60;
            values[index + 2] = 49;
          }
        }
        ctx.putImageData(pixels, 0, 0);
      }
      output.width = c.width;
      output.height = c.height;
      const outputContext = output.getContext("2d");
      outputContext.fillStyle = "#fff";
      outputContext.fillRect(0, 0, output.width, output.height);
      outputContext.drawImage(c, 0, 0);
      return {
        bytes: dataUrlBytes(output.toDataURL("image/jpeg", 0.94)),
        width: output.width,
        height: output.height,
      };
    } catch {
      return null;
    }
  }
  function fitImage(page, jpeg, b) {
    const ratio = jpeg.width / jpeg.height,
      w = Math.min(b.w, b.h * ratio),
      h = w / ratio;
    page.image(jpeg, b.x + (b.w - w) / 2, b.y + (b.h - h) / 2, w, h);
  }
  function drawVectorAsset(page, f, tr) {
    const m = f.properties,
      r = f.geometry.coordinates[0],
      p = r.slice(0, 4).map(tr.point),
      u = [(p[1][0] - p[0][0]) / 100, (p[1][1] - p[0][1]) / 100],
      v = [(p[3][0] - p[0][0]) / 100, (p[3][1] - p[0][1]) / 100],
      xy = (x, y) => [
        p[0][0] + x * u[0] + y * v[0],
        p[0][1] + x * u[1] + y * v[1],
      ],
      D = window.SAMISymbols;
    for (const part of D.parts(m.kind, m)) {
      const stroke =
          m.outlineEnabled === false
            ? null
            : D.color(
                m.recolourParts && part.stroke !== "none"
                  ? "ink"
                  : part.stroke || "ink",
                m,
              ),
        fill =
          m.fillEnabled === false
            ? "none"
            : D.color(
                m.recolourParts && part.fill !== "none"
                  ? "accent"
                  : part.fill || "paper",
                m,
              );
      let pts;
      if (part.type === "rect")
        pts = [
          [part.x, part.y],
          [part.x + part.w, part.y],
          [part.x + part.w, part.y + part.h],
          [part.x, part.y + part.h],
          [part.x, part.y],
        ].map((q) => xy(...q));
      else if (part.type === "ellipse")
        pts = Array.from({ length: 33 }, (_, i) =>
          xy(
            part.x + part.w / 2 + (part.w / 2) * Math.cos((i * Math.PI) / 16),
            part.y + part.h / 2 + (part.h / 2) * Math.sin((i * Math.PI) / 16),
          ),
        );
      else if (part.type === "line")
        pts = [xy(part.x, part.y), xy(part.x2, part.y2)];
      else pts = [...part.points, part.points[0]].map((q) => xy(...q));
      page.poly(
        pts,
        stroke,
        part.type === "line" || fill === "none" ? null : fill,
        0.17,
      );
    }
  }
  function activeFeature(f, project, opt) {
    const m = f.properties || {};
    if (["note", "photo"].includes(m.type) && m.includeOnDrawing === false)
      return false;
    return (
      !m.hidden &&
      !m.guideHidden &&
      !project.hiddenTypes?.includes(m.type) &&
      !(
        m.type === "service" &&
        project.serviceVisibility?.[m.serviceType] === false
      ) &&
      includeFeature(f, opt)
    );
  }
  function drawMeasurementAnnotations(page, f, tr) {
    const m = f.properties || {},
      g = f.geometry;
    if (
      m.type !== "measure" ||
      g?.type !== "LineString" ||
      !g.coordinates?.length
    )
      return;
    const cs = g.coordinates,
      total = Number.isFinite(+m.distance) ? +m.distance : G.length(cs);
    for (let i = 1; i < cs.length && i <= 24; i++) {
      const a = cs[i - 1],
        b = cs[i],
        seg = G.distance(a, b);
      if (seg <= 0.15) continue;
      const mid = tr.point([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
      page.text(
        seg.toFixed(2) + " m",
        mid[0] + 1,
        mid[1] - 1,
        4.8,
        false,
        "#263238",
      );
    }
    const p = tr.point(cs[Math.floor(cs.length / 2)]);
    page.text(
      "TOTAL " + total.toFixed(2) + " m",
      p[0] + 2,
      p[1] - 4,
      6.5,
      true,
      "#17211f",
    );
  }
  drawProjectFeatures = function (page, project, tr, box, opt, legend) {
    const seenSupports = new Set();
    for (const f of project.features || []) {
      if (!activeFeature(f, project, opt)) continue;
      const m = f.properties || {},
        st = featureStyle(f);
      if (!G.clipGeometry(f.geometry, tr.bounds)) continue;
      if (
        (m.type === "asset" || m.type === "logo") &&
        f.geometry.type === "Polygon"
      ) {
        const image = opt._images?.get(
          m.imageData || project.logos?.find((l) => l.id === m.logoId)?.data,
        );
        if (image) rotatedImage(page, image, f, tr);
        else drawVectorAsset(page, f, tr);
        if (m.ohlNodeKey && opt.ohlSupportDetails) {
          const b = boundsOfGeom(f.geometry),
            pt = tr.point([(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]);
          page.text(
            [
              m.assetRef,
              m.voltage
                ? Number(m.voltage)
                  ? Number(m.voltage) / 1000 + " kV"
                  : m.voltage
                : "",
            ]
              .filter(Boolean)
              .join(" / "),
            pt[0] + 2,
            pt[1] - 1,
            5.2,
            false,
            "#7d2966",
          );
        }
        if (m.includeLegend !== false)
          legend.set(legendName(m), { color: st.stroke, type: m.type });
        continue;
      }
      for (const ring of flattenLines(f.geometry)) {
        const pts = ring.map(tr.point);
        if (pts.length < 2) continue;
        page.poly(
          pts,
          m.outlineEnabled === false ? null : st.stroke,
          f.geometry.type.includes("Polygon") && m.fillEnabled !== false
            ? st.fill
            : null,
          m.type === "panel" ? 0.12 : st.width,
          st.dash,
        );
      }
      if (
        f.geometry.type === "Point" &&
        !(m.serviceType === "ohl" && m.supportNode)
      ) {
        const p = tr.point(f.geometry.coordinates);
        page.circle(
          p[0],
          p[1],
          m.type === "accessPoint" ? 2.5 : 1.1,
          m.styleColor || st.stroke,
          m.type === "accessPoint" ? "#ffffff" : st.fill || "#fff",
          0.35,
        );
        if (m.type === "accessPoint")
          page.wrapped(m.label, p[0] + 3, p[1], 30, 6.5, true, "#125d48", 3, 2);
      }
      drawMeasurementAnnotations(page, f, tr);
      if (
        ["textBox", "note"].includes(m.type) &&
        f.geometry.type === "Point" &&
        opt.layers?.labels !== false
      ) {
        const p = tr.point(f.geometry.coordinates);
        page.wrapped(
          m.text || m.label,
          p[0] + 2,
          p[1] - 2,
          40,
          6.5,
          false,
          "#253d34",
          3.5,
          6,
        );
      }
      if (m.serviceType === "ohl") {
        let pts = [],
          types = {},
          metas = {};
        try {
          pts = JSON.parse(m.supportPointsJSON || "[]");
          types = JSON.parse(m.supportTypesJSON || "{}");
          metas = JSON.parse(m.supportMetaJSON || "{}");
        } catch {}
        for (const c of pts) {
          if (!G.inside(c, tr.bounds)) continue;
          const key = c.map((n) => Number(n).toFixed(7)).join(",");
          if (seenSupports.has(key)) continue;
          seenSupports.add(key);
          const p = tr.point(c),
            info = metas[key] || {},
            kind = types[key] || info.mappedKind || "unknown";
          if (kind === "pole") page.circle(...p, 1.4, "#9b387f", null, 0.35);
          else if (kind === "pylon" || kind === "tower") {
            page.rect(
              p[0] - 1.8,
              p[1] - 1.8,
              3.6,
              3.6,
              "#9b387f",
              null,
              0.25,
            );
            page.line(
              p[0] - 1.8,
              p[1] - 1.8,
              p[0] + 1.8,
              p[1] + 1.8,
              "#9b387f",
              0.25,
            );
            page.line(
              p[0] + 1.8,
              p[1] - 1.8,
              p[0] - 1.8,
              p[1] + 1.8,
              "#9b387f",
              0.25,
            );
          } else {
            page.line(p[0] - 1.2, p[1], p[0] + 1.2, p[1], "#9b387f", 0.3);
            page.line(p[0], p[1] - 1.2, p[0], p[1] + 1.2, "#9b387f", 0.3);
          }
          const voltage = info.voltage || m.voltage,
            label = [
              info.ref,
              voltage
                ? Number(voltage)
                  ? Number(voltage) / 1000 + " kV"
                  : voltage
                : "",
            ]
              .filter(Boolean)
              .join(" / ");
          if (label && opt.ohlSupportDetails)
            page.text(label, p[0] + 2, p[1] - 1, 5.2, false, "#7d2966");
        }
      }
      if (m.includeLegend !== false)
        legend.set(legendName(m), { color: st.stroke, type: m.type });
    }
  };
  function headerStudio(page, title, pageNo, total, opt = {}) {
    const brand = opt._samiBrand;
    if (brand) fitImage(page, brand, { x: 8, y: 5.2, w: 42, h: 10.8 });
    else {
      page.text("SAMI", 8, 15, 18, true, "#184c3c");
    }
    page.line(54, 7, 54, 18, "#5bc38d", 0.55);
    page.text(
      "SPATIAL ANALYSIS / MAPPING INTELLIGENCE",
      58,
      10.5,
      4.8,
      true,
      "#6a7f73",
    );
    page.text(title, 58, 16.2, 11, true, "#233f34");
    page.text(`${pageNo} / ${total}`, page.w - 21, 15.5, 7, false, "#50685f");
    page.line(8, 21, page.w - 8, 21, "#9dad9f", 0.25);
  }
  async function footerStudio(page, project, opt, n, total, scale = "") {
    const m = project.meta || {},
      y = page.h - 40,
      w = page.w - 16;
    page.rect(8, y, w, 28, "#81988b", "#f6f8f5", 0.3);
    let x = 12;
    const logos = (project.logos || []).filter((l) => l.export !== false),
      maxLogoW = logos.length ? Math.min(78, logos.length * 26) : 0;
    for (const l of logos) {
      const im = opt._images.get(l.data);
      if (!im) continue;
      fitImage(page, im, {
        x,
        y: y + 3.2,
        w: maxLogoW / logos.length - 3,
        h: 17.5,
      });
      x += maxLogoW / logos.length;
    }
    if (logos.length) x += 4;
    const rows = [
      ["PROJECT", project.name === "Untitled site" ? "" : project.name],
      ["DRAWING", m.drawingNo || m.siteRef],
      ["DESIGNER", opt.preparedBy || m.creator],
      ["COMPANY", m.designerCompany],
      ["REVISION", opt.revision || m.revision],
      ["STATUS", opt.status || m.drawingStatus],
      ["SCALE", scale],
      ["EXPORTED", new Date().toLocaleDateString("en-GB")],
    ].filter(([, v]) => v);
    const cols = 4,
      cw = (page.w - 16 - x) / cols;
    rows.forEach(([k, v], i) => {
      const xx = x + (i % cols) * cw,
        yy = y + 5 + Math.floor(i / cols) * 10.5;
      page.text(k, xx, yy, 4.7, true, "#697e72");
      page.wrapped(v, xx, yy + 4.3, cw - 3.5, 6.4, true, "#203e31", 2.8, 2);
    });
    const contact = [m.designerEmail, m.designerPhone]
      .filter(Boolean)
      .join("  |  ");
    if (contact) page.text(contact, 12, page.h - 7, 5.2, false, "#567568");
    page.text(
      "Created with SAMI · JW EDS",
      page.w - 52,
      page.h - 7,
      5.2,
      false,
      "#567568",
    );
  }
  function infoBlock(page, title, rows, x, y, w) {
    const present = rows.filter(
      ([, v]) => v !== undefined && v !== null && String(v).trim() !== "",
    );
    if (!present.length) return y;
    page.text(title, x, y, 7.4, true, "#204d3a");
    let yy = y + 7;
    for (const [k, v] of present) {
      page.text(k.toUpperCase(), x, yy, 4.8, true, "#708274");
      yy = page.wrapped(v, x, yy + 4, w, 6.8, false, "#314d3e", 3.5, 4) + 4;
    }
    return yy;
  }
  renderSitePage = async function (pdf, project, opt, n, total) {
    const p = new Page(pdf);
    headerStudio(p, "SITE PLAN", n, total, opt);
    const mapBox = { x: 8, y: 24, w: 312, h: 225 },
      side = { x: 327, y: 28, w: 85 };
    if (!project.area) throw Error("Define a site area before exporting.");
    const tr = makeTransform(project.area, mapBox),
      legend = new Map();
    p.rect(mapBox.x, mapBox.y, mapBox.w, mapBox.h, "#759280", "#fff", 0.25);
    clipStart(p, mapBox);
    const raster =
      opt.style === "cad"
        ? null
        : await fetchMapJPEG(
            tr.bounds,
            opt.style,
            1600,
            Math.round((1600 * mapBox.h) / mapBox.w),
          );
    if (raster) p.image(raster, mapBox.x, mapBox.y, mapBox.w, mapBox.h);
    else drawBase(p, project.planBase || [], tr, mapBox, opt);
    drawProjectFeatures(p, project, tr, mapBox, opt, legend);
    const a = project.area,
      ring = [
        [a[0], a[1]],
        [a[2], a[1]],
        [a[2], a[3]],
        [a[0], a[3]],
        [a[0], a[1]],
      ].map(tr.point);
    p.poly(ring, "#39604a", null, 0.3, [2, 1]);
    clipEnd(p);
    drawCoordinateBorder(p, tr.bounds, mapBox);
    drawNorth(p, mapBox.x + mapBox.w - 9, mapBox.y + 8);
    p.rect(
      mapBox.x + 5,
      mapBox.y + mapBox.h - 16,
      60,
      13,
      "#ffffff",
      "#ffffff",
      0,
    );
    drawScaleBar(p, mapBox.x + 9, mapBox.y + mapBox.h - 11, tr.scale, 43);
    if (raster)
      p.text(
        opt.style === "satellite"
          ? "Imagery: Esri"
          : "Map data: OpenStreetMap contributors",
        mapBox.x + 7,
        mapBox.y + mapBox.h - 2,
        4.5,
        false,
        "#566e60",
      );
    const m = project.meta || {};
    let y = infoBlock(
      p,
      "PROJECT INFORMATION",
      [
        ["Address", m.siteAddress],
        ["Client", m.clientName],
        ["Reference", m.siteRef],
        ["what3words", m.what3words || m.w3w],
      ],
      side.x,
      side.y,
      side.w,
    );
    if (legend.size) {
      p.text("DRAWING KEY", side.x, y + 3, 7.4, true, "#204d3a");
      y += 11;
      for (const [name, st] of legend) {
        if (y > 166) break;
        p.line(side.x, y - 1, side.x + 7, y - 1, st.color, 0.5);
        y =
          p.wrapped(
            name,
            side.x + 10,
            y,
            side.w - 10,
            6.2,
            false,
            "#36523f",
            3.5,
            2,
          ) + 3;
      }
    }
    const gates = project.features.filter(
      (f) =>
        f.properties.type === "accessPoint" && activeFeature(f, project, opt),
    );
    for (const f of gates) {
      if (y > 205) break;
      y = infoBlock(
        p,
        "ACCESS POINT",
        [
          [
            f.properties.label,
            f.properties.address ||
              `${f.geometry.coordinates[1].toFixed(6)}, ${f.geometry.coordinates[0].toFixed(6)}`,
          ],
        ],
        side.x,
        y + 5,
        side.w,
      );
    }
    const notes = opt.notes || m.siteNotes;
    if (notes && y < 207) {
      p.text("NOTES", side.x, y + 4, 6.8, true, "#204d3a");
      p.wrapped(
        notes,
        side.x,
        y + 10,
        side.w,
        6.5,
        false,
        "#3b5144",
        3.5,
        Math.max(1, Math.floor((220 - y - 10) / 3.5)),
      );
    }
    p.wrapped(
      "Reference data: OpenStreetMap contributors; Planning Data (c) Crown copyright and database right 2026, OGL v3.0. Imagery when shown: (c) Esri and contributors.",
      side.x,
      228,
      side.w,
      4.2,
      false,
      "#5e7567",
      2.5,
      6,
    );
    if (opt.hasDetails)
      p.text(
        "Full key / notes continue on project details sheet.",
        side.x,
        248,
        5.5,
        false,
        "#5e7567",
      );
    await footerStudio(
      p,
      project,
      opt,
      n,
      total,
      `1:${Math.round(tr.scale * (opt.paper === "a4" ? 420 / 297 : 1))} at ${opt.paper === "a4" ? "A4" : "A3"}`,
    );
    p.done();
  };
  renderRoutePage = async function (pdf, project, opt, n, total) {
    const r = project.routes?.at(-1);
    if (!r) throw Error("Create a route before including the route sheet.");
    const p = new Page(pdf),
      m = project.meta || {},
      gate =
        r.accessPoint ||
        project.features.find((f) => f.id === r.accessPointId)?.properties ||
        {};
    headerStudio(
      p,
      "ROUTE TO SITE · " +
        String(gate.label || r.endLabel || "ACCESS POINT").toUpperCase(),
      n,
      total,
      opt,
    );
    const overviewBox = { x: 8, y: 24, w: 280, h: 132 },
      approachBox = { x: 8, y: 162, w: 166, h: 89 },
      rb = expandBounds(routeBounds(r), Math.max(100, (r.distanceKm || 1) * 8)),
      tr = makeTransform(rb, overviewBox);
    const drawRoute = async (box, bounds, full) => {
      const t = makeTransform(bounds, box);
      p.rect(box.x, box.y, box.w, box.h, "#769280", "#f7f9f6", 0.25);
      clipStart(p, box);
      const raster = await fetchMapJPEG(
        t.bounds,
        "map",
        1400,
        Math.round((1400 * box.h) / box.w),
      );
      if (raster) p.image(raster, box.x, box.y, box.w, box.h);
      const geom = G.clipGeometry(
        { type: "LineString", coordinates: r.geometry },
        t.bounds,
      );
      for (const line of flattenLines(geom))
        p.poly(line.map(t.point), "#ad3541", null, 0.85);
      for (const [c, label, col] of [
        [r.start, "START", "#24764f"],
        [r.end, gate.label || "SITE", "#b03e49"],
      ]) {
        if (!G.inside(c, t.bounds)) continue;
        const pt = t.point(c);
        p.circle(pt[0], pt[1], 2.4, col, "#fff", 0.7);
        p.wrapped(
          label,
          Math.min(box.x + box.w - 30, pt[0] + 3),
          Math.max(box.y + 10, pt[1] - 3),
          27,
          6.7,
          true,
          col,
          3.4,
          2,
        );
      }
      clipEnd(p);
      p.rect(box.x + 3, box.y + 3, full ? 42 : 38, 7, "#fff", "#fff", 0);
      p.text(
        full ? "ROUTE OVERVIEW" : "FINAL APPROACH",
        box.x + 5,
        box.y + 8,
        6.5,
        true,
        "#294a37",
      );
      if (raster)
        p.text(
          "Map data: OpenStreetMap contributors" +
            (raster.partial ? " (partial imagery)" : ""),
          box.x + 4,
          box.y + box.h - 3,
          4.4,
          false,
          "#4e6a56",
        );
      else
        p.text(
          "Map image unavailable - route geometry only",
          box.x + 4,
          box.y + box.h - 3,
          5.5,
          false,
          "#924249",
        );
    };
    await drawRoute(overviewBox, rb, true);
    await drawRoute(
      approachBox,
      expandBounds([...r.end, ...r.end], 400),
      false,
    );
    let y = infoBlock(
      p,
      "DESTINATION",
      [
        ["Entrance", gate.label],
        ["Address", gate.address || r.endLabel || m.siteAddress],
        [
          "Coordinates",
          r.end ? `${r.end[1].toFixed(6)}, ${r.end[0].toFixed(6)}` : "",
        ],
        ["what3words", gate.what3words || m.what3words],
        ["Contact", m.siteContact],
        ["Telephone", m.sitePhone],
      ],
      296,
      32,
      110,
    );
    const vehicle = r.vehicle || {};
    y = infoBlock(
      p,
      "JOURNEY",
      [
        ["Origin", r.startLabel],
        ["Vehicle", r.profileName],
        [
          "Dimensions",
          [
            vehicle.height ? vehicle.height + " m high" : "",
            vehicle.width ? vehicle.width + " m wide" : "",
            vehicle.weight ? vehicle.weight + " t" : "",
          ]
            .filter(Boolean)
            .join(" / "),
        ],
        [
          "Distance",
          r.distanceKm ? Number(r.distanceKm).toFixed(1) + " km" : "",
        ],
        ["Travel time", r.timeSec ? Math.round(r.timeSec / 60) + " min" : ""],
      ],
      296,
      y + 4,
      110,
    );
    let ny = 163;
    const notes = [
      gate.arrivalInstructions,
      m.arrivalInstructions,
      m.driverNotes,
    ].filter(Boolean);
    if (notes.length)
      ny = infoBlock(
        p,
        "ARRIVAL INSTRUCTIONS",
        notes.map((v, i) => [i ? "Driver note" : "Approach", v]),
        181,
        ny,
        105,
      );
    const constraints = (r.constraints || [])
      .map((x) => (typeof x === "string" ? x : x.label || x.type))
      .filter(Boolean);
    if (constraints.length && ny < 207)
      infoBlock(
        p,
        "RETURNED CONSTRAINTS",
        constraints.slice(0, 3).map((v) => ["", v]),
        181,
        ny + 3,
        105,
      );
    p.text("ROUTE SOURCE", 181, 231, 5.1, true, "#708274");
    p.wrapped(r.provider || "", 181, 236, 105, 5.8, false, "#4f6656", 3, 2);
    if (r.status === "preview")
      p.wrapped(
        "Mapped truck route preview. Confirm restrictions and final access before travel.",
        296,
        211,
        68,
        5.7,
        false,
        "#924249",
        3,
        4,
      );
    const nav = `https://www.google.com/maps/dir/?api=1&origin=${r.start[1]},${r.start[0]}&destination=${r.end[1]},${r.end[0]}&travelmode=driving`;
    drawQR(p, nav, 373, 205, 31);
    p.text("OPEN DESTINATION", 371, 240, 4.9, true, "#355c43");
    p.wrapped(
      "Navigation may recalculate for a car.",
      296,
      234,
      67,
      5.4,
      false,
      "#924249",
      3,
      2,
    );
    await footerStudio(p, project, opt, n, total, "Route overview");
    p.done();
  };
  const generateStudio = generate;
  generate = async function (project, opt = {}) {
    const options = { ...opt, _images: new Map() };
    const data = new Set([
      ...(project.logos || []).map((l) => l.data),
      ...(project.features || [])
        .map((f) => f.properties.imageData)
        .filter(Boolean),
    ]);
    for (const d of data) {
      const im = await preparedImage(d);
      if (im) options._images.set(d, im);
    }
    return generateStudio(project, options);
  };
  fetchMapJPEG = async function (bounds, style, wPx = 1600, hPx = 1000) {
    if (style === "cad" || !bounds) return null;
    try {
      let z = 18;
      for (let zz = 3; zz <= 18; zz++) {
        const a = tileXY(bounds[0], bounds[3], zz),
          b = tileXY(bounds[2], bounds[1], zz);
        if (
          Math.max(((b[0] - a[0]) * 256) / wPx, ((b[1] - a[1]) * 256) / hPx) > 1
        ) {
          z = Math.max(3, zz - 1);
          break;
        }
      }
      let a, b, x0, x1, y0, y1;
      const extents = () => {
        a = tileXY(bounds[0], bounds[3], z);
        b = tileXY(bounds[2], bounds[1], z);
        x0 = Math.floor(a[0]);
        x1 = Math.floor(b[0]);
        y0 = Math.floor(a[1]);
        y1 = Math.floor(b[1]);
      };
      extents();
      while ((x1 - x0 + 1) * (y1 - y0 + 1) > 24 && z > 1) {
        z--;
        extents();
      }
      const full = document.createElement("canvas");
      full.width = (x1 - x0 + 1) * 256;
      full.height = (y1 - y0 + 1) * 256;
      const fctx = full.getContext("2d");
      fctx.fillStyle = "#edf1ea";
      fctx.fillRect(0, 0, full.width, full.height);
      let next = 0,
        success = 0;
      const jobs = [];
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) jobs.push([x, y]);
      const controller = new AbortController(),
        timer = setTimeout(() => controller.abort(), 12000);
      try {
        await Promise.all(
          Array.from({ length: Math.min(4, jobs.length) }, async () => {
            while (next < jobs.length && !controller.signal.aborted) {
              const [x, y] = jobs[next++],
                n = 2 ** z,
                wrapX = ((x % n) + n) % n;
              try {
                const url =
                    style === "satellite"
                      ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${wrapX}`
                      : `https://tile.openstreetmap.org/${z}/${wrapX}/${y}.png`,
                  r = await fetch(url, {
                    mode: "cors",
                    signal: controller.signal,
                  });
                if (!r.ok) continue;
                const im = await imageFromBlob(await r.blob());
                fctx.drawImage(im, (x - x0) * 256, (y - y0) * 256, 256, 256);
                im.close?.();
                success++;
              } catch {}
            }
          }),
        );
      } finally {
        clearTimeout(timer);
      }
      if (!success) return null;
      const canvas = document.createElement("canvas");
      canvas.width = wPx;
      canvas.height = hPx;
      canvas
        .getContext("2d")
        .drawImage(
          full,
          (a[0] - x0) * 256,
          (a[1] - y0) * 256,
          Math.max(1, (b[0] - a[0]) * 256),
          Math.max(1, (b[1] - a[1]) * 256),
          0,
          0,
          wPx,
          hPx,
        );
      return {
        bytes: dataUrlBytes(canvas.toDataURL("image/jpeg", 0.87)),
        width: wPx,
        height: hPx,
        partial: success < jobs.length,
      };
    } catch {
      return null;
    }
  };
  const SAMI_PDF_WORDMARK =
    "data:image/png;base64,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";
  const originalWrap = wrap;
  wrap = function (text, maxMm, size) {
    const limit = Math.max(3, Math.floor((maxMm * PT) / (size * 0.53))),
      split = ascii(text)
        .split(/\s+/)
        .map((w) =>
          w.length > limit
            ? w.match(new RegExp(".{1," + limit + "}", "g")).join(" ")
            : w,
        )
        .join(" ");
    return originalWrap(split, maxMm, size);
  };
  function detailRows(project, opt) {
    const fs = (project.features || []).filter((f) =>
        activeFeature(f, project, opt),
      ),
      names = [
        ...new Set(
          fs
            .filter((f) => f.properties.includeLegend !== false)
            .map((f) => legendName(f.properties)),
        ),
      ],
      gates = fs.filter((f) => f.properties.type === "accessPoint"),
      notes = opt.notes || project.meta?.siteNotes || "",
      r = project.routes?.at(-1),
      routeNotes = [
        r?.accessPoint?.arrivalInstructions,
        project.meta?.arrivalInstructions,
        project.meta?.driverNotes,
      ].filter(Boolean),
      constraints = (r?.constraints || [])
        .map((x) => (typeof x === "string" ? x : x.label || x.type))
        .filter(Boolean),
      rows = [];
    const m = project.meta || {},
      metadata = [
        m.siteAddress,
        m.clientName,
        m.siteRef,
        m.what3words || m.w3w,
      ].filter(Boolean);
    let sideY = metadata.length
      ? 31 +
        7 +
        metadata.reduce(
          (n, v) => n + 8 + Math.min(4, wrap(v, 85, 6.8).length) * 3.5,
          0,
        )
      : 31;
    sideY += 11;
    let keyClipped = false;
    for (const name of names) {
      if (sideY > 166) keyClipped = true;
      sideY += Math.min(2, wrap(name, 75, 6.2).length) * 3.5 + 3;
    }
    if (
      opt.pages?.site !== false &&
      (keyClipped ||
        gates.length > 2 ||
        notes.length > 350 ||
        metadata.some((v) => String(v).length > 150))
    ) {
      rows.push(["SITE PLAN DETAILS", ""]);
      if (names.length) rows.push(["DRAWING KEY", names.join("\n")]);
      for (const f of gates)
        rows.push([
          "ACCESS POINT: " + f.properties.label,
          [
            f.properties.address,
            f.properties.what3words,
            `${f.geometry.coordinates[1].toFixed(6)}, ${f.geometry.coordinates[0].toFixed(6)}`,
            f.properties.arrivalInstructions,
          ]
            .filter(Boolean)
            .join("\n"),
        ]);
      for (const [label, value] of [
        ["Site address", m.siteAddress],
        ["Client", m.clientName],
        ["Reference", m.siteRef],
        ["what3words", m.what3words || m.w3w],
      ])
        if (value) rows.push([label.toUpperCase(), value]);
      if (notes) rows.push(["DRAWING NOTES", notes]);
    }
    if (
      opt.pages?.route !== false &&
      r &&
      (routeNotes.join(" ").length > 250 ||
        constraints.length > 3 ||
        constraints.join(" ").length > 250 ||
        String(r.endLabel || "").length > 200)
    ) {
      rows.push(["ROUTE DETAILS", ""]);
      if (routeNotes.length)
        rows.push(["ARRIVAL / DRIVER NOTES", routeNotes.join("\n")]);
      if (constraints.length)
        rows.push(["RETURNED ROUTE CONSTRAINTS", constraints.join("\n")]);
      if (r.endLabel) rows.push(["DESTINATION", r.endLabel]);
    }
    if (opt.ohlSupportDetails) {
      const formatVoltage = (value) =>
          String(value || "")
            .split(";")
            .filter(Boolean)
            .map((item) => {
              const number = Number(item);
              return Number.isFinite(number)
                ? number >= 1000
                  ? number / 1000 + " kV"
                  : number + " V"
                : item;
            })
            .join(" / "),
        groups = new Map();
      for (const feature of fs.filter(
        (feature) => feature.properties.serviceType === "ohl",
      )) {
        const properties = feature.properties || {};
        let points = [],
          types = {},
          metadata = {};
        try {
          points = JSON.parse(properties.supportPointsJSON || "[]");
          types = JSON.parse(properties.supportTypesJSON || "{}");
          metadata = JSON.parse(properties.supportMetaJSON || "{}");
        } catch {}
        if (!points.length && properties.supportNode && feature.geometry.type === "Point")
          points = [feature.geometry.coordinates];
        for (const coordinate of points) {
          const key = coordinate
              .map((number) => Number(number).toFixed(7))
              .join(","),
            info = metadata[key] || {},
            line = [
              formatVoltage(properties.voltage || info.voltage),
              info.lineName || properties.lineRef || properties.label,
              properties.owner || info.owner || properties.operator || info.operator,
            ]
              .filter(Boolean)
              .join(" · ") || "Unreferenced overhead line",
            group = groups.get(line) || new Map(),
            kind = types[key] || info.mappedKind || "unidentified support",
            kindLabel =
              kind === "pylon" || kind === "tower"
                ? "Tower / pylon"
                : kind === "pole"
                  ? "Pole"
                  : kind === "portal"
                    ? "Portal / gantry"
                    : kind === "terminal"
                      ? "Terminal"
                      : "Unidentified support",
            description =
              info.note ||
              info.design ||
              [info.material, info.height ? "height " + info.height : ""]
                .filter(Boolean)
                .join(" · ");
          group.set(
            key,
            [info.ref || "No asset reference", kindLabel, description]
              .filter(Boolean)
              .join(" — "),
          );
          groups.set(line, group);
        }
      }
      for (const [line, supports] of groups)
        if (supports.size)
          rows.push([
            "OHL SUPPORT SCHEDULE — " + line,
            [...supports.values()].join("\n"),
          ]);
    }
    return rows;
  }
  function paginateDetails(rows) {
    const pages = [[]];
    let count = 0;
    for (const [title, value] of rows) {
      const lines = String(value || "")
        .split("\n")
        .flatMap((t) => wrap(t, 370, 9));
      const chunks = [
        { text: title, title: true },
        ...lines.map((text) => ({ text, title: false })),
        { text: "", title: false },
      ];
      for (const line of chunks) {
        if (count >= 43) {
          pages.push([]);
          count = 0;
        }
        pages.at(-1).push(line);
        count++;
      }
    }
    return pages.filter((p) => p.length);
  }
  async function renderDetailsPage(pdf, project, opt, n, total, lines) {
    const p = new Page(pdf);
    headerStudio(p, "PROJECT DETAILS", n, total, opt);
    let y = 33;
    for (let index = 0; index < lines.length; index++) {
      const row = lines[index];
      if (row.title && row.text.startsWith("OHL SUPPORT SCHEDULE")) {
        let end = index + 1;
        while (end < lines.length && lines[end].text) end++;
        const height = Math.max(13, (end - index) * 4.7 + 5.5);
        p.rect(13, y - 5.2, p.w - 26, height, "#9caf9f", "#f7f9f6", 0.28);
        p.text("LINE / SUPPORT DETAILS", 16, y - 1.2, 4.5, true, "#708274");
        y += 2.2;
      }
      p.text(row.text, 16, y, row.title ? 8.6 : 9, row.title, "#264b38");
      y += 4.7;
    }
    await footerStudio(p, project, opt, n, total);
    p.done();
  }
  generate = async function (project, opt = {}) {
    if (!project) throw Error("No project supplied.");
    const options = { ...opt, _images: new Map(), _samiBrand: null },
      data = new Set([
        ...(project.logos || [])
          .filter((l) => l.export !== false)
          .map((l) => l.data),
        ...(project.features || [])
          .filter((f) => activeFeature(f, project, opt))
          .map((f) => f.properties.imageData)
          .filter(Boolean),
      ]);
    for (const d of data) {
      const im = await preparedImage(d);
      if (im) options._images.set(d, im);
    }
    options._samiBrand =
      (await preparedImage(SAMI_PDF_WORDMARK, true)) ||
      (await preparedImage("sami-wordmark.png", true));
    const routeRecords = [];
    if (opt.pages?.route !== false) {
      const byGate = new Map();
      for (const r of project.routes || []) {
        const key = r.accessPointId || (r.end || []).join(",") || r.id;
        if (key) byGate.set(key, r);
      }
      routeRecords.push(...byGate.values());
    }
    const sitePages = opt.pages?.site !== false ? 1 : 0;
    if (!sitePages && !routeRecords.length)
      throw Error("Choose an export sheet.");
    const details = paginateDetails(detailRows(project, opt)),
      paper = opt.paper === "a4" ? [297, 210] : [420, 297],
      pdf = new PDF(...paper, 420, 297),
      total = sitePages + routeRecords.length + details.length;
    options.hasDetails = details.length > 0;
    let n = 1;
    if (sitePages) await renderSitePage(pdf, project, options, n++, total);
    for (const r of routeRecords) {
      const routeProject = { ...project, routes: [r] };
      await renderRoutePage(pdf, routeProject, options, n++, total);
    }
    for (const lines of details)
      await renderDetailsPage(pdf, project, options, n++, total, lines);
    return pdf.build();
  };
  window.SAMIDocumentEngine = { generate, share };
})();
