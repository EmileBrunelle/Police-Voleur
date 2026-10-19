# Policier et voleur 👮🦹

Jeu du policier et du voleur sur un graphe, avec résolution exacte de toutes les positions possibles.

## Règles

- Le policier joue en premier.
- À chaque coup, le joueur dont c’est le tour se déplace vers un nœud voisin.
- Option « Rester sur place permis » (désactivée par défaut) : on peut alors aussi garder sa position.
- Le policier gagne en capturant le voleur, c’est-à-dire quand ils se trouvent sur le même nœud.
- Si une même position revient 3 fois, la partie est finie : le voleur s’échappe.

## Utilisation

- **Modes** : « Je suis le voleur », « Je suis le policier » ou « IA contre IA ».
- **Commencer** lance la partie; **Recommencer** la réinitialise.
- **Placer** permet de choisir soi-même les nœuds de départ du policier et du voleur.
- **Carte de danger** colore les nœuds : en rouge, la capture est forcée (avec le nombre de coups); en vert, le voleur serait en sécurité s’il s’y tenait.

## Ce qu’on a découvert

- **Avec le droit de rester sur place**, un seul policier ne peut pas forcer la capture. Le graphe n’est pas démontable : après avoir retiré le coin J, tout le reste est pris dans des carrés (A-B-F-I, B-C-G-F, C-D-H-G, D-E-K-H) où le voleur peut toujours esquiver.
- **Sans ce droit**, le triangle H-J-K (un cycle impair) permet au policier de changer la parité de la poursuite et de gagner. Depuis le départ (policier en F, voleur en A), la capture est forcée en 15 coups au maximum, où un coup est le déplacement d’un seul joueur.

## D'où vient ce jeu ?

C'est le jeu des **« Cops and Robbers »** (policiers et voleur) sur les graphes, introduit indépendamment par Alain Quilliot (thèse, Université Paris VI, 1978 [^q]) et par Richard Nowakowski et Peter Winkler (« Vertex-to-vertex pursuit in a graph », *Discrete Mathematics*, vol. 43, 1983, p. 235-239 [^nw]). Un graphe où un seul policier peut toujours attraper le voleur est dit *cop-win* ; les deux travaux montrent que ce sont exactement les graphes qui admettent un ordre de démantèlement [^cw] — d'où le « graphe non démontable » plus haut.

- **Nombre de policiers** : le plus petit nombre de policiers qui garantit la capture sur un graphe. Aigner et Fromme (« A game of cops and robbers », *Discrete Applied Mathematics*, vol. 8, 1984, p. 1-12) ont montré que trois policiers suffisent sur tout graphe planaire [^af].
- **Conjecture de Meyniel** : tout graphe connexe à *n* sommets aurait un nombre de policiers en O(√n). Elle est toujours ouverte [^mey].
- **Variante « on doit toujours bouger »** : c'est le jeu *fully active* étudié par Gromovikov, Kinnersley et Seamone (*Australasian Journal of Combinatorics*, vol. 76(2), 2020, p. 248-265), où chaque joueur doit se déplacer vers un sommet voisin à chaque tour [^fa]. Ils y relient la parité au caractère biparti du graphe : dans un graphe non biparti, les policiers peuvent passer de n'importe quelle configuration à n'importe quelle autre.
- **Notre observation** (pas tirée d'une source) : dans notre graphe, le triangle H-J-K est un cycle impair. Il permet au policier de changer la parité de sa distance au voleur, d'où la capture forcée en 15 déplacements quand personne ne peut rester sur place.

Pour aller plus loin : A. Bonato et R. Nowakowski, *The Game of Cops and Robbers on Graphs*, American Mathematical Society, coll. « Student Mathematical Library », vol. 61, 2011 [^bn].

[^q]: A. Quilliot, *Jeux et pointes fixes sur les graphes*, thèse, Université de Paris VI, 1978 — citée d'après https://arxiv.org/abs/1607.03471
[^nw]: https://doi.org/10.1016/0012-365X(83)90160-7
[^cw]: https://arxiv.org/abs/1607.03471 (théorème 6.7)
[^af]: https://arxiv.org/abs/1507.01023
[^mey]: https://arxiv.org/abs/1507.01023
[^fa]: https://arxiv.org/abs/1808.06734 et https://ajc-new.maths.uq.edu.au/v76.p248
[^bn]: https://anthonybonato.com/book/the-game-of-cops-and-robbers-on-graphs/

## Comment ça marche

Le solveur fait une analyse rétrograde sur tous les états possibles (position du policier, position du voleur, tour de jeu) : on part des états de capture, puis on remonte pour déterminer quels états sont gagnants pour le policier et en combien de coups. Ce sont des fonctions pures, dans `src/solver.ts`.

## Lancer le projet

```bash
npm install
npm run dev     # serveur de développement
npm test        # tests (Vitest)
npm run build   # build de production
```

## Technologies

Vue 3, Vite, TypeScript, UnoCSS, Vuetify0 (`@vuetify/v0`), Vitest.

## Licence

MIT — voir [LICENSE](LICENSE).

Monté au fameux local SH-R320 à SH-R345 de l’UQAM.
