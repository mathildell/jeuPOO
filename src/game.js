
'use strict';

let game;
const actionsList = [];

// ________________________
// Custom level (for tests)

if (!level) {
    var level = new JSONLevel('sandbox');
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
        leftRun.shift = {x: -150, y: 0};
        leftRun.whileFalling = true;
        leftRun.cooldown = 0;
        leftRun.locked = false;

        const rightRun = leftRun.copy('runRight');
        level.resources.actions.push(rightRun);
        rightRun.key = Phaser.KeyCode.D;
        rightRun.shift = {x: 150, y: 0};

        const jump = leftRun.copy('jump');
        level.resources.actions.push(jump);
        jump.key = Phaser.KeyCode.SPACEBAR;
        jump.shift = {x: 0, y: 0};
        jump.speed = {x: 0, y: 500};
        jump.whileFalling = false;

        const cultistModel = new EntityModel('cultist');
        level.resources.entities.push(cultistModel);
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
        cultistModel.bounciness = 0;
        cultistModel.hasGravity = true;
        cultistModel.collisionDamages = 0;

        const myCultistModel = cultistModel.copy('myCultist');
        level.resources.entities.push(myCultistModel);
        myCultistModel.actionNames.push('runLeft');
        myCultistModel.actionNames.push('runRight');
        myCultistModel.actionNames.push('jump');

        level.scene.entities.push(new EntityScene(cultistModel, {x: 300, y: 200}, level));
        level.scene.entities.push(new EntityScene(cultistModel, {x: 300, y: 0}, level));
        level.scene.entities.push(new EntityScene(myCultistModel, {x: 100, y: 400}, level));

        level.settings.gravity = 1000;
    }());
}else{
    (function(){
        const tmp = level;
        
        level =  new JSONLevel(tmp.settings.name);

        for (let act of tmp.resources.actions){
            const acm = new ActionModel(act.name);

            acm.animType = act.animType;
            acm.cooldown = act.cooldown;
            acm.distance = act.distance;
            acm.entity = act.entity;
            acm.hitboxHeight = act.hitboxHeight;
            acm.hitboxWidth = act.hitboxWidth;
            acm.key = act.key;
            acm.locked = act.locked;
            acm.shift = act.shift;
            acm.speed = act.speed;
            acm.type = act.type;
            acm.whileFalling = act.whileFalling;

            level.resources.actions.push(acm);
        }

        for (let anims of tmp.resources.animations){
            level.resources.animations.push(new AnimationModel(anims.name, anims.type, anims.time, anims.count, anims.hasOrientation, anims.folder));
        }

        for (let entits of tmp.resources.entities){

            const entit = new EntityModel(entits.actionNames);
            entit.PVMax = entits.PVMax;
            entit.animationNames = entits.animationNames;
            entit.bounciness = entits.bounciness;
            entit.collisionDamages = entits.collisionDamages;
            entit.collisionTags = entits.collisionTags;
            entit.collisionType = entits.collisionType;
            entit.hasGravity = entits.hasGravity;
            entit.height = entits.height;
            entit.width = entits.width;
            entit.imageName = entits.imageName;
            entit.isAnimated = entits.isAnimated;
            entit.isDestructible = entits.isDestructible;
            entit.tag = entits.tag;

            level.resources.entities.push(entit);
        }

        for (let imgDecor of tmp.resources.imageDecors){
            level.resources.imageDecors.push(new ImageModel(imgDecor.name, imgDecor.file));
        }

        for (let imgEnt of tmp.resources.imageEntities){
            level.resources.imageEntities.push(new ImageModel(imgEnt.name, imgEnt.file));
        }

        for (let cube of tmp.scene.grid.decor){
            const cube2 = {position: {x: "", y:""}};
            cube2.position.x = cube.position.x / tmp.scene.grid.size;
            cube2.position.y = (tmp.scene.grid.height - (cube.position.y / tmp.scene.grid.size)) - 1;
            level.scene.grid.decor.push(new DecorScene(cube2.position, cube.imageName, cube.hasBody));
        }

        level.scene.grid.height = tmp.scene.grid.height;
        level.scene.grid.width = tmp.scene.grid.width;
        level.scene.grid.size = tmp.scene.grid.size;
        level.settings.gravity = tmp.settings.gravity;
        level.settings.name = tmp.settings.name;


    }());
}

// _______________
// In game classes

