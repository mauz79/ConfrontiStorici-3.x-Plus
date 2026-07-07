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
- `statisticheClassichePlus.htm`

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
- Vittorie mancate per 0,5
- Sconfitte per un pelo
- Giusto giusto
- Soglie precise
- Spreco punti
- Fattore campo decisivo
- Riepiloghi numerici per stagione, storico completo, competizione e squadra
- Classifiche storiche con filtro squadre attuali / tutte
- Dettaglio gare con link ai tabellini del sito

## In breve: che cosa sono i Record Soglie

Nel Fantacalcio non conta solo il punteggio totale ottenuto da una squadra, ma anche **dove quel punteggio cade rispetto alle soglie gol**.

Esempio:

```text
66 punti   = 1 gol
65,5 punti = 0 gol
72 punti   = 2 gol
71,5 punti = 1 gol
77 punti   = 3 gol
76,5 punti = 2 gol
```

Mezzo punto puo' quindi cambiare completamente una partita. Il modulo **Record Soglie** prova a isolare proprio questi casi-limite: vittorie ottenute col minimo indispensabile, pareggi salvati per mezzo punto, sconfitte beffa, punteggi perfettamente ottimizzati e partite cambiate dal bonus casa.

Questi record non vogliono dire che una squadra sia forte o scarsa. Raccontano una dimensione diversa: **fortuna, sfortuna, efficienza sulle soglie e peso del fattore campo**.

## Fortuna e sfortuna

### Botte di culo

Le **Botte di culo** sono gli episodi favorevoli. Una squadra viene considerata fortunata quando ottiene un risultato particolarmente conveniente grazie al modo in cui i punteggi cadono sulle soglie.

Rientrano qui:

- **Vittorie chirurgiche**
- **Pareggi miracolati**

Esempio tipico:

```text
66 - 65,5 = 1-0
```

La squadra vincente arriva esattamente alla soglia del gol. L'avversario resta fuori per mezzo punto.

### Sindrome di Fantozzi

La **Sindrome di Fantozzi** e' l'opposto: raccoglie gli episodi sfortunati, quelli in cui una squadra viene penalizzata da una soglia mancata per pochissimo o da un avversario che raggiunge la soglia giusta al millimetro.

Rientrano qui:

- **Sconfitte beffa**
- **Pareggi stretti**

Esempio tipico:

```text
65,5 - 66 = 0-1
```

La squadra perde per mezzo punto sulla soglia decisiva.

### Saldo fortuna/sfortuna

Il saldo confronta episodi favorevoli e sfavorevoli:

```text
Saldo fortuna/sfortuna = Botte di culo - Sindrome di Fantozzi
```

Un saldo positivo indica piu' episodi favorevoli che sfavorevoli. Un saldo negativo indica il contrario.

## Tipi di record principali

### Vittorie chirurgiche

Una **Vittoria chirurgica** e' una vittoria di un solo gol in cui:

- la squadra vincente e' esattamente su una soglia gol;
- l'avversario e' esattamente a 0,5 punti sotto quella stessa soglia;
- il risultato viene deciso dal margine minimo possibile.

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

Questi ultimi sono punteggi efficienti, ma non sono vittorie chirurgiche perche' non sono vinte di misura sulla stessa soglia.

### Pareggi miracolati

Un **Pareggio miracolato** e' un pareggio ottenuto da una squadra che fa meno punti dell'avversario, ma raggiunge esattamente la propria soglia mentre l'avversario manca la soglia successiva per 0,5.

Esempio:

```text
66 - 71,5 = 1-1
```

La squadra a 66 pareggia pur avendo fatto 5,5 punti in meno.

### Sconfitte beffa

Una **Sconfitta beffa** e' la prospettiva negativa della vittoria chirurgica.

Esempi:

```text
65,5 - 66 = 0-1
71,5 - 72 = 1-2
76,5 - 77 = 2-3
```

La squadra perde di un solo gol restando a mezzo punto dalla soglia che avrebbe cambiato il risultato.

