/* =========================================================
   FinanceQc — search.js
   Recherche locale, côté client. Branche tous les conteneurs
   .search-box[data-search-base] présents sur la page.
   ========================================================= */
(function () {
  "use strict";

  if (!window.SEARCH_DATA || !Array.isArray(window.SEARCH_DATA)) return;

  // Normalise une chaîne : minuscules + retire les accents
  const normalize = (s) =>
    (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  // Pré-calcule les champs normalisés (titre, desc, kw concat)
  const indexed = window.SEARCH_DATA.map((item) => ({
    ref: item,
    nTitle: normalize(item.title),
    nDesc: normalize(item.desc),
    nKw: normalize((item.keywords || []).join(" ")),
  }));

  // Découpe la requête en termes utiles (≥ 2 caractères)
  const tokenize = (q) =>
    normalize(q)
      .split(/\s+/)
      .filter((t) => t.length >= 2);

  // Score = poids titre × matchs + poids desc × matchs + poids kw × matchs
  const search = (q, max = 12) => {
    const tokens = tokenize(q);
    if (tokens.length === 0) return [];
    const scored = [];
    for (const it of indexed) {
      let score = 0;
      let allMatched = true;
      for (const t of tokens) {
        const inT = it.nTitle.includes(t);
        const inD = it.nDesc.includes(t);
        const inK = it.nKw.includes(t);
        if (!(inT || inD || inK)) {
          allMatched = false;
          break;
        }
        if (inT) score += 5;
        if (inD) score += 2;
        if (inK) score += 1;
      }
      if (allMatched) scored.push({ item: it.ref, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, max).map((s) => s.item);
  };

  // Branche un conteneur de recherche : input + ul.search-results
  const wireBox = (box) => {
    const base = box.getAttribute("data-search-base") || "";
    const input = box.querySelector("input[type='search'], input[data-search-input]");
    const list = box.querySelector("ul.search-results, [data-search-results]");
    if (!input || !list) return;

    let lastQuery = "";
    let activeIndex = -1;
    let currentHits = [];

    const close = () => {
      list.innerHTML = "";
      list.classList.remove("is-open");
      activeIndex = -1;
      currentHits = [];
    };

    const render = (hits) => {
      currentHits = hits;
      activeIndex = -1;
      if (hits.length === 0) {
        list.innerHTML = `<li class="search-empty">Aucun résultat pour « ${escapeHtml(lastQuery)} »</li>`;
        list.classList.add("is-open");
        return;
      }
      list.innerHTML = hits
        .map(
          (h, i) => `<li class="search-hit" data-index="${i}">
            <a href="${escapeHtml(base + h.url)}">
              <span class="search-type">${escapeHtml(h.type)}</span>
              <span class="search-title">${escapeHtml(h.title)}</span>
              <span class="search-desc">${escapeHtml(h.desc)}</span>
            </a>
          </li>`
        )
        .join("");
      list.classList.add("is-open");
    };

    const update = () => {
      const q = input.value.trim();
      lastQuery = q;
      if (q.length < 2) {
        close();
        return;
      }
      render(search(q));
    };

    const escapeHtml = (s) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    input.addEventListener("input", update);
    input.addEventListener("focus", update);

    input.addEventListener("keydown", (e) => {
      const items = list.querySelectorAll(".search-hit");
      if (e.key === "ArrowDown") {
        if (items.length === 0) return;
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        items.forEach((el, i) => el.classList.toggle("is-active", i === activeIndex));
      } else if (e.key === "ArrowUp") {
        if (items.length === 0) return;
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        items.forEach((el, i) => el.classList.toggle("is-active", i === activeIndex));
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && currentHits[activeIndex]) {
          e.preventDefault();
          window.location.href = base + currentHits[activeIndex].url;
        }
      } else if (e.key === "Escape") {
        input.blur();
        close();
      }
    });

    document.addEventListener("click", (e) => {
      if (!box.contains(e.target)) close();
    });
  };

  document.querySelectorAll(".search-box[data-search-base]").forEach(wireBox);
  // Aussi accepter les conteneurs sans attribut explicite (base = "")
  document.querySelectorAll(".search-box:not([data-search-base])").forEach((box) => {
    if (!box.hasAttribute("data-search-base")) box.setAttribute("data-search-base", "");
    wireBox(box);
  });
})();
