// ============================
// Smooth scroll for anchor links
// ============================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================
// LIGHTBOX за галерија
// Очекуваш во HTML:
// <div class="lightbox" id="lightbox">
//   <button class="close" aria-label="Затвори">×</button>
//   <img src="" alt="">
// </div>
// и во галеријата <img ... data-lightbox>
// ============================
(function setupLightbox(){
  const lb = document.querySelector('.lightbox');
  if (!lb) return; // ако нема lightbox во DOM, прекини

  const lbImg = lb.querySelector('img');
  const lbCloseBtn = lb.querySelector('.close');

  // Отворање: клик на било која слика со data-lightbox
  document.querySelectorAll('[data-lightbox]').forEach(img => {
    img.addEventListener('click', () => {
      const full = img.getAttribute('data-full') || img.src;
      lbImg.src = full;
      lb.classList.add('active');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  // Затворање: копче ×
  lbCloseBtn?.addEventListener('click', closeLB);

  // Затворање: клик на позадина
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLB();
  });

  // Затворање: ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLB();
  });

  function closeLB(){
    lb.classList.remove('active');
    lb.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    document.body.style.overflow = '';
  }
})();

// ============================
// Contact form: Mailto fallback (оставено како кај тебе)
// HTML треба да има <form id="contact-form">...</form>
// ============================
document.getElementById('contact-form')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get('name') || '';
  const phone = fd.get('phone') || '';
  const email = fd.get('email') || '';
  const message = fd.get('message') || '';
  const mail = 'info@keramikastil.mk'; // TODO: стави реален e-mail

  const subject = encodeURIComponent('Порака од веб-сајтот — ' + name);
  const body = encodeURIComponent(
    'Име: ' + name +
    '\nТелефон: ' + phone +
    '\nЕ-пошта: ' + email +
    '\n\nПорака:\n' + message
  );

  window.location.href = `mailto:${mail}?subject=${subject}&body=${body}`;
  e.target.reset();
});

// ============================
// Netlify форма „Побарај понуда“ (ако ја имаш како <form name="offer" data-netlify="true">)
// Прикажува success порака без reload ако има #form-ok елемент
// ============================
(function setupNetlifyOffer(){
  const form = document.querySelector('form[name="offer"][data-netlify="true"]');
  const ok = document.getElementById('form-ok'); // опционално

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      });
      form.reset();
      if (ok) ok.style.display = 'block';
    } catch (err) {
      alert('Се појави проблем при испраќање. Обидете се повторно.');
    }
  });
})();

// ============================
// Dynamic content from /content managed by Decap CMS (оставено и подобрено)
// Пази: овие ID мора да постојат во HTML за да има ефект:
//   #hero-title, #hero-subtitle, #cta-primary, #cta-secondary
//   #products-grid, #gallery-grid
//   .contact-card со 3 <p> и <iframe> внатре
// ============================
async function loadJSON(path){
  try{
    const res = await fetch(path, { cache:'no-store' });
    if(!res.ok) throw new Error('HTTP '+res.status);
    return await res.json();
  }catch(e){
    console.warn('Cannot load', path, e);
    return null;
  }
}

(async()=>{
  // Home (hero)
  const home = await loadJSON('content/home.json');
  if(home){
    const ht = document.getElementById('hero-title');
    const hs = document.getElementById('hero-subtitle');
    const c1 = document.getElementById('cta-primary');
    const c2 = document.getElementById('cta-secondary');
    if(ht && home.hero_title) ht.textContent = home.hero_title;
    if(hs && home.hero_subtitle) hs.textContent = home.hero_subtitle;
    if(c1 && home.cta_primary_text) c1.textContent = home.cta_primary_text;
    if(c2 && home.cta_secondary_text) c2.textContent = home.cta_secondary_text;
  }

  // Products grid
  const products = await loadJSON('content/products.json');
  const grid = document.getElementById('products-grid');
  if(products && grid){
    grid.innerHTML = '';
    for(const p of products){
      grid.insertAdjacentHTML('beforeend', `
        <article class="product-card">
          <img src="${p.image}" alt="${p.title}">
          <h3>${p.title}</h3>
          <p>${p.description || ''}</p>
        </article>
      `);
    }
  }

  // Gallery grid
  const gallery = await loadJSON('content/gallery.json');
  const ggrid = document.getElementById('gallery-grid');
  if(gallery && ggrid){
    ggrid.innerHTML = '';
    for(const g of gallery){
      // ако имаш поголема верзија, ставаш data-full, инаку само src
      const full = g.full || g.image;
      ggrid.insertAdjacentHTML('beforeend', `
        <img src="${g.image}" alt="${g.alt || 'Галерија'}" loading="lazy" data-lightbox data-full="${full}"/>
      `);
    }

    // по динамичното вметнување, повторно закачи listeners за lightbox
    // (дополителна заштита ако setupLightbox е повикан пред ова)
    const lb = document.querySelector('.lightbox');
    const lbImg = lb?.querySelector('img');
    if (lb && lbImg){
      ggrid.querySelectorAll('[data-lightbox]').forEach(img => {
        img.addEventListener('click', () => {
          const full = img.getAttribute('data-full') || img.src;
          lbImg.src = full;
          lb.classList.add('active');
          lb.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        });
      });
    }
  }

  // Contact card (ако ја користиш)
  const contact = await loadJSON('content/contact.json');
  if(contact){
    const el = document.querySelector('.contact-card');
    if(el){
      const ps = el.querySelectorAll('p');
      if(ps[0]) ps[0].innerHTML = '<strong>Телефон:</strong> ' + (contact.phone || '');
      if(ps[1]) ps[1].innerHTML = '<strong>Е-пошта:</strong> ' + (contact.email || '');
      if(ps[2]) ps[2].innerHTML = '<strong>Работно време:</strong> ' + (contact.hours || '');
      const iframe = el.querySelector('iframe');
      if(iframe && contact.map_embed) iframe.src = contact.map_embed;
    }
  }
})();
