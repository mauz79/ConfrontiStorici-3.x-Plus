/*
  fcmSoglieRecordVisteV2.js
  Viste V2 per record soglie / fattore campo.
  Richiede:
  - persjs/fcmSoglieRecordFunzioni.js
  - persjs/fcmConfrontiDati.js
*/

var SRV_RECORD_ORDER = [
  "fattoreCampo",
  "vittoriaChirurgica",
  "pareggioMiracolato",
  "sconfittaBeffa",
  "pareggioStretto",
  "vittoriaMancata05",
  "sconfittaPelo05",
  "giustoGiusto",
  "sogliaPrecisa"
];

var SRV_RECORD_LABEL = {
  fattoreCampo: "Fattore campo decisivo",
  vittoriaChirurgica: "Vittoria chirurgica",
  pareggioMiracolato: "Pareggio miracolato",
  sconfittaBeffa: "Sconfitta beffa",
  pareggioStretto: "Pareggio stretto",
  vittoriaMancata05: "Vittoria mancata per 0,5",
  sconfittaPelo05: "Sconfitta per un pelo",
  giustoGiusto: "Giusto giusto",
  sogliaPrecisa: "Soglia precisa"
};

var SRV_COMPETIZIONI_CORE = {
  19: { nome: "Serie A", ordine: 1 },
  23: { nome: "Serie B", ordine: 2 },
  48: { nome: "Serie C", ordine: 3 },
  20: { nome: "Coppa Serie A", ordine: 4 },
  24: { nome: "Coppa Serie B", ordine: 5 },
  49: { nome: "Coppa Serie C", ordine: 6 },
  26: { nome: "Coppa tra le Coppe", ordine: 7 },
  63: { nome: "Europa Pipps", ordine: 8 },
  21: { nome: "Supercoppa Serie A", ordine: 9 },
  25: { nome: "Supercoppa Serie B", ordine: 10 },
  50: { nome: "Supercoppa Serie C", ordine: 11 }
};

var SRV_COMP_ALTRE_ID = -1;

var SRV_METRICHE = {
  saldoFortuna: {
    label: "Indice fortuna netto",
    descrizione: "Saldo tra record favorevoli e sfavorevoli: fortuna - sfortuna.",
    val: function(x) { return (x.fortuna || 0) - (x.sfortuna || 0); },
    pct: function(x) { return SRVPctNum(x.fortuna || 0, x.giocate || 0); },
    col: "Saldo"
  },
  fortuna: {
    label: "Botte di culo totali",
    descrizione: "Vittorie chirurgiche + pareggi miracolati.",
    val: function(x) { return x.fortuna || 0; },
    pct: function(x) { return SRVPctNum(x.fortuna || 0, x.giocate || 0); },
    col: "Fortuna"
  },
  sfortuna: {
    label: "Sindrome di Fantozzi totale",
    descrizione: "Sconfitte beffa + pareggi stretti.",
    val: function(x) { return x.sfortuna || 0; },
    pct: function(x) { return SRVPctNum(x.sfortuna || 0, x.giocate || 0); },
    col: "Sfortuna"
  },
  vittChir: {
    label: "Vittorie chirurgiche",
    descrizione: "Vittoria di un solo gol con squadra sulla soglia esatta e avversario a -0,5 dalla stessa soglia.",
    val: function(x) { return x.vittChir || 0; },
    pct: function(x) { return SRVPctNum(x.vittChir || 0, x.giocate || 0); },
    col: "Vitt. chirurgiche"
  },
  parMir: {
    label: "Pareggi miracolati",
    descrizione: "Pareggio salvato da chi raggiunge la soglia esatta mentre l'avversario, pur facendo piu punti, manca la soglia successiva per 0,5.",
    val: function(x) { return x.parMir || 0; },
    pct: function(x) { return SRVPctNum(x.parMir || 0, x.giocate || 0); },
    col: "Par. miracolati"
  },
  sconBeffa: {
    label: "Sconfitte beffa",
    descrizione: "Sconfitta di un solo gol con avversario sulla soglia esatta e squadra a -0,5 dalla stessa soglia.",
    val: function(x) { return x.sconBeffa || 0; },
    pct: function(x) { return SRVPctNum(x.sconBeffa || 0, x.giocate || 0); },
    col: "Sconf. beffa"
  },
  parStretto: {
    label: "Pareggi stretti",
    descrizione: "Pareggio subito da chi fa piu punti, resta a -0,5 dalla soglia successiva e trova l'avversario sulla propria soglia.",
    val: function(x) { return x.parStretto || 0; },
    pct: function(x) { return SRVPctNum(x.parStretto || 0, x.giocate || 0); },
    col: "Par. stretti"
  },
  vittMancata05: {
    label: "Vittorie mancate per 0,5",
    descrizione: "Pareggi in cui alla squadra mancano 0,5 punti per segnare un gol in piu e vincere, indipendentemente dal punteggio dell'avversario.",
    val: function(x) { return x.vittMancata05 || 0; },
    pct: function(x) { return SRVPctNum(x.vittMancata05 || 0, x.giocate || 0); },
    col: "Vitt. mancate"
  },
  sconPelo05: {
    label: "Sconfitte per un pelo",
    descrizione: "Sconfitte di un gol in cui alla squadra mancano 0,5 punti per segnare un gol in piu e pareggiare.",
    val: function(x) { return x.sconPelo05 || 0; },
    pct: function(x) { return SRVPctNum(x.sconPelo05 || 0, x.giocate || 0); },
    col: "Sconf. pelo"
  },
  giustoGiusto: {
    label: "Giusto giusto",
    descrizione: "Vittorie di un gol ottenute pescando esattamente la soglia che basta per il gol decisivo, indipendentemente dal punteggio avversario.",
    val: function(x) { return x.giustoGiusto || 0; },
    pct: function(x) { return SRVPctNum(x.giustoGiusto || 0, x.giocate || 0); },
    col: "Giusto giusto"
  },
  soglie: {
    label: "Tiratori scelti - soglie precise",
    descrizione: "Prestazioni chiuse esattamente su una soglia gol: 66, 72, 77, 81, 85, 89, ecc.",
    val: function(x) { return x.soglie || 0; },
    pct: function(x) { return SRVPctNum(x.soglie || 0, x.giocate || 0); },
    col: "Soglie precise"
  },
  sprecoTotale: {
    label: "Spreco punti in vittorie",
    descrizione: "Punti oltre la soglia gol nelle partite vinte senza ottenere un gol in piu.",
    val: function(x) { return x.sprecoTotale || 0; },
    pct: function(x) { return x.sprecoVittorie ? (x.sprecoTotale || 0) / x.sprecoVittorie : 0; },
    col: "Spreco totale"
  },
  saldoFattoreCampo: {
    label: "Fattore campo - saldo",
    descrizione: "Saldo tra punti guadagnati in casa grazie al +1 e punti persi fuori casa per il +1 avversario.",
    val: function(x) { return x.fcSaldo || 0; },
    pct: function(x) { return SRVPctNum(x.fcProCasa || 0, x.giocate || 0); },
    col: "Saldo FC"
  },
  fcGuadagnatiCasa: {
    label: "Fattore campo - punti guadagnati in casa",
    descrizione: "Punti classifica guadagnati in casa grazie al fattore campo.",
    val: function(x) { return x.fcGuadagnatiCasa || 0; },
    pct: function(x) { return SRVPctNum(x.fcProCasa || 0, x.giocate || 0); },
    col: "Punti guadagnati"
  },
  fcPersiTrasferta: {
    label: "Fattore campo - punti persi in trasferta",
    descrizione: "Punti classifica persi in trasferta per effetto del +1 della squadra di casa avversaria.",
    val: function(x) { return x.fcPersiTrasferta || 0; },
    pct: function(x) { return SRVPctNum(x.fcControTrasferta || 0, x.giocate || 0); },
    col: "Punti persi"
  }
};

