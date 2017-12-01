
'use strict';

// ____________________
// The level descriptor

// Store user image name
class JSONLevel {
    constructor(name) {
        this.resources = {
            imageDecors: [],
            imageEntities: [],
            animations: [],
            actions: [],
            entities: []
        };
        this.scene = {
            grid: {
                size: 64,
                width: 20,
                height: 12,
                decor: []
            },
            entities: []
        };
        this.settings = {
            name: name,
            gravity: 1000
        };
    }

    preload() {
        this.resources.imageDecors.push(new ImageModel('ground', 'assets/bricks.png'));

        this.resources.imageEntities.push(new ImageModel('hero', 'assets/hero.png'));
        this.resources.imageEntities.push(new ImageModel('cultist', 'assets/cultist.png'));

        this.resources.animations.push(new AnimationModel(
            'heroIdle', animationEnum.idle, 1, 1, true, 'assets/hero/idle'));
        this.resources.animations.push(new AnimationModel(
            'heroRun', animationEnum.run, 0.5, 2, true, 'assets/hero/run'));
        this.resources.animations.push(new AnimationModel(
            'heroDeath', animationEnum.death, 2, 14, false, 'assets/hero/death'));
        this.resources.animations.push(new AnimationModel(
            'heroAttack', animationEnum.action1, 0.5, 3, true, 'assets/hero/attack'));
        this.resources.animations.push(new AnimationModel(
            'heroCast', animationEnum.action2, 0.5, 3, true, 'assets/hero/cast'));

        this.resources.animations.push(new AnimationModel(
            'cultistIdle', animationEnum.idle, 1, 1, true, 'assets/cultist/idle'));
        this.resources.animations.push(new AnimationModel(
            'cultistRun', animationEnum.run, 0.5, 2, true, 'assets/cultist/run'));
        this.resources.animations.push(new AnimationModel(
            'cultistDeath', animationEnum.death, 2, 16, false, 'assets/cultist/death'));
        this.resources.animations.push(new AnimationModel(
            'cultistAttack', animationEnum.action1, 0.5, 3, true, 'assets/cultist/attack'));
        this.resources.animations.push(new AnimationModel(
            'cultistCast', animationEnum.action2, 0.5, 2, true, 'assets/cultist/cast'));
    }
}

// ________________________
// Models (level resources)

class ActionModel {
    constructor(name) {
        this.name = name;
        this.type = actionEnum.move;
        this.key = Phaser.KeyCode.SPACEBAR;

        this.whileFalling = true;
        this.locked = false;
        this.cooldown = 0;

        // Move data
        this.shift = {x: 0, y: 0};
        this.speed = {x: 0, y: 0};
        // Spawn data
        this.entity = null;
        this.distance = 0;
        this.speed = {x: 0, y: 0};
        this.animType = animationEnum.none;
        // AoE data
        this.hitboxWidth = 0;
        this.hitboxHeight = 0;
        this.distance = 0;
        this.animType = animationEnum.none;
    }
    copy(name) {
        const model = new ActionModel(name);
        model.type = this.type;
        model.key = this.key;

        // Move data
        model.shift = {x: this.shift.x, y: this.shift.y};
        // Spawn data
        model.entity = this.entity;
        model.distance = this.distance;
        model.speed = {x: this.speed.x, y: this.speed.y};
        // AoE data
        model.hitboxName = this.hitboxName;
        model.distance = this.distance;

        model.whileFalling = this.whileFalling;
        model.animType = this.animType;
        model.locked = this.locked;
        model.cooldown = this.cooldown;

        return model;
    }
}

