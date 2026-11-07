/* PROCLEAN Business – calculele configuratorului (funcții pure, fără DOM). Constantele sunt în data.js. */
(function (root) {
  "use strict";
  const D = root.PROCLEAN_DATA;
  const r2 = n => Math.round(n * 100) / 100;
  const byId = (list, id) => list.find(x => x.id === id) || list[0];

  /* Abonament lunar. opt = { tip, frecventa, suprafata, extra: ["geamuri", ...] } */
  function contract(opt) {
    const tip = byId(D.TIPURI_SPATIU, opt.tip);
    const fr = byId(D.FRECVENTE, opt.frecventa);
    const m2 = Math.max(0, Number(opt.suprafata) || 0);
    const extraIds = opt.extra || [];

    const brut = m2 * tip.tarifVizitaM2 * fr.viziteLuna * fr.factorEfort;
    const treapta = D.REDUCERI_VOLUM.find(t => m2 > t.pesteM2) || null;
    const reducere = treapta ? brut * treapta.procent : 0;
    const dupaReducere = brut - reducere;
    const minimAplicat = dupaReducere < D.MINIM_LUNAR;
    const baza = minimAplicat ? D.MINIM_LUNAR : dupaReducere;

    const extra = D.EXTRA.filter(e => extraIds.includes(e.id)).map(e => ({ id: e.id, nume: e.nume, valoare: Math.round(m2 * e.lunarM2[tip.id]) }));
    const totalExtra = extra.reduce((s, e) => s + e.valoare, 0);

    const faraTva = Math.round(baza) + totalExtra;
    const tva = r2(faraTva * D.TVA);
    const cuTva = r2(faraTva + tva);

    const oreOm = (m2 / tip.productivitate) * fr.factorEfort;
    const oameni = Math.max(1, Math.ceil(oreOm / D.ORE_MAX_VIZITA));
    const durata = oreOm / oameni;

    return {
      tip, frecventa: fr, suprafata: m2,
      brut: Math.round(brut), reducere: Math.round(reducere), reducereProcent: treapta ? treapta.procent : 0,
      minimAplicat, baza: Math.round(baza), extra, totalExtra,
      faraTva, tva, cuTva,
      oreOm: r2(oreOm), oameni, durataVizita: r2(durata)
    };
  }

  /* Post-construcție. opt = { suprafata, nivel, geamMod: "ferestre"|"m2", geamValoare, urgent: bool } */
  function post(opt) {
    const P = D.POST;
    const niv = byId(P.NIVELURI, opt.nivel);
    const m2 = Math.max(0, Number(opt.suprafata) || 0);
    const g = Math.max(0, Number(opt.geamValoare) || 0);
    const peFerestre = opt.geamMod !== "m2";

    const curatenie = m2 * niv.tarifM2;
    const geamuri = g * (peFerestre ? P.GEAM_PER_FEREASTRA : P.GEAM_PER_M2);
    const subtotal = curatenie + geamuri;
    const adaos = opt.urgent ? subtotal * P.ADAOS_URGENT : 0;
    const calculat = subtotal + adaos;
    const minimAplicat = calculat < P.MINIM;
    const faraTva = Math.round(minimAplicat ? P.MINIM : calculat);
    const tva = r2(faraTva * D.TVA);
    const cuTva = r2(faraTva + tva);

    const oreOm = m2 / niv.productivitate + g * (peFerestre ? P.ORE_PER_FEREASTRA : P.ORE_PER_M2_GEAM);
    const oameni = opt.urgent ? P.ECHIPA_URGENT : P.ECHIPA_NORMAL;
    const oreEchipa = oreOm / oameni;
    const zile = Math.max(1, Math.ceil(oreEchipa / P.ORE_ZI - 1e-9));

    return {
      nivel: niv, suprafata: m2, geamMod: peFerestre ? "ferestre" : "m2", geamValoare: g, urgent: !!opt.urgent,
      curatenie: Math.round(curatenie), geamuri: Math.round(geamuri), adaos: Math.round(adaos),
      minimAplicat, faraTva, tva, cuTva,
      oreOm: r2(oreOm), oameni, oreEchipa: r2(oreEchipa), zile
    };
  }

  root.PROCLEAN_CALC = { contract, post };
})(typeof window !== "undefined" ? window : globalThis);
