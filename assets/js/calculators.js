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
