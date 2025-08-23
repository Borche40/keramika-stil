// ============================
// I18N: динамички преводи од JSON (MK/EN)
// ============================
(async function i18nSetup(){
  const LS_KEY = 'lang';
  const defaultLang = 'mk';
  let current = localStorage.getItem(LS_KEY) || defaultLang;

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  async function loadLang(lang){
    try{
      const res = await fetch(`lang/${lang}.json`, {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    }catch(e){
      console.warn('i18n load error', e);
      return null;
    }
  }

  function applyTranslations(dict){
    if(!dict) return;
    $$('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const val = key.split('.').reduce((acc,k)=> acc && acc[k], dict);
      if(typeof val === 'string'){
        if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'){
          el.setAttribute('placeholder', val);
        }else{
          el.innerHTML = val;
        }
      }
    });
    $$('.lang-switch button').forEach(b=>{
      b.classList.toggle('active', b.getAttribute('data-lang') === current);
    });
    document.documentElement.setAttribute('lang', current);
  }

  async function setLang(lang){
    current = lang;
    localStorage.setItem(LS_KEY, lang);
    const dict = await loadLang(lang);
    applyTranslations(dict);
  }

  await setLang(current);

  $$('.lang-switch button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const lang = btn.getAttribute('data-lang');
      setLang(lang);
    });
  });
})();

// ============================
// Smooth scroll за anchor линкови
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
// ============================
(function(){
  const lb = document.querySelector('.lightbox');
  if(!lb) return;
  const lbImg = lb.querySelector('img');
  const close = lb.querySelector('.close');

  document.querySelectorAll('#gallery img[data-lightbox]').forEach(img=>{
    img.addEventListener('click', ()=>{
      lbImg.src = img.getAttribute('data-full') || img.src;
      lb.classList.add('active');
      lb.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    });
  });

  function hide(){
    lb.classList.remove('active');
    lb.setAttribute('aria-hidden','true');
    lbImg.src = '';
    document.body.style.overflow = '';
  }
  close.addEventListener('click', hide);
  lb.addEventListener('click', e=>{ if(e.target===lb) hide(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') hide(); });
})();

// ============================
// Scroll Reveal (IntersectionObserver)
// ============================
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

// ============================
// Contact form: Mailto fallback
// ============================
document.getElementById('contact-form')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  const mail = 'keramikastil@yahoo.com.mk'; // адресата што ја даде
  const subject = encodeURIComponent('Порака од веб-сајтот — ' + name);
  const body = encodeURIComponent(
    'Име: ' + name +
    '\nЕ-пошта: ' + email +
    '\n\nПорака:\n' + message
  );

  window.location.href = `mailto:${mail}?subject=${subject}&body=${body}`;

  const ok = document.getElementById('form-ok');
  const err = document.getElementById('form-err');
  if(ok) ok.style.display = 'block';
  if(err) err.style.display = 'none';
  form.reset();
});
