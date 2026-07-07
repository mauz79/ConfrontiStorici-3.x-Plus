/*
  fcmCulometroPlus.js
  Modulo non ufficiale ConfrontiStorici Plus - Culometro.

  Scelte V4:
  - il plugin originale ConfrontiStorici non viene modificato;
  - l'unita di calcolo e la prestazione squadra, non la riga record;
  - ogni prestazione riceve al massimo una etichetta principale con algoritmo a cascata;
  - le fasce gol sono quelle reali di fcmSoglieRecordFunzioni.js, tramite SogRepGolDaPunti e funzioni soglie;
  - la rarita degli eventi e calcolata sullo storico globale delle prestazioni squadra;
  - il valore finale e normalizzato 0-100, con 50,00 = equilibrio fortuna/sfortuna;
  - il punteggio pesa anche impatto sportivo: vittoria, pareggio, sconfitta evitata/subita;
  - i pesi principali sono letti da fcmCulometroPlusConfig.js quando presente.
*/

var CUL_BASELINE = null;
var CUL_CACHE = {};
function CULCfg() {
  if (typeof CULOMETRO_PLUS_CONFIG != "undefined" && CULOMETRO_PLUS_CONFIG) return CULOMETRO_PLUS_CONFIG;
  if (typeof window != "undefined" && window.CULOMETRO_PLUS_CONFIG) return window.CULOMETRO_PLUS_CONFIG;
  return {};
}

function CULCfgNum(nome, fallback) {
  var cfg = CULCfg();
  var v = cfg[nome];
  v = parseFloat(v);
  if (isNaN(v)) return fallback;
  return v;
}

function CULCfgObj(nome) {
  var cfg = CULCfg();
  if (cfg && cfg[nome]) return cfg[nome];
  return {};
}
var CUL_DETTAGLIO_SQUADRA = "";

var CUL_MIN_PARTITE_AFFIDABILI = 20;
var CUL_K_SCALA = 4.15;
var CUL_PESO_RARITA_MAX = 6.25;

function CULH(s) {
  if (typeof SRVH == "function") return SRVH(s);
  s = String(s == null ? "" : s);
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}


function CULJS(s) {
  s = String(s == null ? "" : s);
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\r/g, " ").replace(/\n/g, " ");
}

function CULF(n) {
  var x = parseFloat(n);
  if (isNaN(x)) x = 0;
  x = Math.round(x * 100) / 100;
  var txt = x.toFixed(2);
  return txt.replace(".", ",");
}

function CULF1(n) {
  if (typeof SRVF == "function") return SRVF(n);
  var x = parseFloat(n);
  if (isNaN(x)) x = 0;
  x = Math.round(x * 10) / 10;
  if (Math.abs(x - Math.round(x)) < 0.001) return String(Math.round(x));
  return String(x).replace(".", ",");
}

function CULPct(n) {
  var x = parseFloat(n);
  if (isNaN(x)) x = 0;
  return CULF(x * 100) + "%";
}

function CULNum(n) {
  var x = parseFloat(n);
  if (isNaN(x)) return 0;
  return Math.round(x * 10) / 10;
}

function CULGetArrayConfronti() {
  if (typeof arrConfronti != "undefined" && arrConfronti) return arrConfronti;
  if (typeof a != "undefined" && a) return a;
  if (typeof window != "undefined") {
    if (window.arrConfronti) return window.arrConfronti;
    if (window.a) return window.a;
  }
  return null;
}

function CULGet(m, nome) {
  if (!m) return null;
  if (m[nome] != null) return m[nome];
  return null;
}

function CULIsConfrontoValido(m) {
  if (!m) return false;
  return (
    CULGet(m, "Stagione") != null &&
    CULGet(m, "Competizione") != null &&
    CULGet(m, "SquadraCasa") != null &&
    CULGet(m, "SquadraFuori") != null &&
    CULGet(m, "PuntiCasa") != null &&
    CULGet(m, "PuntiFuori") != null
  );
}

function CULEachConfronto(fn) {
  var arr = CULGetArrayConfronti();
  if (!arr) return 0;

  var count = 0;
  for (var i = 0; i < arr.length; i++) {
    var m = arr[i];
    if (!CULIsConfrontoValido(m)) continue;
    fn(m, i);
    count++;
  }
  return count;
}

function CULGolDaPunti(punti) {
  if (typeof SogRepGolDaPunti == "function") return SogRepGolDaPunti(punti);
  var p = CULNum(punti);
  var soglie = [66, 72, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113];
  var g = 0;
  for (var i = 0; i < soglie.length; i++) if (p >= soglie[i]) g = i + 1;
  return g;
}

function CULGolCasa(m, pc) {
  var gc = parseInt(CULGet(m, "GolRegoCasa"), 10);
  if (isNaN(gc)) gc = parseInt(CULGet(m, "GolCasa"), 10);
  if (isNaN(gc)) gc = CULGolDaPunti(pc);
  return gc;
}

function CULGolFuori(m, pf) {
  var gf = parseInt(CULGet(m, "GolRegoFuori"), 10);
  if (isNaN(gf)) gf = parseInt(CULGet(m, "GolFuori"), 10);
  if (isNaN(gf)) gf = CULGolDaPunti(pf);
  return gf;
}

function CULPuntiClassifica(gf, gs) {
  if (typeof SRVPuntiClassifica == "function") return SRVPuntiClassifica(gf, gs);
  if (typeof SogRepPuntiClassifica == "function") return SogRepPuntiClassifica(gf, gs);
  if (gf > gs) return 3;
  if (gf == gs) return 1;
  return 0;
}

function CULASogliaPrecisa(punti) {
  if (typeof SogRepASogliaPrecisa == "function") return SogRepASogliaPrecisa(punti);
  var p = CULNum(punti);
  var soglie = [66, 72, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113];
  for (var i = 0; i < soglie.length; i++) if (Math.abs(p - soglie[i]) < 0.001) return true;
  return false;
}

function CULMancaSogliaPerMezzo(punti, golAttuali) {
  if (typeof SogRepMancaSogliaPerMezzo == "function") return SogRepMancaSogliaPerMezzo(punti, golAttuali);
  return false;
}

function CULIs66Preciso(punti) {
  return Math.abs(CULNum(punti) - 66) < 0.001;
}

function CULNomeSquadraDaId(id, fallback) {
  if (typeof SRVNomeSquadraDaId == "function") return SRVNomeSquadraDaId(id, fallback);
  return String(fallback == null ? "" : fallback);
}

function CULNomeCompetizione(id) {
  if (typeof SRVNomeCompetizione == "function") return SRVNomeCompetizione(id);
  if (id == 0) return "Tutte le competizioni";
  return "Competizione " + id;
}

function CULCompetizioneNormalizzata(id) {
  if (typeof SRVCompetizioneNormalizzata == "function") return SRVCompetizioneNormalizzata(id);
  return parseInt(id, 10);
}

function CULOrdineCompetizione(id) {
  if (typeof SRVOrdineCompetizione == "function") return SRVOrdineCompetizione(id);
  return parseInt(id, 10);
}

function CULLinkRisultato(m, testo) {
  if (typeof SRVLinkRisultato == "function") return SRVLinkRisultato(m, testo);
  return testo;
}

