/* =========================================================
   FinanceQc — calculators.js
   Logique des quatre calculateurs côté client.

   IMPORTANT — Tous les calculs sont des APPROXIMATIONS.
   Les taux d'imposition réels au Québec dépendent du revenu,
   des paliers fédéral + provincial, des crédits, des cotisations
   sociales (RRQ, AE, RQAP), du gross-up des dividendes, etc.
   On laisse l'utilisateur saisir des taux marginaux ESTIMÉS
   pour rester simples et transparents. Les formules détaillées
   pourront être affinées plus tard (voir TODO dans chaque section).
   ========================================================= */

/* ---------- Helpers communs ---------- */

// Valeur future d'un montant unique : FV = PV × (1+r)^n
function futureValueLump(pv, rate, years) {
  return pv * Math.pow(1 + rate, years);
}

// Valeur future d'une série d'annuités de fin d'année :
// FV = PMT × [((1+r)^n - 1) / r]
function futureValueAnnuity(pmt, rate, years) {
  if (rate === 0) return pmt * years;
  return pmt * ((Math.pow(1 + rate, years) - 1) / rate);
}

/* =========================================================
   1) REER vs CELI
   --------------------------------------------------------
   Hypothèse pédagogique courante :
   - Si on cotise X $ au REER, on récupère X × tauxActuel
     en remboursement d'impôt. On suppose que ce remboursement
     est aussi investi (sinon REER et CELI auraient des
     "mises de fonds" effectives différentes).
   - Variante simple présentée : on compare les valeurs nettes
     après impôt à la sortie pour un MÊME montant brut investi.

   REER :
     - Cotisation brute = X
     - Économie d'impôt aujourd'hui = X × tauxActuel
     - Croissance : FV_brut = X × (1+r)^n
     - Retrait imposable : FV_net = FV_brut × (1 - tauxFutur)

   CELI :
     - Cotisation = X (déjà après impôt — on suppose que le
       contribuable a déjà payé l'impôt sur ce revenu)
     - Croissance : FV = X × (1+r)^n  (non imposable)

   Pour rendre la comparaison équitable, on affiche aussi un
   scénario "REER + remboursement réinvesti dans un CELI",
   souvent considéré comme la comparaison "juste".

   TODO futur : intégrer paliers d'imposition Québec/fédéral
   pour estimer automatiquement le taux marginal selon le revenu.
   ========================================================= */

// Estimation du taux marginal combiné fédéral + Québec selon le revenu.
// Approximation pour 2025, après abattement fédéral du Québec (16,5 %).
// Source : taux marginaux combinés couramment cités au Québec.
function estimerTauxMarginalQc(revenu) {
  if (!isFinite(revenu) || revenu <= 18571) return 0;
  if (revenu <= 53255) return 27.53;
  if (revenu <= 55867) return 32.53;
  if (revenu <= 106555) return 37.12;
  if (revenu <= 111733) return 41.12;
  if (revenu <= 129590) return 45.71;
  if (revenu <= 173205) return 47.46;
  if (revenu <= 246752) return 49.97;
  return 53.31;
}

// Met à jour le champ "tauxActuel" en fonction du revenu saisi.
function estimerTauxMarginalActuel() {
  const revenu = readNumber("revenu");
  const tauxEl = document.getElementById("tauxActuel");
  if (!tauxEl) return;
  tauxEl.value = estimerTauxMarginalQc(revenu).toFixed(2);
}

function calcReerCeli() {
  const revenu = readNumber("revenu");
  const montant = readNumber("montant");
  const rendement = toRate(readNumber("rendement"));
  const annees = readNumber("annees");
  const tauxActuel = toRate(readNumber("tauxActuel"));
  const tauxFutur = toRate(readNumber("tauxFutur"));

  // REER
  const economieImpot = montant * tauxActuel;
  const reerBrut = futureValueLump(montant, rendement, annees);
  const reerNet = reerBrut * (1 - tauxFutur);

  // CELI (montant déjà après impôt)
  const celiNet = futureValueLump(montant, rendement, annees);

  // Scénario "REER + remboursement réinvesti en CELI"
  const reerPlusRemboursement =
    reerNet + futureValueLump(economieImpot, rendement, annees);

  // Différence entre REER+remboursement et CELI seul
  const diff = reerPlusRemboursement - celiNet;

  // Rendu
  document.getElementById("r-reer-brut").textContent = formatCAD(reerBrut);
  document.getElementById("r-reer-net").textContent = formatCAD(reerNet);
  document.getElementById("r-celi-net").textContent = formatCAD(celiNet);
  document.getElementById("r-economie").textContent = formatCAD(economieImpot);
  document.getElementById("r-reer-plus").textContent = formatCAD(
    reerPlusRemboursement
  );

  // Résumé textuel
  let verdict;
  if (Math.abs(diff) < 100) {
    verdict =
      "Les deux véhicules donnent un résultat à peu près équivalent dans ce scénario.";
  } else if (diff > 0) {
    verdict = `Le REER serait avantageux d'environ ${formatCAD(
      diff
    )} si le remboursement d'impôt est réinvesti dans un CELI. C'est typique quand votre taux marginal aujourd'hui est plus élevé qu'à la retraite.`;
  } else {
    verdict = `Le CELI serait avantageux d'environ ${formatCAD(
      Math.abs(diff)
    )}. C'est typique quand votre taux marginal futur est plus élevé qu'aujourd'hui (par exemple, jeune contribuable au début de sa carrière).`;
  }

  const summaryEl = document.getElementById("r-summary");
  summaryEl.innerHTML = `
    <strong>Résumé :</strong> ${verdict}<br>
    À hypothèses égales, vous récupérez immédiatement
    <strong>${formatCAD(economieImpot)}</strong> en remboursement d'impôt
    en cotisant au REER, mais ce montant sera réimposé au retrait à
    <strong>${formatPercent(tauxFutur, 0)}</strong>.
  `;

  document.getElementById("results").hidden = false;
}

