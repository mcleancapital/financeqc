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
