const roomLogic = {
    run() {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            room.update();
        }
    },
};

module.exports = roomLogic;