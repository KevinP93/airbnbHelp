// Helpers
function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }
function getParam(name) { return new URLSearchParams(window.location.search).get(name); }

function wifiQrUrl({ ssid, password, type = 'WPA', hidden = false }) {
  const esc = (s) => String(s ?? '').replace(/([\\;,:\"])/g, '\\$1');
  const payload = `WIFI:T:${esc(type)};S:${esc(ssid)};P:${esc(password)};H:${hidden ? 'true' : 'false'};;`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`;
}

function linkToMaps(q) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`; }
function fmtDist(d) { return d ? `${d} m` : ''; }
function sortByRatingDesc(a,b){ return (b.rating||0) - (a.rating||0); }

async function loadProperty(){
  const code = getParam('code') || 'demo';
  const url = `data/${encodeURIComponent(code)}.json`;
  const res = await fetch(url,{cache:'no-store'});
  if(!res.ok) throw new Error(`Impossible de charger ${url}`);
  return await res.json();
}

function setText(id, value, fallback='-'){ const el = qs(id); if(el) el.textContent = value || fallback; }

// i18n dictionaries (ASCII-safe)
const i18n = {
  fr: { where:'Ou', when:'Quand', who:'Qui', infos:'Infos', around:'Autour', wifi:'Wi-Fi', ssid:'Nom (SSID):', password:'Mot de passe:', copy:'Copier le mot de passe', copied:'Copie !', showqr:'Afficher QR', hideqr:'Masquer QR', scanwifi:'Scannez pour vous connecter au Wi-Fi.', arrival:'Arrivee & Depart', checkin:'Check-in:', checkout:'Check-out:', house:'Maison • Ou trouver quoi ?', rules:'Regles et consignes', transport:'Transports', emergency:"Contacts d'urgence", reco:'Recommandations locales', restaurants:'Restaurants', activities:'Activites', updated:'Mis a jour:', itinerary:'Itineraire', viewmap:'Voir sur la carte' },
  en: { where:'Where', when:'When', who:'Who', infos:'Info', around:'Nearby', wifi:'Wi‑Fi', ssid:'Name (SSID):', password:'Password:', copy:'Copy password', copied:'Copied!', showqr:'Show QR', hideqr:'Hide QR', scanwifi:'Scan to join Wi‑Fi.', arrival:'Arrival & Departure', checkin:'Check-in:', checkout:'Check-out:', house:'Home • Where is what?', rules:'House rules', transport:'Transport', emergency:'Emergency contacts', reco:'Local recommendations', restaurants:'Restaurants', activities:'Activities', updated:'Updated:', itinerary:'Itinerary', viewmap:'View on map' }
};
function getLang(){ return localStorage.getItem('lang') || 'fr'; }
function setLang(l){ localStorage.setItem('lang', l); }
function applyLangToUI(){
  const L = i18n[getLang()] || i18n.fr;
  setText('#seg-where', L.where); setText('#seg-when', L.when); setText('#seg-who', L.who); setText('#seg-infos', L.infos); setText('#seg-around', L.around);
  const fr='assets/img/flag-fr.svg', gb='assets/img/flag-gb.svg';
  const i1=qs('#lang-flag-index'); if(i1){ i1.src = (getLang()==='fr'?fr:gb); i1.alt = (getLang()==='fr'?'FR':'GB'); }
  const i2=qs('#lang-flag'); if(i2){ i2.src = (getLang()==='fr'?fr:gb); i2.alt = (getLang()==='fr'?'FR':'GB'); }
}

function renderProperty(p){
  const isEN = getLang()==='en'; const L = i18n[getLang()]||i18n.fr;
  setText('#prop-name', (isEN && p.name_en)||p.name);
  setText('#prop-address', (isEN && p.address_en)||p.address);
  const cityEl=qs('#prop-city'); if(cityEl){ try{ cityEl.textContent = ((isEN && p.address_en)||p.address||'').split(',').slice(-1)[0].trim()||'Logement'; }catch{ cityEl.textContent='Logement'; } }
  setText('#checkin', (isEN&&p.checkin_en)||p.checkin);
  setText('#checkout', (isEN&&p.checkout_en)||p.checkout);
  setText('#arrival-notes', (isEN&&p.arrival_notes_en)||p.arrival_notes||'');
  // labels
  setText('#wifi-title', L.wifi); setText('#label-ssid', L.ssid); setText('#label-password', L.password); setText('#btn-copy-wifi', L.copy); setText('#btn-show-qr', L.showqr); setText('#label-scan-wifi', L.scanwifi); setText('#arrival-title', L.arrival); setText('#label-checkin', L.checkin); setText('#label-checkout', L.checkout); setText('#house-title', L.house); setText('#rules-title', L.rules); setText('#transport-title', L.transport); setText('#emergency-title', L.emergency); setText('#reco-title', L.reco); setText('#tab-food', L.restaurants); setText('#tab-activities', L.activities);

  // Wi-Fi
  setText('#wifi-ssid', p.wifi && p.wifi.ssid);
  setText('#wifi-pass', p.wifi && p.wifi.password ? '********' : '-');
  const btnCopy=qs('#btn-copy-wifi'), btnQR=qs('#btn-show-qr'), qrWrap=qs('#wifi-qr'), qrImg=qs('#wifi-qr-img');
  if(btnCopy) btnCopy.addEventListener('click', async()=>{ if(!p.wifi||!p.wifi.password) return; try{ await navigator.clipboard.writeText(p.wifi.password); btnCopy.textContent=L.copied; setTimeout(()=>btnCopy.textContent=L.copy,1500);}catch{} });
  if(btnQR) btnQR.addEventListener('click', ()=>{ if(!p.wifi||!p.wifi.ssid) return; const src = wifiQrUrl({ ssid:p.wifi.ssid, password:p.wifi.password, type:p.wifi.type||'WPA', hidden:!!p.wifi.hidden }); if(qrImg) qrImg.src=src; if(qrWrap){ qrWrap.hidden=!qrWrap.hidden; } btnQR.textContent = (qrWrap && qrWrap.hidden) ? L.showqr : L.hideqr; });

  // House map
  const house=qs('#house-map'); if(house){ house.innerHTML=''; (p.house_map||[]).forEach(it=>{ const div=document.createElement('div'); div.className='row'; const name=(isEN&&it.name_en)||it.name; const loc=(isEN&&it.location_en)||it.location||''; div.innerHTML = `<strong>${name}</strong><span class="muted">${loc}</span>`; house.appendChild(div); }); }

  // Rules
  const ulRules=qs('#rules-list')||qs('#rules'); if(ulRules){ ulRules.innerHTML=''; const rules=(isEN&&Array.isArray(p.rules_en)?p.rules_en:(p.rules||[])); rules.forEach(r=>{ const li=document.createElement('li'); li.textContent=r; ulRules.appendChild(li); }); }

  // Transports
  const ulT=qs('#transports'); if(ulT){ ulT.innerHTML=''; (p.transports||[]).forEach(t=>{ const tname=(isEN&&t.name_en)||t.name; const ttype=(isEN&&t.type_en)||t.type||''; const taddr=(isEN&&t.address_en)||t.address||tname; const link=linkToMaps(taddr); const li=document.createElement('li'); li.innerHTML = `<strong>${tname}</strong><div class="meta"><span>${ttype}</span><span>${fmtDist(t.distance)}</span></div><a target="_blank" rel="noopener" href="${link}">${L.itinerary}</a>`; ulT.appendChild(li); }); }

  // Emergency
  const ulE=qs('#emergency-list')||qs('#emergency'); if(ulE){ ulE.innerHTML=''; (p.emergency||[]).forEach(c=>{ const label=(isEN&&c.label_en)||c.label; const tel=c.phone?`<a href="tel:${c.phone}">${c.phone}</a>`:''; const li=document.createElement('div'); li.className='row'; li.innerHTML = `<strong>${label}</strong><span class="muted">${tel}</span>`; ulE.appendChild(li); }); }

  // Recommendations
  const food=(p.recommendations&&p.recommendations.food||[]).slice().sort(sortByRatingDesc);
  const acts=(p.recommendations&&p.recommendations.activities||[]).slice().sort(sortByRatingDesc);
  function renderReco(list, el){ if(!el) return; el.innerHTML=''; list.forEach(r=>{ const name=(isEN&&r.name_en)||r.name; const cat=(isEN&&r.category_en)||r.category||''; const addr=(isEN&&r.address_en)||r.address||name; const link=linkToMaps(addr); const div=document.createElement('div'); div.className='reco-item'; div.innerHTML = `<div><strong>${name}</strong></div><div class="meta"><span>Note: ${r.rating??'-'}</span><span>${cat}</span><span>${fmtDist(r.distance)}</span></div><div class="muted">${addr}</div><div><a target="_blank" rel="noopener" href="${link}">${L.viewmap}</a></div>`; el.appendChild(div); }); }
  renderReco(food, qs('#reco-food')); renderReco(acts, qs('#reco-activities'));

  // Tabs
  qsa('.tabs button').forEach(btn=>btn.addEventListener('click',()=>{ qsa('.tabs button').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); const tab=btn.getAttribute('data-tab'); const f=qs('#reco-food'), a=qs('#reco-activities'); if(f) f.hidden = tab!=='food'; if(a) a.hidden = tab!=='activities'; }));

  // Updated at
  const ts = p.updated_at ? new Date(p.updated_at) : new Date(); setText('#updatedAt', `${L.updated} ${ts.toLocaleDateString()} ${ts.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`, '');

  // Gallery (3 images: Bedroom, Entrance, Living)
  const gallery=qs('#gallery'); if(gallery){ const named=p.photos_named||{}; const fb={ bedroom:'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop', entrance:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop', living:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop' }; const photos=[ named.bedroom || (Array.isArray(p.photos)&&p.photos[0]) || fb.bedroom, named.entrance || (Array.isArray(p.photos)&&p.photos[1]) || fb.entrance, named.living || (Array.isArray(p.photos)&&p.photos[2]) || fb.living ]; gallery.innerHTML=''; const altsEN=['Bedroom','Entrance','Living room']; const altsFR=['Chambre','Entree','Salon']; photos.forEach((src,i)=>{ const wrap=document.createElement('div'); wrap.className='item'+(i===0?' hero':''); const img=document.createElement('img'); img.alt = isEN ? altsEN[i] : altsFR[i]; img.loading='lazy'; img.src=src; img.onerror=()=>{ img.onerror=null; img.src='assets/img/photo-logement.svg'; }; wrap.appendChild(img); gallery.appendChild(wrap); }); }
}

// Drawer (hamburger) behavior
function initDrawer(){ const btn=qs('#hamburger'), overlay=qs('#overlay'), drawer=qs('#drawer'), close=qs('#drawer-close'); function open(){ if(overlay&&drawer){ overlay.hidden=false; drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); } if(btn){ btn.classList.add('open'); btn.setAttribute('aria-expanded','true'); } } function hide(){ if(overlay&&drawer){ overlay.hidden=true; drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); } if(btn){ btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); } } if(btn) btn.addEventListener('click', ()=>{ const isOpen=btn.classList.contains('open'); isOpen?hide():open(); }); if(overlay) overlay.addEventListener('click', hide); if(close) close.addEventListener('click', hide); qsa('.drawer-nav .nav-link').forEach(a=>a.addEventListener('click', hide)); document.addEventListener('keydown', e=>{ if(e.key==='Escape') hide(); }); }

