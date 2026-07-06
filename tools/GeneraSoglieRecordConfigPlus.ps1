param(
  [Parameter(Mandatory=$true)]
  [string]$ConfigRoot,

  [Parameter(Mandatory=$true)]
  [string]$SiteRoot,

  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"

$ScriptVersion = "v1.2.0-fix3-manuale"

function Clean-Value {
  param($Value)

  if ($null -eq $Value) {
    return ""
  }

  return ([string]$Value).Trim()
}

function To-IntOrNull {
  param($Value)

  $s = Clean-Value $Value

  if ($s -eq "") {
    return $null
  }

  $n = 0
  if ([int]::TryParse($s, [ref]$n)) {
    return $n
  }

  return $null
}

function Add-HashtableValue {
  param(
    [hashtable]$Table,
    [string]$Key,
    $Value
  )

  if ($Key -eq "") {
    return
  }

  $Table[$Key] = $Value
}

function Read-LcsRows {
  param(
    [string]$Path,
    [string[]]$Headers
  )

  if (!(Test-Path $Path)) {
    throw "File non trovato: $Path"
  }

  $rows = @()
  $lineNo = 0

  Get-Content -Path $Path -Encoding Default | ForEach-Object {
    $lineNo++
    $line = [string]$_
    $trim = $line.Trim()

    if ($trim -eq "") {
      return
    }

    if ($trim.StartsWith("*")) {
      return
    }

    try {
      $parsed = ConvertFrom-Csv -InputObject $line -Header $Headers
      $rows += $parsed
    }
    catch {
      Write-Warning "Riga ignorata in $Path alla riga ${lineNo}: $line"
    }
  }

  return $rows
}

function Ensure-Directory {
  param([string]$Path)

  if (!(Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Json-Escape-For-Js {
  param([string]$Json)

  if ($null -eq $Json) {
    return "{}"
  }

  return $Json
}

$configCartelle = Join-Path $ConfigRoot "LCS_conf_cartelle.txt"
$configCompetizioni = Join-Path $ConfigRoot "LCS_conf_competizioni.txt"
$configPalmares = Join-Path $ConfigRoot "LCS_conf_palmares.txt"
$configSquadre = Join-Path $ConfigRoot "LCS_conf_squadre.txt"

$cartelle = [ordered]@{}
$competizioni = [ordered]@{}
$competizioniAlbo = [ordered]@{}
$palmares = [ordered]@{}
$squadre = [ordered]@{}
$squadreById = [ordered]@{}

# ------------------------------------------------------------
# Cartelle stagioni
# Formato:
# Stagione, Squadre Salve, Nome Archivio FCM, Cartella Sito su Server
# Esempio manuale ammesso:
# 01,-1, ,
# ------------------------------------------------------------

$rowsCartelle = Read-LcsRows -Path $configCartelle -Headers @(
  "Stagione",
  "SquadreSalve",
  "ArchivioFcm",
  "CartellaSito"
)

foreach ($r in $rowsCartelle) {
  $stagione = Clean-Value $r.Stagione

  if ($stagione -eq "") {
    continue
  }

  $squadreSalve = To-IntOrNull $r.SquadreSalve
  $archivioFcm = Clean-Value $r.ArchivioFcm
  $cartellaSito = Clean-Value $r.CartellaSito

  $isManuale = $false

  if ($archivioFcm -eq "" -or $cartellaSito -eq "") {
    $isManuale = $true
  }

  $entry = [ordered]@{
    stagione = $stagione
    squadreSalve = $squadreSalve
    archivioFcm = $archivioFcm
    cartella = $cartellaSito
    manuale = $isManuale
  }

  Add-HashtableValue -Table $cartelle -Key $stagione -Value $entry
}

# ------------------------------------------------------------
# Competizioni
# Formato:
# Stagione, Id Competizione in stagione, Id Competizione in Albo D'Oro, Nome Competizione
# ------------------------------------------------------------

$rowsCompetizioni = Read-LcsRows -Path $configCompetizioni -Headers @(
  "Stagione",
  "IdCompetizioneStagione",
  "IdCompetizioneAlbo",
  "NomeCompetizione"
)

foreach ($r in $rowsCompetizioni) {
  $stagione = Clean-Value $r.Stagione
  $idStagionale = To-IntOrNull $r.IdCompetizioneStagione
  $idAlbo = To-IntOrNull $r.IdCompetizioneAlbo
  $nome = Clean-Value $r.NomeCompetizione

  if ($stagione -eq "" -or $null -eq $idStagionale) {
    continue
  }

  if (!$competizioni.Contains($stagione)) {
    $competizioni[$stagione] = [ordered]@{}
  }

  $entry = [ordered]@{
    stagione = $stagione
    idStagionale = $idStagionale
    idAlbo = $idAlbo
    nome = $nome
  }

  $competizioni[$stagione][[string]$idStagionale] = $entry

  if ($null -ne $idAlbo -and $idAlbo -gt 0) {
    $idAlboKey = [string]$idAlbo

    if (!$competizioniAlbo.Contains($idAlboKey)) {
      $competizioniAlbo[$idAlboKey] = [ordered]@{
        idAlbo = $idAlbo
        nome = $nome
      }
    }
  }
}

# ------------------------------------------------------------
# Palmares
# Formato:
# IdCompetizioneAlbo, Label, Icona
# ------------------------------------------------------------

$rowsPalmares = Read-LcsRows -Path $configPalmares -Headers @(
  "IdCompetizioneAlbo",
  "Label",
  "Icona"
)

foreach ($r in $rowsPalmares) {
  $idAlbo = To-IntOrNull $r.IdCompetizioneAlbo
  $label = Clean-Value $r.Label
  $icona = Clean-Value $r.Icona

  if ($null -eq $idAlbo) {
    continue
  }

  if ($idAlbo -le 0) {
    continue
  }

  $entry = [ordered]@{
    idAlbo = $idAlbo
    label = $label
    icona = $icona
  }

  $palmares[[string]$idAlbo] = $entry

  if (!$competizioniAlbo.Contains([string]$idAlbo)) {
    $competizioniAlbo[[string]$idAlbo] = [ordered]@{
      idAlbo = $idAlbo
      nome = $label
    }
  }
}

# ------------------------------------------------------------
# Squadre
# Formato:
# Stagione, Posizione in Stagione, Posizione attuale in albo d'oro,
# Nome Attuale in Albo D'oro, Nome Allenatore
# ------------------------------------------------------------

$rowsSquadre = Read-LcsRows -Path $configSquadre -Headers @(
  "Stagione",
  "PosizioneStagione",
  "IdAttuale",
  "NomeAttuale",
  "Allenatore"
)

foreach ($r in $rowsSquadre) {
  $stagione = Clean-Value $r.Stagione
  $posizioneStagione = To-IntOrNull $r.PosizioneStagione
  $idAttuale = To-IntOrNull $r.IdAttuale
  $nomeAttuale = Clean-Value $r.NomeAttuale
  $allenatore = Clean-Value $r.Allenatore

  if ($stagione -eq "" -or $null -eq $posizioneStagione) {
    continue
  }

  if (!$squadre.Contains($stagione)) {
    $squadre[$stagione] = [ordered]@{}
  }

  $entry = [ordered]@{
    stagione = $stagione
    posizioneStagione = $posizioneStagione
    idAttuale = $idAttuale
    nomeAttuale = $nomeAttuale
    allenatore = $allenatore
  }

  $squadre[$stagione][[string]$posizioneStagione] = $entry

  if ($null -ne $idAttuale -and $idAttuale -gt 0) {
    $idKey = [string]$idAttuale

    if (!$squadreById.Contains($idKey)) {
      $squadreById[$idKey] = [ordered]@{
        idAttuale = $idAttuale
        nomeAttuale = $nomeAttuale
        stagioni = @()
      }
    }

    $arr = @($squadreById[$idKey].stagioni)
    if ($arr -notcontains $stagione) {
      $arr += $stagione
      $squadreById[$idKey].stagioni = $arr
    }
  }
}

# ------------------------------------------------------------
# Output
# ------------------------------------------------------------

if ($OutputPath -eq "") {
  $persjs = Join-Path $SiteRoot "persjs"
  Ensure-Directory $persjs
  $OutputPath = Join-Path $persjs "fcmSoglieRecordConfigPlus.js"
}
else {
  $outDir = Split-Path -Path $OutputPath -Parent
  if ($outDir -ne "") {
    Ensure-Directory $outDir
  }
}

$payload = [ordered]@{
  versione = $ScriptVersion
  generatoIl = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  note = "File generato da GeneraSoglieRecordConfigPlus.ps1. Non modificare a mano."
  sorgenti = [ordered]@{
    configRoot = $ConfigRoot
    siteRoot = $SiteRoot
    cartelle = $configCartelle
    competizioni = $configCompetizioni
    palmares = $configPalmares
    squadre = $configSquadre
  }
  cartelle = $cartelle
  competizioni = $competizioni
  competizioniAlbo = $competizioniAlbo
  palmares = $palmares
  squadre = $squadre
  squadreById = $squadreById
}

$json = $payload | ConvertTo-Json -Depth 100
$json = Json-Escape-For-Js $json

$out = @()
$out += "// ============================================================"
$out += "// ConfrontiStorici Plus - Record Soglie - Config Plus"
$out += "// Versione generatore: $ScriptVersion"
$out += "// Generato il: $((Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))"
$out += "//"
$out += "// Questo file e' generato dai file di configurazione LCS_conf_*."
$out += "// Non modificarlo a mano: rigenerarlo quando cambia la config."
$out += "// ============================================================"
$out += ""
$out += "var SRP_CONFIG_PLUS_VERSION = `"$ScriptVersion`";"
$out += "var SRP_CONFIG_PLUS = $json;"
$out += ""
$out += "var SRP_CARTELLE = SRP_CONFIG_PLUS.cartelle || {};"
$out += "var SRP_COMPETIZIONI = SRP_CONFIG_PLUS.competizioni || {};"
$out += "var SRP_COMPETIZIONI_ALBO = SRP_CONFIG_PLUS.competizioniAlbo || {};"
$out += "var SRP_PALMARES = SRP_CONFIG_PLUS.palmares || {};"
$out += "var SRP_SQUADRE = SRP_CONFIG_PLUS.squadre || {};"
$out += "var SRP_SQUADRE_BY_ID = SRP_CONFIG_PLUS.squadreById || {};"

Set-Content -Path $OutputPath -Value $out -Encoding UTF8

Write-Host ""
Write-Host "Config Plus generato correttamente."
Write-Host "Versione: $ScriptVersion"
Write-Host "Output: $OutputPath"
Write-Host ""
Write-Host ("Cartelle: " + $cartelle.Count)
Write-Host ("Stagioni competizioni: " + $competizioni.Count)
Write-Host ("Competizioni albo: " + $competizioniAlbo.Count)
Write-Host ("Palmares: " + $palmares.Count)
Write-Host ("Stagioni squadre: " + $squadre.Count)
Write-Host ("Squadre albo: " + $squadreById.Count)
Write-Host ""