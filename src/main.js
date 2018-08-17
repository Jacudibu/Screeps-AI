require('./constants');
require('./prototypes_creep');
require('./prototypes_creepgetters');
require('./prototypes_creepfinders');
require('./prototypes_creeptasks');
require('./prototypes_structure');
require('./prototypes_source');
require('./prototypes_spawn');
require('./prototypes_room');
require('./prototypes_room.structure_properties');

const memoryManagment = require('memorymanagment');
const spawnlogic = require('spawnlogic');
const creepAi = require('creepai');
const roomLogic = require('roomlogic');
const traveler = require('tools_traveler');

const profiler = require('tools_screeps-profiler');
profiler.enable();

module.exports.loop = function () {
    profiler.wrap(function() {
        memoryManagment.run();
        creepAi.run();
        roomLogic.run();
        spawnlogic.run();
    });
};