/* =========================================================
   FinanceQc — search-data.js
   Index local (côté client). Les URL sont relatives à la
   racine du site. Le prefixe est ajouté à l'exécution selon
   data-search-base sur le conteneur de recherche.
   ========================================================= */
window.SEARCH_DATA = [
  // --- Calculatrices ---
  { type: "Calculatrice", title: "REER vs CELI", desc: "Comparez la valeur future nette d'un REER et d'un CELI selon vos taux d'imposition actuel et futur.", url: "calculatrices/reer-vs-celi.html", keywords: ["reer","celi","comparer","taux marginal","retraite","epargne"] },
  { type: "Calculatrice", title: "CELIAPP", desc: "Estimez votre économie d'impôt et votre mise de fonds future avec le CELIAPP.", url: "calculatrices/celiapp.html", keywords: ["celiapp","premiere maison","mise de fonds","compte achat propriete","fhsa"] },
  { type: "Calculatrice", title: "Rente RRQ", desc: "Estimez votre rente du Régime de rentes du Québec selon votre salaire moyen et votre âge de départ.", url: "calculatrices/rrq.html", keywords: ["rrq","rente","retraite quebec","60 ans","65 ans","72 ans"] },
  { type: "Calculatrice", title: "PSV + SRG", desc: "Estimation de la Pension de la sécurité de la vieillesse et du Supplément de revenu garanti.", url: "calculatrices/oas-gis.html", keywords: ["psv","srg","oas","gis","pension securite vieillesse","supplement revenu garanti"] },
  { type: "Calculatrice", title: "Capital retraite", desc: "Estimez votre capital à la retraite et combien d'années de revenu il pourrait couvrir.", url: "calculatrices/retraite.html", keywords: ["retraite","capital","decaissement","regle 4 pourcent"] },
  { type: "Calculatrice", title: "Impôt Québec", desc: "Estimateur d'impôt simplifié : combinaison salaire, dividendes, gains en capital et REER.", url: "calculatrices/impot-quebec.html", keywords: ["impot","quebec","taux marginal","federal","provincial","salaire net"] },
  { type: "Calculatrice", title: "Valeur nette", desc: "Faites le bilan rapide de vos actifs et de vos dettes pour visualiser votre patrimoine net.", url: "calculatrices/valeur-nette.html", keywords: ["valeur nette","actifs","passifs","patrimoine","bilan"] },
  { type: "Calculatrice", title: "Épargne mensuelle", desc: "Pour un objectif financier donné, calculez la cotisation mensuelle requise et la sensibilité au rendement.", url: "calculatrices/epargne-mensuelle.html", keywords: ["epargne","mensuel","objectif","mise de fonds","retraite","placement"] },
  { type: "Calculatrice", title: "Inflation", desc: "Mesurez l'impact de l'inflation sur votre pouvoir d'achat futur.", url: "calculatrices/inflation.html", keywords: ["inflation","pouvoir d achat","ipc","cout de la vie"] },
  { type: "Calculatrice", title: "Salaire vs dividendes", desc: "Estimez l'impôt corporatif et personnel d'une stratégie salaire, dividendes ou mixte pour votre PME québécoise.", url: "calculatrices/salaire-vs-dividendes.html", keywords: ["salaire","dividendes","pme","spcc","entrepreneur","remuneration"] },
  { type: "Calculatrice", title: "Hypothèque vs investissement", desc: "Faut-il rembourser l'hypothèque plus vite ou investir? Comparez sur votre horizon.", url: "calculatrices/hypotheque-vs-investissement.html", keywords: ["hypotheque","mortgage","investir","placement","remboursement"] },

  // --- Guides ---
  { type: "Guide", title: "REER ou CELI : guide complet", desc: "Avantages, scénarios, erreurs fréquentes et règles simples pour décider entre REER et CELI au Québec.", url: "guides/reer-ou-celi.html", keywords: ["guide","reer","celi","decision","taux marginal"] },
  { type: "Guide", title: "Salaire vs dividendes pour entrepreneurs", desc: "Stratégies de rémunération en société par actions au Québec : avantages, pièges, mix optimal.", url: "guides/salaire-vs-dividende.html", keywords: ["guide","salaire","dividendes","pme","spcc","entrepreneur"] },
  { type: "Guide", title: "Retraite au Québec", desc: "RRQ, PSV, SRG, FERR, règle du 4 % et bons ordres de grandeur selon votre style de vie.", url: "guides/retraite-quebec.html", keywords: ["guide","retraite","quebec","rrq","psv","ferr"] },
  { type: "Guide", title: "Acheter ou louer au Québec", desc: "Analyse mathématique, coûts cachés et seuils où chaque option l'emporte.", url: "guides/acheter-ou-louer.html", keywords: ["guide","acheter","louer","immobilier","propriete","logement"] },

  // --- Scénarios ---
  { type: "Scénario", title: "12 scénarios québécois", desc: "Pour chaque profil typique, quels outils utiliser et quels pièges éviter.", url: "scenarios.html", keywords: ["scenarios","jeune professionnel","couple","entrepreneur","retraite","famille","autonome","duplex","bonus"] },

  // --- Glossaire (page) + termes phares ---
  { type: "Glossaire", title: "Glossaire financier québécois", desc: "60 termes financiers et fiscaux définis simplement avec exemples québécois.", url: "glossaire.html", keywords: ["glossaire","definitions","reer","celi","rrq","psv","srg","ferr","celiapp","gain capital","dividende"] },
  { type: "Terme", title: "REER — définition", desc: "Régime enregistré d'épargne-retraite.", url: "glossaire.html#reer", keywords: ["reer","regime epargne retraite"] },
  { type: "Terme", title: "CELI — définition", desc: "Compte d'épargne libre d'impôt.", url: "glossaire.html#celi", keywords: ["celi","compte epargne libre impot"] },
  { type: "Terme", title: "CELIAPP — définition", desc: "Compte d'épargne libre d'impôt pour l'achat d'une première propriété.", url: "glossaire.html#celiapp", keywords: ["celiapp","fhsa","achat premiere propriete"] },
  { type: "Terme", title: "RRQ — définition", desc: "Régime de rentes du Québec.", url: "glossaire.html#rrq", keywords: ["rrq","rente quebec"] },
  { type: "Terme", title: "PSV — définition", desc: "Pension de la sécurité de la vieillesse.", url: "glossaire.html#psv", keywords: ["psv","pension securite vieillesse","oas"] },
  { type: "Terme", title: "SRG — définition", desc: "Supplément de revenu garanti.", url: "glossaire.html#srg", keywords: ["srg","supplement revenu garanti","gis"] },
  { type: "Terme", title: "FERR — définition", desc: "Fonds enregistré de revenu de retraite.", url: "glossaire.html#ferr", keywords: ["ferr","fonds revenu retraite"] },
  { type: "Terme", title: "Taux marginal", desc: "Taux d'imposition sur le prochain dollar gagné.", url: "glossaire.html#taux-marginal", keywords: ["taux marginal","tranche","palier"] },
  { type: "Terme", title: "Gain en capital", desc: "Profit imposable à 50 % réalisé à la vente d'un actif.", url: "glossaire.html#gain-capital", keywords: ["gain capital","plus value","vente"] },
  { type: "Terme", title: "Inflation", desc: "Augmentation générale du niveau des prix.", url: "glossaire.html#inflation", keywords: ["inflation","ipc","cout de la vie","banque du canada"] },
  { type: "Terme", title: "RAP", desc: "Régime d'accession à la propriété.", url: "glossaire.html#rap", keywords: ["rap","regime accession propriete","hbp"] },
  { type: "Terme", title: "RREGOP", desc: "Régime de retraite des employés du gouvernement et des organismes publics.", url: "glossaire.html#rregop", keywords: ["rregop","secteur public","prestations determinees"] },
  { type: "Terme", title: "Valeur nette", desc: "Total des actifs moins total des passifs.", url: "glossaire.html#valeur-nette", keywords: ["valeur nette","patrimoine","bilan"] },

  // --- Questions ---
  { type: "Question", title: "REER ou CELI à 60 000 $ de revenu?", desc: "À ce niveau, le CELI est généralement plus avantageux. Pourquoi et exemple chiffré.", url: "questions/reer-ou-celi-revenu-60000.html", keywords: ["reer","celi","60000","revenu modeste","jeune"] },
  { type: "Question", title: "REER ou CELI à 100 000 $ de revenu?", desc: "Le REER reprend l'avantage à 100 000 $. Conditions et calcul.", url: "questions/reer-ou-celi-revenu-100000.html", keywords: ["reer","celi","100000","revenu eleve","mi carriere"] },
  { type: "Question", title: "CELIAPP ou REER pour acheter une 1re maison?", desc: "Le CELIAPP bat presque toujours le RAP. Comparaison.", url: "questions/celiapp-ou-reer.html", keywords: ["celiapp","reer","rap","premiere maison","achat"] },
  { type: "Question", title: "Combien cotiser au REER par année?", desc: "Plafonds, règle de 18 % et cibles selon votre âge.", url: "questions/combien-cotiser-reer-par-an.html", keywords: ["cotiser reer","18 pourcent","plafond","cibles"] },
  { type: "Question", title: "Retrait REER avant la retraite : impact?", desc: "Retenue à la source, taux marginal, perte des droits.", url: "questions/retrait-reer-impact-impot.html", keywords: ["retrait reer","impot","retenue source","penalite"] },
  { type: "Question", title: "Combien faut-il pour la retraite au Québec?", desc: "Ordres de grandeur réalistes : règle du 4 % et complément RRQ + PSV.", url: "questions/combien-faut-il-pour-retraite-quebec.html", keywords: ["combien retraite","capital","regle 4 pourcent","cible retraite"] },
  { type: "Question", title: "À partir de quel revenu la PSV est-elle récupérée?", desc: "Seuils 2026, taux de récupération et stratégies.", url: "questions/psv-recuperation-revenu.html", keywords: ["psv","recuperation","clawback","seuil","oas"] },
  { type: "Question", title: "SRG : à quel revenu suis-je admissible?", desc: "Plafonds, calcul et pièges fréquents.", url: "questions/srg-revenu-retraite.html", keywords: ["srg","gis","admissibilite","faible revenu","retraite"] },
  { type: "Question", title: "Quand prendre sa rente RRQ : 60, 65 ou 72 ans?", desc: "Bonification, mortalité estimée et qui devrait reporter.", url: "questions/quand-prendre-rrq-60-65-72.html", keywords: ["rrq","60 ans","65 ans","70 ans","72 ans","reporter","bonification"] },
  { type: "Question", title: "FERR : retrait minimum obligatoire?", desc: "Table d'âge, pourcentages et conséquences fiscales.", url: "questions/ferr-retrait-minimum.html", keywords: ["ferr","retrait minimum","pourcentage","71 ans","conversion"] },
  { type: "Question", title: "Fractionner le revenu de retraite avec mon conjoint?", desc: "Règles, économies typiques et quand ça vaut la peine.", url: "questions/couple-fractionnement-revenu-retraite.html", keywords: ["fractionnement","conjoint","revenu pension","65 ans","economies impot"] },
  { type: "Question", title: "Impact de l'inflation sur ma retraite?", desc: "Pouvoir d'achat sur 25 ans, rentes indexées vs non indexées.", url: "questions/inflation-impact-retraite-quebec.html", keywords: ["inflation","retraite","pouvoir achat","rentes indexees"] },
  { type: "Question", title: "Quel est mon taux marginal au Québec?", desc: "Tranches combinées fédéral + provincial par niveau de revenu.", url: "questions/taux-marginal-quebec.html", keywords: ["taux marginal","quebec","tranches","palier","federal provincial"] },
  { type: "Question", title: "Imposition du gain en capital au Québec", desc: "Inclusion à 50 %, exemple chiffré, pertes en capital.", url: "questions/gain-capital-quebec.html", keywords: ["gain capital","quebec","inclusion 50","pertes","placement"] },
  { type: "Question", title: "Dividende déterminé ou non déterminé?", desc: "Différence d'imposition, exemple selon votre tranche.", url: "questions/dividende-determine-non-determine.html", keywords: ["dividende","determine","non determine","pme","crédit impot"] },
  { type: "Question", title: "Salaire de 100 000 $ au Québec : net?", desc: "Décomposition impôt fédéral, provincial, RRQ, RQAP, AE.", url: "questions/salaire-net-100000-quebec.html", keywords: ["salaire net","100000","quebec","retenues","impot"] },
  { type: "Question", title: "Rembourser l'hypothèque ou investir?", desc: "Comparaison nette d'impôt. Exemple chiffré.", url: "questions/hypotheque-ou-investir.html", keywords: ["hypotheque","rembourser","investir","placement","arbitrage"] },
  { type: "Question", title: "REER ou rembourser l'hypothèque?", desc: "L'arbitrage le plus fréquent en mi-carrière.", url: "questions/reer-ou-rembourser-hypotheque.html", keywords: ["reer","hypotheque","rembourser","mi carriere","arbitrage"] },
  { type: "Question", title: "Mise de fonds pour une 1re maison au Québec?", desc: "5 % minimum, seuil 20 %, assurance prêt SCHL.", url: "questions/mise-de-fonds-premiere-maison-quebec.html", keywords: ["mise de fonds","premiere maison","schl","20 pourcent","quebec"] },
  { type: "Question", title: "Salaire ou dividendes pour ma PME?", desc: "Tous les angles : RRQ, REER, RQAP, fractionnement.", url: "questions/salaire-ou-dividendes-pme.html", keywords: ["salaire","dividendes","pme","spcc","remuneration","entrepreneur"] },

  // --- Pages institutionnelles ---
  { type: "Page", title: "À propos de FinanceQc", desc: "Mission, philosophie, confidentialité.", url: "a-propos.html", keywords: ["a propos","mission","equipe","confidentialite"] },
  { type: "Page", title: "Méthodologie", desc: "Comment nos calculateurs fonctionnent et leurs hypothèses.", url: "methodologie.html", keywords: ["methodologie","hypotheses","sources","limites"] },
  { type: "Page", title: "Index des questions", desc: "20 questions financières courantes au Québec.", url: "questions/", keywords: ["questions","faq","index"] }
];
