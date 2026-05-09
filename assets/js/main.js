/* =========================================================
   FinanceQc — main.js
   Petits utilitaires partagés : année dans le footer,
   formatage de devise et de pourcentage.
   ========================================================= */

(function () {
  "use strict";

  // Année dynamique dans le pied de page
  const yearEls = document.querySelectorAll("[data-current-year]");
  const year = new Date().getFullYear();
  yearEls.forEach((el) => (el.textContent = year));

  // Temps de lecture : compte les mots de l'article et écrit dans [data-reading-time]
  document.querySelectorAll("[data-reading-time]").forEach((el) => {
    const targetSel = el.getAttribute("data-reading-time");
    const target = targetSel ? document.querySelector(targetSel) : null;
    if (!target) return;
    const text = target.textContent || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 220));
    el.textContent = `${minutes} min de lecture`;
  });

  // Bouton retour-haut
  const toTop = document.querySelector(".to-top");
  if (toTop) {
    const onScroll = () => {
      if (window.scrollY > 320) toTop.classList.add("is-visible");
      else toTop.classList.remove("is-visible");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();

/* Formatteurs réutilisés par les calculateurs */
const formatCAD = (value) => {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCADPrecise = (value) => {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value, digits = 1) => {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat("fr-CA", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

const formatNumber = (value, digits = 1) => {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat("fr-CA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

/* Lecture sécurisée d'un champ numérique */
const readNumber = (id, fallback = 0) => {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const v = parseFloat(el.value);
  return isFinite(v) ? v : fallback;
};

/* Petit helper pour accepter un pourcentage saisi soit en %
   (ex: 6.5) soit en décimal (ex: 0.065). On suppose qu'au-dessus
   de 1 c'est un %. */
const toRate = (raw) => {
  if (!isFinite(raw)) return 0;
  return raw > 1 ? raw / 100 : raw;
};

/* =========================================================
   Helpers financiers réutilisables — Phase 3
   ========================================================= */

/* Valeur future d'un capital initial avec cotisations annuelles
   (cotisation faite en fin d'année, capitalisation annuelle). */
const futureValue = (principal, annualContribution, rate, years) => {
  const r = toRate(rate);
  const n = Math.max(0, years | 0);
  if (r === 0) return principal + annualContribution * n;
  const growth = Math.pow(1 + r, n);
  return principal * growth + annualContribution * ((growth - 1) / r);
};

/* Valeur future avec cotisations mensuelles (rendement annuel composé mensuellement). */
const futureValueMonthly = (principal, monthlyContribution, annualRate, years) => {
  const r = toRate(annualRate) / 12;
  const n = Math.max(0, Math.round(years * 12));
  if (r === 0) return principal + monthlyContribution * n;
  const growth = Math.pow(1 + r, n);
  return principal * growth + monthlyContribution * ((growth - 1) / r);
};

/* Cotisation mensuelle requise pour atteindre un objectif. */
const monthlyContributionNeeded = (target, principal, annualRate, years) => {
  const r = toRate(annualRate) / 12;
  const n = Math.max(1, Math.round(years * 12));
  const fvPrincipal = principal * Math.pow(1 + r, n);
  const remaining = target - fvPrincipal;
  if (remaining <= 0) return 0;
  if (r === 0) return remaining / n;
  return (remaining * r) / (Math.pow(1 + r, n) - 1);
};

/* Paiement mensuel d'une hypothèque (taux annuel nominal canadien composé semestriellement). */
const mortgagePayment = (principal, annualRate, amortYears) => {
  const ar = toRate(annualRate);
  // Conversion taux semestriel -> mensuel équivalent (norme Canada)
  const semi = ar / 2;
  const monthly = Math.pow(1 + semi, 1 / 6) - 1;
  const n = Math.max(1, Math.round(amortYears * 12));
  if (monthly === 0) return principal / n;
  return (principal * monthly) / (1 - Math.pow(1 + monthly, -n));
};

/* Pouvoir d'achat futur d'un montant : combien il « vaudra » dans n années
   en dollars d'aujourd'hui, étant donné un taux d'inflation. */
const realPurchasingPower = (amount, inflationRate, years) => {
  const i = toRate(inflationRate);
  const n = Math.max(0, years | 0);
  return amount / Math.pow(1 + i, n);
};

/* Inflation cumulée : ce qu'il faut demain pour acheter ce qui coûte X aujourd'hui. */
const inflatedAmount = (amount, inflationRate, years) => {
  const i = toRate(inflationRate);
  const n = Math.max(0, years | 0);
  return amount * Math.pow(1 + i, n);
};

/* Rendement réel à partir du nominal et de l'inflation (formule de Fisher). */
const realReturn = (nominalRate, inflationRate) => {
  const r = toRate(nominalRate);
  const i = toRate(inflationRate);
  return (1 + r) / (1 + i) - 1;
};

/* Affichage d'un résultat dans un .result-tile : id de l'élément .value à mettre à jour. */
const setResult = (id, value, formatter = formatCAD) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = formatter(value);
};

/* Petit utilitaire pour rendre un message dans un .summary-box. */
const setSummary = (id, html) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html;
};
