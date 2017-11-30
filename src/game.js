
'use strict';

let game;

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

    const persoHitbox = new HitboxModel('perso');
    level.resources.hitboxes.push(persoHitbox);
    persoHitbox.width = 64;
    persoHitbox.height = 128;
    persoHitbox.hasGravity = true;
    persoHitbox.bounciness = 0;
    persoHitbox.damages = 1;
    persoHitbox.tagsAffected.push('perso');

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
    heroModel.animationNames.push('heroIdle');
    heroModel.animationNames.push('heroAttack');
    heroModel.animationNames.push('heroCast');
    heroModel.animationNames.push('heroDeath');
    heroModel.animationNames.push('heroRun');
    heroModel.isAnimated = true;
    heroModel.PVMax = 3;
    heroModel.isDestructible = true;
    heroModel.actions.push(actionRun);
    heroModel.hitboxName = 'perso';
    heroModel.hasGravity = true;
*/
    const cultistModel = new EntityModel('cultist');
    level.resources.entities.push(cultistModel);
    //cultistModel.imageName = 'cultist';
    cultistModel.animationNames.push('cultistIdle');
    cultistModel.animationNames.push('cultistAttack');
    cultistModel.animationNames.push('cultistCast');
    cultistModel.animationNames.push('cultistDeath');
    cultistModel.animationNames.push('cultistRun');
    cultistModel.isAnimated = true;
    cultistModel.isDestructible = false;
    cultistModel.hitboxName = 'perso';

    level.scene.entities.push(new EntityScene(cultistModel, {x: 300, y: 200}, level));
    level.scene.entities.push(new EntityScene(cultistModel, {x: 300, y: 0}, level));
}());

// _______________
// In game classes

// hitboxes opti : 1D sort
// https://ra3s.com/wordpress/dysfunctional-programming/2015/01/29/pruning-collision-detection-with-a-1d-sort/


const collisionEnum = Object.freeze({
    physical:   Symbol('physical'),
    immaterial: Symbol('immaterial'),
    none:       Symbol('none')
});

class Entity { // TODO Death (remove hitbox)
    constructor(sceneModel) {
        this.model = level.resources.entities.find(m => m.name === sceneModel.modelName);
        this.sprite = game.add.sprite(sceneModel.position.x, sceneModel.position.y);
        this.sprite.myEntity = this;
        this.sprite.anchor.setTo(0, 0.5);

        if (this.model.isDestructible) {
            const PVs = this.model.PVMax;
            this.sprite.maxHealth = PVs;
            this.sprite.setHealth(PVs);
        }

        if (this.model.hitboxName) {
            this.hitbox = level.resources.hitboxes.find(m => m.name === this.model.hitboxName);
            game.physics.enable(this.sprite);
            this.sprite.body.width = this.hitbox.width;
            this.sprite.body.height = this.hitbox.height;
            if (this.hitbox.hasGravity) {
                this.sprite.body.gravity.y = level.settings.gravity;
            }
            this.sprite.body.bounce = this.hitbox.bounciness;

            this.collisionType = this.hitbox.isSolid
                ? collisionEnum.physical
                : collisionEnum.immaterial;
            this.movable = this.sprite.body;
        }
        else {
            this.collisionType = collisionEnum.none;
            this.movable = this.sprite;
        }

        if (this.model.isAnimated) {
            // Cache animations in the model
            if (!this.model.animations) {
                this.model.animations = {};
                for (let name of this.model.animationNames) {
                    const anim = level.resources.animations.find(a => a.name === name);
                    this.model.animations[anim.type] = anim;
                }
            }
            let animModel = this.model.animations[animationEnum.birth];
            if (!animModel) {
                animModel = this.model.animations[animationEnum.idle];
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
            this._updateAnimation(delta);
        }
    }
    _updateAnimation(delta) {
        this.animation.update(delta);
        if (this.animation.isFinished) {
            let animModel = this.model.animations[animationEnum.fall];
            if (this.sprite.body.touching.down || !this.model.hasGravity) {
                animModel = (this.movable.speed.x === 0
                    ? this.model.animations[animationEnum.idle]
                    : this.model.animations[animationEnum.run]);
            }
            this.animation = new Animation(animModel);
        }
        this.sprite.loadTexture(this.animation.getImageName(
            this.movable.speed.x < 0
                ? orientationEnum.left
                : orientationEnum.right));
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
        return this.model.getImageName(this.current, orientation);
    }
}

class Action {
    constructor(model, entity) {
        this.model = model;
        this.entity = entity;
        this.CD = 0;
    }
    update(delta) {
        this.CD -= delta;
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
                // TODO
                break;
            case actionEnum.aoe:
                // TODO
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
        }
    });

    function preload() {
        for (let image of level.resources.imageDecors)   {image.load(game);}
        for (let image of level.resources.imageEntities) {image.load(game);}
        for (let model of level.resources.animations)    {model.load(game);}
    }

    // Inputs object
    let cursors;

    // Group objects
    let gPlatforms;
    let gDecors;
    let gOverlaps;
    let gCollides;

    const entities = [];

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Grid

        gDecors = game.add.group();
        gPlatforms = game.add.group();
        gPlatforms.enableBody = true;

        const gridSize = level.scene.grid.size;
        const gridHeight = level.scene.grid.height;

        for (let decor of level.scene.grid.decor) {
            if (decor.hasBody) {
                const platform = gPlatforms.create(
                    gridSize * decor.position.x,
                    gridSize * (gridHeight - 1 - decor.position.y),
                    decor.imageName);
                platform.body.immovable = true;
            }
            else {
                gDecors.create(
                    gridSize * decor.x,
                    gridSize * (gridHeight - 1 - decor.position.y),
                    decor.imageName);
            }
        }

        // Entities

        gOverlaps = game.add.group();
        gCollides = game.add.group();

        for (let e of level.scene.entities) {
            const entity = new Entity(e);
            if (entity.collisionType === collisionEnum.immaterial) {
                gOverlaps.add(entity.sprite);
            }
            if (entity.collisionType === collisionEnum.physical) {
                gCollides.add(entity.sprite);
            }
            entities.push(entity);
        }
    }

    function collide(s1, s2) {
        _collide(s1, s2);
        _collide(s2, s1);
    }
    function _collide(s1, s2) {
        const box1 = s1.myEntity.hitbox;
        if (box1.damages === 0) return;

        const model2 = s2.myEntity.model;

        if (!model2.isDestructible) return;
        if (box1.tagsAffected.length !== 0 &&
            !box1.tagsAffected.includes(model2.tag)) return;

        s2.damage(box1.damages);
    }

    function update() {
        const delta = game.time.physicsElapsed;

        game.physics.arcade.collide(gPlatforms, gOverlaps);
        game.physics.arcade.collide(gPlatforms, gCollides);

        game.physics.arcade.collide(gOverlaps, gOverlaps, collide);
        game.physics.arcade.collide(gOverlaps, gCollides, collide);
        game.physics.arcade.collide(gCollides, gCollides, collide);

        for (const entity of entities) {
            entity.update(delta);
        }

        // TODO Actions
    }
};
