# Record Soglie per ConfrontiStorici - Walkthrough tecnico completo

Versione documentata: **V2**  
Ambiente previsto: sito locale/generato da Fantacalcio Manager con plugin **ConfrontiStorici 3.x**.

Questo documento descrive in modo completo cosa e' stato implementato, perche' e' stato implementato in questo modo, quali dati usa, come calcola i record e come sono organizzati i file.

---

## 1. Obiettivo del progetto

L'obiettivo non e' riscrivere il plugin ConfrontiStorici, ne' modificare il JAR/EXE originale.

L'obiettivo e' aggiungere nuove viste statistiche sopra i dati gia' generati da ConfrontiStorici, in particolare sopra il file:

```text
<ROOT_SITO>\persjs\fcmConfrontiDati.js
```

Le nuove viste devono mostrare record legati a:

1. **Botte di culo / Indice di fortuna**
2. **Sindrome di Fantozzi / Indice di sfortuna**
3. **Soglie precise / Tiratori scelti**
4. **Spreco punti**
5. **Fattore campo decisivo**
6. **Riepiloghi numerici per stagione, competizione e squadra**
7. **Classifiche storiche aggregate**
8. **Dettaglio gara per gara con link al tabellino del sito**

---

## 2. Filosofia tecnica

La modifica e' volutamente esterna al plugin originale.

Il plugin ConfrontiStorici continua a fare quello che faceva prima:

```text
ConfrontiStorici 3.x -> genera persjs/fcmConfrontiDati.js
```

Le nuove pagine leggono quel file e calcolano nuove statistiche lato JavaScript:

```text
fcmConfrontiDati.js
        |
        v
fcmSoglieRecordFunzioni.js
        |
        v
fcmSoglieRecordVisteV2.js
        |
        +--> soglieRecordStagioneV2.htm
        +--> soglieRecordStoricoV2.htm
```

Questo approccio ha tre vantaggi:

- non modifica il plugin distribuito;
- non richiede rigenerazioni speciali del database FCM;
- se qualcosa non funziona, basta rimuovere i nuovi file e il sito resta invariato.

---

## 3. File coinvolti

### 3.1 File esistenti generati da ConfrontiStorici

Questi file devono gia' esistere:

```text
<ROOT_SITO>\persjs\fcmConfrontiDati.js
<ROOT_SITO>\persjs\fcmConfrontiFunzioni.js
```

Il file indispensabile e':

```text
fcmConfrontiDati.js
```

perche' contiene l'array:

```javascript
var arrConfronti = new Array()
```

Ogni partita e' rappresentata da oggetti `Y(...)`, con campi come:

```javascript
new Y(
  Stagione,
  Competizione,
  GiornataA,
  Data,
  IDASquadraCasa,
  SquadraCasa,
  IDASquadraFuori,
  SquadraFuori,
  Neutro,
  GolCasa,
  GolFuori,
  TipoRis,
  GolRegoCasa,
  GolRegoFuori,
  GolSupplCasa,
  GolSupplFuori,
  GolRigoriCasa,
  GolRigoriFuori,
  PuntiCasa,
  PuntiFuori
)
```

I campi chiave per i nuovi record sono:

```text
Stagione
Competizione
GiornataA
Data
SquadraCasa
SquadraFuori
Neutro
GolCasa / GolFuori
GolRegoCasa / GolRegoFuori
PuntiCasa / PuntiFuori
```

### 3.2 Nuovo file base

```text
<ROOT_SITO>\persjs\fcmSoglieRecordFunzioni.js
```

Questo file contiene la logica base di analisi:

- lettura di `arrConfronti`;
- calcolo delle soglie;
- individuazione di botte di culo;
- individuazione di sfortune;
- individuazione soglie precise;
- simulazione fattore campo;
- costruzione degli eventi base;
- link alla giornata/tabellino.

### 3.3 Nuovo file V2 comune

```text
<ROOT_SITO>\persjs\fcmSoglieRecordVisteV2.js
```

Questo file contiene la logica di visualizzazione V2:

- filtri per stagione;
- filtri per competizione;
- filtro record;
- filtro squadra;
- filtro solo squadre attuali / tutte;
- top N con pari merito inclusi;
- riepilogo numerico;
- classifiche storiche;
- dettaglio gara per gara;
- normalizzazione delle competizioni.

### 3.4 Nuove pagine HTML

```text
<ROOT_SITO>\soglieRecordStagioneV2.htm
<ROOT_SITO>\soglieRecordStoricoV2.htm
```

Gli HTML stanno nella root del sito, non dentro `persjs`.

La cartella `persjs` contiene i dati e i file JS.

La root del sito contiene le pagine visitabili.

---

## 4. Percorsi finali consigliati

Esempio per la stagione 2025:

