# ConfrontiStorici 3.x Plus - Handoff progetto

Data avvio documento: 2026-07-06  
Progetto: **ConfrontiStorici 3.x Plus / Record Soglie / Config Plus**  
Repository GitHub: `https://github.com/mauz79/ConfrontiStorici-3.x-Plus`  
Ambiente utente principale: Windows, PowerShell, Notepad++, Fantacalcio Manager, ConfrontiStorici 3.4.

---

## 1. Scopo del progetto

Il progetto **ConfrontiStorici 3.x Plus** nasce come estensione non ufficiale del plugin **ConfrontiStorici 3.4** per Fantacalcio Manager.

L'obiettivo non e' modificare il plugin originale, il JAR o l'EXE, ma aggiungere file HTML/JS coerenti con la skin del sito generato da ConfrontiStorici.

La logica principale e':

```text
ConfrontiStorici originale
  genera dati e pagine base

ConfrontiStorici Plus
  aggiunge viste nuove che leggono gli output gia' generati
```

Il modulo Plus attuale aggiunge le viste **Record Soglie**, con record e curiosita' legate a soglie gol, fortuna/sfortuna, fattore campo e mezzo punto.

---

## 2. Credits e attribuzione

**ConfrontiStorici 3.4** e' il plugin originale per Fantacalcio Manager sviluppato da **Lukesky (L.T.)**.

**ConfrontiStorici 3.x Plus - Record Soglie** e' un modulo aggiuntivo non ufficiale creato e mantenuto da **mauz79**.

Il progetto Plus:

```text
- non sostituisce ConfrontiStorici originale
- non contiene modifiche al JAR/EXE originale
- usa gli output JavaScript prodotti da ConfrontiStorici
- aggiunge pagine e funzioni HTML/JS esterne
```

---

## 3. Architettura corretta

Una volta pubblicato nel sito, il Plus deve funzionare leggendo solo file presenti nel sito stesso.

Non deve dipendere da percorsi locali del PC, come:

```text
C:\Users\mauz7\ConfrontiStorici\config\
C:\Users\mauz7\ConfrontiStorici\data\
E:\FCM\data\
D:\DEV_APPS\
```

I percorsi locali servono solo in fase di configurazione/generazione.

Sul sito finale devono bastare file come:

```text
<ROOT_SITO>\soglieRecordStagioneV2.htm
<ROOT_SITO>\soglieRecordStoricoV2.htm

<ROOT_SITO>\persjs\fcmConfrontiDati.js
<ROOT_SITO>\persjs\fcmSoglieRecordFunzioni.js
<ROOT_SITO>\persjs\fcmSoglieRecordVisteV2.js
<ROOT_SITO>\persjs\fcmSoglieRecordConfigPlus.js
```

---

## 4. Tipi di file

### 4.1 File statici Plus

Sono i file del programma Plus. Cambiano solo quando viene rilasciata una nuova versione del Plus.

```text
soglieRecordStagioneV2.htm
soglieRecordStoricoV2.htm
persjs\fcmSoglieRecordFunzioni.js
persjs\fcmSoglieRecordVisteV2.js
```

Contengono:

```text
- calcolo record
- calcolo soglie
- calcolo fattore campo
- record mezzo punto
- rendering HTML
- filtri
- classifiche
- fallback se manca config Plus
```

### 4.2 File dati ConfrontiStorici

E' il file generato dal plugin originale e aggiornato ogni volta che viene rigenerato il sito dopo una giornata.

```text
persjs\fcmConfrontiDati.js
```

Contiene l'array:

```javascript
arrConfronti
```

Da questo file il Plus legge risultati, punteggi, squadre, competizioni, stagioni e giornate.

### 4.3 File dati/config Plus

E' il nuovo file dati generato dai file di configurazione di ConfrontiStorici.

```text
persjs\fcmSoglieRecordConfigPlus.js
```

Contiene informazioni di raccordo/normalizzazione:

```text
- stagione -> cartella sito
- competizione di stagione -> competizione albo d'oro / nome normalizzato
- squadra di stagione -> squadra attuale / nome attuale albo d'oro
- eventuali dati palmares o icone in futuro
```

Questo file deve essere autosufficiente e leggibile dal browser.

---

## 5. Aggiornamento dopo ogni giornata

Dopo una normale giornata di campionato/coppa, non serve rigenerare i file statici Plus.

Flusso previsto:

