# Generates src/sil/_vine.svg: a vine that grows out from behind the home-page mini map and sprawls across the section.
# Growth is timed: every branch starts when its parent reaches it, leaves open as the stem passes
# (some leaves open early and some branches grow late, so it does not look mechanical).
# Run: powershell -ExecutionPolicy Bypass -File tools\make-vine.ps1, then build.ps1
# Coordinates: viewBox 1240 x 620, the map sits at (300,110)-(940,510).
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$rng = New-Object Random 7
$W = 1240; $H = 620; $mx0 = 300; $my0 = 110; $mx1 = 940; $my1 = 510; $cx = 620; $cy = 310
function F($v) { ([Math]::Round($v, 2)).ToString([Globalization.CultureInfo]::InvariantCulture) }
function Bez($pts) {
  $segs = New-Object Collections.ArrayList
  for ($i = 0; $i -lt $pts.Count - 1; $i++) {
    $p0 = $pts[[Math]::Max(0, $i - 1)]; $p1 = $pts[$i]; $p2 = $pts[$i + 1]; $p3 = $pts[[Math]::Min($pts.Count - 1, $i + 2)]
    $c1 = @(($p1[0] + ($p2[0] - $p0[0]) / 6), ($p1[1] + ($p2[1] - $p0[1]) / 6))
    $c2 = @(($p2[0] - ($p3[0] - $p1[0]) / 6), ($p2[1] - ($p3[1] - $p1[1]) / 6))
    [void]$segs.Add(@($p1, $c1, $c2, $p2))
  }
  return , $segs
}
function At($s, $t) {
  $u = 1 - $t
  $x = $u*$u*$u*$s[0][0] + 3*$u*$u*$t*$s[1][0] + 3*$u*$t*$t*$s[2][0] + $t*$t*$t*$s[3][0]
  $y = $u*$u*$u*$s[0][1] + 3*$u*$u*$t*$s[1][1] + 3*$u*$t*$t*$s[2][1] + $t*$t*$t*$s[3][1]
  $dx = 3*$u*$u*($s[1][0]-$s[0][0]) + 6*$u*$t*($s[2][0]-$s[1][0]) + 3*$t*$t*($s[3][0]-$s[2][0])
  $dy = 3*$u*$u*($s[1][1]-$s[0][1]) + 6*$u*$t*($s[2][1]-$s[1][1]) + 3*$t*$t*($s[3][1]-$s[2][1])
  return @($x, $y, ([Math]::Atan2($dy, $dx) * 180 / [Math]::PI))
}
function InMap($x, $y) { return ($x -gt $mx0 - 4 -and $x -lt $mx1 + 4 -and $y -gt $my0 - 4 -and $y -lt $my1 + 4) }
$script:d = New-Object Text.StringBuilder; $script:leaves = New-Object Text.StringBuilder; $script:curls = New-Object Text.StringBuilder; $script:flowers = New-Object Text.StringBuilder
$script:nLeaf = 0; $script:nFlower = 0; $script:side = 1