```text
E:\fantacalcio\Lega2025\persjs\fcmSoglieRecordFunzioni.js
E:\fantacalcio\Lega2025\persjs\fcmSoglieRecordVisteV2.js
E:\fantacalcio\Lega2025\soglieRecordStagioneV2.htm
E:\fantacalcio\Lega2025\soglieRecordStoricoV2.htm
```

Schema generale:

```text
<ROOT_SITO>\persjs\fcmSoglieRecordFunzioni.js
<ROOT_SITO>\persjs\fcmSoglieRecordVisteV2.js
<ROOT_SITO>\soglieRecordStagioneV2.htm
<ROOT_SITO>\soglieRecordStoricoV2.htm
```

---

## 5. Dipendenze

### 5.1 Dipendenza principale

Serve avere ConfrontiStorici 3.x funzionante.

Il requisito pratico e':

```text
persjs/fcmConfrontiDati.js deve esistere e contenere arrConfronti
```

Senza questo file le nuove pagine non hanno dati da leggere.

### 5.2 Dipendenze JavaScript

Le pagine caricano i file in questo ordine:

```html
<script src="persjs/fcmSoglieRecordFunzioni.js" type="text/javascript"></script>
<script src="persjs/fcmConfrontiDati.js" type="text/javascript"></script>
<script src="persjs/fcmSoglieRecordVisteV2.js" type="text/javascript"></script>
```

L'ordine e' importante:

1. `fcmSoglieRecordFunzioni.js` definisce funzioni e strutture di supporto;
2. `fcmConfrontiDati.js` carica i dati reali;
3. `fcmSoglieRecordVisteV2.js` costruisce viste, filtri, riepiloghi e classifiche.

---

## 6. Soglie gol usate

Le soglie usate sono quelle viste nei dati della lega:

```javascript
[66, 72, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113]
```

Interpretazione:

```text
66  = 1 gol
72  = 2 gol
77  = 3 gol
81  = 4 gol
85  = 5 gol
89  = 6 gol
93  = 7 gol
97  = 8 gol
```

Queste soglie sono nel file base:

```javascript
var SOG_REP_SOGLIE = [66, 72, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113];
```

---

## 7. Record implementati

### 7.1 Vittoria chirurgica

Definizione stretta.

Una vittoria chirurgica si verifica quando:

```text
la squadra vince di un solo gol
la squadra e' esattamente sulla soglia gol
l'avversario e' esattamente a -0,5 dalla stessa soglia
```

Esempi validi:

```text
66 - 65,5 = 1-0
72 - 71,5 = 2-1
77 - 76,5 = 3-2
81 - 80,5 = 4-3
```

Esempi non validi:

```text
72 - 65,5 = 2-0
77 - 71,5 = 3-1
```

Questi ultimi sono soglie precise, non vittorie chirurgiche.

### 7.2 Pareggio miracolato

Si verifica quando:

```text
la partita finisce in pareggio
la squadra raggiunge esattamente la propria soglia
l'avversario fa piu punti
l'avversario manca la soglia successiva per 0,5
```

Esempio:

```text
66 - 71,5 = 1-1
```

La squadra a 66 ha pareggiato pur avendo fatto molti meno punti.

### 7.3 Sconfitta beffa

E' la prospettiva sfortunata della vittoria chirurgica.

Si verifica quando:

```text
la squadra perde di un solo gol
la squadra e' a -0,5 dalla soglia
l'avversario e' esattamente sulla soglia
```

Esempio:

```text
71,5 - 72 = 1-2
```

### 7.4 Pareggio stretto

E' la prospettiva sfortunata del pareggio miracolato.

Si verifica quando:

```text
la partita finisce in pareggio
la squadra fa piu punti dell'avversario
la squadra manca la soglia successiva per 0,5
l'avversario e' esattamente sulla propria soglia
```

Esempio:

```text
80,5 - 77 = 3-3
```

### 7.5 Soglia precisa

Una prestazione e' a soglia precisa quando il punteggio e' esattamente una soglia gol:

```text
66, 72, 77, 81, 85, 89, ...
```

Questa metrica serve per i “Tiratori scelti”, cioe' squadre che massimizzano il rendimento senza sprecare punti nella fascia gol.

### 7.6 Spreco punti

Lo spreco punti misura i punti oltre la soglia nelle partite vinte senza ottenere un gol in piu.

Esempio:

```text
71 - 65 = 1-0
```

Con soglia 1 gol a 66, lo spreco e':

```text
71 - 66 = 5 punti
```

Lo spreco viene conteggiato nelle vittorie.

### 7.7 Fattore campo decisivo

I punti salvati in `arrConfronti` sono considerati comprensivi del bonus casa.

La simulazione a campi invertiti e':

