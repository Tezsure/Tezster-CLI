#!/usr/bin/env node
'use strict';

const program = require('commander');

program
.version('0.0.1', '-v, --version')
.parse(process.argv);