function CULUltimaStagione() {
  if (typeof SRVUltimaStagione == "function") return SRVUltimaStagione();
  var max = 0;
  CULEachConfronto(function(m) {
    var s = parseInt(CULGet(m, "Stagione"), 10);
    if (!isNaN(s) && s > max) max = s;
  });
  return max;
}

function CULGetStagioni() {
  if (typeof SRVGetStagioni == "function") return SRVGetStagioni();
  var map = {};
  var arr = [];
  CULEachConfronto(function(m) {
    var s = parseInt(CULGet(m, "Stagione"), 10);
    if (!isNaN(s) && !map[String(s)]) {
      map[String(s)] = true;
      arr.push(s);
    }
  });
  arr.sort(function(a, b) { return b - a; });
  return arr;
}


function CULPad2(n) {
  n = parseInt(n, 10);
  if (isNaN(n)) return "";
  return n < 10 ? "0" + n : String(n);
}

function CULCartellaStagione(stagione) {
  stagione = parseInt(stagione, 10);
  if (typeof SRVConfigCartellaStagione == "function") {
    var c1 = SRVConfigCartellaStagione(stagione);
    if (c1) return String(c1);
  }
  if (typeof SogRepCartellaStagione == "function") {
    var c2 = SogRepCartellaStagione(stagione);
    if (c2) return String(c2);
  }
  if (typeof arrDirectory != "undefined" && arrDirectory) {
    for (var i = 1; i < arrDirectory.length; i++) {
      if (arrDirectory[i] && parseInt(arrDirectory[i].Stagione, 10) == stagione) return String(arrDirectory[i].Directory || "");
    }
  }
  if (typeof SRP_CARTELLE != "undefined") {
    var k = CULPad2(stagione);
    if (SRP_CARTELLE[k] && SRP_CARTELLE[k].cartella) return String(SRP_CARTELLE[k].cartella);
    if (SRP_CARTELLE[String(stagione)] && SRP_CARTELLE[String(stagione)].cartella) return String(SRP_CARTELLE[String(stagione)].cartella);
  }
  return "";
}

function CULAnnoInizioStagione(stagione) {
  stagione = parseInt(stagione, 10);
  var cartella = CULCartellaStagione(stagione);
  var m = String(cartella || "").match(/lega\s*(\d{4})/i);
  if (m) return parseInt(m[1], 10);

  if (typeof SRP_CARTELLE != "undefined") {
    var k = CULPad2(stagione);
    var c = SRP_CARTELLE[k] || SRP_CARTELLE[String(stagione)];
    if (c && c.archivioFcm) {
      var mm = String(c.archivioFcm).match(/(\d{4})_(\d{4})/);
      if (mm) return parseInt(mm[1], 10);
    }
  }

  if (!isNaN(stagione) && stagione >= 2) return 2004 + stagione;
  return null;
}

function CULNomeStagione(stagione) {
  stagione = parseInt(stagione, 10);
  var anno = CULAnnoInizioStagione(stagione);
  if (anno) return String(anno) + "/" + String(anno + 1) + " (stagione " + stagione + ")";
  return "Stagione " + stagione;
}

function CULFillCompetizioneSingola() {
  var sel = document.getElementById("culCompetizioneSingola");
  if (!sel) return;
  var old = sel.value;
  var modo = document.getElementById("culModo").value;
  var stagione = modo == "stagione" ? parseInt(document.getElementById("culStagione").value, 10) : 0;
  var comps = CULGetCompetizioni(stagione);
  sel.options.length = 0;
  var opt0 = document.createElement("option");
  opt0.value = "0";
  opt0.text = "Tutte quelle del gruppo";
  sel.options.add(opt0);
  for (var i = 0; i < comps.length; i++) {
    var opt = document.createElement("option");
    opt.value = String(comps[i].id);
    opt.text = comps[i].nome;
    sel.options.add(opt);
  }
  var found = false;
  for (var j = 0; j < sel.options.length; j++) if (sel.options[j].value == old) found = true;
  sel.value = found ? old : "0";
}

function CULSetDettaglioSquadra(nome) {
  CUL_DETTAGLIO_SQUADRA = String(nome == null ? "" : nome);
  CULRender();
}

function CULNomeNorm(nome) {
  nome = String(nome == null ? "" : nome).toLowerCase();
  nome = nome.replace(/\s+/g, " ");
  nome = nome.replace(/^\s+|\s+$/g, "");
  return nome;
}

function CULGruppoCompetizioneDaNome(nome) {
  var n = CULNomeNorm(nome);
  if (n == "serie a" || n == "serie b" || n == "serie c") return "campionati";
  if (n == "coppa di lega serie a" || n == "coppa di lega serie b" || n == "coppa di lega serie c") return "coppeLega";
  if (n == "europa pipps" || n == "coppa tra le coppe") return "coppeInterlega";
  return "altre";
}

function CULGetCompetizioni(stagione) {
  var map = {};
  var arr = [];
  CULEachConfronto(function(m) {
    var st = parseInt(CULGet(m, "Stagione"), 10);
    if (stagione != 0 && st != parseInt(stagione, 10)) return;
    var id = CULCompetizioneNormalizzata(CULGet(m, "Competizione"));
    if (isNaN(id)) return;
    if (!map[String(id)]) {
      map[String(id)] = true;
      arr.push({ id: id, nome: CULNomeCompetizione(id), ordine: CULOrdineCompetizione(id) });
    }
  });
  arr.sort(function(a, b) {
    if (a.ordine != b.ordine) return a.ordine - b.ordine;
    return String(a.nome).localeCompare(String(b.nome));
  });
  return arr;
}

function CULCompetizioneInclusa(comp, gruppo, checkMap) {
  var tipo = CULGruppoCompetizioneDaNome(comp.nome);
  if (gruppo == "tutte") return true;
  if (gruppo == "principali") return tipo == "campionati" || tipo == "coppeLega" || tipo == "coppeInterlega";
  if (gruppo == "campionati") return tipo == "campionati";
  if (gruppo == "coppeLega") return tipo == "coppeLega";
  if (gruppo == "coppeInterlega") return tipo == "coppeInterlega";
  if (gruppo == "personalizzato") return !!checkMap[String(comp.id)];
  return true;
}

function CULGetCompetizioniCheckateMap() {
  var map = {};
  var box = document.getElementById("culBoxChecks");
  if (!box) return map;
  var inputs = box.getElementsByTagName("input");
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].type == "checkbox" && inputs[i].checked) map[String(inputs[i].value)] = true;
  }
  return map;
}

function CULGetCompetizioniSelezionate(stagione) {
  var single = document.getElementById("culCompetizioneSingola");
  if (single && single.value && single.value != "0") {
    var m = {};
    m[String(single.value)] = true;
    return m;
  }

  var gruppo = document.getElementById("culGruppoCompetizioni").value;
  var checkMap = CULGetCompetizioniCheckateMap();
  var comps = CULGetCompetizioni(stagione);
  var map = {};
  for (var i = 0; i < comps.length; i++) {
    if (CULCompetizioneInclusa(comps[i], gruppo, checkMap)) map[String(comps[i].id)] = true;
  }
  return map;
}

