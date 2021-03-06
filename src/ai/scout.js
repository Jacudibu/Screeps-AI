const reserver = {
    run(creep) {
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                creep.room.updateScoutData();

                if (creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES).length > 0) {
                    creep.setTask(TASK.STOMP_HOSTILE_CONSTRUCTION_SITES);
                    break;
                }

                this.continueScouting(creep);
                break;

            case TASK.MOVE_TO_ROOM:
                creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO, {preferHighway: true, offRoad: true});
                break;

            case TASK.STOMP_HOSTILE_CONSTRUCTION_SITES:

                if (roomThreats[creep.room.name] && roomThreats[creep.room.name].canHarmCreeps) {
                    creep.say(creepTalk.flee3);
                    this.continueScouting(creep);
                    break;
                }

                if (creep.room.controller && creep.room.controller.safeMode) {
                    creep.say(creepTalk.scoutInSafeModeRoom);
                    this.continueScouting(creep);
                    break;
                }

                const result = creep.stompHostileConstructionSites();
                if (result === ERR_NOT_FOUND) {
                    this.continueScouting(creep);
                    break;
                }
                break;

            case TASK.DISABLE_ATTACK_NOTIFICATION:
                creep.notifyWhenAttacked(false);

                creep.task = creep.targetRoomName ? TASK.MOVE_TO_ROOM : TASK.DECIDE_WHAT_TO_DO;
                this.run(creep);
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