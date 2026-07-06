# Istruzioni di installazione - Record Soglie per ConfrontiStorici

Questa guida spiega come installare le nuove pagine Record Soglie su un sito Fantacalcio Manager gia' generato con ConfrontiStorici 3.x.

---

## 1. Prerequisiti

Serve avere gia' installato e funzionante:

```text
ConfrontiStorici 3.x
```

La prova pratica e' che nella cartella del sito deve esistere:

```text
<ROOT_SITO>\persjs\fcmConfrontiDati.js
```

Il file deve contenere:

```javascript
var arrConfronti = new Array()
```

Senza ConfrontiStorici 3.x e senza `arrConfronti`, queste pagine non possono funzionare.

---

## 2. Dove mettere i file

### File JavaScript

I file JS devono stare nella cartella `persjs` del sito:

```text
<ROOT_SITO>\persjs\fcmSoglieRecordFunzioni.js
<ROOT_SITO>\persjs\fcmSoglieRecordVisteV2.js
```

### File HTML

I file HTML devono stare nella root del sito:

```text
<ROOT_SITO>\soglieRecordStagioneV2.htm
<ROOT_SITO>\soglieRecordStoricoV2.htm
```

Esempio per la stagione 2025:

```text
E:\fantacalcio\Lega2025\persjs\fcmSoglieRecordFunzioni.js
E:\fantacalcio\Lega2025\persjs\fcmSoglieRecordVisteV2.js
E:\fantacalcio\Lega2025\soglieRecordStagioneV2.htm
E:\fantacalcio\Lega2025\soglieRecordStoricoV2.htm
```

---

## 3. Backup prima dell'installazione

Apri PowerShell e imposta la root del sito:

```powershell
$root = "E:\fantacalcio\Lega2025"
```

Crea backup dei file eventualmente gia' presenti:

```powershell
Copy-Item "$root\persjs\fcmSoglieRecordFunzioni.js" "$root\persjs\fcmSoglieRecordFunzioni.js.bak" -ErrorAction SilentlyContinue
Copy-Item "$root\persjs\fcmSoglieRecordVisteV2.js" "$root\persjs\fcmSoglieRecordVisteV2.js.bak" -ErrorAction SilentlyContinue
Copy-Item "$root\soglieRecordStagioneV2.htm" "$root\soglieRecordStagioneV2.htm.bak" -ErrorAction SilentlyContinue
Copy-Item "$root\soglieRecordStoricoV2.htm" "$root\soglieRecordStoricoV2.htm.bak" -ErrorAction SilentlyContinue
```

---

## 4. Creazione/apertura file in Notepad++

Apri i file da creare o sostituire:

```powershell
notepad++ "$root\persjs\fcmSoglieRecordFunzioni.js"
notepad++ "$root\persjs\fcmSoglieRecordVisteV2.js"
notepad++ "$root\soglieRecordStagioneV2.htm"
notepad++ "$root\soglieRecordStoricoV2.htm"
```

Incolla il codice corrispondente in ogni file.

---

## 5. Ordine di caricamento negli HTML

Gli HTML devono caricare gli script in questo ordine:

```html
<script src="persjs/fcmSoglieRecordFunzioni.js" type="text/javascript"></script>
<script src="persjs/fcmConfrontiDati.js" type="text/javascript"></script>
<script src="persjs/fcmSoglieRecordVisteV2.js" type="text/javascript"></script>
```

Non invertire l'ordine.

---

## 6. Apertura delle pagine

Apri le pagine:

```powershell
Start-Process "$root\soglieRecordStagioneV2.htm"
Start-Process "$root\soglieRecordStoricoV2.htm"
```

Poi nel browser fai:

```text
CTRL + F5
```

per forzare il refresh ed evitare cache vecchia dei file JS.

---

## 7. Uso della pagina stagione

Apri:

```text
soglieRecordStagioneV2.htm
```

Filtri disponibili:

```text
Stagione
Competizione
Record
Squadra
Mostra 1 / 3 / 5 / 10 / 20 / 30 / tutti
```

Schede:

```text
Dettaglio record
Riepilogo numerico
```

### Dettaglio record

Mostra i record gara per gara.

Ogni riga contiene:

```text
Tipo record
Stagione
Data
Competizione
Giornata cliccabile
Squadra
Avversario
Punti/Reale
Risultato cliccabile
A campi invertiti
Effetto
Nota
```

### Riepilogo numerico

