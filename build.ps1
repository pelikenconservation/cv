# Builds the site: wraps every page in src/pages with src/layout.html and writes the result
# into this folder. Run after editing anything in src/:
#   powershell -ExecutionPolicy Bypass -File build.ps1
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = New-Object Text.UTF8Encoding $false
$layout = [IO.File]::ReadAllText("$root\src\layout.html", $utf8)
$navKeys = 'work', 'journey', 'photography', 'about', 'contact'
# Public address of the site, e.g. https://example.com (no trailing slash). Put it in site-url.txt (one line) once the domain is known:
# the build then adds canonical links, absolute social-preview URLs and writes sitemap.xml. Until then these are skipped.
$siteUrl = ''
if (Test-Path "$root\site-url.txt") { $siteUrl = ([IO.File]::ReadAllText("$root\site-url.txt", $utf8)).Trim().TrimEnd('/') }
$built = @()

# list of bird recordings present in audio/ (the site only offers sounds that exist)
New-Item -ItemType Directory -Force "$root\audio" | Out-Null
$have = @(Get-ChildItem "$root\audio" -File | Where-Object { $_.Extension -in '.mp3', '.wav', '.ogg' } | ForEach-Object { '"' + $_.Name + '"' }) -join ','
New-Item -ItemType Directory -Force "$root\audio\places" | Out-Null
$places = @(Get-ChildItem "$root\audio\places" -File | Where-Object { $_.Extension -in '.mp3', '.ogg', '.wav' } | ForEach-Object { '"' + $_.Name + '"' }) -join ','
[IO.File]::WriteAllText("$root\audio\index.js", "window.BIRD_AUDIO=[$have];`nwindow.PLACE_AUDIO=[$places];`n", $utf8)

