
# Jeu POO

Projet pour le cours de Programmation Orientée Objet avancée.
Groupe :
 - CONGARD Sidney
 - LUCE Mathilde

Il s'agit d'un éditeur de jeu et d'un moteur de jeu qui permettent respectivement
d'écrire et d'interpréter une structure JSON représentant un monde jouable.

### Installation

Ce projet doit être installé sur un serveur local.
Ses dépendences (notamment Phaser-CE) ont été téléchargées avec npm.

### Vue d'ensemble

Les classes principales sont réparties selon quatre couches :
 - "Model" classes, qui représentent des ressources lourdes (images / animations) et
   informations qui sont ensuite lues par plusieurs classes.
 - "Scene" classes, qui représentent une instance d'objet dans l'éditeur. Ce sont ces
   instances qui construisent les différents objets en jeu.
 - "In-Game" classes, qui représentent les objets en jeu, utilisées par le moteur.
 - "Phaser" classes, les classes provenant du moteur de jeu Phaser-CE utilisées par les
   classes "In-Game".

Le fichier JSON "JSONLevel" représentant un monde jouable (interprétable par le moteur
de jeu et modifiable par l'éditeur) est composé des classes "Model" et "Scene".

Le jeu actualise et agit sur les classes "In-Game" et "Phaser", qui se basent sur les
classes "Scene" et "Model" du fichier JSON.

### Notes

Le projet est en JavaScript (l'intéractivité avec le client-side est notemment géré par jQuery), ce qui rend le code très flexible : certaines interfaces et
fonctionnalités sont implicites, et quelques variables sont rajoutées sur les classes de
Phaser : par exemple, 'myEntity' dans Phaser.Sprite pour retrouver l'entité correspondante
depuis les callback qui passent des Phaser.Sprite en paramètre.

Le diagramme de classe est disponible à la racine du projet.