function EmitPath($segs, $width, $delay, $dur) {
  [void]$script:d.Append('<path class="stem" pathLength="1" style="--d:' + (F $delay) + 's;--t:' + (F $dur) + 's" stroke-width="' + (F $width) + '" d="M' + (F $segs[0][0][0]) + ' ' + (F $segs[0][0][1]))
  foreach ($s in $segs) { [void]$script:d.Append('C' + (F $s[1][0]) + ' ' + (F $s[1][1]) + ' ' + (F $s[2][0]) + ' ' + (F $s[2][1]) + ' ' + (F $s[3][0]) + ' ' + (F $s[3][1])) }
  [void]$script:d.Append('"/>')
}
function Leaf($x, $y, $ang, $sc, $delay) {
  [void]$script:leaves.Append('<path class="lf" style="--d:' + (F $delay) + 's" transform="translate(' + (F $x) + ' ' + (F $y) + ') rotate(' + (F $ang) + ') scale(' + (F $sc) + ')" d="M0 0C6-9 18-9 26 0C18 9 6 9 0 0Z"/>')
  $script:nLeaf++
}
function Tendril($x, $y, $ang, $sc, $delay) {
  $a = $ang * [Math]::PI / 180; $ox = [Math]::Cos($a) * 7 * $sc; $oy = [Math]::Sin($a) * 7 * $sc
  [void]$script:curls.Append('<path class="curl" style="--d:' + (F $delay) + 's" d="M' + (F $x) + ' ' + (F $y) + 'c' + (F ($ox * 1.6)) + ' ' + (F ($oy * 1.6)) + ' ' + (F ($ox * 3.2)) + ' ' + (F ($oy * 3.2)) + ' ' + (F ($ox * 2.6 + $oy * 1.5)) + ' ' + (F ($oy * 2.6 - $ox * 1.5)) + 'c' + (F (-$oy * 0.9)) + ' ' + (F ($ox * 0.9)) + ' ' + (F (-$ox * 1.4)) + ' ' + (F (-$oy * 1.4)) + ' ' + (F (-$ox * 0.2)) + ' ' + (F (-$oy * 0.2)) + '"/>')
}
function Flower($x, $y, $sc, $delay) {
  $p = ''
  foreach ($a in 0, 72, 144, 216, 288) { $p += '<ellipse class="pt" cx="8" cy="0" rx="8" ry="4.8" transform="rotate(' + $a + ')"/>' }
  [void]$script:flowers.Append('<g class="fl" transform="translate(' + (F $x) + ' ' + (F $y) + ') scale(' + (F $sc) + ')"><g class="bloom" style="--d:' + (F $delay) + 's">' + $p + '<circle class="ct" r="3.8"/></g></g>')
  $script:nFlower++
}
# leaves open as the stem passes them; about one in five opens early (before the stem arrives)
function Decorate($segs, $depth, $dScale, $delay, $dur) {
  $n = $segs.Count
  for ($i = 0; $i -lt $n; $i++) {
    $prog = $i / [Math]::Max(1, $n)
    foreach ($t in 0.3, 0.75) {
      $p = At $segs[$i] $t; $script:side = -$script:side
      $ld = $delay + $dur * (($i + $t) / $n) + 0.12
      if ($rng.NextDouble() -lt 0.2) { $ld = [Math]::Max(0, $ld - 0.9) }
      Leaf $p[0] $p[1] ($p[2] + $script:side * (46 + $rng.Next(0, 26))) ((0.9 + $rng.NextDouble() * 0.55) * $dScale * (1 - 0.3 * $prog)) $ld
    }
    if ($depth -ge 1 -and $rng.Next(0, 4) -eq 0) { $p = At $segs[$i] 0.5; Tendril $p[0] $p[1] ($p[2] + $script:side * 90) $dScale ($delay + $dur * ($i / $n) + 0.3) }
  }
  $p = At $segs[$n - 1] 1.0
  Leaf $p[0] $p[1] $p[2] (0.8 * $dScale) ($delay + $dur + 0.1)
  if ($rng.Next(0, 2) -eq 0) { Tendril $p[0] $p[1] ($p[2] + 35) (1.2 * $dScale) ($delay + $dur + 0.3) }
  return $p
}
function Grow($x, $y, $target, $steps, $depth, $delay) {
  $pts = New-Object Collections.ArrayList; [void]$pts.Add(@($x, $y)); $hd = $target
  for ($i = 0; $i -lt $steps; $i++) {
    $diff = $target - $hd; while ($diff -gt [Math]::PI) { $diff -= 2 * [Math]::PI }; while ($diff -lt -[Math]::PI) { $diff += 2 * [Math]::PI }
    $hd += $diff * 0.22 + ($rng.NextDouble() * 2 - 1) * 0.75
    $step = (30 + $rng.Next(0, 18)) * (1 - 0.3 * $i / $steps)
    $x += [Math]::Cos($hd) * $step; $y += [Math]::Sin($hd) * $step
    if ($x -lt -30 -or $x -gt $W + 30 -or $y -lt 4 -or $y -gt $H - 4 -or (InMap $x $y)) { break }
    [void]$pts.Add(@($x, $y))
  }
  if ($pts.Count -lt 3) { return }
  $segs = Bez $pts
  $w = @(3.2, 2.2, 1.6)[[Math]::Min($depth, 2)]; $ds = @(1.0, 0.85, 0.7)[[Math]::Min($depth, 2)]
  $dur = 0.6 + 0.17 * $pts.Count
  # one branch in five grows late: its leaves are already there when the wood follows
  $stemDelay = $delay; if ($rng.NextDouble() -lt 0.22) { $stemDelay = $delay + 1.4 }
  EmitPath $segs $w $stemDelay $dur
  $tip = Decorate $segs $depth $ds $delay $dur
  if ($depth -eq 1 -and $script:nFlower -lt 5 -and $rng.NextDouble() -lt 0.2) { Flower $tip[0] $tip[1] 0.75 ($stemDelay + $dur + 0.2) }
  if ($depth -lt 2) {
    for ($i = 1; $i -lt $segs.Count; $i++) {
      if ($rng.NextDouble() -lt 0.34) {
        $p = At $segs[$i] 0.2; $script:side = -$script:side
        $sub = ($p[2] * [Math]::PI / 180) + $script:side * (0.7 + $rng.NextDouble() * 0.5)
        Grow $p[0] $p[1] $sub ($steps - 2 - $depth) ($depth + 1) ($stemDelay + $dur * ($i / $segs.Count) + 0.1)
      }
    }
  }
}

