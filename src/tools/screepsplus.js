"use strict";
// Module to format data in memory for use with the https://screepspl.us
// Grafana utility run by ags131.

let lastGlobalReset;

function run() {
    collectStats();
    Memory.stats.cpu.used = Game.cpu.getUsed();
}

function collectStats() {
    if (Memory.stats == null) {
        Memory.stats = {};
    }

    if (!lastGlobalReset) {
        log.info("Global reset registered!");
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

    Memory.stats.rooms = {};
    _.forEach(Object.keys(Game.rooms), function(roomName){
        let room = Game.rooms[roomName];

        if(room.controller && room.controller.my){
            Memory.stats.rooms[roomName] = {};

            Memory.stats.rooms[roomName].rcl = {};

            Memory.stats.rooms[roomName].rcl.level = room.controller.level;
            Memory.stats.rooms[roomName].rcl.progress = room.controller.progress;
            Memory.stats.rooms[roomName].rcl.progressTotal = room.controller.progressTotal;

            Memory.stats.rooms[roomName].energyAvailable = room.energyAvailable;
            Memory.stats.rooms[roomName].energyCapacityAvailable = room.energyCapacityAvailable;

            if(room.storage){
                Memory.stats.rooms[roomName].storage = {};
                Memory.stats.rooms[roomName].storage.energy = room.storage.store.energy;
            }
        }
    });

    Memory.stats.creeps = {};
    Memory.stats.creeps.total = Memory.creepsBuilt;
    Memory.stats.creeps.current = Object.keys(Game.creeps).length
}

module.exports = {
    run: run,
};