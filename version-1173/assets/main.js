(function () {
    const menuButton = document.querySelector(".mobile-menu-button");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            const expanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!expanded));
            mobileNav.hidden = expanded;
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let current = 0;
        let timer = null;

        function activate(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function next() {
            activate((current + 1) % slides.length);
        }

        function start() {
            timer = window.setInterval(next, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                stop();
                activate(Number(dot.getAttribute("data-hero-dot")));
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    const filterControls = Array.from(document.querySelectorAll(".filter-control"));

    if (filterControls.length) {
        const cards = Array.from(document.querySelectorAll(".movie-card, .rank-card"));
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";

        filterControls.forEach(function (control) {
            if (control.getAttribute("data-filter") === "query" && initialQuery) {
                control.value = initialQuery;
            }
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        });

        function getValue(name) {
            const control = filterControls.find(function (item) {
                return item.getAttribute("data-filter") === name;
            });
            return control ? control.value.trim().toLowerCase() : "";
        }

        function applyFilters() {
            const query = getValue("query");
            const year = getValue("year");
            const type = getValue("type");
            const channel = getValue("channel");

            cards.forEach(function (card) {
                const text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || ""
                ].join(" ").toLowerCase();
                const cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                const cardType = (card.getAttribute("data-type") || "").toLowerCase();
                const cardTags = (card.getAttribute("data-tags") || "").toLowerCase();
                const matched = (!query || text.indexOf(query) > -1) &&
                    (!year || cardYear === year) &&
                    (!type || cardType === type) &&
                    (!channel || cardTags.indexOf(channel) > -1);

                card.classList.toggle("is-hidden-by-filter", !matched);
            });
        }

        applyFilters();
    }
})();
