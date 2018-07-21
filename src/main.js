require('./constants');
require('./prototypes_creep');
require('./prototypes_creeptasks');
require('./prototypes_structure');
require('./prototypes_source');

const memoryManagment = require('memorymanagment');
const spawnlogic = require('spawnlogic');
const creepAi = require('creepai');
const towerDefense = require('towerdefense');

module.exports.loop = function () {
    memoryManagment.run();
    spawnlogic.run();
    creepAi.run();
    towerDefense.run();
};