function CULFillStagioni() {
  var sel = document.getElementById("culStagione");
  if (!sel) return;
  var stagioni = CULGetStagioni();
  var ultima = CULUltimaStagione();
  sel.options.length = 0;
  for (var i = 0; i < stagioni.length; i++) {
    var opt = document.createElement("option");
    opt.value = String(stagioni[i]);
    opt.text = CULNomeStagione(stagioni[i]);
    if (parseInt(stagioni[i], 10) == ultima) opt.selected = true;
    sel.options.add(opt);
  }
}

function CULFillCompetizioniChecks() {
  CULFillCompetizioneSingola();
  var box = document.getElementById("culBoxChecks");
  if (!box) return;
  var modo = document.getElementById("culModo").value;
  var stagione = modo == "stagione" ? parseInt(document.getElementById("culStagione").value, 10) : 0;
  var comps = CULGetCompetizioni(stagione);
  var html = "<div><b>Competizioni personalizzate</b></div>";
  html += "<div style=\"margin-bottom:6px;\"><input type=\"button\" class=\"cul-smallbtn\" value=\"Tutte\" onclick=\"CULCheckCompetizioni(true);\"><input type=\"button\" class=\"cul-smallbtn\" value=\"Nessuna\" onclick=\"CULCheckCompetizioni(false);\"></div>";
  for (var i = 0; i < comps.length; i++) {
    html += "<label><input type=\"checkbox\" value=\"" + CULH(comps[i].id) + "\" checked onclick=\"CULRender();\"> " + CULH(comps[i].nome) + "</label>";
  }
  box.innerHTML = html;
}

function CULCheckCompetizioni(flag) {
  var box = document.getElementById("culBoxChecks");
  if (!box) return;
  var inputs = box.getElementsByTagName("input");
  for (var i = 0; i < inputs.length; i++) if (inputs[i].type == "checkbox") inputs[i].checked = !!flag;
  CULRender();
}

function CULGruppoChanged() {
  var gruppo = document.getElementById("culGruppoCompetizioni").value;
  var box = document.getElementById("culBoxChecks");
  if (box) box.style.display = gruppo == "personalizzato" ? "block" : "none";
  CULRender();
}

function CULModoChanged() {
  var modo = document.getElementById("culModo").value;
  var boxStagione = document.getElementById("culBoxStagione");
  if (boxStagione) boxStagione.style.display = modo == "stagione" ? "inline" : "none";
  CULFillCompetizioniChecks();
  CULRender();
}

function CULStagioneChanged() {
  CULFillCompetizioniChecks();
  CULRender();
}

function CULInit() {
  CULFillStagioni();
  CULFillCompetizioniChecks();
  CULModoChanged();
}

function CULMakeMatchKey(m) {
  return String(CULGet(m, "Stagione")) + "|" + String(CULGet(m, "Competizione")) + "|" + String(CULGet(m, "GiornataA")) + "|" + String(CULGet(m, "IDASquadraCasa")) + "|" + String(CULGet(m, "IDASquadraFuori")) + "|" + String(CULGet(m, "Data"));
}

function CULMakePerfKey(m, lato) {
  return CULMakeMatchKey(m) + "|" + lato;
}

function CULConfigPunteggio(punti, puntiAvv) {
  return CULF1(punti).replace(",", "_") + "_" + CULF1(puntiAvv).replace(",", "_");
}

function CULNewEvento(key, label, dir, pesoQualita, livello, famiglia, m, squadra, squadraId, avversario, avvId, punti, puntiAvv, gol, golAvv, nota, config) {
  var compNorm = CULCompetizioneNormalizzata(CULGet(m, "Competizione"));
  return {
    key: key,
    label: label,
    dir: dir,
    pesoQualita: pesoQualita,
    livello: livello,
    famiglia: famiglia,
    rarityFamilyKey: dir + "|" + key,
    rarityConfigKey: dir + "|" + key + "|" + config,
    m: m,
    stagione: parseInt(CULGet(m, "Stagione"), 10),
    compId: compNorm,
    compNome: CULNomeCompetizione(compNorm),
    squadra: squadra,
    squadraId: squadraId,
    avversario: avversario,
    avvId: avvId,
    punti: punti,
    puntiAvv: puntiAvv,
    gol: gol,
    golAvv: golAvv,
    nota: nota,
    config: config,
    score: 0
  };
}

function CULAddEvento(lista, ev) {
  lista.push(ev);
}

function CULEsitoDaGol(gf, ga) {
  if (gf > ga) return "W";
  if (gf == ga) return "D";
  return "L";
}

function CULNomeEsito(e) {
  if (e == "W") return "vittoria";
  if (e == "D") return "pareggio";
  return "sconfitta";
}

function CULImpattoDaCambio(esitoAlt, esitoReale, deltaPunti, dir) {
  var pesi = CULCfgObj("pesoImpatto");
  var key = String(esitoAlt || "") + "_" + String(esitoReale || "");

  if (pesi && pesi[key] != null) return parseFloat(pesi[key]);

  if (esitoAlt == "L" && esitoReale == "W") return 2.05;
  if (esitoAlt == "D" && esitoReale == "W") return 1.62;
  if (esitoAlt == "L" && esitoReale == "D") return 1.32;
  if (esitoAlt == "W" && esitoReale == "L") return 2.05;
  if (esitoAlt == "W" && esitoReale == "D") return 1.62;
  if (esitoAlt == "D" && esitoReale == "L") return 1.32;

  if (pesi && pesi[String(esitoReale)] != null) return parseFloat(pesi[String(esitoReale)]);

  if (Math.abs(deltaPunti) >= 3) return 1.80;
  if (Math.abs(deltaPunti) >= 2) return 1.45;
  if (Math.abs(deltaPunti) >= 1) return 1.20;
  return pesi && pesi.fallback != null ? parseFloat(pesi.fallback) : 1.00;
}

function CULPesoTier(tier) {
  var pesi = CULCfgObj("pesoTier");
  if (pesi && pesi[tier] != null) return parseFloat(pesi[tier]);
  if (tier == "S") return 4.80;
  if (tier == "A") return 3.45;
  if (tier == "B") return 2.35;
  if (tier == "C") return 1.45;
  if (tier == "D") return 0.75;
  return pesi && pesi.fallback != null ? parseFloat(pesi.fallback) : 1.00;
}

function CULMargineTecnico(ctx, forte) {
  var peso = 1.00;
  if (ctx.onSoglia) peso += 0.15;
  if (ctx.avvAMezzo) peso += 0.15;
  if (ctx.mancaMezzo) peso += 0.15;
  if (forte) peso += 0.10;
  if (peso > 1.45) peso = 1.45;
  return peso;
}

function CULMakeEventoDaRegola(rule, ctx, nota, extra) {
  extra = extra || {};
  var cfg = rule.codice + "|" + CULConfigPunteggio(ctx.punti, ctx.puntiAvv);
  if (extra.configSuffix) cfg += "|" + extra.configSuffix;
  var impatto = extra.impatto || ctx.pesoImpatto || 1.00;
  var margine = extra.margine || CULMargineTecnico(ctx, rule.tier == "S" || rule.tier == "A");
  var pesoQualita = CULPesoTier(rule.tier) * impatto * margine;
  var ev = CULNewEvento(rule.codice, rule.label, rule.dir, pesoQualita, rule.tier, rule.famiglia, ctx.m, ctx.nome, ctx.id, ctx.avvNome, ctx.avvId, ctx.punti, ctx.puntiAvv, ctx.gol, ctx.golAvv, nota, cfg);
  ev.tier = rule.tier;
  ev.impatto = impatto;
  ev.margine = margine;
  ev.esitoReale = ctx.esitoReale;
  ev.esitoAlt = ctx.esitoAlt;
  ev.deltaPunti = ctx.deltaPunti;
  ev.puntiClassifica = ctx.puntiClassifica;
  ev.puntiClassificaAlt = ctx.puntiClassificaAlt;
  return ev;
}

