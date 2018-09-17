global.utility = {};

global.utility.getFutureTimeWithRandomOffset = function(ticks, offset = 5) {
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