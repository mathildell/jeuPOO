
'use strict';

let game = {};

// ____________
// Custom level

const level = new JSONLevel('sandbox');
level.preload();

(function() {
    level.scene.grid.decor.push(new DecorScene({x: 0, y: 0}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 1, y: 0}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 2, y: 0}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 3, y: 0}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 4, y: 0}, 'ground', true));

    level.scene.grid.decor.push(new DecorScene({x: 3, y: 3}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 4, y: 3}, 'ground', true));
    level.scene.grid.decor.push(new DecorScene({x: 5, y: 3}, 'ground', true));

    // At creation : enable physics, set body size
    const persoHitbox = new HitboxModel('perso');
    level.resources.hitboxes.push(persoHitbox);
    persoHitbox.width = 60;
    persoHitbox.height = 100;
    persoHitbox.hasGravity = true;
    persoHitbox.bounciness = 0;
    persoHitbox.damages = 1;
    persoHitbox.tagsAffected.push('perso');

    // At creation : get key (?), onPress => create callback
    const actionRun = new ActionModel('heroRun');
    level.resources.actions.push(actionRun);
    actionRun.type = actionEnum.move;
    actionRun.shift = {x: 10, y: 0};
    actionRun.whileFalling = false;
    actionRun.cooldown = 0;
    actionRun.locked = false;
    actionRun.animType = animationEnum.none;
/*
    const heroModel = new EntityModel('hero');
    level.resources.entities.push(heroModel);
    heroModel.animations.push('heroIdle');
    heroModel.animations.push('heroAttack');
    heroModel.animations.push('heroCast');
    heroModel.animations.push('heroDeath');
    heroModel.animations.push('heroRun');
    heroModel.isAnimated = true;
    heroModel.PVMax = 3;
    heroModel.isDestructible = true;
    heroModel.actions.push(actionRun);
    heroModel.hitboxName = 'perso';
    heroModel.hasGravity = true;
*/
    const cultistModel = new EntityModel('cultist');
    level.resources.entities.push(cultistModel);
    cultistModel.imageName = 'cultist';
    cultistModel.isAnimated = false;
    cultistModel.isDestructible = false;
    cultistModel.hitboxName = 'perso';
    cultistModel.hasGravity = true;

    level.scene.entities.push(new EntityScene(cultistModel, {x: 300, y: 200}));
}());

// _______________
// In game classes

class Entity {
    constructor(sceneModel) {
        this.model = level.resources.entities.find(m => m.name === sceneModel.modelName);
        this.sprite = game.add.sprite(sceneModel.position.x, sceneModel.position.y);
        this.sprite.myEntity = this;
        this.sprite.anchor.setTo(0, 0.5);

        if (this.model.hitbox) {
            game.physics.enable(this.sprite);
            this.sprite.body.width = this.model.hitbox.width;
            this.sprite.body.height = this.model.hitbox.height;
            if (this.model.hitbox.hasGravity) {
                this.sprite.body.gravity.y = level.settings.gravity;
            }
            this.sprite.body.bounce = this.model.hitbox.bounciness;
            if (this.model.hitbox.damages !== 0) {
                this.sprite.body.onCollide = new Phaser.Signal();
                let callback;
                const tags = this.model.hitbox.tagsAffected;
                if (tags === 0) {
                    callback = function(sprite, other) {
                        if (other.myEntity.model.isDestructible) {
                            other.damage(sprite.body.onCollide);
                        }
                    }
                }
                else {
                    callback = function(sprite, other) {
                        const model = other.myEntity.model;
                        if (model.isDestructible && tags.includes(model.tag)) {
                            other.damage(sprite.body.onCollide);
                        }
                    }
                }
                this.sprite.body.add(callback, this);
            }
            this.movable = this.sprite.movable;
        }
        else {
            this.movable = this.sprite;
        }
        if (this.model.isDestructible) {
            this.PV = this.model.PVMax;
        }

        if (this.model.isAnimated) {
            // Cache animations in the model
            if (!this.model.animations) {
                this.model.animations = [];
                for (let name of this.model.animationNames) {
                    this.model.animations.push(level.resources.animations.find(a => a.name === name));
                }
            }

            let animModel = this.model.animation[animationEnum.birth];
            if (!animModel) {
                animModel = this.model.animation[animationEnum.idle];
            }
            this.animation = new Animation(animModel);
            this.sprite.loadTexture(this.animation.getImageName(orientationEnum.right));
        }
        else {
            this.sprite.loadTexture(this.model.imageName);
        }

        this.actions = [];
        for (let name of this.model.actionNames) {
            const model = level.resources.actions.find(m => m.name === name);
            this.actions.push(new Action(model, this));
        }
    }
    update(delta) {
        for (let action of this.actions) {
            action.update(delta);
        }

        if (this.model.isAnimated) {
            this.animation.update(delta);
            this.sprite.loadTexture(this.animation.getImageName(
                this.sprite.speed.x < 0
                    ? orientationEnum.left
                    : orientationEnum.right));
            if (this.animation.isFinished) {
                let animModel = this.model.animation[animationEnum.fall];
                if (this.sprite.body.touching.down || !this.model.hasGravity) {
                    animModel = (this.sprite.speed.x === 0
                        ? this.model.animation[animationEnum.idle]
                        : this.model.animation[animationEnum.run]);
                }
                this.animation = new Animation(animModel);
            }
        }
    }
    isDead() {
        return this.model.isDestructible && this.PV === 0;
    }
}

class Animation {
    constructor(model) {
        this.model = model;
        this.current = 0;
        this.isFinished = false;
    }
    update(delta) {
        this.current += delta;
        if (this.current >= this.model.time) {
            this.current = this.model.time - 0.01;
            this.isFinished = true;
        }
    }
    getImageName(orientation) {
        return this.model.getImageName(current, orientation);
    }
}

class Action {
    constructor(model, entity) {
        this.model = model;
        this.entity = entity;
        this.CD = 0;
    }
    update(delta) {
        this.CD -= this.model.cooldown;
        if (this.CD < 0) this.CD = 0;
    }
    on() {
        if (this.CD !== 0) return;
        if (this.entity.isDead()) return;
        if (this.entity.hasGravity && !this.model.whileFalling) return;

        this.CD = this.model.cooldown;
        if (this.entity.animation.model.type !== this.model.animType) {
            const animModel = this.entity.model.animations[this.model.animType];
            this.entity.animation = new Animation(animModel);
        }
        switch (type) {
            case actionEnum.move:
                this.entity.sprite.x += this.model.shift.x;
                this.entity.sprite.y += this.model.shift.y;
                break;
            case actionEnum.spawn:

                break;
            case actionEnum.aoe:

                break;
        }
    }
}


window.onload = function() {

    game = new Phaser.Game({
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
            const entity = new Entity(e);
        }
    }

    function update() {
        const delta = game.time.physicsElapsed;

    }
};
