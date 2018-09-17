global.profiler = require('tools.screeps-profiler');

require('clienthacks.clickabletostring');
require('clienthacks.injectloan');

require('globals.creeptalk');
require('globals.infrastructure');
require('globals.roles');
require('globals.tasks');
require('globals.utility');

require('prototypes.creep');
require('prototypes.creep.getters');
require('prototypes.creep.finders');
require('prototypes.creep.tasks');
require('prototypes.mineral.container');
require('prototypes.room');
require('prototypes.room.freeextensions');
require('prototypes.room.labs');
require('prototypes.room.links');
require('prototypes.room.mineral');
require('prototypes.room.sources');
require('prototypes.room.structures');
require('prototypes.room.update');
require('prototypes.source');
require('prototypes.source.container');
require('prototypes.source.link');
require('prototypes.spawn');
require('prototypes.structure');
require('prototypes.structurelab.requestedmineral');

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
        creepAi.run();
        roomLogic.run();
        spawnlogic.run();

        terminalResourceDistribution.run();
        labReactionRunner.run();

        screepsplus.run();
    });
};