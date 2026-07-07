$ErrorActionPreference = "Stop"

$repo = "D:\DEV_APPS\ConfrontiStorici-3.x-Plus"
Set-Location $repo

$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $repo "backup_docs_culometro_$ts"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$files = @(
  ".\README.md",
  ".\docs\ConfrontiStoriciPlus_HANDOFF.md",
  ".\docs\RecordSoglie_WALKTHROUGH_COMPLETO.md"
)

foreach ($f in $files) {
  if (Test-Path $f) {
    Copy-Item $f (Join-Path $backupDir ([IO.Path]::GetFileName($f))) -Force
  } else {
    throw "File mancante: $f"
  }
}

function Set-MarkedSection {
  param(
    [string]$Path,
    [string]$StartMarker,
    [string]$EndMarker,
    [string]$Section
  )

  $text = Get-Content $Path -Raw
  $pattern = [regex]::Escape($StartMarker) + "(?s).*?" + [regex]::Escape($EndMarker)
  $replacement = $StartMarker + "`r`n" + $Section.Trim() + "`r`n" + $EndMarker

  if ($text -match $pattern) {
    $text = [regex]::Replace($text, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $replacement })
  } else {
    $text = $text.TrimEnd() + "`r`n`r`n" + $replacement + "`r`n"
  }

  Set-Content -Path $Path -Value $text -Encoding UTF8
}

$readmeSection = @'
## Culometro Plus

Il progetto include anche il modulo **Culometro Plus**:

```text
culometroPlus.htm
persjs\fcmCulometroPlus.js
persjs\fcmCulometroPlusConfig.js
```

Il Culometro Plus misura quanto una squadra sia stata favorita o penalizzata da episodi rari e decisivi: vittorie chirurgiche, sconfitte beffa, corto muso, pareggi miracolati, soglie prese o mancate per mezzo punto e fattore campo determinante.

L'indice finale e' espresso su scala **0-100**:

```text
50,00 = equilibrio tra fortuna e sfortuna
> 50  = prevalenza di episodi favorevoli
< 50  = prevalenza di episodi contrari
```

Il calcolo lavora per **prestazione squadra**, non per singola riga record. Ogni partita produce due prestazioni, una per la squadra di casa e una per la squadra fuori. Ogni prestazione viene classificata con un algoritmo a cascata: il motore parte dagli eventi piu' rari e pesanti e scende verso quelli piu' comuni. In questo modo una partita come `66,0 - 65,5` non viene contata quattro volte, ma viene riconosciuta come un unico evento principale ad alta intensita'.

Il punteggio di ogni evento dipende da:

```text
- livello dell'evento, da Tier S a Tier D
- rarita' storica dell'evento
- configurazione specifica dei punteggi
- impatto sportivo sul risultato
- normalizzazione per partite giocate
```

La rarita' viene calcolata sullo storico globale delle prestazioni squadra disponibili in `fcmConfrontiDati.js`. Il valore finale della singola squadra viene poi rapportato alle partite giocate, per rendere confrontabili squadre con molte stagioni e squadre con poche presenze.

I pesi principali non sono nel motore, ma nel file separato:

```text
persjs\fcmCulometroPlusConfig.js
```

Da questo file si possono calibrare:

```text
kScala
pesoRaritaMax
pesoConfigBlend
rarita
pesoTier
pesoImpatto
fasce
```

Regola pratica:

```text
kScala piu' basso = valori piu' estremi
kScala piu' alto = valori piu' compressi verso 50
pesoRaritaMax piu' alto = eventi rarissimi piu' pesanti
pesoConfigBlend piu' alto = configurazioni specifiche tipo 66,0-65,5 piu' pesanti
```

Le etichette della scala sono configurabili nel file config. La versione attuale usa fasce goliardiche coerenti con la pagina `culometroPlus.htm`.
'@

$handoffSection = @'
## Culometro Plus - stato consolidato

Modulo aggiunto:

```text
dist\culometroPlus.htm
dist\persjs\fcmCulometroPlus.js
dist\persjs\fcmCulometroPlusConfig.js
```

Copia sito locale attesa:

```text
E:\fantacalcio\Lega2025\culometroPlus.htm
E:\fantacalcio\Lega2025\persjs\fcmCulometroPlus.js
E:\fantacalcio\Lega2025\persjs\fcmCulometroPlusConfig.js
```

Il Culometro Plus e' una vista separata HTML + JS. Non modifica il plugin originale ConfrontiStorici, non modifica JAR/EXE e legge i dati gia' presenti in `persjs\fcmConfrontiDati.js`.

### Ordine script

La pagina deve caricare gli script in questo ordine:

