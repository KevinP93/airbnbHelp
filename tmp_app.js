// Helpers
function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }
function getParam(name) { return new URLSearchParams(window.location.search).get(name); }

function wifiQrUrl({ ssid, password, type = 'WPA', hidden = false }) {
  const esc = (s) => String(s ?? '').replace(/([\\;,:\"])/g, '\\$1');
  const payload = `WIFI:T:${esc(type)};S:${esc(ssid)};P:${esc(password)};H:${hidden ? 'true' : 'false'};;`;
  const data = encodeURIComponent(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${data}`;
}

function linkToMaps(q) {
  const query = encodeURIComponent(q);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function fmtDist(d) { return d ? `${d} m` : ''; }
function sortByRatingDesc(a, b) { return (b.rating || 0) - (a.rating || 0); }

async function loadProperty() {
  const code = getParam('code') || 'demo';
  const url = `data/${encodeURIComponent(code)}.json`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Impossible de charger ${url}`);
  return await res.json();
}

function setText(id, value, fallback = '-') { const el = qs(id); if (el) el.textContent = value || fallback; }

// Simple i18n
const i18n = {
  fr: {
    where: 'Où', when: 'Quand', who: 'Qui', infos: 'Infos', around: 'Autour',
    wifi: 'Wi‑Fi', ssid: 'Nom (SSID):', password: 'Mot de passe:', copy: 'Copier le mot de passe', copied: 'Copié !', showqr: 'Afficher QR', hideqr: 'Masquer QR', scanwifi: 'Scannez pour vous connecter au Wi‑Fi.',
    arrival: 'Arrivée & Départ', checkin: 'Check‑in:', checkout: 'Check‑out:', house: 'Maison • Où trouver quoi ?', rules: 'Règles et consignes', transport: 'Transports', emergency: 'Contacts d’urgence', reco: 'Recommandations locales', restaurants: 'Restaurants', activities: 'Activités', updated: 'Mis à jour:', itinerary: 'Itinéraire', viewmap: 'Voir sur la carte'
  },
  en: {
    where: 'Where', when: 'When', who: 'Who', infos: 'Info', around: 'Nearby',
    wifi: 'Wi‑Fi', ssid: 'Name (SSID):', password: 'Password:', copy: 'Copy password', copied: 'Copied!', showqr: 'Show QR', hideqr: 'Hide QR', scanwifi: 'Scan to join Wi‑Fi.',
    arrival: 'Arrival & Departure', checkin: 'Check‑in:', checkout: 'Check‑out:', house: 'Home • Where is what?', rules: 'House rules', transport: 'Transport', emergency: 'Emergency contacts', reco: 'Local recommendations', restaurants: 'Restaurants', activities: 'Activities', updated: 'Updated:', itinerary: 'Itinerary', viewmap: 'View on map'
  }
};

function getLang() { return localStorage.getItem('lang') || 'fr'; }
function setLang(lang) { localStorage.setItem('lang', lang); }
function applyLangToUI() {
  const L = i18n[getLang()] || i18n.fr;
  // Topbar segments
  setText('#seg-where', L.where);
  setText('#seg-when', L.when);
  setText('#seg-who', L.who);
  setText('#seg-infos', L.infos);
  setText('#seg-around', L.around);
  const flagFR = '\uD83C\uDDEB\uD83C\uDDF7'; const flagEN = '\uD83C\uDDEC\uD83C\uDDE7'; const btnIndex = qs('#lang-btn-index'); if (btnIndex) btnIndex.textContent = (getLang() === 'fr' ? flagFR : flagEN); const btnTop = qs('#lang-btn'); if (btnTop) btnTop.textContent = (getLang() === 'fr' ? flagFR : flagEN); applyLangToUI(); location.reload();
    }));
    document.addEventListener('click', (e) => { if (!menu.contains(e.target) && e.target !== btn) { menu.setAttribute('hidden', ''); btn.setAttribute('aria-expanded', 'false'); } });
  }
  wire('#lang-btn', '#lang-menu');
  wire('#lang-btn-index', '#lang-menu-index');
  applyLangToUI();
}

(async function main() {
  try { initLangMenus(); const prop = await loadProperty(); renderProperty(prop); initDrawer(); }
  catch (e) {
    console.error(e);
    alert('Impossible de charger le logement. Verifiez le code.');
    window.location.href = 'index.html';
  }
})();