function SRVH(s) {
  s = String(s == null ? "" : s);
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function SRVF(n) {
  if (typeof SogRepFmt == "function") return SogRepFmt(n);
  var x = parseFloat(n);
  if (isNaN(x)) x = 0;
  x = Math.round(x * 10) / 10;
  if (Math.abs(x - Math.round(x)) < 0.001) return String(Math.round(x));
  return String(x).replace(".", ",");
}

function SRVPctNum(num, den) {
  num = parseFloat(num || 0);
  den = parseFloat(den || 0);
  if (!den) return 0;
  return (num * 100) / den;
}

function SRVPct(num, den) {
  return SRVF(SRVPctNum(num, den)) + "%";
}

function SRVUltimaStagione() {
  if (typeof SogRepUltimaStagione == "function") return SogRepUltimaStagione();

  var max = 0;
  if (typeof arrConfronti == "undefined") return max;

  for (var i = 1; i < arrConfronti.length; i++) {
    if (arrConfronti[i] && arrConfronti[i].Stagione > max) max = arrConfronti[i].Stagione;
  }

  return max;
}

function SRVNomeCompetizione(id) {
  id = parseInt(id, 10);

  if (id == 0) return "Tutte le competizioni";
  if (id == SRV_COMP_ALTRE_ID) return "Altre competizioni";

  if (SRV_COMPETIZIONI_CORE[id]) {
    return SRV_COMPETIZIONI_CORE[id].nome;
  }

  return "Altre competizioni";
}

function SRVOrdineCompetizione(id) {
  id = parseInt(id, 10);

  if (id == 0) return 0;
  if (id == SRV_COMP_ALTRE_ID) return 99;

  if (SRV_COMPETIZIONI_CORE[id]) {
    return SRV_COMPETIZIONI_CORE[id].ordine;
  }

  return 99;
}

function SRVCompetizioneNormalizzata(id) {
  id = parseInt(id, 10);

  if (SRV_COMPETIZIONI_CORE[id]) return id;

  return SRV_COMP_ALTRE_ID;
}

function SRVMatchCompetizione(idReale, filtroId) {
  idReale = parseInt(idReale, 10);
  filtroId = parseInt(filtroId, 10);

  if (filtroId == 0) return true;

  if (filtroId == SRV_COMP_ALTRE_ID) {
    return !SRV_COMPETIZIONI_CORE[idReale];
  }

  return idReale == filtroId;
}

function SRVUrlGiornata(m) {
  if (typeof SogRepUrlGiornata == "function") return SogRepUrlGiornata(m);

  if (typeof SogRepCartellaStagione != "function") return "";
  var cartella = SogRepCartellaStagione(m.Stagione);
  if (cartella == "") return "";

  var ext = "php";
  if (typeof SOG_REP_EXT != "undefined") ext = SOG_REP_EXT;

  return "../" + cartella + "/ris." + ext + "?Gio=" + m.GiornataA;
}

function SRVLinkGiornata(m) {
  var href = SRVUrlGiornata(m);
  if (href == "") return SRVH(m.GiornataA);
  return "<a href='" + href + "' title='Apri tabellino giornata'>" + SRVH(m.GiornataA) + "</a>";
}

function SRVLinkRisultato(m, testo) {
  var href = SRVUrlGiornata(m);
  if (href == "") return testo;
  return "<a href='" + href + "' title='Apri tabellino partita/giornata'>" + testo + "</a>";
}

function SRVParseEffettoFc(effetto) {
  var out = { casa: 0, fuori: 0 };
  effetto = String(effetto || "");

  var mCasa = effetto.match(/\+([0-9]+)\s*casa/i);
  var mFuori = effetto.match(/(-?[0-9]+)\s*fuori/i);

  if (mCasa) out.casa = parseInt(mCasa[1], 10);
  if (mFuori) out.fuori = parseInt(mFuori[1], 10);

  return out;
}

function SRVGetStagioni() {
  var map = {};
  var arr = [];

  if (typeof arrConfronti == "undefined") return arr;

  for (var i = 1; i < arrConfronti.length; i++) {
    var m = arrConfronti[i];
    if (!m) continue;

    if (!map[m.Stagione]) {
      map[m.Stagione] = true;
      arr.push(m.Stagione);
    }
  }

  arr.sort(function(a, b) { return b - a; });
  return arr;
}

function SRVGetCompetizioni(stagione) {
  var map = {};
  var arr = [];

  if (typeof arrConfronti == "undefined") return arr;

  for (var i = 1; i < arrConfronti.length; i++) {
    var m = arrConfronti[i];
    if (!m) continue;
    if (stagione != 0 && m.Stagione != stagione) continue;

    var idNorm = SRVCompetizioneNormalizzata(m.Competizione);

    if (!map[idNorm]) {
      map[idNorm] = true;
      arr.push({
        id: idNorm,
        nome: SRVNomeCompetizione(idNorm),
        ordine: SRVOrdineCompetizione(idNorm)
      });
    }
  }

  arr.sort(function(a, b) {
    if (a.ordine != b.ordine) return a.ordine - b.ordine;
    return String(a.nome).localeCompare(String(b.nome));
  });

  return arr;
}

function SRVGetSquadreAttualiMap() {
  var ultima = SRVUltimaStagione();
  var map = {};

  if (typeof arrConfronti == "undefined") return map;

  for (var i = 1; i < arrConfronti.length; i++) {
    var m = arrConfronti[i];
    if (!m) continue;
    if (m.Stagione != ultima) continue;

    map[m.SquadraCasa] = true;
    map[m.SquadraFuori] = true;
  }

  return map;
}

function SRVNewStat(nome) {
  return {
    nome: nome,
    giocate: 0,
    fortuna: 0,
    sfortuna: 0,
    vittChir: 0,
    parMir: 0,
    sconBeffa: 0,
    parStretto: 0,
    vittMancata05: 0,
    sconPelo05: 0,
    giustoGiusto: 0,
    mezzoPuntoNeg: 0,
    mezzoPuntoPos: 0,
    soglie: 0,
    soglieV: 0,
    soglieN: 0,
    soglieP: 0,
    sprecoTotale: 0,
    sprecoVittorie: 0,
    fcProCasa: 0,
    fcControTrasferta: 0,
    fcGuadagnatiCasa: 0,
    fcPersiTrasferta: 0,
    fcSaldo: 0
  };
}

function SRVEnsureStat(map, nome) {
  if (!map[nome]) map[nome] = SRVNewStat(nome);
  return map[nome];
}

function SRVPuntiClassifica(gf, gs) {
  if (gf > gs) return 3;
  if (gf == gs) return 1;
  return 0;
}

function SRVBaseStats(stagione, compId) {
  var map = {};

  if (typeof arrConfronti == "undefined") return map;

  for (var i = 1; i < arrConfronti.length; i++) {
    var m = arrConfronti[i];
    if (!m) continue;
    if (stagione != 0 && m.Stagione != stagione) continue;
    if (!SRVMatchCompetizione(m.Competizione, compId)) continue;

    SRVEnsureStat(map, m.SquadraCasa).giocate++;
    SRVEnsureStat(map, m.SquadraFuori).giocate++;
  }

  return map;
}


function SRVAddRow(rows, row) {
  if (!rows || !row) return;
  rows.push(row);
}

function SRVBuildRowsFromAnalisi(res, compId) {
  var rows = [];

  for (var i = 0; i < res.eventiFortuna.length; i++) {
    var e = res.eventiFortuna[i];
    if (!SRVMatchCompetizione(e.m.Competizione, compId)) continue;

    var key = "";
    if (e.tipo == "Vittoria chirurgica") key = "vittoriaChirurgica";
    if (e.tipo == "Pareggio miracolato") key = "pareggioMiracolato";

    SRVAddRow(rows, {
      key: key,
      tipo: e.tipo,
      m: e.m,
      squadra: e.squadra,
      avversario: e.avversario,
      coinvolti: "|" + e.squadra + "|" + e.avversario + "|",
      puntiHtml: SRVLinkRisultato(e.m, SRVF(e.punti) + " - " + SRVF(e.puntiAvv)),
      risHtml: SRVLinkRisultato(e.m, "<b>" + e.gol + "-" + e.golAvv + "</b>"),
      invHtml: "",
      effetto: "",
      nota: e.nota,
      metric: Math.round(parseFloat(e.punti || 0) * 10)
    });
  }

  for (var j = 0; j < res.eventiSfortuna.length; j++) {
    var s = res.eventiSfortuna[j];
    if (!SRVMatchCompetizione(s.m.Competizione, compId)) continue;

    var skey = "";
    if (s.tipo == "Sconfitta beffa") skey = "sconfittaBeffa";
    if (s.tipo == "Pareggio stretto") skey = "pareggioStretto";

    SRVAddRow(rows, {
      key: skey,
      tipo: s.tipo,
      m: s.m,
      squadra: s.squadra,
      avversario: s.avversario,
      coinvolti: "|" + s.squadra + "|" + s.avversario + "|",
      puntiHtml: SRVLinkRisultato(s.m, SRVF(s.punti) + " - " + SRVF(s.puntiAvv)),
      risHtml: SRVLinkRisultato(s.m, "<b>" + s.gol + "-" + s.golAvv + "</b>"),
      invHtml: "",
      effetto: "",
      nota: s.nota,
      metric: Math.round(parseFloat(s.punti || 0) * 10)
    });
  }

  if (res.eventiMezzoPunto) {
    for (var mp = 0; mp < res.eventiMezzoPunto.length; mp++) {
      var me = res.eventiMezzoPunto[mp];
      if (!SRVMatchCompetizione(me.m.Competizione, compId)) continue;

      var mkey = "";
      if (me.tipo == "Vittoria mancata per 0,5") mkey = "vittoriaMancata05";
      if (me.tipo == "Sconfitta per un pelo") mkey = "sconfittaPelo05";
      if (me.tipo == "Giusto giusto") mkey = "giustoGiusto";

      SRVAddRow(rows, {
        key: mkey,
        tipo: me.tipo,
        m: me.m,
        squadra: me.squadra,
        avversario: me.avversario,
        coinvolti: "|" + me.squadra + "|" + me.avversario + "|",
        puntiHtml: SRVLinkRisultato(me.m, SRVF(me.punti) + " - " + SRVF(me.puntiAvv)),
        risHtml: SRVLinkRisultato(me.m, "<b>" + me.gol + "-" + me.golAvv + "</b>"),
        invHtml: "",
        effetto: "",
        nota: me.nota,
        metric: Math.round(parseFloat(me.punti || 0) * 10)
      });
    }
  }

  for (var k = 0; k < res.eventiSoglia.length; k++) {
    var q = res.eventiSoglia[k];
    if (!SRVMatchCompetizione(q.m.Competizione, compId)) continue;

    SRVAddRow(rows, {
      key: "sogliaPrecisa",
      tipo: "Soglia precisa",
      m: q.m,
      squadra: q.squadra,
      avversario: q.avversario,
      coinvolti: "|" + q.squadra + "|" + q.avversario + "|",
      puntiHtml: SRVLinkRisultato(q.m, SRVF(q.punti) + " - " + SRVF(q.puntiAvv)),
      risHtml: SRVLinkRisultato(q.m, "<b>" + q.gol + "-" + q.golAvv + "</b>"),
      invHtml: "",
      effetto: "",
      nota: q.nota,
      metric: Math.round(parseFloat(q.punti || 0) * 10)
    });
  }

  for (var f = 0; f < res.eventiFattoreCampo.length; f++) {
    var fc = res.eventiFattoreCampo[f];
    if (!SRVMatchCompetizione(fc.m.Competizione, compId)) continue;

    var reale = SRVF(fc.pc) + " - " + SRVF(fc.pf) + " (" + fc.gc + "-" + fc.gf + ")";
    var invertito = SRVF(fc.pcInv) + " - " + SRVF(fc.pfInv) + " (" + fc.gcInv + "-" + fc.gfInv + ")";
    var effetto = "+" + fc.deltaCasa + " casa / " + fc.deltaFuori + " fuori";

    var nota = "";
    if (fc.tipo == "Da sconfitta a vittoria") nota = "Il +1 casa ribalta completamente la partita: senza fattore campo la squadra di casa avrebbe perso, invece vince.";
    else if (fc.tipo == "Da pareggio a vittoria") nota = "Il +1 casa trasforma un pareggio virtuale in vittoria reale.";
    else if (fc.tipo == "Da sconfitta a pareggio") nota = "Il +1 casa evita la sconfitta e salva il pareggio.";
    else nota = "Il fattore campo migliora il risultato della squadra di casa.";

    SRVAddRow(rows, {
      key: "fattoreCampo",
      tipo: "Fattore campo decisivo - " + fc.tipo,
      m: fc.m,
      squadra: fc.casa,
      avversario: fc.fuori,
      coinvolti: "|" + fc.casa + "|" + fc.fuori + "|",
      puntiHtml: SRVLinkRisultato(fc.m, reale),
      risHtml: SRVLinkRisultato(fc.m, "<b>" + fc.gc + "-" + fc.gf + "</b>"),
      invHtml: SRVLinkRisultato(fc.m, invertito),
      effetto: effetto,
      nota: nota,
      metric: (fc.deltaCasa * 1000) + (fc.swingGol || 0)
    });
  }

  rows.sort(function(a, b) {
    if (b.metric != a.metric) return b.metric - a.metric;
    if (b.m.Stagione != a.m.Stagione) return b.m.Stagione - a.m.Stagione;
    if (String(a.m.Data) < String(b.m.Data)) return 1;
    if (String(a.m.Data) > String(b.m.Data)) return -1;
    return String(a.squadra).localeCompare(String(b.squadra));
  });

  return rows;
}

function SRVApplyRowsToStats(stats, rows) {
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];

    if (r.key == "fattoreCampo") {
      var stCasa = SRVEnsureStat(stats, r.squadra);
      var stFuori = SRVEnsureStat(stats, r.avversario);
      var eff = SRVParseEffettoFc(r.effetto);

      stCasa.fcProCasa++;
      stCasa.fcGuadagnatiCasa += eff.casa;
      stCasa.fcSaldo += eff.casa;

      stFuori.fcControTrasferta++;
      stFuori.fcPersiTrasferta += Math.abs(eff.fuori);
      stFuori.fcSaldo -= Math.abs(eff.fuori);
    }

    if (r.key == "sogliaPrecisa") {
      var stS = SRVEnsureStat(stats, r.squadra);
      stS.soglie++;

      var txt = String(r.risHtml).replace(/<[^>]*>/g, "");
      var p = txt.split("-");
      var gf = parseInt(p[0], 10);
      var gs = parseInt(p[1], 10);
      var pc = SRVPuntiClassifica(gf, gs);

      if (pc == 3) stS.soglieV++;
      else if (pc == 1) stS.soglieN++;
      else stS.soglieP++;
    }

    if (r.key == "vittoriaChirurgica") {
      var stV = SRVEnsureStat(stats, r.squadra);
      stV.fortuna++;
      stV.vittChir++;
    }

    if (r.key == "pareggioMiracolato") {
      var stP = SRVEnsureStat(stats, r.squadra);
      stP.fortuna++;
      stP.parMir++;
    }

    if (r.key == "sconfittaBeffa") {
      var stB = SRVEnsureStat(stats, r.squadra);
      stB.sfortuna++;
      stB.sconBeffa++;
    }

    if (r.key == "pareggioStretto") {
      var stT = SRVEnsureStat(stats, r.squadra);
      stT.sfortuna++;
      stT.parStretto++;
    }

    if (r.key == "vittoriaMancata05") {
      var stVM = SRVEnsureStat(stats, r.squadra);
      stVM.mezzoPuntoNeg++;
      stVM.vittMancata05++;
    }

    if (r.key == "sconfittaPelo05") {
      var stSP = SRVEnsureStat(stats, r.squadra);
      stSP.mezzoPuntoNeg++;
      stSP.sconPelo05++;
    }

    if (r.key == "giustoGiusto") {
      var stGG = SRVEnsureStat(stats, r.squadra);
      stGG.mezzoPuntoPos++;
      stGG.giustoGiusto++;
    }
  }
}