```html
<script src="persjs/fcmSoglieRecordFunzioni.js" type="text/javascript"></script>
<script src="persjs/fcmConfrontiDati.js" type="text/javascript"></script>
<script src="persjs/fcmSoglieRecordConfigPlus.js" type="text/javascript"></script>
<script src="persjs/fcmSoglieRecordVisteV2.js" type="text/javascript"></script>
<script src="persjs/fcmCulometroPlusConfig.js" type="text/javascript"></script>
<script src="persjs/fcmCulometroPlus.js" type="text/javascript"></script>
```

L'ordine e' importante: `fcmConfrontiDati.js` usa costruttori definiti nel file funzioni; il Culometro usa funzioni e dati gia' disponibili nel progetto Plus.

### Scelte di calcolo

Decisioni consolidate:

```text
- unita' di calcolo = prestazione squadra
- una partita = due prestazioni squadra
- ogni prestazione riceve al massimo una etichetta principale
- algoritmo a cascata da Tier S a Tier D
- niente somma cieca di eventi sovrapposti
- rarita' calcolata sullo storico globale delle prestazioni squadra
- normalizzazione per partite giocate
- scala 0-100 con 50,00 neutro
- in modalita' stagione l'indice principale usa la stagione selezionata
- lo storico sulle stesse competizioni e' confronto separato, non piu' miscela 60/40
```

La centratura usa il saldo medio storico globale, per evitare distribuzioni sbilanciate tutte verso fortuna o tutte verso sfortuna.

### Configurazione pesi

I pesi si modificano nel file:

```text
dist\persjs\fcmCulometroPlusConfig.js
```

Parametri principali:

```text
kScala
pesoRaritaMax
pesoConfigBlend
rarita
pesoTier
pesoImpatto
fasce
```

Non modificare il motore `fcmCulometroPlus.js` per semplice tuning dei pesi. Prima provare a calibrare il file config.

### Note operative

Per provare una modifica al config:

```powershell
cd "D:\DEV_APPS\ConfrontiStorici-3.x-Plus"

Copy-Item ".\dist\persjs\fcmCulometroPlusConfig.js" "E:\fantacalcio\Lega2025\persjs\fcmCulometroPlusConfig.js" -Force

Start-Process "E:\fantacalcio\Lega2025\culometroPlus.htm"
```

Poi fare refresh forzato nel browser con `CTRL + F5`.

Per copiare tutto il modulo nel sito:

```powershell
cd "D:\DEV_APPS\ConfrontiStorici-3.x-Plus"

Copy-Item ".\dist\culometroPlus.htm" "E:\fantacalcio\Lega2025\culometroPlus.htm" -Force
Copy-Item ".\dist\persjs\fcmCulometroPlus.js" "E:\fantacalcio\Lega2025\persjs\fcmCulometroPlus.js" -Force
Copy-Item ".\dist\persjs\fcmCulometroPlusConfig.js" "E:\fantacalcio\Lega2025\persjs\fcmCulometroPlusConfig.js" -Force
```

### Nota importante su stagioni e fasce

Il Culometro non deve inventare fasce gol o mapping stagioni.

Le fasce gol devono venire dalle funzioni reali di `fcmSoglieRecordFunzioni.js`, in particolare:

```text
SogRepGolDaPunti
SogRepASogliaPrecisa
SogRepMancaSogliaPerMezzo
```

Le stagioni non vanno lette come anni. Nei dati ConfrontiStorici `Stagione` e' il numero stagione; per mostrare l'annata corretta usare le funzioni/config gia' presenti e le cartelle tipo `lega2024`, cosi' stagione 20 diventa `2024/2025 (stagione 20)`.
'@

$walkSection = @'
## Culometro Plus - walkthrough operativo

### File del modulo

Il Culometro Plus e' composto da tre file principali:

```text
dist\culometroPlus.htm
dist\persjs\fcmCulometroPlus.js
dist\persjs\fcmCulometroPlusConfig.js
```

Nel sito locale devono essere copiati come:

```text
E:\fantacalcio\Lega2025\culometroPlus.htm
E:\fantacalcio\Lega2025\persjs\fcmCulometroPlus.js
E:\fantacalcio\Lega2025\persjs\fcmCulometroPlusConfig.js
```

### Che cosa misura

Il Culometro misura la prevalenza di episodi favorevoli o contrari rispetto alla frequenza storica globale.

La scala finale e':

```text
0,00   = sfortuna estrema
50,00  = equilibrio fortuna/sfortuna
100,00 = fortuna estrema
```

Il valore viene normalizzato sulle partite giocate dalla squadra, per evitare che squadre con molte stagioni abbiano numeri non confrontabili con squadre che hanno poche presenze.

### Algoritmo a cascata

Il motore legge ogni partita e crea due prestazioni:

```text
prestazione squadra casa
prestazione squadra fuori
```

Ogni prestazione viene classificata con una cascata di regole, dal caso piu' raro al piu' comune:

