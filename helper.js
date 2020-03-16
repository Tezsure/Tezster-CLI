const { Variables } = require('./utils/cli-variables');

class Helper{

    static outputError(e){
        return '\x1b['+Variables.cliColors.red+'Error: '+e.toString().replace('Error:','')+'\x1b[0m';
    }

    static outputInfo(e){
        return '\x1b['+Variables.cliColors.yellow+e+'\x1b[0m';
    }

    static output(e){
        return '\x1b['+Variables.cliColors.green+e+'\x1b[0m';
    }

    static formatMoney(n, c, d, t) {
        var c = isNaN(c = Math.abs(c)) ? 2 : c, 
        d = d == undefined ? "." : d, 
        t = t == undefined ? "," : t, 
        s = n < 0 ? "-" : "", 
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
        j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    }

    static formatTez(a){
        return this.formatMoney(a)+" ꜩ";
    }

    static findKeyObj(list, t){
        for (var i = 0; i < list.length; i++){
        if (list[i].pkh == t || list[i].label == t) return list[i];
        }
        return false;
    }

}

module.exports = { Helper }