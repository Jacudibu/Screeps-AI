const TERMINAL_DISTRIBUTION_CONSTANTS = require('constants.terminaldistributionconstants');
const DEAL = true;
const NO_DEAL = false;
const DISTRIBUTION_INTERVAL = 50;

const terminalResourceDistribution = {
    resourceSupply: {},
    resourceDemand: {},

    run: function() {
        if (Game.time % DISTRIBUTION_INTERVAL !== 0) {
            return;
        }

        let terminals = [];

        this.resourceSupply = {};
        this.resourceDemand = {};

        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            if (room.terminal && room.terminal.my && room.terminal.cooldown === 0) {
                terminals.push(room.terminal);
            }
        }

        terminals.forEach(terminal => {
            terminal.calculateDemand();
            terminal.calculateSupply();
        });

        this.matchSupplyAndDemand();
    },

    addToDemandList: function(roomName, resourceType, amount) {
        if (amount < TERMINAL_MIN_SEND) {
            return;
        }

        if (!this.resourceDemand[roomName]) {
            this.resourceDemand[roomName] = [];
        }

        this.resourceDemand[roomName].push({
            resourceType: resourceType,
            amount: amount,
        });
    },

    addToSupplyList: function(roomName, resourceType, amount) {
        if (amount < TERMINAL_MIN_SEND) {
            return;
        }

        if (!this.resourceSupply[roomName]) {
            this.resourceSupply[roomName] = [];
        }

        this.resourceSupply[roomName].push({
            resourceType: resourceType,
            amount: amount,
        });
    },

    matchSupplyAndDemand: function() {
        let supplyKeys = Object.keys(this.resourceSupply);
        let demandKeys = Object.keys(this.resourceDemand);

        for (let supplierRoomName of supplyKeys) {
            let currentSupply = this.resourceSupply[supplierRoomName];

            let result = NO_DEAL;
            for (let demanderRoomName of demandKeys) {
                let currentDemand = this.resourceDemand[demanderRoomName];

                result = this.makeDeal(supplierRoomName, currentSupply, demanderRoomName, currentDemand);
                if (result === DEAL) {
                    break;
                }
            }
        }
    },

    makeDeal: function(supplierRoomName, supply, demanderRoomName, demand) {
        for (let supplyData of supply) {
            for (let demandData of demand) {
                if (supplyData.resourceType === demandData.resourceType) {
                    let amount = demandData.amount - supplyData.amount;
                    if (amount < 0) {
                        amount = demandData.amount;
                    } else {
                        amount = demandData.amount - amount;
                    }

                    let result = Game.rooms[supplierRoomName].terminal.send(supplyData.resourceType, amount, demanderRoomName);
                    if (result !== OK) {
                        console.log("Unexpected Error when distributing " + amount + " " + supplyData.resourceType + " from "
                            + supplierRoomName + " to " + demanderRoomName + ": " + result);
                    }

                    return DEAL;
                }
            }
        }
        return NO_DEAL;
    },

};

profiler.registerObject(terminalResourceDistribution, "terminalResourceDistribution");

StructureTerminal.prototype.calculateDemand = function() {
    RESOURCES_ALL.forEach(resource => {
        if (!this.store[resource]) {
            terminalResourceDistribution.addToDemandList(this.room.name, resource, TERMINAL_DISTRIBUTION_CONSTANTS.MIN_STORAGE[resource]);
        } else if (this.store[resource] < TERMINAL_DISTRIBUTION_CONSTANTS.MIN_STORAGE[resource]) {
            terminalResourceDistribution.addToDemandList(this.room.name, resource, TERMINAL_DISTRIBUTION_CONSTANTS.MIN_STORAGE[resource] - this.store[resource]);
        }
    });
};

StructureTerminal.prototype.calculateSupply = function() {
    RESOURCES_ALL.forEach(resource => {
        if (this.store[resource] && this.store[resource] > TERMINAL_DISTRIBUTION_CONSTANTS.MAX_STORAGE[resource]) {
            terminalResourceDistribution.addToSupplyList(this.room.name, resource, this.store[resource] - TERMINAL_DISTRIBUTION_CONSTANTS.MAX_STORAGE[resource]);
        }
    });
};

module.exports = terminalResourceDistribution;