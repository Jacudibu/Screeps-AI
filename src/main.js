global.profiler = require('tools.screeps-profiler');

require('constants.globalvariables');

require('prototypes.creep');
require('prototypes.creep.getters');
require('prototypes.creep.finders');
require('prototypes.creep.tasks');
require('prototypes.mineral.container');
require('prototypes.room');
require('prototypes.room.labs');
require('prototypes.room.mineral');
require('prototypes.room.sources');
require('prototypes.room.structures');
require('prototypes.room.update');
require('prototypes.source');
require('prototypes.spawn');
require('prototypes.structure');
require('prototypes.structurelab.requestedmineral');

const terminalResourceDistribution = require('prototypes.terminal.resourcedistribution');

require('tools.traveler');

const memoryManagment = require('memorymanagment');
const spawnlogic = require('spawnlogic');
const creepAi = require('creepai');
const roomLogic = require('roomlogic');

const screepsplus = require('tools.screepsplus');

profiler.enable();

module.exports.loop = function () {
    profiler.wrap(function() {
        memoryManagment.run();
        creepAi.run();
        roomLogic.run();
        spawnlogic.run();

        terminalResourceDistribution.run();

        screepsplus.run();
    });
};