foreach ($f in Get-ChildItem "$root\src\pages\*.html") {
  $src = [IO.File]::ReadAllText($f.FullName, $utf8)
  $meta = @{ title = 'Kenneth Manuel'; desc = ''; page = ''; body = ''; scripts = '' }
  $m = [regex]::Match($src, '(?s)^\s*<!--meta(.*?)-->')
  if ($m.Success) {
    foreach ($pair in $m.Groups[1].Value.Split('|')) {
      $i = $pair.IndexOf('=')
      if ($i -gt 0) { $meta[$pair.Substring(0, $i).Trim()] = $pair.Substring($i + 1).Trim() }
    }
    $src = $src.Substring($m.Length).TrimStart()
  }
  $esc = { param($s) $s.Replace('&', '&amp;').Replace('"', '&quot;').Replace('<', '&lt;') }
  $scripts = ''
  if ($meta.scripts) { $scripts = ($meta.scripts.Split(',') | ForEach-Object { '<script src="' + $_.Trim() + '" defer></script>' }) -join "`n" }
  $out = $layout.Replace('{{title}}', (& $esc $meta.title)).Replace('{{desc}}', (& $esc $meta.desc)).Replace('{{body}}', $meta.body).Replace('{{scripts}}', $scripts).Replace('{{content}}', $src.TrimEnd())
  foreach ($k in $navKeys) {
    $rep = ''
    if ($k -eq $meta.page) { $rep = ' aria-current="page"' }
    $out = $out.Replace("{{nav:$k}}", $rep)
  }
  # {{icon:name}} -> inline SVG from src/icons/name.svg (inherits the text colour)
  $out = [regex]::Replace($out, '\{\{icon:([a-z0-9-]+)\}\}', {
      param($mm)
      $p = "$root\src\icons\$($mm.Groups[1].Value).svg"
      if (-not (Test-Path $p)) { Write-Warning "missing icon $($mm.Groups[1].Value)"; return '' }
      $inner = [regex]::Match([IO.File]::ReadAllText($p, $utf8), '(?s)<svg[^>]*>(.*)</svg>').Groups[1].Value
      $inner = ($inner -replace '\s+', ' ').Trim()
      '<svg class="ico" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + $inner + '</svg>'
    })
  # {{bubbles}} / {{leaves}}: small drifting particles (deterministic, so builds are stable)
  $mkp = { param($n, $seed) $s = $seed; ($(for ($i = 0; $i -lt $n; $i++) { $s = ($s * 1103515245 + 12345) % 2147483648; $a = $s % 100; $s = ($s * 1103515245 + 12345) % 2147483648; $c = $s % 100; $s = ($s * 1103515245 + 12345) % 2147483648; $d = $s % 100
      '<i style="--x:' + (3 + $a * 0.94) + ';--s:' + (8 + $c % 14) + ';--t:' + (16 + $d % 14) + ';--d:' + ($i * 3.1) + ';--w:' + (($a % 7 - 3) * 18) + '"></i>' }) -join '') }
  $out = $out.Replace('{{bubbles}}', '<div class="bubbles" aria-hidden="true">' + (& $mkp 12 7) + '</div>').Replace('{{leaves}}', '<div class="leaves" aria-hidden="true">' + (& $mkp 9 3) + '</div>')
  $out = $out.Replace('{{branchwide}}', ([IO.File]::ReadAllText("$root\src\sil\_branch-wide.svg", $utf8) -replace '\s+', ' ').Trim())
  $out = $out.Replace('{{vine}}', ([IO.File]::ReadAllText("$root\src\sil\_vine.svg", $utf8) -replace '\s+', ' ').Trim())
  $out = $out.Replace('{{branch}}', ([IO.File]::ReadAllText("$root\src\sil\_branch.svg", $utf8) -replace '\s+', ' ').Trim())
  # {{sil:name}} -> inline silhouette from src/sil/name.svg (PhyloPic, public domain / CC0)
  $out = [regex]::Replace($out, '\{\{sil:([a-z0-9-]+)\}\}', {
      param($mm)
      $p = "$root\src\sil\$($mm.Groups[1].Value).svg"
      if (-not (Test-Path $p)) { Write-Warning "missing silhouette $($mm.Groups[1].Value)"; return '' }
      $raw = [IO.File]::ReadAllText($p, $utf8)
      $vb = [regex]::Match($raw, 'viewBox="([^"]+)"').Groups[1].Value
      $body = [regex]::Match($raw, '(?s)</metadata>(.*)</svg>').Groups[1].Value
      if (-not $body) { $body = [regex]::Match($raw, '(?s)<svg[^>]*>(.*)</svg>').Groups[1].Value }
      $body = ($body -replace '\s+', ' ').Trim()
      '<svg xmlns="http://www.w3.org/2000/svg" data-sil="' + $mm.Groups[1].Value + '" viewBox="' + $vb + '" focusable="false" aria-hidden="true">' + $body + '</svg>'
    })
  # asset version: query string changes with every build, so browsers never keep stale CSS/JS
  $ver = Get-Date -Format 'yyyyMMddHHmmss'
  $out = $out.Replace('{{ver}}', $ver)
  $out = [regex]::Replace($out, '(href|src)="((?:styles\.css|script\.js|critters\.js|journey\.js|teaser\.js|audio/index\.js|data/world\.js))"', { param($m) $m.Groups[1].Value + '="' + $m.Groups[2].Value + '?v=' + $ver + '"' })
  if ($siteUrl) {
    $pageUrl = if ($f.Name -eq 'index.html') { $siteUrl + '/' } else { $siteUrl + '/' + $f.Name }
    $out = $out.Replace('content="images/birds/bird09.jpg"', 'content="' + $siteUrl + '/images/birds/bird09.jpg"')
    $out = $out.Replace('<meta property="og:type"', '<link rel="canonical" href="' + $pageUrl + '">' + "`n" + '<meta property="og:url" content="' + $pageUrl + '">' + "`n" + '<meta property="og:type"')
    if ($f.Name -ne '404.html') { $built += $pageUrl }
  }
  [IO.File]::WriteAllText("$root\$($f.Name)", $out, $utf8)
  "built $($f.Name)"
}
# robots.txt always; sitemap.xml once the site address is known
$robots = "User-agent: *`nAllow: /`n"
if ($siteUrl) {
  $robots += "Sitemap: $siteUrl/sitemap.xml`n"
  $sm = '<?xml version="1.0" encoding="UTF-8"?>' + "`n" + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "`n" + (($built | ForEach-Object { '  <url><loc>' + $_ + '</loc></url>' }) -join "`n") + "`n</urlset>`n"
  [IO.File]::WriteAllText("$root\sitemap.xml", $sm, $utf8)
}
[IO.File]::WriteAllText("$root\robots.txt", $robots, $utf8)