### Pareggi stretti

Un **Pareggio stretto** e' un pareggio subito da una squadra che fa piu' punti dell'avversario, ma resta a 0,5 punti dalla soglia successiva.

Esempio:

```text
76,5 - 72 = 2-2
```

La squadra a 76,5 fa 4,5 punti in piu', ma resta mezzo punto sotto la soglia dei 3 gol.

## Soglie e ottimizzazione

### Soglie precise

Una **Soglia precisa** e' una prestazione chiusa esattamente su una soglia gol.

Soglie usate:

```text
66, 72, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113
```

Esempi:

```text
66 = 1 gol preciso
72 = 2 gol precisi
77 = 3 gol precisi
81 = 4 gol precisi
```

Il modulo conta quante volte ogni squadra raggiunge una soglia esatta e distingue se quell'episodio porta a vittoria, pareggio o sconfitta.

### Spreco punti nelle vittorie

Lo **Spreco punti** misura i punti fatti oltre la soglia in una partita vinta, senza che quei punti producano un gol in piu'.

Esempio:

```text
71 - 65 = 1-0
```

La soglia del primo gol e' 66. La squadra vincente fa 71, quindi:

```text
71 - 66 = 5 punti sprecati
```

La squadra ha vinto, ma quei 5 punti oltre la soglia non hanno generato un secondo gol.

## Fattore campo decisivo

Il **Fattore campo decisivo** misura le partite in cui il bonus casa `+1` cambia il risultato.

Il modulo considera i punti salvati in `arrConfronti` come gia' comprensivi del bonus casa e simula la partita a campi invertiti:

```text
punti casa simulati     = punti casa reali - 1
punti trasferta simulati = punti trasferta reali + 1
```

Poi ricalcola i gol sulle soglie.

Esempio:

```text
Reale:
Casa 66 - Trasferta 65,5 = 1-0

A campi invertiti:
Casa 65 - Trasferta 66,5 = 0-1
```

In questo caso il fattore campo trasforma una possibile sconfitta in una vittoria.

Il modulo calcola anche:

- punti classifica guadagnati in casa;
- punti classifica persi fuori casa;
- saldo fattore campo per squadra.

## Riepiloghi numerici

Le viste V2 non mostrano solo i singoli episodi. Producono anche riepiloghi aggregati per:

- stagione;
- storico completo;
- competizione;
- squadra.

I riepiloghi permettono di capire, per esempio:

- quante botte di culo ci sono state in una stagione;
- quale squadra ha il peggior saldo Fantozzi;
- quale competizione ha piu' partite decise da mezzo punto;
- quale squadra raggiunge piu' spesso le soglie precise;
- quanto pesa il fattore campo sul lungo periodo.

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
    |-- statisticheClassichePlus.htm
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

Versione documentata: **v1.1.0**.

La v1.1.0 aggiunge la famiglia **Mezzo punto / Giusto giusto** rispetto alla prima release v1.0.0.

Il modulo e' pensato come estensione leggera e non invasiva: il plugin originale resta intatto.

## Licenza e responsabilita'

Questo progetto e' distribuito come modulo aggiuntivo non ufficiale. Verificare la compatibilita' con la propria installazione di Fantacalcio Manager e ConfrontiStorici prima dell'uso in produzione.

---

## Aggiornamento - Statistiche Classiche Plus

Oltre alle pagine Record Soglie, il progetto include ora anche la pagina:

```text
statisticheClassichePlus.htm
```

File sorgente nella repository:

```text
dist\statisticheClassichePlus.htm
```

Copia operativa sul sito FCM:

```text
<ROOT_SITO>\statisticheClassichePlus.htm
```

Esempio ambiente di sviluppo/test:

```text
E:\fantacalcio\Lega2025\statisticheClassichePlus.htm
```

### Scopo della pagina

`statisticheClassichePlus.htm` aggiunge una vista Plus per record classici calcolati dai dati gia' generati da ConfrontiStorici.

