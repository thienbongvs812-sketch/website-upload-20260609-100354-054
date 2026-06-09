document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav-links");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  document.querySelectorAll(".filter-panel").forEach(function (panel) {
    var scopeSelector = panel.getAttribute("data-target") || ".searchable-card";
    var cards = Array.prototype.slice.call(document.querySelectorAll(scopeSelector));
    var keywordInput = panel.querySelector("[data-filter-keyword]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var empty = document.querySelector(panel.getAttribute("data-empty") || "");

    function normalized(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalized(keywordInput ? keywordInput.value : "");
      var category = normalized(categorySelect ? categorySelect.value : "");
      var type = normalized(typeSelect ? typeSelect.value : "");
      var year = normalized(yearSelect ? yearSelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalized([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre")
        ].join(" "));
        var cardCategory = normalized(card.getAttribute("data-category"));
        var cardType = normalized(card.getAttribute("data-type"));
        var cardYear = normalized(card.getAttribute("data-year"));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [keywordInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });
});
