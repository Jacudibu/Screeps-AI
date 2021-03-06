"use strict";

// Callback is a class (use with new) that stores functions to call
// back later, and they're called with a specified object.
// Taken from https://github.com/LispEngineer/screeps/blob/master/callback.js

function Callback() {
    this.handlers = [];  // observers
}

Callback.prototype = {

    subscribe: function(fn) {
        this.handlers.push(fn);
    },

    unsubscribe: function(fn) {
        this.handlers = this.handlers.filter(
            function(item) {
                if (item !== fn) {
                    return item;
                }
            }
        );
    },

    fire: function(o, thisObj) {
        // TODO: Put error handling around the call?
        this.handlers.forEach(function(item) {
            try {
                item.call(thisObj, o);
            } catch (err) {
                log.warning('Ignored error calling back ', item.name, 'with', o, '-', err);
            }
        });
    }
};

module.exports = {
    Callback
};