(function () {
    function findParent(element, selector) {
        while (element && element !== document) {
            if (element.matches(selector)) {
                return element;
            }
            element = element.parentElement;
        }
        return null;
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var sliders = document.querySelectorAll('[data-hero-slider]');
        sliders.forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
            var prev = slider.querySelector('[data-hero-prev]');
            var next = slider.querySelector('[data-hero-next]');
            var active = 0;
            var timer = null;
            function show(index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === active);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === active);
                });
            }
            function play() {
                clearInterval(timer);
                timer = setInterval(function () {
                    show(active + 1);
                }, 5200);
            }
            if (slides.length < 2) {
                return;
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                    play();
                });
            });
            if (prev) {
                prev.addEventListener('click', function () {
                    show(active - 1);
                    play();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(active + 1);
                    play();
                });
            }
            show(0);
            play();
        });
    }

    function setupListings() {
        var listings = document.querySelectorAll('[data-listing]');
        listings.forEach(function (listing) {
            var input = listing.querySelector('[data-listing-search]');
            var cards = Array.prototype.slice.call(listing.querySelectorAll('.movie-card'));
            var buttons = Array.prototype.slice.call(listing.querySelectorAll('[data-filter-field]'));
            var empty = listing.querySelector('[data-no-results]');
            var filters = {};
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    var matched = !query || text.indexOf(query) !== -1;
                    Object.keys(filters).forEach(function (field) {
                        var expected = filters[field];
                        if (expected && expected !== 'all' && card.getAttribute('data-' + field) !== expected) {
                            matched = false;
                        }
                    });
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    var field = button.getAttribute('data-filter-field');
                    var value = button.getAttribute('data-filter-value');
                    filters[field] = value;
                    buttons.filter(function (item) {
                        return item.getAttribute('data-filter-field') === field;
                    }).forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function setupBackTop() {
        var button = document.querySelector('[data-back-top]');
        if (!button) {
            return;
        }
        function check() {
            button.classList.toggle('is-visible', window.scrollY > 560);
        }
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        window.addEventListener('scroll', check, { passive: true });
        check();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupListings();
        setupBackTop();
    });
}());