function SRVAnalizzaVista(stagione, compId) {
  var res = SogRepAnalizza(stagione);
  var rows = SRVBuildRowsFromAnalisi(res, compId);
  var stats = SRVBaseStats(stagione, compId);

  SRVApplyRowsToStats(stats, rows);

  return {
    stagione: stagione,
    compId: compId,
    res: res,
    rows: rows,
    stats: stats,
    partite: SRVContaPartite(stagione, compId)
  };
}

function SRVContaPartite(stagione, compId) {
  var n = 0;

  if (typeof arrConfronti == "undefined") return 0;

  for (var i = 1; i < arrConfronti.length; i++) {
    var m = arrConfronti[i];
    if (!m) continue;
    if (stagione != 0 && m.Stagione != stagione) continue;
    if (!SRVMatchCompetizione(m.Competizione, compId)) continue;
    n++;
  }

  return n;
}

function SRVStatsArray(stats) {
  var a = [];

  for (var k in stats) {
    if (stats.hasOwnProperty(k)) a.push(stats[k]);
  }

  return a;
}

function SRVTopConPariMerito(arr, topN, fnVal) {
  if (topN >= arr.length) return arr;
  if (topN <= 0) return [];

  var limite = fnVal(arr[topN - 1]);
  var out = [];

  for (var i = 0; i < arr.length; i++) {
    if (i < topN || fnVal(arr[i]) == limite) out.push(arr[i]);
  }

  return out;
}

