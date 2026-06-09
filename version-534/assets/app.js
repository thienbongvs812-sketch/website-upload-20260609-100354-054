(function () {
  var menuButton = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  filterPanels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var scope = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');

    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [card.getAttribute('data-title'), card.getAttribute('data-tags'), card.getAttribute('data-region'), card.getAttribute('data-genre')].join(' ').toLowerCase();
        var typeOk = !type || card.getAttribute('data-type') === type;
        var yearOk = !year || card.getAttribute('data-year') === year;
        var keywordOk = !keyword || text.indexOf(keyword) !== -1;
        var show = typeOk && yearOk && keywordOk;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    };

    if (input) {
      input.addEventListener('input', apply);
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial) {
        input.value = initial;
      }
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    apply();
  });
})();

function setupPlayer(source) {
  var video = document.querySelector('.player-video');
  var overlay = document.querySelector('.player-overlay');
  var trigger = document.querySelector('.play-button');
  if (!video || !source) {
    return;
  }

  var started = false;
  var start = function () {
    if (started) {
      video.play().catch(function () {});
      return;
    }
    started = true;
    if (overlay) {
      overlay.classList.add('hidden');
    }
    video.controls = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.load();
      video.play().catch(function () {});
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else {
      video.src = source;
      video.load();
      video.play().catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', start);
  }
  if (trigger) {
    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }
  video.addEventListener('click', function () {
    if (!started || video.paused) {
      start();
    }
  });
}
