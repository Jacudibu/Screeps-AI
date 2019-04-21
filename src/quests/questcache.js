if (Memory.quests == null) {
    Memory.quests = [];
}

let allQuests = Memory.quests;
const questCache = {
    getAll() {
        return allQuests;
    },

    persist() {
        Memory.quests = allQuests;
    }
};

module.exports = questCache;