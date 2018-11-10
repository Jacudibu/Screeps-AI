const TERMINAL_DISTRIBUTION_CONSTANTS = require("globals.terminallimits");
const TERMINAL_MIN_PRICES             = require("globals.terminalminprices");

const DEAL = true;
const NO_DEAL = false;
const DISTRIBUTION_INTERVAL = 11;
const TRANSACTION_ENERGY_COST_FACTOR = 0.05;
const MIN_DEMAND_AMOUNT = 1500;
const MIN_SUPPLY_AMOUNT = 1500;
const MIN_ENERGY_TO_SUPPLY = 20000;

global.resourceDemand = {};
global.resourceSupply = {};

const terminalResourceDistribution = {
    run() {
        if (Game.time % DISTRIBUTION_INTERVAL !== 4) {
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
        let result = NO_DEAL;

        for (let supplierRoomName of supplyKeys) {
            let currentSupply =  _.shuffle(resourceSupply[supplierRoomName]);

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
                if (supplyData.resourceType !== demandData.resourceType) {
                    continue;
                }

                let amount = demandData.amount - supplyData.amount;
                if (amount < 0) {
                    amount = demandData.amount;
                } else {
                    amount = demandData.amount - amount;
                }

                let result = Game.rooms[supplierRoomName].terminal.send(supplyData.resourceType, amount, demanderRoomName);
                if (result !== OK) {
                    log.warning("Unexpected Error when distributing " + amount + " " + supplyData.resourceType + " from "
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
        return NO_DEAL;
    },

    sellRemainingSupplyOnMarket(terminals) {
        if (resourceSupply.length === 0) {
            // console.log("Skipping marketing entirely, no room has any supply");
            return;
        }

        // log.warning("================================ MARKET ============================");

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
        let orders = Game.market.getAllOrders(
            order => order.type === ORDER_BUY
                  && supplyResourceTypes.includes(order.resourceType)
                  && TERMINAL_MIN_PRICES[order.resourceType]
                  && order.price > TERMINAL_MIN_PRICES[order.resourceType]
        );

        for (const terminal of terminals) {
            if (terminal.cooldown > 0) {
                continue;
            }

            if (!resourceSupply[terminal.room.name]) {
                //console.log(terminal.room + " skipping marketing, no supply");
                continue;
            }

            for (const supplyData of resourceSupply[terminal.room.name]) {
                if (supplyData.amount < TERMINAL_DISTRIBUTION_CONSTANTS.SELL_THRESHOLD_AMOUNT[supplyData.resourceType]) {
                    //console.log(terminal.room + " " +  (-availableResourceAmount) + " below sell threshold for resource: " + supplyData.resourceType);
                    continue;
                }

                const matchingOrders = orders.filter(order => order.resourceType === supplyData.resourceType);

                if (matchingOrders.length === 0) {
                    continue;
                }

                let bestOrderPrice = -9999;
                const bestDeal = matchingOrders.reduce((bestOrder, currentOrder) => {
                    let transactionCostFactor = Game.market.calcTransactionCost(1000, terminal.room.name, currentOrder.roomName) * 0.0001;
                    let price = currentOrder.price - (transactionCostFactor * TRANSACTION_ENERGY_COST_FACTOR);
                    if (price > bestOrderPrice) {
                        bestOrderPrice = price;
                        return currentOrder;
                    } else {
                        return bestOrder;
                    }
                }, null);

                if (!bestDeal) {
                    //console.log(terminal.room + " no deals found for " + supplyData.resourceType);
                    continue;
                }

                let dealAmount;

                if (bestDeal.amount < supplyData.amount) {
                    dealAmount = bestDeal.amount;
                } else {
                    dealAmount = supplyData.amount;
                }

                const result = Game.market.deal(bestDeal.id, dealAmount, terminal.room.name);
                // for debugging
                //console.log(terminal.room.name + " would have sold " + dealAmount + "x" + bestDeal.resourceType + " for " + bestDeal.price + " Credits. OrderID: " + bestDeal.id);
                //const result = OK;
                if (result === OK) {
                    //console.log(terminal.room + " sold " + dealAmount + "x" + bestDeal.resourceType + " for " + bestDeal.price + " Credits. OrderID: " + bestDeal.id);
                    if (dealAmount === bestDeal.amount) {
                        _.remove(orders, bestDeal);
                    } else {
                        bestDeal.amount -= dealAmount;
                    }
                    break;
                } else {
                    //console.log(terminal.room + " tried to sell " + dealAmount + "x" + bestDeal.resourceType + " for " + bestDeal.price + " Credits. OrderID: " + bestDeal.id + ", but failed."
                    //            + "Error: " + result + ", bestDeal.amount: " + bestDeal.amount + " available amount " + availableResourceAmount);
                }
            }
        }

    },
};

StructureTerminal.prototype.calculateDemand = function() {
    if (this.room.shouldEvacuate) {
        return;
    }

    if (this.room.myLabs.length > 2) {
        RESOURCES_ALL.forEach(resource => {
            if (!this.store[resource]) {
                terminalResourceDistribution.addToDemandList(this.room.name, resource, TERMINAL_DISTRIBUTION_CONSTANTS.TERMINAL_MIN_STORE[resource]);
            } else if (this.store[resource] < TERMINAL_DISTRIBUTION_CONSTANTS.TERMINAL_MIN_STORE[resource]) {
                terminalResourceDistribution.addToDemandList(this.room.name, resource, TERMINAL_DISTRIBUTION_CONSTANTS.TERMINAL_MIN_STORE[resource] - this.store[resource]);
            }
        });
    } else {
        // only demand energy
        const resource = RESOURCE_ENERGY;

        if (!this.store[resource]) {
            terminalResourceDistribution.addToDemandList(this.room.name, resource, TERMINAL_DISTRIBUTION_CONSTANTS.TERMINAL_MIN_STORE[resource]);
        } else if (this.store[resource] < TERMINAL_DISTRIBUTION_CONSTANTS.TERMINAL_MIN_STORE[resource]) {
            terminalResourceDistribution.addToDemandList(this.room.name, resource, TERMINAL_DISTRIBUTION_CONSTANTS.TERMINAL_MIN_STORE[resource] - this.store[resource]);
        }
    }
};

StructureTerminal.prototype.calculateSupply = function() {
    if (this.store[RESOURCE_ENERGY] < MIN_ENERGY_TO_SUPPLY) {
        resourceSupply[this.name] = [];
        return;
    }

    if (this.room.shouldEvacuate) {
        RESOURCES_ALL.forEach(resource => {
            if (this.store[resource] && this.store[resource] > 0) {
                terminalResourceDistribution.addToSupplyList(this.room.name, resource, this.store[resource]);
            }
        });
    } else {
        RESOURCES_ALL.forEach(resource => {
            if (this.store[resource] && this.store[resource] > TERMINAL_DISTRIBUTION_CONSTANTS.TERMINAL_MAX_STORE[resource]) {
                terminalResourceDistribution.addToSupplyList(this.room.name, resource, this.store[resource] - TERMINAL_DISTRIBUTION_CONSTANTS.TERMINAL_MAX_STORE[resource]);
            }
        });
    }
};

profiler.registerObject(terminalResourceDistribution, "TerminalResourceDistribution");
module.exports = terminalResourceDistribution;