const roleWorker = require('roles_worker');

const creepAi = {

    run: function() {
        for (let name in Game.creeps) {
            let creep = Game.creeps[name];
            if (creep.memory.role === 'worker') {
                roleWorker.run(creep);
            }
        }
    }
};

module.exports = creepAi;