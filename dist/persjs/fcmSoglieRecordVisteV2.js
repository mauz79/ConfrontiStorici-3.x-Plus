/* fcmSoglieRecordVisteV2.js - V2 pulita */
var SRV_COMP_ALTRE_ID = -1;
var SRV_COMPETIZIONI_CORE = {
  19:{nome:"Serie A",ordine:1},23:{nome:"Serie B",ordine:2},48:{nome:"Serie C",ordine:3},
  20:{nome:"Coppa Serie A",ordine:4},24:{nome:"Coppa Serie B",ordine:5},49:{nome:"Coppa Serie C",ordine:6},
  26:{nome:"Coppa tra le Coppe",ordine:7},63:{nome:"Europa Pipps",ordine:8},
  21:{nome:"Supercoppa Serie A",ordine:9},25:{nome:"Supercoppa Serie B",ordine:10},50:{nome:"Supercoppa Serie C",ordine:11}
};
var SRV_RECORD_ORDER = ["fattoreCampo","vittoriaChirurgica","pareggioMiracolato","sconfittaBeffa","pareggioStretto","sogliaPrecisa"];
var SRV_RECORD_LABEL = {fattoreCampo:"Fattore campo decisivo",vittoriaChirurgica:"Vittoria chirurgica",pareggioMiracolato:"Pareggio miracolato",sconfittaBeffa:"Sconfitta beffa",pareggioStretto:"Pareggio stretto",sogliaPrecisa:"Soglia precisa"};
var SRV_METRICHE_ORDINE = ["saldoFortuna","fortuna","sfortuna","vittChir","parMir","sconBeffa","parStretto","soglie","sprecoTotale","saldoFattoreCampo","fcGuadagnatiCasa","fcPersiTrasferta"];
var SRV_METRICHE = {
  saldoFortuna:{label:"Indice fortuna netto",descrizione:"Saldo tra record favorevoli e sfavorevoli: fortuna - sfortuna.",col:"Saldo",val:function(x){return (x.fortuna||0)-(x.sfortuna||0);},pct:function(x){return SRVPctNum(x.fortuna||0,x.giocate||0);}},
  fortuna:{label:"Botte di culo totali",descrizione:"Vittorie chirurgiche + pareggi miracolati.",col:"Fortuna",val:function(x){return x.fortuna||0;},pct:function(x){return SRVPctNum(x.fortuna||0,x.giocate||0);}},
  sfortuna:{label:"Sindrome di Fantozzi totale",descrizione:"Sconfitte beffa + pareggi stretti.",col:"Sfortuna",val:function(x){return x.sfortuna||0;},pct:function(x){return SRVPctNum(x.sfortuna||0,x.giocate||0);}},
  vittChir:{label:"Vittorie chirurgiche",descrizione:"Vittoria di un solo gol con squadra sulla soglia esatta e avversario a -0,5 dalla stessa soglia.",col:"Vitt. chirurgiche",val:function(x){return x.vittChir||0;},pct:function(x){return SRVPctNum(x.vittChir||0,x.giocate||0);}},
  parMir:{label:"Pareggi miracolati",descrizione:"Pareggio salvato da chi raggiunge la soglia esatta mentre l'avversario, pur facendo piu punti, manca la soglia successiva per 0,5.",col:"Par. miracolati",val:function(x){return x.parMir||0;},pct:function(x){return SRVPctNum(x.parMir||0,x.giocate||0);}},
  sconBeffa:{label:"Sconfitte beffa",descrizione:"Sconfitta di un solo gol con avversario sulla soglia esatta e squadra a -0,5 dalla stessa soglia.",col:"Sconf. beffa",val:function(x){return x.sconBeffa||0;},pct:function(x){return SRVPctNum(x.sconBeffa||0,x.giocate||0);}},
  parStretto:{label:"Pareggi stretti",descrizione:"Pareggio subito da chi fa piu punti, resta a -0,5 dalla soglia successiva e trova l'avversario sulla propria soglia.",col:"Par. stretti",val:function(x){return x.parStretto||0;},pct:function(x){return SRVPctNum(x.parStretto||0,x.giocate||0);}},
  soglie:{label:"Tiratori scelti - soglie precise",descrizione:"Prestazioni chiuse esattamente su una soglia gol: 66, 72, 77, 81, 85, 89, ecc.",col:"Soglie precise",val:function(x){return x.soglie||0;},pct:function(x){return SRVPctNum(x.soglie||0,x.giocate||0);}},
  sprecoTotale:{label:"Spreco punti in vittorie",descrizione:"Punti oltre la soglia gol nelle partite vinte senza ottenere un gol in piu.",col:"Spreco totale",val:function(x){return x.sprecoTotale||0;},pct:function(x){return x.sprecoVittorie?(x.sprecoTotale||0)/x.sprecoVittorie:0;}},
  saldoFattoreCampo:{label:"Fattore campo - saldo",descrizione:"Saldo tra punti guadagnati in casa grazie al +1 e punti persi fuori casa per il +1 avversario.",col:"Saldo FC",val:function(x){return x.fcSaldo||0;},pct:function(x){return SRVPctNum(x.fcProCasa||0,x.giocate||0);}},
  fcGuadagnatiCasa:{label:"Fattore campo - punti guadagnati in casa",descrizione:"Punti classifica guadagnati in casa grazie al fattore campo.",col:"Punti guadagnati",val:function(x){return x.fcGuadagnatiCasa||0;},pct:function(x){return SRVPctNum(x.fcProCasa||0,x.giocate||0);}},
  fcPersiTrasferta:{label:"Fattore campo - punti persi in trasferta",descrizione:"Punti classifica persi in trasferta per effetto del +1 della squadra di casa avversaria.",col:"Punti persi",val:function(x){return x.fcPersiTrasferta||0;},pct:function(x){return SRVPctNum(x.fcControTrasferta||0,x.giocate||0);}}
};
function SRVH(s){s=String(s==null?"":s);return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");}
function SRVNum(n){var x=parseFloat(n);return isNaN(x)?0:Math.round(x*10)/10;}
function SRVF(n){if(typeof SogRepFmt=="function")return SogRepFmt(n);var x=SRVNum(n);return Math.abs(x-Math.round(x))<0.001?String(Math.round(x)):String(x).replace(".",",");}
function SRVPctNum(n,d){n=parseFloat(n||0);d=parseFloat(d||0);return d?(n*100)/d:0;}
function SRVPct(n,d){return SRVF(SRVPctNum(n,d))+"%";}
function SRVArray(m){var a=[];for(var k in m){if(m.hasOwnProperty(k))a.push(m[k]);}return a;}
function SRVPuntiClassifica(gf,gs){if(gf>gs)return 3;if(gf==gs)return 1;return 0;}
function SRVUltimaStagione(){if(typeof SogRepUltimaStagione=="function")return SogRepUltimaStagione();var max=0;if(typeof arrConfronti=="undefined")return 0;for(var i=1;i<arrConfronti.length;i++){if(arrConfronti[i]&&arrConfronti[i].Stagione>max)max=arrConfronti[i].Stagione;}return max;}
function SRVNomeCompetizione(id){id=parseInt(id,10);if(id==0)return "Tutte le competizioni";if(id==SRV_COMP_ALTRE_ID)return "Altre competizioni";return SRV_COMPETIZIONI_CORE[id]?SRV_COMPETIZIONI_CORE[id].nome:"Altre competizioni";}
function SRVOrdineCompetizione(id){id=parseInt(id,10);if(id==0)return 0;if(id==SRV_COMP_ALTRE_ID)return 99;return SRV_COMPETIZIONI_CORE[id]?SRV_COMPETIZIONI_CORE[id].ordine:99;}
function SRVCompetizioneNormalizzata(id){id=parseInt(id,10);return SRV_COMPETIZIONI_CORE[id]?id:SRV_COMP_ALTRE_ID;}
function SRVMatchCompetizione(idReale,filtroId){idReale=parseInt(idReale,10);filtroId=parseInt(filtroId,10);if(filtroId==0)return true;if(filtroId==SRV_COMP_ALTRE_ID)return !SRV_COMPETIZIONI_CORE[idReale];return idReale==filtroId;}
function SRVUrlGiornata(m){if(typeof SogRepUrlGiornata=="function")return SogRepUrlGiornata(m);if(typeof SogRepCartellaStagione!="function")return "";var c=SogRepCartellaStagione(m.Stagione);if(c=="")return "";var ext=(typeof SOG_REP_EXT!="undefined")?SOG_REP_EXT:"php";return "../"+c+"/ris."+ext+"?Gio="+m.GiornataA;}
function SRVLinkGiornata(m){var h=SRVUrlGiornata(m);return h==""?SRVH(m.GiornataA):"<a href='"+h+"' title='Apri tabellino giornata'>"+SRVH(m.GiornataA)+"</a>";}
function SRVLinkRisultato(m,t){var h=SRVUrlGiornata(m);return h==""?t:"<a href='"+h+"' title='Apri tabellino partita/giornata'>"+t+"</a>";}
function SRVGetStagioni(){var map={},a=[];if(typeof arrConfronti=="undefined")return a;for(var i=1;i<arrConfronti.length;i++){var m=arrConfronti[i];if(!m)continue;if(!map[m.Stagione]){map[m.Stagione]=true;a.push(m.Stagione);}}a.sort(function(x,y){return y-x;});return a;}
function SRVGetCompetizioni(stagione){var map={},a=[];if(typeof arrConfronti=="undefined")return a;for(var i=1;i<arrConfronti.length;i++){var m=arrConfronti[i];if(!m)continue;if(stagione!=0&&m.Stagione!=stagione)continue;var id=SRVCompetizioneNormalizzata(m.Competizione);if(!map[id]){map[id]=true;a.push({id:id,nome:SRVNomeCompetizione(id),ordine:SRVOrdineCompetizione(id)});}}a.sort(function(x,y){if(x.ordine!=y.ordine)return x.ordine-y.ordine;return String(x.nome).localeCompare(String(y.nome));});return a;}
function SRVGetSquadreAttualiMap(){var ultima=SRVUltimaStagione(),map={};if(typeof arrConfronti=="undefined")return map;for(var i=1;i<arrConfronti.length;i++){var m=arrConfronti[i];if(m&&m.Stagione==ultima){map[m.SquadraCasa]=true;map[m.SquadraFuori]=true;}}return map;}
function SRVNewStat(nome){return {nome:nome,giocate:0,fortuna:0,sfortuna:0,vittChir:0,parMir:0,sconBeffa:0,parStretto:0,soglie:0,soglieV:0,soglieN:0,soglieP:0,sprecoTotale:0,sprecoVittorie:0,sprecoMax:0,fcProCasa:0,fcControTrasferta:0,fcGuadagnatiCasa:0,fcPersiTrasferta:0,fcSaldo:0};}
function SRVEnsureStat(map,nome){if(!map[nome])map[nome]=SRVNewStat(nome);return map[nome];}
function SRVGetGolCasa(m){var v=parseInt(m.GolRegoCasa,10);if(isNaN(v))v=parseInt(m.GolCasa,10);return isNaN(v)?0:v;}
function SRVGetGolFuori(m){var v=parseInt(m.GolRegoFuori,10);if(isNaN(v))v=parseInt(m.GolFuori,10);return isNaN(v)?0:v;}
function SRVThresholdForGol(g){g=parseInt(g,10);if(isNaN(g)||g<=0||typeof SOG_REP_SOGLIE=="undefined")return null;if(g-1>=SOG_REP_SOGLIE.length)return null;return SOG_REP_SOGLIE[g-1];}
function SRVAddSpreco(st,punti,gol){var soglia=SRVThresholdForGol(gol);if(soglia==null)return;var sp=SRVNum(punti-soglia);if(sp<=0)return;st.sprecoVittorie++;st.sprecoTotale=SRVNum((st.sprecoTotale||0)+sp);if(sp>(st.sprecoMax||0))st.sprecoMax=sp;}
function SRVContaPartite(stagione,compId){var n=0;if(typeof arrConfronti=="undefined")return 0;for(var i=1;i<arrConfronti.length;i++){var m=arrConfronti[i];if(!m)continue;if(stagione!=0&&m.Stagione!=stagione)continue;if(!SRVMatchCompetizione(m.Competizione,compId))continue;n++;}return n;}
function SRVBaseStats(stagione,compId){var map={};if(typeof arrConfronti=="undefined")return map;for(var i=1;i<arrConfronti.length;i++){var m=arrConfronti[i];if(!m)continue;if(stagione!=0&&m.Stagione!=stagione)continue;if(!SRVMatchCompetizione(m.Competizione,compId))continue;var c=SRVEnsureStat(map,m.SquadraCasa),f=SRVEnsureStat(map,m.SquadraFuori);c.giocate++;f.giocate++;var pc=SRVNum(m.PuntiCasa),pf=SRVNum(m.PuntiFuori),gc=SRVGetGolCasa(m),gf=SRVGetGolFuori(m);if(SRVPuntiClassifica(gc,gf)==3)SRVAddSpreco(c,pc,gc);if(SRVPuntiClassifica(gf,gc)==3)SRVAddSpreco(f,pf,gf);}return map;}
function SRVParseEffettoFc(e){var out={casa:0,fuori:0};e=String(e||"");var c=e.match(/\+([0-9]+)\s*casa/i),f=e.match(/(-?[0-9]+)\s*fuori/i);if(c)out.casa=parseInt(c[1],10);if(f)out.fuori=parseInt(f[1],10);return out;}
function SRVBuildRowsFromAnalisi(res,compId){var rows=[];function add(r){rows.push(r);}for(var i=0;i<res.eventiFortuna.length;i++){var e=res.eventiFortuna[i];if(!SRVMatchCompetizione(e.m.Competizione,compId))continue;var key=e.tipo=="Vittoria chirurgica"?"vittoriaChirurgica":(e.tipo=="Pareggio miracolato"?"pareggioMiracolato":"");if(key=="")continue;add({key:key,tipo:e.tipo,m:e.m,squadra:e.squadra,avversario:e.avversario,coinvolti:"|"+e.squadra+"|"+e.avversario+"|",puntiHtml:SRVLinkRisultato(e.m,SRVF(e.punti)+" - "+SRVF(e.puntiAvv)),risHtml:SRVLinkRisultato(e.m,"<b>"+e.gol+"-"+e.golAvv+"</b>"),invHtml:"",effetto:"",nota:e.nota||"",metric:Math.round(parseFloat(e.punti||0)*10)});}
for(var j=0;j<res.eventiSfortuna.length;j++){var s=res.eventiSfortuna[j];if(!SRVMatchCompetizione(s.m.Competizione,compId))continue;var skey=s.tipo=="Sconfitta beffa"?"sconfittaBeffa":(s.tipo=="Pareggio stretto"?"pareggioStretto":"");if(skey=="")continue;add({key:skey,tipo:s.tipo,m:s.m,squadra:s.squadra,avversario:s.avversario,coinvolti:"|"+s.squadra+"|"+s.avversario+"|",puntiHtml:SRVLinkRisultato(s.m,SRVF(s.punti)+" - "+SRVF(s.puntiAvv)),risHtml:SRVLinkRisultato(s.m,"<b>"+s.gol+"-"+s.golAvv+"</b>"),invHtml:"",effetto:"",nota:s.nota||"",metric:Math.round(parseFloat(s.punti||0)*10)});}
for(var k=0;k<res.eventiSoglia.length;k++){var q=res.eventiSoglia[k];if(!SRVMatchCompetizione(q.m.Competizione,compId))continue;add({key:"sogliaPrecisa",tipo:"Soglia precisa",m:q.m,squadra:q.squadra,avversario:q.avversario,coinvolti:"|"+q.squadra+"|"+q.avversario+"|",puntiHtml:SRVLinkRisultato(q.m,SRVF(q.punti)+" - "+SRVF(q.puntiAvv)),risHtml:SRVLinkRisultato(q.m,"<b>"+q.gol+"-"+q.golAvv+"</b>"),invHtml:"",effetto:"",nota:q.nota||"",metric:Math.round(parseFloat(q.punti||0)*10)});}
for(var f=0;f<res.eventiFattoreCampo.length;f++){var fc=res.eventiFattoreCampo[f];if(!SRVMatchCompetizione(fc.m.Competizione,compId))continue;var reale=SRVF(fc.pc)+" - "+SRVF(fc.pf)+" ("+fc.gc+"-"+fc.gf+")",inv=SRVF(fc.pcInv)+" - "+SRVF(fc.pfInv)+" ("+fc.gcInv+"-"+fc.gfInv+")",eff="+"+fc.deltaCasa+" casa / "+fc.deltaFuori+" fuori";var nota=fc.tipo=="Da sconfitta a vittoria"?"Il +1 casa ribalta completamente la partita: senza fattore campo la squadra di casa avrebbe perso, invece vince.":(fc.tipo=="Da pareggio a vittoria"?"Il +1 casa trasforma un pareggio virtuale in vittoria reale.":(fc.tipo=="Da sconfitta a pareggio"?"Il +1 casa evita la sconfitta e salva il pareggio.":"Il fattore campo migliora il risultato della squadra di casa."));add({key:"fattoreCampo",tipo:"Fattore campo decisivo - "+fc.tipo,m:fc.m,squadra:fc.casa,avversario:fc.fuori,coinvolti:"|"+fc.casa+"|"+fc.fuori+"|",puntiHtml:SRVLinkRisultato(fc.m,reale),risHtml:SRVLinkRisultato(fc.m,"<b>"+fc.gc+"-"+fc.gf+"</b>"),invHtml:SRVLinkRisultato(fc.m,inv),effetto:eff,nota:nota,metric:(fc.deltaCasa*1000)+(fc.swingGol||0)});}
rows.sort(function(a,b){if(b.metric!=a.metric)return b.metric-a.metric;if(b.m.Stagione!=a.m.Stagione)return b.m.Stagione-a.m.Stagione;return String(a.squadra).localeCompare(String(b.squadra));});return rows;}
function SRVApplyRowsToStats(stats,rows){for(var i=0;i<rows.length;i++){var r=rows[i];if(r.key=="fattoreCampo"){var c=SRVEnsureStat(stats,r.squadra),f=SRVEnsureStat(stats,r.avversario),e=SRVParseEffettoFc(r.effetto);c.fcProCasa++;c.fcGuadagnatiCasa+=e.casa;c.fcSaldo+=e.casa;f.fcControTrasferta++;f.fcPersiTrasferta+=Math.abs(e.fuori);f.fcSaldo-=Math.abs(e.fuori);}else if(r.key=="sogliaPrecisa"){var st=SRVEnsureStat(stats,r.squadra);st.soglie++;var txt=String(r.risHtml).replace(/<[^>]*>/g,""),p=txt.split("-"),gf=parseInt(p[0],10),gs=parseInt(p[1],10),pc=SRVPuntiClassifica(gf,gs);if(pc==3)st.soglieV++;else if(pc==1)st.soglieN++;else st.soglieP++;}else if(r.key=="vittoriaChirurgica"){var v=SRVEnsureStat(stats,r.squadra);v.fortuna++;v.vittChir++;}else if(r.key=="pareggioMiracolato"){var pm=SRVEnsureStat(stats,r.squadra);pm.fortuna++;pm.parMir++;}else if(r.key=="sconfittaBeffa"){var sb=SRVEnsureStat(stats,r.squadra);sb.sfortuna++;sb.sconBeffa++;}else if(r.key=="pareggioStretto"){var ps=SRVEnsureStat(stats,r.squadra);ps.sfortuna++;ps.parStretto++;}}}
function SRVAnalizzaVista(stagione,compId){var res=SogRepAnalizza(stagione),rows=SRVBuildRowsFromAnalisi(res,compId),stats=SRVBaseStats(stagione,compId);SRVApplyRowsToStats(stats,rows);return {stagione:stagione,compId:compId,res:res,rows:rows,stats:stats,partite:SRVContaPartite(stagione,compId)};}
function SRVTopConPariMerito(arr,topN,fnVal){if(topN>=arr.length)return arr;if(topN<=0)return [];var lim=fnVal(arr[topN-1]),out=[];for(var i=0;i<arr.length;i++){if(i<topN||fnVal(arr[i])==lim)out.push(arr[i]);}return out;}
function SRVFiltroNumero(id){var v=document.getElementById(id).value;return v=="tutti"?999999:parseInt(v,10);}
function SRVSetTab(tabName){var d=document.getElementsByTagName("div");for(var i=0;i<d.length;i++){if(d[i].className=="srv-tab")d[i].style.display="none";}var el=document.getElementById(tabName);if(el)el.style.display="block";}
function SRVFillStagioni(selectId){var sel=document.getElementById(selectId),a=SRVGetStagioni();sel.options.length=0;for(var i=0;i<a.length;i++){var o=document.createElement("option");o.value=a[i];o.text="Stagione "+a[i];sel.options.add(o);}sel.value=SRVUltimaStagione();}
function SRVFillCompetizioni(selectId,stagione,includiTutte){var sel=document.getElementById(selectId),old=sel.value;sel.options.length=0;if(includiTutte){var all=document.createElement("option");all.value="0";all.text="Tutte le competizioni";sel.options.add(all);}var a=SRVGetCompetizioni(stagione);for(var i=0;i<a.length;i++){var o=document.createElement("option");o.value=a[i].id;o.text=a[i].nome;sel.options.add(o);}sel.value=old;if(sel.selectedIndex<0)sel.value="0";}
function SRVFillRecord(selectId,includiTutti){var sel=document.getElementById(selectId);sel.options.length=0;if(includiTutti){var all=document.createElement("option");all.value="tutti";all.text="Tutti i record";sel.options.add(all);}for(var i=0;i<SRV_RECORD_ORDER.length;i++){var k=SRV_RECORD_ORDER[i],o=document.createElement("option");o.value=k;o.text=SRV_RECORD_LABEL[k];sel.options.add(o);}}
function SRVFillMetriche(selectId){var sel=document.getElementById(selectId);sel.options.length=0;var all=document.createElement("option");all.value="tutti";all.text="Tutti";sel.options.add(all);for(var i=0;i<SRV_METRICHE_ORDINE.length;i++){var k=SRV_METRICHE_ORDINE[i],o=document.createElement("option");o.value=k;o.text=SRV_METRICHE[k].label;sel.options.add(o);}}
function SRVFillSquadre(selectId,stats,includiTutte){var sel=document.getElementById(selectId),old=sel.value,a=SRVArray(stats);a.sort(function(x,y){return String(x.nome).localeCompare(String(y.nome));});sel.options.length=0;if(includiTutte){var all=document.createElement("option");all.value="";all.text="Tutte";sel.options.add(all);}for(var i=0;i<a.length;i++){var o=document.createElement("option");o.value=a[i].nome;o.text=a[i].nome;sel.options.add(o);}sel.value=old;if(sel.selectedIndex<0)sel.value="";}
function SRVRenderRiepilogo(targetId,vista,squadraFiltro){
  var rows=vista.rows;
  var stats=vista.stats;
  var partite=vista.partite;
  var prest=partite*2;

  var glob={
    fortuna:0,
    sfortuna:0,
    vittChir:0,
    parMir:0,
    sconBeffa:0,
    parStretto:0,
    fc:0,
    fcPuntiCasa:0,
    fcPuntiFuori:0,
    soglie:0
  };

  var comp={};

  for(var i=0;i<rows.length;i++){
    var r=rows[i];
    var id=SRVCompetizioneNormalizzata(r.m.Competizione);
    var ck="C"+id;

    if(!comp[ck]){
      var pc=SRVContaPartite(vista.stagione,id);
      comp[ck]={
        id:id,
        nome:SRVNomeCompetizione(id),
        ordine:SRVOrdineCompetizione(id),
        partite:pc,
        prestazioni:pc*2,
        fortuna:0,
        sfortuna:0,
        vittChir:0,
        parMir:0,
        sconBeffa:0,
        parStretto:0,
        fc:0,
        fcPuntiCasa:0,
        fcPuntiFuori:0,
        soglie:0
      };
    }

    if(r.key=="vittoriaChirurgica"){
      glob.fortuna++;
      glob.vittChir++;
      comp[ck].fortuna++;
      comp[ck].vittChir++;
    }

    if(r.key=="pareggioMiracolato"){
      glob.fortuna++;
      glob.parMir++;
      comp[ck].fortuna++;
      comp[ck].parMir++;
    }

    if(r.key=="sconfittaBeffa"){
      glob.sfortuna++;
      glob.sconBeffa++;
      comp[ck].sfortuna++;
      comp[ck].sconBeffa++;
    }

    if(r.key=="pareggioStretto"){
      glob.sfortuna++;
      glob.parStretto++;
      comp[ck].sfortuna++;
      comp[ck].parStretto++;
    }

    if(r.key=="fattoreCampo"){
      var e=SRVParseEffettoFc(r.effetto);
      glob.fc++;
      glob.fcPuntiCasa+=e.casa;
      glob.fcPuntiFuori+=e.fuori;

      comp[ck].fc++;
      comp[ck].fcPuntiCasa+=e.casa;
      comp[ck].fcPuntiFuori+=e.fuori;
    }

    if(r.key=="sogliaPrecisa"){
      glob.soglie++;
      comp[ck].soglie++;
    }
  }

  var html="";

  html+="<div class='srv-note'>";
  html+="<b>Riepilogo numerico</b><br>";
  html+="Sintesi di fortuna/sfortuna, soglie precise e fattore campo decisivo. Le percentuali su fortuna e sfortuna sono calcolate sulle prestazioni squadra; il fattore campo sulle partite.";
  html+="</div>";

  html+="<h3>Impatto complessivo</h3>";
  html+="<table class='tb'>";
  html+="<tr>";
  html+="<th>Partite</th>";
  html+="<th>Prestazioni squadra</th>";
  html+="<th>Botte di culo</th>";
  html+="<th>% fortuna</th>";
  html+="<th>Sindrome Fantozzi</th>";
  html+="<th>% sfortuna</th>";
  html+="<th>Saldo F/S</th>";
  html+="<th>Vitt. chirurgiche</th>";
  html+="<th>Par. miracolati</th>";
  html+="<th>Sconf. beffa</th>";
  html+="<th>Par. stretti</th>";
  html+="<th>FC decisivo</th>";
  html+="<th>% partite FC</th>";
  html+="<th>Punti casa FC</th>";
  html+="<th>Punti fuori persi</th>";
  html+="<th>Soglie precise</th>";
  html+="<th>% soglie</th>";
  html+="</tr>";

  html+="<tr>";
  html+="<td class='num'>"+partite+"</td>";
  html+="<td class='num'>"+prest+"</td>";
  html+="<td class='num good'>"+glob.fortuna+"</td>";
  html+="<td class='num'>"+SRVPct(glob.fortuna,prest)+"</td>";
  html+="<td class='num good'>"+glob.sfortuna+"</td>";
  html+="<td class='num'>"+SRVPct(glob.sfortuna,prest)+"</td>";
  html+="<td class='num good'>"+(glob.fortuna-glob.sfortuna)+"</td>";
  html+="<td class='num'>"+glob.vittChir+"</td>";
  html+="<td class='num'>"+glob.parMir+"</td>";
  html+="<td class='num'>"+glob.sconBeffa+"</td>";
  html+="<td class='num'>"+glob.parStretto+"</td>";
  html+="<td class='num good'>"+glob.fc+"</td>";
  html+="<td class='num'>"+SRVPct(glob.fc,partite)+"</td>";
  html+="<td class='num'>"+glob.fcPuntiCasa+"</td>";
  html+="<td class='num'>"+glob.fcPuntiFuori+"</td>";
  html+="<td class='num good'>"+glob.soglie+"</td>";
  html+="<td class='num'>"+SRVPct(glob.soglie,prest)+"</td>";
  html+="</tr>";
  html+="</table>";

  var ac=SRVArray(comp);
  ac.sort(function(a,b){
    if(a.ordine!=b.ordine)return a.ordine-b.ordine;
    return String(a.nome).localeCompare(String(b.nome));
  });

  html+="<h3>Impatto per competizione</h3>";
  html+="<table class='tb'>";
  html+="<tr>";
  html+="<th>Competizione</th>";
  html+="<th>Partite</th>";
  html+="<th>Botte di culo</th>";
  html+="<th>% fortuna</th>";
  html+="<th>Fantozzi</th>";
  html+="<th>% sfortuna</th>";
  html+="<th>Saldo F/S</th>";
  html+="<th>Vitt. chir.</th>";
  html+="<th>Par. mir.</th>";
  html+="<th>Sconf. beffa</th>";
  html+="<th>Par. stretti</th>";
  html+="<th>FC decisivo</th>";
  html+="<th>% FC</th>";
  html+="<th>Punti casa FC</th>";
  html+="<th>Punti fuori persi</th>";
  html+="<th>Soglie</th>";
  html+="<th>% soglie</th>";
  html+="</tr>";

  for(var c=0;c<ac.length;c++){
    var co=ac[c];

    html+="<tr>";
    html+="<td><b>"+SRVH(co.nome)+"</b></td>";
    html+="<td class='num'>"+co.partite+"</td>";
    html+="<td class='num'>"+co.fortuna+"</td>";
    html+="<td class='num'>"+SRVPct(co.fortuna,co.prestazioni)+"</td>";
    html+="<td class='num'>"+co.sfortuna+"</td>";
    html+="<td class='num'>"+SRVPct(co.sfortuna,co.prestazioni)+"</td>";
    html+="<td class='num good'>"+(co.fortuna-co.sfortuna)+"</td>";
    html+="<td class='num'>"+co.vittChir+"</td>";
    html+="<td class='num'>"+co.parMir+"</td>";
    html+="<td class='num'>"+co.sconBeffa+"</td>";
    html+="<td class='num'>"+co.parStretto+"</td>";
    html+="<td class='num'>"+co.fc+"</td>";
    html+="<td class='num'>"+SRVPct(co.fc,co.partite)+"</td>";
    html+="<td class='num'>"+co.fcPuntiCasa+"</td>";
    html+="<td class='num'>"+co.fcPuntiFuori+"</td>";
    html+="<td class='num'>"+co.soglie+"</td>";
    html+="<td class='num'>"+SRVPct(co.soglie,co.prestazioni)+"</td>";
    html+="</tr>";
  }

  if(ac.length==0)html+="<tr><td colspan='17'>Nessun dato.</td></tr>";
  html+="</table>";

  var as=SRVArray(stats);

  if(squadraFiltro!=""){
    var solo=[];
    for(var sx=0;sx<as.length;sx++){
      if(as[sx].nome==squadraFiltro)solo.push(as[sx]);
    }
    as=solo;
  }

  as.sort(function(a,b){
    var saldoB=(b.fortuna||0)-(b.sfortuna||0);
    var saldoA=(a.fortuna||0)-(a.sfortuna||0);
    if(saldoB!=saldoA)return saldoB-saldoA;
    if((b.fcSaldo||0)!=(a.fcSaldo||0))return(b.fcSaldo||0)-(a.fcSaldo||0);
    if((b.soglie||0)!=(a.soglie||0))return(b.soglie||0)-(a.soglie||0);
    return String(a.nome).localeCompare(String(b.nome));
  });

  html+="<h3>Impatto per squadra</h3>";
  html+="<table class='tb'>";
  html+="<tr>";
  html+="<th>Squadra</th>";
  html+="<th>Giocate</th>";
  html+="<th>Botte di culo</th>";
  html+="<th>% fortuna</th>";
  html+="<th>Fantozzi</th>";
  html+="<th>% sfortuna</th>";
  html+="<th>Saldo F/S</th>";
  html+="<th>Vitt. chir.</th>";
  html+="<th>Par. mir.</th>";
  html+="<th>Sconf. beffa</th>";
  html+="<th>Par. stretti</th>";
  html+="<th>FC pro casa</th>";
  html+="<th>Punti casa FC</th>";
  html+="<th>FC contro fuori</th>";
  html+="<th>Punti persi fuori</th>";
  html+="<th>Saldo FC</th>";
  html+="<th>Soglie</th>";
  html+="<th>% soglie</th>";
  html+="<th>V/N/P soglia</th>";
  html+="</tr>";

  for(var s=0;s<as.length;s++){
    var sq=as[s];
    var saldoFS=(sq.fortuna||0)-(sq.sfortuna||0);

    html+="<tr>";
    html+="<td><b>"+SRVH(sq.nome)+"</b></td>";
    html+="<td class='num'>"+sq.giocate+"</td>";
    html+="<td class='num'>"+sq.fortuna+"</td>";
    html+="<td class='num'>"+SRVPct(sq.fortuna,sq.giocate)+"</td>";
    html+="<td class='num'>"+sq.sfortuna+"</td>";
    html+="<td class='num'>"+SRVPct(sq.sfortuna,sq.giocate)+"</td>";
    html+="<td class='num good'>"+saldoFS+"</td>";
    html+="<td class='num'>"+sq.vittChir+"</td>";
    html+="<td class='num'>"+sq.parMir+"</td>";
    html+="<td class='num'>"+sq.sconBeffa+"</td>";
    html+="<td class='num'>"+sq.parStretto+"</td>";
    html+="<td class='num'>"+sq.fcProCasa+"</td>";
    html+="<td class='num'>"+sq.fcGuadagnatiCasa+"</td>";
    html+="<td class='num'>"+sq.fcControTrasferta+"</td>";
    html+="<td class='num'>"+sq.fcPersiTrasferta+"</td>";
    html+="<td class='num good'>"+sq.fcSaldo+"</td>";
    html+="<td class='num'>"+sq.soglie+"</td>";
    html+="<td class='num'>"+SRVPct(sq.soglie,sq.giocate)+"</td>";
    html+="<td class='cen'>"+sq.soglieV+" / "+sq.soglieN+" / "+sq.soglieP+"</td>";
    html+="</tr>";
  }

  if(as.length==0)html+="<tr><td colspan='19'>Nessun dato.</td></tr>";
  html+="</table>";

  html+="<div class='srv-note'>";
  html+="<b>Come leggere il riepilogo</b><br>";
  html+="<b>Botte di culo:</b> vittorie chirurgiche + pareggi miracolati.<br>";
  html+="<b>Fantozzi:</b> sconfitte beffa + pareggi stretti.<br>";
  html+="<b>Saldo F/S:</b> fortuna meno sfortuna.<br>";
  html+="<b>FC decisivo:</b> partite in cui il +1 casa cambia il risultato rispetto ai campi invertiti.<br>";
  html+="<b>Soglie:</b> prestazioni chiuse esattamente su una soglia gol.";
  html+="</div>";

  document.getElementById(targetId).innerHTML=html;
}
function SRVRenderDettaglio(targetId,vista,recordFiltro,squadraFiltro,topN){var rows=vista.rows,out=[],html="<div class='srv-note'><b>Dettaglio gare</b><br>Se scegli <b>Tutti i record</b>, il numero selezionato vale per ogni tipo di record. In caso di pari merito sull'ultima posizione, vengono mostrati tutti i pari.</div>";if(recordFiltro=="tutti"){for(var g=0;g<SRV_RECORD_ORDER.length;g++){var key=SRV_RECORD_ORDER[g],gr=[];for(var i=0;i<rows.length;i++){var r=rows[i];if(r.key!=key)continue;if(squadraFiltro!=""&&r.coinvolti.indexOf("|"+squadraFiltro+"|")<0)continue;gr.push(r);}gr=SRVTopConPariMerito(gr,topN,function(x){return x.metric;});for(var j=0;j<gr.length;j++)out.push(gr[j]);}}else{for(var k=0;k<rows.length;k++){var x=rows[k];if(x.key!=recordFiltro)continue;if(squadraFiltro!=""&&x.coinvolti.indexOf("|"+squadraFiltro+"|")<0)continue;out.push(x);}out=SRVTopConPariMerito(out,topN,function(z){return z.metric;});}html+="<table class='tb'><tr><th>Tipo</th><th>Stag.</th><th>Data</th><th>Competizione</th><th>Giorn.</th><th>Squadra</th><th>Avversario</th><th>Punti/Reale</th><th>Ris.</th><th>A campi invertiti</th><th>Effetto</th><th>Nota</th></tr>";for(var n=0;n<out.length;n++){var e=out[n];html+="<tr><td>"+SRVH(e.tipo)+"</td><td class='cen'>"+e.m.Stagione+"</td><td>"+SRVH(e.m.Data)+"</td><td>"+SRVH(SRVNomeCompetizione(e.m.Competizione))+"</td><td class='cen'>"+SRVLinkGiornata(e.m)+"</td><td><b>"+SRVH(e.squadra)+"</b></td><td>"+SRVH(e.avversario)+"</td><td class='cen'>"+e.puntiHtml+"</td><td class='cen'>"+e.risHtml+"</td><td class='cen'>"+(e.invHtml||"")+"</td><td class='cen'>"+SRVH(e.effetto||"")+"</td><td>"+SRVH(e.nota||"")+"</td></tr>";}if(out.length==0)html+="<tr><td colspan='12'>Nessun record trovato.</td></tr>";html+="</table>";document.getElementById(targetId).innerHTML=html;}
function SRVRenderClassifica(targetId,vista,metricaKey,filtroAttuali,topN){if(metricaKey=="tutti"){document.getElementById(targetId).innerHTML="<div class='srv-note'><b>Tutte le classifiche aggregate</b><br>Il numero selezionato vale per ogni singola classifica. In caso di pari merito sull'ultima posizione, vengono mostrate tutte le squadre pari.</div>";for(var i=0;i<SRV_METRICHE_ORDINE.length;i++)SRVRenderClassificaAppend(targetId,vista,SRV_METRICHE_ORDINE[i],filtroAttuali,topN);return;}document.getElementById(targetId).innerHTML="";SRVRenderClassificaAppend(targetId,vista,metricaKey,filtroAttuali,topN);}
function SRVRenderClassificaAppend(targetId,vista,metricaKey,filtroAttuali,topN){var met=SRV_METRICHE[metricaKey];if(!met)return;var arr=SRVArray(vista.stats),att=SRVGetSquadreAttualiMap();if(filtroAttuali=="attuali"){var solo=[];for(var i=0;i<arr.length;i++){if(att[arr[i].nome])solo.push(arr[i]);}arr=solo;}arr.sort(function(a,b){var va=met.val(a),vb=met.val(b);if(vb!=va)return vb-va;return String(a.nome).localeCompare(String(b.nome));});var f=[];for(var j=0;j<arr.length;j++){if(met.val(arr[j])!=0)f.push(arr[j]);}f=SRVTopConPariMerito(f,topN,function(x){return met.val(x);});var html="<div class='srv-note'><b>"+SRVH(met.label)+"</b><br>"+SRVH(met.descrizione)+"<br>In caso di pari merito sull'ultima posizione, vengono mostrate tutte le squadre pari.</div><table class='tb'><tr><th>Pos.</th><th>Squadra</th><th>Giocate</th><th>"+SRVH(met.col)+"</th><th>Indice %</th><th>Fortuna</th><th>Sfortuna</th><th>Saldo F/S</th><th>Soglie</th><th>% soglie</th><th>Saldo FC</th></tr>";for(var r=0;r<f.length;r++){var x=f[r];html+="<tr><td class='cen'>"+(r+1)+"</td><td><b>"+SRVH(x.nome)+"</b></td><td class='num'>"+x.giocate+"</td><td class='num good'>"+SRVF(met.val(x))+"</td><td class='num'>"+SRVF(met.pct(x))+"%</td><td class='num'>"+x.fortuna+" ("+SRVPct(x.fortuna,x.giocate)+")</td><td class='num'>"+x.sfortuna+" ("+SRVPct(x.sfortuna,x.giocate)+")</td><td class='num'>"+((x.fortuna||0)-(x.sfortuna||0))+"</td><td class='num'>"+x.soglie+"</td><td class='num'>"+SRVPct(x.soglie,x.giocate)+"</td><td class='num'>"+x.fcSaldo+"</td></tr>";}if(f.length==0)html+="<tr><td colspan='11'>Nessun dato.</td></tr>";html+="</table>";document.getElementById(targetId).innerHTML+=html;}