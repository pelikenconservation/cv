(function () {
  'use strict';
  var svg = document.getElementById('mini-map');
  if (!svg) return;
  // the world outlines (data/world.js, ~160 KB) are only fetched when the map is about to scroll into view
  var ver = '', me = document.currentScript && document.currentScript.src;
  if (me && me.indexOf('?') > 0) ver = me.slice(me.indexOf('?'));
  function draw() {
  if (!window.WORLD_TOPO) return;
  var NS = 'http://www.w3.org/2000/svg';
  var S = 175;
  function proj(lon, lat) { // Natural Earth projection (same as the Journey page)
    var l = lon * Math.PI / 180, p = lat * Math.PI / 180, p2 = p * p, p4 = p2 * p2;
    var x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
    var y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
    return [x * S, -y * S];
  }
  function mk(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  // Three regions only: the full route lives on the Journey page
  var REGIONS = [
    { name: 'Europe', n: '5 stops', ll: [3.5, 49], color: '#1b5b7a', dx: -8, dy: -34, anchor: 'end' },
    { name: 'Philippines', n: '8 stops', ll: [122.5, 13], color: '#1e4a3a', dx: 12, dy: -34, anchor: 'start' },
    { name: 'Australia', n: '1 stop', ll: [151.1, -33.8], color: '#6c6e64', dx: -12, dy: 30, anchor: 'end' }
  ];
  var P = REGIONS.map(function (r) { return proj(r.ll[0], r.ll[1]); });

  // land: one soft shape, no borders (110m outlines; rings crossing the antimeridian are split in two)
  var topo = window.WORLD_TOPO, sc = topo.transform.scale, tr = topo.transform.translate;
  var arcs = topo.arcs.map(function (a) { var x = 0, y = 0; return a.map(function (p) { x += p[0]; y += p[1]; return [x * sc[0] + tr[0], y * sc[1] + tr[1]]; }); });
  function ring(idx) { var pts = []; idx.forEach(function (i) { var a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; pts = pts.concat(pts.length ? a.slice(1) : a); }); return pts; }
  function clip(pts, keep, edge) {
    var out = [], n = pts.length;
    for (var i = 0; i < n; i++) { var a = pts[i], b = pts[(i + 1) % n], ia = keep(a[0]), ib = keep(b[0]); if (ia) out.push(a); if (ia !== ib) out.push([edge, a[1] + (edge - a[0]) / (b[0] - a[0]) * (b[1] - a[1])]); }
    return out;
  }
  var d = [];
  function flat(pts) {
    var out = [], last = null;
    for (var i = 0; i < pts.length; i++) { var q = proj(pts[i][0], pts[i][1]); if (last && Math.abs(q[0] - last[0]) + Math.abs(q[1] - last[1]) < 0.5 && i < pts.length - 1) continue; out.push(q); last = q; }
    if (out.length > 2) d.push('M' + out.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'Z');
  }
  function drawRing(idx) {
    var pts = ring(idx), cross = false;
    for (var j = 1; j < pts.length; j++) if (Math.abs(pts[j][0] - pts[j - 1][0]) > 180) { cross = true; break; }
    if (cross) {
      var sh = pts.map(function (p) { return [p[0] < 0 ? p[0] + 360 : p[0], p[1]]; });
      flat(clip(sh, function (x) { return x <= 180; }, 180));
      flat(clip(sh, function (x) { return x >= 180; }, 180).map(function (p) { return [p[0] - 360, p[1]]; }));
    } else flat(pts);
  }
  topo.objects.countries.geometries.forEach(function (g) {
    if (g.properties && g.properties.name === 'Antarctica') return;
    if (g.type === 'Polygon') g.arcs.forEach(drawRing); else if (g.type === 'MultiPolygon') g.arcs.forEach(function (poly) { poly.forEach(drawRing); });
  });
  var land = mk('g', { 'class': 'land' }, svg); mk('path', { d: d.join(''), 'fill-rule': 'evenodd' }, land);

  // camera: the three regions with a generous margin
  var xs = P.map(function (p) { return p[0]; }), ys = P.map(function (p) { return p[1]; });
  var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
  var w = (x1 - x0) * 1.3, h = w * 0.62, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + 6;
  if (h < (y1 - y0) * 1.7) { h = (y1 - y0) * 1.7; w = h / 0.62; }
  svg.setAttribute('viewBox', (cx - w / 2) + ' ' + (cy - h / 2) + ' ' + w + ' ' + h);
  var k = w / 640;

  // two quiet arcs: Philippines <-> Europe (solid) and Philippines -> Australia (dotted)
  function arc(a, b, bulge) {
    var dx = b[0] - a[0], dy = b[1] - a[1], dist = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / dist, ny = dx / dist;
    if (ny > 0) { nx = -nx; ny = -ny; }
    return 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'Q' + ((a[0] + b[0]) / 2 + nx * dist * bulge).toFixed(1) + ' ' + ((a[1] + b[1]) / 2 + ny * dist * bulge).toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
  }
  mk('path', { d: arc(P[0], P[1], 0.28), 'class': 'mm-route', pathLength: 1 }, svg);
  mk('path', { d: arc(P[1], P[2], 0.12), 'class': 'mm-plan' }, svg);

  REGIONS.forEach(function (r, i) {
    var g = mk('g', { transform: 'translate(' + P[i][0] + ' ' + P[i][1] + ') scale(' + k + ')', 'class': 'mm-dot' }, svg);
    g.style.setProperty('--i', i * 2);
    mk('circle', { r: 17, fill: r.color, opacity: 0.16 }, g);
    mk('circle', { r: 7, fill: r.color, stroke: '#fff', 'stroke-width': 2.5 }, g);
    var t1 = mk('text', { x: r.dx, y: r.dy, 'text-anchor': r.anchor, 'class': 'mm-t1' }, g); t1.textContent = r.name;
    var t2 = mk('text', { x: r.dx, y: r.dy + 17, 'text-anchor': r.anchor, 'class': 'mm-t2' }, g); t2.textContent = r.n;
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { svg.classList.add('go'); io.disconnect(); } }); }, { threshold: 0.3 });
    io.observe(svg);
  } else svg.classList.add('go');
  }
  function start() {
    if (window.WORLD_TOPO) return draw();
    var s = document.createElement('script'); s.src = 'data/world.js' + ver; s.onload = draw; document.head.appendChild(s);
  }
  if ('IntersectionObserver' in window) {
    var pre = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { pre.disconnect(); start(); } }, { rootMargin: '400px 0px' });
    pre.observe(svg);
  } else start();
})();
