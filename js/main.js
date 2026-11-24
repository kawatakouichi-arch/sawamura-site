// ===== ヘッダーの高さを測る（メイン写真を1画面に収めるため） =====
// （スマホではキャッチコピーの高さも測って、写真＋コピーを1画面に収めます）
const header = document.querySelector('.header');
// （キャッチコピーはトップページだけなので、ないページでは測りません）
const message = document.querySelector('.message');
const setHeaderHeight = () => {
  const root = document.documentElement.style;
  root.setProperty('--header-h', header.offsetHeight + 'px');
  if (message) root.setProperty('--message-h', message.offsetHeight + 'px');
};
setHeaderHeight();
const sizeObserver = new ResizeObserver(setHeaderHeight);
sizeObserver.observe(header);
if (message) sizeObserver.observe(message);

// ===== トップのメイン写真：3秒ごとのスライドショー =====
// 表示中の写真から is-active を外して、次の写真に付けかえる（最後まで行ったら最初に戻る）
const heroImages = document.querySelectorAll('.hero img');
// 「動きを減らす」設定にしている人には、自動で切り替えない
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (heroImages.length > 1 && !reduceMotion) {
  let current = 0;
  setInterval(() => {
    heroImages[current].classList.remove('is-active');
    current = (current + 1) % heroImages.length;
    heroImages[current].classList.add('is-active');
  }, 3000); // 3000ミリ秒 = 3秒
}

// ===== スマホメニューの開閉 =====
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuBtn.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// メニュー内のリンクを押したら閉じる
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

// ===== ギャラリーの拡大表示 =====
const lightbox = document.querySelector('.lightbox');
const lightboxInner = lightbox.querySelector('.lightbox__inner');

document.querySelectorAll('.gallery__list button').forEach((item) => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    if (img) {
      // 写真があるとき：その写真を大きく表示
      lightboxInner.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
      lightboxInner.classList.add('has-img');
    } else {
      // 仮置きのグレーの箱のとき：ラベルだけ表示
      lightboxInner.innerHTML = '';
      lightboxInner.classList.remove('has-img');
      lightboxInner.dataset.label = item.dataset.label;
    }
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', false);
  });
});

const closeLightbox = () => {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', true);
};
lightbox.addEventListener('click', (e) => {
  // 写真の外（白いところ・×ボタン）を押したら閉じる
  if (!lightboxInner.contains(e.target)) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ===== スクロールでふわっと表示 =====
const fadeTargets = document.querySelectorAll('.message__text, .heading, .gallery__list li, .wedding-intro__text, .flow__item, .menu-list__item, .notice__box, .recommend-list__item, .before-after__figure, .price-col, .career-list__row');
fadeTargets.forEach((el) => el.classList.add('fade'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
fadeTargets.forEach((el) => observer.observe(el));

// ===== コピーライトの年を自動更新 =====
document.getElementById('year').textContent = new Date().getFullYear();
