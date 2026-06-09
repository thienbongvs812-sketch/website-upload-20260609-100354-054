(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    var menuButton = qs('[data-menu-toggle]');
    var mobileMenu = qs('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = qs('[data-hero]');
    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        if (slides.length) {
            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    restart();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                    restart();
                });
            });
            start();
        }
    }

    qsa('.local-filter').forEach(function (form) {
        var scopeId = form.getAttribute('data-filter-scope');
        var scope = document.getElementById(scopeId);
        if (!scope) {
            return;
        }
        var cards = qsa('.movie-card', scope);

        function apply() {
            var keyword = normalize(form.elements.keyword && form.elements.keyword.value);
            var type = normalize(form.elements.type && form.elements.type.value);
            var year = normalize(form.elements.year && form.elements.year.value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okType = !type || normalize(card.getAttribute('data-type')) === type;
                var okYear = !year || normalize(card.getAttribute('data-year')) === year;
                card.classList.toggle('is-hidden', !(okKeyword && okType && okYear));
            });
        }

        form.addEventListener('input', apply);
        form.addEventListener('change', apply);
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });
    });

    var searchForm = qs('[data-search-form]');
    var results = qs('[data-search-results]');
    var summary = qs('[data-search-summary]');
    if (searchForm && results && summary && window.SEARCH_ITEMS) {
        var params = new URLSearchParams(window.location.search);
        ['q', 'category', 'type', 'year'].forEach(function (name) {
            if (searchForm.elements[name] && params.get(name)) {
                searchForm.elements[name].value = params.get(name);
            }
        });

        function card(item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<article class="movie-card">' +
                '<a class="movie-card-link" href="' + escapeHtml(item.url) + '">' +
                '<figure class="poster-frame">' +
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + ' 在线观看" loading="lazy">' +
                '<span class="poster-badge">' + escapeHtml(item.category) + '</span>' +
                '<span class="poster-duration">' + escapeHtml(item.duration) + '</span>' +
                '</figure>' +
                '<div class="movie-card-body">' +
                '<h3>' + escapeHtml(item.title) + '</h3>' +
                '<p>' + escapeHtml(item.description) + '</p>' +
                '<div class="movie-card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
                '</a>' +
                '</article>';
        }

        function applySearch() {
            var query = normalize(searchForm.elements.q && searchForm.elements.q.value);
            var category = normalize(searchForm.elements.category && searchForm.elements.category.value);
            var type = normalize(searchForm.elements.type && searchForm.elements.type.value);
            var year = normalize(searchForm.elements.year && searchForm.elements.year.value);
            var matched = window.SEARCH_ITEMS.filter(function (item) {
                var haystack = normalize([
                    item.title,
                    item.description,
                    item.category,
                    item.region,
                    item.genre,
                    item.type,
                    item.year,
                    (item.tags || []).join(' ')
                ].join(' '));
                return (!query || haystack.indexOf(query) !== -1) &&
                    (!category || normalize(item.category) === category) &&
                    (!type || normalize(item.type) === type) &&
                    (!year || normalize(item.year) === year);
            });
            var limited = matched.slice(0, 120);
            results.innerHTML = limited.map(card).join('');
            if (matched.length) {
                summary.textContent = '找到相关影片 ' + matched.length + ' 部，当前展示 ' + limited.length + ' 部。';
            } else {
                summary.textContent = query || category || type || year ? '未找到相关影片，试试其他关键词。' : '输入关键词开始浏览。';
            }
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var nextParams = new URLSearchParams();
            ['q', 'category', 'type', 'year'].forEach(function (name) {
                var control = searchForm.elements[name];
                if (control && control.value) {
                    nextParams.set(name, control.value);
                }
            });
            var queryString = nextParams.toString();
            var nextUrl = window.location.pathname + (queryString ? '?' + queryString : '');
            window.history.replaceState(null, '', nextUrl);
            applySearch();
        });
        searchForm.addEventListener('input', applySearch);
        searchForm.addEventListener('change', applySearch);
        applySearch();
    }
})();
