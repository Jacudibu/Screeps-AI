global.utility = {};

global.utility.getFutureGameTimeWithRandomOffset = function(ticks, offset = 5) {
    return Game.time + ticks + Math.round((Math.random() * offset * 2) - offset);
};

global.utility.getClosestObjectFromArray = function(fromObject, toArray) {
    return toArray
        .reduce((currentlyClosestObject, element) =>
            fromObject.pos.getRangeTo(currentlyClosestObject.pos) < fromObject.pos.getRangeTo(element.pos)
                ? currentlyClosestObject
                : element
        );
};

global.utility.countOwnedMinerals = function() {
    const minerals = {
        [RESOURCE_HYDROGEN]  : 0,
        [RESOURCE_OXYGEN]    : 0,
        [RESOURCE_UTRIUM]    : 0,
        [RESOURCE_LEMERGIUM] : 0,
        [RESOURCE_KEANIUM]   : 0,
        [RESOURCE_ZYNTHIUM]  : 0,
        [RESOURCE_CATALYST]  : 0,
    };

    let total = 0;
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        if (room.controller && room.controller.my) {
            minerals[room.mineral.mineralType]++;
            total++;
        }
    }

    log.info("Total rooms: " + total + JSON.stringify(minerals, null, 2));
};

global.print = (x) => JSON.stringify(x, null, 2);

global.g = {
    c: global.gc = Game.creeps,
    f: global.gf = Game.flags,
    s: global.gs = Game.spawns,
    r: global.gr = Game.rooms,
    m: global.gm = Game.market,
    p: global.gp = Game.profiler,
    t: global.gt = Game.time,
};

global.m = {
    c: global.mc = Memory.creeps,
    r: global.mr = Memory.rooms,
    s: global.ms = Memory.stats,
};