La pagina non modifica ConfrontiStorici originale e non legge direttamente database `.fcm`: usa gli output JavaScript del sito, in particolare `persjs\fcmConfrontiDati.js`, piu' le funzioni e la configurazione Plus gia' presenti nel sito.

### Script richiesti e ordine corretto

L'ordine degli script e' importante:

```html
<script src="persjs/fcmSoglieRecordFunzioni.js" type="text/javascript"></script>
<script src="persjs/fcmConfrontiDati.js" type="text/javascript"></script>
<script src="persjs/fcmSoglieRecordConfigPlus.js" type="text/javascript"></script>
<script src="persjs/fcmSoglieRecordVisteV2.js" type="text/javascript"></script>
```

`fcmSoglieRecordFunzioni.js` deve essere caricato prima di `fcmConfrontiDati.js`, perche' il file dati ConfrontiStorici usa il costruttore `Y`.

### Record classici disponibili

La pagina gestisce record classici per stagione e storico:

```text
- maggiore media punteggio
- minore media punteggio
- maggiore somma totale a fine stagione
- minore somma totale a fine stagione
- max punti classifica
- min punti classifica
- migliore media punti classifica per stagione
- peggiore media punti classifica per stagione
- maggior numero di vittorie
- minor numero di vittorie
- minor numero di sconfitte
- maggior numero di sconfitte
- maggior numero di pareggi
- maggior numero di gol fatti
- minor numero di gol fatti
- minor numero di gol subiti
- maggior numero di gol subiti
- migliore media punteggio storico
- peggiore media punteggio storico
- migliore media punti classifica storico
- peggiore media punti classifica storico
- migliore media gol fatti storico
- migliore media gol subiti storico
```

Per i record storici di media viene applicata una soglia minima di **100 partite giocate** nel filtro selezionato. Sotto questa soglia la media viene esclusa perche' poco significativa.

### Gruppi competizione

La pagina permette di filtrare i record per gruppi di competizioni:

```text
principali = campionati + coppe di lega + coppe interlega
campionati = Serie A, Serie B, Serie C
coppe di lega = Coppa di Lega Serie A, Coppa di Lega Serie B, Coppa di Lega Serie C
coppe interlega = Europa Pipps + Coppa tra le Coppe
tutte = tutte le competizioni disponibili
personalizzato = scelta manuale con checkbox
```

Le Supercoppe non sono incluse nel gruppo `principali`, perche' sono competizioni troppo brevi e rendono poco utili alcuni record come il massimo dei punti classifica.

### Viste disponibili

La pagina offre tre viste:

```text
record assoluti globali
record divisi per competizione
globali + divisi per competizione
```

I record assoluti globali mostrano anche il contributo delle singole competizioni nella colonna finale, cosi' e' possibile capire da quali tornei provengono i numeri complessivi.

La vista divisa per competizione ricalcola gli stessi record separatamente per ogni competizione inclusa dal gruppo scelto.

### Installazione della pagina Statistiche Classiche Plus

Copiare il file:

```text
dist\statisticheClassichePlus.htm
```

nella root del sito:

```text
<ROOT_SITO>\statisticheClassichePlus.htm
```

Esempio:

```powershell
Copy-Item "D:\DEV_APPS\ConfrontiStorici-3.x-Plus\dist\statisticheClassichePlus.htm" "E:\fantacalcio\Lega2025\statisticheClassichePlus.htm" -Force
```

Apertura locale:

```powershell
Start-Process "E:\fantacalcio\Lega2025\statisticheClassichePlus.htm"
```

### Nota di continuita'

La documentazione precedente sulla versione v1.1.0 dei Record Soglie resta valida per il modulo Record Soglie. Questa sezione integra la documentazione con la nuova pagina `statisticheClassichePlus.htm` e con le funzionalita' sviluppate successivamente.

<!-- CULOMETRO_PLUS_START -->
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
<!-- CULOMETRO_PLUS_END -->


