
"use strict";

let game = {};

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

class ActionModel {
    constructor(type) {
        this.type = type;
        switch (type) {
            case actionEnum.move:
                this.shift = {x: 0, y: 0};
                break;
            case actionEnum.spawn:
                this.entity = null;
                this.distance = 0;
                this.speed = {x: 0, y: 0};
                break;
            case actionEnum.aoe:
                this.hitbox = null;
                this.distance = 0;
                break;
        }
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

class EntityModel {
    constructor(name) {
        this.name = name;
        this.tag = "";
        this.hitbox = null;
        this.image = null;
        this.animations = {};
        this.actions = [];
        this.PVMax = 1;
        this.isAnimated = false;
        this.hasGravity = false;
        this.isDestructible = false;
    }
    addAnimation(animation) {
        this.animations[animation.type] = animation;
    }
}

class Entity {
    constructor(model) {
        this.sprite = game.add.sprite();
        this.model = model;
        this.position = position;
        this.speed = {x: 0, y: 0};
        this.onGround = false; // Set by game
        if (model.isDestructible) {
            this.PV = model.PVMax;
        }
        if (model.isAnimated) {
            let animModel = model.animation[animationEnum.birth];
            if (!animModel) {
                animModel = model.animation[animationEnum.idle];
            }
            this.animation = new Animation(animModel);
        }
    }
    update(delta) {
        if (this.model.isAnimated) {
            this.animation.update(delta);
            if (this.animation.isFinished) {
                let animModel = this.model.animation[animationEnum.fall];
                if (this.onGround || !this.model.hasGravity) {
                    animModel = (this.speed.x === 0
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

class Image {
    constructor(name, file) {
        this.name = name;
        this.file = file;
    }
    load(game) {
        game.load.image(this.name, this.file);
    }
}

class AnimationModel {
    constructor(type, name, time, count, hasOrientation, folder) {
        this.type = type;
        this.name = name;
        this.time = time;
        this.count = count;
        this.hasOrientation = hasOrientation;
        this.folder = folder;
        this.images = [];
    }
    load(game) {
        if (this.hasOrientation) {
            for (let i = 0; i < this.count; i += 1) {
                const left = new Image(this.name + i, this.folder + "/left/" + i);
                game.load.image(left.name, left.file);
                this.images[i] = left;

                const i2 = i + this.count;
                const right = new Image(this.name + i2, this.folder + "/right/" + i2);
                game.load.image(right.name, right.file);
                this.images[i2] = right;
            }
        }
        else {
            for (let i = 0; i < this.count; i += 1) {
                const image = new Image(this.name + i, this.folder + "/" + i);
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

class JSONLevel {
    constructor(name) {
        this.resources = {
            images: [],
            animations: [],
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
}
