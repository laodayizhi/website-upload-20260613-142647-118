(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');

  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  function setupHero(hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.querySelectorAll('[data-hero]').forEach(setupHero);

  document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
    button.addEventListener('click', function () {
      var targetId = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
      var rail = document.getElementById(targetId);
      if (!rail) return;
      var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
      rail.scrollBy({ left: direction * 420, behavior: 'smooth' });
    });
  });

  function textOf(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre')
    ].join(' ').toLowerCase();
  }

  function applyFilter(root) {
    var input = root.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var empty = root.querySelector('[data-empty-tip]');
    var activeYear = 'all';
    var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter-value]'));

    function run() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var yearOk = activeYear === 'all' || card.getAttribute('data-year') === activeYear;
        var textOk = !keyword || textOf(card).indexOf(keyword) !== -1;
        var ok = yearOk && textOk;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.style.display = visible ? 'none' : 'block';
    }

    if (input) {
      input.addEventListener('input', run);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeYear = chip.getAttribute('data-filter-value') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        run();
      });
    });
  }

  applyFilter(document);

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('[data-search-input]');
      if (input) input.dispatchEvent(new Event('input'));
      var target = document.getElementById('featured') || document.querySelector('.content-section');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

function initVideoPlayer(url) {
  var video = document.getElementById('movie-player');
  var card = document.querySelector('[data-player-card]');
  var start = document.querySelector('[data-player-start]');
  var state = document.querySelector('[data-player-state]');

  if (!video || !url) return;

  function setState(text) {
    if (state) state.textContent = text || '';
  }

  function begin() {
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        setState('点击后开始播放');
      });
    }
  }

  if (typeof Hls !== 'undefined' && Hls.isSupported()) {
    var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setState('');
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setState('播放加载失败，请稍后重试');
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    video.addEventListener('loadedmetadata', function () {
      setState('');
    });
  } else {
    video.src = url;
  }

  if (start) {
    start.addEventListener('click', function () {
      begin();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) begin();
  });

  video.addEventListener('play', function () {
    if (card) card.classList.add('is-playing');
    setState('');
  });

  video.addEventListener('pause', function () {
    if (card) card.classList.remove('is-playing');
  });

  video.addEventListener('error', function () {
    setState('播放加载失败，请稍后重试');
  });
}