// Language menu (topbar)
function initLangMenus(){
  function wire(btnSel, menuSel){
    const btn=qs(btnSel), menu=qs(menuSel);
    if(!btn||!menu) return;
    const open=()=>{ menu.hidden=false; btn.setAttribute('aria-expanded','true'); };
    const close=()=>{ menu.hidden=true; btn.setAttribute('aria-expanded','false'); };
    btn.addEventListener('click', (e)=>{ e.stopPropagation(); (menu.hidden?open:close)(); });
    menu.addEventListener('click', (e)=>{ e.stopPropagation(); });
    // Close when clicking anywhere else (capture to be safe)
    document.addEventListener('click', (e)=>{
      if(menu.hidden) return;
      if(!menu.contains(e.target) && !btn.contains(e.target)) close();
    }, true);
    window.addEventListener('scroll', close, { passive:true });
    window.addEventListener('resize', close);
    // Language selection
    menu.querySelectorAll('button[data-lang]').forEach(b=>b.addEventListener('click', (e)=>{
      const lang=e.currentTarget.getAttribute('data-lang'); setLang(lang); applyLangToUI(); location.reload();
    }));
  }
  wire('#lang-btn', '#lang-menu');
  wire('#lang-btn-index', '#lang-menu-index');
  applyLangToUI();
}

(async function main(){ try{ initLangMenus(); const prop=await loadProperty(); renderProperty(prop); initDrawer(); } catch(e){ console.error(e); alert('Impossible de charger le logement. Verifiez le code.'); window.location.href='index.html'; } })();