```text
Punti casa simulati = PuntiCasa - 1
Punti fuori simulati = PuntiFuori + 1
```

La partita e' considerata influenzata dal fattore campo se il risultato reale della squadra di casa e' migliore del risultato simulato a campi invertiti.

Casi principali:

```text
Da sconfitta a vittoria  = +3 casa
Da pareggio a vittoria   = +2 casa
Da sconfitta a pareggio  = +1 casa
```

Esempio:

```text
Casa 66 - Trasferta 65,5 = 1-0
Campi invertiti: 65 - 66,5 = 0-1
```

Effetto:

```text
+3 punti casa
-3 punti trasferta
```

---

## 8. Link al tabellino

Ogni riga di dettaglio partita deve avere link cliccabile al tabellino/giornata del sito.

Il link viene costruito dal file base usando la cartella stagione:

```text
../<cartella_stagione>/ris.<estensione>?Gio=<giornata>
```

Esempio:

```text
../lega2025/ris.php?Gio=18
```

Se il sito usa `ris.htm` invece di `ris.php`, modificare nel file base:

```javascript
var SOG_REP_EXT = "php";
```

in:

```javascript
var SOG_REP_EXT = "htm";
```

---

## 9. Competizioni

La V2 normalizza le competizioni principali usando una mappa esplicita.

Ordine e nomi attesi:

```text
0. Tutte le competizioni
1. Serie A
2. Serie B
3. Serie C
4. Coppa Serie A
5. Coppa Serie B
6. Coppa Serie C
7. Coppa tra le Coppe
8. Europa Pipps
9. Supercoppa Serie A
10. Supercoppa Serie B
11. Supercoppa Serie C
12. Altre competizioni
```

Mappa implementata:

```javascript
var SRV_COMPETIZIONI_CORE = {
  19:{nome:"Serie A",ordine:1},
  23:{nome:"Serie B",ordine:2},
  48:{nome:"Serie C",ordine:3},
  20:{nome:"Coppa Serie A",ordine:4},
  24:{nome:"Coppa Serie B",ordine:5},
  49:{nome:"Coppa Serie C",ordine:6},
  26:{nome:"Coppa tra le Coppe",ordine:7},
  63:{nome:"Europa Pipps",ordine:8},
  21:{nome:"Supercoppa Serie A",ordine:9},
  25:{nome:"Supercoppa Serie B",ordine:10},
  50:{nome:"Supercoppa Serie C",ordine:11}
};
```

Le competizioni non presenti in questa mappa vengono aggregate in:

```text
Altre competizioni
```

---

## 10. Pagina stagione V2

File:

```text
soglieRecordStagioneV2.htm
```

Filtri disponibili:

```text
Stagione
Competizione
Record
Squadra
Numero record da mostrare
```

Schede disponibili:

```text
Dettaglio record
Riepilogo numerico
```

### 10.1 Dettaglio record

Mostra righe gara per gara con:

```text
Tipo record
Stagione
Data
Competizione
Giornata cliccabile
Squadra
Avversario
Punti / reale
Risultato cliccabile
A campi invertiti
Effetto
Nota
```

Se si sceglie `Tutti i record`, il numero selezionato vale per ogni tipo di record.

Esempio:

```text
Tutti i record + Mostra 5
```

significa:

```text
massimo 5 fattore campo
massimo 5 vittorie chirurgiche
massimo 5 pareggi miracolati
massimo 5 sconfitte beffa
massimo 5 pareggi stretti
massimo 5 soglie precise
```

Con pari merito inclusi.

### 10.2 Riepilogo numerico

Mostra:

```text
Impatto complessivo
Impatto per competizione
Impatto per squadra
```

Include sia:

```text
Botte di culo / Fantozzi
```

sia:

```text
Fattore campo / Soglie precise
```

Campi principali:

```text
Botte di culo
% fortuna
Fantozzi
% sfortuna
Saldo F/S
Vittorie chirurgiche
Pareggi miracolati
Sconfitte beffa
Pareggi stretti
FC decisivo
% FC
Punti casa FC
Punti fuori persi
Soglie precise
% soglie
```

---

## 11. Pagina storico V2

File:

```text
soglieRecordStoricoV2.htm
```

Filtri disponibili:

```text
Competizione
Record/classifica
Squadre attuali / tutte le squadre
Numero risultati
```

Schede disponibili:

```text
Classifiche aggregate
Riepilogo numerico
```

### 11.1 Record/classifica = Tutti

Nel filtro `Record/classifica` e' disponibile la voce:

```text
Tutti
```

Quando e' selezionata, la pagina mostra tutte le classifiche aggregate, ognuna con il limite scelto.

Esempio:

```text
Tutti + Mostra 5
```

significa:

