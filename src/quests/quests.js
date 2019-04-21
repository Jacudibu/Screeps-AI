function Quest() {
    this.targetRoom = null;
    this.targetPos = null;
    this.questType = null;
    this.requestedCreepRoles = null;
    this.requestedStrength = null;
    this.assignedParty = null
}

global.QUEST_TYPE = {
    DISMANTLE: 1,
    NUKE: 666,
};

// TODO: Extract to questcache class
if (Memory.quests == null) {
    Memory.quests = [];
}

let allQuests;
const questCache = {
    getAll() {
        if (allQuests == null) {
            allQuests = Memory.quests;
        }

        return allQuests;
    },

    persist() {
        Memory.quests = allQuests;
    }
};

global.Quests = {
    getAll() {
        return questCache.getAll();
    },

    persist() {
        return questCache.persist();
    },
};