function SRVFiltroNumero(id) {
  var v = document.getElementById(id).value;
  if (v == "tutti") return 999999;
  return parseInt(v, 10);
}

function SRVSetTab(tabName) {
  var tabs = document.getElementsByTagName("div");

  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].className == "srv-tab") tabs[i].style.display = "none";
  }

  var el = document.getElementById(tabName);
  if (el) el.style.display = "block";
}

function SRVFillStagioni(selectId) {
  var sel = document.getElementById(selectId);
  var arr = SRVGetStagioni();

  sel.options.length = 0;

  for (var i = 0; i < arr.length; i++) {
    var opt = document.createElement("option");
    opt.value = arr[i];
    opt.text = "Stagione " + arr[i];
    sel.options.add(opt);
  }

  sel.value = SRVUltimaStagione();
}

function SRVFillCompetizioni(selectId, stagione, includiTutte) {
  var sel = document.getElementById(selectId);
  var old = sel.value;

  sel.options.length = 0;

  if (includiTutte) {
    var optAll = document.createElement("option");
    optAll.value = "0";
    optAll.text = "Tutte le competizioni";
    sel.options.add(optAll);
  }

  var arr = SRVGetCompetizioni(stagione);

  for (var i = 0; i < arr.length; i++) {
    var opt = document.createElement("option");
    opt.value = arr[i].id;
    opt.text = arr[i].nome;
    sel.options.add(opt);
  }

  sel.value = old;
  if (sel.selectedIndex < 0) sel.value = "0";
}