```text
1. Aggiornare FCM / risultati giornata.
2. Lanciare ConfrontiStorici.
3. ConfrontiStorici rigenera persjs\fcmConfrontiDati.js.
4. Il sito viene aggiornato/pubblicato.
5. Le pagine Plus leggono fcmConfrontiDati.js aggiornato.
```

I record si aggiornano perche' le pagine HTML ricalcolano tutto lato browser a ogni apertura.

---

## 6. Quando rigenerare fcmSoglieRecordConfigPlus.js

Il file config Plus non contiene risultati giornata-per-giornata.

Va rigenerato solo quando cambiano configurazioni strutturali:

```text
- nuova stagione
- nuova squadra
- nuova associazione squadra storica -> squadra attuale
- nuova competizione
- nuova associazione competizione storica -> competizione albo d'oro
- modifica cartelle sito
- modifica palmares/etichette da usare nelle viste
```

In una stagione gia' configurata, normalmente non serve rigenerarlo dopo ogni giornata.

---

## 7. File di configurazione ConfrontiStorici usati

La cartella locale di ConfrontiStorici e':

```text
C:\Users\mauz7\ConfrontiStorici
```

Dentro ci sono:

```text
config\
data\
```

I file di configurazione rilevanti sono:

```text
C:\Users\mauz7\ConfrontiStorici\config\LCS_conf_cartelle.txt
C:\Users\mauz7\ConfrontiStorici\config\LCS_conf_competizioni.txt
C:\Users\mauz7\ConfrontiStorici\config\LCS_conf_squadre.txt
C:\Users\mauz7\ConfrontiStorici\config\LCS_conf_palmares.txt
```

File allegati e analizzati all'avvio del ramo:

```text
LCS_conf_cartelle.txt
LCS_conf_competizioni.txt
LCS_conf_palmares.txt
LCS_conf_ranking.txt
LCS_conf_squadre.txt
LCS_config.xml
AlbumMap.lcs
AlmanaccoMap.lcs
```

Nota importante: i `DataA-aaaa.js` presenti in `C:\Users\mauz7\ConfrontiStorici\data` sono gestiti dall'utente/progetto ConfrontiStorici. Non devono essere inventati o generati dal Plus senza file reali forniti dall'utente.

---

## 8. Informazioni confermate dai file config

### 8.1 Cartelle stagioni

`LCS_conf_cartelle.txt` contiene righe del tipo:

```text
Stagione,Squadre Salve,Nome Archivio FCM,Cartella Sito su Server
```

Esempio confermato:

```text
21,8,E:/FCM/data/AlterLega 2025_2026-21-2025.fcm,lega2025
```

Quindi la stagione 21 corrisponde alla cartella sito:

```text
lega2025
```

### 8.2 Competizioni

`LCS_conf_competizioni.txt` contiene:

```text
Stagione,Id Competizione in stagione,Id Competizione in Albo D'Oro,Nome Competizione
```

Esempi stagione 21:

```text
21,4,19,"Serie A"
21,5,20,"Coppa Serie A"
21,6,21,"Supercoppa Serie A"
21,7,23,"Serie B"
21,8,24,"Coppa Serie B"
21,9,25,"Supercoppa Serie B"
21,11,26,"Coppa tra le Coppe"
21,12,48,"Serie C"
21,13,49,"Coppa Serie C"
21,14,50,"Supercoppa Serie C"
21,16,63,"Europa Pipps"
21,18,68,"Play Off - Play Out"
```

Questa mappa deve sostituire la mappa hardcoded nel JS.

### 8.3 Squadre

`LCS_conf_squadre.txt` contiene:

```text
Stagione,Posizione in Stagione,Posizione attuale in albo d'oro,Nome Attuale in Albo D'oro,Nome Allenatore
```

Esempi stagione 21:

```text
21,71,201,"Batlard Corporated Inc.","-"
21,83,230,"FC Squirt Game","-"
21,97,236,"AS Intomatici","-"
21,98,237,"FC Inserimento Da Dietro","-"
```

Questa mappa serve per accorpare correttamente squadre storiche e squadre attuali.

---

## 9. Nuovo obiettivo tecnico: Config Plus JS

Creare uno script PowerShell che legga i file config di ConfrontiStorici e generi:

```text
<ROOT_SITO>\persjs\fcmSoglieRecordConfigPlus.js
```

Nome script proposto:

```text
tools\GeneraSoglieRecordConfigPlus.ps1
```

Comando atteso:

```powershell
powershell -ExecutionPolicy Bypass -File "D:\DEV_APPS\ConfrontiStorici-3.x-Plus\tools\GeneraSoglieRecordConfigPlus.ps1" -ConfigRoot "C:\Users\mauz7\ConfrontiStorici\config" -SiteRoot "E:\fantacalcio\Lega2025"
```

