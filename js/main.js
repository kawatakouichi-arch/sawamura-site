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

// ===== トップのギャラリー：1枚ずつふわっと入れかわるスライドショー =====
// 約2.5秒ごとに、9枚のうちどれか1枚を、まだ出ていない写真に入れかえる。
// 写真の候補は index.html の <template id="gallery-pool"> の中。
const galleryPool = document.getElementById('gallery-pool');
const galleryTiles = document.querySelectorAll('.gallery--home .gallery__list img');
if (galleryPool && galleryTiles.length && !reduceMotion) {
  // 候補の写真を { src, alt } の一覧にする
  const pool = [...galleryPool.content.querySelectorAll('img')].map((img) => ({
    src: img.getAttribute('src'),
    alt: img.alt,
  }));

  // 今ギャラリーに出ている写真は、順番待ちの列に入れない（同じ写真が2か所に出ないように）
  const shownSrcs = [...galleryTiles].map((img) => img.getAttribute('src'));
  const queue = pool.filter((photo) => !shownSrcs.includes(photo.src));

  // 順番待ちの列をシャッフル（毎回ちがう順番で出てくるように）
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  // ギャラリーが画面に見えている間だけ入れかえる（見えていないときは読み込みもしない）
  let galleryVisible = false;
  new IntersectionObserver((entries) => {
    galleryVisible = entries[0].isIntersecting;
  }).observe(document.querySelector('.gallery--home'));

  let recentTiles = []; // 最近入れかえた場所（続けて同じ場所が変わらないように）
  let busy = false;     // 入れかえ中は次を始めない

  const swapOne = () => {
    if (!galleryVisible || busy || document.hidden || queue.length === 0) return;

    // 最近入れかえた2か所以外から、ランダムに1か所選ぶ
    const candidates = [...galleryTiles.keys()].filter((i) => !recentTiles.includes(i));
    const index = candidates[Math.floor(Math.random() * candidates.length)];
    recentTiles = [index, ...recentTiles].slice(0, 2);

    const tile = galleryTiles[index];
    const next = queue.shift();
    busy = true;

    // 次の写真を読み込んでから、上に重ねてふわっと表示
    const overlay = new Image();
    overlay.className = 'gallery__next';
    overlay.alt = '';
    overlay.onload = () => {
      tile.parentNode.appendChild(overlay);
      overlay.getBoundingClientRect(); // 表示の準備をさせてから is-show を付ける（これがないとふわっとしない）
      overlay.classList.add('is-show');

      setTimeout(() => {
        // ふわっと表示し終わったら、下の写真を新しい写真に入れかえて、重ねた写真を消す
        queue.push({ src: tile.getAttribute('src'), alt: tile.alt }); // 外れた写真は列の最後へ
        tile.src = next.src;
        tile.alt = next.alt;
        tile.decode().catch(() => {}).then(() => {
          overlay.remove();
          busy = false;
        });
      }, 1300);
    };
    overlay.onerror = () => { busy = false; }; // 読み込めなかったときは飛ばす
    overlay.src = next.src;
  };

  setInterval(swapOne, 2500); // 2500ミリ秒 = 2.5秒
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