```text
Tier S = triple / leggende
Tier A = doppie / miracoli composti
Tier B = pesi massimi singoli
Tier C = eventi intermedi
Tier D = briciole / casi base
```

Appena una regola risulta vera, viene assegnata una sola etichetta principale e la prestazione viene chiusa. Questo evita che un caso tipo `66,0 - 65,5` venga contato contemporaneamente come soglia precisa, corto muso, vittoria chirurgica, giusto giusto e fattore campo.

### Componenti del punteggio

Il punteggio evento dipende da:

```text
pesoTier
pesoRaritaStorica
pesoConfigSpecifica
pesoImpattoSportivo
```

La rarita' storica viene calcolata sul totale storico delle prestazioni squadra, non solo sulla stagione selezionata.

L'impatto sportivo distingue casi diversi:

```text
sconfitta -> vittoria
pareggio -> vittoria
sconfitta -> pareggio
vittoria -> pareggio
pareggio -> sconfitta
vittoria -> sconfitta
```

Una vittoria pesa piu' di un pareggio; un pareggio salvato dal fattore campo pesa diversamente da un pareggio fuori casa contro avversario superiore; un episodio che cambia punti classifica pesa piu' di una soglia precisa non decisiva.

### Configurazione pesi

Da questa versione i pesi principali sono nel file:

```text
dist\persjs\fcmCulometroPlusConfig.js
```

Il motore `fcmCulometroPlus.js` legge il config se caricato prima nella pagina HTML.

Parametri principali:

```text
kScala
pesoRaritaMax
pesoConfigBlend
rarita
pesoTier
pesoImpatto
fasce
```

Regole di tuning:

```text
kScala piu' basso = piu' estremi
kScala piu' alto = classifica piu' compressa verso 50
pesoRaritaMax piu' alto = eventi rarissimi piu' forti
pesoConfigBlend piu' alto = configurazioni specifiche piu' pesanti
```

Per modificare solo i pesi non serve rigenerare altri file: salvare il config e copiarlo nel sito.

```powershell
cd "D:\DEV_APPS\ConfrontiStorici-3.x-Plus"

Copy-Item ".\dist\persjs\fcmCulometroPlusConfig.js" "E:\fantacalcio\Lega2025\persjs\fcmCulometroPlusConfig.js" -Force

Start-Process "E:\fantacalcio\Lega2025\culometroPlus.htm"
```

Poi nel browser usare `CTRL + F5`.

### Installazione completa nel sito

```powershell
cd "D:\DEV_APPS\ConfrontiStorici-3.x-Plus"

Copy-Item ".\dist\culometroPlus.htm" "E:\fantacalcio\Lega2025\culometroPlus.htm" -Force
Copy-Item ".\dist\persjs\fcmCulometroPlus.js" "E:\fantacalcio\Lega2025\persjs\fcmCulometroPlus.js" -Force
Copy-Item ".\dist\persjs\fcmCulometroPlusConfig.js" "E:\fantacalcio\Lega2025\persjs\fcmCulometroPlusConfig.js" -Force

Start-Process "E:\fantacalcio\Lega2025\culometroPlus.htm"
```

### Controlli dopo modifica

Dopo ogni modifica verificare:

```text
- la pagina si apre senza errori JS
- la stagione mostra l'annata corretta, es. 2024/2025 (stagione 20)
- le competizioni sono selezionabili singolarmente
- il dettaglio squadra resta chiuso finche' non si clicca "apri"
- cliccando "apri" si apre la squadra corretta
- la distribuzione non e' tutta schiacciata sugli estremi
- la distribuzione non e' tutta compressa tra 40 e 70
```

### Note da non dimenticare

Non usare `cd /d` in PowerShell. Usare:

```powershell
cd "D:\DEV_APPS\ConfrontiStorici-3.x-Plus"
```

oppure:

```powershell
Set-Location "D:\DEV_APPS\ConfrontiStorici-3.x-Plus"
```
'@

Set-MarkedSection ".\README.md" "<!-- CULOMETRO_PLUS_START -->" "<!-- CULOMETRO_PLUS_END -->" $readmeSection
Set-MarkedSection ".\docs\ConfrontiStoriciPlus_HANDOFF.md" "<!-- CULOMETRO_PLUS_HANDOFF_START -->" "<!-- CULOMETRO_PLUS_HANDOFF_END -->" $handoffSection
Set-MarkedSection ".\docs\RecordSoglie_WALKTHROUGH_COMPLETO.md" "<!-- CULOMETRO_PLUS_WALKTHROUGH_START -->" "<!-- CULOMETRO_PLUS_WALKTHROUGH_END -->" $walkSection

Write-Host "Documentazione Culometro integrata."
Write-Host "Backup creato in: $backupDir"
