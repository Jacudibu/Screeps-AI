global.profiler = require('tools.screeps-profiler');

require('defaultmemorysetup');

require('clienthacks.clickabletostring');
require('clienthacks.injectloan');

require('globals.creeptalk');
require('globals.infrastructure');
require('globals.roles');
require('globals.tasks');
require('globals.utility');
require('globals.storagelimits');

require('prototypes.creep._');
require('prototypes.creep.getters');
require('prototypes.creep.finders');
require('prototypes.creep.kite');
require('prototypes.creep.pushandmove');
require('prototypes.creep.tasks');

require('prototypes.lab.requestedmineral');

require('prototypes.mineral.container');

require('prototypes.room._');
require('prototypes.room.basebuilding');
require('prototypes.room.defense');
require('prototypes.room.freeextensions');
require('prototypes.room.labs');
require('prototypes.room.links');
require('prototypes.room.mineral');
require('prototypes.room.requestedcreeps');
require('prototypes.room.scoutdata');
require('prototypes.room.sources');
require('prototypes.room.structures');
require('prototypes.room.threat');
require('prototypes.room.update');

require('prototypes.source.distancetospawn');
require('prototypes.source.freetilecount');
require('prototypes.source.container');
require('prototypes.source.link');
require('prototypes.source.memory');

require('prototypes.spawn.creepspawnmethods');

require('prototypes.structure.energystorage');

const terminalResourceDistribution = require('prototypes.terminal.resourcedistribution');

require('tools.traveler');
require('tools.logger');

const memoryManagment = require('memorymanagment');
const spawnlogic = require('spawnlogic');
const creepAi = require('creepai');
const roomLogic = require('roomlogic');
const labReactionRunner = require('labreactionrunner');

const screepsplus = require('tools.screepsplus');

profiler.enable();

module.exports.loop = function () {
    profiler.wrap(function() {
        memoryManagment.run();
        roomLogic.runBeforeCreeps();
        creepAi.run();
        roomLogic.runAfterCreeps();
        spawnlogic.run();

        terminalResourceDistribution.run();
        labReactionRunner.run();

        screepsplus.run();
    });
};