/* =========================================================
   1bis) RRQ — Rente du Régime de rentes du Québec
   --------------------------------------------------------
   Approximation pédagogique : la rente RRQ à 65 ans est
   calculée à partir d'un % du « gain admissible moyen »
   (plafonné au MGAP). On simplifie ainsi :

     - Plafond MGAP 2025 ≈ 71 300 $ (gain admissible)
     - Rente max à 65 ans ≈ 1 433 $/mois en 2025
     - Le calcul officiel exige 40 années de cotisation et
       élimine 15 % des moins bonnes années. On simplifie
       avec un facteur de complétude = années / 39, plafonné à 1.
     - Le salaire moyen utilisé est plafonné au MGAP.
     - Bonus/pénalité d'âge :
        * Avant 65 ans : -0,6 %/mois (ex. 60 ans = -36 %)
        * Après 65 ans : +0,7 %/mois (ex. 70 ans = +42 %)
        * Plage : 60-72 ans

   Formule simplifiée :
     gainPlafonne = min(salaireMoyen, MGAP)
     rente65 = renteMax × (gainPlafonne / MGAP) × min(annees / 39, 1)
     facteurAge = 1 + 0,007 × (ageRetraite - 65)   si ≥ 65
                 = 1 + 0,006 × (ageRetraite - 65)   si < 65
     rente = rente65 × facteurAge
   ========================================================= */
function calcRRQ() {
  const ageActuel = readNumber("ageActuel");
  const ageRetraite = readNumber("ageRetraite");
  const salaireMoyen = readNumber("salaireMoyen");
  const annees = readNumber("anneesTravaillees");

  const MGAP_2025 = 71300;
  const RENTE_MAX_MENSUELLE_65 = 1433;

  const gainPlafonne = Math.min(salaireMoyen, MGAP_2025);
  const facteurCotisation = Math.min(annees / 39, 1);
  const rente65 =
    RENTE_MAX_MENSUELLE_65 * (gainPlafonne / MGAP_2025) * facteurCotisation;

  let facteurAge;
  const ageBorne = Math.max(60, Math.min(72, ageRetraite));
  if (ageBorne >= 65) {
    facteurAge = 1 + 0.007 * (ageBorne - 65);
  } else {
    facteurAge = 1 - 0.006 * (65 - ageBorne);
  }

  const renteMensuelle = Math.max(0, rente65 * facteurAge);
  const renteAnnuelle = renteMensuelle * 12;

  document.getElementById("r-rrq-mois").textContent = formatCAD(renteMensuelle);
  document.getElementById("r-rrq-annee").textContent = formatCAD(renteAnnuelle);
  document.getElementById("r-rrq-base").textContent = formatCAD(rente65);
  document.getElementById("r-rrq-facteur").textContent = formatPercent(
    facteurAge - 1,
    1
  );

  let pctMax = (renteMensuelle / RENTE_MAX_MENSUELLE_65) * 100;
  pctMax = Math.max(0, Math.min(100, pctMax));

  let texte;
  if (ageBorne < 65) {
    texte = `À ${ageBorne} ans, votre rente est <strong>réduite</strong> de ${formatPercent(
      1 - facteurAge,
      1
    )} par rapport à 65 ans (-0,6 %/mois). Patienter quelques années peut considérablement augmenter le montant à vie.`;
  } else if (ageBorne > 65) {
    texte = `En reportant à ${ageBorne} ans, votre rente est <strong>bonifiée</strong> de ${formatPercent(
      facteurAge - 1,
      1
    )} (+0,7 %/mois jusqu'à 72 ans). Cette bonification est garantie et indexée à vie.`;
  } else {
    texte =
      "Vous prenez votre rente à l'âge « pivot » de 65 ans : pas de réduction ni de bonification.";
  }

  document.getElementById("r-summary").innerHTML = `
    <strong>Résumé :</strong> environ <strong>${formatCAD(
      renteMensuelle
    )}/mois</strong> (~${pctMax.toFixed(
      0
    )} % du maximum 2025). ${texte}<br><br>
    <em>Estimation simplifiée. Le calcul officiel élimine 15 % des plus
    faibles années, intègre les périodes pour soins aux enfants, et tient
    compte du salaire admissible année par année. Pour un calcul précis,
    consultez votre relevé de participation à
    <a href="https://www.retraitequebec.gouv.qc.ca/" target="_blank" rel="noopener">Retraite Québec</a>.</em>
  `;

  document.getElementById("results").hidden = false;
}

