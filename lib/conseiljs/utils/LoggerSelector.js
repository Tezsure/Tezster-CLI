"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LoggerSelector {
    static setLogger(log) {
        this.log = log;
    }
    static getLogger() {
        return this.log;
    }
    static setLevel(level) {
        this.log.setLevel(level, false);
    }
}
exports.default = LoggerSelector;
LoggerSelector.log = null;
//# sourceMappingURL=LoggerSelector.js.map