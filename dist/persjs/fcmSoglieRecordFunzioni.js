/*
  fcmSoglieRecordFunzioni.js
  Vista aggiuntiva per ConfrontiStorici: soglie, fortuna/sfortuna, fattore campo, mezzo punto.
  Non modifica il plugin originale: legge arrConfronti e arrDirectory da fcmConfrontiDati.js.
*/

if (typeof X === "undefined") {
  function X(Stagione, Salve, Directory) {
    this.Stagione = Stagione;
    this.Salve = Salve;
    this.Directory = Directory;
  }
}

if (typeof ZP === "undefined") {
  function ZP(Competizione, Label, Icona) {
    this.Competizione = Competizione;
    this.Label = Label;
    this.Icona = Icona;
  }
}

if (typeof Y === "undefined") {
  function Y(Stagione, Competizione, GiornataA, Data, IDASquadraCasa, SquadraCasa, IDASquadraFuori, SquadraFuori, Neutro, GolCasa, GolFuori, TipoRis, GolRegoCasa, GolRegoFuori, GolSupplCasa, GolSupplFuori, GolRigoriCasa, GolRigoriFuori, PuntiCasa, PuntiFuori) {
    this.Stagione = Stagione;
    this.Competizione = Competizione;
    this.GiornataA = GiornataA;
    this.Data = Data;
    this.IDASquadraCasa = IDASquadraCasa;
    this.SquadraCasa = SquadraCasa;
    this.IDASquadraFuori = IDASquadraFuori;
    this.SquadraFuori = SquadraFuori;
    this.Neutro = Neutro;
    this.GolCasa = GolCasa;
    this.GolFuori = GolFuori;
    this.TipoRis = TipoRis;
    this.GolRegoCasa = GolRegoCasa;
    this.GolRegoFuori = GolRegoFuori;
    this.GolSupplCasa = GolSupplCasa;
    this.GolSupplFuori = GolSupplFuori;
    this.GolRigoriCasa = GolRigoriCasa;
    this.GolRigoriFuori = GolRigoriFuori;
    this.PuntiCasa = PuntiCasa;
    this.PuntiFuori = PuntiFuori;
  }
}

var SOG_REP_SOGLIE = [66, 72, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113];
var SOG_REP_EXT = "php";

function SogRepQS(nome) {
  var q = window.location.search.substring(1).split("&");
  for (var i = 0; i < q.length; i++) {
    var p = q[i].split("=");
    if (decodeURIComponent(p[0]) == nome) return decodeURIComponent((p[1] || "").replace(/\+/g, " "));
  }
  return "";
}