# main stems that climb along the edges of the map
$base = @(
  ,@(@(1012,560),@(978,490),@(992,420),@(962,352),@(984,280),@(956,210),@(930,142),@(860,86),@(780,102),@(690,80),@(600,96),@(510,76),@(420,92),@(330,74),@(250,96))
  ,@(@(228,110),@(264,180),@(248,250),@(280,320),@(254,390),@(284,460),@(310,534),@(390,552),@(480,534),@(570,556),@(670,538),@(760,558),@(850,540),@(940,556))
)
$bi = 0; $mainDur = 3.6
foreach ($st in $base) {
  $segs = Bez $st
  $start = $bi * 0.25
  EmitPath $segs 3.6 $start $mainDur
  $tip = Decorate $segs 0 1.15 $start $mainDur
  if ($bi -eq 0) { Flower ($tip[0] - 6) ($tip[1] + 2) 1.2 ($start + $mainDur + 0.25) }  # the flower where the top vine ends
  for ($i = 0; $i -lt $segs.Count; $i++) {
    if ($rng.NextDouble() -lt 0.62) {
      $p = At $segs[$i] 0.45
      $out = [Math]::Atan2($p[1] - $cy, $p[0] - $cx) + ($rng.NextDouble() * 2 - 1) * 0.5
      Grow $p[0] $p[1] $out (5 + $rng.Next(0, 4)) 1 ($start + $mainDur * (($i + 0.45) / $segs.Count) + 0.05)
    }
  }
  $bi++
}
$svg = '<svg class="vine" viewBox="0 0 ' + $W + ' ' + $H + '" preserveAspectRatio="none" aria-hidden="true" focusable="false"><g class="stems">' + $script:d.ToString() + '</g><g class="curls">' + $script:curls.ToString() + '</g><g class="leaves">' + $script:leaves.ToString() + '</g><g class="flowers">' + $script:flowers.ToString() + '</g></svg>'
[IO.File]::WriteAllText("$root\src\sil\_vine.svg", $svg, (New-Object Text.UTF8Encoding $false))
"vine written: $($svg.Length) chars, $($script:nLeaf) leaves, $($script:nFlower) flowers"
