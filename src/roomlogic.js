const roomLogic = {
    runBeforeCreeps() {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            this.tryEarlyUpdateRoom(room);
        }
    },

    runAfterCreeps() {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            this.tryLateUpdateRoom(room);
        }
    },

    tryEarlyUpdateRoom(room) {
        try {
            room.updateBeforeCreeps();
        } catch (e) {
            let message = room + " Update -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    },

    tryLateUpdateRoom(room) {
        try {
            room.updateAfterCreeps();
        } catch (e) {
            let message = room + " Update -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    },
};

profiler.registerObject(roomLogic, "RoomLogic");
module.exports = roomLogic;