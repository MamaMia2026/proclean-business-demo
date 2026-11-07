# PROCLEAN Business – machetă demo

Site static (fără framework) pentru o firmă de curățenie comercială, construit din modelul `proclean-business` al CristianWeb.

- `site/` – se publică pe Netlify (`netlify.toml`: `publish = "site"`).
- `site/js/data.js` – **toate** tarifele, pragurile, productivitatea și cota TVA (EXEMPLE, se înlocuiesc).
- `site/js/calc.js` – calculele (abonament lunar, post-construcție), funcții pure.
- `site/js/app.js` – interfața; prima linie: `WHATSAPP_NUMBER`.
- Formular: Netlify Forms (`cerere-oferta`, honeypot `bot-field`).
- `noindex,nofollow` + `robots.txt` cu `Disallow: /` – machetă, nu se indexează.
