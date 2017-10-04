
// import * as Phaser from "phaser-ce"; // Import not accepted in html, how to make it work ?


// Enums which can be selected later in editor

const actionsEnum = Object.freeze({
    moveLeft:  Symbol('moveLeft'),
    moveRight: Symbol('moveRight'),
    jump:      Symbol('jump')
});

const keysEnum = Object.freeze({ // Another way to not bind every key ? Look at player creation & input handling
    left:  Symbol('left'),
    right: Symbol('right'),
    up:    Symbol('up'),
    down:  Symbol('down'),
    a:     Symbol('a'),
    z:     Symbol('z'),
    // ...
});

// The JSON level object

const JSONLevel = {
    resources: {
        images: [
            {name: 'hero',   asset: 'assets/hero.png'},
            {name: 'ground', asset: 'assets/bricks.png'}
        ],
        players: [
            {name: 'hero', image: 'hero', inputs: [
                {key: keysEnum.left,  action:
                    {type: actionsEnum.moveLeft,  speed: 200}},
                {key: keysEnum.right, action:
                    {type: actionsEnum.moveRight, speed: 200}},
                {key: keysEnum.up,    action:
                    {type: actionsEnum.jump, power: 900}}
            ]}
        ]
    },
    scene: {
        settings: {
            gravity: 800
        },
        grid: {
            size: 128,
            width: 10,
            height: 7,
            decor: [
                {x: 0, y: 0, image: 'ground', hasBody: true},
                {x: 1, y: 0, image: 'ground', hasBody: true},
                {x: 2, y: 0, image: 'ground', hasBody: true},
                {x: 3, y: 0, image: 'ground', hasBody: true},
                {x: 4, y: 0, image: 'ground', hasBody: true},
                {x: 3, y: 3, image: 'ground', hasBody: true},
                {x: 4, y: 3, image: 'ground', hasBody: true},
                {x: 5, y: 3, image: 'ground', hasBody: true},
            ]
        },
        actors: [
            {x: 1, y: 4, type: 'player', name: 'hero'}
        ]
    }
};

window.onload = function() {

    const game = new Phaser.Game(
        JSONLevel.scene.grid.size * JSONLevel.scene.grid.width,
        JSONLevel.scene.grid.size * JSONLevel.scene.grid.height,
        Phaser.AUTO,
        '',
        {preload: preload, create: create, update: update});

    function preload () {
        for (let image of JSONLevel.resources.images) {
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

        const gridSize = JSONLevel.scene.grid.size;
        const gridHeight = JSONLevel.scene.grid.height;
        for (let decor of JSONLevel.scene.grid.decor) {
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

        for (let actor of JSONLevel.scene.actors) {
            if (actor.type === 'player') {
                const playerAsset = JSONLevel.resources.players.find(function(asset) {
                    return asset.name === actor.name;
                });

                const player = game.add.sprite(
                    gridSize * actor.x,
                    gridSize * (gridHeight - 1 - actor.y),
                    playerAsset.image);

                game.physics.arcade.enable(player);
                player.body.gravity.y = JSONLevel.scene.settings.gravity;
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
