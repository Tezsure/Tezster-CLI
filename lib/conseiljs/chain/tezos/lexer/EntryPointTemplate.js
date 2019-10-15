"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function id(d) { return d[0]; }
const moo = require("moo");
const lexer = moo.compile({
    wspace: /[ \t]+/,
    lparen: '(',
    rparen: ')',
    annot: /:[^ );]+|%[^ );]+/,
    parameter: 'parameter',
    or: 'or',
    pair: 'pair',
    data: ['bytes', 'int', 'nat', 'bool', 'string', 'timestamp', 'signature', 'key', 'key_hash', 'mutez', 'address', 'unit', 'operation'],
    singleArgData: ['option', 'list', 'contract'],
    doubleArgData: ['lambda', 'map', 'big_map'],
    semicolon: ';'
});
const breakParameter = (d) => { return d[2]; };
const stripParen = (d) => d[2];
const branchOrWithTwoAnnot = (d) => {
    const annotA = d[2];
    const annotB = d[4];
    const leftEntryPoints = d[6];
    const rightEntryPoints = d[8];
    const branchedEntryPoints = [];
    console.log(`branchOrWithTwoAnnot found ${annotA}, ${annotB}`);
    for (const leftEntryPoint of leftEntryPoints) {
        const branchedEntryPoint = {
            name: leftEntryPoint.name,
            parameters: leftEntryPoint.parameters,
            structure: '(Left ' + leftEntryPoint.structure + ')',
            generateParameter: leftEntryPoint.generateParameter
        };
        branchedEntryPoints.push(branchedEntryPoint);
    }
    for (const rightEntryPoint of rightEntryPoints) {
        const branchedEntryPoint = {
            name: rightEntryPoint.name,
            parameters: rightEntryPoint.parameters,
            structure: '(Right ' + rightEntryPoint.structure + ')',
            generateParameter: rightEntryPoint.generateParameter
        };
        branchedEntryPoints.push(branchedEntryPoint);
    }
    return branchedEntryPoints;
};
const branchOrWithAnnot = (d) => {
    const annot = d[2];
    const leftEntryPoints = d[4];
    const rightEntryPoints = d[6];
    const branchedEntryPoints = [];
    console.log(`branchOrWithAnnot found ${annot}`);
    for (const leftEntryPoint of leftEntryPoints) {
        const branchedEntryPoint = {
            name: `${annot}.${leftEntryPoint.name}`,
            parameters: leftEntryPoint.parameters,
            structure: '(Left ' + leftEntryPoint.structure + ')',
            generateParameter: leftEntryPoint.generateParameter
        };
        branchedEntryPoints.push(branchedEntryPoint);
    }
    for (const rightEntryPoint of rightEntryPoints) {
        const branchedEntryPoint = {
            name: `${annot}.${rightEntryPoint.name}`,
            parameters: rightEntryPoint.parameters,
            structure: '(Right ' + rightEntryPoint.structure + ')',
            generateParameter: rightEntryPoint.generateParameter
        };
        branchedEntryPoints.push(branchedEntryPoint);
    }
    return branchedEntryPoints;
};
const branchOr = (d) => {
    const leftEntryPoints = d[2];
    const rightEntryPoints = d[4];
    const branchedEntryPoints = [];
    for (const leftEntryPoint of leftEntryPoints) {
        const branchedEntryPoint = {
            name: leftEntryPoint.name,
            parameters: leftEntryPoint.parameters,
            structure: '(Left ' + leftEntryPoint.structure + ')',
            generateParameter: leftEntryPoint.generateParameter
        };
        branchedEntryPoints.push(branchedEntryPoint);
    }
    for (const rightEntryPoint of rightEntryPoints) {
        const branchedEntryPoint = {
            name: rightEntryPoint.name,
            parameters: rightEntryPoint.parameters,
            structure: '(Right ' + rightEntryPoint.structure + ')',
            generateParameter: rightEntryPoint.generateParameter
        };
        branchedEntryPoints.push(branchedEntryPoint);
    }
    return branchedEntryPoints;
};
const mergePairWithTwoAnnot = (d) => {
    const annotA = d[2];
    const annotB = d[4];
    const firstEntryPoints = d[6];
    const secondEntryPoints = d[8];
    const pairedEntryPoints = [];
    console.log(`mergePairWithTwoAnnot found ${annotA}, ${annotB}`);
    for (const firstEntryPoint of firstEntryPoints) {
        for (const secondEntryPoint of secondEntryPoints) {
            const pairedEntryPoint = {
                name: annotA.toString(),
                parameters: firstEntryPoint.parameters.concat(secondEntryPoint.parameters),
                structure: `(Pair ${firstEntryPoint.structure} ${secondEntryPoint.structure})`,
                generateParameter: firstEntryPoint.generateParameter
            };
            pairedEntryPoints.push(pairedEntryPoint);
        }
    }
    return pairedEntryPoints;
};
const mergePairWithAnnot = (d) => {
    const annot = d[2];
    const firstEntryPoints = d[4];
    const secondEntryPoints = d[6];
    const pairedEntryPoints = [];
    console.log(`mergePairWithAnnot found ${annot}`);
    for (const firstEntryPoint of firstEntryPoints) {
        for (const secondEntryPoint of secondEntryPoints) {
            const pairedEntryPoint = {
                name: annot.toString(),
                parameters: firstEntryPoint.parameters.concat(secondEntryPoint.parameters),
                structure: `(Pair ${firstEntryPoint.structure} ${secondEntryPoint.structure})`,
                generateParameter: firstEntryPoint.generateParameter
            };
            pairedEntryPoints.push(pairedEntryPoint);
        }
    }
    return pairedEntryPoints;
};
const mergePair = (d) => {
    const firstEntryPoints = d[2];
    const secondEntryPoints = d[4];
    const pairedEntryPoints = [];
    for (const firstEntryPoint of firstEntryPoints) {
        for (const secondEntryPoint of secondEntryPoints) {
            let pairedEntryPointName = undefined;
            if (firstEntryPoint.name != undefined) {
                pairedEntryPointName = firstEntryPoint.name;
            }
            else if (secondEntryPoint.name != undefined) {
                pairedEntryPointName = secondEntryPoint.name;
            }
            const pairedEntryPoint = {
                name: pairedEntryPointName,
                parameters: firstEntryPoint.parameters.concat(secondEntryPoint.parameters),
                structure: `(Pair ${firstEntryPoint.structure} ${secondEntryPoint.structure})`,
                generateParameter: firstEntryPoint.generateParameter
            };
            pairedEntryPoints.push(pairedEntryPoint);
        }
    }
    return pairedEntryPoints;
};
const recordSingleArgDataWithTwoAnnot = (d) => {
    const singleArgData = d[0].toString();
    const annotA = d[2].toString();
    const annotB = d[4].toString();
    const entryPoints = d[6];
    console.log(`recordSingleArgDataWithTwoAnnot found ${annotA}, ${annotB}`);
    entryPoints[0].parameters[0].type = `${singleArgData} (${entryPoints[0].parameters[0].type})`;
    entryPoints[0].structure = `(${entryPoints[0].structure})`;
    return entryPoints;
};
const recordSingleArgDataWithAnnot = (d) => {
    const singleArgData = d[0].toString();
    const annot = d[2].toString();
    const entryPoints = d[4];
    console.log(`recordSingleArgDataWithAnnot found ${annot}`);
    entryPoints[0].parameters[0].name = annot;
    entryPoints[0].parameters[0].type = `${singleArgData} (${entryPoints[0].parameters[0].type})`;
    entryPoints[0].structure = `(${entryPoints[0].structure})`;
    return entryPoints;
};
const recordSingleArgData = (d) => {
    const singleArgData = d[0].toString();
    const entryPoints = d[2];
    entryPoints[0].parameters[0].type = `${singleArgData} (${entryPoints[0].parameters[0].type})`;
    entryPoints[0].structure = `(${entryPoints[0].structure})`;
    return entryPoints;
};
const recordDoubleArgDataWithTwoAnnot = (d) => {
    const doubleArgData = d[0].toString();
    const annotA = d[2].toString();
    const annotB = d[4].toString();
    const firstEntryPoints = d[6];
    const secondEntryPoints = d[8];
    console.log(`recordDoubleArgDataWithTwoAnnot found ${annotA}, ${annotB}`);
    firstEntryPoints[0].parameters[0].type = `${doubleArgData} (${firstEntryPoints[0].parameters[0].type}) (${secondEntryPoints[0].parameters[0].type})`;
    firstEntryPoints[0].structure = `(${firstEntryPoints[0].structure})`;
    return firstEntryPoints;
};
const recordDoubleArgDataWithAnnot = (d) => {
    const doubleArgData = d[0].toString();
    const annot = d[2].toString();
    const firstEntryPoints = d[4];
    const secondEntryPoints = d[6];
    console.log(`recordDoubleArgDataWithAnnot found ${annot}`);
    firstEntryPoints[0].parameters[0].name = annot;
    firstEntryPoints[0].parameters[0].type = `${doubleArgData} (${firstEntryPoints[0].parameters[0].type}) (${secondEntryPoints[0].parameters[0].type})`;
    firstEntryPoints[0].structure = `(${firstEntryPoints[0].structure})`;
    return firstEntryPoints;
};
const recordDoubleArgData = (d) => {
    const doubleArgData = d[0].toString();
    const firstEntryPoints = d[2];
    const secondEntryPoints = d[4];
    firstEntryPoints[0].parameters[0].type = `${doubleArgData} (${firstEntryPoints[0].parameters[0].type}) (${secondEntryPoints[0].parameters[0].type})`;
    firstEntryPoints[0].structure = `(${firstEntryPoints[0].structure})`;
    return firstEntryPoints;
};
const recordData = (d) => {
    let parameterName = undefined;
    let entryPointName = undefined;
    if (d.length >= 3) {
        const annot = d[2].toString();
        if (annot.charAt(0) === '%') {
            entryPointName = formatFieldAnnotation(annot);
        }
        else {
            parameterName = formatTypeAnnotation(annot);
        }
    }
    if (d.length === 5) {
        const anotherAnnot = d[4].toString();
        if (anotherAnnot.startsWith('%') && entryPointName === undefined) {
            entryPointName = formatFieldAnnotation(anotherAnnot);
        }
        if (anotherAnnot.startsWith(':') && parameterName === undefined) {
            parameterName = formatTypeAnnotation(anotherAnnot);
        }
    }
    const parameter = {
        name: parameterName,
        type: d[0].toString()
    };
    const entryPoint = {
        name: entryPointName,
        parameters: [parameter],
        structure: '$PARAM',
        generateParameter(...vars) {
            if (this.parameters.length !== vars.length) {
                throw new Error(`Incorrect number of parameters provided; expected ${this.parameters.length}, got ${vars.length}`);
            }
            let invocationParameter = this.structure;
            for (let i = 0; i < this.parameters.length; i++) {
                invocationParameter = invocationParameter.replace('$PARAM', vars[i]);
            }
            return invocationParameter;
        }
    };
    return [entryPoint];
};
const getFieldAnnotation = (...annot) => {
    const fa = annot.find(a => a.startsWith('%'));
    if (!!fa) {
        return formatFieldAnnotation(fa);
    }
    return undefined;
};
const getTypeAnnotation = (...annot) => {
    const ta = annot.find(a => a.startsWith(':'));
    if (!!ta) {
        return formatTypeAnnotation(ta);
    }
    return undefined;
};
const formatFieldAnnotation = (annot) => {
    if (!annot.startsWith('%')) {
        throw new Error(`${annot} must start with '%'`);
    }
    let name = annot.replace(/^%_Liq_entry_/, '').replace('%', '');
    return name.charAt(0).toUpperCase() + name.slice(1);
};
const formatTypeAnnotation = (annot) => {
    if (!annot.startsWith(':')) {
        throw new Error(`${annot} must start with ':'`);
    }
    let name = annot.replace(':', '');
    return name.charAt(0).toUpperCase() + name.slice(1);
};
;
;
;
exports.Lexer = lexer;
exports.ParserRules = [
    { "name": "entry", "symbols": [(lexer.has("parameter") ? { type: "parameter" } : parameter), "__", "parameters", "_", (lexer.has("semicolon") ? { type: "semicolon" } : semicolon)], "postprocess": breakParameter },
    { "name": "parameters", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", "parameters", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": stripParen },
    { "name": "parameters", "symbols": [(lexer.has("or") ? { type: "or" } : or), "_", (lexer.has("annot") ? { type: "annot" } : annot), "__", (lexer.has("annot") ? { type: "annot" } : annot), "__", "parameters", "__", "parameters"], "postprocess": branchOrWithTwoAnnot },
    { "name": "parameters", "symbols": [(lexer.has("or") ? { type: "or" } : or), "_", (lexer.has("annot") ? { type: "annot" } : annot), "__", "parameters", "__", "parameters"], "postprocess": branchOrWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("or") ? { type: "or" } : or), "_", "parameters", "__", "parameters"], "postprocess": branchOr },
    { "name": "parameters", "symbols": [(lexer.has("pair") ? { type: "pair" } : pair), "__", (lexer.has("annot") ? { type: "annot" } : annot), "__", (lexer.has("annot") ? { type: "annot" } : annot), "__", "parameters", "__", "parameters"], "postprocess": mergePairWithTwoAnnot },
    { "name": "parameters", "symbols": [(lexer.has("pair") ? { type: "pair" } : pair), "__", (lexer.has("annot") ? { type: "annot" } : annot), "__", "parameters", "__", "parameters"], "postprocess": mergePairWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("pair") ? { type: "pair" } : pair), "__", "parameters", "__", "parameters"], "postprocess": mergePair },
    { "name": "parameters", "symbols": [(lexer.has("singleArgData") ? { type: "singleArgData" } : singleArgData), "_", (lexer.has("annot") ? { type: "annot" } : annot), "__", (lexer.has("annot") ? { type: "annot" } : annot), "__", "parameters"], "postprocess": recordSingleArgDataWithTwoAnnot },
    { "name": "parameters", "symbols": [(lexer.has("singleArgData") ? { type: "singleArgData" } : singleArgData), "_", (lexer.has("annot") ? { type: "annot" } : annot), "__", "parameters"], "postprocess": recordSingleArgDataWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("singleArgData") ? { type: "singleArgData" } : singleArgData), "_", "parameters"], "postprocess": recordSingleArgData },
    { "name": "parameters", "symbols": [(lexer.has("doubleArgData") ? { type: "doubleArgData" } : doubleArgData), "_", (lexer.has("annot") ? { type: "annot" } : annot), "__", (lexer.has("annot") ? { type: "annot" } : annot), "__", "parameters", "__", "parameters"], "postprocess": recordDoubleArgDataWithTwoAnnot },
    { "name": "parameters", "symbols": [(lexer.has("doubleArgData") ? { type: "doubleArgData" } : doubleArgData), "_", (lexer.has("annot") ? { type: "annot" } : annot), "__", "parameters", "__", "parameters"], "postprocess": recordDoubleArgDataWithAnnot },
    { "name": "parameters", "symbols": [(lexer.has("doubleArgData") ? { type: "doubleArgData" } : doubleArgData), "_", "parameters", "__", "parameters"], "postprocess": recordDoubleArgData },
    { "name": "parameters", "symbols": [(lexer.has("data") ? { type: "data" } : data), "__", (lexer.has("annot") ? { type: "annot" } : annot)], "postprocess": recordData },
    { "name": "parameters", "symbols": [(lexer.has("data") ? { type: "data" } : data), "__", (lexer.has("annot") ? { type: "annot" } : annot), "__", (lexer.has("annot") ? { type: "annot" } : annot)], "postprocess": recordData },
    { "name": "parameters", "symbols": [(lexer.has("data") ? { type: "data" } : data)], "postprocess": recordData },
    { "name": "_$ebnf$1", "symbols": [] },
    { "name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]]) },
    { "name": "_", "symbols": ["_$ebnf$1"] },
    { "name": "__", "symbols": [/[\s]/] }
];
exports.ParserStart = "entry";
//# sourceMappingURL=EntryPointTemplate.js.map