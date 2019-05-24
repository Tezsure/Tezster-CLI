#!/usr/bin/env node
'use strict';

const program = require('commander');

program
.version('0.0.3', '-v, --version')
.command('setup')
.action(function() {
    console.log('setting up tezos node, this could take a while....');
    const { exec } = require('child_process');
    const fs = require("fs");
    let workingDir = __dirname + '/script';
    let setup_successfile_dir = workingDir + '/setup.successful';

    exec('./setup.sh > setup.log',{cwd : workingDir}, (err, stdout, stderr) => {
        if (err) {
            console.error(`tezster setup error: ${err}`);
            return;
        }

        console.log(`${stdout}`);
        if (fs.existsSync(setup_successfile_dir)) {
            console.log('Setup has been completed successfully');
        } else {
            console.log('setup is not successful, please try running "tezster setup" again....');
        }
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
        console.log(`Now you can use below addresses: 
    tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx
    tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN
    tz1faswCTDciRzE4oJ9jn2Vm2dvjeyA9fUzU
    tz1b7tUupMgCNw2cCLpKTkSD1NZzB5TkP2sv
    tz1ddb9NMYHZi5UzPdzTZMYQQZoMub195zgv
    tz1TGu6TN5GSez2ndXXeDX6LgUDvLzPLqgYV`);
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