function CULNewSideContext(m, lato, pc, pf, gc, gf, pcAlt, pfAlt, gcAlt, gfAlt) {
  var isCasa = lato == "C";
  var punti = isCasa ? pc : pf;
  var puntiAvv = isCasa ? pf : pc;
  var gol = isCasa ? gc : gf;
  var golAvv = isCasa ? gf : gc;
  var puntiAlt = isCasa ? pcAlt : pfAlt;
  var puntiAvvAlt = isCasa ? pfAlt : pcAlt;
  var golAlt = isCasa ? gcAlt : gfAlt;
  var golAvvAlt = isCasa ? gfAlt : gcAlt;
  var puntiClassifica = CULPuntiClassifica(gol, golAvv);
  var puntiClassificaAlt = CULPuntiClassifica(golAlt, golAvvAlt);
  var esitoReale = CULEsitoDaGol(gol, golAvv);
  var esitoAlt = CULEsitoDaGol(golAlt, golAvvAlt);
  var deltaPunti = puntiClassifica - puntiClassificaAlt;
  var nome = isCasa ? CULNomeSquadraDaId(CULGet(m, "IDASquadraCasa"), CULGet(m, "SquadraCasa")) : CULNomeSquadraDaId(CULGet(m, "IDASquadraFuori"), CULGet(m, "SquadraFuori"));
  var avvNome = isCasa ? CULNomeSquadraDaId(CULGet(m, "IDASquadraFuori"), CULGet(m, "SquadraFuori")) : CULNomeSquadraDaId(CULGet(m, "IDASquadraCasa"), CULGet(m, "SquadraCasa"));
  var id = isCasa ? CULGet(m, "IDASquadraCasa") : CULGet(m, "IDASquadraFuori");
  var avvId = isCasa ? CULGet(m, "IDASquadraFuori") : CULGet(m, "IDASquadraCasa");
  return {
    m: m, lato: lato, casa: isCasa,
    id: id, nome: nome, avvId: avvId, avvNome: avvNome,
    punti: punti, puntiAvv: puntiAvv, gol: gol, golAvv: golAvv,
    puntiAlt: puntiAlt, puntiAvvAlt: puntiAvvAlt, golAlt: golAlt, golAvvAlt: golAvvAlt,
    puntiClassifica: puntiClassifica, puntiClassificaAlt: puntiClassificaAlt,
    esitoReale: esitoReale, esitoAlt: esitoAlt, deltaPunti: deltaPunti,
    onSoglia: CULASogliaPrecisa(punti),
    avvOnSoglia: CULASogliaPrecisa(puntiAvv),
    mancaMezzo: CULMancaSogliaPerMezzo(punti, gol),
    avvMancaMezzo: CULMancaSogliaPerMezzo(puntiAvv, golAvv),
    avvAMezzo: Math.abs(CULNum(puntiAvv) - CULNum(punti - 0.5)) < 0.001,
    aMezzoDaAvv: Math.abs(CULNum(punti) - CULNum(puntiAvv - 0.5)) < 0.001,
    pesoImpatto: CULImpattoDaCambio(esitoAlt, esitoReale, deltaPunti, deltaPunti >= 0 ? "pro" : "contro")
  };
}

function CULRegolaSantoGraal(ctx) {
  if (ctx.casa && ctx.esitoReale == "W" && ctx.esitoAlt == "L" && CULIs66Preciso(ctx.punti) && Math.abs(CULNum(ctx.puntiAvv) - 65.5) < 0.001) return true;
  return false;
}

function CULRegolaMaledizioneSuprema(ctx) {
  if (!ctx.casa && ctx.esitoReale == "L" && ctx.esitoAlt == "W" && Math.abs(CULNum(ctx.punti) - 65.5) < 0.001 && CULIs66Preciso(ctx.puntiAvv)) return true;
  return false;
}