Il wrapper non serve: basta questo comando PowerShell.

---

## 10. Struttura prevista di fcmSoglieRecordConfigPlus.js

Il file generato deve dichiarare variabili globali semplici, compatibili con browser vecchi.

Proposta iniziale:

```javascript
var SRP_CONFIG_PLUS_VERSIONE = "1.2.0";
var SRP_CONFIG_PLUS_GENERATO_IL = "2026-07-06T00:00:00";

var SRP_CARTELLE = {
  "21": {
    "fcm": "E:/FCM/data/AlterLega 2025_2026-21-2025.fcm",
    "cartella": "lega2025",
    "squadreSalve": 8
  }
};

var SRP_COMPETIZIONI = {
  "21": {
    "4": { "idAlbo": 19, "nome": "Serie A" }
  }
};

var SRP_SQUADRE = {
  "21": {
    "71": { "idAttuale": 201, "nomeAttuale": "Batlard Corporated Inc.", "allenatore": "-" }
  }
};

var SRP_PALMARES = {
  "19": { "label": "Scudetti", "icona": "ico-scudetto.gif" }
};
```

Regole:

```text
- niente dipendenze da file locali
- niente chiamate AJAX a C:\
- solo oggetti JS statici
- compatibilita' con pagine HTML locali/file://
```

---

## 11. Modifiche richieste ai file HTML

Le pagine Plus dovranno caricare anche il nuovo file config:

```html
<script src="persjs/fcmSoglieRecordFunzioni.js" type="text/javascript"></script>
<script src="persjs/fcmConfrontiDati.js" type="text/javascript"></script>
<script src="persjs/fcmSoglieRecordConfigPlus.js" type="text/javascript"></script>
<script src="persjs/fcmSoglieRecordVisteV2.js" type="text/javascript"></script>
```

Il file config deve essere opzionale: se non presente, la pagina deve continuare a funzionare con i fallback attuali.

---

## 12. Modifiche richieste a fcmSoglieRecordVisteV2.js

Obiettivo: usare `SRP_*` quando disponibili.

Da modificare/aggiungere:

```text
- funzione per cartella stagione da SRP_CARTELLE
- funzione per nome/ID competizione normalizzata da SRP_COMPETIZIONI
- funzione per squadra storica -> squadra attuale da SRP_SQUADRE
- filtro squadre attuali basato su idAttuale, non solo ultima stagione
- fallback su logica precedente se SRP_CONFIG_PLUS non esiste
```

Importante: il sistema deve restare robusto anche senza config Plus.

---

## 13. Pacchetto distribuzione Plus nella struttura ConfrontiStorici

L'obiettivo non e' creare un wrapper, ma mettere i nostri file dove stanno gli altri file di skin/output di ConfrontiStorici nello zip.

Approccio:

```text
- non modificare JAR/EXE
- aggiungere HTML nella Skin Sito
- aggiungere JS in Skin Sito\persjs
- aggiungere script tools per generare config Plus
- aggiungere documentazione Plus
```

File previsti nel pacchetto:

```text
Skin Sito\soglieRecordStagioneV2.htm
Skin Sito\soglieRecordStoricoV2.htm
Skin Sito\persjs\fcmSoglieRecordFunzioni.js
Skin Sito\persjs\fcmSoglieRecordVisteV2.js
Skin Sito\persjs\fcmSoglieRecordConfigPlus.js   (eventuale esempio vuoto o generato)
tools\GeneraSoglieRecordConfigPlus.ps1
README_PLUS_RecordSoglie.md
RecordSoglie_INSTALLAZIONE.md
RecordSoglie_WALKTHROUGH_COMPLETO.md
LEGGIMI_CONFRONTISTORICI_PLUS.txt
```

---

## 14. Stato versioni

### v1.0.0

Prima release Record Soglie.

Funzioni:

```text
- Botte di culo
- Sindrome di Fantozzi
- Vittorie chirurgiche
- Pareggi miracolati
- Sconfitte beffa
- Pareggi stretti
- Soglie precise
- Spreco punti
- Fattore campo decisivo
- riepiloghi stagione/storico/competizione/squadra
```

### v1.1.0

Aggiunti record mezzo punto:

```text
- Vittoria mancata per 0,5
- Sconfitta per un pelo
- Giusto giusto
```

Correzione nota:

```text
- aggiunta funzione helper SRVAddRow mancante in fcmSoglieRecordVisteV2.js
```