/* =========================================================
   1ter) PSV + SRG (Pension de la sécurité de la vieillesse
                    + Supplément de revenu garanti)
   --------------------------------------------------------
   Approximation 2025 (chiffres trimestriels arrondis) :
     - PSV maximale (65-74 ans) : ~727 $/mois
     - PSV bonifiée (75 ans+)   : ~800 $/mois (≈ +10 %)
     - Récupération PSV : 15 % du revenu individuel net
       au-dessus de ~93 454 $. Pleine récupération vers
       151 668 $ (65-74 ans) ou 157 490 $ (75 ans+).

   SRG (très simplifié) :
     - Personne seule : max ~1 086 $/mois
     - Couple (les 2 reçoivent PSV) : max ~654 $/mois chacun
     - Réduction d'environ 0,50 $ par dollar de revenu hors PSV
       (la formule réelle a plusieurs paliers et types de revenus).
     - Seuils de coupure approximatifs :
        * Seul : revenu hors PSV ≈ 22 056 $
        * Couple : revenu combiné hors PSV ≈ 29 136 $

   On utilise des formules simplifiées et claires pour le citoyen.
   ========================================================= */
function calcOasGis() {
  const revenu = readNumber("revenuRetraite"); // revenu personnel hors PSV
  const age = readNumber("ageActuel");
  const situation = document.getElementById("situation").value; // "seul" | "couple"

  const PSV_BASE = 727;
  const PSV_75 = 800;
  const PSV_RECUP_SEUIL = 93454;
  const PSV_RECUP_PLEINE = age >= 75 ? 157490 : 151668;

  const psvMax = age >= 75 ? PSV_75 : PSV_BASE;

  // Récupération PSV : 15 % au-dessus du seuil
  let psvAnnuelle = psvMax * 12;
  let recuperation = 0;
  if (revenu > PSV_RECUP_SEUIL) {
    recuperation = Math.min(psvAnnuelle, (revenu - PSV_RECUP_SEUIL) * 0.15);
    psvAnnuelle = Math.max(0, psvAnnuelle - recuperation);
  }
  const psvMensuelle = psvAnnuelle / 12;

  // SRG (uniquement à partir de 65 ans)
  let srgMax, seuilCoupure;
  if (situation === "couple") {
    srgMax = 654;
    seuilCoupure = 29136;
  } else {
    srgMax = 1086;
    seuilCoupure = 22056;
  }

  let srgMensuelle = 0;
  if (age >= 65) {
    if (revenu < seuilCoupure) {
      srgMensuelle = Math.max(0, srgMax - (revenu / 12) * 0.5);
      srgMensuelle = Math.min(srgMensuelle, srgMax);
    }
  }
  const srgAnnuelle = srgMensuelle * 12;

  const totalMois = psvMensuelle + srgMensuelle;
  const totalAnnee = psvAnnuelle + srgAnnuelle;

  document.getElementById("r-psv-mois").textContent = formatCAD(psvMensuelle);
  document.getElementById("r-srg-mois").textContent = formatCAD(srgMensuelle);
  document.getElementById("r-total-mois").textContent = formatCAD(totalMois);
  document.getElementById("r-total-annee").textContent = formatCAD(totalAnnee);
  document.getElementById("r-recup").textContent = formatCAD(recuperation);

  let texte;
  if (age < 65) {
    texte = `À ${age} ans, vous n'êtes pas encore admissible à la PSV (65 ans) ni au SRG. Le calcul ci-dessus suppose que vous y êtes admissible : il sert à projeter le revenu futur.`;
  } else if (recuperation > 0 && srgMensuelle === 0) {
    texte = `Votre revenu dépasse le seuil de récupération de la PSV (~${formatCAD(
      PSV_RECUP_SEUIL
    )}). Vous perdez environ <strong>${formatCAD(
      recuperation
    )}/an</strong> de PSV. Stratégie classique : générer plus de revenu via CELI (non imposable) plutôt que via REER/FERR pour rester sous le seuil.`;
  } else if (srgMensuelle > 0) {
    texte = `Votre revenu vous donne droit à du SRG : un revenu non imposable très avantageux. <strong>Attention</strong> : un retrait REER ou un revenu d'intérêt supplémentaire peut faire chuter rapidement votre SRG (taux marginal effectif de 50 %+).`;
  } else {
    texte =
      "Vous touchez la PSV pleine, sans SRG. C'est la situation la plus fréquente pour un retraité avec un revenu de retraite modeste à moyen.";
  }

  document.getElementById("r-summary").innerHTML = `
    <strong>Résumé :</strong> environ <strong>${formatCAD(
      totalMois
    )}/mois</strong> de prestations fédérales (${formatCAD(
      totalAnnee
    )}/an). ${texte}<br><br>
    <em>Estimation simplifiée. Les chiffres exacts varient chaque
    trimestre et dépendent de votre revenu déclaré l'année précédente
    (et non du revenu courant). Pour un calcul officiel,
    consultez <a href="https://www.canada.ca/fr/services/prestations/pensionspubliques.html" target="_blank" rel="noopener">Service Canada</a>.</em>
  `;

  document.getElementById("results").hidden = false;
}

