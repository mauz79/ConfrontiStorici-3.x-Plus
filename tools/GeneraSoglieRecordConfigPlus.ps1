param(
  [string]$ConfigRoot = "$env:USERPROFILE\ConfrontiStorici\config",
  [string]$SiteRoot = "",
  [string]$OutputPath = ""
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

function Test-RequiredFile {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "File non trovato: $Path"
  }
}

function Read-ConfigCsvLines {
  param(
    [string]$Path,
    [string[]]$Headers
  )

  Test-RequiredFile $Path

  $rows = @()
  $lines = Get-Content -LiteralPath $Path -Encoding Default

  foreach ($lineRaw in $lines) {
    $line = $lineRaw.Trim()
    if ($line -eq "") { continue }
    if ($line.StartsWith("*")) { continue }

    $obj = $line | ConvertFrom-Csv -Header $Headers
    $rows += $obj
  }

  return $rows
}

function Add-HashtableValue {
  param(
    [hashtable]$Map,
    [string]$Key,
    [object]$Value
  )
  if ($Map.ContainsKey($Key)) {
    $Map[$Key] = $Value
  } else {
    $Map.Add($Key, $Value)
  }
}

function ConvertTo-JsLiteral {
  param([object]$Value)
  return ($Value | ConvertTo-Json -Depth 30 -Compress)
}

if ($OutputPath -eq "") {
  if ($SiteRoot -eq "") {
    throw "Specificare -SiteRoot oppure -OutputPath."
  }
  $OutputPath = Join-Path $SiteRoot "persjs\fcmSoglieRecordConfigPlus.js"
}

$cartellePath = Join-Path $ConfigRoot "LCS_conf_cartelle.txt"
$competizioniPath = Join-Path $ConfigRoot "LCS_conf_competizioni.txt"
$squadrePath = Join-Path $ConfigRoot "LCS_conf_squadre.txt"
$palmaresPath = Join-Path $ConfigRoot "LCS_conf_palmares.txt"

$cartelleRows = Read-ConfigCsvLines $cartellePath @("Stagione","SquadreSalve","ArchivioFcm","CartellaSito")
$competizioniRows = Read-ConfigCsvLines $competizioniPath @("Stagione","IdCompetizioneStagione","IdCompetizioneAlbo","NomeCompetizione")
$squadreRows = Read-ConfigCsvLines $squadrePath @("Stagione","PosizioneStagione","IdAttuale","NomeAttuale","Allenatore")
$palmaresRows = @()
if (Test-Path -LiteralPath $palmaresPath) {
  $palmaresRows = Read-ConfigCsvLines $palmaresPath @("IdCompetizioneAlbo","Label","Icona")
}

$cartelle = @{}
foreach ($r in $cartelleRows) {
  $stag = $r.Stagione.Trim()
  if ($stag -eq "") { continue }
  $entry = [ordered]@{
    stagione = [int]$stag
    squadreSalve = [int]$r.SquadreSalve
    archivioFcm = $r.ArchivioFcm.Trim()
    cartellaSito = $r.CartellaSito.Trim()
  }
  Add-HashtableValue $cartelle $stag $entry
}

$competizioni = @{}
$competizioniAlbo = @{}
$ordineAlbo = @{}
$ordine = 1
foreach ($r in $competizioniRows) {
  $stag = $r.Stagione.Trim()
  $idStag = $r.IdCompetizioneStagione.Trim()
  $idAlbo = $r.IdCompetizioneAlbo.Trim()
  $nome = $r.NomeCompetizione.Trim()
  if ($stag -eq "" -or $idStag -eq "" -or $idAlbo -eq "") { continue }

  if (-not $competizioni.ContainsKey($stag)) { $competizioni[$stag] = @{} }
  $competizioni[$stag][$idStag] = [ordered]@{
    stagione = [int]$stag
    idCompetizioneStagione = [int]$idStag
    idCompetizioneAlbo = [int]$idAlbo
    nome = $nome
  }

  if ([int]$idAlbo -ge 0 -and -not $competizioniAlbo.ContainsKey($idAlbo)) {
    $competizioniAlbo[$idAlbo] = [ordered]@{
      idCompetizioneAlbo = [int]$idAlbo
      nome = $nome
      ordine = $ordine
    }
    $ordineAlbo[$idAlbo] = $ordine
    $ordine++
  }
}

$palmares = @{}
foreach ($r in $palmaresRows) {
  $id = $r.IdCompetizioneAlbo.Trim()
  if ($id -eq "") { continue }
  $palmares[$id] = [ordered]@{
    idCompetizioneAlbo = [int]$id
    label = $r.Label.Trim()
    icona = $r.Icona.Trim()
  }
}

$squadre = @{}
$squadreById = @{}
foreach ($r in $squadreRows) {
  $stag = $r.Stagione.Trim()
  $pos = $r.PosizioneStagione.Trim()
  $idAtt = $r.IdAttuale.Trim()
  $nome = $r.NomeAttuale.Trim()
  if ($stag -eq "" -or $pos -eq "" -or $idAtt -eq "") { continue }

  if (-not $squadre.ContainsKey($stag)) { $squadre[$stag] = @{} }
  $entry = [ordered]@{
    stagione = [int]$stag
    posizioneStagione = [int]$pos
    idAttuale = [int]$idAtt
    nomeAttuale = $nome
    allenatore = $r.Allenatore.Trim()
  }
  $squadre[$stag][$pos] = $entry

  if ([int]$idAtt -ge 0 -and -not $squadreById.ContainsKey($idAtt)) {
    $squadreById[$idAtt] = [ordered]@{
      idAttuale = [int]$idAtt
      nomeAttuale = $nome
    }
  }
}

$generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$outDir = Split-Path -Parent $OutputPath
if ($outDir -ne "" -and -not (Test-Path -LiteralPath $outDir)) {
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$content = @()
$content += "/*"
$content += "  fcmSoglieRecordConfigPlus.js"
$content += "  Generato da GeneraSoglieRecordConfigPlus.ps1"
$content += "  Data generazione: $generatedAt"
$content += "  Fonte config: $ConfigRoot"
$content += "*/"
$content += ""
$content += "var SRP_CONFIG_PLUS_VERSION = '1.2.0';"
$content += "var SRP_CONFIG_PLUS_GENERATED_AT = '$generatedAt';"
$content += "var SRP_CARTELLE = $(ConvertTo-JsLiteral $cartelle);"
$content += "var SRP_COMPETIZIONI = $(ConvertTo-JsLiteral $competizioni);"
$content += "var SRP_COMPETIZIONI_ALBO = $(ConvertTo-JsLiteral $competizioniAlbo);"
$content += "var SRP_PALMARES = $(ConvertTo-JsLiteral $palmares);"
$content += "var SRP_SQUADRE = $(ConvertTo-JsLiteral $squadre);"
$content += "var SRP_SQUADRE_BY_ID = $(ConvertTo-JsLiteral $squadreById);"
$content += ""

Set-Content -LiteralPath $OutputPath -Value $content -Encoding UTF8
Write-Host "Generato: $OutputPath"
Write-Host "Cartelle: $($cartelle.Count)"
Write-Host "Competizioni stagione: $($competizioni.Count) stagioni"
Write-Host "Competizioni albo: $($competizioniAlbo.Count)"
Write-Host "Squadre: $($squadreById.Count) identita attuali"
