(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var previous = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    }));

    function show(target) {
      slides[index].classList.remove("is-active");
      index = (target + slides.length) % slides.length;
      slides[index].classList.add("is-active");
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }
  }

  function setupFilters() {
    var area = document.querySelector("[data-filter-area]");
    if (!area) {
      return;
    }
    var search = area.querySelector("[data-filter-search]");
    var type = area.querySelector("[data-filter-type]");
    var year = area.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-item"));
    var empty = document.querySelector("[data-filter-empty]");

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-keywords") || ""
        ].join(" ").toLowerCase();
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
        var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var show = matchesQuery && matchesType && matchesYear;

        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [search, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