```text
Top 5 indice fortuna netto
Top 5 botte di culo totali
Top 5 Fantozzi
Top 5 vittorie chirurgiche
Top 5 pareggi miracolati
...
```

Ogni classifica include i pari merito sull'ultima posizione.

### 11.2 Solo squadre attuali

Il filtro:

```text
solo squadre attuali
```

considera attuali le squadre presenti nell'ultima stagione disponibile in `arrConfronti`.

La logica e':

```text
ultima stagione = massimo valore di Stagione in arrConfronti
squadre attuali = SquadraCasa/SquadraFuori presenti in quella stagione
```

---

## 12. Pari merito

La regola implementata e':

```text
se scelgo Top N, mostro almeno N risultati,
ma se il risultato in posizione N e' condiviso da altre squadre/righe,
mostro anche tutti i pari merito
```

Esempio:

```text
Top 5
1. Squadra A 10
2. Squadra B 8
3. Squadra C 7
4. Squadra D 6
5. Squadra E 5
5. Squadra F 5
5. Squadra G 5
```

In questo caso il Top 5 mostra 7 righe.

---

## 13. Funzioni principali del JS V2

### 13.1 Normalizzazione competizioni

```javascript
function SRVCompetizioneNormalizzata(id) {
  id = parseInt(id,10);
  return SRV_COMPETIZIONI_CORE[id] ? id : SRV_COMP_ALTRE_ID;
}
```

### 13.2 Match filtro competizione

```javascript
function SRVMatchCompetizione(idReale,filtroId) {
  idReale = parseInt(idReale,10);
  filtroId = parseInt(filtroId,10);
  if (filtroId == 0) return true;
  if (filtroId == SRV_COMP_ALTRE_ID) return !SRV_COMPETIZIONI_CORE[idReale];
  return idReale == filtroId;
}
```

### 13.3 Analisi vista

```javascript
function SRVAnalizzaVista(stagione,compId) {
  var res = SogRepAnalizza(stagione);
  var rows = SRVBuildRowsFromAnalisi(res,compId);
  var stats = SRVBaseStats(stagione,compId);
  SRVApplyRowsToStats(stats,rows);
  return {
    stagione: stagione,
    compId: compId,
    res: res,
    rows: rows,
    stats: stats,
    partite: SRVContaPartite(stagione,compId)
  };
}
```

### 13.4 Top con pari merito

```javascript
function SRVTopConPariMerito(arr,topN,fnVal) {
  if (topN >= arr.length) return arr;
  if (topN <= 0) return [];
  var lim = fnVal(arr[topN-1]);
  var out = [];
  for (var i=0; i<arr.length; i++) {
    if (i < topN || fnVal(arr[i]) == lim) out.push(arr[i]);
  }
  return out;
}
```

### 13.5 Riepilogo numerico

La funzione `SRVRenderRiepilogo(...)` produce tre tabelle:

```text
Impatto complessivo
Impatto per competizione
Impatto per squadra
```

La versione corretta include:

```text
Botte di culo
Fantozzi
Saldo fortuna/sfortuna
Fattore campo
Soglie precise
```

---

## 14. Error handling

Le due pagine HTML V2 includono un contenitore:

```html
<div class="srv-note" id="errorePagina" style="color:red;"></div>
```

Le funzioni principali sono protette da `try/catch`.

Se qualcosa va storto, invece di pagina vuota compare:

```text
Errore JavaScript: <messaggio>
```

Questo serve per evitare il problema iniziale della pagina completamente bianca.

---

## 15. Cosa non viene modificato

Non vengono modificati:

```text
confrontiStorici.jar
confrontiStorici34.exe
fcmConfrontiDati.js
fcmConfrontiFunzioni.js
file .fcm
archivio FCM
```

La soluzione e' una sovrastruttura di visualizzazione.

---

## 16. Possibili evoluzioni future

Possibili miglioramenti successivi:

1. aggiungere grafici per incidenza fattore campo;
2. aggiungere esportazione CSV;
3. aggiungere filtro casa/trasferta;
4. aggiungere filtro per tipo competizione: campionati/coppe/supercoppe;
5. collegare in modo piu' preciso il singolo match nel tabellino, se il sito espone ancore o ID partita;
6. consolidare la pagina dentro il menu del sito;
7. creare una mini-skin coerente con ConfrontiStorici.

---

## 17. Riepilogo finale

La soluzione implementa nuovi output senza riscrivere il plugin.

File JS in `persjs`:

```text
fcmSoglieRecordFunzioni.js
fcmSoglieRecordVisteV2.js
```

File HTML in root sito:

```text
soglieRecordStagioneV2.htm
soglieRecordStoricoV2.htm
```

Serve ConfrontiStorici 3.x per generare i dati.

Le statistiche sono calcolate lato browser usando `arrConfronti`.
