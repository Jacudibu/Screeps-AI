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