/* =========================================================
   1quater) Impôt Québec — estimateur simplifié
   --------------------------------------------------------
   Combine paliers fédéraux 2025 + paliers provinciaux QC 2025.
   On applique un montant personnel de base unique (~18 000 $)
   sans modéliser tous les crédits.

   Sources des taux 2025 (approximation) :
     Fédéral : 15 % / 20,5 % / 26 % / 29 % / 33 %
       paliers : 57 375 / 114 750 / 177 882 / 253 414
       Avec abattement Québec de 16,5 %, on multiplie par 0,835.
     Québec : 14 % / 19 % / 24 % / 25,75 %
       paliers : 53 255 / 106 495 / 129 590

   Traitement simplifié des éléments :
     - Salaire : imposable au taux marginal complet
     - Dividendes : on applique un taux effectif global ~35 %
       (ordre de grandeur des dividendes ordinaires bruts au QC)
     - Gains en capital : 50 % imposable au taux marginal
     - Cotisations REER : déduction directe du revenu imposable

   Le résultat est un ordre de grandeur. Pour une déclaration
   réelle, il y a de nombreux crédits et règles spécifiques.
   ========================================================= */
function _impotFederalQc(revenu) {
  if (revenu <= 0) return 0;
  const personnel = 18571;
  const base = Math.max(0, revenu - personnel);
  const paliers = [
    [57375, 0.15],
    [114750, 0.205],
    [177882, 0.26],
    [253414, 0.29],
    [Infinity, 0.33],
  ];
  let restant = base;
  let plancher = 0;
  let impot = 0;
  for (const [haut, taux] of paliers) {
    const tranche = Math.max(
      0,
      Math.min(restant + plancher, haut) - plancher
    );
    impot += tranche * taux;
    if (restant + plancher <= haut) break;
    plancher = haut;
  }
  // Abattement Québec : -16,5 %
  return impot * 0.835;
}

function _impotProvincialQc(revenu) {
  if (revenu <= 0) return 0;
  const personnel = 18571;
  const base = Math.max(0, revenu - personnel);
  const paliers = [
    [53255, 0.14],
    [106495, 0.19],
    [129590, 0.24],
    [Infinity, 0.2575],
  ];
  let plancher = 0;
  let impot = 0;
  for (const [haut, taux] of paliers) {
    const tranche = Math.max(0, Math.min(base, haut) - plancher);
    impot += tranche * taux;
    if (base <= haut) break;
    plancher = haut;
  }
  return impot;
}

function _tauxMarginalCombine(revenuImposable) {
  // Approximation : on calcule l'impôt à revenu et à revenu+100, puis (delta/100).
  const i1 = _impotFederalQc(revenuImposable) + _impotProvincialQc(revenuImposable);
  const i2 =
    _impotFederalQc(revenuImposable + 100) +
    _impotProvincialQc(revenuImposable + 100);
  return (i2 - i1) / 100;
}

