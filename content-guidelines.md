# FinanceQc — Charte éditoriale

Document interne. Ces règles s'appliquent à tout nouveau contenu : calculatrices, guides, scénarios, glossaire et pages /questions/.

---

## 1. Mission

FinanceQc fournit aux Québécois des **outils financiers gratuits, simples et adaptés à leur fiscalité**, sans inscription, sans publicité agressive, sans collecte de données. Le ton est sobre, professionnel et pédagogique — jamais commercial.

---

## 2. Ton et style

- **Vouvoiement** systématique. Adresse directe au lecteur (« vous »).
- **Phrases courtes**, vocabulaire accessible. On évite le jargon non expliqué.
- **Français du Québec** : on dit « impôt provincial », « société par actions », « droit de cotisation », « hypothèque », pas « mortgage » ni « tax bracket ».
- **Aucune promesse de gain** : pas de « devenez riche », pas de « optimisez vos placements », pas de « stratégie gagnante ».
- **Approximation assumée** : chaque page rappelle que les résultats sont des ordres de grandeur.
- **Neutralité** : on ne recommande pas de produit, de courtier, de banque, ni de conseiller. Si un nom apparaît, c'est à titre d'exemple uniquement.

---

## 3. Structure des pages

### 3.1 Calculatrice (`/calculatrices/*.html`)

Sections obligatoires, dans cet ordre :

1. **Hero compact** : titre H1 explicite, courte description (1–2 phrases).
2. **Fil d'Ariane** : Accueil › Calculatrices › [titre].
3. **Formulaire** : `.calc-layout > .form-card`. Champs avec `<label>` et `.hint` quand pertinent.
4. **Résultats** : `.results-card` avec `.results-grid` de `.result-tile` + `.summary-box` explicatif.
5. **Comment ça fonctionne** : 2–3 paragraphes sur la méthode, les hypothèses, les limites.
6. **Avertissement** : `.notice` ou rappel court (« Information générale seulement »).
7. **Calculateurs et guides reliés** : `.related` avec 3 calculateurs + 2 guides + 2 questions.
8. **Footer + bandeau de confiance** standard.

### 3.2 Guide (`/guides/*.html`)

1. Hero compact + meta-row (temps de lecture, date).
2. Table des matières (`.toc`) si > 800 mots.
3. Article (`.article-content`) découpé en H2 numérotables.
4. Au moins **un callout** par section (`.callout`, `.callout-tip`, `.callout-warn`, `.callout-example`).
5. Exemples chiffrés concrets (Marie, 32 ans, revenu 65 000 $...).
6. **FAQ** courte (3–6 questions) avec balisage JSON-LD `FAQPage`.
7. Liens vers les calculatrices pertinentes.

### 3.3 Page de scénario (`/scenarios.html#...`)

Chaque scénario doit contenir :

- **Profil** : 1 phrase (qui, âge approximatif, contexte).
- **Recommandations** : liste des calculateurs à utiliser, dans l'ordre.
- **Pièges fréquents** : bloc `.scenario-pitfalls`, 2–4 puces.
- **Liens internes** : au moins 3 (calculateurs, guides, glossaire).

### 3.4 Page de question longue traîne (`/questions/*.html`)

- 500–900 mots.
- Réponse directe à la question dès le premier paragraphe.
- 3 liens internes minimum (calculatrice + guide + glossaire ou autre question).
- FAQ courte.
- Pointe vers UN calculateur pertinent en CTA.
- Balisage JSON-LD `FAQPage` quand applicable.

### 3.5 Glossaire

Chaque terme :

- **Définition** simple en 1–3 phrases.
- **Exemple** concret québécois quand pertinent (`.term-example`).
- **Lien** vers calculateur ou guide pertinent (`.term-link`).

---

## 4. Règles SEO

- **`<title>`** : 50–65 caractères, contient le mot-clé principal et « Québec » quand pertinent.
- **`<meta description>`** : 140–160 caractères, action + bénéfice.
- **`<link rel="canonical">`** sur toutes les pages.
- **Open Graph** : `og:type`, `og:title`, `og:description`, `og:locale="fr_CA"`.
- **JSON-LD** :
  - `BreadcrumbList` sur les pages internes.
  - `FAQPage` quand il y a une FAQ.
  - `WebApplication` ou `SoftwareApplication` pour les calculatrices.
- **H1 unique** par page, contenant le mot-clé principal.
- **URLs** en français, en kebab-case, sans accents (`/questions/reer-ou-celi-revenu-60000.html`).
- **Pas de duplicate content** : chaque page traite une question distincte.

---

## 5. Maillage interne

Règle : chaque page de contenu doit avoir **au minimum 3 liens internes pertinents**.

Sources/destinations privilégiées :

| Type de page         | Doit pointer vers                                  |
|----------------------|----------------------------------------------------|
| Calculatrice         | Guide associé + 2 autres calculatrices + glossaire |
| Guide                | Calculatrice associée + 2 autres guides + 1 question |
| Scénario             | 2–4 calculatrices + 1–2 guides                      |
| Question longue traîne | 1 calculatrice + 1 guide + 1 autre question        |
| Glossaire (terme)    | Calculatrice ou guide où le terme est central      |

Anti-règles :

- Pas de lien vers la même page (boucle).
- Pas de plus de 1 lien vers la même destination dans un même paragraphe.
- Texte d'ancre **descriptif** : « calculateur RRQ » plutôt que « cliquez ici ».

---

## 6. Avertissements obligatoires

Doivent apparaître sur toute page proposant un calcul ou une recommandation :

> **Avertissement** : Information générale seulement. Ne constitue pas un conseil fiscal, financier ou juridique. Pour une décision importante, consultez un professionnel autorisé. Ces calculs sont fournis à titre indicatif seulement.

À placer dans un `.notice` en bas de page (avant le footer).

Le bandeau de confiance (`.trust-strip`) doit également être présent **au-dessus du footer** sur toutes les pages.

---

## 7. Règles pour nouveaux calculateurs

Avant de créer un nouveau calculateur, vérifier :

1. **Pertinence québécoise** : le sujet a-t-il une particularité québécoise (RRQ, Québec, RAMQ, RREGOP, fiscalité provinciale)? Si non, est-ce un sujet financier universel suffisamment demandé? Si non plus, ne pas créer.
2. **Donnée d'entrée minimale** : au plus 6–8 champs. Au-delà, l'utilisateur abandonne.
3. **Hypothèses explicites** : tout taux fixé doit être visible et idéalement modifiable.
4. **Aucun appel réseau** : tout calcul doit s'exécuter en JavaScript dans le navigateur. Pas de fetch, pas de localStorage de données utilisateur.
5. **Helpers** : utiliser les fonctions de `assets/js/main.js` (`formatCAD`, `futureValue`, `mortgagePayment`, etc.). Ne pas redéfinir.
6. **Test mental** : avec des entrées « zéro », « énorme » et « négatives », le résultat reste-t-il sensé? Si non, ajouter des bornes.
7. **Mise à jour annuelle** : tout taux ou plafond fiscal doit être daté dans une note (« paramètres 2026 »).

---

## 8. Confidentialité

- Aucune analytique tierce sans consentement explicite.
- Aucun cookie hors strictement nécessaire au fonctionnement.
- Aucune donnée utilisateur transmise hors du navigateur (les calculatrices ne POSTent rien).
- Le bandeau de confiance doit refléter ces engagements.

---

## 9. Mises à jour

Cette charte est révisée à chaque phase majeure du site. Toute proposition de modification doit être justifiée par un cas d'usage observé.

Dernière révision : 2026.
