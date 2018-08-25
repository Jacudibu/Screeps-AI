require('./constants');
require('./prototypes.creep');
require('./prototypes.creep.getters');
require('./prototypes.creep.finders');
require('./prototypes.creep.tasks');
require('./prototypes.structure');
require('./prototypes.source');
require('./prototypes.spawn');
require('./prototypes.room');
require('./prototypes.room.mineral');
require('./prototypes.room.sources');
require('./prototypes.room.structures');

require('tools.traveler');


const memoryManagment = require('memorymanagment');
const spawnlogic = require('spawnlogic');
const creepAi = require('creepai');
const roomLogic = require('roomlogic');

const profiler = require('tools.screeps-profiler');
const screepsplus = require('tools.screepsplus');
profiler.enable();

module.exports.loop = function () {
    profiler.wrap(function() {
        memoryManagment.run();
        creepAi.run();
        roomLogic.run();
        spawnlogic.run();

        screepsplus.run();
    });
};