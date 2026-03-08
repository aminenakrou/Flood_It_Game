# 🎨 Flood It Game

> Une application web interactive développée en **HTML**, **CSS** et **JavaScript** qui reproduit le jeu de réflexion **Flood It**, avec configuration dynamique de la grille, mode défi, interface responsive et déploiement en ligne via GitHub Pages.

---

## 🌐 Démo en ligne

👉 **Tester l'application ici :**  
[https://aminenakrou.github.io/Flood_It_Game/](https://aminenakrou.github.io/Flood_It_Game/)

---

## 📖 Présentation du projet

**Flood It Game** est un mini-jeu web de réflexion dans lequel le joueur doit remplir toute la grille avec une seule couleur en un minimum de coups.

Le projet a été conçu comme une application front-end interactive permettant de :
- générer une grille colorée aléatoire ;
- choisir la taille du plateau ;
- sélectionner le nombre de couleurs ;
- activer un mode défi ;
- suivre le nombre de coups joués en temps réel ;
- jouer directement dans le navigateur sans installation complexe.

Ce projet met en avant plusieurs compétences clés en développement web :
- structuration d’interface avec **HTML5** ;
- mise en forme avec **CSS3** ;
- logique applicative en **JavaScript** ;
- manipulation du **DOM** ;
- gestion des événements utilisateur ;
- intégration d’une interface responsive avec **Bootstrap**.

---

## 🎯 Objectifs du projet

L’objectif principal est de proposer une version simple, visuelle et fonctionnelle du jeu **Flood It**, tout en mettant en pratique des notions importantes de développement front-end.

Les objectifs techniques sont les suivants :

- créer une interface claire et accessible ;
- permettre une interaction utilisateur fluide ;
- générer dynamiquement une grille de jeu ;
- implémenter un algorithme de remplissage de type **flood fill** ;
- gérer les conditions de victoire et d’échec ;
- offrir une expérience ludique avec un mode classique et un mode défi.

---

## 🧠 Règles du jeu

Le principe du jeu est simple :

1. Une grille composée de plusieurs couleurs est générée aléatoirement.
2. Le joueur choisit une couleur parmi celles proposées dans la palette.
3. La zone connectée concernée est remplacée par la couleur sélectionnée.
4. Le nombre de coups augmente à chaque action.
5. Le joueur gagne lorsque toute la grille devient d’une seule couleur.

### Mode classique
En mode classique, le joueur peut prendre autant de coups qu’il le souhaite pour terminer la grille.

### Mode défi
En mode défi, le joueur doit réussir à uniformiser toute la grille dans une limite de **`2L` coups**, où `L` représente la taille de la grille.

---

## ✨ Fonctionnalités

Le projet inclut les fonctionnalités suivantes :

- ✅ Génération aléatoire d’une nouvelle grille à chaque partie
- ✅ Taille de grille configurable entre 5 et 50
- ✅ Nombre de couleurs configurable entre 2 et 10
- ✅ Palette de couleurs cliquable
- ✅ Affichage dynamique de la grille
- ✅ Compteur de coups mis à jour en temps réel
- ✅ Détection automatique de la victoire
- ✅ Gestion du mode défi avec limite de coups
- ✅ Fenêtre modale d’information
- ✅ Interface stylisée avec Bootstrap et CSS personnalisé
- ✅ Déploiement et test en ligne via GitHub Pages

---

## 🛠️ Technologies utilisées

Ce projet repose sur les technologies suivantes :

### Front-end
- **HTML5**
- **CSS3**
- **JavaScript**

### Bibliothèques / Frameworks
- **Bootstrap 4**
- **jQuery**
- **Popper.js**

### Déploiement
- **GitHub Pages**

---

## 📂 Structure du projet

```bash
.
├── index.html
├── styles.css
├── script.js
└── README.md