### v1.2.0 - in lavorazione

Obiettivi:

```text
- generare fcmSoglieRecordConfigPlus.js dai file config ConfrontiStorici
- usare associazioni squadra storica -> squadra attuale
- usare associazioni competizione stagione -> competizione albo d'oro
- usare cartelle stagione ufficiali per link tabellini
- preparare distribuzione Plus coerente con struttura ConfrontiStorici 3.4
```

---

## 15. Regole operative preferite dall'utente

L'utente preferisce:

```text
- istruzioni in italiano
- comandi PowerShell completi
- niente patch concettuali
- per file lunghi: aprire con Notepad++ e incollare file intero
- evitare heredoc PowerShell enormi per codice lungo
- fornire file scaricabili quando richiesto esplicitamente
- mantenere un file MD di continuita' aggiornato passo passo
```

Per Windows/PowerShell:

```text
- usare percorsi espliciti
- usare comandi singoli incollabili
- non usare blocchi if/else multilinea complessi in console
```

---

## 16. Prossimo passo immediato

Preparare il primo script:

```text
tools\GeneraSoglieRecordConfigPlus.ps1
```

Input:

```text
-ConfigRoot "C:\Users\mauz7\ConfrontiStorici\config"
-SiteRoot "E:\fantacalcio\Lega2025"
```

Output:

```text
E:\fantacalcio\Lega2025\persjs\fcmSoglieRecordConfigPlus.js
```

Poi aggiornare:

```text
soglieRecordStagioneV2.htm
soglieRecordStoricoV2.htm
fcmSoglieRecordVisteV2.js
```

per caricare/usare il nuovo config.

---

## 17. Changelog incrementale del documento

### 2026-07-06 - Avvio

Creato documento handoff per il nuovo ramo **Config Plus / distribuzione integrata**.

Decisioni registrate:

```text
- DataA.js non vanno inventati dal Plus
- il sito deve dipendere solo da file JS presenti nel sito
- file funzioni Plus stabile
- file config Plus generabile e aggiornabile
- nessun wrapper necessario, basta comando PowerShell
```


---

## Aggiornamento 2026-07-06 - Avvio v1.2.0 Config Plus

### Obiettivo operativo

Separare definitivamente:

```text
file statici Plus = logica e viste
file dati ConfrontiStorici = partite e risultati
file dati Config Plus = associazioni storiche/attuali e cartelle sito
```

### Nuovo file generabile

```text
persjs/fcmSoglieRecordConfigPlus.js
```

Contiene, in formato JavaScript portabile sul sito:

```text
SRP_CARTELLE
SRP_COMPETIZIONI
SRP_COMPETIZIONI_ALBO
SRP_PALMARES
SRP_SQUADRE
SRP_SQUADRE_BY_ID
```

### Nuovo tool

```text
tools/GeneraSoglieRecordConfigPlus.ps1
```

Uso previsto:

```powershell
powershell -ExecutionPolicy Bypass -File "D:\DEV_APPS\ConfrontiStorici-3.x-Plus\tools\GeneraSoglieRecordConfigPlus.ps1" -ConfigRoot "C:\Users\mauz7\ConfrontiStorici\config" -SiteRoot "E:\fantacalcio\Lega2025"
```

Output:

```text
E:\fantacalcio\Lega2025\persjs\fcmSoglieRecordConfigPlus.js
```

### HTML aggiornati

Le pagine V2 caricano ora anche:

```html
<script src="persjs/fcmSoglieRecordConfigPlus.js" type="text/javascript"></script>
```

tra:

```html
<script src="persjs/fcmConfrontiDati.js" type="text/javascript"></script>
```

e:

```html
<script src="persjs/fcmSoglieRecordVisteV2.js" type="text/javascript"></script>
```

### JS V2 aggiornato

`fcmSoglieRecordVisteV2.js` ora usa `fcmSoglieRecordConfigPlus.js` quando disponibile per:

```text
- nomi e ordine competizioni da SRP_COMPETIZIONI_ALBO
- cartelle stagione da SRP_CARTELLE
- nome squadra attuale da SRP_SQUADRE_BY_ID
- filtro solo squadre attuali con identita normalizzate
```

Se il file config Plus manca, resta attivo il fallback precedente.

---

## Aggiornamento 2026-07-07 - Statistiche Classiche Plus

E' stata aggiunta la nuova pagina:

```text
dist\statisticheClassichePlus.htm
```

Copia operativa sul sito:

```text
E:\fantacalcio\Lega2025\statisticheClassichePlus.htm
```

