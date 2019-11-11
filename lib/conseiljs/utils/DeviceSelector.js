"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeviceSelector {
    static setLedgerUtils(ledger) {
        this.ledgerUtils = ledger;
    }
    static getLedgerUtils() {
        return this.ledgerUtils;
    }
}
exports.default = DeviceSelector;
DeviceSelector.ledgerUtils = null;
//# sourceMappingURL=DeviceSelector.js.map