function calcImpotQc() {
  const salaire = readNumber("salaire");
  const dividendes = readNumber("dividendes");
  const gains = readNumber("gainsCapital");
  const reer = readNumber("cotisationReer");

  const revenuImposable = Math.max(
    0,
    salaire + 0.5 * gains - reer
  );

  const impotSalaire =
    _impotFederalQc(revenuImposable) + _impotProvincialQc(revenuImposable);

  // Dividendes ordinaires : taux effectif simplifié ~35 %
  const TAUX_DIV_EFFECTIF = 0.35;
  const impotDiv = dividendes * TAUX_DIV_EFFECTIF;

  const impotTotal = impotSalaire + impotDiv;
  const revenuBrut = salaire + dividendes + gains;
  const revenuNet = revenuBrut - impotTotal;
  const tauxEffectif = revenuBrut > 0 ? impotTotal / revenuBrut : 0;
  const tauxMarginal = _tauxMarginalCombine(revenuImposable);

  document.getElementById("r-impot-total").textContent = formatCAD(impotTotal);
  document.getElementById("r-revenu-net").textContent = formatCAD(revenuNet);
  document.getElementById("r-taux-marginal").textContent = formatPercent(
    tauxMarginal,
    1
  );
  document.getElementById("r-taux-effectif").textContent = formatPercent(
    tauxEffectif,
    1
  );
  document.getElementById("r-revenu-imposable").textContent = formatCAD(
    revenuImposable
  );

  let conseil = "";
  if (reer === 0 && tauxMarginal >= 0.37) {
    conseil =
      "Votre taux marginal est élevé : chaque 1 000 $ cotisé au REER vous économise ~" +
      formatCAD(1000 * tauxMarginal) +
      " d'impôt cette année. Voyez si vous avez des droits inutilisés.";
  } else if (tauxMarginal <= 0.28) {
    conseil =
      "Votre taux marginal est bas. Le CELI est souvent plus avantageux que le REER dans cette zone : la déduction REER aurait peu de valeur.";
  } else {
    conseil =
      "Votre taux marginal est modéré. La règle générale : REER si vous prévoyez retirer à un taux plus bas; sinon, CELI.";
  }

  document.getElementById("r-summary").innerHTML = `
    <strong>Résumé :</strong> sur un revenu brut de
    <strong>${formatCAD(revenuBrut)}</strong>, vous payez environ
    <strong>${formatCAD(impotTotal)}</strong> en impôt fédéral + provincial,
    soit un taux effectif d'environ <strong>${formatPercent(
      tauxEffectif,
      1
    )}</strong>. Votre prochaine tranche de revenu serait imposée à
    environ <strong>${formatPercent(tauxMarginal, 1)}</strong>. ${conseil}<br><br>
    <em>Estimation simplifiée. N'inclut pas le RRQ, le RQAP, l'AE, les
    crédits provinciaux/fédéraux, le crédit pour dividendes détaillé,
    les frais médicaux, les dons, etc. Pour préparer une déclaration,
    utilisez un logiciel certifié ou consultez un comptable.</em>
  `;

  document.getElementById("results").hidden = false;
}

/* =========================================================
   1quinquies) Valeur nette
   --------------------------------------------------------
   Très simple : actifs - passifs, plus visualisation.
   ========================================================= */
function calcValeurNette() {
  const maison = readNumber("maison");
  const placements = readNumber("placements");
  const reer = readNumber("vnReer");
  const celi = readNumber("vnCeli");
  const autres = readNumber("autresActifs");
  const hypotheque = readNumber("hypotheque");
  const dettes = readNumber("dettes");

  const totalActifs = maison + placements + reer + celi + autres;
  const totalPassifs = hypotheque + dettes;
  const valeurNette = totalActifs - totalPassifs;

  document.getElementById("r-actifs").textContent = formatCAD(totalActifs);
  document.getElementById("r-passifs").textContent = formatCAD(totalPassifs);
  document.getElementById("r-valeur-nette").textContent = formatCAD(valeurNette);

  // Construction du graphique horizontal simple
  const segments = [
    { label: "Maison", value: maison, type: "actif" },
    { label: "Placements", value: placements, type: "actif" },
    { label: "REER", value: reer, type: "actif" },
    { label: "CELI", value: celi, type: "actif" },
    { label: "Autres actifs", value: autres, type: "actif" },
    { label: "Hypothèque", value: hypotheque, type: "passif" },
    { label: "Autres dettes", value: dettes, type: "passif" },
  ].filter((s) => s.value > 0);

  const max = Math.max(1, ...segments.map((s) => s.value));
  const chart = document.getElementById("r-chart");
  chart.innerHTML = segments
    .map((s) => {
      const pct = Math.round((s.value / max) * 100);
      const cls = s.type === "passif" ? "neg" : "";
      return `
        <div class="bar-row">
          <div>${s.label}</div>
          <div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
          <div class="bar-amount ${cls}">${
        s.type === "passif" ? "−" : ""
      }${formatCAD(s.value)}</div>
        </div>`;
    })
    .join("");

  let interpretation;
  if (valeurNette < 0) {
    interpretation = `Votre valeur nette est <strong>négative</strong>. C'est normal en début de carrière (hypothèque, prêt étudiant, prêt auto). Concentrez-vous sur le remboursement des dettes au taux le plus élevé et sur l'épargne automatique.`;
  } else if (valeurNette < 100000) {
    interpretation = `Vous bâtissez progressivement votre patrimoine. À ce stade, l'objectif principal est d'éliminer les dettes coûteuses (cartes de crédit, marges) et de remplir d'abord le CELI.`;
  } else if (valeurNette < 500000) {
    interpretation = `Votre patrimoine est solide. C'est typiquement la zone où il faut commencer à structurer activement la fiscalité (REER vs CELI, CELIAPP, gestion des dividendes corporatifs si applicable).`;
  } else if (valeurNette < 1500000) {
    interpretation = `Votre patrimoine est important. La planification fiscale et successorale prend toute son ampleur : assurance-vie, fiducie familiale potentielle, optimisation REER/CELI/non enregistré, planification du décaissement.`;
  } else {
    interpretation = `Patrimoine très significatif. À ce niveau, la majorité des décisions sont fiscales et successorales. La concentration sectorielle (immobilier vs portefeuille liquide) mérite une attention particulière.`;
  }

  // Ratio dettes / actifs
  const ratio = totalActifs > 0 ? totalPassifs / totalActifs : 0;
  let alerteRatio = "";
  if (ratio > 0.6) {
    alerteRatio = `<br><strong>Ratio dettes/actifs élevé</strong> (${formatPercent(
      ratio,
      0
    )}). Une part importante de votre bilan dépend du levier — surveillez votre coussin de liquidités.`;
  }

  document.getElementById("r-summary").innerHTML = `
    <strong>Valeur nette estimée :</strong> ${formatCAD(
      valeurNette
    )}. ${interpretation}${alerteRatio}<br><br>
    <em>La valeur nette est un indicateur, pas une cible. À évaluer
    avec votre situation : revenu, âge, objectifs de retraite,
    nombre de personnes à charge.</em>
  `;

  document.getElementById("results").hidden = false;
}

