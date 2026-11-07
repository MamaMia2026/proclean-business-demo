const WHATSAPP_NUMBER = "40700000000"; // EXEMPLU – numărul firmei, format internațional fără „+”
/* PROCLEAN Business – machetă demo. Interfața: configurator contract, calculator post-construcție, formular.
   Tarifele și pragurile sunt în data.js (EXEMPLE); calculele în calc.js. */
(() => {
  "use strict";
  const D = window.PROCLEAN_DATA, C = window.PROCLEAN_CALC;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const lei = (n, dec) => Number(n).toLocaleString("ro-RO", { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 }) + " lei";
  const leiAuto = n => lei(n, Math.round(n) !== n);
  const num = n => Number(n).toLocaleString("ro-RO");
  const pct = p => Math.round(p * 100) + "%";
  function ore(h) {
    const min = Math.max(15, Math.round(h * 60 / 15) * 15);
    const hh = Math.floor(min / 60), mm = min % 60;
    return hh ? `${hh} h${mm ? " " + mm + " min" : ""}` : `${mm} min`;
  }
  const oreOm = h => (Math.round(h * 10) / 10).toLocaleString("ro-RO") + " ore-om";
  const oameni = n => n === 1 ? "1 persoană" : `${n} persoane`;

  /* ---------- butoane de opțiune (aria-pressed) ---------- */
  function optGroup(el, items, current, onPick) {
    if (items) el.innerHTML = items.map(i => `<button type="button" data-v="${i.id}" aria-pressed="${i.id === current}">${esc(i.nume)}<small>${esc(i.nota)}</small></button>`).join("");
    el.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      $$("button", el).forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      onPick(b.dataset.v);
    });
  }

  /* ---------- CONFIGURATOR CONTRACT ---------- */
  const st = { tip: D.TIPURI_SPATIU[0].id, frecventa: D.FRECVENTE[0].id, suprafata: D.SUPRAFATA.implicit, extra: [] };
  let lastC, lastP, ales = null;

  optGroup($("#opt-tip"), D.TIPURI_SPATIU, st.tip, v => { st.tip = v; renderC(); });
  optGroup($("#opt-frecventa"), D.FRECVENTE, st.frecventa, v => { st.frecventa = v; renderC(); });

  const range = $("#m2-range"), m2n = $("#m2-num");
  range.min = m2n.min = D.SUPRAFATA.min; range.max = m2n.max = D.SUPRAFATA.max; range.value = m2n.value = st.suprafata;
  range.addEventListener("input", () => { st.suprafata = +range.value; m2n.value = range.value; renderC(); });
  m2n.addEventListener("input", () => {
    const v = Math.round(+m2n.value);
    if (!v || v < D.SUPRAFATA.min) return;
    st.suprafata = Math.min(v, D.SUPRAFATA.max); range.value = st.suprafata; renderC();
  });
  m2n.addEventListener("change", () => {
    const v = Math.min(D.SUPRAFATA.max, Math.max(D.SUPRAFATA.min, Math.round(+m2n.value) || D.SUPRAFATA.min));
    m2n.value = range.value = st.suprafata = v; renderC();
  });
  $("#m2-hint").textContent = `Reducere de volum: ${D.REDUCERI_VOLUM.slice().reverse().map(t => `−${pct(t.procent)} peste ${num(t.pesteM2)} m²`).join(", ")}. Prag minim lunar ${lei(D.MINIM_LUNAR)} fără TVA.`;

  $("#extras").innerHTML = D.EXTRA.map(x => `<label class="xc"><input type="checkbox" value="${x.id}"><span><b>${esc(x.nume)}</b><small>${esc(x.nota)}</small></span></label>`).join("");
  $("#extras").addEventListener("change", () => {
    $$("#extras input").forEach(i => i.closest(".xc").classList.toggle("on", i.checked));
    st.extra = $$("#extras input:checked").map(i => i.value); renderC();
  });

  $("#c-tva-l").textContent = `TVA ${pct(D.TVA)}`;
  $("#p-tva-l").textContent = `TVA ${pct(D.TVA)}`;

  function renderC() {
    const r = lastC = C.contract(st);
    $("#c-fara").textContent = num(r.faraTva);
    $("#c-tva").textContent = lei(r.tva, true);
    $("#c-total").textContent = lei(r.cuTva, true);
    const rows = [[`Curățenie ${r.tip.nume.toLowerCase()}, ${num(r.suprafata)} m²`, lei(r.brut)]];
    if (r.reducere) rows.push([`Reducere de volum −${pct(r.reducereProcent)}`, "−" + lei(r.reducere)]);
    r.extra.forEach(x => rows.push([x.nume, "+" + lei(x.valoare)]));
    let html = rows.map(([a, b]) => `<li><span>${esc(a)}</span><b>${esc(b)}</b></li>`).join("");
    if (r.minimAplicat) html += `<li class="note">Se aplică abonamentul minim de ${lei(D.MINIM_LUNAR)} / lună pentru curățenie.</li>`;
    $("#c-detalii").innerHTML = html;
    $("#c-ore").textContent = oreOm(r.oreOm);
    $("#c-echipa").textContent = `${oameni(r.oameni)} · ~${ore(r.durataVizita)} / vizită`;
    $("#c-vizite").textContent = num(r.frecventa.viziteLuna);
    if (ales === "contract") attach();
  }

  /* ---------- POST-CONSTRUCȚIE ---------- */
  const ps = { suprafata: 120, nivel: D.POST.NIVELURI[0].id, geamMod: "ferestre", geamValoare: 8, urgent: false };
  optGroup($("#opt-nivel"), D.POST.NIVELURI, ps.nivel, v => { ps.nivel = v; renderP(); });
  optGroup($("#opt-geam"), null, null, v => {
    ps.geamMod = v;
    $("#p-geam-l").textContent = v === "m2" ? "Suprafață geam" : "Ferestre";
    $("#p-geam-u").textContent = v === "m2" ? "m²" : "buc.";
    renderP();
  });
  optGroup($("#opt-termen"), null, null, v => { ps.urgent = v === "urgent"; renderP(); });
  $("#opt-termen [data-v=urgent] small").textContent = `+${pct(D.POST.ADAOS_URGENT)}`;
  $("#p-m2").addEventListener("input", e => { ps.suprafata = Math.max(0, Math.round(+e.target.value) || 0); renderP(); });
  $("#p-geam").addEventListener("input", e => { ps.geamValoare = Math.max(0, +e.target.value || 0); renderP(); });

  function renderP() {
    const r = lastP = C.post(ps);
    $("#p-fara").textContent = num(r.faraTva);
    $("#p-tva").textContent = lei(r.tva, true);
    $("#p-total").textContent = lei(r.cuTva, true);
    const rows = [[`${r.nivel.nume}, ${num(r.suprafata)} m² × ${r.nivel.tarifM2} lei`, lei(r.curatenie)]];
    if (r.geamValoare) rows.push([r.geamMod === "m2" ? `Geamuri, ${num(r.geamValoare)} m²` : `Geamuri, ${num(r.geamValoare)} ferestre`, lei(r.geamuri)]);
    if (r.urgent) rows.push([`Termen urgent 24–48 h +${pct(D.POST.ADAOS_URGENT)}`, "+" + lei(r.adaos)]);
    let html = rows.map(([a, b]) => `<li><span>${esc(a)}</span><b>${esc(b)}</b></li>`).join("");
    if (r.minimAplicat) html += `<li class="note">Se aplică comanda minimă de ${lei(D.POST.MINIM)}.</li>`;
    $("#p-detalii").innerHTML = html;
    $("#p-durata").textContent = `${r.zile === 1 ? "1 zi" : r.zile + " zile"} · ${oreOm(r.oreOm)}`;
    $("#p-echipa").textContent = `${oameni(r.oameni)} · ~${ore(r.oreEchipa)} lucru efectiv`;
    if (ales === "post") attach();
  }

  /* ---------- atașarea estimării la formular ---------- */
  function rezumat() {
    if (ales === "contract") {
      const r = lastC;
      const ex = r.extra.length ? r.extra.map(x => x.nume).join(", ") : "fără extra";
      return {
        calc: "Contract lunar",
        text: `${r.tip.nume}, ${num(r.suprafata)} m², ${r.frecventa.nume} (${r.frecventa.nota}); ${ex}.` +
          (r.reducere ? ` Reducere de volum −${pct(r.reducereProcent)}.` : "") + (r.minimAplicat ? " Abonament minim aplicat." : "") +
          `\nAbonament estimat: ${lei(r.faraTva)} / lună fără TVA + TVA ${lei(r.tva, true)} = ${lei(r.cuTva, true)}.` +
          `\nEchipă: ${oameni(r.oameni)}, ${oreOm(r.oreOm)} / vizită.`,
        fara: r.faraTva, tva: r.tva, total: r.cuTva, echipa: `${oameni(r.oameni)}, ${oreOm(r.oreOm)} / vizită`
      };
    }
    const r = lastP;
    return {
      calc: "Post-construcție",
      text: `${num(r.suprafata)} m², ${r.nivel.nume.toLowerCase()}; geamuri: ${r.geamValoare ? num(r.geamValoare) + (r.geamMod === "m2" ? " m²" : " ferestre") : "fără"}; termen ${r.urgent ? "urgent 24–48 h" : "normal"}.` +
        `\nPreț estimat: ${lei(r.faraTva)} fără TVA + TVA ${lei(r.tva, true)} = ${lei(r.cuTva, true)}.` +
        `\nDurată: ${r.zile === 1 ? "1 zi" : r.zile + " zile"}, ${oameni(r.oameni)}.`,
      fara: r.faraTva, tva: r.tva, total: r.cuTva, echipa: `${oameni(r.oameni)}, ${r.zile === 1 ? "1 zi" : r.zile + " zile"}`
    };
  }
  function attach() {
    if (!ales) return;
    const z = rezumat();
    $("#h-calculator").value = z.calc;
    $("#h-rezumat").value = z.text.replace(/\n/g, " ");
    $("#h-fara").value = z.fara;
    $("#h-tva").value = z.tva;
    $("#h-total").value = z.total;
    $("#h-echipa").value = z.echipa;
    $("#attached-text").textContent = `${z.calc}\n${z.text}`;
    $("#attached").hidden = false;
  }
  function goForm() {
    attach();
    $("#cerere").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    setTimeout(() => $("#f-firma").focus({ preventScroll: true }), reduced ? 0 : 500);
  }
  const FREC_FORM = { zilnic: "Zilnic (L–V)", "3x": "3× / săptămână", saptamanal: "Săptămânal" };
  $("#c-go").addEventListener("click", () => {
    ales = "contract";
    $("#f-tip").value = lastC.tip.nume;
    $("#f-m2").value = lastC.suprafata;
    $("#f-frecventa").value = FREC_FORM[lastC.frecventa.id];
    goForm();
  });
  $("#p-go").addEventListener("click", () => {
    ales = "post";
    $("#f-tip").value = "Post-construcție";
    $("#f-m2").value = lastP.suprafata;
    $("#f-frecventa").value = "Intervenție unică";
    goForm();
  });

  /* ---------- FORMULAR ---------- */
  const form = $("#form"), err = $("#f-err"), acord = $("#f-acord");
  const req = { firma: $("#f-firma"), contact: $("#f-contact"), telefon: $("#f-tel"), email: $("#f-email"), adresa: $("#f-adresa"), m2: $("#f-m2") };
  const NUME = { firma: "firma", contact: "persoana de contact", telefon: "telefonul", email: "emailul", adresa: "adresa", m2: "suprafața" };
  const okTel = v => v.replace(/[^\d]/g, "").length >= 9;
  const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  Object.values(req).forEach(i => i.addEventListener("input", () => i.removeAttribute("aria-invalid")));
  acord.addEventListener("change", () => { acord.closest(".consent").classList.toggle("bad", !acord.checked && !!err.textContent); if (acord.checked) err.textContent = ""; });

  function validate(waOnly) {
    const lipsa = [];
    let first = null;
    const mark = (k, ok) => {
      if (ok) { req[k].removeAttribute("aria-invalid"); return; }
      req[k].setAttribute("aria-invalid", "true"); lipsa.push(NUME[k]); first = first || req[k];
    };
    const keys = waOnly ? ["firma", "contact", "telefon"] : Object.keys(req);
    keys.forEach(k => {
      const v = req[k].value.trim();
      mark(k, k === "telefon" ? okTel(v) : k === "email" ? okEmail(v) : k === "m2" ? +v > 0 : !!v);
    });
    const faraAcord = !acord.checked;
    acord.closest(".consent").classList.toggle("bad", faraAcord);
    if (!lipsa.length && !faraAcord) { err.textContent = ""; return true; }
    const parts = [];
    if (lipsa.length) parts.push("completează corect: " + lipsa.join(", "));
    if (faraAcord) parts.push("bifează acordul pentru prelucrarea datelor");
    err.textContent = "Cererea nu a fost trimisă – " + parts.join("; ") + ".";
    (first || acord).focus();
    return false;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validate(false)) return;
    attach();
    const btn = $("#f-submit"); btn.disabled = true; btn.textContent = "Se trimite…";
    const data = new FormData(form);
    try {
      if (!data.get("bot-field")) {
        const r = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(data).toString() });
        if (!r.ok) throw new Error("HTTP " + r.status);
      }
      $("#thanks-text").textContent = `${data.get("firma")} · ${data.get("tip_spatiu")}, ${num(data.get("suprafata_m2"))} m² · te sunăm la ${data.get("telefon")}.`;
      form.hidden = true;
      const th = $("#thanks"); th.hidden = false; th.focus({ preventScroll: true });
      th.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    } catch (ex) {
      err.textContent = `Nu am putut trimite cererea acum. Încearcă din nou, trimite pe WhatsApp sau sună la ${D.FIRMA.telefonAfisat}.`;
    } finally { btn.disabled = false; btn.textContent = "Trimite cererea"; }
  });

  $("#f-wa").addEventListener("click", () => {
    if (!validate(true)) return;
    attach();
    const v = id => $(id).value.trim();
    const lines = ["Bună ziua! Aș dori o ofertă de curățenie de la PROCLEAN Business:",
      `• Firmă: ${v("#f-firma")}${v("#f-cui") ? " (CUI " + v("#f-cui") + ")" : ""}`,
      `• Persoană de contact: ${v("#f-contact")}`, `• Telefon: ${v("#f-tel")}`];
    if (v("#f-email")) lines.push(`• Email: ${v("#f-email")}`);
    if (v("#f-adresa")) lines.push(`• Adresă: ${v("#f-adresa")}`);
    lines.push(`• Spațiu: ${v("#f-tip")}${v("#f-m2") ? ", " + v("#f-m2") + " m²" : ""}`, `• Frecvență: ${v("#f-frecventa")}`, `• Ore preferate: ${v("#f-ore")}`);
    if (v("#f-obs")) lines.push(`• Observații: ${v("#f-obs")}`);
    if (ales) lines.push("", "Estimare din site:", rezumat().text);
    lines.push("", "Sunt de acord cu prelucrarea datelor pentru ofertare.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
  });

  /* ---------- video hero: se încarcă după pagină, nu la economisire de date / mișcare redusă ---------- */
  function heroVideo() {
    const v = $(".hero video");
    const conn = navigator.connection;
    if (!v || reduced || (conn && (conn.saveData || /2g/.test(conn.effectiveType || "")))) return;
    const mobile = matchMedia("(max-width:700px)").matches;
    const [webm, mp4] = (mobile ? v.dataset.mobile : v.dataset.desktop).split("|");
    v.innerHTML = `<source src="${webm}" type="video/webm"><source src="${mp4}" type="video/mp4">`;
    v.addEventListener("playing", () => v.classList.add("on"), { once: true });
    v.load();
    const p = v.play(); if (p && p.catch) p.catch(() => {});
  }
  const later = () => setTimeout(() => window.requestIdleCallback ? requestIdleCallback(heroVideo, { timeout: 2000 }) : heroVideo(), 3000);
  if (document.readyState === "complete") later();
  else addEventListener("load", later, { once: true });

  /* bara de sus devine opacă după hero */
  const top = $(".site-top");
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:40px;pointer-events:none";
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => top.classList.toggle("solid", !e.isIntersecting)).observe(sentinel);

  renderC(); renderP();
})();