function SRVFillRecord(selectId, includiTutti) {
  var sel = document.getElementById(selectId);
  sel.options.length = 0;

  if (includiTutti) {
    var optAll = document.createElement("option");
    optAll.value = "tutti";
    optAll.text = "Tutti i record";
    sel.options.add(optAll);
  }

  for (var i = 0; i < SRV_RECORD_ORDER.length; i++) {
    var k = SRV_RECORD_ORDER[i];
    var opt = document.createElement("option");
    opt.value = k;
    opt.text = SRV_RECORD_LABEL[k];
    sel.options.add(opt);
  }
}

function SRVFillMetriche(selectId) {
  var sel = document.getElementById(selectId);
  sel.options.length = 0;

  var optTutti = document.createElement("option");
  optTutti.value = "tutti";
  optTutti.text = "Tutti";
  sel.options.add(optTutti);

  var ordine = [
    "saldoFortuna",
    "fortuna",
    "sfortuna",
    "vittChir",
    "parMir",
    "sconBeffa",
    "parStretto",
    "vittMancata05",
    "sconPelo05",
    "giustoGiusto",
    "soglie",
    "sprecoTotale",
    "saldoFattoreCampo",
    "fcGuadagnatiCasa",
    "fcPersiTrasferta"
  ];

  for (var i = 0; i < ordine.length; i++) {
    var k = ordine[i];
    var opt = document.createElement("option");
    opt.value = k;
    opt.text = SRV_METRICHE[k].label;
    sel.options.add(opt);
  }
}

