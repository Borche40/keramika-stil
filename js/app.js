
// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if(el){
      e.preventDefault();
      el.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

// Simple lightbox
const lb = document.querySelector('.lightbox');
const lbImg = lb?.querySelector('img');
document.querySelectorAll('[data-lightbox]').forEach(img=>{
  img.addEventListener('click', ()=>{
    lbImg.src = img.src;
    lb.classList.add('active');
  });
});
document.querySelector('.lightbox .close')?.addEventListener('click', ()=> lb.classList.remove('active'));
lb?.addEventListener('click', (e)=>{ if(e.target === lb) lb.classList.remove('active'); });

// Contact form: Mailto fallback
document.getElementById('contact-form')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get('name');
  const phone = fd.get('phone');
  const email = fd.get('email');
  const message = fd.get('message');
  const mail = 'info@keramikastil.mk'; // TODO: change to your real email
  const subject = encodeURIComponent('Порака од веб-сајтот — ' + name);
  const body = encodeURIComponent(
    'Име: ' + name + '\nТелефон: ' + phone + '\nЕ-пошта: ' + email + '\n\nПорака:\n' + message
  );
  window.location.href = `mailto:${mail}?subject=${subject}&body=${body}`;
  e.target.reset();
});


// === Dynamic content from /content managed by Decap CMS ===
async function loadJSON(path){
  try{
    const res = await fetch(path, {cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    return await res.json();
  }catch(e){
    console.warn('Cannot load', path, e);
    return null;
  }
}

(async()=>{
  const home = await loadJSON('content/home.json');
  if(home){
    const ht = document.getElementById('hero-title');
    const hs = document.getElementById('hero-subtitle');
    const c1 = document.getElementById('cta-primary');
    const c2 = document.getElementById('cta-secondary');
    if(ht) ht.textContent = home.hero_title || ht.textContent;
    if(hs) hs.textContent = home.hero_subtitle || hs.textContent;
    if(c1) c1.textContent = home.cta_primary_text || c1.textContent;
    if(c2) c2.textContent = home.cta_secondary_text || c2.textContent;
  }

  const products = await loadJSON('content/products.json');
  const grid = document.getElementById('products-grid');
  if(products && grid){
    grid.innerHTML = '';
    for(const p of products){
      grid.insertAdjacentHTML('beforeend', `
        <article class="card">
          <img src="${p.image}" alt="${p.title}">
          <div class="p"><strong>${p.title}</strong><p>${p.description||''}</p></div>
        </article>`);
    }
  }

  const gallery = await loadJSON('content/gallery.json');
  const ggrid = document.getElementById('gallery-grid');
  if(gallery && ggrid){
    ggrid.innerHTML = '';
    for(const g of gallery){
      ggrid.insertAdjacentHTML('beforeend', `<img src="${g.image}" alt="${g.alt||'Галерија'}" loading="lazy" data-lightbox/>`);
    }
  }

  const contact = await loadJSON('content/contact.json');
  if(contact){
    const el = document.querySelector('.contact-card');
    if(el){
      el.querySelector('p:nth-of-type(1)').innerHTML = '<strong>Телефон:</strong> ' + (contact.phone || '');
      el.querySelector('p:nth-of-type(2)').innerHTML = '<strong>Е-пошта:</strong> ' + (contact.email || '');
      el.querySelector('p:nth-of-type(3)').innerHTML = '<strong>Работно време:</strong> ' + (contact.hours || '');
      const iframe = el.querySelector('iframe');
      if(iframe && contact.map_embed) iframe.src = contact.map_embed;
    }
  }
})();
