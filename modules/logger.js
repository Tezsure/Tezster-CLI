const winston = require('winston');
const { format } = require('winston');

let silent;
const options = {
    console: {
        level : 'info',
        silent,
        handleExceptions: true,
        format: format.combine(
            format.colorize(),
            format.splat(),
            format.printf(
              info => `${info.message}`,
            ),
        ),
    },
    file: {
        filename: '/tmp/tezster-logs/tezster-command-logs.log',
        level : 'verbose',
        silent,
        handleExceptions: true,
        format: format.combine(
            format.colorize(),
            format.splat(),
            format.printf(
              info => `${new Date().toISOString()}  [Message : ${info.message}]`,
            ),
        ),
    },
};

const Logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.Console( options.console ),
    new winston.transports.File( options.file )
  ],
});

module.exports = Logger;
