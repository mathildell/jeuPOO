
"use strict";

// The JSON level object

const level = new JSONLevel('sandbox');

level.resources.images.push({name: 'hero',   asset: 'assets/hero.png'});
level.resources.images.push({name: 'ground', asset: 'assets/bricks.png'});

level.resources.players.push({name: 'hero', image: 'hero', inputs: [
    {key: keysEnum.left,  action: {type: actionsEnum.moveLeft,  speed: 200}},
    {key: keysEnum.right, action: {type: actionsEnum.moveRight, speed: 200}},
    {key: keysEnum.up,    action: {type: actionsEnum.jump, power: 900}}
]});

level.scene.settings.gravity = 1000;

level.scene.grid.size = 128;
level.scene.grid.width = 10;
level.scene.grid.height = 7;
level.scene.grid.decor.push({x: 0, y: 0, image: 'ground', hasBody: true});
level.scene.grid.decor.push({x: 1, y: 0, image: 'ground', hasBody: true});
level.scene.grid.decor.push({x: 2, y: 0, image: 'ground', hasBody: true});
level.scene.grid.decor.push({x: 3, y: 0, image: 'ground', hasBody: true});
level.scene.grid.decor.push({x: 4, y: 0, image: 'ground', hasBody: true});
level.scene.grid.decor.push({x: 3, y: 3, image: 'ground', hasBody: true});
level.scene.grid.decor.push({x: 4, y: 3, image: 'ground', hasBody: true});
level.scene.grid.decor.push({x: 5, y: 3, image: 'ground', hasBody: true});

level.scene.actors.push({x: 1, y: 4, type: 'player', name: 'hero'});


window.onload = function() {

    const game = new Phaser.Game(
        level.scene.grid.size * level.scene.grid.width,
        level.scene.grid.size * level.scene.grid.height,
        Phaser.AUTO,
        '',
        {preload: preload, create: create, update: update});

    function preload () {
        for (let image of level.resources.images) {
            game.load.image(image.name, image.asset);
        }
    }

    // Inputs object
    let cursors;

    // Grid objects
    let platforms;
    let decors;

    // Players
    let players = [];

    // Helper function
    function registerAction(key, callback) {
        switch (key) {
            case keysEnum.left:
                cursors.left.onDown.add(callback);
                break;
            case keysEnum.right:
                cursors.right.onDown.add(callback);
                break;
            case keysEnum.up:
                cursors.up.onDown.add(callback);
                break;
            case keysEnum.down:
                cursors.down.onDown.add(callback);
                break;
                // Other keys ...
        }
    }

    function create() {
        cursors = game.input.keyboard.createCursorKeys();

        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Grid

        platforms = game.add.group();
        platforms.enableBody = true;

        decors = game.add.group();

        const gridSize = level.scene.grid.size;
        const gridHeight = level.scene.grid.height;
        for (let decor of level.scene.grid.decor) {
            if (decor.hasBody) {
                const platform = platforms.create(
                    gridSize * decor.x,
                    gridSize * (gridHeight - 1 - decor.y),
                    decor.image);
                platform.body.immovable = true;
            }
            else {
                decors.create(
                    gridSize * decor.x,
                    gridSize * (gridHeight - 1 - decor.y),
                    decor.image);
            }
        }

        // Players

        for (let actor of level.scene.actors) {
            if (actor.type === 'player') {
                const playerAsset = level.resources.players.find(
                    (asset) => asset.name === actor.name);

                const player = game.add.sprite(
                    gridSize * actor.x,
                    gridSize * (gridHeight - 1 - actor.y),
                    playerAsset.image);

                game.physics.arcade.enable(player);
                player.body.gravity.y = level.scene.settings.gravity;
                player.body.collideWorldBounds = true;

                // Inputs

                player.action = {};
                for (let input of playerAsset.inputs) {

                    switch (input.action.type) {
                        case actionsEnum.moveLeft:
                            registerAction(input.key, function() {
                                player.body.velocity.x = -input.action.speed;
                            });
                            break;
                        case actionsEnum.moveRight:
                            registerAction(input.key, function() {
                                player.body.velocity.x = input.action.speed;
                            });
                            break;
                        case actionsEnum.jump:
                            registerAction(input.key, function() {
                                if (player.body.touching.down)
                                    player.body.velocity.y = -input.action.power;
                            });
                            break;
                    }
                }

                players.push(player);
            }
        }

    }

    function update() {
        for (let player of players) {
            game.physics.arcade.collide(player, platforms);
        }

    }
};
