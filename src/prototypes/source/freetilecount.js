const freeTileCounts = {};
Object.defineProperty(Source.prototype, "freeTileCount", {
    get: function() {
        if (freeTileCounts[this.id]) {
            return freeTileCounts[this.id];
        } else {
            return freeTileCounts[this.id] = this._countFreeTilesAroundSource();
        }
    }
});

Source.prototype._countFreeTilesAroundSource = function() {
    const terrain = this.room.getTerrain();
    let freeTileCount = 0;
    [this.pos.x - 1, this.pos.x, this.pos.x + 1].forEach(x => {
        [this.pos.y - 1, this.pos.y, this.pos.y + 1].forEach(y => {
            if (terrain.get(x, y) !== TERRAIN_MASK_WALL)
                freeTileCount++;
        }, this);
    }, this);

    return freeTileCount;
};