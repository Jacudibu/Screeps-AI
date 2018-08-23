"use strict";
// Module to format data in memory for use with the https://screepspl.us
// Grafana utility run by ags131.
// taken from https://github.com/LispEngineer/screeps/blob/master/screepsplus.js

let lastGlobalReset;
const callback = require('tools.callback');

global.statsCallback = new callback.Callback();

function run() {
    collectStats();
    global.statsCallback.fire(Memory.stats);
    Memory.stats.cpu.used = Game.cpu.getUsed();
}

// Update the Memory.stats with useful information for trend analysis and graphing.
// Also calls all registered stats callback functions before returning.
function collectStats() {
    if (Memory.stats == null) {
        Memory.stats = {};
    }

    if (!lastGlobalReset) {
        console.log("Global reset registered!");
        lastGlobalReset = Game.time;
        Memory.stats.lastGlobalReset = lastGlobalReset;
    }

    Memory.stats.tick = Game.time;

    Memory.stats.cpu = Game.cpu;
    Memory.stats.gcl = Game.gcl;

    const memory_used = RawMemory.get().length;
    Memory.stats.memory = {
        used: memory_used,
    };

    Memory.stats.market = {
        credits: Game.market.credits,
        num_orders: Game.market.orders ? Object.keys(Game.market.orders).length : 0,
    };
}

module.exports = {
    run: run,
};