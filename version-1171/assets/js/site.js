const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

ready(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", () => {
      mobilePanel.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    const start = () => {
      timer = window.setInterval(() => show(current + 1), 5000);
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", () => {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(current + 1);
        restart();
      });
    }

    show(0);
    start();
  }

  const searchPage = document.querySelector("[data-search-page]");

  if (searchPage) {
    const params = new URLSearchParams(window.location.search);
    const queryInput = searchPage.querySelector("[data-filter-input]");
    const categorySelect = searchPage.querySelector("[data-category-select]");
    const cards = Array.from(searchPage.querySelectorAll("[data-search]"));
    const initialQuery = params.get("q") || "";

    if (queryInput) {
      queryInput.value = initialQuery;
    }

    const applyFilter = () => {
      const query = (queryInput ? queryInput.value : "").trim().toLowerCase();
      const category = categorySelect ? categorySelect.value.trim().toLowerCase() : "";

      cards.forEach((card) => {
        const content = (card.getAttribute("data-search") || "").toLowerCase();
        const matchesQuery = !query || content.includes(query);
        const matchesCategory = !category || content.includes(category);
        card.hidden = !(matchesQuery && matchesCategory);
      });
    };

    if (queryInput) {
      queryInput.addEventListener("input", applyFilter);
    }

    if (categorySelect) {
      categorySelect.addEventListener("change", applyFilter);
    }

    applyFilter();
  }
});
