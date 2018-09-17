const roomLogic = {
    run() {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            this.tryUpdateRoom(room);
        }
    },

    tryUpdateRoom(room) {
        try {
            room.update();
        } catch (e) {
            let message = room + " Update -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    }
};

profiler.registerObject(roomLogic, "RoomLogic");
module.exports = roomLogic;