/* =========================================================
   2) Salaire vs Dividendes
   --------------------------------------------------------
   Modèle simplifié d'une PME québécoise :
     - Revenu brut disponible dans la société : C
     - Salaire choisi (déductible pour la société) : S
     - Dividendes choisis (versés à partir du résiduel net) : D
     - Taux d'impôt corporatif effectif (estimé par l'utilisateur)
     - Taux d'impôt personnel sur le salaire (taux marginal)
     - Taux d'impôt personnel effectif sur dividendes
       (souvent ~30-40% pour dividendes ordinaires au Québec, mais
       varie selon le type — déterminés vs non déterminés —
       et le revenu total. À saisir par l'utilisateur.)

   On NE modélise PAS :
     - le gross-up et crédit pour dividendes
     - les cotisations RRQ / RQAP / AE
     - la mécanique du IMRTD pour dividendes non déterminés
     - les acomptes provisionnels

   TODO futur : ajouter paliers d'imposition + gross-up officiel.
   ========================================================= */
function calcSalaireDividendes() {
  const C = readNumber("revenuSociete");
  const S = readNumber("salaire");
  const D = readNumber("dividendes");
  const tauxPerso = toRate(readNumber("tauxPerso"));
  const tauxCorpo = toRate(readNumber("tauxCorpo"));
  const tauxDiv = toRate(readNumber("tauxDiv"));

  // Salaire = dépense déductible
  const baseImposableCorpo = Math.max(0, C - S);
  const impotCorpo = baseImposableCorpo * tauxCorpo;
  const dispoApresImpotCorpo = baseImposableCorpo - impotCorpo;

  // Dividendes versés (ne peuvent excéder le dispo après impôt corpo)
  const divVerses = Math.min(D, Math.max(0, dispoApresImpotCorpo));
  const resteEnSociete = dispoApresImpotCorpo - divVerses;

  // Impôts personnels
  const impotSalaire = S * tauxPerso;
  const impotDiv = divVerses * tauxDiv;
  const impotPersoTotal = impotSalaire + impotDiv;

  // Net dans les poches du contribuable
  const netSalaire = S - impotSalaire;
  const netDiv = divVerses - impotDiv;
  const netTotal = netSalaire + netDiv;

  // Total des impôts payés (corporatif + personnel)
  const impotTotal = impotCorpo + impotPersoTotal;

  // Rendu
  document.getElementById("r-impot-corpo").textContent = formatCAD(impotCorpo);
  document.getElementById("r-impot-perso").textContent = formatCAD(
    impotPersoTotal
  );
  document.getElementById("r-net-salaire").textContent = formatCAD(netSalaire);
  document.getElementById("r-net-div").textContent = formatCAD(netDiv);
  document.getElementById("r-net-total").textContent = formatCAD(netTotal);
  document.getElementById("r-reste-societe").textContent = formatCAD(
    resteEnSociete
  );
  document.getElementById("r-impot-total").textContent = formatCAD(impotTotal);

  // Résumé textuel
  let verdict;
  if (S > 0 && divVerses > 0) {
    verdict = `Mix salaire + dividendes : vous conservez environ <strong>${formatCAD(
      netTotal
    )}</strong> nets dans vos poches, et il reste <strong>${formatCAD(
      resteEnSociete
    )}</strong> dans la société.`;
  } else if (S > 0) {
    verdict = `Stratégie 100% salaire : vous conservez environ <strong>${formatCAD(
      netTotal
    )}</strong> nets. Avantage : génère du revenu admissible au RRQ et au REER.`;
  } else if (divVerses > 0) {
    verdict = `Stratégie 100% dividendes : vous conservez environ <strong>${formatCAD(
      netTotal
    )}</strong> nets. Pas de cotisations sociales, mais aucune création de droits REER.`;
  } else {
    verdict =
      "Aucun retrait personnel : tous les fonds restent imposés au niveau corporatif.";
  }

  document.getElementById("r-summary").innerHTML = `
    ${verdict}<br><br>
    <strong>Impôt total payé (société + particulier) : ${formatCAD(
      impotTotal
    )}.</strong> Rappel : il s'agit d'une approximation.
    Les vrais calculs incluent le gross-up des dividendes, le crédit
    d'impôt pour dividendes, le RRQ, le RQAP, l'AE, l'IMRTD et d'autres
    éléments. Consultez votre comptable avant toute décision.
  `;

  document.getElementById("results").hidden = false;
}

