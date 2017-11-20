
'use strict';

const level = new JSONLevel('sandbox');
level.preload();

// Custom level
(function() {
    level.scene.grid.decor.push(new DecorScene({x: 0, y: 0}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 1, y: 0}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 2, y: 0}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 3, y: 0}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 4, y: 0}, 'ground', true));

    level.scene.grid.decor.push(new DecorScene({x: 3, y: 3}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 4, y: 3}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 5, y: 3}, 'ground', true));

    let actionRun = new ActionModel('heroRun');
    actionRun.type = actionEnum.move;
    actionRun.shift = {x: 10, y: 0};
    actionRun.whileFalling = false;
    actionRun.cooldown = 0;
    actionRun.locked = false;
    actionRun.animType = animationEnum.none;

    let heroModel = new EntityModel('hero');
    heroModel.animations.push('heroIdle');
    heroModel.animations.push('heroAttack');
    heroModel.animations.push('heroCast');
    heroModel.animations.push('heroDeath');
    heroModel.animations.push('heroRun');
    heroModel.isAnimated = true;
    heroModel.PVMax = 3;
    heroModel.isDestructible = true;
    heroModel.actions.push(actionRun);

    level.resources.entities.push(heroModel);
}());

window.onload = function() {

    const game = new Phaser.Game({
        width:        level.scene.grid.size * level.scene.grid.width,
        height:       level.scene.grid.size * level.scene.grid.height,
        renderer:     Phaser.AUTO,
        antialias:    true,
        multiTexture: true,
        state: {
            preload: preload,
            create: create,
            update: update
        }});

    function preload() {
        for (let image of level.resources.images) {
            image.load(game);
        }
        for (let model of level.resources.animations) {
            model.load(game);
        }
    }

    // Inputs object
    let cursors;

    // Grid objects
    let platforms;
    let decors;

    let actions;

    function create() {
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
                    gridSize * decor.position.x,
                    gridSize * (gridHeight - 1 - decor.position.y),
                    decor.imageName);
                platform.body.immovable = true;
            }
            else {
                decors.create(
                    gridSize * decor.x,
                    gridSize * (gridHeight - 1 - decor.position.y),
                    decor.imageName);
            }
        }

        for (let e of level.scene.entities) {
            const entity = new Entity(level, e, game.add.sprite(e.position.x, e.position.y));
        }
    }

    function update() {
        const delta = game.time.physicsElapsed;

    }
};
