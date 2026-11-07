/* PROCLEAN Business – machetă demo.
   TOATE valorile de mai jos sunt EXEMPLE (tarife, praguri, productivitate, TVA).
   Pe site-ul real se înlocuiesc cu cifrele firmei. Prețurile sunt în lei, fără TVA. */
window.PROCLEAN_DATA = {
  /* Cota TVA folosită la afișare (exemplu – verificați cota în vigoare). */
  TVA: 0.21,

  /* ---------- CONTRACT LUNAR ---------- */

  /* Tip spațiu: tarif de bază pe m² / vizită (lei, EXEMPLU) și productivitate (m² curățați / oră / om). */
  TIPURI_SPATIU: [
    { id: "birouri",   nume: "Birouri",   nota: "open-space, săli",     tarifVizitaM2: 0.20, productivitate: 180 },
    { id: "comercial", nume: "Comercial", nota: "magazine, showroom",   tarifVizitaM2: 0.25, productivitate: 160 },
    { id: "depozit",   nume: "Depozit",   nota: "hale, logistică",      tarifVizitaM2: 0.09, productivitate: 400 }
  ],

  /* Frecvență: vizite pe lună și factor de efort (la vizite rare se adună mai multă murdărie pe vizită). EXEMPLU. */
  FRECVENTE: [
    { id: "zilnic", nume: "Zilnic",          nota: "L–V",            viziteLuna: 22,   factorEfort: 1.00 },
    { id: "3x",     nume: "3× / săptămână",  nota: "ex. L, Mi, V",   viziteLuna: 13,   factorEfort: 1.10 },
    { id: "saptamanal", nume: "Săptămânal",  nota: "o vizită / săpt.", viziteLuna: 4.33, factorEfort: 1.30 }
  ],

  /* Prag minim lunar pentru serviciul de curățenie (fără extra), lei fără TVA. EXEMPLU. */
  MINIM_LUNAR: 900,

  /* Reducere de volum pe suprafață (se aplică pe curățenia de bază). EXEMPLU. */
  REDUCERI_VOLUM: [
    { pesteM2: 3000, procent: 0.12 },
    { pesteM2: 1000, procent: 0.06 }
  ],

  /* Suprafață – limitele configuratorului. */
  SUPRAFATA: { min: 30, max: 10000, implicit: 400 },

  /* Opțiuni extra – cost lunar = suprafață × lei/m² pe tip spațiu (EXEMPLU).
     Pentru intervențiile trimestriale valoarea este deja împărțită la 3 luni. */
  EXTRA: [
    { id: "geamuri",   nume: "Geamuri – lunar",               nota: "interior + exterior accesibil", lunarM2: { birouri: 0.55, comercial: 0.80, depozit: 0.15 } },
    { id: "mocheta",   nume: "Mochetă / tapițerie – trimestrial", nota: "spălare cu extracție",        lunarM2: { birouri: 0.90, comercial: 0.45, depozit: 0.05 } },
    { id: "consumabile", nume: "Consumabile incluse",          nota: "hârtie, săpun, saci",           lunarM2: { birouri: 0.35, comercial: 0.30, depozit: 0.10 } },
    { id: "dezinfectie", nume: "Dezinfecție – lunar",          nota: "suprafețe de contact, grupuri sanitare", lunarM2: { birouri: 0.30, comercial: 0.30, depozit: 0.12 } }
  ],

  /* Echipă: câte ore stă echipa într-o vizită (fereastra de lucru după program). EXEMPLU. */
  ORE_MAX_VIZITA: 3,

  /* ---------- POST-CONSTRUCȚIE ---------- */

  POST: {
    /* Tarif pe m² și productivitate (m² / oră / om) pe nivel de murdărie. EXEMPLU. */
    NIVELURI: [
      { id: "usor",      nume: "Ușor",                       nota: "praf, urme de vopsea",          tarifM2: 6,  productivitate: 25 },
      { id: "mediu",     nume: "Mediu",                      nota: "praf fin, var, silicon",        tarifM2: 8,  productivitate: 18 },
      { id: "renovare",  nume: "După renovare completă",     nota: "moloz fin, adeziv, etichete",   tarifM2: 11, productivitate: 12 }
    ],
    /* Geamuri: tarif pe fereastră standard (ambele fețe, ramă, pervaz) sau pe m² de geam. EXEMPLU. */
    GEAM_PER_FEREASTRA: 45,
    GEAM_PER_M2: 12,
    ORE_PER_FEREASTRA: 0.6,
    ORE_PER_M2_GEAM: 0.25,
    /* Termen urgent 24–48 h: adaos. */
    ADAOS_URGENT: 0.25,
    /* Comandă minimă post-construcție, lei fără TVA. EXEMPLU. */
    MINIM: 600,
    /* Echipe: ore de lucru pe zi și mărimea echipei (normal / urgent). */
    ORE_ZI: 8,
    ECHIPA_NORMAL: 2,
    ECHIPA_URGENT: 4
  },

  /* ---------- DATE FIRMĂ (placeholder) ---------- */
  FIRMA: {
    nume: "[Denumire firmă] SRL",
    telefonAfisat: "07xx xxx xxx",
    telefonLink: "+40700000000",
    email: "contact@exemplu.ro"
  }
};