/* =========================================================
   3) Calculateur retraite
   --------------------------------------------------------
   Capital à la retraite :
     FV = épargne × (1+r)^n + cotisation × [((1+r)^n - 1)/r]

   Nombre d'années de revenu couvert :
     On suppose que le capital continue à croître au même taux
     pendant le décaissement et qu'on retire un montant fixe
     "revenuSouhaite" chaque année.
     Si revenuSouhaite > capital × r → le capital se vide en :
        n = ln(P / (P - capital × r/revenuSouhaite × ... )) / ln(1+r)
     Formulation explicite (annuités à terme échu) :
        n = -ln(1 - capital × r / revenuSouhaite) / ln(1+r)
     Si capital × r ≥ revenuSouhaite → revenu théoriquement perpétuel.

   TODO futur : intégrer RRQ, PSV, SRG, espérance de vie réelle,
   inflation, et règles de décaissement FERR.
   ========================================================= */
function calcRetraite() {
  const ageActuel = readNumber("ageActuel");
  const ageRetraite = readNumber("ageRetraite");
  const epargne = readNumber("epargne");
  const cotisation = readNumber("cotisation");
  const rendement = toRate(readNumber("rendement"));
  const revenuSouhaite = readNumber("revenuSouhaite");

  const annees = Math.max(0, ageRetraite - ageActuel);

  const capital =
    futureValueLump(epargne, rendement, annees) +
    futureValueAnnuity(cotisation, rendement, annees);

  // Années de revenu couvertes
  let anneesCouvertes;
  let messageDuree;

  if (revenuSouhaite <= 0) {
    anneesCouvertes = Infinity;
    messageDuree = "Indiquez un revenu annuel souhaité pour estimer la durée.";
  } else if (rendement <= 0) {
    anneesCouvertes = capital / revenuSouhaite;
    messageDuree = "Calcul sans rendement supplémentaire au décaissement.";
  } else {
    const ratio = (capital * rendement) / revenuSouhaite;
    if (ratio >= 1) {
      anneesCouvertes = Infinity;
      messageDuree =
        "Votre capital génère plus en intérêts que ce que vous prévoyez retirer : revenu théoriquement perpétuel.";
    } else {
      anneesCouvertes = -Math.log(1 - ratio) / Math.log(1 + rendement);
      messageDuree = `Avec un rendement annuel de ${formatPercent(
        rendement,
        1
      )} pendant le décaissement.`;
    }
  }

  // Écart entre capital obtenu et capital "cible" (≈ 25× le revenu — règle des 4%)
  const capitalCible = revenuSouhaite * 25;
  const ecart = capital - capitalCible;

  // Rendu
  document.getElementById("r-capital").textContent = formatCAD(capital);
  document.getElementById("r-annees-couv").textContent = isFinite(
    anneesCouvertes
  )
    ? `${formatNumber(anneesCouvertes, 1)} ans`
    : "≈ perpétuel";
  document.getElementById("r-ecart").textContent =
    ecart >= 0
      ? `+ ${formatCAD(ecart)}`
      : `− ${formatCAD(Math.abs(ecart))}`;
  document.getElementById("r-cible").textContent = formatCAD(capitalCible);

  let verdict;
  if (ecart >= 0) {
    verdict = `À ce rythme, vous accumuleriez environ <strong>${formatCAD(
      capital
    )}</strong> à ${ageRetraite} ans, ce qui dépasse la cible théorique de la « règle du 4 % » (${formatCAD(
      capitalCible
    )}).`;
  } else {
    verdict = `À ce rythme, il manquerait environ <strong>${formatCAD(
      Math.abs(ecart)
    )}</strong> par rapport à la cible théorique de la règle du 4 % (${formatCAD(
      capitalCible
    )}). Pour combler l'écart, vous pouvez augmenter votre cotisation, retarder votre retraite, ou réviser le revenu souhaité.`;
  }

  document.getElementById("r-summary").innerHTML = `
    ${verdict}<br><br>
    <em>${messageDuree}</em><br>
    Ce calcul ne tient pas compte du RRQ, de la PSV, du SRG ni de l'inflation.
  `;

  document.getElementById("results").hidden = false;
}

