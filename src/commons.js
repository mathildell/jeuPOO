
"use strict";

// Enums which can be selected in editor

const actionsEnum = Object.freeze({
    moveLeft:  Symbol('moveLeft'),
    moveRight: Symbol('moveRight'),
    jump:      Symbol('jump')
});

const keysEnum = Object.freeze({ // Another way to not bind every key ?
    left:  Symbol('left'),
    right: Symbol('right'),
    up:    Symbol('up'),
    down:  Symbol('down'),
    a:     Symbol('a'),
    z:     Symbol('z'),
    // ...
});

class JSONLevel {

    constructor(name) {
        this.resources = {
                images: [],
                players: []
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
            actors: []
        };
    }
}
