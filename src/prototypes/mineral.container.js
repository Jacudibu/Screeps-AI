Mineral.prototype.getContainerPosition = function() {
    let containers = this.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER });

    if (containers.length === 0) {
        return ERR_NOT_FOUND;
    }

    let container = containers[0];

    return container.pos;
};