(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");

  if (toggle && header) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === active);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(active + 1);
        restart();
      });
    }

    restart();
  }

  function bindFilter(scope) {
    var input = scope.querySelector(".card-filter-input");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-row"));
    var chips = Array.prototype.slice.call(scope.querySelectorAll(".chip-row button"));
    var chipValue = "all";

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-region") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var chipMatch = chipValue === "all" || haystack.indexOf(chipValue.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden-card", !(queryMatch && chipMatch));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        chipValue = chip.getAttribute("data-filter") || "all";
        applyFilter();
      });
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
      applyFilter();
    }
  }

  Array.prototype.slice.call(document.querySelectorAll(".page-shell, body")).forEach(function (scope) {
    if (scope.querySelector(".card-filter-input")) {
      bindFilter(scope);
    }
  });
})();
