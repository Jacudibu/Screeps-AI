const TERMINAL_DISTRIBUTION_CONSTANTS = require('globals.terminaldistributionconstants');
const DEAL = true;
const NO_DEAL = false;
const DISTRIBUTION_INTERVAL = 17;
const TRANSACTION_ENERGY_COST_FACTOR = 0.05;
const MIN_DEMAND_AMOUNT = 1500;
const MIN_SUPPLY_AMOUNT = 1500;

global.resourceDemand = {};
global.resourceSupply = {};

const terminalResourceDistribution = {
    run() {
        if (Game.time % DISTRIBUTION_INTERVAL !== 0) {
            return;
        }

        let terminals = [];

        global.resourceSupply = {};
        global.resourceDemand = {};

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
        this.sellRemainingSupplyOnMarket(terminals);
    },

    addToDemandList(roomName, resourceType, amount) {
        if (amount < MIN_DEMAND_AMOUNT) {
            return;
        }

        if (!resourceDemand[roomName]) {
            resourceDemand[roomName] = [];
        }

        resourceDemand[roomName].push({
            resourceType: resourceType,
            amount: amount,
        });
    },

    addToSupplyList(roomName, resourceType, amount) {
        if (amount < MIN_SUPPLY_AMOUNT) {
            return;
        }

        if (!resourceSupply[roomName]) {
            resourceSupply[roomName] = [];
        }

        resourceSupply[roomName].push({
            resourceType: resourceType,
            amount: amount,
        });
    },

    matchSupplyAndDemand() {
        let supplyKeys = _.shuffle(Object.keys(resourceSupply));
        let demandKeys = _.shuffle(Object.keys(resourceDemand));

        for (let supplierRoomName of supplyKeys) {
            let currentSupply = resourceSupply[supplierRoomName];

            let result = NO_DEAL;
            for (let demanderRoomName of demandKeys) {
                let currentDemand = resourceDemand[demanderRoomName];

                result = this.makeInternalTransactions(supplierRoomName, currentSupply, demanderRoomName, currentDemand);
                if (result === DEAL) {
                    break;
                }
            }
        }
    },

    makeInternalTransactions(supplierRoomName, supply, demanderRoomName, demand) {
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

                        return NO_DEAL;
                    }

                    // store changes due to this transaction
                    supplyData.amount -= amount;
                    if (supplyData.amount - MIN_SUPPLY_AMOUNT <= 0) {
                        _.remove(supply, data => data.resourceType === supplyData.resourceType);
                    }
                    demandData.amount -= amount;
                    if (demandData.amount - MIN_DEMAND_AMOUNT <= 0) {
                        _.remove(demand, data => data.resourceType === demandData.resourceType);
                    }

                    return DEAL;
                }
            }
        }
        return NO_DEAL;
    },

    sellRemainingSupplyOnMarket(terminals) {
        if (resourceSupply.length === 0) {
            return;
        }

        let supplyResourceTypes = [];

        for (const terminal of terminals) {
            if (terminal.cooldown > 0) {
                continue;
            }

            if (!resourceSupply[terminal.room.name]) {
                continue;
            }

            // Get all supplied resources so that we can initially filter all orders
            for (const supplyData of resourceSupply[terminal.room.name]) {
                if (!supplyResourceTypes.includes(supplyData.resourceType)) {
                    if (TERMINAL_DISTRIBUTION_CONSTANTS.AUTOSELL_RESOURCES.includes(supplyData.resourceType)) {
                        supplyResourceTypes.push(supplyData.resourceType);
                    }
                }
            }
        }

        // initially filter orders
        const orders = Game.market.getAllOrders(order => order.type === ORDER_BUY && supplyResourceTypes.includes(order.resourceType));

        for (const terminal of terminals) {
            if (terminal.cooldown > 0) {
                continue;
            }

            if (!resourceSupply[terminal.room.name]) {
                continue;
            }

            for (const supplyData of resourceSupply[terminal.room.name]) {
                if (supplyData.amount < TERMINAL_DISTRIBUTION_CONSTANTS.SELL_THRESHOLD[supplyData.resourceType]) {
                    continue;
                }

                const matchingOrders = orders.filter(order => order.resourceType === supplyData.resourceType);

                const bestDeal = _.sortBy(matchingOrders, order => {
                    let transactionCostFactor = Game.market.calcTransactionCost(1000, terminal.room.name, order.roomName) * 0.0001;
                    let price = order.price;

                    return price - (transactionCostFactor * TRANSACTION_ENERGY_COST_FACTOR);
                })[matchingOrders.length - 1];

                if (!bestDeal) {
                    continue;
                }

                let amount = bestDeal.remainingAmount - supplyData.amount;
                if (amount < 0) {
                    amount = bestDeal.remainingAmount;
                } else {
                    amount = bestDeal.remainingAmount - amount;
                }

                let result = Game.market.deal(bestDeal.id, amount, terminal.room.name);
                // for debugging
                // console.log(terminal.room.name + " would have sold " + amount + "x" + bestDeal.resourceType + " for " + bestDeal.price + " Credits. OrderID: " + bestDeal.id);
                // result = OK;
                if (result === OK) {
                    // console.log(terminal.room.name + " sold " + amount + "x" + bestDeal.resourceType + " for " + bestDeal.price + " Credits. OrderID: " + bestDeal.id);
                    _.remove(orders, bestDeal);
                    break;
                }
            }
        }

    },
};

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

profiler.registerObject(terminalResourceDistribution, "TerminalResourceDistribution");
module.exports = terminalResourceDistribution;