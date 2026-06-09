document.addEventListener("DOMContentLoaded", function() {
  setupNavigation();
  setupHero();
  setupFilters();
});

function setupNavigation() {
  const button = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (!button || !links) {
    return;
  }
  button.addEventListener("click", function() {
    links.classList.toggle("open");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) {
    return;
  }
  let index = 0;
  let timer = null;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  function play() {
    timer = window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  dots.forEach(function(dot, dotIndex) {
    dot.addEventListener("click", function() {
      window.clearInterval(timer);
      show(dotIndex);
      play();
    });
  });

  show(0);
  play();
}

function setupFilters() {
  const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
  scopes.forEach(function(scope) {
    const form = scope.querySelector("[data-filter-form]");
    const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
    if (!form || !cards.length) {
      return;
    }

    const input = form.querySelector("[data-filter-input]");
    const yearSelect = form.querySelector("[data-filter-year]");
    const typeSelect = form.querySelector("[data-filter-type]");
    const categorySelect = form.querySelector("[data-filter-category]");
    const empty = scope.querySelector("[data-empty]");

    fillSelect(yearSelect, uniqueValues(cards, "year").sort(function(a, b) {
      return Number(b) - Number(a);
    }));
    fillSelect(typeSelect, uniqueValues(cards, "type"));

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function apply() {
      const q = (input ? input.value.trim().toLowerCase() : "");
      const year = yearSelect ? yearSelect.value : "";
      const type = typeSelect ? typeSelect.value : "";
      const category = categorySelect ? categorySelect.value : "";
      let visible = 0;

      cards.forEach(function(card) {
        const text = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.category
        ].join(" ").toLowerCase();
        const matched = (!q || text.indexOf(q) !== -1)
          && (!year || card.dataset.year === year)
          && (!type || card.dataset.type === type)
          && (!category || card.dataset.category === category);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    form.addEventListener("submit", function(event) {
      event.preventDefault();
      apply();
    });
    [input, yearSelect, typeSelect, categorySelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  });
}

function uniqueValues(cards, key) {
  const values = new Set();
  cards.forEach(function(card) {
    const value = card.dataset[key];
    if (value) {
      values.add(value);
    }
  });
  return Array.from(values);
}

function fillSelect(select, values) {
  if (!select) {
    return;
  }
  values.forEach(function(value) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}
