const {findKeyObj, config, outputError, output} = require("../../tezster-manager");

function formatMoney(n, c, d, t) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

function formatTez(a){
    return formatMoney(a)+" ꜩ";
}

function getBalance(account) {
    var pkh = account, f;
    if (f = findKeyObj(config.identities, pkh)) {
    pkh = f.pkh;
    } else if (f = findKeyObj(config.accounts, pkh)) {
    pkh = f.pkh;
    } else if (f = findKeyObj(config.contracts, pkh)) {
    pkh = f.pkh;
    }
    return eztz.rpc.getBalance(pkh).then(function(r){
        return output(formatTez(r/100));
    }).catch(function(e){
        return outputError(e);
    });
}

module.exports = { getBalance };