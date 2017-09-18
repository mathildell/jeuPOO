
Here are the tasks needed, in chronological order

---

##1. Play mode

>The **play mode** must load a level with a JSON object (called **JSONlevel**) :
1. Parse the JSON to get game functions : preload, create, update, ...
2. Create the Phaser.Game object.

The first step is to create a basic model of the JSONlevel and load it. Here is an example of his structure :

```
level {
    assets { // describe models that can be used several times
        sprites[],
        sounds[],
        images[],
        animations[],
        entities[] // base of players & ennemies (animations, hitboxes, ect)
        players[], // has inputs
        ennemies[], // has behavior / IA
        // ...
    },
    scene {
        camera {
            mode, // centered on players, static, scroll, ect
            shift {x, y}
        }
        grid {
            width,
            height,
            decor[] // image / animation and specify collision
        },
        objects[] // store type of asset, and an initial position
    }
}
```


##2. Editor mode

> The **editor mode** must :

> - Visualize assets and a scene
> - Proposes a user interface to edit the JSONlevel conveniently
> - [Optional] Allows to use custom assets (images, sounds)

The goal of this step is to have an editor which can recreates the JSONlevel used for the step one.


##3. Increment

There are several ways of improving the project :

- Improve the editor :
  - Import & export assets
  - More options to customize the JSONlevel
  - Refactor the user interface
- Create more assets :
  - Sprites & animations
  - Sounds
  - Default entities, players, ennemies
  - Some JSONlevels
- Add functionalities to the engine, usable by the editor :
  - Bevahiors : seek for player, flee, ...
  - Skills : jump, attack, fire bullet, ...