/* =========================================================
   4) Hypothèque vs investissement
   --------------------------------------------------------
   Question simplifiée : si vous avez M $ disponibles et que
   votre solde hypothécaire est plus grand que M, vaut-il mieux :
     A) Rembourser le capital hypothécaire ?
     B) Investir le montant ?

   On compare les deux scénarios à valeur future, sur N années.
   Hypothèse simplificatrice : on suppose que rembourser M sur
   le capital permet d'éviter de payer "rate × M" composé pendant
   N années. C'est une APPROXIMATION : en réalité, le calcul
   exact dépend du calendrier de paiement et de la fréquence de
   composition. On utilise une composition annuelle pour rester
   simple et lisible.

     - Économie d'intérêt approximative ≈ M × (1+rateHypo)^N − M
     - Valeur future si investi ≈ M × (1+rateInvest)^N − M
     - Différence = invest − économie

   TODO futur : ajouter l'amortissement réel et la fiscalité
   différentielle (CELI/REER/non enregistré).
   ========================================================= */
function calcHypothequeVsInvest() {
  const solde = readNumber("solde");
  const tauxHypo = toRate(readNumber("tauxHypo"));
  const montant = readNumber("montant");
  const rendement = toRate(readNumber("rendement"));
  const annees = readNumber("annees");

  // On limite l'application aux fonds qui peuvent réellement
  // être appliqués au capital
  const M = Math.min(montant, solde);

  const futurDette = futureValueLump(M, tauxHypo, annees);
  const economieInteret = futurDette - M;

  const futurInvesti = futureValueLump(montant, rendement, annees);
  const gainInvest = futurInvesti - montant;

  // Comparaison "à montant utilisé identique" : on compare les gains
  // (économies vs croissance) sur la portion qui aurait été appliquée.
  const futurInvestiSurM = futureValueLump(M, rendement, annees);
  const gainInvestSurM = futurInvestiSurM - M;

  const difference = gainInvestSurM - economieInteret;

  // Rendu
  document.getElementById("r-economie").textContent = formatCAD(
    economieInteret
  );
  document.getElementById("r-fv-invest").textContent = formatCAD(futurInvesti);
  document.getElementById("r-gain-invest").textContent = formatCAD(gainInvest);
  document.getElementById("r-difference").textContent =
    difference >= 0
      ? `+ ${formatCAD(difference)} en faveur de l'investissement`
      : `+ ${formatCAD(Math.abs(difference))} en faveur du remboursement`;

  let verdict;
  if (Math.abs(difference) < 200) {
    verdict =
      "Les deux options donnent un résultat très semblable dans ce scénario. La décision peut alors se prendre selon votre tolérance au risque et votre confort psychologique avec une dette.";
  } else if (difference > 0) {
    verdict = `Mathématiquement, investir le montant rapporterait environ <strong>${formatCAD(
      difference
    )}</strong> de plus que de l'appliquer sur l'hypothèque, parce que votre rendement attendu (${formatPercent(
      rendement,
      1
    )}) dépasse votre taux hypothécaire (${formatPercent(
      tauxHypo,
      1
    )}). Attention : ce gain n'est pas garanti.`;
  } else {
    verdict = `Rembourser l'hypothèque rapporterait environ <strong>${formatCAD(
      Math.abs(difference)
    )}</strong> de plus, parce que votre taux hypothécaire (${formatPercent(
      tauxHypo,
      1
    )}) dépasse le rendement attendu (${formatPercent(
      rendement,
      1
    )}). En prime, l'« économie d'intérêt » est garantie.`;
  }

  document.getElementById("r-summary").innerHTML = `
    ${verdict}<br><br>
    <em>Ce calcul est une approximation à composition annuelle.
    Il ne tient pas compte de la fiscalité (CELI/REER/non enregistré),
    de la volatilité réelle des marchés, ni du calendrier exact de vos paiements hypothécaires.</em>
  `;

  document.getElementById("results").hidden = false;
}