function CULClassificaPrestazione(ctx) {
  var rules = [
    { tier:"S", codice:"S_SANTO_GRAAL", label:"Il Santo Graal", dir:"pro", famiglia:"tripla", test:function(c){ return CULRegolaSantoGraal(c); }, nota:"Corto muso chirurgico casalingo: 66,0 contro 65,5 e fattore campo che trasforma sconfitta in vittoria." },
    { tier:"S", codice:"S_MALEDIZIONE_SUPREMA", label:"La Maledizione Suprema", dir:"contro", famiglia:"tripla", test:function(c){ return CULRegolaMaledizioneSuprema(c); }, nota:"Corto muso beffa in trasferta: 65,5 contro 66,0 casa e fattore campo che trasforma vittoria in sconfitta." },

    { tier:"A", codice:"A_CHIRURGICA_CALENDARIO", label:"Chirurgica da calendario", dir:"pro", famiglia:"calendario", test:function(c){ return c.deltaPunti > 0 && c.esitoReale == "W" && c.esitoAlt != "W" && c.onSoglia && c.avvAMezzo; }, nota:"Vittoria chirurgica con soglia esatta e fattore campo determinante." },
    { tier:"A", codice:"A_MIRACOLO_CALENDARIO", label:"Miracolo da calendario", dir:"pro", famiglia:"calendario", test:function(c){ return c.deltaPunti > 0 && c.esitoReale == "D" && c.esitoAlt == "L" && c.onSoglia; }, nota:"Pareggio salvato dal fattore campo e dalla soglia precisa." },
    { tier:"A", codice:"A_BEFFA_CALENDARIO", label:"Beffa da calendario", dir:"contro", famiglia:"calendario", test:function(c){ return c.deltaPunti < 0 && c.esitoAlt == "W" && c.esitoReale != "W" && c.aMezzoDaAvv; }, nota:"Risultato utile perso per incastro di soglia avversaria e fattore campo." },
    { tier:"A", codice:"A_PAREGGIO_STRETTO_CALENDARIO", label:"Pareggio stretto da calendario", dir:"contro", famiglia:"calendario", test:function(c){ return c.deltaPunti < 0 && c.esitoAlt == "W" && c.esitoReale == "D"; }, nota:"Vittoria trasformata in pareggio dal fattore campo avversario." },

    { tier:"B", codice:"B_VITTORIA_CHIRURGICA_PURA", label:"Vittoria chirurgica pura", dir:"pro", famiglia:"mezzoPuntoSoglia", test:function(c){ return c.esitoReale == "W" && c.gol == c.golAvv + 1 && c.onSoglia && c.avvAMezzo; }, nota:"Vittoria con soglia esatta e avversario a -0,5 dalla stessa soglia." },
    { tier:"B", codice:"B_PAREGGIO_MIRACOLATO_PURO", label:"Pareggio miracolato puro", dir:"pro", famiglia:"mezzoPuntoSoglia", test:function(c){ return c.esitoReale == "D" && c.punti < c.puntiAvv && c.onSoglia && c.avvMancaMezzo; }, nota:"Pareggio strappato con avversario sopra ai punti e fermo a -0,5 dalla soglia successiva." },
    { tier:"B", codice:"B_SCONFITTA_BEFFA_PURA", label:"Sconfitta beffa pura", dir:"contro", famiglia:"mezzoPuntoSoglia", test:function(c){ return c.esitoReale == "L" && c.golAvv == c.gol + 1 && c.avvOnSoglia && c.aMezzoDaAvv; }, nota:"Sconfitta di un gol: tu a -0,5 dalla soglia, avversario esatto sulla soglia." },
    { tier:"B", codice:"B_CORTO_MUSO_PURO", label:"Corto muso puro", dir:"pro", famiglia:"vittoriaMinima", test:function(c){ return c.gol == 1 && c.golAvv == 0 && CULIs66Preciso(c.punti); }, nota:"Vittoria 1-0 facendo esattamente 66 punti." },
    { tier:"B", codice:"B_CORTO_MUSO_SUBITO_PURO", label:"Corto muso subito puro", dir:"contro", famiglia:"vittoriaMinima", test:function(c){ return c.gol == 0 && c.golAvv == 1 && CULIs66Preciso(c.puntiAvv); }, nota:"Sconfitta 0-1 contro avversario a 66 punti." },

    { tier:"C", codice:"C_GIUSTO_GIUSTO", label:"Giusto giusto", dir:"pro", famiglia:"soglia", test:function(c){ return c.esitoReale == "W" && c.onSoglia; }, nota:"Soglia esatta in una vittoria, senza incastro superiore." },
    { tier:"C", codice:"C_VITTORIA_MANCATA_05", label:"Vittoria mancata per 0,5", dir:"contro", famiglia:"mezzoPuntoSoglia", test:function(c){ return c.esitoReale == "D" && c.mancaMezzo; }, nota:"Con 0,5 punti in piu avrebbe segnato un gol in piu e vinto la partita." },
    { tier:"C", codice:"C_SCONFITTA_PELO_05", label:"Sconfitta per un pelo", dir:"contro", famiglia:"mezzoPuntoSoglia", test:function(c){ return c.esitoReale == "L" && c.golAvv == c.gol + 1 && c.mancaMezzo; }, nota:"Con 0,5 punti in piu avrebbe segnato un gol in piu e pareggiato la partita." },
    { tier:"C", codice:"C_PAREGGIO_STRETTO", label:"Pareggio stretto", dir:"contro", famiglia:"mezzoPuntoSoglia", test:function(c){ return c.esitoReale == "D" && c.punti > c.puntiAvv && c.mancaMezzo; }, nota:"Pareggio con piu punti dell'avversario e soglia successiva mancata per 0,5." },

    { tier:"D", codice:"D_FATTORE_CAMPO_BASE_PRO", label:"Fattore campo base favorevole", dir:"pro", famiglia:"fattoreCampo", test:function(c){ return c.deltaPunti > 0 && c.esitoReale != c.esitoAlt; }, nota:"Il fattore campo porta punti classifica, ma senza rientrare nei casi superiori." },
    { tier:"D", codice:"D_FATTORE_CAMPO_BASE_CONTRO", label:"Fattore campo base contro", dir:"contro", famiglia:"fattoreCampo", test:function(c){ return c.deltaPunti < 0 && c.esitoReale != c.esitoAlt; }, nota:"Il fattore campo toglie punti classifica, ma senza rientrare nei casi superiori." },
    { tier:"D", codice:"D_SOGLIA_PRECISA_PRO", label:"Soglia precisa non decisiva", dir:"pro", famiglia:"soglia", test:function(c){ return c.onSoglia && c.esitoReale != "L"; }, nota:"Soglia precisa favorevole, ma non decisiva sul risultato." },
    { tier:"D", codice:"D_SOGLIA_PRECISA_CONTRO", label:"Soglia precisa avversaria", dir:"contro", famiglia:"soglia", test:function(c){ return false; }, nota:"Sconfitta contro avversario su soglia precisa, non classificata in casi superiori." }
  ];

  for (var i = 0; i < rules.length; i++) {
    if (rules[i].test(ctx)) {
      var suff = "";
      if (ctx.deltaPunti != 0) suff += "|delta" + String(ctx.deltaPunti);
      suff += "|" + ctx.esitoAlt + ">" + ctx.esitoReale;
      return CULMakeEventoDaRegola(rules[i], ctx, rules[i].nota + " Impatto: " + CULNomeEsito(ctx.esitoAlt) + " -> " + CULNomeEsito(ctx.esitoReale) + ".", { configSuffix: suff });
    }
  }
  return null;
}

function CULBuildPerformanceEvents(m) {
  var eventsBySide = { C: [], F: [] };
  var pc = CULNum(CULGet(m, "PuntiCasa"));
  var pf = CULNum(CULGet(m, "PuntiFuori"));
  if (pc <= 0 && pf <= 0) return eventsBySide;

  var gc = CULGolCasa(m, pc);
  var gf = CULGolFuori(m, pf);
  if (isNaN(gc) || isNaN(gf)) return eventsBySide;

  var neutro = String(CULGet(m, "Neutro") || "").replace(/\s+/g, "").toUpperCase();
  var pcAlt = pc;
  var pfAlt = pf;
  if (neutro != "N") {
    pcAlt = CULNum(pc - 1);
    pfAlt = CULNum(pf + 1);
  }
  var gcAlt = CULGolDaPunti(pcAlt);
  var gfAlt = CULGolDaPunti(pfAlt);

  var ctxCasa = CULNewSideContext(m, "C", pc, pf, gc, gf, pcAlt, pfAlt, gcAlt, gfAlt);
  var ctxFuori = CULNewSideContext(m, "F", pc, pf, gc, gf, pcAlt, pfAlt, gcAlt, gfAlt);
  var evCasa = CULClassificaPrestazione(ctxCasa);
  var evFuori = CULClassificaPrestazione(ctxFuori);
  if (evCasa) eventsBySide.C.push(evCasa);
  if (evFuori) eventsBySide.F.push(evFuori);
  return eventsBySide;
}

function CULPesoLivello(livello) {
  var pesi = CULCfgObj("pesoLivello");
  if (pesi && pesi[livello] != null) return parseFloat(pesi[livello]);
  if (livello == "secondario") return 0.24;
  if (livello == "tag") return 0.06;
  return 1.00;
}

function CULPesoRaritaDaFrequenza(freq) {
  freq = parseFloat(freq);
  if (isNaN(freq)) freq = 0;

  var cfg = CULCfg();
  var tab = cfg.rarita || null;

  if (tab && tab.length) {
    for (var i = 0; i < tab.length; i++) {
      if (freq >= parseFloat(tab[i].minFreq)) return parseFloat(tab[i].peso);
    }
  }

  if (freq >= 0.10) return 1.00;
  if (freq >= 0.05) return 1.18;
  if (freq >= 0.02) return 1.48;
  if (freq >= 0.01) return 1.90;
  if (freq >= 0.005) return 2.45;
  if (freq >= 0.002) return 3.25;
  if (freq >= 0.001) return 4.15;
  return 5.25;
}

