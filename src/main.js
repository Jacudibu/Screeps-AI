global.profiler = require('tools.screeps-profiler');

require('defaultmemorysetup');
require('players');
require('portals');

require('clienthacks.clickabletostring');
require('clienthacks.injectloan');
require('clienthacks.steeringwheel');

require('globals.boosttiers');
require('globals.creeptalk');
require('globals.infrastructure');
require('globals.roles');
require('globals.storagelimits');
require('globals.shortcuts');
require('globals.tasks');
require('globals.utility');
require('globals.debugstate');

require('prototypes.container.isnexttosourceormineral');

require('prototypes.controller._');

require('prototypes.creep._');
require('prototypes.creep.classifications');
require('prototypes.creep.getters');
require('prototypes.creep.finders');
require('prototypes.creep.kite');
require('prototypes.creep.memorycache');
require('prototypes.creep.pushandmove');
require('prototypes.creep.respawn');
require('prototypes.creep.tasks');

require('prototypes.lab.requestedmineral');

require('prototypes.mineral.container');

require('prototypes.room._');
require('prototypes.room.basebuilding');
require('prototypes.room.defense');
require('prototypes.room.evacuation');
require('prototypes.room.freeextensions');
require('prototypes.room.labs');
require('prototypes.room.links');
require('prototypes.room.mineral');
require('prototypes.room.remotes');
require('prototypes.room.requestedcreeps');
require('prototypes.room.scoutdata');
require('prototypes.room.sources');
require('prototypes.room.spawnqueue');
require('prototypes.room.structures');
require('prototypes.room.threat');
require('prototypes.room.towerdefense');
require('prototypes.room.update');

require('prototypes.roomobject.drawdebugtext');

require('prototypes.source.assignedworkers');
require('prototypes.source.distancetospawn');
require('prototypes.source.freetilecount');
require('prototypes.source.container');
require('prototypes.source.link');

require('prototypes.spawn.creepspawnmethods');

require('prototypes.structure.canstillstoreenergy');
require('prototypes.structure.cancreepswalkoverthis');

require('prototypes.tower.efficiencycalculation');

const terminalResourceDistribution = require('prototypes.terminal.resourcedistribution');

require('tools.traveler');
require('tools.logger');

const memoryManagment = require('memorymanagment');
const spawnlogic = require('spawnlogic');
const creepAi = require('creepai');
const roomLogic = require('roomlogic');
const labReactionRunner = require('labreactionrunner');

const screepsplus = require('tools.screepsplus');
const warfare = require('warfare._imports');

log.warning("====== Global reset registered ======");
if (!Memory.creepsBuilt) {
    Memory.creepsBuilt = 0;
}

//profiler.enable();

module.exports.loop = function () {
    profiler.wrap(function() {
        memoryManagment.run();
        roomLogic.runBeforeCreeps();
        warfare.run();
        creepAi.run();
        roomLogic.runAfterCreeps();
        spawnlogic.run();

        terminalResourceDistribution.run();
        labReactionRunner.run();

        screepsplus.run();
    });
};