La pagina e' autonoma lato HTML e usa i dati gia' generati da ConfrontiStorici.

### Dipendenze script

Ordine corretto degli script:

```html
<script src="persjs/fcmSoglieRecordFunzioni.js" type="text/javascript"></script>
<script src="persjs/fcmConfrontiDati.js" type="text/javascript"></script>
<script src="persjs/fcmSoglieRecordConfigPlus.js" type="text/javascript"></script>
<script src="persjs/fcmSoglieRecordVisteV2.js" type="text/javascript"></script>
```

Nota importante: `fcmConfrontiDati.js` non va caricato prima di `fcmSoglieRecordFunzioni.js`, perche' il file dati contiene righe con `new Y(...)` e il costruttore `Y` viene definito dalle funzioni.

### Funzionalita' attive

La pagina `statisticheClassichePlus.htm` calcola record classici su:

```text
- punteggio fantasy
- punti classifica
- vittorie
- pareggi
- sconfitte
- gol fatti
- gol subiti
- medie storiche
```

Record implementati:

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

### Soglia minima per record storici di media

Per i record storici di media viene applicato un minimo di **100 partite giocate** nel filtro selezionato.

Motivo: sotto le 100 partite la media puo' essere poco significativa, soprattutto quando si mischiano competizioni con calendari molto diversi.

La pagina mostra una nota esplicativa vicino ai record interessati.

### Gruppi competizione

Sono stati aggiunti filtri di raggruppamento per evitare classifiche globali poco leggibili o falsate da competizioni brevi.

Gruppi disponibili:

```text
principali = campionati + coppe di lega + coppe interlega
campionati = Serie A, Serie B, Serie C
coppe di lega = Coppa di Lega Serie A, Coppa di Lega Serie B, Coppa di Lega Serie C
coppe interlega = Europa Pipps + Coppa tra le Coppe
tutte = tutte le competizioni disponibili
personalizzato = scelta manuale con checkbox
```

Le Supercoppe non sono incluse nel gruppo `principali`, perche' sono competizioni troppo brevi e rendono poco utili alcuni record come il massimo dei punti classifica.

### Record globali e contributo competizioni

I record assoluti globali mostrano una colonna:

```text
Contributo competizioni
```

Questa colonna mostra per ogni riga come il totale globale e' distribuito tra le singole competizioni, per esempio Serie A, Serie B, Serie C, coppe di lega e coppe interlega.

Questo e' importante perche' alcune competizioni non esistono in tutte le stagioni o non hanno sempre lo stesso numero di partite.

### Viste record

La pagina offre tre modalita':

```text
record assoluti globali
record divisi per competizione
globali + divisi per competizione
```

La vista `record divisi per competizione` ricalcola ogni record separatamente per ogni competizione inclusa dal gruppo scelto.

La vista `globali + divisi per competizione` mostra prima il dato aggregato e poi il dettaglio separato per torneo.

### Filtri principali della pagina

```text
Modalita': singola stagione / storico
Stagione: visibile in modalita' singola stagione
Competizione: tutte o singola competizione
Gruppo competizioni: principali / campionati / coppe di lega / coppe interlega / tutte / personalizzato
Squadre: tutte o solo attuali
Squadra: tutte o singola squadra
Record: tutti o singolo record
Vista record: globali / per competizione / entrambi
Mostra: numero risultati o tutti
```

### File da copiare sul sito

Dopo ogni modifica:

```powershell
Copy-Item "D:\DEV_APPS\ConfrontiStorici-3.x-Plus\dist\statisticheClassichePlus.htm" "E:\fantacalcio\Lega2025\statisticheClassichePlus.htm" -Force
```

Apertura test:

```powershell
Start-Process "E:\fantacalcio\Lega2025\statisticheClassichePlus.htm"
```

### Stato operativo verificato

La pagina risulta funzionante dopo la correzione dell'ordine di caricamento degli script:

```text
fcmSoglieRecordFunzioni.js prima di fcmConfrontiDati.js
```

Prima della correzione, la pagina non vedeva dati ConfrontiStorici perche' il costruttore `Y` non era ancora disponibile quando veniva caricato `fcmConfrontiDati.js`.

### Commit consigliato per documentazione

```powershell
cd "D:\DEV_APPS\ConfrontiStorici-3.x-Plus"

git status
git add README.md docs\ConfrontiStoriciPlus_HANDOFF.md dist\statisticheClassichePlus.htm

git commit -m "Documenta statistiche classiche Plus"

git push
```

