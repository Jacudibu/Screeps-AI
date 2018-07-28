require('./constants');
require('./prototypes_creep');
require('./prototypes_creeptasks');
require('./prototypes_structure');
require('./prototypes_source');
require('./prototypes_spawn');
require('./prototypes_room');

const memoryManagment = require('memorymanagment');
const spawnlogic = require('spawnlogic');
const creepAi = require('creepai');
const roomLogic = require('roomlogic');

const profiler = require('tools_screeps-profiler');
profiler.enable();

module.exports.loop = function () {
//    profiler.wrap(function() {
        memoryManagment.run();
        creepAi.run();
        roomLogic.run();
        spawnlogic.run();
//    });
};