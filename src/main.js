require('./constants');
require('./prototypes.creep');
require('./prototypes.creepgetters');
require('./prototypes.creepfinders');
require('./prototypes.creeptasks');
require('./prototypes.structure');
require('./prototypes.source');
require('./prototypes.spawn');
require('./prototypes.room');
require('./prototypes.room.structure.properties');

const memoryManagment = require('memorymanagment');
const spawnlogic = require('spawnlogic');
const creepAi = require('creepai');
const roomLogic = require('roomlogic');
const traveler = require('tools.traveler');

const profiler = require('tools.screeps-profiler');
profiler.enable();

module.exports.loop = function () {
    profiler.wrap(function() {
        memoryManagment.run();
        creepAi.run();
        roomLogic.run();
        spawnlogic.run();
    });
};