Mostra impatto complessivo, per competizione e per squadra.

Include:

```text
Botte di culo
Fantozzi
Saldo fortuna/sfortuna
Fattore campo decisivo
Soglie precise
```

---

## 8. Uso della pagina storico

Apri:

```text
soglieRecordStoricoV2.htm
```

Filtri disponibili:

```text
Competizione
Record/classifica
Squadre: solo attuali / tutte
Mostra 1 / 3 / 5 / 10 / 20 / 30 / tutti
```

Schede:

```text
Classifiche aggregate
Riepilogo numerico
```

Il filtro `Record/classifica` include anche:

```text
Tutti
```

Se selezioni `Tutti`, vengono mostrate tutte le classifiche, ognuna con il limite scelto.

---

## 9. Competizioni disponibili

Le competizioni principali vengono mostrate con questi nomi e in questo ordine:

```text
Tutte le competizioni
Serie A
Serie B
Serie C
Coppa Serie A
Coppa Serie B
Coppa Serie C
Coppa tra le Coppe
Europa Pipps
Supercoppa Serie A
Supercoppa Serie B
Supercoppa Serie C
Altre competizioni
```

Tutto cio' che non rientra nella mappa principale viene aggregato in:

```text
Altre competizioni
```

---

## 10. Link ai tabellini

I link puntano alla giornata/tabellino tramite:

```text
../<cartella_stagione>/ris.<estensione>?Gio=<giornata>
```

Di default l'estensione e':

```javascript
php
```

Se il sito usa `ris.htm`, apri:

```text
<ROOT_SITO>\persjs\fcmSoglieRecordFunzioni.js
```

cerca:

```javascript
var SOG_REP_EXT = "php";
```

sostituisci con:

```javascript
var SOG_REP_EXT = "htm";
```

---

## 11. Risoluzione problemi

### Pagina bianca

Controlla che i file esistano nei percorsi giusti:

```text
persjs/fcmSoglieRecordFunzioni.js
persjs/fcmConfrontiDati.js
persjs/fcmSoglieRecordVisteV2.js
```

Controlla l'ordine degli script negli HTML.

Apri gli strumenti sviluppatore del browser con:

```text
F12
```

Scheda:

```text
Console
```

### Compare Errore JavaScript rosso

Le pagine V2 mostrano un errore nella pagina se qualcosa va storto.

Esempi:

```text
Errore JavaScript: SogRepAnalizza is not defined
```

Significa che manca o non e' stato caricato:

```text
fcmSoglieRecordFunzioni.js
```

Esempio:

```text
Errore JavaScript: arrConfronti is undefined
```

Significa che manca o non e' stato caricato:

```text
fcmConfrontiDati.js
```

### I filtri non si popolano

Probabile problema nel caricamento di `fcmConfrontiDati.js`.

Verifica che il percorso sia corretto:

```text
persjs/fcmConfrontiDati.js
```

### I link ai risultati non funzionano

Verifica se il sito usa:

```text
ris.php
```

oppure:

```text
ris.htm
```

Correggi `SOG_REP_EXT` nel file base.

### Vedo dati vecchi

Fai:

```text
CTRL + F5
```

oppure svuota la cache del browser.

---

## 12. Disinstallazione

Per rimuovere la feature basta eliminare:

```text
<ROOT_SITO>\persjs\fcmSoglieRecordFunzioni.js
<ROOT_SITO>\persjs\fcmSoglieRecordVisteV2.js
<ROOT_SITO>\soglieRecordStagioneV2.htm
<ROOT_SITO>\soglieRecordStoricoV2.htm
```

Non viene toccato il plugin originale.

---

## 13. Checklist finale

Prima di considerare l'installazione completata, verifica:

```text
[ ] ConfrontiStorici 3.x genera correttamente fcmConfrontiDati.js
[ ] fcmSoglieRecordFunzioni.js e' in persjs
[ ] fcmSoglieRecordVisteV2.js e' in persjs
[ ] soglieRecordStagioneV2.htm e' nella root del sito
[ ] soglieRecordStoricoV2.htm e' nella root del sito
[ ] La pagina stagione si apre
[ ] La pagina storico si apre
[ ] I filtri competizione mostrano nomi leggibili
[ ] I tabellini sono cliccabili
[ ] Il riepilogo numerico mostra anche Botte di culo/Fantozzi
[ ] Con Top N i pari merito vengono inclusi
```