function SRVFillSquadre(selectId, stats, includiTutte) {
  var sel = document.getElementById(selectId);
  var old = sel.value;
  var arr = SRVStatsArray(stats);

  arr.sort(function(a, b) {
    return String(a.nome).localeCompare(String(b.nome));
  });

  sel.options.length = 0;

  if (includiTutte) {
    var optAll = document.createElement("option");
    optAll.value = "";
    optAll.text = "Tutte";
    sel.options.add(optAll);
  }

  for (var i = 0; i < arr.length; i++) {
    var opt = document.createElement("option");
    opt.value = arr[i].nome;
    opt.text = arr[i].nome;
    sel.options.add(opt);
  }

  sel.value = old;
  if (sel.selectedIndex < 0) sel.value = "";
}

function SRVRenderRiepilogo(targetId, vista, squadraFiltro) {
  var rows = vista.rows;
  var stats = vista.stats;
  var partite = vista.partite;
  var prestazioni = partite * 2;

  var globale = {
    fortuna: 0,
    sfortuna: 0,
    vittChir: 0,
    parMir: 0,
    sconBeffa: 0,
    parStretto: 0,
    vittMancata05: 0,
    sconPelo05: 0,
    giustoGiusto: 0,
    fc: 0,
    fcPuntiCasa: 0,
    fcPuntiFuori: 0,
    soglie: 0
  };

  var comp = {};

  function ensureComp(r) {
    var idNormComp = SRVCompetizioneNormalizzata(r.m.Competizione);
    var ck = "C" + idNormComp;

    if (!comp[ck]) {
      var partiteComp = SRVContaPartite(vista.stagione, idNormComp);

      comp[ck] = {
        id: idNormComp,
        nome: SRVNomeCompetizione(idNormComp),
        ordine: SRVOrdineCompetizione(idNormComp),
        partite: partiteComp,
        prestazioni: partiteComp * 2,
        fortuna: 0,
        sfortuna: 0,
        vittChir: 0,
        parMir: 0,
        sconBeffa: 0,
        parStretto: 0,
        vittMancata05: 0,
        sconPelo05: 0,
        giustoGiusto: 0,
        fc: 0,
        fcPuntiCasa: 0,
        fcPuntiFuori: 0,
        soglie: 0
      };
    }

    return comp[ck];
  }

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var co = ensureComp(r);

    if (r.key == "vittoriaChirurgica") { globale.fortuna++; globale.vittChir++; co.fortuna++; co.vittChir++; }
    if (r.key == "pareggioMiracolato") { globale.fortuna++; globale.parMir++; co.fortuna++; co.parMir++; }
    if (r.key == "sconfittaBeffa") { globale.sfortuna++; globale.sconBeffa++; co.sfortuna++; co.sconBeffa++; }
    if (r.key == "pareggioStretto") { globale.sfortuna++; globale.parStretto++; co.sfortuna++; co.parStretto++; }
    if (r.key == "vittoriaMancata05") { globale.vittMancata05++; co.vittMancata05++; }
    if (r.key == "sconfittaPelo05") { globale.sconPelo05++; co.sconPelo05++; }
    if (r.key == "giustoGiusto") { globale.giustoGiusto++; co.giustoGiusto++; }

    if (r.key == "fattoreCampo") {
      var eff = SRVParseEffettoFc(r.effetto);
      globale.fc++;
      globale.fcPuntiCasa += eff.casa;
      globale.fcPuntiFuori += eff.fuori;

      co.fc++;
      co.fcPuntiCasa += eff.casa;
      co.fcPuntiFuori += eff.fuori;
    }

    if (r.key == "sogliaPrecisa") {
      globale.soglie++;
      co.soglie++;
    }
  }

  var html = "";

  html += "<div class='srv-note'>";
  html += "<b>Riepilogo numerico</b><br>";
  html += "Sintesi di record stretti fortuna/sfortuna, record mezzo punto, fattore campo decisivo e soglie precise.";
  html += "</div>";

  html += "<h3>Impatto complessivo</h3>";
  html += "<table class='tb'>";
  html += "<tr><th>Partite</th><th>Prestazioni</th><th>Botte</th><th>Fantozzi</th><th>Saldo F/S</th><th>Vitt. mancate 0,5</th><th>Sconf. pelo</th><th>Giusto giusto</th><th>FC decisivo</th><th>% FC</th><th>Soglie</th><th>% soglie</th></tr>";
  html += "<tr>";
  html += "<td class='num'>" + partite + "</td>";
  html += "<td class='num'>" + prestazioni + "</td>";
  html += "<td class='num good'>" + globale.fortuna + "</td>";
  html += "<td class='num bad'>" + globale.sfortuna + "</td>";
  html += "<td class='num'>" + (globale.fortuna - globale.sfortuna) + "</td>";
  html += "<td class='num bad'>" + globale.vittMancata05 + "</td>";
  html += "<td class='num bad'>" + globale.sconPelo05 + "</td>";
  html += "<td class='num good'>" + globale.giustoGiusto + "</td>";
  html += "<td class='num good'>" + globale.fc + "</td>";
  html += "<td class='num'>" + SRVPct(globale.fc, partite) + "</td>";
  html += "<td class='num good'>" + globale.soglie + "</td>";
  html += "<td class='num'>" + SRVPct(globale.soglie, prestazioni) + "</td>";
  html += "</tr>";
  html += "</table>";

  var arrComp = [];
  for (var ck in comp) {
    if (comp.hasOwnProperty(ck)) arrComp.push(comp[ck]);
  }

  arrComp.sort(function(a, b) {
    if (a.ordine != b.ordine) return a.ordine - b.ordine;
    return String(a.nome).localeCompare(String(b.nome));
  });

  html += "<h3>Impatto per competizione</h3>";
  html += "<table class='tb'>";
  html += "<tr><th>Competizione</th><th>Partite</th><th>Botte</th><th>Fantozzi</th><th>Saldo</th><th>Vitt. mancate</th><th>Sconf. pelo</th><th>Giusto giusto</th><th>FC</th><th>Soglie</th></tr>";

  for (var c = 0; c < arrComp.length; c++) {
    var co = arrComp[c];
    html += "<tr>";
    html += "<td><b>" + SRVH(co.nome) + "</b></td>";
    html += "<td class='num'>" + co.partite + "</td>";
    html += "<td class='num'>" + co.fortuna + "</td>";
    html += "<td class='num'>" + co.sfortuna + "</td>";
    html += "<td class='num'>" + (co.fortuna - co.sfortuna) + "</td>";
    html += "<td class='num'>" + co.vittMancata05 + "</td>";
    html += "<td class='num'>" + co.sconPelo05 + "</td>";
    html += "<td class='num'>" + co.giustoGiusto + "</td>";
    html += "<td class='num'>" + co.fc + "</td>";
    html += "<td class='num'>" + co.soglie + "</td>";
    html += "</tr>";
  }

  if (arrComp.length == 0) html += "<tr><td colspan='10'>Nessun dato.</td></tr>";
  html += "</table>";

  var arrStats = SRVStatsArray(stats);
  if (squadraFiltro != "") {
    var solo = [];
    for (var sx = 0; sx < arrStats.length; sx++) {
      if (arrStats[sx].nome == squadraFiltro) solo.push(arrStats[sx]);
    }
    arrStats = solo;
  }

  arrStats.sort(function(a, b) {
    if (((b.fortuna || 0) - (b.sfortuna || 0)) != ((a.fortuna || 0) - (a.sfortuna || 0))) return ((b.fortuna || 0) - (b.sfortuna || 0)) - ((a.fortuna || 0) - (a.sfortuna || 0));
    if ((b.giustoGiusto || 0) != (a.giustoGiusto || 0)) return (b.giustoGiusto || 0) - (a.giustoGiusto || 0);
    if ((b.soglie || 0) != (a.soglie || 0)) return (b.soglie || 0) - (a.soglie || 0);
    return String(a.nome).localeCompare(String(b.nome));
  });

  html += "<h3>Impatto per squadra</h3>";
  html += "<table class='tb'>";
  html += "<tr><th>Squadra</th><th>Giocate</th><th>Botte</th><th>Fantozzi</th><th>Saldo F/S</th><th>Vitt. mancate</th><th>Sconf. pelo</th><th>Giusto giusto</th><th>FC pro</th><th>FC contro</th><th>Saldo FC</th><th>Soglie</th><th>% soglie</th></tr>";

  for (var s = 0; s < arrStats.length; s++) {
    var sq = arrStats[s];
    html += "<tr>";
    html += "<td><b>" + SRVH(sq.nome) + "</b></td>";
    html += "<td class='num'>" + sq.giocate + "</td>";
    html += "<td class='num good'>" + (sq.fortuna || 0) + "</td>";
    html += "<td class='num bad'>" + (sq.sfortuna || 0) + "</td>";
    html += "<td class='num'>" + ((sq.fortuna || 0) - (sq.sfortuna || 0)) + "</td>";
    html += "<td class='num bad'>" + (sq.vittMancata05 || 0) + "</td>";
    html += "<td class='num bad'>" + (sq.sconPelo05 || 0) + "</td>";
    html += "<td class='num good'>" + (sq.giustoGiusto || 0) + "</td>";
    html += "<td class='num'>" + (sq.fcProCasa || 0) + "</td>";
    html += "<td class='num'>" + (sq.fcControTrasferta || 0) + "</td>";
    html += "<td class='num'>" + (sq.fcSaldo || 0) + "</td>";
    html += "<td class='num'>" + (sq.soglie || 0) + "</td>";
    html += "<td class='num'>" + SRVPct(sq.soglie || 0, sq.giocate || 0) + "</td>";
    html += "</tr>";
  }

  if (arrStats.length == 0) html += "<tr><td colspan='13'>Nessun dato.</td></tr>";
  html += "</table>";

  document.getElementById(targetId).innerHTML = html;
}

