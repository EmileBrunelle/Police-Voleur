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

Monté au fameux local SH-R320 à SH-R345 de l’UQAM.
