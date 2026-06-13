document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector("[data-header]");
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function syncHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 20) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (menuToggle && mobileNav && header) {
    menuToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      header.classList.toggle("is-open", mobileNav.classList.contains("is-open"));
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function show(index) {
      if (slides.length === 0) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-scroll]").forEach(function (button) {
    button.addEventListener("click", function () {
      var targetId = button.getAttribute("data-scroll-target");
      var target = targetId ? document.getElementById(targetId) : null;
      var direction = button.getAttribute("data-scroll") === "left" ? -1 : 1;

      if (target) {
        target.scrollBy({
          left: direction * 420,
          behavior: "smooth"
        });
      }
    });
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var searchInput = scope.querySelector("[data-search-input]");
    var root = scope.parentElement || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
    var selectors = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));

    function matches(card, query) {
      var text = (card.getAttribute("data-search") || "").toLowerCase();
      return !query || text.indexOf(query) !== -1;
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        var visible = matches(card, query);

        selectors.forEach(function (selector) {
          var key = selector.getAttribute("data-filter");
          var value = selector.value;

          if (value && card.getAttribute("data-" + key) !== value) {
            visible = false;
          }
        });

        card.hidden = !visible;
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    selectors.forEach(function (selector) {
      selector.addEventListener("change", applyFilters);
    });
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var message = player.querySelector("[data-player-message]");
    var streamUrl = player.getAttribute("data-play");
    var loaded = false;
    var hlsInstance = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.classList.add("is-visible");
      }
    }

    function loadVideo() {
      return new Promise(function (resolve, reject) {
        if (!video || !streamUrl) {
          reject(new Error("missing"));
          return;
        }

        if (loaded) {
          resolve();
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          loaded = true;
          resolve();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });

          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            loaded = true;
            resolve();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject(new Error("fatal"));
            }
          });
          return;
        }

        reject(new Error("unsupported"));
      });
    }

    function beginPlayback() {
      loadVideo().then(function () {
        if (button) {
          button.classList.add("is-hidden");
        }

        if (message) {
          message.classList.remove("is-visible");
          message.textContent = "";
        }

        return video.play();
      }).catch(function () {
        showMessage("视频加载失败，请稍后重试");
      });
    }

    if (button) {
      button.addEventListener("click", beginPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          beginPlayback();
        } else {
          video.pause();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
