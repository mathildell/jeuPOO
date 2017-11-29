
'use strict';

// ____________________
// The level descriptor

class JSONLevel {
    constructor(name) {
        this.resources = {
            images: [],
            animations: [],
            actions: [],
            hitboxes: [],
            entities: []
        };
        this.scene = {
            settings: {
                name: name,
                gravity: 1000
            },
            grid: {
                size: 64,
                width: 20,
                height: 12,
                decor: []
            },
            entities: []
        };
    }

    preload() {
        this.resources.images.push(new ImageModel('hero', 'assets/hero.png'));
        this.resources.images.push(new ImageModel('ground', 'assets/bricks.png'));

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

        // Move data
        this.shift = {x: 0, y: 0};
        // Spawn data
        this.entity = null;
        this.distance = 0;
        this.speed = {x: 0, y: 0};
        // AoE data
        this.hitbox = null;
        this.distance = 0;

        this.whileFalling = true;
        this.animType = animationEnum.none;
        this.locked = false;
        this.cooldown = 0;
    }
}

class HitboxModel {
    constructor(name) {
        this.name = name;
        this.width = 0;
        this.height = 0;
        this.hasGravity = false;
        this.bounciness = 0;
        this.damages = 0;
        this.tagsAffected = []; // No tags = everyone
    }
}

class EntityModel {
    constructor(name) {
        this.name = name;
        this.tag = '';
        this.hitboxName = '';
        this.imageName = null;
        this.animationNames = [];
        this.actionNames = [];
        this.PVMax = 1;
        this.isAnimated = false;
        this.hasGravity = false;
        this.isDestructible = false;
    }
    copy(name) {
        const entity = new EntityModel(name);
        entity.tag = this.tag;
        entity.hitboxName = this.hitboxName;
        entity.imageName = this.imageName;
        entity.animationNames = this.animationNames;
        entity.actions = this.actions;
        entity.PVMax = this.PVMax;
        entity.isAnimated = this.isAnimated;
        entity.isDestructible = this.isDestructible;
        return entity;
    }
}

class ImageModel {
    constructor(name, file) {
        this.name = name;
        this.file = file;
    }
    load(game) {
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
    }
    copy(name, time) {
        return new AnimationModel(name, this.type, time, this.count, this.hasOrientation, this.folder, this.images);
    }
    load(game) {
        if (this.hasOrientation) {
            for (let i = 0; i < this.count; i += 1) {
                const left = new ImageModel(this.name + i, this.folder + '/left/' + i + '.png');
                game.load.image(left.name, left.file);
                this.images[i] = left;

                const i2 = i + this.count;
                const right = new ImageModel(this.name + i2, this.folder + '/right/' + i + '.png');
                game.load.image(right.name, right.file);
                this.images[i2] = right;
            }
        }
        else {
            for (let i = 0; i < this.count; i += 1) {
                const image = new ImageModel(this.name + i, this.folder + '/' + i + '.png');
                game.load.image(image.name, image.file);
                this.images[i] = image;
            }
        }
    }
    getImageName(tElapsed, orientation) {
        let i = Math.floor((tElapsed * this.count) / this.time);
        if (this.hasOrientation && orientation === orientationEnum.right > 0) {
            i += this.count;
        }
        return this.images[i].name;
    }
}

// _____________
// Scene objects

class EntityScene {
    constructor(model, position) {
        this.modelName = model.name;
        this.imageName = model.isAnimated
            ? model.animations[animationEnum.idle].getImageName(0, orientationEnum.right)
            : model.imageName;
        this.position = position;
    }
}

class DecorScene {
    constructor(position, imageName, hasBody) {
        this.position = position;
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

const keyEnum = Object.freeze({ // TODO Another way to not bind every key ?
    left:  Symbol('left'),
    right: Symbol('right'),
    up:    Symbol('up'),
    down:  Symbol('down'),
    a:     Symbol('a'),
    z:     Symbol('z'),
    // ...
});

const animationEnum = Object.freeze({
    none:   Symbol('none'),
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

const orientationEnum = Object.freeze({
    left:  Symbol('left'),
    right: Symbol('right'),
});
