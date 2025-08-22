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

  const mail = 'info@keramika-stil.mk'; // смени ако е друга адреса
  const subject = encodeURIComponent('Порака од веб-сајтот — ' + name);
  const body = encodeURIComponent(
    'Име: ' + name +
    '\nЕ-пошта: ' + email +
    '\n\nПорака:\n' + message
  );

  // Отвора mail клиент
  window.location.href = `mailto:${mail}?subject=${subject}&body=${body}`;

  // UI сигнал
  const ok = document.getElementById('form-ok');
  const err = document.getElementById('form-err');
  if(ok) ok.style.display = 'block';
  if(err) err.style.display = 'none';
  form.reset();
});
