const roomLogic = {
    run: function () {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            room.update();
        }
    },
};

module.exports = roomLogic;