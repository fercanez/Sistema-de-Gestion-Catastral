# Divide catastro.js y catastro.css en módulos (plan v119_modular)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$backupDir = Join-Path $root "respaldo de originales"
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }
Copy-Item "catastro.js" (Join-Path $backupDir "catastro.js.bak-modular") -Force
Copy-Item "catastro.css" (Join-Path $backupDir "catastro.css.bak-modular") -Force

$jsLines = Get-Content "catastro.js" -Encoding UTF8
$totalJs = $jsLines.Count

function Test-InRange($n, $ranges) {
  foreach ($r in $ranges) {
    if ($n -ge $r.Start -and $n -le $r.End) { return $true }
  }
  return $false
}

# Rangos a EXCLUIR de módulos (van a 00-nucleo utils o 99-init)
$utilsRanges = @(
  @{ Start = 1213; End = 1241 }
  @{ Start = 4251; End = 4278 }   # mostrarConfirmacionAsync + window
  @{ Start = 4402; End = 4426 }   # mostrarProgresoOverlay + window
  @{ Start = 4750; End = 4764 }   # extraerMensajeApi
  @{ Start = 5980; End = 5987 }   # authHeaders + window
  @{ Start = 6434; End = 6449 }   # escapeHtml + authJsonHeaders + window
)

$initRanges = @(
  @{ Start = 3207; End = 3303 }
  @{ Start = 3633; End = 3647 }
  @{ Start = 5351; End = 5351 }
  @{ Start = 5966; End = 5973 }
  @{ Start = 6171; End = 6178 }
  @{ Start = 7273; End = 7275 }
  @{ Start = 8639; End = 8639 }
  @{ Start = 10240; End = 10240 }
)

$moduleRanges = @(
  @{ Name = "00-nucleo.js"; Start = 1; End = 249 }
  @{ Name = "10-mapa.js"; Start = 250; End = 1270 }
  @{ Name = "20-ficha.js"; Start = 1271; End = 2268 }
  @{ Name = "40-pdf.js"; Start = 2269; End = 2791 }
  @{ Name = "30-busqueda.js"; Start = 2792; End = 3306 }
  @{ Name = "50-admin.js"; Start = 3307; End = 3649 }
  @{ Name = "60-propietarios.js"; Start = 3650; End = 6490 }
  @{ Name = "70-movimientos.js"; Start = 6491; End = 8640 }
  @{ Name = "80-zonas.js"; Start = 8641; End = 9443 }
  @{ Name = "85-condominios.js"; Start = 9444; End = 10241 }
  @{ Name = "90-mantenimiento.js"; Start = 10242; End = $totalJs }
)

function Get-LinesFromRanges($lines, $ranges, $excludeUtils, $excludeInit) {
  $out = [System.Collections.ArrayList]@()
  foreach ($r in $ranges) {
    for ($i = $r.Start; $i -le $r.End; $i++) {
      if ($excludeUtils -and (Test-InRange $i $utilsRanges)) { continue }
      if ($excludeInit -and (Test-InRange $i $initRanges)) { continue }
      [void]$out.Add($lines[$i - 1])
    }
  }
  return $out
}

$jsDir = Join-Path $root "js"
$cssDir = Join-Path $root "css"
New-Item -ItemType Directory -Path $jsDir -Force | Out-Null
New-Item -ItemType Directory -Path $cssDir -Force | Out-Null

# 00-nucleo: base + utilidades extraídas
$nucleoBase = Get-LinesFromRanges $jsLines @(@{ Start = 1; End = 249 }) $false $false
$utilsLines = @()
foreach ($ur in $utilsRanges) {
  for ($i = $ur.Start; $i -le $ur.End; $i++) { $utilsLines += $jsLines[$i - 1] }
}
$nucleo = @($nucleoBase) + @("", "/* --- Utilidades transversales (extraidas de modulos posteriores) --- */", "") + $utilsLines
$nucleo | Set-Content (Join-Path $jsDir "00-nucleo.js") -Encoding UTF8

foreach ($mod in $moduleRanges) {
  if ($mod.Name -eq "00-nucleo.js") { continue }
  $chunk = Get-LinesFromRanges $jsLines @(@{ Start = $mod.Start; End = $mod.End }) $true $true
  $chunk | Set-Content (Join-Path $jsDir $mod.Name) -Encoding UTF8
}

# 99-init.js
$initLines = @("/* Inicializacion y listeners (codigo top-level; debe cargarse al final). */", "")
foreach ($ir in $initRanges) {
  for ($i = $ir.Start; $i -le $ir.End; $i++) { $initLines += $jsLines[$i - 1] }
}
$initLines | Set-Content (Join-Path $jsDir "99-init.js") -Encoding UTF8

# CSS splits (contiguos por comentarios de sección)
$cssLines = Get-Content "catastro.css" -Encoding UTF8
$cssModules = @(
  @{ Name = "00-base.css"; Start = 1; End = 730 }
  @{ Name = "10-mapa.css"; Start = 731; End = 1273 }
  @{ Name = "20-ficha.css"; Start = 1274; End = 1664 }
  @{ Name = "30-tablas.css"; Start = 1665; End = 2554 }
  @{ Name = "40-modales.css"; Start = 2555; End = 5217 }
  @{ Name = "50-modulos.css"; Start = 5218; End = $cssLines.Count }
)
foreach ($cm in $cssModules) {
  $cssChunk = $cssLines[($cm.Start - 1)..($cm.End - 1)]
  $cssChunk | Set-Content (Join-Path $cssDir $cm.Name) -Encoding UTF8
}

Write-Host "JS modules:" (Get-ChildItem $jsDir -Filter "*.js").Count
Write-Host "CSS modules:" (Get-ChildItem $cssDir -Filter "*.css").Count
Write-Host "Original JS lines: $totalJs"
$splitTotal = 0
Get-ChildItem $jsDir -Filter "*.js" | ForEach-Object { $splitTotal += (Get-Content $_.FullName).Count }
Write-Host "Split JS lines (sum): $splitTotal"