function SRVRenderDettaglio(targetId, vista, recordFiltro, squadraFiltro, topN) {
  var rows = vista.rows;
  var html = "";

  html += "<div class='srv-note'>";
  html += "<b>Dettaglio gare</b><br>";
  html += "Se scegli <b>Tutti i record</b>, il numero selezionato vale per ogni tipo di record. I record mezzo punto sono categorie larghe: possono sovrapporsi ai record stretti, ma sono conteggiati separatamente. In caso di pari merito sull'ultima posizione, vengono mostrati tutti i pari.";
  html += "</div>";

  html += "<table class='tb'>";
  html += "<tr><th>Tipo</th><th>Stag.</th><th>Data</th><th>Competizione</th><th>Giorn.</th><th>Squadra</th><th>Avversario</th><th>Punti/Reale</th><th>Ris.</th><th>A campi invertiti</th><th>Effetto</th><th>Nota</th></tr>";

  var out = [];

  if (recordFiltro == "tutti") {
    for (var g = 0; g < SRV_RECORD_ORDER.length; g++) {
      var key = SRV_RECORD_ORDER[g];
      var gruppo = [];

      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r.key != key) continue;
        if (squadraFiltro != "" && r.coinvolti.indexOf("|" + squadraFiltro + "|") < 0) continue;
        gruppo.push(r);
      }

      gruppo = SRVTopConPariMerito(gruppo, topN, function(x) { return x.metric; });

      for (var j = 0; j < gruppo.length; j++) out.push(gruppo[j]);
    }
  } else {
    for (var k = 0; k < rows.length; k++) {
      var x = rows[k];
      if (x.key != recordFiltro) continue;
      if (squadraFiltro != "" && x.coinvolti.indexOf("|" + squadraFiltro + "|") < 0) continue;
      out.push(x);
    }

    out = SRVTopConPariMerito(out, topN, function(z) { return z.metric; });
  }

  for (var n = 0; n < out.length; n++) {
    var e = out[n];

    html += "<tr>";
    html += "<td>" + SRVH(e.tipo) + "</td>";
    html += "<td class='cen'>" + e.m.Stagione + "</td>";
    html += "<td>" + SRVH(e.m.Data) + "</td>";
    html += "<td>" + SRVH(SRVNomeCompetizione(e.m.Competizione)) + "</td>";
    html += "<td class='cen'>" + SRVLinkGiornata(e.m) + "</td>";
    html += "<td><b>" + SRVH(e.squadra) + "</b></td>";
    html += "<td>" + SRVH(e.avversario) + "</td>";
    html += "<td class='cen'>" + e.puntiHtml + "</td>";
    html += "<td class='cen'>" + e.risHtml + "</td>";
    html += "<td class='cen'>" + (e.invHtml || "") + "</td>";
    html += "<td class='cen'>" + SRVH(e.effetto || "") + "</td>";
    html += "<td>" + SRVH(e.nota || "") + "</td>";
    html += "</tr>";
  }

  if (out.length == 0) html += "<tr><td colspan='12'>Nessun record trovato.</td></tr>";

  html += "</table>";
  document.getElementById(targetId).innerHTML = html;
}

