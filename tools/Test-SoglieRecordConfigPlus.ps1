param(
  [Parameter(Mandatory=$true)]
  [string]$ConfigPlusPath
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $ConfigPlusPath)) {
  throw "File non trovato: $ConfigPlusPath"
}

$content = Get-Content -Path $ConfigPlusPath -Raw -Encoding UTF8

if ($content -notmatch 'var\s+SRP_CONFIG_PLUS\s*=\s*(\{[\s\S]*?\});') {
  throw "Impossibile trovare var SRP_CONFIG_PLUS nel file: $ConfigPlusPath"
}

$json = $Matches[1]
$config = $json | ConvertFrom-Json

Write-Host ""
Write-Host "Test Config Plus"
Write-Host "================"
Write-Host ""

Write-Host ("File: " + $ConfigPlusPath)
Write-Host ("Versione: " + $config.versione)
Write-Host ("Generato il: " + $config.generatoIl)
Write-Host ""

$cartelleCount = 0
$competizioniStagioniCount = 0
$competizioniAlboCount = 0
$palmaresCount = 0
$squadreStagioniCount = 0
$squadreAlboCount = 0

if ($config.cartelle) {
  $cartelleCount = ($config.cartelle.PSObject.Properties | Measure-Object).Count
}

if ($config.competizioni) {
  $competizioniStagioniCount = ($config.competizioni.PSObject.Properties | Measure-Object).Count
}

if ($config.competizioniAlbo) {
  $competizioniAlboCount = ($config.competizioniAlbo.PSObject.Properties | Measure-Object).Count
}

if ($config.palmares) {
  $palmaresCount = ($config.palmares.PSObject.Properties | Measure-Object).Count
}

if ($config.squadre) {
  $squadreStagioniCount = ($config.squadre.PSObject.Properties | Measure-Object).Count
}

if ($config.squadreById) {
  $squadreAlboCount = ($config.squadreById.PSObject.Properties | Measure-Object).Count
}

Write-Host ("Cartelle stagioni: " + $cartelleCount)
Write-Host ("Stagioni con competizioni: " + $competizioniStagioniCount)
Write-Host ("Competizioni albo: " + $competizioniAlboCount)
Write-Host ("Palmares: " + $palmaresCount)
Write-Host ("Stagioni con squadre: " + $squadreStagioniCount)
Write-Host ("Squadre albo: " + $squadreAlboCount)
Write-Host ""

Write-Host "Controlli campione"
Write-Host "------------------"

if ($config.cartelle.'21') {
  Write-Host ("Stagione 21 cartella: " + $config.cartelle.'21'.cartella)
}
else {
  Write-Warning "Stagione 21 non trovata in cartelle."
}

if ($config.competizioniAlbo.'19') {
  Write-Host ("Competizione albo 19: " + $config.competizioniAlbo.'19'.nome)
}
else {
  Write-Warning "Competizione albo 19 non trovata."
}

if ($config.competizioniAlbo.'63') {
  Write-Host ("Competizione albo 63: " + $config.competizioniAlbo.'63'.nome)
}
else {
  Write-Warning "Competizione albo 63 non trovata."
}

if ($config.squadreById.'201') {
  Write-Host ("Squadra albo 201: " + $config.squadreById.'201'.nomeAttuale)
}
else {
  Write-Warning "Squadra albo 201 non trovata."
}

if ($config.squadreById.'230') {
  Write-Host ("Squadra albo 230: " + $config.squadreById.'230'.nomeAttuale)
}
else {
  Write-Warning "Squadra albo 230 non trovata."
}

Write-Host ""
Write-Host "Esito: Config Plus leggibile."
Write-Host ""