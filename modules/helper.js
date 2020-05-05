const confFile = __dirname + '/../config.json';
const jsonfile = require('jsonfile');
var config = jsonfile.readFileSync(confFile);
const Logger = require('./logger');

class Helper {
    
    static formatMoney(n, c, d, t) {
        var c = isNaN(c = Math.abs(c)) ? 6 : c, 
            d = d == undefined ? '.' : d, 
            t = t == undefined ? ',' : t, 
            s = n < 0 ? '-' : '', 
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
            j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
    }

    static formatTez(a){
        return this.formatMoney(a/1000000)+' ꜩ';
    }

    static findKeyObj(list, t){
        for (var i = 0; i < list.length; i++){
            if (list[i].pkh == t || list[i].label == t){
                return list[i];
            }
        }
        return false;
    }

    static confirmNodeProvider(tezosNode) {
        return tezosNode.includes('localhost');
    }

    static errorLogHandler(redirctErrorLogsToFile, displayErrorLogsToConsole) {
        Logger.verbose(`${redirctErrorLogsToFile}`);
        Logger.error(`${displayErrorLogsToConsole}`);
    }

    static clearContractAndAccountForLocalNode() {
        for(var i=0;i<config.contracts.length;i++) {
            if(config.contracts[i].identity.includes('localnode')) {
                config.contracts.splice(i, 1);
            }
        }
        for(var i=0;i<config.accounts.length;i++) {
            if(config.accounts[i].label.includes('localnode') && !config.accounts[i].label.match(/bootstrap[1-5]/)) {
                config.accounts.splice(i, 1);
                config.identities.splice(i, 1);
            }
        }
        jsonfile.writeFile(confFile, config);
    }

}

module.exports = { Helper }