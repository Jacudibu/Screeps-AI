const reserver = {
    run(creep) {
        switch (creep.memory.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                creep.room.updateScoutData();

                if (creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES).length > 0) {
                    creep.setTask(TASK.STOMP_HOSTILE_CONSTRUCTION_SITES);
                    break;
                }

                this.continueScouting(creep);
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
                break;

            case TASK.STOMP_HOSTILE_CONSTRUCTION_SITES:
                if (roomThreats[creep.room.name]) {
                    creep.say(creepTalk.flee3);
                    this.continueScouting(creep);
                    break;
                }

                const result = creep.stompHostileConstructionSites();
                if (result === ERR_NOT_FOUND) {
                    this.continueScouting(creep);
                    break;
                }
                break;

            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                break;
        }
    },

    continueScouting(creep) {
        creep.selectNextRoomToScout();
        creep.setTask(TASK.MOVE_TO_ROOM);
        creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
    }
};

module.exports = reserver;