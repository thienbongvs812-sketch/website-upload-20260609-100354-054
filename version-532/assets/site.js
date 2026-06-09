(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var searchInput = document.querySelector('.movie-search');
    var clearButton = document.querySelector('.search-clear');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
        if (!searchInput || !cards.length) {
            return;
        }

        var query = normalize(searchInput.value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
            var matched = !query || haystack.indexOf(query) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        var empty = document.querySelector('.no-results');
        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    if (clearButton && searchInput) {
        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            filterCards();
            searchInput.focus();
        });
    }
}());

function setupPlayer(videoUrl) {
    var video = document.getElementById('movie-video');
    var startButton = document.querySelector('.player-cover');
    var attached = false;
    var hls = null;

    function attach() {
        if (!video || attached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
            attached = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            attached = true;
            return;
        }

        video.src = videoUrl;
        attached = true;
    }

    function start() {
        if (!video) {
            return;
        }

        attach();
        document.body.classList.add('player-started');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (startButton) {
        startButton.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            document.body.classList.add('player-started');
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
