(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* ---------- Bird sounds ----------
     Recordings of the same species under free licences (Xeno-canto, Wikimedia Commons), credited next to the player.
     Names in the photo list further down are given only where the species is certain; leave '' otherwise. */
  var SOUNDS = {
    robin: { f: 'audio/robin.mp3', by: 'Benoît Van Hecke', lic: 'CC BY-SA 4.0', xc: '542842', page: 'https://commons.wikimedia.org/wiki/File:Erithacus_rubecula_-_European_Robin_XC542842.mp3' },
    heron: { f: 'audio/heron.mp3', by: 'Joost van Bruggen', lic: 'CC BY-SA 4.0', xc: '432231', page: 'https://commons.wikimedia.org/wiki/File:Ardea_cinerea_-_Grey_Heron_XC432231.mp3' },
    kingfisher: { f: 'audio/kingfisher.mp3', by: 'Marie-Lan Taÿ Pamart', lic: 'CC BY-SA 4.0', xc: '476785', page: 'https://commons.wikimedia.org/wiki/File:Alcedo_atthis_-_Common_Kingfisher_XC476785.mp3' },
    chaffinch: { f: 'audio/chaffinch.mp3', by: '', lic: 'CC BY-SA 4.0', xc: '477972', page: 'https://commons.wikimedia.org/wiki/File:Fringilla_coelebs_-_Common_Chaffinch_XC477972.mp3' },
    owl: { xc: '23085', by: 'George Wagner', where: 'Mount Data, Luzon', lic: 'CC BY-NC-ND 2.5' },
    tit: { xc: '442776', by: 'Peter Ericsson', where: 'Quezon, Luzon', lic: 'CC BY-NC-SA 4.0' },
    treeswift: { xc: '403744', by: 'Ross Gallardy', where: 'Bataan, Luzon', lic: 'CC BY-NC-SA 4.0' },
    coucal: { xc: '812270', by: 'Jacob Wijpkema', where: 'Laguna, Luzon', lic: 'CC BY-NC-SA 4.0' },
    whiteeye: { xc: '281900', by: 'Ko Chie-Jen', where: 'Taiwan (subspecies batanis)', lic: 'CC BY-NC-SA 4.0' },
    hornbill: { xc: '308912', by: 'Mike Nelson', where: 'Subic Bay, Luzon', lic: 'CC BY-NC-SA 4.0' },
    flagrans: { xc: '67542', by: 'Frank Lambert', where: 'Mt Makiling, Laguna, Luzon', lic: 'CC BY-NC-ND 4.0' },
    pitta: { xc: '897528', by: 'Greg Irving', where: 'Subic Bay, Luzon', lic: 'CC BY-NC-SA 4.0' },
    serpenteagle: { xc: '813704', by: 'Ding Li Yong', where: 'Real, Quezon, Luzon', lic: 'CC BY-NC-ND 4.0' },
    fairybluebird: { xc: '824708', by: 'Joren van Schie', where: 'Real, Quezon, Luzon', lic: 'CC BY-NC-SA 4.0' },
    tailorbird: { xc: '23082', by: 'George Wagner', where: 'Bohol', lic: 'CC BY-NC-ND 2.5' },
    nuthatch: { xc: '897079', by: 'Greg Irving', where: 'Sagada, Luzon', lic: 'CC BY-NC-SA 4.0' },
    emeralddove: { xc: '442739', by: 'Brendan Sloan', where: 'Davao, Mindanao', lic: 'CC BY-NC-SA 4.0' },
    bushchat: { xc: '896895', by: 'Greg Irving', where: 'Mount Data, Luzon', lic: 'CC BY-NC-SA 4.0' },
    mangroveflyc: { xc: '321478', by: 'Brendan Sloan', where: 'La Mesa Eco Park, Quezon City', lic: 'CC BY-NC-SA 4.0' },
    sunbird2: { xc: '182006', by: 'Stijn De Win', where: 'Leyte (a different subspecies)', lic: 'CC BY-NC-SA 4.0' },
    narcissus: { xc: '818151', by: 'Kim Chuah Lim', where: 'Nagano, Japan (breeding range)', lic: 'CC BY-NC-SA 4.0' },
    longeared: { xc: '791864', by: 'Jochem verweij', where: 'Rotterdam, Netherlands', lic: 'CC BY-SA 4.0' },
    ferruginous: { xc: '804507', by: 'Chi-Hsuan Shao', where: 'Taiwan', lic: 'CC BY-NC-SA 4.0' },
    striated: { xc: '346389', by: 'Yeo SB', where: 'Singapore', lic: 'CC BY-NC-SA 4.0' },
    fruitdove: { xc: '269959', by: 'Frank Lambert', where: 'Siquijor', lic: 'CC BY-NC-ND 4.0' }
  };
  // Every recording is used unmodified and credited next to the player.
  // audio/index.js (written by build.ps1) lists the copies stored on this site; a recording without a local
  // copy is streamed from xeno-canto.org instead (when it has an XC number), otherwise it is dropped.
  var AV = window.BIRD_AUDIO || [];
  Object.keys(SOUNDS).forEach(function (k) {
    var s = SOUNDS[k], local = AV.indexOf(k + '.mp3') >= 0 ? k + '.mp3' : (s.f && AV.indexOf(s.f.replace('audio/', '')) >= 0 ? s.f.replace('audio/', '') : '');
    if (local) { s.f = 'audio/' + local; s.remote = false; if (s.xc && !s.page) s.page = 'https://xeno-canto.org/' + s.xc; }
    else if (s.xc) { s.f = 'https://xeno-canto.org/' + s.xc + '/download'; s.remote = true; s.page = 'https://xeno-canto.org/' + s.xc; }
    else delete SOUNDS[k];
  });
  var SND = { bird14: 'robin', bird28: 'heron', bird18: 'heron', bird09: 'kingfisher', bird10: 'chaffinch',
    bird29: 'owl', bird12: 'tit', bird37: 'treeswift', bird25: 'coucal', bird19: 'whiteeye',
    bird21: 'hornbill', bird17: 'flagrans', bird36: 'pitta', bird32: 'serpenteagle', bird15: 'fairybluebird', bird30: 'tailorbird',
    bird31: 'nuthatch', bird06: 'emeralddove', bird24: 'bushchat', bird04: 'mangroveflyc',
    bird20: 'sunbird2', bird22: 'narcissus', bird13: 'longeared', bird16: 'ferruginous', bird33: 'striated', bird38: 'fruitdove' };

  /* ---------- Sound player (one recording at a time) ---------- */
  var icon = function (inner) { return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>'; };
  var I_VOL = icon('<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>');
  var I_PAUSE = icon('<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>');
  var I_PLAY = icon('<polygon points="6 3 20 12 6 21 6 3"/>');
  var audio = null, nowPlaying = null, loadedF = null, bar = null, timeEl = null, errEl = null, loading = false;
  function fmt(t) { t = Math.max(0, Math.round(t || 0)); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
  function refreshSound() {
    each(document.querySelectorAll('[data-snd]'), function (b) {
      var on = nowPlaying && b.dataset.snd === nowPlaying.f;
      b.classList.toggle('on', !!on); b.classList.toggle('loading', !!(on && loading)); b.setAttribute('aria-pressed', String(!!on));
      var big = b.classList.contains('lb-play') || b.classList.contains('hero-snd');
      b.innerHTML = (on ? (loading ? I_VOL : I_PAUSE) : (big ? I_PLAY : I_VOL)) + (big ? '<span>' + (on ? (loading ? 'Loading\u2026' : 'Pause') : 'Listen') + '</span>' : '');
    });
  }
  function resetProgress() { if (bar) bar.style.width = '0'; if (timeEl) timeEl.textContent = '0:00'; }
  function soundFailed() { nowPlaying = null; loadedF = null; loading = false; refreshSound(); resetProgress(); if (errEl) errEl.hidden = false; }
  function toggleSound(s) {
    if (!audio) {
      audio = new Audio(); audio.preload = 'none'; audio.volume = 0.5;
      audio.addEventListener('ended', function () { nowPlaying = null; loadedF = null; loading = false; refreshSound(); resetProgress(); });
      audio.addEventListener('timeupdate', function () {
        if (bar && isFinite(audio.duration) && audio.duration) bar.style.width = (100 * audio.currentTime / audio.duration) + '%';
        if (timeEl) timeEl.textContent = fmt(audio.currentTime) + (isFinite(audio.duration) && audio.duration ? ' / ' + fmt(audio.duration) : '');
      });
      audio.addEventListener('waiting', function () { if (nowPlaying) { loading = true; refreshSound(); } });
      audio.addEventListener('playing', function () { if (loading) { loading = false; refreshSound(); } });
      audio.addEventListener('error', function () { if (nowPlaying) soundFailed(); });
    }
    if (errEl) errEl.hidden = true;
    if (nowPlaying === s) { audio.pause(); nowPlaying = null; loading = false; refreshSound(); return; }
    if (loadedF === s.f) { nowPlaying = s; loading = false; refreshSound(); }   // resume where it was paused
    else { audio.src = s.f; loadedF = s.f; nowPlaying = s; loading = true; refreshSound(); }
    var p = audio.play(); if (p && p.catch) p.catch(function (e) { if (e && e.name === 'AbortError') return; soundFailed(); });
  }
  function stopSound() { if (audio) { audio.pause(); } nowPlaying = null; loadedF = null; loading = false; refreshSound(); resetProgress(); }  function mkLink(href, text) { var a = document.createElement('a'); a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.textContent = text; return a; }

  /* Bird families: [common group name, scientific family]. Used by the gallery filters. */
  var FAMILIES = {
    Muscicapidae: 'Flycatchers & chats', Accipitridae: 'Hawks & eagles', Alcedinidae: 'Kingfishers', Ardeidae: 'Herons', Strigidae: 'Owls',
    Columbidae: 'Pigeons & doves', Nectariniidae: 'Sunbirds', Zosteropidae: 'White-eyes & babblers', Monarchidae: 'Monarch flycatchers', Paridae: 'Tits',
    Trogonidae: 'Trogons', Hemiprocnidae: 'Treeswifts', Cuculidae: 'Cuckoos', Fringillidae: 'Finches', Pycnonotidae: 'Bulbuls', Irenidae: 'Fairy-bluebirds',
    Pittidae: 'Pittas', Bucerotidae: 'Hornbills', Rallidae: 'Rails', Cisticolidae: 'Tailorbirds', Sittidae: 'Nuthatches'
  };
  var FAM_OF = {
    bird14: 'Muscicapidae', bird04: 'Muscicapidae', bird22: 'Muscicapidae', bird16: 'Muscicapidae', bird01: 'Muscicapidae', bird02: 'Muscicapidae', bird24: 'Muscicapidae', bird27: 'Muscicapidae',
    bird03: 'Accipitridae', bird26: 'Accipitridae', bird32: 'Accipitridae', bird23: 'Alcedinidae', bird34: 'Alcedinidae', bird09: 'Alcedinidae',
    bird28: 'Ardeidae', bird18: 'Ardeidae', bird33: 'Ardeidae', bird29: 'Strigidae', bird13: 'Strigidae', bird38: 'Columbidae', bird06: 'Columbidae',
    bird20: 'Nectariniidae', bird17: 'Nectariniidae', bird07: 'Zosteropidae', bird19: 'Zosteropidae', bird05: 'Monarchidae', bird12: 'Paridae',
    bird35: 'Trogonidae', bird37: 'Hemiprocnidae', bird25: 'Cuculidae', bird10: 'Fringillidae', bird08: 'Pycnonotidae', bird15: 'Irenidae',
    bird36: 'Pittidae', bird21: 'Bucerotidae', bird11: 'Rallidae', bird30: 'Cisticolidae', bird31: 'Sittidae'
  };
  var BIRDS = [
    ['bird14', 'Eurasian Robin', 'Erithacus rubecula', 'sp'],
    ['bird03', 'Brahminy Kite', 'Haliastur indus', 'so'],
    ['bird23', 'Northern Philippine Dwarf Kingfisher', 'Ceyx melanurus', 'sf'],
    ['bird07', 'Chestnut-faced Babbler', 'Zosterornis whiteheadi', 'sp'],
    ['bird26', 'Philippine Eagle', 'Pithecophaga jefferyi', 'so'],
    ['bird05', 'Black-naped Monarch', 'Hypothymis azurea', 'sf'],
    ['bird29', 'Philippine Scops Owl', 'Otus megalotis', 'sp'],
    ['bird28', 'Grey Heron', 'Ardea cinerea', 'sp'],
    ['bird34', 'Spotted Wood Kingfisher', 'Actenoides lindsayi', 'sp'],
    ['bird12', 'Elegant Tit', 'Pardaliparus elegans', 'sf'],
    ['bird18', 'Grey Heron', 'Ardea cinerea', 'so'],
    ['bird09', 'Common Kingfisher', 'Alcedo atthis', 'sf'],
    ['bird35', 'Philippine Trogon', 'Harpactes ardens', 'sf'],
    ['bird37', 'Whiskered Treeswift', 'Hemiprocne comata', 'so'],
    ['bird25', 'Philippine Coucal', 'Centropus viridis', 'f'],
    ['bird10', 'Common Chaffinch', 'Fringilla coelebs', 'f'],
    ['bird13', 'Long-eared Owl', 'Asio otus', 'p'], ['bird17', 'Flaming Sunbird', 'Aethopyga flagrans', 'p'], ['bird33', 'Striated Heron', 'Butorides striata', 'o'],
    ['bird08', 'Brown-eared Bulbul', 'Hypsipetes amaurotis', 'f'], ['bird19', 'Lowland White-eye', 'Zosterops meyeni', 'f'],
    ['bird15', 'Philippine Fairy-bluebird', 'Irena cyanogastra', 'f'], ['bird36', 'Western Hooded Pitta', 'Pitta sordida', 'f'],
    ['bird20', 'Metallic-winged Sunbird', 'Aethopyga pulcherrima', 'f'], ['bird21', 'Luzon Hornbill', 'Penelopides manillae', 'f'],
    ['bird38', 'Yellow-breasted Fruit Dove', 'Ptilinopus occipitalis', 'f'], ['bird04', 'Mangrove Blue Flycatcher', 'Cyornis rufigastra', 'f'],
    ['bird22', 'Narcissus Flycatcher', 'Ficedula narcissina', 'f'], ['bird11', 'Calayan Rail', 'Aptenorallus calayanensis', 'f'],
    ['bird30', 'Rufous-fronted Tailorbird', 'Orthotomus frontalis', 'f'], ['bird31', 'Sulphur-billed Nuthatch', 'Sitta oenochlamys', 'f'],
    ['bird32', 'Philippine Serpent Eagle', 'Spilornis holospilus', 'f'], ['bird16', 'Ferruginous Flycatcher', 'Muscicapa ferruginea', 'f'],
    ['bird24', 'Pied Bushchat', 'Saxicola caprata', 'f'], ['bird01', 'Bundok Flycatcher', 'Ficedula luzoniensis', 'f', 'Female'],
    ['bird02', 'Bundok Flycatcher', 'Ficedula luzoniensis', 'f', 'Juvenile'], ['bird06', 'Common Emerald Dove', 'Chalcophaps indica', 'f'],
    ['bird27', 'Philippine Jungle Flycatcher', 'Cyornis ruficauda', 'f']
  ].map(function (b) {
    var snd = SOUNDS[SND[b[0]]];
    return { t: 'images/birds/t/' + b[0] + '.webp', f: 'images/birds/' + b[0] + '.webp', c: b[1], l: b[2], tags: b[3], fam: FAM_OF[b[0]] || '', s: snd || null, n: b[4] || '',
      a: b[1] ? b[1] + (b[4] ? ' (' + b[4].toLowerCase() + ')' : '') + ', photographed by Kenneth Manuel' : 'Bird photographed by Kenneth Manuel' };
  });

  /* ---------- Species counter + log ---------- */
  var SPECIES = [];
  (function () {
    var by = {};
    BIRDS.forEach(function (b, i) {
      if (!b.c) return;
      var k = b.c;
      if (!by[k]) { by[k] = { name: k, latin: b.l, n: 0, first: i, sound: !!b.s }; SPECIES.push(by[k]); }
      by[k].n++; if (b.s) by[k].sound = true;
    });
    SPECIES.sort(function (a, b) { return b.n - a.n || a.name.localeCompare(b.name); });
  })();
  function fillCounts() { each(document.querySelectorAll('[data-species-count]'), function (el) { el.textContent = SPECIES.length; }); }
  fillCounts();
  var spList = document.getElementById('species-list');
  if (spList) SPECIES.forEach(function (s) {
    var li = document.createElement('li'), btn = document.createElement('button'); btn.type = 'button';
    btn.innerHTML = '<b></b><i></i><span class="sp-meta"></span>';
    btn.querySelector('b').textContent = s.name; btn.querySelector('i').textContent = s.latin || '';
    btn.querySelector('.sp-meta').innerHTML = (s.sound ? I_VOL : '') + '<span>' + s.n + (s.n === 1 ? ' photo' : ' photos') + '</span>';
    btn.addEventListener('click', function () { window.openLB(BIRDS, s.first); });
    li.appendChild(btn); spList.appendChild(li);
  });
  /* ---------- Field & team photographs (one mosaic) ----------
     [file, caption, width, height, theme, flags, organisation]
     theme: sea | land | ''   flags: 'T' = a team photograph   org: key into ORGS */
  var ORGS = {
    lostbird: { n: 'The Search for Luzon’s Lost Bird', role: 'Principal Investigator & Project Lead', yr: '2026 – present', pl: 'Nueva Vizcaya, Philippines', href: 'luzons-lost-bird.html' },
    bfpi: { n: 'Biodiversity Foundation of the Philippines', role: 'Research Assistant – Ornithologist', yr: '2026', pl: 'Biliran, Philippines', href: 'work.html#birds' },
    pef: { n: 'Philippine Eagle Foundation', role: 'Research Volunteer & Wildlife Photographer', yr: '2025', pl: '', href: 'cv.html' },
    grids: { n: 'GRIDS, Inc.', role: 'Junior Biodiversity Specialist (Avian)', yr: '2025', pl: 'Mindoro, Philippines', href: 'work.html#birds' },
    niras: { n: 'NIRAS', role: 'Researcher – Ornithology', yr: '2024 – 2025', pl: 'Bicol, Philippines', href: 'work.html#birds' },
    balyena: { n: 'Balyena.org', role: 'Research intern', yr: '2024', pl: 'Camiguin Island, Babuyan Islands, Philippines', href: 'work.html#cetaceans' },
    palce: { n: 'Deutsches Meeresmuseum & Thünen Institute', role: 'Research intern, PAL-CE project', yr: '2023', pl: 'Fyns Hoved, Denmark', href: 'work.html#cetaceans' },
    circe: { n: 'CIRCE', role: 'Research intern', yr: '2023', pl: 'El Pelayo, Spain', href: 'work.html#cetaceans' },
    seawatch: { n: 'Sea Watch Foundation', role: 'Research intern, then Educational and Outreach Assistant', yr: '2022', pl: 'New Quay, Wales', href: 'work.html#cetaceans' }
  };
  var PHOTOS = [
    ['ken03', 'On a forest waterway', 900, 600, 'land', ''], ['team01', 'The Search for Luzon’s Lost Birds', 640, 360, 'land', 'T', 'lostbird'],
    ['ken01', 'Photographing from a boat', 675, 900, 'sea', ''], ['team21', 'NIRAS // Boat-based survey for the offshore wind farm', 480, 640, 'sea', 'T', 'niras'],
    ['ken14', 'Photographing on the shore', 675, 900, 'sea', ''], ['team02', 'The Search for Luzon’s Lost Birds // Bantinan team', 640, 480, 'land', 'T', 'lostbird'],
    ['ken15', 'Birding in the forest', 900, 506, 'land', ''], ['team25', 'Balyena.org // Necropsy team', 640, 634, 'sea', 'T', 'balyena'],
    ['ken02', 'Taking notes at sea', 720, 900, 'sea', ''], ['team09', 'Biodiversity Foundation of the Philippines // Biliran, fauna team', 640, 480, 'land', 'T', 'bfpi'],
    ['ken09', 'A spotting scope on the shore', 900, 675, 'sea', ''], ['team30', 'CIRCE // Boat survey team', 640, 639, 'sea', 'T', 'circe'],
    ['ken07', 'Flying a drone on the coast', 900, 675, 'sea', ''], ['team03', 'The Search for Luzon’s Lost Birds // Imugan team', 640, 480, 'land', 'T', 'lostbird'],
    ['ken16', 'Birding at the forest edge', 900, 506, 'land', ''], ['team22', 'NIRAS // Bird and marine mammal team', 640, 640, 'sea', 'T', 'niras'],
    ['ken19', 'Taking notes on deck', 722, 900, 'sea', ''], ['team10', 'Biodiversity Foundation of the Philippines // Biliran, with local guides', 640, 480, 'land', 'T', 'bfpi'],
    ['ken11', 'On a forest trail', 675, 900, 'land', ''], ['team26', 'Balyena.org // Sperm whale necropsy', 640, 480, 'sea', 'T', 'balyena'],
    ['ken12', 'Working on deck', 600, 900, 'sea', ''], ['team04', 'The Search for Luzon’s Lost Birds // Setting up camera traps', 640, 480, 'land', 'T', 'lostbird'],
    ['ken05', 'On a coastal headland', 843, 632, 'sea', ''], ['team23', 'NIRAS // Inshore boat survey team', 640, 480, 'sea', 'T', 'niras'],
    ['ken17', 'With the team on a boat', 900, 600, 'sea', 'T'], ['team31', 'CIRCE // Photo-ID', 640, 426, 'sea', 'T', 'circe'],
    ['ken10', 'In the field', 900, 600, '', ''], ['team05', 'The Search for Luzon’s Lost Birds // Camp site', 640, 480, 'land', 'T', 'lostbird'],
    ['ken23', 'With the field team', 900, 506, '', 'T'], ['team11', 'Biodiversity Foundation of the Philippines // Biliran, herping', 640, 428, 'land', 'T', 'bfpi'],
    ['ken06', 'Stranding response', 675, 900, 'sea', ''], ['team27', 'Balyena.org // After the necropsy', 640, 480, 'sea', 'T', 'balyena'],
    ['ken24', 'On the boat', 900, 600, 'sea', ''], ['team24', 'NIRAS // Offshore boat surveys', 640, 480, 'sea', 'T', 'niras'],
    ['ken08', 'Out on the water', 900, 675, 'sea', ''], ['team06', 'The Search for Luzon’s Lost Birds // Setting up camp', 640, 360, 'land', 'T', 'lostbird'],
    ['ken13', 'On the boat', 506, 900, 'sea', ''], ['team12', 'Biodiversity Foundation of the Philippines // Biliran, team summit', 480, 640, 'land', 'T', 'bfpi'],
    ['ken22', 'On the boat with the team', 900, 666, 'sea', 'T'], ['team28', 'Balyena.org', 640, 360, 'sea', 'T', 'balyena'],
    ['ken04', '', 506, 900, '', ''], ['team07', 'The Search for Luzon’s Lost Birds // Team shirt', 640, 480, 'land', 'T', 'lostbird'],
    ['ken18', '', 900, 675, '', ''], ['team13', 'GRIDS // Biodiversity survey', 588, 640, 'land', 'T', 'grids'],
    ['ken20', '', 720, 900, '', ''], ['team29', 'PAL-CE project // Team', 640, 427, 'sea', 'T', 'palce'],
    ['team08', 'Subic // With Ma’am Carmela Española and her students from UPD', 640, 480, 'land', 'T'], ['team32', 'Sea Watch Foundation // Team', 640, 480, 'sea', 'T', 'seawatch'],
    ['team14', 'Philippine Eagle Foundation // Birding', 640, 480, 'land', 'T', 'pef'], ['team15', 'Philippine Eagle Foundation // River crossing', 640, 480, 'land', 'T', 'pef'],
    ['team16', 'Roadside birding with UPLB students', 640, 640, 'land', 'T'], ['team17', 'Isla Biodiversity Conservation // Mangrove survey', 640, 427, 'land', 'T'],
    ['team18', 'Isla Biodiversity Conservation // Team', 640, 480, 'land', 'T'], ['team19', 'Mt. Pulag', 480, 640, 'land', 'T'],
    ['team20', 'Mt. Pulag', 480, 640, 'land', 'T'], ['team33', 'STCW // Fire prevention and fire fighting', 640, 480, 'sea', 'T'],
    ['team34', 'Department of Tourism // Bird watching guides training', 640, 427, 'land', 'T'], ['team35', 'University of St Andrews // Isle of May trip', 640, 480, 'land', 'T'],
    ['team37', 'Balyena.org // Sperm whale necropsy', 638, 640, 'sea', '', 'balyena'], ['team38', 'Balyena.org // Sperm whale necropsy', 640, 639, 'sea', '', 'balyena'],
    ['team39', 'Balyena.org', 640, 640, 'sea', 'T', 'balyena'], ['team40', 'Biodiversity Foundation of the Philippines // Biliran expedition, team lunch', 480, 640, 'land', 'T', 'bfpi'],
    ['team41', 'Biodiversity trip with UPLB', 640, 480, 'land', 'T'], ['team42', 'CIRCE // Boat survey team', 640, 473, 'sea', 'T', 'circe'],
    ['team43', 'Isla Biodiversity Conservation', 640, 480, 'land', 'T'], ['team44', 'Isla Biodiversity Conservation // Survey team', 480, 640, 'sea', 'T'],
    ['team45', 'Isla Biodiversity Conservation // Cove', 480, 640, 'sea', 'T'], ['team46', 'Isla Biodiversity Conservation // Cove', 640, 480, 'land', 'T'],
    ['team47', 'Isla Biodiversity Conservation', 480, 640, 'land', 'T'], ['team48', 'NIRAS // Inshore boat survey team', 480, 640, 'sea', 'T', 'niras'],
    ['team49', 'PAL-CE project', 360, 640, 'sea', '', 'palce'], ['team50', 'PAL-CE project // Team', 489, 640, 'sea', 'T', 'palce'],
    ['team51', 'PAL-CE project', 360, 640, 'sea', '', 'palce'], ['team52', 'STCW // Fire prevention and fire fighting', 640, 480, 'sea', 'T'],
    ['team53', 'The Search for Luzon’s Lost Birds // Birding', 640, 360, 'land', '', 'lostbird'], ['team54', 'The Search for Luzon’s Lost Birds // Birding', 640, 360, 'land', '', 'lostbird'],
    ['team55', 'The Search for Luzon’s Lost Birds', 640, 360, 'land', '', 'lostbird'],
    ['team36', 'Solo birding', 640, 428, 'land', '']
  ].map(function (b) {
    var team = b[0].indexOf('team') === 0, ext = team ? '.jpg' : '.webp', dir = team ? 'images/team/' : 'images/ken/';
    return { t: dir + (team ? 't/' : 't/') + b[0] + ext, f: dir + b[0] + ext, c: b[1], l: '', a: b[1] || 'Fieldwork photograph',
      r: b[3] / b[2], theme: b[4], team: b[5] === 'T', org: b[6] || '' };
  });

  /* ---------- Lightbox ---------- */
  var lb = $('lightbox'), cur = [], idx = 0, lastFocus = null;
  if (lb) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption');
    var lbSound = document.createElement('div'); lbSound.className = 'lb-sound'; lbCap.parentNode.appendChild(lbSound);
    var show = function () {
      var it = cur[idx];
      lbImg.src = it.f; lbImg.alt = it.a;
      lbCap.innerHTML = '';
      if (it.c) { var b = document.createElement('b'); b.textContent = capText(it); lbCap.appendChild(b); }
      if (it.l) { var i = document.createElement('i'); i.textContent = it.l; lbCap.appendChild(i); }
      var n = document.createElement('span'); n.textContent = (idx + 1) + ' / ' + cur.length; lbCap.appendChild(n);
      (new Image()).src = cur[(idx + 1) % cur.length].f;
      // sound block: a player when a recording exists, otherwise a link to Xeno-canto
      lbSound.innerHTML = ''; bar = null; timeEl = null; errEl = null;
      if (it.s && it.s.f) {
        var pb = document.createElement('button'); pb.type = 'button'; pb.className = 'lb-play'; pb.dataset.snd = it.s.f;
        pb.addEventListener('click', function () { toggleSound(it.s); });
        var track = document.createElement('span'); track.className = 'lb-track'; track.title = 'Click to jump to a point in the recording';
        bar = document.createElement('i'); track.appendChild(bar);
        track.addEventListener('click', function (e) {
          if (audio && nowPlaying === it.s && audio.duration) audio.currentTime = audio.duration * Math.max(0, Math.min(1, (e.clientX - track.getBoundingClientRect().left) / track.offsetWidth));
        });
        timeEl = document.createElement('span'); timeEl.className = 'lb-time'; timeEl.textContent = '0:00';
        var cr = document.createElement('span'); cr.className = 'lb-credit';
        cr.appendChild(document.createTextNode('Recording' + (it.s.by ? ' // ' + it.s.by : '') + (it.s.where ? ' // ' + it.s.where : '') + ' // ' + it.s.lic + ' // '));
        var wiki = it.s.page && it.s.page.indexOf('wikimedia.org') >= 0;
        if (wiki) {
          cr.appendChild(mkLink(it.s.page, 'Wikimedia Commons'));
          if (it.s.xc) { cr.appendChild(document.createTextNode(' // ')); cr.appendChild(mkLink('https://xeno-canto.org/' + it.s.xc, 'XC' + it.s.xc)); }
        } else cr.appendChild(mkLink(it.s.page || ('https://xeno-canto.org/' + it.s.xc), 'Xeno-canto XC' + it.s.xc));
        errEl = document.createElement('span'); errEl.className = 'lb-err'; errEl.hidden = true; errEl.setAttribute('role', 'alert');
        errEl.appendChild(document.createTextNode('This recording could not be played. '));
        if (it.s.page) errEl.appendChild(mkLink(it.s.page, 'Listen on the source page'));
        lbSound.appendChild(pb); lbSound.appendChild(track); lbSound.appendChild(timeEl); lbSound.appendChild(cr); lbSound.appendChild(errEl);
        refreshSound();
      }
    };    var closeLB = function () { stopSound(); lb.hidden = true; document.body.style.overflow = ''; lbImg.removeAttribute('src'); if (lastFocus) lastFocus.focus(); };
    var step = function (d) { stopSound(); idx = (idx + d + cur.length) % cur.length; show(); if (window.pageTurn) window.pageTurn(); };
    window.openLB = function (items, i) { cur = items; idx = i; lastFocus = document.activeElement; lb.hidden = false; document.body.style.overflow = 'hidden'; show(); lb.querySelector('.lb-close').focus(); };
    lb.querySelector('.lb-close').addEventListener('click', closeLB);
    lb.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') closeLB(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLB(); else if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'Tab') { // keep keyboard focus inside the viewer
        var f = lb.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); tx = null;
    });
  }

  // the hero photo's caption: "Listen" to the kingfisher
  var heroSnd = document.querySelector('.hero-snd');
  if (heroSnd) {
    var hs = SOUNDS[heroSnd.dataset.sound];
    if (hs && hs.f) { heroSnd.dataset.snd = hs.f; heroSnd.addEventListener('click', function () { toggleSound(hs); }); refreshSound(); }
    else heroSnd.hidden = true;
  }

  /* ---------- Galleries ---------- */
  function capText(it) { return it.c + (it.n ? ' (' + it.n.toLowerCase() + ')' : ''); }
  function build(container, items, withCaption) {
    container.innerHTML = '';
    items.forEach(function (it, i) {
      var fig = document.createElement('figure');
      var openBtn = document.createElement('button'); openBtn.type = 'button'; openBtn.className = 'open'; openBtn.setAttribute('aria-label', 'Open image: ' + it.a);
      fig.appendChild(openBtn);
      var img = new Image();
      img.alt = it.a; img.loading = 'lazy'; img.decoding = 'async';
      img.srcset = it.t + ' 900w, ' + it.f + ' 1800w';
      img.sizes = container.id === 'gallery' ? '(max-width: 900px) 100vw, 50vw' : '(max-width: 600px) 100vw, 25vw';
      img.onload = function () { img.classList.add('loaded'); };
      img.src = it.t;
      if (img.complete) img.classList.add('loaded');
      fig.appendChild(img);
      if (withCaption && it.c) {
        var cap = document.createElement('figcaption');
        var b = document.createElement('b'); b.textContent = capText(it); cap.appendChild(b);
        if (it.l) { var l = document.createElement('i'); l.textContent = it.l; cap.appendChild(l); }
        fig.appendChild(cap);
      }
      if (it.s) {
        var sb = document.createElement('button'); sb.type = 'button'; sb.className = 'snd'; sb.dataset.snd = it.s.f;
        sb.setAttribute('aria-label', 'Listen to ' + (it.c || 'this bird')); sb.title = 'Listen to ' + (it.c || 'this bird');
        sb.innerHTML = I_VOL;
        sb.addEventListener('click', function (e) { e.stopPropagation(); toggleSound(it.s); });
        fig.appendChild(sb);
      }
      container.appendChild(fig);
      var open = function () { window.openLB(items, i); };
      fig.addEventListener('click', open);
    });
  }

  var gallery = $('gallery'), filters = $('filters');
  if (gallery && filters) {
    // chips: Selected, then bird families (most photographed first; single-photo families sit behind "more"), then All
    var famCount = {};
    BIRDS.forEach(function (b) { if (b.fam) famCount[b.fam] = (famCount[b.fam] || 0) + 1; });
    var fams = Object.keys(famCount).sort(function (a, b) { return famCount[b] - famCount[a] || FAMILIES[a].localeCompare(FAMILIES[b]); });
    var main = fams.filter(function (k) { return famCount[k] > 1; }), extra = fams.filter(function (k) { return famCount[k] === 1; });
    var apply = function (key) {
      var items = BIRDS.filter(function (b) { return key === '*' || (key === 's' ? b.tags.indexOf('s') >= 0 : b.fam === key); });
      gallery.classList.toggle('editorial', key !== '*');
      build(gallery, items, true);
      each(filters.querySelectorAll('button[data-k]'), function (btn) { btn.setAttribute('aria-pressed', String(btn.dataset.k === key)); });
      if (extra.indexOf(key) >= 0) setMore(true);
    };
    var moreBtn = null;
    var setMore = function (on) { filters.classList.toggle('more', on); if (moreBtn) { moreBtn.setAttribute('aria-expanded', String(on)); moreBtn.firstChild.nodeValue = on ? 'Fewer families' : '+ ' + extra.length + ' more families'; } };
    var chip = function (key, label, n, cls, title) {
      var btn = document.createElement('button'); btn.type = 'button'; btn.dataset.k = key; if (cls) btn.className = cls; if (title) btn.title = title;
      btn.innerHTML = label + '<span>' + n + '</span>';
      btn.addEventListener('click', function () { apply(key); });
      filters.appendChild(btn);
    };
    chip('s', 'Selected', BIRDS.filter(function (b) { return b.tags.indexOf('s') >= 0; }).length);
    chip('*', 'All', BIRDS.length);
    main.concat(extra).forEach(function (k) { chip(k, FAMILIES[k], famCount[k], famCount[k] === 1 ? 'fam-extra' : 'fam', k); });
    if (extra.length) {
      moreBtn = document.createElement('button'); moreBtn.type = 'button'; moreBtn.className = 'fam-more'; moreBtn.appendChild(document.createTextNode('')); moreBtn.setAttribute('aria-expanded', 'false');
      moreBtn.addEventListener('click', function () { setMore(!filters.classList.contains('more')); });
      filters.appendChild(moreBtn); setMore(false);
    }    apply('s');
  }

  var mosaic = $('field-grid');
  if (mosaic) {
    var ffThemes = $('field-filters'), ffOrgs = $('field-orgs'), story = $('field-story');
    var ROW = 8, GAP = 12, state = 'all', shown = [];
    var THEMES = [['all', 'All'], ['sea', 'At sea'], ['land', 'On land'], ['team', 'With teams']];
    var match = function (p, k) {
      if (k === 'all') return true;
      if (k === 'team') return p.team;
      if (k.indexOf('org:') === 0) return p.org === k.slice(4);
      return p.theme === k;
    };
    var count = function (k) { return PHOTOS.filter(function (p) { return match(p, k); }).length; };

    // size every tile from its own aspect ratio so the columns pack tightly; every third landscape tile runs wide
    var layout = function () {
      var cs = getComputedStyle(mosaic).gridTemplateColumns.split(' ');
      var cols = cs.length, colW = parseFloat(cs[0]) || 0;
      if (!colW) return;
      var land = 0;
      each(mosaic.children, function (fig, i) {
        var p = shown[i]; if (!p) return;
        var wide = false;
        if (p.r < 0.8) { wide = (land % 3 === 1); land++; }
        var span = wide && cols > 1 ? 2 : 1, w = colW * span + GAP * (span - 1);
        fig.style.gridColumn = 'span ' + span;
        fig.style.gridRowEnd = 'span ' + Math.ceil((w * p.r + GAP) / ROW);
        fig.classList.toggle('wide', span === 2);
      });
    };

    var cap = function (fig, p) {
      if (!p.c) return;
      var parts = p.c.split(' // '), fc = document.createElement('figcaption');
      if (parts.length > 1) { var o = document.createElement('i'); o.textContent = parts[0]; fc.appendChild(o); }
      var d = document.createElement('b'); d.textContent = parts.length > 1 ? parts.slice(1).join(' // ') : p.c; fc.appendChild(d);
      fig.appendChild(fc);
    };

    var render = function () {
      shown = PHOTOS.filter(function (p) { return match(p, state); });
      build(mosaic, shown, false);
      each(mosaic.children, function (fig, i) {
        fig.style.setProperty('--i', Math.min(i, 14));
        cap(fig, shown[i]);
        var im = fig.querySelector('img'); if (im) im.style.opacity = 1;
      });
      mosaic.classList.remove('swap'); void mosaic.offsetWidth; mosaic.classList.add('swap');
      layout();
      each(document.querySelectorAll('#field-filters button, #field-orgs button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === state)); });
      renderStory();
    };

    // a chosen organisation opens a short story: the role, the place and the photographs from it
    var renderStory = function () {
      story.innerHTML = '';
      var org = state.indexOf('org:') === 0 ? ORGS[state.slice(4)] : null;
      story.hidden = !org;
      if (!org) return;
      var fig = document.createElement('figure');
      var im = new Image(); im.src = shown[0].f; im.alt = shown[0].a; im.decoding = 'async';
      fig.appendChild(im); fig.addEventListener('click', function () { window.openLB(shown, 0); });
      var txt = document.createElement('div');
      var n = document.createElement('p'); n.className = 'note light'; n.textContent = org.pl ? org.yr + ' // ' + org.pl : org.yr; txt.appendChild(n);
      var h = document.createElement('h3'); h.textContent = org.n; txt.appendChild(h);
      var r = document.createElement('p'); r.textContent = org.role; txt.appendChild(r);
      var m = document.createElement('p'); m.className = 'ff-meta'; m.textContent = shown.length + (shown.length === 1 ? ' photograph' : ' photographs'); txt.appendChild(m);
      var a = document.createElement('a'); a.className = 'link light'; a.href = org.href; a.textContent = 'Read about the role'; txt.appendChild(a);
      story.appendChild(fig); story.appendChild(txt);
    };

    var mk = function (host, key, label) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.k = key;
      b.innerHTML = label + '<span>' + count(key) + '</span>';
      b.addEventListener('click', function () { state = (state === key && key !== 'all') ? 'all' : key; render(); });
      host.appendChild(b);
    };
    THEMES.forEach(function (t) { mk(ffThemes, t[0], t[1]); });
    Object.keys(ORGS).filter(function (k) { return count('org:' + k) > 0; })
      .sort(function (a, b) { return count('org:' + b) - count('org:' + a); })
      .forEach(function (k) { mk(ffOrgs, 'org:' + k, ORGS[k].n.replace(/^The Search for Luzon’s Lost Bird$/, 'Luzon’s Lost Bird').replace('Deutsches Meeresmuseum & Thünen Institute', 'PAL-CE')); });
    render();
    var rz = null;
    window.addEventListener('resize', function () { cancelAnimationFrame(rz); rz = requestAnimationFrame(layout); });
  }

  /* ---------- Recovery clips: a stories-style viewer ----------
     tap / click the picture = pause or play; arrows, swipe or the side buttons = previous / next clip */
  (function () {
  var st = $('stories');
  if (!st) return;
  {
    var SRC = st.getAttribute('data-clips').split(','), cur = 0, muted = true, wantPlay = true, swiped = false, px = null, visible = false;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ic = function (d, fill) { return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (fill ? ' fill="currentColor"' : ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"') + '>' + d + '</svg>'; };
    var I_PLAY = ic('<path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/>', true);
    var I_PAUSE = ic('<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>', true);
    var I_OFF = ic('<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>');
    var I_ON = ic('<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>');
    st.innerHTML = '<video class="bd" muted playsinline preload="metadata" aria-hidden="true" tabindex="-1"></video><video class="main" muted playsinline preload="auto"></video>' +
      '<div class="st-bars" aria-hidden="true">' + SRC.map(function () { return '<i><b></b></i>'; }).join('') + '</div>' +
      '<div class="st-head"><img src="images/ken/t/ken21.webp" alt="" width="30" height="30"><b>Learning to walk again</b>' +
      '<button type="button" class="st-btn st-pp" aria-label="Pause">' + I_PAUSE + '</button><button type="button" class="st-btn st-mute" aria-label="Turn sound on">' + I_OFF + '</button></div>' +
      '<button type="button" class="st-tap" aria-label="Pause or play"></button>' +
      '<span class="st-state" aria-hidden="true" hidden>' + I_PLAY + '</span>' +
      '<button type="button" class="st-nav prev" aria-label="Previous clip">' + ic('<path d="m15 18-6-6 6-6"/>') + '</button><button type="button" class="st-nav next" aria-label="Next clip">' + ic('<path d="m9 18 6-6-6-6"/>') + '</button>';
    var main = st.querySelector('.main'), bd = st.querySelector('.bd'), bars = st.querySelectorAll('.st-bars i b');
    var tap = st.querySelector('.st-tap'), state = st.querySelector('.st-state'), pp = st.querySelector('.st-pp'), muteBtn = st.querySelector('.st-mute');
    // one place decides what the controls show, so nothing flickers between states
    var paint = function (playing) {
      state.hidden = playing; pp.innerHTML = playing ? I_PAUSE : I_PLAY; pp.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      st.classList.toggle('is-paused', !playing);
    };
    var play = function () { wantPlay = true; paint(true); var pr = main.play(); if (pr && pr.catch) pr.catch(function (err) { if (err && err.name === 'NotAllowedError') { wantPlay = false; paint(false); } }); };
    var pause = function (user) { if (user) wantPlay = false; main.pause(); paint(false); };
    var load = function (i) {
      cur = (i + SRC.length) % SRC.length;
      main.src = SRC[cur]; bd.src = SRC[cur] + '#t=0.1'; main.muted = muted;
      each(bars, function (b, k) { b.style.width = k < cur ? '100%' : '0'; });
      if (wantPlay && visible) play(); else paint(false);
    };
    var toggle = function () { if (main.paused || !wantPlay) play(); else pause(true); };
    main.addEventListener('timeupdate', function () { if (main.duration) bars[cur].style.width = (main.currentTime / main.duration * 100) + '%'; });
    main.addEventListener('ended', function () { load(cur + 1); });
    tap.addEventListener('pointerdown', function (e) { px = e.clientX; });
    tap.addEventListener('pointerup', function (e) { if (px !== null && Math.abs(e.clientX - px) > 40) { swiped = true; setTimeout(function () { swiped = false; }, 60); load(cur + (e.clientX < px ? 1 : -1)); } px = null; });
    tap.addEventListener('click', function () { if (!swiped) toggle(); });
    pp.addEventListener('click', toggle);
    st.querySelector('.st-nav.prev').addEventListener('click', function () { load(cur - 1); });
    st.querySelector('.st-nav.next').addEventListener('click', function () { load(cur + 1); });
    muteBtn.addEventListener('click', function () {
      muted = !muted; main.muted = muted; muteBtn.innerHTML = muted ? I_OFF : I_ON;
      muteBtn.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off');
    });
    st.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') load(cur - 1); else if (e.key === 'ArrowRight') load(cur + 1); });
    if (reduce) wantPlay = false;
    // nothing is downloaded until the player is about to scroll into view
    var primed = false, prime = function () { if (!primed) { primed = true; load(0); } };
    if (!('IntersectionObserver' in window)) { visible = true; prime(); }
    else new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { prime(); o.disconnect(); } }, { rootMargin: '500px 0px' }).observe(st);
    // start when mostly in view, stop only once it has nearly left: the gap stops play/pause flapping at the edge
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) {
      var r = en[0].intersectionRatio; visible = r >= 0.6 || (visible && r >= 0.12);
      if (visible && wantPlay && main.paused) play(); else if (!visible && !main.paused) { main.pause(); paint(false); }
    }, { threshold: [0, 0.12, 0.3, 0.6, 1] }).observe(st);
  }
  })();
  var strip = $('home-strip');
  if (strip) {
    BIRDS.filter(function (b) { return b.tags.indexOf('s') >= 0; }).slice(0, 8).forEach(function (b) {
      var a = document.createElement('a'); a.href = 'photography.html';
      var img = new Image(); img.src = b.t; img.alt = b.a; img.loading = 'lazy';
      var s = document.createElement('span'); s.textContent = b.c;
      a.appendChild(img); a.appendChild(s); strip.appendChild(a);
    });
  }

  /* ---------- Navigation ---------- */
  var header = document.querySelector('.site-header'), toggle = document.querySelector('.nav-toggle'), nav = $('nav');
  if (toggle && nav) {
    var setNav = function (o) {
      nav.classList.toggle('open', o); header.classList.toggle('open', o);
      toggle.setAttribute('aria-expanded', String(o));
      document.body.style.overflow = o ? 'hidden' : '';
    };
    toggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setNav(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) setNav(false); });
  }
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* ---------- Reading progress ---------- */
  var prog = document.querySelector('.read-progress i');
  if (prog) {
    var pRaf = 0, upd = function () {
      pRaf = 0; var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (h > 40 ? Math.min(1, window.scrollY / h) : 0) + ')';
    };
    window.addEventListener('scroll', function () { if (!pRaf) pRaf = requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd); upd();
  }

  /* ---------- Two clocks: San Pablo City and St Andrews ---------- */
  var clocks = document.querySelectorAll('[data-tz]');
  if (clocks.length) {
    var tick = function () {
      each(clocks, function (c) {
        try { c.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: c.dataset.tz }); } catch (e) {}
      });
    };
    tick(); setInterval(tick, 20000);
  }

  /* ---------- Quiet page-turn sound for the photo viewer ---------- */
  var flipCtx = null;
  window.pageTurn = function () {
    try {
      flipCtx = flipCtx || new (window.AudioContext || window.webkitAudioContext)();
      var t = flipCtx.currentTime, n = Math.floor(flipCtx.sampleRate * 0.14), buf = flipCtx.createBuffer(1, n, flipCtx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.4);
      var s = flipCtx.createBufferSource(), f = flipCtx.createBiquadFilter(), g = flipCtx.createGain();
      s.buffer = buf; f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 0.7; g.gain.value = 0.03;
      s.connect(f); f.connect(g); g.connect(flipCtx.destination); s.start(t);
    } catch (e) {}
  };

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    each(reveals, function (el) { ro.observe(el); });
  } else each(reveals, function (el) { el.classList.add('in'); });

  /* ---------- CV print ---------- */
  var printBtn = $('btn-print');
  if (printBtn) {
    var state = [];
    window.addEventListener('beforeprint', function () { state = []; each(document.querySelectorAll('details'), function (d) { state.push(d.open); d.open = true; }); });
    window.addEventListener('afterprint', function () { each(document.querySelectorAll('details'), function (d, i) { d.open = state[i]; }); });
    printBtn.addEventListener('click', function () { window.print(); });
  }

  /* ---------- Contact form ----------
     With data-endpoint set (e.g. a Formspree URL) the message is sent in the background.
     Without it, the visitor's email app opens with the message pre-filled. */
  var form = $('contact-form'), note = $('form-note'), EMAIL = 'kenmanuel02.12@gmail.com';
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var d = new FormData(form);
    if (d.get('_gotcha')) return;
    var endpoint = form.dataset.endpoint;
    note.className = 'form-note';
    if (endpoint) {
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true; note.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: d, headers: { Accept: 'application/json' } }).then(function (r) {
        if (!r.ok) throw new Error();
        form.reset(); note.textContent = 'Thank you — your message is on its way.'; note.className = 'form-note ok';
      }).catch(function () {
        note.textContent = 'Something went wrong. Please email ' + EMAIL + ' directly.';
      }).then(function () { btn.disabled = false; });
    } else {
      var body = d.get('message') + '\n\n— ' + d.get('first') + ' ' + d.get('last') + ' (' + d.get('email') + ')';
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(d.get('topic')) + '&body=' + encodeURIComponent(body);
      note.textContent = 'Opening your email app… if nothing happens, write to ' + EMAIL + '.';
    }
  });

  /* ---------- Theme (light / dark) ---------- */
  var root = document.documentElement;
  function setTheme(t, save) {
    root.setAttribute('data-theme', t);
    if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }
    var tb = document.querySelector('.theme-toggle');
    if (tb) { tb.setAttribute('aria-pressed', String(t === 'dark')); tb.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); }
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', t === 'dark' ? '#0e1311' : '#123025');
  }
  setTheme(root.getAttribute('data-theme') || 'light', false);
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', function () { setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true); });

  /* ---------- Language (English / Tagalog) ----------
     Static text is translated from i18n/tl.js: each key is the English HTML of one text block, each value its Tagalog
     replacement. Empty or missing values simply stay in English. The dictionary is only fetched when Tagalog is chosen. */
  var DICT = {};
  var SKIP = ['gallery', 'field-grid', 'stories', 'field-story', 'field-filters', 'field-orgs', 'home-strip', 'species-list', 'panel', 'timeline', 'filters', 'legend', 'lightbox', 'jsvg', 'mini-map'];
  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
  function unitsOf(rootEl) {
    var out = [];
    (function walk(el) {
      if (!el.tagName || /^(SCRIPT|STYLE|SVG|NOSCRIPT|IFRAME|TEXTAREA|SELECT|OPTION|INPUT)$/i.test(el.tagName)) return;
      if (el.hasAttribute('data-no-i18n') || (el.id && SKIP.indexOf(el.id) >= 0)) return;
      for (var i = 0; i < el.childNodes.length; i++) { var n = el.childNodes[i]; if (n.nodeType === 3 && n.nodeValue.trim()) { out.push(el); return; } }
      for (var j = 0; j < el.children.length; j++) walk(el.children[j]);
    })(rootEl);
    return out;
  }
  function keyOf(el) { return norm(el.innerHTML.replace(/<svg[\s\S]*?<\/svg>/gi, '').replace(/(<span data-species-count[^>]*>)[^<]*(<\/span>)/g, function (m, a, b) { return a + '0' + b; })); }
  function svgPrefix(el) { var s = ''; for (var i = 0; i < el.children.length; i++) if (el.children[i].tagName.toLowerCase() === 'svg') s += el.children[i].outerHTML; return s; }
  var units = null, titleEn = document.title, tlLoading = false;
  function prepare() { if (!units) units = unitsOf(document.body).map(function (el) { return { el: el, en: el.innerHTML, key: keyOf(el) }; }); return units; }
  function withDict(done) {
    if (window.I18N_TL) { DICT = window.I18N_TL; return done(); }
    if (tlLoading) return;
    tlLoading = true;
    var s = document.createElement('script'); s.src = root.getAttribute('data-tl') || 'i18n/tl.js';
    s.onload = function () { tlLoading = false; DICT = window.I18N_TL || {}; done(); };
    s.onerror = function () { tlLoading = false; window.I18N_TL = {}; done(); };
    document.head.appendChild(s);
  }
  function applyLang(lang, save) {
    if (lang === 'tl' && !window.I18N_TL) { withDict(function () { applyLang(lang, save); }); return; }
    if (lang === 'tl') prepare();
    (units || []).forEach(function (u) {
      var tl = lang === 'tl' && DICT[u.key];
      if (tl) u.el.innerHTML = svgPrefix(u.el) + tl; else if (u.el.innerHTML !== u.en) u.el.innerHTML = u.en;
    });
    fillCounts();
    document.title = (lang === 'tl' && DICT[norm(titleEn)]) || titleEn;
    root.setAttribute('data-lang', lang); root.lang = lang === 'tl' ? 'tl' : 'en';
    if (save) { try { localStorage.setItem('lang', lang); } catch (e) {} }
    each(document.querySelectorAll('.lang-switch button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
  }
  each(document.querySelectorAll('.lang-switch button'), function (b) { b.addEventListener('click', function () { applyLang(b.dataset.lang, true); }); });
  applyLang(root.getAttribute('data-lang') || 'en', false);
  window.I18N_collect = function () { return [norm(titleEn)].concat(prepare().map(function (u) { return u.key; })); };
  /* ---------- Silhouettes: crop each to its drawing, so a bird's feet sit exactly on the branch ---------- */
  each(document.querySelectorAll('svg[data-sil]'), function (svg) {
    try { var b = svg.getBBox(); if (b.width && b.height) svg.setAttribute('viewBox', b.x + ' ' + b.y + ' ' + b.width + ' ' + b.height); } catch (e) {}
  });
  /* ---------- Images: no dragging, no right-click saving, no copying (a deterrent only) ---------- */
  var IMG_AREA = 'img, svg, .gallery figure, .mosaic figure, .strip a, .hero, .proj-hero, .pillar .ph, .about-side figure, .flag figure, .lightbox figure';
  document.addEventListener('dragstart', function (e) { if (e.target && e.target.closest && e.target.closest('img, svg')) e.preventDefault(); });
  document.addEventListener('contextmenu', function (e) { if (e.target && e.target.closest && e.target.closest(IMG_AREA)) e.preventDefault(); });
  document.addEventListener('copy', function (e) {
    var sel = window.getSelection && window.getSelection();
    if (sel && sel.rangeCount && sel.getRangeAt(0).cloneContents().querySelector('img, svg')) { e.preventDefault(); if (e.clipboardData) e.clipboardData.setData('text/plain', sel.toString()); }
  });
  each(document.querySelectorAll('img'), function (im) { im.setAttribute('draggable', 'false'); });
  var y = $('year'); if (y) y.textContent = new Date().getFullYear();
})();
