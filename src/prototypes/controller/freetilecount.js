const freeTileCounts = {};
Object.defineProperty(StructureController.prototype, "freeTileCount", {
    get: function() {
        if (freeTileCounts[this.id]) {
            return freeTileCounts[this.id];
        } else {
            return freeTileCounts[this.id] = utility.countFreeTilesAroundRoomObject(this);
        }
    }
});
