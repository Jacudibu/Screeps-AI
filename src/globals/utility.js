global.getFutureTimeWithRandomOffset = function(ticks, offset = 5) {
    return Game.time + ticks + Math.round((Math.random() * offset * 2) - offset);
};