const { confFile, WIN_OS_PLATFORM, WIN_WSL_OS_RELEASE } = require('./cli-constants'),
      os = require('os'),
      Logger = require('./logger'),
      jsonfile = require('jsonfile'),
      crypto = require('crypto');

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

    static isWindows(){
        return os.platform().includes(WIN_OS_PLATFORM);
    }

    static isWSL(){
        return os.release().includes(WIN_WSL_OS_RELEASE);
    }

    static isLocalNode(tezosNode){
        return tezosNode.includes('localhost') || tezosNode.includes('192.168');
    }

    static isTestnetNode(tezosNode) {
        return tezosNode.includes('localhost') || tezosNode.includes('mainnet');
    }

    static isFlorenceNode(tezosNode) {
        return tezosNode.includes('flor');
    }

    static isMainnetNode(tezosNode) {
        return tezosNode.includes('mainnet');
    }

    static errorLogHandler(redirctErrorLogsToFile, displayErrorLogsToConsole) {
        Logger.verbose(`${redirctErrorLogsToFile}`);
        Logger.error(`${displayErrorLogsToConsole}`);
    }

    static clearContractAndAccountForLocalNode() {   
        const config = jsonfile.readFileSync(confFile);
        let contractObjectIndex , accountObjectIndex;
        for (contractObjectIndex=0; contractObjectIndex<config.contracts.length; contractObjectIndex++) {
            if(config.contracts[contractObjectIndex].identity.includes('localnode')) {
                config.contracts.splice(contractObjectIndex, 1);
                contractObjectIndex--;
            }
        }

        for (accountObjectIndex=0; accountObjectIndex<config.accounts.length; accountObjectIndex++) {
            if(config.accounts[accountObjectIndex].label.includes('localnode') 
                && !config.accounts[accountObjectIndex].label.match(/bootstrap[1-5]/)) {
                    config.accounts.splice(accountObjectIndex, 1);
                    config.identities.splice(accountObjectIndex, 1);
                    accountObjectIndex--;
            }
        }
        jsonfile.writeFile(confFile, config);
    }

    static encrypt(data) {
        const config = jsonfile.readFileSync(confFile);
        const IV = config.EncryptionIv;

        const cipher = crypto.createCipheriv(
          'aes-256-ctr',
          'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3',
          Buffer.from(IV, 'hex')
        );
        let crypted = cipher.update(data, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    static decrypt(encryptedData) {
        const config = jsonfile.readFileSync(confFile);
        const IV = config.EncryptionIv;

        const decipher = crypto.createDecipheriv(
            'aes-256-ctr',
            'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3',
            Buffer.from(IV, 'hex')
        );
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

}

module.exports = { Helper }