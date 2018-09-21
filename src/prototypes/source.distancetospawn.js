const distanceToSpawns = {};
Object.defineProperty(Source.prototype, "distanceToSpawn", {
    get: function() {
        if (distanceToSpawns[this.id]) {
            return distanceToSpawns[this.id];
        } else {
            return distanceToSpawns[this.id] = this._calculateDistanceToSpawn();
        }
    }
});

Source.prototype._calculateDistanceToSpawn = function() {
    if (this.room.spawns.length === 0) {
        log.warning(this.room + "Distance to spawn was called, but there is no spawn in room!");
        return;
    }

    const travelPath = Traveler.findTravelPath(this, this.room.spawns[0]);
    return travelPath.path.length;
};