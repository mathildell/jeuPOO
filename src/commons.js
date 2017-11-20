
'use strict';

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

// *Model and *Scene classes reference other *Model or *Scene objects with string, for serialisation


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
                this.entity.position.x += this.model.shift.x;
                this.entity.position.y += this.model.shift.y;
                break;
            case actionEnum.spawn:

                break;
            case actionEnum.aoe:

                break;
        }
    }
}

class HitboxModel {
    constructor(name) {
        this.name = name;
        this.width = 0;
        this.height = 0;
        this.damages = 0;
        this.tagsAffected = {}; // No tags = everyone
        this.isSolid = true;
    }
}

// An entity model created in the editor
class EntityModel {
    constructor(name) {
        this.name = name;
        this.tag = '';
        this.hitboxName = '';
        this.imageName = null;
        this.animationNames = [];
        this.actions = [];
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
        entity.hasGravity = this.hasGravity;
        entity.isDestructible = this.isDestructible;
        return entity;
    }
}

// An entity placed in the editor scene
class EntityScene {
    constructor(model, position) {
        this.modelName = model.name;
        this.image = model.isAnimated
            ? model.animations[animationEnum.idle].getImageName(0, orientationEnum.right)
            : model.image.name;
        this.position = position;
    }
}

// An entity in game
// It's updated by it's sprite and by the update function
// The sprite passed must have scene settings (gravity, ...)
class Entity {
    constructor(level, sceneModel, sprite) { // TODO Set sprite image & hitbox
        this.level = level;
        this.sprite = sprite;
        this.model = level.resources.entities.find(m => m.name === sceneModel.modelName);
        this.sprite.position.x = sceneModel.position.x;
        this.sprite.position.y = sceneModel.position.y;
        this.sprite.speed.x = 0;
        this.sprite.speed.y = 0;

        if (this.model.hitbox) {
            this.sprite.body.width = this.model.hitbox.width;
            this.sprite.body.height = this.model.hitbox.height;
        }
        if (this.model.isDestructible) {
            this.PV = this.model.PVMax;
        }
        if (this.model.isAnimated) {
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
        }
    }
    update(delta) {
        if (this.model.isAnimated) {
            this.animation.update(delta);
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

class DecorScene {
    constructor(position, imageName, hasBody) {
        this.position = position;
        this.imageName = imageName;
        this.hasBody = hasBody;
    }
}

// A simple representation of an image
class ImageModel {
    constructor(name, file) {
        this.name = name;
        this.file = file;
    }
    load(game) {
        game.load.image(this.name, this.file);
        window.alert(this.name + '<' + this.file + '> charged');
    }
}

// An animation proposed in the editor
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

// An animation in game
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

// The object containing all informations on a level
class JSONLevel {
    constructor(name) {
        this.resources = {
            images: [],
            animations: [],
            actions: [],
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
