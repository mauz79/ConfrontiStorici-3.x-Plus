# ConfrontiStorici 3.x Plus - Record Soglie

Modulo aggiuntivo non ufficiale per **ConfrontiStorici 3.x**, plugin per Fantacalcio Manager.

Questa estensione aggiunge nuove viste statistiche basate sui dati gia' generati da ConfrontiStorici, senza modificare il plugin originale.

## Credits

**ConfrontiStorici 3.4** e' il plugin originale per Fantacalcio Manager sviluppato da **Lukesky (L.T.)**.

Questo progetto, **ConfrontiStorici 3.x Plus - Record Soglie**, e' un modulo aggiuntivo non ufficiale creato e mantenuto da **mauz79**.

Il progetto Plus non sostituisce ConfrontiStorici e non contiene il plugin originale: usa gli output JavaScript prodotti da ConfrontiStorici per generare nuove classifiche e nuove visualizzazioni.

## Cosa aggiunge

Il modulo aggiunge due nuove pagine HTML:

- `soglieRecordStagioneV2.htm`
- `soglieRecordStoricoV2.htm`

piu' due file JavaScript:

- `persjs/fcmSoglieRecordFunzioni.js`
- `persjs/fcmSoglieRecordVisteV2.js`

Le nuove viste calcolano record e riepiloghi su:

- Botte di culo / indice fortuna
- Sindrome di Fantozzi / indice sfortuna
- Vittorie chirurgiche
- Pareggi miracolati
- Sconfitte beffa
- Pareggi stretti
- Soglie precise
- Spreco punti
- Fattore campo decisivo
- Riepiloghi numerici per stagione, competizione e squadra
- Classifiche storiche con filtro squadre attuali / tutte
- Dettaglio gare con link ai tabellini del sito

## Requisiti

Serve un sito Fantacalcio Manager con **ConfrontiStorici 3.x** gia' installato e funzionante.

In particolare, nella cartella `persjs` del sito deve essere presente il file generato da ConfrontiStorici:

```text
<ROOT_SITO>\persjs\fcmConfrontiDati.js
```

Il modulo legge principalmente l'array `arrConfronti` prodotto da ConfrontiStorici.

## Struttura della repository

```text
ConfrontiStorici-3.x-Plus/
|
|-- README.md
|
|-- docs/
|   |-- RecordSoglie_INSTALLAZIONE.md
|   `-- RecordSoglie_WALKTHROUGH_COMPLETO.md
|
`-- dist/
    |-- soglieRecordStagioneV2.htm
    |-- soglieRecordStoricoV2.htm
    `-- persjs/
        |-- fcmSoglieRecordFunzioni.js
        `-- fcmSoglieRecordVisteV2.js
```

## Installazione rapida

Copiare i file JavaScript:

```text
dist\persjs\fcmSoglieRecordFunzioni.js
dist\persjs\fcmSoglieRecordVisteV2.js
```

nella cartella:

```text
<ROOT_SITO>\persjs\
```

Copiare le pagine HTML:

```text
dist\soglieRecordStagioneV2.htm
dist\soglieRecordStoricoV2.htm
```

nella root del sito:

```text
<ROOT_SITO>\
```

Esempio:

```text
E:\fantacalcio\Lega2025\persjs\fcmSoglieRecordFunzioni.js
E:\fantacalcio\Lega2025\persjs\fcmSoglieRecordVisteV2.js

E:\fantacalcio\Lega2025\soglieRecordStagioneV2.htm
E:\fantacalcio\Lega2025\soglieRecordStoricoV2.htm
```

Poi aprire nel browser:

```text
<ROOT_SITO>\soglieRecordStagioneV2.htm
<ROOT_SITO>\soglieRecordStoricoV2.htm
```

## Come funziona

Il modulo non legge direttamente i database `.fcm` e non modifica il plugin originale.

La logica e':

1. ConfrontiStorici genera i suoi normali output nella cartella `persjs`.
2. Questo modulo carica `fcmConfrontiDati.js`.
3. Le nuove funzioni leggono `arrConfronti`.
4. Le pagine Plus calcolano nuove classifiche e riepiloghi.

## Pagine disponibili

### `soglieRecordStagioneV2.htm`

Vista per singola stagione, con filtri per:

- stagione
- competizione
- tipo record
- squadra
- numero record da mostrare

Mostra:

- dettaglio gara per gara
- riepilogo numerico
- link ai tabellini del sito

### `soglieRecordStoricoV2.htm`

Vista storica aggregata, con filtri per:

- competizione
- record/classifica
- solo squadre attuali / tutte le squadre
- numero di risultati da mostrare

Mostra:

- classifiche aggregate
- riepilogo numerico storico

## Regole principali implementate

### Vittoria chirurgica

Vittoria di un solo gol con squadra esattamente sulla soglia e avversario a -0,5 dalla stessa soglia.

Esempi:

```text
66 - 65,5 = 1-0
72 - 71,5 = 2-1
77 - 76,5 = 3-2
```

### Pareggio miracolato

Pareggio ottenuto da chi raggiunge esattamente la propria soglia, mentre l'avversario, pur facendo piu' punti, manca la soglia successiva per 0,5.

### Sconfitta beffa

Sconfitta di un solo gol con avversario esatto sulla soglia e squadra a -0,5 dalla stessa soglia.

### Pareggio stretto

Pareggio subito da chi fa piu' punti, resta a -0,5 dalla soglia successiva e trova l'avversario sulla propria soglia.

### Soglia precisa

Prestazione chiusa esattamente su una soglia gol.

Soglie usate:

```text
66, 72, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113
```

### Fattore campo decisivo

Partita in cui il bonus casa cambia il risultato rispetto alla simulazione a campi invertiti.

La simulazione usa:

```text
casa originale - 1
trasferta originale + 1
```

## Note sulle competizioni

Le competizioni principali sono normalizzate cosi':

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

Le competizioni non riconosciute vengono aggregate in **Altre competizioni**.

## Stato del progetto

Prima release pubblica: **v1.0.0**.

Il modulo e' pensato come estensione leggera e non invasiva: il plugin originale resta intatto.

## Licenza e responsabilita'

Questo progetto e' distribuito come modulo aggiuntivo non ufficiale. Verificare la compatibilita' con la propria installazione di Fantacalcio Manager e ConfrontiStorici prima dell'uso in produzione.
