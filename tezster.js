#!/usr/bin/env node
'use strict';

const program = require('commander');

program
.version('0.0.1', '-v, --version')
.command('setup')
.action(function() {
    console.log('setting up tezos node, this could take a while....');
    const { exec } = require('child_process');

    exec('./setup.sh',{cwd : './script'}, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
    });
});

program
.command('start-node')
.action(function() {
    console.log('starting the nodes.....');
    const { exec } = require('child_process');

    exec('./start_nodes.sh',{cwd : './script'}, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
    });
});

program
.command('stop-node')
.action(function() {
    console.log('stopping the nodes....');
    const { exec } = require('child_process');

    exec('./stop_nodes.sh',{cwd : './script'}, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
    });
});

program.parse(process.argv);