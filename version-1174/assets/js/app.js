(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-prev]");
    var next = carousel.querySelector("[data-next]");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    carousel.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });
    carousel.addEventListener("mouseleave", play);
    play();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var form = scope.querySelector("[data-filter-form]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      if (!form || !cards.length) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q") || "";
      var queryInput = form.querySelector('[name="query"]');
      if (queryInput && queryValue) {
        queryInput.value = queryValue;
      }

      function value(name) {
        var field = form.querySelector('[name="' + name + '"]');
        return field ? field.value.trim().toLowerCase() : "";
      }

      function apply() {
        var query = value("query");
        var year = value("year");
        var type = value("type");
        var category = value("category");
        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.category,
            card.dataset.tags,
            card.dataset.year
          ].join(" ").toLowerCase();
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (year && String(card.dataset.year).toLowerCase() !== year) {
            matched = false;
          }
          if (type && String(card.dataset.type).toLowerCase() !== type) {
            matched = false;
          }
          if (category && String(card.dataset.category).toLowerCase() !== category) {
            matched = false;
          }
          card.classList.toggle("is-hidden", !matched);
        });
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  }

  window.initVideoPlayer = function (source) {
    ready(function () {
      var video = document.getElementById("movie-video");
      var start = document.getElementById("player-start");
      if (!video || !start || !source) {
        return;
      }
      var prepared = false;
      var pending = null;
      var hlsInstance = null;

      function prepare() {
        if (prepared) {
          return Promise.resolve();
        }
        if (pending) {
          return pending;
        }
        pending = new Promise(function (resolve) {
          prepared = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            resolve();
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            setTimeout(resolve, 900);
          } else {
            video.src = source;
            resolve();
          }
        });
        return pending;
      }

      function begin() {
        start.classList.add("is-hidden");
        prepare().then(function () {
          var playRequest = video.play();
          if (playRequest && typeof playRequest.catch === "function") {
            playRequest.catch(function () {
              start.classList.remove("is-hidden");
            });
          }
        });
      }

      start.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
      video.addEventListener("play", function () {
        start.classList.add("is-hidden");
      });
      video.addEventListener("ended", function () {
        start.classList.remove("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    initMenu();
    initCarousel();
    initFilters();
  });
})();
