# Record Soglie per ConfrontiStorici

Estensione non ufficiale per siti Fantacalcio Manager generati con **ConfrontiStorici 3.x**.

Aggiunge nuove pagine statistiche basate sui dati gia' generati da ConfrontiStorici, senza modificare il plugin originale.

---

## Funzioni principali

- Botte di culo / Indice di fortuna
- Sindrome di Fantozzi / Indice di sfortuna
- Vittorie chirurgiche
- Pareggi miracolati
- Sconfitte beffa
- Pareggi stretti
- Soglie precise / Tiratori scelti
- Spreco punti in vittorie
- Fattore campo decisivo
- Riepiloghi numerici per stagione, competizione e squadra
- Classifiche storiche aggregate
- Dettaglio gara per gara con link al tabellino

---

## Requisiti

Serve un sito Fantacalcio Manager con **ConfrontiStorici 3.x** funzionante.

Il file richiesto e':

```text
persjs/fcmConfrontiDati.js
```

Il file deve contenere l'array:

```javascript
arrConfronti
```

---

## Installazione

Copia i file JS nella cartella `persjs` del sito:

```text
<ROOT_SITO>/persjs/fcmSoglieRecordFunzioni.js
<ROOT_SITO>/persjs/fcmSoglieRecordVisteV2.js
```

Copia gli HTML nella root del sito:

```text
<ROOT_SITO>/soglieRecordStagioneV2.htm
<ROOT_SITO>/soglieRecordStoricoV2.htm
```

Esempio Windows:

```text
E:\fantacalcio\Lega2025\persjs\fcmSoglieRecordFunzioni.js
E:\fantacalcio\Lega2025\persjs\fcmSoglieRecordVisteV2.js
E:\fantacalcio\Lega2025\soglieRecordStagioneV2.htm
E:\fantacalcio\Lega2025\soglieRecordStoricoV2.htm
```

Apri poi:

```text
soglieRecordStagioneV2.htm
soglieRecordStoricoV2.htm
```

---

## Pagine incluse

### `soglieRecordStagioneV2.htm`

Vista per singola stagione.

Filtri:

- stagione
- competizione
- record
- squadra
- numero risultati

Schede:

- dettaglio record
- riepilogo numerico

### `soglieRecordStoricoV2.htm`

Vista storica aggregata.

Filtri:

- competizione
- record/classifica
- solo squadre attuali / tutte le squadre
- numero risultati

Schede:

- classifiche aggregate
- riepilogo numerico

---

## Competizioni

Le competizioni principali vengono normalizzate e mostrate con nomi leggibili:

```text
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

Le competizioni non mappate vengono aggregate in `Altre competizioni`.

---

## Definizioni dei record

### Vittoria chirurgica

Vittoria di un solo gol con squadra esattamente sulla soglia e avversario a -0,5 dalla stessa soglia.

Esempio:

```text
66 - 65,5 = 1-0
72 - 71,5 = 2-1
```

### Pareggio miracolato

Pareggio ottenuto da chi raggiunge esattamente la propria soglia mentre l'avversario, pur facendo piu punti, manca la soglia successiva per 0,5.

### Sconfitta beffa

Sconfitta di un solo gol con avversario esatto sulla soglia e squadra a -0,5 dalla stessa soglia.

### Pareggio stretto

Pareggio subito da chi fa piu punti, resta a -0,5 dalla soglia successiva e trova l'avversario esatto sulla propria soglia.

### Soglia precisa

Prestazione chiusa esattamente su una soglia gol:

```text
66, 72, 77, 81, 85, 89, ...
```

### Fattore campo decisivo

Confronta il risultato reale con una simulazione a campi invertiti:

```text
Casa -1
Trasferta +1
```

Se il risultato cambia, il fattore campo e' considerato decisivo.

---

## Link ai tabellini

Le righe di dettaglio includono link ai tabellini/giornate del sito.

Il formato e':

```text
../<cartella_stagione>/ris.<estensione>?Gio=<giornata>
```

Per cambiare estensione da `php` a `htm`, modificare nel file base:

```javascript
var SOG_REP_EXT = "php";
```

in:

```javascript
var SOG_REP_EXT = "htm";
```

---

## Sicurezza

La soluzione non modifica:

- il plugin originale;
- il JAR/EXE di ConfrontiStorici;
- i file `.fcm`;
- i dati generati da ConfrontiStorici.

Aggiunge solo file JS/HTML al sito.

---

## Licenza

Da definire.

---

## Stato

Versione V2 funzionante come vista esterna sopra ConfrontiStorici 3.x.
