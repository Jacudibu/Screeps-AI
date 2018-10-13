"use strict";
// Module to format data in memory for use with the https://screepspl.us
// Grafana utility run by ags131.

let lastGlobalReset = Game.time;

function run() {
    // Screepsplus agent only fetches data once every 15 seconds, so no need to do this every tick
    if (Game.time % 4 !== 0) {
        return;
    }

    Memory.stats = collectStats();
}

function collectStats() {
    const stats = {};

    stats.gcl = Game.gcl;
    stats.credits = Game.market.credits;
    stats.tick = Game.time;
    stats.lastGlobalReset = lastGlobalReset;
    stats.cpu = Game.cpu;

    stats.market = {
        num_orders: Game.market.orders ? Object.keys(Game.market.orders).length : 0,
    };

    stats.rooms = collectRoomStats();
    stats.roomNumbers = countRooms();

    stats.creeps = {};
    stats.creeps.total = Memory.creepsBuilt;
    stats.creeps.current = Object.keys(Game.creeps).length;

    stats.terminalResourceNetwork = calculateTerminalResourceNetwork();
    stats.heapStatistics = Game.cpu.getHeapStatistics();

    stats.cpu.used = Game.cpu.getUsed();

    stats.memory = {
        used: RawMemory.get().length,
    };

    return stats;
}

function collectRoomStats() {
    const roomStats = {};
    _.forEach(Object.keys(Game.rooms), function(roomName) {
        let room = Game.rooms[roomName];

        if(room.controller && room.controller.my){
            roomStats[roomName] = {};

            roomStats[roomName].rcl = {};

            roomStats[roomName].rcl.level = room.controller.level;
            roomStats[roomName].rcl.progress = room.controller.progress;
            roomStats[roomName].rcl.progressTotal = room.controller.progressTotal;

            roomStats[roomName].energyAvailable = room.energyAvailable;
            roomStats[roomName].energyCapacityAvailable = room.energyCapacityAvailable;

            if(room.storage) {
                roomStats[roomName].storage = room.storage.store;
            }

            if (room.terminal) {
                roomStats[roomName].terminal = room.terminal.store;
            }
        }
    });

    return roomStats;
}

function countRooms() {
    let roomNumbers = {
        claimed: 0,
        reserved: 0,
        total: 0,
    };

    for (const roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        if (room.controller) {
            if (room.controller.my) {
                roomNumbers.claimed++;
            } else if (room.controller.reservation) {
                if (room.controller.reservation.username === 'Jacudibu') {
                    roomNumbers.reserved++;
                }
            }
        }
        roomNumbers.total++;
    }
    return roomNumbers;
}

function calculateTerminalResourceNetwork() {
    if (Object.keys(resourceDemand).length === 0 && Object.keys(resourceSupply).length === 0) {
        return;
    }

    const terminalNetwork = {};

    for (const resourceName of RESOURCES_ALL) {
        terminalNetwork[resourceName] = 0;
    }

    for (const roomName in resourceDemand) {
        for (const element of resourceDemand[roomName]) {
            terminalNetwork[element.resourceType] -= element.amount;
        }
    }

    for (const roomName in resourceSupply) {
        for (const element of resourceSupply[roomName]) {
            terminalNetwork[element.resourceType] += element.amount;
        }
    }

    return terminalNetwork;
}

module.exports = {
    run: run,
};