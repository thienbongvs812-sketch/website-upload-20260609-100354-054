(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function setHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }

    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  heroDots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHeroSlide(index);
    });
  });

  if (heroSlides.length > 1) {
    window.setInterval(function () {
      setHeroSlide(heroIndex + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var controls = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-control]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-item]'));
    var empty = scope.querySelector('[data-empty]');

    function applyFilter() {
      var queryControl = scope.querySelector('[data-filter-name="query"]');
      var typeControl = scope.querySelector('[data-filter-name="type"]');
      var yearControl = scope.querySelector('[data-filter-name="year"]');
      var query = queryControl ? queryControl.value.trim().toLowerCase() : '';
      var type = typeControl ? typeControl.value.trim() : '';
      var year = yearControl ? yearControl.value.trim() : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }

        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }

        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }

        card.hidden = !ok;

        if (ok) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    controls.forEach(function (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var queryInput = scope.querySelector('[data-filter-name="query"]');

    if (q && queryInput) {
      queryInput.value = q;
    }

    applyFilter();
  });

  window.initMoviePlayer = function (videoUrl) {
    var video = document.getElementById('moviePlayer');
    var playButton = document.getElementById('moviePlayButton');
    var veil = document.querySelector('[data-player-veil]');
    var attached = false;
    var hlsInstance = null;

    if (!video || !videoUrl) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else {
        video.src = videoUrl;
      }
    }

    function startPlayback() {
      attachSource();

      if (veil) {
        veil.classList.add('is-hidden');
      }

      video.controls = true;

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayback);
    }

    if (veil) {
      veil.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
      if (veil) {
        veil.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
