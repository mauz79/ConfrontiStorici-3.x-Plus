# Culometro Plus V4 - configurazione pesi separata

## File introdotto

- `dist/persjs/fcmCulometroPlusConfig.js`

Da questa versione i pesi principali del Culometro sono esterni al motore.
Il file HTML carica prima `fcmCulometroPlusConfig.js` e poi `fcmCulometroPlus.js`.

## Parametri principali

- `kScala`: controlla quanto la classifica viene compressa verso 50. Piu basso = piu estremi; piu alto = piu piatta.
- `pesoRaritaMax`: tetto massimo del peso rarita storica.
- `pesoConfigBlend`: quanto pesa la configurazione specifica rispetto alla famiglia evento.
- `rarita`: tabella frequenza storica -> peso.
- `pesoTier`: pesi dei livelli S/A/B/C/D dell'algoritmo a cascata.
- `pesoImpatto`: moltiplicatori per cambio esito sportivo.
- `fasce`: etichette testuali della scala 0-100.

## Nota HTML

`culometroPlus.htm` contiene una spiegazione sintetica del metodo:

- scala 0-100 con 50,00 neutro;
- algoritmo a cascata, una etichetta principale per prestazione squadra;
- rarita storica calcolata sullo storico globale delle prestazioni squadra;
- normalizzazione per partite giocate;
- pesi configurabili nel file `fcmCulometroPlusConfig.js`.
