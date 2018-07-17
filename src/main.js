require('./constants');

const memoryManagment = require('memorymanagment');
const spawnlogic = require('spawnlogic');
const creepAi = require('creepai');

module.exports.loop = function () {
    memoryManagment.run();
    spawnlogic.run();
    creepAi.run();
};