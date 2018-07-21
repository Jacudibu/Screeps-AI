require('./constants');
require('./prototypes_creep');
require('./prototypes_creeptasks');
require('./prototypes_structure');
require('./prototypes_source');
require('./prototypes_room');

const memoryManagment = require('memorymanagment');
const spawnlogic = require('spawnlogic');
const creepAi = require('creepai');
const roomLogic = require('roomlogic');

module.exports.loop = function () {
    memoryManagment.run();
    spawnlogic.run();
    creepAi.run();
    roomLogic.run();
};