class Entity {
    constructor(sceneModel) {
        const model = level.resources.entities.find(m => m.name === sceneModel.modelName);
        this.model = model;
        this.sprite = game.add.sprite(sceneModel.position.x, sceneModel.position.y);
        this.sprite.myEntity = this;
        this.sprite.anchor.setTo(0.5, 1);
        this.oldX = this.sprite.position.x;
        this.orientation = orientationEnum.right;

        if (model.isDestructible) {
            const PVs = model.PVMax;
            this.sprite.maxHealth = PVs;
            this.sprite.setHealth(PVs);
        }

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.collideWorldBounds = true;
        this.sprite.body.bounce.set(model.bounciness);
        if (model.hasGravity) {
            this.sprite.body.gravity.y = level.settings.gravity;
        }
        this.shiftVelocity = {x: 0, y: 0};

        if (model.isAnimated) {
            this.isRunning = false;
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
            this._updateSprite(this.animation.getImageName(this.orientation));
        }
        else {
            this._updateSprite(model.imageName);
        }
        this.sprite.body.setSize(model.width, model.height);

        this.actions = [];
        if (!model.actions) {
            model.actions = [];
            for (let name of model.actionNames) {
                const actionModel = level.resources.actions.find(m => m.name === name);
                model.actions.push(actionModel);
            }
        }
        for (const actionModel of model.actions) {
            this.actions.push(new Action(actionModel, this));
        }
    }

    update(delta) {
        const diffX = this.sprite.position.x - this.oldX;
        if (diffX !== 0) {
            this.orientation = diffX > 0
                ? orientationEnum.right
                : orientationEnum.left;
        }
        for (let action of this.actions) {
            action.update(delta);
        }
        if (this.model.isAnimated) {
            this.isMoving -= 1;
            this._updateAnimation(delta);
        }
        this.oldX = this.sprite.position.x;
        this.sprite.body.position.add(this.shiftVelocity.x * delta, this.shiftVelocity.y * delta);
        this.shiftVelocity = {x: 0, y: 0};
    }
    _animDefaultType() {
        let type = animationEnum.idle;
        if (!this.sprite.body.touching.down && this.model.hasGravity) {
            type = animationEnum.fall;
        }
        else if (this.isMoving > 0) {
            type = animationEnum.run;
        }
        console.log(type.toString());
        return type;
    }
    _updateAnimation(delta) {
        this.animation.update(delta);
        const defaultType = this._animDefaultType();
        let newType;
        if (this.animation.isFinished ||
             (this._animType !== defaultType &&
               (this._animType === animationEnum.run  ||
                this._animType === animationEnum.idle ||
                this._animType === animationEnum.fall))) {

            newType = defaultType;
            let model = this.model.animations[defaultType];
            if (!model) {
                if (this._animType !== animationEnum.idle) {
                    model = this.model.animations[animationEnum.idle];
                    this.animation = new Animation(model);
                }
            }
            else {
                this.animation = new Animation(model);
            }
        }
        this._updateSprite(this.animation.getImageName(this.orientation));
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
        this.key = game.input.keyboard.addKey(model.key);
        actionsList.push(this);
    }
    update(delta) {
        if (this.CD > 0) {
            this.CD -= delta;
            if (this.CD < 0) this.CD = 0;
        }
    }
    on() {
        if (this.CD !== 0) return;
        if (!this.model.whileFalling &&
             this.entity.model.hasGravity &&
            !this.entity.sprite.body.touching.down) return;

        this.CD = this.model.cooldown;
        if (this.model.animType !== animationEnum.none &&
            this.model.animType !== this.entity.animation.model.type) {

            const animModel = this.entity.model.animations[this.model.animType];
            this.entity.animation = new Animation(animModel);
        }
        switch (this.model.type) {
            case actionEnum.move:
                this.entity.isMoving = 2;
                this.entity.shiftVelocity.x += this.model.shift.x;
                this.entity.shiftVelocity.y += this.model.shift.y;
                this.entity.sprite.body.velocity.add(
                    this.model.speed.x,
                    -this.model.speed.y);
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
        },
        transparent: true
    });
    console.log(game.width, level.scene.grid.size, level.scene.grid.width);

    function preload() {
        for (let image of level.resources.imageDecors)   {image.load(game);}
        for (let image of level.resources.imageEntities) {image.load(game);}
            //image.load(game);
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

        game.physics.arcade.overlap(gOverlaps, gOverlaps, collide);
        game.physics.arcade.overlap(gOverlaps, gCollides, collide);
        game.physics.arcade.collide(gCollides, gCollides, collide);

        for (const entity of entities) {
            entity.update(delta);
        }

        for (const action of actionsList) {
            if (action.key.isDown) {
                action.on();
            }
        }
    }
};