class EntityModel {
    constructor(name) {
        this.name = name;
        this.tag = '';
        this.imageName = null;
        this.animationNames = [];
        this.actionNames = [];
        this.PVMax = 0;
        this.isAnimated = false;
        this.isDestructible = false;
        this.width = 64;
        this.height = 64;
        this.bounciness = 0;
        this.hasGravity = false;
        this.collisionType = hitboxEnum.physical;
        this.collisionDamages = 0;
        this.collisionTags = [];
    }
    copy(name) {
        const model = new EntityModel(name);
        model.tag = this.tag;
        model.imageName = this.imageName;
        model.animationNames = this.animationNames.slice();
        model.actionNames = this.actionNames.slice();
        model.PVMax = this.PVMax;
        model.isAnimated = this.isAnimated;
        model.isDestructible = this.isDestructible;
        model.width = this.width;
        model.height = this.height;
        model.bounciness = this.bounciness;
        model.hasGravity = this.hasGravity;
        model.collisionType = this.collisionType;
        model.collisionDamages = this.collisionDamages;
        model.collisionTags = this.collisionTags.slice();

        return model;
    }
    getAnimation(type, level) {
        let anim;
        for (name of this.animationNames) {
            anim = level.resources.animations.find(m => m.name === name);
            if (anim.type === type) return anim;
        }
    }
}

class ImageModel {
    constructor(name, file) {
        this.name = name;
        this.file = file;
    }
    load(game) {
        if (!game.cache.checkImageKey(this.name))
            game.load.image(this.name, this.file);
    }
}

class AnimationModel {
    constructor(name, type, time, count, hasOrientation, folder) {
        this.name = name;
        this.type = type;
        this.time = time;
        this.count = count;
        this.hasOrientation = hasOrientation;
        this.folder = folder;
        this.images = [];

        if (this.hasOrientation) {
            for (let i = 0; i < this.count; i += 1) {
                this.images[i] = new ImageModel(this.name + i, this.folder + '/left/' + i + '.png');

                const i2 = i + this.count;
                this.images[i2] = new ImageModel(this.name + i2, this.folder + '/right/' + i + '.png');
            }
        }
        else {
            for (let i = 0; i < this.count; i += 1) {
                this.images[i] = new ImageModel(this.name + i, this.folder + '/' + i + '.png');
            }
        }
    }
    copy(name, time) {
        return new AnimationModel(name, this.type, time, this.count, this.hasOrientation, this.folder, this.images);
    }
    load(game) {
        for (const image of this.images) {
            image.load(game);
        }
    }
    getImageName(tElapsed, orientation) {
        let i = Math.floor((tElapsed * this.count) / this.time);
        if (this.hasOrientation && orientation === orientationEnum.right) {
            i += this.count;
        }
        return this.images[i].name;
    }
}

// _____________
// Scene objects

class EntityScene {
    constructor(model, position, level) {
        this.modelName = model.name;
        if (model.isAnimated) {
            const anim = model.getAnimation(animationEnum.idle, level);
            this.imageName = anim.getImageName(0, orientationEnum.right);
        }
        else {
            this.imageName = model.imageName;
        }
        this.position = {x: position.x, y: position.y};
    }
}

class DecorScene {
    constructor(position, imageName, hasBody) {
        this.position = {x: position.x, y: position.y};
        this.imageName = imageName;
        this.hasBody = hasBody;
    }
}

// ____________
// Enumerations

const actionEnum = Object.freeze({
    move:  Symbol('move'),
    spawn: Symbol('spawn'),
    aoe:   Symbol('aoe'),
});

const orientationEnum = Object.freeze({
    left:  Symbol('left'),
    right: Symbol('right'),
});

const hitboxEnum = Object.freeze({
    immaterial: Symbol('immaterial'),
    physical:   Symbol('physical')
});

const animationEnum = Object.freeze({
    none:    Symbol('none'),
    birth:   Symbol('birth'),
    death:   Symbol('death'),
    idle:    Symbol('idle'),
    run:     Symbol('run'),
    fall:    Symbol('fall'),
    hurt:    Symbol('hurt'),
    action1: Symbol('action1'),
    action2: Symbol('action2'),
    action3: Symbol('action3'),
    action4: Symbol('action4'),
    action5: Symbol('action5'),
    action6: Symbol('action6'),
    action7: Symbol('action7'),
    action8: Symbol('action8'),
});
