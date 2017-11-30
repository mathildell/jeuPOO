
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

    const leftRun = new ActionModel('runLeft');
    level.resources.actions.push(leftRun);
    leftRun.key = Phaser.KeyCode.Q;
    leftRun.type = actionEnum.move;
    leftRun.shift = {x: -10, y: 0};
    leftRun.whileFalling = true;
    leftRun.cooldown = 0;
    leftRun.locked = false;

    const rightRun = leftRun.copy('runRight');
    level.resources.actions.push(rightRun);
    leftRun.key = Phaser.KeyCode.D;
    leftRun.shift = {x: 10, y: 0};

    const jump = leftRun.copy('jump');
    level.resources.actions.push(jump);
    leftRun.key = Phaser.KeyCode.SPACEBAR;
    leftRun.shift = {x: 0, y: 0};
    leftRun.speed = {x: 0, y: 100};
    leftRun.whileFalling = false;


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
    cultistModel.width = 60;
    cultistModel.height = 95;
    cultistModel.hitboxType = hitboxEnum.physical;
    cultistModel.bounciness = 0.5;
    cultistModel.hasGravity = true;
    cultistModel.collisionDamages = 0;

    const myCultistModel = new EntityModel(cultistModel);
    level.resources.entities.push(myCultistModel);
    myCultistModel.actionNames.push('runLeft');
    myCultistModel.actionNames.push('runRight');


    level.scene.entities.push(new EntityScene(cultistModel, {x: 300, y: 200}, level));
    level.scene.entities.push(new EntityScene(cultistModel, {x: 300, y: 0}, level));

    level.settings.gravity = 300;
}());

// _______________
// In game classes

// hitboxes opti : 1D sort
// https://ra3s.com/wordpress/dysfunctional-programming/2015/01/29/pruning-collision-detection-with-a-1d-sort/

class Entity { // TODO Death (remove hitbox)
    constructor(sceneModel) {
        const model = level.resources.entities.find(m => m.name === sceneModel.modelName);
        this.model = model;
        this.sprite = game.add.sprite(sceneModel.position.x, sceneModel.position.y);
        this.sprite.myEntity = this;
        this.sprite.anchor.setTo(0.5, 1);

        if (model.isDestructible) {
            const PVs = model.PVMax;
            this.sprite.maxHealth = PVs;
            this.sprite.setHealth(PVs);
        }

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.bounce.set(model.bounciness);
        if (model.hasGravity) {
            this.sprite.body.gravity.y = level.settings.gravity;
        }
        this.cleanVelocity = {x: 0, y: 0};

        if (model.isAnimated) {
            // Cache animations in the model
            if (!model.animations) {
                model.animations = {};
                for (let name of model.animationNames) {
                    const anim = level.resources.animations.find(a => a.name === name);
                    model.animations[anim.type] = anim;
                }
            }
            let animType = animationEnum.birth;
            let animModel = model.animations[animType];
            if (!animModel) {
                animType = animationEnum.idle;
                animModel = model.animations[animType];
            }
            this._animType = animType;
            this.animation = new Animation(animModel);
            this._updateSprite(this.animation.getImageName(orientationEnum.right));
        }
        else {
            this._updateSprite(model.imageName);
        }
        this.sprite.body.setSize(model.width, model.height);

        this.actions = [];
        if (!model.actions) {
            for (let name of model.actionNames) {
                const model = level.resources.actions.find(m => m.name === name);
                model.actions.push(model);
            }
        }
        for (const actionModel of model.actions) {
            this.actions.push(new Action(actionModel, this));
        }
    }

    update(delta) {
        for (let action of this.actions) {
            action.update(delta);
        }
        if (this.model.isAnimated) {
            this._updateAnimation(delta);
        }
        this.sprite.body.velocity.subtract(this.cleanVelocity.x, this.cleanVelocity.y);
        this.cleanVelocity.set(0, 0);
    }
    _animDefaultType() {
        const body = this.sprite.body;
        let type = animationEnum.idle;
        if (!body.onFloor() && this.model.hasGravity) {
            type = animationEnum.fall;
        }
        else if (body.velocity.x !== 0) {
            type = animationEnum.run;
        }
        return type;
    }
    _updateAnimation(delta) {
        const body = this.sprite.body;
        this.animation.update(delta);
        const defaultType = this._animDefaultType();
        let mustChangeAnimation = false;
        if (this._animType !== defaultType &&
            (this._animType === animationEnum.run ||
             this._animType === animationEnum.idle ||
             this._animType === animationEnum.fall)) {
            this._animType = defaultType;
            mustChangeAnimation = true;
        }
        if (this.animation.isFinished) {
            mustChangeAnimation = true;
        }
        if (mustChangeAnimation) {
            let model = this.model.animations[this._animType];
            if (!model) model = this.model.animations[animationEnum.idle];
            this.animation = new Animation(model);
        }
        this._updateSprite(this.animation.getImageName(
            body.velocity.x < 0
                ? orientationEnum.left
                : orientationEnum.right));
    }
    _updateSprite(imageName) {
        this.sprite.loadTexture(imageName);
        const gapX = this.sprite.width - this.model.width;
        const gapY = this.sprite.height - this.model.height;
        this.sprite.body.setSize(this.model.width, this.model.height, gapX / 2, gapY);
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
        game.input.keyboard.a
    }
    update(delta) {
        if (this.CD > 0) {
            this.CD -= delta;
            if (this.CD < 0) this.CD = 0;
        }
    }
    on() {
        if (this.CD !== 0) return;
        if (this.entity.hasGravity && !this.model.whileFalling) return;

        this.CD = this.model.cooldown;
        if (this.entity.animation.model.type !== this.model.animType) {
            const animModel = this.entity.model.animations[this.model.animType];
            this.entity.animation = new Animation(animModel);
        }
        switch (type) {
            case actionEnum.move:
                this.entity.cleanVelocity.add(
                    this.model.shift.x,
                    this.model.shift.y);
                this.entity.sprite.body.velocity.add(
                    this.model.shift.x + this.model.speed.x,
                    this.model.shift.y + this.model.speed.y);
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
            create:  create,
            update:  update
        }
    });

    function preload() {
        for (let image of level.resources.imageDecors)   {image.load(game);}
        for (let image of level.resources.imageEntities) {image.load(game);}
        for (let model of level.resources.animations)    {model.load(game);}
    }

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
            const collision = entity.model.collisionType;
            if (collision === hitboxEnum.immaterial) {
                gOverlaps.add(entity.sprite);
            }
            else if (collision === hitboxEnum.physical) {
                gCollides.add(entity.sprite);
            }
            else {
                window.alert("BUG: Entity collision type has wrong value");
            }
            entities.push(entity);
        }
    }

    function collide(s1, s2) {
        _collide(s1, s2);
        _collide(s2, s1);
    }
    function _collide(s1, s2) {
        const box1 = s1.myEntity;
        if (box1.collisionDamages === 0) return;

        const model2 = s2.myEntity.model;

        if (!model2.isDestructible) return;
        if (box1.collisionTags.length !== 0 &&
            !box1.collisionTags.includes(model2.tag)) return;

        s2.damage(box1.collisionDamages);
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
