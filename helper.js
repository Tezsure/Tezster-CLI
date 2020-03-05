const cliColors = {
    red : '31m',
    yellow : '33m',
    cyan : '36m',
    white : '37m',
    green : '32m',
};

class Helper{

outputError(e){
    return '\x1b['+cliColors.red+'Error: '+e.toString().replace('Error:','')+'\x1b[0m';
}

outputInfo(e){
    return '\x1b['+cliColors.yellow+e+'\x1b[0m';
}

output(e){
    return '\x1b['+cliColors.green+e+'\x1b[0m';
}

formatMoney(n, c, d, t) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

formatTez(a){
    return this.formatMoney(a)+" ꜩ";
}

findKeyObj(list, t){
    for (var i = 0; i < list.length; i++){
      if (list[i].pkh == t || list[i].label == t) return list[i];
    }
    return false;
}

}

module.exports = { Helper }