function CULPesoRaritaCombinato(ev, baseline) {
  var fam = baseline.family[ev.rarityFamilyKey] || 0;
  var cfg = baseline.config[ev.rarityConfigKey] || 0;
  var prest = baseline.prestazioniTotali || 1;
  var pfam = CULPesoRaritaDaFrequenza(fam / prest);
  var pcfg = CULPesoRaritaDaFrequenza(cfg / prest);

  var blend = CULCfgNum("pesoConfigBlend", 0.34);
  var peso = pfam * (1 + (pcfg - 1) * blend);

  var maxR = CULCfgNum("pesoRaritaMax", CUL_PESO_RARITA_MAX || 6.25);
  if (peso > maxR) peso = maxR;

  return peso;
}

function CULAddCount(map, key, inc) {
  key = String(key);
  if (!map[key]) map[key] = 0;
  map[key] += inc;
}

function CULBuildBaseline() {
  var baseline = { prestazioniTotali: 0, partiteTotali: 0, family: {}, config: {}, proScoreTot: 0, controScoreTot: 0, saldoMedioPerPrestazione: 0 };

  CULEachConfronto(function(m) {
    var pc = CULNum(CULGet(m, "PuntiCasa"));
    var pf = CULNum(CULGet(m, "PuntiFuori"));
    if (pc <= 0 && pf <= 0) return;

    baseline.partiteTotali++;
    baseline.prestazioniTotali += 2;

    var bySide = CULBuildPerformanceEvents(m);
    var lati = ["C", "F"];
    for (var l = 0; l < lati.length; l++) {
      var arr = bySide[lati[l]];
      for (var i = 0; i < arr.length; i++) {
        CULAddCount(baseline.family, arr[i].rarityFamilyKey, 1);
        CULAddCount(baseline.config, arr[i].rarityConfigKey, 1);
      }
    }
  });

  CULEachConfronto(function(m) {
    var pc = CULNum(CULGet(m, "PuntiCasa"));
    var pf = CULNum(CULGet(m, "PuntiFuori"));
    if (pc <= 0 && pf <= 0) return;

    var bySide = CULBuildPerformanceEvents(m);
    var lati = ["C", "F"];
    for (var l = 0; l < lati.length; l++) {
      var arr = bySide[lati[l]];
      for (var i = 0; i < arr.length; i++) {
        var score = CULScoreEvento(arr[i], baseline);
        if (arr[i].dir == "pro") baseline.proScoreTot += score;
        else baseline.controScoreTot += score;
      }
    }
  });

  baseline.saldoMedioPerPrestazione = (baseline.proScoreTot - baseline.controScoreTot) / Math.max(1, baseline.prestazioniTotali);
  baseline.proMedioPerPrestazione = baseline.proScoreTot / Math.max(1, baseline.prestazioniTotali);
  baseline.controMedioPerPrestazione = baseline.controScoreTot / Math.max(1, baseline.prestazioniTotali);
  return baseline;
}

function CULGetBaseline() {
  if (!CUL_BASELINE) CUL_BASELINE = CULBuildBaseline();
  return CUL_BASELINE;
}

function CULNewTeam(nome) {
  return {
    squadra: nome,
    partite: 0,
    culoLordo: 0,
    sfigaLordo: 0,
    eventiPro: 0,
    eventiContro: 0,
    scoreCompetizioni: {},
    eventi: []
  };
}

function CULEnsureTeam(map, nome) {
  nome = String(nome == null ? "" : nome);
  if (!map[nome]) map[nome] = CULNewTeam(nome);
  return map[nome];
}

function CULMatchFiltri(m, stagioneFiltro, compMap) {
  var st = parseInt(CULGet(m, "Stagione"), 10);
  if (stagioneFiltro != 0 && st != parseInt(stagioneFiltro, 10)) return false;
  var comp = CULCompetizioneNormalizzata(CULGet(m, "Competizione"));
  return !!compMap[String(comp)];
}

function CULScoreEvento(ev, baseline) {
  var pesoRarita = CULPesoRaritaCombinato(ev, baseline);
  return pesoRarita * ev.pesoQualita;
}

function CULCalcolaCampione(stagioneFiltro, compMap) {
  var baseline = CULGetBaseline();
  var out = { teams: {}, partite: 0, prestazioni: 0 };

  CULEachConfronto(function(m) {
    if (!CULMatchFiltri(m, stagioneFiltro, compMap)) return;

    var pc = CULNum(CULGet(m, "PuntiCasa"));
    var pf = CULNum(CULGet(m, "PuntiFuori"));
    if (pc <= 0 && pf <= 0) return;

    out.partite++;
    out.prestazioni += 2;

    var nomeCasa = CULNomeSquadraDaId(CULGet(m, "IDASquadraCasa"), CULGet(m, "SquadraCasa"));
    var nomeFuori = CULNomeSquadraDaId(CULGet(m, "IDASquadraFuori"), CULGet(m, "SquadraFuori"));
    CULEnsureTeam(out.teams, nomeCasa).partite++;
    CULEnsureTeam(out.teams, nomeFuori).partite++;

    var bySide = CULBuildPerformanceEvents(m);
    var lati = ["C", "F"];
    for (var l = 0; l < lati.length; l++) {
      var arr = bySide[lati[l]];
      for (var i = 0; i < arr.length; i++) {
        var ev = arr[i];
        var st = CULEnsureTeam(out.teams, ev.squadra);
        var score = CULScoreEvento(ev, baseline);
        ev.score = score;
        ev.pesoRarita = CULPesoRaritaCombinato(ev, baseline);
        ev.pesoLivello = 1.00;
        ev.freqFamily = (baseline.family[ev.rarityFamilyKey] || 0) / Math.max(1, baseline.prestazioniTotali);
        ev.freqConfig = (baseline.config[ev.rarityConfigKey] || 0) / Math.max(1, baseline.prestazioniTotali);

        if (ev.dir == "pro") {
          st.culoLordo += score;
          st.eventiPro++;
        } else {
          st.sfigaLordo += score;
          st.eventiContro++;
        }

        var ck = String(ev.compId);
        if (!st.scoreCompetizioni[ck]) st.scoreCompetizioni[ck] = { nome: ev.compNome, pro: 0, contro: 0, partite: 0 };
        if (ev.dir == "pro") st.scoreCompetizioni[ck].pro += score;
        else st.scoreCompetizioni[ck].contro += score;
        st.eventi.push(ev);
      }
    }
  });

  CULFinalizzaCampione(out);
  return out;
}

function CULTanh(x) {
  if (Math.tanh) return Math.tanh(x);
  var e1 = Math.exp(x);
  var e2 = Math.exp(-x);
  return (e1 - e2) / (e1 + e2);
}

function CULIndiceDaSaldo(saldoPerPartita, partite) {
  var k = CULCfgNum("kScala", 4.15);
  var minPartite = CULCfgNum("minPartiteAffidabili", 20);

  var grezzo = 50 + 50 * CULTanh(saldoPerPartita / k);
  if (grezzo < 0) grezzo = 0;
  if (grezzo > 100) grezzo = 100;

  var affid = Math.min(1, partite / minPartite);
  return 50 + (grezzo - 50) * affid;
}

