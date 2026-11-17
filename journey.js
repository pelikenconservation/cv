(function () {
  'use strict';
  var svg = document.getElementById('jsvg');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Projection (Natural Earth) ---------- */
  var S = 175;
  function proj(lon, lat) {
    var l = lon * Math.PI / 180, p = lat * Math.PI / 180, p2 = p * p, p4 = p2 * p2;
    var x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
    var y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
    return [x * S, -y * S];
  }

  /* ---------- Journey data (chronological) ---------- */
  var CATS = {
    base: { label: 'Home & study', color: '#6c6e64', dark: '#aab1a4' },
    cetacean: { label: 'Cetaceans', color: '#1b5b7a', dark: '#4aa6d0' },
    birds: { label: 'Birds & biodiversity', color: '#c26a2a', dark: '#ee9650' },
    project: { label: 'Lead project', color: '#1e4a3a', dark: '#52b58e' }
  };
  var STOPS = [
    { short: 'San Pablo', yr: 'Origins', years: 'Where it began', title: 'San Pablo City, Laguna', org: 'Home', place: 'Philippines', cat: 'base', ll: [14.07, 121.33], w: 60,
      text: 'A British-Filipino researcher, originally from San Pablo City in the Philippines. A long way from here, a journey through study, fieldwork and conservation begins.', bullets: [], tags: ['Origins'] },
    { short: 'Lancaster', yr: '2017', years: '2017 – 2021', title: 'BSc (Hons) Ecology and Conservation', org: 'Lancaster University', place: 'Lancaster, United Kingdom', cat: 'base', ll: [54.01, -2.79], w: 70,
      text: 'Where the science foundation was built, while balancing studies, rehabilitation and the COVID-19 pandemic.', bullets: ['Graduated 2021, Upper Second-Class', 'Bursary Award (2017)', 'Ambassador for Student Switch-off, UNICEF volunteer, member of Lancaster Ecohub (2017)'], tags: ['Education'] },
    { short: 'Sydney', yr: '2018', years: '2018', title: 'Study abroad', org: 'Macquarie University', place: 'Sydney, Australia', cat: 'base', ll: [-33.775, 151.113], w: 130,
      text: 'A study-abroad placement in Australia as part of the degree — an experience that shaped how I approach research and conservation: with perseverance and adaptability.', bullets: [], tags: ['Education'], link: ['Read the full story', 'about.html'] },
    { short: 'New Quay', yr: '2022', years: '2022', title: 'Cetacean surveys & outreach', org: 'Sea Watch Foundation', place: 'New Quay, Wales, United Kingdom', cat: 'cetacean', ll: [52.215, -4.36], w: 55,
      text: 'Marine mammal surveys and public outreach in New Quay, Wales — from survey boats to the visitor centre.', bullets: ['Boat-based cetacean surveys and land-based observation (landwatch) surveys', 'Cetacean photo-identification, data entry and management', 'Managed visitor centre operations and delivered workshops on marine conservation', 'Led boat-based wildlife surveys and developed educational materials'], tags: ['Marine Mammal Research Intern', 'Educational & Outreach Assistant'] },
    { short: 'El Pelayo', yr: '2023', years: '2023', title: 'Marine Mammal Research Intern', org: 'CIRCE — Conservation, Information and Study of Cetaceans', place: 'El Pelayo, Spain', cat: 'cetacean', ll: [36.1, -5.43], w: 60,
      text: 'Cetacean research expeditions on the southern coast of Spain.', bullets: ['Research expeditions and survey work', 'Photographic data collection for photo-identification', 'Field equipment maintenance'], tags: ['Cetaceans'] },
    { short: 'Fyns Hoved', yr: '2023', years: '2023', title: 'Marine Mammal Research Intern', org: 'Deutsches Meeresmuseum & Thünen Institute', place: 'Fyns Hoved, Denmark', cat: 'cetacean', ll: [55.62, 10.6], w: 55,
      text: 'Supporting the PAL-CE project on how well acoustic deterrent devices reduce harbour porpoise bycatch in the Baltic Sea.', bullets: ['Land-based behavioural observations with theodolite tracking and drone footage', 'Acoustic data collection using hydrophones', 'Vessel preparation, experimental setup and field data management'], tags: ['Cetaceans', 'Acoustics'] },
    { short: 'Camiguin', yr: '2024', years: '2024', title: 'Marine Mammal Research Intern', org: 'Balyena.org', place: 'Camiguin Island, Babuyan Islands, Philippines', cat: 'cetacean', ll: [18.9, 121.86], w: 50,
      text: 'Back in the Philippines: humpback whale expeditions and years of sighting records brought together.', bullets: ['Humpback whale surveys and photo-identification data', 'Digitised and compiled 20 years of cetacean sighting records', 'Co-authored a poster at the 2024 Society for Marine Mammalogy Conference', 'Live stranding response (dwarf sperm whale) and necropsy of a 13.6 m sperm whale'], tags: ['Cetaceans', 'Poster co-author'] },
    { short: 'Bicol', yr: '2024–25', years: '2024 – 2025', title: 'Offshore wind farm surveys', org: 'GEOSPHERE Technologies & NIRAS', place: 'Bicol, Philippines', cat: 'cetacean', ll: [13.4, 123.6], w: 50,
      text: 'Two roles on offshore wind farm surveys in Bicol — one at sea, one watching for migrating birds.', bullets: ['Boat-based surveys of Irrawaddy dolphin habitat use, distribution and behaviour', 'Fisher interviews to document sightings and local ecological knowledge', 'Twice-monthly 12-hour vantage point surveys of migratory birds over 12 months', 'Contributed to biodiversity assessments and mitigation recommendations'], tags: ['Marine Mammal Surveyor', 'Ornithology Researcher'] },
    { short: 'Mindoro', yr: '2025', years: '2025', title: 'Junior Biodiversity Specialist (Avian)', org: 'GRIDS, Inc.', place: 'Mindoro, Philippines', cat: 'birds', ll: [13.0, 121.1], w: 45,
      text: 'Bird surveys and mist-netting for birds and bats.', bullets: ['Twice-daily bird surveys along a 2-km line transect', 'Mist-netting of birds and bats with animal-welfare handling', 'Small mammal and herpetofaunal surveys with cage and pitfall traps'], tags: ['Birds', 'Bats'] },
    { short: 'Biliran', yr: '2026', years: '2026', title: 'Research Assistant — Ornithologist', org: 'Biodiversity Foundation of the Philippines, Inc.', place: 'Biliran, Philippines', cat: 'birds', ll: [11.58, 124.47], w: 45,
      text: 'Bird surveys in remote montane habitats, contributing data and photographs to a local field guide.', bullets: ['Line transects and point counts', 'Mist nets, photographic and acoustic records', 'Abundance, elevation, age class and environmental conditions recorded'], tags: ['Birds'] },
    { short: 'Subic', yr: '2026', years: '2026', title: 'Research Assistant', org: 'Newcastle University', place: 'Subic, Philippines', cat: 'birds', ll: [14.88, 120.27], w: 45,
      text: 'Supporting postgraduate research on how arboreal mammals use tropical forest and respond to human disturbance.', bullets: ['Translation and coordination between researcher and local guides', 'Site selection, fieldwork preparation, equipment and logistics', 'Culturally appropriate research practice and equitable collaboration'], tags: ['Mammals', 'Forest'] },
    { short: 'General Nakar', yr: '2026', years: '2026', title: 'Research Technician', org: 'Polytechnic University of the Philippines', place: 'General Nakar, Philippines', cat: 'birds', ll: [14.77, 121.63], w: 45,
      text: 'Field-based ornithological surveys supporting undergraduate thesis research.', bullets: ['Contributed to standardising survey methodologies', 'Bird surveys, species identification and photographic documentation', 'Guidance on fieldwork preparation and working with local guides'], tags: ['Birds'] },
    { short: 'Nueva Vizcaya', yr: '2026–', years: '2026 – present', title: 'The Search for Luzon’s Lost Bird Project', org: 'Principal Investigator & Project Lead', place: 'Nueva Vizcaya, Philippines', cat: 'project', ll: [16.17, 120.93], w: 40,
      text: 'My own project: investigating two elusive Philippine endemic birds, the Luzon Buttonquail and the Luzon Rail. Funded by an Oriental Bird Club Conservation Grant.', bullets: ['Transects, camera traps, passive acoustic monitoring, mist-netting and community interviews', 'Documented the presence of Luzon Rail through field evidence', 'Partnerships with the Kalahan Educational Foundation, NTFP-EP Asia and the Municipality of Santa Fe', 'First author of the project report, shared with local government and communities'], tags: ['Lead project', 'Birds'], link: ['Read the project', 'luzons-lost-bird.html'], link2: ['Field report ↗', 'https://ntfp.org/exchange_news/searching-for-luzons-lost-birds-blog-2026/'] },
    { short: 'St Andrews', yr: '2026–27', years: '2026 – 2027', title: 'MSc Marine Mammal Science', org: 'University of St Andrews', place: 'St Andrews, Scotland, United Kingdom', cat: 'base', ll: [56.34, -2.8], w: 70,
      text: 'The next chapter: postgraduate study in marine mammal science, supported by a University of St Andrews Discretionary Fund Award.', bullets: ['Aim: strengthen marine and wildlife research capacity in the Philippines', 'Bridging science and local communities for long-term conservation'], tags: ['Education'], link: ['Full CV', 'cv.html'] }
  ];
  var N = STOPS.length;
  STOPS.forEach(function (s) { s.p = proj(s.ll[1], s.ll[0]); });

  /* ---------- Build SVG ---------- */
  function mk(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  var gLand = mk('g', { 'class': 'land' }, svg);
  var gRoute = mk('g', { 'class': 'route' }, svg);
  var gStops = mk('g', { 'class': 'stops' }, svg);
  var gTrav = mk('g', { 'class': 'trav', 'aria-hidden': 'true' }, svg);

  // Land
  function buildLand() {
    var topo = window.WORLD_TOPO;
    if (!topo) return;
    var sc = topo.transform.scale, tr = topo.transform.translate;
    var arcs = topo.arcs.map(function (a) {
      var x = 0, y = 0;
      return a.map(function (p) { x += p[0]; y += p[1]; return [x * sc[0] + tr[0], y * sc[1] + tr[1]]; });
    });
    function ring(idx) {
      var pts = [];
      idx.forEach(function (i) {
        var a = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
        pts = pts.concat(pts.length ? a.slice(1) : a);
      });
      return pts;
    }
    var d = [];
    // Clip a ring against a meridian: keep points where keep(lon) holds, inserting edge crossings.
    function clipLon(pts, keep, edge) {
      var out = [], n = pts.length;
      for (var i = 0; i < n; i++) {
        var a = pts[i], b = pts[(i + 1) % n], ia = keep(a[0]), ib = keep(b[0]);
        if (ia) out.push(a);
        if (ia !== ib) out.push([edge, a[1] + (edge - a[0]) / (b[0] - a[0]) * (b[1] - a[1])]);
      }
      return out;
    }
    function drawPts(pts, tol) {
      // Rings crossing the antimeridian (Russia, Fiji, ...) are split in two so they draw on both map edges.
      var cross = false;
      for (var j = 1; j < pts.length; j++) if (Math.abs(pts[j][0] - pts[j - 1][0]) > 180) { cross = true; break; }
      if (cross) {
        var sh = pts.map(function (p) { return [p[0] < 0 ? p[0] + 360 : p[0], p[1]]; });
        drawFlat(clipLon(sh, function (x) { return x <= 180; }, 180), tol);
        drawFlat(clipLon(sh, function (x) { return x >= 180; }, 180).map(function (p) { return [p[0] - 360, p[1]]; }), tol);
      } else drawFlat(pts, tol);
    }
    function drawRing(idx) { drawPts(ring(idx), 0.02); }
    function drawFlat(pts, tol) {
      var out = [], last = null;
      for (var i = 0; i < pts.length; i++) {
        var q = proj(pts[i][0], pts[i][1]);
        if (last && Math.abs(q[0] - last[0]) + Math.abs(q[1] - last[1]) < tol && i < pts.length - 1) continue;
        out.push(q); last = q;
      }
      if (out.length < 3) return;
      d.push('M' + out.map(function (q) { return q[0].toFixed(2) + ' ' + q[1].toFixed(2); }).join('L') + 'Z');
    }
    // 110m outlines for the world; 50m detail for the countries the route zooms into
    var detail = window.WORLD_DETAIL || {};
    topo.objects.countries.geometries.forEach(function (g) {
      var name = g.properties && g.properties.name;
      if (name === 'Antarctica' || detail[name]) return;
      if (g.type === 'Polygon') g.arcs.forEach(drawRing);
      else if (g.type === 'MultiPolygon') g.arcs.forEach(function (poly) { poly.forEach(drawRing); });
    });
    Object.keys(detail).forEach(function (name) { detail[name].forEach(function (r) { drawPts(r, 0.07); }); });
    mk('path', { d: d.join(''), 'fill-rule': 'evenodd' }, gLand);
  }
  buildLand();

  // Route segments (quadratic curves bulging north)
  var SEG = [];
  for (var i = 0; i < N - 1; i++) {
    var a = STOPS[i].p, b = STOPS[i + 1].p;
    var dx = b[0] - a[0], dy = b[1] - a[1], dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / dist, ny = dx / dist;
    if (ny > 0) { nx = -nx; ny = -ny; }
    var k = 0.22;
    SEG.push({ a: a, b: b, c: [(a[0] + b[0]) / 2 + nx * dist * k, (a[1] + b[1]) / 2 + ny * dist * k] });
  }
  function bez(s, t) {
    var u = 1 - t;
    return [u * u * s.a[0] + 2 * u * t * s.c[0] + t * t * s.b[0], u * u * s.a[1] + 2 * u * t * s.c[1] + t * t * s.b[1]];
  }
  var planned = mk('path', { 'class': 'planned', d: SEG.map(function (s) { return 'M' + s.a[0] + ' ' + s.a[1] + 'Q' + s.c[0] + ' ' + s.c[1] + ' ' + s.b[0] + ' ' + s.b[1]; }).join('') }, gRoute);
  var done = mk('path', { 'class': 'done', d: '' }, gRoute);

  // Stops
  var stopEls = STOPS.map(function (s, i) {
    var g = mk('g', { 'class': 'stop', transform: 'translate(' + s.p[0] + ' ' + s.p[1] + ')', tabindex: 0, role: 'button', 'aria-label': s.short + ', ' + s.years }, gStops);
    var pin = mk('g', { 'class': 'pin' }, g);
    mk('circle', { r: 11, 'class': 'hit', fill: 'transparent' }, pin);
    var dot = mk('circle', { r: 6, 'class': 'dot', style: '--c:' + CATS[s.cat].color + ';--cd:' + CATS[s.cat].dark }, pin);
    var t = mk('text', { x: 11, y: 4, 'class': 'lab' }, pin); t.textContent = s.short;
    g.addEventListener('click', function () { goTo(i); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i); } });
    return { g: g, pin: pin };
  });

  // Traveler
  var travPin = mk('g', { 'class': 'pin' }, gTrav);
  mk('circle', { r: 14, 'class': 'pulse' }, travPin);
  mk('circle', { r: 6.5, 'class': 'core' }, travPin);
  gTrav.style.display = 'none';

  /* ---------- Camera ---------- */
  var stage = document.getElementById('stage');
  var cam = { x: 0, y: 0, w: 1000 };
  function aspect() { var r = svg.getBoundingClientRect(); return r.height / Math.max(r.width, 1); }
  function applyCam() {
    var h = cam.w * aspect();
    svg.setAttribute('viewBox', (cam.x - cam.w / 2) + ' ' + (cam.y - h / 2) + ' ' + cam.w + ' ' + h);
    var px = svg.getBoundingClientRect().width || 1;
    var k = cam.w / px;
    var tf = 'scale(' + k + ')';
    stopEls.forEach(function (s) { s.pin.setAttribute('transform', tf); });
    travPin.setAttribute('transform', tf);
  }
  function camFor(i) {
    if (i < 0) {
      var xs = STOPS.map(function (s) { return s.p[0]; }), ys = STOPS.map(function (s) { return s.p[1]; });
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      var asp = aspect();
      var w = Math.max((x1 - x0) * 1.2, (y1 - y0) * 1.5 / asp, 300);
      return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 - 8, w: Math.min(w, 980) };
    }
    return { x: STOPS[i].p[0], y: STOPS[i].p[1], w: STOPS[i].w };
  }

  /* ---------- State & animation ---------- */
  var cur = -1, P = -1, raf = 0, playing = false, playTimer = 0;
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function drawProgress() {
    var d = '';
    if (P >= 0) {
      var full = Math.min(Math.floor(P + 1e-9), N - 1);
      var f = P - full;
      for (var i = 0; i < full; i++) d += segPath(SEG[i], 1, i === 0);
      if (f > 1e-6 && full < N - 1) d += segPath(SEG[full], f, full === 0);
      var pos;
      if (full >= N - 1) pos = STOPS[N - 1].p; else pos = f > 1e-6 ? bez(SEG[full], f) : STOPS[full].p;
      gTrav.style.display = '';
      gTrav.setAttribute('transform', 'translate(' + pos[0] + ' ' + pos[1] + ')');
    } else gTrav.style.display = 'none';
    done.setAttribute('d', d);
    stopEls.forEach(function (s, i) {
      s.g.classList.toggle('visited', i <= P + 1e-6);
      s.g.classList.toggle('current', i === cur);
    });
  }
  function segPath(s, t, first) {
    var n = Math.max(6, Math.ceil(40 * t)), d = '';
    for (var i = 0; i <= n; i++) {
      var p = bez(s, t * i / n);
      d += (i === 0 && first ? 'M' : (i === 0 ? 'L' : 'L')) + p[0].toFixed(2) + ' ' + p[1].toFixed(2);
    }
    return d;
  }

  function fly(toCam, toP, dur) {
    cancelAnimationFrame(raf);
    var c0 = { x: cam.x, y: cam.y, w: cam.w }, p0 = P;
    if (reduced || dur <= 0) { cam = toCam; P = toP; applyCam(); drawProgress(); return; }
    var dist = Math.hypot(toCam.x - c0.x, toCam.y - c0.y);
    var bump = Math.min(2.2, dist / (2 * Math.max(c0.w, toCam.w)));
    var t0 = performance.now();
    (function frame(now) {
      var t = Math.min(1, (now - t0) / dur), e = ease(t);
      cam.x = c0.x + (toCam.x - c0.x) * e;
      cam.y = c0.y + (toCam.y - c0.y) * e;
      cam.w = Math.exp(Math.log(c0.w) + (Math.log(toCam.w) - Math.log(c0.w)) * e) * (1 + bump * Math.sin(Math.PI * e));
      P = p0 + (toP - p0) * e;
      applyCam(); drawProgress();
      if (t < 1) raf = requestAnimationFrame(frame);
      else { cam = toCam; P = toP; applyCam(); drawProgress(); onArrive(); }
    })(t0);
  }


  var arriveCb = null;
  function onArrive() { if (arriveCb) { var f = arriveCb; arriveCb = null; f(); } }

  var zoomedOut = false; // at the last stop, 'End the route' pulls the map back to show the whole route
  function goTo(i) {
    zoomedOut = false;
    i = Math.max(-1, Math.min(N - 1, i));
    var stepOnly = Math.abs(i - cur) === 1 && cur >= 0 && i >= 0;
    cur = i;
    renderPanel();
    renderTimeline();
    // Single steps animate the traveler along the route; longer jumps snap the route and just fly the camera.
    if (!stepOnly) { P = i; drawProgress(); }
    fly(camFor(i), i, stepOnly ? 2200 : 1500);
  }

  /* ---------- Sound of the place ----------
     Each stop has a field recording in audio/places/, named with the stop number first (01-san-pablo.mp3 ...).
     Recordings fade in and out as you move between stops; a stop without a file stays silent. */
  var PS = { on: false, group: null };
  var PLACE_CREDIT = [
    ['Lowland Laguna, morning // Shiela P // CC BY-NC-SA 4.0', 'https://xeno-canto.org/563580'],
    ['English woodland // Hazel Reeves // CC BY-NC-SA 4.0', 'https://xeno-canto.org/762388'],
    ['Manly Beach, Sydney // Freesound // CC0', ''],
    ['Pebble shore, Atlantic // Freesound // CC0', ''],
    ['Mediterranean waves, Málaga // Freesound // CC0', ''],
    ['Baltic Sea shore // Freesound // CC0', ''],
    ['Tropical shore // Freesound // CC0', ''],
    ['Windy beach (stand-in for open sea) // Freesound // CC0', ''],
    ['Palawan forest (stand-in) // Cedric Mroczko // CC BY-NC-SA 4.0', 'https://xeno-canto.org/313786'],
    ['Danjugan Island, dawn // Stijn De Win // CC BY-NC-SA 4.0', 'https://xeno-canto.org/181246'],
    ['Zambales mountains, morning // Edan Aguillon // CC BY-NC-SA 4.0', 'https://xeno-canto.org/1106596'],
    ['Real, Quezon forest // Ding Li Yong // CC BY-NC-ND 4.0', 'https://xeno-canto.org/813894'],
    ['Zambales mountains, later that morning // Edan Aguillon // CC BY-NC-SA 4.0', 'https://xeno-canto.org/1106596'],
    ['Atlantic surf (stand-in for the North Sea) // Freesound // CC0', '']
  ];
  var PLACE_VOL = [0.5, 0.5, 0.28, 0.26, 0.26, 0.28, 0.26, 0.26, 0.4, 0.5, 0.45, 0.5, 0.45, 0.28]; // quiet by design
  function placeFile(i) { var pre = (i + 1 < 10 ? '0' : '') + (i + 1) + '-'; return (window.PLACE_AUDIO || []).filter(function (f) { return f.indexOf(pre) === 0; })[0]; }
  function realGroup(file, i) {
    var a = new Audio('audio/places/' + file), vol = PLACE_VOL[i] || 0.35, tmr = 0;
    a.loop = true; a.volume = 0;
    var p = a.play(); if (p && p.catch) p.catch(function () {});
    function ramp(to, ms, done) {
      clearInterval(tmr); var from = a.volume, t0 = Date.now();
      tmr = setInterval(function () {
        var k = Math.min(1, (Date.now() - t0) / ms); a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
        if (k >= 1) { clearInterval(tmr); if (done) done(); }
      }, 50);
    }
    return { fadeIn: function () { ramp(vol, 2200); }, fadeOut: function () { ramp(0, 900, function () { a.pause(); a.removeAttribute('src'); a.load(); }); } };
  }
  var placeSound = {
    go: function (i) {
      if (!PS.on) return;
      var old = PS.group; PS.group = null;
      if (old) old.fadeOut();
      var note = document.getElementById('snd-note');
      if (note) { note.hidden = true; note.textContent = ''; }
      var file = i >= 0 ? placeFile(i) : '';
      if (!file) return;
      PS.group = realGroup(file, i); PS.group.fadeIn();
      if (note) {
        var cr = PLACE_CREDIT[i] || ['Field recording', ''];
        note.appendChild(document.createTextNode('Recording // '));
        if (cr[1]) { var al = document.createElement('a'); al.href = cr[1]; al.target = '_blank'; al.rel = 'noopener'; al.textContent = cr[0]; note.appendChild(al); } else note.appendChild(document.createTextNode(cr[0]));
        note.hidden = false;
      }
    },
    toggle: function () {
      PS.on = !PS.on;
      var b = document.getElementById('btn-sound');
      if (b) { b.setAttribute('aria-pressed', String(PS.on)); b.firstChild.nodeValue = PS.on ? 'Sound on' : 'Sound off'; }
      if (PS.on) placeSound.go(cur);
      else { if (PS.group) PS.group.fadeOut(); PS.group = null; var note = document.getElementById('snd-note'); if (note) note.hidden = true; }
    }
  };
  window.addEventListener('pagehide', function () { if (PS.group) PS.group.fadeOut(); });
  /* ---------- Panel ---------- */
  var el = function (id) { return document.getElementById(id); };
  function countries() {
    var set = {};
    STOPS.forEach(function (s) { var p = s.place.split(',').pop().trim(); set[p] = 1; });
    return Object.keys(set).length;
  }
  function renderPanel() {
    var s = STOPS[cur];
    var panel = el('panel');
    panel.classList.toggle('overview', cur < 0);
    if (cur < 0) {
      el('jp-step').textContent = 'The journey';
      el('jp-years').textContent = '2017 – today';
      el('jp-title').textContent = 'Follow the route';
      el('jp-org').textContent = N + ' stops // ' + countries() + ' countries';
      el('jp-place').textContent = '';
      el('jp-text').textContent = 'From San Pablo City to the forests and coasts of the Philippines — via Wales, Spain and Denmark. Travel through the places, projects and people behind the work, one stop at a time.';
      el('jp-bullets').innerHTML = '';
      el('jp-tags').innerHTML = '';
      el('jp-link').hidden = true; el('jp-link2').hidden = true;
    } else {
      el('jp-step').textContent = pad(cur + 1) + ' / ' + pad(N);
      el('jp-years').textContent = s.years;
      el('jp-title').textContent = s.title;
      el('jp-org').textContent = s.org;
      el('jp-place').textContent = s.place;
      el('jp-text').textContent = s.text;
      var ul = el('jp-bullets'); ul.innerHTML = '';
      s.bullets.forEach(function (b) { var li = document.createElement('li'); li.textContent = b; ul.appendChild(li); });
      var tg = el('jp-tags'); tg.innerHTML = '';
      var tag = document.createElement('span'); tag.className = 'cat'; tag.style.setProperty('--c', CATS[s.cat].color); tag.style.setProperty('--cd', CATS[s.cat].dark); tag.textContent = CATS[s.cat].label; tg.appendChild(tag);
      s.tags.forEach(function (t) { var c = document.createElement('span'); c.textContent = t; tg.appendChild(c); });
      [['jp-link', s.link], ['jp-link2', s.link2]].forEach(function (p) {
        var a = el(p[0]);
        if (p[1]) { a.hidden = false; a.textContent = p[1][0]; a.href = p[1][1]; } else a.hidden = true;
      });
    }
    var co = el('coords');
    if (co) co.textContent = cur < 0 ? 'Click any dot to jump there' :
      Math.abs(s.ll[0]).toFixed(2) + '°' + (s.ll[0] >= 0 ? 'N' : 'S') + ' ' + Math.abs(s.ll[1]).toFixed(2) + '°' + (s.ll[1] >= 0 ? 'E' : 'W');
    el('btn-prev').disabled = cur < 0;
    renderNext();
    placeSound.go(cur);
  }
  function renderNext() {
    var nx = el('btn-next'), label, off = false;
    if (cur < 0) label = 'Start the journey →';
    else if (cur < N - 1) label = 'Next stop →';
    else label = zoomedOut ? 'Start again ↺' : 'End the route';
    nx.textContent = label; nx.disabled = off;
  }
  var sndBtn = document.getElementById('btn-sound');
  if (sndBtn) sndBtn.addEventListener('click', placeSound.toggle);
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---------- Timeline ---------- */
  var tl = el('timeline');
  function buildTimeline() {
    var all = document.createElement('button'); all.type = 'button'; all.className = 'tl-item'; all.dataset.i = -1;
    all.innerHTML = '<i></i><b>Overview</b><span>All stops</span>';
    all.addEventListener('click', function () { stopPlay(); goTo(-1); });
    tl.appendChild(all);
    STOPS.forEach(function (s, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'tl-item'; b.dataset.i = i;
      b.innerHTML = '<i style="--c:' + CATS[s.cat].color + ';--cd:' + CATS[s.cat].dark + '"></i><b>' + s.yr + '</b><span>' + s.short + '</span>';
      b.addEventListener('click', function () { stopPlay(); goTo(i); });
      tl.appendChild(b);
    });
  }
  function renderTimeline() {
    Array.prototype.forEach.call(tl.children, function (b) {
      var i = +b.dataset.i;
      b.classList.toggle('active', i === cur);
      b.classList.toggle('past', i >= 0 && i < cur);
      b.setAttribute('aria-current', i === cur ? 'step' : 'false');
      if (i === cur) {
        var left = b.offsetLeft - (tl.clientWidth - b.offsetWidth) / 2;
        tl.scrollTo({ left: left, behavior: reduced ? 'auto' : 'smooth' });
      }
    });
  }
  buildTimeline();

  // Legend
  var lg = el('legend');
  Object.keys(CATS).forEach(function (k) {
    var s = document.createElement('span'); s.innerHTML = '<i style="--c:' + CATS[k].color + ';--cd:' + CATS[k].dark + '"></i>' + CATS[k].label; lg.appendChild(s);
  });

  /* ---------- Controls ---------- */
  el('btn-next').addEventListener('click', function () {
    stopPlay();
    if (cur >= N - 1) {
      if (zoomedOut) goTo(-1);
      else { zoomedOut = true; renderNext(); fly(camFor(-1), N - 1, 2600); }
    } else goTo(cur + 1);
  });
  el('btn-prev').addEventListener('click', function () { stopPlay(); goTo(cur - 1); });
  var playBtn = el('btn-play');
  function stopPlay() { playing = false; clearTimeout(playTimer); arriveCb = null; playBtn.textContent = '▶ Play'; playBtn.setAttribute('aria-pressed', 'false'); }
  function playStep() {
    if (!playing) return;
    if (cur >= N - 1) { stopPlay(); return; }
    arriveCb = function () { playTimer = setTimeout(playStep, 5200); };
    goTo(cur + 1);
    if (reduced) { arriveCb = null; playTimer = setTimeout(playStep, 5200); }
  }
  playBtn.addEventListener('click', function () {
    if (playing) { stopPlay(); return; }
    if (cur >= N - 1) goTo(-1);
    playing = true; playBtn.textContent = '❚❚ Pause'; playBtn.setAttribute('aria-pressed', 'true');
    playStep();
  });
  document.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return;
    if (e.key === 'ArrowRight') { stopPlay(); goTo(cur + 1); } else if (e.key === 'ArrowLeft') { stopPlay(); goTo(cur - 1); }
  });
  window.addEventListener('resize', function () { applyCam(); });
  if ('ResizeObserver' in window) new ResizeObserver(function () { applyCam(); }).observe(svg);

  /* ---------- Init ---------- */
  cam = camFor(-1);
  applyCam(); drawProgress(); renderPanel(); renderTimeline();
  setTimeout(function () { cam = camFor(-1); applyCam(); }, 50);
  document.documentElement.classList.add('journey-ready');
})();
