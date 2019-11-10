"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FetchSelector {
    static setFetch(fetch) {
        this.fetch = fetch;
    }
    static getFetch() {
        return this.fetch;
    }
}
exports.default = FetchSelector;
FetchSelector.fetch = null;
//# sourceMappingURL=FetchSelector.js.map