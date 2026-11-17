# Generates src/sil/_branch-wide.svg: a long branch whose twigs start exactly on the main limb.
# Run: powershell -ExecutionPolicy Bypass -File tools\make-branch.ps1, then build.ps1
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
function F($v) { ([Math]::Round($v, 1)).ToString([Globalization.CultureInfo]::InvariantCulture) }
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
  return @($x, $y)
}
function PathD($segs) {
  $d = 'M' + (F $segs[0][0][0]) + ' ' + (F $segs[0][0][1])
  foreach ($s in $segs) { $d += 'C' + (F $s[1][0]) + ' ' + (F $s[1][1]) + ' ' + (F $s[2][0]) + ' ' + (F $s[2][1]) + ' ' + (F $s[3][0]) + ' ' + (F $s[3][1]) }
  return $d
}
$main = @(@(-10,92),@(210,80),@(430,100),@(650,86),@(870,78),@(1080,88),@(1280,80),@(1480,72),@(1610,66))
$ms = Bez $main
$paths = '<path style="--sw:7" d="' + (PathD $ms) + '"/>'
$leaves = ''
# twig: segment, position on the segment, heading (degrees, negative = up), length
$twigs = @(@(0,0.7,36,90),@(1,0.5,-32,100),@(2,0.4,32,100),@(3,0.6,-36,120),@(4,0.35,28,90),@(5,0.5,30,85),@(6,0.75,-32,110),@(7,0.4,26,75))
foreach ($tw in $twigs) {
  $p0 = At $ms[$tw[0]] $tw[1]
  $a = $tw[2] * [Math]::PI / 180; $len = $tw[3]
  $a1 = $a - 0.14; $a2 = $a + 0.2
  $p1 = @(($p0[0] + [Math]::Cos($a1) * $len * 0.45), ($p0[1] + [Math]::Sin($a1) * $len * 0.45))
  $p2 = @(($p0[0] + [Math]::Cos($a2) * $len), ($p0[1] + [Math]::Sin($a2) * $len))
  $segs = Bez @($p0, $p1, $p2)
  $paths += '<path style="--sw:3" d="' + (PathD $segs) + '"/>'
  $deg = $a2 * 180 / [Math]::PI
  $leaves += '<path transform="translate(' + (F $p2[0]) + ' ' + (F $p2[1]) + ') rotate(' + (F $deg) + ') scale(0.95)" d="M0 0C6-9 18-9 26 0C18 9 6 9 0 0Z"/>'
  foreach ($t in 0.5, 0.78) {
    $q = At $segs[1] $t; $side = if ($t -lt 0.6) { -1 } else { 1 }
    $leaves += '<path transform="translate(' + (F $q[0]) + ' ' + (F $q[1]) + ') rotate(' + (F ($deg + $side * 52)) + ') scale(0.7)" d="M0 0C6-9 18-9 26 0C18 9 6 9 0 0Z"/>'
  }
}
$svg = '<svg class="branch" viewBox="0 0 1600 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + $paths + '<g class="lf">' + $leaves + '</g></svg>'
[IO.File]::WriteAllText("$root\src\sil\_branch-wide.svg", $svg, (New-Object Text.UTF8Encoding $false))
"branch written: " + $svg.Length

# ---- small perch branch (400 x 140): grows from the page edge on the left and ends in a tapering tip ----
$sm = @(@(-8,100),@(110,96),@(232,92),@(340,80),@(402,72))
$ss = Bez $sm
function Sub($segs, $from, $to) { $r = New-Object Collections.ArrayList; for ($i = $from; $i -le $to; $i++) { [void]$r.Add($segs[$i]) }; return , $r }
$sp = '<path style="--sw:7" d="' + (PathD (Sub $ss 0 1)) + '"/><path style="--sw:5" d="' + (PathD (Sub $ss 2 2)) + '"/><path style="--sw:3.4" d="' + (PathD (Sub $ss 3 3)) + '"/>'
$sl = ''
$stw = @(@(1,0.55,34,62),@(2,0.0,-36,100),@(3,0.45,-14,46))
foreach ($tw in $stw) {
  $p0 = At $ss[$tw[0]] $tw[1]
  $a = $tw[2] * [Math]::PI / 180; $len = $tw[3]; $a1 = $a - 0.14; $a2 = $a + 0.2
  $p1 = @(($p0[0] + [Math]::Cos($a1) * $len * 0.45), ($p0[1] + [Math]::Sin($a1) * $len * 0.45))
  $p2 = @(($p0[0] + [Math]::Cos($a2) * $len), ($p0[1] + [Math]::Sin($a2) * $len))
  $sg = Bez @($p0, $p1, $p2)
  $sp += '<path style="--sw:2.8" d="' + (PathD $sg) + '"/>'
  $deg = $a2 * 180 / [Math]::PI
  $sl += '<path transform="translate(' + (F $p2[0]) + ' ' + (F $p2[1]) + ') rotate(' + (F $deg) + ') scale(0.8)" d="M0 0C6-9 18-9 26 0C18 9 6 9 0 0Z"/>'
  foreach ($t2 in 0.5, 0.78) {
    $q = At $sg[1] $t2; $side = if ($t2 -lt 0.6) { -1 } else { 1 }
    $sl += '<path transform="translate(' + (F $q[0]) + ' ' + (F $q[1]) + ') rotate(' + (F ($deg + $side * 52)) + ') scale(0.55)" d="M0 0C6-9 18-9 26 0C18 9 6 9 0 0Z"/>'
  }
}
# a leaf at the very tip of the limb
$tip = At $ss[3] 1.0
$sl += '<path transform="translate(' + (F $tip[0]) + ' ' + (F $tip[1]) + ') rotate(-12) scale(0.8)" d="M0 0C6-9 18-9 26 0C18 9 6 9 0 0Z"/>'
$ssvg = '<svg class="branch" viewBox="0 0 400 140" aria-hidden="true" focusable="false">' + $sp + '<g class="lf">' + $sl + '</g></svg>'
[IO.File]::WriteAllText("$root\src\sil\_branch.svg", $ssvg, (New-Object Text.UTF8Encoding $false))
"small branch written: " + $ssvg.Length