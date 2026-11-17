/* Easter egg: click a decorative animal and it answers with a sound and a short message for Ken.
   (No movement: the animals stay where they are.) Purely decorative, everything is aria-hidden. */
(function () {
  'use strict';
  var list = [];
  Array.prototype.forEach.call(document.querySelectorAll('.perch-bird svg[data-sil], .deco svg[data-sil]'), function (svg) {
    var host = svg.closest('.perch-bird') || svg.closest('.deco');
    if (host) list.push({ svg: svg, name: svg.getAttribute('data-sil'), paths: svg.querySelectorAll('path,ellipse,circle,polygon,rect') });
  });
  if (!list.length) return;

  var BIRDS = 'kingfisher kingfisher2 robin heron rail rail2 buttonquail eagle raptor raptor2 owl sunbird dove trogon flycatcher bulbul'.split(' ');
  var DOLPHINS = 'irrawaddy dolphin dolphin2 spinner killer'.split(' ');
  var WHALES = 'humpback humpback2 sperm'.split(' ');

  /* What the animals say: some talk to Ken, some to whoever is visiting, some are just charming. */
  var SAY = {
    kingfisher: ['Kenneth! Did you get my good side?', 'Hold still… no, you hold still, Ken.', 'Fish today, photo tomorrow, Ken!', 'You have a very patient eye, friend.', 'I might be the most colourful bird on this site. Just saying.'],
    robin: ['Ken! Are you coming back this winter?', 'Nice to see you, Ken. I only sing for friends.', 'Hello, reader! You look like someone who notices small birds.', 'My red chest is just good manners, friend.'],
    heron: ['Shhh, Ken. I’m fishing.', 'Standing still is my best skill, Ken.', 'You scroll very patiently, friend. We’d get along.', 'Good things come to those who wait. Ask any birder.'],
    rail: ['You’ll find me one day, Ken!', 'Keep listening, Ken. I’m almost singing.', 'Reader, if you spot me, you’ll be famous.', 'Thank you for looking for me, Ken. I notice.'],
    buttonquail: ['Psst, Ken… I’m right here.', 'Still looking for me, Ken?', 'You found me, friend! Don’t tell anyone.', 'I’m rarely seen. Rude, but fair.'],
    eagle: ['Great view from up here, Ken!', 'Count me, Ken: wingspan and all.', 'From up here this website looks excellent, friend.', 'Ken spots details even I miss. Impressive.'],
    owl: ['Whooo is it? Oh, it’s Ken.', 'Come back at night, Ken.', 'You’re awake late, reader. Good taste in hours.', 'The best notes are written at night, Ken.'],
    sunbird: ['Ken, only the sweetest flowers for me!', 'Hello, friend! You’re looking sharp today.', 'Ken has a great eye for shiny things. And for me.'],
    dove: ['Coo! Hi Ken.', 'Welcome, friend! Make yourself at home.', 'Peace and quiet is the best field kit.'],
    trogon: ['Ken, I’m very good at hiding.', 'You’re very observant, friend. Hardly anyone sees me.', 'Ken has the patience of a tree. Compliment.'],
    flycatcher: ['Ken, want to watch me catch a fly?', 'Quick eyes, reader! You spotted me.', 'Ken’s photos make me look fast. I am.'],
    bulbul: ['Ken, listen to my song!', 'You clicked a bulbul. Excellent taste, friend.', 'Stop and listen for a moment, Ken.'],
    irrawaddy: ['Thanks for counting us, Ken!', 'Still on the dolphin survey, Ken?', 'Reader, you have good taste in dolphins.', 'Every fin tells a story.'],
    dolphin: ['Ken! Follow the boat!', 'Catch me if you can, Ken!', 'You have a lovely smile, friend. I can tell.', 'Eyes on the horizon, Ken!'],
    humpback: ['Ken, look! My tail is one of a kind.', 'Photo-ID me, Ken. Left fluke, please!', 'Hello, friend! You came a long way down this page.', 'We never get tired of a good photograph.'],
    sperm: ['Click… click… hi Ken.', 'Click… click… can you hear me, Ken?', 'Reader, you have excellent listening skills.', 'The best way to find us is to listen. Click!'],
    dugong: ['Ken, seagrass break?', 'Hello, friend! You seem very kind.', 'Seagrass is life. Take a break, Ken.'],
    turtle: ['Slow and steady, Ken.', 'Take your time reading, friend. I do.', 'Ken is a very careful scientist. Like me, but faster.'],
    manta: ['Just gliding by, Ken!', 'Nice site, friend. Smooth scrolling!', 'Smooth scrolling, friend. The sea approves.'],
    whaleshark: ['Ken, I’m the biggest fish in the sea!', 'You’re very brave to say hi, friend.'],
    fish: ['Blub! Hi Ken.', 'Ken, mind the reef!', 'Blub! You have lovely scales, friend. Er, skin.'],
    sea: ['Hello from the deep, Ken!', 'Mind the reef, Ken!', 'Welcome to the ocean side of the site, friend.']
  };
  var GENERAL = [
    'Welcome, friend! Take your time.',
    'You’re a wonderful visitor. Thank you for stopping by.',
    'Ken does careful, kind science. You can tell.',
    'Great choice of website, reader!',
    'You have excellent taste in animals.',
    'Ken, you’re doing wonderful work.',
    'Whoever you are, you made my day.'
  ];
  var ALIAS = { kingfisher2: 'kingfisher', rail2: 'rail', raptor: 'eagle', raptor2: 'eagle', dolphin2: 'dolphin', spinner: 'dolphin', killer: 'dolphin', humpback2: 'humpback', tang: 'fish', snapper: 'fish' };
  var lastSaid = '';
  function phrase(name) {
    var k = ALIAS[name] || name, own = SAY[k] || (BIRDS.indexOf(name) >= 0 ? ['Hi Ken!', 'Nice to see you, Ken!'] : SAY.sea);
    var pool = own.concat(own, GENERAL), s = lastSaid, tries = 0;
    while ((s === lastSaid || !s) && tries++ < 8) s = pool[Math.floor(Math.random() * pool.length)];
    lastSaid = s; return s;
  }
  /* hit test: only the painted shape of an animal counts */
  function hit(x, y) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i], r = c.svg.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
      for (var j = 0; j < c.paths.length; j++) {
        var p = c.paths[j], m = p.getScreenCTM && p.getScreenCTM();
        if (!m || !p.isPointInFill) continue;
        if (p.isPointInFill(new DOMPoint(x, y).matrixTransform(m.inverse()))) return c;
      }
    }
    return null;
  }

  /* sounds: small synthesised voices, only ever played in answer to a click */
  var ctx = null, bus = null;
  function outBus() { if (!bus) { bus = ctx.createGain(); bus.gain.value = 0.5; bus.connect(ctx.destination); } return bus; }
  function tone(t0, f0, f1, dur, vol, type) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t0); o.frequency.linearRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.03, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(outBus()); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function sound(name) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var t = ctx.currentTime, k = 0.9 + Math.random() * 0.25;
      if (BIRDS.indexOf(name) >= 0) { tone(t, 2300 * k, 3300 * k, 0.1, 0.045); tone(t + 0.13, 3100 * k, 2300 * k, 0.1, 0.045); tone(t + 0.25, 2500 * k, 3500 * k, 0.1, 0.045); }
      else if (WHALES.indexOf(name) >= 0) { tone(t, 170, 105, 1.1, 0.07); tone(t + 0.05, 340, 210, 1.0, 0.025); }
      else if (DOLPHINS.indexOf(name) >= 0) { tone(t, 1700 * k, 3400 * k, 0.28, 0.04); tone(t + 0.38, 3200 * k, 2000 * k, 0.18, 0.035); }
      else { tone(t, 320, 760, 0.13, 0.06); tone(t + 0.17, 380, 880, 0.12, 0.05); }
    } catch (e) {}
  }

  /* the speech bubble: positioned in page coordinates, so it stays attached to the animal while the page scrolls */
  var bubble = null, timer = 0;
  function say(c, text) {
    if (!bubble) { bubble = document.createElement('div'); bubble.className = 'critter-say'; bubble.setAttribute('aria-hidden', 'true'); document.body.appendChild(bubble); }
    bubble.textContent = text;
    bubble.classList.remove('show'); bubble.style.visibility = 'hidden'; bubble.style.left = '0px'; bubble.style.top = '0px';
    var sx = window.pageXOffset, sy = window.pageYOffset, docW = document.documentElement.clientWidth;
    var r = c.svg.getBoundingClientRect(), b = bubble.getBoundingClientRect();
    var x = Math.max(12, Math.min(docW - b.width - 12, r.left + r.width / 2 - b.width / 2));
    var above = r.top - b.height - 12 > 70, y = above ? r.top - b.height - 12 : r.bottom + 12;
    bubble.classList.toggle('below', !above);
    bubble.style.left = (x + sx) + 'px'; bubble.style.top = (y + sy) + 'px';
    bubble.style.setProperty('--ax', Math.max(18, Math.min(b.width - 18, r.left + r.width / 2 - x)) + 'px');
    bubble.style.visibility = '';
    void bubble.offsetWidth; bubble.classList.add('show');
    clearTimeout(timer); timer = setTimeout(function () { bubble.classList.remove('show'); }, 4800);
  }
  var raf = 0, over = false;
  document.addEventListener('mousemove', function (e) {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0; var h = !!hit(e.clientX, e.clientY);
      if (h !== over) { over = h; document.documentElement.classList.toggle('over-critter', h); }
    });
  }, { passive: true });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a,button,input,select,textarea,summary,label,figure,.lightbox,.journey')) return;
    var c = hit(e.clientX, e.clientY);
    if (c) { sound(c.name); say(c, phrase(c.name)); }
  });
})();
