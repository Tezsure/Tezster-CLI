#!/usr/bin/env node
'use strict';

const program = require('commander');

program
.version('0.0.3', '-v, --version')
.command('setup')
.action(function() {
    console.log('setting up tezos node, this could take a while....');
    const { exec } = require('child_process');
    let workingDir = __dirname + '/script';
    exec('./setup.sh > setup.log',{cwd : workingDir}, (err, stdout, stderr) => {
        if (err) {
            console.error(`tezster setup error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
    });
});

program
.command('start-nodes')
.action(function() {
    console.log('starting the nodes.....');
    const { exec } = require('child_process');
    let workingDir = __dirname + '/script';
    exec('./start_nodes.sh',{cwd : workingDir}, (err, stdout, stderr) => {
        if (err) {
            console.error(`tezster starting nodes error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
    });
});

program
.command('stop-nodes')
.action(function() {
    console.log('stopping the nodes....');
    const { exec } = require('child_process');
    let workingDir = __dirname + '/script';

    exec('./stop_nodes.sh ',{cwd : workingDir}, (err, stdout, stderr) => {
        if (err) {
            console.error(`tezster stopping nodes error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
    });
});

program.parse(process.argv);