function CULFinalizzaTeam(t, baseline) {
  baseline = baseline || CULGetBaseline();
  var p = Math.max(1, t.partite);
  t.culoPerPartita = t.culoLordo / p;
  t.sfigaPerPartita = t.sfigaLordo / p;
  t.saldoPerPartitaGrezzo = t.culoPerPartita - t.sfigaPerPartita;
  t.saldoPerPartita = t.saldoPerPartitaGrezzo - (baseline.saldoMedioPerPrestazione || 0);
  t.affidabilita = Math.min(1, t.partite / CULCfgNum("minPartiteAffidabili", 20));
  t.indice = CULIndiceDaSaldo(t.saldoPerPartita, t.partite);
  t.saldoLordo = t.culoLordo - t.sfigaLordo;
}

function CULFinalizzaCampione(out) {
  var baseline = CULGetBaseline();
  for (var k in out.teams) if (out.teams.hasOwnProperty(k)) CULFinalizzaTeam(out.teams[k], baseline);
}

function CULCombinaTeam(stag, stor) {
  var out = CULNewTeam(stag ? stag.squadra : stor.squadra);
  var ts = stag || CULNewTeam(out.squadra);
  var th = stor || CULNewTeam(out.squadra);
  out.partite = ts.partite;
  out.partiteStoriche = th.partite;
  out.culoLordo = ts.culoLordo;
  out.sfigaLordo = ts.sfigaLordo;
  out.eventiPro = ts.eventiPro;
  out.eventiContro = ts.eventiContro;
  out.culoPerPartita = ts.culoPerPartita || 0;
  out.sfigaPerPartita = ts.sfigaPerPartita || 0;
  out.saldoPerPartita = ts.saldoPerPartita || 0;
  out.saldoPerPartitaGrezzo = ts.saldoPerPartitaGrezzo || 0;
  out.indiceStagione = ts.indice || 50;
  out.indiceStorico = th.indice || 50;
  out.indice = out.indiceStagione;
out.diffStorico = out.indiceStagione - out.indiceStorico;
  out.affidabilita = ts.affidabilita || 0;
  out.eventi = ts.eventi || [];
  out.scoreCompetizioni = ts.scoreCompetizioni || {};
  return out;
}

function CULArrayTeams(campione) {
  var arr = [];
  for (var k in campione.teams) if (campione.teams.hasOwnProperty(k)) arr.push(campione.teams[k]);
  arr.sort(function(a, b) {
    if (b.indice != a.indice) return b.indice - a.indice;
    if (b.partite != a.partite) return b.partite - a.partite;
    return String(a.squadra).localeCompare(String(b.squadra));
  });
  return arr;
}

function CULGetSquadreAttualiMap() {
  if (typeof SRVGetSquadreAttualiMap == "function") return SRVGetSquadreAttualiMap();
  var ultima = CULUltimaStagione();
  var map = {};
  CULEachConfronto(function(m) {
    if (parseInt(CULGet(m, "Stagione"), 10) != ultima) return;
    map[CULNomeSquadraDaId(CULGet(m, "IDASquadraCasa"), CULGet(m, "SquadraCasa"))] = true;
    map[CULNomeSquadraDaId(CULGet(m, "IDASquadraFuori"), CULGet(m, "SquadraFuori"))] = true;
  });
  return map;
}

function CULFiltraSquadre(arr, modo) {
  var filtro = document.getElementById("culFiltroSquadre").value;
  if (filtro == "auto") filtro = modo == "stagione" ? "attuali" : "tutte";
  if (filtro != "attuali") return arr;
  var att = CULGetSquadreAttualiMap();
  var out = [];
  for (var i = 0; i < arr.length; i++) if (att[arr[i].squadra]) out.push(arr[i]);
  return out;
}

function CULLabel(indice) {
  indice = parseFloat(indice);
  if (isNaN(indice)) indice = 50;

  var cfg = CULCfg();
  var fasce = cfg.fasce || null;

  if (fasce && fasce.length) {
    for (var i = 0; i < fasce.length; i++) {
      if (indice >= parseFloat(fasce[i].min)) return String(fasce[i].label);
    }
  }

  if (indice >= 90) return "Co' 'sso culo puoi andare a cazzi";
  if (indice >= 85) return "Protetto dagli dei";
  if (indice >= 73) return "Culone conclamato";
  if (indice >= 66) return "Fortunello";
  if (indice > 53) return "Non ti lamentare";
  if (indice >= 48) return "Ne carne ne pesce";
  if (indice >= 35) return "Doveva andare meglio";
  if (indice >= 28) return "Sfigatello";
  if (indice >= 16) return "Sfiga cieca";
  if (indice >= 11) return "Raccoglitore di cetrioli";
  return "Vai a farti una vasca a Lourdes";
}

function CULClassIndice(indice) {
  indice = parseFloat(indice);
  if (isNaN(indice)) indice = 50;

  if (indice > 53) return "cul-good";
  if (indice < 48) return "cul-bad";
  return "cul-neutral";
}

function CULContributoCompetizioni(t) {
  var arr = [];
  for (var k in t.scoreCompetizioni) {
    if (!t.scoreCompetizioni.hasOwnProperty(k)) continue;
    var c = t.scoreCompetizioni[k];
    arr.push({ nome: c.nome, saldo: c.pro - c.contro, pro: c.pro, contro: c.contro });
  }
  arr.sort(function(a, b) { return Math.abs(b.saldo) - Math.abs(a.saldo); });
  var html = "";
  for (var i = 0; i < arr.length && i < 4; i++) {
    html += "<div>" + CULH(arr[i].nome) + ": " + CULF(arr[i].saldo) + "</div>";
  }
  return html || "-";
}

function CULRenderClassifica(titolo, arr, modo, topN) {
  if (topN > 0 && arr.length > topN) arr = arr.slice(0, topN);

  var html = "<div class=\"cul-card\"><h3>" + CULH(titolo) + "</h3>";
  html += "<table class=\"tb\"><tr>";
  html += "<th>Pos.</th><th>Squadra</th><th>Partite</th><th>Culometro</th><th>Culo/partita</th><th>Sfiga/partita</th><th>Saldo/partita</th><th>Affid.</th><th>Etichetta</th><th>Contributo competizioni</th><th>Dettaglio</th></tr>";

  if (arr.length == 0) {
    html += "<tr><td colspan=\"11\">Nessun dato disponibile per il filtro selezionato.</td></tr>";
  }

  for (var i = 0; i < arr.length; i++) {
    var t = arr[i];
    html += "<tr>";
    html += "<td class=\"cen\">" + (i + 1) + "</td>";
    html += "<td><b>" + CULH(t.squadra) + "</b></td>";
    html += "<td class=\"num\">" + t.partite + "</td>";
    html += "<td class=\"num " + CULClassIndice(t.indice) + "\">" + CULF(t.indice) + "</td>";
    html += "<td class=\"num\">" + CULF(t.culoPerPartita || 0) + "</td>";
    html += "<td class=\"num\">" + CULF(t.sfigaPerPartita || 0) + "</td>";
    html += "<td class=\"num\">" + CULF(t.saldoPerPartita || 0) + "</td>";
    html += "<td class=\"num\">" + CULPct(t.affidabilita || 0) + "</td>";
    html += "<td>" + CULH(CULLabel(t.indice)) + "</td>";
    html += "<td class=\"cul-muted\">" + CULContributoCompetizioni(t) + "</td>";
    html += "<td class=\"cen\"><a href=\"#culDettaglioEventi\" onclick=\"CULSetDettaglioSquadra('" + CULJS(t.squadra) + "');return false;\">apri</a></td>";
    html += "</tr>";
  }

  html += "</table>";
  html += CULRenderDettaglioEventi(arr);
  html += "</div>";
  return html;
}

