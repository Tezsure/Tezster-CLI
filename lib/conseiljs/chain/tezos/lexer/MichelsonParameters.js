"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function id(d) { return d[0]; }
const moo = require("moo");
const lexer = moo.compile({
    ws: /[ \t]+/,
    lparen: '(',
    rparen: ')',
    lbrace: '{',
    rbrace: '}',
    keyword: ['Unit', 'True', 'False', 'None'],
    singleArgData: ['Left', 'Right', 'Some'],
    doubleArgData: ['Pair'],
    number: /-?[0-9]+/,
    string: /\"[^"]+\"/
});
const singleArgDataToJson = d => { return `{ "prim": "${d[0]}", "args": [ ${d[2]} ] }`; };
const singleArgDataWithParenToJson = d => { return `{ "prim": "${d[2]}", "args": [ ${d[4]} ] }`; };
const doubleArgDataToJson = d => { return `{ "prim": "${d[0]}", "args": [ ${d[2]}, ${d[4]} ] }`; };
const doubleArgDataWithParenToJson = d => { return `{ "prim": "${d[2]}", "args": [ ${d[4]}, ${d[6]} ] }`; };
const intToJson = d => { return `{ "int": "${parseInt(d[0])}" }`; };
const stringToJson = d => { return `{ "string": ${d[0]} }`; };
const keywordToJson = d => { return `{ "prim": "${d[0]}" }`; };
;
;
;
exports.Lexer = lexer;
exports.ParserRules = [
    { "name": "data", "symbols": [(lexer.has("keyword") ? { type: "keyword" } : keyword)], "postprocess": keywordToJson },
    { "name": "data", "symbols": [(lexer.has("string") ? { type: "string" } : string)], "postprocess": stringToJson },
    { "name": "data", "symbols": [(lexer.has("lbrace") ? { type: "lbrace" } : lbrace), "_", (lexer.has("rbrace") ? { type: "rbrace" } : rbrace)], "postprocess": d => "[]" },
    { "name": "data", "symbols": [(lexer.has("number") ? { type: "number" } : number)], "postprocess": intToJson },
    { "name": "data", "symbols": [(lexer.has("singleArgData") ? { type: "singleArgData" } : singleArgData), "_", "data"], "postprocess": singleArgDataToJson },
    { "name": "data", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("singleArgData") ? { type: "singleArgData" } : singleArgData), "_", "data", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": singleArgDataWithParenToJson },
    { "name": "data", "symbols": [(lexer.has("doubleArgData") ? { type: "doubleArgData" } : doubleArgData), "_", "data", "_", "data"], "postprocess": doubleArgDataToJson },
    { "name": "data", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("doubleArgData") ? { type: "doubleArgData" } : doubleArgData), "_", "data", "_", "data", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": doubleArgDataWithParenToJson },
    { "name": "_$ebnf$1", "symbols": [] },
    { "name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]]) },
    { "name": "_", "symbols": ["_$ebnf$1"] }
];
exports.ParserStart = "data";
//# sourceMappingURL=MichelsonParameters.js.map