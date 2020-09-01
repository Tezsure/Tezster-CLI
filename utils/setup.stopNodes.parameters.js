const chalk = require('chalk');
const setupStopNodesParameters = [
    {
        type: 'confirm',
        name: 'response',
        message: `${chalk.yellow('Stopping local nodes will remove existing activated accounts and deployed contracts on local node.')}\n  Please continue, if you agree: `,
        default: false
    }
];
  
module.exports = { setupStopNodesParameters }