function SRVRenderClassifica(targetId, vista, metricaKey, filtroAttuali, topN) {
  if (metricaKey == "tutti") {
    var ordineTutti = [
      "saldoFortuna",
      "fortuna",
      "sfortuna",
      "vittChir",
      "parMir",
      "sconBeffa",
      "parStretto",
      "soglie",
      "sprecoTotale",
      "saldoFattoreCampo",
      "fcGuadagnatiCasa",
      "fcPersiTrasferta"
    ];

    var htmlTutti = "";
    htmlTutti += "<div class='srv-note'>";
    htmlTutti += "<b>Tutte le classifiche aggregate</b><br>";
    htmlTutti += "Il numero selezionato vale per ogni singola classifica. In caso di pari merito sull'ultima posizione, vengono mostrate tutte le squadre pari.";
    htmlTutti += "</div>";

    document.getElementById(targetId).innerHTML = htmlTutti;

    for (var mt = 0; mt < ordineTutti.length; mt++) {
      SRVRenderClassificaAppend(targetId, vista, ordineTutti[mt], filtroAttuali, topN);
    }

    return;
  }

  document.getElementById(targetId).innerHTML = "";
  SRVRenderClassificaAppend(targetId, vista, metricaKey, filtroAttuali, topN);
}

function SRVRenderClassificaAppend(targetId, vista, metricaKey, filtroAttuali, topN) {
  var met = SRV_METRICHE[metricaKey];
  var arr = SRVStatsArray(vista.stats);
  var attuali = SRVGetSquadreAttualiMap();

  if (filtroAttuali == "attuali") {
    var solo = [];
    for (var i = 0; i < arr.length; i++) {
      if (attuali[arr[i].nome]) solo.push(arr[i]);
    }
    arr = solo;
  }

  arr.sort(function(a, b) {
    var va = met.val(a);
    var vb = met.val(b);
    if (vb != va) return vb - va;
    return String(a.nome).localeCompare(String(b.nome));
  });

  var filtrati = [];
  for (var j = 0; j < arr.length; j++) {
    if (met.val(arr[j]) != 0) filtrati.push(arr[j]);
  }

  filtrati = SRVTopConPariMerito(filtrati, topN, function(x) { return met.val(x); });

  var html = "";

  html += "<div class='srv-note'>";
  html += "<b>" + SRVH(met.label) + "</b><br>";
  html += SRVH(met.descrizione) + "<br>";
  html += "In caso di pari merito sull'ultima posizione, vengono mostrate tutte le squadre pari.";
  html += "</div>";

  html += "<table class='tb'>";
  html += "<tr><th>Pos.</th><th>Squadra</th><th>Giocate</th><th>" + SRVH(met.col) + "</th><th>Indice %</th><th>Fortuna</th><th>Sfortuna</th><th>Saldo F/S</th><th>Soglie</th><th>% soglie</th><th>Saldo FC</th></tr>";

  for (var r = 0; r < filtrati.length; r++) {
    var x = filtrati[r];

    html += "<tr>";
    html += "<td class='cen'>" + (r + 1) + "</td>";
    html += "<td><b>" + SRVH(x.nome) + "</b></td>";
    html += "<td class='num'>" + x.giocate + "</td>";
    html += "<td class='num good'>" + SRVF(met.val(x)) + "</td>";
    html += "<td class='num'>" + SRVF(met.pct(x)) + "%</td>";
    html += "<td class='num'>" + x.fortuna + " (" + SRVPct(x.fortuna, x.giocate) + ")</td>";
    html += "<td class='num'>" + x.sfortuna + " (" + SRVPct(x.sfortuna, x.giocate) + ")</td>";
    html += "<td class='num'>" + ((x.fortuna || 0) - (x.sfortuna || 0)) + "</td>";
    html += "<td class='num'>" + x.soglie + "</td>";
    html += "<td class='num'>" + SRVPct(x.soglie, x.giocate) + "</td>";
    html += "<td class='num'>" + x.fcSaldo + "</td>";
    html += "</tr>";
  }

  if (filtrati.length == 0) html += "<tr><td colspan='11'>Nessun dato.</td></tr>";

  html += "</table>";

  document.getElementById(targetId).innerHTML += html;
}