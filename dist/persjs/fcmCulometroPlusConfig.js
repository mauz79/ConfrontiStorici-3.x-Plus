/*
  fcmCulometroPlusConfig.js
  Configurazione pesi Culometro Plus.

  Da ora in poi i pesi principali del Culometro vanno modificati qui,
  evitando di toccare ogni volta il motore principale fcmCulometroPlus.js.

  Note rapide:
  - kScala piu basso = distribuzione piu estrema.
  - kScala piu alto = distribuzione piu compressa verso 50.
  - pesoRaritaMax piu alto = eventi storicamente rarissimi piu forti.
  - pesoConfigBlend piu alto = casi specifici tipo 66,0-65,5 piu forti.
*/

var CULOMETRO_PLUS_CONFIG = {
  versione: "V4-config",

  minPartiteAffidabili: 20,

  /*
    Valore iniziale di calibrazione.
    Se la classifica resta troppo piatta: provare 3.70.
    Se diventa troppo estrema: provare 4.60.
  */
  kScala: 3.50,

  pesoRaritaMax: 6.90,
  pesoConfigBlend: 0.34,

  rarita: [
    { minFreq: 0.100, peso: 1.00 },
    { minFreq: 0.050, peso: 1.18 },
    { minFreq: 0.020, peso: 1.48 },
    { minFreq: 0.010, peso: 1.90 },
    { minFreq: 0.005, peso: 2.45 },
    { minFreq: 0.002, peso: 3.25 },
    { minFreq: 0.001, peso: 4.15 },
    { minFreq: 0.000, peso: 5.25 }
  ],

  pesoLivello: {
    primario: 1.00,
    secondario: 0.24,
    tag: 0.06
  },

  pesoTier: {
    S: 4.80,
    A: 3.45,
    B: 2.35,
    C: 1.45,
    D: 0.75,
    fallback: 1.00
  },

  pesoImpatto: {
    "L_W": 2.05,
    "D_W": 1.62,
    "L_D": 1.32,
    "W_D": 1.32,
    "D_L": 1.62,
    "W_L": 2.05,
    "W": 1.35,
    "D": 1.00,
    "L": 0.85,
    "NESSUNO": 1.00,
    fallback: 1.00
  },

  fasce: [
    { min: 90, label: "Co' 'sso culo puoi andare a cazzi" },
    { min: 85, label: "Protetto dagli dei" },
    { min: 73, label: "Culone conclamato" },
    { min: 66, label: "Fortunello" },
    { min: 53.00001, label: "Non ti lamentare" },
    { min: 48, label: "Ne carne ne pesce" },
    { min: 35, label: "Doveva andare meglio" },
    { min: 28, label: "Sfigatello" },
    { min: 16, label: "Sfiga cieca" },
    { min: 11, label: "Raccoglitore di cetrioli" },
    { min: 0, label: "Vai a farti una vasca a Lourdes" }
  ]
};