function SogRepHtml(s) {
  s = String(s == null ? "" : s);
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function SogRepNum(n) {
  var x = parseFloat(n);
  if (isNaN(x)) return 0;
  return Math.round(x * 10) / 10;
}

function SogRepFmt(n) {
  var x = SogRepNum(n);
  if (Math.abs(x - Math.round(x)) < 0.001) return String(Math.round(x));
  return String(x).replace(".", ",");
}

function SogRepGolDaPunti(punti) {
  var p = SogRepNum(punti);
  var g = 0;
  for (var i = 0; i < SOG_REP_SOGLIE.length; i++) {
    if (p >= SOG_REP_SOGLIE[i]) g = i + 1;
  }
  return g;
}

function SogRepSogliaGol(gol) {
  if (gol <= 0) return null;
  if (gol - 1 < SOG_REP_SOGLIE.length) return SOG_REP_SOGLIE[gol - 1];
  return null;
}

function SogRepSogliaSuccessivaDaGol(gol) {
  if (gol < 0) return null;
  if (gol < SOG_REP_SOGLIE.length) return SOG_REP_SOGLIE[gol];
  return null;
}

function SogRepASogliaPrecisa(punti) {
  var p = SogRepNum(punti);
  for (var i = 0; i < SOG_REP_SOGLIE.length; i++) {
    if (Math.abs(p - SOG_REP_SOGLIE[i]) < 0.001) return true;
  }
  return false;
}

function SogRepMancaSogliaPerMezzo(punti, golAttuali) {
  var prossima = SogRepSogliaSuccessivaDaGol(golAttuali);
  if (prossima == null) return false;
  return Math.abs(SogRepNum(punti) - (prossima - 0.5)) < 0.001;
}

function SogRepPuntiClassifica(gf, gs) {
  if (gf > gs) return 3;
  if (gf == gs) return 1;
  return 0;
}

function SogRepCartellaStagione(stagione) {
  if (typeof arrDirectory === "undefined") return "";
  for (var i = 1; i < arrDirectory.length; i++) {
    if (arrDirectory[i] && arrDirectory[i].Stagione == stagione) return arrDirectory[i].Directory;
  }
  return "";
}

function SogRepLinkGiornata(m) {
  var cartella = SogRepCartellaStagione(m.Stagione);
  if (cartella == "") return SogRepHtml(m.GiornataA);
  var href = "../" + cartella + "/ris." + SOG_REP_EXT + "?Gio=" + m.GiornataA;
  return "<a class='t-xxs' href='" + href + "'>" + SogRepHtml(m.GiornataA) + "</a>";
}

function SogRepNomeCompetizione(id) {
  if (typeof arrAdOCompetizioni !== "undefined") {
    for (var i = 1; i < arrAdOCompetizioni.length; i++) {
      if (arrAdOCompetizioni[i] && arrAdOCompetizioni[i].IDc == id) return arrAdOCompetizioni[i].nome;
    }
  }
  return "Comp. " + id;
}

function SogRepUltimaStagione() {
  var max = 0;
  if (typeof arrConfronti === "undefined") return max;
  for (var i = 1; i < arrConfronti.length; i++) {
    if (arrConfronti[i] && arrConfronti[i].Stagione > max) max = arrConfronti[i].Stagione;
  }
  return max;
}

function SogRepGetSquadra(stats, id, nome) {
  var k = "S" + id;
  if (!stats[k]) {
    stats[k] = {
      id: id,
      nome: nome,
      giocate: 0,
      soglie: 0,
      soglieV: 0,
      soglieN: 0,
      soglieP: 0,
      sprecoVittorie: 0,
      sprecoTotale: 0,
      sprecoMax: 0,
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
      fcGuadagnatiCasa: 0,
      fcPersiTrasferta: 0,
      fcSaldo: 0,
      fcProCasa: 0,
      fcControTrasferta: 0
    };
  }
  return stats[k];
}

function SogRepPrestazione(ctx, lato) {
  if (lato == "C") {
    return {
      id: ctx.m.IDASquadraCasa,
      nome: ctx.m.SquadraCasa,
      avvId: ctx.m.IDASquadraFuori,
      avvNome: ctx.m.SquadraFuori,
      punti: ctx.pc,
      puntiAvv: ctx.pf,
      gol: ctx.gc,
      golAvv: ctx.gf,
      casa: true
    };
  }
  return {
    id: ctx.m.IDASquadraFuori,
    nome: ctx.m.SquadraFuori,
    avvId: ctx.m.IDASquadraCasa,
    avvNome: ctx.m.SquadraCasa,
    punti: ctx.pf,
    puntiAvv: ctx.pc,
    gol: ctx.gf,
    golAvv: ctx.gc,
    casa: false
  };
}

function SogRepAddEvento(lista, tipo, m, squadra, avversario, punti, puntiAvv, gol, golAvv, nota) {
  lista.push({
    tipo: tipo,
    m: m,
    squadra: squadra,
    avversario: avversario,
    punti: punti,
    puntiAvv: puntiAvv,
    gol: gol,
    golAvv: golAvv,
    nota: nota || ""
  });
}

function SogRepAnalizza(stagioneFiltro) {
  var res = {
    stagione: stagioneFiltro,
    stats: {},
    eventiFortuna: [],
    eventiSfortuna: [],
    eventiMezzoPunto: [],
    eventiFattoreCampo: [],
    eventiSoglia: [],
    partite: 0
  };

  if (typeof arrConfronti === "undefined") return res;

  for (var i = 1; i < arrConfronti.length; i++) {
    var m = arrConfronti[i];
    if (!m) continue;
    if (stagioneFiltro != 0 && m.Stagione != stagioneFiltro) continue;

    var pc = SogRepNum(m.PuntiCasa);
    var pf = SogRepNum(m.PuntiFuori);
    if (pc <= 0 && pf <= 0) continue;

    var gc = parseInt(m.GolRegoCasa, 10);
    var gf = parseInt(m.GolRegoFuori, 10);
    if (isNaN(gc)) gc = parseInt(m.GolCasa, 10);
    if (isNaN(gf)) gf = parseInt(m.GolFuori, 10);
    if (isNaN(gc)) gc = SogRepGolDaPunti(pc);
    if (isNaN(gf)) gf = SogRepGolDaPunti(pf);

    var ctx = { m: m, pc: pc, pf: pf, gc: gc, gf: gf };
    res.partite++;

    var casa = SogRepPrestazione(ctx, "C");
    var fuori = SogRepPrestazione(ctx, "F");
    var prestazioni = [casa, fuori];

    for (var p = 0; p < prestazioni.length; p++) {
      var pr = prestazioni[p];
      var st = SogRepGetSquadra(res.stats, pr.id, pr.nome);
      st.giocate++;

      var puntiClass = SogRepPuntiClassifica(pr.gol, pr.golAvv);
      var onSoglia = SogRepASogliaPrecisa(pr.punti);
      if (onSoglia) {
        st.soglie++;
        if (puntiClass == 3) st.soglieV++;
        else if (puntiClass == 1) st.soglieN++;
        else st.soglieP++;
        SogRepAddEvento(res.eventiSoglia, "Soglia precisa", m, pr.nome, pr.avvNome, pr.punti, pr.puntiAvv, pr.gol, pr.golAvv, "Punti non sprecati sulla soglia " + SogRepFmt(pr.punti));
      }

      if (puntiClass == 3) {
        var sogliaGol = SogRepSogliaGol(pr.gol);
        if (sogliaGol != null) {
          var spreco = Math.max(0, SogRepNum(pr.punti - sogliaGol));
          if (spreco > 0) {
            st.sprecoVittorie++;
            st.sprecoTotale = SogRepNum(st.sprecoTotale + spreco);
            if (spreco > st.sprecoMax) st.sprecoMax = spreco;
          }
        }
      }

      if (pr.gol > pr.golAvv && pr.gol == pr.golAvv + 1 && SogRepASogliaPrecisa(pr.punti) && Math.abs(SogRepNum(pr.puntiAvv) - SogRepNum(pr.punti - 0.5)) < 0.001) {
        st.fortuna++;
        st.vittChir++;
        SogRepAddEvento(res.eventiFortuna, "Vittoria chirurgica", m, pr.nome, pr.avvNome, pr.punti, pr.puntiAvv, pr.gol, pr.golAvv, "Soglia precisa e avversario a -0,5 dalla stessa soglia");
      }

      if (pr.gol == pr.golAvv && pr.punti < pr.puntiAvv && SogRepASogliaPrecisa(pr.punti) && SogRepMancaSogliaPerMezzo(pr.puntiAvv, pr.golAvv)) {
        st.fortuna++;
        st.parMir++;
        SogRepAddEvento(res.eventiFortuna, "Pareggio miracolato", m, pr.nome, pr.avvNome, pr.punti, pr.puntiAvv, pr.gol, pr.golAvv, "Avversario sopra ai punti ma fermo a -0,5 dalla soglia successiva");
      }

      if (pr.gol < pr.golAvv && pr.golAvv == pr.gol + 1 && SogRepASogliaPrecisa(pr.puntiAvv) && Math.abs(SogRepNum(pr.punti) - SogRepNum(pr.puntiAvv - 0.5)) < 0.001) {
        st.sfortuna++;
        st.sconBeffa++;
        SogRepAddEvento(res.eventiSfortuna, "Sconfitta beffa", m, pr.nome, pr.avvNome, pr.punti, pr.puntiAvv, pr.gol, pr.golAvv, "Tu a -0,5 dalla soglia, avversario esatto sulla soglia");
      }

      if (pr.gol == pr.golAvv && pr.punti > pr.puntiAvv && SogRepMancaSogliaPerMezzo(pr.punti, pr.gol) && SogRepASogliaPrecisa(pr.puntiAvv)) {
        st.sfortuna++;
        st.parStretto++;
        SogRepAddEvento(res.eventiSfortuna, "Pareggio stretto", m, pr.nome, pr.avvNome, pr.punti, pr.puntiAvv, pr.gol, pr.golAvv, "Tu sopra ai punti ma a -0,5 dalla soglia successiva");
      }

      /*
        Record mezzo punto V1.1.0.
        Sono categorie piu larghe rispetto alle definizioni strette di
        Vittoria chirurgica / Sconfitta beffa / Pareggio stretto.
        Non modificano fortuna/sfortuna stretta: vengono conteggiate a parte.
      */
      if (pr.gol == pr.golAvv && SogRepMancaSogliaPerMezzo(pr.punti, pr.gol)) {
        st.mezzoPuntoNeg++;
        st.vittMancata05++;
        SogRepAddEvento(res.eventiMezzoPunto, "Vittoria mancata per 0,5", m, pr.nome, pr.avvNome, pr.punti, pr.puntiAvv, pr.gol, pr.golAvv, "Con 0,5 punti in piu avrebbe segnato un gol in piu e vinto la partita");
      }

      if (pr.gol < pr.golAvv && pr.golAvv == pr.gol + 1 && SogRepMancaSogliaPerMezzo(pr.punti, pr.gol)) {
        st.mezzoPuntoNeg++;
        st.sconPelo05++;
        SogRepAddEvento(res.eventiMezzoPunto, "Sconfitta per un pelo", m, pr.nome, pr.avvNome, pr.punti, pr.puntiAvv, pr.gol, pr.golAvv, "Con 0,5 punti in piu avrebbe segnato un gol in piu e pareggiato la partita");
      }

      if (pr.gol == pr.golAvv + 1 && SogRepASogliaPrecisa(pr.punti)) {
        st.mezzoPuntoPos++;
        st.giustoGiusto++;
        SogRepAddEvento(res.eventiMezzoPunto, "Giusto giusto", m, pr.nome, pr.avvNome, pr.punti, pr.puntiAvv, pr.gol, pr.golAvv, "Soglia esatta che basta per vincere di un gol, indipendentemente dal punteggio avversario");
      }
    }

    var neutro = String(m.Neutro || "").replace(/\s+/g, "").toUpperCase();
    if (neutro != "N") {
      var pcInv = SogRepNum(pc - 1);
      var pfInv = SogRepNum(pf + 1);
      var gcInv = SogRepGolDaPunti(pcInv);
      var gfInv = SogRepGolDaPunti(pfInv);
      var puntiCasaReali = SogRepPuntiClassifica(gc, gf);
      var puntiFuoriReali = SogRepPuntiClassifica(gf, gc);
      var puntiCasaInv = SogRepPuntiClassifica(gcInv, gfInv);
      var puntiFuoriInv = SogRepPuntiClassifica(gfInv, gcInv);
      var deltaCasa = puntiCasaReali - puntiCasaInv;
      var deltaFuori = puntiFuoriReali - puntiFuoriInv;

      if (deltaCasa > 0) {
        var stCasa = SogRepGetSquadra(res.stats, m.IDASquadraCasa, m.SquadraCasa);
        var stFuori = SogRepGetSquadra(res.stats, m.IDASquadraFuori, m.SquadraFuori);
        stCasa.fcGuadagnatiCasa += deltaCasa;
        stCasa.fcSaldo += deltaCasa;
        stCasa.fcProCasa++;
        stFuori.fcPersiTrasferta += Math.abs(deltaFuori);
        stFuori.fcSaldo -= Math.abs(deltaFuori);
        stFuori.fcControTrasferta++;

        var tipoFc = "";
        if (puntiCasaReali == 3 && puntiCasaInv == 0) tipoFc = "Da sconfitta a vittoria";
        else if (puntiCasaReali == 3 && puntiCasaInv == 1) tipoFc = "Da pareggio a vittoria";
        else if (puntiCasaReali == 1 && puntiCasaInv == 0) tipoFc = "Da sconfitta a pareggio";
        else tipoFc = "Risultato migliorato";

        res.eventiFattoreCampo.push({
          m: m,
          tipo: tipoFc,
          casa: m.SquadraCasa,
          fuori: m.SquadraFuori,
          pc: pc,
          pf: pf,
          gc: gc,
          gf: gf,
          pcInv: pcInv,
          pfInv: pfInv,
          gcInv: gcInv,
          gfInv: gfInv,
          deltaCasa: deltaCasa,
          deltaFuori: deltaFuori,
          swingGol: Math.abs(gc - gcInv) + Math.abs(gf - gfInv)
        });
      }
    }
  }

  return res;
}

function SogRepStatsArray(stats) {
  var a = [];
  for (var k in stats) {
    if (stats.hasOwnProperty(k)) a.push(stats[k]);
  }
  return a;
}

function SogRepSortNum(campo) {
  return function(a, b) {
    if (b[campo] != a[campo]) return b[campo] - a[campo];
    return String(a.nome).localeCompare(String(b.nome));
  };
}

function SogRepTabellaClassifica(titolo, arr, colonne) {
  document.write("<h3>" + SogRepHtml(titolo) + "</h3>");
  document.write("<table class='tb' border='1' cellpadding='3' cellspacing='0' style='border-collapse:collapse;width:100%;margin-bottom:18px;'>");
  document.write("<tr>");
  for (var c = 0; c < colonne.length; c++) document.write("<th>" + SogRepHtml(colonne[c].t) + "</th>");
  document.write("</tr>");
  for (var i = 0; i < arr.length; i++) {
    document.write("<tr>");
    for (var j = 0; j < colonne.length; j++) {
      var v = colonne[j].f(arr[i], i);
      document.write("<td>" + v + "</td>");
    }
    document.write("</tr>");
  }
  if (arr.length == 0) document.write("<tr><td colspan='" + colonne.length + "'>Nessun dato.</td></tr>");
  document.write("</table>");
}

function SogRepTabellaEventi(titolo, arr) {
  document.write("<h3>" + SogRepHtml(titolo) + "</h3>");
  document.write("<table class='tb' border='1' cellpadding='3' cellspacing='0' style='border-collapse:collapse;width:100%;margin-bottom:18px;'>");
  document.write("<tr><th>Tipo</th><th>Data</th><th>Comp.</th><th>Giorn.</th><th>Squadra</th><th>Avversario</th><th>Punti</th><th>Ris.</th><th>Nota</th></tr>");
  for (var i = 0; i < arr.length; i++) {
    var e = arr[i];
    document.write("<tr>");
    document.write("<td>" + SogRepHtml(e.tipo) + "</td>");
    document.write("<td>" + SogRepHtml(e.m.Data) + "</td>");
    document.write("<td>" + SogRepHtml(SogRepNomeCompetizione(e.m.Competizione)) + "</td>");
    document.write("<td style='text-align:center'>" + SogRepLinkGiornata(e.m) + "</td>");
    document.write("<td>" + SogRepHtml(e.squadra) + "</td>");
    document.write("<td>" + SogRepHtml(e.avversario) + "</td>");
    document.write("<td style='text-align:center'>" + SogRepFmt(e.punti) + " - " + SogRepFmt(e.puntiAvv) + "</td>");
    document.write("<td style='text-align:center'>" + e.gol + "-" + e.golAvv + "</td>");
    document.write("<td>" + SogRepHtml(e.nota) + "</td>");
    document.write("</tr>");
  }
  if (arr.length == 0) document.write("<tr><td colspan='9'>Nessun dato.</td></tr>");
  document.write("</table>");
}

function SogRepTabellaFattoreCampo(titolo, arr) {
  document.write("<h3>" + SogRepHtml(titolo) + "</h3>");
  document.write("<table class='tb' border='1' cellpadding='3' cellspacing='0' style='border-collapse:collapse;width:100%;margin-bottom:18px;'>");
  document.write("<tr><th>Tipo</th><th>Data</th><th>Comp.</th><th>Giorn.</th><th>Partita</th><th>Reale</th><th>A campi invertiti</th><th>Punti class.</th><th>Swing gol</th></tr>");
  for (var i = 0; i < arr.length; i++) {
    var e = arr[i];
    document.write("<tr>");
    document.write("<td>" + SogRepHtml(e.tipo) + "</td>");
    document.write("<td>" + SogRepHtml(e.m.Data) + "</td>");
    document.write("<td>" + SogRepHtml(SogRepNomeCompetizione(e.m.Competizione)) + "</td>");
    document.write("<td style='text-align:center'>" + SogRepLinkGiornata(e.m) + "</td>");
    document.write("<td>" + SogRepHtml(e.casa) + " - " + SogRepHtml(e.fuori) + "</td>");
    document.write("<td style='text-align:center'>" + SogRepFmt(e.pc) + " - " + SogRepFmt(e.pf) + "<br><b>" + e.gc + "-" + e.gf + "</b></td>");
    document.write("<td style='text-align:center'>" + SogRepFmt(e.pcInv) + " - " + SogRepFmt(e.pfInv) + "<br><b>" + e.gcInv + "-" + e.gfInv + "</b></td>");
    document.write("<td style='text-align:center'>+" + e.deltaCasa + " casa / " + e.deltaFuori + " fuori</td>");
    document.write("<td style='text-align:center'>" + e.swingGol + "</td>");
    document.write("</tr>");
  }
  if (arr.length == 0) document.write("<tr><td colspan='9'>Nessun dato.</td></tr>");
  document.write("</table>");
}

function GeneraSoglieRecord() {
  var stagione = parseInt(SogRepQS("Stagione"), 10);
  if (isNaN(stagione)) stagione = SogRepUltimaStagione();
  var res = SogRepAnalizza(stagione);
  var stats = SogRepStatsArray(res.stats);

  document.write("<div style='font-family:Arial,Helvetica,sans-serif;font-size:12px;'>");
  document.write("<h2>Record soglie, botte di culo e fattore campo</h2>");
  document.write("<p><b>Stagione:</b> " + (stagione == 0 ? "tutte" : stagione) + " - <b>Partite analizzate:</b> " + res.partite + "</p>");
  document.write("<p>Soglie usate: " + SOG_REP_SOGLIE.join(", ") + ". I link giornata puntano ai tabellini del sito: <code>ris." + SOG_REP_EXT + "?Gio=...</code>.</p>");
  document.write("<p><a href='soglieRecord.htm'>ultima stagione</a> | <a href='soglieRecord.htm?Stagione=0'>tutte le stagioni</a></p>");

  var fortuna = stats.slice(0).sort(function(a, b) {
    if ((b.fortuna - b.sfortuna) != (a.fortuna - a.sfortuna)) return (b.fortuna - b.sfortuna) - (a.fortuna - a.sfortuna);
    return b.fortuna - a.fortuna;
  });
  SogRepTabellaClassifica("Sintesi fortuna/sfortuna", fortuna, [
    { t: "Squadra", f: function(x) { return SogRepHtml(x.nome); } },
    { t: "Fortuna", f: function(x) { return x.fortuna; } },
    { t: "Sfortuna", f: function(x) { return x.sfortuna; } },
    { t: "Saldo", f: function(x) { return x.fortuna - x.sfortuna; } },
    { t: "Vitt. chirurgiche", f: function(x) { return x.vittChir; } },
    { t: "Par. miracolati", f: function(x) { return x.parMir; } },
    { t: "Sconf. beffa", f: function(x) { return x.sconBeffa; } },
    { t: "Par. stretti", f: function(x) { return x.parStretto; } }
  ]);

  var fc = stats.slice(0).sort(SogRepSortNum("fcSaldo"));
  SogRepTabellaClassifica("Saldo fattore campo", fc, [
    { t: "Squadra", f: function(x) { return SogRepHtml(x.nome); } },
    { t: "Punti guadagnati in casa", f: function(x) { return x.fcGuadagnatiCasa; } },
    { t: "Punti persi in trasferta", f: function(x) { return x.fcPersiTrasferta; } },
    { t: "Saldo", f: function(x) { return x.fcSaldo; } },
    { t: "Gare pro casa", f: function(x) { return x.fcProCasa; } },
    { t: "Gare contro fuori", f: function(x) { return x.fcControTrasferta; } }
  ]);

  var soglie = stats.slice(0).sort(SogRepSortNum("soglie"));
  SogRepTabellaClassifica("Tiratori scelti - soglie precise", soglie, [
    { t: "Squadra", f: function(x) { return SogRepHtml(x.nome); } },
    { t: "Giocate", f: function(x) { return x.giocate; } },
    { t: "Soglie precise", f: function(x) { return x.soglie; } },
    { t: "%", f: function(x) { return x.giocate ? SogRepFmt((x.soglie * 100) / x.giocate) + "%" : "0%"; } },
    { t: "V", f: function(x) { return x.soglieV; } },
    { t: "N", f: function(x) { return x.soglieN; } },
    { t: "P", f: function(x) { return x.soglieP; } },
    { t: "Spreco vittorie", f: function(x) { return SogRepFmt(x.sprecoTotale); } },
    { t: "Max spreco", f: function(x) { return SogRepFmt(x.sprecoMax); } }
  ]);

  res.eventiFattoreCampo.sort(function(a, b) {
    if (b.deltaCasa != a.deltaCasa) return b.deltaCasa - a.deltaCasa;
    if (b.swingGol != a.swingGol) return b.swingGol - a.swingGol;
    return String(a.casa).localeCompare(String(b.casa));
  });
  SogRepTabellaFattoreCampo("Dettaglio fattore campo decisivo", res.eventiFattoreCampo);

  SogRepTabellaEventi("Dettaglio botte di culo", res.eventiFortuna);
  SogRepTabellaEventi("Dettaglio sindrome di Fantozzi", res.eventiSfortuna);
  SogRepTabellaEventi("Dettaglio mezzo punto", res.eventiMezzoPunto);
  SogRepTabellaEventi("Dettaglio soglie precise", res.eventiSoglia);

  document.write("</div>");
}
