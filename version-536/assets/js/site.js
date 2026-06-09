(function () {
  var toggle = document.querySelector(".nav-toggle");
  var mobile = document.querySelector(".mobile-nav");
  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      var opened = mobile.hasAttribute("hidden");
      if (opened) {
        mobile.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "×";
      } else {
        mobile.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      }
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  var filterForm = document.querySelector("[data-filter-form]");
  var filterList = document.querySelector("[data-filter-list]");
  if (filterForm && filterList) {
    var keywordInput = filterForm.querySelector("[data-filter-keyword]");
    var typeSelect = filterForm.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));

    var applyFilter = function () {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      cards.forEach(function (item) {
        var haystack = [
          item.getAttribute("data-title"),
          item.getAttribute("data-year"),
          item.getAttribute("data-type"),
          item.getAttribute("data-region"),
          item.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var typeMatch = !type || item.getAttribute("data-type") === type;
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        item.classList.toggle("is-filter-hidden", !(typeMatch && keywordMatch));
      });
    };

    filterForm.addEventListener("input", applyFilter);
    filterForm.addEventListener("change", applyFilter);
    filterForm.addEventListener("reset", function () {
      window.setTimeout(applyFilter, 0);
    });
  }

  var results = document.getElementById("search-results");
  var status = document.getElementById("search-status");
  var input = document.getElementById("search-input");
  if (results && status && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input) {
      input.value = q;
    }

    var renderCard = function (movie) {
      return [
        "<article class=\"movie-card\">",
        "<a class=\"movie-cover\" href=\"" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
        "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "<span class=\"movie-duration\">" + escapeHtml(movie.duration) + "</span>",
        "<span class=\"movie-play\">▶</span>",
        "</a>",
        "<div class=\"movie-info\">",
        "<a class=\"movie-title\" href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a>",
        "<p>" + escapeHtml(movie.summary) + "</p>",
        "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
        "</div>",
        "</article>"
      ].join("");
    };

    var runSearch = function (query) {
      var keyword = query.trim().toLowerCase();
      var list = window.MOVIE_INDEX.filter(function (movie) {
        if (!keyword) {
          return false;
        }
        var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.summary, movie.tags.join(" ")].join(" ").toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 160);

      if (!keyword) {
        status.textContent = "请输入关键词查找影片";
        results.innerHTML = window.MOVIE_INDEX.slice(0, 24).map(renderCard).join("");
        return;
      }

      status.textContent = list.length ? "搜索结果" : "没有找到匹配影片";
      results.innerHTML = list.map(renderCard).join("");
    };

    runSearch(q);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