function CULRenderDettaglioEventi(arr) {
  if (!CUL_DETTAGLIO_SQUADRA) {
    return "<div id=\"culDettaglioEventi\" class=\"cul-note\">Dettaglio eventi chiuso. Usa il link <b>apri</b> nella classifica per visualizzare gli eventi principali di una squadra.</div>";
  }

  if (!arr || arr.length == 0) return "";

  var top = null;
  for (var ix = 0; ix < arr.length; ix++) {
    if (String(arr[ix].squadra) == String(CUL_DETTAGLIO_SQUADRA)) {
      top = arr[ix];
      break;
    }
  }

  if (!top) {
    return "<div id=\"culDettaglioEventi\" class=\"cul-note\">La squadra selezionata non e presente nel filtro corrente.</div>";
  }

  var evs = (top.eventi || []).slice(0);
  evs.sort(function(a, b) { return b.score - a.score; });

  var html = "<div id=\"culDettaglioEventi\" class=\"cul-note\"><b>Dettaglio eventi principali per " + CULH(top.squadra) + "</b>";
  html += " - <a href=\"#culDettaglioEventi\" onclick=\"CULSetDettaglioSquadra('');return false;\">chiudi</a><br>";
  html += "Sono mostrati gli eventi piu pesanti nel campione corrente. Ogni prestazione squadra ha al massimo una etichetta principale. La rarita e calcolata sullo storico globale. Per cambiare squadra usa la colonna Dettaglio della classifica.</div>";
  html += "<table class=\"tb\"><tr><th>Evento</th><th>Competizione</th><th>Gara</th><th>Ris.</th><th>Punti</th><th>Freq. storica evento</th><th>Freq. storica config.</th><th>Impatto</th><th>Peso</th><th>Nota</th></tr>";
  if (evs.length == 0) html += "<tr><td colspan=\"10\">Nessun evento per la squadra selezionata.</td></tr>";
  for (var i = 0; i < evs.length && i < 15; i++) {
    var e = evs[i];
    var ris = CULLinkRisultato(e.m, "<b>" + e.gol + "-" + e.golAvv + "</b>");
    html += "<tr>";
    html += "<td>" + CULH(e.label) + "<br><span class=\"cul-muted\">" + CULH(e.dir == "pro" ? "favorevole" : "contrario") + " - " + CULH(e.livello) + "</span></td>";
    html += "<td>" + CULH(e.compNome) + "</td>";
    html += "<td>" + CULH(e.squadra) + " - " + CULH(e.avversario) + "</td>";
    html += "<td class=\"cen\">" + ris + "</td>";
    html += "<td class=\"cen\">" + CULF1(e.punti) + " - " + CULF1(e.puntiAvv) + "</td>";
    html += "<td class=\"num\">" + CULPct(e.freqFamily || 0) + "</td>";
    html += "<td class=\"num\">" + CULPct(e.freqConfig || 0) + "</td>";
    html += "<td class=\"num\">" + CULF(e.impatto || 1) + "</td>";
    html += "<td class=\"num\">" + CULF(e.score) + "</td>";
    html += "<td>" + CULH(e.nota) + "</td>";
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

function CULRenderInfo(stagione, compMap, modo, campione) {
  var baseline = CULGetBaseline();
  var c = 0;
  for (var k in compMap) if (compMap.hasOwnProperty(k) && compMap[k]) c++;
  var html = "Baseline storica globale: <b>" + baseline.partiteTotali + "</b> partite, <b>" + baseline.prestazioniTotali + "</b> prestazioni squadra. ";
  html += "Campione corrente: <b>" + campione.partite + "</b> partite, <b>" + campione.prestazioni + "</b> prestazioni. ";
  html += "Competizioni selezionate: <b>" + c + "</b>. ";
  html += "Algoritmo: <b>cascata S-D</b>, una etichetta principale per prestazione. ";
  html += "Scala: <b>0-100</b>, con <b>50,00</b> = equilibrio. ";
  if (modo == "stagione") html += "Stagione selezionata: <b>" + CULH(CULNomeStagione(stagione)) + "</b>. Modalita stagione: indice principale calcolato sulla stagione selezionata. Lo storico sulle stesse competizioni viene usato come confronto separato, non miscelato nel valore principale. Centratura baseline: <b>" + CULF(baseline.saldoMedioPerPrestazione || 0) + "</b>.";
  else html += "Modalita storico: indice calcolato su tutte le stagioni filtrate. Centratura baseline: <b>" + CULF(baseline.saldoMedioPerPrestazione || 0) + "</b>.";
  var el = document.getElementById("culInfo");
  if (el) el.innerHTML = html;
}

function CULRender() {
  var out = document.getElementById("culOutput");
  if (!out) return;

  var modo = document.getElementById("culModo").value;
  var vista = document.getElementById("culVista").value;
  var stagione = modo == "stagione" ? parseInt(document.getElementById("culStagione").value, 10) : 0;
  var compMap = CULGetCompetizioniSelezionate(stagione);
  var topN = parseInt(document.getElementById("culTop").value, 10);
  if (isNaN(topN)) topN = 20;

  var campione = CULCalcolaCampione(stagione, compMap);
  CULRenderInfo(stagione, compMap, modo, campione);

  var html = "";

  if (vista == "globale" || vista == "entrambe") {
    var arr = [];
    if (modo == "stagione") {
      var storico = CULCalcolaCampione(0, compMap);
      for (var k in campione.teams) {
        if (!campione.teams.hasOwnProperty(k)) continue;
        arr.push(CULCombinaTeam(campione.teams[k], storico.teams[k]));
      }
      arr.sort(function(a, b) {
        if (b.indice != a.indice) return b.indice - a.indice;
        if (b.partite != a.partite) return b.partite - a.partite;
        return String(a.squadra).localeCompare(String(b.squadra));
      });
    } else {
      arr = CULArrayTeams(campione);
    }
    arr = CULFiltraSquadre(arr, modo);
    html += CULRenderClassifica("Classifica Culometro", arr, modo, topN);
  }

  if (vista == "competizione" || vista == "entrambe") {
    var comps = CULGetCompetizioni(stagione);
    for (var i = 0; i < comps.length; i++) {
      if (!compMap[String(comps[i].id)]) continue;
      var single = {};
      single[String(comps[i].id)] = true;
      var campComp = CULCalcolaCampione(stagione, single);
      var arrComp = CULArrayTeams(campComp);
      arrComp = CULFiltraSquadre(arrComp, modo);
      html += CULRenderClassifica("Culometro - " + comps[i].nome, arrComp, modo, topN);
    }
  }

  out.innerHTML = html;
}
